# IPOReady Production Deployment Guide

**Last Updated:** June 1, 2026  
**Status:** Active Production at https://www.ipoready.ai  
**Next Scheduled Deployment:** [To be updated with release date]

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Database Migrations](#database-migrations)
5. [Build & Testing](#build--testing)
6. [Deployment to Vercel](#deployment-to-vercel)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Incident Response](#monitoring--incident-response)
10. [Troubleshooting](#troubleshooting)

---

## Overview

IPOReady is a Next.js 14 application deployed on Vercel with a Neon PostgreSQL serverless database. The deployment workflow includes:
- Database schema migrations via Neon HTTP client
- Benchmark data seeding
- Production build compilation
- Vercel deployment with automatic domain routing
- Health checks and verification

**Key Technologies:**
- Frontend: Next.js 14.2.35 + TypeScript + Tailwind CSS v4
- Backend: Next.js API routes + Neon PostgreSQL
- Auth: NextAuth.js v4
- Hosting: Vercel
- Database: Neon (serverless Postgres with HTTP endpoint)

---

## Pre-Deployment Checklist

### 1. Code & Git
- [ ] All feature branches merged to `main`
- [ ] Latest commit has passed CI/CD pipeline
- [ ] No uncommitted changes in working directory
- [ ] CHANGELOG.md updated with release notes
- [ ] Version number bumped in `package.json` (if applicable)

### 2. Database
- [ ] Neon compute is online (check Neon console: https://console.neon.tech)
- [ ] Backup of production database created (if applicable)
- [ ] Migration scripts reviewed and tested locally
- [ ] Data seeders verified against schema changes

### 3. Environment & Secrets
- [ ] `.env.local` is present and contains:
  - `DATABASE_URL` (Neon pooler endpoint, format: `postgresql://user:pass@host/dbname`)
  - `STRIPE_PUBLIC_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (set to `https://www.ipoready.ai` in production)
  - All other required API keys for integrations
- [ ] Secrets are NOT committed to git
- [ ] Vercel environment variables are synchronized with local `.env.local`

### 4. Feature Readiness
- [ ] All features in this release have been QA tested
- [ ] No console errors in browser DevTools
- [ ] No TypeScript compilation errors
- [ ] Lighthouse performance score > 85
- [ ] Mobile responsiveness verified on iOS and Android

### 5. Third-Party Services
- [ ] Stripe account is configured (webhooks, test/live keys)
- [ ] Slack integration settings (if enabled)
- [ ] Email service credentials verified (SendGrid, etc.)
- [ ] Analytics (Vercel Analytics, Mixpanel, etc.) are configured

---

## Environment Setup

### Step 1: Install Dependencies
```bash
cd /Users/test/Documents/Claude/Projects/IPOReady
npm ci  # Use npm ci instead of npm install for reproducible builds
```

### Step 2: Verify Environment Variables
```bash
# Check that .env.local exists and contains all required keys
cat .env.local

# Verify DATABASE_URL points to Neon
echo $DATABASE_URL
# Expected format: postgresql://[user]:[password]@[region].aws.neon.tech/[dbname]?sslmode=require
```

### Step 3: Test Database Connectivity
```bash
# Quick connectivity test using node script
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT NOW() AS time\`.then(r => console.log('✓ Database online:', r[0].time)).catch(e => console.error('✗ Database error:', e.message));
"
```

**Expected Output:** `✓ Database online: 2026-06-01T...` or similar timestamp

**If connection fails:**
- Verify Neon compute is running: https://console.neon.tech → Project → Branches → Check "online" status
- Check DATABASE_URL format and credentials
- Confirm .env.local has correct endpoint (pooler vs. direct connection)

---

## Database Migrations

### Step 1: Review Pending Migrations
```bash
# List all migration files in order
ls -1 migrations/*.sql | sort
# Expected: 001 through 010 (or latest)

# Display summary of pending migrations
cat << EOF
Migration Summary:
- 008_slack_integration.sql: Slack messaging tables + users.slack_user_id
- 009_add_missing_holdings_table.sql: Holdings table for cap table
- 010_complete_cap_table_schema.sql: Full cap table schema (9 tables)
EOF
```

### Step 2: Run Migrations
```bash
# Run all pending migrations
npm run db:migrate

# Expected output:
# Migration 008/slack_integration.sql: ✓ Applied
# Migration 009/add_missing_holdings_table.sql: ✓ Applied
# Migration 010_complete_cap_table_schema.sql: ✓ Applied
# All migrations completed successfully!
```

**If migration fails:**
- Check error message in console
- Verify schema doesn't already have the table (use `\dt` in psql)
- If partial failure, run `npm run db:migrate` again (idempotent by design)
- Last resort: Contact Neon support if compute is not responding

### Step 3: Seed Benchmark Data
```bash
# Populate ipo_benchmarks and ipo_historical_data tables
npm run seed:benchmarks

# Expected output:
# Seeding IPO benchmarks... ✓
# Seeded 5 exchanges with benchmark data
# Seeded 50 historical IPO records
# Benchmark seeding complete!
```

### Step 4: Verify Database State
```bash
# Check that all tables exist
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name\`
  .then(r => { console.log('Tables:'); r.forEach(t => console.log('  -', t.table_name)); })
  .catch(e => console.error('Error:', e.message));
"
```

**Expected tables to include:**
- `cap_table_documents`, `share_classes_v2`, `shareholders`, `holdings`
- `vesting_schedules`, `cap_table_transactions`, `cap_table_scenarios`
- `cap_table_validation_rules`, `cap_table_validation_results`, `cap_table_audit_log`
- `ipo_benchmarks`, `ipo_historical_data`
- `slack_logs`, `slack_queue`, `slack_events`
- All existing tables (users, companies, etc.)

---

## Build & Testing

### Step 1: Production Build
```bash
# Clean previous builds
rm -rf .next

# Build for production
npm run build

# Expected output:
# ▲ Next.js 14.2.35
# Route (app)                              Size     First Load JS
# ○ /_not-found                            2.9 kB        92.1 kB
# ○ /api/...                              [dynamic]        92 kB
# ...
# ✓ Compiled successfully
```

**If build fails:**
- Check TypeScript errors: `npm run type-check`
- Check for missing dependencies: `npm ci`
- Check for webpack resolution errors (especially missing components)
- Review recent commits for breaking changes

### Step 2: Type Checking
```bash
npm run type-check
# Should output: ✓ No errors found
```

### Step 3: Lint Check
```bash
npm run lint
# Should output: ✓ All checks passed (or list only warnings)
```

### Step 4: Local Testing
```bash
# Start production server locally
npm run start

# In another terminal, run smoke tests
curl -s https://localhost:3000/ | grep -q "IPOReady" && echo "✓ Home page loads"
curl -s https://localhost:3000/api/health | jq . && echo "✓ Health check passes"
```

---

## Deployment to Vercel

### Option A: Automatic Deployment (Recommended)
```bash
# Push to main branch
git add .
git commit -m "Release: v1.0.0 - Production deployment"
git push origin main

# Vercel will automatically detect push and start deployment
# Monitor progress at: https://vercel.com/dashboard/ipoready
```

### Option B: Manual Deployment via CLI
```bash
# Install Vercel CLI if not present
npm install -g vercel

# Deploy to production
vercel --prod

# Follow prompts:
# ? Set up and deploy? Y
# ? Which scope? [Your Vercel account]
# ? Link to existing project? Y → IPOReady
# ? Override existing settings? N
```

### Expected Deployment Output
```
✓ Production Deployment
  URL: https://www.ipoready.ai
  Project: IPOReady
  Region: [iad/sfo/etc.]
  
  Deployment Complete: [timestamp]
  Duration: 2-5 minutes
```

### Vercel Configuration (Next.js Settings)
In Vercel dashboard → Project Settings → Build & Development:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm ci`
- **Node Version:** 18.x or 20.x

**Environment Variables in Vercel:**
Set in Vercel dashboard → Settings → Environment Variables:
```
DATABASE_URL = postgresql://[redacted]
STRIPE_PUBLIC_KEY = pk_live_[redacted]
STRIPE_SECRET_KEY = sk_live_[redacted]
STRIPE_WEBHOOK_SECRET = whsec_[redacted]
NEXTAUTH_SECRET = [random 32+ char string]
NEXTAUTH_URL = https://www.ipoready.ai
```

---

## Post-Deployment Verification

### Step 1: Access Production Site
```bash
# Open in browser
open https://www.ipoready.ai

# Or test via curl
curl -I https://www.ipoready.ai
# Expected: HTTP 200 OK
```

### Step 2: Check Key Pages Load
```bash
# List critical pages to verify
PAGES=(
  "https://www.ipoready.ai/"
  "https://www.ipoready.ai/dashboard"
  "https://www.ipoready.ai/pace"
  "https://www.ipoready.ai/cap-table"
  "https://www.ipoready.ai/signup"
  "https://www.ipoready.ai/login"
)

for page in "${PAGES[@]}"; do
  curl -s -o /dev/null -w "%{http_code}" "$page"
  [ $? -eq 200 ] && echo "✓ $page" || echo "✗ $page"
done
```

### Step 3: API Endpoints
```bash
# Health check endpoint
curl https://www.ipoready.ai/api/health | jq .

# Auth session check (requires logged-in session)
curl https://www.ipoready.ai/api/auth/session | jq .

# PACE scoring API
curl -X GET "https://www.ipoready.ai/api/pace/scores?companyId=[test-id]" \
  -H "Authorization: Bearer [session-token]" | jq .
```

### Step 4: Database Connectivity
```bash
# Test that production app can query database
# This happens automatically when pages load, but verify:
# 1. Open /dashboard in browser
# 2. Check that company data loads (no "Database error" messages)
# 3. Check browser console for any errors
```

### Step 5: Stripe Integration
```bash
# Verify Stripe webhook endpoint is accessible
curl -I https://www.ipoready.ai/api/webhooks/stripe
# Expected: HTTP 405 (POST required, not GET)
```

### Step 6: Authentication
```bash
# Test auth flow (manual):
# 1. Open https://www.ipoready.ai/login
# 2. Enter test credentials or use OAuth provider
# 3. Verify redirect to /dashboard after login
# 4. Check NextAuth session cookie is set: 
#    DevTools → Application → Cookies → __Secure-next-auth.session-token
```

### Step 7: Vercel Analytics
Go to https://vercel.com/dashboard/ipoready → Analytics:
- [ ] Core Web Vitals are healthy (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] No 5xx errors in the last 1 hour
- [ ] Request count > 0 (if site is receiving traffic)

---

## Rollback Procedures

### Scenario 1: Critical Bug in New Deployment
```bash
# Option A: Rollback to previous Vercel deployment
# 1. Open https://vercel.com/dashboard/ipoready/deployments
# 2. Find the previous stable deployment
# 3. Click three dots → Promote to Production
# 4. Confirm rollback

# Option B: Manual rollback via git
git log --oneline | head -5
# Find the last stable commit
git revert HEAD --no-edit
git push origin main
# Vercel will redeploy the reverted commit
```

### Scenario 2: Database Migration Failed
```bash
# If migration partially failed:
# 1. Check which tables exist
# 2. Manually run remaining migrations:

npm run db:migrate

# 3. If specific migration is broken, check Neon backup
# 4. Restore from backup if necessary (contact Neon support)
```

### Scenario 3: Environment Variable Missing
```bash
# Add missing variable to Vercel
# 1. https://vercel.com/dashboard/ipoready → Settings → Environment Variables
# 2. Add the missing variable
# 3. Redeploy: git commit --allow-empty -m "Redeploy" && git push
# 4. Vercel will rebuild with new variables
```

### Scenario 4: Full Site Rollback
```bash
# If deployment is completely broken:
git reset --hard [stable-commit-hash]
git push --force origin main
# Then redeploy normal flow

# Or use Vercel UI:
# 1. Deployments tab → find stable version
# 2. Click "Promote to Production"
```

---

## Monitoring & Incident Response

### Continuous Monitoring
- **Uptime Monitoring:** Pingdom, Uptime Robot, or Vercel Analytics
- **Error Tracking:** Sentry integration (if configured)
- **Performance Monitoring:** Vercel Analytics, Web Vitals
- **Log Aggregation:** Vercel Logs, CloudWatch, or similar

### Daily Health Checks (Post-Deployment)
```bash
# Day 1 (Deployment day)
- [ ] Traffic is flowing (Vercel Analytics)
- [ ] No 5xx errors (Vercel Deployments tab)
- [ ] User sessions are being created (NextAuth logs)
- [ ] Database queries are completing < 1s

# Day 2-3 (First 48 hours)
- [ ] No spike in error rates
- [ ] Performance metrics stable
- [ ] User feedback from invited clients is positive
```

### Alert Conditions
Set up alerts in Vercel or external monitoring for:
- **HTTP 5xx Errors:** > 1% of requests
- **Response Time:** > 3 seconds (p95)
- **Database Timeouts:** Any query > 10 seconds
- **Stripe Webhook Failures:** > 3 failed attempts

### Incident Response
1. **Detect:** Alert fires or customer reports issue
2. **Assess:** Check Vercel dashboard, database status, logs
3. **Isolate:** Is it frontend, API, or database?
4. **Remediate:** 
   - If code issue → Rollback
   - If database issue → Check Neon, run migrations if needed
   - If infrastructure issue → Contact Vercel support
5. **Communicate:** Update status page, notify stakeholders
6. **Post-Mortem:** Document root cause and prevention

---

## Troubleshooting

### Issue: Deployment Hangs
```bash
# 1. Check Vercel build logs
# 2. If timeout (> 10 min), cancel and retry
# 3. Check for hanging processes:

# Locally:
npm run build -- --debug
# Look for any commands that don't complete

# On Vercel:
# Clear build cache: Dashboard → Settings → Git → Clear
```

### Issue: Database Connection Error
```bash
# Error: "connect ECONNREFUSED" or "HeadersTimeoutError"

# 1. Verify Neon status
curl https://console.neon.tech/api/v2/projects/[project-id] | jq .compute

# 2. Check DATABASE_URL in Vercel env vars
# 3. Verify pooler endpoint format:
# postgresql://[user]:[pass]@[host]/[db]?sslmode=require

# 4. If Neon is down, restart compute:
# https://console.neon.tech → Branch → Compute → Restart
```

### Issue: Feature Not Working
```bash
# 1. Check feature gate configuration
# Is the feature enabled for the user's plan?

# 2. Check browser console for errors
# DevTools → Console tab → Look for red errors

# 3. Check network requests
# DevTools → Network tab → Look for failed API calls

# 4. Check API response
# curl https://www.ipoready.ai/api/[endpoint] | jq .
```

### Issue: Migration Failed
```bash
# Error: "Relation already exists" or "Column not found"

# 1. Check which migrations have run
npm run db:migrate -- --status

# 2. If migration is idempotent, just run again
npm run db:migrate

# 3. If specific table is problematic:
# - Check if table exists: \dt table_name
# - Drop and recreate: DROP TABLE IF EXISTS table_name CASCADE;
# - Rerun migration
```

### Issue: Build Fails with Webpack Error
```bash
# Error: "Can't resolve 'src/app/components/...'"

# 1. File exists but webpack can't find it:
# Restore from git: git checkout HEAD -- [file]

# 2. Run npm ci to reinstall dependencies
npm ci

# 3. Try build again
npm run build
```

### Issue: Performance Degradation
```bash
# Pages load slowly after deployment

# 1. Check Lighthouse score
# DevTools → Lighthouse → Run analysis

# 2. Check for large dependencies
npm ls | grep -E "^├─|^│ └─" | sort -k2 -r | head -20

# 3. Check for unused imports
npm run type-check -- --noEmit

# 4. Optimize images and assets
# Use next/image for all images
# Lazy load components with dynamic()
```

---

## Quick Reference Commands

```bash
# Full deployment workflow
npm ci                          # Install deps
npm run type-check             # Verify types
npm run lint                   # Check code style
npm run db:migrate             # Run migrations
npm run seed:benchmarks        # Seed data
npm run build                  # Production build
npm run start                  # Test locally
git push origin main           # Deploy to Vercel

# Health checks post-deployment
curl https://www.ipoready.ai/api/health
curl https://www.ipoready.ai/api/auth/session

# Emergency rollback
git revert HEAD --no-edit && git push origin main
# OR use Vercel dashboard → Deployments → Promote previous version
```

---

## Support & Escalation

**For issues during deployment:**
1. Check this guide's troubleshooting section
2. Review recent commits in `git log --oneline -10`
3. Check Vercel dashboard for error details
4. Check Neon dashboard for database status
5. If unresolved → Contact Vercel support or Neon support

**Key URLs:**
- Vercel Dashboard: https://vercel.com/dashboard/ipoready
- Neon Console: https://console.neon.tech
- Production Site: https://www.ipoready.ai
- Production Emails: [Email forwarding to be configured]

---

**Document Version:** 1.0  
**Last Updated:** June 1, 2026  
**Next Review:** After next production deployment or major version bump
