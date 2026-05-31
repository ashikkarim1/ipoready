/**
 * Lead Capture & Trial Lifecycle Schema
 * Mandatory lead capture gate, trial tracking, and feature gating support
 */

-- ============================================================
-- LEAD CAPTURE: Mandatory signup form data
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(100) NOT NULL,
  listing_exchange_target VARCHAR(20) NOT NULL,  -- TSX, NASDAQ, NYSE, TSXV, CSE, OTC, JSE, Other
  job_title VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  trial_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'captured',  -- captured, converted_to_trial, converted_to_user
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_captures_email ON lead_captures(email);
CREATE INDEX IF NOT EXISTS idx_lead_captures_company_name ON lead_captures(company_name);
CREATE INDEX IF NOT EXISTS idx_lead_captures_status ON lead_captures(status);
CREATE INDEX IF NOT EXISTS idx_lead_captures_created_at ON lead_captures(created_at);

-- ============================================================
-- TRIAL LIFECYCLE: Extend companies table with trial fields
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_status VARCHAR(50) DEFAULT 'none';  -- none, active, expired, upgraded
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_start_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_end_date DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_plan VARCHAR(50) DEFAULT 'growth';  -- starter, growth, enterprise
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_converted_at TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_conversion_plan VARCHAR(50);  -- Plan user upgraded to
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_days_remaining INT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);  -- Stripe subscription ID
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);  -- active, trialing, past_due, cancelled, expired
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50);  -- starter, growth, enterprise
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create indexes for trial queries
CREATE INDEX IF NOT EXISTS idx_companies_trial_status ON companies(trial_status);
CREATE INDEX IF NOT EXISTS idx_companies_trial_end_date ON companies(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON companies(subscription_status);

-- ============================================================
-- TRIAL NOTIFICATIONS: Track expiry warnings sent
-- ============================================================

CREATE TABLE IF NOT EXISTS trial_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,  -- expiry_warning_1day, trial_expired
  sent_at TIMESTAMP DEFAULT NOW(),
  email_address VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_trial_notifications_company ON trial_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_trial_notifications_sent_at ON trial_notifications(sent_at);

-- ============================================================
-- FEATURE ACCESS LOG: Audit when users hit feature gates
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  access_granted BOOLEAN,
  subscription_plan VARCHAR(50),
  trial_status VARCHAR(50),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_access_logs_user ON feature_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_logs_company ON feature_access_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_logs_feature ON feature_access_logs(feature_name);
