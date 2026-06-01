# Prospectus Auto-Builder System Documentation

## Overview

The Prospectus Auto-Builder is IPOReady's core engine for generating IPO prospectus documents. It automatically extracts data from the PACE workflow, fills exchange-specific templates, and produces downloadable DOCX or PDF documents.

## System Architecture

### Components

1. **Frontend Modal** (`ProspectusGeneratorModal.tsx`)
   - User interface for initiating prospectus generation
   - Exchange selection (TSX, TSX Venture, CSE, NASDAQ, NYSE, OTC)
   - Format selection (DOCX or PDF)
   - Real-time generation progress
   - Download and preview functionality

2. **API Endpoint** (`/api/prospectus/generate`)
   - NextAuth authentication
   - Input validation
   - Calls core generation engine
   - Returns JSON with document metadata

3. **Generation Engine** (`prospectus-generator.ts`)
   - 8-step pipeline: fetch → validate → template → fill → generate → store → record → return
   - Supports DOCX and PDF output
   - Calculates data completeness
   - Handles errors gracefully

4. **Database Schema**
   - `prospectus_templates`: Template sections per exchange
   - `prospectus_documents`: Generated document tracking
   - `prospectus_field_mappings`: PACE field mappings
   - `prospectus_data_validations`: Data completeness tracking

5. **Templates** (5 sections)
   - Business Overview
   - Risk Factors
   - Financial Summary
   - Management, Directors and Officers
   - Use of Proceeds

## Generation Pipeline

### Step 1: Fetch Company Data
Retrieves data from PACE workflow tables:
- Company profile and description
- Team and executive information
- Financial metrics and history
- Risk assessments
- Funding goals and use of proceeds

### Step 2: Validate Data
- Checks for required fields (company_name, incorporation_date, etc.)
- Calculates data completeness percentage
- Identifies missing critical fields
- Stores validation results

### Step 3: Get Templates
Retrieves exchange-specific templates from database:
- Loads all 5 sections
- Validates section order
- Checks placeholder fields

### Step 4: Fill Templates
Replaces all placeholders with company data:
- Flattens nested company data
- Handles arrays and nested objects
- Preserves formatting
- Leaves unmapped placeholders as warnings

### Step 5: Generate Document
Creates DOCX or PDF:
- DOCX: Uses `docx` library for formatted Word documents
- PDF: Uses `pdfkit` for formatted PDF output
- Maintains consistent styling
- Calculates word count and page count

### Step 6: Store Document
Uploads generated document to storage:
- Saves file with unique identifier
- Records document metadata
- Creates download URL

### Step 7: Create Record
Inserts record into prospectus_documents table:
- Links to company and exchange
- Tracks generation timestamp
- Records data completeness
- Stores document URL and size

### Step 8: Return Result
Returns JSON response with:
- `documentId`: Unique identifier
- `documentUrl`: Download URL
- `documentSize`: File size in bytes
- `completeness`: Data completeness percentage (0-100)
- `metadata`: Word count, page count, sections
- `warnings`: Missing optional fields

## Usage

### Via UI Modal
1. Open Documents workspace
2. Click "Generate Prospectus" button
3. Select target exchange (TSX, NASDAQ, etc.)
4. Select format (DOCX or PDF)
5. Click "Generate"
6. Download or preview completed document

### Via API
```bash
POST /api/prospectus/generate
Content-Type: application/json
Authorization: Bearer [session-token]

{
  "exchange": "tsx",
  "format": "docx",
  "sections": ["business_overview", "risk_factors", "financial_summary", "management", "use_of_proceeds"]
}
```

Response:
```json
{
  "success": true,
  "documentId": "uuid",
  "documentUrl": "https://storage.example.com/...",
  "documentSize": 245000,
  "completeness": 85,
  "generationTimeMs": 3200,
  "metadata": {
    "wordCount": 12450,
    "pageCount": 50,
    "sectionsIncluded": ["business_overview", "risk_factors", "financial_summary", "management", "use_of_proceeds"]
  },
  "warnings": [
    "Missing revenue forecast for next 3 years",
    "Board committees not fully defined"
  ]
}
```

## Supported Exchanges

- **TSX**: Toronto Venture Exchange
- **TSX Venture**: Canadian venture exchange
- **CSE**: Canadian Securities Exchange
- **NASDAQ**: US technology-focused exchange
- **NYSE**: Major US exchange
- **OTC**: Over-the-counter markets

## Template Sections

### Business Overview
- Company history and background
- Products and services
- Market opportunity and size
- Competitive landscape
- Revenue model
- Growth strategy
- Key milestones

**Placeholders**: 19
**Approximate Word Count**: 2,000-2,500

### Risk Factors
- Market and competitive risks
- Technology and product risks
- Key personnel risks
- Customer concentration
- Liquidity and capital risks
- Regulatory compliance
- Intellectual property
- Market volatility

**Placeholders**: 13
**Approximate Word Count**: 2,500-3,000

### Financial Summary
- Historical financial data (3 years)
- MD&A analysis
- Key metrics and ratios
- Cash flow analysis
- Balance sheet analysis
- Working capital analysis

**Placeholders**: 60+
**Approximate Word Count**: 3,000-4,000

### Management, Directors and Officers
- Executive bios and experience
- Board composition
- Committee memberships
- Compensation structure
- Governance practices

**Placeholders**: 41
**Approximate Word Count**: 2,500-3,500

### Use of Proceeds
- Allocation of IPO proceeds
- Breakdown by category
- Timing of deployment
- Expected returns
- Strategic rationale

**Placeholders**: 37
**Approximate Word Count**: 1,500-2,000

## Data Completeness

The system calculates a completeness score (0-100%) based on:
- Required fields present
- Optional fields populated
- Data quality (not null/empty)

**Score Interpretation**:
- 100%: All required and optional fields populated
- 80-99%: Most fields populated, some optional fields missing
- 60-79%: Core fields populated, several optional fields missing
- <60%: Critical fields missing, requires additional input

## Performance Requirements

- **Single Generation**: < 5 seconds
- **Concurrent (10 users)**: Stable, < 10% error rate
- **Memory Usage**: Reasonable (< 500MB per request)
- **Concurrency Support**: At least 10 simultaneous generations

## Testing

### Unit Tests
Located in: `src/lib/__tests__/prospectus-generator.test.ts`

Tests include:
- Template placeholder replacement
- Data flattening
- Missing field detection
- Special character handling

### Integration Tests
Located in: `src/lib/__tests__/prospectus-integration.test.ts`

Tests include:
- End-to-end generation with sample data
- Data completeness validation
- All sections generation
- Exchange-specific requirements
- Performance estimation

### Load Tests
Located in: `tests/load-test-prospectus.js`

Run with k6:
```bash
k6 run tests/load-test-prospectus.js
```

Tests:
- Ramp up to 10 concurrent users
- Measures response time
- Validates < 5 second threshold
- Tracks error rate

## Error Handling

### Common Errors

**Missing Required Fields**
- User sees: "Generation failed: Missing company incorporation date"
- System logs: Field name and company ID
- User action: Populate field in PACE workflow, retry

**Invalid Exchange**
- Error: `{ error: "Invalid exchange", valid: ["tsx", "tsxv", ...] }`
- Status: 400 Bad Request

**Generation Timeout**
- System: Aborts after 30 seconds
- User sees: "Generation timeout - document too complex"
- Recommendation: Simplify data, reduce sections

**Storage Failure**
- System: Rolls back document record
- User sees: "Failed to save document"
- Retry: Automatic retry with exponential backoff

## Database Schema

### prospectus_templates
```sql
CREATE TABLE prospectus_templates (
  id UUID PRIMARY KEY,
  exchange VARCHAR(20) NOT NULL,         -- 'tsx', 'nasdaq', etc.
  section_name VARCHAR(255) NOT NULL,    -- 'business_overview', etc.
  section_order INT NOT NULL,            -- Display order
  template_text TEXT NOT NULL,           -- Markdown template with {placeholders}
  placeholder_fields JSONB NOT NULL,     -- ["field1", "field2", ...]
  description TEXT,
  required BOOLEAN DEFAULT TRUE,
  word_count_estimate INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exchange, section_name)
);
```

### prospectus_documents
```sql
CREATE TABLE prospectus_documents (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  exchange VARCHAR(20) NOT NULL,         -- 'tsx', 'nasdaq', etc.
  document_format VARCHAR(10) NOT NULL,  -- 'docx' or 'pdf'
  status VARCHAR(50) DEFAULT 'draft',    -- 'draft', 'generated', 'approved', 'filed'
  document_url VARCHAR(500),             -- Download URL
  document_size_bytes INT,               -- File size
  data_completeness_pct INT DEFAULT 0,   -- 0-100
  generated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  filed_at TIMESTAMPTZ,
  generation_error TEXT,                 -- Error message if failed
  metadata JSONB,                        -- {wordCount, pageCount, sectionsIncluded}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Configuration

### Environment Variables
```env
DATABASE_URL=postgresql://...
STORAGE_BUCKET=ipo-prospectus-docs
STORAGE_REGION=us-east-1
MAX_GENERATION_TIME=30000  # 30 seconds
```

### Constants
```typescript
const MAX_RETRIES = 3
const TIMEOUT_MS = 30000
const MAX_FILE_SIZE = 50 * 1024 * 1024  // 50MB
```

## Future Enhancements

1. **Template Versioning**: Track template changes over time
2. **Collaborative Editing**: Allow manual edits before filing
3. **Version Control**: Track all prospectus versions
4. **Approval Workflow**: Multi-step approval process
5. **Filing Integration**: Automatic SEDAR/SEC filing
6. **Format Support**: XBRL, HTML5 interactive versions
7. **Multi-language**: Support EN/FR generation
8. **Custom Sections**: Client-specific sections
9. **Historical Comparison**: Compare versions over time
10. **Analytics**: Track generation patterns and timing

## Support and Troubleshooting

### Common Issues

**Generation takes too long**
- Check data completeness (smaller = faster)
- Reduce number of sections
- Check database performance
- Monitor for concurrent generations

**Document quality issues**
- Verify placeholder replacement worked
- Check for missing data causing formatting issues
- Validate template sections

**Storage failures**
- Check storage bucket permissions
- Verify storage credentials
- Monitor disk space

## Appendix: Field Mappings

See `prospectus_field_mappings` table for complete mapping of PACE fields to prospectus placeholders. This enables automatic data extraction and injection into templates.

---

Last Updated: 2026-06-01
