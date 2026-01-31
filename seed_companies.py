from backend.app.database import SessionLocal, engine, Base
from backend.app import models

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check existing companies
existing = db.query(models.Company).count()
print(f"Existing companies: {existing}")

if existing == 0:
    # Add sample companies
    companies = [
        models.Company(
            name="Siemens Mobility",
            description="Leading provider of electromobility and charging solutions",
            country="Germany",
            category="Charging Infrastructure",
            website="https://siemens.com",
            logo_url="https://via.placeholder.com/100?text=Siemens",
            views=0
        ),
        models.Company(
            name="Tesla Supercharger",
            description="Premium EV charging network with fast charging technology",
            country="USA",
            category="Charging Network",
            website="https://tesla.com",
            logo_url="https://via.placeholder.com/100?text=Tesla",
            views=0
        ),
        models.Company(
            name="BP Pulse",
            description="Global electric vehicle charging solution provider",
            country="UK",
            category="Charging Infrastructure",
            website="https://bppulse.com",
            logo_url="https://via.placeholder.com/100?text=BP",
            views=0
        ),
        models.Company(
            name="ABB Electrification",
            description="Advanced power and automation technology for EV charging",
            country="Switzerland",
            category="Technology Provider",
            website="https://abb.com",
            logo_url="https://via.placeholder.com/100?text=ABB",
            views=0
        ),
        models.Company(
            name="Tata Power EV",
            description="India's leading EV charging infrastructure provider",
            country="India",
            category="Charging Network",
            website="https://tata.com",
            logo_url="https://via.placeholder.com/100?text=Tata",
            views=0
        ),
    ]
    
    for company in companies:
        db.add(company)
    
    db.commit()
    print(f"✅ Added 5 sample companies")
    
    # Verify
    count = db.query(models.Company).count()
    print(f"Total companies now: {count}")
else:
    print("Companies already exist")

db.close()
