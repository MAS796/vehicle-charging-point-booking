from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import BookingCreate, BookingOut
from ..services.booking_service import create_booking, get_bookings
from ..services.translation_service import translate
from .. import models

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BookingOut)
def book(data: BookingCreate, request: Request, db: Session = Depends(get_db)):
    try:
        lang = request.headers.get("X-Language", "en")
        # Validate station exists
        station = db.query(models.ChargingStation).filter(
            models.ChargingStation.id == data.station_id
        ).first()
        
        if not station:
            raise HTTPException(status_code=404, detail=translate("station_not_found", lang))
        
        if station.available_slots <= 0:
            raise HTTPException(status_code=409, detail=translate("no_slots_available", lang))
        
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
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[BookingOut])
def list_all(db: Session = Depends(get_db)):
    try:
        return get_bookings(db)
    except Exception as e:
        print(f"Error fetching bookings: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching bookings: {str(e)}")
