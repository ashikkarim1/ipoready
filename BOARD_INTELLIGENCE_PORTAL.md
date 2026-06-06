# Board Intelligence Portal (NEXT-GEN)
## "Board-Ready in 5 Minutes"

**Design Status:** Approved for Phase 2 Implementation  
**Version:** 1.0  
**Last Updated:** June 2026  
**Location:** `/src/app/dashboard/board-intelligence/page.tsx`

---

## Executive Overview

The Board Intelligence Portal is a real-time executive dashboard designed for board directors and C-suite executives to achieve complete IPO readiness visibility in under 5 minutes. It replaces manual status updates with automated, data-driven insights.

### Key Design Principle
**"You should never be surprised in a board meeting."**

---

## 1. PAGE LAYOUT & STRUCTURE

### 1.1 Hero Section (Top Half - Immediate Understanding)
**Goal:** Answer the question "Are we ready to list?" in the first 30 seconds.

```
┌─────────────────────────────────────────────────────────────┐
│ READINESS SUMMARY                                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Ready to List? ████████░  72%                              │
│  Status: ON TRACK for Sept 2026 launch                      │
│                                                               │
│  RISK HEAT MAP (5 Categories):                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Corporate │Financial │  Market  │  Legal   │Operations│  │
│  │   85%    │   78%    │   62%    │   68%    │   55%    │  │
│  │   🟢     │   🟢     │   🟡     │   🟡     │   🔴     │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                               │
│  KEY MESSAGE: "3 things need fixing before Sept launch"     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Main readiness progress ring (CSS circular progress)
- Status badge with emoji traffic light
- Five category risk heat map with color-coded circles
- 1-2 sentence key message

### 1.2 Category Deep-Dives (Expandable Sections)
**Goal:** Drill down into specific areas without overwhelming the user.

Each category expands to show:

```
┌─────────────────────────────────────────────────────────────┐
│ Financial Controls  ▼                              78%  🟢   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase Status:                                              │
│  ├─ Audit Status: 90% complete ✓                           │
│  │  └─ 2 findings open (both low-risk)                     │
│  │  └─ Remediation expected July 15                        │
│  │                                                           │
│  ├─ SOX Readiness: 75% complete ⏳                          │
│  │  └─ Control testing in progress (3 weeks remaining)    │
│  │  └─ 1 control weakness flagged (remediation plan OK)   │
│  │                                                           │
│  ├─ Financial Close: 82% complete ✓                        │
│  │  └─ June close on track for June 28 delivery           │
│  │  └─ No blockers                                         │
│  │                                                           │
│  Trend (Past 30 Days):                                      │
│  68% → 70% → 75% → 78%  ↗️ IMPROVING (+5% this month)    │
│                                                               │
│  Actions Needed:                                            │
│  ☐ Board to review audit findings (meeting June 27)       │
│  ☐ CFO to present SOX control remediation plan            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Expandable Sections (5 total):**
1. **Corporate Governance** (85%)
   - PACE score status
   - Board composition readiness
   - Committee effectiveness
   - Document completion %

2. **Financial Controls** (78%)
   - Audit status & findings
   - SOX readiness assessment
   - Financial close cycle
   - Accounting team capacity

3. **Market Readiness** (62%) ⚠️
   - Valuation & investor appetite
   - Peer positioning analysis
   - Narrative alignment
   - Analyst coverage gaps

4. **Legal/Compliance** (68%) ⚠️
   - SEC filing status
   - State regulatory compliance
   - Advisor alignment
   - Litigation summary

5. **Operations & Risk** (55%) 🔴
   - Critical path tracking
   - Red flags & escalations
   - Dependency blockers
   - Timeline impact analysis

### 1.3 Action Items Section
**Goal:** Drive accountability and decision-making.

```
┌─────────────────────────────────────────────────────────────┐
│ ACTIONS FOR BOARD                                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CRITICAL (3 decisions needed):                              │
│  1. ☐ Approve audit findings (Resolution vote: June 27)    │
│     Owner: Board Chair | Meeting: Board Meeting June 27    │
│                                                               │
│  2. ☐ Approve IPO launch timing (Sept vs Jan 2027)         │
│     Owner: CEO & CFO | Meeting: Board Meeting June 27      │
│     Impact: Market timing + investor roadshow prep         │
│                                                               │
│  3. ☐ Review insider trading policy (Required for S-1)    │
│     Owner: General Counsel | Meeting: Committee June 20    │
│     Deadline: June 30 to stay on critical path            │
│                                                               │
│  HIGH PRIORITY (5 items):                                   │
│  • CFO to present SOX control remediation status          │
│  • Complete PIF forms (3 directors — 7 days overdue)     │
│  • Finalize valuation study (decision deadline June 15)   │
│  • Auditor to present audit findings              (Jun 27) │
│  • Market roadshow logistics team kickoff        (Jun 20)  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Trends & Velocity Section
**Goal:** Show progress and identify at-risk phases.

```
┌─────────────────────────────────────────────────────────────┐
│ READINESS TRENDS (Past 8 Weeks)                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Overall Readiness:    60% → 62% → 65% → 68% → 70% → 72%  │
│                        ↗️ STEADY (improving +2% per week)   │
│                                                               │
│  By Category (4-week change):                               │
│  Corporate:     🟢 Stable      (85% → 85%)                 │
│  Financial:     🟢 Improving   (72% → 78% +6%)             │
│  Market:        🔴 Declining   (75% → 62% -13%)            │
│  Legal:         🟡 At Risk     (95% → 68% -27%)            │
│  Operations:    🟡 Improving   (48% → 55% +7%)             │
│                                                               │
│  ANALYSIS:                                                   │
│  ⚠️ Legal phase is SLIPPING (articles delayed 3 weeks)      │
│  → Remediation: Expedite state filing review by June 20    │
│  ⚠️ Market declining despite strong fundamentals            │
│  → Root cause: Pending valuation study decision            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. COLOR & STATUS CODING

### 2.1 Traffic Light System
```
🟢 GREEN   (80-100%) — On track, no action needed
🟡 YELLOW  (60-79%)  — At risk, requires monitoring
🔴 RED     (0-59%)   — Critical, immediate action required
⚫ GRAY    (No data) — Not applicable or not started
```

### 2.2 Implementation in Tailwind/CSS
```tsx
// Green states
<div className="bg-green-50 border-green-200 text-green-800">✓ On track</div>

// Yellow states
<div className="bg-yellow-50 border-yellow-200 text-yellow-800">⚠ At risk</div>

// Red states
<div className="bg-red-50 border-red-200 text-red-800">🔴 Critical</div>

// Status badges
<span className="inline-flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-green-500"></div>
  <span>85% — Corporate Governance</span>
</span>
```

---

## 3. DATA SOURCES & SCORING LOGIC

### 3.1 Category Scoring Formula
Each category's score is calculated from weighted sub-metrics:

```
CORPORATE GOVERNANCE SCORE = 
  (PACE_Completion × 0.40) + 
  (Board_Composition × 0.20) + 
  (Committee_Charters × 0.20) + 
  (Document_Upload × 0.20)

FINANCIAL CONTROLS SCORE = 
  (Audit_Completion × 0.35) + 
  (SOX_Readiness × 0.30) + 
  (Close_Cycle_Health × 0.20) + 
  (Team_Capacity × 0.15)

MARKET READINESS SCORE = 
  (Valuation_Consensus × 0.40) + 
  (Peer_Analysis × 0.25) + 
  (Narrative_Strength × 0.20) + 
  (Analyst_Coverage × 0.15)

LEGAL COMPLIANCE SCORE = 
  (SEC_Filing_Status × 0.35) + 
  (State_Compliance × 0.25) + 
  (Advisor_Alignment × 0.20) + 
  (Contingencies × 0.20)

OPERATIONS RISK SCORE = 
  (Critical_Path_Health × 0.35) + 
  (Blocker_Count × 0.30) + 
  (Timeline_Pressure × 0.20) + 
  (Dependency_Map × 0.15)

OVERALL READINESS = Average(All 5 Categories)
```

### 3.2 Data Sources by Category

| Category | Data Source | Update Frequency |
|----------|-------------|------------------|
| **Corporate Governance** | PACE completion tracker, Board database, Committee charter repo | Daily |
| **Financial Controls** | Audit tracker (Workiva), SOX control matrix, Close calendar | Daily |
| **Market Readiness** | Valuation studies (Carta), Peer comp database, Investor feedback | 2x Weekly |
| **Legal Compliance** | SEC filing tracker, State regulatory checklist, Legal calendar | Daily |
| **Operations & Risk** | Critical path tracker, Issue log, Dependency matrix | Real-time |

### 3.3 Automatic Red Flag Detection

Triggers that escalate a category:
- Any metric < 50% → Red flag automatically set
- Velocity declining 3+ consecutive weeks → "At-risk phase"
- Critical path item overdue > 7 days → "Blocker escalation"
- New litigation filed → "Contingency alert"
- External news event (competitor, regulatory) → "Market alert"

---

## 4. INTERACTIVE FEATURES

### 4.1 Expandable Category Deep-Dives
- Click category card → expands in-place to show sub-metrics
- Smooth animation (Framer Motion)
- Shows: current %, trend, blockers, action items
- Collapse with X button or click elsewhere

### 4.2 Hover States
```tsx
// Category card hover
<div className="hover:bg-gray-50 cursor-pointer transition-colors">
  // Shows subtle background lift + shadow
</div>

// Metric detail hover
<div className="group hover:bg-blue-50 px-3 py-2 rounded">
  // Shows tooltip with "Why this matters" explanation
</div>
```

### 4.3 Action Item Interactions
- Checkbox to mark board action as "acknowledged"
- Click owner name → open team directory contact card
- Click meeting date → add to calendar
- "Send reminder" button → auto-email owner

### 4.4 Export / Share Features
```
┌─ [⋯] MORE ──────────────────────────┐
│ ☐ Download as PDF                   │
│ ☐ Email to board (with metrics)    │
│ ☐ Share snapshot to investors       │
│ ☐ Print board book section          │
└─────────────────────────────────────┘
```

---

## 5. MOBILE RESPONSIVE DESIGN

### 5.1 Desktop (1920px+)
- Full heat map visible
- 5 expandable categories side-by-side layout option
- All metrics visible at once

### 5.2 Tablet (768px - 1024px)
- Heat map stacked vertically
- Categories in 2x2 + 1 grid
- Metrics in accordion

### 5.3 Mobile (< 768px)
- Full-screen accordion layout
- Heat map as vertical status bars
- Action items in collapsed list view
- Trends as simple up/down arrows

---

## 6. REAL-TIME UPDATES & NOTIFICATIONS

### 6.1 Auto-Refresh Logic
- Page auto-refreshes every 5 minutes (silent background)
- Show "Last updated: 2 minutes ago" timestamp
- If category score changes > 5%, show animated badge: "📊 Updated"

### 6.2 Board Notifications
When category drops below 60%:
- Real-time banner at top: "⚠️ Operations readiness dropped to 55%"
- Toast notification to board chair + CEO
- Email notification with 1-click "review" link

### 6.3 Pre-Meeting Digest
Auto-generated 1 hour before board meeting:
- Email to all board members
- Subject: "IPOReady Status: Before Your June 27 Meeting"
- Contains executive summary + action items + trend chart
- Links to full board portal

---

## 7. TECHNICAL IMPLEMENTATION

### 7.1 File Structure
```
/src/app/dashboard/board-intelligence/
├── page.tsx                                (Main page)
├── layout.tsx                              (Breadcrumb + nav)
├── components/
│   ├── BoardReadinessSummary.tsx          (Hero section)
│   ├── CategoryCard.tsx                   (Expandable category)
│   ├── HeatMap.tsx                        (5-circle heat map)
│   ├── ActionItemsList.tsx                (Board actions)
│   ├── TrendsChart.tsx                    (8-week trend chart)
│   ├── MetricDetail.tsx                   (Hover detail card)
│   └── ExportMenu.tsx                     (PDF/email/share)
└── lib/
    ├── scoring.ts                         (Scoring logic)
    ├── data-aggregation.ts               (Data source sync)
    └── alerts.ts                         (Red flag detection)
```

### 7.2 Component Props

```typescript
// Category Card Component
interface CategoryCardProps {
  name: 'corporate' | 'financial' | 'market' | 'legal' | 'operations'
  score: number  // 0-100
  trend: 'up' | 'down' | 'stable'
  trendPercent: number // +5%, -3%, etc
  metrics: Metric[]
  blockers: Blocker[]
  actionItems: ActionItem[]
  isExpanded: boolean
  onToggle: () => void
}

interface Metric {
  label: string
  value: string
  percent: number
  status: 'complete' | 'in_progress' | 'blocked'
}

interface Blocker {
  id: string
  title: string
  daysOverdue: number
  owner: string
  impact: 'high' | 'medium' | 'low'
}

interface ActionItem {
  id: string
  title: string
  owner: string
  ownerEmail: string
  meeting?: string
  deadline: string
  priority: 'critical' | 'high' | 'medium'
  acknowledged: boolean
}
```

### 7.3 API Endpoints (New)

```typescript
// Get board readiness snapshot
GET /api/board-intelligence/readiness
Response: {
  overall: number
  categories: {
    corporate: { score: number, trend: string, percent_change: number }
    financial: { score: number, trend: string, percent_change: number }
    ...
  }
  blockers: Blocker[]
  actionItems: ActionItem[]
  trends: TrendData[]
  lastUpdated: string
}

// Get category deep-dive
GET /api/board-intelligence/category/:name
Response: {
  score: number
  metrics: Metric[]
  blockers: Blocker[]
  analysis: string // AI-generated summary
  recommendations: string[]
}

// Mark action item as acknowledged
POST /api/board-intelligence/actions/:id/acknowledge
Response: { success: boolean }

// Export board snapshot
POST /api/board-intelligence/export
Params: { format: 'pdf' | 'json', includeMetrics: boolean }
Response: { url: string }
```

### 7.4 Database Schema (Minimal Addition)

New table to track board action items:
```sql
CREATE TABLE board_action_items (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  priority 'critical' | 'high' | 'medium',
  category 'corporate' | 'financial' | 'market' | 'legal' | 'operations',
  meeting_date DATE,
  deadline DATE NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_board_actions_company ON board_action_items(company_id);
CREATE INDEX idx_board_actions_deadline ON board_action_items(deadline);
```

Scoring snapshot table (for trend tracking):
```sql
CREATE TABLE readiness_snapshots (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  snapshot_date DATE DEFAULT today(),
  overall_score INTEGER,
  corporate_score INTEGER,
  financial_score INTEGER,
  market_score INTEGER,
  legal_score INTEGER,
  operations_score INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_snapshots_company_date ON readiness_snapshots(company_id, snapshot_date);
```

---

## 8. DESIGN SPECIFICATIONS

### 8.1 Typography
- **Page Title:** 32px bold (#1A1A1A)
- **Section Headers:** 18px semibold (#1A1A1A)
- **Metric Labels:** 14px regular (#717171)
- **Metric Values:** 24px bold (#1A1A1A)
- **Helper Text:** 12px regular (#9A9A9A)

### 8.2 Spacing & Layout
- Page padding: 24px
- Card padding: 20px
- Section gaps: 24px
- Metric gaps: 16px

### 8.3 Animation (Framer Motion)
```tsx
// Category expand animation
animate={{ height: isExpanded ? 'auto' : 0 }}
transition={{ duration: 0.3 }}

// Badge update animation
animate={{ scale: [1, 1.1, 1] }}
transition={{ duration: 0.5 }}

// Trend arrow animation (up/down/stable)
animate={{ rotate: trend === 'up' ? 0 : trend === 'down' ? 180 : 0 }}
```

### 8.4 Icons
- Heat map: Colored circles (CSS)
- Trends: TrendingUp, TrendingDown from lucide-react
- Actions: CheckCircle2, AlertCircle, Clock
- Blockers: Flame (high impact), AlertOctagon (medium), Info (low)

---

## 9. SUCCESS METRICS

| Metric | Target | Baseline |
|--------|--------|----------|
| Board adoption | 100% | - |
| Time to find key info | < 2 min | 15 min (manual) |
| Action item completion rate | 95% | 70% |
| Board meeting time on readiness | -60% | - |
| Early escalation rate | 95% | 40% |
| Board confidence score | 8.5+/10 | - |

---

## 10. PHASED ROLLOUT

### Phase 2A (Weeks 1-2): MVP
- Core readiness summary
- 5 category cards with static data
- Action items list
- Basic trend chart

### Phase 2B (Weeks 3-4): Intelligence Layer
- Real-time scoring from data sources
- AI-generated analysis per category
- Automatic red flag detection
- Pre-meeting email digest

### Phase 2C (Weeks 5-6): Advanced Features
- Predictive analytics ("on track for Sept?")
- Scenario planning ("if we skip audit findings...")
- Board notifications & alerts
- Full export/share functionality

---

## 11. EXAMPLE USER FLOWS

### Flow 1: Monday Morning Board Chair Review
1. Board chair logs in at 8am
2. Dashboard auto-loads with latest snapshot (updated at 6am daily)
3. Scans heat map in 15 seconds: sees "72% ready, market declining"
4. Clicks "Market Readiness" to expand
5. Reads: "Valuation study decision pending"
6. Clicks "Action Items" and sees "Approve valuation range" is due in 3 days
7. Forwards email snapshot to CEO asking "where are we on the decision?"
8. Sets reminder for June 20 meeting

**Total time: < 5 minutes**

### Flow 2: CFO Pre-Board Meeting Prep
1. CFO receives "Board Meeting Tomorrow" email
2. Email contains pre-generated executive summary with:
   - Readiness: 72%
   - 3 key risks
   - 5 action items CFO owns
3. CFO opens dashboard to review Financial Controls in detail
4. Sees "SOX testing 75% complete, 1 control weakness"
5. Clicks control weakness to see remediation timeline
6. Takes screenshot for board book
7. Adds talking points to presentation

**Total time: < 10 minutes**

### Flow 3: General Counsel During Legal Risk Escalation
1. GC gets notification: "Legal/Compliance dropped to 62%"
2. Opens dashboard and clicks "Legal/Compliance"
3. Reads: "Articles delayed 3 weeks, SEC filing review pending"
4. Sees own action items flagged red: "Final articles review due June 20"
5. Calls securities counsel to discuss expedited timeline
6. Updates action item status to "in_progress"
7. Dashboard auto-updates and re-scores category

**Total time: < 10 minutes**

---

## 12. LAUNCH READINESS CHECKLIST

- [ ] Database schema created (board_action_items, readiness_snapshots)
- [ ] Scoring logic implemented (5 categories)
- [ ] API endpoints created (readiness, category, actions, export)
- [ ] React components built (8 components listed)
- [ ] Framer Motion animations integrated
- [ ] Mobile responsive design tested
- [ ] Real-time auto-refresh implemented
- [ ] Pre-meeting email digest script created
- [ ] Export PDF functionality integrated
- [ ] Board notifications implemented
- [ ] Testing completed (unit, integration, E2E)
- [ ] Performance optimized (< 2s load time)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security review (data access, notifications)
- [ ] Documentation completed
- [ ] Board training slides created
- [ ] Rollout schedule confirmed

---

## 13. RELATED ASSETS

- **BOARD_READINESS_INTELLIGENCE.md** — Strategic overview & patent claim
- **DASHBOARD_DESIGN_SYSTEM.md** — Color palette & typography standards
- **Phase 1 Sprint** — PACE™ scoring, document management, company context builder
- **Phase 2 Roadmap** — Full feature list, timeline, resource requirements

---

**Next Step:** Review with product & engineering team, then kick off Phase 2A (MVP) implementation.
