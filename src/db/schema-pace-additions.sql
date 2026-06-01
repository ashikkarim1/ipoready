/**
 * PACE Accuracy Deepening: Schema Additions
 * Benchmark data and predictive factors for IPO readiness scoring
 * Run this migration to add benchmarking, historical data, and document tracking
 */

-- ============================================================
-- PACE ACCURACY: IPO Benchmarks Table
-- Stores real IPO market trends by exchange and phase
-- ============================================================

CREATE TABLE IF NOT EXISTS ipo_benchmarks (
  id SERIAL PRIMARY KEY,
  exchange VARCHAR(20) NOT NULL,           -- TSX, NASDAQ, NYSE, TSXV, CSE, OTC, JSE
  phase_id INT NOT NULL,                   -- 1-8 (maps to phase order)
  phase_name VARCHAR(100) NOT NULL,        -- 'pre_planning', 'corporate_restructuring', etc.
  avg_completion_pct FLOAT NOT NULL,       -- Average % completion at this phase
  median_completion_pct FLOAT NOT NULL,    -- Median % completion
  p90_completion_pct FLOAT NOT NULL,       -- Top 10% completion %
  total_companies_in_benchmark INT,        -- Sample size
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exchange, phase_id)
);

CREATE INDEX IF NOT EXISTS idx_ipo_benchmarks_exchange ON ipo_benchmarks(exchange);
CREATE INDEX IF NOT EXISTS idx_ipo_benchmarks_phase ON ipo_benchmarks(phase_id);

-- ============================================================
-- PACE ACCURACY: Historical IPO Data
-- Synthetic + real IPO records for calibration and pattern matching
-- ============================================================

CREATE TABLE IF NOT EXISTS ipo_historical_data (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  exchange VARCHAR(20) NOT NULL,
  sector VARCHAR(100),
  ipo_date DATE,
  total_days_to_ipo INT,
  phases_duration JSONB,                    -- {phase_1: 45, phase_2: 120, ...}
  team_size_at_ipo INT,
  pre_ipo_funding_usd DECIMAL(12,2),
  successful BOOLEAN DEFAULT TRUE,          -- Whether IPO succeeded
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ipo_historical_exchange ON ipo_historical_data(exchange);
CREATE INDEX IF NOT EXISTS idx_ipo_historical_ipo_date ON ipo_historical_data(ipo_date);
CREATE INDEX IF NOT EXISTS idx_ipo_historical_sector ON ipo_historical_data(sector);

-- ============================================================
-- PACE ACCURACY: Document Scorecards
-- Tracks completion status and quality of IPO documents
-- ============================================================

CREATE TABLE IF NOT EXISTS document_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,     -- "Articles of Incorporation", "Audited Financials", etc.
  phase_id INT NOT NULL,                   -- Which phase this document belongs to
  completion_pct INT DEFAULT 0,             -- 0-100 (0=not started, 50=draft, 100=final)
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, draft, reviewed, final, approved
  word_count INT,                           -- Document metadata
  page_count INT,
  signature_count INT,
  legal_review_date DATE,
  last_updated DATE,
  reviewer_notes TEXT,
  document_url VARCHAR(500),                -- S3 or storage URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_scorecards_company ON document_scorecards(company_id);
CREATE INDEX IF NOT EXISTS idx_document_scorecards_phase ON document_scorecards(phase_id);
CREATE INDEX IF NOT EXISTS idx_document_scorecards_status ON document_scorecards(status);
CREATE INDEX IF NOT EXISTS idx_document_scorecards_document ON document_scorecards(document_name);

-- ============================================================
-- PACE ACCURACY: Company Predictive Factors
-- Add columns to companies table for deeper analysis
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS cash_runway_months FLOAT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS pre_ipo_funding_raised_usd DECIMAL(12,2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS team_size INT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cfo_hired_at DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS board_size INT DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS auditor_selected BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS investor_sophistication_score INT;  -- 1-10 scale

-- ============================================================
-- PACE ACCURACY: Sequencing Validation Logs
-- Tracks violations of phase prerequisites and dependencies
-- ============================================================

CREATE TABLE IF NOT EXISTS sequencing_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  violation_rule VARCHAR(255) NOT NULL,    -- e.g., "Auditor must be selected before Financial Audit"
  severity VARCHAR(20) NOT NULL,           -- error, warning
  task_id UUID,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sequencing_violations_company ON sequencing_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_sequencing_violations_severity ON sequencing_violations(severity);
CREATE INDEX IF NOT EXISTS idx_sequencing_violations_resolved ON sequencing_violations(resolved_at);

-- ============================================================
-- Helpful Views for PACE Analysis
-- ============================================================

CREATE OR REPLACE VIEW v_company_pace_summary AS
SELECT
  c.id,
  c.name,
  c.pace_score,
  c.progress_percentage,
  c.estimated_days_to_ipo,
  c.current_phase,
  c.target_exchange,
  c.cash_runway_months,
  c.team_size,
  c.board_size,
  c.auditor_selected,
  c.investor_sophistication_score,
  COUNT(DISTINCT ds.id) as documents_total,
  SUM(CASE WHEN ds.status = 'final' THEN 1 ELSE 0 END) as documents_final,
  SUM(CASE WHEN ds.status IN ('final', 'approved') THEN 1 ELSE 0 END) as documents_approved
FROM companies c
LEFT JOIN document_scorecards ds ON c.id = ds.company_id
GROUP BY c.id;

CREATE OR REPLACE VIEW v_benchmark_comparison AS
SELECT
  c.id,
  c.name,
  c.target_exchange,
  c.current_phase,
  c.pace_score,
  b.avg_completion_pct,
  b.median_completion_pct,
  b.p90_completion_pct,
  CASE
    WHEN c.pace_score >= b.p90_completion_pct THEN 'Top 10%'
    WHEN c.pace_score >= b.median_completion_pct THEN 'Above Median'
    WHEN c.pace_score >= b.avg_completion_pct THEN 'Above Average'
    ELSE 'Below Average'
  END as peer_performance
FROM companies c
LEFT JOIN ipo_benchmarks b
  ON LOWER(c.target_exchange) = LOWER(b.exchange)
  AND c.current_phase_id = b.phase_id;
