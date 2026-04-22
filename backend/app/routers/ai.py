"""
AI Router - Comprehensive AI endpoints for EV charging platform
Includes chat, predictions, optimization, and recommendations
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

from ..services.ai_engine import ask_ev_ai, get_smart_recommendation
from ..services.ml_prediction import (
    predict_wait_time,
    forecast_demand,
    calculate_charging_estimate
)
from ..services.optimization import (
    optimize_station_load,
    get_best_stations,
    get_load_balancing_suggestions,
    plan_charging_route
)

router = APIRouter()

# ============== PYDANTIC MODELS ==============
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChargingEstimateRequest(BaseModel):
    battery_capacity_kwh: float
    current_soc: float
    target_soc: float = 80.0
    charger_power_kw: float

class StationData(BaseModel):
    id: Optional[int] = None
    name: str
    current_load: float
    capacity: float = 100.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    charger_type: Optional[str] = "DC Fast"

class RoutePlanRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    current_range_km: float
    total_range_km: float

class RecommendationRequest(BaseModel):
    station_load: float
    battery_level: float
    time_of_day: Optional[int] = None

# ============== CHAT ENDPOINTS ==============
@router.post("/chat")
def chat_with_ai(request: ChatRequest):
    """
    AI-powered EV knowledge chat assistant
    Ask any question about EV charging, optimization, or infrastructure
    """
    try:
        response = ask_ev_ai(request.message)
        return {
            "success": True,
            "query": request.message,
            "reply": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.get("/quick-tips")
def get_quick_tips():
    """Get AI-generated quick tips for EV owners"""
    return {
        "tips": [
            {
                "category": "Cost Savings",
                "tip": "Charge during off-peak hours (10 PM - 6 AM) for 20-30% savings",
                "icon": "💰"
            },
            {
                "category": "Battery Health",
                "tip": "Keep your battery between 20-80% for daily use to maximize lifespan",
                "icon": "🔋"
            },
            {
                "category": "Fast Charging",
                "tip": "Use fast charging only when necessary - Level 2 is better for battery",
                "icon": "⚡"
            },
            {
                "category": "Weather",
                "tip": "Pre-condition your car while plugged in during extreme weather",
                "icon": "🌡️"
            },
            {
                "category": "Planning",
                "tip": "Plan charging stops in advance for trips - arrive with 15-20% battery",
                "icon": "🗺️"
            }
        ],
        "savings_potential": "₹2,500-4,000/month with optimal charging habits"
    }

# ============== PREDICTION ENDPOINTS ==============
@router.get("/predict-wait")
def predict_waiting_time(
    load: float = Query(..., ge=0, le=100, description="Current station load percentage"),
    hour: Optional[int] = Query(None, ge=0, le=23, description="Hour of day (0-23)"),
    day: Optional[int] = Query(None, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")
):
    """
    ML-powered wait time prediction based on station load
    """
    prediction = predict_wait_time(load, hour, day)
    return prediction

@router.get("/forecast")
def get_demand_forecast(
    hours: int = Query(24, ge=1, le=72, description="Hours to forecast ahead")
):
    """
    AI demand forecasting for the next N hours
    Useful for planning optimal charging times
    """
    forecast = forecast_demand(hours)
    
    # Find best times
    best_times = sorted(forecast, key=lambda x: x['predicted_load'])[:3]
    
    return {
        "forecast": forecast,
        "best_times_to_charge": best_times,
        "generated_at": datetime.now().isoformat()
    }

@router.post("/charging-estimate")
def get_charging_estimate(request: ChargingEstimateRequest):
    """
    Calculate detailed charging time and cost estimates
    """
    estimate = calculate_charging_estimate(
        battery_capacity_kwh=request.battery_capacity_kwh,
        current_soc=request.current_soc,
        target_soc=request.target_soc,
        charger_power_kw=request.charger_power_kw
    )
    
    if "error" in estimate:
        raise HTTPException(status_code=400, detail=estimate["error"])
    
    return estimate

# ============== OPTIMIZATION ENDPOINTS ==============
@router.post("/optimize-stations")
def optimize_stations(stations: List[StationData]):
    """
    Analyze and optimize station load distribution
    Returns prioritized recommendations for each station
    """
    station_dicts = [s.model_dump() for s in stations]
    optimized = optimize_station_load(station_dicts)
    
    return {
        "stations": optimized,
        "total_analyzed": len(optimized),
        "timestamp": datetime.now().isoformat()
    }

@router.post("/best-stations")
def get_recommended_stations(
    stations: List[StationData],
    user_lat: Optional[float] = Query(None, description="User latitude"),
    user_lng: Optional[float] = Query(None, description="User longitude"),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Get best stations based on load, distance, and availability
    """
    station_dicts = [s.model_dump() for s in stations]
    user_location = None
    if user_lat and user_lng:
        user_location = {"lat": user_lat, "lng": user_lng}
    
    best = get_best_stations(station_dicts, user_location, limit)
    
    return {
        "recommendations": best,
        "user_location_provided": user_location is not None
    }

@router.post("/load-balancing")
def analyze_load_balancing(stations: List[StationData]):
    """
    Network-wide load balancing analysis and suggestions
    """
    station_dicts = [s.model_dump() for s in stations]
    analysis = get_load_balancing_suggestions(station_dicts)
    
    return analysis

@router.post("/plan-route")
def plan_charging_route_api(request: RoutePlanRequest):
    """
    Plan optimal charging stops for a trip
    """
    # Mock stations for route planning
    mock_stations = [
        {"id": 1, "name": "Highway Hub 1", "current_load": 45, "latitude": 28.5, "longitude": 77.1},
        {"id": 2, "name": "Express Charger", "current_load": 30, "latitude": 28.7, "longitude": 77.3},
        {"id": 3, "name": "City Center", "current_load": 65, "latitude": 28.9, "longitude": 77.5},
    ]
    
    route = plan_charging_route(
        start_location={"lat": request.start_lat, "lng": request.start_lng},
        end_location={"lat": request.end_lat, "lng": request.end_lng},
        current_range_km=request.current_range_km,
        total_range_km=request.total_range_km,
        stations=mock_stations
    )
    
    return route

# ============== RECOMMENDATION ENDPOINTS ==============
@router.post("/smart-recommendation")
def get_smart_recommendation_api(request: RecommendationRequest):
    """
    Get smart charging recommendations based on multiple factors
    """
    time_of_day = request.time_of_day if request.time_of_day is not None else datetime.now().hour
    
    recommendation = get_smart_recommendation(
        station_load=request.station_load,
        time_of_day=time_of_day,
        battery_level=request.battery_level
    )
    
    return {
        **recommendation,
        "input_factors": {
            "station_load": request.station_load,
            "battery_level": request.battery_level,
            "time_of_day": time_of_day
        }
    }

@router.get("/dashboard-insights")
def get_dashboard_insights():
    """
    Real-time AI insights for dashboard display
    """
    current_hour = datetime.now().hour
    
    # Generate dynamic insights
    insights = []
    
    if 22 <= current_hour or current_hour < 6:
        insights.append({
            "type": "savings",
            "title": "Off-Peak Hours Active",
            "message": "You're in off-peak hours! Charging now saves 20-30% on costs.",
            "icon": "🌙",
            "priority": "high"
        })
    
    if 7 <= current_hour <= 9:
        insights.append({
            "type": "warning",
            "title": "Morning Rush Hour",
            "message": "High demand expected. Consider booking in advance.",
            "icon": "⏰",
            "priority": "medium"
        })
    
    if 17 <= current_hour <= 19:
        insights.append({
            "type": "warning",
            "title": "Evening Peak",
            "message": "Peak pricing active. Wait 2-3 hours for better rates.",
            "icon": "📊",
            "priority": "medium"
        })
    
    # Always show these
    insights.extend([
        {
            "type": "tip",
            "title": "Battery Health",
            "message": "Charge to 80% for daily use - better for battery longevity.",
            "icon": "🔋",
            "priority": "low"
        },
        {
            "type": "network",
            "title": "Network Status",
            "message": "92% of stations operational. 3 under maintenance.",
            "icon": "🔌",
            "priority": "info"
        }
    ])
    
    return {
        "insights": insights,
        "generated_at": datetime.now().isoformat(),
        "next_optimal_time": "22:00" if current_hour < 22 else "Now"
    }

# Legacy endpoint for backward compatibility
@router.get("/prediction/{station_load}")
def ai_prediction_legacy(station_load: int):
    """Legacy endpoint - Get AI-powered charging time prediction"""
    return predict_wait_time(float(station_load))

@router.get("/optimization-tips")
def optimization_tips():
    """Get AI optimization recommendations"""
    return {
        "tips": [
            "Charge during off-peak hours (10 PM - 6 AM) for faster charging and lower costs",
            "Use fast charging only when necessary to extend battery life",
            "Pre-cool/heat your vehicle while plugged in before fast charging",
            "Keep battery between 20-80% for daily driving to maximize battery lifespan",
            "Plan routes with charging stops - arrive with 15-20% for optimal charging speed"
        ],
        "savings_potential": "₹3,000/month with optimal charging habits",
        "battery_health_tips": [
            "Avoid frequent DC fast charging when possible",
            "Don't leave battery at 100% for extended periods",
            "Charge in moderate temperatures when possible"
        ]
    }
