#!/usr/bin/env python
"""
Create or normalize a super-admin user from environment variables.

Required:
  ADMIN_DEFAULT_EMAIL
  ADMIN_DEFAULT_PASSWORD

Optional:
  ADMIN_DEFAULT_NAME (default: Admin User)
  ADMIN_DEFAULT_PHONE
"""

import os
import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from app.database import SessionLocal
from app.models import User
from app.services.auth_service import hash_password


def _required_env(name: str) -> str:
    value = (os.getenv(name) or "").strip()
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def create_default_admin() -> int:
    admin_email = _required_env("ADMIN_DEFAULT_EMAIL").lower()
    admin_password = _required_env("ADMIN_DEFAULT_PASSWORD")
    admin_name = (os.getenv("ADMIN_DEFAULT_NAME") or "Admin User").strip() or "Admin User"
    admin_phone = (os.getenv("ADMIN_DEFAULT_PHONE") or "").strip() or None

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == admin_email).first()
        if admin:
            changed = False
            if not admin.is_admin:
                admin.is_admin = True
                changed = True
            if not admin.is_super_admin:
                admin.is_super_admin = True
                changed = True
            if not admin.is_verified:
                admin.is_verified = True
                changed = True
            if not admin.is_active:
                admin.is_active = True
                changed = True
            if admin.role != "admin":
                admin.role = "admin"
                changed = True

            if changed:
                db.commit()
                print(f"[OK] Existing user promoted/normalized as super admin: {admin_email}")
            else:
                print(f"[OK] Super admin already exists: {admin_email}")
            return 0

        admin_user = User(
            email=admin_email,
            name=admin_name,
            phone=admin_phone,
            password_hash=hash_password(admin_password),
            is_admin=True,
            is_super_admin=True,
            is_verified=True,
            role="admin",
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"[OK] Super admin created: {admin_email} (id={admin_user.id})")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    try:
        raise SystemExit(create_default_admin())
    except RuntimeError as exc:
        print(f"[ERROR] {exc}")
        print("Set ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD, then rerun.")
        raise SystemExit(1)
