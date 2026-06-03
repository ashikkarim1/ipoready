# Cap Table Dilution Scenarios - Feature Build Documentation

## Overview

The Cap Table Dilution Scenarios feature (BUILD 2A.3) enables IPOReady users to model and visualize the impact of warrant exercises, option vesting, employee grants, and new financing rounds on shareholder ownership percentages and equity positions.

## Architecture

### File Structure

```
src/
├── app/
│   ├── api/cap-table/dilution/
│   │   ├── route.ts                  # Main API (POST/GET scenarios)
│   │   ├── presets/route.ts          # Generate preset scenarios
│   │   └── export/route.ts           # CSV export endpoint
│   └── dashboard/cap-table/dilution-scenarios/
│       ├── page.tsx                  # Main page with UI orchestration
│       └── layout.tsx                # Page metadata
├── components/cap-table/dilution/
│   ├── ScenarioBuilder.tsx           # Form for custom scenarios
│   ├── DilutionResultsTable.tsx      # Results visualization
│   └── PresetScenarios.tsx           # Preset scenario cards
└── lib/cap-table/
    └── dilution-scenarios.ts         # Core calculation engine
```

## Core Components

### 1. Dilution Scenario Engine (`src/lib/cap-table/dilution-scenarios.ts`)

**Interfaces:**
- `ShareholderPosition`: Individual shareholder impact data
- `DilutionScenarioInput`: User input parameters
- `DilutionScenarioResult`: Complete scenario results
- `CapTableSnapshot`: Current cap table state

**Key Methods:**
- `calculateDilutionScenario()`: Calculates impact for custom input
- `generatePresetScenarios()`: Creates base, optimistic, conservative scenarios
- `compareScenarios()`: Compares two scenarios side-by-side
- `calculateCurrentState()`: Private - computes pre-dilution state
- `calculateNewShares()`: Private - determines shares from all sources
- `calculateShareholderImpact()`: Private - derives per-shareholder effects

**Calculation Logic:**
1. Calculates total current shares from cap table
2. Computes new shares from:
   - Warrant exercises (% or absolute shares)
   - Employee option vesting
   - New financing (by amount or shares)
3. Determines post-dilution ownership: `newOwnership = currentShares / (totalShares + newShares)`
4. Derives dilution percentage: `dilution = currentOwnership - newOwnership`
5. Optionally calculates dollar impact using projected valuation

### 2. API Endpoints

#### `POST /api/cap-table/dilution` - Create Scenario
```typescript
Request body:
{
  input: DilutionScenarioInput,
  capTableSnapshot?: CapTableSnapshot  // optional override
}

Response: DilutionScenarioResult with scenarioId
```

**Flow:**
1. Validates user session and company access
2. Fetches current cap table if not provided
3. Calls `DilutionScenarioEngine.calculateDilutionScenario()`
4. Stores result in `dilution_scenarios` table
5. Returns complete scenario with database ID

#### `GET /api/cap-table/dilution?scenarioId=xxx` - Retrieve Scenario
Returns stored scenario by ID or lists all scenarios for company if no ID provided

#### `GET /api/cap-table/dilution/presets` - Generate Presets
Generates and stores 3 preset scenarios (base, optimistic, conservative) using:
- Base case: 50% warrant exercise, 5% option vesting, $50M financing, $500M valuation
- Optimistic: 75% warrant exercise, 3% option vesting, $75M financing, $750M valuation
- Conservative: 25% warrant exercise, 8% option vesting, $30M financing, $300M valuation

#### `POST /api/cap-table/dilution/export` - Export CSV
```typescript
Request body:
{
  scenario: DilutionScenarioResult,
  comparisonScenarios?: DilutionScenarioResult[]
}

Response: CSV file download
```

**CSV Format:**
- Header section: scenario name, type, creation date
- Summary: current/post-dilution shares, dilution rate
- Assumptions: all input parameters used
- Shareholder Impact table: before/after comparison
- Optional comparison table: multiple scenarios side-by-side

### 3. React Components

#### ScenarioBuilder.tsx
Custom scenario creation form with:
- Scenario name and type selector
- Warrant exercise (toggle: % vs absolute shares)
- New financing (toggle: amount vs shares)
- Employee option vesting (shares)
- Projected valuation (for dollar impact)

**State Management:**
- Uses React hooks for form state
- Toggle modes for flexible input
- Range sliders for percentages
- Numeric inputs with currency formatting

#### DilutionResultsTable.tsx
Results visualization displaying:
- **Statistics Cards:** shareholder count, avg dilution, most/least diluted
- **Interactive Table:** 
  - Sorted by dilution impact (descending)
  - Color-coded dilution severity (red >5%, yellow >2%, green <2%)
  - Columns: name, type, share class, current/post shares, current/post %, dilution %
- **Summary Footer:** assumptions and valuation impact

#### PresetScenarios.tsx
Three preset scenario cards (Base/Optimistic/Conservative) showing:
- Icon and color-coded styling
- Dilution rate and average shareholder dilution
- Key assumptions summary
- Clickable cards to select scenario

#### DilutionScenariosPage.tsx
Main page orchestration:
- Scenario list with selection
- Form toggle for creating custom scenarios
- Active scenario results display
- CSV export button
- Framer Motion animations for smooth UX

### 4. Database Schema

**Table: `dilution_scenarios`**
```sql
id VARCHAR(255) PRIMARY KEY
company_id UUID NOT NULL (FK)
scenario_name VARCHAR(255)
scenario_type VARCHAR(50) CHECK IN ('base', 'optimistic', 'conservative', 'custom')
data JSONB -- Complete scenario result JSON
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Indexes:**
- Primary key on `id`
- Foreign key on `company_id` with CASCADE delete
- Index on `(company_id, created_at DESC)` for efficient listing
- JSONB GIN index on `data` for full-text scenario searches

## User Flows

### 1. View Preset Scenarios
1. User clicks "Load Presets" button
2. `/api/cap-table/dilution/presets` generates and stores 3 scenarios
3. PresetScenarios component displays 3 cards
4. User clicks a card to select scenario
5. DilutionResultsTable shows impact

### 2. Create Custom Scenario
1. User clicks "Create Scenario" button
2. ScenarioBuilder form appears
3. User enters:
   - Scenario name (required)
   - Scenario type (custom, base, optimistic, conservative)
   - Warrant exercise (% or shares)
   - New financing (amount or shares)
   - Employee option vesting (shares)
   - Projected valuation (for $ impact)
4. Form submits to `POST /api/cap-table/dilution`
5. Engine calculates impact
6. Result appears in scenarios list and selected
7. User can view full impact table

### 3. Export Scenario
1. User selects scenario
2. Clicks "Export as CSV"
3. Frontend calls `POST /api/cap-table/dilution/export`
4. Server generates CSV with:
   - Scenario details and assumptions
   - Shareholder impact table
   - Comparison vs other scenarios (optional)
5. Browser downloads `dilution-{name}-{timestamp}.csv`

### 4. Compare Scenarios
- User can select different scenarios from list
- Table updates to show selected scenario's impact
- CSV export includes comparison data if multiple scenarios provided

## Key Features

### Calculations
- **Precise decimals** using Decimal.js (10 digits precision)
- **Handles multiple dilution sources** simultaneously
- **Ownership dilution** calculated as percentage point reduction
- **Dollar impact** derived from valuation and share changes
- **Scenario comparison** shows side-by-side ownership changes

### Validation
- Session-based company access control
- Cap table data existence checks
- Valid scenario type enforcement
- Null/undefined handling for optional inputs

### Performance
- Efficient API fetching with indexed queries
- JSONB storage for flexible result shape
- Single database write per scenario creation
- CSV generation server-side for large datasets

### UX
- Framer Motion animations for smooth interactions
- Color-coded severity indicators (red/yellow/green)
- Interactive preset cards with quick selection
- Toggle inputs for flexible parameter entry
- Real-time form validation feedback

## Configuration Defaults

**Preset Scenarios:**
- Base case assumed as 50% warrant exercise (balanced)
- Optimistic assumes higher warrant exercise (75%) and valuation
- Conservative assumes lower warrant exercise (25%) and valuation
- All presets use 5% base option vesting scaling

**Display:**
- Dilution >5% shown in red (high impact)
- Dilution 2-5% shown in yellow (moderate)
- Dilution <2% shown in green (low)

## Testing Considerations

### Unit Tests
- Scenario engine calculation accuracy
- Preset generation consistency
- CSV export format validation
- Decimal precision handling

### Integration Tests
- API endpoint authentication
- Database persistence
- Cap table data fetching
- Concurrent scenario creation

### E2E Tests
- Form submission and validation
- Scenario selection and display
- CSV download functionality
- Multi-scenario comparison

## Future Enhancements

1. **Waterfall Analysis** - Show how each event impacts ownership
2. **Sensitivity Analysis** - Show dilution across warrant exercise %
3. **IPO Impact** - Model additional public shares and underwriter options
4. **Scenario Branching** - Create derived scenarios from existing ones
5. **Team Dilution** - Separate analysis by employee cohorts
6. **Reporting** - Generate PDF reports for board presentations
7. **Version Control** - Track scenario changes over time
8. **Alerts** - Notify when shareholder falls below ownership threshold

## Migration Instructions

1. **Run SQL Migration:**
   ```bash
   psql $DATABASE_URL < migrations/001_add_dilution_scenarios_table.sql
   ```

2. **Deploy Code:**
   - All source files included in build
   - No environment variables required
   - Existing cap table API integration used

3. **Verify:**
   - Navigate to `/dashboard/cap-table/dilution-scenarios`
   - Load presets to test scenario generation
   - Create custom scenario to test calculations
   - Export CSV to verify format

## API Response Examples

### Create Scenario Response
```json
{
  "scenarioId": "dilution-1717372800000",
  "scenarioName": "Q2 2025 Financing",
  "scenarioType": "custom",
  "createdAt": "2025-06-03T10:00:00Z",
  "currentSnapshot": {
    "totalShares": "10000000",
    "totalOwnershipPercentage": "100"
  },
  "postDilutionSnapshot": {
    "totalShares": "12500000",
    "totalOwnershipPercentage": "100",
    "newSharesIssued": "2500000"
  },
  "shareholderImpact": [
    {
      "shareholderId": "founder-1",
      "shareholderName": "Jane Smith",
      "shareholderType": "founder",
      "shareClass": "Common",
      "currentShares": "5000000",
      "currentOwnership": "50",
      "postDilutionShares": "5000000",
      "postDilutionOwnership": "40",
      "dilutionPercentage": "10"
    }
  ],
  "assumptions": {
    "warrantsExercisedPercent": 50,
    "newFinancingAmount": 50000000,
    "employeeOptionVestingShares": 500000,
    "projectedValuation": 500000000
  }
}
```

## Files Summary

| File | Purpose | Lines |
|------|---------|-------|
| `dilution-scenarios.ts` | Core calculation engine | 350+ |
| `api/cap-table/dilution/route.ts` | Main API endpoint | 200+ |
| `api/cap-table/dilution/presets/route.ts` | Preset generation | 150+ |
| `api/cap-table/dilution/export/route.ts` | CSV export | 180+ |
| `page.tsx` | Main page component | 250+ |
| `ScenarioBuilder.tsx` | Form component | 220+ |
| `DilutionResultsTable.tsx` | Results display | 280+ |
| `PresetScenarios.tsx` | Preset cards | 150+ |
| `layout.tsx` | Page layout | 20+ |
| `001_add_dilution_scenarios_table.sql` | Database schema | 25+ |

**Total:** ~1,800 lines of production code (TypeScript/TSX/SQL)

## Support Resources

- See `/src/lib/cap-table/` for related scenario engines
- See `/src/app/cap-table/` for existing cap table pages
- See `/src/components/cap-table/` for related components
