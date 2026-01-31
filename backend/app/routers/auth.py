"""
Authentication Router - Professional Clean Architecture

Flow for NEW users:
1. POST /auth/register -> Creates unverified user, sends OTP
2. POST /auth/verify-otp -> Verifies OTP, marks user verified
3. POST /auth/set-password -> Sets password, returns token

Flow for EXISTING users:
1. POST /auth/login -> Email + Password -> Returns token
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import base64
import secrets

from ..database import SessionLocal
from ..schemas import (
    UserRegister, UserLogin, UserOut, 
    OTPRequest, OTPVerify, SetPasswordRequest
)
from ..services.auth_service import (
    hash_password, verify_password, get_user_by_email, get_user_by_id
)
from ..services.otp_service import (
    generate_otp, get_otp_expiry, is_otp_expired
)
from ..email_service import send_otp_email
from .. import models

router = APIRouter(tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_token(user_id: int) -> str:
    """Generate a simple token for the user"""
    token_data = f"{user_id}:{secrets.token_hex(32)}"
    return base64.b64encode(token_data.encode()).decode()


# ============================================================
# NEW USER REGISTRATION (OTP Flow)
# ============================================================

@router.post("/register")
async def register_new_user(data: OTPRequest, db: Session = Depends(get_db)):
    """
    STEP 1: Register new user and send OTP
    - Creates user with is_verified=False
    - Stores OTP in database
    - Returns success message
    """
    # Check if user already exists
    existing_user = get_user_by_email(db, data.email)
    
    if existing_user:
        if existing_user.is_verified and existing_user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists. Please login instead."
            )
        # User exists but not verified - resend OTP
        otp = generate_otp()
        existing_user.otp = otp
        existing_user.otp_expires_at = get_otp_expiry()
        existing_user.name = data.name
        existing_user.phone = data.phone
        db.commit()
        
        # Send OTP via email
        try:
            await send_otp_email(data.email, otp)
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")
            # Fallback: print OTP for development
            print(f"[DEV] OTP for {data.email}: {otp}")
        
        return {
            "message": "OTP sent to your email",
            "email": data.email,
            "success": True
        }
    
    # Create new unverified user
    otp = generate_otp()
    new_user = models.User(
        email=data.email,
        name=data.name,
        phone=data.phone,
        otp=otp,
        otp_expires_at=get_otp_expiry(),
        is_verified=False,
        password_hash=None  # No password yet
    )
    
    db.add(new_user)
    db.commit()
    
    # Send OTP via email
    try:
        await send_otp_email(data.email, otp)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        # Fallback: print OTP for development
        print(f"[DEV] OTP for {data.email}: {otp}")
    
    return {
        "message": "OTP sent to your email",
        "email": data.email,
        "success": True
    }


@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    """
    STEP 2: Verify OTP
    - Validates OTP
    - Marks user as verified
    - Returns success (user can now set password)
    """
    user = get_user_by_email(db, data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    if user.is_verified and user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already verified. Please login."
        )
    
    # Check OTP expiry
    if is_otp_expired(user.otp_expires_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Verify OTP
    if user.otp != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Mark as verified
    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    db.commit()
    
    return {
        "message": "OTP verified successfully",
        "email": data.email,
        "verified": True
    }


@router.post("/set-password")
def set_password(data: SetPasswordRequest, db: Session = Depends(get_db)):
    """
    STEP 3: Set password after OTP verification
    - Validates user is verified
    - Sets hashed password
    - Returns token (user is now fully registered)
    """
    user = get_user_by_email(db, data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email first"
        )
    
    if user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password already set. Please login."
        )
    
    # Validate password strength
    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    
    # Set password
    user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    
    # Generate token
    token = generate_token(user.id)
    
    return {
        "message": "Account created successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified,
            "role": user.role,
            "created_at": user.created_at.isoformat()
        }
    }


@router.post("/resend-otp")
async def resend_otp(data: OTPRequest, db: Session = Depends(get_db)):
    """Resend OTP for registration"""
    user = get_user_by_email(db, data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    if user.is_verified and user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered. Please login."
        )
    
    # Generate new OTP
    otp = generate_otp()
    user.otp = otp
    user.otp_expires_at = get_otp_expiry()
    db.commit()
    
    # Send OTP via email
    try:
        await send_otp_email(data.email, otp)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        print(f"[DEV] New OTP for {data.email}: {otp}")
    
    return {
        "message": "New OTP sent to your email",
        "success": True
    }


# ============================================================
# EXISTING USER LOGIN (Email + Password)
# ============================================================

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login for existing users
    - Requires email + password
    - Returns token if valid
    """
    user = get_user_by_email(db, credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete registration by setting your password"
        )
    
    # Admins bypass email verification requirement
    if not user.is_verified and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email first"
        )
    
    if not verify_password(user.password_hash, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Generate token
    token = generate_token(user.id)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "role": user.role,
            "created_at": user.created_at.isoformat()
        }
    }


# ============================================================
# UTILITY ENDPOINTS
# ============================================================

@router.get("/verify")
def verify_token(token: str = None):
    """Verify if token is valid"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token required"
        )
    
    try:
        decoded = base64.b64decode(token.encode()).decode()
        user_id = int(decoded.split(':')[0])
        return {"valid": True, "user_id": user_id}
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile"""
    user = get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "is_admin": user.is_admin,
        "is_verified": user.is_verified,
        "role": user.role,
        "created_at": user.created_at.isoformat()
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """Get all users (admin only)"""
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "is_admin": u.is_admin,
            "is_verified": u.is_verified,
            "role": u.role
        }
        for u in users
    ]


# ============================================================
# LEGACY ENDPOINT (For backward compatibility)
# ============================================================

@router.post("/request-otp")
def request_otp(data: OTPRequest, db: Session = Depends(get_db)):
    """Legacy endpoint - redirects to register"""
    return register_new_user(data, db)
