-- ============================================================================
-- IPOReady: Unified Document Management Schema
-- Purpose: Single source of truth for all documents across application
-- Supports Google Drive, Dropbox, OneDrive, Box integrations
-- ============================================================================

-- ============================================================================
-- TABLE: unified_documents
-- Purpose: Master document table - all documents across all pages query this
-- ============================================================================
CREATE TABLE unified_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Identity
  name VARCHAR(255) NOT NULL,               -- Actual filename
  display_name VARCHAR(255),                -- "Financial Statements (10-K)"
  description TEXT,
  mime_type VARCHAR(100),                   -- "application/pdf", "application/vnd.ms-excel"

  -- Storage Location
  storage_provider VARCHAR(50) NOT NULL,    -- 'local', 'google_drive', 'dropbox', 'onedrive', 'box'
  storage_id VARCHAR(500),                  -- File ID in cloud service
  cloud_path VARCHAR(1000),                 -- /Data Room/Financial/10-K.pdf
  file_size BIGINT,                         -- bytes

  -- Classification
  category VARCHAR(100),                    -- 'financial', 'legal', 'governance', 'operational', 'hr', 'other'
  subcategory VARCHAR(100),
  document_type VARCHAR(100),               -- 'prospectus', 'audited_financials', 'cap_table', etc.

  -- Status & Lifecycle
  status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- 'draft', 'in_review', 'approved', 'archived'
  completeness INTEGER DEFAULT 0,           -- 0-100%
  compliance_status VARCHAR(50) DEFAULT 'compliant',  -- 'compliant', 'warnings', 'issues'
  required_for_filing BOOLEAN DEFAULT FALSE,

  -- Versioning
  current_version INTEGER DEFAULT 1,
  total_versions INTEGER DEFAULT 1,
  previous_version_ids UUID[],              -- Links to previous versions

  -- Metadata
  uploaded_by UUID,                         -- User who uploaded
  uploaded_at TIMESTAMP WITH TIME ZONE,
  last_modified_by UUID,
  last_modified_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Access Control
  owner_user_id UUID NOT NULL,

  -- Relationships
  parent_folder_id VARCHAR(500),            -- For data room folder hierarchy
  related_documents UUID[],                 -- Links to related documents

  -- Comments
  comment_count INTEGER DEFAULT 0,
  last_comment JSONB,                       -- { author, date, text }

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_status CHECK (status IN ('draft', 'in_review', 'approved', 'archived')),
  CONSTRAINT ck_completeness CHECK (completeness >= 0 AND completeness <= 100)
);

CREATE INDEX idx_unified_documents_company_id ON unified_documents(company_id);
CREATE INDEX idx_unified_documents_category ON unified_documents(category);
CREATE INDEX idx_unified_documents_status ON unified_documents(status);
CREATE INDEX idx_unified_documents_storage_provider ON unified_documents(storage_provider);
CREATE INDEX idx_unified_documents_storage_id ON unified_documents(storage_id);
CREATE INDEX idx_unified_documents_parent_folder ON unified_documents(parent_folder_id);
CREATE INDEX idx_unified_documents_required_filing ON unified_documents(required_for_filing);
CREATE INDEX idx_unified_documents_created_at ON unified_documents(created_at);


-- ============================================================================
-- TABLE: cloud_storage_providers
-- Purpose: Store enabled cloud providers + settings per company
-- ============================================================================
CREATE TABLE cloud_storage_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,

  -- Enabled providers list
  enabled_providers VARCHAR(50)[],          -- ['google_drive', 'dropbox']

  -- Provider-specific settings (JSON for flexibility)
  provider_settings JSONB,                  -- {
                                            --   "google_drive": {
                                            --     "rootFolderId": "...",
                                            --     "syncFrequency": "hourly",
                                            --     "enabled": true
                                            --   }
                                            -- }

  -- Sync tracking
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50),             -- 'success', 'failed', 'partial'
  last_sync_error TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_cloud_providers_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_cloud_providers_company_id ON cloud_storage_providers(company_id);


-- ============================================================================
-- TABLE: document_versions
-- Purpose: Version history for documents
-- ============================================================================
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,

  version_number INTEGER NOT NULL,
  storage_id VARCHAR(500),                  -- File ID in cloud for this version
  file_size BIGINT,

  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  change_notes TEXT,                        -- What changed in this version
  is_latest BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_document_versions_document FOREIGN KEY (document_id)
    REFERENCES unified_documents(id) ON DELETE CASCADE,
  CONSTRAINT unique_doc_version UNIQUE (document_id, version_number)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_version_number ON document_versions(version_number);
CREATE INDEX idx_document_versions_is_latest ON document_versions(is_latest);


-- ============================================================================
-- TABLE: document_comments
-- Purpose: Collaborative document review comments
-- ============================================================================
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,

  author_user_id UUID NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_comments_document FOREIGN KEY (document_id)
    REFERENCES unified_documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_document_comments_author_id ON document_comments(author_user_id);
CREATE INDEX idx_document_comments_created_at ON document_comments(created_at);


-- ============================================================================
-- TABLE: data_room_folders
-- Purpose: Folder structure for organizing documents in data room
-- ============================================================================
CREATE TABLE data_room_folders (
  id VARCHAR(500) PRIMARY KEY,              -- Cloud provider folder ID (or UUID for local)
  company_id UUID NOT NULL,

  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,

  storage_provider VARCHAR(50),             -- 'google_drive', 'dropbox', etc.
  parent_folder_id VARCHAR(500),            -- Null if root

  -- Folder type for UI organization
  folder_type VARCHAR(50),                  -- 'financial', 'legal', 'governance', 'general'
  is_required BOOLEAN DEFAULT FALSE,        -- Must include in data room

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_folders_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_data_room_folders_company_id ON data_room_folders(company_id);
CREATE INDEX idx_data_room_folders_parent_id ON data_room_folders(parent_folder_id);
CREATE INDEX idx_data_room_folders_type ON data_room_folders(folder_type);


-- ============================================================================
-- TABLE: document_access_log
-- Purpose: Track who accessed what documents (for audit trail)
-- ============================================================================
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,

  user_id UUID NOT NULL,
  action VARCHAR(50),                       -- 'view', 'download', 'comment', 'approve', 'move'
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  details JSONB,                            -- Additional context (e.g., IP address, device)

  CONSTRAINT fk_access_log_document FOREIGN KEY (document_id)
    REFERENCES unified_documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX idx_document_access_log_user_id ON document_access_log(user_id);
CREATE INDEX idx_document_access_log_accessed_at ON document_access_log(accessed_at);


-- ============================================================================
-- Initial Data: Common data room folder structure
-- ============================================================================

-- Note: These are local folders (not synced from cloud yet)
-- When cloud providers enabled, new folders created in cloud + synced back

INSERT INTO data_room_folders (id, company_id, name, display_name, folder_type, is_required, storage_provider)
SELECT
  gen_random_uuid()::varchar,
  companies.id,
  'Financial Statements',
  'Financial Statements (Audited & Unaudited)',
  'financial',
  true,
  'local'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM data_room_folders d
  WHERE d.company_id = companies.id AND d.name = 'Financial Statements'
)
ON CONFLICT DO NOTHING;

INSERT INTO data_room_folders (id, company_id, name, display_name, folder_type, is_required, storage_provider)
SELECT
  gen_random_uuid()::varchar,
  companies.id,
  'Legal Documents',
  'Legal & Compliance (Contracts, IP, Governance)',
  'legal',
  true,
  'local'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM data_room_folders d
  WHERE d.company_id = companies.id AND d.name = 'Legal Documents'
)
ON CONFLICT DO NOTHING;

INSERT INTO data_room_folders (id, company_id, name, display_name, folder_type, is_required, storage_provider)
SELECT
  gen_random_uuid()::varchar,
  companies.id,
  'Board & Governance',
  'Board Resolutions & Governance Library',
  'governance',
  true,
  'local'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM data_room_folders d
  WHERE d.company_id = companies.id AND d.name = 'Board & Governance'
)
ON CONFLICT DO NOTHING;

INSERT INTO data_room_folders (id, company_id, name, display_name, folder_type, is_required, storage_provider)
SELECT
  gen_random_uuid()::varchar,
  companies.id,
  'Team & Leadership',
  'Leadership Bios, Org Chart, Experience',
  'governance',
  true,
  'local'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM data_room_folders d
  WHERE d.company_id = companies.id AND d.name = 'Team & Leadership'
)
ON CONFLICT DO NOTHING;
