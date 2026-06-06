-- ============================================================================
-- Migration: 002_unified_documents.sql
-- Purpose: Deploy unified document system + cloud storage integrations
-- Date: June 6, 2026
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- TABLE: unified_documents
-- Single source of truth for all documents across entire application
-- ============================================================================
CREATE TABLE IF NOT EXISTS unified_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Identity
  name VARCHAR(255) NOT NULL,               -- Actual filename
  display_name VARCHAR(255),                -- "Financial Statements (10-K)"
  description TEXT,
  mime_type VARCHAR(100),                   -- "application/pdf", etc.

  -- Storage Location
  storage_provider VARCHAR(50) NOT NULL,    -- 'local', 'google_drive', 'dropbox', 'onedrive', 'box'
  storage_id VARCHAR(500),                  -- File ID in cloud service
  cloud_path VARCHAR(1000),                 -- /Data Room/Financial/10-K.pdf
  file_size BIGINT,                         -- bytes

  -- Classification
  category VARCHAR(100),                    -- 'financial', 'legal', 'governance', etc.
  subcategory VARCHAR(100),
  document_type VARCHAR(100),               -- 'prospectus', 'audited_financials', etc.

  -- Status & Lifecycle
  status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- 'draft', 'in_review', 'approved', 'archived'
  completeness INTEGER DEFAULT 0,           -- 0-100%
  compliance_status VARCHAR(50) DEFAULT 'compliant',
  required_for_filing BOOLEAN DEFAULT FALSE,

  -- Versioning
  current_version INTEGER DEFAULT 1,
  total_versions INTEGER DEFAULT 1,
  previous_version_ids UUID[],

  -- Metadata
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  last_modified_by UUID,
  last_modified_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Access Control
  owner_user_id UUID NOT NULL,

  -- Relationships
  parent_folder_id VARCHAR(500),
  related_documents UUID[],

  -- Comments
  comment_count INTEGER DEFAULT 0,
  last_comment JSONB,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_unified_status CHECK (status IN ('draft', 'in_review', 'approved', 'archived')),
  CONSTRAINT ck_unified_completeness CHECK (completeness >= 0 AND completeness <= 100)
);

CREATE INDEX IF NOT EXISTS idx_unified_company_id ON unified_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_unified_category ON unified_documents(category);
CREATE INDEX IF NOT EXISTS idx_unified_status ON unified_documents(status);
CREATE INDEX IF NOT EXISTS idx_unified_storage_provider ON unified_documents(storage_provider);
CREATE INDEX IF NOT EXISTS idx_unified_storage_id ON unified_documents(storage_id);
CREATE INDEX IF NOT EXISTS idx_unified_parent_folder ON unified_documents(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_unified_created_at ON unified_documents(created_at DESC);

-- ============================================================================
-- TABLE: cloud_storage_providers
-- Store enabled cloud providers + OAuth settings per company
-- ============================================================================
CREATE TABLE IF NOT EXISTS cloud_storage_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,

  -- Enabled providers
  enabled_providers VARCHAR(50)[],          -- ['google_drive', 'dropbox']

  -- Provider-specific settings (JSON)
  provider_settings JSONB,

  -- Sync tracking
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50),             -- 'success', 'partial', 'failed'

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cloud_providers_company ON cloud_storage_providers(company_id);

-- ============================================================================
-- TABLE: document_versions
-- Track version history for all documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  storage_id VARCHAR(500),                  -- Cloud file ID for this version
  file_size BIGINT,
  mime_type VARCHAR(100),

  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  change_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON document_versions(document_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_versions_unique ON document_versions(document_id, version_number);

-- ============================================================================
-- TABLE: document_comments
-- Comments and feedback on documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES unified_documents(id) ON DELETE CASCADE,

  author_id UUID NOT NULL,
  text TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',        -- 'open', 'resolved'

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_comments_document ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_comments_author ON document_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_doc_comments_status ON document_comments(status);

-- ============================================================================
-- TABLE: document_access_log
-- Immutable audit trail for all document operations (SOC 2 / GDPR compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,

  action VARCHAR(50) NOT NULL,              -- 'view', 'download', 'edit', 'delete', 'restore'
  user_id UUID,
  user_email VARCHAR(255),

  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,

  details JSONB                             -- Additional context
);

CREATE INDEX IF NOT EXISTS idx_access_log_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_access_log_user ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_log_timestamp ON document_access_log(timestamp DESC);

-- ============================================================================
-- TABLE: data_room_folders
-- Folder structure for data room
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_room_folders (
  id VARCHAR(500) PRIMARY KEY,              -- cloud_path or cloud folder ID
  company_id UUID NOT NULL,

  name VARCHAR(255) NOT NULL,
  cloud_folder_id VARCHAR(500),             -- Folder ID in cloud service
  cloud_path VARCHAR(1000),
  parent_id VARCHAR(500),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_room_company ON data_room_folders(company_id);
CREATE INDEX IF NOT EXISTS idx_data_room_parent ON data_room_folders(parent_id);

-- ============================================================================
-- Support for automatic timestamp updates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER unified_documents_update BEFORE UPDATE ON unified_documents
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER cloud_providers_update BEFORE UPDATE ON cloud_storage_providers
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER document_comments_update BEFORE UPDATE ON document_comments
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- Add unified_documents reference to existing companies table (if needed)
-- ============================================================================
-- Ensure companies table can link to documents
-- ALTER TABLE unified_documents ADD CONSTRAINT fk_company_id
--   FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

COMMIT;
