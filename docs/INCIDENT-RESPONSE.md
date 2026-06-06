# IPOReady Incident Response Playbook

**Version:** 1.0.0  
**Last Updated:** 2026-06-07  
**On-Call Rotation:** See #ops-oncall Slack channel

---

## Overview

This playbook defines how to detect, respond to, and recover from incidents affecting IPOReady production.

**Severity Levels:**
- **CRITICAL (P1):** Service completely down, data loss risk, regulatory breach
- **HIGH (P2):** Significant functionality broken, degraded performance
- **MEDIUM (P3):** Minor feature broken, workaround available
- **LOW (P4):** Documentation issue, cosmetic bug

---

## Incident Classification

### P1: Critical (Immediate Response)

**Symptoms:**
- Application completely unavailable (HTTP 5xx errors)
- Database connection failures
- Data loss or corruption
- Security breach detected
- Authentication system down
- API returning 500+ errors

**Response SLA:** < 5 minutes to acknowledge, < 15 minutes to mitigate

**Escalation:**
1. Page on-call engineer (Slack + PagerDuty)
2. Notify tech lead within 5 minutes
3. Notify CEO within 15 minutes
4. Begin incident response procedures

---

### P2: High (Urgent Response)

**Symptoms:**
- Major feature unavailable (e.g., dashboard down)
- API latency > 5 seconds
- Database queries timing out
- Document upload failing
- PACE score calculation broken

**Response SLA:** < 30 minutes to acknowledge, < 1 hour to mitigate

**Escalation:**
1. Notify on-call engineer (Slack)
2. Alert tech lead
3. Investigate root cause
4. Deploy hotfix if needed

---

### P3: Medium (Standard Response)

**Symptoms:**
- Minor feature not working
- Performance degradation (< 5s latency)
- UI bugs
- Email delivery delayed

**Response SLA:** < 4 hours to acknowledge, same-day fix

**Process:**
1. Create GitHub issue
2. Assign to on-call engineer
3. Prioritize in sprint
4. Deploy in next release

---

### P4: Low (Best Effort)

**Symptoms:**
- Cosmetic bugs
- Documentation errors
- Typos
- Minor UX improvements

**Response SLA:** Next business day

**Process:**
1. Create GitHub issue
2. Prioritize in backlog
3. Schedule for future release

---

## Incident Response Procedures

### Step 1: Detect the Incident

**Monitoring Channels:**
- Datadog alerts (performance, errors, availability)
- Sentry alerts (JavaScript errors, exceptions)
- PagerDuty alerts (critical services)
- User reports (Slack #incidents, email)
- Automated health checks (every 60 seconds)

**Response:**
1. Check #incidents Slack channel
2. Open Datadog dashboard
3. Verify incident is real (not false alarm)
4. Post initial status update

---

### Step 2: Acknowledge & Initial Assessment

**Immediately (< 5 minutes):**

```
Incident Report:
- Problem: [Brief description]
- Severity: P1/P2/P3/P4
- Services Affected: [Dashboard, API, DB, etc.]
- Impact: [How many users, what can't they do?]
- Detection Time: [When was it first noticed?]
- Current Status: [Investigating / Mitigating / Resolved]
```

Post in #incidents Slack channel.

**Steps:**
1. Acknowledge in PagerDuty
2. Start incident in Datadog
3. Assign incident commander
4. Create war room Zoom call if P1/P2
5. Begin troubleshooting

---

### Step 3: Investigate Root Cause

**Check in this order:**

1. **Recent Deployments**
   ```bash
   git log --oneline -10
   # Did we deploy in last 30 minutes?
   ```

2. **Datadog Metrics**
   - CPU usage > 80%?
   - Memory usage > 90%?
   - Database connections maxed out?
   - Error rate spiking?

3. **Database Status**
   ```bash
   # Check Neon database health
   neon projects list
   neon branches list
   # Check for slow queries
   SELECT * FROM pg_stat_statements WHERE mean_exec_time > 1000;
   ```

4. **Application Logs**
   ```bash
   # View recent logs
   vercel logs production
   # Check for errors
   tail -100 /var/log/app.log | grep ERROR
   ```

5. **External Dependencies**
   - Stripe status?
   - SendGrid status?
   - Google APIs status?
   - Check https://status.ipoready.com

---

### Step 4: Mitigate Immediately

**If P1/P2 Critical:**

Option A: **Rollback** (safest, < 2 min)
```bash
vercel rollback
# Reverts to previous stable deployment
```

Option B: **Kill Problematic Process** (surgical)
```bash
# Kill specific service causing issue
pkill -f "service-name"
# Automatically restarted by systemd
```

Option C: **Emergency Feature Flag** (if available)
```bash
# Disable problematic feature
FEATURE_FLAG_DOCUMENTS=disabled
FEATURE_FLAG_FILING=disabled
# Re-enable after fix
```

Option D: **Scale Database** (if connection issue)
```bash
# Increase database connection pool
DATABASE_POOL_SIZE=50  # Increase from 20
```

---

### Step 5: Implement Permanent Fix

**For deployment-caused incidents:**

```bash
# Revert to known-good commit
git revert <bad-commit>
git push origin main
# Vercel auto-deploys
```

**For data-related incidents:**

```bash
# Never delete — backup first
pg_dump production | gzip > backup-2026-06-01.sql.gz

# Then fix data
psql production < fix.sql
```

**For configuration incidents:**

```bash
# Update env vars
vercel env add FEATURE_FLAG_DOCUMENTS=enabled

# Or update directly
# vercel.json: "env": { ... }
```

---

### Step 6: Communicate Status

**During Incident:**

- Update #incidents every 15 minutes
- Post status.ipoready.com status page update
- Notify affected customers via email if > 30 min downtime

**Sample Message:**
```
🚨 INCIDENT UPDATE [P1]: Database Connection Issue

Status: MITIGATING
Detected: 2026-06-01 14:32 UTC
Duration: 8 minutes
Impact: Dashboard unavailable for all users
Action: Increased connection pool size, restarting services
ETA: 5-10 minutes
Progress: 60% resolved, verifying data integrity

Next update: 14:45 UTC
Incident Commander: @claude
```

---

### Step 7: Resolution & Recovery

**When Resolved:**

1. Run smoke tests
   ```bash
   npx playwright test tests/e2e/critical-flows.spec.ts
   ```

2. Verify metrics are normal
   - Error rate < 1%
   - Latency < 500ms
   - CPU < 60%

3. Post resolution message
   ```
   ✅ RESOLVED

   Issue: Database connection pool exhausted
   Root Cause: Deployment v1.2.3 opened connections without closing
   Fix: Reverted to v1.2.2, applied connection pooling fix
   Status: ✅ All systems operational
   Resolution Time: 23 minutes
   ```

4. Close incident in PagerDuty/Datadog

---

## Common Incidents & Quick Fixes

### Dashboard Completely Down (502 Bad Gateway)

**Quick Diagnosis:**
```bash
# Check if app is running
curl -i https://app.ipoready.com/dashboard

# Check Vercel deployment status
vercel list --limit=5
# Look for recent failed deployments

# Check database connection
psql production -c "SELECT 1"
```

**Quick Fix:**
```bash
# Option 1: Rollback last deployment (< 2 min)
vercel rollback

# Option 2: Redeploy current version
vercel deploy --prod
```

---

### API Returning 500 Errors

**Diagnosis:**
```bash
# Check error logs
vercel logs production --follow

# Look for specific error pattern
grep "ERROR\|Exception\|500" app.log

# Check rate limiter
# Maybe hitting rate limit?
```

**Fix:**
- If rate limit issue: increase limits temporarily
- If code issue: rollback
- If external API down: add failover/fallback

---

### Database Slow Queries

**Diagnosis:**
```bash
# Find slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

**Fix:**
```bash
# Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE duration > '30 minutes';

# Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle';
```

---

### High Memory Usage

**Diagnosis:**
```bash
# Check memory
free -h
df -h  # Check disk space

# Check top processes
top -o %MEM | head -20
```

**Fix:**
```bash
# Restart problematic service
systemctl restart ipoready-api

# Clear cache
redis-cli FLUSHDB

# Scale down if auto-scaled
# Or increase instance size
```

---

### Email Not Sending

**Diagnosis:**
```bash
# Check SendGrid status
curl https://status.sendgrid.com/api/v2/status.json

# Check email queue
SELECT COUNT(*) FROM email_queue WHERE status = 'pending';
```

**Fix:**
```bash
# Verify SendGrid API key
echo $SENDGRID_API_KEY

# Manually retry failed emails
UPDATE email_queue SET retry_count = 0 WHERE status = 'failed';
```

---

## Post-Incident Review

**Within 24 hours:**

1. Create post-incident report:
   ```markdown
   # Incident Report: Database Down 2026-06-01

   ## Timeline
   14:32 UTC - Dashboard 502 errors reported
   14:35 UTC - On-call engineer alerted
   14:45 UTC - Root cause identified (connection pool)
   14:48 UTC - Mitigated (reverted deployment)
   14:52 UTC - Resolved

   ## Root Cause
   Deployment v1.2.3 opened database connections without closing them,
   exhausting the connection pool (limit: 20).

   ## Prevention
   - Add connection pool monitoring alert
   - Code review checklist: verify connection handling
   - Integration test for connection leaks

   ## Action Items
   - [ ] Implement connection pool warning alert (threshold: 15/20)
   - [ ] Add integration test for connection leaks
   - [ ] Update code review checklist
   - [ ] Schedule training: database connection pooling
   ```

2. Schedule blameless post-mortem meeting (30 min)

3. Track action items in GitHub issues

4. Update this playbook with lessons learned

---

## Escalation Contact Tree

```
🚨 INCIDENT DETECTED
    ↓
1. Page On-Call Engineer (5 min response SLA)
   - Slack: @on-call
   - PagerDuty: [Page existing service]
   ↓
2. Notify Tech Lead (15 min)
   - Slack: @tech-lead
   ↓
3. Notify CEO (if P1 + 15+ min downtime)
   - Email: ceo@ipoready.com
   - Slack: @ceo
   ↓
4. Customer Notification (if P1 + 30+ min downtime)
   - Email: status@ipoready.com
   - Post to status.ipoready.com
```

---

## Resources

- **Monitoring:** https://datadog.ipoready.com
- **Error Tracking:** https://sentry.ipoready.com
- **Status Page:** https://status.ipoready.com
- **Runbooks:** https://wiki.ipoready.com/incidents
- **On-Call Schedule:** https://pagerduty.ipoready.com

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-07 | Initial version |
