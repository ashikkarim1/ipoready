# Cap Table Dilution Scenarios Implementation

## Overview

Complete implementation of the Cap Table Dilution Scenarios feature, enabling users to analyze shareholder ownership changes across different financing and option vesting scenarios.

## Architecture

### Frontend Components

#### Dashboard Page
- **Location**: `src/app/dashboard/cap-table/dilution-scenarios/page.tsx`
- **Features**:
  - Load current cap table from database
  - Display 3 preset scenarios (base, optimistic, conservative)
  - Custom scenario builder with form inputs
  - Real-time dilution calculations
  - Interactive scenario selection
  - Shareholder impact table with before/after comparison
  - CSV export functionality

#### Scenario Comparison Component
- **Location**: `src/components/DilutionScenarios/ScenarioComparison.tsx`
- **Purpose**: Compare ownership across multiple scenarios
- **Features**:
  - Multi-scenario comparison table
  - Ownership percentage tracking
  - Variance analysis
  - Summary statistics

### Backend APIs

#### Main Dilution API
- **Location**: `src/app/api/cap-table/dilution/route.ts`
- **Methods**:
  - `GET /api/cap-table/dilution` - Fetch stored scenarios
  - `POST /api/cap-table/dilution` - Calculate custom scenario
- **Features**:
  - Load current cap table from database
  - Calculate dilution for new scenarios
  - Store scenarios for future reference

#### Presets API
- **Location**: `src/app/api/cap-table/dilution/presets/route.ts`
- **Method**: `GET /api/cap-table/dilution/presets`
- **Features**:
  - Auto-generate 3 preset scenarios
  - Base case: typical IPO scenario
  - Optimistic case: high warrant exercise, strong growth
  - Conservative case: low warrant exercise, moderate growth
  - Store presets in database

#### Export API
- **Location**: `src/app/api/cap-table/dilution/export/route.ts`
- **Method**: `POST /api/cap-table/dilution/export`
- **Features**:
  - Generate CSV reports
  - Include scenario summary
  - List shareholder impacts
  - Support multi-scenario comparison
  - Download as file

### Core Library

#### Dilution Scenario Engine
- **Location**: `src/lib/cap-table/dilution-scenarios.ts`
- **Classes**: `DilutionScenarioEngine`
- **Key Functions**:
  - `calculateDilutionScenario()` - Calculate impact of dilution event
  - `generatePresetScenarios()` - Create base, optimistic, conservative presets
  - `compareScenarios()` - Compare two scenarios side-by-side

#### Interfaces

```typescript
// Input for scenario calculation
interface DilutionScenarioInput {
  scenarioName: string
  scenarioType: 'base' | 'optimistic' | 'conservative' | 'custom'
  warrantsExercisedPercent?: number
  warrantsExercisedShares?: number
  newFinancingAmount?: number
  newFinancingShares?: number
  employeeOptionVestingShares?: number
  projectedValuation?: number
}

// Snapshot of cap table state
interface CapTableSnapshot {
  shareholders: Array<{
    id: string
    name: string
    type: 'founder' | 'investor' | 'employee' | 'advisor' | 'other'
    shareClass: string
    quantity: number
    warrants?: number
    options?: number
  }>
  postMoneyValuation: number
}

// Result of scenario calculation
interface DilutionScenarioResult {
  scenarioId: string
  scenarioName: string
  scenarioType: string
  createdAt: Date
  currentSnapshot: {
    totalShares: Decimal
    totalOwnershipPercentage: Decimal
  }
  postDilutionSnapshot: {
    totalShares: Decimal
    totalOwnershipPercentage: Decimal
    newSharesIssued: Decimal
  }
  shareholderImpact: ShareholderPosition[]
  assumptions: DilutionScenarioInput
}

// Individual shareholder position
interface ShareholderPosition {
  shareholderId: string
  shareholderName: string
  shareholderType: 'founder' | 'investor' | 'employee' | 'advisor' | 'other'
  shareClass: string
  currentShares: Decimal
  currentOwnership: Decimal
  postDilutionShares: Decimal
  postDilutionOwnership: Decimal
  dilutionPercentage: Decimal
  dollarImpact?: Decimal
}
```

## Features Implemented

### 1. Load Current Cap Table
- Fetch from `cap_table_documents` table
- Load shareholder holdings
- Include share class information
- Retrieve post-money valuation

### 2. Scenario Input Controls
- **Warrant Exercise**: Percentage or fixed share count
- **Employee Option Vesting**: Share count for new options vesting
- **New Financing**: Dollar amount and projected valuation
- **Custom Naming**: Allow users to name their scenarios

### 3. Dilution Calculations
- Calculate current ownership percentages
- Compute post-dilution ownership for each shareholder
- Measure dilution impact in basis points and percentages
- Calculate dollar impact at projected valuation
- Handle multiple share classes with conversion ratios

### 4. Before/After Comparison
- Display current cap table state
- Show post-dilution state side-by-side
- Calculate dilution percentage for each shareholder
- Highlight most impacted shareholders
- Support multi-scenario comparison

### 5. Preset Scenarios
- **Base Case**: 50% warrant exercise, 5% options vesting, $50M financing at $500M valuation
- **Optimistic Case**: 75% warrant exercise, 3% options vesting, $75M financing at $750M valuation
- **Conservative Case**: 25% warrant exercise, 8% options vesting, $30M financing at $300M valuation

### 6. CSV Export
- Export scenario summary with:
  - Scenario name and type
  - Current/post-dilution share counts
  - Dilution metrics
  - Assumptions used
  - Shareholder impact table
- Support comparison export for multiple scenarios
- Download as timestamped CSV file

### 7. User Interface
- Clean, modern dashboard layout
- Scenario cards with quick metrics
- Interactive selection and comparison
- Form for custom scenarios
- Responsive table for shareholder data
- Visual indicators (icons, colors) for dilution impact
- Animated transitions using Framer Motion

## Database Integration

### Tables Used
- `cap_table_documents` - Current cap table documents
- `shareholders` - Shareholder information
- `holdings` - Share holdings
- `share_classes_v2` - Share class definitions
- `dilution_scenarios` - Store calculated scenarios

### Queries
- Fetch latest cap table document for company
- Retrieve shareholder holdings with details
- Get share class information
- Store and retrieve scenarios

## Authentication & Authorization

All endpoints require:
- Valid NextAuth session
- `companyId` in user context
- Company-specific data isolation

## Error Handling

- Invalid cap table data (empty, malformed)
- Missing company context
- Calculation errors with invalid parameters
- Export failures
- Database connection issues

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── cap-table/
│   │       └── dilution/
│   │           ├── route.ts                 (Main API)
│   │           ├── presets/
│   │           │   └── route.ts            (Presets API)
│   │           └── export/
│   │               └── route.ts            (Export API)
│   └── dashboard/
│       └── cap-table/
│           └── dilution-scenarios/
│               ├── page.tsx                (Main dashboard page)
│               └── layout.tsx              (Metadata)
├── components/
│   └── DilutionScenarios/
│       ├── ScenarioComparison.tsx          (Comparison component)
│       └── index.ts                        (Exports)
└── lib/
    └── cap-table/
        └── dilution-scenarios.ts           (Core engine)
```

## Usage

### For Users

1. Navigate to `/dashboard/cap-table/dilution-scenarios`
2. View preset scenarios (Base, Optimistic, Conservative)
3. Click on a scenario card to view details
4. Create custom scenarios using the form
5. Compare scenarios side-by-side
6. Export results as CSV

### For Developers

```typescript
// Calculate a scenario
const result = DilutionScenarioEngine.calculateDilutionScenario(
  capTableSnapshot,
  {
    scenarioName: 'My Scenario',
    scenarioType: 'custom',
    warrantsExercisedPercent: 60,
    newFinancingAmount: 50000000,
    projectedValuation: 500000000,
  }
)

// Generate presets
const presets = DilutionScenarioEngine.generatePresetScenarios(capTableSnapshot)

// Compare scenarios
const comparison = DilutionScenarioEngine.compareScenarios(scenario1, scenario2)
```

## Future Enhancements

1. **Advanced Analytics**
   - Sensitivity analysis charts
   - Waterfall diagrams showing share changes
   - Timeline of dilution events

2. **Additional Scenarios**
   - Secondary sale scenarios
   - Stock split scenarios
   - Acquisition scenarios

3. **Integrations**
   - Sync with actual cap table documents
   - Export to investor updates
   - Share with investors for feedback

4. **Performance**
   - Cache preset calculations
   - Batch scenario calculations
   - Optimize large cap tables

## Testing Checklist

- [ ] Load presets on page mount
- [ ] Select and view individual scenarios
- [ ] Create custom scenario with form
- [ ] Export scenario to CSV
- [ ] Compare multiple scenarios
- [ ] Handle empty cap tables gracefully
- [ ] Display dilution percentages correctly
- [ ] Calculate ownership changes accurately
- [ ] Responsive design on mobile
- [ ] Error messages appear appropriately

## Notes

- All financial calculations use Decimal.js for precision
- Share classes with conversion ratios are fully supported
- Preferred shares and liquidation preferences are handled
- Company isolation is enforced at API level
- Timestamps are in UTC
