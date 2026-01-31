# 🚀 QUICK START GUIDE

## 5-Minute Setup

### Step 1: Backend Setup (3 minutes)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# OR (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "from app.database_init import init_db, seed_sample_data; init_db(); seed_sample_data()"

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✓ Backend running at: http://localhost:8000
✓ API Docs at: http://localhost:8000/api/docs

### Step 2: Frontend Setup (2 minutes)

Open a NEW terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

✓ Frontend running at: http://localhost:3000

### Step 3: Test Everything

```bash
# In the main project folder, run tests
python test_api.py
```

---

## 🎯 What You Get

✅ **Station timing visible in real-time**
- See which stations are OPEN 🟢 or CLOSED 🔴

✅ **"Book Your Slot" button appears ONLY when station is open**
- Button is hidden if station is closed
- Backend blocks booking if you try to bypass

✅ **Payment only works when station is open**
- Payment section disappears if station closes during checkout

✅ **Live updates every 30 seconds**
- No manual refresh needed
- Same behavior in both videos

---

## 📱 Test the Flow

### 1. Open Home Page
Visit: http://localhost:3000

You'll see:
- All stations listed
- 🟢 OPEN if station is operating
- 🔴 CLOSED if station is not operating
- **"Book Now" button only appears for OPEN stations**

### 2. Click a Station
Click any station card to see details

You'll see:
- Station name and location
- Opening and closing times
- Real-time status badge
- Current server time (for verification)
- List of available chargers
- **"Book Your Slot" button (only if OPEN)**

### 3. Make a Booking
- Select charger and time slot
- Click "Book Now"
- You'll see booking confirmation

### 4. Make Payment
- Payment section appears automatically
- Select payment method (UPI/Card/Wallet)
- Click "Complete Payment"
- Payment success message appears

---

## ⏰ Test Station Timing

### Test 1: Station is Currently Open
1. Open http://localhost:3000
2. Look for stations with 🟢 OPEN badge
3. Click to view details
4. You should see "Book Your Slot" button
5. Try booking - it should work ✓

### Test 2: Station Closes During Booking
1. Wait until close to station's closing time (e.g., station closes at 22:00)
2. Open station details at 21:58
3. Select time and click "Book Now"
4. If it's still before 22:00 → Works ✓
5. If it's after 22:00 → Blocked ✓
6. This tests the hard backend validation

### Test 3: Auto-Update Feature
1. Open station details page
2. Wait for 30 seconds
3. The page automatically checks station status
4. If station is open/closed, booking button appears/disappears
5. **No page refresh needed!** ✓

---

## 🔍 View API Documentation

Visit: http://localhost:8000/api/docs

You'll see all API endpoints with:
- Request/response examples
- Parameters and descriptions
- Try-it-out button to test endpoints

---

## 📊 Database & Sample Data

The system comes with sample data:
- 3 pre-configured stations
- Different open/close times
- Multiple chargers per station
- Test users and bookings

All data is in SQLite database: `backend/ev_charging.db`

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Home page shows stations
- [ ] Stations show correct open/closed status
- [ ] Clicking station shows details
- [ ] "Book Now" button appears ONLY for open stations
- [ ] Can create a booking
- [ ] Payment section appears after booking
- [ ] Can complete payment
- [ ] API docs work at /api/docs

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Make sure you're in the backend folder
cd backend

# Activate virtual environment
venv\Scripts\activate

# Check if all dependencies are installed
pip install -r requirements.txt

# Start again
python -m uvicorn app.main:app --reload
```

### Frontend won't start
```bash
# Make sure you're in the frontend folder
cd frontend

# Clear cache
npm cache clean --force

# Reinstall
npm install

# Start
npm start
```

### Can't connect to API
- Make sure backend is running on http://localhost:8000
- Check if port 8000 is not already in use
- Try: `netstat -ano | findstr :8000` (Windows)

### Station timing logic questions
- Open: `backend/app/utils/time_utils.py`
- Booking validation: `backend/app/routers/bookings.py` (look for `is_station_open`)
- Payment validation: `backend/app/routers/payments.py` (look for `is_station_open`)

---

## 📝 Key Files

### Backend
- `backend/app/main.py` - Main app
- `backend/app/models.py` - Database models
- `backend/app/utils/time_utils.py` - Station timing logic
- `backend/app/routers/stations.py` - Station endpoints
- `backend/app/routers/bookings.py` - Booking with validation
- `backend/app/routers/payments.py` - Payment with validation

### Frontend
- `frontend/src/pages/Home.jsx` - Station list with filters
- `frontend/src/pages/StationDetails.jsx` - Booking & payment
- `frontend/src/styles/home.css` - Home page styling
- `frontend/src/styles/station-details.css` - Details page styling

---

## 🚀 Ready to Deploy?

### Backend (Heroku/Railway)
1. Create `Procfile`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. Set environment variable:
   ```
   DATABASE_URL=postgresql://...
   ```

3. Deploy

### Frontend (Netlify)
1. Run: `npm run build`
2. Deploy the `build` folder
3. Set API URL in environment variables

---

## 📞 Support

For issues or questions, check:
1. `COMPLETE_GUIDE.md` - Full documentation
2. API docs at http://localhost:8000/api/docs
3. Backend logs in terminal
4. Browser console (F12) for frontend errors

---

**Status:** ✓ Ready to Use
**Last Updated:** January 21, 2025
