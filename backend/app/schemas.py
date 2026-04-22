from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional, List

# ===== USER SCHEMAS =====
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    phone: str = None
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    device_name: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LanguageUpdateRequest(BaseModel):
    language: str

class GoogleLoginRequest(BaseModel):
    token: str

class TwoFactorVerifyRequest(BaseModel):
    challenge_token: str
    otp: str


class AdminPermissionsRequest(BaseModel):
    permissions: List[str]

# OTP Schemas - For New User Registration
class OTPRequest(BaseModel):
    email: EmailStr
    phone: str
    name: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class SetPasswordRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    phone: str = None
    is_active: bool
    is_admin: bool
    is_verified: bool = True
    role: str = "user"
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserProfile(UserOut):
    pass


class OwnerRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = None
    company_id: Optional[int] = None


class OwnerOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    company_id: Optional[int] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OwnerSummary(BaseModel):
    owner: OwnerOut
    active_stations: int
    bookings: int
    revenue: float


# ===== COMPANY SCHEMAS =====
class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    country: str
    category: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyOut(CompanyCreate):
    id: int
    views: int = 0
    bookings_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CompanyStats(BaseModel):
    total_views: int
    total_bookings: int
    top_companies: List[dict]
    country_distribution: List[dict]
    charging_type_distribution: List[dict]


# ===== STATION SCHEMAS =====
class StationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    external_id: Optional[str] = None
    location: Optional[str] = None
    company_id: Optional[int] = None
    charging_type: str = "AC"
    operator: Optional[str] = None
    charger_types: Optional[str] = None
    phone: Optional[str] = None
    available_slots: int = 5
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None

class StationOut(StationCreate):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ===== BOOKING SCHEMAS =====
class BookingCreate(BaseModel):
    station_id: int
    company_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    car_number: str
    phone: str
    hours: int

class BookingOut(BookingCreate):
    id: int
    status: str
    user_id: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ===== PAYMENT SCHEMAS =====
class PaymentCreate(BaseModel):
    booking_id: int
    amount: int

class PaymentOut(PaymentCreate):
    id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ===== ANALYTICS SCHEMAS =====
class AnalyticsEvent(BaseModel):
    event_type: str  # 'view', 'booking', 'payment'
    company_id: Optional[int] = None
    station_id: Optional[int] = None
    charging_type: Optional[str] = None
    country: Optional[str] = None

class DashboardStats(BaseModel):
    total_bookings: int
    total_companies: int
    total_views: int
    ac_bookings: int
    dc_bookings: int
    top_companies: List[dict]
    top_stations: List[dict]
    country_distribution: List[dict]


# ===== AUTH RESPONSE =====
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

