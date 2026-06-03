# Listing Rules Engine - Quick Start Guide

## 5-Minute Setup

### 1. Access the UI
```
http://localhost:3000/dashboard/compliance/listing-rules
```

Use enhanced version (recommended):
```
./src/app/dashboard/compliance/listing-rules/page-enhanced.tsx
```

### 2. Fill Out Company Data
- Company name
- Share counts (authorized, issued, public)
- Offering details (size, shares, price)
- Financial/governance checkboxes

### 3. Select Mode
- **Single Exchange** - Validate against one exchange
- **Compare** - View side-by-side comparison (up to 4 additional)

### 4. Click "Validate"

### 5. Review Results
- Compliance score (0-100)
- Gap analysis
- Violations with suggestions
- Side-by-side comparison (if comparing)

---

## API Quick Start

### Validate Single Exchange
```bash
curl -X POST http://localhost:3000/api/compliance/listing-rules \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "tsx",
    "companyName": "MyCompany",
    "totalAuthorizedShares": 50000000,
    "totalIssuedShares": 28000000,
    "publicShares": 7000000,
    "publicSharePercentage": 25,
    "minSharePrice": 3.5,
    "proposedOfferingSize": 75,
    "proposedSharesOffering": 5000000,
    "proposedSharePrice": 15.0,
    "hasAuditCommittee": true,
    "hasNominationCommittee": true,
    "hasCompensationCommittee": true,
    "yearsOfFinancialHistory": 2
  }'
```

### Compare Multiple Exchanges
Add to request:
```json
"compareWith": ["nasdaq", "nyse", "cse"]
```

---

## React Hook Usage

```typescript
import { useListingRules } from '@/lib/hooks/useListingRules'

function MyForm() {
  const { report, loading, error, validate } = useListingRules()

  const handleSubmit = async (formData) => {
    await validate(formData, 'tsx', ['nasdaq'])
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>
      
      {loading && <p>Validating...</p>}
      {error && <p>Error: {error}</p>}
      {report && (
        <div>
          <h2>{report.exchangeName}</h2>
          <p>Score: {report.complianceScore}</p>
          <p>Status: {report.overallStatus}</p>
        </div>
      )}
    </>
  )
}
```

---

## Understanding Results

### Compliance Score
- **90-100** = Ready to list ✅
- **70-89** = At risk, minor gaps ⚠️
- **0-69** = Not ready, significant work needed ❌

### Status Indicators
- **READY** = All critical & error issues resolved
- **AT RISK** = Error violations or critical gaps present
- **NOT READY** = Critical violations blocking listing

### Gap Analysis
Shows current vs required for:
- Public float percentage
- Public share count
- Share price
- Offering size

### Violations
**Critical** - Blocks listing immediately
**Error** - Must be fixed before listing
**Warning** - Should be addressed
**Info** - Requirements already met

---

## Common Tasks

### Add Custom Company Data
Edit `/src/app/dashboard/compliance/listing-rules/page-enhanced.tsx` line ~20:
```typescript
const initialValues = {
  companyName: 'Your Company',
  totalAuthorizedShares: 50000000,
  // ... other values
}
```

### Change Default Exchange
Line ~30:
```typescript
const [selectedExchange, setSelectedExchange] = useState<ExchangeCode>('tsx')
```

### Modify Validation Rules
Edit `/src/lib/listing-rules.ts`:
- Private methods like `validatePublicFloat()`
- Look for `this.violations.push()`
- Update severity, message, or calculation

### Update Exchange Configs
Edit `/src/lib/exchange-config.ts`:
- Find exchange constant (e.g., `TSX_CONFIG`)
- Update numerical requirements
- Update description/notes

---

## Troubleshooting

### API Returns 400 Error
Check request body for:
- Missing required fields
- Invalid exchange code (must be: tsx, tsxv, nasdaq, nyse, cse)
- Non-numeric values for number fields

### No Violations Shown
- Company data exceeds all requirements ✅
- Check "Info" violations at bottom for met requirements

### Score Lower Than Expected
- Each critical violation = -25 points
- Each error violation = -15 points
- Each warning violation = -5 points
- See violations list for details

### Comparison View Not Working
- Select "Compare Exchanges" mode
- Choose at least one additional exchange
- Ensure primary exchange is different from selected

---

## Data Dictionary

### Cap Table Fields

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| companyName | string | "TechCorp Inc." | Required |
| totalAuthorizedShares | number | 50000000 | Required |
| totalIssuedShares | number | 28000000 | Required |
| publicShares | number | 7000000 | Required |
| publicSharePercentage | number | 25 | 0-100, required |
| minSharePrice | number | 3.5 | Pre-offering price |
| proposedOfferingSize | number | 75 | In millions CAD/USD |
| proposedSharesOffering | number | 5000000 | Shares in offering |
| proposedSharePrice | number | 15.0 | Offering price |
| estimatedPublicFloatCAD | number | 105 | Optional, millions |
| estimatedPublicFloatUSD | number | 78 | Optional, millions |
| hasAuditCommittee | boolean | true | Optional |
| hasNominationCommittee | boolean | true | Optional |
| hasCompensationCommittee | boolean | true | Optional |
| hasAuditedFinancials | boolean | true | Optional |
| yearsOfFinancialHistory | number | 2 | Optional, in years |
| completedResolutions | string[] | ["approval_ipo"] | Optional |
| completedConsents | string[] | ["board_approval"] | Optional |

---

## Exchange Quick Reference

### TSX (Toronto Stock Exchange)
- Min Public Float: 25% or CAD 20M
- Min Shares: 4M
- Min Price: $4.00
- Best for: Large Canadian companies, highest profile

### TSXV (TSX Venture Exchange)
- Min Public Float: 20% or CAD 3M
- Min Shares: 1M
- Min Price: $0.25
- Best for: Emerging Canadian companies, growth

### NASDAQ
- Min Public Float: 35% or USD 110M
- Min Shares: 1.25M
- Min Price: $5.00
- Best for: US tech companies, high visibility

### NYSE
- Min Public Float: 40% or USD 110M
- Min Shares: 2M
- Min Price: $4.00
- Best for: Large US companies, most prestigious

### CSE (Canadian Securities Exchange)
- Min Public Float: 20% or CAD 2M
- Min Shares: 500K
- Min Price: $0.10
- Best for: Early-stage Canadian companies, lowest barrier

---

## Next Steps

1. **Test the UI** - Try example data on the page
2. **Review API** - Test endpoint with curl or Postman
3. **Integrate Hooks** - Add to your forms
4. **Customize** - Update exchange configs as needed
5. **Deploy** - Push to production

---

## Support

Full documentation: `/LISTING_RULES_BUILD.md`
Code location: `/src/app/dashboard/compliance/listing-rules/`
API: `/src/app/api/compliance/listing-rules/`
Hooks: `/src/lib/hooks/useListingRules.ts`
