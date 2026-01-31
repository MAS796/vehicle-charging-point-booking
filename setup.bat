@echo off
REM Windows batch script to set up the entire project
REM Run this from the project root directory

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║   EV CHARGING STATION BOOKING SYSTEM - AUTO SETUP              ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM ===========================
REM BACKEND SETUP
REM ===========================

echo.
echo [1/5] Setting up backend...
echo.

cd backend

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Could not create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo ERROR: Could not install dependencies
    pause
    exit /b 1
)

REM Initialize database
echo Initializing database...
python -c "from app.database_init import init_db, seed_sample_data; init_db(); seed_sample_data()" 2>nul
if errorlevel 1 (
    echo WARNING: Database initialization had issues, continuing anyway...
)

cd ..

echo [1/5] ✓ Backend setup complete
echo.

REM ===========================
REM FRONTEND SETUP
REM ===========================

echo [2/5] Setting up frontend...
echo.

cd frontend

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install -q
    if errorlevel 1 (
        echo ERROR: Could not install npm dependencies
        pause
        exit /b 1
    )
)

cd ..

echo [2/5] ✓ Frontend setup complete
echo.

REM ===========================
REM SUMMARY
REM ===========================

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║ SETUP COMPLETE!                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo To start the application:
echo.
echo TERMINAL 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload
echo.
echo TERMINAL 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo API Documentation: http://localhost:8000/api/docs
echo.

pause
