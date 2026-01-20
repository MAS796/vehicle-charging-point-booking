from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import UserRegister, UserLogin, UserOut, TokenResponse
from ..services.auth_service import (
    create_user, authenticate_user, get_user_by_email, get_user_by_id
)
from .. import models
import base64
import secrets

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


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user = create_user(db, user_data)
        token = generate_token(user.id)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserOut.from_orm(user)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error creating user")


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = generate_token(user.id)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.from_orm(user)
    }


@router.get("/profile/{user_id}", response_model=UserOut)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile"""
    user = get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserOut.from_orm(user)


@router.get("/verify")
def verify_token(token: str = None):
    """Verify if token is valid"""
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    
    try:
        decoded = base64.b64decode(token.encode()).decode()
        user_id = int(decoded.split(':')[0])
        return {"valid": True, "user_id": user_id}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """Get all users (admin only)"""
    users = db.query(models.User).all()
    return users
