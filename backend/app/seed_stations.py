"""
Seed script to add curated metro-city EV stations:
- Bangalore
- Delhi
- Mumbai

Run once after backend starts:
python -c "from app.seed_stations import seed_stations; seed_stations()"
"""

from datetime import time

from .database import SessionLocal
from .models import ChargingStation


STATIONS_BY_CITY = {
    "Bangalore": [
        {
            "external_id": "BLR-TATA-001",
            "name": "Tata Power EV Charging Station - Indiranagar",
            "location": "Indiranagar",
            "address": "100 ft Rd, Indiranagar, Bengaluru, Karnataka 560038",
            "operator": "Tata Power EZ Charge",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 12.9716,
            "longitude": 77.64,
            "phone": "9880001101",
            "available_slots": 4,
            "opening_time": time(6, 0),
            "closing_time": time(23, 0),
        },
        {
            "external_id": "BLR-ATHER-002",
            "name": "Ather Grid Koramangala",
            "location": "Koramangala 5th Block",
            "address": "Koramangala 5th Block, Bengaluru, Karnataka 560095",
            "operator": "Ather Energy",
            "charger_types": "Fast Charging",
            "charging_type": "DC",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "phone": "9880001102",
            "available_slots": 6,
            "opening_time": time(6, 0),
            "closing_time": time(23, 0),
        },
        {
            "external_id": "BLR-BESCOM-003",
            "name": "BESCOM EV Charging Station MG Road",
            "location": "MG Road",
            "address": "MG Road, Bengaluru, Karnataka 560001",
            "operator": "BESCOM",
            "charger_types": "CCS2, CHAdeMO, Type2",
            "charging_type": "DC",
            "latitude": 12.9755,
            "longitude": 77.6068,
            "phone": "9880001103",
            "available_slots": 5,
            "opening_time": time(6, 0),
            "closing_time": time(22, 30),
        },
        {
            "external_id": "BLR-ZEON-004",
            "name": "Zeon Charging Hub - Whitefield",
            "location": "Whitefield",
            "address": "ITPL Main Rd, Whitefield, Bengaluru, Karnataka 560066",
            "operator": "Zeon",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 12.9698,
            "longitude": 77.7499,
            "phone": "9880001104",
            "available_slots": 5,
            "opening_time": time(6, 0),
            "closing_time": time(23, 30),
        },
        {
            "external_id": "BLR-STATIQ-005",
            "name": "Statiq - HSR Layout",
            "location": "HSR Layout",
            "address": "HSR Layout Sector 1, Bengaluru, Karnataka 560102",
            "operator": "Statiq",
            "charger_types": "CCS2, Type2",
            "charging_type": "AC",
            "latitude": 12.9137,
            "longitude": 77.6357,
            "phone": "9880001105",
            "available_slots": 4,
            "opening_time": time(6, 0),
            "closing_time": time(22, 0),
        },
        {
            "external_id": "BLR-CHARGEZONE-006",
            "name": "ChargeZone - Electronic City",
            "location": "Electronic City",
            "address": "Electronic City Phase 1, Bengaluru, Karnataka 560100",
            "operator": "ChargeZone",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 12.8499,
            "longitude": 77.6603,
            "phone": "9880001106",
            "available_slots": 7,
            "opening_time": time(6, 0),
            "closing_time": time(23, 30),
        },
    ],
    "Delhi": [
        {
            "external_id": "DEL-TATA-001",
            "name": "Tata Power EV Hub - Connaught Place",
            "location": "Connaught Place",
            "address": "Connaught Place, New Delhi, Delhi 110001",
            "operator": "Tata Power EZ Charge",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 28.6315,
            "longitude": 77.2167,
            "phone": "9880002101",
            "available_slots": 5,
            "opening_time": time(6, 0),
            "closing_time": time(23, 0),
        },
        {
            "external_id": "DEL-BPCL-002",
            "name": "BPCL EV Fast Charging - Karol Bagh",
            "location": "Karol Bagh",
            "address": "Ajmal Khan Road, Karol Bagh, New Delhi, Delhi 110005",
            "operator": "BPCL",
            "charger_types": "CCS2, CHAdeMO",
            "charging_type": "DC",
            "latitude": 28.6519,
            "longitude": 77.1909,
            "phone": "9880002102",
            "available_slots": 4,
            "opening_time": time(6, 0),
            "closing_time": time(22, 30),
        },
        {
            "external_id": "DEL-STATIQ-003",
            "name": "Statiq - Nehru Place",
            "location": "Nehru Place",
            "address": "Nehru Place, New Delhi, Delhi 110019",
            "operator": "Statiq",
            "charger_types": "CCS2, Type2",
            "charging_type": "AC",
            "latitude": 28.5483,
            "longitude": 77.2511,
            "phone": "9880002103",
            "available_slots": 6,
            "opening_time": time(6, 0),
            "closing_time": time(23, 0),
        },
        {
            "external_id": "DEL-GLIDA-004",
            "name": "GLIDA EV Station - Dwarka Sector 21",
            "location": "Dwarka Sector 21",
            "address": "Dwarka Sector 21, New Delhi, Delhi 110075",
            "operator": "GLIDA",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 28.5562,
            "longitude": 77.0572,
            "phone": "9880002104",
            "available_slots": 5,
            "opening_time": time(6, 0),
            "closing_time": time(23, 30),
        },
        {
            "external_id": "DEL-RELIANCE-005",
            "name": "Reliance EV Point - Saket",
            "location": "Saket",
            "address": "Saket District Centre, New Delhi, Delhi 110017",
            "operator": "Reliance",
            "charger_types": "CCS2, Type2",
            "charging_type": "AC",
            "latitude": 28.5245,
            "longitude": 77.2066,
            "phone": "9880002105",
            "available_slots": 4,
            "opening_time": time(6, 0),
            "closing_time": time(22, 0),
        },
        {
            "external_id": "DEL-EESL-006",
            "name": "EESL Charging Point - Rohini",
            "location": "Rohini Sector 10",
            "address": "Rohini Sector 10, New Delhi, Delhi 110085",
            "operator": "EESL",
            "charger_types": "CCS2, CHAdeMO, Type2",
            "charging_type": "DC",
            "latitude": 28.7183,
            "longitude": 77.1177,
            "phone": "9880002106",
            "available_slots": 7,
            "opening_time": time(6, 0),
            "closing_time": time(23, 30),
        },
    ],
    "Mumbai": [
        {
            "external_id": "MUM-TATA-001",
            "name": "Tata Power EV Charging - Bandra Kurla Complex",
            "location": "BKC",
            "address": "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
            "operator": "Tata Power EZ Charge",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 19.0679,
            "longitude": 72.8698,
            "phone": "9880003101",
            "available_slots": 6,
            "opening_time": time(6, 0),
            "closing_time": time(23, 0),
        },
        {
            "external_id": "MUM-STATIQ-002",
            "name": "Statiq - Andheri East",
            "location": "Andheri East",
            "address": "Marol, Andheri East, Mumbai, Maharashtra 400059",
            "operator": "Statiq",
            "charger_types": "CCS2, Type2",
            "charging_type": "AC",
            "latitude": 19.1187,
            "longitude": 72.8697,
            "phone": "9880003102",
            "available_slots": 4,
            "opening_time": time(6, 0),
            "closing_time": time(22, 30),
        },
        {
            "external_id": "MUM-CHARGEZONE-003",
            "name": "ChargeZone - Powai",
            "location": "Powai",
            "address": "Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076",
            "operator": "ChargeZone",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 19.1176,
            "longitude": 72.906,
            "phone": "9880003103",
            "available_slots": 5,
            "opening_time": time(6, 0),
            "closing_time": time(23, 30),
        },
        {
            "external_id": "MUM-MSEB-004",
            "name": "MSEB EV Station - Dadar",
            "location": "Dadar",
            "address": "Dadar West, Mumbai, Maharashtra 400028",
            "operator": "MSEB",
            "charger_types": "CCS2, CHAdeMO",
            "charging_type": "DC",
            "latitude": 19.0184,
            "longitude": 72.8421,
            "phone": "9880003104",
            "available_slots": 5,
            "opening_time": time(6, 0),
            "closing_time": time(22, 30),
        },
        {
            "external_id": "MUM-ZEON-005",
            "name": "Zeon Fast Charge - Navi Mumbai",
            "location": "Vashi",
            "address": "Vashi, Navi Mumbai, Maharashtra 400703",
            "operator": "Zeon",
            "charger_types": "CCS2, Type2 AC",
            "charging_type": "DC",
            "latitude": 19.0771,
            "longitude": 72.9987,
            "phone": "9880003105",
            "available_slots": 6,
            "opening_time": time(6, 0),
            "closing_time": time(23, 0),
        },
        {
            "external_id": "MUM-BPCL-006",
            "name": "BPCL EV Point - Colaba",
            "location": "Colaba",
            "address": "Colaba Causeway, Mumbai, Maharashtra 400005",
            "operator": "BPCL",
            "charger_types": "CCS2, Type2",
            "charging_type": "AC",
            "latitude": 18.9067,
            "longitude": 72.8147,
            "phone": "9880003106",
            "available_slots": 4,
            "opening_time": time(6, 0),
            "closing_time": time(22, 0),
        },
    ],
}


def _match_existing(db, station: dict):
    if station.get("external_id"):
        existing = (
            db.query(ChargingStation)
            .filter(ChargingStation.external_id == station["external_id"])
            .first()
        )
        if existing:
            return existing
    return (
        db.query(ChargingStation)
        .filter(
            ChargingStation.name == station["name"],
            ChargingStation.address == station["address"],
        )
        .first()
    )


def seed_stations():
    db = SessionLocal()
    created = 0
    created_by_city = {city: 0 for city in STATIONS_BY_CITY.keys()}
    try:
        for city, city_stations in STATIONS_BY_CITY.items():
            for station_payload in city_stations:
                existing = _match_existing(db, station_payload)
                if existing:
                    continue
                db.add(ChargingStation(**station_payload))
                created += 1
                created_by_city[city] += 1

        db.commit()
        print(
            "[SUCCESS] Added stations - "
            f"Bangalore: {created_by_city['Bangalore']}, "
            f"Delhi: {created_by_city['Delhi']}, "
            f"Mumbai: {created_by_city['Mumbai']} "
            f"(total {created})"
        )
    except Exception as exc:
        db.rollback()
        print(f"[ERROR] Error adding stations: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_stations()
