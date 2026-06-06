# Documents Page - Quick Reference Card

## File Location
```
/src/app/documents/page.tsx
```

## Color Variables (Use These!)

```tsx
// Status colors
var(--color-accent)           // #E8312A (Red)    - Primary, critical
var(--color-success)          // #2D7A5F (Green)  - Approved
var(--color-warning)          // #B45309 (Amber)  - In Review
var(--color-info)             // #1D4ED8 (Blue)   - Draft

// Background colors
var(--color-bg-primary)       // #F7F6F4 (Gray)   - Page bg
var(--color-surface-primary)  // #FFFFFF (White)  - Cards
var(--color-surface-secondary)// #F0EFED (Gray)   - Hover

// Text colors
var(--color-text-primary)     // #1A1A1A (Black)  - Main
var(--color-text-secondary)   // #717171 (Gray)   - Secondary
var(--color-text-muted)       // #717171 (Gray)   - Hints

// Borders
var(--color-border)           // #E5E4E0
var(--color-border-dark)      // #C8C7C2
```

## Component Sizing

```tsx
// Standard padding
padding: '1rem'      // Cards
padding: '1.25rem'   // Headers
padding: '3rem 2rem' // Empty states

// Icon sizes
w-3 h-3             // Small (12px)
w-4 h-4             // Medium (16px)
w-5 h-5             // Standard (20px)
w-8 h-8             // Large (32px)
w-12 h-12           // XL (48px)

// Border radius
borderRadius: '8px'      // Small elements
borderRadius: '12px'     // Inputs
borderRadius: '16px'     // Cards
borderRadius: '999px'    // Pills/buttons
```

## Status Style Function

```tsx
getStatusStyle(status) => {
  approved:  { bg: success-soft,   color: success   }
  in_review: { bg: warning-soft,   color: warning   }
  draft:     { bg: info-soft,      color: info      }
  archived:  { bg: surface-secondary, color: secondary }
}
```

## Icon-to-Status Mapping

| Status | Icon | Color |
|--------|------|-------|
| Approved | CheckCircle2 | success |
| In Review | Clock | warning |
| Draft | AlertTriangle | info |
| Archived | ZapOff | secondary |

## Common Patterns

### Card Component
```tsx
className="card card-hover"
style={{
  padding: '1rem',
  background: 'var(--color-surface-primary)',
  border: '1px solid #E5E4E0',
  borderRadius: '16px',
  transition: 'all 0.2s ease'
}}
```

### Status Badge
```tsx
className="badge"
style={{
  background: statusStyle.bg,
  color: statusStyle.color,
  border: `1px solid ${statusStyle.border}`,
  fontSize: '0.7rem',
  fontWeight: 600
}}
```

### Button with Hover
```tsx
style={{
  background: 'var(--color-accent)',
  color: 'var(--color-text-inverse)',
  padding: '0.5rem',
  borderRadius: '8px',
  transition: 'all 0.2s ease'
}}
onMouseEnter={e => {
  e.currentTarget.style.background = '#E8312A'
  e.currentTarget.style.opacity = '0.9'
}}
```

### Framer Motion Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
```

## Typography Sizes

```tsx
heading:   fontSize: '2rem'      // 32px, bold
subtitle:  fontSize: '0.95rem'   // 15px, 600 weight
body:      fontSize: '0.875rem'  // 14px, 500 weight
label:     fontSize: '0.75rem'   // 12px, 600 weight uppercase
caption:   fontSize: '0.75rem'   // 12px, 400 weight
```

## State Management

```tsx
// Main state
documents        // Array<UnifiedDocument>
loading          // boolean
error            // string | null
searchTerm       // string
filterStatus     // string | null
expandedCategory // string | null
selectedDocument // UnifiedDocument | null

// Statistics (computed)
stats = {
  total,
  approved,
  inReview,
  draft,
  archived
}

// Grouped documents
groupedDocuments // Record<string, DocumentGroup>
```

## API Endpoints

```tsx
// Fetch documents
GET /api/documents/list?companyId={id}
Response: { documents: UnifiedDocument[] }
```

## Helper Functions

### formatFileSize
```tsx
formatFileSize(1048576) // => "1 MB"
formatFileSize(1536)    // => "1.5 KB"
```

### getStatusStyle
```tsx
const style = getStatusStyle('approved')
// => { bg, color, border, icon, label }
```

## Spacing Grid

```
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  0.75rem (12px)
lg:  1rem    (16px)
xl:  1.5rem  (24px)
xxl: 2rem    (32px)
```

## Hover Effects

```tsx
// Card hover
transform: translateY(-2px)
boxShadow: '0 4px 12px rgba(0,0,0,0.10)'

// Button hover
background: lighter shade
opacity: 0.9

// Framer Motion
whileHover={{ scale: 1.05 }}
```

## Animation Delays

```tsx
// Staggered entrance
0.1 + index * 0.05  // Cards
0.2 + index * 0.1   // Groups
0.05 * index        // Items
```

## Document Interface

```tsx
interface UnifiedDocument {
  id: string
  companyId: string
  name: string
  displayName?: string
  description?: string
  mimeType: string
  storageProvider: string
  storageId?: string
  cloudPath?: string
  fileSize: number
  category: string
  status: 'draft' | 'in_review' | 'approved' | 'archived'
  uploadedAt: string
  uploadedBy: string
  commentCount: number
  requiredForFiling?: boolean
  currentVersion?: number
  totalVersions?: number
  completeness?: number
  approvedAt?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
  ownerUserId?: string
}
```

## Key Classes

```tsx
.card         // Base card styling
.card-hover   // Card hover effects
.badge        // Status badge
.btn          // Button (blue, should use inline styles for colors)
.serif        // Serif heading font
```

## Common Imports

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, Upload, Clock, CheckCircle2,
  AlertTriangle, ZapOff, Calendar, MessageSquare,
  ChevronDown, ChevronUp, AlertCircle, Search,
  MoreVertical, Loader
} from 'lucide-react'
import { useSession } from 'next-auth/react'
```

## Testing the Component

```bash
# Type check
npm run build

# Run tests
npm test -- src/app/documents/__tests__/page.test.tsx

# Check specific aspect
# - Color palette
# - Status indicators
# - Animations
# - Responsive design
# - Accessibility
```

## Deployment Checklist

- [ ] Code reviewed
- [ ] Tests passed
- [ ] Build successful
- [ ] Design verified visually
- [ ] Mobile tested
- [ ] Accessibility checked
- [ ] Performance acceptable
- [ ] All links working
- [ ] API endpoints responding
- [ ] Error handling functional

## Common Customizations

### To Change Accent Color
```tsx
// Edit /src/app/globals.css
--color-accent: #E8312A;  // Change this
```

### To Adjust Card Styling
```tsx
className="card"
style={{
  // Modify these
  borderRadius: '16px',
  boxShadow: '...',
  padding: '1rem'
}}
```

### To Modify Status Colors
```tsx
// Edit getStatusStyle() function
case 'approved':
  return {
    bg: '...',     // Change background
    color: '...',  // Change text
    border: '...'  // Change border
  }
```

---

**Last Updated:** June 6, 2026  
**Quick Reference Version:** 1.0
