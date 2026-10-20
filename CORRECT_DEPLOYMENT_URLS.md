# ✅ CORRECT Deployment URLs

**Last Updated:** 2026-10-20  
**Status:** URLs corrected

---

## Your Actual Deployment URLs

| Service | Correct URL |
|---------|-------------|
| Frontend | **https://frontend-liard-delta-44.vercel.app** |
| Backend | **https://kta-erp-backend-d7xj.onrender.com** |
| Database | Internal (Render managed) |

---

## URGENT: Set Backend CORS on Render

Your backend must have `CORS_ALLOWED_ORIGINS` configured to match your new frontend.

### Set This Exact Value on Render:

1. Go to: https://dashboard.render.com
2. Click: **kta-erp-backend** service
3. Click: **Environment** tab
4. Find `CORS_ALLOWED_ORIGINS` (or click "Add Environment Variable" if missing)
5. Set value to: **`https://frontend-liard-delta-44.vercel.app,https://kta-phi.vercel.app`** (no trailing slash)
6. Click: **Save Changes**
7. Wait: 2-3 minutes for redeploy

---

## Then Test These URLs

### 1. Backend Health Check
```
https://kta-erp-backend-d7xj.onrender.com/actuator/health
```
**Expected:** `{"status":"UP"}`

### 2. Frontend Login
```
https://frontend-liard-delta-44.vercel.app/login
```
**Credentials:**
- Username: `admin`
- Password: `AdminPassword123!`

---

## Environment Variables You Need on Render

| Variable | Value |
|----------|-------|
| `CORS_ALLOWED_ORIGINS` | `https://kta-phi.vercel.app` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `AdminPassword123!` |
| `SPRING_DATASOURCE_URL` | (auto-set from database) |
| `SPRING_DATASOURCE_USERNAME` | (auto-set from database) |
| `SPRING_DATASOURCE_PASSWORD` | (auto-set from database) |
| `PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_MAX_POOL_SIZE` | `5` |
| `DB_MIN_IDLE` | `2` |
| `UPLOAD_DIR` | `/tmp/kta-uploads` |

---

## What You'll See in Render Logs After Fix

When the CORS variable is set correctly, you should see:

```
INFO c.k.erp.KtaErpApplication - Starting KtaErpApplication
INFO com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Start completed
INFO o.f.core.internal.command.DbMigrate - Schema "public" is up to date
INFO c.k.erp.config.AdminBootstrap - Admin account created successfully for user: admin
INFO o.s.b.w.embedded.tomcat.TomcatWebServer - Tomcat started on port 8080
INFO c.k.erp.KtaErpApplication - Started KtaErpApplication in X seconds
==> Your service is live 🎉
```

---

## Why You Got "Not Found" Error

The backend application **failed to start** because:

1. `CORS_ALLOWED_ORIGINS` environment variable was missing
2. The CorsConfig class throws an exception if CORS is not set
3. Spring Boot refuses to start when a bean initialization fails
4. Render returns "Not Found" when the app isn't running

**Fix:** Set `CORS_ALLOWED_ORIGINS=https://kta-phi.vercel.app` and it will start.

---

**DO THIS NOW:** Go to Render and set that CORS variable to `https://kta-phi.vercel.app`
