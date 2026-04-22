from __future__ import annotations

from datetime import datetime
from sqlalchemy.orm import Session

from .. import models
from ..services.payment_service import _razorpay_client


def initiate_refund(
    *,
    db: Session,
    payment: models.Payment,
    amount_rupees: int | None = None,
    reason: str | None = None,
) -> models.Refund:
    if payment.provider != "razorpay":
        raise ValueError("Refunds supported only for Razorpay payments in this implementation")
    if not payment.provider_payment_id:
        raise ValueError("Missing provider_payment_id on payment")

    if amount_rupees is None:
        amount_rupees = int(payment.amount or 0)
    if amount_rupees <= 0:
        raise ValueError("Invalid refund amount")

    client = _razorpay_client()
    payload = {}
    # Razorpay expects amount in paise for partial refund
    payload["amount"] = int(amount_rupees) * 100
    if reason:
        payload["notes"] = {"reason": reason[:250]}

    refund_obj = client.payment.refund(payment.provider_payment_id, payload)

    refund = models.Refund(
        payment_id=payment.id,
        provider="razorpay",
        provider_refund_id=refund_obj.get("id"),
        amount=int(amount_rupees),
        status=str(refund_obj.get("status") or "created"),
        reason=reason,
        created_at=datetime.utcnow(),
    )
    db.add(refund)
    return refund

