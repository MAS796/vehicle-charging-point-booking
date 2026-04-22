#!/usr/bin/env python3
"""
Migration script to update database schema
Drops all tables and recreates them with new schema
"""

from app.database import engine, Base
from app import models

if __name__ == "__main__":
    print("⚠️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("✅ Creating new tables with updated schema...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database migration complete!")
    print("📝 Note: All existing data has been cleared. You'll need to re-create test data.")
