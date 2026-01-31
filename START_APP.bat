@echo off
cd /d "C:\Users\LENOVO\OneDrive\Desktop\vehicle-charging-point-booking\vehicle-charging-point-booking"

echo.
echo ========================================
echo  Starting Vehicle Charging Point App
echo ========================================
echo.

REM Start Backend in separate window
echo Starting Backend on port 9000...
start "Backend Server (Port 9000)" cmd /k "cd backend && python -m uvicorn app.main:app --port 9000 --host 127.0.0.1"

REM Wait for backend to start
timeout /t 5 /nobreak

REM Start Frontend in separate window
echo Starting Frontend on port 3000...
start "Frontend Server (Port 3000)" cmd /k "cd frontend && set SKIP_PREFLIGHT_CHECK=true && npm start"

REM Wait for frontend to compile
timeout /t 30 /nobreak

echo.
echo ========================================
echo  ✓ Servers are starting!
echo ========================================
echo.
echo OPEN IN YOUR BROWSER:
echo   http://localhost:3000/login-otp
echo.
echo Backend:  http://127.0.0.1:9000
echo Frontend: http://localhost:3000
echo.
pause
