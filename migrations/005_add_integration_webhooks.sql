-- Extend webhook_logs table to support integration webhooks (Carta, Pulley, DocuSign)

DO $$
BEGIN
  -- Add provider column to distinguish between Stripe and integration webhooks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'provider') THEN
    ALTER TABLE webhook_logs ADD COLUMN provider VARCHAR(50);
  END IF;

  -- Add signature_valid column to track webhook signature verification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'signature_valid') THEN
    ALTER TABLE webhook_logs ADD COLUMN signature_valid VARCHAR(50) DEFAULT 'pending';
  END IF;

  -- Add company_id column to link webhooks to companies
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_logs' AND column_name = 'company_id') THEN
    ALTER TABLE webhook_logs ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

END $$;

-- Create index for integration webhook lookups
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_company ON webhook_logs(company_id);
