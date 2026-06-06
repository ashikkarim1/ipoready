# IPOReady Disaster Recovery Runbook

**Status**: Production Ready  
**Audience**: On-Call Engineers, SRE Team  
**Last Updated**: 2026-06-07  
**Test Frequency**: Monthly (automated)

---

## Quick Reference Card

**Print & Laminate: Tape to Desk**

```
┌─────────────────────────────────────────┐
│  CRITICAL CONTACTS (MEMORIZE!)          │
├─────────────────────────────────────────┤
│ On-Call: See PagerDuty #on-call-eng     │
│ CTO: [Name] [Phone]                     │
│ AWS Account: [Account ID]               │
│ Neon: https://console.neon.tech         │
│ Vercel: https://vercel.com/dashboard    │
└─────────────────────────────────────────┘

STEP 1: ASSESS
- What's broken? (DB / App / Blobs?)
- When did it break? (exact time UTC)
- How many users affected?
- Is it in production? (yes = critical)

STEP 2: INCIDENT COMMANDER
- Declare severity (1=critical, 2=high, 3=medium)
- Create war room Slack channel
- Page on-call team
- Set 15-min status update cadence

STEP 3: INITIATE RECOVERY
- Do NOT make changes without IC approval
- Follow procedure below for your scenario
- Document every action taken
- Save logs for post-mortem

STEP 4: COMMUNICATE
- Every 15 minutes: Update stakeholders
- Use #incidents Slack channel
- Update status page
```

---

## Scenario 1: Database Corruption (CRITICAL)

**Symptoms**:
- Error: "relation does not exist"
- Error: "unique constraint violated"
- `SELECT` queries return unexpected results
- Reindex hangs or produces errors

**Decision Tree**:
```
Is data loss < 1 hour old?
├─ YES: Use PITR to 1 hour ago (5 min recovery)
└─ NO: Is backup available?
       ├─ YES: Restore from S3 (45 min recovery)
       └─ NO: Contact Neon support (2+ hour recovery)
```

### Recovery: PITR (Point-in-Time Recovery)

**Estimated Time**: 5–30 minutes  
**Data Loss**: Up to 1 minute

```bash
# STEP 1: VERIFY CORRUPTION (2 min)
psql $DATABASE_URL

ipoready=# SELECT COUNT(*) FROM users;
ERROR: relation "users" does not exist

# Corruption confirmed

# STEP 2: DETERMINE TARGET TIME (1 min)
# Choose a time BEFORE corruption occurred
# Example: If corruption at 14:32 UTC, restore to 14:25 UTC

TARGET_TIME="2026-06-07T14:25:00Z"
echo "Restoring to: $TARGET_TIME"

# STEP 3: INITIATE PITR VIA NEON CLI (1 min)
neon databases restore \
  --database ipoready \
  --source-timestamp "$TARGET_TIME"

# Output:
# Restore initiated...
# Database: ipoready
# Target timestamp: 2026-06-07T14:25:00Z

# STEP 4: MONITOR RESTORE (5–25 min)
# Check status every 30 seconds
watch -n 30 'neon databases status --database ipoready'

# Wait for: "status: ready"

# STEP 5: VERIFY DATA INTEGRITY (3 min)
npx tsx scripts/validate-recovery.ts

# Expected output:
# ✅ users: 250 records
# ✅ companies: 45 records
# ✅ unified_documents: 1,250 records
# ✅ All integrity checks passed

# STEP 6: NOTIFY APPLICATION (1 min)
# Database is now recovered
# No env var changes needed (DATABASE_URL unchanged)
# Application already connected to recovered instance

# STEP 7: RUN SMOKE TESTS (2 min)
curl -s https://ipoready.com/api/health | jq .
# Expected: { "status": "ok", "database": "connected" }

# Test login at https://ipoready.com/login
# Test document upload
# Test cap table view

# STEP 8: POST-RECOVERY CHECKLIST
# [ ] Verify no error logs in Vercel
# [ ] Check Neon activity log for restore operation
# [ ] Create incident ticket #[ISSUE_ID]
# [ ] Schedule post-mortem for next day
# [ ] Update incident Slack thread

# ✅ RECOVERY COMPLETE
```

### Recovery: S3 Backup (if PITR unavailable)

**Estimated Time**: 40–60 minutes  
**Data Loss**: Up to 24 hours

```bash
# STEP 1: ASSESS (2 min)
# Is PITR window still available?
# Check: https://console.neon.tech → Projects → ipoready → Backups

# If < 7 days shown: PITR available, use procedure above
# If no window shown: PITR unavailable, proceed with S3 restore

# STEP 2: DOWNLOAD LATEST BACKUP (3 min)
aws s3 cp \
  s3://ipoready-backups-prod/database-backups/2026-06-07/ipoready-db-2026-06-07.sql.gz \
  /tmp/backup.sql.gz

# Verify download
ls -lh /tmp/backup.sql.gz
# Expected: ~500MB–2GB file

# STEP 3: CREATE RECOVERY DATABASE (5 min)
# Via Neon console: Projects → ipoready → Databases → "Create database"
# Name: ipoready_recovery_2026_06_07
# Branch: main

# Get connection string from Neon console
RECOVERY_DB_URL="postgresql://user:pass@region.neon.tech/ipoready_recovery_2026_06_07?sslmode=require"

# STEP 4: DECOMPRESS BACKUP (2 min)
gunzip /tmp/backup.sql.gz
# Output: /tmp/backup.sql (~5–15GB)

# STEP 5: RESTORE DATABASE (15–30 min)
psql "$RECOVERY_DB_URL" < /tmp/backup.sql

# Monitor progress (in another terminal)
watch -n 10 "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM companies;"

# STEP 6: VALIDATE RECOVERY (3 min)
RECOVERY_DB_URL="$RECOVERY_DB_URL" npx tsx scripts/validate-recovery.ts

# Expected: ✅ All integrity checks passed

# STEP 7: SWITCH APPLICATION TO RECOVERY DB (5 min)
# Update env var (requires redeployment)
# BEFORE:
#   DATABASE_URL=postgresql://user:pass@host/ipoready
# AFTER:
#   DATABASE_URL=postgresql://user:pass@host/ipoready_recovery_2026_06_07

# Via Vercel environment variables:
vercel env add DATABASE_URL "$RECOVERY_DB_URL" --force

# Redeploy:
vercel deploy --prod

# STEP 8: SMOKE TESTS (2 min)
# Wait for deployment to complete (watch Vercel dashboard)
# Test application health: curl https://ipoready.com/api/health
# Test login, document upload, cap table

# STEP 9: CLEANUP (5 min)
# Once confirmed stable (1+ hour), delete corrupted database
# Via Neon console: Projects → ipoready → Databases → Delete

# Rename recovery database back to "ipoready" (optional):
# Projects → ipoready → Databases → ipoready_recovery_2026_06_07 → Rename → ipoready

# ✅ RECOVERY COMPLETE
```

---

## Scenario 2: Application Deployment Failure (CRITICAL)

**Symptoms**:
- New deployment shows error: 500, 502, 503
- Features suddenly broken
- Database queries fail after deploy
- Users report login failures

**Decision Tree**:
```
Did Vercel auto-rollback?
├─ CHECK: Vercel dashboard → recent deployments
├─ Auto-rollback active: Traffic already routed to last good version
├─ Manual rollback needed: Follow steps below
└─ If unclear: Always safe to manual rollback (takes 1 min)
```

### Recovery: Automatic Rollback (Already Happened)

```bash
# STEP 1: VERIFY AUTO-ROLLBACK (1 min)
# Open: https://vercel.com/dashboard → ipoready → Deployments
# Look for green checkmark on oldest recent deployment

# Check timestamps:
# - Failed deployment: 14:32 UTC (shows error)
# - Previous deployment: 14:15 UTC (shows ✅ Ready)

# If ✅ appears next to old deployment = auto-rollback active
# Traffic already routed to last good version

# STEP 2: CONFIRM IN PRODUCTION (2 min)
curl -s https://ipoready.com/api/health | jq .
# Expected: { "status": "ok" }

# Try login: https://ipoready.com/login
# Should work normally

# ✅ AUTO-ROLLBACK COMPLETE
```

### Recovery: Manual Rollback

**If auto-rollback failed or traffic not restored:**

```bash
# STEP 1: IDENTIFY LAST GOOD DEPLOYMENT (2 min)
vercel list --prod

# Output:
# Created               State   URLs
# Jun 7, 2026 2:32 PM  ERROR   ipoready.com (killed)
# Jun 7, 2026 2:15 PM  READY   ipoready.com (previous)
# Jun 7, 2026 1:45 PM  READY   ipoready.com

# Last good = "Jun 7, 2026 2:15 PM"

# STEP 2: INITIATE ROLLBACK (1 min)
vercel rollback

# You'll be prompted to select previous deployment
# Select: "Jun 7, 2026 2:15 PM"

# Confirm: "This will point ipoready.com to the selected deployment"
# Answer: yes

# STEP 3: VERIFY ROLLBACK (1 min)
vercel list --prod

# You should see:
# Jun 7, 2026 2:15 PM  READY   ipoready.com (current)

# STEP 4: SMOKE TESTS (2 min)
curl -s https://ipoready.com/api/health | jq .
# Expected: { "status": "ok" }

# Test login, document access, etc.

# ✅ ROLLBACK COMPLETE
```

### Recovery: Deploy Previous Git Commit

**If rollback failed:**

```bash
# STEP 1: CHECK GIT HISTORY (1 min)
git log --oneline -5

# Output:
# a1b2c3d Fix database migration (BROKEN)
# d4e5f6g Add feature X
# h7i8j9k Previous stable version

# STEP 2: REVERT BROKEN COMMIT (1 min)
git revert a1b2c3d

# This creates a NEW commit that undoes the broken one
# (safer than git reset --hard)

# STEP 3: PUSH TO MAIN (1 min)
git push origin main

# Vercel auto-deploys (watch Vercel dashboard)
# Deployment should complete in 2–5 minutes

# STEP 4: MONITOR DEPLOYMENT (5 min)
watch -n 5 'vercel list --prod | head -1'

# Wait for: "READY" status

# STEP 5: SMOKE TESTS (2 min)
curl -s https://ipoready.com/api/health | jq .

# ✅ REVERT DEPLOYMENT COMPLETE
```

---

## Scenario 3: Database Connection Timeout (HIGH)

**Symptoms**:
- Error: "ECONNREFUSED" or "ENOTFOUND"
- Error: "connection timeout"
- Database queries hang for 30+ seconds
- New deployments can't connect to DB

**Decision Tree**:
```
Can you ping the database?
├─ YES: Is database healthy?
│   ├─ Backlog: Too many connections
│   └─ Solution: Reduce connection pool
│
└─ NO: Is network connectivity OK?
    ├─ YES: Database might be restarting
    │   └─ Wait 2 min and retry
    │
    └─ NO: Network issue (very rare)
        └─ Contact Neon support
```

### Recovery: Reduce Connection Pool

```bash
# STEP 1: CHECK CONNECTION STATUS (1 min)
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Output: 85 connections (too many!)

# STEP 2: IDENTIFY HANGING CONNECTIONS (2 min)
psql $DATABASE_URL -c "SELECT pid, usename, state, query FROM pg_stat_activity WHERE state != 'idle' LIMIT 20;"

# Look for:
# - Queries stuck in "active" state > 5 minutes
# - Connections from test/staging environments
# - Abandoned API connections

# STEP 3: KILL IDLE CONNECTIONS (2 min)
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle' AND query_start < NOW() - INTERVAL '30 minutes';"

# STEP 4: VERIFY CONNECTION COUNT (1 min)
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Should drop from 85 to ~30–40

# STEP 5: REDUCE APPLICATION CONNECTION POOL (3 min)
# In application environment variables:

# BEFORE:
#   DATABASE_CONNECTION_POOL=50

# AFTER:
#   DATABASE_CONNECTION_POOL=25

# Redeploy application:
vercel deploy --prod

# STEP 6: MONITOR (5 min)
# Watch connection count
watch -n 10 'psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null'

# Expected: Stabilize at 30–35 connections

# ✅ CONNECTION POOL REDUCED
```

---

## Scenario 4: Lost Document (Data Loss)

**Symptoms**:
- User reports document missing from data room
- Unified documents table missing record
- Cloud storage file deleted by accident

**Decision Tree**:
```
When was it deleted?
├─ < 1 hour ago: Check cloud provider trash
├─ 1–30 days ago: Restore from cloud provider version history
├─ > 30 days ago: Restore from database backup
└─ > 90 days ago: Try archive (S3 Glacier)
```

### Recovery: Restore from Cloud Storage Trash

**Google Drive**:
```bash
# STEP 1: CHECK GOOGLE DRIVE TRASH (2 min)
# Open: https://drive.google.com/drive/trash
# Search for document name
# Right-click → Restore

# STEP 2: VERIFY RESTORATION (1 min)
# Document should appear in original folder
# Check in IPOReady: /data-room
# Document should be visible again

# ✅ RESTORE COMPLETE
```

**Dropbox**:
```bash
# STEP 1: CHECK DROPBOX TRASH (2 min)
# Open: https://www.dropbox.com/account/deleted_files
# Search for document
# Click "Restore"

# STEP 2: VERIFY IN IPOREADY (1 min)
# Document should sync back automatically
# If not: Click "Sync now" button in Settings

# ✅ RESTORE COMPLETE
```

### Recovery: Restore from Version History

**If file permanently deleted, check version history**:

```bash
# STEP 1: CHECK DATABASE FOR VERSIONS (2 min)
psql $DATABASE_URL

ipoready=# SELECT * FROM document_versions 
           WHERE document_id = 'doc-abc123' 
           ORDER BY created_at DESC LIMIT 10;

# Look for version before deletion time

# STEP 2: RESTORE VERSION (3 min)
# Get the previous version_id, e.g., "v-456"

UPDATE unified_documents SET storage_id = 'v-456'
WHERE id = 'doc-abc123';

# STEP 3: VERIFY IN APP (1 min)
# Refresh data room
# Document should be visible again

# ✅ RESTORE COMPLETE
```

### Recovery: Restore from Database Backup

**If all versions deleted, restore from daily backup**:

```bash
# STEP 1: QUERY BACKUP MANIFEST (2 min)
aws s3 cp \
  s3://ipoready-backups-prod/blob-manifests/manifest-2026-06-06.json \
  /tmp/manifest.json

# Check if document exists in older manifests
grep -r "document-name" /tmp/manifest-*.json

# Find latest manifest where document exists

# STEP 2: RESTORE FROM DATABASE BACKUP (30 min)
# Follow "Scenario 1: Database Corruption" recovery procedure
# This restores entire database to 24 hours ago
# Note: Other recent changes will be lost

# Only use this if:
# - Document cannot be found in any version history
# - Document deleted > 7 days ago
# - High business value document (regulatory file, etc.)

# ✅ RESTORE COMPLETE
```

---

## Scenario 5: Data Breach (SECURITY CRITICAL)

**Symptoms**:
- Unauthorized access detected
- Credentials compromised
- Sensitive data exposed

**Response** (legal/security team leads):

```bash
# STEP 1: IMMEDIATE CONTAINMENT (5 min)
# - Identify affected data scope
# - Determine compromise start time
# - Check access logs

# STEP 2: ROTATE CREDENTIALS (10 min)
# [ ] Change all database passwords
# [ ] Rotate AWS access keys
# [ ] Invalidate all user sessions

# Invalidate sessions:
psql $DATABASE_URL -c "DELETE FROM sessions WHERE created_at < NOW();"

# Force all users to re-login
# Send in-app notification: "Session expired, please login again"

# STEP 3: BACKUP EVIDENCE (5 min)
# [ ] Download access logs
# [ ] Preserve database state
# [ ] Archive Vercel deployment logs
# [ ] Contact Neon: request access logs

aws s3 cp $DATABASE_URL /tmp/evidence/ --recursive

# STEP 4: ENGAGE INCIDENT RESPONSE (Immediately)
# [ ] Notify security team
# [ ] Contact legal team
# [ ] Prepare for disclosure (if required by law)
# [ ] Update privacy policy
# [ ] Notify affected users

# STEP 5: POST-BREACH AUDIT (24+ hours)
# [ ] Third-party security audit
# [ ] Penetration testing
# [ ] Code review for vulnerabilities
# [ ] Implement 2FA/MFA
# [ ] Enable WAF rules

# See: RESPONSIBLE_DISCLOSURE.md for full procedure
```

---

## Scenario 6: Cascading Failures (CRITICAL)

**When multiple systems fail simultaneously:**

```bash
# STEP 1: DECLARE EMERGENCY (1 min)
# - Page on-call team immediately
# - Create war room: #incidents-ipoready
# - Declare SEV-1 (critical)
# - Activate incident commander

# STEP 2: TRIAGE (2 min)
# What's broken?
# [ ] Database: DOWN
# [ ] Application: DOWN
# [ ] Auth: DOWN
# [ ] File storage: DOWN

# STEP 3: DETERMINE ROOT CAUSE (5 min)
# Check:
# [ ] Neon dashboard: https://console.neon.tech
# [ ] Vercel status: https://www.vercel-status.com
# [ ] AWS status: https://status.aws.amazon.com
# [ ] Network status: ping ipoready.com

# STEP 4: EXECUTE RECOVERY IN PRIORITY ORDER
# Priority 1: Restore database (enables everything else)
# Priority 2: Deploy working application version
# Priority 3: Restore auth/user access
# Priority 4: Verify data integrity

# STEP 5: FAILOVER (if needed)
# If primary region down:
# 1. Failover to secondary AWS region (S3 backup)
# 2. Update DNS: ipoready.com → backup-region.ipoready.com
# 3. Redeploy to secondary region
# 4. Run full smoke test suite

# NOTE: Failover requires pre-configured backup infrastructure
# See: Phase 2 Roadmap for multi-region setup

# STEP 6: COMMUNICATE (Ongoing)
# Every 5–10 minutes: Update #incidents channel
# Every 15 minutes: Update all-hands meeting
# Example: "Database restoring (ETA 20 min), app ready to deploy"

# ✅ ROOT CAUSE IDENTIFIED & RECOVERY INITIATED
```

---

## Scenario 7: Compliance Audit / Data Export Request

**When audit team needs backup verification:**

```bash
# STEP 1: GENERATE AUDIT REPORT (10 min)
npx tsx scripts/generate-audit-report.ts --start 2026-01-01 --end 2026-06-07

# Output: audit-report-2026-06-07.pdf
# Contains:
# - List of all backups created
# - Restore test results
# - Data integrity checks
# - Chain of custody log

# STEP 2: EXPORT SPECIFIC DATA (5 min)
psql $DATABASE_URL -c "
  COPY (SELECT * FROM unified_documents 
        WHERE company_id = 'company-xyz' 
        ORDER BY created_at DESC)
  TO STDOUT WITH CSV HEADER;" > company-xyz-documents.csv

# STEP 3: PROVIDE AUDIT EVIDENCE (2 min)
# Email to audit team:
# - audit-report-2026-06-07.pdf
# - company-xyz-documents.csv
# - List of backup locations (S3 URLs)
# - Encryption certificates
# - Third-party attestation (if available)

# STEP 4: SIGN OFF (1 min)
# Print & sign:
# "I verify that backup procedures meet SOC 2 requirements"
# Signature: _____________
# Date: 2026-06-07

# ✅ AUDIT COMPLETE
```

---

## Post-Recovery Checklist

**Every recovery must include this:**

```markdown
## Incident #[ISSUE_ID] - Post-Recovery Checklist

### Immediate (Within 1 hour)
- [ ] All systems restored and tested
- [ ] Service status page updated
- [ ] Team notified in #incidents
- [ ] Root cause identified
- [ ] No data loss confirmed

### Short-term (Within 24 hours)
- [ ] Post-mortem scheduled (within 48 hours)
- [ ] Customer-facing communication sent (if public issue)
- [ ] Documentation updated
- [ ] Preventative measures identified

### Medium-term (Within 1 week)
- [ ] Post-mortem completed
- [ ] Action items assigned with due dates
- [ ] Preventative code changes merged
- [ ] Team training scheduled

### Long-term (Within 1 month)
- [ ] All action items completed
- [ ] Incident marked "closed"
- [ ] Lessons learned documented in runbook
- [ ] Next drill scheduled
```

---

## Testing Schedule

Print this and tape to your desk:

| Date | Scenario | Lead | Status |
|------|----------|------|--------|
| Jun 7 | PITR Test | [Name] | TBD |
| Jun 14 | Rollback Test | [Name] | TBD |
| Jun 21 | S3 Recovery Test | [Name] | TBD |
| Jun 28 | Connection Pool Test | [Name] | TBD |
| Jul 5 | Full Failover Test | [Name] | TBD |

---

## Contact Information (ENCRYPTED)

Store in password manager (not in version control):

```
Neon Support: https://support.neon.tech
  Account: [USERNAME]
  API Key: [ENCRYPTED]

AWS Console: https://console.aws.amazon.com
  Account: [ACCOUNT_ID]
  Access Key: [ENCRYPTED]

Vercel: https://vercel.com
  Account: [USERNAME]
  Token: [ENCRYPTED]
```

---

**Last Updated**: 2026-06-07  
**Next Review**: 2026-12-07  
**Test History**: [See separate test log]

