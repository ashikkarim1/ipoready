# IPOReady Backup & Disaster Recovery Strategy

**Version:** 1.0.0  
**RTO (Recovery Time Objective):** < 1 hour  
**RPO (Recovery Point Objective):** < 15 minutes

---

## Overview

This document defines how IPOReady backs up critical data and procedures for recovery in case of disaster.

**Critical Assets:**
- Production PostgreSQL database (Neon)
- User session data (Redis)
- Uploaded documents (cloud storage: Google Drive, Dropbox, OneDrive, Box)
- Environment configuration (Vercel secrets)
- Source code (GitHub)

---

## Database Backup Strategy

### Neon PostgreSQL

**Automatic Backups (Neon-managed):**
- Frequency: Every 6 hours
- Retention: 7 days
- Type: Full snapshots
- Storage: Neon manages redundancy

**Verification:**
```bash
# List available backups
neon branch list --project-id=$NEON_PROJECT_ID

# View branch backup history
neon branch show production --project-id=$NEON_PROJECT_ID
```

### Manual Backup (Daily)

**Daily Backup Procedure:**

```bash
#!/bin/bash
# backup-database.sh - Run daily at 02:00 UTC via cron

BACKUP_DATE=$(date +%Y-%m-%d-%H%M%S)
BACKUP_FILE="backup-${BACKUP_DATE}.sql.gz"

# Export from Neon
pg_dump "postgres://user:password@ep-xxx.us-east-1.neon.tech/ipoready" \
  | gzip > "/backups/neon/${BACKUP_FILE}"

# Verify backup
gunzip -t "/backups/neon/${BACKUP_FILE}" && echo "✅ Backup verified"

# Upload to S3 for long-term retention
aws s3 cp "/backups/neon/${BACKUP_FILE}" \
  s3://ipoready-backups/neon/ --storage-class GLACIER

# Cleanup local backups > 7 days old
find /backups/neon -name "backup-*.sql.gz" -mtime +7 -delete

# Log backup
echo "$(date) - Backup ${BACKUP_FILE} completed" >> /var/log/backups.log
```

**Cron Schedule:**
```bash
# Add to crontab -e
0 2 * * * /scripts/backup-database.sh
```

### Backup Verification (Weekly)

**Every Sunday at 03:00 UTC:**

```bash
#!/bin/bash
# verify-backup.sh - Verify backups are restorable

LATEST_BACKUP=$(ls -t /backups/neon/*.sql.gz | head -1)

# Create temporary test database
TEST_DB="ipoready_test_$(date +%s)"
createdb $TEST_DB

# Restore from backup
gunzip -c "$LATEST_BACKUP" | psql $TEST_DB

# Run verification queries
psql $TEST_DB -c "SELECT COUNT(*) FROM company;" > /tmp/verification.log
psql $TEST_DB -c "SELECT COUNT(*) FROM users;" >> /tmp/verification.log

# Check results
COMPANY_COUNT=$(psql $TEST_DB -t -c "SELECT COUNT(*) FROM company;")
if [ "$COMPANY_COUNT" -gt 0 ]; then
  echo "✅ Backup verification passed"
else
  echo "❌ BACKUP VERIFICATION FAILED"
  # Alert on-call
  curl -X POST https://hooks.slack.com/... -d "Backup verification failed"
fi

# Cleanup test database
dropdb $TEST_DB
```

---

## Document Backup Strategy

### Cloud Storage (Google Drive, Dropbox, OneDrive, Box)

**Current System:**
- Documents stored in cloud provider accounts (not local)
- Unified document system provides API layer
- Automatic versioning per cloud provider

**Backup:**
- Cloud providers handle their own backups
- IPOReady maintains references in PostgreSQL
- Document metadata (name, version, upload date) is backed up with DB

**Recovery:**
- If document lost, users can restore from cloud provider
- If DB metadata lost, rebuild from cloud storage API

### User-Uploaded Files Backup (Emergency)

If cloud providers fail, secondary backup:

```bash
#!/bin/bash
# backup-documents.sh

BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/documents/${BACKUP_DATE}"

mkdir -p "$BACKUP_DIR"

# Export document list from DB
psql production -c "
  SELECT id, name, cloud_storage_provider, external_id, upload_date 
  FROM unified_documents 
  ORDER BY upload_date DESC;
" > "${BACKUP_DIR}/documents-manifest.csv"

# Backup list to S3
aws s3 cp "$BACKUP_DIR" s3://ipoready-backups/documents/ --recursive

# Retention: Keep 30 days
find /backups/documents -type d -mtime +30 -exec rm -rf {} \;
```

---

## Session & Cache Backup

### Redis Session Data

**Current System:**
- Sessions stored in Redis (temporary)
- Next-auth.js manages session tokens
- Sessions expire after 30 days inactivity

**Backup Strategy:**
- Sessions are NOT backed up (temporary data)
- Users re-authenticate if Redis fails
- No data loss (they can log back in)

**Recovery:**
```bash
# If Redis crashes, just restart it
redis-cli SHUTDOWN SAVE
redis-server /etc/redis.conf
```

---

## Source Code Backup

**GitHub Backup:**
- All source code in GitHub repository
- Automatic backup by GitHub
- Accessible via git clone

**Local Mirror (Optional):**
```bash
#!/bin/bash
# mirror-github.sh - Daily backup of GitHub repo

git clone --mirror https://github.com/ipoready/ipoready.git \
  /backups/github/ipoready.git

# Verify
cd /backups/github/ipoready.git
git fsck --full --strict
```

---

## Configuration & Secrets Backup

### Environment Variables (Vercel)

**Current Storage:**
- Vercel environment variables
- Encrypted in Vercel's vault
- Automatically replicated

**Backup:**
```bash
#!/bin/bash
# backup-env.sh - Export Vercel env vars

vercel env list production > /backups/env-$(date +%Y-%m-%d).txt
# Manual review required — don't commit to Git!
```

---

## Disaster Recovery Procedures

### Scenario 1: Database Complete Loss

**Recovery Steps:**
1. Identify latest clean backup
2. Create new Neon branch from backup
3. Run verification queries
4. Point application to new branch
5. Restore from backup file if needed:

```bash
# Restore from backup
psql "postgres://user:pass@new-ep-xxx.neon.tech/ipoready" < backup-2026-06-01.sql

# Verify restoration
psql "postgres://user:pass@new-ep-xxx.neon.tech/ipoready" \
  -c "SELECT COUNT(*) FROM company;"
```

**RTO:** < 30 minutes  
**Data Loss:** < 6 hours (since hourly backups)

---

### Scenario 2: Application Server Crash

**Recovery Steps:**
1. Identify cause of crash
2. Fix issue in code
3. Redeploy to Vercel

```bash
# Redeploy
git push origin main
# Vercel auto-deploys

# Or manual rollback if needed
vercel rollback
```

**RTO:** < 5 minutes  
**Data Loss:** None (data in DB is safe)

---

### Scenario 3: Cloud Storage Provider Outage

**Recovery Steps:**
1. If Google Drive down, try Dropbox/OneDrive
2. Check unified document system status
3. Use document manifest to identify missing files

```bash
# List all documents
psql production -c "
  SELECT id, name, cloud_storage_provider 
  FROM unified_documents 
  WHERE updated_at > now() - interval '1 hour'
  ORDER BY updated_at DESC;"
```

**RTO:** Depends on which provider  
**Data Loss:** Minimal (users have original files)

---

### Scenario 4: Security Breach or Data Corruption

**Immediate Steps:**
1. Isolate affected database
2. Create backup before doing anything
3. Notify security team

```bash
# DO NOT MODIFY DATA YET
# Just backup first
pg_dump production | gzip > emergency-backup-$(date +%s).sql.gz

# Investigate
SELECT * FROM audit_trail WHERE action = 'corrupted_data';
```

4. Restore from last known-good backup
5. Review change logs for what was lost
6. Re-apply legitimate changes since backup

---

## Backup Testing Schedule

| Frequency | Test | Duration |
|-----------|------|----------|
| Weekly | Full DB restoration | 30 min |
| Weekly | Backup integrity check | 15 min |
| Monthly | Multi-region failover test | 1 hour |
| Quarterly | Full disaster recovery simulation | 4 hours |

---

## Backup Storage Locations

| Asset | Primary | Secondary | Tertiary |
|-------|---------|-----------|----------|
| Database backups | Neon snapshots | S3 standard | S3 Glacier |
| Document manifest | PostgreSQL | S3 | Local backup |
| Environment vars | Vercel secrets | Encrypted file | N/A |
| Source code | GitHub | Local mirror | N/A |

---

## Disaster Recovery Contacts

**Database Administration:**
- On-Call DBA: @dba-oncall (Slack)
- Neon Support: https://neon.tech/support

**Cloud Providers:**
- Google Drive support
- Dropbox support  
- OneDrive support
- Box support

**Infrastructure:**
- Vercel support: https://vercel.com/support
- AWS support: https://console.aws.amazon.com/support

---

## Monitoring & Alerting

**Backup Monitoring:**

```bash
# Alert if backup is older than 24 hours
LATEST_BACKUP_AGE=$(find /backups/neon -name "backup-*.sql.gz" -mtime -1 | wc -l)
if [ "$LATEST_BACKUP_AGE" -eq 0 ]; then
  # Alert!
  curl -X POST https://hooks.slack.com/... \
    -d "🚨 BACKUP FAILED: No backup in last 24 hours"
fi
```

**Datadog Monitoring:**
- Database replication lag
- Backup success/failure rate
- Storage capacity
- Restore test results

---

## Checklist for Production Launch

- [ ] Neon automatic backups configured
- [ ] Daily backup script deployed
- [ ] Weekly verification script running
- [ ] Backup S3 bucket created with GLACIER transition
- [ ] Restore procedure tested successfully
- [ ] On-call rotation understands recovery procedures
- [ ] Disaster recovery plan documented (this doc)
- [ ] Backup monitoring alerts configured
- [ ] Quarterly DR drill scheduled
- [ ] Cross-training: 2+ people know procedures

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-07 | Initial version |
