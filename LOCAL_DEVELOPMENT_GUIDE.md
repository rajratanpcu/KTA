# KTA ERP - Local Development Setup (No Docker)

**Date:** 2026-10-19  
**Goal:** Run the full stack locally on Windows without Docker

---

## Prerequisites

Before starting, you need:

1. **Java 17** - [Download OpenJDK 17](https://adoptium.net/)
2. **Maven 3.8+** - [Download Maven](https://maven.apache.org/download.cgi)
3. **PostgreSQL 15** - [Download PostgreSQL](https://www.postgresql.org/download/windows/)
4. **Node.js 18+** - [Download Node.js](https://nodejs.org/)

Check if installed:
```bash
java -version
mvn -version
psql --version
node -version
npm -version
```

---

## Step 1: Setup PostgreSQL Database (5 minutes)

### Option A: Using pgAdmin (GUI)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Right-click **Databases** → **Create** → **Database**
   - **Database name:** `kta_erp_local`
   - **Owner:** `postgres`
   - Click **Save**

3. Open **Query Tool** on `kta_erp_local` database
4. Run this SQL:
   ```sql
   CREATE USER kta_admin WITH PASSWORD 'kta_local_password';
   GRANT ALL PRIVILEGES ON DATABASE kta_erp_local TO kta_admin;
   GRANT ALL ON SCHEMA public TO kta_admin;
   ```

### Option B: Using Command Line

```bash
# Open Command Prompt as Administrator
psql -U postgres

# In psql prompt:
CREATE DATABASE kta_erp_local;
CREATE USER kta_admin WITH PASSWORD 'kta_local_password';
GRANT ALL PRIVILEGES ON DATABASE kta_erp_local TO kta_admin;
\c kta_erp_local
GRANT ALL ON SCHEMA public TO kta_admin;
\q
```

---

## Step 2: Configure Backend (2 minutes)

Create a local configuration file:

**File:** `backend/src/main/resources/application-local.properties`

```properties
# Database Connection (Local PostgreSQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/kta_erp_local
spring.datasource.username=kta_admin
spring.datasource.password=kta_local_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Flyway (database migrations)
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# Server Port
server.port=8080

# CORS (allow frontend)
cors.allowed.origins=http://localhost:5173

# Admin Account (for initial login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AdminPassword123!

# File Upload
upload.dir=${java.io.tmpdir}/kta-uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## Step 3: Run Backend (3 minutes)

Open **Command Prompt** in the `backend` folder:

```bash
cd C:\Users\Raj Ratan\Desktop\KTA\backend

# Clean and build
mvn clean package -DskipTests

# Run with local profile
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Expected Output:**
```
INFO c.k.erp.KtaErpApplication - Starting KtaErpApplication
INFO o.f.core.internal.command.DbMigrate - Successfully validated 6 migrations
INFO c.k.erp.config.AdminBootstrap - Admin account created successfully
INFO o.s.b.w.embedded.tomcat.TomcatWebServer - Tomcat started on port 8080
INFO c.k.erp.KtaErpApplication - Started KtaErpApplication in 15.2 seconds
```

**Test it:**
Open browser: `http://localhost:8080/actuator/health`  
Expected: `{"status":"UP"}`

---

## Step 4: Run Frontend (2 minutes)

Open **another Command Prompt** in the `frontend` folder:

```bash
cd C:\Users\Raj Ratan\Desktop\KTA\frontend

# Install dependencies (first time only)
npm install

# Create local environment file
echo VITE_API_BASE_URL=http://localhost:8080 > .env.local

# Start dev server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 5: Test the Application

1. Open browser: **http://localhost:5173/login**
2. Login with:
   - **Username:** `admin`
   - **Password:** `AdminPassword123!`
3. You should see the KTA ERP Dashboard

---

## Useful Commands

### Backend Commands
```bash
# Build without tests
mvn clean package -DskipTests

# Run with local profile
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Run tests
mvn test

# Clean build artifacts
mvn clean
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Commands
```bash
# Connect to local database
psql -U kta_admin -d kta_erp_local

# View all tables
\dt

# View users table
SELECT * FROM users;

# Exit psql
\q
```

---

## Troubleshooting

### Backend won't start

**Error:** "Connection refused" or "password authentication failed"
- Check PostgreSQL is running (Services → PostgreSQL)
- Verify database credentials in `application-local.properties`
- Test connection: `psql -U kta_admin -d kta_erp_local`

**Error:** "Port 8080 already in use"
- Change port in `application-local.properties`: `server.port=8081`
- Update frontend `.env.local`: `VITE_API_BASE_URL=http://localhost:8081`

**Error:** "Flyway migration failed"
- Drop and recreate database:
  ```sql
  DROP DATABASE kta_erp_local;
  CREATE DATABASE kta_erp_local;
  GRANT ALL PRIVILEGES ON DATABASE kta_erp_local TO kta_admin;
  ```

### Frontend won't start

**Error:** "ENOENT: no such file or directory"
- Run `npm install` first

**Error:** "Network error" when logging in
- Check backend is running: `http://localhost:8080/actuator/health`
- Verify `.env.local` has correct backend URL

**Error:** "CORS error" in browser console
- Add `http://localhost:5173` to `cors.allowed.origins` in `application-local.properties`
- Restart backend

### Admin login fails

**Check AdminBootstrap ran:**
- Look for "Admin account created successfully" in backend console
- If missing, verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are in `application-local.properties`

**Reset admin password:**
```sql
psql -U kta_admin -d kta_erp_local
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE username = 'admin';
-- This sets password to: password
```

---

## File Structure

```
C:\Users\Raj Ratan\Desktop\KTA\
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-local.properties (create this)
│   │   └── test/
│   ├── pom.xml
│   └── target/ (generated)
├── frontend/
│   ├── src/
│   ├── .env.local (create this)
│   ├── package.json
│   └── dist/ (generated)
└── README.md
```

---

## Development Workflow

1. **Make code changes** in your IDE
2. **Backend:** Maven auto-recompiles (or restart `mvn spring-boot:run`)
3. **Frontend:** Vite hot-reloads automatically
4. **Test changes** at http://localhost:5173
5. **Commit to git** when ready

---

## Stop Services

**Backend:** Press `Ctrl+C` in the backend terminal

**Frontend:** Press `Ctrl+C` in the frontend terminal

**PostgreSQL:** Keep running (or stop via Services if needed)

---

## Next Steps

Once local development is working:
- Make your code changes
- Test locally
- Push to GitHub: `git push origin main`
- Render automatically deploys to production

---

**Your local URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/actuator/health
- Database: localhost:5432/kta_erp_local
