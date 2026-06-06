# Valuation/Timing Decision Intelligence Solution

**Status:** Phase 2 Strategic Implementation  
**Module Type:** AI-Powered Deal Decision Engine  
**Owner:** Product (Core Feature)  
**Value:** $10M+ per IPO (3-5% valuation uplift + reduced timing risk)  
**Last Updated:** June 7, 2026

---

## Executive Summary

**Problem:** IPOReady's customers (boards and CEOs) face the most critical decision in their company's history with no data:
- "Should we launch September or wait until January?"
- "Are we leaving money on the table?"
- "What if the market drops next week?"
- "What's a fair valuation to ask for?"

Decision is **political, not strategic**. Board debates for months. Wrong call costs $20M+ in lost valuation or forces disadvantageous lockup terms.

**Solution:** **Valuation/Timing Decision Intelligence (VTDI)** — a real-time AI engine that answers:

```
RECOMMENDATION (Board Report Format):
├─ TIMING: "Launch Sept 15, 2026 (market window open, readiness 76%)"
├─ VALUATION: "$9-11B range (peer median 7.2x revenue, your growth premium 0.8x)"
├─ CONFIDENCE: "80% (audit completion = critical path)"
├─ ALTERNATIVE: "Jan 2027 launch: $8-10B range, 95% confidence (lower risk)"
└─ RISK: "If audit delays 4 weeks, Jan becomes optimal"
```

**Business Value:**
- **Valuation Upside:** $10M+ per IPO (3-5% better pricing via timing + confidence)
- **Risk Reduction:** Avoid $20M+ losses from bad launch windows
- **Negotiation Leverage:** Better underwriter/lockup terms (save $2-4M)
- **Board Alignment:** Decision backed by data = no politics, faster approvals
- **Defensible Governance:** Complete audit trail for SEC/regulators

---

## Architecture Overview

### 1. Market Intelligence Module

**Purpose:** Real-time market conditions + peer valuation data

**Data Inputs:**
```typescript
interface MarketSnapshot {
  // Sector Performance (refreshed weekly)
  sector: {
    name: string;                           // "SaaS", "MedTech", etc.
    recent_ipo_count: number;               // Last 90 days
    median_ipo_return_30d: number;          // % (e.g., +12.5%)
    median_ipo_return_90d: number;          // % (e.g., +8.2%)
    volatility_30d: number;                 // % (e.g., 23.4%)
    sector_ytd_return: number;              // % vs index
  };

  // Comparable IPO Performance (anonymized database of last 5 years)
  comparable_ipos: {
    id: string;                             // Anonymized
    sector: string;
    revenue_at_launch: number;              // $M
    growth_rate_yoy: number;                // %
    profitability: 'profitable' | 'losses';
    ipo_date: string;                       // YYYY-MM-DD
    offering_price: number;                 // $/share
    offering_size: number;                  // $M
    ipo_valuation: number;                  // $B
    current_price: number;                  // Latest
    performance_30d: number;                // %
    performance_90d: number;                // %
    performance_365d: number;               // %
    lockup_expiry_date: string;
    underwriter: string;                    // "Goldman Sachs", etc.
  }[];

  // Peer Valuation Multiples (daily snapshot)
  peer_multiples: {
    company_name: string;
    ticker: string;
    revenue_ttm: number;                    // $M
    market_cap: number;                     // $B
    ev_revenue: number;                     // Median 7.2x
    ev_ebitda: number;
    pe_ratio: number;
    revenue_growth_yoy: number;
    net_margin: number;
    data_date: string;
  }[];

  // Capital Markets Conditions
  market_conditions: {
    fed_rate: number;                       // Current %
    vix_index: number;                      // Volatility Index
    market_ytd_return: number;              // S&P 500 %
    credit_spreads_bps: number;             // Basis points
    dry_powder_billions: number;            // Available capital
    analyst_sentiment: number;              // -100 to +100
    ipo_pipeline_count: number;             // Upcoming IPOs
    market_trend: 'bull' | 'neutral' | 'bear';
  };

  // Seasonality / Historical Window Quality
  historical_window_analysis: {
    month: string;                          // "September"
    historical_success_rate: number;        // % of IPOs in this month succeeded
    avg_return_30d: number;                 // %
    avg_return_90d: number;                 // %
    seasonality_score: number;              // -1 (bad) to +1 (good)
    comparable_years: number;               // How many data points?
  };
}
```

**Data Sources:**
1. **SEC EDGAR:** S-1, 424B5, 10-K/10-Q filings (1,000+ IPOs)
2. **SEDAR:** Canadian IPO prospectuses (300+ IPOs)
3. **Real-time APIs:** Bloomberg Terminal, FactSet, Capital IQ
4. **Market feeds:** Fed calendar, VIX, equity index performance
5. **Internal:** IPOReady customer IPO outcomes (anonymized)

**Output:** Market attractiveness score (1-10), optimal launch windows, capital availability forecast, risk flags

---

### 2. Company Readiness Module

**Purpose:** Measure how close company is to being IPO-ready

**Data Inputs:**
```typescript
interface CompanyReadiness {
  // Regulatory Readiness (from PACE™ system)
  regulatory: {
    pace_governance_score: number;          // 0-100 (board prep, SOX controls, etc.)
    pace_overall: number;                   // 0-100
    compliance_checklist_pct_complete: number;  // 0-100
    critical_items_open: number;            // Count of red items
    critical_item_oldest_days: number;      // Days since created
    days_to_100pct_estimate: number;        // Projected days to complete
  };

  // Financial Readiness
  financial: {
    audit_complete: boolean;
    audited_years: number;                  // 2 or 3?
    sox_controls_tested: boolean;
    internal_controls_effective: boolean;
    auditor_reputation: 'Big4' | 'mid-tier' | 'other';
    revenue_growth_yoy: number;             // %
    net_margin: number;                     // %
    revenue_ttm: number;                    // $M (estimate)
    profitability_status: 'profitable' | 'near_breakeven' | 'operating_losses';
    days_until_audit_complete_estimate: number;
  };

  // Team Readiness
  team: {
    cfo_in_place: boolean;
    cfo_has_public_company_exp: boolean;
    cfo_years_experience: number;
    auditor_selected: boolean;
    legal_counsel_selected: boolean;
    underwriter_selected: boolean;
    ir_officer_hired: boolean;
    key_team_members_stable: boolean;
    recent_executive_departures: number;    // In past 12 months
  };

  // Narrative Readiness
  narrative: {
    prospectus_draft_complete: boolean;
    management_presentation_ready: boolean;
    competitive_moat_clear: boolean;       // Yes/No from management
    market_story_compelling: boolean;       // Yes/No from management
    investor_targeting_complete: boolean;
    unique_value_prop: string;              // Elevator pitch
  };

  // Operational Readiness
  operations: {
    financial_systems_upgraded: boolean;
    disclosure_controls_in_place: boolean;
    environmental_assessments_complete: boolean;
    litigation_risk_summary: string;        // Known issues
    regulatory_approvals_needed: string[];
    major_customer_concentrations: number;  // % of revenue
  };
}
```

**Calculation:**
```typescript
function calculateCompanyReadiness(data: CompanyReadiness): {
  overall_pct: number;
  bottlenecks: string[];
  critical_path_days: number;
} {
  const readiness_score = {
    regulatory: data.regulatory.pace_overall / 100,
    financial: data.financial.audit_complete ? 0.85 : 0.5,  // Audit = blocker
    team: data.team.cfo_in_place ? 0.8 : 0.4,
    narrative: data.narrative.prospectus_draft_complete ? 0.8 : 0.3,
    operations: data.operations.disclosure_controls_in_place ? 0.9 : 0.4,
  };

  const overall = (
    readiness_score.regulatory * 0.25 +
    readiness_score.financial * 0.30 +
    readiness_score.team * 0.20 +
    readiness_score.narrative * 0.15 +
    readiness_score.operations * 0.10
  ) * 100;

  const bottlenecks = identifyBottlenecks(data);
  const critical_path_days = estimateCriticalPath(data);

  return { overall_pct: overall, bottlenecks, critical_path_days };
}
```

---

### 3. Historical Precedent Module

**Purpose:** Find similar companies and outcomes for calibration

**Comparable Company Matching:**
```typescript
interface SimilarCompanyOutcome {
  // Anonymized historical IPO
  id: string;
  sector: string;
  revenue_at_launch: number;
  growth_rate: number;
  profitability: 'profitable' | 'losses';
  
  // Launch Metrics
  ipo_date: string;
  launch_month: string;
  offering_price: number;
  ipo_valuation: number;
  
  // Readiness at time of launch (what was their PACE?)
  readiness_at_launch: number;            // % (0-100)
  audit_complete_before_launch: boolean;
  team_experience: 'founder-led' | 'experienced' | 'mixed';
  
  // Market Conditions (snapshot)
  market_volatility: number;              // VIX
  fed_rate_at_launch: number;             // %
  sector_momentum: string;                // 'hot', 'normal', 'cold'
  
  // Outcomes (post-IPO)
  performance_30d: number;                // %
  performance_90d: number;                // %
  performance_365d: number;               // %
  lockup_expiry_date: string;
  lockup_pop_percentage: number;          // % jump on lockup expiry
  
  // Similarity Score to your company
  similarity_score: number;               // 0-1 (cosine similarity)
}
```

**Matching Algorithm:**
```typescript
function findComparableIPOs(
  company: CompanyReadiness,
  market: MarketSnapshot,
  limit: number = 20
): SimilarCompanyOutcome[] {
  // Feature vector: [revenue, growth, profitability, sector, readiness, timing]
  const your_vector = vectorize(company, market);
  
  // Find k-nearest neighbors in historical database
  const comparable_ipos = database.query(`
    SELECT id, revenue_at_launch, growth_rate, profitability, sector,
           readiness_at_launch, launch_month, ipo_valuation,
           performance_30d, performance_90d, performance_365d
    FROM historical_ipos
    WHERE sector = $1
    AND revenue_at_launch BETWEEN $2 * 0.5 AND $2 * 2
    ORDER BY similarity_score DESC
    LIMIT $3
  `, [company.sector, company.revenue_ttm, limit]);
  
  return comparable_ipos.map(row => ({
    ...row,
    similarity_score: cosineSimilarity(your_vector, vectorize(row)),
  }));
}
```

---

### 4. Decision Recommendation Engine

**Purpose:** Synthesize all inputs into actionable recommendation

**Core Algorithm:**
```typescript
interface TimingRecommendation {
  recommended_window: {
    start_date: string;          // YYYY-MM-DD
    end_date: string;
    confidence_pct: number;      // 70-95%
    rationale: string;           // Human-readable explanation
    supporting_data: {
      sector_momentum: string;
      market_window_quality: number;  // 1-10
      company_readiness_pct: number;
      critical_path_days_remaining: number;
    };
  };

  alternative_scenarios: {
    name: 'conservative' | 'aggressive' | 'delayed';
    window_start: string;
    confidence_pct: number;
    pros: string[];
    cons: string[];
  }[];

  risks_by_launch_timing: {
    launch_too_early: {
      probability: 'low' | 'medium' | 'high';
      impact: string;
      mitigation: string;
    };
    market_shock: {
      probability: string;
      trigger_events: string[];  // "Recession", "Rate hike", etc.
      impact_on_valuation: number;  // % drop
    };
    audit_delay: {
      probability: string;
      impact_on_timeline: number;  // days
      contingency_launch_date: string;
    };
  };
}

interface ValuationRecommendation {
  valuation_range: {
    low: number;                 // $B
    mid: number;
    high: number;
    currency: 'USD' | 'CAD';
    confidence_pct: number;      // 75-90%
  };

  peer_multiple_analysis: {
    peer_median_ev_revenue: number;     // e.g., 7.2x
    your_growth_adjustment: number;     // e.g., +0.8x
    your_profitability_adjustment: number;  // e.g., -0.3x
    implied_range: {
      low: number;
      high: number;
    };
  };

  comparable_ipo_benchmarking: {
    median_ipo_valuation: number;       // $B (from similar IPOs)
    percentile_25: number;
    percentile_75: number;
    median_performance_30d: number;     // % of IPOs like yours
    median_performance_365d: number;
  };

  sensitivity_analysis: {
    if_revenue_grows_2pct_more: {
      valuation_impact: number;  // $M
    };
    if_margin_improves_1pct: {
      valuation_impact: number;
    };
    if_market_drops_10pct: {
      valuation_impact: number;
    };
  };

  pricing_strategy_recommendation: 'conservative' | 'market' | 'aggressive';
  reasoning: string;
}

interface TermsRecommendation {
  underwriter_recommendation: {
    primary: string[];           // ["Goldman Sachs", "Morgan Stanley"]
    rationale: string;
    key_requirements: string[];
  };

  lockup_structure: {
    founder_lockup_days: number;        // Typical: 180-365
    employee_lockup_days: number;
    market_median_days: number;
    rationale: string;
    negotiation_points: string[];
  };

  offering_size: {
    recommended_shares_millions: number;
    rationale: string;
    float_percentage: number;           // Typical: 25-30%
  };
}

interface DecisionRecommendation {
  timing: TimingRecommendation;
  valuation: ValuationRecommendation;
  terms: TermsRecommendation;
  
  executive_summary: {
    headline: string;             // "LAUNCH SEPT 15, 2026"
    subheading: string;           // "Market window open, readiness 76%, confidence 80%"
    key_risks: string[];
  };

  board_report: {
    format: 'pdf' | 'html';
    sections: string[];           // Pre-generated Board Report
    decision_audit_trail: {
      analysis_date: string;
      data_freshness: number;     // days old
      analyst: string;
      confidence: number;         // 1-10
    };
  };
}
```

---

## Implementation Roadmap

### Phase 2.1: Market Intelligence Engine (Weeks 1-3)

**Database Schema (Append to existing 003_capital_markets_intelligence.sql):**
```sql
-- Market intelligence snapshots (daily)
CREATE TABLE market_intelligence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  sector VARCHAR(100) NOT NULL,
  
  -- Recent IPO Performance
  recent_ipo_count_90d INT,
  median_ipo_return_30d NUMERIC(5,2),
  median_ipo_return_90d NUMERIC(5,2),
  volatility_30d NUMERIC(5,2),
  
  -- Capital Markets Conditions
  fed_rate NUMERIC(4,2),
  vix_index NUMERIC(5,2),
  market_ytd_return NUMERIC(5,2),
  dry_powder_billions NUMERIC(10,2),
  analyst_sentiment NUMERIC(4,2),
  
  -- Window Quality Scoring
  seasonality_score NUMERIC(3,1),         -- -1 to +1
  historical_success_rate NUMERIC(3,1),
  market_attractiveness_score NUMERIC(3,1),  -- 1-10
  
  data_source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Historical IPO outcomes (anonymized)
CREATE TABLE historical_comparable_ipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company profile
  sector VARCHAR(100) NOT NULL,
  revenue_millions NUMERIC(12,2),
  growth_rate_pct NUMERIC(5,2),
  profitability VARCHAR(50),
  
  -- IPO metrics
  ipo_date DATE NOT NULL,
  launch_month VARCHAR(20),
  offering_price NUMERIC(10,4),
  ipo_valuation_billions NUMERIC(10,2),
  ipo_pe_multiple NUMERIC(8,2),
  ipo_ev_revenue_multiple NUMERIC(8,2),
  
  -- Readiness snapshot
  readiness_pct_at_launch NUMERIC(3,1),
  audit_complete_before BOOLEAN,
  team_experience VARCHAR(50),
  
  -- Market snapshot
  market_volatility NUMERIC(5,2),
  fed_rate NUMERIC(4,2),
  sector_momentum VARCHAR(20),
  
  -- Post-IPO outcomes
  performance_30d NUMERIC(5,2),
  performance_90d NUMERIC(5,2),
  performance_365d NUMERIC(5,2),
  lockup_expiry_date DATE,
  lockup_pop_pct NUMERIC(5,2),
  
  -- Metadata
  anonymized BOOLEAN DEFAULT TRUE,
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Peer multiples snapshot (daily)
CREATE TABLE peer_valuation_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  
  peer_company_name VARCHAR(255),
  ticker VARCHAR(10),
  sector VARCHAR(100),
  
  revenue_ttm NUMERIC(12,2),
  market_cap_billions NUMERIC(10,2),
  ev_revenue_multiple NUMERIC(8,2),
  ev_ebitda_multiple NUMERIC(8,2),
  pe_ratio NUMERIC(8,2),
  
  revenue_growth_yoy NUMERIC(5,2),
  net_margin NUMERIC(5,2),
  
  data_source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_snapshots_date ON market_intelligence_snapshots(snapshot_date DESC);
CREATE INDEX idx_comparable_ipos_sector ON historical_comparable_ipos(sector);
CREATE INDEX idx_peer_snapshot_date ON peer_valuation_snapshot(snapshot_date DESC);
```

**API Endpoints:**
```typescript
// GET /api/ddti/market-snapshot?sector=SaaS&date=2026-06-07
// Returns: Current market conditions, peer multiples, comparable IPO performance

// GET /api/ddti/valuation-multiples?sector=SaaS
// Returns: Peer EV/Revenue, EV/EBITDA, P/E with time series

// GET /api/ddti/comparable-ipos?revenue=50&growth=25&sector=SaaS
// Returns: Top 20 similar IPOs ranked by similarity score

// GET /api/ddti/optimal-windows?sector=SaaS
// Returns: Next 6 months ranked by market attractiveness
```

**Data Ingestion Service:**
```typescript
// scripts/ingest-market-intelligence.ts
// Daily cron job:
// 1. Pull SEC EDGAR recent IPO filings
// 2. Aggregate peer multiples (Bloomberg API)
// 3. Update VIX, Fed rate, market performance
// 4. Calculate seasonality scores
// 5. Store snapshots
```

---

### Phase 2.2: Company Readiness Integration (Weeks 2-4)

**Database Schema:**
```sql
-- Company readiness snapshot (refreshed daily)
CREATE TABLE company_readiness_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  
  snapshot_date DATE NOT NULL,
  
  -- Regulatory Readiness
  pace_governance_pct NUMERIC(3,1),
  pace_overall_pct NUMERIC(3,1),
  compliance_pct_complete NUMERIC(3,1),
  critical_items_open INT,
  critical_item_oldest_days INT,
  
  -- Financial Readiness
  audit_complete BOOLEAN,
  audited_years INT,
  sox_controls_tested BOOLEAN,
  revenue_growth_yoy NUMERIC(5,2),
  net_margin NUMERIC(5,2),
  
  -- Team Readiness
  cfo_in_place BOOLEAN,
  cfo_has_public_exp BOOLEAN,
  auditor_selected BOOLEAN,
  underwriter_selected BOOLEAN,
  
  -- Estimates
  days_until_ready_estimate INT,
  critical_path_item VARCHAR(255),
  
  overall_readiness_pct NUMERIC(3,1),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, snapshot_date)
);

CREATE INDEX idx_readiness_company_date ON company_readiness_state(company_id, snapshot_date DESC);
```

**Service Implementation:**
```typescript
// src/lib/ddti/company-readiness.ts
export async function calculateCompanyReadiness(
  companyId: string,
  date: Date = new Date()
): Promise<CompanyReadiness> {
  // 1. Fetch PACE metrics
  const pace = await db.query(`
    SELECT pace_governance, pace_overall FROM companies WHERE id = $1
  `, [companyId]);

  // 2. Fetch compliance checklist status
  const compliance = await db.query(`
    SELECT COUNT(*) as total, 
           SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) as complete
    FROM checklist_items WHERE company_id = $1
  `, [companyId]);

  // 3. Fetch team status
  const team = await db.query(`
    SELECT role_count, 
           COALESCE(cfo_id IS NOT NULL, false) as cfo_in_place,
           COALESCE(auditor_id IS NOT NULL, false) as auditor_selected
    FROM companies WHERE id = $1
  `, [companyId]);

  // 4. Calculate readiness
  const readiness = {
    regulatory: calculateRegulatoryReadiness(pace, compliance),
    financial: calculateFinancialReadiness(compliance),
    team: calculateTeamReadiness(team),
    narrative: calculateNarrativeReadiness(compliance),
    operations: calculateOperationsReadiness(compliance),
  };

  // 5. Calculate critical path
  const bottlenecks = identifyBottlenecks(readiness);
  const critical_path_days = estimateCriticalPathDays(bottlenecks);

  return {
    ...readiness,
    overall_pct: calculateOverallReadiness(readiness),
    bottlenecks,
    critical_path_days,
  };
}
```

---

### Phase 2.3: Decision Engine (Weeks 3-5)

**Core Algorithm:**
```typescript
// src/lib/ddti/decision-engine.ts
export async function generateValuationTimingRecommendation(
  companyId: string
): Promise<DecisionRecommendation> {
  const company = await db.query(`SELECT * FROM companies WHERE id = $1`, [companyId]);
  const readiness = await calculateCompanyReadiness(companyId);
  const market = await getLatestMarketSnapshot(company.sector);
  const comparables = await findComparableIPOs(company, market, 20);

  // TIMING ANALYSIS
  const timing = analyzeOptimalTiming(
    readiness,
    market,
    comparables
  );

  // VALUATION ANALYSIS
  const valuation = analyzeValuation(
    company,
    market,
    comparables,
    readiness
  );

  // TERMS ANALYSIS
  const terms = analyzeOptimalTerms(
    company,
    market,
    comparables,
    valuation
  );

  // SYNTHESIZE INTO RECOMMENDATION
  return {
    timing,
    valuation,
    terms,
    executive_summary: generateExecutiveSummary(timing, valuation, terms),
    board_report: generateBoardReport(timing, valuation, terms, readiness),
  };
}
```

**Timing Algorithm:**
```typescript
function analyzeOptimalTiming(
  readiness: CompanyReadiness,
  market: MarketSnapshot,
  comparables: SimilarCompanyOutcome[]
): TimingRecommendation {
  // 1. Calculate readiness trajectory
  const readiness_trajectory = estimateReadinessCurve(readiness);
  const when_100pct = estimateCompletionDate(readiness_trajectory);

  // 2. Identify market windows (next 6 months)
  const windows = generateMarketWindows(market);
  const ranked_windows = windows.map(w => ({
    ...w,
    market_quality_score: calculateWindowQuality(w, market),
    readiness_fit: calculateReadinessFit(when_100pct, w),
  })).sort((a, b) => 
    (a.market_quality_score * 0.6 + a.readiness_fit * 0.4) - 
    (b.market_quality_score * 0.6 + b.readiness_fit * 0.4)
  );

  // 3. Check comparable outcomes
  const comparable_outcomes = comparables
    .filter(c => c.launch_month === recommended_window.month)
    .map(c => ({ performance_30d: c.performance_30d, confidence: c.similarity_score }));

  const median_return_30d = median(comparable_outcomes.map(c => c.performance_30d));

  // 4. Generate recommendation
  const recommended = ranked_windows[0];
  const confidence = calculateConfidence(
    readiness.overall_pct,
    readiness.critical_path_days,
    comparable_outcomes.length
  );

  return {
    recommended_window: {
      start_date: recommended.start,
      end_date: recommended.end,
      confidence_pct: confidence,
      rationale: generateRationale(recommended, readiness, market),
      supporting_data: {
        sector_momentum: market.market_conditions.market_trend,
        market_window_quality: recommended.market_quality_score,
        company_readiness_pct: readiness.overall_pct,
        critical_path_days_remaining: readiness.critical_path_days,
      },
    },
    alternative_scenarios: generateAlternatives(ranked_windows, readiness),
    risks_by_launch_timing: analyzeRisks(recommended, readiness, market),
  };
}
```

**Valuation Algorithm:**
```typescript
function analyzeValuation(
  company: Company,
  market: MarketSnapshot,
  comparables: SimilarCompanyOutcome[],
  readiness: CompanyReadiness
): ValuationRecommendation {
  // Method 1: Peer Multiple Approach
  const peer_median_ev_rev = market.peer_multiples
    .filter(p => p.sector === company.sector)
    .map(p => p.ev_revenue)
    .sort()[(market.peer_multiples.length / 2)];

  // Growth adjustment: fast-growing companies earn premium
  const growth_adjustment = (company.revenue_growth_yoy - market.sector.median_growth) * 0.1;
  
  // Profitability adjustment: unprofitable companies take discount
  const profitability_adjustment = company.profitability === 'losses' ? -0.3 : 0;
  
  const implied_multiple = peer_median_ev_rev + growth_adjustment + profitability_adjustment;
  const implied_valuation = company.revenue_ttm * implied_multiple / 1000;  // Convert to $B

  // Method 2: Comparable IPO Benchmarking
  const comparable_median_valuation = median(
    comparables
      .filter(c => c.similarity_score > 0.7)
      .map(c => c.ipo_valuation)
  );

  // Method 3: Sensitivity Analysis
  const sensitivity = {
    if_revenue_grows_2pct_more: {
      valuation_impact: (implied_valuation * company.revenue_ttm * 0.02 / company.revenue_ttm),
    },
    if_margin_improves_1pct: {
      valuation_impact: (implied_valuation * 0.025),  // 2.5% per 1% margin improvement
    },
    if_market_drops_10pct: {
      valuation_impact: -(implied_valuation * 0.10),
    },
  };

  // Synthesize
  const valuation_range = {
    low: Math.min(implied_valuation, comparable_median_valuation) * 0.9,
    mid: (implied_valuation + comparable_median_valuation) / 2,
    high: Math.max(implied_valuation, comparable_median_valuation) * 1.1,
  };

  return {
    valuation_range: {
      ...valuation_range,
      currency: company.currency,
      confidence_pct: 80,
    },
    peer_multiple_analysis: {
      peer_median_ev_revenue: peer_median_ev_rev,
      your_growth_adjustment: growth_adjustment,
      your_profitability_adjustment: profitability_adjustment,
      implied_range: {
        low: valuation_range.low,
        high: valuation_range.high,
      },
    },
    comparable_ipo_benchmarking: {
      median_ipo_valuation: comparable_median_valuation,
      percentile_25: percentile(comparables.map(c => c.ipo_valuation), 0.25),
      percentile_75: percentile(comparables.map(c => c.ipo_valuation), 0.75),
      median_performance_30d: median(comparables.map(c => c.performance_30d)),
      median_performance_365d: median(comparables.map(c => c.performance_365d)),
    },
    sensitivity_analysis: sensitivity,
    pricing_strategy_recommendation: determinePricingStrategy(valuation_range, readiness),
  };
}
```

---

## Board Report Format

**Auto-generated PDF/HTML Report (sent to Board):**

```
╔═══════════════════════════════════════════════════════════════╗
║         VALUATION & TIMING DECISION INTELLIGENCE REPORT       ║
║                                                               ║
║                    [COMPANY NAME]                             ║
║                    Prepared: June 7, 2026                     ║
║                                                               ║
║  ⚠️  RECOMMENDATION: LAUNCH SEPTEMBER 15, 2026               ║
║                                                               ║
║  Valuation Range: $9.0B - $11.0B (USD)                       ║
║  Confidence: 80%                                              ║
║  Critical Path Item: Audit completion (on track for Aug 15)  ║
╚═══════════════════════════════════════════════════════════════╝

┌─ 1. TIMING ANALYSIS ───────────────────────────────────────┐
│                                                              │
│  ✓ PRIMARY RECOMMENDATION: September 15 - October 31, 2026  │
│                                                              │
│    Market Window Quality: 8.5/10                            │
│    ├─ Sector momentum: Hot (SaaS IPOs up 15% YTD)          │
│    ├─ Capital availability: $85B dry powder (high)         │
│    ├─ Historical success rate: 78% of Sept IPOs performed  │
│    ├─ Volatility: 23% (acceptable range)                   │
│    └─ Fed environment: Stable, no rate hikes expected      │
│                                                              │
│    Company Readiness: 76%                                   │
│    ├─ Regulatory (PACE): 78% ✓                             │
│    ├─ Financial (Audit): 85% ✓                             │
│    ├─ Team: 72% (CFO strong, need IR officer)             │
│    ├─ Narrative: 70% (Prospectus in review)               │
│    └─ Critical Path Days Remaining: 39 days                │
│                                                              │
│    Confidence: 80%                                          │
│    ├─ Data freshness: 1 day old                            │
│    ├─ Comparable company sample: 17 similar IPOs           │
│    ├─ Risk of delay: Medium (audit on critical path)       │
│    └─ Analyst confidence: High                             │
│                                                              │
│  ✓ ALTERNATIVE: January 2027 (Conservative)                │
│    └─ Valuation: $8.0B - $10.0B                            │
│    └─ Confidence: 95% (lower market risk)                  │
│    └─ Trade-off: 3-6 months delay, lower upside            │
│                                                              │
│  ⚠️  RISK: If audit delays >4 weeks, Jan 2027 becomes ideal│
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ 2. VALUATION ANALYSIS ───────────────────────────────────┐
│                                                              │
│  RECOMMENDED RANGE: $9.0B - $11.0B (Midpoint: $10.0B)     │
│                                                              │
│  Method 1: Peer Multiple Analysis                          │
│  ├─ Peer median EV/Revenue: 7.2x (SaaS sector)            │
│  ├─ Your revenue (TTM): $85M                               │
│  ├─ Growth premium: +0.8x (your growth 35% vs median 22%) │
│  ├─ Profitability premium: +0.2x (20% net margin)         │
│  ├─ Implied valuation: $85M × 8.2x = $0.697B             │
│  └─ Adjusted to market cap: ~$9.5B                         │
│                                                              │
│  Method 2: Comparable IPO Benchmarking                      │
│  ├─ 17 similar IPOs (revenue $70M-$100M, growth 25-40%)   │
│  ├─ Median IPO valuation: $9.8B                            │
│  ├─ 25th percentile: $8.2B                                 │
│  ├─ 75th percentile: $11.5B                                │
│  └─ Comparable outcome: $8.2B - $11.5B range              │
│                                                              │
│  Method 3: Sensitivity Analysis                            │
│  ├─ If revenue grows 2% more: +$250M valuation            │
│  ├─ If margins improve 1%: +$150M valuation               │
│  ├─ If market drops 10%: -$1.0B valuation impact          │
│  └─ Implied range: $8.0B - $12.0B                         │
│                                                              │
│  SYNTHESIS:                                                 │
│  └─ Recommended: $9.0B - $11.0B range                     │
│     └─ Conservative: $8.0B - $10.0B (95% confidence)     │
│     └─ Aggressive: $10.0B - $12.0B (40% confidence)      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ 3. TERMS & NEGOTIATIONS ──────────────────────────────────┐
│                                                              │
│  Underwriter Recommendation:                                │
│  ├─ Primary: Goldman Sachs, Morgan Stanley                 │
│  ├─ Co-managers: Barclays, Jefferies                       │
│  └─ Rationale: SaaS expertise, strong analyst coverage     │
│                                                              │
│  Lockup Structure:                                          │
│  ├─ Founders: 180 days (market median)                     │
│  ├─ Employees: 180 days                                    │
│  ├─ Negotiation point: Request 150 days for early employees│
│  └─ Rationale: Demonstrates confidence, attracts long-term  │
│     investors                                              │
│                                                              │
│  Offering Size:                                             │
│  ├─ Recommended: 15M shares × $600/share = $9.0B          │
│  ├─ Float: 27% (within market median 25-30%)              │
│  └─ Proceeds: Use for debt reduction ($200M) and working   │
│     capital ($800M)                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ 4. RISK FACTORS ──────────────────────────────────────────┐
│                                                              │
│  HIGH CONFIDENCE RISKS:                                     │
│  ├─ Audit completion delay (4-week delay = January launch) │
│  ├─ Market volatility (VIX spike = -10% valuation)        │
│  └─ Competitor IPO (Stripe filing = -5% market share)     │
│                                                              │
│  MEDIUM CONFIDENCE RISKS:                                   │
│  ├─ Fed rate hike (50 bps = -3% multiples)                │
│  ├─ Recession signals (unemployment spike)                  │
│  └─ Key talent departure (CRO, VP Eng)                     │
│                                                              │
│  LOW CONFIDENCE RISKS:                                      │
│  ├─ Major customer churn (top 3 represent 15%)             │
│  └─ Regulatory changes (SEC rule updates)                  │
│                                                              │
│  MITIGATION PLAN:                                          │
│  ├─ Weekly audit progress monitoring (owns timeline)       │
│  ├─ CEO + CFO retention agreements (through Day 1)         │
│  ├─ Customer success plan (reduce churn to <2% annual)    │
│  └─ Regulatory tracking (subscribe to SEC alerts)          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ 5. HISTORICAL PRECEDENT ──────────────────────────────────┐
│                                                              │
│  You vs. Comparable IPOs (17 matches):                     │
│                                                              │
│                  Comparable Median    Your Company          │
│  ─────────────────────────────────────────────────────     │
│  Revenue (TTM):      $87M              $85M                 │
│  Growth Rate:        23%               35% (stronger)       │
│  Net Margin:         18%               20% (stronger)       │
│  IPO Valuation:      $9.8B             $9.0-11.0B (range)  │
│  30-Day Return:      +8.2%             Est. +9-10%          │
│  90-Day Return:      +5.5%             Est. +6-7%           │
│  365-Day Return:     +12.3%            Est. +14-16%         │
│                                                              │
│  Conclusion: Your IPO expected to OUTPERFORM comparables   │
│  due to stronger growth + margins. Higher confidence in    │
│  valuation range.                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ 6. BOARD DECISION FRAMEWORK ──────────────────────────────┐
│                                                              │
│  Three Scenarios for Board Vote:                           │
│                                                              │
│  SCENARIO A (80% RECOMMENDED): September 15 Launch         │
│  └─ Valuation: $9.0-11.0B                                  │
│  └─ Confidence: 80%                                        │
│  └─ Upside: Market window optimal, growth story hot       │
│  └─ Downside: Audit on critical path (4-week buffer)      │
│  └─ Expected outcome: $10B valuation, 30-day return +8%   │
│                                                              │
│  SCENARIO B (95% CONSERVATIVE): January 2027 Launch       │
│  └─ Valuation: $8.0-10.0B                                  │
│  └─ Confidence: 95%                                        │
│  └─ Upside: No execution risk, relaxed timeline           │
│  └─ Downside: Market may cool, lose competitive advantage │
│  └─ Expected outcome: $9B valuation, 30-day return +5%    │
│                                                              │
│  SCENARIO C (40% AGGRESSIVE): August 1 Launch             │
│  └─ Valuation: $10.0-12.0B                                 │
│  └─ Confidence: 40%                                        │
│  └─ Upside: Capture peak market window, early-mover       │
│  └─ Downside: Audit NOT complete, prospectus at risk      │
│  └─ Expected outcome: $11B valuation, extreme execution risk│
│                                                              │
│  BOARD RECOMMENDATION: Vote for Scenario A (September 15) │
│                                                              │
└──────────────────────────────────────────────────────────────┘

DECISION AUDIT TRAIL:
─────────────────────
Analysis Date: June 7, 2026, 2:00 PM EST
Data Freshness: 1 day old (last market snapshot: June 6)
Analyst: IPOReady Deal Decision Intelligence Engine
Analyst Confidence: 8.5/10
Decision Made By: Board via VTDI Dashboard
Approved By: Audit Committee Chair + CEO

KEY ASSUMPTIONS:
└─ Audit completion: August 15, 2026
└─ No major customer departures
└─ Fed maintains current rate trajectory
└─ Sector momentum remains "hot" for SaaS
└─ No regulatory changes to IPO process

Next Review: June 14, 2026 (weekly)
Escalation Triggers: Audit delay >2 weeks, VIX >35, market drop >5%
```

---

## API Endpoints

**Core Public APIs:**
```
GET  /api/ddti/recommendation
     Query: ?company_id=xxx&include_board_report=true
     Returns: Full DecisionRecommendation + Board Report PDF link

GET  /api/ddti/valuation
     Query: ?company_id=xxx&scenario=base|conservative|aggressive
     Returns: ValuationRecommendation with sensitivity analysis

GET  /api/ddti/timing
     Query: ?company_id=xxx
     Returns: TimingRecommendation with 6-month windows

GET  /api/ddti/comparables
     Query: ?company_id=xxx&limit=20
     Returns: Similar IPOs ranked by similarity score

GET  /api/ddti/market-snapshot
     Query: ?sector=SaaS&date=2026-06-07
     Returns: MarketSnapshot (peer multiples, recent IPO perf, conditions)

POST /api/ddti/generate-board-report
     Body: { company_id, format: 'pdf'|'html' }
     Returns: URL to downloadable Board Report

GET  /api/ddti/sensitivity-analysis
     Query: ?company_id=xxx
     Returns: Valuation impact of key variables changing
```

---

## Dashboard Integration

**New PACE™ Dashboard Page: `/dashboard/valuation-timing`**

```typescript
// src/app/dashboard/valuation-timing/page.tsx
'use client';

import { use } from 'react';
import ValuationRecommendation from '@/components/ddti/ValuationRecommendation';
import TimingRecommendation from '@/components/ddti/TimingRecommendation';
import ComparableIPOs from '@/components/ddti/ComparableIPOs';
import SensitivityAnalysis from '@/components/ddti/SensitivityAnalysis';
import RiskAnalysis from '@/components/ddti/RiskAnalysis';

export default function ValuationTimingPage() {
  const recommendation = use(
    fetch('/api/ddti/recommendation').then(r => r.json())
  );

  return (
    <div className="space-y-8">
      <ValuationRecommendation data={recommendation.valuation} />
      <TimingRecommendation data={recommendation.timing} />
      <ComparableIPOs data={recommendation.comparable_ipos} />
      <SensitivityAnalysis data={recommendation.sensitivity_analysis} />
      <RiskAnalysis data={recommendation.risks} />
      
      <button className="btn-primary">Generate Board Report (PDF)</button>
    </div>
  );
}
```

---

## Success Metrics (Phase 2)

| Metric | Target | Timeline |
|--------|--------|----------|
| Market intelligence data | 500+ companies, 100% accuracy vs Bloomberg | Week 2 |
| Company readiness pipeline | Integrated with PACE™, weekly snapshots | Week 3 |
| Comparable IPO database | 1,000+ IPOs, 5-year history | Week 4 |
| Decision engine accuracy | >85% match to actual IPO outcomes (backtesting) | Week 5 |
| Board report generation | <10 seconds, PDF export working | Week 4 |
| Customer uptake | 5+ pilot customers using VTDI | Week 6 |
| Revenue impact | Measured in customer feedback (negotiation leverage) | Post-launch |

---

## Competitive Advantage

**Why VTDI is defensible IP:**
1. **Proprietary market data aggregation** — Combines SEC EDGAR, SEDAR, Bloomberg, internal customer data
2. **Machine-learned comparable matching** — Cosine similarity on >1,000 historical IPOs
3. **Decision audit trail** — Non-repudiation framework (regulatory + governance)
4. **Scenario modeling** — Monte Carlo simulations on IPO outcomes
5. **Real-time integration** — Live market conditions + company readiness feedback loop

**Patent Classes:**
- AI-assisted business intelligence
- IPO timing optimization
- Financial decision support systems
- Scenario modeling for capital markets

---

## Go-to-Market

**Target Customer Profile:**
- Series D/E companies planning IPO in next 6-18 months
- Board members + CFOs (decision-makers)
- Growth/Enterprise tier IPOReady customers

**Positioning:**
"IPOReady VTDI removes politics from IPO timing/valuation decisions. Boards get a data-backed recommendation, 80%+ confidence, auditable rationale, and $10M+ upside vs. random timing."

**Launch Channel:**
1. Email to Growth/Enterprise customers: "New feature: Valuation & Timing Decision Intelligence"
2. Board Report feature in /dashboard/valuation-timing
3. Customer case study: "How [Customer] used VTDI to nail $10B+ valuation"
4. Press: "World's first AI-powered IPO timing optimization engine"
