-- Document Relationships Schema
-- Tracks relationships between prospectus and supporting documents
-- Manages required vs optional documents by exchange

CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,           -- e.g. 'prospectus', 'financing_agreement', 'employment_contract'
  display_name VARCHAR(100) NOT NULL,         -- e.g. 'Prospectus', 'Financing Agreement'
  description TEXT,                            -- Document description
  icon_name VARCHAR(50),                       -- lucide icon name
  category VARCHAR(50),                        -- 'core', 'supporting', 'governance', 'financial'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_document_id UUID REFERENCES prospectus_documents(id) ON DELETE CASCADE,  -- Central prospectus node
  target_document_type_id UUID NOT NULL REFERENCES document_types(id),
  relationship_type VARCHAR(50) NOT NULL,     -- 'supports', 'references', 'requires', 'supplements'
  is_required BOOLEAN DEFAULT FALSE,           -- Required vs optional
  exchange VARCHAR(20),                        -- e.g. 'tsx', 'nasdaq' - NULL means applies to all
  filing_category VARCHAR(100),                -- e.g. 'Section 2A', 'Item 10'
  status VARCHAR(50) DEFAULT 'missing',        -- 'missing', 'in_progress', 'submitted', 'rejected', 'approved'
  document_file_id VARCHAR(500),               -- S3/blob URL or document ID
  uploaded_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  rejection_reason TEXT,
  sort_order INT DEFAULT 0,                    -- UI ordering
  metadata JSONB,                              -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  label VARCHAR(200) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  color_code VARCHAR(20) DEFAULT 'default',   -- 'required', 'recommended', 'submitted', 'missing'
  position_x FLOAT DEFAULT 0,                  -- For graph layout persistence
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, document_type_id)
);

CREATE TABLE IF NOT EXISTS document_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES document_graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES document_graph_nodes(id) ON DELETE CASCADE,
  relationship_label VARCHAR(100),
  edge_type VARCHAR(50) DEFAULT 'supports',   -- 'supports', 'references', 'requires'
  weight FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, source_node_id, target_node_id)
);

-- Indexes for performance
CREATE INDEX idx_document_relationships_company ON document_relationships(company_id);
CREATE INDEX idx_document_relationships_exchange ON document_relationships(exchange);
CREATE INDEX idx_document_relationships_status ON document_relationships(status);
CREATE INDEX idx_document_graph_nodes_company ON document_graph_nodes(company_id);
CREATE INDEX idx_document_graph_edges_company ON document_graph_edges(company_id);
CREATE INDEX idx_document_graph_edges_source ON document_graph_edges(source_node_id);
CREATE INDEX idx_document_graph_edges_target ON document_graph_edges(target_node_id);

-- Seed document types
INSERT INTO document_types (code, display_name, description, icon_name, category) VALUES
('prospectus', 'Prospectus', 'Official prospectus document', 'BookOpen', 'core'),
('financing_agreement', 'Financing Agreement', 'Underwriting or financing agreement', 'FileContract', 'supporting'),
('employment_contract', 'Employment Contract', 'Key employment agreements', 'Users', 'governance'),
('ip_assignment', 'IP Assignment', 'Intellectual property assignment agreement', 'Copyright', 'supporting'),
('license_agreement', 'License Agreement', 'Material license agreements', 'FileCheck', 'supporting'),
('service_contract', 'Service Contract', 'Material service agreements', 'Building2', 'supporting'),
('board_minutes', 'Board Minutes', 'Board of directors minutes', 'FileText', 'governance'),
('shareholder_resolution', 'Shareholder Resolution', 'Shareholder resolutions and approvals', 'CheckSquare', 'governance'),
('auditor_report', 'Auditor Report', 'Audited financial statements and auditor report', 'BarChart3', 'financial'),
('tax_compliance', 'Tax Compliance', 'Tax filings and compliance documents', 'Receipt', 'financial'),
('insurance_policy', 'Insurance Policy', 'Material insurance policies', 'Shield', 'supporting'),
('lease_agreement', 'Lease Agreement', 'Material real estate or equipment leases', 'Home', 'supporting'),
('regulatory_approval', 'Regulatory Approval', 'Regulatory clearances and approvals', 'CheckCircle', 'governance'),
('exchange_approval', 'Exchange Approval', 'Exchange listing approval', 'Zap', 'governance')
ON CONFLICT (code) DO NOTHING;

-- Auto-update trigger for document_relationships
CREATE OR REPLACE FUNCTION update_document_relationships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_document_relationships_updated_at ON document_relationships;
CREATE TRIGGER trigger_document_relationships_updated_at
  BEFORE UPDATE ON document_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_document_relationships_updated_at();

DROP TRIGGER IF EXISTS trigger_document_graph_nodes_updated_at ON document_graph_nodes;
CREATE TRIGGER trigger_document_graph_nodes_updated_at
  BEFORE UPDATE ON document_graph_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_document_relationships_updated_at();

COMMENT ON TABLE document_types IS 'Master list of document types and their metadata';
COMMENT ON TABLE document_relationships IS 'Links between prospectus and supporting documents with exchange-specific requirements';
COMMENT ON TABLE document_graph_nodes IS 'Node positions and metadata for force-directed graph visualization';
COMMENT ON TABLE document_graph_edges IS 'Edge definitions for graph relationships';
