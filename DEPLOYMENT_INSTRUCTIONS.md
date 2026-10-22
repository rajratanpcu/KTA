# KTA ERP Deployment Instructions

## ✅ Code Pushed to GitHub
Repository: https://github.com/rajratanpcu/KTA

## 🚀 Deployment Steps

### 1. Deploy Backend to Render (One-Click)

**Option A: Using Render Blueprint (Automated)**
1. Go to: https://render.com
2. Sign in with your GitHub account
3. Click: **New +** → **Blueprint**
4. Connect repository: `rajratanpcu/KTA`
5. Render will automatically:
   - Create PostgreSQL database
   - Build and deploy Spring Boot backend
   - Link database to backend

**Option B: Manual Deploy**
1. Go to: https://render.com
2. Click **New +** → **PostgreSQL**
   - Name: `kta-erp-postgres`
   - Database: `kta_erp`
   - Plan: Free
   - Click Create Database
3. Copy the **Internal Database URL**
4. Click **New +** → **Web Service**
   - Connect repository: `rajratanpcu/KTA`
   - Name: `kta-erp-backend`
   - Runtime: Docker
   - Dockerfile Path: `./backend/Dockerfile`
   - Docker Context: `./backend`
   - Plan: Free
5. Add Environment Variables:
   ```
   SPRING_DATASOURCE_URL=<paste internal database URL>
   SPRING_DATASOURCE_USERNAME=<database username>
   SPRING_DATASOURCE_PASSWORD=<database password>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@123456789
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   DB_MAX_POOL_SIZE=5
   DB_MIN_IDLE=2
   PORT=8080
   ```
6. Click **Create Web Service**

Wait 5-10 minutes for deployment. You'll get a URL like:
`https://kta-erp-backend.onrender.com`

### 2. Deploy Frontend to Vercel

1. Go to: https://vercel.com
2. Sign in with your GitHub account
3. Click **Add New...** → **Project**
4. Import repository: `rajratanpcu/KTA`
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://kta-erp-backend.onrender.com
   ```
   (Replace with your actual Render backend URL)
7. Click **Deploy**

Wait 2-3 minutes. You'll get a URL like:
`https://kta-erp.vercel.app`

### 3. Update CORS Settings

Once Vercel gives you the frontend URL:
1. Go back to Render dashboard
2. Open your backend service
3. Update Environment Variable:
   ```
   CORS_ALLOWED_ORIGINS=https://kta-erp.vercel.app,http://localhost:5173
   ```
4. Save changes (backend will redeploy)

### 4. Test Your Deployment

1. Open your Vercel URL: `https://kta-erp.vercel.app`
2. Login with any credentials (demo mode)
3. For backend authentication (when ready):
   - Username: `admin`
   - Password: `Admin@123456789`

## 📊 Deployment Status

- ✅ Code pushed to GitHub
- ⏳ Backend deployment (Render) - Pending
- ⏳ Frontend deployment (Vercel) - Pending
- ⏳ CORS configuration - Pending

## 🔗 Quick Deploy Links

**One-Click Deploy to Render:**
https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA

**One-Click Deploy to Vercel:**
https://vercel.com/new/clone?repository-url=https://github.com/rajratanpcu/KTA&root-directory=frontend

## 📝 Notes

- Render free tier: Backend sleeps after 15 minutes of inactivity (30-50s cold start)
- Vercel free tier: Always active, instant response
- Database: PostgreSQL on Render (free tier, persistent storage)

## 🆘 Troubleshooting

**Backend deployment fails:**
- Check build logs in Render dashboard
- Verify Java 17+ in Dockerfile

**Frontend can't connect to backend:**
- Check CORS_ALLOWED_ORIGINS includes your Vercel URL
- Verify VITE_API_BASE_URL points to correct Render URL
- Check backend health: `https://your-backend.onrender.com/actuator/health`

**Database connection issues:**
- Verify database credentials in environment variables
- Check database is running in Render dashboard
