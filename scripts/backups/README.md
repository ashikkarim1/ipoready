# IPOReady Backup & Disaster Recovery Scripts

Complete runbook scripts for backup verification, restoration, and disaster recovery testing.

## Quick Reference

| Script | Purpose | Schedule | RTO |
|--------|---------|----------|-----|
| `verify-db-backups.sh` | Daily backup health check | Daily at 08:00 UTC | - |
| `monthly-restore-drill.sh` | Test restore procedures | 1st Friday of month 14:00 UTC | 2h |
| `restore-point-in-time.sh` | Emergency PITR recovery | On-demand | 30m |
| `restore-from-full-backup.sh` | Full backup restore | On-demand | 2h |
| `redeploy-application.sh` | Redeploy from code backup | On-demand | 15m |

---

## Setup & Prerequisites

### Environment Variables Required

```bash
# Essential
export NEON_API_KEY="<your-neon-api-key>"
export NEON_PROJECT_ID="<your-neon-project-id>"
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Optional (for S3 operations)
export AWS_ACCESS_KEY_ID="<your-aws-key>"
export AWS_SECRET_ACCESS_KEY="<your-aws-secret>"
export AWS_REGION="us-east-1"
```

### Required Tools

```bash
# Check prerequisites
command -v curl || echo "curl required"
command -v jq || echo "jq required"
command -v psql || echo "psql required"
command -v aws || echo "aws cli optional (for S3 checks)"
```

### Install

```bash
# Make scripts executable
chmod +x /path/to/scripts/backups/*.sh

# Optional: Add to system PATH
sudo cp scripts/backups/*.sh /usr/local/bin/
```

---

## Script Details

### 1. verify-db-backups.sh

**Purpose:** Daily automated verification that backups meet SLA

**Schedule:** 08:00 UTC daily (via CloudWatch Events)

**Usage:**
```bash
./verify-db-backups.sh
```

**Checks Performed:**
- ✅ Latest backup status = "completed"
- ✅ Backup age < 24 hours
- ✅ Backup size > 100 MB
- ✅ WAL archive has > 100 files
- ✅ S3 replication enabled
- ✅ Database connectivity OK

**Output:**
```
🔍 IPOReady Daily Backup Verification
Timestamp: 2026-06-07 08:00:00 UTC
========================================

1️⃣ Checking daily full backup...
   Status: COMPLETED
   ✓ Backup status: COMPLETED

2️⃣ Checking backup age...
   Age: 6h
   ✓ Backup age within SLA (< 24h)

✅ All backup verification checks PASSED
Next check: 2026-06-08 08:00 UTC
```

**Logging:** `/var/log/ipoready/backup-verification-YYYY-MM-DD.log`

**Alerting:**
- Fails if backup > 24 hours old
- Fails if database unreachable
- Email report on failure

---

### 2. monthly-restore-drill.sh

**Purpose:** Test that database restores work correctly

**Schedule:** 1st Friday of every month at 14:00 UTC

**Duration:** ~2 hours

**Usage:**
```bash
./monthly-restore-drill.sh
```

**Procedure:**
1. Create test branch from 3 days ago
2. Wait for branch to be ready
3. Run 5 validation tests
4. Clean up test branch
5. Send report email

**Validation Tests:**
- Table count > 20 ✓
- User count > 0 ✓
- Zero duplication check ✓
- Audit logs intact ✓
- Payment records present ✓

**Output:**
```
📊 Drill Results:
   Tests Passed: 5/5
   Tests Failed: 0/5

✅ Monthly restore drill SUCCESSFUL
```

**Report:** Sent to `ops@ipoready.com` automatically

**Success Criteria:**
- All 5 tests pass
- No data corruption detected
- Script completes in < 2 hours

---

### 3. restore-point-in-time.sh (EMERGENCY)

**Purpose:** Recover database to a specific point in time

**Scenario:** Accidental deletion, data corruption detected

**Usage:**
```bash
./restore-point-in-time.sh "2026-06-07 14:30:00"
```

**Interactive Workflow:**

**Step 1-2:** Create read-only test branch
```
✓ Test branch created: restore-pitr-1717769400
✓ Branch ready
```

**Step 3-4:** Connect & validate
```
✓ Connected to test branch
✓ Data validation complete
```

**Step 5:** Review data & decide
```
Review the data above. Does it look correct?

Options:
  1) Promote this restore branch to PRODUCTION
  2) Discard this restore (DELETE test branch)
```

**Step 6:** If promoting, final confirmation required
```
Type 'PROMOTE' to confirm: PROMOTE
✓ Pre-restore backup saved: pre-restore-2026-06-07-143000.sql.gz
✓ Branch promoted to production

✅ PITR COMPLETE
```

**RTO:** 30-45 minutes (from decision to live)

**Risk:** ZERO (tested on read-only branch first)

**Post-Recovery Checklist:**
- [ ] Verify app connectivity: `curl https://www.ipoready.ai/api/health`
- [ ] Run smoke tests
- [ ] Monitor error rates for 30 minutes
- [ ] Verify zero duplication
- [ ] Notify stakeholders

---

### 4. restore-from-full-backup.sh (EMERGENCY)

**Purpose:** Restore from full backup (catastrophic failure scenario)

**Scenario:** Ransomware, total corruption, major production bug

**Usage:**
```bash
# List available backups
./restore-from-full-backup.sh

# Restore from specific backup
./restore-from-full-backup.sh "neon-backup-20260607-020000"
```

**Procedure:**
1. List available backups
2. Create restore branch from selected backup
3. Wait for restore (5-10 minutes for large DB)
4. Run comprehensive validation
5. Promote to production (requires approval)

**RTO:** 1-2 hours

**Approval Required:** CTO + Ops Lead sign-off

---

### 5. redeploy-application.sh (EMERGENCY)

**Purpose:** Redeploy application from code backup

**Scenario:** Critical bug, deployment failure, code corruption

**Usage:**
```bash
# Redeploy current main branch
./redeploy-application.sh

# Redeploy specific commit
./redeploy-application.sh abc123def456
```

**RTO:** 15 minutes

**Owner:** DevOps team (can execute autonomously)

---

## Scheduling

### CloudWatch Events Setup

#### Daily Backup Verification (08:00 UTC)

```bash
aws events put-rule \
  --name ipoready-backup-verification \
  --schedule-expression 'cron(0 8 * * ? *)' \
  --state ENABLED

aws events put-targets \
  --rule ipoready-backup-verification \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:verify-backups"
```

#### Monthly Restore Drill (1st Friday 14:00 UTC)

```bash
# Using cron: First Friday of month at 14:00 UTC
aws events put-rule \
  --name ipoready-monthly-restore-drill \
  --schedule-expression 'cron(0 14 ? * FRI#1 *)' \
  --state ENABLED

aws events put-targets \
  --rule ipoready-monthly-restore-drill \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:monthly-drill"
```

---

## Error Handling

### Common Issues

**"NEON_API_KEY and NEON_PROJECT_ID required"**
```bash
# Solution: Set environment variables
export NEON_API_KEY="your-key"
export NEON_PROJECT_ID="your-project-id"
```

**"Database connection failed"**
```bash
# Verify DATABASE_URL is correct
psql "$DATABASE_URL" -c "SELECT NOW();"

# Check network connectivity
curl -s https://console.neon.tech/api/v1/projects | head -20
```

**"Branch never became available"**
```bash
# Neon API timeout. Try again or contact Neon support.
# Usually resolves within 5-10 minutes.
```

**"Backup age EXCEEDS 24-hour SLA"**
```bash
# Critical issue! Escalate immediately:
# 1. Check Neon console for backup errors
# 2. Verify cron job is running
# 3. Contact Neon support if backups are failing
```

---

## Troubleshooting

### Enable Debug Mode

```bash
# Add to scripts for verbose output
set -x  # Print each command
DEBUG=1
```

### Check Script Logs

```bash
# Verification logs
tail -f /var/log/ipoready/backup-verification-$(date +%Y-%m-%d).log

# Cron logs (macOS)
log stream --predicate 'process == "cron"' --level debug

# Cron logs (Linux)
sudo journalctl -u cron --follow
```

### Validate Neon API Access

```bash
# Test Neon API connectivity
curl -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v1/projects

# Should return JSON with your projects
```

### Validate Database Connectivity

```bash
# Test database connection
psql "$DATABASE_URL" -c "
  SELECT 
    version(),
    current_database(),
    current_user,
    NOW() as current_time;"
```

---

## Testing Locally

### Dry Run Mode

```bash
# Most scripts support dry-run (no actual changes)
DRYRUN=1 ./restore-point-in-time.sh "2026-06-07 14:30:00"
```

### Test on Non-Production First

```bash
# Create a test database copy in staging
# Run restore scripts against staging first
# Only promote to production after validation
```

---

## Monitoring & Alerts

### Slack Integration

To send alerts to Slack:

```bash
# Add to scripts:
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

send_slack_alert() {
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"$1\"}"
}

# Usage
send_slack_alert "✅ Backup verification passed"
```

### Email Reports

```bash
# Send report via email
cat $LOG_FILE | mail -s "IPOReady Backup Report" ops@ipoready.com
```

### Metrics Dashboard

View real-time metrics at: `internal.ipoready.com/monitoring/backups/`

---

## Security Considerations

### API Key Management

```bash
# Store API keys in secure location
# Option 1: AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id ipoready/neon/api-key \
  --query SecretString --output text

# Option 2: Environment variables (set in CI/CD, not committed)
# Option 3: IAM role permissions (preferred for Lambda)
```

### Database Access

```bash
# Use restricted database role for restores
# Limit to SELECT + minimal DDL operations
psql -U restore_role $DATABASE_URL
```

### Audit Logging

All restore operations are automatically logged:
```bash
# View audit logs
psql $DATABASE_URL -c "
  SELECT created_at, action, user_email, details
  FROM audit_logs
  WHERE action IN ('database_restore', 'branch_promotion')
  ORDER BY created_at DESC
  LIMIT 20;"
```

---

## Maintenance

### Monthly Tasks

- [ ] Review backup verification logs
- [ ] Verify all S3 backups are replicated
- [ ] Check CloudWatch alarms are functioning
- [ ] Update runbook docs if procedures changed

### Quarterly Tasks

- [ ] Execute full failover test (4-hour window)
- [ ] Review RTO/RPO targets vs. actual
- [ ] Update disaster recovery documentation
- [ ] Conduct team training/refresher

### Annual Tasks

- [ ] Comprehensive security audit
- [ ] Review backup costs
- [ ] Update compliance documentation
- [ ] Validate all procedures end-to-end

---

## Support & Escalation

### On-Call Engineer

During incidents, contact:
- **Slack:** #incident-response
- **Email:** ops-oncall@ipoready.com
- **Phone:** +1-XXX-XXX-XXXX

### Escalation Path

1. **Level 1 (15 min):** Ops engineer on-call
2. **Level 2 (30 min):** DevOps lead
3. **Level 3 (1 hour):** CTO
4. **Level 4 (2 hours):** CEO

### Getting Help

```bash
# Script help
./verify-db-backups.sh --help

# Detailed documentation
cat /path/to/backup.md

# Contact DevOps team
email: devops@ipoready.com
```

---

## Related Documentation

- [backup.md](../backup.md) — Full backup & disaster recovery strategy
- [INCIDENT_RESPONSE.md](../../INCIDENT_RESPONSE.md) — Incident response procedures
- [COMPLIANCE.md](../../COMPLIANCE_IMPLEMENTATION_SUMMARY.md) — Compliance requirements

---

**Last Updated:** June 7, 2026  
**Version:** 1.0  
**Owner:** DevOps Team  
**Emergency Contact:** devops@ipoready.com
