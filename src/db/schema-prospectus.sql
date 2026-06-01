/**
 * Prospectus Auto-Builder Schema
 * Manages prospectus templates and generated documents
 * Run this migration to enable the prospectus generation system
 */

-- ============================================================
-- PROSPECTUS TEMPLATES TABLE
-- Stores template sections for different exchanges
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange VARCHAR(20) NOT NULL,           -- 'tsx', 'nasdaq', 'nyse', 'tsxv', 'cse', etc.
  section_name VARCHAR(255) NOT NULL,      -- 'business_overview', 'risk_factors', 'management', etc.
  section_order INT NOT NULL,              -- Display order within prospectus
  template_text TEXT NOT NULL,             -- Template with placeholders: {company_name}, {founder_name}, etc.
  placeholder_fields JSONB NOT NULL,       -- ["company_name", "founder_name", "business_model"]
  description TEXT,                        -- Purpose of this section
  required BOOLEAN DEFAULT TRUE,           -- Whether this section is mandatory
  word_count_estimate INT,                 -- Estimated word count when filled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exchange, section_name)
);

CREATE INDEX IF NOT EXISTS idx_prospectus_templates_exchange ON prospectus_templates(exchange);
CREATE INDEX IF NOT EXISTS idx_prospectus_templates_section ON prospectus_templates(section_name);

-- ============================================================
-- PROSPECTUS DOCUMENTS TABLE
-- Tracks generated prospectus documents per company
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exchange VARCHAR(20) NOT NULL,           -- Target exchange (e.g. 'tsx', 'nasdaq')
  document_format VARCHAR(10) NOT NULL,    -- 'docx' or 'pdf'
  status VARCHAR(50) DEFAULT 'draft',      -- 'draft', 'generated', 'approved', 'filed'
  document_url VARCHAR(500),               -- S3 or storage URL
  document_size_bytes INT,                 -- File size for download
  data_completeness_pct INT DEFAULT 0,     -- Percentage of fields populated (0-100)
  generated_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  filed_at TIMESTAMP WITH TIME ZONE,
  generation_error TEXT,                   -- Error message if generation failed
  metadata JSONB,                          -- Extra metadata: word_count, page_count, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospectus_documents_company ON prospectus_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_documents_exchange ON prospectus_documents(exchange);
CREATE INDEX IF NOT EXISTS idx_prospectus_documents_status ON prospectus_documents(status);
CREATE INDEX IF NOT EXISTS idx_prospectus_documents_created ON prospectus_documents(created_at DESC);

-- ============================================================
-- PROSPECTUS FIELD MAPPINGS TABLE
-- Maps PACE fields to prospectus placeholder fields
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placeholder_field VARCHAR(255) NOT NULL,     -- e.g. 'company_name', 'founder_name'
  pace_source_table VARCHAR(100) NOT NULL,     -- e.g. 'companies', 'team_members', 'milestones'
  pace_source_column VARCHAR(100) NOT NULL,    -- e.g. 'name', 'full_name', 'title'
  transform_function VARCHAR(100),             -- Optional JS function name to transform data
  is_required BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(placeholder_field)
);

CREATE INDEX IF NOT EXISTS idx_prospectus_field_mappings_placeholder ON prospectus_field_mappings(placeholder_field);
CREATE INDEX IF NOT EXISTS idx_prospectus_field_mappings_pace_source ON prospectus_field_mappings(pace_source_table, pace_source_column);

-- ============================================================
-- PROSPECTUS DATA VALIDATIONS TABLE
-- Tracks data completeness and missing required fields
-- ============================================================

CREATE TABLE IF NOT EXISTS prospectus_data_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exchange VARCHAR(20) NOT NULL,
  required_field VARCHAR(255) NOT NULL,   -- Name of required field
  field_status VARCHAR(50) NOT NULL,      -- 'present', 'missing', 'invalid'
  pace_field_found BOOLEAN DEFAULT FALSE,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, exchange, required_field)
);

CREATE INDEX IF NOT EXISTS idx_prospectus_validations_company ON prospectus_data_validations(company_id);
CREATE INDEX IF NOT EXISTS idx_prospectus_validations_status ON prospectus_data_validations(field_status);

-- ============================================================
-- Triggers for updated_at columns
-- ============================================================

DROP TRIGGER IF EXISTS update_prospectus_templates_updated_at ON prospectus_templates;
CREATE TRIGGER update_prospectus_templates_updated_at
  BEFORE UPDATE ON prospectus_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prospectus_documents_updated_at ON prospectus_documents;
CREATE TRIGGER update_prospectus_documents_updated_at
  BEFORE UPDATE ON prospectus_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
