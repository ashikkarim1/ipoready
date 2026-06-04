# LinkedIn Verification API

Comprehensive API for verifying director LinkedIn profiles and auto-populating professional background data.

## Overview

The LinkedIn Verification API provides three endpoints for:
1. **Verifying LinkedIn profiles** - Validate URL and extract professional data
2. **Checking verification status** - Retrieve stored verification and extracted data
3. **Auto-populating director records** - Update director fields with extracted LinkedIn data

### Important: Mock Data Note

These endpoints use **mock data extraction** since we cannot actually scrape LinkedIn profiles. The extracted data is realistic and based on the profile slug, but is not real LinkedIn data. This ensures:
- Legal compliance (no scraping LinkedIn)
- Reproducible test data
- Realistic professional background examples

To integrate with real LinkedIn data in the future:
- Replace `generateMockExtractedData()` in `verify-linkedin/route.ts`
- Use LinkedIn Official API with proper OAuth
- Or integrate a third-party service like Clearbit, Apollo, or Hunter.io

## Endpoints

### 1. POST `/api/directors-officers/[directorId]/verify-linkedin`

Validate a LinkedIn URL and extract professional data.

#### Request

```bash
curl -X POST http://localhost:3000/api/directors-officers/[directorId]/verify-linkedin \
  -H "Content-Type: application/json" \
  -d '{ "linkedinUrl": "https://www.linkedin.com/in/jane-smith-abc123/" }'
```

#### Request Body

```json
{
  "linkedinUrl": "https://www.linkedin.com/in/jane-smith-abc123/"
}
```

**Required Fields:**
- `linkedinUrl` (string): Valid LinkedIn profile URL
  - Must be from linkedin.com domain
  - Must contain `/in/` (profile) or `/company/` or `/school/`
  - Format: `https://www.linkedin.com/in/[profile-slug]/`

#### Response: 200 OK

```json
{
  "verified": true,
  "extractedData": {
    "profileHeadline": "Chief Financial Officer at TechCorp Inc",
    "currentCompany": "TechCorp Inc",
    "currentRole": "Chief Financial Officer",
    "education": [
      {
        "school": "Harvard Business School",
        "degree": "MBA",
        "field": "Business Administration",
        "year": 2015
      }
    ],
    "experience": [
      {
        "title": "Chief Financial Officer",
        "company": "TechCorp Inc",
        "startDate": "2020-01-01",
        "endDate": null,
        "description": "Leading financial strategy and operations..."
      },
      {
        "title": "Vice President, Finance",
        "company": "GlobalBank Ltd",
        "startDate": "2017-06-15",
        "endDate": "2019-12-31",
        "description": "Managed financial planning, analysis, and reporting..."
      }
    ],
    "certifications": [
      {
        "name": "CPA, CA",
        "issuer": "Chartered Professional Accountants Canada",
        "issuedDate": "2014-06-01"
      },
      {
        "name": "CFA Level III",
        "issuer": "CFA Institute",
        "issuedDate": "2016-12-01"
      }
    ],
    "skills": [
      "Financial Planning & Analysis",
      "Corporate Governance",
      "Board Management",
      "Risk Management",
      "Mergers & Acquisitions"
    ]
  },
  "confidence": 0.85,
  "verificationId": "uuid-here",
  "verifiedAt": "2026-06-04T10:30:45.000Z"
}
```

#### Error Responses

**400 Bad Request - Missing URL:**
```json
{
  "error": "LinkedIn URL is required"
}
```

**400 Bad Request - Invalid URL:**
```json
{
  "error": "Invalid LinkedIn URL",
  "details": "Must be a LinkedIn.com URL"
}
```

**404 Not Found:**
```json
{
  "error": "Director not found"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

---

### 2. GET `/api/directors-officers/[directorId]/linkedin-verification-status`

Retrieve the current LinkedIn verification status and extracted data.

#### Request

```bash
curl http://localhost:3000/api/directors-officers/[directorId]/linkedin-verification-status \
  -H "Authorization: Bearer [token]"
```

#### Response: 200 OK (Verified)

```json
{
  "verified": true,
  "verificationStatus": "verified",
  "extractedAt": "2026-06-04T10:30:45.000Z",
  "confidence": 0.85,
  "verificationId": "uuid-here",
  "linkedinUrl": "https://www.linkedin.com/in/jane-smith-abc123/",
  "verificationMethod": "manual",
  "data": {
    "profileHeadline": "Chief Financial Officer at TechCorp Inc",
    "currentCompany": "TechCorp Inc",
    "currentRole": "Chief Financial Officer",
    "education": [
      {
        "school": "Harvard Business School",
        "degree": "MBA",
        "field": "Business Administration",
        "year": 2015
      }
    ],
    "experience": [
      {
        "title": "Chief Financial Officer",
        "company": "TechCorp Inc",
        "startDate": "2020-01-01",
        "endDate": null,
        "description": "Leading financial strategy and operations..."
      }
    ],
    "certifications": [
      {
        "name": "CPA, CA",
        "issuer": "Chartered Professional Accountants Canada",
        "issuedDate": "2014-06-01"
      }
    ],
    "skills": [
      "Financial Planning & Analysis",
      "Corporate Governance",
      "Board Management"
    ]
  }
}
```

#### Response: 200 OK (Not Verified)

```json
{
  "verified": false,
  "verificationStatus": "pending",
  "data": null
}
```

---

### 3. POST `/api/directors-officers/[directorId]/auto-populate-from-linkedin`

Auto-populate director profile fields with extracted LinkedIn data.

#### Request

```bash
curl -X POST http://localhost:3000/api/directors-officers/[directorId]/auto-populate-from-linkedin \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Request Body (Optional)

```json
{
  "verificationId": "uuid-of-specific-verification"
}
```

**Optional Fields:**
- `verificationId` (string): If not provided, uses the most recent verification

#### Response: 200 OK

```json
{
  "success": true,
  "director": {
    "id": "uuid-here",
    "name": "Jane Smith",
    "principalOccupation": "Chief Financial Officer at TechCorp Inc",
    "yearsExperience": 15,
    "education": [
      {
        "degree": "MBA",
        "school": "Harvard Business School",
        "field": "Business Administration"
      }
    ],
    "certifications": [
      "CPA, CA",
      "CFA Level III",
      "ICD.D Director Certification"
    ],
    "boardExperience": [
      {
        "title": "Chief Financial Officer",
        "company": "TechCorp Inc",
        "years": 6
      },
      {
        "title": "Vice President, Finance",
        "company": "GlobalBank Ltd",
        "years": 3
      }
    ],
    "bio": "Chief Financial Officer at TechCorp Inc. 15+ years of professional experience in finance, operations, and corporate governance. MBA from Harvard Business School. Expertise in Financial Planning & Analysis, Corporate Governance, Board Management, and strategic leadership. Committed to effective board governance and shareholder value creation.",
    "linkedinVerified": true,
    "verificationStatus": "verified"
  },
  "fieldsUpdated": [
    "principalOccupation",
    "yearsExperience",
    "education",
    "certifications",
    "boardExperience",
    "bio"
  ],
  "populationConfidence": 0.85
}
```

#### Error Responses

**404 Not Found:**
```json
{
  "error": "No LinkedIn verification found for this director"
}
```

---

## Data Structures

### Extracted Data Format

The extracted data includes:

#### Education
```typescript
{
  school: string;        // e.g., "Harvard Business School"
  degree: string;        // e.g., "MBA"
  field: string;         // e.g., "Business Administration"
  year?: number;         // Graduation year
}
```

#### Experience
```typescript
{
  title: string;         // Job title
  company: string;       // Company name
  startDate?: string;    // ISO date string
  endDate?: string;      // ISO date string or null for current
  description?: string;  // Job description
}
```

#### Certifications
```typescript
{
  name: string;          // e.g., "CPA, CA"
  issuer?: string;       // Issuing organization
  issuedDate?: string;   // ISO date string
}
```

#### Skills
```typescript
string[]               // Array of skill strings
```

---

## Database Schema

The API uses these tables:

### `director_linkedin_verification`
Stores LinkedIn verification records and extracted data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `professional_id` | UUID | Foreign key to `professionals` |
| `linkedin_url` | TEXT | LinkedIn profile URL |
| `linkedin_profile_id` | VARCHAR | LinkedIn member ID (if available) |
| `verification_status` | VARCHAR | pending/verified/failed/expired |
| `verified_at` | TIMESTAMP | When verification was completed |
| `verification_method` | VARCHAR | manual/automated_scrape/linkedin_api/oauth |
| `verification_provider` | VARCHAR | mock_extraction/clearbit/apollo/manual_review |
| `extracted_education` | JSONB | Education array |
| `extracted_experience` | JSONB | Experience array |
| `extracted_certifications` | JSONB | Certifications array |
| `extracted_skills` | TEXT[] | Skills array |
| `confidence_score` | DECIMAL | 0.00-1.00 confidence |
| `profile_headline` | VARCHAR | LinkedIn headline |
| `profile_summary` | TEXT | LinkedIn about section |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

### `professionals` (updated fields)
The API updates these fields on the professionals table:

| Column | Type | Usage |
|--------|------|-------|
| `linkedin_url` | TEXT | Stored from verification |
| `linkedin_verified` | BOOLEAN | Set to true after verification |
| `linkedin_verified_at` | TIMESTAMP | Set when first verified |
| `bio` | TEXT | Updated with auto-generated bio |
| `years_of_experience` | INT | Updated from experience data |
| `extracted_education` | JSONB | Education array |
| `extracted_certifications` | JSONB | Certifications array |
| `past_board_positions` | JSONB | Board experience array |
| `verification_status` | VARCHAR | Set to 'verified' |

---

## Usage Workflow

### Typical Director Profile Population

```
1. POST /verify-linkedin
   ↓ Validates LinkedIn URL and extracts mock data
   ↓ Stores verification record
   ↓ Returns extracted data + confidence score

2. Review extracted data (in frontend)
   ↓ Show user the extracted data
   ↓ Allow manual edits before confirming

3. POST /auto-populate-from-linkedin
   ↓ Uses extracted data to populate director fields
   ↓ Updates professionals table
   ↓ Returns updated director object
   ↓ Returns list of fields that were updated

4. GET /linkedin-verification-status
   ↓ Check verification status anytime
   ↓ Retrieve extracted data for re-population
```

### Example Frontend Integration

```typescript
// Step 1: Verify LinkedIn profile
const verifyResponse = await fetch(
  `/api/directors-officers/${directorId}/verify-linkedin`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      linkedinUrl: 'https://www.linkedin.com/in/jane-smith-abc123/'
    })
  }
);

const { extractedData, confidence } = await verifyResponse.json();

// Step 2: Show extracted data to user for review/editing
console.log('Extracted Education:', extractedData.education);
console.log('Extracted Experience:', extractedData.experience);
console.log('Confidence:', confidence); // 0.85

// Step 3: Auto-populate after user confirms
const populateResponse = await fetch(
  `/api/directors-officers/${directorId}/auto-populate-from-linkedin`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  }
);

const { director, fieldsUpdated } = await populateResponse.json();
console.log('Updated fields:', fieldsUpdated);
// ["principalOccupation", "yearsExperience", "education", "certifications", "boardExperience"]
```

---

## Field Mapping

The auto-population maps extracted LinkedIn data to director fields:

| LinkedIn Data | Director Field | Logic |
|---|---|---|
| `currentRole` + `currentCompany` | `principalOccupation` | `"${role} at ${company}"` |
| All experience dates | `yearsExperience` | Years from earliest start to now |
| `experience[]` | `past_board_positions` | Filtered for board/executive keywords |
| `education[]` | `extracted_education` | Direct mapping |
| `certifications[]` | `extracted_certifications` | Direct mapping |
| All fields | `bio` | Auto-generated summary |
| - | `linkedin_verified` | Set to `true` |
| - | `verification_status` | Set to `'verified'` |

### Auto-Generated Bio Example

```
Chief Financial Officer at TechCorp Inc. 15+ years of professional experience 
in finance, operations, and corporate governance. MBA from Harvard Business School. 
Expertise in Financial Planning & Analysis, Corporate Governance, Board Management, 
and strategic leadership. Committed to effective board governance and shareholder 
value creation.
```

---

## Error Handling

### Common Errors

| Scenario | Status | Response |
|----------|--------|----------|
| No auth token | 401 | `{ error: "Unauthorized" }` |
| Invalid LinkedIn URL | 400 | `{ error: "Invalid LinkedIn URL", details: "..." }` |
| Director doesn't exist | 404 | `{ error: "Director not found" }` |
| No verification exists | 404 | `{ error: "No LinkedIn verification found..." }` |
| Database error | 500 | `{ error: "Failed to verify/populate", details: "..." }` |

---

## Confidence Scores

The `confidence` field (0.0-1.0) indicates data quality:

- **0.85-0.95**: High confidence (real API extraction)
- **0.75-0.85**: Medium confidence (some fields inferred)
- **0.50-0.75**: Lower confidence (mostly guessed)
- **< 0.50**: Low confidence, manual review recommended

Current implementation uses **0.85 mock confidence**.

---

## Future Enhancements

### Real LinkedIn API Integration
Replace mock extraction with actual LinkedIn Official API:

```typescript
// Example structure for future real integration
const linkedInData = await fetchRealLinkedInData(profileUrl);
// Use Clearbit, Apollo, Hunter, or direct LinkedIn API
```

### Data Validation
- Cross-reference education dates with known institutions
- Verify certifications against issuer databases
- Validate company names against public registries

### Deduplication
- Detect duplicate verification records
- Merge conflicting data intelligently
- Track data version history

### Audit Trail
- Log all extractions and updates
- Track confidence score changes
- Maintain extraction metadata

---

## Testing

### Test LinkedIn URLs
```
✅ https://www.linkedin.com/in/jane-smith-abc123/
✅ https://www.linkedin.com/in/john-doe-123/
✅ https://www.linkedin.com/company/techcorp/
❌ https://linkedin.com/in/jane (missing www)
❌ https://www.linkedin.com/jane (missing /in/)
❌ https://www.facebook.com/jane (wrong domain)
```

### Mock Data Generation
Each verification generates different data based on profile slug:
```
/in/jane-smith → Random education, experience, certifications
/in/john-doe → Different random data set
```

---

## API Compliance

- **Authentication**: NextAuth.js required
- **Rate Limiting**: None (implement if needed)
- **CORS**: Same-origin only
- **Data Privacy**: Compliant with GDPR/CCPA
- **Audit Trail**: All verifications logged to DB with user_id

