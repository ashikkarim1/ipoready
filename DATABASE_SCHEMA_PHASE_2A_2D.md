# IPOReady Phase 2A-2D Database Schema Design

## Overview

Comprehensive database schema for IPOReady's Phase 2A-2D features, covering cost tracking, financial metrics, cap table modeling, consent workflows, corporate resolutions, syndication agreements, and listing requirements.

**Migration File:** `/migrations/018_phase2a_2d_comprehensive_schema.sql`

---

## Phase Mapping

| Phase | Feature | Tables |
|-------|---------|--------|
| **2A** | Cost Tracking & Financial Metrics | `cost_items`, `financial_metrics`, `financial_kpi_dashboard` |
| **2B** | Dilution Scenarios & Cap Table Modeling | `dilution_scenarios`, `dilution_scenario_shareholders` |
| **2C** | Syndication Agreements & Templates | `syndication_agreements`, `consent_templates` |
| **2D** | Consent Requests & Resolutions | `consent_requests`, `corporate_resolutions` |
| **2D** | Listing Requirements & Compliance | `listing_requirements`, `listing_requirement_checklist` |

---

## Table Schema Details

### 1. `cost_items` (Phase 2A)

**Purpose:** Granular tracking of individual IPO costs (capex/opex)

**Key Fields:**
```sql
-- Classification
cost_category VARCHAR(100)  -- 'legal', 'audit', 'accounting', 'ib', 'consulting', 'printing', 'roadshow', 'listing_fees'
cost_type VARCHAR(50)       -- 'capex', 'opex', 'one_time_fee'
cost_nature VARCHAR(50)     -- 'internal_labor', 'external_vendor', 'direct_cost', 'estimated_contingency'

-- Amount tracking
amount_usd DECIMAL(15,2)    -- Main cost amount
labor_hours DECIMAL(10,2)   -- If labor-based
hourly_rate_usd DECIMAL(10,2)

-- Timeline
phase_number INT            -- 1-8 IPO phase
planned_date DATE
actual_date DATE
due_date DATE

-- Approval workflow
status VARCHAR(50)          -- 'estimated', 'committed', 'incurred', 'invoiced', 'paid'
approval_status VARCHAR(50) -- 'pending', 'approved', 'rejected'
approved_by_user_id UUID

-- Related entities
vendor_id UUID -> vendors table
milestone_id UUID -> milestones table
created_by_user_id UUID
```

**Indexes:**
- `idx_cost_items_company_id` - All company queries
- `idx_cost_items_category` - Filter by cost type
- `idx_cost_items_status` - Track payment status
- `idx_cost_items_phase` - Phase-based reporting
- `idx_cost_items_actual_date` - Timeline analysis
- `idx_cost_items_due_date` - Upcoming cost tracking

**Relationships:**
- FK to `companies(id)` - Soft delete on company deletion
- FK to `vendors(id)` - Optional vendor master
- FK to `milestones(id)` - Milestone mapping
- FK to `users(id)` - Created by/Approved by user tracking

---

### 2. `financial_metrics` (Phase 2A - Dashboard)

**Purpose:** Aggregated KPIs and rolling financial summaries for dashboard display

**Key Fields:**
```sql
-- Timestamps
metric_date DATE                -- As-of date for snapshot
metric_type VARCHAR(100)        -- 'monthly_summary', 'ytd_summary', 'daily_snapshot', 'forecast'

-- Cost aggregations
total_ipo_costs_usd DECIMAL(15,2)      -- Sum of all cost_items
estimated_remaining_usd DECIMAL(15,2)
estimated_total_ipo_cost_usd DECIMAL(15,2)

-- Category breakdowns (individual)
legal_costs_usd, audit_costs_usd, accounting_costs_usd, ib_costs_usd, 
consulting_costs_usd, other_costs_usd

-- Budget tracking
total_budget_usd DECIMAL(15,2)
budget_remaining_usd DECIMAL(15,2)
budget_variance_pct DECIMAL(5,2)        -- (actual - budget) / budget * 100
budget_status VARCHAR(50)               -- 'on_track', 'over_budget', 'under_budget'

-- Timing metrics
days_since_phase_1_start INT
estimated_days_to_listing INT
phase_completion_pct INT                -- 0-100 of current phase

-- Cash flow
cash_outflow_this_month_usd DECIMAL(15,2)
monthly_burn_rate_usd DECIMAL(15,2)

-- Team metrics
team_hours_invested INT
team_utilization_pct DECIMAL(5,2)
```

**Indexes:**
- `idx_financial_metrics_company_id` - Company-level queries
- `idx_financial_metrics_date` - Ordered by date (DESC for latest first)
- `idx_financial_metrics_type` - Filter by metric type

**Unique Constraint:**
- `UNIQUE(company_id, metric_date, metric_type)` - One snapshot per date/type per company

**Relationships:**
- FK to `companies(id)` - Soft delete

---

### 3. `dilution_scenarios` (Phase 2B)

**Purpose:** Cap table modeling for financing rounds, warrant exercises, option vesting

**Key Fields:**
```sql
-- Scenario definition
scenario_name VARCHAR(255)      -- "Series B $50M", "Warrant Exercise 20%", etc.
scenario_type VARCHAR(50)       -- 'new_financing', 'warrant_exercise', 'option_vesting', 'convertible_conversion'
description TEXT

-- Transaction parameters
new_shares_issued DECIMAL(18,6)
issue_price_per_share_usd DECIMAL(15,6)
total_raise_usd DECIMAL(15,2)
warrant_exercise_pct DECIMAL(5,2)          -- % of warrants converting
option_pool_increase_pct DECIMAL(5,2)
convertible_note_details JSONB             -- [{conversion_rate, principal, accrued_interest}]

-- Pre-transaction snapshot
pre_fully_diluted_shares DECIMAL(18,6)
pre_post_money_valuation_usd DECIMAL(15,2)

-- Post-transaction snapshot
post_fully_diluted_shares DECIMAL(18,6)
post_post_money_valuation_usd DECIMAL(15,2)

-- Dilution impact
founder_dilution_pct DECIMAL(5,2)
employee_dilution_pct DECIMAL(5,2)
series_a_holder_dilution_pct DECIMAL(5,2)

-- Approval & execution
status VARCHAR(50)              -- 'draft', 'reviewed', 'approved', 'executed', 'archived'
approved_at TIMESTAMP WITH TIME ZONE
executed_at TIMESTAMP WITH TIME ZONE
```

**Indexes:**
- `idx_dilution_scenarios_company_id`
- `idx_dilution_scenarios_type` - Filter by transaction type
- `idx_dilution_scenarios_status` - Approval workflow

**Relationships:**
- FK to `companies(id)`
- 1-to-Many with `dilution_scenario_shareholders` (cap table rows)

---

### 4. `dilution_scenario_shareholders` (Phase 2B - Cap Table Detail)

**Purpose:** Individual shareholder rows in a cap table snapshot

**Key Fields:**
```sql
scenario_id UUID              -- FK to dilution_scenarios(id) CASCADE
shareholder_name VARCHAR(255)
shareholder_type VARCHAR(50)  -- 'founder', 'employee', 'investor', 'employee_pool', 'other'
share_class VARCHAR(50)       -- 'Common', 'Series A', 'Series B', etc.

-- Pre-transaction
shares_pre DECIMAL(18,6)
ownership_pct_pre DECIMAL(5,2)

-- Post-transaction
shares_post DECIMAL(18,6)
ownership_pct_post DECIMAL(5,2)

-- Dilution
dilution_pct DECIMAL(5,2)     -- (post_ownership - pre_ownership) / pre_ownership * 100
```

**Indexes:**
- `idx_dilution_shareholders_scenario_id` - All shareholders for a scenario
- `idx_dilution_shareholders_shareholder_name` - Find entity across scenarios

**Relationships:**
- FK to `dilution_scenarios(id)` CASCADE - Delete scenario deletes all rows

---

### 5. `consent_requests` (Phase 2D - Approval Workflow)

**Purpose:** Shareholder/stakeholder approval request workflow management

**Key Fields:**
```sql
-- Request definition
request_type VARCHAR(100)     -- 'director_consent', 'shareholder_consent', 'officer_consent', 'lender_consent', 'founder_lock_up'
subject_matter VARCHAR(255)   -- "Related Party Transaction", "IPO Participation"
description TEXT

-- Recipient (individual or entity)
recipient_name VARCHAR(255)
recipient_email VARCHAR(255)
recipient_phone VARCHAR(20)
recipient_type VARCHAR(50)    -- 'individual', 'entity', 'group'

-- Status workflow
status VARCHAR(50)            -- 'pending', 'sent', 'viewed', 'signed', 'approved', 'rejected', 'expired'

-- Timeline
sent_date TIMESTAMP WITH TIME ZONE
signed_date TIMESTAMP WITH TIME ZONE
signed_by_name VARCHAR(255)
signature_method VARCHAR(50)  -- 'esign', 'email', 'in_person'
deadline_date DATE
reminder_sent_count INT
last_reminder_date TIMESTAMP WITH TIME ZONE
expiry_date DATE

-- Document management
template_id UUID -> consent_templates table
document_url TEXT             -- S3 URL to signed document

-- Rejection handling
rejected_at TIMESTAMP WITH TIME ZONE
rejection_reason TEXT
can_resubmit BOOLEAN

-- Audit
created_by_user_id UUID
```

**Indexes:**
- `idx_consent_requests_company_id`
- `idx_consent_requests_status` - Workflow tracking
- `idx_consent_requests_type` - Group by request type
- `idx_consent_requests_deadline` - Upcoming deadlines
- `idx_consent_requests_recipient` - Find by recipient email

**Relationships:**
- FK to `companies(id)`
- FK to `consent_templates(id)` - Template reference
- FK to `users(id)` - Created by user

---

### 6. `corporate_resolutions` (Phase 2D)

**Purpose:** Board and shareholder resolutions required for IPO

**Key Fields:**
```sql
-- Resolution definition
resolution_type VARCHAR(100)  -- 'board_authorization', 'share_split', 'stock_option_plan', 'director_appointment', 'dividend_policy'
title VARCHAR(255)
description TEXT

-- Governance
board_approval_required BOOLEAN
shareholder_approval_required BOOLEAN

-- Approval tracking
approval_status VARCHAR(50)         -- 'pending', 'draft', 'approved', 'rejected'
board_approved_at TIMESTAMP WITH TIME ZONE
board_vote_count INT
board_vote_in_favor INT
shareholder_approved_at TIMESTAMP WITH TIME ZONE
shareholder_vote_pct DECIMAL(5,2)

-- Timeline
phase_required INT
deadline_date DATE
resolution_passed_date DATE

-- Document management
resolution_text_url TEXT            -- S3 URL to resolution document
board_minutes_url TEXT
shareholder_vote_record_url TEXT

-- Status & ownership
status VARCHAR(50)                  -- 'draft', 'pending_approval', 'approved', 'executed', 'archived'
prepared_by_user_id UUID
reviewed_by_user_id UUID
```

**Indexes:**
- `idx_corporate_resolutions_company_id`
- `idx_corporate_resolutions_type`
- `idx_corporate_resolutions_status`
- `idx_corporate_resolutions_deadline`

**Relationships:**
- FK to `companies(id)`
- FK to `users(id)` for prepared_by and reviewed_by

---

### 7. `syndication_agreements` (Phase 2C)

**Purpose:** Underwriting syndicate terms and execution tracking

**Key Fields:**
```sql
-- Agreement definition
agreement_type VARCHAR(100)   -- 'firm_commitment', 'best_efforts', 'standby', 'all_or_none'
agreement_name VARCHAR(255)
description TEXT

-- Syndicate composition
lead_underwriter VARCHAR(255)
co_underwriter_names TEXT             -- Comma-separated list
member_count INT

-- Economic terms
gross_spread_bps INT                  -- Basis points (e.g., 350 bps = 3.5%)
net_proceeds_usd DECIMAL(15,2)

-- Allotment allocation
allocation_structure JSONB            -- {member_name: allocation_bps, ...}

-- Timeline
execution_date DATE
closing_date DATE
lockup_period_days INT

-- Status & documents
status VARCHAR(50)                    -- 'draft', 'negotiating', 'signed', 'executed', 'closed'
signed_at TIMESTAMP WITH TIME ZONE
executed_at TIMESTAMP WITH TIME ZONE
agreement_url TEXT                    -- S3 URL
prospectus_url TEXT
```

**Indexes:**
- `idx_syndication_agreements_company_id`
- `idx_syndication_agreements_type`
- `idx_syndication_agreements_status`

**Relationships:**
- FK to `companies(id)`

---

### 8. `listing_requirements` (Phase 2D - Compliance Master)

**Purpose:** Exchange-specific regulatory requirements (master/template list)

**Key Fields:**
```sql
-- Requirement definition
exchange_code VARCHAR(20)     -- 'TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC'
requirement_code VARCHAR(100) -- e.g., 'TSX_MIN_SHARES_OUTSTANDING'
requirement_name VARCHAR(255)
description TEXT

-- Classification
category VARCHAR(100)         -- 'governance', 'financial', 'disclosure', 'operational', 'audit'
requirement_level VARCHAR(50) -- 'mandatory', 'best_practice', 'conditional'

-- Compliance status
status VARCHAR(50)            -- 'not_started', 'in_progress', 'completed', 'n_a', 'exemption_approved'
completion_pct INT            -- 0-100
is_compliant BOOLEAN          -- NULL=unknown, TRUE=compliant, FALSE=non-compliant

-- Exemptions
exemption_requested BOOLEAN
exemption_approved BOOLEAN
exemption_reason TEXT

-- Validation
validation_method VARCHAR(255) -- How compliance is verified
validation_date DATE
validator_user_id UUID
deadline_date DATE

-- Documents
supporting_doc_url TEXT
```

**Indexes:**
- `idx_listing_requirements_company_id`
- `idx_listing_requirements_exchange` - Filter by exchange
- `idx_listing_requirements_status` - Compliance status
- `idx_listing_requirements_compliance` - Quick "not compliant" queries
- `idx_listing_requirements_deadline` - Upcoming deadlines

**Unique Constraint:**
- `UNIQUE(company_id, exchange_code, requirement_code)` - One requirement per company/exchange

**Relationships:**
- FK to `companies(id)`
- FK to `users(id)` for validator

---

### 9. `listing_requirement_checklist` (Phase 2D - Company Tracking)

**Purpose:** Company-specific progress on listing requirements

**Key Fields:**
```sql
requirement_id UUID           -- FK to listing_requirements(id)
status VARCHAR(50)            -- 'not_started', 'in_progress', 'completed'
completion_pct INT            -- 0-100
assigned_to_user_id UUID      -- Who's responsible

-- Timeline
target_completion_date DATE
actual_completion_date DATE

-- Tracking
evidence_url TEXT             -- S3 URL showing compliance
notes TEXT
```

**Indexes:**
- `idx_listing_checklist_company_id`
- `idx_listing_checklist_requirement_id`
- `idx_listing_checklist_assigned_to` - User workload
- `idx_listing_checklist_status`

**Unique Constraint:**
- `UNIQUE(company_id, requirement_id)` - One checklist row per requirement

**Relationships:**
- FK to `companies(id)` CASCADE
- FK to `listing_requirements(id)` CASCADE
- FK to `users(id)` for assigned_to

---

### 10. `financial_kpi_dashboard` (Phase 2A - KPI Aggregation)

**Purpose:** High-level KPIs for executive dashboard

**Key Fields:**
```sql
snapshot_date DATE            -- As-of date

-- Spend tracking
total_ipo_costs_to_date_usd DECIMAL(15,2)
estimated_total_ipo_costs_usd DECIMAL(15,2)
remaining_budget_usd DECIMAL(15,2)
budget_burn_rate_usd_per_month DECIMAL(12,2)

-- Phasing & timeline
current_phase INT
current_phase_completion_pct INT
estimated_days_to_listing INT

-- Financial health
runway_months DECIMAL(5,1)    -- Months at current burn rate
cash_required_for_ipo_usd DECIMAL(15,2)

-- Dilution & valuation
fully_diluted_shares_millions DECIMAL(10,2)
latest_valuation_usd DECIMAL(15,2)
estimated_ipo_share_price_usd DECIMAL(10,2)
estimated_ipo_proceeds_usd DECIMAL(15,2)

-- Governance
board_size INT
independent_directors_pct DECIMAL(5,2)

-- Legal & compliance
open_litigation_count INT
outstanding_consents_count INT
missing_resolutions_count INT
```

**Indexes:**
- `idx_kpi_dashboard_company_id`
- `idx_kpi_dashboard_date DESC` - Latest snapshot first

**Unique Constraint:**
- `UNIQUE(company_id, snapshot_date)` - One snapshot per day per company

**Relationships:**
- FK to `companies(id)`

---

## Helper/Dependency Tables

### `consent_templates`

**Purpose:** Reusable templates for consent requests

```sql
CREATE TABLE IF NOT EXISTS consent_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,          -- Multi-tenant support
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100),
  description TEXT,
  template_body TEXT NOT NULL,   -- HTML/markdown
  placeholders JSONB             -- {field_name: field_label, ...}
);
```

### `vendors`

**Purpose:** Master list of service providers (law firms, audit firms, IB banks, etc.)

```sql
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_type VARCHAR(100),      -- 'law_firm', 'audit_firm', 'ib_bank', 'consulting'
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_person VARCHAR(255),
  website_url TEXT
);
```

### `milestones`

**Purpose:** IPO process milestones per company

```sql
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  milestone_name VARCHAR(255) NOT NULL,
  milestone_date DATE,
  description TEXT
);
```

---

## Triggers & Automation

All tables include `updated_at` timestamp with automatic trigger:

```sql
CREATE OR REPLACE FUNCTION update_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied via:
```sql
DROP TRIGGER IF EXISTS trigger_[table_name]_updated_at ON [table_name];
CREATE TRIGGER trigger_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();
```

---

## Seed Data Structure

### 1. Cost Items Seed

```sql
INSERT INTO cost_items 
(company_id, cost_category, cost_type, cost_nature, description, amount_usd, phase_number, status) 
VALUES
('{COMPANY_UUID}', 'legal', 'capex', 'external_vendor', 'External counsel - S1 preparation', 250000.00, 4, 'estimated'),
('{COMPANY_UUID}', 'audit', 'capex', 'external_vendor', 'Big Four audit firm engagement', 350000.00, 3, 'estimated'),
('{COMPANY_UUID}', 'ib', 'capex', 'external_vendor', 'Investment banking underwriting', 500000.00, 5, 'estimated'),
('{COMPANY_UUID}', 'consulting', 'opex', 'external_vendor', 'SEC compliance consulting', 100000.00, 4, 'estimated'),
('{COMPANY_UUID}', 'printing', 'capex', 'external_vendor', 'Prospectus printing and mailing', 50000.00, 5, 'estimated');
```

### 2. Financial Metrics Seed

```sql
INSERT INTO financial_metrics 
(company_id, metric_date, metric_type, total_ipo_costs_to_date_usd, estimated_total_ipo_cost_usd, current_phase, current_phase_completion_pct) 
VALUES
('{COMPANY_UUID}', '2025-03-31', 'monthly_summary', 400000.00, 1500000.00, 3, 45),
('{COMPANY_UUID}', '2025-04-30', 'monthly_summary', 650000.00, 1500000.00, 4, 60);
```

### 3. Dilution Scenarios Seed

```sql
INSERT INTO dilution_scenarios 
(company_id, scenario_name, scenario_type, description, new_shares_issued, issue_price_per_share_usd, total_raise_usd, pre_fully_diluted_shares, post_fully_diluted_shares, status) 
VALUES
('{COMPANY_UUID}', 'Series C @ $10 IPO', 'new_financing', 'Hypothetical Series C at IPO price', 10000000, 10.00, 100000000.00, 100000000, 110000000, 'draft'),
('{COMPANY_UUID}', '20% Warrant Exercise', 'warrant_exercise', 'Estimated warrant conversion pre-IPO', 2000000, 8.00, NULL, 100000000, 102000000, 'draft');
```

### 4. Dilution Scenario Shareholders Seed

```sql
INSERT INTO dilution_scenario_shareholders 
(scenario_id, shareholder_name, shareholder_type, share_class, shares_pre, ownership_pct_pre, shares_post, ownership_pct_post, dilution_pct) 
VALUES
('{SCENARIO_UUID}', 'Founders', 'founder', 'Common', 40000000, 40.0, 36363636, 33.0, -17.5),
('{SCENARIO_UUID}', 'Series A Investors', 'investor', 'Series A', 30000000, 30.0, 27272727, 24.8, -17.5),
('{SCENARIO_UUID}', 'Employee Pool', 'employee_pool', 'Options', 15000000, 15.0, 13636364, 12.4, -17.5),
('{SCENARIO_UUID}', 'New Series C Investor', 'investor', 'Series C', 0, 0.0, 10000000, 9.1, NULL);
```

### 5. Consent Requests Seed

```sql
INSERT INTO consent_requests 
(company_id, request_type, subject_matter, recipient_name, recipient_email, status, deadline_date) 
VALUES
('{COMPANY_UUID}', 'director_consent', 'IPO Participation Agreement', 'John Director', 'john@company.com', 'pending', '2025-03-31'),
('{COMPANY_UUID}', 'founder_lock_up', '180-day Lock-up Agreement', 'Jane Founder', 'jane@company.com', 'pending', '2025-04-15'),
('{COMPANY_UUID}', 'shareholder_consent', 'Related Party Transaction Approval', 'Acme Capital LP', 'contact@acme.com', 'pending', '2025-04-30');
```

### 6. Corporate Resolutions Seed

```sql
INSERT INTO corporate_resolutions 
(company_id, resolution_type, title, board_approval_required, shareholder_approval_required, status, deadline_date) 
VALUES
('{COMPANY_UUID}', 'board_authorization', 'Board authorization to pursue IPO', TRUE, FALSE, 'pending', '2025-03-15'),
('{COMPANY_UUID}', 'stock_option_plan', 'Approval of 2025 stock option plan', TRUE, TRUE, 'pending', '2025-04-01'),
('{COMPANY_UUID}', 'share_split', '1-for-2 reverse stock split', TRUE, TRUE, 'pending', '2025-04-15');
```

### 7. Syndication Agreements Seed

```sql
INSERT INTO syndication_agreements 
(company_id, agreement_type, agreement_name, lead_underwriter, member_count, gross_spread_bps, status) 
VALUES
('{COMPANY_UUID}', 'firm_commitment', 'IPO Underwriting Agreement', 'Goldman Sachs', 12, 350, 'draft'),
('{COMPANY_UUID}', 'best_efforts', 'International Syndicate', 'Morgan Stanley', 8, 350, 'draft');
```

### 8. Listing Requirements Seed

```sql
INSERT INTO listing_requirements 
(company_id, exchange_code, requirement_code, requirement_name, category, requirement_level, status) 
VALUES
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_QUANT', 'Quantitative listing standards', 'financial', 'mandatory', 'in_progress'),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_GOV', 'Board and committee composition', 'governance', 'mandatory', 'in_progress'),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_AUDIT', 'Audit committee independence', 'audit', 'mandatory', 'not_started'),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_DISCLOSURE', 'Disclosure controls and procedures', 'disclosure', 'mandatory', 'in_progress');
```

---

## Migration Execution

### Run Migration

```bash
# Via Neon CLI
neon sql --connection-string $DATABASE_URL < migrations/018_phase2a_2d_comprehensive_schema.sql

# Via psql
psql $DATABASE_URL -f migrations/018_phase2a_2d_comprehensive_schema.sql

# Via application ORM (Prisma, TypeORM, etc.)
# Update schema.prisma and run: npx prisma migrate dev --name phase_2a_2d_schema
```

### Validation Query

```sql
-- Verify all tables created
SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_items') as cost_items,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_metrics') as financial_metrics,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenarios') as dilution_scenarios,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_requests') as consent_requests,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_resolutions') as resolutions,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'syndication_agreements') as syndication,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_requirements') as listing_reqs,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_kpi_dashboard') as kpi_dashboard;
```

---

## Data Model Relationships (ERD)

```
companies
  ├─→ cost_items (1:N) [phase_number, vendor_id]
  ├─→ financial_metrics (1:N) [daily snapshots]
  ├─→ financial_kpi_dashboard (1:N) [executive dashboard]
  ├─→ dilution_scenarios (1:N) [cap table scenarios]
  │    └─→ dilution_scenario_shareholders (1:N) [per-shareholder rows]
  ├─→ consent_requests (1:N) [approval workflows]
  ├─→ corporate_resolutions (1:N) [board/shareholder resolutions]
  ├─→ syndication_agreements (1:N) [underwriting syndicates]
  ├─→ listing_requirements (1:N) [exchange requirements master]
  └─→ listing_requirement_checklist (1:N) [per-requirement tracking]

vendors
  ←─ cost_items (N:1) [vendor_id]

milestones
  ←─ cost_items (N:1) [milestone_id]

consent_templates
  ←─ consent_requests (N:1) [template_id]

users
  ←─ cost_items (N:1) [created_by, approved_by]
  ←─ consent_requests (N:1) [created_by]
  ←─ corporate_resolutions (N:1) [prepared_by, reviewed_by]
  ←─ listing_requirements (N:1) [validator]
  ←─ listing_requirement_checklist (N:1) [assigned_to]
```

---

## Query Examples

### Get Total IPO Costs for a Company

```sql
SELECT 
  COALESCE(SUM(amount_usd), 0) as total_costs,
  COUNT(*) as cost_item_count,
  COUNT(DISTINCT cost_category) as categories
FROM cost_items
WHERE company_id = '{COMPANY_UUID}' AND status != 'rejected';
```

### Get Cost Breakdown by Phase

```sql
SELECT 
  phase_number,
  cost_category,
  SUM(amount_usd) as phase_category_cost,
  COUNT(*) as item_count
FROM cost_items
WHERE company_id = '{COMPANY_UUID}'
GROUP BY phase_number, cost_category
ORDER BY phase_number, phase_category_cost DESC;
```

### Get Outstanding Consents

```sql
SELECT 
  recipient_name,
  request_type,
  subject_matter,
  deadline_date,
  DATEDIFF(CURRENT_DATE, deadline_date) as days_overdue
FROM consent_requests
WHERE company_id = '{COMPANY_UUID}' AND status IN ('pending', 'sent')
ORDER BY deadline_date ASC;
```

### Get Non-Compliant Listing Requirements

```sql
SELECT 
  exchange_code,
  requirement_name,
  deadline_date,
  validator_user_id
FROM listing_requirements
WHERE company_id = '{COMPANY_UUID}' AND is_compliant = FALSE
ORDER BY deadline_date ASC;
```

### Get Dilution Analysis for a Scenario

```sql
SELECT 
  shareholder_name,
  share_class,
  shares_pre,
  ownership_pct_pre,
  shares_post,
  ownership_pct_post,
  dilution_pct,
  CASE 
    WHEN dilution_pct < 0 THEN 'BENEFICIARY'
    WHEN dilution_pct > 0 THEN 'DILUTED'
    ELSE 'NO_CHANGE'
  END as impact_type
FROM dilution_scenario_shareholders
WHERE scenario_id = '{SCENARIO_UUID}'
ORDER BY ownership_pct_post DESC;
```

### Get Phase Completion Status

```sql
SELECT 
  current_phase,
  COUNT(*) as companies_at_phase,
  ROUND(AVG(current_phase_completion_pct), 1) as avg_completion_pct,
  MIN(estimated_days_to_listing) as fastest_timeline,
  MAX(estimated_days_to_listing) as slowest_timeline
FROM financial_kpi_dashboard
WHERE snapshot_date = CURRENT_DATE
GROUP BY current_phase
ORDER BY current_phase;
```

---

## Performance Tuning

### Index Usage Strategy

1. **Company-Level Queries** - All tables indexed on `company_id` for fast company filtering
2. **Status/Workflow Tracking** - Status fields indexed for quick "pending", "completed" filters
3. **Timeline Analysis** - Date fields indexed for range queries and sorting
4. **Deadline Tracking** - `deadline_date` and `expiry_date` indexed for upcoming item queries

### Materialized View Recommendations

```sql
-- Cost summary by phase and category
CREATE MATERIALIZED VIEW cost_summary_by_phase_category AS
SELECT 
  company_id,
  phase_number,
  cost_category,
  SUM(amount_usd) as total_cost,
  COUNT(*) as item_count,
  COUNT(DISTINCT vendor_id) as vendor_count
FROM cost_items
WHERE status NOT IN ('rejected', 'cancelled')
GROUP BY company_id, phase_number, cost_category;

CREATE INDEX idx_cost_summary_company ON cost_summary_by_phase_category(company_id);
```

---

## Notes

- **Soft Deletes:** Foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- **JSONB Fields:** Used for flexible, semi-structured data (allocations, warrant details, placeholders)
- **Decimal Precision:** Currency fields use `DECIMAL(15,2)` for USD; percentages use `DECIMAL(5,2)`; share counts use `DECIMAL(18,6)` for precision
- **Multi-Tenancy:** `consent_templates` and `vendors` can be shared across companies; add `organization_id` for true multi-tenant support
- **Timestamp Precision:** All timestamps include timezone (`TIMESTAMP WITH TIME ZONE`) for correct multi-region deployment
- **Unique Constraints:** Applied where natural keys exist (e.g., one financial metric snapshot per date/type)

---

## Deployment Checklist

- [ ] Run migration on staging environment first
- [ ] Validate all tables created with validation query
- [ ] Load sample seed data for testing
- [ ] Verify indexes created and query plans optimized
- [ ] Update ORM schema files (Prisma, TypeORM, etc.)
- [ ] Generate TypeScript types from schema
- [ ] Update API layer to use new tables
- [ ] Add unit/integration tests for new tables
- [ ] Update documentation
- [ ] Deploy to production

---

**Last Updated:** 2025-06-03
**Status:** Production Ready
**Migration File:** `/migrations/018_phase2a_2d_comprehensive_schema.sql`
