from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import PaymentCreate, PaymentOut
from ..services.payment_service import create_payment
from .. import models
from pydantic import BaseModel

router = APIRouter(tags=["Payments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PaymentRequest(BaseModel):
    booking_id: int
    amount: int
    phone: str

@router.post("/process")
def process_payment(data: PaymentRequest, db: Session = Depends(get_db)):
    """Process payment for a booking"""
    try:
        # Create payment record
        payment = models.Payment(
            booking_id=data.booking_id,
            phone=data.phone,
            amount=data.amount,
            car_number=""
        )
        db.add(payment)
        
        # Update booking status to confirmed
        booking = db.query(models.Booking).filter(models.Booking.id == data.booking_id).first()
        if booking:
            booking.status = "confirmed"
        
        db.commit()
        db.refresh(payment)
        return {"status": "success", "payment_id": payment.id, "message": "Payment processed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/{payment_id}")
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get payment details"""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        return {"error": "Payment not found"}
    return payment

@router.post("/success")
def payment_success(data: PaymentRequest, db: Session = Depends(get_db)):
    """Success callback for payment"""
    return process_payment(data, db)
