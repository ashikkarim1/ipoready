# Reconciliation Engine UI Components

A world-class financial reconciliation cockpit that visually shows data alignment across PACE, Financials, Prospectus, and Cap Table systems.

## Overview

The Reconciliation Engine provides IPOReady users with a comprehensive view of data consistency across all major financial data sources. It identifies misalignments, quantifies their impact, and provides actionable recommendations for resolution.

## Components

### ReconciliationDashboard (Main Component)

The primary entry point that orchestrates all sub-components and manages state.

```tsx
import { ReconciliationDashboard } from '@/components/reconciliation'

function MyPage() {
  return (
    <ReconciliationDashboard
      metrics={metricsData}
      issues={issuesData}
      rules={rulesData}
      onRefresh={handleRefresh}
      onExportPDF={handleExport}
      autoRefreshInterval={300000}
    />
  )
}
```

**Props:**
- `metrics`: Array of `MetricAlignment` objects
- `issues`: Array of `ReconciliationIssue` objects
- `rules`: Array of `AlertRule` objects
- `onRefresh`: Callback when user clicks "Refresh Now"
- `onExportPDF`: Callback to export reconciliation report
- `autoRefreshInterval`: Milliseconds between auto-refreshes (default: 5 minutes)

### ReconciliationHeatmap

Visual grid showing alignment status across data sources.

```tsx
<ReconciliationHeatmap
  metrics={metrics}
  onCellClick={metric => console.log(`Clicked: ${metric}`)}
/>
```

**Features:**
- Color-coded cells (Green: Aligned, Yellow: Review, Red: Critical)
- Interactive cell selection
- Variance percentage display
- Status legend
- Responsive scrolling on mobile

### ReconciliationRadar

Radar chart showing completeness and alignment across all metrics.

```tsx
<ReconciliationRadar metrics={metrics} />
```

**Features:**
- 8-point radar (one per metric)
- Combines completeness and data presence scoring
- Interactive tooltips
- Color-coded zones (Perfect 90-100%, Review 50-89%, Critical <50%)

### MismatchDetailView

Modal dialog for detailed analysis of specific metric misalignments.

```tsx
<MismatchDetailView
  metric={selectedMetric}
  onClose={() => setSelected(null)}
  onUpdate={handleUpdate}
/>
```

**Features:**
- Side-by-side source comparison
- Impact assessment with financial implications
- Explanation text field
- Mark as resolved functionality
- Suggested fix options
- Change history

### ReconciliationStats

Summary statistics card showing overall health score and breakdown.

```tsx
<ReconciliationStats
  stats={{ aligned: 5, needsReview: 2, critical: 1 }}
/>
```

**Features:**
- Overall health percentage
- Status breakdown cards
- Progress bar visualization
- Percentage-of-total calculations

### ReconciliationTrendView

Timeline visualization and change log.

```tsx
<ReconciliationTrendView lastRefreshTime={new Date()} />
```

**Features:**
- 7-day stacked area chart
- Recent changes log with user attribution
- Timestamp formatting
- Status trend indicators
- Full history link

## Data Types

### MetricAlignment

```typescript
interface MetricAlignment {
  metricId: string
  metric: string // e.g., "Revenue", "Growth%", "Burn Rate"
  pace_value: string | number
  financial_value: string | number
  prospectus_value: string | number
  cap_table_value: string | number
  status: 'aligned' | 'needs_review' | 'critical'
  variance_percent: number // 0-100
  isExplained: boolean
  explanation?: string
  lastUpdated?: Date
}
```

### ReconciliationIssue

```typescript
interface ReconciliationIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  metric: string
  source1: string
  source2: string
  value1: string | number
  value2: string | number
  variance: number // percentage
  impact: string // e.g., "Could affect valuation by $5M"
  suggestedFix: string
}
```

### AlertRule

```typescript
interface AlertRule {
  metric: string
  max_variance_percent: number
  enabled: boolean
}
```

## Severity Levels

### Green (Aligned) - ✓
- **Threshold**: < 5% variance
- **Color**: `bg-green-50 / border-green-300`
- **Icon**: `CheckCircle2`
- **Meaning**: Data sources are internally consistent

### Yellow (Needs Review) - ⚠
- **Threshold**: 5-10% variance
- **Color**: `bg-yellow-50 / border-yellow-300`
- **Icon**: `AlertTriangle`
- **Meaning**: Variance exists but may be intentional; document the reason

### Red (Critical) - 🔴
- **Threshold**: > 10% variance
- **Color**: `bg-red-50 / border-red-300`
- **Icon**: `AlertCircle`
- **Meaning**: Significant conflict requiring immediate attention

## Cross-Validation Rules

Default rules (all enabled by default):

| Metric | Max Variance | Rationale |
|--------|-------------|-----------|
| Revenue | ±5% | Core financial metric; small variance acceptable |
| Growth % | ±2% | Highly visible; strict alignment required |
| Headcount | 0% | Must match exactly (except future projections) |
| Burn Rate | ±10% | Volatile; higher threshold acceptable |
| Runway | ±5% | Critical for planning; moderate tolerance |
| Unit Economics | ±8% | Growth efficiency; moderate tolerance |

## Usage Example

```tsx
'use client'

import { useState } from 'react'
import { ReconciliationDashboard, type MetricAlignment } from '@/components/reconciliation'

export default function ReconciliationPage() {
  const [metrics, setMetrics] = useState<MetricAlignment[]>([
    {
      metricId: '1',
      metric: 'Revenue',
      pace_value: '$45.2M',
      financial_value: '$45.1M',
      prospectus_value: '$45M+',
      cap_table_value: 'N/A',
      status: 'aligned',
      variance_percent: 0.22,
      isExplained: false,
    },
    // ... more metrics
  ])

  const handleRefresh = async () => {
    // Fetch latest data from your API
    const response = await fetch('/api/reconciliation/check')
    const data = await response.json()
    setMetrics(data.metrics)
  }

  const handleExport = async () => {
    // Generate and download PDF
    const response = await fetch('/api/reconciliation/export-pdf', {
      method: 'POST',
      body: JSON.stringify({ metrics }),
    })
    const blob = await response.blob()
    // ... download logic
  }

  return (
    <ReconciliationDashboard
      metrics={metrics}
      issues={[]}
      rules={[]}
      onRefresh={handleRefresh}
      onExportPDF={handleExport}
    />
  )
}
```

## Styling

The component uses Tailwind CSS v4 with the following utility classes:

### Colors
- **Success**: `green-50/green-600/green-700`
- **Warning**: `yellow-50/yellow-600/yellow-700`
- **Error**: `red-50/red-600/red-700`
- **Info**: `blue-50/blue-600/blue-700`
- **Background**: `slate-50/slate-100/slate-900`

### Responsive Breakpoints
- `md:`: 768px (2-column layouts)
- `lg:`: 1024px (3-column layouts)

### Dark Mode
All components include full dark mode support using `dark:` prefix classes.

## Animations

Uses Framer Motion for smooth transitions:
- **Initial load**: Staggered opacity/y-axis fade
- **Cell hover**: Subtle scale (1.02)
- **Modal**: Smooth scale and opacity
- **Charts**: Animated path drawing

## Performance Considerations

1. **Memoization**: Used in radar chart data transformation
2. **Lazy rendering**: Modal only renders when selected
3. **Chart optimization**: Area/radar charts use Recharts defaults
4. **Image assets**: Icons from Lucide (vector SVG)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color not sole indicator (icons + text)
- Sufficient color contrast (WCAG AA)

## Integration Points

### Backend API Endpoints (Expected)

```
GET /api/reconciliation/metrics - Fetch current metrics
GET /api/reconciliation/issues - Fetch detected issues
GET /api/reconciliation/history - Fetch change log
POST /api/reconciliation/check - Trigger reconciliation
POST /api/reconciliation/explain - Save metric explanation
POST /api/reconciliation/export-pdf - Export report
```

### Real-time Updates

For auto-refresh, implement a polling mechanism or WebSocket:

```tsx
useEffect(() => {
  if (!autoRefreshEnabled) return

  const interval = setInterval(async () => {
    const response = await fetch('/api/reconciliation/metrics')
    const data = await response.json()
    setMetrics(data)
  }, autoRefreshInterval)

  return () => clearInterval(interval)
}, [autoRefreshEnabled, autoRefreshInterval])
```

## Testing

Key test scenarios:

1. **Heatmap rendering**: 8 metrics × 4 sources = 32 cells
2. **Cell interactions**: Click opens modal
3. **Modal actions**: Save explanation, mark resolved
4. **Severity indicators**: Green/Yellow/Red status changes
5. **Chart data**: Area and radar charts render with sample data
6. **Responsive layout**: Mobile (1 col), tablet (2 col), desktop (3 col)

## Future Enhancements

1. **Custom rules builder**: UI to create validation rules
2. **Webhook notifications**: Alert users to critical variances
3. **Batch operations**: Resolve multiple issues at once
4. **Advanced filters**: Filter by severity, metric, date range
5. **Predictive reconciliation**: AI-powered variance detection
6. **Collaborative notes**: @mention stakeholders for review
7. **Version comparison**: Side-by-side metric version diffing
8. **Auto-fix suggestions**: Proposed corrections with one-click apply

## License

Part of IPOReady. All rights reserved.
