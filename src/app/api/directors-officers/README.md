# Directors & Officers Prospectus Sync API

Comprehensive API endpoints for synchronizing director/officer information with prospectus documents. Handles resume data extraction, LinkedIn verification, compliance validation, and prospectus section generation.

## Table of Contents

- [Endpoints](#endpoints)
- [Database Schema](#database-schema)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Compliance Checks](#compliance-checks)
- [Error Handling](#error-handling)

## Endpoints

### 1. POST /api/directors-officers/sync-to-prospectus

Sync director/officer information to prospectus document with formatted bios and compliance validation.

**Request Body:**
```json
{
  "directorIds": ["uuid-1", "uuid-2", "uuid-3"],
  "prospectusDocumentId": "optional-uuid"
}
```

**Response (Success):**
```json
{
  "synced": true,
  "syncedCount": 3,
  "directors": [
    {
      "id": "director-uuid",
      "name": "John Smith",
      "title": "Chief Executive Officer",
      "independence": "Independent",
      "principalOccupation": "CEO and founder of tech startup with 20 years experience",
      "yearsExperience": 25,
      "education": [
        {
          "degree": "MBA",
          "school": "Harvard Business School",
          "field": "Business Administration"
        },
        {
          "degree": "BS",
          "school": "MIT",
          "field": "Computer Science"
        }
      ],
      "certifications": ["CPA", "Certified Director", "ISO 9001 Lead Auditor"],
      "boardExperience": [
        {
          "title": "Audit Committee Chair",
          "company": "Public Corp Inc",
          "years": 3
        },
        {
          "title": "Board Member",
          "company": "Tech Ventures LLC",
          "years": 5
        }
      ],
      "stockOwnership": {
        "percentage": 15.5,
        "status": "founder"
      },
      "relatedPartyTransactions": [],
      "linkedInVerified": true,
      "verificationStatus": "verified"
    }
  ],
  "prospectusSection": "management-directors",
  "complianceStatus": {
    "allRequiredFieldsPresent": true,
    "missingFields": [],
    "warnings": []
  },
  "syncStatus": [
    {
      "directorId": "uuid-1",
      "syncId": "sync-record-uuid",
      "status": "synced",
      "syncedAt": "2026-06-04T12:34:56.789Z"
    }
  ]
}
```

**Compliance Validation:**
- Checks for required fields: name, title, years of experience
- Validates education and certification data
- Verifies LinkedIn profile information
- Returns errors for missing critical fields, warnings for incomplete data

---

### 2. GET /api/directors-officers/get-prospectus-section

Retrieve all directors formatted for prospectus filing, organized by role/committee.

**Query Parameters:**
- `prospectusDocumentId` (optional): Filter to specific prospectus document
- `sectionType` (optional): `board_of_directors`, `management_team`, `audit_committee`, `compensation_committee`
- `includePhotos` (optional): boolean - include photo URLs if available

**Response:**
```json
{
  "prospectusSection": "management-directors",
  "totalDirectors": 8,
  "boardOfDirectors": {
    "count": 5,
    "role": "Board Member",
    "members": [
      {
        "id": "uuid",
        "name": "Jane Doe",
        "title": "Board Chair",
        "independence": "Independent",
        "principalOccupation": "Former CFO with 30+ years in finance",
        "yearsExperience": 35,
        "education": [
          {
            "degree": "MBA",
            "school": "Stanford",
            "field": "Finance"
          }
        ],
        "certifications": ["CPA", "CFA"],
        "boardExperience": [
          {
            "title": "Audit Committee Member",
            "company": "Fortune 500 Corp",
            "years": 8
          }
        ],
        "stockOwnership": {
          "percentage": 2.5,
          "status": "founder"
        },
        "relatedPartyTransactions": [],
        "linkedInVerified": true,
        "verificationStatus": "verified",
        "lastSynced": "2026-06-04T12:34:56.789Z",
        "syncStatus": "synced"
      }
    ]
  },
  "auditCommittee": {
    "count": 3,
    "role": "Audit Committee Member",
    "members": [...]
  },
  "compensationCommittee": {
    "count": 2,
    "role": "Compensation Committee Member",
    "members": [...]
  },
  "executiveManagement": {
    "count": 3,
    "role": "Executive Officer",
    "members": [...]
  },
  "complianceStatus": {
    "dataCompleteness": 92,
    "allVerified": true,
    "lastSyncedAt": "2026-06-04T12:34:56.789Z",
    "outOfSyncCount": 0
  },
  "filingSummary": {
    "readyForFiling": true,
    "missingRequiredFields": [],
    "recommendations": [
      "Update resume for Jane Doe (expires 2026-09-01)"
    ]
  }
}
```

---

### 3. GET /api/directors-officers/check-compliance

Comprehensive compliance check and data completeness validation for directors.

**Query Parameters:**
- `directorIds` (optional): Comma-separated director IDs. If omitted, checks all directors.

**Response:**
```json
{
  "totalDirectors": 8,
  "compliant": {
    "count": 6,
    "directors": ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5", "uuid-6"]
  },
  "partiallyCompliant": {
    "count": 2,
    "directors": ["uuid-7", "uuid-8"],
    "issues": [
      {
        "directorId": "uuid-7",
        "field": "certifications",
        "reason": "No professional certifications listed",
        "severity": "warning"
      },
      {
        "directorId": "uuid-8",
        "field": "bio",
        "reason": "Missing principal occupation/bio",
        "severity": "warning"
      }
    ]
  },
  "nonCompliant": {
    "count": 0,
    "directors": [],
    "criticalIssues": []
  },
  "complianceScore": 95,
  "overallStatus": "mostly_compliant",
  "recommendations": [
    "Add certifications for 1 director",
    "Verify 2 directors via LinkedIn for independence status"
  ],
  "detailedReport": [
    {
      "directorId": "uuid-1",
      "name": "John Smith",
      "completeness": 100,
      "issues": []
    },
    {
      "directorId": "uuid-7",
      "name": "Sarah Johnson",
      "completeness": 83,
      "issues": [
        {
          "field": "certifications",
          "reason": "No professional certifications listed",
          "severity": "warning"
        }
      ]
    }
  ]
}
```

---

## Database Schema

The API uses these core tables:

### professionals
- `id` (UUID): Director/officer identifier
- `name`: Full name
- `professional_title`: Current title/position
- `bio`: Principal occupation description
- `linkedin_verified`: Boolean verification status
- `verification_status`: 'verified' | 'unverified' | 'pending'
- `years_of_experience`: Years in field
- `certifications`: Array of certification names
- `past_board_positions`: JSONB array of board positions

### director_linkedin_verification
- `professional_id` (UUID): FK to professionals
- `verification_status`: LinkedIn verification status
- `extracted_education`: JSONB array of education records
- `extracted_certifications`: JSONB array of certifications
- `extracted_skills`: Array of skills
- `confidence_score`: 0.0-1.0 confidence in extracted data

### director_prospectus_sync
- `professional_id` (UUID): FK to professionals
- `prospectus_document_id` (UUID): FK to prospectus_documents
- `section_type`: 'board_of_directors' | 'management_team' | 'audit_committee' | etc.
- `sync_status`: 'synced' | 'partial' | 'error'
- `sync_confidence`: 0.0-1.0 confidence in sync
- `last_synced_at`: Last sync timestamp
- `is_stale`: Boolean, true if source data changed since sync

---

## Features

### Data Extraction

**Resume Parsing:**
- Extracts resume file information and verification status
- OCR text extraction for searchability
- Version tracking for resume updates

**LinkedIn Verification:**
- Verified status with confidence scoring
- Extracted education, experience, certifications
- LinkedIn profile snapshot for audit trail

### Compliance Validation

**Required Fields:**
- Director name
- Professional title
- Years of experience

**Recommended Fields:**
- Principal occupation/bio
- Professional certifications
- Board experience
- Education details
- LinkedIn verification

### Sync Status Tracking

- Records sync timestamp for audit trail
- Tracks data versions (source vs. prospectus)
- Detects stale data when source changes
- Stores sync errors for investigation
- Calculates sync confidence scores

---

## Usage Examples

### Example 1: Sync 3 Directors to Prospectus

```bash
curl -X POST http://localhost:3000/api/directors-officers/sync-to-prospectus \
  -H "Content-Type: application/json" \
  -d '{
    "directorIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ],
    "prospectusDocumentId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Example 2: Get Prospectus Section Ready for Filing

```bash
curl http://localhost:3000/api/directors-officers/get-prospectus-section \
  -H "Authorization: Bearer <token>"
```

With filters:
```bash
curl "http://localhost:3000/api/directors-officers/get-prospectus-section?sectionType=board_of_directors&prospectusDocumentId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

### Example 3: Check Compliance for Specific Directors

```bash
curl "http://localhost:3000/api/directors-officers/check-compliance?directorIds=uuid-1,uuid-2,uuid-3" \
  -H "Authorization: Bearer <token>"
```

---

## Compliance Checks

The API performs multi-level compliance validation:

### Level 1: Critical (Errors)
- Missing director name
- Missing professional title
- Missing professional ID

### Level 2: Important (Warnings)
- Missing years of experience
- Missing principal occupation/bio
- No certifications listed
- No board experience
- Not verified via LinkedIn

### Compliance Scoring

- **Fully Compliant (100%)**: All critical fields present, no warnings
- **Mostly Compliant (80-99%)**: All critical fields, some warnings
- **Partially Compliant (0-79%)**: Missing some critical fields
- **Non-Compliant**: Major gaps in required data

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

**404 Not Found:**
```json
{
  "error": "No directors found with provided IDs"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to sync directors to prospectus"
}
```

---

## Implementation Notes

### Handling Missing Data

When resume or form field data is missing:
1. API first checks `director_linkedin_verification` for extracted data
2. Falls back to `professionals` table form fields
3. Returns with appropriate warning if data unavailable
4. Sets sync_confidence lower if critical fields missing

### LinkedIn Verification

- Only considers `verification_status = 'verified'` as truly verified
- Uses highest confidence score when multiple verifications exist
- Marks as "Independent" only if verified via LinkedIn
- Otherwise defaults to "Dependent" status

### Sync Status

- Creates new sync record on first sync
- Updates existing record if syncing same director+prospectus+section
- Tracks all sync attempts and errors
- Flags as "stale" if source data modified since last sync

---

## Related Documentation

- [Professionals/Board Members Schema](../../../db/migrations/022_board_talent_marketplace.sql)
- [Director Files & Verification Schema](../../../db/migrations/023_board_member_files.sql)
- [Prospectus Auto-Builder](../prospectus/README.md)
- [Sync Utilities Library](../../../lib/directors-sync-utils.ts)
