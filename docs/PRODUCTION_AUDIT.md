# KTA ERP — Production Architecture & Readiness Audit
**Document Version:** 1.0.0  
**Date:** October 2026  
**Auditor:** Senior QA & DevOps Security Engineering Team  
**Audit Status:** AUDIT COMPLETED — NOT PRODUCTION READY (Security hardening in progress)

---

## 1. Executive Summary

This audit assesses the technical maturity, security posture, automated testing coverage, and deployment readiness of the **KTA ERP** repository (built for a retail and wholesale distribution enterprise with 6+ godowns and 2–5 concurrent users).

### Key Findings
- **Frontend Architecture:** React 18 + TypeScript + Vite + Tailwind CSS application. Live-connected with TanStack Query v5 and a native fetch client with graceful fallback to demo datasets.
- **Backend Architecture:** Spring Boot 3.1.5 (Java 25 LTS) modular monolith with PostgreSQL 15, Flyway versioned migrations (V1, V2, V3), JPA entities, Jakarta validation, and custom repositories.
- **Critical Strengths:** Precise financial/quantity modeling (`DECIMAL(15, 2)` for currency, `DECIMAL(15, 3)` for stock quantities); strict separation of concerns; automated database trigger for bill balance recalculation.
- **Current Critical Gaps:**
  1. *Security:* Database-backed BCrypt plus HTTP Basic, a minimal frontend login, centralized role gates for API mutations, and environment-based administrator provisioning are configured. Finer-grained method authorization remains incomplete.
  2. *Testing:* Frontend typecheck/lint/build pass locally. Transport tests and DTO contracts were reconciled, but Maven could not run because Maven is unavailable in the current Windows environment; backend execution remains unverified here.
  3. *AI/OCR & File Uploads:* Multipart upload exists with MIME/size checks, but OCR integration and private persistent object storage are not implemented. Render local storage is ephemeral.
  4. *Deployment:* CI configuration exists and local frontend/backend checks pass. No live deployment URL has been verified, and persistent production document storage is not configured.

---

## 2. Component-by-Component Assessment

### 2.1 Frontend (`/frontend`)
- **Framework & Build:** React 18.2.0, TypeScript 5.2.2, Vite 5.0.0.
- **State & Data Fetching:** TanStack React Query v5 (`@tanstack/react-query`) with 5-minute stale-time caching.
- **UI Components:** Tailwind CSS 3.3.5, Lucide React icons, Radix UI primitives.
- **API Client:** Native fetch client in `src/lib/api-client.ts`; it sends session-scoped HTTP Basic credentials after the frontend login succeeds and clears them on HTTP 401.
- **Working Modules:**
  - Dashboard & Analytics (Metrics, recent transactions, stock alerts).
  - Products Master (CRUD, SKU generation, reorder levels).
  - Godowns/Warehouses (6 locations, capacities, manager contacts).
  - Inventory (Dual-mode: Stock Balances & Movement audit logs).
  - Transport Bills (Scanning review UI, payments, transporter ledgers, balance breakdown).
  - Suppliers & Customers (Ledger records, balance tracking).
  - Sales & POS / Purchases (UI prototypes wired for live API integration).

### 2.2 Backend (`/backend`)
- **Runtime & Framework:** Java 25 LTS, Spring Boot 3.1.5.
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
| **Authentication** | Database-backed BCrypt users with HTTP Basic; no frontend login route | **HIGH** | Add a deliberate login/session or JWT contract and rotate the seeded development admin credential before deployment. |
| **Authorization** | API authentication required; document downloads enforce owner/admin/manager checks | **HIGH** | Add role checks to financial and stock mutation endpoints and remove reliance on client identity headers. |
| **CORS Configuration** | Explicit origins from `CORS_ALLOWED_ORIGINS`; wildcard is rejected | **MEDIUM** | Set only the exact deployed frontend origin in the provider environment. |
| **Secret Exposure** | Application and Compose password fallbacks removed; smoke test credential removed | **MEDIUM** | Rotate any previously exposed credentials and keep provider secrets outside Git. |
| **Document Uploads** | Multipart controller validates MIME, extension, size, ownership, and normalized paths | **HIGH** | Move permanent files to private object storage or persistent volume and add content signature scanning. |
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

The KTA ERP has a useful modular foundation, but it is **Not Production Ready**. Blocking items are secure administrator provisioning, finer-grained authorization coverage, backend test execution, durable private document storage, OCR failure handling, and verification against real deployed URLs.
