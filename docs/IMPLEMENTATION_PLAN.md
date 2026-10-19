# KTA ERP - Implementation Plan

## Overview

KTA ERP is a retail and wholesale management system built using an AI-assisted, iterative, phased approach. This document outlines the development roadmap from UI prototype through production deployment.

## Development Approach

- **AI-Assisted Development**: Using Claude Code for rapid prototyping and implementation
- **Phased Delivery**: Each phase delivers working functionality and stops for approval
- **Test-Driven**: Add tests at each phase, especially for critical business logic
- **Security-First**: Security and data integrity considerations built in from the start
- **Local-First**: Optimized for local deployment with secure remote access options

## Phases

### Phase 0: Repository Discovery and Planning ✅ COMPLETED
**Status**: Done
**Deliverables**:
- ✅ Project structure initialized
- ✅ Git repository set up
- ✅ Architecture documentation
- ✅ Implementation plan

### Phase 1: UI Prototype ✅ COMPLETED
**Status**: Done (awaiting approval)
**Duration**: Initial implementation complete
**Goal**: Demonstrate complete user experience with realistic demo data

**Completed Work**:
- ✅ React + TypeScript + Vite project setup
- ✅ Tailwind CSS and component system
- ✅ Responsive layout with sidebar navigation
- ✅ All 13 main screens implemented:
  - Dashboard with charts and metrics
  - Products with CRUD operations
  - Inventory with stock balances and movements
  - Godowns management
  - Stock Transfers with status workflow
  - Purchasing (placeholder with metrics)
  - Sales/POS interface (marked as simulated)
  - Transport tracking (placeholder)
  - Customers, Suppliers (placeholders)
  - Reports, Expenses (placeholders)
  - Settings
- ✅ Demo data module with realistic business data
- ✅ TypeScript types for all entities
- ✅ Accessible UI components (buttons, inputs, tables, dialogs, badges, cards)
- ✅ Search and filter functionality
- ✅ Modal forms with validation structure
- ✅ Loading, empty, and error states
- ✅ README and documentation

**Known Limitations**:
- All data is hardcoded (no persistence)
- Form submissions show prototype alerts
- Some screens are placeholders awaiting full implementation
- No authentication
- No actual API integration

**Next Steps**:
- Install dependencies and verify the app runs
- Run lint, typecheck, and build commands
- Fix any errors or warnings
- User approval before proceeding to Phase 2

---

### Phase 2: Backend Foundation (NOT STARTED)
**Goal**: Production-ready backend with core modules

**Scope**:
1. **Spring Boot Setup**
   - Java project structure (modular monolith)
   - PostgreSQL connection
   - Flyway migrations
   - Docker Compose for local development

2. **Authentication & Authorization**
   - Spring Security configuration
   - Password hashing (BCrypt)
   - Role-based access control (ADMIN, MANAGER, STAFF, VIEWER)
   - Session management with HttpOnly cookies
   - CSRF protection

3. **Core Domain APIs**
   - Products (create, read, update, list, search, filter)
   - Categories and Units
   - Godowns/Locations
   - Users and Roles

4. **API Standards**
   - RESTful conventions
   - Validated request/response DTOs
   - Consistent error responses
   - Pagination where appropriate
   - OpenAPI/Swagger documentation (dev only)

5. **Testing**
   - Unit tests for services
   - Integration tests for repositories
   - API endpoint tests
   - Validation tests

**Acceptance Criteria**:
- Backend starts successfully via Docker Compose
- Frontend can authenticate and call product/godown APIs
- All tests pass
- Database migrations apply cleanly from scratch
- No credentials in git

---

### Phase 3: Inventory Correctness and Stock Ledger (NOT STARTED)
**Goal**: Reliable, auditable inventory tracking

**Core Rules** (from prompt pack):
- Backend is source of truth
- Append-only stock movements (no silent edits)
- Posting and balance updates in single transaction
- Idempotency to prevent duplicate processing
- Negative stock disabled by default
- Precise decimal/numeric types (no floating point for money)
- Server-side validation and authorization

**Scope**:
1. **Stock Movement Ledger**
   - Movement types: PURCHASE_RECEIPT, SALE, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT, RETURN
   - Fields: product, quantity, source/destination godown, reference, user, timestamp
   - Append-only design

2. **Stock Balance Tracking**
   - Available, reserved, in-transit quantities per product-godown
   - Updated transactionally with movements

3. **Purchases**
   - Purchase orders (DRAFT, SENT, PARTIALLY_RECEIVED, RECEIVED, CANCELLED)
   - Goods receipt posting
   - Increase stock exactly once per receipt

4. **Transfers**
   - Transfer workflow: DRAFT → DISPATCHED → PARTIALLY_RECEIVED → RECEIVED
   - Dispatch reduces source stock, increases in-transit
   - Receipt increases destination stock, reduces in-transit
   - Support partial receipts per line
   - Prevent over-receipt

5. **Concurrency and Idempotency**
   - Optimistic locking or database-level concurrency controls
   - Idempotency keys for critical operations
   - Transaction rollback on any failure

6. **Testing** (Critical)
   - Purchase receipt posts stock exactly once
   - Transfer dispatch updates source and in-transit correctly
   - Destination stock unchanged until receipt
   - Partial receipt quantities correct
   - Duplicate API calls don't double-post
   - Concurrent operations don't oversell/double-receive
   - Unauthorized users rejected
   - Invalid state transitions rejected
   - Transaction rollback on failure

**Acceptance Criteria**:
- All inventory tests pass
- Manual testing of transfer workflow end-to-end
- Audit log shows who did what and when
- No negative stock unless explicitly configured
- Frontend integrates with real inventory APIs

---

### Phase 4: Sales and Operations (NOT STARTED)
**Goal**: Complete order-to-cash cycle

**Scope**:
1. **Sales/POS**
   - Create sale with line items
   - Reduce stock transactionally
   - Payment methods and status
   - Receipt generation

2. **Returns**
   - Linked return movements
   - Stock reversal

3. **Customers & Suppliers**
   - Master data management
   - Balance tracking
   - Transaction history

4. **Expenses**
   - Expense categories
   - Payment tracking
   - Attachment support

5. **Reports**
   - Sales, purchases, stock-on-hand
   - Stock movement report
   - Valuation report
   - Low stock report
   - Outstanding balances
   - CSV/PDF export

**Acceptance Criteria**:
- Sale reduces stock exactly once
- Return creates correct reversal movement
- Customer/supplier balances accurate
- Reports show correct data with filters
- Export works for all report types

---

### Phase 5: Transport and Automation (NOT STARTED)
**Goal**: Shipment tracking and workflow automation

**Scope**:
1. **Transport Management**
   - Transporters, vehicles, drivers
   - Shipments linked to transfers
   - Status tracking: DISPATCHED → IN_TRANSIT → DELIVERED
   - Delivery confirmation

2. **n8n Integration**
   - Low stock alerts
   - Transfer dispatch notifications
   - Daily/weekly summary reports
   - Scheduled tasks

3. **Import/Export**
   - CSV import for products, customers, suppliers
   - Validation and duplicate handling
   - Bulk export

**Important**: n8n is for notifications and workflows only, never the source of truth for inventory or financial data.

**Acceptance Criteria**:
- Shipment status updates work
- n8n workflows trigger correctly
- CSV import validates and handles duplicates
- No inventory mutations bypass Spring Boot

---

### Phase 6: Production Hardening and Deployment (NOT STARTED)
**Goal**: Production-ready system

**Scope**:
1. **Security Review**
   - Authentication and session management audit
   - Authorization checks on all endpoints
   - Input validation and SQL injection prevention
   - CSRF, CORS configuration
   - Secrets management (never in git)
   - Rate limiting and login throttling
   - Audit logging for sensitive actions

2. **Infrastructure**
   - PostgreSQL backup strategy
   - **Test restore procedure** (critical)
   - Health checks and monitoring
   - Structured logging
   - Error tracking

3. **Deployment**
   - Production Docker Compose or equivalent
   - Environment-based configuration
   - HTTPS enforcement
   - Private network/VPN for remote access (not direct internet exposure)
   - Migration strategy
   - Rollback plan

4. **Documentation**
   - User manual
   - API documentation
   - Deployment guide
   - Backup/restore procedures
   - Security best practices

5. **Testing**
   - User acceptance testing
   - Performance testing under expected load
   - Security testing
   - Disaster recovery drill

**Acceptance Criteria**:
- Security review document completed with all critical issues resolved
- Backup tested and restore verified in non-production environment
- Deployment guide followed successfully
- All tests pass
- User acceptance sign-off

---

## Technology Decisions

### Frontend
- **React + TypeScript**: Type safety and component reusability
- **Vite**: Fast development and build times
- **Tailwind CSS**: Rapid UI development with consistent design
- **React Router**: Standard routing solution
- **TanStack Query**: Server state management (Phase 2+)
- **React Hook Form + Zod**: Form handling and validation

### Backend
- **Java + Spring Boot**: Mature ecosystem, strong typing, enterprise support
- **Modular Monolith**: Simpler operations than microservices for 2-5 users
- **PostgreSQL**: Reliable ACID transactions, good JSON support
- **Flyway**: Versioned database migrations

### Infrastructure
- **Docker Compose**: Local development environment
- **n8n**: Workflow automation (notifications only)

### Deployment
- **Local-first**: Primary use case
- **Remote access**: VPN or private network with HTTPS, not direct internet exposure

---

## Key Decisions and Constraints

1. **Local-first with secure remote option**: Primary deployment is local network with VPN/private network for remote access
2. **Modular monolith over microservices**: Simpler to operate for small team
3. **Spring Boot as source of truth**: n8n never mutates inventory directly
4. **Append-only stock movements**: Audit trail and error correction via reversals
5. **Decimal types for money**: No floating point arithmetic
6. **Transaction safety**: Stock posting and balance updates in single transaction
7. **Idempotency**: Prevent duplicate processing
8. **Backup verification**: Not proven until restore is tested

---

## Current Status

**Phase 1 Complete - Awaiting Approval**

The UI prototype is complete with all major screens implemented. Next steps:
1. Verify the application runs successfully
2. Run quality checks (lint, typecheck, build)
3. User reviews and provides feedback
4. Upon approval, proceed to Phase 2 (Backend Foundation)

---

## Risk Management

### Technical Risks
- **Concurrent stock operations**: Mitigated by database transactions and locking
- **Network reliability**: Local-first design minimizes impact
- **Data loss**: Mitigated by backup/restore procedures

### Business Risks
- **Scope creep**: Phased approach with approval gates
- **Incorrect inventory**: Comprehensive testing and audit logging
- **Security vulnerabilities**: Security review before production

### Mitigation Strategies
- Incremental delivery with approval gates
- Automated testing at each phase
- Security best practices from Phase 2 onwards
- User acceptance testing before production

---

Last Updated: October 19, 2026
