/**
 * PACE Accuracy & Billing System Schema
 * Run this migration to add benchmarking, predictive factors, document tracking, and billing support
 */

-- ============================================================
-- PACE ACCURACY: Benchmarking Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS ipo_benchmarks (
  id SERIAL PRIMARY KEY,
  exchange VARCHAR(20) NOT NULL,           -- TSX, NASDAQ, NYSE, TSXV, CSE, OTC, JSE
  phase_id INT NOT NULL,                   -- 1-8 (maps to phase order)
  phase_name VARCHAR(100) NOT NULL,        -- 'pre_planning', 'corporate_restructuring', etc.
  avg_completion_pct FLOAT NOT NULL,       -- Average % completion at this phase
  median_completion_pct FLOAT NOT NULL,    -- Median % completion
  p90_completion_pct FLOAT NOT NULL,       -- Top 10% completion %
  total_companies_in_benchmark INT,        -- Sample size
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exchange, phase_id)
);

CREATE TABLE IF NOT EXISTS ipo_historical_data (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  exchange VARCHAR(20) NOT NULL,
  sector VARCHAR(100),
  ipo_date DATE,
  total_days_to_ipo INT,
  phases_duration JSONB,                   -- {phase_1: 45, phase_2: 120, ...}
  team_size_at_ipo INT,
  pre_ipo_funding_usd DECIMAL(12,2),
  successful BOOLEAN DEFAULT TRUE,         -- Whether IPO succeeded
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ipo_historical_exchange ON ipo_historical_data(exchange);
CREATE INDEX IF NOT EXISTS idx_ipo_historical_ipo_date ON ipo_historical_data(ipo_date);

-- ============================================================
-- PACE ACCURACY: Document Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS document_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,    -- "Articles of Incorporation", "Audited Financials", etc.
  phase_id INT NOT NULL,                   -- Which phase this document belongs to
  completion_pct INT DEFAULT 0,             -- 0-100 (0=not started, 50=draft, 100=final)
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, draft, reviewed, final, approved
  word_count INT,                           -- Document metadata
  page_count INT,
  signature_count INT,
  legal_review_date DATE,
  last_updated DATE,
  reviewer_notes TEXT,
  document_url VARCHAR(500),                -- S3 or storage URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_scorecards_company ON document_scorecards(company_id);
CREATE INDEX IF NOT EXISTS idx_document_scorecards_phase ON document_scorecards(phase_id);
CREATE INDEX IF NOT EXISTS idx_document_scorecards_status ON document_scorecards(status);

-- ============================================================
-- PACE ACCURACY: Predictive Factors (extend companies table)
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS cash_runway_months FLOAT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pre_ipo_funding_raised_usd DECIMAL(12,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS team_size INT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cfo_hired_at DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS board_size INT DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS auditor_selected BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS investor_sophistication_score INT;  -- 1-10

-- ============================================================
-- PACE ACCURACY: Sequencing Validation Logs
-- ============================================================

CREATE TABLE IF NOT EXISTS sequencing_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  violation_rule VARCHAR(255) NOT NULL,   -- e.g., "Auditor must be selected before Financial Audit"
  severity VARCHAR(20) NOT NULL,           -- error, warning
  task_id UUID REFERENCES tasks(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sequencing_violations_company ON sequencing_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_sequencing_violations_resolved ON sequencing_violations(resolved_at);

-- ============================================================
-- BILLING: Stripe Webhook Logging
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(255) NOT NULL,       -- customer.subscription.created, invoice.payment_failed, etc.
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',   -- processed, failed, pending, duplicate
  error_message TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_stripe_customer ON webhook_logs(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- ============================================================
-- BILLING: Subscription & Trial Tracking (extend companies table)
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
  -- active, past_due, cancelled, trialing, expired
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50);
  -- starter, growth, enterprise
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_interval VARCHAR(20);
  -- monthly, sixmonth, annual
ALTER TABLE companies ADD COLUMN IF NOT EXISTS current_period_start DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS current_period_end DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS next_billing_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS payment_failure_count INT DEFAULT 0;

-- Trial tracking
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_start_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_end_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_plan VARCHAR(50) DEFAULT 'growth';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_status VARCHAR(50) DEFAULT 'not_started';
  -- not_started, active, expired, upgraded
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_converted_at TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_conversion_plan VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP;

-- ============================================================
-- BILLING: Payment & Invoice Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  amount_cents INT,                        -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',       -- USD, CAD
  status VARCHAR(50),                      -- draft, open, paid, uncollectible, void
  period_start DATE,
  period_end DATE,
  due_date DATE,
  paid_at TIMESTAMP,
  invoice_pdf_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_company ON billing_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_customer ON billing_invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_created ON billing_invoices(created_at DESC);

-- ============================================================
-- BILLING: Payment History
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_charge_id VARCHAR(255) UNIQUE,
  stripe_invoice_id VARCHAR(255) REFERENCES billing_invoices(stripe_invoice_id),
  amount_cents INT,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(100),             -- card, bank_account
  status VARCHAR(50),                      -- succeeded, failed, cancelled, refunded
  reason_code VARCHAR(100),                -- For failures: insufficient_funds, expired_card, etc.
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_company ON payment_history(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history(created_at DESC);

-- ============================================================
-- BILLING: Feature Gates & Plan Limits
-- ============================================================

CREATE TABLE IF NOT EXISTS plan_limits (
  id SERIAL PRIMARY KEY,
  plan_name VARCHAR(50) UNIQUE,            -- starter, growth, enterprise
  max_team_members INT,
  max_document_storage_gb INT,
  max_whatsapp_msgs_per_month INT,
  whatsapp_ai_enabled BOOLEAN,
  max_api_calls_per_day INT,
  custom_integrations_allowed BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default plan limits
INSERT INTO plan_limits (plan_name, max_team_members, max_document_storage_gb, max_whatsapp_msgs_per_month, whatsapp_ai_enabled, max_api_calls_per_day, custom_integrations_allowed)
VALUES
  ('starter', 5, 5, 100, FALSE, 1000, FALSE),
  ('growth', 15, 25, 1000, TRUE, 5000, FALSE),
  ('enterprise', 999, 100, 10000, TRUE, 50000, TRUE)
ON CONFLICT (plan_name) DO NOTHING;

-- ============================================================
-- BILLING: Usage Tracking (for metered billing)
-- ============================================================

CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  metric_type VARCHAR(100),                -- whatsapp_messages_sent, api_calls, storage_gb, etc.
  month DATE,                              -- YYYY-MM-01 format for monthly aggregation
  usage_count INT DEFAULT 0,
  cost_cents INT DEFAULT 0,                -- Additional charge if applicable
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_company ON usage_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_month ON usage_metrics(month);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_metric ON usage_metrics(metric_type);

-- ============================================================
-- Create helpful views
-- ============================================================

CREATE OR REPLACE VIEW v_company_billing_summary AS
SELECT
  c.id,
  c.name,
  c.subscription_plan,
  c.subscription_status,
  c.subscription_interval,
  c.next_billing_date,
  c.trial_status,
  c.trial_end_date,
  pl.max_team_members,
  pl.max_document_storage_gb,
  CASE WHEN c.subscription_status = 'cancelled' THEN NULL ELSE c.next_billing_date END as active_until
FROM companies c
LEFT JOIN plan_limits pl ON c.subscription_plan = pl.plan_name;

CREATE OR REPLACE VIEW v_company_pace_summary AS
SELECT
  c.id,
  c.name,
  c.pace_score,
  c.progress_percentage,
  c.estimated_days_to_ipo,
  c.current_phase,
  c.target_exchange,
  c.cash_runway_months,
  c.team_size,
  c.board_size,
  c.auditor_selected,
  COUNT(DISTINCT ds.id) as documents_total,
  SUM(CASE WHEN ds.status = 'final' THEN 1 ELSE 0 END) as documents_final
FROM companies c
LEFT JOIN document_scorecards ds ON c.id = ds.company_id
GROUP BY c.id;
