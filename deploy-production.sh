#!/bin/bash
# Quick deployment script - Run after Render deployment is complete

BACKEND_URL="https://vehicle-charging-api.onrender.com"

echo "🚀 Updating frontend API URL to: $BACKEND_URL"

# Update api.js
sed -i "s|http://localhost:8000|$BACKEND_URL|g" frontend/src/services/api.js

# Build frontend
cd frontend
npm run build

# Deploy to GitHub Pages
git add .
git commit -m "Update API URL for production deployment"
git push origin main

# Deploy to gh-pages
cd build
git add .
git commit -m "Production build with live API"
git push --force origin master:gh-pages

echo "✅ Deployment complete!"
echo "Frontend: https://mas796.github.io/vehicle-charging-point-booking/"
echo "Backend: $BACKEND_URL"
