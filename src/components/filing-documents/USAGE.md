# Filing Documents UI Components

A comprehensive set of React components for managing IPO filing documents with progress tracking, categorization, and document preview functionality.

## Components

### 1. DocumentChecklist (Main Component)

The primary component that orchestrates the entire filing documents interface.

```tsx
import { DocumentChecklist } from '@/components/filing-documents'

export default function FilingDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: '1',
      name: 'Financial Statements',
      description: 'Audited financial statements for the past 3 years',
      category: 'Financial',
      status: 'not_started',
      isRequired: true,
      estimatedDays: 14,
      templateUrl: '/templates/financial-statements.pdf',
      guideUrl: '/guides/financial-statements.md',
      checklistItems: [
        'Balance sheet',
        'Income statement',
        'Cash flow statement',
        'Auditor notes'
      ]
    },
    // ... more documents
  ])

  const handleUpload = (documentId: string, file: File) => {
    console.log(`Uploading ${file.name} for document ${documentId}`)
    // Handle file upload to backend
  }

  const handleDelete = (documentId: string) => {
    console.log(`Deleting document ${documentId}`)
    // Handle deletion
  }

  return (
    <DocumentChecklist
      exchange="TSX"
      companyId="company-123"
      documents={documents}
      onUpload={handleUpload}
      onDelete={handleDelete}
      title="Filing Documents Checklist"
      subtitle="Complete all required documents for your IPO filing"
    />
  )
}
```

**Props:**
- `exchange` (string) - Stock exchange (TSX, NASDAQ, NYSE, etc.)
- `companyId` (string) - Company identifier
- `documents` (DocumentItem[]) - Array of documents
- `onUpload` (function) - Called when file is uploaded
- `onDelete` (function, optional) - Called when document is deleted
- `onViewDocument` (function, optional) - Called when document preview is opened
- `title` (string) - Page title
- `subtitle` (string) - Page subtitle

### 2. DocumentCard

Individual document card with upload zone, status badge, and actions.

```tsx
import { DocumentCard } from '@/components/filing-documents'

<DocumentCard
  id="doc-1"
  name="Articles of Incorporation"
  description="Your company's founding documents"
  category="Legal"
  status="in_progress"
  isRequired={true}
  estimatedDays={5}
  templateUrl="/templates/articles.pdf"
  guideUrl="/guides/articles-guide.md"
  onUpload={(file) => console.log('Uploading:', file)}
  onView={() => console.log('View document')}
  onDownload={() => console.log('Download document')}
  onDelete={() => console.log('Delete document')}
  checklistItems={[
    'Complete legal review',
    'Board approval',
    'Shareholder sign-off'
  ]}
/>
```

**Status Values:**
- `not_started` - Gray background, upload zone visible
- `in_progress` - Yellow background, upload zone visible
- `ready` - Blue background, ready for review
- `uploaded` - Green background, file uploaded
- `verified` - Dark green background, verified and complete

### 3. CategoryFilter

Sidebar filter component for organizing documents by category.

```tsx
import { CategoryFilter } from '@/components/filing-documents'

const categories = [
  { id: 'financial', label: 'Financial', count: 5, total: 8 },
  { id: 'legal', label: 'Legal', count: 3, total: 6 },
  { id: 'governance', label: 'Governance', count: 2, total: 4 },
  { id: 'corporate', label: 'Corporate', count: 1, total: 3 },
  { id: 'compliance', label: 'Compliance', count: 4, total: 5 },
]

<CategoryFilter
  categories={categories}
  selectedCategory="financial"
  onSelectCategory={(categoryId) => console.log('Selected:', categoryId)}
/>
```

### 4. ProgressTracker

Displays overall progress and category-specific progress bars with milestones.

```tsx
import { ProgressTracker } from '@/components/filing-documents'

<ProgressTracker
  totalCompleted={12}
  totalDocuments={26}
  estimatedDaysRemaining={18}
  categoryProgress={[
    { name: 'Financial', completed: 5, total: 8 },
    { name: 'Legal', completed: 3, total: 6 },
    { name: 'Governance', completed: 2, total: 4 },
    { name: 'Corporate', completed: 1, total: 3 },
    { name: 'Compliance', completed: 4, total: 5 },
  ]}
/>
```

### 5. DocumentPreview

Modal component for viewing, downloading, and deleting documents.

```tsx
import { DocumentPreview } from '@/components/filing-documents'

<DocumentPreview
  isOpen={isPreviewOpen}
  documentName="Financial Statements"
  fileUrl="/files/financial-statements.pdf"
  fileSize="2.4 MB"
  uploadedDate="2026-06-04"
  uploadedBy="Finance Team"
  onClose={() => setIsPreviewOpen(false)}
  onDownload={() => downloadFile()}
  onDelete={() => deleteFile()}
/>
```

## Design System Integration

All components use the Prospectus Builder design system colors and typography:

### Color Palette
- **Primary CTA**: #E8312A (Red)
- **Background**: #F7F6F4 (Beige)
- **Success**: #2D7A5F (Green)
- **In Progress**: #B45309 (Amber/Yellow)
- **Ready**: #1D4ED8 (Blue)
- **Text Primary**: #1A1A1A (Dark)
- **Text Secondary**: #717171 (Gray)

### Typography Classes
- `.h1`, `.h2`, `.h3`, `.h4` - Headings
- `.body`, `.body-sm` - Body text
- `.label`, `.label-sm`, `.label-xs` - Labels
- `.caption`, `.caption-sm` - Captions

### CSS Variables (globals.css)
```css
--color-accent: #E8312A;              /* CTA buttons */
--color-success: #2D7A5F;             /* Verified/complete */
--color-warning: #B45309;             /* In progress */
--color-info: #1D4ED8;                /* Ready/info */
--color-bg-primary: #F7F6F4;          /* Page background */
--color-surface-primary: #FFFFFF;     /* Card background */
--color-text-primary: #1A1A1A;        /* Primary text */
--color-text-secondary: #717171;      /* Secondary text */
```

## Document Status Flow

```
not_started
    ↓
in_progress (upload zone visible)
    ↓
uploaded (file uploaded)
    ↓
ready/verified (approved by admin)
```

## Key Features

✓ **Drag-and-Drop Upload**: Intuitive file upload with drag-and-drop support
✓ **Progress Tracking**: Overall and category-specific progress bars
✓ **Document Preview**: Modal for viewing PDFs, images, and file metadata
✓ **Categorization**: Filter documents by Financial, Legal, Governance, Corporate, Compliance
✓ **Status Badges**: Visual indicators for each document status
✓ **Responsive Design**: Works on mobile, tablet, and desktop
✓ **Accessibility**: Proper ARIA labels and keyboard navigation
✓ **Design System**: Integrated with Prospectus Builder color palette

## Integration Example

```tsx
'use client'

import { useState } from 'react'
import { DocumentChecklist, DocumentItem } from '@/components/filing-documents'

const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: '1',
    name: 'Balance Sheet',
    description: 'Audited balance sheet (last 3 years)',
    category: 'Financial',
    status: 'uploaded',
    isRequired: true,
    uploadedDate: 'June 1, 2026',
    uploadedBy: 'CFO',
    fileUrl: '/files/balance-sheet.pdf',
    fileSize: '1.2 MB',
    templateUrl: '/templates/balance-sheet.xlsx',
  },
  {
    id: '2',
    name: 'Board Resolutions',
    description: 'Board approval for IPO filing',
    category: 'Governance',
    status: 'not_started',
    isRequired: true,
    estimatedDays: 7,
    templateUrl: '/templates/board-resolutions.docx',
    guideUrl: '/guides/board-resolutions.md',
  },
  // ... more documents
]

export default function Page() {
  const [docs, setDocs] = useState(SAMPLE_DOCUMENTS)

  return (
    <DocumentChecklist
      exchange="TSX"
      companyId="company-456"
      documents={docs}
      onUpload={(docId, file) => {
        console.log(`Upload ${file.name} for ${docId}`)
        // Update backend
      }}
      onDelete={(docId) => {
        console.log(`Delete ${docId}`)
        // Update backend
      }}
    />
  )
}
```

## Customization

### Changing Status Colors

Edit the `getStatusBadgeColor()` method in `DocumentCard.tsx`:

```tsx
const getStatusBadgeColor = () => {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'in_progress':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200'
    // ... etc
  }
}
```

### Adding New Categories

Simply include new categories in your document data:

```tsx
const document = {
  // ...
  category: 'Custom Category Name'
}
```

The component will automatically detect and display new categories in the filter.

### Custom Styling

All components use Tailwind CSS with CSS custom properties for theming. Override in `globals.css`:

```css
:root {
  --color-accent: #YOUR_COLOR;
  --color-success: #YOUR_COLOR;
  /* ... etc */
}
```

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states for all buttons
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Part of IPOReady platform. All rights reserved.
