from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..services.auth_service import hash_password, verify_password
from ..database import SessionLocal

router = APIRouter(tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@router.get("/health")
def admin_health():
    return {"status": "admin router is working"}
