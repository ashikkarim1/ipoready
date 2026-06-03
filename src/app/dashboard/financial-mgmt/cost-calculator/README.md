# IPO Cost Calculator

Complete feature for calculating and analyzing IPO costs based on company parameters and complexity.

## Overview

The IPO Cost Calculator is a comprehensive financial planning tool that helps companies estimate the total cost of going public. It provides:

- Real-time cost calculations based on company metrics
- Cost breakdown across six categories (legal, accounting, underwriting, printing, filing, contingency)
- Industry benchmark comparisons
- Visual representations (bar charts, pie charts)
- PDF export functionality
- Calculation history and persistence
- Responsive design with dark mode support

## Architecture

### File Structure

```
src/
├── app/
│   ├── dashboard/financial-mgmt/
│   │   └── cost-calculator/
│   │       ├── page.tsx          # Page component
│   │       ├── layout.tsx         # Layout wrapper
│   │       └── README.md          # This file
│   └── api/
│       └── financial/
│           └── cost-calculator/
│               ├── route.ts       # Main calculation endpoint
│               ├── save/
│               │   └── route.ts   # Save calculation endpoint
│               └── history/
│                   └── route.ts   # Retrieve calculation history
└── components/
    └── CostCalculatorForm.tsx     # Main form component with UI
```

### Database Schema

Three tables are created via the migration file (`migrations/020_cost_calculator.sql`):

#### cost_calculations
Main table for storing calculations:
- `id` (UUID): Unique identifier
- `company_id` (UUID): Reference to company
- `calculation_data` (JSONB): Complete calculation result
- `company_revenue` (BIGINT): Revenue in cents
- `selected_exchange` (VARCHAR): Stock exchange (NYSE, NASDAQ, TSX, ASX, OTHER)
- `complexity_level` (VARCHAR): low, medium, high
- `timeline_months` (INT): Timeline in months
- `total_cost` (BIGINT): Total cost in cents
- `cost_breakdown` (JSONB): Breakdown by category
- `benchmarks` (JSONB): Industry benchmark data
- `notes` (TEXT): User notes
- `created_at`, `updated_at`: Timestamps

#### cost_calculation_scenarios
Optional: Store multiple scenarios for comparison
- `id`, `cost_calculation_id`, `scenario_name`, `scenario_data`, `total_cost`, `description`, `is_selected`

#### cost_savings_strategies
Optional: Track cost-saving opportunities
- `id`, `cost_calculation_id`, `category`, `strategy_name`, `description`, `potential_savings`, `implementation_difficulty`, `estimated_timeline`, `implementation_status`

## API Endpoints

### POST /api/financial/cost-calculator
Calculate IPO costs based on company parameters.

**Request Body:**
```json
{
  "companyRevenue": 500000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "medium",
  "timelineMonths": 12
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "input": { /* input data */ },
  "analysis": {
    "breakdown": {
      "legal": 250000,
      "accounting": 120000,
      "underwriting": 1500000,
      "printing": 25000,
      "filing": 180000,
      "contingency": 205550
    },
    "subtotal": 2055500,
    "total": 2280550,
    "ipoSizeEstimate": 75000000,
    "costAsPercentageOfIPO": "3.04",
    "benchmarks": { /* benchmark data */ }
  }
}
```

### POST /api/financial/cost-calculator/save
Save a calculation to the database.

**Request Body:**
```json
{
  "calculationData": { /* full calculation result */ },
  "companyRevenue": 500000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "medium",
  "timelineMonths": 12,
  "totalCost": 2280550,
  "costBreakdown": { /* breakdown object */ },
  "benchmarks": { /* benchmarks object */ },
  "notes": "Preliminary estimate for board discussion"
}
```

**Response:**
```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/financial/cost-calculator/history
Retrieve all saved calculations for the current company.

**Response:**
```json
{
  "success": true,
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "calculations": [ /* array of saved calculations */ ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 5
  }
}
```

## Cost Model

The cost calculator uses the following model:

### Legal Costs
- Base fee: $150,000 + exchange-based fee
- Exchange fees (% of IPO size):
  - NYSE: 1.5%
  - NASDAQ: 1.2%
  - TSX: 1.0%
  - ASX: 1.2%
- Complexity multiplier: 0.8x (low) / 1.0x (medium) / 1.3x (high)

### Accounting Costs
- Base fee: $80,000 + 0.05% of company revenue
- Complexity multiplier applied

### Underwriting Costs
- Fixed: 2% of estimated IPO size (15% of company revenue)

### Printing Costs
- Base fee: $25,000
- Additional 10% if timeline > 12 months

### Filing Costs
- NYSE: $250,000
- Other exchanges: $180,000

### Contingency
- 10% of subtotal (all other costs)

### IPO Size Estimate
- Default: 15% of company revenue

## Component Features

### CostCalculatorForm
Main React component with the following features:

**Form Inputs:**
- Company Revenue (USD) - number input
- Stock Exchange - select dropdown
- Complexity Level - select dropdown (low/medium/high)
- Timeline - number input (months)

**Output Visualizations:**
1. **Total Cost Display** - Large, prominent display with:
   - Total estimated cost
   - Cost as percentage of IPO size
   - Export to PDF button

2. **Bar Chart** - Cost breakdown by category
3. **Pie Chart** - Cost distribution percentages

4. **Cost Details Table** - Itemized breakdown with:
   - Category names
   - Dollar amounts
   - Percentage of total

5. **Benchmarks Comparison** - Shows:
   - IPO category (small/medium/large)
   - Average industry cost
   - Your estimate vs industry average
   - Cost range (±15% of average)

### Styling & Design

- **Tailwind CSS** with Tailwind v4
- **Dark mode support** via `dark:` classes
- **Responsive design**:
  - Mobile-first approach
  - Grid layouts that adapt to screen size
  - Proper spacing and typography
- **Lucide React icons** for visual consistency
- **Framer Motion** ready (can add animations)

### User Experience

- Form validation with Zod
- Loading states with spinner animation
- Error handling with descriptive messages
- Real-time calculation on form submission
- Ability to export results as PDF
- Clean, modern UI with proper visual hierarchy

## Usage Instructions

### For End Users

1. **Navigate** to `/dashboard/financial-mgmt/cost-calculator`
2. **Enter** company metrics:
   - Annual revenue in USD
   - Target stock exchange
   - Estimated IPO complexity
   - Expected timeline in months
3. **Click** "Calculate Costs" to see the analysis
4. **Review** the cost breakdown, charts, and benchmarks
5. **Export** results as PDF if needed
6. **Save** the calculation (optional, for future reference)

### For Developers

#### To Deploy

1. Run the migration:
   ```bash
   neonctl sql -c <connection_string> < migrations/020_cost_calculator.sql
   ```

2. Test the endpoints:
   ```bash
   # Test calculation
   curl -X POST http://localhost:3000/api/financial/cost-calculator \
     -H "Content-Type: application/json" \
     -d '{
       "companyRevenue": 500000000,
       "selectedExchange": "NASDAQ",
       "complexityLevel": "medium",
       "timelineMonths": 12
     }'
   ```

#### To Customize

**Change cost model:**
- Edit `calculateCosts()` function in `/src/app/api/financial/cost-calculator/route.ts`
- Adjust multipliers and base fees as needed

**Change visualization:**
- Modify recharts configurations in `CostCalculatorForm.tsx`
- Adjust chart colors in `COLORS` array

**Add features:**
- Scenario comparison (already has table structure)
- Cost-saving strategies recommendations
- Export to Excel format
- Real-time benchmark updates from external API

## Future Enhancements

1. **Scenario Comparison** - Compare multiple cost scenarios side-by-side
2. **Cost-Saving Strategies** - AI-powered recommendations for reducing IPO costs
3. **Integration with Prospectus** - Link to prospectus requirements
4. **Real-time Benchmarks** - Connect to financial data APIs for live benchmark data
5. **Excel Export** - Export calculations to Excel with formatting
6. **Cost Tracking** - Track actual vs estimated costs during IPO process
7. **Team Collaboration** - Share calculations and notes with IPO team members
8. **Historical Analysis** - Compare costs across time or companies

## Security & Performance

### Authentication
- All endpoints require NextAuth session
- User can only access their own company's calculations

### Data Validation
- Zod schema validation on all inputs
- Type-safe API responses

### Performance
- Calculations are instant (no external API calls)
- Database queries use indexes for fast retrieval
- Component uses React hooks efficiently

### Error Handling
- Try-catch blocks on all async operations
- User-friendly error messages
- Detailed server-side logging

## Testing

To test the feature manually:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login** to the application

3. **Navigate** to `/dashboard/financial-mgmt/cost-calculator`

4. **Test calculations** with various inputs:
   - Different exchanges
   - Different complexity levels
   - Different revenue amounts

5. **Verify**:
   - Charts render correctly
   - Export works
   - Numbers are calculated correctly
   - Benchmarks display

## Dependencies

- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS v4
- Recharts (for charts)
- Lucide React (for icons)
- React Hook Form (for form handling)
- Zod (for validation)
- NextAuth (for authentication)
- Neon PostgreSQL (for database)

## Support

For issues or feature requests related to the Cost Calculator, please document them with:
- The specific input values used
- Expected vs actual results
- Steps to reproduce
- Browser/device information
