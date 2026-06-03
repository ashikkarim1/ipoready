# Build 2A.3: Cap Table Dilution Scenarios Component

## Overview

The **DilutionScenariosComponent** provides a comprehensive pre/post-split modeling interface for analyzing cap table dilution under various IPO financing scenarios. It visualizes ownership changes, share count impacts, and dilution percentages with interactive scenario comparisons.

## Features

### 1. Pre/Post Split Modeling Interface
- **Default Cap Table**: 50M shares across 5 existing shareholders
  - Founder A: 15M shares (30%)
  - Founder B: 12M shares (24%)
  - Series A VC: 10M shares (20%)
  - Series B VC: 8M shares (16%)
  - Employee Pool: 5M shares (10%)

- **Scenario Application**:
  - Calculates new shares from financing raises
  - Adds new shareholders (Series C VC)
  - Expands employee options pools
  - Automatically recalculates ownership percentages

### 2. Demo Scenarios (3 IPO Dilution Patterns)

#### Scenario 1: Conservative Raise
- **Raise Amount**: $50M at $25/share = 2M new shares
- **Options Pool**: 1.5M new shares
- **Total Dilution**: 7.0%
- **Avg Shareholder Dilution**: ~1.56%
- **New Cap**: 53.5M shares

#### Scenario 2: Aggressive Raise
- **Raise Amount**: $100M at $30/share = 3.33M new shares
- **Options Pool**: 3M new shares
- **Total Dilution**: 12.0%
- **Avg Shareholder Dilution**: ~2.70%
- **New Cap**: 56.33M shares

#### Scenario 3: Growth + Equity
- **Raise Amount**: $75M at $28/share = 2.68M new shares
- **Options Pool**: 2.5M new shares
- **Total Dilution**: 10.3%
- **Avg Shareholder Dilution**: ~2.32%
- **New Cap**: 55.18M shares

### 3. Visual Comparisons

#### Pie Charts: Ownership Distribution
- **Before Raise**: Shows pre-IPO cap table ownership split
- **After Raise**: Shows post-raise ownership percentages
- Color-coded for easy identification of stakeholders

#### Bar Chart: Share Count Comparison
- Side-by-side comparison of shares pre/post raise
- Clearly shows new shareholder position
- Y-axis: Shares in millions

#### Bar Chart: Ownership % Dilution
- Visualizes dilution impact on each shareholder
- Pre-raise % vs. Post-raise % for existing holders
- Shows percentage point reduction in ownership

### 4. Detailed Analysis Tables

**Ownership Analysis Table**:
| Column | Description |
|--------|-------------|
| Shareholder | Entity name |
| Pre-Raise Shares | Shares before new raise (millions) |
| Pre-Raise % | Ownership percentage before raise |
| Post-Raise % | Ownership percentage after raise |
| Dilution % | Percentage point decrease |

### 5. Key Metrics Display

**Three Core KPIs**:
1. **Total Dilution**: New shares as % of post-raise cap
   - Formula: (new_shares / post_cap) * 100
   - Icon: TrendingDown (orange)

2. **Avg Shareholder Dilution**: Average % point loss per existing shareholder
   - Formula: Sum of (pre% - post%) / count
   - Icon: Users (blue)

3. **Post-Raise Cap**: Total shares outstanding after round
   - Includes new raise + options pool
   - Icon: Zap (green)

## Component Architecture

### Type Definitions

```typescript
interface CapTableSnapshot {
  totalShares: number
  shareholders: CapTableShareholder[]
}

interface ScenarioParams {
  newRaiseAmount: number      // In dollars
  pricePerShare: number       // Price per share
  newOptionsPool: number      // New shares for options
  splitRatio?: number         // Optional stock split ratio
}

interface DilutionScenario {
  name: string
  description: string
  params: ScenarioParams
  before: CapTableSnapshot
  after: CapTableSnapshot
  metrics: {
    totalDilution: number
    averageDilution: number
    newShares: number
    totalSharesIssued: number
  }
}
```

### Helper Functions

**calculateOwnershipPercent(shares, totalShares)**
- Returns percentage ownership
- Handles decimal precision

**applyScenario(currentCapTable, params)**
- Simulates financing round
- Returns new cap table + shares issued
- No mutations to input data

**generateScenarios()**
- Creates 3 pre-built demo scenarios
- Applies realistic IPO patterns
- Returns scenario array

### Components

1. **ScenarioCard**
   - Clickable selector for scenarios
   - Shows dilution % and new shares
   - Indicates selected state

2. **ComparisonTable**
   - Displays ownership before/after
   - Calculates dilution per shareholder
   - Includes new shareholders

3. **OwnershipChart**
   - Pie charts (before/after)
   - Color-coded stakeholders
   - Tooltips with percentages

4. **ShareCountChart**
   - Bar chart comparing share counts
   - Pre-raise vs. post-raise
   - Millions of shares on Y-axis

5. **OwnershipPercentageChart**
   - Shows % point changes
   - Green (pre) vs. Red (post)
   - Illustrates dilution impact

6. **DilutionScenariosComponent** (Main)
   - Manages scenario selection state
   - Orchestrates all subcomponents
   - Displays key insights

## Usage

### Import
```typescript
import { DilutionScenariosComponent } from '@/components/DilutionScenariosComponent'
```

### Render
```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DilutionScenariosComponent />
    </div>
  )
}
```

### Access Demo
- Route: `/dilution-demo`
- Shows fully interactive component
- All 3 scenarios available

## Data Flow

```
generateScenarios()
    ↓
[Scenario1, Scenario2, Scenario3]
    ↓
selectedScenarioIdx (state)
    ↓
selectedScenario = scenarios[selectedScenarioIdx]
    ↓
All subcomponents consume:
  - selectedScenario.before (cap table)
  - selectedScenario.after (cap table)
  - selectedScenario.metrics (KPIs)
  - selectedScenario.params (raise details)
```

## Styling

- **Theme**: Tailwind CSS v4
- **Colors**: Slate (primary), Blue (highlights), Green (positive), Red (dilution)
- **Dark Mode**: Full dark mode support
- **Responsive**: Grid layouts adapt to mobile

### Key Classes
- `.dark:bg-slate-800` - Dark mode backgrounds
- `.dark:text-white` - Dark mode text
- `grid grid-cols-3 gap-4` - Multi-column layouts
- `rounded-lg shadow-sm border` - Card styling

## Integration Points

### Can be integrated into:
1. **Dashboard**: Cap table section
2. **Analysis Page**: Equity modeling tools
3. **IPO Prep Checklist**: Capitalization readiness
4. **Reports**: Export dilution analysis

### Dependencies
- `recharts` (^3.8.1) - Charts
- `react` (^19.0.0) - UI framework
- `lucide-react` - Icons
- `tailwindcss` (^4.0.0) - Styling

## Example Outputs

### Conservative Raise
- Initial cap: 50M shares
- Raise: 2M shares at $25/share
- New pool: 1.5M shares
- Final cap: 53.5M shares
- Dilution: 7.0%

**Impact on Founder A**:
- Before: 15M shares (30%)
- After: 15M shares (28.04%)
- Dilution: -1.96%

### Aggressive Raise
- Initial cap: 50M shares
- Raise: 3.33M shares at $30/share
- New pool: 3M shares
- Final cap: 56.33M shares
- Dilution: 12.0%

**Impact on Founder A**:
- Before: 15M shares (30%)
- After: 15M shares (26.62%)
- Dilution: -3.38%

## Key Insights Generated

The component auto-generates insights that show:
1. Average dilution experienced by existing shareholders
2. New capital injection as % of post-raise cap
3. Total shares outstanding post-round
4. Employee pool expansion for pre-IPO hiring

## Future Enhancement Opportunities

1. **Stock Split Support**: Apply split ratio to all shareholders
2. **Weighted Dilution**: Account for different share classes
3. **Custom Scenarios**: Allow users to input custom raises
4. **Export to CSV**: Download detailed analysis
5. **Waterfall Chart**: Show dilution progression
6. **Series Comparison**: Compare across multiple funding rounds
7. **Founding Timeline**: Show dilution at each financing stage
8. **Valuation Impact**: Show pre-money and post-money valuations

## Testing Scenarios

All 3 demo scenarios represent typical IPO patterns:
- **Conservative**: Small strategic round
- **Aggressive**: Large Series C round typical before IPO
- **Growth**: Balanced approach with equity expansion

## Notes for Implementers

- Component is fully client-side with no API calls required
- All calculations use JavaScript with floating-point precision
- Ownership percentages calculated with 2 decimal precision
- Share counts rounded to nearest 1,000 shares
- Dark mode automatically applied based on system/app preference
