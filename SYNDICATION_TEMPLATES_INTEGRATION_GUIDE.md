# Syndication Templates - Quick Integration Guide

## Quick Start

### 1. Add Component to Your Page

```tsx
// src/app/syndication/page.tsx
import { SyndicationTemplates } from '@/components/SyndicationTemplates'

export default function SyndicationPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <SyndicationTemplates />
    </main>
  )
}
```

### 2. Add Navigation Link

```tsx
// src/components/layout/AppShell.tsx
<nav>
  {/* ... existing nav items ... */}
  <Link href="/syndication">
    <FileText className="h-5 w-5" />
    Syndication
  </Link>
</nav>
```

### 3. Database Setup

```bash
# Apply migration
psql -h your-db-host -U your-user -d your-db < migrations/021_syndication_templates_version_control.sql

# Verify installation
psql -h your-db-host -U your-user -d your-db -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'syndication%';"
```

## API Usage Examples

### Create a Template

```typescript
const response = await fetch('/api/syndication/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agreement_type: 'firm_commitment',
    agreement_name: 'My Custom Template',
    description: 'Custom syndication agreement',
    lead_underwriter: 'Goldman Sachs',
    member_count: 8,
    gross_spread_bps: 350,
    lockup_period_days: 180,
    allocation_structure: {
      'Goldman Sachs': 4000,
      'Morgan Stanley': 3000,
      'JP Morgan': 2500,
      'Bank of America': 500,
    }
  })
})
const newTemplate = await response.json()
```

### Fetch All Templates

```typescript
const response = await fetch('/api/syndication/templates')
const { templates, count } = await response.json()
console.log(`Found ${count} templates`)
templates.forEach(t => {
  console.log(`- ${t.agreement_name} (${t.agreement_type})`)
})
```

### Get Version History

```typescript
const response = await fetch('/api/syndication/templates/1/versions')
const { versions } = await response.json()
versions.forEach(v => {
  console.log(`Version ${v.version}: ${v.changes}`)
  console.log(`  Created: ${new Date(v.created_at).toLocaleDateString()} by ${v.created_by}`)
})
```

### Update Template

```typescript
const response = await fetch('/api/syndication/templates/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agreement_name: 'Updated Template Name',
    gross_spread_bps: 400, // Changed from 350
    // ... other fields
  })
})
const updated = await response.json()
```

## Component Features Reference

### Available Props

The `SyndicationTemplates` component accepts no props - it's fully self-contained.

```tsx
<SyndicationTemplates />
```

### Internal State Management

The component manages:
- `templates`: Array of syndication templates
- `selectedTemplate`: Currently viewed/edited template
- `showForm`: Template editor visibility
- `showVersionHistory`: Version history modal visibility
- `showPreview`: Agreement preview modal visibility
- `editingTemplate`: Template being edited
- `versions`: Version history for selected template

### Key Functions

#### `fetchTemplates()`
Loads all templates from API. Called on component mount and after create/update.

#### `generateAgreementDocument(template)`
Creates formatted text document from template. Includes:
- Header with type and date
- Party structure
- Economic terms
- Member allocation
- Obligations
- Key dates
- Representations & warranties
- Signature block

#### `handleDownloadAgreement(template)`
Generates document and triggers browser download as `.txt` file.

#### `handleEditTemplate(template)`
Populates form with template data for editing.

#### `handleDuplicateTemplate(template)`
Creates copy with "(Copy)" suffix and draft status.

## Template Data Structure

```typescript
interface SyndicationTemplate {
  id: string
  agreement_type: 'firm_commitment' | 'best_efforts' | 'standby' | 'all_or_none'
  agreement_name: string
  description: string
  lead_underwriter: string
  member_count: number
  gross_spread_bps: number           // e.g., 350 = 3.5%
  lockup_period_days: number
  allocation_structure: {
    [memberName: string]: number     // basis points
  }
  status: 'draft' | 'active' | 'archived'
  created_at: string                 // ISO timestamp
  updated_at: string                 // ISO timestamp
  version: number
}
```

## Form Validation Rules

All form fields use Zod validation:

| Field | Type | Rules |
|-------|------|-------|
| agreement_type | enum | Required, must be valid type |
| agreement_name | string | Required, min 1 character |
| description | string | Optional |
| lead_underwriter | string | Required, min 1 character |
| member_count | number | Required, >= 1 |
| gross_spread_bps | number | 0-1000 basis points |
| lockup_period_days | number | >= 0 |
| allocation_structure | JSON | Valid JSON object |

## Styling & Theming

### Color Scheme

**Agreement Types:**
- Firm Commitment: Blue (`bg-blue-100 dark:bg-blue-900/30`)
- Best Efforts: Amber (`bg-amber-100 dark:bg-amber-900/30`)
- Standby: Purple (`bg-purple-100 dark:bg-purple-900/30`)
- All or None: Red (`bg-red-100 dark:bg-red-900/30`)

**Status:**
- Draft: Gray (`bg-slate-100`)
- Active: Green (`bg-green-100`)
- Archived: Gray (`bg-gray-100`)

### Dark Mode

Component fully supports dark mode via `dark:` classes. Background, text, borders all adapt.

## Common Customizations

### Change Template API Endpoint

```tsx
// In SyndicationTemplates.tsx, modify fetchTemplates():
const response = await fetch('/api/custom/templates')
```

### Add Custom Allocation Structure Fields

```tsx
// Modify allocation_structure input to include additional metadata:
allocation_structure: {
  [memberName]: {
    bps: number,
    contact: string,
    region: string
  }
}
```

### Add Email Notifications

```tsx
// After successful template save:
await fetch('/api/notifications/email', {
  method: 'POST',
  body: JSON.stringify({
    to: 'team@example.com',
    subject: `New template created: ${template.agreement_name}`,
    template: 'syndication_template_created',
    data: template
  })
})
```

### Customize Agreement Document

The `generateAgreementDocument()` function returns a formatted string. Modify it to:
- Add company-specific headers
- Include custom legal clauses
- Add financial tables
- Embed logos or graphics
- Include boilerplate language

```tsx
const generateAgreementDocument = (template: SyndicationTemplate): string => {
  const header = `
    [YOUR COMPANY HEADER]
    
    CONFIDENTIAL - FOR AUTHORIZED USE ONLY
  `
  // ... rest of document
}
```

## Dashboard Widget Example

```tsx
// src/app/dashboard/page.tsx
import { SyndicationTemplates } from '@/components/SyndicationTemplates'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Other dashboard sections */}
      
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Syndication Management</h2>
        <SyndicationTemplates />
      </section>
    </div>
  )
}
```

## Troubleshooting

### Templates Not Loading

1. Check API endpoint: `/api/syndication/templates`
2. Verify authentication: Session must exist
3. Check browser console for errors
4. Verify database tables exist:
   ```sql
   SELECT * FROM syndication_agreements LIMIT 1;
   ```

### Form Submission Fails

1. Check validation errors displayed
2. Ensure allocation_structure is valid JSON
3. Verify all required fields filled
4. Check that gross_spread_bps is 0-1000
5. Check browser console network tab

### Agreement Preview Empty

1. Ensure template has all required fields
2. Verify allocation_structure is populated
3. Check template data in browser console
4. Try duplicating an existing template first

## Performance Tips

1. **Large Number of Templates**
   - Add pagination (load 10 at a time)
   - Implement search/filter
   - Use React Query for caching

2. **Large Allocation Structures**
   - Validate JSON before submission
   - Limit members to reasonable number
   - Consider nested data structures

3. **Version History**
   - Lazy load version history on demand
   - Pagination for old versions
   - Archive old versions to separate table

## Security Checklist

- [ ] Authentication required for all endpoints
- [ ] User ID logged on create/update
- [ ] API validates all inputs (Zod schemas)
- [ ] No sensitive data in allocation_structure
- [ ] Document downloads use secure serving
- [ ] Version history immutable once created
- [ ] Proper CORS headers configured

## Next Steps

1. **Obligation Tracking**: Build member obligation dashboard
2. **E-signature Integration**: Connect DocuSign/Adobe Sign
3. **Financial Integration**: Link to cost calculator
4. **Notifications**: Alert on obligation deadlines
5. **Analytics**: Track template usage statistics

## Support

For issues or questions:
1. Check this guide first
2. Review sample templates in component
3. Check database migration comments
4. Review API endpoint implementations
5. Check TypeScript types for data structures
