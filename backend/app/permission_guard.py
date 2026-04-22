from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import models
from .dependencies import ADMIN_PERMISSIONS, get_current_user, get_db, admin_has_permission


def require_permission(permission_name: str):
    permission_name = (permission_name or "").strip().lower()
    if not permission_name:
        raise ValueError("permission_name is required")

    def permission_checker(
        user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        # Super admin always bypasses granular checks
        if user.is_super_admin or user.role == "super_admin":
            return user

        # Keep compatibility with existing admin permission model
        if permission_name in ADMIN_PERMISSIONS and admin_has_permission(db, user, permission_name):
            return user

        # Dynamic permission model
        permission = (
            db.query(models.Permission)
            .filter(models.Permission.name == permission_name)
            .first()
        )
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission not configured: {permission_name}",
            )

        user_perm = (
            db.query(models.UserPermission)
            .filter(
                models.UserPermission.user_id == user.id,
                models.UserPermission.permission_id == permission.id,
            )
            .first()
        )
        if not user_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied",
            )
        return user

    return permission_checker
