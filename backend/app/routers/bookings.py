from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import BookingCreate, BookingOut
from ..services.booking_service import create_booking, get_bookings
from .. import models

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BookingOut)
def book(data: BookingCreate, db: Session = Depends(get_db)):
    try:
        # Validate station exists
        station = db.query(models.ChargingStation).filter(
            models.ChargingStation.id == data.station_id
        ).first()
        
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        
        if station.available_slots <= 0:
            raise HTTPException(status_code=409, detail="No slots available at this station")
        
        # Create booking
        booking = create_booking(db, data)
        
        # Decrease available slots
        station.available_slots -= 1
        db.commit()
        
        return booking
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating booking: {e}")
        raise HTTPException(status_code=400, detail=f"Error creating booking: {str(e)}")

@router.get("/", response_model=list[BookingOut])
def list_all(db: Session = Depends(get_db)):
    try:
        return get_bookings(db)
    except Exception as e:
        print(f"Error fetching bookings: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")
