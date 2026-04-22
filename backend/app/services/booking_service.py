from sqlalchemy.orm import Session
from .. import models
from ..utils.datetime_utils import utc_now

RATE_PER_HOUR_RUPEES = 60

def create_booking(db: Session, data):
    payload = data.model_dump()
    booking = models.Booking(**payload)

    # Server-side computed fields (keeps payments consistent and avoids relying on frontend).
    try:
        booking.amount = int(payload.get("hours") or 0) * RATE_PER_HOUR_RUPEES
    except Exception:
        booking.amount = 0
    if not booking.date:
        booking.date = utc_now().date()
    if not booking.booking_start_time:
        booking.booking_start_time = utc_now().time().replace(microsecond=0)

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def get_bookings(db: Session):
    return db.query(models.Booking).all()
