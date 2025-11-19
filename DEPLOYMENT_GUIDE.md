# Mbeki Healthcare - Truehost Server Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Requirements](#server-requirements)
3. [Initial Server Setup](#initial-server-setup)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Process Management with PM2](#process-management-with-pm2)
9. [Maintenance & Monitoring](#maintenance--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before starting, ensure you have:
- ✅ Truehost server access (SSH credentials)
- ✅ Domain name pointed to your server IP
- ✅ All project files ready to upload
- ✅ Database credentials ready
- ✅ Backup of any existing data

---

## Server Requirements

### Minimum Specifications
- **CPU**: 1 vCPU (2 vCPU recommended for better performance)
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS or newer
- **Bandwidth**: Unmetered or at least 1TB/month

### Required Software
- **Node.js v18+** (LTS recommended)
- **PostgreSQL v13+** (REQUIRED - v10 is not supported)
- Nginx
- PM2 (Process Manager)
- Git (optional, for updates)
- Certbot (for SSL)

---

## Initial Server Setup

### Step 1: Connect to Your Server
```bash
ssh root@your-server-ip
# Or use the credentials provided by Truehost
```

### Step 2: Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Node.js (v20 LTS)
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x or higher
```

### Step 4: Install PostgreSQL 13+

**IMPORTANT**: PostgreSQL 10 is NOT supported. You must use PostgreSQL 13 or higher.

```bash
# Check if PostgreSQL is already installed
psql --version

# If version is below 13, uninstall old version first:
sudo apt remove --purge postgresql postgresql-*
sudo apt autoremove -y
sudo apt autoclean

# Add PostgreSQL repository for latest version
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Install PostgreSQL 13 or higher
sudo apt install -y postgresql-13 postgresql-contrib-13

# Or install the latest version
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation (must be 13 or higher)
sudo -u postgres psql --version
```

### Step 5: Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 6: Install PM2 Globally
```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 7: Create Application User (Security Best Practice)
```bash
# Create a dedicated user for the application
sudo adduser --disabled-password --gecos "" mbeki

# Add to sudo group (optional, for administrative tasks)
sudo usermod -aG sudo mbeki
```

---

## Database Setup

### Step 1: Create PostgreSQL Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL console, run:
CREATE DATABASE mbeki_healthcare;
CREATE USER mbeki_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE mbeki_healthcare TO mbeki_user;

# For PostgreSQL 13+, also grant schema privileges
\c mbeki_healthcare
GRANT ALL ON SCHEMA public TO mbeki_user;
ALTER DATABASE mbeki_healthcare OWNER TO mbeki_user;

# Exit PostgreSQL
\q
```

### Step 2: Configure PostgreSQL for Local Connections

```bash
# Find PostgreSQL version directory
ls /etc/postgresql/

# Edit pg_hba.conf (replace 13 with your version)
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Add this line near the top (before other rules):
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   mbeki_healthcare mbeki_user                             md5

# Save and exit (Ctrl+X, Y, Enter)

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 3: Test Database Connection
```bash
psql -U mbeki_user -d mbeki_healthcare -h localhost
# Enter password when prompted
# You should see: mbeki_healthcare=>
# Type \q to exit
```

---

## Application Deployment

### Step 1: Upload Application Files

**Option A: Using SCP (from your local machine)**
```bash
# Create a zip of your project (exclude node_modules)
# On your local machine:
zip -r mbeki-healthcare.zip . -x "node_modules/*" -x ".git/*" -x "dist/*"

# Upload to server
scp mbeki-healthcare.zip root@your-server-ip:/home/mbeki/
```

**Option B: Using SFTP Client**
- Use FileZilla, WinSCP, or Cyberduck
- Connect to your server
- Upload all files to `/home/mbeki/mbeki-healthcare/`
- Exclude: `node_modules/`, `.git/`, `dist/`

**Option C: Using Git (recommended for updates)**
```bash
# On server, as mbeki user
su - mbeki
cd /home/mbeki
git clone https://github.com/yourusername/mbeki-healthcare.git
cd mbeki-healthcare
```

### Step 2: Set Up Application Directory
```bash
# Switch to mbeki user
su - mbeki

# Navigate to application directory
cd /home/mbeki/mbeki-healthcare

# Extract if you uploaded zip
# unzip ~/mbeki-healthcare.zip -d /home/mbeki/mbeki-healthcare
```

### Step 3: Install Dependencies
```bash
# Install all npm packages
npm install --production

# This may take 5-10 minutes
```

### Step 4: Create Environment File
```bash
# Create .env file
nano .env
```

Add the following content (IMPORTANT: Update all passwords and secrets):

```env
# Database Configuration
DATABASE_URL=postgresql://mbeki_user:your_secure_password_here@localhost:5432/mbeki_healthcare
PGHOST=localhost
PGPORT=5432
PGUSER=mbeki_user
PGPASSWORD=your_secure_password_here
PGDATABASE=mbeki_healthcare

# Optional: Set to 'true' if your database requires SSL
# DATABASE_SSL=false

# Session Secret (generate a random string)
SESSION_SECRET=your-very-long-random-secret-key-here-min-32-chars

# Application Configuration
NODE_ENV=production
PORT=5000
```

**Important**: Replace `your_secure_password_here` and `your-very-long-random-secret-key-here-min-32-chars` with actual secure values.

**To generate a secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Set File Permissions
```bash
# Set correct ownership
sudo chown -R mbeki:mbeki /home/mbeki/mbeki-healthcare

# Secure the .env file
chmod 600 .env

# Make sure attached_assets directory exists and is writable
mkdir -p attached_assets
chmod 755 attached_assets
```

### Step 6: Initialize Database

**Run the database schema migration:**
```bash
npm run db:push
```

**Run the initialization script to create admin user:**
```bash
npx tsx scripts/init-db.ts
```

You should see output like:
```
✅ Database connection successful
✅ Database query test successful
✅ Admin user created successfully
```

If you see any errors:
- Check that DATABASE_URL is correct in .env
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check PostgreSQL version: `psql --version` (must be 13+)

### Step 7: Build the Application
```bash
# Build frontend and backend
npm run build

# This creates optimized production files in dist/
```

### Step 8: Test the Application
```bash
# Try starting the app manually first
npm start

# You should see:
# 🔍 Testing database connection...
# ✅ Database connection successful
# ✅ Admin user already exists
# Server running on port 5000

# Test by visiting: http://your-server-ip:5000

# If it works, press Ctrl+C to stop it
# We'll use PM2 to run it permanently next
```

---

## Nginx Configuration

### Step 1: Create Nginx Configuration File
```bash
sudo nano /etc/nginx/sites-available/mbeki-healthcare
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Root location - proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Serve attached assets with caching
    location /attached_assets/ {
        proxy_pass http://localhost:5000/attached_assets/;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logging
    access_log /var/log/nginx/mbeki-healthcare-access.log;
    error_log /var/log/nginx/mbeki-healthcare-error.log;
}
```

Replace `your-domain.com` with your actual domain.

### Step 2: Enable the Site
```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/mbeki-healthcare /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### Step 1: Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate
```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

### Step 3: Test Auto-Renewal
```bash
# Certbot automatically sets up renewal, test it:
sudo certbot renew --dry-run
```

### Step 4: Update Session Cookie for HTTPS
```bash
# Edit server/index.ts and update cookie.secure to true
nano /home/mbeki/mbeki-healthcare/server/index.ts

# Find this section (around line 18) and change secure to true:
# cookie: {
#   secure: true, // Changed from false
#   maxAge: 24 * 60 * 60 * 1000
# }

# Rebuild the application
cd /home/mbeki/mbeki-healthcare
npm run build
pm2 restart mbeki-healthcare
```

---

## Process Management with PM2

### Step 1: Create PM2 Ecosystem File
```bash
# In your application directory
nano ecosystem.config.cjs
```

Add this configuration:
```javascript
module.exports = {
  apps: [{
    name: 'mbeki-healthcare',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    watch: false,
    merge_logs: true
  }]
};
```

### Step 2: Create Logs Directory
```bash
mkdir -p logs
```

### Step 3: Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs mbeki-healthcare

# You should see:
# ✅ Database connection successful
# ✅ Admin user already exists
# Server running on port 5000

# Press Ctrl+C to exit logs view
```

### Step 4: Set PM2 to Start on Boot
```bash
# Generate startup script
pm2 startup systemd

# Copy and run the command PM2 outputs (it will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u mbeki --hp /home/mbeki

# Save current PM2 process list
pm2 save
```

### Step 5: Useful PM2 Commands
```bash
# Restart application
pm2 restart mbeki-healthcare

# Stop application
pm2 stop mbeki-healthcare

# Delete from PM2
pm2 delete mbeki-healthcare

# Monitor resources
pm2 monit

# View detailed info
pm2 info mbeki-healthcare

# View logs (last 200 lines)
pm2 logs mbeki-healthcare --lines 200
```

---

## Maintenance & Monitoring

### Application Updates

When you need to update the application:

```bash
# 1. Navigate to app directory
cd /home/mbeki/mbeki-healthcare

# 2. Backup database first
pg_dump -U mbeki_user mbeki_healthcare > backup-$(date +%Y%m%d-%H%M%S).sql

# 3. Pull latest code (if using Git)
git pull origin main

# 4. Install any new dependencies
npm install --production

# 5. Run database migrations if schema changed
npm run db:push

# 6. Rebuild application
npm run build

# 7. Restart PM2
pm2 restart mbeki-healthcare

# 8. Check logs for errors
pm2 logs mbeki-healthcare --lines 50
```

### Database Backup Script

Create an automated backup script:

```bash
# Create backup script
nano ~/backup-database.sh
```

Add this content:
```bash
#!/bin/bash
BACKUP_DIR="/home/mbeki/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mbeki-healthcare-$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U mbeki_user mbeki_healthcare > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Make it executable:
```bash
chmod +x ~/backup-database.sh
```

Schedule daily backups with cron:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /home/mbeki/backup-database.sh >> /home/mbeki/backup.log 2>&1
```

### Monitoring Setup

**Monitor Application Logs:**
```bash
# View application logs
pm2 logs mbeki-healthcare

# Check for errors
pm2 logs mbeki-healthcare --err

# Check database connection messages
pm2 logs mbeki-healthcare | grep "Database"
```

**Monitor Nginx Logs:**
```bash
# Access logs
sudo tail -f /var/log/nginx/mbeki-healthcare-access.log

# Error logs
sudo tail -f /var/log/nginx/mbeki-healthcare-error.log
```

**Check Application Health:**
```bash
# Check if app is responding
curl http://localhost:5000/api/auth/me

# Check from outside
curl https://your-domain.com/api/auth/me
```

---

## Troubleshooting

### Database Connection Errors

**Error**: `Cannot connect to database`

**Solution**:
```bash
# 1. Check PostgreSQL is running
sudo systemctl status postgresql

# 2. Restart PostgreSQL
sudo systemctl restart postgresql

# 3. Check PostgreSQL version (must be 13+)
psql --version

# 4. Test database connection manually
psql -U mbeki_user -d mbeki_healthcare -h localhost

# 5. Check DATABASE_URL in .env
cat /home/mbeki/mbeki-healthcare/.env | grep DATABASE_URL

# 6. Run the initialization script
cd /home/mbeki/mbeki-healthcare
npx tsx scripts/init-db.ts
```

### Login Fails with "undefined is not an object"

This error usually means:
1. Database connection failed
2. Admin user was not created
3. Database schema is not initialized

**Solution**:
```bash
# 1. Check application logs
pm2 logs mbeki-healthcare

# Look for these messages:
# ✅ Database connection successful
# ✅ Admin user already exists

# If you don't see them:

# 2. Stop the application
pm2 stop mbeki-healthcare

# 3. Run database initialization
cd /home/mbeki/mbeki-healthcare
npx tsx scripts/init-db.ts

# 4. Restart application
pm2 restart mbeki-healthcare

# 5. Check logs again
pm2 logs mbeki-healthcare
```

### Application Won't Start

**Check PM2 logs:**
```bash
pm2 logs mbeki-healthcare --err
```

**Common issues:**

1. **Port already in use:**
   ```bash
   sudo lsof -i :5000
   # Kill the process using the port
   sudo kill -9 <PID>
   ```

2. **Build failed:**
   ```bash
   cd /home/mbeki/mbeki-healthcare
   npm run build
   # Check for errors
   ```

3. **Permission errors:**
   ```bash
   # Fix ownership
   sudo chown -R mbeki:mbeki /home/mbeki/mbeki-healthcare
   ```

### 502 Bad Gateway Error

**Check if application is running:**
```bash
pm2 status
pm2 restart mbeki-healthcare
```

**Check Nginx configuration:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**Check logs:**
```bash
pm2 logs mbeki-healthcare
sudo tail -f /var/log/nginx/mbeki-healthcare-error.log
```

### PostgreSQL Version Issues

**Error**: Features not working / Connection failures

**Check version:**
```bash
psql --version
```

**If version is below 13:**
```bash
# Follow Step 4 in Initial Server Setup to upgrade PostgreSQL
```

### SSL Certificate Issues

**Certificate expired:**
```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

**Force renewal:**
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Performance Issues

**High memory usage:**
```bash
# Check memory
free -h

# Restart application
pm2 restart mbeki-healthcare

# Set memory limit in ecosystem.config.cjs
# max_memory_restart: '500M'
```

**Slow database queries:**
```bash
# Vacuum and analyze database
sudo -u postgres psql mbeki_healthcare -c "VACUUM ANALYZE;"
```

### Firewall Configuration (if using UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Quick Reference Commands

### Application Management
```bash
pm2 restart mbeki-healthcare     # Restart app
pm2 logs mbeki-healthcare        # View logs
pm2 monit                        # Monitor resources
npx tsx scripts/init-db.ts       # Re-initialize database
```

### Database Management
```bash
psql -U mbeki_user -d mbeki_healthcare  # Connect to DB
~/backup-database.sh                     # Backup database
npm run db:push                          # Push schema changes
```

### Server Management
```bash
sudo systemctl restart nginx       # Restart Nginx
sudo systemctl restart postgresql  # Restart PostgreSQL
sudo certbot renew                # Renew SSL
```

### Useful File Locations
- Application: `/home/mbeki/mbeki-healthcare/`
- Nginx config: `/etc/nginx/sites-available/mbeki-healthcare`
- Nginx logs: `/var/log/nginx/`
- Application logs: `/home/mbeki/mbeki-healthcare/logs/`
- Environment: `/home/mbeki/mbeki-healthcare/.env`
- Init script: `/home/mbeki/mbeki-healthcare/scripts/init-db.ts`

---

## Security Checklist

- ✅ Use strong passwords for database and SESSION_SECRET
- ✅ Enable SSL/HTTPS with valid certificate
- ✅ Set `cookie.secure: true` in production (after SSL is enabled)
- ✅ Keep server and packages updated
- ✅ Use UFW firewall to restrict ports
- ✅ Disable root SSH login (edit `/etc/ssh/sshd_config`)
- ✅ Set up automated backups
- ✅ Monitor logs regularly
- ✅ Restrict database access to localhost only
- ✅ Keep `.env` file permissions at 600
- ✅ Ensure PostgreSQL version is 13 or higher

---

## Support Contacts

**For Application Issues:**
- Champs Group Support
- Email: info@champsafrica.com
- WhatsApp: +27 21 879 3035

**For Server/Hosting Issues:**
- Contact Truehost Support
- Use your hosting control panel

---

## PostgreSQL 13 vs 10 - Why Version Matters

**Key Differences:**
- PostgreSQL 10 lacks modern connection pooling features
- PostgreSQL 13+ has better performance and stability
- The application uses features that require PostgreSQL 13+
- Connection handling is optimized for PostgreSQL 13+

**If your host only provides PostgreSQL 10:**
1. Request an upgrade to PostgreSQL 13 or higher
2. Or consider migrating to a host that provides PostgreSQL 13+
3. The application WILL NOT work reliably with PostgreSQL 10

---

## Conclusion

Your Mbeki Healthcare application is now deployed on Truehost with PostgreSQL 13+! 

**Next Steps:**
1. Test all functionality thoroughly
2. Set up regular backups
3. Monitor logs for any errors
4. Train staff on using the system
5. Keep the application and server updated

Good luck with your healthcare management system! 🏥
