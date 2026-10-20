# 🚀 KTA ERP - Quick Start Guide

**Created:** 2026-10-19

## One-Command Startup

Double-click: **`START_PROJECT.bat`**

This will automatically:
1. Start the backend server (port 8080)
2. Start the frontend server (port 5173)
3. Open both in separate windows

---

## First Time Setup (Run Once)

### Step 1: Check Prerequisites
Double-click: **`check_prerequisites.bat`**

This verifies you have:
- ✓ Java 17
- ✓ Maven 3.8+
- ✓ Node.js 18+
- ✓ PostgreSQL 15

### Step 2: Setup Database
Double-click: **`setup_database.bat`**

Creates:
- Database: `kta_erp_local`
- User: `kta_admin`
- Password: `kta_local_password`

---

## Manual Startup (If Needed)

If the automated startup doesn't work, run these in order:

1. **Start Backend** - Double-click: `start_backend.bat`
   - Wait for: "Started KtaErpApplication in X seconds"
   
2. **Start Frontend** - Double-click: `start_frontend.bat`
   - Opens at: http://localhost:5173

---

## Access the Application

**URL:** http://localhost:5173/login

**Login:**
- Username: `admin`
- Password: `AdminPassword123!`

---

## Configuration Files Created

✓ `frontend/.env.local` - Frontend API configuration
✓ `backend/src/main/resources/application-local.properties` - Backend database config

---

## Troubleshooting

### Port Already in Use
If port 8080 or 5173 is taken:
- Close the application using that port
- Or restart your computer

### Database Connection Error
Run: `setup_database.bat` again

### Build Errors
```bash
cd backend
mvn clean install -DskipTests
```

### Frontend Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Architecture

```
Frontend (React + Vite)     Backend (Spring Boot)     Database (PostgreSQL)
http://localhost:5173  -->  http://localhost:8080 --> localhost:5432
```

---

## Next Steps After Running

1. Explore the dashboard
2. Create test data
3. Make code changes
4. Push to GitHub: `git push origin main`

---

**Need Help?** Check [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)
