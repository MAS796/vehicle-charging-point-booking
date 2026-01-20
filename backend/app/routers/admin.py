from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from pydantic import BaseModel

router = APIRouter(tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_admin(user_id: int = None, db: Session = Depends(get_db)):
    """Verify if user is admin"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user

class StationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    phone: str = None
    available_slots: int = 5

@router.get("/stats")
def get_stats(user_id: int = None, db: Session = Depends(get_db)):
    """Get admin dashboard statistics"""
    verify_admin(user_id, db)
    stations_count = db.query(models.ChargingStation).count()
    bookings_count = db.query(models.Booking).count()
    confirmed = db.query(models.Booking).filter(models.Booking.status == "confirmed").count()
    pending = db.query(models.Booking).filter(models.Booking.status == "pending").count()

    return {
        "total_stations": stations_count,
        "total_bookings": bookings_count,
        "confirmed_bookings": confirmed,
        "pending_bookings": pending
    }

@router.get("/bookings")
def all_bookings(user_id: int = None, db: Session = Depends(get_db)):
    """Get all bookings"""
    verify_admin(user_id, db)
    bookings = db.query(models.Booking).all()
    return bookings

@router.put("/bookings/{booking_id}")
def update_booking_status(booking_id: int, status: str, user_id: int = None, db: Session = Depends(get_db)):
    """Update booking status"""
    verify_admin(user_id, db)
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if booking:
        booking.status = status
        db.commit()
        db.refresh(booking)
        return booking
    return {"error": "Booking not found"}

@router.get("/payments")
def all_payments(user_id: int = None, db: Session = Depends(get_db)):
    """Get all payments"""
    verify_admin(user_id, db)
    return db.query(models.Payment).all()

@router.get("/stations")
def all_stations(user_id: int = None, db: Session = Depends(get_db)):
    """Get all stations"""
    verify_admin(user_id, db)
    return db.query(models.ChargingStation).all()

@router.post("/stations")
def create_station(station: StationCreate, user_id: int = None, db: Session = Depends(get_db)):
    """Create a new charging station"""
    verify_admin(user_id, db)
    new_station = models.ChargingStation(
        name=station.name,
        address=station.address,
        latitude=station.latitude,
        longitude=station.longitude,
        phone=station.phone,
        available_slots=station.available_slots
    )
    db.add(new_station)
    db.commit()
    db.refresh(new_station)
    return new_station

@router.delete("/stations/{station_id}")
def delete_station(station_id: int, user_id: int = None, db: Session = Depends(get_db)):
    """Delete a charging station"""
    verify_admin(user_id, db)
    station = db.query(models.ChargingStation).filter(models.ChargingStation.id == station_id).first()
    if station:
        db.delete(station)
        db.commit()
        return {"status": "success", "message": "Station deleted"}
    return {"error": "Station not found"}
