from sqlalchemy.orm import Session
from .. import models
from .auth_service import hash_password, verify_password

def create_admin(db: Session, email: str, password: str):
    admin = models.Admin(
        email=email,
        password_hash=hash_password(password)
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

def authenticate_admin(db: Session, email: str, password: str):
    admin = db.query(models.Admin).filter(models.Admin.email == email).first()

    if not admin:
        return None

    if not verify_password(admin.password_hash, password):
        return None

    if not admin.is_active:
        return None

    return admin
