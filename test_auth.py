#!/usr/bin/env python
import sys
sys.path.insert(0, 'backend')

from app.database import SessionLocal
from app.models import User
from app.services.auth_service import authenticate_user

db = SessionLocal()
try:
    # Check if admin user exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if admin:
        print(f"Admin user exists: {admin.email}, is_admin={admin.is_admin}")
        
        # Try to authenticate
        user = authenticate_user(db, "admin@example.com", "admin123")
        if user:
            print(f"Auth Success: {user.email}, is_admin={user.is_admin}")
        else:
            print("Auth Failed: Password incorrect")
    else:
        print("Admin user not found in database")
        
        # List all users
        all_users = db.query(User).all()
        print(f"Total users in database: {len(all_users)}")
        for u in all_users:
            print(f"  - {u.email}")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
