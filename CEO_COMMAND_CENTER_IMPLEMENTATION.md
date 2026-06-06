# CEO Command Center — Implementation Guide

**Version:** 1.0  
**Date:** June 7, 2026  
**Target Sprint:** Phase 1 MVP (Week 1-2)

---

## Quick Start: Build the MVP in 1 Sprint

### Sprint Goal
Ship a working CEO Command Center by end of Sprint. No real-time updates required; static data is fine.

### Deliverables
1. ✅ `/app/dashboard/command-center/page.tsx` - Main page
2. ✅ `StatusCard` component
3. ✅ `AlertsCard` component
4. ✅ `ActionsCard` component
5. ✅ Wire up 3 API endpoints (status, alerts, actions)
6. ✅ Mobile-responsive design
7. ✅ 80%+ Lighthouse score

---

## Step 1: Create the Folder Structure

```bash
mkdir -p src/app/dashboard/command-center/components
mkdir -p src/lib/cc-utils
mkdir -p src/app/api/cc/{alerts,actions}
touch src/app/dashboard/command-center/page.tsx
touch src/app/dashboard/command-center/layout.tsx
touch src/app/dashboard/command-center/components/{StatusCard,AlertsCard,ActionsCard,AlertDetail}.tsx
touch src/lib/cc-api.ts
touch src/lib/hooks/useCommandCenter.ts
```

---

## Step 2: Create the Main Page

**File:** `src/app/dashboard/command-center/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

import { StatusCard } from './components/StatusCard'
import { AlertsCard } from './components/AlertsCard'
import { ActionsCard } from './components/ActionsCard'

export default function CommandCenterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      setIsLoading(false)
    }
  }, [status, router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-nav">CEO Command Center</h1>
              <p className="text-sm text-text-muted mt-1">
                Real-time view of your IPO readiness and critical actions
              </p>
            </div>
            <div className="text-right text-sm text-text-muted">
              Last updated: <span className="font-semibold">2 minutes ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatusCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <AlertsCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ActionsCard />
        </motion.div>
      </div>
    </div>
  )
}
```

---

## Step 3: Build StatusCard Component

**File:** `src/app/dashboard/command-center/components/StatusCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface ReadinessData {
  readiness: number
  timeline: string
  confidence: string
  criticalCount: number
  onTrackCount: number
}

// Mock data (replace with API call in Phase 2)
const mockData: ReadinessData = {
  readiness: 72,
  timeline: 'Sept 6, 2026',
  confidence: 'High (±1 week)',
  criticalCount: 3,
  onTrackCount: 23,
}

export function StatusCard() {
  const [showDetails, setShowDetails] = useState(false)
  const [data] = useState<ReadinessData>(mockData)

  const getReadinessColor = (value: number) => {
    if (value >= 70) return 'text-green-600'
    if (value >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBg = (value: number) => {
    if (value >= 70) return 'bg-green-50 border-green-200'
    if (value >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className={`rounded-xl border-2 p-6 ${getStatusBg(data.readiness)}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-nav mb-2">Your IPO Status</h2>
          <p className="text-sm text-text-muted">Complete picture of your readiness</p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-2 text-sm font-semibold text-nav"
        >
          {showDetails ? 'Hide' : 'Expand'} Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Readiness */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-text-muted uppercase mb-2">Readiness</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black ${getReadinessColor(data.readiness)}`}>
              {data.readiness}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.readiness}%` }}
              transition={{ duration: 1 }}
              className={`h-2 rounded-full ${getReadinessColor(data.readiness).replace('text', 'bg')}`}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-text-muted uppercase mb-2">Target Listing</p>
          <p className="text-lg font-bold text-nav">{data.timeline}</p>
          <p className="text-xs text-text-muted mt-2">{data.confidence}</p>
        </div>

        {/* At Risk */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-xs font-semibold text-red-600 uppercase mb-2">At Risk</p>
          <p className="text-3xl font-black text-red-600">{data.criticalCount}</p>
          <p className="text-xs text-text-muted mt-2">items need attention</p>
        </div>

        {/* On Track */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-600 uppercase mb-2">On Track</p>
          <p className="text-3xl font-black text-green-600">{data.onTrackCount}</p>
          <p className="text-xs text-text-muted mt-2">items on schedule</p>
        </div>
      </div>

      {/* Details (Expandable) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-sm text-text-muted">
            Readiness Score Breakdown:
          </p>
          <div className="space-y-3 mt-4">
            {[
              { name: 'Pre-Planning', value: 100 },
              { name: 'Corporate Restructuring', value: 48 },
              { name: 'Financial Audit', value: 20 },
              { name: 'Legal Documentation', value: 0 },
            ].map(phase => (
              <div key={phase.name} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-nav w-32">{phase.name}</span>
                <div className="flex-1 bg-white rounded-full h-2">
                  <div
                    style={{ width: `${phase.value}%` }}
                    className="h-2 rounded-full bg-accent"
                  />
                </div>
                <span className="text-sm font-semibold text-nav w-10 text-right">
                  {phase.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
```

---

## Step 4: Build AlertsCard Component

**File:** `src/app/dashboard/command-center/components/AlertsCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  phase: string
  daysOverdue: number
  owner: string
  impact: string
  remediation: string[]
  action: string
}

// Mock data
const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Articles of Incorporation',
    phase: 'Legal',
    daysOverdue: 21,
    owner: 'Sarah Chen',
    impact: 'Blocks TSXV listing application',
    remediation: ['Get director residential history', 'Legal counsel reviews', 'Submit to TSXV'],
    action: 'Call legal counsel TODAY',
  },
  {
    id: '2',
    severity: 'warning',
    title: 'Audit Findings',
    phase: 'Financial',
    daysOverdue: -13,
    owner: 'John Lee',
    impact: 'Blocks audit sign-off',
    remediation: ['Schedule board meeting', 'Approve remediation plan'],
    action: 'Board approval needed',
  },
  {
    id: '3',
    severity: 'warning',
    title: 'Valuation Debate',
    phase: 'Markets',
    daysOverdue: 0,
    owner: 'Sarah Chen',
    impact: 'Affects float & pricing',
    remediation: ['Schedule call with underwriters'],
    action: 'Resolve this week',
  },
]

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', badge: '🔴' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', badge: '🟡' },
  info: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', badge: '🟢' },
}

export function AlertsCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [severity, setSeverity] = useState<'all' | 'critical' | 'warning'>('all')

  const filteredAlerts = mockAlerts.filter(
    alert => severity === 'all' || alert.severity === severity
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-nav mb-1">Critical Alerts & Risks</h2>
          <p className="text-sm text-text-muted">Issues that could affect your timeline</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'warning'] as const).map(level => (
            <button
              key={level}
              onClick={() => setSeverity(level)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                severity === level
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-text-muted hover:bg-gray-200'
              }`}
            >
              {level === 'all' ? 'All' : level === 'critical' ? 'Critical' : 'Warnings'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const config = severityConfig[alert.severity]
            const isExpanded = expandedId === alert.id

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${config.bg}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg mt-0.5">{config.badge}</span>
                      <div>
                        <h3 className="font-bold text-nav">{alert.title}</h3>
                        <p className="text-sm text-text-muted">
                          {alert.phase} • {alert.daysOverdue > 0 ? `${alert.daysOverdue} days overdue` : `${Math.abs(alert.daysOverdue)} days until due`}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  <p className="text-sm text-text-muted ml-8">{alert.impact}</p>

                  {/* Quick Action */}
                  <div className="mt-3 ml-8 flex gap-2">
                    <span className="inline-block px-2 py-1 bg-white rounded text-xs font-semibold text-accent">
                      {alert.action}
                    </span>
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 ml-8 pl-4 border-l-2 border-gray-200 space-y-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase mb-2">Remediation Steps:</p>
                        <ol className="space-y-2">
                          {alert.remediation.map((step, i) => (
                            <li key={i} className="text-sm text-text-muted flex gap-2">
                              <span className="font-bold flex-shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700">
                          Escalate
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-nav rounded text-sm font-semibold hover:bg-gray-300">
                          Mark Resolved
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## Step 5: Build ActionsCard Component

**File:** `src/app/dashboard/command-center/components/ActionsCard.tsx`

```typescript
'use client'

import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Action {
  id: string
  priority: 'urgent' | 'high' | 'normal'
  description: string
  dueDate: string
  timeEstimate: string
  actionType: 'decision' | 'review' | 'call' | 'meeting'
  actionButton: string
}

// Mock data
const mockActions: Action[] = [
  {
    id: '1',
    priority: 'urgent',
    description: 'Call legal counsel about articles forms (3 weeks overdue)',
    dueDate: '2026-06-07',
    timeEstimate: '30 mins',
    actionType: 'call',
    actionButton: 'CALL NOW',
  },
  {
    id: '2',
    priority: 'urgent',
    description: 'Review audit board memo (2 findings)',
    dueDate: '2026-06-08',
    timeEstimate: '20 mins',
    actionType: 'review',
    actionButton: 'OPEN FILE',
  },
  {
    id: '3',
    priority: 'high',
    description: 'Board call: valuation + timeline decision',
    dueDate: '2026-06-10',
    timeEstimate: '1 hour',
    actionType: 'decision',
    actionButton: 'SCHEDULE MEETING',
  },
]

const priorityConfig = {
  urgent: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  high: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
  normal: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
}

export function ActionsCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-nav mb-1">Your Actions This Week</h2>
      <p className="text-sm text-text-muted mb-6">
        Decision required: Launch Sept 6 (risky) or delay to January (safe)?
      </p>

      <div className="space-y-3">
        {mockActions.map((action, index) => {
          const config = priorityConfig[action.priority]
          const Icon = config.icon

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${config.bg} rounded-lg p-4 border-l-4 transition-colors hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-nav text-sm">{action.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-muted">
                    <span>Due: {action.dueDate}</span>
                    <span>Est. {action.timeEstimate}</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-accent text-white rounded text-xs font-bold whitespace-nowrap hover:opacity-90">
                  {action.actionButton}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
        <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold text-sm hover:opacity-90">
          View Full Task List
        </button>
        <button className="flex-1 px-4 py-2 border-2 border-accent text-accent rounded-lg font-semibold text-sm hover:bg-red-50">
          Export Agenda
        </button>
      </div>
    </div>
  )
}
```

---

## Step 6: Wire Up API Endpoints

**File:** `src/app/api/cc/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Replace with actual database query
  return NextResponse.json({
    readiness: 72,
    timeline: 'Sept 6, 2026',
    confidence: 'High (±1 week)',
    criticalCount: 3,
    onTrackCount: 23,
  })
}
```

**File:** `src/app/api/cc/alerts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Replace with actual database query
  return NextResponse.json({
    alerts: [
      {
        id: '1',
        severity: 'critical',
        title: 'Articles of Incorporation',
        daysOverdue: 21,
      },
      // ... more alerts
    ],
  })
}
```

---

## Step 7: Test & Deploy

### Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to dashboard
http://localhost:3000/dashboard/command-center

# 3. Check console for any errors
# 4. Verify cards render correctly
# 5. Test responsive design (mobile, tablet)
```

### Lighthouse Check

```bash
npm run build
npm run start

# Run Lighthouse audit
# Target: 80+ scores across all metrics
```

### Deploy to Production

```bash
# Create PR with new files
git add .
git commit -m "CEO Command Center MVP - Phase 1 complete"
git push origin ceo-command-center

# Create PR, get review, merge
# Deploy to production
```

---

## Phase 2: Real-Time Updates (Next Sprint)

Once MVP is deployed and validated with actual data:

1. **Wire up real database:** Replace mock data with `/api/cc/*` calls
2. **Add WebSocket stream:** Implement SSE for real-time updates
3. **Build drill-down modals:** ReadinessModal, AlertDetail side panel
4. **Add interactivity:** [CALL NOW], [ESCALATE], [SCHEDULE] buttons
5. **Implement caching:** React Query with proper invalidation

---

## Common Issues & Solutions

### Issue: "hydration mismatch" error

**Solution:** Wrap component in `<Suspense>` or use `useEffect` to set initial state.

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

### Issue: Framer Motion causing layout shift

**Solution:** Ensure all animated elements have fixed dimensions.

```typescript
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  <div style={{ minHeight: '200px' }}>Content</div>
</motion.div>
```

### Issue: API calls returning old data

**Solution:** Add `cache: 'no-store'` to fetch calls or use Next.js revalidation.

```typescript
const res = await fetch('/api/cc/status', { cache: 'no-store' })
```

---

## File Checklist

```
[ ] src/app/dashboard/command-center/page.tsx
[ ] src/app/dashboard/command-center/layout.tsx
[ ] src/app/dashboard/command-center/components/StatusCard.tsx
[ ] src/app/dashboard/command-center/components/AlertsCard.tsx
[ ] src/app/dashboard/command-center/components/ActionsCard.tsx
[ ] src/app/api/cc/status/route.ts
[ ] src/app/api/cc/alerts/route.ts
[ ] src/app/api/cc/actions/route.ts
[ ] src/lib/cc-api.ts (optional: API client)
[ ] src/lib/hooks/useCommandCenter.ts (optional: custom hook)
```

---

## Success Criteria

- ✅ Page loads in <1 second
- ✅ Mobile responsive (<768px)
- ✅ All 3 cards render correctly
- ✅ Cards expand/collapse smoothly
- ✅ No console errors
- ✅ Lighthouse score >80
- ✅ CEO can see status at a glance
- ✅ Critical alerts are prominently displayed
- ✅ Action items are clear and actionable

---

**End of Document**
