from .database import SessionLocal
from .models import ChargingStation
from datetime import time

db = SessionLocal()

stations = [
    ChargingStation(
        name="EV Station Rajajinagar",
        address="Rajajinagar, Bangalore",
        latitude=12.9916,
        longitude=77.5544,
        min_charge_time=4,
        max_charge_time=9,
        phone="9876500011",
        opening_time=time(6,0),
        closing_time=time(22,0),
        available_slots=4
    ),
    ChargingStation(
        name="EV Station Malleshwaram",
        address="Malleshwaram, Bangalore",
        latitude=13.0033,
        longitude=77.5696,
        min_charge_time=3,
        max_charge_time=7,
        phone="9876500012",
        opening_time=time(7,0),
        closing_time=time(21,0),
        available_slots=5
    ),
    ChargingStation(
        name="EV Station Marathahalli",
        address="Marathahalli, Bangalore",
        latitude=12.9569,
        longitude=77.7011,
        min_charge_time=6,
        max_charge_time=10,
        phone="9876500013",
        opening_time=time(6,30),
        closing_time=time(22,30),
        available_slots=6
    ),
    ChargingStation(
        name="EV Station BTM Layout",
        address="BTM Layout Stage 2, Bangalore",
        latitude=12.9158,
        longitude=77.6101,
        min_charge_time=5,
        max_charge_time=8,
        phone="9876500014",
        opening_time=time(6,0),
        closing_time=time(21,0),
        available_slots=5
    ),
    ChargingStation(
        name="EV Station Bellandur",
        address="Bellandur, Bangalore",
        latitude=12.926,
        longitude=77.6846,
        min_charge_time=7,
        max_charge_time=10,
        phone="9876500015",
        opening_time=time(5,30),
        closing_time=time(22,0),
        available_slots=6
    ),
]

db.add_all(stations)
db.commit()
db.close()

print("✅ Charging stations inserted successfully")
