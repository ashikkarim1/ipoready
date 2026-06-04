-- Migration: Filing Documents Checklist Schema
-- Created: 2026-06-04
-- Description: Create tables for managing IPO filing document requirements and tracking

-- ============================================================================
-- Table: filing_document_types
-- Description: Master table defining document requirements by exchange/jurisdiction
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  template_url VARCHAR(500),
  estimated_prep_days INTEGER,
  regulatory_reference VARCHAR(255),
  example_document_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_exchange CHECK (exchange_id IN ('nasdaq', 'nyse', 'tsx', 'tsxv', 'cse', 'sec-edgar', 'sedar2')),
  CONSTRAINT valid_category CHECK (category IN ('Financial', 'Legal', 'Governance', 'Corporate', 'Compliance')),
  CONSTRAINT unique_document_per_exchange UNIQUE(exchange_id, document_name)
);

-- ============================================================================
-- Table: user_filing_documents
-- Description: Track document status and versions for each company
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_filing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  document_type_id UUID NOT NULL REFERENCES filing_document_types(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  file_path VARCHAR(500),
  s3_url VARCHAR(500),
  uploaded_at TIMESTAMP WITH TIME ZONE,
  uploaded_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  notes TEXT,
  version_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('not_started', 'in_progress', 'ready', 'uploaded', 'verified')),
  CONSTRAINT has_file_path_or_s3_url CHECK (file_path IS NOT NULL OR s3_url IS NOT NULL OR status IN ('not_started', 'in_progress')),
  CONSTRAINT unique_company_document UNIQUE(company_id, document_type_id)
);

-- ============================================================================
-- Table: filing_document_templates
-- Description: Store template content and checklist items for documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS filing_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_id UUID NOT NULL UNIQUE REFERENCES filing_document_types(id) ON DELETE CASCADE,
  template_content TEXT,
  example_file_url VARCHAR(500),
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Indexes on filing_document_types
CREATE INDEX idx_filing_document_types_exchange_id ON filing_document_types(exchange_id);
CREATE INDEX idx_filing_document_types_category ON filing_document_types(category);
CREATE INDEX idx_filing_document_types_exchange_category ON filing_document_types(exchange_id, category);

-- Indexes on user_filing_documents
CREATE INDEX idx_user_filing_documents_company_id ON user_filing_documents(company_id);
CREATE INDEX idx_user_filing_documents_document_type_id ON user_filing_documents(document_type_id);
CREATE INDEX idx_user_filing_documents_status ON user_filing_documents(status);
CREATE INDEX idx_user_filing_documents_uploaded_at ON user_filing_documents(uploaded_at DESC);
CREATE INDEX idx_user_filing_documents_company_status ON user_filing_documents(company_id, status);
CREATE INDEX idx_user_filing_documents_company_uploaded ON user_filing_documents(company_id, uploaded_at DESC);
CREATE INDEX idx_user_filing_documents_verified_at ON user_filing_documents(verified_at DESC);

-- Indexes on filing_document_templates
CREATE INDEX idx_filing_document_templates_document_type_id ON filing_document_templates(document_type_id);

-- ============================================================================
-- Seed Data: Filing Document Types (US SEC)
-- ============================================================================
INSERT INTO filing_document_types (exchange_id, category, document_name, description, is_required, template_url, estimated_prep_days, regulatory_reference, example_document_url)
VALUES
  -- Financial Documents
  ('sec-edgar', 'Financial', 'Audited Financial Statements', 'Most recent audited balance sheet, income statement, cash flow statement, and statements of equity', true, 'https://templates.ipoready.com/us-audited-financials', 30, 'SEC Regulation S-K Item 8', 'https://examples.ipoready.com/audited-financials-example.pdf'),
  ('sec-edgar', 'Financial', 'Management Discussion and Analysis (MD&A)', 'Narrative explanation of results of operations and financial condition', true, 'https://templates.ipoready.com/us-mda', 21, 'SEC Regulation S-K Item 7', 'https://examples.ipoready.com/mda-example.pdf'),
  ('sec-edgar', 'Financial', 'Selected Financial Data', 'Summary of financial performance for preceding 5 years', true, 'https://templates.ipoready.com/us-selected-financial-data', 14, 'SEC Regulation S-K Item 6', 'https://examples.ipoready.com/selected-financial-data-example.pdf'),
  ('sec-edgar', 'Financial', 'Capitalization Table', 'Complete ownership structure showing shares outstanding and options', true, 'https://templates.ipoready.com/us-cap-table', 7, 'SEC Regulation S-K Item 5', 'https://examples.ipoready.com/cap-table-example.pdf'),

  -- Legal Documents
  ('sec-edgar', 'Legal', 'Articles of Incorporation/Bylaws', 'Corporate governance documents', true, 'https://templates.ipoready.com/us-articles-bylaws', 3, 'SEC Regulation S-K Item 2', 'https://examples.ipoready.com/articles-bylaws-example.pdf'),
  ('sec-edgar', 'Legal', 'Legal Opinion', 'Counsel opinion on organization, capitalization, and authority', true, 'https://templates.ipoready.com/us-legal-opinion', 14, 'SEC Regulation S-K Item 1.C', 'https://examples.ipoready.com/legal-opinion-example.pdf'),
  ('sec-edgar', 'Legal', 'Underwriting Agreement', 'Agreement between company and underwriters', true, 'https://templates.ipoready.com/us-underwriting-agreement', 21, 'SEC Regulation S-K Item 13', 'https://examples.ipoready.com/underwriting-agreement-example.pdf'),
  ('sec-edgar', 'Legal', 'Lock-Up Agreement', 'Shareholder agreements restricting share sales post-IPO', true, 'https://templates.ipoready.com/us-lockup-agreement', 7, 'SEC Regulation S-K Item 13', 'https://examples.ipoready.com/lockup-agreement-example.pdf'),

  -- Governance Documents
  ('sec-edgar', 'Governance', 'Board of Directors Biographies', 'Director qualifications and backgrounds', true, 'https://templates.ipoready.com/us-board-bios', 14, 'SEC Regulation S-K Item 10', 'https://examples.ipoready.com/board-bios-example.pdf'),
  ('sec-edgar', 'Governance', 'Executive Officers Information', 'Officer names, titles, and compensation history', true, 'https://templates.ipoready.com/us-executive-officers', 10, 'SEC Regulation S-K Item 10', 'https://examples.ipoready.com/executive-officers-example.pdf'),
  ('sec-edgar', 'Governance', 'Corporate Governance Documents', 'Code of conduct, charter documents for board committees', true, 'https://templates.ipoready.com/us-governance-docs', 14, 'SEC Regulation S-K Item 10', 'https://examples.ipoready.com/governance-example.pdf'),
  ('sec-edgar', 'Governance', 'Compensation Discussion and Analysis (CD&A)', 'Detailed executive compensation summary', true, 'https://templates.ipoready.com/us-cda', 21, 'SEC Regulation S-K Item 11', 'https://examples.ipoready.com/cda-example.pdf'),

  -- Corporate Documents
  ('sec-edgar', 'Corporate', 'Use of Proceeds', 'Description of how IPO proceeds will be used', true, 'https://templates.ipoready.com/us-use-of-proceeds', 7, 'SEC Regulation S-K Item 4', 'https://examples.ipoready.com/use-of-proceeds-example.pdf'),
  ('sec-edgar', 'Corporate', 'Risk Factors', 'Comprehensive discussion of risks affecting business', true, 'https://templates.ipoready.com/us-risk-factors', 21, 'SEC Regulation S-K Item 1.A', 'https://examples.ipoready.com/risk-factors-example.pdf'),
  ('sec-edgar', 'Corporate', 'Business Description', 'Overview of company operations and market position', true, 'https://templates.ipoready.com/us-business-description', 14, 'SEC Regulation S-K Item 1', 'https://examples.ipoready.com/business-description-example.pdf'),
  ('sec-edgar', 'Corporate', 'Dividend Policy', 'Statement on dividend practices and policy', false, 'https://templates.ipoready.com/us-dividend-policy', 3, 'SEC Regulation S-K Item 5', 'https://examples.ipoready.com/dividend-policy-example.pdf'),

  -- Compliance Documents
  ('sec-edgar', 'Compliance', 'Tax Certifications', 'US tax documentation and W-9 forms', true, 'https://templates.ipoready.com/us-tax-certifications', 5, 'SEC Regulation S-K Item 1.C', 'https://examples.ipoready.com/tax-certifications-example.pdf'),
  ('sec-edgar', 'Compliance', 'Underwriter Due Diligence Letter', 'Comfort letter from auditors', true, 'https://templates.ipoready.com/us-comfort-letter', 14, 'SEC Regulation S-K Item 8', 'https://examples.ipoready.com/comfort-letter-example.pdf'),
  ('sec-edgar', 'Compliance', 'Regulatory Compliance Certifications', 'SOX 302/906 certifications and attestations', true, 'https://templates.ipoready.com/us-compliance-certs', 7, 'Securities Exchange Act Rule 13a-14', 'https://examples.ipoready.com/compliance-certs-example.pdf'),
  ('sec-edgar', 'Compliance', 'Insider Trading Policy', 'Company policies on insider trading and blackout periods', true, 'https://templates.ipoready.com/us-insider-trading-policy', 7, 'SEC Regulation S-K Item 10', 'https://examples.ipoready.com/insider-trading-policy-example.pdf');

-- ============================================================================
-- Seed Data: Filing Document Types (Canadian - TSX)
-- ============================================================================
INSERT INTO filing_document_types (exchange_id, category, document_name, description, is_required, template_url, estimated_prep_days, regulatory_reference, example_document_url)
VALUES
  -- Financial Documents
  ('tsx', 'Financial', 'Audited Financial Statements', 'IFRS compliant audited financial statements for 2 years', true, 'https://templates.ipoready.com/ca-audited-financials', 35, 'National Instrument 41-101 Item 14.2', 'https://examples.ipoready.com/ca-audited-financials-example.pdf'),
  ('tsx', 'Financial', 'Management Discussion and Analysis (MD&A)', 'Narrative explanation following CSA guidelines', true, 'https://templates.ipoready.com/ca-mda', 21, 'National Instrument 51-102 Part 2A', 'https://examples.ipoready.com/ca-mda-example.pdf'),
  ('tsx', 'Financial', 'Capitalization Table', 'Showing all share classes and option grants', true, 'https://templates.ipoready.com/ca-cap-table', 7, 'National Instrument 41-101 Item 9', 'https://examples.ipoready.com/ca-cap-table-example.pdf'),
  ('tsx', 'Financial', 'Income Tax Ruling', 'CRA ruling or opinion on tax status', true, 'https://templates.ipoready.com/ca-tax-ruling', 45, 'SEDAR2 Filing Requirements', 'https://examples.ipoready.com/ca-tax-ruling-example.pdf'),

  -- Legal Documents
  ('tsx', 'Legal', 'Certificate of Amalgamation/Incorporation', 'Corporate formation documents', true, 'https://templates.ipoready.com/ca-certificate-amalgamation', 3, 'National Instrument 41-101 Item 3', 'https://examples.ipoready.com/ca-certificate-example.pdf'),
  ('tsx', 'Legal', 'Articles of Incorporation', 'As amended documents', true, 'https://templates.ipoready.com/ca-articles-incorporation', 3, 'National Instrument 41-101 Item 3', 'https://examples.ipoready.com/ca-articles-example.pdf'),
  ('tsx', 'Legal', 'Corporate Solicitor Opinion Letter', 'Legal opinion on corporate status and authority', true, 'https://templates.ipoready.com/ca-solicitor-opinion', 14, 'National Instrument 41-101 Item 20.1', 'https://examples.ipoready.com/ca-solicitor-opinion-example.pdf'),

  -- Governance Documents
  ('tsx', 'Governance', 'Director and Officer Disclosure', 'Board and management information form (Form 6)', true, 'https://templates.ipoready.com/ca-director-officer-disclosure', 10, 'National Instrument 41-101 Item 11', 'https://examples.ipoready.com/ca-director-disclosure-example.pdf'),
  ('tsx', 'Governance', 'Management Information Circular', 'Details on executive compensation and governance', true, 'https://templates.ipoready.com/ca-mgt-info-circular', 21, 'National Instrument 41-101 Item 11', 'https://examples.ipoready.com/ca-mgt-circular-example.pdf'),

  -- Corporate Documents
  ('tsx', 'Corporate', 'Business Summary', 'Description of business and market', true, 'https://templates.ipoready.com/ca-business-summary', 14, 'National Instrument 41-101 Item 4', 'https://examples.ipoready.com/ca-business-summary-example.pdf'),
  ('tsx', 'Corporate', 'Principal Purposes and Use of Proceeds', 'How IPO funds will be deployed', true, 'https://templates.ipoready.com/ca-use-of-proceeds', 7, 'National Instrument 41-101 Item 5', 'https://examples.ipoready.com/ca-use-of-proceeds-example.pdf'),

  -- Compliance Documents
  ('tsx', 'Compliance', 'CRA Acceptance Letter', 'Confirmation of eligible business status', true, 'https://templates.ipoready.com/ca-cra-acceptance', 60, 'SEDAR2 Filing Requirements', 'https://examples.ipoready.com/ca-cra-acceptance-example.pdf'),
  ('tsx', 'Compliance', 'Consent of Auditors', 'Formal consent to audit and procedures', true, 'https://templates.ipoready.com/ca-consent-auditors', 7, 'National Instrument 41-101 Item 20.1', 'https://examples.ipoready.com/ca-consent-auditors-example.pdf');

-- ============================================================================
-- Seed Data: Filing Document Templates
-- ============================================================================
INSERT INTO filing_document_templates (document_type_id, template_content, checklist)
SELECT
  fdt.id,
  'See regulatory reference for detailed requirements',
  jsonb_build_array(
    jsonb_build_object('item', 'Document obtained and reviewed', 'completed', false),
    jsonb_build_object('item', 'Legal review completed', 'completed', false),
    jsonb_build_object('item', 'Accuracy verified', 'completed', false),
    jsonb_build_object('item', 'Uploaded to filing system', 'completed', false)
  )
FROM filing_document_types fdt
WHERE fdt.exchange_id IN ('sec-edgar', 'tsx')
LIMIT 1;

-- Refresh the insertion for all documents
TRUNCATE filing_document_templates;

INSERT INTO filing_document_templates (document_type_id, template_content, checklist)
SELECT
  fdt.id,
  'Template: ' || fdt.document_name || '. See regulatory reference: ' || fdt.regulatory_reference,
  jsonb_build_array(
    jsonb_build_object('item', 'Document obtained and reviewed', 'completed', false),
    jsonb_build_object('item', 'Legal review completed', 'completed', false),
    jsonb_build_object('item', 'Accuracy verified', 'completed', false),
    jsonb_build_object('item', 'Uploaded to filing system', 'completed', false)
  )
FROM filing_document_types fdt;

-- ============================================================================
-- Helper Views
-- ============================================================================

-- View: Filing Document Status Summary by Company
CREATE OR REPLACE VIEW v_filing_document_status_summary AS
SELECT
  company_id,
  COUNT(*) as total_documents,
  COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
  COUNT(CASE WHEN status = 'uploaded' THEN 1 END) as uploaded_count,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started_count,
  ROUND(100.0 * COUNT(CASE WHEN status IN ('verified', 'uploaded') THEN 1 END) / COUNT(*), 2) as completion_percentage
FROM user_filing_documents
GROUP BY company_id;

-- View: Required Documents Missing for Each Company
CREATE OR REPLACE VIEW v_required_documents_missing AS
SELECT
  ufd.company_id,
  fdt.exchange_id,
  fdt.category,
  fdt.document_name,
  fdt.regulatory_reference,
  COALESCE(ufd.status, 'not_started') as current_status
FROM filing_document_types fdt
LEFT JOIN user_filing_documents ufd
  ON fdt.id = ufd.document_type_id
WHERE fdt.is_required = true
  AND (ufd.status IS NULL OR ufd.status != 'verified');

-- ============================================================================
-- End of Migration
-- ============================================================================
