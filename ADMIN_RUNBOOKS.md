# IPOReady Admin Runbooks

**Quick reference guides for common operational tasks**  
**Last Updated:** June 7, 2026  
**Use in:** Emergency response, routine maintenance, onboarding

---

## Table of Contents

1. [User Onboarding Runbook](#user-onboarding-runbook)
2. [Security Incident Runbook](#security-incident-runbook)
3. [Performance Crisis Runbook](#performance-crisis-runbook)
4. [Data Loss Recovery Runbook](#data-loss-recovery-runbook)
5. [Deployment Rollback Runbook](#deployment-rollback-runbook)

---

## User Onboarding Runbook

**Use this when:** New user signs up and needs approval  
**Duration:** 5 minutes  
**Required:** Admin panel access

### Pre-Approval Checklist

- [ ] User account exists in database
- [ ] Email is verified (sent confirmation email)
- [ ] Company information filled in
- [ ] Target exchange specified
- [ ] Listing type indicated (IPO/RTO/SPAC)

### Step-by-Step Onboarding

**1. Navigate to User in Admin Panel (30 seconds)**
```
URL: https://ipoready.com/admin
Filter: "Pending Approval"
Search: User name or email
Verify: Company name, exchange, listing type
```

**2. Review User Profile (1 minute)**
```
Check for:
├─ Name: Looks reasonable
├─ Email: Appears valid
├─ Company: Listed on target exchange
├─ Exchange: NYSE, NASDAQ, TSX, or TSXV
└─ Listing Type: IPO, RTO, or SPAC

If anything missing or invalid:
→ Reject and email user for corrections
→ Do NOT approve incomplete profiles
```

**3. Approve User (1 minute)**
```
Click: "Approve" button in Actions column
Wait: Confirmation toast appears
Verify: User status changes to "Approved"
```

**4. Send Onboarding Email (2 minutes)**
```
Endpoint: POST /api/admin/send-summary

Body:
{
  "user_id": "user-123",
  "email": "user@company.com",
  "template": "welcome",
  "company_name": "ACME Corp"
}

Confirm: Email sent (200 response)
Verify: Check spam folder if user reports no email
```

**5. Assign Appropriate Plan (1 minute)**
```
Default: "Starter" plan for all new users
Exception: If enterprise deal negotiated
  → Click plan dropdown
  → Select "Enterprise"
  → Confirm toast: "Plan updated"
```

**6. Create Company Profile (2 minutes)**
```
Most fields auto-populated from signup form

Additional setup:
- Assign company admin: set user role to "company_admin"
- Add company logo: via dashboard company settings
- Set company sector: if not auto-detected
- Estimate public date: company should provide
```

**7. Document & Follow Up (1 minute)**
```
Log in admin audit system:
"[2026-06-07 14:32] Approved user john@acme.com, 
 Company: ACME Corp (NYSE), Plan: Starter"

Send welcome email with:
- Platform overview
- Key features walkthrough
- Documentation link
- Support contact info
```

### Troubleshooting Onboarding Issues

**User shows "Pending" but email not received:**
1. Check spam folder
2. Verify email address in database: `SELECT email FROM users WHERE id = 'user-id'`
3. Resend via endpoint: `POST /api/admin/send-summary`

**User can't login after approval:**
1. Verify `is_approved = true` in database
2. Clear browser cache/cookies
3. Check if `company_id` is set (required field)
4. Retry OAuth if using Google login

---

## Security Incident Runbook

**Use this when:** Suspected breach, unauthorized access, or suspicious activity  
**Duration:** 10-30 minutes (depending on severity)  
**Required:** Incident commander, security officer, database admin

### Detection Phase (First 2 minutes)

**Identify the Threat:**

```
☐ Unusual login activity?
  → Check: SELECT COUNT(*) FROM auth_logs WHERE failed_attempts > 5;

☐ Data exfiltration suspected?
  → Check: SELECT * FROM data_access_logs WHERE is_suspicious = true;

☐ Malicious code deployed?
  → Check: git log --oneline -10
  → Check: Any recent commits from unknown authors?

☐ Third-party breach (Stripe, Google)?
  → Contact: Security officer
  → Action: Assume credentials compromised

☐ DDoS attack?
  → Symptom: Massive spike in requests from single IP
  → Check: SELECT ip, COUNT(*) FROM request_logs GROUP BY ip ORDER BY COUNT(*) DESC;
```

### Response Phase (Next 5-10 minutes)

**Option A: Account Compromise**

```
1. Immediately revoke access:
   UPDATE users SET is_approved = false 
   WHERE email = 'compromised@account.com';

2. Reset password/sessions:
   DELETE FROM sessions 
   WHERE user_id = 'compromised-user-id';

3. Email user:
   Subject: Security Alert: Your IPOReady Account
   Body: "Your account was compromised. 
          We have disabled it temporarily.
          To regain access: [password reset link]
          If this wasn't you, contact security@ipoready.com"

4. Review access logs:
   SELECT * FROM audit_logs 
   WHERE user_id = 'compromised-user-id'
   AND created_at > now() - INTERVAL '24 hours'
   ORDER BY created_at DESC;

5. Check for data access:
   SELECT * FROM data_access_logs 
   WHERE user_id = 'compromised-user-id'
   AND created_at > now() - INTERVAL '24 hours';
```

**Option B: DDoS/Rate Limit Attack**

```
1. Identify attacking IP:
   SELECT ip, COUNT(*) as requests
   FROM request_logs
   WHERE created_at > now() - INTERVAL '1 hour'
   GROUP BY ip
   ORDER BY COUNT(*) DESC
   LIMIT 1;

2. Block IP immediately:
   POST /api/admin/rate-limit
   {
     "action": "block",
     "target": "203.0.113.42",
     "duration_hours": 24,
     "reason": "DDoS attack"
   }

3. Scale up infrastructure:
   - Increase load balancer capacity
   - Enable WAF rules
   - Route traffic through Cloudflare/CDN

4. Monitor for additional attacks:
   Check: Any other suspicious IPs?
   Pattern: Distributed vs single source?
```

**Option C: Data Breach**

```
1. IMMEDIATELY notify legal/security:
   Message: "CRITICAL: Potential data breach detected at [time]"
   Details: [what data, how many users, what happened]

2. Assess scope:
   - Which data was accessed?
   - Which users are affected?
   - When did breach start?
   - When was it detected?

3. Determine notification requirement:
   - Check: GDPR (EU users) → notify within 72 hours
   - Check: CCPA (CA users) → notify without unreasonable delay
   - Check: Other regional laws

4. Prepare for notification:
   - Draft communication email
   - Prepare credit monitoring offers (if needed)
   - Prepare FAQ for users
   - Set up security@ipoready.com email

5. DO NOT make public until legal approves:
   - Wait for legal team review
   - Coordinate with PR team
   - Prepare statement for media
```

### Recovery Phase (After incident contained)

**Post-Incident Actions:**

1. **Full Audit (within 24 hours)**
   ```sql
   -- Check all administrative actions
   SELECT * FROM audit_logs 
   WHERE created_at > [incident_start_time]
   AND action IN ('DELETE', 'UPDATE', 'CREATE', 'MODIFY')
   ORDER BY created_at;
   
   -- Check all data access
   SELECT * FROM data_access_logs 
   WHERE created_at > [incident_start_time]
   ORDER BY created_at;
   ```

2. **Forensic Analysis**
   - Engage external security firm if breach confirmed
   - Preserve logs and evidence
   - Document timeline of events

3. **Remediation**
   - Force password resets for affected users
   - Revoke all active sessions
   - Rotate API keys/secrets
   - Update security policies

4. **Communication**
   - Post-incident report to leadership
   - Status page update
   - Customer communication (if necessary)
   - Regulatory notification (if required)

---

## Performance Crisis Runbook

**Use this when:** Platform is slow, timeouts increasing, or users complaining  
**Duration:** 5-20 minutes  
**Required:** Ops engineer, backend lead, DBA

### Diagnosis Phase (First 3 minutes)

**Triage Questions:**

```
1. Is platform completely down?
   ☐ YES → Skip to "Complete Outage" section
   ☐ NO → Continue

2. Is it affecting all users or specific group?
   ☐ All → Likely infrastructure/database issue
   ☐ Specific → Likely specific feature or user quota

3. Check error rate:
   curl https://api.ipoready.com/api/dashboard/stats | jq '.requests.error_rate'
   
   ☐ > 5% → Critical, see "High Error Rate"
   ☐ 1-5% → Elevated, investigate
   ☐ < 1% → Normal (users may perceive slowness, not errors)

4. Check database health:
   psql $DATABASE_URL << EOF
   SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle';
   EOF
   
   ☐ > 80 connections → Pool near capacity
   ☐ < 80 connections → Normal load
```

### Quick Fixes (Pick one based on diagnosis)

**Fix A: Database Connection Pool Exhausted**

```
Symptoms: 
- Connections > 90
- "Too many connections" errors
- API returning 503

Solution (2 minutes):
1. Kill idle connections:
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
   AND query_start < now() - INTERVAL '5 minutes';

2. Kill long-running queries:
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active'
   AND EXTRACT(EPOCH FROM (now() - query_start)) > 300;

3. Verify recovery:
   SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle';
   (Should drop to < 20)

4. Monitor next 5 minutes:
   Keep running this query every 30 seconds
   SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle';
```

**Fix B: Slow Database Queries**

```
Symptoms:
- API response time > 500ms
- No connection pool exhaustion
- Specific endpoint slow

Solution (5 minutes):
1. Identify slow queries:
   SELECT query, mean_exec_time, max_exec_time, calls
   FROM pg_stat_statements
   WHERE mean_exec_time > 1000
   ORDER BY mean_exec_time DESC
   LIMIT 5;

2. Analyze slow query execution plan:
   EXPLAIN ANALYZE [slow_query_text];
   
   Look for:
   - Seq Scan (bad, should be index scan)
   - High cost estimate
   - Many rows filtered

3. Add index if Seq Scan detected:
   CREATE INDEX idx_[table]_[column] 
   ON [table]([column]);

4. Re-run EXPLAIN to verify improvement

5. Restart API servers to clear cached query plans:
   kubectl restart deployment/api
```

**Fix C: High CPU Usage**

```
Symptoms:
- Slow response times across board
- High CPU % on application servers
- No database connection issues

Solution (5 minutes):
1. Check what's consuming CPU:
   top -o %CPU  (on server)
   
   Look for:
   - node process using > 80% CPU
   - Any background jobs running

2. If background job causing issues:
   Kill it: kill -9 [PID]
   Or via admin:
   POST /api/admin/jobs/cancel
   {
     "job_id": "long-running-job-id"
   }

3. Check for memory leak:
   free -h  (on server)
   If swap usage high → memory issue
   
   Solution: Restart container
   kubectl rollout restart deployment/api

4. Monitor memory over next 10 minutes:
   free -h | grep Mem
```

**Fix D: Load Balancer Issue**

```
Symptoms:
- Some requests work, some timeout
- Inconsistent performance
- Errors come from specific servers

Solution (2 minutes):
1. Check load balancer stats:
   kubectl get svc api-lb -o wide

2. Remove unhealthy nodes:
   kubectl delete pod [pod-name]
   (K8s will auto-restart)

3. Check node health:
   kubectl top nodes

4. If specific node unhealthy:
   Cordon node (stop new pods):
   kubectl cordon [node-name]
   
   Drain existing pods:
   kubectl drain [node-name] --ignore-daemonsets
```

**Fix E: Third-Party Service Down**

```
Symptoms:
- Specific feature failing (e.g., Stripe integration)
- Users get "timeout" or "service unavailable"
- Affects small percentage of users

Solution (3 minutes):
1. Check third-party service status:
   - Stripe: https://status.stripe.com
   - SendGrid: https://status.sendgrid.com
   - Google: https://www.google.com/appsstatus
   
2. If down, enable circuit breaker:
   (Assuming circuit breaker pattern implemented)
   
   This allows platform to function without service
   
3. Inform affected users:
   "Feature temporarily unavailable due to external service issue"

4. Retry when service recovers
```

### Complete Outage Response (If platform is down)

**CRITICAL INCIDENT - Complete Outage**

```
0:00 - 0:05 minutes (ASSESS)
┌─ Check health endpoints
├─ GET /api/health → 503?
├─ Check if database responding
│  psql $DATABASE_URL "SELECT 1;" → timeout?
└─ Check if load balancer responding
   curl http://load-balancer:8080/health → timeout?

0:05 - 0:10 minutes (TRIAGE)
If database not responding:
└─ Database is down → See "Database Connection Exhaustion"

If load balancer timeout:
└─ Network/infrastructure down
    1. Restart load balancer
    2. Check firewall rules
    3. Verify DNS resolving correctly

If API servers not responding:
└─ Restart all API pods
    kubectl rollout restart deployment/api
    Wait 2-3 minutes for recovery

0:10+ minutes (RECOVER & COMMUNICATE)
├─ Update status page: "We are investigating"
├─ Send Slack update every 5 minutes
├─ Continue diagnostic efforts
└─ Once recovered: Post mortem analysis
```

---

## Data Loss Recovery Runbook

**Use this when:** Data appears corrupted, deleted, or inconsistent  
**Duration:** 30-120 minutes (depending on complexity)  
**Required:** DBA, security officer, incident commander

### Assessment Phase (First 5 minutes)

**Determine Scope of Data Loss:**

```
1. Identify what's lost:
   ☐ Entire table? (e.g., all users deleted)
   ☐ Recent records? (e.g., last 24 hours)
   ☐ Specific records? (e.g., company 123's filings)
   ☐ Corrupted data? (e.g., invalid values)

2. Determine when loss occurred:
   SELECT MAX(created_at) FROM [table];
   SELECT MAX(updated_at) FROM [table];
   
   → Last timestamp before loss?

3. Assess impact:
   SELECT COUNT(*) FROM [table];
   → How many records affected?

4. Check if deletions in recent queries:
   SELECT * FROM pg_stat_statements 
   WHERE query ILIKE '%DELETE%'
   ORDER BY query_start DESC;
```

### Recovery Options (In order of preference)

**Option 1: Restore from Backup (If available and recent)**

```
Prerequisites:
- Backup exists and is recent (< 1 hour old)
- Data loss < 1 hour

Steps:
1. Identify backup to restore:
   curl -H "Authorization: Bearer $NEON_API_KEY" \
     https://api.neon.tech/v1/projects/ID/backups
   
   Choose: Backup with timestamp closest to last good state

2. Create restore branch (safest):
   curl -X POST https://api.neon.tech/v1/projects/ID/branches \
     -d '{"name":"restore-branch","parent_timestamp":1717753200}'

3. Verify data on restore branch:
   psql [restore_branch_connection] << EOF
   SELECT COUNT(*) FROM [table];
   SELECT * FROM [table] LIMIT 1;
   EOF
   
   If looks good → proceed to step 4
   If still bad → try older backup

4. Point production to restore branch:
   (After legal/leadership approval)
   
   This will:
   - Revert platform to last good state
   - Lose changes since backup
   - Cause 30-60 min downtime

5. Announce to users:
   "Data recovery in progress. 
    Platform will be read-only for 1 hour."
```

**Option 2: Point-in-Time Recovery (PITR)**

```
Prerequisites:
- Transaction logs available (usually 7 days)
- Data loss occurred within retention period

Steps:
1. Determine exact time of last good state:
   Typically: 10-15 minutes before loss detected

2. Create branch at specific timestamp:
   curl -X POST https://api.neon.tech/v1/projects/ID/branches \
     -d '{
       "name": "pitr-branch",
       "parent_timestamp": 1717753200000
     }'

3. Verify data on PITR branch
   (Same as Option 1, step 3)

4. Point production to branch
   (Requires downtime, similar to Option 1)
```

**Option 3: Manual Restoration (For small data loss)**

```
Prerequisites:
- Small number of records (< 100)
- You have record of what was deleted

Steps:
1. If deleted records are in git history:
   git log --all -- path/to/file
   git show [commit_hash]:path/to/file
   → Extract original data

2. Re-insert into database:
   INSERT INTO [table] VALUES (
     [reconstructed_data]
   );

3. For corrupted fields:
   UPDATE [table] 
   SET [field] = [correct_value]
   WHERE id = [record_id];

4. Verify corrections:
   SELECT * FROM [table] WHERE id = [record_id];
```

### Prevention Phase (After recovery)

**Prevent Recurrence:**

```
1. Enable audit logging:
   CREATE EXTENSION IF NOT EXISTS pgaudit;
   ALTER SYSTEM SET 'pgaudit.log' = 'WRITE';
   SELECT pg_reload_conf();

2. Implement soft deletes (if applicable):
   ALTER TABLE [table] ADD COLUMN deleted_at TIMESTAMP;
   
   When deleting:
   UPDATE [table] SET deleted_at = now() WHERE id = X;
   (Don't use DELETE statement)

3. Increase backup frequency:
   Current: Daily backups
   New: Hourly snapshots (if storage permits)

4. Implement write protection:
   ALTER DATABASE ipoready_prod SET default_transaction_read_only = on;
   (Then selectively enable writes for scripts)

5. Add write confirmations:
   Require admin approval for DELETE operations
   Send notification when > 100 records deleted

6. Test recovery procedure:
   Monthly backup restoration test
   Document actual RTO (Recovery Time Objective)
```

---

## Deployment Rollback Runbook

**Use this when:** Recent deployment broke production  
**Duration:** 5-15 minutes  
**Required:** DevOps engineer, backend lead

### Immediate Rollback (First 2 minutes)

**Quick Rollback Process:**

```
1. Identify last working commit:
   git log --oneline -n 10
   
   Find: Last commit before issues started
   Example: abc1234 Fix auth endpoint

2. Verify it's safe to rollback:
   ☐ No data migrations in reverted commits
   ☐ No database schema changes
   ☐ No API contract changes
   ☐ Users can stay on current schema
   
   If any of above true → Stop, escalate to tech lead

3. Perform rollback:
   git revert [bad_commit_hash]
   git push origin main
   
   OR (if more than 1 commit to revert):
   git revert [newest_bad_hash]~..[oldest_bad_hash]
   git push origin main

4. Wait for deployment:
   kubectl rollout status deployment/api
   (Wait for green checkmark)

5. Verify recovery:
   curl https://api.ipoready.com/api/health
   Check: Status page
   Check: Error rate dashboard
   
   If errors resolved → SUCCESS
   If errors continue → Escalate
```

### If Simple Revert Fails

**Complex Rollback (database migration involved):**

```
Case: Reverted code expects new database schema
      But database still has old schema

Symptom: 
- Code reverted
- App still crashing
- Error: "column not found"

Solution:
1. Understand what changed:
   git diff [old_commit] [new_commit] -- migrations/

2. If migration was ADDITIVE (added new column):
   → Safe to leave schema as-is
   → Old code will ignore new column
   → Update code to match schema
   
   git revert --no-commit [bad_commit]
   git commit -m "Partial revert: Keep database schema"

3. If migration was BREAKING (deleted/renamed column):
   → Cannot simply rollback
   → Need to restore database or redo migration
   
   Option A: Restore from backup (see Data Loss Recovery)
   Option B: Apply reverse migration
   
   Create reverse migration:
   -- migrations/reverse_001.sql
   ALTER TABLE [table] ADD COLUMN [deleted_col] TYPE;
   
   Run: psql $DATABASE_URL < migrations/reverse_001.sql

4. Test thoroughly before production push
```

### Post-Rollback Analysis (Within 2 hours)

**Root Cause Analysis:**

```
1. Determine what broke:
   - Which commit(s)?
   - What changed?
   - Why wasn't it caught in testing?

2. Check CI/CD pipeline:
   - Did tests pass before merge?
   - Should test have failed?
   - Missing test coverage?

3. Identify preventative measures:
   ☐ Add automated test
   ☐ Add manual QA checklist item
   ☐ Add deployment gate
   ☐ Improve logging for early detection
   ☐ Add feature flag for gradual rollout

4. Fix the actual issue:
   - Don't just revert and move on
   - Fix root cause
   - Add test to prevent recurrence

5. Redeploy with fix:
   git log --oneline -n 1
   Verify commit contains fix
   Deploy to staging first
   Run full test suite
   Deploy to production
```

### Preventing Future Rollbacks

**Deployment Best Practices:**

```
Before each deployment:
☐ All tests pass locally (npm test)
☐ All CI checks pass (GitHub Actions)
☐ Code reviewed and approved (2 approvals)
☐ Manual QA tested on staging
☐ Feature flags ready for any risky features
☐ Deployment plan documented
☐ Rollback plan documented
☐ On-call engineer available

During deployment:
☐ Deploy to staging first
☐ Run smoke tests on staging
☐ Wait 5 minutes, monitor errors
☐ Deploy to production
☐ Watch error rate for 10 minutes
☐ Check health dashboard

After deployment:
☐ Monitor error rate for 1 hour
☐ Check user feedback/support tickets
☐ Document any issues
☐ Post deployment summary to #deployments

If issues detected:
→ Rollback immediately (within 5 minutes)
→ Investigate root cause
→ Fix and redeploy next cycle
```

---

## Maintenance Window Runbook

**Use this when:** Scheduled database maintenance or updates needed  
**Duration:** 30-60 minutes  
**Required:** DBA, ops engineer, communications team

### Pre-Maintenance (24 hours before)

```
1. Announce maintenance window:
   - Email all users
   - Post on status page
   - Notify support team

   Message template:
   "IPOReady will undergo scheduled maintenance on [DATE] 
    at [TIME] UTC for approximately [DURATION] minutes.
    During this time the platform will be unavailable."

2. Prepare backup:
   - Create fresh backup
   - Verify backup integrity
   - Document backup location

3. Prepare rollback plan:
   - Document all changes
   - Prepare rollback scripts
   - Brief team on procedures

4. Notify customers:
   - Email enterprise customers
   - Provide alternate contact number
   - Offer to reschedule meetings
```

### During Maintenance (Following schedule)

```
T-10 min: Send final warning to users
T-5 min:  Stop accepting new requests
          Enable read-only mode
T+0 min:  Begin maintenance work
          Monitor closely

During work:
- Execute changes
- Log all commands
- Monitor impact
- Have rollback ready

When complete:
- Run verification tests
- Check data integrity
- Restore to normal mode
- Verify users can access
```

### Post-Maintenance (Within 1 hour)

```
1. Announce completion:
   "Maintenance completed at [TIME]. 
    Services are fully operational."
   - Post on status page
   - Email users
   - Update support team

2. Monitor for issues:
   - Watch error rate for 1 hour
   - Check for user reports
   - Verify all features working

3. Document results:
   - What was done
   - Duration actual vs planned
   - Any issues encountered
   - Lessons learned

4. Post-mortem (if issues):
   - Schedule team meeting
   - Review what went wrong
   - Identify improvements
   - Update procedures
```

---

**Questions?** Contact the on-call engineer or ops@ipoready.com

