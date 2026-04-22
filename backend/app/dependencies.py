from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import SessionLocal
from .security import decode_token
from . import models

security = HTTPBearer(auto_error=False)

ADMIN_PERMISSIONS = {
    "view_users",
    "view_logs",
    "manage_users",
    "manage_stations",
    "manage_bookings",
}

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if getattr(user, "is_frozen", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account frozen",
        )

    if not user.is_active or getattr(user, "is_deleted", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled",
        )

    # Zero-trust baseline: high-risk admins are blocked server-side.
    # Main admin can still access to recover the system (unfreeze/adjust settings).
    if user.is_admin and not getattr(user, "is_super_admin", False) and getattr(user, "risk_score", 0) >= 70:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="High risk account blocked",
        )
    
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)):
    """Require admin role"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def get_current_super_admin(current_user: models.User = Depends(get_current_admin)):
    """Require main/super admin role."""
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Main admin access required",
        )
    return current_user


def get_admin_permissions(db: Session, admin_user_id: int) -> set[str]:
    rows = (
        db.query(models.AdminPermission.permission)
        .filter(models.AdminPermission.admin_user_id == admin_user_id)
        .all()
    )
    return {r[0] for r in rows}


def get_dynamic_permissions(db: Session, user_id: int) -> set[str]:
    rows = (
        db.query(models.Permission.name)
        .join(models.UserPermission, models.Permission.id == models.UserPermission.permission_id)
        .filter(models.UserPermission.user_id == user_id)
        .all()
    )
    return {r[0] for r in rows}


def get_effective_admin_permissions(db: Session, user: models.User) -> set[str]:
    """Return effective built-in admin permissions with legacy fallback support."""
    if not user.is_admin:
        return set()

    if user.is_super_admin:
        return set(ADMIN_PERMISSIONS)

    legacy_permissions = get_admin_permissions(db, user.id)
    dynamic_permissions = get_dynamic_permissions(db, user.id)

    # Backward compatibility: old admin rows had no granular permission assignments.
    # Keep full built-in access unless explicit permissions are configured.
    if not legacy_permissions and not dynamic_permissions:
        return set(ADMIN_PERMISSIONS)

    return legacy_permissions.union({p for p in dynamic_permissions if p in ADMIN_PERMISSIONS})


def admin_has_permission(db: Session, user: models.User, permission: str) -> bool:
    if not user.is_admin:
        return False
    return permission in get_effective_admin_permissions(db, user)


def require_admin_permission(permission: str):
    if permission not in ADMIN_PERMISSIONS:
        raise ValueError(f"Unknown admin permission: {permission}")

    def _checker(
        current_user: models.User = Depends(get_current_admin),
        db: Session = Depends(get_db),
    ):
        if not admin_has_permission(db, current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing admin permission: {permission}",
            )
        return current_user

    return _checker

def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user if authenticated, else None"""
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        return None
    
    email = payload.get("sub")
    if not email:
        return None
    
    return db.query(models.User).filter(models.User.email == email).first()
