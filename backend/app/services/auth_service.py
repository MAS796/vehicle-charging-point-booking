import hashlib
import secrets
from datetime import datetime, timedelta
import base64
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .. import models
from ..schemas import UserRegister, UserLogin, UserOut

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using passlib pbkdf2_sha256 for reliability across environments."""
    return pwd_context.hash(password)


def verify_password(stored_hash: str, password: str) -> bool:
    """Verify password, supporting bcrypt and legacy pbkdf2 hashes."""
    if not stored_hash:
        return False

    try:
        # Covers new passlib hashes (pbkdf2_sha256) and any supported hash.
        if pwd_context.identify(stored_hash):
            return pwd_context.verify(password, stored_hash)
    except Exception:
        pass

    # Legacy fallback for old hashes: salt$hash
    try:
        salt, pwd_hash = stored_hash.split('$')
        new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 10000)
        return new_hash.hex() == pwd_hash
    except Exception:
        return False


def create_user(db: Session, user_data: UserRegister) -> models.User:
    """Create a new user"""
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise ValueError("User with this email already exists")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = models.User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, email: str, password: str) -> models.User:
    """Authenticate user and return user object if valid"""
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        return None
    
    if not verify_password(user.password_hash, password):
        return None
    
    if not user.is_active:
        return None
    
    return user


def get_user_by_email(db: Session, email: str) -> models.User:
    """Get user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> models.User:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()
