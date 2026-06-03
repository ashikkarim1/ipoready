-- Dilution Scenarios Table Migration
-- Stores cap table dilution scenario calculations and results

CREATE TABLE IF NOT EXISTS dilution_scenarios (
  id VARCHAR(255) PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,
  scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN ('base', 'optimistic', 'conservative', 'custom')),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_dilution_scenarios_company_id ON dilution_scenarios(company_id);
CREATE INDEX IF NOT EXISTS idx_dilution_scenarios_scenario_type ON dilution_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_dilution_scenarios_created_at ON dilution_scenarios(created_at DESC);

-- JSONB query indexes for faster scenario lookups
CREATE INDEX IF NOT EXISTS idx_dilution_scenarios_data_gin ON dilution_scenarios USING gin(data);
