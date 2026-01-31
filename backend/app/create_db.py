from .database import SessionLocal
from .models import User
from .services.auth_service import hash_password

def create_admin():
    db = SessionLocal()

    admin_email = "mas123@example.com"

    existing = db.query(User).filter(User.email == admin_email).first()

    if existing:
        print("❌ Admin user already exists")
        print(f"Email: {existing.email}")
        print(f"Is Admin: {existing.is_admin}")
        db.close()
        return

    admin_user = User(
        email=admin_email,
        name="Admin User",
        phone="9876543210",
        password_hash=hash_password("admin123"),
        is_admin=True,
        is_active=True
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    print("✅ Admin user created successfully")
    print("Email    :", admin_email)
    print("Password :", "admin@123")
    print("Is Admin :", True)
    print("ID       :", admin_user.id)

    db.close()

if __name__ == "__main__":
    create_admin()
