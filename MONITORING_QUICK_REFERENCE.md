# IPOReady Monitoring Quick Reference

**Last Updated:** June 7, 2026  
**Print & Post at Your Desk**

---

## Critical Alerts (RESPOND IMMEDIATELY)

| Alert | Threshold | Action |
|-------|-----------|--------|
| **5xx Errors Surge** | > 5 per minute | 1. Check Vercel deploy status 2. Check database 3. Page on-call |
| **Database Connection Exhaustion** | > 85% pool used | 1. Kill idle connections 2. Scale pool 3. Rollback recent deploy |
| **API Rate Limit Breach** | Any breach | 1. Identify user 2. Check for abuse 3. Block if needed |
| **Complete Service Down** | No responses | 1. Check Vercel status 2. Check domain DNS 3. Check infrastructure |

---

## Dashboard Quick Links

```
Main Dashboard:    https://app.datadoghq.com/dashboard/...
On-Call Dashboard: https://app.datadoghq.com/dashboard/...
Vercel:           https://vercel.com/dashboard
Neon Database:    https://console.neon.tech
Status Page:      https://status.ipoready.ai
```

---

## Key Metrics - Normal Ranges

```
P99 Latency:           < 200ms  (alert > 300ms)
Error Rate:            < 0.1%   (alert > 1%)
CPU Usage:             < 70%    (alert > 80%)
Memory Usage:          < 75%    (alert > 85%)
DB Connections Used:   < 80%    (alert > 85%)
DB Queries (p95):      < 100ms  (alert > 300ms)
```

---

## Emergency Procedures

### If You See a Critical Alert

```
1. Acknowledge alert in Slack
   React with ✅ emoji to acknowledge

2. Check dashboard (5 min)
   Go to on-call dashboard, identify issue

3. Page on-call engineer
   If unsure, don't wait - page them

4. Document actions
   Slack in #incidents channel
   Include: what, when, why, fix

5. Monitor for 15 minutes
   Ensure fix is working
```

### Database Connection Pool Exhaustion

```
Step 1: SSH into production
  ssh ops@prod.ipoready.ai

Step 2: Check connections
  psql "postgresql://..." -c "
    SELECT pid, usename, state, query_start
    FROM pg_stat_activity
    WHERE state != 'idle'
    ORDER BY query_start DESC;"

Step 3: Kill stuck connection (if > 30 min idle)
  SELECT pg_terminate_backend(12345);

Step 4: Check app logs
  Vercel Dashboard → Logs → filter errors

Step 5: If still failing
  Scale connection pool from 20 → 30 in next deploy
```

### High Latency (P99 > 300ms)

```
1. Check APM flame graph
   Datadog → APM → Traces → find slow request

2. Identify bottleneck
   Is it database? API? Processing?

3. Quick fixes
   - Database: run ANALYZE, check indexes
   - API: check Stripe/Claude rate limits
   - Memory: check if near limit

4. Monitor
   Latency should drop within 5 minutes
```

### Error Rate Spike (> 1%)

```
1. Check error logs
   Datadog → Logs → filter service:ipoready status:error

2. Identify pattern
   Same error? Same endpoint? Same user?

3. Quick response
   If deployment: rollback
   If third-party: check status page
   If database: check connection pool

4. Communication
   Post update in #incidents
   Update status page
```

---

## Common Commands

### Check Service Health

```bash
# Is app responding?
curl https://ipoready.ai/api/health

# Get response time
curl -w "Time: %{time_total}s\n" https://ipoready.ai/api/health

# Check database
psql postgresql://... -c "SELECT 1"

# View recent errors
# Datadog → Logs → search "level:error"
```

### Database Queries

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state != 'idle';

-- List long-running queries
SELECT pid, query, query_start FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - '5 minutes'::interval;

-- Kill specific connection
SELECT pg_terminate_backend(12345);

-- Cache hit ratio (should be > 90%)
SELECT sum(heap_blks_read) / (sum(heap_blks_read) + sum(heap_blks_hit)) 
FROM pg_stat_user_tables;
```

---

## Alert Categories

### Performance Alerts (Yellow - Monitor)
- P99 latency 200-300ms
- Error rate 0.5-1%
- CPU 70-80%
- Memory 75-85%

**Action:** Watch dashboard, be ready to respond

### Degradation Alerts (Orange - Investigate)
- P99 latency > 300ms
- Error rate > 1%
- CPU > 80%
- Memory > 85%
- Connection pool > 85%

**Action:** Investigate within 15 minutes

### Critical Alerts (Red - IMMEDIATE)
- 5xx errors > 5/min
- Complete service outage
- Connection pool > 95%
- Database unreachable
- Rate limit breach detected

**Action:** Page on-call engineer NOW

---

## Monitoring Checklist - Daily

- [ ] No critical alerts overnight?
- [ ] Latency metrics stable?
- [ ] Error rate < 0.1%?
- [ ] Database healthy?
- [ ] Synthetic tests passing?
- [ ] Check Datadog for anomalies?

---

## Escalation Path

```
1st Contact: Datadog alert (automatic)
2nd Contact: Slack #alerts-critical (automatic)
3rd Contact: Email to platform-oncall@ipoready.ai (automatic)
4th Contact: PagerDuty page (manual if needed)
5th Contact: CTO phone call (if P1 incident)
```

---

## Alert Response Template

**Use when responding to alerts in Slack:**

```
🟢 [ACKNOWLEDGED] Alert Name
Time: HH:MM UTC
Status: Investigating
Next Update: HH:MM UTC

Assigned: @oncall-engineer
Dashboard: [link]
Runbook: [link]
```

---

## Common Issues & Quick Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| High latency | APM trace | Kill slow query, restart function |
| Error surge | Error logs | Check third-party status, rollback |
| No requests | Health check | Check DNS, Vercel status |
| Memory leak | Memory graph | Restart service, check code |
| DB slowness | Query logs | Run ANALYZE, kill idle conn |

---

## Useful Links

```
Datadog:         https://app.datadoghq.com
Vercel:          https://vercel.com/dashboard
Neon:            https://console.neon.tech
PagerDuty:       https://ipoready.pagerduty.com
Slack:           #alerts-critical, #incidents
GitHub:          https://github.com/ipoready/...
Status Page:     https://status.ipoready.ai
Runbooks:        See MONITORING_ALERTING_SETUP.md
```

---

## Team Contact Info

```
On-Call: @platform-oncall
Platform Team: @platform-team
DevOps Lead: [name] [phone]
CTO: [name] [phone]
Incident Commander: [name] [phone]
```

---

## Remember

- **Alert = Action Required** → Don't ignore
- **Document Everything** → Post in #incidents
- **Escalate Early** → Better safe than sorry
- **Check Status Pages** → Third-party issues?
- **Page Early** → Waiting is more expensive

---

**Questions?** Check MONITORING_ALERTING_SETUP.md or ask in #platform-team
