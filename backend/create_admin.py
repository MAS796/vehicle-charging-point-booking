#!/usr/bin/env python
"""
Create a default admin user for the system.
Run this script once after starting the backend.
"""

import sys
sys.path.insert(0, '/backend')

from app.database import SessionLocal
from app.models import User
from app.services.auth_service import hash_password

def create_default_admin():
    db = SessionLocal()
    
    # Check if admin already exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if admin:
        print("✓ Admin user already exists!")
        db.close()
        return
    
    # Create admin user
    admin_user = User(
        email="admin@example.com",
        name="Admin User",
        phone="9999999999",
        password_hash=hash_password("admin123"),
        is_admin=True,
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print("✓ Admin user created successfully!")
    print(f"  Email: admin@example.com")
    print(f"  Password: admin123")
    print(f"  User ID: {admin_user.id}")
    
    db.close()

if __name__ == "__main__":
    create_default_admin()
