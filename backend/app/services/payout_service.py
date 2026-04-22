from __future__ import annotations

from sqlalchemy.orm import Session

from .. import models
from ..services.payment_service import _razorpay_client


def _compute_split(amount_rupees: int, platform_fee_bps: int) -> tuple[int, int]:
    """
    Returns (platform_fee_rupees, owner_amount_rupees).
    bps = basis points, 1500 = 15.00%
    """
    amount_rupees = int(amount_rupees)
    bps = max(0, min(int(platform_fee_bps or 0), 10000))
    platform_fee = (amount_rupees * bps) // 10000
    owner_amount = max(amount_rupees - platform_fee, 0)
    return platform_fee, owner_amount


def create_owner_transfer(
    *,
    db: Session,
    payment: models.Payment,
    company: models.Company,
) -> dict:
    """
    Creates a Razorpay Route transfer to the station owner linked account.
    Requires payment.provider_payment_id (rzp payment id) and company.razorpay_account_id.
    """
    if payment.provider != "razorpay":
        raise ValueError("Split payout supported only for Razorpay payments")
    if not payment.provider_payment_id:
        raise ValueError("Missing provider_payment_id; payment must be captured first")
    if not company.razorpay_account_id:
        raise ValueError("Company missing razorpay_account_id")

    platform_fee, owner_amount = _compute_split(int(payment.amount or 0), int(company.platform_fee_bps or 0))
    if owner_amount <= 0:
        raise ValueError("Owner amount is zero; check platform fee configuration")

    client = _razorpay_client()
    payload = {
        "transfers": [
            {
                "account": company.razorpay_account_id,
                "amount": int(owner_amount) * 100,  # paise
                "currency": "INR",
                "notes": {
                    "booking_id": str(payment.booking_id),
                    "payment_id": str(payment.id),
                },
            }
        ]
    }

    # Razorpay python SDK supports payment.transfer(payment_id, payload)
    if hasattr(client, "payment") and hasattr(client.payment, "transfer"):
        resp = client.payment.transfer(payment.provider_payment_id, payload)
    else:
        # Fallback to raw request if SDK changes.
        resp = client._post(f"/payments/{payment.provider_payment_id}/transfers", payload)  # type: ignore[attr-defined]

    payment.payout_status = "transferred"
    payment.platform_fee = int(platform_fee)
    payment.owner_amount = int(owner_amount)
    # Store first transfer id if present
    try:
        transfers = resp.get("transfers") if isinstance(resp, dict) else None
        if transfers and isinstance(transfers, list) and transfers[0].get("id"):
            payment.payout_transfer_id = transfers[0]["id"]
    except Exception:
        pass

    return resp

