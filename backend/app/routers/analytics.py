from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from ..database import SessionLocal
from ..models import Company, ChargingStation, Booking, Analytics, Payment, User
from ..schemas import CompanyStats, DashboardStats, CompanyOut, CompanyCreate, AnalyticsEvent
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ TRACK VIEW EVENT
@router.post("/track-view/{company_id}")
def track_view(company_id: int, db: Session = Depends(get_db)):
    """Track when a user views a company"""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Increment view count
        company.views += 1
        
        # Record analytics event
        event = Analytics(
            event_type="view",
            company_id=company_id,
            country=company.country
        )
        db.add(event)
        db.commit()
        
        return {"message": "View tracked", "views": company.views}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ TRACK BOOKING EVENT
@router.post("/track-booking")
def track_booking(event: AnalyticsEvent, db: Session = Depends(get_db)):
    """Track booking events for analytics"""
    try:
        analytics_event = Analytics(
            event_type="booking",
            company_id=event.company_id,
            station_id=event.station_id,
            charging_type=event.charging_type,
            country=event.country
        )
        db.add(analytics_event)
        
        # Update company booking count
        if event.company_id:
            company = db.query(Company).filter(Company.id == event.company_id).first()
            if company:
                company.bookings_count += 1
        
        db.commit()
        return {"message": "Booking event tracked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET DASHBOARD STATISTICS
@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get comprehensive analytics dashboard data"""
    try:
        # Date range for analytics
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Total bookings
        total_bookings = db.query(func.count(Booking.id)).scalar() or 0
        
        # Total companies
        total_companies = db.query(func.count(Company.id)).scalar() or 0
        
        # Total views
        total_views = db.query(func.sum(Company.views)).scalar() or 0
        
        # AC vs DC distribution
        ac_bookings = db.query(func.count(Booking.id)).join(
            ChargingStation, Booking.station_id == ChargingStation.id
        ).filter(ChargingStation.charging_type == "AC").scalar() or 0
        
        dc_bookings = db.query(func.count(Booking.id)).join(
            ChargingStation, Booking.station_id == ChargingStation.id
        ).filter(ChargingStation.charging_type == "DC").scalar() or 0
        
        # Top 5 companies by views
        top_companies = db.query(
            Company.id,
            Company.name,
            Company.views,
            Company.bookings_count
        ).order_by(Company.views.desc()).limit(5).all()
        
        top_companies_data = [
            {
                "id": c[0],
                "name": c[1],
                "views": c[2],
                "bookings": c[3]
            } for c in top_companies
        ]
        
        # Top 5 stations by bookings
        top_stations = db.query(
            ChargingStation.id,
            ChargingStation.name,
            func.count(Booking.id).label("booking_count")
        ).outerjoin(Booking, ChargingStation.id == Booking.station_id).group_by(
            ChargingStation.id
        ).order_by(func.count(Booking.id).desc()).limit(5).all()
        
        top_stations_data = [
            {
                "id": s[0],
                "name": s[1],
                "bookings": s[2]
            } for s in top_stations
        ]
        
        # Country distribution
        country_dist = db.query(
            Company.country,
            func.count(Company.id).label("count")
        ).group_by(Company.country).all()
        
        country_data = [{"country": c[0], "count": c[1]} for c in country_dist]
        
        return DashboardStats(
            total_bookings=total_bookings,
            total_companies=total_companies,
            total_views=total_views,
            ac_bookings=ac_bookings,
            dc_bookings=dc_bookings,
            top_companies=top_companies_data,
            top_stations=top_stations_data,
            country_distribution=country_data
        )
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET COMPANY STATISTICS
@router.get("/company/{company_id}", response_model=CompanyStats)
def get_company_stats(company_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific company"""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get all companies ranked by views
        top_companies = db.query(
            Company.id,
            Company.name,
            Company.views,
            Company.bookings_count
        ).order_by(Company.views.desc()).limit(5).all()
        
        top_companies_data = [
            {
                "id": c[0],
                "name": c[1],
                "views": c[2],
                "bookings": c[3]
            } for c in top_companies
        ]
        
        # Country distribution
        country_dist = db.query(
            Company.country,
            func.count(Company.id).label("count")
        ).group_by(Company.country).all()
        
        country_data = [{"country": c[0], "count": c[1]} for c in country_dist]
        
        # Charging type distribution
        type_dist = db.query(
            ChargingStation.charging_type,
            func.count(ChargingStation.id).label("count")
        ).group_by(ChargingStation.charging_type).all()
        
        type_data = [{"type": t[0], "count": t[1]} for t in type_dist]
        
        return CompanyStats(
            total_views=company.views,
            total_bookings=company.bookings_count,
            top_companies=top_companies_data,
            country_distribution=country_data,
            charging_type_distribution=type_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET BOOKINGS OVER TIME
@router.get("/bookings-timeline")
def get_bookings_timeline(db: Session = Depends(get_db)):
    """Get booking trend over last 30 days"""
    try:
        bookings = db.query(
            func.date(Booking.date).label("date"),
            func.count(Booking.id).label("count")
        ).group_by(func.date(Booking.date)).order_by(func.date(Booking.date)).all()
        
        return [
            {
                "date": str(b[0]),
                "bookings": b[1]
            } for b in bookings
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ GET MOST VIEWED STATION
@router.get("/most-viewed-station")
def get_most_viewed_station(db: Session = Depends(get_db)):
    """Get the station with most bookings"""
    try:
        station = db.query(
            ChargingStation.id,
            ChargingStation.name,
            func.count(Booking.id).label("booking_count")
        ).outerjoin(Booking, ChargingStation.id == Booking.station_id).group_by(
            ChargingStation.id
        ).order_by(func.count(Booking.id).desc()).first()
        
        if not station:
            return {"id": None, "name": "No bookings yet", "bookings": 0}
        
        return {
            "id": station[0],
            "name": station[1],
            "bookings": station[2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
