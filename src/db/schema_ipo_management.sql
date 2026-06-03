-- IPOReady: IPO Management & Compliance Schema
-- Comprehensive tables for cost tracking, financial planning, dilution analysis, and regulatory compliance
-- Created: 2026-06-03

-- ============================================================================
-- TABLE: ipo_costs
-- Purpose: Track all estimated and actual IPO-related costs across categories
-- ============================================================================
CREATE TABLE ipo_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL CHECK (exchange IN ('NYSE', 'NASDAQ', 'TSX', 'CSE', 'OTHER')),
  
  -- Estimated cost categories
  estimated_legal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estimated_accounting DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estimated_underwriting DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estimated_printing DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estimated_filing DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estimated_contingency DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  -- Calculated total
  total_estimated DECIMAL(15, 2) NOT NULL GENERATED ALWAYS AS (
    estimated_legal + estimated_accounting + estimated_underwriting + 
    estimated_printing + estimated_filing + estimated_contingency
  ) STORED,
  
  currency VARCHAR(3) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'CAD')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_ipo_costs_company FOREIGN KEY (company_id) 
    REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT ck_estimated_costs_positive CHECK (
    estimated_legal >= 0 AND
    estimated_accounting >= 0 AND
    estimated_underwriting >= 0 AND
    estimated_printing >= 0 AND
    estimated_filing >= 0 AND
    estimated_contingency >= 0
  )
);

CREATE INDEX idx_ipo_costs_company_id ON ipo_costs(company_id);
CREATE INDEX idx_ipo_costs_exchange ON ipo_costs(exchange);


-- ============================================================================
-- TABLE: financial_tracking
-- Purpose: Monthly budget vs. actual tracking for IPO cost categories
-- ============================================================================
CREATE TABLE financial_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipo_cost_id UUID NOT NULL REFERENCES ipo_costs(id) ON DELETE CASCADE,
  
  month DATE NOT NULL,
  budgeted_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  actual_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  -- Status: on-track, over-budget, under-budget, pending
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'on-track', 'over-budget', 'under-budget', 'closed')
  ),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_financial_tracking_ipo_cost FOREIGN KEY (ipo_cost_id) 
    REFERENCES ipo_costs(id) ON DELETE CASCADE,
  CONSTRAINT ck_financial_amounts_positive CHECK (
    budgeted_amount >= 0 AND actual_spent >= 0
  ),
  CONSTRAINT ck_month_valid CHECK (month = DATE_TRUNC('month', month)::DATE)
);

CREATE INDEX idx_financial_tracking_ipo_cost_id ON financial_tracking(ipo_cost_id);
CREATE INDEX idx_financial_tracking_month ON financial_tracking(month);
CREATE INDEX idx_financial_tracking_status ON financial_tracking(status);


-- ============================================================================
-- TABLE: dilution_scenarios
-- Purpose: Model cap table impacts under various IPO scenarios
-- ============================================================================
CREATE TABLE dilution_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cap_table_id UUID NOT NULL REFERENCES cap_tables(id) ON DELETE CASCADE,
  
  scenario_name VARCHAR(255) NOT NULL,
  
  -- Scenario type: base-case, conservative, aggressive, secondary-only, primary-only
  scenario_type VARCHAR(50) NOT NULL CHECK (
    scenario_type IN ('base-case', 'conservative', 'aggressive', 'secondary-only', 'primary-only')
  ),
  
  -- Dilution sources
  warrant_shares BIGINT NOT NULL DEFAULT 0,
  new_financing_shares BIGINT NOT NULL DEFAULT 0,
  option_vesting_shares BIGINT NOT NULL DEFAULT 0,
  
  -- Post-IPO state
  post_ipo_total_shares BIGINT NOT NULL,
  
  -- JSON object storing per-stakeholder ownership impact
  -- Format: { "shareholder_id": { "pre_ipo_pct": 15.5, "post_ipo_pct": 12.3, "change_pct": -3.2 }, ... }
  ownership_impact JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_dilution_scenarios_cap_table FOREIGN KEY (cap_table_id) 
    REFERENCES cap_tables(id) ON DELETE CASCADE,
  CONSTRAINT ck_dilution_shares_positive CHECK (
    warrant_shares >= 0 AND
    new_financing_shares >= 0 AND
    option_vesting_shares >= 0 AND
    post_ipo_total_shares > 0
  )
);

CREATE INDEX idx_dilution_scenarios_cap_table_id ON dilution_scenarios(cap_table_id);
CREATE INDEX idx_dilution_scenarios_scenario_type ON dilution_scenarios(scenario_type);
CREATE INDEX idx_dilution_scenarios_created_at ON dilution_scenarios(created_at);


-- ============================================================================
-- TABLE: corporate_resolutions
-- Purpose: Track board resolutions, approvals, and governance decisions
-- ============================================================================
CREATE TABLE corporate_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Resolution type: board-authorization, shareholder-approval, share-split, warrant-cancellation, etc.
  resolution_type VARCHAR(100) NOT NULL CHECK (
    resolution_type IN (
      'board-authorization',
      'shareholder-approval',
      'share-split',
      'warrant-cancellation',
      'option-acceleration',
      'articles-amendment',
      'director-appointment',
      'audit-committee-approval',
      'compensation-approval',
      'underwriter-selection',
      'other'
    )
  ),
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- Status: draft, approved (by board/shareholders), executed
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'approved', 'executed', 'rejected', 'withdrawn')
  ),
  
  document_url VARCHAR(2048),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_corporate_resolutions_company FOREIGN KEY (company_id) 
    REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_corporate_resolutions_company_id ON corporate_resolutions(company_id);
CREATE INDEX idx_corporate_resolutions_type ON corporate_resolutions(resolution_type);
CREATE INDEX idx_corporate_resolutions_status ON corporate_resolutions(status);


-- ============================================================================
-- TABLE: consent_letters
-- Purpose: Track regulatory and expert consents required for IPO (auditors, lawyers, experts)
-- ============================================================================
CREATE TABLE consent_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  from_entity VARCHAR(255) NOT NULL,
  
  -- Entity type: auditor, lawyer, valuation-expert, other-expert
  entity_type VARCHAR(50) NOT NULL CHECK (
    entity_type IN ('auditor', 'lawyer', 'valuation-expert', 'environmental-expert', 'other-expert')
  ),
  
  -- Consent type: audit-consent, legal-opinion, expert-report, fairness-opinion, etc.
  consent_type VARCHAR(100) NOT NULL,
  
  -- Status: pending, received, rejected, expired
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'received', 'rejected', 'expired', 'withdrawn')
  ),
  
  document_url VARCHAR(2048),
  expiry_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_consent_letters_company FOREIGN KEY (company_id) 
    REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT ck_expiry_date_future CHECK (expiry_date IS NULL OR expiry_date > CURRENT_DATE)
);

CREATE INDEX idx_consent_letters_company_id ON consent_letters(company_id);
CREATE INDEX idx_consent_letters_entity_type ON consent_letters(entity_type);
CREATE INDEX idx_consent_letters_status ON consent_letters(status);
CREATE INDEX idx_consent_letters_expiry_date ON consent_letters(expiry_date);


-- ============================================================================
-- TABLE: listing_requirements
-- Purpose: Track exchange-specific IPO requirements and compliance gaps
-- ============================================================================
CREATE TABLE listing_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  exchange VARCHAR(50) NOT NULL CHECK (exchange IN ('NYSE', 'NASDAQ', 'TSX', 'CSE', 'OTHER')),
  
  -- Minimum public float: percentage and share count
  min_float_current_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  min_float_required_pct DECIMAL(5, 2) NOT NULL,
  
  min_shares_current BIGINT NOT NULL DEFAULT 0,
  min_shares_required BIGINT NOT NULL,
  
  -- Board and lot compliance
  board_lot_compliance BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Gap analysis: structured data on all outstanding requirements
  -- Format: {
  --   "gaps": [
  --     {"requirement": "Min Public Float", "current": 15.5, "required": 25.0, "gap": -9.5, "status": "not-met"},
  --     {"requirement": "Min Share Price", "current": 18.50, "required": 5.00, "gap": 13.50, "status": "met"}
  --   ],
  --   "critical_items": [...],
  --   "timeline": "Q3 2026"
  -- }
  gap_analysis_json JSONB NOT NULL DEFAULT '{}',
  
  validated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_listing_requirements_company FOREIGN KEY (company_id) 
    REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT ck_float_percentages_valid CHECK (
    min_float_current_pct >= 0 AND min_float_current_pct <= 100 AND
    min_float_required_pct > 0 AND min_float_required_pct <= 100
  ),
  CONSTRAINT ck_share_counts_positive CHECK (
    min_shares_current >= 0 AND min_shares_required > 0
  ),
  UNIQUE (company_id, exchange)
);

CREATE INDEX idx_listing_requirements_company_id ON listing_requirements(company_id);
CREATE INDEX idx_listing_requirements_exchange ON listing_requirements(exchange);
CREATE INDEX idx_listing_requirements_validated_at ON listing_requirements(validated_at);


-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: ipo_cost_summary
-- Provides consolidated view of estimated costs and tracking progress
CREATE OR REPLACE VIEW ipo_cost_summary AS
SELECT
  ic.id,
  ic.company_id,
  ic.exchange,
  ic.currency,
  ic.total_estimated,
  COALESCE(SUM(ft.actual_spent), 0) AS total_actual_spent,
  ic.total_estimated - COALESCE(SUM(ft.actual_spent), 0) AS remaining_budget,
  COUNT(DISTINCT ft.id) AS tracking_months,
  MAX(ft.month) AS last_tracked_month,
  ic.created_at,
  ic.updated_at
FROM ipo_costs ic
LEFT JOIN financial_tracking ft ON ic.id = ft.ipo_cost_id
GROUP BY ic.id, ic.company_id, ic.exchange, ic.currency, ic.total_estimated, ic.created_at, ic.updated_at;

-- View: consent_status_summary
-- Status dashboard for all consents by company
CREATE OR REPLACE VIEW consent_status_summary AS
SELECT
  company_id,
  entity_type,
  status,
  COUNT(*) AS consent_count,
  COUNT(CASE WHEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 1 END) AS expiring_soon
FROM consent_letters
GROUP BY company_id, entity_type, status
ORDER BY company_id, entity_type, status;

-- View: listing_requirements_gap_analysis
-- Summary of exchange requirement gaps by company
CREATE OR REPLACE VIEW listing_requirements_gap_analysis AS
SELECT
  lr.company_id,
  lr.exchange,
  lr.min_float_required_pct,
  lr.min_float_current_pct,
  (lr.min_float_required_pct - lr.min_float_current_pct) AS float_gap_pct,
  CASE 
    WHEN lr.min_float_current_pct >= lr.min_float_required_pct THEN 'MET'
    ELSE 'NOT MET'
  END AS float_status,
  lr.board_lot_compliance,
  lr.validated_at,
  lr.updated_at
FROM listing_requirements lr
ORDER BY lr.company_id, lr.exchange;


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on ipo_costs
CREATE OR REPLACE FUNCTION update_ipo_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ipo_costs_updated_at
  BEFORE UPDATE ON ipo_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_ipo_costs_updated_at();

-- Trigger: Update updated_at on financial_tracking
CREATE OR REPLACE FUNCTION update_financial_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_financial_tracking_updated_at
  BEFORE UPDATE ON financial_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_tracking_updated_at();

-- Trigger: Update updated_at on corporate_resolutions
CREATE OR REPLACE FUNCTION update_corporate_resolutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_corporate_resolutions_updated_at
  BEFORE UPDATE ON corporate_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_corporate_resolutions_updated_at();

-- Trigger: Update updated_at on consent_letters
CREATE OR REPLACE FUNCTION update_consent_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consent_letters_updated_at
  BEFORE UPDATE ON consent_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_letters_updated_at();

-- Trigger: Update updated_at on listing_requirements
CREATE OR REPLACE FUNCTION update_listing_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listing_requirements_updated_at
  BEFORE UPDATE ON listing_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_requirements_updated_at();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE ipo_costs IS 'Central cost tracking for all IPO-related expenses including legal, accounting, underwriting, printing, filing, and contingency reserves';

COMMENT ON TABLE financial_tracking IS 'Monthly budget vs. actual expense tracking to manage cash flow and identify cost overruns during IPO process';

COMMENT ON TABLE dilution_scenarios IS 'Cap table scenario modeling to analyze ownership dilution impact under various IPO transaction structures and financing rounds';

COMMENT ON TABLE corporate_resolutions IS 'Board and shareholder resolutions required for IPO, including board authorizations, shareholder approvals, and governance decisions';

COMMENT ON TABLE consent_letters IS 'Management of expert and regulatory consents (auditor consent, legal opinions, fairness opinions) required by securities regulators and underwriters';

COMMENT ON TABLE listing_requirements IS 'Exchange-specific listing standards tracking (minimum public float, share count, board lot compliance) with gap analysis against company current state';
