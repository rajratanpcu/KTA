# Render Deployment Configuration
**Generated:** 2026-10-19  
**Repository:** https://github.com/rajratanpcu/KTA  
**Frontend Live:** https://kta2.vercel.app/login  
**Database:** kta-erp-postgres (ACTIVE on Render)

---

## Option 1: One-Click Blueprint Deploy (RECOMMENDED)

Click this URL to deploy using the automated blueprint:

**https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA**

This will:
- Read `render.yaml` from your repository
- Create the `kta-erp-backend` web service
- Automatically link it to your existing `kta-erp-postgres` database
- Configure environment variables

### Environment Variables to Set During Blueprint Deploy

When the blueprint form opens, set these additional variables:

| Key | Value | Notes |
|-----|-------|-------|
| `CORS_ALLOWED_ORIGINS` | `https://kta2.vercel.app` | **REQUIRED** |
| `ADMIN_USERNAME` | `admin` | **REQUIRED** |
| `ADMIN_PASSWORD` | `AdminPassword123!` | **REQUIRED** (12+ characters) |

---

## Option 2: Manual Web Service Creation

If you're on the "New Web Service" form already:

### Basic Settings
- **Source Code:** `rajratanpcu/KTA`
- **Name:** `kta-backend`
- **Branch:** `main`
- **Runtime:** `Docker`

### Docker Configuration
- **Root Directory:** (leave blank)
- **Dockerfile Path:** `./backend/Dockerfile`
- **Docker Build Context Directory:** `./backend`

### Instance & Health
- **Instance Type:** **Free** ($0/month)
- **Health Check Path:** `/actuator/health`

### Environment Variables

#### Database Connection (from kta-erp-postgres)
Go to your `kta-erp-postgres` database page and copy:

| Key | Value Source |
|-----|--------------|
| `SPRING_DATASOURCE_URL` | Copy **Internal Database URL** and prefix with `jdbc:` (Example: `jdbc:postgresql://dpg-ct8iu0pu0jms73991k5g-a:5432/kta_erp`) |
| `SPRING_DATASOURCE_USERNAME` | Copy **Username** from database page |
| `SPRING_DATASOURCE_PASSWORD` | Copy **Password** from database page |

#### Application Configuration
| Key | Value |
|-----|-------|
| `PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_MAX_POOL_SIZE` | `5` |
| `DB_MIN_IDLE` | `2` |

#### Security & Administrator
| Key | Value | Notes |
|-----|-------|-------|
| `ADMIN_USERNAME` | `admin` | |
| `ADMIN_PASSWORD` | `AdminPassword123!` | Must be 12+ characters |
| `CORS_ALLOWED_ORIGINS` | `https://kta2.vercel.app` | Exact frontend URL |

#### File Storage
| Key | Value |
|-----|-------|
| `UPLOAD_DIR` | `/tmp/kta-uploads` |

---

## After Backend Deploys

### 1. Get Backend URL
Once the service shows **Live**, copy your backend URL:
- Example: `https://kta-backend-xxxx.onrender.com`

### 2. Update Vercel Frontend
1. Go to https://vercel.com/dashboard
2. Open your `kta2` project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_BASE_URL` to your Render backend URL
5. Go to **Deployments** tab
6. Click **⋮** on the latest deployment → **Redeploy**

---

## Expected Build Output

```
==> Cloning from https://github.com/rajratanpcu/KTA...
==> Building Docker image...
[+] Building 180.3s (15/15) FINISHED
 => [build 1/6] FROM docker.io/library/maven:3.9-eclipse-temurin-17-alpine
 => [build 2/6] WORKDIR /app
 => [build 3/6] COPY pom.xml .
 => [build 4/6] RUN mvn dependency:go-offline -B
 => [build 5/6] COPY src ./src
 => [build 6/6] RUN mvn clean package -B
 => [stage-1 1/3] FROM docker.io/library/eclipse-temurin:17-jre-alpine
 => [stage-1 2/3] WORKDIR /app
 => [stage-1 3/3] COPY --from=build /app/target/kta-erp-1.0.0.jar app.jar
==> Starting service with 'java -jar app.jar'...

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.5)

INFO  c.k.erp.KtaErpApplication - Starting KtaErpApplication
INFO  o.f.c.i.d.base.BaseDatabaseType - Database: jdbc:postgresql://dpg-xxx-a:5432/kta_erp
INFO  o.f.core.internal.command.DbValidate - Successfully validated 6 migrations
INFO  o.f.core.internal.command.DbMigrate - Current version of schema "public": 6
INFO  o.s.b.w.embedded.tomcat.TomcatWebServer - Tomcat started on port(s): 8080 (http)
INFO  c.k.erp.KtaErpApplication - Started KtaErpApplication in 12.456 seconds
```

---

## Deployment URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://kta2.vercel.app | ✅ LIVE |
| Backend | (pending deployment) | ⏳ |
| Database | kta-erp-postgres (internal) | ✅ ACTIVE |

---

## Next Steps After Deployment

1. ✅ Backend deploys and shows **Live** status
2. ✅ Copy backend URL
3. ✅ Update `VITE_API_BASE_URL` in Vercel
4. ✅ Redeploy frontend
5. ✅ Test login at https://kta2.vercel.app/login
6. ✅ Run smoke tests

---

## Troubleshooting

### Build Fails with "pom.xml not found"
- Check **Docker Build Context Directory** is set to `./backend`

### Service Crashes with "Connection refused"
- Verify database environment variables are correct
- Check **Internal Database URL** includes `-a` suffix (internal endpoint)

### CORS Errors in Browser
- Verify `CORS_ALLOWED_ORIGINS=https://kta2.vercel.app` (no trailing slash)
- Check backend logs for CORS configuration

### "Password must be at least 12 characters"
- Check `ADMIN_PASSWORD` is 12+ characters in environment variables
