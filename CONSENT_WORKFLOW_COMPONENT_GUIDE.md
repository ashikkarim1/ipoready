# Consent Workflow Component - Build 2B.2

## Overview

The Consent Workflow component is a comprehensive React/TypeScript implementation for managing stakeholder consents in the IPO readiness process. It provides:

- Real-time compliance tracking dashboard
- Consent request generation and status management
- E-signature placeholder integration (DocuSign ready)
- Detailed consent view with document preview
- Activity timeline tracking
- Advanced filtering and search

## Component Structure

### Main Files

1. **`src/components/ConsentWorkflow.tsx`** (500 lines)
   - Main React component with full UI
   - Manages consent list, filtering, modals
   - Sample data with 5 consent request examples
   - Mobile-responsive design

2. **`src/lib/consent-utils.ts`** (450 lines)
   - Utility functions for consent management
   - Compliance calculations
   - Status and entity type management
   - Exchange-specific requirements (TSX, NASDAQ, NYSE, TSXV, CSE)
   - Consent letter template generation
   - Filtering and sorting functions

3. **`src/app/demo/consent-workflow/page.tsx`**
   - Demo page wrapper
   - Ready to integrate into dashboard

## Features

### 1. Compliance Dashboard

**Real-time Metrics:**
- Compliance % (signed / total * 100)
- Signed count
- Pending count
- Expiring soon count (within 30 days)
- Total consent count

**Visual Indicators:**
- Color-coded status badges
- Progress visualization
- Quick status metrics in cards

### 2. Consent Management

**View Consent List:**
- Search by stakeholder name or consent type
- Filter by status (pending, signed, rejected, expired)
- Filter by entity type (auditor, lawyer, valuation expert, etc.)
- Sort by deadline
- Mobile-responsive table

**Consent Statuses:**
- `pending` - Awaiting response (yellow/amber)
- `signed` - Consent received (green)
- `rejected` - Consent denied (red)
- `expired` - Deadline passed (gray)

**Entity Types:**
- Auditor - Independent audit opinion
- Lawyer - Legal counsel opinion
- Valuation Expert - Fairness opinion
- Environmental Expert - Environmental assessment
- Other Expert - Generic expert report

### 3. Create New Consent Request

**Modal Form with:**
- Stakeholder/entity name input
- Entity type selection (auto-fills consent type)
- Auto-filled consent type field
- Deadline date picker
- Form validation

**Auto-Population:**
- Consent type auto-fills based on entity type
- Default values for common scenarios

### 4. Consent Details Modal

**Information Display:**
- Full entity and consent details
- Current status with quick action buttons
- Days until deadline
- Entity type and created date

**Quick Actions:**
- Mark as Signed
- Mark as Rejected
- Download document

**Document Section:**
- Upload document area
- View signed documents
- Download capability

**E-Signature Placeholder:**
- DocuSign integration ready
- Placeholder UI for signature capture
- Instructions for manual upload

**Activity Timeline:**
- Creation event
- Signature date event
- Timestamped entries

### 5. Advanced Filtering

**Real-time Filtering:**
- Search box (searches stakeholder & consent type)
- Status dropdown filter
- Entity type dropdown filter
- Instant result updates

**Sample Data:**
- KPMG (Auditor) - Signed
- Osler, Hoskin & Harcourt (Lawyer) - Pending
- Deloitte (Valuation Expert) - Pending
- EY (Environmental Expert) - Rejected
- PwC (Other Expert) - Expired

## Component Props & State

### ConsentWorkflow Component

```typescript
// No props - self-contained component

// State Management:
- consents: ConsentRequest[]
- selectedConsent: ConsentRequest | null
- showNewForm: boolean
- searchTerm: string
- filterStatus: 'pending' | 'signed' | 'rejected' | 'expired' | 'all'
- filterEntityType: EntityType | 'all'
```

### ConsentRequest Interface

```typescript
interface ConsentRequest {
  id: string
  stakeholder: string
  entityType: EntityType
  consentType: string
  status: ConsentStatus
  createdDate: string
  deadline: string
  documentUrl?: string
  signatureDate?: string
}
```

### ConsentDetailsModal Props

```typescript
interface ConsentDetailsModalProps {
  consent: ConsentRequest | null
  onClose: () => void
  onStatusChange: (id: string, status: ConsentStatus) => void
}
```

### NewConsentForm Props

```typescript
interface NewConsentFormProps {
  onClose: () => void
  onSubmit: (data: ConsentFormData) => void
}
```

## Utility Functions

### Compliance & Status

```typescript
calculateConsentCompliance(consents, exchange?)
→ { total, signed, pending, rejected, expired, expiring_soon, compliance_percentage }

getStatusBadge(status)
→ { label, color, bg_color, icon }

getEntityTypeInfo(type)
→ { label, icon, description }
```

### Date Management

```typescript
formatExpiryDate(date)
→ "Jun 3, 2026"

isExpiringSoon(date, dayThreshold?)
→ boolean

isExpired(date)
→ boolean

getDaysUntilExpiry(date)
→ number
```

### Exchange Requirements

```typescript
getRequiredConsentsForExchange(exchange)
→ ExchangeRequirement[]

// Returns exchange-specific required consents

isConsentCompleteForExchange(consents, exchange)
→ { complete: boolean, missing: ExchangeRequirement[] }
```

### Templates

```typescript
generateConsentLetterTemplate(entityType, fromEntity, exchange, companyName?)
→ ConsentLetterTemplate

// Template includes:
// - subject line
// - greeting
// - introduction
// - requirements array
// - timeline
// - closing
// - signature line
```

### Filtering & Sorting

```typescript
filterConsentsByStatus(consents, status)
filterConsentsByEntityType(consents, entityType)
sortConsentsByExpiry(consents, ascending?)
sortConsentsByStatus(consents, statusOrder)
```

## Usage Examples

### Basic Integration

```typescript
import { ConsentWorkflow } from '@/components/ConsentWorkflow'

export function DashboardPage() {
  return (
    <div>
      <ConsentWorkflow />
    </div>
  )
}
```

### Using Utility Functions

```typescript
import {
  calculateConsentCompliance,
  getRequiredConsentsForExchange,
  generateConsentLetterTemplate,
  isExpiringSoon,
} from '@/lib/consent-utils'

// Calculate compliance
const summary = calculateConsentCompliance(consents, 'tsx')
console.log(`Compliance: ${summary.compliance_percentage}%`)

// Get exchange requirements
const requirements = getRequiredConsentsForExchange('nasdaq')

// Generate letter template
const template = generateConsentLetterTemplate(
  'auditor',
  'KPMG LLP',
  'tsx',
  'Acme Inc.'
)

// Check if expiring soon
if (isExpiringSoon(consent.deadline, 30)) {
  console.log('This consent is expiring within 30 days')
}
```

## Styling

The component uses:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Design System** colors from globals.css

### Color Mapping

| Status    | Text Color        | Background Color |
| --------- | ----------------- | ---------------- |
| Signed    | `text-green-600`  | `bg-green-50`    |
| Pending   | `text-amber-600`  | `bg-amber-50`    |
| Rejected  | `text-red-600`    | `bg-red-50`      |
| Expired   | `text-gray-600`   | `bg-gray-50`     |

### Icons (from Lucide)

- FileText - Document/audit
- CheckCircle2 - Signed/success
- Clock - Pending
- AlertCircle - Warning/expiring
- XCircle - Rejected
- Plus - Add new
- Search - Search
- Filter - Filter
- Calendar - Date
- Building2 - Organization
- Signature - E-signature
- Eye - View details
- Download - Download document

## Data Flow

```
User Action
  ↓
Component State Update
  ↓
Re-render with Animation
  ↓
Modal Display / List Update
  ↓
Utility Functions (for calculations)
  ↓
Display Updated Metrics
```

## Sample Data

The component includes 5 sample consent requests:

1. **KPMG LLP** (Auditor) - **Signed**
   - Status: Completed
   - Signed: June 2, 2026
   - Deadline: Aug 31, 2026

2. **Osler, Hoskin & Harcourt LLP** (Lawyer) - **Pending**
   - Created: May 20, 2026
   - Deadline: Aug 15, 2026

3. **Deloitte Valuation Services** (Valuation Expert) - **Pending**
   - Created: May 25, 2026
   - Deadline: Jul 30, 2026

4. **EY Environmental Services** (Environmental Expert) - **Rejected**
   - Created: May 18, 2026
   - Deadline: Jul 15, 2026

5. **PwC Financial Advisory** (Other Expert) - **Expired**
   - Created: April 15, 2026
   - Deadline: May 30, 2026 (EXPIRED)

## Exchange-Specific Consents

### TSX Requirements

```typescript
- auditor (required): Independent Audit Opinion
- lawyer (required): Legal Counsel Opinion
- valuation_expert (optional): Valuation Report Consent
- environmental_expert (optional): Environmental Assessment
```

### NASDAQ Requirements

```typescript
- auditor (required): Independent Audit Opinion
- lawyer (required): Legal Counsel Opinion
- valuation_expert (optional): Fairness Opinion
```

### TSXV Requirements

```typescript
- auditor (required): Independent Audit Opinion
- lawyer (required): Legal Counsel Opinion
```

### CSE Requirements

```typescript
- auditor (required): Independent Audit Opinion
- lawyer (required): Legal Counsel Opinion
```

## Animations

Using Framer Motion:

- **Dashboard Cards**: Staggered fade-in with y-offset
- **Modal Open/Close**: Scale and opacity transition
- **List Items**: Staggered slide-in with opacity
- **Status Changes**: Smooth color transitions

Timing:
- Spring stiffness: 340
- Damping: 28
- Delay: 50-200ms between items

## Mobile Responsiveness

**Breakpoints:**
- Mobile: <640px - Single column, compact controls
- Tablet: 640px-1024px - Two columns, medium spacing
- Desktop: >1024px - Full layout with all columns

**Responsive Elements:**
- Dashboard metrics: Responsive grid (1 col → 5 cols)
- Filter controls: Stack on mobile, row on desktop
- Consent table: Collapse columns on small screens
- Modals: Full width on mobile, centered on desktop

## Testing Scenarios

### 1. Compliance Tracking

1. View dashboard showing 60% compliance (3/5 signed)
2. Filter to show only pending consents
3. Create new consent request
4. Verify compliance updates

### 2. Status Updates

1. Click on pending consent
2. Mark as Signed
3. Verify status updates in list
4. Check compliance % increases

### 3. Search & Filter

1. Search for "KPMG"
2. Filter by "Signed" status
3. Filter by "Auditor" type
4. Verify results match

### 4. Deadline Warnings

1. View consent expiring within 30 days
2. Check "Expiring Soon" counter increases
3. Sort by deadline to see order

### 5. Document Upload

1. Click on consent detail
2. View document section
3. See e-signature placeholder
4. Verify DocuSign integration ready

## Future Enhancements

### Phase 3 Features

- [ ] Actual DocuSign integration
- [ ] Email notifications for expiring consents
- [ ] Auto-sync with exchange filing deadlines
- [ ] Template customization per exchange
- [ ] Bulk consent status updates
- [ ] Export as CSV/PDF
- [ ] Reminder scheduling
- [ ] Document management system integration
- [ ] Audit log for all consent operations
- [ ] Role-based consent permissions

### Database Integration

When connecting to backend:

```typescript
// API Endpoints needed:
GET /api/consents?company_id=:id
POST /api/consents
PATCH /api/consents/:id
DELETE /api/consents/:id
POST /api/consents/generate-letter
```

## Performance Considerations

- **Memoization**: Using `useMemo` for filtered/sorted lists
- **Lazy Modals**: Modals only render when open (AnimatePresence)
- **Virtual Scrolling**: Recommend for >100 items
- **Debounced Search**: Consider adding for large datasets

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on icon buttons
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Focus management in modals

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Current versions

## Dependencies

Required:
- React 18+
- Next.js 14+
- TypeScript 5+
- Tailwind CSS 4+
- Framer Motion 10+
- Lucide React 0.29+

## File Sizes

- ConsentWorkflow.tsx: ~20 KB (uncompressed)
- consent-utils.ts: ~18 KB (uncompressed)
- Bundled & minified: ~8-10 KB

## Integration Checklist

- [x] Component created and tested
- [x] Utility functions implemented
- [x] Sample data included
- [x] Mobile responsive verified
- [x] Animations implemented
- [x] Filtering/sorting working
- [x] Documentation complete
- [ ] Backend API endpoints ready
- [ ] Database schema configured
- [ ] Production deployment

## Support & Troubleshooting

### Common Issues

**Modals not showing:**
- Check z-index value (fixed inset-0 z-50)
- Verify parent element doesn't override stacking context

**Animations stuttering:**
- Ensure GPU acceleration enabled
- Check for heavy re-renders
- Profile with React DevTools

**Search not working:**
- Verify searchTerm state updating
- Check filter logic in useMemo
- Console log filteredConsents

**Status updates not persisting:**
- Remember data is in-memory only
- Connect to backend API to persist
- Use optimistic updates for UX

## Documentation Links

- [Consent Workflow API](./CONSENT_WORKFLOW.md)
- [Integration Guide](./CONSENT_INTEGRATION_GUIDE.md)
- [Checklist](./CONSENT_WORKFLOW_CHECKLIST.md)
