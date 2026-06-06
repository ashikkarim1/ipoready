# GC Legal Intelligence Dashboard - Visual & Reference Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│  📋 LEGAL INTELLIGENCE DASHBOARD                                                     │
│  Command center for IPO legal readiness and regulatory compliance                    │
│                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  📊 KEY METRICS ROW (5 Cards)                                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Docs Done   │ │ Overdue     │ │ Regs        │ │ Advisors OK │ │ Legal Close │   │
│  │   4/4       │ │   1         │ │   4/4       │ │   3/4       │ │  July 15    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ 📋 DOCUMENT READINESS               │  │ 🛡️  REGULATORY COMPLIANCE          │ │
│  ├──────────────────────────────────────┤  ├──────────────────────────────────────┤ │
│  │                                      │  │                                      │ │
│  │ Articles of Incorporation  [OVERDUE] │  │ SEC Rules: 3 new this week  [CHECK] │ │
│  │ ├─ 75% complete                     │  │ ├─ None affect our IPO             │ │
│  │ ├─ 18 days overdue ⚠️                │  │ └─ Tracking: 12 rules               │
│  │ └─ Blocker: Counsel review          │  │                                      │ │
│  │                                      │  │ State Rules: CA/NY  [COMPLIANT]     │ │
│  │ By-laws  [COMPLETE]                 │  │ ├─ CA: Tracked & compliant          │ │
│  │ └─ 100% complete ✅                  │  │ └─ NY: Tracked & compliant          │ │
│  │                                      │  │                                      │ │
│  │ Stock Plans  [IN PROGRESS]          │  │ FINRA Rules  [COMPLIANT]            │ │
│  │ ├─ 95% complete                     │  │ ├─ Conflict-checking: 100%          │ │
│  │ ├─ Due: June 15                     │  │ └─ Broker ready: Yes                │ │
│  │ └─ Blocker: Board approval          │  │                                      │ │
│  │                                      │  │ [SEC Updates] [View Analysis] ...   │ │
│  │ Cap Table  [COMPLETE]               │  │                                      │ │
│  │ └─ 100% complete ✅                  │  │                                      │ │
│  │                                      │  │                                      │ │
│  │ [View All Docs] [Upload]            │  │                                      │ │
│  │                                      │  │                                      │ │
│  └──────────────────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                                       │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ 👥 ADVISOR COORDINATION             │  │ 📅 CRITICAL PATH & TIMELINE         │ │
│  ├──────────────────────────────────────┤  ├──────────────────────────────────────┤ │
│  │                                      │  │                                      │ │
│  │ Sullivan & Cromwell  [AT-RISK]      │  │ Legal Closing: July 15, 2026        │ │
│  │ ├─ 80% engagement                   │  │                                      │ │
│  │ ├─ Next: June 12, 2 PM              │  │ CRITICAL PATH:                       │ │
│  │ └─ Legal closing prep on track      │  │ 1. Articles [IN PROGRESS]           │ │
│  │                                      │  │    ├─ Due: June 20                  │ │
│  │ Morgan Stanley  [ON SCHEDULE]       │  │    ├─ Blocks: Legal closing         │ │
│  │ ├─ 60% engagement                   │  │    └─ If delayed: -15 days shift    │ │
│  │ ├─ Next: June 10, 10 AM             │  │                                      │ │
│  │ └─ DD ready: In progress            │  │ 2. Board Resolutions [COMPLETE]    │ │
│  │                                      │  │    └─ Approved May 30               │ │
│  │ Goldman Sachs  [ON SCHEDULE]        │  │                                      │ │
│  │ ├─ 55% engagement                   │  │ 3. Stock Plans [IN PROGRESS]       │ │
│  │ ├─ Next: June 11, 2 PM              │  │    ├─ Due: June 15                  │ │
│  │ └─ DD ready: Underway               │  │    └─ Blocker: Board vote           │ │
│  │                                      │  │                                      │ │
│  │ Deloitte  [AT-RISK]                 │  │ [View Timeline] [Risk Analysis]     │ │
│  │ ├─ 75% engagement                   │  │                                      │ │
│  │ ├─ Findings: 2                      │  │                                      │ │
│  │ │  • Inventory valuation (due 6/18) │  │                                      │ │
│  │ │  • Revenue recognition (due 6/20) │  │                                      │ │
│  │ └─ Remediation: In progress         │  │                                      │ │
│  │                                      │  │                                      │ │
│  │ [Schedule Meeting] [Calendar]       │  │                                      │ │
│  │                                      │  │                                      │ │
│  └──────────────────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ⚠️  CRITICAL ALERT: Articles of Incorporation Overdue                              │
│  Your Articles have been overdue for 18 days. This document blocks legal closing.   │
│  Recommended action: Schedule call with Sullivan & Cromwell immediately.             │
│  [Schedule Meeting Now]                                                              │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Color Coding System

### Status Colors

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| OVERDUE | 🔴 Red (#DC2626) | ⚠️ AlertOctagon | Past due date - immediate action |
| AT-RISK | 🟡 Yellow (#F59E0B) | ⚠️ AlertTriangle | Due within 5 days - attention needed |
| COMPLETE | 🟢 Green (#10B981) | ✅ CheckCircle | Done - no action |
| ON-SCHEDULE | 🟢 Green (#10B981) | ✅ CheckCircle | Tracking well - on-track |
| IN-PROGRESS | 🔵 Blue (#3B82F6) | ⏱️ Clock | Underway - monitor |
| PENDING | ⚫ Gray (#9CA3AF) | ℹ️ Info | Not started - upcoming |

### Panel Background Colors

| Panel | Background | Accent | Icon Color |
|-------|-----------|--------|-----------|
| Document Readiness | Light Blue (#EBF8FF) | Border Blue | Blue |
| Regulatory Compliance | Light Green (#EAF5F0) | Border Green | Emerald |
| Advisor Coordination | Light Purple (#F3E8FF) | Border Purple | Purple |
| Critical Path | Light Orange (#FEF3C7) | Border Amber | Amber |

---

## Icon Legend

```
📋 FileText       → Document status, readiness tracking
🛡️  ShieldCheck   → Regulatory compliance, security
👥 Users         → Advisor engagement, team coordination
📅 Target        → Critical path, timeline analysis
⚠️  AlertTriangle → Warnings, at-risk items
⚠️  AlertOctagon  → Urgent, overdue items
✅ CheckCircle2  → Completed, on-schedule items
⏱️  Clock        → In-progress, pending items
💬 Info          → Details, information
→ ChevronRight   → Navigation, drill-down
📊 BarChart3     → Metrics, analytics
📈 TrendingUp    → Growth, progress
🔍 Eye           → View, visibility
🔒 Lock          → Security, access control
```

---

## Component State Flows

### Document Status Lifecycle
```
NOT-STARTED
    ↓ (upload document)
IN-PROGRESS
    ↓ (send for review)
IN-REVIEW
    ↓ (get approval)
APPROVED ✅
    
    (alternatively)
    
APPROVED → OVERDUE ⚠️ (if not completed by due date)
```

### Advisor Status Lifecycle
```
BLOCKED 🔴
    ↓ (resolve blocker)
AT-RISK 🟡
    ↓ (progress engagement)
ON-SCHEDULE 🟢
    ↓ (complete engagement)
COMPLETED ✅
```

### Regulatory Rule Status
```
NEW → NON-APPLICABLE (rule doesn't apply) ✅
   → COMPLIANT (we meet requirements) ✅
   → AT-RISK (may have gaps) ⚠️
   → ACTION-REQUIRED (must remediate) 🔴
```

### Critical Path Status
```
NOT-STARTED
    ↓
IN-PROGRESS → BLOCKED (if blocker) 🔴
    ↓
COMPLETE ✅
```

---

## Data Relationships

```
LegalDocument
├─ id: string
├─ name: string
├─ status: DocumentStatus
├─ completionPercentage: number
├─ dueDate: Date
├─ blockerReason?: string
├─ owner: Person (GC, CFO, Counsel, etc.)
├─ dependencies: Document[] (other docs that must complete first)
└─ criticalPath: boolean (blocks legal closing?)

RegulatoryRule
├─ id: string
├─ title: string
├─ jurisdiction: 'SEC' | 'State' | 'FINRA' | 'Exchange'
├─ status: RuleStatus
├─ description: string
├─ isNew: boolean
├─ effectiveDate: Date
└─ impact: 'critical' | 'high' | 'medium' | 'low'

AdvisorEngagement
├─ id: string
├─ name: string
├─ type: 'counsel' | 'underwriter' | 'auditor'
├─ status: AdvisorStatus
├─ completionPercentage: number
├─ nextMeeting?: Meeting
├─ findings?: Finding[]
└─ blockers?: string[]

CriticalPathItem
├─ id: string
├─ name: string
├─ status: ItemStatus
├─ dueDate: Date
├─ blocksLegalClosing: boolean
├─ dependencies: CriticalPathItem[]
└─ cascadingDelayDays: number
```

---

## Interaction Patterns

### 1. Quick Status Glance (5 sec)
```
User Action: Open dashboard
System Response:
  ✅ Metrics row shows: 4 docs, 1 overdue, 4 regs, 3 advisors ok
  ✅ Red badges highlight critical issues
  ✅ Each panel shows top 4-5 items
User Action: Scan for red items
System Response:
  🔴 Articles: OVERDUE 18 days
  🟡 Stock Plans: AT-RISK (Board meeting June 15)
  🔴 Auditor: 2 findings due June 18-20
User Decision: Address Articles first
```

### 2. Deep Dive (5 min)
```
User Action: Click "View All Docs"
System Response: Expand to full document list with filters
User Action: Filter by "Overdue" status
System Response: Show 1 document (Articles)
User Action: Click Articles card
System Response: Open detail view with:
  - Full document history
  - Communication thread with counsel
  - Related documents
  - Next steps checklist
User Action: Click "Schedule Meeting"
System Response: Modal to schedule with counsel
User Decision: Schedule for June 9 at 2 PM
System Response: Confirmation, email sent to counsel
Dashboard Updates: Status changes to "IN-REVIEW", timer countdown
```

### 3. Real-Time Update (immediate)
```
External Event: Counsel uploads revised Articles
System Response:
  ✅ Document status changes to "IN-REVIEW" (75% → 95%)
  🟡 At-risk badge appears, countdown timer shows "Due in 11 days"
  🔔 Notification: "Articles revised - counsel submitted for review"
  📊 Metrics: "Docs Complete" unchanged (still waiting approval)
  
User Action: Click document card
System Response: See latest version, review comments
User Decision: Approve or request revisions
```

### 4. Alert Scenario
```
Situation: June 20 arrives, Articles still not approved
System Response:
  🔴 Red "OVERDUE" badge replaces yellow
  🚨 Ripple warning appears:
     "If Articles delayed past June 20:
      Legal closing → July 30 (+15 days)
      Prospectus filing → July 8 (+10 days)
      IPO launch → Aug 5 (+21 days)"
  🔔 Email alert sent to GC, CFO, CEO
  
User Action: Click "Schedule Meeting Now"
System Response: Urgent meeting scheduler opens
User Decision: Call counsel immediately (phone call triggered)
System Response: Status updates to "ESCALATED", logging timestamp
```

---

## Workflow Scenarios

### Scenario 1: Morning GC Check-In (Every Day)
```
Time: 8:00 AM
GC Action: Open dashboard
Look At: Metrics row + red badges
Check: "Any overdue items?"
Result: 
  - Sees 1 overdue item (Articles)
  - Sees 1 at-risk item (Auditor findings)
  - Sees 3 meetings today
Decision: Schedule call with counsel (Articles) + check auditor findings
Time: 8:15 AM (done)
```

### Scenario 2: Underwriter Due Diligence Prep
```
Time: June 9 (1 day before Morgan Stanley meeting)
GC Action: Click "Goldman Sachs" advisor card
See:
  - 60% engagement complete
  - DD checklist: 60% ready
  - Next meeting: June 11, 2 PM
  - Issues: None blocking
Decision: Send DD package to Goldman Sachs
Time: Done, ready for meeting
```

### Scenario 3: Audit Finding Remediation
```
Time: June 15 (Deloitte finding due June 18)
GC Action: See yellow badge on Deloitte card
Click: View findings
See:
  - Inventory valuation: "In progress" (CFO assigned)
  - Revenue recognition: "In progress" (CFO assigned)
Both due in 3 days
Decision: Check on CFO progress, confirm on-track
Time: Message CFO, confirm both on schedule
```

### Scenario 4: Critical Path Delay Notification
```
Time: June 20 (Articles due date)
Situation: Counsel still revising Articles
System Response:
  1. Articles status → "OVERDUE" (red)
  2. Ripple warning appears with timeline impact
  3. GC receives email alert
GC Action:
  1. Opens dashboard, sees red warning
  2. Calls counsel immediately
  3. Negotiates expedited deadline
Decision: "Ready by June 22" (2-day slip)
System Response:
  1. Update due date to June 22
  2. Recalculate cascading delays (3-day slip instead of 15)
  3. Update ripple warning (Legal closing July 18 instead of July 30)
  4. Send updated timeline to CEO/CFO
```

### Scenario 5: New Regulatory Rule Detection
```
Time: Friday 8:00 AM (SEC publishes new rule)
System Response:
  1. Scraper fetches SEC rule
  2. AI analyzes applicability to our IPO
  3. Rule appears in Regulatory panel: "NEW THIS WEEK"
  4. Status: "NON-APPLICABLE" (detailed analysis shows doesn't affect us)
GC Action:
  1. Scans dashboard, sees new rule
  2. Reads summary: "Does not affect our IPO"
  3. Dismisses notification
  4. No action needed
Decision: Rule already evaluated, no compliance gap
Time: 2 minutes
```

---

## Mobile Responsive Layout

### Desktop (1280px+)
```
┌─────────────────────────────────────────────────────┐
│           2x2 Grid (4 equal panels)                 │
│   [Doc Readiness] [Regulatory]                      │
│   [Advisor]       [Critical Path]                   │
└─────────────────────────────────────────────────────┘
```

### Tablet (768px - 1279px)
```
┌────────────────────────────┐
│     2-column layout        │
│  [Doc Readiness]           │
│  [Regulatory]              │
│  [Advisor]                 │
│  [Critical Path]           │
└────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────┐
│  Stacked layout  │
│  [Doc Readiness] │
│  [Regulatory]    │
│  [Advisor]       │
│  [Critical Path] │
└──────────────────┘
```

---

## Performance Metrics

### Load Time
- Metrics row: < 200ms (static)
- Document cards: < 500ms (API fetch)
- Regulatory rules: < 500ms (cached, daily refresh)
- Advisor data: < 300ms (cached, real-time WebSocket)
- Total dashboard load: < 1 second

### Real-Time Update Latency
- Document status change: < 100ms
- New regulation alert: < 500ms (batch processed)
- Meeting scheduled: < 200ms (WebSocket)
- Finding submitted: < 150ms (WebSocket)

### Data Freshness
- Documents: Updated in real-time via WebSocket
- Regulations: Updated daily at 8 AM (SEC scrape)
- Advisors: Updated in real-time via WebSocket
- Metrics: Calculated on-demand (< 100ms)

---

## Accessibility Features

### Keyboard Navigation
```
Tab     → Move to next card/button
Shift+Tab → Move to previous card/button
Enter   → Expand card / Open detail view
Esc     → Close detail view
Arrow Keys → Move between cards in same section
Space   → Toggle filters
```

### Screen Reader
```
"Document Readiness Panel"
  "Articles of Incorporation, status Overdue, 75% complete, 
   18 days overdue, blocker reason: Counsel review, 
   due date June 20, 2026, critical path item"
```

### Color Independence
- All status indicators use icons + labels (not just color)
- Colorblind mode: Show patterns instead of pure color
- High contrast mode: Increase text/background contrast

---

## Error Handling

### API Failure Scenarios
```
Scenario 1: Document API fails
  Display: Empty state "Unable to load documents"
  Action: Show retry button + offline indicator
  Fallback: Show last cached version if available

Scenario 2: Real-time connection drops
  Display: Gray indicator "Last updated 5 min ago"
  Action: Auto-reconnect every 10 seconds
  Fallback: Manual refresh button

Scenario 3: Regulatory scraper fails
  Display: Warning icon "Regulation data may be outdated"
  Action: Log error, retry next scheduled run (8 AM)
  Fallback: Show last successful scrape time
```

### User Error Recovery
```
Scenario 1: User accidentally updates wrong due date
  Action: Show "Undo" button for 10 seconds
  Recovery: Click "Undo" to revert change
  
Scenario 2: User cancels important meeting
  Action: Show confirmation dialog "Are you sure?"
  Recovery: Notification goes to advisor, GC can reschedule

Scenario 3: User marks document complete prematurely
  Action: Show "Are you sure?" + note "Cannot undo immediately"
  Recovery: Contact admin to revert if needed
```

---

## Analytics Events to Track

```
Event: dashboard_view
  user_id: string
  timestamp: ISO datetime
  device: 'desktop' | 'tablet' | 'mobile'

Event: document_status_updated
  user_id: string
  document_id: string
  old_status: string
  new_status: string
  timestamp: ISO datetime

Event: advisor_meeting_scheduled
  user_id: string
  advisor_id: string
  meeting_date: ISO date
  timestamp: ISO datetime

Event: critical_path_delayed
  user_id: string
  item_id: string
  delay_days: number
  old_due_date: ISO date
  new_due_date: ISO date
  timestamp: ISO datetime

Event: document_downloaded
  user_id: string
  document_id: string
  timestamp: ISO datetime

Event: drill_down_opened
  user_id: string
  section: 'documents' | 'regulatory' | 'advisors' | 'critical_path'
  item_id: string
  timestamp: ISO datetime
```

---

## Future Feature Roadmap

### Phase 2 (Q3 2026)
- [ ] Document upload interface (drag-drop)
- [ ] Meeting scheduler (calendar integration)
- [ ] Audit finding tracker (find + remediate)
- [ ] Timeline simulator ("What-if" analysis)
- [ ] Email notifications (overdue alerts)

### Phase 3 (Q4 2026)
- [ ] AI legal assistant (chat interface)
- [ ] Advisor portal (self-serve updates)
- [ ] Advanced analytics (dashboard reporting)
- [ ] Document auto-generation (board resolutions)
- [ ] Competitor benchmarking (timeline comparisons)

### Phase 4 (2027)
- [ ] Machine learning (predictive delays)
- [ ] Automated regulatory monitoring (real-time scraping)
- [ ] Integration with DocuSign (e-signature tracking)
- [ ] Slack notifications (real-time updates)
- [ ] Custom alerts (role-based, configurable)

---

## Support Resources

- **Design Questions**: See `/GC_LEGAL_DASHBOARD.md`
- **Implementation Questions**: See `/GC_LEGAL_DASHBOARD_IMPLEMENTATION.md`
- **Component Code**: See `/src/app/dashboard/legal/page.tsx`
- **Quick Start**: See `/GC_LEGAL_DASHBOARD_SUMMARY.md`
