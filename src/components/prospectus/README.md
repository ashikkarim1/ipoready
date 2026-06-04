# Prospectus Validator Dashboard

A world-class, flight-dashboard-style UI component for validating and improving prospectus quality. This component provides comprehensive visualization and management of prospectus sections with quality indicators, issue tracking, and gap identification.

## Features

### 1. **Visual Design**
- **Circular Strength Gauges**: Each section displays a 1-5 strength rating using animated circular gauges
  - Weak (1): Red
  - Passable (2-3): Yellow
  - Defendable (4): Light Green
  - Strong (5): Green with checkmark
- **Color-Coded Status Badges**: Visual indicators for issues (🔴), gaps (🟡), and completeness (🟢)
- **Responsive Grid Layout**: Adapts from single column on mobile to 2-column grid on desktop
- **Smooth Animations**: Framer Motion animations for gauge transitions, section expansion, and staggered card appearance

### 2. **Section Cards**
Each prospectus section displays:
- **Strength Gauge**: Circular visual showing 1-5 rating
- **Status Badge**: Color-coded quality indicator with issue/gap counts
- **Completeness Progress Bar**: Animated bar showing section completion percentage
- **Expandable Details**: Click to view issues, gaps, and fix options

Supported sections:
- Executive Summary
- Risk Factors
- Use of Proceeds
- Management & Board
- Financial Disclosure & Analysis
- Market & Competitive Analysis
- Capitalization & Ownership

### 3. **Issue Management**
Each issue includes:
- **Severity Indicator**: Critical (🔴), Moderate (🟡), or Minor (🔵)
- **Description**: Clear problem statement
- **Root Cause**: Explanation of why this is an issue
- **Fix Options**: Checkbox list of actionable remedies
- **Guidance**: Best practice text with industry benchmarks
- **Example Links**: Links to comparable prospectuses or guidance docs
- **Mark Resolved**: Click to remove issue and update section strength

### 4. **Gap Tracking**
Gap items show:
- **Category**: Type of missing element
- **Description**: What's missing
- **Required Flag**: Indicates if gap is mandatory
- **Status**: Open or Resolved

### 5. **Overall Summary**
Dashboard-level view showing:
- **Aggregate Strength**: Average strength across all sections
- **Total Issues**: Count of all critical, moderate, and minor issues
- **Total Gaps**: Count of open gaps
- **Overall Completeness**: Weighted average completion percentage
- **Completion Breakdown**: Donut chart showing sections by completion status
- **Smart Recommendations**: AI-generated guidance based on strength level

### 6. **Interactive Features**
- **Severity Filtering**: Filter sections to show only critical/moderate/minor issues
- **Real-Time Updates**: Resolving issues immediately updates gauges and completion percentages
- **Expandable Issues**: Click issue cards to reveal root cause, fix options, and guidance
- **Smart Animations**: Smooth transitions for all interactions

## Data Structure

### ProspectusSection
```typescript
interface ProspectusSection {
  id: string                  // Unique identifier
  name: string               // Section title
  strength: number           // 1-5 rating
  status: StrengthStatus     // 'weak' | 'passable' | 'defendable' | 'strong'
  issueCount: number         // Total issues in section
  gapCount: number           // Total gaps in section
  completeness: number       // 0-100 percentage
  issues: Issue[]            // Array of issues
  gaps: Gap[]                // Array of gaps
}
```

### Issue
```typescript
interface Issue {
  id: string
  severity: 'critical' | 'moderate' | 'minor'
  description: string        // What's wrong
  rootCause: string         // Why it's wrong
  fixOptions: Array<{       // Actionable remedies
    id: string
    label: string
    checked: boolean
  }>
  guidance: string          // Best practice guidance with benchmarks
  exampleLink?: string      // Link to example or guidance doc
}
```

### Gap
```typescript
interface Gap {
  id: string
  category: string          // Type of gap
  description: string       // What's missing
  required: boolean         // Is this mandatory?
  status: 'open' | 'resolved'
}
```

## Usage

### Basic Implementation

```typescript
import { ProspectusValidatorDashboard, ProspectusSection } from '@/components/prospectus/ProspectusValidatorDashboard'
import { useState } from 'react'

export function ProspectusPage() {
  const [sections, setSections] = useState<ProspectusSection[]>([
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      strength: 3.5,
      status: 'passable',
      issueCount: 2,
      gapCount: 1,
      completeness: 75,
      issues: [
        {
          id: 'exec-1',
          severity: 'moderate',
          description: 'Investment highlights lack quantifiable metrics',
          rootCause: 'Uses vague language without specific percentages',
          fixOptions: [
            { id: 'f1', label: 'Add 15-25% YoY growth targets', checked: false },
          ],
          guidance: 'Comparable IPOs cite 15-25% YoY growth.',
          exampleLink: 'https://example.com',
        },
      ],
      gaps: [
        {
          id: 'g1',
          category: 'Market Opportunity',
          description: 'TAM analysis not included',
          required: true,
          status: 'open',
        },
      ],
    },
    // ... more sections
  ])

  const handleSectionUpdate = (sectionId: string, updates: Partial<ProspectusSection>) => {
    setSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      )
    )
  }

  return (
    <ProspectusValidatorDashboard
      sections={sections}
      onSectionUpdate={handleSectionUpdate}
    />
  )
}
```

### Integration with API

```typescript
// Fetch sections from backend
const [sections, setSections] = useState<ProspectusSection[]>([])

useEffect(() => {
  async function loadProspectusData() {
    const response = await fetch('/api/prospectus/validator')
    const data = await response.json()
    setSections(data.sections)
  }
  loadProspectusData()
}, [])

// Send updates when user resolves issues
const handleSectionUpdate = async (sectionId: string, updates: Partial<ProspectusSection>) => {
  await fetch(`/api/prospectus/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  // Update local state
  setSections(sections =>
    sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
  )
}
```

## Component Hierarchy

```
ProspectusValidatorDashboard
├── OverallSummary
│   ├── StrengthGauge
│   └── PieChart (Recharts)
├── Filter Bar
└── Section Cards Grid
    └── SectionCard (repeating)
        ├── StrengthGauge
        ├── StatusBadge
        ├── Details (Expandable)
        │   ├── Completeness Progress Bar
        │   ├── Issues List
        │   │   └── IssueCard (repeating)
        │   │       ├── Severity Indicator
        │   │       ├── Expandable Details
        │   │       │   ├── Root Cause
        │   │       │   ├── Fix Options
        │   │       │   └── Guidance
        │   │       └── Action Buttons
        │   ├── Gaps List
        │   └── Action Buttons
```

## Styling & Theming

The component uses:
- **Tailwind CSS**: Core styling with responsive utilities
- **Color Scheme**:
  - Weak: Red (#ef4444)
  - Passable: Amber (#f59e0b)
  - Defendable: Lime (#84cc16)
  - Strong: Green (#22c55e)
- **Light Mode**: Default styling with gray backgrounds
- **Dark Mode**: Automatically adapts via Tailwind dark mode
- **Spacing**: 4px base unit (consistent with IPOReady design system)

## Animations

- **Gauge Fills**: 0.6s easeOut cubic-bezier
- **Section Expand/Collapse**: 0.3s height animation
- **Issue Expand/Collapse**: 0.2s height animation
- **Progress Bar Fill**: 0.6s easeOut cubic-bezier
- **Card Stagger**: 0.1s delay between cards
- **Initial Load**: Opacity + Y-axis translation fade-in

## Performance Considerations

- **Memoization**: Uses `useMemo` for filtered sections to prevent unnecessary re-renders
- **Lazy Rendering**: Expandable details only render when expanded
- **Optimized Animations**: Framer Motion uses GPU acceleration
- **Responsive Images**: No images in this component
- **Bundle Size**: ~8KB minified (component only, excludes dependencies)

## Accessibility

- **Semantic HTML**: Proper heading hierarchy and button elements
- **ARIA Labels**: Status badges include descriptive text
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color + Symbols**: Doesn't rely on color alone (uses icons and text)
- **Focus States**: Clear focus indicators on interactive elements

## Example Data

See `ProspectusValidatorExample.tsx` for a complete example with realistic prospectus data including:
- Executive Summary with vague metrics issue
- Risk Factors with critical customer concentration and regulatory issues
- Use of Proceeds with specific allocation tracking
- Management & Board (strong section as example)
- Financial Disclosure with EBITDA reconciliation issue
- Market Analysis with sourcing concern
- Capitalization with warrant disclosure gap

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Dependencies

- `react` ^18.0
- `framer-motion` ^12.0
- `recharts` ^3.0
- `lucide-react` ^latest (for icons)
- `tailwindcss` ^4.0

## Future Enhancements

- [ ] Export to PDF with strength scores and recommendations
- [ ] AI-powered issue suggestions based on section content
- [ ] Multi-user collaboration with comment threading
- [ ] Historical tracking of section strength over time
- [ ] Comparable IPO data integration for benchmarking
- [ ] Integration with prospectus auto-builder for auto-fixes
- [ ] Batch issue resolution workflow
- [ ] Role-based view permissions (investor, legal, board)
