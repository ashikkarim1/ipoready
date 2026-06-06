# Input Validation Middleware - Integration Guide

## Overview

This guide explains how to integrate the input validation middleware into your IPOReady API routes. The middleware provides comprehensive protection against:

- **SQL Injection** - Detects and prevents SQL keyword patterns
- **XSS/Script Injection** - Removes script tags and event handlers
- **HTML Injection** - Sanitizes HTML entities
- **Invalid Data Types** - Validates type correctness
- **Out-of-Range Values** - Enforces numeric bounds
- **String Length Attacks** - Limits string lengths
- **Wildcard Bombs** - Prevents excessive wildcard patterns in queries

## Quick Start

### 1. Basic Email + String Validation

```typescript
// src/app/api/lead-capture/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  validateInput,
  validationErrorResponse,
  validateEmail,
  validateString,
} from '@/lib/middleware/input-validation'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { valid, data, errors } = await validateInput(req, {
      email: (v, r) => validateEmail(v, r),
      name: (v, r) =>
        validateString(v, {
          fieldName: 'Name',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req: r,
        }),
    })

    if (!valid) {
      return validationErrorResponse(errors)
    }

    // data.email and data.name are now validated and safe
    console.log('Safe to use:', data)

    // Continue with your business logic...
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Validation error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. Company ID + Numeric Validation

```typescript
// src/app/api/company/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  validateInput,
  validationErrorResponse,
  validateCompanyId,
  validateNumber,
} from '@/lib/middleware/input-validation'

export async function PUT(req: NextRequest) {
  try {
    const { valid, data, errors } = await validateInput(req, {
      companyId: (v, r) => validateCompanyId(v, r),
      employees: (v, r) =>
        validateNumber({ fieldName: 'Employees', min: 1, max: 100000, req: r }, v),
      valuation: (v, r) =>
        validateNumber({ fieldName: 'Valuation', min: 0, req: r }, v),
    })

    if (!valid) {
      return validationErrorResponse(errors)
    }

    // Safe to use validated data
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### 3. Search Query with Pagination

```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  validateSearchQuery,
  validatePagination,
  validationErrorResponse,
} from '@/lib/middleware/input-validation'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''
    const page = url.searchParams.get('page')
    const limit = url.searchParams.get('limit')

    // Validate search
    const searchResult = validateSearchQuery(query, req)
    if (!searchResult.valid) {
      return validationErrorResponse({ q: searchResult.errors })
    }

    // Validate pagination
    const paginationResult = validatePagination(page, limit, req)
    if (!paginationResult.valid) {
      return validationErrorResponse({
        pagination: paginationResult.errors,
      })
    }

    const { page: pageNum, limit: limitNum } = paginationResult.value

    // Perform safe search with validated parameters
    return NextResponse.json({
      success: true,
      query: searchResult.value,
      page: pageNum,
      limit: limitNum,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### 4. Array/Bulk Operations

```typescript
// src/app/api/bulk-update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateArray, validateCompanyId, validationErrorResponse } from '@/lib/middleware/input-validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const result = validateArray(body.ids || [], {
      fieldName: 'Company IDs',
      minLength: 1,
      maxLength: 100,
      itemValidator: (id) => validateCompanyId(id, req),
    })

    if (!result.valid) {
      return validationErrorResponse({ ids: result.errors })
    }

    // result.value contains validated IDs
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

## Validator Functions

### Email Validation

```typescript
import { validateEmail } from '@/lib/middleware/input-validation'

const result = validateEmail('user@example.com')
// Returns:
// {
//   valid: true,
//   value: 'user@example.com',
//   errors: []
// }

const result = validateEmail('invalid@')
// Returns:
// {
//   valid: false,
//   value: undefined,
//   errors: ['Invalid email format']
// }
```

**Features:**
- RFC 5322 simplified validation
- Detects SQL injection patterns
- Checks length limits (max 255 chars)
- Detects suspicious patterns (`..`, `@@`)
- Lowercases and trims input

### String Validation

```typescript
import { validateString } from '@/lib/middleware/input-validation'

const result = validateString('Company Name Inc', {
  fieldName: 'Company Name',
  minLength: 2,
  maxLength: 100,
  sanitize: true,
})

// With regex pattern
const result = validateString('ABC-123', {
  fieldName: 'Code',
  pattern: /^[A-Z]{3}-\d{3}$/,
})
```

**Options:**
- `fieldName`: Display name for error messages
- `minLength`: Minimum characters (default: 1)
- `maxLength`: Maximum characters (default: 500)
- `pattern`: Optional regex pattern to match
- `sanitize`: Remove HTML tags & escape entities (default: true)

### Numeric Validation

```typescript
import { validateNumber } from '@/lib/middleware/input-validation'

const result = validateNumber(10, {
  fieldName: 'Employee Count',
  min: 1,
  max: 100000,
  integer: true,
  positive: true,
})
```

**Options:**
- `min`: Minimum value
- `max`: Maximum value
- `integer`: Only allow integers
- `positive`: Must be >= 0

### Company ID Validation

```typescript
import { validateCompanyId } from '@/lib/middleware/input-validation'

// Validates UUID v4 format
const result = validateCompanyId('550e8400-e29b-41d4-a716-446655440000')
```

**Features:**
- Strict UUID v4 format validation
- Detects invalid IDs with logging
- Optional null allowance with `allowNull` parameter

### Enum Validation

```typescript
import { validateEnum } from '@/lib/middleware/input-validation'

const result = validateEnum('TSX', {
  fieldName: 'Exchange',
  allowedValues: ['TSX', 'NASDAQ', 'NYSE'],
  caseSensitive: false,
})
```

### Search Query Validation

```typescript
import { validateSearchQuery } from '@/lib/middleware/input-validation'

const result = validateSearchQuery('venture capital', req)
```

**Features:**
- Max 200 characters
- Detects SQL injection patterns
- Detects XSS/script injection
- Limits wildcard characters (max 5)
- Prevents wildcard bombs

### Pagination Validation

```typescript
import { validatePagination } from '@/lib/middleware/input-validation'

const result = validatePagination('2', '25', req)
// Returns { page: 2, limit: 25 }
```

**Limits:**
- Page: 1 - 1,000,000
- Limit: 1 - 100 (prevents requesting excessive data)

### Array Validation

```typescript
import { validateArray, validateEmail } from '@/lib/middleware/input-validation'

const result = validateArray(['user@example.com', 'invalid'], {
  fieldName: 'Emails',
  minLength: 1,
  maxLength: 100,
  itemValidator: (item) => validateEmail(item),
})
```

### Date Validation

```typescript
import { validateDate } from '@/lib/middleware/input-validation'

const result = validateDate('2024-06-06', {
  fieldName: 'Event Date',
  minDate: new Date('2024-01-01'),
  maxDate: new Date('2024-12-31'),
})
```

### URL Validation

```typescript
import { validateUrl } from '@/lib/middleware/input-validation'

const result = validateUrl('https://example.com', req)
```

**Features:**
- Only allows http:// and https://
- Detects SQL injection patterns

### Phone Number Validation

```typescript
import { validatePhoneNumber } from '@/lib/middleware/input-validation'

const result = validatePhoneNumber('+1-555-123-4567', req)
// Returns sanitized: '15551234567'
```

**Features:**
- Accepts 10-15 digit formats
- Removes non-numeric characters
- Detects injection patterns

## Sanitization Functions

### Escape HTML

```typescript
import { escapeHtml } from '@/lib/middleware/input-validation'

const safe = escapeHtml('<script>alert("xss")</script>')
// Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
```

### Strip HTML Tags

```typescript
import { stripHtmlTags } from '@/lib/middleware/input-validation'

const clean = stripHtmlTags('<p>Hello <b>world</b></p>')
// Returns: 'Hello world'
```

### Sanitize String

```typescript
import { sanitizeString } from '@/lib/middleware/input-validation'

const safe = sanitizeString('<img src=x onerror="alert()">Hello')
// Returns: '&lt;img src=x onerror=&quot;alert()&quot;&gt;Hello'
```

## Error Handling

### Validation Error Response

```typescript
import { validationErrorResponse } from '@/lib/middleware/input-validation'

const errors = {
  email: ['Invalid email format'],
  name: ['Name must be 2-100 characters'],
}

return validationErrorResponse(errors)
// Returns 400 status with structured error object
```

### Custom Error Handling

```typescript
const { valid, data, errors } = await validateInput(req, validators)

if (!valid) {
  // Log detailed errors for monitoring
  console.error('Validation failed:', {
    endpoint: req.nextUrl.pathname,
    errors,
    timestamp: new Date(),
  })

  // Return custom response
  return NextResponse.json(
    {
      success: false,
      message: 'Invalid input provided',
      errors,
    },
    { status: 400 }
  )
}
```

## Security Monitoring

### Get Suspicious Input Logs

```typescript
import { getSuspiciousInputLogs } from '@/lib/middleware/input-validation'

// Get all critical logs
const logs = getSuspiciousInputLogs({ severity: 'critical' })

// Filter by pattern
const injectionAttempts = getSuspiciousInputLogs({ pattern: 'SQL_INJECTION' })

// Get logs since a specific date
const recentLogs = getSuspiciousInputLogs({ since: new Date('2024-06-01') })
```

### Get Validation Statistics

```typescript
import { getValidationStats } from '@/lib/middleware/input-validation'

const stats = getValidationStats()
// Returns:
// {
//   totalLogs: 42,
//   bySeverity: { critical: 2, high: 5, medium: 10, low: 25 },
//   byPattern: { SQL_INJECTION: 5, XSS_INJECTION: 2, ... }
// }
```

### Clear Logs

```typescript
import { clearSuspiciousInputLogs } from '@/lib/middleware/input-validation'

// Clear all logs (admin endpoint only!)
clearSuspiciousInputLogs()
```

## Best Practices

### 1. Always Validate Required Fields

```typescript
// Good: Validates required field
const result = validateEmail(value, req)

// Bad: Doesn't check if required
if (value) {
  // ... could skip validation
}
```

### 2. Use Composable Validators

```typescript
// Good: Reusable validators
const emailValidator = (v, r) => validateEmail(v, r)
const nameValidator = (v, r) => validateString(v, {
  fieldName: 'Name',
  minLength: 2,
  maxLength: 100,
  req: r,
})

export const commonValidators = {
  email: emailValidator,
  name: nameValidator,
}

// Then reuse
const { valid, data, errors } = await validateInput(req, {
  email: commonValidators.email,
  name: commonValidators.name,
})
```

### 3. Sanitize Before Database Operations

```typescript
// All validators sanitize by default
const { data } = await validateInput(req, {
  description: (v, r) =>
    validateString(v, {
      fieldName: 'Description',
      maxLength: 1000,
      sanitize: true, // Already enabled by default
      req: r,
    }),
})

// Safe to use directly
db.query('UPDATE companies SET description = ?', [data.description])
```

### 4. Log Suspicious Inputs

```typescript
// Validation logging is automatic for suspicious patterns
// Check logs in admin dashboard:
import { getSuspiciousInputLogs } from '@/lib/middleware/input-validation'

// Monitor for attacks
const stats = getValidationStats()
if (stats.bySeverity.critical > 10) {
  // Alert: potential attack in progress
  await sendAlert('Critical input validation failures detected')
}
```

### 5. Use Consistent Field Names

```typescript
// Good: Field names match form fields
validateString(body.company_name, {
  fieldName: 'Company Name',
})

// Better: Error messages are clear
// "Company Name must be 2-100 characters"
```

### 6. Validate at Route Entry

```typescript
// Good: Validate first thing
export async function POST(req: NextRequest) {
  try {
    const { valid, data, errors } = await validateInput(req, validators)
    if (!valid) {
      return validationErrorResponse(errors)
    }
    // Only then proceed
  } catch (err) {
    // ...
  }
}
```

## Common Attack Patterns Detected

| Pattern | Example | Detection |
|---------|---------|-----------|
| SQL Injection | `' OR '1'='1` | SQL_INJECTION |
| XSS Script | `<script>alert()</script>` | XSS_INJECTION |
| Event Handler | `<img onerror="alert()">` | XSS_INJECTION |
| SQL Comments | `'; --` | SQL_INJECTION |
| Union Attack | `UNION SELECT` | SQL_INJECTION |
| Wildcard Bomb | `%%%%%` (>5) | WILDCARD_BOMB |
| Large Numbers | `1e20` (>1e15) | LARGE_NUMBER |
| Suspicious Email | `user@@example.com` | SUSPICIOUS_EMAIL_PATTERN |

## Performance Considerations

- **Memory**: Keeps last 1000 suspicious logs in memory (use database in production)
- **CPU**: Regex checks are fast; run validation at route entry
- **Throughput**: No blocking operations; validates synchronously

## Production Deployment

### For Production:

1. **Use Redis for Rate Limiting**
   ```typescript
   // Replace in-memory store with Redis
   const redis = new Redis(process.env.REDIS_URL)
   ```

2. **Log to Database**
   ```typescript
   // Replace in-memory logs with database
   await db.query(
     'INSERT INTO suspicious_inputs (pattern, input, severity) VALUES (?, ?, ?)',
     [pattern, input, severity]
   )
   ```

3. **Set Up Monitoring**
   ```typescript
   // Create admin endpoint
   export async function GET(req: NextRequest) {
     const stats = getValidationStats()
     if (stats.bySeverity.critical > 20) {
       await triggerAlert('Security: High rate of critical input validation failures')
     }
     return NextResponse.json(stats)
   }
   ```

4. **Enable CORS Headers**
   ```typescript
   response.headers.set('X-Content-Type-Options', 'nosniff')
   response.headers.set('X-Frame-Options', 'DENY')
   ```

## Testing

See `INPUT_VALIDATION_TESTS.md` for comprehensive test examples.
