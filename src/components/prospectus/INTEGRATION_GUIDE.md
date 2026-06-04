# Prospectus Validator - Integration Guide

Complete guide for integrating the Prospectus Validator Dashboard into IPOReady applications.

## Quick Start (5 minutes)

### 1. Import the Component

```typescript
import { ProspectusValidatorDashboard } from '@/components/prospectus'
import { useState } from 'react'

export function MyProspectusPage() {
  const [sections, setSections] = useState([
    // Your section data here
  ])

  return (
    <ProspectusValidatorDashboard
      sections={sections}
      onSectionUpdate={(id, updates) => {
        setSections(s => s.map(sec => sec.id === id ? { ...sec, ...updates } : sec))
      }}
    />
  )
}
```

### 2. Prepare Your Data

Ensure your prospectus sections follow the `ProspectusSection` interface:

```typescript
const section: ProspectusSection = {
  id: 'executive-summary',
  name: 'Executive Summary',
  strength: 3.5,
  status: 'passable',
  issueCount: 2,
  gapCount: 1,
  completeness: 75,
  issues: [
    {
      id: 'issue-1',
      severity: 'moderate',
      description: 'Issue description',
      rootCause: 'Why this is happening',
      fixOptions: [{ id: 'fix-1', label: 'Fix option', checked: false }],
      guidance: 'Best practice guidance',
      exampleLink: 'https://...',
    },
  ],
  gaps: [
    {
      id: 'gap-1',
      category: 'Category',
      description: 'What is missing',
      required: true,
      status: 'open',
    },
  ],
}
```

### 3. (Optional) Use the Hook for Advanced State Management

```typescript
import { useProspectusValidator } from '@/components/prospectus'

export function MyProspectusPage() {
  const validator = useProspectusValidator(initialSections)

  return (
    <ProspectusValidatorDashboard
      sections={validator.sections}
      onSectionUpdate={validator.updateSection}
    />
  )
}
```

## Integration Patterns

### Pattern 1: Static Data

Best for: Viewing prospectus status, no save functionality needed

```typescript
export function ProspectusStatus() {
  const [sections] = useState(SAMPLE_SECTIONS)

  return <ProspectusValidatorDashboard sections={sections} />
}
```

### Pattern 2: Local State Management

Best for: Draft mode, temporary edits, save manually

```typescript
export function ProspectusEditor() {
  const [sections, setSections] = useState(initialSections)

  const handleSectionUpdate = (sectionId: string, updates: Partial<ProspectusSection>) => {
    setSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      )
    )
  }

  const handleSave = async () => {
    await fetch('/api/prospectus/save', {
      method: 'POST',
      body: JSON.stringify(sections),
    })
  }

  return (
    <>
      <ProspectusValidatorDashboard
        sections={sections}
        onSectionUpdate={handleSectionUpdate}
      />
      <button onClick={handleSave}>Save Changes</button>
    </>
  )
}
```

### Pattern 3: API-Backed with Real-Time Sync

Best for: Production, multi-user, persistent changes

```typescript
import { useProspectusValidator, useProspectusValidatorSync } from '@/components/prospectus'

export function ProspectusManager() {
  const [sections, setSections] = useState<ProspectusSection[]>([])

  // Load from API
  useEffect(() => {
    async function loadData() {
      const response = await fetch('/api/prospectus')
      const data = await response.json()
      setSections(data.sections)
    }
    loadData()
  }, [])

  const handleSectionUpdate = async (sectionId: string, updates: Partial<ProspectusSection>) => {
    // Optimistic update
    setSections(sections =>
      sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    )

    // Sync to server
    try {
      await fetch(`/api/prospectus/${sectionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error('Failed to sync:', error)
      // Optionally reload from server or show error toast
    }
  }

  return (
    <ProspectusValidatorDashboard
      sections={sections}
      onSectionUpdate={handleSectionUpdate}
    />
  )
}
```

### Pattern 4: With Advanced Hook Features

Best for: Complex apps with multiple features (filtering, recommendations, analytics)

```typescript
import { useProspectusValidator, useValidatorAnalytics } from '@/components/prospectus'

export function AdvancedProspectusValidator() {
  const validator = useProspectusValidator(initialSections)
  const analytics = useValidatorAnalytics()

  const handleResolveIssue = (sectionId: string, issueId: string) => {
    const issue = validator.getIssue(sectionId, issueId)
    validator.resolveIssue(sectionId, issueId)

    // Track in analytics
    if (issue) {
      analytics.trackIssueResolved(sectionId, issueId, issue.severity)
    }
  }

  return (
    <div>
      {/* Show recommendations */}
      {validator.recommendations.length > 0 && (
        <div className="alert">
          <h3>Recommendations</h3>
          <ul>
            {validator.recommendations.map(rec => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Show if ready for filing */}
      {validator.isProspectusReady && (
        <div className="success">Ready for filing!</div>
      )}

      {/* Main component */}
      <ProspectusValidatorDashboard
        sections={validator.sections}
        onSectionUpdate={validator.updateSection}
      />

      {/* Debug info */}
      <details>
        <summary>Stats</summary>
        <pre>{JSON.stringify(validator.stats, null, 2)}</pre>
      </details>
    </div>
  )
}
```

## API Integration

### Expected API Endpoints

```
GET /api/prospectus
  Returns: { sections: ProspectusSection[] }

GET /api/prospectus/:sectionId
  Returns: ProspectusSection

PUT /api/prospectus/:sectionId
  Body: Partial<ProspectusSection>
  Returns: ProspectusSection

POST /api/prospectus/:sectionId/issues/:issueId/resolve
  Returns: ProspectusSection

POST /api/prospectus/:sectionId/gaps/:gapId/resolve
  Returns: ProspectusSection
```

### Backend Implementation Example

```typescript
// pages/api/prospectus/[sectionId].ts
import { ProspectusSection } from '@/components/prospectus'

export default async function handler(req, res) {
  const { sectionId } = req.query

  if (req.method === 'GET') {
    // Fetch section from database
    const section = await db.prospectusSection.findById(sectionId)
    return res.json(section)
  }

  if (req.method === 'PUT') {
    // Update section in database
    const updated = await db.prospectusSection.update(sectionId, req.body)
    return res.json(updated)
  }

  res.status(405).end()
}
```

## Database Schema

### Example Prisma Schema

```prisma
model ProspectusSection {
  id           String   @id
  prospectusId String
  prospectus   Prospectus @relation(fields: [prospectusId], references: [id])

  name         String
  strength     Float
  status       String
  issueCount   Int
  gapCount     Int
  completeness Int

  issues       ProspectusIssue[]
  gaps         ProspectusGap[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([prospectusId, id])
}

model ProspectusIssue {
  id          String   @id
  sectionId   String
  section     ProspectusSection @relation(fields: [sectionId], references: [id])

  severity    String
  description String
  rootCause   String
  guidance    String
  exampleLink String?
  fixOptions  Json     // Array of FixOption

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProspectusGap {
  id          String   @id
  sectionId   String
  section     ProspectusSection @relation(fields: [sectionId], references: [id])

  category    String
  description String
  required    Boolean
  status      String   // 'open' | 'resolved'

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Styling Customization

The component uses Tailwind CSS with standard color utilities. To customize:

### Option 1: Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // Override severity colors
      issue: {
        critical: '#ef4444',
        moderate: '#f59e0b',
        minor: '#3b82f6',
      },
    },
  },
}
```

### Option 2: CSS Variables

Add to your global CSS:

```css
:root {
  --color-severity-critical: #ef4444;
  --color-severity-moderate: #f59e0b;
  --color-severity-minor: #3b82f6;
  --color-strength-weak: #ef4444;
  --color-strength-passable: #f59e0b;
  --color-strength-defendable: #84cc16;
  --color-strength-strong: #22c55e;
}
```

## Accessibility

The component is built with accessibility in mind:

- ✅ Semantic HTML (heading hierarchy, button elements)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Color + text (not relying on color alone)
- ✅ Focus indicators
- ✅ Reduced motion support (via Framer Motion)

For additional accessibility customization:

```typescript
<ProspectusValidatorDashboard
  sections={sections}
  onSectionUpdate={handleUpdate}
  // Future props for a11y customization
  // aria-label="Prospectus validator dashboard"
  // role="main"
/>
```

## Performance Optimization

### Memoization

The component uses `useMemo` for filtered sections and stats calculation. To optimize further:

```typescript
import { useMemo } from 'react'

// Memoize initial sections
const memoizedSections = useMemo(() => initialSections, [])

return (
  <ProspectusValidatorDashboard
    sections={memoizedSections}
    onSectionUpdate={handleUpdate}
  />
)
```

### Lazy Loading

For pages with multiple validators:

```typescript
import { lazy, Suspense } from 'react'

const ProspectusValidator = lazy(() =>
  import('@/components/prospectus').then(mod => ({
    default: mod.ProspectusValidatorDashboard,
  }))
)

export function MyPage() {
  return (
    <Suspense fallback={<div>Loading validator...</div>}>
      <ProspectusValidator sections={sections} />
    </Suspense>
  )
}
```

### Pagination

For very large prospectus files (100+ issues):

```typescript
const [page, setPage] = useState(0)
const itemsPerPage = 10
const paginatedIssues = issues.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

return (
  <>
    {paginatedIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
    <button onClick={() => setPage(p => p + 1)}>Next</button>
  </>
)
```

## Testing

### Unit Tests (Jest)

```typescript
import { getStrengthStatus, calculateCompletenessIncrease } from '@/components/prospectus'

describe('Prospectus Validator', () => {
  test('getStrengthStatus returns correct status', () => {
    expect(getStrengthStatus(1)).toBe('weak')
    expect(getStrengthStatus(2.5)).toBe('passable')
    expect(getStrengthStatus(4)).toBe('defendable')
    expect(getStrengthStatus(5)).toBe('strong')
  })

  test('calculateCompletenessIncrease works correctly', () => {
    const section = {
      // ... section data
      issues: [{}, {}, {}],
      gaps: [{}],
    }
    const increase = calculateCompletenessIncrease(section as any)
    expect(increase).toBeGreaterThan(0)
  })
})
```

### Integration Tests (React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ProspectusValidatorDashboard } from '@/components/prospectus'

describe('ProspectusValidatorDashboard', () => {
  test('renders all sections', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    mockSections.forEach(section => {
      expect(screen.getByText(section.name)).toBeInTheDocument()
    })
  })

  test('expands section on click', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    fireEvent.click(screen.getByText(mockSections[0].name))
    expect(screen.getByText('Completeness')).toBeInTheDocument()
  })

  test('calls onSectionUpdate when issue is resolved', async () => {
    const onUpdate = jest.fn()
    render(<ProspectusValidatorDashboard sections={mockSections} onSectionUpdate={onUpdate} />)
    // ... interact with component
    expect(onUpdate).toHaveBeenCalled()
  })
})
```

## Troubleshooting

### Component Not Rendering

Check:
1. `sections` prop is not empty
2. All required fields in `ProspectusSection` interface are present
3. No TypeScript errors preventing compilation

### Styles Not Applied

Check:
1. Tailwind CSS is properly configured
2. `tailwindcss` is in `package.json` dependencies
3. CSS file importing Tailwind directives
4. No conflicting CSS resets

### Performance Issues

Check:
1. Number of sections/issues (component supports 50+ sections)
2. Use React DevTools Profiler to identify bottlenecks
3. Memoize expensive computations
4. Consider virtual scrolling for 100+ items

### Animation Jank

Check:
1. `transform` and `opacity` are used (GPU-accelerated)
2. No heavy computations in animation callbacks
3. Framer Motion configuration is optimal
4. Reduce motion preference is respected

## Migration from Other Validators

### From Custom Validator V1

```typescript
// Old
<CustomValidatorV1
  prospectus={prospectus}
  onSave={handleSave}
/>

// New
<ProspectusValidatorDashboard
  sections={prospectus.sections.map(s => ({
    ...s,
    status: getStrengthStatus(s.strength),
  }))}
  onSectionUpdate={handleUpdate}
/>
```

## Future Enhancements

- [ ] Export to PDF functionality
- [ ] AI-powered issue suggestions
- [ ] Collaborative commenting
- [ ] Historical tracking
- [ ] Comparable IPO data integration
- [ ] Multi-language support

## Support

For issues or questions:
1. Check component README: `/src/components/prospectus/README.md`
2. Review examples: `/src/components/prospectus/ProspectusValidatorExample.tsx`
3. Check TypeScript types: `/src/components/prospectus/types.ts`
4. Review hooks: `/src/components/prospectus/useProspectusValidator.ts`
