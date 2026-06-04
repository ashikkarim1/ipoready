/**
 * Test queries for Board & Talent Marketplace
 * Run these after the migration to verify schema and seeded data
 */

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- 1. Verify professionals table is created with seed data
SELECT COUNT(*) as total_professionals, COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_count
FROM professionals;

-- 2. View all seeded professionals
SELECT
  id, name, professional_title, years_public_experience,
  industries, regions, rate_expectations_annual,
  verification_status
FROM professionals
ORDER BY years_public_experience DESC;

-- 3. Find professionals by industry
SELECT name, professional_title, industries, years_public_experience
FROM professionals
WHERE 'Technology' = ANY(industries) OR 'SaaS' = ANY(industries)
ORDER BY years_public_experience DESC;

-- 4. Find professionals by region
SELECT name, professional_title, regions, years_public_experience
FROM professionals
WHERE 'Toronto' = ANY(regions)
ORDER BY years_public_experience DESC;

-- 5. Find professionals with specific certifications
SELECT name, professional_title, certifications
FROM professionals
WHERE certifications && ARRAY['CPA']
ORDER BY years_public_experience DESC;

-- 6. Verify views are created
SELECT 1 FROM professional_match_scoring LIMIT 1;
SELECT 1 FROM hiring_summary LIMIT 1;

-- 7. Verify functions are created
SELECT 'verify_and_calculate_fees'::regprocedure;

-- ====================================================================
-- TEST SCENARIO QUERIES
-- ====================================================================

-- Test 1: Create sample introduction request (requires company_id from your test setup)
-- Uncomment and modify with real UUIDs:
/*
INSERT INTO professional_introductions (
  professional_id,
  company_id,
  requested_by_user_id,
  role_seeking,
  message,
  status
) VALUES (
  (SELECT id FROM professionals LIMIT 1),
  'your-company-uuid',
  'your-user-uuid',
  'Board Member - Audit Committee',
  'We are seeking an experienced audit committee member.',
  'pending'
);
*/

-- Test 2: View professionals match scores
SELECT
  id, name, professional_title,
  (CASE WHEN years_public_experience >= 10 THEN 30 ELSE years_public_experience * 3 END) as experience_score,
  (CASE WHEN linkedin_verified THEN 20 ELSE 0 END) as verification_score,
  (CASE WHEN years_public_experience >= 10 THEN 30 ELSE years_public_experience * 3 END) +
  (CASE WHEN linkedin_verified THEN 20 ELSE 0 END) as basic_score
FROM professionals
WHERE verification_status = 'verified'
ORDER BY basic_score DESC
LIMIT 10;

-- Test 3: View professional with most board positions
SELECT
  name, professional_title,
  array_length(past_board_positions, 1) as board_positions_count,
  years_public_experience
FROM professionals
WHERE past_board_positions IS NOT NULL
ORDER BY array_length(past_board_positions, 1) DESC;

-- Test 4: View compensation ranges
SELECT
  professional_title,
  COUNT(*) as count,
  MIN(rate_expectations_annual) as min_annual,
  AVG(rate_expectations_annual) as avg_annual,
  MAX(rate_expectations_annual) as max_annual,
  MIN(rate_expectations_hourly) as min_hourly,
  AVG(rate_expectations_hourly) as avg_hourly,
  MAX(rate_expectations_hourly) as max_hourly
FROM professionals
WHERE rate_expectations_annual IS NOT NULL AND rate_expectations_hourly IS NOT NULL
GROUP BY professional_title
ORDER BY avg_annual DESC;

-- Test 5: Industries distribution
SELECT
  industry,
  COUNT(DISTINCT p.id) as professional_count
FROM professionals p,
LATERAL unnest(p.industries) AS industry
GROUP BY industry
ORDER BY professional_count DESC;

-- Test 6: Regions distribution
SELECT
  region,
  COUNT(DISTINCT p.id) as professional_count
FROM professionals p,
LATERAL unnest(p.regions) AS region
GROUP BY region
ORDER BY professional_count DESC;

-- ====================================================================
-- ANTI-CIRCUMVENTION TEST QUERIES
-- ====================================================================

-- Test 7: Fee calculation simulation
-- Assume $60,000 base compensation
SELECT
  'Test Hire' as scenario,
  60000 as total_compensation,
  ROUND(60000 * 0.02, 2) as finders_fee_2_percent,
  ROUND((60000 * 0.02) * 0.10, 2) as referral_commission_10_percent,
  ROUND(60000 * 0.02 * 0.10, 2) as simple_calc;

-- Test 8: Multiple hire scenarios
SELECT
  amount_usd,
  ROUND(amount_usd * 0.02, 2) as finders_fee,
  ROUND(amount_usd * 0.02 * 0.10, 2) as referral_commission,
  ROUND(amount_usd * 0.02, 2) + ROUND(amount_usd * 0.02 * 0.10, 2) as total_iporeday_income
FROM (
  VALUES
    (50000),   -- Board member
    (75000),   -- Senior board member
    (100000),  -- Executive
    (150000)   -- VP/C-Suite
) as fees(amount_usd)
ORDER BY amount_usd;

-- ====================================================================
-- DATA QUALITY CHECKS
-- ====================================================================

-- Check 1: Verify all professionals have required fields
SELECT COUNT(*) as issues
FROM professionals
WHERE name IS NULL
   OR email IS NULL
   OR professional_title IS NULL
   OR years_public_experience IS NULL;

-- Check 2: Verify email uniqueness
SELECT email, COUNT(*) as count
FROM professionals
GROUP BY email
HAVING COUNT(*) > 1;

-- Check 3: Verify reasonable data ranges
SELECT
  'years_public_experience < 0' as issue,
  COUNT(*) as count
FROM professionals
WHERE years_public_experience < 0
UNION ALL
SELECT
  'years_public_experience > 60' as issue,
  COUNT(*) as count
FROM professionals
WHERE years_public_experience > 60
UNION ALL
SELECT
  'rate_expectations_annual < 0' as issue,
  COUNT(*) as count
FROM professionals
WHERE rate_expectations_annual IS NOT NULL AND rate_expectations_annual < 0
UNION ALL
SELECT
  'verification_status invalid' as issue,
  COUNT(*) as count
FROM professionals
WHERE verification_status NOT IN ('unverified', 'verified', 'rejected');

-- Check 4: Verify seed data diversity
SELECT
  'Total professionals' as metric, COUNT(*)::TEXT as value
FROM professionals
UNION ALL
SELECT
  'Verified professionals', COUNT(*)::TEXT
FROM professionals
WHERE verification_status = 'verified'
UNION ALL
SELECT
  'Unique industries', COUNT(DISTINCT industry)::TEXT
FROM (
  SELECT DISTINCT unnest(industries) as industry
  FROM professionals
) t
UNION ALL
SELECT
  'Unique regions', COUNT(DISTINCT region)::TEXT
FROM (
  SELECT DISTINCT unnest(regions) as region
  FROM professionals
) t;

-- ====================================================================
-- INDEX PERFORMANCE CHECKS
-- ====================================================================

-- Check that indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('professionals', 'professional_introductions', 'hiring_confirmations', 'professional_referrals')
ORDER BY tablename, indexname;
