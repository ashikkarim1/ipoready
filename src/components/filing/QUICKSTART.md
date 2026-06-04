# Filing Checker Dashboard - Quick Start Guide

Get up and running with the Filing Checker Dashboard in 5 minutes.

## Installation

The component is already installed as part of IPOReady. No additional installation required.

```bash
# Already available - no install needed
```

## Basic Usage

### 1. Simple Demo Page

```tsx
// app/filing/demo/page.tsx
import { FilingCheckerDemo } from '@/components/filing'

export default function FilingDemoPage() {
  return <FilingCheckerDemo />
}
```

Visit `/filing/demo` to see a live working example with mock data.

### 2. With Real Data

```tsx
// app/filing/[id]/page.tsx
import { FilingCheckerDashboard } from '@/components/filing'

export default async function FilingPage({ params }) {
  // Fetch your filing data
  const filingData = await fetch(`/api/filings/${params.id}`).then(r => r.json())

  return <FilingCheckerDashboard {...filingData} />
}
```

### 3. With API Integration

```tsx
// app/filing/[id]/page.tsx
import { FilingCheckerIntegration } from '@/components/filing'

export default function FilingPage({ params }) {
  return <FilingCheckerIntegration filingId={params.id} />
}
```

The Integration component handles:
- Fetching data from `/api/filings/[filingId]`
- Resolving issues via API calls
- Exporting PDFs
- Sharing status
- Submitting filings

## Data Structure

Here's what your filing data should look like:

```typescript
const filingData = {
  // Required: Identifiers
  filingId: 'IPO-2024-001',
  exchangeId: 'TSX',

  // Required: Status
  status: 'not_ready' as const,

  // Required: Quality scores (0-100)
  completenessScore: 72,
  complianceScore: 65,
  qualityScore: 78,
  crossValidationScore: 71,

  // Required: Issues array
  issues: [
    {
      id: 'iss-001',
      severity: 'critical',
      category: 'CA - Prospectus Section',
      description: 'Risk Factors disclosure incomplete',
      requiredFix: 'Provide comprehensive risk factor analysis...',
      documentType: 'Risk Factors Document',
    },
  ],

  // Required: Missing documents
  missingDocuments: [
    {
      docType: 'Auditor Consent Letter',
      required: true,
      hasTemplate: false,
    },
  ],

  // Required: Sections
  sections: [
    {
      name: 'Company Overview',
      completeness: 95,
      issues: 0,
    },
  ],
}
```

## Styling

The component automatically uses IPOReady's design system:

- Beige background: `#F7F6F4`
- Red accent: `#E8312A`
- Green success: `#2D7A5F`
- Amber warning: `#B45309`
- Dark mode: Fully supported

No additional styling needed!

## Making It Interactive

Add callbacks to handle user actions:

```tsx
<FilingCheckerDashboard
  {...filingData}
  onResolveIssue={async (issueId) => {
    // Call your API to mark issue as resolved
    await fetch(`/api/filings/${filingId}/issues/${issueId}/resolve`, {
      method: 'PATCH',
    })
    // Refresh data or update state
  }}
  onExportPDF={async () => {
    // Trigger PDF download
    const response = await fetch(`/api/filings/${filingId}/export-pdf`)
    const blob = await response.blob()
    // Download blob
  }}
  onShareStatus={async () => {
    // Send status via email
    await fetch(`/api/filings/${filingId}/share`, { method: 'POST' })
  }}
  onReadyToFile={async () => {
    // Submit filing
    await fetch(`/api/filings/${filingId}/submit`, { method: 'POST' })
  }}
  onViewFullReport={() => {
    // Navigate to detailed report
    router.push(`/filing/${filingId}/full-report`)
  }}
/>
```

## Understanding the Status

The component automatically calculates status based on issues:

```
🔴 NOT READY    = Has critical issues
🟡 IN PROGRESS  = Has warning issues only
🟢 READY        = No critical or warning issues
```

You can't click "Ready to File" until status is READY.

## Key Features to Highlight

### Click on Issues to Expand
Users can click any issue to see:
- Full description
- What needs to be fixed
- Action buttons (Upload, Use Template, View Examples)
- Resolution checkbox

### Real-time Score Updates
When users mark issues as resolved:
- Scores update automatically
- Status changes dynamically
- Overall progress percentage updates

### Quality Score Visualization
Four-part scoring system:
- **Completeness**: How complete are all required sections?
- **Compliance**: How well does it meet regulatory requirements?
- **Quality**: How high quality are the disclosures?
- **Cross-validation**: How consistent are the documents?

### Jurisdiction Tracking
Issues are organized by jurisdiction:
- Canada (CSA)
- United States (SEC)
- United Kingdom (FCA)
- European Union (ESMA)

### Recommended Next Action
Smart suggestion panel shows:
- The highest-priority item to work on next
- Estimated time to complete
- Action buttons to get started

## Customization

### Change Color Scheme

The component uses CSS color variables from `/src/app/globals.css`. To customize:

```css
/* In globals.css or your component */
--color-accent: #E8312A;      /* Red */
--color-success: #2D7A5F;      /* Green */
--color-warning: #B45309;      /* Amber */
--color-error: #DC2626;        /* Dark red */
```

### Custom Time Estimation

```typescript
import { FilingCheckerDashboard } from '@/components/filing'

function estimateTimeToReady(issues) {
  // Your custom logic
  return '3 days'
}

<FilingCheckerDashboard
  {...filingData}
  // Note: Custom estimator would require component modification
/>
```

### Dark Mode

Automatically respects system preference. To force:

```tsx
// In your app
import { useState, useEffect } from 'react'

export default function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <FilingCheckerDashboard {...filingData} />
  )
}
```

## Performance Tips

1. **Memoize callback functions**:
```tsx
const handleResolveIssue = useCallback(async (issueId) => {
  // Your logic
}, [filingId])
```

2. **Lazy load large sections**:
```tsx
const sections = useMemo(() => {
  return filingData.sections.slice(0, 10)
}, [filingData])
```

3. **Use React.memo for parent components**:
```tsx
const MemoizedFilingChecker = React.memo(FilingCheckerDashboard)
```

## Common Issues & Solutions

### Issues Not Expanding?
```tsx
// Make sure you're passing the full issues array
issues: [
  { id: 'iss-001', severity: 'critical', ... }, // ✓ Valid
  { severity: 'critical', ... }, // ✗ Missing id
]
```

### Scores Not Updating?
```tsx
// Scores must be numbers 0-100
completenessScore: 72,    // ✓ Valid
completenessScore: '72',  // ✗ String instead of number
completenessScore: 150,   // ✗ Out of range
```

### Dark Mode Not Working?
```tsx
// Add to tailwind.config.js
module.exports = {
  darkMode: 'class', // ✓ Required for dark mode
}
```

### Animations Stuttering?
```tsx
// Ensure smooth rendering with:
const component = <FilingCheckerDashboard {...filingData} />

// If still slow, check:
// - Large issue lists (100+ items)
// - Heavy re-renders of parent
// - Browser developer tools for performance bottlenecks
```

## Next Steps

1. **Create API endpoints** using the guide in `API_ROUTES.md`
2. **Design your database schema** (provided in API_ROUTES.md)
3. **Implement data fetching** using FilingCheckerIntegration component
4. **Add user actions** (resolve, export, share, submit)
5. **Test thoroughly** across browsers and devices

## More Examples

See the demo component for more examples:

```tsx
import { FilingCheckerDemo } from '@/components/filing'

// Includes:
// - Mock data with 6 issues across jurisdictions
// - All callback implementations
// - Success notifications
// - Error handling
<FilingCheckerDemo />
```

## Utilities

Handy utility functions for calculations:

```typescript
import {
  estimateTimeToReady,      // Calculate time estimate
  calculateOverallScore,    // Get average score
  filterIssuesByJurisdiction, // Filter by CA/US/UK/EU
  countIssuesBySeverity,    // Count by severity level
  getRecommendedNextAction, // Get next step
} from '@/components/filing'

// Examples:
const timeEstimate = estimateTimeToReady(issues)
// Returns: "2 days", "4 hours", "1 week"

const overall = calculateOverallScore(scores)
// Returns: 71

const caIssues = filterIssuesByJurisdiction(issues, 'CA')
// Returns: issues only for Canada

const counts = countIssuesBySeverity(issues)
// Returns: { critical: 2, warning: 1, info: 3 }

const action = getRecommendedNextAction(issues, resolvedSet)
// Returns: "Resolve critical issue: Risk Factors incomplete"
```

## Testing

Quick test with demo data:

```bash
npm run dev
# Visit http://localhost:3000/filing/demo
```

The demo includes:
- 6 issues across CA/US jurisdictions
- Mixed severity levels
- Real-time resolution tracking
- Mock callbacks with notifications

## Support & Documentation

- **Full Component Docs**: See `README.md`
- **API Implementation**: See `API_ROUTES.md`
- **Type Definitions**: See `types.ts`
- **Utility Functions**: See `utils.ts`
- **Hook Documentation**: See `useFilingChecker.ts`

## Production Checklist

- [ ] API endpoints implemented and tested
- [ ] Database schema created and indexed
- [ ] User authentication/authorization added
- [ ] Error handling and logging configured
- [ ] PDF export working correctly
- [ ] Email sharing configured
- [ ] Audit trail logging in place
- [ ] Performance tested with 100+ issues
- [ ] Dark mode verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility audit passed
- [ ] Security review completed

## Questions?

Refer to the comprehensive documentation files:
1. `README.md` - Complete feature documentation
2. `API_ROUTES.md` - Backend implementation guide
3. `types.ts` - TypeScript type definitions
4. `utils.ts` - Utility function reference
5. `useFilingChecker.ts` - State management hook
