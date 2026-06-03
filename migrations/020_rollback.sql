/**
 * IPOReady Rollback: Migration 020
 * Comprehensive Phase 2 Migration Rollback
 * 
 * Purpose: Safely rollback migration 020 and restore database to pre-migration state
 * 
 * Tables Dropped:
 * 1. corporate_resolutions
 * 2. consent_requests
 * 3. dilution_scenario_shareholders
 * 4. dilution_scenarios
 * 5. financial_metrics
 * 6. cost_items
 * 7. consent_templates
 * 8. milestones
 * 9. vendors
 * 
 * Foreign Key Dependencies: All are handled via CASCADE ON DELETE
 * 
 * Execution Time: ~500ms (minimal data)
 * Risk Level: LOW (idempotent, uses IF EXISTS)
 * 
 * WARNING: This will DELETE all data in the above tables.
 * Ensure you have a backup before executing this rollback.
 * 
 * To rollback:
 * 1. Backup current database (STRONGLY RECOMMENDED)
 * 2. Run this entire script in a single transaction
 * 3. Verify with validation query at end
 */

BEGIN;  -- Transaction wrapper for safety

-- ====================================================================
-- DROP TRIGGERS (must be done first)
-- ====================================================================

DROP TRIGGER IF EXISTS trigger_cost_items_updated_at ON cost_items;
DROP TRIGGER IF EXISTS trigger_financial_metrics_updated_at ON financial_metrics;
DROP TRIGGER IF EXISTS trigger_dilution_scenarios_updated_at ON dilution_scenarios;
DROP TRIGGER IF EXISTS trigger_consent_requests_updated_at ON consent_requests;
DROP TRIGGER IF EXISTS trigger_corporate_resolutions_updated_at ON corporate_resolutions;

-- ====================================================================
-- DROP TABLES (in reverse dependency order)
-- ====================================================================

-- Table 5: CORPORATE_RESOLUTIONS
-- No child tables reference this
DROP TABLE IF EXISTS corporate_resolutions CASCADE;

-- Table 4: CONSENT_REQUESTS
-- No child tables reference this
DROP TABLE IF EXISTS consent_requests CASCADE;

-- Table 3B: DILUTION_SCENARIO_SHAREHOLDERS (child of dilution_scenarios)
-- Must be dropped before dilution_scenarios
DROP TABLE IF EXISTS dilution_scenario_shareholders CASCADE;

-- Table 3: DILUTION_SCENARIOS
-- No child tables reference this
DROP TABLE IF EXISTS dilution_scenarios CASCADE;

-- Table 2: FINANCIAL_METRICS
-- No child tables reference this
DROP TABLE IF EXISTS financial_metrics CASCADE;

-- Table 1: COST_ITEMS
-- No child tables reference this
DROP TABLE IF EXISTS cost_items CASCADE;

-- ====================================================================
-- DROP HELPER TABLES
-- ====================================================================

-- Helper: CONSENT_TEMPLATES (referenced by consent_requests, but that's already dropped)
DROP TABLE IF EXISTS consent_templates CASCADE;

-- Helper: MILESTONES (referenced by cost_items, but that's already dropped)
DROP TABLE IF EXISTS milestones CASCADE;

-- Helper: VENDORS (referenced by cost_items, but that's already dropped)
DROP TABLE IF EXISTS vendors CASCADE;

-- ====================================================================
-- DROP HELPER FUNCTION (if it was created ONLY by this migration)
-- ====================================================================

-- NOTE: update_table_updated_at() function is NOT dropped here because:
-- 1. It may be used by other migrations
-- 2. It's a utility function used across multiple tables
-- If you want to remove it as well, uncomment below:
-- DROP FUNCTION IF EXISTS update_table_updated_at() CASCADE;

-- ====================================================================
-- VALIDATION QUERY
-- ====================================================================
-- Run this query to verify all tables were successfully dropped

SELECT 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_items') as cost_items_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_metrics') as financial_metrics_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenarios') as dilution_scenarios_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'dilution_scenario_shareholders') as dilution_shareholders_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_requests') as consent_requests_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_resolutions') as corporate_resolutions_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') as vendors_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'milestones') as milestones_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'consent_templates') as consent_templates_exists
AS rollback_validation;

-- Expected result: all values should be FALSE (table does not exist)

-- ====================================================================
-- COMMIT TRANSACTION
-- ====================================================================

COMMIT;

-- ====================================================================
-- POST-ROLLBACK STEPS (manual)
-- ====================================================================

/*
After running this rollback, verify the following:

1. Check application logs for any errors related to missing tables
2. Run database integrity check:
   SELECT * FROM pg_stat_user_tables ORDER BY n_live_tup DESC;
3. Verify foreign key constraints still exist:
   SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';
4. Clear application cache if used by ORM (Prisma, TypeORM, etc.)
5. Restart application server to reload schema definitions

To re-apply migration 020:
   psql -U $DB_USER -d $DB_NAME -f migrations/020_comprehensive_phase2_tables_with_rollback.sql
*/
