# Migration 020: Comprehensive Phase 2 Deployment Guide

**Migration ID:** 020  
**Created:** 2026-06-03  
**Status:** Ready for Production Deployment  
**Estimated Execution Time:** 2-5 seconds (depending on DB size)  

---

## Overview

This migration deploys 6 core Phase 2 tables covering IPO readiness workflow management:

| Table | Purpose | Rows | Status |
|-------|---------|------|--------|
| **cost_items** | Granular IPO cost tracking (capex/opex) | 500-5000 | Core |
| **financial_metrics** | Dashboard KPI aggregations | 30-120 | Core |
| **dilution_scenarios** | Cap table modeling & scenario analysis | 5-50 | Core |
| **dilution_scenario_shareholders** | Shareholder dilution impact rows | 10-100/scenario | Core |
| **consent_requests** | Shareholder/stakeholder approval workflows | 20-200 | Core |
| **corporate_resolutions** | Board & shareholder resolutions | 10-50 | Core |

**Supporting Tables:**
- `vendors` - Service provider master data
- `milestones` - IPO process milestones
- `consent_templates` - Reusable consent request templates

---

## Pre-Deployment Checklist

### 1. Database Backups (CRITICAL)
```bash
# Create full database backup
pg_dump -U $DB_USER -Fc $DB_NAME > ipo_ready_pre_migration_020_$(date +%Y%m%d_%H%M%S).dump

# Verify backup is readable
pg_dump -U $DB_USER -Fc ipo_ready_pre_migration_020_*.dump -t cost_items > /dev/null && echo "Backup verified"
```

### 2. Verify Dependencies
```sql
-- Check that companies and users tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('companies', 'users') 
AND table_schema = 'public';

-- Expected output: 2 rows (companies, users)
```

### 3. Check Database Status
```sql
-- Ensure database is healthy
SELECT 
  datname,
  numbackends,
  xact_commit,
  xact_rollback
FROM pg_stat_database 
WHERE datname = 'ipo_ready';

-- Check for long-running transactions
SELECT * FROM pg_stat_activity 
WHERE state != 'idle' 
AND datname = 'ipo_ready';
```

---

## Deployment Procedure

### Option A: CLI (Recommended for CI/CD)
```bash
# Execute migration in single transaction
psql -U $DB_USER -d $DB_NAME -f migrations/020_comprehensive_phase2_tables_with_rollback.sql

# Verify with validation query
psql -U $DB_USER -d $DB_NAME -c "
SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_items') as cost_items_ok,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_metrics') as financial_metrics_ok,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenarios') as dilution_scenarios_ok,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_requests') as consent_requests_ok,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_resolutions') as corporate_resolutions_ok;
"
```

### Option B: Via SQL Client (e.g., pgAdmin, DBeaver)
1. Open SQL query editor
2. Copy entire contents of `migrations/020_comprehensive_phase2_tables_with_rollback.sql`
3. Execute with **Run as transaction** enabled
4. Run validation query from bottom of migration file
5. Verify all 9 tables are created

### Option C: Application ORM (Prisma, TypeORM)
```bash
# If using Prisma migrations
cp migrations/020_comprehensive_phase2_tables_with_rollback.sql prisma/migrations/$(date +%s)_phase2_tables/migration.sql
npx prisma migrate deploy

# Verify
npx prisma db push --skip-generate
```

---

## Post-Deployment Verification

### 1. Table Creation Verification
```sql
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'dilution_scenario_shareholders', 'consent_requests', 
  'corporate_resolutions', 'vendors', 'milestones', 
  'consent_templates'
) 
ORDER BY table_name;

-- Expected: 9 rows, all in 'public' schema
```

### 2. Index Verification
```sql
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'dilution_scenario_shareholders', 'consent_requests', 
  'corporate_resolutions'
)
GROUP BY tablename
ORDER BY tablename;

-- Expected counts:
-- cost_items: 8 indexes
-- financial_metrics: 4 indexes
-- dilution_scenarios: 4 indexes
-- dilution_scenario_shareholders: 3 indexes
-- consent_requests: 7 indexes
-- corporate_resolutions: 5 indexes
-- TOTAL: 31 indexes
```

### 3. Trigger Verification
```sql
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'consent_requests', 'corporate_resolutions'
)
ORDER BY event_object_table;

-- Expected: 5 triggers (one per main table)
```

### 4. Foreign Key Verification
```sql
SELECT 
  constraint_name,
  table_name,
  referenced_table_name
FROM information_schema.referential_constraints
WHERE table_name IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'dilution_scenario_shareholders', 'consent_requests', 
  'corporate_resolutions'
)
ORDER BY table_name, constraint_name;

-- Expected: 15+ foreign key constraints
```

### 5. Table Size Check
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'dilution_scenario_shareholders', 'consent_requests', 
  'corporate_resolutions'
)
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Expected: Very small (empty tables) - ~50KB each
```

---

## Rollback Procedure

### If Migration Fails or Issues Arise

**BEFORE executing rollback:**
1. Note the exact error message
2. Check application logs
3. Verify database connectivity
4. Take a fresh backup of current state

**Execute rollback:**
```bash
# Single transaction rollback
psql -U $DB_USER -d $DB_NAME -f migrations/020_rollback.sql

# Verify rollback succeeded
psql -U $DB_USER -d $DB_NAME -c "
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_items') as migration_rolled_back;
"
# Expected output: false (table does not exist)
```

---

## Performance Optimization Notes

### Index Strategy
- **Company-based queries:** All main tables indexed on `company_id` for efficient filtering
- **Status/State queries:** `cost_items.status`, `consent_requests.status`, `corporate_resolutions.status`
- **Timeline queries:** `cost_items.due_date`, `consent_requests.deadline_date`, `dilution_scenarios.created_at`
- **Composite indexes:** `cost_items(company_id, status)` for dashboard aggregations

### Query Performance Tips
```sql
-- GOOD: Uses indexed columns
SELECT SUM(amount_usd) FROM cost_items 
WHERE company_id = 'xyz' AND status = 'paid';

-- AVOID: Forces full table scan
SELECT * FROM cost_items 
WHERE LOWER(description) LIKE '%legal%';
```

### Batch Operations
```sql
-- Insert multiple cost items efficiently
INSERT INTO cost_items (company_id, cost_category, cost_type, amount_usd, status)
VALUES 
  ('xyz', 'legal', 'capex', 250000, 'estimated'),
  ('xyz', 'audit', 'capex', 350000, 'estimated'),
  ('xyz', 'ib', 'capex', 500000, 'estimated')
ON CONFLICT DO NOTHING;
```

---

## Integration Checklist

### ORM/Framework Updates
- [ ] Update Prisma schema (if using Prisma)
- [ ] Update TypeORM entities (if using TypeORM)
- [ ] Update SQLAlchemy models (if using SQLAlchemy)
- [ ] Run code generation for ORM
- [ ] Test ORM queries against new tables

### Application Code
- [ ] Add cost tracking API endpoints
- [ ] Add financial metrics dashboard queries
- [ ] Add dilution scenario calculator
- [ ] Add consent request workflows
- [ ] Add corporate resolution tracking
- [ ] Add vendor master data management
- [ ] Update data validation layers

### API/GraphQL Updates
- [ ] Add cost_items resolver
- [ ] Add financial_metrics resolver
- [ ] Add dilution_scenarios resolver
- [ ] Add consent_requests resolver
- [ ] Add corporate_resolutions resolver
- [ ] Update schema documentation

### Frontend Integration
- [ ] Cost dashboard component
- [ ] Financial metrics KPI display
- [ ] Dilution scenario calculator UI
- [ ] Consent request form
- [ ] Resolution approval workflow
- [ ] Vendor management UI

---

## Monitoring & Alerts

### Set Up Alerts For
```sql
-- Monitor table growth
CREATE OR REPLACE FUNCTION monitor_table_sizes()
RETURNS TABLE(tablename text, size_mb numeric) AS $$
SELECT 
  tablename,
  ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024 / 1024.0, 2)
FROM pg_tables 
WHERE tablename IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'consent_requests', 'corporate_resolutions'
);
$$ LANGUAGE SQL;
```

### Key Metrics to Track
- **cost_items table size** - Should grow linearly with number of costs tracked
- **financial_metrics aggregation time** - Dashboard performance indicator
- **Consent request approval time** - SLA tracking
- **Dilution scenario calculation time** - Performance indicator

---

## Common Issues & Troubleshooting

### Issue 1: "companies" table does not exist
**Solution:** Run Phase 1 migrations first
```bash
# Check Phase 1 migrations
psql -U $DB_USER -d $DB_NAME -c "SELECT table_name FROM information_schema.tables WHERE table_name = 'companies';"
```

### Issue 2: Foreign key constraint violations
**Solution:** Ensure users and companies tables are populated
```sql
-- Check if reference tables have data
SELECT COUNT(*) as companies_count FROM companies;
SELECT COUNT(*) as users_count FROM users;
```

### Issue 3: Migration hangs or times out
**Solution:** Check for locks and long-running queries
```sql
-- Find blocking queries
SELECT * FROM pg_stat_activity 
WHERE state != 'idle' 
AND pid <> pg_backend_pid();

-- Kill blocking connection (use with caution)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'ipo_ready' 
AND pid <> pg_backend_pid() 
AND state = 'idle in transaction';
```

### Issue 4: Out of disk space
**Solution:** Monitor disk usage before deployment
```bash
# Check PostgreSQL data directory
du -sh /var/lib/postgresql/14/main

# Check available space
df -h
```

---

## Maintenance & Cleanup

### Post-Deployment (after 24 hours)
```sql
-- Analyze tables for query planner
ANALYZE cost_items;
ANALYZE financial_metrics;
ANALYZE dilution_scenarios;
ANALYZE dilution_scenario_shareholders;
ANALYZE consent_requests;
ANALYZE corporate_resolutions;

-- Check for table bloat
SELECT 
  schemaname,
  tablename,
  ROUND(100 * pg_relation_size(schemaname||'.'||tablename) / 
        pg_total_relation_size(schemaname||'.'||tablename), 2) as ratio
FROM pg_tables 
WHERE tablename IN (
  'cost_items', 'financial_metrics', 'dilution_scenarios', 
  'consent_requests', 'corporate_resolutions'
);
```

### Weekly Maintenance
```sql
-- Reindex tables if index bloat detected
REINDEX TABLE CONCURRENTLY cost_items;
REINDEX TABLE CONCURRENTLY financial_metrics;
REINDEX TABLE CONCURRENTLY dilution_scenarios;
REINDEX TABLE CONCURRENTLY consent_requests;
REINDEX TABLE CONCURRENTLY corporate_resolutions;

-- Update table statistics
ANALYZE;
```

---

## Support & Documentation

### Reference Files
- **Migration:** `/migrations/020_comprehensive_phase2_tables_with_rollback.sql`
- **Rollback:** `/migrations/020_rollback.sql`
- **Schema Docs:** Database schema documentation in project wiki

### Contact & Questions
- Database schema questions: Check project documentation
- Performance issues: Review index strategy above
- Migration failures: See Troubleshooting section

---

## Sign-Off

- **Prepared by:** IPOReady Build System
- **Reviewed by:** [DBA/Tech Lead]
- **Approved by:** [Product Owner]
- **Deployed to:** [Environment]
- **Deployment Date:** [Date/Time]
- **Verified by:** [QA/DevOps]

---

## Appendix: Full Index List

```
cost_items:
  - idx_cost_items_company_id
  - idx_cost_items_category
  - idx_cost_items_type
  - idx_cost_items_status
  - idx_cost_items_phase
  - idx_cost_items_actual_date
  - idx_cost_items_due_date
  - idx_cost_items_vendor_id

financial_metrics:
  - idx_financial_metrics_company_id
  - idx_financial_metrics_date
  - idx_financial_metrics_type
  - idx_financial_metrics_company_date

dilution_scenarios:
  - idx_dilution_scenarios_company_id
  - idx_dilution_scenarios_type
  - idx_dilution_scenarios_status
  - idx_dilution_scenarios_created_at

dilution_scenario_shareholders:
  - idx_dilution_shareholders_scenario_id
  - idx_dilution_shareholders_shareholder_name
  - idx_dilution_shareholders_type

consent_requests:
  - idx_consent_requests_company_id
  - idx_consent_requests_status
  - idx_consent_requests_type
  - idx_consent_requests_deadline
  - idx_consent_requests_recipient
  - idx_consent_requests_template_id
  - idx_consent_requests_company_status

corporate_resolutions:
  - idx_corporate_resolutions_company_id
  - idx_corporate_resolutions_type
  - idx_corporate_resolutions_status
  - idx_corporate_resolutions_deadline
  - idx_corporate_resolutions_approval_status
```

---

**END OF DEPLOYMENT GUIDE**
