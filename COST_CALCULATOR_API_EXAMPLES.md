# Cost Calculator API - Testing & Integration Guide

## Overview

This document provides practical examples for testing and integrating the IPO Cost Calculator API endpoints.

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/financial/cost-calculator` | Calculate IPO costs |
| GET | `/api/financial/cost-calculator` | Retrieve saved calculations |
| POST | `/api/financial/cost-calculator/save` | Save calculation to database |
| GET | `/api/financial/cost-calculator/history` | Get calculation history |
| POST | `/api/financial/cost-calculator/export-pdf` | Generate PDF report |

## 1. Calculate IPO Costs

### Endpoint
```
POST /api/financial/cost-calculator
```

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {session_token}
```

### Request Body
```json
{
  "companyRevenue": 500000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "medium",
  "timelineMonths": 12
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/financial/cost-calculator \
  -H "Content-Type: application/json" \
  -d '{
    "companyRevenue": 500000000,
    "selectedExchange": "NASDAQ",
    "complexityLevel": "medium",
    "timelineMonths": 12
  }'
```

### JavaScript Fetch Example
```javascript
async function calculateIPOCosts() {
  const response = await fetch('/api/financial/cost-calculator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyRevenue: 500000000,
      selectedExchange: 'NASDAQ',
      complexityLevel: 'medium',
      timelineMonths: 12,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Error:', error)
    return
  }

  const result = await response.json()
  console.log('Calculation Result:', result)
  return result.analysis
}
```

### Response Example (Success)
```json
{
  "success": true,
  "timestamp": "2026-06-03T10:30:45.123Z",
  "input": {
    "companyRevenue": 500000000,
    "selectedExchange": "NASDAQ",
    "complexityLevel": "medium",
    "timelineMonths": 12
  },
  "analysis": {
    "breakdown": {
      "legal": 405000,
      "accounting": 330000,
      "underwriting": 15000000,
      "printing": 25000,
      "filing": 180000,
      "contingency": 1594000
    },
    "subtotal": 15934000,
    "total": 17528000,
    "ipoSizeEstimate": 75000000,
    "costAsPercentageOfIPO": "23.37",
    "benchmarks": {
      "category": "medium",
      "ipoSize": 75000000,
      "avgTotalCost": 4500000,
      "costRange": {
        "min": 3825000,
        "max": 5175000
      },
      "legalRange": {
        "min": 1200000,
        "max": 1800000
      },
      "accountingRange": {
        "min": 600000,
        "max": 1000000
      },
      "underwritingRange": {
        "min": 1500000,
        "max": 2500000
      }
    }
  }
}
```

### Response Example (Error)
```json
{
  "error": "Invalid request parameters",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "path": ["timelineMonths"],
      "message": "Number must be greater than 0"
    }
  ]
}
```

## 2. Save Calculation

### Endpoint
```
POST /api/financial/cost-calculator/save
```

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {session_token}
```

### Request Body
```json
{
  "calculationData": {
    "breakdown": {...},
    "subtotal": 15934000,
    "total": 17528000,
    "ipoSizeEstimate": 75000000,
    "costAsPercentageOfIPO": "23.37",
    "benchmarks": {...}
  },
  "companyRevenue": 500000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "medium",
  "timelineMonths": 12,
  "totalCost": 17528000,
  "costBreakdown": {
    "legal": 405000,
    "accounting": 330000,
    "underwriting": 15000000,
    "printing": 25000,
    "filing": 180000,
    "contingency": 1594000
  },
  "benchmarks": {...},
  "notes": "Initial cost estimation for NASDAQ listing"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/financial/cost-calculator/save \
  -H "Content-Type: application/json" \
  -d '{
    "calculationData": {...},
    "companyRevenue": 500000000,
    "selectedExchange": "NASDAQ",
    "complexityLevel": "medium",
    "timelineMonths": 12,
    "totalCost": 17528000,
    "costBreakdown": {...},
    "benchmarks": {...},
    "notes": "Initial cost estimation for NASDAQ listing"
  }'
```

### Response Example (Success)
```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-06-03T10:30:45.123Z"
}
```

## 3. Get Calculation History

### Endpoint
```
GET /api/financial/cost-calculator/history
```

### Request Headers
```
Authorization: Bearer {session_token}
```

### Query Parameters
- None (retrieves all calculations for the authenticated user's company)

### cURL Example
```bash
curl -X GET http://localhost:3000/api/financial/cost-calculator/history \
  -H "Content-Type: application/json"
```

### JavaScript Fetch Example
```javascript
async function getCalculationHistory() {
  const response = await fetch('/api/financial/cost-calculator/history', {
    method: 'GET',
  })

  if (!response.ok) {
    console.error('Error:', await response.json())
    return
  }

  const data = await response.json()
  console.log('Calculation History:', data.calculations)
  return data.calculations
}
```

### Response Example
```json
{
  "success": true,
  "companyId": "company-uuid-123",
  "calculations": [
    {
      "id": "calc-uuid-1",
      "companyRevenue": 500000000,
      "selectedExchange": "NASDAQ",
      "complexityLevel": "medium",
      "timelineMonths": 12,
      "totalCost": 17528000,
      "costBreakdown": {
        "legal": 405000,
        "accounting": 330000,
        "underwriting": 15000000,
        "printing": 25000,
        "filing": 180000,
        "contingency": 1594000
      },
      "notes": "Initial cost estimation for NASDAQ listing",
      "createdAt": "2026-06-03T10:30:45.123Z",
      "updatedAt": "2026-06-03T10:30:45.123Z"
    },
    {
      "id": "calc-uuid-2",
      "companyRevenue": 1000000000,
      "selectedExchange": "NYSE",
      "complexityLevel": "high",
      "timelineMonths": 18,
      "totalCost": 35156000,
      "costBreakdown": {...},
      "notes": "Conservative estimate with accelerated timeline",
      "createdAt": "2026-06-02T15:20:30.456Z",
      "updatedAt": "2026-06-02T15:20:30.456Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 2
  }
}
```

## 4. Export PDF Report

### Endpoint
```
POST /api/financial/cost-calculator/export-pdf
```

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {session_token}
```

### Request Body
```json
{
  "breakdown": {
    "legal": 405000,
    "accounting": 330000,
    "underwriting": 15000000,
    "printing": 25000,
    "filing": 180000,
    "contingency": 1594000
  },
  "subtotal": 15934000,
  "total": 17528000,
  "ipoSizeEstimate": 75000000,
  "costAsPercentageOfIPO": "23.37",
  "benchmarks": {...},
  "companyRevenue": 500000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "medium",
  "timelineMonths": 12
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/financial/cost-calculator/export-pdf \
  -H "Content-Type: application/json" \
  -d '{...calculation_data...}' \
  -o IPO-Cost-Report.pdf
```

### JavaScript Fetch Example
```javascript
async function exportToPDF(calculationData) {
  const response = await fetch('/api/financial/cost-calculator/export-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(calculationData),
  })

  if (!response.ok) {
    console.error('Error:', await response.json())
    return
  }

  // Download the PDF
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `IPO-Cost-Report-${new Date().toISOString().split('T')[0]}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
}
```

### Response
- Returns PDF file with `Content-Type: application/pdf`
- File is automatically downloaded with timestamp filename

## Test Scenarios

### Scenario 1: Small Tech Startup Going to NASDAQ
```json
{
  "companyRevenue": 150000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "low",
  "timelineMonths": 9
}
```
**Expected Total:** ~$3.0M - $3.5M

### Scenario 2: Large Industrial Company on NYSE
```json
{
  "companyRevenue": 2000000000,
  "selectedExchange": "NYSE",
  "complexityLevel": "high",
  "timelineMonths": 18
}
```
**Expected Total:** ~$7.5M - $10M

### Scenario 3: Canadian Company on TSX
```json
{
  "companyRevenue": 500000000,
  "selectedExchange": "TSX",
  "complexityLevel": "medium",
  "timelineMonths": 12
}
```
**Expected Total:** ~$4.0M - $5.0M

### Scenario 4: Rapid Timeline (Accelerated Costs)
```json
{
  "companyRevenue": 750000000,
  "selectedExchange": "NASDAQ",
  "complexityLevel": "high",
  "timelineMonths": 6
}
```
**Expected Total:** ~$6.5M - $7.5M

## Error Handling

### Validation Errors
```json
{
  "error": "Invalid request parameters",
  "details": [
    {
      "code": "invalid_enum_value",
      "options": ["NYSE", "NASDAQ", "ASX", "TSX", "OTHER"],
      "path": ["selectedExchange"],
      "message": "Invalid enum value. Expected 'NYSE' | 'NASDAQ' | 'ASX' | 'TSX' | 'OTHER'"
    }
  ]
}
```

### Authentication Errors
```json
{
  "error": "Unauthorized"
}
```
Status Code: 401

### Authorization Errors
```json
{
  "error": "Missing companyId"
}
```
Status Code: 400

### Server Errors
```json
{
  "error": "Internal server error"
}
```
Status Code: 500

## Best Practices

1. **Always Validate Input**
   - Check that companyRevenue is > 0
   - Verify selectedExchange is one of: NYSE, NASDAQ, TSX, ASX, OTHER
   - Confirm complexityLevel is one of: low, medium, high
   - Ensure timelineMonths is a positive integer

2. **Handle Async Operations**
   - PDF export may take a few seconds
   - Show loading indicators during calculations
   - Implement proper error boundaries

3. **Database Persistence**
   - Always save calculations that user requests to persist
   - Include meaningful notes for reference
   - Use timestamp for historical tracking

4. **User Experience**
   - Show cost breakdown immediately after calculation
   - Provide context for benchmark comparisons
   - Make export functionality prominent
   - Display confidence intervals with estimates

5. **Security**
   - Always authenticate requests
   - Validate on both client and server
   - Never expose raw database IDs to users
   - Log sensitive operations

## Rate Limiting

No explicit rate limiting is implemented, but consider adding:
- Per-user: 100 calculations per hour
- Per-IP: 1000 requests per hour
- API: 10000 requests per day per company

## Performance Tips

1. Cache calculation results on client for 5 minutes
2. Use memoization for repeated calculations with same parameters
3. Lazy-load chart libraries
4. Paginate history results (default: 50 per page)
5. Use indexes on company_id and created_at for queries

## Integration Checklist

- [ ] Authentication configured and working
- [ ] Database migration applied
- [ ] All endpoints tested with valid data
- [ ] Error handling implemented
- [ ] Error messages user-friendly
- [ ] Loading states visible during operations
- [ ] PDF export working correctly
- [ ] History pagination working
- [ ] Save functionality persisting data
- [ ] Benchmark data validation
- [ ] Responsive design tested
- [ ] Dark mode tested
- [ ] Accessibility reviewed

## Troubleshooting

### PDF Export Returns 500 Error
- Check that pdfkit is installed: `npm ls pdfkit`
- Verify PDF directory permissions
- Check server logs for full error

### Calculations Saved But Not Retrieving
- Verify database connection
- Check company_id is set in user session
- Confirm migration was applied

### Exchange Fees Seem Incorrect
- Verify IPO size calculation (15% of revenue)
- Check complexity multiplier is applied
- Review benchmark data for exchange

### Charts Not Displaying
- Ensure recharts is installed: `npm ls recharts`
- Check console for JavaScript errors
- Verify data structure matches expected format
