import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _to_int(name: str, default: int) -> int:
    raw = (os.getenv(name) or "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _to_bool(name: str, default: bool = False) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in {"1", "true", "yes", "on"}


def _resolve_database_url(environment: str, base_dir: Path) -> str:
    database_url = (os.getenv("DATABASE_URL") or "").strip()
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    if environment == "production" and not database_url:
        raise RuntimeError("DATABASE_URL is required in production")

    if not database_url:
        # Deterministic local DB path for development.
        database_url = f"sqlite:///{(base_dir / 'charging.db').as_posix()}"
    return database_url


def _resolve_secret_key(environment: str) -> str:
    secret_key = (os.getenv("SECRET_KEY") or "").strip()
    if environment == "production" and not secret_key:
        raise RuntimeError("SECRET_KEY is required in production")
    if not secret_key:
        # Development fallback only; never used in production.
        secret_key = "dev-only-secret-key"
    return secret_key


BASE_DIR = Path(__file__).resolve().parent.parent
ENVIRONMENT = (os.getenv("ENVIRONMENT") or "development").strip().lower()
SECRET_KEY = _resolve_secret_key(ENVIRONMENT)
DATABASE_URL = _resolve_database_url(ENVIRONMENT, BASE_DIR)
ALGORITHM = (os.getenv("ALGORITHM") or "HS256").strip() or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = _to_int("ACCESS_TOKEN_EXPIRE_MINUTES", 60)


class Settings:
    def __init__(self) -> None:
        self.ENVIRONMENT = ENVIRONMENT
        self.SECRET_KEY = SECRET_KEY
        self.ALGORITHM = ALGORITHM
        self.ACCESS_TOKEN_EXPIRE_MINUTES = ACCESS_TOKEN_EXPIRE_MINUTES
        self.DATABASE_URL = DATABASE_URL
        self.GOOGLE_CLIENT_ID = (os.getenv("GOOGLE_CLIENT_ID") or "").strip()
        self.ENABLE_TEST_OTP_EXPOSURE = _to_bool("ENABLE_TEST_OTP_EXPOSURE", False)
        self.AUTO_BOOTSTRAP_ON_STARTUP = _to_bool("AUTO_BOOTSTRAP_ON_STARTUP", False)
        self.AUTO_APPLY_LEGACY_SCHEMA_PATCHES = _to_bool("AUTO_APPLY_LEGACY_SCHEMA_PATCHES", False)
        self.AUTO_SEED_REFERENCE_DATA = _to_bool("AUTO_SEED_REFERENCE_DATA", False)
        self.AUTO_CREATE_DEFAULT_ADMIN = _to_bool("AUTO_CREATE_DEFAULT_ADMIN", False)

        # Email settings
        self.MAIL_USERNAME = (os.getenv("MAIL_USERNAME") or "").strip()
        self.MAIL_PASSWORD = (os.getenv("MAIL_PASSWORD") or "").strip()
        self.MAIL_FROM = (os.getenv("MAIL_FROM") or "noreply@evsmart.com").strip()
        self.MAIL_PORT = _to_int("MAIL_PORT", 587)
        self.MAIL_SERVER = (os.getenv("MAIL_SERVER") or "smtp.gmail.com").strip()

        # App settings
        self.APP_NAME = "EV Smart Enterprise"
        self.APP_VERSION = "2.0.0"
        self.DEBUG = (os.getenv("DEBUG") or "False").strip().lower() == "true"


settings = Settings()
