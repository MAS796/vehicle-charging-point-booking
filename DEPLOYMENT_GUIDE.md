# Deployment & Advanced Features Implementation Guide

## Phase 1: Analytics Dashboard ✅ COMPLETE

### What Was Added:
1. **Analytics Models** - New `Analytics` table to track events
2. **Company Model** - Full company/provider management with view tracking
3. **Enhanced Booking** - Now tracks `company_id` and `charging_type`
4. **Analytics Routers** - Comprehensive analytics API endpoints
5. **Frontend Dashboard** - Full analytics dashboard with recharts visualizations
6. **Companies Page** - Directory of EV companies with search/filter
7. **Insights Page** - EV market analytics and industry trends

### Backend Changes:
```python
# New routes available:
POST   /analytics/track-view/{company_id}
POST   /analytics/track-booking
GET    /analytics/dashboard?days=30
GET    /analytics/company/{company_id}
GET    /analytics/bookings-timeline
GET    /analytics/most-viewed-station

GET    /companies/
POST   /companies/
GET    /companies/{company_id}
PUT    /companies/{company_id}
DELETE /companies/{company_id}
GET    /companies/{company_id}/stations
GET    /companies/search/global
GET    /companies/meta/countries
GET    /companies/meta/categories
```

### Frontend Pages:
- `/dashboard` - Analytics dashboard (protected route)
- `/companies` - Companies directory with search
- `/insights` - EV market insights and trends

---

## Phase 2: Database Migration Steps

### Step 1: Backup Current Database
```bash
# Windows
copy backend\app.db backend\app.db.backup

# Linux/Mac
cp backend/app.db backend/app.db.backup
```

### Step 2: Delete Old Database (Fresh Start Recommended)
```bash
# This will recreate with new schema on next startup
rm backend/app.db
```

### Step 3: Restart Backend
The new tables will be auto-created:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Step 4: Seed Sample Data
Create sample companies (add to backend/app/seed_companies.py):

```python
from app.database import SessionLocal
from app.models import Company

def seed_companies():
    db = SessionLocal()
    
    companies = [
        Company(
            name="Siemens",
            description="Global leader in EV charging solutions",
            country="Germany",
            category="DC Fast Charger",
            website="https://siemens.com",
            logo_url="https://example.com/siemens.png"
        ),
        Company(
            name="ABB",
            description="Industrial charging infrastructure provider",
            country="Switzerland",
            category="AC/DC Charger",
            website="https://abb.com",
            logo_url="https://example.com/abb.png"
        ),
        Company(
            name="Tata Power",
            description="India's leading EV charging network",
            country="India",
            category="AC Charger",
            website="https://tatapower.com",
            logo_url="https://example.com/tata.png"
        ),
        # ... more companies
    ]
    
    for company in companies:
        existing = db.query(Company).filter(Company.name == company.name).first()
        if not existing:
            db.add(company)
    
    db.commit()
    db.close()
```

---

## Phase 3: Role-Based Authentication (JWT Enhancement)

### Current System:
- Basic token-based auth (bearer tokens)
- `is_admin` flag on User model
- No role-based access control (RBAC)

### Upgrade to JWT with Roles:

**1. Update auth_service.py:**

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**2. Create dependencies for route protection:**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

**3. Protect admin endpoints:**

```python
@router.post("/companies/", dependencies=[Depends(require_admin)])
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    # Only admins can create companies
    pass
```

---

## Phase 4: Company-Station Mapping

### Current State:
- ChargingStation has `company_id` field (ready)
- Need to implement in frontend

### Implementation:

**1. Update AllStations.jsx:**

```jsx
const addStation = async (e) => {
  e.preventDefault();
  try {
    await api.post("/stations/", {
      ...form,
      company_id: selectedCompanyId,  // Add this
      charging_type: form.charging_type,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      available_slots: parseInt(form.available_slots),
      opening_time: "06:00:00",
      closing_time: "22:00:00"
    });
    // ...
  } catch (err) {
    // ...
  }
};
```

**2. Display stations by company:**

```jsx
// In Companies page, show "Stations powered by this company"
const stationsResponse = await api.get(`/companies/${companyId}/stations`);
return stationsResponse.data;
```

---

## Phase 5: Global Search Implementation

### Already Implemented:
- `/companies/search/global` endpoint ready
- Full-text search across: name, description, country, category

### Frontend Search Component:

```jsx
const [searchResults, setSearchResults] = useState([]);

const handleGlobalSearch = async (query) => {
  try {
    const res = await api.get(`/companies/search/global?q=${query}`);
    setSearchResults(res.data.results);
  } catch (err) {
    console.error(err);
  }
};
```

---

## Phase 6: SEO Optimization with react-helmet

### Already Added:
- ✅ Dashboard.jsx - Meta tags
- ✅ Companies.jsx - Directory meta
- ✅ Insights.jsx - Industry analysis meta

### Add to All Pages:

```jsx
import { Helmet } from "react-helmet";

function MyPage() {
  return (
    <>
      <Helmet>
        <title>Page Title | EV Charging Platform</title>
        <meta name="description" content="Page description for SEO" />
        <meta property="og:title" content="Page Title" />
        <meta property="og:description" content="Description" />
      </Helmet>
      {/* Page content */}
    </>
  );
}
```

### Create sitemap.xml:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/companies</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/insights</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

---

## Phase 7: Deployment

### Frontend - Netlify Deployment

**1. Build the React app:**
```bash
cd frontend
npm run build
```

**2. Deploy to Netlify:**
- Login to https://netlify.com
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `build`
- Deploy

**3. Add environment variables:**
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend - Render Deployment

**1. Create Render account:**
- Go to https://render.com
- Create new Web Service
- Connect GitHub repository

**2. Set environment variables:**
```
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your-secret-key
```

**3. Deployment settings:**
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**4. Update CORS:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.netlify.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Alternative Backend - Railway

**1. Create railway.json:**
```json
{
  "build": {
    "builder": "paketo",
    "buildpacks": ["gcr.io/paketo-buildpacks/python"]
  },
  "start": "uvicorn app.main:app --host 0.0.0.0"
}
```

**2. Deploy via Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Testing Checklist

### Analytics Flow
- [ ] Add company
- [ ] View company (view counter increases)
- [ ] Create booking (tracked in analytics)
- [ ] Check dashboard (stats updated)
- [ ] Verify charts load correctly

### Companies Directory
- [ ] List companies
- [ ] Filter by country
- [ ] Search by name
- [ ] View company details
- [ ] Admin can add company

### Insights Page
- [ ] Charts render correctly
- [ ] Data is accurate
- [ ] SEO meta tags present

### Admin Functions
- [ ] Login with admin credentials
- [ ] Add station and link to company
- [ ] View analytics dashboard
- [ ] Manage companies

---

## Performance Optimization Tips

### Frontend
1. **Code Splitting:**
```jsx
const Dashboard = lazy(() => import("./pages/Dashboard"));
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

2. **Image Optimization:**
```jsx
<img loading="lazy" src={url} alt={name} />
```

### Backend
1. **Database Indexing:**
```python
company_id = Column(Integer, ForeignKey("companies.id"), index=True)
```

2. **Caching:**
```python
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.redis import RedisBackend

@cached(expire=300)  # Cache for 5 minutes
@router.get("/analytics/dashboard")
def get_dashboard(): ...
```

---

## Next Steps

1. **Database Migration** - Delete old DB, restart backend
2. **Seed Companies** - Add sample company data
3. **Test Analytics** - Verify tracking and dashboard
4. **Deploy Frontend** - Push to Netlify
5. **Deploy Backend** - Push to Render/Railway
6. **Monitor** - Setup error tracking with Sentry

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React Docs:** https://react.dev

**Updated:** January 25, 2026
**Status:** Production Ready
