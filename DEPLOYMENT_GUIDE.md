# Backend Deployment Guide

## Option 1: Docker-based Deployment (Recommended)

### Requirements
- VPS/Cloud Server (AWS EC2, DigitalOcean, etc.)
- Docker & Docker Compose installed
- Domain name (optional)

### Steps

#### 1. Server Setup
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/divyanshu-iitian/Projectmine.git
cd Projectmine/ecommerce-microservices

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Configure Firewall
```bash
# Allow necessary ports
sudo ufw allow 3000    # API Gateway
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 22      # SSH
sudo ufw enable
```

#### 4. Setup Nginx Reverse Proxy (Optional but recommended)
```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt (Free HTTPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Option 2: Individual Service Deployment

### Deploy on Different Platforms

#### Render.com (Free tier available)
1. Create account on render.com
2. Create Web Service for each microservice
3. Connect GitHub repo
4. Set environment variables
5. Deploy

#### Railway.app
1. Create account on railway.app
2. Create new project from GitHub
3. Add services (MongoDB, Redis)
4. Deploy

#### AWS EC2
1. Launch EC2 instance
2. Follow Docker deployment steps above

---

## Environment Variables Setup

Create `.env` file with production values:

```env
# MongoDB
MONGO_URI=mongodb://mongodb:27017/productdb

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Services URLs (if deployed separately)
INVENTORY_SERVICE_URL=http://inventory-service:6000
PRODUCT_SERVICE_URL=http://product-service:5000
ORDER_SERVICE_URL=http://order-service:7000
PAYMENT_SERVICE_URL=http://payment-service:8000
AUTH_SERVICE_URL=http://auth-service:4000
```

---

## Production Checklist

- [ ] Change all default passwords
- [ ] Update JWT_SECRET
- [ ] Setup SSL/HTTPS
- [ ] Enable firewall
- [ ] Setup monitoring (PM2, Datadog, etc.)
- [ ] Setup backups for MongoDB
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Setup logging (ELK stack, CloudWatch)
- [ ] Performance testing
- [ ] Security audit

---

## Monitoring & Maintenance

### View Logs
```bash
docker-compose logs -f service-name
```

### Restart Services
```bash
docker-compose restart service-name
```

### Update Application
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Backup MongoDB
```bash
docker exec mongodb mongodump --out /backup
```

### Monitor Resources
```bash
docker stats
```

---

## Cost Estimation

### Free Options
- **Render.com**: Free tier (limited)
- **Railway.app**: $5 free credit monthly
- **Heroku**: Free dyno (deprecated)

### Paid Options
- **DigitalOcean**: $6/month (basic droplet)
- **AWS EC2**: $10-20/month (t2.micro)
- **Linode**: $5/month (Nanode)

### Recommended for Production
- **DigitalOcean App Platform**: $12/month
- **AWS**: Using multiple services (EC2, RDS, ElastiCache)
- **Google Cloud Run**: Pay per use

---

## Quick Deploy Commands

### Full Stack
```bash
# One command deployment
docker-compose up -d --build

# Check everything
docker-compose ps
docker-compose logs
```

### Individual Service
```bash
# Deploy only one service
docker-compose up -d --build product-service
```

---

## Troubleshooting

### Services not connecting
```bash
# Check network
docker network ls
docker network inspect ecommerce-microservices_default
```

### Port already in use
```bash
# Find process
sudo lsof -i :3000
# Kill process
sudo kill -9 PID
```

### Out of memory
```bash
# Increase Docker memory limit
# Or upgrade server RAM
```

---

## Support

For issues or questions:
- GitHub: https://github.com/divyanshu-iitian/Projectmine
- Email: your-email@example.com
