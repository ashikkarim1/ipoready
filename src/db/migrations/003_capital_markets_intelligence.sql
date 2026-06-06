-- ============================================================================
-- Migration: 003_capital_markets_intelligence.sql
-- Purpose: Deploy Capital Markets Intelligence Phase 1 schema
-- Date: June 6, 2026
-- ============================================================================

-- ============================================================================
-- TABLE: companies
-- Core public company data and financial baseline
-- ============================================================================
CREATE TABLE IF NOT EXISTS capital_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cik VARCHAR(10) NOT NULL UNIQUE,          -- SEC CIK number

  name VARCHAR(255) NOT NULL,
  ticker VARCHAR(10) UNIQUE,
  sector VARCHAR(100),
  industry VARCHAR(100),

  country VARCHAR(2),
  state VARCHAR(2),
  market_cap NUMERIC(19,2),                 -- Current market cap in USD

  founded_year INTEGER,
  public_date DATE,
  website VARCHAR(255),
  description TEXT,

  -- Data Quality
  data_quality_score NUMERIC(3,1),          -- 0-100
  last_10k_date DATE,
  last_10q_date DATE,
  data_source VARCHAR(50),                  -- 'SEC', 'Bloomberg', 'Manual'

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_capital_companies_cik ON capital_companies(cik);
CREATE INDEX IF NOT EXISTS idx_capital_companies_ticker ON capital_companies(ticker);
CREATE INDEX IF NOT EXISTS idx_capital_companies_sector ON capital_companies(sector);

-- ============================================================================
-- TABLE: company_financials
-- Annual and quarterly financial data from 10-K and 10-Q filings
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capital_companies(id) ON DELETE CASCADE,

  -- Period Information
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER,                   -- 0 for annual, 1-4 for quarterly
  filing_type VARCHAR(10),                  -- '10-K' or '10-Q'
  filing_date DATE NOT NULL,
  period_end_date DATE NOT NULL,

  -- Income Statement
  revenue NUMERIC(19,2),
  cost_of_revenue NUMERIC(19,2),
  gross_profit NUMERIC(19,2),
  operating_expenses NUMERIC(19,2),
  research_development NUMERIC(19,2),
  selling_general_admin NUMERIC(19,2),
  operating_income NUMERIC(19,2),
  interest_expense NUMERIC(19,2),
  net_income NUMERIC(19,2),

  -- Balance Sheet
  total_assets NUMERIC(19,2),
  current_assets NUMERIC(19,2),
  cash_and_equivalents NUMERIC(19,2),
  total_liabilities NUMERIC(19,2),
  stockholders_equity NUMERIC(19,2),

  -- Cash Flow
  operating_cash_flow NUMERIC(19,2),
  free_cash_flow NUMERIC(19,2),

  -- Metrics
  gross_margin NUMERIC(5,2),
  operating_margin NUMERIC(5,2),
  net_margin NUMERIC(5,2),
  current_ratio NUMERIC(5,2),
  debt_to_equity NUMERIC(5,2),
  roe NUMERIC(5,2),
  roa NUMERIC(5,2),

  -- Additional
  employee_count INTEGER,
  shares_outstanding BIGINT,
  eps NUMERIC(10,4),

  -- Data Quality
  data_quality_score NUMERIC(3,1),
  extraction_confidence NUMERIC(3,1),
  validation_status VARCHAR(20),
  source VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(company_id, fiscal_year, fiscal_quarter)
);

CREATE INDEX IF NOT EXISTS idx_financials_company ON company_financials(company_id);
CREATE INDEX IF NOT EXISTS idx_financials_fiscal ON company_financials(company_id, fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_financials_filing_date ON company_financials(filing_date DESC);

-- ============================================================================
-- TABLE: company_peers
-- Define peer relationships and matching quality
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_peers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capital_companies(id) ON DELETE CASCADE,
  peer_company_id UUID NOT NULL REFERENCES capital_companies(id) ON DELETE CASCADE,

  -- Quality Score
  quality_score NUMERIC(2,1),               -- 1-5 stars

  -- Matching Criteria
  sector_match BOOLEAN,
  size_match BOOLEAN,
  geography_match BOOLEAN,
  business_model_match BOOLEAN,

  reason TEXT,
  industry_group VARCHAR(100),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(company_id, peer_company_id)
);

CREATE INDEX IF NOT EXISTS idx_peers_company ON company_peers(company_id);
CREATE INDEX IF NOT EXISTS idx_peers_quality ON company_peers(quality_score DESC);

-- ============================================================================
-- TABLE: peer_benchmarks
-- Aggregated metrics for peer comparison
-- ============================================================================
CREATE TABLE IF NOT EXISTS peer_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capital_companies(id) ON DELETE CASCADE,
  benchmark_date DATE NOT NULL,

  metric_name VARCHAR(100),                 -- 'revenue_growth', 'net_margin', 'ev_revenue', etc.

  your_value NUMERIC(19,2),
  peer_median NUMERIC(19,2),
  peer_25th_percentile NUMERIC(19,2),
  peer_75th_percentile NUMERIC(19,2),
  sector_average NUMERIC(19,2),

  percentile_vs_peers NUMERIC(3,1),
  percentile_vs_sector NUMERIC(3,1),

  trend_direction VARCHAR(10),              -- 'up', 'down', 'flat'
  trend_percentage NUMERIC(5,2),

  peer_count INTEGER,
  data_quality NUMERIC(3,1),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(company_id, metric_name, benchmark_date)
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_company ON peer_benchmarks(company_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_metric ON peer_benchmarks(metric_name);

-- ============================================================================
-- TABLE: valuation_multiples
-- Track EV/Revenue, EV/EBITDA, P/E ratios
-- ============================================================================
CREATE TABLE IF NOT EXISTS valuation_multiples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capital_companies(id) ON DELETE CASCADE,
  valuation_date DATE NOT NULL,

  stock_price NUMERIC(10,4),
  shares_outstanding BIGINT,
  market_cap NUMERIC(19,2),

  total_debt NUMERIC(19,2),
  cash NUMERIC(19,2),
  enterprise_value NUMERIC(19,2),

  ev_revenue NUMERIC(8,2),
  ev_ebitda NUMERIC(8,2),
  pe_ratio NUMERIC(8,2),
  price_to_book NUMERIC(8,2),

  peer_median_ev_revenue NUMERIC(8,2),
  peer_median_ev_ebitda NUMERIC(8,2),

  trailing_twelve_month BOOLEAN,
  data_source VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_multiples_company ON valuation_multiples(company_id);
CREATE INDEX IF NOT EXISTS idx_multiples_date ON valuation_multiples(valuation_date DESC);

-- ============================================================================
-- TABLE: ipos
-- IPO tracking and performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS ipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES capital_companies(id) ON DELETE SET NULL,
  cik VARCHAR(10),
  company_name VARCHAR(255),
  ticker VARCHAR(10),

  s1_filing_date DATE,
  pricing_date DATE,
  listing_date DATE,

  shares_offered BIGINT,
  price_per_share NUMERIC(10,4),
  ipo_valuation NUMERIC(19,2),

  underwriters TEXT[],                      -- ['Goldman Sachs', 'JPMorgan', ...]
  sector VARCHAR(100),

  -- Performance
  first_day_return NUMERIC(5,2),
  price_30d_close NUMERIC(10,4),
  price_90d_close NUMERIC(10,4),
  price_365d_close NUMERIC(10,4),
  return_30d NUMERIC(5,2),
  return_90d NUMERIC(5,2),
  return_365d NUMERIC(5,2),
  return_vs_sp500_30d NUMERIC(5,2),
  return_vs_sp500_90d NUMERIC(5,2),
  return_vs_sp500_365d NUMERIC(5,2),

  status VARCHAR(20),                       -- 'filed', 'priced', 'listed', 'closed'

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ipos_company ON ipos(company_id);
CREATE INDEX IF NOT EXISTS idx_ipos_pricing_date ON ipos(pricing_date DESC);
CREATE INDEX IF NOT EXISTS idx_ipos_sector ON ipos(sector);

-- ============================================================================
-- TABLE: financing_rounds
-- Capital raises for public companies
-- ============================================================================
CREATE TABLE IF NOT EXISTS financing_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES capital_companies(id) ON DELETE SET NULL,
  company_name VARCHAR(255),
  ticker VARCHAR(10),

  announcement_date DATE,
  close_date DATE,
  round_type VARCHAR(50),                   -- 'secondary', 'convertible', 'bought_deal', etc.

  amount_raised NUMERIC(19,2),
  price_per_share NUMERIC(10,4),
  shares_issued BIGINT,

  valuation NUMERIC(19,2),
  investors TEXT[],
  use_of_proceeds TEXT,

  sector VARCHAR(100),
  market_conditions VARCHAR(100),           -- 'bull', 'bear', 'neutral'

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financing_company ON financing_rounds(company_id);
CREATE INDEX IF NOT EXISTS idx_financing_announcement ON financing_rounds(announcement_date DESC);

-- ============================================================================
-- TABLE: data_sync_log
-- Track data ingestion status from all sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50),                       -- 'SEC_EDGAR', 'Bloomberg', 'Crunchbase'
  entity_type VARCHAR(50),                  -- 'companies', 'financials', 'ipos'

  last_sync_at TIMESTAMP WITH TIME ZONE,
  record_count INTEGER,
  error_count INTEGER,
  status VARCHAR(20),                       -- 'success', 'partial', 'failed'
  error_message TEXT,

  duration_seconds INTEGER,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_source_date ON data_sync_log(source, last_sync_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_status ON data_sync_log(status);

-- ============================================================================
-- Update timestamp function
-- ============================================================================
CREATE TRIGGER capital_companies_update BEFORE UPDATE ON capital_companies
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER company_financials_update BEFORE UPDATE ON company_financials
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER ipos_update BEFORE UPDATE ON ipos
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

COMMIT;
