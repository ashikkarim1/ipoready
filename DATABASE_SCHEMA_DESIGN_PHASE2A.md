# IPOReady Phase 2A: Database Schema Design
## Six New Tables for IPO Costs, Financial Tracking, and Compliance

**Created:** 2026-06-03  
**Status:** Ready for Implementation  
**Migration File:** `migrations/016_ipo_costs_and_tracking.sql`

---

## Executive Summary

Six new tables designed to support:
1. **ipo_costs** — Labor hours, hard costs, timeline tracking
2. **financial_tracking** — Monthly budget vs actual comparison
3. **dilution_scenarios** — Cap table snapshots with warrants/financing impact
4. **listing_requirements** — Exchange-specific validation checklists
5. **corporate_resolutions** — Board and shareholder resolutions
6. **consent_letters** — Shareholder/stakeholder consent tracking

All tables integrate with existing IPOReady schema (companies, users, cap_table_entries).

---

## Table 1: ipo_costs
**Purpose:** Track all costs associated with the IPO process

### Columns
```sql
CREATE TABLE IF NOT EXISTS ipo_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  cost_category VARCHAR(100) NOT NULL,    -- legal, audit, investment_banking, accounting, consulting, underwriting, printing, roadshow, listing_fees, other
  cost_type VARCHAR(50) NOT NULL,         -- labor_hours, hard_cost, estimated_fee
  description VARCHAR(255),
  
  -- Labor Hours Fields
  labor_hours DECIMAL(10,2),              -- Total hours spent
  hourly_rate_usd DECIMAL(10,2),          -- USD per hour
  resource_name VARCHAR(100),             -- CFO, General Counsel, etc.
  
  -- Hard Cost Fields
  hard_cost_usd DECIMAL(15,2),            -- Total hard cost
  cost_date DATE,
  vendor_name VARCHAR(255),
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  
  -- Timeline & Milestone
  phase_id INT,                           -- 1-8
  milestone_name VARCHAR(100),
  planned_completion_date DATE,
  actual_completion_date DATE,
  
  -- Tracking
  status VARCHAR(50) DEFAULT 'estimated',  -- estimated, incurred, paid, pending_approval
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_user_id UUID REFERENCES users(id),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_ipo_costs_company_id` — Query costs by company
- `idx_ipo_costs_category` — Filter by cost category
- `idx_ipo_costs_phase_id` — Analyze costs by phase
- `idx_ipo_costs_status` — Workflow filtering
- `idx_ipo_costs_cost_date` — Timeline sorting
- `idx_ipo_costs_milestone` — Milestone tracking

### Key Features
- **Dual tracking:** Support both labor hours (internal) and hard costs (vendor)
- **Approval workflow:** Status tracking with approver audit trail
- **Phase mapping:** Link costs to IPO readiness phases
- **Timeline visibility:** Track planned vs actual completion
- **Document attachment:** Store invoice URLs for compliance

### Example Usage
```sql
-- Total hard costs by category
SELECT cost_category, SUM(hard_cost_usd) as total_cost
FROM ipo_costs
WHERE company_id = 'company-uuid' AND cost_type = 'hard_cost'
GROUP BY cost_category;

-- Labor hours by resource
SELECT resource_name, SUM(labor_hours) * hourly_rate_usd as total_cost
FROM ipo_costs
WHERE company_id = 'company-uuid' AND cost_type = 'labor_hours'
GROUP BY resource_name, hourly_rate_usd;

-- Phase-by-phase cost breakdown
SELECT phase_id, milestone_name, COUNT(*), SUM(hard_cost_usd)
FROM ipo_costs
WHERE company_id = 'company-uuid'
GROUP BY phase_id, milestone_name
ORDER BY phase_id;
```

---

## Table 2: financial_tracking
**Purpose:** Monthly budget vs actual comparison for IPO readiness spending

### Columns
```sql
CREATE TABLE IF NOT EXISTS financial_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  fiscal_month INT NOT NULL,               -- 1-12
  fiscal_year INT NOT NULL,
  
  -- Budget columns
  total_budget_usd DECIMAL(15,2),
  legal_budget_usd DECIMAL(12,2),
  audit_budget_usd DECIMAL(12,2),
  accounting_budget_usd DECIMAL(12,2),
  investment_banking_budget_usd DECIMAL(12,2),
  consulting_budget_usd DECIMAL(12,2),
  other_budget_usd DECIMAL(12,2),
  
  -- Actual spending columns
  total_actual_usd DECIMAL(15,2),
  legal_actual_usd DECIMAL(12,2),
  audit_actual_usd DECIMAL(12,2),
  accounting_actual_usd DECIMAL(12,2),
  investment_banking_actual_usd DECIMAL(12,2),
  consulting_actual_usd DECIMAL(12,2),
  other_actual_usd DECIMAL(12,2),
  
  -- Variance analysis
  total_variance_usd DECIMAL(15,2),        -- actual - budget
  variance_percentage DECIMAL(5,2),        -- (actual - budget) / budget * 100
  variance_status VARCHAR(50),             -- on_budget, over_budget, under_budget
  
  -- Tracking
  forecast_completion BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, fiscal_year, fiscal_month)
);
```

### Indexes
- `idx_financial_tracking_company_id` — Company queries
- `idx_financial_tracking_period` — Year/month sorting
- `idx_financial_tracking_variance` — Variance reporting

### Key Features
- **Category breakdown:** Track budget and actual for 7 cost categories
- **Automatic variance calculation:** Variance in USD and percentage
- **Status classification:** On budget / over / under for quick identification
- **Monthly cadence:** One record per company per fiscal month
- **Forecast tracking:** Distinguish final vs preliminary numbers

### Example Usage
```sql
-- 2026 YTD spending by category
SELECT 
  SUM(legal_actual_usd) as legal_total,
  SUM(audit_actual_usd) as audit_total,
  SUM(investment_banking_actual_usd) as ib_total,
  SUM(total_actual_usd) as grand_total
FROM financial_tracking
WHERE company_id = 'company-uuid' AND fiscal_year = 2026 AND fiscal_month <= 6;

-- Variance trend analysis
SELECT 
  fiscal_month,
  total_budget_usd,
  total_actual_usd,
  variance_percentage,
  variance_status
FROM financial_tracking
WHERE company_id = 'company-uuid' AND fiscal_year = 2026
ORDER BY fiscal_month;

-- Categories over budget
SELECT cost_category, SUM(variance_usd) as overage
FROM (
  SELECT 'legal' as cost_category, legal_budget_usd - legal_actual_usd as variance_usd
  UNION ALL
  SELECT 'audit', audit_budget_usd - audit_actual_usd
  UNION ALL
  SELECT 'investment_banking', investment_banking_budget_usd - investment_banking_actual_usd
) variances
WHERE variance_usd < 0
GROUP BY cost_category;
```

---

## Table 3: dilution_scenarios
**Purpose:** Cap table snapshots showing effect of future financing, warrants, and conversions

### Columns
```sql
CREATE TABLE IF NOT EXISTS dilution_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  scenario_name VARCHAR(255) NOT NULL,     -- Series B $50M, Employee Options Pool, etc.
  scenario_type VARCHAR(50) NOT NULL,      -- new_financing, warrant_exercise, option_pool, convertible_note, custom
  
  -- Scenario parameters
  new_shares_issued DECIMAL(18,6),
  issue_price_usd DECIMAL(15,6),
  total_raise_usd DECIMAL(15,2),
  warrant_conversion_pct DECIMAL(5,2),
  option_pool_increase_pct DECIMAL(5,2),
  
  -- Pre-transaction state
  pre_transaction_fully_diluted_shares DECIMAL(18,6),
  pre_transaction_post_money_valuation_usd DECIMAL(15,2),
  
  -- Post-transaction state
  post_transaction_fully_diluted_shares DECIMAL(18,6),
  post_transaction_post_money_valuation_usd DECIMAL(15,2),
  
  -- Dilution metrics
  founder_dilution_pct DECIMAL(5,2),
  employee_dilution_pct DECIMAL(5,2),
  series_a_dilution_pct DECIMAL(5,2),
  
  -- Cap table snapshot (JSONB array)
  cap_table_snapshot JSONB NOT NULL,       -- Full shareholder list with pre/post ownership
  warrant_details JSONB,
  convertible_conversions JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',      -- draft, approved, executed, archived
  approved_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_dilution_scenarios_company_id`
- `idx_dilution_scenarios_type`
- `idx_dilution_scenarios_status`
- `idx_dilution_scenarios_created_at`

### Key Features
- **Full scenario modeling:** Parameters for all financing/warrant/option scenarios
- **Pre/post comparison:** Track fully diluted shares and valuation before/after
- **Dilution analysis:** Calculate dilution to each stakeholder group
- **JSONB snapshots:** Store complete cap table with all shareholders
- **Audit trail:** Track which scenarios were approved/executed

### JSONB Structure Examples
```json
{
  "cap_table_snapshot": [
    {
      "shareholder_name": "Founder Jane",
      "share_class": "Common",
      "shares_pre": 10000000,
      "pct_pre": 55.5,
      "shares_post": 8500000,
      "pct_post": 42.1,
      "vesting_status": "fully_vested"
    },
    {
      "shareholder_name": "Series A Fund",
      "share_class": "Series A Preferred",
      "shares_pre": 2000000,
      "pct_pre": 11.1,
      "shares_post": 2000000,
      "pct_post": 9.9,
      "liquidation_preference_usd": 2000000
    }
  ],
  "warrant_details": [
    {
      "holder": "Investor X",
      "warrant_quantity": 500000,
      "exercise_price_usd": 1.50,
      "expiry_date": "2028-06-30",
      "conversion_assumption": true
    }
  ],
  "convertible_conversions": [
    {
      "note_holder": "Seed Fund",
      "note_amount_usd": 500000,
      "conversion_discount": 0.20,
      "valuation_cap_usd": 25000000,
      "resulting_shares": 333333
    }
  ]
}
```

### Example Usage
```sql
-- Compare all scenarios to see dilution impact
SELECT 
  scenario_name,
  scenario_type,
  founder_dilution_pct,
  employee_dilution_pct,
  post_transaction_post_money_valuation_usd,
  status
FROM dilution_scenarios
WHERE company_id = 'company-uuid'
ORDER BY created_at DESC;

-- Extract individual shareholder ownership across scenarios
SELECT 
  scenario_name,
  scenario->>'shareholder_name' as shareholder,
  (scenario->>'pct_pre')::DECIMAL as ownership_pre,
  (scenario->>'pct_post')::DECIMAL as ownership_post
FROM dilution_scenarios,
  JSONB_ARRAY_ELEMENTS(cap_table_snapshot) AS scenario
WHERE company_id = 'company-uuid'
ORDER BY scenario_name, ownership_post DESC;
```

---

## Table 4: listing_requirements
**Purpose:** Exchange-specific requirements and validation checklist

### Columns
```sql
CREATE TABLE IF NOT EXISTS listing_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  exchange_code VARCHAR(20) NOT NULL,     -- TSX, NASDAQ, NYSE, TSXV, CSE, JSE, OTC
  requirement_code VARCHAR(100) NOT NULL, -- TSX_MIN_PUBLIC_FLOAT, NASDAQ_BOARD_COMPOSITION
  requirement_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Requirement specifics
  category VARCHAR(100),                  -- governance, financial, disclosure, operational, audit
  requirement_type VARCHAR(50),           -- must_have, should_have, nice_to_have
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'not_started',  -- not_started, in_progress, completed, exemption_applied, na
  completion_pct INT DEFAULT 0,           -- 0-100
  
  -- Validation
  validation_method VARCHAR(255),
  validation_date DATE,
  is_compliant BOOLEAN,                   -- NULL=unknown, TRUE=compliant, FALSE=non-compliant
  exception_approved BOOLEAN DEFAULT FALSE,
  exception_details TEXT,
  
  -- Deadline tracking
  deadline_date DATE,
  days_until_deadline INT,                -- Calculated for easy sorting
  
  -- Document reference
  supporting_document_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, exchange_code, requirement_code)
);
```

### Indexes
- `idx_listing_requirements_company_id`
- `idx_listing_requirements_exchange` — Filter by exchange
- `idx_listing_requirements_status` — Workflow view
- `idx_listing_requirements_compliance` — Compliance dashboard
- `idx_listing_requirements_deadline` — Deadline alerts

### Key Features
- **Exchange-specific:** Validate against TSX, NASDAQ, NYSE, TSXV, CSE, JSE, OTC rules
- **Category organization:** Group by governance, financial, disclosure, operational, audit
- **Completion tracking:** 0-100% progress on each requirement
- **Exemption management:** Track approved exceptions/waivers
- **Deadline alerts:** Automatic calculation of days remaining
- **Document attachment:** Store supporting documentation

### Example Usage
```sql
-- Compliance dashboard for TSX listing
SELECT 
  category,
  COUNT(*) as total_requirements,
  SUM(CASE WHEN is_compliant = true THEN 1 ELSE 0 END) as compliant,
  SUM(CASE WHEN is_compliant = false THEN 1 ELSE 0 END) as non_compliant,
  SUM(CASE WHEN exception_approved = true THEN 1 ELSE 0 END) as exceptions
FROM listing_requirements
WHERE company_id = 'company-uuid' AND exchange_code = 'TSX'
GROUP BY category;

-- Overdue requirements (no exception)
SELECT 
  requirement_name,
  deadline_date,
  CURRENT_DATE - deadline_date as days_overdue,
  status
FROM listing_requirements
WHERE company_id = 'company-uuid' 
  AND deadline_date < CURRENT_DATE 
  AND is_compliant = false
  AND exception_approved = false
ORDER BY deadline_date;

-- Upcoming milestones (next 30 days)
SELECT 
  requirement_name,
  deadline_date,
  status,
  completion_pct
FROM listing_requirements
WHERE company_id = 'company-uuid' 
  AND deadline_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND status != 'completed'
ORDER BY deadline_date;
```

---

## Table 5: corporate_resolutions
**Purpose:** Board and shareholder resolutions required for IPO process

### Columns
```sql
CREATE TABLE IF NOT EXISTS corporate_resolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  resolution_type VARCHAR(100) NOT NULL,   -- board_authorization, share_split, stock_option_plan, 
                                            -- director_appointment, audit_committee_formation, etc.
  resolution_title VARCHAR(255) NOT NULL,
  resolution_date DATE,
  description TEXT,                        -- Full text/summary
  
  -- Approval tracking
  approval_status VARCHAR(50) DEFAULT 'pending',  -- pending, approved, rejected, conditional
  approved_by_board BOOLEAN DEFAULT FALSE,
  approved_by_shareholders BOOLEAN DEFAULT FALSE,
  approval_percentage_votes DECIMAL(5,2),  -- % of votes for approval (if shareholder)
  
  -- Timeline
  required_by_phase INT,                   -- Which phase requires this
  deadline_date DATE,
  approval_meeting_date DATE,
  
  -- Document management
  resolution_document_url TEXT,
  board_minutes_url TEXT,
  shareholder_vote_record_url TEXT,
  
  -- Governance
  status VARCHAR(50) DEFAULT 'draft',      -- draft, ready_for_approval, approved, archived
  prepared_by_user_id UUID REFERENCES users(id),
  reviewed_by_user_id UUID REFERENCES users(id),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_corporate_resolutions_company_id`
- `idx_corporate_resolutions_type`
- `idx_corporate_resolutions_status`
- `idx_corporate_resolutions_phase`
- `idx_corporate_resolutions_deadline`

### Key Features
- **Resolution types:** Board and shareholder authorizations for IPO process
- **Approval tracking:** Board vs shareholder approval with vote percentages
- **Phase mapping:** Link to PACE phases requiring this resolution
- **Document management:** Store resolution documents and meeting minutes
- **Audit trail:** Track who prepared and reviewed each resolution

### Example Usage
```sql
-- Resolutions required before Phase 3
SELECT 
  resolution_type,
  resolution_title,
  approval_status,
  deadline_date
FROM corporate_resolutions
WHERE company_id = 'company-uuid' AND required_by_phase <= 3
ORDER BY deadline_date;

-- Resolutions pending board approval
SELECT 
  resolution_title,
  status,
  prepared_by_user_id,
  deadline_date
FROM corporate_resolutions
WHERE company_id = 'company-uuid' 
  AND approval_status = 'pending'
  AND approved_by_board = false
ORDER BY deadline_date;

-- Resolutions approval summary
SELECT 
  resolution_type,
  COUNT(*) as total,
  SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved
FROM corporate_resolutions
WHERE company_id = 'company-uuid'
GROUP BY resolution_type;
```

---

## Table 6: consent_letters
**Purpose:** Shareholder and stakeholder consent tracking

### Columns
```sql
CREATE TABLE IF NOT EXISTS consent_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  consent_type VARCHAR(100) NOT NULL,      -- shareholder_consent, director_consent, officer_consent, 
                                            -- vendor_consent, lender_consent, founder_agreement, etc.
  from_entity_name VARCHAR(255) NOT NULL,  -- Jane Doe, Acme Capital LP, etc.
  from_entity_type VARCHAR(50) NOT NULL,   -- individual, corporation, partnership, fund
  
  -- Entity details
  from_entity_email VARCHAR(255),
  from_entity_phone VARCHAR(20),
  from_entity_address TEXT,
  
  -- Consent specifics
  consent_topic VARCHAR(255),              -- Related Party Transaction, Director Appointment, etc.
  consent_description TEXT,
  required_phase INT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',    -- pending, sent, signed, rejected, expired
  sent_date DATE,
  signed_date DATE,
  expiry_date DATE,
  
  -- Document management
  consent_template_url TEXT,
  signed_document_url TEXT,
  signature_method VARCHAR(50),            -- esign, wet_signature, email_approval, other
  
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
```

### Indexes
- `idx_consent_letters_company_id`
- `idx_consent_letters_type` — Filter by consent type
- `idx_consent_letters_status` — Workflow view
- `idx_consent_letters_from_entity` — Track by entity
- `idx_consent_letters_deadline` — Expiry alerts
- `idx_consent_letters_follow_up` — Follow-up actions

### Key Features
- **Consent types:** Shareholder, director, officer, vendor, lender, founder agreements
- **Entity tracking:** Store entity details and contact information
- **Signature methods:** Support e-signature, wet signature, email approvals
- **Follow-up management:** Track follow-up counts and dates
- **Expiry alerts:** Monitor expiration dates for revalidation
- **Document storage:** Templates and signed versions

### Example Usage
```sql
-- Outstanding consents by type
SELECT 
  consent_type,
  COUNT(*) as total_outstanding,
  COUNT(CASE WHEN follow_up_required THEN 1 END) as needs_followup
FROM consent_letters
WHERE company_id = 'company-uuid' 
  AND status IN ('pending', 'sent')
GROUP BY consent_type;

-- Expired or expiring consents
SELECT 
  consent_type,
  from_entity_name,
  expiry_date,
  CASE 
    WHEN expiry_date < CURRENT_DATE THEN 'Expired'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
  END as status
FROM consent_letters
WHERE company_id = 'company-uuid' 
  AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY expiry_date;

-- Consent collection progress
SELECT 
  consent_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'signed' AND accepted = true THEN 1 ELSE 0 END) as obtained,
  SUM(CASE WHEN status = 'rejected' OR accepted = false THEN 1 ELSE 0 END) as rejected
FROM consent_letters
WHERE company_id = 'company-uuid'
GROUP BY consent_type;
```

---

## Integration Points with Existing Schema

### Foreign Key References
All six tables reference:
- `companies(id)` — Main company record
- `users(id)` — For approval tracking (ipo_costs, corporate_resolutions)

### Relationship to Existing Tables
- **ipo_benchmarks** — Existing; used to validate IPO cost reasonableness
- **cap_table_entries** — Existing; dilution_scenarios use this as baseline
- **investor_rounds** — Existing; dilution_scenarios model future rounds
- **companies** — Existing; all six tables use as primary FK
- **ipo_phases** (implicit from PACE system) — Referenced via phase_id in multiple tables

### Data Flow
```
IPOReady PACE Phases
  ↓
  → ipo_costs (track spending per phase)
  → corporate_resolutions (required approvals per phase)
  → listing_requirements (requirements per phase)
  → consent_letters (consents required per phase)

cap_table_entries + investor_rounds
  ↓
  → dilution_scenarios (future financing impact)

ipo_costs + financial_tracking
  ↓
  → Budget monitoring & forecasting
```

---

## Query Patterns for Dashboard

### Cost Dashboard
```sql
-- Total IPO costs by category
SELECT cost_category, SUM(hard_cost_usd) as total, COUNT(*) as line_items
FROM ipo_costs
WHERE company_id = ? AND cost_type = 'hard_cost'
GROUP BY cost_category
ORDER BY total DESC;

-- Pending approvals
SELECT COUNT(*) FROM ipo_costs
WHERE company_id = ? AND status = 'pending_approval';
```

### Financial Dashboard
```sql
-- Current month status
SELECT 
  COALESCE(SUM(total_budget_usd), 0) as budget,
  COALESCE(SUM(total_actual_usd), 0) as actual,
  COALESCE(SUM(total_variance_usd), 0) as variance
FROM financial_tracking
WHERE company_id = ? AND fiscal_year = YEAR(NOW()) AND fiscal_month = MONTH(NOW());
```

### Compliance Dashboard
```sql
-- Compliance status by exchange
SELECT 
  exchange_code,
  COUNT(*) as total,
  SUM(CASE WHEN is_compliant = true THEN 1 ELSE 0 END) as compliant_pct
FROM listing_requirements
WHERE company_id = ?
GROUP BY exchange_code;
```

### Consent Tracking Dashboard
```sql
-- Consent collection status
SELECT 
  SUM(CASE WHEN status = 'signed' THEN 1 ELSE 0 END) as signed,
  SUM(CASE WHEN status IN ('pending', 'sent') THEN 1 ELSE 0 END) as outstanding,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM consent_letters
WHERE company_id = ?;
```

---

## Implementation Checklist

- [ ] Run migration: `016_ipo_costs_and_tracking.sql`
- [ ] Verify all 6 tables created with correct column types
- [ ] Create indexes and triggers
- [ ] Seed base listing_requirements for each exchange (TSX, NASDAQ, NYSE, etc.)
- [ ] Create API endpoints for CRUD operations
- [ ] Build React components for cost management
- [ ] Build React components for financial tracking
- [ ] Build React components for dilution scenarios
- [ ] Build React components for compliance checklist
- [ ] Build React components for consent tracking
- [ ] Implement approval workflows
- [ ] Add email notifications for deadlines/follow-ups
- [ ] Add reporting and export functionality
- [ ] Load test with 100-1000 cost records per company

---

## Performance Considerations

### Query Optimization
- Indexes on company_id and status fields for fast filtering
- UNIQUE constraints prevent duplicate financial_tracking records
- JSONB queries on cap_table_snapshot may benefit from GIN indexes if queried frequently

### Potential GIN Indexes (if needed)
```sql
CREATE INDEX IF NOT EXISTS idx_dilution_scenarios_snapshot_gin 
  ON dilution_scenarios USING GIN (cap_table_snapshot);
```

### Partition Strategy (Future)
For very large datasets (1000+ companies), consider partitioning:
- `ipo_costs` by company_id
- `financial_tracking` by fiscal_year + company_id
- `consent_letters` by status (pending vs completed)

---

## Security & Compliance

### Data Classification
- **PII:** from_entity_email, from_entity_phone, from_entity_address in consent_letters
- **Financial:** All hard_cost_usd and budget fields
- **Sensitive:** Board minutes, shareholder votes, resolution documents

### Access Control
- All costs/resolutions/consents require company_id verification
- Approval trails track prepared_by and reviewed_by users
- Document URLs should require authentication

### Audit Trail
All tables include:
- `created_at` — When record was created
- `updated_at` — When last modified
- `approved_at` / `signed_date` — Completion timestamps
- User references for approvers/preparers

---

## Testing Strategy

### Unit Tests
- Create ipo_costs with labor_hours vs hard_cost
- Calculate variance_percentage in financial_tracking
- Serialize/deserialize JSONB in dilution_scenarios
- Status workflow transitions

### Integration Tests
- Create complete IPO cost workflow: draft → incurred → paid
- Financial tracking aggregations across months
- Consent letter follow-up reminders
- Listing requirements completion tracking

### Load Tests
- 10,000 ipo_costs records per company
- 100 financial_tracking records per company (12 months × 8+ years)
- 50 dilution_scenarios per company
- 200+ listing_requirements per company
- 500+ consent_letters per company

---

## Maintenance & Monitoring

### Regular Tasks
- Archive completed scenarios (status = 'executed')
- Expire old consent letters (status = 'expired')
- Calculate days_until_deadline for listing_requirements nightly
- Aggregate financial_tracking for dashboard performance

### Alerts to Implement
- Ipo_costs pending approval > 10 days
- Financial_tracking over budget > 10%
- Listing_requirements deadline < 30 days
- Consent letters expired or expiring
- Corporate resolutions overdue

