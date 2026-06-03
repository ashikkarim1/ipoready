# IPOReady Phase 2 Demo — Verification Checklist

**Purpose:** QA/Demo Team verification that all E2E scenes are functional and data-complete  
**Date:** June 3, 2026  
**Status:** Pre-Launch Verification

---

## Pre-Demo Environment Setup

### Browser & Session
- [ ] Fresh browser session (cleared cache)
- [ ] Logged in with TechCorp demo account
- [ ] Company context is "TechCorp Inc." (verify in header)
- [ ] User role is "Admin" (can access all sections)
- [ ] Session timeout set to 2 hours minimum

### Test Data Loaded
- [ ] Cost calculator estimates cached at API endpoint
- [ ] Cap table document exists in database (18.5M shares)
- [ ] TSX listing rules configured in validator
- [ ] Resolutions templates available (12 total)
- [ ] Consent letter templates available (4 types)
- [ ] Budget data populated for 6-month period

### Performance Baseline
- [ ] Dashboard loads: < 2 seconds
- [ ] Cost Calculator loads: < 1 second
- [ ] Budget Tracking loads: < 1 second
- [ ] Cap Table loads: < 2 seconds (API call)
- [ ] Listing Rules loads: < 1 second
- [ ] Resolutions loads: < 1 second
- [ ] Consent Letters loads: < 1 second

---

## Scene 1: Dashboard & Sidebar Navigation

### Visual Verification
- [ ] Dashboard header shows "IPOReady Dashboard — TechCorp Inc."
- [ ] Breadcrumb shows: Dashboard > Overview
- [ ] Left sidebar visible with all menu items
- [ ] Three new Phase 2 sections visible:
  - [ ] Financial Management (with sub-items: Cost Calculator, Budget Tracking)
  - [ ] Cap Table (with sub-items: Dilution Scenarios)
  - [ ] Compliance (with sub-items: Listing Rules, Resolutions, Consent Letters)

### Icon & Color Verification
- [ ] Financial Management icons use accent orange
- [ ] Compliance icons use security blue
- [ ] All icons match design system
- [ ] "NEW" badges visible on Phase 2 items (if applicable)

### Navigation Functionality
- [ ] Clicking "Financial Management" expands/shows submenu
- [ ] Clicking "Cost Calculator" navigates to correct URL
- [ ] Clicking "Budget Tracking" navigates to correct URL
- [ ] Clicking "Cap Table" navigates to correct URL
- [ ] Clicking "Listing Rules" navigates to correct URL
- [ ] Clicking "Resolutions" navigates to correct URL
- [ ] Clicking "Consent Letters" navigates to correct URL

### State Management
- [ ] Current page highlighted in sidebar
- [ ] Breadcrumb updates when navigating
- [ ] No console errors on navigation
- [ ] Back button works correctly

---

## Scene 2: Cost Calculator

### Page Load
- [ ] URL: `/financial/cost-calculator` loads correctly
- [ ] Page title: "IPO Cost Calculator" displays
- [ ] Subtitle: "Estimate your total IPO costs and net proceeds" displays
- [ ] Load time: < 1 second

### Default Values
- [ ] Estimated Proceeds field shows: $100,000,000 (or similar)
- [ ] Exchange Fees field shows: $2,500,000
- [ ] Legal Fees field shows: $5,000,000
- [ ] Accounting Fees field shows: $2,500,000
- [ ] Underwriting Fees field shows: $5,000,000
- [ ] Marketing Fees field shows: $1,500,000
- [ ] Other Fees field shows: $1,000,000

### Form Interaction
- [ ] Exchange Fees field is editable
- [ ] Legal Fees field is editable
- [ ] All numeric fields accept numbers only
- [ ] Fields reject invalid input (letters, special chars)
- [ ] Tab key moves between fields
- [ ] Values persist when switching fields

### TechCorp Data Entry
- [ ] User can change Exchange Fees to: $2,500,000 ✓
- [ ] User can change Legal Fees to: $5,200,000 ✓
- [ ] User can change Accounting Fees to: $2,800,000 ✓
- [ ] User can change Underwriting Fees to: $5,000,000 ✓
- [ ] User can change Marketing Fees to: $1,800,000 ✓
- [ ] User can change Other Fees to: $1,200,000 ✓

### Summary Panel (Right Side)
- [ ] "Gross Proceeds" displays: $100.0M
- [ ] "Total Costs" displays: $18.5M (or adjusted value)
- [ ] "Net Proceeds" displays: $81.5M (or adjusted value)
- [ ] "Cost percentage" displays: 18.5%
- [ ] Summary updates in real-time as values change
- [ ] Net Proceeds shows in green (success color)
- [ ] Total Costs shows in red (error color)

### Buttons & Controls
- [ ] [Export] button is clickable
- [ ] [Export] button shows confirmation: "Exported as PDF"
- [ ] [Share] button is clickable
- [ ] [Share] button shows: "Link copied to clipboard"
- [ ] Both buttons don't navigate away from page

### Responsive Design
- [ ] On desktop: 3-column layout (inputs left, summary right)
- [ ] On tablet: 2-column layout (inputs top, summary bottom)
- [ ] On mobile: 1-column layout (inputs, then summary)
- [ ] All elements readable at all breakpoints

---

## Scene 3: Budget Tracking

### Page Load
- [ ] URL: `/financial/budget-tracking` loads correctly
- [ ] Page title: "Budget Tracking" displays
- [ ] Subtitle: "Monitor IPO-related expenses and track budget allocation" displays

### Summary Cards (Top)
- [ ] Card 1 displays: "TOTAL BUDGETED" = $17.5M
- [ ] Card 2 displays: "TOTAL SPENT" = $6.2M
- [ ] Card 3 displays: "REMAINING" = $11.3M
- [ ] Card 4 displays: "SPENT %" = 35.4%
- [ ] All values align with expected data

### Budget Items Table
- [ ] Table header shows: CATEGORY, BUDGETED, SPENT, REMAINING, STATUS
- [ ] Row 1: Legal & Compliance: $5.0M budgeted, $3.2M spent, $1.8M remaining
- [ ] Row 2: Accounting & Audit: $2.5M budgeted, $1.8M spent, $0.7M remaining
- [ ] Row 3: Underwriting: $5.0M budgeted, $4.5M spent, $0.5M remaining
- [ ] Row 4: Marketing & IR: $1.5M budgeted, $0.9M spent, $0.6M remaining
- [ ] Row 5: Technology & Systems: $1.0M budgeted, $0.6M spent, $0.4M remaining
- [ ] Row 6: Exchange Fees: $2.5M budgeted, $2.5M spent, $0M remaining
- [ ] Row totals match summary cards

### Status Indicators
- [ ] Legal & Compliance shows: "On Track" (green)
- [ ] Accounting shows: "On Track" (green)
- [ ] Underwriting shows: "At Risk" (orange) ← Critical
- [ ] Marketing shows: "On Track" (green)
- [ ] Technology shows: "On Track" (green)
- [ ] Exchange Fees shows: "Complete" (gray/checked)

### Progress Bars
- [ ] Each row has a horizontal progress bar
- [ ] Bar width represents percentage spent (0-100%)
- [ ] Bar color matches status (green/orange/gray)
- [ ] Percentage displays next to bar

### Alert Widget
- [ ] Alert box displays at bottom
- [ ] Background color: warning orange (`var(--color-warning-soft)`)
- [ ] Icon: Triangle with exclamation mark
- [ ] Message: "Underwriting costs at 90% of budget"
- [ ] Explanation: "Review underwriting arrangements or increase budget allocation"
- [ ] Action link: "View Details" (clickable)

### Data Continuity
- [ ] Total of all spent amounts = $6.2M
- [ ] Total of all budgeted amounts = $17.5M
- [ ] Remaining = Budgeted - Spent = $11.3M
- [ ] Percentage = Spent / Budgeted = 35.4%

---

## Scene 4: Cap Table — Dilution Scenarios

### Page Load
- [ ] URL: `/cap-table` loads correctly
- [ ] Page title: "Cap Table Management" displays
- [ ] Subtitle: "Upload, validate, analyze, and model cap table scenarios" displays
- [ ] Load time: < 2 seconds (includes API call)

### Upload Section
- [ ] Upload area displays with drag-and-drop zone
- [ ] Text: "Drag and drop your Excel file here, or click to browse"
- [ ] Supported formats: ".xlsx, .xls" displayed
- [ ] No file errors present

### Summary Cards
After cap table is loaded, verify:
- [ ] "Total Shares Issued": 18,500,000
- [ ] "Share Classes": 3
- [ ] "Total Shareholders": 12
- [ ] "Total Shares Authorized": 30,000,000
- [ ] "Validation Status": Valid ✓

### Current Holdings Table
- [ ] Table displays all shareholders:
  - [ ] Sarah Chen (Founder A): 4,000,000 shares (21.6%)
  - [ ] Marc Leblanc (Founder B): 3,500,000 shares (18.9%)
  - [ ] Series A VC: 5,000,000 shares (27.0%)
  - [ ] Series B VC: 3,000,000 shares (16.2%)
  - [ ] Employee Stock Plan: 1,500,000 shares (8.1%)
  - [ ] Angels: 1,500,000 shares (8.1%)
- [ ] Total row: 18,500,000 (100%)
- [ ] Ownership percentages sum to 100%

### Scenario Selector Tabs
- [ ] "Current State" tab is selected by default
- [ ] "Optimistic" tab is available
- [ ] "Conservative" tab is available

### Optimistic Scenario
- [ ] Click "Optimistic" tab
- [ ] Shows: +5M new shares at IPO
- [ ] New total: 23.5M shares
- [ ] New ownership:
  - [ ] Founders: 28.2% (down from 40.5%)
  - [ ] Series A VC: 18.7% (down from 27.0%)
  - [ ] Series B VC: 11.2% (down from 16.2%)
  - [ ] Employees: 5.6% (down from 8.1%)
  - [ ] Angels: 5.6% (down from 8.1%)
  - [ ] IPO Public: 30.7% (5M / 23.5M)

### Conservative Scenario
- [ ] Click "Conservative" tab
- [ ] Shows: +3M new shares at IPO
- [ ] New total: 21.5M shares
- [ ] New ownership:
  - [ ] Founders: 31.1% (down from 40.5%)
  - [ ] Series A VC: 28.7% (down from 27.0%)
  - [ ] Series B VC: 13.5% (down from 16.2%)
  - [ ] Employees: 6.4% (down from 8.1%)
  - [ ] Angels: 6.4% (down from 8.1%)
  - [ ] IPO Public: 13.9% (3M / 21.5M)

### Export Functionality
- [ ] [Export as CSV] button is present and clickable
- [ ] CSV download includes all scenarios
- [ ] [Export for Prospectus] button is present and clickable
- [ ] [Share with Advisors] button is present and clickable

### Waterfall Chart (if visible)
- [ ] Chart displays current ownership distribution
- [ ] Chart shows IPO impact on ownership percentages
- [ ] Chart is interactive (hover shows values)

---

## Scene 5: Compliance — Listing Rules Validator

### Page Load
- [ ] URL: `/compliance/listing-rules` loads correctly
- [ ] Page title: "TSX Listing Rules Validator" displays
- [ ] Subtitle: "Verify compliance with TSX governance and operational requirements" displays

### Exchange Selector
- [ ] Exchange dropdown shows: "TSX" (selected)
- [ ] Dropdown is clickable
- [ ] Options include: TSX, TSXV, CSE, NASDAQ, NYSE, OTC Markets

### Company & Status Display
- [ ] Company name displays: "TechCorp Inc."
- [ ] Compliance score displays: "8/10" (or similar)
- [ ] Status badge shows: ✓ (green checkmark)

### Governance Requirements Table
- [ ] "Board Independence": ✓ (2 of 5 independent)
- [ ] "Audit Committee": ✓ (3 of 5 members, 1 ACFE)
- [ ] "Compensation Committee": ✓ (2 of 3 independent)
- [ ] "Code of Conduct": ✓ (Adopted and filed)
- [ ] "Disclosure Policy": ✓ (Insider trading blocked)
- [ ] "MD&A": ✓ (Filed in prospectus)
- [ ] "Financial Statements": ✓ (IFRS compliant, audited)
- [ ] "Public Float Minimum": ✗ (Current: 8%, Required: 10%)
- [ ] Checked items show green checkmark
- [ ] Failed item shows red X

### Critical Gap Section: Public Float
- [ ] Gap header displays: "CRITICAL GAP: Public Float (Minimum Requirement)"
- [ ] Current Public Float: 8% (1,480,000 shares)
- [ ] Required Minimum: 10% (1,850,000 shares)
- [ ] Gap: 2% (370,000 shares needed)
- [ ] Valuation: $7.4M additional distribution (at $20/share)
- [ ] Color: Orange (warning)

### Resolution Options
- [ ] Option A: "Founders reduce holdings by 2% (370k shares)"
- [ ] Option B: "Issue IPO shares to reach 10% float target"
- [ ] Option C: "Restrict founder lockup period (36→24 months)"
- [ ] Each option is clickable/selectable

### Operational Requirements
- [ ] "Financial Year-End": December 31 ✓
- [ ] "Interim Reporting": Quarterly (30 days post) ✓
- [ ] "Annual General Meeting": Within 4 months of FYE ✓
- [ ] "Management Circular": 14 days before AGM ✓
- [ ] "SEDAR+ Filing": All docs electronically ✓

### Action Links
- [ ] [View Full TSX Policy Manual] is clickable (opens external)
- [ ] [Download Compliance Report] is clickable (generates PDF)
- [ ] [Assign Tasks] is clickable (opens task dialog)

---

## Scene 6: Resolutions Manager

### Page Load
- [ ] URL: `/compliance/resolutions` loads correctly
- [ ] Page title: "Board Resolutions Manager" displays
- [ ] Subtitle: "Adopt & approve resolutions required for TSX listing" displays

### Resolution Categories
- [ ] "1. GOVERNANCE RESOLUTIONS (3)" section displays
- [ ] "2. COMPENSATION RESOLUTIONS (2)" section displays
- [ ] "3. DISCLOSURE & INSIDER TRADING RESOLUTIONS (4)" section displays
- [ ] "4. IPO-SPECIFIC RESOLUTIONS (3)" section displays

### Governance Resolutions (3)
- [ ] ✓ "Adopt Board Charter" — Status: Approved Mar 15, 2026
- [ ] ✓ "Adopt Audit Committee Charter" — Status: Approved Apr 2, 2026
- [ ] ✓ "Adopt Code of Conduct" — Status: Approved Feb 28, 2026
- [ ] Each shows: [View] [Edit] [Download] [Archive] buttons

### Compensation Resolutions (2)
- [ ] ✓ "Approve ESOP / Stock Option Plan" — Status: Pending (Due Jun 15)
- [ ] ✓ "Approve Executive Compensation Policy" — Status: Not Started
- [ ] Each shows action buttons

### Disclosure & Insider Resolutions (4)
- [ ] ✓ "Adopt Disclosure Policy" — Approved May 10, 2026
- [ ] ✓ "Adopt Trading Blackout Policy" — Approved May 10, 2026
- [ ] (2 additional resolutions visible)

### IPO-Specific Resolutions (3)
- [ ] ⚠ "Prospectus Approval Resolution" — Status: Not Started
- [ ] Shows orange/warning badge
- [ ] Type: "Requires unanimous board approval"
- [ ] Assigned To: All Board Members
- [ ] Due Date: August 1, 2026 (critical path)

### Download Prospectus Resolution as Word
1. [ ] Locate "Prospectus Approval Resolution" in IPO-Specific section
2. [ ] Click [Download Template as .docx]
3. [ ] File downloads: `TechCorp_Resolution_Prospectus_Approval_Draft.docx`
4. [ ] File opens in Word (or preview)
5. [ ] Content includes:
   - [ ] "BOARD OF DIRECTORS RESOLUTION"
   - [ ] "TechCorp Inc." name
   - [ ] "Date: [TO BE COMPLETED]"
   - [ ] Full legal language with blanks
   - [ ] Signature lines for board members
   - [ ] Approval status checkboxes

### Resolution Status
- [ ] Completed resolutions: 5 of 12 (42%)
- [ ] In-progress resolutions: 2 of 12
- [ ] Not-started resolutions: 5 of 12
- [ ] Summary displays progress percentage

### Export Functionality
- [ ] [Generate Composite Minute Book] is clickable
- [ ] [Export All as PDF] is clickable
- [ ] [Email Board] is clickable (for Prospectus resolution)

---

## Scene 7: Consent Letters Manager

### Page Load
- [ ] URL: `/compliance/consent-letters` loads correctly
- [ ] Page title: "Consent Letters Manager" displays
- [ ] Subtitle: "Track auditor, legal counsel, and expert consent status" displays

### Consent Letters Required (4)

#### 1. Auditor's Consent
- [ ] Provider: Miller Thomson LLP (CPAB #1234)
- [ ] Type: Financial Statements Audit
- [ ] Status: ✓ RECEIVED (May 28, 2026)
- [ ] Signed: Patricia Johnson, Audit Partner
- [ ] Consent text: "Miller Thomson LLP consents to the use of its audit reports in the prospectus"
- [ ] Buttons: [View] [Download PDF] [Archive]

#### 2. Legal Counsel Consent
- [ ] Provider: Fasken Martineau (TSX Counsel)
- [ ] Type: Corporate & Securities Law Opinion
- [ ] Status: ⏳ PENDING (Expected: June 10, 2026)
- [ ] Assigned: Mark Holloway, Partner
- [ ] Buttons: [Send Email] [Call] [View Contact]
- [ ] Shows yellow/pending badge

#### 3. Lender Consent
- [ ] Provider: Royal Bank of Canada
- [ ] Type: Subordinated Debt / Credit Line Release
- [ ] Status: ⏳ PENDING (Expected: June 8, 2026)
- [ ] Amount: $10M credit facility
- [ ] Assigned: Jennifer Abbott, Relationship Manager
- [ ] Buttons: [Send Email] [Call] [View Contact]

#### 4. Valuation Expert Consent
- [ ] Provider: Scotiabank Global Banking & Markets
- [ ] Type: IPO Valuation Opinion & Fairness Opinion
- [ ] Status: ✓ RECEIVED (May 31, 2026)
- [ ] Signed: David Chen, Managing Director
- [ ] Consent text: "Scotiabank consents to disclosure of its valuation opinion in IPO prospectus"
- [ ] Buttons: [View] [Download PDF] [Archive]

### Compliance Summary
- [ ] ✓ Auditor Consent: Received May 28
- [ ] ⏳ Legal Counsel Consent: Pending (Due June 10)
- [ ] ⏳ Lender Consent: Pending (Due June 8)
- [ ] ✓ Valuation Expert Consent: Received May 31
- [ ] Overall Status: "50% Complete | 2 of 4 Received"

### Critical Path Alert
- [ ] Alert displays: "Legal counsel consent is blocking prospectus filing. Follow up by June 5."
- [ ] Color: Orange/warning
- [ ] Icon: Hourglass or warning symbol

### Export & Actions
- [ ] [View Consent Letter Template] is clickable
- [ ] [Download All as ZIP] is clickable
- [ ] [Generate Compliance Checklist] is clickable
- [ ] [Send Follow-up Reminders] is clickable

---

## Cross-Scene Data Continuity Testing

### Financial to Cap Table
- [ ] Change cost estimate → see impact in cap table export
- [ ] Update IPO proceeds → dilution scenarios recalculate

### Cap Table to Compliance
- [ ] Load cap table → public float automatically calculates
- [ ] Adjust shares → float compliance gap updates
- [ ] Scenarios change → prospectus data updates

### Compliance to Resolutions
- [ ] Float gap identified → task created in resolutions
- [ ] Governance requirement checked → resolution status updates
- [ ] Compliance checklist → shows which resolutions needed

### All to Export
- [ ] All exports use current data (not stale)
- [ ] Export files have correct company name: "TechCorp Inc."
- [ ] Export files have correct date: June 3, 2026
- [ ] Export files are properly formatted

---

## Performance Testing

### Load Times (all should be < 2 seconds)
- [ ] Dashboard: ____ seconds
- [ ] Cost Calculator: ____ seconds
- [ ] Budget Tracking: ____ seconds
- [ ] Cap Table: ____ seconds
- [ ] Listing Rules: ____ seconds
- [ ] Resolutions: ____ seconds
- [ ] Consent Letters: ____ seconds

### Memory/Browser Health
- [ ] No console errors after Scene 1
- [ ] No console errors after Scene 2
- [ ] No console errors after Scene 3
- [ ] No console errors after Scene 4
- [ ] No console errors after Scene 5
- [ ] No console errors after Scene 6
- [ ] No console errors after Scene 7
- [ ] Browser DevTools shows no memory leaks (check heap usage)

### Network Performance
- [ ] API calls complete within expected time
- [ ] No failed network requests (check Network tab)
- [ ] No timeouts or 5xx errors
- [ ] Pagination works if applicable

---

## UI/UX Verification

### Accessibility
- [ ] All buttons have visible focus states (tab navigation)
- [ ] All form fields are labeled
- [ ] All images have alt text
- [ ] Color is not sole indicator of status (icons/text used too)
- [ ] Contrast ratios meet WCAG AA standards

### Responsiveness
- [ ] Desktop (1920x1080): All elements visible, no overflow
- [ ] Tablet (768x1024): Layout adapts, no horizontal scroll
- [ ] Mobile (375x667): Vertical layout, touch targets > 44px
- [ ] All text readable without zooming

### Consistency
- [ ] Button styles consistent across all scenes
- [ ] Color scheme consistent (accent orange, security blue, green success)
- [ ] Typography consistent (fonts, sizes, weights)
- [ ] Spacing consistent (margins, padding, gaps)
- [ ] Icon style consistent (size, stroke, color)

### Interactions
- [ ] All buttons have hover state (visual feedback)
- [ ] All links have hover state
- [ ] Form fields show focus/active state
- [ ] Alerts are clearly visible and readable
- [ ] Success messages appear (exports, shares)
- [ ] Error messages are clear (if testing error paths)

---

## Final Sign-Off

### QA Lead Verification
- **Name:** _________________________
- **Date:** _________________________
- **All items checked:** ☐ Yes ☐ No
- **Issues found:** ☐ Yes ☐ No
- **If issues, list below:**
  ```
  1. 
  2. 
  3. 
  ```

### Demo Ready
- ☐ All 7 scenes functional
- ☐ All data verified
- ☐ Performance acceptable
- ☐ UI/UX correct
- ☐ Exports working
- ☐ No console errors
- ☐ Demo script ready
- ☐ Backup browser tab open
- ☐ Backup data scenario available

### Sign-Off
**This demo is ready for delivery:** ☐ Yes ☐ No

**Signed:** _________________________ **Date:** _________

---

**Document Version:** 1.0  
**Last Updated:** June 3, 2026  
**Next Review:** Before each demo session
