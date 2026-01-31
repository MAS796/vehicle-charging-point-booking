# 🧪 OTP LOGIN TESTING GUIDE

## ⚡ QUICK TEST (2 MINUTES)

### Step 1: Open the App
```
URL: http://localhost:3000
```

### Step 2: Click "Sign In"
- You should see the header with "Sign In" button
- Click it to go to OTP login page
- URL will be: http://localhost:3000/login-otp

### Step 3: Fill Registration Form
```
Name: John Doe
Email: john@example.com
Phone: 9876543210
```
- Click "Send OTP"
- Wait for OTP generation

### Step 4: Enter OTP
```
The OTP will be displayed on screen (for testing)
Copy it and paste in the OTP field
Example OTP: 123456
```

### Step 5: See Welcome Screen
- After correct OTP
- You'll see welcome screen with city icon
- Auto-redirected to home
- You're now logged in!

### Step 6: Verify Login
- Check header - should show your name
- Should have "📊 Dashboard" and "Logout" buttons
- Can click dashboard to see user area

---

## ✅ EXPECTED RESULTS

### Test 1: Successful Registration
**Input:**
```
Name: Test User
Email: test@example.com
Phone: 9876543210
```
**Expected Output:**
```
✓ OTP sent message appears
✓ OTP input screen shows
✓ Enter OTP successfully
✓ Welcome screen displays
✓ Logged in - name appears in header
```

### Test 2: Wrong OTP
**Input:**
```
OTP: 000000 (wrong OTP)
```
**Expected Output:**
```
✓ Error message: "Invalid OTP"
✓ Can try again
✓ After 3 wrong attempts: "Request new OTP"
```

### Test 3: Resend OTP
**Action:**
```
Click "Resend code?" during OTP screen
```
**Expected Output:**
```
✓ New OTP generated
✓ Can use new OTP to login
✓ Old OTP no longer works
```

### Test 4: Logged In User Access
**Input:**
```
User already logged in
Visit: http://localhost:3000/login-otp
```
**Expected Output:**
```
✓ Auto-redirected to home page
✓ Login page not accessible
```

---

## 🔍 DETAILED TESTING CHECKLIST

Print this and check as you test:

### Screen 1: Phone Registration
- [ ] Page title is "Sign up"
- [ ] Phone icon (📱) displays
- [ ] Three input fields visible:
  - [ ] Full Name field
  - [ ] Email Address field
  - [ ] Phone number field
- [ ] Country code shows "+91"
- [ ] Agreement text visible
- [ ] "Send OTP" button clickable
- [ ] Clicking with empty fields shows error
- [ ] Error message is clear

### Screen 2: OTP Verification
- [ ] Page title is "Login"
- [ ] OTP sent confirmation shows
- [ ] Email address displayed
- [ ] Check mark icon (✓) visible
- [ ] OTP input field is 6-digit
- [ ] "Resend code?" link visible
- [ ] Save button clickable
- [ ] Wrong OTP shows error
- [ ] 3 wrong attempts: "Request new OTP"
- [ ] Test OTP displayed (development mode)

### Screen 3: Welcome
- [ ] City icon/illustration displays
- [ ] Welcome heading visible
- [ ] Description text appears
- [ ] "Continue with phone number" button works
- [ ] Facebook/Google buttons visible
- [ ] Smooth animation transitions

### After Login
- [ ] Header shows user name
- [ ] "Dashboard" link appears
- [ ] "Logout" button available
- [ ] Can click dashboard
- [ ] localStorage has token and user data

---

## 🔐 SECURITY TESTING

### Test: OTP Expiration
```
1. Request OTP
2. Wait (optional - set timer)
3. Enter old OTP
Expected: Should fail (if timeout implemented)
```

### Test: Duplicate Email Prevention
```
1. Register with: test@example.com
2. Request OTP again with same email
Expected: Error - "User already exists"
```

### Test: Token Validation
```
1. Login and get token
2. Open DevTools → Application
3. Check localStorage:
   - token: JWT token
   - user: User JSON
   - email: User email
Expected: All three keys present
```

---

## 🎨 DESIGN TESTING

### Colors
- [ ] Background is dark blue/navy
- [ ] Buttons are turquoise
- [ ] Text is light colored
- [ ] Borders are subtle
- [ ] No harsh colors

### Spacing
- [ ] Proper padding around elements
- [ ] Inputs are well-spaced
- [ ] Buttons are appropriately sized
- [ ] Icons have breathing room

### Animations
- [ ] Phone icon bounces
- [ ] City illustration floats
- [ ] Smooth transitions between steps
- [ ] No lag or stuttering

---

## 📱 MOBILE TESTING

### On Mobile Device (or DevTools Mobile)
- [ ] Page fits screen width
- [ ] No horizontal scrolling
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Input fields are tap-friendly
- [ ] Text is readable
- [ ] Keyboard doesn't cover buttons
- [ ] Images scale properly

---

## 🐛 TROUBLESHOOTING

### Issue: Servers not running
**Solution:**
```
1. Check if both running:
   - Backend: http://127.0.0.1:8000/companies
   - Frontend: http://localhost:3000
2. If not, restart both servers
```

### Issue: OTP page blank
**Solution:**
```
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check console (F12) for errors
```

### Issue: "Sign In" button not visible
**Solution:**
```
1. Logout first: Clear localStorage
2. Hard refresh page
3. Should appear if not logged in
```

### Issue: OTP not showing
**Solution:**
```
1. Check console (F12) for error messages
2. Verify backend is running
3. Check if email validation error
```

### Issue: Wrong OTP still accepted
**Solution:**
```
1. Restart servers (OTP storage in memory)
2. Request new OTP
3. Use correct OTP
```

---

## 📊 API TESTING WITH SWAGGER

### Test OTP Request
```
URL: http://127.0.0.1:8000/docs
Method: POST /auth/request-otp
Body:
{
  "email": "test@example.com",
  "phone": "9876543210",
  "name": "Test User"
}
Expected: OTP returned (test mode)
```

### Test OTP Verification
```
URL: http://127.0.0.1:8000/docs
Method: POST /auth/verify-otp
Body:
{
  "email": "test@example.com",
  "otp": "123456"
}
Expected: JWT token + user data returned
```

---

## ✨ ADVANCED TESTING

### Test: Multiple Users
```
1. Create user 1: alice@example.com
2. Create user 2: bob@example.com
3. Verify both can login separately
4. Verify credentials don't mix
```

### Test: Browser Back Button
```
1. Start OTP login
2. Fill phone details
3. Press browser back button
4. Go to http://localhost:3000/login-otp again
5. Should start fresh flow
```

### Test: Data Persistence
```
1. Fill form: name, email, phone
2. Click "Send OTP"
3. Browser back button
4. Go to /login-otp again
5. Form should be cleared (fresh start)
```

### Test: Network Error Handling
```
1. Stop backend server
2. Try to request OTP
3. Should show error message
4. No browser crash or freeze
```

---

## 📈 PERFORMANCE TESTING

Check browser DevTools:

### Network Tab (F12)
- [ ] API requests complete in < 500ms
- [ ] No failed requests (404, 500)
- [ ] No console errors (red messages)
- [ ] No console warnings related to auth

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Smooth transitions between steps
- [ ] No lag when typing
- [ ] Buttons respond immediately

---

## 🎯 SUCCESS CRITERIA

- ✓ OTP login page loads without errors
- ✓ Can register new user with OTP
- ✓ OTP verification works
- ✓ User is logged in after verification
- ✓ Design matches mockup (dark theme, turquoise buttons)
- ✓ Mobile responsive
- ✓ Error handling works
- ✓ Security features working
- ✓ No console errors
- ✓ Token stored in localStorage

---

## 📞 QUICK REFERENCE

**URLs to Test:**
- OTP Login: http://localhost:3000/login-otp
- Home: http://localhost:3000
- API Docs: http://127.0.0.1:8000/docs

**Test Credentials:**
- Any email: test@example.com, new@example.com, etc.
- OTP: Will be displayed on screen
- Phone: Any number (9876543210, 1234567890, etc.)

**Files to Check:**
- Frontend: frontend/src/pages/LoginOTP.jsx
- Styles: frontend/src/styles/login-otp.css
- Backend: backend/app/routers/auth.py
- Routes: frontend/src/routes.jsx

---

**Status:** ✅ **READY FOR TESTING**

**Start here:** http://localhost:3000/login-otp

Good luck testing! 🚀
