# Board & Talent Marketplace - Quick Start Guide

## 30-Second Overview
The Board & Talent Marketplace connects IPO-ready companies with verified board members and executives. Anti-circumvention logic ensures a 2% finders fee is collected when both parties confirm identical compensation packages.

## Installation

### 1. Apply Database Migration (1 minute)
```bash
psql $DATABASE_URL < migrations/022_board_talent_marketplace.sql
```

This creates:
- 4 tables (professionals, introductions, hiring_confirmations, referrals)
- 15 pre-loaded professionals
- 3 views and 1 verification function

### 2. Verify Setup (1 minute)
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM professionals"
# Output: 15
```

### 3. Start Dev Server
```bash
npm run dev
```

## First API Call (2 minutes)

### Search Professionals
```bash
curl "http://localhost:3000/api/professionals/search?verified=true"
```

**Expected Response:**
```json
{
  "professionals": [
    {
      "id": "uuid...",
      "name": "Sarah Chen",
      "professionalTitle": "Board Director",
      "yearsPublicExperience": 12,
      "rateExpectationsAnnual": 75000
    },
    // ... 14 more professionals
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 15,
    "hasMore": false
  }
}
```

## Complete Workflow (5 minutes)

### Step 1: Get Company ID
```bash
# From your database or existing company in system
export COMPANY_UUID="your-company-uuid"
export USER_UUID="your-user-uuid"
```

### Step 2: Search Professionals by Industry
```bash
curl "http://localhost:3000/api/professionals/search?industry=Technology&verified=true"
```

Extract a professional ID:
```bash
export PROF_ID="uuid-from-response"
```

### Step 3: Get Smart Recommendations
```bash
curl "http://localhost:3000/api/professionals/recommendations?company_id=$COMPANY_UUID&role=director&industry=Technology"
```

**Response includes match scores 0-100**

### Step 4: Request Introduction
```bash
curl -X POST http://localhost:3000/api/introductions/request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "professionalId": "'$PROF_ID'",
    "companyId": "'$COMPANY_UUID'",
    "roleSeeking": "Board Member - Audit Committee",
    "message": "We are seeking an experienced audit committee member for our upcoming IPO."
  }'
```

**Response:**
```json
{
  "message": "Introduction request sent successfully",
  "introduction": {
    "id": "intro-uuid",
    "status": "pending"
  }
}
```

### Step 5: Professional Accepts
```bash
export INTRO_ID="intro-uuid-from-response"

curl -X POST http://localhost:3000/api/introductions/$INTRO_ID/accept \
  -H "Cookie: next-auth.session-token=PROF_SESSION"
```

**Status changes to "accepted"**

### Step 6: Company Confirms Hire
```bash
curl -X POST http://localhost:3000/api/hiring/confirm \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=COMPANY_SESSION" \
  -d '{
    "introductionId": "'$INTRO_ID'",
    "hireDate": "2026-07-15",
    "position": "Board Member - Audit Committee",
    "compensationPackage": {
      "cash": 50000,
      "bonus": 10000
    },
    "confirmedByRole": "company"
  }'
```

### Step 7: Professional Confirms (Same Compensation)
```bash
curl -X POST http://localhost:3000/api/hiring/confirm \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=PROF_SESSION" \
  -d '{
    "introductionId": "'$INTRO_ID'",
    "hireDate": "2026-07-15",
    "position": "Board Member - Audit Committee",
    "compensationPackage": {
      "cash": 50000,
      "bonus": 10000
    },
    "confirmedByRole": "professional"
  }'
```

**Response:**
```json
{
  "message": "Confirmation recorded for professional - Both parties confirmed.",
  "hiringConfirmation": {
    "bothConfirmed": true,
    "isDisputed": false
  }
}
```

### Step 8: Admin Calculates Fees
```bash
export HIRING_ID="from-previous-response"

curl -X POST http://localhost:3000/api/hiring/$HIRING_ID/calculate-fees \
  -H "Cookie: next-auth.session-token=ADMIN_SESSION"
```

**Response:**
```json
{
  "message": "Fees calculated successfully",
  "feeCalculation": {
    "totalCompensation": 60000,
    "findersFeeAmount": 1200,
    "referralCommissionAmount": 120,
    "paymentStatus": "invoice_sent",
    "dueDate": "2026-07-04"
  }
}
```

## Key Concepts

### Anti-Circumvention
Both parties must confirm IDENTICAL compensation. If different:
```json
{
  "error": "Compensation packages do not match",
  "action": "Marked as disputed - requires manual resolution"
}
```

### Fee Structure
- **Finders Fee:** 2% of total compensation (company pays IPOReady)
- **Referral Commission:** 10% of finders fee (if referrer exists)

Example: $60,000 compensation → $1,200 finders fee → $120 referral commission

### Status Flow
```
Introduction: pending → accepted
Hiring: unconfirmed → company_confirmed → both_confirmed
Payment: pending → invoice_sent → paid
```

## View Professional Referral Earnings
```bash
curl "http://localhost:3000/api/professional-stats/referral-earnings" \
  -H "Cookie: next-auth.session-token=PROF_SESSION"
```

**Response includes:**
- Pending commissions
- Earned commissions
- Paid commissions
- Commission history

## Common Curl Commands

### Register New Professional
```bash
curl -X POST http://localhost:3000/api/professionals/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "professionalTitle": "Board Director",
    "yearsPublicExperience": 10,
    "industries": ["Technology"],
    "regions": ["Toronto"]
  }'
```

### Search by Multiple Criteria
```bash
curl "http://localhost:3000/api/professionals/search?industry=Technology,Finance&region=Toronto&experience=10&verified=true&limit=5"
```

### Get Professional Profile
```bash
curl "http://localhost:3000/api/professionals/$PROF_ID"
```

### Admin Verify Professional
```bash
curl -X POST http://localhost:3000/api/professionals/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=ADMIN_SESSION" \
  -d '{
    "professionalId": "'$PROF_ID'",
    "status": "verified",
    "notes": "LinkedIn verified, excellent track record"
  }'
```

## Testing Anti-Circumvention

### Test 1: Matching Compensation (Fee Due)
Company confirms: `{cash: 50000, bonus: 10000}`  
Professional confirms: `{cash: 50000, bonus: 10000}`  
**Result:** Both confirmed ✓, Fee calculated: $1,200

### Test 2: Mismatched Compensation (Disputed)
Company confirms: `{cash: 50000, bonus: 10000}`  
Professional confirms: `{cash: 50000, bonus: 15000}`  
**Result:** Marked as disputed ✗, Manual review required

### Test 3: Referral Commission
When hiring is confirmed, check referral earnings:
```bash
curl "http://localhost:3000/api/professional-stats/referral-earnings" \
  -H "Cookie: next-auth.session-token=REFERRER_SESSION"
# Shows $120 referral commission (10% of $1,200 finders fee)
```

## Database Queries

### View All Professionals
```sql
SELECT name, professional_title, industries, years_public_experience
FROM professionals
ORDER BY years_public_experience DESC;
```

### View Seeded Data Quality
```sql
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified,
  AVG(years_public_experience) as avg_experience,
  COUNT(DISTINCT industries[1]) as unique_industries
FROM professionals;
```

### View Introduction Activity
```sql
SELECT
  status,
  COUNT(*) as count
FROM professional_introductions
GROUP BY status;
```

### View Hiring Confirmations & Fees
```sql
SELECT
  hc.position,
  hc.finders_fee_amount,
  hc.referral_commission_amount,
  hc.payment_status,
  hc.is_disputed
FROM hiring_confirmations hc
ORDER BY hc.created_at DESC;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 15 professionals not appearing | Run migration: `psql $DATABASE_URL < migrations/022_board_talent_marketplace.sql` |
| 401 Unauthorized | Ensure auth session token is included in Cookie header |
| 403 Forbidden | Verify user has correct role (admin for verify/calculate-fees) |
| Compensation mismatch | This is intentional for testing dispute detection |
| Empty search results | Try `?verified=true` to filter for seeded professionals |

## Next Steps

1. **Read Full Documentation**
   - API Docs: `BOARD_TALENT_MARKETPLACE_API.md`
   - Implementation: `MARKETPLACE_IMPLEMENTATION_GUIDE.md`

2. **Build Frontend**
   - Professional search component
   - Introduction request flow
   - Hiring confirmation modal
   - Referral earnings dashboard

3. **Integrate Email**
   - Notification when introduction requested
   - Confirmation when hire accepted
   - Alert when fees due

4. **Add Stripe**
   - Payment processing
   - Invoice generation
   - Webhook handling

## Support

**See:** `MARKETPLACE_IMPLEMENTATION_GUIDE.md` for:
- Complete API reference
- Fee structure examples
- Dispute resolution process
- Performance optimization
- Security considerations

---

**Ready to go!** Start with the search endpoint above and build from there.
