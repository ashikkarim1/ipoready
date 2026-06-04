# Seed Data Quick Start Guide

## What Was Created?

Comprehensive test data for `test@ipoready.com` account showing a realistic Series C SaaS company (VentureTech Innovations Inc) ready for TSXV IPO listing.

## The 30-Second Version

✅ **Run this once:**
```bash
NODE_ENV=production DATABASE_URL="postgresql://neondb_owner:npg_CA0Le4RlEnzU@ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" node seed-comprehensive-test-data.js
```

✅ **Then open browser and log in:**
- Email: test@ipoready.com
- Navigate to dashboard

✅ **See all the impressive data:**
- Company profile with $100M valuation
- Board members with gaps identified
- Cap table with 5.15M shares
- Prospectus sections (72% complete)
- Document checklist (86% average)
- Dilution scenarios
- Cost projections
- Insurance framework
- Data reconciliation dashboard

## What's in the Database?

| Component | Count | Status |
|-----------|-------|--------|
| **Company Profile** | 1 | ✅ Complete |
| **Board Members** | 3 | ✅ + 2 gaps identified |
| **Cap Table Shareholders** | 7 | ✅ Complete |
| **Dilution Scenarios** | 3 | ✅ Complete |
| **Prospectus Sections** | 9 | ✅ 72% complete |
| **Document Checklist** | 8 | ✅ 86% avg complete |

## Key Numbers

| Metric | Value |
|--------|-------|
| Company Valuation | $100M USD |
| Team Size | 145 employees |
| PACE Score | 72% (ahead of schedule) |
| Runway | 24 months |
| Board Filled | 3/5 seats (60%) |
| Shares Outstanding | 5.15M |
| Prospectus Complete | 72% |
| Document Progress | 86% avg |

## How to Access the Data

### Option 1: Via Dashboard
1. Log in as test@ipoready.com
2. Go to dashboard
3. All new Phase 2 pages will show data

### Option 2: Via SQL
```sql
-- View company
SELECT name, valuation_usd, pace_score
FROM companies
WHERE id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

-- View cap table
SELECT name, type, shares
FROM cap_table_holders
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

-- View prospectus
SELECT section_name, status
FROM prospectus_sections
WHERE prospectus_id IN (
  SELECT id FROM prospectuses
  WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
);
```

## Key Features Demonstrated

| Feature | What You'll See |
|---------|-----------------|
| **Gap Analysis** | 2 Independent Directors needed for TSXV |
| **Cap Table** | 60% founders, 38% investors, 5% employees |
| **Dilution** | 3 scenarios (Series D, Options, Warrants) |
| **Prospectus** | 9 sections with quality ratings (2/5 to 5/5) |
| **Checklist** | IPO prep progress: 86% average complete |
| **Reconciliation** | Data alignment checks across systems |
| **Costs** | 5-year projection: $2.85M total |
| **Insurance** | Required and recommended coverage |

## Board Members

| Name | Title | Experience | Status |
|------|-------|-----------|--------|
| John Smith | CEO & Founder | 15 years | ✅ Filled |
| Sarah Chen | CFO | 12 years public | ✅ Filled |
| Michael Rodriguez | CTO | 18 years | ✅ Filled |
| **[Vacant]** | Independent Director #1 | — | 🔴 Gap |
| **[Vacant]** | Independent Director #2 | — | 🔴 Gap |

## Cap Table Breakdown

```
Total: 5,150,000 shares

John Smith (Founder)          1,800,000  (36%)
Co-Founders (2 others)        1,200,000  (24%)
Series A Investors              875,000  (17.5%)
Series B Investors              625,000  (12.5%)
Series C Investors              400,000  (8%)
Employee Options (Vested)       100,000  (2%)
Employee Options (Unvested)     150,000  (3%)
```

## Prospectus Completion

| Section | Status | Quality |
|---------|--------|---------|
| 1. Executive Summary | In Progress | ⭐⭐⭐ |
| 2. Risk Factors | In Progress | ⭐⭐ |
| 3. Use of Proceeds | In Progress | ⭐⭐⭐ |
| 4. Management | Completed | ⭐⭐⭐⭐ |
| 5. Financial D&A | In Progress | ⭐⭐⭐ |
| 6. Market Opportunity | Completed | ⭐⭐⭐⭐⭐ |
| 7. Capitalization | Completed | ⭐⭐⭐ |
| 8. Subscription Rights | In Progress | ⭐⭐ |
| 9. Underwriters | Not Started | ⭐ |

## 5-Year Cost Forecast

```
Year 1 (IPO Year):     $650K
  - Legal               $120K
  - Audit               $150K
  - Insurance            $75K
  - IR/Communications   $100K
  - Other               $205K

Years 2-5 (Annual):    $550K each
  - Audit               $150K
  - Legal               $120K
  - Insurance           $100K
  - IR/Communications   $100K
  - Other                $80K

Total 5-Year Cost:     $2.85M
```

## Quick Verification

Run this to verify data exists:

```bash
NODE_ENV=production DATABASE_URL="..." node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const co = await sql\`SELECT name, pace_score FROM companies WHERE id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'\`;
  const cap = await sql\`SELECT COUNT(*) as count FROM cap_table_holders WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'\`;
  console.log('✅ Company:', co[0].name);
  console.log('✅ Cap Table:', cap[0].count, 'shareholders');
  process.exit(0);
})();
"
```

## Troubleshooting

### Data doesn't appear?
1. Clear browser cache: Cmd+Shift+R
2. Log out and back in
3. Check database directly with SQL query above

### Script fails?
1. Check DATABASE_URL is set correctly
2. Verify database connection
3. Ensure @neondatabase/serverless is installed

### Want to reset?
```sql
-- Clear old data
DELETE FROM cap_table_holders WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';
DELETE FROM document_scorecards WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';
DELETE FROM team_members WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

-- Re-run seed script
node seed-comprehensive-test-data.js
```

## Files Included

1. **seed-comprehensive-test-data.js** - Main seed script
2. **SEED_DATA_GUIDE.md** - Detailed documentation
3. **SEED_DATA_SUMMARY.txt** - Complete summary
4. **SEED_DATA_IMPLEMENTATION.md** - Dev reference
5. **SEED_DATA_QUICK_START.md** - This file

## Company Story (For Demo)

> VentureTech Innovations Inc is a 6-year-old SaaS company based in Toronto that provides enterprise resource planning (ERP) solutions to mid-market companies. With $45M in funding raised across three rounds (Series A, B, C), the company has grown to 145 employees and achieved $12.5M in annual recurring revenue with 140% YoY growth.
>
> The company now has $24 million in runway and is preparing for a TSXV listing to raise capital for rapid expansion in the North American market.
>
> Current challenges:
> - Board needs 2 additional independent directors for governance compliance
> - Prospectus is 72% complete with some weak sections (Risk Factors, Subscriptions)
> - IPO costs estimated at $650K in Year 1, plus $550K annually ongoing
> - Burn rate must be reconciled across all systems (currently missing from prospectus)

---

**Ready?** Run the seed script and log in as test@ipoready.com to see all the data!
