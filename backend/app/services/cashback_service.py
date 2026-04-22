from __future__ import annotations

import os
from datetime import datetime
from sqlalchemy.orm import Session

from .. import models
from .ledger_service import add_entry


FIRST_BOOKING_CASHBACK_PERCENT = float(os.getenv("FIRST_BOOKING_CASHBACK_PERCENT", "10"))  # 10%
MAX_CASHBACK_RUPEES = int(os.getenv("MAX_CASHBACK_RUPEES", "100"))


def apply_first_booking_cashback(*, db: Session, user_id: int, payment: models.Payment) -> int:
    """
    Credits wallet for first successful paid payment only.
    Returns cashback rupees credited (0 if not applied).
    """
    if not user_id:
        return 0

    if FIRST_BOOKING_CASHBACK_PERCENT <= 0:
        return 0

    # If there exists another paid payment for this user, do not apply
    already = (
        db.query(models.Payment)
        .filter(
            models.Payment.user_id == user_id,
            models.Payment.status == "paid",
            models.Payment.id != payment.id,
        )
        .first()
    )
    if already:
        return 0

    amount = int(payment.amount or 0)
    cashback = int((amount * FIRST_BOOKING_CASHBACK_PERCENT) / 100.0)
    cashback = max(0, min(cashback, MAX_CASHBACK_RUPEES))
    if cashback <= 0:
        return 0

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()
    if not wallet:
        wallet = models.Wallet(user_id=user_id, balance=0, updated_at=datetime.utcnow())
        db.add(wallet)
        db.flush()

    wallet.balance = int(wallet.balance or 0) + cashback
    wallet.updated_at = datetime.utcnow()

    add_entry(
        db=db,
        user_id=user_id,
        booking_id=None,
        payment_id=payment.id,
        entry_type="credit",
        amount_rupees=cashback,
        description="Promotional Cashback",
    )

    return cashback

