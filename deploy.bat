@echo off
REM EV Smart Charging - Windows Docker Deployment Script

setlocal enabledelayedexpansion
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

cls
echo.
echo ==========================================
echo EV Smart Charging - Docker Deployment
echo ==========================================
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo %RED%ERROR: docker-compose.yml not found in current directory%RESET%
    pause
    exit /b 1
)

REM Step 1: Check Docker
echo %YELLOW%[1/5] Checking Docker installation...%RESET%
docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Docker not found. Please install Docker Desktop for Windows.%RESET%
    echo https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo %GREEN%Docker is installed%RESET%

REM Step 2: Check Docker Compose
echo %YELLOW%[2/5] Checking Docker Compose installation...%RESET%
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Docker Compose not found%RESET%
    pause
    exit /b 1
)
echo %GREEN%Docker Compose is installed%RESET%

REM Step 3: Build images
echo %YELLOW%[3/5] Building Docker images...%RESET%
docker-compose build
if errorlevel 1 (
    echo %RED%Build failed%RESET%
    pause
    exit /b 1
)
echo %GREEN%Build successful%RESET%

REM Step 4: Start containers
echo %YELLOW%[4/5] Starting containers...%RESET%
docker-compose up -d
if errorlevel 1 (
    echo %RED%Failed to start containers%RESET%
    pause
    exit /b 1
)
echo %GREEN%Containers started%RESET%

REM Step 5: Wait and display status
echo %YELLOW%[5/5] Waiting for services to start...%RESET%
timeout /t 10 /nobreak

echo.
echo %GREEN%==========================================
echo Deployment Complete!
echo ==========================================%RESET%
echo.

docker-compose ps

echo.
echo %GREEN%Application URLs:%RESET%
echo Frontend:  http://localhost/
echo Backend:   http://localhost:8000/
echo API:       http://localhost:8000/docs
echo.
echo %YELLOW%Useful Commands:%RESET%
echo   View logs:       docker-compose logs -f
echo   Stop services:   docker-compose down
echo   Restart services: docker-compose restart
echo   Check status:    docker-compose ps
echo.

pause
