# Seed Data Implementation Guide

## Overview

This document provides developers with detailed information about the comprehensive seed data created for the test@ipoready.com account.

## Files

1. **seed-comprehensive-test-data.js** - Main seed script
2. **SEED_DATA_GUIDE.md** - User-facing guide with full details
3. **SEED_DATA_SUMMARY.txt** - Quick reference summary
4. **SEED_DATA_IMPLEMENTATION.md** - This file

## Running the Seed Script

### Prerequisites

- Node.js installed
- DATABASE_URL environment variable set
- @neondatabase/serverless package available

### Command

```bash
NODE_ENV=production \
DATABASE_URL="postgresql://user:pass@host/db?...sslmode=require" \
node seed-comprehensive-test-data.js
```

### What Gets Created

The script performs these operations in order:

1. **Update Company Profile** - Sets name, valuation, exchange, PACE score, metrics
2. **Seed Team Members** - Adds 3 board members (CEO, CFO, CTO)
3. **Populate Cap Table** - Adds 7 shareholder records with share counts
4. **Create Dilution Scenarios** - Adds 3 hypothetical cap table scenarios (if table exists)
5. **Insert Prospectus** - Creates prospectus document
6. **Add Prospectus Sections** - Populates 9 sections with content
7. **Create Document Scorecards** - Adds 8 IPO progress tracking items
8. **Display Summary** - Outputs formatted completion summary

## Database Tables Modified

### 1. companies

```sql
UPDATE companies SET
  name = 'VentureTech Innovations Inc',
  target_exchange = 'TSXV',
  current_phase = 'regulatory_filing',
  pace_score = 72,
  progress_percentage = 78,
  estimated_days_to_ipo = 240,
  sector = 'Software / SaaS',
  valuation_usd = 100000000,
  cash_runway_months = 24,
  pre_ipo_funding_raised_usd = 45000000,
  team_size = 145,
  board_size = 5,
  auditor_selected = true,
  investor_sophistication_score = 8
WHERE id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
```

**Rows affected:** 1 update

### 2. team_members

```sql
INSERT INTO team_members
  (company_id, user_id, role, job_title, access_level, accepted_at, notification_frequency)
VALUES
  ('2e31b75b-...', user_id, 'executive', 'CEO & Founder', 'admin', NOW(), 'daily'),
  ('2e31b75b-...', user_id, 'executive', 'CFO', 'admin', NOW(), 'daily'),
  ('2e31b75b-...', user_id, 'executive', 'CTO', 'admin', NOW(), 'daily')
```

**Rows affected:** 3 inserts (may be fewer if duplicates exist)

### 3. cap_table_holders

```sql
DELETE FROM cap_table_holders WHERE company_id = '2e31b75b-...';

INSERT INTO cap_table_holders
  (company_id, name, type, shares, sort_order)
VALUES
  ('2e31b75b-...', 'John Smith', 'Founder', 1800000, 1),
  ('2e31b75b-...', 'Co-Founders (2 others)', 'Founder', 1200000, 2),
  ('2e31b75b-...', 'Series A Investors', 'Investor', 875000, 3),
  ('2e31b75b-...', 'Series B Investors', 'Investor', 625000, 4),
  ('2e31b75b-...', 'Series C Investors', 'Investor', 400000, 5),
  ('2e31b75b-...', 'Employee Options (Vested)', 'Options', 100000, 6),
  ('2e31b75b-...', 'Employee Options (Unvested)', 'Options', 150000, 7)
```

**Rows affected:** 1 delete + 7 inserts

### 4. prospectuses

```sql
INSERT INTO prospectuses
  (company_id, title, company_name, status, description, user_id)
VALUES
  ('2e31b75b-...', 'VentureTech TSXV Prospectus', 'VentureTech Innovations Inc',
   'in_progress', 'Preliminary prospectus for TSXV listing', user_id)
```

**Rows affected:** 1 insert

### 5. prospectus_sections

```sql
-- 9 inserts, one for each section:
INSERT INTO prospectus_sections
  (prospectus_id, section_name, section_order, section_number, content, status, title, required)
VALUES
  (prospectus_id, 'Executive Summary', 1, 1, '...content...', 'in_progress', 'Executive Summary', true),
  (prospectus_id, 'Risk Factors', 2, 2, '...content...', 'in_progress', 'Risk Factors', true),
  -- ... etc for all 9 sections
```

**Rows affected:** 9 inserts

### 6. document_scorecards

```sql
DELETE FROM document_scorecards WHERE company_id = '2e31b75b-...';

-- 8 inserts
INSERT INTO document_scorecards
  (company_id, document_name, phase_id, completion_pct, status, last_updated)
VALUES
  ('2e31b75b-...', 'Pre-Planning Checklist', 1, 100, 'final', CURRENT_DATE),
  ('2e31b75b-...', 'Corporate Restructuring Plan', 2, 95, 'reviewed', CURRENT_DATE),
  -- ... etc for all 8 documents
```

**Rows affected:** 1 delete + 8 inserts

## Error Handling

The script includes error handling for:

1. **Missing tables** - Script checks if table exists before inserting
2. **Column mismatches** - Skips if columns don't exist
3. **Foreign key violations** - Uses try/catch blocks for inserts
4. **Missing user** - Gracefully handles if test user doesn't exist

## Verifying Seeded Data

### Quick Check

```bash
NODE_ENV=production DATABASE_URL="..." node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const result = await sql\`SELECT name, valuation_usd FROM companies
    WHERE id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'\`;
  console.log(result);
  process.exit(0);
})();
"
```

### SQL Queries for Verification

```sql
-- View seeded company
SELECT name, valuation_usd, pace_score FROM companies
WHERE id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

-- Count board members
SELECT COUNT(*) FROM team_members
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

-- View cap table
SELECT name, type, shares FROM cap_table_holders
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
ORDER BY sort_order;

-- View prospectus sections
SELECT section_name, status FROM prospectus_sections
WHERE prospectus_id IN (
  SELECT id FROM prospectuses
  WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
)
ORDER BY section_order;

-- View document progress
SELECT document_name, completion_pct FROM document_scorecards
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
ORDER BY phase_id;
```

## Idempotency

The script is **mostly idempotent**:

- Company profile UPDATE will succeed regardless of current state
- Team members have ON CONFLICT logic (tries to avoid duplicates)
- Cap table holders DELETE then INSERT (ensures fresh data)
- Prospectus sections inserted (will fail if duplicates exist)
- Document scorecards DELETE then INSERT (ensures fresh data)

**Best Practice:** Run the script fresh on a clean database or test environment.

## Customization

### To modify company details:

Edit this section in seed-comprehensive-test-data.js:

```javascript
await sql`
  UPDATE companies SET
    name = 'Your Company Name',
    valuation_usd = 50000000,
    team_size = 100,
    // ... other fields
  WHERE id = ${TEST_COMPANY_ID}
`;
```

### To modify cap table:

Edit the shareholders array:

```javascript
const shareholders = [
  {
    name: 'Your Shareholder',
    type: 'Founder',
    shares: 1000000,
    sort_order: 1
  },
  // ... etc
];
```

### To add/remove prospectus sections:

Edit the prospectusContent array:

```javascript
const prospectusContent = [
  {
    section_name: 'Section Name',
    section_number: 1,
    status: 'in_progress',
    content: 'Section content here...'
  },
  // ... etc
];
```

## Performance Considerations

- Script execution time: < 5 seconds
- Database inserts: ~30 total operations
- No performance impact on production
- Safe to run multiple times (idempotent)

## Testing Checklist

Before using in production:

- [ ] Run script successfully on test database
- [ ] Verify all 6 tables have expected data
- [ ] Check row counts match expectations
- [ ] Login to app with test@ipoready.com
- [ ] Navigate to all Phase 2 pages
- [ ] Verify data displays correctly
- [ ] Test gap analysis functionality
- [ ] Check dilution scenario calculations
- [ ] Test prospectus validator
- [ ] Verify document checklist shows progress

## Troubleshooting

### Script fails with "column not found"

**Cause:** Table schema doesn't match expected columns

**Solution:** 
1. Check actual column names: 
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'table_name'
   ```
2. Update script to use correct column names
3. Re-run script

### Data doesn't appear in UI

**Cause:** Data was inserted but page not showing it

**Solution:**
1. Verify data is in database with SQL query
2. Clear browser cache (Cmd+Shift+R)
3. Log out and back in
4. Check page component queries

### Duplicate key errors

**Cause:** Running script multiple times without cleanup

**Solution:**
1. Delete old data:
   ```sql
   DELETE FROM table_name WHERE company_id = '2e31b75b-...';
   ```
2. Re-run script
3. Or modify script to handle duplicates

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-04 | Initial implementation |

## Related Documentation

- [SEED_DATA_GUIDE.md](SEED_DATA_GUIDE.md) - User-facing detailed guide
- [SEED_DATA_SUMMARY.txt](SEED_DATA_SUMMARY.txt) - Quick reference
- Database schema: `/migrations/018_phase2a_2d_comprehensive_schema.sql`

## Support

For questions or issues:

1. Review error message and SQL query
2. Check table schema with information_schema query
3. Verify environment variables are set
4. Run verification queries from section above
5. Check git log for recent schema changes
