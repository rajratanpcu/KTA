# KTA ERP — Environment Variables Reference Guide
**Document Version:** 1.0.0  
**Updated:** October 2026

This document lists every environment variable consumed by the KTA ERP backend and frontend, including their defaults, security implications, and hosting locations.

---

## 1. Backend Variables (Spring Boot)

| Variable Name | Required? | Default (Local) | Production Example | Description |
|---|---|---|---|---|
| `SPRING_DATASOURCE_URL` | **Yes** | `jdbc:postgresql://localhost:5432/kta_erp` | `jdbc:postgresql://ep-xyz.us-east-2.aws.neon.tech/kta_erp?sslmode=require` | JDBC connection string to managed PostgreSQL. Must specify `sslmode=require` on Neon/Supabase. |
| `SPRING_DATASOURCE_USERNAME` | **Yes** | `kta` | `neondb_owner` | Database master username. |
| `SPRING_DATASOURCE_PASSWORD` | **Yes** | *(no default)* | *(Secret Vault)* | Strong password for database access. Never commit to Git. |
| `DB_PASSWORD` | Local only | *(no default)* | Not used | Password consumed by Docker Compose for the local PostgreSQL container. |
| `DB_MAX_POOL_SIZE` | No | `5` | `5` | Maximum active database connections in HikariCP. Kept small for free-tier connection limits. |
| `DB_MIN_IDLE` | No | `2` | `2` | Minimum idle connections kept warm. |
| `PORT` | No | `8080` | `8080` (auto-assigned by Render) | Listening HTTP port for backend service. |
| `CORS_ALLOWED_ORIGINS` | **Yes** | `http://localhost:5173,http://localhost:3000` | `https://kta-erp.vercel.app` | Comma-separated list of browser origins permitted to issue cross-origin API calls. |
| `UPLOAD_DIR` | No | `/tmp/kta-uploads` | Persistent mounted volume or object storage integration | Filesystem path where scanned bill PDFs and images are temporarily persisted. Render's local filesystem is ephemeral. |

---

## 2. Frontend Variables (Vite & React)

| Variable Name | Required? | Default (Local) | Production Example | Description |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8080` | `https://kta-erp-backend.onrender.com` | Base URL of the Spring Boot REST API. Consumed by the native fetch client in `src/lib/api-client.ts`. |

---

## 3. Security & Secret Hygiene Checklist
1. **Never commit `.env` files:** The `.gitignore` at the repository root explicitly ignores `.env`, `.env.local`, and `*.env`.
2. **Inject Secrets via Cloud Dashboards:**
   - **Render Dashboard:** Navigate to *Environment* -> *Add Secret* for database credentials.
   - **Vercel Dashboard:** Navigate to *Settings* -> *Environment Variables* to set `VITE_API_BASE_URL`.
3. **Frontend Leak Prevention:** Only variables prefixed with `VITE_` are baked into frontend JavaScript bundles. Never place backend secrets or database credentials in `VITE_` variables.
