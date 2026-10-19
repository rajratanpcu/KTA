# KTA ERP — Production Architecture & Readiness Audit
**Document Version:** 1.0.0  
**Date:** October 2026  
**Auditor:** Senior QA & DevOps Security Engineering Team  
**Audit Status:** AUDIT COMPLETED — NOT PRODUCTION READY (Pre-Hardening & Deployment Staging)

---

## 1. Executive Summary

This audit assesses the technical maturity, security posture, automated testing coverage, and deployment readiness of the **KTA ERP** repository (built for a retail and wholesale distribution enterprise with 6+ godowns and 2–5 concurrent users).

### Key Findings
- **Frontend Architecture:** Modern, clean React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui application. Live-connected with TanStack Query v5 and Axios with graceful fallback to demo datasets.
- **Backend Architecture:** Spring Boot 3.1.5 (Java 17) modular monolith with PostgreSQL 15, Flyway versioned migrations (V1, V2, V3), JPA entities, Jakarta validation, and custom repositories.
- **Critical Strengths:** Precise financial/quantity modeling (`DECIMAL(15, 2)` for currency, `DECIMAL(15, 3)` for stock quantities); strict separation of concerns; automated database trigger for bill balance recalculation.
- **Critical Gaps Pre-Audit:**
  1. *Security:* Basic authentication enabled with placeholder in-memory credentials; JWT filter and role-based route guards not active; CORS currently defaults to `localhost:5173`.
  2. *Testing:* Zero automated unit, slice, or integration tests in `backend/src/test/java`.
  3. *AI/OCR & File Uploads:* Controller endpoint for multipart document uploads missing; OCR parsing pipeline stubbed in data mocks without backend OCR provider connection.
  4. *CI/CD & Cloud Hosting:* No GitHub Actions workflows; missing production-ready container/manifest configurations for Render and Vercel.

---

## 2. Component-by-Component Assessment

### 2.1 Frontend (`/frontend`)
- **Framework & Build:** React 18.2.0, TypeScript 5.2.2, Vite 5.0.0.
- **State & Data Fetching:** TanStack React Query v5 (`@tanstack/react-query`) with 5-minute stale-time caching.
- **UI Components:** Tailwind CSS 3.3.5, Lucide React icons, Radix UI primitives.
- **API Client:** Axios instance in `src/lib/api-client.ts` with request interceptor for `Authorization: Bearer <token>` and `X-User-Id`, plus uniform response error unwrapping.
- **Working Modules:**
  - Dashboard & Analytics (Metrics, recent transactions, stock alerts).
  - Products Master (CRUD, SKU generation, reorder levels).
  - Godowns/Warehouses (6 locations, capacities, manager contacts).
  - Inventory (Dual-mode: Stock Balances & Movement audit logs).
  - Transport Bills (Scanning review UI, payments, transporter ledgers, balance breakdown).
  - Suppliers & Customers (Ledger records, balance tracking).
  - Sales & POS / Purchases (UI prototypes wired for live API integration).

### 2.2 Backend (`/backend`)
- **Runtime & Framework:** Java 17, Spring Boot 3.1.5.
- **Dependencies (`pom.xml`):**
  - `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`.
  - `postgresql` runtime driver, `flyway-core` 9.x.
  - `lombok` for boilerplate reduction.
  - Test scope: `spring-boot-starter-test`, `spring-security-test`.
- **Database Schema & Migrations:**
  - `V1__initial_schema.sql`: Core users, units, categories, products, godowns, suppliers, customers.
  - `V2__transport_bills_schema.sql`: Transporters, scanned_documents, transport_bills, items, payments, allocations, audit triggers.
  - `V3__stock_management_schema.sql`: Stock balances, stock movements, stock transfers, transfer items.
- **Database Constraints & Precision:**
  - Financial numbers: `DECIMAL(15, 2)` throughout.
  - Weights & Stock quantities: `DECIMAL(15, 3)` throughout.
  - Database-level trigger `update_transport_bill_balance` guarantees ledger balance integrity even with concurrent payments.

---

## 3. Security & Reliability Risk Assessment

| Risk Domain | Current State | Risk Level | Required Remediation |
|---|---|---|---|
| **Authentication** | Spring HTTP Basic Auth (`admin`/`admin123`) | **HIGH** | Implement stateless JWT token authentication with BCrypt hashing and secure secret handling. |
| **Authorization** | `anyRequest().permitAll()` after `/api/**` authenticated | **MEDIUM** | Role-based permissions (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_STAFF`) on sensitive financial and stock operations. |
| **CORS Configuration** | Hardcoded to `http://localhost:5173` | **MEDIUM** | Parameterize CORS allowed origins via environment variable `CORS_ALLOWED_ORIGINS`. |
| **Secret Exposure** | Secrets in `.env.development` and defaults in `application.properties` | **MEDIUM** | Remove secrets from tracked files; enforce `.env.example` templates; use provider secret vaults. |
| **Document Uploads** | No multipart document controller implemented | **HIGH** | Implement secure upload endpoint with file type (MIME), size (max 10MB), and extension validation. |
| **Database Transactions**| Standard `@Transactional` on services | **LOW** | Verified properly configured on `StockService`, `TransportBillService`, and `TransportPaymentService`. |

---

## 4. Recommended Free-Tier Hosting Architecture

```
                       +-----------------------------+
                       |   Client Browser / Mobile   |
                       +--------------+--------------+
                                      |
                       +--------------v--------------+
                       |   Vercel (Free Tier)        |
                       |   - React 18 SPA            |
                       |   - Global CDN Edge Network |
                       |   - HTTPS & Asset Caching   |
                       +--------------+--------------+
                                      | HTTPS REST API
                       +--------------v--------------+
                       |   Render (Free Tier)        |
                       |   - Spring Boot 3 Web API   |
                       |   - Docker Container        |
                       |   - Health Checks /actuator |
                       +------+---------------+------+
                              |               |
       +----------------------v----+     +----v------------------------+
       | Neon / Supabase (Free)    |     | Cloudinary / R2 (Free Tier) |
       | - PostgreSQL 15 Managed   |     | - Scanned Bill PDF/Images   |
       | - Flyway Migrations       |     | - Private Access URLs       |
       | - Automated SSL/TLS       |     | - Metadata stored in PG     |
       +---------------------------+     +-----------------------------+
```

### Free-Tier Nuances & Operational Constraints
1. **Render Free Web Service:**
   - Spins down after 15 minutes of inactivity. Initial request takes 30–50s to wake up (cold start).
   - Documented in runbooks; frontend includes loading states and timeouts.
2. **Neon / Supabase Free Database:**
   - Active compute with generous free storage (0.5GB–1GB) suitable for ERP data (>100,000 transactions).
   - TLS connection enforced (`sslmode=require`).
3. **Vercel Free Frontend:**
   - 100GB bandwidth/month, instant global deploys, zero cold-starts.

---

## 5. Audit Conclusion

The KTA ERP codebase exhibits high software engineering hygiene, strict relational domain modeling, and well-designed UI/UX flows. Prior to entering production, automated test suites (Phase 2), security hardening (Phase 3), and CI/CD pipelines (Phase 4/5) must be established.
