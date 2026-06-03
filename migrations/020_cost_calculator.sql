/**
 * IPO Cost Calculator Schema Migration
 * Creates tables for storing IPO cost calculations and analysis
 */

-- ============================================================
-- COST CALCULATIONS TABLE
-- Stores IPO cost calculations per company
-- ============================================================

CREATE TABLE IF NOT EXISTS cost_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  calculation_data JSONB NOT NULL,       -- Stores the complete calculation result
  company_revenue BIGINT NOT NULL,       -- Company revenue in cents (USD)
  selected_exchange VARCHAR(20) NOT NULL, -- 'NYSE', 'NASDAQ', 'TSX', 'ASX', 'OTHER'
  complexity_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  timeline_months INT NOT NULL,          -- IPO timeline in months
  total_cost BIGINT NOT NULL,            -- Total estimated cost in cents
  cost_breakdown JSONB NOT NULL,         -- Breakdown of costs by category
  benchmarks JSONB NOT NULL,             -- Industry benchmark data
  notes TEXT,                            -- User notes about this calculation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_calculations_company ON cost_calculations(company_id);
CREATE INDEX IF NOT EXISTS idx_cost_calculations_created ON cost_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_calculations_exchange ON cost_calculations(selected_exchange);

-- ============================================================
-- COST CALCULATION SCENARIOS TABLE
-- Stores multiple cost scenarios for comparison
-- ============================================================

CREATE TABLE IF NOT EXISTS cost_calculation_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_calculation_id UUID NOT NULL REFERENCES cost_calculations(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,   -- e.g. 'Base Case', 'Optimistic', 'Conservative'
  scenario_data JSONB NOT NULL,          -- Complete scenario calculation
  total_cost BIGINT NOT NULL,            -- Total cost for this scenario in cents
  description TEXT,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_scenarios_calculation ON cost_calculation_scenarios(cost_calculation_id);
CREATE INDEX IF NOT EXISTS idx_cost_scenarios_selected ON cost_calculation_scenarios(is_selected);

-- ============================================================
-- COST SAVINGS STRATEGIES TABLE
-- Tracks user-identified cost savings opportunities
-- ============================================================

CREATE TABLE IF NOT EXISTS cost_savings_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_calculation_id UUID NOT NULL REFERENCES cost_calculations(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,       -- Category of cost (e.g. 'legal', 'accounting', 'underwriting')
  strategy_name VARCHAR(255) NOT NULL,  -- Name of the cost-saving strategy
  description TEXT,                     -- Detailed description
  potential_savings BIGINT NOT NULL,    -- Potential savings in cents
  implementation_difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
  estimated_timeline VARCHAR(100),      -- e.g. '2-4 weeks'
  implementation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_strategies_calculation ON cost_savings_strategies(cost_calculation_id);
CREATE INDEX IF NOT EXISTS idx_cost_strategies_category ON cost_savings_strategies(category);

-- ============================================================
-- Triggers for updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cost_calculations_updated_at ON cost_calculations;
CREATE TRIGGER update_cost_calculations_updated_at
  BEFORE UPDATE ON cost_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_scenarios_updated_at ON cost_calculation_scenarios;
CREATE TRIGGER update_cost_scenarios_updated_at
  BEFORE UPDATE ON cost_calculation_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_strategies_updated_at ON cost_savings_strategies;
CREATE TRIGGER update_cost_strategies_updated_at
  BEFORE UPDATE ON cost_savings_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
