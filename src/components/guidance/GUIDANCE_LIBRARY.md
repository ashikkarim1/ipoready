# Guidance Library UI Component

A world-class learning experience that teaches users how to improve their prospectus by showing real examples from successful IPOs and providing customizable templates.

## Overview

The Guidance Library is a comprehensive educational component that helps IPOReady users understand best practices across all prospectus sections. It features:

- **7 Core Sections**: Executive Summary, Risk Factors, Financial D&A, Management, Use of Proceeds, Market Opportunity, Capitalization Structure
- **Quality Progression**: Shows examples at weak, passable, defendable, and strong quality levels
- **Interactive Templates**: Pre-built templates with customizable placeholders for each section
- **Real Examples**: Actual text from successful IPO prospectuses
- **Smart Filtering**: Search and filter by section, difficulty level, and topic
- **Learning-Focused**: Each example explains why it works and how to improve

## Architecture

### Component Structure

```
guidance/
├── GuidanceLibraryDashboard.tsx    # Main dashboard with search/filter
├── GuidanceCardView.tsx             # Card preview for each article
├── GuidanceDetailView.tsx           # Full detail view with examples
├── ComparisonViewer.tsx             # Side-by-side example display
├── TemplateCustomizer.tsx           # Interactive template editor
└── index.ts                         # Exports
```

### Data Layer

```
lib/
├── guidance-data.ts                 # All guidance articles, examples, templates
└── types/
    └── guidance.types.ts            # TypeScript interfaces
```

## Component Details

### GuidanceLibraryDashboard

Main entry point. Displays:
- Search bar with real-time filtering
- Category tabs (7 sections)
- Difficulty filters (Beginner/Intermediate/Advanced)
- Sort options (Most Helpful/Newest/Most Viewed)
- Grid of guidance cards

**Features**:
- Responsive grid layout
- Filter state management
- Search across titles, descriptions, categories
- Active filter indicator
- Clear filters button

**Props**: None (standalone component)

**Usage**:
```tsx
import { GuidanceLibraryDashboard } from '@/components/guidance'

export default function Page() {
  return <GuidanceLibraryDashboard />
}
```

### GuidanceCardView

Individual guidance article card. Shows:
- Title and description
- Difficulty badge
- Reading time and view count
- Star rating and helpfulness percentage
- "View Guidance" CTA button

**Props**:
```typescript
interface GuidanceCardViewProps {
  article: GuidanceArticle          // Article data
  onClick: () => void               // Click handler
  delay?: number                    // Stagger animation delay
}
```

**Styling**:
- Hover animation (lift effect)
- Responsive text sizing
- Color-coded difficulty badges

### GuidanceDetailView

Full article view with deep content. Includes:
- Article metadata (rating, views, reading time)
- Key summary section
- "What Makes It Strong" checklist
- "Why It Matters" explanation
- Industry benchmarks
- Quality progression selector (Weak → Passable → Defendable → Strong)
- Example viewer with copy-to-clipboard
- Customizable templates
- Related topics

**Props**:
```typescript
interface GuidanceDetailViewProps {
  articleId: string                 // Which guidance article to show
  onBack: () => void                // Back button handler
}
```

**Features**:
- Collapsible sections
- Quality progression path (shows how to improve)
- Copy example to clipboard
- Template customization
- "Mark as Helpful" button

### ComparisonViewer

Displays a single example (weak/passable/defendable/strong) with:
- Quality indicator badge
- Reasoning explanation
- Strengths checklist
- Areas for improvement
- Example text (copyable)
- Quality metrics/benchmarks
- Progression path to next level

**Props**:
```typescript
interface ComparisonViewerProps {
  example: ProspectusExample        // Which example to display
  onCopy: () => void                # Copy button handler
  copied: boolean                   # Show "Copied!" state
}
```

### TemplateCustomizer

Interactive template editor with:
- Input fields for each placeholder
- Live preview with filled values
- Example output reference
- Copy to clipboard button
- Apply to prospectus button

**Props**:
```typescript
interface TemplateCustomizerProps {
  template: GuidanceTemplate        # Template data
  isExpanded: boolean               # Collapse/expand state
  onToggle: () => void              # Toggle handler
}
```

**Features**:
- Placeholder auto-fill from user input
- Real-time preview generation
- Example output reference
- Validation (disables copy if placeholders empty)

## Data Model

### GuidanceArticle

Core guidance article metadata:
```typescript
interface GuidanceArticle {
  id: string                        // Unique identifier
  title: string                     // Article title
  category: GuidanceCategory        // Which section (see below)
  difficulty: GuidanceDifficulty    // beginner|intermediate|advanced
  readingTimeMinutes: number        // Est. read time
  description: string               // Short description
  rating: number                    // 0-5 star rating
  helpfulCount: number              // Users who found it helpful
  totalRatings: number              // Total users rated
  views: number                     // Total views
  createdDate: string               // ISO date
  updatedDate: string               // ISO date
}
```

### ProspectusExample

Real example from an IPO prospectus:
```typescript
interface ProspectusExample {
  id: string
  quality: ExampleQuality           // weak|passable|defendable|strong
  companyName: string               // Which company (if real) or "Example Company"
  industry: string                  // Company industry
  text: string                      // The actual text
  highlights: HighlightRegion[]     // Text regions that show differences
  reasoning: string                 // Why this example demonstrates quality
  strengths: string[]               // What makes it strong
  weaknesses?: string[]             // What could be improved
  benchmarks: {
    label: string
    value: string
    comparison: string
  }[]
}
```

### GuidanceTemplate

Customizable template for each section:
```typescript
interface GuidanceTemplate {
  id: string
  name: string                      // Template name
  category: GuidanceCategory
  description: string
  placeholders: {
    key: string                     // [PLACEHOLDER_KEY]
    label: string                   // User-facing label
    hint: string                    // Example or guidance
    defaultValue?: string           // Optional default
  }[]
  templateText: string              // Template with [KEY] placeholders
  exampleOutput: string             // Example with data filled in
  difficulty: GuidanceDifficulty
}
```

### Categories

Seven main prospectus sections:
- `executive-summary`: The compelling hook
- `risk-factors`: Articulating material risks
- `financial-da`: Management Discussion & Analysis
- `management`: Team bios and experience
- `use-of-proceeds`: How capital will be used
- `market`: Total addressable market sizing
- `capitalization`: Cap table and equity structure

## Difficulty Levels

- **Beginner**: Getting started, basic concepts
- **Intermediate**: Building depth, more nuance
- **Advanced**: Expert-level, complex topics

## Quality Progression

Each example shows quality at four levels:

1. **Weak** (Red)
   - Generic, could apply to any company
   - No quantification
   - No clear impact statement
   - Use as reference for what NOT to do

2. **Passable** (Yellow)
   - Meets minimum requirements
   - Some specificity
   - Identifies impact
   - Room for improvement

3. **Defendable** (Blue)
   - Good quality
   - Specific to your business
   - Quantified metrics
   - Clear impact articulation

4. **Strong** (Green)
   - Excellent, regulatory-tested
   - Comprehensive
   - Multiple data points
   - Cascading impact explanation
   - Use as template

## Usage Examples

### Basic Integration

```tsx
import { GuidanceLibraryDashboard } from '@/components/guidance'

export default function GuidancePage() {
  return (
    <div className="max-w-7xl mx-auto py-12">
      <GuidanceLibraryDashboard />
    </div>
  )
}
```

### Add to Dashboard

```tsx
import { GuidanceLibraryDashboard } from '@/components/guidance'

export default function DashboardLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Other dashboard content */}
      </div>
      <div className="lg:col-span-1">
        <GuidanceLibraryDashboard />
      </div>
    </div>
  )
}
```

### Standalone Page

Page is included at `/guidance-library` route with:
- Full page layout
- Proper metadata
- SEO optimization

## Features & Interactions

### Search & Filter

- Real-time search across titles, descriptions, categories
- Multi-select category filtering
- Difficulty level filtering
- Sort by: Most Helpful, Newest, Most Viewed
- Active filter count badge
- Clear all filters button

### Learning Path

Each article guides users through:
1. **Understand** - Summary and key principles
2. **Analyze** - What makes examples strong/weak
3. **Learn** - Why it matters to your IPO
4. **Compare** - Side-by-side quality progression
5. **Apply** - Customize templates for your company

### Example Viewer

- Quality-colored headers (red/yellow/blue/green)
- Clear reasoning explanation
- Bulleted strengths
- Areas for improvement
- Copyable text
- Benchmarks
- Progression path advice

### Template System

- Pre-filled placeholder hints
- Live preview updates
- Copy to clipboard
- Example output reference
- Validation feedback
- Apply to prospectus integration point

## Styling & Theming

### Color Scheme

- **Primary**: Blue (#0066FF, #003A99)
- **Success**: Green (#10B981, #059669)
- **Warning**: Amber (#F59E0B, #D97706)
- **Error**: Red (#EF4444, #DC2626)
- **Neutral**: Gray (slate)

### Responsive Design

- Mobile-first approach
- Stacked layout on mobile (< 768px)
- 2-column on tablet (768px - 1024px)
- 3-column on desktop (1024px+)
- Touch-friendly buttons (min 48px)

### Animations

- Framer Motion for all transitions
- Stagger animations for lists
- Smooth opacity and y-axis transitions
- Hover effects on interactive elements

## Extending the Component

### Adding New Guidance Articles

1. Add article to `GUIDANCE_ARTICLES` in `guidance-data.ts`:

```typescript
{
  id: 'new-article-id',
  title: 'Article Title',
  category: 'executive-summary',
  difficulty: 'beginner',
  readingTimeMinutes: 5,
  description: 'Short description...',
  rating: 4.5,
  helpfulCount: 100,
  totalRatings: 120,
  views: 1000,
  createdDate: '2025-06-04',
  updatedDate: '2025-06-04',
}
```

2. Add detailed guidance to `getDetailedGuidance()`:

```typescript
if (articleId === 'new-article-id') return NEW_ARTICLE_DETAIL
```

3. Create `NEW_ARTICLE_DETAIL` with examples and templates

### Adding New Templates

1. Create template in `guidance-data.ts`:

```typescript
{
  id: 'new-template-id',
  name: 'Template Name',
  category: 'category-name',
  description: 'What this template helps with',
  placeholders: [
    {
      key: 'PLACEHOLDER_NAME',
      label: 'User-Facing Label',
      hint: 'Example or guidance',
      defaultValue: 'Optional default'
    }
  ],
  templateText: 'Text with [PLACEHOLDER_NAME] values...',
  exampleOutput: 'Example with actual data filled in...',
  difficulty: 'intermediate'
}
```

2. Add to `ALL_TEMPLATES` array

### Custom Styling

All components use Tailwind CSS. Override with custom className props or create wrapper component:

```tsx
export function CustomGuidanceLibrary() {
  return (
    <div className="custom-theme">
      <GuidanceLibraryDashboard />
    </div>
  )
}
```

## Performance Considerations

- Lazy load detail views (only load when selected)
- Memoized filtered article list
- Stagger animations avoid layout thrashing
- Search debounced (consider adding if performance needed)
- Copy-to-clipboard uses native API (instant)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color not sole indicator (text labels used)
- Sufficient contrast ratios
- Focus states on buttons

## Browser Support

- Modern browsers with ES6+ support
- Framer Motion supports Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **User Tracking**: Record which guidance articles users view/apply
2. **A/B Testing**: Test different examples for effectiveness
3. **AI-Powered Recommendations**: Suggest relevant guidance based on user's prospectus
4. **Export**: Generate PDF with selected templates
5. **Team Sharing**: Share guidance articles with team members
6. **Comments**: Allow users to comment on examples
7. **Benchmarking**: Compare your prospectus sections to industry averages
8. **Integration**: Direct apply to prospectus editor
9. **Video Examples**: Narrated walkthroughs of best practices
10. **Interactive Exercises**: Guided practice improving weak examples

## Related Files

- Types: `/src/lib/types/guidance.types.ts`
- Data: `/src/lib/guidance-data.ts`
- Page: `/src/app/guidance-library/page.tsx`
- Components: `/src/components/guidance/`

## Changelog

### Version 1.0.0 (2025-06-04)
- Initial release
- 7 core sections with guidance articles
- 4-level quality progression examples
- Interactive template customizer
- Search and filtering
- Responsive design
- Framer Motion animations
