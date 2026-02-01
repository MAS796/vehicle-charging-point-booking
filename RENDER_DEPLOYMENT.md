# 🚀 Deploy Backend to Render.com

Follow these steps to deploy your FastAPI backend:

## Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Authorize your GitHub account

## Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository: `vehicle-charging-point-booking`
3. Click "Connect"

## Step 3: Configure Service
Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `vehicle-charging-api` |
| **Environment** | `Python 3` |
| **Region** | `Oregon` (or closest to you) |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `gunicorn -w 4 -k uvicorn.workers.UvicornWorker --chdir backend app.main:app` |

## Step 4: Add Environment Variables
Under "Environment" section, add these variables:
- **MAIL_USERNAME**: `mohammedafnans391@gmail.com`
- **MAIL_PASSWORD**: `iljerqcyrfulccvc`
- **MAIL_FROM**: `mohammedafnans391@gmail.com`
- **MAIL_SERVER**: `smtp.gmail.com`
- **MAIL_PORT**: `587`

## Step 5: Select Plan
- Choose **Free** plan (limited resources but free)
- Click "Create Web Service"

## Step 6: Wait for Deployment
- Render will automatically build and deploy your backend
- Watch the deployment logs
- When complete, you'll get a URL like: `https://vehicle-charging-api.onrender.com`

## Step 7: Update Frontend API URL

After deployment, update your frontend to use the new backend URL:

### Edit `frontend/src/services/api.js`:
```javascript
const getBackendURL = () => {
  // In production (GitHub Pages), use your deployed backend
  if (process.env.NODE_ENV === "production") {
    return "https://vehicle-charging-api.onrender.com";
  }
  // Development
  return "http://127.0.0.1:8000";
};
```

## Step 8: Rebuild and Redeploy Frontend
```bash
cd frontend
npm run build
# Then deploy to gh-pages as before
```

---

## ✅ You'll Have:
- Backend API: `https://vehicle-charging-api.onrender.com`
- Frontend App: `https://mas796.github.io/vehicle-charging-point-booking/`
- Both fully connected! ✨

## 🔗 Useful Links:
- Render Dashboard: https://dashboard.render.com
- Monitor Logs: Go to your service → "Logs" tab
- Update Environment Variables: Service settings → "Environment"

---

**Note**: Free tier on Render has limitations:
- Services spin down after 15 minutes of inactivity
- First request takes 30 seconds to wake up
- For production, upgrade to Starter plan (~$7/month)
