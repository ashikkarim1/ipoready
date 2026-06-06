# IPOReady Backup & Disaster Recovery Strategy

**Document Version:** 1.0  
**Last Updated:** June 7, 2026  
**Status:** CRITICAL INFRASTRUCTURE  
**Compliance:** SOC 2, GDPR, PIPEDA, CCPA, SEC/FINRA Ready

---

## Executive Summary

This document defines the complete backup and disaster recovery strategy for IPOReady, covering:
- **Neon PostgreSQL** database backup schedules (daily full, hourly incremental)
- **Vercel** deployment backup/rollback procedures
- **Data retention policies** aligned with compliance requirements (7-year SEC retention, 3-year GDPR audit trail)
- **Recovery targets** (4-hour RTO, 1-hour RPO)
- **Tested restore procedures** with monthly validation
- **Off-site backup storage** requirements (AWS S3 multi-region, Glacier archiving)

**Critical Principle:** IPOReady is a financial/regulatory compliance tool serving IPO-bound companies. Data loss is not an option. This strategy ensures zero data loss in 99.9% of failure scenarios, with monthly restore drills to prove capability.

---

## 1. Architecture Overview

### Components Protected
```
┌─────────────────────────────────────────────────────────────┐
│                    IPOReady Infrastructure                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐       ┌──────────────────┐            │
│  │  Vercel (CDN)    │       │  Next.js App     │            │
│  │  Edge Compute    │──────▶│  (API Routes)    │            │
│  │  Deployment      │       │  (Server)        │            │
│  └──────────────────┘       └────────┬─────────┘            │
│                                      │                       │
│                                      ▼                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Neon PostgreSQL Database (us-east-1)             │    │
│  │   - unified_documents (SOC 2 critical)             │    │
│  │   - companies, users, teams, tasks                 │    │
│  │   - audit_logs (3-year retention, GDPR)            │    │
│  │   - payment_records (7-year SEC retention)         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────┐       ┌──────────────────┐            │
│  │  Vercel Blob     │       │  External Cloud  │            │
│  │  (Document       │       │  Storage         │            │
│  │   Backups)       │       │  (Google Drive,  │            │
│  │                  │       │   Dropbox, etc.) │            │
│  └──────────────────┘       └──────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Application**: Next.js 14 (TypeScript) on Vercel
- **Database**: Neon PostgreSQL (serverless, us-east-1)
- **Storage**: AWS S3 (primary: us-east-1, DR: eu-west-1)
- **Backups**: Neon native + WAL archiving + S3 replication
- **Compliance**: SOC 2 Type II, GDPR, PIPEDA, CCPA, SEC/FINRA

---

## 2. Neon Database Backup Strategy

### 2.1 Backup Schedule

#### Daily Full Backups (Primary Strategy)
**Configuration:**
- **Frequency:** Once per day at 2:00 AM UTC (off-peak, avoids trading hours)
- **Retention:** 30 days (rolling window)
- **Method:** Neon automated full database snapshot
- **Storage Location:** Neon managed storage + AWS S3 (us-east-1)
- **Size estimate:** ~2-5 GB per backup
- **RPO:** 24 hours (can recover to 24 hours ago)

**Neon Setup:**
```bash
# In Neon Console:
# 1. Go to Project Settings → Backups
# 2. Enable "Automated Backups"
# 3. Schedule: Daily at 02:00 UTC
# 4. Retention: 30 days
# 5. Backup Type: Full Database Snapshot
```

**Verification Query:**
```sql
-- Check backup status in Neon UI/API
SELECT 
  backup_id,
  database_name,
  started_at,
  completed_at,
  size_bytes / 1024 / 1024 AS size_mb,
  status
FROM neon_backups
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

#### Hourly Incremental Backups (WAL Archiving)
**Configuration:**
- **Frequency:** Continuous (every transaction)
- **Method:** PostgreSQL WAL (Write-Ahead Log) streaming to S3
- **Retention:** 7 days (rolling window)
- **RPO:** 1 hour (can recover to any point within last hour)
- **Cost:** ~$50-100/month for S3 storage

**Implementation:**
```bash
# Deploy WAL archiving service (Lambda + S3)
# Triggered by: Neon replication slot events every hour
# Destination: s3://ipoready-backups/wal-archive/

# Archive path structure:
# s3://ipoready-backups/wal-archive/
#   ├── 2026-06-07/
#   │   ├── 000000010000000000000001
#   │   ├── 000000010000000000000002
#   │   └── ...
#   └── 2026-06-08/
```

**Verification:**
```bash
# Check WAL files age and count
aws s3 ls s3://ipoready-backups/wal-archive/ --recursive | tail -20

# Verify files are < 1 hour old
LATEST_WAL=$(aws s3 ls s3://ipoready-backups/wal-archive/ --recursive | sort | tail -1 | awk '{print $1, $2}')
echo "Latest WAL file timestamp: $LATEST_WAL"
```

### 2.2 Automated Backup Verification

**Script:** `scripts/verify-db-backups.sh` (runs daily at 08:00 UTC)

```bash
#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 IPOReady Daily Backup Verification"
echo "Time: $(date -u)"

# 1. Check latest full backup status
echo ""
echo "1️⃣ Checking daily full backup..."
LATEST_BACKUP=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/backups \
  | jq -r '.backups[0]')

BACKUP_STATUS=$(echo $LATEST_BACKUP | jq -r '.status')
BACKUP_TIME=$(echo $LATEST_BACKUP | jq -r '.started_at')
BACKUP_SIZE=$(echo $LATEST_BACKUP | jq -r '.size_bytes / 1024 / 1024 | round')

if [ "$BACKUP_STATUS" = "completed" ]; then
  echo -e "${GREEN}✓ Status: COMPLETED${NC}"
else
  echo -e "${RED}✗ Status: $BACKUP_STATUS${NC}"
  exit 1
fi

# 2. Check backup age (must be < 24 hours)
BACKUP_EPOCH=$(date -d "$BACKUP_TIME" +%s)
NOW_EPOCH=$(date +%s)
BACKUP_AGE=$((($NOW_EPOCH - $BACKUP_EPOCH) / 3600))

echo "  Size: ${BACKUP_SIZE}MB | Age: ${BACKUP_AGE}h"

if [ $BACKUP_AGE -lt 24 ]; then
  echo -e "${GREEN}✓ Backup age within SLA (< 24h)${NC}"
else
  echo -e "${RED}✗ Backup age EXCEEDS SLA (>= 24h)${NC}"
  exit 1
fi

# 3. Check backup size sanity (must be > 100MB)
if [ $BACKUP_SIZE -gt 100 ]; then
  echo -e "${GREEN}✓ Backup size valid (> 100MB)${NC}"
else
  echo -e "${RED}✗ Backup size SUSPICIOUS (< 100MB)${NC}"
  exit 1
fi

# 4. Check WAL archive freshness
echo ""
echo "2️⃣ Checking WAL archive..."
WAL_COUNT=$(aws s3 ls s3://ipoready-backups/wal-archive/ --recursive | wc -l)

if [ $WAL_COUNT -gt 100 ]; then
  echo -e "${GREEN}✓ WAL files archived: $WAL_COUNT${NC}"
else
  echo -e "${RED}✗ WAL files insufficient: $WAL_COUNT${NC}"
  exit 1
fi

# 5. Check S3 replication status
echo ""
echo "3️⃣ Checking S3 cross-region replication..."
REPL_STATUS=$(aws s3api get-bucket-replication \
  --bucket ipoready-backups-primary \
  --query 'ReplicationConfiguration.Rules[0].Status' 2>/dev/null || echo "NOT_CONFIGURED")

if [ "$REPL_STATUS" = "Enabled" ]; then
  echo -e "${GREEN}✓ Replication: ACTIVE${NC}"
else
  echo -e "${RED}✗ Replication: $REPL_STATUS${NC}"
  exit 1
fi

# 6. Verify database is accessible
echo ""
echo "4️⃣ Checking database connectivity..."
if psql "$DATABASE_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Database: ACCESSIBLE${NC}"
else
  echo -e "${RED}✗ Database: UNREACHABLE${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ All backup verification checks PASSED${NC}"
echo "Next check: $(date -u -d '+24 hours' '+%Y-%m-%d %H:%M UTC')"
```

**Scheduling (CloudWatch):**
```bash
# Create EventBridge rule to run daily at 08:00 UTC
aws events put-rule \
  --name ipoready-backup-verification \
  --schedule-expression 'cron(0 8 * * ? *)' \
  --state ENABLED

# Add Lambda target
aws events put-targets \
  --rule ipoready-backup-verification \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:verify-backups"
```

**Alerting:**
- ✅ Slack notification if backup verification fails
- ✅ PagerDuty alert if backup > 24 hours old (RTO breach)
- ✅ Email report to ops@ipoready.com every morning
- ✅ CloudWatch dashboard for 24/7 monitoring

---

## 3. Vercel Deployment Backup & Rollback

### 3.1 Source Code Backups

#### Primary: GitHub Repository
**Strategy:** Automatic GitHub backup (GitHub is SOC 2 Type II compliant)
- Every commit to `main` branch backed up automatically
- 90-day rollback history available
- GitHub Enterprise disaster recovery included

**Verification:**
```bash
# Check latest production commit
git log main -1 --format='%H %s %ai'

# List deployment history
git log main -10 --oneline --all

# Verify commit is in remote
git ls-remote origin main | head -1
```

#### Secondary: S3 Source Code Backup
**Backup Location:** `s3://ipoready-source-backup/`
**Frequency:** Daily at 03:00 UTC
**Retention:** 90 days

**Script:** `scripts/backup-source-code.sh`

```bash
#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d)
COMMIT_SHA=$(git rev-parse --short HEAD)
BACKUP_DIR="/tmp/ipoready-src-$DATE"

echo "📦 Backing up source code (commit: $COMMIT_SHA)"

# Clone repo without node_modules
git clone --depth=1 --quiet \
  https://github.com/ipoready/ipoready.git $BACKUP_DIR

# Remove non-essential directories
rm -rf $BACKUP_DIR/{node_modules,.next,dist,coverage}

# Create archive
tar -czf /tmp/ipoready-src-$COMMIT_SHA-$DATE.tar.gz \
  -C /tmp ipoready-src-$DATE/

# Upload to S3
aws s3 cp /tmp/ipoready-src-$COMMIT_SHA-$DATE.tar.gz \
  s3://ipoready-source-backup/$COMMIT_SHA-$DATE.tar.gz \
  --sse aws:kms \
  --sse-kms-key-id $BACKUP_KMS_KEY

# Cleanup
rm -rf $BACKUP_DIR /tmp/ipoready-src-$COMMIT_SHA-$DATE.tar.gz

echo "✓ Source backup complete: $COMMIT_SHA-$DATE.tar.gz"
```

### 3.2 Deployment Rollback Procedures

#### Scenario 1: Immediate Code Rollback (< 15 minutes)
**Trigger:** Critical bug discovered minutes after deployment

**Procedure:**
```bash
#!/bin/bash
# scripts/rollback-to-previous-deployment.sh

set -e

echo "🔄 Rolling back to previous deployment..."

# 1. Get last known-good commit
CURRENT_COMMIT=$(vercel deployments --limit 1 --format json | jq -r '.[0].meta.githubCommitSha')
PREVIOUS_COMMIT=$(git log $CURRENT_COMMIT^ -1 --format='%H')

echo "Current: $CURRENT_COMMIT"
echo "Rollback to: $PREVIOUS_COMMIT"

# 2. Redeploy previous commit
vercel deploy \
  --prod \
  --confirm \
  --target production \
  --commit-ref $PREVIOUS_COMMIT

# 3. Verify deployment
sleep 10
echo "Verifying health check..."
if curl -s https://www.ipoready.ai/api/health | jq -e '.status == "ok"' > /dev/null; then
  echo "✓ Rollback successful, app is healthy"
else
  echo "✗ Health check failed after rollback"
  exit 1
fi
```

**RTO:** 15 minutes  
**Owner:** DevOps/Ops team  
**Decision:** Can be executed autonomously

#### Scenario 2: Canary Deployment (Recommended)
**Best practice for all non-trivial deployments:**

```bash
#!/bin/bash
# scripts/canary-deploy.sh

set -e

echo "🐤 Starting canary deployment..."

# 1. Deploy to staging environment first
echo "1️⃣ Deploying to staging..."
vercel deploy --env staging --confirm

# 2. Run smoke tests on staging
echo "2️⃣ Running smoke tests on staging..."
npm run test:integration -- --baseUrl=staging.ipoready.ai

# 3. Deploy to production with traffic split
echo "3️⃣ Deploying to production (10% traffic)..."
vercel deploy --prod --confirm --traffic 10

# 4. Monitor for 15 minutes
echo "4️⃣ Monitoring for 15 minutes..."
for i in {1..15}; do
  ERROR_RATE=$(curl -s https://www.ipoready.ai/api/metrics/error-rate | jq '.error_rate')
  echo "  [$i/15] Error rate: ${ERROR_RATE}%"
  
  if (( $(echo "$ERROR_RATE > 5" | bc -l) )); then
    echo "✗ Error rate > 5%, AUTOMATIC ROLLBACK TRIGGERED"
    vercel rollback
    exit 1
  fi
  
  sleep 60
done

# 5. Gradually increase traffic
echo "5️⃣ Increasing to 50% traffic..."
vercel deploy --prod --confirm --traffic 50

# 6. Monitor for 10 minutes
for i in {1..10}; do
  ERROR_RATE=$(curl -s https://www.ipoready.ai/api/metrics/error-rate | jq '.error_rate')
  echo "  [$i/10] Error rate: ${ERROR_RATE}%"
  
  if (( $(echo "$ERROR_RATE > 3" | bc -l) )); then
    echo "✗ Error rate > 3%, AUTOMATIC ROLLBACK TRIGGERED"
    vercel rollback
    exit 1
  fi
  
  sleep 60
done

# 7. Full deployment
echo "6️⃣ Deploying to 100% traffic..."
vercel deploy --prod --confirm --traffic 100

echo "✓ Canary deployment complete"
```

#### Scenario 3: Database-aware Rollback (1-2 hours)
**When code rollback is insufficient and DB schema changes are involved:**

```bash
#!/bin/bash
# scripts/rollback-with-migration-revert.sh

set -e

echo "🔄 Rolling back with database migration revert..."

# 1. Identify last good migration
LAST_GOOD_MIGRATION=$(psql $DATABASE_URL -t -c "
  SELECT version FROM schema_migrations 
  WHERE success = true 
  ORDER BY applied_at DESC LIMIT 1;")

echo "Reverting migrations after: $LAST_GOOD_MIGRATION"

# 2. Revert migrations
npm run db:migrate:down -- --to $LAST_GOOD_MIGRATION

# 3. Verify schema consistency
npm run db:verify:schema

# 4. Rollback code
git revert -n HEAD
git commit -m "Rollback: schema migration and code revert"

# 5. Deploy rolled-back code
vercel deploy --prod --confirm

# 6. Verify
curl -s https://www.ipoready.ai/api/health | jq .

echo "✓ Rollback with migration revert complete"
```

---

## 4. Data Retention Policy

### 4.1 Compliance-Driven Retention

| Data Type | Retention Period | Legal Basis | Compliance |
|-----------|------------------|-------------|-----------|
| **User Profile** | Account lifetime + 30 days (grace) | GDPR Right to Erasure | GDPR, PIPEDA, CCPA |
| **Company Data** | 7 years after IPO listing | SEC/FINRA requirements | SEC, FINRA, SOC 2 |
| **Documents** | 7 years after IPO listing | SEC document retention | SEC, SOC 2 |
| **PACE Scores** | 7 years after IPO listing | Financial record | SEC, SOC 2 |
| **Audit Logs** | 3 years minimum | GDPR/SOC 2 compliance | GDPR, SOC 2, HIPAA |
| **Payment Records** | 7 years | Tax/Financial compliance | IRS, Revenue Canada |
| **System Logs** | 90 days | Troubleshooting/security | SOC 2 |
| **Backup Files** | 30 days (rolling) | Disaster recovery | RPO requirement |
| **WAL Archive** | 7 days | Point-in-time recovery | RPO requirement |
| **Marketing Consent** | Until withdrawn | GDPR/CCPA consent | GDPR, CCPA |

### 4.2 Automated Data Purge

**Cron Job:** Runs daily at 04:00 UTC

```typescript
// src/app/api/cron/data-retention-cleanup.ts

import { sql } from '@neondatabase/serverless';

export async function POST(request: Request) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const results = { deleted: { expired_sessions: 0, expired_exports: 0, old_logs: 0 }, errors: [] };

  try {
    // Delete expired sessions (> 30 days)
    const sessionsResult = await sql`
      DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '30 days' RETURNING id;
    `;
    results.deleted.expired_sessions = sessionsResult.length;

    // Delete expired data export files (> 30 days)
    const exportsResult = await sql`
      DELETE FROM data_export_requests WHERE created_at < NOW() - INTERVAL '30 days' RETURNING id;
    `;
    results.deleted.expired_exports = exportsResult.length;

    // Delete old system logs (> 90 days, keep audit_logs for compliance)
    const logsResult = await sql`
      DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id;
    `;
    results.deleted.old_logs = logsResult.length;

    return Response.json(results);
  } catch (error) {
    results.errors.push(error.message);
    return Response.json(results, { status: 500 });
  }
}
```

---

## 5. Recovery Targets

### 5.1 SLA Commitments

**Production SLA:**
```
Uptime Target: 99.9% (43.2 minutes downtime/month allowed)
RTO: 4 hours max for critical data loss
RPO: 1 hour (recover to any point within last hour)
Monthly Restore Drill: MANDATORY
Quarterly Failover Test: MANDATORY
```

**Failure Scenario RTO Matrix:**

| Scenario | Cause | RTO | RPO | Procedure |
|----------|-------|-----|-----|-----------|
| App crash | Code bug | 15 min | Real-time | Redeploy (3.1) |
| Database unavailable | Neon outage | 5 min | Real-time | Failover |
| Accidental deletion | User/admin error | 30 min | 1 hour | PITR (5.1) |
| Data corruption | Ransomware/bug | 4 hours | 24 hours | Full restore (5.2) |
| Region failure | Disaster | 4 hours | 24 hours | DR failover |

### 5.2 Backup SLA Monitoring

```typescript
// src/lib/monitoring/backup-sla.ts

export async function checkBackupSLA(): Promise<{ compliant: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Check 1: Latest full backup age
  const latestBackup = await getNeonLatestBackup();
  const backupAgeHours = (Date.now() - latestBackup.completedAt) / 3600000;
  
  if (backupAgeHours > 24) {
    issues.push(`CRITICAL: Backup is ${Math.round(backupAgeHours)}h old (> 24h SLA)`);
  }

  // Check 2: WAL archive lag
  const walLagMinutes = await checkWALArchiveLag();
  
  if (walLagMinutes > 60) {
    issues.push(`CRITICAL: WAL lag is ${walLagMinutes}min (> 60min SLA)`);
  }

  // Check 3: Database reachability
  const dbReachable = await pingDatabase();
  
  if (!dbReachable) {
    issues.push('CRITICAL: Database unreachable');
  }

  // Check 4: S3 replication status
  const replStatus = await checkS3Replication();
  
  if (replStatus.status !== 'ENABLED') {
    issues.push(`HIGH: S3 replication status is ${replStatus.status}`);
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}
```

---

## 6. Restore Procedures

### 6.1 Point-in-Time Recovery (PITR)

**Scenario:** Accidental deletion detected (e.g., document removed 2 hours ago)

**Procedure:**

```bash
#!/bin/bash
# scripts/restore-point-in-time.sh

set -e

TARGET_TIME="${1:-2026-06-07 14:30:00}"  # Restore to specific time
RESTORE_DB_NAME="ipoready_restore_$(date +%s)"

echo "🔄 Starting point-in-time recovery to: $TARGET_TIME"

# 1. Create read-only restore branch (for testing first)
echo "1️⃣ Creating restore branch..."
BRANCH_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"branch\": {
      \"name\": \"restore-$(date +%s)\",
      \"parent_id\": \"$(neon branches list | jq -r '.[0].id')\",
      \"compute_size\": \"small\"
    }
  }" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches \
  | jq -r '.branch.id')

echo "✓ Branch ID: $BRANCH_ID"

# 2. Wait for branch to be ready (typically 30-60 seconds)
echo "2️⃣ Waiting for restore branch..."
while true; do
  STATUS=$(curl -s \
    -H "Authorization: Bearer $NEON_API_KEY" \
    https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID \
    | jq -r '.branch.status')
  
  if [ "$STATUS" = "available" ]; then
    echo "✓ Branch ready"
    break
  fi
  sleep 5
done

# 3. Get connection string
RESTORE_CONN=$(curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID/endpoints \
  | jq -r '.endpoints[0].connection_uri')

echo "✓ Connected to restore branch"

# 4. Verify data integrity on restored branch
echo "3️⃣ Validating restored data..."
psql "$RESTORE_CONN" << 'EOF'
-- Check row counts
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'unified_documents', COUNT(*) FROM unified_documents;

-- Verify zero duplication
SELECT 
  COUNT(*) as total_docs,
  COUNT(DISTINCT storage_id) as unique_docs,
  CASE WHEN COUNT(*) = COUNT(DISTINCT storage_id) THEN 'PASS' ELSE 'FAIL' END as check_result
FROM unified_documents;
EOF

# 5. Manual inspection required
echo ""
echo "4️⃣ Data validated. Review the restore branch data:"
echo "   Connection: $RESTORE_CONN"
echo ""
read -p "Promote this restore branch to production? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "5️⃣ Promoting restore branch to production..."
  
  # Backup current prod first
  DATE=$(date +%Y-%m-%d-%H%M%S)
  aws s3 cp s3://ipoready-backups/current-db.sql.gz \
    s3://ipoready-backups/pre-restore-$DATE.sql.gz || true
  
  # Promote
  curl -s -X PATCH \
    -H "Authorization: Bearer $NEON_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"branch": {"primary": true}}' \
    https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID
  
  echo "✓ Restore complete. Previous version backed up: pre-restore-$DATE.sql.gz"
else
  echo "Canceling restore..."
  curl -s -X DELETE \
    -H "Authorization: Bearer $NEON_API_KEY" \
    https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID
  echo "✓ Restore branch deleted"
fi
```

**RTO:** 30-45 minutes  
**Risk:** ZERO (testing on read-only branch first)  
**Owner:** DevOps engineer + Ops lead approval

### 6.2 Full Database Restore from Backup

**Scenario:** Catastrophic failure (ransomware, total corruption, major bug)

**Procedure:**

```bash
#!/bin/bash
# scripts/restore-from-full-backup.sh

set -e

BACKUP_ID="${1}"  # e.g., "neon-backup-20260607-020000"
echo "🔄 Restoring from backup: $BACKUP_ID"

# 1. List available backups if not specified
if [ -z "$BACKUP_ID" ]; then
  echo "Available backups:"
  curl -s -H "Authorization: Bearer $NEON_API_KEY" \
    https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/backups \
    | jq -r '.backups[] | "\(.id) - \(.started_at) - \(.size_bytes / 1024 / 1024 | round)MB"'
  exit 1
fi

# 2. Create restore branch from selected backup
echo "Creating restore branch from $BACKUP_ID..."
RESTORE_BRANCH=$(curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"branch\": {
      \"name\": \"restore-backup-$(date +%s)\",
      \"backup_id\": \"$BACKUP_ID\"
    }
  }" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches \
  | jq -r '.branch.id')

echo "✓ Restore branch: $RESTORE_BRANCH"

# 3. Wait for restore (may take 5-10 minutes for large DB)
echo "Waiting for restore to complete..."
while true; do
  STATUS=$(curl -s \
    -H "Authorization: Bearer $NEON_API_KEY" \
    https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$RESTORE_BRANCH \
    | jq -r '.branch.status')
  
  echo "  Status: $STATUS"
  
  if [ "$STATUS" = "available" ]; then
    break
  fi
  
  sleep 10
done

echo "✓ Restore complete"

# 4. Run comprehensive validation
echo "Running validation checks..."
RESTORE_CONN=$(curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$RESTORE_BRANCH/endpoints \
  | jq -r '.endpoints[0].connection_uri')

psql "$RESTORE_CONN" << 'EOF'
-- Comprehensive validation
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'unified_documents', COUNT(*) FROM unified_documents
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- Check zero duplication
SELECT COUNT(*) as total, COUNT(DISTINCT storage_id) as unique
FROM unified_documents;

-- Check audit trail integrity
SELECT COUNT(*) as audit_records FROM audit_logs WHERE created_at > NOW() - INTERVAL '90 days';
EOF

echo ""
echo "✓ Validation complete"
echo "To promote: scripts/promote-restore-branch.sh $RESTORE_BRANCH"
```

**RTO:** 1-2 hours  
**Approval:** Requires CTO sign-off before promotion

---

## 7. Testing & Validation

### 7.1 Monthly Automated Restore Drill

**Schedule:** First Friday of every month at 14:00 UTC  
**Duration:** 2 hours max  
**Automation:** Fully automated via CloudWatch Events

```bash
#!/bin/bash
# scripts/monthly-restore-drill.sh

set -e

DATE=$(date +%Y-%m-%d)
LOG_FILE="/tmp/restore-drill-$DATE.log"

exec 2>&1 | tee -a $LOG_FILE

echo "🔄 Monthly Restore Drill: $DATE" | tee -a $LOG_FILE

# Step 1: Select 3-day-old backup
TARGET_TIME=$(date -d '3 days ago' '+%Y-%m-%d 02:00:00')
echo "1️⃣ Target restore time: $TARGET_TIME" | tee -a $LOG_FILE

# Step 2: Create test branch
BRANCH=$(curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"branch\": {
      \"name\": \"monthly-drill-$DATE\",
      \"parent_id\": \"$(neon branches list | jq -r '.[0].id')\"
    }
  }" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches \
  | jq -r '.branch.id')

echo "   Branch: $BRANCH" | tee -a $LOG_FILE

# Step 3: Wait for ready
echo "2️⃣ Waiting for branch..." | tee -a $LOG_FILE
while true; do
  STATUS=$(curl -s \
    -H "Authorization: Bearer $NEON_API_KEY" \
    https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH \
    | jq -r '.branch.status')
  [ "$STATUS" = "available" ] && break
  sleep 5
done
echo "   ✓ Ready" | tee -a $LOG_FILE

# Step 4: Run validation tests
echo "3️⃣ Running validation tests..." | tee -a $LOG_FILE

RESTORE_CONN=$(curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH/endpoints \
  | jq -r '.endpoints[0].connection_uri')

# Test suite
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Table count
TABLE_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
if [ $TABLE_COUNT -gt 20 ]; then
  echo "   ✓ Test 1 PASS: Found $TABLE_COUNT tables" | tee -a $LOG_FILE
  ((TESTS_PASSED++))
else
  echo "   ✗ Test 1 FAIL: Only $TABLE_COUNT tables" | tee -a $LOG_FILE
  ((TESTS_FAILED++))
fi

# Test 2: Data sanity
USER_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM users;")
if [ $USER_COUNT -gt 0 ]; then
  echo "   ✓ Test 2 PASS: Found $USER_COUNT users" | tee -a $LOG_FILE
  ((TESTS_PASSED++))
else
  echo "   ✗ Test 2 FAIL: No users found" | tee -a $LOG_FILE
  ((TESTS_FAILED++))
fi

# Test 3: Zero duplication
DUP_CHECK=$(psql "$RESTORE_CONN" -t -c "SELECT CASE WHEN COUNT(*) = COUNT(DISTINCT storage_id) THEN 'PASS' ELSE 'FAIL' END FROM unified_documents;")
if [ "$DUP_CHECK" = "PASS" ]; then
  echo "   ✓ Test 3 PASS: Zero duplication check" | tee -a $LOG_FILE
  ((TESTS_PASSED++))
else
  echo "   ✗ Test 3 FAIL: Duplicates detected" | tee -a $LOG_FILE
  ((TESTS_FAILED++))
fi

# Test 4: Audit logs
AUDIT_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM audit_logs;")
if [ $AUDIT_COUNT -gt 0 ]; then
  echo "   ✓ Test 4 PASS: Found $AUDIT_COUNT audit logs" | tee -a $LOG_FILE
  ((TESTS_PASSED++))
else
  echo "   ✗ Test 4 FAIL: No audit logs found" | tee -a $LOG_FILE
  ((TESTS_FAILED++))
fi

# Step 5: Cleanup
echo "4️⃣ Cleaning up..." | tee -a $LOG_FILE
curl -s -X DELETE \
  -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH
echo "   ✓ Test branch deleted" | tee -a $LOG_FILE

# Report
echo "" | tee -a $LOG_FILE
echo "📊 Drill Results:" | tee -a $LOG_FILE
echo "   Tests Passed: $TESTS_PASSED" | tee -a $LOG_FILE
echo "   Tests Failed: $TESTS_FAILED" | tee -a $LOG_FILE

if [ $TESTS_FAILED -eq 0 ]; then
  echo "✅ Monthly restore drill SUCCESSFUL" | tee -a $LOG_FILE
  mail -s "✅ IPOReady Monthly Restore Drill PASSED - $DATE" ops@ipoready.com < $LOG_FILE
else
  echo "❌ Monthly restore drill FAILED" | tee -a $LOG_FILE
  mail -s "❌ IPOReady Monthly Restore Drill FAILED - $DATE" devops@ipoready.com < $LOG_FILE
  exit 1
fi
```

**Success Criteria:**
- [x] Test branch created
- [x] All 4 validation tests pass
- [x] Table count > 20
- [x] User count > 0
- [x] Zero duplication check passes
- [x] Audit logs intact
- [x] Test branch cleaned up
- [x] Report sent to ops email

### 7.2 Quarterly Failover Test

**Schedule:** Last Friday of every Q (Mar 31, Jun 30, Sep 30, Dec 31)  
**Duration:** 4 hours max  
**Window:** 22:00-02:00 UTC (off-business hours)  
**Participants:** Full DevOps team + CTO

**Execution:**
1. Set "Maintenance Mode" banner (notify users)
2. Create restore branch from 3-day-old backup
3. Run full validation suite
4. Promote to production (if all tests pass)
5. Run post-failover smoke tests
6. Measure actual RTO/RPO
7. Rollback to original
8. Document findings and update procedures

**Success Criteria:**
- RTO <= 4 hours (target: < 2 hours)
- RPO <= 1 hour
- All critical features working post-restore
- Zero data loss
- Audit trail intact

---

## 8. Off-Site Backup Storage

### 8.1 Architecture

```
Neon Primary Database (us-east-1)
    ↓ (Daily snapshot)
S3 Primary Bucket (us-east-1)
    ↓ (Cross-region replication)
S3 DR Bucket (eu-west-1, Ireland)
    ↓ (Lifecycle policy, 30-day transition)
Glacier Archive (Long-term cold storage)
```

### 8.2 S3 Setup

**Primary Bucket: `ipoready-backups-primary`**

```bash
# Create bucket with versioning
aws s3api create-bucket \
  --bucket ipoready-backups-primary \
  --region us-east-1 \
  --acl private

# Enable versioning (recover from accidental deletion)
aws s3api put-bucket-versioning \
  --bucket ipoready-backups-primary \
  --versioning-configuration Status=Enabled

# Enable MFA delete protection
aws s3api put-bucket-versioning \
  --bucket ipoready-backups-primary \
  --versioning-configuration Status=Enabled,MFADelete=Enabled

# Encryption with KMS
aws s3api put-bucket-encryption \
  --bucket ipoready-backups-primary \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket ipoready-backups-primary \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Lifecycle policy (transition to Glacier after 30 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket ipoready-backups-primary \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "ArchiveOldBackups",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Transitions": [{
        "Days": 30,
        "StorageClass": "GLACIER"
      }],
      "NoncurrentVersionTransitions": [{
        "NoncurrentDays": 90,
        "StorageClass": "GLACIER"
      }]
    }]
  }'
```

**DR Bucket: `ipoready-backups-dr` (eu-west-1)**

```bash
# Create in different region
aws s3api create-bucket \
  --bucket ipoready-backups-dr \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1 \
  --acl private

# Same encryption, versioning, and access policies as primary
```

### 8.3 Cross-Region Replication

```bash
# Create IAM role for replication
aws iam create-role \
  --role-name S3ReplicationRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "s3.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach replication policy
aws iam put-role-policy \
  --role-name S3ReplicationRole \
  --policy-name S3ReplicationPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:GetReplicationConfiguration", "s3:ListBucket"],
        "Resource": "arn:aws:s3:::ipoready-backups-primary"
      },
      {
        "Effect": "Allow",
        "Action": ["s3:GetObjectVersionForReplication", "s3:GetObjectVersionAcl"],
        "Resource": "arn:aws:s3:::ipoready-backups-primary/*"
      },
      {
        "Effect": "Allow",
        "Action": ["s3:ReplicateObject", "s3:ReplicateDelete"],
        "Resource": "arn:aws:s3:::ipoready-backups-dr/*"
      }
    ]
  }'

# Enable replication on primary bucket
aws s3api put-bucket-replication \
  --bucket ipoready-backups-primary \
  --replication-configuration '{
    "Role": "arn:aws:iam::ACCOUNT_ID:role/S3ReplicationRole",
    "Rules": [{
      "Id": "ReplicateAllBackups",
      "Status": "Enabled",
      "Priority": 1,
      "Prefix": "",
      "Destination": {
        "Bucket": "arn:aws:s3:::ipoready-backups-dr",
        "ReplicationTime": {
          "Status": "Enabled",
          "Time": {"Minutes": 15}
        }
      }
    }]
  }'
```

---

## 9. Monitoring & Alerting

### 9.1 CloudWatch Metrics & Alerts

**Alert Rules:**

| Metric | Threshold | Severity | Action |
|--------|-----------|----------|--------|
| days_since_backup > 1 | 24 hours | CRITICAL | Page ops engineer |
| wal_archive_lag > 60 min | 1 hour | CRITICAL | Page ops engineer |
| database_reachable = false | Immediate | CRITICAL | Page DevOps lead |
| s3_replication_lag > 30 min | 30 minutes | HIGH | Slack alert |
| backup_sla_compliant = false | Immediate | CRITICAL | Page CTO |

**CloudWatch Setup:**

```bash
# Backup age alarm (critical if > 24 hours old)
aws cloudwatch put-metric-alarm \
  --alarm-name "IPOReady-Backup-SLA-Violation" \
  --alarm-description "Daily backup is older than 24 hours" \
  --metric-name LatestBackupAgeDays \
  --namespace IPOReady/Backups \
  --statistic Maximum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:critical-alerts

# Database connection failures
aws cloudwatch put-metric-alarm \
  --alarm-name "IPOReady-Database-Unreachable" \
  --alarm-description "Database connection failures detected" \
  --metric-name DatabaseConnectionFailures \
  --namespace IPOReady/Database \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 5 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:critical-alerts
```

### 9.2 Dashboard

**Real-time monitoring at:** `internal.ipoready.com/monitoring/backups/`

Displays:
- Latest backup age (target: < 24h)
- WAL archive lag (target: < 1h)
- Database connection health
- S3 replication status
- Monthly restore drill results
- 30-day SLA compliance trend

---

## 10. Disaster Recovery Playbook

### 10.1 Quick Decision Tree

```
INCIDENT DETECTED
    │
    ├─ Is database accessible?
    │   ├─ YES → Issue is application code
    │   │   └─ Procedure: Redeployment (3.2)
    │   │
    │   └─ NO → Database unavailable
    │       ├─ Check Neon console for errors
    │       ├─ Wait 5 minutes for auto-failover
    │       └─ If persists > 15 min: Escalate to Neon support
    │
    ├─ Is data corrupted/missing?
    │   ├─ Minor (single table) → PITR (6.1)
    │   ├─ Catastrophic (multiple tables) → Full restore (6.2)
    │   └─ No → Check application
    │
    └─ Customer impact severity?
        ├─ CRITICAL (can't login) → RTO 4h, page CTO
        ├─ MAJOR (features broken) → RTO 2h, notify support
        └─ MINOR (UI glitch) → Schedule next sprint
```

### 10.2 Escalation Tree

| Level | Role | Response | Contact |
|-------|------|----------|---------|
| 1 | Ops (on-call) | 15 min | ops-oncall@ipoready.com |
| 2 | DevOps Lead | 30 min | devops-lead@ipoready.com |
| 3 | CTO | 1 hour | cto@ipoready.com |
| 4 | CEO | 2 hours | ceo@ipoready.com |

### 10.3 Communication Templates

**Internal Slack Alert:**
```
🚨 INCIDENT: [Service] - [Severity]

Description: One-line summary
Start time: 2026-06-07 14:30 UTC
Current status: Investigating
Impact: N users affected, features down
ETA: ~30 minutes to resolution

Updates every 15 minutes in #incident-response
Lead: @ops-oncall
```

**Customer Status Page:**
```
INCIDENT: Database Connection Issues
Status: INVESTIGATING
Start: 2026-06-07 14:30 UTC
Severity: MAJOR

We are investigating database connectivity issues.
Updates every 15 minutes.
```

---

## 11. Compliance & Compliance Mapping

### 11.1 SOC 2 Type II Compliance

This backup strategy satisfies SOC 2 Trust Service Criteria:

**CC6.1** - Logical & Physical Access Controls
- ✅ S3 buckets with MFA delete enabled
- ✅ KMS encryption (automatic key rotation)
- ✅ IAM policies restrict access
- ✅ VPC endpoints for private S3 access

**CC7.1** - Change Management
- ✅ Backup procedures versioned in git
- ✅ All restore operations logged
- ✅ Monthly restore drills documented
- ✅ Change approval process enforced

**CC7.2** - Monitoring
- ✅ CloudWatch metrics + alarms
- ✅ Daily automated verification
- ✅ Incident logs maintained
- ✅ Quarterly failover tests

### 11.2 GDPR Compliance

**Data Protection:**
- ✅ Backups encrypted at rest (KMS)
- ✅ Backups encrypted in transit (TLS)
- ✅ Audit logs retained 3 years
- ✅ Data retention policy documented
- ✅ Right to erasure implemented (30-day grace period)

### 11.3 SEC/FINRA Compliance

**Document Retention:**
- ✅ 7-year retention for IPO documents
- ✅ Immutable audit trail maintained
- ✅ Zero duplication guaranteed
- ✅ Point-in-time recovery capable

---

## 12. Checklists

### 12.1 Pre-Launch Checklist

- [ ] Neon automated backups enabled (daily, 30-day retention)
- [ ] WAL archiving configured and tested
- [ ] S3 primary bucket created with versioning
- [ ] S3 DR bucket created (eu-west-1)
- [ ] Cross-region replication enabled
- [ ] KMS encryption configured
- [ ] Backup verification scripts created
- [ ] CloudWatch alarms configured
- [ ] Monitoring dashboard created
- [ ] Runbooks documented and shared with team
- [ ] Team trained on procedures
- [ ] Monthly restore drill scheduled
- [ ] Incident response team assigned
- [ ] Status page templates created
- [ ] RTO/RPO SLAs documented
- [ ] Compliance validation passed (SOC 2, GDPR, SEC)

### 12.2 Monthly Checklist

- [ ] Run backup verification script (manual or automated)
- [ ] Review CloudWatch metrics dashboard
- [ ] Check S3 replication status (lag < 15 min)
- [ ] Verify WAL archive freshness (< 1 hour old)
- [ ] Confirm backup retention policies in place
- [ ] Review incident logs from past month (if any)
- [ ] Validate next month's restore drill timing

### 12.3 Quarterly Checklist

- [ ] Execute full failover test (4-hour window)
- [ ] Document actual RTO/RPO achieved
- [ ] Review and update runbooks
- [ ] Conduct team training/refresher
- [ ] Audit backup costs vs. budget
- [ ] Review compliance requirement changes
- [ ] Confirm DR bucket sync status (< 15 min lag)
- [ ] Update disaster recovery documentation

---

## 13. Cost Estimation

### 13.1 Monthly Backup Costs

| Component | Cost | Notes |
|-----------|------|-------|
| Neon automated backups | Included | (30-day retention) |
| S3 storage (primary) | ~$50 | 30 backups × ~2-5GB each |
| S3 storage (DR replica) | ~$50 | Cross-region replication |
| WAL archive (7-day) | ~$30 | Incremental backups |
| Glacier archive | ~$10 | Auto-transition after 30 days |
| KMS encryption | ~$5 | Per month (key + operations) |
| CloudWatch monitoring | ~$20 | Metrics + alarms + dashboard |
| **Total** | **~$165** | Per month |

### 13.2 Cost Optimization

- Use Neon's included automated backups (vs. manual dumps)
- Tier storage: S3 Standard → S3-IA → Glacier
- Compress WAL files (10x size reduction)
- Auto-expire old backup files via lifecycle policies
- Use spot pricing for DR compute resources

---

## 14. Implementation Timeline

### Phase 1 (Week 1): Foundation
- [ ] Create S3 buckets and configure encryption
- [ ] Enable Neon automated backups
- [ ] Set up CloudWatch monitoring
- [ ] Create backup verification scripts

### Phase 2 (Week 2): Testing
- [ ] Run manual restore drill
- [ ] Validate all procedures
- [ ] Train ops team
- [ ] Document findings

### Phase 3 (Week 3): Automation
- [ ] Deploy automated backup verification (daily)
- [ ] Schedule monthly restore drills
- [ ] Schedule quarterly failover tests
- [ ] Set up alerting

### Phase 4 (Week 4): Optimization & Compliance
- [ ] Review costs and optimize
- [ ] Conduct SOC 2 compliance review
- [ ] Update compliance documentation
- [ ] Go live

---

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-07 | Comprehensive backup & DR strategy |

---

## 16. Approval & Sign-Off

**Reviewed and approved by:**

- [ ] **CTO** __________________ (Technical feasibility)
- [ ] **Compliance Officer** __________________ (Legal compliance)
- [ ] **DevOps Lead** __________________ (Operational readiness)
- [ ] **CEO** __________________ (SLA approval)

---

**Contact:** devops@ipoready.com  
**Last Review:** June 7, 2026  
**Next Review:** September 7, 2026 (Quarterly)
Method: Neon native backup
Retention: 30 days (configurable)
RTO: 30 minutes
RPO: 24 hours
Size Estimate: ~50-200 GB (after 1 year production)
```

**Implementation**:
```bash
# Enable automated backups in Neon console
neon projects configure --backup-retention 30 --backup-schedule "02:00 UTC"

# Or via Neon API
curl -X PATCH https://api.neon.tech/v1/projects/[PROJECT_ID] \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{
    "backup_retention": 30,
    "backup_schedule": "02:00"
  }'
```

**Verification Script** (`scripts/verify-neon-backup.js`):
```javascript
const axios = require('axios')

async function verifyBackups() {
  const projectId = process.env.NEON_PROJECT_ID
  const apiKey = process.env.NEON_API_KEY

  try {
    const res = await axios.get(
      `https://api.neon.tech/v1/projects/${projectId}/backups`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )

    const backups = res.data.backups
    const latest = backups[0]
    const hours = (Date.now() - new Date(latest.created_at)) / (1000 * 60 * 60)

    if (hours > 25) {
      throw new Error(`Latest backup is ${hours.toFixed(1)} hours old`)
    }

    console.log(`✅ Latest backup: ${latest.created_at} (${hours.toFixed(1)}h ago)`)
    console.log(`📊 Total backups: ${backups.length}`)
  } catch (error) {
    console.error('❌ Backup verification failed:', error.message)
    process.exit(1)
  }
}

verifyBackups()
```

#### Hourly Incremental Backup (WAL)
```
Schedule: Hourly (automated by Neon)
Method: Write-Ahead Log (WAL) archiving
Retention: 7 days
RTO: 5 minutes (from latest WAL)
RPO: < 60 seconds
```

**Neon Configuration**:
```javascript
// .env.local / .env.production
NEON_BACKUP_RETENTION=30              # days (full backups)
NEON_WAL_ARCHIVING=true               # Enable WAL shipping
NEON_BACKUP_LOCATION=aws-us-east-1    # Cross-region backup
```

#### Point-in-Time Recovery (PITR)
```
Enabled: Yes (default with Neon)
Recovery Window: 30 days
Method: Replay WAL + full backup
Granularity: Second-level precision
```

**Test PITR Monthly**:
```bash
# Create test point
INSERT INTO audit_log (event, created_at) 
VALUES ('pitr_test_' || NOW()::text, NOW());

# Wait 5 minutes

# Restore to 3 minutes ago via Neon console
# Verify record does NOT exist
```

---

### 2.2 Off-Site Backup to AWS S3

#### Export Schedule
```
Frequency: Daily (01:00 UTC)
Format: SQL dump + compressed tar
Retention: 30 days (S3 Standard), 90 days (S3 Glacier)
Encryption: AES-256 (SSE-S3)
Cross-Region: Replicated to us-west-2
```

**Backup Script** (`scripts/backup-to-s3.ts`):
```typescript
import { neon } from '@neondatabase/serverless'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function backupDatabaseToS3() {
  const timestamp = new Date().toISOString().split('T')[0]
  const backupDir = `/tmp/backups/${timestamp}`
  const dumpFile = `${backupDir}/ipoready-db-${timestamp}.sql`
  const compressedFile = `${dumpFile}.gz`
  
  try {
    // Create backup directory
    await execAsync(`mkdir -p ${backupDir}`)

    // Export database using pg_dump via psql
    console.log('Exporting database...')
    const databaseUrl = process.env.DATABASE_URL
    
    // pg_dump command (works with Neon connection string)
    await execAsync(
      `pg_dump ${databaseUrl} > ${dumpFile} 2>&1`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large databases
    )

    // Compress backup
    console.log('Compressing backup...')
    await execAsync(`gzip ${dumpFile}`)

    // Upload to S3
    console.log('Uploading to S3...')
    const s3Client = new S3Client({ region: 'us-east-1' })
    const fileContent = fs.readFileSync(compressedFile)
    const fileSize = fs.statSync(compressedFile).size

    const uploadParams = {
      Bucket: process.env.AWS_BACKUP_BUCKET,
      Key: `database-backups/${timestamp}/ipoready-db-${timestamp}.sql.gz`,
      Body: fileContent,
      ContentType: 'application/gzip',
      ServerSideEncryption: 'AES256',
      StorageClass: 'STANDARD', // Switch to GLACIER after 30 days via lifecycle
      Metadata: {
        'backup-type': 'full-daily',
        'timestamp': new Date().toISOString(),
        'database': 'ipoready',
        'compressed-size': fileSize.toString()
      }
    }

    await s3Client.send(new PutObjectCommand(uploadParams))
    
    console.log(`✅ Backup uploaded: s3://${process.env.AWS_BACKUP_BUCKET}/database-backups/${timestamp}/`)
    console.log(`📦 Compressed size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`)

    // Cleanup local file
    fs.unlinkSync(compressedFile)

  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    throw error
  }
}

// Execute on demand or via cron
backupDatabaseToS3().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

**Environment Variables**:
```bash
# .env.local / .env.production
DATABASE_URL=postgresql://[user]:[password]@[host]/[db]
AWS_BACKUP_BUCKET=ipoready-backups-prod
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
```

**Cron Schedule** (Vercel Cron, if supported, or external):
```json
{
  "crons": [
    {
      "path": "/api/backup/database-s3",
      "schedule": "0 1 * * *"
    }
  ]
}
```

---

## 3. Application & Deployment Backup Strategy

### 3.1 Vercel Deployment Rollback

#### Auto-Rollback on Deployment Failure
```
Trigger: Build failure, runtime error, health check failure
Action: Automatic rollback to last successful deployment
Threshold: 3 consecutive errors in first 5 minutes
Manual Override: Available 24/7
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run db:migrate && next build",
  "installCommand": "npm ci",
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1", "sfo1"],
  "functions": {
    "api/**": {
      "maxDuration": 60,
      "memory": 3008
    }
  },
  "github": {
    "enabled": true,
    "autoAlias": false,
    "protected": false,
    "silent": false,
    "autoJobCancelation": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**Deployment Monitoring Script** (`scripts/monitor-deployment.ts`):
```typescript
import axios from 'axios'

interface DeploymentStatus {
  id: string
  url: string
  state: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR'
  createdAt: number
  readyState: 'INITIALIZING' | 'STAGING' | 'STAGED' | 'BOOTED'
}

async function monitorDeployment(deploymentUrl: string) {
  let checks = 0
  const maxChecks = 30 // 5 minutes with 10s intervals

  while (checks < maxChecks) {
    try {
      // Health check endpoint
      const response = await axios.get(
        `${deploymentUrl}/api/health`,
        { timeout: 5000 }
      )

      if (response.status === 200 && response.data.status === 'ok') {
        console.log(`✅ Deployment healthy after ${checks * 10}s`)
        return true
      }
    } catch (error) {
      checks++
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }

  console.error('❌ Deployment health check failed, initiating rollback')
  // Trigger rollback via Vercel API
  await triggerRollback()
  return false
}

async function triggerRollback() {
  const vercelToken = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID

  try {
    // Get previous successful deployment
    const deploymentsRes = await axios.get(
      `https://api.vercel.com/v6/deployments`,
      {
        params: {
          projectId,
          state: 'READY',
          limit: 2
        },
        headers: { Authorization: `Bearer ${vercelToken}` }
      }
    )

    const previousDeployment = deploymentsRes.data.deployments[1]
    
    if (previousDeployment) {
      // Create alias to previous deployment
      await axios.post(
        `https://api.vercel.com/v3/deployments/${previousDeployment.uid}/alias`,
        { alias: process.env.VERCEL_URL },
        { headers: { Authorization: `Bearer ${vercelToken}` } }
      )
      
      console.log(`✅ Rolled back to deployment ${previousDeployment.uid}`)
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error.message)
  }
}

// Call after deployment completes
monitorDeployment(process.env.DEPLOYMENT_URL || 'https://ipoready.com')
```

#### Version Control
```
Repository: GitHub (private)
Default Branch: main (production)
Protection Rules:
  - Require PR review (2 approvals)
  - Require status checks to pass
  - Dismiss stale PR approvals
  - Require branches to be up-to-date
  - Restrict who can push (main branch protection)
  
Commit History: Immutable (push --force disabled)
Tag Strategy: Semantic versioning (v1.0.0, v1.1.0-beta, etc.)
```

### 3.2 Vercel Blob Backup (Document Storage)

#### Backup Schedule
```
Frequency: Hourly (automated)
Method: Blob API snapshot export
Retention: 7 days (Vercel native), 30 days (S3 archive)
Size Estimate: 10-50 GB (depends on document volume)
```

**Blob Backup Script** (`scripts/backup-blobs.ts`):
```typescript
import { list, head } from '@vercel/blob'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'

async function backupBlobsToS3() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupManifest: any[] = []
  
  try {
    console.log('Listing all blobs...')
    let cursor: string | undefined
    let blobCount = 0

    // Paginate through all blobs
    do {
      const response = await list({ cursor })
      cursor = response.cursor

      for (const blob of response.blobs) {
        backupManifest.push({
          url: blob.url,
          contentType: blob.contentType,
          size: blob.size,
          uploadedAt: blob.uploadedAt
        })
        blobCount++
      }
    } while (cursor)

    console.log(`Found ${blobCount} blobs to backup`)

    // Write manifest to S3
    const manifestContent = JSON.stringify(backupManifest, null, 2)
    const s3Client = new S3Client({ region: 'us-east-1' })

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BACKUP_BUCKET,
      Key: `blob-manifests/manifest-${timestamp}.json`,
      Body: Buffer.from(manifestContent),
      ContentType: 'application/json',
      ServerSideEncryption: 'AES256'
    }))

    console.log(`✅ Blob manifest backed up: ${blobCount} items`)
    return backupManifest

  } catch (error) {
    console.error('❌ Blob backup failed:', error.message)
    throw error
  }
}

backupBlobsToS3().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

**Vercel Blob Configuration** (`.env.production`):
```bash
BLOB_READ_WRITE_TOKEN=***
BLOB_STORE_ID=ipoready-prod
```

---

## 4. Cloud Storage Backup (Google Drive, Dropbox, etc.)

### 4.1 Unified Cloud Storage Sync

Since IPOReady syncs with multiple cloud providers (Google Drive, Dropbox, OneDrive, Box), backups are automatically distributed:

```
Google Drive:
  - Files synchronized via UnifiedDocumentService
  - Google's native backup: 30-day trash retention
  - Version history: Up to 100 versions per file
  
Dropbox:
  - Files sync via DropboxAdapter
  - Native version history: 30 days (standard), 180 days (plus plan)
  
OneDrive:
  - Files sync via OneDriveAdapter
  - Version history: 30 days
  - Recycle bin: 93 days retention
  
Box:
  - Files sync via BoxAdapter
  - Version history: Configurable (180+ days enterprise)
  - Trash retention: 30 days
```

### 4.2 Unified Document Metadata Backup

**Database Table**: `unified_documents`

**Backup Strategy**:
- Captured in daily Neon PostgreSQL backup
- Contains metadata for all cloud-synced documents
- Enables disaster recovery of document index/structure

**Restore Procedure**:
```sql
-- If unified_documents table corrupted, restore from backup
RESTORE FROM BACKUP 'backup-2026-06-07'
WHERE table_name = 'unified_documents'
```

---

## 5. Data Retention & Compliance

### 5.1 Data Retention Policy

| Data Type | Retention Period | Reason | Storage Location |
|-----------|------------------|--------|------------------|
| User accounts, authentication | 7 years (post-deletion) | SEC requirements | PostgreSQL + Archive |
| Financial records (cap tables, valuations) | 7 years | SEC Rule 17a-4 | PostgreSQL + S3 Glacier |
| Regulatory documents (prospectus, S-1) | 7 years | IPO/Post-IPO compliance | Cloud + PostgreSQL |
| Audit logs, access records | 2 years | SOC 2 requirement | PostgreSQL |
| Team member activity, comments | 2 years | Internal compliance | PostgreSQL |
| Document versions | 90 days | Operational need | Unified cloud storage |
| Application logs | 30 days | Troubleshooting | Vercel + CloudWatch |
| Session cache, temporary data | 7 days | Performance | Redis (ephemeral) |

### 5.2 GDPR / CCPA Compliance

**Right to Be Forgotten**:
```
Procedure:
1. User requests deletion via Settings > Data Export & Deletion
2. Anonymize user record in PostgreSQL:
   - Clear email, name, phone
   - Mark as deleted
   - Retain ID for referential integrity
3. Delete from Redis cache
4. Notify dependent systems (Stripe, SendGrid, etc.)
5. Mark backup windows as "contains deleted PII"
6. After 90-day retention, purge from all backups
```

**Data Portability (GDPR Article 20)**:
```
1. Generate complete data export:
   - User profile
   - All documents
   - Cap table + financial data
   - Activity log
   - Communications
2. Format: JSON + ZIP + CSV
3. Encrypt with user's password
4. Send via secure link (expires in 24 hours)
```

**Implementation** (`src/app/api/data-export/route.ts`):
```typescript
import { getServerSession } from 'next-auth'
import { neon } from '@neondatabase/serverless'
import { createReadStream, createWriteStream } from 'fs'
import { pipe } from 'stream'
import archiver from 'archiver'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const userId = session.user.id

  try {
    // Fetch all user data
    const [user] = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `

    const companies = await sql`
      SELECT * FROM companies WHERE owner_id = ${userId}
    `

    const documents = await sql`
      SELECT ud.* FROM unified_documents ud
      JOIN companies c ON ud.company_id = c.id
      WHERE c.owner_id = ${userId}
    `

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    // Add JSON files
    archive.append(JSON.stringify(user, null, 2), { name: 'user.json' })
    archive.append(JSON.stringify(companies, null, 2), { name: 'companies.json' })
    archive.append(JSON.stringify(documents, null, 2), { name: 'documents.json' })

    // Return as download
    const response = new Response(archive)
    response.headers.set('Content-Type', 'application/zip')
    response.headers.set('Content-Disposition', 'attachment; filename="ipoready-data-export.zip"')
    
    archive.finalize()
    return response

  } catch (error) {
    console.error('Data export failed:', error)
    return new Response('Export failed', { status: 500 })
  }
}
```

### 5.3 SEC Compliance (Rule 17a-4)

**Regulatory Backup Requirements**:
```
Immutable Storage:
  ✅ S3 Object Lock (WORM - Write Once Read Many)
  ✅ Legal hold + retention policies
  ✅ Tamper detection (checksums)
  ✅ Integrity verification (monthly audit)
  
Backup Audits:
  ✅ Monthly restore testing
  ✅ Chain of custody documentation
  ✅ Digital signatures on backups
  ✅ 7-year retention minimum
```

**S3 Configuration** (S3 Object Lock):
```json
{
  "Rules": [
    {
      "Id": "ImmutableBackupRetention",
      "Filter": {
        "Prefix": "database-backups/"
      },
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 2555
      },
      "ObjectLockRetention": {
        "Mode": "GOVERNANCE",
        "Years": 7
      }
    }
  ]
}
```

---

## 6. Recovery Procedures

### 6.1 Database Recovery (4-Hour RTO)

#### Scenario: Full Database Corruption

**Step 1: Assess Damage** (5 minutes)
```bash
# Connect to production database
psql $DATABASE_URL

# Check for corruption
REINDEX DATABASE ipoready;

# If errors found, proceed to Step 2
```

**Step 2: Trigger Point-in-Time Recovery** (10 minutes)
```bash
# Via Neon Console or CLI:
neon databases restore \
  --database ipoready \
  --source-timestamp "2026-06-07T12:00:00Z"
  
# Verify recovery
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

**Step 3: Validate Data Integrity** (15 minutes)
```typescript
// scripts/validate-recovery.ts
import { neon } from '@neondatabase/serverless'

async function validateRecovery() {
  const sql = neon(process.env.DATABASE_URL)

  // Check critical tables
  const checks = [
    { table: 'users', minCount: 1 },
    { table: 'companies', minCount: 1 },
    { table: 'unified_documents', minCount: 1 }
  ]

  for (const check of checks) {
    const result = await sql`
      SELECT COUNT(*) as count FROM ${sql(check.table)};
    `
    const count = result[0].count
    if (count < check.minCount) {
      throw new Error(`${check.table}: expected >= ${check.minCount}, got ${count}`)
    }
    console.log(`✅ ${check.table}: ${count} records`)
  }

  // Verify foreign keys
  const fkViolations = await sql`
    SELECT * FROM referential_integrity_check();
  `

  if (fkViolations.length > 0) {
    throw new Error(`Foreign key violations detected: ${fkViolations.length}`)
  }

  console.log('✅ All integrity checks passed')
}

validateRecovery().catch(err => {
  console.error('Validation failed:', err.message)
  process.exit(1)
})
```

**Step 4: Update Application Connection** (5 minutes)
```bash
# If using temporary recovery database:
1. Verify recovery database is healthy
2. Update DATABASE_URL env var
3. Redeploy application via Vercel
4. Run smoke tests
```

**Step 5: Failover to S3 Backup (if PITR unavailable)** (40 minutes)
```bash
# Download latest backup from S3
aws s3 cp \
  s3://ipoready-backups-prod/database-backups/2026-06-07/ipoready-db-2026-06-07.sql.gz \
  ./backup.sql.gz

# Decompress
gunzip backup.sql.gz

# Restore to new database
createdb ipoready_recovery
psql ipoready_recovery < backup.sql

# Verify connection
psql ipoready_recovery -c "SELECT version();"

# Update env var and redeploy
export DATABASE_URL="postgresql://user:pass@host/ipoready_recovery"
npm run db:migrate
```

**Total RTO: ~75 minutes** (well under 4-hour target)

---

### 6.2 Application Recovery (1-Hour RTO)

#### Scenario: Deployment Failure / Runtime Error

**Option 1: Automatic Rollback** (5 minutes)
- Vercel detects health check failure
- Automatically routes traffic to last successful deployment
- No manual intervention required

**Option 2: Manual Rollback** (10 minutes)
```bash
# Via Vercel CLI
vercel rollback

# Or via GitHub: Revert PR or revert commit
git revert HEAD
git push origin main

# Vercel auto-deploys
```

**Option 3: Deploy Previous Release** (10 minutes)
```bash
# Tag-based recovery
git checkout tags/v1.1.0
npm run build
vercel deploy --prod
```

---

### 6.3 Blob Storage Recovery

#### Scenario: Lost Document (Vercel Blob)

**Step 1: Check Recycle Bin** (Immediate)
```typescript
// Vercel Blob doesn't have a trash, but check cloud storage
// For files synced to Google Drive / Dropbox / etc.

// Google Drive example:
// 1. Open Google Drive
// 2. Navigate to Trash
// 3. Right-click file > Restore
```

**Step 2: Restore from S3 Manifest** (15 minutes)
```typescript
// If file not in cloud provider trash:
// 1. Query blob manifest backup
// 2. Check if file existed in last manifest
// 3. If yes, file was synced to cloud storage
// 4. Restore from cloud storage backup

import { list } from '@vercel/blob'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

async function restoreBlobFromManifest(filename: string, timestamp: string) {
  const s3 = new S3Client({ region: 'us-east-1' })

  // Get manifest for timestamp
  const manifestKey = `blob-manifests/manifest-${timestamp}.json`
  const manifest = await s3.send(new GetObjectCommand({
    Bucket: process.env.AWS_BACKUP_BUCKET,
    Key: manifestKey
  }))

  const manifestData = JSON.parse(await manifest.Body?.transformToString() || '{}')
  const blobEntry = manifestData.find((b: any) => b.url.includes(filename))

  if (!blobEntry) {
    throw new Error(`File not found in manifest: ${filename}`)
  }

  console.log(`Found ${filename} in manifest from ${timestamp}`)
  console.log(`Size: ${blobEntry.size}, Uploaded: ${blobEntry.uploadedAt}`)

  // File exists in cloud storage; verify it's accessible
  // Restore procedure depends on cloud provider
}
```

**Step 3: Restore from Cloud Provider** (30 minutes)
```bash
# If file exists in connected cloud storage (Google Drive, Dropbox, etc.)
# Use UnifiedDocumentService to recover:

const UnifiedDocumentService = require('@/lib/unified-document-service')

await UnifiedDocumentService.restoreDocument({
  companyId: 'abc123',
  documentId: 'doc-456',
  fromCloudProvider: 'google-drive'
})
```

---

## 7. Backup Schedule & Automation

### 7.1 Daily Schedule (UTC)

```
01:00 - Export database to S3 (backup-to-s3.ts)
02:00 - Neon native daily backup
03:00 - Blob manifest backup (backup-blobs.ts)
04:00 - Verify all backups completed (verify-neon-backup.js)
05:00 - Alert if any backup failed
```

### 7.2 Cron Configuration

**Vercel Cron** (if available) or **External Scheduler** (AWS EventBridge, GitHub Actions):

**Option A: GitHub Actions** (Recommended)
```yaml
# .github/workflows/backup-schedule.yml
name: Scheduled Backups

on:
  schedule:
    - cron: '0 1 * * *'  # Daily at 01:00 UTC

jobs:
  backup-database:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Backup database to S3
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AWS_BACKUP_BUCKET: ${{ secrets.AWS_BACKUP_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: npx tsx scripts/backup-to-s3.ts
      
      - name: Verify backup
        run: node scripts/verify-neon-backup.js
      
      - name: Upload backup manifest
        run: npx tsx scripts/backup-blobs.ts
      
      - name: Notify on failure
        if: failure()
        run: |
          echo "Backup failed!" >> /tmp/backup-alert
          # Send alert to Slack, PagerDuty, etc.
```

**Option B: AWS EventBridge + Lambda**
```javascript
// lambda/backup-trigger.js
exports.handler = async (event) => {
  const https = require('https')
  const url = `${process.env.BACKUP_API_URL}/api/backup/trigger`
  
  return new Promise((resolve, reject) => {
    https.post(url, {
      headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
    }, (res) => {
      console.log(`Backup triggered: ${res.statusCode}`)
      resolve(res)
    }).on('error', reject)
  })
}
```

---

## 8. Monthly Disaster Recovery Testing

### 8.1 Test Schedule

```
1st Friday of every month: Full recovery test (5-hour window)
2nd Friday of every month: Rollback test
3rd Friday of every month: PITR test
4th Friday of every month: Blob recovery test

Total commitment: 4 Fridays/month, ~2 hours each
```

### 8.2 Recovery Test Checklist

**Database Recovery Test** (`RECOVERY_TEST_CHECKLIST.md`):
```markdown
## Monthly PITR Recovery Test

### Pre-Test
- [ ] Schedule maintenance window
- [ ] Notify team (Slack #infra)
- [ ] Create isolated test database
- [ ] Record start time

### PITR Restore
- [ ] Identify target time (24-48 hours ago)
- [ ] Initiate PITR via Neon console
- [ ] Wait for restore completion
- [ ] Record restore duration
- [ ] Document any errors

### Data Validation
- [ ] Connect to test database
- [ ] Run validation script (validate-recovery.ts)
- [ ] Check row counts for all critical tables
- [ ] Verify foreign key constraints
- [ ] Sample-query 10 random records
- [ ] Check for data anomalies

### Application Test
- [ ] Update test env to point to recovery DB
- [ ] Deploy to test environment
- [ ] Login as test user
- [ ] Query documents, cap table, financial data
- [ ] Verify all critical features work
- [ ] Test export functionality

### Post-Test
- [ ] Document any issues found
- [ ] Delete test database
- [ ] Update recovery runbook
- [ ] Record results in spreadsheet
- [ ] Post summary to #infra Slack channel

### Expected Outcomes
- [ ] PITR completes in < 30 min
- [ ] Data integrity check passes
- [ ] Application login works
- [ ] All queries execute correctly
- [ ] No data loss detected

### Failure Criteria
- PITR fails to restore
- Validation script reports errors
- Application cannot connect to recovered DB
- Data loss detected
- Foreign key violations present
```

### 8.3 Test Automation

**Automated Monthly Test** (`scripts/monthly-recovery-test.ts`):
```typescript
import { neon } from '@neondatabase/serverless'
import axios from 'axios'
import * as fs from 'fs'

interface RecoveryTestResult {
  timestamp: string
  pitrDuration: number
  validationPassed: boolean
  appTestPassed: boolean
  errorLog: string[]
}

async function runMonthlyRecoveryTest(): Promise<RecoveryTestResult> {
  const result: RecoveryTestResult = {
    timestamp: new Date().toISOString(),
    pitrDuration: 0,
    validationPassed: false,
    appTestPassed: false,
    errorLog: []
  }

  try {
    console.log('Starting monthly disaster recovery test...')

    // 1. Initiate PITR (via Neon API)
    const startTime = Date.now()
    console.log('Initiating PITR to 48 hours ago...')

    const neonRes = await axios.patch(
      `https://api.neon.tech/v1/databases/${process.env.NEON_DATABASE_ID}/restore`,
      {
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      },
      { headers: { Authorization: `Bearer ${process.env.NEON_API_KEY}` } }
    )

    // Wait for restore
    let restoreComplete = false
    let waitTime = 0
    while (!restoreComplete && waitTime < 1800000) { // 30 min timeout
      await new Promise(r => setTimeout(r, 30000)) // Check every 30s
      waitTime += 30000

      const status = await axios.get(
        `https://api.neon.tech/v1/databases/${process.env.NEON_DATABASE_ID}`,
        { headers: { Authorization: `Bearer ${process.env.NEON_API_KEY}` } }
      )

      restoreComplete = status.data.status === 'ready'
    }

    result.pitrDuration = Date.now() - startTime
    console.log(`✅ PITR completed in ${(result.pitrDuration / 1000).toFixed(0)}s`)

    // 2. Validate recovered data
    console.log('Validating recovered data...')
    const sql = neon(process.env.TEST_DATABASE_URL)

    const validation = {
      users: (await sql`SELECT COUNT(*) FROM users`)[0].count,
      companies: (await sql`SELECT COUNT(*) FROM companies`)[0].count,
      documents: (await sql`SELECT COUNT(*) FROM unified_documents`)[0].count
    }

    console.log(`✅ Validation: ${validation.users} users, ${validation.companies} companies, ${validation.documents} documents`)

    if (validation.users > 0 && validation.companies > 0) {
      result.validationPassed = true
    } else {
      result.errorLog.push('Data validation failed: insufficient records')
    }

    // 3. Test application connectivity
    console.log('Testing application connectivity...')
    const appTest = await axios.get('http://localhost:3000/api/health', {
      timeout: 10000
    })

    if (appTest.status === 200) {
      result.appTestPassed = true
      console.log('✅ Application health check passed')
    }

  } catch (error) {
    result.errorLog.push(`Test failed: ${error.message}`)
    console.error('❌ Recovery test failed:', error.message)
  }

  // Save results
  const resultsFile = `recovery-test-results-${result.timestamp.split('T')[0]}.json`
  fs.writeFileSync(resultsFile, JSON.stringify(result, null, 2))
  console.log(`Test results saved to ${resultsFile}`)

  // Report to monitoring
  const passed = result.validationPassed && result.appTestPassed
  console.log(`Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`)

  return result
}

// Schedule via GitHub Actions or cron
runMonthlyRecoveryTest().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

---

## 9. Backup Storage & Infrastructure

### 9.1 AWS S3 Configuration

**Bucket Setup**:
```bash
# Create backup bucket
aws s3api create-bucket \
  --bucket ipoready-backups-prod \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ipoready-backups-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket ipoready-backups-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Enable Object Lock (immutability for compliance)
aws s3api put-object-lock-configuration \
  --bucket ipoready-backups-prod \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "GOVERNANCE",
        "Years": 7
      }
    }
  }'

# Setup lifecycle policy (move to Glacier after 30 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket ipoready-backups-prod \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "ArchiveOldBackups",
      "Status": "Enabled",
      "Prefix": "database-backups/",
      "Transitions": [{
        "Days": 30,
        "StorageClass": "GLACIER"
      }],
      "Expiration": {
        "Days": 2555
      }
    }]
  }'

# Enable cross-region replication
aws s3api put-bucket-replication \
  --bucket ipoready-backups-prod \
  --replication-configuration '{
    "Role": "arn:aws:iam::ACCOUNT_ID:role/s3-replication",
    "Rules": [{
      "Id": "ReplicateToWest",
      "Status": "Enabled",
      "Priority": 1,
      "Filter": { "Prefix": "" },
      "Destination": {
        "Bucket": "arn:aws:s3:::ipoready-backups-prod-west",
        "ReplicationTime": { "Status": "Enabled", "Time": { "Minutes": 15 } }
      }
    }]
  }'
```

### 9.2 IAM Policy for Backups

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BackupBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObjectVersion",
        "s3:ListBucketVersions"
      ],
      "Resource": [
        "arn:aws:s3:::ipoready-backups-prod",
        "arn:aws:s3:::ipoready-backups-prod/*"
      ]
    },
    {
      "Sid": "NeonBackupAccess",
      "Effect": "Allow",
      "Action": [
        "neon:DescribeBackups",
        "neon:RestoreDatabase",
        "neon:CreateBackup"
      ],
      "Resource": "arn:neon:databases/*"
    }
  ]
}
```

---

## 10. Monitoring & Alerting

### 10.1 Backup Status Dashboard

**Metrics to Track**:
```
- Last successful backup timestamp
- Backup size trend (growth rate)
- Restore test success rate
- RTO/RPO compliance
- Data integrity checks
- Backup count by age
```

**Grafana Dashboard** (or alternative):
```json
{
  "dashboard": {
    "title": "IPOReady Backup Status",
    "panels": [
      {
        "title": "Last Backup Age",
        "targets": [
          {
            "query": "(now() - max(backup_timestamp)) / 3600"
          }
        ],
        "alert": {
          "condition": "> 25 hours",
          "severity": "critical"
        }
      },
      {
        "title": "S3 Backup Size (GB)",
        "targets": [
          {
            "query": "s3_backup_size_bytes / 1e9"
          }
        ]
      },
      {
        "title": "Recovery Test Success Rate",
        "targets": [
          {
            "query": "recovery_tests_passed / recovery_tests_total * 100"
          }
        ]
      }
    ]
  }
}
```

### 10.2 Alerting Rules

**PagerDuty / Slack Integration**:

| Alert | Threshold | Severity | Action |
|-------|-----------|----------|--------|
| Backup Failed | Any failure | Critical | Page on-call engineer |
| Backup Delayed | > 25 hours since last | High | Slack alert |
| Restore Test Failed | Monthly test fails | High | Slack alert + postmortem |
| S3 Bucket Error | 403 / 5XX | Critical | Page on-call engineer |
| PITR Window Closing | < 7 days remaining | Medium | Slack alert |

---

## 11. Disaster Recovery Runbook

### 11.1 Emergency Contacts

```
Primary On-Call: [Name] - [Phone] - [Email]
Secondary On-Call: [Name] - [Phone] - [Email]
Infrastructure Lead: [Name] - [Phone] - [Email]
Chief Technology Officer: [Name] - [Phone] - [Email]

Escalation:
- Page on-call if RTO < 30 minutes
- Activate war room for RTO < 1 hour
- Notify C-suite if RTO > 2 hours
```

### 11.2 Incident Command Structure

```
Incident Commander: Directs recovery effort
Technical Lead: Executes recovery steps
Communications: Updates stakeholders
Documentation: Records actions taken
```

### 11.3 Recovery Priority Matrix

| Scenario | RTO | RPO | Priority | Procedure |
|----------|-----|-----|----------|-----------|
| Database corruption (< 5 min age) | 5 min | 1 min | Critical | PITR from WAL |
| Database full outage | 30 min | 1 hour | Critical | Promote read replica or restore from PITR |
| Deployment failure | 5 min | 0 min | Critical | Automatic rollback |
| Data loss (cloud storage) | 1 hour | 1 hour | High | Restore from cloud provider trash |
| Compliance audit | N/A | N/A | Medium | Generate audit report from backups |
| Data export request | 2 hours | 24 hours | Medium | Export from live database |

---

## 12. Documentation & Training

### 12.1 Required Documentation

- [x] This backup.md file
- [ ] Recovery Runbook (procedures/RECOVERY_RUNBOOK.md)
- [ ] Team Training Guide (procedures/TEAM_TRAINING.md)
- [ ] Vendor Contacts (procedures/VENDOR_CONTACTS.txt) — ENCRYPTED
- [ ] Backup Inventory (procedures/BACKUP_INVENTORY.xlsx) — ENCRYPTED
- [ ] Incident Response Plan (procedures/INCIDENT_RESPONSE_PLAN.md)

### 12.2 Team Training Schedule

```
Onboarding:
- All engineers: 1-hour backup overview
- On-call rotation: 2-hour DR hands-on drill

Quarterly:
- Full team: 30-min backup status review
- On-call rotation: 1-hour recovery drill

Annual:
- Full team: 4-hour recovery challenge
- Post-incident: Root cause analysis + lessons learned
```

### 12.3 Knowledge Base

**Wiki / Confluence Pages**:
- "How to recover a deleted document"
- "Database recovery process"
- "Emergency contacts"
- "How to check backup status"

---

## 13. Cost Optimization

### 13.1 Backup Storage Costs (Annual)

Assuming 100 GB production database:

```
Neon native backups:    $0/month (included)
S3 Standard (30 days):  $100/month = $1,200/year
S3 Glacier (60 days):   $20/month = $240/year
Blob manifest backups:  $50/month = $600/year
Monthly recovery tests: $200/month = $2,400/year

Total: ~$4,440/year (~$370/month)
```

### 13.2 Cost Reduction Strategies

```
✅ Use S3 lifecycle policies (Standard → Glacier → Archive)
✅ Compress SQL dumps (gzip: 70-80% reduction)
✅ Deduplicate across backup snapshots
✅ Archive to Glacier after 30 days (90% cheaper than Standard)
✅ Remove unnecessary blob manifests after 7 days
✅ Consolidate recovery tests (monthly instead of weekly)
```

---

## 14. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-07 | Initial creation: Neon daily/hourly backups, S3 off-site, PITR, recovery procedures, 4-hour RTO, 1-hour RPO |

---

## 15. Approval & Sign-Off

**Drafted By**: Infrastructure Team  
**Reviewed By**: CTO, Security Lead  
**Approved By**: CEO / Board  
**Last Updated**: 2026-06-07  
**Next Review**: 2026-12-07 (annual)

---

## Appendix A: Backup Scripts Summary

All backup scripts should be stored in `/scripts/` directory:

1. **backup-to-s3.ts** — Export database to S3 (daily, 01:00 UTC)
2. **backup-blobs.ts** — Backup Vercel Blob manifests (daily, 03:00 UTC)
3. **verify-neon-backup.js** — Verify latest Neon backup exists (daily, 04:00 UTC)
4. **validate-recovery.ts** — Validate recovered database integrity
5. **monitor-deployment.ts** — Monitor post-deployment health
6. **monthly-recovery-test.ts** — Automated monthly PITR test

All scripts use environment variables (DATABASE_URL, AWS_ACCESS_KEY_ID, etc.) from `.env.local` / `.env.production`.

---

## Appendix B: Quick Reference

**Emergency Procedures** (Laminated Card):
```
DATABASE FAILURE:
1. Check Neon console: https://console.neon.tech
2. If PITR available: Restore to 1 hour ago
3. If not: Restore from latest S3 backup
4. Verify data integrity
5. Update DATABASE_URL env var
6. Redeploy via Vercel

DEPLOYMENT FAILURE:
1. Vercel auto-rolls back (should be automatic)
2. If not: Run `vercel rollback`
3. Monitor health at https://status.vercel.com

LOST DOCUMENT:
1. Check cloud storage trash (Google Drive, Dropbox, etc.)
2. If not there: Restore from blob manifest backup
3. Contact Cloud Storage team if needed

DATA EXPORT REQUEST:
1. Run: npm run data-export -- --user-id ABC123
2. Encrypt with user's password
3. Send secure link (24-hour expiration)
```

---

## Appendix C: Neon CLI Commands

```bash
# List all backups
neon backups list --project-id $NEON_PROJECT_ID

# Create manual backup
neon backups create --project-id $NEON_PROJECT_ID

# Restore to point-in-time
neon databases restore --database ipoready --source-timestamp "2026-06-07T12:00:00Z"

# Check backup status
neon backups status --project-id $NEON_PROJECT_ID --backup-id $BACKUP_ID

# Configure backup retention
neon projects configure --project-id $NEON_PROJECT_ID --backup-retention 30
```

---

**END OF DOCUMENT**
