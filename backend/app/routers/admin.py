from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    stations = db.query(models.Station).count()
    bookings = db.query(models.Booking).count()
    paid = db.query(models.Booking).filter(models.Booking.status == "paid").count()
    pending = db.query(models.Booking).filter(models.Booking.status == "pending").count()

    return {
        "stations": stations,
        "total_bookings": bookings,
        "paid_bookings": paid,
        "pending_bookings": pending
    }

@router.get("/bookings")
def all_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).all()

@router.get("/payments")
def all_payments(db: Session = Depends(get_db)):
    return db.query(models.Payment).all()

@router.get("/stations")
def all_stations(db: Session = Depends(get_db)):
    return db.query(models.Station).all()
