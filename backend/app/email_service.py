"""
Email Service for OTP Verification
Uses FastMail with Gmail SMTP
"""

import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME or "noreply@evsmart.com")

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=bool(MAIL_USERNAME and MAIL_PASSWORD),
)


def is_email_configured() -> bool:
    """Check if SMTP credentials are configured."""
    username = os.getenv("MAIL_USERNAME", "").strip()
    password = os.getenv("MAIL_PASSWORD", "").strip()
    return bool(username and password)


async def send_otp_email(email: str, otp: str) -> bool:
    """
    Send OTP verification email to user
    
    Args:
        email: Recipient email address
        otp: The OTP code to send
    """
    message = MessageSchema(
        subject="EV Charging - OTP Verification",
        recipients=[email],
        body=f"""
Hello,

Your OTP for EV Charging account verification is:

🔐 {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Thank you,
EV Charging Team
""",
        subtype="plain"
    )

    if not is_email_configured():
        print("[EMAIL WARNING] SMTP is not configured. Skipping email send.")
        return False

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[EMAIL] OTP sent to {email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP to {email}: {e}")
        return False


async def send_security_alert_email(email: str, ip_address: str) -> bool:
    """Send alert when login IP changes."""
    message = MessageSchema(
        subject="EV Charging - Security Alert",
        recipients=[email],
        body=f"""
Hello,

We detected a login from a new IP address:
IP: {ip_address}

If this was not you, please reset your password immediately.

Thank you,
EV Charging Security Team
""",
        subtype="plain"
    )

    if not is_email_configured():
        print(f"[SECURITY ALERT] New IP login for {email}: {ip_address}")
        return False

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[EMAIL] Security alert sent to {email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send security alert to {email}: {e}")
        return False


async def send_invoice_email(email: str, invoice_path: str, invoice_number: str) -> bool:
    """Send invoice PDF to user."""
    message = MessageSchema(
        subject=f"EV Smart Charging - Invoice {invoice_number}",
        recipients=[email],
        body=f"""
Hello,

Thank you for your payment.

Your invoice is attached:
Invoice Number: {invoice_number}

EV Smart Charging Team
""",
        subtype="plain",
        attachments=[invoice_path],
    )

    if not is_email_configured():
        print(f"[INVOICE] Invoice generated for {email}: {invoice_path}")
        return False

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[EMAIL] Invoice sent to {email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send invoice to {email}: {e}")
        return False
