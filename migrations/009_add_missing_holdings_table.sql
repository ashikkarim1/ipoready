-- ========================================================================
-- MIGRATION 009: Add Missing Holdings Table
-- Date: 2026-06-01
-- Description: Create the holdings table and related functions/triggers
--              that were in migration 006 but not actually created in the database
-- ========================================================================

-- ====================================================================
-- HOLDINGS (Share Ownership)
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
