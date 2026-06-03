# IPOReady E2E Test Execution Checklist
**Quick Reference for QA Teams**

---

## Feature 1: Cost Calculator

### Add/Edit/Delete Costs
- [ ] Add cost with all required fields
- [ ] Empty amount field shows error
- [ ] Negative amounts rejected
- [ ] Edit existing cost; total recalculates
- [ ] Delete cost with confirmation dialog
- [ ] Undo functionality works (if available)
- [ ] Audit trail logs all changes

### Export Functionality
- [ ] Export as CSV: valid format, all rows included
- [ ] Export as Excel: formulas work, currency formatting applied
- [ ] Export as PDF: professional layout, company info included
- [ ] All exports match UI data exactly

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 2: Financial Dashboard

### Period Selection
- [ ] Default 6-month view loads
- [ ] Period dropdown shows all options (3M, 6M, 12M, Custom)
- [ ] Selecting 3M shows only 3 months of data
- [ ] Custom date range picker works
- [ ] Invalid date ranges show error
- [ ] KPI cards recalculate for selected period

### Metric Accuracy
- [ ] Budgeted vs. Actual chart displays correctly
- [ ] Hover tooltips show accurate values
- [ ] Estimated Total Cost syncs from Cost Calculator
- [ ] Monthly Burn Rate calculated correctly
- [ ] Runway Months calculation accurate
- [ ] Variance badges show correct color (red/green)

### Risk Factors
- [ ] Risk factors section visible
- [ ] Relevant warnings display (delays, legal, underwriting)
- [ ] High burn rate warning appears if threshold exceeded
- [ ] Critical runway warning shows in red

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 3: Dilution Scenarios

### Scenario Generation
- [ ] Base Case scenario generates with correct assumptions
- [ ] Optimistic Case shows higher warrant exercise (75%)
- [ ] Conservative Case shows lower warrant exercise (25%)
- [ ] Calculations mathematically correct
  - [ ] Base Case founder dilution accurate
  - [ ] Optimistic Case ownership lower than Base
  - [ ] Conservative Case ownership higher than Base
- [ ] Custom scenario accepts user inputs
- [ ] Scenario names save correctly

### Scenario Comparison
- [ ] Comparison view shows all 3 scenarios
- [ ] Shareholder ownership shown across scenarios
- [ ] Dollar impact calculations visible
- [ ] Export comparison as PDF/Excel works

### Recalculation on Cap Table Update
- [ ] Existing scenarios show "needs recalculation" badge when cap table changes
- [ ] Recalculate button updates all values
- [ ] Values reflect new cap table baseline

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 4: Consent Workflow

### Request Generation
- [ ] Generate consent request button works
- [ ] Entity type dropdown shows all options (Auditor, Lawyer, Valuation, Environmental, Other)
- [ ] Auditor consent letter generated with correct template
- [ ] Lawyer consent letter shows legal counsel wording
- [ ] Valuation expert consent letter properly formatted
- [ ] Letter includes company name, exchange, deadline
- [ ] Exchange-specific language correct (e.g., TSX mentions Canadian GAAS)

### Send Requests
- [ ] Email compose modal opens
- [ ] Recipient email pre-populated or requires entry
- [ ] Subject line includes company name and consent type
- [ ] Email body contains full consent letter
- [ ] Send button triggers email transmission
- [ ] System records consent as "Pending" with sent timestamp

### Approval Flow
- [ ] Dashboard shows consent summary (Total, Signed, Pending, Rejected, Expired)
- [ ] Status badge colors correct (green=signed, orange=pending, red=rejected/expired)
- [ ] Compliance percentage updates as consents are signed
- [ ] Expiring Soon warning appears 30 days before deadline
- [ ] Expired status shows after deadline passes

### Exchange Requirements
- [ ] TSX requirements: Auditor + Lawyer (required)
- [ ] NASDAQ requirements: Auditor + Lawyer (required)
- [ ] NYSE requirements: Auditor + Lawyer (required)
- [ ] TSXV requirements: Auditor + Lawyer (required)
- [ ] CSE requirements: Auditor + Lawyer (required)

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 5: Resolutions (Board Resolutions)

### Resolution Creation
- [ ] Create Resolution button opens modal
- [ ] Resolution type selector shows all types (Prospectus, Listing, Underwriting, Material Contracts)
- [ ] Prospectus Approval resolution generated with proper legal formatting
- [ ] Listing Approval resolution includes exchange-specific language
- [ ] Underwriting Authorization resolution includes commission/terms
- [ ] All resolutions include proper "WHEREAS" and "NOW THEREFORE" clauses

### Board Member Management
- [ ] Add Board Members form accepts multiple names
- [ ] Each member includes name and title (CEO, CFO, Director, etc.)
- [ ] Signature block updates with added members
- [ ] Signature lines properly formatted

### Vote Tracking
- [ ] Voting section shows member count
- [ ] Can mark members as voted (For/Against/Abstain)
- [ ] Vote count updates as members vote
- [ ] Final status changes to "Approved" when quorum votes
- [ ] Can view final tally (e.g., "3 For, 0 Against, 0 Abstain")

### Export
- [ ] Export as PDF: professional formatting, all resolution text
- [ ] Export as Word: editable document, maintains formatting
- [ ] Signature blocks included in exports
- [ ] Company letterhead appears (if configured)

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 6: Syndication (Underwriter Agreements)

### Template Browsing
- [ ] Templates page loads with library
- [ ] Shows Lead Underwriter, Co-Underwriter, Standstill templates
- [ ] Each template shows title, type, description, exchanges, last updated
- [ ] Exchange filter works (e.g., TSX-only templates)
- [ ] Search/filter clears properly

### Customization - Lead Underwriter
- [ ] Template opens in edit mode
- [ ] Can enter underwriter firm name
- [ ] Can enter offering size (formatted as currency)
- [ ] Can enter commission percentage
- [ ] Can set lock-up period (days)
- [ ] Preview shows all customizations in generated text
- [ ] Underwriter name appears in agreement body
- [ ] Commission percentage reflected in document

### Customization - Co-Underwriter
- [ ] Template opens with co-underwriter fields
- [ ] Allocation percentage field accepts 0-100%
- [ ] Commission may differ from lead underwriter
- [ ] Document reflects allocation percentage in text

### Customization - Standstill
- [ ] Restricted party name field accepts input
- [ ] Standstill duration field accepts months
- [ ] Threshold percentage field sets acquisition limit
- [ ] Exception conditions can be noted
- [ ] Generated agreement includes all terms

### Export
- [ ] Export as Word: editable, maintains formatting
- [ ] Export as PDF: non-editable, professional layout
- [ ] Signature blocks included
- [ ] All customized terms visible in exports

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 7: Listing Requirements (Exchange Compliance)

### Exchange Selection & Report
- [ ] Exchange dropdown shows: TSX, NASDAQ, NYSE, TSXV, CSE
- [ ] Selecting exchange triggers compliance report generation
- [ ] Report shows: Exchange name, Overall Status, Compliance Score, Violations, Gaps

### Violation Detection
- [ ] Critical violations show red badge (blocking)
- [ ] Error violations show orange badge
- [ ] Warning violations show yellow badge
- [ ] Click violation expands to show details
- [ ] Violation message includes suggestion to remediate

### Gap Analysis
- [ ] Gap Analysis section shows metric table
- [ ] Public Float gap displays correctly (current vs. required)
- [ ] Share Price gap displays with % variance
- [ ] Each gap row shows status color (critical/warning/ok)
- [ ] Suggestion provided for each gap

### Exchange-Specific Rules
- [ ] TSX: Min Public Float $40M CAD, Min Price $3.00 CAD
- [ ] NASDAQ: Min Public Float $110M USD, Min Price $4.00 USD
- [ ] NYSE: Min Public Float $100M USD, Min Price $1.00 USD
- [ ] TSXV: Min Public Float $5M CAD
- [ ] CSE: Min Public Float $3M CAD
- [ ] Switching exchanges changes rule set

### Compliance Dashboard
- [ ] Compliance Score (0-100%) displays
- [ ] Overall Status shows: Ready / At-Risk / Not Ready
- [ ] Resolutions Status shows: Completed X/Y
- [ ] Consents Status shows: Completed X/Y
- [ ] Links to Resolution and Consent pages work

### Generate Checklist
- [ ] "Generate Checklist" button creates PDF
- [ ] Checklist shows all requirements for selected exchange
- [ ] Each requirement has status (✓ or ✗)
- [ ] Suggestions included for non-compliant items
- [ ] PDF printable and shareable

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Feature 8: Post-Listing Module

### Lock-Up Period
- [ ] Lock-up duration field accepts days
- [ ] Lock-up start date set to IPO closing (or manual)
- [ ] Expiry date auto-calculated
- [ ] Countdown timer displays days until expiration
- [ ] Timer updates correctly as days pass

### Shareholder Lock-Up Tracking
- [ ] Lock-up schedule shows all affected shareholders
- [ ] Shows shareholder name, locked shares, expiry date
- [ ] Days remaining until release calculated correctly
- [ ] Early release dates highlighted (if applicable)

### Ongoing Disclosure
- [ ] Post-listing requirements listed (quarterly financials, material change reports, etc.)
- [ ] Due dates displayed for each requirement
- [ ] Status shows: Completed / Due Soon / Overdue
- [ ] Historical filings tracked with filing dates

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Cross-Feature Integration Tests

### Cost Calculator ↔ Financial Dashboard
- [ ] Cost added in Cost Calculator appears in Financial Dashboard
- [ ] Total cost KPI syncs correctly
- [ ] Edit cost updates dashboard total
- [ ] Delete cost updates dashboard total

### Cap Table ↔ Dilution Scenarios
- [ ] Cap table change triggers "needs recalculation" on scenarios
- [ ] Recalculate updates dilution calculations
- [ ] Shareholder ownership % reflects new cap table

### Exchange Selection ↔ Consent Requirements
- [ ] TSX selected → generates TSX-specific consents
- [ ] NASDAQ selected → generates NASDAQ-specific consents
- [ ] Exchange change updates consent letters

### Resolution Completion ↔ Listing Readiness
- [ ] Completing resolutions improves compliance score
- [ ] Overall Status improves as resolutions marked complete
- [ ] Dashboard shows progress (2/3 resolutions complete, etc.)

### Consent Completion ↔ Exchange Compliance
- [ ] Signing consents updates compliance status
- [ ] Consent checkmarks appear in exchange report
- [ ] All consents signed → Exchange shows "Compliant"

**Status:** [ ] PASS [ ] FAIL [ ] BLOCKED  
**Tester:** _______________ Date: _______  
**Notes:** _________________________________________________

---

## Performance & Quality Checks

### Page Load Times
- [ ] Cost Calculator loads < 2 seconds: [ ] PASS [ ] FAIL
- [ ] Financial Dashboard loads < 2 seconds: [ ] PASS [ ] FAIL
- [ ] Dilution Scenarios loads < 3 seconds: [ ] PASS [ ] FAIL
- [ ] Consent Workflow loads < 2 seconds: [ ] PASS [ ] FAIL
- [ ] Resolutions loads < 2 seconds: [ ] PASS [ ] FAIL
- [ ] Syndication loads < 2 seconds: [ ] PASS [ ] FAIL
- [ ] Listing Requirements loads < 3 seconds: [ ] PASS [ ] FAIL

### Export Performance
- [ ] CSV export < 5 seconds: [ ] PASS [ ] FAIL
- [ ] Excel export < 5 seconds: [ ] PASS [ ] FAIL
- [ ] PDF export < 10 seconds: [ ] PASS [ ] FAIL

### Mobile Responsiveness
- [ ] Cost Calculator responsive on mobile: [ ] PASS [ ] FAIL
- [ ] Financial Dashboard responsive on mobile: [ ] PASS [ ] FAIL
- [ ] Dilution Scenarios responsive on mobile: [ ] PASS [ ] FAIL
- [ ] Consent Workflow responsive on mobile: [ ] PASS [ ] FAIL
- [ ] Resolutions responsive on mobile: [ ] PASS [ ] FAIL
- [ ] Syndication responsive on mobile: [ ] PASS [ ] FAIL
- [ ] Listing Requirements responsive on mobile: [ ] PASS [ ] FAIL

### Data Validation
- [ ] Required fields validated: [ ] PASS [ ] FAIL
- [ ] Email format validated: [ ] PASS [ ] FAIL
- [ ] Numeric fields accept only valid input: [ ] PASS [ ] FAIL
- [ ] Date fields accept valid dates only: [ ] PASS [ ] FAIL
- [ ] Currency fields format correctly: [ ] PASS [ ] FAIL

### Security
- [ ] No XSS vulnerabilities found: [ ] PASS [ ] FAIL
- [ ] SQL injection attempts blocked: [ ] PASS [ ] FAIL
- [ ] Authentication required for all features: [ ] PASS [ ] FAIL
- [ ] Authorization enforced (users can't access other companies' data): [ ] PASS [ ] FAIL

### Accessibility (WCAG 2.1 AA)
- [ ] All form inputs have labels: [ ] PASS [ ] FAIL
- [ ] Color not sole indicator (red violations also flagged with text): [ ] PASS [ ] FAIL
- [ ] Keyboard navigation works: [ ] PASS [ ] FAIL
- [ ] Screen reader compatible: [ ] PASS [ ] FAIL

---

## Critical Bugs Found

| Bug | Feature | Severity | Steps to Reproduce | Status |
|---|---|---|---|---|
| | | [ ] P0 [ ] P1 [ ] P2 [ ] P3 | | [ ] Open [ ] Fixed [ ] Closed |
| | | [ ] P0 [ ] P1 [ ] P2 [ ] P3 | | [ ] Open [ ] Fixed [ ] Closed |
| | | [ ] P0 [ ] P1 [ ] P2 [ ] P3 | | [ ] Open [ ] Fixed [ ] Closed |

---

## Test Summary

**Total Test Cases:** 150+  
**Estimated Execution Time:** 5-6 hours

| Feature | Cases | Passed | Failed | Blocked | Pass Rate |
|---|---|---|---|---|---|
| 1. Cost Calculator | 20 | ___ | ___ | ___ | __% |
| 2. Financial Dashboard | 18 | ___ | ___ | ___ | __% |
| 3. Dilution Scenarios | 16 | ___ | ___ | ___ | __% |
| 4. Consent Workflow | 22 | ___ | ___ | ___ | __% |
| 5. Resolutions | 18 | ___ | ___ | ___ | __% |
| 6. Syndication | 16 | ___ | ___ | ___ | __% |
| 7. Listing Requirements | 20 | ___ | ___ | ___ | __% |
| 8. Post-Listing | 10 | ___ | ___ | ___ | __% |
| Cross-Feature | 10 | ___ | ___ | ___ | __% |
| **TOTAL** | **150** | **___** | **___** | **___** | **__% ** |

---

## Sign-Off

**Test Execution Started:** ____________  
**Test Execution Completed:** ____________

**Overall Status:**
- [ ] PASS - Ready for production
- [ ] PASS WITH EXCEPTIONS - Ready with known limitations
- [ ] FAIL - Not ready; blocking issues found

**QA Lead:** ________________________  
**Signature:** ________________________ Date: ________

**Product Manager:** ____________________  
**Signature:** ________________________ Date: ________

**Engineering Lead:** __________________  
**Signature:** ________________________ Date: ________

---

**Version:** 1.0  
**Last Updated:** June 3, 2026
