-- Migration: Add PACE Sequencing Alerts Table
-- Purpose: Persist sequencing violations and alerts for IPO milestone validation
-- Date: 2026-06-01

-- ============================================================
-- PACE Sequencing Alerts Table
-- Stores validation results from ipo-sequencing.ts validateMilestoneSequence()
-- ============================================================

CREATE TABLE IF NOT EXISTS pace_sequencing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rule VARCHAR(255) NOT NULL,              -- Human-readable rule name
  severity VARCHAR(20) NOT NULL,           -- 'error', 'warning', 'critical'
  remediation TEXT NOT NULL,               -- Steps to resolve the alert
  resolved_at TIMESTAMP WITH TIME ZONE,    -- When alert was resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pace_sequencing_alerts_company ON pace_sequencing_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_pace_sequencing_alerts_severity ON pace_sequencing_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_pace_sequencing_alerts_resolved ON pace_sequencing_alerts(resolved_at);
CREATE INDEX IF NOT EXISTS idx_pace_sequencing_alerts_created ON pace_sequencing_alerts(created_at DESC);

-- ============================================================
-- Trigger for updated_at column
-- ============================================================

DROP TRIGGER IF EXISTS update_pace_sequencing_alerts_updated_at ON pace_sequencing_alerts;
CREATE TRIGGER update_pace_sequencing_alerts_updated_at
  BEFORE UPDATE ON pace_sequencing_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Add pace_score_history table if missing
-- Required for trend data in /api/pace/scores endpoint
-- ============================================================

CREATE TABLE IF NOT EXISTS pace_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pace_score INT NOT NULL,                 -- Snapshot of PACE score
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pace_score_history_company ON pace_score_history(company_id);
CREATE INDEX IF NOT EXISTS idx_pace_score_history_recorded ON pace_score_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pace_score_history_company_recorded ON pace_score_history(company_id, recorded_at DESC);
