# Filing Export API

Comprehensive API endpoints for exporting director and officer information in regulatory filing formats (SEDAR 2, SEC Edgar, and PDF).

## Table of Contents

- [Endpoints](#endpoints)
- [Request/Response Formats](#requestresponse-formats)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Filing Format Specifications](#filing-format-specifications)
- [Error Handling](#error-handling)

---

## Endpoints

### 1. POST /api/directors-officers/export/sedar2

Generate SEDAR 2 formatted filing content for directors and officers.

**Request Body:**
```json
{
  "directorIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Response (Success - 200):**
```json
{
  "format": "text",
  "sedar2Content": "MANAGEMENT AND DIRECTORS\n...",
  "generatedAt": "2026-06-04T15:30:00.000Z",
  "directorCount": 3,
  "companyInfo": {
    "name": "Tech Innovation Inc.",
    "ipoDate": "2026-06-15"
  }
}
```

**Response Format Details:**

The generated text includes:

1. **Header Section**
   - Title: "MANAGEMENT AND DIRECTORS"
   - Company-specific introduction

2. **Summary Table**
   - Columns: Name | Title | Independent (Y/N) | Experience | Education
   - Professional formatting with proper alignment
   - Quick reference for all directors

3. **Biographical Narratives (3-5 sentences each)**
   - Principal occupation and experience
   - Professional certifications and designations
   - Board experience and committee service
   - Years of industry experience
   - Overall qualifications summary

4. **Related Party Transactions**
   - Standard disclosure for compliance
   - References to public filings

5. **File Metadata**
   - Generation timestamp
   - IPO date (if available)

**Example SEDAR2 Content:**
```
MANAGEMENT AND DIRECTORS
================================================================================

The following table sets out information concerning the directors and officers of
Tech Innovation Inc.:

Name                  | Title                        | Independent | Experience | Education
-----------------------|-------------------------------|-------------|-----------|----------
John Smith            | Chief Executive Officer      | Yes         | 25yrs     | Yes
Jane Doe              | Chief Financial Officer      | Yes         | 20yrs     | Yes
Robert Johnson        | Independent Director         | Yes         | 30yrs     | Yes

BIOGRAPHICAL INFORMATION
================================================================================

John Smith
----------
Title: Chief Executive Officer
Independent: Yes

John Smith serves as Chief Executive Officer. Smith is a CPA, Chartered Director, 
and ISO 9001 Lead Auditor. Smith has served in various board capacities, including: 
Audit Committee Chair at Public Corp Inc; Board Member at Tech Ventures LLC. With 
25 years of experience in the industry, Smith brings substantial expertise to the board.

[Additional directors follow...]

RELATED PARTY TRANSACTIONS
================================================================================

As of the date hereof, none of the directors or officers has engaged in any material
related party transactions with the Company, except as otherwise disclosed in the
Company's public filings.
```

---

### 2. POST /api/directors-officers/export/sec-edgar

Generate SEC Edgar formatted filing content for directors and officers.

**Request Body:**
```json
{
  "directorIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "format": "html"
}
```

**Query Parameters:**
- `format` (optional): `'html'` or `'text'`, default is `'html'`

**Response (Success - 200):**
```json
{
  "format": "html",
  "content": "<!DOCTYPE html>...",
  "generatedAt": "2026-06-04T15:30:00.000Z",
  "directorCount": 2,
  "companyInfo": {
    "name": "Tech Innovation Inc.",
    "ipoDate": "2026-06-15"
  }
}
```

**Response Format Details (HTML):**

The generated HTML includes:

1. **Document Header**
   - Document title: "Director, Executive Officer, and Significant Employee Information"
   - Company name and filing date
   - IPO date (if available)
   - Professional formatting suitable for web and print

2. **Director Sections (200+ words each)**
   For each director:
   - Name and title
   - Age estimation based on experience
   - Principal occupation and industry focus
   - Professional expertise and skills
   - Educational background
   - Professional certifications and designations

3. **Education Section**
   - List of degrees and certifications
   - Academic institutions and fields of study

4. **Experience and Expertise**
   - Detailed biographical narrative (200+ words)
   - Industry knowledge and strategic insights
   - Governance expertise highlights

5. **Committee Memberships**
   - Board service positions
   - Audit Committee, Compensation Committee, etc.
   - Years of service where available

6. **Corporate Governance Expertise**
   - Governance experience summary
   - Board qualification statement

7. **Executive Compensation Section**
   - Summary statement
   - Reference to SEC disclosure rules

8. **Corporate Governance Section**
   - Company governance philosophy
   - Board composition statement

**Response Format Details (Text):**

Similar structure to HTML but in plain text format, suitable for:
- Copy/paste into documents
- Direct filing submissions
- Integration with document systems

---

### 3. POST /api/directors-officers/export/pdf

Generate PDF file with formatted director bios suitable for IPO filing.

**Request Body:**
```json
{
  "directorIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "format": "sedar2"
}
```

**Response (Success - 200):**
```json
{
  "format": "pdf",
  "pdfUrl": "/api/directors-officers/export/pdf/download?key=dir-export-abc123-xyz789",
  "downloadKey": "dir-export-abc123-xyz789",
  "generatedAt": "2026-06-04T15:30:00.000Z",
  "directorCount": 3,
  "companyInfo": {
    "name": "Tech Innovation Inc.",
    "ipoDate": "2026-06-15",
    "effectiveDate": "2026-06-04"
  },
  "fileSize": 24576
}
```

**PDF Content Structure:**

1. **Title Page**
   - Company name
   - "Management and Directors" heading
   - Effective date
   - IPO date (if available)
   - Headquarters (if available)
   - Generation date

2. **Table of Contents**
   - Management and Directors
   - Biographical Information
   - Related Party Transactions

3. **Management and Directors Section**
   - Introductory text
   - Summary table (Name | Title | Independent | Experience)
   - Professional formatting with borders and alignment

4. **Biographical Information**
   - Full biographical narratives for each director
   - Title and independence status
   - Detailed professional background

5. **Related Party Transactions**
   - Standard regulatory disclosure
   - References to public filings

**PDF Features:**
- Professional letter-size formatting (8.5" x 11")
- 50pt top/bottom margins, 50pt left/right margins
- Automatic page breaks for long content
- Proper font sizing (14pt headings, 11pt body text)
- Table formatting for director summary
- Justified text alignment for biographical narratives
- Company branding and metadata

---

## Request/Response Formats

### Common Request Parameters

All export endpoints require:

1. **Authentication**
   - Bearer token via `Authorization` header
   - NextAuth session validation

2. **Company Context**
   - Derived from authenticated user's `companyId`
   - Auto-filtered to user's company only

3. **Director Selection**
   - `directorIds`: Array of UUID strings
   - Minimum 1 director required
   - Maximum 100 directors per request (recommended)

### Common Response Fields

All successful responses (200) include:

```json
{
  "format": "text|html|pdf",
  "generatedAt": "ISO-8601 timestamp",
  "directorCount": number,
  "companyInfo": {
    "name": "string",
    "ipoDate": "YYYY-MM-DD|null"
  }
}
```

Format-specific fields:

- **SEDAR2**: `sedar2Content` (text)
- **SEC Edgar**: `content` (html or text)
- **PDF**: `pdfUrl`, `downloadKey`, `fileSize`

---

## Features

### SEDAR2 Export

- **Format**: Plain text, suitable for SEDAR filing systems
- **Table**: Standardized director summary with key metrics
- **Narratives**: Compliant biographical descriptions (3-5 sentences each)
- **Metadata**: File headers with company and filing information
- **Compliance**: Includes related party transaction disclosures

### SEC Edgar Export

- **Formats**: HTML (primary) and plain text
- **Content**: 200+ word biographical paragraphs per director
- **Sections**: Education, experience, committee memberships, governance expertise
- **Metadata**: Document headers with company and filing dates
- **Accessibility**: HTML includes proper semantic tags
- **Print-Ready**: Optimized for PDF printing from HTML

### PDF Export

- **Professional Design**: Letter-size with proper margins
- **Title Page**: Company branding and effective dates
- **Table of Contents**: Navigation for printed documents
- **Auto-Pagination**: Intelligent page breaks for content
- **Download Link**: Temporary secure download URL
- **Tracking**: Download key for audit trail

---

## Usage Examples

### Example 1: Export 3 Directors in SEDAR2 Format

```bash
curl -X POST http://localhost:3000/api/directors-officers/export/sedar2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "directorIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ]
  }' | jq '.sedar2Content' > directors-sedar2.txt
```

### Example 2: Export with SEC Edgar HTML Format

```bash
curl -X POST http://localhost:3000/api/directors-officers/export/sec-edgar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "directorIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ],
    "format": "html"
  }' | jq '.content' > directors-sec-edgar.html
```

### Example 3: Generate PDF for Filing

```bash
curl -X POST http://localhost:3000/api/directors-officers/export/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "directorIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }' | jq '.pdfUrl' -r | xargs curl -o directors-bio.pdf
```

### Example 4: JavaScript/TypeScript Client

```typescript
import axios from 'axios'

// SEDAR2 Export
const sedar2Response = await axios.post(
  '/api/directors-officers/export/sedar2',
  {
    directorIds: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002'
    ]
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

console.log(sedar2Response.data.sedar2Content)

// SEC Edgar Export (HTML)
const secResponse = await axios.post(
  '/api/directors-officers/export/sec-edgar',
  {
    directorIds: ['550e8400-e29b-41d4-a716-446655440001'],
    format: 'html'
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

// Save HTML to file
const fs = require('fs')
fs.writeFileSync('directors.html', secResponse.data.content)

// PDF Export
const pdfResponse = await axios.post(
  '/api/directors-officers/export/pdf',
  {
    directorIds: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002'
    ]
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

console.log('PDF URL:', pdfResponse.data.pdfUrl)
console.log('Download Key:', pdfResponse.data.downloadKey)
```

---

## Filing Format Specifications

### SEDAR2 Specifications

**Canadian Continuous Disclosure Filings**

- **Filing System**: System for Electronic Document Analysis and Retrieval (SEDAR2)
- **Regulatory Body**: Canadian Securities Administrators (CSA)
- **Document Type**: Form 41-101 (Registration statement) or Form 44-101 (Prospectus)

**Content Requirements:**
- Management discussion and analysis
- Director and officer biographies
- Related party transaction disclosures
- Education and experience details
- Professional certifications

**File Format:**
- Plain ASCII text
- Fixed-width table formatting
- Maximum line length: 80 characters
- Logical section separation

### SEC Edgar Specifications

**United States Securities and Exchange Commission**

- **Filing System**: Electronic Data Gathering (EDGAR)
- **Regulatory Body**: U.S. Securities and Exchange Commission (SEC)
- **Document Types**: S-1, S-4, 10-K, Proxy Statements (DEF 14A)

**Content Requirements:**
- Director, Executive Officer, and Significant Employee Information
- Biographical information (200+ words per director)
- Education and professional background
- Committee memberships and board service
- Age and tenure
- Corporate governance expertise

**File Format:**
- HTML with proper semantic markup
- Plain text alternative acceptable
- Structured data format preferred
- Inline disclosures supported

### PDF Specifications

**Universal Document Format**

- **Standard**: PDF 1.4 compatible
- **Page Size**: Letter (8.5" x 11")
- **Margins**: 50pt all sides
- **Font**: Helvetica (standard PDF font)
- **Font Sizes**:
  - Title: 24pt bold
  - Heading 1: 14pt bold
  - Heading 2: 12pt bold
  - Body: 11pt regular
  - Table: 10pt regular

**Content Features:**
- Automatic pagination
- Table of contents support
- Hyperlink preservation
- Metadata embedding
- Print-ready formatting

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "error": "directorIds must be a non-empty array"
}
```

Response Examples:

```bash
# Missing directorIds
HTTP 400: "directorIds must be a non-empty array"

# Invalid format parameter
HTTP 400: "format must be either 'html' or 'text'"

# Empty array
HTTP 400: "directorIds must be a non-empty array"
```

**404 Not Found:**
```json
{
  "error": "No directors found with provided IDs"
}
```

```bash
# When directors don't exist
HTTP 404: "No directors found with provided IDs"

# When company doesn't exist
HTTP 404: "Company not found"
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate SEDAR2 export"
}
```

---

## Implementation Notes

### Data Completeness

Export endpoints automatically handle missing data:

1. **Name & Title**: Required; export fails if missing
2. **Professional Bio**: Optional; uses title as fallback
3. **Education**: Optional; skipped if not available
4. **Certifications**: Optional; merged from all sources
5. **Board Experience**: Optional; skipped if not available
6. **LinkedIn Verification**: Used to determine independence

### Independence Determination

Directors are marked as "Independent" when:
- `verification_status = 'verified'` in database
- Verified via LinkedIn profile
- Profile passes independence checks

Otherwise marked as "Dependent"

### File Size Considerations

- **SEDAR2 Text**: Typically 5-15KB per director
- **SEC Edgar HTML**: Typically 10-25KB per director
- **PDF**: Typically 20-50KB per director
- Recommended batch size: 10-20 directors per export

### Rate Limiting

No built-in rate limiting, but recommended:
- Max 100 directors per request
- Max 1 request per 5 seconds per user
- Max 1000 exports per month per company

---

## Related Documentation

- [Directors & Officers Prospectus Sync API](../README.md)
- [Sync Utilities Library](../../../../lib/directors-sync-utils.ts)
- [LinkedIn Verification API](../[directorId]/LINKEDIN_VERIFICATION_API.md)
- [Resume Upload API](../[directorId]/RESUME_API_README.md)

---

## Database Schema

Required tables:

- `companies` (id, name, ipo_date, headquarters)
- `professionals` (id, name, professional_title, bio, past_board_positions, certifications, years_of_experience, linkedin_verified, verification_status, industries)
- `director_export_downloads` (download_key, company_id, format, director_count, file_size, created_at) - *optional, for tracking*

---

## Version History

- **v1.0** (2026-06-04): Initial release
  - SEDAR2 export with table and biographical narratives
  - SEC Edgar export in HTML and text formats
  - PDF export with professional formatting
  - Download tracking and metadata
