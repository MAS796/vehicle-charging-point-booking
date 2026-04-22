"""
AI Service for EV Charging Optimization
Provides intelligent predictions for optimal charging times and load balancing
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional

def predict_optimal_time(current_load: float) -> str:
    """Predict optimal charging time based on current station load"""
    if current_load > 90:
        return "High demand - Wait 30 minutes for better rates"
    elif current_load > 80:
        return "Moderate demand - Wait 20 minutes"
    elif current_load > 60:
        return "Good time to charge - 10% discount available"
    else:
        return "Optimal time - Charge now for best rates"

def calculate_charging_time(battery_capacity: float, current_charge: float, charger_power: float) -> Dict:
    """Calculate estimated charging time"""
    if charger_power <= 0:
        return {"error": "Invalid charger power"}
    
    remaining_capacity = battery_capacity * (1 - current_charge / 100)
    charging_hours = remaining_capacity / charger_power
    
    return {
        "estimated_hours": round(charging_hours, 2),
        "estimated_minutes": round(charging_hours * 60),
        "energy_needed_kwh": round(remaining_capacity, 2),
        "cost_estimate": round(remaining_capacity * 0.15, 2)  # $0.15 per kWh
    }

def get_load_prediction(station_id: int, hours_ahead: int = 24) -> List[Dict]:
    """Predict station load for the next N hours"""
    predictions = []
    base_time = datetime.now()
    
    for hour in range(hours_ahead):
        future_time = base_time + timedelta(hours=hour)
        hour_of_day = future_time.hour
        
        # Simulate load patterns (higher during work hours)
        if 7 <= hour_of_day <= 9:  # Morning rush
            load = 75 + (hour_of_day - 7) * 5
        elif 17 <= hour_of_day <= 19:  # Evening rush
            load = 80 + (19 - hour_of_day) * 3
        elif 10 <= hour_of_day <= 16:  # Work hours
            load = 50 + (hour_of_day % 3) * 10
        elif 22 <= hour_of_day or hour_of_day <= 5:  # Night
            load = 20 + (hour_of_day % 2) * 5
        else:
            load = 40 + (hour_of_day % 4) * 8
        
        predictions.append({
            "hour": future_time.strftime("%Y-%m-%d %H:00"),
            "predicted_load": min(load, 100),
            "recommendation": predict_optimal_time(load)
        })
    
    return predictions

def optimize_charging_schedule(
    user_preferences: Dict,
    station_data: List[Dict]
) -> Dict:
    """AI-powered charging schedule optimization"""
    best_station = None
    best_score = -1
    
    for station in station_data:
        # Calculate score based on multiple factors
        load_score = 100 - station.get("current_load", 50)
        distance_score = 100 - min(station.get("distance", 0) * 10, 100)
        price_score = 100 - station.get("price_per_kwh", 0.15) * 200
        
        total_score = (load_score * 0.4) + (distance_score * 0.3) + (price_score * 0.3)
        
        if total_score > best_score:
            best_score = total_score
            best_station = station
    
    return {
        "recommended_station": best_station,
        "confidence_score": round(best_score, 2),
        "estimated_wait_time": max(0, int((100 - best_score) / 10)) if best_station else 0,
        "optimization_factors": {
            "load_weight": 0.4,
            "distance_weight": 0.3,
            "price_weight": 0.3
        }
    }

def get_energy_insights(usage_history: List[Dict]) -> Dict:
    """Generate AI-powered energy usage insights"""
    if not usage_history:
        return {
            "total_kwh": 0,
            "avg_session_kwh": 0,
            "carbon_offset_kg": 0,
            "cost_savings": 0,
            "recommendation": "Start charging to see personalized insights"
        }
    
    total_kwh = sum(item.get("kwh", 0) for item in usage_history)
    avg_session = total_kwh / len(usage_history) if usage_history else 0
    
    # 1 kWh of EV charging saves ~0.4 kg CO2 compared to gasoline
    carbon_offset = total_kwh * 0.4
    
    # Average cost savings compared to gas ($0.12/kWh vs $0.20/mile gas equivalent)
    cost_savings = total_kwh * 0.08
    
    return {
        "total_kwh": round(total_kwh, 2),
        "avg_session_kwh": round(avg_session, 2),
        "carbon_offset_kg": round(carbon_offset, 2),
        "cost_savings": round(cost_savings, 2),
        "recommendation": get_personalized_recommendation(avg_session, len(usage_history))
    }

def get_personalized_recommendation(avg_kwh: float, session_count: int) -> str:
    """Generate personalized charging recommendation"""
    if session_count < 5:
        return "Keep charging to unlock personalized recommendations!"
    elif avg_kwh > 50:
        return "Consider overnight charging for large battery vehicles - save up to 30%"
    elif avg_kwh > 30:
        return "You're an efficient charger! Try off-peak hours for additional savings"
    else:
        return "Frequent light charging detected - consider full charges for battery health"
