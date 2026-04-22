from datetime import time

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from .. import models
from ..database import SessionLocal
from ..dependencies import get_current_admin
from ..models import ChargingStation
from ..services.translation_service import translate
from ..utils.geo import distance_km
from ..utils.time_utils import is_station_open

router = APIRouter(tags=["Stations"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class NearbyRequest(BaseModel):
    lat: float | None = None
    lon: float | None = None
    latitude: float | None = None
    longitude: float | None = None


class StationCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    external_id: str | None = None
    location: str | None = None
    operator: str | None = None
    charger_types: str | None = None
    phone: str
    available_slots: int = 5
    opening_time: time
    closing_time: time


class StationOut(BaseModel):
    id: int
    external_id: str | None = None
    name: str
    location: str | None = None
    address: str
    latitude: float
    longitude: float
    operator: str | None = None
    charger_types: str | None = None
    phone: str
    available_slots: int
    opening_time: time
    closing_time: time
    is_open: bool | None = None

    model_config = ConfigDict(from_attributes=True)


def _to_station_out(station: ChargingStation) -> StationOut:
    return StationOut(
        id=station.id,
        external_id=station.external_id,
        name=station.name,
        location=station.location,
        address=station.address,
        latitude=station.latitude,
        longitude=station.longitude,
        operator=station.operator,
        charger_types=station.charger_types,
        phone=station.phone,
        available_slots=station.available_slots,
        opening_time=station.opening_time,
        closing_time=station.closing_time,
        is_open=is_station_open(station.opening_time, station.closing_time),
    )


def _build_nearby_results(user_lat: float, user_lon: float, db: Session) -> list[dict]:
    try:
        stations = db.query(ChargingStation).all()
        nearby = []
        for station in stations:
            if station.latitude and station.longitude:
                dist = distance_km(user_lat, user_lon, station.latitude, station.longitude)
                if dist <= 10:
                    nearby.append(
                        {
                            "id": station.id,
                            "external_id": station.external_id,
                            "name": station.name,
                            "location": station.location,
                            "address": station.address,
                            "latitude": station.latitude,
                            "longitude": station.longitude,
                            "distance": dist,
                            "operator": station.operator,
                            "charger_types": station.charger_types,
                            "available_slots": station.available_slots,
                            "phone": station.phone,
                        }
                    )
        return sorted(nearby, key=lambda x: x["distance"])
    except Exception as exc:
        print(f"Error finding nearby stations: {exc}")
        raise HTTPException(status_code=500, detail=f"Error finding nearby stations: {exc}")


@router.get("/", response_model=list[StationOut])
def list_stations(db: Session = Depends(get_db)):
    try:
        stations = db.query(ChargingStation).all()
        return [_to_station_out(station) for station in stations]
    except Exception as exc:
        print(f"Error fetching stations: {exc}")
        raise HTTPException(status_code=500, detail=f"Error fetching stations: {exc}")


@router.post("/nearby", response_model=list[dict])
def nearby_stations(request: NearbyRequest, db: Session = Depends(get_db)):
    user_lat = request.latitude if request.latitude is not None else request.lat
    user_lon = request.longitude if request.longitude is not None else request.lon
    if user_lat is None or user_lon is None:
        raise HTTPException(status_code=400, detail="latitude/longitude or lat/lon required")
    return _build_nearby_results(user_lat, user_lon, db)


@router.get("/nearby", response_model=list[dict])
def nearby_stations_get(lat: float, lon: float, db: Session = Depends(get_db)):
    return _build_nearby_results(lat, lon, db)


@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: int, request: Request, db: Session = Depends(get_db)):
    try:
        lang = request.headers.get("X-Language", "en")
        station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
        if not station:
            raise HTTPException(status_code=404, detail=translate("station_not_found", lang))
        return _to_station_out(station)
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Error fetching station: {exc}")
        raise HTTPException(status_code=500, detail=f"Error fetching station: {exc}")


@router.post("/", response_model=StationOut)
def add_station(station: StationCreate, db: Session = Depends(get_db)):
    try:
        if not station.opening_time or not station.closing_time:
            raise HTTPException(status_code=400, detail="opening_time and closing_time are required")

        new_station = ChargingStation(
            external_id=station.external_id,
            name=station.name,
            location=station.location,
            address=station.address,
            latitude=station.latitude,
            longitude=station.longitude,
            operator=station.operator,
            charger_types=station.charger_types,
            phone=station.phone,
            available_slots=station.available_slots,
            opening_time=station.opening_time,
            closing_time=station.closing_time,
        )
        db.add(new_station)
        db.commit()
        db.refresh(new_station)
        return _to_station_out(new_station)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print(f"Error adding station: {exc}")
        raise HTTPException(status_code=400, detail=f"Error adding station: {exc}")


@router.delete("/{station_id}")
def delete_station(
    station_id: int,
    _admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    db.delete(station)
    db.commit()
    return {"message": "Station deleted", "station_id": station_id}
