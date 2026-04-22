import random

def simulate_energy_usage():
    """Simulate real-time energy usage"""
    return {
        "active_sessions": random.randint(10, 25),
        "current_load_kw": round(random.uniform(120, 300), 2),
        "energy_today_kwh": round(random.uniform(1000, 5000), 2),
        "peak_hours": "11:00 - 13:00, 17:00 - 19:00",
        "efficiency_score": round(random.uniform(0.8, 0.98), 2)
    }
