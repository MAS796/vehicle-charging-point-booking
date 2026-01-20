from sqlalchemy import Column, Integer, String, Float, Time, Date, DateTime, ForeignKey, Boolean
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    min_charge_time = Column(Integer)
    max_charge_time = Column(Integer)
    phone = Column(String)
    opening_time = Column(Time)
    closing_time = Column(Time)
    available_slots = Column(Integer, default=0)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    phone = Column(String)
    car_number = Column(String)
    station_id = Column(Integer, ForeignKey("charging_stations.id"))
    booking_start_time = Column(Time)
    hours = Column(Integer)
    amount = Column(Integer)
    status = Column(String, default="pending")
    date = Column(Date)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    phone = Column(String)
    car_number = Column(String)
    amount = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
