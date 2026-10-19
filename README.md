# Deploy to Render & Vercel
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frajratanpcu%2FKTA&root-directory=frontend)

---

# KTA ERP - Enterprise Distribution System
**Retail & Wholesale Distribution Management Platform**

A production-grade ERP system built for multi-godown wholesale and retail distribution enterprises, supporting real-time inventory balances, stock movements, transporter billing, and OCR-assisted bill processing.

## Live Deployment Links (1-Click)
- **Render Backend + Managed PostgreSQL:** Click the **Deploy to Render** button above. It uses `render.yaml` to provision the managed PostgreSQL service, wire database credentials to the Spring Boot API, run all Flyway migrations, and start the backend. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `CORS_ALLOWED_ORIGINS` as environment variables before shared use.
- **Vercel Frontend:** Click the **Deploy with Vercel** button above. It automatically clones the frontend, configures the Vite build, SPA routing, and security headers. Set `VITE_API_BASE_URL` to your Render backend URL.

---

## Technical Stack
- **Frontend:** React 18, TypeScript 5, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5, native fetch API client with error handling.
- **Backend:** Java 17, Spring Boot 3.1.5, Spring Data JPA, Spring Security, Flyway DB Migrations, Jakarta Validation.
- **Database:** PostgreSQL 15 with automated balance calculation triggers and `DECIMAL(15, 2)` financial and `DECIMAL(15, 3)` inventory precision.
- **DevOps:** GitHub Actions CI/CD (`.github/workflows/ci.yml`), Render native Java buildpack (`render.yaml`), Vercel SPA configuration (`frontend/vercel.json`).

---

## Development

### Push Changes to GitHub
Double-click `push_to_github.bat` or run:
```bash
git push -u origin main
```

### Backend Development
```bash
cd backend
mvn clean package
java -jar target/kta-erp-1.0.0.jar
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

---

## Documentation Index
- [Production Architecture & Readiness Audit](docs/PRODUCTION_AUDIT.md)
- [Automated Testing Report](docs/TEST_REPORT.md)
- [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Environment Variables Reference](docs/ENVIRONMENT_VARIABLES.md)
- [Database Backup & Recovery Runbook](docs/BACKUP_AND_RECOVERY.md)
- [Transport Bills Module Specification](docs/TRANSPORT_BILLS_MODULE.md)
- [Final Production & Deployment Status](docs/FINAL_DEPLOYMENT_REPORT.md)
