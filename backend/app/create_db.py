import os

from .database import Base, SessionLocal, engine
from .models import User
from .seed_companies import seed_companies
from .seed_stations import seed_stations
from .services.auth_service import hash_password


def _env_flag(name: str, default: bool = False) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in {"1", "true", "yes", "on"}


def initialize_database():
    print("[INFO] Creating database tables...")
    Base.metadata.create_all(bind=engine, checkfirst=True)

    if _env_flag("SEED_REFERENCE_DATA", False):
        print("[INFO] Seeding reference stations and companies...")
        seed_stations()
        seed_companies()

    create_admin()
    print("[INFO] Database bootstrap finished.")


def create_admin():
    db = SessionLocal()
    admin_email = (os.getenv("ADMIN_DEFAULT_EMAIL") or "").strip().lower()
    admin_password = (os.getenv("ADMIN_DEFAULT_PASSWORD") or "").strip()
    admin_name = (os.getenv("ADMIN_DEFAULT_NAME") or "Admin User").strip() or "Admin User"
    admin_phone = (os.getenv("ADMIN_DEFAULT_PHONE") or "").strip() or None

    if not admin_email or not admin_password:
        print("[INFO] Skipping admin creation. Set ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD.")
        db.close()
        return

    existing = db.query(User).filter(User.email == admin_email).first()
    if existing:
        print("[INFO] Admin user already exists")
        print(f"Email: {existing.email}")
        print(f"Is Admin: {existing.is_admin}")
        db.close()
        return

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

    print("[OK] Admin user created successfully")
    print("Email    :", admin_email)
    print("Password :", "<hidden>")
    print("Is Admin :", True)
    print("ID       :", admin_user.id)

    db.close()


if __name__ == "__main__":
    initialize_database()
