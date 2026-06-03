/**
 * IPO COSTS AND FINANCIAL TRACKING SYSTEM
 * 
 * New tables for Phase 2A:
 * - ipo_costs: Labor hours, hard costs, timeline tracking
 * - financial_tracking: Monthly budget vs actual comparison
 * - dilution_scenarios: Cap table snapshots with warrants/financing
 * - listing_requirements: Exchange-specific validation
 * - corporate_resolutions: Board resolutions and approvals
 * - consent_letters: Shareholder/stakeholder consents
 */

-- ====================================================================
-- TABLE 1: IPO_COSTS
-- ====================================================================
-- Tracks all costs associated with the IPO process
-- Includes labor (internal hours), hard costs (legal, audit, etc.), and timeline

CREATE TABLE IF NOT EXISTS ipo_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cost_category VARCHAR(100) NOT NULL,         -- 'legal', 'audit', 'investment_banking', 'accounting', 'consulting', 'underwriting', 'printing', 'roadshow', 'listing_fees', 'other'
  cost_type VARCHAR(50) NOT NULL,              -- 'labor_hours', 'hard_cost', 'estimated_fee'
  description VARCHAR(255),                    -- e.g., "Associate counsel hours", "External auditor retainer"
  
  -- Labor Hours Fields
  labor_hours DECIMAL(10,2),                   -- Total hours spent (NULL if hard cost)
  hourly_rate_usd DECIMAL(10,2),               -- USD per hour for internal labor
  resource_name VARCHAR(100),                  -- "CFO", "General Counsel", "Internal Team", etc.
  
  -- Hard Cost Fields
  hard_cost_usd DECIMAL(15,2),                 -- Total hard cost in USD (NULL if labor hours)
  cost_date DATE,                              -- When cost was incurred/planned
  vendor_name VARCHAR(255),                    -- "BigLaw Firm", "Deloitte", etc.
  invoice_number VARCHAR(100),
  invoice_url TEXT,                            -- S3 or doc store URL
  
  -- Timeline & Milestone
  phase_id INT,                                -- Which phase this cost maps to (1-8)
  milestone_name VARCHAR(100),                 -- e.g., "Due Diligence Complete", "SEC Filing"
  planned_completion_date DATE,                -- When this cost is planned
  actual_completion_date DATE,                 -- When it actually completed
  
  -- Tracking
  status VARCHAR(50) DEFAULT 'estimated',      -- 'estimated', 'incurred', 'paid', 'pending_approval'
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ipo_costs_company_id ON ipo_costs(company_id);
CREATE INDEX idx_ipo_costs_category ON ipo_costs(cost_category);
CREATE INDEX idx_ipo_costs_phase_id ON ipo_costs(phase_id);
CREATE INDEX idx_ipo_costs_status ON ipo_costs(status);
CREATE INDEX idx_ipo_costs_cost_date ON ipo_costs(cost_date);
CREATE INDEX idx_ipo_costs_milestone ON ipo_costs(milestone_name);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_ipo_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ipo_costs_updated_at ON ipo_costs;
CREATE TRIGGER trigger_ipo_costs_updated_at
  BEFORE UPDATE ON ipo_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_ipo_costs_updated_at();

-- ====================================================================
-- TABLE 2: FINANCIAL_TRACKING
-- ====================================================================
-- Monthly budget vs actual tracking for IPO readiness spending

CREATE TABLE IF NOT EXISTS financial_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_month INT NOT NULL,                   -- 1-12
  fiscal_year INT NOT NULL,
  
  -- Budget columns
  total_budget_usd DECIMAL(15,2),              -- Total planned budget
  legal_budget_usd DECIMAL(12,2),
  audit_budget_usd DECIMAL(12,2),
  accounting_budget_usd DECIMAL(12,2),
  investment_banking_budget_usd DECIMAL(12,2),
  consulting_budget_usd DECIMAL(12,2),
  other_budget_usd DECIMAL(12,2),
  
  -- Actual spending columns
  total_actual_usd DECIMAL(15,2),              -- Total actual spending
  legal_actual_usd DECIMAL(12,2),
  audit_actual_usd DECIMAL(12,2),
  accounting_actual_usd DECIMAL(12,2),
  investment_banking_actual_usd DECIMAL(12,2),
  consulting_actual_usd DECIMAL(12,2),
  other_actual_usd DECIMAL(12,2),
  
  -- Variance analysis
  total_variance_usd DECIMAL(15,2),            -- actual - budget
  variance_percentage DECIMAL(5,2),            -- (actual - budget) / budget * 100
  variance_status VARCHAR(50),                 -- 'on_budget', 'over_budget', 'under_budget'
  
  -- Tracking
  forecast_completion BOOLEAN DEFAULT FALSE,   -- Whether this month is finalized
  notes TEXT,                                  -- Explanatory notes for variances
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year, fiscal_month)
);

CREATE INDEX idx_financial_tracking_company_id ON financial_tracking(company_id);
CREATE INDEX idx_financial_tracking_period ON financial_tracking(fiscal_year, fiscal_month);
CREATE INDEX idx_financial_tracking_variance ON financial_tracking(variance_status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_financial_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_financial_tracking_updated_at ON financial_tracking;
CREATE TRIGGER trigger_financial_tracking_updated_at
  BEFORE UPDATE ON financial_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_tracking_updated_at();

-- ====================================================================
-- TABLE 3: DILUTION_SCENARIOS
-- ====================================================================
-- Cap table snapshots showing effect of future financing, warrants, and conversions

CREATE TABLE IF NOT EXISTS dilution_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,         -- "Series B $50M", "Employee Options Pool", etc.
  scenario_type VARCHAR(50) NOT NULL,          -- 'new_financing', 'warrant_exercise', 'option_pool', 'convertible_note', 'custom'
  
  -- Scenario parameters
  new_shares_issued DECIMAL(18,6),             -- New shares being issued
  issue_price_usd DECIMAL(15,6),               -- Price per share
  total_raise_usd DECIMAL(15,2),               -- Total amount raised
  warrant_conversion_pct DECIMAL(5,2),         -- % of warrants that convert
  option_pool_increase_pct DECIMAL(5,2),       -- % increase to option pool
  
  -- Pre-transaction state
  pre_transaction_fully_diluted_shares DECIMAL(18,6),
  pre_transaction_post_money_valuation_usd DECIMAL(15,2),
  
  -- Post-transaction state
  post_transaction_fully_diluted_shares DECIMAL(18,6),
  post_transaction_post_money_valuation_usd DECIMAL(15,2),
  
  -- Dilution metrics
  founder_dilution_pct DECIMAL(5,2),           -- % dilution to founders
  employee_dilution_pct DECIMAL(5,2),          -- % dilution to employees
  series_a_dilution_pct DECIMAL(5,2),          -- % dilution to Series A holders
  
  -- Cap table snapshot (full JSONB with all shareholders)
  cap_table_snapshot JSONB NOT NULL,           -- Array of: {
                                                --   "shareholder_name": "...",
                                                --   "share_class": "Common/Series A/...",
                                                --   "shares_pre": 1000000,
                                                --   "pct_pre": 25.5,
                                                --   "shares_post": 900000,
                                                --   "pct_post": 18.2
                                                -- }
  
  -- Warrant and convertible tracking
  warrant_details JSONB,                       -- Array of warrant conversions
  convertible_conversions JSONB,               -- Array of note conversions
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',          -- 'draft', 'approved', 'executed', 'archived'
  approved_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dilution_scenarios_company_id ON dilution_scenarios(company_id);
CREATE INDEX idx_dilution_scenarios_type ON dilution_scenarios(scenario_type);
CREATE INDEX idx_dilution_scenarios_status ON dilution_scenarios(status);
CREATE INDEX idx_dilution_scenarios_created_at ON dilution_scenarios(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_dilution_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dilution_scenarios_updated_at ON dilution_scenarios;
CREATE TRIGGER trigger_dilution_scenarios_updated_at
  BEFORE UPDATE ON dilution_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_dilution_scenarios_updated_at();

-- ====================================================================
-- TABLE 4: LISTING_REQUIREMENTS
-- ====================================================================
-- Exchange-specific requirements and validation checklist

CREATE TABLE IF NOT EXISTS listing_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  exchange_code VARCHAR(20) NOT NULL,         -- 'TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'JSE', 'OTC'
  requirement_code VARCHAR(100) NOT NULL,     -- e.g., 'TSX_MIN_PUBLIC_FLOAT', 'NASDAQ_BOARD_COMPOSITION'
  requirement_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Requirement specifics
  category VARCHAR(100),                      -- 'governance', 'financial', 'disclosure', 'operational', 'audit'
  requirement_type VARCHAR(50),               -- 'must_have', 'should_have', 'nice_to_have'
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'not_started',   -- 'not_started', 'in_progress', 'completed', 'exemption_applied', 'na'
  completion_pct INT DEFAULT 0,               -- 0-100
  
  -- Validation
  validation_method VARCHAR(255),             -- How compliance is verified
  validation_date DATE,                       -- When last validated
  is_compliant BOOLEAN,                       -- NULL=unknown, TRUE=compliant, FALSE=non-compliant
  exception_approved BOOLEAN DEFAULT FALSE,   -- Exemption or waiver approved
  exception_details TEXT,
  
  -- Deadline tracking
  deadline_date DATE,                         -- When compliance is needed
  days_until_deadline INT,                    -- Calculated field for easy sorting
  
  -- Document reference
  supporting_document_url TEXT,               -- S3/doc store URL
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

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_listing_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_listing_requirements_updated_at ON listing_requirements;
CREATE TRIGGER trigger_listing_requirements_updated_at
  BEFORE UPDATE ON listing_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_requirements_updated_at();

-- ====================================================================
-- TABLE 5: CORPORATE_RESOLUTIONS
-- ====================================================================
-- Board and shareholder resolutions required for IPO process

CREATE TABLE IF NOT EXISTS corporate_resolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  resolution_type VARCHAR(100) NOT NULL,      -- 'board_authorization', 'share_split', 'stock_option_plan', 
                                               -- 'director_appointment', 'audit_committee_formation', 
                                               -- 'dividend_policy', 'related_party_transaction', 'other'
  resolution_title VARCHAR(255) NOT NULL,
  resolution_date DATE,                       -- When resolution was passed
  description TEXT,                           -- Full text/summary of resolution
  
  -- Approval tracking
  approval_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'conditional'
  approved_by_board BOOLEAN DEFAULT FALSE,
  approved_by_shareholders BOOLEAN DEFAULT FALSE,
  approval_percentage_votes DECIMAL(5,2),     -- % of votes for approval (if shareholder)
  
  -- Timeline
  required_by_phase INT,                      -- Which phase requires this
  deadline_date DATE,
  approval_meeting_date DATE,
  
  -- Document management
  resolution_document_url TEXT,               -- S3/doc store URL
  board_minutes_url TEXT,
  shareholder_vote_record_url TEXT,
  
  -- Governance
  status VARCHAR(50) DEFAULT 'draft',         -- 'draft', 'ready_for_approval', 'approved', 'archived'
  prepared_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_corporate_resolutions_company_id ON corporate_resolutions(company_id);
CREATE INDEX idx_corporate_resolutions_type ON corporate_resolutions(resolution_type);
CREATE INDEX idx_corporate_resolutions_status ON corporate_resolutions(status);
CREATE INDEX idx_corporate_resolutions_phase ON corporate_resolutions(required_by_phase);
CREATE INDEX idx_corporate_resolutions_deadline ON corporate_resolutions(deadline_date);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_corporate_resolutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_corporate_resolutions_updated_at ON corporate_resolutions;
CREATE TRIGGER trigger_corporate_resolutions_updated_at
  BEFORE UPDATE ON corporate_resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_corporate_resolutions_updated_at();

-- ====================================================================
-- TABLE 6: CONSENT_LETTERS
-- ====================================================================
-- Shareholder and stakeholder consents required for IPO

CREATE TABLE IF NOT EXISTS consent_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,         -- 'shareholder_consent', 'director_consent', 
                                               -- 'officer_consent', 'vendor_consent', 'lender_consent',
                                               -- 'founder_agreement', 'lock_up_agreement', 'other'
  from_entity_name VARCHAR(255) NOT NULL,     -- "Jane Doe", "Acme Capital LP", etc.
  from_entity_type VARCHAR(50) NOT NULL,      -- 'individual', 'corporation', 'partnership', 'fund'
  
  -- Entity details
  from_entity_email VARCHAR(255),
  from_entity_phone VARCHAR(20),
  from_entity_address TEXT,
  
  -- Consent specifics
  consent_topic VARCHAR(255),                 -- e.g., "Related Party Transaction", "Director Appointment"
  consent_description TEXT,                   -- What they're consenting to
  required_phase INT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'sent', 'signed', 'rejected', 'expired'
  sent_date DATE,
  signed_date DATE,
  expiry_date DATE,                           -- When consent expires
  
  -- Document management
  consent_template_url TEXT,                  -- S3 URL to template
  signed_document_url TEXT,                   -- S3 URL to signed version
  signature_method VARCHAR(50),               -- 'esign', 'wet_signature', 'email_approval', 'other'
  
  -- Follow-up tracking
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_count INT DEFAULT 0,
  last_follow_up_date DATE,
  
  -- Acceptance/Rejection
  accepted BOOLEAN,
  rejection_reason TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consent_letters_company_id ON consent_letters(company_id);
CREATE INDEX idx_consent_letters_type ON consent_letters(consent_type);
CREATE INDEX idx_consent_letters_status ON consent_letters(status);
CREATE INDEX idx_consent_letters_from_entity ON consent_letters(from_entity_name);
CREATE INDEX idx_consent_letters_deadline ON consent_letters(expiry_date);
CREATE INDEX idx_consent_letters_follow_up ON consent_letters(follow_up_required);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_consent_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_consent_letters_updated_at ON consent_letters;
CREATE TRIGGER trigger_consent_letters_updated_at
  BEFORE UPDATE ON consent_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_letters_updated_at();

-- ====================================================================
-- FINAL VALIDATION
-- ====================================================================

SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ipo_costs') as ipo_costs_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_tracking') as financial_tracking_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenarios') as dilution_scenarios_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_requirements') as listing_requirements_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_resolutions') as corporate_resolutions_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_letters') as consent_letters_created;
