# Resume Upload API Implementation

## Overview

A comprehensive Resume Upload API has been created for the IPOReady platform to manage director and officer resume uploads, storage, text extraction, and structured data parsing.

## Files Created

### 1. API Endpoints

#### `/src/app/api/directors-officers/[directorId]/upload-resume/route.ts`
- **Endpoint**: `POST /api/directors-officers/[directorId]/upload-resume`
- **Description**: Upload a resume file (PDF, DOCX, DOC)
- **Features**:
  - Multipart file upload support
  - File validation (10MB max, PDF/DOCX/DOC only)
  - Automatic text extraction from resume
  - Basic resume parsing (education, experience, certifications, board positions)
  - Stores metadata in `director_resumes` table
  - File hash calculation for deduplication
  - Returns resume ID, file URL, and extracted data
- **Response**: `{ success: true, resumeId, fileUrl, extraction: {...} }`

#### `/src/app/api/directors-officers/[directorId]/get-resume/route.ts`
- **Endpoint**: `GET /api/directors-officers/[directorId]/get-resume`
- **Description**: Retrieve a resume file for download
- **Features**:
  - Query parameters: `resumeId`, `current`, `version`
  - Returns file stream with proper Content-Type headers
  - Cache control headers for security
- **Response**: Binary file stream

#### `/src/app/api/directors-officers/[directorId]/delete-resume/route.ts`
- **Endpoint**: `DELETE /api/directors-officers/[directorId]/delete-resume`
- **Description**: Delete a resume file and database record
- **Features**:
  - Removes file from `/public/resumes/` directory
  - Deletes database record
  - Auto-promotes next version to current if needed
  - Returns `{ success: true }`

#### `/src/app/api/directors-officers/[directorId]/extract-resume-text/route.ts`
- **Endpoint**: `POST /api/directors-officers/[directorId]/extract-resume-text`
- **Description**: Extract structured data from resume text
- **Features**:
  - Two extraction methods:
    - Pattern matching (default) - fast, uses regex/keyword matching
    - Claude AI (optional) - accurate, uses Claude 3.5 Sonnet
  - Extracts: education, experience, certifications, board positions
  - Calculates confidence score
  - Validates extracted data quality
  - Stores extracted text in database
- **Response**: `{ success: true, extractedData, validation: {...}, extractionMethod }`

### 2. Utilities

#### `/src/lib/resume-utils.ts`
Core utilities for resume processing:
- `validateResumeFile()` - Validates file size, type, extension
- `generateFileHash()` - SHA256 file hash for deduplication
- `generateResumePath()` - Secure file path generation
- `extractPdfText()` - PDF text extraction using pdf-parse
- `extractDocxText()` - DOCX text extraction using office-text-extractor
- `extractDocText()` - DOC file handling (basic)
- `extractResumeText()` - Unified extraction interface
- `parseResumeText()` - Pattern matching for structured data
- `validateResumeData()` - Quality validation with confidence scoring

### 3. Type Definitions

#### `/src/lib/types/resume.types.ts`
Complete TypeScript types and interfaces:
- `EducationEntry` - Degree, school, field of study, dates
- `ExperienceEntry` - Job title, company, dates, description
- `CertificationEntry` - Certification name, issuer, dates
- `BoardPositionEntry` - Organization, position, dates
- `ExtractedResumeData` - Container for all extracted fields
- `DirectorResumeRecord` - Database record type
- API request/response types:
  - `UploadResumeResponse`
  - `DeleteResumeResponse`
  - `ExtractResumeTextResponse`
- Verification status types
- Extraction method enums
- Bulk operations types
- Analytics and metrics types

### 4. Client Library

#### `/src/lib/hooks/useResumeUpload.ts`
React hooks for client-side resume management:
- `useResumeUpload()` - Hook for single resume operations
  - `uploadResume()` - Upload with progress tracking
  - `downloadResume()` - File download
  - `deleteResume()` - Delete with confirmation
  - `extractResumeText()` - Extract structured data
  - `getResume()` - Fetch resume metadata
- `useResumesList()` - Hook for managing multiple resumes
  - `loadResumes()` - Paginated list
  - Pagination controls (`nextPage`, `prevPage`)
  - Bulk operations

### 5. Tests

#### `/src/__tests__/api/resume-upload.test.ts`
Comprehensive test suite covering:
- File validation tests (size, type, extension)
- File operations (hashing, path generation)
- Text extraction tests
- Data parsing and validation
- Database operations
- Error handling (auth, missing fields, DB errors)
- Security tests (sanitization, scope verification)
- Extraction method tests (pattern matching, Claude AI)

### 6. Documentation

#### `/src/app/api/directors-officers/[directorId]/RESUME_API_README.md`
Complete API documentation including:
- Database schema overview
- All 4 endpoint specifications with examples
- File storage structure
- Extracted data format documentation
- Error handling guide
- Security considerations
- Complete usage examples
- Rate limiting recommendations
- Future enhancement suggestions

## Database Schema

Uses the `director_resumes` table from `/migrations/023_board_member_files.sql`:

```sql
CREATE TABLE director_resumes (
  id UUID PRIMARY KEY,
  professional_id UUID NOT NULL,
  file_path TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INT,
  file_mime_type VARCHAR(100),
  file_hash VARCHAR(64),
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP,
  uploaded_by_user_id UUID,
  verified_at TIMESTAMP,
  verified_by_user_id UUID,
  verification_status VARCHAR(50),
  verification_notes TEXT,
  is_readable BOOLEAN,
  text_extract TEXT,
  page_count INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Features

### File Handling
- **Supported Formats**: PDF, DOCX, DOC
- **Size Limit**: 10MB
- **Storage**: `/public/resumes/[directorId]-[timestamp].[ext]`
- **Deduplication**: SHA256 file hash tracking

### Text Extraction
- **PDF**: Uses `pdf-parse` library
- **DOCX**: Uses `office-text-extractor` library
- **DOC**: Basic support (manual review recommended)

### Structured Data Extraction
- **Pattern Matching**: Keyword-based, fast extraction
- **Claude AI**: Advanced extraction using Claude 3.5 Sonnet (optional)
- **Confidence Scoring**: Quality validation (0-1 scale)

### Data Types Extracted
1. **Education**: School, degree, field of study, dates
2. **Experience**: Title, company, location, dates, description
3. **Certifications**: Name, issuer, dates, credential ID
4. **Board Positions**: Organization, position, dates

## API Usage Examples

### Upload Resume
```bash
curl -X POST http://localhost:3000/api/directors-officers/[directorId]/upload-resume \
  -F "file=@resume.pdf"
```

### Get Resume
```bash
curl http://localhost:3000/api/directors-officers/[directorId]/get-resume?resumeId=[id]
```

### Delete Resume
```bash
curl -X DELETE http://localhost:3000/api/directors-officers/[directorId]/delete-resume?resumeId=[id]
```

### Extract with Claude AI
```bash
curl -X POST http://localhost:3000/api/directors-officers/[directorId]/extract-resume-text \
  -H "Content-Type: application/json" \
  -d '{"resumeId": "[id]", "useAI": true}'
```

## Security Features

1. **Authentication**: NextAuth session required for all endpoints
2. **Authorization**: Users can only access directors in their company
3. **File Validation**: Size and type checking
4. **Path Sanitization**: Secure file path generation
5. **Database Constraints**: Foreign key relationships maintained
6. **Hash Verification**: File deduplication detection

## Dependencies

The implementation uses existing project dependencies:
- `pdf-parse` - PDF text extraction
- `office-text-extractor` - DOCX/DOC extraction
- `@anthropic-ai/sdk` - Claude API for advanced extraction (optional)
- `@neondatabase/serverless` - Database client
- `next-auth` - Authentication

## Configuration

### Environment Variables
- `DATABASE_URL` - Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key (for `useAI: true`)

### File Limits
- `MAX_RESUME_FILE_SIZE` = 10MB (adjustable in `resume-utils.ts`)
- `STORAGE_DIR` = `public/resumes/`

## Testing

Run the test suite:
```bash
npm run test src/__tests__/api/resume-upload.test.ts
```

Tests cover:
- File validation
- Text extraction
- Data parsing
- Database operations
- Error handling
- Security

## Integration Points

The Resume API integrates with:
1. **Directors/Officers Module**: `/dashboard/prospectus/[id]/directors-officers`
2. **Prospectus Builder**: Auto-populate from extracted data
3. **LinkedIn Verification**: Cross-reference with `director_linkedin_verification` table
4. **Compliance Engine**: Validate board qualification requirements

## Future Enhancements

1. **OCR Support**: Tesseract for scanned PDFs
2. **Template Detection**: Identify resume format to improve parsing
3. **LinkedIn Integration**: Sync data with LinkedIn profiles
4. **Bulk Operations**: Upload multiple resumes at once
5. **Prospectus Sync**: Auto-sync extracted data to prospectus sections
6. **Compliance Validation**: Check against exchange requirements
7. **Document Versioning**: Track resume changes over time
8. **Advanced Analytics**: Metrics on extraction accuracy and confidence

## File Summary

| File | Purpose | Lines |
|------|---------|-------|
| `/src/app/api/directors-officers/[directorId]/upload-resume/route.ts` | Upload endpoint | 180 |
| `/src/app/api/directors-officers/[directorId]/get-resume/route.ts` | Download endpoint | 85 |
| `/src/app/api/directors-officers/[directorId]/delete-resume/route.ts` | Delete endpoint | 90 |
| `/src/app/api/directors-officers/[directorId]/extract-resume-text/route.ts` | Extraction endpoint | 160 |
| `/src/lib/resume-utils.ts` | Core utilities | 300 |
| `/src/lib/types/resume.types.ts` | Type definitions | 280 |
| `/src/lib/hooks/useResumeUpload.ts` | React hooks | 380 |
| `/src/__tests__/api/resume-upload.test.ts` | Tests | 400 |
| `RESUME_API_README.md` | Documentation | 400 |
| **Total** | | **2,275** |

## Next Steps

1. **Frontend Integration**: Create UI components for resume upload
   - File upload form with drag-and-drop
   - Resume preview interface
   - Extracted data review form

2. **Database Migrations**: Verify `023_board_member_files.sql` is applied
   - Check indexes are created
   - Verify constraints

3. **Testing**:
   - Run unit tests
   - Manual testing with real files
   - Test error scenarios

4. **Deployment**:
   - Create `/public/resumes/` directory
   - Set file permissions correctly
   - Configure ANTHROPIC_API_KEY if using Claude AI

5. **Documentation**:
   - Update team wiki
   - Create user guide
   - Document troubleshooting

## Contact & Support

For questions about this implementation:
- Check `/src/app/api/directors-officers/[directorId]/RESUME_API_README.md`
- Review type definitions in `/src/lib/types/resume.types.ts`
- See test suite for usage examples
