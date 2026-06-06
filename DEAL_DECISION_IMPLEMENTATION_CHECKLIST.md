# Deal Decision Intelligence - Implementation Checklist

**Project:** Deal Decision Intelligence (DDI)  
**Status:** Phase 2 Planning  
**Owner:** Product Engineering  
**Target Launch:** Week 12 of Phase 2  
**Last Updated:** June 7, 2026

---

## Phase 2.1: Market Intelligence (Weeks 1-4)

### Database Schema
- [ ] Create `market_intelligence` table (daily snapshots)
- [ ] Create `comparable_ipo_performance` table (1,000+ IPOs)
- [ ] Create `company_valuation_comparables` table (peer multiples)
- [ ] Create indexes on: sector, revenue_range, growth_rate, launch_date
- [ ] Create migration file: `migrations/XXX_market_intelligence.sql`
- [ ] Test schema with sample data

### Data Ingestion
- [ ] Build SEC EDGAR S-1 parser
  - [ ] Fetch S-1 filings (last 5 years, 500+ IPOs)
  - [ ] Extract: offering price, date, company name, revenue, growth
  - [ ] Store in `comparable_ipo_performance`
- [ ] Build SEDAR prospectus parser
  - [ ] Fetch prospectus documents (last 5 years, 200+ Canadian IPOs)
  - [ ] Extract same fields as SEC parser
  - [ ] Store in `comparable_ipo_performance`
- [ ] Build valuation multiple aggregator
  - [ ] Fetch peer data (Morningstar API or data file)
  - [ ] Calculate EV/Revenue, P/E multiples
  - [ ] Store in `company_valuation_comparables`
- [ ] Create batch job script: `/scripts/ingest-historical-ipos.ts`
- [ ] Create scheduled job: Update market intelligence weekly
- [ ] Create scheduled job: Update post-IPO performance daily

### Post-IPO Performance Tracking
- [ ] Build price tracking system
  - [ ] Fetch current stock prices for all comparative IPOs (via API or CSV)
  - [ ] Calculate performance_30d, performance_90d, performance_1y
  - [ ] Store lockup event dates and post-lockup performance
- [ ] Create dashboard to show tracking accuracy
- [ ] Validate performance data with known IPOs

### Market Intelligence Engine
- [ ] Build market sentiment analyzer
  - [ ] Track VIX (volatility index)
  - [ ] Track Fed rate
  - [ ] Track inflation rate
  - [ ] Aggregate analyst sentiment (manual or via API)
- [ ] Build sector performance indexer
  - [ ] Group IPOs by SIC code
  - [ ] Calculate median 30-day, 90-day performance by sector
  - [ ] Identify hot/cold sectors
- [ ] Build dry powder tracker
  - [ ] Estimate capital availability (via market data)
  - [ ] Forecast 6-month trends
- [ ] Build optimal window finder
  - [ ] Identify 6 upcoming months ranked by attractiveness
  - [ ] Score based on: sentiment, sector performance, volatility, capital availability

### API Endpoints
- [ ] `GET /api/deal-decision/market-intelligence/sector/:sic`
  - Returns: market conditions, recent IPOs, performance stats
- [ ] `GET /api/deal-decision/market-intelligence/optimal-windows`
  - Returns: next 6 months ranked by attractiveness
- [ ] `GET /api/deal-decision/market-intelligence/comparables?revenue=50M&sector=SaaS`
  - Returns: 20-30 comparable IPOs with full details
- [ ] Test all endpoints with mock data
- [ ] Document API responses

### QA Testing
- [ ] Verify parser accuracy (manually check 10 SEC/SEDAR filings)
- [ ] Verify performance calculation (spot-check 5 IPOs)
- [ ] Verify API response correctness
- [ ] Performance test: API should return <500ms for any query
- [ ] Test data freshness (market data should be <1 day old)

---

## Phase 2.2: Company Readiness Integration (Weeks 2-5)

### Readiness Aggregator
- [ ] Build `getCompanyReadiness()` function
  - [ ] Pull PACE metrics from existing system
  - [ ] Pull compliance checklist status
  - [ ] Pull team data (CFO, auditor, counsel hired? how long ago?)
  - [ ] Normalize all metrics to 0-100 scale
  - [ ] Combine with weighted average (PACE 40%, compliance 35%, team 25%)
- [ ] Store readiness_metrics in companies table (JSONB)
- [ ] Create function to detect bottlenecks
  - [ ] Audit not started? Flag it + calculate impact
  - [ ] CFO not hired? Flag it + estimate hiring timeline
  - [ ] Team gaps? Flag each one
- [ ] Create function to generate readiness recommendations
  - [ ] For each bottleneck, suggest action + timeline
  - [ ] Link to existing guidance library
  - [ ] Estimate impact on optimal launch window

### Readiness Timeline Builder
- [ ] Build critical path analysis
  - [ ] Audit: 12 weeks from start (must start by week X to launch on time)
  - [ ] CFO hiring: 8 weeks from start (must start by week X)
  - [ ] Legal: 4 weeks before launch
  - [ ] Governance: varies by company size/jurisdiction
- [ ] Create milestone timeline
  - [ ] Backward from target launch date
  - [ ] Show which milestones are on critical path
  - [ ] Flag which ones are at risk
- [ ] Create function: "If we target [launch date], when must we start [task]?"

### Risk Assessment
- [ ] Build risk calculator for each bottleneck
  - [ ] Audit delay: +1 week delay → +X% probability of missing target
  - [ ] Team delay: +1 month hiring → +X% probability of missing target
  - [ ] Regulatory issue: +X weeks of remediation
- [ ] Create risk matrix: Likelihood × Impact
- [ ] Quantify cost of delay (in terms of valuation impact)

### API Endpoints
- [ ] `GET /api/deal-decision/company-readiness/:companyId`
  - Returns: overall score, bottlenecks, recommendations
- [ ] `GET /api/deal-decision/readiness-timeline/:companyId?targetLaunchDate=2026-09-15`
  - Returns: critical path, milestone timeline, at-risk items
- [ ] Test endpoints with sample companies

---

## Phase 2.3: Historical IPO Database (Weeks 3-8)

### Data Collection
- [ ] Run SEC EDGAR parser on 500+ S-1 filings
  - [ ] Verify 100+ sample extractions manually
  - [ ] Debug parser errors
  - [ ] Store 500+ records in database
- [ ] Run SEDAR parser on 200+ prospectuses
  - [ ] Verify 50+ sample extractions manually
  - [ ] Debug parser errors
  - [ ] Store 200+ records in database
- [ ] Validate total dataset: 700+ IPOs across 10 years
- [ ] Check data quality:
  - [ ] No null values in critical fields
  - [ ] Dates are valid
  - [ ] Valuation multiples are reasonable (not outliers)
  - [ ] Performance data is complete

### Anonymization
- [ ] Implement company name anonymization (UUID + sector + size)
- [ ] Verify anonymized data is not reversible
- [ ] Create mapping table (encrypted, access-controlled)
- [ ] Set up regulatory compliance (GDPR, privacy)

### Post-IPO Performance Integration
- [ ] Fetch current stock prices for all 700+ IPOs
- [ ] Calculate performance_30d, performance_90d, performance_1y
- [ ] Track lockup events (get from prospectus)
- [ ] Calculate post-lockup performance
- [ ] Identify regulatory issues (comment letters, restatements) from SEC filings
- [ ] Create audit trail of where data came from

### Comparable IPO Finder
- [ ] Implement cosine similarity matching
  - [ ] Features: sector, revenue, growth rate, profitability
  - [ ] Test on 10 sample companies
  - [ ] Verify results are sensible
- [ ] Create ranking system (how similar is each comparable?)
- [ ] Return top 30 comparables
- [ ] API endpoint: `GET /api/deal-decision/comparables?revenue=50M&sector=SaaS`

### QA Testing
- [ ] Verify data accuracy on 20 spot-checked IPOs
- [ ] Verify similarity matching returns sensible results
- [ ] Performance test: Query should return <1 second
- [ ] Test with edge cases (very small company, very large, exotic sector)

---

## Phase 2.4: Recommendation Engine (Weeks 6-10)

### Timing Recommendation
- [ ] Implement `generateTimingRecommendation()` function
  - [ ] Identify viable market windows (next 6 months)
  - [ ] Cross with readiness timeline
  - [ ] Analyze seasonality effects (from historical data)
  - [ ] Select optimal window with confidence score
- [ ] Implement risk analysis
  - [ ] What if we launch too early? (readiness risk)
  - [ ] What if we launch too late? (market risk)
  - [ ] What if audits get delayed? (critical path risk)
- [ ] Create milestone timeline
  - [ ] Task, start date, complete date
  - [ ] Flag which are on critical path
  - [ ] Estimate buffer time
- [ ] Test with 10 different company scenarios
- [ ] Validate confidence scores (check against historical accuracy)

### Valuation Recommendation
- [ ] Implement `generateValuationRecommendation()` function
  - [ ] Calculate peer multiples from comparables
  - [ ] Determine median, Q1, Q3
  - [ ] Adjust for growth rate (high-growth companies warrant premium)
  - [ ] Calculate valuation range for company
- [ ] Determine pricing strategy
  - [ ] Conservative: 25th percentile of peers
  - [ ] Market: Median of peers
  - [ ] Aggressive: 75th percentile of peers
- [ ] Support with data
  - [ ] Show # of comparable companies
  - [ ] Show median growth rate of comparables
  - [ ] Show profit/loss breakdown
- [ ] Test with 10 different companies
- [ ] Validate against actual IPO pricing (did historical companies price where model predicted?)

### Terms Recommendation
- [ ] Implement underwriter recommendation
  - [ ] Group comparables by lead underwriter
  - [ ] Calculate average post-IPO performance by underwriter
  - [ ] Rank underwriters by average return
  - [ ] Recommend top 3
- [ ] Implement lockup recommendation
  - [ ] Calculate median, Q1, Q3 from comparables
  - [ ] Recommend founder lockup (conservative: Q3)
  - [ ] Recommend employee lockup (market: median)
  - [ ] Show market context
- [ ] Implement offering size recommendation
  - [ ] Based on valuation range + capital needs
  - [ ] Cross-reference with comparable offering sizes
- [ ] Test with sample companies

### Scenario Modeling
- [ ] Implement bull/base/bear scenario generator
  - [ ] Bull: positive assumptions, positive outcomes
  - [ ] Base: neutral assumptions, neutral outcomes
  - [ ] Bear: negative assumptions, negative outcomes
- [ ] For each scenario:
  - [ ] Market cap at launch
  - [ ] Performance at day 30
  - [ ] Lockup event outcome
  - [ ] Risk factors
- [ ] Assign probabilities (bull 25%, base 50%, bear 25%)
- [ ] Test with sample companies

### API Endpoints
- [ ] `POST /api/deal-decision/recommendation`
  - Input: companyId
  - Output: timing, valuation, terms, scenarios, auditTrail
  - Response time: <3 seconds
- [ ] `POST /api/deal-decision/scenario-simulator`
  - Input: companyId, shock type + magnitude
  - Output: updated timing, valuation, risks
- [ ] Test endpoints with 5 sample companies

### QA & Validation
- [ ] Validate timing recommendations against historical accuracy
  - [ ] Did companies that launched in recommended windows perform better?
  - [ ] Target: >80% of companies in recommended windows outperformed
- [ ] Validate valuation recommendations
  - [ ] Did companies that priced near recommendation achieve better performance?
  - [ ] Target: 70%+ of companies at recommended pricing outperformed
- [ ] Validate terms recommendations
  - [ ] Did recommended underwriters have better performance?
  - [ ] Target: 75%+ success rate
- [ ] Benchmark confidence scores
  - [ ] "95% confidence" recommendation should be right 95% of the time
  - [ ] Calibrate confidence thresholds

---

## Phase 2.5: Dashboard & UI (Weeks 8-12)

### Pages to Build

#### Main Dashboard (`/deal-decision`)
- [ ] Design layout (Figma → React)
- [ ] Build TimingRecommendationCard
  - [ ] Show optimal window with start/end dates
  - [ ] Show confidence score
  - [ ] Show # of comparable IPOs
  - [ ] Show median performance at 30 days
  - [ ] Show timeline with milestones
  - [ ] Show risks (early, late, delay)
  - [ ] "Approve Launch Window" button
- [ ] Build ValuationRecommendationCard
  - [ ] Show valuation range (low/high)
  - [ ] Chart: peer multiples (histogram)
  - [ ] Show # of peers included
  - [ ] Show median growth rate of peers
  - [ ] Pricing strategy selector (conservative/market/aggressive)
- [ ] Build TermsRecommendationCard
  - [ ] Show recommended underwriters with rationale
  - [ ] Show lockup recommendation (founder, employee)
  - [ ] Show market median lockup
  - [ ] Show offering size recommendation
- [ ] Build ScenarioCards (bull/base/bear)
  - [ ] Show probability for each scenario
  - [ ] Show assumptions
  - [ ] Show outcomes (market cap, performance, lockup)
  - [ ] Show risk factors
- [ ] Build AuditTrailSection
  - [ ] Show decisions recorded
  - [ ] Show approval status (pending/approved)
  - [ ] Show counsel sign-offs
  - [ ] Show dates
- [ ] Add metric boxes showing data freshness
- [ ] Test responsiveness (mobile, tablet, desktop)

#### Market Intelligence Page (`/deal-decision/market`)
- [ ] Design layout
- [ ] Build OptimalWindowsList
  - [ ] Show next 6 months ranked by attractiveness
  - [ ] Attractiveness score + breakdown
  - [ ] Recent IPOs in timeframe
  - [ ] Forecast dry powder
- [ ] Build SectorPerformanceChart
  - [ ] 12-month historical performance by sector
  - [ ] Company's sector highlighted
- [ ] Build ComparableIPOsTable
  - [ ] Sortable table: sector, revenue, growth, launch date, performance, underwriter
  - [ ] Filter by sector, revenue range, growth rate
  - [ ] Click to see details
- [ ] Build MarketConditionsWidgets
  - [ ] VIX/Volatility
  - [ ] Fed rate
  - [ ] Inflation
  - [ ] Sentiment score
- [ ] Test with real data

#### Scenario Simulator (`/deal-decision/scenarios`)
- [ ] Design interface
- [ ] Build ShockSelector
  - [ ] Dropdown: market downturn, audit delay, team departure, etc.
  - [ ] Slider: magnitude (10%, 20%, 30%, etc.)
- [ ] Build SimulationResults
  - [ ] Show original recommendation
  - [ ] Show updated timing
  - [ ] Show updated valuation
  - [ ] Show updated risks
  - [ ] Comparison view (side-by-side)
- [ ] Implement multiple shock combinations (what if 2+ things happen?)
- [ ] Test with 10 scenario combinations

#### Audit Trail Page (`/deal-decision/audit-trail`)
- [ ] Design timeline view
- [ ] Build DecisionRecordForm
  - [ ] Decision dropdown (launch window, valuation, terms, etc.)
  - [ ] Reasoning text input
  - [ ] Approved by (role selector)
  - [ ] Counsel firm name
  - [ ] Submit button
- [ ] Build DecisionTimeline
  - [ ] Chronological list of decisions
  - [ ] Decision type, date, approved by, counsel
  - [ ] Link to recommendation that was approved
- [ ] Build ComplianceMetrics
  - [ ] % decisions with counsel sign-off
  - [ ] % decisions with board approval
  - [ ] Average time to approval
- [ ] Implement audit export (PDF report)

### Components to Build
- [ ] TimingRecommendationCard
- [ ] ValuationRecommendationCard
- [ ] TermsRecommendationCard
- [ ] ScenarioCard (bull/base/bear)
- [ ] MarketConditionsWidget
- [ ] ConfidenceScore
- [ ] TimelineChart
- [ ] MultipleComparison
- [ ] OptimalWindowsList
- [ ] ShockSelector
- [ ] DecisionRecordForm
- [ ] DecisionTimeline

### Styling & UX
- [ ] Use design system colors, fonts, spacing
- [ ] Create DDI-specific color scheme (recommend: blues/greens for positive, reds for risk)
- [ ] Add loading states for all data fetches
- [ ] Add error handling + fallbacks
- [ ] Add empty states for new companies
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing (WCAG 2.1)

### Testing
- [ ] Component unit tests (Vitest)
- [ ] Integration tests (page → API)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests (Percy or similar)
- [ ] Performance testing (Lighthouse)

---

## Phase 2: Testing & Validation (Weeks 10-12)

### Functional Testing
- [ ] Test all API endpoints with 10 sample companies
- [ ] Verify recommendations are sensible
- [ ] Verify confidence scores are calibrated
- [ ] Test all UI interactions
- [ ] Test scenario simulator with 20+ combinations

### Accuracy Validation
- [ ] Timing recommendations: Did recommended windows outperform?
- [ ] Valuation recommendations: Did recommended pricing achieve better performance?
- [ ] Terms recommendations: Did recommended underwriters have better performance?
- [ ] Target accuracy: >85% on all three dimensions

### Regulatory Testing
- [ ] Verify audit trail is immutable
- [ ] Verify counsel can sign off digitally
- [ ] Verify compliance with SOX/GDPR
- [ ] Get legal review of recommendations (advice vs. opinion)

### Performance Testing
- [ ] API response times: <500ms for any query
- [ ] Dashboard load time: <3 seconds
- [ ] Scenario simulator: <2 seconds per simulation
- [ ] Database query optimization (check query plans)

### User Testing
- [ ] Get feedback from 3-5 beta customers
- [ ] Test with CEO + CFO personas
- [ ] Verify recommendations are understandable
- [ ] Verify UI is intuitive
- [ ] Iterate based on feedback

---

## Launch Preparation (Week 12)

### Documentation
- [ ] API documentation (OpenAPI spec)
- [ ] User guide (how to interpret recommendations)
- [ ] Admin guide (how to update market data, troubleshoot)
- [ ] Regulatory guide (what decisions are defensible)
- [ ] FAQ (common questions)

### Customer Communication
- [ ] Write launch email
- [ ] Create tutorial video (5-10 min)
- [ ] Create blog post (value prop, use cases)
- [ ] Prepare webinar deck

### Monitoring & Support
- [ ] Set up error monitoring (Sentry)
- [ ] Set up performance monitoring (New Relic)
- [ ] Create runbook for common issues
- [ ] Set up customer support workflow

### Release Planning
- [ ] Feature flag: Enable DDI for pilot customers only
- [ ] A/B test: Compare DDI vs. non-DDI customers
- [ ] Gradual rollout: 10% → 25% → 50% → 100%
- [ ] Monitor metrics: Usage, engagement, NPS

---

## Success Criteria

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Feature Adoption** | 20%+ of customers | # companies using DDI / total companies |
| **Engagement** | 2+ simulations/month | # scenario simulations per company |
| **Accuracy (Timing)** | >80% outperformance | % recommended windows beat market |
| **Accuracy (Valuation)** | >70% outperformance | % recommended pricing beat market |
| **Accuracy (Terms)** | >75% outperformance | % recommended underwriters beat market |
| **API Performance** | <500ms p95 | Response time distribution |
| **Dashboard Performance** | <3s load time | Page load time from browser |
| **Data Freshness** | <1 day old | Age of market intelligence data |
| **Customer NPS** | +2 points | Surveys of DDI users |
| **ARPU Impact** | +$5-10K/month | Revenue per customer before/after DDI |

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Accuracy miss** | Medium | High | Early validation, iterate quickly |
| **Data quality issues** | High | Medium | Manual QA, parser testing |
| **Regulatory concern** | Low | High | Legal review before launch |
| **Performance issues** | Medium | Medium | Load testing, optimization |
| **Data sourcing delays** | High | Low | Use proxy data, manual entry if needed |
| **Customer confusion** | Medium | Medium | Clear UI, tutorial, support |

---

## Notes

- Start with market intelligence data collection immediately (high effort, independent)
- Comparable finder can start week 3 while data is still being collected
- Recommendation engine depends on all previous phases (start week 6)
- UI can start week 5 in parallel with backend (use mock data)
- Plan 2 weeks for testing + iteration before launch

