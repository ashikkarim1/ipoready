# Consent Workflow Integration Guide

## Quick Integration Steps

### 1. Add Navigation Link
In your dashboard sidebar/navigation component, add:

```tsx
import Link from 'next/link'

<Link 
  href="/dashboard/compliance/consent-letters"
  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50"
>
  📋 Consent Letters
</Link>
```

### 2. Update Compliance Layout
If you have a compliance section layout, add the route:

**File:** `src/app/dashboard/compliance/layout.tsx`

```tsx
import React from 'react'
import Link from 'next/link'

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-6">
            <Link
              href="/dashboard/compliance/listing-rules"
              className="text-gray-600 hover:text-gray-900 font-medium pb-2 border-b-2 border-transparent hover:border-blue-500"
            >
              Listing Rules
            </Link>
            <Link
              href="/dashboard/compliance/consent-letters"
              className="text-gray-600 hover:text-gray-900 font-medium pb-2 border-b-2 border-transparent hover:border-blue-500"
            >
              Consent Letters
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
```

### 3. Add to Dashboard Overview
In the main dashboard page, add a compliance card:

```tsx
<div className="grid grid-cols-3 gap-6">
  {/* Other cards... */}
  
  {/* Consent Letters Card */}
  <Link href="/dashboard/compliance/consent-letters">
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Consent Letters</h3>
        <span className="text-2xl">📋</span>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        Track regulatory and expert consents for IPO listing
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Click to manage</span>
        <span className="text-blue-600 font-medium">→</span>
      </div>
    </div>
  </Link>
</div>
```

---

## Environment Variables

Add to `.env.local` if needed:

```env
# Consent workflow settings (optional, defaults are built-in)
NEXT_PUBLIC_CONSENT_REMINDER_DAYS=30
NEXT_PUBLIC_CONSENT_EXPIRY_WARNING_DAYS=7
```

---

## Database Migration

The `consent_letters` table is already defined in `src/db/schema_ipo_management.sql`.

To verify it exists:
```sql
SELECT * FROM consent_letters LIMIT 1;
```

If it doesn't exist, run:
```bash
# This would need to be added to your migration system
psql -d $DATABASE_URL -f src/db/schema_ipo_management.sql
```

---

## Type Exports

Available types from `src/lib/consent-utils.ts`:

```typescript
export type EntityType = 'auditor' | 'lawyer' | 'valuation-expert' | 'environmental-expert' | 'other-expert'
export type ConsentStatus = 'pending' | 'received' | 'rejected' | 'expired' | 'withdrawn'

export interface ConsentRecord {
  id: string
  company_id: string
  from_entity: string
  entity_type: EntityType
  consent_type: string
  status: ConsentStatus
  document_url?: string
  expiry_date?: Date | null
  created_at: Date
  updated_at: Date
}

export interface ConsentSummary {
  total: number
  received: number
  pending: number
  rejected: number
  expired: number
  expiring_soon: number
  compliance_percentage: number
}
```

---

## Component Usage Examples

### Using ConsentDetailsModal
```tsx
import ConsentDetailsModal from '@/components/ConsentDetailsModal'
import { ConsentRecord } from '@/lib/consent-utils'

export default function MyComponent() {
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      {/* Your component content */}
      
      <ConsentDetailsModal
        consent={selectedConsent!}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onStatusChange={(status) => {
          // Handle status change
        }}
        onDelete={() => {
          // Handle delete
        }}
      />
    </>
  )
}
```

### Using Utilities
```typescript
import {
  calculateConsentCompliance,
  getStatusBadge,
  getEntityTypeLabel,
  formatExpiryDate,
  isExpiringSoon,
} from '@/lib/consent-utils'

// Calculate compliance for TSX
const compliance = calculateConsentCompliance(consents, 'tsx')
console.log(`Compliance: ${compliance.compliance_percentage}%`)

// Get status display
const badge = getStatusBadge('pending')
console.log(`Status: ${badge.label} ${badge.icon}`)

// Format dates for display
console.log(formatExpiryDate(expiryDate))

// Check if urgent
if (isExpiringSoon(expiryDate)) {
  console.log('Follow up needed!')
}
```

---

## API Usage Examples

### Fetch Consents (Client-side)
```typescript
const response = await fetch(`/api/compliance/consents?company_id=${companyId}`)
const { consents } = await response.json()
```

### Create Consent (Client-side)
```typescript
const response = await fetch('/api/compliance/consents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_id: 'uuid',
    from_entity: 'KPMG LLP',
    entity_type: 'auditor',
    consent_type: 'independent_audit',
    expiry_date: '2026-09-01',
  }),
})
const { consent } = await response.json()
```

### Update Status (Client-side)
```typescript
const response = await fetch(`/api/compliance/consents/${consentId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'received',
    document_url: 'https://...',
  }),
})
const { consent } = await response.json()
```

### Generate Letter (Client-side)
```typescript
const response = await fetch('/api/compliance/consents/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_id: 'uuid',
    entity_type: 'auditor',
    from_entity: 'KPMG LLP',
    exchange: 'tsx',
    format: 'html',
  }),
})
const { template } = await response.json()
// template.html contains the full HTML letter
```

---

## Error Handling

Common error responses:

**401 Unauthorized**
```json
{ "error": "Unauthorized" }
```
Solution: Ensure user is authenticated with NextAuth

**403 Forbidden**
```json
{ "error": "Company not found or unauthorized" }
```
Solution: Verify company_id belongs to current user

**400 Bad Request**
```json
{ "error": "Missing required fields" }
```
Solution: Check request body has all required fields

**500 Internal Server Error**
```json
{ "error": "Failed to [operation]" }
```
Solution: Check server logs for database or connection errors

---

## Testing the Integration

### Manual Testing
1. Navigate to `/dashboard/compliance/consent-letters`
2. Click "+ New Consent"
3. Fill form with:
   - from_entity: "KPMG LLP"
   - entity_type: "auditor"
   - expiry_date: (30 days from now)
4. Click "Create Consent"
5. Verify consent appears in list
6. Click consent to view details
7. Change status to "received"
8. Verify compliance % increases

### API Testing (cURL)
```bash
# Create consent
curl -X POST http://localhost:3000/api/compliance/consents \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "YOUR_COMPANY_ID",
    "from_entity": "KPMG LLP",
    "entity_type": "auditor",
    "consent_type": "independent_audit",
    "expiry_date": "2026-09-01"
  }'

# List consents
curl "http://localhost:3000/api/compliance/consents?company_id=YOUR_COMPANY_ID"

# Update status
curl -X PATCH http://localhost:3000/api/compliance/consents/CONSENT_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "received"}'

# Generate letter
curl -X POST http://localhost:3000/api/compliance/consents/generate \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "YOUR_COMPANY_ID",
    "entity_type": "auditor",
    "from_entity": "KPMG LLP",
    "exchange": "tsx",
    "format": "html"
  }'
```

---

## Deployment Checklist

- [ ] Database schema migrated (`consent_letters` table exists)
- [ ] Environment variables set
- [ ] Navigation links added to dashboard
- [ ] API endpoints tested with curl
- [ ] Dashboard page loads without errors
- [ ] Form submission works
- [ ] Status updates persist
- [ ] Letter template downloads as HTML
- [ ] Filters work correctly
- [ ] Compliance % calculation is accurate
- [ ] Expiry date warnings display
- [ ] Mobile responsiveness verified

---

## Support & Troubleshooting

### Issue: "Company not found" error
**Cause:** Using wrong company_id
**Solution:** Verify company_id from localStorage or user's company list

### Issue: Consents not loading
**Cause:** API endpoint not found or authentication failed
**Solution:** Check NextAuth session is active, verify API routes are created

### Issue: Status dropdown not working
**Cause:** Event handling issue
**Solution:** Check console for JavaScript errors, verify PATCH endpoint

### Issue: Letter template not generating
**Cause:** Exchange or entity_type invalid
**Solution:** Verify exchange is one of: tsx, nasdaq, nyse, tsxv, cse

For additional support, check logs:
```bash
# Server logs
npm run dev -- --log-level=debug

# Browser console
F12 → Console tab
```
