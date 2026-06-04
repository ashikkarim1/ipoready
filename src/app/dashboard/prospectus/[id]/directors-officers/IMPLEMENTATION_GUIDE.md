# Directors & Officers Management Page - Implementation Guide

## Overview

The Directors & Officers management page is a world-class governance dashboard for IPOReady that enables users to manage board members, executive officers, and significant shareholders with full regulatory compliance tracking.

### Location
- **Route**: `/dashboard/prospectus/[id]/directors-officers`
- **Main file**: `page.tsx`
- **Components**: `components/` directory
- **API routes**: `/app/api/prospectus/[id]/{directors,officers,shareholders}/`

## Architecture

### Frontend Components

#### 1. **BoardCompositionOverview** (`BoardCompositionOverview.tsx`)
Displays the board composition summary with key statistics and exchange requirements.

**Features:**
- Total directors count with independence breakdown
- Committee membership counts (Audit, Compensation, Governance)
- Financial expert count for audit committee
- Exchange-specific requirement checklist
- Add Director/Officer button

**Key Props:**
```typescript
interface BoardCompositionOverviewProps {
  directors: Director[];
  officers: Officer[];
  onAddDirector: () => void;
  selectedExchange?: string;
}
```

#### 2. **DirectorsTable** (`DirectorsTable.tsx`)
Comprehensive table of all directors with detailed governance information.

**Columns:**
- Name & Email
- Role (with role labels)
- Independence Status (Independent/Management/Linked)
- Committee Assignments
- Residency (Country, Province, City)
- PIF Status (✓ Submitted, ⚠ In Progress, ✗ Required)
- Documents (count of attached files)
- Actions (Edit, Send PIF, View Profile, Delete)

**Status Indicators:**
- Independence: Green checkmark (Independent), Yellow warning (Linked), Gray (Management)
- PIF Status: Color-coded badges with icons

#### 3. **OfficersTable** (`OfficersTable.tsx`)
Table for executive officers with insider trading and holdings tracking.

**Columns:**
- Name & Email
- Title (CEO, CFO, COO, etc.)
- Department
- SEDI Registration Status
- Total Holdings (Common Shares + Options + Warrants)
- Actions (Edit, Register SEDI, Update Holdings, Delete)

**Key Features:**
- Holdings display with quick edit access
- SEDI (System for Electronic Disclosure by Insiders) status tracking
- Insider trading reporting flag
- Reportable insider identification

#### 4. **SignificantShareholdersTable** (`SignificantShareholdersTable.tsx`)
Table for 10%+ shareholders with PIF requirement tracking.

**Columns:**
- Name & Email
- Ownership Percentage
- Share Count
- PIF Status
- Documents (Shareholder Agreement, PIF, Cap Table Entry)
- Actions (Edit, Send PIF Invite, Delete)

#### 5. **RegulatoryChecklist** (`RegulatoryChecklist.tsx`)
Sticky sidebar component showing exchange-specific compliance requirements.

**Features:**
- Progress bar showing completion percentage
- Items grouped by category:
  - Board Composition
  - Committees
  - Independence
  - Expertise
  - Documentation
- Each item shows:
  - Requirement name and description
  - Status (✓ Met, ⏱ Pending)
  - Days remaining (if applicable)
  - Critical/Non-critical indicator

**Exchange Requirements Supported:**
- TSXV (TSX Venture)
- TSX (Toronto Stock Exchange)
- NASDAQ
- NYSE (New York Stock Exchange)

#### 6. **AddPersonModal** (`AddPersonModal.tsx`)
Modal form for adding directors, officers, or shareholders.

**Sections:**
1. **Basic Information**
   - Full Name, Email, Phone, Role

2. **Director-Specific** (mode='director')
   - Independence Status (Independent/Management/Linked)
   - Committee Assignments (checkboxes)
   - Biography
   - Photo Upload

3. **Officer-Specific** (mode='officer')
   - Department

4. **Shareholder-Specific** (mode='shareholder')
   - Ownership Percentage
   - Share Count

5. **Residency** (all modes)
   - Country
   - Province/State
   - City

### Data Models

#### Director
```typescript
interface Director {
  id: string;
  prospectusId: string;
  name: string;
  role: DirectorRole;
  email: string;
  phone?: string;
  independence: IndependenceStatus;
  committees: Committee[];
  residency: Residency;
  bio?: string;
  photoUrl?: string;
  pifStatus: PIFStatus;
  pifSubmittedDate?: Date;
  documents: DirectorDocument[];
  yearsExperience?: number;
  expertise?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Officer
```typescript
interface Officer {
  id: string;
  prospectusId: string;
  name: string;
  title: OfficerRole;
  email: string;
  phone?: string;
  department?: string;
  sediStatus: SEDIStatus;
  sediRegistrationDate?: Date;
  pifStatus: PIFStatus;
  pifSubmittedDate?: Date;
  holdings: ShareHolding;
  documents: OfficerDocument[];
  reportableInsider: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### SignificantShareholder
```typescript
interface SignificantShareholder {
  id: string;
  prospectusId: string;
  name: string;
  ownershipPercentage: number;
  shareCount: number;
  email?: string;
  pifRequired: boolean;
  pifStatus: PIFStatus;
  pifSubmittedDate?: Date;
  documents: ShareholderDocument[];
  shareholderAgreementUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Routes

#### GET /api/prospectus/[id]/directors
Fetches all directors for a prospectus.

**Response:**
```json
{
  "success": true,
  "directors": [
    {
      "id": "dir-1",
      "name": "Sarah Johnson",
      "role": "lead-director",
      "email": "sarah@example.com",
      "independence": "independent",
      "committees": ["audit", "governance"],
      ...
    }
  ]
}
```

#### POST /api/prospectus/[id]/directors
Creates a new director.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "role": "independent-director",
  "independence": "independent",
  "committees": ["audit"],
  "residency": {
    "country": "Canada",
    "province": "ON",
    "city": "Toronto"
  },
  "bio": "..."
}
```

#### PUT /api/prospectus/[id]/directors/[directorId]
Updates an existing director.

#### DELETE /api/prospectus/[id]/directors/[directorId]
Deletes a director.

#### GET /api/prospectus/[id]/officers
Fetches all officers for a prospectus.

#### POST /api/prospectus/[id]/officers
Creates a new officer.

#### GET /api/prospectus/[id]/shareholders
Fetches all 10%+ shareholders.

#### POST /api/prospectus/[id]/shareholders
Creates a new shareholder.

#### GET /api/prospectus/[id]/regulatory-checklist
Fetches regulatory checklist items for the selected exchange.

**Query Parameters:**
- `exchange`: Exchange code (tsxv, tsx, nasdaq, nyse)

## Features Not Yet Implemented

### Phase 2 Enhancements

1. **PIF Workflow Integration**
   - "Send PIF Invite" button → auto-email with TSXV Form 2A link
   - Track PIF submission status in real-time
   - "Download PIF Template" for different exchanges
   - Document upload area for completed PIFs
   - PIF validation and verification

2. **Document Management**
   - Upload board resolutions
   - Upload independence declarations
   - Upload SEDI registrations
   - Upload shareholder agreements
   - Document versioning and tracking

3. **SEDI Integration**
   - SEDI registration form auto-population
   - 5-day insider trading reporting notifications
   - SEDI profile linking
   - Automatic SEDI data sync

4. **Edit Functionality**
   - Edit modal for directors/officers/shareholders
   - Inline editing for certain fields
   - Change history tracking
   - Audit trail

5. **Advanced Filtering & Search**
   - Search by name, email, role
   - Filter by independence status
   - Filter by committee membership
   - Filter by PIF status
   - Filter by SEDI registration status

6. **Reporting & Export**
   - Export directors/officers list as PDF
   - Generate governance report
   - Export to cap table
   - Share with auditors

7. **Exchange-Specific Rules**
   - Dynamic requirement calculation based on selections
   - Validation rules enforcement
   - Deadline tracking
   - Remediation guidance

8. **Integration Points**
   - Link to Cap Table for shareholding verification
   - Link to Compliance dashboard for regulatory status
   - Integration with email system for PIF invitations
   - Webhook for SEDI registration updates

## Design System

### Colors
- Primary Red: `#E8312A` (accent for buttons and highlights)
- Beige Background: `#F7F6F4` (page background)
- Slate palette: Gray colors for text and components

### Typography
- Large titles: `text-4xl font-bold`
- Section titles: `text-lg font-semibold`
- Body text: `text-sm`
- Labels: `text-xs`

### Components Used
- Card/CardHeader/CardContent: From `@/components/ui/card`
- Button: From `@/components/ui/button`
- Input/Label: From `@/components/ui/input`, `@/components/ui/label`
- Tabs: From `@/components/ui/tabs`
- Icons: From `lucide-react` (Check, AlertCircle, X, Edit2, Trash2, Send, Eye, etc.)

### Animations
- Framer Motion for smooth transitions
- Staggered animations for list items
- Fade-in/scale animations for modals
- Progress bar animation

## Database Schema (TODO)

Required tables for full implementation:

```sql
-- Directors table
CREATE TABLE directors (
  id UUID PRIMARY KEY,
  prospectus_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  independence VARCHAR NOT NULL,
  committees TEXT[],
  residency_country VARCHAR NOT NULL,
  residency_province VARCHAR,
  residency_city VARCHAR,
  bio TEXT,
  photo_url VARCHAR,
  pif_status VARCHAR NOT NULL,
  pif_submitted_date TIMESTAMP,
  years_experience INT,
  expertise TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (prospectus_id) REFERENCES prospectuses(id)
);

-- Officers table
CREATE TABLE officers (
  id UUID PRIMARY KEY,
  prospectus_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  department VARCHAR,
  sedi_status VARCHAR NOT NULL,
  sedi_registration_date TIMESTAMP,
  pif_status VARCHAR NOT NULL,
  common_shares INT DEFAULT 0,
  options INT DEFAULT 0,
  warrants INT DEFAULT 0,
  reportable_insider BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (prospectus_id) REFERENCES prospectuses(id)
);

-- Significant shareholders table
CREATE TABLE shareholders (
  id UUID PRIMARY KEY,
  prospectus_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  ownership_percentage DECIMAL(5,2) NOT NULL,
  share_count INT NOT NULL,
  email VARCHAR,
  pif_required BOOLEAN DEFAULT TRUE,
  pif_status VARCHAR NOT NULL,
  shareholder_agreement_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (prospectus_id) REFERENCES prospectuses(id)
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  director_id UUID,
  officer_id UUID,
  shareholder_id UUID,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  uploaded_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Development Checklist

### Phase 1 (Current)
- [x] Create data models and types
- [x] Build UI components
- [x] Create main page with mock data
- [x] Add form modal for adding people
- [x] Implement delete functionality
- [x] Create API route stubs

### Phase 2 (Todo)
- [ ] Implement database integration
- [ ] Build edit functionality
- [ ] Add PIF workflow integration
- [ ] Implement document upload
- [ ] Add SEDI registration
- [ ] Create email notifications
- [ ] Add advanced filtering
- [ ] Build export/reporting features
- [ ] Implement validation rules
- [ ] Add audit trail tracking
- [ ] Create admin dashboard for PIF tracking

## Testing Strategy

### Unit Tests
- Component rendering tests
- Form validation tests
- Data transformation tests
- Status calculation tests

### Integration Tests
- API route tests
- Database query tests
- Form submission tests
- Data persistence tests

### E2E Tests
- User flow: Add director → Send PIF → Track submission
- User flow: Add officer → Register SEDI → Update holdings
- User flow: Filter and search directors/officers
- User flow: Export governance report

## Performance Considerations

- Use memoization for large tables
- Implement pagination for 100+ people
- Cache regulatory requirements per exchange
- Lazy load document preview
- Optimize image uploads for photos

## Accessibility

- Use semantic HTML
- Add ARIA labels for form fields
- Ensure color contrast for status indicators
- Keyboard navigation for modals
- Screen reader friendly table headers

## Mobile Responsiveness

- Stack tables vertically on mobile
- Collapse action buttons into menu
- Responsive modal sizing
- Touch-friendly button sizes (48px minimum)
- Horizontal scroll for wide tables (if needed)
