"""
OTP Service - Generates and validates OTPs for user registration
"""
import random
from datetime import datetime, timedelta


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))


def get_otp_expiry() -> datetime:
    """Get OTP expiry time (10 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=10)


def is_otp_expired(expiry_time: datetime) -> bool:
    """Check if OTP has expired"""
    if not expiry_time:
        return True
    return datetime.utcnow() > expiry_time


def send_otp_email(email: str, otp: str) -> bool:
    """
    Send OTP via email (placeholder - integrate with email service)
    In production, use SendGrid, AWS SES, or similar service
    """
    print(f"[EMAIL] Sending OTP {otp} to {email}")
    # TODO: Integrate with actual email service
    return True


def send_otp_sms(phone: str, otp: str) -> bool:
    """
    Send OTP via SMS (placeholder - integrate with SMS service)
    In production, use Twilio, AWS SNS, or similar service
    """
    print(f"[SMS] Sending OTP {otp} to {phone}")
    # TODO: Integrate with actual SMS service
    return True
