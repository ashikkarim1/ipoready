# Guidance Library - Architecture & Component Relationships

## Component Hierarchy

```
GuidanceLibraryDashboard (Main Entry Point)
├── Search Bar (input + filter controls)
├── Category Tabs (browse by section)
│   └── GuidanceCardView (article preview)
│       └── onClick → Show Detail View
├── Filter Panel (expandable)
│   ├── Section Checkboxes
│   └── Difficulty Selection
└── Results Grid
    └── GuidanceCardView (multiple)

GuidanceDetailView (Shown when article selected)
├── Back Button
├── Article Metadata
├── Summary Section
├── What Makes It Strong (collapsible)
├── Why It Matters (collapsible)
├── Industry Benchmarks (collapsible)
├── Quality Progression Selector
│   └── ComparisonViewer (for each quality level)
│       ├── Quality Indicator
│       ├── Reasoning
│       ├── Strengths/Weaknesses
│       ├── Example Text (copyable)
│       └── Benchmarks
├── Templates Section (collapsible)
│   └── TemplateCustomizer (for each template)
│       ├── Input Fields
│       ├── Live Preview
│       ├── Example Output
│       └── Action Buttons
├── Related Topics
└── Action Buttons (Copy, Mark Helpful)
```

## Data Flow

```
guidance-data.ts (Content)
│
├── GUIDANCE_ARTICLES[] → All article metadata
│
├── RISK_FACTORS_DETAIL → Detailed content for Risk Factors
│   ├── article metadata
│   ├── 4 ProspectusExample[] (weak, passable, defendable, strong)
│   ├── GuidanceTemplate[] (customizable templates)
│   └── industryBenchmarks[]
│
├── EXECUTIVE_SUMMARY_DETAIL → Detailed content for Exec Summary
│   └── ... same structure
│
└── Helper Functions:
    ├── getGuidanceByCategory() → Filter by section
    ├── getDetailedGuidance() → Get full article content
    ├── searchGuidance() → Full-text search
    └── CATEGORY_INFO → Section names & descriptions
```

## State Management

```
GuidanceLibraryDashboard
├── filters (search, categories, difficulties, sortBy)
├── selectedArticleId (which article to show detail for)
└── showFilters (expand/collapse filter panel)

GuidanceDetailView
├── selectedExample (which quality level to show)
├── showWhyItMatters (section collapse state)
├── showBenchmarks (section collapse state)
├── showTemplates (section collapse state)
├── selectedTemplate (which template expanded)
├── copiedExample (show "Copied!" feedback)
└── copiedPreview (template preview copy state)

TemplateCustomizer
├── placeholderValues (user input for each placeholder)
└── copied (show "Copied!" feedback)
```

## Type System

```
guidance.types.ts
│
├── GuidanceArticle
│   ├── id, title, category
│   ├── difficulty (beginner|intermediate|advanced)
│   ├── readingTimeMinutes, rating, views
│   └── metadata (dates, helpfulness counts)
│
├── GuidanceDetail
│   ├── article (GuidanceArticle)
│   ├── summary, whatMakesItStrong[], whyItMatters
│   ├── industryBenchmarks[]
│   ├── examples[] (ProspectusExample)
│   ├── templates[] (GuidanceTemplate)
│   └── relatedTopics[]
│
├── ProspectusExample
│   ├── quality (weak|passable|defendable|strong)
│   ├── text (example content)
│   ├── reasoning, strengths[], weaknesses[]
│   ├── highlights[] (for diff highlighting)
│   └── benchmarks[]
│
├── GuidanceTemplate
│   ├── placeholders[] (key, label, hint, defaultValue)
│   ├── templateText (with [KEY] placeholders)
│   └── exampleOutput
│
├── GuidanceCategory
│   ├── executive-summary
│   ├── risk-factors
│   ├── financial-da
│   ├── management
│   ├── use-of-proceeds
│   ├── market
│   └── capitalization
│
└── GuidanceDifficulty
    ├── beginner
    ├── intermediate
    └── advanced
```

## User Interaction Flows

### Flow 1: Discovery & Learning

```
User lands on /guidance-library
    ↓
GuidanceLibraryDashboard loads with all 7 sections
    ↓
User scans article cards in each section
    ↓
User clicks card they're interested in
    ↓
GuidanceDetailView opens for that article
    ↓
User reads summary and principles
    ↓
User scrolls to examples section
    ↓
User selects different quality levels to compare
    ↓
User reads "Why This Matters" and learns
    ↓
User scrolls to templates
    ↓
User expands template they want to use
    ↓
User fills in placeholder fields
    ↓
User sees preview update in real-time
    ↓
User clicks Copy or Apply to Prospectus
```

### Flow 2: Search & Filter

```
User types search query in search bar
    ↓
GuidanceLibraryDashboard filters articles in real-time
    ↓
Results grid shows matching articles
    ↓
User clicks on relevant result
    ↓
GuidanceDetailView opens
```

### Flow 3: Template Customization

```
User expands TemplateCustomizer
    ↓
User sees placeholder input fields with hints
    ↓
User types into each field
    ↓
Preview updates automatically as they type
    ↓
User sees example output for reference
    ↓
User clicks Copy to clipboard
    ↓
User pastes into prospectus document
```

## Component Props & Relationships

### GuidanceLibraryDashboard
```
Props: None (standalone)
Internal State:
  - filters: GuidanceLibraryFilter
  - selectedArticleId: string | null
  - showFilters: boolean
Children:
  - GuidanceCardView (multiple)
On Click → Sets selectedArticleId → Shows GuidanceDetailView
```

### GuidanceDetailView
```
Props:
  - articleId: string (which article to show)
  - onBack: () => void (back button handler)
Internal State:
  - selectedExample: ExampleQuality (weak|passable|defendable|strong)
  - showWhyItMatters: boolean
  - showBenchmarks: boolean
  - showTemplates: boolean
  - selectedTemplate: string | null
  - copiedExample: boolean
Children:
  - ComparisonViewer (renders for selected quality level)
  - TemplateCustomizer (multiple)
Data Source: getDetailedGuidance(articleId)
```

### ComparisonViewer
```
Props:
  - example: ProspectusExample
  - onCopy: () => void
  - copied: boolean
Internal State: None
Display:
  - Quality badge (color-coded)
  - Reasoning text
  - Strengths checklist (green)
  - Weaknesses list (red)
  - Example text (copyable)
  - Quality metrics
  - Progression path advice
```

### TemplateCustomizer
```
Props:
  - template: GuidanceTemplate
  - isExpanded: boolean
  - onToggle: () => void
Internal State:
  - placeholderValues: Record<string, string>
  - copied: boolean
Features:
  - Input fields for each placeholder
  - Live preview generation
  - Copy to clipboard
  - Example output reference
```

### GuidanceCardView
```
Props:
  - article: GuidanceArticle
  - onClick: () => void
  - delay?: number (animation stagger)
Internal State: None
Display:
  - Article title & description
  - Difficulty badge
  - Reading time & views
  - Star rating
  - Helpfulness percentage
  - "View Guidance" button
```

## Data Retrieval Patterns

### Get All Articles for Home View
```typescript
const articles = GUIDANCE_ARTICLES
// 7 articles across all categories
```

### Get Articles by Category
```typescript
const categoryArticles = getGuidanceByCategory('risk-factors')
// Returns filtered array
```

### Get Full Article with Examples & Templates
```typescript
const detail = getDetailedGuidance('risk-factors-comprehensive')
// Returns GuidanceDetail with all nested data
```

### Search Articles
```typescript
const results = searchGuidance('competitive')
// Returns articles matching title/description/category
```

### Sort Articles
```typescript
// By helpfulness
articles.sort((a, b) => 
  (b.helpfulCount/b.totalRatings) - (a.helpfulCount/a.totalRatings)
)

// By newest
articles.sort((a, b) => 
  new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
)

// By views
articles.sort((a, b) => b.views - a.views)
```

## Feature Implementation Details

### Search
- Real-time as user types
- Searches: title, description, category
- Case-insensitive
- Implemented: `searchGuidance()` function

### Filter by Category
- Multi-select checkboxes
- Shows count of articles per category
- Results update as selections change
- Implemented: `toggleCategory()` state handler

### Filter by Difficulty
- Toggle buttons (Beginner/Intermediate/Advanced)
- Can select multiple
- Results update immediately
- Implemented: `toggleDifficulty()` state handler

### Sort
- Dropdown with 3 options
- Default: Most Helpful (highest helpfulCount/totalRatings)
- Newest: By createdDate
- Most Viewed: By views count

### Quality Progression
- 4 buttons selecting weak/passable/defendable/strong
- Only shown if examples exist for that quality
- Color-coded (red/yellow/blue/green)
- Switches ComparisonViewer content

### Template Customization
- Input field for each placeholder
- Real-time preview generation
- Disables copy button if placeholders remain
- Shows example output for reference

### Copy to Clipboard
- Uses native navigator.clipboard API
- Shows "Copied!" feedback for 2 seconds
- Works on modern browsers and mobile

## Performance Optimizations

### Rendering
- Lazy load detail view (only when article selected)
- Memoized filtered article list
- Stagger animations (no layout thrash)

### Data
- All data in single file (no multiple imports)
- No API calls needed
- In-memory filtering
- Search debounce not needed (data set small)

### UI
- Collapsible sections (reduce initial render)
- GPU-accelerated animations (Framer Motion)
- Smooth scrolling (CSS)

## Extensibility Points

### Add New Article
1. Add to GUIDANCE_ARTICLES array
2. Create detail object
3. Update getDetailedGuidance() function
4. Automatically appears in dashboard

### Add New Template
1. Create GuidanceTemplate object
2. Add to guidance.templates array
3. Associates with parent article

### Add New Section/Category
1. Add to GuidanceCategory type
2. Add to CATEGORY_INFO map
3. Update form placeholders and examples
4. Automatically appears in category tabs

### Add New Quality Level
1. Update ExampleQuality type
2. Add to examples arrays
3. Add color configuration
4. Update quality selector logic

## Browser DevTools Tips

### Debug State
- Open React DevTools
- Select GuidanceLibraryDashboard
- View filters, selectedArticleId, showFilters

### Debug Data
- Open Console
- `GUIDANCE_ARTICLES` - all articles
- `getDetailedGuidance('risk-factors-comprehensive')` - full article data

### Performance
- Chrome DevTools → Performance tab
- Record, interact with component, stop
- Look for "GuidanceDetailView" and animation frames

### Styling
- Inspect element with developer tools
- All classes are Tailwind CSS
- Search for hover states and animations

## Integration Checklist

- [ ] Components render without errors
- [ ] Search and filter work correctly
- [ ] Quality progression shows all levels
- [ ] Templates update preview in real-time
- [ ] Copy to clipboard works
- [ ] Mobile responsive (test on phone)
- [ ] Animations smooth on target device
- [ ] No console errors
- [ ] TypeScript strict mode passes
- [ ] Accessibility tested (keyboard nav, screen reader)

---

This architecture ensures the Guidance Library is:
- **Modular**: Each component has single responsibility
- **Scalable**: Easy to add articles, templates, examples
- **Performant**: Lazy loading, memoization, GPU animations
- **Maintainable**: Clear data flow, typed, documented
- **Extensible**: Clear integration points for new features
