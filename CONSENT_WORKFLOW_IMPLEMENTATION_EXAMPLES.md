# Consent Workflow Implementation Examples

## Quick Start

### 1. Basic Component Usage

```typescript
// In your dashboard page
import { ConsentWorkflow } from '@/components/ConsentWorkflow'

export default function ComplianceDashboard() {
  return (
    <div className="min-h-screen">
      <ConsentWorkflow />
    </div>
  )
}
```

### 2. With Header & Navigation

```typescript
import { ConsentWorkflow } from '@/components/ConsentWorkflow'
import { ChevronRight } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div>
      {/* Navigation Breadcrumb */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Compliance</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Consents</span>
        </div>
      </nav>

      {/* Main Component */}
      <ConsentWorkflow />
    </div>
  )
}
```

## Advanced Usage

### 1. With Backend API Integration

```typescript
'use client'

import { useEffect, useState } from 'react'
import { ConsentWorkflow } from '@/components/ConsentWorkflow'
import type { ConsentRequest } from '@/components/ConsentWorkflow'

export default function ConsentManagementPage() {
  const [consents, setConsents] = useState<ConsentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch consents from API
  useEffect(() => {
    async function fetchConsents() {
      try {
        const response = await fetch('/api/compliance/consents?company_id=123')
        if (!response.ok) throw new Error('Failed to fetch consents')

        const data = await response.json()
        setConsents(data.consents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchConsents()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Loading consents...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>
  }

  return <ConsentWorkflow />
}
```

### 2. With Custom Status Handler

```typescript
'use client'

import { useState } from 'react'
import { ConsentWorkflow } from '@/components/ConsentWorkflow'
import type { ConsentRequest, ConsentStatus } from '@/components/ConsentWorkflow'

export default function ConsentWorkflowWithSync() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleStatusChange = async (id: string, status: ConsentStatus) => {
    setIsSyncing(true)
    try {
      const response = await fetch(`/api/compliance/consents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      // Success - component will re-render
      console.log(`Consent ${id} updated to ${status}`)
    } catch (error) {
      console.error('Status update failed:', error)
      // Show error toast to user
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div>
      {isSyncing && (
        <div className="fixed top-4 right-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          Updating...
        </div>
      )}
      <ConsentWorkflow />
    </div>
  )
}
```

## Utility Function Examples

### 1. Compliance Calculation

```typescript
import {
  calculateConsentCompliance,
  getRequiredConsentsForExchange,
  getComplianceWarnings,
} from '@/lib/consent-utils'
import type { ConsentRecord } from '@/lib/consent-utils'

function checkComplianceStatus(consents: ConsentRecord[], exchange: 'tsx' | 'nasdaq') {
  // Calculate overall compliance
  const summary = calculateConsentCompliance(consents, exchange)
  console.log(`Compliance: ${summary.compliance_percentage}%`)
  console.log(`Signed: ${summary.signed}/${summary.total}`)

  // Get exchange requirements
  const required = getRequiredConsentsForExchange(exchange)
  console.log(`Required for ${exchange}:`, required)

  // Get compliance warnings
  const warnings = getComplianceWarnings(consents)
  warnings.forEach((warning) => console.warn(warning))

  return {
    summary,
    required,
    warnings,
    isCompliant: summary.compliance_percentage === 100,
  }
}
```

### 2. Letter Template Generation

```typescript
import { generateConsentLetterTemplate } from '@/lib/consent-utils'

function downloadConsentLetter(
  entityType: 'auditor' | 'lawyer',
  entityName: string,
  exchange: 'tsx' | 'nasdaq',
  companyName: string
) {
  // Generate template
  const template = generateConsentLetterTemplate(
    entityType,
    entityName,
    exchange,
    companyName
  )

  // Create HTML document
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${template.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .letter { max-width: 600px; margin: 40px; }
          .requirement { margin-left: 20px; }
        </style>
      </head>
      <body>
        <div class="letter">
          <p>${template.greeting}</p>
          <p>${template.introduction}</p>
          <p><strong>Required Confirmations:</strong></p>
          <ul>
            ${template.requirements.map((req) => `<li class="requirement">${req}</li>`).join('')}
          </ul>
          <p><strong>Timeline:</strong></p>
          <p>${template.timeline}</p>
          <p>${template.closing}</p>
          <p>${template.signature_line}</p>
        </div>
      </body>
    </html>
  `

  // Download as HTML file
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entityName}-consent-letter.html`
  a.click()
  URL.revokeObjectURL(url)
}
```

### 3. Filtering & Sorting

```typescript
import {
  filterConsentsByStatus,
  filterConsentsByEntityType,
  sortConsentsByExpiry,
  isExpiringSoon,
} from '@/lib/consent-utils'
import type { ConsentRecord, ConsentStatus } from '@/lib/consent-utils'

function getUrgentConsents(consents: ConsentRecord[]) {
  // Get pending consents that are expiring soon
  const pending = filterConsentsByStatus(consents, 'pending')
  const expiringSoon = pending.filter((c) => isExpiringSoon(c.expiry_date, 30))
  const sorted = sortConsentsByExpiry(expiringSoon, true)

  return sorted
}

function getAuditorConsents(consents: ConsentRecord[]) {
  // Get all auditor consents, sorted by expiry
  const auditors = filterConsentsByEntityType(consents, 'auditor')
  return sortConsentsByExpiry(auditors, true)
}
```

## API Integration Patterns

### 1. Next.js API Route Handler

```typescript
// src/app/api/compliance/consents/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('company_id')

  if (!companyId) {
    return NextResponse.json(
      { error: 'company_id required' },
      { status: 400 }
    )
  }

  try {
    // Fetch from database
    const consents = await db.consent_letters.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({
      consents,
      count: consents.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch consents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { company_id, from_entity, entity_type, consent_type, expiry_date } = body

  try {
    // Create new consent
    const consent = await db.consent_letters.create({
      data: {
        id: crypto.randomUUID(),
        company_id,
        from_entity,
        entity_type,
        consent_type,
        status: 'pending',
        expiry_date,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json(
      { consent, message: 'Consent created' },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create consent' },
      { status: 500 }
    )
  }
}
```

### 2. Consent Status Update Handler

```typescript
// src/app/api/compliance/consents/[id]/route.ts

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await request.json()
  const { status, document_url, expiry_date } = body

  try {
    const consent = await db.consent_letters.update({
      where: { id },
      data: {
        status,
        document_url,
        expiry_date,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      consent,
      message: 'Consent updated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update consent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // Soft delete - update status to withdrawn
    await db.consent_letters.update({
      where: { id },
      data: {
        status: 'withdrawn',
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Consent withdrawn successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to withdraw consent' },
      { status: 500 }
    )
  }
}
```

### 3. Template Generation Endpoint

```typescript
// src/app/api/compliance/consents/generate/route.ts

import { generateConsentLetterTemplate } from '@/lib/consent-utils'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { company_id, entity_type, from_entity, exchange, format } = body

  try {
    // Get company details
    const company = await db.companies.findUnique({
      where: { id: company_id },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Generate template
    const template = generateConsentLetterTemplate(
      entity_type,
      from_entity,
      exchange,
      company.name
    )

    // For HTML format, include basic HTML
    if (format === 'html') {
      template.html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${template.subject}</title>
          </head>
          <body>
            <p>${template.greeting}</p>
            <p>${template.introduction}</p>
            <h3>Requirements:</h3>
            <ul>
              ${template.requirements.map((r) => `<li>${r}</li>`).join('')}
            </ul>
            <p><strong>${template.timeline}</strong></p>
            <p>${template.closing}</p>
            <p>${template.signature_line}</p>
          </body>
        </html>
      `
    }

    return NextResponse.json({
      template,
      company: {
        id: company.id,
        name: company.name,
      },
      exchange,
      entity_type,
      from_entity,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
```

## React Hook Usage

### 1. Custom Hook for Consent Management

```typescript
// src/hooks/useConsentManagement.ts

import { useState, useCallback, useEffect } from 'react'
import type { ConsentRequest } from '@/components/ConsentWorkflow'

export function useConsentManagement(companyId: string) {
  const [consents, setConsents] = useState<ConsentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch consents
  useEffect(() => {
    async function fetch() {
      try {
        const res = await fetch(`/api/consents?company_id=${companyId}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setConsents(data.consents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [companyId])

  // Update status
  const updateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await fetch(`/api/consents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        if (!res.ok) throw new Error('Update failed')

        const data = await res.json()
        setConsents(
          consents.map((c) => (c.id === id ? { ...c, status } : c))
        )

        return data.consent
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
        throw err
      }
    },
    [consents]
  )

  // Create new consent
  const createConsent = useCallback(
    async (consent: Omit<ConsentRequest, 'id'>) => {
      try {
        const res = await fetch('/api/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...consent, company_id: companyId }),
        })

        if (!res.ok) throw new Error('Creation failed')

        const data = await res.json()
        setConsents([...consents, data.consent])

        return data.consent
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
        throw err
      }
    },
    [companyId, consents]
  )

  return {
    consents,
    loading,
    error,
    updateStatus,
    createConsent,
  }
}
```

### 2. Usage in Component

```typescript
'use client'

import { useConsentManagement } from '@/hooks/useConsentManagement'

export function MyConsentComponent() {
  const { consents, loading, error, updateStatus } = useConsentManagement('company-123')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Consents: {consents.length}</h1>
      {consents.map((consent) => (
        <div key={consent.id}>
          <h3>{consent.stakeholder}</h3>
          <p>Status: {consent.status}</p>
          <button
            onClick={() => updateStatus(consent.id, 'signed')}
          >
            Mark as Signed
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Testing Examples

### 1. Component Testing with Vitest

```typescript
// src/components/__tests__/ConsentWorkflow.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { ConsentWorkflow } from '../ConsentWorkflow'

describe('ConsentWorkflow', () => {
  it('renders compliance dashboard', () => {
    render(<ConsentWorkflow />)
    expect(screen.getByText('Compliance')).toBeInTheDocument()
  })

  it('opens new consent modal', () => {
    render(<ConsentWorkflow />)
    const btn = screen.getByText('New Consent')
    fireEvent.click(btn)
    expect(screen.getByText('New Consent Request')).toBeInTheDocument()
  })

  it('filters by status', () => {
    render(<ConsentWorkflow />)
    const select = screen.getByDisplayValue('All Status')
    fireEvent.change(select, { target: { value: 'signed' } })
    // Verify filtered results
  })
})
```

### 2. Utility Function Testing

```typescript
// src/lib/__tests__/consent-utils.test.ts

import { calculateConsentCompliance, isExpiringSoon } from '../consent-utils'

describe('consent-utils', () => {
  it('calculates compliance percentage', () => {
    const consents = [
      { status: 'signed', id: '1' },
      { status: 'pending', id: '2' },
      { status: 'signed', id: '3' },
    ]

    const result = calculateConsentCompliance(consents as any)
    expect(result.compliance_percentage).toBe(67)
  })

  it('detects expiring consents', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 15)

    expect(isExpiringSoon(tomorrow.toString(), 30)).toBe(true)
  })
})
```

## Performance Optimization

### 1. Memoization Pattern

```typescript
const filteredConsents = useMemo(() => {
  return consents.filter((c) => {
    const matchesSearch = c.stakeholder.includes(searchTerm)
    const matchesStatus = !filterStatus || c.status === filterStatus
    return matchesSearch && matchesStatus
  })
}, [consents, searchTerm, filterStatus])
```

### 2. Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList } from 'react-window'

function ConsentListVirtual({ consents }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={consents.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ConsentRow consent={consents[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

## Production Checklist

- [ ] Connect to backend API
- [ ] Add authentication/authorization
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Set up analytics tracking
- [ ] Configure logging
- [ ] Add security headers
- [ ] Implement rate limiting
- [ ] Set up automated backups
- [ ] Configure CDN for assets
- [ ] Add monitoring/alerting
- [ ] Create deployment pipeline
