# 🐳 Docker Deployment - Complete Setup

## Overview

Your EV Smart Charging application is **fully containerized and ready for production deployment** on AWS EC2.

### What's Included

- ✅ **Dockerfile.backend** - FastAPI containerized with Uvicorn
- ✅ **Dockerfile.frontend** - React containerized with multi-stage build
- ✅ **docker-compose.yml** - Orchestrates all 3 services with health checks
- ✅ **nginx.conf** - Reverse proxy configuration for all endpoints
- ✅ **.dockerignore** - Optimized Docker builds
- ✅ **deploy.sh** - Automated Linux/EC2 deployment script
- ✅ **deploy.bat** - Windows deployment script
- ✅ **EC2_DEPLOYMENT_QUICK_START.md** - Quick reference guide
- ✅ **DOCKER_OPERATIONS_GUIDE.md** - Comprehensive operations manual

---

## 🚀 Quick Start

### Option 1: Windows (Local Testing)

```bash
# Navigate to project directory
cd vehicle-charging-point-booking

# Run Windows deployment script
deploy.bat
```

### Option 2: Linux/EC2 (Production Deployment)

```bash
# SSH to your EC2 instance
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com

# Navigate to project
cd vehicle-charging-point-booking

# Run deployment script
chmod +x deploy.sh
./deploy.sh

# Or manually:
docker-compose up -d
```

### Option 3: Manual Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 📍 Access Points

After deployment, access your application at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://3.27.83.249 | User interface |
| **Backend API** | http://3.27.83.249:8000 | REST API |
| **Swagger Docs** | http://3.27.83.249:8000/docs | API documentation |
| **ReDoc** | http://3.27.83.249:8000/redoc | Alternative API docs |

### Default Credentials

- **Admin Email:** admin@example.com
- **Admin Password:** admin123

---

## 🎯 Key Features

### 1. **Multi-Service Architecture**
- Frontend (React) running on port 3000
- Backend (FastAPI) running on port 8000
- Nginx reverse proxy on port 80
- SQLite database with persistent volume

### 2. **Health Checks**
- Backend checks every 30 seconds
- Frontend checks every 30 seconds
- Nginx checks on demand
- Auto-restart on failure

### 3. **Database Persistence**
- SQLite database stored in Docker volume
- Persists across container restarts
- No data loss on container recreation

### 4. **Reverse Proxy**
- Single entry point (port 80)
- Routes API requests to backend
- Serves frontend static files
- Handles all CORS headers

### 5. **Environment Configuration**
- Database URL configurable
- API base URL configurable for EC2 IP
- CORS origins whitelisted
- Secrets stored in environment variables

---

## 📊 Docker Architecture

```
┌──────────────────────────────────────────┐
│           AWS EC2 Instance                │
│         (3.27.83.249)                    │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐    │
│  │     NGINX Container (Port 80)   │    │
│  │   - Reverse Proxy               │    │
│  │   - Static File Serving         │    │
│  │   - Load Balancing              │    │
│  └────────────┬─────────────────────┘    │
│               │                          │
│       ┌───────┴────────┐                │
│       │                │                │
│  ┌────▼─────┐     ┌───▼──────┐         │
│  │ Backend   │     │ Frontend │         │
│  │ Container │     │ Container│         │
│  │(Port 8000)│     │(Port 3000)        │
│  │ FastAPI   │     │ React    │         │
│  │ Uvicorn   │     │ Build    │         │
│  └────┬──────┘     └──────────┘         │
│       │                                  │
│  ┌────▼──────────────────────┐          │
│  │   SQLite Database Volume   │          │
│  │  (charging.db persistence) │          │
│  └───────────────────────────┘          │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔧 Service Details

### Backend Container

**Image:** Custom FastAPI image (Python 3.13-slim)

**Ports:**
- Internal: 8000
- External: 8000

**Environment Variables:**
```
DATABASE_URL=sqlite:///./charging.db
CORS_ORIGINS=["http://localhost:3000", "http://3.27.83.249"]
```

**Health Check:**
```
curl http://localhost:8000/
Runs every 30 seconds, timeout 10s, retries 3
```

**Volumes:**
- `/app/charging.db` → `charging-db-volume`

### Frontend Container

**Image:** Custom React image (Node 18, multi-stage)

**Ports:**
- Internal: 3000
- External: 3000 (via nginx proxy on 80)

**Environment Variables:**
```
REACT_APP_API_URL=http://3.27.83.249:8000
REACT_APP_ENV=production
```

**Health Check:**
```
curl http://localhost:3000/
Runs every 30 seconds, timeout 10s, retries 3
```

### Nginx Container

**Image:** Official nginx:latest

**Ports:**
- Internal: 80
- External: 80

**Configuration:**
- Proxies `/` to frontend:3000
- Proxies `/auth/`, `/stations/`, `/bookings/`, etc. to backend:8000
- Handles CORS headers
- Sets proper proxy headers

**Health Check:**
```
curl http://localhost/
```

---

## 💾 Database Management

### Database Location

```
Docker Volume: charging-db-volume
Path in Container: /app/charging.db
Actual Path on Host: /var/lib/docker/volumes/charging-db-volume/_data/charging.db
```

### Backup Database

```bash
# Create a backup
docker run --rm -v charging-db-volume:/data \
  -v $(pwd):/backup ubuntu \
  tar czf /backup/db-backup.tar.gz /data

# Verify backup
ls -lh db-backup.tar.gz
```

### Restore Database

```bash
# Stop containers first
docker-compose stop

# Restore from backup
docker run --rm -v charging-db-volume:/data \
  -v $(pwd):/backup ubuntu \
  tar xzf /backup/db-backup.tar.gz -C /

# Restart services
docker-compose up -d
```

### Query Database Directly

```bash
# Access database from backend container
docker-compose exec backend sqlite3 charging.db

# Example queries:
# SELECT COUNT(*) FROM users;
# SELECT * FROM charging_stations;
# SELECT * FROM bookings;
```

---

## 🛠️ Common Tasks

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Follow in real-time
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail=50
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart backend
```

### Check Service Status

```bash
# Detailed status
docker-compose ps

# Check if services are healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Execute Commands in Container

```bash
# Access backend Python shell
docker-compose exec backend python

# Run backend commands
docker-compose exec backend python -m uvicorn app.main:app --reload

# Access frontend shell
docker-compose exec frontend bash

# Install npm package
docker-compose exec frontend npm install axios
```

### Stop and Remove Everything

```bash
# Stop containers
docker-compose stop

# Remove containers (but keep volumes)
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Rebuild and restart
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Can't Connect to Backend

```bash
# 1. Verify backend is running
docker-compose ps

# 2. Check REACT_APP_API_URL
docker-compose exec frontend env | grep REACT_APP

# 3. Test backend directly
curl http://localhost:8000/docs

# 4. Check nginx config
docker-compose logs nginx
```

### Database Connection Issues

```bash
# Check volume exists
docker volume ls | grep charging

# Restart with fresh database
docker-compose down
docker volume rm charging-db-volume
docker-compose up -d
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :80

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart containers
docker-compose restart

# Check logs for leaks
docker-compose logs backend
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Update `SECRET_KEY` in environment variables
- [ ] Change default admin password (admin@example.com)
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure AWS Security Groups (ports 22, 80, 443 only)
- [ ] Setup automated backups
- [ ] Enable CloudWatch monitoring
- [ ] Configure firewall rules
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable Docker Content Trust
- [ ] Scan images for vulnerabilities

---

## 📈 Scaling & Performance

### For Higher Load

1. **Use AWS RDS** instead of SQLite for database
2. **Setup CloudFront** CDN for static files
3. **Use AWS ELB** for load balancing
4. **Implement caching** with Redis
5. **Auto-scaling** groups for EC2 instances

### Current Limitations (SQLite)

- Single database file (no clustering)
- Not suitable for >100 concurrent connections
- No built-in replication

### Recommended for Production

- PostgreSQL on AWS RDS
- Redis cache layer
- AWS S3 for file storage
- CloudFront for CDN
- Route53 for DNS
- CloudWatch for monitoring

---

## 📞 Support Resources

- **Docker Docs:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose/reference/
- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/
- **AWS EC2:** https://docs.aws.amazon.com/ec2/
- **Nginx:** https://nginx.org/en/docs/

---

## 📝 Next Steps

1. **SSH to EC2:** Follow EC2_DEPLOYMENT_QUICK_START.md
2. **Deploy:** Run `./deploy.sh` or `docker-compose up -d`
3. **Verify:** Test at http://3.27.83.249
4. **Monitor:** Check logs with `docker-compose logs -f`
5. **Backup:** Setup database backup strategy
6. **Domain:** (Optional) Configure domain name and SSL

---

## Version Info

- **Docker:** 24.0+
- **Docker Compose:** 2.0+
- **Python:** 3.13
- **Node:** 18
- **FastAPI:** Latest
- **React:** 18+

---

**Last Updated:** January 2026  
**Status:** ✅ Production Ready
