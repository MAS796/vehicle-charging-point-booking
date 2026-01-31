# Testing Checklist - Vehicle Charging Point Booking System

## ✅ Server Status
- **Backend**: http://127.0.0.1:8000 - RUNNING
- **Frontend**: http://localhost:3000 - RUNNING
- **API Docs**: http://127.0.0.1:8000/docs

---

## 🧪 Test Cases

### 1. Test Login Page Redirect (NOT logged in)
**Steps:**
1. Open new browser/incognito window
2. Clear localStorage (DevTools → Application → localStorage → Clear)
3. Go to http://localhost:3000/login
4. ✅ Login form should be visible

**Expected Result:** Login page displays with form

---

### 2. Test Login Page Redirect (AFTER login)
**Steps:**
1. Complete login with credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
2. After successful login, you're redirected to home
3. Try to go back to http://localhost:3000/login
4. ✅ Should AUTOMATICALLY redirect to http://localhost:3000 (home page)

**Expected Result:** Cannot access /login when logged in - automatic redirect to home

---

### 3. Test Admin Login Page Protection
**Steps:**
1. Login as regular user (if available) or register new user:
   - Email: `testuser@example.com`
   - Name: `Test User`
   - Phone: `9876543210`
   - Password: `test123`
2. After login, try to access http://localhost:3000/admin/login
3. ✅ Should AUTOMATICALLY redirect to home page

**Expected Result:** Cannot access admin login when logged in - automatic redirect

---

### 4. Test Company Detail Page
**Steps:**
1. Go to http://localhost:3000/companies
2. Click on any company (e.g., "Siemens" or "Tesla")
3. Verify the following sections are displayed:
   - ✅ Company name and country
   - ✅ 💡 Core Solutions (with check mark icons)
   - ✅ 🏢 Industries Served (as badges)
   - ✅ ⭐ Competitive Advantages (as list)
   - ✅ 📊 Stats section
   - ✅ 🔗 Links section

**Expected Result:** All sections visible with proper styling and icons

**Data to see:**
- Solutions like "EV Charging Infrastructure", "Grid Integration", etc.
- Industries like "Transportation", "Energy", etc.
- Advantages like "Global Presence", "Advanced Technology", etc.

---

### 5. Test Dashboard Access (Protected Route)
**Steps:**
1. Without logging in, try to access http://localhost:3000/dashboard
2. ✅ Should redirect to home page (not logged in)
3. Login as admin (admin@example.com / admin123)
4. Go to http://localhost:3000/dashboard
5. ✅ Dashboard should load successfully

**Expected Result:** 
- Unauthenticated users cannot access dashboard
- Authenticated users can access dashboard

---

### 6. Test Authentication Flow
**Steps:**
1. Check browser DevTools → Application → localStorage
2. After login, verify these keys exist:
   - ✅ `token` - JWT access token
   - ✅ `user` - JSON with user data (id, email, name, is_admin)
   - ✅ `email` - user email
3. ✅ Token should be used in Authorization header for API requests

**Expected Result:** localStorage contains proper authentication data

---

### 7. Test API Endpoints
**Using Swagger UI at http://127.0.0.1:8000/docs:**

1. **GET /companies**
   - ✅ Returns array of 10+ companies
   - ✅ Each company has: id, name, country, category, description, solutions[], industries[], advantages[]

2. **GET /companies/{id}**
   - ✅ Returns single company with full details
   - Try ID 1: Should return Siemens or first company

3. **POST /auth/login**
   - ✅ Login with admin@example.com / admin123
   - ✅ Returns: access_token, token_type, user object

4. **GET /auth/verify**
   - ✅ Verify token validity
   - Include token in Authorization header

---

## 🔍 Browser Console Checks

**Open DevTools (F12) → Console tab:**

1. ✅ No red error messages
2. ✅ No 404 errors for API calls
3. ✅ No CORS errors
4. ✅ No "undefined" reference errors

**Common issues to check:**
- `GET http://127.0.0.1:8000/companies 404` - API not running
- `Access to XMLHttpRequest blocked by CORS` - Backend CORS misconfigured
- `Cannot read property of undefined` - Missing data handling

---

## 📋 Final Verification

- [ ] Backend server running and responding
- [ ] Frontend server running and compiling
- [ ] Login page not visible when logged in
- [ ] Admin login not visible when user logged in
- [ ] Company detail page shows all information:
  - [ ] Solutions with icons
  - [ ] Industries as badges
  - [ ] Advantages as list
  - [ ] Stats section
- [ ] Dashboard only accessible when logged in
- [ ] No console errors
- [ ] localStorage has token and user data after login
- [ ] All API endpoints responding correctly

---

## 🔧 Troubleshooting

### Issue: Login page still visible after login
**Solution:**
1. Clear localStorage: DevTools → Application → localhost → Clear all
2. Hard refresh page: Ctrl+Shift+R
3. Check if Login.jsx has useEffect redirect logic

### Issue: Company detail page shows no information
**Solution:**
1. Check Network tab in DevTools for failed API calls
2. Verify company ID exists: GET http://127.0.0.1:8000/companies/1
3. Check console for error messages

### Issue: Admin login accessible when logged in
**Solution:**
1. Check AdminLogin.jsx has useEffect that checks localStorage
2. Verify navigation import is correct
3. Hard refresh and test again

### Issue: Console errors about undefined
**Solution:**
1. Check that API responses have all required fields
2. Use optional chaining (?.) in components
3. Add fallback values in state initialization

---

## 📊 Database Verification

**10 Companies loaded:**
1. Siemens
2. Tesla
3. BP Pulse
4. ABB
5. Tata Power EV
6. ChargePoint
7. Electrify America
8. Fortum
9. EVgo
10. EVFY

**Each company has:**
- ✅ name, country, category
- ✅ description (overview)
- ✅ solutions[] array (5-8 items)
- ✅ industries[] array (3-5 items)
- ✅ advantages[] array (4-6 items)
- ✅ website/officialLink
- ✅ employees, revenue (if available)

---

## 🚀 Success Criteria (All must pass)

- ✅ Both servers running without errors
- ✅ Login/Admin login redirects working correctly
- ✅ Company detail page shows complete information
- ✅ Dashboard accessible only when authenticated
- ✅ No console errors
- ✅ All data displaying properly
- ✅ Authentication tokens stored in localStorage
- ✅ API endpoints responding correctly

---

**Last Updated:** January 30, 2026
**Status:** Ready for Testing
