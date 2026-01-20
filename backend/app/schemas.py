from pydantic import BaseModel, EmailStr
from datetime import datetime

# ===== USER SCHEMAS =====
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    phone: str = None
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    phone: str = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserProfile(UserOut):
    pass


# ===== STATION SCHEMAS =====
class StationCreate(BaseModel):
    name: str
    address: str
    lat: float
    lon: float

class StationOut(StationCreate):
    id: int
    class Config:
        from_attributes = True


# ===== BOOKING SCHEMAS =====
class BookingCreate(BaseModel):
    station_id: int
    name: str
    car_number: str
    phone: str
    hours: int

class BookingOut(BookingCreate):
    id: int
    status: str
    user_id: int = None
    class Config:
        from_attributes = True


# ===== PAYMENT SCHEMAS =====
class PaymentCreate(BaseModel):
    booking_id: int
    amount: int

class PaymentOut(PaymentCreate):
    id: int
    class Config:
        from_attributes = True


# ===== AUTH RESPONSE =====
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
