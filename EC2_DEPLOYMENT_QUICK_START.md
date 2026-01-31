# EC2 Deployment Quick Start Guide

## 1️⃣ SSH into Your EC2 Instance

```bash
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com
```

## 2️⃣ Install Docker and Docker Compose (First Time Only)

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in (or use newgrp)
exit
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com
```

## 3️⃣ Upload Your Project

```bash
# From your local machine, upload the entire project
scp -i "EV Smart Charging.pem" -r vehicle-charging-point-booking ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com:~

# Or clone from git if available
# git clone <your-repo-url>
```

## 4️⃣ Deploy Using Docker Compose

```bash
# Navigate to project directory
cd vehicle-charging-point-booking

# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh

# Or manually:
docker-compose build
docker-compose up -d
```

## 5️⃣ Verify Deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test backend API
curl http://localhost:8000/docs

# Test frontend
curl http://localhost:80/
```

## 6️⃣ Access Your Application

**Frontend:** http://3.27.83.249/  
**Backend API Docs:** http://3.27.83.249:8000/docs  
**Backend Health:** http://3.27.83.249:8000/health (if you implement it)

## 🔑 Default Credentials

- **Admin Email:** admin@example.com
- **Admin Password:** admin123

## 📊 Common Docker Commands

```bash
# View all container logs
docker-compose logs

# Follow logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Stop all containers
docker-compose stop

# Restart services
docker-compose restart

# Remove containers and volumes
docker-compose down -v

# View resource usage
docker stats

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend bash
```

## 🔐 AWS Security Group Settings

Ensure your EC2 Security Group allows:

| Port | Protocol | Source |
|------|----------|--------|
| 22   | TCP      | Your IP (SSH) |
| 80   | TCP      | 0.0.0.0/0 (HTTP) |
| 443  | TCP      | 0.0.0.0/0 (HTTPS) |
| 8000 | TCP      | 0.0.0.0/0 (Backend) |
| 3000 | TCP      | 0.0.0.0/0 (Frontend - optional) |

## 🚨 Troubleshooting

**Containers won't start:**
```bash
docker-compose logs
# Check error messages and fix issues
```

**Port already in use:**
```bash
# Check what's using port 80
sudo lsof -i :80
# Or change port in docker-compose.yml
```

**Database not persisting:**
```bash
# Ensure docker volume exists
docker volume ls
docker volume inspect charging-db-volume
```

**Frontend can't reach backend:**
- Check REACT_APP_API_URL in docker-compose.yml
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

## 📝 Next Steps

1. ✅ SSH into EC2
2. ✅ Install Docker and Docker Compose
3. ✅ Upload project
4. ✅ Run `docker-compose up -d`
5. ✅ Verify services at http://3.27.83.249
6. (Optional) Setup domain and SSL/HTTPS
7. (Optional) Configure CI/CD pipeline

## 💾 Database Persistence

Your database is stored in a Docker volume named `charging-db-volume`. It persists even after container restart. To backup:

```bash
docker run --rm -v charging-db-volume:/data -v $(pwd):/backup ubuntu tar czf /backup/db-backup.tar.gz /data
```

To restore:

```bash
docker run --rm -v charging-db-volume:/data -v $(pwd):/backup ubuntu tar xzf /backup/db-backup.tar.gz -C /
```

---

**Last Updated:** January 2026  
**Application Version:** 1.0 - Docker Ready
