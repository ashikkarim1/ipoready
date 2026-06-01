/**
 * Migration 015: Add Missing Columns for Test Suite
 * 
 * Adds columns required by test suite:
 * - event_id to webhook_logs (for idempotency checking)
 * - email to companies (for trial expiry notifications)
 */

-- ============================================================
-- Add event_id column to webhook_logs for idempotency
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_logs' AND column_name = 'event_id') THEN
    ALTER TABLE webhook_logs ADD COLUMN event_id VARCHAR(255) UNIQUE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);

-- ============================================================
-- Add email column to companies for notifications
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'email') THEN
    ALTER TABLE companies ADD COLUMN email VARCHAR(255);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);

-- ============================================================
-- Verify stripe_customer_id exists in trial_auto_upgrade_queue
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trial_auto_upgrade_queue' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE trial_auto_upgrade_queue ADD COLUMN stripe_customer_id VARCHAR(255);
  END IF;
END $$;
