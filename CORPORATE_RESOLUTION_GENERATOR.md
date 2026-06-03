# Corporate Resolution Generator - BUILD 2C.1

## Overview

The Corporate Resolution Generator is a comprehensive system for creating, managing, and downloading professional board resolutions for IPO compliance. It supports 4 resolution types with professional legal templates, exchange-specific requirements, and multi-format output (DOCX and PDF).

## Features

### Supported Resolution Types

1. **Prospectus Approval** - Board approval of prospectus document before filing with securities regulators
2. **Listing Approval** - Board authorization to list company securities on a public exchange
3. **Underwriting Authorization** - Board authorization for underwriters to manage the public offering
4. **Material Contracts** - Board approval of material contracts required before listing

### Key Capabilities

- Generate professional, legally-formatted board resolutions
- Store HTML version for editing in database
- Download as editable Word documents (.docx) or PDFs
- Track board member approval status
- Exchange-specific requirement configuration
- Draft, Approved, Executed, and Archived status management
- Board member signature tracking (prepared for future signature capture)

## Architecture

### Database Schema

#### Tables Created

1. **board_resolutions**
   - Core resolution record
   - Stores HTML content for editing
   - Tracks status, approval count, file sizes
   - Links to companies and users

2. **resolution_approvals**
   - Tracks each board member's approval status
   - Stores signature data (prepared for digital signatures)
   - Records approval timestamp and IP address

3. **resolution_templates**
   - Professional templates for each resolution type
   - Exchange-agnostic universal templates (can add exchange-specific variants)
   - Includes boilerplate legal language
   - Template variables for dynamic content

4. **exchange_resolution_requirements**
   - Specifies which resolutions are REQUIRED for each exchange
   - Includes timing requirements and notes
   - Pre-populated for TSX, NASDAQ, NYSE, CSE, TSXV

### File Structure

```
src/
├── db/
│   └── schema-resolutions.sql          # Database schema (run manually)
│
├── lib/
│   └── resolution-generator.ts         # Core generation logic
│
├── app/
│   ├── api/
│   │   └── compliance/
│   │       └── resolutions/
│   │           ├── route.ts            # GET (list) / POST (create)
│   │           ├── requirements/
│   │           │   └── route.ts        # GET exchange requirements
│   │           └── [id]/
│   │               ├── route.ts        # GET / PUT / DELETE single resolution
│   │               └── download/
│   │                   └── route.ts    # GET download as DOCX/PDF
│   │
│   └── dashboard/
│       └── compliance/
│           └── resolutions/
│               ├── page.tsx            # List view
│               ├── new/
│               │   └── page.tsx        # Create form
│               └── [id]/
│                   └── page.tsx        # Detail/view page
```

## API Endpoints

### List Resolutions
```
GET /api/compliance/resolutions
Query Parameters:
  - status: draft|approved|executed|archived
  - type: prospectus_approval|listing_approval|underwriting_authorization|material_contracts

Response:
{
  success: boolean,
  resolutions: Resolution[],
  count: number
}
```

### Create Resolution
```
POST /api/compliance/resolutions
Body:
{
  resolutionType: ResolutionType,
  companyName: string,
  approvalDate: string (YYYY-MM-DD),
  boardMembers: string[],
  exchange?: string,
  prospectusDetails?: { prospectusTitle?: string },
  listingDetails?: { targetExchange?: string },
  underwritingDetails?: { underwriterName?, offeringSize?, underwritingCommission? },
  contractDetails?: { contractDescription?, counterpartyName?, contractValue? }
}

Response:
{
  success: boolean,
  resolutionId: string,
  documentTitle: string,
  htmlContent: string
}
```

### Get Resolution
```
GET /api/compliance/resolutions/[id]

Response:
{
  success: boolean,
  resolution: Resolution,
  approvals: Approval[]
}
```

### Update Resolution
```
PUT /api/compliance/resolutions/[id]
Body:
{
  status?: string,
  htmlContent?: string,
  approvalCount?: number
}

Response:
{
  success: boolean,
  resolution: Resolution
}
```

### Download Resolution
```
GET /api/compliance/resolutions/[id]/download?format=docx|pdf

Returns: Binary file (application/vnd.openxmlformats-officedocument.wordprocessingml.document or application/pdf)
```

### Get Exchange Requirements
```
GET /api/compliance/resolutions/requirements?exchange=tsx|nasdaq|nyse|etc

Response:
{
  success: boolean,
  exchange: string,
  required: Array<{ type, requiredByDate, notes }>,
  optional: Array<{ type, requiredByDate, notes }>,
  total: number
}
```

## Implementation Details

### Resolution Generation

1. **Input Validation**
   - Company name, approval date, and board members are required
   - Resolution type must be one of the 4 supported types
   - Board members must be non-empty strings

2. **Text Generation**
   - Each resolution type has a template function
   - Templates include WHEREAS clauses, NOW BE IT RESOLVED sections
   - Dynamic content injection for company name, dates, board members
   - Professional legal boilerplate language

3. **HTML Storage**
   - Rich HTML version stored in database for future editing
   - Can be rendered in the UI with proper styling
   - Supports h2/h3 headings, paragraphs, numbered lists

4. **Document Generation**
   - **DOCX**: Uses `docx` library for professional formatting
     - Headings styled as H2/H3
     - Proper spacing and indentation
     - Output as standard Word document
   
   - **PDF**: Uses `pdfkit` library
     - Letter size with 72pt margins
     - Professional fonts (Helvetica)
     - Proper line spacing and hierarchy

### Board Member Tracking

- Each board member gets an approval record
- Initial status is "pending"
- System tracks approval timestamp, IP address, signature data
- Prepared for signature capture integration (digital or wet ink)

### Exchange Requirements

Pre-configured requirements for major exchanges:

**TSX**: All 4 types required (prospectus, listing, underwriting, optional contracts)

**NASDAQ**: All 4 types required (same as TSX)

**NYSE**: All 4 types required (same as TSX)

**CSE**: Prospectus, listing required; underwriting optional

**TSXV**: Listing required; prospectus optional (for reverse mergers); underwriting not required

## UI Components

### Resolution List Page (`/dashboard/compliance/resolutions`)
- Displays all resolutions with status badges
- Quick actions: View, Download, Delete
- Filters by status and type
- Shows approval progress per resolution

### Create Resolution Form (`/dashboard/compliance/resolutions/new`)
- Step-by-step form wizard
- Dynamic fields based on resolution type
- Board member management (add/remove)
- Form validation with helpful error messages

### Resolution Detail Page (`/dashboard/compliance/resolutions/[id]`)
- Three tabs: Document, Approvals, Details
- View full resolution text with HTML formatting
- Download in DOCX or PDF format
- Track board member approval status
- Change status (draft → approved → executed → archived)
- Delete option in danger zone

## Usage Example

### Creating a Prospectus Approval Resolution

```javascript
// Form submission
const payload = {
  resolutionType: 'prospectus_approval',
  companyName: 'TechCorp Inc.',
  approvalDate: '2026-06-03',
  boardMembers: ['John Smith', 'Jane Doe', 'Bob Wilson'],
  prospectusDetails: {
    prospectusTitle: 'IPO Prospectus - TechCorp Inc.'
  }
}

// API call
const response = await fetch('/api/compliance/resolutions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})

const { resolutionId, documentTitle, htmlContent } = await response.json()

// User can then download
window.location.href = `/api/compliance/resolutions/${resolutionId}/download?format=docx`
```

## Database Setup

Run the schema file to create all tables:

```sql
-- This creates 4 tables and pre-populates exchange requirements
\i src/db/schema-resolutions.sql
```

The schema automatically:
1. Creates all necessary tables with proper indexes
2. Populates exchange_resolution_requirements for TSX, NASDAQ, NYSE, CSE, TSXV
3. Inserts sample templates (can be expanded)

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Digital Signatures**
   - Integrate with electronic signature provider
   - Capture board member signatures during approval process
   - Track signature timestamps and metadata

2. **Exchange-Specific Templates**
   - Create customized templates for specific exchanges
   - Include exchange-specific language and requirements
   - Auto-select template based on company's target exchange

3. **Template Management**
   - Admin interface to create/edit templates
   - Version control for templates
   - A/B testing for language variations

4. **Approval Workflow**
   - Email notifications to board members
   - Signature request portal
   - Approval reminders
   - Audit trail of all changes

5. **Integration**
   - Connect to company cap table data
   - Automatic field population from cap table
   - Link to other compliance documents

6. **Reporting**
   - Resolution completion dashboard
   - Compliance status reports
   - Exchange requirement checklist
   - Board approval analytics

## Testing

### Manual Testing Checklist

- [ ] Create all 4 resolution types
- [ ] Download as DOCX format
- [ ] Download as PDF format
- [ ] Update resolution status
- [ ] Add/remove board members
- [ ] Delete resolution
- [ ] Verify HTML content displays correctly
- [ ] Test with different exchanges
- [ ] Verify exchange requirements endpoint

### Integration Points

- NextAuth session validation on all endpoints
- Database transaction integrity (all-or-nothing)
- File size tracking for generated documents
- Audit logging through existing compliance schema

## Security Considerations

1. **Authentication**: All endpoints require NextAuth session
2. **Authorization**: Users can only access their company's resolutions
3. **Input Validation**: All form inputs validated before DB insert
4. **File Handling**: Generated files not stored permanently on disk
5. **Audit Trail**: Creation/update tracked in database with timestamps
6. **SQL Injection**: All queries use parameterized statements via sql.js

## Performance Optimization

1. **Indexes**: Created on company_id, status, type, created_at for fast queries
2. **File Generation**: On-demand generation (not cached) keeps storage clean
3. **HTML Storage**: Compact HTML stored to minimize DB size
4. **Lazy Loading**: Board members and approvals fetched separately

## Compliance & Legal

- Templates include professional boilerplate legal language
- Exchange-specific requirements pre-configured
- Supports GDPR compliance (user_id tracking, data deletion ready)
- Audit logging for regulatory compliance
- Document versioning for change tracking

## Support & Documentation

- Inline code comments explain complex logic
- Resolution type descriptions in UI
- Legal terms explained in help sections
- API documentation in code headers
