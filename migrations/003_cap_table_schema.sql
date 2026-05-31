-- Cap Table Schema Migration: Core cap table, funding rounds, scenarios, and lead capture
-- This migration establishes the foundation for cap table management and lead tracking

-- ====================================================================
-- PART 1: SHARE CLASSES
-- ====================================================================

CREATE TABLE IF NOT EXISTS share_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,                -- "Common", "Series A Preferred", etc.
  preference_order INT NOT NULL,                   -- 0=common (last priority), 1+=preferred
  liquidation_preference_amount DECIMAL(15,2),     -- If NULL, standard 1x non-participating
  conversion_ratio DECIMAL(10,4) DEFAULT 1.0,      -- How many common shares per preferred
  voting_rights DECIMAL(5,2) DEFAULT 1.0,          -- Votes per share
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, class_name)
);

CREATE INDEX idx_share_classes_company_id ON share_classes(company_id);
CREATE INDEX idx_share_classes_preference ON share_classes(company_id, preference_order DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_share_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_share_classes_updated_at ON share_classes;
CREATE TRIGGER trigger_share_classes_updated_at
  BEFORE UPDATE ON share_classes
  FOR EACH ROW
  EXECUTE FUNCTION update_share_classes_updated_at();

-- ====================================================================
-- PART 2: CAP TABLE ENTRIES (Shareholder Grants)
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shareholder_name VARCHAR(255) NOT NULL,          -- Name of shareholder/employee
  share_class_id UUID REFERENCES share_classes(id) ON DELETE RESTRICT,
  quantity DECIMAL(18,6) NOT NULL,                 -- Number of shares (supports fractional)
  vesting_start_date DATE,                         -- When vesting begins (NULL = no vesting)
  vesting_cliff_months INT,                        -- Cliff in months (0 = no cliff)
  vesting_period_months INT,                       -- Total vesting period in months
  vested_quantity DECIMAL(18,6) DEFAULT 0,         -- Already vested amount
  strike_price DECIMAL(15,6),                      -- For options: exercise price per share
  grant_date DATE NOT NULL,                        -- When grant was issued
  grant_type VARCHAR(50) DEFAULT 'stock',          -- 'stock', 'option', 'warrant', 'convertible'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cap_table_entries_company_id ON cap_table_entries(company_id);
CREATE INDEX idx_cap_table_entries_shareholder ON cap_table_entries(shareholder_name);
CREATE INDEX idx_cap_table_entries_share_class ON cap_table_entries(share_class_id);
CREATE INDEX idx_cap_table_entries_vesting_start ON cap_table_entries(vesting_start_date);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_cap_table_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cap_table_entries_updated_at ON cap_table_entries;
CREATE TRIGGER trigger_cap_table_entries_updated_at
  BEFORE UPDATE ON cap_table_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_cap_table_entries_updated_at();

-- ====================================================================
-- PART 3: INVESTOR ROUNDS
-- ====================================================================

CREATE TABLE IF NOT EXISTS investor_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  round_name VARCHAR(100) NOT NULL,                -- "Seed", "Series A", "Series B", etc.
  round_type VARCHAR(50) NOT NULL,                 -- seed, series_a, series_b, series_c, series_d, 
                                                    -- series_e, series_f, growth, mezzanine, etc.
  valuation_usd DECIMAL(15,2) NOT NULL,            -- Post-money valuation
  amount_raised_usd DECIMAL(15,2) NOT NULL,        -- Amount raised in this round
  close_date DATE NOT NULL,
  investor_list TEXT,                              -- Comma-separated investor names or JSON
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_investor_rounds_company_id ON investor_rounds(company_id);
CREATE INDEX idx_investor_rounds_close_date ON investor_rounds(close_date DESC);
CREATE INDEX idx_investor_rounds_round_type ON investor_rounds(round_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_investor_rounds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_investor_rounds_updated_at ON investor_rounds;
CREATE TRIGGER trigger_investor_rounds_updated_at
  BEFORE UPDATE ON investor_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_investor_rounds_updated_at();

-- ====================================================================
-- PART 4: CAP TABLE SCENARIOS (Dilution Simulations)
-- ====================================================================

CREATE TABLE IF NOT EXISTS cap_table_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,             -- "Series B Scenario", "Double Raise", etc.
  future_round_valuation_usd DECIMAL(15,2) NOT NULL,
  future_round_amount_usd DECIMAL(15,2) NOT NULL,
  scenario_snapshot_json JSONB NOT NULL,           -- Full cap table snapshot post-round
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cap_table_scenarios_company_id ON cap_table_scenarios(company_id);
CREATE INDEX idx_cap_table_scenarios_created_at ON cap_table_scenarios(created_at DESC);

-- Trigger for updated_at
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
-- PART 5: LEAD CAPTURE
-- ====================================================================

CREATE TABLE IF NOT EXISTS lead_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_point_name VARCHAR(255) NOT NULL,          -- "homepage_signup", "nav_cta", etc.
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  listing_exchange_target VARCHAR(50) NOT NULL,    -- TSX, NASDAQ, NYSE, TSXV, CSE, OTC, JSE, Other
  converted_to_trial BOOLEAN DEFAULT FALSE,
  trial_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),                          -- IPv4 or IPv6
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_captures_email ON lead_captures(email);
CREATE INDEX idx_lead_captures_company_name ON lead_captures(company_name);
CREATE INDEX idx_lead_captures_exchange ON lead_captures(listing_exchange_target);
CREATE INDEX idx_lead_captures_converted ON lead_captures(converted_to_trial);
CREATE INDEX idx_lead_captures_created_at ON lead_captures(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_lead_captures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_captures_updated_at ON lead_captures;
CREATE TRIGGER trigger_lead_captures_updated_at
  BEFORE UPDATE ON lead_captures
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_captures_updated_at();

-- ====================================================================
-- FINAL VALIDATION
-- ====================================================================

-- Verify all tables exist
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'share_classes') as share_classes_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cap_table_entries') as cap_table_entries_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'investor_rounds') as investor_rounds_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cap_table_scenarios') as cap_table_scenarios_created,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_captures') as lead_captures_created;
