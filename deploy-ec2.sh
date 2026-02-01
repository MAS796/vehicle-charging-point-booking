#!/bin/bash
# EC2 Deployment Script
# Run this on your EC2 instance

echo "🚀 Deploying Vehicle Charging Point Booking to EC2..."

# Navigate to project directory
cd ~/vehicle-charging-point-booking || cd /home/ec2-user/vehicle-charging-point-booking

# Pull latest code from GitHub
echo "📥 Pulling latest code..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 10

# Check running containers
echo "📊 Running containers:"
docker ps

# Show logs
echo "📋 Backend logs (last 20 lines):"
docker logs ev-backend --tail 20

echo ""
echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://3.27.83.249"
echo ""
