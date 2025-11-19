# Mbeki Healthcare Patient Management System
## Installation Instructions for cPanel Hosting

**Developed by [Champs Group](https://www.champsafrica.com)**  
Professional Healthcare Patient Management System with digital consent forms, patient records, and automatic error reporting.

---

## Prerequisites

Before installing, ensure your hosting environment has:
- **Node.js 18+** (check with your hosting provider)
- **PostgreSQL database** access
- **SSH/Terminal access** to run npm commands
- At least **512MB RAM** and **1GB disk space**

---

## Installation Steps

### 1. Upload Files
Upload all files from this package to your domain's root directory (usually `public_html` or `www`).

### 2. Database Setup
1. Create a PostgreSQL database in your cPanel
2. Note down your database credentials:
   - Database name
   - Username
   - Password  
   - Host (usually localhost)
   - Port (usually 5432)

### 3. Environment Configuration
1. Rename `.env.example` to `.env`
2. Edit `.env` file with your actual values:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_secure_random_string_here
```

**Important:** Change `SESSION_SECRET` to a long random string for security.

### 4. Install Dependencies
Run these commands in your terminal/SSH:
```bash
cd /path/to/your/website/directory
npm install
```

### 5. Database Setup
Initialize your database with the required tables:
```bash
npm run db:push
```

### 6. Build the Application
Compile the application for production:
```bash
npm run build
```

### 7. Start the Application
```bash
npm start
```

For automatic startup, set up a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name "mbeki-healthcare"
pm2 startup
pm2 save
```

---

## System Features

✅ **Patient Management**
- Complete patient registration
- Medical history tracking
- Emergency contact information

✅ **Digital Consent Forms** 
- Lipolytic Injections
- Ozempic/Mounjaro Weight Loss
- Skin Tag/Mole/Wart Removal
- IV Therapy
- Custom treatments with custom terms

✅ **Vitals Tracking**
- Blood Pressure (BP)
- Pulse Rate
- Temperature
- Weight
- HGT (Glucose)
- HB (Hemoglobin)

✅ **Professional Features**
- Digital signature capture
- PDF generation for forms and reports
- Dashboard analytics
- Patient search and filtering
- Automatic error reporting to info@champsafrica.com

✅ **Security & Branding**
- Secure session management
- Professional UI/UX
- Champs Group branding
- Responsive design

---

## Troubleshooting

**Database Connection Issues:**
- Verify DATABASE_URL format is correct
- Check database credentials
- Ensure PostgreSQL is running
- Confirm firewall allows database connections

**Port Issues:**
- Default port is 5000
- Change PORT in .env if needed
- Ensure the port is open in your firewall

**Build Errors:**
- Ensure Node.js version 18+
- Try deleting node_modules and running `npm install` again
- Check for TypeScript compilation errors

**Permission Issues:**
- Ensure proper file permissions (755 for directories, 644 for files)
- Check if your hosting allows Node.js applications

---

## Support

**System developed by Champs Group**
- Website: [https://www.champsafrica.com](https://www.champsafrica.com)
- Email: info@champsafrica.com

**Automatic Error Reporting:**
The system automatically reports any errors to info@champsafrica.com for quick resolution.

---

## Default Access

After installation, access your system at:
```
https://yourdomain.com
```

The system will show:
- **Dashboard** - Overview and statistics
- **Patient Registration** - Add new patients  
- **Patient Lookup** - Search and manage patients
- **Consent Forms** - Create digital consent forms
- **Reports** - Generate PDF reports
- **Settings** - System configuration

---

## Security Notes

1. **Change default secrets** in `.env` file
2. **Use HTTPS** in production (enable SSL in cPanel)
3. **Regular backups** of database and files
4. **Update dependencies** periodically with `npm update`
5. **Monitor error logs** (automatically sent to info@champsafrica.com)

---

## File Structure
```
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── shared/                 # Shared schemas and types
├── dist/                   # Built application (after npm run build)
├── package.json           # Dependencies and scripts
├── .env                   # Environment configuration
└── INSTALL.md            # This file
```

---

**© 2024 Mbeki Healthcare System - Developed & Owned by Champs Group**