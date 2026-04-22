"""
Optimization Service - Station load optimization and smart recommendations
Handles load balancing, station recommendations, and route optimization
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import math

def optimize_station_load(stations: List[Dict]) -> List[Dict]:
    """
    Analyze and optimize station load distribution
    
    Args:
        stations: List of station dictionaries with 'name', 'current_load', 'capacity'
    
    Returns:
        List of stations with optimization recommendations
    """
    optimized = []
    
    for station in stations:
        # Handle both dict and object inputs
        if hasattr(station, '__dict__'):
            name = station.name
            current_load = getattr(station, 'current_load', 50)
            capacity = getattr(station, 'capacity', 100)
            station_id = getattr(station, 'id', None)
        else:
            name = station.get('name', 'Unknown')
            current_load = station.get('current_load', 50)
            capacity = station.get('capacity', 100)
            station_id = station.get('id')
        
        # Calculate load ratio
        load_ratio = current_load / max(capacity, 1)
        
        # Determine status and recommendation
        if load_ratio > 0.90:
            status = "Critical"
            recommendation = "Avoid - Redirect to alternative station"
            priority = 1
            color = "red"
        elif load_ratio > 0.75:
            status = "High Load"
            recommendation = "Expect wait times - Consider alternatives"
            priority = 2
            color = "orange"
        elif load_ratio > 0.50:
            status = "Moderate"
            recommendation = "Good for booking - Reasonable wait"
            priority = 3
            color = "yellow"
        elif load_ratio > 0.25:
            status = "Low Load"
            recommendation = "Ideal for booking - Minimal wait"
            priority = 4
            color = "lightgreen"
        else:
            status = "Very Low"
            recommendation = "Excellent - Book now for best experience"
            priority = 5
            color = "green"
        
        # Calculate estimated wait time
        base_wait = load_ratio * 30  # Max 30 min at 100% load
        
        optimized.append({
            "station_id": station_id,
            "station": name,
            "current_load": current_load,
            "capacity": capacity,
            "load_percentage": round(load_ratio * 100, 1),
            "status": status,
            "recommendation": recommendation,
            "priority": priority,
            "color_indicator": color,
            "estimated_wait_minutes": round(base_wait, 0),
            "available_slots": max(0, int((1 - load_ratio) * 10))  # Estimate slots
        })
    
    # Sort by priority (higher is better)
    optimized.sort(key=lambda x: x['priority'], reverse=True)
    
    return optimized

def get_best_stations(stations: List[Dict], user_location: Optional[Dict] = None, limit: int = 5) -> List[Dict]:
    """
    Get best stations based on load, distance, and availability
    
    Args:
        stations: List of station data
        user_location: Optional dict with 'lat' and 'lng'
        limit: Maximum number of recommendations
    """
    optimized = optimize_station_load(stations)
    
    # If user location provided, factor in distance
    if user_location:
        for station in optimized:
            # Get station coordinates (mock for now)
            station_lat = station.get('latitude', 28.6139)
            station_lng = station.get('longitude', 77.2090)
            
            distance = calculate_distance(
                user_location.get('lat', 28.6139),
                user_location.get('lng', 77.2090),
                station_lat,
                station_lng
            )
            
            station['distance_km'] = round(distance, 1)
            
            # Adjust priority based on distance
            if distance < 2:
                station['priority'] += 2
            elif distance < 5:
                station['priority'] += 1
            elif distance > 15:
                station['priority'] -= 1
    
    # Re-sort and limit
    optimized.sort(key=lambda x: x['priority'], reverse=True)
    return optimized[:limit]

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def get_load_balancing_suggestions(stations: List[Dict]) -> Dict:
    """
    Analyze network-wide load and suggest balancing actions
    """
    if not stations:
        return {"error": "No stations provided"}
    
    total_load = sum(s.get('current_load', 50) for s in stations)
    total_capacity = sum(s.get('capacity', 100) for s in stations)
    
    avg_load = total_load / len(stations)
    network_utilization = (total_load / max(total_capacity, 1)) * 100
    
    # Find overloaded and underloaded stations
    overloaded = [s for s in stations if s.get('current_load', 50) > 80]
    underloaded = [s for s in stations if s.get('current_load', 50) < 30]
    
    suggestions = []
    
    if overloaded:
        suggestions.append({
            "type": "redirect",
            "message": f"{len(overloaded)} station(s) are overloaded. Redirect users to nearby alternatives.",
            "stations": [s.get('name', 'Unknown') for s in overloaded]
        })
    
    if underloaded and overloaded:
        suggestions.append({
            "type": "promotion",
            "message": f"Offer discounts at {len(underloaded)} underutilized station(s) to balance load.",
            "stations": [s.get('name', 'Unknown') for s in underloaded]
        })
    
    if network_utilization > 75:
        suggestions.append({
            "type": "capacity",
            "message": "Network approaching capacity. Consider adding new charging points."
        })
    
    return {
        "network_stats": {
            "total_stations": len(stations),
            "average_load": round(avg_load, 1),
            "network_utilization": round(network_utilization, 1),
            "overloaded_count": len(overloaded),
            "underloaded_count": len(underloaded)
        },
        "health_status": "Critical" if network_utilization > 85 else "Warning" if network_utilization > 70 else "Healthy",
        "suggestions": suggestions
    }

def plan_charging_route(
    start_location: Dict,
    end_location: Dict,
    current_range_km: float,
    total_range_km: float,
    stations: List[Dict]
) -> Dict:
    """
    Plan optimal charging stops for a route
    
    Args:
        start_location: {'lat': float, 'lng': float}
        end_location: {'lat': float, 'lng': float}
        current_range_km: Current remaining range
        total_range_km: Total vehicle range when fully charged
        stations: Available charging stations
    """
    # Calculate total trip distance
    trip_distance = calculate_distance(
        start_location['lat'], start_location['lng'],
        end_location['lat'], end_location['lng']
    )
    
    # Safety buffer - plan to arrive with 15% range
    safety_range = total_range_km * 0.15
    usable_range = current_range_km - safety_range
    
    if trip_distance <= usable_range:
        return {
            "stops_needed": 0,
            "message": "No charging stops needed for this trip",
            "trip_distance_km": round(trip_distance, 1),
            "arrival_range_km": round(current_range_km - trip_distance, 1),
            "charging_stops": []
        }
    
    # Calculate stops needed
    range_per_stop = total_range_km * 0.6  # Charge to 80% at each stop
    stops_needed = math.ceil((trip_distance - usable_range) / range_per_stop)
    
    # Find optimal charging stations along route
    charging_stops = []
    current_pos = start_location
    remaining_distance = trip_distance
    
    for i in range(stops_needed):
        optimal_distance = (i + 1) * (trip_distance / (stops_needed + 1))
        
        # Find nearest station to optimal stop point (simplified)
        best_station = None
        min_detour = float('inf')
        
        for station in stations:
            station_lat = station.get('latitude', 28.6 + i * 0.1)
            station_lng = station.get('longitude', 77.2 + i * 0.1)
            
            # Simple detour calculation
            detour = abs(calculate_distance(
                start_location['lat'], start_location['lng'],
                station_lat, station_lng
            ) - optimal_distance)
            
            if detour < min_detour and station.get('current_load', 50) < 80:
                min_detour = detour
                best_station = station
        
        if best_station:
            charging_stops.append({
                "stop_number": i + 1,
                "station_name": best_station.get('name', f'Station {i+1}'),
                "station_id": best_station.get('id'),
                "estimated_arrival_range": round(safety_range + 10, 0),
                "recommended_charge_to": 80,
                "estimated_charge_time_minutes": 25,
                "charger_type": best_station.get('charger_type', 'DC Fast')
            })
    
    return {
        "stops_needed": stops_needed,
        "trip_distance_km": round(trip_distance, 1),
        "current_range_km": round(current_range_km, 1),
        "total_charging_time_minutes": stops_needed * 25,
        "total_trip_time_estimate": f"{round(trip_distance/80 + stops_needed * 0.5, 1)} hours",
        "charging_stops": charging_stops,
        "tips": [
            "Arrive at each stop with 15-20% battery for optimal charging speed",
            "Consider using restroom/food breaks during charging",
            "Fast charging works best between 20-80% battery level"
        ]
    }
