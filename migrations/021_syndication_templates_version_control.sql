/**
 * Syndication Templates Version Control System
 * 
 * Extends syndication_agreements table with:
 * - Template management
 * - Version history tracking
 * - Change logging
 * - Template status (draft/active/archived)
 */

-- ====================================================================
-- TABLE: SYNDICATION_TEMPLATE_VERSIONS
-- ====================================================================
-- Track all versions and changes to syndication templates

CREATE TABLE IF NOT EXISTS syndication_template_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES syndication_agreements(id) ON DELETE CASCADE,
  
  version INT NOT NULL,
  
  -- Snapshot of template at this version
  agreement_type VARCHAR(100),
  agreement_name VARCHAR(255),
  description TEXT,
  lead_underwriter VARCHAR(255),
  co_underwriter_names TEXT,
  member_count INT,
  
  gross_spread_bps INT,
  net_proceeds_usd DECIMAL(15,2),
  allocation_structure JSONB,
  
  lockup_period_days INT,
  
  -- Change tracking
  change_summary TEXT,                        -- e.g., "Updated gross spread from 300 to 350 bps"
  changed_fields JSONB,                       -- {field: {old_value, new_value}, ...}
  
  -- Audit
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  notes TEXT
);

CREATE INDEX idx_syndication_template_versions_template_id ON syndication_template_versions(template_id);
CREATE INDEX idx_syndication_template_versions_version ON syndication_template_versions(template_id, version);
CREATE INDEX idx_syndication_template_versions_created_at ON syndication_template_versions(created_at);

-- ====================================================================
-- TABLE: SYNDICATION_AGREEMENT_MEMBERS
-- ====================================================================
-- Detailed member allocation tracking

CREATE TABLE IF NOT EXISTS syndication_agreement_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES syndication_agreements(id) ON DELETE CASCADE,
  
  member_name VARCHAR(255) NOT NULL,
  member_role VARCHAR(100),                   -- 'lead', 'co_lead', 'manager', 'syndicate_member'
  
  -- Allocation terms
  allocation_bps INT,                         -- Basis points (e.g., 350 = 3.5%)
  allocation_percentage DECIMAL(5,2),         -- Calculated from bps
  
  -- Member obligations
  commitment_amount_usd DECIMAL(15,2),        -- Underwriter's purchase commitment
  expected_commission_usd DECIMAL(15,2),      -- Expected commission/spread allocation
  
  -- Contact info
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_person VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'accepted', 'declined', 'inactive'
  signed_date DATE,
  signed_by_name VARCHAR(255),
  signed_by_title VARCHAR(100),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_syndication_agreement_members_agreement_id ON syndication_agreement_members(agreement_id);
CREATE INDEX idx_syndication_agreement_members_member_name ON syndication_agreement_members(member_name);
CREATE INDEX idx_syndication_agreement_members_status ON syndication_agreement_members(status);
CREATE INDEX idx_syndication_agreement_members_role ON syndication_agreement_members(member_role);

DROP TRIGGER IF EXISTS trigger_syndication_agreement_members_updated_at ON syndication_agreement_members;
CREATE TRIGGER trigger_syndication_agreement_members_updated_at
  BEFORE UPDATE ON syndication_agreement_members
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE: SYNDICATION_OBLIGATIONS_TRACKER
-- ====================================================================
-- Track underwriter obligations and performance

CREATE TABLE IF NOT EXISTS syndication_obligations_tracker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES syndication_agreements(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES syndication_agreement_members(id) ON DELETE CASCADE,
  
  obligation_type VARCHAR(100) NOT NULL,      -- 'due_diligence', 'securities_purchase', 'distribution',
                                                -- 'compliance_confirmation', 'lockup_agreement', 'fee_payment'
  description TEXT,
  
  -- Timeline
  due_date DATE,
  completed_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'in_progress', 'completed', 'waived', 'overdue'
  completion_pct INT DEFAULT 0,               -- 0-100
  
  -- Evidence
  evidence_document_url TEXT,                 -- Link to confirmation, signed doc, etc.
  evidence_notes TEXT,
  
  -- Tracking
  verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_syndication_obligations_agreement_id ON syndication_obligations_tracker(agreement_id);
CREATE INDEX idx_syndication_obligations_member_id ON syndication_obligations_tracker(member_id);
CREATE INDEX idx_syndication_obligations_type ON syndication_obligations_tracker(obligation_type);
CREATE INDEX idx_syndication_obligations_status ON syndication_obligations_tracker(status);
CREATE INDEX idx_syndication_obligations_due_date ON syndication_obligations_tracker(due_date);
CREATE INDEX idx_syndication_obligations_completed_date ON syndication_obligations_tracker(completed_date);

DROP TRIGGER IF EXISTS trigger_syndication_obligations_updated_at ON syndication_obligations_tracker;
CREATE TRIGGER trigger_syndication_obligations_updated_at
  BEFORE UPDATE ON syndication_obligations_tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- ENHANCEMENT: Add status and version fields to syndication_agreements
-- ====================================================================
-- These columns extend the existing syndication_agreements table

ALTER TABLE syndication_agreements
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',  -- 'draft', 'active', 'archived'
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_syndication_agreements_status_template ON syndication_agreements(status, is_template);

-- ====================================================================
-- VIEW: SYNDICATION_TEMPLATE_SUMMARY
-- ====================================================================
-- Aggregated view for template management dashboard

CREATE OR REPLACE VIEW syndication_template_summary AS
SELECT
  sa.id,
  sa.agreement_type,
  sa.agreement_name,
  sa.description,
  sa.lead_underwriter,
  sa.member_count,
  sa.gross_spread_bps,
  sa.net_proceeds_usd,
  sa.lockup_period_days,
  sa.status,
  sa.version,
  sa.is_template,
  sa.created_at,
  sa.updated_at,
  COUNT(DISTINCT sam.id) as total_members_signed,
  COUNT(DISTINCT CASE WHEN so.status = 'completed' THEN so.id END) as completed_obligations,
  COUNT(DISTINCT so.id) as total_obligations,
  stv.version as latest_version_number
FROM syndication_agreements sa
LEFT JOIN syndication_agreement_members sam ON sa.id = sam.agreement_id AND sam.status = 'accepted'
LEFT JOIN syndication_obligations_tracker so ON sa.id = so.agreement_id
LEFT JOIN syndication_template_versions stv ON sa.id = stv.template_id
WHERE sa.is_template = TRUE OR sa.status = 'active'
GROUP BY
  sa.id, sa.agreement_type, sa.agreement_name, sa.description,
  sa.lead_underwriter, sa.member_count, sa.gross_spread_bps,
  sa.net_proceeds_usd, sa.lockup_period_days, sa.status, sa.version,
  sa.is_template, sa.created_at, sa.updated_at, stv.version;

-- ====================================================================
-- FUNCTION: CREATE_TEMPLATE_VERSION
-- ====================================================================
-- Function to automatically create version history when template is updated

CREATE OR REPLACE FUNCTION create_syndication_template_version(
  p_template_id UUID,
  p_change_summary TEXT,
  p_changed_fields JSONB,
  p_user_id UUID DEFAULT NULL,
  p_user_name VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_version INT;
  v_new_version_id UUID;
  v_template syndication_agreements;
BEGIN
  -- Get current template
  SELECT * INTO v_template FROM syndication_agreements WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', p_template_id;
  END IF;
  
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM syndication_template_versions
  WHERE template_id = p_template_id;
  
  -- Create version record
  INSERT INTO syndication_template_versions (
    template_id, version, agreement_type, agreement_name, description,
    lead_underwriter, co_underwriter_names, member_count, gross_spread_bps,
    net_proceeds_usd, allocation_structure, lockup_period_days,
    change_summary, changed_fields, created_by_user_id, created_by_name
  ) VALUES (
    p_template_id, v_version, v_template.agreement_type, v_template.agreement_name,
    v_template.description, v_template.lead_underwriter, v_template.co_underwriter_names,
    v_template.member_count, v_template.gross_spread_bps, v_template.net_proceeds_usd,
    v_template.allocation_structure, v_template.lockup_period_days,
    p_change_summary, p_changed_fields, p_user_id, p_user_name
  ) RETURNING id INTO v_new_version_id;
  
  -- Update template version counter
  UPDATE syndication_agreements SET version = v_version WHERE id = p_template_id;
  
  RETURN v_new_version_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- Sample seed data for templates (optional)
-- ====================================================================

-- Mark these as templates
UPDATE syndication_agreements
  SET is_template = TRUE, status = 'active'
  WHERE agreement_name LIKE '%Standard%' OR agreement_name LIKE '%Template%'
  LIMIT 3;
