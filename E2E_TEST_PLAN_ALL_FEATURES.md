# E2E Test Plan: IPOReady 8 Core Features
**Version:** 1.0  
**Date:** June 3, 2026  
**Scope:** End-to-end testing for all 8 IPOReady MVP features  
**Environment:** Development (local), Staging (pre-production)

---

## Executive Summary

This document outlines comprehensive E2E test scenarios for the 8 core IPOReady features:
1. **Cost Calculator** - IPO cost estimation and tracking
2. **Financial Dashboard** - Period-based financial KPI tracking
3. **Dilution Scenarios** - Cap table dilution modeling
4. **Consent Workflow** - Expert consent request management
5. **Resolutions** - Corporate resolution generation and voting
6. **Syndication** - Underwriter agreement customization
7. **Listing Requirements** - Exchange compliance tracking
8. **Post-Listing Module** - Post-IPO management (integrated feature)

---

## Feature 1: Cost Calculator

### Overview
Users estimate IPO costs, track budget vs. actual spending, and identify cost drivers.

### Test Scenarios

#### 1.1 Add New Cost Item
**Objective:** Verify cost items can be created with proper validation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Cost Calculator page | Page loads with "Add Cost" button visible |
| 2 | Click "Add Cost" button | Modal/form opens with cost entry fields |
| 3 | Enter cost category (Legal, Audit, Underwriting, etc.) | Field accepts valid categories |
| 4 | Enter cost amount ($250,000) | Amount field accepts numeric input, formats with commas |
| 5 | Enter cost description | Description saves as optional field |
| 6 | Set cost status (Estimated/Locked) | Status dropdown shows both options |
| 7 | Click "Save Cost" | Cost appears in cost list; total cost updates |
| 8 | Verify cost appears in table | New row shows category, amount, status, created date |
| 9 | Verify "Total Estimated" KPI updates | Cost aggregates correctly to total |

**Data Validation Tests:**
- Empty amount field shows error message
- Negative amounts rejected with error
- Cost category required; form won't submit without
- Amount format handles $, commas, decimals correctly
- Description text field accepts 0-500 characters

#### 1.2 Edit Existing Cost
**Objective:** Verify cost items can be modified and recalculation is accurate

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate cost item in cost list | Cost row displays with edit icon |
| 2 | Click edit icon on cost row | Edit modal opens pre-filled with current data |
| 3 | Change amount from $250K to $300K | Amount field updates |
| 4 | Change status from Estimated to Locked | Status field updates |
| 5 | Click "Save Changes" | Cost updates in list |
| 6 | Verify total cost recalculates | Total increases by $50K |
| 7 | Verify cost audit trail | System logs update with timestamp, old/new values |

**Edge Cases:**
- Editing cost that was deleted by another user shows error
- Simultaneous edits by two users: last write wins with conflict warning
- Changing status to "Locked" prevents further edits (read-only mode)

#### 1.3 Delete Cost Item
**Objective:** Verify costs can be safely removed with confirmation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate cost item in table | Cost row shows delete icon |
| 2 | Click delete icon | Confirmation dialog appears |
| 3 | Dialog shows cost amount & category | User can verify deletion target |
| 4 | Click "Cancel" on dialog | Cost remains in list; no changes |
| 5 | Click delete icon again | Confirmation dialog re-appears |
| 6 | Click "Confirm Delete" | Cost removed from list |
| 7 | Verify total cost updates | Total decreases by deleted cost amount |
| 8 | Check undo option (if available) | Undo temporarily restores deleted cost |

**Verification:**
- Deleted cost no longer appears in table
- Total estimated cost updated correctly
- Database record soft-deleted (audit trail maintained)

#### 1.4 Export Cost Report
**Objective:** Verify cost data can be exported in multiple formats

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Cost Calculator page | Page displays cost list |
| 2 | Click "Export" dropdown button | Options show: CSV, Excel, PDF |
| 3 | Select "Export as CSV" | Browser downloads CSV file |
| 4 | Open CSV file | File contains headers: Category, Amount, Status, Date |
| 5 | Verify all cost rows present | CSV shows all costs from table |
| 6 | Verify totals row in export | CSV includes summary row with total cost |
| 7 | Click "Export" again; select "Excel" | Browser downloads .xlsx file |
| 8 | Open Excel file | File opens with formatted headers, currency formatting |
| 9 | Select "Export as PDF" | Browser downloads PDF document |
| 10 | Open PDF | PDF shows professional report layout with title, date, cost table, totals |

**File Content Verification:**
- CSV exports with UTF-8 encoding (handles special characters)
- Excel file includes formulas for total row (SUM function)
- PDF includes company name, report date, total estimated cost
- All export formats maintain data accuracy (amounts match UI)

#### 1.5 Cost Category Validation
**Objective:** Verify cost categories align with IPO workflow and display rules

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Cost" button | Form displays cost category dropdown |
| 2 | Expand category dropdown | Shows: Legal, Audit, Underwriting, Regulatory, Marketing, Technology, Other |
| 3 | Select "Legal" category | Category field updates; form may show context-specific fields |
| 4 | Select "Audit" category | Shows alternative context (auditor name, scope optional fields) |
| 5 | Verify "Other" category | Allows custom category name entry |

---

## Feature 2: Financial Dashboard

### Overview
Displays 6-month financial tracking with budget vs. actual spending, burn rate, runway.

### Test Scenarios

#### 2.1 Period Selection
**Objective:** Verify period dropdown correctly filters and displays data

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Financial Dashboard | Dashboard loads with default 6-month view |
| 2 | Locate "Period" selector dropdown | Shows: Last 3 Months, Last 6 Months, Last 12 Months, Custom |
| 3 | Click "Last 3 Months" option | Dashboard updates; chart shows only last 3 months |
| 4 | Verify X-axis labels | Chart shows 3 month labels (e.g., Apr, May, Jun) |
| 5 | Click "Last 12 Months" option | Dashboard updates; chart expands to 12 months |
| 6 | Click "Custom" period | Date range picker appears with From/To date fields |
| 7 | Select custom date range (Jan 1 - Mar 31) | Dashboard updates to show Q1 data only |
| 8 | Verify KPIs recalculate | Burn rate, runway recalculated for custom period |

**Validation:**
- Period selection persists across page navigation (session storage)
- Invalid date ranges show error (From > To)
- Chart animates smoothly on period change
- KPI cards update with new calculations

#### 2.2 Metric Accuracy - Budget vs. Actual
**Objective:** Verify financial metrics calculate correctly

**Setup Data:**
- Month 1: Budget $100K, Actual $95K
- Month 2: Budget $100K, Actual $110K
- Month 3: Budget $100K, Actual $98K

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View Financial Dashboard | Chart displays two lines: Budgeted (blue) and Actual (orange) |
| 2 | Hover over Month 1 data point | Tooltip shows: Budget $100K, Actual $95K |
| 3 | Verify chart values accuracy | Month 1 actual bar height = 95% of budget bar |
| 4 | Check Month 2 overage | Actual ($110K) line exceeds budget line visually |
| 5 | Hover Month 2 | Tooltip shows overage: +$10K |
| 6 | Verify totals in KPI section | Actual YTD = $303K ($95+$110+$98) |

**KPI Verification:**
| Metric | Expected Value | Test Action |
|--------|----------------|------------|
| Total Budget | $300K | Sum Month 1-3 budgets |
| Total Actual YTD | $303K | Sum Month 1-3 actual |
| Monthly Burn Rate | $101K | $303K / 3 months |
| Remaining Runway | 2.96 months | If total budget $300K, remaining = 0 (overspent) |
| Variance | +3K (3% overage) | $303K - $300K |

#### 2.3 Dashboard KPI Cards
**Objective:** Verify all KPI cards display and calculate correctly

| KPI Card | Setup | Expected Display | Test Action |
|----------|-------|------------------|------------|
| **Estimated Total Cost** | Cost Calculator total = $500K | Shows "$500,000" | Verify syncs with Cost Calculator |
| **Actual Spent YTD** | Financial tracking total = $303K | Shows "$303,000" | Matches sum of monthly actuals |
| **Monthly Burn Rate** | $303K / 3 months | Shows "$101,000/month" | Calculate 303÷3 = 101K |
| **Runway Months** | ($500K - $303K) / $101K | Shows "1.97 months" | Verify rounding and formula |

**Variance Analysis:**
- If Actual > Budget: Show "Over Budget" badge in red
- If Actual < Budget: Show "Under Budget" badge in green
- Color intensity correlates with variance magnitude

#### 2.4 Risk Factors Display
**Objective:** Verify risk factors display and are relevant

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View Dashboard risk section | "Risk Factors" panel visible below KPI cards |
| 2 | Check risk factors list | Shows relevant IPO risks: |
| | | - Delays increase costs by $50k/week |
| | | - Legal complexity may add 20-30% to estimates |
| | | - Underwriting fees locked after pricing agreement |
| 3 | If burn rate > $150K/month | "High burn rate" warning appears |
| 4 | If runway < 1 month | "Critical runway" warning displays in red |
| 5 | If overage > 10% | "Significant cost overrun" flag shows |

#### 2.5 Data Export from Dashboard
**Objective:** Verify dashboard data can be exported

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Export Dashboard" button | Dropdown shows: PDF, CSV, Excel |
| 2 | Select "Export as PDF" | PDF report downloads with: |
| | | - Period selected (e.g., "Last 6 Months") |
| | | - All KPI cards with values |
| | | - Chart image embedded |
| | | - Risk factors listed |
| 3 | Verify PDF formatting | Professional layout with company logo, date |

---

## Feature 3: Dilution Scenarios

### Overview
Models shareholder dilution across warrant exercises, option vesting, new financing.

### Test Scenarios

#### 3.1 Generate Base Case Scenario
**Objective:** Verify dilution calculation for standard IPO scenario

**Setup Cap Table:**
- Founder A: 15M shares (50%)
- Investor B: 10M shares (33.3%)
- Employee Pool: 5M shares (16.7%)
- Total: 30M shares

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Dilution Scenarios | Page loads with scenario list and "Generate New Scenario" button |
| 2 | Click "Generate New Scenario" button | Modal/form opens with preset options |
| 3 | Select "Base Case" template | Form populates with: |
| | | - Warrant exercise: 50% |
| | | - Employee options vesting: 5% of total |
| | | - New financing: $50M |
| | | - Projected valuation: $500M |
| 4 | Click "Calculate" button | Scenario generates and displays results |
| 5 | Verify Founder A dilution | Ownership: 50% → 34.5% (calculated with new shares) |
| 6 | Verify Investor B dilution | Ownership: 33.3% → 23.6% |
| 7 | Verify total shares expanded | 30M → ~59M (with warrant + option + new shares) |

**Calculation Verification:**
- Warrants exercised: 2.5M (50% of 5M assumed warrants)
- Options vesting: 1.5M (5% of 30M)
- New financing shares: ~20M (calculated from $50M ÷ new valuation price)
- Total new shares: ~24M
- New total shares: 54M

#### 3.2 Apply Optimistic Scenario
**Objective:** Verify optimistic case with higher warrant exercise

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Generate New Scenario" | Modal opens |
| 2 | Select "Optimistic Case" template | Form pre-populates with: |
| | | - Warrant exercise: 75% |
| | | - Employee options vesting: 3% |
| | | - New financing: $75M |
| | | - Projected valuation: $750M |
| 3 | Click "Calculate" | Scenario generates |
| 4 | Compare vs. Base Case | Warrant dilution higher (75% vs. 50%) |
| 5 | Verify founder ownership | Lower ownership % than base case |
| 6 | Check share count | Total shares higher than base case |

#### 3.3 Apply Conservative Scenario
**Objective:** Verify conservative case with lower warrant exercise

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Generate New Scenario" | Modal opens |
| 2 | Select "Conservative Case" template | Form pre-populates with: |
| | | - Warrant exercise: 25% |
| | | - Employee options vesting: 8% |
| | | - New financing: $30M |
| | | - Projected valuation: $300M |
| 3 | Click "Calculate" | Scenario generates |
| 4 | Verify Lower warrant impact | 25% vs. 50% in base case |
| 5 | Check valuation impact | Lower $300M valuation affects share price/quantity |
| 6 | Compare founder ownership | Higher retention than base case |

#### 3.4 Custom Scenario Creation
**Objective:** Verify users can create custom dilution scenarios

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Generate New Scenario" | Form opens |
| 2 | Select "Custom" option | Form shows editable fields (not preset) |
| 3 | Enter custom warrant exercise: 60% | Field accepts 0-100% |
| 4 | Enter custom employee option vesting: 4M shares | Field accepts numeric input |
| 5 | Enter new financing amount: $60M | Field formats as currency |
| 6 | Enter projected valuation: $600M | Field accepts large numbers |
| 7 | Enter scenario name: "Mid-Market Scenario" | Name field saves custom label |
| 8 | Click "Calculate" | Scenario generates with custom parameters |
| 9 | Verify results use custom inputs | Calculations reflect entered values |

#### 3.5 Scenario Comparison
**Objective:** Verify side-by-side comparison of multiple scenarios

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | After generating 3 scenarios (Base, Optimistic, Conservative) | Scenarios appear in list with comparison button |
| 2 | Click "Compare Scenarios" button | Comparison view opens showing: |
| | | - Base Case column |
| | | - Optimistic Case column |
| | | - Conservative Case column |
| 3 | View Founder A ownership row | Shows ownership % in each scenario |
| | | - Base: 34.5% |
| | | - Optimistic: 31.2% |
| | | - Conservative: 38.7% |
| 4 | View total shares row | Shows share counts across scenarios |
| 5 | View dollar impact row | Shows value change for each shareholder |
| 6 | Click "Export Comparison" | PDF/Excel exports side-by-side table |

#### 3.6 Recalculation on Cap Table Update
**Objective:** Verify scenarios automatically recalculate when cap table changes

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Cap Table page | Update founder shares from 15M to 16M |
| 2 | Save cap table change | System confirms save |
| 3 | Navigate back to Dilution Scenarios | Existing scenarios may show "needs recalculation" badge |
| 4 | Open first scenario | Dialog shows: "Cap table has changed. Recalculate?" |
| 5 | Click "Recalculate" button | Scenario values update with new cap table baseline |
| 6 | Verify new results | Founder A ownership recalculates based on 16M shares |

---

## Feature 4: Consent Workflow

### Overview
Manages expert consents (auditor, lawyer, valuation) required by exchanges for prospectus.

### Test Scenarios

#### 4.1 Generate Consent Request
**Objective:** Verify consent letter generation for required experts

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Consent Workflow page | Page shows "Generate Consent Request" button |
| 2 | Click button | Modal opens with entity type selector |
| 3 | Select "Auditor" from dropdown | Form shows auditor-specific fields |
| 4 | Enter auditor firm name: "Big Four Audit LLP" | Text field accepts input |
| 5 | Select exchange: "TSX" | Dropdown shows TSX selected |
| 6 | Enter deadline date: "June 30, 2026" | Date picker accepts future date |
| 7 | Click "Generate Letter" | Consent letter template pre-fills: |
| | | - Company name |
| | | - Exchange name (TSX) |
| | | - Auditor-specific requirements |
| | | - Deadline date |
| 8 | Verify letter content | Letter includes: |
| | | - Professional letterhead template |
| | | - Auditor consent requirements for TSX |
| | | - Signature line |

**Letter Content Validation:**
- For TSX: Mentions Canadian GAAS, TSX exchange, IPO context
- For NASDAQ: References US auditing standards
- Template includes firm name insertion: "[Firm Name] Consent Letter"
- Deadline clearly stated in letter body

#### 4.2 Send Consent Request (Email)
**Objective:** Verify consent requests can be sent to expert contacts

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Generate consent letter (from 4.1) | Letter displayed in preview |
| 2 | Click "Send Request" button | Email compose modal opens showing: |
| | | - To: field with auditor email (auto-populated if available) |
| | | - CC: field for internal team |
| | | - Subject line pre-filled |
| | | - Body includes generated letter content |
| 3 | Verify recipient email | Auditor's email address in To field |
| 4 | Click "Send" button | Email sends; confirmation message appears |
| 5 | Verify system saves consent record | Consent marked as "Pending" with sent date |
| 6 | Check audit trail | System logs: sent to [email], [timestamp], [user] |

**Edge Cases:**
- If no email on file: Form prompts for email entry before send
- Resend option available if initial email bounced

#### 4.3 Track Consent Approval Flow
**Objective:** Verify consent status tracking and timeline

**Test Setup:** 3 consents created (Auditor, Lawyer, Valuation)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Consent Workflow | Dashboard shows consent summary: |
| | | - Total: 3 |
| | | - Pending: 3 |
| | | - Signed: 0 |
| | | - Rejected: 0 |
| 2 | View consent list | Shows all 3 with status badges |
| 3 | Simulate auditor signs consent | Admin updates status to "Signed" |
| 4 | Dashboard updates | Summary now shows: Pending: 2, Signed: 1 |
| 5 | Simulate lawyer signs | Status changes to "Signed" |
| 6 | Dashboard shows progress | Progress: 2/3 consents signed (67%) |
| 7 | Simulate valuation expert rejects | Status changes to "Rejected" |
| 8 | Dashboard shows warning | Red alert: "1 consent rejected - action required" |

**Compliance Percentage:**
- 0 signed: 0%
- 1 signed: 33%
- 2 signed: 67%
- 3 signed: 100% ✓

#### 4.4 Approval Status Updates
**Objective:** Verify consent status transitions and validations

| Current Status | Action | New Status | System Behavior |
|---|---|---|---|
| Pending | Receive signed letter | Signed | Mark timestamp, send notification |
| Pending | 30 days passes | Expiring Soon | Show orange warning badge |
| Pending | Rejection received | Rejected | Send alert, recommend alternative |
| Pending | Deadline passed | Expired | Show red error badge, flag as non-compliant |
| Signed | Update document | Signed | Allow document replacement |
| Rejected | Send replacement request | Pending | Reset to Pending status |

#### 4.5 Expiry Management
**Objective:** Verify consent expiration tracking and warnings

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create consent with expiry: July 1, 2026 | Consent saved with expiry date |
| 2 | Check dashboard | Expiry date displayed in consent row |
| 3 | Simulate advancing time to June 1 (30 days before expiry) | Consent shows "Expiring Soon" badge (orange) |
| 4 | System sends notification | Email alert: "Auditor consent expires in 30 days" |
| 5 | Advance to June 30 (1 day before expiry) | Badge intensifies; shows "1 day until expiry" |
| 6 | Advance to July 2 (past expiry) | Status changes to "Expired"; badge turns red |
| 7 | Expired consent blocks exchange compliance | "Consent Requirement Met" card shows incomplete |

#### 4.6 Exchange-Specific Consent Requirements
**Objective:** Verify different exchanges require different consents

| Exchange | Required Consents | Optional Consents | Test Action |
|----------|------------------|-------------------|------------|
| TSX | Auditor, Lawyer | Valuation, Environmental | Generate consent list for TSX; verify counts |
| NASDAQ | Auditor, Lawyer | Valuation | Generate for NASDAQ; verify 2 required |
| NYSE | Auditor, Lawyer | Valuation | Generate for NYSE; same as NASDAQ |
| TSXV | Auditor, Lawyer | (none typically) | Generate for TSXV; verify minimal requirements |
| CSE | Auditor, Lawyer | (none typically) | Generate for CSE; verify minimal requirements |

---

## Feature 5: Resolutions (Corporate Board Resolutions)

### Overview
Generates board resolutions (prospectus approval, listing authorization, etc.) and tracks voting.

### Test Scenarios

#### 5.1 Create Prospectus Approval Resolution
**Objective:** Verify resolution generation for prospectus approval

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Resolutions page | Page shows "Create Resolution" button |
| 2 | Click "Create Resolution" | Modal opens with resolution type selector |
| 3 | Select "Prospectus Approval" type | Form shows prospectus-specific fields: |
| | | - Company name |
| | | - Approval date |
| | | - Prospectus title |
| | | - Filing jurisdictions |
| | | - Review date |
| 4 | Enter company name: "TechCorp Inc." | Field saves name |
| 5 | Enter approval date: "June 1, 2026" | Date picker selects date |
| 6 | Enter prospectus title: "IPO Prospectus - TechCorp Inc." | Title field accepts input |
| 7 | Select filing jurisdictions: "Canada, USA" | Multi-select shows both |
| 8 | Click "Generate Resolution" | Resolution document generated |
| 9 | Preview shows proper formatting | Document displays: |
| | | - "BOARD RESOLUTION" header |
| | | - Date of approval |
| | | - Company details |
| | | - Resolution text approving prospectus |
| | | - Signature block with board member names |

**Resolution Content Validation:**
- Proper legal formatting (numbered paragraphs)
- "WHEREAS" clauses with context
- "NOW THEREFORE" main resolution text
- References correct company and prospectus
- Signature block lists all board members

#### 5.2 Create Listing Approval Resolution
**Objective:** Verify resolution generation for listing authorization

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Create Resolution" | Modal opens |
| 2 | Select "Listing Approval" type | Form shows listing-specific fields: |
| | | - Company name |
| | | - Target exchange (TSX/NASDAQ/NYSE/TSXV/CSE) |
| | | - Expected listing date |
| | | - Securities to be listed |
| 3 | Enter target exchange: "TSX" | Exchange field updates |
| 4 | Enter expected listing date: "July 15, 2026" | Date picker accepts date |
| 5 | Enter securities: "Common shares, Warrants" | Multi-select shows both |
| 6 | Click "Generate Resolution" | Resolution generates |
| 7 | Verify exchange-specific language | Resolution mentions: |
| | | - TSX listing rules |
| | | - TSX-specific requirements |
| | | - Listing anticipated on [date] |

#### 5.3 Create Underwriting Authorization Resolution
**Objective:** Verify resolution for underwriter authorization

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Create Resolution" | Modal opens |
| 2 | Select "Underwriting Authorization" type | Form shows underwriting fields: |
| | | - Underwriter name |
| | | - Offering size |
| | | - Offering type (fixed, best efforts, etc.) |
| | | - Underwriting commission % |
| 3 | Enter underwriter: "Goldman Sachs" | Name field accepts input |
| 4 | Enter offering size: "$100 million" | Currency field formats |
| 5 | Select offering type: "Firm commitment" | Dropdown selects type |
| 6 | Enter commission: "3.5%" | Percentage field accepts value |
| 7 | Click "Generate Resolution" | Resolution generates |
| 8 | Verify underwriting terms in resolution | Text includes: |
| | | - Underwriter name (Goldman Sachs) |
| | | - Offering size ($100M) |
| | | - Commission percentage (3.5%) |

#### 5.4 Add Board Members for Voting
**Objective:** Verify board members can be added to signature block

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create resolution (from 5.1) | Resolution displayed with signature block |
| 2 | Click "Add Board Members" button | Modal/form opens for member entry |
| 3 | Enter first member: "Alice Johnson, CEO" | Field accepts name and title |
| 4 | Click "Add Another" | New field appears for next member |
| 5 | Enter second member: "Bob Smith, CFO" | Field accepts second entry |
| 6 | Enter third member: "Carol Lee, Lead Director" | Field accepts third entry |
| 7 | Click "Save Members" | Members added to resolution |
| 8 | Verify signature block updated | Resolution now shows: |
| | | - Signature line for Alice Johnson, CEO |
| | | - Signature line for Bob Smith, CFO |
| | | - Signature line for Carol Lee, Lead Director |

#### 5.5 Vote Tracking
**Objective:** Verify voting status tracking for resolutions

**Test Setup:** Resolution created with 3 board members

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View resolution details | Voting section shows: |
| | | - Total members: 3 |
| | | - Voted: 0 |
| | | - Quorum status: Pending |
| 2 | Mark Alice Johnson voted "For" | Vote recorded; Voted count = 1 |
| 3 | Mark Bob Smith voted "For" | Vote recorded; Voted count = 2 |
| 4 | Dashboard shows voting progress | "2/3 members voted (67%)" |
| 5 | Mark Carol Lee voted "For" | Vote recorded; Voted count = 3 |
| 6 | Resolution status changes to "Approved" | All members voted; status = Approved |
| 7 | System shows final tally | "Resolution Approved: 3 For, 0 Against, 0 Abstain" |

**Edge Cases:**
- Quorum rules: If only 2 of 3 required and both vote For → Approved
- Tie scenario: If member votes Against, system shows "2 For, 1 Against" (status = Approved if 2/3 or simple majority)
- Abstain option: Member can abstain (counts as present, not voting)

#### 5.6 Export Resolution
**Objective:** Verify resolutions can be exported in legal formats

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open resolution | "Export" button visible on page |
| 2 | Click "Export" dropdown | Options: PDF, Word (.docx) |
| 3 | Select "Export as PDF" | Browser downloads PDF file |
| 4 | Open PDF | Document shows: |
| | | - Professional formatting |
| | | - All resolution text |
| | | - Signature blocks |
| | | - Company letterhead (if configured) |
| 5 | Click "Export" again; select "Word" | Browser downloads .docx file |
| 6 | Open Word document | Document opens in Microsoft Word |
| | | - Maintains formatting |
| | | - Editable (for final manual edits before signing) |
| | | - Can add signature fields |

#### 5.7 Resolution Compliance Checklist
**Objective:** Verify required resolutions are tracked

| Resolution Type | Required | Status Test |
|---|---|---|
| Prospectus Approval | Yes | Dashboard shows "1/1 Completed" when created |
| Listing Approval | Yes | Shows "0/1 Complete" initially |
| Underwriting Authorization | Yes | Completion tracked |
| Director/Officer Resolutions | Yes (if applicable) | Optional based on jurisdiction |
| Material Contracts Approval | No (optional) | Shows as "Optional" |

---

## Feature 6: Syndication (Underwriter Agreements)

### Overview
Customizable syndication templates for lead underwriter, co-underwriter, standstill agreements.

### Test Scenarios

#### 6.1 Browse Syndication Templates
**Objective:** Verify template library and filtering

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Syndication page | Page loads with "Templates" section |
| 2 | View templates list | Shows available templates: |
| | | - Lead Underwriter Agreement |
| | | - Co-Underwriter Agreement |
| | | - Standstill Agreement |
| 3 | Each template shows | - Title, type, description |
| | | - Applicable exchanges |
| | | - Last updated date |
| 4 | Click filter: "Exchange: TSX" | List filters to TSX-applicable templates |
| 5 | View filtered results | Shows only TSX-compatible templates |
| 6 | Clear filter | List restores to all templates |

#### 6.2 Customize Lead Underwriter Agreement
**Objective:** Verify agreement customization with key terms

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Lead Underwriter Agreement" template | Template opens in edit mode |
| 2 | View key terms that can be customized | Shows editable sections: |
| | | - Underwriter firm name |
| | | - Offering size ($ amount) |
| | | - Commission percentage |
| | | - Closing conditions |
| | | - Lock-up period duration |
| 3 | Enter underwriter name: "RBC Dominion Securities" | Name field populates |
| 4 | Enter offering size: "$150 million" | Currency field formats |
| 5 | Enter commission: "4.0%" | Percentage field updates |
| 6 | Set lock-up period: "180 days" | Duration field accepts value |
| 7 | Click "Review Changes" | Preview shows updated document with all customizations |
| 8 | Verify document reflects changes | Generated text shows: |
| | | - "RBC Dominion Securities agrees to underwrite..." |
| | | - "offering size of $150,000,000" |
| | | - "compensation of 4.0%" |
| | | - "lock-up period of 180 days" |

#### 6.3 Customize Co-Underwriter Agreement
**Objective:** Verify co-underwriter specific terms

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Co-Underwriter Agreement" template | Template opens in edit mode |
| 2 | View customizable terms | Shows fields: |
| | | - Co-underwriter firm name |
| | | - Allocation percentage |
| | | - Commission percentage |
| | | - Selling group arrangements |
| 3 | Enter co-underwriter: "RBC Capital Markets" | Name field updates |
| 4 | Set allocation: "30%" | Percentage of total offering |
| 5 | Set commission: "3.5%" | May differ from lead underwriter |
| 6 | Review document | Shows co-underwriter specific language |
| 7 | Verify allocation reflected | Document states: "Co-underwriter's allocation: 30%" |

#### 6.4 Customize Standstill Agreement
**Objective:** Verify standstill agreement customization

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Standstill Agreement" template | Template opens |
| 2 | View customizable terms | Shows fields: |
| | | - Restricted party name |
| | | - Standstill duration (months) |
| | | - Threshold percentage (acquisition limit) |
| | | - Exception conditions |
| 3 | Enter restricted party: "Apollo Investment Fund" | Name field accepts input |
| 4 | Set standstill period: "36 months" | Duration field accepts value |
| 5 | Set threshold: "5%" | Fund cannot acquire >5% without Board consent |
| 6 | Click "Generate Agreement" | Document generates with standstill terms |
| 7 | Verify restrictive language | Document includes: |
| | | - "Apollo Investment Fund shall not, for 36 months..." |
| | | - "acquire shares exceeding 5% of company" |

#### 6.5 Export Syndication Agreement
**Objective:** Verify agreement export functionality

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Customize agreement (from 6.2) | Customized agreement displayed |
| 2 | Click "Export" dropdown | Options: Word (.docx), PDF |
| 3 | Select "Export as Word" | Browser downloads .docx file |
| 4 | Open in Microsoft Word | Document opens with: |
| | | - Professional formatting |
| | | - All customized terms |
| | | - Editable for final adjustments |
| | | - Signature blocks for execution |
| 5 | Select "Export as PDF" | Browser downloads PDF |
| 6 | Open PDF | Document shows finalized agreement |
| | | - Non-editable format |
| | | - Professional layout |
| | | - Ready for distribution |

#### 6.6 Template Version Control
**Objective:** Verify template updates and versioning

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View template details | Shows "Last Updated: [date]" |
| 2 | View version history (if available) | Shows previous versions and changes |
| 3 | Legal team updates template | New section added to agreement |
| 4 | Existing customizations work | Old agreements not affected; new uses show update |
| 5 | Can compare versions | Highlight shows what changed from prior version |

---

## Feature 7: Listing Requirements (Exchange Compliance)

### Overview
Validates cap table against exchange rules; flags violations and compliance gaps.

### Test Scenarios

#### 7.1 Select Exchange and Generate Report
**Objective:** Verify exchange selection and compliance report generation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Listing Requirements page | Page loads with "Select Exchange" dropdown |
| 2 | Dropdown shows options | Lists: TSX, NASDAQ, NYSE, TSXV, CSE |
| 3 | Select "TSX" | Exchange selected; page updates |
| 4 | Click "Generate Listing Report" | System validates cap table against TSX rules |
| 5 | Report generates | Displays: |
| | | - Exchange: TSX |
| | | - Overall Status: [Ready/At-Risk/Not Ready] |
| | | - Compliance Score: XX% |
| | | - Violations count |
| | | - Gaps identified |
| 6 | Report shows timestamp | "Generated: June 3, 2026 2:45 PM" |

#### 7.2 Compliance Violations (Critical, Error, Warning)
**Objective:** Verify violation detection and severity levels

**Test Setup:** Cap table with public float below minimum

| Violation | Exchange | Minimum | Current | Severity | Expected Display |
|---|---|---|---|---|---|
| Public Float | TSX | $40M CAD | $30M CAD | Critical | Red badge; blocks listing |
| Public Float | NASDAQ | $110M USD | $80M USD | Error | Orange badge; must fix |
| Share Price | NYSE | $4.00 USD | $3.50 USD | Warning | Yellow badge; preferably fix |
| Audit Committee | TSX | Yes | No | Critical | Red; required |
| Financial History | TSX | 2 years | 1 year | Warning | Yellow; preferably 2+ years |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View violations section | Lists all violations found |
| 2 | Critical violation (Public Float) | Shows red "Critical" badge |
| 3 | Error violation (Share Price) | Shows orange "Error" badge |
| 4 | Warning violation (Financial History) | Shows yellow "Warning" badge |
| 5 | Click on violation | Expands to show details: |
| | | - Rule name |
| | | - Current value |
| | | - Required value |
| | | - Suggestion to remediate |

#### 7.3 Gap Analysis
**Objective:** Verify gap analysis calculation and display

| Metric | Current | Required | Gap | Status |
|---|---|---|---|---|
| Public Float | $30M | $40M | -$10M (25% short) | Critical |
| Share Price | $3.50 | $4.00 | -$0.50 | Warning |
| Authorized Shares | 50M | 30M | +20M (surplus) | Compliant |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View "Gap Analysis" section | Shows table of metrics |
| 2 | Public Float gap row | Shows: Current $30M, Required $40M, Gap -$10M |
| 3 | Gap status indicates | "Critical" (red) - blocks listing |
| 4 | Share Price gap row | Shows: Current $3.50, Required $4.00, Gap -$0.50 |
| 5 | Status indicates | "Warning" (yellow) - should remediate |
| 6 | Each gap shows suggestion | "Increase public float to $40M minimum" |

#### 7.4 Exchange-Specific Rules
**Objective:** Verify different exchanges have different requirements

| Rule | TSX | NASDAQ | NYSE | TSXV | CSE |
|---|---|---|---|---|---|
| Min Public Float CAD | $40M | N/A | N/A | $5M | $3M |
| Min Public Float USD | N/A | $110M | $100M | N/A | N/A |
| Min Share Price CAD | $3.00 | N/A | N/A | $0.50 | $0.50 |
| Min Share Price USD | N/A | $4.00 | $1.00 | N/A | N/A |
| Audit Committee | Required | Required | Required | Optional | Optional |
| Audit Period | 2 years | 2 years | 2 years | 2 years | 2 years |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "TSX" exchange | Report validates against TSX rules |
| 2 | Switch to "NASDAQ" | Report re-validates against NASDAQ rules (stricter) |
| 3 | Compare results | NASDAQ may show more violations than TSX |
| 4 | Switch to "TSXV" | Report shows relaxed requirements |
| 5 | Compare TSXV results | Fewer critical violations; easier path to listing |

#### 7.5 Compliance Tracking Dashboard
**Objective:** Verify overall compliance status display

| Element | Expected Display | Test Action |
|---|---|---|
| **Compliance Score** | 0-100%; color coded | Should show >80% for ready status |
| **Overall Status** | Ready / At-Risk / Not Ready | Based on critical violations |
| **Critical Violations** | Count of blocking issues | 0 = ready, >0 = not ready |
| **Resolutions Status** | Completed / Pending | Shows required resolutions checklist |
| **Consents Status** | Completed / Pending | Shows required consents checklist |

#### 7.6 Listing Readiness Summary
**Objective:** Verify summary view shows readiness status

| Component | Status | Display |
|---|---|---|
| Cap Table Compliance | ✓ Ready | Green "Ready" badge |
| Audit Financials | ✓ Complete | Green checkmark |
| Board Resolutions | Pending 1/3 | Orange "In Progress" |
| Expert Consents | Pending 2/3 | Orange "In Progress" |
| **Overall Status** | At-Risk | Orange badge; needs actions |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|---|
| 1 | View "Listing Readiness" card | Shows composite status |
| 2 | See breakdown of each component | Cap Table, Audits, Resolutions, Consents |
| 3 | Identify blocking issues | "1 resolution, 2 consents needed" |
| 4 | Link to resolution action | Click → navigates to Resolutions feature |
| 5 | Link to consent action | Click → navigates to Consent Workflow |

#### 7.7 Generate Exchange Checklist
**Objective:** Verify printable/exportable compliance checklist

| Step | Action | Expected Result |
|------|--------|---|
| 1 | View listing report for TSX | Report displayed |
| 2 | Click "Generate Checklist" button | PDF checklist downloads |
| 3 | Open checklist | Shows: |
| | | - Exchange: TSX |
| | | - Checklist of all requirements |
| | | - Current status (✓ or ✗) for each item |
| | | - Suggestions for non-compliant items |
| 4 | Checklist includes sections | - Cap table requirements |
| | | - Financial/audit requirements |
| | | - Corporate governance |
| | | - Consent requirements |
| 5 | Can print or email checklist | PDF format ready for distribution |

---

## Feature 8: Post-Listing Module (Integrated Feature)

### Overview
Post-IPO management including ongoing compliance, lock-up period tracking, shareholder updates.

### Test Scenarios

#### 8.1 Lock-Up Period Configuration
**Objective:** Verify lock-up period setup and tracking

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Post-Listing page (if available in menu) | Page loads with post-IPO section |
| 2 | View lock-up period settings | Shows configuration form |
| 3 | Set lock-up duration: "180 days" | Field accepts numeric input |
| 4 | Set lock-up start date: IPO closing date | Auto-populated or selectable |
| 5 | Set lock-up expiry: "Day 180" | System calculates end date |
| 6 | View countdown timer | Shows "Days until lock-up expires: XX" |
| 7 | As days pass, timer updates | Timer decrements each day |

#### 8.2 Shareholder Lock-Up Tracking
**Objective:** Verify individual shareholder lock-up status

| Step | Action | Expected Result |
|------|--------|---|
| 1 | View lock-up schedule | Shows all shareholders subject to lock-up |
| 2 | Shareholder list shows | - Name, # of locked shares |
| | | - Lock-up expiry date |
| | | - Days remaining |
| 3 | Identify early lock-up releases (if applicable) | Some shareholders may have earlier release dates |
| 4 | View release dates clearly | Each shareholder's release highlighted |
| 5 | Track milestone dates | 50% expiry date, 100% expiry date highlighted |

#### 8.3 Ongoing Disclosure Tracking
**Objective:** Verify post-listing disclosure requirements

| Step | Action | Expected Result |
|------|--------|---|
| 1 | View "Ongoing Disclosure" section | Shows post-IPO requirements |
| 2 | Required disclosures listed | Quarterly financials, material change reports, etc. |
| 3 | Deadline tracking | Each requirement shows due date |
| 4 | Compliance status | Shows "Completed" or "Due Soon" or "Overdue" |
| 5 | Historical filings tracked | Shows past disclosures with filing dates |

#### 8.4 Post-Listing Compliance Dashboard
**Objective:** Verify compliance status after listing

| Component | Status | Expected Display |
|---|---|---|
| Lock-Up Period Active | Yes | "Expires: September 1, 2026" |
| Shares Subject to Lock-Up | 45% | Progress bar showing locked portion |
| Ongoing Financials | On Track | Green checkmark |
| Material Disclosures | Current | Green checkmark |
| Stock Exchange Reports | Filed | Confirmation of latest filings |

---

## Cross-Feature Integration Tests

### Test Scenarios

#### 9.1 Cost Calculator → Financial Dashboard Integration
**Objective:** Verify Cost Calculator totals sync to Financial Dashboard

| Step | Action | Expected Result |
|------|--------|---|
| 1 | Add cost in Cost Calculator: $100K legal fees | Cost saved |
| 2 | Navigate to Financial Dashboard | Dashboard loads |
| 3 | View "Estimated Total Cost" KPI | Shows $100K (synced from Cost Calculator) |
| 4 | Add another cost: $50K audit | Cost saved |
| 5 | Return to Financial Dashboard | "Estimated Total Cost" updates to $150K |
| 6 | Edit cost in Cost Calculator: $100K → $120K | Cost updated |
| 7 | Financial Dashboard refreshes | Total updates to $170K (120 + 50) |

#### 9.2 Cap Table Updates → Dilution Scenarios Recalculation
**Objective:** Verify dilution scenarios recalculate when cap table changes

| Step | Action | Expected Result |
|------|--------|---|
| 1 | Create dilution scenario based on current cap table | Scenario saved |
| 2 | Navigate to Cap Table; increase founder shares | Cap table updated |
| 3 | Return to Dilution Scenarios | Scenario shows "Needs Recalculation" badge |
| 4 | Click "Recalculate" | Scenario values update |
| 5 | Founder ownership % recalculates | Values reflect updated cap table |

#### 9.3 Exchange Selection → Consent Requirements
**Objective:** Verify listing exchange determines consent requirements

| Step | Action | Expected Result |
|------|--------|---|
| 1 | Select "TSX" exchange in Listing Requirements | Compliance rules load |
| 2 | Navigate to Consent Workflow | Generate consent requests |
| 3 | View consents auto-generated for TSX | Shows: Auditor (required), Lawyer (required) |
| 4 | Change exchange to "NASDAQ" | Listing Requirements update |
| 5 | Consent requirements show NASDAQ needs | Same consents but NASDAQ-specific letters |

#### 9.4 Resolution Completion → Listing Readiness
**Objective:** Verify completing resolutions improves listing readiness score

| Step | Action | Expected Result |
|------|--------|---|
| 1 | View Listing Requirements report | Compliance score: 65% (missing resolutions) |
| 2 | Create required board resolutions | Mark as completed |
| 3 | Return to Listing Requirements | Report updates; compliance score: 85% |
| 4 | Status improves from "At-Risk" | Now shows "Ready" or close to ready |

#### 9.5 Consent Completion → Exchange Compliance
**Objective:** Verify signed consents satisfy exchange requirements

| Step | Action | Expected Result |
|------|--------|---|
| 1 | Generate consents for TSX | 2 required (auditor, lawyer) |
| 2 | Both consents still pending | Exchange status shows: "Not Compliant" |
| 3 | Mark auditor consent as "Signed" | 1/2 consents signed |
| 4 | Listing Requirements report | Shows: "Auditor consent received" ✓ |
| 5 | Mark lawyer consent as "Signed" | 2/2 consents signed |
| 6 | Listing Requirements report | Shows: "All required consents received" ✓✓ |
| 7 | Exchange compliance improves | Status may now show "Ready" or higher score |

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Test environment deployed and accessible
- [ ] Test user account created with full permissions
- [ ] Sample cap table data loaded (30M shares with 3 shareholders)
- [ ] Exchange configurations verified (TSX, NASDAQ, NYSE, TSXV, CSE)
- [ ] Database seeded with sample costs, tracking data
- [ ] Email testing configured (mock service or test inbox)
- [ ] Date/time mocking available for expiry tests
- [ ] File export path verified (browser download directory)

### Test Execution
- [ ] All scenarios in Feature 1 (Cost Calculator) executed and passed
- [ ] All scenarios in Feature 2 (Financial Dashboard) executed and passed
- [ ] All scenarios in Feature 3 (Dilution Scenarios) executed and passed
- [ ] All scenarios in Feature 4 (Consent Workflow) executed and passed
- [ ] All scenarios in Feature 5 (Resolutions) executed and passed
- [ ] All scenarios in Feature 6 (Syndication) executed and passed
- [ ] All scenarios in Feature 7 (Listing Requirements) executed and passed
- [ ] All scenarios in Feature 8 (Post-Listing) executed and passed
- [ ] All cross-feature integration tests (Section 9) executed and passed

### Post-Test
- [ ] No critical bugs blocking launch (P0/P1)
- [ ] All data validation working correctly
- [ ] PDF/Excel exports producing valid files
- [ ] Email notifications sending (if configured)
- [ ] Database transactions committing properly
- [ ] Audit trail logging all changes
- [ ] Performance acceptable (page loads <3 seconds)
- [ ] Mobile responsiveness verified (if applicable)
- [ ] Accessibility checklist passed (WCAG 2.1 AA)
- [ ] Security review completed (no auth bypasses, XSS, SQL injection)

### Sign-Off
- [ ] QA Lead: _________________ Date: _______
- [ ] Product Manager: _________ Date: _______
- [ ] Engineering Lead: ________ Date: _______
- [ ] Ready for Production Deployment: [ ] Yes [ ] No

---

## Known Issues & Workarounds

| Issue | Workaround | Priority |
|---|---|---|
| Cost exports delayed on large datasets (>500 items) | Use period filters to reduce export size | P3 |
| Dilution scenario recalc doesn't auto-trigger on cap table update | Manually click "Recalculate" for now | P2 |
| Consent letters may not preserve formatting on all PDF viewers | Use Chrome/Firefox for best compatibility | P4 |
| Syndication template search limited to title (not content) | Coming in v2 | P4 |

---

## Notes for Test Execution

1. **Time Estimates:** Expect 4-5 hours to execute all E2E scenarios
2. **Parallel Testing:** Features 1-7 can be tested in parallel by multiple testers
3. **Data Dependencies:** Feature 8 (Post-Listing) requires IPO closing date; can mock if needed
4. **Browser Compatibility:** Test on Chrome, Firefox, Safari (all recent versions)
5. **Accessibility:** Use axe DevTools or similar to verify WCAG compliance
6. **Performance:** Use Chrome DevTools Lighthouse for perf baselines

---

**Document Version:** 1.0  
**Last Updated:** June 3, 2026  
**Next Review Date:** After Phase 2 MVP Launch
