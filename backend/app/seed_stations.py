"""
Seed script to add multiple charging stations to the database.
Run once after backend starts: python -c "from app.seed_stations import seed_stations; seed_stations()"
"""

from .database import SessionLocal
from .models import ChargingStation
from datetime import time

def seed_stations():
    db = SessionLocal()
    
    # Check if stations already exist
    count = db.query(ChargingStation).count()
    if count > 0:
        print(f"[OK] {count} stations already exist. Skipping seed.")
        db.close()
        return
    
    stations = [
        ChargingStation(
            name="EV Station Rajajinagar",
            address="Rajajinagar, Bangalore",
            latitude=12.9916,
            longitude=77.5544,
            phone="9876500011",
            available_slots=6,
            opening_time=time(6, 0),
            closing_time=time(22, 0),
        ),
        ChargingStation(
            name="EV Station Malleshwaram",
            address="Malleshwaram, Bangalore",
            latitude=13.0033,
            longitude=77.5696,
            phone="9876500012",
            available_slots=5,
            opening_time=time(7, 0),
            closing_time=time(21, 0),
        ),
        ChargingStation(
            name="EV Station BTM Layout",
            address="BTM Layout Stage 2, Bangalore",
            latitude=12.9158,
            longitude=77.6101,
            phone="9876500014",
            available_slots=4,
            opening_time=time(6, 0),
            closing_time=time(21, 0),
        ),
        ChargingStation(
            name="EV Station HSR Layout",
            address="HSR Layout Sector 1, Bangalore",
            latitude=12.9137,
            longitude=77.6357,
            phone="9876500035",
            available_slots=3,
            opening_time=time(6, 0),
            closing_time=time(21, 0),
        ),
        ChargingStation(
            name="EV Station Electronic City",
            address="Electronic City Phase 1, Bangalore",
            latitude=12.8499,
            longitude=77.6603,
            phone="9876500034",
            available_slots=7,
            opening_time=time(6, 0),
            closing_time=time(22, 30),
        ),
        ChargingStation(
            name="EV Station Whitefield",
            address="Whitefield, Bangalore",
            latitude=12.9698,
            longitude=77.7499,
            phone="9876500036",
            available_slots=5,
            opening_time=time(6, 0),
            closing_time=time(23, 0),
        ),
    ]
    
    try:
        db.add_all(stations)
        db.commit()
        print(f"[SUCCESS] {len(stations)} stations added successfully")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error adding stations: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_stations()
