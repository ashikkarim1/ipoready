# IPOReady Operations Quick Reference

**Purpose:** Fast lookup guide for common operations tasks. For detailed procedures, see OPERATIONS_AND_DEPLOYMENT_GUIDE.md

---

## Emergency Contacts

| Role | Name | Phone | Slack | Email |
|------|------|-------|-------|-------|
| On-Call Engineer | [TBD] | [TBD] | @on-call | [TBD] |
| Engineering Manager | [TBD] | [TBD] | @engineering-lead | [TBD] |
| CTO | [TBD] | [TBD] | @cto | [TBD] |

---

## Status Checks (Do These First)

```bash
# Is the site up?
curl -I https://www.ipoready.ai/
# Expected: HTTP 200

# Is database responding?
psql "$DATABASE_URL" -c "SELECT 1;"
# Expected: (1 row)

# What's the error rate?
open https://vercel.com/dashboard/ipoready/analytics
# Expected: < 0.1% errors

# Any deployment in progress?
vercel list
# Expected: No "Building" status
```

---

## Immediate Action Table

| Symptom | Action | Time |
|---------|--------|------|
| **All pages return 500** | Rollback: `git revert HEAD --no-edit && git push origin main` | 5 min |
| **Database won't connect** | Restart Neon: `neonctl projects update-compute-endpoint --project-id <id> --endpoint-id <id>` | 2 min |
| **Very slow responses** | Scale up: `neonctl projects update-compute-endpoint --compute-units 8` | 2 min |
| **Deployment hangs** | Cancel in Vercel UI → push again | 5 min |
| **Users can't login** | Check NEXTAUTH_SECRET in Vercel: `vercel env show NEXTAUTH_SECRET` | 3 min |
| **File uploads fail** | Check Vercel Blob token: `vercel env show BLOB_READ_WRITE_TOKEN` | 3 min |

---

## Deployment Checklist (5 min)

```bash
# Before pushing to production:

# 1. Local tests pass
npm run build        # ✓ No errors
npm run type-check   # ✓ No TypeScript issues
npm run lint         # ✓ No lint errors

# 2. Git is clean
git status           # ✓ "working tree clean"

# 3. All committed
git log --oneline -1 # ✓ Shows latest commit

# 4. Push to main
git push origin main

# 5. Monitor deployment
open https://vercel.com/dashboard/ipoready/deployments
# Wait for "Ready" status (3-5 min)

# 6. Verify production
curl https://www.ipoready.ai/api/health | jq .
```

---

## Rollback Procedures

### Quick Rollback (< 5 min)

**Via Vercel UI (Safest):**
1. Go to https://vercel.com/dashboard/ipoready/deployments
2. Find previous stable deployment
3. Click three dots → "Promote to Production"
4. Confirm

**Via Git (if UI unavailable):**
```bash
git revert HEAD --no-edit
git push origin main
# Wait 5 min for deployment
```

### Database Rollback

```bash
# If migration caused issue:

# 1. Create recovery branch
neonctl branch create \
  --parent-id main \
  --branch-name recovery-$(date +%s) \
  --restore-timestamp "2026-06-07T10:00:00Z"

# 2. Update app to use recovery branch
vercel env add DATABASE_URL "<recovery-branch-url>"

# 3. Monitor for issues
curl https://www.ipoready.ai/api/health

# 4. Once verified, delete old branch
neonctl branch delete --branch-id <old-id>
```

---

## Database Commands

### Connection
```bash
# Connect to database
psql "$DATABASE_URL"

# Quick query
psql "$DATABASE_URL" -c "SELECT 1;"

# Export to file
pg_dump "$DATABASE_URL" > backup.sql
```

### Monitoring

```bash
# Active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"
# Alert if > 150

# Slow queries
psql "$DATABASE_URL" << 'EOF'
SELECT query, mean_exec_time as avg_ms 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 5;
EOF

# Table sizes
psql "$DATABASE_URL" -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"

# Recent migrations
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;"
```

### Troubleshooting

```bash
# Can't connect?
# 1. Check if Neon is up
neonctl projects describe-project --project-id <id>

# 2. Restart compute
neonctl projects update-compute-endpoint --project-id <id> --endpoint-id <id>

# Connection pool full?
# Kill idle connections
psql "$DATABASE_URL" << 'EOF'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '1 hour';
EOF

# Slow queries?
# Add index
CREATE INDEX idx_name ON table_name(column);
```

---

## Log Analysis

### Vercel Logs

```bash
# Recent logs (live)
vercel logs --follow

# Last 50 log lines
vercel logs --limit 50

# Search for errors
vercel logs | grep ERROR

# Specific deployment
vercel logs <deployment-id>

# Export logs
vercel logs --export > logs_$(date +%Y%m%d).json
```

### Sentry Error Tracking

```bash
# Open error dashboard
open https://sentry.io/projects/ipoready

# Search by error type
# Search by user
# View error timeline
# Check environment (production vs staging)
```

---

## Performance Tuning

### If Pages Are Slow

```bash
# 1. Check server response time
curl -w "Response time: %{time_total}s\n" -o /dev/null -s https://www.ipoready.ai/

# 2. Check database query time
psql "$DATABASE_URL" << 'EOF'
EXPLAIN ANALYZE SELECT * FROM companies LIMIT 10;
EOF

# 3. Add index if needed
CREATE INDEX idx_companies_status ON companies(status);

# 4. Scale database
neonctl projects update-compute-endpoint --compute-units 8

# 5. Check browser performance
# Open in Chrome → DevTools → Network tab
# Look for slow requests
```

### If Database Is Slow

```bash
# 1. Check query load
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# 2. Kill slow queries
psql "$DATABASE_URL" << 'EOF'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query_duration > interval '10 seconds';
EOF

# 3. Analyze table
ANALYZE companies;

# 4. Rebuild indices
REINDEX INDEX CONCURRENTLY idx_name;
```

---

## Secrets Management

### Add New Secret

```bash
# 1. Generate secret (if needed)
openssl rand -hex 32

# 2. Add to Vercel
vercel env add SECRET_NAME
# Paste value when prompted

# 3. Verify
vercel env ls

# 4. Redeploy to use new secret
git commit --allow-empty -m "Use new secret"
git push origin main
```

### Rotate Secret

```bash
# 1. Generate new value
NEW_VALUE=$(openssl rand -hex 32)

# 2. Add new secret temporarily
vercel env add NEXTAUTH_SECRET_NEW "$NEW_VALUE"

# 3. Update app to use new secret (if needed)

# 4. Deploy
git push origin main

# 5. Monitor for issues
vercel logs --follow

# 6. Delete old secret
vercel env rm NEXTAUTH_SECRET_OLD

# 7. Rename new secret
vercel env rm NEXTAUTH_SECRET_NEW
vercel env add NEXTAUTH_SECRET "$NEW_VALUE"
```

---

## User-Reported Issues

### "I can't login"

```bash
# 1. Check authentication endpoint
curl https://www.ipoready.ai/api/auth/signin | head -20

# 2. Verify NEXTAUTH_SECRET is set
vercel env show NEXTAUTH_SECRET

# 3. Verify NEXTAUTH_URL is correct
vercel env show NEXTAUTH_URL

# 4. Check OAuth provider settings
# Google: https://console.cloud.google.com
# LinkedIn: https://www.linkedin.com/developers

# 5. Look for errors
vercel logs | grep -i auth
```

### "Pages are loading slowly"

```bash
# 1. Check response time
curl -w "Time: %{time_total}s\n" -o /dev/null -s https://www.ipoready.ai/

# 2. Check error rate
open https://vercel.com/dashboard/ipoready/analytics

# 3. Check Web Vitals
# LCP should be < 2.5s
# CLS should be < 0.1

# 4. Scale if needed
neonctl projects update-compute-endpoint --compute-units 8
```

### "File upload failed"

```bash
# 1. Check file size
# Max: 50MB

# 2. Check file type
file -b --mime-type document.pdf

# 3. Check Vercel Blob token
vercel env show BLOB_READ_WRITE_TOKEN

# 4. Check logs
vercel logs | grep -i upload

# 5. Test locally
npm run dev &
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "companyId=test"
```

### "Payment isn't working"

```bash
# 1. Check Stripe keys
vercel env show STRIPE_SECRET_KEY
vercel env show STRIPE_PUBLISHABLE_KEY

# 2. Check Stripe webhook
curl -I https://www.ipoready.ai/api/webhooks/stripe
# Should return 405 (POST required)

# 3. Check Stripe dashboard
open https://dashboard.stripe.com

# 4. Look for webhook failures
# Stripe Dashboard → Developers → Webhooks

# 5. Check application logs
vercel logs | grep -i stripe
```

---

## Incident Response Summary

### First 5 Minutes
```bash
1. Page on-call engineer
2. Verify problem: curl -I https://www.ipoready.ai/
3. Check status: open https://vercel.com/dashboard/ipoready
4. Check logs: vercel logs | tail -50
5. Determine severity (P1-P4)
```

### Next 5 Minutes
```bash
1. Identify root cause (code vs database vs infrastructure)
2. Implement quick fix if possible (rollback, restart, scale)
3. Update status page
4. Notify team in Slack
5. Monitor recovery
```

### If Still Broken After 10 Minutes
```bash
1. Escalate to manager
2. Prepare more thorough fix or data recovery
3. Consider database restore
4. Document incident timeline
5. Prepare customer communication
```

---

## Automated Tasks (How to Verify)

| Task | How to Check | Expected | Alert If |
|------|--------------|----------|----------|
| Nightly Backup | Check Neon branch history | New backup daily | No backup in 24h |
| Database Cleanup | Check old records | Records auto-removed | Disk > 80% |
| Email Queue | Resend dashboard | Emails delivered | Failures > 5% |
| Stripe Webhooks | Dashboard → Webhooks | All delivered | Failures > 3 |
| Error Tracking | Sentry dashboard | < 10 errors/day | Spike > 100 errors |

---

## One-Minute Deployment

```bash
# Ready to deploy? Run this:
npm ci && npm run build && npm run type-check && npm run lint && \
git add -A && git commit -m "Release: $(date +%Y%m%d-%H%M%S)" && \
git push origin main && \
echo "✓ Deployed. Monitor: vercel logs --follow"
```

---

## One-Minute Health Check

```bash
# Is everything OK? Run this:
echo "=== Status ===" && \
curl -I https://www.ipoready.ai/ | head -1 && \
echo "=== Database ===" && \
psql "$DATABASE_URL" -c "SELECT 1" && \
echo "=== Errors ===" && \
vercel logs --limit 5 | grep -c ERROR && \
echo "=== Deployments ===" && \
vercel list | head -3
```

---

## Document Index

| Document | Purpose | When to Use |
|----------|---------|------------|
| OPERATIONS_AND_DEPLOYMENT_GUIDE.md | Comprehensive ops manual | Detailed procedures |
| OPERATIONS_QUICK_REFERENCE.md (this file) | Fast lookup | Common tasks, emergencies |
| PRODUCTION_DEPLOYMENT.md | Deployment workflow | Before/during deployment |
| DEPLOYMENT_SECURITY_CHECKLIST.md | Security verification | Pre-deployment review |

---

**Last Updated:** June 7, 2026  
**Quick Reference Version:** 1.0  
**For detailed procedures:** See OPERATIONS_AND_DEPLOYMENT_GUIDE.md
