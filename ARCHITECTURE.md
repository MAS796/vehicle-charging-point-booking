# 🏗️ System Architecture & Data Flow

## System Components Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Home Page      │  │  Station Details │  │  Payment     │  │
│  │  - List stations │  │  - Show timing   │  │  - Show form │  │
│  │  - Show status   │  │  - Book slot     │  │  - Process   │  │
│  │  - Filter        │  │  - Show payment  │  │  - Confirm   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│         ↓                      ↓                      ↓            │
│      Auto-Update          Live Update           Payment Form       │
│      (30 seconds)        (30 seconds)           (Real-time check)  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND API (FastAPI)                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          STATIONS ROUTER                                │   │
│  │  GET /api/stations           → List all stations       │   │
│  │  GET /api/stations/{id}      → Station details         │   │
│  │  GET /api/stations/{id}/status → Real-time status ⭐   │   │
│  │  GET /api/stations/{id}/chargers/available            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          BOOKINGS ROUTER (HARD VALIDATION)              │   │
│  │  POST /api/bookings → Create booking (blocks if closed)│   │
│  │         ↓                                               │   │
│  │    1. Check station exists                             │   │
│  │    2. ⚠️ Check station OPEN (403 if closed)           │   │
│  │    3. Check charger available                          │   │
│  │    4. Create booking                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          PAYMENTS ROUTER (FINAL VALIDATION)             │   │
│  │  POST /api/payments/process → Process payment          │   │
│  │         ↓                                               │   │
│  │    1. Check booking exists                             │   │
│  │    2. ⚠️ Check station OPEN (403 if closed)           │   │
│  │    3. Validate amount                                  │   │
│  │    4. Process payment                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     TIME VALIDATION UTILITY (SOURCE OF TRUTH)           │   │
│  │     def is_station_open(open_time, close_time):        │   │
│  │         now = datetime.now().time()                    │   │
│  │         return open_time <= now <= close_time          │   │
│  │                                                         │   │
│  │     Used in: EVERY booking/payment validation ⭐        │   │
│  │     Bypass: IMPOSSIBLE - Server controls everything   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ SQL ↓
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (SQLite/PostgreSQL)                        │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   STATIONS       │  │   CHARGERS       │  │   BOOKINGS   │  │
│  │  - id (PK)       │  │  - id (PK)       │  │  - id (PK)   │  │
│  │  - name          │  │  - station_id    │  │  - station_id│  │
│  │  - location      │  │  - charger_num   │  │  - charger_id│  │
│  │  - open_time ⭐   │  │  - charger_type  │  │  - user_id   │  │
│  │  - close_time ⭐  │  │  - power_rating  │  │  - slot_time │  │
│  │  - price         │  │  - status        │  │  - status    │  │
│  │  - status        │  │                  │  │                │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│           ↓                    ↓                      ↓           │
│    (Source of Truth)   (Assignment to      (Booking Record)      │
│    for station hours)  slots & users)                            │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │   USERS          │  │   PAYMENTS       │                      │
│  │  - id (PK)       │  │  - id (PK)       │                      │
│  │  - email         │  │  - booking_id    │                      │
│  │  - username      │  │  - user_id       │                      │
│  │  - password_hash │  │  - amount        │                      │
│  │  - is_active     │  │  - payment_method                       │
│  │  - role          │  │  - transaction_id                       │
│  │                  │  │  - status        │                      │
│  └──────────────────┘  └──────────────────┘                      │
│   (User accounts)      (Payment records)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Interaction Flow

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       ├─── VISIT HOME PAGE
       │    ↓
       │    GET /api/stations
       │    ↓
       │    Backend retrieves stations + is_open status
       │    ↓
       │    Frontend displays:
       │    - Station list
       │    - 🟢 OPEN badge (if is_open == true)
       │    - 🔴 CLOSED badge (if is_open == false)
       │    - "Book Now" button (ONLY if is_open == true)
       │
       ├─── CLICK STATION
       │    ↓
       │    GET /api/stations/{id}
       │    ↓
       │    Backend returns:
       │    - Station details
       │    - Charger list
       │    - is_open status
       │    - Current server time
       │    ↓
       │    Frontend displays:
       │    - Station info
       │    - Real-time status badge
       │    - Charger grid
       │    - Time slot input
       │    - "Book Your Slot" button (ONLY if is_open)
       │
       ├─── AUTO-UPDATE (Every 30 seconds)
       │    ↓
       │    GET /api/stations/{id}/status (lightweight)
       │    ↓
       │    If is_open changed:
       │    - Show/hide booking button
       │    - Show/hide payment section
       │
       ├─── SELECT SLOT & CLICK "BOOK NOW"
       │    ↓
       │    POST /api/bookings
       │    {
       │      station_id: 1,
       │      user_id: 1,
       │      slot_time: "2025-01-21T14:00:00"
       │    }
       │    ↓
       │    BACKEND VALIDATION:
       │    ✓ Validate time format
       │    ✓ Check station exists & ACTIVE
       │    ⚠️ CHECK STATION IS OPEN ← HARD BLOCK
       │    ✓ Check charger available
       │    ✓ Check user active
       │    ↓
       │    SUCCESS (200):
       │    {
       │      booking_id: 1,
       │      charger_number: 1,
       │      status: "CONFIRMED"
       │    }
       │    ↓
       │    Frontend displays:
       │    - Booking confirmation
       │    - Payment section appears
       │
       │    OR ERROR (403):
       │    "Station is closed. Bookings not allowed."
       │    ↓
       │    Frontend:
       │    - Show error message
       │    - Payment section remains hidden
       │
       ├─── CONTINUE TO PAYMENT
       │    ↓
       │    SELECT PAYMENT METHOD
       │    ↓
       │    Auto-check station status:
       │    GET /api/stations/{id}/status
       │    If is_open == false:
       │    - Hide payment section
       │    - Show warning: "Station closed"
       │
       ├─── CLICK "COMPLETE PAYMENT"
       │    ↓
       │    POST /api/payments/process
       │    {
       │      booking_id: 1,
       │      payment_method: "UPI",
       │      amount: "100"
       │    }
       │    ↓
       │    BACKEND VALIDATION:
       │    ✓ Check booking exists & CONFIRMED
       │    ⚠️ CHECK STATION IS OPEN ← FINAL GATE
       │    ✓ Check user active
       │    ✓ Validate amount
       │    ↓
       │    SUCCESS (200):
       │    {
       │      transaction_id: "TXN_ABC123",
       │      status: "SUCCESS"
       │    }
       │    ↓
       │    Frontend displays:
       │    - Payment confirmation
       │    - Transaction details
       │
       │    OR ERROR (403):
       │    "Payment blocked. Station is closed."
       │    ↓
       │    Frontend:
       │    - Payment section disappears
       │    - Error message shown
       │
       └─── DONE
```

---

## Data Model Relationships

```
                           ┌──────────────────┐
                           │     USERS        │
                           │  - id (PK)       │
                           │  - email         │
                           │  - username      │
                           │  - is_active     │
                           └────────┬─────────┘
                                    │ 1:N
                                    │
                    ┌───────────────┼───────────────┐
                    │ has many      │ has many      │
                    ↓               ↓
            ┌──────────────┐  ┌──────────────────┐
            │  BOOKINGS    │  │  PAYMENTS        │
            │  - id (PK)   │  │  - id (PK)       │
            │  - user_id   │  │  - user_id (FK)  │
            │  - station_id│──│  - booking_id(FK)│
            │  - charger_id│  │  - amount        │
            │  - slot_time │  │  - method        │
            │  - status    │  │  - transaction_id│
            │  - created_at│  │  - status        │
            └────┬─────────┘  └──────────────────┘
                 │
    ┌────────────┼────────────┐
    │ belongs to │ belongs to │
    ↓            ↓
┌──────────────┐ ┌──────────────┐
│  STATIONS    │ │   CHARGERS   │
│  - id (PK)   │ │  - id (PK)   │
│  - name      │ │  - station_id│
│  - location  │ │  - charger_# │
│  - open_time │ │  - type      │
│  - close_time│ │  - power     │
│  - price     │ │  - status    │
│  - status    │ └──────────────┘
└──────────────┘  (1:N relationship)
                  (One station,
                   many chargers)
```

---

## Time Validation Flow (CRITICAL)

```
WHEN: User wants to book a station

STEP 1: Frontend displays available stations
        ↓
        GET /api/stations
        ↓
        Backend calls is_station_open(open_time, close_time)
        ↓
        Returns list with is_open = true/false
        ↓
        Frontend shows:
        - 🟢 OPEN if is_open == true
        - 🔴 CLOSED if is_open == false
        - "Book Now" button ONLY if is_open == true

STEP 2: User clicks "Book Now"
        ↓
        POST /api/bookings
        ↓
        Backend calls is_station_open(open_time, close_time)
        ↓
        If is_open == false:
            Return 403 Forbidden
            Error: "Station is closed. Booking not allowed."
        ↓
        If is_open == true:
            Proceed with booking logic
            Create booking
            Return success (200)

STEP 3: User clicks "Complete Payment"
        ↓
        POST /api/payments/process
        ↓
        Backend calls is_station_open(open_time, close_time)
        ↓
        If is_open == false:
            Return 403 Forbidden
            Error: "Payment blocked. Station is closed."
        ↓
        If is_open == true:
            Process payment
            Return success (200)

KEY INSIGHT:
- is_station_open() is called MULTIPLE TIMES
- Each time with current server time
- Server time is ALWAYS authoritative
- Frontend cannot override backend decision
- Even if API called directly, validation applies
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────┐
│              API Request Received                    │
└────────┬────────────────────────────────────────────┘
         │
         ├─ Check Request Format
         │  └─ Invalid → 400 Bad Request
         │
         ├─ Check Authentication
         │  └─ Unauthorized → 401 Unauthorized
         │
         ├─ Validate Input Data (Pydantic)
         │  └─ Invalid → 422 Unprocessable Entity
         │
         ├─ Check Resource Exists
         │  └─ Not found → 404 Not Found
         │
         ├─ Check Business Logic
         │  ├─ Station closed → 403 Forbidden ⚠️
         │  ├─ No chargers available → 409 Conflict
         │  ├─ User inactive → 403 Forbidden
         │  └─ Amount invalid → 400 Bad Request
         │
         ├─ Execute Operation
         │  └─ Success → 200 OK + Response Data
         │
         └─ Return Response
```

---

## Live Update Mechanism

```
Frontend                          Backend
│                                   │
├─ Initial Load                     │
│  GET /api/stations/{id}          │
│  ←─────────────────────────────────┤ Send full details
│  Display booking form              │
│                                   │
├─ Start 30-second timer            │
│                                   │
├─ Timer fires (30 seconds)         │
│  GET /api/stations/{id}/status   │
│  ←─────────────────────────────────┤ Send lightweight update
│  Check if is_open changed         │
│  ├─ If changed from false → true: │
│  │  Show booking button            │
│  │  Clear error message            │
│  ├─ If changed from true → false: │
│  │  Hide booking button            │
│  │  Show error message             │
│  │  Hide payment section           │
│  └─ If unchanged: Do nothing       │
│                                   │
├─ Timer fires again (30 seconds)   │
│  ... repeat ...                    │
│                                   │
└─ User closes page                 │
   Stop timer                        │
   No more requests                  │
```

---

## Security Architecture

```
SECURITY LAYERS:

Layer 1: Request Validation
├─ Check data types (Pydantic)
├─ Check required fields
├─ Check value ranges
└─ Reject invalid → 400 Bad Request

Layer 2: Authentication
├─ Check user ID
├─ Check user is active
└─ Reject unauthorized → 401 Unauthorized

Layer 3: Business Rules
├─ Check resources exist
├─ Check timing constraints
├─ Check capacity constraints
└─ Reject invalid → 403 Forbidden

Layer 4: Database
├─ Foreign key constraints
├─ Data integrity checks
├─ Transaction rollback on error
└─ Prevent corrupt data

STATION TIMING SECURITY:
├─ Stored in database (not client)
├─ Checked on EVERY booking/payment
├─ Uses server time (not client time)
├─ Cannot be bypassed with API
├─ Cannot be disabled by frontend
└─ Maximum security ✓
```

---

## Performance Considerations

```
ENDPOINTS & PERFORMANCE:

Heavy Operations (Full Response):
- GET /api/stations/{id}           [~100ms] Used once
- POST /api/bookings               [~200ms] Used once
- POST /api/payments/process       [~200ms] Used once

Light Operations (Quick Response):
- GET /api/stations                [~50ms] Used on home load
- GET /api/stations/{id}/status    [~20ms] Used every 30sec ⭐
- GET /api/stations/{id}/chargers/available [~50ms] On-demand

Light Status Endpoint Benefits:
✓ Minimal database queries
✓ No charger/user data
✓ Fast response (20-30ms)
✓ Suitable for 30-sec polling
✓ Low server load
✓ Low bandwidth usage
```

---

This architecture ensures:
- ✅ Backend-first validation
- ✅ No client bypass possible
- ✅ Real-time status updates
- ✅ Professional error handling
- ✅ Optimal performance
- ✅ Maximum security
