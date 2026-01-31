#!/bin/bash

# Deployment Verification Script
# This script verifies that all Docker containers are running and accessible

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get IP address
IP=$(hostname -I | awk '{print $1}')
EC2_IP="3.27.83.249"

echo ""
echo -e "${BLUE}=========================================="
echo "Deployment Verification Script"
echo "==========================================${NC}"
echo ""

# Step 1: Check Docker is running
echo -e "${YELLOW}[1/8] Checking Docker daemon...${NC}"
if docker ps &> /dev/null; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    exit 1
fi

# Step 2: Check Docker Compose
echo -e "${YELLOW}[2/8] Checking Docker Compose...${NC}"
if docker-compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is installed${NC}"
else
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

# Step 3: Check containers are running
echo -e "${YELLOW}[3/8] Checking containers status...${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Containers are running${NC}"
    docker-compose ps
else
    echo -e "${RED}✗ Containers are not running${NC}"
    echo "Starting containers..."
    docker-compose up -d
fi

# Step 4: Test backend connectivity
echo ""
echo -e "${YELLOW}[4/8] Testing backend connectivity...${NC}"
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo "Logs:"
    docker-compose logs backend | tail -20
fi

# Step 5: Test frontend connectivity
echo -e "${YELLOW}[5/8] Testing frontend connectivity...${NC}"
if curl -s http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo "Logs:"
    docker-compose logs frontend | tail -20
fi

# Step 6: Test API endpoint
echo -e "${YELLOW}[6/8] Testing API endpoints...${NC}"
STATIONS=$(curl -s http://localhost:8000/stations | grep -c "id" || true)
if [ "$STATIONS" -gt 0 ]; then
    echo -e "${GREEN}✓ API endpoints are working (found $STATIONS stations)${NC}"
else
    echo -e "${YELLOW}⚠ API endpoints may have issues${NC}"
fi

# Step 7: Check health endpoints
echo -e "${YELLOW}[7/8] Checking container health...${NC}"
BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q backend) 2>/dev/null || echo "unknown")
FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q frontend) 2>/dev/null || echo "unknown")

echo "Backend health:  $BACKEND_HEALTH"
echo "Frontend health: $FRONTEND_HEALTH"

if [ "$BACKEND_HEALTH" = "healthy" ] && [ "$FRONTEND_HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✓ All containers are healthy${NC}"
elif [ "$BACKEND_HEALTH" = "unhealthy" ] || [ "$FRONTEND_HEALTH" = "unhealthy" ]; then
    echo -e "${RED}✗ Some containers are unhealthy${NC}"
    docker-compose logs | tail -30
else
    echo -e "${YELLOW}⚠ Health status unknown (might be expected)${NC}"
fi

# Step 8: Display access information
echo ""
echo -e "${YELLOW}[8/8] Access Information...${NC}"
echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Verification Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo ""
echo "Frontend:"
echo "  Local:  http://localhost/"
echo "  Remote: http://$IP/"
if [ "$IP" != "$EC2_IP" ]; then
    echo "  EC2:    http://$EC2_IP/"
fi
echo ""
echo "Backend API:"
echo "  Local:  http://localhost:8000/"
echo "  Remote: http://$IP:8000/"
if [ "$IP" != "$EC2_IP" ]; then
    echo "  EC2:    http://$EC2_IP:8000/"
fi
echo ""
echo "API Documentation:"
echo "  Swagger: http://localhost:8000/docs"
echo "  ReDoc:   http://localhost:8000/redoc"
echo ""
echo -e "${BLUE}Default Credentials:${NC}"
echo "  Email:    admin@example.com"
echo "  Password: admin123"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:       docker-compose logs -f"
echo "  Stop services:   docker-compose stop"
echo "  Restart services: docker-compose restart"
echo "  Check status:    docker-compose ps"
echo "  Resource usage:  docker stats"
echo ""
echo -e "${GREEN}✓ Verification complete!${NC}"
echo ""
