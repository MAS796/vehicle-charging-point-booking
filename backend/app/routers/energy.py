from fastapi import APIRouter
from ..services.energy_service import simulate_energy_usage

router = APIRouter()

@router.get("/live")
def live_energy():
    """Get live energy consumption data"""
    return simulate_energy_usage()

@router.get("/hourly-usage")
def hourly_usage():
    """Get hourly energy usage pattern"""
    return {
        "hours": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
        "usage": [45, 30, 120, 280, 340, 290, 60],
        "peak_usage": "16:00 - 19:00"
    }

@router.get("/sustainability-score")
def sustainability_score():
    """Get grid sustainability score"""
    return {
        "renewable_percentage": 68,
        "grid_efficiency": 0.94,
        "carbon_saved_tons": 1240,
        "status": "Excellent"
    }
