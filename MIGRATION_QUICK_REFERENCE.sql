/**
 * IPOReady Phase 2A-2D Migration Quick Reference
 * 
 * Copy-paste SQL statements for common operations
 * Use with: psql $DATABASE_URL or Neon CLI
 */

-- ====================================================================
-- MIGRATION EXECUTION
-- ====================================================================

-- Run full migration (all 10 tables + helpers)
\i migrations/018_phase2a_2d_comprehensive_schema.sql

-- Verify migration success
SELECT 'cost_items' as table_name, COUNT(*) as row_count FROM cost_items
UNION ALL
SELECT 'financial_metrics', COUNT(*) FROM financial_metrics
UNION ALL
SELECT 'dilution_scenarios', COUNT(*) FROM dilution_scenarios
UNION ALL
SELECT 'consent_requests', COUNT(*) FROM consent_requests
UNION ALL
SELECT 'corporate_resolutions', COUNT(*) FROM corporate_resolutions
UNION ALL
SELECT 'syndication_agreements', COUNT(*) FROM syndication_agreements
UNION ALL
SELECT 'listing_requirements', COUNT(*) FROM listing_requirements
UNION ALL
SELECT 'financial_kpi_dashboard', COUNT(*) FROM financial_kpi_dashboard;

-- ====================================================================
-- SAMPLE DATA INSERTION
-- ====================================================================

-- 1. Insert sample vendor
INSERT INTO vendors (vendor_name, vendor_type, contact_email, contact_person) VALUES
('Sullivan & Cromwell LLP', 'law_firm', 'contact@sullcrom.com', 'Jane Smith')
RETURNING id;

-- 2. Insert sample milestone
INSERT INTO milestones (company_id, milestone_name, milestone_date, description) VALUES
('{COMPANY_UUID}', 'S-1 Filing Complete', '2025-04-30', 'SEC S-1 registration statement filed')
RETURNING id;

-- 3. Insert sample cost items
INSERT INTO cost_items (
  company_id, cost_category, cost_type, cost_nature, description, 
  amount_usd, phase_number, vendor_id, status
) VALUES
('{COMPANY_UUID}', 'legal', 'capex', 'external_vendor', 'External counsel - S1 preparation', 250000, 4, (SELECT id FROM vendors LIMIT 1), 'estimated'),
('{COMPANY_UUID}', 'audit', 'capex', 'external_vendor', 'Big Four audit firm engagement', 350000, 3, (SELECT id FROM vendors LIMIT 1), 'estimated'),
('{COMPANY_UUID}', 'ib', 'capex', 'external_vendor', 'Investment banking underwriting', 500000, 5, (SELECT id FROM vendors LIMIT 1), 'estimated'),
('{COMPANY_UUID}', 'consulting', 'opex', 'external_vendor', 'SEC compliance consulting', 100000, 4, NULL, 'estimated'),
('{COMPANY_UUID}', 'printing', 'capex', 'direct_cost', 'Prospectus printing and mailing', 50000, 5, NULL, 'estimated');

-- 4. Insert sample financial metrics (monthly summary)
INSERT INTO financial_metrics (
  company_id, metric_date, metric_type, total_ipo_costs_to_date_usd,
  estimated_total_ipo_cost_usd, legal_costs_usd, audit_costs_usd,
  accounting_costs_usd, ib_costs_usd, total_budget_usd,
  current_phase, current_phase_completion_pct
) VALUES
('{COMPANY_UUID}', CURRENT_DATE, 'daily_snapshot', 400000, 1500000, 250000, 150000, 0, 0, 1600000, 3, 45);

-- 5. Insert sample dilution scenario
INSERT INTO dilution_scenarios (
  company_id, scenario_name, scenario_type, description,
  new_shares_issued, issue_price_per_share_usd, total_raise_usd,
  pre_fully_diluted_shares, post_fully_diluted_shares, status
) VALUES
('{COMPANY_UUID}', 'Series C @ $10 IPO', 'new_financing', 'Hypothetical Series C at IPO price',
 10000000, 10.00, 100000000, 100000000, 110000000, 'draft')
RETURNING id;

-- 6. Insert sample shareholders for dilution scenario
INSERT INTO dilution_scenario_shareholders (
  scenario_id, shareholder_name, shareholder_type, share_class,
  shares_pre, ownership_pct_pre, shares_post, ownership_pct_post, dilution_pct
) VALUES
('{SCENARIO_UUID}', 'Founders', 'founder', 'Common', 40000000, 40.0, 36363636, 33.0, -17.5),
('{SCENARIO_UUID}', 'Series A Investors', 'investor', 'Series A', 30000000, 30.0, 27272727, 24.8, -17.5),
('{SCENARIO_UUID}', 'Employee Pool', 'employee_pool', 'Options', 15000000, 15.0, 13636364, 12.4, -17.5),
('{SCENARIO_UUID}', 'New Series C Investor', 'investor', 'Series C', 0, 0.0, 10000000, 9.1, NULL);

-- 7. Insert sample consent requests
INSERT INTO consent_requests (
  company_id, request_type, subject_matter, recipient_name,
  recipient_email, recipient_type, status, deadline_date
) VALUES
('{COMPANY_UUID}', 'director_consent', 'IPO Participation Agreement', 'John Director', 'john@company.com', 'individual', 'pending', '2025-03-31'),
('{COMPANY_UUID}', 'founder_lock_up', '180-day Lock-up Agreement', 'Jane Founder', 'jane@company.com', 'individual', 'pending', '2025-04-15'),
('{COMPANY_UUID}', 'shareholder_consent', 'Related Party Transaction Approval', 'Acme Capital LP', 'contact@acme.com', 'entity', 'pending', '2025-04-30');

-- 8. Insert sample corporate resolutions
INSERT INTO corporate_resolutions (
  company_id, resolution_type, title, board_approval_required,
  shareholder_approval_required, status, deadline_date
) VALUES
('{COMPANY_UUID}', 'board_authorization', 'Board authorization to pursue IPO', TRUE, FALSE, 'pending', '2025-03-15'),
('{COMPANY_UUID}', 'stock_option_plan', 'Approval of 2025 stock option plan', TRUE, TRUE, 'pending', '2025-04-01'),
('{COMPANY_UUID}', 'share_split', '1-for-2 reverse stock split', TRUE, TRUE, 'pending', '2025-04-15');

-- 9. Insert sample syndication agreement
INSERT INTO syndication_agreements (
  company_id, agreement_type, agreement_name, lead_underwriter,
  member_count, gross_spread_bps, net_proceeds_usd, status
) VALUES
('{COMPANY_UUID}', 'firm_commitment', 'IPO Underwriting Agreement', 'Goldman Sachs', 12, 350, 950000000, 'draft');

-- 10. Insert sample listing requirements (NASDAQ)
INSERT INTO listing_requirements (
  company_id, exchange_code, requirement_code, requirement_name,
  category, requirement_level, status, completion_pct
) VALUES
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_QUANT', 'Quantitative listing standards', 'financial', 'mandatory', 'in_progress', 60),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_GOV', 'Board and committee composition', 'governance', 'mandatory', 'in_progress', 40),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_AUDIT', 'Audit committee independence', 'audit', 'mandatory', 'not_started', 0),
('{COMPANY_UUID}', 'NASDAQ', 'NASDAQ_DISCLOSURE', 'Disclosure controls and procedures', 'disclosure', 'mandatory', 'in_progress', 50);

-- 11. Insert sample KPI dashboard
INSERT INTO financial_kpi_dashboard (
  company_id, snapshot_date, total_ipo_costs_to_date_usd,
  estimated_total_ipo_costs_usd, remaining_budget_usd, current_phase,
  current_phase_completion_pct, estimated_days_to_listing
) VALUES
('{COMPANY_UUID}', CURRENT_DATE, 400000, 1500000, 1100000, 3, 45, 180);

-- ====================================================================
-- QUICK QUERIES
-- ====================================================================

-- Total IPO costs by category
SELECT 
  cost_category,
  SUM(amount_usd) as total_cost,
  COUNT(*) as item_count,
  AVG(amount_usd) as avg_cost
FROM cost_items
WHERE company_id = '{COMPANY_UUID}' AND status != 'rejected'
GROUP BY cost_category
ORDER BY total_cost DESC;

-- Cost by phase
SELECT 
  phase_number,
  SUM(amount_usd) as phase_total,
  COUNT(*) as item_count
FROM cost_items
WHERE company_id = '{COMPANY_UUID}'
GROUP BY phase_number
ORDER BY phase_number ASC;

-- Outstanding consents (need action)
SELECT 
  recipient_name,
  request_type,
  subject_matter,
  deadline_date,
  CURRENT_DATE - deadline_date as days_overdue
FROM consent_requests
WHERE company_id = '{COMPANY_UUID}' AND status IN ('pending', 'sent')
ORDER BY deadline_date ASC;

-- Non-compliant listing requirements
SELECT 
  exchange_code,
  requirement_name,
  status,
  completion_pct,
  deadline_date
FROM listing_requirements
WHERE company_id = '{COMPANY_UUID}' AND is_compliant = FALSE
ORDER BY deadline_date ASC;

-- Dilution analysis for a scenario
SELECT 
  shareholder_name,
  share_class,
  shares_pre,
  ownership_pct_pre,
  shares_post,
  ownership_pct_post,
  dilution_pct,
  CASE 
    WHEN dilution_pct < -10 THEN 'SIGNIFICANT_BENEFIT'
    WHEN dilution_pct < 0 THEN 'SLIGHT_BENEFIT'
    WHEN dilution_pct = 0 THEN 'NO_CHANGE'
    WHEN dilution_pct <= 10 THEN 'SLIGHT_DILUTION'
    ELSE 'SIGNIFICANT_DILUTION'
  END as impact_category
FROM dilution_scenario_shareholders
WHERE scenario_id = '{SCENARIO_UUID}'
ORDER BY ownership_pct_post DESC;

-- Financial metrics history
SELECT 
  metric_date,
  total_ipo_costs_to_date_usd,
  estimated_total_ipo_cost_usd,
  budget_remaining_usd,
  budget_variance_pct,
  current_phase_completion_pct
FROM financial_metrics
WHERE company_id = '{COMPANY_UUID}' AND metric_type = 'monthly_summary'
ORDER BY metric_date DESC
LIMIT 12;

-- Pending approvals and actions
SELECT 
  'Consent Request' as item_type,
  recipient_name as responsible_party,
  subject_matter as description,
  deadline_date,
  status
FROM consent_requests
WHERE company_id = '{COMPANY_UUID}' AND status IN ('pending', 'sent')

UNION ALL

SELECT 
  'Resolution',
  COALESCE(prepared_by_user_id::text, 'Unassigned'),
  title,
  deadline_date,
  status
FROM corporate_resolutions
WHERE company_id = '{COMPANY_UUID}' AND status IN ('draft', 'pending_approval')

UNION ALL

SELECT 
  'Listing Requirement',
  COALESCE(validator_user_id::text, 'Unassigned'),
  requirement_name,
  deadline_date,
  status
FROM listing_requirements
WHERE company_id = '{COMPANY_UUID}' AND status IN ('not_started', 'in_progress')

ORDER BY deadline_date ASC;

-- Cost vs budget analysis
SELECT 
  SUM(CASE WHEN status IN ('incurred', 'paid') THEN amount_usd ELSE 0 END) as actual_spend,
  SUM(amount_usd) as total_committed,
  (SELECT estimated_total_ipo_cost_usd FROM financial_metrics 
   WHERE company_id = '{COMPANY_UUID}' ORDER BY metric_date DESC LIMIT 1) as estimated_total
FROM cost_items
WHERE company_id = '{COMPANY_UUID}';

-- ====================================================================
-- REPORTING VIEWS
-- ====================================================================

-- Phase completion dashboard
SELECT 
  COALESCE(fkd.current_phase, c.phase_number) as phase,
  COUNT(DISTINCT c.id) as company_count,
  ROUND(AVG(COALESCE(fkd.current_phase_completion_pct, 0)), 1) as avg_completion_pct,
  MIN(fkd.estimated_days_to_listing) as fastest_path_days,
  MAX(fkd.estimated_days_to_listing) as longest_path_days
FROM companies c
LEFT JOIN financial_kpi_dashboard fkd ON c.id = fkd.company_id 
  AND fkd.snapshot_date = (
    SELECT MAX(snapshot_date) FROM financial_kpi_dashboard WHERE company_id = c.id
  )
GROUP BY COALESCE(fkd.current_phase, c.phase_number)
ORDER BY phase ASC;

-- Top cost drivers
SELECT 
  vendor_name,
  cost_category,
  COUNT(*) as transaction_count,
  SUM(amount_usd) as total_vendor_cost,
  ROUND(100.0 * SUM(amount_usd) / (SELECT SUM(amount_usd) FROM cost_items WHERE company_id = '{COMPANY_UUID}'), 2) as pct_of_total
FROM cost_items
WHERE company_id = '{COMPANY_UUID}'
GROUP BY vendor_name, cost_category
ORDER BY total_vendor_cost DESC;

-- Consent completion status
SELECT 
  request_type,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status = 'signed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status IN ('pending', 'sent') THEN 1 ELSE 0 END) as outstanding,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
  ROUND(100.0 * SUM(CASE WHEN status = 'signed' THEN 1 ELSE 0 END) / COUNT(*), 1) as completion_pct
FROM consent_requests
WHERE company_id = '{COMPANY_UUID}'
GROUP BY request_type
ORDER BY completion_pct DESC;

-- ====================================================================
-- MAINTENANCE & CLEANUP
-- ====================================================================

-- Archive completed cost items (move to historical table if exists)
UPDATE cost_items
SET status = 'archived'
WHERE company_id = '{COMPANY_UUID}' 
  AND status = 'paid'
  AND actual_date < CURRENT_DATE - INTERVAL '180 days';

-- Mark expired consents
UPDATE consent_requests
SET status = 'expired'
WHERE company_id = '{COMPANY_UUID}'
  AND status IN ('pending', 'sent')
  AND expiry_date < CURRENT_DATE
  AND last_reminder_date IS NOT NULL;

-- Calculate completion percentages for resolutions
UPDATE corporate_resolutions
SET status = 'approved'
WHERE company_id = '{COMPANY_UUID}'
  AND status IN ('pending_approval', 'draft')
  AND board_approved_at IS NOT NULL
  AND (NOT shareholder_approval_required OR shareholder_approved_at IS NOT NULL);

-- Update KPI dashboard daily
INSERT INTO financial_kpi_dashboard (
  company_id, snapshot_date, total_ipo_costs_to_date_usd,
  estimated_total_ipo_costs_usd, current_phase
)
SELECT 
  '{COMPANY_UUID}',
  CURRENT_DATE,
  COALESCE(SUM(amount_usd), 0),
  (SELECT estimated_total_ipo_cost_usd FROM financial_metrics 
   WHERE company_id = '{COMPANY_UUID}' ORDER BY metric_date DESC LIMIT 1),
  (SELECT current_phase FROM financial_kpi_dashboard 
   WHERE company_id = '{COMPANY_UUID}' ORDER BY snapshot_date DESC LIMIT 1)
FROM cost_items
WHERE company_id = '{COMPANY_UUID}' AND status IN ('incurred', 'paid')
ON CONFLICT (company_id, snapshot_date) DO UPDATE SET
  total_ipo_costs_to_date_usd = EXCLUDED.total_ipo_costs_to_date_usd,
  updated_at = NOW();

-- ====================================================================
-- TROUBLESHOOTING
-- ====================================================================

-- Check trigger execution
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('cost_items', 'financial_metrics', 'dilution_scenarios');

-- Check index effectiveness
EXPLAIN ANALYZE
SELECT * FROM cost_items WHERE company_id = '{COMPANY_UUID}' AND cost_category = 'legal';

-- Find slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE query LIKE '%cost_items%' OR query LIKE '%financial_metrics%'
ORDER BY mean_time DESC
LIMIT 10;

-- Validate referential integrity
SELECT 'cost_items → vendors' as relationship, COUNT(*) as orphaned_records
FROM cost_items
WHERE vendor_id IS NOT NULL AND vendor_id NOT IN (SELECT id FROM vendors)

UNION ALL

SELECT 'consent_requests → consent_templates', COUNT(*)
FROM consent_requests
WHERE template_id IS NOT NULL AND template_id NOT IN (SELECT id FROM consent_templates)

UNION ALL

SELECT 'dilution_scenario_shareholders → dilution_scenarios', COUNT(*)
FROM dilution_scenario_shareholders
WHERE scenario_id NOT IN (SELECT id FROM dilution_scenarios);

-- ====================================================================
-- EXPORT/BACKUP QUERIES
-- ====================================================================

-- Export all cost items as CSV
\COPY (
  SELECT id, company_id, cost_category, cost_type, description, amount_usd, 
         status, phase_number, vendor_name, created_at
  FROM cost_items
  WHERE company_id = '{COMPANY_UUID}'
  ORDER BY created_at DESC
) TO STDOUT WITH CSV HEADER;

-- Export dilution scenario shareholders for analysis
\COPY (
  SELECT 
    ds.scenario_name, 
    dss.shareholder_name, 
    dss.share_class,
    dss.shares_pre, 
    dss.ownership_pct_pre,
    dss.shares_post, 
    dss.ownership_pct_post,
    dss.dilution_pct
  FROM dilution_scenarios ds
  LEFT JOIN dilution_scenario_shareholders dss ON ds.id = dss.scenario_id
  WHERE ds.company_id = '{COMPANY_UUID}'
  ORDER BY ds.created_at DESC, dss.ownership_pct_post DESC
) TO STDOUT WITH CSV HEADER;
