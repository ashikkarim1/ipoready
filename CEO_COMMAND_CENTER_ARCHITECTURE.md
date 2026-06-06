# CEO Command Center — Technical Architecture

**Version:** 1.0  
**Date:** June 7, 2026  
**Status:** Implementation Guide

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /app/dashboard/command-center/page.tsx                                     │
│  ├── StatusCard (Card 1)                                                    │
│  │   └── Shows: Readiness %, Timeline, Critical count                       │
│  │       Drill-down: ReadinessModal                                         │
│  │                                                                          │
│  ├── AlertsCard (Card 2)                                                    │
│  │   └── Lists: Critical alerts with remediation                           │
│  │       Drill-down: AlertDetail side panel                                │
│  │                                                                          │
│  └── ActionsCard (Card 3)                                                   │
│      └── Shows: CEO to-do list, priority actions                           │
│          Actions: Call, Email, Delegate, Schedule                          │
│                                                                              │
│  Real-time Updates via:                                                     │
│  ├── WebSocket (SSE stream from /api/cc/stream)                            │
│  ├── React Query caching (5 min staleTime)                                │
│  └── Optimistic updates on user actions                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ HTTP + WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GET  /api/cc/status                                                        │
│  ├── Response: { readiness, timeline, criticalCount }                       │
│  └── Called: Every 5 mins (React Query)                                     │
│                                                                              │
│  GET  /api/cc/alerts                                                        │
│  ├── Params: ?severity=critical,warning&limit=10                          │
│  ├── Response: [{ id, rule, severity, remediation, impact, owner }]        │
│  └── Called: Every 5 mins (React Query)                                     │
│                                                                              │
│  GET  /api/cc/actions                                                       │
│  ├── Response: [{ actionType, priority, description, dueDate }]            │
│  └── Called: Every 5 mins (React Query)                                     │
│                                                                              │
│  GET  /api/cc/stream (Server-Sent Events)                                  │
│  ├── Emits: { type: 'alert_resolved' | 'task_updated' | ... }            │
│  └── Connection: Persistent (until session ends)                           │
│                                                                              │
│  POST /api/cc/alerts/:id/escalate                                          │
│  ├── Body: { message: string }                                              │
│  └── Response: { emailsSent: [emails] }                                     │
│                                                                              │
│  POST /api/cc/alerts/:id/resolve                                           │
│  ├── Body: { resolvedAt: timestamp }                                        │
│  └── Response: { success: true }                                            │
│                                                                              │
│  POST /api/cc/actions/:id/complete                                         │
│  ├── Body: { completedAt: timestamp }                                       │
│  └── Response: { success: true }                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ SQL Queries
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Existing Tables:                                                            │
│  ├── companies                                                               │
│  │   └── id, name, exchange, target_listing_date, created_at              │
│  │                                                                          │
│  ├── pace_scores                                                             │
│  │   └── id, company_id, overall_readiness, phase_breakdowns (JSON)       │
│  │       calculated_at, confidence_interval                                │
│  │                                                                          │
│  ├── pace_score_history                                                      │
│  │   └── id, company_id, pace_score, recorded_at                          │
│  │                                                                          │
│  ├── pace_sequencing_alerts                                                  │
│  │   └── id, company_id, rule, severity, remediation, resolved_at         │
│  │       created_at, updated_at                                            │
│  │                                                                          │
│  ├── tasks                                                                   │
│  │   └── id, company_id, title, phase, status, assigned_to, due_date     │
│  │       priority, created_at, updated_at                                  │
│  │                                                                          │
│  └── users                                                                   │
│      └── id, company_id, name, email, phone, role, created_at             │
│                                                                              │
│  New Tables:                                                                 │
│  ├── ceo_actions                                                             │
│  │   ├── id, company_id, action_type, priority, description               │
│  │   ├── due_date, task_id (FK), alert_id (FK)                           │
│  │   └── completed_at, created_at                                          │
│  │                                                                          │
│  └── alert_context                                                           │
│      ├── id, alert_id (FK), impact_description, regulatory_reference     │
│      ├── suggested_action, owner_email, escalation_level                  │
│      └── created_at                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Webhook Events
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EVENT TRIGGERS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Task Status Changed:                                                        │
│  ├── Trigger: UPDATE tasks SET status = 'completed' WHERE id = ?          │
│  ├── Action: Recalculate PACE score → pace_scores table                   │
│  └── Emit: WSS message { type: 'task_updated' }                           │
│                                                                              │
│  Alert Resolved:                                                             │
│  ├── Trigger: UPDATE pace_sequencing_alerts SET resolved_at = NOW()       │
│  ├── Action: Recalculate critical count                                    │
│  └── Emit: WSS message { type: 'alert_resolved' }                         │
│                                                                              │
│  Document Uploaded:                                                          │
│  ├── Trigger: INSERT INTO unified_documents                               │
│  ├── Action: Recalculate PACE score                                        │
│  └── Emit: WSS message { type: 'doc_added' }                              │
│                                                                              │
│  Board Minutes Logged:                                                       │
│  ├── Trigger: INSERT INTO unified_documents WHERE phase = 'governance'   │
│  ├── Action: Check audit findings approval status                         │
│  └── Emit: WSS message { type: 'governance_updated' }                     │
│                                                                              │
│  Company Timeline Changed:                                                   │
│  ├── Trigger: UPDATE companies SET target_listing_date = ?               │
│  ├── Action: Recalculate all alerts for new timeline                     │
│  └── Emit: WSS message { type: 'timeline_changed' }                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Request → Response

### Example 1: Loading Dashboard on Page Open

```
1. User navigates to /dashboard/command-center
   └─> page.tsx component mounts

2. useEffect runs (on mount):
   ├─> Call GET /api/cc/status
   ├─> Call GET /api/cc/alerts
   ├─> Call GET /api/cc/actions
   └─> Establish WebSocket connection to /api/cc/stream

3. API routes execute queries:
   ├─> /api/cc/status:
   │   ├─> SELECT overall_readiness, confidence_interval FROM pace_scores
   │   ├─> SELECT target_listing_date FROM companies
   │   └─> COUNT alerts WHERE severity = 'critical' AND resolved_at IS NULL
   │
   ├─> /api/cc/alerts:
   │   ├─> SELECT * FROM pace_sequencing_alerts WHERE resolved_at IS NULL
   │   ├─> JOIN alert_context ON alert_id
   │   └─> ORDER BY severity DESC, created_at DESC
   │
   └─> /api/cc/actions:
       ├─> SELECT * FROM ceo_actions WHERE completed_at IS NULL
       ├─> ORDER BY priority DESC, due_date ASC
       └─> LIMIT 10

4. React Query caches results (staleTime: 5min):
   ├─> StatusCard renders with readiness %, timeline, critical count
   ├─> AlertsCard renders with top 5 alerts
   └─> ActionsCard renders with top 5 CEO actions

5. WebSocket stream stays open:
   └─> Ready to emit updates in real-time
```

### Example 2: CEO Clicks "Call Now"

```
1. User clicks [CALL NOW] button on alert
   └─> Component shows phone number (copy-to-clipboard or dial)

2. User makes the call, stays on dashboard
   └─> No system action yet (we're not integrating phone system)

3. User returns to dashboard after call
   └─> Manually marks task as "In Progress" OR
   └─> Receives notification when legal team submits forms

4. When legal team submits forms to TSXV:
   ├─> Integration receives webhook or manual entry
   ├─> Trigger: UPDATE tasks SET status = 'in_progress'
   ├─> Trigger: UPDATE pace_sequencing_alerts SET remediation_status = 'submitted'
   ├─> Recalculate PACE score (articles +5%)
   └─> Emit SSE: { type: 'task_updated', taskId: '...', newStatus: 'in_progress' }

5. Frontend receives SSE event:
   ├─> useEffect listens for SSE messages
   ├─> Updates React Query cache
   ├─> Re-renders:
   │   ├─> Alert status changes 🔴 → 🟡 (visual change)
   │   ├─> Readiness bar animates 72% → 74%
   │   └─> Action item marked ☑ completed
   └─> Optional: Show toast notification "Great news! Articles submitted"

6. CEO sees updated dashboard in real-time:
   └─> No need to refresh; everything updates via WebSocket
```

### Example 3: Alert Drill-Down

```
1. User clicks on an alert in AlertsCard
   └─> onClick handler captures alert.id

2. Component opens AlertDetail side panel:
   ├─> Passes alert data (already loaded)
   ├─> If more detail needed, calls GET /api/cc/alerts/[id]
   │   └─> Returns full context + historical timeline
   └─> Renders multi-step remediation plan

3. User reads remediation steps and decides to act:
   ├─> Clicks [CALL DAVID] button
   │   └─> Shows phone number + pre-filled email
   ├─> Or clicks [SCHEDULE WITH COUNSEL]
   │   └─> Opens calendar integration (Google Calendar API)
   └─> Or clicks [MARK RESOLVED]
       └─> POST /api/cc/alerts/[id]/resolve

4. If user marks resolved:
   ├─> API updates pace_sequencing_alerts table
   ├─> Recalculates PACE score
   ├─> Emits SSE event: { type: 'alert_resolved' }
   └─> Frontend removes alert from list
```

---

## Component Hierarchy

```
/app/dashboard/command-center/page.tsx (Main Page)
│
├── Header
│   ├── Title: "Command Center"
│   └── Last updated: 2 mins ago
│
├── StatusCard (Card 1)
│   ├── StatusBar (readiness %)
│   ├── StatusText (timeline + confidence)
│   ├── StatusMetrics (critical count, task count)
│   └── ExpandButton → ReadinessModal (drill-down)
│
├── AlertsCard (Card 2)
│   ├── FilterBar (severity selector)
│   │   └── Options: All, Critical, Warning, On Track
│   ├── AlertItem (repeated for each alert)
│   │   ├── SeverityBadge (🔴 🟡 🟢)
│   │   ├── AlertTitle
│   │   ├── AlertPreview (1 line summary)
│   │   └── ActionButtons
│   │       ├── [ESCALATE]
│   │       ├── [MARK RESOLVED]
│   │       └── [VIEW DETAILS] → AlertDetail (side panel)
│   └── LoadMoreButton (if >10 alerts)
│
├── ActionsCard (Card 3)
│   ├── DecisionBox
│   │   ├── DecisionQuestion
│   │   ├── RecommendationBox
│   │   └── ActionButtons
│   │       ├── [SCHEDULE BOARD CALL]
│   │       └── [VIEW RISK ANALYSIS]
│   │
│   ├── ToDoList
│   │   └── ActionItem (repeated for each action)
│   │       ├── Checkbox
│   │       ├── ActionText (with time estimate)
│   │       ├── ActionButtons
│   │       │   ├── [CALL NOW] / [SEND EMAIL]
│   │       │   ├── [OPEN FILE]
│   │       │   ├── [DELEGATE]
│   │       │   └── [SNOOZE 24H]
│   │       └── ActionContext (owner, reference)
│   │
│   └── ActionFooter
│       ├── [VIEW FULL TASK LIST]
│       └── [EXPORT AGENDA]
│
├── ReadinessModal (drill-down from Card 1)
│   ├── OverallScore
│   ├── PhaseBreakdown (8 progress bars)
│   ├── TimelineProjection (confidence intervals)
│   ├── ReadinessTrend (line chart)
│   └── NextMilestones
│
└── AlertDetail (drill-down from Card 2)
    ├── AlertHeader
    ├── KeyFacts
    ├── ImpactAssessment
    ├── RemediationSteps (multi-step with progress)
    ├── RegulatoryReference
    ├── OwnerContact
    ├── EscalationTimeline
    └── ActionButtons
```

---

## Data Schema SQL

### New Tables

```sql
-- CEO Actions: Prioritized action items for CEO
CREATE TABLE ceo_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Action metadata
  action_type VARCHAR(50) NOT NULL,      -- 'decision' | 'review' | 'call' | 'approve'
  priority VARCHAR(20) NOT NULL,         -- 'urgent' | 'high' | 'normal'
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  estimated_hours INT DEFAULT 1,         -- How long will this take?
  
  -- Link to underlying task/alert
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  alert_id UUID REFERENCES pace_sequencing_alerts(id) ON DELETE SET NULL,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'open',     -- 'open' | 'in_progress' | 'completed'
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ceo_actions_company_status ON ceo_actions(company_id, status);
CREATE INDEX idx_ceo_actions_due_date ON ceo_actions(due_date);

-- Alert Context: Rich context for each alert
CREATE TABLE alert_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES pace_sequencing_alerts(id) ON DELETE CASCADE,
  
  -- Detailed impact
  impact_description TEXT,                -- Why is this critical?
  impact_on_timeline_days INT,            -- How many days does this add?
  probability_of_delay DECIMAL(3,2),      -- 0.00 to 1.00
  
  -- Regulatory details
  regulatory_reference VARCHAR(255),      -- e.g., "TSXV Policy 3.3"
  regulatory_url TEXT,                    -- Link to regulation
  
  -- Remediation guidance
  suggested_action TEXT,                  -- Next step (action button text)
  estimated_hours_to_fix INT,
  
  -- Owner information
  owner_email VARCHAR(255),
  owner_phone VARCHAR(20),
  escalation_level VARCHAR(20),           -- 'ceo' | 'board' | 'legal' | etc.
  
  -- Historical tracking
  first_detected_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_context_alert ON alert_context(alert_id);

-- Remediation Steps: Sub-tasks within an alert's fix
CREATE TABLE alert_remediation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES pace_sequencing_alerts(id),
  
  step_number INT,                        -- 1, 2, 3, ...
  description TEXT,
  owner_email VARCHAR(255),
  estimated_hours INT,
  status VARCHAR(20) DEFAULT 'pending',   -- 'pending' | 'in_progress' | 'completed'
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_remediation_steps_alert ON alert_remediation_steps(alert_id, step_number);
```

### Migrating Existing Data

```sql
-- Extract critical alerts from pace_sequencing_alerts into alert_context
INSERT INTO alert_context (alert_id, impact_description, regulatory_reference, owner_email)
SELECT 
  id,
  remediation,  -- Use existing remediation as impact for now
  'TSXV Regulations',  -- Placeholder
  'legal@company.com'  -- Placeholder
FROM pace_sequencing_alerts
WHERE resolved_at IS NULL;

-- Create CEO actions for critical alerts
INSERT INTO ceo_actions (company_id, action_type, priority, description, due_date, alert_id)
SELECT 
  company_id,
  'call',
  'urgent',
  'Escalate: ' || rule,
  CURRENT_DATE + INTERVAL '7 days',
  id
FROM pace_sequencing_alerts
WHERE severity = 'critical' AND resolved_at IS NULL;
```

---

## API Route Implementations

### GET /api/cc/status

```typescript
// /app/api/cc/status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import db from '@/db/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company_id = session.user.company_id

  // Get latest PACE score
  const paceScore = await db.query(
    `SELECT overall_readiness, confidence_interval
     FROM pace_scores
     WHERE company_id = $1
     ORDER BY calculated_at DESC
     LIMIT 1`,
    [company_id]
  )

  // Get company timeline
  const company = await db.query(
    `SELECT target_listing_date FROM companies WHERE id = $1`,
    [company_id]
  )

  // Count critical alerts
  const criticalCount = await db.query(
    `SELECT COUNT(*) as count
     FROM pace_sequencing_alerts
     WHERE company_id = $1 AND resolved_at IS NULL AND severity = 'critical'`,
    [company_id]
  )

  // Count all open alerts
  const allAlertsCount = await db.query(
    `SELECT COUNT(*) as count
     FROM pace_sequencing_alerts
     WHERE company_id = $1 AND resolved_at IS NULL`,
    [company_id]
  )

  return NextResponse.json({
    readiness: paceScore.rows[0]?.overall_readiness || 0,
    confidenceInterval: paceScore.rows[0]?.confidence_interval || '±2 weeks',
    targetListingDate: company.rows[0]?.target_listing_date,
    criticalCount: criticalCount.rows[0]?.count || 0,
    totalAlertsCount: allAlertsCount.rows[0]?.count || 0,
    timestamp: new Date().toISOString()
  })
}
```

### GET /api/cc/alerts

```typescript
// /app/api/cc/alerts/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import db from '@/db/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company_id = session.user.company_id
  const url = new URL(req.url)
  const severity = url.searchParams.get('severity') || 'critical,warning'
  const limit = parseInt(url.searchParams.get('limit') || '10')

  const severities = severity.split(',')

  const alerts = await db.query(
    `SELECT 
       psa.id, psa.rule, psa.severity, psa.remediation, 
       psa.created_at, psa.resolved_at,
       ac.impact_description, ac.regulatory_reference, ac.owner_email,
       ac.escalation_level
     FROM pace_sequencing_alerts psa
     LEFT JOIN alert_context ac ON psa.id = ac.alert_id
     WHERE psa.company_id = $1 
       AND psa.resolved_at IS NULL
       AND psa.severity = ANY($2)
     ORDER BY psa.severity DESC, psa.created_at DESC
     LIMIT $3`,
    [company_id, severities, limit]
  )

  return NextResponse.json({
    alerts: alerts.rows,
    count: alerts.rows.length,
    timestamp: new Date().toISOString()
  })
}
```

### GET /api/cc/stream (Server-Sent Events)

```typescript
// /app/api/cc/stream/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company_id = session.user.company_id

  // Create a readable stream for Server-Sent Events
  const readable = new ReadableStream({
    async start(controller) {
      // Send initial "connected" event
      controller.enqueue(
        `data: ${JSON.stringify({ type: 'connected', company_id })}\n\n`
      )

      // Set up database listener (PostgreSQL LISTEN/NOTIFY)
      // In production, use a pub/sub system (Redis, etc.)
      
      // Simulate updates for now
      const interval = setInterval(() => {
        controller.enqueue(
          `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`
        )
      }, 30000) // Every 30 seconds

      // Clean up on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

### POST /api/cc/alerts/[id]/escalate

```typescript
// /app/api/cc/alerts/[id]/escalate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import db from '@/db/client'
import { sendEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  if (!session?.user?.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const { message } = await req.json()

  // Get alert details
  const alert = await db.query(
    `SELECT psa.*, ac.owner_email, ac.escalation_level
     FROM pace_sequencing_alerts psa
     LEFT JOIN alert_context ac ON psa.id = ac.alert_id
     WHERE psa.id = $1 AND psa.company_id = $2`,
    [id, session.user.company_id]
  )

  if (alert.rows.length === 0) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }

  const alertData = alert.rows[0]

  // Determine escalation recipients
  const recipients = ['ceo@company.com', 'cfo@company.com']
  if (alertData.escalation_level === 'board') {
    recipients.push('board@company.com')
  }

  // Send escalation emails
  const emailResults = await Promise.all(
    recipients.map(email =>
      sendEmail({
        to: email,
        subject: `[URGENT] Alert Escalation: ${alertData.rule}`,
        template: 'alert-escalation',
        data: { alert: alertData, message, sender: session.user.name }
      })
    )
  )

  // Log escalation in database
  await db.query(
    `UPDATE pace_sequencing_alerts
     SET updated_at = NOW()
     WHERE id = $1`,
    [id]
  )

  return NextResponse.json({
    success: true,
    emailsSent: recipients,
    timestamp: new Date().toISOString()
  })
}
```

---

## Frontend Hook: useCommandCenter

```typescript
// /lib/hooks/useCommandCenter.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'

export function useCommandCenter(companyId: string) {
  const queryClient = useQueryClient()

  // Fetch status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['cc', 'status', companyId],
    queryFn: async () => {
      const res = await fetch('/api/cc/status')
      if (!res.ok) throw new Error('Failed to fetch status')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['cc', 'alerts', companyId],
    queryFn: async () => {
      const res = await fetch('/api/cc/alerts?severity=critical,warning&limit=10')
      if (!res.ok) throw new Error('Failed to fetch alerts')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch actions
  const { data: actions, isLoading: actionsLoading } = useQuery({
    queryKey: ['cc', 'actions', companyId],
    queryFn: async () => {
      const res = await fetch('/api/cc/actions')
      if (!res.ok) throw new Error('Failed to fetch actions')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  // Set up WebSocket listener for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/cc/stream')

    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'task_updated' || data.type === 'alert_resolved') {
        // Invalidate cache to refetch
        queryClient.invalidateQueries({ queryKey: ['cc', 'status'] })
        queryClient.invalidateQueries({ queryKey: ['cc', 'alerts'] })
      }
    })

    return () => eventSource.close()
  }, [queryClient])

  // Helper functions
  const escalateAlert = useCallback(async (alertId: string, message: string) => {
    const res = await fetch(`/api/cc/alerts/${alertId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['cc', 'alerts'] })
    }
    return res.json()
  }, [queryClient])

  const resolveAlert = useCallback(async (alertId: string) => {
    const res = await fetch(`/api/cc/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolvedAt: new Date() })
    })
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['cc', 'alerts'] })
    }
    return res.json()
  }, [queryClient])

  return {
    status,
    alerts,
    actions,
    isLoading: statusLoading || alertsLoading || actionsLoading,
    escalateAlert,
    resolveAlert
  }
}
```

---

## Performance Considerations

### Caching Strategy

| Data | Cache TTL | Invalidation |
|------|-----------|--------------|
| Status | 5 minutes | Task/alert change |
| Alerts | 5 minutes | Alert resolved/escalated |
| Actions | 5 minutes | Action completed |
| User Info | 30 minutes | Manual logout |

### Database Query Optimization

```sql
-- Create indexes for fast lookups
CREATE INDEX idx_pace_sequencing_alerts_company_resolved 
  ON pace_sequencing_alerts(company_id, resolved_at, severity);

CREATE INDEX idx_ceo_actions_company_priority 
  ON ceo_actions(company_id, status, priority);

CREATE INDEX idx_tasks_company_assigned 
  ON tasks(company_id, assigned_to, status);
```

### Frontend Performance

- **Code Splitting:** AlertDetail and ReadinessModal are lazy-loaded
- **Image Optimization:** Charts rendered with recharts (lightweight)
- **State Management:** React Query handles cache + sync
- **Animation:** Framer Motion with GPU acceleration

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/cc-status.test.ts
describe('GET /api/cc/status', () => {
  it('should return readiness percentage', async () => {
    const response = await GET(mockRequest)
    expect(response.status).toBe(200)
    expect(response.json()).toContain('readiness')
  })
})
```

### Integration Tests

```typescript
// __tests__/cc-flow.test.ts
describe('CEO Command Center Flow', () => {
  it('should update dashboard when alert is resolved', async () => {
    // 1. Load dashboard
    // 2. Resolve alert via API
    // 3. Verify SSE event is emitted
    // 4. Verify dashboard updates
  })
})
```

### E2E Tests

```javascript
// cypress/e2e/cc-dashboard.cy.ts
describe('CEO Command Center E2E', () => {
  it('should show critical alerts and allow escalation', () => {
    cy.visit('/dashboard/command-center')
    cy.contains('CRITICAL').should('be.visible')
    cy.contains('[ESCALATE]').click()
    cy.contains('sent to').should('be.visible')
  })
})
```

---

## Deployment Checklist

- [ ] New database tables created (ceo_actions, alert_context)
- [ ] API routes deployed (/api/cc/*)
- [ ] Frontend components built and tested
- [ ] WebSocket/SSE stream working
- [ ] Email templates created (escalation, alert)
- [ ] Monitoring set up (alert latency, SSE connection health)
- [ ] Documentation updated (internal wiki)
- [ ] CEO training session scheduled
- [ ] Beta rollout to 1 company
- [ ] Gather feedback & iterate
- [ ] Full production launch

---

## Document History

| Version | Date       | Author       | Change |
|---------|------------|--------------|--------|
| 1.0     | June 7     | Claude Code  | Initial architecture spec |

---

**End of Document**
