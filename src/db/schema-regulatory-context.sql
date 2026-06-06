-- ============================================================================
-- IPOReady: Phase 1 - Regulatory Context & Disclosure Detection Schema
-- Purpose: Extend regulatory rules engine with company-specific context,
-- disclosure trigger detection, and material event tracking
-- ============================================================================

-- ============================================================================
-- TABLE: company_regulatory_context
-- Purpose: Store THIS company's specific regulatory profile & risk factors
-- Enables context-aware rule application (e.g., "customer concentration" for this company)
-- ============================================================================
CREATE TABLE company_regulatory_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,
  exchange_id UUID NOT NULL REFERENCES exchanges(id),

  -- Company classification
  sector VARCHAR(100),                         -- 'technology', 'healthcare', 'financial_services', etc.
  size_tier VARCHAR(50),                       -- 'micro', 'small', 'mid', 'large', 'mega'
  market_cap_usd DECIMAL(15, 2),              -- Latest market cap for materiality calculations
  annual_revenue_usd DECIMAL(15, 2),          -- Latest revenue (used for % threshold calculations)

  -- Geographic/jurisdictional profile
  headquarters_country VARCHAR(2),             -- 'CA', 'US', 'GB', 'JP'
  operating_countries JSONB,                  -- ["CA", "US", "GB"] - regulatory exposure
  has_cfius_exposure BOOLEAN DEFAULT FALSE,   -- China/foreign ops triggering CFIUS
  has_esg_mandates BOOLEAN DEFAULT FALSE,     -- EU Green Taxonomy, etc.

  -- Business model risks
  top_3_customers_pct_revenue DECIMAL(5, 2), -- Customer concentration (18% = material)
  major_supplier_concentration BOOLEAN DEFAULT FALSE,
  regulatory_dependencies JSONB,              -- ["FDA", "CFCC"] - specific agencies
  litigation_exposure_usd DECIMAL(15, 2),    -- >$1M = material event

  -- Capital structure
  authorized_shares_count BIGINT,
  outstanding_shares_count BIGINT,
  options_outstanding_count BIGINT,
  warrants_outstanding_count BIGINT,

  -- Recent events (for materiality context)
  recent_executive_changes JSONB,             -- [{ name, role, departure_date, reason }]
  recent_financing JSONB,                     -- [{ date, amount, round, valuation }]
  pending_litigation JSONB,                   -- [{ name, status, exposure_usd }]

  -- Detection flags (updates as events occur)
  high_risk_profile BOOLEAN DEFAULT FALSE,    -- Concentration, litigation, sector risk
  last_materiality_assessment_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_company_regulatory_context_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id)
);

CREATE INDEX idx_company_regulatory_context_company_id ON company_regulatory_context(company_id);
CREATE INDEX idx_company_regulatory_context_exchange_id ON company_regulatory_context(exchange_id);
CREATE INDEX idx_company_regulatory_context_sector ON company_regulatory_context(sector);
CREATE INDEX idx_company_regulatory_context_size_tier ON company_regulatory_context(size_tier);
CREATE INDEX idx_company_regulatory_context_high_risk ON company_regulatory_context(high_risk_profile);


-- ============================================================================
-- TABLE: disclosure_triggers
-- Purpose: Track detected material events that trigger disclosure obligations
-- Real-time detection monitors: 8 data sources × 47 trigger types
-- ============================================================================
CREATE TABLE disclosure_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  exchange_id UUID NOT NULL REFERENCES exchanges(id),

  -- Event classification (47 types across 8 categories)
  event_category VARCHAR(50) NOT NULL,        -- 'financial', 'governance', 'legal', 'operational', 'hr', 'cap_table', 'investor', 'filing'
  event_type VARCHAR(100) NOT NULL,           -- e.g., 'revenue_miss', 'cfo_departure', 'customer_loss', 'litigation'

  -- Detection & timing
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  detected_by_source VARCHAR(50),             -- 'erp', 'board', 'legal', 'hr', 'cap_table', 'financial_model', 'investor_data', 'filing'

  -- Event details
  event_details JSONB NOT NULL,               -- Source-specific data: { customer: "Acme Corp", revenue_loss: 18000000, ... }

  -- Materiality assessment
  materiality_assessment JSONB NOT NULL,      -- {
                                               --   "is_material": true,
                                               --   "materiality_probability": 95,
                                               --   "materiality_reason": "Customer at 18% of revenue loss is material",
                                               --   "quantitative_factors": { "pct_revenue": 18, "usd_amount": 18000000, "threshold_pct": 5 },
                                               --   "qualitative_factors": ["key_customer", "margin_pressure"],
                                               --   "comparable_precedent": "3 TSX companies disclosed similar in Q2 2026"
                                               -- }

  -- Regulatory deadlines
  assessment_deadline TIMESTAMP WITH TIME ZONE,  -- Must determine materiality by this date
  disclosure_deadline TIMESTAMP WITH TIME ZONE, -- If material, must file/disclose by this date
  filing_type VARCHAR(50),                       -- 'prospectus_section', '8k_equivalent', 'management_discussion', 'continuous_disclosure'

  -- Decision tracking
  disclosure_decision_id UUID REFERENCES executive_decisions(id),  -- Link to decision record
  disclosure_decision VARCHAR(50),            -- 'disclosed', 'deferred', 'not_material', 'pending_assessment'
  decision_made_at TIMESTAMP WITH TIME ZONE,
  decision_made_by VARCHAR(255),              -- user_id or 'system'

  -- Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'detected',  -- 'detected', 'under_assessment', 'assessed', 'disclosed', 'closed'
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_disclosure_triggers_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id)
);

CREATE INDEX idx_disclosure_triggers_company_id ON disclosure_triggers(company_id);
CREATE INDEX idx_disclosure_triggers_exchange_id ON disclosure_triggers(exchange_id);
CREATE INDEX idx_disclosure_triggers_event_category ON disclosure_triggers(event_category);
CREATE INDEX idx_disclosure_triggers_event_type ON disclosure_triggers(event_type);
CREATE INDEX idx_disclosure_triggers_status ON disclosure_triggers(status);
CREATE INDEX idx_disclosure_triggers_disclosure_deadline ON disclosure_triggers(disclosure_deadline);
CREATE INDEX idx_disclosure_triggers_is_material ON disclosure_triggers USING gin (materiality_assessment);


-- ============================================================================
-- TABLE: executive_decisions
-- Purpose: Track all material decisions with SOX-compliant audit trail
-- Executive protection: shows decision was informed, considered, documented
-- ============================================================================
CREATE TABLE executive_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,

  -- Decision identification
  decision_point VARCHAR(255) NOT NULL,       -- "Should we disclose customer loss?"
  decision_category VARCHAR(50),              -- 'disclosure', 'governance', 'financial', 'legal'

  -- The decision
  decision_made VARCHAR(255) NOT NULL,        -- 'yes', 'no', 'defer', 'pending'
  decision_rationale TEXT NOT NULL,           -- Executive's documented reasoning

  -- Supporting documentation
  recommendation_text TEXT,                   -- What system/counsel recommended
  counsel_advice_referenced TEXT,             -- "Relied on [Big 4] advice dated [date]"
  comparable_precedent TEXT,                  -- "5 similar companies disclosed in similar situations"
  risk_assessment JSONB,                      -- { "if_not_disclosed": "...", "if_disclosed": "..." }

  -- Approvals & sign-offs
  decided_by_user_id VARCHAR(255) NOT NULL,   -- CEO, CFO, Board, etc.
  decided_by_role VARCHAR(50),                -- 'ceo', 'cfo', 'general_counsel', 'board_audit_committee'
  approved_by_ids JSONB,                      -- ["board_member_1", "board_member_2"] - who approved?
  approval_date TIMESTAMP WITH TIME ZONE,

  -- SOX Section 302 documentation
  sox_302_certification BOOLEAN DEFAULT FALSE, -- Attested by CEO/CFO?
  sox_302_certification_date TIMESTAMP WITH TIME ZONE,

  -- Immutable audit trail
  decision_locked BOOLEAN DEFAULT FALSE,       -- Once locked, can't edit (SOX compliance)
  locked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT ck_decision_locked CHECK (
    -- If locked, must have been locked and created before
    NOT decision_locked OR (locked_at IS NOT NULL AND locked_at >= created_at)
  )
);

CREATE INDEX idx_executive_decisions_company_id ON executive_decisions(company_id);
CREATE INDEX idx_executive_decisions_decision_category ON executive_decisions(decision_category);
CREATE INDEX idx_executive_decisions_decided_by ON executive_decisions(decided_by_user_id);
CREATE INDEX idx_executive_decisions_decision_locked ON executive_decisions(decision_locked);
CREATE INDEX idx_executive_decisions_created_at ON executive_decisions(created_at);


-- ============================================================================
-- TABLE: regulatory_exemptions
-- Purpose: Track company-specific regulatory exemptions or safe harbors
-- Example: "Small business exemption from SOX", "Limited jurisdiction exemption"
-- ============================================================================
CREATE TABLE regulatory_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  exchange_id UUID NOT NULL REFERENCES exchanges(id),

  -- Exemption details
  exemption_rule VARCHAR(255) NOT NULL,       -- "SEC Rule 12b-2 (small business)", "TSX Section 3.2(d)"
  exemption_description TEXT,

  -- When does it apply?
  applicable_requirement VARCHAR(255),        -- What requirement is exempted?
  reason TEXT,                                 -- Why is company eligible? (e.g., "Revenue <$100M")

  -- Validity
  effective_date DATE NOT NULL,
  expiration_date DATE,                       -- When does exemption expire?
  is_active BOOLEAN DEFAULT TRUE,

  -- Conditions
  conditions JSONB,                           -- Requirements to maintain exemption

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_regulatory_exemptions_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id)
);

CREATE INDEX idx_regulatory_exemptions_company_id ON regulatory_exemptions(company_id);
CREATE INDEX idx_regulatory_exemptions_exchange_id ON regulatory_exemptions(exchange_id);
CREATE INDEX idx_regulatory_exemptions_is_active ON regulatory_exemptions(is_active);
CREATE INDEX idx_regulatory_exemptions_expiration ON regulatory_exemptions(expiration_date);


-- ============================================================================
-- TABLE: regulatory_change_log
-- Purpose: Track regulatory updates (new rules, deadline changes, exemption removals)
-- Enables automatic re-assessment when rules change
-- ============================================================================
CREATE TABLE regulatory_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id),

  -- Change details
  change_type VARCHAR(50) NOT NULL,           -- 'new_rule', 'rule_amended', 'deadline_changed', 'exemption_removed', 'guidance_updated'
  change_summary TEXT NOT NULL,
  change_details JSONB,

  -- Rule reference
  affected_rule_id UUID REFERENCES regulatory_requirements(id),
  affected_requirement VARCHAR(255),

  -- Regulatory context
  regulator_announcement_url TEXT,
  effective_date DATE NOT NULL,
  comment_period_end DATE,

  -- Impact assessment
  affected_company_count INTEGER,             -- Estimated # of companies affected
  severity VARCHAR(20),                       -- 'critical', 'major', 'minor'
  affected_issuers_criteria TEXT,             -- "Companies with >$10M revenue in tech sector"

  -- Notifications sent
  notifications_sent BOOLEAN DEFAULT FALSE,
  notifications_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_regulatory_change_log_exchange FOREIGN KEY (exchange_id)
    REFERENCES exchanges(id)
);

CREATE INDEX idx_regulatory_change_log_exchange_id ON regulatory_change_log(exchange_id);
CREATE INDEX idx_regulatory_change_log_change_type ON regulatory_change_log(change_type);
CREATE INDEX idx_regulatory_change_log_effective_date ON regulatory_change_log(effective_date);
CREATE INDEX idx_regulatory_change_log_severity ON regulatory_change_log(severity);


-- ============================================================================
-- TABLE: materiality_assessment_history
-- Purpose: Audit trail of materiality assessments over time
-- Shows decision-making process, thresholds applied, who assessed
-- ============================================================================
CREATE TABLE materiality_assessment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disclosure_trigger_id UUID NOT NULL REFERENCES disclosure_triggers(id),
  company_id UUID NOT NULL,

  -- Assessment context
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assessed_by_user_id VARCHAR(255),           -- user_id or 'system'
  assessment_method VARCHAR(50),              -- 'quantitative', 'qualitative', 'combined'

  -- Quantitative factors applied
  company_size_metric VARCHAR(50),            -- 'revenue', 'market_cap', 'ebitda'
  company_size_value DECIMAL(15, 2),
  quantitative_threshold DECIMAL(5, 2),      -- e.g., 5% of revenue
  quantitative_amount DECIMAL(15, 2),        -- Actual amount ($18M)
  quantitative_is_material BOOLEAN,          -- Does it exceed threshold?

  -- Qualitative factors
  qualitative_factors JSONB,                  -- ["key_customer", "margin_impact", "timing_proximity"]
  qualitative_assessment TEXT,                -- Executive narrative

  -- Comparable analysis
  comparable_companies_reviewed INTEGER,     -- "Reviewed 5 similar TSX companies"
  comparable_findings TEXT,                  -- "3 of 5 disclosed similar events"

  -- Final assessment
  materiality_conclusion VARCHAR(50),         -- 'material', 'not_material', 'gray_area'
  confidence_percentage INTEGER,              -- 95% confident

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materiality_assessment_history_trigger_id ON materiality_assessment_history(disclosure_trigger_id);
CREATE INDEX idx_materiality_assessment_history_company_id ON materiality_assessment_history(company_id);
CREATE INDEX idx_materiality_assessment_history_assessment_date ON materiality_assessment_history(assessment_date);
