from sqlalchemy.orm import Session
from .. import models

def create_payment(db: Session, data):
    payment = models.Payment(**data.dict())
    booking = db.query(models.Booking).get(data.booking_id)
    if booking:
        booking.status = "paid"
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
