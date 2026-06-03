# BUILD 2D.1: Listing Agreement Rules Engine Implementation

## Overview

The Listing Agreement Rules Engine is a comprehensive compliance validation system that allows companies to validate their cap table data against exchange-specific listing requirements for TSX, TSXV, NASDAQ, NYSE, and CSE.

## Architecture

### 1. Core Engine (`src/lib/listing-rules.ts`)

**ListingRulesEngine Class** - Validates cap table against exchange rules:
- `validatePublicFloat()` - Checks minimum public float percentage
- `validateShareCount()` - Validates minimum public shares requirement
- `validateBoardLot()` - Ensures shares are clean multiples of board lot
- `validateMinSharePrice()` - Verifies share price meets minimum
- `validateOfferingSize()` - Checks offering size requirements
- `validateCommitteeRequirements()` - Validates board committee presence
- `validateFinancialHistory()` - Verifies years of audited financials
- `validateUndividedUnderlying()` - Checks authorized vs issued shares

**Gap Analysis** - Quantifies shortfalls/surpluses:
- Public Float % gap
- Public Share count gap
- Share price gap
- Offering size gap

**Compliance Score** - 0-100 scale:
- -25 for each critical violation
- -15 for each error violation
- -5 for each warning violation

### 2. API Endpoint (`src/app/api/compliance/listing-rules/route.ts`)

**POST /api/compliance/listing-rules**

Request body:
```json
{
  "exchange": "tsx|tsxv|nasdaq|nyse|cse",
  "companyName": "string",
  "totalAuthorizedShares": 50000000,
  "totalIssuedShares": 28000000,
  "publicShares": 7000000,
  "publicSharePercentage": 25,
  "minSharePrice": 3.5,
  "proposedOfferingSize": 75,
  "proposedSharesOffering": 5000000,
  "proposedSharePrice": 15.0,
  "estimatedPublicFloatCAD": 105,
  "estimatedPublicFloatUSD": 78,
  "hasAuditCommittee": true,
  "hasNominationCommittee": true,
  "hasCompensationCommittee": true,
  "hasAuditedFinancials": true,
  "yearsOfFinancialHistory": 2,
  "completedResolutions": ["approval_ipo", "authority_directors"],
  "completedConsents": ["board_approval", "independent_audit"],
  "compareWith": ["nasdaq", "nyse"]
}
```

Response:
```json
{
  "success": true,
  "report": {
    "exchange": "tsx",
    "exchangeName": "Toronto Stock Exchange",
    "timestamp": "2026-06-03T...",
    "overallStatus": "ready|at-risk|not-ready",
    "complianceScore": 85,
    "violations": [...],
    "gaps": [...],
    "requiredResolutions": {...},
    "requiredConsents": {...},
    "summary": {...}
  },
  "comparisonReports": [...]
}
```

### 3. React Hooks (`src/lib/hooks/useListingRules.ts`)

**useListingRules()**
- Manages single exchange validation
- Handles API calls, loading states, errors
- Returns report, comparisonReports, loading, error, validate, reset

**useMultiExchangeValidation()**
- Validates against multiple exchanges in parallel
- Returns reports indexed by exchange code
- Batch validation utility

**useListingRulesForm()**
- Form state management for cap table inputs
- updateField() and updateFields() methods
- Auto-reset functionality

### 4. UI Components

#### InputForm (`components/InputForm.tsx`)
- Text: Company name
- Numbers: Share counts, prices, offering size
- Checkboxes: Committee status, audited financials
- Responsive grid layout
- Loading state handling

#### ComplianceIndicator (`components/ComplianceIndicator.tsx`)
- `ComplianceIndicator` - Shows single metric (compliant/non-compliant)
- `ComplianceBadge` - Status badge (compliant/warning/critical)
- `ComplianceProgressBar` - Visual progress toward requirement

#### SideBySideComparison (`components/SideBySideComparison.tsx`)
- Dual-column layout showing two exchanges
- Key metrics comparison
- Violations summary
- AI-powered recommendation

#### Enhanced Page (`page-enhanced.tsx`)
- Single vs comparison view modes
- Exchange selector dropdown
- Results display with multiple tabs
- Gap analysis visualization
- Violations list with suggestions

## Exchange Configurations

All exchange rules configured in `src/lib/exchange-config.ts`:

### TSX (Toronto Stock Exchange)
- Min Public Float: 25%
- Min Public Float: CAD 20M
- Min Public Shares: 4M
- Min Share Price: $4.00
- Board Lot: 100
- Currency: CAD
- Strictest requirements, highest profile

### TSXV (TSX Venture Exchange)
- Min Public Float: 20%
- Min Public Float: CAD 3M
- Min Public Shares: 1M
- Min Share Price: $0.25
- Board Lot: 100
- Currency: CAD
- Easier entrance, growth pathway

### NASDAQ
- Min Public Float: 35%
- Min Public Float: USD 110M
- Min Public Shares: 1.25M
- Min Share Price: $5.00
- Board Lot: 100
- Currency: USD
- Technology-focused, higher visibility

### NYSE
- Min Public Float: 40%
- Min Public Float: USD 110M
- Min Public Shares: 2M
- Min Share Price: $4.00
- Board Lot: 100
- Currency: USD
- Most prestigious, highest standards

### CSE (Canadian Securities Exchange)
- Min Public Float: 20%
- Min Public Float: CAD 2M
- Min Public Shares: 500K
- Min Share Price: $0.10
- Board Lot: 100
- Currency: CAD
- Easiest pathway, lowest costs

## Validation Rules

### Critical Violations (Status: NOT READY)
- Public float percentage below minimum
- Public share count below minimum
- Issued shares exceed authorized shares
- Share price below minimum (blocks listing)

### Error Violations (Status: AT RISK)
- Missing required board committees
- Insufficient financial history
- Offering size below minimum

### Warning Violations (Status: REVIEW)
- Board lot size not aligned
- Authorized shares fully utilized (no reserve)
- Nearly compliant metrics

### Info Status (COMPLIANT)
- All requirements met
- Requirement exceeded by buffer

## Usage Examples

### JavaScript/TypeScript

```typescript
import { generateListingReport } from '@/lib/listing-rules'
import { CapTableData } from '@/lib/listing-rules'

const capTableData: CapTableData = {
  companyName: 'TechCorp Inc.',
  totalAuthorizedShares: 50000000,
  totalIssuedShares: 28000000,
  publicShares: 7000000,
  publicSharePercentage: 25,
  minSharePrice: 3.5,
  proposedOfferingSize: 75,
  proposedSharesOffering: 5000000,
  proposedSharePrice: 15.0,
  estimatedPublicFloatCAD: 105,
  estimatedPublicFloatUSD: 78,
  hasAuditCommittee: true,
  hasNominationCommittee: true,
  hasCompensationCommittee: true,
  hasAuditedFinancials: true,
  yearsOfFinancialHistory: 2,
}

const report = generateListingReport('tsx', capTableData)
console.log(`TSX Compliance Score: ${report.complianceScore}`)
console.log(`Status: ${report.overallStatus}`)
```

### React Component

```typescript
import { useListingRules } from '@/lib/hooks/useListingRules'

function MyComponent() {
  const { report, loading, error, validate } = useListingRules()

  const handleValidate = async () => {
    await validate(capTableData, 'tsx', ['nasdaq', 'nyse'])
  }

  return (
    <div>
      <button onClick={handleValidate} disabled={loading}>
        Validate
      </button>
      {report && <p>Score: {report.complianceScore}</p>}
    </div>
  )
}
```

### API Call

```bash
curl -X POST http://localhost:3000/api/compliance/listing-rules \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "tsx",
    "companyName": "TechCorp Inc.",
    "totalAuthorizedShares": 50000000,
    "totalIssuedShares": 28000000,
    "publicShares": 7000000,
    "publicSharePercentage": 25,
    "minSharePrice": 3.5,
    "proposedOfferingSize": 75,
    "proposedSharesOffering": 5000000,
    "proposedSharePrice": 15.0,
    "estimatedPublicFloatCAD": 105,
    "estimatedPublicFloatUSD": 78,
    "hasAuditCommittee": true,
    "hasNominationCommittee": true,
    "hasCompensationCommittee": true,
    "hasAuditedFinancials": true,
    "yearsOfFinancialHistory": 2,
    "compareWith": ["nasdaq"]
  }'
```

## Data Flow

```
User Input Form
    ↓
useListingRulesForm() Hook
    ↓
POST /api/compliance/listing-rules
    ↓
ListingRulesEngine.validate()
    ├─ validatePublicFloat()
    ├─ validateShareCount()
    ├─ validateBoardLot()
    ├─ validateMinSharePrice()
    ├─ validateOfferingSize()
    ├─ validateCommitteeRequirements()
    ├─ validateFinancialHistory()
    ├─ validateUndividedUnderlying()
    ├─ performGapAnalysis()
    └─ calculateComplianceScore()
    ↓
ListingReadinessReport
    ↓
UI Components
    ├─ ComplianceIndicator
    ├─ GapAnalysisPanel
    ├─ SideBySideComparison
    └─ ViolationsList
```

## Key Features

1. **Multi-Exchange Support** - TSX, TSXV, NASDAQ, NYSE, CSE
2. **Comprehensive Validation** - 8+ validation rules per exchange
3. **Gap Analysis** - Shows exact shortfalls with suggestions
4. **Side-by-Side Comparison** - Compare readiness across exchanges
5. **Compliance Scoring** - 0-100 score with status indicator
6. **Resolution & Consent Tracking** - Monitor completion status
7. **API-First** - RESTful API with POST endpoint
8. **React Hooks** - Easy integration into forms
9. **Type-Safe** - Full TypeScript support
10. **Responsive UI** - Mobile-friendly design

## Files

```
src/
├── app/
│   ├── api/compliance/listing-rules/
│   │   └── route.ts                          (API endpoint)
│   └── dashboard/compliance/listing-rules/
│       ├── page.tsx                          (Original page)
│       ├── page-enhanced.tsx                 (Enhanced page)
│       └── components/
│           ├── InputForm.tsx                 (Form component)
│           ├── ComplianceIndicator.tsx       (Status components)
│           └── SideBySideComparison.tsx      (Comparison view)
└── lib/
    ├── listing-rules.ts                      (Core engine)
    ├── exchange-config.ts                    (Exchange configs)
    └── hooks/
        └── useListingRules.ts                (React hooks)
```

## Testing

Run tests with:
```bash
npm test -- listing-rules
```

Test file: `__tests__/listing-rules.test.ts`

Validates:
- Public float calculations
- Share count validations
- Gap analysis accuracy
- Compliance score calculations
- Multi-exchange comparisons

## Future Enhancements

1. **Historical Tracking** - Store validation history
2. **Alerts & Notifications** - Alert on threshold changes
3. **Action Items** - Generate specific remediation steps
4. **Export Reports** - PDF/Excel download
5. **Integration with Underwriters** - Share readiness reports
6. **Milestone Tracking** - Timeline to readiness
7. **Batch Validation** - Validate multiple companies
8. **Custom Rules** - Per-exchange rule customization
9. **Rule Library** - Searchable rule reference
10. **Performance Benchmarks** - Compare against peer companies
