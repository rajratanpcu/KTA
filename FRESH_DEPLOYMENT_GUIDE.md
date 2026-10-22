# KTA ERP - Fresh Deployment Guide (No Docker)

**Deploy Date:** 2026-10-19  
**Repository:** https://github.com/rajratanpcu/KTA

---

## Step 1: Deploy Backend to Render (5 minutes)

### Option A: One-Click Blueprint Deploy (RECOMMENDED)

**Click this URL:**
```
https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA
```

This uses `render.yaml` to automatically:
- Create a PostgreSQL 15 database
- Deploy Spring Boot backend with native Java runtime
- Link database to backend
- Configure environment variables

**When the form opens, add these 3 variables:**

| Key | Value |
|-----|-------|
| `CORS_ALLOWED_ORIGINS` | `https://YOUR-VERCEL-URL.vercel.app` (we'll update this after Step 2) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `AdminPassword123!` |

**Click "Apply"** and wait 3-5 minutes.

---

### Option B: Manual Deployment

**If blueprint doesn't work, follow manual steps:**

#### 1. Create PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Settings:
   - **Name:** `kta-erp-postgres`
   - **Database:** `kta_erp`
   - **User:** `kta_admin`
   - **Region:** Oregon
   - **Plan:** Free
4. Click **Create Database**
5. Wait for it to become **Available**
6. Copy the **Internal Database URL** (starts with `postgres://`)

#### 2. Create Web Service
1. Click **New +** → **Web Service**
2. Connect to `rajratanpcu/KTA` repository
3. Configure:
   - **Name:** `kta-backend`
   - **Region:** Oregon (same as database)
   - **Branch:** `main`
   - **Runtime:** `Java`
   - **Build Command:** `cd backend && mvn clean package -DskipTests`
   - **Start Command:** `java -jar backend/target/kta-erp-1.0.0.jar`
   - **Plan:** Free

4. **Environment Variables:**

| Key | Value |
|-----|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:[paste Internal Database URL]` |
| `SPRING_DATASOURCE_USERNAME` | `kta_admin` |
| `SPRING_DATASOURCE_PASSWORD` | [copy from database page] |
| `PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_MAX_POOL_SIZE` | `5` |
| `DB_MIN_IDLE` | `2` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `AdminPassword123!` |
| `CORS_ALLOWED_ORIGINS` | `https://YOUR-VERCEL-URL.vercel.app` |
| `UPLOAD_DIR` | `/tmp/kta-uploads` |

5. Click **Create Web Service**

---

## Step 2: Deploy Frontend to Vercel (2 minutes)

**Click this URL:**
```
https://vercel.com/new/clone?repository-url=https://github.com/rajratanpcu/KTA&root-directory=frontend
```

**Or manually:**

1. Go to https://vercel.com/new
2. Import `rajratanpcu/KTA`
3. Configure:
   - **Project Name:** `kta-erp` (or your choice)
   - **Framework:** Vite (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://YOUR-RENDER-BACKEND.onrender.com` (from Step 1)

5. Click **Deploy**

6. **Copy your Vercel URL** (e.g., `https://kta-erp-abc123.vercel.app`)

---

## Step 3: Update CORS on Backend

1. Go back to Render dashboard
2. Click your `kta-backend` service
3. Go to **Environment** tab
4. Find `CORS_ALLOWED_ORIGINS`
5. Update to your Vercel URL (e.g., `https://kta-erp-abc123.vercel.app`)
6. Click **Save Changes**
7. Service will auto-redeploy (30 seconds)

---

## Step 4: Test Your Deployment

### 1. Backend Health
Open: `https://YOUR-BACKEND.onrender.com/actuator/health`  
Expected: `{"status":"UP"}`

### 2. Backend Security
Open: `https://YOUR-BACKEND.onrender.com/api/categories`  
Expected: `401 Unauthorized` ✅

### 3. Frontend Login
Open: `https://YOUR-FRONTEND.vercel.app/login`

**Test Credentials:**
- Username: `admin`
- Password: `AdminPassword123!`

---

## What Gets Deployed

### Backend (Render)
✅ Spring Boot 3.1.5 JAR (no Docker)  
✅ Native Java 17 runtime  
✅ Maven build (`mvn clean package`)  
✅ 6 Flyway database migrations  
✅ BCrypt password security  
✅ CORS protection  

### Frontend (Vercel)
✅ React 18 + TypeScript SPA  
✅ Vite production build  
✅ Tailwind CSS + shadcn/ui  
✅ Edge CDN distribution  
✅ Zero Docker anywhere  

### Database (Render)
✅ Managed PostgreSQL 15  
✅ Automated backups  
✅ Internal network security  
✅ 1GB storage (free tier)  

---

## Expected Build Logs

### Render Backend:
```
==> Cloning from https://github.com/rajratanpcu/KTA
==> Installing Java 17...
==> Running build: cd backend && mvn clean package -DskipTests
[INFO] BUILD SUCCESS
==> Starting: java -jar backend/target/kta-erp-1.0.0.jar
INFO c.k.erp.KtaErpApplication - Starting KtaErpApplication
INFO o.f.core.internal.command.DbMigrate - Successfully validated 6 migrations
INFO c.k.erp.config.AdminBootstrap - Admin account provisioned
INFO o.s.b.w.embedded.tomcat.TomcatWebServer - Tomcat started on port 8080
INFO c.k.erp.KtaErpApplication - Started KtaErpApplication in 12.5s
```

### Vercel Frontend:
```
Installing dependencies...
Running build command: npm run build
Building React application with Vite...
✓ built in 8.2s
Deployment complete!
```

---

## Troubleshooting

### "mvn: command not found" on Render
**Solution:** Make sure Runtime is set to `Java`, not `Node` or `Docker`

### "Connection refused" in frontend
**Solution:** 
1. Check `VITE_API_BASE_URL` is correct in Vercel
2. Wait 30-60s for backend cold start

### "CORS error" in browser console
**Solution:** Verify `CORS_ALLOWED_ORIGINS` matches your Vercel URL exactly (no trailing slash)

### Database migrations fail
**Solution:** Check `SPRING_DATASOURCE_URL` starts with `jdbc:postgresql://`

---

## Quick Deploy Scripts

I've created helper scripts in your project:

- `push_docker_removal.bat` - Push latest code to GitHub
- `deploy_to_render.bat` - Open Render blueprint deploy
- `deploy_frontend_vercel.bat` - Open Vercel import page
- `verify_and_connect.bat` - Test backend health

---

## Architecture

```
User Browser
    ↓
[Vercel CDN] → React 18 Frontend (https://YOUR-APP.vercel.app)
    ↓ HTTPS
[Render] → Spring Boot 3 API (https://YOUR-API.onrender.com)
    ↓ Internal Network
[Render] → PostgreSQL 15 Database (managed)
```

**Zero Docker. Zero Localhost. Pure Cloud Native.**

---

**Ready to deploy?** Start with Step 1!
