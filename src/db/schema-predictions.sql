-- Predictive IPO Engine Database Schema
-- Real-time prediction of IPO success, timing, and valuation

-- Historical IPO dataset (training data for prediction model)
CREATE TABLE IF NOT EXISTS historical_ipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  ipo_date DATE NOT NULL,
  ipo_valuation DECIMAL NOT NULL, -- IPO share price × shares outstanding
  final_valuation DECIMAL NOT NULL, -- Market cap at end of first day
  sector TEXT NOT NULL, -- SaaS, Healthcare, FinTech, etc.
  revenue_at_ipo DECIMAL NOT NULL,
  revenue_growth_rate FLOAT NOT NULL, -- % growth year before IPO
  gross_margin FLOAT NOT NULL,
  cash_runway_months_before_ipo INT,
  customer_concentration FLOAT, -- % from largest customer
  ipo_success BOOLEAN, -- Did it pop? (success = first day > IPO price)
  ipo_pop_percent FLOAT, -- (First day close - IPO price) / IPO price
  one_year_performance FLOAT, -- Stock price change in first year
  founder_exit_percent FLOAT, -- % of founders who sold in IPO
  num_board_seats INT,
  num_independent_directors INT,
  executive_team_vetting_stage INT, -- 1-10 scale
  regulatory_approval_time_days INT,
  sec_comment_count INT,
  bankers TEXT[], -- Goldman, Morgan Stanley, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_sector (sector),
  INDEX idx_ipo_date (ipo_date),
  INDEX idx_success (ipo_success)
);

-- Current company predictions (updates in real-time)
CREATE TABLE IF NOT EXISTS company_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  prediction_timestamp TIMESTAMP DEFAULT NOW(),

  -- LAYER 1: Financial Health Predictor
  financial_readiness_score INT, -- 0-100
  financial_readiness_months_to_target INT, -- Months until 85+ score
  predicted_final_revenue DECIMAL, -- At IPO time
  predicted_revenue_growth FLOAT, -- % growth at IPO
  predicted_gross_margin FLOAT,
  cash_runway_prediction TEXT, -- "Sufficient", "Borderline", "Critical"
  financial_risk_assessment TEXT, -- Red flags in financials

  -- LAYER 2: Regulatory Risk Predictor
  regulatory_readiness_score INT, -- 0-100
  regulatory_risk_level TEXT, -- "Low", "Medium", "High", "Critical"
  predicted_sec_comments_count INT, -- How many comments to expect?
  predicted_sec_review_days INT, -- 30 to 90+ days
  regulatory_blockers TEXT[], -- Specific issues found
  regulatory_remediation_weeks INT, -- Time to fix issues
  board_independence_percent FLOAT, -- % of independent directors needed
  insider_trading_risk_assessment TEXT,

  -- LAYER 3: Investor Appetite Predictor
  predicted_valuation_low DECIMAL, -- Conservative estimate
  predicted_valuation_mid DECIMAL, -- Base case
  predicted_valuation_high DECIMAL, -- Optimistic estimate
  valuation_confidence_percent INT, -- ±X% accuracy (85%+ is high confidence)
  institutional_investor_demand TEXT, -- "High", "Medium", "Low"
  optimal_ipo_window_start DATE, -- When market is best
  optimal_ipo_window_end DATE,
  market_timing_signal TEXT, -- "Launch now", "Wait", "Urgent"
  comparable_company_multiples FLOAT, -- EV/Revenue multiple for pricing

  -- LAYER 4: Management Readiness Predictor
  management_readiness_score INT, -- 0-100
  ceo_readiness_score INT,
  cfo_readiness_score INT,
  coo_readiness_score INT,
  board_experience_assessment TEXT,
  media_training_required BOOLEAN,
  management_coaching_hours INT, -- Estimated hours needed
  executive_compensation_assessment TEXT, -- "IPO-reasonable", "Needs adjustment"

  -- LAYER 5: PACE™ Predictive Timeline
  pace_current_score INT,
  pace_target_score INT,
  pace_completion_percent INT, -- % complete
  pace_velocity_items_per_month INT, -- Historical completion rate
  pace_predicted_target_date DATE, -- When will hit 85+ PACE?
  pace_critical_path TEXT[], -- Most important items to complete
  pace_acceleration_potential_weeks INT, -- How much faster if focused?
  pace_bottleneck TEXT, -- What's slowing progress?

  -- LAYER 6: Document Risk Intelligence
  document_risk_score INT, -- 0-100 (100 = no risk)
  financial_statement_risk INT,
  mda_risk INT, -- Management's Discussion & Analysis risk
  risk_factor_disclosure_completeness INT, -- % complete
  executive_compensation_disclosure_risk INT,
  related_party_transaction_disclosure_risk INT,
  sec_comment_likelihood_percent INT, -- Chance SEC will comment?
  predicted_sec_issues TEXT[], -- Specific issues SEC might challenge
  document_remediation_weeks INT, -- Time to fix document issues

  -- LAYER 7: Benchmarking & Anomalies
  revenue_vs_cohort_percentile INT, -- Your revenue growth vs peers (1-100)
  margin_vs_cohort_percentile INT,
  growth_vs_cohort_percentile INT,
  customer_concentration_anomaly_flag BOOLEAN, -- Is this abnormally high?
  unit_economics_anomaly_flag BOOLEAN,
  cac_efficiency_anomaly_flag BOOLEAN,
  churn_anomaly_flag BOOLEAN,
  anomalies_found TEXT[], -- List of anomalies detected
  anomaly_impact_valuation_percent FLOAT, -- How much do anomalies cost us?

  -- Overall Prediction
  ipo_success_probability_percent INT, -- Will IPO succeed? (0-100)
  recommended_ipo_date DATE, -- Best timing
  go_no_go_recommendation TEXT, -- "GO", "CAUTION", "NOT READY"
  confidence_level INT, -- How confident in prediction? (0-100)

  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_company (company_id),
  INDEX idx_timestamp (prediction_timestamp),
  INDEX idx_recommendation (go_no_go_recommendation)
);

-- Real-time data feeds for predictions
CREATE TABLE IF NOT EXISTS prediction_data_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  data_type TEXT NOT NULL, -- "financial", "market", "regulatory", "investor", "competitor"
  metric_name TEXT NOT NULL, -- "current_cash", "vix", "sec_guidance_change", etc.
  metric_value TEXT NOT NULL, -- Can be number, date, or string
  data_source TEXT NOT NULL, -- Where did this come from?
  timestamp TIMESTAMP DEFAULT NOW(),
  is_real_time BOOLEAN DEFAULT true,
  priority INT DEFAULT 5, -- 1=critical, 10=low, affects how often we re-predict
  INDEX idx_company (company_id),
  INDEX idx_type (data_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_priority (priority)
);

-- Prediction history (track how predictions change over time)
CREATE TABLE IF NOT EXISTS prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  prediction_date DATE NOT NULL,
  ipo_success_probability_percent INT,
  predicted_valuation_mid DECIMAL,
  recommended_ipo_date DATE,
  go_no_go_recommendation TEXT,
  change_from_previous_percent INT, -- +5%, -10%, etc.
  reason_for_change TEXT, -- What caused the prediction to change?
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_company (company_id),
  INDEX idx_date (prediction_date)
);

-- Autonomous action triggers
CREATE TABLE IF NOT EXISTS prediction_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  trigger_type TEXT NOT NULL, -- "red_flag_detected", "milestone_achieved", "market_opportunity", "urgent_action"
  trigger_metric TEXT NOT NULL, -- "customer_concentration", "pace_score_jump", "fed_rate_cut", etc.
  trigger_threshold FLOAT NOT NULL, -- What value triggers the action?
  current_value FLOAT NOT NULL, -- What's the current value?
  exceeded_threshold BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP,

  -- Recommended actions
  recommended_actions TEXT[], -- Array of action recommendations
  board_meeting_required BOOLEAN DEFAULT false,
  investor_communication_required BOOLEAN DEFAULT false,
  underwriter_notification_required BOOLEAN DEFAULT false,
  internal_notification_required BOOLEAN DEFAULT false,

  -- Action tracking
  action_completed BOOLEAN DEFAULT false,
  action_completed_at TIMESTAMP,
  action_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_company (company_id),
  INDEX idx_type (trigger_type),
  INDEX idx_exceeded (exceeded_threshold)
);

-- KPI snapshots (for correlation with outcomes)
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,

  -- Financial KPIs
  monthly_revenue DECIMAL,
  arr DECIMAL,
  gross_margin_percent FLOAT,
  operating_expense_percent FLOAT,
  cash_balance DECIMAL,
  cash_runway_months INT,

  -- Growth KPIs
  revenue_growth_rate FLOAT,
  customer_growth_rate FLOAT,
  employee_count INT,
  revenue_per_employee DECIMAL,

  -- Health KPIs
  customer_churn_percent FLOAT,
  cac_payback_months INT,
  net_retention_rate FLOAT,

  -- Market KPIs
  market_cap_estimate DECIMAL,
  valuation_estimate DECIMAL,
  comparable_company_multiples FLOAT,

  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_company (company_id),
  INDEX idx_date (snapshot_date)
);

-- Cohort data (for benchmarking)
CREATE TABLE IF NOT EXISTS ipo_cohort_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL, -- SaaS, Healthcare, FinTech, etc.
  metric_name TEXT NOT NULL, -- revenue_growth, gross_margin, etc.
  min_value FLOAT,
  p10_value FLOAT, -- 10th percentile
  p25_value FLOAT, -- 25th percentile
  p50_value FLOAT, -- 50th percentile (median)
  p75_value FLOAT, -- 75th percentile
  p90_value FLOAT, -- 90th percentile
  max_value FLOAT,
  sample_count INT, -- How many companies in this cohort?
  cohort_year INT, -- What year's IPO data?
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(sector, metric_name, cohort_year),
  INDEX idx_sector (sector)
);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_predictions_timestamp
  BEFORE UPDATE ON company_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_timestamp
  BEFORE UPDATE ON prediction_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample historical data (20 recent SaaS IPOs for training)
INSERT INTO historical_ipos (company_name, ipo_date, ipo_valuation, final_valuation, sector, revenue_at_ipo, revenue_growth_rate, gross_margin, cash_runway_months_before_ipo, customer_concentration, ipo_success, ipo_pop_percent, one_year_performance, founder_exit_percent, num_board_seats, num_independent_directors, executive_team_vetting_stage, regulatory_approval_time_days, sec_comment_count, bankers) VALUES
('DataFlow', '2023-06-15', 200000000, 225000000, 'SaaS', 150000000, 0.38, 0.68, 18, 0.12, true, 12.5, 45.0, 15, 7, 4, 8, 38, 5, ARRAY['Goldman Sachs', 'Morgan Stanley']),
('CloudTech', '2023-08-22', 180000000, 198000000, 'SaaS', 95000000, 0.42, 0.65, 16, 0.15, true, 10.0, 38.0, 22, 6, 3, 7, 45, 8, ARRAY['J.P. Morgan', 'Credit Suisse']),
('PlatformX', '2023-10-10', 320000000, 352000000, 'SaaS', 250000000, 0.35, 0.72, 20, 0.08, true, 10.0, 52.0, 18, 8, 5, 9, 35, 3, ARRAY['Goldman Sachs', 'Jefferies']),
('SecureApp', '2024-02-14', 280000000, 294000000, 'Security SaaS', 200000000, 0.40, 0.75, 19, 0.10, true, 5.0, 28.0, 25, 7, 4, 8, 42, 6, ARRAY['Morgan Stanley', 'Barclays']),
('AICore', '2024-04-18', 350000000, 420000000, 'AI/ML SaaS', 210000000, 0.55, 0.70, 15, 0.18, true, 20.0, 78.0, 20, 7, 4, 8, 48, 12, ARRAY['Goldman Sachs', 'Technology bankers']),
('DataVault', '2024-06-05', 150000000, 165000000, 'Data SaaS', 110000000, 0.45, 0.62, 17, 0.20, true, 10.0, 35.0, 30, 6, 3, 7, 40, 7, ARRAY['J.P. Morgan', 'Allen & Company']),
('CloudSync', '2024-07-20', 220000000, 242000000, 'SaaS', 160000000, 0.38, 0.68, 18, 0.14, true, 10.0, 42.0, 16, 7, 4, 8, 38, 4, ARRAY['Goldman Sachs', 'Morgan Stanley']),
('FinFlow', '2024-09-10', 190000000, 228000000, 'FinTech SaaS', 130000000, 0.52, 0.60, 12, 0.32, true, 20.0, 65.0, 28, 6, 3, 6, 50, 15, ARRAY['Morgan Stanley', 'J.P. Morgan']),
('Omnitrack', '2024-11-15', 280000000, 336000000, 'SaaS', 200000000, 0.48, 0.70, 14, 0.16, true, 20.0, 72.0, 12, 8, 5, 9, 45, 9, ARRAY['Goldman Sachs', 'Morgan Stanley', 'Allen & Company'])
ON CONFLICT DO NOTHING;

-- Sample cohort metrics (SaaS at IPO stage)
INSERT INTO ipo_cohort_metrics (sector, metric_name, min_value, p10_value, p25_value, p50_value, p75_value, p90_value, max_value, sample_count, cohort_year) VALUES
('SaaS', 'revenue_growth_rate', 0.25, 0.32, 0.35, 0.40, 0.48, 0.55, 0.65, 45, 2024),
('SaaS', 'gross_margin', 0.55, 0.62, 0.65, 0.68, 0.72, 0.75, 0.82, 45, 2024),
('SaaS', 'customer_churn', 0.02, 0.025, 0.03, 0.035, 0.045, 0.06, 0.10, 45, 2024),
('SaaS', 'cac_payback_months', 8, 12, 14, 18, 22, 28, 36, 45, 2024),
('SaaS', 'customer_concentration_percent', 0.05, 0.08, 0.12, 0.18, 0.28, 0.38, 0.55, 45, 2024),
('SaaS', 'opex_to_revenue_ratio', 0.25, 0.32, 0.35, 0.40, 0.45, 0.52, 0.65, 45, 2024),
('SaaS', 'ev_revenue_multiple', 4.0, 5.5, 6.2, 7.8, 9.5, 11.2, 15.0, 45, 2024)
ON CONFLICT DO NOTHING;
