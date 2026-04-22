from datetime import datetime, timedelta
import base64
import secrets
import json
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from .. import models
from ..database import SessionLocal
from ..dependencies import get_current_admin, get_current_user, require_admin_permission
from ..email_service import is_email_configured, send_otp_email, send_security_alert_email
from ..config import settings
from ..rate_limiter import limiter
from ..schemas import (
    GoogleLoginRequest,
    LanguageUpdateRequest,
    OTPRequest,
    OTPVerify,
    RefreshTokenRequest,
    SetPasswordRequest,
    TwoFactorVerifyRequest,
    UserLogin,
)
from ..security import create_access_token, decode_token
from ..services.auth_service import get_user_by_email, get_user_by_id, hash_password, verify_password
from ..services.otp_service import generate_otp, get_otp_expiry, is_otp_expired
from ..services.translation_service import translate
from ..utils.datetime_utils import utc_now

router = APIRouter(tags=["Auth"])

REFRESH_TOKEN_EXPIRE_DAYS = 7


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _user_role(user: models.User) -> str:
    return "admin" if user.is_admin else (user.role or "user")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _should_expose_test_otp(request: Request) -> bool:
    if settings.ENVIRONMENT == "production" or not settings.ENABLE_TEST_OTP_EXPOSURE:
        return False
    return request.headers.get("X-Test-Mode", "").strip() == "1"


def _register_session(
    *,
    db: Session,
    user_id: int,
    refresh_token: str,
    request: Request,
    device_name: str | None = None,
):
    db.add(
        models.UserSession(
            user_id=user_id,
            refresh_token=refresh_token,
            device_name=device_name or request.headers.get("x-device-name") or "Unknown device",
            ip_address=_client_ip(request),
            user_agent=request.headers.get("user-agent"),
            last_active=utc_now(),
        )
    )


def _issue_tokens(user: models.User, request: Request, db: Session) -> dict:
    role = _user_role(user)
    access_token = create_access_token(
        {
            "sub": user.email,
            "id": user.id,
            "role": role,
        }
    )

    # Register/bind device for zero-trust checks (admins must send X-Device-ID).
    device_id = (request.headers.get("X-Device-ID") or "").strip()
    if device_id:
        ip = _client_ip(request)
        ua = request.headers.get("user-agent")
        device_name = (request.headers.get("x-device-name") or "").strip() or None
        existing = (
            db.query(models.UserDevice)
            .filter(models.UserDevice.user_id == user.id, models.UserDevice.device_id == device_id)
            .first()
        )
        if not existing:
            db.add(
                models.UserDevice(
                    user_id=user.id,
                    device_id=device_id,
                    device_name=(device_name or (ua[:250] if ua else None)),
                    user_agent=ua,
                    first_ip=ip,
                    last_ip=ip,
                    last_active=utc_now(),
                )
            )
        else:
            existing.last_ip = ip
            existing.last_active = utc_now()
            if ua:
                existing.user_agent = ua
            if device_name and not existing.device_name:
                existing.device_name = device_name

    refresh_token = secrets.token_hex(64)
    refresh_expiry = utc_now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(
        models.RefreshToken(
            user_id=user.id,
            token=refresh_token,
            device_info=request.headers.get("user-agent", "unknown"),
            expires_at=refresh_expiry,
        )
    )
    _register_session(db=db, user_id=user.id, refresh_token=refresh_token, request=request)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": role,
        "name": user.name,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "is_admin": user.is_admin,
            "is_super_admin": user.is_super_admin,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "role": role,
            "preferred_language": user.preferred_language,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
    }


@router.post("/register")
@router.post("/register/request-otp")
@router.post("/request-otp")
async def request_otp(data: OTPRequest, request: Request, db: Session = Depends(get_db)):
    lang = request.headers.get("X-Language", "en")

    existing_user = get_user_by_email(db, data.email)
    if existing_user and existing_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=translate("user_exists_login", lang),
        )

    # Replace old pending OTP entries for this email
    db.query(models.OTPCode).filter(models.OTPCode.email == data.email).delete()

    otp = generate_otp()
    otp_entry = models.OTPCode(
        email=data.email,
        name=data.name,
        phone=data.phone,
        otp_code=otp,
        purpose="registration",
        expires_at=get_otp_expiry(),
    )
    db.add(otp_entry)

    # Backward compatibility for old flow that stored OTP on user row
    if existing_user:
        existing_user.name = data.name
        existing_user.phone = data.phone
        existing_user.otp = otp
        existing_user.otp_expires_at = otp_entry.expires_at

    db.commit()

    email_sent = await send_otp_email(data.email, otp)
    if not email_sent:
        print(f"[DEV] OTP for {data.email}: {otp}")

    # Test-only override guarded by both configuration and an explicit request header.
    expose_dev_otp = _should_expose_test_otp(request)

    return {
        "message": translate("otp_sent", lang),
        "email": data.email,
        "success": True,
        "email_sent": email_sent,
        "dev_otp": otp if expose_dev_otp else None,
    }


@router.post("/verify-otp")
@router.post("/register/verify-otp")
def verify_otp(data: OTPVerify, request: Request, db: Session = Depends(get_db)):
    lang = request.headers.get("X-Language", "en")

    otp_entry = (
        db.query(models.OTPCode)
        .filter(models.OTPCode.email == data.email, models.OTPCode.purpose == "registration")
        .order_by(models.OTPCode.created_at.desc())
        .first()
    )

    if not otp_entry or otp_entry.otp_code != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=translate("invalid_otp", lang),
        )

    if is_otp_expired(otp_entry.expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=translate("otp_expired", lang),
        )

    otp_entry.is_verified = True

    # Backward compatibility with legacy user-row OTP flow
    existing_user = get_user_by_email(db, data.email)
    if existing_user and existing_user.otp == data.otp:
        existing_user.is_verified = True
        existing_user.otp = None
        existing_user.otp_expires_at = None

    db.commit()

    return {
        "message": translate("otp_verified", lang),
        "email": data.email,
        "verified": True,
    }


@router.post("/set-password")
@router.post("/register/set-password")
def set_password(data: SetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    lang = request.headers.get("X-Language", "en")

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=translate("password_too_short", lang),
        )

    user = get_user_by_email(db, data.email)
    verified_otp = (
        db.query(models.OTPCode)
        .filter(
            models.OTPCode.email == data.email,
            models.OTPCode.purpose == "registration",
            models.OTPCode.is_verified.is_(True),
        )
        .order_by(models.OTPCode.created_at.desc())
        .first()
    )

    if not user:
        if not verified_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=translate("email_verify_first", lang),
            )

        user = models.User(
            email=data.email,
            name=verified_otp.name or data.email.split("@")[0],
            phone=verified_otp.phone,
            is_verified=True,
            role=models.UserRole.USER.value,
            preferred_language=lang,
        )
        db.add(user)
        db.flush()
    else:
        if user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=translate("password_already_set", lang),
            )

        if not user.is_verified and not verified_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=translate("email_verify_first", lang),
            )

        user.is_verified = True

    user.password_hash = hash_password(data.password)

    # Clear verified OTP records once password is set
    db.query(models.OTPCode).filter(models.OTPCode.email == data.email).delete()
    db.commit()
    db.refresh(user)

    response = _issue_tokens(user, request, db)
    response["message"] = "Account created successfully"
    return response


@router.post("/resend-otp")
async def resend_otp(data: OTPRequest, request: Request, db: Session = Depends(get_db)):
    return await request_otp(data, request, db)


@router.post("/login")
@router.post("/mobile/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    return await _perform_login(request, credentials, db, require_admin=False)


@router.post("/admin/login")
@limiter.limit("5/minute")
async def admin_login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    return await _perform_login(request, credentials, db, require_admin=True)


async def _perform_login(
    request: Request,
    credentials: UserLogin,
    db: Session,
    *,
    require_admin: bool = False,
):
    lang = request.headers.get("X-Language", "en")
    identifier = (credentials.email or "").strip()

    if "@" in identifier:
        user = db.query(models.User).filter(models.User.email == identifier).first()
    else:
        # Mobile login support: allow phone as identifier
        user = (
            db.query(models.User)
            .filter((models.User.phone == identifier) | (models.User.email == identifier))
            .first()
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate("invalid_credentials", lang),
        )

    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete registration by setting your password",
        )

    if not user.is_verified and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=translate("email_verify_first", lang),
        )

    if not verify_password(user.password_hash, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate("invalid_credentials", lang),
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=translate("account_disabled", lang),
        )
    if getattr(user, "is_deleted", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deleted",
        )
    if require_admin and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    current_ip = _client_ip(request)
    last_login = (
        db.query(models.LoginHistory)
        .filter(models.LoginHistory.user_id == user.id)
        .order_by(models.LoginHistory.timestamp.desc())
        .first()
    )

    if last_login and last_login.ip_address and last_login.ip_address != current_ip:
        await send_security_alert_email(user.email, current_ip)

    db.add(models.LoginHistory(user_id=user.id, ip_address=current_ip, country=None))
    db.commit()

    if user.two_factor_enabled:
        otp = generate_otp()
        challenge_token = secrets.token_urlsafe(32)
        expires = utc_now() + timedelta(minutes=5)
        db.add(
            models.OTPCode(
                email=user.email,
                otp_code=otp,
                purpose="2fa",
                expires_at=expires,
            )
        )
        db.add(
            models.TwoFactorChallenge(
                user_id=user.id,
                challenge_token=challenge_token,
                expires_at=expires,
            )
        )
        db.commit()
        email_sent = await send_otp_email(user.email, otp)
        return {
            "message": "2FA OTP sent",
            "2fa_required": True,
            "challenge_token": challenge_token,
            "email_sent": email_sent,
            "dev_otp": otp if _should_expose_test_otp(request) else None,
        }

    tokens = _issue_tokens(user, request, db)
    if credentials.device_name:
        session = (
            db.query(models.UserSession)
            .filter(models.UserSession.refresh_token == tokens["refresh_token"])
            .first()
        )
        if session:
            session.device_name = credentials.device_name
            db.commit()
    return tokens


@router.post("/2fa/verify")
@router.post("/mobile/2fa/verify")
def verify_two_factor(data: TwoFactorVerifyRequest, request: Request, db: Session = Depends(get_db)):
    challenge = (
        db.query(models.TwoFactorChallenge)
        .filter(models.TwoFactorChallenge.challenge_token == data.challenge_token)
        .first()
    )
    if not challenge or challenge.is_used or challenge.expires_at < utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired 2FA challenge")

    user = get_user_by_id(db, challenge.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    otp_row = (
        db.query(models.OTPCode)
        .filter(
            models.OTPCode.email == user.email,
            models.OTPCode.purpose == "2fa",
            models.OTPCode.otp_code == data.otp,
        )
        .order_by(models.OTPCode.created_at.desc())
        .first()
    )
    if not otp_row or otp_row.expires_at < utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP")

    challenge.is_used = True
    otp_row.is_verified = True
    db.commit()
    return _issue_tokens(user, request, db)


@router.post("/refresh")
@router.post("/mobile/refresh")
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    refresh = (
        db.query(models.RefreshToken)
        .filter(
            models.RefreshToken.token == data.refresh_token,
            models.RefreshToken.is_revoked.is_(False),
        )
        .first()
    )

    if not refresh or refresh.expires_at < utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = get_user_by_id(db, refresh.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    role = _user_role(user)
    session = db.query(models.UserSession).filter(models.UserSession.refresh_token == data.refresh_token).first()
    if session:
        session.last_active = utc_now()
        db.commit()
    new_access = create_access_token({"sub": user.email, "id": user.id, "role": role})
    return {"access_token": new_access, "token_type": "bearer", "role": role}


@router.post("/google-login")
def google_login(data: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google OAuth not configured")

    idinfo = None
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        idinfo = id_token.verify_oauth2_token(
            data.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        # Fallback without google-auth package: verify via Google tokeninfo endpoint.
        try:
            query = urllib.parse.urlencode({"id_token": data.token})
            with urllib.request.urlopen(
                f"https://oauth2.googleapis.com/tokeninfo?{query}", timeout=10
            ) as response:
                payload = json.loads(response.read().decode("utf-8"))

            if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token audience")

            idinfo = payload
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google email not found")

    name = idinfo.get("name") or email.split("@")[0]
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        user = models.User(
            email=email,
            name=name,
            phone=None,
            password_hash=None,
            is_verified=True,
            is_active=True,
            role=models.UserRole.USER.value,
            preferred_language="en",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.is_verified:
            user.is_verified = True
            db.commit()
            db.refresh(user)

    return _issue_tokens(user, request, db)


@router.post("/logout")
def logout_device(data: RefreshTokenRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    refresh = (
        db.query(models.RefreshToken)
        .filter(models.RefreshToken.token == data.refresh_token, models.RefreshToken.user_id == current_user.id)
        .first()
    )
    if refresh:
        refresh.is_revoked = True
    db.query(models.UserSession).filter(
        models.UserSession.user_id == current_user.id,
        models.UserSession.refresh_token == data.refresh_token,
    ).delete()
    db.commit()
    return {"message": "Logged out from device"}


@router.post("/logout-all")
def logout_all_devices(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(models.RefreshToken).filter(models.RefreshToken.user_id == current_user.id).update(
        {models.RefreshToken.is_revoked: True}, synchronize_session=False
    )
    db.query(models.UserSession).filter(models.UserSession.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Logged out from all devices"}


@router.get("/sessions")
def list_sessions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    x_refresh_token: str | None = Header(default=None),
):
    sessions = (
        db.query(models.UserSession)
        .filter(models.UserSession.user_id == current_user.id)
        .order_by(models.UserSession.created_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "device_name": s.device_name,
            "device_info": s.user_agent,
            "ip_address": s.ip_address,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "last_active": s.last_active.isoformat() if s.last_active else None,
            "is_revoked": False,
            "is_current": bool(x_refresh_token and s.refresh_token == x_refresh_token),
        }
        for s in sessions
    ]


@router.post("/sessions/{session_id}/revoke")
def revoke_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(models.UserSession).filter(models.UserSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == session.user_id,
        models.RefreshToken.token == session.refresh_token,
    ).update({models.RefreshToken.is_revoked: True}, synchronize_session=False)
    db.delete(session)
    db.commit()
    return {"message": "Session revoked", "session_id": session_id}


@router.post("/sessions/revoke-others")
def revoke_other_sessions(
    data: RefreshTokenRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    other_tokens = (
        db.query(models.UserSession.refresh_token)
        .filter(
            models.UserSession.user_id == current_user.id,
            models.UserSession.refresh_token != data.refresh_token,
        )
        .all()
    )
    tokens = [t[0] for t in other_tokens]
    if tokens:
        db.query(models.RefreshToken).filter(
            models.RefreshToken.user_id == current_user.id,
            models.RefreshToken.token.in_(tokens),
        ).update({models.RefreshToken.is_revoked: True}, synchronize_session=False)
    updated = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.user_id == current_user.id,
            models.UserSession.refresh_token != data.refresh_token,
        )
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"message": "Other sessions revoked", "revoked_count": int(updated or 0)}


@router.get("/my-devices")
def get_my_devices(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    x_refresh_token: str | None = Header(default=None),
):
    return list_sessions(current_user=current_user, db=db, x_refresh_token=x_refresh_token)


@router.delete("/revoke/{session_id}")
def revoke_device(session_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return revoke_session(session_id=session_id, current_user=current_user, db=db)


@router.post("/2fa/enable")
def enable_2fa(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.two_factor_enabled = True
    db.commit()
    return {"message": "2FA enabled"}


@router.post("/2fa/disable")
def disable_2fa(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.two_factor_enabled = False
    db.commit()
    return {"message": "2FA disabled"}


@router.put("/user/language")
def update_language(data: LanguageUpdateRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    lang = (data.language or "en").split("-")[0]
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.preferred_language = lang
    db.commit()
    return {"message": "Language updated", "preferred_language": lang}


@router.get("/admin/users")
def get_all_users(_admin: models.User = Depends(require_admin_permission("view_users")), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "phone": u.phone,
            "role": _user_role(u),
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "preferred_language": u.preferred_language,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.get("/verify")
def verify_token(token: str = None):
    """Verify if token is valid"""
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token required")

    payload = decode_token(token)
    if payload:
        return {
            "valid": True,
            "user_id": payload.get("id"),
            "email": payload.get("sub"),
            "role": payload.get("role"),
        }

    # Backward-compatible fallback for older base64 tokens
    try:
        decoded = base64.b64decode(token.encode()).decode()
        user_id = int(decoded.split(":")[0])
        return {"valid": True, "user_id": user_id}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.get("/profile/{user_id}")
def get_profile(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Allow only own profile or super admin.
    if current_user.id != user_id and not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this profile",
        )

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "role": _user_role(user),
        "is_active": user.is_active,
    }


@router.get("/users")
def list_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Super admin only.
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": _user_role(u),
            "is_active": u.is_active,
        }
        for u in users
    ]
