from sqlalchemy import Column, Integer, String, Float, Time, Date, DateTime, ForeignKey, Boolean, Enum
from .database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    COMPANY = "company"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # Nullable until password is set after OTP
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)  # True after OTP verification
    otp = Column(String, nullable=True)  # Temporary OTP storage
    otp_expires_at = Column(DateTime, nullable=True)  # OTP expiration
    role = Column(String, default=UserRole.USER.value)  # user, admin, company
    created_at = Column(DateTime, default=datetime.utcnow)


class Company(Base):
    """Company/Charging Provider Model"""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)
    country = Column(String, nullable=False)
    category = Column(String, nullable=True)  # e.g., "AC/DC Charger", "EV Solutions"
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    views = Column(Integer, default=0)  # View tracking
    bookings_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    charging_type = Column(String, default="AC")  # AC or DC
    min_charge_time = Column(Integer)
    max_charge_time = Column(Integer)
    phone = Column(String)
    opening_time = Column(Time)
    closing_time = Column(Time)
    available_slots = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)  # Track which company
    phone = Column(String)
    car_number = Column(String)
    station_id = Column(Integer, ForeignKey("charging_stations.id"))
    booking_start_time = Column(Time)
    hours = Column(Integer)
    amount = Column(Integer)
    status = Column(String, default="pending")
    date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)


class Analytics(Base):
    """Store analytics data for dashboard"""
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=True)
    event_type = Column(String)  # 'view', 'booking', 'payment'
    charging_type = Column(String, nullable=True)  # 'AC' or 'DC'
    country = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    phone = Column(String)
    car_number = Column(String)
    amount = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)


