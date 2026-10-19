# KTA ERP — Automated Testing Report
**Document Version:** 1.0.0  
**Execution Date:** October 2026  
**Test Suite:** Unit, Service Mockito, Static Typecheck, Production Build  
**Status:** PASSING LOCALLY — frontend and backend checks pass; live deployment remains unverified

> Corrected on 2026-10-19. This report counts only commands executed in the current workspace; earlier unverified pass claims are not treated as evidence.

---

## 1. Test Summary Overview

| Component | Framework / Runner | Total Tests | Passed | Failed | Skipped | Status |
|---|---|---|---|---|---|---|
| **Frontend TypeScript Typecheck** | `npm run typecheck` | Full codebase | PASS | 0 | 0 | **PASSED** |
| **Frontend ESLint** | `npm run lint` | Full codebase | PASS | 0 | 0 | **PASSED** |
| **Frontend Production Build** | `npm run build` | Vite production bundle | PASS | 0 | 0 | **PASSED (large chunk warning)** |
| **Frontend automated tests** | `npm test -- --run` | No `test` script exists | 0 | 0 | BLOCKED | **NOT CONFIGURED** |
| **Backend Maven tests** | Docker Java 17 / `mvn clean package` | 7 tests | 7 | 0 | 0 | **PASSED** |
| **Backend Maven package** | Docker Java 17 / `mvn clean package` | Backend artifact | PASS | 0 | 0 | **PASSED** |
| **Local backend smoke checks** | PowerShell HTTP probes | Health, auth barrier, core APIs | 6 | 0 | 0 | **PASSED** |

---

## 2. Test Execution Details

### 2.1 Frontend Static Analysis & Type Checking
- **Commands:** `npm run typecheck`, `npm run lint`, `npm run build`
- **Output:** Typecheck, lint, and build succeeded. The build reports a non-blocking large JavaScript chunk warning.
- **Areas Validated:**
  - Zero-dependency native fetch client (`api-client.ts`) replacing missing axios module with full TypeScript type safety and error wrapping.
  - Button primitive component usage across `TransportBills.tsx` resolving Radix UI `asChild` typing issues.
  - Strict type alignment across queries (`use-core-queries.ts`, `use-stock-queries.ts`, `use-transport-queries.ts`).

### 2.2 Backend Test Execution
- **Command:** `docker compose build backend` using `maven:3.9-eclipse-temurin-17-alpine`
- **Result:** 7 tests passed: application context (1), stock service (2), transport payments (3), and transport bills (1).
- **Migration verification:** Fresh PostgreSQL database applied V1, V2, V2.1, V3, V4, V5, and V6 successfully. V6 disables the known bootstrap account and startup provisions the configured administrator.

### 2.3 Previously Documented Backend Coverage (Unverified Here)
- **Multi-Bill Allocations:** Verifies a single payment can be proportionally allocated across multiple transport bills (`testCreatePaymentWithMultiBillAllocations`).
- **Over-Allocation Prevention:** Validates that allocation amounts cannot exceed total payment amount (`testFailWhenAllocationsExceedPaymentAmount`).
- **Payment Idempotency:** Validates duplicate payment numbers are rejected without corrupting balances (`testRejectDuplicatePaymentNumber`).

### 2.3 Backend Stock Management Tests (`StockServiceTest`)
- **Inward Stock Receipts:** Verifies purchase/receipt movements increment available stock in target godown with `DECIMAL(15, 3)` arithmetic (`testInwardStockMovementIncrementsBalance`).
- **Outward Stock Guards:** Verifies sales or outward transfers fail with `Insufficient available stock` when stock balance is below requested volume (`testOutwardStockMovementFailsOnInsufficientStock`).

### 2.4 Transport Bills & Inventory Isolation Tests (`TransportBillServiceTest`)
- **Bill Calculation:** Calculates freight, loading, unloading, GST addition, TDS deduction, and net balance due minus advances (`testCreateTransportBillCalculations`).
- **Inventory Non-Interference:** Strictly verifies that transport bills do not update or mutate warehouse stock quantities (`verifyNoInteractions(productRepository)`).

---

## 3. Remaining Testing Recommendations
- Add a Maven Wrapper for host-side reproducibility; Docker Java 17 currently provides the verified build path. Include Flyway checksum verification and role-based mutation authorization tests in future coverage.
- Frontend lint is now green; the build retains only a non-blocking large-chunk warning.
- Add frontend unit tests and Playwright coverage for authentication, document upload/download authorization, transport payments, and stock isolation.
- `npm audit --omit=dev --audit-level=high` reports two moderate React Router advisories; the suggested fix is a breaking React Router 7 upgrade and requires compatibility review.
