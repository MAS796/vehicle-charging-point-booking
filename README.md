# Vehicle Charging Point Booking

A full-stack EV charging platform with a FastAPI backend, React frontend, admin tools, and deployment support for Railway, Netlify, and Vercel.

## Project Structure

- `backend/` - FastAPI API, models, routers, services, scripts
- `frontend/` - React + Vite web app and Capacitor mobile shell
- `scripts/` - deployment and smoke-test helpers
- `tests/` - backend and frontend integration tests
- `.env.example` - shared environment reference
- `requirements.txt` - Python dependencies
- `netlify.toml` - Netlify frontend deployment config
- `vercel.json` - Vercel frontend deployment config

## Local Development

### Backend

```bash
pip install -r requirements.txt
cd backend
python -m app.create_db
uvicorn app.main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

Optional first-run seed data:
- Set `SEED_REFERENCE_DATA=1` before `python -m app.create_db`
- Set `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` before `python -m app.create_db` to create an admin user

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend URL: `http://127.0.0.1:5173`

## Testing

### Backend

```bash
python -m pytest tests/backend -q
```

### Frontend contract tests

```bash
node --test tests/frontend/*.test.js
```

For the auth contract test, set `ENABLE_TEST_OTP_EXPOSURE=1` on the backend only in local test environments.

## Deployment

- Backend: Railway
- Frontend: Netlify or Vercel
- Production frontend env: `VITE_API_URL=https://your-backend-domain.com`
- Production backend env: `ENVIRONMENT`, `DATABASE_URL`, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS`
- Keep `AUTO_BOOTSTRAP_ON_STARTUP=0` and `ENABLE_TEST_OTP_EXPOSURE=0` in production

## Notes

- Local generated files such as logs, SQLite databases, and cache folders should not be committed.
- The Android and iOS folders are for app packaging and do not replace the web app.
