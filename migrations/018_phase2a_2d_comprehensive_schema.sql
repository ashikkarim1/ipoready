/**
 * IPOReady Phase 2A-2D Comprehensive Schema
 * 
 * Covers:
 * - Phase 2A: Cost tracking & financial metrics
 * - Phase 2B: Dilution scenarios & cap table modeling
 * - Phase 2C: Syndication agreements & templates
 * - Phase 2D: Consent requests & resolutions
 * 
 * Tables:
 * 1. cost_items (capex/opex tracking)
 * 2. financial_metrics (dashboard KPIs)
 * 3. dilution_scenarios (cap table modeling)
 * 4. dilution_scenario_shareholders (cap table snapshot rows)
 * 5. consent_requests (approval workflows)
 * 6. corporate_resolutions (board resolutions)
 * 7. syndication_agreements (syndication templates & execution)
 * 8. listing_requirements (exchange validation)
 * 9. listing_requirement_checklist (per-company tracking)
 * 10. financial_kpi_dashboard (aggregated metrics)
 */

-- ====================================================================
-- TABLE 1: COST_ITEMS
-- ====================================================================
-- Granular tracking of individual costs (capex/opex)
-- Replaces/extends ipo_costs with better granularity

CREATE TABLE IF NOT EXISTS cost_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Cost classification
  cost_category VARCHAR(100) NOT NULL,         -- 'legal', 'audit', 'accounting', 'ib', 'consulting', 
                                                -- 'printing', 'roadshow', 'listing_fees', 'employee_related', 'other'
  cost_type VARCHAR(50) NOT NULL,              -- 'capex', 'opex', 'one_time_fee'
  cost_nature VARCHAR(50) NOT NULL,            -- 'internal_labor', 'external_vendor', 'direct_cost', 'estimated_contingency'
  
  description TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,  -- Link to vendor master
  vendor_name VARCHAR(255),                   -- Denormalized for convenience
  
  -- Amount tracking
  amount_usd DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- If labor
  labor_hours DECIMAL(10,2),
  hourly_rate_usd DECIMAL(10,2),
  resource_name VARCHAR(100),                 -- Who performed the work
  
  -- Timeline
  phase_number INT,                           -- 1-8
  phase_name VARCHAR(100),
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  
  planned_date DATE,
  actual_date DATE,
  due_date DATE,
  
  -- Status & approval
  status VARCHAR(50) DEFAULT 'estimated',     -- 'estimated', 'committed', 'incurred', 'invoiced', 'paid'
  approval_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Document management
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  notes TEXT,
  tags JSONB,                                 -- ["legal", "urgent", "vendor_specific"]
  
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cost_items_company_id ON cost_items(company_id);
CREATE INDEX idx_cost_items_category ON cost_items(cost_category);
CREATE INDEX idx_cost_items_type ON cost_items(cost_type);
CREATE INDEX idx_cost_items_status ON cost_items(status);
CREATE INDEX idx_cost_items_phase ON cost_items(phase_number);
CREATE INDEX idx_cost_items_actual_date ON cost_items(actual_date);
CREATE INDEX idx_cost_items_due_date ON cost_items(due_date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_cost_items_updated_at ON cost_items;
CREATE TRIGGER trigger_cost_items_updated_at
  BEFORE UPDATE ON cost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 2: FINANCIAL_METRICS
-- ====================================================================
-- Dashboard KPIs and rolling financial summaries

CREATE TABLE IF NOT EXISTS financial_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  metric_date DATE NOT NULL,                  -- As-of date for this snapshot
  metric_type VARCHAR(100) NOT NULL,          -- 'monthly_summary', 'ytd_summary', 'daily_snapshot', 'forecast'
  
  -- Cost aggregations
  total_ipo_costs_usd DECIMAL(15,2),          -- Sum of all cost_items
  estimated_remaining_usd DECIMAL(15,2),
  estimated_total_ipo_cost_usd DECIMAL(15,2),
  
  -- Category breakdowns
  legal_costs_usd DECIMAL(12,2),
  audit_costs_usd DECIMAL(12,2),
  accounting_costs_usd DECIMAL(12,2),
  ib_costs_usd DECIMAL(12,2),
  consulting_costs_usd DECIMAL(12,2),
  other_costs_usd DECIMAL(12,2),
  
  -- Budget tracking
  total_budget_usd DECIMAL(15,2),
  budget_remaining_usd DECIMAL(15,2),
  budget_variance_pct DECIMAL(5,2),           -- (actual - budget) / budget * 100
  budget_status VARCHAR(50),                  -- 'on_track', 'over_budget', 'under_budget'
  
  -- Timing metrics
  days_since_phase_1_start INT,
  estimated_days_to_listing INT,
  phase_completion_pct INT,                   -- 0-100 of current phase
  
  -- Cash flow
  cash_outflow_this_month_usd DECIMAL(15,2),
  monthly_burn_rate_usd DECIMAL(15,2),
  
  -- Team metrics
  team_hours_invested INT,
  team_utilization_pct DECIMAL(5,2),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, metric_date, metric_type)
);

CREATE INDEX idx_financial_metrics_company_id ON financial_metrics(company_id);
CREATE INDEX idx_financial_metrics_date ON financial_metrics(metric_date DESC);
CREATE INDEX idx_financial_metrics_type ON financial_metrics(metric_type);

DROP TRIGGER IF EXISTS trigger_financial_metrics_updated_at ON financial_metrics;
CREATE TRIGGER trigger_financial_metrics_updated_at
  BEFORE UPDATE ON financial_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 3: DILUTION_SCENARIOS
-- ====================================================================
-- Cap table modeling for financing rounds, warrant exercises, etc.

CREATE TABLE IF NOT EXISTS dilution_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  scenario_name VARCHAR(255) NOT NULL,
  scenario_type VARCHAR(50) NOT NULL,        -- 'new_financing', 'warrant_exercise', 'option_vesting', 
                                               -- 'convertible_conversion', 'custom_transaction'
  description TEXT,
  
  -- Scenario parameters
  new_shares_issued DECIMAL(18,6),
  issue_price_per_share_usd DECIMAL(15,6),
  total_raise_usd DECIMAL(15,2),
  
  warrant_conversion_rate DECIMAL(10,6),     -- Shares per warrant exercised
  warrant_exercise_pct DECIMAL(5,2),         -- % of warrants that convert (0-100)
  
  option_pool_increase_pct DECIMAL(5,2),     -- % increase to option pool
  convertible_note_details JSONB,            -- Array of {conversion_rate, principal, accrued_interest}
  
  -- Pre-transaction snapshot
  pre_fully_diluted_shares DECIMAL(18,6),
  pre_post_money_valuation_usd DECIMAL(15,2),
  
  -- Post-transaction snapshot
  post_fully_diluted_shares DECIMAL(18,6),
  post_post_money_valuation_usd DECIMAL(15,2),
  
  -- Dilution impact
  founder_dilution_pct DECIMAL(5,2),
  employee_dilution_pct DECIMAL(5,2),
  series_a_holder_dilution_pct DECIMAL(5,2),
  
  -- Approval & execution
  status VARCHAR(50) DEFAULT 'draft',         -- 'draft', 'reviewed', 'approved', 'executed', 'archived'
  approved_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dilution_scenarios_company_id ON dilution_scenarios(company_id);
CREATE INDEX idx_dilution_scenarios_type ON dilution_scenarios(scenario_type);
CREATE INDEX idx_dilution_scenarios_status ON dilution_scenarios(status);

DROP TRIGGER IF EXISTS trigger_dilution_scenarios_updated_at ON dilution_scenarios;
CREATE TRIGGER trigger_dilution_scenarios_updated_at
  BEFORE UPDATE ON dilution_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 4: DILUTION_SCENARIO_SHAREHOLDERS
-- ====================================================================
-- Cap table snapshot rows for each shareholder pre/post transaction

CREATE TABLE IF NOT EXISTS dilution_scenario_shareholders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES dilution_scenarios(id) ON DELETE CASCADE,
  
  shareholder_name VARCHAR(255) NOT NULL,
  shareholder_type VARCHAR(50),               -- 'founder', 'employee', 'investor', 'employee_pool', 'other'
  share_class VARCHAR(50),                    -- 'Common', 'Series A', 'Series B', etc.
  
  -- Pre-transaction
  shares_pre DECIMAL(18,6),
  ownership_pct_pre DECIMAL(5,2),
  
  -- Post-transaction
  shares_post DECIMAL(18,6),
  ownership_pct_post DECIMAL(5,2),
  
  -- Dilution
  dilution_pct DECIMAL(5,2),                  -- (post_ownership - pre_ownership) / pre_ownership * 100
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dilution_shareholders_scenario_id ON dilution_scenario_shareholders(scenario_id);
CREATE INDEX idx_dilution_shareholders_shareholder_name ON dilution_scenario_shareholders(shareholder_name);

-- ====================================================================
-- TABLE 5: CONSENT_REQUESTS
-- ====================================================================
-- Shareholder/stakeholder approval workflow management

CREATE TABLE IF NOT EXISTS consent_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  request_type VARCHAR(100) NOT NULL,         -- 'director_consent', 'shareholder_consent', 'officer_consent',
                                               -- 'lender_consent', 'vendor_consent', 'founder_lock_up', 'other'
  subject_matter VARCHAR(255),                -- e.g., "Related Party Transaction", "IPO Participation"
  description TEXT,
  
  -- Recipient details
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_type VARCHAR(50),                 -- 'individual', 'entity', 'group'
  
  -- Status workflow
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'sent', 'viewed', 'signed', 'approved', 'rejected', 'expired'
  
  -- Timeline
  sent_date TIMESTAMP WITH TIME ZONE,
  signed_date TIMESTAMP WITH TIME ZONE,
  signed_by_name VARCHAR(255),
  signature_method VARCHAR(50),               -- 'esign', 'email', 'in_person', 'other'
  
  deadline_date DATE,
  reminder_sent_count INT DEFAULT 0,
  last_reminder_date TIMESTAMP WITH TIME ZONE,
  
  expiry_date DATE,
  
  -- Document management
  template_id UUID REFERENCES consent_templates(id) ON DELETE SET NULL,
  document_url TEXT,                          -- Signed document S3 URL
  
  -- Rejection handling
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  can_resubmit BOOLEAN DEFAULT TRUE,
  
  notes TEXT,
  
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consent_requests_company_id ON consent_requests(company_id);
CREATE INDEX idx_consent_requests_status ON consent_requests(status);
CREATE INDEX idx_consent_requests_type ON consent_requests(request_type);
CREATE INDEX idx_consent_requests_deadline ON consent_requests(deadline_date);
CREATE INDEX idx_consent_requests_recipient ON consent_requests(recipient_email);

DROP TRIGGER IF EXISTS trigger_consent_requests_updated_at ON consent_requests;
CREATE TRIGGER trigger_consent_requests_updated_at
  BEFORE UPDATE ON consent_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 6: CORPORATE_RESOLUTIONS
-- ====================================================================
-- Board and shareholder resolutions for IPO process

CREATE TABLE IF NOT EXISTS corporate_resolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  resolution_type VARCHAR(100) NOT NULL,      -- 'board_authorization', 'share_split', 'stock_option_plan',
                                               -- 'director_appointment', 'dividend_policy', 'related_party',
                                               -- 'shareholder_approval', 'other'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Governance
  board_approval_required BOOLEAN DEFAULT TRUE,
  shareholder_approval_required BOOLEAN DEFAULT FALSE,
  
  approval_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'draft', 'approved', 'rejected'
  board_approved_at TIMESTAMP WITH TIME ZONE,
  board_vote_count INT,
  board_vote_in_favor INT,
  shareholder_approved_at TIMESTAMP WITH TIME ZONE,
  shareholder_vote_pct DECIMAL(5,2),
  
  -- Timeline
  phase_required INT,
  deadline_date DATE,
  resolution_passed_date DATE,
  
  -- Document management
  resolution_text_url TEXT,
  board_minutes_url TEXT,
  shareholder_vote_record_url TEXT,
  
  status VARCHAR(50) DEFAULT 'draft',         -- 'draft', 'pending_approval', 'approved', 'executed', 'archived'
  
  prepared_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_corporate_resolutions_company_id ON corporate_resolutions(company_id);
CREATE INDEX idx_corporate_resolutions_type ON corporate_resolutions(resolution_type);
CREATE INDEX idx_corporate_resolutions_status ON corporate_resolutions(status);
CREATE INDEX idx_corporate_resolutions_deadline ON corporate_resolutions(deadline_date);

DROP TRIGGER IF EXISTS trigger_corporate_resolutions_updated_at ON corporate_resolutions;
CREATE TRIGGER trigger_corporate_resolutions_updated_at
  BEFORE UPDATE ON corporate_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 7: SYNDICATION_AGREEMENTS
-- ====================================================================
-- Underwriting syndicate terms and execution tracking

CREATE TABLE IF NOT EXISTS syndication_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  agreement_type VARCHAR(100) NOT NULL,       -- 'firm_commitment', 'best_efforts', 'standby', 'all_or_none'
  agreement_name VARCHAR(255),
  description TEXT,
  
  -- Underwriting syndicate
  lead_underwriter VARCHAR(255),              -- Primary bank
  co_underwriter_names TEXT,                  -- Comma-separated list
  member_count INT,                           -- Total members in syndicate
  
  -- Economic terms
  gross_spread_bps INT,                       -- Basis points (e.g., 350 bps = 3.5%)
  net_proceeds_usd DECIMAL(15,2),
  
  -- Allotment allocation
  allocation_structure JSONB,                 -- {member_name: allocation_bps, ...}
  
  -- Timeline
  execution_date DATE,
  closing_date DATE,
  lockup_period_days INT,                     -- Days before insiders can sell
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',         -- 'draft', 'negotiating', 'signed', 'executed', 'closed'
  
  signed_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Document management
  agreement_url TEXT,
  prospectus_url TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_syndication_agreements_company_id ON syndication_agreements(company_id);
CREATE INDEX idx_syndication_agreements_type ON syndication_agreements(agreement_type);
CREATE INDEX idx_syndication_agreements_status ON syndication_agreements(status);

DROP TRIGGER IF EXISTS trigger_syndication_agreements_updated_at ON syndication_agreements;
CREATE TRIGGER trigger_syndication_agreements_updated_at
  BEFORE UPDATE ON syndication_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 8: LISTING_REQUIREMENTS
-- ====================================================================
-- Exchange-specific regulatory requirements

CREATE TABLE IF NOT EXISTS listing_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  exchange_code VARCHAR(20) NOT NULL,         -- 'TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC'
  
  requirement_code VARCHAR(100) NOT NULL,     -- Unique identifier (e.g., TSX_MIN_SHARES_OUTSTANDING)
  requirement_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  category VARCHAR(100),                      -- 'governance', 'financial', 'disclosure', 'operational', 'audit'
  requirement_level VARCHAR(50),              -- 'mandatory', 'best_practice', 'conditional'
  
  -- Compliance status
  status VARCHAR(50) DEFAULT 'not_started',   -- 'not_started', 'in_progress', 'completed', 'n_a', 'exemption_approved'
  completion_pct INT DEFAULT 0,               -- 0-100
  
  is_compliant BOOLEAN,                       -- NULL=unknown, TRUE=compliant, FALSE=non-compliant
  exemption_requested BOOLEAN DEFAULT FALSE,
  exemption_approved BOOLEAN DEFAULT FALSE,
  exemption_reason TEXT,
  
  -- Validation
  validation_method VARCHAR(255),
  validation_date DATE,
  validator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timeline
  deadline_date DATE,
  
  supporting_doc_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, exchange_code, requirement_code)
);

CREATE INDEX idx_listing_requirements_company_id ON listing_requirements(company_id);
CREATE INDEX idx_listing_requirements_exchange ON listing_requirements(exchange_code);
CREATE INDEX idx_listing_requirements_status ON listing_requirements(status);
CREATE INDEX idx_listing_requirements_compliance ON listing_requirements(is_compliant);
CREATE INDEX idx_listing_requirements_deadline ON listing_requirements(deadline_date);

DROP TRIGGER IF EXISTS trigger_listing_requirements_updated_at ON listing_requirements;
CREATE TRIGGER trigger_listing_requirements_updated_at
  BEFORE UPDATE ON listing_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 9: LISTING_REQUIREMENT_CHECKLIST
-- ====================================================================
-- Company-specific tracking for listing requirements

CREATE TABLE IF NOT EXISTS listing_requirement_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES listing_requirements(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'not_started',
  completion_pct INT DEFAULT 0,
  
  -- Responsibility
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timeline
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Tracking
  evidence_url TEXT,                          -- Document URL showing compliance
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, requirement_id)
);

CREATE INDEX idx_listing_checklist_company_id ON listing_requirement_checklist(company_id);
CREATE INDEX idx_listing_checklist_requirement_id ON listing_requirement_checklist(requirement_id);
CREATE INDEX idx_listing_checklist_assigned_to ON listing_requirement_checklist(assigned_to_user_id);
CREATE INDEX idx_listing_checklist_status ON listing_requirement_checklist(status);

DROP TRIGGER IF EXISTS trigger_listing_checklist_updated_at ON listing_requirement_checklist;
CREATE TRIGGER trigger_listing_checklist_updated_at
  BEFORE UPDATE ON listing_requirement_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 10: FINANCIAL_KPI_DASHBOARD
-- ====================================================================
-- Aggregated KPIs for dashboard display

CREATE TABLE IF NOT EXISTS financial_kpi_dashboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  snapshot_date DATE NOT NULL,                -- As-of date for this snapshot
  
  -- Spend tracking
  total_ipo_costs_to_date_usd DECIMAL(15,2),
  estimated_total_ipo_costs_usd DECIMAL(15,2),
  remaining_budget_usd DECIMAL(15,2),
  budget_burn_rate_usd_per_month DECIMAL(12,2),
  
  -- Phasing
  current_phase INT,
  current_phase_completion_pct INT,
  estimated_days_to_listing INT,
  
  -- Financial health
  runway_months DECIMAL(5,1),                 -- Estimated months at current burn rate
  cash_required_for_ipo_usd DECIMAL(15,2),
  
  -- Dilution
  fully_diluted_shares_millions DECIMAL(10,2),
  latest_valuation_usd DECIMAL(15,2),
  estimated_ipo_share_price_usd DECIMAL(10,2),
  estimated_ipo_proceeds_usd DECIMAL(15,2),
  
  -- Governance
  board_size INT,
  independent_directors_pct DECIMAL(5,2),
  
  -- Legal & compliance
  open_litigation_count INT,
  outstanding_consents_count INT,
  missing_resolutions_count INT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, snapshot_date)
);

CREATE INDEX idx_kpi_dashboard_company_id ON financial_kpi_dashboard(company_id);
CREATE INDEX idx_kpi_dashboard_date ON financial_kpi_dashboard(snapshot_date DESC);

DROP TRIGGER IF EXISTS trigger_kpi_dashboard_updated_at ON financial_kpi_dashboard;
CREATE TRIGGER trigger_kpi_dashboard_updated_at
  BEFORE UPDATE ON financial_kpi_dashboard
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- HELPER TABLES (if not already exist)
-- ====================================================================

-- Consent templates
CREATE TABLE IF NOT EXISTS consent_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,                       -- Multi-tenant: who owns this template
  
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100),
  description TEXT,
  
  template_body TEXT NOT NULL,                -- HTML/markdown of template
  placeholders JSONB,                         -- {field_name: field_label, ...}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors/service providers
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  vendor_name VARCHAR(255) NOT NULL,
  vendor_type VARCHAR(100),                   -- 'law_firm', 'audit_firm', 'ib_bank', 'consulting', 'other'
  
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_person VARCHAR(255),
  
  website_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  milestone_name VARCHAR(255) NOT NULL,
  milestone_date DATE,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- TRIGGER FOR GENERIC updated_at (if not already exist)
-- ====================================================================

CREATE OR REPLACE FUNCTION update_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- SEED DATA STRUCTURE (commented out for manual insertion)
-- ====================================================================

/*
-- Example cost_items seed data
INSERT INTO cost_items (company_id, cost_category, cost_type, cost_nature, description, amount_usd, phase_number, status) VALUES
('{COMPANY_UUID}', 'legal', 'capex', 'external_vendor', 'External counsel - S1 preparation', 250000.00, 4, 'estimated'),
('{COMPANY_UUID}', 'audit', 'capex', 'external_vendor', 'Big Four audit firm engagement', 350000.00, 3, 'estimated'),
('{COMPANY_UUID}', 'ib', 'capex', 'external_vendor', 'Investment banking underwriting', 500000.00, 5, 'estimated');

-- Example dilution_scenarios seed data
INSERT INTO dilution_scenarios (company_id, scenario_name, scenario_type, description, new_shares_issued, issue_price_per_share_usd, total_raise_usd, pre_fully_diluted_shares, post_fully_diluted_shares, status) VALUES
('{COMPANY_UUID}', 'Series C @ 2x Series B', 'new_financing', 'Hypothetical $100M Series C', 10000000, 10.00, 100000000, 100000000, 110000000, 'draft');

-- Example consent_requests seed data
INSERT INTO consent_requests (company_id, request_type, subject_matter, recipient_name, recipient_email, status, deadline_date) VALUES
('{COMPANY_UUID}', 'director_consent', 'IPO Participation Agreement', 'John Director', 'john@company.com', 'pending', '2025-03-31');

-- Example corporate_resolutions seed data
INSERT INTO corporate_resolutions (company_id, resolution_type, title, board_approval_required, status) VALUES
('{COMPANY_UUID}', 'board_authorization', 'Board authorization to pursue IPO', TRUE, 'pending');

-- Example listing_requirements seed data
INSERT INTO listing_requirements (company_id, exchange_code, requirement_code, requirement_name, category, status) VALUES
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_QUANT', 'Quantitative listing standards', 'financial', 'in_progress'),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_GOV', 'Board and committee composition', 'governance', 'in_progress');
*/

-- ====================================================================
-- VALIDATION
-- ====================================================================

SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_items') as cost_items_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_metrics') as financial_metrics_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenarios') as dilution_scenarios_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenario_shareholders') as dilution_shareholders_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_requests') as consent_requests_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_resolutions') as corporate_resolutions_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'syndication_agreements') as syndication_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_requirements') as listing_requirements_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_requirement_checklist') as listing_checklist_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_kpi_dashboard') as kpi_dashboard_created;
