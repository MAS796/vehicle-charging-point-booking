"""
Seed script to add EV charging companies to the database.
Run once after backend starts.
"""

from .database import SessionLocal
from .models import Company

def seed_companies():
    db = SessionLocal()
    
    # Check if companies already exist
    count = db.query(Company).count()
    if count > 0:
        print(f"[OK] {count} companies already exist. Skipping seed.")
        db.close()
        return
    
    companies = [
        Company(
            name="Siemens AG",
            description="Global technology company specializing in electrification, automation, and digitalization. Provides low-voltage components, smart EV charging infrastructure, and grid-integrated charging systems.",
            country="Germany",
            category="EV Charging & Industrial Electrification",
            website="https://www.siemens.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Siemens_AG.svg/1280px-Siemens_AG.svg.png",
        ),
        Company(
            name="Tata Motors",
            description="India's leading electric vehicle manufacturer offering passenger EVs, fleet solutions, and charging ecosystem integration through Tata Power.",
            country="India",
            category="Electric Vehicles & Charging Ecosystem",
            website="https://www.tatamotors.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Tata_Motors_Logo.svg/1200px-Tata_Motors_Logo.svg.png",
        ),
        Company(
            name="Tesla",
            description="Leading electric vehicle manufacturer and clean energy provider. Operates the world's largest network of high-powered charging stations.",
            country="United States",
            category="EV Manufacturer & Charging",
            website="https://www.tesla.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/1200px-Tesla_logo.png",
        ),
        Company(
            name="Volkswagen",
            description="Major automotive manufacturer committed to electrification with comprehensive EV models and charging infrastructure development.",
            country="Germany",
            category="EV Manufacturer",
            website="https://www.volkswagen.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1280px-Volkswagen_logo_2019.svg.png",
        ),
        Company(
            name="ChargePoint",
            description="Largest EV charging network operator with thousands of charging stations across North America and Europe.",
            country="United States",
            category="Charging Network Operator",
            website="https://www.chargepoint.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/ChargePoint_logo.svg/1200px-ChargePoint_logo.svg.png",
        ),
        Company(
            name="Shell Recharge",
            description="Energy company providing integrated EV charging solutions and renewable energy integration for global markets.",
            country="Netherlands",
            category="Energy & Charging Solutions",
            website="https://www.shellrecharge.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Shell_logo.svg/1200px-Shell_logo.svg.png",
        ),
        Company(
            name="Porsche",
            description="Premium EV manufacturer focusing on high-performance electric vehicles and premium charging infrastructure.",
            country="Germany",
            category="Premium EV Manufacturer",
            website="https://www.porsche.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Porsche_logo.svg/1200px-Porsche_logo.svg.png",
        ),
        Company(
            name="Nissan",
            description="Japanese automotive manufacturer with strong electric vehicle lineup including Nissan Leaf and charging partnership programs.",
            country="Japan",
            category="EV Manufacturer",
            website="https://www.nissan.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nissan_logo.svg/1200px-Nissan_logo.svg.png",
        ),
        Company(
            name="BMW",
            description="German luxury automaker with extensive electric and plug-in hybrid vehicle portfolio and charging solutions.",
            country="Germany",
            category="Luxury EV Manufacturer",
            website="https://www.bmw.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png",
        ),
        Company(
            name="Hyundai",
            description="South Korean automotive manufacturer with competitive EV models and integrated charging ecosystem development.",
            country="South Korea",
            category="EV Manufacturer",
            website="https://www.hyundai.com",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png",
        ),
    ]
    
    try:
        db.add_all(companies)
        db.commit()
        print(f"[SUCCESS] {len(companies)} companies added successfully")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error adding companies: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_companies()
