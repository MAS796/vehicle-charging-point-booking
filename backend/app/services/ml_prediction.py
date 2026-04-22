"""
ML Prediction Service - Machine Learning based predictions for EV charging
Includes wait time prediction, demand forecasting, and load optimization
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List

# Initialize ML models with training data
try:
    from sklearn.linear_model import LinearRegression, Ridge
    from sklearn.ensemble import RandomForestRegressor
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# ============== WAIT TIME PREDICTION MODEL ==============
# Training data: [station_load, hour_of_day, day_of_week]
# Target: wait_time_minutes

if SKLEARN_AVAILABLE:
    # Enhanced training data
    X_wait = np.array([
        [10, 2, 0], [20, 3, 1], [30, 8, 2], [40, 9, 3], [50, 12, 4],
        [60, 14, 5], [70, 17, 6], [80, 18, 0], [90, 19, 1], [95, 20, 2],
        [15, 4, 3], [25, 5, 4], [35, 10, 5], [45, 11, 6], [55, 13, 0],
        [65, 15, 1], [75, 16, 2], [85, 21, 3], [92, 22, 4], [98, 23, 5],
        [5, 1, 6], [12, 6, 0], [22, 7, 1], [38, 8, 2], [48, 9, 3],
    ])
    y_wait = np.array([
        2, 4, 8, 12, 15, 18, 22, 28, 35, 45,
        3, 5, 10, 13, 16, 19, 24, 30, 38, 50,
        1, 3, 6, 11, 14
    ])
    
    wait_model = Ridge(alpha=1.0)
    wait_model.fit(X_wait, y_wait)
    
    # Demand forecasting model
    X_demand = np.array([
        [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0],
        [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0],
        [20, 0], [21, 0], [22, 0], [23, 0], [0, 0], [1, 0], [2, 0],
        [6, 1], [7, 1], [8, 1], [17, 1], [18, 1], [19, 1],  # Weekday peaks
    ])
    y_demand = np.array([
        25, 45, 75, 80, 55, 50, 60, 65, 55, 50, 55, 75, 85, 80,
        60, 40, 30, 20, 15, 10, 10,
        30, 55, 85, 80, 90, 85  # Higher weekday demand
    ])
    
    demand_model = RandomForestRegressor(n_estimators=50, random_state=42)
    demand_model.fit(X_demand, y_demand)
else:
    wait_model = None
    demand_model = None

def predict_wait_time(current_load: float, hour: int = None, day_of_week: int = None) -> Dict:
    """
    Predict wait time using ML model
    
    Args:
        current_load: Current station load percentage (0-100)
        hour: Hour of day (0-23), defaults to current hour
        day_of_week: Day of week (0=Monday, 6=Sunday), defaults to current day
    
    Returns:
        Dictionary with prediction results
    """
    now = datetime.now()
    if hour is None:
        hour = now.hour
    if day_of_week is None:
        day_of_week = now.weekday()
    
    if SKLEARN_AVAILABLE and wait_model:
        features = np.array([[current_load, hour, day_of_week]])
        prediction = float(wait_model.predict(features)[0])
        prediction = max(0.0, min(60.0, prediction))  # Clamp between 0-60 minutes
    else:
        # Fallback calculation
        base_wait = current_load * 0.4
        # Adjust for peak hours
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            base_wait *= 1.3
        elif 22 <= hour or hour <= 5:
            base_wait *= 0.5
        prediction = base_wait
    
    # Determine confidence and status
    if current_load < 30:
        status = "Low Traffic"
        confidence = 0.92
    elif current_load < 60:
        status = "Moderate Traffic"
        confidence = 0.85
    elif current_load < 85:
        status = "High Traffic"
        confidence = 0.78
    else:
        status = "Very High Traffic"
        confidence = 0.70
    
    return {
        "current_load": float(current_load),
        "predicted_wait_minutes": float(round(prediction, 1)),
        "confidence": float(confidence),
        "status": status,
        "hour_analyzed": int(hour),
        "recommendation": get_wait_recommendation(prediction, current_load)
    }

def get_wait_recommendation(wait_time: float, load: float) -> str:
    """Generate recommendation based on wait time"""
    if wait_time < 5:
        return "Excellent time to charge - minimal wait expected"
    elif wait_time < 15:
        return "Good time to charge - short wait expected"
    elif wait_time < 30:
        return "Consider waiting 30 minutes for lower traffic"
    else:
        return "High demand - try off-peak hours or alternative station"

def forecast_demand(hours_ahead: int = 24) -> List[Dict]:
    """
    Forecast station demand for the next N hours
    
    Args:
        hours_ahead: Number of hours to forecast
    
    Returns:
        List of hourly demand forecasts
    """
    forecasts = []
    now = datetime.now()
    
    for i in range(hours_ahead):
        future_time = now + timedelta(hours=i)
        hour = future_time.hour
        is_weekday = 1 if future_time.weekday() < 5 else 0
        
        if SKLEARN_AVAILABLE and demand_model:
            features = np.array([[hour, is_weekday]])
            predicted_load = float(demand_model.predict(features)[0])
        else:
            # Fallback demand calculation
            if 7 <= hour <= 9:
                predicted_load = 70 + (hour - 7) * 10
            elif 17 <= hour <= 19:
                predicted_load = 75 + (19 - hour) * 5
            elif 10 <= hour <= 16:
                predicted_load = 50 + (hour % 3) * 5
            elif 22 <= hour or hour <= 5:
                predicted_load = 15 + (hour % 2) * 5
            else:
                predicted_load = 40 + (hour % 4) * 8
            
            if is_weekday:
                predicted_load *= 1.1
        
        predicted_load = float(max(10, min(95, predicted_load)))
        
        forecasts.append({
            "timestamp": future_time.strftime("%Y-%m-%d %H:%M"),
            "hour": int(hour),
            "day": future_time.strftime("%A"),
            "predicted_load": float(round(predicted_load, 1)),
            "demand_level": categorize_demand(predicted_load),
            "price_indicator": get_price_indicator(hour, predicted_load),
            "booking_recommended": bool(predicted_load > 60)
        })
    
    return forecasts

def categorize_demand(load: float) -> str:
    """Categorize demand level"""
    if load < 30:
        return "Low"
    elif load < 50:
        return "Moderate"
    elif load < 70:
        return "High"
    else:
        return "Very High"

def get_price_indicator(hour: int, load: float) -> str:
    """Determine price indicator based on time and load"""
    if 22 <= hour or hour < 6:
        return "💚 Off-Peak (Lowest)"
    elif load > 70:
        return "🔴 Peak (Highest)"
    elif load > 50:
        return "🟡 Standard"
    else:
        return "🟢 Low Demand"

def calculate_charging_estimate(
    battery_capacity_kwh: float,
    current_soc: float,
    target_soc: float,
    charger_power_kw: float
) -> Dict:
    """
    Calculate detailed charging estimates
    
    Args:
        battery_capacity_kwh: Total battery capacity in kWh
        current_soc: Current state of charge (0-100)
        target_soc: Target state of charge (0-100)
        charger_power_kw: Charger power in kW
    """
    if charger_power_kw <= 0:
        return {"error": "Invalid charger power"}
    
    if current_soc >= target_soc:
        return {"error": "Current charge already at or above target"}
    
    # Calculate energy needed
    energy_needed = battery_capacity_kwh * (target_soc - current_soc) / 100
    
    # Adjust for charging curve (slower near full)
    efficiency = 0.90  # 90% charging efficiency
    if target_soc > 80:
        efficiency *= 0.85  # Slower charging above 80%
    
    # Calculate time
    charging_time_hours = energy_needed / (charger_power_kw * efficiency)
    
    # Cost calculation (variable rate)
    base_rate = 12  # ₹ per kWh
    now = datetime.now()
    if 22 <= now.hour or now.hour < 6:
        rate = base_rate * 0.75  # Off-peak discount
        rate_type = "Off-Peak"
    elif 7 <= now.hour <= 9 or 17 <= now.hour <= 19:
        rate = base_rate * 1.25  # Peak premium
        rate_type = "Peak"
    else:
        rate = base_rate
        rate_type = "Standard"
    
    total_cost = energy_needed * rate
    
    return {
        "battery_capacity_kwh": battery_capacity_kwh,
        "current_soc": current_soc,
        "target_soc": target_soc,
        "charger_power_kw": charger_power_kw,
        "energy_needed_kwh": round(energy_needed, 2),
        "estimated_time_minutes": round(charging_time_hours * 60, 0),
        "estimated_time_formatted": format_duration(charging_time_hours * 60),
        "cost_estimate_inr": round(total_cost, 2),
        "rate_per_kwh": rate,
        "rate_type": rate_type,
        "efficiency_factor": efficiency,
        "completion_time": (datetime.now() + timedelta(hours=charging_time_hours)).strftime("%H:%M")
    }

def format_duration(minutes: float) -> str:
    """Format minutes into readable duration"""
    hours = int(minutes // 60)
    mins = int(minutes % 60)
    if hours > 0:
        return f"{hours}h {mins}m"
    return f"{mins} minutes"
