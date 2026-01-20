from sqlalchemy.orm import Session
from .. import models

def create_booking(db: Session, data):
    booking = models.Booking(**data.dict())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def get_bookings(db: Session):
    return db.query(models.Booking).all()
