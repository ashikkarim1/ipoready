# Filing Checker API Routes

Reference guide for implementing backend API endpoints required by the Filing Checker Dashboard.

## Overview

The FilingCheckerIntegration component expects the following API endpoints to function. These should be implemented as Next.js API routes or your preferred backend framework.

## Endpoints

### GET /api/filings/[filingId]

Fetch complete filing data for the dashboard.

**Request:**
```
GET /api/filings/IPO-2024-001
```

**Response (200 OK):**
```json
{
  "filingId": "IPO-2024-001",
  "exchangeId": "TSX",
  "status": "not_ready",
  "completenessScore": 72,
  "complianceScore": 65,
  "qualityScore": 78,
  "crossValidationScore": 71,
  "issues": [
    {
      "id": "iss-001",
      "severity": "critical",
      "category": "CA - Prospectus Section",
      "description": "Risk Factors disclosure incomplete",
      "requiredFix": "Section 1.2 requires comprehensive risk factor analysis...",
      "documentType": "Risk Factors Document",
      "resolved": false,
      "priority": 10,
      "detectedAt": "2024-06-01T10:00:00Z"
    }
  ],
  "missingDocuments": [
    {
      "docType": "Auditor Consent Letter",
      "required": true,
      "hasTemplate": false,
      "estimatedHours": 4
    }
  ],
  "sections": [
    {
      "name": "Company Overview",
      "completeness": 95,
      "issues": 0,
      "lastUpdated": "2024-06-03T14:30:00Z"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Filing not found",
  "status": 404
}
```

---

### PATCH /api/filings/[filingId]/issues/[issueId]/resolve

Mark an issue as resolved.

**Request:**
```
PATCH /api/filings/IPO-2024-001/issues/iss-001/resolve
Content-Type: application/json

{
  "resolved": true,
  "resolvedAt": "2024-06-04T15:45:00Z",
  "resolvedBy": "user@company.com",
  "notes": "Submitted comprehensive risk factor analysis"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "issue": {
    "id": "iss-001",
    "resolved": true,
    "resolvedAt": "2024-06-04T15:45:00Z",
    "resolvedBy": "user@company.com"
  },
  "updatedScores": {
    "completenessScore": 75,
    "complianceScore": 68,
    "qualityScore": 80,
    "crossValidationScore": 74
  }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid issue ID or filing ID",
  "status": 400
}
```

---

### GET /api/filings/[filingId]/export-pdf

Export filing status as PDF.

**Request:**
```
GET /api/filings/IPO-2024-001/export-pdf
```

**Response (200 OK):**
- Returns binary PDF file
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="IPO-2024-001-filing-status-2024-06-04.pdf"

**Implementation Notes:**
- Use a library like `pdfkit` or `puppeteer` to generate PDF
- Include all current scores, issues, and sections
- Add timestamp and user information
- Generate audit trail section

---

### POST /api/filings/[filingId]/share

Share filing status via email.

**Request:**
```
POST /api/filings/IPO-2024-001/share
Content-Type: application/json

{
  "recipients": ["ceo@company.com", "cfo@company.com"],
  "message": "Please review the current filing status and update any required items.",
  "sharedAt": "2024-06-04T15:45:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "sharedAt": "2024-06-04T15:45:00Z",
  "sharedWith": ["ceo@company.com", "cfo@company.com"],
  "emailSent": true
}
```

**Implementation Notes:**
- Send email with filing status summary
- Include link to full report
- Log sharing action in audit trail
- Use email templates for consistent formatting

---

### POST /api/filings/[filingId]/submit

Submit filing for regulatory approval.

**Request:**
```
POST /api/filings/IPO-2024-001/submit
Content-Type: application/json

{
  "status": "submitted",
  "submittedAt": "2024-06-04T16:00:00Z",
  "submittedBy": "ceo@company.com",
  "exchangeId": "TSX"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "submissionId": "SUB-20240604-001",
  "filingId": "IPO-2024-001",
  "submittedAt": "2024-06-04T16:00:00Z",
  "exchangeId": "TSX",
  "status": "submitted",
  "nextSteps": "Your filing has been submitted to the TSX. Expected review timeline: 10-15 business days."
}
```

**Error Response (400):**
```json
{
  "error": "Filing cannot be submitted with unresolved critical issues",
  "status": 400,
  "unResolvedCritical": 2
}
```

**Implementation Notes:**
- Validate that all critical issues are resolved
- Create submission record with timestamp
- Send confirmation email to stakeholders
- Update filing status in database
- Return next steps and timeline

---

## Database Schema

### filings Table

```sql
CREATE TABLE filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id VARCHAR(255) UNIQUE NOT NULL,
  exchange_id VARCHAR(50) NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  completeness_score INTEGER DEFAULT 0,
  compliance_score INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  cross_validation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  submission_id VARCHAR(255)
);
```

### filing_issues Table

```sql
CREATE TABLE filing_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id VARCHAR(255) NOT NULL REFERENCES filings(filing_id),
  issue_id VARCHAR(255) UNIQUE NOT NULL,
  severity VARCHAR(50) NOT NULL, -- 'critical', 'warning', 'info'
  category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_fix TEXT NOT NULL,
  document_type VARCHAR(255),
  resolved BOOLEAN DEFAULT FALSE,
  priority INTEGER,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### filing_documents Table

```sql
CREATE TABLE filing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id VARCHAR(255) NOT NULL REFERENCES filings(filing_id),
  doc_type VARCHAR(255) NOT NULL,
  required BOOLEAN NOT NULL,
  has_template BOOLEAN NOT NULL,
  template_url VARCHAR(500),
  document_url VARCHAR(500),
  uploaded_at TIMESTAMP,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### filing_sections Table

```sql
CREATE TABLE filing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id VARCHAR(255) NOT NULL REFERENCES filings(filing_id),
  name VARCHAR(255) NOT NULL,
  completeness INTEGER NOT NULL DEFAULT 0,
  issues INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP,
  last_edited_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### filing_audit_trail Table

```sql
CREATE TABLE filing_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id VARCHAR(255) NOT NULL REFERENCES filings(filing_id),
  action VARCHAR(255) NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR(255) NOT NULL,
  issue_id VARCHAR(255) REFERENCES filing_issues(issue_id),
  notes TEXT
);
```

## Implementation Examples

### Express.js

```javascript
// GET /api/filings/:filingId
app.get('/api/filings/:filingId', async (req, res) => {
  const { filingId } = req.params

  try {
    const filing = await db.query(
      'SELECT * FROM filings WHERE filing_id = $1',
      [filingId]
    )

    if (!filing.rows[0]) {
      return res.status(404).json({ error: 'Filing not found' })
    }

    const issues = await db.query(
      'SELECT * FROM filing_issues WHERE filing_id = $1',
      [filingId]
    )

    const documents = await db.query(
      'SELECT * FROM filing_documents WHERE filing_id = $1',
      [filingId]
    )

    const sections = await db.query(
      'SELECT * FROM filing_sections WHERE filing_id = $1',
      [filingId]
    )

    res.json({
      ...filing.rows[0],
      issues: issues.rows,
      missingDocuments: documents.rows,
      sections: sections.rows,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Next.js API Route

```typescript
// pages/api/filings/[filingId].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@neondatabase/serverless'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { filingId } = req.query

  if (req.method === 'GET') {
    try {
      const filing = await sql`
        SELECT * FROM filings WHERE filing_id = ${filingId}
      `

      if (filing.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' })
      }

      const issues = await sql`
        SELECT * FROM filing_issues WHERE filing_id = ${filingId}
      `

      const documents = await sql`
        SELECT * FROM filing_documents WHERE filing_id = ${filingId}
      `

      const sections = await sql`
        SELECT * FROM filing_sections WHERE filing_id = ${filingId}
      `

      res.status(200).json({
        ...filing.rows[0],
        issues: issues.rows,
        missingDocuments: documents.rows,
        sections: sections.rows,
      })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }
}
```

## Testing

### Sample Test Data

```javascript
const mockFiling = {
  filingId: 'IPO-2024-001',
  exchangeId: 'TSX',
  status: 'not_ready',
  completenessScore: 72,
  complianceScore: 65,
  qualityScore: 78,
  crossValidationScore: 71,
  issues: [
    {
      id: 'iss-001',
      severity: 'critical',
      category: 'CA - Prospectus Section',
      description: 'Risk Factors disclosure incomplete',
      requiredFix: 'Comprehensive risk factor analysis required',
      documentType: 'Risk Factors Document',
      resolved: false,
    },
  ],
  missingDocuments: [
    {
      docType: 'Auditor Consent Letter',
      required: true,
      hasTemplate: false,
    },
  ],
  sections: [
    {
      name: 'Company Overview',
      completeness: 95,
      issues: 0,
    },
  ],
}
```

## Security Considerations

1. **Authentication**: All endpoints should require user authentication
2. **Authorization**: Verify user has access to the filing
3. **Validation**: Validate all input data against expected schema
4. **Rate Limiting**: Implement rate limits on expensive operations (PDF generation)
5. **Logging**: Log all state changes to audit trail
6. **CORS**: Restrict CORS to trusted domains
7. **Data Encryption**: Encrypt sensitive documents in storage

## Performance Optimization

1. **Caching**: Cache filing data with invalidation on updates
2. **Pagination**: Paginate large issue lists
3. **Lazy Loading**: Load sections on demand
4. **Database Indexes**: Index filingId, exchangeId, status columns
5. **Connection Pooling**: Use connection pools for database

## Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad request / validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

Include detailed error messages for debugging while keeping them user-friendly.
