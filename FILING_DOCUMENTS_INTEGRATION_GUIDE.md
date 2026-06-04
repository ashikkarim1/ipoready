# Filing Documents API - Integration Guide

## Overview

The Filing Documents API provides complete document management for IPO filing workflows across multiple exchanges (SEC, TSX, TSXV, etc.). This guide covers implementation and integration points.

## Files Created

### API Routes
```
src/app/api/filing-documents/
├── upload-doc/[documentTypeId]/route.ts    # POST - Upload document
├── get-requirements/route.ts               # GET - Fetch document requirements
├── update-status/route.ts                  # POST - Update document status
├── get-document/route.ts                   # GET - Retrieve document
├── delete/route.ts                         # DELETE - Delete document
├── progress/route.ts                       # GET - Filing progress
├── templates/route.ts                      # GET - Document templates
├── README.md                               # Full documentation
└── API_DOCUMENTATION.md                    # Detailed API specs
```

### Types & Utilities
```
src/types/filing-documents.ts               # Complete type definitions
src/lib/filing-documents-client.ts          # Client-side utility functions
src/hooks/useFilingDocuments.ts             # React hooks for document management
```

### Database Schema
```
src/db/migrations/20260604_filing_documents.sql
```

## Quick Integration (5 minutes)

### 1. Use the Hook (Recommended)

```typescript
'use client'

import { useFilingDocuments } from '@/hooks/useFilingDocuments'

export function FilingDashboard() {
  const { state, actions } = useFilingDocuments({
    exchangeId: 'tsx',
    autoLoad: true
  })

  return (
    <div>
      <h1>Filing Progress: {state.progress?.overall}%</h1>
      
      {state.documents.map(doc => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          onUpload={actions.uploadDocument}
          onStatusChange={actions.updateStatus}
        />
      ))}
      
      {state.error && <ErrorAlert message={state.error} />}
    </div>
  )
}
```

### 2. Direct API Calls

```typescript
import { 
  uploadDocument, 
  getRequirements, 
  updateDocumentStatus 
} from '@/lib/filing-documents-client'

// Get requirements
const { documents, progressPercent } = await getRequirements('tsx')

// Upload file
const result = await uploadDocument(documentTypeId, file)

// Update status
await updateDocumentStatus({
  documentId: result.documentId,
  status: 'verified',
  notes: 'Legal review completed'
})
```

### 3. Fetch API

```typescript
// Get requirements
const response = await fetch(
  '/api/filing-documents/get-requirements?exchange_id=tsx'
)
const data = await response.json()

// Upload document
const formData = new FormData()
formData.append('file', selectedFile)
const uploadRes = await fetch(
  `/api/filing-documents/upload-doc/${documentTypeId}`,
  { method: 'POST', body: formData }
)
```

## Implementation Examples

### Document Upload Component

```typescript
'use client'

import { useState } from 'react'
import { useFileUpload } from '@/hooks/useFilingDocuments'
import { validateFile } from '@/lib/filing-documents-client'

interface DocumentUploadProps {
  documentTypeId: string
  documentName: string
  onSuccess?: () => void
}

export function DocumentUpload({
  documentTypeId,
  documentName,
  onSuccess
}: DocumentUploadProps) {
  const { loading, error, progress, upload } = useFileUpload(onSuccess)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      const validation = validateFile(selected)
      if (!validation.valid) {
        alert(validation.error)
        return
      }
      setFile(selected)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    try {
      await upload(documentTypeId, file)
      setFile(null)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h3>{documentName}</h3>
      
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={loading}
      />
      
      {file && <p>Selected: {file.name}</p>}
      
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
```

### Progress Tracker Component

```typescript
'use client'

import { useFilingDocuments } from '@/hooks/useFilingDocuments'
import { CATEGORY_ICONS, STATUS_COLORS } from '@/types/filing-documents'

export function ProgressTracker({ exchangeId }) {
  const { state } = useFilingDocuments({ exchangeId })

  if (!state.progress) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div>
        <h2 className="text-xl font-bold mb-2">
          Overall Progress: {state.progress.overall}%
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${state.progress.overall}%` }}
          />
        </div>
      </div>

      {/* By Category */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(state.progress.byCategory).map(([category, percent]) => (
          <div key={category} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{category}</h3>
            <p className="text-2xl font-bold mb-2">{percent}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Document List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        <div className="space-y-2">
          {state.documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{doc.documentName}</p>
                <p className="text-sm text-gray-600">{doc.category}</p>
              </div>
              <span
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: STATUS_COLORS[doc.currentStatus] }}
              >
                {doc.currentStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Requirements Checklist

```typescript
'use client'

import { useFilingDocuments } from '@/hooks/useFilingDocuments'
import { DocumentStatus } from '@/types/filing-documents'

export function RequirementsChecklist({ exchangeId }: { exchangeId: string }) {
  const { state, actions } = useFilingDocuments({ exchangeId })

  const handleStatusChange = async (
    documentId: string,
    status: DocumentStatus
  ) => {
    try {
      await actions.updateStatus(documentId, status)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const statuses: DocumentStatus[] = [
    'not_started',
    'in_progress',
    'ready',
    'uploaded',
    'verified'
  ]

  return (
    <div className="space-y-4">
      {state.documents.map(doc => (
        <div key={doc.id} className="border rounded p-4">
          <div className="mb-3">
            <h3 className="font-bold">{doc.documentName}</h3>
            <p className="text-sm text-gray-600">
              Category: {doc.category}
              {doc.isRequired ? ' (Required)' : ' (Optional)'}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(doc.id, status)}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
                  ${doc.currentStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {doc.uploadedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
```

## Dashboard Integration

### Add to Dashboard Layout

```typescript
// src/app/dashboard/layout.tsx
import { FilingDocumentsPanel } from '@/components/FilingDocumentsPanel'

export default function DashboardLayout({ children }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {children}
      </div>
      <aside>
        <FilingDocumentsPanel />
      </aside>
    </div>
  )
}
```

### Create Dashboard Card Component

```typescript
// src/components/FilingDocumentsPanel.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useFilingDocuments } from '@/hooks/useFilingDocuments'

export function FilingDocumentsPanel() {
  const { data: session } = useSession()
  const { state } = useFilingDocuments({
    exchangeId: session?.user?.exchangeId,
    autoLoad: true
  })

  if (!state.progress) return null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Filing Progress</h3>
      
      <div className="mb-4">
        <p className="text-3xl font-bold text-blue-600">
          {state.progress.overall}%
        </p>
        <p className="text-sm text-gray-600">
          {state.progress.completedCount} of {state.progress.totalCount} complete
        </p>
      </div>

      <div className="space-y-2">
        {Object.entries(state.progress.byCategory).map(([cat, pct]) => (
          <div key={cat} className="flex justify-between items-center">
            <span className="text-sm">{cat}</span>
            <span className="font-semibold">{pct}%</span>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded">
        View Details
      </button>
    </div>
  )
}
```

## Type Safety

Always import types:

```typescript
import type {
  DocumentStatus,
  DocumentCategory,
  ExchangeId,
  DocumentRequirement,
  ProgressResponse,
  FilingDocumentTemplate
} from '@/types/filing-documents'

// Now you have full type safety
const exchangeId: ExchangeId = 'tsx'
const documents: DocumentRequirement[] = []
const status: DocumentStatus = 'verified'
```

## Error Handling

```typescript
try {
  await actions.uploadDocument(documentTypeId, file)
} catch (error) {
  if (error instanceof Error) {
    console.error('Upload failed:', error.message)
    // Show user-friendly error message
  }
}
```

## Testing

```typescript
// Example test with React Testing Library
import { render, screen } from '@testing-library/react'
import { useFilingDocuments } from '@/hooks/useFilingDocuments'

jest.mock('@/hooks/useFilingDocuments')

test('should display filing progress', () => {
  ;(useFilingDocuments as jest.Mock).mockReturnValue({
    state: {
      documents: [],
      templates: [],
      progress: { overall: 45, byCategory: {}, completedCount: 5, totalCount: 12 },
      loading: false,
      error: null
    },
    actions: {}
  })

  render(<FilingDocumentsPanel />)
  expect(screen.getByText('45%')).toBeInTheDocument()
})
```

## Performance Tips

1. **Memoize components** to prevent unnecessary re-renders
```typescript
export const FilingCard = React.memo(({ doc }) => ...)
```

2. **Use autoLoad: false** for static content
```typescript
const { state, actions } = useFilingDocuments({
  exchangeId: 'tsx',
  autoLoad: false
})

// Manually load when needed
useEffect(() => {
  actions.loadRequirements('tsx')
}, [])
```

3. **Cache templates** (they rarely change)
```typescript
const templates = useMemo(() => 
  getTemplates(exchangeId),
  [exchangeId]
)
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migration applied: `npm run db:migrate`
- [ ] File storage configured (local or S3)
- [ ] Authentication verified
- [ ] Error logging configured
- [ ] Performance monitoring in place
- [ ] Tests passing
- [ ] Documentation reviewed

## Support

For detailed API documentation, see:
- `/src/app/api/filing-documents/API_DOCUMENTATION.md` - Complete endpoint specs
- `/src/app/api/filing-documents/README.md` - Usage guide and examples
- `/src/types/filing-documents.ts` - Type definitions and utilities
