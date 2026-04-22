from __future__ import annotations

import os
from datetime import datetime

from fastapi import Depends, HTTPException, Request, status

from . import models
from .database import SessionLocal
from .dependencies import get_current_user


RISK_THRESHOLD = int(os.getenv("ZERO_TRUST_RISK_THRESHOLD", "70"))
BLOCKED_COUNTRIES = {
    c.strip().upper()
    for c in os.getenv("ZERO_TRUST_BLOCKED_COUNTRIES", "").split(",")
    if c.strip()
}
GEOLITE2_DB_PATH = os.getenv("GEOLITE2_DB_PATH", "").strip()


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _geo_country(ip: str) -> str | None:
    """
    Optional GeoIP lookup. If geoip2+db are not configured, returns None.
    """
    if not GEOLITE2_DB_PATH:
        return None
    try:
        import geoip2.database  # type: ignore

        reader = geoip2.database.Reader(GEOLITE2_DB_PATH)
        resp = reader.city(ip)
        return resp.country.iso_code
    except Exception:
        return None


def zero_trust_guard(
    request: Request,
    current_user: models.User = Depends(get_current_user),
):
    """
    Zero-trust guard for privileged endpoints.
    - Re-checks account status in a fresh DB session
    - Validates device binding and IP drift
    - Applies risk threshold and optional geo-blocking
    """
    ip = _client_ip(request)
    device_id = (request.headers.get("X-Device-ID") or "").strip()

    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        if getattr(user, "is_deleted", False) or not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

        if getattr(user, "is_frozen", False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account frozen")

        # Optional geo blocking
        if BLOCKED_COUNTRIES:
            country = _geo_country(ip)
            if country and country.upper() in BLOCKED_COUNTRIES:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Blocked region: {country}")

        # IP drift adds risk
        if user.last_ip and ip != "unknown" and user.last_ip != ip:
            user.risk_score = min((user.risk_score or 0) + 10, 100)
        user.last_ip = ip if ip != "unknown" else user.last_ip

        # Device binding (admins should provide X-Device-ID)
        if user.is_admin:
            if not device_id:
                user.risk_score = min((user.risk_score or 0) + 15, 100)
            else:
                known = (
                    db.query(models.UserDevice)
                    .filter(models.UserDevice.user_id == user.id, models.UserDevice.device_id == device_id)
                    .first()
                )
                if not known:
                    # For main admin, auto-enroll the device to avoid lockout.
                    if getattr(user, "is_super_admin", False):
                        db.add(
                            models.UserDevice(
                                user_id=user.id,
                                device_id=device_id,
                                device_name=request.headers.get("x-device-name")
                                or (request.headers.get("user-agent") or "")[:250]
                                or None,
                                user_agent=request.headers.get("user-agent"),
                                first_ip=ip,
                                last_ip=ip,
                                last_active=datetime.utcnow(),
                            )
                        )
                    else:
                        user.risk_score = min((user.risk_score or 0) + 15, 100)

        # Enforce risk threshold
        if user.is_admin and not getattr(user, "is_super_admin", False) and (user.risk_score or 0) >= RISK_THRESHOLD:
            user.is_frozen = True
            db.commit()
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="High risk account blocked")

        db.commit()
        return True
    finally:
        db.close()
