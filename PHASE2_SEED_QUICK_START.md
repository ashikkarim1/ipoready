# Phase 2 Seed Script - Quick Start

## One-Liner Execution

```bash
npm run seed:phase2:test
```

## What Happens

1. ✅ Validates user `test@ipoready.com` exists
2. 📝 Inserts 44 cost items ($50.2M total IPO costs)
3. 📊 Creates 24 monthly financial metric snapshots
4. 🔄 Seeds 3 dilution scenarios with cap table
5. ✍️ Creates 10 consent requests (mixed statuses)
6. ⚖️ Adds 12 corporate board resolutions
7. 🤝 Seeded 3 syndication agreements
8. 📋 Populates 22 listing requirements (NASDAQ/NYSE/TSX)

**Total Time:** ~2-3 seconds

## Output

On success, you'll see:

```
✅ PHASE 2 SEED COMPLETE FOR test@ipoready.com

📊 DATA POPULATED:

  Cost Items (44 items): $50.2M total
    - Legal: $5.2M
    - Audit & Accounting: $4.8M
    - Investment Banking: $8.5M
    - Consulting: $3.2M
    - Printing & Delivery: $1.8M
    - Roadshow: $2.1M
    - Listing Fees: $3.2M
    - Employee-Related: $2.3M
    - Contingency: $1.5M

  Financial Metrics: 24 monthly summaries
  Dilution Scenarios: 3 scenarios with cap tables
  Consent Requests: 10 items (3 signed, 3 approved, 2 pending, 1 viewed, 1 rejected)
  Corporate Resolutions: 12 items (6 approved, 4 pending, 2 draft)
  Syndication Agreements: 3 agreements
  Listing Requirements: 22 requirements (NASDAQ/NYSE/TSX)
```

## Key Data Points

### Cost Breakdown (Most Realistic)
- **Legal:** S-1 prep ($1.2M), corporate counsel ($800K), IP review ($350K), enviro/regulatory ($400K), related party ($200K)
- **Audit:** Big Four audit ($1.8M), SOX 404 ($1.2M), accounting restatement ($600K), consulting ($200K)
- **IB:** Underwriting syndicate ($5M), co-underwriter ($2.5M), advisor ($750K), docs ($250K)
- **Consulting:** IPO readiness ($800K), governance ($450K), exec recruiting ($350K), IR ($400K), tax ($200K)
- **Printing:** Prospectus ($400K), roadshow ($300K), certificates ($150K), mailing ($250K), SEC filing ($100K), translation ($100K), shareholder proxy ($200K)
- **Roadshow:** Travel/logistics ($1.2M), accommodation ($400K), PR ($250K), streaming ($250K)
- **Listing Fees:** NASDAQ ($1.5M), SEC S-1 ($500K), FINRA ($250K), blue sky ($150K), audit expert ($200K), D&O insurance ($600K)
- **Employee:** Project mgmt ($1.8M), training ($150K), retention bonuses ($350K)
- **Contingency:** General reserve ($1M), misc services ($500K)

### Financial Metrics (24 Months)
- Monthly snapshots from Jan 2024 → Dec 2025
- Cumulative costs increase proportionally
- Budget tracking with variance analysis
- Phase completion percentage
- Cash burn rate and runway
- Team utilization metrics

### Dilution Scenarios
1. **Conservative:** $20/share, 10M shares, $200M raise, 9.1% founder dilution
2. **Base Case:** $25/share, 12M shares, $300M raise, 10.7% founder dilution (includes detailed cap table)
3. **Best Case:** Warrant exercise, $112.5M raise, 4.8% founder dilution

### Consent Requests (10 items)
| Recipient | Type | Status |
|-----------|------|--------|
| Jane Smith | Director consent (IPO) | ✅ Signed |
| Michael Wong | Director consent (Related party) | ✅ Approved |
| Series A Investors | Shareholder (Share split) | ✅ Signed |
| Alex Johnson (CEO) | Lock-up (180 days) | ⏳ Pending |
| Emily Chen (CTO) | Lock-up (180 days) | ✅ Signed |
| JP Morgan Chase | Lender consent | ⏳ Pending |
| Robert Martinez (CFO) | Officer cert (10b5-1) | ✅ Approved |
| Acme Corp | Vendor consent | 👁️ Viewed |
| Series B Investors | Shareholder (Convertible) | ⏳ Pending |
| Patricia Lee | Audit committee waiver | ❌ Rejected |

### Board Resolutions (12 items)
- ✅ IPO authorization
- ✅ 5:1 stock split
- ✅ Dividend policy
- ✅ Independent directors
- ✅ Lead independent director
- ✅ Related party approval
- ✅ Code of conduct
- ✅ Related party policy
- ⏳ Equity incentive plan expansion
- ⏳ Underwriting syndicate auth
- ⏳ IPO terms approval
- ⏳ Reverse split (contingent)

### Syndication Agreements (3)
1. **Firm Commitment (Goldman Sachs lead)**
   - 8 members, 350 bps spread, $495M net proceeds
   - Status: Negotiating

2. **Best Efforts (Morgan Stanley lead)**
   - 5 members, 450 bps spread, $45M net proceeds
   - Status: Draft

3. **Firm Commitment (JPMorgan Chase co-manager)**
   - 6 members, 280 bps spread, $360M net proceeds
   - Status: Negotiating

### Listing Requirements (22)

**NASDAQ (8):**
✅ Min shares | ✅ Min market cap | 🔄 Min shareholders | 🔄 Board independence | 🔄 Audit committee | ⏳ Comp committee | 🔄 SOX 404 | 🔄 Disclosure

**NYSE (8):**
✅ Min shares | ✅ Min market cap | 🔄 Board independence | 🔄 Audit (all indep) | ⏳ Comp (all indep) | ⏳ Nominating (all indep) | 🔄 SOX 402/302 | 🔄 Anti-fraud

**TSX (6):**
✅ Min shares | ✅ Canadian presence | 🔄 Board (2/3) | 🔄 Audit committee | 🔄 MD&A | 🔄 Financial controls

## Verify Data Inserted

```sql
-- Cost totals by category
SELECT cost_category, COUNT(*), SUM(amount_usd) 
FROM cost_items 
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
GROUP BY cost_category ORDER BY SUM DESC;

-- Consent status breakdown
SELECT status, COUNT(*) 
FROM consent_requests 
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
GROUP BY status;

-- Latest financial metrics
SELECT metric_date, total_ipo_costs_usd, phase_completion_pct
FROM financial_metrics
WHERE company_id = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9'
ORDER BY metric_date DESC LIMIT 1;
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| `User test@ipoready.com not found` | Run `npm run seed-benchmarks` first to create test account |
| `DATABASE_URL is not set` | Set env var: `export DATABASE_URL=...` |
| `Schema tables missing` | Run migrations: `npm run db:migrate` |
| Script exits early | Check console for first error; fix and re-run |

## Files Changed

- ✅ `/scripts/seed-phase2-test-account.ts` — Main seed script (550 lines)
- ✅ `/package.json` — Added `seed:phase2:test` script
- ✅ `/PHASE2_SEED_SCRIPT.md` — Detailed documentation
- ✅ `/PHASE2_SEED_QUICK_START.md` — This file

## Next Steps

After seeding:

1. **Test Filters & Sorting**
   - Navigate to cost items dashboard
   - Filter by cost_category, status, phase
   - Sort by amount, date, approval status

2. **Verify Financial Metrics**
   - Check monthly KPI rollup
   - Confirm budget tracking calculations
   - Validate burn rate trends

3. **Test Dilution Scenarios**
   - Load scenario details
   - Check cap table shareholder rows
   - Compare pre vs. post ownership %

4. **Consent Workflow**
   - Test consent request list filter
   - Verify deadline reminders
   - Check rejection/resubmit flow

5. **Resolution Tracking**
   - Filter by type and status
   - Verify vote counts
   - Check approval dates

6. **Exchange Compliance**
   - Navigate to listing requirements
   - Filter by exchange and status
   - Verify completion tracking

## Architecture Notes

- **Idempotent:** Safe to re-run; uses fresh UUIDs
- **Transaction-safe:** Each insert isolated; partial failures visible
- **User-scoped:** All data linked to `test@ipoready.com`
- **Realistic:** Costs, vendors, timelines based on actual IPO benchmarks
- **Extensible:** Easily adapted for multi-company seeding

---

**Version:** 1.0  
**Created:** 2025-06-03  
**Test Account:** test@ipoready.com  
**Company ID:** 2e31b75b-813f-48bf-a03f-2b2a0da0c0a9
