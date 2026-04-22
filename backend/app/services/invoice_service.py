from __future__ import annotations

import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


INVOICE_DIR = os.getenv("INVOICE_DIR", "invoices")


def ensure_invoice_dir() -> str:
    os.makedirs(INVOICE_DIR, exist_ok=True)
    return INVOICE_DIR


def generate_invoice_pdf(*, booking, payment, user_email: str | None) -> tuple[str, str]:
    """
    Generates an invoice PDF and returns (invoice_number, file_path).
    booking/payment are SQLAlchemy objects; we only read basic fields.
    """
    ensure_invoice_dir()
    invoice_number = f"INV-{booking.id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    file_path = os.path.join(INVOICE_DIR, f"{invoice_number}.pdf")

    c = canvas.Canvas(file_path, pagesize=A4)
    c.setTitle(f"Invoice {invoice_number}")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 800, "EV Smart Charging - Invoice")

    c.setFont("Helvetica", 11)
    c.drawString(50, 770, f"Invoice Number: {invoice_number}")
    c.drawString(50, 752, f"Booking ID: {booking.id}")
    c.drawString(50, 734, f"Payment ID: {payment.id}")
    c.drawString(50, 716, f"Provider: {getattr(payment, 'provider', 'manual')}")
    c.drawString(50, 698, f"Date: {datetime.utcnow().strftime('%d-%m-%Y %H:%M UTC')}")

    y = 670
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Customer")
    y -= 18
    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Email: {user_email or 'N/A'}")
    y -= 24

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Payment Summary")
    y -= 18
    c.setFont("Helvetica", 11)
    amount = getattr(payment, "amount", 0) or 0
    wallet_used = getattr(payment, "wallet_used", 0) or 0
    c.drawString(50, y, f"Amount (INR): {amount}")
    y -= 18
    if wallet_used:
        c.drawString(50, y, f"Wallet Used (INR): {wallet_used}")
        y -= 18
    c.drawString(50, y, f"Status: {getattr(payment, 'status', 'created')}")

    c.showPage()
    c.save()

    return invoice_number, file_path

