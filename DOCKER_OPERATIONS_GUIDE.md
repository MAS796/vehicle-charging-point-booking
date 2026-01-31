# 🐳 Docker Deployment Guide - EV Smart Charging

## Complete Docker Setup for AWS EC2 Deployment

### 📋 Prerequisites

- Docker installed on EC2 (or any Linux server)
- Docker Compose installed
- Project files uploaded to server
- Port 80, 443, 8000 open in Security Group
- 2GB+ RAM available on EC2

---

## 🚀 Quick Deployment (3 Steps)

### Step 1: SSH to Your EC2

```bash
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com
```

### Step 2: Run Auto Deployment Script

```bash
cd vehicle-charging-point-booking
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Access Your Application

- **Frontend:** http://3.27.83.249
- **Backend API:** http://3.27.83.249:8000
- **Swagger Docs:** http://3.27.83.249:8000/docs

---

## 📦 Docker Architecture

### Service Structure

```
┌─────────────────────────────────────┐
│         NGINX (Port 80)             │
│    (Reverse Proxy & Load Balancer)  │
├──────────────┬──────────────────────┤
│              │                      │
│         Frontend            Backend │
│    (React Port 3000)     (FastAPI 8000)
│         (Containerized)   (Containerized)
│              │                  │
│              └──────────────────┘
│          SQLite Database (Persisted)
└─────────────────────────────────────┘
```

### Docker Compose Services

1. **backend** - FastAPI application
   - Port: 8000 (internal), 8000 (exposed)
   - Health Check: Every 30 seconds
   - Database: SQLite volume mount

2. **frontend** - React application
   - Port: 3000 (internal), 3000 (exposed via nginx)
   - Health Check: Every 30 seconds
   - Static files served through nginx

3. **nginx** - Reverse proxy
   - Port: 80 (HTTP)
   - Routes requests to frontend and backend
   - Health Check: Basic connectivity

---

## 🔧 Manual Deployment Steps

### Step 1: Install Docker on EC2

```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Verify installation
docker --version
```

### Step 2: Install Docker Compose

```bash
# Download latest version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Step 3: Upload Project Files

From your local machine:

```bash
scp -i "EV Smart Charging.pem" -r vehicle-charging-point-booking \
    ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com:~
```

Or clone from Git:

```bash
git clone <your-repository-url>
cd vehicle-charging-point-booking
```

### Step 4: Build Docker Images

```bash
cd vehicle-charging-point-booking
docker-compose build
```

**Expected Output:**
```
Building backend ... done
Building frontend ... done
Building nginx ... done
```

### Step 5: Start Services

```bash
docker-compose up -d
```

**Expected Output:**
```
Creating network "vehicle-charging-point-booking_ev-network" with driver "bridge"
Creating charging-db-volume ...
Creating backend ... done
Creating frontend ... done
Creating nginx ... done
```

### Step 6: Verify Services

```bash
docker-compose ps
```

**Expected Output:**
```
NAME          COMMAND                  SERVICE    STATUS
backend       "uvicorn app.main:app"   backend    Up 1 minute (healthy)
frontend      "serve -s build -l 3000" frontend   Up 1 minute (healthy)
nginx         "nginx -g daemon off;"   nginx      Up 1 minute (healthy)
```

---

## ✅ Verification Steps

### Test Backend Connectivity

```bash
# Check if backend is responding
curl http://localhost:8000/docs

# Test health check endpoint (if implemented)
curl http://localhost:8000/health

# View API documentation
curl http://localhost:8000/docs/openapi.json
```

### Test Frontend

```bash
# Check if frontend is responding
curl http://localhost/

# Check specific route
curl http://localhost/api/stations
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

### Monitor Resource Usage

```bash
docker stats
```

---

## 🛠️ Common Operations

### Stop Services

```bash
docker-compose stop
```

### Restart Services

```bash
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Running Containers

```bash
docker-compose ps

# With verbose output
docker-compose ps -a
```

### Execute Command in Container

```bash
# Access backend shell
docker-compose exec backend bash

# Access frontend shell
docker-compose exec frontend bash

# Run Python command in backend
docker-compose exec backend python -c "import sys; print(sys.version)"
```

### View Container Logs

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 10m
```

### Rebuild Without Cache

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Remove All Containers and Volumes

```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (DATABASE WILL BE LOST!)
docker-compose down -v
```

---

## 🔐 Environment Variables

### Backend Environment Variables

Located in `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=sqlite:///./charging.db
  - SECRET_KEY=your-secret-key
  - ALGORITHM=HS256
  - ACCESS_TOKEN_EXPIRE_MINUTES=30
  - CORS_ORIGINS=["http://localhost:3000","http://3.27.83.249"]
```

### Frontend Environment Variables

Located in `docker-compose.yml`:

```yaml
environment:
  - REACT_APP_API_URL=http://3.27.83.249:8000
  - REACT_APP_ENV=production
```

### Modifying Environment Variables

1. Edit `docker-compose.yml`
2. Update the `environment` sections
3. Rebuild and restart:

```bash
docker-compose build
docker-compose up -d
```

---

## 📊 Database Management

### Database Location

SQLite database is stored in Docker volume: `charging-db-volume`

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker run --rm -v charging-db-volume:/data -v ~/backups:/backup \
  ubuntu tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz /data

# Verify backup
ls -lh ~/backups/
```

### Restore Database

```bash
# Stop services first
docker-compose stop

# Restore from backup
docker run --rm -v charging-db-volume:/data -v ~/backups:/backup \
  ubuntu tar xzf /backup/db-backup-latest.tar.gz -C /

# Restart services
docker-compose up -d
```

### Access Database Directly

```bash
# Copy database from container
docker cp $(docker-compose ps -q backend):/app/charging.db ./charging.db

# Or query directly
docker-compose exec backend python -c \
  "from app.models import *; from app.database import SessionLocal; \
   db = SessionLocal(); print(f'Users: {db.query(User).count()}')"
```

---

## 🐛 Troubleshooting

### Issue: Containers Won't Start

**Solution:**
```bash
# Check logs for errors
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Port Already in Use

**Solution:**
```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or modify docker-compose.yml to use different port
# Change "80:80" to "8080:80"
```

### Issue: Out of Disk Space

**Solution:**
```bash
# Check disk usage
df -h

# Clean up Docker system
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Issue: Frontend Can't Reach Backend

**Check:**
```bash
# 1. Verify backend is running
docker-compose ps

# 2. Check backend logs
docker-compose logs backend

# 3. Verify REACT_APP_API_URL in docker-compose.yml
grep REACT_APP_API_URL docker-compose.yml

# 4. Test backend directly
curl http://localhost:8000/docs
```

### Issue: Database Connection Error

**Solution:**
```bash
# Verify volume exists
docker volume ls | grep charging-db-volume

# Restart with fresh database
docker-compose down
docker volume rm charging-db-volume
docker-compose up -d
```

### Issue: High Memory Usage

**Solution:**
```bash
# Check resource usage
docker stats

# Restart containers to free memory
docker-compose restart

# Limit container memory in docker-compose.yml:
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           memory: 512M
```

---

## 🔄 CI/CD Integration (Optional)

### GitHub Actions Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to EC2
        env:
          PRIVATE_KEY: ${{ secrets.EC2_PRIVATE_KEY }}
          HOST: ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com
          USER: ec2-user
        run: |
          mkdir -p ~/.ssh
          echo "$PRIVATE_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no $USER@$HOST \
            "cd vehicle-charging-point-booking && \
             git pull origin main && \
             docker-compose down && \
             docker-compose up -d"
```

---

## 📈 Performance Tips

### Optimization Suggestions

1. **Use Alpine Linux base images** (smaller, faster)
2. **Multi-stage builds** (already implemented in Dockerfile.frontend)
3. **Database indexing** (add indexes for frequently queried fields)
4. **Caching** (implement Redis for session management)
5. **CDN** (serve static files from CloudFront)
6. **Load balancing** (use AWS ELB for multiple instances)

### Monitoring Setup

```bash
# Install Portainer for container management (optional)
docker run -d -p 8010:8000 -p 9010:9000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Access at: http://3.27.83.249:9010

---

## 🔐 Security Best Practices

### Implemented Security

✅ Non-root user in containers  
✅ Health checks on all services  
✅ Network isolation with bridge network  
✅ Environment variables for secrets  
✅ Read-only filesystem where possible  

### Additional Recommendations

1. **Enable Docker Content Trust**
   ```bash
   export DOCKER_CONTENT_TRUST=1
   ```

2. **Scan images for vulnerabilities**
   ```bash
   docker scan backend:latest
   docker scan frontend:latest
   ```

3. **Use AWS Secrets Manager**
   ```bash
   # Store secrets in AWS
   aws secretsmanager create-secret --name ev-charging/admin-password
   ```

4. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   sudo certbot certonly --standalone -d your-domain.com
   ```

5. **Firewall Configuration**
   ```bash
   sudo firewall-cmd --permanent --add-port=80/tcp
   sudo firewall-cmd --permanent --add-port=443/tcp
   sudo firewall-cmd --reload
   ```

---

## 📞 Support & Resources

- **Docker Documentation:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose
- **FastAPI:** https://fastapi.tiangolo.com
- **React:** https://react.dev
- **AWS EC2:** https://aws.amazon.com/ec2

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Docker and Docker Compose installed
- [ ] All services building without errors
- [ ] All services starting successfully
- [ ] Health checks passing
- [ ] Frontend connecting to backend
- [ ] Database persisting across restarts
- [ ] Logs showing no errors
- [ ] Default admin user created
- [ ] Security Group configured correctly
- [ ] Backup strategy in place
- [ ] Monitoring setup (optional but recommended)
- [ ] SSL/HTTPS configured (for production)

---

**Last Updated:** January 2026  
**Docker Version:** 24.0+  
**Docker Compose Version:** 2.0+
