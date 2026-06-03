# Migration 020: Comprehensive Schema Reference

**Migration ID:** 020  
**Date:** 2026-06-03  
**Tables:** 9 (6 primary + 3 helper)  
**Indexes:** 31  
**Triggers:** 5  
**Foreign Keys:** 15+  

---

## Table 1: cost_items

**Purpose:** Granular tracking of individual costs (capex, opex, labor)  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 500-5,000 per company  
**Update Frequency:** Daily during IPO process  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_id | UUID | NO | — | References companies(id) ON DELETE CASCADE |
| cost_category | VARCHAR(100) | NO | — | 'legal', 'audit', 'accounting', 'ib', 'consulting', 'printing', 'roadshow', 'listing_fees', 'employee_related', 'other' |
| cost_type | VARCHAR(50) | NO | — | 'capex', 'opex', 'one_time_fee' |
| cost_nature | VARCHAR(50) | NO | — | 'internal_labor', 'external_vendor', 'direct_cost', 'estimated_contingency' |
| description | TEXT | YES | NULL | Human-readable description |
| vendor_id | UUID | YES | NULL | References vendors(id) ON DELETE SET NULL |
| vendor_name | VARCHAR(255) | YES | NULL | Denormalized for convenience |
| amount_usd | DECIMAL(15,2) | NO | — | Cost amount in USD |
| currency | VARCHAR(3) | YES | 'USD' | ISO 4217 currency code |
| labor_hours | DECIMAL(10,2) | YES | NULL | If labor cost |
| hourly_rate_usd | DECIMAL(10,2) | YES | NULL | If labor cost |
| resource_name | VARCHAR(100) | YES | NULL | Person who performed work |
| phase_number | INT | YES | NULL | IPO process phase (1-8) |
| phase_name | VARCHAR(100) | YES | NULL | Phase name for readability |
| milestone_id | UUID | YES | NULL | References milestones(id) ON DELETE SET NULL |
| planned_date | DATE | YES | NULL | When cost was planned |
| actual_date | DATE | YES | NULL | When cost was incurred |
| due_date | DATE | YES | NULL | When cost is/was due |
| status | VARCHAR(50) | YES | 'estimated' | 'estimated', 'committed', 'incurred', 'invoiced', 'paid' |
| approval_status | VARCHAR(50) | YES | 'pending' | 'pending', 'approved', 'rejected' |
| approved_by_user_id | UUID | YES | NULL | References users(id) ON DELETE SET NULL |
| approved_at | TIMESTAMP WITH TIME ZONE | YES | NULL | When cost was approved |
| invoice_number | VARCHAR(100) | YES | NULL | Vendor invoice number |
| invoice_url | TEXT | YES | NULL | S3 URL to invoice document |
| notes | TEXT | YES | NULL | Additional notes |
| tags | JSONB | YES | NULL | ["legal", "urgent", "vendor_specific"] |
| created_by_user_id | UUID | YES | NULL | References users(id) ON DELETE SET NULL |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp (auto-updated by trigger) |

### Indexes
```
idx_cost_items_company_id      -- Frequent filter
idx_cost_items_category        -- Category rollups
idx_cost_items_type            -- Capex vs Opex analysis
idx_cost_items_status          -- Status transitions
idx_cost_items_phase           -- Phase analysis
idx_cost_items_actual_date     -- Timeline queries
idx_cost_items_due_date        -- Deadline tracking
idx_cost_items_vendor_id       -- Vendor analysis
```

### Unique Constraints
None (allows duplicate costs for same vendor/category)

### Foreign Keys
```
cost_items.company_id       -> companies.id (CASCADE)
cost_items.vendor_id        -> vendors.id (SET NULL)
cost_items.milestone_id     -> milestones.id (SET NULL)
cost_items.created_by_user_id -> users.id (SET NULL)
cost_items.approved_by_user_id -> users.id (SET NULL)
```

### Trigger
```
trigger_cost_items_updated_at
  Before UPDATE
  Updates updated_at to NOW()
```

### Sample Queries

```sql
-- Total IPO costs by category
SELECT cost_category, SUM(amount_usd) as total
FROM cost_items
WHERE company_id = 'xyz' AND status IN ('incurred', 'invoiced', 'paid')
GROUP BY cost_category
ORDER BY total DESC;

-- Costs due next 30 days
SELECT description, vendor_name, amount_usd, due_date
FROM cost_items
WHERE company_id = 'xyz'
  AND due_date BETWEEN NOW()::date AND NOW()::date + interval '30 days'
ORDER BY due_date ASC;

-- Budget variance analysis
SELECT 
  phase_number,
  SUM(CASE WHEN status IN ('estimated', 'committed') THEN amount_usd ELSE 0 END) as projected,
  SUM(CASE WHEN status IN ('incurred', 'invoiced', 'paid') THEN amount_usd ELSE 0 END) as actual,
  (SUM(CASE WHEN status IN ('incurred', 'invoiced', 'paid') THEN amount_usd ELSE 0 END) -
   SUM(CASE WHEN status IN ('estimated', 'committed') THEN amount_usd ELSE 0 END)) / 
  NULLIF(SUM(CASE WHEN status IN ('estimated', 'committed') THEN amount_usd ELSE 0 END), 0) * 100 as variance_pct
FROM cost_items
WHERE company_id = 'xyz'
GROUP BY phase_number
ORDER BY phase_number;
```

---

## Table 2: financial_metrics

**Purpose:** Aggregated dashboard KPIs and financial summaries  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 30-120 per company  
**Update Frequency:** Daily or after cost changes  
**Unique Key:** (company_id, metric_date, metric_type)  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_id | UUID | NO | — | References companies(id) ON DELETE CASCADE |
| metric_date | DATE | NO | — | As-of date for this snapshot |
| metric_type | VARCHAR(100) | NO | — | 'monthly_summary', 'ytd_summary', 'daily_snapshot', 'forecast' |
| total_ipo_costs_usd | DECIMAL(15,2) | YES | NULL | Sum of all cost_items to date |
| estimated_remaining_usd | DECIMAL(15,2) | YES | NULL | Projected remaining costs |
| estimated_total_ipo_cost_usd | DECIMAL(15,2) | YES | NULL | Total estimated IPO cost |
| legal_costs_usd | DECIMAL(12,2) | YES | NULL | Category breakdown |
| audit_costs_usd | DECIMAL(12,2) | YES | NULL | Category breakdown |
| accounting_costs_usd | DECIMAL(12,2) | YES | NULL | Category breakdown |
| ib_costs_usd | DECIMAL(12,2) | YES | NULL | Category breakdown |
| consulting_costs_usd | DECIMAL(12,2) | YES | NULL | Category breakdown |
| other_costs_usd | DECIMAL(12,2) | YES | NULL | Category breakdown |
| total_budget_usd | DECIMAL(15,2) | YES | NULL | Allocated budget |
| budget_remaining_usd | DECIMAL(15,2) | YES | NULL | Remaining budget |
| budget_variance_pct | DECIMAL(5,2) | YES | NULL | (actual - budget) / budget * 100 |
| budget_status | VARCHAR(50) | YES | NULL | 'on_track', 'over_budget', 'under_budget' |
| days_since_phase_1_start | INT | YES | NULL | Timeline indicator |
| estimated_days_to_listing | INT | YES | NULL | ETA to IPO |
| phase_completion_pct | INT | YES | NULL | 0-100 of current phase |
| cash_outflow_this_month_usd | DECIMAL(15,2) | YES | NULL | Monthly cash burn |
| monthly_burn_rate_usd | DECIMAL(15,2) | YES | NULL | Average monthly burn |
| team_hours_invested | INT | YES | NULL | Internal labor hours |
| team_utilization_pct | DECIMAL(5,2) | YES | NULL | Team allocation % |
| notes | TEXT | YES | NULL | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp (auto-updated by trigger) |

### Indexes
```
idx_financial_metrics_company_id       -- Company filter
idx_financial_metrics_date             -- Timeline queries
idx_financial_metrics_type             -- Metric type filter
idx_financial_metrics_company_date     -- Dashboard queries
```

### Unique Constraints
```
UNIQUE(company_id, metric_date, metric_type)
  Prevents duplicate snapshots for same date/type
```

### Foreign Keys
```
financial_metrics.company_id -> companies.id (CASCADE)
```

### Trigger
```
trigger_financial_metrics_updated_at
  Before UPDATE
  Updates updated_at to NOW()
```

### Sample Queries

```sql
-- Latest financial snapshot
SELECT * FROM financial_metrics
WHERE company_id = 'xyz' AND metric_type = 'daily_snapshot'
ORDER BY metric_date DESC
LIMIT 1;

-- Budget tracking over time
SELECT metric_date, total_ipo_costs_usd, total_budget_usd, budget_variance_pct
FROM financial_metrics
WHERE company_id = 'xyz' AND metric_type = 'monthly_summary'
ORDER BY metric_date ASC;

-- Dashboard KPI summary
SELECT 
  metric_date,
  estimated_total_ipo_cost_usd,
  estimated_days_to_listing,
  phase_completion_pct,
  monthly_burn_rate_usd,
  budget_status
FROM financial_metrics
WHERE company_id = 'xyz'
ORDER BY metric_date DESC
LIMIT 1;
```

---

## Table 3: dilution_scenarios

**Purpose:** Cap table modeling for financing rounds and transactions  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 5-50 per company  
**Update Frequency:** Ad-hoc during financing discussions  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_id | UUID | NO | — | References companies(id) ON DELETE CASCADE |
| scenario_name | VARCHAR(255) | NO | — | e.g., "Series C @ $100M" |
| scenario_type | VARCHAR(50) | NO | — | 'new_financing', 'warrant_exercise', 'option_vesting', 'convertible_conversion', 'custom_transaction' |
| description | TEXT | YES | NULL | Details of scenario |
| new_shares_issued | DECIMAL(18,6) | YES | NULL | Number of shares issued |
| issue_price_per_share_usd | DECIMAL(15,6) | YES | NULL | Price per share |
| total_raise_usd | DECIMAL(15,2) | YES | NULL | Total capital raised |
| warrant_conversion_rate | DECIMAL(10,6) | YES | NULL | Shares per warrant |
| warrant_exercise_pct | DECIMAL(5,2) | YES | NULL | % of warrants exercised (0-100) |
| option_pool_increase_pct | DECIMAL(5,2) | YES | NULL | % increase to option pool |
| convertible_note_details | JSONB | YES | NULL | [{conversion_rate, principal, accrued_interest}] |
| pre_fully_diluted_shares | DECIMAL(18,6) | YES | NULL | Pre-transaction FD shares |
| pre_post_money_valuation_usd | DECIMAL(15,2) | YES | NULL | Pre-transaction valuation |
| post_fully_diluted_shares | DECIMAL(18,6) | YES | NULL | Post-transaction FD shares |
| post_post_money_valuation_usd | DECIMAL(15,2) | YES | NULL | Post-transaction valuation |
| founder_dilution_pct | DECIMAL(5,2) | YES | NULL | Founder ownership change |
| employee_dilution_pct | DECIMAL(5,2) | YES | NULL | Employee pool ownership change |
| series_a_holder_dilution_pct | DECIMAL(5,2) | YES | NULL | Series A holders ownership change |
| status | VARCHAR(50) | YES | 'draft' | 'draft', 'reviewed', 'approved', 'executed', 'archived' |
| approved_at | TIMESTAMP WITH TIME ZONE | YES | NULL | When scenario was approved |
| executed_at | TIMESTAMP WITH TIME ZONE | YES | NULL | When scenario was executed |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp (auto-updated by trigger) |

### Indexes
```
idx_dilution_scenarios_company_id      -- Company filter
idx_dilution_scenarios_type            -- Scenario type analysis
idx_dilution_scenarios_status          -- Status transitions
idx_dilution_scenarios_created_at      -- Timeline queries
```

### Unique Constraints
None

### Foreign Keys
```
dilution_scenarios.company_id -> companies.id (CASCADE)
```

### Trigger
```
trigger_dilution_scenarios_updated_at
  Before UPDATE
  Updates updated_at to NOW()
```

### Sample Queries

```sql
-- All scenarios for a company
SELECT scenario_name, scenario_type, status, founder_dilution_pct, post_post_money_valuation_usd
FROM dilution_scenarios
WHERE company_id = 'xyz'
ORDER BY created_at DESC;

-- Most dilutive scenario
SELECT scenario_name, founder_dilution_pct, employee_dilution_pct
FROM dilution_scenarios
WHERE company_id = 'xyz' AND status = 'approved'
ORDER BY founder_dilution_pct DESC
LIMIT 1;

-- Approved execution-ready scenarios
SELECT 
  scenario_name,
  total_raise_usd,
  post_fully_diluted_shares,
  post_post_money_valuation_usd
FROM dilution_scenarios
WHERE company_id = 'xyz' AND status = 'approved'
ORDER BY scenario_name;
```

---

## Table 4: dilution_scenario_shareholders

**Purpose:** Shareholder-level cap table snapshots for dilution scenarios  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 10-100 per scenario  
**Parent Table:** dilution_scenarios (CASCADE delete)  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| scenario_id | UUID | NO | — | References dilution_scenarios(id) ON DELETE CASCADE |
| shareholder_name | VARCHAR(255) | NO | — | Individual or entity name |
| shareholder_type | VARCHAR(50) | YES | NULL | 'founder', 'employee', 'investor', 'employee_pool', 'other' |
| share_class | VARCHAR(50) | YES | NULL | 'Common', 'Series A', 'Series B', etc. |
| shares_pre | DECIMAL(18,6) | YES | NULL | Shares before transaction |
| ownership_pct_pre | DECIMAL(5,2) | YES | NULL | Ownership % before |
| shares_post | DECIMAL(18,6) | YES | NULL | Shares after transaction |
| ownership_pct_post | DECIMAL(5,2) | YES | NULL | Ownership % after |
| dilution_pct | DECIMAL(5,2) | YES | NULL | (post% - pre%) / pre% * 100 |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |

### Indexes
```
idx_dilution_shareholders_scenario_id         -- Parent relationship
idx_dilution_shareholders_shareholder_name    -- Search shareholder
idx_dilution_shareholders_type                -- Type analysis
```

### Unique Constraints
None

### Foreign Keys
```
dilution_scenario_shareholders.scenario_id -> dilution_scenarios.id (CASCADE)
```

### Sample Queries

```sql
-- All shareholders in a scenario
SELECT shareholder_name, shareholder_type, shares_pre, shares_post, dilution_pct
FROM dilution_scenario_shareholders
WHERE scenario_id = 'xyz'
ORDER BY shares_post DESC;

-- Most diluted shareholder
SELECT shareholder_name, dilution_pct
FROM dilution_scenario_shareholders
WHERE scenario_id = 'xyz'
ORDER BY dilution_pct DESC
LIMIT 5;
```

---

## Table 5: consent_requests

**Purpose:** Shareholder/stakeholder approval workflow management  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 20-200 per company  
**Update Frequency:** Weekly during IPO process  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_id | UUID | NO | — | References companies(id) ON DELETE CASCADE |
| request_type | VARCHAR(100) | NO | — | 'director_consent', 'shareholder_consent', 'officer_consent', 'lender_consent', 'vendor_consent', 'founder_lock_up', 'other' |
| subject_matter | VARCHAR(255) | YES | NULL | e.g., "IPO Participation Agreement" |
| description | TEXT | YES | NULL | Detailed description |
| recipient_name | VARCHAR(255) | NO | — | Recipient name |
| recipient_email | VARCHAR(255) | YES | NULL | Email address |
| recipient_phone | VARCHAR(20) | YES | NULL | Phone number |
| recipient_type | VARCHAR(50) | YES | NULL | 'individual', 'entity', 'group' |
| status | VARCHAR(50) | YES | 'pending' | 'pending', 'sent', 'viewed', 'signed', 'approved', 'rejected', 'expired' |
| sent_date | TIMESTAMP WITH TIME ZONE | YES | NULL | When request was sent |
| signed_date | TIMESTAMP WITH TIME ZONE | YES | NULL | When request was signed |
| signed_by_name | VARCHAR(255) | YES | NULL | Who signed |
| signature_method | VARCHAR(50) | YES | NULL | 'esign', 'email', 'in_person', 'other' |
| deadline_date | DATE | YES | NULL | Response deadline |
| reminder_sent_count | INT | YES | 0 | Number of reminders sent |
| last_reminder_date | TIMESTAMP WITH TIME ZONE | YES | NULL | Last reminder date |
| expiry_date | DATE | YES | NULL | When consent expires |
| template_id | UUID | YES | NULL | References consent_templates(id) ON DELETE SET NULL |
| document_url | TEXT | YES | NULL | S3 URL to signed document |
| rejected_at | TIMESTAMP WITH TIME ZONE | YES | NULL | When consent was rejected |
| rejection_reason | TEXT | YES | NULL | Reason for rejection |
| can_resubmit | BOOLEAN | YES | TRUE | Can request be resubmitted |
| notes | TEXT | YES | NULL | Additional notes |
| created_by_user_id | UUID | YES | NULL | References users(id) ON DELETE SET NULL |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp (auto-updated by trigger) |

### Indexes
```
idx_consent_requests_company_id         -- Company filter
idx_consent_requests_status             -- Status tracking
idx_consent_requests_type               -- Type analysis
idx_consent_requests_deadline           -- Deadline management
idx_consent_requests_recipient          -- Recipient lookup
idx_consent_requests_template_id        -- Template usage
idx_consent_requests_company_status     -- Status by company
```

### Unique Constraints
None

### Foreign Keys
```
consent_requests.company_id -> companies.id (CASCADE)
consent_requests.template_id -> consent_templates.id (SET NULL)
consent_requests.created_by_user_id -> users.id (SET NULL)
```

### Trigger
```
trigger_consent_requests_updated_at
  Before UPDATE
  Updates updated_at to NOW()
```

### Sample Queries

```sql
-- Pending consents
SELECT recipient_name, request_type, subject_matter, deadline_date
FROM consent_requests
WHERE company_id = 'xyz' AND status = 'pending'
ORDER BY deadline_date ASC;

-- Consent status summary
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as pct
FROM consent_requests
WHERE company_id = 'xyz'
GROUP BY status
ORDER BY count DESC;

-- Overdue consents
SELECT recipient_name, request_type, deadline_date, CURRENT_DATE - deadline_date as days_overdue
FROM consent_requests
WHERE company_id = 'xyz' AND status IN ('pending', 'sent', 'viewed') AND deadline_date < CURRENT_DATE
ORDER BY deadline_date ASC;
```

---

## Table 6: corporate_resolutions

**Purpose:** Board and shareholder resolutions for IPO process  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 10-50 per company  
**Update Frequency:** Ad-hoc as resolutions are required  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_id | UUID | NO | — | References companies(id) ON DELETE CASCADE |
| resolution_type | VARCHAR(100) | NO | — | 'board_authorization', 'share_split', 'stock_option_plan', 'director_appointment', 'dividend_policy', 'related_party', 'shareholder_approval', 'other' |
| title | VARCHAR(255) | NO | — | Resolution title |
| description | TEXT | YES | NULL | Resolution details |
| board_approval_required | BOOLEAN | YES | TRUE | Requires board approval |
| shareholder_approval_required | BOOLEAN | YES | FALSE | Requires shareholder approval |
| approval_status | VARCHAR(50) | YES | 'pending' | 'pending', 'draft', 'approved', 'rejected' |
| board_approved_at | TIMESTAMP WITH TIME ZONE | YES | NULL | Board approval date |
| board_vote_count | INT | YES | NULL | Total board votes |
| board_vote_in_favor | INT | YES | NULL | Votes in favor |
| shareholder_approved_at | TIMESTAMP WITH TIME ZONE | YES | NULL | Shareholder approval date |
| shareholder_vote_pct | DECIMAL(5,2) | YES | NULL | % of shareholders in favor |
| phase_required | INT | YES | NULL | IPO phase when required |
| deadline_date | DATE | YES | NULL | When resolution must be passed |
| resolution_passed_date | DATE | YES | NULL | When resolution was passed |
| resolution_text_url | TEXT | YES | NULL | S3 URL to resolution text |
| board_minutes_url | TEXT | YES | NULL | S3 URL to board minutes |
| shareholder_vote_record_url | TEXT | YES | NULL | S3 URL to vote records |
| status | VARCHAR(50) | YES | 'draft' | 'draft', 'pending_approval', 'approved', 'executed', 'archived' |
| prepared_by_user_id | UUID | YES | NULL | References users(id) ON DELETE SET NULL |
| reviewed_by_user_id | UUID | YES | NULL | References users(id) ON DELETE SET NULL |
| notes | TEXT | YES | NULL | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp (auto-updated by trigger) |

### Indexes
```
idx_corporate_resolutions_company_id         -- Company filter
idx_corporate_resolutions_type               -- Type analysis
idx_corporate_resolutions_status             -- Status tracking
idx_corporate_resolutions_deadline           -- Deadline management
idx_corporate_resolutions_approval_status    -- Approval workflow
```

### Unique Constraints
None

### Foreign Keys
```
corporate_resolutions.company_id -> companies.id (CASCADE)
corporate_resolutions.prepared_by_user_id -> users.id (SET NULL)
corporate_resolutions.reviewed_by_user_id -> users.id (SET NULL)
```

### Trigger
```
trigger_corporate_resolutions_updated_at
  Before UPDATE
  Updates updated_at to NOW()
```

### Sample Queries

```sql
-- Pending resolutions
SELECT title, resolution_type, deadline_date, approval_status
FROM corporate_resolutions
WHERE company_id = 'xyz' AND approval_status IN ('pending', 'draft')
ORDER BY deadline_date ASC;

-- Resolutions by phase
SELECT 
  phase_required,
  COUNT(*) as resolution_count,
  SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending
FROM corporate_resolutions
WHERE company_id = 'xyz'
GROUP BY phase_required
ORDER BY phase_required;

-- Board approval success rate
SELECT 
  resolution_type,
  COUNT(*) as total,
  ROUND(100.0 * SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) / COUNT(*), 1) as approval_pct
FROM corporate_resolutions
WHERE company_id = 'xyz'
GROUP BY resolution_type;
```

---

## Helper Table 1: vendors

**Purpose:** Service provider master data  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 20-100 per company (shared across companies)  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| vendor_name | VARCHAR(255) | NO | — | Vendor name |
| vendor_type | VARCHAR(100) | YES | NULL | 'law_firm', 'audit_firm', 'ib_bank', 'consulting', 'other' |
| contact_email | VARCHAR(255) | YES | NULL | Contact email |
| contact_phone | VARCHAR(20) | YES | NULL | Contact phone |
| contact_person | VARCHAR(255) | YES | NULL | Primary contact name |
| website_url | TEXT | YES | NULL | Vendor website |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp |

### Indexes
```
idx_vendors_name      -- Vendor lookup
idx_vendors_type      -- Type-based filtering
```

---

## Helper Table 2: milestones

**Purpose:** IPO process milestones and tracking dates  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 20-50 per company  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| company_id | UUID | NO | — | References companies(id) ON DELETE CASCADE |
| milestone_name | VARCHAR(255) | NO | — | Milestone name |
| milestone_date | DATE | YES | NULL | Target/actual date |
| description | TEXT | YES | NULL | Milestone details |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |

### Indexes
```
idx_milestones_company_id     -- Company filter
idx_milestones_date           -- Timeline queries
```

---

## Helper Table 3: consent_templates

**Purpose:** Reusable consent request templates  
**Primary Key:** `id` (UUID)  
**Row Estimates:** 10-30 per organization  

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| organization_id | UUID | YES | NULL | Organization ID (multi-tenant) |
| template_name | VARCHAR(255) | NO | — | Template name |
| template_type | VARCHAR(100) | YES | NULL | Template type |
| description | TEXT | YES | NULL | Template description |
| template_body | TEXT | NO | — | HTML/markdown template |
| placeholders | JSONB | YES | NULL | {field_name: field_label, ...} |
| created_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Created timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | NOW() | Updated timestamp |

### Indexes
```
idx_consent_templates_org_id    -- Organization filter
idx_consent_templates_type      -- Type-based filtering
```

---

## Data Relationships

```
companies (assumed to exist)
├── cost_items
│   └── vendors (optional)
├── financial_metrics
├── dilution_scenarios
│   └── dilution_scenario_shareholders
├── consent_requests
│   └── consent_templates (optional)
├── corporate_resolutions
└── milestones

users (assumed to exist)
├── cost_items.created_by_user_id
├── cost_items.approved_by_user_id
├── consent_requests.created_by_user_id
├── corporate_resolutions.prepared_by_user_id
└── corporate_resolutions.reviewed_by_user_id
```

---

## Performance Optimization Notes

### Query Patterns
1. **Company-scoped queries** - All tables filtered by company_id first
2. **Status tracking** - Indexed for workflow state transitions
3. **Timeline queries** - Date indexes for deadline/timeline analysis
4. **Aggregation queries** - Supporting dashboard calculations

### Index Strategy
- **Single-column:** Fast equality and range queries (company_id, status, type)
- **Composite:** Dashboard queries combining company + date
- **No full-text:** Use LIKE operators for text search on small result sets

### Recommended Query Patterns
```sql
-- ✅ GOOD: Uses indexes
SELECT * FROM cost_items 
WHERE company_id = 'xyz' AND status = 'pending';

-- ✅ GOOD: Uses index range
SELECT * FROM cost_items 
WHERE company_id = 'xyz' AND due_date > NOW()::date;

-- ⚠️ AVOID: Forces full table scan
SELECT * FROM cost_items 
WHERE UPPER(description) LIKE '%LEGAL%';

-- ⚠️ AVOID: Not indexed
SELECT * FROM cost_items 
WHERE amount_usd > 100000;
```

---

## Constraints & Validation

### Foreign Key Cascade Rules
- **company_id:** CASCADE (deleting company deletes all related records)
- **vendor_id, template_id, milestone_id:** SET NULL (optional references)
- **user_id:** SET NULL (historical tracking only)

### Data Validation (Application Layer)
```
cost_items.amount_usd > 0
cost_items.labor_hours >= 0
dilution_scenarios.founder_dilution_pct: -100 to 100
financial_metrics.phase_completion_pct: 0-100
financial_metrics.team_utilization_pct: 0-100
consent_requests.reminder_sent_count >= 0
dilution_scenario_shareholders.dilution_pct: -100 to 100
```

---

**END OF SCHEMA REFERENCE**
