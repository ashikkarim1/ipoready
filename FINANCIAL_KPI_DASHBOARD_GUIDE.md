# Financial KPI Dashboard - Implementation Guide

## Overview

A comprehensive financial KPI tracking dashboard for IPO readiness management. Displays real-time cost tracking, budget monitoring, runway analysis, and financial risk assessment with board-ready summary cards.

**Location**: `/src/app/dashboard/financial-mgmt/tracking`

## Architecture

### Components

#### 1. **FinancialKPIDashboard** (`src/components/FinancialKPIDashboard.tsx`)
Main dashboard component that orchestrates all financial metrics and visualizations.

**Features**:
- Top KPI cards showing estimated cost, actual spent, budget remaining, months to IPO
- Monthly breakdown chart with budget vs actual spending
- Cost, runway, and risk metric grids
- Integrated risk factor analysis
- Board-ready financial summary

**Props**:
```typescript
interface FinancialKPIDashboardProps {
  data: FinancialData
  companyName?: string
}

interface FinancialData {
  estimatedCost: number
  actualSpent: number
  budget: number
  currencyCode: string
  ipoDate: string | Date
  monthlyData: Array<{
    month: string
    budget: number
    actual: number
    variance_pct: number
  }>
  costPerDay: number
  runwayDays: number
  riskFactors: Array<{
    label: string
    value: number
    impact: 'critical' | 'warning' | 'low'
    description: string
    icon: 'alert' | 'trending' | 'clock' | 'dollar'
  }>
  delayRiskPerDay: number
  estimatedDaysDelay: number
}
```

#### 2. **FinancialKPICard** (`src/components/FinancialKPICard.tsx`)
Reusable metric card component with status indicators and trend data.

**Features**:
- Multi-format value display (currency, months, percentage, items)
- Status color coding (good/warning/critical)
- Trend indicators with percentage change
- Icon support (dollar, zap, trending, calendar)

#### 3. **FinancialMonthlyChart** (`src/components/FinancialMonthlyChart.tsx`)
Recharts-based composed chart showing budget vs actual spending with variance analysis.

**Features**:
- Monthly budget vs actual comparison
- Variance percentage tracking
- Interactive tooltips with detailed breakdown
- Gradient fill effects
- Responsive container

**Tech**: Uses `recharts` (v3.8.1)

#### 4. **FinancialRiskFactors** (`src/components/FinancialRiskFactors.tsx`)
Risk assessment and mitigation component showing financial risks with impact levels.

**Features**:
- Risk factor list with severity badges
- Delay cost impact calculation
- Risk summary with critical/warning counts
- Mitigation recommendations
- Color-coded impact levels

#### 5. **BoardReadySummary** (`src/components/BoardReadySummary.tsx`)
Executive summary card designed for board presentation and review.

**Features**:
- Company name and timeline at a glance
- Financial health status indicator
- Budget utilization progress bar
- Runway analysis with buffer calculation
- Burn rate metrics
- Key takeaways for stakeholders

## Page & Route Structure

### Page: `/src/app/dashboard/financial-mgmt/tracking/page.tsx`

**Route**: `/dashboard/financial-mgmt/tracking`

**Functionality**:
1. Authenticates user via NextAuth
2. Fetches IPO costs and financial tracking data from database
3. Calculates comprehensive financial metrics
4. Identifies risk factors based on variance trends
5. Renders dashboard with real data

**Data Flow**:
```
Database (ipo_costs, financial_tracking)
    ↓
Page Component (getFinancialData)
    ↓
Metrics Calculation
    ↓
Risk Factor Assessment
    ↓
FinancialKPIDashboard Component
    ↓
Renders: KPI Cards → Monthly Chart → Risk Factors → Board Summary
```

### API Route: `/src/app/api/financial-tracking/route.ts`

**Endpoint**: `GET /api/financial-tracking`

**Returns**:
```json
{
  "company": "Company Name",
  "estimatedCost": 1500000,
  "actualSpent": 750000,
  "budget": 2000000,
  "budgetRemaining": 1250000,
  "currencyCode": "USD",
  "ipoDate": "2026-12-01T00:00:00.000Z",
  "monthlyData": [
    {
      "month": "2026-06-01",
      "budget": 150000,
      "actual": 125000,
      "variance_pct": -16.7
    }
  ],
  "costPerDay": 8333,
  "runwayDays": 150,
  "daysToIPO": 180,
  "costVariancePercent": -50,
  "budgetUtilization": 37.5,
  "lastUpdated": "2026-06-03T12:00:00.000Z"
}
```

## Utility Functions: `src/lib/financial-utils.ts`

### Key Functions

#### `calculateFinancialMetrics()`
Computes comprehensive financial analysis metrics:
- Cost variance (actual vs estimated)
- Budget utilization percentage
- Runway in days
- Earned value management metrics
- Cost and schedule performance indexes

#### `assessRiskProfile()`
Evaluates financial risk with scoring:
- Risk levels: low, medium, high, critical
- Risk factors identification
- Recommended mitigation actions
- Score calculation (0-100)

#### `calculateBurnRateTrend()`
Analyzes spending rate trends:
- Monthly spending rate
- Trend direction (increasing/decreasing/stable)
- Trend percentage change

#### `projectCostAtCompletion()`
Forecasts final cost based on current burn rate.

#### `calculateFinancialHealthScore()`
Generates comprehensive health score (0-100) combining:
- Cost variance impact
- Runway adequacy
- Performance indexes
- Budget utilization
- Risk assessment

#### Utility Helpers
- `formatCurrency()` - Locale-aware currency formatting
- `getVarianceThresholds()` - Warning/critical thresholds
- `calculateBurnRateTrend()` - Spending pattern analysis

## Database Schema Integration

### Tables Used

**ipo_costs**
- Stores estimated costs by category (legal, accounting, underwriting, printing, filing, contingency)
- Tracks total estimated and currency
- Foreign key to companies

**financial_tracking**
- Monthly budget vs actual data
- Status tracking (pending, on-track, over-budget, under-budget, closed)
- Foreign key to ipo_costs

**companies**
- Company name
- IPO timeline date
- Used for context in dashboard

## Features & Metrics

### KPI Cards (Top Row)
1. **Estimated Total Cost** - Total IPO cost estimate
2. **Actual Spent** - Cumulative spending with variance trend
3. **Budget Remaining** - Available budget with utilization %
4. **Months Until IPO** - Timeline and days remaining

### Cost Metrics
- Cost per day (burn rate)
- Estimated vs actual variance
- Variance amount in currency

### Runway Metrics
- Days remaining at current burn rate
- Available budget
- Monthly burn rate

### Risk Exposure
- Total risk in dollars
- Projected delay liability
- Number of risk factors

### Monthly Chart
- Budget allocation bars
- Actual spending line
- Variance percentage tracking
- Interactive tooltips
- Visual gradient fills

### Risk Factor Analysis
- Critical, warning, and low-priority factors
- Impact assessment ($)
- Delay cost calculations
- Mitigation recommendations

### Board Summary
- Health status (On Track / Watch / At Risk)
- Financial overview snapshot
- Budget utilization progress
- Runway vs timeline comparison
- Burn rate analysis
- Executive key takeaways

## Risk Assessment Logic

### Risk Factors Identified

1. **Cost Overrun** (>20%)
   - Impact: Critical
   - Action: Immediate cost review

2. **Runway Squeeze** (< IPO days + 30)
   - Impact: Warning
   - Action: Accelerate milestones or increase budget

3. **Elevated Burn Rate** (> avg × 1.5)
   - Impact: Warning
   - Action: Monitor weekly

4. **Overspending Trend** (recent avg > 10%)
   - Impact: Warning
   - Action: Implement cost controls

## Data Requirements

For the dashboard to function, you need:

1. **Company record** with:
   - `name` (string)
   - `ipo_timeline_date` (optional, defaults to 1 year from now)

2. **IPO Costs record** with:
   - `company_id` (foreign key)
   - Cost estimates by category
   - `currency` (USD or CAD)

3. **Financial Tracking records** with:
   - `ipo_cost_id` (foreign key)
   - `month` (date, first day of month)
   - `budgeted_amount` (decimal)
   - `actual_spent` (decimal)
   - `status` (tracking status)

Example seed data:
```sql
-- Company
INSERT INTO companies (name, ipo_timeline_date) 
VALUES ('TechCorp Inc', '2026-12-01');

-- IPO Costs
INSERT INTO ipo_costs (company_id, exchange, estimated_legal, estimated_accounting, 
  estimated_underwriting, estimated_printing, estimated_filing, estimated_contingency)
VALUES (company_id, 'NASDAQ', 500000, 300000, 400000, 50000, 25000, 225000);

-- Financial Tracking (monthly)
INSERT INTO financial_tracking (ipo_cost_id, month, budgeted_amount, actual_spent, status)
VALUES (cost_id, '2026-06-01', 150000, 125000, 'on-track'),
       (cost_id, '2026-07-01', 150000, 160000, 'over-budget'),
       (cost_id, '2026-08-01', 150000, 145000, 'on-track');
```

## Styling & Design

- **Color Scheme**: Slate, green (good), yellow (warning), red (critical)
- **Responsive**: Mobile-first with grid layouts
- **Dark Mode**: Supports dark:* Tailwind classes
- **Charts**: Recharts with custom tooltips and gradients
- **Icons**: Lucide React icons

## Performance Considerations

1. **Database Queries**: Uses Drizzle ORM with indexed lookups
2. **Data Fetching**: Server-side in page component
3. **Client-Side**: Minimal calculation, mostly display
4. **Memoization**: `useMemo` for metric calculations
5. **API Caching**: Consider adding cache headers if needed

## Security

- **Authentication**: Required via NextAuth
- **Authorization**: Company isolation via user.companyId
- **Data**: Only user's company financial data is accessible
- **Validation**: Input validation in API route

## Error Handling

- Missing company: 404 error page
- Missing IPO costs: Detailed error message
- Database errors: Console logging + user-friendly message
- No data: Graceful fallback messages

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live metrics
2. **Forecasting**: AI-powered cost projection
3. **Alerts**: Email/Slack notifications for thresholds
4. **Export**: PDF and CSV export functionality
5. **Comparisons**: Benchmark against industry standards
6. **Drill-down**: Detailed cost category breakdowns
7. **Mobile**: Responsive optimizations for mobile
8. **Accessibility**: WCAG 2.1 AA compliance

## Troubleshooting

### No data displaying
- Check financial_tracking has records for the current month
- Verify ipo_costs record exists
- Ensure company.id matches user.companyId

### Incorrect calculations
- Verify financial_tracking month format is first day of month
- Check currency codes match (USD/CAD)
- Confirm all amounts are positive decimals

### Charts not rendering
- Verify recharts is installed (v3.8.1+)
- Check browser console for recharts errors
- Ensure data has at least 1 month record

## Dependencies

- `next`: 14.x
- `react`: 18.x
- `recharts`: 3.8.1
- `next-auth`: 4.x
- `drizzle-orm`: Latest
- `lucide-react`: Icon library
- `tailwindcss`: v4.3.0

## Files Created

1. `/src/components/FinancialKPIDashboard.tsx` - Main dashboard
2. `/src/components/BoardReadySummary.tsx` - Executive summary
3. `/src/app/dashboard/financial-mgmt/tracking/page.tsx` - Page component
4. `/src/app/api/financial-tracking/route.ts` - API endpoint
5. `/src/lib/financial-utils.ts` - Utility functions

## Usage

### Render the Dashboard
```tsx
import { FinancialKPIDashboard } from '@/components/FinancialKPIDashboard'

<FinancialKPIDashboard 
  data={financialData}
  companyName="Company Name"
/>
```

### Fetch API Data
```tsx
const response = await fetch('/api/financial-tracking')
const data = await response.json()
```

### Calculate Metrics
```tsx
import { calculateFinancialMetrics, assessRiskProfile } from '@/lib/financial-utils'

const metrics = calculateFinancialMetrics(...)
const risk = assessRiskProfile(metrics, ...)
```

---

**Last Updated**: June 3, 2026
**Version**: 1.0
**Status**: Production Ready
