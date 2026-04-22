import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ENVIRONMENT, settings
from .rate_limiter import (
    HAS_SLOWAPI,
    RateLimitExceeded,
    SlowAPIMiddleware,
    _rate_limit_exceeded_handler,
    limiter,
)
from .routers import admin, analytics, auth, bookings, companies, owners, payments, stations
from .routers import ai, dashboard, energy, pricing, testimonials
from .routers import soc
from .routers import wallet
from .websocket_manager import websocket_router

app = FastAPI(
    title="EV Smart Charging Enterprise API",
    description="Production-grade EV charging platform with AI optimization",
)

if settings.AUTO_BOOTSTRAP_ON_STARTUP:
    if ENVIRONMENT == "production":
        raise RuntimeError("AUTO_BOOTSTRAP_ON_STARTUP must remain disabled in production.")
    raise RuntimeError(
        "Startup database bootstrap has been disabled in app startup. "
        "Run `python -m app.create_db` or dedicated migration/seed commands instead."
    )

# CORS: prefer explicit origins, fall back to safe local defaults only in development.
local_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
allowed_origins = (os.getenv("CORS_ALLOWED_ORIGINS") or "").strip()
frontend_url = (os.getenv("FRONTEND_URL") or "").strip()


def _is_local_origin(origin: str) -> bool:
    lowered = origin.lower()
    return "localhost" in lowered or "127.0.0.1" in lowered or "0.0.0.0" in lowered


def _is_insecure_origin(origin: str) -> bool:
    return origin.lower().startswith("http://")


if allowed_origins:
    origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
elif frontend_url:
    origins = [frontend_url]
elif ENVIRONMENT == "production":
    raise RuntimeError("CORS_ALLOWED_ORIGINS or FRONTEND_URL is required in production.")
else:
    origins = list(local_origins)

origins = list(dict.fromkeys(origins))

if ENVIRONMENT == "production":
    local_in_production = [origin for origin in origins if _is_local_origin(origin)]
    if local_in_production:
        raise RuntimeError(
            f"Invalid CORS origins for production (localhost is not allowed): {local_in_production}"
        )

    insecure_in_production = [origin for origin in origins if _is_insecure_origin(origin)]
    if insecure_in_production:
        raise RuntimeError(
            f"Invalid CORS origins for production (HTTPS required): {insecure_in_production}"
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Language",
        "X-Device-ID",
        "x-device-name",
        "X-Test-Mode",
    ],
)

if HAS_SLOWAPI:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(bookings.router, tags=["Bookings"])
app.include_router(stations.router, prefix="/stations", tags=["Stations"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(analytics.router)
app.include_router(companies.router)
app.include_router(owners.router, prefix="/owners", tags=["Owners"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(soc.router)
app.include_router(wallet.router)

app.include_router(ai.router, prefix="/ai", tags=["AI & Prediction"])
app.include_router(energy.router, prefix="/energy", tags=["Energy & Sustainability"])
app.include_router(testimonials.router, prefix="/testimonials", tags=["Testimonials"])
app.include_router(pricing.router, prefix="/pricing", tags=["Pricing"])

app.include_router(websocket_router)


@app.get("/")
def root():
    return {
        "message": "EV Smart Charging API Running",
        "status": ENVIRONMENT,
        "version": "2.0.0",
        "features": [
            "Real-time booking",
            "AI charging optimization",
            "Live energy tracking",
            "WebSocket live updates",
            "Enterprise analytics",
        ],
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ev-smart-charging"}
