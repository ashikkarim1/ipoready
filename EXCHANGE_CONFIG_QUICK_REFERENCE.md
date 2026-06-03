# Exchange Configuration System - Quick Reference

## File Location
`src/lib/exchange-config.ts` (39KB, 1432 lines)

## Exports

### Types
- `ExchangeConfig` - Main configuration interface

### Data
- `EXCHANGE_CONFIGS` - Complete configuration database (5 exchanges)

### Functions
- `getExchangeConfig(id)` - Get single exchange config
- `getAllExchangeConfigs()` - Get all 5 exchanges
- `filterExchanges(criteria)` - Filter by multiple criteria
- `compareExchanges(id1, id2)` - Compare two exchanges side-by-side

---

## Exchange Quick Stats

| Metric | TSX | TSXV | NASDAQ | NYSE | CSE |
|--------|-----|------|--------|------|-----|
| **Jurisdiction** | Canada | Canada | USA | USA | Canada |
| **Currency** | CAD | CAD | USD | USD | CAD |
| **Min Float (M)** | 25 | 10 | 40 | 50 | 5 |
| **Board Lot** | 100 | 100 | 100 | 100 | 100 |
| **Prospectus Form** | 41-101F1 | 41-101F2 | Form S-1 | Form S-1 | 41-101F2 |
| **Timeline (months)** | 24 | 18 | 18 | 20 | 14 |
| **Listing Fee (M)** | 0.50 | 0.15 | 0.13 | 0.25 | 0.05 |
| **Legal Costs (M)** | 0.8 | 0.3 | 1.2 | 1.5 | 0.2 |
| **Min Directors** | 3 | 1 | 3 | 3 | 1 |
| **Independent %** | 50% | 25% | 50% | 100% | 0% |
| **Required Committees** | 2 | 0 | 3 | 3 | 0 |

---

## Configuration Properties by Category

### Core Properties
```typescript
id              // 'TSX' | 'TSXV' | 'NASDAQ' | 'NYSE' | 'CSE'
name            // Full exchange name
abbreviation    // Ticker prefix/abbreviation
country         // 'Canada' | 'United States'
currency        // 'CAD' | 'USD'
region          // AWS region code
```

### Financial Requirements
```typescript
minFloat           // Minimum public float (millions)
boardLot           // Standard trading unit size
listingTier: {
  name
  minMarketCap     // Minimum market capitalization
  minSharePrice    // Minimum share price
  minShareholdersOfRecord
  minPublicFloat
}
costs: {
  listingFee
  annualMaintenanceFee
  filingCosts
  auditCosts
  legalCosts
  underwritingFeesPercent  // [min%, max%]
}
```

### Regulatory/Filing
```typescript
prospectusFormat: {
  formName                    // e.g., "41-101F1", "Form S-1"
  formalName
  requiredSections: string[]
  typicalPageRange: [min, max]
}
filingRequirements: {
  auditStandards: string[]
  financialStatementFrequency
  reportingStandards: string[]
  continuousDisclosure: string[]
  continuousDisclosureForm
}
resolutionTypes: Array<{
  name
  isSpecial: boolean
  votingThreshold: number
  useCases: string[]
}>
consentRequirements: Array<{
  action
  votingThreshold
  approvalType
  disinterestedOnly: boolean
  notes
}>
```

### Governance
```typescript
governance: {
  minDirectors
  maxDirectorsRecommended
  independentDirectorPercentage
  requiredCommittees: string[]
  auditCommitteeFinancialExpertRequired
  compensationCommitteeRequired
  directorElectionMethod  // 'annual' | 'staggered' | 'flex'
  chairCEOSeparationRecommended
}
minSharesRequired: {
  specialMeetingRequest      // % of shares
  resolutionRequisition      // % of shares
  directorNomination         // % of shares
  sayOnPay                   // % of shares
  auditorAppointment         // % of shares
  compensationDisclosure     // % of shares
}
```

### Trading
```typescript
trading: {
  tradingUnit
  settlementDays             // T+N settlement
  operatingHours: {
    open                     // "0930"
    close                    // "1600"
    timezone
  }
  tickSizes: Array<{
    minPrice
    maxPrice | null
    tickSize
  }>
  circuitBreakers: {
    level1PercentageDown
    level1HaltMinutes
    level2PercentageDown
    level2HaltMinutes
    level3PercentageDown
    level3HaltMinutes
  }
}
```

### Special Features
```typescript
cusip: {
  required: boolean
  issuerPrefixLength         // 8 chars
  securitySuffixLength       // 2 chars
  checkDigitRequired
  regulatoryBody
}
greenShoe: {
  permitted: boolean
  maxPercentage              // 15% standard
  exercisePeriodDays         // 30 days typical
  typicalUnderwriterShare    // [min%, max%]
  stabilizationRules: string[]
}
sectorLimitations?: {         // Optional, if applicable
  restrictedSectors: string[]
  enhancedRequirementsSectors: string[]
  notes
}
```

### Timeline & Notes
```typescript
timeline: {
  minMonths
  expectedMonths
  maxMonths
}
notes: string[]            // Additional considerations
```

---

## Common Use Cases

### 1. Find exchanges suitable for a company
```typescript
filterExchanges({ 
  country: 'Canada', 
  minFloat: 20 
})
// Returns: [TSX, TSXV]
```

### 2. Compare costs
```typescript
['TSX', 'TSXV', 'CSE'].map(id => {
  const config = getExchangeConfig(id);
  return {
    exchange: id,
    total: config.costs.listingFee + config.costs.legalCosts
  };
})
```

### 3. Check governance requirements
```typescript
const config = getExchangeConfig('NYSE');
config.governance.requiredCommittees
// ["Audit", "Compensation", "Nominating/Corporate Governance"]
```

### 4. Verify shareholder vote thresholds
```typescript
const config = getExchangeConfig('TSX');
config.resolutionTypes.find(r => r.isSpecial)?.votingThreshold
// 66.67 (special resolution = 2/3 approval)
```

### 5. Get prospectus form and sections
```typescript
const config = getExchangeConfig('NASDAQ');
config.prospectusFormat.formName      // "Form S-1"
config.prospectusFormat.requiredSections.length  // 17 sections
```

### 6. Check trading hours
```typescript
const config = getExchangeConfig('TSX');
console.log(`${config.trading.operatingHours.open} - ${config.trading.operatingHours.close}`)
// "0930 - 1600" in America/Toronto timezone
```

### 7. Verify minimum share requirements
```typescript
const config = getExchangeConfig('TSX');
const minForSpecialMeeting = config.minSharesRequired.specialMeetingRequest
// 5% of outstanding shares
```

### 8. Plan IPO timeline
```typescript
const timeline = getExchangeConfig('CSE').timeline
console.log(`Fastest path: ${timeline.minMonths}-${timeline.maxMonths} months`)
// "Fastest path: 10-18 months"
```

---

## Testing

Run comprehensive test suite:
```bash
npm test -- src/lib/__tests__/exchange-config.test.ts
```

Test coverage includes:
- Configuration completeness (all 5 exchanges fully configured)
- Type safety (interface compliance)
- Utility functions (filter, compare, get)
- Prospectus requirements
- Governance mandates
- Trading specifications
- Cost analysis
- Timeline estimates
- Resolution types
- Consent requirements
- CUSIP support
- GreenShoe options

---

## Integration Points

### React Components
- Exchange selector/comparison UI
- IPO roadmap planning
- Compliance checklist generation
- Governance dashboard

### API Routes
- `/api/exchange-config/:id` - Get config by ID
- `/api/exchange-config` - Get all configs or filter

### Database
- Store exchange selections in company profiles
- Track compliance against selected exchange requirements
- Log timeline predictions

### Notifications/Alerts
- Alert when regulatory requirements change
- Notify on timeline milestones
- Cost estimate updates

---

## File Statistics

| Metric | Value |
|--------|-------|
| Total Lines | 1,432 |
| File Size | 39 KB |
| Exchanges | 5 |
| Properties per Exchange | 25+ |
| Required Sections | 17+ per prospectus |
| Resolution Types | 2-3 per exchange |
| Consent Requirements | 3-5 per exchange |
| Trading Tiers | 1-2 per exchange |
| Test Cases | 30+ |

---

## Key Differences by Tier

### Canadian Tier 1 (TSX)
- Premium listing, highest requirements
- 50% independent directors, 2 required committees
- Form 41-101F1 (long form), 150-250 pages
- 24-month timeline, highest costs
- Institutional investor base

### Canadian Tier 2 (TSXV)
- Growth-stage, lower requirements
- 25% independent directors, no required committees
- Form 41-101F2 (short form), 100-180 pages
- 18-month timeline, medium costs
- Hybrid institutional/retail

### Canadian Tier 3 (CSE)
- Emerging/startup-stage
- 0% independent director requirement, no committees
- Fastest timeline (14 months), lowest costs
- Limited institutional coverage
- Rising tech/startup popularity

### US Premium (NYSE)
- Most prestigious, strictest governance
- 100% independent directors (post-IPO)
- Form S-1 (comprehensive), 250-400 pages
- Largest institutional investor base
- Highest minimum float ($50M)

### US Growth (NASDAQ)
- Tech/growth company focus
- 50% independent directors
- Form S-1, 200-350 pages
- Smaller minimum float ($40M) than NYSE
- Most liquid US exchange after NYSE

---

## Regulatory References

### Canada
- TSX: [Toronto Stock Exchange Listing Manual](https://www.tsx.com)
- TSXV: [TSXV Listing Rules](https://www.tsx.com/listings/rules-and-procedures)
- CSE: [CSE Listing Manual](https://www.thecsexchange.com)
- All: [NI 51-102 (Continuous Disclosure)](https://www.securities-administrators.ca)

### United States
- NASDAQ: [NASDAQ Listing Rules](https://listingcenter.nasdaq.com)
- NYSE: [NYSE Listing Rules](https://www.nyse.com/regulation)
- All: [SEC Regulation S-K](https://www.sec.gov) (disclosure requirements)
- All: [Exchange Act Rule 13a](https://www.sec.gov) (periodic reporting)

### Global
- CUSIP: [CUSIP Global Services](https://www.cusip.com)
- ISIN: [International Securities Identification Number](https://www.isin.org)

