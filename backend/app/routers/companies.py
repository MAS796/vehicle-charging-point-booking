from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import SessionLocal
from ..models import Company, ChargingStation, User, Booking
from ..schemas import CompanyCreate, CompanyOut
from datetime import datetime

router = APIRouter(prefix="/companies", tags=["Companies"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ CREATE COMPANY (Admin only)
@router.post("/", response_model=CompanyOut, status_code=201)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """Create a new charging company"""
    try:
        # Check if company already exists
        existing = db.query(Company).filter(Company.name == company.name).first()
        if existing:
            raise HTTPException(status_code=409, detail="Company already exists")
        
        new_company = Company(
            name=company.name,
            description=company.description,
            country=company.country,
            category=company.category,
            website=company.website,
            logo_url=company.logo_url
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        return new_company
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET ALL COMPANIES
@router.get("/", response_model=list[CompanyOut])
def list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    country: str = Query(None),
    category: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    """List all companies with optional filtering and search"""
    try:
        query = db.query(Company)
        
        # Apply filters
        if country:
            query = query.filter(Company.country == country)
        if category:
            query = query.filter(Company.category == category)
        if search:
            query = query.filter(
                (Company.name.ilike(f"%{search}%")) |
                (Company.description.ilike(f"%{search}%"))
            )
        
        companies = query.order_by(Company.views.desc()).offset(skip).limit(limit).all()
        return companies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET SINGLE COMPANY
@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get a single company by ID"""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ UPDATE COMPANY (Admin only)
@router.put("/{company_id}", response_model=CompanyOut)
def update_company(company_id: int, company_data: CompanyCreate, db: Session = Depends(get_db)):
    """Update company details"""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        company.name = company_data.name
        company.description = company_data.description
        company.country = company_data.country
        company.category = company_data.category
        company.website = company_data.website
        company.logo_url = company_data.logo_url
        company.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(company)
        return company
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ✅ DELETE COMPANY (Admin only)
@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company"""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        db.delete(company)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET COMPANY STATIONS
@router.get("/{company_id}/stations")
def get_company_stations(company_id: int, db: Session = Depends(get_db)):
    """Get all charging stations for a company"""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        stations = db.query(ChargingStation).filter(
            ChargingStation.company_id == company_id
        ).all()
        
        return {
            "company_id": company_id,
            "company_name": company.name,
            "station_count": len(stations),
            "stations": [
                {
                    "id": s.id,
                    "name": s.name,
                    "address": s.address,
                    "charging_type": s.charging_type,
                    "available_slots": s.available_slots
                } for s in stations
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET COUNTRIES LIST
@router.get("/meta/countries", tags=["Metadata"])
def get_countries(db: Session = Depends(get_db)):
    """Get list of all countries with companies"""
    try:
        countries = db.query(Company.country).distinct().all()
        return {"countries": [c[0] for c in countries if c[0]]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET CATEGORIES LIST
@router.get("/meta/categories", tags=["Metadata"])
def get_categories(db: Session = Depends(get_db)):
    """Get list of all categories"""
    try:
        categories = db.query(Company.category).distinct().all()
        return {"categories": [c[0] for c in categories if c[0]]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ SEARCH COMPANIES (Global search)
@router.get("/search/global")
def global_search(q: str = Query(..., min_length=1, max_length=100), db: Session = Depends(get_db)):
    """Global search across companies"""
    try:
        results = db.query(Company).filter(
            (Company.name.ilike(f"%{q}%")) |
            (Company.description.ilike(f"%{q}%")) |
            (Company.country.ilike(f"%{q}%")) |
            (Company.category.ilike(f"%{q}%"))
        ).limit(20).all()
        
        return {
            "query": q,
            "results_count": len(results),
            "results": [
                {
                    "id": c.id,
                    "name": c.name,
                    "country": c.country,
                    "category": c.category,
                    "views": c.views
                } for c in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
