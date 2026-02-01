@echo off
REM Quick deployment script for Windows
REM Run this after Render deployment is complete

setlocal enabledelayedexpansion

echo.
echo 🚀 Updating Frontend API URL to Render Backend...
echo.

REM Update api.js with the new backend URL
set BACKEND_URL=https://vehicle-charging-api.onrender.com

echo Updating frontend/src/services/api.js...

REM Read the file and replace the URL
powershell -Command "(Get-Content 'frontend\src\services\api.js') -replace 'http://127\.0\.0\.1:8000', '%BACKEND_URL%' | Set-Content 'frontend\src\services\api.js'"

echo ✅ API URL updated!
echo.
echo 📦 Building frontend...
cd frontend
call npm run build

echo.
echo 🔄 Committing changes to main branch...
cd ..
git add .
git commit -m "Update API URL for production deployment at %BACKEND_URL%"
git push origin main

echo.
echo 📤 Deploying to GitHub Pages...
cd frontend\build
git add .
git commit -m "Production build with live API at %BACKEND_URL%"
git push --force origin master:gh-pages

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🌐 Your app is now live at:
echo    Frontend: https://mas796.github.io/vehicle-charging-point-booking/
echo    Backend:  %BACKEND_URL%
echo.
echo Both are connected and ready to use! 🎉
echo.
pause
