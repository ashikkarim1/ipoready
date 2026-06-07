-- Migration: Daily Engagement System for Market Advantage
-- Purpose: Store daily snapshots and alert history for living dashboard

-- Table 1: Daily Intelligence Snapshots (time-series data)
CREATE TABLE IF NOT EXISTS market_advantage_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Snapshot metadata
  snapshot_date DATE NOT NULL,
  captured_at TIMESTAMP NOT NULL DEFAULT now(),

  -- Core scores (0-100)
  ipo_readiness_score INTEGER NOT NULL,
  market_window_60day_probability INTEGER NOT NULL,
  market_window_90day_probability INTEGER NOT NULL,
  market_window_180day_probability INTEGER NOT NULL,

  -- Breakdown scores (sum to 100)
  readiness_growth_score INTEGER NOT NULL,
  readiness_profitability_score INTEGER NOT NULL,
  readiness_unit_econ_score INTEGER NOT NULL,
  readiness_team_score INTEGER NOT NULL,
  readiness_capital_score INTEGER NOT NULL,
  readiness_market_conditions_score INTEGER NOT NULL,

  -- Valuation (in millions USD)
  expected_valuation_60day DECIMAL(12, 2) NOT NULL,
  expected_valuation_90day DECIMAL(12, 2) NOT NULL,
  expected_valuation_180day DECIMAL(12, 2) NOT NULL,

  -- Competitive positioning
  percentile_rank_overall INTEGER NOT NULL, -- 0-100 (75 = 75th percentile)
  percentile_rank_growth INTEGER NOT NULL,
  percentile_rank_margin INTEGER NOT NULL,
  percentile_rank_unit_econ INTEGER NOT NULL,
  percentile_rank_retention INTEGER NOT NULL,
  competitive_position TEXT, -- 'market-leader' | 'strong' | 'competitive' | 'lagging' | 'at-risk'

  -- Market conditions
  fed_rate DECIMAL(5, 2) NOT NULL, -- 4.33, 5.00, etc
  corp_bond_spread INTEGER NOT NULL, -- basis points
  vix_index DECIMAL(5, 2) NOT NULL,
  market_sentiment TEXT NOT NULL, -- 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish'
  ipo_pipeline_volume INTEGER NOT NULL, -- companies filing S-1s this month

  -- Company metrics (snapshot of current state)
  growth_rate_yoy DECIMAL(5, 2) NOT NULL,
  operating_margin DECIMAL(5, 2) NOT NULL,
  magic_number DECIMAL(5, 2) NOT NULL,
  ndr_retention DECIMAL(5, 2) NOT NULL,
  team_headcount INTEGER NOT NULL,

  -- Change indicators (vs previous day)
  readiness_score_delta INTEGER, -- +1, -2, 0
  valuation_delta_90day DECIMAL(12, 2), -- +$50M, -$10M
  percentile_delta INTEGER, -- +2, -1, 0
  fed_rate_delta DECIMAL(5, 2), -- +0.25, -0.10
  sentiment_change TEXT, -- 'neutral->bullish', 'same', etc

  -- Metadata
  data_completeness DECIMAL(5, 2) DEFAULT 100.0, -- 95.5, 87.2, etc
  notes TEXT,

  UNIQUE(company_id, snapshot_date),
  INDEX idx_company_date (company_id, snapshot_date DESC),
  INDEX idx_snapshot_date (snapshot_date DESC)
);

-- Table 2: Alert History (for tracking what was alerted)
CREATE TABLE IF NOT EXISTS market_advantage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Alert metadata
  alert_type TEXT NOT NULL, -- 'market-window-closing' | 'fed-rate-change' | 'sentiment-shift' | 'competitor-filed' | 'readiness-jump' | 'runway-alert' | 'ipo-calendar-spike' | 'peer-milestone'
  alert_level TEXT NOT NULL, -- '🔴 CRITICAL' | '🟡 WARNING' | '🔵 INFO' | '✨ OPPORTUNITY'
  severity INTEGER NOT NULL, -- 1-5 (5 = most urgent)

  -- Alert content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,

  -- Trigger metadata
  triggered_at TIMESTAMP NOT NULL DEFAULT now(),
  triggered_by TEXT, -- 'fed-rate' | 'sentiment' | 'competitor' | 'scheduled' | 'user'
  trigger_value JSONB, -- { "fed_rate": 4.08, "delta": -0.25, "impact": "+$90M valuation" }

  -- Delivery tracking
  emailed_at TIMESTAMP,
  push_notified_at TIMESTAMP,
  in_app_shown_at TIMESTAMP,
  user_acknowledged_at TIMESTAMP,

  -- Alert lifecycle
  is_active BOOLEAN DEFAULT true,
  sticky_until TIMESTAMP, -- Keep visible for 7 days

  INDEX idx_company_active (company_id, is_active),
  INDEX idx_triggered (triggered_at DESC),
  INDEX idx_alert_type (alert_type)
);

-- Table 3: Competitor Activity Tracker
CREATE TABLE IF NOT EXISTS market_advantage_competitor_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Competitor info
  competitor_name TEXT NOT NULL,
  competitor_sector TEXT,
  competitor_growth_rate DECIMAL(5, 2),
  competitor_valuation DECIMAL(12, 2), -- millions

  -- Activity
  activity_type TEXT NOT NULL, -- 's1-filed' | 'valuation-updated' | 'raised-funding' | 'market-milestone'
  activity_date DATE NOT NULL,

  -- Context
  your_position_vs_competitor TEXT, -- 'ahead-on-growth' | 'behind-on-timing' | 'stronger-unit-econ' | 'more-profitable'
  action_recommendation TEXT,

  -- Tracking
  alerted_user_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  INDEX idx_company_date (company_id, activity_date DESC)
);

-- Table 4: Daily Milestone Tracking
CREATE TABLE IF NOT EXISTS market_advantage_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Milestone definition
  milestone_name TEXT NOT NULL, -- 'Target IPO Date' | 'Prospectus Complete' | 'Reach 80 Readiness' | 'File S-1'
  milestone_date DATE NOT NULL,
  milestone_category TEXT, -- 'readiness' | 'timeline' | 'financial' | 'document'

  -- Progress tracking
  target_value DECIMAL(10, 2), -- e.g. 80 for readiness score, $2B for valuation
  current_value DECIMAL(10, 2), -- updated daily
  unit TEXT, -- 'score' | 'millions' | 'pages' | 'days'

  -- Trajectory
  progress_percentage DECIMAL(5, 2), -- 0-100
  days_remaining INTEGER,
  on_track_status TEXT, -- 'on-track' | 'at-risk' | 'ahead-of-schedule' | 'behind'

  -- Alerts
  alert_threshold DECIMAL(5, 2), -- Notify if falling below this % (e.g., 50% -> alert if <50%)
  last_alert_sent_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  INDEX idx_company_status (company_id, on_track_status)
);

-- Table 5: Email Digest Preferences & History
CREATE TABLE IF NOT EXISTS market_advantage_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Digest preferences
  email_enabled BOOLEAN DEFAULT true,
  email_time TEXT DEFAULT '09:00', -- 24h format (09:00 = 9 AM)
  email_timezone TEXT DEFAULT 'America/New_York',
  email_frequency TEXT DEFAULT 'daily', -- 'daily' | 'weekly' | 'disabled'

  -- Content preferences
  include_alerts BOOLEAN DEFAULT true,
  include_metrics BOOLEAN DEFAULT true,
  include_benchmarking BOOLEAN DEFAULT true,
  include_competitor_activity BOOLEAN DEFAULT true,
  include_action_items BOOLEAN DEFAULT true,
  include_weekly_summary BOOLEAN DEFAULT true,

  -- Recipient segmentation
  recipient_role TEXT, -- 'ceo' | 'cfo' | 'head-of-ir' | 'all-stakeholders'

  -- Tracking
  last_email_sent_at TIMESTAMP,
  email_open_rate_30d DECIMAL(5, 2),
  email_click_rate_30d DECIMAL(5, 2),

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  INDEX idx_company_enabled (company_id, email_enabled)
);

-- Table 6: Market Condition History (for trend analysis)
CREATE TABLE IF NOT EXISTS market_advantage_market_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date
  recorded_date DATE NOT NULL UNIQUE,
  recorded_at TIMESTAMP NOT NULL DEFAULT now(),

  -- Economic indicators
  fed_rate DECIMAL(5, 2) NOT NULL,
  corp_bond_spread INTEGER NOT NULL,
  vix_index DECIMAL(5, 2) NOT NULL,
  market_sentiment TEXT NOT NULL, -- 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish'
  ipo_pipeline_volume INTEGER NOT NULL,
  recent_ipo_count INTEGER,
  avg_saas_ipo_pop DECIMAL(5, 2),

  -- Aggregates (for quick queries)
  saas_filing_count INTEGER,
  market_favorable_score INTEGER, -- 0-100 (higher = better for IPOs)

  INDEX idx_recorded_date (recorded_date DESC)
);

-- Grants
GRANT SELECT, INSERT ON market_advantage_daily_snapshots TO authenticated;
GRANT SELECT, INSERT ON market_advantage_alerts TO authenticated;
GRANT SELECT, INSERT ON market_advantage_competitor_activity TO authenticated;
GRANT SELECT, INSERT ON market_advantage_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE ON market_advantage_email_settings TO authenticated;
GRANT SELECT ON market_advantage_market_conditions TO authenticated;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_snapshots_trend ON market_advantage_daily_snapshots(company_id, snapshot_date DESC) WHERE snapshot_date >= CURRENT_DATE - INTERVAL '90 days';
CREATE INDEX IF NOT EXISTS idx_alerts_active ON market_advantage_alerts(company_id, is_active, triggered_at DESC) WHERE is_active = true;
