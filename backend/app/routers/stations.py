from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import ChargingStation
from app.utils.geo import distance_km
from pydantic import BaseModel

router = APIRouter(tags=["Stations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NearbyRequest(BaseModel):
    lat: float
    lon: float

# ✅ GET ALL STATIONS
@router.get("/")
def list_stations(db: Session = Depends(get_db)):
    return db.query(ChargingStation).all()

# ✅ FIND NEARBY STATIONS (must be before /{station_id} to avoid path conflict)
@router.post("/nearby")
def nearby_stations(request: NearbyRequest, db: Session = Depends(get_db)):
    stations = db.query(ChargingStation).all()
    nearby = []
    
    for station in stations:
        if station.latitude and station.longitude:
            dist = distance_km(request.lat, request.lon, station.latitude, station.longitude)
            if dist <= 10:  # Within 10 km
                station_dict = {
                    "id": station.id,
                    "name": station.name,
                    "address": station.address,
                    "latitude": station.latitude,
                    "longitude": station.longitude,
                    "distance": dist,
                    "available_slots": station.available_slots
                }
                nearby.append(station_dict)
    
    return sorted(nearby, key=lambda x: x["distance"])

# ✅ GET STATION BY ID
@router.get("/{station_id}")
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
    if not station:
        return {"error": "Station not found"}
    return station

# ✅ ADD NEW STATION
@router.post("/")
def add_station(station: dict, db: Session = Depends(get_db)):
    s = ChargingStation(**station)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
