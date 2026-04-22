from __future__ import annotations

from sqlalchemy.orm import Session

from .. import models


def add_entry(
    *,
    db: Session,
    entry_type: str,
    amount_rupees: int,
    description: str,
    user_id: int | None = None,
    booking_id: int | None = None,
    payment_id: int | None = None,
):
    entry_type = (entry_type or "").strip().lower()
    if entry_type not in {"credit", "debit"}:
        raise ValueError("entry_type must be credit or debit")
    entry = models.LedgerEntry(
        user_id=user_id,
        booking_id=booking_id,
        payment_id=payment_id,
        entry_type=entry_type,
        amount=int(amount_rupees),
        description=description[:255],
    )
    db.add(entry)
    return entry


def record_payment_ledger(
    *,
    db: Session,
    booking: models.Booking,
    payment: models.Payment,
):
    # User payment (debit)
    if booking.user_id:
        add_entry(
            db=db,
            user_id=booking.user_id,
            booking_id=booking.id,
            payment_id=payment.id,
            entry_type="debit",
            amount_rupees=int(payment.amount or 0),
            description="EV Charging Payment",
        )

    # Platform commission (credit) if split configured
    if int(payment.platform_fee or 0) > 0:
        add_entry(
            db=db,
            user_id=None,
            booking_id=booking.id,
            payment_id=payment.id,
            entry_type="credit",
            amount_rupees=int(payment.platform_fee),
            description="Platform Commission",
        )

    # Owner payable (credit to company bucket; user_id is None)
    if int(payment.owner_amount or 0) > 0:
        add_entry(
            db=db,
            user_id=None,
            booking_id=booking.id,
            payment_id=payment.id,
            entry_type="credit",
            amount_rupees=int(payment.owner_amount),
            description="Station Owner Settlement Payable",
        )


def record_refund_ledger(
    *,
    db: Session,
    booking: models.Booking,
    payment: models.Payment,
    amount_rupees: int,
):
    # Refund to user (credit)
    if booking.user_id:
        add_entry(
            db=db,
            user_id=booking.user_id,
            booking_id=booking.id,
            payment_id=payment.id,
            entry_type="credit",
            amount_rupees=int(amount_rupees),
            description="Refund Credit",
        )

    # Platform payout (debit)
    add_entry(
        db=db,
        user_id=None,
        booking_id=booking.id,
        payment_id=payment.id,
        entry_type="debit",
        amount_rupees=int(amount_rupees),
        description="Refund Payout",
    )

