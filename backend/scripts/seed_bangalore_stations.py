"""
Manual script to seed real Bangalore EV stations.

Run from backend folder:
python scripts/seed_bangalore_stations.py
"""

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import text

from app.database import engine
from app.seed_stations import seed_stations


def ensure_station_columns():
    with engine.begin() as conn:
        if conn.dialect.name == "sqlite":
            cols = conn.execute(text("PRAGMA table_info(charging_stations)")).fetchall()
            names = {c[1] for c in cols}
            if "external_id" not in names:
                conn.execute(text("ALTER TABLE charging_stations ADD COLUMN external_id VARCHAR(80)"))
            if "location" not in names:
                conn.execute(text("ALTER TABLE charging_stations ADD COLUMN location VARCHAR(255)"))
            if "operator" not in names:
                conn.execute(text("ALTER TABLE charging_stations ADD COLUMN operator VARCHAR(255)"))
            if "charger_types" not in names:
                conn.execute(text("ALTER TABLE charging_stations ADD COLUMN charger_types VARCHAR(255)"))
        else:
            conn.execute(text("ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS external_id VARCHAR(80) NULL"))
            conn.execute(text("ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL"))
            conn.execute(text("ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS operator VARCHAR(255) NULL"))
            conn.execute(text("ALTER TABLE charging_stations ADD COLUMN IF NOT EXISTS charger_types VARCHAR(255) NULL"))


if __name__ == "__main__":
    ensure_station_columns()
    seed_stations()
