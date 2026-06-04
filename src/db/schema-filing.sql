/**
 * Filing System Schema
 * Manages regulatory filings across multiple exchanges and jurisdictions
 * Supports extensible adapter pattern for integration with various filing systems
 * Created: 2026-06-04
 */

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

-- Filing system status
CREATE TYPE filing_system_status AS ENUM (
  'active',
  'inactive',
  'testing',
  'deprecated',
  'maintenance'
);

-- Filing status lifecycle
CREATE TYPE filing_status AS ENUM (
  'draft',
  'pending_validation',
  'validated',
  'submitted',
  'accepted',
  'rejected',
  'failed',
  'archived',
  'superseded'
);

-- Document validation status
CREATE TYPE document_validation_status AS ENUM (
  'pending',
  'validating',
  'valid',
  'invalid',
  'warning',
  'not_required'
);

-- Authentication method for filing systems
CREATE TYPE filing_auth_method AS ENUM (
  'api_key',
  'oauth2',
  'basic_auth',
  'certificate',
  'custom_token',
  'two_factor'
);

-- ============================================================================
-- TABLE: filing_systems
-- Purpose: Registry of supported filing systems per exchange/jurisdiction
-- Extensible design supports future additions without schema changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name VARCHAR(255) NOT NULL,                    -- e.g., 'TSX Filing System', 'SEC EDGAR'
  country VARCHAR(100) NOT NULL,                -- e.g., 'Canada', 'USA'
  exchange VARCHAR(50) NOT NULL,                -- e.g., 'tsx', 'tsxv', 'cse', 'nasdaq', 'nyse'
  listing_type VARCHAR(50),                     -- Optional: 'ipo', 'rto', 'direct_listing', etc.

  -- Adapter Configuration (extensible)
  adapter_class VARCHAR(255) NOT NULL,          -- Fully qualified class name: e.g., 'FilingAdapters\TSXAdapter'
  api_endpoint VARCHAR(2048),                   -- API base URL for the filing system
  api_version VARCHAR(50),                      -- API version (e.g., 'v1', 'v2')
  auth_method filing_auth_method NOT NULL,      -- Authentication type

  -- Configuration (flexible JSON for adapter-specific needs)
  config JSONB DEFAULT '{}',                    -- {
                                                -- "timeout_seconds": 30,
                                                -- "max_file_size_mb": 100,
                                                -- "supported_formats": ["pdf", "docx"],
                                                -- "requires_digital_signature": true,
                                                -- "custom_fields": {...}
                                                -- }

  -- Capabilities and Features
  supports_batch_upload BOOLEAN DEFAULT FALSE,
  supports_digital_signature BOOLEAN DEFAULT FALSE,
  supports_e_delivery BOOLEAN DEFAULT FALSE,
  requires_officer_certification BOOLEAN DEFAULT FALSE,

  -- Rate limiting and quotas
  rate_limit_per_hour INT,
  max_concurrent_submissions INT,

  -- Status and lifecycle
  status filing_system_status DEFAULT 'active',
  notes TEXT,

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT ck_filing_system_required_fields CHECK (
    name IS NOT NULL AND
    country IS NOT NULL AND
    exchange IS NOT NULL AND
    adapter_class IS NOT NULL
  ),
  UNIQUE (country, exchange, listing_type)
);

CREATE INDEX IF NOT EXISTS idx_filing_systems_exchange ON filing_systems(exchange);
CREATE INDEX IF NOT EXISTS idx_filing_systems_country ON filing_systems(country);
CREATE INDEX IF NOT EXISTS idx_filing_systems_status ON filing_systems(status);
CREATE INDEX IF NOT EXISTS idx_filing_systems_adapter ON filing_systems(adapter_class);


-- ============================================================================
-- TABLE: filings
-- Purpose: Master record for each regulatory filing submitted or in progress
-- Tracks submission lifecycle and maintains audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filing_system_id UUID NOT NULL REFERENCES filing_systems(id) ON DELETE RESTRICT,

  -- Filing Identification
  filing_type VARCHAR(100) NOT NULL,             -- e.g., 'prospectus', 'pif', 'financial_statements', 'preliminary_prospectus'
  filing_reference VARCHAR(255),                 -- External reference from filing system (e.g., SEC filing number)

  -- Status and Timeline
  status filing_status DEFAULT 'draft',
  submission_reference VARCHAR(255),             -- Unique submission ID from filing system
  submitted_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,

  -- File Management
  file_path VARCHAR(2048),                       -- S3 or storage path to consolidated filing document
  file_size_bytes BIGINT,
  file_hash VARCHAR(256),                        -- SHA-256 hash for integrity verification

  -- Error Handling
  error_message TEXT,                            -- Last error encountered
  error_code VARCHAR(100),                       -- Structured error code from filing system
  error_details JSONB DEFAULT '{}',              -- Extended error context

  -- Metadata (extensible)
  metadata JSONB DEFAULT '{}',                   -- {
                                                -- "submission_timestamp": "2026-06-04T10:30:00Z",
                                                -- "submitted_by": "user_id",
                                                -- "submitted_by_title": "CFO",
                                                -- "certification_status": "certified",
                                                -- "filing_fee_paid": true,
                                                -- "filing_fee_amount": 5000.00,
                                                -- "custom_fields": {...}
                                                -- }

  -- Workflow tracking
  submission_attempts INT DEFAULT 0,
  last_submission_attempt_at TIMESTAMP WITH TIME ZONE,
  is_amended BOOLEAN DEFAULT FALSE,
  supersedes_filing_id UUID REFERENCES filings(id) ON DELETE SET NULL,

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,                               -- User who created the filing
  updated_by UUID,                               -- User who last updated the filing

  -- Constraints
  CONSTRAINT ck_filing_dates_logical CHECK (
    submitted_at IS NULL OR accepted_at IS NULL OR accepted_at >= submitted_at
  ),
  CONSTRAINT ck_filing_required_fields CHECK (
    company_id IS NOT NULL AND
    filing_system_id IS NOT NULL AND
    filing_type IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_filings_company_id ON filings(company_id);
CREATE INDEX IF NOT EXISTS idx_filings_filing_system_id ON filings(filing_system_id);
CREATE INDEX IF NOT EXISTS idx_filings_status ON filings(status);
CREATE INDEX IF NOT EXISTS idx_filings_filing_type ON filings(filing_type);
CREATE INDEX IF NOT EXISTS idx_filings_submitted_at ON filings(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_filings_created_at ON filings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_filings_company_status ON filings(company_id, status);
CREATE INDEX IF NOT EXISTS idx_filings_submission_reference ON filings(submission_reference);
CREATE INDEX IF NOT EXISTS idx_filings_supersedes ON filings(supersedes_filing_id);


-- ============================================================================
-- TABLE: filing_documents
-- Purpose: Individual documents within a filing
-- Supports modular document management (prospectus + exhibits + appendices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  filing_id UUID NOT NULL REFERENCES filings(id) ON DELETE CASCADE,

  -- Document Identification
  document_type VARCHAR(100) NOT NULL,           -- e.g., 'prospectus', 'exhibit_a', 'financial_statements', 'appendix_legal_opinions'
  document_name VARCHAR(500) NOT NULL,
  document_order INT,                            -- Sequence number for multi-document filings

  -- File Management
  file_path VARCHAR(2048) NOT NULL,              -- S3 or storage path
  file_size_bytes BIGINT,
  file_hash VARCHAR(256),                        -- SHA-256 hash
  file_format VARCHAR(20),                       -- 'pdf', 'docx', 'xlsx', 'txt', etc.

  -- Validation
  validation_status document_validation_status DEFAULT 'pending',
  validation_errors JSONB DEFAULT '{}',          -- Array of validation error objects
  validation_warnings JSONB DEFAULT '{}',        -- Array of warnings that don't block submission
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Requirements
  is_required BOOLEAN DEFAULT TRUE,              -- Whether this document is mandatory for filing
  is_exhibit BOOLEAN DEFAULT FALSE,              -- True for exhibits/appendices

  -- Compliance tracking
  scanned_for_viruses BOOLEAN DEFAULT FALSE,
  virus_scan_result VARCHAR(50),                 -- 'clean', 'infected', 'suspicious'
  ocr_performed BOOLEAN DEFAULT FALSE,           -- Optical Character Recognition
  ocr_confidence_pct INT,                        -- 0-100, if OCR was performed

  -- Metadata (extensible)
  metadata JSONB DEFAULT '{}',                   -- {
                                                -- "page_count": 150,
                                                -- "has_digital_signature": true,
                                                -- "digital_signature_valid": true,
                                                -- "subject_matter": "Risk Factors",
                                                -- "requires_auditor_consent": true,
                                                -- "custom_metadata": {...}
                                                -- }

  -- Audit trail
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID,

  CONSTRAINT ck_document_required_fields CHECK (
    filing_id IS NOT NULL AND
    document_type IS NOT NULL AND
    file_path IS NOT NULL
  ),
  CONSTRAINT ck_document_order_positive CHECK (document_order IS NULL OR document_order > 0)
);

CREATE INDEX IF NOT EXISTS idx_filing_documents_filing_id ON filing_documents(filing_id);
CREATE INDEX IF NOT EXISTS idx_filing_documents_type ON filing_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_filing_documents_validation_status ON filing_documents(validation_status);
CREATE INDEX IF NOT EXISTS idx_filing_documents_is_required ON filing_documents(is_required);
CREATE INDEX IF NOT EXISTS idx_filing_documents_uploaded_at ON filing_documents(uploaded_at DESC);


-- ============================================================================
-- TABLE: filing_status_logs
-- Purpose: Complete audit trail of all status transitions
-- Enables workflow tracking and compliance reporting
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  filing_id UUID NOT NULL REFERENCES filings(id) ON DELETE CASCADE,

  -- Status Transition
  old_status filing_status,                      -- NULL if this is the first status
  new_status filing_status NOT NULL,

  -- Context
  reason VARCHAR(500),                           -- Human-readable reason for transition
  trigger_type VARCHAR(50),                      -- 'user_action', 'system_event', 'api_callback', 'scheduled_task'
  triggered_by UUID,                             -- User or system actor

  -- External System Response
  external_response JSONB DEFAULT '{}',          -- Response from filing system API if applicable

  -- Additional context (extensible)
  metadata JSONB DEFAULT '{}',                   -- {
                                                -- "api_call_duration_ms": 1234,
                                                -- "retry_attempt": 1,
                                                -- "batch_submission_id": "batch-123",
                                                -- "custom_context": {...}
                                                -- }

  -- Timestamp (single source of truth)
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT ck_status_log_required_fields CHECK (
    filing_id IS NOT NULL AND
    new_status IS NOT NULL
  ),
  CONSTRAINT ck_status_different CHECK (old_status IS NULL OR old_status != new_status)
);

CREATE INDEX IF NOT EXISTS idx_filing_status_logs_filing_id ON filing_status_logs(filing_id);
CREATE INDEX IF NOT EXISTS idx_filing_status_logs_status ON filing_status_logs(new_status);
CREATE INDEX IF NOT EXISTS idx_filing_status_logs_changed_at ON filing_status_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_filing_status_logs_trigger_type ON filing_status_logs(trigger_type);
-- Composite index for quick filing status history retrieval
CREATE INDEX IF NOT EXISTS idx_filing_status_logs_filing_changed ON filing_status_logs(filing_id, changed_at DESC);


-- ============================================================================
-- TABLE: filing_validation_rules
-- Purpose: Define validation rules per filing system and document type
-- Allows dynamic rule updates without code changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  filing_system_id UUID NOT NULL REFERENCES filing_systems(id) ON DELETE CASCADE,

  -- Rule Identification
  rule_name VARCHAR(255) NOT NULL,
  rule_category VARCHAR(100),                    -- 'file_format', 'content', 'signature', 'metadata', 'custom'
  document_types TEXT[] DEFAULT '{}'::TEXT[],    -- Document types this rule applies to (empty = all)

  -- Rule Definition (JSON Schema or custom format)
  rule_definition JSONB NOT NULL,                -- {
                                                -- "type": "file_format_check",
                                                -- "allowed_formats": ["pdf", "docx"],
                                                -- "max_file_size_mb": 100,
                                                -- "min_pages": 1,
                                                -- "max_pages": 200
                                                -- }

  -- Enforcement
  is_critical BOOLEAN DEFAULT FALSE,             -- True = blocks submission, False = warning
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT ck_validation_rule_required CHECK (
    filing_system_id IS NOT NULL AND
    rule_name IS NOT NULL AND
    rule_definition IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_filing_validation_rules_filing_system ON filing_validation_rules(filing_system_id);
CREATE INDEX IF NOT EXISTS idx_filing_validation_rules_active ON filing_validation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_filing_validation_rules_critical ON filing_validation_rules(is_critical);


-- ============================================================================
-- TABLE: filing_api_webhooks
-- Purpose: Store webhook registrations for real-time filing system callbacks
-- Enables asynchronous status updates from external filing systems
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_api_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  filing_system_id UUID NOT NULL REFERENCES filing_systems(id) ON DELETE CASCADE,

  -- Webhook Configuration
  endpoint_url VARCHAR(2048) NOT NULL,
  event_types TEXT[] NOT NULL,                   -- e.g., {'filing_accepted', 'filing_rejected', 'document_scanned'}

  -- Security
  api_key VARCHAR(500),                          -- Secret key for HMAC verification
  is_active BOOLEAN DEFAULT TRUE,

  -- Tracking
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INT DEFAULT 0,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  last_error_message TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT ck_webhook_required CHECK (
    filing_system_id IS NOT NULL AND
    endpoint_url IS NOT NULL AND
    array_length(event_types, 1) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_filing_api_webhooks_filing_system ON filing_api_webhooks(filing_system_id);
CREATE INDEX IF NOT EXISTS idx_filing_api_webhooks_active ON filing_api_webhooks(is_active);


-- ============================================================================
-- TABLE: filing_submissions_batch
-- Purpose: Group related filings for batch processing
-- Enables efficient bulk submissions and tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_submissions_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Batch Identification
  batch_name VARCHAR(255) NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filing_system_id UUID NOT NULL REFERENCES filing_systems(id) ON DELETE RESTRICT,

  -- Batch Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partially_failed', 'failed')),

  -- Statistics
  total_filings INT DEFAULT 0,
  successful_filings INT DEFAULT 0,
  failed_filings INT DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Tracking
  submission_reference VARCHAR(255),             -- Batch ID from filing system
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT ck_batch_required CHECK (
    company_id IS NOT NULL AND
    filing_system_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_filing_batch_company_id ON filing_submissions_batch(company_id);
CREATE INDEX IF NOT EXISTS idx_filing_batch_filing_system ON filing_submissions_batch(filing_system_id);
CREATE INDEX IF NOT EXISTS idx_filing_batch_status ON filing_submissions_batch(status);
CREATE INDEX IF NOT EXISTS idx_filing_batch_created_at ON filing_submissions_batch(created_at DESC);


-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: filing_status_dashboard
-- Quick overview of all filings by company and status
CREATE OR REPLACE VIEW filing_status_dashboard AS
SELECT
  f.company_id,
  f.filing_type,
  f.status,
  COUNT(*) AS filing_count,
  COUNT(CASE WHEN f.rejected_at IS NOT NULL THEN 1 END) AS rejected_count,
  COUNT(CASE WHEN f.submitted_at IS NOT NULL AND f.accepted_at IS NULL AND f.rejected_at IS NULL THEN 1 END) AS pending_acceptance,
  MAX(f.submitted_at) AS last_submission,
  MAX(f.updated_at) AS last_updated
FROM filings f
WHERE f.status != 'archived'
GROUP BY f.company_id, f.filing_type, f.status
ORDER BY f.company_id, f.filing_type, f.status;

-- View: filing_system_health
-- Monitor filing system performance and reliability
CREATE OR REPLACE VIEW filing_system_health AS
SELECT
  fs.id,
  fs.name,
  fs.exchange,
  COUNT(f.id) AS total_filings,
  COUNT(CASE WHEN f.status = 'submitted' THEN 1 END) AS active_submissions,
  COUNT(CASE WHEN f.status = 'rejected' THEN 1 END) AS rejected_filings,
  ROUND(100.0 * COUNT(CASE WHEN f.status = 'accepted' THEN 1 END) / NULLIF(COUNT(f.id), 0), 2) AS success_rate_pct,
  MAX(f.submitted_at) AS last_submission,
  COUNT(CASE WHEN f.error_message IS NOT NULL THEN 1 END) AS error_count,
  MAX(fsl.changed_at) AS last_activity
FROM filing_systems fs
LEFT JOIN filings f ON fs.id = f.filing_system_id
LEFT JOIN filing_status_logs fsl ON f.id = fsl.filing_id
GROUP BY fs.id, fs.name, fs.exchange
ORDER BY fs.name;

-- View: filing_document_validation_summary
-- Document validation status across all filings
CREATE OR REPLACE VIEW filing_document_validation_summary AS
SELECT
  f.company_id,
  f.filing_type,
  fd.document_type,
  fd.validation_status,
  COUNT(*) AS document_count,
  ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM filing_documents WHERE filing_id = f.id), 0), 2) AS percentage
FROM filings f
JOIN filing_documents fd ON f.id = fd.filing_id
WHERE f.status != 'archived'
GROUP BY f.company_id, f.filing_type, fd.document_type, fd.validation_status
ORDER BY f.company_id, f.filing_type, fd.document_type, fd.validation_status;

-- View: filing_submission_timeline
-- Historical timeline of filing submissions and outcomes
CREATE OR REPLACE VIEW filing_submission_timeline AS
SELECT
  f.id,
  f.company_id,
  fs.name AS filing_system_name,
  f.filing_type,
  f.status,
  f.submission_attempts,
  f.created_at,
  f.submitted_at,
  f.accepted_at,
  f.rejected_at,
  CASE
    WHEN f.accepted_at IS NOT NULL THEN (f.accepted_at - f.submitted_at)
    WHEN f.rejected_at IS NOT NULL THEN (f.rejected_at - f.submitted_at)
    WHEN f.submitted_at IS NOT NULL THEN (NOW() - f.submitted_at)
    ELSE NULL
  END AS days_to_resolution
FROM filings f
JOIN filing_systems fs ON f.filing_system_id = fs.id
ORDER BY f.company_id, f.created_at DESC;


-- ============================================================================
-- TRIGGERS FOR AUDIT AND AUTOMATION
-- ============================================================================

-- Trigger: Auto-create initial status log entry
CREATE OR REPLACE FUNCTION create_initial_filing_status_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO filing_status_logs (filing_id, old_status, new_status, reason, trigger_type, changed_at)
  VALUES (NEW.id, NULL, NEW.status, 'Filing created', 'system_event', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_filing_initial_status_log ON filings;
CREATE TRIGGER trg_filing_initial_status_log
  AFTER INSERT ON filings
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_filing_status_log();

-- Trigger: Log status transitions
CREATE OR REPLACE FUNCTION log_filing_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO filing_status_logs (filing_id, old_status, new_status, reason, trigger_type, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status changed', 'system_event', NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_filing_status_change ON filings;
CREATE TRIGGER trg_filing_status_change
  BEFORE UPDATE ON filings
  FOR EACH ROW
  EXECUTE FUNCTION log_filing_status_change();

-- Trigger: Update timestamps
CREATE OR REPLACE FUNCTION update_filing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_filing_updated_at ON filings;
CREATE TRIGGER trg_filing_updated_at
  BEFORE UPDATE ON filings
  FOR EACH ROW
  EXECUTE FUNCTION update_filing_updated_at();

DROP TRIGGER IF EXISTS trg_filing_document_updated_at ON filing_documents;
CREATE TRIGGER trg_filing_document_updated_at
  BEFORE UPDATE ON filing_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_filing_updated_at();

DROP TRIGGER IF EXISTS trg_filing_system_updated_at ON filing_systems;
CREATE TRIGGER trg_filing_system_updated_at
  BEFORE UPDATE ON filing_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_filing_updated_at();

DROP TRIGGER IF EXISTS trg_validation_rule_updated_at ON filing_validation_rules;
CREATE TRIGGER trg_validation_rule_updated_at
  BEFORE UPDATE ON filing_validation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_filing_updated_at();

DROP TRIGGER IF EXISTS trg_webhook_updated_at ON filing_api_webhooks;
CREATE TRIGGER trg_webhook_updated_at
  BEFORE UPDATE ON filing_api_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_filing_updated_at();

DROP TRIGGER IF EXISTS trg_batch_updated_at ON filing_submissions_batch;
CREATE TRIGGER trg_batch_updated_at
  BEFORE UPDATE ON filing_submissions_batch
  FOR EACH ROW
  EXECUTE FUNCTION update_filing_updated_at();

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE filing_systems IS 'Registry of supported regulatory filing systems. Designed with adapter pattern for extensibility - new exchanges can be added via adapter implementations without schema changes.';

COMMENT ON TABLE filings IS 'Master record for regulatory filings. Tracks complete lifecycle from draft through submission to acceptance/rejection. Supports amended filings and maintains audit trail.';

COMMENT ON TABLE filing_documents IS 'Individual documents within a filing (prospectus, exhibits, appendices). Enables modular document management with separate validation and compliance tracking.';

COMMENT ON TABLE filing_status_logs IS 'Complete audit trail of all status transitions. Ensures regulatory compliance and provides investigation capability for any filing action.';

COMMENT ON TABLE filing_validation_rules IS 'Dynamic validation rules per filing system. Allows rule updates without code deployment - critical for regulatory change management.';

COMMENT ON TABLE filing_api_webhooks IS 'Webhook registrations for real-time callbacks from filing systems. Enables asynchronous status updates and reduces polling overhead.';

COMMENT ON TABLE filing_submissions_batch IS 'Group related filings for batch processing and tracking. Useful for consolidated submissions across multiple subsidiaries or jurisdictions.';

COMMENT ON COLUMN filing_systems.adapter_class IS 'Fully qualified class name implementing FilingAdapterInterface. Example: "FilingAdapters\TSXAdapter"';

COMMENT ON COLUMN filing_systems.config IS 'Adapter-specific configuration in JSON format. Extensible for adapter-specific settings like API authentication details, custom endpoints, feature flags.';

COMMENT ON COLUMN filings.metadata IS 'Extensible metadata field for filing-specific information. Examples: certification status, filing fees, submission timestamps, custom exchange-specific data.';

COMMENT ON COLUMN filing_documents.metadata IS 'Document-specific metadata. Examples: page counts, OCR confidence, digital signature validity, auditor consent requirements.';

COMMENT ON COLUMN filing_status_logs.external_response IS 'Response data from filing system APIs. Stored for debugging and compliance audit purposes.';

-- ============================================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- ============================================================================
-- 1. Composite indexes on (company_id, status) enable fast filtering on dashboard queries
-- 2. filing_status_logs indexed by filing_id and changed_at DESC for efficient history retrieval
-- 3. JSONB metadata fields allow future extensibility without schema migrations
-- 4. Soft delete pattern (archived status) maintains historical data while hiding from active views
-- 5. Status logs provide audit trail without separate audit table - more performant for compliance
