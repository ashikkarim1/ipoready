# PACE Accuracy & Billing System Implementation Guide

## Overview

This guide covers the deployment and integration of two major systems:
1. **PACE Accuracy Deepening** - Benchmarking, predictive scoring, sequencing validation, document tracking
2. **Billing System Completion** - Stripe webhooks, trial management, feature gating

## Phase 1: Database Migrations

### 1. Apply Schema Changes

```bash
# Run the migration
psql $DATABASE_URL < src/lib/pace-billing-schema.sql

# Verify tables were created
psql $DATABASE_URL -c "\dt" | grep -E "(ipo_benchmarks|ipo_historical_data|document_scorecards|webhook_logs|billing_invoices|payment_history)"
```

### 2. Seed IPO Benchmarks

```bash
# In your Node.js/TypeScript environment:
import { seedIpoBenchmarks } from '@/lib/seed-ipo-benchmarks'

await seedIpoBenchmarks()
console.log('✅ Benchmarks seeded')
```

### 3. Initialize Document Scorecards (Optional)

For existing companies, initialize their document scorecards:

```bash
import { initializeDocumentScorecardsForCompany } from '@/lib/document-scorer'

// For each company:
for (const company of companies) {
  await initializeDocumentScorecardsForCompany(company.id)
}
```

## Phase 2: Environment Variables

Add/update in `.env.local`:

```bash
# Stripe (already configured, validate)
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (for email notifications)
RESEND_API_KEY=re_...
```

## Phase 3: API Endpoint Updates

### Update PACE Scores Endpoint

Modify `/src/app/api/pace/scores/route.ts` to include new fields:

```typescript
// Add these imports
import { calculatePredictiveScore } from '@/lib/pace-predictor'
import { getActiveViolations, getSequencingRecommendations } from '@/lib/ipo-sequencing'
import { calculateDocumentReadinessScore } from '@/lib/document-scorer'
import { calculatePeerPercentile, getAverageDaysToIpoByExchange } from '@/lib/seed-ipo-benchmarks'

// In the GET handler, update the response:
const predictive = await calculatePredictiveScore(companyId)
const violations = await getActiveViolations(companyId)
const docScore = await calculateDocumentReadinessScore(companyId)
const peerPercentile = await calculatePeerPercentile(company.pace_score, company.target_exchange, phaseIndex + 1)

return NextResponse.json({
  ...existingData,
  // New fields
  predictiveScore: {
    adjustedScore: predictive.adjustedPaceScore,
    baseScore: predictive.baseScore,
    adjustment: predictive.adjustment,
    confidenceLevel: predictive.confidenceLevel,
    estimatedDaysToIpoAdjusted: predictive.estimatedDaysToIpoAdjusted,
    riskFactors: predictive.riskFactors,
  },
  benchmarking: {
    peerPercentile,
    avgDaysToIpoByExchange: await getAverageDaysToIpoByExchange(company.target_exchange),
  },
  documentReadiness: docScore,
  sequencingAlerts: violations.map(v => ({
    rule: v.rule,
    severity: v.severity,
  })),
})
```

### Add New API Endpoints

Create `/src/app/api/admin/company-factors/route.ts`:

```typescript
import { updateCompanyFactors, getReadinessFactors } from '@/lib/pace-predictor'

export async function PATCH(req: Request) {
  const { companyId, factors } = await req.json()
  
  // Verify admin access
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return new Response('Unauthorized', { status: 401 })
  
  await updateCompanyFactors(companyId, factors)
  const readiness = await getReadinessFactors(companyId)
  
  return Response.json({ success: true, readiness })
}
```

Create `/src/app/api/features/gates/route.ts`:

```typescript
import { getFeatureGatesForUI } from '@/lib/feature-gates'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  
  if (!companyId) return new Response('Missing companyId', { status: 400 })
  
  const gates = await getFeatureGatesForUI(companyId)
  return Response.json(gates)
}
```

## Phase 4: UI Integration

### Add Trial Banner to Dashboard

In `/src/app/dashboard/page.tsx`:

```typescript
import { getTrialUiData } from '@/lib/trial-manager'

// In component:
const trialData = await getTrialUiData(companyId)

// Render banner:
{trialData.showTrialBanner && trialData.activeBanner && (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
    <p className="font-semibold">{trialData.activeBanner.message}</p>
    <a href={trialData.activeBanner.ctaUrl} className="btn btn-primary mt-2">
      {trialData.activeBanner.cta}
    </a>
  </div>
)}
```

### Add PACE Readiness Factors Card

In `/src/app/pace/page.tsx`:

```typescript
import { getReadinessFactors } from '@/lib/pace-predictor'

const readiness = await getReadinessFactors(companyId)

// Add to UI:
<Card title="Readiness Factors">
  {readiness?.cashRunway && (
    <div>
      <strong>Cash Runway:</strong> {readiness.cashRunway.months} months
      <StatusBadge status={readiness.cashRunway.status} />
    </div>
  )}
  {/* ...other factors */}
</Card>
```

### Add Document Tracking Page

Create `/src/app/documents/page.tsx` with document scorecard UI

## Phase 5: Billing Checkout Updates

Update `/src/app/api/checkout/route.ts`:

```typescript
// Add trial_upgrade detection:
const isTrialUpgrade = searchParams.get('trial_upgrade') === 'true'
const trialData = isTrialUpgrade ? await getTrialInfo(companyId) : null

// When creating session:
const session = await stripe.checkout.sessions.create({
  ...sessionParams,
  metadata: {
    ...metadata,
    trial_upgrade: isTrialUpgrade,
    trial_plan: trialData?.trialPlan,
  },
})
```

## Phase 6: Cron/Background Jobs

Create a cron job to handle trial expiry (runs daily):

```typescript
// /src/app/api/cron/trial-expiry/route.ts
import { checkExpiredTrials, handleTrialExpiry } from '@/lib/trial-manager'
import { getTrialsExpiringsoon, markTrialWarningAsSent } from '@/lib/trial-manager'
import { sendTrialExpiryWarningEmail } from '@/lib/billing-notifications'

export async function POST(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check expiring trials (2 days before)
  const expiringTrials = await getTrialsExpiringsoon(2)
  for (const trial of expiringTrials) {
    await sendTrialExpiryWarningEmail({
      companyName: trial.name,
      userEmail: 'user@company.com', // Get from users table
      daysRemaining: 2,
      planName: 'Growth',
    })
    await markTrialWarningAsSent(trial.id)
  }

  // Handle expired trials
  const expired = await checkExpiredTrials()
  for (const exp of expired) {
    await handleTrialExpiry(exp.id)
  }

  return Response.json({ processed: expired.length })
}
```

## Phase 7: Testing Checklist

### PACE System Testing
- [ ] Seed benchmarks - verify data in `ipo_benchmarks` table
- [ ] Calculate PACE score - check API returns new fields
- [ ] Predictive scoring - update cash_runway_months, verify adjusted score changes
- [ ] Document tracking - create/update scorecard, verify completeness score
- [ ] Sequencing validation - verify violations detected
- [ ] Peer percentile - compare to benchmarks

### Billing System Testing
- [ ] Stripe webhook signature verification - use Stripe CLI
- [ ] Subscription creation - verify company record updated
- [ ] Payment failure - verify email sent, failure count incremented
- [ ] Trial creation - verify trial_status = 'active'
- [ ] Trial expiry - verify handled correctly
- [ ] Feature gates - verify locked features based on plan

### Test Stripe Webhooks Locally
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events:
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.updated
```

## Phase 8: Monitoring & Maintenance

### Monitor Webhook Health
```sql
SELECT event_type, status, COUNT(*) as count, MAX(created_at) as last_event
FROM webhook_logs
GROUP BY event_type, status
ORDER BY last_event DESC;
```

### Check Failed Webhooks
```sql
SELECT event_id, event_type, error_message, created_at
FROM webhook_logs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

### Monitor Trial Status
```sql
SELECT trial_status, COUNT(*) as count
FROM companies
WHERE trial_status != 'not_started'
GROUP BY trial_status;
```

## Phase 9: Rollout Strategy

1. **Day 1**: Deploy schema migrations + run benchmarks seed
2. **Day 2**: Deploy API updates + webhook handler
3. **Day 3**: Deploy UI changes + feature gates
4. **Day 4**: Enable cron jobs + start billing notifications
5. **Day 5**: Monitor and iterate based on production data

## Troubleshooting

### Webhook Not Processing
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook endpoint is accessible: `curl -X POST https://yourapp.com/api/webhooks/stripe`
- Check webhook_logs table for error_message

### PACE Score Not Updating
- Verify `pace-billing-schema.sql` migration ran successfully
- Check company has target_exchange set
- Verify tasks table has data for the company

### Trial Banner Not Showing
- Check company has trial_start_date and trial_end_date set
- Verify getTrialUiData is called with correct companyId
- Check date comparison logic (now() vs trial_end_date)

### Benchmarks Not Seeding
- Verify ipo_benchmarks table created
- Check seedIpoBenchmarks() was called
- Validate exchange names match (lowercase)

## Next Steps

After deployment:
1. Monitor production webhook processing
2. Gather feedback on new PACE features
3. Optimize queries if needed
4. Consider implementing usage-based billing tier
5. Expand document requirements by industry/exchange
