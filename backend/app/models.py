from sqlalchemy import Column, Integer, String, Float, Time, Date, DateTime, ForeignKey, Boolean, Text, UniqueConstraint
from .database import Base
import enum
from .utils.datetime_utils import utc_now

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    COMPANY = "company"
    STATION_OWNER = "station_owner"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # Nullable until password is set after OTP
    is_active = Column(Boolean, default=True)
    is_frozen = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_super_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)  # True after OTP verification
    two_factor_enabled = Column(Boolean, default=False)
    risk_score = Column(Integer, default=0)
    last_ip = Column(String(100), nullable=True)
    otp = Column(String, nullable=True)  # Temporary OTP storage
    otp_expires_at = Column(DateTime, nullable=True)  # OTP expiration
    role = Column(String, default=UserRole.USER.value)  # user, admin, company
    preferred_language = Column(String(10), default="en")
    created_at = Column(DateTime, default=utc_now)


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), index=True, nullable=False)
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    otp_code = Column(String(6), nullable=False)
    purpose = Column(String(20), default="registration")
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(Text, nullable=False, unique=True, index=True)
    device_info = Column(Text, nullable=True)
    is_revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    refresh_token = Column(Text, nullable=False, unique=True, index=True)
    device_name = Column(String(255), nullable=True)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    last_active = Column(DateTime, default=utc_now)


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(Text, nullable=False)
    target = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)
    ip_address = Column(String(100), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=utc_now)


class AdminPermission(Base):
    __tablename__ = "admin_permissions"
    __table_args__ = (
        UniqueConstraint("admin_user_id", "permission", name="uq_admin_permission"),
    )

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    permission = Column(String(50), nullable=False, index=True)
    granted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)


class UserPermission(Base):
    __tablename__ = "user_permissions"
    __table_args__ = (
        UniqueConstraint("user_id", "permission_id", name="uq_user_permission"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False, index=True)


class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ip_address = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=utc_now)


class TwoFactorChallenge(Base):
    __tablename__ = "two_factor_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    challenge_token = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)


class UserDevice(Base):
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    device_id = Column(String(255), nullable=False, index=True)
    device_name = Column(String(255), nullable=True)
    browser = Column(String(120), nullable=True)
    os = Column(String(120), nullable=True)
    user_agent = Column(Text, nullable=True)
    first_ip = Column(String(100), nullable=True)
    last_ip = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    last_active = Column(DateTime, default=utc_now)


class BookingHistory(Base):
    __tablename__ = "booking_history"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=True, index=True)
    hour = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    temperature = Column(Float, nullable=True)
    load = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class Company(Base):
    """Company/Charging Provider Model"""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)
    country = Column(String, nullable=False)
    category = Column(String, nullable=True)  # e.g., "AC/DC Charger", "EV Solutions"
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    razorpay_account_id = Column(String(120), nullable=True, index=True)  # Razorpay Route linked account id (acc_...)
    platform_fee_bps = Column(Integer, default=1500)  # 15.00% in basis points
    views = Column(Integer, default=0)  # View tracking
    bookings_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class StationOwner(Base):
    __tablename__ = "station_owners"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True)
    # Optional provider-side identifier for real-world station catalogs.
    external_id = Column(String(80), nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    address = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    charging_type = Column(String, default="AC")  # AC or DC
    operator = Column(String, nullable=True)
    charger_types = Column(String, nullable=True)
    min_charge_time = Column(Integer)
    max_charge_time = Column(Integer)
    phone = Column(String)
    opening_time = Column(Time)
    closing_time = Column(Time)
    available_slots = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)  # Track which company
    # Customer name captured at booking time (nullable for legacy rows).
    name = Column(String, nullable=True)
    phone = Column(String)
    car_number = Column(String)
    station_id = Column(Integer, ForeignKey("charging_stations.id"))
    booking_start_time = Column(Time)
    hours = Column(Integer)
    amount = Column(Integer)
    status = Column(String, default="pending")
    date = Column(Date)
    created_at = Column(DateTime, default=utc_now)


class Analytics(Base):
    """Store analytics data for dashboard"""
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=True)
    event_type = Column(String)  # 'view', 'booking', 'payment'
    charging_type = Column(String, nullable=True)  # 'AC' or 'DC'
    country = Column(String, nullable=True)
    timestamp = Column(DateTime, default=utc_now)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    phone = Column(String)
    car_number = Column(String)
    amount = Column(Integer)
    status = Column(String, default="created")  # created, paid, failed, refunded
    provider = Column(String, default="manual")  # manual, razorpay
    provider_order_id = Column(String, nullable=True, index=True)
    provider_payment_id = Column(String, nullable=True, index=True)
    provider_signature = Column(String, nullable=True)
    wallet_used = Column(Integer, default=0)  # rupees
    invoice_number = Column(String(60), nullable=True, index=True)
    invoice_path = Column(Text, nullable=True)
    payout_status = Column(String(20), default="none")  # none, pending, transferred, failed
    payout_transfer_id = Column(String(120), nullable=True, index=True)
    platform_fee = Column(Integer, default=0)  # rupees
    owner_amount = Column(Integer, default=0)  # rupees
    fraud_flag = Column(Boolean, default=False)
    fraud_reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    provider = Column(String, default="razorpay")
    provider_refund_id = Column(String, nullable=True, index=True)
    amount = Column(Integer, nullable=False)  # rupees
    status = Column(String, default="created")  # created, processed, failed
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class Wallet(Base):
    __tablename__ = "wallets"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_wallet_user"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    balance = Column(Integer, default=0)  # rupees
    updated_at = Column(DateTime, default=utc_now)


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True, index=True)
    entry_type = Column(String(10), nullable=False)  # credit / debit
    amount = Column(Integer, nullable=False)  # rupees
    currency = Column(String(10), default="INR")
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)
