from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import ChargingSession
from datetime import datetime

def get_dashboard_stats(db: Session):
    """Get analytics dashboard statistics"""
    try:
        total_sessions = db.query(func.count(ChargingSession.id)).scalar() or 0
        total_energy = db.query(func.sum(ChargingSession.energy_used)).scalar() or 0
        
        avg_duration = db.query(
            func.avg(ChargingSession.duration_minutes)
        ).scalar() or 0

        return {
            "total_sessions": total_sessions,
            "total_energy_kwh": round(float(total_energy), 2),
            "avg_duration_minutes": round(float(avg_duration), 2),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "total_sessions": 0,
            "total_energy_kwh": 0,
            "avg_duration_minutes": 0,
            "error": str(e)
        }
