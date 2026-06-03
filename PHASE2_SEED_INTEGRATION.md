# Phase 2 Seed Script Integration Guide

## For Developers & QA

This guide explains how to use the Phase 2 seed script in development, testing, and demo workflows.

## Development Workflow

### 1. Fresh Database Setup

```bash
# Run all migrations (creates schema)
npm run db:migrate

# Seed benchmark data and test account
npm run seed:benchmarks

# Seed Phase 2 test data
npm run seed:phase2:test
```

### 2. During Feature Development

When building Phase 2A/B/C/D features:

```bash
# Start dev server with seeded data
npm run dev

# Open http://localhost:3000/dashboard
# Test features against realistic $50M+ cost data
```

### 3. Resetting for Clean Tests

```bash
# Option A: Partial reset (re-seed only)
npm run seed:phase2:test

# Option B: Full reset (re-migrate everything)
npm run db:migrate && npm run seed:benchmarks && npm run seed:phase2:test
```

## Feature Testing Checklist

### Cost Tracking (Phase 2A)

```typescript
// Test filtering cost_items
test('Filter costs by category', async () => {
  // Database contains:
  // - 6 legal items, 4 audit items, 4 IB items, etc.
  const legal = await fetchCostItems({ category: 'legal' })
  expect(legal.length).toBe(6)
  expect(legal.reduce((sum, item) => sum + item.amount_usd, 0)).toBe(5200000)
})

// Test budget tracking
test('Calculate budget variance', async () => {
  const metrics = await getLatestFinancialMetrics()
  const variance = metrics.budget_variance_pct
  expect(variance).toBeLessThan(5) // Should be on track
})

// Test cost status workflow
test('Track cost approval workflow', async () => {
  const estimated = await fetchCostItems({ status: 'estimated' })
  const committed = await fetchCostItems({ status: 'committed' })
  expect(estimated.length).toBeGreaterThan(0)
  expect(committed.length).toBeGreaterThan(0)
})
```

### Dilution Modeling (Phase 2B)

```typescript
// Test cap table dilution
test('Calculate dilution from Series C', async () => {
  const baseCase = await getDilutionScenario('Series C @ $25/share (Base Case)')
  
  expect(baseCase.post_fully_diluted_shares).toBe(112000000)
  expect(baseCase.post_post_money_valuation_usd).toBe(2800000000)
  
  // Verify cap table
  const shareholders = await getShareholderDetails(baseCase.id)
  expect(shareholders.length).toBe(5) // Founder, employee pool, Series A, Series B, Series C
})

// Test ownership calculations
test('Verify shareholder ownership percentages', async () => {
  const scenario = await getDilutionScenario('Series C @ $25/share (Base Case)')
  const shareholders = await getShareholderDetails(scenario.id)
  
  const totalOwnership = shareholders.reduce((sum, sh) => sum + sh.ownership_pct_post, 0)
  expect(totalOwnership).toBeCloseTo(100, 1) // Should sum to 100%
})
```

### Consent Workflows (Phase 2D)

```typescript
// Test consent request statuses
test('Filter consents by status', async () => {
  const signed = await fetchConsentRequests({ status: 'signed' })
  const pending = await fetchConsentRequests({ status: 'pending' })
  
  expect(signed.length).toBe(3)
  expect(pending.length).toBe(2)
})

// Test rejection workflow
test('Handle rejected consent with resubmit', async () => {
  const rejected = await getConsentRequest('Patricia Lee')
  expect(rejected.status).toBe('rejected')
  expect(rejected.can_resubmit).toBe(true)
  
  // Simulate resubmission
  await resubmitConsent(rejected.id)
  const updated = await getConsentRequest('Patricia Lee')
  expect(updated.status).toBe('pending')
})

// Test deadline tracking
test('Alert on approaching consent deadline', async () => {
  const upcoming = await fetchConsentRequests({
    deadline_before: addDays(today(), 7),
    status: 'pending'
  })
  expect(upcoming.length).toBeGreaterThan(0)
})
```

### Listing Requirements (Phase 2D)

```typescript
// Test exchange-specific requirements
test('Load NASDAQ requirements', async () => {
  const nasdaq = await getListingRequirements('NASDAQ')
  expect(nasdaq.length).toBe(8)
  
  const completed = nasdaq.filter(r => r.status === 'completed')
  expect(completed.length).toBe(2) // Min shares, min market cap
})

// Test compliance tracking
test('Calculate compliance percentage', async () => {
  const requirements = await getListingRequirements('NASDAQ')
  const completionPct = requirements.reduce((sum, r) => sum + r.completion_pct, 0) / requirements.length
  expect(completionPct).toBeGreaterThan(50) // Mostly in progress
})

// Test multi-exchange readiness
test('Compare readiness across exchanges', async () => {
  const nasdaq = await getListingRequirements('NASDAQ')
  const nyse = await getListingRequirements('NYSE')
  const tsx = await getListingRequirements('TSX')
  
  const nasdaqReady = nasdaq.filter(r => r.is_compliant).length
  const nyseReady = nyse.filter(r => r.is_compliant).length
  const tsxReady = tsx.filter(r => r.is_compliant).length
  
  // All exchanges should have some completed requirements
  expect(nasdaqReady).toBeGreaterThan(0)
  expect(nyseReady).toBeGreaterThan(0)
  expect(tsxReady).toBeGreaterThan(0)
})
```

## End-to-End (E2E) Testing

### Sample E2E Test Flow

```typescript
describe('Phase 2 IPO Readiness Dashboard', () => {
  beforeAll(async () => {
    // Ensure seeded data is present
    const metrics = await getLatestFinancialMetrics()
    if (!metrics) {
      throw new Error('Run: npm run seed:phase2:test')
    }
  })

  test('Complete IPO readiness workflow', async () => {
    // User logs in
    await login('test@ipoready.com')
    
    // 1. Check cost tracking dashboard
    const dashboard = await navigateTo('/dashboard/phase2/costs')
    expect(dashboard).toContainText('$50.2M')
    
    // 2. Review dilution scenarios
    const scenarios = await navigateTo('/dashboard/phase2/dilution')
    const baseCase = await selectScenario('Series C @ $25/share')
    expect(baseCase.founder_dilution_pct).toBe(-10.7)
    
    // 3. Review consent requests
    const consents = await navigateTo('/dashboard/phase2/consents')
    expect(consents).toHaveConsentsWithStatus('pending', 2)
    
    // 4. Check board resolutions
    const resolutions = await navigateTo('/dashboard/phase2/resolutions')
    expect(resolutions).toHaveResolutionsWithStatus('approved', 6)
    
    // 5. Check listing requirements
    const requirements = await navigateTo('/dashboard/phase2/listing')
    expect(requirements).toHaveRequirementsByExchange('NASDAQ', 8)
  })
})
```

## Performance Testing

### Load Testing with Phase 2 Data

```typescript
// Jest/Vitest performance test
describe('Phase 2 Query Performance', () => {
  test('Cost item filtering should be < 100ms', async () => {
    const start = performance.now()
    const costs = await fetchCostItems({ 
      category: 'legal',
      status: 'estimated'
    })
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100)
    expect(costs.length).toBeGreaterThan(0)
  })

  test('Financial metrics aggregation < 200ms', async () => {
    const start = performance.now()
    const metrics = await getAggregatedMetrics({
      period: '24_months'
    })
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(200)
    expect(metrics.length).toBe(24)
  })

  test('Dilution calculation with cap table < 150ms', async () => {
    const start = performance.now()
    const scenario = await getDilutionScenario('Series C @ $25/share (Base Case)')
    const shareholders = await getShareholderDetails(scenario.id)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(150)
    expect(shareholders.length).toBe(5)
  })
})
```

## Data Export Testing

```typescript
// Test reporting/export features
test('Export cost report as CSV', async () => {
  const costs = await fetchCostItems()
  const csv = await generateCSVReport(costs)
  
  // Verify CSV structure
  expect(csv).toContain('cost_category,amount_usd,status')
  expect(csv.lines).toBe(45) // 44 items + header
  expect(csv).toContain('legal')
  expect(csv).toContain('50200000') // Total
})

test('Export financial metrics as Excel', async () => {
  const metrics = await getFinancialMetrics({ period: '24_months' })
  const excel = await generateExcelReport(metrics)
  
  expect(excel.sheets).toContain('Summary')
  expect(excel.sheets).toContain('Monthly Detail')
  expect(excel.rows).toBeGreaterThan(24)
})

test('Export cap table with scenarios', async () => {
  const scenarios = await getDilutionScenarios()
  const report = await generateCapTableReport(scenarios)
  
  expect(report.pages).toBe(3) // One per scenario
  expect(report).toContainAllScenarios()
})
```

## Visual Regression Testing

```typescript
// Test UI components with realistic data
test('Cost category pie chart renders correctly', async () => {
  await navigateTo('/dashboard/costs')
  const chart = await getElement('[data-testid="cost-breakdown-chart"]')
  
  const screenshot = await chart.screenshot()
  expect(screenshot).toMatchSnapshot('cost-breakdown-baseline.png')
})

test('Consent request list displays all statuses', async () => {
  await navigateTo('/dashboard/consents')
  
  // Should show all 10 items with appropriate status badges
  const items = await getElements('[data-testid="consent-item"]')
  expect(items.length).toBe(10)
  
  // Verify status badge colors
  expect(await getElement('[data-status="signed"]')).toBeVisible()
  expect(await getElement('[data-status="pending"]')).toBeVisible()
  expect(await getElement('[data-status="rejected"]')).toBeVisible()
})
```

## Demo Mode

### Using Phase 2 Data for Demos

```bash
# Start app with seeded demo data
npm run dev

# Point demo to test account
# - Email: test@ipoready.com
# - Company: MediFlow Health Technologies Inc.
# - Valuation: $100M
```

#### Demo Talking Points

**Cost Tracking Dashboard:**
- "We track $50.2M in IPO costs across 44 line items"
- "Vendors, approval workflows, and budget tracking built-in"
- "Filter by category, phase, or approval status"

**Financial Metrics:**
- "24 months of monthly KPI snapshots"
- "Budget variance tracking with burn rate analysis"
- "Predictive runway calculations"

**Dilution Scenarios:**
- "Three financing scenarios with automatic cap table updates"
- "Base case shows $300M Series C with 10.7% founder dilution"
- "Five shareholder classes with pre/post ownership tracking"

**Consent Management:**
- "10 consent requests with mixed statuses"
- "Tracks signature method, deadline, and approval"
- "Rejection workflow with resubmission capability"

**Regulatory Compliance:**
- "22 listing requirements across 3 major exchanges"
- "NASDAQ, NYSE, and TSX all tracked simultaneously"
- "Completion tracking and exemption management"

## Continuous Integration

### CI Pipeline Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      
      - run: npm ci
      - run: npm run db:migrate
      - run: npm run seed:benchmarks
      - run: npm run seed:phase2:test
      - run: npm test
      - run: npm run test:e2e
```

## Troubleshooting

### Common Issues

**Issue: "User test@ipoready.com not found"**
```bash
# Solution: Run benchmark seed first
npm run seed:benchmarks
```

**Issue: "Duplicate key value violates unique constraint"**
```bash
# Solution: The script ran partially; clean and retry
npm run db:migrate  # Resets data
npm run seed:phase2:test
```

**Issue: Tests timing out**
```typescript
// Solution: Increase Jest timeout for Phase 2 tests
jest.setTimeout(10000) // 10 seconds
```

**Issue: Financial metrics dates inconsistent**
```bash
# Solution: Ensure DATABASE_URL points to correct timezone-aware database
# The script uses NOW() which respects server timezone
```

## Next Steps

1. **Run the seed script:**
   ```bash
   npm run seed:phase2:test
   ```

2. **Verify data loaded:**
   ```sql
   SELECT COUNT(*) FROM cost_items WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';
   ```

3. **Start testing Phase 2 features** with realistic data

4. **Adapt seed data** as requirements evolve:
   - Add more cost categories
   - Extend financial metric period
   - Create new scenario types
   - Add more exchanges

## Support

- **Quick reference:** /PHASE2_SEED_QUICK_START.md
- **Full documentation:** /PHASE2_SEED_SCRIPT.md
- **Delivery summary:** /PHASE2_SEED_DELIVERY.txt
- **Schema reference:** /migrations/018_phase2a_2d_comprehensive_schema.sql

---

**Last Updated:** 2025-06-03  
**Test Account:** test@ipoready.com  
**Execution:** `npm run seed:phase2:test`
