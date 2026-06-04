# Filing Documents UI Components

Complete React component suite for managing IPO filing documents with status tracking, progress visualization, and document preview capabilities.

## Quick Start

```tsx
import { DocumentChecklist } from '@/components/filing-documents'

export default function FilingPage() {
  return (
    <DocumentChecklist
      exchange="TSX"
      companyId="company-123"
      documents={[
        {
          id: '1',
          name: 'Financial Statements',
          description: 'Audited financials',
          category: 'Financial',
          status: 'not_started',
          isRequired: true,
          estimatedDays: 14,
        },
        // ... more documents
      ]}
      onUpload={(docId, file) => console.log('Upload:', docId, file)}
      onDelete={(docId) => console.log('Delete:', docId)}
    />
  )
}
```

## Components

### 1. DocumentChecklist
**Main orchestrator component** - Combines all sub-components into a complete filing documents interface.

- Responsive 3-column layout (content + sidebar on desktop)
- Integrated progress tracking
- Category filtering
- Document management
- Summary statistics

### 2. DocumentCard
**Individual document display** - Shows a single document with upload zone and actions.

**Features:**
- Drag-and-drop upload zone
- 5-state status system with color badges
- View/Download/Delete actions
- Template and guide links
- Collapsible checklist preview

**Status Colors:**
- `not_started` - Gray (upload zone visible)
- `in_progress` - Amber/Yellow (upload zone visible)
- `ready` - Blue (ready for review)
- `uploaded` - Green (file uploaded)
- `verified` - Dark Green (verified)

### 3. CategoryFilter
**Sidebar filter component** - Organize documents by category.

- "All Documents" button
- Category buttons with completion counts
- Status legend with color indicators
- Responsive button layout

**Built-in Categories:**
- Financial
- Legal
- Governance
- Corporate
- Compliance

### 4. ProgressTracker
**Progress visualization** - Overall and category-specific progress bars.

**Displays:**
- Overall completion percentage
- Category-by-category breakdown
- Milestone tracking (Started → Half Complete → All Complete)
- Estimated days remaining

### 5. DocumentPreview
**Modal preview component** - View, download, and delete uploaded documents.

**Supports:**
- PDF preview (via iframe)
- Image preview
- File metadata (size, upload date, uploader)
- Fallback for unsupported file types

## File Structure

```
filing-documents/
├── DocumentCard.tsx           # Individual document card
├── CategoryFilter.tsx         # Category filter sidebar
├── ProgressTracker.tsx        # Progress bars & milestones
├── DocumentPreview.tsx        # Modal for viewing documents
├── DocumentChecklist.tsx      # Main orchestrator component
├── index.ts                   # Barrel export
├── USAGE.md                   # Detailed API reference
├── EXAMPLE_USAGE.tsx          # Complete integration example
└── README.md                  # This file
```

## Design System

All components use the Prospectus Builder design system colors and typography:

### Colors
```css
--color-accent:        #E8312A  /* Red - CTAs */
--color-success:       #2D7A5F  /* Green - Verified/Complete */
--color-warning:       #B45309  /* Amber - In Progress */
--color-info:          #1D4ED8  /* Blue - Ready */
--color-bg-primary:    #F7F6F4  /* Beige - Page background */
--color-surface:       #FFFFFF  /* White - Card background */
--color-text-primary:  #1A1A1A  /* Dark - Primary text */
--color-text-secondary: #717171 /* Gray - Secondary text */
```

### Typography
- **Headings:** `.h1`, `.h2`, `.h3`, `.h4` (Hanken Grotesk)
- **Body:** `.body`, `.body-sm` (Hanken Grotesk)
- **Labels:** `.label`, `.label-sm`, `.label-xs` (Hanken Grotesk)
- **Captions:** `.caption`, `.caption-sm` (Hanken Grotesk)

### Spacing
- Card padding: `1.5rem` (24px)
- Border radius: `16px` (cards), `8px` (buttons)
- Gap/margins follow 4px scale (4, 8, 12, 16, 24, 32px)

## API Reference

### DocumentChecklist Props

```tsx
interface DocumentChecklistProps {
  exchange: string                  // Exchange name (TSX, NASDAQ, etc.)
  companyId: string                 // Company identifier
  documents: DocumentItem[]         // Array of documents
  onUpload: (docId, file) => void   // Upload handler
  onDelete?: (docId) => void        // Delete handler
  onViewDocument?: (docId) => void  // View/preview handler
  title?: string                    // Page title
  subtitle?: string                 // Page subtitle
}
```

### DocumentItem Type

```tsx
interface DocumentItem {
  id: string                   // Unique identifier
  name: string                 // Document name
  description: string          // Description
  category: string             // Category (Financial, Legal, etc.)
  status: DocumentStatus       // Status: not_started | in_progress | ready | uploaded | verified
  isRequired: boolean          // Required flag
  estimatedDays?: number       // Estimated days to complete
  uploadedDate?: string        // Upload date (e.g., "June 1, 2026")
  uploadedBy?: string          // Name of uploader
  templateUrl?: string         // URL to download template
  guideUrl?: string            // URL to view guide
  fileUrl?: string             // URL to uploaded file
  fileSize?: string            // File size (e.g., "2.4 MB")
  checklistItems?: string[]    // Checklist items
}
```

## Integration Examples

### Basic Usage
```tsx
import { DocumentChecklist } from '@/components/filing-documents'

const documents = [
  {
    id: '1',
    name: 'Balance Sheet',
    description: 'Audited balance sheet',
    category: 'Financial',
    status: 'not_started',
    isRequired: true,
    estimatedDays: 7,
  },
]

export default function Page() {
  return (
    <DocumentChecklist
      exchange="TSX"
      companyId="acme-corp"
      documents={documents}
      onUpload={(docId, file) => {
        // Handle upload to backend
        console.log(`Upload ${file.name} for ${docId}`)
      }}
      onDelete={(docId) => {
        // Handle deletion from backend
        console.log(`Delete ${docId}`)
      }}
    />
  )
}
```

### With Real Backend Integration
```tsx
export default function FilingDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch documents from backend
    fetchDocuments().then(setDocuments).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (docId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`/api/documents/${docId}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      // Update local state
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === docId
            ? { ...doc, status: 'uploaded', uploadedDate: new Date().toLocaleDateString() }
            : doc
        )
      )
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <DocumentChecklist
      exchange="TSX"
      companyId="company-id"
      documents={documents}
      onUpload={handleUpload}
      onDelete={(docId) => fetch(`/api/documents/${docId}`, { method: 'DELETE' })}
    />
  )
}
```

## Features

### Drag-and-Drop Upload
- Click or drag-and-drop to upload files
- Visual feedback during drag
- File type validation (PDF, DOCX, images)

### Status Management
- 5-state system: not_started → in_progress → ready → uploaded → verified
- Color-coded badges with icons
- Estimated completion time
- Progress bars for each status

### Progress Tracking
- Overall completion percentage
- Category-by-category progress
- Milestone tracking
- Days remaining estimate

### Filtering & Organization
- Category-based filtering
- "All Documents" view
- Completion count display
- Status legend

### Document Preview
- PDF preview (iframe)
- Image preview
- File metadata
- Download and delete options
- Fallback for unsupported formats

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Color contrast (WCAG AA)
- Screen reader support

## Customization

### Changing Colors
Edit the color values in `globals.css`:
```css
--color-accent: #E8312A;        /* CTA buttons */
--color-success: #2D7A5F;       /* Verified state */
--color-warning: #B45309;       /* In progress */
--color-info: #1D4ED8;          /* Ready state */
```

### Adding Categories
Simply use new category names in your documents - they'll automatically appear:
```tsx
{
  category: 'Custom Category Name',  // Automatically added to filters
  // ... rest of document
}
```

### Styling with Tailwind
All components use Tailwind CSS classes for easy customization. Override in your CSS:

```css
/* Example: Change card border radius */
.card {
  border-radius: 12px; /* Instead of 16px */
}
```

## Performance

### Bundle Size
- Source: ~33 KB TypeScript
- Compiled: ~12-15 KB minified + gzipped
- No external dependencies (uses lucide-react from project)

### Optimization
- Memoized category calculations
- Filtered document lists
- Lazy progress calculations
- Modal only renders when needed

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Sidebar below main content
- Full-width buttons
- Collapsible sections

### Tablet (768px - 1023px)
- Stacked layout
- Sidebar below content
- Flexible grid

### Desktop (1024px+)
- 2-column grid (2:1 ratio)
- Sidebar on right
- Optimal spacing

## TypeScript Support

Full TypeScript support with proper types:
```tsx
import { DocumentChecklist, DocumentItem } from '@/components/filing-documents'

// Type-safe props
const doc: DocumentItem = {
  // ... properties
}

// Full IDE autocomplete
<DocumentChecklist
  documents={[doc]}
  onUpload={(docId, file) => {/* ... */}}
/>
```

## Testing

### Unit Test Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentCard } from '@/components/filing-documents'

test('displays document name', () => {
  render(
    <DocumentCard
      id="1"
      name="Test Document"
      description="Test"
      category="Financial"
      status="not_started"
      isRequired={true}
      onUpload={() => {}}
    />
  )
  expect(screen.getByText('Test Document')).toBeInTheDocument()
})
```

## Common Patterns

### Conditional Rendering
```tsx
{status === 'not_started' && <UploadZone />}
{status === 'uploaded' && <FileInfo />}
{status === 'verified' && <VerificationBadge />}
```

### Progress Calculation
```tsx
const percentage = Math.round((completed / total) * 100)
const remaining = total - completed
```

### Category Statistics
```tsx
const categories = documents.reduce((acc, doc) => {
  // Group by category and count completions
}, {})
```

## Troubleshooting

### Upload Not Working
- Check `onUpload` callback is properly connected
- Verify backend API endpoint
- Check browser console for errors
- Ensure file size limits are sufficient

### Styling Issues
- Import `globals.css` for color variables
- Check Tailwind configuration
- Verify CSS custom properties are set
- Clear `.next` build cache

### Layout Problems
- Check grid classes (lg:col-span-2)
- Verify responsive breakpoints
- Inspect with DevTools
- Test on different screen sizes

## Future Enhancements

Potential features to consider:
- Bulk upload support
- Document versioning
- Approval workflows
- Email notifications
- Audit trail/activity log
- Document templates library
- Advanced search/filtering
- Document comparison

## License

Part of IPOReady platform. All rights reserved.

## Support

For issues or questions:
1. Check USAGE.md for detailed API reference
2. Review EXAMPLE_USAGE.tsx for implementation examples
3. Inspect component TypeScript types for available props
4. Check browser console for runtime errors

---

**Created:** June 4, 2026
**Version:** 1.0
**Status:** Production Ready
