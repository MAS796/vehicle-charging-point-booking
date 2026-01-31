#!/usr/bin/env python
"""Create admin user for testing"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import User
from app.services.auth_service import hash_password

db = SessionLocal()

# Check if admin exists
existing = db.query(User).filter(User.email == "admin@example.com").first()
if existing:
    print("✓ Admin already exists")
    db.close()
    exit()

# Create admin
admin = User(
    email="admin@example.com",
    name="Admin User",
    phone="9999999999",
    password_hash=hash_password("admin123"),
    is_admin=True,
    is_active=True
)

db.add(admin)
db.commit()
print("✅ Admin created!")
print("Email: admin@example.com")
print("Password: admin123")
db.close()
