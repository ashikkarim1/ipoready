# Consent Letters Workflow - IPOReady 2B.2

## Overview

The Consent Workflow module manages regulatory and expert consents required for IPO listing. It includes:
- **List view** with filtering and status tracking
- **Form** to create consent requests
- **Template generation** for different entity types (auditors, lawyers, experts)
- **Status tracking** (pending, received, rejected, expired)
- **Compliance dashboard** showing consent completion percentage
- **Full API** for CRUD operations and letter generation

---

## Features

### 1. Consent Letters Dashboard
**Location:** `/dashboard/compliance/consent-letters`

#### List View Columns
- **From Entity** - Name of the auditor, lawyer, or expert
- **Entity Type** - Icon + label (Auditor, Legal Counsel, Valuation Expert, etc.)
- **Consent Type** - Type of consent being requested
- **Status** - Current status with color-coded badge
- **Expiry Date** - When the consent expires with "expiring soon" warnings

#### Filtering & Search
- Filter by status (pending, received, rejected, expired, withdrawn)
- Filter by entity type
- Select exchange (TSX, NASDAQ, NYSE, TSXV, CSE)
- Real-time compliance percentage display

#### Compliance Dashboard
Shows at the top:
- **Compliance %** - (received / required) × 100
- **Pending Count** - Number of pending consents
- **Expiring Soon** - Count expiring within 30 days
- **Total** - Total number of consents

### 2. Create New Consent Request
Click **"+ New Consent"** button to:
- Enter entity name (e.g., "KPMG LLP")
- Select entity type (auditor, lawyer, valuation-expert, environmental-expert, other-expert)
- Auto-fill consent type based on entity type
- Set expiry date (optional)
- **Generate Letter Template** - Downloads HTML letter template

### 3. Generate Consent Request Letters
**Endpoint:** `POST /api/compliance/consents/generate`

Available templates for:
- **Auditor** - Audit consent to include financial statements
- **Lawyer** - Legal opinion on IPO matters
- **Valuation Expert** - Fairness opinion or valuation report
- **Environmental Expert** - Environmental assessment consent
- **Other Expert** - Generic expert report consent

Each template includes:
- Professional greeting and introduction
- Exchange-specific requirements
- Required confirmations and consents
- Timeline for response
- Closing and signature blocks
- HTML formatted for email or printing as PDF

### 4. Status Tracking
Six consent statuses:
- **Pending** - Awaiting response (yellow)
- **Received** - Consent confirmed (green)
- **Rejected** - Consent denied (red)
- **Expired** - Expiry date passed (gray)
- **Withdrawn** - Consent withdrawn (gray)

Quick status change from dropdown in list view.

### 5. Consent Details Modal
Click any consent to view:
- Full entity and consent details
- Activity timeline (created, last updated)
- Document URL (if uploaded)
- Quick actions to mark as received or withdraw
- Expiry status and action prompts

---

## API Endpoints

### Base: `/api/compliance/consents`

#### `GET /api/compliance/consents`
Fetch all consents for a company

**Query Parameters:**
- `company_id` (required) - Company UUID

**Response:**
```json
{
  "consents": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "from_entity": "KPMG LLP",
      "entity_type": "auditor",
      "consent_type": "independent_audit",
      "status": "pending",
      "document_url": null,
      "expiry_date": "2026-09-01",
      "created_at": "2026-06-03T12:00:00Z",
      "updated_at": "2026-06-03T12:00:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2026-06-03T12:30:00Z"
}
```

#### `POST /api/compliance/consents`
Create a new consent request

**Request Body:**
```json
{
  "company_id": "uuid",
  "from_entity": "KPMG LLP",
  "entity_type": "auditor",
  "consent_type": "independent_audit",
  "expiry_date": "2026-09-01"
}
```

**Response:** `201 Created`
```json
{
  "consent": { /* consent object */ },
  "message": "Consent request created"
}
```

#### `PATCH /api/compliance/consents/:id`
Update consent status or details

**Request Body:**
```json
{
  "status": "received",
  "document_url": "https://...",
  "expiry_date": "2026-09-01"
}
```

**Response:** `200 OK`
```json
{
  "consent": { /* updated consent object */ },
  "message": "Consent updated successfully"
}
```

#### `DELETE /api/compliance/consents/:id`
Withdraw a consent (soft delete)

**Response:** `200 OK`
```json
{
  "message": "Consent withdrawn successfully"
}
```

#### `POST /api/compliance/consents/generate`
Generate a consent request letter template

**Request Body:**
```json
{
  "company_id": "uuid",
  "entity_type": "auditor",
  "from_entity": "KPMG LLP",
  "exchange": "tsx",
  "format": "html"
}
```

**Response:**
```json
{
  "template": {
    "subject": "Consent to Include Audited Financial Statements...",
    "greeting": "Dear Audit Partner:",
    "introduction": "We are writing to request...",
    "requirements": [...],
    "timeline": "...",
    "closing": "...",
    "signature_line": "Yours truly,",
    "html": "<html>...</html>"
  },
  "company": { /* company data */ },
  "exchange": "tsx",
  "entity_type": "auditor",
  "from_entity": "KPMG LLP",
  "generated_at": "2026-06-03T12:30:00Z"
}
```

---

## Database Schema

### `consent_letters` Table
```sql
CREATE TABLE consent_letters (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL (FK companies),
  from_entity VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  consent_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  document_url VARCHAR(2048),
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_consent_letters_company_id ON consent_letters(company_id);
CREATE INDEX idx_consent_letters_entity_type ON consent_letters(entity_type);
CREATE INDEX idx_consent_letters_status ON consent_letters(status);
CREATE INDEX idx_consent_letters_expiry_date ON consent_letters(expiry_date);
```

---

## Library Functions

### `src/lib/consent-utils.ts`

#### Compliance Calculation
```typescript
calculateConsentCompliance(consents: ConsentRecord[], exchange: ExchangeCode): ConsentSummary
// Returns: { total, received, pending, rejected, expired, expiring_soon, compliance_percentage }
```

#### Status Management
```typescript
getStatusBadge(status: ConsentStatus): { label, color, bg_color, icon }
getEntityTypeLabel(type: EntityType): string
getEntityIcon(type: EntityType): string
```

#### Date Utilities
```typescript
formatExpiryDate(date: Date | null): string
isExpiringSoon(date: Date | null, dayThreshold: number = 30): boolean
isExpired(date: Date | null): boolean
```

#### Exchange-Specific Consents
```typescript
getRequiredConsentsForExchange(exchange: ExchangeCode): ConsentType[]
```

---

## Exchange Requirements

Each exchange has specific required consents:

### TSX
- Board approval
- Shareholder approval
- Independent audit
- Audit committee approval
- Legal counsel opinion

### NASDAQ
- All TSX requirements +
- Disclosure committee
- Underwriter comfort letter

### NYSE
- Same as NASDAQ

### TSXV
- Board approval
- Shareholder approval
- Independent audit
- Legal counsel opinion

### CSE
- Board approval
- Independent audit
- Legal counsel opinion

---

## Components

### `ConsentDetailsModal`
Detailed view for individual consents with:
- Full details display
- Status change capability
- Activity timeline
- Quick actions (Mark as Received, Withdraw)
- Expiry warnings

### Dashboard Page
Main list view with:
- Real-time compliance dashboard
- Create consent form
- Filterable table
- Status badges
- Quick status updates

---

## Workflow Example

### Scenario: TSX IPO with KPMG as Auditor

1. **Create Consent Request**
   - Navigate to `/dashboard/compliance/consent-letters`
   - Click "+ New Consent"
   - Enter: from_entity="KPMG LLP", entity_type="auditor"
   - Set expiry_date="2026-09-01"

2. **Generate Letter Template**
   - Click "Generate Letter Template"
   - Download HTML file
   - Customize if needed and email to KPMG

3. **Track Status**
   - Consent shows as "Pending" in yellow
   - If expiry within 30 days, shows "Expiring Soon" warning
   - Click consent to view details and follow-up reminders

4. **Update Status**
   - When KPMG responds, change status to "Received"
   - Upload PDF copy to document_url field
   - Compliance % increases automatically

5. **Monitor Compliance**
   - Dashboard shows real-time % of required consents received
   - Color-coded warnings for expired/expiring consents
   - Filter view to focus on pending items

---

## Testing

Tests located in `src/lib/__tests__/consent-utils.test.ts`

Run tests:
```bash
npm test -- consent-utils.test.ts
```

Test coverage:
- Compliance calculation for all exchanges
- Status badge formatting
- Entity type labels
- Date formatting and expiry logic
- Filtering and sorting

---

## Security & Authorization

- All endpoints require user authentication (NextAuth)
- Users can only access consents for their own companies
- Company ownership verified via `companies.created_by` field
- Audit logs track all consent operations
- Soft deletes preserve audit trail

---

## Future Enhancements

Phase 3 (Post-MVP):
- Email notifications for expiring consents
- Auto-sync with exchange filing deadlines
- Template customization per exchange
- Bulk consent status updates
- Export consents list as CSV/PDF
- Reminders and follow-up tracking
- Integration with document management system
