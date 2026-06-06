# Database Operations Quick Reference

**Companion to:** DATABASE_SCALING_HA_STRATEGY.md  
**Updated:** June 7, 2026  
**Owner:** Database Operations Team

Quick command reference for common database operations and troubleshooting.

---

## Connection & Access

### Connect to Production Database

```bash
# Using DATABASE_URL environment variable
psql $DATABASE_URL

# Or with specific connection string
psql postgresql://user:pass@host/db?sslmode=require

# For Neon, use the psql connection string from dashboard
psql postgres://neondb_owner:npg_...@ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Test Connection

```bash
# Quick connectivity test
psql $DATABASE_URL -c "SELECT 1 as connection_test;"
# Expected output: connection_test
#                       1

# Check database size
psql $DATABASE_URL -c "SELECT pg_database_size(current_database());"
```

---

## Monitoring & Diagnostics

### View Active Connections

```sql
-- Count active connections
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Show connection details
SELECT 
  pid,
  usename,
  application_name,
  query,
  state,
  query_start
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start DESC;

-- Show idle connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';
```

### Find Slow Queries

```sql
-- Enable or check pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT 
  left(query, 80) as query_preview,
  calls,
  round(mean_time, 2) as avg_ms,
  round(max_time, 2) as max_ms,
  round(stddev_time, 2) as stddev_ms
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Queries by total time (slowest cumulative impact)
SELECT 
  left(query, 80) as query_preview,
  calls,
  round(mean_time, 2) as avg_ms,
  round(total_time, 2) as total_ms
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Reset statistics
SELECT pg_stat_statements_reset();
```

### Check Query Execution Plan

```sql
-- Basic EXPLAIN
EXPLAIN
SELECT * FROM tasks
WHERE company_id = 'xxx' AND status = 'active'
ORDER BY created_at DESC;

-- Detailed EXPLAIN with ANALYZE (runs the query)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM tasks
WHERE company_id = 'xxx' AND status = 'active'
ORDER BY created_at DESC;

-- Look for:
-- ✓ Index Scan (good)
-- ✗ Seq Scan (bad - needs index)
-- ✓ Buffers: Hit ratio > 99%
-- ✗ Rows: Estimate >> Actual (bad statistics, run ANALYZE)
```

### View Index Statistics

```sql
-- Index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_returned,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes (candidates for removal)
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Check Cache Hit Ratio

```sql
-- Overall cache hit ratio
SELECT
  sum(heap_blks_hit) as heap_hits,
  sum(heap_blks_read) as heap_reads,
  round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Expected: > 99%
-- If < 95%: Review indexes or increase shared_buffers

-- By table
SELECT
  relname,
  heap_blks_hit,
  heap_blks_read,
  round(100.0 * heap_blks_hit / (heap_blks_hit + heap_blks_read), 2) as cache_hit_ratio
FROM pg_statio_user_tables
WHERE heap_blks_read > 0
ORDER BY heap_blks_read DESC;
```

---

## Index Management

### List All Indexes

```sql
-- Show all indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show indexes for specific table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tasks';
```

### Create Index

```sql
-- Standard index
CREATE INDEX idx_company_status ON companies(status);

-- Compound index (multiple columns)
CREATE INDEX idx_tasks_company_status ON tasks(company_id, status);

-- Partial index (conditional)
CREATE INDEX idx_alerts_unread 
ON investor_alerts(investor_id, created_at DESC)
WHERE email_opened = false;

-- Index on expression
CREATE INDEX idx_company_lower_name ON companies(lower(name));

-- Non-concurrent create (blocks table - avoid in production)
CREATE INDEX idx_name ON table(column);

-- Concurrent create (doesn't block reads/writes - recommended)
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

### Drop Index

```sql
-- Drop index (may lock table during drop)
DROP INDEX idx_name;

-- Drop concurrently (no locking)
DROP INDEX CONCURRENTLY idx_name;

-- Drop if exists
DROP INDEX IF EXISTS idx_name;
```

### Reindex

```sql
-- Reindex specific index
REINDEX INDEX idx_name;

-- Reindex table (all indexes)
REINDEX TABLE table_name;

-- Concurrent reindex (no locks, slower)
REINDEX INDEX CONCURRENTLY idx_name;

-- When to use:
-- - Index bloat > 20%
-- - After bulk DELETE/UPDATE
-- - Corrupted index
```

### Analyze & Vacuum

```sql
-- Update table statistics (optimizer uses this)
ANALYZE table_name;

-- Reclaim space from deleted rows
VACUUM table_name;

-- Aggressive cleanup (blocks table briefly)
VACUUM FULL table_name;

-- Combined: analyze + vacuum
VACUUM ANALYZE table_name;

-- Analyze all tables
ANALYZE;

-- When to run:
-- ANALYZE: After adding indexes, bulk imports
-- VACUUM: After bulk deletes/updates
-- Frequency: Weekly for active tables
```

---

## Schema & Table Operations

### View Table Structure

```sql
-- Table columns and types
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Table size
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass, 'main')) as heap_size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass, 'indexes')) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Row count (approximate)
SELECT relname, n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Add Column

```sql
-- Add column with default
ALTER TABLE companies ADD COLUMN industry VARCHAR(100);

-- Add column with NOT NULL constraint (requires default for existing rows)
ALTER TABLE companies ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';

-- Add column after another (PostgreSQL doesn't support AFTER, use at end)
ALTER TABLE companies ADD COLUMN sector VARCHAR(100);
```

### Modify Column

```sql
-- Change data type
ALTER TABLE companies ALTER COLUMN status TYPE text;

-- Add NOT NULL constraint
ALTER TABLE companies ALTER COLUMN name SET NOT NULL;

-- Add default value
ALTER TABLE companies ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- Drop default
ALTER TABLE companies ALTER COLUMN created_at DROP DEFAULT;
```

### Drop Column

```sql
-- Drop single column
ALTER TABLE companies DROP COLUMN deprecated_field;

-- Drop multiple columns
ALTER TABLE companies
  DROP COLUMN field1,
  DROP COLUMN field2;
```

---

## Data Management

### Count Rows

```sql
-- Count all rows in table
SELECT COUNT(*) as total_rows FROM tasks;

-- Count with WHERE clause
SELECT COUNT(*) FROM tasks WHERE status = 'active';

-- Count by group
SELECT status, COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- Approximate row count (faster, uses statistics)
SELECT n_live_tup as approx_rows
FROM pg_stat_user_tables
WHERE relname = 'tasks';
```

### Bulk Delete

```sql
-- Delete with condition
DELETE FROM tasks 
WHERE status = 'completed' 
  AND completed_at < NOW() - INTERVAL '1 year';

-- Delete all (careful!)
DELETE FROM table_name;

-- Check before deletion
SELECT COUNT(*) FROM tasks 
WHERE status = 'completed' 
  AND completed_at < NOW() - INTERVAL '1 year';

-- Archive instead of delete
INSERT INTO tasks_archive
SELECT * FROM tasks WHERE status = 'completed';

DELETE FROM tasks WHERE status = 'completed';
```

### Bulk Update

```sql
-- Update multiple rows
UPDATE companies 
SET status = 'active'
WHERE trial_status = 'complete'
  AND created_at < NOW() - INTERVAL '30 days';

-- Update with calculation
UPDATE company_financials
SET revenue_growth = (revenue - prev_revenue) / prev_revenue * 100
WHERE prev_revenue > 0;

-- Update from another table
UPDATE c
SET industry = cf.industry
FROM capital_companies cf
WHERE c.id = cf.company_id;
```

### Duplicate Detection

```sql
-- Find duplicate values
SELECT company_id, COUNT(*) as count
FROM tasks
GROUP BY company_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Find duplicate rows (all columns same)
SELECT *
FROM (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY company_id, title, status ORDER BY id) as rn
  FROM tasks
) t
WHERE rn > 1;

-- Remove duplicates (keep first)
DELETE FROM tasks
WHERE id NOT IN (
  SELECT MIN(id)
  FROM tasks
  GROUP BY company_id, title, status
);
```

---

## Backup & Recovery

### Manual Backup

```bash
# Backup to file (from command line)
pg_dump $DATABASE_URL > backup.sql

# Backup to compressed file
pg_dump $DATABASE_URL | gzip > backup.sql.gz

# Backup specific table
pg_dump $DATABASE_URL -t tasks > tasks_backup.sql

# Backup with data only (no schema)
pg_dump $DATABASE_URL --data-only > data_backup.sql

# Backup schema only
pg_dump $DATABASE_URL --schema-only > schema_backup.sql

# Backup all data as CSV (for analysis)
psql $DATABASE_URL -c "\COPY tasks TO 'tasks.csv' CSV HEADER"
```

### Restore from Backup

```bash
# Restore entire database
psql $DATABASE_URL < backup.sql

# Restore from gzip
gunzip -c backup.sql.gz | psql $DATABASE_URL

# Restore specific table
psql $DATABASE_URL -f tasks_backup.sql
```

### Neon Point-in-Time Recovery

```bash
# Via Neon Dashboard:
# 1. Project → Backups
# 2. Select desired timestamp
# 3. "Create recovery branch"
# 4. Get connection string
# 5. Test data
# 6. If good, promote to main

# Via CLI (if available):
# neon project restore --to-timestamp 2026-06-07T12:00:00Z
```

### Test Restore Procedure

```bash
# 1. Create test database
createdb test_restore

# 2. Restore backup
psql test_restore < backup.sql

# 3. Verify data
psql test_restore -c "SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema = 'public';"

# 4. Run integrity checks
psql test_restore << SQL
SELECT 'tasks' as table_name, COUNT(*) as count FROM tasks
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'company_financials', COUNT(*) FROM company_financials;
SQL

# 5. Clean up
dropdb test_restore
```

---

## Replication (When Applicable)

### Check Replication Status

```sql
-- Show replication slots
SELECT slot_name, slot_type, active, restart_lsn
FROM pg_replication_slots;

-- Show replicated data
SELECT 
  slot_name,
  replay_lag,
  write_lag,
  flush_lag
FROM pg_stat_replication;

-- Check WAL position
SELECT pg_current_wal_lsn();

-- Expected replication lag: < 100ms
-- Alert threshold: > 1000ms (1 second)
```

### Handle Replication Lag

```sql
-- If replica is lagging
-- 1. Check if replica is running:
SELECT pg_is_wal_replay_paused();

-- 2. Resume if paused:
SELECT pg_wal_replay_resume();

-- 3. Reduce write load on primary temporarily

-- 4. Monitor lag again:
SELECT replay_lag FROM pg_stat_replication;
```

### Promote Replica to Primary (Emergency)

```sql
-- On replica, promote to primary:
SELECT pg_promote();

-- Update application connection string to replica endpoint

-- Recreate failed primary later
```

---

## Performance Tuning

### Enable Query Logging

```sql
-- Set slow query log threshold (100ms)
SET log_min_duration_statement = 100;

-- View logs (in Neon, check dashboard)
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE mean_time > 100;
```

### Connection Pool Tuning

```bash
# For Neon, pooler parameters are managed by Neon
# For self-hosted, adjust in postgresql.conf:

# max_connections = 200  # Default 100
# shared_buffers = 256MB  # Typically 25% of RAM
# effective_cache_size = 1GB  # 50-75% of RAM
# work_mem = 4MB  # Per operation memory
# maintenance_work_mem = 64MB  # For VACUUM, CREATE INDEX
```

### Transaction Optimization

```sql
-- Check long-running transactions
SELECT pid, usename, application_name, xact_start, query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start DESC;

-- Terminate long transaction (use with caution)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE query_start < NOW() - INTERVAL '1 hour'
AND state != 'idle';
```

---

## Troubleshooting

### "too many connections" Error

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Show who is connected
SELECT pid, usename, application_name, state
FROM pg_stat_activity
ORDER BY state;

-- Disconnect idle connections older than 30 minutes
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < NOW() - INTERVAL '30 minutes';

-- Increase max_connections (if self-hosted)
-- max_connections = 300
```

### High CPU Usage

```sql
-- Find expensive queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Find queries doing full table scans
EXPLAIN ANALYZE
SELECT * FROM large_table WHERE status = 'active';

-- Check for missing indexes
SELECT * FROM pg_stat_user_tables
WHERE seq_scan > 1000
ORDER BY seq_scan DESC;
```

### Disk Space Issues

```sql
-- Check total database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Show largest tables
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC
LIMIT 10;

-- Archive old data
INSERT INTO tasks_archive SELECT * FROM tasks
WHERE completed_at < NOW() - INTERVAL '1 year';

DELETE FROM tasks
WHERE completed_at < NOW() - INTERVAL '1 year';

-- Reclaim space
VACUUM ANALYZE;
```

### Deadlock Errors

```sql
-- Enable deadlock logging (self-hosted)
-- deadlock_timeout = '1s'

-- Find blocking queries
SELECT 
  blocking_locks.pid as blocked_pid,
  blocked_statement.query as blocked_query,
  blocking_locks.pid as blocking_pid,
  blocking_statement.query as blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_statement ON blocked_statement.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_statement ON blocking_statement.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

---

## Useful Aliases (Add to ~/.psqlrc)

```sql
-- Save to ~/.psqlrc to use with psql

-- Quick connection check
\set conn_check 'SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = ''active'';'

-- Show slow queries
\set slow 'SELECT query, calls, round(mean_time) as avg_ms FROM pg_stat_statements WHERE mean_time > 100 ORDER BY mean_time DESC LIMIT 10;'

-- Show cache hit ratio
\set cache 'SELECT round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) as cache_hit_ratio FROM pg_statio_user_tables;'

-- Show database size
\set dbsize 'SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;'

-- Show table sizes
\set tbl_sizes 'SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size FROM pg_tables WHERE schemaname = ''public'' ORDER BY pg_total_relation_size(tablename::regclass) DESC;'

-- Usage:
-- psql $DATABASE_URL
-- :conn_check
-- :slow
-- :cache
```

---

## Emergency Contacts

**Database Issues:** #database-monitoring (Slack)  
**Performance Emergency:** Page on-call engineer  
**Data Loss Risk:** Immediate escalation to CTO  

---

**Last Updated:** June 7, 2026  
**Owner:** Database Operations Team

