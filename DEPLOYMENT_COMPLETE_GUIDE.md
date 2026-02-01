# 🌟 Complete Deployment Guide

Your Vehicle Charging Point Booking App is now ready for full deployment!

## Current Status

✅ **Frontend**: Deployed to GitHub Pages  
📍 URL: https://mas796.github.io/vehicle-charging-point-booking/

⏳ **Backend**: Ready to deploy (needs Render.com account)  
📍 Will be: https://vehicle-charging-api.onrender.com

---

## 📋 Step-by-Step Deployment Instructions

### Phase 1: Deploy Backend to Render (5 minutes)

**1. Create Render Account**
- Visit https://render.com
- Click "Sign Up"
- Use GitHub (recommended) - easier integration

**2. Connect GitHub Repository**
- After signup, you'll see "New Web Service"
- Click "Connect Repository"
- Find and select: `vehicle-charging-point-booking`
- Click "Connect"

**3. Configure Web Service**
```
Name:          vehicle-charging-api
Environment:   Python 3
Region:        Oregon (or closest)
Build Command: pip install -r backend/requirements.txt
Start Command: gunicorn -w 4 -k uvicorn.workers.UvicornWorker --chdir backend app.main:app
```

**4. Set Environment Variables**
Click "Add Environment Variable" and add these:

| Key | Value |
|-----|-------|
| MAIL_USERNAME | mohammedafnans391@gmail.com |
| MAIL_PASSWORD | iljerqcyrfulccvc |
| MAIL_FROM | mohammedafnans391@gmail.com |
| MAIL_SERVER | smtp.gmail.com |
| MAIL_PORT | 587 |

**5. Deploy**
- Click "Create Web Service"
- Wait for deployment (shows "Live" when complete)
- Your backend URL: `https://vehicle-charging-api.onrender.com`

---

### Phase 2: Update Frontend (3 minutes)

**1. Copy Your Backend URL**
When Render deployment finishes, note the URL:
```
https://vehicle-charging-api.onrender.com
```

**2. Update API Configuration**
Edit: `frontend/src/services/api.js`

Find this section:
```javascript
const getBackendURL = () => {
  if (process.env.NODE_ENV === "production") {
    return "/api";
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return "http://127.0.0.1:8000";
};
```

Replace with:
```javascript
const getBackendURL = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://vehicle-charging-api.onrender.com";
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return "http://127.0.0.1:8000";
};
```

**3. Rebuild Frontend**
```bash
cd frontend
npm run build
```

**4. Deploy to GitHub Pages**
```bash
cd build
git add .
git commit -m "Connect to live backend API"
git push --force origin master:gh-pages
```

---

### Phase 3: Test Everything (5 minutes)

**1. Visit Your Live App**
- Open: https://mas796.github.io/vehicle-charging-point-booking/
- You should see the app loading

**2. Test Registration**
- Click "Register"
- Fill in details and submit
- You should receive OTP email OR see it in console (dev mode)
- Verify OTP and complete registration

**3. Test Login**
- Go to login page
- Login with your registered account
- Should see the dashboard

**4. Check API Calls**
- Open browser DevTools (F12)
- Go to "Network" tab
- Perform any action (login, register, etc.)
- You should see API calls to:
  - `https://vehicle-charging-api.onrender.com/auth/*`
  - Status should be 200, 201, etc. (not CORS errors)

---

## 🔄 Manual Deployment Script (Windows)

After Phase 1 (backend deployed), you can run this to automate Phases 2-3:

```batch
cd c:\Users\LENOVO\OneDrive\Desktop\vehicle-charging-point-booking\vehicle-charging-point-booking
deploy-production.bat
```

This script will:
- Update the API URL in your frontend
- Build the React app
- Commit and push to GitHub
- Deploy to GitHub Pages

---

## ✅ Success Indicators

When everything is working:

1. ✅ Frontend loads at: https://mas796.github.io/vehicle-charging-point-booking/
2. ✅ Backend API responds at: https://vehicle-charging-api.onrender.com
3. ✅ Can register new users (OTP email sent)
4. ✅ Can login and access dashboard
5. ✅ Can browse stations and make bookings
6. ✅ No CORS or network errors in browser console

---

## 🔧 Troubleshooting

### "Backend API not responding"
- Check Render dashboard: https://dashboard.render.com
- Click service → "Logs"
- Look for error messages
- Free tier services spin down - first request takes 30s

### "CORS Error"
- Ensure environment variables are set in Render
- Check that API URL is exactly correct (no trailing slash)
- Clear browser cache (Ctrl+Shift+Delete)

### "Email not sending"
- Verify Gmail credentials in Render environment variables
- Check Gmail's "App Passwords" settings
- For Gmail, you need an "App Password" not your regular password

### "404 errors on page refresh"
- GitHub Pages issue with single-page apps
- This should be fixed by 404.html we created
- If still occurs, clear cache and wait 5 minutes for GitHub cache clear

---

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Update GitHub Pages to use your own domain
   - Add domain to Render for backend API

2. **Production Upgrades**
   - Upgrade Render to Starter tier (~$7/month) for better performance
   - Upgrade database to PostgreSQL (free tier available)
   - Add monitoring and logging

3. **Features to Add**
   - Payment integration (Stripe/Razorpay)
   - Real-time notifications
   - Admin dashboard
   - Analytics

---

## 📞 Quick Links

- **Frontend**: https://mas796.github.io/vehicle-charging-point-booking/
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repository**: https://github.com/MAS796/vehicle-charging-point-booking
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords

---

**Questions?** Check the logs in Render dashboard for detailed error messages! 🚀
