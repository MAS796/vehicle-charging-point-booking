
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import ChargingStation
from ..utils.geo import distance_km
from ..utils.time_utils import is_station_open
from pydantic import BaseModel
from datetime import time

router = APIRouter(tags=["Stations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NearbyRequest(BaseModel):
    lat: float = None
    lon: float = None
    latitude: float = None
    longitude: float = None

class StationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    phone: str
    available_slots: int = 5
    opening_time: time
    closing_time: time

class StationOut(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    phone: str
    available_slots: int
    opening_time: time
    closing_time: time
    is_open: bool = None
    
    class Config:
        from_attributes = True

# ✅ GET ALL STATIONS
@router.get("/", response_model=list[StationOut])
def list_stations(db: Session = Depends(get_db)):
    try:
        stations = db.query(ChargingStation).all()
        result = []
        for s in stations:
            station_data = StationOut(
                id=s.id,
                name=s.name,
                address=s.address,
                latitude=s.latitude,
                longitude=s.longitude,
                phone=s.phone,
                available_slots=s.available_slots,
                opening_time=s.opening_time,
                closing_time=s.closing_time,
                is_open=is_station_open(s.opening_time, s.closing_time)
            )
            result.append(station_data)
        return result
    except Exception as e:
        print(f"Error fetching stations: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching stations: {str(e)}")

# ✅ FIND NEARBY STATIONS (must be before /{station_id} to avoid path conflict)
@router.post("/nearby", response_model=list[dict])
def nearby_stations(request: NearbyRequest, db: Session = Depends(get_db)):
    try:
        # Accept both lat/lon and latitude/longitude parameter names
        user_lat = request.latitude if request.latitude is not None else request.lat
        user_lon = request.longitude if request.longitude is not None else request.lon
        
        if user_lat is None or user_lon is None:
            raise HTTPException(status_code=400, detail="latitude/longitude or lat/lon required")
        
        stations = db.query(ChargingStation).all()
        nearby = []
        
        for station in stations:
            if station.latitude and station.longitude:
                dist = distance_km(user_lat, user_lon, station.latitude, station.longitude)
                if dist <= 10:  # Within 10 km
                    station_dict = {
                        "id": station.id,
                        "name": station.name,
                        "address": station.address,
                        "latitude": station.latitude,
                        "longitude": station.longitude,
                        "distance": dist,
                        "available_slots": station.available_slots,
                        "phone": station.phone
                    }
                    nearby.append(station_dict)
        
        return sorted(nearby, key=lambda x: x["distance"])
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error finding nearby stations: {e}")
        raise HTTPException(status_code=500, detail=f"Error finding nearby stations: {str(e)}")

# ✅ GET STATION BY ID
@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    try:
        station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        return StationOut(
            id=station.id,
            name=station.name,
            address=station.address,
            latitude=station.latitude,
            longitude=station.longitude,
            phone=station.phone,
            available_slots=station.available_slots,
            opening_time=station.opening_time,
            closing_time=station.closing_time,
            is_open=is_station_open(station.opening_time, station.closing_time)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching station: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching station: {str(e)}")

# ✅ ADD NEW STATION (Admin only)
@router.post("/", response_model=StationOut)
def add_station(station: StationCreate, db: Session = Depends(get_db)):
    try:
        # Validate that opening_time and closing_time are provided
        if not station.opening_time or not station.closing_time:
            raise HTTPException(status_code=400, detail="opening_time and closing_time are required")
        
        new_station = ChargingStation(
            name=station.name,
            address=station.address,
            latitude=station.latitude,
            longitude=station.longitude,
            phone=station.phone,
            available_slots=station.available_slots,
            opening_time=station.opening_time,
            closing_time=station.closing_time
        )
        db.add(new_station)
        db.commit()
        db.refresh(new_station)
        
        return StationOut(
            id=new_station.id,
            name=new_station.name,
            address=new_station.address,
            latitude=new_station.latitude,
            longitude=new_station.longitude,
            phone=new_station.phone,
            available_slots=new_station.available_slots,
            opening_time=new_station.opening_time,
            closing_time=new_station.closing_time
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error adding station: {e}")
        raise HTTPException(status_code=400, detail=f"Error adding station: {str(e)}")
