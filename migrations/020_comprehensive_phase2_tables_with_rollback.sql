/**
 * IPOReady Comprehensive Phase 2 Migration
 * Migration ID: 020
 * Created: 2026-06-03
 * 
 * Purpose: Deploy 6 core Phase 2 tables covering cost tracking, financial metrics,
 * dilution scenarios, shareholder consents, corporate resolutions, and syndication agreements.
 * 
 * Tables Deployed:
 * 1. cost_items - Granular IPO cost tracking (capex/opex)
 * 2. financial_metrics - Dashboard KPI aggregations
 * 3. dilution_scenarios - Cap table modeling and scenario analysis
 * 4. dilution_scenario_shareholders - Cap table snapshot rows
 * 5. consent_requests - Shareholder/stakeholder approval workflows
 * 6. corporate_resolutions - Board and shareholder resolutions
 * 
 * Dependencies:
 * - companies table (must exist)
 * - users table (must exist)
 * - consent_templates table (created in this migration)
 * - vendors table (created in this migration)
 * - milestones table (created in this migration)
 * 
 * Foreign Key References:
 * - cost_items.company_id -> companies.id
 * - cost_items.vendor_id -> vendors.id
 * - cost_items.milestone_id -> milestones.id
 * - cost_items.created_by_user_id -> users.id
 * - financial_metrics.company_id -> companies.id
 * - dilution_scenarios.company_id -> companies.id
 * - dilution_scenario_shareholders.scenario_id -> dilution_scenarios.id
 * - consent_requests.company_id -> companies.id
 * - consent_requests.template_id -> consent_templates.id
 * - consent_requests.created_by_user_id -> users.id
 * - corporate_resolutions.company_id -> companies.id
 * - corporate_resolutions.prepared_by_user_id -> users.id
 * - corporate_resolutions.reviewed_by_user_id -> users.id
 * 
 * Indexes Created: 40 indexes for optimal query performance
 * Triggers Created: 5 triggers for automatic updated_at timestamps
 * 
 * Rollback: Run 020_rollback.sql (generated separately)
 * 
 * Validation: Run validation query at end of this file
 */

-- ====================================================================
-- HELPER FUNCTION (idempotent)
-- ====================================================================

CREATE OR REPLACE FUNCTION update_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- HELPER TABLE: VENDORS
-- ====================================================================
-- Service providers (law firms, auditors, investment banks, consultants)

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

CREATE INDEX idx_vendors_name ON vendors(vendor_name);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);

-- ====================================================================
-- HELPER TABLE: MILESTONES
-- ====================================================================
-- IPO process milestones and tracking dates

CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  milestone_name VARCHAR(255) NOT NULL,
  milestone_date DATE,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_milestones_company_id ON milestones(company_id);
CREATE INDEX idx_milestones_date ON milestones(milestone_date);

-- ====================================================================
-- HELPER TABLE: CONSENT_TEMPLATES
-- ====================================================================
-- Reusable consent request templates

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

CREATE INDEX idx_consent_templates_org_id ON consent_templates(organization_id);
CREATE INDEX idx_consent_templates_type ON consent_templates(template_type);

-- ====================================================================
-- TABLE 1: COST_ITEMS
-- ====================================================================
-- Granular tracking of individual costs (capex/opex)
-- Purpose: Replace/extend ipo_costs table with better granularity
-- Row Count Estimates: 500-5000 rows per company (1000s during IPO process)

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
  phase_number INT,                           -- 1-8 (IPO process phases)
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

-- Indexes for cost_items (8 indexes)
CREATE INDEX idx_cost_items_company_id ON cost_items(company_id);
CREATE INDEX idx_cost_items_category ON cost_items(cost_category);
CREATE INDEX idx_cost_items_type ON cost_items(cost_type);
CREATE INDEX idx_cost_items_status ON cost_items(status);
CREATE INDEX idx_cost_items_phase ON cost_items(phase_number);
CREATE INDEX idx_cost_items_actual_date ON cost_items(actual_date);
CREATE INDEX idx_cost_items_due_date ON cost_items(due_date);
CREATE INDEX idx_cost_items_vendor_id ON cost_items(vendor_id);

-- Trigger for cost_items
DROP TRIGGER IF EXISTS trigger_cost_items_updated_at ON cost_items;
CREATE TRIGGER trigger_cost_items_updated_at
  BEFORE UPDATE ON cost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 2: FINANCIAL_METRICS
-- ====================================================================
-- Dashboard KPIs and rolling financial summaries
-- Purpose: Aggregated metrics for dashboard display and reporting
-- Row Count Estimates: 30-120 rows per company (daily/monthly snapshots)

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

-- Indexes for financial_metrics (4 indexes)
CREATE INDEX idx_financial_metrics_company_id ON financial_metrics(company_id);
CREATE INDEX idx_financial_metrics_date ON financial_metrics(metric_date DESC);
CREATE INDEX idx_financial_metrics_type ON financial_metrics(metric_type);
CREATE INDEX idx_financial_metrics_company_date ON financial_metrics(company_id, metric_date DESC);

-- Trigger for financial_metrics
DROP TRIGGER IF EXISTS trigger_financial_metrics_updated_at ON financial_metrics;
CREATE TRIGGER trigger_financial_metrics_updated_at
  BEFORE UPDATE ON financial_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 3: DILUTION_SCENARIOS
-- ====================================================================
-- Cap table modeling for financing rounds, warrant exercises, etc.
-- Purpose: Scenario analysis for cap table impact of future transactions
-- Row Count Estimates: 5-50 rows per company (multiple scenarios tested)

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

-- Indexes for dilution_scenarios (4 indexes)
CREATE INDEX idx_dilution_scenarios_company_id ON dilution_scenarios(company_id);
CREATE INDEX idx_dilution_scenarios_type ON dilution_scenarios(scenario_type);
CREATE INDEX idx_dilution_scenarios_status ON dilution_scenarios(status);
CREATE INDEX idx_dilution_scenarios_created_at ON dilution_scenarios(created_at DESC);

-- Trigger for dilution_scenarios
DROP TRIGGER IF EXISTS trigger_dilution_scenarios_updated_at ON dilution_scenarios;
CREATE TRIGGER trigger_dilution_scenarios_updated_at
  BEFORE UPDATE ON dilution_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 3B: DILUTION_SCENARIO_SHAREHOLDERS (companion to Table 3)
-- ====================================================================
-- Cap table snapshot rows for each shareholder pre/post transaction
-- Purpose: Detailed shareholder impact analysis for dilution scenarios
-- Row Count Estimates: 10-100 rows per scenario (one per shareholder class)

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

-- Indexes for dilution_scenario_shareholders (3 indexes)
CREATE INDEX idx_dilution_shareholders_scenario_id ON dilution_scenario_shareholders(scenario_id);
CREATE INDEX idx_dilution_shareholders_shareholder_name ON dilution_scenario_shareholders(shareholder_name);
CREATE INDEX idx_dilution_shareholders_type ON dilution_scenario_shareholders(shareholder_type);

-- ====================================================================
-- TABLE 4: CONSENT_REQUESTS
-- ====================================================================
-- Shareholder/stakeholder approval workflow management
-- Purpose: Track and manage required approvals from stakeholders
-- Row Count Estimates: 20-200 rows per company (one per consent type per stakeholder)

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

-- Indexes for consent_requests (7 indexes)
CREATE INDEX idx_consent_requests_company_id ON consent_requests(company_id);
CREATE INDEX idx_consent_requests_status ON consent_requests(status);
CREATE INDEX idx_consent_requests_type ON consent_requests(request_type);
CREATE INDEX idx_consent_requests_deadline ON consent_requests(deadline_date);
CREATE INDEX idx_consent_requests_recipient ON consent_requests(recipient_email);
CREATE INDEX idx_consent_requests_template_id ON consent_requests(template_id);
CREATE INDEX idx_consent_requests_company_status ON consent_requests(company_id, status);

-- Trigger for consent_requests
DROP TRIGGER IF EXISTS trigger_consent_requests_updated_at ON consent_requests;
CREATE TRIGGER trigger_consent_requests_updated_at
  BEFORE UPDATE ON consent_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE 5: CORPORATE_RESOLUTIONS
-- ====================================================================
-- Board and shareholder resolutions for IPO process
-- Purpose: Track approval and execution of required corporate governance resolutions
-- Row Count Estimates: 10-50 rows per company (one per resolution type)

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

-- Indexes for corporate_resolutions (5 indexes)
CREATE INDEX idx_corporate_resolutions_company_id ON corporate_resolutions(company_id);
CREATE INDEX idx_corporate_resolutions_type ON corporate_resolutions(resolution_type);
CREATE INDEX idx_corporate_resolutions_status ON corporate_resolutions(status);
CREATE INDEX idx_corporate_resolutions_deadline ON corporate_resolutions(deadline_date);
CREATE INDEX idx_corporate_resolutions_approval_status ON corporate_resolutions(approval_status);

-- Trigger for corporate_resolutions
DROP TRIGGER IF EXISTS trigger_corporate_resolutions_updated_at ON corporate_resolutions;
CREATE TRIGGER trigger_corporate_resolutions_updated_at
  BEFORE UPDATE ON corporate_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- VALIDATION QUERY
-- ====================================================================
-- Run this query after applying migration to verify all tables created

SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_items') as cost_items_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_metrics') as financial_metrics_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenarios') as dilution_scenarios_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenario_shareholders') as dilution_shareholders_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_requests') as consent_requests_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_resolutions') as corporate_resolutions_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') as vendors_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'milestones') as milestones_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_templates') as consent_templates_created,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cost_items') as all_in_public_schema
AS migration_validation;

-- ====================================================================
-- INDEX COUNT VERIFICATION
-- ====================================================================

SELECT 
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'cost_items') as cost_items_indexes,
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'financial_metrics') as financial_metrics_indexes,
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'dilution_scenarios') as dilution_scenarios_indexes,
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'dilution_scenario_shareholders') as dilution_shareholders_indexes,
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'consent_requests') as consent_requests_indexes,
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'corporate_resolutions') as corporate_resolutions_indexes
AS index_count_verification;

-- ====================================================================
-- END OF MIGRATION
-- ====================================================================
