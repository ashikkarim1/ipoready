-- ========================================================================
-- MIGRATION 010: Complete Cap Table Schema - All Missing Tables
-- Date: 2026-06-01
-- Description: Creates all missing cap table tables that were not created
--              in migration 006. Tables created in proper dependency order.
-- ========================================================================

-- ====================================================================
-- PART 1: SHARE CLASSES (Enhanced)
-- ====================================================================

CREATE TABLE IF NOT EXISTS share_classes_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,
  class_code VARCHAR(10),                           -- A, B, C, etc.
  preference_order INT NOT NULL,                    -- 0=common, 1+=preferred
  liquidation_preference_multiplier DECIMAL(5,2),   -- 1x, 2x, 3x non-participating preferred
  participating BOOLEAN DEFAULT false,              -- Participating preferred
  conversion_ratio DECIMAL(10,4) DEFAULT 1.0,
  voting_rights DECIMAL(5,2) DEFAULT 1.0,
  dividend_per_share DECIMAL(15,4),
  liquidation_per_share DECIMAL(15,4),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cap_table_document_id, class_name)
);

CREATE INDEX IF NOT EXISTS idx_share_classes_v2_document_id ON share_classes_v2(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_share_classes_v2_company_id ON share_classes_v2(company_id);
CREATE INDEX IF NOT EXISTS idx_share_classes_v2_preference ON share_classes_v2(company_id, preference_order DESC);

CREATE OR REPLACE FUNCTION update_share_classes_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_share_classes_v2_updated_at ON share_classes_v2;
CREATE TRIGGER trigger_share_classes_v2_updated_at
  BEFORE UPDATE ON share_classes_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_share_classes_v2_updated_at();

-- ====================================================================
-- PART 2: SHAREHOLDERS
-- ====================================================================

CREATE TABLE IF NOT EXISTS shareholders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shareholder_name VARCHAR(255) NOT NULL,
  shareholder_type VARCHAR(50),                     -- founder, investor, employee, advisor, consultant
  entity_type VARCHAR(50),                          -- individual, corporation, trust, partnership
  identifier VARCHAR(255),                          -- SSN/SIN, Business Number, etc.
  country_incorporation VARCHAR(2),                 -- ISO country code
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cap_table_document_id, shareholder_name)
);

CREATE INDEX IF NOT EXISTS idx_shareholders_document_id ON shareholders(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_company_id ON shareholders(company_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_type ON shareholders(shareholder_type);

CREATE OR REPLACE FUNCTION update_shareholders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_shareholders_updated_at ON shareholders;
CREATE TRIGGER trigger_shareholders_updated_at
  BEFORE UPDATE ON shareholders
  FOR EACH ROW
  EXECUTE FUNCTION update_shareholders_updated_at();

-- ====================================================================
-- PART 3: HOLDINGS (Share Ownership)
-- ====================================================================

CREATE TABLE IF NOT EXISTS holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shareholder_id UUID NOT NULL REFERENCES shareholders(id) ON DELETE CASCADE,
  share_class_id UUID NOT NULL REFERENCES share_classes_v2(id) ON DELETE CASCADE,
  quantity DECIMAL(18,8) NOT NULL,                  -- Number of shares (supports fractional)
  quantity_issued DECIMAL(18,8) NOT NULL,           -- Total issued (includes unvested)
  cost_per_share DECIMAL(15,6),                     -- Original purchase/grant price
  total_cost DECIMAL(20,2),                         -- Quantity * cost_per_share
  currency VARCHAR(3) DEFAULT 'USD',
  holding_type VARCHAR(50),                         -- common, preferred, option, warrant, convertible
  grant_date DATE,
  exercise_price DECIMAL(15,6),                     -- For options/warrants
  expiration_date DATE,                             -- For options/warrants
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holdings_document_id ON holdings(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_holdings_shareholder_id ON holdings(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_holdings_share_class_id ON holdings(share_class_id);
CREATE INDEX IF NOT EXISTS idx_holdings_holding_type ON holdings(holding_type);

CREATE OR REPLACE FUNCTION update_holdings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_holdings_updated_at ON holdings;
CREATE TRIGGER trigger_holdings_updated_at
  BEFORE UPDATE ON holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_holdings_updated_at();

-- ====================================================================
-- PART 4: VESTING SCHEDULES
-- ====================================================================

CREATE TABLE IF NOT EXISTS vesting_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vesting_start_date DATE NOT NULL,
  vesting_end_date DATE NOT NULL,
  cliff_months INT DEFAULT 0,
  cliff_date DATE,
  total_vesting_months INT NOT NULL,
  vesting_frequency VARCHAR(50) DEFAULT 'monthly', -- monthly, quarterly, annually
  vesting_percent_on_cliff DECIMAL(5,2) DEFAULT 0,
  acceleration_on_change_of_control BOOLEAN DEFAULT false,
  acceleration_on_termination BOOLEAN DEFAULT false,
  single_trigger_acceleration DECIMAL(5,2),        -- % that vest on acquisition
  double_trigger_acceleration DECIMAL(5,2),        -- % that vest with termination after acquisition
  vested_quantity DECIMAL(18,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vesting_schedules_holding_id ON vesting_schedules(holding_id);
CREATE INDEX IF NOT EXISTS idx_vesting_schedules_company_id ON vesting_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_vesting_schedules_cliff_date ON vesting_schedules(cliff_date);

CREATE OR REPLACE FUNCTION update_vesting_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_vesting_schedules_updated_at ON vesting_schedules;
CREATE TRIGGER trigger_vesting_schedules_updated_at
  BEFORE UPDATE ON vesting_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_vesting_schedules_updated_at();

-- ====================================================================
-- PART 5: CAP TABLE TRANSACTIONS (Historical Activity)
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,            -- grant, issuance, exercise, conversion, split, cancellation
  share_class_id UUID REFERENCES share_classes_v2(id) ON DELETE SET NULL,
  shareholder_id UUID REFERENCES shareholders(id) ON DELETE SET NULL,
  quantity_before DECIMAL(18,8),
  quantity_after DECIMAL(18,8),
  quantity_change DECIMAL(18,8),
  price_per_share DECIMAL(15,6),
  transaction_value DECIMAL(20,2),
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  waterfall_order INT,                              -- For calculating cascading effects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cap_table_transactions_document_id ON cap_table_transactions(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_transactions_date ON cap_table_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_cap_table_transactions_type ON cap_table_transactions(transaction_type);

CREATE OR REPLACE FUNCTION update_cap_table_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cap_table_transactions_updated_at ON cap_table_transactions;
CREATE TRIGGER trigger_cap_table_transactions_updated_at
  BEFORE UPDATE ON cap_table_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_cap_table_transactions_updated_at();

-- ====================================================================
-- PART 6: CAP TABLE SCENARIOS (Simulations & Projections)
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_type VARCHAR(50) NOT NULL,               -- current, fully_diluted, post_ipo, bridge, custom
  scenario_name VARCHAR(255),
  scenario_date DATE,
  total_shares_outstanding DECIMAL(18,8),
  total_shares_fully_diluted DECIMAL(18,8),
  post_money_valuation DECIMAL(20,2),
  price_per_share DECIMAL(15,6),
  implied_share_price DECIMAL(15,6),
  scenario_snapshot JSONB NOT NULL,                 -- Complete holdings snapshot
  assumptions_json JSONB,                           -- Input assumptions for scenario
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cap_table_document_id, scenario_type)
);

CREATE INDEX IF NOT EXISTS idx_cap_table_scenarios_document_id ON cap_table_scenarios(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_scenarios_type ON cap_table_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_cap_table_scenarios_created_at ON cap_table_scenarios(created_at DESC);

CREATE OR REPLACE FUNCTION update_cap_table_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cap_table_scenarios_updated_at ON cap_table_scenarios;
CREATE TRIGGER trigger_cap_table_scenarios_updated_at
  BEFORE UPDATE ON cap_table_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_cap_table_scenarios_updated_at();

-- ====================================================================
-- PART 7: VALIDATION RULES
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_validation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  rule_category VARCHAR(50) NOT NULL,               -- share_conservation, currency_consistency, waterfall, dilution, vesting, warrant, consolidation
  rule_description TEXT,
  rule_logic_json JSONB,                            -- Serialized validation logic
  severity VARCHAR(50) DEFAULT 'error',             -- error, warning, info
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cap_table_validation_rules_company_id ON cap_table_validation_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_validation_rules_category ON cap_table_validation_rules(rule_category);

-- ====================================================================
-- PART 8: AUDIT LOG
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,                     -- upload, parse, validate, modify, delete, scenario_create
  entity_type VARCHAR(50),                          -- cap_table_document, holding, shareholder, scenario
  entity_id VARCHAR(255),
  change_summary TEXT,
  change_details JSONB,                             -- Before/after values
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cap_table_audit_log_document_id ON cap_table_audit_log(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_audit_log_company_id ON cap_table_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_audit_log_created_at ON cap_table_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cap_table_audit_log_action ON cap_table_audit_log(action);

-- ====================================================================
-- PART 9: VALIDATION RESULTS
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_validation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES cap_table_validation_rules(id) ON DELETE SET NULL,
  rule_name VARCHAR(255),
  severity VARCHAR(50),                             -- error, warning, info
  message TEXT,
  details JSONB,                                    -- Field names, values, suggestions
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cap_table_validation_results_document_id ON cap_table_validation_results(cap_table_document_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_validation_results_severity ON cap_table_validation_results(severity);
CREATE INDEX IF NOT EXISTS idx_cap_table_validation_results_is_resolved ON cap_table_validation_results(is_resolved);
