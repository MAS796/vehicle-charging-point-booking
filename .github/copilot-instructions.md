# Copilot Instructions for Vehicle Charging Point Booking System

## System Architecture Overview

This is a full-stack vehicle charging booking application with:
- **Frontend**: React 18 SPA (port 3000)
- **Backend**: FastAPI Python (port 8000)
- **Database**: SQLite/PostgreSQL with SQLAlchemy ORM

### Core Components

**Backend Structure:**
```
backend/app/
├── main.py              # FastAPI app initialization, CORS setup
├── models.py            # SQLAlchemy models (User, ChargingStation, Booking, Payment)
├── schemas.py           # Pydantic request/response schemas
├── database.py          # Database connection and session management
├── routers/             # API endpoint handlers
│   ├── auth.py         # Login, register, token verification
│   ├── stations.py     # Station listing, details, nearby stations, status
│   ├── bookings.py     # Booking creation and listing
│   ├── payments.py     # Payment processing
│   └── admin.py        # Admin endpoints
├── services/           # Business logic
│   ├── auth_service.py      # Password hashing/verification, user creation
│   ├── booking_service.py   # Booking logic
│   ├── payment_service.py   # Payment processing
│   └── admin_auth.py        # Admin-specific auth
└── utils/
    ├── time_utils.py   # Station open/closed time checking
    └── geo.py          # Geolocation utilities
```

**Frontend Structure:**
```
frontend/src/
├── App.jsx              # Main app component with routing
├── pages/              # Page components
│   ├── Home.jsx        # Station listing page
│   ├── Login.jsx       # User login (real backend auth)
│   ├── AdminLogin.jsx  # Admin login (real backend auth)
│   ├── Register.jsx    # User registration
│   ├── StationDetails.jsx  # Booking interface
│   ├── Payment.jsx     # Payment processing
│   └── NearbyStations.jsx  # Geolocation-based station search
├── components/         # Reusable components
├── services/          # API client
│   └── api.js         # Axios instance for backend calls
└── styles/            # CSS files
```

---

## Critical Authentication System

### Backend Auth Flow (auth_service.py)

**Password Hashing:**
```python
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 10000)
    return f"{salt}${pwd_hash.hex()}"
```
- Uses SHA-256 with random salt
- 10,000 iterations for speed
- Format: `salt$hash`

**Authentication:**
```python
def authenticate_user(db, email, password) -> User or None:
    user = db.query(User).filter(User.email == email).first()
    if user and verify_password(user.password_hash, password):
        return user
    return None
```

### API Endpoints

**Authentication:**
- `POST /auth/register` - Register new user (email, name, phone, password)
- `POST /auth/login` - Login (email, password) → returns {access_token, user}
- `GET /auth/verify` - Verify token validity
- `GET /auth/profile/{user_id}` - Get user profile

**Response Format:**
```json
{
  "access_token": "base64-encoded-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "is_admin": false,
    "is_active": true,
    "created_at": "2026-01-24T..."
  }
}
```

### Frontend Implementation (Login.jsx, AdminLogin.jsx)

**Store Token & User:**
```javascript
localStorage.setItem("token", res.data.access_token);
localStorage.setItem("user", JSON.stringify(res.data.user));
localStorage.setItem("email", res.data.user.email);
```

**Error Handling:**
```javascript
catch (err) {
    alert(err.response?.data?.detail || "Login failed");
}
```

---

## Station Timing Validation

### Core Function (utils/time_utils.py)

```python
def is_station_open(opening_time, closing_time):
    """Returns True if current server time is between opening and closing time"""
    if not opening_time or not closing_time:
        return False
    now = datetime.now().time()
    return opening_time <= now <= closing_time
```

**Used in:**
1. `GET /stations` - Returns `is_open` for each station
2. `POST /bookings` - Blocks booking if station is closed (403 Forbidden)
3. `POST /payments/process` - Blocks payment if station is closed (403 Forbidden)
4. `GET /stations/{id}/status` - Lightweight endpoint for live updates

**Key Security Points:**
- Validation happens on EVERY booking/payment attempt
- Uses server time, NEVER client time
- Cannot bypass with direct API calls
- Returns 403 Forbidden if closed

---

## Database Models

### User Model
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    name = Column(String)
    phone = Column(String)
    password_hash = Column(String)  # Never store plain password
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### ChargingStation Model
```python
class ChargingStation(Base):
    __tablename__ = "charging_stations"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    opening_time = Column(Time)  # e.g., 08:00:00
    closing_time = Column(Time)  # e.g., 22:00:00
    available_slots = Column(Integer, default=0)
```

### Booking Model
```python
class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    station_id = Column(Integer, ForeignKey("charging_stations.id"))
    booking_start_time = Column(Time)
    hours = Column(Integer)
    amount = Column(Integer)
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    date = Column(Date)
```

---

## API Data Flows

### User Registration Flow
```
Frontend: POST /auth/register
├─ email: string (unique)
├─ name: string
├─ phone: string
└─ password: string (plain text)

Backend:
├─ Check email doesn't exist
├─ Hash password with salt
├─ Create user in database
├─ Generate token
└─ Return {access_token, user}

Frontend:
├─ Save token to localStorage
├─ Save user info to localStorage
└─ Redirect to home
```

### Station Listing Flow
```
Frontend: GET /stations

Backend:
├─ Query all stations from database
├─ For each station:
│  └─ Call is_station_open() → returns true/false
└─ Return [{id, name, address, is_open, ...}]

Frontend:
├─ Display "🟢 OPEN" badge if is_open == true
├─ Display "🔴 CLOSED" badge if is_open == false
└─ Show "Book Now" button ONLY if is_open == true
```

### Booking Flow
```
User clicks "Book Now" (only visible if is_open == true)

Frontend: POST /bookings
├─ station_id
├─ booking_start_time
└─ hours

Backend:
├─ Check station exists
├─ Check station is OPEN (call is_station_open)
│  └─ If closed → return 403 Forbidden
├─ Check charger available
├─ Create booking
└─ Return booking_id

Frontend:
├─ Show "Booking Confirmed"
└─ Display payment section
```

### Payment Flow
```
User clicks "Complete Payment"

Frontend: POST /payments/process
├─ booking_id
├─ amount
└─ payment_method

Backend:
├─ Check booking exists
├─ Check station is OPEN (final validation)
│  └─ If closed → return 403 Forbidden
├─ Process payment
└─ Return transaction_id

Frontend:
├─ Show payment confirmation
└─ Display transaction details
```

---

## Live Update Mechanism

**Frontend (30-second polling):**
```javascript
setInterval(async () => {
    const res = await axios.get(`/api/stations/${stationId}/status`);
    if (res.data.is_open !== previousStatus) {
        // Station status changed
        if (!res.data.is_open) {
            // Station closed - hide booking button
            // Clear any pending forms
        }
    }
}, 30000);
```

**Backend (`/stations/{id}/status`):**
- Lightweight endpoint
- Only returns: `{id, is_open, current_time}`
- Uses `is_station_open()` for status
- ~20-30ms response time

---

## Error Handling Standards

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid input (missing fields, wrong format)
- `401 Unauthorized` - Authentication failed (invalid email/password)
- `403 Forbidden` - Business rule violation (station closed, charger unavailable)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (user already exists, no slots available)
- `500 Internal Server Error` - Unexpected error

**Error Response Format:**
```json
{
  "detail": "Station is closed. Booking not allowed."
}
```

**Frontend Handling:**
```javascript
catch (err) {
    const message = err.response?.data?.detail || "An error occurred";
    alert(message);
}
```

---

## Development Workflow

### Starting the System

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Access Points:**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

### Creating Default Admin User

**Method 1: Swagger UI**
1. Go to http://localhost:8000/docs
2. POST /auth/register
3. JSON: `{"email": "admin@example.com", "name": "Admin", "phone": "9999999999", "password": "admin123"}`

**Method 2: Python Script**
```bash
cd backend
python create_admin.py
```

### Database Operations

**Create tables on startup:**
```python
Base.metadata.create_all(bind=engine)  # Runs in main.py
```

**Seeding sample data:**
- Edit `seed_data.py` to add sample stations
- Call from main.py on startup if needed

---

## Project-Specific Patterns

### Password Security
- Never store plain passwords
- Always hash with salt before storing
- Compare hashed passwords during login
- Use `auth_service.py` functions only

### Station Status
- ALWAYS check `is_station_open()` before booking/payment
- Never trust client-side status
- Always use server time
- Status can change during user's session

### API Response Format
- Always wrap responses in schemas (Pydantic models)
- Use `response_model` parameter in routes
- Validate input with schemas
- Convert SQLAlchemy models to schema models

### Database Sessions
- Always use dependency injection with `Depends(get_db)`
- Close session in `finally` block
- Use `db.commit()` for writes
- Use `db.refresh()` to get updated data

---

## Common Issues & Solutions

### Issue: Backend won't start
**Solution:** Check imports and missing modules
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Issue: Login fails with "Invalid email"
**Cause:** User doesn't exist
**Solution:** Register first or create admin user

### Issue: Station open/closed status not updating
**Cause:** Frontend not polling or station hours not set
**Solution:** Verify opening_time and closing_time in database

### Issue: CORS errors in browser console
**Cause:** Frontend can't reach backend
**Solution:** Ensure backend is running on http://127.0.0.1:8000

### Issue: Token not stored in localStorage
**Cause:** Response format mismatch
**Solution:** Verify response has `access_token` field, not `token`

---

## Key Files for Common Tasks

| Task | File |
|------|------|
| Add new API endpoint | `backend/app/routers/{router_name}.py` |
| Change password hashing | `backend/app/services/auth_service.py` |
| Modify user schema | `backend/app/schemas.py` |
| Update database model | `backend/app/models.py` |
| Fix station timing | `backend/app/utils/time_utils.py` |
| Style changes | `frontend/src/styles/` |
| Add new page | `frontend/src/pages/{page_name}.jsx` |
| API configuration | `frontend/src/services/api.js` |

---

## Testing Endpoints with Swagger

Access http://localhost:8000/docs for interactive API testing:

1. **Register:** POST /auth/register
2. **Login:** POST /auth/login
3. **Get Stations:** GET /stations
4. **Get Station Details:** GET /stations/{id}
5. **Create Booking:** POST /bookings
6. **Process Payment:** POST /payments/process

---

## Performance Considerations

- **Station listing:** Returns all stations (~50-100ms)
- **Station details:** Full data with chargers (~100ms)
- **Status polling:** Lightweight endpoint (~20ms) - safe for 30-second intervals
- **Database:** SQLite for dev, PostgreSQL for production
- **Authentication:** Token-based, no sessions needed

---

**Last Updated:** January 24, 2026  
**Version:** 1.0 - Authentication System Complete
