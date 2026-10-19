# KTA ERP — Production Deployment Guide
**Document Version:** 1.0.0  
**Target Architecture:** Vercel (Frontend) + Render (Backend) + Neon / Supabase (Managed PostgreSQL)  
**Free Tier Suitability:** Verified & Designed for Free-Tier Operational Limits

---

## 1. Prerequisites & Free Tier Service Accounts
1. **GitHub:** Repository hosting the KTA ERP project.
2. **Neon.tech or Supabase:** Free managed PostgreSQL 15 database instance.
3. **Render.com:** Free Web Service hosting Dockerized Spring Boot 3 backend.
4. **Vercel.com:** Free Frontend hosting for the React 18 / Vite SPA.

---

## 2. Step 1: Provision Free Managed PostgreSQL (Neon / Supabase)
1. Sign in to **Neon** (`https://neon.tech`) and click **Create Project**.
2. Select PostgreSQL 15 and choose an AWS region closest to your users (e.g., `ap-southeast-1` or `eu-central-1`).
3. Name the database `kta_erp`.
4. Copy the pooled connection string provided. It will look like:
   `postgres://neondb_owner:PASSWORD@ep-sample-123456.us-east-2.aws.neon.tech/kta_erp?sslmode=require`
5. Note: Spring Boot requires the standard JDBC format:
   `jdbc:postgresql://ep-sample-123456.us-east-2.aws.neon.tech/kta_erp?sslmode=require`

---

## 3. Step 2: Deploy Spring Boot Backend to Render
1. Sign in to **Render** (`https://render.com`) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. In the configuration page:
   - **Name:** `kta-erp-backend`
   - **Region:** Same or close to your database region (e.g., Oregon or Frankfurt).
   - **Branch:** `master` or `main`
   - **Root Directory:** Leave empty (or `.` if using root `render.yaml`).
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<neon-host>/kta_erp?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `<neon-username>`
   - `SPRING_DATASOURCE_PASSWORD` = `<neon-password>`
   - `ADMIN_PASSWORD` = `<choose-strong-password>`
   - `CORS_ALLOWED_ORIGINS` = `https://kta-erp.vercel.app,http://localhost:5173`
   - `DB_MAX_POOL_SIZE` = `5`
5. Click **Create Web Service**.
6. Render will build the Docker container and start Spring Boot.
7. **Verification:** Test health check by visiting `https://kta-erp-backend.onrender.com/actuator/health`. Expected response: `{"status":"UP"}`.

*Operational Note on Render Free Tier:* Free services spin down after 15 minutes of inactivity. When a new request arrives, it takes 30–50 seconds to cold-start. This is normal on the free tier.

---

## 4. Step 3: Deploy React Frontend to Vercel
1. Sign in to **Vercel** (`https://vercel.com`) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure Project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and set to `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://kta-erp-backend.onrender.com` (Your Render backend URL without trailing slash)
5. Click **Deploy**.
6. Vercel will install dependencies, run the production build, and generate a live URL (e.g., `https://kta-erp.vercel.app`).
7. Update Render's `CORS_ALLOWED_ORIGINS` with this exact Vercel URL to allow live browser requests.

---

## 5. Step 4: Verification & Smoke Testing
Run the automated smoke testing script against your deployed URLs:
```bash
./scripts/smoke_test.sh https://kta-erp-backend.onrender.com https://kta-erp.vercel.app
```
Confirm:
1. Health endpoint returns HTTP 200 `UP`.
2. Master categories and products return valid JSON.
3. Stock balance and transport bills load seamlessly on the Vercel frontend.
