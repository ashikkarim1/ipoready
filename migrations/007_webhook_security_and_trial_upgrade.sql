/**
 * Migration 006: Webhook Security & Trial Auto-Upgrade
 * 
 * Adds tables for:
 * - Subscription state machine audit logging
 * - Trial auto-upgrade queue and retry system
 */

-- ============================================================
-- Subscription State Machine Audit Table
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id VARCHAR(255),
  from_state VARCHAR(50) NOT NULL,
  to_state VARCHAR(50) NOT NULL,
  trigger VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_state_transitions_company 
  ON subscription_state_transitions(company_id);

CREATE INDEX IF NOT EXISTS idx_subscription_state_transitions_states 
  ON subscription_state_transitions(from_state, to_state);

CREATE INDEX IF NOT EXISTS idx_subscription_state_transitions_created 
  ON subscription_state_transitions(created_at DESC);

-- ============================================================
-- Trial Auto-Upgrade Queue Table
-- ============================================================

CREATE TABLE IF NOT EXISTS trial_auto_upgrade_queue (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  trial_end_date DATE NOT NULL,
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMP NOT NULL,
  last_error TEXT,
  status VARCHAR(50) DEFAULT 'pending',
    -- pending (initial), retrying (failed and queued), failed (max retries), succeeded (removed)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trial_auto_upgrade_queue_status 
  ON trial_auto_upgrade_queue(status);

CREATE INDEX IF NOT EXISTS idx_trial_auto_upgrade_queue_next_retry 
  ON trial_auto_upgrade_queue(next_retry_at);

CREATE INDEX IF NOT EXISTS idx_trial_auto_upgrade_queue_company 
  ON trial_auto_upgrade_queue(company_id);

-- ============================================================
-- Add webhook security columns to existing webhook_logs table
-- ============================================================

ALTER TABLE webhook_logs 
  ADD COLUMN IF NOT EXISTS signature_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS request_body_sample TEXT,
  ADD COLUMN IF NOT EXISTS rate_limited BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_verified 
  ON webhook_logs(signature_verified);

-- ============================================================
-- Add rate limiting tracking table
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(255) NOT NULL,
  window_start TIMESTAMP NOT NULL,
  webhook_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_webhook_rate_limits_customer_window 
  ON webhook_rate_limits(customer_id, window_start);

-- ============================================================
-- Add security event logging for audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
    -- webhook_signature_failed, webhook_rejected, rate_limit_exceeded, 
    -- state_machine_violation, subscription_recovery_escalation
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  stripe_customer_id VARCHAR(255),
  severity VARCHAR(20) NOT NULL, -- info, warning, error, critical
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type 
  ON security_events(event_type);

CREATE INDEX IF NOT EXISTS idx_security_events_company 
  ON security_events(company_id);

CREATE INDEX IF NOT EXISTS idx_security_events_severity 
  ON security_events(severity);

CREATE INDEX IF NOT EXISTS idx_security_events_created 
  ON security_events(created_at DESC);

-- ============================================================
-- Add comments for clarity
-- ============================================================

COMMENT ON TABLE subscription_state_transitions IS
'Audit log of all subscription state machine transitions. Used to prevent invalid state changes and provide audit trail.';

COMMENT ON TABLE trial_auto_upgrade_queue IS
'Queue for trial-to-subscription conversions that failed. Implements exponential backoff retry: 1min, 5min, 1hr, 1day.';

COMMENT ON TABLE security_events IS
'Security audit log for webhook verification, rate limiting, and state machine violations.';
