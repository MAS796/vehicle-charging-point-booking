import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import PaymentCreate, PaymentOut
from ..services.payment_service import create_payment, razorpay_create_order, razorpay_verify_signature
from ..services.invoice_service import generate_invoice_pdf
from ..services.refund_service import initiate_refund
from ..services.payout_service import create_owner_transfer
from ..services.revenue_service import calculate_split
from ..services.translation_service import translate
from .. import models
from pydantic import BaseModel
from ..dependencies import get_current_admin, get_current_user
from ..permission_guard import require_permission
from ..zero_trust import zero_trust_guard
from ..email_service import send_invoice_email

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


class CreateOrderRequest(BaseModel):
    booking_id: int
    amount: int | None = None  # rupees (optional; backend can use booking.amount)


class VerifyPaymentRequest(BaseModel):
    booking_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class RefundRequest(BaseModel):
    payment_id: int
    amount: int | None = None  # rupees
    reason: str | None = None


class SettlementRequest(BaseModel):
    amount: float
    # Supports either fraction form (0.15) or percent form (15).
    platform_fee_percent: float | None = 0.15


@router.post("/settlement")
def settlement(data: SettlementRequest):
    try:
        fee_percent = data.platform_fee_percent if data.platform_fee_percent is not None else 0.15
        if fee_percent > 1:
            fee_percent = fee_percent / 100.0
        split = calculate_split(float(data.amount), float(fee_percent))
        return {
            "amount": round(float(data.amount), 2),
            **split,
        }
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/process")
def process_payment(data: PaymentRequest, request: Request, db: Session = Depends(get_db)):
    """Process payment for a booking"""
    lang = request.headers.get("X-Language", "en")
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
        return {
            "status": "success",
            "payment_id": payment.id,
            "message": translate("payment_success", lang)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/create-order")
def create_order(data: CreateOrderRequest, request: Request, db: Session = Depends(get_db)):
    """
    Real Razorpay flow: create order using secret key on backend.
    Frontend should never see RAZORPAY_KEY_SECRET.
    """
    lang = request.headers.get("X-Language", "en")
    booking = db.query(models.Booking).filter(models.Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    amount_rupees = booking.amount if booking.amount else data.amount
    if not amount_rupees or int(amount_rupees) <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid amount")

    try:
        order = razorpay_create_order(amount_in_inr=int(amount_rupees), booking_id=booking.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    # Create (or reuse) a pending payment record for this order
    payment = (
        db.query(models.Payment)
        .filter(models.Payment.provider == "razorpay", models.Payment.provider_order_id == order.get("id"))
        .first()
    )
    if not payment:
        payment = models.Payment(
            user_id=booking.user_id,
            booking_id=booking.id,
            phone=getattr(booking, "phone", None) or "",
            car_number=getattr(booking, "car_number", None) or "",
            amount=int(amount_rupees),
            status="created",
            provider="razorpay",
            provider_order_id=order.get("id"),
        )
        db.add(payment)

    # Optional: mark booking in pending state
    if booking.status in (None, "", "pending"):
        booking.status = "payment_pending"

    db.commit()

    return {
        "id": order.get("id"),
        "amount": order.get("amount"),  # paise
        "currency": order.get("currency"),
        "receipt": order.get("receipt"),
        "booking_id": booking.id,
    }


@router.post("/verify")
async def verify_payment(data: VerifyPaymentRequest, request: Request, db: Session = Depends(get_db)):
    """Verify Razorpay signature, then mark booking as paid."""
    try:
        razorpay_verify_signature(
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=data.razorpay_payment_id,
            razorpay_signature=data.razorpay_signature,
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed")

    booking = db.query(models.Booking).filter(models.Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    payment = (
        db.query(models.Payment)
        .filter(models.Payment.provider == "razorpay", models.Payment.provider_order_id == data.razorpay_order_id)
        .order_by(models.Payment.timestamp.desc())
        .first()
    )
    if not payment:
        payment = models.Payment(
            user_id=booking.user_id,
            booking_id=booking.id,
            phone=getattr(booking, "phone", None) or "",
            car_number=getattr(booking, "car_number", None) or "",
            amount=int(booking.amount or 0),
            provider="razorpay",
            provider_order_id=data.razorpay_order_id,
        )
        db.add(payment)

    # Idempotency: if already marked paid, return success
    payment.provider_payment_id = data.razorpay_payment_id
    payment.provider_signature = data.razorpay_signature
    payment.status = "paid"
    booking.status = "paid"

    # Split payout to station owner (if configured). Never fail payment if transfer fails.
    try:
        company_id = getattr(booking, "company_id", None)
        if not company_id:
            station = db.query(models.ChargingStation).filter(models.ChargingStation.id == booking.station_id).first()
            company_id = station.company_id if station else None
        if company_id:
            company = db.query(models.Company).filter(models.Company.id == company_id).first()
            if company and company.razorpay_account_id and not payment.payout_transfer_id:
                payment.payout_status = "pending"
                db.commit()
                create_owner_transfer(db=db, payment=payment, company=company)
    except Exception as e:
        payment.payout_status = "failed"
        print(f"[PAYOUT ERROR] {e}")

    # Generate invoice PDF after successful verification
    try:
        user_email = None
        if booking.user_id:
            user = db.query(models.User).filter(models.User.id == booking.user_id).first()
            user_email = user.email if user else None
        invoice_number, invoice_path = generate_invoice_pdf(booking=booking, payment=payment, user_email=user_email)
        payment.invoice_number = invoice_number
        payment.invoice_path = invoice_path
        if user_email:
            await send_invoice_email(user_email, invoice_path, invoice_number)
    except Exception as e:
        # Don’t fail payment if invoice generation/email fails.
        print(f"[INVOICE ERROR] {e}")

    db.commit()

    return {"status": "Payment verified", "booking_id": booking.id, "payment_id": payment.id}


@router.get("/{payment_id}/invoice")
def download_invoice(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    # Owner or admin can download
    if not current_user.is_admin and payment.user_id and payment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if not payment.invoice_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not available")

    return FileResponse(payment.invoice_path, filename=os.path.basename(payment.invoice_path), media_type="application/pdf")


@router.post("/refund")
def refund_payment(
    data: RefundRequest,
    request: Request,
    _admin: models.User = Depends(require_permission("manage_bookings")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(models.Payment.id == data.payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    if payment.status != "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only paid payments can be refunded")

    try:
        refund = initiate_refund(db=db, payment=payment, amount_rupees=data.amount, reason=data.reason)
        payment.status = "refunded"
        booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
        if booking:
            booking.status = "refunded"
        db.commit()
        return {
            "status": "refund_initiated",
            "refund_id": refund.id,
            "provider_refund_id": refund.provider_refund_id,
            "provider_status": refund.status,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook is the production source of truth. Verify signature using RAZORPAY_WEBHOOK_SECRET.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    if not secret:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Webhook secret not configured")

    try:
        import razorpay  # type: ignore
        client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID", ""), os.getenv("RAZORPAY_KEY_SECRET", "")))
        client.utility.verify_webhook_signature(body, signature, secret)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON")

    event = payload.get("event")
    entity = (payload.get("payload") or {}).get("payment", {}).get("entity") or {}

    rzp_payment_id = entity.get("id")
    rzp_order_id = entity.get("order_id")
    status_str = entity.get("status")

    if not rzp_order_id and not rzp_payment_id:
        return {"status": "ignored"}

    payment = None
    if rzp_order_id:
        payment = (
            db.query(models.Payment)
            .filter(models.Payment.provider == "razorpay", models.Payment.provider_order_id == rzp_order_id)
            .order_by(models.Payment.timestamp.desc())
            .first()
        )
    if not payment and rzp_payment_id:
        payment = (
            db.query(models.Payment)
            .filter(models.Payment.provider == "razorpay", models.Payment.provider_payment_id == rzp_payment_id)
            .order_by(models.Payment.timestamp.desc())
            .first()
        )

    if not payment:
        return {"status": "ignored"}

    # Update based on webhook event/status (minimal set)
    if event == "payment.captured" or status_str == "captured":
        payment.status = "paid"
        payment.provider_payment_id = payment.provider_payment_id or rzp_payment_id
        booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
        if booking:
            booking.status = "paid"
    elif event in ("payment.failed",) or status_str == "failed":
        payment.status = "failed"
        booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
        if booking and booking.status != "paid":
            booking.status = "payment_failed"

    db.commit()
    return {"status": "ok"}

@router.get("/{payment_id}")
def get_payment(payment_id: int, request: Request, db: Session = Depends(get_db)):
    """Get payment details"""
    lang = request.headers.get("X-Language", "en")
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        return {"error": translate("payment_not_found", lang)}
    return payment

@router.post("/settlement")
def settlement(amount: float = 0):
    """Calculate revenue split between platform and station owner."""
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")
    return calculate_split(amount)


@router.post("/success")
def payment_success(data: PaymentRequest, request: Request, db: Session = Depends(get_db)):
    """Success callback for payment"""
    return process_payment(data, request, db)
