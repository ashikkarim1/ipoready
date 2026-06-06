# IPOReady Admin Panel Documentation

**Last Updated:** June 7, 2026  
**Version:** 1.0  
**Owner:** Operations Team

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [User Management](#user-management)
3. [Data Ingestion (SEC Filings)](#data-ingestion)
4. [Monitoring Dashboard](#monitoring-dashboard)
5. [Database Health Checks](#database-health-checks)
6. [API Rate Limits](#api-rate-limits)
7. [Incident Response](#incident-response)
8. [Backup & Restore](#backup--restore)
9. [Troubleshooting](#troubleshooting)
10. [Escalation Paths](#escalation-paths)

---

## Quick Start

### Accessing the Admin Panel

1. **Navigate to Admin URL**
   - Production: `https://ipoready.com/admin`
   - Staging: `https://staging.ipoready.com/admin`

2. **Authentication Requirements**
   - Login with user account having `system_admin` role
   - Admin access is restricted to `system_admin` role users only
   - Two-factor authentication is recommended for admin accounts

3. **Initial Dashboard View**
   - Platform Admin header with key metrics
   - User management table with filters
   - Quick action buttons (Refresh, Dashboard navigation)

**Key Metrics at a Glance:**
- **Total Users**: Active user accounts (excludes system admins)
- **Pending Approval**: Users awaiting account activation
- **Growth Plan**: Users on paid Growth tier
- **Enterprise**: Users on Enterprise subscription

---

## User Management

### Overview

The user management interface allows you to:
- View all registered users with company and subscription details
- Approve/block user accounts
- Manage subscription plans (Starter, Growth, Enterprise)
- Monitor account creation and approval status
- Track user engagement metrics

### User Status Definitions

| Status | Definition | Action Available |
|--------|-----------|-------------------|
| **Pending** | User registered but not approved | Approve / Block |
| **Approved** | Active user with full platform access | Revoke access |
| **System Admin** | Internal admin user (not modifiable) | View only |
| **Blocked** | User access revoked | Re-approve |

### Step-by-Step: Approve a User Account

1. **Locate the User**
   - Use search bar to find by name, email, or company
   - Filter by "Pending Approval" status
   - Scroll through the user table

2. **Review User Details**
   ```
   User Info:
   - Name & Email
   - Company Name (if provided)
   - Target Exchange (NYSE, NASDAQ, TSX, etc.)
   - Listing Type (IPO, RTO, SPAC)
   - Join Date
   ```

3. **Perform Approval**
   - Click "Approve" button in the Actions column
   - Wait for confirmation (3-5 seconds)
   - Toast notification confirms: "User approved"
   - User row updates to show "Approved" status

4. **Post-Approval Tasks**
   - Send onboarding email via `/api/admin/send-summary` endpoint
   - Add user to relevant communication lists
   - Monitor first-time platform usage

### Step-by-Step: Block/Revoke User Access

**When to revoke access:**
- Expired subscription without payment
- Violation of terms of service
- User request for account deletion
- Suspicious account activity

**Process:**

1. **Locate the User**
   - Search by email or company name
   - Filter by "Approved" status if needed

2. **Click "Revoke" Button**
   - Located in the Actions column for approved users
   - Confirmation: "User access revoked"

3. **Document the Reason**
   - Add entry to admin audit log
   - Email user with explanation if TOS violation
   - Backup user data before full deletion

### Change User Subscription Plan

**Available Plans:**
- **Starter** ($0/month or included) — Basic IPO readiness features
- **Growth** ($199/month) — Advanced compliance, analytics, integrations
- **Enterprise** (Custom) — Full platform, priority support, custom integrations

**Steps to Change Plan:**

1. **Click Plan Dropdown**
   - User row → Plan column → Click plan button
   - Dropdown shows all available plans
   - Current plan is highlighted

2. **Select New Plan**
   - Click desired plan option
   - System updates plan immediately
   - Toast confirms: "Plan updated to [Plan Name]"

3. **Verify Stripe Integration**
   - Payment processed automatically if upgrade
   - Downgrade takes effect on renewal
   - Check Stripe dashboard for subscription confirmation

4. **Notify User** (for Enterprise)
   - Send custom onboarding email
   - Assign dedicated account manager
   - Schedule kickoff call

### Filtering and Search

**Search Query Parameters:**
- Name (first/last name)
- Email address
- Company name
- Target exchange (NYSE, NASDAQ, TSX, TSXV)

**Filter Options:**
```
Plan Filter:
├── All Plans (default)
├── Starter
├── Growth
└── Enterprise

Status Filter:
├── All Status (default)
├── Pending Approval
└── Approved
```

**Example Searches:**
```
Search: "acme"
Results: All users with "acme" in name, email, or company

Filter: Growth Plan + Pending Approval
Results: Users on Growth tier waiting activation

Filter: Enterprise + Approved
Results: All active Enterprise customers
```

---

## Data Ingestion

### SEC Filing Import System

The SEC filing ingestion system automatically syncs IPO/RTO regulatory data from SEC EDGAR. This includes 10-K, 10-Q, 8-K, and S-1 filings for companies on the platform.

### Understanding SEC Filing Types

| Filing Type | Frequency | Contents | Update Schedule |
|------------|-----------|----------|-----------------|
| **10-K** | Annual | Comprehensive annual report | Once per fiscal year |
| **10-Q** | Quarterly | Quarterly financial statements | 3x per year |
| **8-K** | As needed | Material events/changes | Real-time |
| **S-1** | Once | IPO registration statement | Single filing |
| **424B5** | Once | Final prospectus | Single filing |

### Step-by-Step: Trigger SEC Filing Ingestion

#### Option A: Bulk Ingest (All Companies)

1. **Access Ingestion Endpoint**
   ```bash
   POST /api/admin/ingest-sec-filings
   Headers: Authorization: Bearer [admin-token]
   ```

2. **Trigger Ingestion**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     "https://api.ipoready.com/api/admin/ingest-sec-filings?limit=50"
   ```

3. **Monitor Response**
   ```json
   {
     "message": "SEC filing ingestion completed",
     "statistics": {
       "total": 50,
       "successful": 48,
       "failed": 2,
       "duration_ms": 45000,
       "avg_per_company_ms": 900
     },
     "errors": [
       {
         "companyId": "acme-001",
         "error": "CIK not found in EDGAR"
       }
     ]
   }
   ```

#### Option B: Selective Ingest (Specific Companies)

1. **Prepare Company IDs**
   ```
   Comma-separated CIK numbers or company IDs
   Example: "0000789019,0001018724,0001192944"
   ```

2. **Trigger Selective Ingestion**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     "https://api.ipoready.com/api/admin/ingest-sec-filings?companyIds=0000789019,0001018724&limit=10"
   ```

3. **Response Contains**
   - Number of companies processed
   - Success count (filed ingested successfully)
   - Failure count (errors during processing)
   - Average duration per company
   - Error log (first 10 errors)

### SEC Ingestion Status & History

**Check Recent Sync Activity:**

```bash
GET /api/admin/ingest-sec-filings
(Status endpoint via GET request)
```

**Response Structure:**
```json
{
  "status": "ok",
  "companies_coverage": {
    "total": 1247,
    "with_10k": 1089,
    "with_10q": 1156
  },
  "recent_syncs": [
    {
      "id": "sync-001",
      "source": "SEC_EDGAR",
      "company_id": "apple-inc",
      "filing_type": "10-K",
      "created_at": "2026-06-06T14:32:00Z",
      "status": "completed",
      "duration_ms": 3421
    }
  ]
}
```

### Interpreting Ingestion Metrics

| Metric | Interpretation | Action if Issues |
|--------|----------------|------------------|
| **Success Rate > 95%** | Healthy ingestion | None required |
| **Success Rate 80-95%** | Minor failures (expected) | Review error log for CIK issues |
| **Success Rate < 80%** | Significant problems | See Troubleshooting section |
| **Avg Duration > 5000ms** | Slow EDGAR API | Monitor next sync; no action |
| **Errors = CIK Not Found** | Company not in EDGAR | Verify CIK number in database |

### Common SEC Filing Errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| "CIK not found in EDGAR" | Invalid CIK number | Update company record with correct CIK |
| "Timeout connecting to EDGAR" | Network/API latency | Retry after 5 minutes |
| "HTML parsing failed" | SEC filing format changed | Contact dev team; may need parser update |
| "Filing already ingested" | Duplicate ingestion attempt | Safe to ignore; system deduplicates |

### Scheduling Regular Ingestion

**Recommended Schedule:**
- **10-K/10-Q filings**: Daily at 3 AM UTC (after SEC updates)
- **Real-time events (8-K)**: Hourly polling
- **New companies**: Manual trigger upon signup

**Cron Job Configuration (if available):**
```bash
0 3 * * * curl -X POST https://api.ipoready.com/api/admin/ingest-sec-filings?limit=100
0 * * * * curl -X POST https://api.ipoready.com/api/admin/ingest-sec-filings?filingType=8K&limit=50
```

---

## Monitoring Dashboard

### Key Metrics to Monitor

#### Performance Metrics

1. **API Response Time (Latency)**
   - **Target**: < 200ms (p95)
   - **Warning**: 200-500ms
   - **Critical**: > 500ms
   - **Check**: Every 15 minutes

2. **Error Rate**
   - **Target**: < 0.5%
   - **Warning**: 0.5-2%
   - **Critical**: > 2%
   - **Check**: Real-time

3. **Uptime**
   - **Target**: 99.9% (SLA)
   - **Check**: Calculated hourly

4. **Request Volume**
   - **Normal**: 100-500 req/sec during business hours
   - **Peak**: 500-1000 req/sec during announcements
   - **Monitor**: For unusual spikes

#### Database Metrics

1. **Active Connections**
   - **Target**: < 80% of max pool
   - **Warning**: 80-95%
   - **Critical**: > 95% (connection exhaustion)

2. **Query Duration**
   - **Target**: < 50ms (p95)
   - **Warning**: 50-200ms
   - **Critical**: > 200ms

3. **Disk Space**
   - **Target**: > 30% free
   - **Warning**: 20-30% free
   - **Critical**: < 20% free

### Accessing Monitoring Data

#### Dashboard URL
```
Production: https://ipoready.com/dashboard/monitoring
Staging: https://staging.ipoready.com/dashboard/monitoring
```

#### API Endpoints

**Get Real-time Stats:**
```bash
GET /api/dashboard/stats
```

Response:
```json
{
  "uptime": "99.94%",
  "requests": {
    "total": 2543098,
    "last_hour": 12543,
    "errors": 31,
    "error_rate": "0.24%"
  },
  "latency": {
    "p50": 85,
    "p95": 187,
    "p99": 402
  },
  "database": {
    "connections": 45,
    "max_connections": 100,
    "usage": "45%"
  }
}
```

#### Viewing Error Logs

**Steps:**
1. Navigate to Admin Dashboard
2. Scroll to "Error Monitoring" section
3. Filter by date range and error type
4. Click on error to see full stack trace and context

**Log Levels:**
- **INFO**: Normal operational messages
- **WARN**: Non-critical issues (slow query, rate limit approached)
- **ERROR**: API failures, failed transactions, data inconsistencies
- **CRITICAL**: System outages, data corruption, security incidents

### Setting Up Alerts

**Email Alerts Configuration:**
```
High Error Rate (> 2%):     → ops-team@ipoready.com
Database Connection Pool (> 95%):  → infra-team@ipoready.com
API Latency (p95 > 500ms):  → backend-team@ipoready.com
Disk Space (< 20%):         → ops-team@ipoready.com
Uptime Drop (< 99%):        → incident-commander@ipoready.com
```

**Enable/Disable Alerts:**
1. Admin Panel → Monitoring Settings
2. Check alerts you wish to enable
3. Set threshold values
4. Save configuration

---

## Database Health Checks

### Daily Health Check Routine

**Morning Checklist (8 AM):**

1. **Connection Pool Status**
   ```bash
   # Check current connections
   SELECT count(*) as active_connections FROM pg_stat_activity;
   
   # Expected: < 80 (if max_connections = 100)
   # If > 80: Investigate slow queries, then restart pool if needed
   ```

2. **Slow Queries**
   ```bash
   # Find queries taking > 1 second
   SELECT query, mean_exec_time, max_exec_time, calls
   FROM pg_stat_statements
   WHERE mean_exec_time > 1000
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Table Bloat**
   ```bash
   # Check for unused space in tables
   SELECT schemaname, tablename, 
     round(100 * pg_relation_size(schemaname||'.'||tablename) / 
           pg_total_relation_size(schemaname||'.'||tablename)) AS table_bloat_ratio
   FROM pg_tables
   WHERE pg_total_relation_size(schemaname||'.'||tablename) > 0
   ORDER BY table_bloat_ratio DESC
   LIMIT 10;
   
   # Action: VACUUM FULL if > 30% bloat
   ```

4. **Disk Space**
   ```bash
   # Check database size
   SELECT pg_database.datname, 
     pg_size_pretty(pg_database_size(pg_database.datname))
   FROM pg_database
   WHERE datname = 'ipoready_prod';
   
   # Also check available disk on server
   # Action: Alert if > 80% used
   ```

### Weekly Maintenance Tasks

**Every Monday 2 AM (Scheduled Maintenance Window):**

1. **Run VACUUM ANALYZE** (Optimization)
   ```bash
   VACUUM ANALYZE;
   # Duration: 30-60 minutes
   # Impact: Read queries slightly slower during vacuum
   ```

2. **Reindex Fragmented Indexes**
   ```bash
   -- Find fragmented indexes
   SELECT schemaname, tablename, indexname,
     round(100 * (pg_relation_size(indexrelid) - 
            pg_relation_size(indexrelid, 'main')) / 
            pg_relation_size(indexrelid), 2) AS bloat_ratio
   FROM pg_stat_user_indexes
   WHERE idx_scan < 50
   ORDER BY bloat_ratio DESC;
   
   -- Rebuild if bloat > 30%
   REINDEX INDEX index_name;
   ```

3. **Check Replication Lag** (if applicable)
   ```bash
   SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) 
     AS replication_lag_seconds;
   
   # Expected: < 1 second
   # If > 5 seconds: Investigate network/IO on replicas
   ```

### Monthly Deep Dive

**First Friday of Month (10 AM):**

1. **Database Size Trend**
   ```bash
   -- Create trend table first time
   CREATE TABLE IF NOT EXISTS db_size_history (
     measured_at TIMESTAMP,
     size_bytes BIGINT
   );
   
   -- Insert current size
   INSERT INTO db_size_history VALUES (
     now(),
     pg_database_size('ipoready_prod')
   );
   
   -- Analyze growth
   SELECT 
     measured_at,
     size_bytes / (1024^3) AS size_gb,
     LAG(size_bytes) OVER (ORDER BY measured_at) AS prev_size,
     (size_bytes - LAG(size_bytes) OVER (ORDER BY measured_at)) / (1024^3) AS growth_gb
   FROM db_size_history
   ORDER BY measured_at DESC
   LIMIT 30;
   ```

2. **User Activity Analysis**
   ```bash
   -- Peak activity times
   SELECT 
     DATE_TRUNC('hour', created_at) AS hour,
     COUNT(*) AS user_registrations,
     COUNT(CASE WHEN is_approved THEN 1 END) AS approvals
   FROM users
   WHERE created_at > now() - INTERVAL '30 days'
   GROUP BY DATE_TRUNC('hour', created_at)
   ORDER BY hour DESC
   LIMIT 24;
   ```

3. **Data Integrity Checks**
   ```bash
   -- Check for orphaned records
   SELECT COUNT(*) FROM users WHERE company_id NOT IN 
     (SELECT id FROM companies);
   -- Should return 0
   
   -- Check for missing required fields
   SELECT COUNT(*) FROM companies 
   WHERE name IS NULL OR cik IS NULL;
   -- Should return 0
   ```

### Emergency: Database Connection Exhaustion

**Symptoms:**
- New API requests getting "connection refused" errors
- Dashboard becomes unresponsive
- Error logs show "too many connections"

**Immediate Actions (< 5 minutes):**

1. **Identify Long-Running Queries**
   ```bash
   SELECT pid, usename, state, query, 
     EXTRACT(EPOCH FROM (now() - query_start)) AS duration_sec
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY duration_sec DESC;
   ```

2. **Terminate Long-Running Queries**
   ```bash
   -- Terminate queries running > 30 minutes
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state != 'idle'
   AND EXTRACT(EPOCH FROM (now() - query_start)) > 1800;
   ```

3. **Restart Connection Pool**
   - Navigate to Admin Panel
   - Click "Database" → "Restart Connection Pool"
   - Confirm action
   - Wait 30 seconds for reconnection

4. **Verify Recovery**
   ```bash
   -- Should show most connections returning to idle
   SELECT state, COUNT(*) FROM pg_stat_activity GROUP BY state;
   ```

---

## API Rate Limits

### Rate Limit Architecture

IPOReady uses Redis-based rate limiting with per-IP and per-user quotas.

**Default Limits:**
```
Public Endpoints:     100 requests / minute (per IP)
Authenticated APIs:   1000 requests / hour (per user)
Admin Endpoints:      500 requests / hour (per admin)
SEC Ingestion:        10 concurrent jobs
File Upload:          5 GB/hour per user
```

### Checking Rate Limit Status

**Get Current Rate Limit Stats:**

```bash
GET /api/admin/rate-limit/stats
Authorization: Bearer YOUR_ADMIN_TOKEN

Response:
{
  "status": "success",
  "data": {
    "limits": {
      "public": {
        "requests": 100,
        "window_minutes": 1
      },
      "authenticated": {
        "requests": 1000,
        "window_hours": 1
      }
    },
    "current_usage": {
      "top_ips": [
        {
          "ip": "203.0.113.42",
          "requests": 87,
          "percentage": "87%",
          "status": "normal"
        }
      ],
      "users_at_limit": [
        {
          "user_id": "user-789",
          "email": "api-integrator@company.com",
          "requests": 998,
          "percentage": "99.8%",
          "status": "critical"
        }
      ]
    }
  }
}
```

### Adjusting Rate Limits

**When to Increase Limits:**
- Enterprise customer with legitimate high-volume integration
- Bulk data migration or API testing
- Temporary spike in usage during IPO roadshow period

**Step-by-Step: Increase Limit for User**

1. **Identify the User/IP**
   - Check current stats endpoint
   - Note the IP address or user_id

2. **Submit Rate Limit Change Request**
   ```bash
   POST /api/admin/rate-limit
   Authorization: Bearer YOUR_ADMIN_TOKEN
   
   {
     "action": "adjust",
     "target_type": "user",
     "target_id": "user-789",
     "new_limit": 2000,
     "window": "hour",
     "expiration": "2026-07-07T23:59:59Z",
     "reason": "Enterprise customer API integration"
   }
   ```

3. **Verify Change**
   - Wait 30 seconds for cache update
   - Check stats endpoint again
   - User should now show 2000 request limit

4. **Document Change**
   - Add entry to admin log: [timestamp] [admin-name] adjusted rate limit for [target]
   - Email user to notify of increase
   - Set calendar reminder for expiration date

### Resetting Rate Limit for Abuser

**When to Reset:**
- IP address shows abuse pattern (1000+ failed auth attempts)
- Account takeover suspected
- DDoS attack from specific IP

**Action Steps:**

1. **Reset Single IP**
   ```bash
   POST /api/admin/rate-limit
   Authorization: Bearer YOUR_ADMIN_TOKEN
   
   {
     "action": "reset",
     "target_type": "ip",
     "target": "203.0.113.42",
     "prefix": "rl:pub"
   }
   ```

2. **Temporary Block** (if malicious)
   ```bash
   POST /api/admin/rate-limit
   Authorization: Bearer YOUR_ADMIN_TOKEN
   
   {
     "action": "block",
     "target": "203.0.113.42",
     "duration_hours": 24,
     "reason": "Suspected brute force attack"
   }
   ```

3. **Clear All Rate Limits** (Emergency only!)
   ```bash
   POST /api/admin/rate-limit
   Authorization: Bearer YOUR_ADMIN_TOKEN
   X-Confirm: true
   
   {
     "action": "clear-all"
   }
   ```
   ⚠️ **CRITICAL**: Only use if Redis is corrupted or major incident

### Rate Limit Response Codes

| Code | Meaning | User-Facing Message |
|------|---------|---------------------|
| 200 | Request accepted | Success |
| 429 | Rate limit exceeded | "Too many requests. Try again in 60 seconds." |
| 503 | Service temporarily unavailable | "Service is busy. Please try again later." |

**Rate Limit Headers (in response):**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1717773600 (Unix timestamp)
Retry-After: 60 (seconds to wait)
```

---

## Incident Response

### Incident Severity Levels

| Level | Definition | Response Time | Team |
|-------|-----------|----------------|------|
| **CRITICAL** | Complete outage, data loss risk, security breach | < 5 min | All |
| **HIGH** | Partial outage affecting > 10% users, major feature down | < 15 min | Backend + Ops |
| **MEDIUM** | Feature degradation, < 5% users affected | < 1 hour | Relevant team |
| **LOW** | Minor bug, single user issue | < 4 hours | Owner |

### Incident Response Procedures

#### Step 1: Assess Severity (First 2 minutes)

**Ask these questions:**

1. Is the platform completely down?
   - YES → **CRITICAL** severity
   - NO → Continue to question 2

2. Can users not access core IPO readiness features?
   - YES → **HIGH** severity
   - NO → Continue to question 3

3. Is a specific feature partially broken or slow?
   - YES → **MEDIUM** or **LOW** depending on feature importance
   - NO → Continue to question 4

4. Is this affecting a single user?
   - YES → **LOW** severity

**Severity Escalation Matrix:**
```
Outage Duration          Impact Level      Severity
────────────────────────────────────────────────────
0-5 minutes              Any               HIGH
5-15 minutes             > 50% users       CRITICAL
> 15 minutes             Any               CRITICAL
Complete outage          Any               CRITICAL
Data loss                Any               CRITICAL
Security incident        Any               CRITICAL
```

#### Step 2: Notify Stakeholders (CRITICAL/HIGH only)

**CRITICAL Incident Notification:**

1. **Immediate notification** (< 2 minutes):
   - Slack #incidents channel: `@incident-commander [incident summary]`
   - PagerDuty: Auto-escalation triggered
   - SMS to on-call engineer

   **Sample message:**
   ```
   CRITICAL INCIDENT: Platform Authentication Down
   Affected Users: ~500 active users
   Impact: Cannot log in
   Detected: 2026-06-07 14:32 UTC
   Status: Investigating
   Command: @alice (incident commander)
   ```

2. **Timeline updates** (every 5 minutes during incident):
   ```
   14:32 - Issue detected: Auth failures increasing
   14:37 - Root cause identified: Database connection exhaustion
   14:42 - Action taken: Restarted connection pool
   14:47 - Service recovering: 95% of users reconnected
   14:52 - RESOLVED: All users online, monitoring continues
   ```

3. **Post-incident notification**:
   - Status page update: `ipoready.statuspage.io`
   - Email to Enterprise customers with timeline
   - Slack #announcements with brief summary

#### Step 3: Triage Based on Incident Type

**Incident Type: API Errors Increasing**

```
Symptoms:
├─ Error rate > 2% (dashboard shows red)
├─ 4xx/5xx responses increasing
└─ Users report timeouts

Triage Actions:
1. Check error logs: /api/dashboard/logs?error_type=all&last=15m
2. Identify pattern: Which endpoint? Which users?
3. Check dependencies: Database OK? External APIs OK?
4. Review recent deployments in last 15 minutes
5. If recent deploy: Rollback OR isolate error to new code
```

**Incident Type: Database Performance Degrading**

```
Symptoms:
├─ Query latency > 500ms (p95)
├─ Connection pool approaching max
└─ Users report slow page loads

Triage Actions:
1. Check active connections: psql → SELECT * FROM pg_stat_activity
2. Identify slow queries: SELECT * FROM pg_stat_statements ORDER BY mean_exec_time
3. Check for table locks: SELECT * FROM pg_locks
4. If lock detected: KILL blocking query
5. If slow query: Check query plan (EXPLAIN ANALYZE)
6. Emergency: Run VACUUM on affected table
```

**Incident Type: High Error Rate (> 2%)**

```
Root Cause Checklist:
☐ Check if specific endpoint (use error logs)
☐ Check if affecting specific user group
☐ Check recent code deployments
☐ Check external service integrations (Stripe, SendGrid, etc.)
☐ Check database connectivity
☐ Check memory/CPU usage on servers
☐ Check for DDoS or rate limit attacks
☐ Check cron jobs or batch processes
```

#### Step 4: Implement Fix/Workaround

**Preferred Order:**

1. **Quick Workaround** (if immediate fix not available)
   ```
   Example: Slow admin page
   Solution: Disable heavy analytics in UI, serve cached data
   Time to implement: < 5 min
   ```

2. **Temporary Fix** (addresses root cause partially)
   ```
   Example: Database overloaded
   Solution: Kill long-running queries, disable non-essential processes
   Time to implement: 5-15 min
   ```

3. **Permanent Fix** (proper solution)
   ```
   Example: Query performance issue
   Solution: Add database index, refactor query
   Time to implement: 15 min - 2 hours (can be deployed after incident)
   ```

**Deployment for Hot Fix:**
```bash
# 1. Check git status
git status

# 2. Create hotfix branch
git checkout -b hotfix/critical-issue

# 3. Make minimal changes only
git add path/to/file.tsx

# 4. Commit with clear message
git commit -m "HOTFIX: Fix auth endpoint returning 500 errors"

# 5. Push to staging first
git push origin hotfix/critical-issue
# Wait for tests to pass

# 6. Merge to main
git pull origin main
git merge hotfix/critical-issue

# 7. Deploy to production
./scripts/deploy-prod.sh
# Verify deployment: check /api/health endpoint
```

#### Step 5: Verify Resolution

**Health Check Immediately After Fix:**

```bash
# 1. Check API response
curl -I https://api.ipoready.com/api/health
# Expected: HTTP 200

# 2. Check error rate (should drop to < 0.5%)
curl https://api.ipoready.com/api/dashboard/stats | jq '.requests.error_rate'

# 3. Check database connections normalized
psql → SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle';
# Expected: < 20 connections

# 4. Test critical user journeys
- Try logging in
- Try creating a new company profile
- Try uploading a document
- Check admin panel loads
```

#### Step 6: Post-Incident Review

**Within 2 hours of incident resolution:**

1. **Create Incident Report**
   - Title: [CRITICAL] Authentication system down - June 7, 14:32 UTC
   - Duration: 20 minutes
   - Root cause: Connection pool exhaustion from slow queries
   - Impact: ~500 users unable to login
   - Resolution: Restarted connection pool

2. **Fill Out Incident Template**
   ```markdown
   # Incident Report: [Title]
   
   **Timeline:**
   - 14:32 UTC: Issue detected (error rate > 5%)
   - 14:34 UTC: Root cause identified (pool at 99 connections)
   - 14:37 UTC: Fix deployed (connection pool restart)
   - 14:52 UTC: Fully resolved
   - Duration: 20 minutes
   
   **Root Cause:**
   [Explain why this happened]
   
   **Preventative Measures:**
   1. [Action to prevent recurrence]
   2. [Action to detect sooner]
   3. [Action to reduce impact]
   
   **Assigned Follow-ups:**
   - @alice: Add monitoring for connection pool
   - @bob: Optimize slow query in Auth service
   - @charlie: Update runbook with connection reset steps
   ```

3. **Schedule Follow-up Meeting**
   - Who: Team lead, incident commander, relevant engineers
   - When: Next day (allow 24 hours for context)
   - Duration: 30 minutes
   - Goal: Review incident, assign action items

### Common Incidents & Quick Fixes

**Incident: High Memory Usage**
```
Symptom: Out of Memory error in logs
Quick Fix:
1. kubectl get pods | grep memory
2. kubectl restart deployment/api-server
3. Monitor: kubectl top pods
```

**Incident: Database Timeout**
```
Symptom: "Query timeout" errors
Quick Fix:
1. Kill long-running query: SELECT pg_terminate_backend(pid) ...
2. Check EXPLAIN ANALYZE query_text
3. Add index if needed
```

**Incident: API Rate Limiting Too Strict**
```
Symptom: Legitimate users getting 429 (Too Many Requests)
Quick Fix:
1. Check recent code deployments
2. Temporarily increase limit: POST /api/admin/rate-limit
3. Root cause analysis: Is there a loop? N+1 query?
```

---

## Backup & Restore

### Backup Strategy

**Backup Frequency:**
- **Real-time**: Transaction log streaming (continuous)
- **Daily**: Full database snapshot at 2 AM UTC
- **Weekly**: Full backup with separate storage (encrypted)
- **Monthly**: Offline backup for disaster recovery

**Backup Retention:**
- **Hourly**: Keep 24 hours
- **Daily**: Keep 30 days
- **Weekly**: Keep 1 year
- **Monthly**: Keep 3 years

### Automated Backups

**Database Configuration (Neon PostgreSQL):**

1. **Enable Automated Backups**
   - Neon Console → Projects → IPOReady → Settings
   - Backups section → "Enable automated backups"
   - Retention: 30 days
   - Frequency: Daily at 2 AM UTC

2. **Verify Backup Running**
   ```bash
   # Check backup status in Neon
   curl -H "Authorization: Bearer $NEON_API_KEY" \
     https://api.neon.tech/v1/projects/$(PROJECT_ID)/backups
   ```

### Manual Backup Procedure

**Step-by-Step: Create On-Demand Backup**

1. **Via Neon Console**
   - Login to neon.tech
   - Select IPOReady project
   - Databases → ipoready_prod → Backups
   - Click "Create Backup Now"
   - Confirm: "Yes, create backup"
   - Wait 2-5 minutes for completion
   - Backup appears in list with timestamp

2. **Via API**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer $NEON_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.neon.tech/v1/projects/$(PROJECT_ID)/backups \
     -d '{
       "branch": "main",
       "name": "backup-2026-06-07-emergency"
     }'
   ```

3. **Verify Backup Created**
   ```bash
   curl -H "Authorization: Bearer $NEON_API_KEY" \
     https://api.neon.tech/v1/projects/$(PROJECT_ID)/backups \
     | jq '.backups | sort_by(.created_at) | reverse | .[0]'
   ```

### Restore from Backup

**CRITICAL: Restoration Impact**

⚠️ **WARNING**: Restoring database will:
- Revert ALL data to backup timestamp
- Overwrite all changes since backup
- Affect ALL active users
- Requires 30-60 minutes downtime

**Only restore if:**
- Data corruption detected
- Ransomware/malware attack
- Accidental mass deletion
- No other recovery method available

**Step-by-Step: Restore Process**

1. **Verify Backup Integrity** (before restoring)
   ```bash
   # List available backups
   curl -H "Authorization: Bearer $NEON_API_KEY" \
     https://api.neon.tech/v1/projects/$(PROJECT_ID)/backups
   
   # Choose backup with timestamp closest to last good state
   ```

2. **Create Restore Branch** (safest approach)
   ```bash
   # Create new branch from backup (doesn't affect production)
   curl -X POST \
     -H "Authorization: Bearer $NEON_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.neon.tech/v1/projects/$(PROJECT_ID)/branches \
     -d '{
       "name": "restore-branch-2026-06-07",
       "parent_id": "backup-2026-06-07",
       "parent_timestamp": 1717753200000
     }'
   
   # Test queries on restore branch first
   # If OK, proceed to Step 3
   ```

3. **Point-in-Time Recovery (PITR)** (if branch method fails)
   ```bash
   # Restore main branch to specific point in time
   curl -X POST \
     -H "Authorization: Bearer $NEON_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.neon.tech/v1/projects/$(PROJECT_ID)/branches/main/restore \
     -d '{
       "timestamp": 1717753200000
     }'
   ```

4. **Verify Data After Restore**
   ```sql
   -- Check table counts
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM companies;
   SELECT COUNT(*) FROM filings;
   
   -- Check latest timestamp
   SELECT MAX(created_at) FROM users;
   
   -- Verify data looks reasonable (no corrupted records)
   SELECT * FROM users LIMIT 1;
   ```

5. **Communicate to Users**
   ```
   Status Page Update:
   "Database restoration in progress. Services may be unavailable 
    for the next 30-60 minutes. We apologize for the inconvenience."
   
   Email to Enterprise Customers:
   Subject: IPOReady Database Restoration - Expected Downtime
   
   Dear [Customer],
   
   We are performing an emergency database restoration due to 
   [brief explanation]. This is expected to complete by [time].
   
   During this time:
   - Platform will be read-only or unavailable
   - Recent changes (last [X] hours) will be lost
   - SEC filings and documents will be restored to [timestamp]
   
   We will update you when services are restored.
   
   Thank you for your patience.
   ```

### Testing Backup Restoration

**Monthly Backup Test (First Friday of month):**

```bash
# 1. Create test branch from yesterday's backup
curl -X POST https://api.neon.tech/v1/projects/ID/branches \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{"name":"backup-test","parent_timestamp":1717666800000}'

# 2. Run verification queries
psql [connection_string] -c "SELECT COUNT(*) FROM users;"
psql [connection_string] -c "SELECT COUNT(*) FROM companies;"

# 3. Verify data integrity
psql [connection_string] -c "
  SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM companies) as companies,
    (SELECT COUNT(*) FROM filings) as filings;
"

# 4. Delete test branch (cleanup)
curl -X DELETE https://api.neon.tech/v1/projects/ID/branches/backup-test \
  -H "Authorization: Bearer $NEON_API_KEY"

# 5. Document test results
echo "✓ Backup test passed at $(date)" >> /var/log/backup-tests.log
```

### Disaster Recovery Plan

**If Entire Database Lost (Data Center Failure):**

1. **Activate Disaster Recovery** (< 5 minutes)
   ```bash
   # Provision new Neon database
   curl -X POST https://api.neon.tech/v1/projects \
     -H "Authorization: Bearer $NEON_API_KEY" \
     -d '{"name":"ipoready-recovery"}'
   
   # Restore from weekly backup to new database
   # Update connection string in environment variables
   # Verify connectivity
   ```

2. **Restore Latest Data** (5-15 minutes)
   ```bash
   # Use most recent backup
   # Check backup age to determine data loss window
   ```

3. **Update DNS/Connection Strings** (< 1 minute)
   - Update DATABASE_URL in production environment
   - Update all service connection strings
   - Verify all apps can connect to new database

4. **Run Health Checks** (5 minutes)
   - Verify all tables exist
   - Check row counts match expected values
   - Run queries on critical tables

5. **Notify Stakeholders** (immediate)
   - Operations team
   - Engineering team
   - Executive team
   - Customers (via status page)

---

## Troubleshooting

### Common Admin Issues

#### Issue: Cannot Access Admin Panel

**Symptoms:**
```
- Redirected to /dashboard after login
- "Unauthorized" error message
- Admin page shows "Access Denied"
```

**Diagnosis:**

1. **Verify User Role**
   ```bash
   psql [connection_string] << EOF
   SELECT id, email, role, is_approved 
   FROM users 
   WHERE email = 'your@email.com';
   EOF
   ```
   - Check: `role` column should be `system_admin`
   - Check: `is_approved` should be `true`

2. **Check NextAuth Session**
   - Open browser DevTools → Application → Cookies
   - Look for `next-auth.session-token`
   - Delete cookie and re-login if corrupted

**Resolution:**

**Case A: User is not system_admin**
```sql
-- Update role to system_admin
UPDATE users 
SET role = 'system_admin' 
WHERE email = 'your@email.com';
```

**Case B: User not approved**
```sql
-- Approve user
UPDATE users 
SET is_approved = true 
WHERE email = 'your@email.com';
```

**Case C: Session corrupted**
- Clear browser cookies
- Sign out from all tabs: `/api/auth/signout`
- Close browser completely
- Reopen and login

#### Issue: User Approval Button Not Working

**Symptoms:**
```
- Click "Approve" button → nothing happens
- No toast notification
- User status doesn't change
```

**Diagnosis:**

1. **Check Network Request**
   - Open DevTools → Network tab
   - Click "Approve" button
   - Look for PATCH request to `/api/admin/users/[id]/approve`
   - Check response status:
     - 200 = Success (check UI)
     - 403 = Not authorized
     - 500 = Server error (check logs)

2. **Check Backend Logs**
   ```bash
   # Look for 500 errors in last 5 minutes
   tail -100 /var/log/api.log | grep -i approve
   tail -100 /var/log/api.log | grep -i error
   ```

**Resolution:**

**If 403 error:**
- Verify logged-in user has `system_admin` role
- Check session token validity

**If 500 error:**
- Check database connectivity
- Verify `is_approved` column exists in users table
- Run manual update:
  ```sql
  UPDATE users SET is_approved = true WHERE id = '[user-id]';
  ```

**If UI not updating:**
- Hard refresh page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache: DevTools → Application → Clear storage
- Check browser console for React errors

#### Issue: SEC Filing Ingestion Fails

**Symptoms:**
```
- All companies showing "failed" status
- Error: "CIK not found in EDGAR"
- Error: "Timeout connecting to EDGAR"
```

**Diagnosis:**

1. **Check SEC EDGAR Availability**
   ```bash
   curl -I https://www.sec.gov/cgi-bin/browse-edgar
   # Should return HTTP 200
   ```

2. **Verify Company CIK Numbers**
   ```sql
   -- Check if CIK values exist
   SELECT COUNT(*) FROM capital_companies WHERE cik IS NULL;
   -- Should be 0 or close to 0
   
   -- Sample CIK value
   SELECT id, name, cik FROM capital_companies LIMIT 5;
   ```

3. **Check Recent Error Log**
   ```bash
   curl https://api.ipoready.com/api/admin/ingest-sec-filings
   # Review errors array
   ```

**Resolution:**

**If CIK missing:**
```sql
-- Update companies with correct CIK from SEC
UPDATE capital_companies 
SET cik = '0000789019'
WHERE name = 'Apple Inc.';

-- Then retry ingestion
```

**If EDGAR unavailable:**
- Retry after 5 minutes (SEC often does maintenance)
- Check SEC status page: sec.gov/status
- If still down, schedule retry for later

**If timeout errors persist:**
```bash
# Increase timeout in environment
export SEC_PARSER_TIMEOUT=30000  # 30 seconds

# Retry ingestion with longer timeout
curl -X POST \
  https://api.ipoready.com/api/admin/ingest-sec-filings?limit=10 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Issue: Database Queries Timing Out

**Symptoms:**
```
- "Query timeout" error in logs
- Dashboard not loading
- API requests returning 504 Gateway Timeout
```

**Diagnosis:**

1. **Check Slow Queries**
   ```bash
   psql [connection_string] << EOF
   SELECT query, mean_exec_time, max_exec_time 
   FROM pg_stat_statements 
   WHERE mean_exec_time > 5000
   ORDER BY mean_exec_time DESC 
   LIMIT 5;
   EOF
   ```

2. **Check Active Connections**
   ```bash
   psql [connection_string] << EOF
   SELECT count(*) FROM pg_stat_activity WHERE state != 'idle';
   EOF
   # If close to max (100), that's the problem
   ```

3. **Check Query Execution Plan**
   ```bash
   psql [connection_string] << EOF
   EXPLAIN ANALYZE
   SELECT * FROM users WHERE company_id = '123';
   EOF
   # Look for "Seq Scan" → indicates missing index
   ```

**Resolution:**

**If slow query without index:**
```sql
-- Add missing index
CREATE INDEX idx_users_company_id ON users(company_id);

-- Re-run EXPLAIN ANALYZE to verify
EXPLAIN ANALYZE SELECT * FROM users WHERE company_id = '123';
```

**If connection pool exhausted:**
```bash
# Identify and kill long-running queries
psql [connection_string] << EOF
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE duration > 300 AND state != 'idle';
EOF
```

**If database completely unresponsive:**
1. Enable read-only mode: `ALTER DATABASE ipoready_prod SET default_transaction_read_only = on;`
2. Restart database connection pool via Admin Panel
3. Investigate root cause (disk full, memory exhausted, etc.)

### Monitoring Alert Troubleshooting

#### Alert: "High Error Rate (> 2%)"

**Steps:**

1. **Get Error Details**
   ```bash
   curl https://api.ipoready.com/api/dashboard/stats | jq '.requests'
   ```

2. **Check Which Endpoint**
   ```bash
   # Check error logs filtered by endpoint
   tail -500 /var/log/api.log | grep -i error | head -20
   ```

3. **Determine If Widespread or Isolated**
   ```
   If error_count is low (< 10):
   └─ Likely isolated incident, monitor for recurrence
   
   If error_rate high for 1 endpoint:
   └─ Issue specific to that feature, page or isolate
   
   If error_rate high across all endpoints:
   └─ Systemic issue, check infrastructure/database
   ```

4. **Take Action**
   ```
   If isolated: Monitor and document
   If specific endpoint: Check recent code changes, rollback if needed
   If systemic: Escalate to incident commander
   ```

#### Alert: "Database Connection Pool High (95%)"

**Immediate Actions:**

1. **Check Active Connections**
   ```bash
   psql << EOF
   SELECT pid, usename, application_name, state, state_change 
   FROM pg_stat_activity 
   ORDER BY state_change;
   EOF
   ```

2. **Identify Problem Connection**
   - Look for `active` connections with long `state_change` time
   - Note the `pid` (process ID)

3. **Terminate If Safe**
   ```bash
   psql << EOF
   SELECT pg_terminate_backend(12345);  -- Replace 12345 with actual PID
   EOF
   ```

4. **Verify Recovery**
   ```bash
   psql << EOF
   SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle';
   EOF
   # Should drop to normal level (< 20)
   ```

---

## Escalation Paths

### Support Escalation Matrix

```
INCIDENT TYPE              FIRST RESPONSE    ESCALATE TO           NOTIFY
─────────────────────────────────────────────────────────────────────────
User account issues        Support team      Admin / Product lead  None
Payment/billing problems   Billing team      Finance director      Customer
API/integration errors     Backend team      Tech lead / CTO       Customer
Performance degradation    Ops team          CTO / VP Eng           Status page
Data integrity issues      DBA / Ops         VP Eng / General Counsel   Legal
Security incident          Security team     CTO / CISO            Legal
Compliance violation       Legal team        General Counsel        Regulators
Customer onboarding        Onboarding PM     VP Sales               Account manager
Feature request            Product team      PM lead                Roadmap
```

### On-Call Schedule

**Current On-Call Rotation:**

```
Week of June 3-9:
├─ Incident Commander: Alice Chen (alice@ipoready.com)
├─ Backend Lead: Bob Kumar (bob@ipoready.com)
├─ Database/Ops: Charlie Davis (charlie@ipoready.com)
└─ Escalation: Diana Martinez (diana@ipoready.com) - VP Eng

Week of June 10-16:
├─ Incident Commander: Eve Williams (eve@ipoready.com)
├─ Backend Lead: Frank Johnson (frank@ipoready.com)
├─ Database/Ops: Grace Lee (grace@ipoready.com)
└─ Escalation: Henry Zhang (henry@ipoready.com) - CTO

On-call Notification Methods:
1. Slack: #incidents channel mentions
2. PagerDuty: SMS + phone call
3. Email: ops-alerts@ipoready.com
```

### How to Escalate an Incident

**Step 1: Determine Severity**
- Is the platform completely down? → **CRITICAL**
- Are > 10% of users affected? → **HIGH**
- Are < 10% or single user affected? → **MEDIUM** or **LOW**

**Step 2: For CRITICAL/HIGH Incidents**

1. **Post to #incidents Slack channel**
   ```
   @incident-commander 
   CRITICAL: [One sentence description]
   - Affected users: [number or percentage]
   - Services down: [list services]
   - Time detected: [UTC timestamp]
   ```

2. **Trigger PagerDuty** (automatic if using integration)
   - Or manually: Go to pagerduty.com → Incidents → Create

3. **Document initial findings**
   - What you know
   - What you've checked
   - What you need from others

**Step 3: Follow Incident Response Procedure**
- See [Incident Response](#incident-response) section above

### Escalation Contact List

**For Immediate Help:**

| Role | Name | Email | Phone | Slack |
|------|------|-------|-------|-------|
| Incident Commander (On-Call) | Alice Chen | alice@ipoready.com | +1-415-XXX-XXXX | @alice |
| VP Engineering | Diana Martinez | diana@ipoready.com | +1-415-XXX-XXXX | @diana |
| CTO | Henry Zhang | henry@ipoready.com | +1-415-XXX-XXXX | @henry |
| Database Admin | Charlie Davis | charlie@ipoready.com | +1-415-XXX-XXXX | @charlie |
| Security Officer | Jamie Patel | jamie@ipoready.com | +1-415-XXX-XXXX | @jamie |
| Head of Customer Success | Kelly Martinez | kelly@ipoready.com | +1-415-XXX-XXXX | @kelly |

**For Non-Urgent Issues:**

- Admin questions: Send email to `ops@ipoready.com`
- Database questions: Post in `#database-team` Slack
- API issues: Post in `#backend-team` Slack
- Feature requests: Post in `#product` Slack

---

## Appendix: Quick Reference Commands

### Most Common Admin Tasks

**Approve a User (via SQL):**
```sql
UPDATE users 
SET is_approved = true 
WHERE email = 'user@company.com';
```

**Change User Plan:**
```sql
UPDATE companies 
SET subscription_plan = 'growth' 
WHERE id = (SELECT company_id FROM users WHERE email = 'user@company.com');
```

**Check Database Health:**
```bash
psql $DATABASE_URL << EOF
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM companies) as companies,
  (SELECT COUNT(*) FROM filings) as filings,
  pg_size_pretty(pg_database_size(current_database())) as db_size;
EOF
```

**Trigger SEC Ingestion:**
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.ipoready.com/api/admin/ingest-sec-filings?limit=50"
```

**Reset Rate Limit for IP:**
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"action":"reset","key":"203.0.113.42","prefix":"rl:pub"}' \
  https://api.ipoready.com/api/admin/rate-limit
```

**Restart Connection Pool:**
1. Navigate to Admin Panel
2. Click "Database" → "Restart Connection Pool"
3. Confirm action

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 7, 2026 | Initial documentation: user management, SEC ingestion, monitoring, database health, rate limits, incident response, backup/restore |

---

**Questions or Updates?** Contact: ops@ipoready.com
