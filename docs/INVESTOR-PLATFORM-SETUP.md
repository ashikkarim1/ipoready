# IPOReady Investor Platform - Setup & Integration Guide

## Overview

This guide walks through setting up the investor platform with:
- Neon PostgreSQL database schema
- Resend email integration
- Investor matching and alerting system
- Real-time notifications

---

## Part 1: Database Setup

### 1.1 Create Tables in Neon PostgreSQL

Run the migration SQL in your Neon database:

```bash
# Copy the entire migration file
cat src/db/migrations/001_investor_platform.sql | psql [your-neon-connection-string]

# Or run via Neon dashboard:
# 1. Go to https://console.neon.tech
# 2. Select your project
# 3. SQL Editor → paste migration file → Execute
```

**Tables Created:**
- `investor_profiles` — Core investor data
- `investor_criteria` — Investment preferences & filters
- `investor_notification_preferences` — Email settings
- `investor_saved_companies` — Watchlist
- `investor_alerts` — Alert history
- `investor_messages` — Investor ↔ Company communication
- `investor_email_logs` — Resend delivery tracking
- `investor_portfolio` — Track investor's invested companies
- `investor_activity_log` — Audit trail of all actions

**Indexes Created:**
- Fast lookups by investor email, check size, alert type
- Optimized queries for unread alerts, pending follow-ups
- Composite indexes for common filters

**Triggers Created:**
- Auto-update `updated_at` on all tables
- Ensures accurate timestamp tracking

### 1.2 Verify Tables

```bash
# Connect to your database and verify
psql [your-neon-connection-string]

# Check tables exist
\dt investor_*

# Check indexes
\di investor_*

# Sample query: All investors
SELECT * FROM investor_profiles LIMIT 5;
```

---

## Part 2: Environment Variables

### 2.1 Set Up Resend Email Service

Add to your `.env.local`:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=investor-alerts@ipoready.ai

# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/ipoready
NEON_API_KEY=qw_xxxxxxxxxxxxxxxxxxxx
```

### 2.2 Get Resend API Key

1. Go to [Resend Dashboard](https://dashboard.resend.com)
2. Click "API Keys" in sidebar
3. Create new API key (select "Full Access")
4. Copy the key to `RESEND_API_KEY`
5. Verify sender email is added (Settings → Sender Domain)

### 2.3 Get Database Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection string"
4. Copy PostgreSQL connection string
5. Paste to `DATABASE_URL`

---

## Part 3: TypeScript Types

The following types are available in `src/types/investor.ts`:

**Main Types:**
- `InvestorProfile` — Investor account info
- `InvestorCriteria` — Investment preferences
- `InvestorAlert` — Alert record
- `InvestorMessage` — Communication log
- `InvestorEmailLog` — Email delivery record

**Request/Response Types:**
- `CreateInvestorRequest` — New investor signup
- `UpdateInvestorCriteriaRequest` — Preferences update
- `SendInvestorAlertRequest` — Trigger alert
- `SendWeeklyDigestRequest` — Weekly summary

**Usage:**
```typescript
import { InvestorProfile, InvestorAlert } from '@/types/investor'

const investor: InvestorProfile = {
  id: '...',
  email: 'investor@fund.com',
  name: 'John Doe',
  firmName: 'Acme VC',
  // ...
}
```

---

## Part 4: Email Integration with Resend

### 4.1 Company Alert Emails

**When Triggered:**
- Company launches a fundraise
- Investor's criteria match
- Company PACE score > 50

**Email Content:**
- Company name & sector
- Funding amount & type
- PACE score
- Match percentage (0-100%)
- Recent milestones
- Call-to-action to view profile

**Template:** `src/lib/resend-email-service.ts` → `sendCompanyAlertEmail()`

**Example Usage:**
```typescript
import { sendCompanyAlertEmail } from '@/lib/resend-email-service'

const result = await sendCompanyAlertEmail({
  investorEmail: 'investor@fund.com',
  investorFirstName: 'John',
  companyName: 'TechStartup Inc',
  sector: 'Enterprise SaaS',
  stage: 'Series B',
  fundingAmount: 25000000,
  fundingType: 'equity',
  closureTimeline: '30-60 days',
  paceScore: 72,
  matchScore: 87,
  location: 'San Francisco, CA',
  recentMilestones: [
    'Reached $10M ARR',
    'Hired VP Engineering',
    'Expanded to EU'
  ],
  profileLink: 'https://www.ipoready.ai/investor/company/techstartup'
})

if (result.success) {
  console.log('Email sent:', result.messageId)
}
```

### 4.2 Weekly Digest Emails

**When Triggered:**
- Every Monday at 8 AM (configurable)
- Or when investor requests

**Email Content:**
- New matches this week
- Total active raises
- Total available capital
- Top 5 opportunities
- Call-to-action to view dashboard

**Template:** `src/lib/resend-email-service.ts` → `sendWeeklyDigestEmail()`

**Example Usage:**
```typescript
import { sendWeeklyDigestEmail } from '@/lib/resend-email-service'

const result = await sendWeeklyDigestEmail({
  investorEmail: 'investor@fund.com',
  investorFirstName: 'John',
  newMatches: 5,
  totalActive: 23,
  totalAvailable: 850000000,
  companies: [
    {
      name: 'TechStartup Inc',
      sector: 'Enterprise SaaS',
      fundingAmount: 25000000,
      fundingType: 'equity',
      stage: 'Series B',
      matchScore: 87
    },
    // ... more companies
  ]
})
```

### 4.3 Email Tracking

All emails are automatically tracked in `investor_email_logs` table:

| Field | Purpose |
|-------|---------|
| `resend_message_id` | Resend API message ID |
| `email_type` | company_alert, weekly_digest, outreach_template |
| `sent_at` | When email was sent |
| `opened_at` | When email was first opened |
| `clicked_at` | When email link was clicked |
| `bounced_at` | When delivery failed |

**Query recent emails:**
```sql
SELECT * FROM investor_email_logs
WHERE investor_id = 'investor-uuid'
ORDER BY sent_at DESC
LIMIT 20;
```

---

## Part 5: API Endpoints

### 5.1 Send Alert to Investor

**Endpoint:** `POST /api/investor/alerts`

**Request:**
```json
{
  "investorId": "uuid",
  "companyName": "TechStartup Inc",
  "sector": "Enterprise SaaS",
  "stage": "Series B",
  "fundingAmount": 25000000,
  "fundingType": "equity",
  "closureTimeline": "30-60 days",
  "paceScore": 72,
  "matchScore": 87,
  "location": "San Francisco, CA",
  "investorEmail": "investor@fund.com",
  "investorFirstName": "John",
  "profileLink": "https://www.ipoready.ai/investor/company/123"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "re_xxx",
  "message": "Alert sent to investor@fund.com"
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/investor/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "TechStartup Inc",
    "investorEmail": "test@example.com",
    "investorFirstName": "John",
    "fundingAmount": 25000000,
    "matchScore": 87
  }'
```

### 5.2 Get Investor Alerts

**Endpoint:** `GET /api/investor/alerts?investorId=uuid`

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "id": "alert-uuid",
      "companyName": "TechStartup Inc",
      "alertType": "company_raise",
      "severity": "HIGH",
      "fundingAmount": 25000000,
      "matchScore": 87,
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

## Part 6: Complete Integration Example

**Scenario:** A company launches a Series B raise and wants to notify matching investors.

### Step 1: Query Matching Investors

```typescript
// In your company fundraising workflow
const matchingInvestors = await queryInvestorsMatching({
  stage: 'Series B',
  sectors: ['Enterprise SaaS', 'B2B'],
  checkSizeMin: 5000000,
  checkSizeMax: 50000000,
  geographies: ['North America', 'Europe']
})

// Result: [
//   { id: '1', email: 'investor1@fund.com', name: 'John' },
//   { id: '2', email: 'investor2@vc.com', name: 'Jane' }
// ]
```

### Step 2: Trigger Alerts

```typescript
import { sendCompanyAlertEmail } from '@/lib/resend-email-service'

for (const investor of matchingInvestors) {
  const result = await sendCompanyAlertEmail({
    investorEmail: investor.email,
    investorFirstName: investor.name,
    companyName: 'TechStartup Inc',
    sector: 'Enterprise SaaS',
    stage: 'Series B',
    fundingAmount: 25000000,
    fundingType: 'equity',
    closureTimeline: '30-60 days',
    paceScore: calculatePACE(company),
    matchScore: calculateMatch(investor, company),
    location: company.location,
    profileLink: `/investor/company/${company.id}`,
    recentMilestones: company.milestones
  })

  if (result.success) {
    // Log to database
    await db.query(
      `INSERT INTO investor_email_logs 
       (investor_id, email_type, recipient_email, subject, resend_message_id, company_name, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        investor.id,
        'company_alert',
        investor.email,
        `Alert: TechStartup Inc is raising $25M`,
        result.messageId,
        'TechStartup Inc'
      ]
    )
  }
}
```

### Step 3: Monitor Delivery

```typescript
// Query email status after sending
const emailLog = await db.query(
  `SELECT * FROM investor_email_logs 
   WHERE resend_message_id = $1`,
  [result.messageId]
)

// Check if opened
if (emailLog.opened_at) {
  console.log('Email was opened!')
}

// Check if clicked
if (emailLog.clicked_at) {
  console.log('Investor clicked the link!')
}
```

---

## Part 7: Investor Matching Algorithm

### Matching Logic

An investor is notified when ALL of these conditions are met:

```
Company Stage ∈ Investor.preferred_stages
  AND
Company Sector ∈ Investor.preferred_sectors
  AND
Company Location ∈ Investor.preferred_geographies
  AND
Funding Amount ∈ [Investor.min_check_size, Investor.max_check_size]
  AND
Investor.email_notifications_enabled = true
```

### Match Score Calculation (0-100)

```
Base: 50 points
+ Stage alignment: 0-10 points
+ Sector alignment: 0-10 points
+ Geographic fit: 0-10 points
+ PACE score: 0-20 points (higher PACE = higher match)
─────────────
Total: 0-100
```

**Example:**
- Series B startup in Enterprise SaaS (aligned with investor's thesis): 60-70 points
- Same company with PACE 75+ (IPO-ready): 80-90 points
- Perfect fit: 95-100 points

---

## Part 8: Database Queries

### 8.1 Find Matching Investors for a Company

```sql
SELECT ip.id, ip.email, ip.name, 
       ic.preferred_stages, ic.preferred_sectors, ic.preferred_geographies
FROM investor_profiles ip
JOIN investor_criteria ic ON ip.id = ic.investor_id
JOIN investor_notification_preferences inp ON ip.id = inp.investor_id
WHERE 
  -- Stage match
  $1 = ANY(ic.preferred_stages)
  -- Sector match
  AND $2 = ANY(ic.preferred_sectors)
  -- Geography match
  AND $3 = ANY(ic.preferred_geographies)
  -- Check size match
  AND ip.min_check_size <= $4 AND ip.max_check_size >= $4
  -- Notifications enabled
  AND inp.email_notifications_enabled = true
  AND inp.real_time_alerts_enabled = true;
```

### 8.2 Get Investor's Recent Alerts

```sql
SELECT * FROM investor_alerts
WHERE investor_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 20;
```

### 8.3 Get Unread Alerts

```sql
SELECT * FROM investor_alerts
WHERE investor_id = $1
  AND email_opened = false
ORDER BY created_at DESC;
```

### 8.4 Get Email Delivery Stats

```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked
FROM investor_email_logs
WHERE investor_id = $1
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

---

## Part 9: Testing

### 9.1 Test Email Sending

```bash
# Run in your Next.js app directory
node -e "
const { sendCompanyAlertEmail } = require('./src/lib/resend-email-service');

sendCompanyAlertEmail({
  investorEmail: 'your-email@example.com',
  investorFirstName: 'Test',
  companyName: 'TestCorp',
  sector: 'SaaS',
  stage: 'Series B',
  fundingAmount: 25000000,
  fundingType: 'equity',
  closureTimeline: '30 days',
  paceScore: 70,
  matchScore: 85,
  location: 'SF',
  profileLink: 'https://example.com'
}).then(r => console.log(r))
"
```

### 9.2 Test Database Queries

```bash
# Connect to database and test
psql [your-connection-string] -c "
SELECT COUNT(*) FROM investor_profiles;
SELECT COUNT(*) FROM investor_email_logs;
"
```

### 9.3 Monitor Resend Webhooks

Resend automatically tracks email events. View in dashboard:
1. https://dashboard.resend.com/logs
2. Filter by email type
3. See delivery, open, click events

---

## Part 10: Deployment Checklist

Before going live:

- [ ] Database migration run successfully (`\dt investor_*` shows all tables)
- [ ] `RESEND_API_KEY` set in production environment
- [ ] `RESEND_FROM_EMAIL` verified in Resend dashboard
- [ ] Test email sending to real investor email
- [ ] Verify email deliverability (check spam folder)
- [ ] API endpoints tested with cURL
- [ ] Database queries optimized (check with `EXPLAIN`)
- [ ] Email template styling looks good on mobile
- [ ] Unsubscribe links working
- [ ] Error logging configured

---

## Part 11: Support & Troubleshooting

### Email Not Sending?

1. Check `RESEND_API_KEY` is set and valid
2. Verify domain is authorized in Resend dashboard
3. Check email address is valid (no typos)
4. Check Resend API status: https://status.resend.com
5. Review error log: `console.error()` in email service

### Database Connection Failed?

1. Verify `DATABASE_URL` format
2. Check Neon project is active
3. Verify IP whitelist allows your server
4. Test connection: `psql [connection-string]`

### Missing Tables?

1. Re-run migration: `cat src/db/migrations/001_investor_platform.sql | psql [connection-string]`
2. Verify no SQL syntax errors
3. Check table permissions

### Email Validation Issues?

1. Check investor email format is valid
2. Verify no special characters in name fields
3. Sanitize company name (no quotes, newlines, etc.)

---

## Contact & Resources

- **Resend Docs:** https://resend.com/docs
- **Neon Docs:** https://neon.tech/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Last Updated:** June 5, 2026  
**Status:** Production Ready
