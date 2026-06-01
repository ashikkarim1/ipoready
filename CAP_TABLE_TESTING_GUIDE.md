# Cap Table Management System - Complete Testing Guide

This guide walks through testing all aspects of the Cap Table Management System implementation (Phases 1-8).

## Phase 1: File Upload & Parsing

### Test 1.1: Upload Valid Excel File
```bash
# Using the ThinkIQ cap table file
curl -X POST http://localhost:3000/api/cap-table/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/Users/test/Downloads/ThinkIQ Cap Table March 13 RTO April 11.xlsx" \
  -F "companyId=550e8400-e29b-41d4-a716-446655440000"
```

Expected Response:
- `documentId`: UUID of the newly created document
- `validationStatus`: 'pending' or 'valid'
- `holdings`: Array with shareholder information
- `shareClasses`: Array with share class data

### Test 1.2: Verify Sheet Detection
The parser should auto-detect sheets containing:
- Assumptions/Summary
- Share Classes
- Shareholders
- Holdings
- Vesting Schedules
- Transactions
- Warrants

### Test 1.3: Parse with Missing Sheets
Files may not have all sheets. Parser should:
- Complete successfully with available data
- Add warnings for missing optional sheets
- Still extract holdings and shareholders

## Phase 2: Validation Rules

### Test 2.1: Share Conservation Rules

**Test Data Setup:**
```javascript
{
  documentName: 'Test',
  authorizedShares: 10000000,
  totalIssued: 5000000,  // 50% utilized
  shareClasses: [
    { id: 1, name: 'Common', authorized: 5000000, issued: 5000000 }
  ]
}
```

**Expected Results:**
- ✓ No error if totalIssued <= authorizedShares
- ✗ Error if totalIssued > authorizedShares

### Test 2.2: Vesting Consistency
**Invalid vesting schedule:**
```javascript
{
  startDate: '2024-01-01',
  cliffDate: '2025-01-01',
  vestingEndDate: '2024-06-01'  // Cliff > End = Invalid
}
```

**Expected:** Error flagged

### Test 2.3: Currency Consistency
**Mixed currency cap table:**
```javascript
shareClasses: [
  { name: 'Common', currency: 'USD' },
  { name: 'Preferred', currency: 'EUR' }  // Mismatch
]
```

**Expected:** Warning or error depending on tolerance

### Test 2.4: Ownership Percentage Validation
**Holdings that sum > 100%:**
```javascript
holdings: [
  { shareholderId: 1, percentage: 60 },
  { shareholderId: 2, percentage: 30 },
  { shareholderId: 3, percentage: 25 }  // Sum = 115%
]
```

**Expected:** Warning about percentage inconsistency

### Test 2.5: Warrant Exercise Price Validation
**Invalid warrant:**
```javascript
{
  type: 'warrant',
  exercisePrice: -5.00,  // Negative price
  expirationDate: '2026-12-31'
}
```

**Expected:** Error

### Test 2.6: Liquidation Preference Order
**Tranches out of order:**
```javascript
[
  { name: 'Series A', liquidationPreference: 2 },
  { name: 'Series B', liquidationPreference: 1 }  // Should be in order
]
```

**Expected:** Warning about incorrect ordering

## Phase 3: Scenario Generation

### Test 3.1: Current Scenario
```bash
curl -X GET "http://localhost:3000/api/cap-table/validate?documentId=DOC_ID&companyId=COMPANY_ID"
```

Verifies: Current cap table snapshot without any adjustments

### Test 3.2: Fully Diluted Scenario
Includes:
- All outstanding options (at-the-money)
- All warrants
- All convertible notes

Calculation: `Fully Diluted Shares = Common + Options + Warrants + Conversibles`

### Test 3.3: Post-IPO Scenario
```bash
curl -X GET "http://localhost:3000/api/cap-table/waterfall?documentId=DOC_ID&companyId=COMPANY_ID&scenarioType=post_ipo"
```

Assumptions:
- IPO shares: 5,000,000
- Price per share: $25
- Underwriter options: 15%

### Test 3.4: Bridge Financing Scenario
Parameters:
- Bridge amount: $5,000,000
- Discount rate: 20%
- Cap valuation: $50,000,000 (optional)

## Phase 4: Waterfall Calculation

### Test 4.1: Basic Waterfall
```bash
curl -X GET "http://localhost:3000/api/cap-table/waterfall?documentId=DOC_ID&companyId=COMPANY_ID"
```

Expected response includes:
```json
{
  "documentId": "...",
  "proceedsAmount": 100000000,
  "tranches": [
    {
      "name": "Series A",
      "preferences": 1,
      "participating": false,
      "amount": 50000000,
      "percentage": 50
    }
  ],
  "distributionOrder": [
    {
      "shareholderName": "Investor 1",
      "shares": 500000,
      "amount": 25000000
    }
  ]
}
```

### Test 4.2: Participation Waterfall
With participating preferred shares, test that participation caps are respected.

## Phase 5: API Endpoints

### Test 5.1: Upload Endpoint
```bash
POST /api/cap-table/upload
Content-Type: multipart/form-data

file: <Excel file>
companyId: <UUID>
```

### Test 5.2: Validate Endpoint
```bash
PATCH /api/cap-table/validate
Content-Type: application/json

{
  "documentId": "<UUID>",
  "companyId": "<UUID>"
}
```

### Test 5.3: Waterfall Endpoint
```bash
GET /api/cap-table/waterfall?documentId=<UUID>&companyId=<UUID>&scenarioType=post_ipo
```

### Test 5.4: Export Endpoint
```bash
GET /api/cap-table/export?documentId=<UUID>&companyId=<UUID>&format=prospectus
```

Formats: `json`, `csv`, `prospectus`

### Test 5.5: Audit Log Endpoint
```bash
GET /api/cap-table/audit-log?documentId=<UUID>&companyId=<UUID>&limit=50&offset=0
```

### Test 5.6: PACE Integration
```bash
GET /api/pace/scores?companyId=<UUID>
```

Response should include new `capTableStatus` field:
```json
{
  "capTableStatus": {
    "hasCapTable": true,
    "documentId": "...",
    "validationStatus": "valid",
    "totalShareholders": 12,
    "totalSharesAuthorized": 10000000,
    "totalSharesIssued": 5000000,
    "lastUpdated": "2026-06-01T10:00:00Z"
  }
}
```

## Phase 6: Dashboard Components

### Test 6.1: CapTableSummary Component
- Displays total shareholders
- Shows share class count
- Indicates validation status with color coding

### Test 6.2: CapTableGrid Component
- Renders holdings table
- Calculates percentages correctly
- Shows vesting status

### Test 6.3: WaterfallChart Component
- Displays tranche allocation
- Shows percentage bars
- Formats currency correctly

### Test 6.4: ScenarioSelector Component
- Allows switching between scenarios
- Updates on selection change
- Disables unavailable scenarios

## Phase 7: PACE Integration

### Test 7.1: Cap Table Status in Scores
Verify PACE scores endpoint includes cap table status:
```bash
GET /api/pace/scores?companyId=<UUID>
```

Should return capTableStatus object with:
- `hasCapTable`: boolean
- `validationStatus`: 'valid' | 'invalid' | 'missing' | 'pending'
- `totalShareholders`: number
- `totalSharesAuthorized`: number
- `totalSharesIssued`: number

## Phase 8: Data Integrity & Audit

### Test 8.1: Audit Trail
Upload a document and verify audit_log entries:
```sql
SELECT * FROM cap_table_audit_log 
WHERE document_id = '<UUID>' 
ORDER BY created_at DESC;
```

Should include entries for:
- document_uploaded
- validation_run
- validation_passed/failed
- export_requested

### Test 8.2: Referential Integrity
```sql
-- Verify all holdings reference valid shareholders and share classes
SELECT h.* FROM holdings h
LEFT JOIN shareholders s ON h.shareholder_id = s.id
LEFT JOIN share_classes_v2 sc ON h.share_class_id = sc.id
WHERE s.id IS NULL OR sc.id IS NULL;
```

Should return: 0 rows

### Test 8.3: No Duplicate Holdings
```sql
SELECT shareholder_id, share_class_id, COUNT(*) as cnt
FROM holdings
WHERE document_id = '<UUID>'
GROUP BY shareholder_id, share_class_id
HAVING COUNT(*) > 1;
```

Should return: 0 rows

## End-to-End Test Flow

1. **Upload** ThinkIQ cap table file
2. **Validate** - should pass all major checks
3. **Generate Scenarios**:
   - Current: Baseline
   - Fully Diluted: With all options
   - Post-IPO: With 5M shares at $25
4. **Calculate Waterfall** for $100M proceeds
5. **Export** as JSON and CSV
6. **Check PACE Integration** - scores endpoint should show cap table status
7. **Verify Audit Log** - should have entries for all operations

## Database Verification

Check schema and data:
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'cap_table%';

-- Check document
SELECT id, file_name, validation_status, total_shareholders
FROM cap_table_documents
ORDER BY created_at DESC LIMIT 1;

-- Check holdings count
SELECT COUNT(*) FROM holdings 
WHERE document_id = '<UUID>';

-- Check validation results
SELECT rule, severity, COUNT(*) as count
FROM cap_table_validation_results
WHERE document_id = '<UUID>'
GROUP BY rule, severity;
```

## Performance Notes

- File parsing: < 1s for files < 100MB
- Validation: < 500ms for documents with < 1000 holdings
- Waterfall calculation: < 100ms
- Database queries: Indexed for document_id and company_id

## Error Scenarios to Test

1. Invalid Excel file format
2. Missing required columns
3. File too large (> 100MB)
4. Duplicate shareholdings
5. Negative share quantities
6. Missing shareholder names
7. Expired warrants in future scenarios
8. Circular vesting schedules

## Success Criteria

- All API endpoints return expected JSON structures
- All validation rules execute without errors
- Database maintains referential integrity
- Audit log captures all operations
- PACE scores include cap table status
- Dashboard components render correctly
- No SQL injection vulnerabilities
- File deduplication works via MD5 hashing
