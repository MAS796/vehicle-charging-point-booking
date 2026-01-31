#!/usr/bin/env python
"""
Script to drop and recreate the PostgreSQL database with fresh schema
"""

import psycopg2
from psycopg2 import sql
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys

# Database connection details
DB_USER = "postgres"
DB_PASSWORD = "mas@123"
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "charging_db"

# URL encode the password to handle special characters
from urllib.parse import quote
ENCODED_PASSWORD = quote(DB_PASSWORD, safe='')

# Connection string for creating database (connect to postgres db first)
DEFAULT_DB_URL = f"postgresql://{DB_USER}:{ENCODED_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres"

# Connection string for the target database
TARGET_DB_URL = f"postgresql://{DB_USER}:{ENCODED_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def drop_and_recreate_database():
    """Drop and recreate the database"""
    try:
        # Connect to the default postgres database
        print("🔌 Connecting to PostgreSQL server...")
        conn = psycopg2.connect(DEFAULT_DB_URL)
        conn.autocommit = True
        cursor = conn.cursor()

        # Terminate existing connections to the database
        print(f"🔌 Terminating existing connections to {DB_NAME}...")
        terminate_sql = f"""
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '{DB_NAME}'
        AND pid <> pg_backend_pid();
        """
        cursor.execute(terminate_sql)

        # Drop database if it exists
        print(f"🗑️  Dropping database '{DB_NAME}'...")
        drop_sql = sql.SQL("DROP DATABASE IF EXISTS {}").format(
            sql.Identifier(DB_NAME)
        )
        cursor.execute(drop_sql)
        print(f"✅ Database '{DB_NAME}' dropped successfully")

        # Create new database
        print(f"🆕 Creating new database '{DB_NAME}'...")
        create_sql = sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(DB_NAME)
        )
        cursor.execute(create_sql)
        print(f"✅ Database '{DB_NAME}' created successfully")

        cursor.close()
        conn.close()

        # Now create tables using SQLAlchemy
        print("\n📊 Creating schema from models...")
        from app.database import Base, engine
        from app import models  # Import to register all models

        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")

        print("\n✨ Database recreation complete!")
        print(f"   Database: {DB_NAME}")
        print(f"   Host: {DB_HOST}:{DB_PORT}")
        return True

    except psycopg2.Error as e:
        print(f"❌ PostgreSQL Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = drop_and_recreate_database()
    sys.exit(0 if success else 1)
