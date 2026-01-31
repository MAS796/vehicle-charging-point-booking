from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORT DB & MODELS
from .database import Base, engine, SessionLocal
from . import models

# IMPORT ROUTERS
from .routers import auth, bookings, stations, payments, admin, analytics, companies

# IMPORT SEED FUNCTIONS
from .seed_stations import seed_stations
from .seed_companies import seed_companies
from .services.auth_service import hash_password

# CREATE APP
app = FastAPI(title="Vehicle Charging Point Booking API")

# CREATE TABLES (RUNS ON STARTUP)
Base.metadata.create_all(bind=engine)

# SEED DEFAULT STATIONS AND COMPANIES
seed_stations()
seed_companies()

# ✅ CREATE DEFAULT ADMIN USER
def create_default_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if not admin:
            new_admin = models.User(
                email="admin@example.com",
                name="Admin User",
                phone="9999999999",
                password_hash=hash_password("admin123"),
                is_admin=True,
                is_active=True,
                is_verified=True  # Admin is pre-verified
            )
            db.add(new_admin)
            db.commit()
            print("[SUCCESS] Default admin created: admin@example.com / admin123")
        else:
            # Ensure existing admin is verified
            if not admin.is_verified:
                admin.is_verified = True
                db.commit()
                print("[SUCCESS] Admin user verified")
    except Exception as e:
        print(f"Admin creation error: {e}")
    finally:
        db.close()

create_default_admin()

# ADD CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Docker deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLUDE ROUTERS
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(stations.router, prefix="/stations", tags=["Stations"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(analytics.router)  # No prefix, routes are /analytics/*
app.include_router(companies.router)  # No prefix, routes are /companies/*

# ✅ ROOT TEST
@app.get("/")
def root():
    return {"message": "Backend is running successfully"}
