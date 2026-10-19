# Connect Frontend to Backend

## Backend Deployed ✅
**URL:** https://kta-ow3x.onrender.com

---

## Update Vercel Frontend (3 minutes)

### Step 1: Update Environment Variable
1. Go to **https://vercel.com/dashboard**
2. Click on your **`kta2`** project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_BASE_URL`
5. Click **Edit** (pencil icon)
6. Change value to: `https://kta-ow3x.onrender.com`
7. Click **Save**

### Step 2: Redeploy Frontend
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **⋮** (three dots menu)
4. Click **Redeploy**
5. Confirm the redeploy

### Step 3: Wait for Deployment
- Deployment takes ~30 seconds
- Watch for "Deployment succeeded" message
- Frontend will be updated at: https://kta2.vercel.app

---

## Verify Deployment

### Test 1: Health Check
Open in browser:
```
https://kta-ow3x.onrender.com/actuator/health
```
Expected: `{"status":"UP"}`

### Test 2: Backend API (401 expected - security working)
Open in browser:
```
https://kta-ow3x.onrender.com/api/categories
```
Expected: `401 Unauthorized` (this is correct - proves security is active)

### Test 3: Frontend Login
1. Open: https://kta2.vercel.app/login
2. Login with:
   - **Username:** `admin`
   - **Password:** `AdminPassword123!`
3. You should see the dashboard

---

## Troubleshooting

### Backend shows "Service Unavailable"
- **Cause:** Cold start (free tier spins down after 15 min idle)
- **Solution:** Wait 30-60 seconds and refresh

### Frontend shows "Network Error"
- **Cause:** VITE_API_BASE_URL not updated
- **Solution:** Double-check Step 1 above, ensure no trailing slash

### Login shows "Invalid credentials"
- **Cause:** Database not initialized or wrong credentials
- **Solution:** Check Render logs for "AdminBootstrap" message

### CORS error in browser console
- **Cause:** CORS_ALLOWED_ORIGINS mismatch
- **Solution:** In Render, verify `CORS_ALLOWED_ORIGINS=https://kta2.vercel.app`

---

## Check Render Logs

If anything isn't working:

1. Go to https://dashboard.render.com
2. Click on `kta-backend` service
3. Click **Logs** tab
4. Look for:
   ```
   INFO  c.k.erp.KtaErpApplication - Started KtaErpApplication
   INFO  o.f.core.internal.command.DbMigrate - Successfully validated 6 migrations
   INFO  c.k.erp.config.AdminBootstrap - Admin account provisioned
   ```

---

## Expected First Request Behavior

⚠️ **First request after idle period:**
- Backend may take 30-50 seconds to wake up (Render free tier cold start)
- Frontend shows loading spinner
- Subsequent requests are instant

This is normal for free-tier deployments.

---

## Complete Deployment URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://kta2.vercel.app | ✅ LIVE |
| Backend | https://kta-ow3x.onrender.com | ✅ LIVE |
| Database | kta-erp-postgres (internal) | ✅ ACTIVE |

---

## Test Credentials

**Administrator Account:**
- Username: `admin`
- Password: `AdminPassword123!`

After first login, you can create additional users through the Users module in the dashboard.
