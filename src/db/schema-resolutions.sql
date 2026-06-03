-- Corporate Resolution Generator Schema
-- Supports 4 resolution types: prospectus_approval, listing_approval, underwriting_authorization, material_contracts
-- Last Updated: June 3, 2026

-- ============================================================================
-- BOARD RESOLUTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS board_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  resolution_type VARCHAR(50) NOT NULL, -- 'prospectus_approval', 'listing_approval', 'underwriting_authorization', 'material_contracts'
  company_name VARCHAR(255) NOT NULL,
  approval_date DATE NOT NULL,
  board_members TEXT[] NOT NULL, -- Array of board member names
  
  -- Resolution-specific details (stored as JSONB for flexibility)
  prospectus_details JSONB,
  listing_details JSONB,
  underwriting_details JSONB,
  contract_details JSONB,
  
  -- Document content
  html_content TEXT, -- Rich HTML version stored for editing
  document_title VARCHAR(255) NOT NULL,
  
  -- Document status
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'executed', 'archived'
  approval_count INT DEFAULT 0, -- Number of board members who have approved
  execution_date TIMESTAMP,
  
  -- Document references
  docx_filename VARCHAR(255),
  pdf_filename VARCHAR(255),
  docx_file_size BIGINT,
  pdf_file_size BIGINT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_board_resolutions_company_id ON board_resolutions(company_id);
CREATE INDEX idx_board_resolutions_user_id ON board_resolutions(user_id);
CREATE INDEX idx_board_resolutions_status ON board_resolutions(status);
CREATE INDEX idx_board_resolutions_resolution_type ON board_resolutions(resolution_type);
CREATE INDEX idx_board_resolutions_created_at ON board_resolutions(created_at DESC);

-- ============================================================================
-- RESOLUTION APPROVALS TABLE (Track board member signatures)
-- ============================================================================
CREATE TABLE IF NOT EXISTS resolution_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL,
  board_member_name VARCHAR(255) NOT NULL,
  board_member_email VARCHAR(255),
  approval_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  signature_type VARCHAR(50), -- 'digital', 'wet_ink', 'electronic'
  signature_data TEXT, -- Base64 encoded signature
  approval_date TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (resolution_id) REFERENCES board_resolutions(id) ON DELETE CASCADE
);

CREATE INDEX idx_resolution_approvals_resolution_id ON resolution_approvals(resolution_id);
CREATE INDEX idx_resolution_approvals_approval_status ON resolution_approvals(approval_status);
CREATE INDEX idx_resolution_approvals_board_member_name ON resolution_approvals(board_member_name);

-- ============================================================================
-- RESOLUTION TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resolution_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_type VARCHAR(50) NOT NULL,
  exchange VARCHAR(50) NOT NULL, -- 'tsx', 'nasdaq', 'nyse', etc. - or 'universal'
  is_required BOOLEAN DEFAULT false, -- Whether this resolution is REQUIRED for this exchange
  template_content TEXT NOT NULL, -- Rich template text with placeholders
  template_variables TEXT[], -- Array of variable names (e.g., ['company_name', 'approval_date'])
  legal_language TEXT, -- Standard boilerplate legal text
  version VARCHAR(20) DEFAULT '1.0',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(resolution_type, exchange, version)
);

CREATE INDEX idx_resolution_templates_type ON resolution_templates(resolution_type);
CREATE INDEX idx_resolution_templates_exchange ON resolution_templates(exchange);

-- ============================================================================
-- EXCHANGE REQUIREMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS exchange_resolution_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange VARCHAR(50) NOT NULL,
  resolution_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  required_by_date VARCHAR(50), -- e.g., "Before listing date"
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(exchange, resolution_type)
);

CREATE INDEX idx_exchange_requirements_exchange ON exchange_resolution_requirements(exchange);

-- ============================================================================
-- INSERT TEMPLATE REQUIREMENTS FOR MAJOR EXCHANGES
-- ============================================================================
INSERT INTO exchange_resolution_requirements (exchange, resolution_type, is_required, required_by_date, notes)
VALUES
  -- TSX requirements
  ('tsx', 'prospectus_approval', true, 'Before filing', 'Required by TSX rules'),
  ('tsx', 'listing_approval', true, 'Before listing', 'Required by TSX rules'),
  ('tsx', 'underwriting_authorization', true, 'Before underwriting agreement', 'Authorizes underwriters'),
  ('tsx', 'material_contracts', false, 'Before listing', 'Required only if material contracts exist'),
  
  -- NASDAQ requirements
  ('nasdaq', 'prospectus_approval', true, 'Before filing', 'Required by NASDAQ rules'),
  ('nasdaq', 'listing_approval', true, 'Before listing', 'Required by NASDAQ rules'),
  ('nasdaq', 'underwriting_authorization', true, 'Before underwriting agreement', 'Authorizes underwriters'),
  ('nasdaq', 'material_contracts', false, 'Before listing', 'Required only if material contracts exist'),
  
  -- NYSE requirements
  ('nyse', 'prospectus_approval', true, 'Before filing', 'Required by NYSE rules'),
  ('nyse', 'listing_approval', true, 'Before listing', 'Required by NYSE rules'),
  ('nyse', 'underwriting_authorization', true, 'Before underwriting agreement', 'Authorizes underwriters'),
  ('nyse', 'material_contracts', false, 'Before listing', 'Required only if material contracts exist'),
  
  -- CSE requirements
  ('cse', 'prospectus_approval', true, 'Before filing', 'Required by CSE rules'),
  ('cse', 'listing_approval', true, 'Before listing', 'Required by CSE rules'),
  ('cse', 'underwriting_authorization', false, 'Not required', 'Not required for CSE listings'),
  ('cse', 'material_contracts', false, 'Before listing', 'Required only if material contracts exist'),
  
  -- TSXV requirements
  ('tsxv', 'prospectus_approval', false, 'Not required', 'Not required for TSXV reverse mergers'),
  ('tsxv', 'listing_approval', true, 'Before listing', 'Required by TSXV rules'),
  ('tsxv', 'underwriting_authorization', false, 'Not required', 'Not required for TSXV'),
  ('tsxv', 'material_contracts', false, 'Before listing', 'Required only if material contracts exist');

-- ============================================================================
-- INSERT SAMPLE TEMPLATES
-- ============================================================================
INSERT INTO resolution_templates (resolution_type, exchange, is_required, template_content, template_variables, legal_language, version)
VALUES
  (
    'prospectus_approval',
    'universal',
    true,
    'BOARD RESOLUTION - PROSPECTUS APPROVAL\n\nWHEREAS, {{company_name}} (the "Company") is preparing to file a prospectus with applicable securities regulators;\n\nWHEREAS, the Board of Directors has reviewed and approved the prospectus in its current form;\n\nNOW BE IT RESOLVED THAT:\n\n1. The prospectus prepared by the Company is hereby approved.\n2. Management is authorized to file the prospectus with all applicable securities regulators.\n3. The Chief Executive Officer and Chief Financial Officer are authorized to execute all necessary documents.',
    '{"company_name", "approval_date", "board_members"}',
    'The Board of Directors, having reviewed the prospectus and the business of the Company, believes the prospectus contains accurate and complete information required under applicable securities laws.',
    '1.0'
  );
