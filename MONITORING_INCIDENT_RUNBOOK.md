# IPOReady Monitoring Incident Runbook

**Last Updated:** June 7, 2026  
**Status:** Production Ready  
**Use During:** Active Incidents Only

---

## Table of Contents

1. [Incident Severity Levels](#incident-severity-levels)
2. [General Incident Response](#general-incident-response)
3. [Specific Incident Procedures](#specific-incident-procedures)
4. [Database Issues](#database-issues)
5. [API Issues](#api-issues)
6. [Performance Issues](#performance-issues)
7. [Communication & Escalation](#communication--escalation)
8. [Post-Incident Review](#post-incident-review)

---

## Incident Severity Levels

### CRITICAL (P1) - Respond Now

**Definition:** Service completely down or users cannot use core functionality

**Examples:**
- All 5xx errors
- Database unreachable
- Complete API outage
- Authentication broken

**Response:** 
- Page on-call engineer immediately (5 min)
- Update status page every 5 minutes
- Aim to resolve in < 30 minutes

**Channels:**
- `#incidents` - real-time updates
- PagerDuty - page engineer
- Email - notify stakeholders
- Status page - external communication

---

### HIGH (P2) - Respond Soon

**Definition:** Significant degradation, users experiencing issues

**Examples:**
- 10%+ of requests failing
- API latency > 1 second
- Database very slow
- Feature unavailable

**Response:**
- Acknowledge within 5 minutes
- Investigate root cause within 15 minutes
- Update status page every 15 minutes
- Aim to resolve in < 2 hours

**Channels:**
- `#alerts-high` - updates
- Email - notify team

---

### MEDIUM (P3) - Investigate

**Definition:** Minor degradation, potential issue

**Examples:**
- Error rate 0.5-1%
- Latency elevated but acceptable
- Non-critical feature slower
- One region affected

**Response:**
- Investigate within 30 minutes
- Create ticket for resolution
- Fix within current sprint

**Channels:**
- `#alerts-medium` - updates
- Jira ticket - tracking

---

### LOW (P4) - Log & Schedule

**Definition:** Very minor or future-looking issue

**Examples:**
- Single user report
- Expected scheduled maintenance
- Minor log warnings
- Non-critical metric deviation

**Response:**
- Create ticket
- Schedule for next sprint
- No urgency

**Channels:**
- Jira ticket - tracking

---

## General Incident Response

### Step 1: Alert Received (T+0)

**Action:**
```
1. Read full alert message
2. Check alert dashboard
3. Note: exact metric, current value, threshold
4. Acknowledge in Slack ✅
5. Note time (T+0 = incident start time)
```

**Questions to Ask:**
- What triggered the alert?
- When did it start?
- What changed recently?
- Who's affected?

---

### Step 2: Initial Triage (T+1-3 min)

**Goal:** Determine if this is a real issue or false alarm

**Checklist:**
```
□ Check Datadog dashboard (not just alert message)
□ Check recent deployments
□ Check third-party status pages
□ Check client browser logs
□ Verify with actual user if needed
```

**Decision Tree:**
```
Is the metric actually elevated?
├─ NO → False alarm. Investigate threshold. Go to "False Alarm"
└─ YES → Real issue. Continue to diagnosis
  
Is this from a recent deployment?
├─ YES → Investigate rollback. Go to "Rollback Check"
└─ NO → Investigate other causes
```

---

### Step 3: Diagnosis (T+3-10 min)

**Goal:** Find root cause

**Method:** Check the 3 layers
```
1. Application Layer
   - Datadog APM traces
   - Error messages
   - Recent code changes

2. Infrastructure Layer
   - CPU, memory, disk usage
   - Network latency
   - Vercel build status

3. Database Layer
   - Connection pool status
   - Slow query log
   - Replication lag
```

**Specific Diagnosis Steps:**
```
If P99 latency is high:
└─ Check APM traces for slowest requests
   ├─ Is database slow? → Check query performance
   ├─ Is third-party slow? → Check API status
   └─ Is app slow? → Check memory/CPU

If error rate is high:
└─ Check error logs for patterns
   ├─ Same endpoint? → Check code
   ├─ Same user? → Check permissions
   ├─ All endpoints? → Check database/external API
   └─ Rate limit related? → Check usage

If database is slow:
└─ Check connection pool usage
   ├─ > 90%? → Kill idle connections
   ├─ Long queries? → Kill old ones
   └─ Corrupted index? → Run REINDEX
```

---

### Step 4: Mitigation (T+10-15 min)

**Goal:** Stop the bleeding immediately

**Options (in order of preference):**

1. **Kill Bad Process**
   - Long-running query? Kill it.
   - Runaway job? Kill it.
   - Bad deployment? Rollback.

2. **Scale Resources**
   - Out of memory? Scale up.
   - CPU maxed? Scale up.
   - Connections exhausted? Increase pool.

3. **Circuit Breaker**
   - Third-party API failing? Enable fallback.
   - Feature broken? Disable temporarily.
   - Rate limiting user? Block them.

4. **Rollback**
   - Recent deploy causing issues? Rollback.
   - Database migration broken? Rollback.
   - Config change bad? Revert.

**Do NOT:**
- Restart without understanding why (will recur)
- Scale indefinitely (masks real issue)
- Ignore problem hoping it goes away
- Make major changes during incident (risky)

---

### Step 5: Verification (T+15-20 min)

**Goal:** Confirm fix is working

**Checklist:**
```
□ Alert stopped firing?
□ Dashboard metrics back to normal?
□ Synthetic tests passing?
□ Sample user request successful?
□ Error logs showing decline?
□ No cascading failures?
```

**If Not Fixed:**
- Go back to diagnosis
- Try next mitigation option
- Page backup engineer if unsure

---

### Step 6: Communication (Ongoing)

**Every 5-10 minutes:**
```
Post in #incidents:
"[HH:MM UTC] Status: Investigating
Current: [metric value]
Action: [what we're doing]
Next update: [time]"
```

**When Resolved:**
```
Post in #incidents:
"[HH:MM UTC] RESOLVED
Duration: [X minutes]
Root cause: [brief explanation]
Fix applied: [what we did]
Impact: [users affected]"
```

---

### Step 7: Post-Incident (T+after resolution)

**Immediately:**
- [ ] Stand down on-call (if not already)
- [ ] Close PagerDuty incident
- [ ] Archive status page update

**Within 24 hours:**
- [ ] Write incident postmortem
- [ ] Identify root cause
- [ ] Plan prevention (if possible)
- [ ] Update runbooks
- [ ] Share learnings with team

---

## Specific Incident Procedures

### Incident: 5xx Error Surge

**Alert:** `avg:trace.status_code{status_code:5xx} > 5`

**Symptoms:**
- Users see error pages
- API returning 500/502/503/504
- Multiple affected endpoints

**Diagnosis (3 min):**
```bash
# Check deployment
# Vercel Dashboard → Deployments → was anything deployed in last 10 min?

# Check logs
# Datadog → Logs → filter service:ipoready status:error status_code:5*

# Check database
psql postgresql://... -c "SELECT 1"

# Check third-party
# Stripe status page
# Claude API status
# Neon status page
```

**Mitigation (by root cause):**

**If Recent Deployment:**
```
1. Vercel Dashboard → Click deployment
2. Click "Rollback" button
3. Confirm rollback
4. Wait 2 minutes for traffic to shift
5. Monitor error rate decline
```

**If Database Unreachable:**
```
1. Check Neon console - is database up?
2. Check firewall - can we reach database?
3. Try psql connection
4. If still down, failover to replica (Neon UI)
5. Update connection string if needed
```

**If Third-Party API Down:**
```
1. Check status page (stripe.com, status.anthropic.com, etc)
2. Identify which API
3. Enable feature flag to disable that feature
4. Or implement fallback/retry logic
5. Monitor for API recovery
```

**If Unclear:**
```
1. Don't restart service (will recur)
2. Rollback recent deployment as safest option
3. Monitor for improvement
4. If doesn't help, investigate further
```

---

### Incident: High Latency (P99 > 300ms)

**Alert:** `p99(trace.duration) > 300ms`

**Symptoms:**
- Website feels slow
- API responses take 1-5 seconds
- Users report timeouts

**Diagnosis (3 min):**
```bash
# Check APM trace
Datadog → APM → Traces → filter recent slow traces

# Read the trace
Find slowest span (usually database query)

# Check database performance
psql postgresql://... -c "
SELECT mean_exec_time, calls, query 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 5;"

# Check system resources
CPU? Memory? Network?
```

**Mitigation Options:**

**If Database Query Slow:**
```sql
-- Analyze query plan
EXPLAIN ANALYZE SELECT ...;

-- Is missing index?
CREATE INDEX idx_name ON table(column);

-- Is missing statistics?
ANALYZE table;

-- Is corrupted index?
REINDEX INDEX idx_name;
```

**If High Database Load:**
```sql
-- See what's slow
SELECT pid, duration, query FROM active_queries ORDER BY duration DESC;

-- Kill long-running query
SELECT pg_terminate_backend(12345);

-- Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - '30 minutes'::interval;

-- Scale connection pool in next deploy
-- or restart app to clear connections
```

**If Memory/CPU High:**
```bash
# Check what's using resources
# Vercel Analytics → Functions → highest CPU
# See if there's a memory leak
# Check if we need to scale

# Temporary: Restart app
# Vercel Dashboard → Deployments → Click deploy → "Redeploy"
# Use as last resort only
```

---

### Incident: Database Connection Pool Exhaustion

**Alert:** `pool_used / pool_max > 0.85`

**Symptoms:**
- New requests can't get connection
- "Too many connections" errors
- App becomes unresponsive

**Diagnosis (2 min):**
```bash
# Check current state
psql postgresql://... -c "SELECT count(*) FROM pg_stat_activity;"
psql postgresql://... -c "SHOW max_connections;"

# Check idle connections
psql postgresql://... -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';"

# Check what's running
psql postgresql://... -c "
SELECT pid, duration, state, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY duration DESC;"
```

**Emergency Mitigation (FAST):**

**Option 1: Kill Idle Connections (safest)**
```sql
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'idle' AND query_start < now() - '5 minutes'::interval;
```

**Option 2: Kill Old Connections**
```sql
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE query_start < now() - '30 minutes'::interval AND pid <> pg_backend_pid();
```

**Option 3: Scale Connection Pool (next deploy)**
```javascript
// src/lib/db-connection.ts
const pool = new Pool({
  max: 30,  // increased from 20
});
```

**Option 4: Restart App (last resort)**
```bash
# Vercel Dashboard → Deployments → Click latest → Redeploy
# This will start fresh connections
```

**Prevention:**
- Monitor connection usage regularly
- Kill old connections proactively
- Implement connection pooling at app level
- Set max_connections timeout

---

### Incident: API Rate Limit Breach

**Alert:** `sum:ratelimit.breaches > 0`

**Symptoms:**
- User getting 429 (Too Many Requests)
- Rate limit error in logs
- Specific user affected

**Diagnosis (1 min):**
```bash
# Check which user
Datadog → Logs → filter "status:429"
Look for user_id in logs

# Check their usage
SELECT count(*) FROM api_calls WHERE user_id = 'user_123' AND created_at > now() - '1 hour';

# Check limit
SELECT rate_limit FROM users WHERE id = 'user_123';
```

**Mitigation:**

**If Legitimate Usage (not bot):**
```
1. Increase rate limit temporarily
2. Monitor if keeps happening
3. Implement better batching on their side

SQL: UPDATE users SET rate_limit = 1000 WHERE id = 'user_123';
```

**If Bot/Abuse:**
```
1. Block user
2. Check if compromised account
3. Reset API key
4. Notify user

SQL: UPDATE users SET blocked = true WHERE id = 'user_123';
```

**If False Alarm:**
```
1. Review rate limit logic
2. Adjust thresholds if too strict
3. Update runbook
```

---

### Incident: Third-Party API Failure

**Alert:** Could be Claude API, Stripe, etc.

**Symptoms:**
- Prospectus generation fails
- Payment processing fails
- Specific feature broken

**Diagnosis (2 min):**
```bash
# Check status page
# stripe.com/status
# status.anthropic.com
# status.other-service.com

# Check logs
Datadog → Logs → filter "status_code:5*" on specific endpoint

# Check retry behavior
Are we retrying? How many times?
```

**Mitigation:**

**If Service Down (not us):**
```
1. Enable feature flag to disable feature
2. Show user friendly message
3. Implement fallback (if available)
4. Monitor service for recovery
5. Post status update

Example: Prospectus generation disabled while API recovers
```

**If Service Recovering:**
```
1. Implement exponential backoff
2. Queue failed requests
3. Retry after service recovers
4. Don't make more requests than needed
```

**If Quota Exceeded:**
```
1. Check usage
2. Request increase with provider
3. Implement rate limiting on our side
4. Queue requests

Example: Stripe: contact support for higher limit
         Claude: check token usage, optimize prompts
```

---

## Database Issues

### Database Slow (General)

**Quick Diagnostics:**
```sql
-- Top slowest queries
SELECT 
  mean_exec_time::numeric(10, 2) AS avg_ms,
  calls,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE correlation < 0.1
ORDER BY abs(correlation) ASC;

-- Table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Cache hit ratio (should be > 95%)
SELECT
  sum(heap_blks_read) / (sum(heap_blks_read) + sum(heap_blks_hit)) AS ratio
FROM pg_stat_user_tables;
```

**Solutions:**
```
Missing indexes → CREATE INDEX (takes time, use CONCURRENTLY)
High cache misses → Increase buffer_pool_size (requires restart)
Corrupted index → REINDEX INDEX (locks table, use CONCURRENTLY)
Statistics stale → ANALYZE table;
Bloated table → VACUUM FULL (requires exclusive lock)
```

---

### Connection Pool Issues

**Diagnosis:**
```sql
-- Current usage
SELECT count(*) FROM pg_stat_activity;
SELECT max_connections FROM pg_settings WHERE name = 'max_connections';

-- By state
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- Long-running queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
```

**Solutions:**
```
Idle connections → Kill old ones
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity
  WHERE state = 'idle' AND query_start < now() - '30 min';

Long-running queries → Kill them (carefully!)
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity
  WHERE query_start < now() - '1 hour';

Exhausted pool → Increase max_connections or scale
```

---

## API Issues

### High Error Rate (> 1%)

**Quick Check:**
```bash
# What endpoint is erroring?
Datadog → Logs → filter status:error
Check "http.url" field

# Is it consistent?
Does same endpoint keep failing? Or random?

# Is it a permission issue?
Check if 401 unauthorized (not really an error)
```

**Solutions:**
```
Specific endpoint → Check code for that endpoint
Authentication broken → Check credentials, tokens
Database error → Check database connection
Rate limiting → Check if user hit limit
```

---

### Timeouts (504 Gateway Timeout)

**Quick Check:**
```bash
# How long were requests taking?
Datadog → APM → Traces → filter status:504
Look at trace duration

# What was timing out?
Check slowest span in trace

# Is it consistent?
Always same operation? Or random?
```

**Solutions:**
```
Database slow → Optimize query or scale
Third-party slow → Retry with backoff
App slow → Check memory/CPU usage
Timeout too short → Increase timeout (last resort)
```

---

## Performance Issues

### Memory Leak (Memory > 85% and climbing)

**Diagnosis:**
```bash
# Check memory trend
Datadog → Infrastructure → Memory % over last 24h

# Is it climbing continuously?
Yes → Likely memory leak
No → Just high usage, restart might help
```

**Solutions:**
```
1. Identify what's leaking
   - Check for unclosed database connections
   - Check for event listeners not removed
   - Check for circular references in caches

2. Temporary fix
   - Restart app (Vercel Dashboard → Redeploy)
   - Monitor memory after restart

3. Permanent fix
   - Fix code leak
   - Add memory monitoring
   - Add restart health check
```

---

### CPU Spike (CPU > 80%)

**Diagnosis:**
```bash
# What function is using CPU?
Vercel Dashboard → Functions → sort by CPU

# Is it sustained or temporary?
Temporary → Probably just a spike in traffic
Sustained → Infinite loop or inefficient code
```

**Solutions:**
```
Traffic spike → Scale or wait for decline
Bad code → Find which deployment caused it, rollback
Infinite loop → Find and kill that function/deployment
```

---

## Communication & Escalation

### Incident Communication Template

**Initial (T+1 min):**
```
🚨 [INCIDENT] API Latency Spike
Service: ipoready
Severity: P2 (High)
Started: HH:MM UTC
Status: Investigating

Current P99: 500ms (threshold: 300ms)
Affected: All API endpoints
Users Impacted: ~5% seeing slow responses

Assigned: @oncall-engineer
Next update: HH:MM UTC
Dashboard: [link]
```

**Update (every 5-10 min):**
```
📊 [UPDATE] API Latency Spike
Time: HH:MM UTC
Status: Still investigating
Action: Checking database performance

P99 now: 450ms (was 500ms, trending down)
Next update: HH:MM UTC
```

**Resolution:**
```
✅ [RESOLVED] API Latency Spike
Time: HH:MM UTC
Duration: 15 minutes
Root Cause: Slow SELECT query due to missing index

Actions Taken:
1. Created index on documents.created_at
2. Ran ANALYZE on documents table
3. Latency returned to normal

Impact: 5-10 users may have experienced timeouts
Status Page: Will mark as resolved
```

---

### Escalation Path

```
Incident Severity → Action → Timeline

P1 (Critical)
├─ Auto-page on-call via PagerDuty (T+0)
├─ Email platform-oncall@ipoready.ai (T+0)
├─ Post in #incidents (T+0)
├─ Slack mention @platform-on-call (T+0)
└─ CTO phone call if not resolved (T+20 min)

P2 (High)
├─ Email to platform-team@ipoready.ai (T+0)
├─ Post in #alerts-high (T+0)
└─ Acknowledge within 15 minutes

P3 (Medium)
├─ Create Jira ticket (T+0)
├─ Post in #alerts-medium (digest)
└─ Fix within current sprint

P4 (Low)
├─ Create Jira ticket
└─ Schedule for backlog
```

---

## Post-Incident Review

### Incident Report Template

**File:** `incidents/[date]-[incident-id].md`

```markdown
# Incident Report: [Incident Name]

**Date:** June 7, 2026  
**Severity:** P2 (High)  
**Duration:** 15 minutes  
**Resolved:** Yes

## Timeline

| Time | Event |
|------|-------|
| 10:30 | Alert fired: P99 latency > 300ms |
| 10:31 | On-call acknowledged alert |
| 10:33 | Root cause identified: slow SQL query |
| 10:35 | Index created on documents table |
| 10:45 | Latency back to normal |

## Root Cause Analysis

A SELECT query on the documents table without an index was causing full table scans.
The table had grown to 100k rows, making sequential scans very slow.

## What Went Well

1. Alert fired immediately
2. On-call responded quickly
3. Root cause identified in < 3 minutes
4. Fix was simple and effective

## What Could Be Better

1. Could have caught missing index in code review
2. Should have had database query monitoring sooner
3. Could have automated this index creation

## Action Items

- [ ] Add index on documents.created_at (DONE)
- [ ] Review other tables for missing indexes (Engineer TBD, 1 day)
- [ ] Add database monitoring dashboard (DevOps TBD, 2 days)
- [ ] Create SQL code review checklist (Engineer TBD, 1 hour)

## Metrics

- Users Impacted: 5-10
- Revenue Impact: ~$0
- P99 Latency Max: 500ms
- Error Rate at Peak: 0.5%
```

---

## Quick Reference Checklist

### During Any Incident

- [ ] Acknowledge alert in Slack
- [ ] Note start time
- [ ] Check if recent deployment
- [ ] Check Datadog dashboard
- [ ] Check third-party status pages
- [ ] Identify root cause
- [ ] Implement mitigation
- [ ] Verify fix is working
- [ ] Post status in #incidents
- [ ] Document actions taken

### After Incident

- [ ] Write incident report
- [ ] Identify root cause
- [ ] List action items
- [ ] Schedule review meeting
- [ ] Update runbooks
- [ ] Share learnings in #platform-team
- [ ] Close PagerDuty incident
- [ ] Archive status page update

---

## Emergency Contacts

```
On-Call Engineer: +1-XXX-XXX-XXXX (page via PagerDuty)
Platform Lead: [name] [phone]
CTO: [name] [phone]
Vercel Support: https://vercel.com/support
Neon Support: https://neon.tech/docs
Datadog Support: support@datadoghq.com
```

---

**Last Reviewed:** June 7, 2026  
**Next Review:** July 7, 2026  
**Maintained By:** Platform Engineering Team

**Remember:** This runbook is your guide - use it confidently. When in doubt, escalate.
