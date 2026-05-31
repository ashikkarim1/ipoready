-- Phase 2 Schema Migration: PACE Deepening, Billing System, Trials
-- Run this migration to add benchmarking, trial periods, webhooks, and advanced PACE scoring

-- ====================================================================
-- PART 1: PACE ACCURACY DEEPENING
-- ====================================================================

-- IPO Benchmarks: Real data-driven peer comparison
CREATE TABLE IF NOT EXISTS ipo_benchmarks (
  id SERIAL PRIMARY KEY,
  exchange VARCHAR(20) NOT NULL,           -- TSX, NASDAQ, NYSE, TSXV, CSE, OTC, JSE
  phase_id INT NOT NULL,                   -- 1-8
  avg_completion_pct FLOAT NOT NULL,       -- avg % of companies at this phase
  median_completion_pct FLOAT NOT NULL,
  p90_completion_pct FLOAT NOT NULL,       -- top 10% of companies
  total_companies_in_benchmark INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ipo_benchmarks_exchange_phase ON ipo_benchmarks(exchange, phase_id);

-- IPO Historical Data: Seed with real/synthetic IPO records
CREATE TABLE IF NOT EXISTS ipo_historical_data (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  exchange VARCHAR(20),
  sector VARCHAR(100),
  ipo_date DATE,
  total_days_to_ipo INT,
  phases_duration JSONB,                   -- {phase_1: 45, phase_2: 120, ...}
  team_size_at_ipo INT,
  pre_ipo_funding_usd DECIMAL(12,2),
  successful BOOLEAN,                      -- Whether IPO succeeded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ipo_historical_exchange ON ipo_historical_data(exchange);
CREATE INDEX idx_ipo_historical_successful ON ipo_historical_data(successful);

-- Document Completeness Tracking
CREATE TABLE IF NOT EXISTS document_scorecards (
  id SERIAL PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_name VARCHAR(255),              -- "Articles of Incorporation", etc.
  phase_id INT,
  completion_pct INT,                      -- 0-100 (0=not started, 50=draft, 100=final)
  last_updated DATE,
  reviewer_notes TEXT,
  status VARCHAR(50),                      -- 'not_started', 'in_progress', 'draft', 'reviewed', 'final'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_scorecards_company ON document_scorecards(company_id);
CREATE INDEX idx_document_scorecards_phase ON document_scorecards(phase_id);

-- ====================================================================
-- PART 2: BILLING SYSTEM (STRIPE WEBHOOKS, TRIAL PERIODS)
-- ====================================================================

-- Extend companies table with subscription and trial fields
DO $$
BEGIN
  -- Stripe customer and subscription fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE companies ADD COLUMN stripe_customer_id VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'subscription_id') THEN
    ALTER TABLE companies ADD COLUMN subscription_id VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'subscription_status') THEN
    ALTER TABLE companies ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'subscription_plan') THEN
    ALTER TABLE companies ADD COLUMN subscription_plan VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'subscription_interval') THEN
    ALTER TABLE companies ADD COLUMN subscription_interval VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'current_period_start') THEN
    ALTER TABLE companies ADD COLUMN current_period_start DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'current_period_end') THEN
    ALTER TABLE companies ADD COLUMN current_period_end DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'next_billing_date') THEN
    ALTER TABLE companies ADD COLUMN next_billing_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'cancelled_at') THEN
    ALTER TABLE companies ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'payment_failure_count') THEN
    ALTER TABLE companies ADD COLUMN payment_failure_count INT DEFAULT 0;
  END IF;

  -- Trial period fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'trial_start_date') THEN
    ALTER TABLE companies ADD COLUMN trial_start_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'trial_end_date') THEN
    ALTER TABLE companies ADD COLUMN trial_end_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'trial_plan') THEN
    ALTER TABLE companies ADD COLUMN trial_plan VARCHAR(50) DEFAULT 'growth';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'trial_status') THEN
    ALTER TABLE companies ADD COLUMN trial_status VARCHAR(50) DEFAULT 'not_started';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'trial_converted_at') THEN
    ALTER TABLE companies ADD COLUMN trial_converted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'trial_conversion_plan') THEN
    ALTER TABLE companies ADD COLUMN trial_conversion_plan VARCHAR(50);
  END IF;

  -- Readiness factors for predictive PACE scoring
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'cash_runway_months') THEN
    ALTER TABLE companies ADD COLUMN cash_runway_months FLOAT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'pre_ipo_funding_raised_usd') THEN
    ALTER TABLE companies ADD COLUMN pre_ipo_funding_raised_usd DECIMAL(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'team_size') THEN
    ALTER TABLE companies ADD COLUMN team_size INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'cfo_hired_at') THEN
    ALTER TABLE companies ADD COLUMN cfo_hired_at DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'board_size') THEN
    ALTER TABLE companies ADD COLUMN board_size INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'auditor_selected') THEN
    ALTER TABLE companies ADD COLUMN auditor_selected BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'investor_sophistication_score') THEN
    ALTER TABLE companies ADD COLUMN investor_sophistication_score INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'updated_at') THEN
    ALTER TABLE companies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END
$$;

-- Stripe Webhook Logs: Audit trail of all webhook events
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(255),                 -- e.g., "invoice.payment_failed"
  stripe_customer_id VARCHAR(255),
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',    -- 'processed', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_customer_id ON webhook_logs(stripe_customer_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Email Verification Tokens: For signup email verification flow
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  email_to VARCHAR(255) NOT NULL,          -- Email address to verify
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires ON email_verification_tokens(expires_at);

-- ====================================================================
-- PART 3: FUNCTION FOR UPDATED_AT TRIGGERS
-- ====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for companies table updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
