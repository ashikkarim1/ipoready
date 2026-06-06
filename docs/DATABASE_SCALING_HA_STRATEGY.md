# IPOReady Database Scaling & High Availability Strategy

**Date:** June 7, 2026  
**Version:** 1.0  
**Status:** Active Deployment Strategy  
**Target Database:** Neon PostgreSQL (Serverless)  
**Current Load Profile:** MVP (10 pilot companies, monitored growth phase)

---

## Executive Summary

This document outlines a comprehensive strategy for scaling IPOReady's PostgreSQL database (Neon) from MVP to production-ready HA infrastructure. The strategy balances cost efficiency, performance, and reliability while accommodating projected growth from 10 pilot companies to multi-tenant enterprise deployment.

**Key Principles:**
- Start lightweight (Neon's serverless pooling), scale incrementally
- Monitor → Alert → Provision (trigger-based scaling)
- Zero data loss, minimal downtime maintenance
- Cost optimization for early-stage startup

---

## Part 1: Current State Assessment

### 1.1 Database Infrastructure

**Current Setup:**
```
Database: Neon PostgreSQL Serverless
Endpoint: ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech
Driver: @neondatabase/serverless (HTTP-based connection)
Region: us-east-1 (AWS)
Connection Mode: Pooler (PgBouncer-managed)
```

**Current Configuration:**
```typescript
// src/lib/db.ts
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL || '')
```

### 1.2 Current Performance Baselines

Based on `PERFORMANCE_IMPLEMENTATION_README.md`:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Avg Query Time | 250ms | 100-150ms | In optimization |
| Dashboard Load | 2.5s | < 1.5s | Phase 1-2 improvement |
| Query Count (Dashboard) | 60+ | < 15 | In progress |
| Concurrent Users | ~5-10 | 50-100+ | Current capacity |
| DB Size | ~500MB | Growth tracking | Monitor monthly |

### 1.3 Current Indexes (Post-Migration 004)

**Critical Performance Indexes Deployed:**
- `idx_tasks_company_status` (most critical)
- `idx_tasks_phase_priority`
- `idx_capital_companies_sector_market`
- `idx_financials_company_fiscal_compound`
- `idx_alerts_unread_by_investor`
- 10+ additional optimization indexes

**Status:** ✅ Migration 004 completed, indexes live

---

## Part 2: Scaling Tiers & Triggers

### 2.1 Tier 1: MVP Phase (Current) - 10-50 Concurrent Users

**Duration:** Now → June-September 2026 (3 months)

**Infrastructure:**
```
├─ Neon Compute Unit: Standard (2 vCPU)
├─ Storage: Autoscaling (currently ~500MB)
├─ Connection Pool: 100-300 connections (PgBouncer)
├─ Replication: None (single primary)
└─ Backup: Neon's 7-day PITR + daily snapshots
```

**Performance Targets:**
```
Max Connection Pool Size:     300
Typical Active Connections:   20-50
Avg Query Time:               < 200ms
P95 Query Time:               < 500ms
Transactions per Second:      10-50
Storage Growth Rate:          50-100MB/month
```

**Scaling Triggers (→ Tier 2):**
- [ ] Concurrent users exceed 50 consistently
- [ ] Database exceeds 2GB
- [ ] Query response time > 300ms consistently
- [ ] Connection pool exhaustion events

### 2.2 Tier 2: Growth Phase - 50-200 Concurrent Users

**Duration:** September 2026 → February 2027 (6 months)

**Triggers to Activate:**

**Trigger 1: Connection Pool Exhaustion**
```sql
-- Monitor in Neon dashboard or query
SELECT count(*) FROM pg_stat_activity 
WHERE state = 'active';

-- Alert if: count > 200 for > 5 minutes
```

**Trigger 2: Slow Query Detection**
```sql
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
WHERE mean_time > 300  -- 300ms threshold
ORDER BY mean_time DESC
LIMIT 10;
```

**Trigger 3: Storage Growth**
```sql
-- Check via Neon dashboard
-- Alert if: > 2GB or growth > 500MB/month

SELECT 
  pg_size_pretty(pg_database_size(current_database())) AS size
```

**Infrastructure Upgrade Path:**

Option A: **Scale Compute (Recommended)**
```
Upgrade from: Standard (2 vCPU)
Upgrade to:   Performance (4 vCPU + better CPU)
Cost Impact:  ~2-3x increase
Time to Deploy: < 1 hour (no downtime)
```

Option B: **Add Read Replica**
```
├─ Primary (write):    ep-plain-fire-aqxix340.c-8.us-east-1
├─ Read Replica 1:     ep-replica-1-fire-aqxix340.c-8.us-east-1
├─ Read Replica 2:     ep-replica-2-fire-aqxix340.c-8.us-east-1 (optional)
└─ Application Router: Route non-critical reads to replicas

Cost Impact:  +$50-100/month per replica
Setup Time:   1-2 hours
Benefits:    
  - 30-40% reduction in primary load
  - High availability for reads
```

**Recommended Approach for Tier 2:**
1. **Month 1-2:** Scale compute to Performance tier
2. **Month 3-4:** Implement read replicas if needed
3. **Month 5-6:** Evaluate connection pooling expansion

### 2.3 Tier 3: Enterprise Scale - 200+ Concurrent Users

**Duration:** February 2027+ (post-MVP verification)

**Infrastructure:**
```
├─ Primary (Write):        Performance+ (8+ vCPU)
├─ Read Replicas:          2-3 replicas across regions
├─ Connection Pooling:     Multi-tier (PgBouncer + app-level)
├─ Replication Strategy:   Synchronous + async
├─ Failover:               Automatic (RTO < 5min)
├─ Backup Strategy:        Incremental PITR + WAL archiving
├─ Monitoring:             Prometheus + Grafana
└─ Disaster Recovery:      Cross-region replica
```

**Scaling Decisions at This Level:**
- Consider managed PostgreSQL (AWS RDS, Azure DB, Google Cloud SQL)
- Evaluate partitioning strategy for large tables
- Implement caching layer (Redis)
- Separate analytical workloads

---

## Part 3: Connection Pooling Strategy

### 3.1 Current: Neon PgBouncer (Already Configured)

**How it Works:**
```
┌─────────────────────────────┐
│   Application (Node.js)     │
│   Connection Pool (Node)    │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│   Neon PgBouncer Pooler     │  ← Managed by Neon
│   (Connection Multiplexing) │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│   PostgreSQL Primary        │
└─────────────────────────────┘
```

**Current Configuration:**
```
Pool Size (Neon):     100-300 connections
Mode:                 Transaction mode (default)
Idle Timeout:         5 minutes
Connection Timeout:   30 seconds
```

**Monitoring:**
```sql
-- Check active connections in Neon pooler
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Expected: 20-50 during normal operation
-- Alert if: > 200 consistently
```

### 3.2 Application-Level Connection Pool (Enhancement)

**Why Add It:**
- Reduce connection churn
- Better resource utilization
- Failure isolation

**Implementation (Node.js):**

**Option A: pg (Node Postgres driver) - More Control**
```typescript
// src/lib/db-pool.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Max connections in pool
  min: 5,                     // Keep minimum 5 warm
  idleTimeoutMillis: 30000,   // 30 second idle timeout
  connectionTimeoutMillis: 2000,
})

export async function query<T = unknown>(
  sql: string,
  values?: unknown[]
): Promise<T[]> {
  const result = await pool.query(sql, values)
  return result.rows as T[]
}
```

**Option B: Use Neon's Native Pooling (Current, Recommended)**
```typescript
// Keep current implementation - Neon handles pooling
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || '', {
  fetchOptions: { cache: 'no-store' },
})

export { sql }
```

**Recommendation:** Keep Neon's pooler for MVP (it's optimized). Add app-level pooling if switching to non-pooled endpoint in Tier 2.

---

## Part 4: Read Replicas Strategy

### 4.1 When to Implement

**Implement Read Replicas when:**
- Primary database CPU utilization > 70% consistently
- Query response time > 300ms
- Concurrent read queries > 100
- Business-critical reporting needs don't block production

**For IPOReady MVP:** Not needed yet. Revisit in Tier 2.

### 4.2 Read Replica Architecture

**Setup (When Ready):**

```
┌─────────────────────────────────────────────────────────┐
│           Application (Next.js)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Router: sendToReadReplica(query, isCritical)   │  │
│  └──────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────┬────┘
         │                                          │
    Critical Writes                        Non-Critical Reads
         │                                          │
         ↓                                          ↓
   ┌──────────────┐                      ┌────────────────────┐
   │ Primary DB   │ ─ replicates ───→   │ Read Replica 1     │
   │ (write all)  │                      │ (read dashboard)   │
   └──────────────┘                      └────────────────────┘
         ↓
         ├──────────────────────────────────┐
         │                                  │
         ↓                                  ↓
      [Backup]              ┌─────────────────────────┐
      [PITR]                │ Read Replica 2 (opt)    │
                            │ (read reports)          │
                            └─────────────────────────┘
```

**Implementation in Code:**

```typescript
// src/lib/db-router.ts
import { neon } from '@neondatabase/serverless'

const primarySql = neon(process.env.DATABASE_URL_PRIMARY || '')
const readReplicaSql = neon(process.env.DATABASE_URL_REPLICA || '')

interface QueryConfig {
  criticalWrite?: boolean
  reportingQuery?: boolean
}

export async function query<T = unknown>(
  sql: string,
  values?: unknown[],
  config: QueryConfig = {}
): Promise<T[]> {
  // Route writes to primary
  if (config.criticalWrite) {
    return primarySql(sql, values) as Promise<T[]>
  }

  // Route reporting queries to replica
  if (config.reportingQuery) {
    try {
      return readReplicaSql(sql, values) as Promise<T[]>
    } catch (e) {
      // Fallback to primary if replica fails
      console.warn('Replica query failed, using primary:', e)
      return primarySql(sql, values) as Promise<T[]>
    }
  }

  // Default: use primary
  return primarySql(sql, values) as Promise<T[]>
}
```

**Critical vs. Non-Critical Queries:**

| Query Type | Route | Reason |
|-----------|-------|--------|
| **Writes** (INSERT/UPDATE/DELETE) | Primary | Must be authoritative |
| **Transactional Reads** | Primary | Reads in transactions |
| **Dashboard (tasks, alerts)** | Replica | Eventually consistent OK |
| **Reporting (financials, trends)** | Replica | Tolerate 1-2s lag |
| **User Auth** | Primary | Must be current |
| **Company lookup** | Replica | Read-heavy, cached |
| **Notifications** | Primary | Must be immediate |

### 4.3 Replication Lag Monitoring

**Monitor Replication Health:**

```sql
-- On Replica: Check lag behind primary
SELECT
  slot_name,
  restart_lsn,
  confirmed_flush_lsn,
  write_lag,
  flush_lag,
  replay_lag
FROM pg_replication_slots;

-- Expected: < 100ms lag
-- Alert if: > 1 second
```

**Handle Replication Lag:**

```typescript
// Graceful degradation for read-replica lag
export async function queryWithFallback<T = unknown>(
  sqlStr: string,
  values: unknown[],
  maxReplicationLag: number = 1000 // 1 second
): Promise<T[]> {
  const startTime = Date.now()
  
  try {
    // Try replica first
    const result = await readReplicaSql(sqlStr, values)
    return result as T[]
  } catch (e) {
    // Check if it's a lag issue or true failure
    const elapsed = Date.now() - startTime
    
    if (elapsed > maxReplicationLag) {
      // Likely a lag issue, use primary
      return primarySql(sqlStr, values) as Promise<T[]>
    }
    
    // Other error, propagate
    throw e
  }
}
```

---

## Part 5: Index Optimization (Ongoing)

### 5.1 Current Index Status

**✅ Migration 004 Deployed (June 6, 2026)**

All critical indexes are live:

```sql
-- Verify indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('tasks', 'capital_companies', 'company_financials', 'investor_alerts')
ORDER BY tablename;
```

Expected output:
```
idx_tasks_company_status
idx_tasks_phase_priority
idx_capital_companies_sector_market
idx_financials_company_fiscal_compound
idx_alerts_unread_by_investor
... (10+ total)
```

### 5.2 Index Health Monitoring

**Monthly Index Audit:**

```sql
-- Find unused indexes (candidates for removal)
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Never used
AND indexname NOT LIKE 'pg_toast%'
ORDER BY tablename;
```

**Quarterly Index Bloat Check:**

```sql
-- Estimate index bloat
SELECT
  schemaname,
  tablename,
  indexname,
  ROUND(100.0 * (CASE WHEN otta > 0 THEN sml.relpages - otta ELSE 0 END) / sml.relpages) AS bloat_ratio
FROM (
  SELECT
    schemaname,
    tablename,
    indexname,
    sml.relpages,
    CEIL((cc + ma - (pagesz - pagic) * ma / cc) / (pagesz - pagic)) AS otta
  FROM pg_indexes i
  JOIN pg_class c ON c.relname = i.indexname
  JOIN pg_stat_user_indexes su ON su.indexrelname = i.indexname
) t
JOIN pg_class sml ON sml.relname = t.tablename
WHERE bloat_ratio > 20;  -- Flag indexes with > 20% bloat
```

**Action:** Reindex bloated indexes during maintenance windows

```sql
REINDEX INDEX CONCURRENTLY idx_tasks_company_status;  -- No locks
```

### 5.3 Future Index Planning

**Potential future indexes (monitor before adding):**

```sql
-- Directors/officers searches (if table grows)
CREATE INDEX IF NOT EXISTS idx_professionals_company_verification
ON professionals(company_id, verification_status);

-- Bulk export optimization
CREATE INDEX IF NOT EXISTS idx_unified_docs_export
ON unified_documents(company_id, status, created_at DESC);

-- Compliance checking
CREATE INDEX IF NOT EXISTS idx_compliance_checks_company_phase
ON compliance_checks(company_id, phase, status);
```

---

## Part 6: Query Optimization (Ongoing)

### 6.1 N+1 Query Prevention

**Status:** In-progress (PERFORMANCE_IMPLEMENTATION_README.md)

**Files to Fix (Priority):**

| File | Issue | Fix | ETA |
|------|-------|-----|-----|
| `auto-populate-from-linkedin` | 1 query per director | Batch update | June 2026 |
| `check-compliance` | 1 query per check | WHERE IN clause | June 2026 |
| `get-prospectus-section` | 1 query per section | Single fetch | June 2026 |
| `documents/relationships/initialize` | 1 query per relation | Batch insert | June 2026 |
| `prospectus/extract` | 1 query per extraction | JOIN or subquery | June 2026 |

**Template for Detection:**

```typescript
// ❌ N+1 Anti-pattern
const companies = await sql`SELECT id FROM companies`
for (const company of companies) {
  const tasks = await sql`SELECT * FROM tasks WHERE company_id = ${company.id}`
  // Process...
}

// ✅ Correct Pattern
const data = await sql`
  SELECT c.id, c.name, t.id as task_id, t.title
  FROM companies c
  LEFT JOIN tasks t ON c.id = t.company_id
  WHERE c.active = true
`
const grouped = groupBy(data, 'id')  // Post-process in app
```

### 6.2 Slow Query Log Monitoring

**Enable Slow Query Logging in Neon:**

```sql
-- Neon doesn't expose slow query log directly, use pg_stat_statements instead
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slowest queries
SELECT query, calls, mean_time, max_time, stddev_time
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries slower than 100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Reset stats monthly
SELECT pg_stat_statements_reset();
```

**Analyze Slow Queries:**

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM tasks
WHERE company_id = '...' AND status = 'active'
ORDER BY created_at DESC;

-- Check for:
-- - Seq Scan (bad, use index)
-- - High buffer hits
-- - Slow startup time
```

---

## Part 7: Backup & Disaster Recovery

### 7.1 Current Backup Strategy

**Neon Native Backup (Included):**
```
├─ Point-in-Time Recovery:  7 days
├─ Automated Backups:       Daily
├─ Retention:               7 days
└─ Region:                  Same region as primary
```

**Status:** ✅ Enabled by default in Neon

### 7.2 Additional Backup Recommendations

**For Critical Data (Tier 2+):**

```bash
# Daily backup to S3 (script)
# src/scripts/backup-to-s3.sh

#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ipoready_backup_${TIMESTAMP}.sql"

# Dump database
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE.gz"

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" \
  "s3://ipoready-backups/daily/${TIMESTAMP}/" \
  --sse AES256

# Keep local backups for 3 days
find . -name "ipoready_backup_*.sql.gz" -mtime +3 -delete
```

**Deploy as Cron Job:**
```bash
# 0 2 * * * /path/to/backup-to-s3.sh
# Runs daily at 2 AM UTC
```

### 7.3 Recovery Procedures

**RTO/RPO Targets:**

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| Single query failure | < 1s | 0 | Retry with primary |
| Table corruption | < 1 hour | 24h | Restore from Neon PITR |
| Complete data loss | < 4 hours | 24h | Restore from S3 backup |
| Region failure | < 30 min | 1h | Promote replica or restore |

**Test Recovery Monthly:**
```bash
# 1. Create test database from backup
# 2. Verify data integrity
# 3. Test application connection
# 4. Document findings
# 5. Update runbooks
```

---

## Part 8: Scaling Metrics & Monitoring

### 8.1 Key Metrics to Monitor

**Database Health Metrics:**

```sql
-- Connection Usage
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Expected: < 50
-- Alert: > 200

-- Query Performance
SELECT 
  mean_time as avg_ms,
  max_time as max_ms,
  calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 5;

-- Expected: mean < 200ms
-- Alert: > 500ms

-- Cache Hit Ratio
SELECT
  sum(blks_hit)::float / (sum(blks_hit) + sum(blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Expected: > 99%
-- Alert: < 95%

-- Table Size
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Monitor monthly growth

-- Index Effectiveness
SELECT
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_returned
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 8.2 Monitoring Dashboard Setup

**Tool: DataGrip (JetBrains) - Already in Use**
- Real-time query editor with execution plans
- Schema inspection
- Performance statistics

**Recommended: Neon Dashboard**
- Usage statistics
- Query insights
- Connection monitoring
- Storage metrics

**Future: Prometheus + Grafana**
```yaml
# prometheus.yml (for Tier 2+)
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'postgresql'
    static_configs:
      - targets: ['localhost:9187']  # postgres_exporter
```

### 8.3 Alert Thresholds

**Set Up Alerts For:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Active Connections | > 200 | Page on-call engineer |
| Avg Query Time | > 300ms | Investigate slow queries |
| Cache Hit Ratio | < 95% | Review indexes |
| Storage Growth | > 2GB | Plan scaling |
| Replication Lag | > 1s | Route to primary only |
| Connection Pool | > 90% utilization | Add compute or replicas |
| Disk Usage | > 80% | Increase storage |

---

## Part 9: Implementation Roadmap

### Phase 1: MVP Foundation (Now - June 30, 2026) ✅

**Completed:**
- [x] Migration 004: Performance indexes deployed
- [x] N+1 query fixes in progress
- [x] Cache header implementation
- [x] Neon pooler configured

**In Progress:**
- [ ] Complete all N+1 query fixes (5 files)
- [ ] Comprehensive performance testing
- [ ] Baseline metrics collection

**Success Criteria:**
- Dashboard load < 1.5s
- Query response < 200ms average
- Zero connection pool exhaustion events

### Phase 2: Growth Preparation (July - September 2026)

**Planned:**
- [ ] Implement application-level connection pooling
- [ ] Set up read replica infrastructure
- [ ] Deploy monitoring/alerting system
- [ ] Complete disaster recovery runbooks

**Trigger:** 50+ concurrent users or primary DB CPU > 70%

### Phase 3: Enterprise Scale (October 2026+)

**Planned:**
- [ ] Multi-region read replicas
- [ ] Cross-region failover
- [ ] Sharding/partitioning strategy
- [ ] Dedicated connection pool service

---

## Part 10: Cost Optimization

### 10.1 Current Costs (Neon)

```
Standard Tier Compute:     $15/month
Storage (autoscaling):     $0.40/GB/month (~$200/month @ 500GB)
Data Transfer Out:         Free (first 2GB/month)
Branching Feature:         Included
Point-in-Time Recovery:    Included (7 days)

Total: ~$215/month (baseline, scales with storage)
```

### 10.2 Cost at Each Tier

| Tier | Compute | Replicas | Est. Cost | Timeline |
|------|---------|----------|-----------|----------|
| **Tier 1 (MVP)** | Standard | 0 | $250-400 | Now - Q3 2026 |
| **Tier 2 (Growth)** | Performance | 1-2 | $600-1000 | Q3 2026 - Q1 2027 |
| **Tier 3 (Enterprise)** | Performance+ | 3+ | $1500-3000+ | Q1 2027+ |

### 10.3 Cost Optimization Strategies

**Reduce Unnecessary Queries:**
```typescript
// Before: Query on every page load
const data = await sql`SELECT * FROM expensive_table`

// After: Cache for 5 minutes
const cacheKey = 'expensive-data'
const cached = await cache.get(cacheKey)
if (!cached) {
  const data = await sql`SELECT * FROM expensive_table`
  await cache.set(cacheKey, data, 300)
}
```

**Remove Unused Indexes:**
```sql
-- Identify indexes with zero scans
SELECT indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;

-- Drop if confirmed not needed
DROP INDEX IF EXISTS unused_index;
```

**Archive Old Data:**
```sql
-- Move completed tasks older than 1 year to archive table
INSERT INTO tasks_archive
SELECT * FROM tasks
WHERE completed_at < NOW() - INTERVAL '1 year'
AND status = 'completed';

DELETE FROM tasks
WHERE completed_at < NOW() - INTERVAL '1 year'
AND status = 'completed';
```

---

## Part 11: Migration Runbooks

### 11.1 Compute Tier Upgrade (Tier 1 → Tier 2)

**Estimated Downtime:** < 5 minutes

```bash
# 1. Notify users
echo "Scheduled maintenance: 2:00-2:05 AM UTC"

# 2. In Neon Dashboard:
#    - Go to Project Settings → Compute
#    - Select "Performance" tier
#    - Schedule upgrade for off-peak time

# 3. Monitor during upgrade
#    - Watch connection metrics
#    - Check application logs
#    - Monitor query response times

# 4. Verify upgrade
psql $DATABASE_URL -c "SELECT * FROM pg_settings WHERE name = 'max_connections';"

# 5. Update documentation
#    - Note upgrade date/time
#    - Record before/after metrics
```

### 11.2 Add Read Replica

**Estimated Setup Time:** 1-2 hours

```bash
# 1. Create replica in Neon Dashboard
#    - Project → Branches
#    - Create branch from main (keeps data in sync)
#    - Configure as replica endpoint

# 2. Update environment variables
#    DATABASE_URL_PRIMARY=postgresql://...pooler.c-8.us-east-1...
#    DATABASE_URL_REPLICA=postgresql://...replica.c-8.us-east-1...

# 3. Update db router
#    cp src/lib/db.ts src/lib/db-router.ts
#    Implement query routing logic (see Part 4.2)

# 4. Test replica
#    - Run SELECT queries on replica
#    - Verify replication lag < 100ms
#    - Test failover scenario

# 5. Deploy code changes
#    git commit -m "feat: Add read replica routing"
#    git push && await CI/CD

# 6. Monitor replication lag for 24 hours
#    SELECT replay_lag FROM pg_stat_replication;
```

### 11.3 Emergency Failover to Replica

**When to Execute:** Primary database unavailable

```bash
# 1. Confirm primary is down
curl -i https://your-app/api/health

# 2. Switch all traffic to replica
#    In src/lib/db-router.ts:
#    const sql = readReplicaSql  # Temporary override

# 3. Set replica to read-write
#    SELECT pg_wal_replay_resume();  # Stop following primary

# 4. Update DNS/load balancer
#    Point DATABASE_URL_PRIMARY to replica endpoint

# 5. Notify team
#    Post incident: "Failover completed to replica"

# 6. Investigate primary failure
#    Check Neon monitoring logs

# 7. Restore from backup if needed
#    Recreate primary from Neon PITR
```

---

## Part 12: Testing & Validation

### 12.1 Load Testing Script

```bash
# scripts/load-test.sh
#!/bin/bash

# Install load testing tool
npm install -g artillery

# Create test plan
cat > load-test.yml << EOF
config:
  target: "https://your-app"
  phases:
    - duration: 60
      arrivalRate: 10    # 10 requests/second
    - duration: 120
      arrivalRate: 20    # Ramp up to 20
    - duration: 60
      arrivalRate: 10    # Cool down

scenarios:
  - name: "Dashboard Load"
    flow:
      - get:
          url: "/api/dashboard"
      - get:
          url: "/api/tasks"
      - get:
          url: "/api/alerts"
EOF

# Run test
artillery run load-test.yml
```

### 12.2 Query Performance Test

```bash
# scripts/query-performance-test.sh
#!/bin/bash

# Test before and after optimization
DATABASE_URL=$1

psql $DATABASE_URL << SQL
-- Warm up caches
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM companies;

-- Measure common queries
\timing on

SELECT COUNT(*) FROM tasks 
WHERE company_id = '...' AND status = 'active';

SELECT c.id, c.name, COUNT(t.id) as task_count
FROM companies c
LEFT JOIN tasks t ON c.id = t.company_id
GROUP BY c.id
ORDER BY task_count DESC;

\timing off
SQL
```

### 12.3 Replication Lag Test

```sql
-- Verify replication lag is acceptable
SELECT
  now() - pg_last_wal_receive_lsn() as wal_receive_lag,
  now() - pg_last_wal_replay_lsn() as wal_replay_lag;

-- Should be < 100ms in normal operation
```

---

## Part 13: Troubleshooting Guide

### Problem 1: High Query Latency

**Symptoms:**
- Dashboard takes > 2 seconds to load
- API responses > 500ms

**Diagnosis:**
```sql
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
WHERE mean_time > 300
ORDER BY mean_time DESC
LIMIT 10;
```

**Solutions:**
1. Add index on slow query columns
2. Refactor N+1 query pattern
3. Increase cache TTL
4. Scale compute tier

### Problem 2: Connection Pool Exhaustion

**Symptoms:**
- "too many connections" errors
- New requests hang/timeout

**Diagnosis:**
```sql
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
SELECT * FROM pg_stat_activity WHERE state != 'idle';
```

**Solutions:**
1. Reduce pool size in idle connections
2. Add application-level pooling
3. Upgrade compute tier
4. Add read replicas to distribute load

### Problem 3: Replication Lag

**Symptoms:**
- Stale data read from replica
- Replication lag > 1 second

**Diagnosis:**
```sql
SELECT slot_name, replay_lag FROM pg_replication_slots;
SELECT pid, usename, application_name FROM pg_stat_replication;
```

**Solutions:**
1. Upgrade replica compute
2. Review write load on primary
3. Reduce number of write transactions
4. Route more queries to primary temporarily

### Problem 4: Disk Space Issues

**Symptoms:**
- "Disk full" errors
- Storage exceeds quota

**Diagnosis:**
```sql
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

**Solutions:**
1. Archive old data (completed tasks, old logs)
2. Vacuum and analyze: `VACUUM ANALYZE;`
3. Drop unused indexes
4. Increase storage quota in Neon

---

## Part 14: Team Runbooks & Checklists

### 14.1 Weekly Database Health Check

**Owner:** Database Administrator / DevOps  
**Time:** 15 minutes  
**Frequency:** Every Monday morning

```markdown
- [ ] Check connection count: SELECT count(*) FROM pg_stat_activity;
- [ ] Review slow queries: SELECT * FROM pg_stat_statements WHERE mean_time > 100;
- [ ] Verify replication lag (if active): SELECT replay_lag FROM pg_replication_slots;
- [ ] Check storage usage: SELECT pg_database_size(current_database());
- [ ] Review any error logs from application
- [ ] Document findings in #database-monitoring Slack
```

### 14.2 Monthly Performance Review

**Owner:** Engineering Lead  
**Time:** 1 hour  
**Frequency:** Last Friday of month

```markdown
- [ ] Compare metrics vs. baselines from PERFORMANCE_IMPLEMENTATION_README.md
- [ ] Review index bloat: REINDEX any > 20% bloat
- [ ] Analyze new slow queries (identify optimization opportunities)
- [ ] Review application logs for database errors
- [ ] Test backup restoration (disaster recovery drill)
- [ ] Update scaling metrics and projections
- [ ] Schedule scaling if thresholds approaching
```

### 14.3 Quarterly Disaster Recovery Drill

**Owner:** DevOps / Database Administrator  
**Time:** 2-3 hours  
**Frequency:** Every 3 months

```markdown
- [ ] Document current RTO/RPO targets
- [ ] Create test environment from Neon backup
- [ ] Restore application pointing to test database
- [ ] Verify all critical features work
- [ ] Measure actual recovery time
- [ ] Update runbooks with findings
- [ ] Report results to stakeholders
```

---

## Part 15: Dependencies & Tools

### 15.1 Required Tools

| Tool | Purpose | Status |
|------|---------|--------|
| Neon Dashboard | Monitor database metrics | ✅ Active |
| DataGrip | SQL development & analysis | ✅ In use |
| Artillery | Load testing | ⭕ To install |
| pg_stat_statements | Query analysis | ✅ Can enable |
| pgAdmin (optional) | Visual management | ⭕ Optional |

### 15.2 Neon-Specific Features

```typescript
// Neon SDK provides these features out-of-box
import { neon } from '@neondatabase/serverless'

// ✅ HTTP-based connections (serverless)
// ✅ Connection pooling (PgBouncer managed)
// ✅ Branching (for dev/test)
// ✅ Point-in-Time Recovery (7 days)
// ✅ Autoscaling storage
// ✅ IP allowlisting
// ✅ WAL safekeeping (no data loss)
```

---

## Part 16: Success Criteria & SLOs

### 16.1 Service Level Objectives

**Tier 1 (MVP):**
```
Availability:       99.5% (< 3.6 hours downtime/month)
Response Time P95:  < 500ms
Query Performance:  < 200ms average
Connection Pool:    < 50% utilization
Backup RPO:         24 hours
Backup RTO:         4 hours
```

**Tier 2 (Growth):**
```
Availability:       99.9% (< 43 minutes downtime/month)
Response Time P95:  < 300ms
Query Performance:  < 150ms average
Connection Pool:    < 70% utilization
Backup RPO:         1 hour
Backup RTO:         < 30 minutes
```

**Tier 3 (Enterprise):**
```
Availability:       99.99% (< 4 minutes downtime/month)
Response Time P95:  < 200ms
Query Performance:  < 100ms average
Connection Pool:    < 60% utilization
Backup RPO:         15 minutes
Backup RTO:         < 5 minutes
```

### 16.2 Verification Steps

**Monthly SLO Review:**

```bash
# 1. Collect metrics from logs
grep "response_time" app.log | \
  awk '{sum+=$NF; count++} END {print "Avg: " sum/count}'

# 2. Check uptime
# Use monitoring service dashboard

# 3. Verify backups completed
ls -la backups/ | grep $(date +%Y-%m-%d)

# 4. Test failover capability
# Execute disaster recovery drill

# 5. Document compliance
# Update SLO compliance report
```

---

## Part 17: Future Enhancements

### 17.1 Post-MVP Evaluation (Q1 2027)

**Assess:**
- [ ] Neon vs. managed PostgreSQL (RDS, Cloud SQL)
- [ ] Sharding strategy for multi-tenant scaling
- [ ] Caching layer (Redis) for frequently accessed data
- [ ] Analytical database (separate OLAP system)
- [ ] Event streaming (Kafka) for real-time sync
- [ ] Search engine (Elasticsearch) for full-text search

### 17.2 Technology Upgrade Path

**Potential Migrations:**

Option A: Stay with Neon
```
Pros: Serverless, managed, cost-effective for moderate scale
Cons: Limited to single region, less control for >500 concurrent users
Best For: SaaS businesses up to $10M ARR
```

Option B: Migrate to AWS RDS
```
Pros: More control, multi-AZ failover, broader tool ecosystem
Cons: Higher operational overhead, more expensive
Best For: >500 concurrent users, mission-critical availability
```

Option C: Migrate to PlanetScale (MySQL)
```
Pros: Sharding built-in, serverless alternative
Cons: MySQL ecosystem, different query patterns
Best For: Extreme scale (1000+ concurrent users)
```

**Recommendation:** Stay with Neon through Q2 2027, then evaluate based on actual usage patterns.

---

## Summary & Quick Reference

### Scaling Decision Tree

```
Is concurrent user count > 50?
├─ No  → Stay in Tier 1, continue monitoring
└─ Yes → Move to Tier 2
         │
         Upgrade compute to Performance tier
         │
         Is response time still > 300ms?
         ├─ No  → Add read replicas (if needed)
         └─ Yes → Add read replicas + increase compute
                  │
                  Still slow?
                  ├─ No  → Monitor for Tier 3 triggers
                  └─ Yes → Investigate N+1 queries or missing indexes
```

### Key Metrics Dashboard (Weekly Review)

```
Metric                    Target          Current    Status
─────────────────────────────────────────────────────────
Active Connections        < 50            ?          
Avg Query Time            < 200ms         ?          
Query P95                 < 500ms         ?          
Cache Hit Ratio           > 99%           ?          
Storage Used              < 2GB           ~500MB     ✅
Connection Pool Util      < 50%           ?          
Replication Lag (if active) < 100ms       N/A        
Backup Status             Daily + PITR    ✅         
SLO Compliance            99.5%           ?          
```

### Emergency Contacts & Escalation

```
Level 1: Database latency alert
→ Check slow query log → Adjust cache → Scale if needed

Level 2: Connection pool exhaustion
→ Review active connections → Restart application → Scale compute

Level 3: Replication lag > 1 second
→ Route to primary only → Investigate load → Scale replica

Level 4: Primary database down
→ Execute failover runbook → Notify team → Restore from backup
```

---

## Appendix: SQL Utilities & Scripts

### A.1 Database Health Check Script

```sql
-- health-check.sql
-- Run: psql $DATABASE_URL -f health-check.sql

-- 1. Active Connections
SELECT 
  count(*) as active_connections,
  max_conn::text || ' max allowed' as connection_limit
FROM pg_stat_activity
CROSS JOIN (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') s;

-- 2. Slow Queries
SELECT 
  LEFT(query, 50) || '...' as query,
  calls,
  ROUND(mean_time) as avg_ms,
  ROUND(max_time) as max_ms
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 5;

-- 3. Cache Hit Ratio
SELECT 
  round(100.0 * sum(blks_hit)::float / (sum(blks_hit) + sum(blks_read)), 2) as cache_hit_ratio
FROM pg_statio_user_tables;

-- 4. Database Size
SELECT pg_size_pretty(pg_database_size(current_database())) as total_size;

-- 5. Table Sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC
LIMIT 10;
```

### A.2 Index Maintenance Script

```sql
-- index-maintenance.sql

-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;

-- Find bloated indexes
SELECT
  current_database(),
  schemaname,
  tablename,
  indexname,
  ROUND(100.0 * (pg_relation_size(indexrelid) - pg_relation_size(indexrelid, 'main')) / pg_relation_size(indexrelid), 2) as bloat_ratio
FROM pg_stat_user_indexes
WHERE pg_relation_size(indexrelid) > 10485760  -- > 10MB
ORDER BY bloat_ratio DESC;

-- Reindex bloated index (non-blocking)
-- REINDEX INDEX CONCURRENTLY idx_name;

-- Analyze all tables (update stats)
-- ANALYZE;
```

---

**Document Version:** 1.0  
**Last Updated:** June 7, 2026  
**Next Review:** June 30, 2026 (end of Phase 1)  
**Maintained By:** Database / DevOps Team

---

End of Document
