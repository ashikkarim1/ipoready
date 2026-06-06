# IPOReady Operations & Deployment Guide

**Document Version:** 2.0  
**Last Updated:** June 7, 2026  
**Target Audience:** DevOps Engineers, SRE, Infrastructure Managers  
**Status:** Production Ready  

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Process](#deployment-process)
3. [Environment Variables & Secrets Management](#environment-variables--secrets-management)
4. [Database Migration Strategy](#database-migration-strategy)
5. [Rollback Procedures](#rollback-procedures)
6. [Scaling Strategy](#scaling-strategy)
7. [Backup & Recovery Procedures](#backup--recovery-procedures)
8. [Disaster Recovery Plan](#disaster-recovery-plan)
9. [Monitoring & Alerting](#monitoring--alerting)
10. [Incident Response Playbook](#incident-response-playbook)
11. [Compliance & Audit](#compliance--audit)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

### Application Architecture

**Stack:**
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript 6.0.3
- **Frontend:** React 18.3, Tailwind CSS v4, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** NextAuth.js v4
- **Hosting:** Vercel
- **File Storage:** Vercel Blob + AWS S3
- **Payments:** Stripe
- **Email:** Resend
- **SMS:** Twilio
- **Analytics:** Vercel Analytics

### Key Infrastructure Components

| Component | Service | SLA | Criticality |
|-----------|---------|-----|-------------|
| Compute | Vercel | 99.99% | Critical |
| Database | Neon PostgreSQL | 99.9% | Critical |
| Auth | NextAuth.js | N/A | Critical |
| File Storage | Vercel Blob + S3 | 99.99% | High |
| Payment Processing | Stripe | 99.95% | High |
| Email Delivery | Resend | 99.9% | Medium |
| SMS | Twilio | 99.95% | Medium |

### Geographic Regions

- **Primary Region:** US-East (Vercel)
- **Database Region:** US-East (Neon AWS us-east-1)
- **Failover:** US-West (configured, see DR section)

---

## Deployment Process

### Pre-Deployment Checklist

#### Code & Quality Assurance
- [ ] All feature branches merged to `main`
- [ ] Latest commit passed CI/CD pipeline
- [ ] No uncommitted changes in working directory
- [ ] All tests passing: `npm run test && npm run test:e2e`
- [ ] TypeScript check passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] CHANGELOG.md updated with release notes
- [ ] Git tag created: `git tag -a v<version> -m "Release v<version>"`

#### Database & Migrations
- [ ] All new migrations reviewed and tested locally
- [ ] Migration scripts are idempotent (safe to re-run)
- [ ] Database backup taken (if production data exists)
- [ ] Migration rollback script prepared
- [ ] Data seeders verified against schema
- [ ] Performance impact of migrations assessed

#### Infrastructure & Secrets
- [ ] All secrets loaded into Vercel Secrets Manager
- [ ] Environment variables match `.env.production.template`
- [ ] `NEXTAUTH_SECRET` is a 32-byte random hex string
- [ ] `CRON_SECRET` is unique and rotated if needed
- [ ] Database connection pooling configured
- [ ] SSL/TLS certificates valid and non-expired
- [ ] API keys for third-party services verified

#### Feature & Functionality
- [ ] All features in release tested on staging
- [ ] No console errors in production build
- [ ] Lighthouse performance score > 85
- [ ] Core Web Vitals healthy (LCP < 2.5s, CLS < 0.1)
- [ ] Mobile responsiveness verified (iOS + Android)
- [ ] OAuth providers configured (Google, LinkedIn)
- [ ] Stripe webhooks registered and tested
- [ ] Email templates validated (Resend)
- [ ] SMS templates validated (Twilio)

#### Security & Compliance
- [ ] Security headers configured in `next.config.js`
- [ ] HSTS preload registration completed
- [ ] CSP policies tested without violations
- [ ] Rate limiting configured on sensitive endpoints
- [ ] Input validation implemented for all user-facing APIs
- [ ] SQL injection protections in place (parameterized queries)
- [ ] CORS headers correctly configured
- [ ] API authentication/authorization tested
- [ ] Secrets not exposed in error messages or logs

#### Documentation & Communication
- [ ] Deployment runbook reviewed by team
- [ ] Incident response plan reviewed
- [ ] Status page prepared for updates
- [ ] Customer communication drafted (if applicable)
- [ ] On-call engineer assigned for post-deployment monitoring
- [ ] Rollback plan communicated to team

---

### Deployment Workflow

#### Phase 1: Local Validation (10-15 min)

```bash
# 1. Ensure clean working directory
git status
# Expected: "On branch main, nothing to commit, working tree clean"

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies (reproducible builds)
npm ci

# 4. Run tests
npm run test
npm run test:coverage

# 5. Type checking
npm run type-check

# 6. Linting
npm run lint

# 7. Build locally
rm -rf .next
npm run build

# 8. Test build
npm run start &
sleep 3
curl -s http://localhost:3000 | grep -q "IPOReady" && echo "✓ Build verified"
kill %1

# 9. Verify all commits are pushed
git log --oneline -1
git push --dry-run origin main
```

**Success Criteria:**
- All tests pass
- Build completes without errors
- No TypeScript issues
- All commits pushed to origin

#### Phase 2: Pre-Deployment Database Setup (5-10 min)

```bash
# 1. Test database connectivity
node -e "
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  sql\`SELECT version()\`
    .then(r => console.log('✓ DB Connection OK:', r[0].version.substring(0, 50)))
    .catch(e => { console.error('✗ DB Error:', e.message); process.exit(1); });
"

# 2. Create backup (if production data exists)
# Contact Neon dashboard or use CLI:
neonctl db backup create --project-id <project-id> \
  --branch main \
  --backup-name "pre-deployment-$(date +%Y%m%d-%H%M%S)"

# 3. Verify pending migrations
ls -1 migrations/*.sql | sort
# Cross-reference with migrations table:
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;"

# 4. Dry-run migration (non-destructive)
# Create a test branch in Neon or use pg_dump for safety
```

**Success Criteria:**
- Database connection succeeds
- Backup created successfully
- All pending migrations identified

#### Phase 3: Deployment to Vercel (3-5 min, automatic)

**Option A: Automatic Deployment (Recommended)**

```bash
# Simply push to main — Vercel webhook triggers automatically
git push origin main

# Monitor deployment
open https://vercel.com/dashboard/ipoready/deployments
# OR use Vercel CLI:
vercel list
vercel env pull  # Verify env vars are set
```

Vercel will:
1. Detect push to main branch
2. Run `npm run db:migrate` (build command in vercel.json)
3. Run `next build`
4. Deploy to production URL

**Option B: Manual Deployment via Vercel CLI**

```bash
# Install Vercel CLI if not present
npm install -g vercel

# Deploy to production
vercel --prod

# Follow interactive prompts:
# ? Set up and deploy "...": Yes
# ? Which scope?: [Select your account]
# ? Link to existing project?: Yes → IPOReady
# ? Want to modify settings?: No
# ? Production deployment to ipoready.vercel.app?: Yes

# Monitor progress
vercel env pull --yes  # Sync env vars
vercel deployments list --sort created
```

**Vercel Configuration Verification:**

Before deployment, verify Vercel settings:

```bash
# Check project configuration
vercel project inspect

# Verify build command
vercel env show

# Expected output:
# Framework: Next.js
# Build Command: npm run db:migrate && next build
# Install Command: npm ci
# Output Directory: .next
# Node Version: 18.x or 20.x

# Check environment variables are set
vercel env ls
# Should show: DATABASE_URL, NEXTAUTH_SECRET, STRIPE_*_KEY, etc.
```

#### Phase 4: Database Migrations (2-5 min, runs in vercel.json build)

The `vercel.json` configuration specifies:

```json
{
  "buildCommand": "npm run db:migrate && next build"
}
```

This means migrations run **before the Next.js build**, ensuring:
- Schema is ready before app code runs
- If migration fails, build fails and deployment is blocked
- Rollback is simple: revert commit and redeploy

**Migration Execution Details:**

The `scripts/migrate.js` script:
1. Creates `migrations` tracking table if missing
2. Reads all `.sql` files from `migrations/` directory in alphabetical order
3. Checks `migrations` table to skip already-executed migrations
4. Executes each new migration using Neon HTTP client (`neon` function)
5. Records migration name and timestamp in `migrations` table
6. Exits with error code if any migration fails (blocks deployment)

**Example Migration Execution:**

```bash
$ npm run db:migrate

Running IPOReady database migration...
⏭️  Skipping migration 001_add_whatsapp_tables.sql (already executed)
⏭️  Skipping migration 002_add_phase2_schema.sql (already executed)
✅ Migration 003_cap_table_schema.sql completed
✅ Migration 004_lead_capture_and_trial_schema.sql completed
✅ All database migrations complete!
```

#### Phase 5: Post-Deployment Verification (10-15 min)

**Immediate Checks (within 2 minutes of deployment):**

```bash
# 1. Check deployment status
curl -I https://www.ipoready.ai/
# Expected: HTTP 200

# 2. Test critical API endpoints
API_BASE="https://www.ipoready.ai/api"

# Health check
curl -s "$API_BASE/health" | jq .
# Expected: { "status": "ok", "timestamp": "..." }

# Auth session (may require authenticated session)
curl -s "$API_BASE/auth/session" | jq .

# Database connectivity via public endpoint
curl -s "$API_BASE/companies" \
  -H "Authorization: Bearer <session-token>" | jq .

# 3. Check Vercel deployment status
vercel deployments list --limit 1
# Should show state: READY

# 4. Monitor error rate (from Vercel dashboard)
open https://vercel.com/dashboard/ipoready/monitoring
# Expected: No 5xx errors in last minute
```

**Extended Checks (within 10 minutes of deployment):**

```bash
# 5. Verify frontend loads correctly
curl -s https://www.ipoready.ai/ | grep -o "<title>.*</title>"
# Expected: <title>IPOReady - IPO Readiness Hub</title>

# 6. Check authenticated pages load (with valid session)
curl -s https://www.ipoready.ai/dashboard \
  -H "Cookie: __Secure-next-auth.session-token=<session-token>" \
  | grep -q "Dashboard" && echo "✓ Dashboard loads"

# 7. Check critical pages
PAGES=("/" "/pricing" "/dashboard" "/login" "/signup")
for page in "${PAGES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://www.ipoready.ai$page")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✓ $page: $HTTP_CODE"
  else
    echo "✗ $page: $HTTP_CODE (ERROR)"
  fi
done

# 8. Database connectivity check
# Make authenticated request to endpoint that queries database
curl -s "https://www.ipoready.ai/api/companies?limit=1" \
  -H "Authorization: Bearer <token>" \
  | jq . && echo "✓ Database responds"

# 9. Third-party integrations
# Stripe webhook endpoint
curl -I https://www.ipoready.ai/api/webhooks/stripe
# Expected: HTTP 405 Method Not Allowed (POST required)

# Email service availability
# (tested manually when triggered by user action)

# 10. Performance metrics
# Check Vercel Analytics
open https://vercel.com/dashboard/ipoready/analytics
# Look for: Core Web Vitals, Response times, Request count
```

**Post-Deployment Monitoring (next 24 hours):**

1. **Hour 0-1:** Watch error rate closely
   - Target: < 0.1% 5xx errors
   - Check for unusual database query patterns
   - Monitor memory usage

2. **Hour 1-6:** Validate user flows
   - Test signup → onboarding flow
   - Test login with different OAuth providers
   - Verify document upload functionality
   - Test payment flow (test mode)

3. **Hour 6-24:** Continuous monitoring
   - Check error trends
   - Monitor database performance
   - Watch for performance degradation
   - Verify cron jobs running (if any)

---

## Environment Variables & Secrets Management

### Variable Categories

#### 1. Application Configuration (Non-Secret)

```bash
NODE_ENV=production
NEXTAUTH_URL=https://www.ipoready.ai
LOG_LEVEL=info
FEATURE_PROSPECTUS_BUILDER=true
FEATURE_CAP_TABLE_IMPORT=true
FEATURE_REAL_TIME_COLLABORATION=true
```

#### 2. Secrets (Critical — Store in Vercel Secrets Manager)

**Authentication & Authorization:**
```bash
NEXTAUTH_SECRET=<GENERATE_VIA: openssl rand -hex 32>
CRON_SECRET=<GENERATE_VIA: openssl rand -hex 32>
```

**Database:**
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require&channel_binding=require
```

**Payment Processing:**
```bash
STRIPE_PUBLISHABLE_KEY=pk_live_<key>
STRIPE_SECRET_KEY=sk_live_<key>
STRIPE_WEBHOOK_SECRET=whsec_<key>
```

**OAuth Providers:**
```bash
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
LINKEDIN_CLIENT_ID=<your-client-id>
LINKEDIN_CLIENT_SECRET=<your-client-secret>
```

**File Storage:**
```bash
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_S3_BUCKET=ipoready-documents
AWS_S3_REGION=us-east-1
```

**Email & Communication:**
```bash
RESEND_API_KEY=<resend-api-key>
TWILIO_ACCOUNT_SID=<account-sid>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE_NUMBER=<phone-number>
SLACK_BOT_TOKEN=<bot-token>
SLACK_WEBHOOK_URL=<webhook-url>
```

**Monitoring & Analytics:**
```bash
SENTRY_DSN=https://key@sentry.io/project-id
DATADOG_API_KEY=<api-key>
NEW_RELIC_LICENSE_KEY=<license-key>
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Secrets Management Best Practices

#### Generation

```bash
# Generate cryptographically secure random secrets
openssl rand -hex 32  # For NEXTAUTH_SECRET, CRON_SECRET

# Store generation output in secure location
openssl rand -hex 32 > /tmp/nextauth_secret.txt
chmod 600 /tmp/nextauth_secret.txt

# Use in Vercel
vercel env add NEXTAUTH_SECRET
# Paste value when prompted
```

#### Storage

1. **Vercel Secrets Manager (Primary)**
   ```bash
   # Set secret via CLI
   vercel env add STRIPE_SECRET_KEY
   
   # Verify (only shows masked value)
   vercel env ls
   
   # Secrets automatically available in build environment
   # Do not commit .env files with secrets
   ```

2. **Backup Storage (Encrypted)**
   - Store encrypted backup in secure location
   - Use GPG or similar encryption
   - Keep separate from code repository

#### Rotation Schedule

| Secret | Rotation | Trigger |
|--------|----------|---------|
| NEXTAUTH_SECRET | Every 90 days | Scheduled |
| CRON_SECRET | Every 90 days | Scheduled |
| API Keys | Every 6 months | Scheduled |
| OAuth Credentials | Annually | Scheduled |
| Database Password | Every 6 months | Scheduled |
| Stripe Keys | On key compromise | On-demand |

#### Rotation Process

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Add new secret with temporary name
vercel env add NEXTAUTH_SECRET_NEW
# Paste new secret

# 3. Update application to use new secret
# (or deploy with both old and new for grace period)

# 4. Update deployment config
# (redeploy to use new secret)

# 5. Monitor for issues (24 hours)
# (check error rates, user sessions)

# 6. Remove old secret
vercel env rm NEXTAUTH_SECRET_OLD

# 7. Document rotation in audit log
```

### Local Development Environment

Create `.env.local` (never commit):

```bash
# Copy from .env.production.template
cp .env.production.template .env.local

# Replace production values with local/test values:
DATABASE_URL=postgresql://user:password@localhost:5432/ipoready_dev
NEXTAUTH_SECRET=dev-only-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# ... etc

# Ensure .env.local is in .gitignore
grep ".env.local" .gitignore
```

---

## Database Migration Strategy

### Migration Philosophy

**Principles:**
1. **Idempotent:** Safe to re-run multiple times
2. **Atomic:** All-or-nothing (transactional)
3. **Backwards Compatible:** Old code works with new schema (when possible)
4. **Tested:** Run against staging before production
5. **Documented:** Comments explain intent and impact
6. **Reversible:** Rollback script exists for destructive changes

### Migration Lifecycle

#### Pre-Migration Checklist

```bash
# 1. Identify pending migrations
ls -1 migrations/*.sql | while read f; do
  name=$(basename "$f")
  psql "$DATABASE_URL" -t -c "SELECT name FROM migrations WHERE name='$name';" | grep -q "$name" || echo "PENDING: $name"
done

# 2. Review migration SQL
cat migrations/XXX_new_migration.sql
# Check for:
# - CREATE TABLE IF NOT EXISTS (safe)
# - ALTER TABLE ... ADD COLUMN ... DEFAULT (safe)
# - DROP TABLE (requires review & rollback plan)

# 3. Estimate impact
# - Schema changes: Minutes of downtime
# - Data migrations: Hours or days depending on table size
# - Index changes: Minutes to hours

# 4. Prepare rollback
# Document exact rollback SQL
cat > rollback_XXX.sql << 'EOF'
-- Rollback migration XXX_new_migration
-- Executed: [timestamp]
-- Reason: [description]

-- Drop new table
DROP TABLE IF EXISTS new_table CASCADE;

-- Drop new columns from existing tables
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;

-- Restore indices
CREATE INDEX idx_restored ON table_name(column);
EOF

# 5. Test on staging
# Create Neon branch or local copy
neonctl branch create --parent-id main \
  --branch-name test-migration-xxx

# Run migrations on branch
DATABASE_URL="<branch-url>" npm run db:migrate

# Verify data integrity
psql "<branch-url>" -c "SELECT COUNT(*) FROM table_name;"
psql "<branch-url>" -c "SELECT * FROM table_name WHERE status='error';" # Check for issues
```

#### During Migration (Production)

```bash
# 1. Pre-flight checks
echo "Backup created: $(date)" >> deployment_log.txt
echo "Verifying database connectivity..."
psql "$DATABASE_URL" -c "SELECT 1"

# 2. Run migrations (handled by Vercel build)
# Migrations execute when deployed to Vercel
# Part of: npm run db:migrate && next build
npm run db:migrate

# 3. Monitor execution
# Check build logs in Vercel dashboard
open https://vercel.com/dashboard/ipoready/deployments

# 4. Verify success
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;"
# All new migrations should appear here

# 5. Validation queries
psql "$DATABASE_URL" << 'EOF'
-- Verify schema changes
\d new_table
\d existing_table

-- Check data integrity
SELECT COUNT(*) FROM table_name WHERE created_at IS NULL; -- Should be 0
SELECT COUNT(DISTINCT id) FROM table_name; -- Should match COUNT(*)
EOF
```

#### Post-Migration Validation

```bash
# 1. Application health checks
curl https://www.ipoready.ai/api/health

# 2. Database query performance
# Compare query times before/after migration
EXPLAIN ANALYZE SELECT * FROM large_table LIMIT 10;

# 3. Business logic tests
# - Users can create documents
# - Cap table upload works
# - Reports generate without errors
# - Exports are accurate

# 4. Monitor for issues (24 hours)
# - Check error rates
# - Monitor query performance
# - Watch for slow queries
# - Monitor connection pool utilization

# 5. Update documentation
echo "Migration XXX_new_migration.sql completed on $(date)" >> MIGRATION_LOG.md
```

### Handling Failed Migrations

#### Scenario 1: Migration Fails During Deployment

```bash
# 1. Check error message
# Vercel dashboard → Deployments → Failed build → View logs

# 2. Diagnose issue
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 10;"
# Find last successful migration

# 3. Fix migration file if needed
# Edit migrations/XXX_failed_migration.sql
# Common issues:
# - Syntax error: Missing semicolon, invalid SQL
# - State conflict: Table already exists
# - Data issue: NULL constraint violated

# 4. Revert deployment (see Rollback section)
# This rolls back to previous code AND previous database state

# 5. Re-run migration after fix
git push origin main  # Vercel automatically retries
```

#### Scenario 2: Partial Migration Success

```bash
# Some migrations passed, some failed
# Solution: All-or-nothing is enforced by scripts/migrate.js

# If partial failure occurs:
# 1. Stop deployment (cancel in Vercel)
# 2. Fix the failing migration
# 3. Redeploy (Vercel retries all migrations)

# Idempotency ensures already-executed migrations are skipped
```

#### Scenario 3: Data Corruption After Migration

```bash
# Issue: Data in new table/columns is incorrect

# 1. Immediate action: Revert to previous version
git revert HEAD --no-edit
git push origin main

# 2. Analyze what went wrong
psql "$DATABASE_URL" -c "
  SELECT * FROM table_name 
  WHERE created_at > now() - interval '1 hour'
  LIMIT 10;
" | head -50

# 3. Fix migration logic
# - Update transformation queries
# - Add data validation
# - Test extensively on staging

# 4. Re-apply migration
git push origin main
```

### Migration Examples

**Safe (Non-Blocking):**
```sql
-- Add new column with default
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create new table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
```

**Careful (Requires Monitoring):**
```sql
-- Add constraint (may fail if data violates constraint)
ALTER TABLE companies ADD CONSTRAINT check_status 
  CHECK (status IN ('active', 'inactive'));

-- Rename column (breaks old code, needs careful deployment)
ALTER TABLE users RENAME COLUMN phone TO phone_number;
```

**Dangerous (Requires Rollback Plan):**
```sql
-- Drop column (irreversible, only after code no longer uses it)
ALTER TABLE users DROP COLUMN deprecated_field CASCADE;

-- Drop table (only if completely sure)
DROP TABLE IF EXISTS old_feature_table CASCADE;

-- Rebuild large table (causes downtime)
REINDEX TABLE large_table CONCURRENTLY;
```

### Zero-Downtime Migration Strategy

For large schema changes:

1. **Phase 1: Add Parallel Structure**
   ```sql
   -- Create new table alongside old one
   CREATE TABLE users_v2 AS SELECT * FROM users WHERE FALSE;
   ALTER TABLE users_v2 ADD CONSTRAINT pk_users_v2 PRIMARY KEY (id);
   ```

2. **Phase 2: Sync Data**
   ```sql
   -- Migrate data in batches (during low-traffic window)
   INSERT INTO users_v2 
   SELECT * FROM users 
   WHERE id > (SELECT COALESCE(MAX(id), 0) FROM users_v2)
   LIMIT 1000;
   ```

3. **Phase 3: Verify & Switch**
   ```sql
   -- Update application code to use users_v2
   -- Deploy code change
   ```

4. **Phase 4: Cleanup**
   ```sql
   -- Remove old table after verifying no issues
   DROP TABLE users;
   ALTER TABLE users_v2 RENAME TO users;
   ```

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

Use Vercel dashboard for instant rollback:

```bash
# 1. Identify last stable deployment
open https://vercel.com/dashboard/ipoready/deployments

# 2. Click on deployment → [three dots] → "Promote to Production"
# 3. Confirm promotion

# This instantly reverts:
# - Code to previous version
# - Environment at time of deployment
# - Does NOT revert database changes (see section below)
```

### Git-Based Rollback (with Database Reset if needed)

#### Option A: Revert Single Commit

```bash
# If issue is in latest commit only
git revert HEAD --no-edit
git push origin main

# Vercel automatically redeploys
# Database rollback: See "Database Rollback" section
```

#### Option B: Reset to Previous Stable Version

```bash
# Find stable commit
git log --oneline | head -10
# Example output:
# abc1234 Release: v1.2.3 - Production deployment
# def5678 Release: v1.2.2 - Stable
# ghi9012 Release: v1.2.1 - Previous

# Reset to stable commit
git reset --hard def5678
git push --force origin main

# WARNING: --force rewrite history. Only for emergencies.
# Team will need to rebase local branches after this.

# Vercel automatically redeploys to that commit
```

#### Option C: Release Rollback Branch

```bash
# Create rollback branch from stable version
git checkout -b rollback/emergency def5678
git push origin rollback/emergency

# Then merge back:
git checkout main
git merge rollback/emergency --no-ff -m "Rollback to v1.2.2"
git push origin main

# This preserves git history (preferred approach)
```

### Database Rollback

#### Scenario A: Migration Failed, Need to Revert Schema

```bash
# 1. Check which migrations have run
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;"

# 2. Revert the failed migration
# Option 1: Neon branch restore (if enabled)
neonctl branch restore --branch main --checkpoint-id <checkpoint-id>
# This restores database to point-in-time before migration

# Option 2: Manual rollback script
psql "$DATABASE_URL" < rollback_XXX_failed_migration.sql

# 3. Delete failed migration record
psql "$DATABASE_URL" -c "DELETE FROM migrations WHERE name = '021_failed_migration.sql';"

# 4. Fix migration file
# Edit migrations/021_failed_migration.sql

# 5. Redeploy
git push origin main
```

#### Scenario B: Data Corruption After Successful Migration

```bash
# 1. Identify scope of corruption
psql "$DATABASE_URL" << 'EOF'
SELECT COUNT(*) as total FROM table_name;
SELECT COUNT(*) as corrupted FROM table_name WHERE status='corrupted';
EOF

# 2. If small dataset: Manual fix
psql "$DATABASE_URL" << 'EOF'
-- Update corrupted records
UPDATE table_name SET status='correct' WHERE status='corrupted';

-- Or delete and reimport
DELETE FROM table_name WHERE created_at > '2026-06-07 10:00:00';
EOF

# 3. If large dataset: Full rollback
# Use Neon point-in-time recovery
neonctl branch restore --branch main --timestamp "2026-06-07T09:00:00Z"

# 4. Verify data integrity
psql "$DATABASE_URL" -c "SELECT COUNT(*), SUM(amount) FROM transactions;"
# Compare with known good values

# 5. If rollback needed:
# Revert code AND re-run with fixed migration
git revert HEAD --no-edit
git push origin main
```

### Zero-Downtime Rollback Strategy

For critical production issues with active users:

```bash
# 1. Deploy old code to different URL
# Vercel supports preview deployments
vercel --prod --scope=ipoready-staging

# 2. Test old version on staging
# Verify it works with current database state

# 3. Switch traffic to stable version
# Use Vercel routing or edge function to redirect traffic

# 4. After verification, promote to production
# Only when confident in rollback

# 5. Communicate with users
# Transparent communication about incident
```

### Communication & Rollback Notification

When rollback occurs:

```bash
# 1. Update status page
# Set to "Degraded Performance" or "Major Outage"
# Message: "Investigating deployment issue, rolling back to previous version"

# 2. Notify stakeholders
# Slack: #incident or #devops
# Email: ops team

# 3. Post-incident communication
# Share root cause analysis
# Explain remediation steps
# Prevent future occurrences

# 4. Document in incident log
echo "[2026-06-07 15:30] Rollback triggered - Migration failed" >> INCIDENT_LOG.md
echo "Reason: Column constraint violated on existing data" >> INCIDENT_LOG.md
echo "Time to Rollback: 4 minutes" >> INCIDENT_LOG.md
echo "Data Loss: None (rolled back to checkpoint)" >> INCIDENT_LOG.md
```

---

## Scaling Strategy

### Horizontal Scaling (Compute)

**Vercel Automatic Scaling:**
- Vercel automatically scales compute nodes based on traffic
- No configuration needed
- Handles 1-1000x traffic spikes transparently
- Cold start time: ~1-2 seconds per new function invocation

**Monitor Scaling Metrics:**
```bash
# Check Vercel Analytics
open https://vercel.com/dashboard/ipoready/analytics

# Key metrics:
# - Request count (should increase/decrease with traffic)
# - Response time (should stay stable despite traffic)
# - Function execution time (should be consistent)
# - Memory usage (should scale with traffic)
```

**When to Upgrade Plan:**
- Sustained traffic > current plan limits
- Response times degrading (> 1s p95)
- Frequent timeout errors
- High compute costs

### Vertical Scaling (Database)

**Neon Serverless Database:**
- Neon automatically manages compute based on connections
- Connection pooling via PgBouncer

**Monitor Database Performance:**
```bash
# Check active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"
# Should be < 100 connections in normal operation

# Check query performance
psql "$DATABASE_URL" -c "
  SELECT query, calls, mean_exec_time, max_exec_time 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;
"

# Check table sizes
psql "$DATABASE_URL" -c "
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
  FROM pg_tables 
  WHERE schemaname='public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

**When to Scale Database:**
- Connection limit approaching (200+ concurrent)
- Query latency increasing (> 500ms p95)
- Large table growth (approaching storage limit)

**Neon Scaling Steps:**
```bash
# 1. View current compute resources
neonctl projects list-compute-endpoints --project-id <project-id>

# 2. Scale compute (if needed)
neonctl projects update-compute-endpoint \
  --project-id <project-id> \
  --endpoint-id <endpoint-id> \
  --compute-units 4  # Increase from default

# 3. Monitor impact
# Check query performance after scaling
psql "$DATABASE_URL" -c "SELECT version();"
```

**Connection Pooling Optimization:**
```bash
# Current pooling configuration (in DATABASE_URL):
# sslmode=require&channel_binding=require

# Neon provides pooled connection via:
# postgresql://user:password@host/dbname?sslmode=require (pooler endpoint)
# vs direct endpoint for admin tasks

# Configure application to use pooler for normal queries:
# Use default DATABASE_URL in application
# All queries route through PgBouncer pool
```

### Caching Strategy

**Edge Caching (Next.js + Vercel CDN):**

```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'private, no-cache, no-store' },
      ],
    },
    {
      source: '/(pricing|resources)/:path*',
      headers: [
        { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=3600' },
      ],
    },
  ]
}
```

**Application-Level Caching:**
```typescript
// Use Redis for session/user caching (optional upgrade)
// import Redis from 'redis'
// const cache = await redis.get(key)
```

**Database Query Caching:**
- Already optimized via Neon connection pooling
- Consider caching for read-heavy reports/dashboards

### Load Testing Preparation

```bash
# 1. Load test staging environment
npm run load-test -- --target https://staging.ipoready.ai

# Expected results:
# - p50 response time: < 500ms
# - p95 response time: < 1000ms
# - p99 response time: < 2000ms
# - Error rate: < 0.1%

# 2. Identify bottlenecks
# Run again with profiling:
NODE_DEBUG=* npm run load-test 2>&1 | grep "slow_query"

# 3. Optimize before production deployment
# - Add database indices
# - Implement caching
# - Optimize images/assets
# - Reduce third-party calls
```

### Traffic Spike Handling

**Automatic:**
- Vercel scales compute automatically
- Neon scales database automatically
- CDN caches static content

**Monitoring During Spikes:**
```bash
# Monitor in real-time
watch -n 1 'curl -s https://www.ipoready.ai/api/health | jq .response_time'

# Check Vercel dashboard
open https://vercel.com/dashboard/ipoready/analytics

# Expected behavior:
# - Response time remains stable (Vercel auto-scaling)
# - Error rate stays < 1%
# - All pages load successfully
```

**Manual Intervention (if needed):**
```bash
# 1. Increase Neon compute
neonctl projects update-compute-endpoint \
  --project-id <project-id> \
  --endpoint-id <endpoint-id> \
  --compute-units 8

# 2. Enable emergency mode
# Set feature flag: EMERGENCY_CACHE_MODE=true
vercel env add EMERGENCY_CACHE_MODE true

# 3. Monitor resolution
# Once traffic stabilizes, restore normal settings
vercel env rm EMERGENCY_CACHE_MODE
```

---

## Backup & Recovery Procedures

### Backup Strategy

**Automated Backups (Neon Default):**
- Neon automatically backs up database every 6 hours
- Point-in-time recovery available up to 7 days
- No manual configuration required

**File Storage Backups:**
```bash
# Vercel Blob automatic versioning
# All file uploads retained with version history

# S3 backup (if using S3 for additional storage)
aws s3 cp s3://ipoready-documents \
  s3://ipoready-documents-backup \
  --recursive \
  --storage-class GLACIER
```

**Application Data Backups:**
```bash
# Daily database export (recommended)
pg_dump "$DATABASE_URL" | gzip > backups/ipoready_$(date +%Y%m%d_%H%M%S).sql.gz

# Store in secure location with encryption
gpg --symmetric --cipher-algo AES256 backups/ipoready_*.sql.gz
```

### Backup Verification

```bash
# Weekly backup restore test
# Create temporary Neon branch
neonctl branch create --parent-id main \
  --branch-name test-restore-$(date +%Y%m%d)

# Verify restore integrity
psql "<test-branch-url>" -c "
  SELECT 
    schemaname, 
    COUNT(*) as table_count
  FROM information_schema.tables 
  WHERE table_schema='public'
  GROUP BY schemaname;
"

# Delete test branch
neonctl branch delete --branch-id <branch-id>
```

### Manual Database Backup

```bash
# 1. Connect to production database
export PGPASSWORD=<password>

# 2. Export full database
pg_dump \
  --host $(echo "$DATABASE_URL" | sed 's/.*@\([^\/]*\).*/\1/') \
  --username user \
  --database ipoready \
  > ipoready_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Verify backup
file ipoready_backup_*.sql
grep -c "CREATE TABLE" ipoready_backup_*.sql

# 4. Compress and encrypt
gzip ipoready_backup_*.sql
gpg --symmetric --cipher-algo AES256 ipoready_backup_*.sql.gz

# 5. Store in secure location (off-site if possible)
# AWS S3 Glacier, Google Cloud Storage, etc.
```

### Point-in-Time Recovery

```bash
# 1. Identify recovery point
# Using Neon restore functionality

neonctl projects list-timelines --project-id <project-id>
# Shows available restore points

# 2. Create recovery branch
neonctl branch create \
  --parent-id main \
  --branch-name recovery-$(date +%s) \
  --restore-timestamp "2026-06-07T10:00:00Z"

# 3. Verify recovered data
psql "<recovery-branch-url>" -c "SELECT * FROM companies LIMIT 1;"

# 4. Promote recovery branch to main (if verified)
neonctl branch update --branch-id main \
  --set-as-primary-branch <recovery-branch-id>

# 5. Delete old branch
neonctl branch delete --branch-id <old-branch-id>
```

### Disaster Recovery Scenarios

#### Scenario 1: Accidental Data Deletion

```bash
# 1. STOP the application (prevent further deletions)
vercel deploy --prod --env NODE_ENV=maintenance

# 2. Identify deletion time
# Check logs for DELETE query

# 3. Recover from backup
neonctl branch create \
  --parent-id main \
  --branch-name recovery-delete-$(date +%s) \
  --restore-timestamp "2026-06-07T09:45:00Z"  # Before deletion

# 4. Verify recovery
psql "<recovery-url>" -c "SELECT COUNT(*) FROM deleted_table;"

# 5. Switch application to recovery database
# Update DATABASE_URL to recovery branch

# 6. Monitor for issues
# Check if all users' data is intact

# 7. Once verified, promote recovery to main
# Delete old branch
```

#### Scenario 2: Corrupted Database

```bash
# 1. Diagnose corruption
psql "$DATABASE_URL" -c "
  SELECT * FROM pg_stat_user_tables 
  WHERE last_vacuum IS NULL AND n_live_tup > 0;
"

# 2. Attempt repair
VACUUM ANALYZE;
REINDEX DATABASE ipoready;

# 3. If repair fails, restore from backup
# Use Neon restore (see above)

# 4. Monitor after recovery
# Run consistency checks
psql "$DATABASE_URL" -c "
  SELECT table_name, 
    (SELECT COUNT(*) FROM table_name) as count
  FROM information_schema.tables 
  WHERE table_schema='public';
"
```

---

## Disaster Recovery Plan

### RTO & RPO Targets

| Component | RTO | RPO | Recovery Method |
|-----------|-----|-----|-----------------|
| Web Application | 15 minutes | N/A | Vercel rollback + redeploy |
| Database | 30 minutes | 6 hours | Neon point-in-time recovery |
| File Storage | 1 hour | N/A | Blob version history |
| Email Service | 2 hours | N/A | Queue retry + resend |

### Disaster Scenarios & Response

#### Scenario 1: Complete Data Center Outage

**Probability:** Very low (Vercel has multi-region redundancy)

**Response:**
```bash
# 1. Activate secondary region
# Contact Vercel support for fail-over
open https://vercel.com/dashboard/ipoready/settings

# 2. Database failover
# Neon automatically handles with read replicas
# (if configured)

# 3. DNS failover
# Update Route53/DNS to secondary URL
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "ipoready.ai",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{"Value": "secondary-ip"}]
      }
    }]
  }'

# 4. Verify application online
curl https://www.ipoready.ai/api/health

# 5. Communicate with customers
# Update status page, notify stakeholders
```

#### Scenario 2: Database Unavailable

**Causes:** Neon outage, connection pool exhausted, network partition

**Immediate Actions:**
```bash
# 1. Check database status
psql "$DATABASE_URL" -c "SELECT 1;"
# If fails: proceed to recovery

# 2. Check connection pool
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# 3. If pool exhausted: restart applications
vercel deployments list
vercel redeploy <deployment-id>

# 4. If database down: activate backup
# Use previously restored branch
export DATABASE_URL="<backup-branch-url>"
```

**Recovery Process:**
```bash
# 1. Create recovery branch from latest backup
neonctl branch create \
  --parent-id main \
  --branch-name recovery-outage-$(date +%s) \
  --restore-timestamp "$(date -u -Iseconds)"

# 2. Verify recovery branch
psql "<recovery-url>" -c "SELECT COUNT(*) FROM users;"

# 3. Update application to use recovery branch
vercel env add DATABASE_URL "<recovery-url>"

# 4. Verify application stability
curl https://www.ipoready.ai/api/health

# 5. Restore to main database once repaired
# Delete recovery branch only after Neon comes back online
```

#### Scenario 3: Ransomware / Data Breach

**Immediate Actions:**
```bash
# 1. Isolate affected systems
# Take database offline to prevent data exfil
vercel env add EMERGENCY_SHUTDOWN true

# 2. Notify security team
# Email: security@ipoready.ai
# Phone: [on-call security engineer]

# 3. Assess scope
# Check access logs for suspicious activity
psql "$DATABASE_URL" -c "
  SELECT * FROM audit_log 
  WHERE timestamp > now() - interval '24 hours'
  ORDER BY timestamp DESC;
"

# 4. Activate incident response
# Follow company incident response plan
# Engage forensics team if needed

# 5. Recovery from backup
# Restore to clean database snapshot
# See "Point-in-Time Recovery" above
```

### Disaster Recovery Drills

**Quarterly DR Drills (Practice Exercises):**

```bash
# Q1 2026 Drill: Database Recovery
# Objective: Verify ability to recover from complete data loss

# 1. Create test database clone
neonctl branch create --parent-id main --branch-name dr-drill-q1-2026

# 2. Simulate data loss
psql "<test-url>" -c "DELETE FROM users WHERE created_at < now() - interval '30 days';"

# 3. Execute recovery procedure
# Restore from backup to different branch

# 4. Verify recovery (all data restored)
# Confirm no data loss

# 5. Document results
echo "DR Drill Q1 2026 Results" > DR_DRILL_Q1_2026.md
echo "RTO Achieved: 18 minutes" >> DR_DRILL_Q1_2026.md
echo "RPO Achieved: 4 hours" >> DR_DRILL_Q1_2026.md

# Q2 2026 Drill: Application Recovery
# Objective: Verify ability to recover application from corruption

# 1. Deploy broken version to staging
# Simulate code-level corruption

# 2. Execute rollback procedure
# Practice quick rollback workflow

# 3. Measure time to recovery
# Target: < 5 minutes

# 4. Document lessons learned
```

---

## Monitoring & Alerting

### Monitoring Stack

**Vercel Built-in Monitoring:**
- Real User Monitoring (RUM) via Vercel Analytics
- Error tracking with Edge/Function error reporting
- Performance monitoring (Web Vitals)
- Request tracing

**Application Monitoring:**
- Sentry for error tracking
- Custom logging with structured JSON
- Database query monitoring

**Infrastructure Monitoring:**
- Neon dashboard for database metrics
- Vercel dashboard for deployment/function metrics

### Key Metrics to Monitor

#### Application Performance

```bash
# 1. Response Time (Vercel Analytics)
# Target: p95 < 1 second
# Alert: p95 > 2 seconds for 5 minutes

# 2. Error Rate
# Target: < 0.1%
# Alert: > 1% for 5 minutes

# 3. Request Count
# Tracks: Traffic trends, DDoS indicators
# Alert: 10x normal spike

# 4. Core Web Vitals
# LCP (Largest Contentful Paint): < 2.5s
# FID (First Input Delay): < 100ms
# CLS (Cumulative Layout Shift): < 0.1

# Monitor via:
open https://vercel.com/dashboard/ipoready/analytics
```

#### Database Performance

```bash
# 1. Query Latency
# p50 (median): < 100ms
# p95 (95th percentile): < 500ms
# p99 (99th percentile): < 1000ms

# 2. Connection Count
# Active connections: < 100
# Idle connections: < 50
# Alert: > 150 active

# 3. Cache Hit Ratio
# Target: > 95% for read-heavy queries
# Monitor: pg_stat_statements

# 4. Table Size Growth
# Track largest tables
# Alert: > 10GB in any table

# Query monitoring:
psql "$DATABASE_URL" << 'EOF'
SELECT 
  query,
  mean_exec_time as avg_ms,
  max_exec_time as max_ms,
  calls
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 20;
EOF
```

#### Business Metrics

```bash
# 1. User Sign-ups
# Daily, weekly, monthly trends
# Alert: > 30% drop vs. 7-day average

# 2. Payment Success Rate
# Stripe webhook success rate
# Alert: < 99% success rate

# 3. Error Budget (per service tier)
# Calculate: (Uptime SLA - Actual) × Time Period
# Example: 99.9% SLA × 30 days = ~43 minutes of allowed downtime
```

### Alert Configuration

**Setup Alerts (via external service or Vercel):**

```bash
# Option 1: Sentry (Error Tracking)
# All unhandled exceptions automatically captured

# Setup:
npm install @sentry/nextjs

# Configuration in app:
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})

# Alerts:
# - New error type
# - Error spike (> 10x baseline)
# - Critical errors (HTTP 500)

# Option 2: PagerDuty Integration
# Escalate critical alerts to on-call team

# Option 3: Slack Notifications
# Post alerts to #incident channel
```

**Alert Thresholds:**

```
CRITICAL (immediate page/call):
  - HTTP 5xx error rate > 5% for 2 minutes
  - Database connection fails for 1 minute
  - Response time p95 > 5 seconds for 5 minutes
  - Deployment stuck/failing
  - Stripe webhook failures (3+ consecutive failures)

HIGH (alert ops team):
  - HTTP 5xx error rate > 1% for 5 minutes
  - Response time p95 > 2 seconds for 10 minutes
  - Database query > 10 seconds
  - Neon compute restarting
  - API key rate limit approaching

MEDIUM (log for review):
  - Error rate > 0.1%
  - Slow query (> 1 second)
  - Large request spike
  - Memory usage > 80%

LOW (informational):
  - Deployment completed
  - Backup completed
  - New feature flag enabled
```

### Logging Strategy

**Structured Logging:**

```typescript
// Use structured JSON logging for searchability
logger.info('user_signup', {
  user_id: userId,
  email: userEmail,
  timestamp: new Date().toISOString(),
  source: 'api',
  status: 'success'
})

// Sentry captures automatically:
logger.error('payment_failed', {
  user_id: userId,
  stripe_error: error.message,
  amount: amount,
  currency: currency
})
```

**Log Retention:**
- Production logs: 30 days in Vercel
- Archive to S3 Glacier: 7 years (for compliance)
- Sensitive data: PII redacted in all logs

**Log Analysis:**

```bash
# Check application logs (Vercel)
vercel logs [deployment-id]

# Check function execution logs
vercel logs --follow

# Search for errors
vercel logs | grep ERROR

# Export logs for analysis
vercel logs --export > logs_$(date +%Y%m%d).json
```

---

## Incident Response Playbook

### Incident Classification

| Severity | Impact | Resolution Time | Escalation |
|----------|--------|-----------------|------------|
| P1 (Critical) | All users affected, no workaround | < 30 min | CEO + CTO + On-call |
| P2 (High) | Multiple users/regions affected | < 2 hours | VP Eng + On-call |
| P3 (Medium) | Single user or minor feature broken | < 4 hours | Engineering lead |
| P4 (Low) | Cosmetic or workaround available | < 1 day | Next sprint |

### Detection & Assessment

**Automatic Detection:**
- Sentry error alerts
- Vercel error notifications
- PagerDuty integration
- Custom dashboards

**Manual Detection:**
- Customer support tickets
- Slack #incident channel
- Ping/uptime monitoring
- Manual testing

**Assessment (First 5 Minutes):**

```bash
# 1. Verify incident is real
curl -I https://www.ipoready.ai/
# Check response code and time

# 2. Check Vercel status
open https://vercel.com/dashboard/ipoready

# 3. Check database status
psql "$DATABASE_URL" -c "SELECT 1;"

# 4. Check recent deployments
vercel deployments list --limit 5

# 5. Check error tracking
open https://sentry.io/projects/ipoready

# 6. Determine scope
# - How many users affected?
# - Which features broken?
# - Is it data-related or code-related?

# 7. Assign severity
# Use classification above

# 8. Page on-call engineer
# Include severity level and brief description
```

### Response Procedures

#### Phase 1: Stabilization (First 15 minutes)

**If database is down:**
```bash
# 1. Switch to read-only mode
vercel env add EMERGENCY_READ_ONLY true

# 2. Redirect writes to cache/queue
# Let users know via banner: "Limited functionality"

# 3. Restore from backup
neonctl branch create --parent-id main \
  --branch-name recovery-$(date +%s) \
  --restore-timestamp "now"

# 4. Switch DNS to recovery branch
export DATABASE_URL="<recovery-url>"
vercel env add DATABASE_URL "<recovery-url>"
```

**If application code is broken:**
```bash
# 1. Immediate rollback
git revert HEAD --no-edit
git push origin main

# 2. Monitor recovery
curl https://www.ipoready.ai/api/health

# 3. Notify users
# Status page: "Deploying fix..."

# 4. Once stable, proceed to root cause
```

**If traffic spike:**
```bash
# 1. Increase Neon compute
neonctl projects update-compute-endpoint \
  --project-id <project-id> \
  --compute-units 8

# 2. Enable aggressive caching
vercel env add CACHE_MODE aggressive

# 3. Monitor recovery
watch -n 1 'curl -s https://www.ipoready.ai/api/health | jq .response_time'
```

#### Phase 2: Diagnosis (15-60 minutes)

Once stabilized, identify root cause:

```bash
# 1. Check recent code changes
git log --oneline -10

# 2. Check database query logs
psql "$DATABASE_URL" -c "
  SELECT query, mean_exec_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC LIMIT 10;
"

# 3. Check infrastructure metrics
# - CPU usage
# - Memory usage
# - Disk usage
# - Network traffic

# 4. Check third-party services
# - Stripe status: https://status.stripe.com
# - Twilio status: https://www.twiliostatus.com
# - Resend status: Check status page

# 5. Check application logs
vercel logs --limit 100 | tail -50

# 6. Document findings
echo "Root Cause: [description]" >> INCIDENT_LOG.md
echo "Timeline: [events with timestamps]" >> INCIDENT_LOG.md
echo "Impact: [number of users, duration]" >> INCIDENT_LOG.md
```

#### Phase 3: Resolution (as needed)

Implement fix based on root cause:

```bash
# 1. If code issue: Deploy fix
git fix --message "Fix: [issue]"
git push origin main

# 2. If database issue: Optimize queries
# Add index, optimize query, etc.

# 3. If infrastructure: Scale or maintain
# Add resources, tweak configuration

# 4. Verify fix works
curl https://www.ipoready.ai/api/health

# 5. Update status page
# "All services operational"

# 6. Notify stakeholders
# Email, Slack, dashboard message
```

#### Phase 4: Post-Incident (same day)

```bash
# 1. Write incident report (30 min)
# Timeline, root cause, impact, fixes

# 2. Schedule post-mortem (next day)
# Discuss what happened and prevention

# 3. Create follow-up tasks
# - Implement monitoring for this type of issue
# - Add test case to prevent recurrence
# - Update runbooks with learnings

# 4. Communicate with customers
# Transparency about incident
# Apology if applicable
# Prevention measures

# 5. Update documentation
# Add this incident to playbook
# Update runbooks based on learnings
```

### Incident Communication Template

```markdown
# Incident Report: [Issue Description]

**Severity:** P[1-4]
**Date:** 2026-06-07
**Duration:** 15 minutes
**Affected Users:** ~50 users
**Root Cause:** [Brief description]

## Timeline
- 15:30 UTC - Incident detected via Sentry alert
- 15:31 UTC - On-call paged, incident declared P2
- 15:32 UTC - Root cause identified: Database connection timeout
- 15:35 UTC - Rollback deployed
- 15:45 UTC - Verified all systems recovered

## Root Cause Analysis
[Detailed explanation of what caused the incident]

## Resolution Steps
[What was done to fix it]

## Prevention
- [ ] Add alerting for database connection pool saturation
- [ ] Implement connection pool monitoring
- [ ] Load test to find connection limits
- [ ] Document scaling procedures
```

---

## Compliance & Audit

### Data Residency & Compliance

**Jurisdiction:** United States (US-East region)

```bash
# Verify database region
psql "$DATABASE_URL" -c "SELECT inet_server_addr();"
# Should return US-East IP

# Document in compliance register
echo "Database: Neon PostgreSQL, US-East region, encrypted in transit/at rest" >> COMPLIANCE_REGISTER.md
```

**Encryption:**
- TLS 1.2+ for all data in transit
- Encryption at rest via Neon
- File storage encrypted via Vercel Blob

### Audit Logging

```bash
# Enable audit logging for sensitive operations
psql "$DATABASE_URL" << 'EOF'
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255),
  operation VARCHAR(10), -- INSERT, UPDATE, DELETE
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create triggers on sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, record_id, old_values, new_values, user_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW),
    current_user_id()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
CREATE TRIGGER users_audit
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
EOF

# Query audit log
psql "$DATABASE_URL" -c "SELECT * FROM audit_log WHERE table_name='users' AND timestamp > now() - interval '24 hours';"
```

### Compliance Certifications

| Certification | Status | Renewal |
|--------------|--------|---------|
| SOC 2 Type II | Planned | Annual |
| GDPR | Compliant | N/A |
| CCPA | Compliant | N/A |
| ISO 27001 | Planned | Annual |

### Security Audits

**Quarterly Security Reviews:**
```bash
# 1. Dependency audit
npm audit
npm audit fix

# 2. OWASP Top 10 check
# - SQL Injection: Use parameterized queries
# - XSS: Next.js built-in protection
# - CSRF: NextAuth handles
# - Broken auth: Regular security audits
# - Sensitive data exposure: TLS + encryption

# 3. Code review for security issues
git log --since="3 months ago" | grep -i "security\|fix\|vuln"

# 4. Update this document
```

---

## Troubleshooting Guide

### General Troubleshooting Workflow

```bash
# 1. Gather context
DATE_ERROR=$(date -u -Iseconds)
AFFECTED_FEATURE="[describe what's broken]"
ERROR_MESSAGE="[exact error message]"
AFFECTED_USERS="[how many users affected]"

# 2. Check current status
curl -I https://www.ipoready.ai/
curl https://www.ipoready.ai/api/health | jq .

# 3. Check logs
vercel logs --follow | grep ERROR

# 4. Check related systems
# Database
psql "$DATABASE_URL" -c "SELECT 1;"

# Third-party services
# Stripe: https://status.stripe.com
# Twilio: Status page
# Resend: Status page

# 5. Search this guide
# Find matching symptom in troubleshooting section
```

### Common Issues & Solutions

#### Issue 1: HTTP 500 Error on All Pages

**Possible Causes:**
- Database connection failed
- Environment variable missing
- Uncaught exception in code
- Out of memory

**Diagnosis:**
```bash
# 1. Check database
psql "$DATABASE_URL" -c "SELECT 1;"
# If fails → Database issue (see below)

# 2. Check environment
vercel env ls | grep DATABASE_URL
# If missing → Missing environment variable

# 3. Check recent deployments
vercel deployments list --limit 5

# 4. Check error logs
vercel logs --limit 50 | grep -i error

# 5. Check Sentry
open https://sentry.io/projects/ipoready
```

**Solutions:**

```bash
# If database connection issue:
# Option 1: Restart Neon compute
neonctl projects update-compute-endpoint \
  --project-id <project-id> \
  --endpoint-id <endpoint-id>

# Option 2: Check DATABASE_URL format
# Should be: postgresql://user:pass@host/db?sslmode=require
echo $DATABASE_URL | grep -o "postgresql://.*"

# If environment variable missing:
# Add to Vercel
vercel env add MISSING_VAR value

# If code issue:
# Rollback to previous version
git revert HEAD --no-edit
git push origin main
```

#### Issue 2: Slow Response Times (> 2 seconds)

**Possible Causes:**
- Slow database query
- Large payload
- Third-party service latency
- High traffic

**Diagnosis:**
```bash
# 1. Check database performance
psql "$DATABASE_URL" << 'EOF'
SELECT query, mean_exec_time, max_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

# 2. Check API response time
time curl -s https://www.ipoready.ai/api/companies | wc -l

# 3. Check database load
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# 4. Check file size
# Large files take time to transfer
curl -I https://www.ipoready.ai/api/reports/export

# 5. Check traffic
# High concurrent users?
# Monitor via Vercel Analytics
```

**Solutions:**

```bash
# If slow query:
# 1. Identify slow query
psql "$DATABASE_URL" -c "SELECT query FROM pg_stat_statements WHERE mean_exec_time > 1000;"

# 2. Analyze query
EXPLAIN ANALYZE SELECT * FROM slow_table WHERE condition;

# 3. Add index if needed
CREATE INDEX idx_fast ON slow_table(column);

# If large payload:
# 1. Reduce data returned
# Use pagination: LIMIT 50

# 2. Compress response
# Already done by Next.js (compress: true in config)

# If high traffic:
# 1. Scale compute
neonctl projects update-compute-endpoint --compute-units 8

# 2. Enable caching
vercel env add CACHE_MODE aggressive
```

#### Issue 3: Database Connection Errors

**Errors:**
- `connect ECONNREFUSED`
- `fatal: password authentication failed`
- `FATAL: remaining connection slots reserved for non-replication superuser connections`

**Diagnosis:**
```bash
# 1. Test connectivity
psql "$DATABASE_URL" -c "SELECT 1;"

# 2. Check connection string
echo $DATABASE_URL

# 3. Check Neon status
neonctl projects describe-project --project-id <project-id>

# 4. Check connection count
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# 5. Check recent errors in logs
vercel logs | grep -i "connection\|database"
```

**Solutions:**

```bash
# If connection refused:
# 1. Restart Neon compute
neonctl projects update-compute-endpoint \
  --project-id <project-id> \
  --endpoint-id <endpoint-id>

# 2. Verify connection string
# Format: postgresql://user:password@host/dbname?sslmode=require
# Must use: host.neon.tech (not localhost)

# If authentication failed:
# 1. Reset password in Neon
# Go to: https://console.neon.tech → Project → Settings

# If connection slots full:
# 1. Kill idle connections
psql "$DATABASE_URL" << 'EOF'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < now() - interval '1 hour';
EOF

# 2. Increase compute
neonctl projects update-compute-endpoint --compute-units 8
```

#### Issue 4: Deployment Fails

**Errors:**
- Build timeout
- Migration failure
- TypeScript error
- Dependency error

**Diagnosis:**
```bash
# 1. Check build logs
open https://vercel.com/dashboard/ipoready/deployments
# Click failed deployment → View logs

# 2. Check specific error
# Look for:
# - "ERR!" or "ERROR"
# - "TypeScript error"
# - "Migration failed"
# - "npm ERR"

# 3. Try build locally
npm ci
npm run build
# See full error output
```

**Solutions:**

```bash
# If build timeout:
# 1. Reduce build size
npm ls | grep -E "^├─|^│ └─" | sort -k2 -r | head -10
# Remove unused dependencies

# If migration fails:
# 1. Check migration syntax
cat migrations/XXX_failed.sql | head -20

# 2. Test locally
DATABASE_URL=<local-db> npm run db:migrate

# 3. Fix and re-deploy
# Edit migrations/XXX_failed.sql
git push origin main

# If TypeScript error:
# 1. Check error message
npm run type-check

# 2. Fix type error
# Usually in: src/app or src/lib

# If dependency error:
# 1. Clear cache
rm -rf node_modules package-lock.json

# 2. Reinstall
npm ci

# 3. Rebuild
npm run build
```

#### Issue 5: Authentication Not Working

**Symptoms:**
- Users can't login
- Sessions expire immediately
- OAuth redirects fail

**Diagnosis:**
```bash
# 1. Check NEXTAUTH_SECRET
# Is it set in Vercel?
vercel env show NEXTAUTH_SECRET

# 2. Check NEXTAUTH_URL
echo $NEXTAUTH_URL

# 3. Test auth endpoint
curl https://www.ipoready.ai/api/auth/signin

# 4. Check session cookie
# Browser DevTools → Application → Cookies
# Look for: __Secure-next-auth.session-token

# 5. Check logs
vercel logs | grep -i "auth\|session"
```

**Solutions:**

```bash
# If NEXTAUTH_SECRET missing:
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Add to Vercel
vercel env add NEXTAUTH_SECRET
# Paste new secret

# If OAuth redirect fails:
# 1. Check OAuth app configuration
# Google: https://console.cloud.google.com
# LinkedIn: https://www.linkedin.com/developers

# 2. Verify redirect URI
# Should be: https://www.ipoready.ai/api/auth/callback/google

# 3. Verify client ID/secret in Vercel
vercel env show GOOGLE_CLIENT_ID

# If session expires immediately:
# 1. Check session timeout setting
# Default: 1 hour (production), 30 days (development)

# 2. Increase if needed
# Modify next-auth configuration in src/lib/auth.ts
```

#### Issue 6: File Upload Fails

**Symptoms:**
- Upload hangs
- "Invalid file type" error
- File too large

**Diagnosis:**
```bash
# 1. Check file size
ls -lh document.pdf

# 2. Check MIME type
file -b --mime-type document.pdf

# 3. Check upload endpoint
curl -I https://www.ipoready.ai/api/documents/upload

# 4. Test locally
npm run dev &
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "companyId=test"
```

**Solutions:**

```bash
# If file too large:
# 1. Compress file
gzip document.pdf

# 2. Upload compressed version
# API should decompress

# 3. Check size limit
# Currently: 50MB max
# Edit: src/app/api/documents/upload/route.ts

# If invalid MIME type:
# 1. Check MIME type
file -b --mime-type document.pdf

# 2. If MIME is correct but rejected:
# Add to whitelist in upload handler
# Allowed: PDF, DOC, DOCX, XLS, XLSX

# If upload hangs:
# 1. Check file size
# < 50MB

# 2. Check network
# Slow connection?

# 3. Check Vercel Blob status
# May be service issue
```

---

## Quick Reference Commands

### Deployment
```bash
# Start deployment
git push origin main

# Monitor deployment
vercel list

# Rollback to previous version
git revert HEAD --no-edit && git push origin main

# Deploy via CLI
vercel --prod
```

### Database
```bash
# Run migrations
npm run db:migrate

# Connect to database
psql "$DATABASE_URL"

# Backup database
pg_dump "$DATABASE_URL" > backup.sql

# Restore from backup
psql "$DATABASE_URL" < backup.sql

# Create Neon branch
neonctl branch create --parent-id main --branch-name test-branch
```

### Monitoring
```bash
# Check health
curl https://www.ipoready.ai/api/health

# View logs
vercel logs --follow

# List deployments
vercel deployments list

# View environment variables
vercel env ls
```

### Emergency
```bash
# Stop application
vercel env add NODE_ENV maintenance

# Restart Neon compute
neonctl projects update-compute-endpoint --project-id <id> --endpoint-id <id>

# Get database status
psql "$DATABASE_URL" -c "SELECT version();"

# View active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Support & Escalation

### Support Channels

1. **Internal Issues:** Slack #ops or #devops
2. **Database Issues:** Neon support portal or Discord
3. **Deployment Issues:** Vercel support or status page
4. **Payment Issues:** Stripe dashboard or support
5. **Email Issues:** Resend dashboard

### Escalation Path

```
Level 1: On-call engineer (< 30 min)
  ↓ (if not resolved)
Level 2: Engineering manager (< 1 hour)
  ↓ (if not resolved)
Level 3: VP Engineering + CTO (< 2 hours)
  ↓ (if critical incident)
Level 4: Executive + Vendor support (immediate)
```

### Key URLs

| Resource | URL | Purpose |
|----------|-----|---------|
| Vercel Dashboard | https://vercel.com/dashboard/ipoready | Deployments, logs, settings |
| Neon Console | https://console.neon.tech | Database management |
| Sentry | https://sentry.io/projects/ipoready | Error tracking |
| Stripe Dashboard | https://dashboard.stripe.com | Payment processing |
| Status Page | https://status.vercel.com | Service status |
| Production Site | https://www.ipoready.ai | Live application |

---

**Document Owner:** DevOps/SRE Team  
**Last Updated:** June 7, 2026  
**Review Schedule:** Quarterly  
**Next Review:** September 7, 2026
