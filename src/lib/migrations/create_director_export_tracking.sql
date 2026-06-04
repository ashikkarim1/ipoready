/**
 * Migration: Create Director Export Downloads Tracking Table
 *
 * Purpose: Track all director/officer export operations for audit trails
 * and usage analytics
 *
 * Table: director_export_downloads
 */

-- Create export downloads tracking table
CREATE TABLE IF NOT EXISTS director_export_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  download_key VARCHAR(100) UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Export details
  format VARCHAR(20) NOT NULL, -- 'pdf', 'sedar2', 'sec-edgar'
  director_count INTEGER NOT NULL,
  director_ids UUID[] NOT NULL DEFAULT '{}',
  file_size INTEGER NOT NULL,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'generated', -- 'generated', 'downloaded', 'expired'
  downloaded_count INTEGER NOT NULL DEFAULT 0,
  downloaded_at TIMESTAMP NULL,

  -- Metadata
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

  -- Audit
  ip_address INET NULL,
  user_agent VARCHAR(500) NULL,

  INDEX idx_company_id (company_id),
  INDEX idx_download_key (download_key),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at),
  INDEX idx_status (status)
);

-- Create indexes for querying
CREATE INDEX idx_director_export_company_date
  ON director_export_downloads(company_id, created_at DESC);

CREATE INDEX idx_director_export_status_expires
  ON director_export_downloads(status, expires_at);

-- Add table comment
COMMENT ON TABLE director_export_downloads IS
  'Audit trail for director/officer export operations';

COMMENT ON COLUMN director_export_downloads.download_key IS
  'Unique identifier for download tracking and retrieval';

COMMENT ON COLUMN director_export_downloads.format IS
  'Export format: pdf, sedar2, or sec-edgar';

COMMENT ON COLUMN director_export_downloads.director_ids IS
  'Array of director UUIDs included in export';

COMMENT ON COLUMN director_export_downloads.expires_at IS
  'Automatic expiration after 7 days for security';

-- Function to clean up expired downloads
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  UPDATE director_export_downloads
  SET status = 'expired'
  WHERE status != 'expired'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON director_export_downloads TO authenticated;
GRANT SELECT ON director_export_downloads TO anon;
