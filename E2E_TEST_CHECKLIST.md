# IPOReady E2E Test Checklist

**Last Updated:** 2026-06-03  
**Project:** IPOReady MVP — IPO Readiness Workflow Management Platform  
**Scope:** Comprehensive end-to-end testing of all major features and user flows  

---

## 1. MENU NAVIGATION & ROUTING

### 1.1 Main Navigation Menu
**Objective:** Verify all menu items are visible, clickable, and route to correct pages

- [ ] **Features Dropdown**
  - [ ] Click "Features" button in header
  - [ ] Verify dropdown menu appears with 5 items
  - [ ] Click "All Features" → Verify redirects to homepage #features anchor
  - [ ] Click "Cap Table" → Verify routes to `/cap-table` and page loads
  - [ ] Click "IPO Checklist" → Verify routes to `/checklist` and page loads
  - [ ] Click "Document Workspace" → Verify routes to `/documents` and page loads
  - [ ] Click "Expert Network" → Verify routes to `/marketplace` and page loads
  - [ ] Hover away → Verify dropdown closes
  - [ ] Verify dropdown has correct styling and colors

- [ ] **Prospectus Builder**
  - [ ] Click "Prospectus Builder" in header
  - [ ] Verify routes to `/prospectus-builder`
  - [ ] Verify page loads with correct title and layout
  - [ ] Verify icon displays correctly

- [ ] **Resources Link**
  - [ ] Click "Resources" in header
  - [ ] Verify routes to `/resources`
  - [ ] Verify page displays resource content

- [ ] **Pricing Link**
  - [ ] Click "Pricing" in header
  - [ ] Verify routes to `/pricing`
  - [ ] Verify pricing page displays correctly with plan cards

- [ ] **Schedule Demo Button**
  - [ ] Click "Schedule Demo" button
  - [ ] Verify modal dialog appears (ScheduleDemoModal)
  - [ ] Verify modal has form fields visible
  - [ ] Close modal → Verify it dismisses properly

- [ ] **Account Menu (Logged In)**
  - [ ] Verify account menu appears in top-right when logged in
  - [ ] Click account menu → Verify dropdown shows with user initial/avatar
  - [ ] Verify "Settings" option visible
  - [ ] Verify "Sign Out" option visible
  - [ ] Click "Settings" → Verify routes to account/settings page
  - [ ] Click "Sign Out" → Verify user is logged out and redirected

### 1.2 Dashboard Navigation
**Objective:** Verify dashboard menu items and internal navigation

- [ ] **Dashboard Page Load**
  - [ ] Navigate to `/dashboard` when logged in
  - [ ] Verify page loads without errors
  - [ ] Verify all cards/components render
  - [ ] Verify ReadinessFactorsCard displays
  - [ ] Verify SequencingAlertsCard displays
  - [ ] Verify no console errors

- [ ] **Side Navigation (if present)**
  - [ ] Verify all menu items are clickable
  - [ ] Click each menu item
  - [ ] Verify correct page loads for each
  - [ ] Verify active menu item styling updates

### 1.3 Mobile Menu Navigation
**Objective:** Verify navigation works on mobile viewports

- [ ] **Mobile Hamburger Menu**
  - [ ] Resize browser to mobile (375px width)
  - [ ] Verify hamburger menu icon appears (if implemented)
  - [ ] Click hamburger menu → Verify menu slides out
  - [ ] Click menu items → Verify navigation works
  - [ ] Click outside menu → Verify menu closes
  - [ ] Verify menu doesn't cover content

---

## 2. COST CALCULATOR

### 2.1 Cost Calculator Form
**Objective:** Verify form input, calculations, and exports work correctly

- [ ] **Page Load**
  - [ ] Navigate to `/financial/cost-calculator`
  - [ ] Verify page loads with Calculator icon in header
  - [ ] Verify title "IPO Cost Calculator" displays
  - [ ] Verify subtitle text displays
  - [ ] Verify Export and Share buttons visible

- [ ] **Input Fields**
  - [ ] Verify 6 input fields visible:
    - [ ] Estimated Proceeds (default: $100M)
    - [ ] Exchange Fees (default: $2.5M)
    - [ ] Legal Fees (default: $5M)
    - [ ] Accounting Fees (default: $2.5M)
    - [ ] Underwriting Fees (default: $5M)
    - [ ] Marketing Fees (default: $1.5M)
    - [ ] Other Fees (default: $1M)
  - [ ] Verify all fields have number input type
  - [ ] Verify default values display correctly

- [ ] **Input Validation**
  - [ ] Change Estimated Proceeds to 50000000 (50M)
  - [ ] Verify value updates in real-time
  - [ ] Change Exchange Fees to 0
  - [ ] Verify zero value accepted
  - [ ] Try entering negative number (-1000000)
  - [ ] Verify negative value either rejected or handled gracefully
  - [ ] Try entering decimal (e.g., 1500000.50)
  - [ ] Verify decimal value handled correctly

- [ ] **Calculations**
  - [ ] **Total Costs Calculation:**
    - [ ] Set: Proceeds=100M, Exchange=2.5M, Legal=5M, Accounting=2.5M, Underwriting=5M, Marketing=1.5M, Other=1M
    - [ ] Verify Total Costs = 17.5M (sum of all fees except proceeds)
    - [ ] Verify Net Proceeds = 82.5M (100M - 17.5M)
  - [ ] **Cost Percentage:**
    - [ ] Verify each cost shows as percentage of total proceeds
    - [ ] Exchange: 2.5% (2.5M / 100M)
    - [ ] Legal: 5% (5M / 100M)
    - [ ] Verify all percentages calculate correctly
  - [ ] **Summary Panel:**
    - [ ] Verify summary displays all calculated values
    - [ ] Verify costs breakdown visual (chart if present)

- [ ] **Cost Breakdown Visualization**
  - [ ] Verify cost breakdown chart/bar graph displays
  - [ ] Verify each fee category shows with correct color
  - [ ] Hover over chart element → Verify tooltip shows value
  - [ ] Verify legend displays all categories

- [ ] **Export Functionality**
  - [ ] Click Export button
  - [ ] Verify file download starts (CSV or Excel)
  - [ ] Download file → Verify format is correct
  - [ ] Verify downloaded file contains:
    - [ ] All input values
    - [ ] Calculated totals
    - [ ] Cost percentages
  - [ ] Verify file is named appropriately (e.g., `IPO_Cost_Calculator_[date].csv`)
  - [ ] Open downloaded file → Verify data integrity

- [ ] **Share Functionality**
  - [ ] Click Share button
  - [ ] Verify share options appear (copy link, email, etc.)
  - [ ] Click "Copy Link" → Verify link copied to clipboard
  - [ ] Paste link → Verify it's a valid URL

- [ ] **Responsive Design**
  - [ ] Verify layout on desktop (1920px)
  - [ ] Verify layout on tablet (768px)
  - [ ] Verify layout on mobile (375px)
  - [ ] Verify inputs remain accessible on all sizes
  - [ ] Verify summary panel visible on mobile (may scroll)

---

## 3. FINANCIAL DASHBOARD

### 3.1 Dashboard Page
**Objective:** Verify dashboard loads data, displays charts, and handles state correctly

- [ ] **Dashboard Load**
  - [ ] Navigate to `/dashboard` when logged in
  - [ ] Verify page loads within 3 seconds
  - [ ] Verify no console errors
  - [ ] Verify no network errors in DevTools

- [ ] **Readiness Factors Card**
  - [ ] Verify ReadinessFactorsCard component displays
  - [ ] Verify card has title and description
  - [ ] Verify factors list displays (if populated from API)
  - [ ] Verify each factor shows:
    - [ ] Factor name
    - [ ] Current status (complete/incomplete)
    - [ ] Percentage or progress bar
  - [ ] Click factor → Verify navigation to relevant section (if implemented)

- [ ] **Sequencing Alerts Card**
  - [ ] Verify SequencingAlertsCard displays
  - [ ] Verify alerts list shows (if data present)
  - [ ] Verify each alert displays:
    - [ ] Alert icon/severity level
    - [ ] Alert message
    - [ ] Related task/milestone
  - [ ] Click alert → Verify navigates to related page/section
  - [ ] Verify alert counts update correctly

- [ ] **Trial Countdown Banner**
  - [ ] Verify TrialCountdownBanner displays if user on trial
  - [ ] Verify banner shows days remaining
  - [ ] Verify upgrade CTA button visible
  - [ ] Click upgrade → Verify routes to `/pricing` or checkout

- [ ] **Phase Progress Visualization**
  - [ ] Verify phases display (Readiness, Preparation, Execution, Listing)
  - [ ] Verify current phase highlighted
  - [ ] Verify progress bar shows completion percentage
  - [ ] Verify phase labels display correctly
  - [ ] Click phase → Verify drills into phase details (if implemented)

- [ ] **Data Loading States**
  - [ ] Verify loading skeletons appear while data fetches
  - [ ] Verify data replaces skeletons when loaded
  - [ ] Verify no duplicate data renders
  - [ ] Refresh page → Verify data reloads correctly

- [ ] **Responsive Layout**
  - [ ] Desktop (1920px): Verify 2-3 column layout
  - [ ] Tablet (768px): Verify cards stack properly
  - [ ] Mobile (375px): Verify single column layout
  - [ ] Verify cards remain readable at all sizes

---

## 4. DILUTION SCENARIOS

### 4.1 Dilution Scenarios Page
**Objective:** Verify dilution calculations and scenario management

- [ ] **Page Load**
  - [ ] Navigate to `/dashboard/cap-table/dilution-scenarios`
  - [ ] Verify page loads with title "Dilution Scenarios"
  - [ ] Verify Zap icon (TrendingDown) displays in header
  - [ ] Verify three preset scenario tabs visible:
    - [ ] Base Case
    - [ ] Optimistic
    - [ ] Conservative

- [ ] **Preset Scenarios**
  - [ ] **Base Case Scenario:**
    - [ ] Verify tab displays base scenario data
    - [ ] Verify ownership percentages calculate correctly
    - [ ] Verify dilution percentage displays
    - [ ] Verify fully-diluted shares calculate correctly
  - [ ] **Optimistic Scenario:**
    - [ ] Click Optimistic tab
    - [ ] Verify different values display than base
    - [ ] Verify more favorable dilution shown
    - [ ] Verify calculations consistent
  - [ ] **Conservative Scenario:**
    - [ ] Click Conservative tab
    - [ ] Verify most dilution shown
    - [ ] Verify calculations consistent
    - [ ] Verify all scenarios use same math engine

- [ ] **Scenario Data Display**
  - [ ] Each scenario shows:
    - [ ] Current shares outstanding
    - [ ] Options/warrants to dilute
    - [ ] Convertible notes conversion
    - [ ] Pro-forma fully diluted shares
    - [ ] Major shareholder dilution %
  - [ ] Verify numbers format with commas (e.g., "1,000,000")
  - [ ] Verify percentages show to 2 decimals

- [ ] **Waterfall Visualization**
  - [ ] Verify waterfall chart displays (if implemented)
  - [ ] Verify chart shows flow from current → diluted
  - [ ] Verify each dilution event labeled:
    - [ ] Options exercise
    - [ ] Warrants exercise
    - [ ] Convertible note conversion
    - [ ] New fundraise
  - [ ] Hover over waterfall bars → Verify tooltip with values

- [ ] **Custom Scenario Form**
  - [ ] Click "+ Create Custom Scenario" button
  - [ ] Verify form modal opens or form section expands
  - [ ] Verify input fields for:
    - [ ] Current shares outstanding
    - [ ] Number of option grants
    - [ ] Number of warrants
    - [ ] Convertible note amount
    - [ ] New fundraise shares
    - [ ] New funding round valuation
  - [ ] Fill form with test data
  - [ ] Click Calculate → Verify results display
  - [ ] Verify custom scenario calculates correctly:
    - [ ] Total shares after dilution
    - [ ] Percentage dilution per holder
    - [ ] Pro-forma ownership %

- [ ] **Scenario Calculations Accuracy**
  - [ ] **Test Case 1: Basic Dilution**
    - [ ] Initial shares: 10M
    - [ ] Options granted: 1M @ $1 strike
    - [ ] Verify fully diluted: 11M
    - [ ] Verify founder dilution: 9.09%
  - [ ] **Test Case 2: Multi-Layer Dilution**
    - [ ] Initial: 10M
    - [ ] Options: 1M
    - [ ] Warrants: 500k
    - [ ] Convertible: 100k on $10M note at $12 valuation
    - [ ] Verify correct order of dilution
    - [ ] Verify all calculations compound correctly
  - [ ] **Test Case 3: Founders vs Employees**
    - [ ] Verify founders' dilution shown separately
    - [ ] Verify employee dilution shown separately
    - [ ] Verify total matches sum of parts

- [ ] **Export CSV**
  - [ ] Click Export button (Download icon)
  - [ ] Verify CSV file downloads
  - [ ] Open CSV in Excel/Sheets
  - [ ] Verify contains:
    - [ ] Scenario name
    - [ ] All share counts
    - [ ] All percentages
    - [ ] Waterfall breakdown
  - [ ] Verify formatting is readable
  - [ ] Verify no formula errors in spreadsheet

- [ ] **Responsive Design**
  - [ ] Desktop: Verify 2-column layout (waterfall + scenario table)
  - [ ] Tablet: Verify single column layout
  - [ ] Mobile: Verify all elements visible with horizontal scroll if needed

---

## 5. CONTRACTS GRAPH / CONTRACTS MAP

### 5.1 Contracts Map Navigation
**Objective:** Verify contracts graph visualization and node interactions

- [ ] **Page Load**
  - [ ] Navigate to `/dashboard/documents/contracts-map`
  - [ ] Verify page loads with "Contracts Map" title
  - [ ] Verify graph canvas renders (D3 or similar visualization library)
  - [ ] Verify no console errors about rendering

- [ ] **Node Display**
  - [ ] Verify contract nodes display as circles/boxes
  - [ ] Verify each node labeled with contract type:
    - [ ] Articles of Incorporation
    - [ ] Bylaws
    - [ ] Stock Option Plan
    - [ ] Cap Table
    - [ ] Shareholder Agreement
    - [ ] Underwriting Agreement
    - [ ] etc.
  - [ ] Verify node colors distinguish contract categories:
    - [ ] Governance contracts (one color)
    - [ ] Equity contracts (another color)
    - [ ] Listing agreements (third color)
  - [ ] Verify node sizes appropriate (not too small/large)

- [ ] **Relationship Lines/Edges**
  - [ ] Verify lines connect related contracts
  - [ ] Verify line types distinguish relationship types:
    - [ ] "References" relationships (solid)
    - [ ] "Amends" relationships (dashed)
    - [ ] "Requires" relationships (dotted)
  - [ ] Verify relationship labels visible (if hover reveals them)
  - [ ] Hover over edge → Verify tooltip shows relationship type

- [ ] **Node Interactions**
  - [ ] Click contract node
  - [ ] Verify node highlights
  - [ ] Verify related nodes highlight (connected contracts)
  - [ ] Verify contract details panel opens (side panel or modal)
  - [ ] Panel shows:
    - [ ] Contract name
    - [ ] Type
    - [ ] Last updated date
    - [ ] Status (complete/incomplete)
    - [ ] "View Document" link
  - [ ] Click "View Document" → Verify opens document

- [ ] **Missing Documents Flagging**
  - [ ] Verify any required contracts missing are flagged:
    - [ ] Red or error color highlighting
    - [ ] "Missing" badge on node
    - [ ] List of missing contracts shown (top of page or side panel)
  - [ ] Click missing contract → Verify action to upload/create it
  - [ ] Verify missing count updates as documents added

- [ ] **Graph Controls**
  - [ ] Verify pan gesture works (click & drag)
  - [ ] Verify zoom in/out (mouse wheel or buttons)
  - [ ] Verify zoom to fit button (if present) centers all nodes
  - [ ] Verify reset/home button returns to default view
  - [ ] Verify legend displays (contract type colors)

- [ ] **Search/Filter**
  - [ ] Verify search bar visible (if implemented)
  - [ ] Type contract name → Verify node highlights
  - [ ] Filter by contract type → Verify graph updates
  - [ ] Verify other contracts dim/fade when filtered
  - [ ] Clear filter → Verify all nodes visible again

- [ ] **Responsive Design**
  - [ ] Desktop: Verify full graph visible
  - [ ] Tablet: Verify graph scrollable
  - [ ] Mobile: Verify graph scales appropriately

---

## 6. CONSENT LETTERS / SHAREHOLDER CONSENTS

### 6.1 Consent Letters Page
**Objective:** Verify consent management and letter generation

- [ ] **Page Load**
  - [ ] Navigate to `/dashboard/compliance/consent-letters`
  - [ ] Verify page loads with title "Shareholder Consents"
  - [ ] Verify list of consents displays

- [ ] **Consents List Display**
  - [ ] Verify table/list shows all required consents:
    - [ ] IPO authorization consent
    - [ ] Share capital authorization
    - [ ] Director election consent
    - [ ] Auditor consent
    - [ ] Other corporate consents
  - [ ] Each row shows:
    - [ ] Consent name
    - [ ] Description
    - [ ] Status (pending/completed/approved)
    - [ ] Assigned to (shareholder/director name if present)
    - [ ] Due date
    - [ ] Actions (Request Letter, View, Edit)
  - [ ] Verify status badges display correct colors

- [ ] **Consent Status Tracking**
  - [ ] Verify completed consents have checkmark
  - [ ] Verify pending consents show "Pending" badge
  - [ ] Verify overdue consents show warning color
  - [ ] Click on row → Verify details panel opens
  - [ ] Details show:
    - [ ] Full consent text
    - [ ] Required signatory
    - [ ] Signature date
    - [ ] Any conditions

- [ ] **Request Letter Generation**
  - [ ] Click "Request Letter" for a consent
  - [ ] Verify letter template dialog/form appears
  - [ ] Verify form has fields for:
    - [ ] Recipient name
    - [ ] Recipient email (pre-filled if known)
    - [ ] Custom message (optional)
    - [ ] Consent type (pre-selected)
  - [ ] Fill in recipient email
  - [ ] Click "Generate Letter" → Verify PDF dialog opens
  - [ ] Verify letter shows:
    - [ ] Professional formatting
    - [ ] Consent text
    - [ ] Signature block
    - [ ] Company logo (if present)
    - [ ] Date fields
    - [ ] Return instructions

- [ ] **PDF Download**
  - [ ] Click "Download PDF" button
  - [ ] Verify PDF file downloads (e.g., `Consent_Letter_IPO_[date].pdf`)
  - [ ] Open PDF → Verify rendering correct:
    - [ ] Text readable
    - [ ] Formatting intact
    - [ ] Signature blocks present
    - [ ] No layout errors
  - [ ] Print PDF → Verify printable format

- [ ] **Email Delivery**
  - [ ] Click "Send Email" button (if available)
  - [ ] Verify email pre-populated with:
    - [ ] To: recipient email
    - [ ] Subject: "IPO Shareholder Consent - [Consent Name]"
    - [ ] Body: Consent request text
    - [ ] Attachment: Generated PDF
  - [ ] Verify user can edit email before sending
  - [ ] Send email → Verify success message
  - [ ] Verify status updates to "Sent"

- [ ] **Bulk Actions**
  - [ ] Select multiple consents (checkboxes)
  - [ ] Click "Bulk Request Letters"
  - [ ] Verify template dialog allows:
    - [ ] Mapping recipients to consents
    - [ ] Custom message for all
    - [ ] Recipient email selection
  - [ ] Generate → Verify all letters created

- [ ] **Tracking & History**
  - [ ] Verify when letter requested, timestamp recorded
  - [ ] Verify when letter sent, status updates
  - [ ] Click "View History" → Verify timeline shows:
    - [ ] Letter generated date
    - [ ] Letter sent date
    - [ ] Reminder sent dates
    - [ ] Received/signed date

---

## 7. RESOLUTIONS (CORPORATE)

### 7.1 Resolutions Generation Page
**Objective:** Verify all 4 resolution types generate correctly

- [ ] **Page Load**
  - [ ] Navigate to `/dashboard/compliance/resolutions`
  - [ ] Verify page loads with "Corporate Resolutions" title
  - [ ] Verify 4 resolution types displayed:
    - [ ] Board Resolution
    - [ ] Shareholder Resolution
    - [ ] Director Consent
    - [ ] Committee Resolution

- [ ] **Board Resolution**
  - [ ] Click "Generate Board Resolution"
  - [ ] Verify form opens with fields:
    - [ ] Resolution title
    - [ ] Resolution description/purpose
    - [ ] Effective date
    - [ ] Requires director count
  - [ ] Fill form:
    - [ ] Title: "Authorization for IPO Process"
    - [ ] Description: "Approval to initiate IPO preparation"
    - [ ] Date: Today
    - [ ] Board size: 3 directors
  - [ ] Click "Generate" → Verify Word doc downloads:
    - [ ] File named `Board_Resolution_[date].docx`
    - [ ] Open in Word → Verify editable
    - [ ] Verify contains:
      - [ ] "RESOLVED, that..."
      - [ ] Director signature blocks
      - [ ] Corporate seal placeholder
      - [ ] Secretary certification
      - [ ] Professional formatting

- [ ] **Shareholder Resolution**
  - [ ] Click "Generate Shareholder Resolution"
  - [ ] Verify form opens with:
    - [ ] Resolution title
    - [ ] Resolution text
    - [ ] Shareholder count required
    - [ ] Vote threshold (simple/supermajority)
  - [ ] Fill form:
    - [ ] Title: "Approval of IPO"
    - [ ] Text: Full resolution language
    - [ ] Threshold: 2/3 majority
  - [ ] Generate → Verify Word doc downloads
  - [ ] Open in Word → Verify:
    - [ ] Shareholder signature blocks
    - [ ] Vote tally table
    - [ ] Date and location fields
    - [ ] Proper legal formatting

- [ ] **Director Consent**
  - [ ] Click "Generate Director Consent"
  - [ ] Verify form for director-specific language
  - [ ] Generate → Verify Word doc with:
    - [ ] Director name field
    - [ ] Consent language specific to director duties
    - [ ] Signature block
    - [ ] Date field
    - [ ] Editable sections

- [ ] **Committee Resolution**
  - [ ] Click "Generate Committee Resolution"
  - [ ] Verify form for committee (e.g., Audit, Compensation)
  - [ ] Select committee type
  - [ ] Generate → Verify Word doc with:
    - [ ] Committee-specific language
    - [ ] Committee member signature blocks
    - [ ] Committee chair signature
    - [ ] Professional formatting

- [ ] **Word Document Editability**
  - [ ] For each generated resolution:
    - [ ] Open in Microsoft Word
    - [ ] Verify document is fully editable
    - [ ] Edit resolution title → Verify change persists
    - [ ] Edit signature block names → Verify change persists
    - [ ] Verify no protection/locks on document
    - [ ] Save as new version → Verify save successful
    - [ ] Re-open saved document → Verify edits retained

- [ ] **Template Consistency**
  - [ ] Generate 2 different Board Resolutions
  - [ ] Verify same template structure in both
  - [ ] Verify formatting consistent
  - [ ] Verify only content changes (not structure)

---

## 8. LISTING RULES & COMPLIANCE VALIDATION

### 8.1 Listing Rules Validator
**Objective:** Verify validation logic and gap analysis for TSX vs NASDAQ

- [ ] **Page Load**
  - [ ] Navigate to `/dashboard/compliance/listing-rules`
  - [ ] Verify page loads with "Listing Rules Validator" title
  - [ ] Verify exchange selector visible (dropdown or tabs)

- [ ] **Exchange Selection & Display**
  - [ ] Verify 6 exchanges available:
    - [ ] TSX
    - [ ] TSXV
    - [ ] CSE
    - [ ] NASDAQ
    - [ ] NYSE
    - [ ] OTC Markets
  - [ ] Click each exchange → Verify corresponding rules load
  - [ ] Verify selected exchange highlighted

- [ ] **Input Form**
  - [ ] Verify input form displays with fields:
    - [ ] Current public float %
    - [ ] Shares outstanding (total)
    - [ ] Board lot size
    - [ ] Shareholder count
    - [ ] Business continuity (% operations in jurisdiction)
  - [ ] Fill TSX test case:
    - [ ] Public float: 25%
    - [ ] Shares: 10M
    - [ ] Board lot: 100
    - [ ] Shareholders: 300
    - [ ] Business continuity: 90%
  - [ ] Click Validate → Verify results display

- [ ] **TSX Validation**
  - [ ] Verify TSX requirements shown:
    - [ ] Min public float: 25%
    - [ ] Min board lot: 100 shares
    - [ ] Min shares: as specified
  - [ ] Verify test data passes all checks
  - [ ] Click through to see:
    - [ ] ✓ Float requirement met (25% = 25%)
    - [ ] ✓ Board lot met (100 = 100)
    - [ ] ✓ Shares outstanding met
  - [ ] Verify ComplianceIndicator shows green "COMPLIANT"

- [ ] **NASDAQ Validation**
  - [ ] Switch to NASDAQ
  - [ ] Verify NASDAQ requirements shown:
    - [ ] Min public float: 1.1M shares OR 10M market cap
    - [ ] Min shareholders: 400 (round lots)
    - [ ] Min market cap: $5M
    - [ ] Bid price: $4+ (at IPO)
  - [ ] Enter test data that fails NASDAQ:
    - [ ] Public float: 10% (below requirement)
    - [ ] Market cap: $3M (below $5M)
  - [ ] Verify red "NON-COMPLIANT" badge
  - [ ] Verify gaps highlighted:
    - [ ] Float gap: -15% (needs 25%)
    - [ ] Market cap gap: -$2M (needs $5M)

- [ ] **Gap Analysis - Side-by-Side**
  - [ ] Verify SideBySideComparison displays
  - [ ] Compare TSX vs NASDAQ:
    - [ ] TSX column shows TSX requirements
    - [ ] NASDAQ column shows NASDAQ requirements
    - [ ] Gaps highlighted for shortfalls
  - [ ] Verify table shows:
    - [ ] Requirement name
    - [ ] TSX value
    - [ ] NASDAQ value
    - [ ] Current status
    - [ ] Gap if not met
  - [ ] Verify color coding:
    - [ ] Green = meets requirement
    - [ ] Red = fails requirement
    - [ ] Yellow = close to threshold

- [ ] **Gap Analysis Accuracy**
  - [ ] **TSX vs NASDAQ Public Float:**
    - [ ] TSX requires 25%, NASDAQ requires 10%+
    - [ ] Enter 15% float
    - [ ] Verify TSX shows 10% gap shortfall
    - [ ] Verify NASDAQ shows compliant (green)
  - [ ] **Market Cap Requirements:**
    - [ ] Enter market cap $4M
    - [ ] Verify NASDAQ shows $1M shortfall (needs $5M)
    - [ ] Verify TSX has no market cap requirement
  - [ ] **Shareholder Count:**
    - [ ] TSX: ~300 shareholders
    - [ ] NASDAQ: 400+ shareholders (round lots)
    - [ ] Enter 350 shareholders
    - [ ] Verify NASDAQ shows 50 shareholder gap
    - [ ] Verify TSX compliant

- [ ] **Validation Logic**
  - [ ] Enter edge case data:
    - [ ] Float exactly at requirement → Verify "meets requirement"
    - [ ] Float 0.1% below → Verify "non-compliant"
    - [ ] Negative values → Verify rejected or error shown
    - [ ] Zero shares → Verify error
    - [ ] Float > 100% → Verify error

- [ ] **Reporting**
  - [ ] Verify "Generate Report" button
  - [ ] Click button → Verify PDF/report downloads
  - [ ] Report includes:
    - [ ] Company details
    - [ ] Selected exchange
    - [ ] All requirements vs actuals
    - [ ] Gap analysis
    - [ ] Compliance summary
    - [ ] Recommendations for gaps

- [ ] **Responsive Design**
  - [ ] Desktop (1920px): Verify side-by-side layout
  - [ ] Tablet (768px): Verify stacked layout
  - [ ] Mobile (375px): Verify scrollable form

---

## 9. SYNDICATION TEMPLATES

### 9.1 Syndication Templates Page
**Objective:** Verify templates display and downloads work

- [ ] **Page Load**
  - [ ] Navigate to `/dashboard/compliance/syndication-templates`
  - [ ] Verify page loads with "Syndication Templates" title
  - [ ] Verify template library displays

- [ ] **Template Categories**
  - [ ] Verify templates grouped by category:
    - [ ] Underwriting Agreements
    - [ ] Pricing Documents
    - [ ] Due Diligence Requests
    - [ ] Board Materials
    - [ ] Shareholder Materials
    - [ ] Roadshow Materials

- [ ] **Individual Template Display**
  - [ ] Verify each template shows:
    - [ ] Template name
    - [ ] Description
    - [ ] Use case / applicability
    - [ ] Customization level (Low/Medium/High)
    - [ ] Preview button
    - [ ] Download button
  - [ ] Click "Preview" → Verify preview modal opens
  - [ ] Preview shows template excerpt (first page)
  - [ ] Click "Download" → Verify Word doc downloads

- [ ] **Template Downloads**
  - [ ] Click "Download" on underwriting agreement template
  - [ ] Verify file downloads: `Underwriting_Agreement_Template.docx`
  - [ ] Open in Word → Verify:
    - [ ] Fully editable
    - [ ] Professional formatting
    - [ ] Placeholder text [COMPANY NAME], [DATE], [AMOUNT]
    - [ ] Section headings clear
  - [ ] Test 3 different template downloads
  - [ ] Verify all downloads succeed
  - [ ] Verify all docs are editable

- [ ] **Template Search/Filter**
  - [ ] Verify search bar present
  - [ ] Type "pricing" → Verify templates filtered
  - [ ] Type "underwriting" → Verify underwriting templates shown
  - [ ] Clear search → Verify all templates return

- [ ] **Template Customization Indicators**
  - [ ] Verify templates marked by customization level:
    - [ ] Low = mostly boilerplate, minimal changes
    - [ ] Medium = needs some customization per company
    - [ ] High = extensive customization needed
  - [ ] Verify indicator displayed visually (badge or star count)

---

## 10. CSS, STYLING & RESPONSIVE DESIGN

### 10.1 CSS & Visual Glitches
**Objective:** Verify no CSS issues and responsive layouts work

- [ ] **Color Variables**
  - [ ] Verify primary color (accent) displays as red (#E8312A)
  - [ ] Verify success color (green) displays correctly
  - [ ] Verify error color (red) displays correctly
  - [ ] Verify text colors readable on all backgrounds
  - [ ] Verify hover states all display correct colors

- [ ] **Typography**
  - [ ] Verify font stack is consistent
  - [ ] Verify heading sizes (H1 > H2 > H3)
  - [ ] Verify text is readable (min 14px body text)
  - [ ] Verify line-height appropriate for readability
  - [ ] Verify bold/italic text displays correctly

- [ ] **Buttons & Interactive Elements**
  - [ ] Verify all buttons have:
    - [ ] Proper padding/size (min 44px height for mobile)
    - [ ] Hover state (color/opacity change)
    - [ ] Active state (different color)
    - [ ] Focus state (visible outline or underline)
  - [ ] Verify disabled buttons styled differently
  - [ ] Verify link styling consistent:
    - [ ] Underlined or color-differentiated
    - [ ] Hover state visible
    - [ ] Focus state visible

- [ ] **Borders & Shadows**
  - [ ] Verify card shadows (box-shadow) consistent
  - [ ] Verify border colors match theme
  - [ ] Verify border radius consistent (8px or as designed)
  - [ ] Verify no double borders or overlapping shadows

- [ ] **Spacing & Layout**
  - [ ] Verify consistent margins between sections
  - [ ] Verify padding inside cards/containers
  - [ ] Verify grid columns align properly
  - [ ] Verify no overlapping content
  - [ ] Verify whitespace proportional

- [ ] **Dark Mode (if implemented)**
  - [ ] Verify dark mode toggle works
  - [ ] Verify all text readable in dark mode
  - [ ] Verify backgrounds are dark (not white)
  - [ ] Verify accent colors adjusted for contrast
  - [ ] Verify images visible (not too dark)
  - [ ] Test all pages in dark mode:
    - [ ] Dashboard
    - [ ] Cap Table
    - [ ] Compliance pages
    - [ ] Cost Calculator

- [ ] **Desktop Layout (1920px)**
  - [ ] No horizontal scrolling
  - [ ] Content max-width respected (if set)
  - [ ] Sidebars visible on left (if present)
  - [ ] Main content properly centered
  - [ ] All elements proportional

- [ ] **Tablet Layout (768px)**
  - [ ] Two-column layouts convert to single column
  - [ ] Sidebar collapses to hamburger (if present)
  - [ ] Cards/sections stack vertically
  - [ ] Touch targets remain large enough (44px+)
  - [ ] No horizontal scrolling

- [ ] **Mobile Layout (375px - iPhone SE)**
  - [ ] Single column layout
  - [ ] All text readable without zooming
  - [ ] Touch targets minimum 44px × 44px
  - [ ] Hamburger menu visible and functional
  - [ ] No horizontal scrolling
  - [ ] Forms inputs full width (with padding)
  - [ ] Modals fit on screen (scrollable if needed)

- [ ] **Menu Visibility Check**
  - [ ] Navigate to each page listed in menu
  - [ ] Verify menu remains visible/accessible
  - [ ] Menu on desktop: vertical sidebar or top nav
  - [ ] Menu on tablet: hamburger menu
  - [ ] Menu on mobile: hamburger menu, full screen
  - [ ] Test menu accessibility:
    - [ ] Tab through menu items
    - [ ] Verify keyboard navigation works
    - [ ] Verify focus states visible

- [ ] **Visual Consistency**
  - [ ] Verify consistent heading styling across all pages
  - [ ] Verify consistent button styling
  - [ ] Verify consistent card styling
  - [ ] Verify consistent border/shadow treatment
  - [ ] Verify icons consistent (Lucide React icons)
  - [ ] Verify no misaligned elements

- [ ] **Animation & Motion**
  - [ ] Verify Framer Motion animations smooth
  - [ ] Verify animations don't cause layout shift
  - [ ] Verify animations respect prefers-reduced-motion
  - [ ] Verify animations complete (not cut off)

### 10.2 Print Styles
**Objective:** Verify documents print correctly

- [ ] **Cost Calculator Print**
  - [ ] Open `/financial/cost-calculator`
  - [ ] Press Ctrl+P (or Cmd+P) → Print preview
  - [ ] Verify all calculations visible
  - [ ] Verify costs breakdown visible
  - [ ] Verify no buttons/controls print
  - [ ] Print to PDF → Verify readable

- [ ] **Generated Documents Print**
  - [ ] Open generated Board Resolution Word doc
  - [ ] Print to PDF → Verify formatting intact
  - [ ] Verify signature blocks visible
  - [ ] Verify all text readable

---

## 11. API & DATA FLOW TESTS

### 11.1 Cap Table API
**Objective:** Verify API endpoints return correct data

- [ ] **GET /api/cap-table**
  - [ ] Call endpoint (check DevTools Network tab)
  - [ ] Verify status 200 OK
  - [ ] Verify response includes:
    - [ ] shareholders array
    - [ ] current_valuation
    - [ ] fully_diluted_shares
    - [ ] timestamp
  - [ ] Verify no sensitive data exposed

- [ ] **GET /api/dilution-scenarios/preset**
  - [ ] Call endpoint
  - [ ] Verify returns 3 scenarios (base, optimistic, conservative)
  - [ ] Verify each has calculation data
  - [ ] Verify waterfall breakdown present

### 11.2 Compliance API
**Objective:** Verify compliance endpoints work**

- [ ] **GET /api/listing-rules/[exchange]**
  - [ ] Call with exchange=TSX
  - [ ] Verify returns TSX requirements
  - [ ] Call with exchange=NASDAQ
  - [ ] Verify returns NASDAQ requirements

- [ ] **POST /api/consent/generate-letter**
  - [ ] Send consent type + recipient info
  - [ ] Verify returns PDF or HTML template
  - [ ] Verify all fields populated correctly

---

## 12. ACCESSIBILITY

### 12.1 Keyboard Navigation
**Objective:** Verify keyboard-only navigation possible

- [ ] **Tab Through Navigation**
  - [ ] Press Tab repeatedly through entire page
  - [ ] Verify all interactive elements reachable
  - [ ] Verify focus order logical (top-to-bottom, left-to-right)
  - [ ] Verify focus indicator visible (outline or highlight)

- [ ] **Enter Key**
  - [ ] Tab to button → Press Enter
  - [ ] Verify button activates (not just focused)
  - [ ] Tab to link → Press Enter
  - [ ] Verify link follows (or opens)

- [ ] **Escape Key**
  - [ ] Open modal → Press Escape
  - [ ] Verify modal closes
  - [ ] Open dropdown → Press Escape
  - [ ] Verify dropdown closes

- [ ] **Arrow Keys**
  - [ ] In dropdown menu → Verify arrow keys navigate options
  - [ ] In table → Verify arrow keys navigate rows (if implemented)

### 12.2 Screen Reader
**Objective:** Verify NVDA/JAWS can read content

- [ ] **Landmark Navigation**
  - [ ] Use NVDA: Press D for landmark list
  - [ ] Verify nav, main, aside landmarks present
  - [ ] Verify correct nesting

- [ ] **Heading Navigation**
  - [ ] Use NVDA: Press H for heading list
  - [ ] Verify all headings present
  - [ ] Verify heading hierarchy (H1 → H2 → H3)

- [ ] **Form Labels**
  - [ ] Tab to form input
  - [ ] Verify NVDA announces label text
  - [ ] Verify NVDA announces field type (text, number, etc.)
  - [ ] Verify required fields announced

- [ ] **Image Alt Text**
  - [ ] Verify all images have alt text
  - [ ] Verify alt text descriptive
  - [ ] Verify decorative images marked (aria-hidden or role="presentation")

---

## 13. PERFORMANCE

### 13.1 Load Times
**Objective:** Verify acceptable page load times

- [ ] **First Contentful Paint (FCP)**
  - [ ] Dashboard: < 2 seconds
  - [ ] Cap Table: < 2.5 seconds
  - [ ] Compliance pages: < 2 seconds
  - [ ] Check in Chrome DevTools > Lighthouse

- [ ] **Largest Contentful Paint (LCP)**
  - [ ] Dashboard: < 3 seconds
  - [ ] All pages: < 4 seconds

- [ ] **Cumulative Layout Shift (CLS)**
  - [ ] All pages: < 0.1 (good)
  - [ ] Verify no sudden layout shifts

---

## 14. ERROR HANDLING & EDGE CASES

### 14.1 Network Errors
**Objective:** Verify graceful error handling

- [ ] **Offline Mode**
  - [ ] Open DevTools → Network tab
  - [ ] Set to "Offline"
  - [ ] Try navigating to dashboard
  - [ ] Verify error message displays
  - [ ] Verify "Retry" button available

- [ ] **API Failure**
  - [ ] Mock API failure (using DevTools or network throttling)
  - [ ] Verify error toast/alert appears
  - [ ] Verify user can retry
  - [ ] Verify no infinite loading spinner

### 14.2 Input Validation
**Objective:** Verify invalid inputs handled

- [ ] **Cost Calculator**
  - [ ] Enter text in number field → Verify rejected
  - [ ] Enter negative value → Verify handled
  - [ ] Leave required field blank → Verify error
  - [ ] Submit invalid form → Verify error message

- [ ] **Listing Rules Validator**
  - [ ] Enter > 100% float → Verify error or capped
  - [ ] Enter negative shareholders → Verify error
  - [ ] Leave required field blank → Verify error

---

## 15. BROWSER COMPATIBILITY

### 15.1 Modern Browsers
**Objective:** Verify app works across modern browsers

- [ ] **Chrome/Edge (Latest)**
  - [ ] Desktop: Visit all pages, verify functionality
  - [ ] Mobile: Test responsive layout
  - [ ] Verify console has no errors

- [ ] **Firefox (Latest)**
  - [ ] Test all features
  - [ ] Verify styling matches Chrome
  - [ ] Verify no Firefox-specific bugs

- [ ] **Safari (Latest)**
  - [ ] Test on macOS
  - [ ] Test on iOS (if applicable)
  - [ ] Verify CSS animations smooth
  - [ ] Verify form inputs work correctly

---

## 16. SMOKE TESTS (Quick Overall Check)

**Run these tests for final smoke test before deployment:**

- [ ] All menu items navigate correctly
- [ ] Dashboard loads and displays data
- [ ] Cost Calculator calculates correctly and exports
- [ ] Dilution scenarios generate and export CSV
- [ ] Contracts map displays nodes and relationships
- [ ] Consent letters request and generate PDFs
- [ ] Resolutions generate Word documents (editable)
- [ ] Listing rules validate correctly (TSX vs NASDAQ)
- [ ] Syndication templates download
- [ ] Dark mode toggles and looks correct
- [ ] Mobile layout displays correctly (375px)
- [ ] No console errors on any page
- [ ] All API calls return successfully
- [ ] Forms validate input correctly
- [ ] Print/export functions work

---

## Test Execution Notes

**Tester:** _______________  
**Date:** _______________  
**Browser:** _______________  
**OS:** _______________  

**Issues Found:**
```
1. [Description] — [Severity: Critical/High/Medium/Low]
2. [Description] — [Severity: Critical/High/Medium/Low]
```

**Sign-off:**  
- [ ] All critical issues resolved
- [ ] All high issues resolved
- [ ] Medium issues documented and prioritized
- [ ] Ready for production deployment

---

**End of E2E Test Checklist**
