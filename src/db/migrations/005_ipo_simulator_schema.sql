/**
 * IPO Simulator Historical Data Schema
 *
 * Stores 500+ historical IPO records with full outcome data
 * Enables peer matching and outcome prediction
 */

-- ─────────────────────────────────────────────────────────────────────────────
-- HISTORICAL IPO DATABASE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS historical_ipos (
  id BIGSERIAL PRIMARY KEY,

  -- Company Info
  company_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,

  -- Listing Details
  listing_date DATE NOT NULL,
  exchange VARCHAR(50) NOT NULL,

  -- IPO Parameters (INPUTS)
  float_percentage DECIMAL(5, 2) NOT NULL, -- 15-40%
  raise_amount_millions DECIMAL(12, 2) NOT NULL,
  pre_money_valuation_billions DECIMAL(10, 2) NOT NULL,

  -- Board Composition
  board_size INT NOT NULL,
  board_independence_percentage DECIMAL(5, 2) NOT NULL,
  board_diversity_percentage DECIMAL(5, 2),

  -- Ownership Structure
  insider_ownership_percentage DECIMAL(5, 2) NOT NULL,
  vc_ownership_percentage DECIMAL(5, 2),
  employee_ownership_percentage DECIMAL(5, 2),
  lockup_period_months INT,

  -- Execution Details
  underwriter_name VARCHAR(255),
  underwriter_tier INT, -- 1=Tier 1 (Goldman), 2=Regional, 3=Small

  -- Company Fundamentals
  annual_revenue_millions DECIMAL(12, 2),
  revenue_growth_rate DECIMAL(5, 2), -- YoY %

  -- OUTCOMES (what actually happened)
  first_day_pop_percentage DECIMAL(5, 2),
  day_30_performance_percentage DECIMAL(5, 2),
  day_90_performance_percentage DECIMAL(5, 2),
  day_180_performance_percentage DECIMAL(5, 2),
  day_365_performance_percentage DECIMAL(5, 2),

  -- Liquidity Outcomes
  bid_ask_spread_percentage DECIMAL(5, 3),
  daily_volume_shares BIGINT,
  annualized_turnover_percentage DECIMAL(5, 2),

  -- Analyst Coverage Outcomes
  analyst_count INT,
  buy_ratings INT,
  hold_ratings INT,
  sell_ratings INT,
  target_price_low DECIMAL(10, 2),
  target_price_high DECIMAL(10, 2),

  -- Institutional Outcomes
  institutional_allocation_percentage DECIMAL(5, 2),
  oversubscription_ratio DECIMAL(5, 2),

  -- Governance Score
  governance_score INT, -- 0-100

  -- Exchange Eligibility Status
  nasdaq_eligible BOOLEAN,
  nyse_eligible BOOLEAN,
  tsx_eligible BOOLEAN,
  tsxv_eligible BOOLEAN,

  -- Metadata
  data_quality_score DECIMAL(3, 2), -- 0-1 (how complete is this record)
  source VARCHAR(255), -- Bloomberg, FactSet, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historical_ipos_sector ON historical_ipos(sector);
CREATE INDEX idx_historical_ipos_exchange ON historical_ipos(exchange);
CREATE INDEX idx_historical_ipos_listing_date ON historical_ipos(listing_date);
CREATE INDEX idx_historical_ipos_float ON historical_ipos(float_percentage);
CREATE INDEX idx_historical_ipos_valuation ON historical_ipos(pre_money_valuation_billions);

-- ─────────────────────────────────────────────────────────────────────────────
-- IPO SCENARIOS (User-created what-if scenarios)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ipo_scenarios (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- Scenario Metadata
  name VARCHAR(255) NOT NULL, -- "Base Case", "Conservative", "Bull Case"
  description TEXT,
  scenario_type VARCHAR(50), -- 'base_case', 'conservative', 'bull_case', 'custom'

  -- INPUT: Company Parameters
  float_percentage DECIMAL(5, 2) NOT NULL,
  raise_amount_millions DECIMAL(12, 2) NOT NULL,
  valuation_billions DECIMAL(10, 2) NOT NULL,

  board_size INT NOT NULL,
  board_independence_percentage DECIMAL(5, 2) NOT NULL,
  board_diversity_percentage DECIMAL(5, 2),

  insider_ownership_percentage DECIMAL(5, 2) NOT NULL,
  vc_ownership_percentage DECIMAL(5, 2),
  lockup_period_months INT,

  market_maker_tier INT,
  exchange VARCHAR(50) NOT NULL,

  -- OUTPUT: Cached Simulation Results
  results_json JSONB, -- Store full SimulationResults

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE INDEX idx_ipo_scenarios_company ON ipo_scenarios(company_id);
CREATE INDEX idx_ipo_scenarios_user ON ipo_scenarios(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- IPO STATISTICS (Aggregated peer metrics by sector/exchange)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ipo_statistics (
  id BIGSERIAL PRIMARY KEY,

  -- Dimensions
  sector VARCHAR(100) NOT NULL,
  exchange VARCHAR(50) NOT NULL,
  year INT,

  -- Metric
  metric_name VARCHAR(255) NOT NULL,
  -- Examples: 'bid_ask_spread', 'analyst_coverage', 'institutional_allocation', etc.

  -- Statistics
  mean_value DECIMAL(12, 2),
  median_value DECIMAL(12, 2),
  p25_value DECIMAL(12, 2), -- 25th percentile
  p75_value DECIMAL(12, 2), -- 75th percentile
  min_value DECIMAL(12, 2),
  max_value DECIMAL(12, 2),
  stdev_value DECIMAL(12, 2),
  count_observations INT,

  -- Metadata
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_ipo_statistics_key
  ON ipo_statistics(sector, exchange, year, metric_name);

-- ─────────────────────────────────────────────────────────────────────────────
-- PEER MATCHES (For fast lookup of comparable IPOs)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS peer_ipo_matches (
  id BIGSERIAL PRIMARY KEY,
  scenario_id BIGINT NOT NULL REFERENCES ipo_scenarios(id) ON DELETE CASCADE,

  -- Matching IPO
  historical_ipo_id BIGINT NOT NULL REFERENCES historical_ipos(id),

  -- Match Quality
  similarity_score DECIMAL(3, 2), -- 0-1 (how similar)
  match_dimensions TEXT[], -- ['float', 'valuation', 'sector', 'growth']

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_peer_ipo_matches_scenario ON peer_ipo_matches(scenario_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SIMULATION CACHE (For performance)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS simulation_cache (
  id BIGSERIAL PRIMARY KEY,

  -- Key
  scenario_id BIGINT UNIQUE,
  parameters_hash VARCHAR(64), -- Hash of company parameters

  -- Cached Results
  results_json JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP -- Invalidate cache after expiry
);

CREATE INDEX idx_simulation_cache_params_hash ON simulation_cache(parameters_hash);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_historical_ipos_updated_at
  BEFORE UPDATE ON historical_ipos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipo_scenarios_updated_at
  BEFORE UPDATE ON ipo_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- SAMPLE DATA STRUCTURE
-- ─────────────────────────────────────────────────────────────────────────────

-- This shows the data structure expected:
-- INSERT INTO historical_ipos (
--   company_name, sector, country_code, listing_date, exchange,
--   float_percentage, raise_amount_millions, pre_money_valuation_billions,
--   board_size, board_independence_percentage,
--   insider_ownership_percentage, lockup_period_months,
--   underwriter_name, underwriter_tier,
--   annual_revenue_millions, revenue_growth_rate,
--   first_day_pop_percentage, day_30_performance_percentage, ...,
--   bid_ask_spread_percentage, daily_volume_shares, annualized_turnover_percentage,
--   analyst_count, buy_ratings, hold_ratings, sell_ratings,
--   target_price_low, target_price_high,
--   institutional_allocation_percentage, oversubscription_ratio,
--   governance_score,
--   nasdaq_eligible, nyse_eligible, tsx_eligible, tsxv_eligible,
--   data_quality_score, source
-- ) VALUES (...)
