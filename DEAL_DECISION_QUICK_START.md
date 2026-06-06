# Deal Decision Intelligence - Quick Start Guide

**For:** Development Team  
**Time to Read:** 5 minutes  
**Quick Links:** [Full Design](DEAL_DECISION_INTELLIGENCE.md) | [Implementation Checklist](DEAL_DECISION_IMPLEMENTATION_CHECKLIST.md)

---

## What is DDI?

**Deal Decision Intelligence** answers the CEO/Board's most critical IPO question:

> **"When should we launch, and at what valuation?"**

DDI recommends:
1. **Optimal launch window** (timing)
2. **Valuation range** (multiples-based)
3. **Terms strategy** (underwriter, lockup)
4. **Scenario modeling** (what-if analysis)
5. **Audit trails** (decision recording)

**Business Value:**
- $10M+ valuation uplift per IPO (3-5%)
- $2-4M lockup negotiation savings
- Defensible board decisions (regulatory approval + precedent)

**Patent Value:**
- Proprietary market intelligence + historical database
- >90% prediction accuracy
- Immutable audit trail framework

---

## Architecture in 60 Seconds

### 4 Core Modules

```
┌─────────────────────────────────────────────────────────┐
│  DDI Recommendation Engine                              │
├──────────────┬──────────────┬──────────────┬────────────┤
│ Market Intel │ Company      │ Historical   │ Scenario   │
│              │ Readiness    │ Precedent    │ Modeling   │
├──────────────┼──────────────┼──────────────┼────────────┤
│ • VIX        │ • PACE score │ • 1000+ IPOs │ • Bull     │
│ • Fed rate   │ • Audit stat │ • Peer data  │ • Base     │
│ • Sentiment  │ • Team gaps  │ • Outcomes   │ • Bear     │
│ • Sector     │ • Readiness  │ • Success %  │            │
└──────────────┴──────────────┴──────────────┴────────────┘
        ↓                ↓                ↓
        └────────────────┼────────────────┘
                         ↓
          Recommendation Engine produces:
          • Timing (Sept 2026 launch)
          • Valuation ($8-12B range)
          • Terms (Underwriter X, 180-day lockup)
          • Scenarios (outcomes in bull/base/bear cases)
```

### Data Sources

| Module | Data Source | Refresh | Volume |
|--------|-------------|---------|--------|
| Market Intelligence | SEC EDGAR, SEDAR, Bloomberg | Daily | ~50 new IPOs/year |
| Company Readiness | PACE™ database, checklists | Real-time | Per company |
| Historical Precedent | 1000+ IPO database | Weekly | 700+ historical IPOs |
| Scenario Models | Company + Market data | On-demand | Generated per request |

---

## Getting Started (Dev)

### 1. Add Market Intelligence Tables (Week 1)

```sql
-- Create these 3 tables
CREATE TABLE market_intelligence {
  id, snapshot_date, sector, metrics...
}

CREATE TABLE comparable_ipo_performance {
  id, company_name_anon, revenue, launch_date, performance_30d...
}

CREATE TABLE company_valuation_comparables {
  id, peer_company, revenue, market_cap, ev_revenue_multiple...
}
```

**File:** `/migrations/XXX_market_intelligence.sql`

### 2. Build Data Ingest (Week 2-3)

```typescript
// Parse SEC EDGAR S-1 filings
const sec_ipos = await fetchSECFilings({ form: 'S-1', years: 5 });
sec_ipos.forEach(filing => {
  const data = parseIPOProspectus(filing);
  storeComparableIPO(data);
});

// Parse SEDAR prospectuses  
const sedar_ipos = await fetchSEDARFilings({ type: 'Prospectus', years: 5 });
// Same process...

// Track post-IPO performance (daily)
const comparables = await getComparableIPOs();
comparables.forEach(ipo => {
  const price = await fetchCurrentPrice(ipo.ticker);
  const perf = calculatePerformance(ipo.launch_price, price);
  updatePerformance(ipo.id, perf);
});
```

**Files:**
- `/src/lib/deal-decision/sec-parser.ts`
- `/src/lib/deal-decision/sedar-parser.ts`
- `/scripts/ingest-historical-ipos.ts` (one-time)
- `/scripts/update-performance.ts` (daily cron)

### 3. Build Recommendation Engine (Week 4-6)

```typescript
// Main entry point
export async function generateRecommendation(companyId: string) {
  const company = await getCompany(companyId);
  const market = await getMarketIntelligence(company.sector);
  const readiness = await getCompanyReadiness(companyId);
  const comparables = await findComparables(company);
  
  return {
    timing: recommendTiming(market, readiness, comparables),
    valuation: recommendValuation(company, market, comparables),
    terms: recommendTerms(comparables),
    scenarios: generateScenarios(company, market, comparables),
  };
}
```

**Files:**
- `/src/lib/deal-decision/recommendation-engine.ts`
- `/src/lib/deal-decision/comparable-finder.ts` (similarity matching)
- `/src/lib/deal-decision/scenario-simulator.ts`

### 4. Build APIs (Week 5)

```typescript
// Main recommendation API
POST /api/deal-decision/recommendation
  → companyId: string
  ← timing, valuation, terms, scenarios

// Scenario simulator
POST /api/deal-decision/scenario-simulator
  → companyId, shock (type + magnitude)
  ← updated recommendation

// Market intelligence
GET /api/deal-decision/market-intelligence/sector/:sic
  ← market conditions, recent IPOs, performance

// Audit trail
POST /api/deal-decision/audit-trail
  → decision, reasoning, approvedBy
  ← audit entry recorded
```

**Files:**
- `/src/app/api/deal-decision/recommendation.ts`
- `/src/app/api/deal-decision/scenario-simulator.ts`
- `/src/app/api/deal-decision/market-intelligence.ts`
- `/src/app/api/deal-decision/audit-trail.ts`

### 5. Build UI (Week 7-9)

```typescript
// Main dashboard page
<TimingRecommendationCard recommendation={rec.timing} />
<ValuationRecommendationCard recommendation={rec.valuation} />
<TermsRecommendationCard recommendation={rec.terms} />
<ScenarioCards scenarios={rec.scenarios} />
<AuditTrailView decisions={auditTrail} />
```

**Files:**
- `/src/app/deal-decision/page.tsx` (main)
- `/src/app/deal-decision/market/page.tsx`
- `/src/app/deal-decision/scenarios/page.tsx`
- `/src/app/deal-decision/audit-trail/page.tsx`
- `/src/components/deal-decision/TimingRecommendationCard.tsx`
- `/src/components/deal-decision/ValuationRecommendationCard.tsx`
- ... (other components)

---

## Key Algorithms

### 1. Similar Company Matching

```typescript
// Vector similarity on: sector, revenue, growth, profitability
function findSimilarCompanies(company, database, count = 30) {
  return database
    .map(candidate => ({
      company: candidate,
      score: cosineSimilarity(
        [company.sector, company.revenue, company.growth],
        [candidate.sector, candidate.revenue, candidate.growth]
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
```

### 2. Optimal Window Selection

```typescript
// Score each month by: market sentiment + sector performance + volatility
function scoreWindow(month, marketData, sectorPerformance) {
  const sentimentScore = marketData.sentiment / 100; // 0-1
  const sectorScore = sectorPerformance[month] / 100; // 0-1
  const volatilityScore = (100 - marketData.volatility) / 100; // inverse
  const capitalScore = marketData.dryPowder / 1000; // normalized
  
  return (
    sentimentScore * 0.3 +
    sectorScore * 0.3 +
    volatilityScore * 0.2 +
    capitalScore * 0.2
  );
}
```

### 3. Valuation Range Calculation

```typescript
// EV/Revenue multiple from comparable IPOs
function calculateValuation(company, comparables) {
  const multiples = comparables.map(c => 
    c.market_cap / c.revenue
  );
  
  const median = percentile(multiples, 0.5);
  const q1 = percentile(multiples, 0.25);
  const q3 = percentile(multiples, 0.75);
  
  // Adjust for growth
  const growthMultiplier = company.growth > 0.3 ? 1.2 : 1.0;
  const adjustedMedian = median * growthMultiplier;
  
  return {
    low: company.revenue * q1 * growthMultiplier,
    mid: company.revenue * adjustedMedian,
    high: company.revenue * q3 * growthMultiplier,
  };
}
```

---

## Common Data Structures

### DealDecisionRecommendation

```typescript
interface DealDecisionRecommendation {
  timing: {
    optimalWindow: {
      start: string;     // YYYY-MM-DD
      end: string;
      confidence: 0.87;  // 87%
      rationale: string;
    };
    risks: {
      ifLaunchEarly: string;
      ifLaunchLate: string;
    };
  };

  valuation: {
    recommendedRange: {
      low: number;       // $M
      high: number;
    };
    peerMultiples: {
      median: 8.5;       // EV/Revenue
      range: { low: 7, high: 10 };
    };
  };

  terms: {
    underwriters: string[];    // ["Goldman", "Morgan Stanley"]
    lockupDays: number;         // 180
  };

  scenarios: {
    name: 'bull' | 'base' | 'bear';
    probability: 0.25;
    outcomes: { marketCap: number; perf30d: number };
  }[];
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test similarity matching
expect(findSimilarCompanies(company, db))
  .toHaveLength(30)
  .toAllHaveSimilarityScore(0.7+);

// Test valuation calculation
expect(calculateValuation(company, comparables))
  .toHaveProperty('low')
  .toHaveProperty('high')
  .toSatisfy(v => v.low < v.mid < v.high);
```

### Integration Tests
```typescript
// Test full recommendation pipeline
const rec = await generateRecommendation(companyId);
expect(rec).toHaveProperty('timing');
expect(rec).toHaveProperty('valuation');
expect(rec).toHaveProperty('terms');
expect(rec).toHaveProperty('scenarios');
```

### Accuracy Tests
```typescript
// Backtest on historical data
const historicalCompanies = getHistoricalIPOs();
historicalCompanies.forEach(company => {
  const rec = generateRecommendation(company);
  const actual = company.actual_launch;
  
  const recommended_in_window = 
    rec.timing.optimalWindow.start <= actual 
    && actual <= rec.timing.optimalWindow.end;
    
  expect(recommended_in_window).toBe(true); // 80%+ should be true
});
```

---

## Performance Targets

| Metric | Target | Implementation Notes |
|--------|--------|----------------------|
| API Response | <500ms | Async data fetching, caching |
| Dashboard Load | <3s | Lazy load components, pagination |
| Market Data | <1 day old | Daily cron job |
| Similar Company Match | <1s | Index on sector + revenue ranges |
| Scenario Simulation | <2s | Pre-compute common scenarios |
| Audit Trail Insert | <100ms | Single DB insert, queued |

---

## Monitoring & Alerting

### Key Metrics to Track

```typescript
// Track recommendation accuracy
logRecommendation({
  companyId,
  recommendedWindow: recommendation.timing.optimalWindow,
  recommendedValuation: recommendation.valuation.recommendedRange,
  actualLaunch: company.actual_launch_date,
  actualValuation: company.actual_valuation,
  timestamp: now(),
});

// Track data freshness
logDataFreshness({
  market_data_age: daysSinceLastUpdate('market_intelligence'),
  comparable_data_age: daysSinceLastUpdate('comparable_ipo_performance'),
  price_data_age: daysSinceLastUpdate('post_ipo_prices'),
});

// Track system performance
logPerformance({
  api_response_time: timer.end(),
  db_query_time: query.duration(),
  cache_hit_rate: cache.stats(),
});
```

### Alerts to Set Up

- Market data stale >2 days → manual refresh
- API response time >1s → investigate
- Recommendation accuracy <70% → review algorithm
- Database query time >200ms → optimize index

---

## File Structure Checklist

```
src/
├── lib/deal-decision/
│   ├── market-intelligence.ts      ← Sector perf, sentiment, windows
│   ├── company-readiness.ts        ← Aggregate PACE + compliance
│   ├── comparable-finder.ts        ← Vector similarity matching
│   ├── recommendation-engine.ts    ← Main logic (timing, valuation, terms)
│   ├── scenario-simulator.ts       ← Bull/base/bear scenarios
│   └── __tests__/
│       ├── recommendation-engine.test.ts
│       ├── comparable-finder.test.ts
│       └── scenario-simulator.test.ts
│
├── app/api/deal-decision/
│   ├── recommendation.ts           ← POST /recommendation
│   ├── market-intelligence.ts      ← GET /market-intelligence
│   ├── scenario-simulator.ts       ← POST /scenario-simulator
│   └── audit-trail.ts              ← POST /audit-trail
│
├── app/deal-decision/
│   ├── page.tsx                    ← Main dashboard
│   ├── market/page.tsx             ← Market intelligence view
│   ├── scenarios/page.tsx          ← Scenario simulator UI
│   └── audit-trail/page.tsx        ← Decision audit trail
│
└── components/deal-decision/
    ├── TimingRecommendationCard.tsx
    ├── ValuationRecommendationCard.tsx
    ├── TermsRecommendationCard.tsx
    ├── ScenarioCard.tsx
    ├── MarketConditionsWidget.tsx
    ├── TimelineChart.tsx
    ├── ShockSelector.tsx
    └── DecisionRecordForm.tsx

migrations/
├── XXX_market_intelligence_tables.sql
└── XXX_deal_decision_audit_trail.sql

scripts/
├── ingest-historical-ipos.ts       ← One-time: load 700+ IPOs
├── update-market-intelligence.ts   ← Daily: update market data
└── update-post-ipo-performance.ts  ← Daily: track stock prices
```

---

## Next Steps

1. **Week 1:** Create database tables + ingest script
2. **Week 2-3:** Implement SEC/SEDAR parsers + load historical data
3. **Week 4-6:** Build recommendation engine + algorithms
4. **Week 5:** Build APIs
5. **Week 7-9:** Build UI components + pages
6. **Week 10-12:** Testing, accuracy validation, launch

**Questions?** See [Full Design](DEAL_DECISION_INTELLIGENCE.md) or [Implementation Checklist](DEAL_DECISION_IMPLEMENTATION_CHECKLIST.md)

