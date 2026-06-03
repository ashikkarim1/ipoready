# Consent Letters Workflow

## Overview

The Consent Letters module is a comprehensive system for managing regulatory and expert consents required for IPO listing. It provides:

1. **List View** - Display all consent requests with filtering and search
2. **Detail Modal** - View, edit, and delete individual consent records
3. **Request Generation Form** - Create templated consent request letters
4. **Status Tracking** - Monitor consent status (pending, received, rejected, expired)
5. **Compliance Dashboard** - Exchange-specific compliance tracking

## Architecture

### Directory Structure

```
src/app/dashboard/compliance/consent-letters/
├── page.tsx                           # Main page component
├── layout.tsx                         # Layout metadata
├── components/
│   ├── ConsentListView.tsx           # Table display of all consents
│   ├── ConsentDetailModal.tsx        # Edit/view individual consent
│   ├── ConsentRequestForm.tsx        # Multi-step consent request form
│   └── ComplianceStatusBadge.tsx     # Status indicator component
├── README.md                         # This file

src/app/api/compliance/consents/
├── route.ts                          # CRUD API endpoints

src/lib/
├── consent-templates.ts              # Consent templates & exchange config
├── consent-utils.ts                  # Utility functions
```

## Features

### 1. List View (`ConsentListView.tsx`)

Displays all consents in a sortable, filterable table with columns:
- **From Entity** - Name of the auditor, lawyer, or expert
- **Type** - Entity type (auditor, lawyer, valuation-expert, etc.)
- **Consent Type** - Specific consent request
- **Status** - Current status (pending, received, rejected, expired, withdrawn)
- **Expiry Date** - When the consent expires (with warnings)
- **Document** - Link to download/view the consent
- **Created** - When the request was created

**Features:**
- Click row to open detail modal
- Sort by any column
- Filter by status and entity type
- Color-coded status badges
- Icons for quick status recognition

### 2. Detail Modal (`ConsentDetailModal.tsx`)

Comprehensive view and edit dialog for individual consents:
- View all consent details
- Edit status, expiry date, document URL
- Delete consent (with confirmation)
- Expiry date warnings
- Document download links

**Status Transitions:**
```
pending → received
       ↘ rejected
       ↘ expired
       ↘ withdrawn
```

### 3. Request Form (`ConsentRequestForm.tsx`)

Three-step process to create consent request letters:

**Step 1: Select Template**
- Browse available consent types for selected exchange
- View template description and key terms
- See which exchanges require each consent

**Step 2: Generate Letter**
- Enter company name and entity name
- Set optional expiry date
- System generates templated letter with context-specific content

**Step 3: Preview & Download**
- Preview generated letter
- Choose format (email draft or PDF)
- Download or copy to clipboard
- Submit to create consent record

### 4. Compliance Dashboard

Main page header shows:
- **Compliance Status** - Percentage of required consents received
- **Pending Count** - Consents awaiting response
- **Received Count** - Completed consents
- **Rejected Count** - Consents needing follow-up

Exchange selector allows switching between:
- NYSE, NASDAQ, TSX, TSXV, CSE

Required consents for selected exchange displayed with visual status.

## Exchange-Specific Requirements

### NYSE
Required consents:
- Auditor Audit Consent
- Auditor Internal Controls Attestation
- Legal Counsel Opinion
- Underwriter's Legal Opinion

### NASDAQ
Same as NYSE

### TSX
Required consents:
- Auditor Audit Consent
- Legal Counsel Opinion
- Underwriter's Legal Opinion
- Valuation Expert Appraisal

### TSXV
Required consents:
- Auditor Audit Consent
- Legal Counsel Opinion

### CSE
Required consents:
- Auditor Audit Consent
- Legal Counsel Opinion

## API Endpoints

### GET `/api/compliance/consents`

Fetch consents for a company.

**Query Parameters:**
```
company_id (required) - UUID of company
entity_type (optional) - Filter by entity type
status (optional) - Filter by status
```

**Response:**
```json
[
  {
    "id": "uuid",
    "company_id": "uuid",
    "from_entity": "XYZ Auditors LLP",
    "entity_type": "auditor",
    "consent_type": "auditor-audit-consent",
    "status": "received",
    "document_url": "https://...",
    "expiry_date": "2026-12-31",
    "created_at": "2026-06-03T00:00:00Z",
    "updated_at": "2026-06-03T00:00:00Z"
  }
]
```

### POST `/api/compliance/consents`

Create or update a consent record.

**Request Body:**
```json
{
  "company_id": "uuid",
  "from_entity": "XYZ Auditors LLP",
  "entity_type": "auditor",
  "consent_type": "auditor-audit-consent",
  "status": "pending",
  "document_url": "https://...",
  "expiry_date": "2026-12-31",
  "id": "uuid" // Optional - if present, updates existing record
}
```

**Response:**
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "from_entity": "XYZ Auditors LLP",
  "entity_type": "auditor",
  "consent_type": "auditor-audit-consent",
  "status": "pending",
  "document_url": "https://...",
  "expiry_date": "2026-12-31",
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z"
}
```

### DELETE `/api/compliance/consents`

Delete a consent record.

**Query Parameters:**
```
id (required) - Consent ID
company_id (required) - Company ID
```

**Response:**
```json
{
  "success": true
}
```

## Data Models

### ConsentLetter Table

```sql
CREATE TABLE consent_letters (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  from_entity VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  consent_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  document_url VARCHAR(2048),
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
)
```

## Usage Examples

### 1. Creating a New Consent Request

```typescript
// Click "+ Request Consent" button
// → ConsentRequestForm modal opens
// → Select "Auditor Consent to Use Audit Report" template
// → Enter "XYZ Auditors LLP" as entity name
// → Generate letter with company context
// → Preview and download
// → Submit to create record
```

### 2. Tracking Consent Status

```typescript
// Main list view shows all consents
// Filter by Status = "Pending"
// Click a pending consent to open detail modal
// Update status to "Received" and add document URL
// Set expiry date to 2027-06-03
// Save changes
```

### 3. Checking Exchange Compliance

```typescript
// Select "TSX" from exchange selector
// View compliance percentage (e.g., 75%)
// See "Required Consents for TSX" section
// Each required consent shows status (✓ or !)
// Missing consents highlighted
```

## Utility Functions

### `calculateComplianceReport(exchange, consents)`

Generate comprehensive compliance status for an exchange.

**Returns:**
```typescript
{
  exchange: 'TSX',
  totalRequired: 3,
  totalReceived: 2,
  compliancePercentage: 67,
  status: 'at-risk',
  missingConsents: ['Valuation Expert Appraisal'],
  expiringConsents: [...],
  rejectedConsents: [...]
}
```

### `getExpiringConsents(consents, withinDays)`

Find consents expiring within specified days.

### `getExpiredConsents(consents)`

Find already-expired consents.

### `generateComplianceChecklist(exchange, consents)`

Generate checklist of required consents with completion status.

## Styling & UI

- **Color scheme:** Blue primary with status-specific colors
- **Icons:** ✓ (received), ⏳ (pending), ✗ (rejected), ⚠ (expired)
- **Animations:** Framer Motion for smooth transitions
- **Responsive:** Works on mobile, tablet, and desktop
- **Dark mode ready:** Uses Tailwind color utilities

## Template System

Each template includes:
- **Title** - Human-readable name
- **Description** - What the consent covers
- **Entity Type** - Who provides it (auditor, lawyer, etc.)
- **Exchanges** - Which exchanges require it
- **Key Terms** - Important terms included in the letter
- **Template Text** - Boilerplate letter with placeholders

**Placeholders:**
```
[COMPANY NAME] - Replaced with company name
[DATE] - Current date
[EXCHANGE] - Selected exchange
[JURISDICTION] - Company jurisdiction
[FORM TYPE] - S-1, F-1, etc.
```

## Future Enhancements

1. **Document Management**
   - Upload and store actual consent documents
   - Version control and audit trail
   - Signature capture integration

2. **Notifications**
   - Email reminders for pending consents
   - Alerts for expiring consents
   - Status change notifications

3. **Reporting**
   - PDF compliance reports by exchange
   - Historical tracking
   - Comparison reports

4. **Integration**
   - Email integration for sending requests
   - Calendar integration for deadlines
   - Workflow automation

5. **Collaboration**
   - Assign consents to team members
   - Comments and notes
   - Approval workflows

## Testing

To test the consent letter workflow:

1. Navigate to `/dashboard/compliance/consent-letters`
2. Click "+ Request Consent"
3. Select a template (e.g., "Auditor Consent to Use Audit Report")
4. Enter entity name and other details
5. Generate letter and review preview
6. Submit to create consent record
7. View in list and click to open detail modal
8. Edit status, expiry date, and document URL
9. Save changes or delete record

## Troubleshooting

**Templates not showing:**
- Verify selected exchange has available templates
- Check `EXCHANGE_CONSENT_REQUIREMENTS` in `consent-templates.ts`

**Consent not saving:**
- Ensure all required fields are filled (from_entity, entity_type, consent_type)
- Check database connection and company_id is valid
- Verify API endpoint is accessible

**Compliance percentage incorrect:**
- Ensure consents have status "received" to count as completed
- Check that consent_type matches template IDs exactly
- Review `calculateComplianceReport` logic

## References

- Exchange listing rules documentation
- IPOReady Database Schema (`src/db/schema_ipo_management.sql`)
- Auth system (`src/lib/auth.ts`)
- Database utilities (`src/lib/db.ts`)
