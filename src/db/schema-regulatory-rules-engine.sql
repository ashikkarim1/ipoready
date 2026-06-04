-- ============================================================================
-- IPOReady: Exchange-Agnostic Regulatory Rules Engine Schema
-- Purpose: Support rules-driven, configuration-based regulatory compliance
-- across multiple exchanges (TSX, TSXV, SEC/EDGAR, LSE, TSE, HKEX, etc.)
-- ============================================================================

-- ============================================================================
-- TABLE: exchanges
-- Purpose: Registry of supported exchanges with regulatory metadata
-- ============================================================================
CREATE TABLE exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  code VARCHAR(10) NOT NULL UNIQUE,           -- 'tsx', 'tsxv', 'sec', 'lse', 'tse', 'hkex'
  name VARCHAR(255) NOT NULL,                 -- 'Toronto Stock Exchange'
  country VARCHAR(2) NOT NULL,                -- 'CA', 'US', 'GB', 'JP', 'HK'

  -- Regulatory & API
  regulator_name VARCHAR(255) NOT NULL,       -- 'OSC', 'SEC', 'FCA', 'FSA', 'SFC'
  regulator_url TEXT,                         -- https://www.sec.gov
  api_endpoint TEXT,                          -- https://www.sec.gov/cgi-bin/browse-edgar
  api_documentation_url TEXT,

  -- Configuration & Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  configuration JSONB NOT NULL DEFAULT '{}', -- Exchange-specific settings

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_country_code CHECK (country ~ '^[A-Z]{2}$')
);

CREATE INDEX idx_exchanges_code ON exchanges(code);
CREATE INDEX idx_exchanges_country ON exchanges(country);
CREATE INDEX idx_exchanges_is_active ON exchanges(is_active);


-- ============================================================================
-- TABLE: regulatory_requirements
-- Purpose: Define regulatory requirements per exchange
-- Examples: "Must disclose all executive compensation", "Minimum 3-year financials"
-- ============================================================================
CREATE TABLE regulatory_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Categorization
  category VARCHAR(100) NOT NULL,             -- 'financial_disclosure', 'risk_factors', 'governance', 'documents'
  subcategory VARCHAR(100),                   -- 'executive_compensation', 'material_risks'

  -- Requirement definition
  requirement_key VARCHAR(255) NOT NULL,      -- 'min_years_financial_statements', 'audit_committee_required'
  requirement_text TEXT NOT NULL,             -- Human-readable description

  -- Enforcement
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  min_items INTEGER,                          -- Minimum number of items required (e.g., 3 years of financials)
  max_items INTEGER,

  -- Guidance
  examples_url TEXT,                          -- Link to SEC rules, TSX guidelines, etc.
  guidance_text TEXT,                         -- Tips for compliance

  -- Configuration
  validation_rule_config JSONB,               -- Rules engine configuration

  -- Metadata
  regulatory_reference VARCHAR(255),          -- "SEC Rule 415", "TSX Policy 2.1"
  effective_date DATE,
  sunset_date DATE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_regulatory_requirements_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE,
  CONSTRAINT ck_min_max_items CHECK (min_items IS NULL OR max_items IS NULL OR min_items <= max_items),
  CONSTRAINT ck_effective_sunset CHECK (effective_date IS NULL OR sunset_date IS NULL OR effective_date <= sunset_date)
);

CREATE INDEX idx_regulatory_requirements_exchange_id ON regulatory_requirements(exchange_id);
CREATE INDEX idx_regulatory_requirements_category ON regulatory_requirements(category);
CREATE INDEX idx_regulatory_requirements_key ON regulatory_requirements(requirement_key);
CREATE INDEX idx_regulatory_requirements_is_mandatory ON regulatory_requirements(is_mandatory);


-- ============================================================================
-- TABLE: validation_rules
-- Purpose: Dynamic validation rules for document/content checks
-- Examples: "Max file size 10MB", "Must be PDF format", "Min 50 words per section"
-- ============================================================================
CREATE TABLE validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Rule identification
  rule_name VARCHAR(255) NOT NULL,
  rule_category VARCHAR(50) NOT NULL,        -- 'file_format', 'content', 'metadata', 'signature', 'structure'

  -- Scope
  applies_to_field VARCHAR(255),              -- JSON path, e.g., 'documents.prospectus.file_size'
  applies_to_document_types JSONB,            -- ["prospectus", "exhibit_a"] or null for all

  -- Rule definition
  rule_type VARCHAR(50) NOT NULL,             -- 'max_file_size', 'file_format', 'min_word_count', 'regex', 'custom'
  rule_config JSONB NOT NULL,                 -- { "max_bytes": 10485760, "allowed_formats": ["pdf"] }

  -- Enforcement
  is_critical BOOLEAN NOT NULL DEFAULT FALSE, -- true = blocks submission
  severity VARCHAR(20) DEFAULT 'warning',     -- 'warning', 'error', 'critical'

  -- Error handling
  error_message_template TEXT,                -- "File size {actual} exceeds maximum {max}"
  remediation_guidance TEXT,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_validation_rules_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE,
  CONSTRAINT ck_rule_type CHECK (rule_type IN ('max_file_size', 'file_format', 'min_word_count',
    'max_word_count', 'regex', 'min_pages', 'max_pages', 'custom', 'required_sections', 'character_encoding'))
);

CREATE INDEX idx_validation_rules_exchange_id ON validation_rules(exchange_id);
CREATE INDEX idx_validation_rules_category ON validation_rules(rule_category);
CREATE INDEX idx_validation_rules_is_critical ON validation_rules(is_critical);
CREATE INDEX idx_validation_rules_is_active ON validation_rules(is_active);


-- ============================================================================
-- TABLE: filing_checklists
-- Purpose: Pre-filing checklists per exchange
-- Example: "TSX IPO Checklist" with items like "Form 41-101F1", "Underwriter consent", etc.
-- ============================================================================
CREATE TABLE filing_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Identification
  checklist_name VARCHAR(255) NOT NULL,       -- "TSX IPO Filing Checklist"
  checklist_type VARCHAR(50) NOT NULL,        -- 'ipo', 'rto', 'secondary', 'prospectus_amendment'

  -- Content
  items JSONB NOT NULL,                       -- Array of checklist items with metadata
  -- Example: [
  --   { "id": "item_1", "section": "Documents", "priority": "critical",
  --     "text": "Form NI 41-101F1 Prospectus", "is_required": true }
  -- ]

  -- Metadata
  description TEXT,
  total_items INTEGER,
  critical_items INTEGER,
  optional_items INTEGER,

  -- Sequencing
  is_sequential BOOLEAN DEFAULT FALSE,        -- Must items be completed in order?
  dependencies JSONB,                         -- { "item_3": ["item_1", "item_2"] }

  -- Status tracking
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_filing_checklists_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE
);

CREATE INDEX idx_filing_checklists_exchange_id ON filing_checklists(exchange_id);
CREATE INDEX idx_filing_checklists_type ON filing_checklists(checklist_type);
CREATE INDEX idx_filing_checklists_is_active ON filing_checklists(is_active);


-- ============================================================================
-- TABLE: guidance_templates
-- Purpose: Weak/strong examples and tips for prospectus content
-- Helps companies improve quality against exchange benchmarks
-- ============================================================================
CREATE TABLE guidance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Identification
  section_name VARCHAR(255) NOT NULL,         -- "Risk Factors", "Use of Proceeds", "Management Discussion & Analysis"
  category VARCHAR(100) NOT NULL,             -- 'structure', 'content_quality', 'disclosure', 'formatting'

  -- Guidance content
  guidance_text TEXT NOT NULL,                -- E.g., "Risk factors should be specific and material..."

  -- Examples
  weak_example TEXT,                          -- Poor example from public filings
  weak_example_explanation TEXT,              -- Why this is weak
  strong_example TEXT,                        -- Good example from strong IPO filings
  strong_example_explanation TEXT,            -- Why this works

  -- Quality benchmarks
  quality_benchmarks JSONB,                   -- { "min_word_count": 500, "max_word_count": 2000, "required_subsections": 3 }

  -- Tips
  tips JSONB,                                 -- ["Be specific about risks", "Reference actual events", ...]

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  source_url TEXT,                            -- Link to regulatory guidance, precedent filing
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_guidance_templates_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE
);

CREATE INDEX idx_guidance_templates_exchange_id ON guidance_templates(exchange_id);
CREATE INDEX idx_guidance_templates_category ON guidance_templates(category);
CREATE INDEX idx_guidance_templates_section_name ON guidance_templates(section_name);


-- ============================================================================
-- TABLE: document_requirements
-- Purpose: Specify which documents are required/optional per filing type
-- Examples: "TSX IPO requires Form NI 41-101F1, legal opinions, underwriter letters"
-- ============================================================================
CREATE TABLE document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Identification
  filing_type VARCHAR(100) NOT NULL,          -- 'ipo', 'rto', 'prospectus_supplement', 'amendment'
  document_type VARCHAR(100) NOT NULL,        -- 'prospectus', 'financial_statements', 'legal_opinion'

  -- Requirements
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  minimum_count INTEGER DEFAULT 1,

  -- Document specifications
  allowed_formats JSONB,                      -- ["pdf", "docx"]
  max_file_size_mb INTEGER,

  -- Conditional requirements
  required_if_condition TEXT,                 -- "revenue > $10M", "issuer in technology sector"
  required_for_jurisdictions JSONB,           -- ["ON", "BC"] - Canadian provinces, or null for all

  -- Validation
  validation_rules JSONB,                     -- References to validation_rules.id

  -- Guidance
  description TEXT,
  examples_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_document_requirements_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE
);

CREATE INDEX idx_document_requirements_exchange_id ON document_requirements(exchange_id);
CREATE INDEX idx_document_requirements_filing_type ON document_requirements(filing_type);
CREATE INDEX idx_document_requirements_document_type ON document_requirements(document_type);


-- ============================================================================
-- TABLE: risk_factor_requirements
-- Purpose: Define required risk factor categories per exchange
-- Examples: "TSX requires disclosure of currency risk, commodity price risk, regulatory risk"
-- ============================================================================
CREATE TABLE risk_factor_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Identification
  risk_category VARCHAR(100) NOT NULL,        -- 'market_risk', 'operational_risk', 'regulatory_risk', 'financial_risk'
  risk_subcategory VARCHAR(100),              -- 'currency_risk', 'commodity_price_risk'

  -- Requirement details
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  min_word_count INTEGER,

  -- Guidance
  description TEXT,
  examples_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_risk_factor_requirements_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE
);

CREATE INDEX idx_risk_factor_requirements_exchange_id ON risk_factor_requirements(exchange_id);
CREATE INDEX idx_risk_factor_requirements_category ON risk_factor_requirements(risk_category);


-- ============================================================================
-- TABLE: auditor_requirements
-- Purpose: Define auditor/auditing requirements per exchange
-- Examples: "Must use Big 4 auditor", "Auditor must conduct peer review", "Annual audits required"
-- ============================================================================
CREATE TABLE auditor_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Requirement details
  requirement_name VARCHAR(255) NOT NULL,     -- "Big 4 Auditor Requirement", "Annual Audit Requirement"
  requirement_description TEXT,

  -- Enforcement
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  is_jurisdictional BOOLEAN DEFAULT FALSE,    -- Applies to specific regions?
  applicable_jurisdictions JSONB,             -- ["ON", "BC"] or null for all

  -- Constraints
  allowed_audit_firms JSONB,                  -- ["Big 4"], ["local_firms"], null for any
  min_auditor_experience_years INTEGER,

  -- Timing
  audit_frequency VARCHAR(50),                -- 'annual', 'biennial', 'on_demand'

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_auditor_requirements_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE
);

CREATE INDEX idx_auditor_requirements_exchange_id ON auditor_requirements(exchange_id);
CREATE INDEX idx_auditor_requirements_is_mandatory ON auditor_requirements(is_mandatory);


-- ============================================================================
-- TABLE: exchange_configurations
-- Purpose: Store detailed JSON configuration for each exchange
-- Allows complete rule definitions without schema migrations
-- ============================================================================
CREATE TABLE exchange_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL UNIQUE REFERENCES exchanges(id) ON DELETE CASCADE,

  -- Full configuration as JSON
  -- Structure: {
  --   "prospectus_format": { "required": ["NI 41-101F1"], "alternative": [] },
  --   "minimum_public_float": { "percentage": 10 },
  --   "committees": { "audit_required": true, "compensation_required": false },
  --   "disclosure": { "executive_compensation": true, "related_party": true },
  --   "quality_benchmarks": { "risk_factors_min_words": 500 }
  -- }
  full_config JSONB NOT NULL,

  -- Version tracking for audit/rollback
  config_version VARCHAR(20),                 -- "1.0", "1.1", etc.

  -- Metadata
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_exchange_configurations_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id) ON DELETE CASCADE
);

CREATE INDEX idx_exchange_configurations_exchange_id ON exchange_configurations(exchange_id);


-- ============================================================================
-- TABLE: validation_audit_log
-- Purpose: Track all validation runs for compliance & debugging
-- ============================================================================
CREATE TABLE validation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  company_id UUID NOT NULL,
  exchange_id UUID NOT NULL REFERENCES exchanges(id),
  filing_id UUID,

  -- Validation details
  validation_type VARCHAR(50) NOT NULL,       -- 'document', 'filing', 'section', 'prospectus'
  target_id VARCHAR(255),                     -- filing_id, document_id, section_id, etc.

  -- Results
  validation_passed BOOLEAN NOT NULL,
  validation_errors JSONB,                    -- Array of { code, message, severity }
  validation_warnings JSONB,                  -- Array of warnings

  -- Metadata
  validation_duration_ms INTEGER,
  rules_applied INTEGER,

  -- Audit
  initiated_by VARCHAR(255),                  -- user_id or 'system'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_validation_audit_log_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id)
);

CREATE INDEX idx_validation_audit_log_company_id ON validation_audit_log(company_id);
CREATE INDEX idx_validation_audit_log_exchange_id ON validation_audit_log(exchange_id);
CREATE INDEX idx_validation_audit_log_filing_id ON validation_audit_log(filing_id);
CREATE INDEX idx_validation_audit_log_validation_passed ON validation_audit_log(validation_passed);
CREATE INDEX idx_validation_audit_log_created_at ON validation_audit_log(created_at);


-- ============================================================================
-- SEED DATA: Core Exchanges (TSX, TSXV, SEC, LSE)
-- ============================================================================

INSERT INTO exchanges (code, name, country, regulator_name, regulator_url, api_endpoint)
VALUES
  ('tsx', 'Toronto Stock Exchange', 'CA', 'Ontario Securities Commission (OSC)',
   'https://www.osc.ca', 'https://www.tsx.com'),
  ('tsxv', 'TSX Venture Exchange', 'CA', 'British Columbia Securities Commission (BCSC)',
   'https://www.bcsc.bc.ca', 'https://www.tsxv.ca'),
  ('sec', 'Securities and Exchange Commission (EDGAR)', 'US', 'Securities and Exchange Commission',
   'https://www.sec.gov', 'https://www.sec.gov/cgi-bin/browse-edgar'),
  ('lse', 'London Stock Exchange', 'GB', 'Financial Conduct Authority (FCA)',
   'https://www.fca.org.uk', 'https://www.londonstockexchange.com'),
  ('tse', 'Tokyo Stock Exchange', 'JP', 'Financial Services Agency (FSA)',
   'https://www.jpx.co.jp', 'https://www.jpx.co.jp'),
  ('hkex', 'Hong Kong Exchanges and Clearing', 'HK', 'Securities and Futures Commission (SFC)',
   'https://www.sfc.hk', 'https://www.hkex.com.hk')
ON CONFLICT (code) DO NOTHING;
