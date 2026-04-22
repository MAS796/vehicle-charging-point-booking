from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models
from ..dependencies import get_current_super_admin, get_db
from ..zero_trust import zero_trust_guard

router = APIRouter(prefix="/soc", tags=["SOC"])


@router.get("/summary")
def soc_summary(
    _admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=24)

    high_risk_admins = (
        db.query(func.count(models.User.id))
        .filter(models.User.is_admin.is_(True), models.User.risk_score >= 60)
        .scalar()
        or 0
    )
    frozen_accounts = (
        db.query(func.count(models.User.id))
        .filter(models.User.is_frozen.is_(True))
        .scalar()
        or 0
    )
    deleted_accounts = (
        db.query(func.count(models.User.id))
        .filter(models.User.is_deleted.is_(True))
        .scalar()
        or 0
    )

    active_sessions_24h = (
        db.query(func.count(models.UserSession.id))
        .filter(models.UserSession.last_active >= since)
        .scalar()
        or 0
    )

    security_alerts_24h = (
        db.query(func.count(models.AuditLog.id))
        .filter(models.AuditLog.timestamp >= since, models.AuditLog.action == "SUSPICIOUS_BEHAVIOR_DETECTED")
        .scalar()
        or 0
    )

    top_ips = (
        db.query(models.AuditLog.ip_address, func.count(models.AuditLog.id).label("c"))
        .filter(models.AuditLog.timestamp >= since)
        .group_by(models.AuditLog.ip_address)
        .order_by(func.count(models.AuditLog.id).desc())
        .limit(5)
        .all()
    )

    return {
        "high_risk_admin_accounts": int(high_risk_admins),
        "frozen_accounts": int(frozen_accounts),
        "deleted_accounts": int(deleted_accounts),
        "active_sessions_last_24h": int(active_sessions_24h),
        "security_alerts_last_24h": int(security_alerts_24h),
        "top_ips_last_24h": [
            {"ip": ip or "unknown", "count": int(count)} for ip, count in top_ips
        ],
    }

