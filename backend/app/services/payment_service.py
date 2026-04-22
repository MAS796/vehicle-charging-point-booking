import os
from sqlalchemy.orm import Session
from .. import models


def create_payment(db: Session, data):
    """Legacy/manual payment creation (kept for backward compatibility)."""
    payment = models.Payment(**data.model_dump())
    payment.provider = "manual"
    payment.status = "paid"
    booking = db.query(models.Booking).get(data.booking_id)
    if booking:
        booking.status = "paid"
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def _razorpay_client():
    try:
        import razorpay  # type: ignore
    except Exception as e:
        raise RuntimeError("razorpay SDK not installed. Run: pip install razorpay") from e

    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise RuntimeError("Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET in environment")

    return razorpay.Client(auth=(key_id, key_secret))


def razorpay_create_order(*, amount_in_inr: int, booking_id: int) -> dict:
    """
    Create a Razorpay order.
    amount_in_inr is integer rupees.
    """
    client = _razorpay_client()
    order = client.order.create(
        {
            "amount": int(amount_in_inr) * 100,  # paise
            "currency": "INR",
            "receipt": f"booking_{booking_id}",
            "payment_capture": 1,
        }
    )
    return order


def razorpay_verify_signature(*, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> None:
    client = _razorpay_client()
    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
    )
