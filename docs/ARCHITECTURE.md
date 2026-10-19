# KTA ERP - Architecture

## System Overview

KTA ERP is a retail and wholesale management system designed for businesses with multiple warehouses/godowns and a small team (2-5 users). The architecture prioritizes:

- **Data integrity** - Especially for inventory and financial transactions
- **Auditability** - Complete history of who did what and when
- **Local-first deployment** - Optimized for on-premises with secure remote access
- **Simplicity** - Appropriate for the scale (modular monolith, not microservices)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser(s)                        │
│              React SPA (TypeScript + Vite)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (remote) or HTTP (local)
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot Application                    │
│                    (Modular Monolith)                        │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐  │
│  │   Products   │  Inventory   │   Sales &    │  Users  │  │
│  │   Module     │   Module     │  Purchasing  │  Module │  │
│  └──────────────┴──────────────┴──────────────┴─────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Spring Security                            │  │
│  │   (Authentication + Authorization)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JDBC
                            │
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│              (Primary data store)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Async notifications
                            │
┌─────────────────────────────────────────────────────────────┐
│                         n8n                                  │
│         (Workflow automation - notifications only)           │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18** - Component-based UI framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **TanStack Query** - Server state management (Phase 2+)
- **React Hook Form + Zod** - Form validation

### Structure
```
frontend/src/
├── components/
│   ├── layout/          # Sidebar, header, page layouts
│   └── ui/              # Reusable components (button, input, table)
├── pages/               # Route components (Dashboard, Products, etc.)
├── services/            # API client abstraction
├── types/               # TypeScript interfaces
├── data/                # Demo data (Phase 1 only)
└── utils/               # Helper functions
```

### Design Principles
- **Component reusability** - Shared UI components in `/components/ui`
- **Type safety** - All entities and API responses typed
- **API abstraction** - Service layer between UI and backend
- **Responsive design** - Desktop-first, mobile-friendly
- **Accessibility** - ARIA labels, keyboard navigation, semantic HTML

## Backend Architecture

### Technology Stack (Phase 2+)
- **Java 17+** with Spring Boot 3.x
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data access
- **PostgreSQL 14+** - Relational database
- **Flyway** - Database migrations
- **Maven or Gradle** - Build tool

### Modular Monolith Structure
```
backend/src/main/java/com/kta/erp/
├── config/              # Spring configuration
├── security/            # Auth, roles, session management
├── common/              # Shared utilities, base classes
├── products/            # Product module
│   ├── Product.java
│   ├── ProductRepository.java
│   ├── ProductService.java
│   └── ProductController.java
├── inventory/           # Inventory module
│   ├── StockMovement.java
│   ├── StockBalance.java
│   ├── InventoryService.java
│   └── InventoryController.java
├── purchasing/          # Purchasing module
├── sales/               # Sales module
├── transport/           # Transport module
└── users/               # User management
```

### Module Boundaries
- Each module is **self-contained** with its own entities, repositories, services, and controllers
- Modules communicate through **service interfaces**, not direct database access
- **No circular dependencies** between modules
- Shared concerns (audit logging, validation) in `common/`

### Why Modular Monolith?
For a 2-5 user system:
- **Simpler deployment** - One application, one database
- **Easier transactions** - Cross-module operations use single database transaction
- **Lower operational overhead** - No distributed system complexity
- **Faster development** - No inter-service communication overhead
- **Future flexibility** - Modules can be extracted to microservices if needed

## Data Architecture

### Database: PostgreSQL

**Why PostgreSQL?**
- **ACID transactions** - Critical for inventory and financial data
- **Strong typing** - Constraints, foreign keys, check constraints
- **JSON support** - Flexible for metadata if needed
- **Mature and reliable** - Production-proven
- **Open source** - No licensing costs

### Schema Management
- **Flyway migrations** - Versioned, repeatable database changes
- Migrations in `src/main/resources/db/migration/`
- Never manually alter production schema
- All changes through migration files

### Key Tables (Phase 2+)

**Core Master Data:**
- `users` - System users
- `roles` - Role definitions (ADMIN, MANAGER, STAFF, VIEWER)
- `user_roles` - User-role assignments
- `products` - Product master with SKU, pricing, GST
- `categories` - Product categories
- `units` - Units of measurement
- `godowns` - Warehouse/location master

**Inventory:**
- `stock_movements` - Append-only ledger of all stock changes
- `stock_balances` - Current stock per product-godown (available, reserved, in-transit)
- `transfers` - Transfer headers (source, destination, status)
- `transfer_lines` - Transfer line items with ordered/dispatched/received quantities

**Purchasing:**
- `suppliers` - Supplier master
- `purchase_orders` - PO headers
- `purchase_order_lines` - PO line items
- `goods_receipts` - Receipt headers
- `goods_receipt_lines` - Receipt line items

**Sales:**
- `customers` - Customer master
- `sales` - Sale/invoice headers
- `sale_lines` - Sale line items
- `payments` - Payment records

**Transport:**
- `transporters` - Transporter master
- `vehicles` - Vehicle registry
- `shipments` - Shipment tracking

**Audit:**
- `audit_logs` - Critical action history (who, what, when, reference)

### Data Integrity Rules

1. **Inventory Movements**
   - Append-only (no updates or deletes after posting)
   - Every movement has: product, quantity, type, source/destination, user, timestamp
   - Corrections via explicit reversal entries

2. **Stock Balances**
   - Updated transactionally with movements
   - Constraints prevent negative stock (unless explicitly configured)
   - `available + reserved + in_transit = total`

3. **Transfers**
   - Dispatch: reduce source available, increase in-transit
   - Receipt: increase destination available, reduce in-transit
   - Partial receipt support per line item
   - Check constraint: `received_quantity <= dispatched_quantity`

4. **Monetary Values**
   - Use `NUMERIC(15, 2)` or `DECIMAL(15, 2)` - **never FLOAT or DOUBLE**
   - Store amounts in smallest currency unit if needed (paise for INR)

5. **Concurrency Control**
   - Optimistic locking (`@Version` column) or database-level locks
   - Idempotency keys for critical operations
   - Transaction isolation level appropriate for operations

## Security Architecture

### Authentication (Phase 2+)
- **Spring Security** with form-based login
- **Password hashing** - BCrypt with strong work factor
- **Session management** - HttpOnly, Secure (HTTPS), SameSite cookies
- **CSRF protection** - Enabled for state-changing operations
- **Login throttling** - Prevent brute force attacks

### Authorization
- **Role-based access control (RBAC)**
  - `ADMIN` - Full system access
  - `MANAGER` - Create/approve transfers, view reports
  - `STAFF` - POS, basic inventory operations
  - `VIEWER` - Read-only access
- **Method-level security** - `@PreAuthorize` on service methods
- **API-level checks** - Validate permissions in controllers

### API Security
- **Input validation** - Validate all DTOs with Bean Validation
- **SQL injection prevention** - Parameterized queries, no string concatenation
- **CORS configuration** - Narrow whitelist of allowed origins
- **Error messages** - Don't leak sensitive information or stack traces

### Infrastructure Security
- **Database access** - Not exposed to public internet
- **Admin interfaces** (n8n, pgAdmin) - Private network only
- **Remote access** - VPN or private network + HTTPS, not direct exposure
- **Secrets management** - Environment variables, not in code or git
- `.env.example` only - Never commit real credentials

## Deployment Architecture

### Local Development (Docker Compose)
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - DB_USER=kta
      - DB_PASSWORD=${DB_PASSWORD}
  
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=kta_erp
      - POSTGRES_USER=kta
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
```

### Production Deployment
- **Application server** - Docker Compose or systemd services
- **Database** - PostgreSQL with regular backups
- **Reverse proxy** - Nginx with HTTPS (Let's Encrypt)
- **Network** - Private network or VPN for remote access
- **Monitoring** - Health checks, log aggregation

## Workflow Automation (n8n)

### Purpose
- Low stock notifications
- Transfer dispatch/receipt alerts
- Daily/weekly summary emails
- Scheduled reports

### Critical Constraint
**n8n is NOT the source of truth for inventory or financial data.**

- n8n **reads** from database (read-only user)
- n8n **triggers** workflows based on events or schedule
- n8n **sends** notifications (email, SMS, webhook)
- n8n **NEVER** directly updates inventory tables
- All state changes go through Spring Boot APIs

### Integration Pattern
```
Spring Boot → (event/webhook) → n8n → (notification) → Email/SMS
     ↓
PostgreSQL (source of truth)
```

## Testing Strategy

### Frontend (Phase 1+)
- **ESLint** - Code quality
- **TypeScript** - Type checking
- **Manual testing** - Key user flows

### Backend (Phase 2+)
- **Unit tests** - Service logic (JUnit, Mockito)
- **Integration tests** - Repository and database (@DataJpaTest)
- **API tests** - Controller endpoints (@SpringBootTest)
- **Transaction tests** - Verify rollback on failure

### Critical Test Cases (Phase 3+)
- Purchase receipt increases stock exactly once
- Transfer dispatch updates source and in-transit correctly
- Transfer receipt updates destination and reduces in-transit
- Partial receipt quantities
- Duplicate API calls don't double-post (idempotency)
- Concurrent operations don't oversell
- Unauthorized access rejected
- Invalid state transitions rejected
- Transaction rollback on failure

## Monitoring and Operations

### Logging
- **Structured logging** - JSON format for parsing
- **Log levels** - INFO for operations, DEBUG for development, ERROR for failures
- **Audit logging** - Separate table for sensitive operations

### Health Checks
- `/actuator/health` - Application status
- Database connectivity check
- Disk space check

### Backups
- **PostgreSQL** - Daily automated backups
- **Backup verification** - Test restore monthly
- **Retention** - 30 days minimum

### Recovery
- **Database restore** procedure documented and tested
- **Rollback plan** for failed deployments

## Technology Choices Rationale

### Why React?
- Component-based architecture
- Large ecosystem and community
- TypeScript support
- Good performance

### Why Spring Boot?
- Mature, production-proven
- Strong typing with Java
- Comprehensive security features
- Good ORM with JPA/Hibernate
- Large talent pool in India

### Why PostgreSQL?
- ACID transactions (critical for inventory)
- Strong constraints and data integrity
- JSON support for flexibility
- Open source and widely supported

### Why Modular Monolith?
- Right size for 2-5 users
- Simpler operations
- Single deployment unit
- Transactional integrity across modules
- Can evolve to microservices if needed

## Future Considerations

### Scalability
Current architecture supports:
- **Users**: 2-5 concurrent (current), 50+ (future with load balancer)
- **Godowns**: 6+ (current), 100+ (future with proper indexing)
- **Transactions**: 1000s/day (current), 100K+/day (future with optimization)

### Evolution Path
1. **Phase 1-6**: Monolith with proper module boundaries
2. **If needed**: Extract high-traffic modules (e.g., POS) to separate service
3. **If needed**: Read replicas for reporting
4. **If needed**: Caching layer (Redis) for frequent reads

---

Last Updated: October 19, 2026
