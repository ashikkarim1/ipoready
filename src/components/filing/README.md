# Filing Checker Dashboard Component

A world-class React component for IPO/RTO filing readiness assessment, compliance tracking, and regulatory requirement management.

## Overview

The Filing Checker Dashboard provides a comprehensive UI for tracking IPO filing status across multiple jurisdictions, managing regulatory requirements, and monitoring progress toward filing readiness. It features real-time score calculations, interactive issue resolution tracking, and seamless animations.

## Features

### Core Capabilities

- **Real-time Status Assessment**: Automatic calculation of filing readiness status based on issue severity
- **Multi-Jurisdiction Support**: Regulatory requirements tracking for Canada (CSA), US (SEC), UK (FCA), and EU (ESMA)
- **Quality Scoring System**: Four-dimensional scoring (Completeness, Compliance, Quality, Cross-validation)
- **Interactive Issue Management**: Expand inline details, mark as resolved, upload documents, apply templates
- **Section Completeness Tracking**: Visual progress bars for each prospectus section
- **Estimated Time Calculation**: Dynamic time-to-ready estimates based on unresolved issues
- **Export & Sharing**: PDF export and email sharing of filing status
- **Audit Trail**: Complete history of changes and resolutions
- **Dark Mode Support**: Full dark theme implementation
- **Mobile Responsive**: Optimized for mobile, tablet, and desktop displays

### Visual Components

- **Status Card**: Color-coded filing status with issue count and overall score
- **Quality Score Chart**: Bar chart visualization of all score dimensions
- **Jurisdiction Progress Bars**: Per-jurisdiction compliance tracking with percentage indicators
- **Interactive Issue List**: Inline expandable issues with severity-based color coding
- **Section Completeness Grid**: Visual representation of section completion percentages
- **Recommended Action Panel**: Smart suggestion for next steps
- **Action Buttons**: PDF export, email sharing, full report view, ready-to-file submission

## Installation

The component is part of the IPOReady codebase. No additional installation needed.

```typescript
// Usage
import { FilingCheckerDashboard } from '@/components/filing'
```

## Props

### FilingCheckerDashboardProps

```typescript
interface FilingCheckerDashboardProps {
  // Required: Identifiers
  filingId: string              // Unique filing ID (e.g., "IPO-2024-001")
  exchangeId: string            // Stock exchange (e.g., "TSX", "NASDAQ")

  // Required: Status & Scores
  status: 'ready' | 'not_ready' | 'in_progress'
  completenessScore: number     // 0-100
  complianceScore: number       // 0-100
  qualityScore: number          // 0-100
  crossValidationScore: number  // 0-100

  // Required: Data Arrays
  issues: FilingIssue[]                    // Array of identified issues
  missingDocuments: MissingDocument[]      // Array of missing documents
  sections: Section[]                      // Array of prospectus sections

  // Optional: Callbacks
  onResolveIssue?: (issueId: string) => void | Promise<void>
  onExportPDF?: () => void | Promise<void>
  onShareStatus?: () => void | Promise<void>
  onReadyToFile?: () => void | Promise<void>
  onViewFullReport?: () => void | Promise<void>
}
```

### Data Type Definitions

#### FilingIssue

```typescript
interface FilingIssue {
  id: string                              // Unique identifier
  severity: 'critical' | 'warning' | 'info'
  category: string                        // e.g., "CA - Prospectus Section"
  description: string                     // Issue title
  requiredFix: string                     // Detailed fix description
  documentType?: string                   // Type of document needed
  resolved?: boolean                      // Resolution status
  priority?: number                       // 1-10 priority level
  detectedAt?: string                     // ISO timestamp
  resolvedAt?: string                     // ISO timestamp
  resolvedBy?: string                     // User who resolved
}
```

#### MissingDocument

```typescript
interface MissingDocument {
  docType: string                 // Document type
  required: boolean               // Required vs optional
  hasTemplate: boolean            // Template available
  templateUrl?: string            // URL to template
  examples?: string[]             // Example URLs
  estimatedHours?: number         // Prep time estimate
}
```

#### Section

```typescript
interface Section {
  name: string                    // Section name
  completeness: number            // 0-100 percentage
  issues: number                  // Outstanding issue count
  lastUpdated?: string            // ISO timestamp
  lastEditedBy?: string           // User who edited
}
```

## Usage Examples

### Basic Usage

```tsx
import { FilingCheckerDashboard } from '@/components/filing'

export function FilingPage() {
  const filingData = {
    filingId: 'IPO-2024-001',
    exchangeId: 'TSX',
    status: 'not_ready' as const,
    completenessScore: 72,
    complianceScore: 65,
    qualityScore: 78,
    crossValidationScore: 71,
    issues: [
      {
        id: 'iss-001',
        severity: 'critical',
        category: 'CA - Prospectus Section',
        description: 'Risk Factors incomplete',
        requiredFix: 'Provide comprehensive risk factor analysis...',
        documentType: 'Risk Factors Document',
      },
      // ... more issues
    ],
    missingDocuments: [
      {
        docType: 'Auditor Consent Letter',
        required: true,
        hasTemplate: false,
      },
      // ... more documents
    ],
    sections: [
      { name: 'Company Overview', completeness: 95, issues: 0 },
      { name: 'Risk Factors', completeness: 45, issues: 3 },
      // ... more sections
    ],
  }

  return <FilingCheckerDashboard {...filingData} />
}
```

### With Callbacks

```tsx
async function handleResolveIssue(issueId: string) {
  const response = await fetch('/api/filings/issues/resolve', {
    method: 'POST',
    body: JSON.stringify({ issueId }),
  })
  if (response.ok) {
    // Refetch or update state
  }
}

function handleExportPDF() {
  // Generate PDF and trigger download
  window.location.href = '/api/filings/export-pdf?filingId=IPO-2024-001'
}

<FilingCheckerDashboard
  {...filingData}
  onResolveIssue={handleResolveIssue}
  onExportPDF={handleExportPDF}
  onShareStatus={() => window.alert('Share email sent!')}
  onReadyToFile={() => router.push('/filing/submit')}
  onViewFullReport={() => router.push('/filing/full-report')}
/>
```

### Using the Hook

```tsx
import { useFilingChecker } from '@/components/filing'

function FilingManager() {
  const {
    expandedIssues,
    resolvedIssues,
    currentStatus,
    overallScore,
    toggleIssueExpanded,
    toggleIssueResolved,
  } = useFilingChecker({
    initialIssues: filingData.issues,
    completenessScore: 72,
    complianceScore: 65,
    qualityScore: 78,
    crossValidationScore: 71,
  })

  return (
    // Use state and actions for custom UI
  )
}
```

## Styling & Theming

### Design System Integration

The component uses IPOReady's design system:

- **Primary Red**: `#E8312A` (for critical status and CTAs)
- **Background**: `#F7F6F4` (beige/warm gray)
- **Success Green**: `#2D7A5F` (for completed items)
- **Warning Amber**: `#B45309` (for warnings)
- **Error Red**: `#DC2626` (for critical issues)

### Color Coding

- **Green** (`#2D7A5F`): Complete, resolved, ready
- **Amber** (`#B45309`): In progress, warning, needs attention
- **Red** (`#DC2626` / `#E8312A`): Critical, not ready, error

### Dark Mode

Full dark mode support is built-in. The component automatically adapts to dark theme using Tailwind's `dark:` variants.

```css
/* Automatic dark mode */
@media (prefers-color-scheme: dark) {
  /* Component adapts automatically */
}
```

## Utility Functions

### Time Estimation

```typescript
import { estimateTimeToReady } from '@/components/filing'

const estimate = estimateTimeToReady(unResolvedIssues)
// Returns: "2 days", "4 hours", "1 week", etc.
```

### Status Determination

```typescript
import { determineFilingStatus } from '@/components/filing'

const status = determineFilingStatus(criticalCount, warningCount)
// Returns: 'ready' | 'not_ready' | 'in_progress'
```

### Issue Filtering

```typescript
import { filterIssuesByJurisdiction, groupIssuesByJurisdiction } from '@/components/filing'

const caIssues = filterIssuesByJurisdiction(allIssues, 'CA')
const grouped = groupIssuesByJurisdiction(allIssues)
// grouped.CA, grouped.US, grouped.UK, grouped.EU
```

### Score Calculations

```typescript
import { calculateOverallScore, calculateFilingProgress } from '@/components/filing'

const overall = calculateOverallScore({
  completeness: 72,
  compliance: 65,
  quality: 78,
  crossValidation: 71,
})
// Returns: 71

const progress = calculateFilingProgress(scores)
// Returns: 71
```

## Interactions

### Issue Expansion

Click on any issue to expand inline details:
- Issue description and category
- What needs to be fixed
- Action buttons for uploading documents, using templates, viewing examples
- Real-time expansion/collapse animation

### Issue Resolution

Click the checkbox to mark an issue as resolved:
- Real-time score updates
- Status change detection
- Visual feedback (green background)
- Unresolved count decreases

### Quality Score Progress

Animated progress bars show:
- Completeness: Percentage of required sections filled
- Compliance: Adherence to regulatory requirements
- Quality: Quality of disclosures and documentation
- Cross-validation: Consistency across documents

### Jurisdiction Progress

Per-jurisdiction progress bars show:
- Number of requirements met vs. total
- Percentage completion
- Color-coded status
- Expandable jurisdiction sections

## Performance Considerations

- **Memoization**: Uses `useMemo` and `useCallback` to prevent unnecessary re-renders
- **Lazy Animation**: Animations are optimized with staggered delays
- **Recharts**: Efficient chart rendering with ResponsiveContainer
- **Framer Motion**: GPU-accelerated animations for smooth interactions

## Accessibility

- **Semantic HTML**: Proper heading hierarchy and ARIA roles
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: WCAG AAA compliant color combinations
- **Screen Reader**: Proper labels and descriptions
- **Focus Indicators**: Visible focus states for all buttons

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Dependencies

```json
{
  "framer-motion": "^12.40.0",
  "recharts": "^3.8.1",
  "lucide-react": "^1.16.0",
  "tailwindcss": "^4.3.0"
}
```

## Testing

### Demo Component

A demo component is provided with mock data:

```tsx
import { FilingCheckerDemo } from '@/components/filing'

// In your test/demo page
<FilingCheckerDemo />
```

### Unit Tests

Example test structure:

```typescript
describe('FilingCheckerDashboard', () => {
  it('should render with correct status', () => {
    // Test implementation
  })

  it('should expand/collapse issues', () => {
    // Test implementation
  })

  it('should update scores when issues are resolved', () => {
    // Test implementation
  })
})
```

## Future Enhancements

- [ ] PDF generation with detailed compliance report
- [ ] Email integration for status sharing
- [ ] Comparison with industry benchmarks
- [ ] Multi-user collaboration features
- [ ] Audit trail visualization
- [ ] Custom scoring rules per jurisdiction
- [ ] Integration with document management system
- [ ] Predictive analytics for time-to-ready
- [ ] Automated issue detection from uploaded documents
- [ ] Real-time collaboration with comments

## Troubleshooting

### Issues Not Expanding

Ensure the `expandedIssues` state is being managed correctly by the hook or component state.

### Scores Not Updating

Verify that the score props are numeric values between 0-100. Use `validateFilingData()` utility to check data integrity.

### Dark Mode Not Working

Check that Tailwind's dark mode is enabled in your `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

### Animations Not Smooth

Ensure Framer Motion is properly installed and that GPU acceleration is enabled in browser settings.

## Contributing

When contributing to this component:

1. Follow the existing component structure
2. Add proper TypeScript types
3. Include comprehensive JSDoc comments
4. Test across light/dark modes
5. Verify mobile responsiveness
6. Update this README with new features

## Support

For issues or questions:
- Check the demo component for usage examples
- Review the types file for data structure requirements
- Run utility function tests to verify calculations
- Consult the utilities file for helper functions

## License

Part of IPOReady. All rights reserved.
