-- ═══════════════════════════════════════════════════════════════════════════════
-- IPOReady Investor Platform Database Schema
-- Neon PostgreSQL Migration
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. INVESTOR_PROFILES - Core investor data
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  firm_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  min_check_size INTEGER NOT NULL,  -- in USD
  max_check_size INTEGER NOT NULL,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexing for quick lookups
  INDEX idx_investor_email (email),
  INDEX idx_investor_firm (firm_name),
  INDEX idx_investor_created (created_at)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. INVESTOR_CRITERIA - Investment preferences (normalized)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,

  -- Investment preferences
  preferred_stages TEXT[] NOT NULL,  -- Array: ['Seed', 'Series A', 'Series B', ...]
  preferred_sectors TEXT[] NOT NULL,  -- Array: ['Enterprise SaaS', 'FinTech', ...]
  preferred_geographies TEXT[] NOT NULL,  -- Array: ['North America', 'Europe', ...]
  funding_types TEXT[] NOT NULL,  -- Array: ['equity', 'debt', 'bridge']

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(investor_id),
  INDEX idx_investor_criteria_investor (investor_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. INVESTOR_NOTIFICATION_PREFERENCES - Email & alert settings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,

  -- Notification settings
  email_notifications_enabled BOOLEAN DEFAULT true,
  real_time_alerts_enabled BOOLEAN DEFAULT true,
  weekly_digest_enabled BOOLEAN DEFAULT true,
  weekly_digest_day VARCHAR(20) DEFAULT 'Monday',  -- Monday, Tuesday, etc.

  -- Alert triggers
  alert_on_pace_drop BOOLEAN DEFAULT true,
  alert_on_customer_concentration BOOLEAN DEFAULT true,
  alert_on_runway_low BOOLEAN DEFAULT true,
  alert_on_key_person_departure BOOLEAN DEFAULT true,
  alert_on_regulatory_issue BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(investor_id),
  INDEX idx_notif_prefs_investor (investor_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INVESTOR_SAVED_COMPANIES - Watchlist
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_saved_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,  -- References company in main app (not created here)
  company_name VARCHAR(255) NOT NULL,

  -- Metadata
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  priority VARCHAR(20) DEFAULT 'NORMAL',  -- HOT, NORMAL, MAYBE

  INDEX idx_saved_investor (investor_id),
  INDEX idx_saved_company (company_id),
  UNIQUE(investor_id, company_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INVESTOR_ALERTS - Alert history (audit trail)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  company_name VARCHAR(255) NOT NULL,

  -- Alert metadata
  alert_type VARCHAR(50) NOT NULL,  -- company_raise, pace_drop, customer_departure, etc.
  severity VARCHAR(20) NOT NULL,  -- CRITICAL, HIGH, MEDIUM, LOW
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Match context
  match_score INTEGER,  -- 0-100
  funding_amount INTEGER,  -- in USD
  funding_type VARCHAR(20),  -- equity, debt, bridge

  -- Delivery
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMP,
  email_clicked BOOLEAN DEFAULT false,
  email_clicked_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_alert_investor (investor_id),
  INDEX idx_alert_company (company_id),
  INDEX idx_alert_created (created_at),
  INDEX idx_alert_severity (severity),
  INDEX idx_alert_type (alert_type)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. INVESTOR_MESSAGES - Communication with founders/companies
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,

  -- Message content
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL,  -- outreach, follow_up, question

  -- Status tracking
  status VARCHAR(50) DEFAULT 'DRAFT',  -- DRAFT, SENT, OPENED, REPLIED, MEETING_SCHEDULED
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  replied_at TIMESTAMP,

  -- Follow-up
  next_follow_up TIMESTAMP,
  follow_up_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_msg_investor (investor_id),
  INDEX idx_msg_company (company_id),
  INDEX idx_msg_status (status),
  INDEX idx_msg_created (created_at)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. INVESTOR_EMAIL_LOGS - Resend email delivery tracking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,

  -- Email metadata
  email_type VARCHAR(50) NOT NULL,  -- company_alert, weekly_digest, outreach_template
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,

  -- Resend tracking
  resend_message_id VARCHAR(255),  -- Message ID from Resend API
  resend_status VARCHAR(50),  -- sent, delivered, bounced, complained, etc.

  -- Event tracking
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,

  -- Context
  company_id UUID,
  company_name VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_investor (investor_id),
  INDEX idx_email_type (email_type),
  INDEX idx_email_resend_id (resend_message_id),
  INDEX idx_email_sent (sent_at)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. INVESTOR_PORTFOLIO - Track investor's invested companies
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,

  -- Investment details
  investment_date TIMESTAMP NOT NULL,
  investment_amount INTEGER,  -- in USD
  round_type VARCHAR(50),  -- Seed, Series A, Series B, etc.
  ownership_percentage DECIMAL(5, 2),  -- 0.00 - 100.00

  -- Status
  status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, EXITED, WRITE_OFF
  exit_date TIMESTAMP,
  exit_value INTEGER,  -- in USD

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_portfolio_investor (investor_id),
  INDEX idx_portfolio_company (company_id),
  INDEX idx_portfolio_investment_date (investment_date)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. INVESTOR_ACTIVITY_LOG - Audit trail of investor actions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,

  -- Activity
  action VARCHAR(100) NOT NULL,  -- viewed_company, saved_company, sent_message, opened_email, etc.
  resource_type VARCHAR(50),  -- company, message, alert, etc.
  resource_id UUID,

  -- Metadata
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_activity_investor (investor_id),
  INDEX idx_activity_action (action),
  INDEX idx_activity_created (created_at)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES FOR COMMON QUERIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Find investors matching specific criteria
CREATE INDEX idx_investor_check_size ON investor_profiles(min_check_size, max_check_size);

-- Find recent alerts by type and severity
CREATE INDEX idx_alerts_recent_by_severity ON investor_alerts(created_at DESC, severity);

-- Find unread alerts
CREATE INDEX idx_alerts_unread ON investor_alerts(investor_id, email_opened) WHERE email_opened = false;

-- Find pending follow-ups
CREATE INDEX idx_messages_pending_followup ON investor_messages(investor_id, next_follow_up) WHERE status != 'REPLIED';

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investor_profiles_updated_at
BEFORE UPDATE ON investor_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_criteria_updated_at
BEFORE UPDATE ON investor_criteria
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_notification_preferences_updated_at
BEFORE UPDATE ON investor_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- END MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
