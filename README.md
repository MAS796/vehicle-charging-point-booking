# 🔋 EV Charging Station Booking System

A complete full-stack web application for booking electric vehicle (EV) charging stations with real-time availability, payment processing, and station timing visibility.

## ✨ Key Features

### 🕐 Station Open/Close Timing Visibility
- **Backend-controlled station timing** - Non-negotiable validation
- Real-time open/closed status display
- Current server time always visible
- Live auto-update every 30 seconds (no manual refresh needed)

### 💳 Smart Booking System
- **"Book Your Slot" button appears ONLY when station is open**
- Booking validation on backend (cannot bypass with API calls)
- Real-time charger availability checking
- No overbooking - one charger per time slot

### 💰 Secure Payment Processing
- Payment section only visible after successful booking
- **Payment blocked if station closes during checkout**
- Triple-layer validation ensures security
- Multiple payment methods: UPI, Card, Wallet

### 📊 Professional Architecture
- Enterprise-grade validation logic
- Clean separation of concerns
- Comprehensive error handling
- Production-ready code

---

## 🚀 Quick Start

### Option 1: Automatic Setup (Windows)
```bash
# Just run this one command from the project root
setup.bat
```

### Option 2: Manual Setup

#### Backend (Terminal 1)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# or: source venv/bin/activate # Mac/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```

#### Test (Terminal 3)
```bash
python test_api.py
```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs

---

## 📁 Project Structure

```
vehicle-charging-point-booking/
├── backend/                          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app initialization
│   │   ├── models.py                # SQLAlchemy database models
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── database.py              # Database configuration
│   │   ├── database_init.py         # Database initialization
│   │   ├── utils/
│   │   │   └── time_utils.py        # Station timing validation logic ⭐
│   │   └── routers/
│   │       ├── stations.py          # Station endpoints ⭐
│   │       ├── bookings.py          # Booking with hard validation ⭐
│   │       └── payments.py          # Payment with hard validation ⭐
│   └── requirements.txt
│
├── frontend/                         # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── images/                  # Image placeholders
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Station list with filters
│   │   │   └── StationDetails.jsx   # Station details & booking form ⭐
│   │   ├── styles/
│   │   │   ├── home.css             # Home page styling
│   │   │   └── station-details.css  # Details page styling
│   │   └── services/
│   │       └── api.js               # API service
│   └── package.json
│
├── COMPLETE_GUIDE.md                # Full documentation
├── QUICK_START.md                   # Quick start guide
├── setup.bat                        # Windows auto-setup script
├── test_api.py                      # API testing script
└── README.md                        # This file
```

---

## 🔐 Validation Architecture (The Secret Sauce)

### Triple-Layer Validation
Every critical operation has 3 layers of validation:

```
LAYER 1: Utility Function (time_utils.py)
├─ Compares current server time with station hours
├─ Cannot be bypassed
└─ Returns: true/false

LAYER 2: Route Endpoint
├─ Calls utility function
├─ Validates other business logic
└─ Returns: API response or error

LAYER 3: Frontend UI
├─ Uses API response to show/hide buttons
├─ Shows user-friendly messages
└─ Prevents invalid submissions
```

### Station Timing Validation
```python
# Backend (time_utils.py) - Source of truth
def is_station_open(open_time, close_time):
    now = datetime.now().time()
    return open_time <= now <= close_time

# Used in:
1. Booking creation → Station must be open
2. Payment processing → Station must still be open
3. Real-time status → Used for live updates

# Result: Cannot book or pay if station is closed
# Even with direct API calls
```

---

## 📡 API Endpoints

### Station Endpoints
```
GET  /api/stations                    # List all stations
GET  /api/stations/{id}              # Get station details
GET  /api/stations/{id}/status       # Get real-time status (lightweight)
GET  /api/stations/{id}/chargers/available  # Check charger availability
```

### Booking Endpoints
```
POST /api/bookings                   # Create booking (hard validation)
GET  /api/bookings                   # List all bookings
GET  /api/bookings/{id}             # Get booking details
PUT  /api/bookings/{id}/cancel      # Cancel booking
```

### Payment Endpoints
```
POST /api/payments/process           # Process payment (final validation)
GET  /api/payments                   # List all payments
GET  /api/payments/{id}             # Get payment details
```

---

## 🎯 User Flow

### 1. Home Page
- User sees list of all charging stations
- Each station shows: **🟢 OPEN** or **🔴 CLOSED** status
- Stations are filtered by status (Open / Closed / All)
- **"Book Now" button ONLY appears for OPEN stations**

### 2. Station Details
- Click station to see detailed information
- Displays: Opening time, Closing time, Current server time
- Shows charger list
- Real-time status badge
- Auto-updates every 30 seconds

### 3. Booking
- Select time slot and charger
- Click "Book Your Slot" (only visible if station open)
- Backend validates:
  - ✓ Station exists
  - ✓ Station is OPEN (hard block if closed)
  - ✓ Charger is available
  - ✓ User is active
- Show booking confirmation

### 4. Payment
- Payment section appears after booking success
- Select payment method (UPI/Card/Wallet)
- Click "Complete Payment"
- Backend validates:
  - ✓ Booking exists
  - ✓ Station is OPEN (re-check)
  - ✓ User is active
- Show payment confirmation

---

## 🧪 Testing

### Run API Tests
```bash
python test_api.py
```

This tests:
- ✓ Server health
- ✓ Station retrieval
- ✓ Real-time status
- ✓ Charger availability
- ✓ Booking creation
- ✓ Payment processing
- ✓ Error handling

### Test Scenarios

**Scenario 1: Station Open - Everything Works**
```
1. Station open_time: 08:00, close_time: 22:00
2. Current time: 14:00 (within hours)
3. Result: ✓ Can book and pay
```

**Scenario 2: Station Closed - Hard Block**
```
1. Station close_time: 18:00
2. Current time: 23:00 (after closing)
3. Result: ✗ Booking blocked (403 Forbidden)
4. Result: ✗ Payment blocked (403 Forbidden)
```

**Scenario 3: Station Closes During Payment**
```
1. User books at 21:55 (station open)
2. User starts payment at 21:59
3. Station closes at 22:00
4. Auto-update detects closure
5. Result: Payment section disappears
6. Result: If submitted anyway → Backend rejects
```

---

## 🔧 Configuration

### Database
```python
# SQLite (Development)
DATABASE_URL = "sqlite:///./ev_charging.db"

# PostgreSQL (Production)
DATABASE_URL = "postgresql://user:password@localhost:5432/ev_charging"
```

### Server Ports
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Station Timing
Edit in database:
```python
stations.open_time = "08:00:00"    # 24-hour format
stations.close_time = "22:00:00"   # 24-hour format
```

---

## 📚 Documentation

- **COMPLETE_GUIDE.md** - Full technical documentation
- **QUICK_START.md** - 5-minute setup guide
- **API Documentation** - http://localhost:8000/api/docs (Swagger UI)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version          # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt

# Check port 8000 is available
netstat -ano | findstr :8000
```

### Frontend won't start
```bash
# Check Node version
node --version            # Should be 16+

# Clear cache
npm cache clean --force

# Reinstall
npm install

# Start
npm start
```

### Station timing not working
1. Check backend logs for errors
2. Verify database has sample data: `python -c "from app.database_init import seed_sample_data; seed_sample_data()"`
3. Check system time is correct
4. Visit: http://localhost:8000/api/time to verify server time

---

## 📦 Dependencies

### Backend
- FastAPI (Web framework)
- SQLAlchemy (ORM)
- Uvicorn (ASGI server)
- Pydantic (Data validation)

### Frontend
- React (UI framework)
- CSS3 (Styling)

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Home page shows stations with open/closed status
- [ ] Clicking station shows details
- [ ] "Book Now" button appears ONLY for open stations
- [ ] Can create a booking
- [ ] Payment section appears after booking
- [ ] Can complete payment
- [ ] API docs available at /api/docs
- [ ] Auto-update works (every 30 seconds)
- [ ] Station closes during payment → Payment blocked

---

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
```bash
# Create Procfile
echo "web: uvicorn app.main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify)
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=build
```

---

## 📝 Key Implementation Details

### Why This Architecture?

1. **Backend-First Validation**
   - Server is authoritative
   - Frontend cannot override decisions
   - Prevents cheating or bugs

2. **Triple-Layer Check**
   - Utility function: Core logic
   - Route handler: Business rules
   - Frontend: User experience
   - Each layer catches issues

3. **Live Auto-Update**
   - Every 30 seconds
   - No manual refresh
   - Identical behavior in both videos

4. **Professional Error Handling**
   - Specific HTTP status codes
   - Clear error messages
   - Comprehensive logging

---

## 🎬 Demo Scenarios

### Video 1: Successful Booking Flow
1. Start on home page
2. See stations with status
3. Click "Book Now" for open station
4. Select charger and time
5. Booking confirms
6. Payment section appears
7. Select payment method
8. Payment succeeds

### Video 2: Station Closes During Process
1. Same as Video 1
2. But time is near station closing
3. After booking, wait for auto-update
4. Station closes (auto-detected)
5. Payment section disappears
6. Error message shown
7. If you try to pay → Backend blocks it

---

## 💡 Special Features

✨ **Live Status Updates**
- Polling every 30 seconds
- No page refresh needed
- User sees real-time changes

✨ **Charger Management**
- Multiple chargers per station
- Real-time availability
- Prevents overbooking

✨ **Professional UI**
- Responsive design
- Clear status badges
- Intuitive flow

✨ **Production Ready**
- Error handling
- Logging
- Type hints
- Documentation

---

## 📞 Support

For issues or questions:
1. Check **COMPLETE_GUIDE.md** for detailed docs
2. Review **QUICK_START.md** for setup help
3. Check API docs at http://localhost:8000/api/docs
4. Run **test_api.py** to verify setup
5. Check backend/frontend logs in terminal

---

## 📄 License

This project is for educational purposes.

---

## 🎉 You're All Set!

```
✓ Full-stack application ready
✓ Station timing logic implemented
✓ Booking validation working
✓ Payment processing ready
✓ Same behavior in both videos
✓ Production-grade code
✓ Comprehensive documentation
```

**Start the application and enjoy!** 🚀

---

**Version:** 1.0.0  
**Last Updated:** January 21, 2025  
**Status:** ✓ Production Ready
