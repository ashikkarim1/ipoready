# IPOReady Admin - Quick Reference Card

**Print-friendly single-page cheat sheet for common admin tasks**

---

## Emergency Contact

| Role | Name | Contact |
|------|------|---------|
| **Incident Commander** | Alice Chen | +1-415-XXX-XXXX, alice@ipoready.com |
| **VP Engineering** | Diana Martinez | +1-415-XXX-XXXX, diana@ipoready.com |
| **On-Call (24/7)** | PagerDuty | pagerduty.com → Trigger incident |

## Severity Assessment

| Symptom | Severity | Response |
|---------|----------|----------|
| Platform completely down | **CRITICAL** | Page on-call immediately |
| >50% users affected | **CRITICAL** | Page on-call immediately |
| Specific feature broken | **HIGH** | Notify within 15 min |
| Single user issue | **LOW** | Notify within 4 hours |

## Quick Diagnostics

```bash
# Check if platform alive
curl -I https://ipoready.com/api/health

# Check error rate
curl https://ipoready.com/api/dashboard/stats | jq '.requests.error_rate'

# Check DB connection count
psql $DATABASE_URL "SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle';"

# View recent errors
tail -50 /var/log/api.log | grep -i error
```

## Top 5 Emergency Fixes

### 1. API Returning 503 (Database Down)
```bash
# Kill idle connections
psql << 'EOF'
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - INTERVAL '5 minutes';
EOF

# Restart connection pool (Admin Panel → Database → Restart)
```

### 2. High Error Rate (>2%)
```bash
# Identify endpoint with errors
tail -100 /var/log/api.log | grep ERROR | cut -d' ' -f1-3 | sort | uniq -c

# If specific endpoint → Check recent code changes
git log --oneline -n 5

# If systemic → Check infrastructure
kubectl top pods  # If K8s
free -h  # If running on server
```

### 3. User Can't Login
```bash
# Verify user approved
SELECT is_approved, role FROM users WHERE email = 'user@company.com';

# If not approved → Approve in Admin Panel

# If approved but still failing → Clear session cache
rm -rf /tmp/sessions/*
```

### 4. SEC Filing Ingestion Stuck
```bash
# Kill long-running query
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'active' AND query ILIKE '%sec%';

# Retry ingestion
POST /api/admin/ingest-sec-filings?limit=10
Authorization: Bearer $ADMIN_TOKEN
```

### 5. High Memory Usage
```bash
# Check memory on server
free -h

# If swap usage high → Memory leak
# Solution: Restart container
kubectl restart deployment/api
```

## Common Commands

### Approve User
```sql
UPDATE users SET is_approved = true WHERE email = 'user@company.com';
```

### Change User Plan
```sql
UPDATE companies SET subscription_plan = 'growth' 
WHERE id = (SELECT company_id FROM users WHERE email = 'user@company.com');
```

### Reset Rate Limit
```bash
curl -X POST https://api.ipoready.com/api/admin/rate-limit \
  -d '{"action":"reset","target":"203.0.113.42","prefix":"rl:pub"}' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Check Database Health
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM companies) as companies,
  pg_size_pretty(pg_database_size(current_database())) as size,
  (SELECT MAX(created_at) FROM users) as latest_user;
```

### Find Slow Queries
```sql
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC LIMIT 5;
```

## Dashboard URLs

```
Admin Panel:        https://ipoready.com/admin
Monitoring:         https://ipoready.com/dashboard/stats
Status Page:        https://ipoready.statuspage.io
Neon Console:       https://console.neon.tech
PagerDuty:          https://ipoready.pagerduty.com
Stripe Dashboard:   https://dashboard.stripe.com
```

## Incident Response Checklist

- [ ] Assess severity (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Notify #incidents in Slack (`@incident-commander`)
- [ ] Page on-call engineer if CRITICAL/HIGH
- [ ] Update status page
- [ ] Identify root cause
- [ ] Implement fix or workaround
- [ ] Verify resolution
- [ ] Notify users (if applicable)
- [ ] Create incident report
- [ ] Schedule follow-up meeting

## Database Backup/Restore

### Create Backup
```
Admin Panel → Database → Create Backup Now
(Or via Neon console: Projects → Backups → Create)
```

### Restore from Backup
```
Via Neon: Projects → Branches → Restore from Backup
⚠️ WARNING: Causes 30-60 min downtime, data loss
Only restore after legal/leadership approval
```

## Rate Limit Reference

| Endpoint Type | Limit | Window |
|---|---|---|
| Public API | 100 | 1 minute |
| Authenticated | 1000 | 1 hour |
| Admin API | 500 | 1 hour |
| File Upload | 5 GB | 1 hour |

## Error Code Quick Ref

| Code | Meaning | Fix |
|------|---------|-----|
| 200 | OK | ✓ Success |
| 400 | Bad request | Check params |
| 401 | Unauthorized | Login again |
| 403 | Forbidden | Check role (system_admin?) |
| 404 | Not found | Resource missing |
| 429 | Rate limited | Wait or reset limit |
| 500 | Server error | Check logs |
| 503 | Service down | Check database |
| 504 | Timeout | Restart services |

## Log Locations

```
API Errors:       /var/log/api.log
Database:         /var/log/postgres.log
Authentication:   /var/log/auth.log
SEC Ingestion:    /var/log/sec-parser.log
```

## Escalation Matrix

```
Outage:           → VP Eng (Diana Martinez)
Data loss:        → CTO (Henry Zhang) + Legal
Security breach:  → Security Officer (Jamie Patel) + Legal
Payment issues:   → Finance Director
Performance:      → Backend Lead (Bob Kumar)
```

## Pre-Deployment Checklist

- [ ] Tests pass locally (`npm test`)
- [ ] CI passes (GitHub Actions green)
- [ ] Code reviewed (2+ approvals)
- [ ] Tested on staging
- [ ] Rollback plan ready
- [ ] On-call engineer available
- [ ] Status page message ready

## Post-Deployment Monitoring (1 hour)

- [ ] Health endpoint returns 200
- [ ] Error rate normal (< 0.5%)
- [ ] Latency normal (p95 < 200ms)
- [ ] No user complaints in support
- [ ] Database connections stable

---

**Save this page. Print it. Tape it to your desk.**

For full documentation, see:
- **ADMIN_PANEL_GUIDE.md** — Complete guide with step-by-step procedures
- **ADMIN_TECHNICAL_REFERENCE.md** — Technical details, API endpoints, schemas
- **ADMIN_RUNBOOKS.md** — Emergency procedures and incident response

**Last Updated:** June 7, 2026  
**Questions?** ops@ipoready.com
