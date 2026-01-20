#!/usr/bin/env python3
"""
Create an admin user
"""

from app.database import SessionLocal
from app.models import User
from app.services.auth_service import hash_password

db = SessionLocal()

# Create admin user
admin_user = User(
    email="admin@example.com",
    name="Admin User",
    phone="9876543210",
    password_hash=hash_password("admin123"),
    is_admin=True,
    is_active=True
)

# Check if admin already exists
existing = db.query(User).filter(User.email == "admin@example.com").first()

if existing:
    print("❌ Admin user already exists!")
    print(f"   Email: {existing.email}")
    print(f"   Is Admin: {existing.is_admin}")
else:
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print("✅ Admin user created successfully!")
    print(f"   Email: admin@example.com")
    print(f"   Password: admin123")
    print(f"   ID: {admin_user.id}")
