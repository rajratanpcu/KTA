# 🔧 Deployment Fix Guide

**Date:** 2026-10-20  
**Status:** Critical fixes applied, deployment pending

---

## Issues Fixed

✅ **Frontend production environment** - Created `.env.production` with Render backend URL  
✅ **Vercel configuration** - Added `vercel.json` with SPA routing and security headers  
✅ **Git tracking** - Ready to commit changes  

⏳ **Backend CORS** - Needs manual update on Render dashboard  
⏳ **Backend redeploy** - Needs manual trigger on Render dashboard  

---

## Step 1: Commit and Push Changes

Run these commands in order:

```bash
# Add all the new configuration files
git add frontend/.env.production vercel.json DEPLOYMENT_FIX_GUIDE.md

# Commit the fixes
git commit -m "Fix: Add production environment config and Vercel settings

- Add frontend/.env.production with Render backend URL
- Add vercel.json with SPA routing and security headers
- Document deployment fix steps

Co-Authored-By: Claude Code <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

---

## Step 2: Redeploy Frontend on Vercel

### Option A: Automatic (Recommended)
Vercel will auto-deploy when you push to GitHub (takes 1-2 minutes)

### Option B: Manual Trigger
1. Go to https://vercel.com/dashboard
2. Click on your `ktaa` project
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment
5. Check **Use existing Build Cache** (faster)
6. Click **Redeploy**

**Expected result:** Frontend now uses `https://kta-ow3x.onrender.com` as API URL

---

## Step 3: Fix Backend CORS on Render

🚨 **CRITICAL:** Your backend currently allows `http://localhost:5173` but Vercel uses `https://kta-phi.vercel.app`

### Steps:
1. Go to https://dashboard.render.com
2. Click on **kta-erp-backend** service
3. Click **Environment** tab in the left sidebar
4. Find `CORS_ALLOWED_ORIGINS` variable
5. **If it exists:**
   - Click **Edit**
   - Change value to: `https://kta-phi.vercel.app`
   - Click **Save Changes**
6. **If it doesn't exist:**
   - Click **Add Environment Variable**
   - Key: `CORS_ALLOWED_ORIGINS`
   - Value: `https://kta-phi.vercel.app`
   - Click **Add**

**Expected result:** Service auto-redeploys (takes 2-3 minutes)

---

## Step 4: Verify Backend Redeploy

Your backend should already be using the new Java buildpack configuration from your previous commit. Let's verify:

1. Go to https://dashboard.render.com
2. Click on **kta-erp-backend** service
3. Click **Events** tab
4. Check the latest deploy event - it should show:
   - ✅ `Build Command: cd backend && mvn clean package -DskipTests`
   - ✅ `Start Command: java -jar backend/target/kta-erp-1.0.0.jar`

### If it still shows Docker:
1. Click **Manual Deploy** (top right)
2. Select **Clear build cache & deploy**
3. Click **Deploy**
4. Wait 2-3 minutes for build to complete

---

## Step 5: Test the Deployment

### 1. Backend Health Check
Open in browser (may take 30-60 seconds on first request):
```
https://kta-ow3x.onrender.com/actuator/health
```
**Expected:** `{"status":"UP"}`

### 2. Backend API Security Test
```
https://kta-ow3x.onrender.com/api/categories
```
**Expected:** `401 Unauthorized` (proves security is working)

### 3. Full Login Test
1. Open: https://kta-phi.vercel.app/login
2. Enter credentials:
   - Username: `admin`
   - Password: `AdminPassword123!`
3. Click **Login**

**Expected:** Dashboard loads successfully

### 4. Check Browser Console
- Press F12 → Console tab
- Should see NO CORS errors
- Should see successful API calls

---

## Troubleshooting

### ❌ "Network Error" on login
**Cause:** Backend is cold-starting or CORS not updated  
**Fix:** Wait 60 seconds and try again, then verify Step 3

### ❌ CORS error: "Access-Control-Allow-Origin"
**Cause:** CORS_ALLOWED_ORIGINS not set correctly on Render  
**Fix:** 
1. Go back to Step 3
2. Make sure value is exactly: `https://kta-phi.vercel.app` (no trailing slash)
3. Save and wait for auto-redeploy

### ❌ "Invalid credentials"
**Cause:** Database not initialized or backend not started  
**Fix:**
1. Check Render logs: Services → kta-erp-backend → Logs
2. Look for: "AdminBootstrap - Admin user created successfully"
3. If not found, restart the service

### ❌ 503 Service Unavailable
**Cause:** Backend failed to start  
**Fix:**
1. Check Render logs for errors
2. Common issues:
   - Database connection failure (check DATABASE_URL)
   - Out of memory (free tier limit)
   - Build failed (check build logs)

---

## Architecture After Fix

```
┌─────────────────────────────────────────────────────────────┐
│ User's Browser                                              │
│   https://kta-phi.vercel.app/login                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─ GET /login → Vercel Edge (React SPA)
                  │
                  └─ POST /api/public/login → Backend
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Render - Backend                                            │
│   https://kta-ow3x.onrender.com                            │
│   Runtime: Native Java 17 (no Docker)                      │
│   CORS: https://kta-phi.vercel.app                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  └─ Database queries
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Render - PostgreSQL Database                                │
│   kta-erp-postgres (internal network)                      │
│   Flyway migrations applied: V1-V6                         │
└─────────────────────────────────────────────────────────────┘
```

---

## What Was Wrong Before

1. **Frontend had no production config** - Used localhost in production builds
2. **Vercel had no routing config** - Direct URL access to `/dashboard` returned 404
3. **Backend CORS mismatch** - Allowed localhost but rejected Vercel domain
4. **Missing security headers** - No CSP, XSS protection, or frame options

---

## Expected Performance

### Cold Start (First Request)
- Backend: 30-60 seconds (Render free tier spins down after 15 min idle)
- Frontend: <1 second (Vercel Edge Network)

### Warm Performance
- Page load: <1 second
- API calls: <200ms
- Database queries: <50ms

---

## Next Steps After Successful Deployment

1. ✅ Test all major features (inventory, sales, reports)
2. ✅ Create test data in production
3. ✅ Set up monitoring (Render dashboard → Metrics)
4. ✅ Enable email notifications for service failures
5. ⏳ Consider custom domain setup
6. ⏳ Set up automated backups for PostgreSQL

---

**Questions or issues?** Check Render and Vercel logs first, then refer to troubleshooting section above.
