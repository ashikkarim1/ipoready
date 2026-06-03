# Phase 2 Seed Script Documentation

## Overview

The Phase 2 seed script (`seed-phase2-test-account.ts`) populates the test account (`test@ipoready.com`) with comprehensive dummy data for all Phase 2A-2D features:

- **Phase 2A**: Cost tracking & financial metrics
- **Phase 2B**: Dilution scenarios & cap table modeling  
- **Phase 2C**: Syndication agreements & templates
- **Phase 2D**: Consent requests, corporate resolutions, & listing requirements

## Execution

```bash
npm run seed:phase2:test
```

**Requirements:**
- `DATABASE_URL` environment variable set
- TypeScript (`tsx`) available in project
- PostgreSQL database with Phase 2 schema migrations applied

## What Gets Seeded

### 1. Cost Items (44 items, $50.2M total)

Realistic IPO cost breakdown by category:

| Category | Amount | Count | Examples |
|----------|--------|-------|----------|
| Legal | $5.2M | 6 | S-1 prep, corporate counsel, IP review |
| Audit & Accounting | $4.8M | 4 | Big Four audit, SOX 404, restatement |
| Investment Banking | $8.5M | 4 | Underwriting syndicate, advisor fees |
| Consulting | $3.2M | 5 | IPO readiness, governance, recruiting |
| Printing & Delivery | $1.8M | 7 | Prospectus, materials, mailing |
| Roadshow | $2.1M | 4 | Travel, logistics, PR, streaming |
| Listing Fees | $3.2M | 6 | NASDAQ, SEC, FINRA, blue sky, D&O |
| Employee-Related | $2.3M | 3 | Project mgmt (8 FTE), training, retention |
| Contingency | $1.5M | 2 | Reserved budget, miscellaneous |

**Features:**
- Realistic vendor names (Goldman Sachs, Deloitte, etc.)
- Cost status tracking: estimated, committed, incurred, invoiced, paid
- Phase assignment (1-8 of IPO timeline)
- Labor hour tracking with hourly rates
- Approval workflows (pending/approved/rejected)

### 2. Financial Metrics (24 monthly snapshots)

Monthly rollup spanning 24 months (Jan 2024 - Dec 2025):

**Per month includes:**
- Total IPO costs to date (cumulative)
- Budget remaining vs. actual spend
- Budget variance and status (on_track/over_budget/under_budget)
- Category breakdown (legal, audit, accounting, IB, etc.)
- Cash outflow and burn rate
- Phase completion % and days to listing
- Team hours invested and utilization %

**Pattern:** Costs ramp proportionally over 24 months, burn rate constant

### 3. Dilution Scenarios (3 scenarios with cap tables)

**Scenario 1: Series C @ $20/share (Conservative)**
- New 10M shares at $20
- $200M raise
- 9.1% founder dilution

**Scenario 2: Series C @ $25/share (Base Case)** ⭐ *Most detailed*
- New 12M shares at $25
- $300M raise
- 10.7% founder dilution
- **Includes detailed shareholder cap table:**
  - Founder Pool (3 founders)
  - Employee Stock Option Pool
  - Series A Investor (Lead)
  - Series B Investors
  - Series C (New)

**Scenario 3: Warrant Exercise @ $2/warrant (Best Case)**
- 5M new shares via warrant conversion
- $112.5M raise
- 4.8% founder dilution

**Status:** draft, reviewed, draft

### 4. Consent Requests (10 items)

Mixed consent types and statuses:

| Recipient | Type | Subject | Status |
|-----------|------|---------|--------|
| Jane Smith | director_consent | IPO Participation & Lock-up | Signed |
| Michael Wong | director_consent | Related Party Disclosure | Approved |
| Series A Investors | shareholder_consent | Share Split Authorization | Signed |
| Alex Johnson (CEO) | founder_lock_up | 180-day Lock-up | Pending |
| Emily Chen (CTO) | founder_lock_up | 180-day Lock-up | Signed |
| JP Morgan Chase | lender_consent | Debt Prepayment & Consent | Pending |
| Robert Martinez (CFO) | officer_consent | Insider Trading & 10b5-1 | Approved |
| Acme Corp (Customer) | vendor_consent | Business Continuity | Viewed |
| Series B Investors | shareholder_consent | Convertible Conversion | Pending |
| Patricia Lee | director_consent | Audit Committee Expert Waiver | Rejected |

**Status Breakdown:**
- Signed: 3
- Approved: 3
- Pending: 2
- Viewed: 1
- Rejected: 1 (with rejection reason)

**Features:**
- Email tracking
- Signature method (e-signature)
- Deadline dates
- Signed date and signatory name
- Rejection reason with resubmit option

### 5. Corporate Resolutions (12 items)

Board and shareholder resolutions:

| Type | Title | Board? | Shareholder? | Status |
|------|-------|--------|--------------|--------|
| board_authorization | Board Authorization to Pursue IPO | ✓ | ✗ | Approved |
| share_split | 5:1 Stock Split Authorization | ✓ | ✓ | Approved |
| stock_option_plan | Equity Incentive Plan Expansion | ✓ | ✓ | Pending |
| director_appointment | Independent Directors Election | ✓ | ✗ | Approved |
| director_appointment | Lead Independent Director | ✓ | ✗ | Approved |
| dividend_policy | Adoption of Dividend Policy | ✓ | ✗ | Approved |
| related_party | Related Party Transaction Approval | ✓ | ✗ | Approved |
| board_authorization | Underwriting Syndicate Authorization | ✓ | ✗ | Pending |
| shareholder_approval | IPO Terms Approval | ✗ | ✓ | Pending |
| share_split | Reverse Stock Split (Contingent) | ✓ | ✓ | Draft |
| other | Code of Conduct Adoption | ✓ | ✗ | Approved |
| other | Related Party Policy Adoption | ✓ | ✗ | Approved |

**Features:**
- Vote tracking (board_vote_count, board_vote_in_favor)
- Approval date tracking
- Prepared by / Reviewed by user assignment
- Governance workflow (draft → pending → approved)

### 6. Syndication Agreements (3 agreements)

Underwriting syndicate structures:

**Agreement 1: Firm Commitment (Goldman Sachs lead)**
- Member count: 8
- Gross spread: 350 bps
- Net proceeds: $495M
- Status: Negotiating

**Agreement 2: Best Efforts (Morgan Stanley lead)**
- Member count: 5
- Gross spread: 450 bps
- Net proceeds: $45M
- Status: Draft

**Agreement 3: Firm Commitment (JPMorgan Chase co-manager)**
- Member count: 6
- Gross spread: 280 bps
- Net proceeds: $360M
- Status: Negotiating

**Features:**
- Realistic underwriter names
- Co-underwriter syndicate lists
- Gross spread basis points (industry standard: 250-400 bps)
- Net proceeds calculation
- Lock-up period: 180 days (standard)
- Status tracking (draft → negotiating → signed → executed → closed)

### 7. Listing Requirements (22 total across 3 exchanges)

**NASDAQ (8 requirements):**
- Minimum shares outstanding ✅
- Minimum market cap ✅
- Minimum public shareholders 🔄
- Board independence 🔄
- Audit committee 🔄
- Compensation committee ⏳
- SOX 404 compliance 🔄
- Disclosure & reporting 🔄

**NYSE (8 requirements):**
- Minimum shares outstanding ✅
- Minimum market cap ✅
- Board independence 🔄
- Audit committee (all independent) 🔄
- Compensation committee (all independent) ⏳
- Nominating committee (all independent) ⏳
- SOX 402 & 302 compliance 🔄
- Anti-fraud & insider trading 🔄

**TSX (6 requirements):**
- Minimum shares outstanding ✅
- Canadian presence ✅
- Board independence (2/3) 🔄
- Audit committee composition 🔄
- MD&A disclosure 🔄
- Financial reporting controls 🔄

**Status legend:**
- ✅ = completed (100%)
- 🔄 = in_progress (60%)
- ⏳ = not_started (0%)

**Features:**
- Exchange-specific requirements
- Category classification (financial, governance, audit, disclosure, operational)
- Completion % tracking
- Compliance status (compliant/non-compliant/null)
- Exemption tracking
- Validation method and date
- Supporting document URLs
- Deadline dates

## Database Schema

All data maps to Phase 2A-2D schema tables:

```
cost_items ← individual costs
financial_metrics ← monthly KPI snapshots
dilution_scenarios ← cap table scenarios
  └─ dilution_scenario_shareholders ← cap table rows per scenario
consent_requests ← approval workflow tracking
corporate_resolutions ← board & shareholder resolutions
syndication_agreements ← underwriting syndicate terms
listing_requirements ← exchange compliance checklist
```

## Verification

After running the seed script, verify data with these queries:

```sql
-- Cost summary
SELECT 
  cost_category, 
  COUNT(*) as item_count, 
  SUM(amount_usd) as total_amount
FROM cost_items 
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
GROUP BY cost_category
ORDER BY total_amount DESC;

-- Financial metrics (latest month)
SELECT 
  metric_date,
  total_ipo_costs_usd,
  budget_remaining_usd,
  phase_completion_pct
FROM financial_metrics
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
ORDER BY metric_date DESC LIMIT 1;

-- Dilution scenarios
SELECT 
  scenario_name,
  new_shares_issued,
  issue_price_per_share_usd,
  total_raise_usd,
  founder_dilution_pct
FROM dilution_scenarios
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
ORDER BY status;

-- Consent request status summary
SELECT 
  status,
  COUNT(*) as count
FROM consent_requests
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
GROUP BY status;

-- Listing requirement status by exchange
SELECT 
  exchange_code,
  status,
  COUNT(*) as count
FROM listing_requirements
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
GROUP BY exchange_code, status
ORDER BY exchange_code, status;
```

## Test Account Details

- **Email:** test@ipoready.com
- **Company:** MediFlow Health Technologies Inc.
- **ID:** 2e31b75b-813f-48bf-a03f-2b2a0da0c0a9
- **Valuation:** $100M USD (pre-IPO)
- **Current Phase:** Regulatory Filing

## Notes

1. **Realistic Data:** All costs, vendor names, and financial figures are based on actual IPO benchmarks for $200-500M raise tech/healthcare companies.

2. **Timestamp Isolation:** All timestamps use `NOW()` to ensure fresh seeding independent of system time.

3. **User Attribution:** All records linked to `test@ipoready.com` user for proper audit trails.

4. **Idempotency:** Safe to re-run; uses UUIDs for deterministic IDs where needed.

5. **Scalability:** Script is self-contained; easily adaptable to seed multiple companies or phases.

## Troubleshooting

**Error: User not found**
```
User test@ipoready.com not found
```
→ Ensure user account exists; run primary seed-test-account.js first

**Error: Database connection failed**
→ Check DATABASE_URL environment variable is set correctly

**Error: Schema tables missing**
→ Run migrations first: `npm run db:migrate`

**Partial seed failure**
→ Script exits on first error; fix issue and re-run (safe to re-run)

## Future Enhancements

- Multi-company seeding variants
- Phase-specific seed profiles (early vs. advanced)
- Stress test data generators (10K+ cost items)
- Randomization for realistic variance
- Post-listing financial metrics (Phase 8+)
- Timeline-based probability weighting

## Support

For issues or enhancements, refer to:
- Phase 2 roadmap: /MEMORY.md
- Schema reference: migrations/018_phase2a_2d_comprehensive_schema.sql
- Related seeds: scripts/seed-ipo-benchmarks.ts
