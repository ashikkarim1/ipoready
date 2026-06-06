# IPOReady On-Call Rotation & Runbooks

**Document Version:** 1.0  
**Last Updated:** June 7, 2026  
**Target Audience:** DevOps, SRE, Backend Engineers, Product Managers  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Contact Matrix & Escalation](#contact-matrix--escalation)
3. [On-Call Schedule Template](#on-call-schedule-template)
4. [On-Call Responsibilities](#on-call-responsibilities)
5. [Runbooks](#runbooks)
   - [Database Slow Queries](#runbook-database-slow-queries)
   - [API Latency Spikes](#runbook-api-latency-spikes)
   - [Third-Party Service Outages](#runbook-third-party-service-outages)
   - [Data Corruption Detected](#runbook-data-corruption-detected)
6. [Tools & Integration](#tools--integration)
7. [Post-Incident Review Process](#post-incident-review-process)
8. [Escalation Procedures](#escalation-procedures)

---

## Overview

### Purpose

This document defines the on-call rotation, escalation procedures, and runbooks for responding to production incidents in IPOReady. Our on-call team ensures 24/7 monitoring and rapid incident response.

### On-Call Model

- **Weekly rotation** - Engineer on-call Monday 00:00 UTC to Monday 23:59 UTC
- **Shift handoff** - Friday 4:00 PM PST (new engineer starts)
- **24/7 coverage** - Distributed across US, EU, APAC timezones
- **Primary + Secondary** - Each shift has backup for failover
- **Response SLA** - P1: 5 min, P2: 30 min, P3: 4 hours

### Severity Definitions

| Severity | Description | SLA | Escalation |
|----------|-------------|-----|-----------|
| **P1** | Service down, data loss, security breach | 5 min ACK, 15 min mitigate | Immediate CTO + CEO |
| **P2** | Major feature broken, degraded performance | 30 min ACK, 1 hour mitigate | Tech Lead + CTO |
| **P3** | Minor feature broken, workaround exists | 4 hours ACK, same day fix | On-Call Engineer |
| **P4** | Cosmetic issues, documentation | Next business day | Backlog |

---

## Contact Matrix & Escalation

### Primary On-Call Engineer

**Rotation Schedule:**
```
Week of Jun 7:   Alice Chen (Primary) / Bob Martinez (Secondary)
Week of Jun 14:  Carol Singh (Primary) / David Lee (Secondary)
Week of Jun 21:  Elena Rodriguez (Primary) / Frank Zhou (Secondary)
Week of Jun 28:  Grace Kim (Primary) / Hannah Jackson (Secondary)
```

### Management Escalation Chain

#### Tier 1: Engineering
- **On-Call Engineer** (Immediate)
  - Phone: +1 (415) XXX-XXXX
  - Slack: @alice-chen
  - Email: alice.chen@ipoready.com
  - PagerDuty: IPOReady Engineer On-Call

#### Tier 2: Tech Leadership
- **VP Engineering / Tech Lead** (P1/P2)
  - Name: James Mitchell
  - Phone: +1 (415) XXX-XXXX
  - Slack: @james-mitchell
  - Email: james.mitchell@ipoready.com
  - Available: 24/7 for escalations

#### Tier 3: Executive
- **VP Operations** (P1 ongoing > 30 min)
  - Name: Sarah Thompson
  - Phone: +1 (415) XXX-XXXX
  - Slack: @sarah-thompson
  - Email: sarah.thompson@ipoready.com
  - Available: 24/7

- **CEO** (P1 ongoing > 1 hour, data loss)
  - Name: Marcus Johnson
  - Phone: +1 (415) XXX-XXXX
  - Slack: @marcus
  - Email: marcus@ipoready.com
  - Available: 24/7 emergencies only

### Third-Party Emergency Contacts

| Service | Contact | Phone | Email | Status Page |
|---------|---------|-------|-------|-------------|
| **Neon Database** | Support | +1-844-XXX-XXXX | support@neon.tech | neon.tech/status |
| **Vercel Hosting** | Enterprise Support | +1-XXX-XXX-XXXX | support@vercel.com | vercel.com/status |
| **Stripe Payments** | Support | +1-XXX-XXX-XXXX | support@stripe.com | stripe.com/status |
| **Resend Email** | Support | - | support@resend.com | resend.com/status |
| **Twilio SMS** | Support | +1-XXX-XXX-XXXX | support@twilio.com | twilio.com/status |
| **AWS** | Enterprise TAM | +1-XXX-XXX-XXXX | support@aws.amazon.com | status.aws.amazon.com |

### Internal Support Contacts

| Role | Name | Slack | Email | Function |
|------|------|-------|-------|----------|
| Database Admin | Michael Zhang | @michael-db | michael.zhang@ipoready.com | DB optimization, migrations |
| Security Lead | Rebecca Wilson | @rebecca-sec | rebecca.wilson@ipoready.com | Security incidents, data breach |
| Product Manager | Lisa Anderson | @lisa-pm | lisa.anderson@ipoready.com | Feature rollback decisions |
| Customer Success | Tom Bradley | @tom-cs | tom.bradley@ipoready.com | Customer communication |
| Finance/Compliance | Jennifer Wu | @jenny-finance | jenny.wu@ipoready.com | Regulatory incidents |

### Escalation Contact Matrix

```
INCIDENT TYPE              PRIMARY              SECONDARY           TERTIARY
─────────────────────────────────────────────────────────────────────────────
Database Failure           Michael Zhang        James Mitchell      Sarah Thompson
API Service Down           On-Call Engineer     James Mitchell      Sarah Thompson
Payment Processing Error   Tom Bradley          James Mitchell      Sarah Thompson
Data Corruption           Rebecca Wilson        Michael Zhang       Sarah Thompson
Security Breach           Rebecca Wilson        Marcus Johnson      FBI/Law Enforcement
Third-Party Outage        James Mitchell       Sarah Thompson      On-Call Engineer
Performance Degradation   On-Call Engineer     Michael Zhang       James Mitchell
Email Delivery Failed     Resend Support       Tom Bradley         James Mitchell
Document Upload Failed    On-Call Engineer     Michael Zhang       James Mitchell
Auth System Down          On-Call Engineer     James Mitchell      Sarah Thompson
```

---

## On-Call Schedule Template

### Weekly Rotation Spreadsheet

**Location:** Google Sheets - [IPOReady On-Call Schedule](https://docs.google.com/spreadsheets/d/SCHEDULE_ID)

### Rotation Schedule (June - December 2026)

| Week | Start Date | Primary Engineer | Secondary | Region | Handoff |
|------|-----------|-----------------|-----------|--------|---------|
| 1 | Jun 7 | Alice Chen | Bob Martinez | PST | Fri 4 PM |
| 2 | Jun 14 | Carol Singh | David Lee | PST | Fri 4 PM |
| 3 | Jun 21 | Elena Rodriguez | Frank Zhou | PST | Fri 4 PM |
| 4 | Jun 28 | Grace Kim | Hannah Jackson | PST | Fri 4 PM |
| 5 | Jul 5 | Ian Kumar | Julia Martinez | PST | Fri 4 PM |
| 6 | Jul 12 | Kevin O'Brien | Lisa Park | PST | Fri 4 PM |

### Shift Handoff Checklist

**Outgoing On-Call Engineer (Friday 4:00 PM):**
- [ ] Review current incidents and open issues
- [ ] Update runbooks with any new findings
- [ ] Transfer PagerDuty escalation policy
- [ ] Document any ongoing monitoring
- [ ] Share context via Slack thread in #ops-oncall
- [ ] Transfer laptop/credentials if physical shift
- [ ] Verify incoming engineer acknowledges handoff

**Incoming On-Call Engineer (Friday 4:00 PM):**
- [ ] Review last week's incidents in #ops-oncall
- [ ] Check open alerts and dashboards
- [ ] Acknowledge handoff in PagerDuty
- [ ] Post "On-call" status in Slack profile
- [ ] Verify phone/SMS notifications working
- [ ] Test PagerDuty mobile app
- [ ] Acknowledge to outgoing engineer

### On-Call Schedule Rules

1. **Maximum consecutive weeks:** 2 weeks (then 4-week break)
2. **Rotation fairness:** Balanced across team by calendar year
3. **Vacation/Time-off:** Swap with another engineer or find replacement
4. **Sick leave:** Notify manager immediately; secondary takes primary duties
5. **No double-shifts:** Never have same person primary + secondary in consecutive weeks

---

## On-Call Responsibilities

### During On-Call Week

#### Daily Monitoring (First Priority)
- [ ] Check Datadog dashboard first thing in morning
- [ ] Review alert history from previous 24 hours
- [ ] Scan Slack #incidents and #ops-oncall channels
- [ ] Verify health endpoints are returning green
- [ ] Note any performance trends

#### Incident Response (Immediate)
- [ ] **P1 Incident:** Acknowledge in PagerDuty within 2 minutes
- [ ] **P2 Incident:** Acknowledge in Slack within 10 minutes
- [ ] Follow appropriate runbook for incident type
- [ ] Post status updates every 15 minutes (P1) or 30 minutes (P2)
- [ ] Escalate per contact matrix if needed

#### Context & Handoff Duties
- [ ] Keep runbooks updated with lessons learned
- [ ] Document workarounds for known issues
- [ ] Flag recurring issues for deep investigation
- [ ] Update contact info if changes
- [ ] Prepare thorough handoff notes for next on-call

#### Availability Requirements
- [ ] Respond to Slack messages within 5 minutes (P1) / 30 minutes (P2)
- [ ] Check PagerDuty alerts within 2 minutes of trigger
- [ ] Be reachable by phone during incident
- [ ] Available for war room/call if needed
- [ ] May work from home but must be at computer during incidents

### Off-Call Responsibilities

- Assist with incident investigation if called in by escalation
- Review post-incident reports from other on-calls
- Suggest runbook improvements based on incidents you've worked
- Contribute to on-call knowledge base improvements

---

## Runbooks

### Runbook Template

Each runbook follows this structure:

```
## [INCIDENT TYPE]

### Detection
- How to identify this incident
- Key metrics/alerts
- False positive prevention

### Initial Assessment
- Questions to ask
- How to diagnose root cause
- Key tools/dashboards

### Immediate Actions (< 5 min)
- Quick wins that might resolve issue
- Safe operations to try first
- How to avoid making it worse

### Investigation Steps
- Deep-dive troubleshooting
- Commands to run
- Logs to check

### Resolution
- How to fix the underlying cause
- Deployment/config changes
- Verification steps

### Rollback Procedure
- How to revert if fix makes it worse
- Safe rollback timing

### Escalation Triggers
- When to call for help
- Who to contact
- What to communicate
```

---

## RUNBOOK: Database Slow Queries

### Detection

**Alert Triggers:**
- Datadog: `database.query_time > 5 seconds`
- Datadog: `database.connections > 85%` of pool
- PagerDuty: Critical alert from database monitoring
- User reports: "Dashboard is frozen" or "Upload timing out"

**Health Check:**
```bash
# Check database health endpoint
curl https://ipoready.com/api/health/database

# Expected response (< 100ms):
{
  "status": "healthy",
  "latency_ms": 45,
  "connections": 24/50,
  "slow_queries": 0
}
```

### Initial Assessment (< 2 minutes)

**Step 1: Verify the issue is real**
```bash
# Connect to Neon dashboard
https://console.neon.tech/app/projects

# Check branch status
# Look for: CPU usage, storage, connections
```

**Step 2: Check recent activity**
```bash
# SSH to production (if applicable)
# OR use Neon SQL editor

SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Step 3: Check current connections**
```sql
SELECT datname, usename, count(*) 
FROM pg_stat_activity 
GROUP BY datname, usename;
```

### Immediate Actions (< 5 minutes)

**Action 1: Kill long-running queries (if obvious)**
```sql
-- Find long queries
SELECT pid, usename, duration, query
FROM pg_stat_activity
WHERE duration > 30000;  -- 30 seconds

-- Kill if safe (verify it's not critical)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = <pid>;
```

**Action 2: Check for table locks**
```sql
SELECT * FROM pg_locks
WHERE NOT granted;
```

**Action 3: Restart database connection pool**
```bash
# If using Vercel edge functions
# Restart compute: 
curl -X POST https://api.vercel.com/v13/deployments \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"action":"scale"}'
```

### Investigation Steps

**Step 1: Identify slow query pattern**
```sql
-- Top 10 slowest queries (last hour)
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Reset stats after fix to track improvement
SELECT pg_stat_statements_reset();
```

**Step 2: Check index usage**
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname
FROM pg_tables t
JOIN pg_attribute a ON a.attrelname = t.tablename
WHERE schemaname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_indexes 
  WHERE tablename = t.tablename 
  AND indexdef LIKE '%' || a.attname || '%'
);
```

**Step 3: Analyze query execution plan**
```sql
-- If specific slow query identified:
EXPLAIN ANALYZE SELECT ... FROM ...;
-- Look for: Sequential scans on large tables, high rows, missing indexes
```

**Step 4: Check database stats**
```sql
-- Are table stats out of date?
SELECT schemaname, tablename, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > n_live_tup * 0.1;  -- > 10% dead tuples

-- Run vacuum if needed
VACUUM ANALYZE users;
```

### Resolution

**Option 1: Add Missing Index**
```sql
-- Identify missing index
CREATE INDEX CONCURRENTLY idx_companies_status 
ON companies(status) 
WHERE deleted_at IS NULL;

-- Wait for index creation (non-blocking)
-- Monitor with: SELECT * FROM pg_stat_activity;
```

**Option 2: Optimize Slow Query**
```sql
-- Rewrite query with better joins
-- Add WHERE clauses to filter early
-- Use LIMIT when appropriate
-- Avoid SELECT *
```

**Option 3: Increase Connection Pool**
```
# Update .env.production
DATABASE_CONNECTION_POOL_SIZE=100  # from 50

# Requires redeployment
npm run build && vercel deploy --prod
```

**Option 4: Run VACUUM ANALYZE**
```sql
-- Only if stats are clearly out of date
VACUUM ANALYZE;
-- This blocks writes for duration of operation
-- Only run during low-traffic window
```

### Verification Steps

```bash
# 1. Verify slow query metric improved
curl https://ipoready.com/api/health/database

# 2. Check query stats
SELECT avg(mean_exec_time) FROM pg_stat_statements;

# 3. Monitor for 10 minutes in Datadog
# Look for: steady latency, no spikes, < 1 sec avg

# 4. Check user reports in Slack
# Dashboard performance return to normal?
```

### Rollback Procedure

**If new index made it worse:**
```sql
-- Drop the index
DROP INDEX CONCURRENTLY idx_companies_status;
-- Non-blocking drop, automatically removes from planner
```

**If query optimization broke functionality:**
```bash
# Revert code change
git revert <commit-hash>
npm run build
vercel deploy --prod
```

**If config change failed:**
```bash
# Restore previous pool size
# Update .env.production
DATABASE_CONNECTION_POOL_SIZE=50
npm run build && vercel deploy --prod
```

### Escalation Triggers

**Escalate to Michael Zhang (Database Admin) if:**
- Query latency still > 5 seconds after immediate actions
- Multiple tables showing high dead tuple percentage
- Connection pool exhausted (> 95% utilization)
- Suspicion of data corruption

**Escalate to James Mitchell (Tech Lead) if:**
- Need emergency feature rollback
- Incident ongoing > 30 minutes
- Affecting multiple systems
- Requires code changes to ship

**Escalate to Sarah Thompson (VP Ops) if:**
- Database offline > 15 minutes
- Data loss suspected
- Customer SLA breached
- Media coverage risk

### Post-Incident

- Document root cause in #ops-oncall
- If new index added: update DATABASE_SCALING_HA_STRATEGY.md
- If query changed: update relevant API documentation
- Create GitHub issue to prevent recurrence

---

## RUNBOOK: API Latency Spikes

### Detection

**Alert Triggers:**
- Datadog: `api.response_time.p99 > 5 seconds`
- Datadog: `vercel.edge_function_duration > 3000ms`
- PagerDuty: API latency critical alert
- User reports: "Application is slow"

**Health Check:**
```bash
curl https://ipoready.com/api/health/performance

# Expected (p99 < 2 seconds):
{
  "status": "healthy",
  "latency_p50_ms": 250,
  "latency_p95_ms": 800,
  "latency_p99_ms": 1500,
  "error_rate": 0.01
}
```

### Initial Assessment (< 2 minutes)

**Step 1: Check Datadog dashboard**
- Navigate to: Production > API Latency
- Look for: Which endpoints are slow? All or specific ones?
- Check timeline: When did spike start? Still ongoing?

**Step 2: Identify affected endpoints**
```bash
# View slow endpoint metrics
# Datadog → APM → Services → ipoready-api
# Look at: /api/documents, /api/cap-table, /api/companies
```

**Step 3: Check compute resources**
```bash
# Vercel dashboard
https://vercel.com/ipoready/ipoready

# Look for:
# - Function invocations (spike?)
# - Edge function duration (high?)
# - Build logs (errors?)
```

### Immediate Actions (< 5 minutes)

**Action 1: Check for recent deployment**
```bash
# View recent deployments
vercel list deployments --limit 5

# Did we deploy in last 15 minutes?
# If yes, rollback immediately
vercel rollback
```

**Action 2: Check database load**
```bash
# If database-dependent endpoint is slow
# Follow Database Slow Queries runbook
curl https://ipoready.com/api/health/database
```

**Action 3: Kill N+1 query patterns**
```bash
# Search logs for repeated queries to same table
vercel logs production | grep "SELECT.*FROM.*WHERE id IN"

# If found, backend fix needed - escalate
```

**Action 4: Enable caching headers**
```bash
# If not already enabled, add cache-control
# for frequently accessed, rarely-changing endpoints
# Requires code change: don't fix in production manually
```

### Investigation Steps

**Step 1: Identify slow endpoint(s)**
```bash
# From Datadog APM, get endpoint with highest p99
# Examples:
# - GET /api/documents (should be < 500ms)
# - POST /api/cap-table/upload (should be < 2000ms)
# - GET /api/companies/:id (should be < 300ms)
```

**Step 2: Check for N+1 queries**
```bash
# In relevant API route file, check:
# - Are we fetching user, then company, then documents in loop?
# - Should be single query with JOINs

# Enable query logging temporarily
process.env.DEBUG = 'prisma:query'

# Redeploy and check logs
```

**Step 3: Check external service latency**
```bash
# If API calls external services (Stripe, Google Drive, etc)
# Check their status pages:
stripe.com/status
status.workspace.google.com

# Monitor their response times
# If they're slow, that's the bottleneck
```

**Step 4: Analyze function execution time**
```bash
# Datadog → APM → ipoready-api → [endpoint]
# Check span waterfall:
# - Does database query take 4000ms? → Database issue
# - Does Stripe call take 3000ms? → External service
# - Does processing take 2000ms? → Code optimization
```

### Resolution

**Option 1: Optimize slow query**
```typescript
// BEFORE: N+1 query
const companies = await db.company.findMany();
for (const company of companies) {
  company.documents = await db.documents.findMany({
    where: { companyId: company.id }
  });
}

// AFTER: Single query
const companies = await db.company.findMany({
  include: { documents: true }
});
```

**Option 2: Add database query caching**
```typescript
// Cache frequent queries
const cacheKey = `companies:${id}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

const data = await db.company.findUnique({ where: { id } });
await redis.set(cacheKey, data, 'EX', 300); // 5 min cache
return data;
```

**Option 3: Reduce payload size**
```typescript
// BEFORE: Return all fields
const data = await db.company.findMany();

// AFTER: Return only needed fields
const data = await db.company.findMany({
  select: {
    id: true,
    name: true,
    status: true
    // omit: large fields like documents, history
  }
});
```

**Option 4: Add timeout to external service calls**
```typescript
// If Stripe/Google Drive calls hanging
const result = await stripe.customers.list({
  timeout: 5000  // 5 second max wait
});
```

**Option 5: Increase function timeout**
```
# In vercel.json
{
  "functions": {
    "src/app/api/cap-table/**": {
      "maxDuration": 60  // was 30, now 60 seconds
    }
  }
}
```

### Verification Steps

```bash
# 1. Deploy fix
git add .
git commit -m "Optimize API latency for [endpoint]"
git push origin main
# Deploy via Vercel (automatic or manual)

# 2. Monitor latency improvement
# Datadog → wait 5 minutes for new data
# Check p99 latency → should be < 2 seconds

# 3. Load test affected endpoint
curl -N https://ipoready.com/api/documents  # Should be fast

# 4. Check for errors
# Datadog → APM → Errors → should be 0
```

### Rollback Procedure

```bash
# If optimization breaks functionality
git revert <commit-hash>
vercel deploy --prod

# Monitor error rate to return to 0%
```

### Escalation Triggers

**Escalate if:**
- Latency still > 5 seconds after immediate actions
- Affecting all endpoints (infrastructure issue)
- Error rate increasing alongside latency
- External service unavailable (Stripe, Google, etc)
- Need backend code changes (escalate to James Mitchell)

### Post-Incident

- Update API documentation with new response times
- Add performance test for this endpoint
- Document optimization in PERFORMANCE_OPTIMIZATION_GUIDE.md
- Share learnings in #ops-oncall

---

## RUNBOOK: Third-Party Service Outages

### Detection

**Possible Outages:**
- **Stripe Payment Processing** → Users cannot upgrade or make payments
- **Google Drive Integration** → Users cannot upload documents
- **Resend Email** → Password resets, notifications not sending
- **Twilio SMS** → SMS notifications not sending
- **Neon Database** → Application completely down (rare)
- **Vercel Hosting** → Application down (rare)

**How to Detect:**
- Datadog alert: `external_service.request_failed`
- User report: "I can't upgrade my account"
- PagerDuty alert: `third_party_service_down`
- Service status page: Check all vendor status pages

### Initial Assessment (< 2 minutes)

**Step 1: Confirm service is actually down**
```bash
# Check the vendor's status page
stripe.com/status          # Stripe status
console.neon.tech          # Neon status
status.vercel.com          # Vercel status
status.workspace.google.com # Google status
```

**Step 2: Check for recent changes**
```bash
# Did we change any API keys/credentials?
git log --oneline -5

# Recent version upgrades?
npm list stripe @google-cloud google-api-library
```

**Step 3: Verify it's not our code**
```bash
# Check if endpoint that uses service is accessible
curl -v https://ipoready.com/api/payments/create
curl -v https://ipoready.com/api/documents/upload

# Is error 502 (bad gateway) or timeout? = Service issue
# Is error 500 (internal) with specific message? = Our code
```

### Immediate Actions (< 5 minutes)

**Action 1: Post status update**
```
#incidents: "Investigating: [Service Name] may be experiencing issues"
```

**Action 2: Check vendor status page**
- Stripe: status.stripe.com → Any incidents?
- Google: status.workspace.google.com → Any incidents?
- Neon: console.neon.tech → Status indicator
- Resend: status.resend.com → Any incidents?
- Twilio: status.twilio.com → Any incidents?

**Action 3: If confirmed outage**
```
#incidents: "[SERVICE] is down. ETA: [check status page]"
```

**Action 4: Enable graceful degradation (if applicable)**
```bash
# For payment processing:
# Temporarily disable upgrade prompts
# Show user message: "Payment system temporarily unavailable"

# For email:
# Queue emails, retry later
# Show user message: "Email will be sent when service recovers"

# For document upload:
# Disable upload UI temporarily
# Show user message: "Document upload temporarily unavailable"
```

### Investigation Steps

**Step 1: Monitor incident progress**
```bash
# Check status page every 5 minutes
# Look for: ETA, current status, affected services

# Check Twitter/status pages for updates
# Examples:
# - @stripe status
# - @TwilioAPI status
# - @neon_postgres status
```

**Step 2: Verify our integration**
```bash
# Test API key validity (if service partially up)
curl -X GET https://api.stripe.com/v1/account \
  -H "Authorization: Bearer $STRIPE_API_KEY"

# Should return: { "id": "acct_..." }

# If 401/403: Key might be revoked, check Stripe dashboard
```

**Step 3: Check for cascading failures**
```bash
# If Stripe down, are users stuck in "processing" state?
SELECT * FROM subscriptions WHERE status = 'processing' AND updated_at < NOW() - INTERVAL '30 minutes';

# If found, might need manual cleanup later
```

### Resolution

**Option 1: Wait for service recovery (Most common)**
- Monitor status page
- Check every 5 minutes
- Post updates to #incidents
- Once recovered, verify with test calls
- Update incident status to RESOLVED

**Option 2: Switch to backup service (if available)**
```bash
# Example: If Stripe down, switch to PayPal
# Update .env.production
PAYMENT_PROVIDER=paypal  # was stripe

# Requires code change: don't manually fix in prod
# Contact James Mitchell for emergency deployment
```

**Option 3: Implement circuit breaker**
```typescript
// If service unavailable, fail gracefully
const stripe = require('stripe')(process.env.STRIPE_API_KEY, {
  maxNetworkRetries: 2,
  timeout: 5000
});

try {
  await stripe.customers.create({ ... });
} catch (error) {
  if (error.code === 'ETIMEDOUT') {
    // Service slow/down: queue for retry
    await queueForRetry({ ...params });
    return { success: false, queued: true };
  }
  throw error;
}
```

**Option 4: For prolonged outage (> 1 hour)**
```bash
# Escalate to VP Ops
# Notify customers: "Provider [X] experiencing issues"
# Consider compensation: free month subscription extension
# Contact provider: Is there ETA? Do they need more info?
```

### Communication Strategy

**To Users (P1 outage > 15 min):**
```
Subject: Service Update - [Service] Temporarily Unavailable

Hi [Name],

[SERVICE_NAME] is currently experiencing technical difficulties 
affecting [FEATURE] functionality. We're monitoring the situation 
and expect full recovery within [ETA].

In the meantime:
- [WORKAROUND if available]
- Check status: [STATUS_PAGE_URL]

We apologize for the inconvenience.

IPOReady Team
```

**To Leadership (P1 outage > 30 min):**
```
Slack: @james-mitchell @sarah-thompson

[SERVICE] outage affecting [FEATURE].
- Started: [TIME]
- Current status: [INVESTIGATING / WAITING FOR RECOVERY]
- User impact: ~[N] users affected
- ETA: [FROM STATUS PAGE]
- Our action: [WHAT WE'RE DOING]
```

### Rollback Procedure

**None needed** - Third-party outages resolve on their own when service recovers.

However, if we deployed a change that made impact worse:
```bash
git revert <commit-hash>
vercel deploy --prod
```

### Escalation Triggers

**Escalate to James Mitchell if:**
- Service down > 15 minutes and no ETA
- We need to switch providers or enable degraded mode
- Customers requesting refunds/compensation

**Escalate to Sarah Thompson if:**
- Service down > 1 hour
- Multiple customers contacting support
- Media/PR considerations
- Need to issue public status

**Escalate to Marcus (CEO) if:**
- Service down > 2 hours
- Significant revenue impact (e.g., payment processing)
- PR issue (service name in news)

### Post-Incident

- Document in incident report: which service, duration, impact
- Update documentation if we discovered workarounds
- Consider: should we add redundancy for this service?
- Add monitoring for this service to alert faster next time

### Service-Specific Notes

#### Stripe Outage
- **Workaround:** Queue payment for retry when service recovers
- **User message:** "Payment queued, will process when system recovers"
- **Data impact:** None if we queue properly
- **Recovery:** Automatic retry every 5 minutes

#### Google Drive Outage
- **Workaround:** Queue document upload for later processing
- **User message:** "Document queued, will sync when service recovers"
- **Data impact:** Documents stored locally, synced when Google recovers
- **Recovery:** Automatic sync on next login

#### Resend Email Outage
- **Workaround:** Queue email, retry automatically
- **User message:** None needed (transparent)
- **Data impact:** Emails delayed but not lost
- **Recovery:** Auto-retry every 1 hour for 24 hours

---

## RUNBOOK: Data Corruption Detected

### Detection

**Indicators of data corruption:**
- Users report: "My data is wrong" or "Documents disappeared"
- Audit log shows: Delete operations they didn't perform
- Database check shows: Constraint violations, orphaned records
- Alerts: `data_integrity.validation_failed`

**Database constraint check:**
```sql
-- Check for orphaned documents (no company)
SELECT * FROM documents WHERE company_id NOT IN (
  SELECT id FROM companies
);

-- Check for negative amounts
SELECT * FROM billing_events WHERE amount < 0;

-- Check for future dates
SELECT * FROM created_at FROM users WHERE created_at > NOW();
```

### Initial Assessment (< 2 minutes)

**CRITICAL: Inform stakeholders immediately**
```
#incidents: "🚨 CRITICAL: Potential data corruption detected. 
Investigating. Standby for updates."

Tag: @james-mitchell @sarah-thompson @rebecca-sec
```

**Step 1: Stop writes if corruption is spreading**
```sql
-- If corruption is recent/ongoing, consider:
ALTER TABLE companies SET (autovacuum_enabled = false);
-- This prevents auto-cleanup while we investigate
-- But prevents new corruption from cleaning itself up
```

**Step 2: Take immediate backup**
```bash
# Backup full database RIGHT NOW
pg_dump -h [host] -U [user] -d ipoready > /tmp/backup-corruption-$(date +%s).sql

# OR via Neon console:
# Create branch from current state (freezes in time)
neon branches create --parent main --name "corruption-backup-$(date +%s)"
```

**Step 3: Identify scope of corruption**
```sql
-- What's affected?
SELECT COUNT(*) FROM documents WHERE company_id IS NULL;
SELECT COUNT(*) FROM billing_events WHERE amount < 0;
SELECT COUNT(*) FROM users WHERE created_at > NOW();

-- When did it start?
SELECT MIN(updated_at) FROM documents WHERE company_id IS NULL;
```

### Investigation Steps

**Step 1: Find root cause**
```bash
# Check recent code changes
git log --oneline -20 | grep -E "(delete|update|database)"

# Did we deploy recently? When?
vercel list deployments --limit 10

# Check application logs for errors
vercel logs production | grep -i "error\|failed\|exception"
```

**Step 2: Check database logs**
```sql
-- Check for unusual queries
SELECT * FROM pg_stat_statements
WHERE query LIKE '%DELETE%' OR query LIKE '%UPDATE%'
ORDER BY calls DESC;

-- Check for failed transactions
SELECT * FROM pg_logs
WHERE message LIKE '%ERROR%'
ORDER BY timestamp DESC;
```

**Step 3: Review audit logs**
```sql
-- If you have audit trail table
SELECT * FROM audit_log
WHERE operation IN ('DELETE', 'UPDATE')
ORDER BY created_at DESC
LIMIT 50;

-- Who made the change?
SELECT DISTINCT user_id FROM audit_log
WHERE operation = 'DELETE'
AND created_at > NOW() - INTERVAL '1 hour';
```

**Step 4: Compare to backup**
```bash
# Restore backup to separate database for analysis
pg_restore -h backup-host -U user -d ipoready_backup /tmp/backup.sql

# Compare corruption database to clean backup
SELECT * FROM main_db.documents EXCEPT
SELECT * FROM backup_db.documents;
# Shows all rows that exist in corrupted but not backup
```

### Resolution Options

**Option 1: Restore from backup (If corruption recent)**
```bash
# IF and ONLY IF:
# - Corruption happened < 1 hour ago
# - Backup is clean
# - Data loss is acceptable

# Restore to point-in-time
# Contact Michael Zhang (Database Admin) - this is dangerous

# From Neon console:
# 1. Create new branch from old backup
# 2. Promote it to main
# 3. Verify data is correct
```

**Option 2: Selective rollback (Surgical)**
```sql
-- Restore specific affected records from backup
INSERT INTO documents 
SELECT * FROM backup.documents
WHERE id IN (SELECT id FROM documents WHERE company_id IS NULL)
AND id NOT IN (SELECT id FROM documents WHERE company_id IS NOT NULL);

-- Verify before committing
SELECT COUNT(*) FROM documents WHERE company_id IS NULL;
-- Should now be 0
```

**Option 3: Fix with database query (If simple)**
```sql
-- Example: Orphaned documents
-- Find what they should link to based on audit trail
UPDATE documents
SET company_id = (
  SELECT company_id FROM audit_log
  WHERE entity_id = documents.id
  AND operation = 'CREATE'
  LIMIT 1
)
WHERE company_id IS NULL;
```

**Option 4: Revert code change**
```bash
# If caused by recent code change
git log --oneline -5
git revert <problematic-commit>
npm run build
vercel deploy --prod

# Then monitor for further corruption
```

### Verification Steps

```bash
# 1. Verify corruption is fixed
psql -c "SELECT COUNT(*) FROM documents WHERE company_id IS NULL;"
# Should return: 0

# 2. Check data consistency
SELECT COUNT(*) FROM documents d
LEFT JOIN companies c ON d.company_id = c.id
WHERE c.id IS NULL AND d.company_id IS NOT NULL;
# Should return: 0

# 3. Spot check sample data
SELECT * FROM documents ORDER BY id DESC LIMIT 10;
# Manually verify looks correct

# 4. Check audit trail
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20;
# Verify no suspicious delete/update operations
```

### Communication Strategy

**To Leadership (Immediate):**
```
Slack urgent: @james-mitchell @sarah-thompson

Data Corruption Alert:
- Affected data: [WHAT]
- Scope: ~[N] records
- Root cause: [UNDER INVESTIGATION]
- Action: [BACKUPS TAKEN, INVESTIGATING]
- Timeline: [ETA for resolution]
- User impact: [X] affected

Will update every 15 minutes.
```

**To Affected Users (If resolution > 30 min):**
```
Subject: Important - Data Issue & Resolution

We discovered and identified a data issue affecting your account.
We have NOT lost your data (full backups intact).
We are working to resolve within [HOURS].

What we're doing:
- Backed up all data
- Identified root cause
- Testing fix in safe environment
- Will deploy fix within [TIME]

We apologize for the inconvenience.
IPOReady Team
```

### Escalation Triggers

**Immediate escalation (P1):**
- Data corruption confirmed → Escalate to Rebecca Wilson (Security Lead)
- Any data loss suspected → Escalate to Michael Zhang + James Mitchell
- Customer data exposed → Escalate to Marcus (CEO) + Legal

**Call for emergency response if:**
- Corruption ongoing/spreading
- > 10,000 records affected
- Financial data involved (billing)
- Customer confidential information exposed
- Regulatory breach suspected (SEC, GDPR)

### Post-Incident

**Critical follow-up required:**

1. **Root Cause Analysis Report**
   - What happened?
   - Why did it happen?
   - Why didn't we detect it earlier?
   - How do we prevent it?

2. **Improvements to implement:**
   - Add database constraint to prevent future occurrence
   - Add monitoring/alerting for this type of corruption
   - Add test case that would have caught this
   - Document in runbooks

3. **Regulatory considerations:**
   - SEC filing required? (if affects financial data)
   - GDPR breach notification? (if customer data exposed)
   - Customer notification required?
   - Insurance claim? (cyber liability)

4. **Communication:**
   - Transparency report to customers
   - "Lessons learned" Slack post
   - Update incident review process

---

## Tools & Integration

### PagerDuty Integration

**Setup:**
```bash
# Install PagerDuty mobile app
https://apps.apple.com/app/pagerduty/id594039512

# In app:
1. Open settings
2. Add account: [IPOREADY_ACCOUNT_ID]
3. Enable notifications: Calls + SMS
4. Enable critical escalation policy
```

**During Incident:**
```
1. Receive alert: Phone call + SMS + app notification
2. Acknowledge: Tap notification or reply to SMS
3. Respond: "ack" to SMS = acknowledged
4. Resolve: Tap "Resolve" in app when fixed
```

**Test integration:**
```bash
# Ask another engineer to trigger test alert
# Verify you receive call/SMS within 30 seconds
```

### Datadog Monitoring

**Access:**
- **URL:** https://app.datadoghq.com
- **Account:** IPOReady Production
- **Username:** [your-email]@ipoready.com
- **Setup:** SAML login with company Google account

**Key Dashboards:**
1. **API Latency** - Response times by endpoint
2. **Database Performance** - Query times, connections
3. **Error Tracking** - Exception rates and types
4. **Infrastructure** - CPU, memory, disk usage
5. **Third-Party Services** - Stripe, Google, Resend status

**Common Queries:**
```
# API latency p99
avg:trace.web.request.duration{service:ipoready-api}.percentile(0.99)

# Database slow queries
avg:trace.db.query.duration{service:ipoready-api} > 5s

# Error rate
trace.error_rate{service:ipoready-api}

# Stripe API failures
trace.web.request.duration{service:ipoready-api,endpoint:/api/payments}
```

### Slack Integration

**Channels:**
- `#incidents` - Real-time incident updates
- `#ops-oncall` - On-call notes, handoff, scheduling
- `#alerts-critical` - Automated P1 alerts
- `#alerts-warning` - Automated P2 alerts

**Status updates in #incidents:**
```
⏰ [HH:MM] INCIDENT: [Brief description]
🔴 Status: [INVESTIGATING | WORKING ON FIX | MONITORING]
📊 Impact: [X] users affected, [FEATURE] unavailable
🔍 Root cause: [Under investigation | FOUND: [description]]
⏱️ ETA: [TIME] for resolution
🔗 Datadog: [LINK]
```

**Incident escalation:**
```
@james-mitchell P1 Incident - API down
Response SLA: 5 min ACK, 15 min mitigate
Started: [TIME]
Current status: [INVESTIGATING]
```

### Health Check Endpoints

**Monitor these every 5 minutes:**

```bash
# General system health
curl https://ipoready.com/api/health
# Returns: { status: "ok", uptime_ms, timestamp }

# API performance
curl https://ipoready.com/api/health/performance
# Returns: { status, latency_p50, p95, p99 }

# Database health
curl https://ipoready.com/api/health/database
# Returns: { status, latency_ms, connections }

# Payment system
curl https://ipoready.com/api/health/payments
# Returns: { status, stripe_connection_ok, last_test_at }
```

### Local Incident Investigation Tools

**SSH Access (if applicable):**
```bash
ssh ubuntu@[production-host]

# View recent logs
tail -100 /var/log/ipoready/app.log

# Check service status
systemctl status ipoready-app
systemctl status ipoready-worker

# Check disk space
df -h

# Check memory
free -h

# View process list
ps aux | grep node
```

**Database Access:**
```bash
# Connect to production database (Neon)
psql postgresql://[user]:[pass]@[host]/ipoready

# Quick health checks
SELECT 1;  # Connection test
\dt        # List tables
\di        # List indexes
```

**Container/Deployment Access (Vercel):**
```bash
# Login to Vercel CLI
vercel login

# View logs
vercel logs production

# See recent deployments
vercel list deployments

# Trigger rollback if needed
vercel rollback
```

---

## Post-Incident Review Process

### Timing

| Severity | Review Scheduled | Attendees | Duration |
|----------|------------------|-----------|----------|
| P1 | Within 24 hours | All involved + leadership | 1 hour |
| P2 | Within 2 business days | All involved + tech lead | 45 min |
| P3 | Within 1 week | On-call + reporter | 30 min |

### P1 Post-Incident Review Template

**Document Location:** Google Docs - [Incident Postmortem](https://docs.google.com/document/d/POSTMORTEM_TEMPLATE_ID/edit)

**Required sections:**

1. **Timeline (What happened)**
   ```
   - 14:32 UTC: Alert triggered - API latency spike
   - 14:34 UTC: On-call acknowledged, investigation started
   - 14:41 UTC: Root cause identified - missing database index
   - 14:45 UTC: Index creation started
   - 14:52 UTC: Latency returned to normal
   - 15:00 UTC: All-clear confirmed
   
   Total incident time: 28 minutes
   Time to detection: 2 minutes (automated alert)
   Time to identification: 9 minutes
   Time to fix: 11 minutes
   ```

2. **Root Cause Analysis**
   ```
   Why it happened:
   - Query optimization introduced in PR #1234 created N+1 pattern
   - Query loaded all 50k documents instead of first 100
   - Lack of test data with realistic scale
   
   Why we didn't catch it:
   - Unit tests use < 100 records
   - Integration tests not run on staging with prod-like data
   - Code review missed query pattern
   
   Why it wasn't detected earlier:
   - No automated query performance test
   - No alert for "document fetch > 5s"
   ```

3. **Severity Assessment**
   ```
   Actual severity: P1 (correct)
   
   Impact:
   - 150 concurrent users affected
   - Dashboard unusable for 28 minutes
   - Estimated revenue impact: $0 (no failed payments)
   - Reputation impact: Low (early morning, few users)
   ```

4. **Action Items for Prevention**
   ```
   HIGH PRIORITY:
   [ ] Add query performance test with 50k+ document records
   [ ] Enable query logging alert for > 3 second queries
   [ ] Add code review checklist item for N+1 patterns
   [ ] Load test on staging for each deployment
   
   MEDIUM PRIORITY:
   [ ] Create database index monitoring dashboard
   [ ] Document query optimization best practices
   [ ] Update onboarding guide with performance testing
   
   LOW PRIORITY:
   [ ] Consider observability tool for distributed tracing
   [ ] Implement cache layer for frequently accessed documents
   ```

5. **Lessons Learned**
   ```
   What went well:
   + Alert triggered within 2 minutes
   + Team responded quickly
   + Clear communication in Slack
   + Identified root cause before deploying fix
   
   What could be better:
   - Staging environment should match production scale
   - Query performance tests should run on every PR
   - On-call engineer should have quick access to slow query logs
   ```

6. **Follow-up Verification**
   ```
   - [ ] Action items assigned to owners with due dates
   - [ ] PR created for code/config fixes
   - [ ] Monitoring updated to catch future occurrences
   - [ ] Runbook updated with new insights
   - [ ] Team trained on prevention strategies
   ```

### Incident Review Meeting

**Facilitation:**
1. **Blameless culture** - Focus on systems, not people
2. **Psychological safety** - All perspectives welcome
3. **Action items** - Concrete, assigned, deadline
4. **Documentation** - Captured for future reference

**Sample agenda (60 min):**
```
0-5 min:   Welcome, goal-setting
5-15 min:  Incident timeline walkthrough
15-30 min: Root cause analysis discussion
30-45 min: Action items brainstorm & assignment
45-55 min: Lessons learned & appreciation
55-60 min: Scheduling follow-ups & closing
```

### Runbook Updates

**After every incident:**
1. Update relevant runbook with new troubleshooting steps
2. Add any new tools/commands discovered during incident
3. Clarify escalation procedures if needed
4. Share in #ops-oncall Slack channel
5. Credit the engineer who discovered the fix

**Example:**
```markdown
## Update (Incident #2026-06-07-001)

Added new troubleshooting step for N+1 queries:
```bash
# Check for repeated queries to same table
vercel logs production | grep "SELECT.*FROM.*WHERE id IN"
```

Added escalation trigger: Document fetch > 5 seconds
```

### Knowledge Base Updates

**Capture learnings in:**
- `/docs/INCIDENT_RESPONSE.md` - Update runbooks
- `/docs/DATABASE_SCALING_HA_STRATEGY.md` - If database-related
- `/docs/PERFORMANCE_OPTIMIZATION_GUIDE.md` - If performance-related
- `/docs/OPERATIONS_AND_DEPLOYMENT_GUIDE.md` - If deployment-related

---

## Appendix: Quick Reference

### Emergency Contacts (One-Page)

```
P1 INCIDENT - CALL IMMEDIATELY:

On-Call Engineer: [+1 (415) XXX-XXXX]
Tech Lead (James): [+1 (415) XXX-XXXX]
VP Ops (Sarah): [+1 (415) XXX-XXXX]
CEO (Marcus): [+1 (415) XXX-XXXX] - data loss only

Status page: https://status.ipoready.com
Incident channel: #incidents in Slack
Datadog: https://app.datadoghq.com/
PagerDuty: https://ipoready.pagerduty.com/
```

### Top 5 Most Common Incidents

1. **Database Slow Queries** (40% of P1s)
   - See: Database Slow Queries Runbook
   - First action: Check pg_stat_statements

2. **API Latency Spikes** (25% of P1s)
   - See: API Latency Spikes Runbook
   - First action: Check for recent deployment

3. **Memory Leak** (15% of P1s)
   - Check: Vercel function memory usage
   - Solution: Redeploy or rollback

4. **Stripe Payment Processing** (12% of P1s)
   - Check: stripe.com/status
   - Workaround: Queue for retry

5. **Database Connection Pool Exhaustion** (8% of P1s)
   - Check: SELECT count(*) FROM pg_stat_activity;
   - Solution: Restart connection pool or increase size

### Tools Quick Start

| Tool | URL | Login | Purpose |
|------|-----|-------|---------|
| Datadog | app.datadoghq.com | Google SSO | Monitoring & alerts |
| PagerDuty | ipoready.pagerduty.com | Email + 2FA | Escalation & on-call |
| Vercel | vercel.com | GitHub | Deployments & logs |
| Neon | console.neon.tech | Email | Database management |
| Stripe | dashboard.stripe.com | Email + 2FA | Payment processing |

### Documentation Index

| Document | Location | When to Use |
|----------|----------|-------------|
| This file | `/docs/ON_CALL.md` | Any incident |
| Incident Response | `/docs/INCIDENT-RESPONSE.md` | Incident procedures |
| Database Runbook | `/docs/DATABASE_OPERATIONS_RUNBOOK.md` | DB issues |
| Operations Guide | `/docs/OPERATIONS_AND_DEPLOYMENT_GUIDE.md` | Deployment/config |
| Monitoring Guide | `/docs/MONITORING_DEPLOYMENT.md` | Alert setup |
| Performance Guide | `/docs/PERFORMANCE_OPTIMIZATION_GUIDE.md` | Latency issues |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-07 | DevOps Team | Initial complete on-call guide with runbooks |

---

**Last Updated:** June 7, 2026  
**Next Review:** June 21, 2026 (End of first rotation cycle)  
**Questions?** Ask in #ops-oncall or contact James Mitchell
