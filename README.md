# Deploy to Render & Vercel
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frajratanpcu%2FKTA&root-directory=frontend)

---

# KTA ERP - Enterprise Distribution System
**Retail & Wholesale Distribution Management Platform**

A production-grade ERP system built for multi-godown wholesale and retail distribution enterprises, supporting real-time inventory balances, stock movements, transporter billing, and OCR-assisted bill processing.

## Live Deployment Links (1-Click)
- **Render Backend + Managed PostgreSQL:** Click the **Deploy to Render** button above. It uses `render.yaml` to automatically provision a free PostgreSQL 15 database, wire the database credentials directly to the Spring Boot 3 API container, run all Flyway migrations (V1, V2, V3), and spin up the live backend with zero manual configuration.
- **Vercel Frontend:** Click the **Deploy with Vercel** button above. It automatically clones the frontend, configures the Vite build, SPA routing, and security headers. Set `VITE_API_BASE_URL` to your Render backend URL.

---

## Technical Stack
- **Frontend:** React 18, TypeScript 5, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5, native fetch API client with error handling.
- **Backend:** Java 17, Spring Boot 3.1.5, Spring Data JPA, Spring Security, Flyway DB Migrations, Jakarta Validation.
- **Database:** PostgreSQL 15 with automated balance calculation triggers and `DECIMAL(15, 2)` financial and `DECIMAL(15, 3)` inventory precision.
- **DevOps:** Multi-stage Dockerfiles, Docker Compose, GitHub Actions CI/CD (`.github/workflows/ci.yml`), Render Blueprint (`render.yaml`), Vercel SPA configuration (`frontend/vercel.json`).

---

## Local Development & Docker

### Option 1: One-Click Local Production Launch (Docker Compose)
Double-click `start_local_production.bat` or run:
```bash
docker-compose up --build -d
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- Health Endpoint: `http://localhost:8080/actuator/health`

### Option 2: Push Changes to GitHub
Double-click `push_to_github.bat` or run:
```bash
git push -u origin main
```

---

## Documentation Index
- [Production Architecture & Readiness Audit](docs/PRODUCTION_AUDIT.md)
- [Automated Testing Report](docs/TEST_REPORT.md)
- [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Environment Variables Reference](docs/ENVIRONMENT_VARIABLES.md)
- [Database Backup & Recovery Runbook](docs/BACKUP_AND_RECOVERY.md)
- [Transport Bills Module Specification](docs/TRANSPORT_BILLS_MODULE.md)
