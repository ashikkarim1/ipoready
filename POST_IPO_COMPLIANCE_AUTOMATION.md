# IPOReady: Post-IPO Compliance Automation System (PATENTABLE)

**Status:** Phase 2 Strategic Design Document  
**Created:** June 7, 2026  
**Type:** Patent-pending feature specification for Listed Services tier  
**Owner:** Product & Engineering  
**Priority:** CRITICAL for post-listing revenue ($15K-$50K/month per customer)

---

## Executive Summary

**Problem:** Post-IPO regulatory burden is massive and fragmented.
- 20+ compliance systems (reporting, audit, disclosure, insider trading)
- Manual workflows prone to human error
- Expensive external advisor dependency (Big 4 audit firms, securities counsel)
- No integrated, defensible audit trail for executive protection
- Risk: Missing a deadline = SEC investigation, personal liability for CEO/CFO

**Solution:** IPOReady's Unified Compliance Automation Platform
- **Single dashboard** for all SOX/post-listing compliance requirements
- **Automated evidence collection** from accounting, HR, legal systems
- **Real-time risk detection** (1-hour alert on compliance events)
- **Audit-ready documentation** with immutable audit trails
- **Executive protection** via defensible decision records

**Market Opportunity:**
- 1,800+ US public companies need this (addressable market)
- $2M+/year in compliance staff efficiency per customer
- Tier 2-4 pricing: $15K-$50K/month ($336K/year per customer)
- Unit economics: 10-month CAC payback, 134:1 LTV:CAC

**Patentability:**
- Claims: (1) Unified evidence collection system for compliance reporting, (2) Real-time materiality analyzer with context awareness, (3) Automated control testing workflow, (4) Integrated audit preparation framework

---

## Market Context

### Why This Matters Now

**The Post-IPO Compliance Crisis:**
- Sarbanes-Oxley Act (SOX) Section 404 requires annual internal control assessments
- Section 302/906 require CEO/CFO certifications with personal liability
- Continuous disclosure (NI 51-102, Exchange rules) requires material event alerts
- Insider reporting (SEDI, Form 4) has strict 10-day windows
- Audit firms charge $500K-$2M annually for audit support
- Manual tracking = 60-80% of compliance staff time wasted on admin

**Current Solutions Are Broken:**
- Big 4 accounting firms: Manual process, reactive (year-end driven)
- Board software (Diligent, Nasdaq Boardvantage): Governance only, no evidence
- Compliance platforms (AuditBoard, Workiva): Fragmented, require manual data integration
- Spreadsheets/email: 40% of companies still use this; error rate = 5-10%

**IPOReady's Opportunity:**
- We already have Phase 1 foundation: regulatory knowledge engine + company context builder
- We understand the full IPO lifecycle (pre + post)
- Customer base converts from pre-IPO to post-IPO at listing
- 5-10x higher pricing than pre-IPO module ($3K-$5K → $15K-$50K/month)

---

## Product Architecture

### 1. Core Compliance Domains (MVP)

#### Domain 1: SOX 404 — Internal Controls Assessment
**What:** Annual certification of internal controls over financial reporting (ICFR)

**Features:**
1. **Control Inventory Dashboard**
   - List of all financial controls (from scoping template)
   - Status: Not Tested → Testing in Progress → Tested → Documented
   - Evidence tracker: # of test results attached
   - Ownership: Finance Controller → CFO → Audit Committee
   - Color-coded risk: Green (tested/effective) → Red (not tested/ineffective)

2. **Control Testing Workflow**
   - Auto-populate test plan from prior year + regulatory requirements
   - Test design template per control type: (1) preventive, (2) detective, (3) compensating
   - Test execution: Upload evidence (spreadsheet, email, system report)
   - Result: Pass/Fail + business impact assessment
   - Audit trail: Who tested, when, what evidence, any rework

3. **Deficiency Tracking**
   - Alert: "Control [X] has failed test [Y]"
   - Classification: Material → Significant → Control deficiency
   - Remediation plan: Describe how will be fixed, target date, owner
   - Follow-up testing: Schedule re-test, track completion

4. **Audit-Ready Package**
   - Pre-stage all test results by control category
   - Generate 404 compliance summary: X controls identified, Y tested, Z% effective
   - Export to PDF/Excel for auditors
   - Version history: Track changes week-over-week

**User Personas:**
- Finance Director (test execution, evidence upload)
- CFO (approval, trend analysis, executive certification)
- Audit committee chair (oversight, exception tracking)
- External auditor (read-only view of all evidence)

**Integration Points:**
- ✅ ERP (accounting system): Pull G/L trial balance, journal entries
- ✅ HR system: Pull payroll changes (internal controls risk)
- ✅ System access logs: Pull from security team (authentication logs = evidence)
- ✅ Bank reconciliation: Pull monthly recon (reconciling items = control testing)

---

#### Domain 2: Disclosure Controls — Material Event Detection
**What:** Real-time identification of events that require disclosure (NI 51-102)

**Features:**
1. **Materiality Analyzer Engine**
   - Input: Company financials (revenue, EBITDA, net income), stock price, market cap, share count
   - Rule engine: Event = "material if impacts" [5% revenue or 10% net income or 15% market cap]
   - Context: Tech startup differs from mining company differs from biotech
   - Output: "This event is material. You have 10 days to file."

2. **Material Event Triggers (Automated Detection)**
   - Financial: Acquisition, writeoff, impairment, IPR&D, contingent liability
   - Operational: Facility shutdown, major contract loss, key supplier default
   - Personnel: CEO/CFO resignation, general counsel resignation, audit committee chair change
   - Legal: Securities litigation, regulatory investigation, FINRA complaint
   - Other: Dividend cut, equity issuance, debt default

3. **Material Event Workflow**
   - Trigger detected (manual or automated)
   - Alert to CFO/Legal: "Potential material event: [details]. Materiality assessment due [date]."
   - Form: Is this material? (Yes/No/Unclear)
   - If Yes: "You must file within 10 days. Draft disclosure statement required."
   - If No: "Document decision rationale for audit trail."
   - Draft → Review → File with securities commission
   - Track: Filed date, SEDAR+/EDGAR confirmation

4. **Disclosure Request Tracking**
   - Company submits disclosure
   - Track status: Submitted → Reviewed → Accepted → Published
   - Alert: "Your material change report was accepted by SEDAR+"
   - Failure handling: "SEDAR+ request denied. Reason: [details]. Fix and re-submit."

**User Personas:**
- General Counsel (legal assessment)
- CFO (financial materiality assessment)
- Investor Relations (disclosure drafting)
- Board chair (notification that disclosure was filed)

**Integration Points:**
- ✅ News/press release feed: Auto-monitor company press releases for trigger keywords
- ✅ Email: Monitor CFO/legal email for keywords ("acquisition", "litigation", "regulatory")
- ✅ Financial system: Real-time GL feed for large transactions
- ✅ SEDAR+ API: Confirm filing status in real-time

---

#### Domain 3: Insider Reporting — SEDI Compliance
**What:** Automated tracking of insider trading forms (SEDI in Canada, Form 4 in US)

**Features:**
1. **Insider Registry**
   - Auto-populate from company cap table + human review
   - Insiders tracked: Officers, directors, significant shareholders, controlled entities
   - Status: Active → Departed (track end date)
   - Blackout periods: Auto-calculate around earnings/material events

2. **SEDI Filing Reminder System**
   - Insider executes trade (buys/sells stock)
   - Automatic alert: "10-day reporting window open. Due: [date]"
   - Day 5 alert: "5 days left to file SEDI. Form [details] required."
   - Day 1 alert: "SEDI filing due TODAY. Last chance to comply."
   - Day +1 alert (if not filed): "SEDI violation. File immediately + notify legal."

3. **Form Pre-population**
   - Pull data: Insider name, company details, trade amount, date, price
   - Pre-fill: # of shares held before/after, % change, acquisition method
   - Insider verifies + signs form (e-signature via DocuSign)
   - Upload to SEDI via API (authenticated submission)

4. **Compliance Dashboard**
   - Red: Overdue insider report (days overdue)
   - Amber: < 3 days to deadline
   - Green: Reported on time
   - Export: "Insider Compliance Status" table for audit committee

5. **Violation Escalation**
   - If insider misses filing: Auto-escalate to CFO + General Counsel
   - Risk assessment: "Delinquent report by director of [X]. Potential Section 16 violation."
   - Action plan: Emergency filing, retro disclosure to board/audit committee
   - Document: Corrective actions taken

**User Personas:**
- Investor Relations / Corporate Secretary (insider registry + reminders)
- Insiders (form signing + submission)
- CFO (compliance oversight, violation alerts)
- Legal Counsel (violation remediation)

**Integration Points:**
- ✅ SEDI API: Check filing status, auto-submit forms
- ✅ Cap table: Auto-sync insider list + share counts
- ✅ E-signature (DocuSign): Form signing workflow
- ✅ Corporate calendar: Auto-detect blackout periods

---

#### Domain 4: Audit Preparation — Evidence Pre-staging
**What:** Year-round evidence collection so audit season is 30% faster

**Features:**
1. **Evidence Repository**
   - Hierarchical folder structure: Control → Test → Evidence
   - Tags: Financial reporting, ICFR, disclosure controls, IT general controls
   - Version history: Track all updates + who changed what
   - Access control: Finance/CFO can upload; auditors get read-only view

2. **Audit Pre-checklist**
   - Auto-generate from regulatory requirements + prior-year audit findings
   - Example items:
     - "Board minutes (all 2025) — attached"
     - "Management letter of representation — [date]"
     - "Internal audit reports — [date]"
     - "Debt covenant compliance letters — [date]"
     - "Customer concentration analysis — [date]"
   - Status: Not started → In progress → Complete → Auditor confirmed
   - Timeline: Start Sept 1, target 80% complete by auditor fieldwork start

3. **Auditor Portal Access**
   - IPOReady generates secure login for external auditors
   - Auditors see: All evidence, all control test results, all remediation plans
   - Chat/collaboration: Auditors can ask questions on specific documents
   - Read-only: No ability to modify evidence

4. **Audit Finding Tracker**
   - As auditors identify issues: "Finding #1: Revenue recognition control not operating"
   - Company response: Corrective action plan + target implementation date
   - Track: Open → In remediation → Resolved → Auditor sign-off
   - Report: "Findings by severity + trend vs. prior year"

5. **Continuous Disclosure Documentation**
   - Track every material event disclosure filed during the year
   - Store: Disclosure document, board approval, sign-off by CEO/legal
   - Risk assessment: Was there a proper materiality decision? Is it documented?
   - Audit use: "Did company properly disclose all material events?"

**User Personas:**
- CFO (overall audit coordination)
- Finance Director (evidence upload, checklist status)
- External auditor (access, review, findings input)
- Audit committee (monitoring + escalation)

**Integration Points:**
- ✅ Document management: Store all PDFs, emails, spreadsheets centrally
- ✅ Chat/Slack: Notify when audit questions arrive
- ✅ Email: Auto-attach evidence to auditor communications

---

### 2. Executive Dashboard — The Command Center

**Homepage for CFO/Audit Committee:**

```
┌─────────────────────────────────────────────────────────────────┐
│ IPOReady Post-IPO Compliance Hub                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SOX 404: Internal Controls Assessment        READY FOR AUDIT ✓ │
│  ├─ Controls Identified: 127                                    │
│  ├─ Controls Tested: 112 (88%)                                  │
│  ├─ Controls Effective: 110 (97%)                               │
│  ├─ Deficiencies: 2 (Material: 0, Sig: 2, Other: 0)           │
│  └─ Timeline: On track. Audit readiness: 95%                   │
│                                                                 │
│  Disclosure Controls: Material Events          MONITORED        │
│  ├─ Events Tracked YTD: 8                                       │
│  ├─ Properly Disclosed: 8 (100%)                                │
│  ├─ Pending Materiality Assessment: 1                           │
│  │  └─ "Acquisition of subsidiary" (Due: tomorrow at 5pm)      │
│  └─ Next disclosure deadline: 8 days                            │
│                                                                 │
│  SEDI Insider Reporting               ALL IN COMPLIANCE ✓       │
│  ├─ Active Insiders: 14                                         │
│  ├─ Reported On Time: 100%                                      │
│  ├─ Trades This Year: 23                                        │
│  ├─ Violations: 0                                               │
│  └─ Next deadline: 5 days (Insider [name] trade filed)         │
│                                                                 │
│  Audit Preparation                              IN PROGRESS     │
│  ├─ Evidence Repository: 287 items                              │
│  ├─ Pre-checklist: 34/42 items complete (81%)                  │
│  ├─ Auditor Access: Granted (Big 4 firm)                       │
│  ├─ Open Findings: 2 (both in remediation)                     │
│  └─ Audit timeline: Fieldwork starts [date]                    │
│                                                                 │
│  ⚠️ ALERTS & EXCEPTIONS (3)                                    │
│  ├─ RED: Revenue recognition test due (2 days overdue)        │
│  ├─ AMBER: Materiality assessment needed (due tomorrow)        │
│  └─ INFO: Auditor uploaded comment (rev rec test)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Metrics Displayed:**
- Compliance completion % (by domain)
- Days to next critical deadline
- Number of open exceptions
- Audit readiness score (0-100)
- Year-over-year trend (vs. prior audit cycle)

---

### 3. Database Schema (Migration)

```sql
-- ============================================================================
-- TABLE: compliance_requirements
-- ============================================================================
-- Master list of regulatory requirements applicable to this company
-- Updated at company setup + annually

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Requirement classification
  requirement_type VARCHAR(50) NOT NULL, -- 'sox_404', 'disclosure_controls', 'sedi', 'audit_prep'
  requirement_name VARCHAR(255) NOT NULL,
  regulation VARCHAR(100),              -- 'SOX 404', 'NI 51-102', 'SEDI Rules'
  jurisdiction VARCHAR(50),              -- 'US', 'Canada', 'Dual'
  
  -- Requirement details
  description TEXT,
  due_date DATE,
  frequency VARCHAR(50),                 -- 'annual', 'quarterly', 'per_event', 'continuous'
  owner_role VARCHAR(100),               -- 'CFO', 'General Counsel', 'Audit Committee', etc.
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'escalated'
  completion_percentage INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Audit history
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compliance_reqs_company_id ON compliance_requirements(company_id);
CREATE INDEX idx_compliance_reqs_type ON compliance_requirements(requirement_type);
CREATE INDEX idx_compliance_reqs_due_date ON compliance_requirements(due_date);

-- ============================================================================
-- TABLE: sox_controls
-- ============================================================================
-- SOX 404 Internal Controls - detailed control registry

CREATE TABLE IF NOT EXISTS sox_controls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Control identification
  control_id VARCHAR(100) NOT NULL,     -- e.g., "FIN-001", "REV-RECOG-002"
  control_name VARCHAR(255) NOT NULL,
  control_description TEXT,
  
  -- Control classification
  process_area VARCHAR(100),            -- 'Revenue', 'Expenditure', 'Payroll', 'Treasury', 'Reporting'
  control_type VARCHAR(50),             -- 'preventive', 'detective', 'compensating'
  risk_area VARCHAR(100),               -- 'Completeness', 'Accuracy', 'Authorization', 'Cutoff'
  
  -- Control ownership
  owner_department VARCHAR(100),
  owner_name VARCHAR(255),
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Testing
  test_design TEXT,                     -- How will we test this?
  test_frequency VARCHAR(50),           -- 'monthly', 'quarterly', 'annual'
  
  -- Current status
  status VARCHAR(50) DEFAULT 'not_tested', -- 'not_tested', 'testing', 'tested', 'effective', 'ineffective'
  last_tested_date DATE,
  test_result VARCHAR(50),              -- 'pass', 'fail', 'inconclusive'
  
  -- If failed
  deficiency_severity VARCHAR(50),      -- 'material', 'significant', 'other'
  deficiency_description TEXT,
  remediation_plan TEXT,
  remediation_target_date DATE,
  remediation_status VARCHAR(50),       -- 'open', 'in_progress', 'resolved'
  
  -- Evidence tracking
  evidence_count INT DEFAULT 0,
  evidence_uploaded BOOLEAN DEFAULT FALSE,
  last_evidence_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sox_controls_company_id ON sox_controls(company_id);
CREATE INDEX idx_sox_controls_status ON sox_controls(status);
CREATE INDEX idx_sox_controls_owner ON sox_controls(owner_user_id);

-- ============================================================================
-- TABLE: sox_test_results
-- ============================================================================
-- Individual test executions and evidence attachment

CREATE TABLE IF NOT EXISTS sox_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sox_control_id UUID NOT NULL REFERENCES sox_controls(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Test execution
  test_date DATE NOT NULL,
  tested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Result
  result VARCHAR(50) NOT NULL,         -- 'pass', 'fail', 'not_applicable'
  test_evidence_summary TEXT,           -- Plain English description of what was tested
  
  -- Evidence attachment
  evidence_document_id UUID REFERENCES unified_documents(id) ON DELETE SET NULL,
  evidence_file_path TEXT,              -- S3 path, Google Drive ID, etc.
  evidence_description TEXT,
  
  -- Rework tracking
  rework_required BOOLEAN DEFAULT FALSE,
  rework_reason TEXT,
  rework_completed_date DATE,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sox_test_results_control_id ON sox_test_results(sox_control_id);
CREATE INDEX idx_sox_test_results_company_id ON sox_test_results(company_id);
CREATE INDEX idx_sox_test_results_date ON sox_test_results(test_date DESC);

-- ============================================================================
-- TABLE: material_events
-- ============================================================================
-- Tracking of all material change disclosures

CREATE TABLE IF NOT EXISTS material_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(100) NOT NULL,    -- 'acquisition', 'writeoff', 'exec_change', 'litigation', etc.
  event_description TEXT NOT NULL,
  event_date DATE NOT NULL,
  
  -- Materiality assessment
  assessed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_material BOOLEAN,
  materiality_threshold_met TEXT,      -- e.g., ">5% of revenue", ">10% market cap"
  materiality_assessment_date DATE,
  materiality_assessment_notes TEXT,
  
  -- Filing
  requires_disclosure BOOLEAN DEFAULT TRUE,
  filed BOOLEAN DEFAULT FALSE,
  sedar_filing_id VARCHAR(100),        -- Reference to SEDAR+ submission
  filed_date DATE,
  disclosure_document_id UUID REFERENCES unified_documents(id) ON DELETE SET NULL,
  
  -- Timeline
  deadline_date DATE,                  -- Usually 10 days from event
  days_remaining INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM deadline_date - NOW()::date)
  ) STORED,
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending_assessment', 'pending_disclosure', 'filed', 'withdrawn'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_material_events_company_id ON material_events(company_id);
CREATE INDEX idx_material_events_is_material ON material_events(is_material);
CREATE INDEX idx_material_events_deadline_date ON material_events(deadline_date);

-- ============================================================================
-- TABLE: insiders
-- ============================================================================
-- Active insider registry for SEDI reporting

CREATE TABLE IF NOT EXISTS insiders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Insider identification
  insider_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,          -- 'CEO', 'CFO', 'Director', 'Officer', 'Control Person'
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Insider classification
  insider_type VARCHAR(50) NOT NULL,   -- 'officer', 'director', 'significant_shareholder', 'controlled_entity'
  initial_notice_filed_date DATE,      -- When they became an insider
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'departed'
  departure_date DATE,
  
  -- Share ownership
  shares_owned INT DEFAULT 0,
  share_count_last_updated TIMESTAMP WITH TIME ZONE,
  
  -- Blackout periods
  blackout_periods JSONB,              -- [{ start_date: ..., end_date: ..., reason: ... }]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insiders_company_id ON insiders(company_id);
CREATE INDEX idx_insiders_status ON insiders(status);

-- ============================================================================
-- TABLE: insider_trades
-- ============================================================================
-- Record of insider trades and SEDI filing status

CREATE TABLE IF NOT EXISTS insider_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  insider_id UUID NOT NULL REFERENCES insiders(id) ON DELETE CASCADE,
  
  -- Trade details
  trade_date DATE NOT NULL,
  trade_type VARCHAR(50) NOT NULL,    -- 'purchase', 'sale', 'grant', 'exercise', 'divestitute'
  shares_quantity INT NOT NULL,
  price_per_share DECIMAL(10,2),
  trade_value DECIMAL(15,2),
  
  -- SEDI filing
  sedi_filing_id VARCHAR(100),
  filing_date DATE,
  filing_deadline_date DATE,
  filing_status VARCHAR(50),           -- 'pending', 'filed', 'overdue', 'late'
  
  -- Form pre-population data
  shares_before INT,
  shares_after INT,
  percent_ownership_before DECIMAL(5,2),
  percent_ownership_after DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insider_trades_company_id ON insider_trades(company_id);
CREATE INDEX idx_insider_trades_insider_id ON insider_trades(insider_id);
CREATE INDEX idx_insider_trades_filing_deadline ON insider_trades(filing_deadline_date);

-- ============================================================================
-- TABLE: audit_evidence
-- ============================================================================
-- Evidence repository for audit support

CREATE TABLE IF NOT EXISTS audit_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Evidence classification
  evidence_category VARCHAR(100) NOT NULL, -- 'sox_404', 'disclosure_controls', 'continuity_of_business'
  evidence_type VARCHAR(100),              -- 'board_minutes', 'internal_audit_report', 'control_testing', etc.
  
  -- Evidence details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  document_id UUID REFERENCES unified_documents(id) ON DELETE SET NULL,
  
  -- Audit trail
  uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Tagging for search
  tags JSONB,                          -- ["revenue", "recognition", "2025_audit"]
  
  -- Auditor access
  auditor_accessible BOOLEAN DEFAULT TRUE,
  auditor_comments TEXT,
  auditor_reviewed_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_evidence_company_id ON audit_evidence(company_id);
CREATE INDEX idx_audit_evidence_category ON audit_evidence(evidence_category);

-- ============================================================================
-- VIEW: compliance_dashboard
-- ============================================================================

CREATE OR REPLACE VIEW v_compliance_dashboard AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  
  -- SOX 404 stats
  (SELECT COUNT(*) FROM sox_controls WHERE company_id = c.id) AS sox_controls_total,
  (SELECT COUNT(*) FROM sox_controls WHERE company_id = c.id AND status = 'tested') AS sox_controls_tested,
  (SELECT COUNT(*) FROM sox_controls WHERE company_id = c.id AND test_result = 'pass') AS sox_controls_effective,
  (SELECT COUNT(*) FROM sox_controls WHERE company_id = c.id AND deficiency_severity = 'material') AS sox_material_deficiencies,
  
  -- Material events stats
  (SELECT COUNT(*) FROM material_events WHERE company_id = c.id AND is_material = true) AS material_events_count,
  (SELECT COUNT(*) FROM material_events WHERE company_id = c.id AND filed = false AND is_material = true) AS material_events_pending_disclosure,
  
  -- Insider stats
  (SELECT COUNT(*) FROM insiders WHERE company_id = c.id AND status = 'active') AS active_insiders,
  (SELECT COUNT(*) FROM insider_trades WHERE company_id = c.id AND filing_status = 'overdue') AS overdue_insider_filings,
  
  -- Audit stats
  (SELECT COUNT(*) FROM audit_evidence WHERE company_id = c.id) AS evidence_items,
  (SELECT COUNT(*) FROM compliance_requirements WHERE company_id = c.id AND status = 'completed') AS requirements_completed
FROM companies c;
```

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
- [ ] Database migrations: compliance_requirements, sox_controls, material_events, insiders, audit_evidence
- [ ] Admin API: CRUD for controls, requirements, insiders
- [ ] Executive dashboard: High-level KPI cards (4 domains)
- [ ] Regulatory rule engine: Enhanced with SOX 404, disclosure, insider rules

### Phase 2: Core Features (Months 2-4)
- [ ] SOX 404 workflow: Control testing, test result upload, evidence attachment
- [ ] Material events engine: Materiality analyzer, trigger detection, disclosure workflow
- [ ] SEDI automation: Insider registry, form pre-population, filing deadline tracking
- [ ] Audit prep: Evidence repository, auditor portal, pre-checklist

### Phase 3: Intelligence & Integrations (Months 4-6)
- [ ] Predictive alerts: ML-based risk scoring for overdue controls/disclosures
- [ ] ERP integration: Auto-pull financial data, G/L journal entries
- [ ] SEDAR+/SEDI API: Real-time filing status, auto-submit forms
- [ ] Email monitoring: Parse CFO/legal email for material event triggers (NLP)

### Phase 4: Executive Intelligence (Months 5-7)
- [ ] Real-time materiality assessment: Context-aware for company (sector, size, volatility)
- [ ] Audit readiness scoring: Predictive model of audit risk based on control status + exceptions
- [ ] Trend analysis: Dashboard showing compliance trajectory (improving vs. declining)
- [ ] Compliance health scoring: Single composite metric (0-100) by domain

---

## Competitive Advantage (Patent Claims)

### Claim 1: Unified Compliance Evidence Collection System
**What:** Integrated framework for collecting, storing, and validating evidence across multiple compliance domains (SOX 404, disclosure controls, insider reporting).

**Prior Art:** Big 4 uses manual collection via email + spreadsheets. Workiva/AuditBoard require separate evidence for each domain.

**Innovation:** Single "unified evidence" repository with automatic linking to compliance requirements. Evidence tagged and searchable across all domains.

**Patent Value:** $3-5M (15+ year protection)

---

### Claim 2: Real-Time Materiality Analyzer with Context Awareness
**What:** ML-based system that assesses materiality of business events using company-specific context (sector, size, leverage, stock volatility, prior thresholds).

**Prior Art:** Standard thresholds: 5% revenue, 10% net income (one-size-fits-all). Manual assessment by legal/CFO.

**Innovation:** 
- Dynamic materiality thresholds based on company profile
- Real-time alert when event meets threshold
- Tracks historical materiality decisions by company + audit firm
- Confidence scoring: High (automatic filing recommended) vs. Low (escalate to counsel)

**Patent Value:** $2-4M (15+ year protection)

---

### Claim 3: Automated Control Testing Workflow with Rework Tracking
**What:** Structured testing lifecycle: Design → Execute → Validate → Evidence Upload → Auditor Review → Rework if needed.

**Prior Art:** Spreadsheet-based, informal, hard to track who did what and when.

**Innovation:**
- Immutable audit trail of all test executions
- Template-driven test design (prevents missed controls)
- Rework detection: If test fails, auto-create remediation plan
- Statistical tracking: % of controls in first-pass condition (quality metric for audit committee)

**Patent Value:** $2-3M (10+ year protection)

---

### Claim 4: Integrated Audit Preparation Framework with Pre-staging
**What:** Year-round evidence pre-staging so audit fieldwork time is reduced by 30%.

**Prior Art:** Manual evidence gathering 2-3 weeks before audit. Last-minute scrambling.

**Innovation:**
- Automated checklist: Pre-populated from regulatory requirements
- Evidence staging: Controls mapped to required audit evidence
- Auditor collaboration: Auditors can request specific evidence via in-platform chat
- Progress tracking: % of checklist complete, days to audit start date

**Patent Value:** $1-2M (10+ year protection)

---

## Go-to-Market Strategy

### Customer Profile (Tier 2-4)
- **Tier 2:** Small public companies ($100M-$500M market cap)
  - Pricing: $15K/month
  - Revenue: $36M-$36M revenue companies
  - Pain: High audit costs (% of revenue), compliance staff turnover
  
- **Tier 3:** Mid public companies ($500M-$2B market cap)
  - Pricing: $30K/month
  - Revenue: $200M-$500M+ revenue companies
  - Pain: Complex controls environment, multiple exchanges, distributed teams
  
- **Tier 4:** Large public companies ($2B+ market cap)
  - Pricing: $50K/month
  - Revenue: $1B+ companies
  - Pain: Risk management, tone-at-top, regulatory scrutiny

### Sales Motion
1. **Land on existing IPOReady customers at listing** (warm handoff)
   - "Your PACE™ work is complete. Now we help you stay compliant post-listing."
   - Discount: 20% off first year for immediate migration
   - Upsell: From $3-5K/month (pre-IPO) to $15-30K/month (post-IPO)

2. **Direct sales to post-IPO companies**
   - Target: Recently listed (< 2 years)
   - Intro: LinkedIn → Compliance officer → CFO
   - Value prop: "Reduce audit time by 30%. Lower compliance staff turnover. Defensible records for SEC."

3. **Partnerships with Big 4 audit firms**
   - Offer: IPOReady as "recommended tool" for clients
   - Commission: 10-15% of subscription revenue
   - Benefit to auditor: Faster evidence collection = higher margins

### Launch Positioning
**"The only platform that goes from IPO to post-listing compliance."**
- Pre-IPO: IPOReady (PACE™, prospectus, cap table)
- At listing: Graduation to Listed Services OS
- Post-listing: Year-round compliance + audit support

---

## Success Metrics

### Business Metrics
- **Revenue:** $1-3 customers by Month 6, $5M ARR by Year 2
- **CAC Payback:** < 12 months (currently estimated 10-12 months)
- **Churn:** < 2% annually (high switching costs from evidence repository lock-in)
- **NPS:** > 50 (external benchmark: typical compliance software = 30-40)

### Product Metrics
- **Control testing completion:** 80%+ by audit fieldwork start
- **Material event detection:** < 1-hour lag from event to alert
- **Audit readiness score:** > 90% average
- **Evidence upload:** 100% (no missing pieces for auditors)

### Risk Metrics
- **Compliance violations:** 0 material events missed (per company per year)
- **Audit qualifications:** 0 (IPOReady platform not mentioned in audit opinion)
- **Regulatory investigations:** 0 triggered by IPOReady customer compliance failures

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Regulatory changes (SOX amendment) | High | Continuous monitoring, 30-day update cycle |
| Competitor enters market (Workiva enhancement) | Medium | Patent protection + lock-in from evidence repo |
| Adoption challenges (Change mgmt at CFO level) | Medium | White-glove onboarding, training, success manager |
| Data privacy (Audit evidence is sensitive) | High | SOC 2 Type II, encryption, role-based access, audit logs |
| Integration failures (ERP API downtime) | Medium | Graceful degradation, manual upload fallback, alerting |
| Customer concentration (IPOReady converts all customers) | Medium | Diversify with direct sales to post-IPO market |

---

## Why This Is Patentable

This system differs from prior art on 4 dimensions:

1. **Integration:** No competitor integrates SOX 404 + disclosure + insider + audit in one platform
2. **Automation:** Materiality analysis + control testing + evidence collection automated (not manual)
3. **Context-awareness:** Thresholds adapt to company profile (not one-size-fits-all)
4. **Defensibility:** Immutable audit trails create executive protection (not just compliance tracking)

**Patent filing strategy:**
- File provisional patent now (costs $200, buys 12 months)
- Hire IP counsel (Q3 2026)
- File non-provisional by June 2027 (12-month priority deadline)
- Expected approval: 2-3 years
- Enforcement: License to Big 4, sell to acquirer (Workiva, AuditBoard, CFO.com)

---

## Appendix: Example Use Cases

### Use Case 1: Revenue Recognition Control Test (SOX 404)

**Scenario:** Company has controls to ensure revenue is recognized in the correct period.

**Workflow:**
1. **Control Design** (Sept):
   - Finance Director creates control: "Monthly revenue cut-off test"
   - Test design: Pull GL revenue entries from Dec 29-31, verify supporting shipping documents are dated in December
   - Evidence required: GL export + shipping proof + auditor sign-off
   
2. **Test Execution** (Jan):
   - Finance analyst runs the test on Jan 2
   - Downloads GL export for Dec 29-31
   - Pulls shipping documents from ERP
   - Compares: All revenue entries have supporting shipping docs (Pass)
   
3. **Evidence Upload** (Jan):
   - Analyst uploads GL export to IPOReady evidence repo
   - Tags: "Revenue", "Cut-off", "Monthly", "2025"
   - Auditor sees evidence in real-time
   
4. **Audit Review** (Feb):
   - Auditor comments: "Need to verify pricing accuracy. Can you pull pricing contracts for all transactions > $100K?"
   - Finance team responds: "Contracts attached. Average price variance: 0.1%."
   - Auditor signs off: Control operating effectively
   
5. **Deficiency Scenario** (Feb):
   - Test shows Jan 1-2 revenue recognized, but shipped Jan 3-4
   - Result: Fail
   - Remediation: "Add preventive control: Revenue blocked until shipping doc entered in ERP (completed Feb 15)"
   - Retest: Passed Feb 28
   - Status: Effective (with compensating control)

---

### Use Case 2: Material Event Disclosure (Acquisition)

**Scenario:** Company announces acquisition of competitor.

**Workflow:**
1. **Event Triggers Alert** (Day 1):
   - News feed detects press release: "Company acquires XYZ Inc for $50M"
   - IPOReady alerts CFO/General Counsel
   - Materiality engine calculates: "$50M / $400M revenue = 12.5% material threshold = MATERIAL"
   - Alert: "Material acquisition detected. 10-day filing window. Due [date]."

2. **Materiality Assessment** (Day 1):
   - General Counsel confirms: "Yes, this is material."
   - IPOReady notes: "Assessed by General Counsel. MATERIAL. Filing required."

3. **Disclosure Drafting** (Day 2-4):
   - Investor Relations drafts disclosure document in IPOReady
   - Includes: Acquisition rationale, purchase price, earnout terms, financing source, risk factors
   - Compliance checks: Does disclosure address all SEC/exchange requirements?

4. **Approval Workflow** (Day 5):
   - CFO reviews + signs
   - Legal Counsel reviews + signs
   - Board chair notified

5. **Filing** (Day 6):
   - IPOReady integrates with SEDAR+ API
   - Disclosure submitted electronically
   - SEDAR+ returns confirmation: "Filing ID: 12345"

6. **Post-Filing** (Day 7):
   - IPOReady monitors SEDAR+ status
   - Alert: "Filing accepted. Published on SEDAR+."
   - Documentation: Evidence stored for audit trail

---

### Use Case 3: Insider Trade Reporting (SEDI)

**Scenario:** Director purchases 10,000 shares.

**Workflow:**
1. **Trade Occurs** (Day 1):
   - Director buys 10,000 shares at $50/share = $500K
   - Corporate Secretary receives trade notice

2. **SEDI Reminder Triggered** (Day 2):
   - IPOReady alert: "Director [name] trade detected. 10-day SEDI filing window. Due [date]."
   - Form 55-102F2 auto-populated:
     - Insider: Director name
     - Company: [company]
     - Date: [trade date]
     - Security: Common shares
     - Price: $50
     - Quantity: 10,000
     - Transaction: Purchase
     - Shares before: 50,000 → After: 60,000 (12% ownership change)

3. **Form Review** (Day 3):
   - Director reviews form via DocuSign link
   - Verifies data is correct
   - E-signs

4. **SEDI Submission** (Day 4):
   - Corporate Secretary submits to SEDI
   - IPOReady API integration auto-submits + tracks status
   - Confirmation: "Filed. Reference: [SEDI ID]"

5. **Blackout Period** (Day 4+):
   - IPOReady auto-blocks insider trading window for this director
   - Next permitted trade date: 2 days after earnings announcement (Q2)

6. **Audit Trail**:
   - Form stored in audit evidence repo
   - Full history: Trade date → Alert → Form pre-pop → Director sign → Filing → SEDI confirmation

---

## Questions for Product/Engineering Review

1. **Scope:** Should we build all 4 domains (SOX 404, disclosure, insider, audit prep) in Phase 2, or prioritize 1-2?
2. **Integrations:** Which ERP systems are most critical first? (QuickBooks, NetSuite, SAP?)
3. **Pricing:** Should Listed Services have separate pricing tiers (Basic, Pro, Enterprise) or single tier?
4. **Go-to-market:** Do we soft-launch to existing IPOReady customers or do full go-to-market day 1?
5. **Patent:** Should we file provisional patent now (before full build) or wait until product is live?

---

**Document Version:** 1.0  
**Last Updated:** June 7, 2026  
**Approval Status:** ⏳ Pending (Engineering + Product review)
