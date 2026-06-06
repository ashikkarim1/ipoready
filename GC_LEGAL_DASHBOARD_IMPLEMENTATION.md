# GC Legal Dashboard - Implementation Guide

## Overview

The GC Legal Intelligence Dashboard is now implemented and ready for integration. This guide covers the current state, data integration points, and next steps.

## Current Implementation

### Files Created

1. **`/GC_LEGAL_DASHBOARD.md`** - Complete design specification (100+ sections)
2. **`/src/app/dashboard/legal/page.tsx`** - Main dashboard component with all 4 panels
3. **`/src/app/dashboard/legal/layout.tsx`** - Page metadata and layout wrapper

### Component Structure

The dashboard is a single-file component with internal sub-components:

- **DocumentCard** - Renders individual legal document status
- **AdvisorCard** - Renders individual advisor engagement status
- **CriticalPathItemComponent** - Renders critical path timeline items
- Main dashboard layout with 4-panel grid + metrics row + ripple warning

### Current Data Flow

**Sample Data (Hardcoded)**:
- `SAMPLE_DOCUMENTS` - 4 legal documents (Articles, By-laws, Stock Plans, Cap Table)
- `SAMPLE_REGULATIONS` - 4 regulatory rules (SEC, State, FINRA)
- `SAMPLE_ADVISORS` - 4 advisor engagements (Counsel, 2 underwriters, Auditor)
- `SAMPLE_CRITICAL_PATH` - 3 critical path items

**State Management**:
```typescript
const [docs, setDocs] = useState<LegalDocument[]>(SAMPLE_DOCUMENTS)
const [advisors, setAdvisors] = useState<AdvisorEngagement[]>(SAMPLE_ADVISORS)
const [regulations, setRegulations] = useState<RegulatoryRule[]>(SAMPLE_REGULATIONS)
const [criticalPath, setCriticalPath] = useState<CriticalPathItem[]>(SAMPLE_CRITICAL_PATH)
```

All data is currently client-side state. Ready to wire to API endpoints.

## Data Integration Checklist

### Phase 1: Document Readiness Integration

**Task**: Connect `DocumentReadinessPanel` to database

```typescript
// Replace SAMPLE_DOCUMENTS with:
useEffect(() => {
  fetch('/api/legal/documents')
    .then(r => r.json())
    .then(data => setDocs(data))
    .catch(err => console.error('Failed to fetch documents:', err))
}, [])
```

**Required API Endpoint**:
```
GET /api/legal/documents
Response: LegalDocument[]
```

**Database Query**:
```sql
SELECT id, name, status, completionPercentage, dueDate, blockerReason, 
       criticialPath, owner, daysOverdue
FROM unified_documents
WHERE type = 'legal' 
ORDER BY dueDate ASC
```

**Fields to Map**:
- `unified_documents.id` → `doc.id`
- `unified_documents.title` → `doc.name`
- `unified_documents.status` → `doc.status`
- `unified_documents.progress` → `doc.completionPercentage`
- `unified_documents.due_date` → `doc.dueDate`
- Add custom field: `critical_path_item` (boolean)
- Add custom field: `blocker_reason` (text)

### Phase 2: Regulatory Compliance Integration

**Task**: Connect `RegulatoryCompliancePanel` to compliance rules database

```typescript
useEffect(() => {
  fetch('/api/legal/regulations')
    .then(r => r.json())
    .then(data => setRegulations(data))
    .catch(err => console.error('Failed to fetch regulations:', err))
}, [])
```

**Required API Endpoint**:
```
GET /api/legal/regulations
Response: RegulatoryRule[]
```

**Database Query**:
```sql
SELECT id, title, jurisdiction, status, description, published_date, impact_level
FROM regulatory_rules
WHERE jurisdiction IN ('SEC', 'State', 'FINRA', 'Exchange')
  AND published_date >= NOW() - INTERVAL '30 days'
ORDER BY published_date DESC
```

**Fields to Map**:
- `regulatory_rules.id` → `rule.id`
- `regulatory_rules.title` → `rule.title`
- `regulatory_rules.jurisdiction` → `rule.jurisdiction`
- `regulatory_rules.compliance_status` → `rule.status`
- `regulatory_rules.description` → `rule.description`
- `DATE_DIFF(published_date, NOW()) < 7` → `rule.isNew`

**Data Sources**:
- SEC.gov RSS feeds for rule changes
- State regulatory websites
- FINRA rule updates
- Scheduled daily scraper (8 AM ET)

### Phase 3: Advisor Coordination Integration

**Task**: Connect `AdvisorCoordinationPanel` to advisor database & calendar

```typescript
useEffect(() => {
  fetch('/api/legal/advisors')
    .then(r => r.json())
    .then(data => setAdvisors(data))
    .catch(err => console.error('Failed to fetch advisors:', err))
}, [])
```

**Required API Endpoints**:
```
GET /api/legal/advisors
Response: AdvisorEngagement[]

GET /api/legal/advisors/:id/meetings
Response: Meeting[]

GET /api/legal/advisors/:id/findings
Response: Finding[]
```

**Database Query** (Advisors):
```sql
SELECT id, name, type, status, completion_percentage, last_updated
FROM advisor_engagements
WHERE company_id = ? AND status NOT IN ('completed', 'archived')
ORDER BY status DESC, updated_at DESC
```

**Database Query** (Next Meeting):
```sql
SELECT scheduled_date, location, attendees
FROM meetings
WHERE advisor_id = ? 
  AND scheduled_date > NOW()
ORDER BY scheduled_date ASC
LIMIT 1
```

**Database Query** (Audit Findings):
```sql
SELECT id, title, status, due_date, remediation_notes
FROM audit_findings
WHERE advisor_id = ? AND type = 'audit'
ORDER BY due_date ASC
```

**Fields to Map**:
- `advisor_engagements.id` → `advisor.id`
- `advisor_engagements.name` → `advisor.name`
- `advisor_engagements.engagement_type` → `advisor.type`
- `advisor_engagements.status_code` → `advisor.status`
- `meetings.scheduled_date` → `advisor.nextMeeting`
- `audit_findings.title` → `advisor.findings[]`

### Phase 4: Critical Path Integration

**Task**: Connect `CriticalPathPanel` to dependencies database

```typescript
useEffect(() => {
  fetch('/api/legal/critical-path')
    .then(r => r.json())
    .then(data => setCriticalPath(data))
    .catch(err => console.error('Failed to fetch critical path:', err))
}, [])
```

**Required API Endpoint**:
```
GET /api/legal/critical-path
Response: CriticalPathItem[]

POST /api/legal/critical-path/:id/delay
Body: { delayDays: number }
Response: { cascadingDelays: { [itemId]: number } }
```

**Database Query** (Critical Path):
```sql
SELECT id, name, status, due_date, blocks_legal_closing
FROM document_dependencies
WHERE is_critical_path = true
  AND company_id = ?
ORDER BY due_date ASC
```

**Database Query** (Cascading Delays):
```sql
SELECT dependent_id, COALESCE(
  SUM(CASE WHEN delay_date > due_date 
           THEN DATEDIFF(day, due_date, delay_date)
           ELSE 0 END), 0) as cascading_days
FROM dependencies
WHERE source_id = ?
GROUP BY dependent_id
```

**Fields to Map**:
- `document_dependencies.id` → `item.id`
- `document_dependencies.title` → `item.name`
- `document_dependencies.status_code` → `item.status`
- `document_dependencies.due_date` → `item.dueDate`
- `document_dependencies.blocks_legal_closing` → `item.blocksLegalClosing`
- Calculate `cascadingDelayDays` from dependency chain

**Timeline Calculation**:
```
Legal Closing Date: 2026-07-15

If Articles (critical path) delayed past 2026-06-20:
  delay = (articles_actual_date - 2026-06-20)
  
  new_legal_closing = 2026-07-15 + delay
  new_prospectus = new_legal_closing - 17 days
  new_ipo_launch = new_legal_closing + 21 days
```

## API Endpoint Specifications

### Document Endpoints

```typescript
// GET /api/legal/documents
interface GetDocumentsResponse {
  documents: LegalDocument[]
  lastSyncedAt: string
  syncStatus: 'success' | 'error'
}

interface LegalDocument {
  id: string
  name: string
  status: 'not-started' | 'in-progress' | 'in-review' | 'approved' | 'overdue'
  completionPercentage: number
  dueDate: string // ISO date
  blockerReason?: string
  criticialPath: boolean
  owner: string
  daysOverdue?: number
  category: 'articles' | 'bylaws' | 'stock-plans' | 'cap-table' | 'resolutions'
  dependencies: string[]
  lastUpdate: string // ISO timestamp
}
```

### Regulatory Endpoints

```typescript
// GET /api/legal/regulations
interface GetRegulationsResponse {
  rules: RegulatoryRule[]
  newRulesThisWeek: number
  complianceRate: number
  lastScrapedAt: string
}

interface RegulatoryRule {
  id: string
  title: string
  jurisdiction: 'SEC' | 'State' | 'FINRA' | 'Exchange'
  status: 'compliant' | 'non-applicable' | 'at-risk'
  description: string
  isNew: boolean
  publishedDate?: string
  effectiveDate?: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  action?: string
  deadline?: string
}
```

### Advisor Endpoints

```typescript
// GET /api/legal/advisors
interface GetAdvisorsResponse {
  advisors: AdvisorEngagement[]
  onScheduleCount: number
  atRiskCount: number
}

interface AdvisorEngagement {
  id: string
  name: string
  type: 'counsel' | 'underwriter' | 'auditor' | 'investor-relations'
  status: 'on-schedule' | 'at-risk' | 'blocked'
  completionPercentage: number
  nextMeeting?: string // ISO timestamp
  lastMeeting?: string // ISO timestamp
  findings?: string[]
  blockers?: string[]
  contactEmail: string
  phone: string
}

// GET /api/legal/advisors/:id/meetings
interface GetMeetingsResponse {
  meetings: Meeting[]
  nextMeetingIn: number // days
}

interface Meeting {
  id: string
  scheduledDate: string // ISO timestamp
  duration: number // minutes
  location: string
  attendees: string[]
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

// GET /api/legal/advisors/:id/findings
interface GetFindingsResponse {
  findings: Finding[]
  unresolvedCount: number
}

interface Finding {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  dueDate: string // ISO date
  remediationNotes: string
  owner: string
}
```

### Critical Path Endpoints

```typescript
// GET /api/legal/critical-path
interface GetCriticalPathResponse {
  items: CriticalPathItem[]
  daysToLegalClosing: number
  bottlenecks: string[]
}

interface CriticalPathItem {
  id: string
  name: string
  status: 'not-started' | 'in-progress' | 'complete'
  dueDate: string // ISO date
  blocksLegalClosing: boolean
  cascadingDelayDays?: number
  dependencies: string[] // Item IDs this depends on
  criticalityScore: number // 1-10
}

// POST /api/legal/critical-path/:id/delay
interface PostDelayRequest {
  delayDays: number
  reason: string
}

interface PostDelayResponse {
  item: CriticalPathItem
  cascadingDelays: {
    [itemId: string]: {
      originalDueDate: string
      newDueDate: string
      delayDays: number
    }
  }
  newLegalClosingDate: string
  newIPOLaunchDate: string
}
```

## Real-Time Updates Setup

### WebSocket Events (Future)

Once WebSocket is established, listen for:

```typescript
// Document status change
socket.on('document.updated', (data: {
  documentId: string
  newStatus: string
  updatedAt: string
}) => {
  setDocs(prev => prev.map(d => d.id === data.documentId 
    ? { ...d, status: data.newStatus }
    : d
  ))
})

// New regulatory rule
socket.on('regulation.new', (data: {
  rule: RegulatoryRule
  affectsUs: boolean
}) => {
  setRegulations(prev => [data.rule, ...prev])
})

// Meeting scheduled
socket.on('meeting.scheduled', (data: {
  advisorId: string
  meeting: Meeting
}) => {
  setAdvisors(prev => prev.map(a => a.id === data.advisorId
    ? { ...a, nextMeeting: data.meeting.scheduledDate }
    : a
  ))
})

// Finding submitted
socket.on('finding.submitted', (data: {
  advisorId: string
  finding: Finding
}) => {
  setAdvisors(prev => prev.map(a => a.id === data.advisorId
    ? { ...a, findings: [...(a.findings || []), data.finding.title] }
    : a
  ))
})

// Critical path item delayed
socket.on('critical-path.delayed', (data: {
  itemId: string
  cascadingDelays: { [itemId: string]: number }
  newLegalClosingDate: string
}) => {
  // Show ripple warning
})
```

## Hook Implementation (Optional)

Create custom hooks for cleaner component code:

**`/src/app/dashboard/legal/hooks/useDocuments.ts`**:
```typescript
import { useState, useEffect } from 'react'
import { LegalDocument } from '../types'

export const useDocuments = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/legal/documents')
        if (!response.ok) throw new Error('Failed to fetch documents')
        const { documents } = await response.json()
        setDocuments(documents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  return { documents, loading, error }
}
```

Then use in component:
```typescript
export default function GCLegalDashboard() {
  const { documents, loading, error } = useDocuments()
  const { advisors } = useAdvisors()
  const { regulations } = useRegulations()
  const { criticalPath } = useCriticalPath()

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} />

  return <DashboardLayout docs={documents} advisors={advisors} ... />
}
```

## Testing Strategy

### Unit Tests

```typescript
// DocumentCard.test.tsx
describe('DocumentCard', () => {
  it('shows red overdue badge for overdue documents', () => {
    const doc: LegalDocument = {
      id: 'test',
      name: 'Articles',
      status: 'overdue',
      daysOverdue: 18,
      // ...
    }
    render(<DocumentCard doc={doc} />)
    expect(screen.getByText(/18 days overdue/)).toBeInTheDocument()
  })

  it('highlights critical path items', () => {
    const doc: LegalDocument = {
      criticialPath: true,
      // ...
    }
    render(<DocumentCard doc={doc} />)
    expect(screen.getByText(/Critical path item/)).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// dashboard.integration.test.tsx
describe('GC Legal Dashboard', () => {
  it('loads and displays all 4 panels', async () => {
    render(<GCLegalDashboard />)
    
    expect(screen.getByText('Document Readiness')).toBeInTheDocument()
    expect(screen.getByText('Regulatory Compliance')).toBeInTheDocument()
    expect(screen.getByText('Advisor Coordination')).toBeInTheDocument()
    expect(screen.getByText('Critical Path & Timeline')).toBeInTheDocument()
  })

  it('shows ripple warning when documents overdue', async () => {
    render(<GCLegalDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Articles of Incorporation Overdue/)).toBeInTheDocument()
    })
  })
})
```

## Performance Optimization

1. **Memoization**: Wrap sub-components with `React.memo()` to prevent re-renders
2. **Lazy Loading**: Load advisor findings/meetings only on expansion
3. **Pagination**: Limit displayed items to 5, load more on scroll
4. **Caching**: Implement SWR or React Query for efficient data fetching
5. **Debouncing**: Delay API calls if user is typing in search

## Accessibility Checklist

- [ ] All status badges have `aria-label` describing meaning
- [ ] Color not sole indicator (use icons + labels)
- [ ] Keyboard navigation (Tab through cards, Enter to expand)
- [ ] Screen reader support for metrics row
- [ ] Contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible on all interactive elements

## Security Considerations

1. **Data Access**: Only authenticated users can view legal dashboard
2. **Role-Based**: Different views for GC vs. CFO vs. Advisor
3. **Audit Trail**: All changes logged with timestamp + user
4. **Encryption**: Sensitive document metadata encrypted at rest
5. **Rate Limiting**: API endpoints rate-limited to prevent scraping

## Deployment Checklist

- [ ] Replace all SAMPLE_* data with API integration
- [ ] Test with real database queries
- [ ] Set up real-time WebSocket connection
- [ ] Configure regulatory rule scraper scheduling
- [ ] Enable audit logging for all changes
- [ ] Set up email notifications for overdue items
- [ ] Test on mobile/tablet responsive layout
- [ ] Run accessibility audit
- [ ] Load test with 100+ documents/rules/advisors
- [ ] Set up performance monitoring/analytics

## Next Steps

1. **Week 1**: Create API endpoints for documents, advisors, regulations
2. **Week 2**: Wire dashboard to live data + test with pilot customer
3. **Week 3**: Implement real-time WebSocket updates
4. **Week 4**: Build drill-down detail pages for each section
5. **Week 5**: Add administrative controls for editing status/dates
6. **Week 6**: Implement analytics dashboard + reporting
