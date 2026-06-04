# Filing Documents API

Complete REST API for managing IPO filing document requirements, uploads, and progress tracking across multiple stock exchanges (US SEC, Canadian TSX/TSXV, etc.).

## Overview

The Filing Documents API provides:

1. **Document Upload** - Store filing documents with versioning
2. **Requirements Tracking** - Get exchange-specific filing requirements
3. **Status Management** - Track document preparation progress (not_started → verified)
4. **Progress Reporting** - Overall and category-based completion tracking
5. **Template Support** - Markdown templates with regulatory references and checklists
6. **Audit Trail** - User-tracked uploads and status changes

## Quick Start

### Using the API

```typescript
import { useFilingDocuments } from '@/hooks/useFilingDocuments'
import { uploadDocument, getRequirements } from '@/lib/filing-documents-client'

// Option 1: Use the comprehensive hook
function DocumentUploader() {
  const { state, actions } = useFilingDocuments({
    exchangeId: 'tsx',
    autoLoad: true
  })

  const handleUpload = async (documentTypeId: string, file: File) => {
    await actions.uploadDocument(documentTypeId, file)
  }

  return (
    <div>
      <h2>Progress: {state.progress?.overall}%</h2>
      {state.documents.map(doc => (
        <button key={doc.id} onClick={() => handleUpload(doc.id, selectedFile)}>
          Upload {doc.documentName}
        </button>
      ))}
    </div>
  )
}

// Option 2: Use individual functions
async function uploadAndVerify() {
  const result = await uploadDocument(documentTypeId, file)
  await updateDocumentStatus({
    documentId: result.documentId,
    status: 'verified',
    notes: 'Legal review completed'
  })
}

// Option 3: Direct API calls
const requirements = await fetch('/api/filing-documents/get-requirements?exchange_id=tsx')
const data = await requirements.json()
```

## API Endpoints

### 1. Upload Document
```
POST /api/filing-documents/upload-doc/{documentTypeId}
Content-Type: multipart/form-data

Request:
  file: File (binary, max 50MB)

Response:
  {
    "success": true,
    "fileUrl": "/filing-docs/{companyId}/...",
    "documentId": "uuid",
    "status": "uploaded"
  }
```

**Example:**
```typescript
const formData = new FormData()
formData.append('file', selectedFile)

const response = await fetch(
  '/api/filing-documents/upload-doc/550e8400-e29b-41d4-a716-446655440000',
  { method: 'POST', body: formData }
)
const { documentId, fileUrl } = await response.json()
```

### 2. Get Requirements
```
GET /api/filing-documents/get-requirements?exchange_id={exchangeId}

Query Parameters:
  exchange_id: nasdaq | nyse | tsx | tsxv | cse | sec-edgar | sedar2

Response:
  {
    "documents": [
      {
        "id": "uuid",
        "documentName": "Audited Financial Statements",
        "category": "Financial",
        "isRequired": true,
        "currentStatus": "uploaded",
        "uploadedAt": "2026-06-04T...",
        "estimatedPrepDays": 30,
        "regulatoryReference": "SEC Regulation S-K Item 8",
        "templateUrl": "...",
        "exampleDocumentUrl": "..."
      }
    ],
    "progressPercent": 45,
    "completedCount": 5,
    "totalCount": 12
  }
```

### 3. Update Status
```
POST /api/filing-documents/update-status

Request Body:
  {
    "documentId": "uuid",
    "status": "not_started|in_progress|ready|uploaded|verified",
    "notes": "Optional review notes"
  }

Response:
  {
    "success": true,
    "documentId": "uuid",
    "status": "verified",
    "updatedAt": "2026-06-04T..."
  }
```

### 4. Get Document
```
GET /api/filing-documents/get-document?document_id={documentId}

Response (if S3 URL):
  {
    "success": true,
    "documentUrl": "https://s3.../...",
    "status": "uploaded"
  }

Response (if local file):
  Binary PDF file (Content-Type: application/pdf)
```

### 5. Delete Document
```
DELETE /api/filing-documents/delete?document_id={documentId}

Response:
  { "success": true }

Effect:
  - Deletes file from storage
  - Resets status to "not_started"
  - Clears upload metadata
```

### 6. Get Progress
```
GET /api/filing-documents/progress?exchange_id={exchangeId}

Response:
  {
    "overall": 45,
    "byCategory": {
      "Financial": 80,
      "Legal": 30,
      "Governance": 50,
      "Corporate": 25,
      "Compliance": 60
    },
    "completedCount": 5,
    "totalCount": 12
  }
```

### 7. Get Templates
```
GET /api/filing-documents/templates?exchange_id={exchangeId}

Response:
  {
    "templates": [
      {
        "id": "uuid",
        "documentTypeId": "uuid",
        "documentName": "Audited Financial Statements",
        "category": "Financial",
        "templateContent": "# Audited Financial Statements\n\n...",
        "checklist": [
          { "item": "Obtain source documents", "completed": false },
          { "item": "Review for completeness", "completed": false }
        ],
        "exampleFileUrl": "...",
        "regulatoryReference": "SEC Regulation S-K Item 8"
      }
    ],
    "total": 22
  }
```

## Document Status Flow

```
not_started
    ↓
in_progress (user starts preparation)
    ↓
ready (user marks as ready for review)
    ↓
uploaded (file submitted)
    ↓
verified (legal/compliance review completed)
```

Status can move backward at any stage if corrections are needed.

## Categories

Documents are organized by:
- **Financial** - Audited statements, MD&A, financial data
- **Legal** - Articles, bylaws, legal opinions, agreements
- **Governance** - Board bios, executive info, board charters
- **Corporate** - Business description, risk factors, use of proceeds
- **Compliance** - Tax docs, auditor consent, regulatory certifications

## Supported Exchanges

### United States
- **NASDAQ** - 22 required documents
- **NYSE** - 22 required documents
- **SEC-EDGAR** - 22 required documents

### Canada
- **TSX** - 12 required documents
- **TSXV** - Venture tier, subset of TSX documents
- **CSE** - Canadian Securities Exchange
- **SEDAR2** - Filing platform

## Database Schema

### filing_document_types
Master table of requirements:
```sql
id UUID PRIMARY KEY
exchange_id VARCHAR(50)
category VARCHAR(50)
document_name VARCHAR(255)
description TEXT
is_required BOOLEAN
template_url VARCHAR(500)
estimated_prep_days INTEGER
regulatory_reference VARCHAR(255)
example_document_url VARCHAR(500)
```

### user_filing_documents
Tracks uploads per company:
```sql
id UUID PRIMARY KEY
company_id UUID
document_type_id UUID
status VARCHAR(50)
file_path VARCHAR(500)
s3_url VARCHAR(500)
uploaded_at TIMESTAMP
uploaded_by UUID
verified_at TIMESTAMP
verified_by UUID
notes TEXT
version_number INTEGER
```

## File Storage

### Development (Local)
Files stored in: `/public/filing-docs/{companyId}/{fileName}`
- Auto-created on first upload
- File naming: `{documentTypeId}-{timestamp}-{randomStr}.pdf`
- Accessible via: `GET /filing-docs/{companyId}/{fileName}`

### Production (S3)
Update the `upload-doc/[documentTypeId]/route.ts` to use S3:
```typescript
import AWS from 'aws-sdk'

const s3 = new AWS.S3()
const result = await s3.upload({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `filing-docs/${companyId}/${fileName}`,
  Body: buffer,
  ContentType: 'application/pdf'
}).promise()

const s3Url = result.Location
```

## React Hooks

### useFilingDocuments
Comprehensive hook for document management:
```typescript
const { state, actions } = useFilingDocuments({
  exchangeId: 'tsx',
  autoLoad: true
})

// State
state.documents    // DocumentRequirement[]
state.templates    // FilingDocumentTemplate[]
state.progress     // ProgressResponse
state.loading      // boolean
state.error        // string | null

// Actions
actions.uploadDocument(documentTypeId, file)
actions.updateStatus(documentId, status, notes)
actions.deleteDocument(documentId)
actions.loadRequirements(exchangeId)
actions.loadProgress(exchangeId)
actions.loadTemplates(exchangeId)
actions.reset()
```

### useFilingDocument
Single document operations:
```typescript
const { loading, error, updateStatus, remove, download, view } = 
  useFilingDocument(documentId)

await updateStatus('verified', 'Legal review completed')
await remove()
download('filename.pdf')
view() // Opens in new tab
```

### useFileUpload
File upload with validation:
```typescript
const { loading, error, progress, upload } = useFileUpload(() => {
  console.log('Upload complete')
})

await upload(documentTypeId, file) // Validates, uploads, tracks progress
```

## Utility Functions

```typescript
import {
  uploadDocument,
  getRequirements,
  updateDocumentStatus,
  getDocument,
  deleteDocument,
  getProgress,
  getTemplates,
  validateFile,
  formatFileSize,
  formatDate,
  downloadDocument,
  viewDocument
} from '@/lib/filing-documents-client'

// Validation
const { valid, error } = validateFile(file, 50) // 50MB max

// Formatting
formatFileSize(1024 * 1024) // "1 MB"
formatDate('2026-06-04') // "Jun 04, 2026"

// File operations
downloadDocument(documentId, 'filename.pdf')
viewDocument(documentId) // Open in new tab
```

## Types

```typescript
import {
  DocumentStatus,
  DocumentCategory,
  ExchangeId,
  FilingDocumentType,
  UserFilingDocument,
  DocumentRequirement,
  FilingDocumentTemplate,
  ProgressResponse,
  GetRequirementsResponse
} from '@/types/filing-documents'

// Type-safe constants
DOCUMENT_CATEGORIES // ['Financial', 'Legal', 'Governance', 'Corporate', 'Compliance']
DOCUMENT_STATUSES // ['not_started', 'in_progress', 'ready', 'uploaded', 'verified']
EXCHANGES // { nasdaq: {...}, nyse: {...}, tsx: {...}, ... }
```

## Examples

### Complete Upload Workflow
```typescript
async function completeUploadWorkflow() {
  // 1. Get requirements
  const reqRes = await fetch('/api/filing-documents/get-requirements?exchange_id=tsx')
  const { documents } = await reqRes.json()

  // 2. Find document to upload
  const auditedFinancials = documents.find(d => 
    d.documentName.includes('Audited Financial')
  )

  // 3. Upload file
  const formData = new FormData()
  formData.append('file', selectedFile)
  
  const uploadRes = await fetch(
    `/api/filing-documents/upload-doc/${auditedFinancials.id}`,
    { method: 'POST', body: formData }
  )
  const { documentId } = await uploadRes.json()

  // 4. Update status to verified
  await fetch('/api/filing-documents/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId,
      status: 'verified',
      notes: 'Legal review completed - no issues'
    })
  })

  // 5. Check progress
  const progRes = await fetch('/api/filing-documents/progress?exchange_id=tsx')
  const { overall, byCategory } = await progRes.json()
  console.log(`Filing progress: ${overall}% complete`)
}
```

### React Component Example
```typescript
'use client'

import { useFilingDocuments } from '@/hooks/useFilingDocuments'

export function FilingDocumentsPanel() {
  const { state, actions } = useFilingDocuments({
    exchangeId: 'tsx'
  })

  const handleFileSelect = async (documentId: string, file: File) => {
    try {
      await actions.uploadDocument(documentId, file)
      alert('Document uploaded successfully')
    } catch (error) {
      alert('Upload failed: ' + error.message)
    }
  }

  return (
    <div className="space-y-4">
      <h2>Filing Progress: {state.progress?.overall}%</h2>
      
      {state.documents.map(doc => (
        <div key={doc.id} className="border p-4 rounded">
          <h3>{doc.documentName}</h3>
          <p>Status: {doc.currentStatus}</p>
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(doc.id, e.target.files[0])
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}
```

## Authentication & Security

- **Required:** Valid NextAuth session with authenticated user
- **Isolation:** All queries filtered by user's company_id
- **Permissions:** Users can only access their company's documents
- **Audit:** All actions tracked with userId and timestamp
- **Validation:** File type and size validation on upload

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common errors:
- `401 Unauthorized` - Missing session or companyId
- `400 Bad Request` - Invalid parameters or file
- `404 Not Found` - Document doesn't exist
- `500 Server Error` - Database or file system error

## Testing

```typescript
// Example test
describe('Filing Documents API', () => {
  it('should upload document and update progress', async () => {
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' })
    const result = await uploadDocument(documentTypeId, file)
    
    expect(result.success).toBe(true)
    expect(result.documentId).toBeDefined()
  })
})
```

## Performance Considerations

1. **Indexes:** Database indexes on company_id, document_type_id, status, uploaded_at
2. **File Storage:** Consider CDN for production file delivery
3. **Batch Operations:** Use Promise.all() to fetch multiple data in parallel
4. **Caching:** Consider caching templates (rarely change)

## Future Enhancements

- [ ] AWS S3 integration for production file storage
- [ ] Pre-signed URLs for secure file downloads
- [ ] Document digitally signing integration
- [ ] Automated compliance checking
- [ ] Version history and diff viewing
- [ ] Bulk operations (multi-document uploads)
- [ ] Webhook notifications on status changes
- [ ] Regulatory timeline management
- [ ] Integration with e-signature platforms

## Support & Documentation

- See `API_DOCUMENTATION.md` for detailed endpoint specs
- See `../../../types/filing-documents.ts` for type definitions
- See `../../../lib/filing-documents-client.ts` for utility functions
- See `../../../hooks/useFilingDocuments.ts` for React integration
