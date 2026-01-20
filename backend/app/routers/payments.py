from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import PaymentCreate, PaymentOut
from ..services.payment_service import create_payment

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/success")
def payment_success(data: PaymentCreate):
    return process_payment(data)
