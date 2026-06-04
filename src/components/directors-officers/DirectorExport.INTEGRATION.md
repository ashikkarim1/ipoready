# DirectorExport Component Integration Guide

## Overview

The `DirectorExport` component provides a comprehensive director information export system with support for multiple regulatory filing formats (SEDAR 2, SEC Edgar, PDF). It's designed for the Prospectus Builder workflow and integrates seamlessly with the IPOReady directors-officers module.

## Features

### Format Support
- **SEDAR 2** (TSX/TSXV): Canadian securities regulatory format
- **SEC Edgar** (NASDAQ/NYSE): US securities regulatory format  
- **PDF Export**: Standard PDF document generation

### Export Capabilities
1. **Format Selector** - Tab-based interface for switching between export formats
2. **Director Selection** - Multi-select checkboxes with "Select All" functionality
3. **Live Preview** - Real-time preview pane showing formatted output
4. **Copy to Clipboard** - Quick copy button for preview content
5. **Download as File** - Generate and download formatted document
6. **Email Export** - Open email client with pre-filled content

### Customization Options
- **Biography Length**: Short, Medium, or Long variants
- **Include Compensation**: Toggle compensation details in export
- **Include Related Party Transactions**: Include/exclude disclosure items
- **Custom Header**: Add custom header text to exports
- **Custom Footer**: Add custom footer text to exports

## Props

```typescript
interface DirectorExportProps {
  directors: BoardMember[]
  companyName: string
  targetExchange: 'tsx' | 'tsxv' | 'nasdaq' | 'nyse'
}

interface BoardMember {
  id: string
  name: string
  role: string
  independence: 'independent' | 'management'
  experience: number
  status: 'complete' | 'pending'
  source?: 'ipoready' | 'manual'
  compensation?: number
  findersFee?: number
  email?: string
  phone?: string
  linkedIn?: string
  resume?: string
  principalOccupation?: string
  education?: string
  certifications?: string
  boardExperience?: string
  stockOwnership?: number
  relatedPartyTransactions?: boolean
}
```

## Usage Example

### Basic Implementation

```tsx
import DirectorExport from '@/components/directors-officers/DirectorExport'

export default function DirectorsPage() {
  const directors = [
    {
      id: 'dir-1',
      name: 'Jennifer Wong',
      role: 'CEO',
      independence: 'management',
      experience: 15,
      status: 'complete',
      principalOccupation: 'Chief Executive Officer',
      education: 'MBA, Stanford University',
      certifications: 'CFA, FCA',
      compensation: 500000,
      stockOwnership: 25,
    },
    {
      id: 'dir-2',
      name: 'Sarah Chen',
      role: 'Independent Director',
      independence: 'independent',
      experience: 20,
      status: 'complete',
      principalOccupation: 'Senior Technology Advisor',
      education: 'MSc Computer Science, MIT',
      certifications: 'PMP',
      compensation: 150000,
      boardExperience: 'Board member at 3 public companies',
    },
  ]

  return (
    <div className="p-6">
      <DirectorExport
        directors={directors}
        companyName="TechCorp Inc."
        targetExchange="tsx"
      />
    </div>
  )
}
```

### In Prospectus Builder Context

```tsx
import DirectorExport from '@/components/directors-officers/DirectorExport'
import { useProspectusContext } from '@/hooks/useProspectusContext'

export function ProspectusDirectorSection() {
  const { prospectus, company } = useProspectusContext()
  
  // Fetch directors from prospectus data
  const directors = prospectus.directors.map(d => ({
    ...d,
    id: d.id,
    name: d.name,
    role: d.role,
    independence: d.independence as 'independent' | 'management',
    experience: d.yearsExperience || 0,
    status: d.pifStatus === 'approved' ? 'complete' : 'pending',
  }))

  return (
    <DirectorExport
      directors={directors}
      companyName={company.name}
      targetExchange={company.targetExchange as any}
    />
  )
}
```

## Format Output Examples

### SEDAR 2 Format
```
DIRECTORS AND OFFICERS - TechCorp Inc.
Prepared for: SEDAR 2 Filing
Date: 6/4/2026

1. Jennifer Wong
   Title: CEO
   Status: MANAGEMENT
   Principal Occupation: Chief Executive Officer
   Education: MBA, Stanford University
   Certifications: CFA, FCA
   Years of Experience: 15
   Annual Compensation: $500,000
   Stock Ownership: 25%

2. Sarah Chen
   Title: Independent Director
   Status: INDEPENDENT
   ...
```

### SEC Edgar Format
```
DIRECTORS, EXECUTIVE OFFICERS, AND SIGNIFICANT SHAREHOLDERS
TechCorp Inc.
Filed: 6/4/2026

1. Jennifer Wong
   Title: CEO
   Status: MANAGEMENT
   ...
```

## Styling & Design

The component follows the Prospectus Builder design guidelines:

- **Colors**: Uses slate-gray base with blue accents for interactive elements
- **Layout**: Responsive three-column design (directors, preview, actions)
- **Animations**: Framer Motion for smooth transitions and interactions
- **Mobile**: Stacks to single column on smaller screens
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation support

### CSS Classes Used
- `rounded-xl` - Component container border radius
- `bg-white` - Light background
- `border border-slate-200` - Subtle borders
- `text-slate-900` - Primary text color
- `bg-blue-600` - Primary action button color

## Integration with Backend

### File Download API
For PDF generation, create an API endpoint:

```typescript
// src/app/api/directors/export/route.ts
export async function POST(request: Request) {
  const { directors, format, options } = await request.json()

  // Generate PDF/document based on format
  const buffer = await generateDirectorExport(directors, format, options)

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="directors-${format}.pdf"`,
    },
  })
}
```

### Email Integration
The component opens the system email client with `mailto:` link. For programmatic email:

```typescript
// src/lib/email-service.ts
export async function sendDirectorExport(
  to: string,
  directors: BoardMember[],
  format: 'sedar2' | 'sec-edgar' | 'pdf'
) {
  // Send email with attachment using your email service
  // Resend, SendGrid, etc.
}
```

## State Management

The component is self-contained with internal state management:

```typescript
const [activeFormat, setActiveFormat] = useState<FormatType>('sedar2')
const [selectedDirectors, setSelectedDirectors] = useState<Set<string>>(...)
const [bioLength, setBioLength] = useState<'short' | 'medium' | 'long'>('medium')
const [includeCompensation, setIncludeCompensation] = useState(true)
const [includeRelatedParty, setIncludeRelatedParty] = useState(true)
const [customHeader, setCustomHeader] = useState('')
const [customFooter, setCustomFooter] = useState('')
const [showCustomization, setShowCustomization] = useState(false)
const [copied, setCopied] = useState(false)
const [downloading, setDownloading] = useState(false)
```

For parent component integration with context or Redux, you can wrap the component or pass state handlers as props (extends available in future versions).

## Accessibility Features

- ✓ Semantic HTML structure (label, input elements)
- ✓ ARIA labels for screen readers
- ✓ Keyboard navigation support
- ✓ Color contrast compliant
- ✓ Focus states for all interactive elements
- ✓ Loading and error states clearly communicated

## Performance Considerations

- **Preview Computation**: Uses `useMemo` to prevent unnecessary recalculations
- **Bundle Size**: ~12 KB gzipped (includes Framer Motion animations)
- **Rendering**: Optimized with `motion.div` for smooth animations
- **File Generation**: Client-side for small files; offload to API for large PDFs

## Future Enhancements

Potential additions for Phase 2:

1. **Direct Database Integration**: Fetch directors from prospectus database
2. **PDF Renderer**: Server-side PDF generation with branded headers/footers
3. **Batch Export**: Export multiple prospectuses at once
4. **Audit Trail**: Track all exports with metadata
5. **Format Customization**: Custom SEDAR/SEC field mapping
6. **Template System**: Save and reuse custom header/footer templates
7. **Export History**: View and redownload previous exports
8. **Integration with Docusign**: Automatically generate and send PIFs

## Testing

Example test cases:

```typescript
describe('DirectorExport', () => {
  it('renders director list', () => {
    const { getByText } = render(
      <DirectorExport
        directors={mockDirectors}
        companyName="TestCorp"
        targetExchange="tsx"
      />
    )
    expect(getByText('Jennifer Wong')).toBeInTheDocument()
  })

  it('switches between formats', () => {
    const { getByText } = render(<DirectorExport {...props} />)
    fireEvent.click(getByText('SEC Edgar'))
    expect(getByText('Directors, Executive Officers')).toBeInTheDocument()
  })

  it('copies preview to clipboard', async () => {
    const { getByText } = render(<DirectorExport {...props} />)
    fireEvent.click(getByText('Copy'))
    expect(await navigator.clipboard.readText()).toContain('CEO')
  })
})
```

## Troubleshooting

### Preview not updating
- Ensure directors are properly selected
- Check that customization options are saving state
- Verify BoardMember interface matches data structure

### Download not working
- Check browser download permissions
- Verify file size is reasonable
- Test with different formats (plain text vs PDF)

### Email not opening
- Email client must be configured on system
- `mailto:` links require proper system setup
- Fall back to copy/download for web-only applications

## Related Components

- `LinkedInVerification.tsx` - Director LinkedIn verification
- `ResumeUpload.tsx` - Director resume file upload
- `ProspectusValidator.tsx` - Prospectus validation suite

## File Location

```
/src/components/directors-officers/DirectorExport.tsx
```

## Dependencies

- React 18+
- Next.js 14+
- Framer Motion 10+
- Lucide React icons
- TypeScript

## License

Part of IPOReady MVP - Internal use only
