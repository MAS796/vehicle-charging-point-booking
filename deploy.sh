#!/bin/bash

# EV Smart Charging - Docker Deployment Script
# This script automates the deployment on AWS EC2

set -e  # Exit on error

echo "=========================================="
echo "EV Smart Charging - Docker Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Docker Installation
echo -e "${YELLOW}[1/6] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Installing...${NC}"
    sudo yum update -y
    sudo yum install docker -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

# Step 2: Check Docker Compose Installation
echo -e "${YELLOW}[2/6] Checking Docker Compose installation...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose not found. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

# Step 3: Navigate to project directory
echo -e "${YELLOW}[3/6] Checking project directory...${NC}"
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}docker-compose.yml not found in current directory${NC}"
    exit 1
fi
echo -e "${GREEN}Project directory is valid${NC}"

# Step 4: Build and start containers
echo -e "${YELLOW}[4/6] Building Docker images...${NC}"
docker-compose build

echo -e "${YELLOW}[5/6] Starting containers...${NC}"
docker-compose up -d

# Step 5: Wait for services to be healthy
echo -e "${YELLOW}[6/6] Waiting for services to be healthy...${NC}"
sleep 10

# Step 6: Display service status
echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
docker-compose ps
echo ""
echo -e "${GREEN}Application URLs:${NC}"
echo "Frontend:  http://$(hostname -I | awk '{print $1}')/"
echo "Backend:   http://$(hostname -I | awk '{print $1}'):8000/"
echo "API:       http://$(hostname -I | awk '{print $1}'):8000/docs"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:       docker-compose logs -f"
echo "  Stop services:   docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Check status:    docker-compose ps"
echo ""
echo -e "${GREEN}Deployment script completed!${NC}"
