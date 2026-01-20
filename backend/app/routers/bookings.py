from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import BookingCreate, BookingOut
from ..services.booking_service import create_booking, get_bookings

router = APIRouter(tags=["Bookings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BookingOut)
def book(data: BookingCreate, db: Session = Depends(get_db)):
    return create_booking(db, data)

@router.get("/", response_model=list[BookingOut])
def list_all(db: Session = Depends(get_db)):
    return get_bookings(db)
