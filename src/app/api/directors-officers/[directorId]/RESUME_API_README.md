# Resume Upload API Documentation

## Overview

The Resume Upload API provides endpoints for managing director and officer resumes in the IPOReady system. The system handles file uploads, storage, text extraction, and structured data parsing from resume documents.

## Database Schema

The API uses the `director_resumes` table from `/migrations/023_board_member_files.sql`:

```sql
CREATE TABLE director_resumes (
  id UUID PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES professionals(id),
  file_path TEXT,
  file_url TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_mime_type VARCHAR(100),
  file_hash VARCHAR(64),
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP,
  uploaded_by_user_id UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  verified_by_user_id UUID REFERENCES users(id),
  verification_status VARCHAR(50) DEFAULT 'pending',
  verification_notes TEXT,
  is_readable BOOLEAN,
  text_extract TEXT,
  page_count INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Endpoints

### 1. Upload Resume

**Endpoint:** `POST /api/directors-officers/[directorId]/upload-resume`

**Description:** Upload a resume file (PDF, DOCX, or DOC) for a director/officer.

**Parameters:**
- `directorId` (path): UUID of the professional/director record

**Request:**
```bash
curl -X POST http://localhost:3000/api/directors-officers/[directorId]/upload-resume \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf"
```

**Constraints:**
- File size: Max 10MB
- File types: PDF, DOCX, DOC
- Only authenticated users can upload

**Response (Success - 200):**
```json
{
  "success": true,
  "resumeId": "550e8400-e29b-41d4-a716-446655440000",
  "fileUrl": "/resumes/[directorId]-1717584000000.pdf",
  "fileName": "John_Doe_Resume.pdf",
  "fileSize": 245634,
  "version": 1,
  "uploadedAt": "2026-06-04T15:00:00Z",
  "extraction": {
    "success": true,
    "textLength": 3245,
    "pageCount": 2,
    "data": {
      "education": [
        {
          "school": "Harvard University",
          "degree": "MBA",
          "fieldOfStudy": "Business Administration",
          "endDate": "2010"
        }
      ],
      "experience": [
        {
          "title": "Chief Financial Officer",
          "company": "TechCorp Inc.",
          "startDate": "2015",
          "description": "Led financial operations..."
        }
      ],
      "certifications": [],
      "boardPositions": [
        {
          "organization": "StartupXYZ",
          "position": "Board Member",
          "startDate": "2018"
        }
      ],
      "rawText": "[Full extracted text...]"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid file",
  "details": "File size exceeds maximum allowed size of 10MB"
}
```

---

### 2. Get Resume

**Endpoint:** `GET /api/directors-officers/[directorId]/get-resume`

**Description:** Retrieve a resume file for a director/officer.

**Parameters:**
- `directorId` (path): UUID of the professional/director record
- `resumeId` (query, optional): Specific resume ID to retrieve
- `current` (query, optional): Get current resume (default: true)
- `version` (query, optional): Get specific version number

**Request:**
```bash
# Get current resume
curl http://localhost:3000/api/directors-officers/[directorId]/get-resume

# Get specific resume by ID
curl http://localhost:3000/api/directors-officers/[directorId]/get-resume?resumeId=550e8400-e29b-41d4-a716-446655440000

# Get specific version
curl http://localhost:3000/api/directors-officers/[directorId]/get-resume?version=2
```

**Response (Success - 200):**
Returns the file stream with appropriate headers:
```
Content-Type: application/pdf
Content-Disposition: inline; filename="resume.pdf"
Cache-Control: no-cache, no-store, must-revalidate
```

**Response (Error - 404):**
```json
{
  "error": "Resume not found"
}
```

---

### 3. Delete Resume

**Endpoint:** `DELETE /api/directors-officers/[directorId]/delete-resume`

**Description:** Delete a resume file and remove it from the database.

**Parameters:**
- `directorId` (path): UUID of the professional/director record
- `resumeId` (query): ID of the resume to delete

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/directors-officers/[directorId]/delete-resume?resumeId=550e8400-e29b-41d4-a716-446655440000
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "resumeId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Error - 404):**
```json
{
  "error": "Resume not found"
}
```

**Behavior:**
- Deletes the file from `/public/resumes/` directory
- Removes the database record
- If deleted resume was marked as `is_current`, automatically sets the next version as current

---

### 4. Extract Resume Text

**Endpoint:** `POST /api/directors-officers/[directorId]/extract-resume-text`

**Description:** Parse resume text and extract structured data (education, experience, certifications, board positions).

**Parameters:**
- `directorId` (path): UUID of the professional/director record

**Request Body:**
```json
{
  "resumeId": "550e8400-e29b-41d4-a716-446655440000",
  "useAI": false
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/directors-officers/[directorId]/extract-resume-text \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "550e8400-e29b-41d4-a716-446655440000",
    "useAI": true
  }'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "extractedData": {
    "education": [
      {
        "school": "Stanford University",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2000",
        "endDate": "2004"
      }
    ],
    "experience": [
      {
        "title": "Senior Vice President",
        "company": "Goldman Sachs",
        "location": "New York, NY",
        "startDate": "2012",
        "endDate": "2020",
        "description": "Managed investment portfolio...",
        "isCurrentRole": false
      }
    ],
    "certifications": [
      {
        "name": "Certified Financial Analyst (CFA)",
        "issuer": "CFA Institute",
        "issuedDate": "2008",
        "expirationDate": "2028"
      }
    ],
    "boardPositions": [
      {
        "organization": "American Tech Foundation",
        "position": "Board of Directors",
        "startDate": "2015",
        "description": "Oversight of tech initiatives..."
      }
    ],
    "rawText": "[Full extracted text from resume...]"
  },
  "validation": {
    "isValid": true,
    "confidence": 0.85,
    "issues": []
  },
  "textLength": 4521,
  "extractionMethod": "claude-ai"
}
```

**Response (Error - 400):**
```json
{
  "error": "Resume text extraction failed or file is too short"
}
```

**Extraction Methods:**
- **Pattern Matching** (`useAI: false`): Basic keyword extraction and regex-based parsing
- **Claude AI** (`useAI: true`): Advanced extraction using Claude 3.5 Sonnet for higher accuracy

---

## File Storage

### Directory Structure
```
/public/resumes/
├── [directorId]-1717584000000.pdf
├── [directorId]-1717584100000.docx
├── [directorId]-1717584200000.doc
└── ...
```

### File Naming Convention
- Format: `[directorId]-[timestamp].[ext]`
- Example: `550e8400-e29b-41d4-a716-446655440000-1717584000000.pdf`
- Ensures unique filenames and chronological ordering

---

## Extracted Data Format

### Education Object
```typescript
interface EducationEntry {
  school: string           // University/School name
  degree: string          // Bachelor, Master, PhD, etc.
  fieldOfStudy: string    // Major/Field
  startDate?: string      // YYYY or YYYY-MM-DD
  endDate?: string        // YYYY or YYYY-MM-DD
  description?: string    // Additional details (GPA, honors, etc.)
}
```

### Experience Object
```typescript
interface ExperienceEntry {
  title: string           // Job title
  company: string         // Company/Organization name
  location?: string       // City, State or City, Country
  startDate?: string      // YYYY or YYYY-MM-DD
  endDate?: string        // YYYY or YYYY-MM-DD
  description?: string    // Job duties and achievements
  isCurrentRole?: boolean // True if currently employed
}
```

### Certification Object
```typescript
interface CertificationEntry {
  name: string            // Certification name (e.g., CFA, PMP)
  issuer: string          // Issuing organization
  issuedDate?: string     // Issue date
  expirationDate?: string // Expiration date
  credentialId?: string   // Credential ID or URL
}
```

### Board Position Object
```typescript
interface BoardPositionEntry {
  organization: string    // Company/Organization name
  position: string        // Board role (Director, Chair, etc.)
  startDate?: string      // Start date
  endDate?: string        // End date
  description?: string    // Role description
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful operation
- **400 Bad Request**: Invalid input or validation failure
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Error responses include:
```json
{
  "error": "Error message",
  "details": "Additional context or error details"
}
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid NextAuth session
2. **File Validation**: 
   - Size limit: 10MB
   - Allowed types: PDF, DOCX, DOC only
   - MIME type validation
3. **File Storage**: Resumes stored in `/public/resumes/` (publicly accessible for download)
4. **Data Isolation**: Users can only access resumes for directors in their company
5. **Hash Verification**: SHA256 file hash stored for deduplication detection

---

## Usage Examples

### Complete Upload and Extract Workflow

```javascript
// 1. Upload resume
const formData = new FormData()
formData.append('file', resumeFile)

const uploadResponse = await fetch(
  `/api/directors-officers/${directorId}/upload-resume`,
  { method: 'POST', body: formData }
)
const { resumeId, extraction } = await uploadResponse.json()

// 2. Extract with AI (if needed)
const extractResponse = await fetch(
  `/api/directors-officers/${directorId}/extract-resume-text`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeId,
      useAI: true
    })
  }
)
const { extractedData, validation } = await extractResponse.json()

// 3. Get resume file for download
const getResponse = await fetch(
  `/api/directors-officers/${directorId}/get-resume?resumeId=${resumeId}`
)
const blob = await getResponse.blob()
const url = URL.createObjectURL(blob)
// Use url for download or preview
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- Rate limit per user: 10 uploads per hour
- Rate limit per director: 5 concurrent extractions
- Bulk operations: Implement request queuing

---

## Future Enhancements

1. **OCR for Scanned Documents**: Integrate Tesseract or Google Cloud Vision for scanned PDFs
2. **Resume Template Detection**: Identify resume template to improve parsing accuracy
3. **LinkedIn Sync**: Integrate with LinkedIn verification (see `director_linkedin_verification` table)
4. **Compliance Validation**: Check for required board qualifications based on exchange rules
5. **Prospectus Auto-Population**: Auto-generate prospectus sections from extracted data
6. **Document Versioning**: Track resume versions and changes over time
7. **Batch Operations**: Support bulk resume extraction for multiple directors

---

## Related Endpoints

- **LinkedIn Verification**: `/api/directors-officers/[directorId]/linkedin-verify`
- **Prospectus Sync**: `/api/directors-officers/[directorId]/sync-to-prospectus`
- **Compliance Check**: `/api/directors-officers/check-compliance`

---

## Support

For issues or questions about the Resume Upload API, please refer to:
- Migrations: `/migrations/023_board_member_files.sql`
- Utilities: `/src/lib/resume-utils.ts`
- Database: Neon PostgreSQL
