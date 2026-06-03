# Exchange Configuration System Guide

## Overview

The `src/lib/exchange-config.ts` file provides a comprehensive, type-safe configuration system for managing IPO requirements across 5 major exchanges:

- **TSX** - Toronto Stock Exchange (Premium Canadian tier)
- **TSXV** - TSX Venture Exchange (Growth Canadian tier)
- **NASDAQ** - NASDAQ Stock Market (US growth/tech)
- **NYSE** - New York Stock Exchange (US blue-chip)
- **CSE** - Canadian Securities Exchange (Emerging Canadian tier)

## Key Features

### 1. **Complete Configuration Coverage**

Each exchange includes:
- Regulatory requirements (prospectus format, filing requirements)
- Trading specifications (board lot, tick sizes, hours)
- Governance mandates (director independence, committees)
- Financial thresholds (minimum float, market cap, public float)
- Cost structure (listing fees, audit, legal, underwriting)
- Timeline estimates
- Consent/resolution types for shareholder votes
- CUSIP and greenShoe option details

### 2. **Type-Safe Interface**

```typescript
export interface ExchangeConfig {
  id: 'TSX' | 'TSXV' | 'NASDAQ' | 'NYSE' | 'CSE';
  name: string;
  minFloat: number;
  boardLot: number;
  prospectusFormat: { formName: string; ... };
  resolutionTypes: Array<{ name: string; votingThreshold: number; ... }>;
  consentRequirements: Array<{ action: string; approvalType: string; ... }>;
  // ... 20+ additional properties
}
```

### 3. **Utility Functions**

#### Get Single Exchange Config
```typescript
import { getExchangeConfig } from '@/lib/exchange-config';

const tsx = getExchangeConfig('TSX');
console.log(tsx.minFloat); // 25
console.log(tsx.prospectusFormat.formName); // "41-101F1"
```

#### Get All Exchanges
```typescript
import { getAllExchangeConfigs } from '@/lib/exchange-config';

const allExchanges = getAllExchangeConfigs();
// Returns array of 5 ExchangeConfig objects
```

#### Filter Exchanges
```typescript
import { filterExchanges } from '@/lib/exchange-config';

// Canadian exchanges only
const canadian = filterExchanges({ country: 'Canada' });
// Returns: TSX, TSXV, CSE

// Low-cost options
const lowCost = filterExchanges({ 
  maxCostUpperBound: 0.5 // million CAD/USD
});
// Returns: CSE, TSXV

// Multiple criteria
const filtered = filterExchanges({
  country: 'Canada',
  minFloat: 10,
  currency: 'CAD'
});
// Returns: TSX, TSXV
```

#### Compare Exchanges
```typescript
import { compareExchanges } from '@/lib/exchange-config';

const comparison = compareExchanges('TSX', 'NASDAQ');
console.log(comparison.minFloat);
// { exchange1: 25, exchange2: 40 }

console.log(comparison.timeline);
// { exchange1: "24 months", exchange2: "18 months" }
```

## Real-World Usage Examples

### Example 1: IPO Route Selection

```typescript
import { filterExchanges, compareExchanges } from '@/lib/exchange-config';

// Company with $30M CAD float looking for fastest, lowest-cost listing
const options = filterExchanges({
  country: 'Canada',
  minFloat: 30,
});

// Options includes: TSX, TSXV
// Compare them
const comparison = compareExchanges('TSXV', 'TSX');
console.log(comparison);
/*
{
  minFloat: { exchange1: 10, exchange2: 25 },
  boardLot: { exchange1: 100, exchange2: 100 },
  listingFee: { exchange1: 0.15, exchange2: 0.5 },
  timeline: { exchange1: "18 months", exchange2: "24 months" },
  minDirectors: { exchange1: 1, exchange2: 3 },
  requiredCommittees: { exchange1: 0, exchange2: 2 }
}
*/
```

### Example 2: Prospectus Planning

```typescript
import { getExchangeConfig } from '@/lib/exchange-config';

// Planning prospectus for NASDAQ listing
const nasdaq = getExchangeConfig('NASDAQ');

// Get required sections
console.log(nasdaq.prospectusFormat.requiredSections);
/*
[
  'Business',
  'Risk Factors',
  'Use of Proceeds',
  'Dividend Policy',
  'Capitalization',
  'Dilution',
  'Management Discussion & Analysis',
  // ... 10 more sections
]
*/

// Get page count estimate
const [minPages, maxPages] = nasdaq.prospectusFormat.typicalPageRange;
console.log(`Expect 200-350 pages for NASDAQ prospectus`);

// Check filing requirements
console.log(nasdaq.filingRequirements.financialStatementFrequency);
// "quarterly"

console.log(nasdaq.filingRequirements.auditStandards);
// ["PCAOB (Public Company Accounting Oversight Board)", "GAAP"]
```

### Example 3: Shareholder Resolution Planning

```typescript
import { getExchangeConfig } from '@/lib/exchange-config';

// Which resolutions need shareholder votes?
const tsx = getExchangeConfig('TSX');

console.log(tsx.resolutionTypes);
/*
[
  {
    name: 'Ordinary Resolution',
    isSpecial: false,
    votingThreshold: 50,
    useCases: [
      'Routine business',
      'Director elections',
      'Auditor approval',
      'Stock option plans'
    ]
  },
  {
    name: 'Special Resolution',
    isSpecial: true,
    votingThreshold: 66.67,
    useCases: [
      'Charter/by-law amendments',
      'Sale of substantially all assets',
      'Merger/amalgamation',
      'Continuation in another jurisdiction',
      'Liquidation',
      'Related party transactions'
    ]
  }
]
*/

// What consent is needed for related party transactions?
const relatedPartyConsent = tsx.consentRequirements.find(
  r => r.action.includes('Related party')
);
console.log(relatedPartyConsent);
/*
{
  action: 'Related party transactions (>$500k)',
  votingThreshold: 50,
  approvalType: 'ordinary',
  disinterestedOnly: true,
  notes: 'TSX Policy 3.1 and BCBCA s.176'
}
*/
```

### Example 4: Governance Compliance

```typescript
import { getExchangeConfig, getAllExchangeConfigs } from '@/lib/exchange-config';

// Check governance requirements for each exchange
const exchanges = getAllExchangeConfigs();

exchanges.forEach(exchange => {
  console.log(`${exchange.id} Governance:`);
  console.log(`  Min Directors: ${exchange.governance.minDirectors}`);
  console.log(`  Independent Directors: ${exchange.governance.independentDirectorPercentage}%`);
  console.log(`  Required Committees: ${exchange.governance.requiredCommittees.join(', ')}`);
});

/*
TSX Governance:
  Min Directors: 3
  Independent Directors: 50%
  Required Committees: Audit, Compensation & Human Resources

NASDAQ Governance:
  Min Directors: 3
  Independent Directors: 50%
  Required Committees: Audit, Compensation, Nominating/Corporate Governance

NYSE Governance:
  Min Directors: 3
  Independent Directors: 100%
  Required Committees: Audit, Compensation, Nominating/Corporate Governance

TSXV Governance:
  Min Directors: 1
  Independent Directors: 25%
  Required Committees: (none)

CSE Governance:
  Min Directors: 1
  Independent Directors: 0%
  Required Committees: (none)
*/
```

### Example 5: Cost Analysis

```typescript
import { getAllExchangeConfigs } from '@/lib/exchange-config';

const exchanges = getAllExchangeConfigs();

// Calculate total cost to list on each exchange
const costAnalysis = exchanges.map(exchange => ({
  exchange: exchange.id,
  listingFee: exchange.costs.listingFee,
  auditCosts: exchange.costs.auditCosts,
  legalCosts: exchange.costs.legalCosts,
  totalEstimate: 
    exchange.costs.listingFee + 
    exchange.costs.auditCosts + 
    exchange.costs.legalCosts,
  currency: exchange.currency
}));

costAnalysis.sort((a, b) => a.totalEstimate - b.totalEstimate);
console.table(costAnalysis);

/*
CSE:    $0.37M CAD
TSXV:   $0.65M CAD
TSX:    $1.45M CAD
NASDAQ: $2.08M USD
NYSE:   $2.40M USD
*/
```

### Example 6: Trading Specifications

```typescript
import { getExchangeConfig } from '@/lib/exchange-config';

// Check trading specifications for US markets
const nasdaq = getExchangeConfig('NASDAQ');
const nyse = getExchangeConfig('NYSE');

console.log('NASDAQ Trading Hours:', nasdaq.trading.operatingHours);
// { open: "0930", close: "1600", timezone: "America/New_York" }

console.log('Tick Sizes:');
nasdaq.trading.tickSizes.forEach(ts => {
  console.log(`  $${ts.minPrice} - $${ts.maxPrice}: $${ts.tickSize}`);
});
// $0.01 - null: $0.01 (all prices, 1 cent ticks)

console.log('Circuit Breakers:');
console.log(`  Level 1: ${nasdaq.trading.circuitBreakers.level1PercentageDown}% down = ${nasdaq.trading.circuitBreakers.level1HaltMinutes} min halt`);
console.log(`  Level 2: ${nasdaq.trading.circuitBreakers.level2PercentageDown}% down = ${nasdaq.trading.circuitBreakers.level2HaltMinutes} min halt`);
console.log(`  Level 3: ${nasdaq.trading.circuitBreakers.level3PercentageDown}% down = ${nasdaq.trading.circuitBreakers.level3HaltMinutes} min halt`);

// 7% halt for 15 minutes, 13% halt for 15 minutes, 20% halt for 60 minutes
```

### Example 7: Minimum Share Requirements

```typescript
import { getExchangeConfig } from '@/lib/exchange-config';

// How many shares needed for various governance rights?
const tsx = getExchangeConfig('TSX');
const min = tsx.minSharesRequired;

console.log('TSX Minimum Share Requirements:');
console.log(`  Request Special Meeting: ${min.specialMeetingRequest}% of outstanding`);
console.log(`  Requisition Resolution: ${min.resolutionRequisition}% of outstanding`);
console.log(`  Director Nomination: ${min.directorNomination}% of outstanding`);
console.log(`  Say-on-Pay Vote Eligibility: ${min.sayOnPay}% of outstanding`);

/*
TSX Minimum Share Requirements:
  Request Special Meeting: 5% of outstanding
  Requisition Resolution: 5% of outstanding
  Director Nomination: 0.5% of outstanding
  Say-on-Pay Vote Eligibility: 1% of outstanding
*/

// CSE has much higher thresholds
const cse = getExchangeConfig('CSE');
console.log(`CSE Special Meeting Request: ${cse.minSharesRequired.specialMeetingRequest}%`);
// 10% (more restrictive than TSX's 5%)
```

### Example 8: GreenShoe & Stabilization

```typescript
import { getExchangeConfig } from '@/lib/exchange-config';

// Underwriters planning overallotment
const exchanges = getAllExchangeConfigs().map(e => ({
  exchange: e.id,
  greenShoeMax: e.greenShoe.maxPercentage,
  exerciseDays: e.greenShoe.exercisePeriodDays,
  underwriterShare: `${e.greenShoe.typicalUnderwriterShare[0]}-${e.greenShoe.typicalUnderwriterShare[1]}%`
}));

console.table(exchanges);

/*
exchange  greenShoeMax  exerciseDays  underwriterShare
TSX       15            30            3-5%
TSXV      15            30            2-4%
NASDAQ    15            30            5-7%
NYSE      15            30            5-7%
CSE       15            30            2-3%
*/

// Note: All exchanges allow 15% maximum, but US exchanges have higher underwriter share
```

## Configuration Structure Deep Dive

### Prospectus Format
```typescript
prospectusFormat: {
  formName: string;           // e.g., "41-101F1", "Form S-1"
  formalName: string;         // e.g., "Long Form Prospectus"
  requiredSections: string[]; // List of required disclosure sections
  typicalPageRange: [number, number]; // Expected page count
}
```

### Resolution Types
```typescript
resolutionTypes: Array<{
  name: string;                // e.g., "Ordinary Resolution"
  isSpecial: boolean;          // true = requires 2/3 approval
  votingThreshold: number;     // % of votes required
  useCases: string[];          // When this resolution is used
}>
```

### Consent Requirements
```typescript
consentRequirements: Array<{
  action: string;              // What action requires consent
  votingThreshold: number;     // % of votes required
  approvalType: ApprovalType;  // 'ordinary' | 'special' | 'majority' | etc.
  disinterestedOnly: boolean;  // true = disinterested shareholders only
  notes: string;               // Regulatory reference/notes
}>
```

### Trading Specifications
```typescript
trading: {
  tradingUnit: number;         // Board lot size
  settlementDays: number;      // T+ settlement
  operatingHours: {
    open: string;              // "0930"
    close: string;             // "1600"
    timezone: string;          // "America/New_York"
  };
  tickSizes: Array<{
    minPrice: number;
    maxPrice: number | null;
    tickSize: number;
  }>;
  circuitBreakers: {
    level1PercentageDown: number;
    level1HaltMinutes: number;
    level2PercentageDown: number;
    level2HaltMinutes: number;
    level3PercentageDown: number;
    level3HaltMinutes: number;
  };
}
```

## Integration with IPOReady

### React Components
```typescript
// pages/ipo-readiness/exchange-selection.tsx
import { filterExchanges, compareExchanges } from '@/lib/exchange-config';

export function ExchangeSelector({ companyData }) {
  const suitable = filterExchanges({
    country: companyData.country,
    minFloat: companyData.publicFloat,
    currency: companyData.currency
  });

  return (
    <div>
      <h2>Suitable Exchanges</h2>
      {suitable.map(exchange => (
        <ExchangeCard key={exchange.id} config={exchange} />
      ))}
    </div>
  );
}
```

### API Routes
```typescript
// app/api/exchange-config/[id]/route.ts
import { getExchangeConfig } from '@/lib/exchange-config';

export async function GET(req: Request, { params }) {
  try {
    const config = getExchangeConfig(params.id);
    return Response.json(config);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }
}
```

## Testing

Run the test suite:
```bash
npm test -- exchange-config.test.ts
```

Tests cover:
- Configuration completeness
- Type safety
- Filter/comparison functions
- Prospectus requirements
- Governance mandates
- Trading specifications
- Cost analysis
- Timeline estimates

## References

### Canadian Regulations
- **TSX**: Toronto Stock Exchange Listing Manual, NI 51-102
- **TSXV**: TSXV Listing Rules, Policy 101-102
- **CSE**: CSE Listing Manual, Policies 100-113

### US Regulations
- **NASDAQ**: NASDAQ Listing Rules, Exchange Act Rule 5635
- **NYSE**: NYSE Listing Rules, Section 3, Exchange Act Rule 3 series

### Form References
- TSX/TSXV: National Instrument 41-101 (Form 41-101F1, 41-101F2)
- NASDAQ/NYSE: Securities Act Form S-1
- All: CUSIP numbering system, SEC Regulation SK/SX

## Future Enhancements

Potential additions:
- Historical cost trends (year-over-year)
- ESG/sustainability disclosure requirements
- Sector-specific requirements expansion
- Regional office requirements
- Analyst coverage requirements
- Share float maintenance rules post-IPO
