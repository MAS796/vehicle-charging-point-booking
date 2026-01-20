from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ IMPORT DB & MODELS
from app.database import Base, engine
from app import models

# ✅ IMPORT ROUTERS
from app.routers import bookings, stations, payments, admin

# ✅ CREATE APP
app = FastAPI(title="Vehicle Charging Point Booking API")

# ✅ CREATE TABLES (RUNS ON STARTUP)
Base.metadata.create_all(bind=engine)

# ✅ ADD CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUDE ROUTERS
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(stations.router, prefix="/stations", tags=["Stations"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

# ✅ ROOT TEST
@app.get("/")
def root():
    return {"message": "Backend is running successfully"}
