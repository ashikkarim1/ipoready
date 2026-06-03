# IPOReady E2E Demo Flow Documentation

**Version:** 1.0  
**Date:** June 3, 2026  
**Status:** Complete Feature Demo  
**Demo Company:** TechCorp Inc.

---

## Overview

This document captures the complete end-to-end demonstration flow for IPOReady's Phase 2 features. It showcases the integrated workflow for managing IPO readiness across financial planning, cap table management, and compliance operations.

**Total Demo Time:** ~15 minutes  
**Demo Company Profile:**
- Company: TechCorp Inc.
- Exchange: TSX (main board)
- Complexity: Medium
- Timeline: 6-month IPO prep
- Company ID: `techcorp-demo-001`

---

## Demo Prerequisites

### Setup Requirements
- Active user session with TechCorp company context loaded
- Sample cap table data loaded (XLSX with 12 shareholders)
- Compliance module initialized for TSX exchange
- Budget data pre-configured for 6-month projection

### Test Data Ready
- Financial estimates cached at `/api/cost-calculator`
- Cap table document in database at `doc_techcorp_cap_table_v2.xlsx`
- Listing rules validator configured for TSX rules
- Consent letter templates available

---

# DEMO FLOW: 7 Major Scenes

## SCENE 1: Dashboard Entry & Sidebar Navigation

### Starting Point
- URL: `https://ipoready.app/dashboard`
- User: logged-in TechCorp admin
- State: Fresh dashboard load, company context active

### Expected Screen
**Dashboard Home**
- Header: "IPOReady Dashboard — TechCorp Inc."
- Breadcrumb: `Dashboard / Overview`
- Left sidebar with navigation menu showing:
  ```
  WORKSPACE
  ├─ Dashboard (current)
  ├─ PACE™ Score
  ├─ Checklist (180+ milestones)
  │
  NEW SECTIONS IN PHASE 2:
  ├─ Financial Management ✨ NEW
  │  ├─ Cost Calculator
  │  ├─ Budget Tracking
  │  └─ Financial Estimates
  │
  ├─ Cap Table ✨
  │  ├─ Upload & Validate
  │  ├─ Dilution Scenarios
  │  └─ Shareholder Analysis
  │
  ├─ Compliance ✨ NEW
  │  ├─ Listing Rules Validator
  │  ├─ Resolutions Manager
  │  └─ Consent Letters
  │
  ├─ Documents
  ├─ Team
  └─ Settings
  ```

### Key Observations
- **Highlight:** The new Financial Mgmt, Cap Table, and Compliance sections in the sidebar
- **Color:** Financial Mgmt icons use accent orange; Compliance uses security blue
- **Badges:** "NEW" badges on Phase 2 menu items (optional visual indicator)

### Demo Points
- Walk through the sidebar structure
- Emphasize the three new major workflows: Financial, Cap Table, Compliance
- Show that each section is fully integrated (no dead links)

---

## SCENE 2: Financial Management → Cost Calculator

### Navigation
- Click: `Sidebar > Financial Management > Cost Calculator`
- URL: `https://ipoready.app/financial/cost-calculator`
- Load time: <1 second (component cached)

### Expected Screen: IPO Cost Calculator

```
┌─────────────────────────────────────────────────────────────────┐
│ IPO Cost Calculator                             [Export] [Share] │
│ Estimate your total IPO costs and net proceeds                  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ FEE BREAKDOWN (Left Panel)                              │    │
│ ├─────────────────────────────────────────────────────────┤    │
│ │ Exchange Fees        │ [$2,500,000]                    │    │
│ │ Legal Fees           │ [$5,000,000]                    │    │
│ │ Accounting Fees      │ [$2,500,000]                    │    │
│ │ Underwriting Fees    │ [$5,000,000]                    │    │
│ │ Marketing Fees       │ [$1,500,000]                    │    │
│ │ Other Fees           │ [$1,000,000]                    │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────┐                                │
│  │ SUMMARY (Right Panel)      │                                │
│  ├────────────────────────────┤                                │
│  │ Gross Proceeds  $100.0M    │                                │
│  │ Total Costs      $17.5M    │                                │
│  │ ────────────────────────── │                                │
│  │ Net Proceeds     $82.5M ✓  │                                │
│  │ 17.5% of proceeds          │                                │
│  └────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

### Demo Interaction: Fill in TechCorp Data

**Step 1: Review Default Values**
- Estimated Proceeds: $100M (default)
- Show that all fee categories are pre-populated with TSX-typical rates

**Step 2: Customize for TechCorp (Medium Complexity, 6-month timeline)**
- Update values to reflect TechCorp's profile:
  - Exchange Fees: $2.5M (TSX main board listing fee)
  - Legal Fees: $5.2M (securities counsel + corporate counsel)
  - Accounting Fees: $2.8M (audit + IFRS compliance work)
  - Underwriting Fees: $5.0M (5% underwriting spread)
  - Marketing Fees: $1.8M (roadshow + IR materials)
  - Other Fees: $1.2M (filing, transition, technology)
  - **Total: $18.5M**

**Step 3: Show Cost Breakdown**
```
Gross Proceeds        $100.0M
────────────────────────────
Exchange Fees          -$2.5M
Legal Fees             -$5.2M
Accounting Fees        -$2.8M
Underwriting Fees      -$5.0M
Marketing Fees         -$1.8M
Other Fees             -$1.2M
────────────────────────────
NET PROCEEDS           $81.5M
────────────────────────────

Cost as % of proceeds: 18.5%
```

### Key Data Points to Highlight
- **Total IPO Costs:** $18.5M
- **Net Proceeds to Company:** $81.5M
- **Cost Percentage:** 18.5% of gross (within industry standard of 15-20%)
- **Cost Breakdown Visual:** Show pie chart or bar chart of cost categories

### Interactive Elements
- **Export Button:** Click to show "Exported as PDF" confirmation
- **Share Button:** Click to show "Link copied to clipboard" toast message
- **Edit Fields:** Show that each field is editable (hover to edit)

### Demo Points
- Emphasize transparency: users know exactly where money goes
- Show cost benchmarking: "18.5% is typical for TSX $100M+ IPOs"
- Highlight the accuracy: costs are based on 2025-2026 market data
- Mention: "These estimates are updated monthly based on market conditions"

---

## SCENE 3: Budget Tracking → 6-Month Financial Progress

### Navigation
- Click: `Sidebar > Financial Management > Budget Tracking`
- URL: `https://ipoready.app/financial/budget-tracking`
- Load time: <1 second

### Expected Screen: Budget Tracking Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Budget Tracking                                                   │
│ Monitor IPO-related expenses and track budget allocation         │
│                                                                  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│ │TOTAL BUDGETED│ │ TOTAL SPENT  │ │  REMAINING  │ │SPENT %   ││
│ │   $17.5M     │ │   $6.2M      │ │   $11.3M    │ │35.4%     ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
│                                                                  │
│ CATEGORY                    │BUDGETED │SPENT  │REMAINING│STATUS │
│─────────────────────────────┼─────────┼───────┼─────────┼───────┤
│Legal & Compliance           │$5.0M    │$3.2M  │$1.8M    │●●●●◯◯│
│ [████░░░░] On Track 64%     │         │       │         │       │
│─────────────────────────────┼─────────┼───────┼─────────┼───────┤
│Accounting & Audit           │$2.5M    │$1.8M  │$0.7M    │●●●●◯◯│
│ [████░░░░] On Track 72%     │         │       │         │       │
│─────────────────────────────┼─────────┼───────┼─────────┼───────┤
│Underwriting                 │$5.0M    │$4.5M  │$0.5M    │●●●●●◯│
│ [█████░░░░] At Risk 90%    │         │       │         │⚠️     │
│─────────────────────────────┼─────────┼───────┼─────────┼───────┤
│Marketing & IR               │$1.5M    │$0.9M  │$0.6M    │●●◯◯◯◯│
│ [██░░░░░░░] On Track 60%   │         │       │         │       │
│─────────────────────────────┼─────────┼───────┼─────────┼───────┤
│Technology & Systems         │$1.0M    │$0.6M  │$0.4M    │●●◯◯◯◯│
│ [██░░░░░░░] On Track 60%   │         │       │         │       │
│─────────────────────────────┼─────────┼───────┼─────────┼───────┤
│Exchange Fees                │$2.5M    │$2.5M  │$0M      │●●●●●●│
│ [██████████] Complete      │         │       │         │✓      │
│─────────────────────────────┴─────────┴───────┴─────────┴───────┤
│                                                                  │
│ ⚠️ ALERT: Underwriting costs at 90% of budget                   │
│    Review underwriting arrangements or increase allocation.    │
└──────────────────────────────────────────────────────────────────┘
```

### Key Metrics
**Summary Cards (Top)**
- Total Budgeted: $17.5M
- Total Spent: $6.2M
- Remaining: $11.3M
- Spent Percentage: 35.4% (of total budget)

**Budget Items Table (Main)**
| Category | Budgeted | Spent | Remaining | Status |
|----------|----------|-------|-----------|--------|
| Legal & Compliance | $5.0M | $3.2M | $1.8M | On Track (64%) |
| Accounting & Audit | $2.5M | $1.8M | $0.7M | On Track (72%) |
| Underwriting | $5.0M | $4.5M | $0.5M | **At Risk (90%)** ⚠️ |
| Marketing & IR | $1.5M | $0.9M | $0.6M | On Track (60%) |
| Technology & Systems | $1.0M | $0.6M | $0.4M | On Track (60%) |
| Exchange Fees | $2.5M | $2.5M | $0M | Complete ✓ |

### 6-Month Timeline View (Optional Addition)
Show progress by month:
```
Month 1 (Jan)  ████░░░░░░ $600K spent
Month 2 (Feb)  ██████░░░░ $1.2M spent
Month 3 (Mar)  ████████░░ $1.8M spent
Month 4 (Apr)  ██████████ $2.4M spent
Month 5 (May)  ██████████ $2.8M spent
Month 6 (Jun)  ██████████ $3.2M spent (projected)
```

### Alert Widget
**"Underwriting costs at 90% of budget"**
- Color: Orange/warning
- Icon: Triangle with exclamation mark
- Message: "Review underwriting arrangements or increase budget allocation"
- Action: "View Details" link (can lead to underwriter management panel)

### Demo Points
- Show real-time budget tracking: "You're 35% through your budget, 2 months into the timeline"
- Highlight cost control: Legal, Accounting, and Marketing are all on track
- Draw attention to risk: Underwriting is at 90% (may need renegotiation)
- Emphasize flexibility: "Budget can be adjusted month-to-month based on timeline changes"
- Show that all items link to underlying cost categories (clicking a row opens details)

---

## SCENE 4: Cap Table → Dilution Scenarios Analysis

### Navigation
- Click: `Sidebar > Cap Table > Dilution Scenarios`
- URL: `https://ipoready.app/cap-table` (with scenario tab active)
- Load time: ~2 seconds (cap table data fetched from API)

### Expected Screen: Cap Table Dashboard with Scenarios

```
┌────────────────────────────────────────────────────────────────────┐
│ Cap Table Management                                               │
│ Upload, validate, analyze, and model cap table scenarios          │
│                                                                   │
│ [Scenario Selector] ▼                                             │
│ ┌──────────────────────────────────────┐                          │
│ │ Current State │ Optimistic │ Conservative                       │
│ └──────────────────────────────────────┘                          │
│                                                                   │
│ CURRENT STATE TAB (Selected)                                      │
│                                                                   │
│ Summary Cards:                                                    │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────────┐  │
│ │Total Shares│ │Share       │ │Total       │ │Total Share   │  │
│ │Issued      │ │Classes     │ │Shareholders│ │Auth          │  │
│ │18,500,000  │ │3 (A/B/Opt) │ │12          │ │30,000,000    │  │
│ └────────────┘ └────────────┘ └────────────┘ └───────────────┘  │
│                                                                   │
│ HOLDINGS TABLE                                                    │
│ Shareholder          │Class│Quantity  │%      │Vested          │
│──────────────────────┼─────┼──────────┼───────┼─────────────────│
│Founder A (Sarah)     │ A   │4,000,000 │21.6%  │✓ Vested        │
│Founder B (Marc)      │ A   │3,500,000 │18.9%  │✓ Vested        │
│Series A VC Fund      │ B   │5,000,000 │27.0%  │✓ Vested        │
│Series B VC Fund      │ B   │3,000,000 │16.2%  │✓ Vested        │
│Employee Stock Plan   │ Opt │1,500,000 │8.1%   │30% Vested      │
│Angel Investors (6)   │ A   │1,500,000 │8.1%   │✓ Vested        │
│──────────────────────┴─────┴──────────┴───────┴─────────────────│
│                     TOTAL 18,500,000 100%                        │
│                                                                   │
│ WATERFALL CHART (IPO Scenario)                                   │
│ Current Ownership          Post-IPO (with 5M new shares)         │
│ ├─ Founders      40.5% ──→ Founders    28.2%                    │
│ ├─ Series A VC   27.0% ──→ Series A VC 18.7%                    │
│ ├─ Series B VC   16.2% ──→ Series B VC 11.2%                    │
│ ├─ Employees      8.1% ──→ Employees   5.6%                     │
│ ├─ Angels         8.1% ──→ Angels      5.6%                     │
│ └─ IPO Public      —   ──→ Public      30.7% (5M / 23.5M)       │
│                                                                   │
│ [Export as CSV] [Export for Prospectus] [Share with Advisors]  │
└────────────────────────────────────────────────────────────────────┘
```

### Demo Interaction: Load TechCorp Scenario

**Step 1: Show Current State**
- TechCorp cap table already loaded (from `/api/cap-table`)
- Display:
  - Total Shares Issued: 18,500,000
  - Share Classes: 3 (Common A, Series A, Series B, Options)
  - Shareholders: 12
  - Authorized Shares: 30,000,000 (capacity for IPO shares)

**Step 2: Display Current Holdings**
```
Holdings Summary:
─────────────────────────────────────────────────────────
Founder A (Sarah Chen)        4,000,000 shares  21.6%
Founder B (Marc Leblanc)      3,500,000 shares  18.9%
Series A VC (Accel Partners)  5,000,000 shares  27.0%
Series B VC (Sequoia Capital) 3,000,000 shares  16.2%
Employee Stock Plan           1,500,000 shares   8.1%
Angel Investors (6 total)     1,500,000 shares   8.1%
─────────────────────────────────────────────────────────
TOTAL                        18,500,000 shares 100.0%
```

**Step 3: Click "Optimistic Scenario" Tab**
- Show IPO with 5M new shares at $20/share = $100M gross proceeds
- New ownership structure:
  ```
  Founders:        28.2% (down from 40.5%)
  Series A VC:     18.7% (down from 27.0%)
  Series B VC:     11.2% (down from 16.2%)
  Employees:        5.6% (down from 8.1%)
  Angels:           5.6% (down from 8.1%)
  IPO Public:      30.7% (5M new shares / 23.5M total)
  ```

**Step 4: Click "Conservative Scenario" Tab**
- Show IPO with 3M new shares at $15/share = $45M gross proceeds
- New ownership structure:
  ```
  Founders:        31.1% (down from 40.5%)
  Series A VC:     28.7% (down from 27.0%, stays ~same)
  Series B VC:     13.5% (down from 16.2%)
  Employees:        6.4% (down from 8.1%)
  Angels:           6.4% (down from 8.1%)
  IPO Public:      13.9% (3M new shares / 21.5M total)
  ```

### Key Data Points to Highlight
- **Current Full Dilution:** 18.5M shares
- **Fully Diluted (with Options):** ~20M shares
- **IPO Scenarios:**
  - Optimistic: 5M shares, $100M proceed, 23.5M post
  - Conservative: 3M shares, $45M proceed, 21.5M post
- **Founder Dilution:** From 40.5% today → 28-31% at IPO (acceptable range)
- **VC Ownership:** Both VCs maintain significant ownership post-IPO (acceptable)

### Export Functionality
- **[Export as CSV]** → Downloads complete cap table as CSV with all scenarios
- **[Export for Prospectus]** → Generates Word document table for prospectus filing
- **[Share with Advisors]** → Creates shareable link with read-only access for legal team

### Demo Points
- Show cap table is "live data" — automatically updated from database
- Emphasize the three scenarios: "You can model different IPO sizes and see dilution impact"
- Highlight founder retention: "Founders stay above 25%, acceptable for post-IPO governance"
- Show transparency: "VCs always know their ownership will change; here's exactly how"
- Mention integration: "When you adjust financial targets, dilution scenarios auto-update"
- Show prospectus integration: "Scenario data feeds directly into your prospectus template"

---

## SCENE 5: Compliance → Listing Rules Validator

### Navigation
- Click: `Sidebar > Compliance > Listing Rules Validator`
- URL: `https://ipoready.app/compliance/listing-rules`
- Load time: <1 second

### Expected Screen: Listing Rules Compliance Dashboard

```
┌───────────────────────────────────────────────────────────────────┐
│ TSX Listing Rules Validator                                       │
│ Verify compliance with TSX governance and operational requirements│
│                                                                  │
│ Exchange: [TSX ▼]  |  Company: TechCorp Inc.  |  Status: 8/10 ✓ │
│                                                                  │
│ GOVERNANCE REQUIREMENTS                                          │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Current Requirements      Met?  Required                     │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ Board Independence        ✓      2 of 5 independent         │ │
│ │ Audit Committee           ✓      3 of 5 members, 1 ACFE     │ │
│ │ Compensation Committee    ✓      2 of 3 independent         │ │
│ │ Code of Conduct           ✓      Adopted and filed          │ │
│ │ Disclosure Policy         ✓      Insider trading blocked    │ │
│ │ MD&A (Mgmt Discussion)    ✓      Filed in prospectus        │ │
│ │ Financial Statements      ✓      IFRS compliant, audited    │ │
│ │ Public Float Minimum      ✗      Current: 8%, Required: 10% │ │
│ │ Shareholder Rights Plan   —      Optional but recommended   │ │
│ │ Diversity Policy          —      Optional                   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ CRITICAL GAP: Public Float (Minimum Requirement)               │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │ Current Public Float:     8% (1,480,000 shares)            │ │
│ │ Required Minimum:        10% (1,850,000 shares)            │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ Gap:                      2% (370,000 shares needed)        │ │
│ │ Valuation at $20/share:   $7.4M additional distribution    │ │
│ │                                                              │ │
│ │ Resolution Options:                                         │ │
│ │ ☐ Option A: Founders reduce holdings by 2% (370k shares)  │ │
│ │ ☐ Option B: Issue IPO shares to reach 10% float target    │ │
│ │ ☐ Option C: Restrict founder lockup period (36→24 months) │ │
│ │                                                              │ │
│ │ ⚠️ ACTION: This must be resolved BEFORE listing approval    │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ OPERATIONAL REQUIREMENTS                                       │
│ ├─ Financial Year-End:           December 31 ✓                │
│ ├─ Interim Reporting:            Quarterly (30 days post) ✓   │
│ ├─ Annual General Meeting:       Within 4 months of FYE ✓     │
│ ├─ Management Circular:          14 days before AGM ✓         │
│ └─ SEDAR+ Filing:                All docs electronically ✓    │
│                                                                  │
│ [View Full TSX Policy Manual] [Download Compliance Report] [Assign Tasks]
│                                                                  │
│ Last Updated: June 3, 2026 | Next Review: August 1, 2026      │
└───────────────────────────────────────────────────────────────────┘
```

### Demo Interaction: Review TSX Listing Rules

**Step 1: Select TSX Exchange**
- Dropdown shows: TSX, TSXV, CSE, NASDAQ, NYSE
- Select "TSX" (already selected for TechCorp)
- Validator automatically loads TSX Policy 1.1, 3.1, 3.3, 4.1-4.4

**Step 2: View Governance Status**
- Display checklist of 10 key requirements
- Show green checkmarks for compliant items:
  - ✓ Board Independence (2 of 5)
  - ✓ Audit Committee (3 of 5 members)
  - ✓ Compensation Committee (2 of 3)
  - ✓ Code of Conduct
  - ✓ MD&A (Management Discussion & Analysis)
  - ✓ Financial Statements (IFRS)

**Step 3: Highlight Gap: Public Float**
- Current Public Float: 8%
- TSX Requirement: 10% minimum
- Gap: 2% = 370,000 additional shares needed
- At $20/share IPO price = $7.4M gap

**Step 4: Show Resolution Options**
Three ways to solve the float issue:
1. **Option A:** Founders voluntarily reduce holdings by 2% (370k shares)
2. **Option B:** Increase IPO share offering to reach 10% (adjust from 5M to 5.37M shares)
3. **Option C:** Restrict founder lockup from 36 to 24 months (allows faster share release)

**Step 5: View Operational Requirements**
- Financial Year-End: December 31 ✓
- Interim Reporting: Quarterly (within 30 days) ✓
- Annual Meeting: Within 4 months of FYE ✓
- Management Circular: 14 days before AGM ✓
- SEDAR+ Filing: All documents electronic ✓

### Key Data Points to Highlight
- **Compliance Score:** 8 of 10 requirements met (80%)
- **Critical Gap:** Public Float at 8%, need 10%
- **Impact:** Gap affects list approval, must be resolved pre-listing
- **Solutions:** Three options provided; recommend Option B (adjust IPO size)
- **Timeline:** Must resolve before final TSX approval meeting

### Interactive Elements
- **View Full Policy Manual:** Link to TSX Policy documents (external)
- **Download Compliance Report:** PDF export with all checklist items
- **Assign Tasks:** Opens task panel to assign gap resolution to board member

### Demo Points
- Emphasize real-world compliance: "TSX has 10 hard requirements; we're at 8"
- Show practical guidance: "We've identified the exact gap and three ways to fix it"
- Highlight integration: "Your cap table data feeds into this validator — changes auto-update"
- Mention timeline: "Compliance issues must be resolved 60+ days before IPO"
- Show transparency: "CFO always knows where you stand vs. listing requirements"

---

## SCENE 6: Compliance → Resolutions Manager & Document Download

### Navigation
- Click: `Sidebar > Compliance > Resolutions Manager`
- URL: `https://ipoready.app/compliance/resolutions`
- Load time: <1 second

### Expected Screen: Board Resolutions Workspace

```
┌───────────────────────────────────────────────────────────────────┐
│ Board Resolutions Manager                                         │
│ Adopt & approve resolutions required for TSX listing             │
│                                                                  │
│ [+ New Resolution]  [Filter: All ▼]  [Export All as PDF]        │
│                                                                  │
│ RESOLUTIONS (4 of 12 Critical Set)                              │
│                                                                  │
│ 1. GOVERNANCE RESOLUTIONS (3)                                   │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Adopt Board Charter                                    │ │
│    │  Status: Approved Mar 15, 2026                          │ │
│    │  Approver: Sarah Chen (CEO)                             │ │
│    │  [View] [Edit] [Download] [Archive]                    │ │
│    └─────────────────────────────────────────────────────────┘ │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Adopt Audit Committee Charter                          │ │
│    │  Status: Approved Apr 2, 2026                           │ │
│    │  Approver: James Wong (Board Chair)                     │ │
│    │  [View] [Edit] [Download] [Archive]                    │ │
│    └─────────────────────────────────────────────────────────┘ │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Adopt Code of Conduct                                  │ │
│    │  Status: Approved Feb 28, 2026                          │ │
│    │  Approver: Elena Vasquez (CFO)                          │ │
│    │  [View] [Edit] [Download] [Archive]                    │ │
│    └─────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 2. COMPENSATION RESOLUTIONS (2)                                │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Approve ESOP / Stock Option Plan                       │ │
│    │  Status: Pending (awaiting legal finalization)          │ │
│    │  Assigned To: Sarah Chen (CEO)                          │ │
│    │  Due Date: June 15, 2026                                │ │
│    │  [View] [Edit] [Download Draft] [Archive]              │ │
│    └─────────────────────────────────────────────────────────┘ │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Approve Executive Compensation Policy                  │ │
│    │  Status: Not Started                                    │ │
│    │  Assigned To: Compensation Committee                    │ │
│    │  Due Date: July 1, 2026                                 │ │
│    │  [Template] [View Draft] [Archive]                     │ │
│    └─────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 3. DISCLOSURE & INSIDER TRADING RESOLUTIONS (4)                │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Adopt Disclosure Policy                                │ │
│    │  Status: Approved May 10, 2026                          │ │
│    │  [View] [Edit] [Download] [Archive]                    │ │
│    └─────────────────────────────────────────────────────────┘ │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │✓ Adopt Trading Blackout Policy                          │ │
│    │  Status: Approved May 10, 2026                          │ │
│    │  [View] [Edit] [Download] [Archive]                    │ │
│    └─────────────────────────────────────────────────────────┘ │
│    (2 more resolutions...)                                     │
│                                                                  │
│ 4. IPO-SPECIFIC RESOLUTIONS (3)                                │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ ⚠ Prospectus Approval Resolution                        │ │
│    │  Status: Not Started                                    │ │
│    │  Type: Requires unanimous board approval               │ │
│    │  Assigned To: All Board Members                         │ │
│    │  Due Date: August 1, 2026 (critical path)              │ │
│    │  [Template] [Download Template as .docx] [Email Board]│ │
│    └─────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [View All Resolutions] [Generate Composite Minute Book]        │
└───────────────────────────────────────────────────────────────────┘
```

### Demo Interaction: Download Prospectus Approval Resolution

**Step 1: Locate Prospectus Approval Resolution**
- Scroll to "IPO-SPECIFIC RESOLUTIONS" section
- Find: "Prospectus Approval Resolution"
- Status: Not Started (orange badge)
- Type: "Requires unanimous board approval"

**Step 2: Click "Download Template as .docx"**
- Expected output: Word document (.docx) file downloads
- File name: `TechCorp_Resolution_Prospectus_Approval_Draft.docx`
- Conversion: Real data from cap table + compliance info merged into template

**Step 3: Show Downloaded Document Content**
- Word document opens in preview showing:

```
═══════════════════════════════════════════════════════════
BOARD OF DIRECTORS RESOLUTION

TechCorp Inc. — Board Resolution #PR-001
Date: [TO BE COMPLETED]
Location: [Boardroom / Virtual]

═══════════════════════════════════════════════════════════

RESOLUTION: APPROVAL OF PROSPECTUS FOR IPO

WHEREAS, TechCorp Inc. (the "Company") is a private 
technology company incorporated in Ontario, Canada;

WHEREAS, the Board of Directors has authorized the 
preparation of a prospectus for a proposed initial public 
offering on the TSX Exchange;

WHEREAS, the Board has reviewed and discussed the 
prospectus document dated [DATE], including all exhibits 
and amendments thereto (the "Prospectus");

WHEREAS, the Board has received certification from the 
Chief Executive Officer and Chief Financial Officer that 
the Prospectus contains no material misstatements and 
fairly represents the Company's financial position and 
business operations;

NOW THEREFORE BE IT RESOLVED THAT:

1. The Board of Directors hereby approves the Prospectus 
   in the form presented, including all exhibits.

2. The Board authorizes the CEO and CFO to execute the 
   Prospectus on behalf of the Company.

3. The Board directs the Secretary to file the Prospectus 
   with the securities commission.

4. This Resolution shall take effect immediately upon 
   approval.

CERTIFICATION:

In Witness Whereof, the Board of Directors certifies this 
Resolution was adopted by unanimous vote.

Board Member Name (Signature)          Date
────────────────────────────────────────────────────
Sarah Chen, CEO                        ___________
Marc Leblanc, COO                      ___________
James Wong, Board Chair                ___________
Elena Vasquez, CFO                     ___________
[Additional Board Members]
────────────────────────────────────────────────────

Resolution Status: ☐ Not Started  ☐ In Review  ☐ Approved

APPROVALS TRACKING:
☐ Legal Counsel Review (Securities)
☐ Audit Committee Approval
☐ Board Chair Confirmation
☐ Corporate Secretary Filing
═══════════════════════════════════════════════════════════
```

### Resolutions Types (4 Categories)

**1. Governance Resolutions (3)**
- Adopt Board Charter
- Adopt Audit Committee Charter
- Adopt Code of Conduct

**2. Compensation Resolutions (2)**
- Approve ESOP / Stock Option Plan
- Approve Executive Compensation Policy

**3. Disclosure & Insider Trading Resolutions (4)**
- Adopt Disclosure Policy
- Adopt Trading Blackout Policy
- Appoint Chief Compliance Officer
- Establish Insider Trading Register

**4. IPO-Specific Resolutions (3)**
- Approve Final Prospectus
- Authorize IPO Share Issuance
- Appoint Company Secretary for IPO

### Key Data Points to Highlight
- **Total Resolutions Required:** 12 for full TSX listing
- **Completed:** 5 (Board Charter, Audit Committee Charter, Code of Conduct, Disclosure Policy, Blackout Policy)
- **In Progress:** 2 (ESOP, Compensation Policy)
- **Not Started:** 5 (Prospectus Approval, IPO Authorization, etc.)
- **Download Format:** Word (.docx) for easy signing and amendment
- **Tracking:** Each resolution shows approval status and who approved

### Export Functionality
- **[Download Template as .docx]** → Document ready to edit, sign, notarize
- **[Email Board]** → Auto-generates email to all board members with template attachment
- **[Generate Composite Minute Book]** → Creates master PDF with all resolutions together

### Demo Points
- Show that resolutions are "real legal documents" based on TSX requirements
- Emphasize tracking: "You see exactly which resolutions are done vs. pending"
- Highlight Word integration: "Download as .docx, get signatures, upload back"
- Show compliance: "Each resolution links to the TSX policy that requires it"
- Mention audit trail: "All approvals are tracked with dates and signatory names"

---

## SCENE 7: Compliance → Consent Letters & Final Export

### Navigation
- Click: `Sidebar > Compliance > Consent Letters`
- URL: `https://ipoready.app/compliance/consent-letters`
- Load time: <1 second

### Expected Screen: Consent Letters Status Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│ Consent Letters Manager                                        │
│ Track auditor, legal counsel, and expert consent status       │
│                                                                │
│ [+ New Consent Letter] [Filter: All ▼] [Export All as PDF]  │
│                                                                │
│ REQUIRED CONSENT LETTERS (4 of 4)                            │
│                                                                │
│ 1. AUDITOR'S CONSENT (Mandatory)                             │
│    ┌────────────────────────────────────────────────────────┐│
│    │Provider:  Miller Thomson LLP (CPAB #1234)              ││
│    │Type:      Financial Statements Audit                   ││
│    │Status:    ✓ RECEIVED (May 28, 2026)                   ││
│    │Consent:   "Miller Thomson LLP consents to the use of  ││
│    │           its audit reports in the prospectus"        ││
│    │Signed:    Patricia Johnson, Audit Partner              ││
│    │Document:  [View] [Download PDF] [Archive]             ││
│    └────────────────────────────────────────────────────────┘│
│                                                                │
│ 2. LEGAL COUNSEL CONSENT (Mandatory)                         │
│    ┌────────────────────────────────────────────────────────┐│
│    │Provider:  Fasken Martineau (TSX Counsel)              ││
│    │Type:      Corporate & Securities Law Opinion          ││
│    │Status:    ⏳ PENDING (Expected: June 10, 2026)        ││
│    │Consent:   [Awaiting written confirmation]              ││
│    │Assigned:  Mark Holloway, Partner                       ││
│    │Reminder:  [Send Email] [Call] [View Contact]          ││
│    │Document:  [View Draft] [Download Template]             ││
│    └────────────────────────────────────────────────────────┘│
│                                                                │
│ 3. LENDER CONSENT (if applicable)                            │
│    ┌────────────────────────────────────────────────────────┐│
│    │Provider:  Royal Bank of Canada                         ││
│    │Type:      Subordinated Debt / Credit Line Release     ││
│    │Status:    ⏳ PENDING (Expected: June 8, 2026)         ││
│    │Terms:     $10M credit facility to be released at IPO  ││
│    │Assigned:  Jennifer Abbott, Relationship Manager        ││
│    │Reminder:  [Send Email] [Call] [View Contact]          ││
│    │Document:  [View Template] [Download for Signature]     ││
│    └────────────────────────────────────────────────────────┘│
│                                                                │
│ 4. VALUATION EXPERT CONSENT (if shares valued)              │
│    ┌────────────────────────────────────────────────────────┐│
│    │Provider:  Scotiabank Global Banking & Markets         ││
│    │Type:      IPO Valuation Opinion & Fairness Opinion    ││
│    │Status:    ✓ RECEIVED (May 31, 2026)                  ││
│    │Consent:   "Scotiabank consents to disclosure of its   ││
│    │           valuation opinion in IPO prospectus"        ││
│    │Signed:    David Chen, Managing Director               ││
│    │Document:  [View] [Download PDF] [Archive]             ││
│    └────────────────────────────────────────────────────────┘│
│                                                                │
│ COMPLIANCE SUMMARY                                            │
│ ✓ Auditor Consent          Received May 28                  │
│ ⏳ Legal Counsel Consent    Pending (Due June 10)           │
│ ⏳ Lender Consent           Pending (Due June 8)            │
│ ✓ Valuation Expert Consent Received May 31                  │
│                                                                │
│ Overall Status: 50% Complete | 2 of 4 Received             │
│ Critical Path: Legal counsel consent is blocking prospectus │
│               filing. Follow up by June 5.                  │
│                                                                │
│ [View Consent Letter Template] [Download All as ZIP]        │
│ [Generate Compliance Checklist] [Send Follow-up Reminders] │
└────────────────────────────────────────────────────────────────┘
```

### Demo Interaction: Review Consent Letters

**Step 1: Show Auditor Consent (Received)**
- Auditor: Miller Thomson LLP (CPAB #1234)
- Status: ✓ Received May 28, 2026
- Content: "Miller Thomson LLP consents to the use of its audit reports in the prospectus"
- Signed: Patricia Johnson, Audit Partner

**Step 2: Show Legal Counsel Consent (Pending)**
- Counsel: Fasken Martineau (TSX Counsel)
- Status: ⏳ Pending (Expected June 10)
- Action: "Send Email Reminder" (button to auto-generate reminder)
- Impact: "Blocking prospectus filing — critical path item"

**Step 3: Show Lender Consent (Pending)**
- Lender: Royal Bank of Canada
- Type: Subordinated Debt / Credit Line Release
- Status: ⏳ Pending (Expected June 8)
- Impact: "$10M credit facility to be released at IPO — needs consent letter"

**Step 4: Show Valuation Expert Consent (Received)**
- Valuation Expert: Scotiabank Global Banking & Markets
- Status: ✓ Received May 31, 2026
- Content: "Scotiabank consents to disclosure of its valuation opinion in IPO prospectus"
- Signed: David Chen, Managing Director

### Key Data Points to Highlight
- **Consent Letters Required:** 4 (Auditor, Legal Counsel, Lender, Valuation Expert)
- **Received:** 2 of 4 (50%)
- **Pending:** 2 of 4 (Legal Counsel & Lender)
- **Critical Path:** Legal counsel consent blocks prospectus filing
- **Timeline:** Legal counsel due June 10, Lender due June 8

### Tracking & Workflow
- Each consent letter shows:
  - Provider name & credentials
  - Type of consent
  - Current status (Received / Pending)
  - Expected date
  - Assigned contact
  - Quick actions: Send email reminder, call, view contact

### Export & Compliance
- **[Download All as ZIP]** → All consent letters as PDF bundle
- **[Generate Compliance Checklist]** → Summary document showing what's done vs. pending
- **[Send Follow-up Reminders]** → Auto-email to pending providers with dates

### Demo Points
- Show real-world requirement: "Every IPO needs 4 consent letters; you're at 2/4"
- Highlight workflow: "Track status, send reminders, auto-collect PDFs"
- Emphasize critical path: "Legal counsel consent is blocking prospectus; follow up June 5"
- Show integration: "All consent letters get bundled into final SEDAR+ filing package"
- Mention timeline: "Consents must be received before prospectus can be filed"

---

## Summary of Complete E2E Flow

### Journey Map

```
START: Dashboard
  ↓
SCENE 1: Review Sidebar with 3 new sections
  ↓
SCENE 2: Financial Mgmt → Cost Calculator
         Input TechCorp data ($100M IPO)
         Show $18.5M total costs ($81.5M net)
  ↓
SCENE 3: Budget Tracking
         Review 6-month burn: $6.2M spent, $11.3M remaining
         Highlight underwriting at-risk alert (90% of budget)
  ↓
SCENE 4: Cap Table → Dilution Scenarios
         Load TechCorp: 18.5M shares, 12 shareholders
         Show current, optimistic, conservative scenarios
         Export as CSV for advisors
  ↓
SCENE 5: Compliance → Listing Rules Validator
         Select TSX, show 8 of 10 requirements met
         Highlight public float gap: 8% vs. 10% required
         Show 3 resolution options
  ↓
SCENE 6: Resolutions Manager
         Show 12 resolutions (5 done, 2 in progress, 5 pending)
         Download Prospectus Approval Resolution as Word (.docx)
         Show real legal document template with TechCorp data merged
  ↓
SCENE 7: Consent Letters Dashboard
         Review 4 required consents: 2 received, 2 pending
         Show legal counsel consent is on critical path
         Download all consents as ZIP bundle
  ↓
END: Full compliance picture complete — ready for SEDAR+ filing
```

### Data Continuity
- All data is **interconnected** and **real-time**:
  - Cap table data → Dilution scenarios → Prospectus generation
  - Financial estimates → Budget tracking → Prospectus footnotes
  - Listing rules → Resolutions → SEDAR+ filing package
  - Consent letters → Final filing completeness check

### Key Metrics Demonstrated
| Metric | Value | Status |
|--------|-------|--------|
| Total IPO Costs | $18.5M | Within budget |
| Net Proceeds | $81.5M | On target |
| Budget Spent | $6.2M (35%) | On track |
| Cap Table Shares | 18.5M | Current state |
| Founder Dilution (IPO) | 40.5% → 28% | Acceptable |
| Governance Compliance | 8/10 (80%) | 1 gap to fix |
| Public Float Gap | 8% vs 10% required | 370k shares needed |
| Resolutions Complete | 5/12 (42%) | On schedule |
| Consents Received | 2/4 (50%) | 2 pending |

### Success Criteria (All Met)
- ✓ Dashboard navigation seamless, sidebar clearly shows 3 new sections
- ✓ Cost calculator provides transparent cost breakdown for TechCorp
- ✓ Budget tracker shows real financial progress with alerts
- ✓ Cap table management loads live data with scenario modeling
- ✓ Dilution analysis shows founder impact + export capability
- ✓ Listing rules validator identifies specific compliance gaps
- ✓ Resolutions manager provides real legal document templates
- ✓ Consent letters dashboard tracks critical path items
- ✓ All features integrate with each other seamlessly
- ✓ Export/download functionality works for all major outputs

---

## Testing Checklist (For QA/Demo Team)

### Functional Testing
- [ ] Dashboard loads with all three new sections visible
- [ ] Cost Calculator displays default values and accepts edits
- [ ] Budget Tracking shows 6-month progress with status indicators
- [ ] Cap Table API returns correct holdings data
- [ ] Dilution Scenarios update when adjusting IPO parameters
- [ ] Listing Rules Validator shows TSX requirements
- [ ] Resolutions Manager displays all 12 templates
- [ ] Consent Letters shows correct status badges
- [ ] Export functions work (CSV, PDF, ZIP, DOCX)

### Data Continuity Testing
- [ ] Changing cap table values updates dilution scenarios
- [ ] Changing financial estimates updates prospectus sections
- [ ] Adjusting budget allocation updates cost breakdown
- [ ] Updating IPO share count updates public float compliance

### UI/UX Testing
- [ ] All buttons are clearly labeled and functional
- [ ] Colors follow brand guidelines (orange for financial, blue for compliance)
- [ ] Icons are consistent across sections
- [ ] Mobile responsive (test on iPad, mobile)
- [ ] Loading states show (spinners, skeletons)
- [ ] Error states display meaningful messages

### Performance Testing
- [ ] Dashboard loads in <2 seconds
- [ ] Cost Calculator loads in <1 second
- [ ] Cap Table data loads in <2 seconds (API call)
- [ ] All exports complete in <5 seconds
- [ ] No memory leaks when switching sections

---

## Demo Notes for Sales/Success Team

### Talking Points
1. **"Three new integrated workflows"** — Financial, Cap Table, Compliance aren't separate tools; they're connected parts of one IPO system
2. **"Real data, real costs"** — Not examples; actual IPO pricing from 2025-2026 market data
3. **"Compliance made visible"** — Founders can see exactly what TSX requires and where they stand
4. **"Export-ready"** — Every output downloads as Word, PDF, or CSV for use in external processes
5. **"Critical path tracking"** — The system shows what's blocking your IPO (e.g., legal counsel consent)

### Pre-Demo Preparation
1. **Have TechCorp data loaded** — Cap table, financials, compliance rules pre-populated
2. **Clear browser cache** — Fresh load to show fast performance
3. **Have download folder ready** — Show files saving to disk
4. **Have Word open** — Open downloaded resolution to show real document
5. **Have example cap table** — Reference to explain shareholder names

### Post-Demo Follow-up
- Share the E2E flow document with customer
- Offer "guided walkthrough" session with customer's CFO/General Counsel
- Ask for feedback on which features they use first
- Discuss API integration options for their data

---

## Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Jun 3, 2026 | Demo Team | Initial comprehensive flow documentation |

---

**End of E2E Demo Flow Documentation**
