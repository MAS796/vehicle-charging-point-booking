# 🚀 Docker Commands Cheat Sheet

## Quick Reference for All Docker Operations

### 📋 Table of Contents
1. [Deployment](#deployment)
2. [Monitoring](#monitoring)
3. [Troubleshooting](#troubleshooting)
4. [Database Management](#database-management)
5. [Container Management](#container-management)
6. [Logs & Debugging](#logs--debugging)
7. [System Cleanup](#system-cleanup)

---

## 🚀 Deployment

### First Time Deployment (EC2)

```bash
# 1. SSH to EC2
ssh -i "EV Smart Charging.pem" ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com

# 2. Upload project
scp -i "EV Smart Charging.pem" -r vehicle-charging-point-booking \
    ec2-user@ec2-3-27-83-249.ap-southeast-2.compute.amazonaws.com:~

# 3. Navigate to project
cd vehicle-charging-point-booking

# 4. Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment Steps

```bash
# Build all images
docker-compose build

# Start all services in background
docker-compose up -d

# Verify services started
docker-compose ps
```

### Deployment with Specific Environment

```bash
# Set environment variable
export DATABASE_URL=sqlite:///./charging.db

# Deploy with variables
docker-compose --env-file .env up -d
```

---

## 📊 Monitoring

### Check Service Status

```bash
# All services
docker-compose ps

# Detailed status with exit codes
docker-compose ps -a

# Service health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### View Resource Usage

```bash
# Real-time resource monitoring
docker stats

# Show only specific container
docker stats backend

# Update every 2 seconds
docker stats --no-stream=false
```

### Check Service Logs

```bash
# All services, last 50 lines
docker-compose logs --tail=50

# Follow logs in real-time
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Last 100 lines of backend
docker-compose logs --tail=100 backend

# Logs since 5 minutes ago
docker-compose logs --since=5m

# Logs between timestamps
docker-compose logs --until=1m
```

### Check Container Details

```bash
# Inspect container details
docker-compose exec backend docker ps

# View container IP address
docker inspect -f '{{.NetworkSettings.IPAddress}}' $(docker-compose ps -q backend)

# View environment variables
docker-compose exec backend env

# View running processes
docker-compose exec backend ps aux
```

---

## 🔧 Troubleshooting

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx

# Restart with clean logs
docker-compose down
docker-compose up -d
```

### Check Connectivity

```bash
# Test backend API
curl http://localhost:8000/

# Test backend with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/auth/profile/1

# Test frontend
curl http://localhost/

# Test API documentation
curl http://localhost:8000/docs

# Test specific endpoint
curl http://localhost:8000/stations
```

### Test from Inside Container

```bash
# Test from backend container
docker-compose exec backend curl http://frontend:3000/

# Test from frontend container
docker-compose exec frontend curl http://backend:8000/

# DNS test
docker-compose exec backend nslookup frontend
docker-compose exec backend nslookup nginx
```

### Debug Network Issues

```bash
# Check Docker network
docker network ls
docker network inspect vehicle-charging-point-booking_ev-network

# Ping between containers
docker-compose exec backend ping frontend
docker-compose exec frontend ping backend

# Check exposed ports
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Check Service Readiness

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q backend)

# Wait for service to be healthy
docker-compose exec backend bash -c 'while ! curl -s http://localhost:8000 > /dev/null; do sleep 1; done; echo "Service ready"'
```

---

## 💾 Database Management

### Backup Database

```bash
# Backup to local file
docker run --rm -v charging-db-volume:/data \
  -v $(pwd):/backup ubuntu \
  tar czf /backup/db-backup-$(date +%Y%m%d-%H%M%S).tar.gz /data

# Verify backup
ls -lh db-backup-*.tar.gz

# Backup with timestamp
docker-compose exec backend \
  cp charging.db charging-db-backup-$(date +%Y%m%d-%H%M%S).db
```

### Restore Database

```bash
# Stop services first
docker-compose stop

# Restore from backup
docker run --rm -v charging-db-volume:/data \
  -v $(pwd):/backup ubuntu \
  tar xzf /backup/db-backup-latest.tar.gz -C /

# Restart services
docker-compose up -d
```

### Export Database

```bash
# Export database to local directory
docker cp $(docker-compose ps -q backend):/app/charging.db ./charging.db

# Verify
ls -lh charging.db
```

### Query Database Directly

```bash
# Interactive SQLite shell
docker-compose exec backend sqlite3 charging.db

# Inside shell:
# SELECT COUNT(*) FROM users;
# SELECT * FROM charging_stations;
# .tables
# .quit

# Single query
docker-compose exec backend sqlite3 charging.db "SELECT COUNT(*) FROM users;"

# Execute SQL file
docker-compose exec backend sqlite3 charging.db < query.sql
```

### Database Maintenance

```bash
# Vacuum database (reclaim space)
docker-compose exec backend sqlite3 charging.db "VACUUM;"

# Check database integrity
docker-compose exec backend sqlite3 charging.db "PRAGMA integrity_check;"

# List all tables
docker-compose exec backend sqlite3 charging.db ".tables"

# Describe table schema
docker-compose exec backend sqlite3 charging.db ".schema users"
```

---

## 🎛️ Container Management

### Start & Stop Services

```bash
# Start services
docker-compose start

# Start specific service
docker-compose start backend

# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop frontend

# Pause services (freeze processes)
docker-compose pause

# Unpause services
docker-compose unpause

# Kill services (force stop)
docker-compose kill
```

### Container Lifecycle

```bash
# Build images only (no start)
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build backend

# Create containers without starting
docker-compose create

# Start existing containers
docker-compose start

# One-shot: build and start
docker-compose up -d

# Full cleanup and restart
docker-compose down
docker-compose up -d
```

### Execute Commands in Container

```bash
# Interactive bash
docker-compose exec backend bash

# Run command
docker-compose exec backend python -c "import app; print('OK')"

# Run with user
docker-compose exec -u root backend apt-get update

# Run in frontend
docker-compose exec frontend npm list

# Run with environment variable
docker-compose exec -e VAR=value backend echo $VAR
```

### Access Container Shell

```bash
# Backend Python shell
docker-compose exec backend python

# Frontend bash shell
docker-compose exec frontend bash

# With root privileges
docker-compose exec -u root backend bash

# With custom user
docker-compose exec -u 1000 backend bash
```

---

## 📝 Logs & Debugging

### View Logs

```bash
# All logs, real-time
docker-compose logs -f

# Specific service, real-time
docker-compose logs -f backend

# Last N lines
docker-compose logs --tail=50

# Since specific time
docker-compose logs --since 10m
docker-compose logs --since 2024-01-24T10:00:00

# Until specific time
docker-compose logs --until 5m

# With timestamps
docker-compose logs --timestamps

# Grep logs for errors
docker-compose logs | grep -i error

# Save logs to file
docker-compose logs > deployment.log

# Monitor multiple services
docker-compose logs -f backend frontend
```

### Advanced Logging

```bash
# Follow logs with prefix
docker-compose logs -f --no-log-prefix=false

# Get last 1000 lines
docker-compose logs --tail=1000

# Combine with grep
docker-compose logs backend | grep -i "error\|warning\|exception"

# Real-time errors only
docker-compose logs -f | grep -i error

# Watch specific service
watch -n 1 'docker-compose logs --tail=20 backend'
```

### Inspect Container

```bash
# Container JSON details
docker inspect $(docker-compose ps -q backend)

# Specific field
docker inspect -f '{{.State.Pid}}' $(docker-compose ps -q backend)

# Network settings
docker inspect -f '{{.NetworkSettings}}' $(docker-compose ps -q backend)

# Health status
docker inspect --format='{{.State.Health}}' $(docker-compose ps -q backend)
```

### Debug Performance

```bash
# Top processes in container
docker-compose exec backend top

# Memory usage
docker stats backend

# Disk usage
docker-compose exec backend df -h

# Network interface stats
docker-compose exec backend netstat -i
```

---

## 🧹 System Cleanup

### Remove Containers

```bash
# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Remove with timeout
docker-compose down -t 30

# Remove dangling containers
docker container prune

# Force remove specific container
docker rm -f container_name
```

### Remove Images

```bash
# Remove unused images
docker image prune

# Remove all images
docker image prune -a

# Remove specific image
docker rmi image_name

# Force remove
docker rmi -f image_name
```

### Remove Volumes

```bash
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm volume_name

# Force remove
docker volume rm -f volume_name

# Remove all volumes
docker volume prune -a
```

### Complete Cleanup

```bash
# Remove all unused resources
docker system prune

# Include volumes in cleanup
docker system prune --volumes

# Force cleanup
docker system prune -a --volumes

# See what will be removed
docker system df
```

---

## 🔐 Security Commands

### Scan Images for Vulnerabilities

```bash
# Scan backend image
docker scan vehicle-charging-point-booking_backend

# Scan frontend image
docker scan vehicle-charging-point-booking_frontend

# Scan and get detailed report
docker scan --severity high vehicle-charging-point-booking_backend
```

### Check Security Context

```bash
# View running user in container
docker-compose exec backend id

# Check capabilities
docker-compose exec backend getcap -r /

# View security options
docker inspect --format='{{.HostConfig.SecurityOpt}}' $(docker-compose ps -q backend)
```

### Environment Variables

```bash
# View all environment variables
docker-compose exec backend env | sort

# View specific variable
docker-compose exec backend echo $DATABASE_URL

# Set temporary variable
docker-compose exec -e VAR=value backend bash
```

---

## 🚨 Emergency Commands

### Stop Everything Immediately

```bash
# Kill all containers
docker-compose kill

# Kill specific container
docker-compose kill backend

# Force kill with signal
docker kill -s KILL $(docker-compose ps -q)
```

### Reset Everything

```bash
# Complete reset (WARNING: deletes data!)
docker-compose down -v
rm -rf ~/backups/  # Only if you backed up data!
docker-compose up -d

# Hard reset with image rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Troubleshoot Stuck Container

```bash
# Check if container is responding
docker-compose exec backend ping localhost

# If no response, restart
docker-compose restart backend

# If still stuck, kill and recreate
docker-compose kill backend
docker-compose up -d backend

# View recent activity
docker-compose logs backend | tail -50
```

---

## 📱 Health Check Commands

### Monitor Container Health

```bash
# Check health status
docker-compose ps | grep -E "health|STATUS"

# Get detailed health info
docker inspect --format='{{json .State.Health}}' $(docker-compose ps -q backend)

# Monitor health changes
watch -n 2 'docker-compose ps | grep -E "health|NAME"'

# Health history
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{"\n"}}{{end}}' $(docker-compose ps -q backend)
```

### Manual Health Tests

```bash
# Backend health
curl -v http://localhost:8000/

# Frontend health
curl -v http://localhost/

# API endpoint
curl -v http://localhost:8000/stations

# Database connectivity
docker-compose exec backend sqlite3 charging.db "SELECT 1;"
```

---

## 📊 Useful Aliases (Add to .bashrc/.zshrc)

```bash
# Docker Compose aliases
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcrestart='docker-compose restart'
alias dcbuild='docker-compose build'
alias dcexec='docker-compose exec'

# Usage:
# dc ps
# dcup
# dclogs backend
# dcexec backend bash
```

---

## 🎯 Common Workflows

### Deploy Update

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild affected images
docker-compose build --no-cache

# 3. Restart services
docker-compose up -d

# 4. Verify
docker-compose ps
docker-compose logs
```

### Database Backup & Restore

```bash
# Backup before major operation
docker run --rm -v charging-db-volume:/data -v $(pwd):/backup ubuntu \
  tar czf /backup/db-$(date +%Y%m%d-%H%M%S).tar.gz /data

# Do the operation...

# If needed, restore
docker-compose stop
docker run --rm -v charging-db-volume:/data -v $(pwd):/backup ubuntu \
  tar xzf /backup/db-latest.tar.gz -C /
docker-compose up -d
```

### Monitor Deployment

```bash
# Watch everything
watch -n 2 'docker-compose ps && echo "---" && docker stats --no-stream'

# Or separately
docker-compose ps
docker stats
docker-compose logs -f
```

---

**Last Updated:** January 2026  
**Docker Version:** 24.0+  
**Compose Version:** 2.0+
