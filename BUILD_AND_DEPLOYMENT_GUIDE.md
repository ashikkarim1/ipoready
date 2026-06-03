# IPOReady Build and Deployment Guide

**Version:** 1.0  
**Last Updated:** 2025-06-03  
**Environments:** Local Development, Staging, Production (Vercel)

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Migration & Setup](#database-migration--setup)
3. [Seed Script Execution](#seed-script-execution)
4. [Development Server Startup](#development-server-startup)
5. [Production Build & Deployment](#production-build--deployment)
6. [Production Deployment Checklist](#production-deployment-checklist)
7. [Smoke Tests: 8 Features End-to-End](#smoke-tests-8-features-end-to-end)
8. [Troubleshooting & Recovery](#troubleshooting--recovery)

---

## Local Development Setup

### Prerequisites

- **Node.js:** v18.17+ (check with `node --version`)
- **npm:** v9+ (check with `npm --version`)
- **PostgreSQL:** Neon (serverless PostgreSQL, pre-configured)
- **Git:** Latest version
- **Environment Variables:** `.env.local` file with all required secrets

### Step 1: Install Dependencies

```bash
cd /Users/test/Documents/Claude/Projects/IPOReady

# Clean install (remove old node_modules if issues occur)
npm clean-install

# Expected output:
# added XXX packages in XXs
# npm WARN deprecated ... (ignore deprecation warnings)
```

**What it does:**
- Installs all production and dev dependencies from `package-lock.json`
- Uses locked versions to ensure reproducible builds
- Installs `@neondatabase/serverless`, TypeScript, Next.js 14, Jest, and 60+ others

**Typical duration:** 2-5 minutes

### Step 2: Verify Environment Setup

```bash
# Ensure .env.local exists with all required keys:
test -f .env.local && echo "✅ .env.local found" || echo "❌ .env.local missing"

# Check DATABASE_URL is set (should not be printed for security)
grep -q "DATABASE_URL=" .env.local && echo "✅ DATABASE_URL configured" || echo "❌ DATABASE_URL missing"

# Check NEXTAUTH credentials exist
grep -q "NEXTAUTH_SECRET=" .env.local && echo "✅ NEXTAUTH_SECRET configured" || echo "❌ NEXTAUTH_SECRET missing"
grep -q "NEXTAUTH_URL=" .env.local && echo "✅ NEXTAUTH_URL configured" || echo "❌ NEXTAUTH_URL missing"
```

**Critical environment variables required:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_URL` | Authentication callback URL | `http://localhost:3800` (dev), `https://ipoready.com` (prod) |
| `NEXTAUTH_SECRET` | JWT signing key (generate: `openssl rand -hex 32`) | 64-character hex string |
| `RESEND_API_KEY` | Email delivery (sign up at resend.com) | `re_xxx...` |
| `ANTHROPIC_API_KEY` | Claude API for AI features | `sk-ant-xxx...` |
| `STRIPE_SECRET_KEY` | Stripe billing backend key | `sk_test_xxx...` / `sk_live_xxx...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature validation | `whsec_xxx...` |

**Additional optional keys for Phase 2 features:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Frontend Stripe key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — WhatsApp integration
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — Web push notifications
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage

---

## Database Migration & Setup

### Overview

IPOReady uses 21 sequential SQL migrations covering:
- **Core tables:** users, companies, tasks, documents
- **Phase 1:** Teams, milestones, notifications, badges
- **Phase 2A-2D:** Cap table, dilution, costs, consent, resolutions, syndication, listing rules
- **Phase 2E:** Prospectus builder, billing, feedback, onboarding

### Step 3: Run Migrations

```bash
# Execute all pending migrations in order
npm run db:migrate

# Expected output:
# Running IPOReady database migration...
# ✅ Migration 001_add_dilution_scenarios_table.sql completed
# ✅ Migration 001_add_whatsapp_tables.sql completed
# ✅ Migration 002_add_phase2_schema.sql completed
# ... (20 more migrations)
# ✅ Migration 021_syndication_templates_version_control.sql completed
# ✅ All database migrations complete!
```

**What it does:**
- Reads `.env.local` to get `DATABASE_URL`
- Creates `migrations` tracking table if needed
- Runs each `.sql` file in `/migrations` in alphabetical order
- Skips already-executed migrations (idempotent)
- Logs progress with timestamps

**Typical duration:** 15-30 seconds (depends on network latency to Neon)

### Migration File Order

The migrations auto-sort alphabetically, executing in this order:

| # | File | Purpose | Tables Created |
|---|------|---------|-----------------|
| 1 | `001_add_dilution_scenarios_table.sql` | Equity dilution modeling | `dilution_scenarios`, `cap_table_snapshots` |
| 2 | `001_add_whatsapp_tables.sql` | WhatsApp messaging | `whatsapp_messages`, `whatsapp_templates` |
| 3 | `002_add_phase2_schema.sql` | Phase 2 foundation | `cost_items`, `financial_metrics`, `company_factors` |
| 4 | `003_cap_table_schema.sql` | Cap table core | `cap_table_holders`, `holdings` |
| 5 | `004_lead_capture_and_trial_schema.sql` | Trial management | `leads`, `trial_subscriptions` |
| 6 | `005_add_integration_webhooks.sql` | Webhook handling | `integration_webhooks` |
| 7 | `006_cap_table_management_system.sql` | Advanced cap table | `cap_table_classes`, `conversion_terms` |
| 8 | `007_webhook_security_and_trial_upgrade.sql` | Security + trial upgrade | Indexes, security constraints |
| 9 | `008_slack_integration.sql` | Slack messaging | `slack_messages`, `slack_channels` |
| 10 | `009_add_missing_holdings_table.sql` | Holdings data | `holdings` table fixes |
| 11 | `010_complete_cap_table_schema.sql` | Cap table completion | Constraints, relationships |
| 12 | `011_add_pace_sequencing_alerts.sql` | PACE™ sequencing | `pace_sequencing_alerts` |
| 13 | `012_add_feedback_system.sql` | User feedback | `feedback_responses` |
| 14 | `013_onboarding_checklist_schema.sql` | Onboarding | `onboarding_checklist_items` |
| 15 | `014_prospectus_auto_builder.sql` | Prospectus generation | `prospectus_templates`, `prospectus_sections` |
| 16 | `015_add_missing_columns_for_tests.sql` | Test columns | Various schema adjustments |
| 17 | `016_ipo_costs_and_tracking.sql` | Cost tracking | `cost_tracking`, phase cost milestones |
| 18 | `017_document_relationships.sql` | Document linking | `document_relationships`, `document_versions` |
| 19 | `018_phase2a_2d_comprehensive_schema.sql` | Comprehensive Phase 2 | `consent_requests`, `corporate_resolutions`, `syndication_agreements`, `listing_requirements` |
| 20 | `020_cost_calculator.sql` | Cost calculator | `cost_calculation_results` |
| 21 | `021_syndication_templates_version_control.sql` | Syndication templates | `syndication_template_versions` |

### Verify Migration Success

```bash
# Check that all migrations were applied
npm run db:migrate

# Should show "⏭️  Skipping migration X (already executed)" for all files

# Or query the database directly:
psql "$DATABASE_URL" -c "SELECT * FROM migrations ORDER BY executed_at ASC;"

# Expected: 21 rows with timestamps
```

### Rollback (Emergency Only)

```bash
# If a migration fails:
# 1. Check the error message
# 2. Fix the .sql file in /migrations
# 3. Delete the failed migration from the migrations table:

psql "$DATABASE_URL" -c "DELETE FROM migrations WHERE name = '018_phase2a_2d_comprehensive_schema.sql';"

# 4. Re-run migrations:
npm run db:migrate
```

---

## Seed Script Execution

### Purpose

Pre-populate the database with realistic Phase 2 demo data for the test account (`test@ipoready.com`). This enables immediate feature testing without manual setup.

### Step 4: Run Seed Script

```bash
# Seed Phase 2 test account with comprehensive demo data
npm run seed:phase2:test

# Expected output:
# ✅ Created 44 cost items (Total: $50.2M)
# ✅ Created 24 monthly financial metrics
# ✅ Created 3 dilution scenarios with shareholder details
# ✅ Created 10 consent requests
# ✅ Created 12 corporate resolutions
# ✅ Created 3 syndication agreements
# ✅ Created 22 listing requirements (NASDAQ, NYSE, TSX)
#
# ✅ PHASE 2 SEED COMPLETE FOR test@ipoready.com
```

**What it seeds:**

| Feature | Count | Data Example |
|---------|-------|--------------|
| **Cost Items** | 44 | Legal ($5.2M), Audit ($4.8M), Investment Banking ($8.5M), Consulting, Printing, Roadshow, Listing Fees, Employee-Related, Contingency |
| **Financial Metrics** | 24 | Monthly snapshots Jan 2024 - Dec 2025 with cumulative costs, burn rate, phase %, team utilization |
| **Dilution Scenarios** | 3 | Conservative ($20/share), Base Case ($25/share, most detailed), Best Case ($2/warrant exercise) |
| **Consent Requests** | 10 | Director consents (signed/approved/pending/viewed/rejected), shareholder consents, officer consents |
| **Corporate Resolutions** | 12 | Board authorization, stock split, director appointments, dividend policy, related party, code of conduct |
| **Syndication Agreements** | 3 | Firm commitment (Goldman Sachs), Best efforts (Morgan Stanley), Firm commitment (JPMorgan), all with 180-day lock-ups |
| **Listing Requirements** | 22 | NASDAQ (8), NYSE (8), TSX (6) with status tracking (completed/in-progress/not-started) |

### Seed Script Details

**Location:** `/scripts/seed-phase2-test-account.ts`  
**Test Account Email:** `test@ipoready.com`  
**Company Name:** MediFlow Health Technologies Inc.  
**Company ID:** `2e31b75b-813f-48bf-a03f-2b2a0da0c0a9`  
**Idempotent:** Yes — safe to run multiple times (uses fresh UUIDs each time)  
**Typical Duration:** 2-3 seconds

### Seed Data Verification

After seeding, verify data was inserted:

```bash
# Count cost items
psql "$DATABASE_URL" -c "SELECT cost_category, COUNT(*), SUM(amount_usd) FROM cost_items WHERE user_id IN (SELECT id FROM users WHERE email = 'test@ipoready.com') GROUP BY cost_category ORDER BY SUM DESC;"

# Should show cost breakdown:
#     cost_category      | count |   sum
# ─────────────────────────────────────────
#  Legal               |     6 | 5200000
#  Investment Banking  |     4 | 8500000
#  Consulting          |     5 | 3200000
#  ... etc

# Verify consent requests
psql "$DATABASE_URL" -c "SELECT status, COUNT(*) FROM consent_requests WHERE user_id IN (SELECT id FROM users WHERE email = 'test@ipoready.com') GROUP BY status;"

# Check cap table scenarios
psql "$DATABASE_URL" -c "SELECT scenario_name, new_shares_issued, issue_price_per_share_usd FROM dilution_scenarios WHERE user_id IN (SELECT id FROM users WHERE email = 'test@ipoready.com');"
```

---

## Development Server Startup

### Step 5: Start Local Dev Server

```bash
# Start Next.js development server (hot reload enabled)
npm run dev

# Expected output:
# ▲ Next.js 14.2.35
# - Local:        http://localhost:3800
# - Environments: .env.local
# 
# ✓ Ready in 2.1s
```

**The server will:**
- Watch for file changes and hot-reload (typically <1 second)
- Enable TypeScript checking in the terminal
- Serve the app at `http://localhost:3800`
- Connect to the database specified in `DATABASE_URL`
- Require valid `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### Accessing the App

Open **http://localhost:3800** in your browser.

**Demo Credentials (seeded by migrations):**

| Email | Password | Role |
|-------|----------|------|
| `test@ipoready.com` | (set in registration) | Company Founder/Owner |
| `admin@ipoready.com` | `demo123` | System Admin |
| `ceo@techcorp.com` | `demo123` | CEO (TechCorp demo) |

### Typical Development Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests in watch mode
npm run test:watch

# Terminal 3: Monitor database migrations or other tasks
npm run db:migrate
```

### Development Server Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `DATABASE_URL is not set` | Missing `.env.local` | Copy `.env.example` to `.env.local`, add real Neon connection string |
| `Port 3800 already in use` | Another app running on port | Kill process: `lsof -i :3800 \| grep node \| awk '{print $2}' \| xargs kill` |
| `NEXTAUTH_SECRET not set` | Missing env variable | Generate: `openssl rand -hex 32`, add to `.env.local` |
| Hot reload not working | Cache issue | Delete `.next` folder: `rm -rf .next && npm run dev` |
| Database connection timeout | Neon pool exhausted | Restart dev server, check Neon dashboard for connection limits |

---

## Production Build & Deployment

### Step 6: Build for Production

```bash
# Create optimized production build
npm run build

# Expected output:
# ▲ Next.js 14.2.35
# ○ Packages in scope: ipoready
# ✓ Running "build" from package.json
#
# > next build
# ✓ Creating an optimized production build
# ✓ Compiled client and server successfully
# ✓ Analyzed bundle size in 3.2s
#   ▪ Size (gzipped)
#   ├ App bundle              234 kB
#   ├─ Shared by all          98 kB
#   ├─ Homepage              45 kB
#   ├─ Cap Table             67 kB
#   └─ Dashboard             58 kB
#
# ✓ Collecting page data
# ✓ Running validation
# ✓ Prerendering static pages (0)
# ✓ Build complete
```

**What the build does:**
1. Compiles TypeScript to JavaScript
2. Bundles React components with tree-shaking (lucide-react, date-fns optimized)
3. Optimizes images and static assets
4. Creates `.next/` directory with:
   - Compiled server-side code
   - Static asset manifests
   - Route handlers compiled to Node.js functions
   - Prerendered pages (if any)
5. Generates source maps (disabled in production for security)

**Typical duration:** 3-5 minutes  
**Build artifacts size:** ~400-500 MB (includes dependencies)

### Step 7: Test Production Build Locally

```bash
# Start production server (uses built artifacts)
npm start

# Expected output:
# ▲ Next.js 14.2.35
# - Local:        http://localhost:3000
# 
# ✓ Ready in 0.2s (using production artifacts)
```

**Port change:** Production uses port 3000 (not 3800). Access at **http://localhost:3000**

### Step 8: Deploy to Vercel

IPOReady is deployed on **Vercel** (configured in `/vercel.json`).

#### Vercel Build Configuration

```json
{
  "buildCommand": "npm run db:migrate && next build"
}
```

This means Vercel will:
1. Run `npm run db:migrate` first (applies all pending database migrations to production DB)
2. Run `next build` to create optimized production build
3. Deploy the built app

#### Deployment Steps

**Prerequisites:**
- Vercel account with project connected to GitHub
- All environment variables set in Vercel dashboard (mirror `.env.example`)
- Database migrations reviewed and tested locally

**Deploy via Git Push:**

```bash
# Commit your changes
git add .
git commit -m "Feature: description"

# Push to main branch (triggers automatic Vercel deployment)
git push origin main

# Vercel will:
# 1. Detect the push
# 2. Run buildCommand: npm run db:migrate && next build
# 3. Deploy to production URL (ipoready.vercel.app or custom domain)
# 4. Send deployment status to GitHub
```

**Monitor Deployment:**

```bash
# In Vercel Dashboard:
# 1. Open https://vercel.com/dashboard
# 2. Select IPOReady project
# 3. Watch the "Deployments" tab
# 4. Check logs for any build errors

# Or via CLI:
vercel logs
vercel status
```

**Rollback (if deployment fails):**

```bash
# Via Vercel Dashboard:
# 1. Go to Deployments tab
# 2. Find the last successful deployment
# 3. Click "Promote to Production"

# Via CLI:
vercel promote <deployment-url>
```

---

## Production Deployment Checklist

**Before every production deployment, verify:**

### Pre-Deployment Verification (30 min)

#### 1. Code Review
- [ ] All changes reviewed in pull request
- [ ] No console.log() statements in production code
- [ ] No hardcoded secrets or API keys
- [ ] TypeScript strict mode passes: `npx tsc --noEmit`

#### 2. Local Testing
- [ ] `npm run build` completes without errors
- [ ] `npm start` runs successfully
- [ ] All smoke tests pass (see section 7)
- [ ] Database migrations tested on local replica

#### 3. Database Safety
- [ ] All new migrations reviewed for data loss risks
- [ ] Migration scripts tested on staging/dev database
- [ ] Backup of production database created (Neon auto-backups, verify in dashboard)
- [ ] No destructive migrations (DROP TABLE, DELETE FROM) without approval

#### 4. Environment Variables
- [ ] All required env vars set in Vercel dashboard
- [ ] No stale/duplicate env vars
- [ ] Secrets rotated if any were exposed
- [ ] NEXTAUTH_SECRET and NEXTAUTH_URL match deployment domain

#### 5. Dependencies
- [ ] No vulnerable dependencies: `npm audit`
- [ ] All new packages necessary (review in package.json diff)
- [ ] No circular dependencies

#### 6. Security
- [ ] No new SQL injection vectors (all queries use parameterized statements)
- [ ] Authentication required on protected routes
- [ ] CORS headers correct
- [ ] Rate limiting in place on API endpoints
- [ ] Vercel security headers enabled (CSP, HSTS, etc. in next.config.js)

#### 7. Performance
- [ ] No significant bundle size increase (use `npm run build` output)
- [ ] Database query performance acceptable (no N+1 queries)
- [ ] No memory leaks in long-running services
- [ ] Image optimization enabled

#### 8. Monitoring
- [ ] Error tracking configured (Sentry, DataDog, etc.)
- [ ] Application logging enabled
- [ ] Database connection pool health monitored
- [ ] Uptime monitoring active

### Deployment Steps

```bash
# Step 1: Run all checks locally
npm run build
npm start  # test the build
npm test   # run full test suite
npm run lint

# Step 2: Commit and push to main branch
git add .
git commit -m "Release: v1.0.1 - [feature description]"
git push origin main

# Step 3: Monitor deployment in Vercel
# Dashboard: https://vercel.com/dashboard/ipoready

# Step 4: Post-deployment validation (see Smoke Tests section)
```

### Post-Deployment Monitoring (First 30 min)

- [ ] Check error logs: `vercel logs --tail`
- [ ] Monitor database connections in Neon dashboard
- [ ] Verify core endpoints return 200:
  - `https://ipoready.com/api/health`
  - `https://ipoready.com/api/user/profile`
  - `https://ipoready.com/dashboard`
- [ ] Check real user traffic in Vercel Analytics
- [ ] Monitor CPU/memory in Neon dashboard
- [ ] No spike in error rate or latency

### Rollback Trigger

Immediately rollback if:
- [ ] 5xx errors > 1% of requests
- [ ] Database connection failures
- [ ] Authentication system down (users can't log in)
- [ ] Critical feature completely broken
- [ ] Data corruption detected

**Rollback command:**
```bash
# Via Vercel Dashboard → Deployments → [Last Good] → Promote to Production

# Via CLI:
vercel promote <deployment-url-of-last-good-build>
```

---

## Smoke Tests: 8 Features End-to-End

**Purpose:** Verify all 8 core IPOReady features work after deployment.  
**Time:** ~15-20 minutes  
**Frequency:** After every production deployment  
**Test Account:** `test@ipoready.com` (or `admin@ipoready.com`)

### Test Setup

```bash
# 1. Clear your browser cookies/localStorage for a fresh start
# 2. Open the app: http://localhost:3800 (dev) or https://ipoready.com (prod)
# 3. Log in with test credentials

# If test@ipoready.com doesn't have a password:
# 1. Go to /reset-password
# 2. Enter test@ipoready.com
# 3. Check email (Resend staging) for reset link
# 4. Set new password
```

### Feature 1: Authentication & Registration

**Route:** `/login`, `/register`, `/reset-password`

```bash
# Test 1.1: Login works
POST /api/auth/signin
Body: { email: "test@ipoready.com", password: "..." }
Expected: 200, session cookie set, redirect to /dashboard

# Test 1.2: Register new account
POST /api/auth/register
Body: { email: "newuser@test.com", password: "..." }
Expected: 200, account created, email sent, redirect to /wizard

# Test 1.3: Password reset works
POST /api/auth/forgot-password
Body: { email: "test@ipoready.com" }
Expected: 200, reset email sent (check Resend logs)
Then: Follow reset link, set new password, can log in
```

**Expected Result:** ✅ All auth routes accessible, tokens valid, no 401 errors

---

### Feature 2: IPO Checklist

**Route:** `/checklist`

```bash
# Test 2.1: Checklist loads
GET /checklist
Expected: 200, renders 30+ tasks across 8 phases with citations and pitfalls

# Test 2.2: Task completion tracking works
PUT /api/tasks/{task_id}/complete
Body: { status: "completed" }
Expected: 200, task marked complete in DB, UI updates immediately

# Test 2.3: Phase summary displays correctly
GET /api/dashboard/checklist-summary
Expected: 200 JSON with phase completion %, task counts, blockers

# Test 2.4: PDF export works (if implemented)
GET /checklist?export=pdf
Expected: 200, PDF file download with all tasks formatted
```

**Expected Result:** ✅ All tasks visible, completion toggles work, summary accurate

---

### Feature 3: Cap Table Management

**Route:** `/cap-table`

```bash
# Test 3.1: Cap table page loads
GET /cap-table
Expected: 200, shows seeded dilution scenarios (Conservative/Base/Best Case)

# Test 3.2: Scenario sliders work
PUT /api/cap-table/scenarios/{scenario_id}
Body: { share_price: 27.50 }
Expected: 200, immediate recalculation, founder dilution updated

# Test 3.3: Excel export works
GET /api/cap-table/export?scenario_id=...&format=xlsx
Expected: 200, .xlsx file with Before/After tabs and delta highlights

# Test 3.4: Escrow per-member table displays
GET /cap-table (check UI)
Expected: Member escrow terms displayed per shareholder class

# Test 3.5: Tax event flags show
GET /cap-table (check UI)
Expected: Yellow warning badges on conversion events
```

**Expected Result:** ✅ Scenarios load, sliders responsive, exports valid, tax warnings visible

---

### Feature 4: PACE™ Velocity Tracker

**Route:** `/pace`

```bash
# Test 4.1: PACE page loads with metrics
GET /pace
Expected: 200, shows velocity breakdown, 8-week trend chart, peer benchmark (Top 30% TSXV)

# Test 4.2: Phase-by-phase breakdown calculates
GET /api/pace/breakdown
Expected: 200 JSON with phase velocity, impact scores, phase sequencing

# Test 4.3: Forecast scenarios work
POST /api/pace/forecast
Body: { scenario: "optimistic" }
Expected: 200, returns timeline changes for Current/Optimistic/Accelerated/Delayed

# Test 4.4: Benchmark comparison displays
GET /pace (check UI)
Expected: Peer benchmark card shows "Top 30% TSXV" or user's percentile

# Test 4.5: Task drag-to-accelerate works (if implemented)
Drag task from "Phase 3" → "Phase 2" in UI
Expected: Phase updates, PACE velocity recalculates, animation smooth
```

**Expected Result:** ✅ PACE metrics display, forecasts calculate, benchmark shows, drag updates PACE

---

### Feature 5: Consent Workflow

**Route:** `/compliance/consent-letters`

```bash
# Test 5.1: Consent requests display with statuses
GET /compliance/consent-letters
Expected: 200, shows 10 seeded requests (signed/approved/pending/viewed/rejected)

# Test 5.2: Consent approval flow works
PUT /api/consent/{consent_id}/approve
Body: { action: "approve", approver_name: "Test" }
Expected: 200, status changes to approved, timestamp recorded

# Test 5.3: Consent rejection with reason works
PUT /api/consent/{consent_id}/reject
Body: { reason: "Conflicts with other role" }
Expected: 200, status changes to rejected, reason stored, resubmittable flag set

# Test 5.4: Email notifications sent on status change
Check Resend logs for consent approval/rejection emails
Expected: Email sent to consentee with status and next steps

# Test 5.5: Bulk export consent list
GET /api/consent/export?format=csv
Expected: 200, CSV with all consents, status, dates
```

**Expected Result:** ✅ All consent statuses load, approval/rejection works, emails sent, export valid

---

### Feature 6: Cost Calculator

**Route:** `/financial/cost-calculator`

```bash
# Test 6.1: Cost items display with all 44 seeded items
GET /financial/cost-calculator
Expected: 200, shows cost breakdown: Legal $5.2M, Audit $4.8M, IB $8.5M, etc.

# Test 6.2: Add new cost item works
POST /api/costs
Body: { category: "Legal", vendor: "New Firm", amount_usd: 250000 }
Expected: 201, item added, category total updated

# Test 6.3: Total cost calculation correct
GET /api/costs/summary
Expected: 200 JSON with total_cost_usd: 50200000 (or updated total)

# Test 6.4: Monthly financial metrics trend displays
GET /api/financial/monthly-metrics?from=2024-01-01&to=2025-12-31
Expected: 200, 24 monthly snapshots with cumulative costs, burn rate, team utilization

# Test 6.5: Budget variance calculates
GET /api/costs/variance
Expected: 200, shows budget vs actual, alerts on overages >10%
```

**Expected Result:** ✅ All 44 costs visible, additions work, totals accurate, trend displays, variances calculated

---

### Feature 7: Listing Rules Engine

**Route:** `/compliance/listing-rules`

```bash
# Test 7.1: Listing requirements display for all 3 exchanges
GET /compliance/listing-rules
Expected: 200, shows NASDAQ (8), NYSE (8), TSX (6) requirements

# Test 7.2: Exchange compliance check works
POST /api/listing-rules/validate
Body: { exchange: "nasdaq", cap_table_data: {...} }
Expected: 200, returns violations, gaps, completion %

# Test 7.3: Requirement status updates work
PUT /api/listing-rules/{requirement_id}
Body: { status: "completed" }
Expected: 200, percentage completion updated in UI

# Test 7.4: Comparison view shows readiness by exchange
GET /compliance/listing-rules?view=comparison
Expected: 200, side-by-side comparison of NASDAQ vs NYSE vs TSX readiness

# Test 7.5: Risk report generates
GET /api/listing-rules/risk-report
Expected: 200 PDF with violations, gaps, remediation steps
```

**Expected Result:** ✅ All 22 requirements visible, validation works, comparisons display, risk report generates

---

### Feature 8: Syndication Agreements

**Route:** `/financial/syndication`

```bash
# Test 8.1: Syndication agreements load with all 3 seeded agreements
GET /financial/syndication
Expected: 200, shows:
  - Firm Commitment (Goldman Sachs, 8 members, 350 bps)
  - Best Efforts (Morgan Stanley, 5 members, 450 bps)
  - Firm Commitment (JPMorgan, 6 members, 280 bps)

# Test 8.2: Syndicate member list displays
GET /api/syndication/{agreement_id}/members
Expected: 200, lists all members with allocation %, commitment status

# Test 8.3: Lock-up period tracking works
GET /api/syndication/{agreement_id}/lock-up
Expected: 200 JSON with lock_up_days: 180, expiration_date, shares_locked

# Test 8.4: Net proceeds calculation accurate
GET /api/syndication/{agreement_id}/proceeds
Expected: 200, shows gross_proceeds, gross_spread_bps, net_proceeds
  - Goldman Sachs: $495M net
  - Morgan Stanley: $45M net
  - JPMorgan: $360M net

# Test 8.5: Syndicate agreement export works
GET /api/syndication/{agreement_id}/export?format=pdf
Expected: 200, PDF with agreement terms, member list, lock-up schedule
```

**Expected Result:** ✅ All 3 agreements visible, members list correct, lock-up tracks, proceeds calculated, exports work

---

### Smoke Test Checklist

Run through all 8 features and check off:

```bash
✅ Feature 1: Authentication & Registration
   [ ] Login works
   [ ] Register creates account
   [ ] Password reset sends email

✅ Feature 2: IPO Checklist
   [ ] All 30+ tasks visible
   [ ] Task completion toggles work
   [ ] Phase summary shows correct %

✅ Feature 3: Cap Table Management
   [ ] 3 scenarios load (Conservative/Base/Best)
   [ ] Sliders update dilution in real-time
   [ ] Excel export creates valid file
   [ ] Tax warnings display

✅ Feature 4: PACE™ Velocity Tracker
   [ ] Velocity breakdown displays
   [ ] 8-week trend chart renders
   [ ] Peer benchmark shows
   [ ] Forecast scenarios calculate
   [ ] Drag-to-accelerate updates PACE

✅ Feature 5: Consent Workflow
   [ ] All 10 consents display with statuses
   [ ] Approval/rejection flows work
   [ ] Status change emails sent
   [ ] CSV export valid

✅ Feature 6: Cost Calculator
   [ ] All 44 items visible
   [ ] Total = $50.2M (or current)
   [ ] Can add new costs
   [ ] Monthly trend graph displays
   [ ] Budget variances calculate

✅ Feature 7: Listing Rules Engine
   [ ] NASDAQ (8), NYSE (8), TSX (6) show
   [ ] Validation checks run
   [ ] Completion % updates
   [ ] Exchange comparison view works
   [ ] Risk report generates

✅ Feature 8: Syndication Agreements
   [ ] All 3 agreements visible
   [ ] Member lists complete
   [ ] Lock-up periods track (180 days)
   [ ] Net proceeds: Goldman $495M, MS $45M, JPM $360M
   [ ] PDF exports valid
```

**Result: PASS** = All 8 features working end-to-end ✅

---

## Troubleshooting & Recovery

### Common Issues

#### Build Fails: "Cannot find module '@neondatabase/serverless'"

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

#### Database Connection Timeout

```bash
# Check Neon dashboard for:
# 1. Connection pool exhaustion (max connections = 4 for free tier)
# 2. Network connectivity
# 3. DATABASE_URL format (must include ?sslmode=require)

# Verify connection:
psql "$DATABASE_URL" -c "SELECT 1;"

# If fails, check:
# - DATABASE_URL env var set correctly
# - Neon project active (not paused)
# - IP whitelisting (Neon allows all IPs by default)
```

#### Migration Fails: "Relation 'XXX' does not exist"

```bash
# Solution: One migration depends on previous one
# Check migration order and re-run from scratch:

psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS migrations CASCADE;"

npm run db:migrate
```

#### Seed Script Fails: "User not found"

```bash
# The seed script expects test@ipoready.com to exist
# Create it manually:

psql "$DATABASE_URL" << 'EOF'
INSERT INTO users (id, email, name, created_at)
VALUES (gen_random_uuid(), 'test@ipoready.com', 'Test User', NOW())
ON CONFLICT (email) DO NOTHING;
EOF

npm run seed:phase2:test
```

#### Production Deployment Stuck at "Running npm run db:migrate"

```bash
# Check Neon database:
# 1. Vercel dashboard → Deployments → Logs
# 2. Look for SQL errors (constraint violations, missing columns, etc.)
# 3. Common: Previous migration failed, blocking new migrations

# Solution:
# 1. Check failed migration in /migrations
# 2. Fix the SQL
# 3. Delete the failed migration from migrations table (in production):
#    DELETE FROM migrations WHERE name = 'XXX.sql';
# 4. Re-deploy to Vercel
```

#### "NEXTAUTH_SECRET not set" in Production

```bash
# Solution: Add env var to Vercel
# 1. Vercel Dashboard → Settings → Environment Variables
# 2. Add NEXTAUTH_SECRET=<value>
# 3. Re-deploy: git push origin main
```

#### Port 3800 Already in Use

```bash
# Solution: Kill the process using the port
lsof -i :3800
kill -9 <PID>

# Or change port:
PORT=3801 npm run dev
```

### Emergency Procedures

#### Full Database Reset (Development Only)

```bash
# WARNING: This deletes ALL data. Dev only.

# 1. Drop all tables
psql "$DATABASE_URL" << 'EOF'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
EOF

# 2. Re-run migrations
npm run db:migrate

# 3. Re-seed if needed
npm run seed:phase2:test
```

#### Rollback Production Deployment

```bash
# Vercel Dashboard:
# 1. Deployments tab
# 2. Find last good deployment
# 3. Click "Promote to Production"

# Or via CLI:
vercel list
vercel promote <deployment-url>
```

#### Database Backup & Restore

```bash
# Neon auto-backups every 24 hours (free tier)
# 1. Neon Dashboard → Project → Backups
# 2. Click "Restore"
# 3. Select time point and confirm

# Manual backup (on your machine):
pg_dump "$DATABASE_URL" > ipoready_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup:
psql "$DATABASE_URL" < ipoready_backup_20250603_150000.sql
```

---

## Summary

**Full Build & Deployment Flow:**

```bash
# Local Development
npm install                    # Install dependencies
npm run db:migrate             # Run all migrations
npm run seed:phase2:test       # Seed demo data
npm run dev                    # Start at http://localhost:3800

# Testing Before Production
npm run build                  # Create production build
npm start                      # Test build locally at http://localhost:3000
npm test                       # Run test suite
# Run smoke tests (see section 7)

# Production Deployment
git add .
git commit -m "Release: v1.0.1"
git push origin main           # Triggers Vercel auto-deploy
# Monitor vercel.com/dashboard
# Verify smoke tests post-deployment
```

**Deployment Checklist (tldr):**
1. ✅ Code reviewed, no secrets
2. ✅ `npm run build` succeeds
3. ✅ Database migrations safe
4. ✅ Env vars set in Vercel
5. ✅ Push to main branch
6. ✅ Monitor deployment
7. ✅ Run smoke tests
8. ✅ Monitor error logs

**Expected Build Time:** 3-5 minutes  
**Expected Smoke Tests Time:** 15-20 minutes  
**MTTR (Mean Time to Rollback):** <5 minutes via Vercel dashboard

---

## Support

For issues:
1. Check the "Troubleshooting & Recovery" section above
2. Review Vercel deployment logs: `vercel logs --tail`
3. Check Neon database status: https://console.neon.tech
4. Review application logs in error tracking service

---

**Document Version:** 1.0  
**Last Updated:** 2025-06-03  
**Next Review:** After first production deployment
