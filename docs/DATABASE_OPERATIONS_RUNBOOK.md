# IPOReady Database Operations Runbook

**Purpose:** Step-by-step database administration procedures for DevOps/SRE teams  
**Database:** Neon PostgreSQL (serverless)  
**Last Updated:** June 7, 2026

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Backup & Recovery](#backup--recovery)
3. [Performance Optimization](#performance-optimization)
4. [Scaling Operations](#scaling-operations)
5. [Migration Operations](#migration-operations)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Emergency Procedures](#emergency-procedures)
8. [Index Management](#index-management)
9. [Disk Space Management](#disk-space-management)
10. [Connection Pool Management](#connection-pool-management)

---

## Daily Operations

### Morning Health Check (2 minutes)

```bash
#!/bin/bash
# Run every morning to verify database health

echo "=== DATABASE HEALTH CHECK ==="
echo "Time: $(date -u)"

# 1. Connectivity
echo -n "Connectivity: "
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "✓ OK"
else
  echo "✗ FAILED - Database unreachable!"
  exit 1
fi

# 2. Compute status
echo -n "Compute Status: "
COMPUTE=$(neonctl projects describe-project --project-id $NEON_PROJECT_ID | jq -r '.compute')
if [ "$COMPUTE" = "running" ]; then
  echo "✓ Running"
else
  echo "✗ Not running - escalate immediately!"
  exit 1
fi

# 3. Connection count
echo -n "Active Connections: "
CONN_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state='active'")
echo "$CONN_COUNT (alert if > 100)"

# 4. Database size
echo -n "Database Size: "
DB_SIZE=$(psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()))")
echo "$DB_SIZE"

# 5. Oldest transaction
echo -n "Longest Transaction: "
OLDEST=$(psql "$DATABASE_URL" -t -c "SELECT COALESCE(max(EXTRACT(EPOCH FROM (now()-query_start))/60)::int, 0) FROM pg_stat_activity WHERE state != 'idle'")
echo "${OLDEST} minutes (alert if > 60)"

# 6. Replication lag (if applicable)
echo "✓ Health check complete"
```

Save as `scripts/db-health-check.sh` and run daily via cron:
```bash
0 8 * * * /path/to/db-health-check.sh | mail -s "DB Health Check" ops@ipoready.ai
```

### Weekly Maintenance

```bash
# Every Monday morning:

# 1. Analyze tables (updates query planner statistics)
psql "$DATABASE_URL" << 'EOF'
ANALYZE;
EOF
echo "✓ ANALYZE completed"

# 2. Vacuum tables (removes dead rows)
psql "$DATABASE_URL" << 'EOF'
VACUUM ANALYZE;
EOF
echo "✓ VACUUM completed"

# 3. Check for missing indices
psql "$DATABASE_URL" << 'EOF'
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
EOF

# 4. Check for bloat (tables with excessive dead space)
psql "$DATABASE_URL" << 'EOF'
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
EOF
```

### Monthly Review

```bash
# First day of month:

# 1. Generate usage report
psql "$DATABASE_URL" << 'EOF'
-- Storage by table
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_live_tup as row_count
FROM pg_tables
NATURAL LEFT JOIN pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF

# 2. Performance metrics
psql "$DATABASE_URL" << 'EOF'
-- Top queries by execution time
SELECT query, calls, mean_exec_time as avg_ms, max_exec_time as max_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 20;
EOF

# 3. Replication health (if applicable)
psql "$DATABASE_URL" -c "SELECT slot_name, restart_lsn, confirmed_flush_lsn FROM pg_replication_slots;"

# 4. Connection trends
# Check Vercel/Neon dashboard for connection pool statistics

# 5. Create monthly backup
pg_dump "$DATABASE_URL" | gzip > "backups/ipoready_$(date +%Y%m01).sql.gz"
```

---

## Backup & Recovery

### Automated Backup Strategy

**Neon Automatic Backups:**
- Automatic backups: Every 6 hours (built-in)
- Retention: 7 days
- Cost: Included in Neon plan
- Recovery: Point-in-time up to 7 days

**Manual Backup (Supplementary):**

```bash
#!/bin/bash
# Backup to S3 (daily)

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/ipoready_$DATE.sql.gz"
S3_BUCKET="ipoready-backups"
S3_PATH="s3://$S3_BUCKET/daily/$DATE.sql.gz"

# 1. Export database
echo "Exporting database..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

# 2. Verify backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup created: $BACKUP_SIZE"

# 3. Upload to S3
echo "Uploading to S3..."
aws s3 cp "$BACKUP_FILE" "$S3_PATH" \
  --storage-class STANDARD_IA \
  --metadata "database=ipoready,date=$DATE,env=production"

# 4. Verify upload
if aws s3 ls "$S3_PATH" > /dev/null; then
  echo "✓ Backup uploaded successfully"
  rm "$BACKUP_FILE"  # Remove local copy
else
  echo "✗ S3 upload failed - keeping local backup"
  exit 1
fi

# 5. Clean up old backups (keep 30 days)
aws s3 rm "$S3_BUCKET/daily" \
  --recursive \
  --exclude "*" \
  --include "*" \
  --older-than 30
```

Schedule via cron:
```bash
0 2 * * * /path/to/backup-script.sh 2>&1 | logger -t db-backup
```

### Restore from Neon Backup

**Option 1: Point-in-Time Recovery (Recommended)**

```bash
# 1. List available restore points
neonctl branches list --project-id $NEON_PROJECT_ID
# Shows: created_at (can restore to any point)

# 2. Create recovery branch (non-destructive)
neonctl branch create \
  --project-id $NEON_PROJECT_ID \
  --parent-id main \
  --branch-name recovery-$(date +%s) \
  --restore-timestamp "2026-06-06T14:30:00Z"

# 3. Verify recovery
RECOVERY_BRANCH="<branch-id>"
RECOVERY_URL=$(neonctl branches list --project-id $NEON_PROJECT_ID \
  --filter branch=$RECOVERY_BRANCH | jq -r '.url')

psql "$RECOVERY_URL" -c "SELECT COUNT(*) FROM users;"
# Should match count from before data loss

# 4. Promote recovery branch to main (if data verified)
neonctl branches update \
  --project-id $NEON_PROJECT_ID \
  --branch-id $RECOVERY_BRANCH \
  --set-as-primary

# 5. Delete old main branch
neonctl branches delete \
  --project-id $NEON_PROJECT_ID \
  --branch-id main

# 6. Verify application can connect
# Update DATABASE_URL if needed
# Restart application to pick up new connection

# 7. Monitor for issues
vercel logs --follow
```

**Option 2: Restore from S3 Backup**

```bash
# 1. Download backup from S3
S3_PATH="s3://ipoready-backups/daily/2026-06-06_14-30-00.sql.gz"
aws s3 cp "$S3_PATH" ./backup.sql.gz

# 2. Decompress
gunzip backup.sql.gz

# 3. Create new Neon branch for restore
neonctl branch create \
  --project-id $NEON_PROJECT_ID \
  --parent-id main \
  --branch-name restore-from-s3-$(date +%s)

# 4. Get branch connection URL
RESTORE_URL=$(neonctl branches list \
  --project-id $NEON_PROJECT_ID | grep restore | jq -r '.url')

# 5. Restore data
psql "$RESTORE_URL" < backup.sql

# 6. Verify
psql "$RESTORE_URL" -c "SELECT COUNT(*) FROM users;"

# 7. Switch application if verified
# Update DATABASE_URL
# Restart app
```

### Backup Verification

```bash
# Weekly backup test (run every Friday)

# 1. Download latest backup
LATEST=$(aws s3 ls s3://ipoready-backups/daily/ \
  --recursive | sort | tail -1 | awk '{print $NF}')
aws s3 cp "s3://ipoready-backups/$LATEST" ./test-backup.sql.gz

# 2. Extract
gunzip test-backup.sql.gz

# 3. Count tables
TABLE_COUNT=$(grep -c "^CREATE TABLE" test-backup.sql)
echo "Tables in backup: $TABLE_COUNT"
# Should match current production table count

# 4. Count records
ROW_COUNT=$(grep -c "^INSERT INTO" test-backup.sql)
echo "Estimated rows: $ROW_COUNT"

# 5. Verify integrity
# Check for any error messages
grep -i "error\|warning" test-backup.sql || echo "✓ No errors in backup"

# 6. Cleanup
rm test-backup.sql
```

---

## Performance Optimization

### Query Performance Analysis

```bash
# 1. Identify slow queries
psql "$DATABASE_URL" << 'EOF'
SELECT 
  query,
  calls,
  total_exec_time as total_ms,
  mean_exec_time as avg_ms,
  max_exec_time as max_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
  AND mean_exec_time > 100  -- Queries taking > 100ms average
ORDER BY mean_exec_time DESC
LIMIT 20;
EOF

# 2. Analyze execution plan
psql "$DATABASE_URL" << 'EOF'
EXPLAIN ANALYZE
SELECT u.id, u.email, c.name, COUNT(d.id) as docs
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN documents d ON c.id = d.company_id
GROUP BY u.id, c.id
LIMIT 100;
EOF

# 3. Look for sequential scans (bad) vs index scans (good)
# If seeing "Seq Scan", consider adding index

# 4. Check cost estimates
# If "rows=X" vastly differs from actual rows, run ANALYZE
```

### Index Management

```bash
# List all indices
psql "$DATABASE_URL" << 'EOF'
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
EOF

# Create new index (non-blocking)
psql "$DATABASE_URL" << 'EOF'
CREATE INDEX CONCURRENTLY idx_users_company_id 
ON users(company_id);
EOF

# Monitor index creation
psql "$DATABASE_URL" -c "
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;"

# Drop unused index (if scans = 0)
DROP INDEX CONCURRENTLY idx_unused_index;

# Rebuild index (if bloated)
REINDEX INDEX CONCURRENTLY idx_companies_status;
```

### Table Bloat Analysis

```bash
psql "$DATABASE_URL" << 'EOF'
SELECT 
  schemaname, 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
  n_live_tup,
  n_dead_tup,
  ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
EOF

# If dead_ratio > 20%, run VACUUM FULL
VACUUM FULL documents;  # This locks the table, schedule during maintenance window
```

---

## Scaling Operations

### Monitor Current Capacity

```bash
# Connection pool utilization
psql "$DATABASE_URL" << 'EOF'
SELECT 
  state,
  count(*),
  max(EXTRACT(EPOCH FROM (now()-state_change))) as max_age_seconds
FROM pg_stat_activity
GROUP BY state
ORDER BY count DESC;
EOF

# Compute utilization (from Neon dashboard)
neonctl projects describe-project --project-id $NEON_PROJECT_ID | jq '.compute'

# Database size growth
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### Scale Database Compute

```bash
# Current configuration
neonctl projects describe-project --project-id $NEON_PROJECT_ID

# Increase compute units (if needed)
neonctl projects update-compute-endpoint \
  --project-id $NEON_PROJECT_ID \
  --endpoint-id <endpoint-id> \
  --compute-units 4  # Increase from default (e.g., 2 → 4)

# Monitor impact
# 1. Check connection pool after scaling
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Monitor query latency
psql "$DATABASE_URL" << 'EOF'
SELECT mean_exec_time FROM pg_stat_statements LIMIT 1;
EOF

# 3. Verify application stability
curl https://www.ipoready.ai/api/health
```

### Connection Pool Optimization

```bash
# View pool configuration
# Currently using Neon's built-in PgBouncer pooling

# Connection string uses:
# postgresql://user:password@host/database?sslmode=require

# For monitoring connections
psql "$DATABASE_URL" << 'EOF'
SELECT 
  datname as database,
  usename as user,
  application_name,
  state,
  count(*) as connections,
  max(EXTRACT(EPOCH FROM (now()-state_change))) as age_seconds
FROM pg_stat_activity
GROUP BY datname, usename, application_name, state
ORDER BY connections DESC;
EOF

# If pool saturation:
# 1. Increase Neon compute (adds more connection slots)
# 2. Add connection pooling in application
# 3. Reduce long-running queries (see Performance section)
```

---

## Migration Operations

### Pre-Migration Checklist

```bash
# 1. Backup database
pg_dump "$DATABASE_URL" | gzip > pre-migration-backup.sql.gz
echo "✓ Backup created"

# 2. Review migration SQL
cat migrations/XXX_migration.sql
# Check for safety: IF NOT EXISTS clauses, reversibility

# 3. Test on copy (optional but recommended)
neonctl branch create \
  --parent-id main \
  --branch-name test-migration-$(date +%s)

# 4. Estimate impact
psql "$DATABASE_URL" << 'EOF'
SELECT 
  schemaname, 
  tablename, 
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
EOF
# Migration on large tables may take time

# 5. Identify maintenance window
# Scheduled downtime: [date/time]
# Expected duration: [estimate from test migration]

# 6. Prepare rollback script
cat migrations/XXX_migration.sql | \
  grep "^CREATE\|^ALTER" | \
  sed 's/CREATE/DROP/; s/ALTER.*ADD/ALTER TABLE ... DROP/' \
  > rollback_XXX.sql
```

### Execute Migration

```bash
# 1. Stop application (if necessary)
# For non-blocking migrations (add column, create table), not needed
# For blocking migrations (drop column, rename), may need brief downtime
vercel env add MAINTENANCE_MODE true

# 2. Create application backup
pg_dump "$DATABASE_URL" | gzip > backup_before_migration_$(date +%s).sql.gz

# 3. Run migrations
npm run db:migrate
# Output should show ✅ for each new migration

# 4. Verify success
psql "$DATABASE_URL" << 'EOF'
SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 5;
EOF

# 5. Validate data integrity
psql "$DATABASE_URL" << 'EOF'
-- Check for NULL in newly NOT NULL columns
SELECT COUNT(*) FROM users WHERE email IS NULL;  -- Should be 0

-- Verify counts haven't changed dramatically
SELECT COUNT(*) FROM users;
EOF

# 6. Resume application
vercel env rm MAINTENANCE_MODE

# 7. Monitor for issues (24 hours)
# Watch error rates, query performance
```

### Rollback Migration

```bash
# Only if migration caused issues

# 1. Stop application
vercel env add MAINTENANCE_MODE true

# 2. Get migration status
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at DESC;"

# 3. Execute rollback script
psql "$DATABASE_URL" < rollback_XXX.sql

# 4. Delete migration record
psql "$DATABASE_URL" -c "DELETE FROM migrations WHERE name = 'XXX_migration.sql';"

# 5. Restore from backup if needed
# See Backup & Recovery section

# 6. Resume application
vercel env rm MAINTENANCE_MODE

# 7. Fix migration file
# Edit migrations/XXX_migration.sql

# 8. Re-deploy
git push origin main
```

---

## Monitoring & Alerting

### Query Monitoring

```bash
# 1. Enable query logging
psql "$DATABASE_URL" << 'EOF'
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1 second
SELECT pg_reload_conf();
EOF

# 2. View recent slow queries
psql "$DATABASE_URL" << 'EOF'
SELECT 
  query,
  calls,
  mean_exec_time as avg_ms,
  max_exec_time as max_ms
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
EOF
```

### Set Up Alerts

```bash
# Example: Alert if active connections > 150
psql "$DATABASE_URL" << 'EOF'
-- Check current connections
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';
EOF

# Create monitoring script
cat > scripts/monitor-connections.sh << 'EOF'
#!/bin/bash
ACTIVE=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state='active';")
if [ $ACTIVE -gt 150 ]; then
  echo "ALERT: Active connections = $ACTIVE"
  # Send alert to Slack, PagerDuty, etc.
  curl -X POST $SLACK_WEBHOOK -d "{\"text\": \"DB Alert: $ACTIVE active connections\"}"
fi
EOF

# Schedule every 5 minutes
*/5 * * * * /path/to/monitor-connections.sh
```

### Dashboard Metrics

**Key metrics to track:**
- Query latency (p50, p95, p99)
- Connection count (active, idle, total)
- Database size (growth rate)
- Index usage (scans, cache hits)
- Table bloat (dead tuples ratio)

Monitor via:
- Neon Console: https://console.neon.tech
- Vercel Dashboard: https://vercel.com/dashboard/ipoready
- Custom Grafana/DataDog dashboard (optional)

---

## Emergency Procedures

### Database Won't Connect

```bash
# Symptom: "connect ECONNREFUSED" or "timeout"

# 1. Check Neon compute is running
neonctl projects describe-project --project-id $NEON_PROJECT_ID | jq '.compute'
# Should show: "running"

# 2. If compute is down, restart
neonctl projects update-compute-endpoint \
  --project-id $NEON_PROJECT_ID \
  --endpoint-id <endpoint-id>
# This restarts the compute in ~30 seconds

# 3. Verify connection
psql "$DATABASE_URL" -c "SELECT 1;"

# 4. If still failing, check connection string
echo "$DATABASE_URL"
# Should be: postgresql://user:password@host.neon.tech/db?sslmode=require

# 5. If connection string is wrong, update DATABASE_URL in Vercel
vercel env add DATABASE_URL "postgresql://..."

# 6. Restart application
vercel deploy --prod --env DATABASE_URL="postgresql://..."
```

### Connection Pool Exhausted

```bash
# Symptom: "remaining connection slots reserved for non-replication superuser"

# 1. Check active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"
# If >= 200: pool is exhausted

# 2. Kill idle connections
psql "$DATABASE_URL" << 'EOF'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < now() - interval '10 minutes';
EOF

# 3. If still failing, kill all application connections
# This is destructive - use only in emergency
psql "$DATABASE_URL" << 'EOF'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE usename != 'postgres'
  AND pid != pg_backend_pid();
EOF

# 4. Scale Neon compute
neonctl projects update-compute-endpoint \
  --project-id $NEON_PROJECT_ID \
  --compute-units 8  # Increase pool size

# 5. Restart application
vercel redeploy <deployment-id>
```

### Data Corruption Detected

```bash
# 1. STOP: Don't write any more data
# Set application to read-only mode
vercel env add READ_ONLY_MODE true

# 2. Identify scope of corruption
psql "$DATABASE_URL" << 'EOF'
SELECT * FROM users WHERE email IS NULL AND email IS NOT NULL;
-- Or check for orphaned foreign keys
SELECT * FROM documents WHERE company_id NOT IN (SELECT id FROM companies);
EOF

# 3. Try automatic repair (if minor)
VACUUM ANALYZE;
REINDEX DATABASE ipoready;

# 4. If repair fails, restore from backup
# See Backup & Recovery section

# 5. Re-enable writes only after verification
vercel env rm READ_ONLY_MODE
```

### Disk Space Critical

```bash
# 1. Check disk usage
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# 2. Identify largest tables
psql "$DATABASE_URL" << 'EOF'
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
EOF

# 3. Archive old data (if applicable)
-- Move records older than 1 year to archive table
INSERT INTO documents_archive SELECT * FROM documents WHERE created_at < now() - interval '1 year';
DELETE FROM documents WHERE created_at < now() - interval '1 year';
VACUUM ANALYZE documents;

# 4. Upgrade Neon storage (if needed)
# Contact Neon support or upgrade plan

# 5. Monitor recovery
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

---

## Index Management

### Create New Index

```bash
# 1. Identify slow query
EXPLAIN ANALYZE SELECT * FROM users WHERE company_id = 123;
-- Should show Seq Scan (slow) instead of Index Scan (fast)

# 2. Create index (non-blocking)
CREATE INDEX CONCURRENTLY idx_users_company_id ON users(company_id);

# 3. Monitor creation
SELECT schemaname, tablename, indexname FROM pg_stat_user_indexes 
WHERE indexname = 'idx_users_company_id';

# 4. Verify improvement
EXPLAIN ANALYZE SELECT * FROM users WHERE company_id = 123;
-- Should now show Index Scan

# 5. If index doesn't help, drop it
DROP INDEX CONCURRENTLY idx_users_company_id;
```

### Rebuild Index

```bash
# When index is bloated (inefficient)

# 1. Identify bloated indices
psql "$DATABASE_URL" << 'EOF'
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
EOF

# 2. Rebuild index
REINDEX INDEX CONCURRENTLY idx_users_company_id;

# 3. Verify index health
EXPLAIN ANALYZE SELECT * FROM users WHERE company_id = 123;
```

---

## Disk Space Management

### Monitor Disk Usage

```bash
# Database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Per-table breakdown
psql "$DATABASE_URL" << 'EOF'
SELECT 
  schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  n_live_tup
FROM pg_tables
NATURAL LEFT JOIN pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF
```

### Archive Old Data

```bash
# 1. Create archive table
CREATE TABLE documents_archive AS SELECT * FROM documents WHERE 1=0;

# 2. Move old records
INSERT INTO documents_archive 
SELECT * FROM documents 
WHERE created_at < now() - interval '1 year';

# 3. Delete from main table
DELETE FROM documents WHERE created_at < now() - interval '1 year';

# 4. Vacuum to reclaim space
VACUUM ANALYZE documents;

# 5. Verify space recovered
SELECT pg_size_pretty(pg_database_size(current_database()));
```

---

## Connection Pool Management

### Monitor Connection Health

```bash
psql "$DATABASE_URL" << 'EOF'
SELECT 
  application_name,
  usename,
  state,
  count(*) as count,
  max(EXTRACT(EPOCH FROM (now()-query_start))/60) as max_query_mins
FROM pg_stat_activity
GROUP BY application_name, usename, state
ORDER BY count DESC;
EOF
```

### Kill Long-Running Queries

```bash
# Identify queries running > 5 minutes
psql "$DATABASE_URL" << 'EOF'
SELECT pid, usename, query, EXTRACT(EPOCH FROM (now()-query_start))/60 as mins
FROM pg_stat_activity
WHERE state != 'idle'
  AND query_start < now() - interval '5 minutes'
ORDER BY query_start;
EOF

# Kill specific query
SELECT pg_terminate_backend(12345);  -- Replace 12345 with PID

# Kill all idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND pid != pg_backend_pid();
```

---

## Scheduled Jobs

### Weekly Maintenance Job

```bash
#!/bin/bash
# /usr/local/bin/db-maintenance.sh

set -e

LOG_FILE="/var/log/db-maintenance.log"
echo "[$(date)] Starting database maintenance" >> $LOG_FILE

# 1. Analyze
echo "[$(date)] Running ANALYZE..." >> $LOG_FILE
psql "$DATABASE_URL" -c "ANALYZE;" >> $LOG_FILE

# 2. Vacuum
echo "[$(date)] Running VACUUM..." >> $LOG_FILE
psql "$DATABASE_URL" -c "VACUUM ANALYZE;" >> $LOG_FILE

# 3. Reindex (optional, monthly instead)
# psql "$DATABASE_URL" -c "REINDEX DATABASE CONCURRENTLY ipoready;"

# 4. Monitor connections
CONN_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_stat_activity;")
echo "[$(date)] Active connections: $CONN_COUNT" >> $LOG_FILE

# 5. Check disk space
DISK_USAGE=$(psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));")
echo "[$(date)] Database size: $DISK_USAGE" >> $LOG_FILE

echo "[$(date)] Maintenance completed" >> $LOG_FILE
```

Schedule in crontab:
```bash
0 3 * * 1 /usr/local/bin/db-maintenance.sh  # Every Monday at 3 AM
```

---

**Document Owner:** DevOps/DBA Team  
**Last Updated:** June 7, 2026  
**Review Schedule:** Quarterly  
**Escalation:** ops@ipoready.ai, #devops-alerts Slack channel
