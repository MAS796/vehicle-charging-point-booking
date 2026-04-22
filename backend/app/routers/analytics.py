from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, cast, Date, extract
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


def _iso_date(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


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
@router.get("/dashboard")
def get_dashboard_stats(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get comprehensive analytics dashboard data"""
    try:
        # Date range for analytics
        start_date = datetime.utcnow() - timedelta(days=days)
        today = datetime.utcnow().date()

        # Live daily metrics (auto-updating on every request)
        daily_bookings = (
            db.query(func.count(Booking.id))
            .filter(cast(Booking.created_at, Date) == today)
            .scalar()
            or 0
        )

        daily_revenue = (
            db.query(func.sum(Payment.amount))
            .filter(cast(Payment.timestamp, Date) == today)
            .scalar()
            or 0
        )

        total_users = db.query(func.count(User.id)).scalar() or 0
        total_stations = db.query(func.count(ChargingStation.id)).scalar() or 0

        ac_count = (
            db.query(func.count(ChargingStation.id))
            .filter(ChargingStation.charging_type == "AC")
            .scalar()
            or 0
        )
        dc_count = (
            db.query(func.count(ChargingStation.id))
            .filter(ChargingStation.charging_type == "DC")
            .scalar()
            or 0
        )
        
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
        
        return {
            # Existing fields kept for compatibility with current dashboard
            "total_bookings": total_bookings,
            "total_companies": total_companies,
            "total_views": total_views,
            "ac_bookings": ac_bookings,
            "dc_bookings": dc_bookings,
            "top_companies": top_companies_data,
            "top_stations": top_stations_data,
            "country_distribution": country_data,
            # New live daily aggregation payload
            "daily": {
                "bookings": int(daily_bookings),
                "revenue": float(daily_revenue or 0),
            },
            "totals": {
                "users": int(total_users),
                "stations": int(total_stations),
            },
            "ac_dc": {
                "ac": int(ac_count),
                "dc": int(dc_count),
            },
            "window_days": int(days),
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/enterprise-dashboard")
def get_enterprise_dashboard(db: Session = Depends(get_db)):
    """
    SaaS-grade analytics endpoint:
    - kpis
    - daily_revenue (7d)
    - monthly_trend (12m)
    - booking growth
    - usage stats
    - peak hour
    - revenue per station
    - top country (company country in current schema)
    """
    try:
        today = datetime.utcnow().date()
        start_7d = today - timedelta(days=6)
        this_week_start = today - timedelta(days=7)
        prev_week_start = today - timedelta(days=14)
        start_12m = (today.replace(day=1) - timedelta(days=365)).replace(day=1)

        # 1) Daily revenue - last 7 days
        daily_rows = (
            db.query(
                cast(Payment.timestamp, Date).label("d"),
                func.sum(Payment.amount).label("revenue"),
            )
            .filter(cast(Payment.timestamp, Date) >= start_7d)
            .group_by(cast(Payment.timestamp, Date))
            .order_by(cast(Payment.timestamp, Date))
            .all()
        )
        daily_revenue = [{"date": _iso_date(r[0]), "revenue": float(r[1] or 0)} for r in daily_rows]
        daily_revenue_total = float(sum((x["revenue"] for x in daily_revenue), 0.0))

        # 2) Monthly trend - last 12 months
        monthly_rows = (
            db.query(
                extract("year", Payment.timestamp).label("year"),
                extract("month", Payment.timestamp).label("month"),
                func.sum(Payment.amount).label("revenue"),
            )
            .filter(Payment.timestamp >= datetime.combine(start_12m, datetime.min.time()))
            .group_by(extract("year", Payment.timestamp), extract("month", Payment.timestamp))
            .order_by(extract("year", Payment.timestamp), extract("month", Payment.timestamp))
            .all()
        )
        monthly_trend = [
            {
                "year": int(r[0]) if r[0] is not None else None,
                "month": int(r[1]) if r[1] is not None else None,
                "revenue": float(r[2] or 0),
                "label": f"{int(r[1]):02d}/{int(r[0])}" if r[0] is not None and r[1] is not None else "-",
            }
            for r in monthly_rows
        ]

        # 3) Booking growth % (week over week)
        current_week_count = (
            db.query(func.count(Booking.id))
            .filter(cast(Booking.created_at, Date) >= this_week_start)
            .scalar()
            or 0
        )
        previous_week_count = (
            db.query(func.count(Booking.id))
            .filter(cast(Booking.created_at, Date) >= prev_week_start, cast(Booking.created_at, Date) < this_week_start)
            .scalar()
            or 0
        )
        booking_growth_percent = (
            ((current_week_count - previous_week_count) / previous_week_count) * 100.0
            if previous_week_count > 0
            else 0.0
        )

        # 4) Active users today (booking OR login)
        booking_users_today = (
            db.query(Booking.user_id)
            .filter(cast(Booking.created_at, Date) == today, Booking.user_id.isnot(None))
            .distinct()
            .all()
        )
        from ..models import LoginHistory  # local import to avoid circulars

        login_users_today = (
            db.query(LoginHistory.user_id)
            .filter(cast(LoginHistory.timestamp, Date) == today, LoginHistory.user_id.isnot(None))
            .distinct()
            .all()
        )
        active_user_ids = {u[0] for u in booking_users_today} | {u[0] for u in login_users_today}
        active_users_today = len(active_user_ids)

        # 5) Charger usage rate % (bookings today vs total slots)
        bookings_today = (
            db.query(func.count(Booking.id))
            .filter(cast(Booking.created_at, Date) == today)
            .scalar()
            or 0
        )
        total_available_slots = db.query(func.sum(ChargingStation.available_slots)).scalar() or 0
        charger_usage_rate_percent = (
            round((bookings_today / total_available_slots) * 100.0, 2) if total_available_slots > 0 else 0.0
        )

        # 6) Peak usage hour
        peak_hour_row = (
            db.query(
                extract("hour", Booking.created_at).label("hour"),
                func.count(Booking.id).label("cnt"),
            )
            .group_by(extract("hour", Booking.created_at))
            .order_by(func.count(Booking.id).desc())
            .first()
        )
        peak_hour = {
            "hour": int(peak_hour_row[0]) if peak_hour_row else None,
            "bookings": int(peak_hour_row[1]) if peak_hour_row else 0,
            "label": f"{int(peak_hour_row[0]):02d}:00" if peak_hour_row else None,
        }

        # 7) Revenue per station
        revenue_per_station_rows = (
            db.query(
                ChargingStation.id,
                ChargingStation.name,
                func.sum(Payment.amount).label("revenue"),
            )
            .join(Booking, Booking.station_id == ChargingStation.id)
            .join(Payment, Payment.booking_id == Booking.id)
            .group_by(ChargingStation.id, ChargingStation.name)
            .order_by(func.sum(Payment.amount).desc())
            .all()
        )
        revenue_per_station = [
            {
                "station_id": int(r[0]),
                "station_name": r[1],
                "revenue": float(r[2] or 0),
            }
            for r in revenue_per_station_rows
        ]

        # 8) Top performing region (country in current schema)
        top_region_row = (
            db.query(
                Company.country.label("region"),
                func.sum(Payment.amount).label("revenue"),
            )
            .join(ChargingStation, ChargingStation.company_id == Company.id)
            .join(Booking, Booking.station_id == ChargingStation.id)
            .join(Payment, Payment.booking_id == Booking.id)
            .group_by(Company.country)
            .order_by(func.sum(Payment.amount).desc())
            .first()
        )
        top_city = {
            "city": top_region_row[0] if top_region_row else None,
            "revenue": float(top_region_row[1] or 0) if top_region_row else 0.0,
        }

        return {
            "kpis": {
                "today_revenue": daily_revenue_total,
                "booking_growth_percent": round(booking_growth_percent, 2),
                "active_users_today": int(active_users_today),
                "peak_hour_label": peak_hour["label"],
                "charger_usage_rate_percent": float(charger_usage_rate_percent),
            },
            "daily_revenue": daily_revenue,
            "monthly_trend": monthly_trend,
            "booking_growth": {
                "current_week": int(current_week_count),
                "previous_week": int(previous_week_count),
                "percent": round(booking_growth_percent, 2),
            },
            "usage_stats": {
                "bookings_today": int(bookings_today),
                "total_available_slots": int(total_available_slots),
                "charger_usage_rate_percent": float(charger_usage_rate_percent),
            },
            "peak_hour": peak_hour,
            "revenue_per_station": revenue_per_station,
            "top_city": top_city,
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        print(f"Error getting enterprise dashboard stats: {e}")
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
