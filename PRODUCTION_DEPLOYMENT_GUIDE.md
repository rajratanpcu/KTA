# KTA ERP - Complete Production Deployment Guide

## 🎯 Quick Overview

Your frontend is already deployed at: https://frontend-liard-delta-44.vercel.app

Now let's deploy the backend and connect everything for full production!

---

## 📋 Step 1: Deploy Backend to Render (5 minutes)

### Option A: One-Click Blueprint Deploy (Easiest)

1. **Click this link:** https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA

2. **Sign in** with your GitHub account if not already

3. **Review the Blueprint** - Render will automatically create:
   - PostgreSQL database (free tier)
   - Spring Boot backend service (free tier)

4. **Set Required Environment Variables:**
   ```
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = Admin@123456789
   CORS_ALLOWED_ORIGINS = https://frontend-liard-delta-44.vercel.app,http://localhost:5173
   ```

5. **Click "Apply"**

6. **Wait 5-7 minutes** for:
   - Database provisioning
   - Backend build and deployment
   - Health checks to pass

7. **Copy your backend URL** (will be something like):
   ```
   https://kta-erp-backend-xxxx.onrender.com
   ```

### Option B: Manual Setup (More Control)

#### 1. Create PostgreSQL Database

1. Go to: https://dashboard.render.com/new/database
2. **Name:** `kta-erp-postgres`
3. **Database:** `kta_erp`
4. **User:** `kta_admin`
5. **Region:** Oregon (or closest to you)
6. **Plan:** Free
7. Click **Create Database**
8. **Copy the Internal Database URL** (you'll need this)

#### 2. Create Backend Web Service

1. Go to: https://dashboard.render.com/create?type=web
2. **Connect repository:** `rajratanpcu/KTA`
3. **Configuration:**
   - **Name:** `kta-erp-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Runtime:** Docker
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
   - **Instance Type:** Free

4. **Environment Variables** (click Advanced):
   ```
   SPRING_DATASOURCE_URL = <paste Internal Database URL>
   SPRING_DATASOURCE_USERNAME = kta_admin
   SPRING_DATASOURCE_PASSWORD = <database password from step 1>
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = Admin@123456789
   CORS_ALLOWED_ORIGINS = https://frontend-liard-delta-44.vercel.app,http://localhost:5173
   DB_MAX_POOL_SIZE = 5
   DB_MIN_IDLE = 2
   PORT = 8080
   ```

5. Click **Create Web Service**

6. Wait for deployment (5-10 minutes)

---

## 📋 Step 2: Connect Frontend to Backend (2 minutes)

### Using Vercel Dashboard

1. **Go to:** https://vercel.com/ratanraj087-6617s-projects/frontend/settings/environment-variables

2. **Add Environment Variable:**
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://kta-erp-backend-xxxx.onrender.com`
   - (Replace with your actual Render backend URL)
   - **Environments:** Production, Preview, Development

3. **Click "Save"**

4. **Redeploy:**
   - Go to: https://vercel.com/ratanraj087-6617s-projects/frontend/deployments
   - Click "Redeploy" on the latest deployment
   - Wait 1-2 minutes

### Using Vercel CLI (Alternative)

```bash
cd C:/Users/hp/Desktop/collage/KTA/frontend

# Set environment variable
vercel env add VITE_API_BASE_URL production

# When prompted, paste your Render backend URL:
# https://kta-erp-backend-xxxx.onrender.com

# Redeploy
vercel --prod
```

---

## 📋 Step 3: Verify Production Deployment

### Backend Health Check

1. **Open in browser:**
   ```
   https://kta-erp-backend-xxxx.onrender.com/actuator/health
   ```

2. **Expected response:**
   ```json
   {
     "status": "UP"
   }
   ```

### Test API Endpoints

```bash
# Get all products
curl https://kta-erp-backend-xxxx.onrender.com/api/products

# Get all categories
curl https://kta-erp-backend-xxxx.onrender.com/api/categories

# Get all godowns
curl https://kta-erp-backend-xxxx.onrender.com/api/godowns
```

### Frontend Login

1. **Open:** https://frontend-liard-delta-44.vercel.app

2. **Login with:**
   - Username: `admin`
   - Password: `Admin@123456789`

3. **Test features:**
   - Create a product
   - Add a godown
   - Create a transport bill
   - View reports

---

## 🔧 Step 4: Update Backend CORS (Important!)

After verifying everything works:

1. **Go to your backend service on Render**

2. **Environment → Edit**

3. **Update CORS_ALLOWED_ORIGINS** to only include your production frontend:
   ```
   CORS_ALLOWED_ORIGINS = https://frontend-liard-delta-44.vercel.app
   ```

4. **Save** (backend will auto-redeploy)

---

## 📊 Production URLs Summary

After completing all steps:

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://frontend-liard-delta-44.vercel.app | ✅ Live |
| **Backend API** | https://kta-erp-backend-xxxx.onrender.com | ⏳ Deploy |
| **Database** | Internal (managed by Render) | ⏳ Deploy |
| **GitHub Repo** | https://github.com/rajratanpcu/KTA | ✅ Live |

---

## ⚠️ Important Notes

### Render Free Tier Limitations

- **Backend spins down after 15 minutes of inactivity**
- First request after sleep takes 30-50 seconds (cold start)
- This is normal for free tier
- Consider upgrading to paid plan for production use

### Database

- Free tier PostgreSQL has 90-day data retention
- Automatic backups not included in free tier
- Consider upgrading for production data

### Frontend

- Vercel free tier is always active
- No cold starts
- Perfect for production

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Backend health check returns `{"status":"UP"}`  
✅ Frontend loads without errors  
✅ Login works with admin credentials  
✅ API calls work (create product, etc.)  
✅ Data persists after refresh  
✅ No CORS errors in browser console  

---

## 🆘 Troubleshooting

### Backend Won't Start

1. Check Render logs for errors
2. Verify all environment variables are set
3. Check database connection string
4. Ensure Flyway migrations ran successfully

### Frontend Can't Connect

1. Verify `VITE_API_BASE_URL` is set correctly
2. Check CORS settings in backend
3. Verify backend is running (health check)
4. Check browser console for errors

### Database Connection Failed

1. Verify database is running
2. Check connection string format
3. Ensure database user has permissions
4. Check if database password is correct

### CORS Errors

1. Verify CORS_ALLOWED_ORIGINS includes your Vercel URL
2. No trailing slash in URLs
3. Use exact match (https, not http)
4. Restart backend after CORS changes

---

## 📞 Next Steps After Deployment

1. **Test all features thoroughly**
2. **Add more users** (POST to /api/users)
3. **Configure automated backups** (upgrade plan)
4. **Set up monitoring** (Render provides basic monitoring)
5. **Custom domain** (optional, available in Render/Vercel)

---

## 🔒 Security Recommendations

Before sharing with others:

1. **Change admin password** to a strong one
2. **Set up proper authentication** (JWT)
3. **Enable HTTPS only** (already default on Render/Vercel)
4. **Review database access** (Render internal network only)
5. **Set up rate limiting** (prevent abuse)

---

**🚀 Ready to deploy? Start with Step 1 above!**
