"""
Email Service for OTP Verification
Uses FastMail with Gmail SMTP
"""

import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)


async def send_otp_email(email: str, otp: str):
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

    fm = FastMail(conf)
    await fm.send_message(message)
    print(f"[EMAIL] OTP sent to {email}")
