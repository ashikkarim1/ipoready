# IPOReady Backup & Disaster Recovery Strategy

**Version**: 1.0  
**Date**: 2026-06-07  
**Status**: Approved for Implementation  
**Owner**: DevOps / Infrastructure Team  
**Compliance**: SOC 2, GDPR, HIPAA, SEC (as applicable)

---

## Executive Summary

This document defines the backup and disaster recovery (DR) strategy for IPOReady, ensuring business continuity and data protection. The strategy balances operational resilience with cost efficiency and compliance requirements.

**Key Targets**:
- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour
- **Backup Retention**: 30 days (standard), 90 days (regulatory), 7 years (archive)
- **Off-site Storage**: AWS S3 + Neon native backups in separate regions
- **Disaster Recovery Drills**: Monthly automated testing

---

## 1. Infrastructure Overview

### Technology Stack
- **Application**: Next.js 14 (TypeScript) deployed on Vercel
- **Database**: Neon PostgreSQL (serverless, multi-region capable)
- **Storage**: Vercel Blob + AWS S3 (documents, backups)
- **Authentication**: NextAuth v4 (JWT, credential-based)
- **Cloud Integrations**: Google Drive, Dropbox, OneDrive, Box
- **Monitoring**: Vercel Analytics, custom instrumentation

### Data Classification
| Category | Examples | Sensitivity | Retention |
|----------|----------|-------------|-----------|
| **Tier 1: Critical** | User accounts, company data, cap tables, financial records | High | 7 years |
| **Tier 2: Important** | Documents, comments, audit logs, access records | Medium | 90 days |
| **Tier 3: Operational** | Cache, sessions, temporary files, logs | Low | 30 days |
| **Tier 4: Public** | Marketing content, public docs | N/A | 30 days |

---

## 2. Database Backup Strategy

### 2.1 Neon PostgreSQL Backup Schedule

#### Daily Full Backup (Primary Strategy)
```
Schedule: 02:00 UTC daily (off-peak)
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
