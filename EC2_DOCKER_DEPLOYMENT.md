# 🚀 EC2 Production Deployment Guide

## Complete Docker + EC2 + Nginx Deployment

### Prerequisites
- AWS Account with EC2 access
- SSH key pair (.pem file)
- Your Gmail App Password for email OTP

---

## Step 1: Launch EC2 Instance

### In AWS Console:
1. **Services** → **EC2** → **Launch Instance**
2. Configure:
   - **Name**: `ev-charging-app`
   - **AMI**: Ubuntu Server 24.04 LTS
   - **Instance type**: `t2.micro` (free tier) or `t2.small`
   - **Key pair**: Create new or select existing
   - **Security Group**: Create with these rules:

### Security Group Rules:
| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | My IP (or 0.0.0.0/0) |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |

3. **Launch Instance**

---

## Step 2: Connect to EC2

```bash
# Make key file secure (Linux/Mac)
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

For Windows PowerShell:
```powershell
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 3: Install Docker on EC2

Run these commands on your EC2 instance:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker ubuntu

# Logout and login again for group changes to take effect
exit
```

SSH back in:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Verify Docker:
```bash
docker --version
docker-compose --version
```

---

## Step 4: Clone Your Repository

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/vehicle-charging-point-booking.git

# Navigate to project
cd vehicle-charging-point-booking
```

---

## Step 5: Set Up Environment Variables

```bash
# Navigate to backend folder
cd backend

# Create .env file from example
cp .env.example .env

# Edit with your credentials
nano .env
```

Edit the `.env` file:
```env
DATABASE_URL=sqlite:///./charging.db
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-gmail-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=EV Charging System
MAIL_TLS=true
MAIL_SSL=false
JWT_SECRET=your-super-secret-random-string
```

Save: `Ctrl+X`, then `Y`, then `Enter`

```bash
# Go back to project root
cd ..
```

---

## Step 6: Build and Run with Docker Compose

```bash
# Build all containers
docker-compose build

# Start in detached mode (background)
docker-compose up -d

# Check status
docker-compose ps
```

Expected output:
```
    Name                  Command               State          Ports
--------------------------------------------------------------------------------
ev-backend     uvicorn app.main:app --hos ...   Up      8000/tcp
ev-frontend    nginx -g daemon off;             Up      80/tcp
ev-nginx       nginx -g daemon off;             Up      0.0.0.0:80->80/tcp
```

---

## Step 7: Verify Deployment

### Check Logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

### Test API:
```bash
curl http://localhost/api/stations/
```

### Access in Browser:
Open: `http://YOUR_EC2_PUBLIC_IP`

---

## 🛠️ Common Commands

### View running containers:
```bash
docker-compose ps
```

### Restart all services:
```bash
docker-compose restart
```

### Stop all services:
```bash
docker-compose down
```

### Rebuild and restart:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View real-time logs:
```bash
docker-compose logs -f
```

### Enter container shell:
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

---

## 🔧 Troubleshooting

### Issue: Container won't start
```bash
# Check logs for errors
docker-compose logs backend

# Rebuild
docker-compose build --no-cache backend
docker-compose up -d
```

### Issue: Can't access from browser
1. Check security group has port 80 open
2. Check nginx is running:
```bash
docker-compose ps nginx
```

### Issue: Database issues
```bash
# Access backend container
docker-compose exec backend bash

# Run database migrations
python -c "from app.database import Base, engine; Base.metadata.create_all(engine)"

# Exit
exit
```

### Issue: Email not sending
1. Verify Gmail App Password is correct (16 characters)
2. Check backend logs:
```bash
docker-compose logs backend | grep -i mail
```

---

## 📊 Architecture

```
Internet
    │
    ▼
┌───────────────────┐
│   EC2 Instance    │
│                   │
│  ┌─────────────┐  │
│  │   Nginx     │◄─┼── Port 80 (HTTP)
│  │  (Reverse   │  │
│  │   Proxy)    │  │
│  └──────┬──────┘  │
│         │         │
│    ┌────┴────┐    │
│    │         │    │
│    ▼         ▼    │
│ ┌──────┐ ┌──────┐ │
│ │Front │ │Back  │ │
│ │end   │ │end   │ │
│ │:80   │ │:8000 │ │
│ └──────┘ └──────┘ │
│                   │
│  ┌─────────────┐  │
│  │  SQLite DB  │  │
│  │  (Volume)   │  │
│  └─────────────┘  │
└───────────────────┘
```

Traffic flow:
- `http://YOUR_IP/` → Nginx → Frontend
- `http://YOUR_IP/api/*` → Nginx → Backend
- `http://YOUR_IP/auth/*` → Nginx → Backend
- `http://YOUR_IP/stations/*` → Nginx → Backend

---

## 🔮 Future Enhancements

### Add HTTPS with Let's Encrypt:
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com
```

### Use PostgreSQL instead of SQLite:
1. Add PostgreSQL service to docker-compose.yml
2. Update DATABASE_URL in .env
3. Rebuild containers

### Connect Domain with Route53:
1. Create hosted zone in Route53
2. Add A record pointing to EC2 public IP
3. Update nginx server_name

---

## 📝 Quick Reference

| Action | Command |
|--------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Restart | `docker-compose restart` |
| Logs | `docker-compose logs -f` |
| Rebuild | `docker-compose build --no-cache` |
| Status | `docker-compose ps` |

---

**Your app is now live at**: `http://YOUR_EC2_PUBLIC_IP`

Happy deploying! 🎉
