@echo off
REM Start the EV Charging Station Backend Server

cls
echo.
echo ============================================================
echo   EV CHARGING STATION BOOKING SYSTEM - Backend Server
echo ============================================================
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Start the server
echo Starting server on http://127.0.0.1:8000
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

pause
