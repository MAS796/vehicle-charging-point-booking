"""
AI Engine - OpenAI powered EV Knowledge Assistant
Handles LLM-based chat, recommendations, and intelligent responses
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Check if OpenAI is available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Initialize client if available
client = None
if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are an intelligent EV charging assistant for a professional enterprise platform.
You specialize in:
- EV charging optimization and best practices
- Station load balancing and demand management
- Charging time prediction and cost estimation
- Battery efficiency and health recommendations
- Smart grid integration advice
- EV infrastructure analytics and insights
- Route planning with charging stops
- Vehicle-to-Grid (V2G) technology
- Renewable energy integration

Guidelines:
- Only respond about EV and charging-related topics
- Give professional, technical, and actionable responses
- Include specific numbers and estimates when possible
- Recommend optimal charging strategies
- Be concise but comprehensive
- If asked about non-EV topics, politely redirect to EV-related assistance

For charging recommendations, consider:
- Time of day pricing (off-peak: 10PM-6AM)
- Station load and wait times
- Battery health (avoid frequent fast charging)
- Weather impact on EV range
- Upcoming trip requirements
"""

def ask_ev_ai(user_question: str) -> str:
    """
    Process user question through OpenAI GPT model
    Falls back to rule-based responses if OpenAI unavailable
    """
    
    # If OpenAI is available and configured, use it
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_question}
                ],
                max_tokens=500,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return get_fallback_response(user_question)
    else:
        return get_fallback_response(user_question)

def get_fallback_response(question: str) -> str:
    """Rule-based fallback responses when OpenAI is unavailable"""
    
    question_lower = question.lower()
    
    # Charging time related
    if any(word in question_lower for word in ["time", "how long", "duration", "fast"]):
        return """⚡ **Charging Time Estimates:**

- **DC Fast Charging (50-150kW):** 20-40 minutes for 80% charge
- **AC Level 2 (7-22kW):** 4-8 hours for full charge  
- **AC Level 1 (3.3kW):** 12-24 hours for full charge

💡 **Tips:**
- Fast charging is best for quick top-ups during trips
- Use Level 2 for overnight/workplace charging (better for battery health)
- Charge to 80% for optimal battery longevity"""

    # Cost related
    elif any(word in question_lower for word in ["cost", "price", "expensive", "cheap", "money"]):
        return """💰 **Charging Cost Guide:**

- **Home Charging:** ₹6-8 per kWh (most economical)
- **Public AC:** ₹8-12 per kWh
- **DC Fast Charging:** ₹15-20 per kWh

🎯 **Money-Saving Tips:**
- Charge during off-peak hours (10 PM - 6 AM) for 20-30% savings
- Use our station finder to compare rates
- Consider monthly charging plans for regular users
- Average monthly cost: ₹1,500-3,000 vs ₹8,000+ for petrol"""

    # Battery related
    elif any(word in question_lower for word in ["battery", "health", "degrade", "life"]):
        return """🔋 **Battery Health Tips:**

1. **Optimal Charging Range:** Keep between 20-80% for daily use
2. **Avoid Frequent Fast Charging:** Limit to when necessary
3. **Temperature:** Don't charge in extreme heat/cold
4. **Storage:** If parking long-term, keep at 50%

📊 **Battery Lifespan:**
- Modern EVs: 8-15 years / 150,000-300,000 km
- Degradation: ~2-3% per year on average
- Warranty: Most manufacturers offer 8-year battery warranty"""

    # Station/location related
    elif any(word in question_lower for word in ["station", "near", "find", "locate", "where"]):
        return """📍 **Finding Charging Stations:**

Use our **Network Map** to find stations with:
- Real-time availability status
- Charger types (AC/DC)
- Current pricing
- User ratings & reviews
- Amenities (restrooms, food, WiFi)

🚗 **Route Planning:**
- Enter your destination
- We'll suggest optimal charging stops
- Filter by charger type and speed
- View estimated wait times"""

    # Range related
    elif any(word in question_lower for word in ["range", "distance", "far", "km", "miles"]):
        return """🛣️ **EV Range Information:**

**Typical Ranges (100% charge):**
- Budget EVs: 200-300 km
- Mid-range: 350-450 km
- Premium: 500-700 km

**Factors Affecting Range:**
- Speed: Highway driving reduces range 20-30%
- Weather: Cold weather can reduce range 10-30%
- AC/Heating: Uses 2-5 kW
- Terrain: Hills reduce efficiency

💡 **Pro Tip:** Plan for 70% of rated range for comfortable trips"""

    # Booking related
    elif any(word in question_lower for word in ["book", "reserve", "slot", "appointment"]):
        return """📅 **Booking a Charging Slot:**

1. **Find a Station:** Use our map or search
2. **Check Availability:** Real-time slot status
3. **Select Time:** Choose your preferred slot
4. **Confirm:** Get instant confirmation

✅ **Benefits:**
- No waiting in queue
- Guaranteed charger availability
- Price lock at booking time
- Automatic reminders
- Easy cancellation/rescheduling"""

    # Default response
    else:
        return """🤖 **EV Charging Assistant**

I can help you with:
- ⚡ Charging time estimates
- 💰 Cost calculations
- 🔋 Battery health tips
- 📍 Finding stations
- 🛣️ Range optimization
- 📅 Booking assistance
- 🔌 Charger compatibility

Please ask a specific question about EV charging, and I'll provide detailed guidance!

Example questions:
- "How long to charge my Nexon EV?"
- "What's the cheapest time to charge?"
- "How do I maintain battery health?"
- "Find fast chargers near me" """

def get_smart_recommendation(station_load: float, time_of_day: int, battery_level: float) -> dict:
    """Generate smart charging recommendations based on multiple factors"""
    
    recommendations = []
    priority_score = 0
    
    # Load-based recommendations
    if station_load > 85:
        recommendations.append("⚠️ High station load - expect 15-20 min wait")
        priority_score -= 20
    elif station_load < 40:
        recommendations.append("✅ Low station load - charge now for no wait")
        priority_score += 20
    
    # Time-based recommendations  
    if 22 <= time_of_day or time_of_day < 6:
        recommendations.append("🌙 Off-peak hours - enjoy discounted rates")
        priority_score += 15
    elif 7 <= time_of_day <= 9 or 17 <= time_of_day <= 19:
        recommendations.append("⏰ Peak hours - consider waiting if possible")
        priority_score -= 10
    
    # Battery-based recommendations
    if battery_level < 20:
        recommendations.append("🔴 Low battery - prioritize charging soon")
        priority_score += 30
    elif battery_level > 80:
        recommendations.append("🟢 Good battery level - no urgent charging needed")
        priority_score -= 5
    
    return {
        "recommendations": recommendations,
        "charge_now_score": max(0, min(100, 50 + priority_score)),
        "suggested_action": "Charge Now" if priority_score > 10 else "Wait if Possible" if priority_score < -10 else "Good Time to Charge"
    }
