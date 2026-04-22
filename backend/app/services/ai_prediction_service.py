import random
from datetime import datetime

def predict_best_time(station_load: int):
    """AI prediction for optimal charging time"""
    current_hour = datetime.utcnow().hour
    
    # Simulate prediction
    predicted_load = max(0, station_load - random.randint(1, 3))
    
    recommendation = "Low traffic expected" if predicted_load < 5 else "Moderate traffic"
    
    return {
        "current_hour": current_hour,
        "predicted_load": predicted_load,
        "recommendation": recommendation,
        "optimization_level": round(random.uniform(0.7, 0.99), 2),
        "wait_time_minutes": random.randint(5, 30)
    }
