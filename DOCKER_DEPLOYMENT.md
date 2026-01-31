# Docker Deployment Guide - EV Smart Charging Platform

## Prerequisites

- AWS EC2 instance running (Ubuntu/Amazon Linux)
- SSH access to the instance
- Docker and Docker Compose installed on the EC2 instance
- Public IP: `3.27.83.249`

## Step 1: Connect to EC2 Instance

```bash
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com
```

## Step 2: Install Docker and Docker Compose

```bash
# Update system packages
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group
sudo usermod -aG docker ec2-user
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

## Step 3: Clone or Upload Your Project

**Option A: Clone from GitHub**
```bash
git clone <your-repo-url> ev-charging
cd ev-charging
```

**Option B: Upload Files Using SCP**
```bash
# From your local machine
scp -i "EV Smart Charging.pem" -r /path/to/vehicle-charging-point-booking ec2-user@3.27.83.249:/home/ec2-user/
```

## Step 4: Navigate to Project Directory

```bash
cd vehicle-charging-point-booking
ls -la
```

You should see:
- `Dockerfile.backend`
- `Dockerfile.frontend`
- `docker-compose.yml`
- `nginx.conf`
- `backend/` directory
- `frontend/` directory

## Step 5: Build and Start Containers

```bash
# Build images and start containers
docker-compose up -d

# Check if all containers are running
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## Step 6: Verify Services

```bash
# Check if services are healthy
curl http://localhost:8000/
curl http://localhost:3000/
curl http://localhost/

# Or use the public IP
curl http://3.27.83.249/
curl http://3.27.83.249:8000/
```

## Step 7: Access Your Application

### From Browser:
- **Frontend**: http://3.27.83.249
- **Backend API**: http://3.27.83.249:8000
- **Through Nginx**: http://3.27.83.249 (recommended)

### Test API Endpoints:
```bash
# Login endpoint
curl -X POST http://3.27.83.249:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get stations
curl http://3.27.83.249:8000/stations/

# Get companies
curl http://3.27.83.249:8000/companies/
```

## Step 8: Common Docker Commands

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart all services
docker-compose restart

# Rebuild images (if code changed)
docker-compose up -d --build

# View container logs with tail
docker-compose logs -f --tail=100

# Access container shell
docker exec -it ev-charging-backend sh
docker exec -it ev-charging-frontend sh

# Check resource usage
docker stats

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Step 9: AWS Security Group Configuration

Make sure these ports are open in your EC2 Security Group:
- **Port 80** (HTTP) - Nginx
- **Port 443** (HTTPS) - For future SSL setup
- **Port 8000** (Backend API) - Direct access
- **Port 3000** (Frontend) - Direct access
- **Port 22** (SSH) - For management

## Step 10: Environment Variables (Optional)

Create a `.env` file in the project root:

```bash
# Database URL
DATABASE_URL=sqlite:///./charging.db

# API URL for frontend
REACT_APP_API_URL=http://3.27.83.249:8000

# Python unbuffered output
PYTHONUNBUFFERED=1
```

## Step 11: Database Persistence

Database is stored in a volume and persists across container restarts:
```bash
docker volume ls  # List all volumes
docker volume inspect vehicle-charging-point-booking_database  # Inspect database volume
```

## Step 12: Monitoring and Maintenance

```bash
# Check system resources
docker system df

# Clean up unused resources
docker system prune

# View running processes in containers
docker top ev-charging-backend
docker top ev-charging-frontend

# Backup database
docker cp ev-charging-backend:/app/charging.db ./charging.db.backup
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 80, 3000, or 8000
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process using the port
sudo kill -9 <PID>
```

### Container Not Starting
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Rebuild without cache
docker-compose up -d --build --no-cache
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

### Permission Denied
```bash
# Ensure docker is installed and running
sudo systemctl restart docker

# Add user to docker group
sudo usermod -aG docker $USER
```

## Step 13: Setting Up Domain (Later)

Once you have a domain, update the nginx.conf:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # ... rest of config
}
```

Then rebuild:
```bash
docker-compose up -d --build
```

## Step 14: SSL/HTTPS Setup (Optional)

Install Certbot in your EC2:
```bash
sudo yum install certbot python3-certbot-nginx -y
sudo certbot certonly --standalone -d yourdomain.com
```

Update nginx.conf with SSL certificates and rebuild.

## Summary

Your EV Smart Charging Platform is now:
- ✅ Dockerized with separate containers for frontend, backend, and nginx
- ✅ Running on AWS EC2 instance
- ✅ Accessible via http://3.27.83.249
- ✅ Auto-restarting on failures
- ✅ Health checks enabled
- ✅ Database persistence configured
- ✅ Ready for domain mapping and SSL

## Quick Start Reference

```bash
# SSH into EC2
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com

# Start application
cd vehicle-charging-point-booking
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

---
**Last Updated**: January 27, 2026
