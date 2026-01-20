from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import ChargingStation

router = APIRouter(prefix="/stations", tags=["Stations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ GET ALL STATIONS
@router.get("/")
def list_stations(db: Session = Depends(get_db)):
    return db.query(ChargingStation).all()

# ✅ ADD NEW STATION
@router.post("/")
def add_station(station: dict, db: Session = Depends(get_db)):
    s = ChargingStation(**station)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
