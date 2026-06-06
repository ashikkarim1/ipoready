# GC Legal Intelligence Dashboard (NEXT-GEN)

**Purpose**: Unified command center for General Counsel managing all legal/regulatory/advisor coordination aspects of IPO readiness.

**User Focus**: General Counsel responsible for legal closing, regulatory compliance, advisor coordination, and timeline accountability.

---

## 1. Dashboard Layout Architecture

The dashboard consists of four integrated sections organized for actionability and risk visibility.

### 1.1 Document Readiness Panel (Top-Left)
**Purpose**: Real-time visibility into critical legal documents blocking the IPO timeline.

**Layout**:
```
┌─────────────────────────────────────────┐
│ 📋 DOCUMENT READINESS                   │
├─────────────────────────────────────────┤
│ • Articles of incorporation             │
│   Status: ⚠️ 3 WEEKS OVERDUE            │
│   Impact: Affects legal closing         │
│   DueDate: June 20 (CRITICAL PATH)      │
│                                         │
│ • By-laws                               │
│   Status: ✅ 100% complete              │
│   No issues detected                    │
│                                         │
│ • Stock plans                           │
│   Status: ⏱️ 95% complete               │
│   Blocker: Waiting for board approval   │
│   Next step: Board meeting (June 15)    │
│                                         │
│ • Cap table cleanup                     │
│   Status: ✅ 100% complete              │
│   No compliance issues                  │
│                                         │
│ [View Details] [Upload Document]        │
└─────────────────────────────────────────┘
```

**Components**:
- **Status Indicators**: Color-coded (Red=Overdue, Green=Complete, Yellow=At-Risk, Gray=On-Track)
- **Document Card**: Shows completion %, overdue status, blocker reason
- **Critical Path Highlighting**: Articles of Incorporation is red for blocking legal closing
- **Action Buttons**: Direct links to upload, request signature, view details

**Visual Cues**:
- Red badge if overdue with days past due
- Yellow badge if at risk (due within 5 days)
- Green checkmark if completed
- Blocker tags: "Waiting for board approval", "External counsel review", "Signature pending"

---

### 1.2 Regulatory Compliance Panel (Top-Right)
**Purpose**: Track regulatory changes and ensure continuous compliance.

**Layout**:
```
┌─────────────────────────────────────────┐
│ 🛡️ REGULATORY COMPLIANCE               │
├─────────────────────────────────────────┤
│ SEC Rules & Regulations                 │
│ Status: ✅ Compliant                     │
│ • 3 new SEC regulations this week       │
│ • Analysis: None impact our IPO         │
│ • Tracking: 12 active rules              │
│                                         │
│ State Rules & Regulations               │
│ Status: ✅ Compliant                     │
│ • CA rules: Tracked, compliant          │
│ • NY rules: Tracked, compliant          │
│ • Other states: Monitored               │
│                                         │
│ FINRA Compliance                        │
│ Status: ✅ Compliant                     │
│ • Conflict-checking: 100% analyzed     │
│ • Broker recommendations: Ready         │
│ • Underwriter alignment: On track       │
│                                         │
│ [SEC Updates] [View Analysis] [History] │
└─────────────────────────────────────────┘
```

**Components**:
- **Regulation Tracker**: Shows new regulations this week with impact assessment
- **Jurisdiction Cards**: CA, NY, federal SEC rules with compliance status
- **FINRA Status**: Conflict checking, broker alignment, underwriter coordination
- **History Timeline**: Last 30 days of regulatory changes

**Data Sources**:
- SEC website for rule changes
- State regulatory bodies
- FINRA rule updates
- Third-party compliance monitoring

---

### 1.3 Advisor Coordination Panel (Bottom-Left)
**Purpose**: Track all external advisor engagement and meeting schedules.

**Layout**:
```
┌─────────────────────────────────────────┐
│ 👥 ADVISOR COORDINATION                │
├─────────────────────────────────────────┤
│ Outside Counsel                         │
│ Status: ✅ On schedule                   │
│ • Legal closing prep: 80% complete      │
│ • Board resolutions: Approved           │
│ • No blockers                           │
│ • Next meeting: June 12, 2 PM           │
│                                         │
│ Underwriters                            │
│ Status: ⏱️ Due diligence starting       │
│ • 2 meetings scheduled                  │
│ • Morgan Stanley: June 10, 10 AM        │
│ • Goldman Sachs: June 11, 2 PM          │
│ • DD checklist: 60% ready               │
│                                         │
│ Auditors                                │
│ Status: ⚠️ Action needed                 │
│ • 2 findings from preliminary audit     │
│ • Finding 1: Inventory valuation        │
│   Remediation: In progress              │
│   Due: June 18                          │
│ • Finding 2: Revenue recognition        │
│   Remediation: Scheduled with CFO       │
│   Due: June 20                          │
│                                         │
│ [Schedule Meeting] [Adjust Timeline]    │
└─────────────────────────────────────────┘
```

**Components**:
- **Advisor Card**: Status, last meeting, next meeting, blockers
- **Meeting Scheduler**: Quick-access interface to schedule/reschedule meetings
- **Finding Tracker**: Audit findings with remediation status and due dates
- **Engagement Timeline**: Historical and upcoming advisor meetings

**Functionality**:
- Color-coded status (Green=On-track, Yellow=At-risk, Red=Blocked)
- Meeting countdown clock for imminent meetings
- One-click meeting reschedule
- Document upload directly from advisor cards

---

### 1.4 Critical Path & Timeline Panel (Bottom-Right)
**Purpose**: Visual critical path analysis showing dependencies and deadline pressure.

**Layout**:
```
┌─────────────────────────────────────────┐
│ 📅 CRITICAL PATH & BLOCKERS            │
├─────────────────────────────────────────┤
│ Legal Closing Date: July 15, 2026      │
│                                         │
│ CRITICAL PATH SEQUENCE:                 │
│ 1. Articles of Incorporation            │
│    Status: ⚠️ OVERDUE (3 weeks)         │
│    ├─ Decision Impact: YES              │
│    └─ Timeline Impact: CRITICAL         │
│                                         │
│ 2. Board Resolutions Approved           │
│    Status: ✅ APPROVED                   │
│    ├─ Blocking Articles? No             │
│    └─ Next: Stock plans approval        │
│                                         │
│ 3. Stock Plans Final Approval           │
│    Status: ⏱️ PENDING (95%)              │
│    ├─ Blocking Date: June 15 deadline   │
│    └─ Next: Legal review complete       │
│                                         │
│ ⚠️ IF ARTICLES NOT DONE BY JUNE 20:    │
│    Legal closing shifts to July 30      │
│    Underwriter meetings delay +3 weeks  │
│    Prospectus filing delay +10 days     │
│                                         │
│ RIPPLE EFFECTS:                         │
│ • Prospectus filing: June 28 → July 8  │
│ • Roadshow: July 5 → July 25           │
│ • Final pricing: July 10 → July 30     │
│ • IPO launch: July 15 → Aug 5          │
│                                         │
│ [Full Timeline] [Risk Analysis] [Adjust]│
└─────────────────────────────────────────┘
```

**Components**:
- **Gantt Timeline**: Visual critical path with task dependencies
- **Milestone Tracker**: Show which milestones are on-track, at-risk, overdue
- **Ripple Effect Analysis**: How delays cascade downstream
- **Buffer Analysis**: Slack time remaining for each critical task

**Visualization**:
- Red path shows critical/overdue items
- Yellow path shows at-risk items (due within 5 days)
- Green path shows completed items
- Dependency arrows show blocking relationships

---

## 2. Data Model & Metrics

### 2.1 Document Tracking Schema
```typescript
interface LegalDocument {
  id: string
  name: string
  category: 'articles' | 'bylaws' | 'stock-plans' | 'cap-table' | 'resolutions'
  status: 'not-started' | 'in-progress' | 'in-review' | 'approved' | 'overdue'
  completionPercentage: number
  dueDate: Date
  actualCompleteDate?: Date
  blockerReason?: string // 'board-approval', 'counsel-review', 'signature-pending'
  criticalPath: boolean // Impacts legal closing date?
  dependencies: string[] // Other documents this depends on
  owner: string // 'counsel', 'cfo', 'ceo'
  lastUpdate: Date
}
```

### 2.2 Regulatory Compliance Metrics
```typescript
interface RegulatoryRule {
  id: string
  title: string
  jurisdiction: 'SEC' | 'State' | 'FINRA' | 'Exchange'
  status: 'tracked' | 'non-applicable' | 'compliant' | 'at-risk'
  description: string
  effectiveDate: Date
  impact: 'critical' | 'high' | 'medium' | 'low'
  action?: string // Required action if applicable
  deadline?: Date
}
```

### 2.3 Advisor Status
```typescript
interface AdvisorEngagement {
  id: string
  type: 'outside-counsel' | 'underwriter' | 'auditor' | 'investor-relations'
  name: string
  status: 'on-schedule' | 'at-risk' | 'blocked'
  completionPercentage: number
  nextMeeting?: Date
  findings?: string[] // For auditors
  blockers?: string[]
}
```

### 2.4 Critical Path Item
```typescript
interface CriticalPathItem {
  id: string
  name: string
  status: 'not-started' | 'in-progress' | 'complete'
  dueDate: Date
  dependencies: string[] // Items that must complete first
  blocksLegalClosing: boolean
  cascadingDelay?: number // Days legal closing pushes if delayed
}
```

---

## 3. Dashboard Features & Interactions

### 3.1 Real-Time Status Indicators
- **Color Coding**:
  - 🔴 Red: Overdue (past due date)
  - 🟡 Yellow: At-Risk (due within 5 days)
  - 🟢 Green: On-Track (completed or ample buffer)
  - ⚫ Gray: Pending/Not started

- **Status Icons**:
  - ✅ Completed (100%)
  - ⏱️ In Progress (0-99%)
  - ⚠️ Overdue/At-Risk
  - 🔒 Blocked
  - ⏳ Waiting for external action

### 3.2 Quick Actions Menu
Each panel has quick-access buttons:
- **Document Readiness**: "Upload Document", "Request Signature", "View All Docs"
- **Regulatory**: "SEC Updates", "View Analysis", "Compliance History"
- **Advisor Coordination**: "Schedule Meeting", "View Calendar", "Add Finding"
- **Critical Path**: "View Full Timeline", "Risk Analysis", "Adjust Dates"

### 3.3 Inline Notifications
- **Overdue Badge**: Red background with days overdue
- **Blocker Alert**: Shows what's waiting (e.g., "Waiting for board approval")
- **Ripple Warning**: If articles delayed, shows cascading delay
- **Meeting Reminder**: Countdown to imminent meetings

### 3.4 Drill-Down Navigation
Click any document/rule/advisor to see:
- Full status history
- All related documents
- Communication thread
- Related tasks and deadlines
- Audit trail of changes

---

## 4. Workflow & Use Cases

### 4.1 Morning GC Check-In (5 min)
1. Open GC Legal Dashboard
2. Scan Document Readiness for red flags
3. Check Critical Path for today's actions
4. Review Advisor Coordination for upcoming meetings
5. Scan Regulatory for new rules
6. Action: Create today's priority task list

### 4.2 Articles Overdue Escalation Flow
1. Red badge appears in Document Readiness (3 weeks overdue)
2. GC sees "Impacts legal closing" warning
3. Critical Path shows "Articles → affects legal closing (July 15)"
4. Ripple Effect shows: Legal closing +15 days, Prospectus filing +10 days, IPO launch +15 days
5. GC clicks "Request Signature" → opens modal with counsel contact
6. GC schedules meeting with outside counsel to resolve
7. Document marked "In Review" → timer resets

### 4.3 Auditor Finding Remediation
1. Auditor log finding in Dashboard
2. Yellow badge appears in "Auditors" section under Advisor Coordination
3. Finding shows: "Inventory valuation - Due June 18"
4. GC sees it blocks Stock Plans approval (critical path dependency)
5. GC creates task for CFO: "Fix inventory valuation by June 18"
6. Status updates in real-time: Pending → In Progress → Resolved
7. Green checkmark appears when finding resolved

### 4.4 Regulatory Change Detection
1. New SEC rule published
2. System scans rule against IPO status
3. Rule appears in Regulatory Compliance panel: "Status: Non-applicable"
4. Brief summary: "Does not affect our IPO"
5. GC can dismiss or drill in for details
6. Compliance audit trail updated

---

## 5. Technical Implementation

### 5.1 Page Route
```
/dashboard/legal
```

### 5.2 Component Structure
```
src/app/dashboard/legal/
├── page.tsx                           # Main dashboard layout
├── layout.tsx                         # Nav, header, shared context
├── components/
│   ├── DocumentReadinessPanel.tsx     # Left-top section
│   ├── RegulatoryCompliancePanel.tsx  # Right-top section
│   ├── AdvisorCoordinationPanel.tsx   # Left-bottom section
│   ├── CriticalPathPanel.tsx          # Right-bottom section
│   ├── StatusIndicator.tsx             # Reusable status badge
│   ├── DocumentCard.tsx                # Individual document status
│   ├── AdvisorCard.tsx                 # Individual advisor engagement
│   ├── TimelineVisualization.tsx       # Critical path gantt
│   └── RippleEffectWarning.tsx         # Cascading delay alert
├── hooks/
│   ├── useDocumentStatus.ts           # Document tracking hook
│   ├── useAdvisorStatus.ts            # Advisor engagement tracking
│   ├── useCriticalPath.ts             # Critical path calculations
│   └── useRegulatoryUpdates.ts        # Regulatory change detection
└── utils/
    ├── documentStatusCalculator.ts     # Calculate document status
    ├── criticalPathAnalyzer.ts        # Analyze path dependencies
    └── rippleEffectCalculator.ts      # Calculate cascading delays
```

### 5.3 Data Integration Points
- **Documents Database**: Query `unified_documents` with legal document types
- **Advisor Database**: Query advisor engagements and meeting schedules
- **Compliance Database**: Query compliance rules and audit findings
- **Calendar Integration**: Sync with meeting scheduler for advisor meetings
- **Notification System**: Alert GC when document overdue, finding logged, etc.

### 5.4 Real-Time Updates
- WebSocket subscriptions for:
  - Document status changes (when counsel uploads document)
  - Finding submissions from auditors
  - Meeting scheduling/rescheduling
  - Critical path delays
- Polling fallback for regulatory updates (check SEC daily at 8 AM)

---

## 6. UI/UX Specifications

### 6.1 Color Palette
- **Status Colors**:
  - Overdue/Red: `#DC2626` (danger red)
  - At-Risk/Yellow: `#F59E0B` (warning amber)
  - On-Track/Green: `#10B981` (success emerald)
  - Pending/Gray: `#9CA3AF` (neutral gray)

- **Card Backgrounds**:
  - Document Readiness: Light blue background (#EBF8FF)
  - Regulatory: Light green background (#EAF5F0)
  - Advisor: Light purple background (#F3E8FF)
  - Critical Path: Light orange background (#FEF3C7)

### 6.2 Typography
- **Panel Headers**: Heading 2 (24px, bold, light theme)
- **Document/Advisor Names**: Heading 3 (18px, semi-bold)
- **Status Text**: Body (14px, regular)
- **Alert Text**: Body (13px, semi-bold for blockers)

### 6.3 Spacing & Layout
- 4-column grid layout on desktop (2x2 panels)
- Responsive to 2-column on tablet (2x2 stacked)
- Single column on mobile
- 16px padding between panels
- 12px padding inside cards

### 6.4 Interactive Elements
- **Hover States**: Subtle shadow increase, slight scale (1.02x)
- **Click States**: Panel expands or navigates to drill-down view
- **Loading States**: Skeleton loaders for async data
- **Empty States**: "No documents tracked" / "All rules compliant" messages

---

## 7. Analytics & Reporting

### 7.1 Key Metrics to Track
1. **Document Completion Rate**: (Completed docs / Total docs) × 100
2. **Days Overdue**: Count of documents past due date
3. **Critical Path Health**: % of critical items on-track
4. **Advisor Engagement Score**: (On-schedule advisors / Total advisors) × 100
5. **Regulatory Compliance Rate**: (Compliant rules / Total tracked rules) × 100
6. **Timeline Pressure**: Days until legal closing vs. critical path duration

### 7.2 Dashboard Reports
- **Weekly Compliance Report**: Exported to GC email summarizing status
- **Monthly Critical Path Status**: Gantt chart with trends
- **Regulatory Change Summary**: All new rules this month
- **Advisor Performance**: Meeting timeliness, finding counts, etc.

---

## 8. Security & Compliance

### 8.1 Data Access Control
- Only assigned GC and CFO can view this dashboard
- Outside counsel/auditors/underwriters see limited view (their section only)
- Document status visible to relevant parties (e.g., auditor sees findings)
- Audit trail: All changes logged with timestamp and user

### 8.2 Data Classification
- **Sensitive**: Articles, bylaws, board resolutions (access control)
- **Confidential**: Audit findings (limited to GC, CFO, auditor)
- **Internal**: Regulatory rules, advisory meeting notes (internal only)
- **Shared**: Meeting invites, public regulatory changes

### 8.3 Compliance Standards
- SOC 2: Access controls, audit trails
- GDPR: Personal data for advisors/counsel encrypted
- SEC: Document retention policy for 7+ years

---

## 9. Future Enhancements (Phase 2+)

1. **AI-Powered Legal Assistant**: Chat with dashboard for compliance questions
2. **Document Auto-Generation**: Auto-draft board resolutions based on status
3. **Predictive Delays**: ML model predicts which items likely to delay
4. **Automated Regulatory Monitoring**: Real-time SEC/state rule scraping
5. **Integration with Docusign**: Real-time signature tracking
6. **Advisor Portal**: Underwriters/counsel self-serve status updates
7. **Custom Alerts**: Configurable notifications for specific roles
8. **Timeline Simulation**: "What-if" delays → recalculate IPO date
9. **Competitor Benchmarking**: Compare timeline to recent IPOs

---

## 10. Success Metrics

**Adoption**:
- Used by GC for daily decision-making (target: 80% daily active)
- Reduces email/Slack about "status?" questions (target: 50% reduction)

**Accuracy**:
- Dashboard reflects actual document status (target: 100% current within 2 hours)
- Critical path predictions accurate (target: 90% accuracy)

**Actionability**:
- GC resolves overdue items within 3 days of alert (target: 85%)
- Quick actions reduce time-to-action (target: 50% faster than email)

**Compliance**:
- Zero missed regulatory changes (target: 100% catch rate)
- All audit findings tracked and remediated (target: 100% documented)

---

## Implementation Roadmap

**Phase 1 (Week 1-2)**:
- [ ] Create page layout and 4-panel structure
- [ ] Build DocumentReadinessPanel with sample data
- [ ] Integrate with unified_documents table
- [ ] Build status indicator components

**Phase 2 (Week 3-4)**:
- [ ] Build RegulatoryCompliancePanel with SEC rule scraper
- [ ] Build AdvisorCoordinationPanel with calendar integration
- [ ] Build CriticalPathPanel with Gantt visualization

**Phase 3 (Week 5-6)**:
- [ ] Implement real-time WebSocket updates
- [ ] Add drill-down views for each section
- [ ] Implement analytics dashboard
- [ ] Add regulatory monitoring scheduler

**Phase 4 (Week 7+)**:
- [ ] AI-powered legal assistant
- [ ] Document auto-generation
- [ ] Advisor portal
- [ ] Timeline simulation engine
