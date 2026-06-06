# CEO Command Center Dashboard

**Version:** 1.0  
**Date:** June 7, 2026  
**Status:** Design Specification (Ready for Implementation)

---

## Executive Summary

The **CEO Command Center** is a single-page dashboard that gives a CEO/CFO a complete 360-degree view of their IPO readiness at a glance. It's designed for the morning standup—one place to see everything that matters, make quick decisions, and drill down only when needed.

### The Problem It Solves

- **Information Overload:** CEOs juggle 180+ IPO tasks across 8+ phases—where do they start?
- **Hidden Critical Issues:** Risk items are buried in checklists; they don't surface until it's too late
- **Decision Paralysis:** No single view of the critical path; can't prioritize fast
- **Lack of Visibility:** Where is the deal actually at risk? What needs CEO action vs. delegation?

### What Success Looks Like

1. **One Dashboard Opens = Full Clarity:** CEO sees overall readiness, timeline, and top 3 risks in <3 seconds
2. **Drill-Down on Demand:** Tap any section to get full detail—no need to navigate elsewhere
3. **Action Items Clear:** The CEO knows exactly what *they* need to decide/do today
4. **Real-Time Updates:** Board minutes added → alert appears; status changes → readiness % updates instantly

---

## Design Layout: Three Tiers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CEO COMMAND CENTER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TIER 1: YOUR IPO STATUS (Card 1)                                   │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ Overall Readiness: 72%  │  Timeline: Sept 6, 2026 (18w)  │       │
│  │ Critical Path: 3 at risk │  Status: On track (green)     │       │
│  │                                                           │       │
│  │ [ONE-TAP DRILL-DOWN]                                      │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TIER 2: CRITICAL ALERTS (Card 2)                                   │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ 🔴 Articles of Incorporation (Legal) — 3 weeks overdue   │       │
│  │    Impact: Delays legal phase start, affects timeline    │       │
│  │    Action: Call counsel TODAY                            │       │
│  │                                                           │       │
│  │ 🟡 Audit Findings: 2 open, 1 remediation due June 20    │       │
│  │    Impact: Blocks SOX compliance sign-off                │       │
│  │    Action: Board approval needed                         │       │
│  │                                                           │       │
│  │ 🟡 Valuation Debate (CEO vs Underwriters)               │       │
│  │    Impact: Affects float calculation and pricing         │       │
│  │    Action: Schedule discussion with investment banker    │       │
│  │                                                           │       │
│  │ 🟢 Governance: 95% complete, on track                   │       │
│  │    Impact: None (meeting commitments)                    │       │
│  │    Action: Weekly review check-in                        │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TIER 3: YOUR ACTIONS (Card 3)                                      │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ DECISION REQUIRED:                                        │       │
│  │ → Launch Sept 6 (risky) OR delay to Jan (safe)?          │       │
│  │   Recommendation: Sept, BUT ensure these 3 items close   │       │
│  │                                                           │       │
│  │ YOUR TO-DO LIST:                                          │       │
│  │ ☐ [URGENT] Call legal counsel (articles overdue)         │       │
│  │ ☐ [TODAY] Review audit board memo (2 findings)           │       │
│  │ ☐ [THIS WEEK] Board call: valuation + timeline decision  │       │
│  │ ☐ [NEXT WEEK] Sign-off on market materials               │       │
│  │                                                           │       │
│  │ [VIEW FULL TASK LIST] [DELEGATE WORK]                    │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Card-by-Card Specifications

### CARD 1: "Your IPO Status" (Top Status Bar)

**Purpose:** 3-second snapshot of where the deal is.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  YOUR IPO STATUS                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Overall Readiness:        [████████░░] 72%        │
│  Timeline Status:          On track ✓               │
│                                                      │
│  Target Listing:           Sept 6, 2026 (18 weeks) │
│  Confidence:               High (±1 week)           │
│                                                      │
│  Critical Path Items:      3 at risk 🔴              │
│  All Items Status:         23 on track, 3 at risk   │
│                                                      │
│  [EXPAND READINESS DETAILS →]                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Data Sources:**
- `pace_scores` table: overall readiness percentage
- `pace_score_history` table: timeline confidence + trend
- `pace_sequencing_alerts` table: count of critical/at_risk items
- `tasks` table: count of on_track vs at_risk vs blocked

**Interactive Behaviors:**
- Tapping "EXPAND READINESS DETAILS" opens a modal with:
  - Readiness breakdown by phase (8 phases shown as 8 bars)
  - Why we're confident in this timeline (probability distribution)
  - Historical trend (line chart last 30 days)
  - What would move us to 80%? (Next milestone matrix)

**Color Coding:**
- Green: 70-100% readiness
- Yellow: 50-69%
- Red: <50%

---

### CARD 2: "Critical Alerts" (Middle Risk/Issues)

**Purpose:** Bubble up the exact issues that could derail the deal.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  CRITICAL ALERTS & RISKS                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [SEVERITY FILTER: All | Critical | Warning]                 │
│                                                               │
│  🔴 CRITICAL: Articles of Incorporation (Legal)              │
│  ├─ Status: 3 weeks overdue (due was May 29)                │
│  ├─ Phase: Legal Documentation                              │
│  ├─ Blocker: Residential history from Dir #2                │
│  ├─ Impact: Delays legal phase, compresses timeline         │
│  ├─ Owner: Sarah Chen (CEO) — marc@techcorp.com             │
│  ├─ Assigned To: Legal Counsel [call-action]                │
│  ├─ Why This Matters: TSXV Policy 3.3 requires forms 10 biz │
│  │                   days before listing app. Without forms, │
│  │                   no approval. This is critical path.     │
│  ├─ Resolution Steps:                                        │
│  │  → Get Dir #2 residential history from past 10 years      │
│  │  → Counsel reviews all 3 forms                           │
│  │  → Submit to TSXV within 48 hours                        │
│  └─ [ESCALATE] [MARK RESOLVED] [VIEW RULES]                 │
│                                                               │
│  🟡 HIGH: Audit Findings — 2 open, 1 due June 20            │
│  ├─ Status: 13 days to remediation due date                │
│  ├─ Phase: Financial Audit                                  │
│  ├─ Findings: Internal controls weakness (minor)            │
│  ├─ Impact: Blocks audit sign-off, delays next funding      │
│  ├─ Owner: CFO (John Lee)                                    │
│  ├─ Why This Matters: Board must approve all remediation     │
│  │                   plans. Audit cannot conclude without    │
│  │                   board sign-off.                         │
│  ├─ Action: Board meeting before June 20 to approve         │
│  └─ [SCHEDULE BOARD MEETING] [VIEW AUDIT MEMO]              │
│                                                               │
│  🟡 MEDIUM: Valuation Debate (Finance/Markets)              │
│  ├─ Status: Unresolved — blocking pricing strategy          │
│  ├─ Phase: Capital Markets (Pre-Pricing)                    │
│  ├─ Issue: CEO estimates $500M, underwriters say $450M      │
│  ├─ Impact: Affects float requirement & float %, IPO size   │
│  ├─ Why This Matters: If float < 25% of shares, NASDAQ      │
│  │                   rejects listing. Gets worse at lower    │
│  │                   valuations. Must resolve this week.     │
│  ├─ Recommendation: Schedule call with investment banker    │
│  └─ [OPEN VALUATION ANALYSIS] [SCHEDULE MEETING]            │
│                                                               │
│  🟢 ON TRACK: Governance Framework                           │
│  ├─ Status: 95% complete (only final policy review left)    │
│  ├─ Phase: Corporate Restructuring                          │
│  ├─ Next Step: Final board approval (scheduled June 22)     │
│  └─ [NO ACTION REQUIRED]                                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Data Sources:**
- `pace_sequencing_alerts` table: all alerts with rule, severity, remediation
- `tasks` table: filter for status = 'overdue' or 'at_risk'
- `companies` table: company context
- `users` table: owner info
- Custom logic: impact assessment per phase dependencies

**Interactive Behaviors:**
- Click alert → opens side panel with:
  - Full remediation plan (step-by-step)
  - Regulatory reference (e.g., "TSXV Policy 3.3")
  - Owner/assignee and contact
  - Suggested next action button (e.g., "[CALL COUNSEL]", "[SCHEDULE BOARD MEETING]")
  - Historical timeline (when did this alert first appear?)
- "[ESCALATE]" button: marks as requiring CEO immediate attention, sends email to relevant team
- "[MARK RESOLVED]" button: closes alert (with optional timestamp)
- Filter by severity: all, critical only, warnings only

**Color Coding:**
- 🔴 Red: Critical (≥3 weeks overdue, or blocks launch, or regulatory violation)
- 🟡 Yellow: High (1-3 weeks overdue, or affects funding, or major decision pending)
- 🟢 Green: On track (all milestones met, no blockers)

---

### CARD 3: "Your Actions" (Bottom Call-to-Action)

**Purpose:** Tell the CEO exactly what to do today/this week.

**Layout:**

```
┌───────────────────────────────────────────────────────────┐
│  YOUR ACTIONS & DECISIONS                                 │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  🎯 DECISION REQUIRED:                                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ LAUNCH DATE: Sept 6, 2026 (risky) VS Jan 15, 2027   │ │
│  │              (safe)?                                │ │
│  │                                                      │ │
│  │ Our Recommendation:                                 │ │
│  │ ✓ Go for Sept 6 IF you commit to close these 3:     │ │
│  │   1. Articles of Incorporation (Legal) — 3 wks OD   │ │
│  │   2. Audit findings remediation (Finance) — 13 days │ │
│  │   3. Valuation alignment (Markets) — this week       │ │
│  │                                                      │ │
│  │ ❌ If you can't move on these 3 → slip to January    │ │
│  │                                                      │ │
│  │ [SCHEDULE BOARD CALL] [VIEW RISK ANALYSIS]          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  📋 YOUR TO-DO LIST (This Week):                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ ☐ TODAY: Call legal counsel about articles forms    │ │
│  │         Contact: david@legaleye.com | (555) 123-456 │ │
│  │         Context: 3 weeks overdue, critical path     │ │
│  │         Est. time: 30 mins                          │ │
│  │         [CALL NOW] [SEND EMAIL] [SNOOZE 24H]       │ │
│  │                                                      │ │
│  │ ☐ TOMORROW: Review audit board memo (2 findings)    │ │
│  │           Files: audit-memo-june-2026.pdf           │ │
│  │           Context: Board approval needed before 6/20 │ │
│  │           Est. time: 20 mins                        │ │
│  │           [OPEN FILE] [DELEGATE TO CFO] [DONE]      │ │
│  │                                                      │ │
│  │ ☐ THIS WEEK: Board call - valuation + timeline      │ │
│  │            Attendees: Board members (6), Bankers (2) │ │
│  │            Agenda: Discuss $450M vs $500M valuation │ │
│  │            Est. time: 1 hour                        │ │
│  │            [SCHEDULE MEETING] [SEND AGENDA]         │ │
│  │                                                      │ │
│  │ ☐ NEXT WEEK: Sign-off on market materials           │ │
│  │            Files: management-presentation.pptx       │ │
│  │            Context: Investor roadshow prep          │ │
│  │            Est. time: 2 hours                       │ │
│  │            [REVIEW NOW] [SNOOZE UNTIL MONDAY]       │ │
│  │                                                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  [VIEW FULL TASK LIST] [DELEGATE WORK] [EXPORT AGENDA]   │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

**Data Sources:**
- `tasks` table: filter for status = 'open' AND assigned_to = current_user
- `pace_sequencing_alerts` table: highest-severity unresolved alerts
- `companies` table: target listing date + confidence
- `users` table: team member contact info

**Interactive Behaviors:**
- "[CALL NOW]" → opens phone dialer (mobile) or shows copy-to-clipboard phone number (desktop)
- "[SEND EMAIL]" → opens email draft pre-filled with task context
- "[OPEN FILE]" → opens document viewer (PDF, PPTX, etc.)
- "[DELEGATE TO CFO]" → reassigns task to CFO, notifies them
- "[SCHEDULE MEETING]" → opens calendar, pre-fills attendees based on task phase
- "[VIEW FULL TASK LIST]" → navigates to /dashboard/checklist with filters applied
- "[EXPORT AGENDA]" → generates downloadable agenda document

**Visual Priority:**
- 🔴 Red tasks (urgent, overdue, critical) appear first
- 🟡 Yellow tasks (this week, scheduled) appear second
- Gray tasks (next week+) appear collapsed or at bottom

---

## Data Flow & Architecture

### Real-Time Updates

The CEO Command Center updates in real-time as:
1. **Task status changes** (task completed, moved to at_risk, etc.)
2. **Alerts resolved** (legal forms submitted, audit approved, etc.)
3. **New documents added** (affects PACE score)
4. **Board minutes logged** (affects audit/governance status)

**Implementation:**
- WebSocket connection via NextAuth session
- Server-Sent Events (SSE) from `/api/cc/stream` endpoint
- Cache invalidation via React Query with `staleTime: 5m`
- Optimistic updates on user actions (button clicks)

### Data Schema

**Tables Referenced:**

1. **companies**
   - `id`, `name`, `exchange`, `listing_type`
   - `target_listing_date`, `created_at`, `updated_at`

2. **pace_scores**
   - `id`, `company_id`, `overall_readiness`, `phase_breakdowns` (JSON)
   - `calculated_at`, `confidence_interval` (±weeks)

3. **pace_score_history**
   - `id`, `company_id`, `pace_score`, `recorded_at`
   - (For trend visualization)

4. **pace_sequencing_alerts**
   - `id`, `company_id`, `rule` (human name), `severity` (error/warning/critical)
   - `remediation` (steps to fix), `resolved_at`

5. **tasks**
   - `id`, `company_id`, `title`, `phase`, `status` (open/completed/overdue/at_risk/blocked)
   - `assigned_to` (user_id), `due_date`, `priority`

6. **users**
   - `id`, `company_id`, `name`, `email`, `phone`, `role`

7. **unified_documents** (phase-aware)
   - `id`, `company_id`, `document_type`, `phase`
   - `content`, `upload_date`, `processed_at`

**New Tables for CEO Command Center:**

```sql
-- Stores prioritized CEO action items
CREATE TABLE ceo_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  action_type VARCHAR(50),        -- 'decision' | 'review' | 'call' | 'approve'
  priority VARCHAR(20),           -- 'urgent' | 'high' | 'normal'
  description TEXT,
  due_date DATE,
  task_id UUID REFERENCES tasks(id),
  alert_id UUID REFERENCES pace_sequencing_alerts(id),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stores context for each alert (impacts, regulations, etc.)
CREATE TABLE alert_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES pace_sequencing_alerts(id),
  impact_description TEXT,
  regulatory_reference VARCHAR(255),
  suggested_action TEXT,
  owner_email VARCHAR(255),
  escalation_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```
GET /api/cc/status
  Returns: overall readiness %, timeline, critical count
  Response: { readiness: 72, timeline: "Sept 6, 2026", criticalCount: 3 }

GET /api/cc/alerts
  Returns: all critical alerts with context
  Params: ?severity=critical,warning&limit=10
  Response: [{
    id, rule, severity, remediation, impact, owner, escalationLevel
  }]

GET /api/cc/actions
  Returns: CEO's to-do list prioritized
  Response: [{
    actionType, priority, description, dueDate, estimatedTime, actionUrl
  }]

GET /api/cc/stream
  Returns: Server-Sent Events stream for real-time updates
  Emits: { type: 'alert_resolved' | 'task_status_changed' | ... }

POST /api/cc/actions/:id/complete
  Marks a CEO action as done
  Response: { success: true }

POST /api/cc/alerts/:id/escalate
  Escalates an alert (sends email to team)
  Response: { success: true, emailsSent: [...] }
```

---

## Visual Design Details

### Color Palette

```
🔴 Critical Red:    #E8312A (existing IPOReady accent)
🟡 Warning Yellow:  #F59E0B (from Tailwind)
🟢 Success Green:   #10B981 (from Tailwind)
⚪ Neutral Gray:    #6B7280 (from Tailwind)
```

### Typography

- **Title (Card Headers):** 18px, font-bold, text-nav (#1F2937)
- **Status Numbers:** 32px, font-black, accent color
- **Item Title (Alert/Action):** 14px, font-semibold, text-nav
- **Body Text:** 12-13px, font-normal, text-text-muted (#6B7280)
- **Action Links:** 12px, font-semibold, text-accent (red)

### Spacing & Layout

- Card container: `max-w-6xl mx-auto px-4 py-6`
- Card padding: `p-6`
- Vertical gap between cards: `my-6`
- Alert item padding: `py-4 border-b`
- Action item padding: `py-3 px-4 bg-gray-50 rounded`

### Responsive Design

- **Desktop (1024px+):** All 3 cards visible, alerts in 2-column grid
- **Tablet (768px+):** Cards stack, alerts in 1 column, actions collapsible
- **Mobile (<768px):** Full-screen cards, slide between with tabs/swipe

---

## Example Data Flow: A Real Scenario

**Scenario:** Articles of Incorporation overdue → legal forms arrived → CEO sees alert resolved

```
Timeline:
─────────

T-0: 08:00 AM (June 7, 2026)
  • CEO opens Command Center dashboard
  • Alert shows: "🔴 Articles of Incorporation - 3 weeks overdue"
  • Card 3 shows: "☐ TODAY: Call legal counsel"
  • CEO clicks [CALL NOW]

T-1: 09:30 AM
  • CEO calls legal counsel David Park
  • David confirms he'll get Director #2's residential history
  • System shows "In Progress" badge on alert

T-2: 11:45 AM
  • David submits completed forms to TSXV
  • System receives webhook: FormSubmitted event
  • Immediately: API endpoint /api/cc/alerts triggers
  • Dashboard updates:
    - Alert severity changes 🔴 → 🟡 (reduced risk)
    - Alert status: "In TSXV Review (5-7 business days)"
    - Card 3 action: ☑ Marked done
    - Overall readiness: recalculated from 72% → 74%

T-3: Instantaneous (WebSocket push)
  • Dashboard updates for all viewing instances:
    - Alert re-renders with new status
    - Readiness bar animates to 74%
    - Confetti animation? (optional, for morale)
    - Notification: "Great news! Articles forms submitted to TSXV"

T-4: Next morning (June 8)
  • CEO opens Command Center again
  • Articles alert is now in "TSXV Review" status (🟡)
  • Top 3 alerts now include: Audit findings, Valuation debate
  • Overall readiness + timeline unchanged (still "on track")
```

---

## Drill-Down Experiences

### Click "Expand Readiness Details"

Opens modal showing:

```
┌────────────────────────────────────────────────────────┐
│  YOUR IPO READINESS BREAKDOWN                           │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Overall PACE Score: 72%  (±3%)                        │
│  Confidence: High (85% probability of Sept 6 ±1 week)  │
│                                                         │
│  BY PHASE:                                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Pre-Planning:          [██████████░░░░░░] 73%   │  │
│  │ Corporate Restructuring: [████████░░░░░░░░░░] 48%│  │
│  │ Financial Audit:       [████░░░░░░░░░░░░░░░░] 20%│  │
│  │ Legal Documentation:   [░░░░░░░░░░░░░░░░░░░░]  0% │  │
│  │ Regulatory Filing:     [░░░░░░░░░░░░░░░░░░░░]  0% │  │
│  │ Marketing Roadshow:    [░░░░░░░░░░░░░░░░░░░░]  0% │  │
│  │ Listing Application:   [░░░░░░░░░░░░░░░░░░░░]  0% │  │
│  │ Post-Listing Prep:     [░░░░░░░░░░░░░░░░░░░░]  0% │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  TIMELINE PROJECTION:                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  50% confidence: Aug 20                          │  │
│  │  75% confidence: Sept 3                          │  │
│  │  90% confidence: Sept 13                         │  │
│  │                                                 │  │
│  │  Recommended launch date: Sept 6 (75% conf.)    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  READINESS TREND (Last 30 Days):                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │      ╱╲                                          │  │
│  │    ╱  ╲____                                      │  │
│  │   ╱       ╲╲__  ← You are here (72%)            │  │
│  │ ├─────────────────────────────────────────────   │  │
│  │ 60%           May 20         June 7             │  │
│  │                                                 │  │
│  │ Velocity: +0.8% per week (good, on pace)       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  WHAT WOULD MOVE YOU TO 80%?                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 1. Complete articles of incorporation (+5%)      │  │
│  │ 2. Resolve audit findings (+2%)                 │  │
│  │ 3. Begin legal documentation phase (+3%)        │  │
│  │                                                 │  │
│  │ Recommended order: 1 → 3 → 2                   │  │
│  │ (Legal doc should start NOW; audit can wait)   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [BACK] [EXPORT REPORT] [SHARE WITH BOARD]            │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Click on an Alert

Opens side panel showing:

```
┌────────────────────────────────────────────────────────┐
│  ARTICLES OF INCORPORATION — DETAILED VIEW              │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Status: 🔴 CRITICAL (3 weeks overdue)                 │
│  Phase: Legal Documentation                            │
│  Owner: Sarah Chen (CEO)                               │
│  Assigned to: Legal Counsel - David Park               │
│                                                         │
│  KEY FACTS:                                             │
│  ├─ Due: May 29, 2026                                  │
│  ├─ Today: June 7, 2026 (21 days overdue)              │
│  ├─ Blocker: Residential history from Director #2      │
│  └─ TSXV Requirement: Policy 3.3 requires 10 biz days  │
│      before listing app submission                      │
│                                                         │
│  IMPACT ASSESSMENT:                                     │
│  ├─ Critical Path: YES (blocks legal phase start)       │
│  ├─ Timeline Risk: HIGH (compresses final weeks)        │
│  ├─ Regulatory: MANDATORY (TSXV non-compliance)         │
│  └─ Probability of missing Sept 6: 40% if not resolved  │
│      by June 15                                         │
│                                                         │
│  REMEDIATION STEPS (In Progress):                       │
│  ☐ 1. Get residential history for 3 directors          │
│       Status: 2/3 completed                            │
│       Blocker: Dir #2 (David Park) slow to respond     │
│       Action: Call him TODAY                           │
│       Est. time: 30 mins                               │
│       [CALL DAVID]                                      │
│                                                         │
│  ☐ 2. Securities counsel reviews all forms             │
│       Status: Waiting for #1                           │
│       Est. time: 2 hours (after step 1)                │
│       [SCHEDULE WITH COUNSEL]                          │
│                                                         │
│  ☐ 3. Submit forms to TSXV                             │
│       Status: Not yet started                          │
│       Est. time: 1 hour (final submission)             │
│       [PREPARE SUBMISSION]                             │
│                                                         │
│  REGULATORY REFERENCE:                                  │
│  ├─ TSXV Policy 3.3 (Director Information Forms)       │
│  ├─ Form 2A (Personal Information Form)                │
│  └─ 10 business days before listing application        │
│      [VIEW FULL POLICY] [DOWNLOAD FORM]                │
│                                                         │
│  CONTACT INFO:                                          │
│  ├─ David Park (Legal Counsel)                         │
│  │  david@legaleye.com | (555) 123-4567               │
│  │  [CALL] [EMAIL] [TEXT]                              │
│  └─ TSXV Support                                        │
│     support@tsx.com | (800) 555-1111                   │
│                                                         │
│  ESCALATION:                                            │
│  ├─ Created: June 5, 2026 (2 days ago)                 │
│  ├─ Escalation Level: CEO notification sent (June 6)   │
│  └─ If not resolved by June 15 → Board notification    │
│     [MARK AS ESCALATED]                                │
│                                                         │
│  ACTIONS:                                               │
│  [CALL DAVID NOW] [SEND EMAIL] [MARK RESOLVED]         │
│  [SNOOZE 24H] [VIEW TASK] [CLOSE PANEL]                │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: MVP (Week 1-2)

1. Create `/app/dashboard/command-center/page.tsx`
2. Build Card 1: "Your IPO Status" with mock data
3. Build Card 2: "Critical Alerts" with 3 example alerts
4. Build Card 3: "Your Actions" with CEO to-do list
5. Wire up basic data flow from `pace_scores` and `pace_sequencing_alerts` tables
6. Add colors, spacing, responsive design

**Deliverable:** Single page, reads from DB, no real-time updates yet

### Phase 2: Real-Time & Interactivity (Week 3-4)

1. Implement WebSocket stream via `/api/cc/stream`
2. Add drill-down modals (readiness details, alert details)
3. Implement action buttons ([CALL NOW], [SCHEDULE], etc.)
4. Add real-time updates on task/alert changes
5. Implement alert severity filtering

**Deliverable:** Fully interactive, real-time updates, drill-downs work

### Phase 3: Reporting & Export (Week 5-6)

1. Add "[EXPORT AGENDA]" functionality (generates PDF/DOCX)
2. Add "[SHARE WITH BOARD]" (email board summary)
3. Implement search/filter by phase
4. Add historical view (what was the status 2 weeks ago?)

**Deliverable:** Export + sharing + history capabilities

---

## Design Rationale

### Why Three Tiers?

**Tier 1 (Status):** Answers "Where are we?" in <3 seconds  
**Tier 2 (Alerts):** Answers "What could go wrong?" with remediation steps  
**Tier 3 (Actions):** Answers "What do I do about it?" with exact next steps

This matches the CEO's decision-making process: assess → identify risks → take action.

### Why "Command Center" vs "Dashboard"?

- **Dashboard** = passive display of metrics
- **Command Center** = active control room where decisions are made

IPOReady's CEO tool is the latter: it's not just showing status, it's guiding the CEO toward decisions.

### Why Drill-Down vs All Details at Once?

- Mobile users can see top 3 risks instantly
- Desktop users can expand if needed
- Respects cognitive load: one decision at a time

---

## Success Metrics

1. **Time to Insight:** CEO opens dashboard → understands status & action items in <60 seconds ✓
2. **Action Completion:** CEO completes 80%+ of suggested actions within due date ✓
3. **Alert Accuracy:** <5% of alerts marked "false positive" by team ✓
4. **Real-Time Updates:** Alert resolved in system → dashboard updates within 5 seconds ✓
5. **Engagement:** CEO opens command center >3x per week (daily during IPO push) ✓

---

## Frequently Asked Questions

**Q: Why not show all 180+ tasks?**  
A: Cognitive overload. CEO needs decisions, not a task list. Use /dashboard/checklist for full detail.

**Q: How do we know which alerts are "critical"?**  
A: By impact + sequencing. If an item blocks critical path (legal, audit, governance), it's critical. If it's overdue >2 weeks and affects timeline, it's critical.

**Q: What if the CEO disagrees with the timeline?**  
A: They can override it (board decision). System then re-calculates alerts based on new timeline. E.g., "Slip to January" changes which alerts are critical.

**Q: Can we schedule automated "CEO briefings"?**  
A: Yes! Phase 2 feature: email CEO daily summary at 7 AM (with critical alerts only).

**Q: Who sees this dashboard?**  
A: CFO + CEO by default. Board members can view read-only version (no action buttons).

---

## File Structure

```
/src/app/dashboard/
├── command-center/
│   ├── page.tsx                    # Main dashboard page
│   ├── layout.tsx                  # Layout wrapper
│   └── components/
│       ├── StatusCard.tsx          # Card 1: Your IPO Status
│       ├── AlertsCard.tsx          # Card 2: Critical Alerts
│       ├── ActionsCard.tsx         # Card 3: Your Actions
│       ├── AlertDetail.tsx         # Side panel: Alert drill-down
│       ├── ReadinessModal.tsx      # Modal: Readiness breakdown
│       └── ActionButton.tsx        # Reusable action buttons
│
/src/lib/
├── cc-utils.ts                     # Helper functions (severity calc, etc.)
├── cc-api.ts                       # API client for CC endpoints
│
/src/db/
├── cc-queries.ts                   # SQL queries for CC data
│
/src/app/api/cc/
├── status/route.ts                 # GET /api/cc/status
├── alerts/route.ts                 # GET /api/cc/alerts
├── actions/route.ts                # GET /api/cc/actions
├── stream/route.ts                 # GET /api/cc/stream (SSE)
└── alerts/[id]/
    ├── escalate/route.ts           # POST /api/cc/alerts/[id]/escalate
    └── resolve/route.ts            # POST /api/cc/alerts/[id]/resolve
```

---

## Appendix: Sample Data (For Testing)

```typescript
// Sample: Company with 72% readiness
const sampleCompany = {
  id: 'company-1',
  name: 'TechCorp Inc.',
  exchange: 'TSXV',
  targetListingDate: '2026-09-06',
  readiness: 72,
  confidenceWeeks: 1,
};

// Sample: PACE Score
const samplePaceScore = {
  overallReadiness: 72,
  phases: {
    pre_planning: 100,
    corporate_restructuring: 48,
    financial_audit: 20,
    legal_documentation: 0,
    regulatory_filing: 0,
    marketing_roadshow: 0,
    listing_application: 0,
    post_listing_prep: 0,
  },
};

// Sample: Critical Alerts
const sampleAlerts = [
  {
    id: 'alert-1',
    rule: 'Articles of Incorporation Form 2A Missing',
    severity: 'critical',
    daysOverdue: 21,
    phase: 'Legal Documentation',
    impact: 'Blocks TSXV listing application',
    remediation: [
      'Get residential history for 3 directors',
      'Legal counsel reviews forms',
      'Submit to TSXV within 48 hours',
    ],
    owner: 'Sarah Chen',
    ownerEmail: 'sarah@techcorp.com',
    regulatoryReference: 'TSXV Policy 3.3, Form 2A',
  },
  // ... more alerts
];

// Sample: CEO Actions
const sampleActions = [
  {
    id: 'action-1',
    actionType: 'decision',
    priority: 'urgent',
    description: 'Launch Sept 6 (risky) or Jan 15 (safe)?',
    dueDate: '2026-06-15',
    estimatedTime: '2 hours',
  },
  // ... more actions
];
```

---

## Document History

| Version | Date       | Author       | Change                     |
|---------|------------|--------------|---------------------------|
| 1.0     | June 7     | Claude Code  | Initial design spec        |
|         |            |              |                            |

---

**End of Document**
