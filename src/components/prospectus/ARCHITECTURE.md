# Prospectus Validator - Architecture Documentation

## Component Hierarchy

```
ProspectusValidatorDashboard (Root)
│
├── Header
│   ├── Title: "Prospectus Validator"
│   └── Subtitle: "Comprehensive quality assessment..."
│
├── OverallSummary
│   ├── StrengthGauge (Large)
│   │   └── SVG Arc Visualization
│   ├── Summary Stats
│   │   ├── Strength rating (1-5)
│   │   ├── Status label
│   │   └── Badge grid
│   │       ├── 🔴 Critical count
│   │       ├── 🟡 Gap count
│   │       └── Completeness %
│   ├── PieChart (Recharts)
│   │   ├── Complete sections
│   │   ├── In progress sections
│   │   └── Not started sections
│   └── Recommendations Box
│       └── Dynamic recommendations based on state
│
├── Filter Bar
│   ├── All | Critical | Moderate | Minor buttons
│   └── Active state highlighting
│
└── Section Cards Grid (Responsive: 1 col mobile → 2 col desktop)
    └── SectionCard[] (for each section)
        ├── Header (clickable to expand)
        │   ├── StrengthGauge (Medium)
        │   ├── Section name
        │   ├── Status badge
        │   └── Chevron icon
        │
        └── Expandable Details (AnimatePresence)
            ├── Completeness Bar
            │   └── Animated progress fill
            │
            ├── Issues Section (if any)
            │   └── IssueCard[] (for each issue)
            │       ├── Severity indicator (color + icon)
            │       ├── Description
            │       └── Expandable Details
            │           ├── Root Cause text
            │           ├── Fix Options (checkboxes)
            │           ├── Guidance box
            │           ├── Example link
            │           └── Mark Resolved button
            │
            ├── Gaps Section (if any)
            │   └── Gap Item[] (for each gap)
            │       ├── Category
            │       ├── Description
            │       ├── Required flag
            │       └── Status indicator
            │
            └── Action Buttons
                ├── View Guidance
                └── Save Changes
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ProspectusSection[]                           │
│                   (from API or state)                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ↓
        ┌───────────────────────────────────────┐
        │  ProspectusValidatorDashboard         │
        │  Props:                               │
        │  - sections: ProspectusSection[]      │
        │  - onSectionUpdate?: (id, updates)   │
        └───────────────────────────────────────┘
                            │
                            ├─→ useState(expandedSections)
                            ├─→ useState(severityFilter)
                            └─→ useMemo(filteredSections)
                            
                            ↓
        ┌───────────────────────────────────────┐
        │   Component Composition                │
        ├───────────────────────────────────────┤
        │ • OverallSummary                      │
        │ • FilterBar                           │
        │ • SectionCard[] (mapped)              │
        └───────────────────────────────────────┘
                            │
                            ├─→ StrengthGauge
                            ├─→ StatusBadge
                            ├─→ IssueCard[]
                            │   └─→ Issue Detail Expansion
                            └─→ Gap Item[]
                            
                            ↓
        ┌───────────────────────────────────────┐
        │   Event Handlers                      │
        ├───────────────────────────────────────┤
        │ • toggleSection(sectionId)            │
        │ • setSeverityFilter(severity)         │
        │ • handleIssueResolve(sectionId, id)  │
        │   └→ calls onSectionUpdate() callback │
        └───────────────────────────────────────┘
```

## State Management Flow

```
User Interaction
    │
    ├─ Click Section Header
    │   └─→ toggleSection()
    │       └─→ setExpandedSections()
    │           └─→ Re-render with details visible
    │
    ├─ Click Filter Button
    │   └─→ setSeverityFilter()
    │       └─→ useMemo recalculates filteredSections
    │           └─→ Re-render with filtered issues
    │
    ├─ Click "Mark Resolved" on Issue
    │   └─→ handleIssueResolve()
    │       ├─→ Calculate new completeness
    │       ├─→ Filter out resolved issue
    │       └─→ Call onSectionUpdate(sectionId, updates)
    │           └─→ Parent component handles API/state update
    │
    └─ Click "Expand Issue Details"
        └─→ setExpanded() (local issue state)
            └─→ Render issue detail content
```

## Gauge Rendering Algorithm

```
SVG Circular Gauge (Half-Circle)
    │
    ├─ Background Arc (180°)
    │   └─ Gray color (#e5e7eb)
    │
    ├─ Filled Arc (dynamic based on strength)
    │   ├─ Calculate filled angle: (strength / 5) * 180°
    │   └─ Apply gradient:
    │       ├─ Strength 1: Red → Dark Red
    │       ├─ Strength 2-3: Amber → Dark Amber
    │       ├─ Strength 3-4: Lime → Dark Lime
    │       └─ Strength 5: Green → Dark Green
    │
    └─ Center Text (for md and lg sizes)
        └─ Display: "3.5" (strength rating)
```

## Animation Strategy

```
Framer Motion Animation Layers:

1. Layout Animations
   └─ SectionCard: layout prop for automatic repositioning
   
2. Presence Animations (AnimatePresence)
   ├─ Section Details Expansion
   │   └─ height: 0 → auto, opacity: 0 → 1 (0.3s)
   │
   ├─ Issue Details Expansion
   │   └─ height: 0 → auto, opacity: 0 → 1 (0.2s)
   │
   └─ Empty State Fade-in
       └─ opacity: 0 → 1 (0.3s)

3. Value Animations
   ├─ Progress Bars
   │   └─ width: 0 → target% (0.6s easeOut)
   │
   └─ Gauge Fills
       └─ SVG path update (CSS-driven)

4. Stagger Animations
   └─ Card Container
       ├─ container variant: staggerChildren = 0.1s
       └─ item variant: scaleY + opacity
           └─ hidden: {opacity: 0, y: 20}
           └─ show: {opacity: 1, y: 0}

5. Interactive Animations
   ├─ Button Hover: opacity/scale
   ├─ Chevron Rotation: rotate 180°
   └─ Badge Pulse: subtle scale
```

## Color System

```
Severity Levels:
├─ Critical (🔴)
│   ├─ Icon: 🔴
│   ├─ Background: #ef4444 (red-50)
│   ├─ Border: #fca5a5 (red-200)
│   └─ Text: #991b1b (red-900)
│
├─ Moderate (🟡)
│   ├─ Icon: 🟡
│   ├─ Background: #fef3c7 (amber-50)
│   ├─ Border: #fde68a (amber-200)
│   └─ Text: #78350f (amber-900)
│
└─ Minor (🔵)
    ├─ Icon: 🔵
    ├─ Background: #eff6ff (blue-50)
    ├─ Border: #bfdbfe (blue-200)
    └─ Text: #1e3a8a (blue-900)

Strength Levels:
├─ Weak (1)
│   ├─ Gauge: Red (#ef4444 → #dc2626)
│   ├─ Background: #fef2f2 (red-50)
│   └─ Badge: Red with "Weak" label
│
├─ Passable (2-3)
│   ├─ Gauge: Amber (#f59e0b → #d97706)
│   ├─ Background: #fffbeb (amber-50)
│   └─ Badge: Amber with "Passable" label
│
├─ Defendable (4)
│   ├─ Gauge: Lime (#84cc16 → #65a30d)
│   ├─ Background: #f7fee7 (lime-50)
│   └─ Badge: Lime with "Defendable" label
│
└─ Strong (5)
    ├─ Gauge: Green (#22c55e → #16a34a)
    ├─ Background: #f0fdf4 (emerald-50)
    └─ Badge: Green with "Strong" label + ✓

Completion Chart (Recharts):
├─ Complete: #22c55e (green-500)
├─ In Progress: #f59e0b (amber-500)
└─ Not Started: #ef4444 (red-500)
```

## Type System Architecture

```
Core Types (types.ts)
├─ StrengthRating: 1 | 2 | 3 | 4 | 5
├─ StrengthStatus: 'weak' | 'passable' | 'defendable' | 'strong'
├─ IssueSeverity: 'critical' | 'moderate' | 'minor'
│
├─ Interface: FixOption
│   ├─ id: string
│   ├─ label: string
│   └─ checked: boolean
│
├─ Interface: Issue
│   ├─ id: string
│   ├─ severity: IssueSeverity
│   ├─ description: string
│   ├─ rootCause: string
│   ├─ fixOptions: FixOption[]
│   ├─ guidance: string
│   └─ exampleLink?: string
│
├─ Interface: Gap
│   ├─ id: string
│   ├─ category: string
│   ├─ description: string
│   ├─ required: boolean
│   └─ status: 'open' | 'resolved'
│
├─ Interface: ProspectusSection
│   ├─ id: string
│   ├─ name: string
│   ├─ strength: StrengthRating
│   ├─ status: StrengthStatus
│   ├─ issueCount: number
│   ├─ gapCount: number
│   ├─ completeness: number (0-100)
│   ├─ issues: Issue[]
│   └─ gaps: Gap[]
│
├─ Interface: ProspectusStats
│   ├─ totalSections: number
│   ├─ averageStrength: number
│   ├─ totalIssues: number
│   ├─ totalCritical: number
│   ├─ totalModerate: number
│   ├─ totalMinor: number
│   ├─ totalGaps: number
│   ├─ averageCompleteness: number
│   ├─ sectionsComplete: number
│   ├─ sectionsInProgress: number
│   └─ sectionsNotStarted: number
│
└─ Helper Functions
    ├─ getStrengthStatus(strength) → StrengthStatus
    ├─ calculateCompletenessIncrease(section) → number
    └─ calculateProspectusStats(sections) → ProspectusStats
```

## Hook Architecture

```
useProspectusValidator(initialSections)
│
├─ State Management
│   ├─ sections: ProspectusSection[]
│   ├─ expandedSections: Set<string>
│   └─ severityFilter: 'all' | IssueSeverity
│
├─ Computed Values (useMemo)
│   ├─ filteredSections: ProspectusSection[]
│   ├─ stats: ProspectusStats
│   ├─ criticalIssueCount: number
│   ├─ isProspectusReady: boolean
│   └─ recommendations: string[]
│
├─ Actions (useCallback)
│   ├─ toggleSection(sectionId): void
│   ├─ expandAll(): void
│   ├─ collapseAll(): void
│   ├─ resolveIssue(sectionId, issueId): void
│   ├─ resolveGap(sectionId, gapId): void
│   ├─ updateSection(sectionId, updates): void
│   ├─ updateSections(updates[]): void
│   ├─ resolveAllIssuesInSection(sectionId): void
│   └─ setSeverityFilter(severity): void
│
└─ Queries
    ├─ getSection(sectionId): ProspectusSection | undefined
    └─ getIssue(sectionId, issueId): Issue | undefined

useProspectusValidatorSync(sections, onUpdate)
│
├─ State
│   ├─ isSyncing: boolean
│   └─ syncError: Error | null
│
└─ Actions
    ├─ syncSection(sectionId, data): Promise<void>
    └─ syncAllSections(): Promise<void>

useValidatorAnalytics()
│
└─ Actions
    ├─ trackIssueResolved(sectionId, issueId, severity)
    ├─ trackSectionExpanded(sectionId)
    └─ trackFilterChanged(severity)
```

## Performance Optimization Techniques

```
1. Memoization
   ├─ useMemo: filteredSections (depends on severityFilter)
   ├─ useMemo: stats (depends on sections)
   ├─ useCallback: All action handlers
   └─ React.memo: Could be added to cards for large lists

2. Lazy Rendering
   ├─ AnimatePresence: Only render expanded details
   ├─ Conditional rendering: issues/gaps only if present
   └─ Details expand on demand

3. Virtual Scrolling (Future enhancement)
   └─ For 100+ sections, implement react-window

4. Code Splitting
   ├─ Component: separate from utilities
   ├─ Hooks: separate from component
   └─ Types: separate module for tree-shaking

5. Animation Optimization
   ├─ GPU acceleration: transform + opacity only
   ├─ Framer Motion: uses requestAnimationFrame
   └─ No expensive calculations during animation

6. Re-render Optimization
   ├─ keys: each item has stable key
   ├─ Avoid creating new objects in render
   └─ useMemo for expensive computations
```

## Testing Strategy

```
Unit Tests
├─ Utilities (getStrengthStatus, etc.)
│   └─ Edge cases for each function
│
├─ Hooks
│   ├─ State initialization
│   ├─ Action execution
│   ├─ Computed value correctness
│   └─ Edge cases (empty arrays, null values)
│
└─ TypeScript
    └─ All types compile without errors

Component Tests
├─ Rendering
│   ├─ Components mount without errors
│   ├─ Props are rendered correctly
│   └─ Empty states display
│
├─ Interactions
│   ├─ Section expansion/collapse
│   ├─ Issue resolution
│   ├─ Filter changes
│   └─ Callbacks are invoked
│
└─ Accessibility
    ├─ Semantic HTML
    ├─ Keyboard navigation
    └─ Focus management

Integration Tests
├─ Full workflow (expand → view → resolve)
├─ Multiple sections
├─ Stat aggregation
└─ API integration

Snapshot Tests (Optional)
└─ Component output for regression detection
```

## Scalability Considerations

```
Current Design Supports:
├─ 50+ sections without performance degradation
├─ 100+ issues/gaps per section
└─ Real-time updates across multiple sections

Optimization for Larger Datasets (Future):
├─ Virtual scrolling (react-window)
├─ Pagination of issues
├─ Lazy-load detailed section info
├─ Debounced API sync
└─ Caching layer

Memory Management:
├─ Set for expandedSections (O(1) lookup)
├─ useMemo to prevent recalculation
├─ Proper cleanup in useEffect (no memory leaks)
└─ No circular references in data structures
```

## Security Considerations

```
1. Data Validation
   ├─ TypeScript ensures type safety
   └─ No user input directly rendered (all escaped)

2. XSS Prevention
   ├─ React escapes by default
   └─ No dangerouslySetInnerHTML

3. API Integration
   └─ Must validate API responses before using

4. Authentication
   └─ Handle in parent component (not in validator)
```

## Browser Compatibility

```
Modern Browsers (ES2020+)
├─ Chrome/Edge 90+: Full support
├─ Firefox 88+: Full support
├─ Safari 14+: Full support
│   └─ Note: CSS Grid & Flexbox support
│
└─ Fallbacks
    ├─ CSS Grid → Flexbox fallback (graceful)
    ├─ SVG → Supported in all modern browsers
    └─ Animations → Respects prefers-reduced-motion

Older Browsers (Not officially supported)
├─ IE 11: Not supported
└─ Requires transpilation for older versions
```

---

**Architecture designed for scalability, maintainability, and performance.**
