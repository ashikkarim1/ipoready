# IPOReady Agent Architecture

**Last Updated:** June 1, 2026  
**Version:** 1.0  
**Status:** Production Ready

---

## Overview

IPOReady employs an autonomous agent architecture to handle critical background processes, webhooks, and scheduled tasks without manual intervention. These agents operate across different layers of the application, each with specific responsibilities in the product lifecycle.

**Core Principle:** Agents are stateless, idempotent services that can be triggered by events (webhooks), schedules (cron jobs), or API calls, and they handle persistence through the database.

---

## Agent Types & Responsibilities

### 1. **Neon Migration Monitor Agent** (Scheduled)
**Path:** Scheduled task at `/Users/test/.claude/scheduled-tasks/neon-migration-monitor/SKILL.md`  
**Trigger:** Scheduled time-based (fires at 2026-06-01 18:45 UTC or next app startup after that time)  
**Responsibility:** Monitor Neon database connectivity and execute migrations when database comes online

#### Workflow
```
1. Check if DATABASE_URL responds to test query
2. If online:
   a. Run: npm run db:migrate (applies all pending migrations)
   b. Run: npm run seed:benchmarks (populates benchmark tables)
   c. Log success and completion time
3. If offline:
   a. Log status and retry on next schedule
4. Send completion notification to user
```

#### Code Location
- Trigger: `mcp__scheduled-tasks__create_scheduled_task` (CloudFront based, fires within 5 min of scheduled time)
- Execution: `npm run db:migrate` → `scripts/migrate.js` → HTTP calls via `@neondatabase/serverless`

#### Idempotency
- **Safe:** All migrations use `IF NOT EXISTS` clauses
- **Repeatable:** Can be run multiple times without side effects
- **Status:** Logged in console output with timestamps

---

### 2. **Trial Expiry Agent** (Scheduled)
**Path:** `/src/app/api/webhooks/trial/route.ts`  
**Trigger:** HTTP POST endpoint (typically called by scheduled task or cron service)  
**Responsibility:** Monitor trial periods, send expiry notifications, and auto-upgrade subscriptions

#### Workflow
```
1. Query companies with active trials
2. For each trial:
   a. Calculate days_remaining = trial_end_date - today
   b. If days_remaining = 2: Send "Trial expires in 2 days" email
   c. If days_remaining ≤ 0: Handle expiry
      - If payment_method_saved: Auto-create Stripe subscription
      - If no payment_method: Send "Trial expired, upgrade to continue"
      - Set subscription_status = 'expired'
3. Log all actions with company_id and timestamp
4. Return summary: { processed: N, auto_upgraded: N, expired: N }
```

#### Code Location
- Route: `src/app/api/webhooks/trial/route.ts` (365 lines)
- Logic: `src/lib/trial-manager.ts`
  - `initializeTrial()`: Set trial dates (14 days)
  - `getTrialStatus()`: Calculate remaining days
  - `handleTrialExpiry()`: Process auto-upgrade or expiration
- Database: `companies.trial_*` columns

#### Authentication
- Requires `Authorization: Bearer [TRIAL_WEBHOOK_SECRET]` header
- Secret should be set in environment variables (not yet configured; add to .env.local)

#### Calling the Agent
```bash
# Manual trigger for testing
curl -X POST https://www.ipoready.ai/api/webhooks/trial \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"action": "check_expiry"}'
```

---

### 3. **Stripe Webhook Agent** (Event-Driven)
**Path:** `/src/app/api/webhooks/stripe/route.ts`  
**Trigger:** HTTP POST from Stripe (event-driven, not scheduled)  
**Responsibility:** Process subscription lifecycle events and payment updates in real-time

#### Handled Events
```
Event Type                   | Action
----------------------------|--------------------------------------------------
customer.subscription.created | Log new subscription, set status='active'
customer.subscription.updated | Update plan tier, interval, next_billing_date
customer.subscription.deleted | Set status='cancelled', log cancelled_at
invoice.payment_failed       | Increment failure count, queue retry, send email
invoice.payment_succeeded    | Log payment, reset failure count, update last_payment
customer.created            | Initialize customer record
```

#### Workflow (Per Event)
```
1. Receive POST with event JSON
2. Extract Stripe event_id and check idempotency
   - If event_id already processed: Return 200 (skip duplicate)
   - Else: Continue
3. Verify HMAC signature using STRIPE_WEBHOOK_SECRET
   - If invalid: Return 400 (security violation)
   - Else: Continue
4. Parse event_type and route to handler
5. Execute handler (update database, send emails, etc.)
6. Log result in webhook_logs table with status='processed'
7. Return 200 OK to Stripe
```

#### Code Location
- Route: `src/app/api/webhooks/stripe/route.ts` (430+ lines)
- Verification: `src/lib/stripe-webhook.ts`
  - `verifyStripeSignature()`: HMAC-SHA256 verification
  - `checkIdempotency()`: Query webhook_logs for event_id
  - `logWebhookEvent()`: Insert event into webhook_logs
- Database: `companies.stripe_*` columns, `webhook_logs` table

#### Security
- **Signature Verification:** Required before processing
- **Idempotency:** Event IDs never processed twice
- **Rate Limiting:** Implicit (each event once)
- **Secrets:** STRIPE_WEBHOOK_SECRET must be in .env.local

#### Monitoring
```bash
# Check webhook history
SELECT * FROM webhook_logs 
WHERE event_type = 'invoice.payment_failed' 
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

### 4. **Billing Notification Agent** (Reactive)
**Path:** `/src/lib/billing-notifications.ts`  
**Trigger:** Called by Stripe Webhook Agent or Trial Expiry Agent  
**Responsibility:** Send transactional emails for billing events

#### Notification Types
```
Type                        | Trigger              | Template
----------------------------|----------------------|----------------------------------
Trial Expiring (2 days)     | Trial age = 12 days  | "Your trial expires in 2 days"
Trial Expired               | Trial age > 14 days  | "Your trial has ended, upgrade"
Payment Failed              | invoice.payment_*    | "Update your payment method"
Payment Succeeded           | invoice.payment_*    | "Thank you, subscription renewed"
Subscription Upgraded       | customer.sub.*       | "Welcome to [plan], new features"
Subscription Cancelled      | customer.sub.deleted | "We're sorry to see you go"
```

#### Code Location
- Module: `src/lib/billing-notifications.ts` (889 lines)
- Functions:
  - `sendTrialExpiringEmail(company)`
  - `sendTrialExpiredEmail(company)`
  - `sendPaymentFailedEmail(company)`
  - `sendPaymentSucceededEmail(company)`
  - `sendSubscriptionUpgradedEmail(company)`
  - `sendSubscriptionCancelledEmail(company)`
- Email Provider: (To be configured - SendGrid, AWS SES, etc.)

#### Email Configuration
Currently no-op stubs; requires:
1. Email provider API credentials in .env.local
2. Template setup in email provider (SendGrid/SES)
3. Sender address configuration (noreply@ipoready.ai)

#### Queue vs Direct Send
- **Current:** Direct send (may fail silently if provider is down)
- **Future:** Integrate with BullMQ or AWS SQS for retry logic

---

### 5. **PACE Prediction Agent** (On-Demand)
**Path:** `/src/lib/pace-predictor.ts`  
**Trigger:** API endpoint `/api/pace/scores` or direct function call  
**Responsibility:** Calculate predictive PACE score based on multiple factors

#### Calculation Formula
```
adjustedPaceScore = (
  (base_pace_pct × 0.40) +                    // Task completion
  (cash_runway_factor × 0.20) +               // Cash runway (months)
  (team_readiness_factor × 0.20) +            // Hiring progress
  (market_conditions_factor × 0.10) +         // Market volatility
  (investor_sophistication_factor × 0.10)     // Investor quality
)

Where:
- base_pace_pct = Average of phase completion percentages (0-100)
- cash_runway_factor:
    12+ months   → 100
    6-12 months  → 75
    < 6 months   → 50
- team_readiness_factor:
    CFO hired    +20
    Board >= 5   +15
    Auditor sel  +15
    Team >= 30   +10
- market_conditions_factor:
    VIX > 25     -10 (volatile market)
    Normal       +5
- investor_sophistication_factor:
    Institutional investors present: +10
    Else: 0
```

#### Code Location
- Module: `src/lib/pace-predictor.ts`
- Function: `calculatePredictiveScore(company)`
- Returns: `{ adjustedPaceScore, confidenceLevel, riskFactors[] }`

#### API Endpoint
```bash
GET /api/pace/scores?companyId=xyz
Response:
{
  "paceScore": 72.5,
  "adjustedPaceScore": 68.3,
  "confidenceLevel": "high",
  "peerPercentile": 78,
  "benchmarkComparison": { avgPace: 65, medianPace: 70, p90Pace: 82 },
  "riskFactors": ["low_cash_runway", "team_incomplete"]
}
```

---

### 6. **IPO Sequencing Validator Agent** (On-Demand)
**Path:** `/src/lib/ipo-sequencing.ts`  
**Trigger:** API endpoint `/api/pace/validate-sequencing` or dashboard refresh  
**Responsibility:** Validate that IPO tasks are completed in correct order

#### Validation Rules (Sample)
```
"Auditor must be selected before Financial Audit" → error
"Legal docs must start before Regulatory Filing" → warning
"Board should be formed before Roadshow" → warning
"Cap table must be cleaned before Financial Audit" → error
(18+ rules total, per exchange)
```

#### Workflow
```
1. Query completed_tasks for company
2. For each IPO_SEQUENCING_RULE:
   a. Check if prerequisite task is complete
   b. Check if dependent task is complete
   c. If dependent complete but prerequisite incomplete:
      → Add to violations array with severity
3. Return violations array with remediation hints
4. Dashboard shows violations with color coding (error=red, warning=yellow)
```

#### Code Location
- Module: `src/lib/ipo-sequencing.ts`
- Rules: `IPO_SEQUENCING_RULES` array (~18-20 entries)
- API: `src/app/api/pace/validate-sequencing/route.ts`

---

### 7. **Document Completeness Scorer Agent** (On-Demand)
**Path:** `/src/lib/document-scorer.ts`  
**Trigger:** Dashboard or `/api/pace/scores` endpoint  
**Responsibility:** Track and score document maturity across phases

#### Scoring Model
```
document_status_enum:
  'not_started'  → 0%
  'in_progress'  → 25%
  'draft'        → 50%
  'reviewed'     → 75%
  'final'        → 100%

phase_score = (task_completion × 60%) + (document_completeness × 40%)
```

#### Tracked Documents (Per Phase)
- Phase 1: Articles of Incorporation, Bylaws, Shareholder Agreements
- Phase 2: Cap Table, Cap Table Audit
- Phase 3: Financial Statements (3 years), Tax Returns
- Phase 4: Audited Financials
- ... (continues through Phase 8)

#### Code Location
- Module: `src/lib/document-scorer.ts`
- Database: `document_scorecards` table
- UI: Dashboard cards show document status per phase

#### Document Tracking
```sql
CREATE TABLE document_scorecards (
  id UUID PRIMARY KEY,
  company_id UUID,
  document_name VARCHAR(255),
  phase_id INT,
  completion_pct INT,              -- 0-100
  status ENUM('not_started', 'in_progress', 'draft', 'reviewed', 'final'),
  last_updated DATE,
  reviewer_notes TEXT,
  created_at TIMESTAMP
);
```

---

## Agent Communication Patterns

### Pattern 1: Direct Function Call
**Used For:** On-demand scoring, validation  
**Example:** Dashboard loads → calls `calculatePredictiveScore()` → returns data immediately  
**Latency:** < 500ms

```typescript
// From /src/app/pace/page.tsx
const paceData = await calculatePredictiveScore(companyId);
const sequencingIssues = await validateMilestoneSequence(companyId);
```

### Pattern 2: Webhook Event Processing
**Used For:** Real-time Stripe/payment events  
**Example:** Stripe sends invoice.payment_failed → webhook handler processes → database updated  
**Latency:** < 1s, retryable

```
POST /api/webhooks/stripe
↓
Verify signature
↓
Route to handler (payment_failed)
↓
Update database & send email
↓
Return 200 OK
```

### Pattern 3: Scheduled Task Execution
**Used For:** Periodic checks (migration monitor, trial expiry)  
**Example:** 18:45 UTC → scheduled task fires → migration checks → runs npm run db:migrate  
**Latency:** Minutes (check + execution)

```
System Clock: 18:45
↓
Scheduled task file executes
↓
Check Neon connectivity
↓
If online: Run migrations
↓
Send completion notification
```

### Pattern 4: API-Triggered Background Job
**Used For:** Admin actions requiring background processing  
**Example:** Admin calls `/api/webhooks/trial` → trial expiry agent processes all trials  
**Latency:** 5-30 seconds (depends on trial count)

```
curl POST /api/webhooks/trial
↓
Authenticate (Bearer token)
↓
Query all active trials
↓
Process each trial (expiry, auto-upgrade, emails)
↓
Return summary JSON
```

---

## Database Schema for Agents

### Core Agent Tables
```sql
-- Webhook event log (Stripe, trial, etc.)
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE,           -- Stripe/custom event ID
  event_type VARCHAR(255),                -- customer.subscription.created, etc.
  payload JSON,                           -- Full event data
  status ENUM('processed', 'failed', 'pending'),
  error_message TEXT,
  created_at TIMESTAMP
);

-- Document tracking (document completeness agent)
CREATE TABLE document_scorecards (
  id UUID PRIMARY KEY,
  company_id UUID,
  document_name VARCHAR(255),
  phase_id INT,
  completion_pct INT,                     -- 0-100
  status ENUM('not_started', 'in_progress', 'draft', 'reviewed', 'final'),
  last_updated DATE,
  created_at TIMESTAMP
);

-- IPO benchmarks (PACE agent)
CREATE TABLE ipo_benchmarks (
  id UUID PRIMARY KEY,
  exchange VARCHAR(20),                   -- TSX, NASDAQ, NYSE, etc.
  phase_id INT,
  avg_completion_pct FLOAT,
  median_completion_pct FLOAT,
  p90_completion_pct FLOAT,
  created_at TIMESTAMP
);

-- Trial tracking (trial expiry agent)
-- Extended in companies table:
-- trial_start_date DATE
-- trial_end_date DATE
-- trial_status ENUM('not_started', 'active', 'expired', 'upgraded')

-- Subscription tracking (Stripe webhook agent)
-- Extended in companies table:
-- stripe_customer_id VARCHAR(255)
-- subscription_id VARCHAR(255)
-- subscription_status ENUM('active', 'past_due', 'cancelled', 'trialing')
-- next_billing_date DATE
```

---

## Error Handling & Resilience

### Agent Failures (What Happens)
```
Scenario                   | Handling                      | User Impact
---------------------------|-------------------------------|-------------
Stripe webhook fails       | Logged, retry via exponential| No impact (payment still processes)
Migration fails            | Logged, retried next run      | Features delayed until online
Trial email send fails     | Logged, queued for retry      | May not see email (minor)
PACE calculation error     | Falls back to previous value  | Dashboard shows stale PACE
Document status not found  | Marks as "not_started"       | Conservative estimate
```

### Retry Logic
- **Stripe Webhooks:** Stripe retries 3 times over 2 hours (out of our control)
- **Migrations:** Retried on next scheduled trigger (idempotent)
- **Trial Expiry:** Retried daily until success
- **Emails:** Currently no retry (future: add to queue)

### Monitoring Agents
```bash
# Check webhook processing
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN status='processed' THEN 1 END) as success,
       COUNT(CASE WHEN status='failed' THEN 1 END) as failed
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

# Check if trial expiry ran
SELECT * FROM webhook_logs
WHERE event_type = 'trial_expiry_check'
ORDER BY created_at DESC LIMIT 5;

# Check migration status
SELECT * FROM schema_migrations
ORDER BY version DESC LIMIT 5;
```

---

## Agent Deployment & Configuration

### Environment Variables Required
```bash
# .env.local must contain:
DATABASE_URL=postgresql://...                  # Neon endpoint
STRIPE_SECRET_KEY=sk_live_...                  # Stripe secret
STRIPE_WEBHOOK_SECRET=whsec_...                # Stripe webhook signing secret
NEXTAUTH_SECRET=...                            # NextAuth session secret
TRIAL_WEBHOOK_SECRET=...                       # Internal webhook auth (to be set)

# Email provider (one of):
SENDGRID_API_KEY=...                           # OR
AWS_SES_REGION=us-east-1
AWS_SES_FROM_ADDRESS=noreply@ipoready.ai
```

### Scheduled Task Configuration
Handled by `mcp__scheduled-tasks__create_scheduled_task`:
- **File Location:** `/Users/test/.claude/scheduled-tasks/neon-migration-monitor/SKILL.md`
- **Schedule:** One-time at 2026-06-01T18:45:00-04:00
- **Recurrence:** After first run, should be converted to recurring daily check

---

## Future Improvements

### 1. Message Queue Integration
**Current:** Email sends direct (no retry)  
**Future:** Add BullMQ or AWS SQS for reliable email delivery with exponential backoff

### 2. Agent Monitoring & Alerting
**Current:** Logged to console/webhook_logs table  
**Future:** Datadog/New Relic integration for agent health monitoring

### 3. Distributed Agent Architecture
**Current:** All agents in single Next.js process  
**Future:** Extract to separate microservices (one per agent) for independent scaling

### 4. Agent Orchestration
**Current:** Manual scheduling via scheduled tasks  
**Future:** Temporal.io or Apache Airflow for complex multi-agent workflows

### 5. Observability
**Current:** Basic logging  
**Future:** OpenTelemetry instrumentation, distributed tracing across all agents

---

## Summary: Agent Responsibilities Map

| Agent Name | Type | Trigger | Primary Responsibility | Failure Tolerance |
|---|---|---|---|---|
| Neon Migration Monitor | Scheduled | Clock (18:45) | Apply DB migrations | High (retries) |
| Trial Expiry | Scheduled | API endpoint | Monitor/auto-upgrade trials | Medium (email optional) |
| Stripe Webhook | Event | Webhook | Process payments, subscriptions | Medium (Stripe retries) |
| Billing Notifications | Reactive | Other agents | Send transactional emails | Low (async queuing) |
| PACE Predictor | On-demand | API call | Score company progress | High (returns default) |
| IPO Sequencing Validator | On-demand | API call | Validate task order | High (returns empty) |
| Document Scorer | On-demand | API call | Track document maturity | High (conserv. estimate) |

---

**Document Version:** 1.0  
**Last Updated:** June 1, 2026  
**Next Review:** After introducing new agents or significant architecture changes
