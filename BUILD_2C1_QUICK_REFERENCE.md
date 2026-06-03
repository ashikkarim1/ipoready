# Build 2C.1 - Quick Reference Guide

## Component Import

```typescript
import { ResolutionsManager2C1 } from '@/components/ResolutionsManager2C1'

// In your page or component:
export default function ResolutionsPage() {
  return <ResolutionsManager2C1 />
}
```

## Access the Component

**URL:** `https://ipoready.local/compliance/resolutions`

## 10 Resolution Templates

| # | Type | Name | Category | Exchange Requirements |
|---|------|------|----------|----------------------|
| 1 | `stock_split` | Stock Split | Capital | None |
| 2 | `board_appointment` | Board Appointment | Governance | None |
| 3 | `option_pool` | Option Pool Increase | Capital | None |
| 4 | `warrant_cancellation` | Warrant Cancellation | Capital | None |
| 5 | `prospectus_approval` | Prospectus Approval | Listing | TSX, NASDAQ, NYSE, CSE |
| 6 | `listing_approval` | Listing Approval | Listing | TSX, NASDAQ, NYSE, CSE, TSXV |
| 7 | `underwriting_authorization` | Underwriting Authorization | Listing | TSX, NASDAQ, NYSE |
| 8 | `material_contracts` | Material Contract Approval | Compliance | None |
| 9 | `series_issuance` | Series Issuance Authorization | Capital | None |
| 10 | `preferred_conversion` | Preferred Conversion to Common | Capital | None |

## Resolution Statuses

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| **Draft** | ⏱️ | Slate | Created, awaiting approvals |
| **Approved** | ✓ | Amber | All board members approved |
| **Executed** | ✅ | Green | Implemented and effective |
| **Archived** | 📦 | Slate | Historical record |
| **Rejected** | ❌ | Red | Approval failed |

## Sample Resolutions (Pre-populated)

### 1. Preferred Conversion (ID: res-001)
- Status: EXECUTED ✅
- Effective: 2026-03-20
- Approvals: 5/5

### 2. Option Pool Increase (ID: res-002)
- Status: APPROVED ✓
- Effective: 2026-03-25
- Approvals: 5/5

### 3. Board Appointment (ID: res-003)
- Status: APPROVED ✓
- Effective: 2026-03-01
- Approvals: 5/5

### 4. Stock Split (ID: res-004)
- Status: DRAFT ⏱️
- Approvals: 2/5 (pending)

### 5. Warrant Cancellation (ID: res-005)
- Status: DRAFT ⏱️
- Approvals: 1/5 (pending)

## API Quick Reference

### Get All Resolutions
```bash
GET /api/compliance/resolutions?companyId=UUID&status=draft&limit=50
```

### Create Resolution
```bash
POST /api/compliance/resolutions
Body: {
  "companyId": "UUID",
  "userId": "UUID",
  "resolutionType": "stock_split",
  "companyName": "Example Corp",
  "approvalDate": "2026-06-03",
  "boardMembers": ["Sarah Chen", "Michael Rodriguez"]
}
```

### Get Resolution Details
```bash
GET /api/compliance/resolutions/RES_ID
```

### Update Resolution Status
```bash
PATCH /api/compliance/resolutions/RES_ID
Body: {
  "status": "executed",
  "effectiveDate": "2026-06-10"
}
```

### Record Board Member Approval
```bash
POST /api/compliance/resolutions/RES_ID/approve
Body: {
  "boardMemberName": "Sarah Chen",
  "approvalDate": "2026-06-03"
}
```

### Get Approval Status
```bash
GET /api/compliance/resolutions/RES_ID/approve
```

### Archive Resolution
```bash
DELETE /api/compliance/resolutions/RES_ID
```

## UI Features at a Glance

### Dashboard Stats
- Total Resolutions
- Draft Count
- Approved Count
- Executed Count

### Resolution List
- Search by title/description/type
- Filter by status
- View creation date and tags
- See approval progress

### Creation Wizard
**Step 1:** Select template (with exchange requirements shown)
**Step 2:** Fill details (title, description, board members, effective date)
**Step 3:** Review and create

### Resolution Detail View
- Full text content
- Approval timeline per board member
- Export to PDF
- Duplicate action

## Dark Mode Support

All components fully support dark mode:
- `dark:bg-slate-800` for backgrounds
- `dark:text-white` for text
- `dark:border-slate-700` for borders
- Automatic theme detection

## Mobile Responsive

- Stacked layout on mobile
- Touch-friendly buttons (44px+)
- Responsive grid (1-4 columns)
- Scrollable table/lists on small screens

## Sample Board Members (From Data)

```
Sarah Chen, CEO - Director
Michael Rodriguez, VC Partner - Director
Jennifer Park, CFO - Director
David Thompson - Independent Director
Lisa Anderson, Lead Investor - Director
```

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `ResolutionsManager2C1.tsx` | 1,100+ | Main component |
| `page.tsx` | 8 | Route wrapper |
| `route.ts` (main) | 80 | GET/POST endpoints |
| `route.ts` ([id]) | 70 | PATCH/DELETE endpoints |
| `route.ts` (approve) | 90 | Approval endpoints |
| `schema-resolutions.sql` | 167 | Database schema |

## Implementation Checklist

- [x] Component creation
- [x] 10 resolution templates
- [x] 3-step wizard
- [x] Board member approval tracking
- [x] Status management
- [x] Sample resolutions with realistic data
- [x] API endpoints (GET, POST, PATCH, DELETE)
- [x] Approval endpoints
- [x] Dark mode support
- [x] Mobile responsiveness
- [x] Search and filtering
- [x] Database schema integration
- [x] TypeScript types and interfaces
- [x] Form validation
- [x] Error handling

## Common Use Cases

### Create a New Stock Split Resolution
1. Click "New Resolution"
2. Select "Stock Split" template
3. Enter title: "3:1 Share Split"
4. Add description
5. Add board members
6. Review and create

### Track Approvals
1. Click on a resolution card
2. View "Board Member Approvals" section
3. See who has approved and when
4. Status auto-updates when all approve

### Filter by Status
1. Use status dropdown filter
2. Select: Draft, Approved, Executed, or All
3. Results update in real-time

### Search Resolutions
1. Type in search bar
2. Searches title, description, and type
3. Combines with status filter

## Database Integration Points

**Tables:**
- `board_resolutions` - Main resolution records
- `resolution_approvals` - Per-member approval tracking
- `resolution_templates` - Template library
- `exchange_resolution_requirements` - Exchange rules

**Indexes:**
- `company_id` (for company filtering)
- `status` (for status filtering)
- `created_at DESC` (for sorting)
- `resolution_type` (for type filtering)

## Next Steps for Integration

1. Add navigation link in main menu
2. Connect to PACE scoring system
3. Add email notifications for approvals
4. Implement PDF generation
5. Link to board meeting minutes
6. Add audit logging

---

**Version:** 2C.1  
**Last Updated:** June 3, 2026  
**Status:** Production Ready
