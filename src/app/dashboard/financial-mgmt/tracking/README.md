# Financial KPI Dashboard - Tracking Module

## Overview

The Financial KPI Dashboard tracks IPO project costs, budget vs. actual spending, and financial risks in real-time. This module provides board-ready financial reporting with dark mode support, responsive design, and PDF export capabilities.

## Architecture

### Directory Structure

```
src/app/dashboard/financial-mgmt/tracking/
├── page.tsx                    # Main dashboard page
├── layout.tsx                  # Layout wrapper
└── README.md                   # This file

src/components/
├── FinancialKPICard.tsx        # Individual KPI card component
├── FinancialMonthlyChart.tsx   # Budget vs Actual line/bar chart
├── FinancialRiskFactors.tsx    # Risk analysis section
└── FinancialSummaryCard.tsx    # Board-ready summary with export

src/app/api/financial/tracking/
└── route.ts                    # Data fetch endpoint
```

### Database Schema

Built on existing `financial_tracking` and `ipo_costs` tables from migration `016_ipo_costs_and_tracking.sql`:

**financial_tracking** - Monthly budget vs actual comparison
- fiscal_year, fiscal_month
- total_budget_usd, total_actual_usd
- Detailed budget breakdown by category (legal, audit, accounting, etc.)
- variance_status: 'on_budget' | 'over_budget' | 'under_budget'
- variance_percentage

**ipo_costs** - Individual cost items
- cost_category: 'legal', 'audit', 'investment_banking', 'accounting', 'consulting', 'underwriting', 'printing', 'roadshow', 'listing_fees', 'other'
- cost_type: 'labor_hours' | 'hard_cost' | 'estimated_fee'
- status: 'estimated', 'incurred', 'paid', 'pending_approval'
- labor_hours, hourly_rate_usd
- hard_cost_usd, vendor_name, invoice_number
- phase_id, milestone_name, planned_completion_date, actual_completion_date

## Components

### 1. FinancialKPICard
Displays individual KPI metrics with status indicators and trends.

**Props:**
```typescript
interface FinancialKPICardProps {
  title: string
  value: number | string
  format?: 'currency' | 'months' | 'percentage' | 'items'
  trend?: 'up' | 'down' | 'neutral'
  trendPercent?: number
  icon: 'dollar' | 'zap' | 'trending' | 'calendar'
  description?: string
  status?: 'good' | 'warning' | 'critical'
}
```

**Features:**
- Color-coded status badges (green/yellow/red)
- Trend indicators with percentage changes
- Icon support with Lucide icons
- Responsive grid layout

### 2. FinancialMonthlyChart
Recharts-based visualization showing budget vs actual spending over time.

**Features:**
- Composed chart (bars for budget, line for actual)
- Custom tooltip with formatted currency
- Variance percentage overlay
- Responsive container
- 24-month historical data display
- Y-axis auto-formatting ($M, $K, etc.)

### 3. FinancialRiskFactors
Risk analysis section with severity indicators and mitigation recommendations.

**Features:**
- Critical/Warning/Low risk classification
- Color-coded risk cards
- Delay cost impact calculation
- Risk exposure totals
- Mitigation step recommendations
- Follow-up action items

### 4. FinancialSummaryCard
Board-ready executive summary with PDF export.

**Features:**
- Company name and report date
- Budget status indicator (on track/over budget)
- Key metrics grid (budget, actual, remaining, burn rate)
- Runway analysis with visual indicator
- Footer notes and disclaimers
- Export to PDF button (placeholder)

## API Endpoint

### GET /api/financial/tracking

Returns comprehensive financial tracking data.

**Response:**
```typescript
{
  summary: {
    estimated_cost: number
    actual_spent: number
    monthly_burn_rate: number
    runway_months: number
    variance_pct: number
  }
  kpis: {
    total_incurred_items: number
    pending_milestones: number
    pending_amount_usd: number
    next_milestone_date: string | null
  }
  risks: {
    delay_cost_per_day_usd: number
    estimated_days_delay: number
    total_risk_exposure_usd: number
  }
  monthly_tracking: Array<{
    month: string          // "YYYY-MM"
    budget: number
    actual: number
    variance_pct: number
    status: string
  }>
  by_category: Array<{
    category: string
    labor_hours: number
    labor_usd: number
    hard_cost_usd: number
    total_usd: number
    count: number
    avg_hourly_rate: number
  }>
}
```

**Logic:**
1. Fetches monthly financial_tracking records (last 24 months)
2. Aggregates ipo_costs by category for incurred/paid items
3. Calculates metrics:
   - Monthly burn rate (average monthly actual spending)
   - Runway months = (estimated_total_budget - actual_spent) / monthly_burn_rate
   - Variance percentage
4. Calculates risk factors:
   - Delay cost per day: $25,000 (configurable)
   - Estimated days delay from pace_sequencing_alerts (currently 0)
   - Total exposure = delay_cost_per_day * estimated_days_delay

## Page Features

### Dark Mode Support
- Uses Tailwind v4 with dark: prefix utilities
- Automatic system preference detection via next-themes (if integrated)
- Color scheme: Slate palette for dark, brand colors for accents

### Typography Hierarchy
```
Page title:     text-4xl font-bold
Section title:  text-xl font-semibold
Card title:     text-lg font-semibold / text-sm font-medium
Body text:      text-sm / text-xs
Labels:         text-xs text-slate-600
```

### Responsive Design
- Mobile-first approach
- Grid breakpoints: md (768px), lg (1024px)
- Cards stack vertically on mobile
- Table scrolls horizontally on small screens
- Touch-friendly spacing and buttons

### KPI Card Display
4-column grid on desktop, 2-column on tablet, 1-column on mobile:
- Estimated Cost (blue)
- Actual Spent (red)
- Monthly Burn Rate (amber)
- Runway (calendar icon)

### Monthly Chart
- Full-width responsive container
- 350px default height
- Customizable via height prop
- Auto-legend with color coding

### Risk Section
- Risk summary banner (critical/warning counts)
- Delay cost impact box
- Individual risk factor cards
- Mitigation recommendations

### Summary Card
- Executive summary metrics grid (4 columns)
- Runway visual progress bar
- Color indicators:
  - Green (0-100%): 12+ months
  - Yellow (0-100%): 6-12 months
  - Red (0-100%): <6 months
- PDF export button

### Category Breakdown Table
- Horizontal scroll on mobile
- Sortable columns (future enhancement)
- Totals row with bold font
- Hover state highlighting
- Currency formatting with comma separators

## Usage

### Basic Integration
```tsx
import FinancialTrackingPage from '@/app/dashboard/financial-mgmt/tracking/page'

// Already server-side rendered with data fetching
```

### Accessing the Page
```
/dashboard/financial-mgmt/tracking
```

### Authentication
- Protected via NextAuth middleware (enforced at edge)
- Requires valid session and companyId
- API endpoint returns 401 if unauthorized

## Data Flow

1. **Page Load** → useEffect fetches /api/financial/tracking
2. **API Endpoint** → Queries financial_tracking and ipo_costs tables
3. **Data Aggregation** → Calculates KPIs, risk factors, monthly trends
4. **Component Rendering** → KPI cards, chart, risk factors, summary
5. **User Actions** → Export PDF (button ready for implementation)

## Configuration

### Configurable Constants
In `/api/financial/tracking/route.ts`:
- `estimatedTotalIPOBudget = 2500000` // $2.5M default
- `delayRiskFactor = 25000` // $25k per day of delay

### Monthly Data Limit
- Fetches last 24 months of financial_tracking records
- Adjustable via LIMIT clause in SQL query

### Risk Severity Thresholds
In `page.tsx`:
- Days delay > 14 = critical, < 14 = warning
- Variance > 10% = critical, > 5% = warning, < 5% = good
- Runway < 3 months = critical, < 6 months = warning, > 6 months = good

## Future Enhancements

### Phase 2
1. **PDF Export** - Implement using pdfkit or jsPDF
   - Board-ready formatting
   - Company logo and branding
   - Digital signature field
   - Downloadable/email delivery

2. **Forecasting** - Add projection models
   - Trend-based forecasts
   - Scenario analysis (optimistic/pessimistic)
   - What-if analysis tools

3. **Comparisons** - Peer benchmarking
   - Compare to IPO cost benchmarks
   - Historical data from PACE database
   - Industry-specific metrics

4. **Alerts** - Proactive notifications
   - Budget threshold alerts
   - Milestone delay warnings
   - Runway low-fuel indicators

5. **Data Entry** - Cost management UI
   - Add/edit ipo_costs entries
   - Bulk upload from spreadsheets
   - Invoice attachment and OCR

6. **Integration** - Real-time data sync
   - Connect to accounting systems (QuickBooks, Netsuite)
   - Auto-pull actual spending from billing system
   - Update ipo_costs.status on payment

## Testing

### Sample Data Setup
```sql
-- Insert sample financial tracking data
INSERT INTO financial_tracking (company_id, fiscal_year, fiscal_month, total_budget_usd, total_actual_usd, variance_status)
VALUES 
  (?, 2024, 1, 250000, 245000, 'on_budget'),
  (?, 2024, 2, 275000, 290000, 'over_budget'),
  (?, 2024, 3, 300000, 298000, 'on_budget');

-- Insert sample IPO costs
INSERT INTO ipo_costs (company_id, cost_category, cost_type, description, labor_hours, hourly_rate_usd, status)
VALUES
  (?, 'legal', 'labor_hours', 'General Counsel review', 40, 350, 'incurred'),
  (?, 'audit', 'hard_cost', 'External auditor retainer', NULL, NULL, 'paid'),
  (?, 'accounting', 'labor_hours', 'CFO time tracking', 80, 300, 'incurred');
```

## Performance Notes

- Queries use indexed columns (company_id, fiscal_year, fiscal_month, status)
- Recharts LineChart/BarChart optimized for < 100 data points
- Data fetching is client-side (force-dynamic) for fresh data on each load
- Consider implementing caching strategy in production

## Accessibility

- Color not the only indicator (icons + text)
- Proper heading hierarchy (h1 → h4)
- Focus states on interactive elements
- Currency formatting for screen readers
- Alt text on Lucide icons via aria-label (future)

## Styling Notes

- Uses Tailwind CSS v4 (postcss)
- Dark mode classes available but not explicitly used in page.tsx
- Gradient background: slate-50 to slate-100
- Border/divider color: slate-200
- Text hierarchy with slate-600/700/900

## Troubleshooting

**"No data available" message**
- Check if ipo_costs entries exist for the company
- Verify status is 'incurred' or 'paid' (not 'estimated')
- Check financial_tracking monthly records

**Incorrect runway calculation**
- Verify monthly_burn_rate is > 0
- Check estimatedTotalIPOBudget matches company profile
- Compare to manual calculation: (budget - spent) / monthly_rate

**Chart not rendering**
- Ensure monthly_tracking array has at least 1 entry
- Check recharts is properly installed (package.json)
- Verify data format: month (string), budget/actual (numbers)

## Support

For issues or feature requests, contact the IPOReady product team.
