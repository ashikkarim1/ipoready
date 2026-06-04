# Filing Documents API Documentation

Complete API for managing IPO filing documents and requirements tracking across multiple exchanges (SEC-Edgar, TSX, TSXV, etc.).

## Base URL
`/api/filing-documents`

## Authentication
All endpoints require valid NextAuth session with authenticated user and company context.

---

## 1. Upload Document
**Endpoint:** `POST /upload-doc/{documentTypeId}`

Upload a filing document for a specific document type.

### Request
- **Method:** POST
- **URL Parameters:**
  - `documentTypeId` (string, UUID): The filing_document_types.id
- **Content-Type:** multipart/form-data
- **Body:**
  ```
  file: File (binary)
  ```

### Response (200 OK)
```json
{
  "success": true,
  "fileUrl": "/filing-docs/{companyId}/{filename}",
  "documentId": "uuid",
  "status": "uploaded"
}
```

### Error Responses
- `401`: Unauthorized (missing session/companyId)
- `400`: Invalid document type or no file provided
- `400`: File size exceeds 50MB limit
- `500`: File upload failed

### Example Usage
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])

const response = await fetch('/api/filing-documents/upload-doc/550e8400-e29b-41d4-a716-446655440000', {
  method: 'POST',
  body: formData,
})
const data = await response.json()
// Returns: { success: true, fileUrl: "...", documentId: "...", status: "uploaded" }
```

---

## 2. Get Requirements
**Endpoint:** `GET /get-requirements`

Fetch all required filing documents for a company based on exchange.

### Query Parameters
- `exchange_id` (string, required): nasdaq | nyse | tsx | tsxv | cse | sec-edgar | sedar2

### Response (200 OK)
```json
{
  "documents": [
    {
      "id": "uuid",
      "documentName": "Audited Financial Statements",
      "category": "Financial",
      "isRequired": true,
      "currentStatus": "not_started",
      "uploadedAt": "2026-06-04T10:30:00Z",
      "estimatedPrepDays": 30,
      "regulatoryReference": "SEC Regulation S-K Item 8",
      "templateUrl": "https://templates.ipoready.com/...",
      "exampleDocumentUrl": "https://examples.ipoready.com/..."
    }
  ],
  "progressPercent": 45,
  "completedCount": 5,
  "totalCount": 12
}
```

### Status Values
- `not_started`: No action taken
- `in_progress`: Currently being prepared
- `ready`: Ready for review/upload
- `uploaded`: Document submitted
- `verified`: Verified and approved

### Error Responses
- `401`: Unauthorized
- `400`: Missing exchange_id parameter
- `500`: Failed to fetch requirements

### Example Usage
```javascript
const response = await fetch('/api/filing-documents/get-requirements?exchange_id=tsx')
const data = await response.json()
// Returns: { documents: [...], progressPercent: 45, ... }
```

---

## 3. Update Document Status
**Endpoint:** `POST /update-status`

Update the status of a filing document.

### Request Body
```json
{
  "documentId": "uuid",
  "status": "not_started|in_progress|ready|uploaded|verified",
  "notes": "Optional review notes"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "documentId": "uuid",
  "status": "verified",
  "updatedAt": "2026-06-04T10:35:00Z"
}
```

### Error Responses
- `401`: Unauthorized
- `400`: Invalid status value
- `404`: Document not found or doesn't belong to company
- `500`: Failed to update status

### Example Usage
```javascript
const response = await fetch('/api/filing-documents/update-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'verified',
    notes: 'Legal review completed - no issues found'
  })
})
const data = await response.json()
// Returns: { success: true, documentId: "...", status: "verified", ... }
```

---

## 4. Get Document
**Endpoint:** `GET /get-document`

Retrieve an uploaded filing document.

### Query Parameters
- `document_id` (string, required): user_filing_documents.id

### Response (200 OK)
If S3 URL exists:
```json
{
  "success": true,
  "documentUrl": "https://s3.../...",
  "status": "uploaded",
  "uploadedAt": "2026-06-04T10:30:00Z"
}
```

If local file exists:
- Returns binary PDF file with headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline`

### Error Responses
- `401`: Unauthorized
- `400`: Missing document_id parameter
- `404`: Document not found or no file available
- `500`: Failed to read document file

### Example Usage
```javascript
// Get document URL
const response = await fetch('/api/filing-documents/get-document?document_id=550e8400-e29b-41d4-a716-446655440000')
const data = await response.json()
// Returns: { success: true, documentUrl: "...", status: "uploaded" }

// Or download/view file directly
window.open('/api/filing-documents/get-document?document_id=550e8400-e29b-41d4-a716-446655440000')
```

---

## 5. Delete Document
**Endpoint:** `DELETE /delete`

Delete a filing document and mark as not_started.

### Query Parameters
- `document_id` (string, required): user_filing_documents.id

### Response (200 OK)
```json
{
  "success": true
}
```

### Behavior
- Deletes local file if present
- Clears S3 URL reference
- Resets document status to `not_started`
- Resets version number to 1

### Error Responses
- `401`: Unauthorized
- `400`: Missing document_id parameter
- `404`: Document not found
- `500`: Failed to delete document

### Example Usage
```javascript
const response = await fetch('/api/filing-documents/delete?document_id=550e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE'
})
const data = await response.json()
// Returns: { success: true }
```

---

## 6. Get Progress
**Endpoint:** `GET /progress`

Get overall and category-based filing progress.

### Query Parameters
- `exchange_id` (string, required): nasdaq | nyse | tsx | tsxv | cse | sec-edgar | sedar2

### Response (200 OK)
```json
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

### Calculation
- `overall`: Percentage of documents with status 'verified' or 'uploaded'
- `byCategory`: Category-specific percentages
- `completedCount`: Number of uploaded/verified documents
- `totalCount`: Total required documents for exchange

### Error Responses
- `401`: Unauthorized
- `400`: Missing exchange_id parameter
- `500`: Failed to fetch progress (returns 0% with empty categories)

### Example Usage
```javascript
const response = await fetch('/api/filing-documents/progress?exchange_id=tsx')
const data = await response.json()
// Returns: { overall: 45, byCategory: { Financial: 80, ... }, ... }
```

---

## 7. Get Templates
**Endpoint:** `GET /templates`

Retrieve available document templates.

### Query Parameters
- `exchange_id` (string, optional): Filter by exchange (nasdaq, nyse, tsx, tsxv, etc.)

### Response (200 OK)
```json
{
  "templates": [
    {
      "id": "uuid",
      "documentTypeId": "uuid",
      "documentName": "Audited Financial Statements",
      "category": "Financial",
      "templateContent": "# Audited Financial Statements\n\n**Category:** Financial...",
      "checklist": [
        {
          "item": "Obtain source documents",
          "completed": false
        },
        {
          "item": "Review for completeness and accuracy",
          "completed": false
        }
      ],
      "exampleFileUrl": "https://examples.ipoready.com/...",
      "regulatoryReference": "SEC Regulation S-K Item 8"
    }
  ],
  "total": 22
}
```

### Template Content Format
- Markdown with guidelines
- Includes regulatory references
- Preparation checklist items
- Key requirements
- Resource links

### Error Responses
- `401`: Unauthorized
- `500`: Failed to fetch templates (returns empty array)

### Example Usage
```javascript
// Get all templates
const response = await fetch('/api/filing-documents/templates')
const data = await response.json()
// Returns: { templates: [...], total: 22 }

// Get templates for specific exchange
const response = await fetch('/api/filing-documents/templates?exchange_id=tsx')
const data = await response.json()
// Returns filtered templates
```

---

## Database Schema Reference

### filing_document_types
Master table of document requirements by exchange/jurisdiction.

```sql
id UUID PRIMARY KEY
exchange_id VARCHAR(50)  -- 'nasdaq', 'nyse', 'tsx', 'tsxv', 'cse', 'sec-edgar', 'sedar2'
category VARCHAR(50)     -- 'Financial', 'Legal', 'Governance', 'Corporate', 'Compliance'
document_name VARCHAR(255)
description TEXT
is_required BOOLEAN
template_url VARCHAR(500)
estimated_prep_days INTEGER
regulatory_reference VARCHAR(255)
example_document_url VARCHAR(500)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### user_filing_documents
Track document status and versions per company.

```sql
id UUID PRIMARY KEY
company_id UUID
document_type_id UUID
status VARCHAR(50)        -- 'not_started', 'in_progress', 'ready', 'uploaded', 'verified'
file_path VARCHAR(500)
s3_url VARCHAR(500)
uploaded_at TIMESTAMP
uploaded_by UUID
verified_at TIMESTAMP
verified_by UUID
notes TEXT
version_number INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

### filing_document_templates
Template content for each document type.

```sql
id UUID PRIMARY KEY
document_type_id UUID UNIQUE
template_content TEXT       -- Markdown format
example_file_url VARCHAR(500)
checklist JSONB            -- Array of checklist items
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## Views

### v_filing_document_status_summary
Summary statistics by company:
```sql
SELECT
  company_id,
  total_documents,
  verified_count,
  uploaded_count,
  ready_count,
  in_progress_count,
  not_started_count,
  completion_percentage
```

### v_required_documents_missing
Missing documents by company/exchange:
```sql
SELECT
  company_id,
  exchange_id,
  category,
  document_name,
  regulatory_reference,
  current_status
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common HTTP Status Codes:
- `200`: Success
- `400`: Bad request (invalid params, missing fields)
- `401`: Unauthorized (no session or no companyId)
- `404`: Resource not found
- `500`: Server error

---

## File Storage

### Local Storage (Development)
Files stored in: `/public/filing-docs/{companyId}/{fileName}`
- Auto-created on first upload
- File naming: `{documentTypeId}-{timestamp}-{randomStr}.pdf`
- Accessible via: `/filing-docs/{companyId}/{fileName}`

### S3 Storage (Production)
Update to use S3 by implementing S3 client in upload route:
```typescript
const s3 = new AWS.S3()
const result = await s3.upload({
  Bucket: process.env.AWS_BUCKET,
  Key: `filing-docs/${companyId}/${fileName}`,
  Body: buffer,
}).promise()
```

---

## Rate Limiting & Constraints

- Max file size: 50MB
- Allowed file types: PDF (extensible)
- Unique constraint: One document per company/document-type combination
- Version tracking: Automatic increment on re-upload
- Automatic timestamp tracking: created_at, updated_at, uploaded_at, verified_at

---

## Usage Examples

### Complete Upload Workflow
```typescript
// 1. Get requirements for exchange
const reqRes = await fetch('/api/filing-documents/get-requirements?exchange_id=tsx')
const { documents } = await reqRes.json()

// 2. Upload file for specific document
const formData = new FormData()
formData.append('file', selectedFile)
const uploadRes = await fetch(`/api/filing-documents/upload-doc/${documents[0].id}`, {
  method: 'POST',
  body: formData
})
const { documentId } = await uploadRes.json()

// 3. Update status to indicate verification
await fetch('/api/filing-documents/update-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId,
    status: 'verified',
    notes: 'Legal review completed'
  })
})

// 4. Check progress
const progRes = await fetch('/api/filing-documents/progress?exchange_id=tsx')
const { overall, byCategory } = await progRes.json()
console.log(`Filing progress: ${overall}%`)
```

### Template-Driven Workflow
```typescript
// 1. Get available templates
const templRes = await fetch('/api/filing-documents/templates?exchange_id=tsx')
const { templates } = await templRes.json()

// 2. Display template content to user
console.log(templates[0].templateContent)
console.log(templates[0].checklist)

// 3. After user completes checklist, upload file
// ... file upload step ...
```

---

## Security Considerations

1. **Authentication:** All endpoints require valid NextAuth session
2. **Company Isolation:** Database queries filter by authenticated user's companyId
3. **File Access:** Files only accessible through authenticated API endpoints
4. **File Validation:** Size limits and type validation on upload
5. **Audit Trail:** All uploads/modifications tracked with user_id and timestamp

---

## Migration & Seed Data

Database includes pre-populated document requirements for:
- **US SEC-Edgar** (22 documents across 5 categories)
- **Canadian TSX** (12 documents across 5 categories)

Each with:
- Regulatory references
- Template URLs
- Example documents
- Estimated prep times
- Checklist items

Run migration: `npm run db:migrate`
