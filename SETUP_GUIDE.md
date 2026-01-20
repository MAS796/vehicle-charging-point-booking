# Vehicle Charging Point Booking - Setup Guide

## Frontend & Backend Connection

Your application is now fully connected! Here's what has been configured:

### Backend (FastAPI - Port 8000)
✅ **API Base URL**: `http://127.0.0.1:8000`
✅ **CORS Configured**: Allows requests from `http://localhost:3000`

#### Available API Endpoints:

**Stations**
- `GET /stations/` - Get all stations
- `GET /stations/{station_id}` - Get specific station details
- `POST /stations/nearby` - Find nearby stations by coordinates
  ```json
  {
    "lat": 28.6139,
    "lon": 77.2090
  }
  ```

**Bookings**
- `POST /bookings/` - Create a new booking
  ```json
  {
    "station_id": 1,
    "name": "John Doe",
    "car_number": "ABC1234",
    "phone": "9876543210",
    "hours": 2
  }
  ```
- `GET /bookings/` - Get all bookings

**Payments**
- `POST /payments/process` - Process a payment
  ```json
  {
    "booking_id": 1,
    "amount": 120,
    "phone": "9876543210"
  }
  ```
- `GET /payments/{payment_id}` - Get payment details

**Admin**
- `GET /admin/stats` - Get dashboard statistics
- `GET /admin/stations` - Get all stations
- `POST /admin/stations` - Create a new station
- `DELETE /admin/stations/{station_id}` - Delete a station
- `GET /admin/bookings` - Get all bookings
- `PUT /admin/bookings/{booking_id}` - Update booking status
- `GET /admin/payments` - Get all payments

### Frontend (React - Port 3000)
✅ **API Service**: `src/services/api.js` - Pre-configured with Axios
✅ **Available Pages**:
- `/` - Home (Find nearby stations)
- `/station/:id` - Station details & booking form
- `/payment` - Payment page
- `/admin` - Admin dashboard
- `/admin/stations` - Manage stations
- `/admin/bookings` - View all bookings
- `/admin/nearby` - Test nearby stations

## Prerequisites

Before running the application, ensure you have:

1. **Python** (3.8+)
2. **Node.js** (14+)
3. **PostgreSQL** (11+)
4. **Docker** (optional, for containerized setup)

## Installation & Running

### Option 1: Local Development (Recommended)

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create PostgreSQL database
# Make sure PostgreSQL is running and create a database called 'charging_db'

# Run migrations (if any)
python -m alembic upgrade head  # Skip if no migrations

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at: `http://127.0.0.1:8000`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: `http://localhost:3000`

### Option 2: Docker Compose (Complete Stack)

```bash
# From the project root directory
cd docker

docker-compose up -d

# Access the services:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

To stop the containers:
```bash
docker-compose down
```

## Database Setup

### For PostgreSQL (Local)

1. **Create the database**:
   ```sql
   CREATE DATABASE charging_db;
   ```

2. **The tables will be created automatically** when you run the FastAPI backend (see `Base.metadata.create_all(bind=engine)` in main.py)

3. **Optional - Seed test data** (run after backend starts):
   ```bash
   psql -U postgres -d charging_db < database/sample_data.sql
   ```

## Testing the Connection

1. Start the backend: `uvicorn app.main:app --reload --port 8000`
2. Start the frontend: `npm start` in the frontend directory
3. Open browser to `http://localhost:3000`
4. Test features:
   - Click "Find Nearby Stations" on home page (requires geolocation)
   - Navigate to `/admin/nearby` to test nearby stations
   - Go to `/admin/stations` to manage stations
   - View bookings at `/admin/bookings`

## Troubleshooting

### Backend Not Connecting
- Ensure backend is running on port 8000
- Check CORS configuration in `backend/app/main.py`
- Verify database connection string in `backend/app/database.py`

### Geolocation Not Working
- Ensure your browser allows geolocation access
- Use HTTPS in production (geolocation requires secure context)

### Database Errors
- Verify PostgreSQL is running
- Check database credentials in `backend/app/database.py`
- Ensure the `charging_db` database exists

## Key Updates Made

✅ **Backend Enhancements**:
- Added complete `/stations/nearby` endpoint with distance calculation
- Added GET endpoint to retrieve specific station details
- Enhanced payments router with full payment processing
- Improved admin router with station management (create, delete)
- Added booking status update endpoint

✅ **Frontend Enhancements**:
- Updated Payment page to use correct API endpoint
- Enhanced AllStations page with:
  - Load all existing stations on mount
  - Add new stations form
  - Delete station functionality
- API service properly configured with Axios interceptors

## Environment Variables (Optional)

Create a `.env` file in the `backend` directory:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/charging_db
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Next Steps

1. **Add Authentication**: Implement JWT authentication for admin panel
2. **Add Unit Tests**: Create tests for API endpoints
3. **Deployment**: Deploy to production using Heroku, AWS, or similar
4. **Real Payments**: Integrate with payment gateway (Stripe, Razorpay)
5. **Enhanced Features**: Add real-time booking updates with WebSockets

---

**Everything is now connected and ready to use!**
