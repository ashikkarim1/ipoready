# Build 2C.1 - Integration Examples

## Using the Component

### Basic Integration

```typescript
// In a page or component
'use client'

import { ResolutionsManager2C1 } from '@/components/ResolutionsManager2C1'

export default function CompliancePage() {
  return <ResolutionsManager2C1 />
}
```

### With Layout

```typescript
// app/compliance/layout.tsx
export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b">
        {/* Navigation */}
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
```

### With Custom Theme

```typescript
import { ResolutionsManager2C1 } from '@/components/ResolutionsManager2C1'

export default function CustomThemedResolutions() {
  return (
    <div className="bg-custom-bg">
      <ResolutionsManager2C1 />
    </div>
  )
}
```

---

## API Usage Examples

### Fetch Resolutions in a Server Component

```typescript
// lib/resolutions.ts
export async function getResolutions(companyId: string) {
  const response = await fetch(
    `/api/compliance/resolutions?companyId=${companyId}`,
    { cache: 'no-store' }
  )
  
  if (!response.ok) throw new Error('Failed to fetch resolutions')
  const data = await response.json()
  return data.resolutions
}

// In a component
const resolutions = await getResolutions(companyId)
```

### Create Resolution from Outside Component

```typescript
// lib/resolutionActions.ts
export async function createResolution(formData: {
  companyId: string
  userId: string
  resolutionType: string
  companyName: string
  approvalDate: string
  boardMembers: string[]
}) {
  const response = await fetch('/api/compliance/resolutions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  
  return response.json()
}

// Usage
const result = await createResolution({
  companyId: '123',
  userId: '456',
  resolutionType: 'stock_split',
  companyName: 'Example Corp',
  approvalDate: '2026-06-03',
  boardMembers: ['Sarah Chen', 'Michael Rodriguez'],
})
```

### Record Approval from External System

```typescript
// lib/approvalActions.ts
export async function approveResolution(
  resolutionId: string,
  boardMemberName: string,
  signatureData?: string
) {
  const response = await fetch(
    `/api/compliance/resolutions/${resolutionId}/approve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardMemberName,
        approvalDate: new Date().toISOString(),
        signatureData,
      }),
    }
  )
  
  return response.json()
}
```

### Check Approval Status

```typescript
// lib/approvalStatus.ts
export async function getApprovalStatus(resolutionId: string) {
  const response = await fetch(
    `/api/compliance/resolutions/${resolutionId}/approve`
  )
  
  const data = await response.json()
  return {
    approved: data.summary.approved,
    total: data.summary.total,
    percentage: data.summary.percentage,
    approvals: data.approvals,
  }
}

// Usage
const status = await getApprovalStatus('res-001')
console.log(`${status.approved}/${status.total} board members approved (${status.percentage}%)`)
```

---

## Integration with PACE System

### Track Resolution Completion in PACE

```typescript
// lib/pace-integration.ts
import { getResolutions } from './resolutions'

export async function calculateResolutionCompleteness(companyId: string) {
  const resolutions = await getResolutions(companyId)
  
  const executed = resolutions.filter(r => r.status === 'executed').length
  const total = resolutions.length
  
  return {
    completedResolutions: executed,
    totalResolutions: total,
    percentage: (executed / total) * 100,
  }
}

// Add to PACE confidence calculation
export function resolutionConfidenceFactor(
  completedResolutions: number,
  totalResolutions: number
): number {
  // Penalize missing resolutions
  const ratio = completedResolutions / totalResolutions
  return ratio * 0.15 // 15% weight on PACE score
}
```

### Display in PACE Dashboard

```typescript
// components/PaceResolutionCard.tsx
import { getResolutions } from '@/lib/resolutions'
import { ResolutionStatus } from '@/components/ResolutionsManager2C1'

export async function PaceResolutionCard({ companyId }: { companyId: string }) {
  const resolutions = await getResolutions(companyId)
  const executed = resolutions.filter(r => r.status === 'executed').length
  
  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-semibold">Resolution Completeness</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">
        {executed}/{resolutions.length}
      </p>
      <div className="mt-3 bg-slate-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${(executed / resolutions.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
```

---

## Integration with Navigation

### Add Menu Item

```typescript
// config/navigation.ts
export const COMPLIANCE_MENU = [
  {
    label: 'Resolutions',
    href: '/compliance/resolutions',
    icon: 'FileText',
    badge: 'New',
  },
  {
    label: 'Documents',
    href: '/compliance/documents',
    icon: 'Files',
  },
]

// In header/sidebar
{COMPLIANCE_MENU.map(item => (
  <Link
    key={item.href}
    href={item.href}
    className="flex items-center gap-2 px-4 py-2"
  >
    {item.label}
    {item.badge && <span className="badge">{item.badge}</span>}
  </Link>
))}
```

---

## Integration with Email Notifications

### Send Approval Notification

```typescript
// lib/emailNotifications.ts
import { sendEmail } from '@/lib/email-service'

export async function notifyBoardMemberApproval(
  resolution: any,
  boardMemberEmail: string,
  approvalStatus: any
) {
  await sendEmail({
    to: boardMemberEmail,
    subject: `Resolution Approval Needed: ${resolution.title}`,
    template: 'resolution-approval',
    data: {
      resolutionTitle: resolution.title,
      resolutionType: resolution.type,
      pendingApprovals: approvalStatus.pending,
      totalApprovals: approvalStatus.total,
      approvalLink: `/compliance/resolutions/${resolution.id}`,
    },
  })
}

// Email template: resolution-approval.tsx
export function ResolutionApprovalEmail({ 
  resolutionTitle, 
  pendingApprovals,
  totalApprovals,
  approvalLink 
}: any) {
  return (
    <div>
      <h2>{resolutionTitle}</h2>
      <p>
        This resolution requires your approval.
        {pendingApprovals} of {totalApprovals} board members have approved.
      </p>
      <a href={approvalLink}>Review & Approve</a>
    </div>
  )
}
```

### Send Completion Notification

```typescript
export async function notifyResolutionComplete(
  resolution: any,
  boardMembers: any[]
) {
  for (const member of boardMembers) {
    await sendEmail({
      to: member.email,
      subject: `Resolution Approved: ${resolution.title}`,
      template: 'resolution-complete',
      data: {
        resolutionTitle: resolution.title,
        effectiveDate: resolution.effectiveDate,
      },
    })
  }
}
```

---

## Integration with Document Generation

### Generate PDF from Resolution

```typescript
// lib/resolutionPDF.ts
import { PDFDocument } from 'pdf-lib'

export async function generateResolutionPDF(resolution: any) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  
  // Add title
  page.drawText(resolution.title, {
    x: 50,
    y: height - 50,
    size: 16,
    font: 'Helvetica-Bold',
  })
  
  // Add content
  page.drawText(resolution.content, {
    x: 50,
    y: height - 100,
    size: 11,
    maxWidth: width - 100,
  })
  
  // Add signatures section
  page.drawText('Approved by:', {
    x: 50,
    y: 100,
    size: 12,
    font: 'Helvetica-Bold',
  })
  
  const approvedMembers = resolution.boardMembers
    .filter(m => m.approved)
    .map((m, i) => ({
      text: `${m.name} - ${m.approvalDate}`,
      y: 80 - i * 20,
    }))
  
  approvedMembers.forEach(member => {
    page.drawText(member.text, {
      x: 50,
      y: member.y,
      size: 10,
    })
  })
  
  return pdfDoc.save()
}

// Usage
const pdfBytes = await generateResolutionPDF(resolution)
const response = new Response(pdfBytes, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=resolution.pdf',
  },
})
```

---

## Integration with Board Meeting Module

### Link Resolutions to Meetings

```typescript
// lib/boardMeetingIntegration.ts
export interface BoardMeeting {
  id: string
  date: string
  resolutions: string[] // Resolution IDs
}

export async function createBoardMeeting(meeting: BoardMeeting) {
  // Create meeting record
  // Link resolutions
  // Send calendar invites
}

// In components
export function BoardMeetingWithResolutions({ meetingId }: any) {
  const meeting = useBoardMeeting(meetingId)
  const resolutions = useResolutions(meeting.resolutions)
  
  return (
    <div>
      <h2>{meeting.date}</h2>
      <section>
        <h3>Resolutions for Discussion</h3>
        {resolutions.map(res => (
          <ResolutionItem key={res.id} resolution={res} />
        ))}
      </section>
    </div>
  )
}
```

---

## Integration with Audit Log

### Log Resolution Actions

```typescript
// lib/auditLog.ts
export async function logResolutionAction(
  action: string,
  resolution: any,
  userId: string,
  details?: any
) {
  await fetch('/api/audit-log', {
    method: 'POST',
    body: JSON.stringify({
      action,
      entityType: 'resolution',
      entityId: resolution.id,
      userId,
      timestamp: new Date(),
      details,
      changes: {
        before: details?.before,
        after: details?.after,
      },
    }),
  })
}

// Track all major actions
export async function trackResolutionCreate(resolution: any, userId: string) {
  await logResolutionAction('CREATE', resolution, userId, {
    type: resolution.type,
    boardMembers: resolution.boardMembers.length,
  })
}

export async function trackResolutionApprove(
  resolution: any,
  userId: string,
  boardMemberName: string
) {
  await logResolutionAction('APPROVE', resolution, userId, {
    boardMember: boardMemberName,
  })
}

export async function trackResolutionExecute(resolution: any, userId: string) {
  await logResolutionAction('EXECUTE', resolution, userId, {
    effectiveDate: resolution.effectiveDate,
  })
}
```

---

## Integration with Dashboard Widget

### Add Resolution Status Widget

```typescript
// components/DashboardResolutionWidget.tsx
import { getResolutions } from '@/lib/resolutions'

export async function ResolutionStatusWidget({ companyId }: any) {
  const resolutions = await getResolutions(companyId)
  
  const stats = {
    total: resolutions.length,
    draft: resolutions.filter(r => r.status === 'draft').length,
    approved: resolutions.filter(r => r.status === 'approved').length,
    executed: resolutions.filter(r => r.status === 'executed').length,
  }
  
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Board Resolutions</h3>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} color="slate" />
        <StatCard label="Draft" value={stats.draft} color="slate" />
        <StatCard label="Approved" value={stats.approved} color="amber" />
        <StatCard label="Executed" value={stats.executed} color="green" />
      </div>
      
      <a
        href="/compliance/resolutions"
        className="mt-4 text-blue-600 hover:text-blue-700"
      >
        Manage Resolutions →
      </a>
    </div>
  )
}

function StatCard({ label, value, color }: any) {
  const colors = {
    slate: 'bg-slate-100 text-slate-900',
    amber: 'bg-amber-100 text-amber-900',
    green: 'bg-green-100 text-green-900',
  }
  
  return (
    <div className={`rounded-lg p-3 ${colors[color]}`}>
      <p className="text-xs font-semibold opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
```

---

## Testing Examples

### Unit Test for Resolution Creation

```typescript
// __tests__/resolutions.test.ts
import { createResolution } from '@/lib/resolutionActions'

describe('Resolution Management', () => {
  it('should create a new resolution', async () => {
    const result = await createResolution({
      companyId: 'test-company-1',
      userId: 'test-user-1',
      resolutionType: 'stock_split',
      companyName: 'Test Corp',
      approvalDate: '2026-06-03',
      boardMembers: ['Alice', 'Bob'],
    })
    
    expect(result.success).toBe(true)
    expect(result.resolution.status).toBe('draft')
    expect(result.resolution.totalBoardMembers).toBe(2)
  })
})
```

### Integration Test for Approvals

```typescript
describe('Resolution Approvals', () => {
  it('should update status to approved when all members approve', async () => {
    const res = await createResolution(testData)
    
    await approveResolution(res.id, 'Alice')
    await approveResolution(res.id, 'Bob')
    
    const status = await getApprovalStatus(res.id)
    expect(status.approved).toBe(2)
    expect(status.percentage).toBe(100)
  })
})
```

---

**Integration ready for production deployment!**
