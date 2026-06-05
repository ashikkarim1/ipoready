# IPOReady Document Upload System - Implementation Guide

## Overview

This guide covers the complete implementation of the IPOReady document upload system with database integration, document verification workflow, and submission portal.

## System Architecture

### Components Implemented

1. **Database Schema** — 4 tables for document management
2. **API Endpoints** — Document upload, verification, submission, status tracking
3. **Upload UI** — Document upload page with progress tracking
4. **Verification Workflow** — Admin dashboard for document verification
5. **Submission Portal** — Final submission interface with status tracking
6. **Notification System** — Event-based notifications for document lifecycle

### API Endpoints

#### Document Upload
```
POST /api/documents/upload
- Body: FormData { documentId: string, files: File[] }
- Response: { uploadedFiles: { id, name, size, uploadedAt, status, publicPath } }
```

#### Document Verification (Admin)
```
POST /api/documents/verify
- Body: { fileId, documentId, status, notes }
- Response: { success, fileId, status, verifiedAt, verifiedBy }
```

#### Document Submission
```
POST /api/documents/submit
- Body: { companyId, documentIds[], notes }
- Response: { success, submissionId, submittedAt, status }

GET /api/documents/submit?companyId={id}
- Response: { submissions: [{ id, submittedAt, status, documentCount }] }
```

#### Status & Verification Tracking
```
GET /api/documents/status?companyId={id}
- Response: { totalDocuments, completedDocuments, completionPercentage, mandatoryDocuments, ... }

POST /api/documents/notify
- Body: { type, companyId, documentType, details }
- Response: { success, notificationType, message }
```

## Database Integration Steps

### 1. Create Tables in Neon PostgreSQL

Run the migration file:

```bash
psql $NEON_DATABASE_URL < scripts/migrations/030_document_upload_system.sql
```

Tables created:
- `documents` — Document definitions and metadata
- `document_files` — Individual uploaded files with verification status
- `document_submissions` — Submission history and tracking
- `document_verification_logs` — Audit trail of all verifications

### 2. Update API Routes to Use Database

#### `/api/documents/upload/route.ts`

Replace mock file system with:

```typescript
import { db } from '@/lib/db'

// After file upload to public folder:
const fileRecord = await db.query(
  `INSERT INTO document_files (document_id, file_name, file_path, file_size, file_type, uploaded_by, uploaded_at)
   VALUES ($1, $2, $3, $4, $5, $6, NOW())
   RETURNING id, created_at`,
  [documentId, fileName, filePath, fileSize, fileType, session.user.id]
)

// Update document status
await db.query(
  `UPDATE documents SET status = $1, updated_at = NOW()
   WHERE id = $2 AND company_id = $3`,
  ['partial', documentId, session.user.id] // company_id from session
)
```

#### `/api/documents/verify/route.ts`

Implement verification database calls:

```typescript
import { db } from '@/lib/db'

const verified = await db.query(
  `UPDATE document_files
   SET status = $1, verified_by = $2, verified_at = NOW(), verification_notes = $3
   WHERE id = $4
   RETURNING id`,
  [status, session.user.id, notes, fileId]
)

// Log verification
await db.query(
  `INSERT INTO document_verification_logs (document_id, file_id, verified_by, status, notes, verified_at)
   VALUES ($1, $2, $3, $4, $5, NOW())`,
  [documentId, fileId, session.user.id, status, notes]
)

// Trigger notification
await fetch('/api/documents/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: status === 'verified' ? 'document-verified' : 'document-rejected',
    companyId,
    documentType,
    details: { fileName, verificationNotes: notes },
  }),
})
```

#### `/api/documents/submit/route.ts`

Implement submission tracking:

```typescript
import { db } from '@/lib/db'

// Calculate completion percentage
const docStatus = await db.query(
  `SELECT 
     COUNT(*) as total,
     SUM(CASE WHEN status IN ('verified', 'submitted') THEN 1 ELSE 0 END) as completed
   FROM documents
   WHERE company_id = $1`,
  [companyId]
)

const completionPercentage = Math.round((completed / total) * 100)

// Save submission
const submission = await db.query(
  `INSERT INTO document_submissions 
   (company_id, submitted_by, completion_percentage, submission_status, notes)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, submitted_at`,
  [companyId, session.user.id, completionPercentage, 'submitted', notes]
)

// Trigger notification
await fetch('/api/documents/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'document-submitted',
    companyId,
    documentType: 'All Documents',
    details: { completionPercentage },
  }),
})
```

#### `/api/documents/status/route.ts`

Fetch status from database:

```typescript
import { db } from '@/lib/db'

const status = await db.query(
  `SELECT 
     COUNT(*) as total_documents,
     SUM(CASE WHEN df.status = 'verified' THEN 1 ELSE 0 END) as verified,
     SUM(CASE WHEN df.status IN ('submitted', 'uploaded') THEN 1 ELSE 0 END) as submitted,
     SUM(CASE WHEN df.status = 'partial' THEN 1 ELSE 0 END) as partial,
     SUM(CASE WHEN df.status = 'empty' THEN 1 ELSE 0 END) as empty
   FROM documents d
   LEFT JOIN document_files df ON d.id = df.document_id
   WHERE d.company_id = $1`,
  [companyId]
)

const completionPercentage = Math.round((verified / total_documents) * 100)

return NextResponse.json({
  companyId,
  totalDocuments: status.total_documents,
  completedDocuments: {
    verified: status.verified,
    submitted: status.submitted,
    partial: status.partial,
    empty: status.empty,
  },
  completionPercentage,
  // ... rest of response
})
```

### 3. Initialize Document Catalog on First Company Upload

When a company uploads their first document, initialize their documents:

```typescript
// In upload route, before processing files:
const existingDocs = await db.query(
  'SELECT COUNT(*) as count FROM documents WHERE company_id = $1',
  [companyId]
)

if (existingDocs.count === 0) {
  // Initialize all document types for this company
  const documentTypes = [
    'prospectus',
    'financial-statements',
    'board-resolutions',
    'ceo-cfo-certs',
    'legal-opinions',
    'tax-compliance',
    'ip-assignments',
    'insurance-policies',
    'contracts-material',
    'underwriting-agreement',
  ]

  for (const type of documentTypes) {
    await db.query(
      `INSERT INTO documents (company_id, document_type, name, is_mandatory, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        companyId,
        type,
        type.replace(/-/g, ' '),
        ['prospectus', 'financial-statements', 'board-resolutions', ...].includes(type),
        'empty',
      ]
    )
  }
}
```

## UI Integration Checklist

- [x] Document upload page with progress tracking
- [x] Document verification admin dashboard
- [x] Submission portal with completion tracking
- [x] Status API for real-time updates
- [ ] **Database queries in API routes** ← START HERE
- [ ] Link submission portal in upload page (DONE)
- [ ] Add admin verification link in navigation
- [ ] Add submission portal link in navigation
- [ ] Notification delivery system (email, in-app, etc.)
- [ ] Real-time status updates using WebSockets or polling

## Testing Checklist

### Manual Testing

1. **Upload Documents**
   - [ ] Upload a file to document upload page
   - [ ] Verify file appears in the file list
   - [ ] Verify completion percentage increases
   - [ ] Verify status badge updates

2. **Verify Documents (Admin)**
   - [ ] Navigate to `/dashboard/admin/documents`
   - [ ] See list of uploaded files
   - [ ] Click file to open detail panel
   - [ ] Add verification notes
   - [ ] Click "Approve Document"
   - [ ] Verify file status changes to "verified"

3. **Submit Documents**
   - [ ] Upload documents until 90%+ completion
   - [ ] See "Submission Ready" alert
   - [ ] Click "View Submission Portal"
   - [ ] Review completion statistics
   - [ ] Click "Submit Documents Now"
   - [ ] Verify success message appears

### Database Verification

```sql
-- Check documents created
SELECT * FROM documents WHERE company_id = 'test-company';

-- Check uploaded files
SELECT * FROM document_files WHERE document_id = (
  SELECT id FROM documents LIMIT 1
);

-- Check submissions
SELECT * FROM document_submissions WHERE company_id = 'test-company';

-- Check verification logs
SELECT * FROM document_verification_logs ORDER BY verified_at DESC;
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── documents/
│   │       ├── upload/route.ts (DONE)
│   │       ├── verify/route.ts (DONE)
│   │       ├── submit/route.ts (DONE)
│   │       ├── status/route.ts (DONE)
│   │       ├── notify/route.ts (DONE)
│   │       ├── templates/route.ts (DONE)
│   │       └── delete/route.ts (DONE)
│   └── dashboard/
│       ├── documents/
│       │   └── upload/page.tsx (DONE - needs DB integration)
│       ├── submission/
│       │   └── page.tsx (DONE - needs DB integration)
│       └── admin/
│           └── documents/page.tsx (DONE - needs DB integration)
├── components/
│   ├── DocumentUploadCard.tsx (exists)
│   ├── DocumentProgressBar.tsx (exists)
│   └── CompletionMilestones.tsx (exists)
└── lib/
    ├── db.ts (create if not exists)
    └── typography.ts (exists)

scripts/
└── migrations/
    └── 030_document_upload_system.sql (DONE)
```

## Next Steps (Phase 2)

After database integration is complete:

1. **Cloud Storage Integration** — Replace public/uploads with S3/Cloudinary
   - Create `/api/documents/upload-cloud` endpoint
   - Update storage layer abstraction
   - Implement signed URLs for secure downloads

2. **LinkedIn Integration** — Profile verification & connection tracking
   - Add LinkedIn OAuth to auth.ts
   - Create `/api/linkedin/verify` endpoint
   - Add founder LinkedIn field to company profile

3. **Stripe Integration** — Subscription & payment handling
   - Add Stripe webhooks
   - Create subscription management UI
   - Implement billing lifecycle

4. **Webhooks** — Real-time event delivery to external systems
   - Document verification webhooks
   - Submission status webhooks
   - Integration with external compliance platforms

## Key Database Queries

### Get all documents for a company with file counts
```sql
SELECT 
  d.id,
  d.document_type,
  d.name,
  d.status,
  d.is_mandatory,
  COUNT(df.id) as file_count,
  SUM(CASE WHEN df.status = 'verified' THEN 1 ELSE 0 END) as verified_count
FROM documents d
LEFT JOIN document_files df ON d.id = df.document_id
WHERE d.company_id = $1
GROUP BY d.id, d.document_type, d.name, d.status, d.is_mandatory
ORDER BY d.is_mandatory DESC, d.document_type;
```

### Get verification audit trail
```sql
SELECT 
  dvl.verified_at,
  dvl.status,
  u.email as verified_by,
  dvl.notes,
  df.file_name
FROM document_verification_logs dvl
LEFT JOIN users u ON dvl.verified_by = u.id
LEFT JOIN document_files df ON dvl.file_id = df.id
WHERE dvl.document_id = $1
ORDER BY dvl.verified_at DESC;
```

### Get submission history
```sql
SELECT 
  ds.id,
  ds.submitted_at,
  u.email as submitted_by,
  ds.completion_percentage,
  ds.submission_status,
  (SELECT COUNT(*) FROM document_files WHERE document_id IN (
    SELECT id FROM documents WHERE company_id = ds.company_id
  )) as total_files
FROM document_submissions ds
LEFT JOIN users u ON ds.submitted_by = u.id
WHERE ds.company_id = $1
ORDER BY ds.submitted_at DESC;
```

## Support

For questions or issues, refer to:
- NextAuth documentation: https://next-auth.js.org/
- Next.js API routes: https://nextjs.org/docs/api-routes/introduction
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Neon documentation: https://neon.tech/docs/
