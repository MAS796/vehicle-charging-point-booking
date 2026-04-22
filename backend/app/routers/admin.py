from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .. import models
from ..database import SessionLocal
from ..dependencies import (
    ADMIN_PERMISSIONS,
    get_effective_admin_permissions,
    get_current_admin,
    get_current_super_admin,
    require_admin_permission,
)
from ..permission_guard import require_permission
from ..audit_service import log_action
from ..schemas import AdminPermissionsRequest
from ..zero_trust import zero_trust_guard
from pydantic import BaseModel

router = APIRouter(tags=["Admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_permission_catalog(db: Session):
    """Keep dynamic permission table in sync with supported admin permissions."""
    for perm_name in sorted(list(ADMIN_PERMISSIONS)):
        exists = db.query(models.Permission).filter(models.Permission.name == perm_name).first()
        if not exists:
            db.add(models.Permission(name=perm_name))
    db.flush()


@router.get("/health")
def admin_health():
    return {"status": "admin router is working"}


class CompanyPayoutUpdate(BaseModel):
    razorpay_account_id: str | None = None  # acc_...
    platform_fee_bps: int | None = None  # 0..10000


@router.get("/companies")
def admin_list_companies(
    _admin: models.User = Depends(get_current_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    companies = db.query(models.Company).order_by(models.Company.id.asc()).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "country": c.country,
            "category": c.category,
            "razorpay_account_id": c.razorpay_account_id,
            "platform_fee_bps": int(c.platform_fee_bps or 0),
        }
        for c in companies
    ]


@router.get("/users")
def admin_list_users(
    request: Request,
    include_deleted: bool = Query(default=False),
    only_deleted: bool = Query(default=False),
    _admin: models.User = Depends(require_permission("view_users")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    _log_admin_action(db, _admin.id, "VIEW_USERS", "users", request)
    q = db.query(models.User)
    if only_deleted:
        q = q.filter(models.User.is_deleted.is_(True))
    elif not include_deleted:
        q = q.filter(models.User.is_deleted.is_(False))
    users = q.all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "phone": u.phone,
            "is_admin": bool(u.is_admin),
            "role": "admin" if u.is_admin else (u.role or "user"),
            "is_super_admin": u.is_super_admin,
            "preferred_language": u.preferred_language,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "is_deleted": getattr(u, "is_deleted", False),
            "deleted_at": u.deleted_at.isoformat() if getattr(u, "deleted_at", None) else None,
            "risk_score": getattr(u, "risk_score", 0),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.get("/companies/{company_id}/payout")
def get_company_payout(
    company_id: int,
    _admin: models.User = Depends(get_current_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return {
        "company_id": company.id,
        "company_name": company.name,
        "razorpay_account_id": company.razorpay_account_id,
        "platform_fee_bps": int(company.platform_fee_bps or 0),
    }


@router.put("/companies/{company_id}/payout")
def update_company_payout(
    company_id: int,
    data: CompanyPayoutUpdate,
    request: Request,
    _admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    if data.razorpay_account_id is not None:
        company.razorpay_account_id = data.razorpay_account_id.strip() or None
    if data.platform_fee_bps is not None:
        bps = int(data.platform_fee_bps)
        if bps < 0 or bps > 10000:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="platform_fee_bps must be 0..10000")
        company.platform_fee_bps = bps

    db.commit()
    _log_admin_action(db, _admin.id, "UPDATE_PAYOUT_ACCOUNT", f"company:{company.id}", request)
    return {
        "message": "Payout settings updated",
        "company_id": company.id,
        "razorpay_account_id": company.razorpay_account_id,
        "platform_fee_bps": int(company.platform_fee_bps or 0),
    }


@router.get("/logs")
def admin_logs(_admin: models.User = Depends(require_permission("view_logs")), _zt: bool = Depends(zero_trust_guard), db: Session = Depends(get_db)):
    logs = db.query(models.AdminLog).order_by(models.AdminLog.timestamp.desc()).limit(200).all()
    return [
        {
            "id": l.id,
            "admin_id": l.admin_id,
            "action": l.action,
            "target": l.target,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "ip_address": l.ip_address,
        }
        for l in logs
    ]


@router.get("/permissions/catalog")
def permission_catalog(_admin: models.User = Depends(get_current_admin), _zt: bool = Depends(zero_trust_guard), db: Session = Depends(get_db)):
    _ensure_permission_catalog(db)
    db.commit()
    return {"permissions": sorted(list(ADMIN_PERMISSIONS))}


@router.get("/permissions")
def list_permissions(
    _admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """Detailed permission catalog endpoint for enterprise admin tooling."""
    _ensure_permission_catalog(db)
    db.commit()
    perms = db.query(models.Permission).order_by(models.Permission.name.asc()).all()
    return {
        "count": len(perms),
        "permissions": [{"id": p.id, "name": p.name} for p in perms],
    }


@router.post("/permissions")
def create_permission(
    data: dict,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """Create a custom permission (super admin only)."""
    name = (data.get("name") or "").strip().lower()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission name is required")
    if len(name) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission name too long")
    existing = db.query(models.Permission).filter(models.Permission.name == name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Permission already exists")

    perm = models.Permission(name=name)
    db.add(perm)
    db.commit()
    _log_admin_action(db, main_admin.id, "CREATE_PERMISSION", f"permission:{name}", request)
    return {"message": "Permission created", "permission": {"id": perm.id, "name": perm.name}}


@router.get("/me/permissions")
def my_permissions(admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    _ensure_permission_catalog(db)
    base = get_effective_admin_permissions(db, admin)
    dynamic = (
        db.query(models.Permission.name)
        .join(models.UserPermission, models.Permission.id == models.UserPermission.permission_id)
        .filter(models.UserPermission.user_id == admin.id)
        .all()
    )
    permissions = sorted(list(base.union({d[0] for d in dynamic})))
    return {
        "admin_id": admin.id,
        "is_super_admin": admin.is_super_admin,
        "permissions": permissions,
    }


@router.get("/users/{user_id}/permissions")
def get_user_permissions(
    user_id: int,
    _admin: models.User = Depends(require_permission("view_users")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    admin_perms = get_effective_admin_permissions(db, user) if user.is_admin else set()
    dynamic = (
        db.query(models.Permission.name)
        .join(models.UserPermission, models.Permission.id == models.UserPermission.permission_id)
        .filter(models.UserPermission.user_id == user.id)
        .all()
    )
    dynamic_perms = {d[0] for d in dynamic}
    return {
        "user_id": user.id,
        "is_admin": user.is_admin,
        "is_super_admin": user.is_super_admin,
        "permissions": sorted(list(admin_perms.union(dynamic_perms))),
    }


@router.put("/users/{user_id}/permissions")
def set_user_permissions(
    user_id: int,
    data: AdminPermissionsRequest,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """Set permissions for any user (super admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify main admin permissions")

    normalized = _normalize_user_permissions(db, data.permissions)
    _ensure_permission_catalog(db)
    _sync_user_permissions(db, user.id, normalized)
    if user.is_admin:
        # Keep legacy admin_permissions table aligned for existing checks/UI
        admin_scoped = sorted(list(normalized.intersection(ADMIN_PERMISSIONS)))
        _set_admin_permissions(db, user.id, admin_scoped, granted_by=main_admin.id)
    db.commit()
    _log_admin_action(db, main_admin.id, "SET_USER_PERMISSIONS", f"user:{user.id}", request)
    return {"message": "Permissions updated", "user_id": user.id, "permissions": sorted(list(normalized))}


@router.post("/sub-admins/{user_id}/promote")
def promote_sub_admin(
    user_id: int,
    data: AdminPermissionsRequest,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify main admin")

    user.is_admin = True
    user.role = models.UserRole.ADMIN.value
    user.is_super_admin = False
    requested_permissions = data.permissions or sorted(list(ADMIN_PERMISSIONS))
    _set_admin_permissions(db, user.id, requested_permissions, granted_by=main_admin.id)
    db.commit()

    _log_admin_action(db, main_admin.id, "PROMOTE_SUB_ADMIN", f"user:{user.id}", request)
    return {"message": "Sub-admin created", "user_id": user.id, "permissions": sorted(_normalize_permissions(requested_permissions))}


@router.put("/sub-admins/{user_id}/permissions")
def update_sub_admin_permissions(
    user_id: int,
    data: AdminPermissionsRequest,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_admin.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify main admin")

    requested_permissions = data.permissions or sorted(list(ADMIN_PERMISSIONS))
    _set_admin_permissions(db, user.id, requested_permissions, granted_by=main_admin.id)
    db.commit()

    _log_admin_action(db, main_admin.id, "UPDATE_SUB_ADMIN_PERMISSIONS", f"user:{user.id}", request)
    return {"message": "Permissions updated", "user_id": user.id, "permissions": sorted(_normalize_permissions(requested_permissions))}


@router.post("/sub-admins/{user_id}/demote")
def demote_sub_admin(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_admin.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot demote main admin")

    user.is_admin = False
    user.is_super_admin = False
    user.role = models.UserRole.USER.value
    db.query(models.AdminPermission).filter(models.AdminPermission.admin_user_id == user.id).delete()
    db.query(models.UserPermission).filter(models.UserPermission.user_id == user.id).delete()
    db.commit()

    _log_admin_action(db, main_admin.id, "DEMOTE_SUB_ADMIN", f"user:{user.id}", request)
    return {"message": "Sub-admin demoted", "user_id": user.id}


@router.post("/sub-admins/{user_id}/depromote")
def depromote_sub_admin(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """Spelling-compatibility alias: depromote sub-admin to normal user."""
    return demote_sub_admin(
        user_id=user_id,
        request=request,
        main_admin=main_admin,
        _zt=_zt,
        db=db,
    )


@router.put("/promote/{user_id}")
@router.post("/promote/{user_id}")
def promote_user_alias(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    """Compatibility endpoint: promote user to sub-admin with default limited permissions."""
    default_permissions = ["view_users", "manage_stations", "manage_bookings"]
    return promote_sub_admin(
        user_id=user_id,
        data=AdminPermissionsRequest(permissions=default_permissions),
        request=request,
        main_admin=main_admin,
        db=db,
    )


@router.put("/demote/{user_id}")
@router.post("/demote/{user_id}")
def demote_user_alias(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    """Compatibility endpoint: demote sub-admin to normal user."""
    return demote_sub_admin(
        user_id=user_id,
        request=request,
        main_admin=main_admin,
        db=db,
    )


@router.put("/depromote/{user_id}")
@router.post("/depromote/{user_id}")
def depromote_user_alias(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    """Compatibility alias with alternate spelling."""
    return demote_sub_admin(
        user_id=user_id,
        request=request,
        main_admin=main_admin,
        db=db,
    )


@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    request: Request,
    admin: models.User = Depends(require_permission("manage_users")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    _log_admin_action(db, admin.id, "ACTIVATE_USER", f"user:{user.id}", request)
    return {"message": "User activated", "user_id": user.id}


@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    request: Request,
    admin: models.User = Depends(require_permission("manage_users")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate main admin")
    user.is_active = False
    db.commit()
    _log_admin_action(db, admin.id, "DEACTIVATE_USER", f"user:{user.id}", request)
    return {"message": "User deactivated", "user_id": user.id}


@router.delete("/delete/{user_id}")
def soft_delete_user(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """Soft delete (move user to trash). Main admin only."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete main admin")
    if user.id == main_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")

    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    user.is_active = False
    db.commit()
    _log_admin_action(db, main_admin.id, "SOFT_DELETE_USER", f"user:{user_id}", request)
    return {"message": "User moved to trash", "user_id": user_id}


@router.delete("/users/{user_id}")
def delete_user_rest(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    """REST-style alias for deleting a user."""
    return soft_delete_user(
        user_id=user_id,
        request=request,
        main_admin=main_admin,
        db=db,
    )


@router.delete("/users/{user_id}/delete")
def delete_user_legacy(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    db: Session = Depends(get_db),
):
    """Legacy alias for older clients."""
    return soft_delete_user(
        user_id=user_id,
        request=request,
        main_admin=main_admin,
        db=db,
    )


@router.put("/users/{user_id}/restore")
def restore_user(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify main admin")

    user.is_deleted = False
    user.deleted_at = None
    user.is_active = True
    db.commit()

    _log_admin_action(db, main_admin.id, "RESTORE_USER", f"user:{user_id}", request)
    return {"message": "User restored", "user_id": user_id}


@router.delete("/users/{user_id}/purge")
def purge_user(
    user_id: int,
    request: Request,
    main_admin: models.User = Depends(get_current_super_admin),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """
    Hard purge (enterprise-safe): revoke access + anonymize PII.
    We keep the row to preserve FK integrity and audit history.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot purge main admin")
    if user.id == main_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot purge your own account")
    if not getattr(user, "is_deleted", False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User must be soft-deleted before purge")

    # Revoke sessions/tokens
    db.query(models.RefreshToken).filter(models.RefreshToken.user_id == user.id).delete()
    db.query(models.UserSession).filter(models.UserSession.user_id == user.id).delete()
    db.query(models.UserDevice).filter(models.UserDevice.user_id == user.id).delete()
    db.query(models.LoginHistory).filter(models.LoginHistory.user_id == user.id).delete()
    db.query(models.TwoFactorChallenge).filter(models.TwoFactorChallenge.user_id == user.id).delete()
    db.query(models.AdminPermission).filter(models.AdminPermission.admin_user_id == user.id).delete()
    db.query(models.UserPermission).filter(models.UserPermission.user_id == user.id).delete()

    # Anonymize user PII (preserves unique email constraint)
    user.email = f"deleted-user-{user.id}-{int(datetime.utcnow().timestamp())}@deleted.local"
    user.name = "Deleted User"
    user.phone = None
    user.password_hash = None
    user.is_verified = False
    user.two_factor_enabled = False
    user.is_admin = False
    user.is_super_admin = False
    user.role = models.UserRole.USER.value
    user.is_active = False
    user.risk_score = 0
    if not user.deleted_at:
        user.deleted_at = datetime.utcnow()

    db.commit()
    _log_admin_action(db, main_admin.id, "PURGE_USER", f"user:{user_id}", request)
    return {"message": "User purged (anonymized + access revoked)", "user_id": user_id}


def _normalize_permissions(permissions: list[str]) -> set[str]:
    normalized = {(p or "").strip().lower() for p in permissions}
    normalized.discard("")
    invalid = normalized - ADMIN_PERMISSIONS
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid permissions: {sorted(list(invalid))}",
        )
    return normalized


def _normalize_user_permissions(db: Session, permissions: list[str]) -> set[str]:
    """Allow both built-in admin permissions and custom permissions from the DB catalog."""
    normalized = {(p or "").strip().lower() for p in permissions}
    normalized.discard("")
    if not normalized:
        return set()

    existing = (
        db.query(models.Permission.name)
        .filter(models.Permission.name.in_(list(normalized)))
        .all()
    )
    existing_names = {row[0] for row in existing}
    invalid = {p for p in normalized if p not in ADMIN_PERMISSIONS and p not in existing_names}
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid permissions: {sorted(list(invalid))}",
        )
    return normalized


def _set_admin_permissions(db: Session, admin_user_id: int, permissions: list[str], granted_by: int):
    permission_set = _normalize_permissions(permissions)
    db.query(models.AdminPermission).filter(models.AdminPermission.admin_user_id == admin_user_id).delete()
    _sync_user_permissions(db, admin_user_id, permission_set)
    for perm in sorted(list(permission_set)):
        db.add(
            models.AdminPermission(
                admin_user_id=admin_user_id,
                permission=perm,
                granted_by_user_id=granted_by,
            )
        )


def _sync_user_permissions(db: Session, user_id: int, permissions: set[str]):
    db.query(models.UserPermission).filter(models.UserPermission.user_id == user_id).delete()
    for perm_name in sorted(list(permissions)):
        perm = db.query(models.Permission).filter(models.Permission.name == perm_name).first()
        if not perm:
            perm = models.Permission(name=perm_name)
            db.add(perm)
            db.flush()
        db.add(
            models.UserPermission(
                user_id=user_id,
                permission_id=perm.id,
            )
        )


def _log_admin_action(db: Session, admin_id: int, action: str, target: str, request: Request):
    db.add(
        models.AdminLog(
            admin_id=admin_id,
            action=action,
            target=target,
            ip_address=request.client.host if request.client else None,
        )
    )
    target_user_id = None
    if target and target.startswith("user:"):
        try:
            target_user_id = int(target.split(":", 1)[1])
        except ValueError:
            target_user_id = None
    log_action(
        db=db,
        admin_id=admin_id,
        action=action,
        target_user_id=target_user_id,
        ip_address=request.client.host if request.client else None,
    )
    db.commit()


@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
    admin_id: int | None = Query(default=None),
    action: str | None = Query(default=None),
    _admin: models.User = Depends(require_permission("view_logs")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    q = db.query(models.AuditLog)
    if admin_id is not None:
        q = q.filter(models.AuditLog.admin_id == admin_id)
    if action:
        q = q.filter(models.AuditLog.action.ilike(f"%{action.strip()}%"))

    total = q.count()
    logs = (
        q.order_by(models.AuditLog.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [
        {
            "id": log.id,
            "admin_id": log.admin_id,
            "action": log.action,
            "target_user_id": log.target_user_id,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/audit-logs/summary")
def get_audit_summary(
    _admin: models.User = Depends(require_permission("view_logs")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    total = db.query(models.AuditLog).count()
    since = datetime.utcnow() - timedelta(hours=24)
    last_24h = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.timestamp >= since)
        .count()
    )
    return {"total_logs": total, "last_24h": last_24h}


@router.get("/activity-heatmap")
def activity_heatmap(
    days: int = Query(default=7, ge=1, le=30),
    _admin: models.User = Depends(require_permission("view_logs")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    """
    Hour-of-day activity counts over the last N days.
    Returns list: [{hour: 0..23, activity: int}, ...]
    """
    since = datetime.utcnow() - timedelta(days=days)
    dialect = db.bind.dialect.name if db.bind else "unknown"

    counts = {h: 0 for h in range(24)}
    if dialect == "sqlite":
        rows = (
            db.query(
                func.strftime("%H", models.AuditLog.timestamp).label("h"),
                func.count(models.AuditLog.id).label("c"),
            )
            .filter(models.AuditLog.timestamp >= since)
            .group_by("h")
            .all()
        )
        for h, c in rows:
            try:
                counts[int(h)] = int(c)
            except Exception:
                continue
    else:
        rows = (
            db.query(
                func.extract("hour", models.AuditLog.timestamp).label("h"),
                func.count(models.AuditLog.id).label("c"),
            )
            .filter(models.AuditLog.timestamp >= since)
            .group_by("h")
            .all()
        )
        for h, c in rows:
            counts[int(h)] = int(c)

    return [{"hour": h, "activity": counts[h]} for h in range(24)]
