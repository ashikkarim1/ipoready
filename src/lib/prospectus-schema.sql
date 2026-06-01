/**
 * PROSPECTUS AUTO-BUILDER SYSTEM Schema
 * Run this migration to add prospectus generation, tracking, and export capabilities
 */

-- ============================================================
-- PROSPECTUS: Main Prospectus Records
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL,           -- NASDAQ, NYSE, TSX, TSXV, CSE, OTC, JSE
  form_type VARCHAR(50),                   -- S-1, Form 2A, CSE 2A, etc.
  status VARCHAR(50) DEFAULT 'draft',      -- draft, in_progress, review, ready_for_export, finalized, exported
  completion_pct INT DEFAULT 0,            -- 0-100% overall completion
  sections_total INT,                      -- Total sections required for exchange
  sections_complete INT DEFAULT 0,         -- Sections marked as complete
  sections_approved INT DEFAULT 0,         -- Sections approved by professionals
  estimated_completion_date DATE,
  target_ipo_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  finalized_at TIMESTAMP,
  exported_at TIMESTAMP,
  metadata JSONB,                          -- { template_version, ipo_timeline, offering_size, etc. }
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_prospectuses_company ON prospectuses(company_id);
CREATE INDEX IF NOT EXISTS idx_prospectuses_status ON prospectuses(status);
CREATE INDEX IF NOT EXISTS idx_prospectuses_exchange ON prospectuses(exchange);

-- ============================================================
-- PROSPECTUS: Sections
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL REFERENCES prospectuses(id) ON DELETE CASCADE,
  section_number VARCHAR(20),              -- 1.1, 1.2, 2.1, etc.
  section_name VARCHAR(255) NOT NULL,     -- "Risk Factors", "Capitalization", "Executive Compensation", etc.
  section_description TEXT,
  section_order INT,                       -- Display order (1-50+)
  section_category VARCHAR(100),           -- "Company Overview", "Financial", "Risk", "Legal", etc.
  required_by_exchange BOOLEAN DEFAULT TRUE,
  typical_word_count INT,                  -- Expected word count (for completion scoring)
  assigned_to_copilot VARCHAR(100),        -- "prospectus_co_pilot_1", "prospectus_co_pilot_2", etc.
  completion_pct INT DEFAULT 0,            -- 0-100%
  word_count INT DEFAULT 0,                -- Current word count
  data_density_score FLOAT,                -- 0-100: how much actual data/content vs. filler
  compliance_score FLOAT,                  -- 0-100: compliance with SEC/exchange rules
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, draft, admin_review, professional_review, approved, final
  priority VARCHAR(20) DEFAULT 'medium',   -- low, medium, high, critical
  due_date DATE,
  ai_generation_attempted BOOLEAN DEFAULT FALSE,
  ai_generation_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospectus_sections_prospectus ON prospectus_sections(prospectus_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_sections_status ON prospectus_sections(status);
CREATE INDEX IF NOT EXISTS idx_prospectus_sections_order ON prospectus_sections(section_order);

-- ============================================================
-- PROSPECTUS: Section Content (Versioned)
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES prospectus_sections(id) ON DELETE CASCADE,
  content_version INT DEFAULT 1,           -- Version number for tracking revisions
  draft_content TEXT,                      -- AI-generated or human-written draft
  final_content TEXT,                      -- Final approved content (after all reviews)
  word_count INT,
  data_density_score FLOAT DEFAULT 0,      -- 0-100
  compliance_score FLOAT DEFAULT 0,        -- 0-100
  compliance_violations JSONB,             -- Array of compliance issues found
  source_documents JSONB,                  -- Array of {document_id, extraction_confidence}
  requires_professional_review BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  approved_by_admin_at TIMESTAMP,
  approved_by_admin_id UUID REFERENCES users(id),
  approved_by_professional_at TIMESTAMP,
  professional_approver_id UUID REFERENCES users(id),
  professional_approver_role VARCHAR(50), -- 'securities_lawyer', 'auditor', 'cfo'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospectus_section_content_section ON prospectus_section_content(section_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_section_content_version ON prospectus_section_content(section_id, content_version DESC);

-- ============================================================
-- PROSPECTUS: Review & Approval Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES prospectus_sections(id) ON DELETE CASCADE,
  review_round INT DEFAULT 1,              -- Track multiple review cycles
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewer_role VARCHAR(50) NOT NULL,     -- 'ai_agent', 'human_admin', 'securities_lawyer', 'auditor', 'cfo'
  review_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50),                      -- 'approved', 'rejected', 'requested_changes', 'in_progress'
  comments TEXT,
  change_requests JSONB,                   -- Array of structured change requests
  sections_affected JSONB,                 -- Array of {subsection, issue, suggested_fix}
  rewrite_requested BOOLEAN DEFAULT FALSE,
  rewrite_priority VARCHAR(20),            -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospectus_reviews_section ON prospectus_reviews(section_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_reviews_status ON prospectus_reviews(status);
CREATE INDEX IF NOT EXISTS idx_prospectus_reviews_reviewer ON prospectus_reviews(reviewer_id);

-- ============================================================
-- PROSPECTUS: Source Document Mapping
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_source_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES prospectus_sections(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_type VARCHAR(100),              -- ARTICLES_OF_INCORPORATION, CAP_TABLE, etc.
  data_extracted JSONB,                    -- { field_name: extracted_value, ... }
  extraction_method VARCHAR(50),           -- 'template_match', 'ocr', 'llm_extraction', 'manual'
  extraction_confidence_pct FLOAT,         -- 0-100: how confident we are in the extraction
  citation_needed BOOLEAN DEFAULT FALSE,
  citation_format VARCHAR(50),             -- 'footnote', 'inline', 'appendix'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospectus_source_mapping_section ON prospectus_source_mapping(section_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_source_mapping_document ON prospectus_source_mapping(source_document_id);

-- ============================================================
-- PROSPECTUS: Export History
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL REFERENCES prospectuses(id) ON DELETE CASCADE,
  export_format VARCHAR(20) NOT NULL,     -- 'docx', 'pdf'
  file_name VARCHAR(255),
  file_path TEXT,                          -- S3 path or local filesystem path
  file_size_bytes INT,
  page_count INT,
  word_count INT,
  version_number INT,
  exported_by UUID NOT NULL REFERENCES users(id),
  exported_at TIMESTAMP DEFAULT NOW(),
  download_link TEXT,                      -- Presigned S3 URL
  expires_at TIMESTAMP,                    -- When download link expires
  metadata JSONB                           -- { s3_bucket, etag, hash, etc. }
);

CREATE INDEX IF NOT EXISTS idx_prospectus_export_prospectus ON prospectus_export_history(prospectus_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_export_format ON prospectus_export_history(export_format);
CREATE INDEX IF NOT EXISTS idx_prospectus_export_date ON prospectus_export_history(exported_at DESC);

-- ============================================================
-- PROSPECTUS: Compliance Rules Reference
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_compliance_rules (
  id SERIAL PRIMARY KEY,
  exchange VARCHAR(50) NOT NULL,           -- NASDAQ, NYSE, TSX, etc.
  form_type VARCHAR(50),                   -- S-1, Form 2A, etc.
  section_name VARCHAR(255),               -- Which section this rule applies to
  rule_code VARCHAR(100),                  -- e.g., "SEC-SK-101-A", "TSX-2.1"
  rule_description TEXT,
  min_word_count INT,                      -- Minimum words required in section
  required_subsections JSONB,              -- Array of required subsections
  must_include JSONB,                      -- Array of keywords/topics that must be mentioned
  must_not_include JSONB,                  -- Array of prohibited phrases
  compliance_category VARCHAR(100),        -- 'disclosure', 'financial', 'risk', 'governance'
  severity VARCHAR(20),                    -- 'error', 'warning'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_exchange ON prospectus_compliance_rules(exchange);

-- ============================================================
-- PROSPECTUS: AI Agent Work Queue
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_agent_work_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL REFERENCES prospectuses(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES prospectus_sections(id) ON DELETE CASCADE,
  task_type VARCHAR(50),                   -- 'generate_draft', 'refine_section', 'validate_compliance'
  priority INT DEFAULT 5,                  -- 1-10, higher = more urgent
  status VARCHAR(50) DEFAULT 'pending',    -- pending, in_progress, completed, failed
  assigned_to_agent VARCHAR(100),          -- Agent name/identifier
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,                      -- If task failed
  result_metadata JSONB,                   -- Output from the task
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_queue_status ON prospectus_agent_work_queue(status);
CREATE INDEX IF NOT EXISTS idx_agent_queue_priority ON prospectus_agent_work_queue(priority DESC);

-- ============================================================
-- PROSPECTUS: Audit Log
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL REFERENCES prospectuses(id) ON DELETE CASCADE,
  action VARCHAR(100),                     -- 'created', 'section_drafted', 'approved', 'exported', etc.
  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(50),                  -- 'admin', 'co_pilot', 'securities_lawyer', 'auditor'
  section_id UUID REFERENCES prospectus_sections(id),
  details JSONB,                           -- Additional context for the action
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_prospectus ON prospectus_audit_log(prospectus_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON prospectus_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON prospectus_audit_log(action);

-- ============================================================
-- Create Views
-- ============================================================

CREATE OR REPLACE VIEW v_prospectus_progress AS
SELECT
  p.id,
  p.company_id,
  p.exchange,
  p.status,
  p.completion_pct,
  COUNT(DISTINCT ps.id) as total_sections,
  SUM(CASE WHEN ps.status = 'final' OR ps.status = 'approved' THEN 1 ELSE 0 END) as sections_complete,
  SUM(CASE WHEN ps.status = 'professional_review' OR ps.status = 'approved' THEN 1 ELSE 0 END) as sections_in_approval,
  SUM(ps.completion_pct) / COUNT(ps.id) as avg_section_completion,
  p.created_at,
  p.updated_at
FROM prospectuses p
LEFT JOIN prospectus_sections ps ON p.id = ps.prospectus_id
GROUP BY p.id;

CREATE OR REPLACE VIEW v_prospectus_section_status AS
SELECT
  ps.id,
  ps.prospectus_id,
  ps.section_name,
  ps.status,
  ps.completion_pct,
  ps.word_count,
  ps.typical_word_count,
  ps.assigned_to_copilot,
  COALESCE(psc.content_version, 0) as latest_content_version,
  COUNT(DISTINCT pr.id) as review_count,
  ps.created_at,
  ps.updated_at
FROM prospectus_sections ps
LEFT JOIN prospectus_section_content psc ON ps.id = psc.section_id
LEFT JOIN prospectus_reviews pr ON ps.id = pr.section_id
GROUP BY ps.id, psc.id, ps.prospectus_id;
