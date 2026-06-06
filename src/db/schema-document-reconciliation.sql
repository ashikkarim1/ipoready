-- ============================================================================
-- Document Reconciliation Schema
-- Purpose: Track all reconciliation operations + ensure zero duplication
-- ============================================================================

-- ============================================================================
-- TABLE: document_reconciliation_log
-- Purpose: Audit trail of every reconciliation run
-- ============================================================================
CREATE TABLE document_reconciliation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Reconciliation metadata
  status VARCHAR(50) NOT NULL,                -- 'perfect', 'issues-found', 'failed'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_ms INTEGER,                        -- How long reconciliation took

  -- Counts before/after
  total_documents_unified BIGINT,
  total_documents_legacy BIGINT,

  -- Issues found and resolved
  duplicates_found INTEGER,
  duplicates_resolved INTEGER,
  inconsistencies_found INTEGER,
  inconsistencies_resolved INTEGER,
  orphaned_documents_migrated INTEGER,

  -- Issues detail
  issues_json JSONB,                          -- Full details of all issues

  -- Reconciliation type
  reconciliation_type VARCHAR(50),            -- 'full', 'incremental', 'verify'
  triggered_by VARCHAR(255),                  -- 'scheduled', 'manual', 'system'
  triggered_by_user_id UUID,

  -- Reconciled at timestamp
  reconciled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_status CHECK (status IN ('perfect', 'issues-found', 'failed'))
);

CREATE INDEX idx_reconciliation_log_company_id ON document_reconciliation_log(company_id);
CREATE INDEX idx_reconciliation_log_status ON document_reconciliation_log(status);
CREATE INDEX idx_reconciliation_log_started_at ON document_reconciliation_log(started_at);


-- ============================================================================
-- TABLE: document_duplication_alert
-- Purpose: Alert when duplicates detected + track resolution
-- ============================================================================
CREATE TABLE document_duplication_alert (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Duplicate details
  storage_id VARCHAR(500),                    -- Cloud file ID (if cloud-based)
  document_name VARCHAR(255) NOT NULL,
  duplicate_count INTEGER NOT NULL,

  -- Locations where duplicate found
  locations_json JSONB,                       -- Array of { id, uploaded_at, source }

  -- Alert status
  status VARCHAR(50) NOT NULL DEFAULT 'detected',  -- 'detected', 'investigating', 'resolved'
  severity VARCHAR(50),                       -- 'critical', 'warning'

  -- Resolution
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_method VARCHAR(100),             -- 'auto-delete-old', 'user-manual', 'merge'
  resolution_notes TEXT,
  resolved_by_user_id UUID,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_alert_status CHECK (status IN ('detected', 'investigating', 'resolved', 'false-positive'))
);

CREATE INDEX idx_duplication_alert_company_id ON document_duplication_alert(company_id);
CREATE INDEX idx_duplication_alert_status ON document_duplication_alert(status);
CREATE INDEX idx_duplication_alert_created_at ON document_duplication_alert(created_at);


-- ============================================================================
-- TABLE: document_consistency_check
-- Purpose: Track consistency validation across pages/references
-- ============================================================================
CREATE TABLE document_consistency_check (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Check scope
  check_type VARCHAR(100),                    -- 'page-reference', 'cloud-sync', 'version-history'
  scope_details JSONB,                        -- { pages: ['documents', 'data-room'], ... }

  -- Consistency results
  total_checks INTEGER,
  checks_passed INTEGER,
  checks_failed INTEGER,
  consistency_percentage DECIMAL(5,2),        -- 0-100%

  -- Failed checks detail
  failures_json JSONB,                        -- Details of what failed

  -- Status
  status VARCHAR(50),                         -- 'pass', 'fail', 'warning'

  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_status CHECK (status IN ('pass', 'fail', 'warning', 'pending'))
);

CREATE INDEX idx_consistency_check_company_id ON document_consistency_check(company_id);
CREATE INDEX idx_consistency_check_status ON document_consistency_check(status);
CREATE INDEX idx_consistency_check_checked_at ON document_consistency_check(checked_at);


-- ============================================================================
-- TABLE: document_validation_rule
-- Purpose: Define validation rules for documents (no duplicates, completeness, etc.)
-- ============================================================================
CREATE TABLE document_validation_rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(100),                     -- 'no-duplicates', 'required-documents', 'version-control', 'cloud-sync'

  -- Rule configuration
  rule_config JSONB NOT NULL,                 -- { allowDuplicates: false, maxAge: 24, ... }

  -- Enforcement
  is_active BOOLEAN DEFAULT TRUE,
  enforcement_level VARCHAR(50),              -- 'strict', 'warning', 'informational'

  -- What it validates
  applies_to_companies JSONB,                 -- null = all, or list of company IDs
  applies_to_categories JSONB,                -- null = all, or list of categories

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validation_rule_is_active ON document_validation_rule(is_active);
CREATE INDEX idx_validation_rule_type ON document_validation_rule(rule_type);


-- ============================================================================
-- TABLE: document_single_source_validation
-- Purpose: Verify that documents pull from ONE source everywhere
-- ============================================================================
CREATE TABLE document_single_source_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  document_id UUID NOT NULL,
  document_name VARCHAR(255),

  -- Where this document is referenced
  references_json JSONB,                      -- [
                                              --   { page: 'documents', table: 'unified_documents', count: 1 },
                                              --   { page: 'data-room', table: 'unified_documents', count: 1 },
                                              --   { legacy: 'prospectus_documents', count: 0 }
                                              -- ]

  -- Validation result
  is_single_source BOOLEAN,                   -- All references point to unified_documents only
  reference_count INTEGER,
  consolidated_to_unified BOOLEAN DEFAULT FALSE,

  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ssv_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_ssv_company_id ON document_single_source_validation(company_id);
CREATE INDEX idx_ssv_is_single_source ON document_single_source_validation(is_single_source);
CREATE INDEX idx_ssv_document_id ON document_single_source_validation(document_id);


-- ============================================================================
-- TABLE: document_migration_batch
-- Purpose: Track batch migrations from legacy to unified
-- ============================================================================
CREATE TABLE document_migration_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Batch metadata
  batch_name VARCHAR(255),
  source_table VARCHAR(100),                  -- 'prospectus_documents', 'filing_documents', etc.
  migration_status VARCHAR(50),               -- 'pending', 'in-progress', 'completed', 'failed'

  -- Migration counts
  total_documents INTEGER,
  successfully_migrated INTEGER,
  failed_migrations INTEGER,
  skipped_documents INTEGER,

  -- Details
  failed_document_ids UUID[],
  migration_errors_json JSONB,

  -- Timeline
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,

  initiated_by_user_id UUID,
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_migration_status CHECK (migration_status IN ('pending', 'in-progress', 'completed', 'failed', 'partial'))
);

CREATE INDEX idx_migration_batch_company_id ON document_migration_batch(company_id);
CREATE INDEX idx_migration_batch_status ON document_migration_batch(migration_status);
CREATE INDEX idx_migration_batch_created_at ON document_migration_batch(created_at);


-- ============================================================================
-- RULES: No-Duplication Validation Rules (Auto-Created)
-- ============================================================================

INSERT INTO document_validation_rule (
  rule_name,
  description,
  rule_type,
  rule_config,
  is_active,
  enforcement_level
) VALUES (
  'No Document Duplication',
  'Prevent any document from existing in multiple places or multiple times',
  'no-duplicates',
  '{"allowDuplicates": false, "checkCrossLegacyTables": true, "autoResolveOldVersions": true}'::JSONB,
  true,
  'strict'
) ON CONFLICT DO NOTHING;

INSERT INTO document_validation_rule (
  rule_name,
  description,
  rule_type,
  rule_config,
  is_active,
  enforcement_level
) VALUES (
  'Single Source of Truth - Unified Documents',
  'All documents must reference unified_documents table only, never legacy tables',
  'single-source',
  '{"allowLegacyReferences": false, "allowMultipleSources": false}'::JSONB,
  true,
  'strict'
) ON CONFLICT DO NOTHING;

INSERT INTO document_validation_rule (
  rule_name,
  description,
  rule_type,
  rule_config,
  is_active,
  enforcement_level
) VALUES (
  'Cloud Sync Freshness',
  'Cloud documents must be synced within 24 hours',
  'cloud-sync',
  '{"maxSyncAgeHours": 24, "warnAtHours": 12}'::JSONB,
  true,
  'warning'
) ON CONFLICT DO NOTHING;

INSERT INTO document_validation_rule (
  rule_name,
  description,
  rule_type,
  rule_config,
  is_active,
  enforcement_level
) VALUES (
  'Perfect Page Consistency',
  'All pages (/documents, /data-room, etc.) must display identical document data',
  'page-reference',
  '{"allowDataDivergence": false, "checkAllPages": true}'::JSONB,
  true,
  'strict'
) ON CONFLICT DO NOTHING;
