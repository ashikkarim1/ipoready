-- Create integration credentials and audit log tables
-- Supports OAuth integrations: QuickBooks, Xero, DocuSign, Slack, Google Drive

-- Drop existing types and tables if they exist (for idempotency)
DROP TABLE IF EXISTS integration_audit_log CASCADE;
DROP TABLE IF EXISTS integration_credentials CASCADE;
DROP TYPE IF EXISTS integration_type CASCADE;
DROP TYPE IF EXISTS integration_action CASCADE;
DROP TYPE IF EXISTS integration_audit_status CASCADE;

-- Create enums
CREATE TYPE integration_type AS ENUM ('quickbooks', 'xero', 'docusign', 'slack', 'google_drive');
CREATE TYPE integration_action AS ENUM ('connected', 'disconnected', 'sync_started', 'sync_completed', 'sync_failed', 'refreshed_token');
CREATE TYPE integration_audit_status AS ENUM ('success', 'error');

-- Integration credentials table
-- Stores encrypted OAuth tokens and provider account information
CREATE TABLE integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_type integration_type NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Ensure one active credential per integration type per company
  UNIQUE(company_id, integration_type)
);

-- Indexes for performance
CREATE INDEX idx_integration_credentials_company_id ON integration_credentials(company_id);
CREATE INDEX idx_integration_credentials_type ON integration_credentials(integration_type);
CREATE INDEX idx_integration_credentials_active ON integration_credentials(is_active);
CREATE INDEX idx_integration_credentials_last_synced ON integration_credentials(last_synced_at);

-- Audit log table
-- Tracks all integration auth, sync, and error events
CREATE TABLE integration_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES integration_credentials(id) ON DELETE CASCADE,
  action integration_action NOT NULL,
  status integration_audit_status NOT NULL,
  error_message TEXT,
  synced_records_count INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX idx_integration_audit_log_credential_id ON integration_audit_log(credential_id);
CREATE INDEX idx_integration_audit_log_action ON integration_audit_log(action);
CREATE INDEX idx_integration_audit_log_created_at ON integration_audit_log(created_at DESC);

-- Comments
COMMENT ON TABLE integration_credentials IS 'Stores encrypted OAuth tokens for third-party integrations';
COMMENT ON COLUMN integration_credentials.access_token IS 'Encrypted OAuth access token - MUST be encrypted with INTEGRATION_ENCRYPTION_KEY';
COMMENT ON COLUMN integration_credentials.refresh_token IS 'Encrypted OAuth refresh token - nullable if provider doesn''t support refresh';
COMMENT ON COLUMN integration_credentials.metadata IS 'Provider-specific data (e.g., QuickBooks realm ID, Xero tenant ID)';
COMMENT ON TABLE integration_audit_log IS 'Audit trail of all integration events (connections, disconnections, syncs, errors)';
