# IPOReady Incident Response Runbook

**Status**: Production Ready  
**Audience**: On-Call Engineers, SRE Team, Engineering Leadership  
**Last Updated**: 2026-06-07  
**Review Frequency**: Quarterly  

---

## Quick Reference Card

**Print, Laminate & Tape to Desk**

```
┌────────────────────────────────────────────┐
│   INCIDENT RESPONSE - QUICK REFERENCE      │
├────────────────────────────────────────────┤
│ 1. DECLARE INCIDENT                        │
│    - Severity (1-4)                        │
│    - Create #incidents Slack channel       │
│    - Name Incident Commander (IC)          │
│                                            │
│ 2. PAGE ON-CALL                            │
│    - Sev 1: Page immediately               │
│    - Sev 2: Alert within 15 min            │
│    - Sev 3: Alert within 1 hour            │
│    - Sev 4: No alert needed                │
│                                            │
│ 3. COMMUNICATE                             │
│    - Every 15 min: Status update           │
│    - Every 1 hour: Executive summary       │
│    - Update status.ipoready.com            │
│                                            │
│ 4. RESOLVE                                 │
│    - Follow severity-specific procedures  │
│    - Document every action                 │
│    - Save logs for postmortem              │
│                                            │
│ 5. POST-INCIDENT                           │
│    - Post-recovery checklist (see below)   │
│    - Schedule postmortem (24 hours)        │
│    - Send incident report within 24 hours  │
└────────────────────────────────────────────┘

CRITICAL CONTACTS (MEMORIZE!)
├─ On-Call Engineer: See PagerDuty
├─ CTO: [Name] [Phone] - Severity 1/2 only
├─ Platform Lead: [Name] [Phone] - Infrastructure
├─ CEO: [Name] [Phone] - Business impact
├─ Neon Support: https://support.neon.tech
├─ Vercel Support: https://vercel.com/support
└─ AWS Support: https://console.aws.amazon.com/support

SEVERITY DECISION TREE:
├─ No login anywhere (auth down) → SEV 1
├─ No create/edit (core feature broken) → SEV 1
├─ API response time > 5 sec (slow) → SEV 2
├─ Feature degraded (partial) → SEV 2
├─ Missing data (non-critical) → SEV 3
├─ UI glitch/typo (cosmetic) → SEV 4
└─ Unknown? → Default to SEV 2 (escalate when clear)
```

---

## Severity Levels & Response SLAs

### SEV 1: CRITICAL - System Down / No Access

**Description**: System is completely unavailable or authentication is broken. Users cannot log in or perform core IPO readiness workflows.

**Examples**:
- Authentication system offline (OAuth/NextAuth failure)
- All users blocked from login
- Database completely inaccessible
- Core CRUD operations failing (create document, update metrics)
- Payment processing completely broken
- Data integrity violation affecting all users

**Response SLA**: 
- Page on-call: Immediately
- First response: 5 minutes
- Initial mitigation: 15 minutes
- **Resolution target: 1 hour**

**Communication**:
- Immediate: Declare incident, page team
- Every 5 minutes: Status update in #incidents
- Every 15 minutes: Send to stakeholders (CEO, board members if business impact)
- Upon resolution: Full incident report within 2 hours

**Example Response**:
```
14:05 UTC - Incident declared (SEV 1): "Users unable to login"
14:05 UTC - Page on-call engineer + CTO
14:07 UTC - Initial assessment: OAuth provider down
14:10 UTC - First status: "Investigating OAuth configuration"
14:15 UTC - Mitigation started: Attempting credential rotation
14:20 UTC - Status: "Credentials rotated, testing login"
14:25 UTC - RESOLVED: System restored, users can login again
14:30 UTC - Incident report sent to stakeholders
```

---

### SEV 2: HIGH - Significant Degradation

**Description**: Major feature is broken or significantly degraded. Many users are affected, but system is partially available. Core workflows are impacted.

**Examples**:
- API response time consistently > 5 seconds
- Document upload failing for ~50% of users
- Data synchronization delayed > 1 hour
- Reports not generating (but documents accessible)
- Email notifications not sending
- Third-party integrations (Google Drive, Dropbox) failing
- Performance degradation affecting user productivity
- One major feature (capital markets, PACE scoring) completely unavailable

**Response SLA**:
- Page on-call: Within 15 minutes
- First response: 15 minutes
- Initial diagnosis: 30 minutes
- **Resolution target: 4 hours**

**Communication**:
- Declare incident in #incidents with severity + symptoms
- Every 30 minutes: Progress update
- Upon resolution: Brief incident summary
- Next business day: Send technical postmortem

**Example Response**:
```
10:30 UTC - Issue reported: "Document uploads timing out"
10:35 UTC - Severity assessed: SEV 2 (affecting ~40% of uploads)
10:40 UTC - On-call paged
10:50 UTC - Initial diagnosis: S3 connection pool exhausted
11:10 UTC - Mitigation: Increased pool size + restarted service
11:30 UTC - Monitoring: Success rate back to 99%
11:45 UTC - RESOLVED: All uploads normal
```

---

### SEV 3: MEDIUM - Minor Impact / Workaround Exists

**Description**: Non-critical feature is broken or workflow is partially impacted, but users have workarounds. Business operations continue with reduced efficiency.

**Examples**:
- Search functionality returns stale results (data lag > 1 hour)
- Secondary feature unavailable (notifications, dashboard widgets)
- Data not fully visible in one view (but accessible elsewhere)
- Non-critical background jobs failing (archival, cleanup)
- Email delivery delayed (> 30 min)
- UI glitches that don't block functionality
- Minor performance issue (page load > 3 sec)
- One optional integration not syncing (but not core to workflow)

**Response SLA**:
- Alert on-call: Within 1 hour
- First response: 1 hour
- Initial diagnosis: 2 hours
- **Resolution target: 1 business day**

**Communication**:
- Post in #incidents channel (no page-out)
- Update team once per day minimum
- Upon resolution: Brief summary in #incidents
- Send postmortem within 5 business days (no deadline pressure)

**Example Response**:
```
09:00 UTC - Issue found: "Dashboard widgets not loading"
10:00 UTC - Assessed: SEV 3 (data still accessible elsewhere)
10:15 UTC - On-call alerted via #incidents
11:00 UTC - Investigation: Widget service using old cache
14:00 UTC - Fix deployed: Cleared cache, verified widgets
15:00 UTC - RESOLVED: All users can see widgets
```

---

### SEV 4: LOW - Cosmetic / Non-Impact

**Description**: Cosmetic issues with no business impact. Can be fixed in next scheduled deployment. No urgent action needed.

**Examples**:
- UI typo or formatting issue
- Icons not displaying correctly
- Minor visual glitch (spacing, colors)
- Outdated documentation
- Old help text
- Broken analytics tracking (not business critical)
- Non-critical feature deprecation notice

**Response SLA**:
- No page-out required
- Can be addressed in next sprint
- **No target resolution time**

**Communication**:
- Create GitHub issue, do NOT declare incident
- Fix in next release cycle
- No postmortem required

---

## Detection: How to Identify Incidents

### Automated Monitoring & Alerts

**Infrastructure Monitoring** (PagerDuty, Datadog, CloudWatch)
- [ ] Database response time > 500ms (alert every 1 min)
- [ ] API error rate > 1% (alert immediately)
- [ ] API p95 latency > 2 seconds (alert immediately)
- [ ] Authentication failure rate > 5% (alert immediately)
- [ ] Document upload failure rate > 2% (alert every 5 min)
- [ ] Memory usage > 80% (alert after 5 min sustained)
- [ ] Disk usage > 85% (alert immediately)
- [ ] Database connection pool > 90% (alert immediately)
- [ ] S3 request failures > 1% (alert immediately)
- [ ] Neon database replication lag > 30 seconds (alert every 2 min)

**Application Monitoring** (Vercel, custom logging)
- [ ] Deployment rollback triggered (alert immediately)
- [ ] Build failure (alert on next deploy attempt)
- [ ] Unhandled exception spike (> 10 per minute)
- [ ] Server error rate (5xx) > 1% (alert immediately)
- [ ] Failed OAuth/NextAuth flow (> 5% failure rate)
- [ ] Stripe webhook failures (> 1 per minute)
- [ ] Email delivery failures (> 5% of batch)

**Third-Party Monitoring** (Uptime Robot, manual checks)
- [ ] Login page health check fails (alert immediately)
- [ ] Status endpoint fails (alert immediately)
- [ ] API `/health` endpoint fails (alert immediately)

**User-Reported Issues** (Support tickets, Slack #support)
- [ ] Multiple users reporting inability to login (declare immediately)
- [ ] Multiple users reporting feature unavailable (assess severity)
- [ ] Performance complaints from multiple users (assess severity)
- [ ] Data inconsistency reports (assess severity)

**Scheduled Health Checks** (Every 2 hours, manual)
- [ ] Test login flow (dev + production)
- [ ] Create + edit document (test on staging)
- [ ] Check error rates in logs
- [ ] Verify backup jobs completed
- [ ] Spot-check recent user activity

### How to Declare an Incident

When you suspect an incident:

**Step 1: Immediate Assessment (1 minute)**
```
Ask yourself:
- What exactly is broken? (auth? API? UI? data?)
- When did it start? (exact time)
- Who is affected? (one user? feature? everyone?)
- Can business continue? (with workaround?)
- Do users know yet? (support tickets? Slack?)
```

**Step 2: Severity Assignment (1 minute)**
```
Consult severity table above:
- Can users login? No = SEV 1
- Can users use core features? No = SEV 1
- Is performance severely degraded? = SEV 2
- Is one feature broken but workaround exists? = SEV 3
- Cosmetic only? = SEV 4
- Unsure? Default to SEV 2 (escalate when clear)
```

**Step 3: Declare Incident (2 minutes)**
```bash
# Step 3a: Create #incidents Slack channel (if not exists)
/create-channel incidents-[YYYYMMDD-HHMM]
# Example: #incidents-20260607-1405

# Step 3b: Post incident declaration
slack:
@channel INCIDENT DECLARED

Severity: SEV [1-4]
Title: [Brief description]
Impact: [Users affected]
Time started: [UTC time]
Status: INVESTIGATING

Incident Commander: @[Your name]
On-Call Lead: @[On-call engineer]
```

**Step 4: Page on-call (SEV 1 & 2 only)**
```bash
# For SEV 1 & 2: Use PagerDuty
pagerduty trigger incident \
  --severity "[SEV-1|SEV-2]" \
  --title "IPOReady: [Brief description]" \
  --service "IPOReady-Platform"

# For SEV 3: Post in #incidents, tag on-call engineer
# For SEV 4: No notification needed
```

---

## Response Procedures by Severity

### SEV 1 Critical Response Flow

**First 5 Minutes**:
1. **Declare** incident in #incidents (copy quick reference card format)
2. **Page** on-call engineer via PagerDuty (immediate)
3. **Page** CTO if infrastructure issue (immediate)
4. **Assess** exact symptoms and affected systems
5. **Start** Slack war room (pin links to monitoring dashboards)

**5-15 Minutes**:
1. **Collect** data: Check logs, monitoring, error rates
2. **Identify** root cause (use decision tree below)
3. **Name** Incident Commander (usually on-call + CTO)
4. **Engage** relevant team (database team, platform team, etc.)
5. **Update** status: Every 5 minutes in #incidents

**15-30 Minutes**:
1. **Attempt** quick fix (restart service, clear cache, etc.)
2. **If no quick fix**: Prepare rollback or failover
3. **Assess** data loss risk
4. **Notify** customers if > 5 min downtime (status page + email)
5. **Escalate** to CEO if customer-impacting

**30-60 Minutes**:
1. **Execute** recovery procedure (see specific scenarios below)
2. **Verify** system is recovering
3. **Monitor** error rates returning to normal
4. **Declare** RESOLVED when:
   - Error rate < 0.1%
   - API response time < 200ms
   - Users can complete workflows
   - No new errors in logs (5 min check)

**Post-Resolution** (First 2 hours):
1. **Complete** post-incident checklist (see below)
2. **Send** incident report to stakeholders
3. **Document** timeline and resolution
4. **Identify** follow-up actions (prevent recurrence)

---

### SEV 2 High Priority Response Flow

**First 15 Minutes**:
1. **Declare** incident in #incidents with SEV 2 label
2. **Alert** on-call engineer via PagerDuty (or Slack if already monitoring)
3. **Assess** impact: percentage of users affected, which feature
4. **Collect** baseline: Error rates, response times, logs
5. **Start** war room in Slack (tag relevant team members)

**15-45 Minutes**:
1. **Diagnose** root cause using monitoring dashboards
2. **Check** recent changes (deployments in last 30 min)
3. **Assess** database status and API health
4. **Attempt** quick mitigations:
   - Clear cache (if applicable)
   - Restart non-critical services
   - Enable graceful degradation (disable non-critical features)
5. **Update** status every 15 minutes

**45 Min - 4 Hours**:
1. **Deploy** fix OR **execute** recovery procedure
2. **Monitor** error rates and user reports
3. **Measure** recovery: % of users back to normal service
4. **Declare** RESOLVED when error rate normal and users report ok
5. **Wrap up**: Brief incident summary in Slack

**Post-Resolution** (Same business day):
1. **Complete** post-incident checklist
2. **Send** brief incident summary to team
3. **Schedule** postmortem for next business day
4. **Create** GitHub issues for any follow-ups

---

### SEV 3 Medium Priority Response Flow

**First 1-2 Hours**:
1. **Post** issue in #incidents channel (no page-out)
2. **Alert** on-call engineer via Slack message
3. **Assess** workarounds available to users
4. **Determine** if SEV 3 or should be escalated to SEV 2
5. **Create** GitHub issue for tracking

**2-8 Hours**:
1. **Investigate** root cause during regular work hours
2. **Prepare** fix or workaround
3. **Test** fix on staging environment
4. **Deploy** fix or communicate workaround to users
5. **Update** #incidents with resolution

**Post-Resolution** (Next business day):
1. **Verify** fix is stable
2. **Send** brief update to team
3. **Create** any follow-up tickets (no postmortem needed for SEV 3)

---

### SEV 4 Low Priority Response Flow

No special response required. Create GitHub issue, fix in next sprint.

---

## Incident Scenarios & Recovery Procedures

### Scenario A: Authentication System Down

**Severity**: SEV 1 (all users affected)

**Symptoms**:
- Users see "Invalid client" error
- Login button does nothing
- OAuth redirect fails
- NextAuth session invalid

**Root Causes** (in order of likelihood):
1. OAuth provider credentials expired/revoked
2. OAuth redirect URL misconfigured
3. NextAuth secret corrupted or changed
4. Database connection to session table broken
5. OAuth provider (Google/GitHub) experiencing outage

**Recovery**:

```bash
# STEP 1: Verify the problem (1 min)
# Open browser, try to login at https://app.ipoready.com
# If stuck on login page or error, confirmed

# STEP 2: Check OAuth provider status (1 min)
# Google: https://status.cloud.google.com
# GitHub: https://www.githubstatus.com
# If provider is down, declare external incident and notify users
# If provider is up, continue to step 3

# STEP 3: Check environment variables (2 min)
# SSH into Vercel deployment or check in Vercel dashboard
# Settings → Environment Variables → Check:
#   - NEXTAUTH_SECRET (should be 32+ char random)
#   - NEXTAUTH_URL (should be https://app.ipoready.com)
#   - GOOGLE_CLIENT_ID (should match OAuth app)
#   - GOOGLE_CLIENT_SECRET (should match OAuth app)

# STEP 4: Rotate OAuth credentials if needed (5 min)
# If env vars look wrong:
# a) Go to Google Cloud Console
# b) Navigate to APIs & Services → Credentials
# c) Find "IPOReady" OAuth 2.0 Client ID
# d) Regenerate Client Secret
# e) Update GOOGLE_CLIENT_SECRET in Vercel
# f) Restart deployment
# Test login again

# STEP 5: Check NextAuth session database (2 min)
psql $DATABASE_URL
SELECT COUNT(*) FROM sessions;
# If table missing or locked, SEE SCENARIO B (Database Down)

# STEP 6: Restart deployment if needed (2 min)
# Vercel Dashboard → IPOReady → Deployments
# Click on current deployment → Redeploy
# Wait 3-5 minutes for deployment to complete

# STEP 7: Test login (2 min)
# Open https://app.ipoready.com in incognito window
# Try login with test account
# If successful: System recovered
```

**When to escalate**:
- OAuth provider down → Declare external incident, notify users
- Database still down after 30 min → Escalate to database team
- Still failing after 45 min → Page CTO

---

### Scenario B: Database Connection Failures

**Severity**: SEV 1 (if complete), SEV 2 (if intermittent)

**Symptoms**:
- Error: "connect ECONNREFUSED" 
- Error: "too many connections"
- Error: "relation does not exist"
- API returns 500 errors
- Queries hang or timeout

**Root Causes** (in order of likelihood):
1. Connection pool exhausted (too many open connections)
2. Database reaching compute limit (CPU/RAM)
3. Neon database crashed or restarted
4. Network connectivity issue
5. Database query performance degraded (locks)

**Recovery**:

```bash
# STEP 1: Check Neon dashboard (2 min)
# Go to https://console.neon.tech
# Select IPOReady project
# Check:
#   - Green checkmark next to database name (should be "green")
#   - Compute units available (should be > 0)
#   - Recent activity (any errors?)

# STEP 2: Check API error rates (1 min)
# Vercel dashboard → IPOReady → Monitoring → Errors
# Note: Are errors increasing? Plateau? Or decreasing?

# STEP 3: Check connection pool (3 min)
# Connect to database:
psql $DATABASE_URL
SELECT count(*) FROM pg_stat_activity;
# If result > 90: Too many connections, see MITIGATION A

# STEP 4: Check database status (1 min)
# Still in Neon console:
# Compute section → Status should be "Started"
# If "Failed" or "Starting": Wait 2 min, check again
# If still not "Started": Restart compute (Restart button)

# STEP 5: Kill idle connections if needed (2 min)
psql $DATABASE_URL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' 
AND backend_type = 'client backend'
AND query_start < now() - interval '5 minutes';
# This kills connections idle > 5 minutes

# STEP 6: Restart services (3 min)
# Vercel dashboard → IPOReady → Deployments
# Click on current deployment → Redeploy
# This will:
#   - Create fresh connection pool
#   - Clear any stuck queries
#   - Refresh database connections
# Wait 3-5 minutes for deployment

# STEP 7: Monitor for 5 minutes (5 min)
# Watch Vercel monitoring dashboard
# Check error rate should return to < 0.1%
# Check database connections should stay < 50

# STEP 8: If still failing:
# Option A: Failover to read replica (if configured)
# Option B: Restore from backup (Scenario D)
# Option C: Escalate to Neon support
```

**Mitigation A: Connection Pool Exhaustion** (if killing idle connections doesn't help)

```bash
# Reduce connection pool size temporarily
# Edit: src/db/client.ts or wherever PrismaClient is initialized
# Find: max: 10, idle: 2 (or similar)
# Change to: max: 5, idle: 1
# Redeploy

# This limits concurrent connections, reducing load on database
# Downside: Some requests might be delayed
# Upside: Prevents connection pool exhaustion

# After system is stable, increase back to normal values
```

---

### Scenario C: API Performance Degradation (Slow Responses)

**Severity**: SEV 2 (if response time > 5 sec), SEV 3 (if 2-5 sec)

**Symptoms**:
- Page load times > 5 seconds
- API response time > 2000ms (normal is < 500ms)
- Users report slow document uploads
- Dashboard widgets loading slowly
- Search results delayed

**Root Causes** (in order of likelihood):
1. Database query performance degraded (missing index, full table scan)
2. External API call slow (Google Drive, Stripe, etc.)
3. Memory pressure / garbage collection pauses
4. CPU saturation on deployment
5. Network bandwidth saturation
6. Large file upload/download operation

**Recovery**:

```bash
# STEP 1: Check database query performance (3 min)
# Vercel Analytics or Neon monitoring:
# Look for slow queries (> 500ms)
# Common culprits: Missing indexes, N+1 queries, full table scans

# STEP 2: Check external API status (1 min)
# If API calls are slow, check:
# - Google API status: https://status.cloud.google.com
# - Stripe status: https://status.stripe.com
# - AWS status: https://status.aws.amazon.com
# If any are degraded, declare external incident

# STEP 3: Check deployment resource usage (1 min)
# Vercel dashboard → Monitoring → CPU/Memory
# If CPU > 80% or Memory > 90%:
#   Option A: Reduce traffic (pause background jobs)
#   Option B: Scale to larger instance (if available)
#   Option C: Identify and kill slow query

# STEP 4: Find slow query (5 min)
# Check logs for slow queries:
psql $DATABASE_URL
SELECT query, mean_time, calls FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

# If a query shows > 500ms average, optimize it:
# a) Add index to frequently filtered columns
# b) Add indexes to JOIN columns
# c) Reduce data fetched (pagination, limiting columns)

# STEP 5: Add index for slow query (5 min)
# If query is slow on a large table:
psql $DATABASE_URL
CREATE INDEX idx_documents_company_id ON documents(company_id);
ANALYZE documents;
# Verify: Query should now be < 100ms

# STEP 6: Restart background jobs (2 min)
# If memory pressure: Stop non-critical background jobs
# API exports, archival tasks, email sending can wait
# Vercel → Environment → Set JOB_QUEUE_DISABLED=true
# Redeploy
# This frees up memory for user-facing requests

# STEP 7: Monitor for 5 minutes (5 min)
# Check API response times in Vercel dashboard
# Should return to < 500ms within 5 minutes
# If not, escalate to platform team
```

---

### Scenario D: Data Loss / Corruption

**Severity**: SEV 1 (if affecting critical data), SEV 2 (if some data lost)

**Symptoms**:
- User data missing (documents, metrics, settings)
- Corrupted values in database
- Duplicate records appearing
- Inconsistent data across tables
- User reports "my data disappeared"

**Root Causes** (in order of likelihood):
1. Failed migration or deployment
2. Accidental DELETE query
3. Cascade delete from related table
4. Data sync corruption (cloud storage sync issue)
5. Database backup failed (no recovery possible)

**Recovery**:

```bash
# STEP 1: Assess scope of data loss (5 min)
# Ask:
# - What data is missing? (documents? metrics? settings?)
# - Which users affected? (one? many? all?)
# - When was it lost? (this hour? yesterday?)
# - Is there a backup available? (yes? no?)

# STEP 2: Stop any ongoing operations (1 min)
# If background jobs are running:
#   Vercel → Environment → JOB_QUEUE_DISABLED=true
#   Redeploy (to prevent cascading data loss)

# STEP 3: Attempt recovery from PITR (30 min)
# If data loss < 1 hour old and PITR available:
psql $DATABASE_URL
SELECT recovery_target_timeline FROM pg_control_recovery_conf();
# If result exists: PITR is available

# Get timestamp of last good state:
# Example: 2026-06-07 14:00:00 (before data loss)
TARGET_TIME="2026-06-07T14:00:00Z"

# Request PITR from Neon:
# Neon Console → Branches → Create Branch from Timeline
# Select database and target timestamp
# Wait 5-15 minutes for branch creation
# Verify data is intact:
psql [new-database-url]
SELECT COUNT(*) FROM documents WHERE deleted_at IS NULL;
# Compare to known good count

# Once verified, update DATABASE_URL to point to restored branch
# Vercel → Environment Variables → DATABASE_URL → Update
# Redeploy

# STEP 4: If PITR not available, restore from S3 backup (60 min)
# See procedures/RECOVERY_RUNBOOK.md → "Scenario 1: Database Corruption"
# This takes 30-60 minutes

# STEP 5: Communicate data loss to users (5 min)
# Create incident report:
# "Due to [root cause], data from [time range] was recovered.
#  Your recent changes may have been lost.
#  Please verify your data and contact support if issues found."

# STEP 6: Root cause analysis (next 24 hours)
# - Review what query caused data loss
# - Check deployment logs for failed migration
# - Review access logs for accidental DELETE
# - Add safeguards:
#   - Soft deletes (deleted_at flag)
#   - Write access controls
#   - Query validation before execution
```

---

### Scenario E: Document Upload / Cloud Storage Failures

**Severity**: SEV 2 (if affecting core workflow), SEV 3 (if workaround exists)

**Symptoms**:
- Upload button greyed out or not working
- Error: "Upload failed"
- Files stuck in "uploading" state
- Cloud storage not syncing (Google Drive, Dropbox, OneDrive)
- Error: "Invalid credentials" for cloud integrations

**Root Causes** (in order of likelihood):
1. S3 bucket not accessible (permissions, quota)
2. Cloud provider access token expired
3. User cloud storage quota exceeded
4. Presigned URL generation failed
5. File size exceeds limit
6. Network connectivity issue

**Recovery**:

```bash
# STEP 1: Check cloud storage status (2 min)
# Google Cloud status: https://status.cloud.google.com
# AWS S3 status: https://status.aws.amazon.com
# Dropbox status: https://status.dropbox.com
# If any are degraded, declare external incident

# STEP 2: Check S3 bucket access (2 min)
# AWS Console → S3 → ipoready-documents bucket
# Check bucket status: Should be "Available"
# Check bucket policy: Should allow GetObject, PutObject
# Check bucket quota: Should have free space available

# STEP 3: Check user cloud credentials (3 min)
# For each user reporting issue:
# Ask: "Did you recently change your password?"
# If yes: Have user reauthorize cloud storage
# Button: Dashboard → Settings → Cloud Integrations → Reconnect

# STEP 4: Check file size limits (1 min)
# If users report upload failures for large files:
# Limits (update from src/config/upload.ts):
#   - PDF: 50MB
#   - Images: 10MB
#   - Documents: 100MB
# If user file exceeds limit, ask them to compress or split

# STEP 5: Verify presigned URL generation (3 min)
psql $DATABASE_URL
SELECT COUNT(*) FROM document_uploads WHERE status = 'pending';
# If many pending uploads stuck, restart upload service:
# Vercel → Deployments → Redeploy current

# STEP 6: Check S3 request metrics (2 min)
# CloudWatch → S3 metrics → Requests
# Look for 4xx errors (permission denied) or 5xx errors (service issue)
# If seeing errors: Check IAM role permissions, retry requests

# STEP 7: Monitor uploads for 5 minutes
# Have affected user try uploading test file
# Check logs for errors
# If successful: System recovered
# If still failing: Escalate to cloud operations team
```

---

### Scenario F: Email / Notification Delivery Failures

**Severity**: SEV 2 (if affecting critical notifications), SEV 3 (if non-critical)

**Symptoms**:
- Users not receiving signup confirmation emails
- Task reminder emails not being sent
- Notification system errors in logs
- Email delivery delay > 30 minutes

**Root Causes** (in order of likelihood):
1. Email provider quota exceeded (SendGrid, etc.)
2. SMTP credentials invalid
3. Email bouncing due to invalid address
4. Background job queue backed up
5. Email provider experiencing outage

**Recovery**:

```bash
# STEP 1: Check email provider status (1 min)
# SendGrid status: https://status.sendgrid.com
# If degraded, declare external incident

# STEP 2: Check SendGrid dashboard (3 min)
# SendGrid console → Monitor usage
# Check: Email quota remaining, bounce rate, spam complaints
# If quota exceeded, request increase or reduce email volume

# STEP 3: Check email credentials (2 min)
# Vercel → Environment Variables
# Check: SENDGRID_API_KEY is valid (hasn't been revoked)
# If needed, regenerate and update

# STEP 4: Check job queue (2 min)
psql $DATABASE_URL
SELECT status, COUNT(*) FROM email_jobs GROUP BY status;
# If many jobs in 'pending' state:
#   Option A: Increase worker concurrency
#   Option B: Restart background workers

# STEP 5: Retry failed emails (3 min)
psql $DATABASE_URL
UPDATE email_jobs SET status = 'pending' 
WHERE status = 'failed' 
AND created_at > now() - interval '1 hour';
# This retries emails that failed in last hour

# STEP 6: Monitor send rates (5 min)
# SendGrid dashboard → Activity Feed
# Look for increased success rate
# Should return to normal within 5-10 minutes

# STEP 7: If still failing:
# Check individual email logs:
psql $DATABASE_URL
SELECT recipient, error_message, created_at FROM email_jobs 
WHERE status = 'failed' 
ORDER BY created_at DESC LIMIT 5;
# Use these logs to debug specific failures
```

---

### Scenario G: Payment / Stripe Failures

**Severity**: SEV 1 (if blocking payment), SEV 2 (if refunds failing)

**Symptoms**:
- Users can't complete checkout
- Error: "Payment failed"
- Webhook failures in logs
- Subscriptions not activating
- Refund processing failing

**Root Causes** (in order of likelihood):
1. Stripe webhook secret invalid
2. Stripe API key credentials wrong
3. Stripe account suspended or limited
4. Payment intent creation failing
5. Stripe service outage

**Recovery**:

```bash
# STEP 1: Check Stripe status (1 min)
# Stripe status: https://status.stripe.com
# If degraded, declare external incident

# STEP 2: Verify Stripe credentials (2 min)
# Vercel → Environment Variables
# Check: STRIPE_SECRET_KEY exists and valid
# Check: STRIPE_PUBLIC_KEY exists and valid
# Go to Stripe Dashboard to verify:
#   - Keys should match (test vs. live)
#   - Keys should not be expired/revoked

# STEP 3: Check Stripe account status (2 min)
# Stripe Dashboard → Account overview
# Check for warnings/limitations
# Check recent activity for errors

# STEP 4: Verify webhook configuration (3 min)
# Stripe Dashboard → Webhooks
# Find endpoint: https://app.ipoready.com/api/webhooks/stripe
# Check: Status should be "Enabled"
# Check: Signing secret should match STRIPE_WEBHOOK_SECRET env var
# If not: Regenerate signing secret and update env var

# STEP 5: Retry failed webhook events (5 min)
# Stripe Dashboard → Webhooks → Recent deliveries
# Look for failures (red X icons)
# Select failed events and click "Resend"
# This retriggers webhook processing

# STEP 6: Check for payment intent errors (3 min)
psql $DATABASE_URL
SELECT error_message, COUNT(*) FROM payment_attempts 
WHERE status = 'failed' 
AND created_at > now() - interval '1 hour'
GROUP BY error_message;
# Use these to identify specific payment failures

# STEP 7: Monitor payment success rate (5 min)
# Stripe Dashboard → Payments
# Success rate should return to > 99%
# If still < 95% after 30 min: Escalate to Stripe support
```

---

### Scenario H: Cascading / Unknown Failures

**Severity**: SEV 1 (if system completely down), SEV 2 (if degraded)

**Symptoms**:
- Multiple systems failing at same time
- Unclear which component is root cause
- Errors appearing across different parts of system
- Difficult to reproduce or isolate issue

**Recovery**:

```bash
# STEP 1: DECLARE INCIDENT IMMEDIATELY (1 min)
# Severity: SEV 1 if nothing works, SEV 2 if partial
# This is too complex for single engineer

# STEP 2: GATHER INCIDENT COMMANDER + TEAM (2 min)
# Page: CTO + Platform Lead + Database specialist
# Use war room: #incidents-[timestamp]

# STEP 3: STABILIZE (5-10 min)
# Decision tree:
#   Can users login? (auth critical)
#   Can users read data? (API critical)
#   Can users create/edit? (write critical)
#   Can payments process? (revenue critical)
#
# Prioritize fixing in that order

# STEP 4: PARALLEL INVESTIGATION (10-20 min)
# Assign teams to investigate:
#   Team A: Check deployment (recent changes?)
#   Team B: Check database (connection? performance?)
#   Team C: Check external APIs (provider outage?)
#   Team D: Monitor errors (find common pattern)

# STEP 5: ROOT CAUSE HYPOTHESIS (20 min)
# Gather findings and determine likely cause:
#   Recent deployment introduced bug?
#   Database query regression?
#   External API dependency down?
#   Resource exhaustion (CPU/memory)?
#
# Test hypothesis with:
#   Rollback deployment?
#   Scale resources?
#   Isolate affected feature?

# STEP 6: EXECUTE FIX (varies)
# Once root cause identified, execute appropriate recovery:
#   Deployment issue → Rollback to previous version
#   Database issue → Scenario B (Database Connection Failures)
#   API issue → Scenario specific recovery
#   Resource issue → Scale up or disable non-critical features

# STEP 7: VERIFY RECOVERY (10 min)
# For each affected system:
#   - Can users login? (test with real account)
#   - Can users read data? (query API)
#   - Can users create/edit? (create test document)
#   - Can payments process? (test transaction)
#
# Once all verified: Declare system recovered

# STEP 8: COMMUNICATE & DOCUMENT (10 min)
# Send full incident report to stakeholders
# Document: Timeline, root cause, fix applied, preventions
```

---

## Communication Protocol

### During Incident

**Every 5 minutes (SEV 1 only)**:
```
#incidents channel update:
Time: [HH:MM UTC]
Status: INVESTIGATING | IN PROGRESS | RESOLVED
Current Issue: [Brief description of what's broken]
Impact: [Number/% of users affected]
ETA: [Estimated time to resolution]
Actions: [What we're currently doing]
```

**Every 15 minutes (SEV 1 & 2)**:
```
Send to stakeholders channel (#leadership or #board):
@here Incident Update - [Title]

Status: INVESTIGATING | IN PROGRESS | RESOLVED
Severity: SEV 1 | SEV 2
Impact: [Users affected / revenue impact]
ETA: [Estimated time to resolution]
Latest: [Most recent development]
```

**Every 30 minutes (SEV 3)**:
```
Post in #incidents channel:
Status update: [Brief progress]
ETA: [Estimated time to resolution]
```

### Status Page

Update status.ipoready.com for:
- **SEV 1**: Update immediately, every 5 minutes during incident, keep for 24 hours after
- **SEV 2**: Update immediately, every 30 minutes during incident, keep for 12 hours after
- **SEV 3**: Optional (post when convenient), after incident is clear

**Status Page Post Template**:
```
[INVESTIGATING|ONGOING|RESOLVED] - [Title]

We are investigating a [description] issue.
[% of users] are currently affected.
ETA: [time]

Latest: [Brief update]
```

### Post-Incident Communication

**Within 1 hour**:
- [ ] Send "Incident Resolved" message to #incidents
- [ ] Update status page to "Resolved"
- [ ] Remove incident label from Slack channel

**Within 24 hours**:
- [ ] Send incident report to stakeholders (see template below)
- [ ] Schedule postmortem meeting (email calendar invite)
- [ ] Create GitHub issues for preventive actions

---

## Post-Incident Checklist

Complete this checklist immediately after every incident (SEV 1, 2, 3).

### Immediate (Within 1 Hour)

- [ ] **Verify System Stable**: 
  - [ ] Error rate < 0.1% for 10 minutes
  - [ ] API response time normal
  - [ ] No new user reports
  - [ ] Monitoring dashboards all green

- [ ] **Stop Paging**: 
  - [ ] Resolve PagerDuty incident
  - [ ] Update #incidents channel
  - [ ] Update status page

- [ ] **Gather Information**:
  - [ ] Capture logs: `export INCIDENT_ID=[unique-id]; save logs to incidents/[INCIDENT_ID]/logs.txt`
  - [ ] Export timeline: Export #incidents channel to file
  - [ ] Screenshot: Monitoring dashboards showing recovery
  - [ ] Document any hotfixes applied

- [ ] **Initial Notification**:
  - [ ] Notify Slack #incidents: "Incident resolved, postmortem scheduled"
  - [ ] Update status page to "Resolved"
  - [ ] Email key stakeholders (CEO, product, engineering leads)

### Same Day (Within 4 Hours)

- [ ] **Root Cause Identification**:
  - [ ] Review logs and timeline
  - [ ] Identify what went wrong
  - [ ] Identify why it wasn't caught earlier
  - [ ] Document: 1-2 sentence root cause summary

- [ ] **Incident Report**:
  - [ ] Create document: `incidents/[DATE-TIME]-[TITLE]-report.md`
  - [ ] Fill in: Timeline, impact, root cause, resolution, preventive actions
  - [ ] Share in Slack #incidents channel

- [ ] **Create Follow-Up Issues**:
  - [ ] Create GitHub issues for preventive actions (label: `incident-followup`)
  - [ ] Assign to owners
  - [ ] Link to incident report

### Within 24 Hours

- [ ] **Schedule Postmortem**:
  - [ ] Create Slack reminder or calendar invite
  - [ ] Schedule for: Next business day, 30 minutes after incident
  - [ ] Attendees: On-call engineer, platform lead, CTO, product owner
  - [ ] Duration: 30-60 minutes

- [ ] **Prepare Postmortem**:
  - [ ] Incident report completed and shared
  - [ ] Postmortem template filled out (see below)
  - [ ] All data/logs available in incidents/[INCIDENT_ID]/

### After Postmortem (Within 1 Week)

- [ ] **Implement Preventions**:
  - [ ] Assign all action items from postmortem
  - [ ] Set target dates (within 2 weeks for high-priority)
  - [ ] Track progress in GitHub project

- [ ] **Update Documentation**:
  - [ ] Update runbook if procedures changed
  - [ ] Add new scenarios if applicable
  - [ ] Update monitoring alerts if needed

---

## Post-Incident Report Template

Create file: `incidents/[DATE-HHMMUTC]-[SHORT-TITLE]-report.md`

```markdown
# Incident Report: [Title]

**Incident ID**: [DATE-HHMMUTC]-[TITLE]
**Date/Time**: [YYYY-MM-DD HH:MM UTC - HH:MM UTC]
**Duration**: [X minutes]
**Severity**: [SEV 1 | 2 | 3]
**Status**: [RESOLVED | INVESTIGATING]
**Assigned To**: [On-call engineer name]
**Reported By**: [User/Monitoring alert]

## Executive Summary

[1-2 sentences describing what happened and user impact]

## Timeline

| Time (UTC) | Event | Owner |
|-----------|-------|-------|
| HH:MM | [Event] | [Name] |
| HH:MM | [Event] | [Name] |
| HH:MM | INCIDENT RESOLVED | [Name] |

## Impact Assessment

- **Users Affected**: [Number or %]
- **Features Down**: [List]
- **Revenue Impact**: [$] (if applicable)
- **Data Loss**: [None | Describe]
- **SLA Met**: [Yes | No - missed by X minutes]

## Root Cause Analysis

### Primary Cause
[What actually went wrong]

### Contributing Factors
- [Factor 1]
- [Factor 2]
- [Why wasn't this caught earlier?]

### Why This Happened
[Context: Recent deployment? Traffic spike? Unknown?]

## Detection & Response

- **Detected By**: [Monitoring | User report | Support ticket]
- **Detection Time**: [Time from start to alert]
- **Response Time**: [Time from alert to first action]
- **Resolution Time**: [Time from start to RESOLVED]

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Detection | < 5 min | [X] min | [✅ / ❌] |
| First Response | < 15 min | [X] min | [✅ / ❌] |
| Resolution | < 1 hour | [X] min | [✅ / ❌] |

## Resolution

### Actions Taken
1. [Action]
2. [Action]
3. [Action]

### Why It Worked
[Explanation of how these actions resolved the issue]

### Verification
- [Verification step 1]
- [Verification step 2]
- [Monitoring shows: Error rate returned to normal, etc.]

## Preventive Actions

### Immediate (This Week)
- [ ] [Action] - Owner: [Name] - Target: [Date]
- [ ] [Action] - Owner: [Name] - Target: [Date]

### Short-Term (This Month)
- [ ] [Action] - Owner: [Name] - Target: [Date]
- [ ] [Action] - Owner: [Name] - Target: [Date]

### Long-Term (This Quarter)
- [ ] [Action] - Owner: [Name] - Target: [Date]
- [ ] [Action] - Owner: [Name] - Target: [Date]

## Lessons Learned

### What We Did Well
- [Positive observation]
- [Positive observation]

### What We Could Improve
- [Area for improvement]
- [Area for improvement]

### Monitoring Gaps
- [Gap 1: Should have alerted on...]
- [Gap 2: Should have visible metric for...]

## Related Documents

- [Link to monitoring dashboards]
- [Link to logs: incidents/[INCIDENT_ID]/logs.txt]
- [Link to GitHub issues created]
- [Link to postmortem notes (if held)]

---

**Report Created**: [Date] by [Name]
**Last Updated**: [Date] by [Name]
```

---

## Postmortem Meeting Template

**Duration**: 30-60 minutes  
**Attendees**: On-call engineer, platform lead, CTO, relevant team members  
**Agenda**:

1. **Summary** (5 min)
   - Title, duration, severity
   - Impact: Users, revenue, data
   - SLA: Met or missed?

2. **Timeline** (10 min)
   - Walk through timeline
   - Discuss: Detection, response, resolution
   - Note: Any delays or missteps?

3. **Root Cause Analysis** (10 min)
   - What actually happened?
   - Why did we not catch it earlier?
   - Was it predictable? Preventable?

4. **Action Items** (10 min)
   - Discuss preventive actions
   - Assign owners and due dates
   - Identify: Immediate, short-term, long-term fixes

5. **Lessons & Improvements** (10 min)
   - What did we do well?
   - What could we improve?
   - Monitoring gaps?
   - Process improvements?

6. **Closing** (5 min)
   - Confirm action items assigned
   - Confirm postmortem document shared
   - Confirm GitHub issues created

**Output**: 
- Updated incident report
- GitHub issues for all action items
- Slack summary of action items

---

## Escalation Matrix

### SEV 1 (Critical)

| Time | Owner | Contact | Action |
|------|-------|---------|--------|
| 0 min | On-call | Page immediately | Start incident response |
| 0 min | CTO | Page immediately | Lead incident |
| 5 min | CEO | Notify if user-facing | Keep aware of status |
| 15 min | Comms | Notify if public | Prepare customer communication |

### SEV 2 (High)

| Time | Owner | Contact | Action |
|------|-------|---------|--------|
| 15 min | On-call | PagerDuty alert | Start incident response |
| 15 min | Platform lead | Slack message | Offer support |
| 1 hour | Product | Slack message | Check business impact |
| 4 hours | All team | Slack update | Postmortem scheduled |

### SEV 3 (Medium)

| Time | Owner | Contact | Action |
|------|-------|---------|--------|
| 1 hour | On-call | Slack #incidents | Acknowledged |
| 2 hours | Team | Can investigate | No page-out |
| 1 day | All team | Slack #incidents | Resolution update |

### SEV 4 (Low)

No escalation needed. Create GitHub issue, fix in normal sprint.

---

## Monitoring & Alerting Setup

### What to Monitor

**Critical Path Metrics** (alert on every threshold breach):
- Database connection availability: 99.9%+
- API error rate: < 1%
- API p95 latency: < 2 seconds
- Authentication success rate: > 99%
- Document upload success rate: > 98%
- Payment processing success rate: > 99.5%

**Health Metrics** (alert when degraded):
- Database CPU: < 80%
- Database memory: < 80%
- Deployment CPU: < 80%
- Deployment memory: < 90%
- Disk usage: < 85%
- Connection pool utilization: < 90%

**Application Metrics** (alert on spike):
- Unhandled exception rate: < 1 per minute
- Failed Stripe webhooks: < 1 per hour
- Failed email sends: < 5%
- Failed cloud storage syncs: < 2%

### Alert Severity Mapping

| Metric | Threshold | Alert Severity |
|--------|-----------|-----------------|
| Database down | Yes | SEV 1 (page immediately) |
| Auth failure > 5% | Yes | SEV 1 (page immediately) |
| API error rate > 5% | Yes | SEV 2 (alert in 15 min) |
| API latency > 5sec | Yes | SEV 2 (alert in 15 min) |
| Database latency > 1sec | Yes | SEV 2 (alert in 15 min) |
| Document upload fail > 5% | Yes | SEV 2 (alert in 15 min) |
| CPU usage > 80% | Yes | SEV 2 (alert once) |
| Memory usage > 90% | Yes | SEV 2 (alert once) |
| Disk usage > 85% | Yes | SEV 3 (alert in 1 hour) |
| Email send fail > 10% | Yes | SEV 3 (alert in 1 hour) |
| Unhandled exception spike | Yes | SEV 2 or 3 (context dependent) |

---

## Frequently Asked Questions

**Q: What if I'm not sure about severity?**  
A: Default to SEV 2 (escalate). It's better to page the team and stand them down than miss a critical incident. You can always de-escalate later.

**Q: Can I fix the incident without declaring it?**  
A: Only if you fix it in < 5 minutes with 100% certainty. Otherwise, declare immediately. Transparency is more important than speed.

**Q: What if the incident is still ongoing at resolution target time (1 hr for SEV 1)?**  
A: Continue work. Resolution target is a goal, not a deadline. Update stakeholders every 15 minutes. Escalate to CTO if no progress after 1.5 hours.

**Q: When should I use the postmortem meeting template?**  
A: After every SEV 1 and SEV 2 incident. SEV 3 incidents can skip formal postmortem (brief review in #incidents ok).

**Q: What if I make a mistake during incident response?**  
A: Stop immediately, ask for help, document what happened. Don't try to hide it. Transparency > perfection.

**Q: Can I test the incident response procedures?**  
A: Yes! Schedule a "chaos engineering" day monthly. Simulate an incident and run through response procedures. Great way to practice.

**Q: Who should be on the on-call rotation?**  
A: All engineers who have deployed to production should be on-call. Typical rotation: 1 engineer per week (or pair on-call).

**Q: How do I get contact information for the on-call team?**  
A: See PagerDuty or internal oncall schedule. Don't share phone numbers in Slack (use phone system instead).

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-07 | Initial creation: Complete incident response runbook with 8 scenarios |

---

## Document Ownership & Maintenance

**Primary Owner**: Engineering Lead  
**Secondary Owner**: SRE/Platform Team  
**Review Frequency**: Quarterly or after major incident  
**Update Trigger**: After each incident (add lessons learned)  

**Last Updated**: 2026-06-07  
**Next Review**: 2026-09-07  

---

## Quick Links

| Document | Purpose | Location |
|----------|---------|----------|
| **This file** | Incident response procedures | procedures/incident-response.md |
| Disaster Recovery | Data recovery procedures | procedures/RECOVERY_RUNBOOK.md |
| DR Testing | Monthly test schedule | procedures/DR_TEST_SCHEDULE.md |
| GitHub Issues | Track incident actions | github.com/ipoready/ipoready/issues |
| Monitoring Dashboard | Real-time system health | vercel.com/ipoready/monitoring |
| Status Page | Public incident status | status.ipoready.com |
| Slack Channel | Incident coordination | #incidents |

---

**Questions?** Contact Engineering Lead or post in #incidents channel.
