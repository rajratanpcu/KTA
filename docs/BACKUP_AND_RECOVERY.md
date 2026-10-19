# KTA ERP — Database Backup & Recovery Runbook
**Document Version:** 1.0.0  
**Target:** PostgreSQL 15 / Neon / Supabase Managed Cloud Database

---

## 1. Automated vs. Manual Backups

### 1.1 Neon Cloud Backups (Point-in-Time Recovery)
- Neon maintains continuous Write-Ahead Log (WAL) records for Point-in-Time Restore (PITR) up to the limit of your project retention (typically 24 hours to 7 days on free/standard plans).
- To create a point-in-time branch/snapshot:
  1. Open the **Neon Console** -> Select your Project.
  2. Click **Branches** -> **New Branch**.
  3. Select the restore timestamp or current state.

### 1.2 Manual Logical Backups (`pg_dump`)
A cold offsite dump should be taken before any major software upgrade or schema migration:
```bash
# Export full database schema and data
pg_dump "postgres://<user>:<password>@<host>/kta_erp?sslmode=require" \
  --format=custom \
  --file="kta_erp_backup_$(date +%Y%m%d_%H%M%S).dump"

# Or export plain SQL script
pg_dump "postgres://<user>:<password>@<host>/kta_erp?sslmode=require" \
  --no-owner \
  --no-privileges \
  --file="kta_erp_backup_$(date +%Y%m%d_%H%M%S).sql"
```

---

## 2. Full Restoration Procedure

### 2.1 Restoring from Custom Dump (`pg_restore`)
```bash
# Restore into an existing or fresh target database
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname="postgres://<user>:<password>@<host>/kta_erp?sslmode=require" \
  "kta_erp_backup_20261019_120000.dump"
```

### 2.2 Restoring from Plain SQL Script (`psql`)
```bash
psql "postgres://<user>:<password>@<host>/kta_erp?sslmode=require" \
  -f "kta_erp_backup_20261019_120000.sql"
```

---

## 3. Disaster Recovery Testing Checklist
1. **Verification of Schema Integrities:**
   - Confirm Flyway schema history table `flyway_schema_history` matches latest migration version (`V3__stock_management_schema.sql`).
   - Verify triggers exist: `update_transport_bill_balance` on `transport_payment_allocations`.
2. **Data Consistency Audit:**
   - Execute:
     ```sql
     SELECT COUNT(*) FROM products;
     SELECT COUNT(*) FROM godowns;
     SELECT COUNT(*) FROM stock_balances;
     SELECT COUNT(*) FROM transport_bills;
     ```
3. **Rollback Plan for Failed Deployments:**
   - If an issue occurs during a release, redeploy the previous Docker image tag on Render or rollback the deployment in the Vercel dashboard.
