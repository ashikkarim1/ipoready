# Input Validation - Quick Reference Card

## Import

```typescript
import {
  validateInput,
  validationErrorResponse,
  validateEmail,
  validateString,
  validateNumber,
  validateCompanyId,
  validateEnum,
  validateSearchQuery,
  validatePagination,
} from '@/lib/middleware/input-validation'
```

## Basic Pattern (30 seconds)

```typescript
export async function POST(req: NextRequest) {
  const { valid, data, errors } = await validateInput(req, {
    email: (v, r) => validateEmail(v, r),
    name: (v, r) => validateString(v, { fieldName: 'Name', minLength: 2, req: r }),
  })

  if (!valid) return validationErrorResponse(errors)
  
  // Use data safely
  return NextResponse.json({ success: true })
}
```

## Single Field Validators

### Email
```typescript
validateEmail('user@example.com', req)
// → { valid: true, value: 'user@example.com', errors: [] }
```

### String
```typescript
validateString('John Doe', {
  fieldName: 'Name',
  minLength: 2,
  maxLength: 100,
  sanitize: true,
  req,
})
```

### Number
```typescript
validateNumber(42, {
  fieldName: 'Count',
  min: 1,
  max: 100,
  integer: true,
  req,
})
```

### Company ID (UUID)
```typescript
validateCompanyId('550e8400-e29b-41d4-a716-446655440000', req)
```

### Enum
```typescript
validateEnum('TSX', {
  fieldName: 'Exchange',
  allowedValues: ['TSX', 'NASDAQ', 'NYSE'],
  req,
})
```

### Boolean
```typescript
validateBoolean(true, { fieldName: 'Active', req })
```

### Array
```typescript
validateArray(['a', 'b'], {
  fieldName: 'Items',
  minLength: 1,
  maxLength: 100,
  itemValidator: (item) => validateEmail(item),
  req,
})
```

### Date
```typescript
validateDate('2024-06-06', {
  fieldName: 'Event Date',
  minDate: new Date('2024-01-01'),
  maxDate: new Date('2024-12-31'),
  req,
})
```

### URL
```typescript
validateUrl('https://example.com', req)
```

### Phone
```typescript
validatePhoneNumber('+1-555-1234', req)
// → Cleaned: '15551234567'
```

### Search Query
```typescript
validateSearchQuery('venture capital', req)
// Prevents SQL injection, XSS, wildcard bombs
```

### Pagination
```typescript
validatePagination('2', '25', req)
// → { page: 2, limit: 25 }
```

## Response Patterns

### Validation Failure
```typescript
if (!valid) {
  return validationErrorResponse(errors)
  // Returns 400 with structured errors
}
```

### Success
```typescript
return NextResponse.json({
  success: true,
  data,  // Use validated data
})
```

### Custom Error
```typescript
if (!valid) {
  return NextResponse.json(
    { errors, message: 'Invalid input' },
    { status: 400 }
  )
}
```

## Composable Validators (Reuse)

```typescript
// Define once, use many times
const emailValidator = (v, r) => validateEmail(v, r)
const nameValidator = (v, r) => validateString(v, {
  fieldName: 'Name',
  minLength: 2,
  maxLength: 100,
  req: r,
})

// Reuse
const { valid, data, errors } = await validateInput(req, {
  email: emailValidator,
  name: nameValidator,
})
```

## Common Use Cases

### Lead Capture Form
```typescript
await validateInput(req, {
  email: (v, r) => validateEmail(v, r),
  fullName: (v, r) => validateString(v, { fieldName: 'Name', minLength: 2, req: r }),
  company: (v, r) => validateString(v, { fieldName: 'Company', minLength: 2, req: r }),
  exchange: (v, r) => validateEnum(v, {
    fieldName: 'Exchange',
    allowedValues: ['TSX', 'NASDAQ', 'NYSE'],
    req: r,
  }),
})
```

### Company Update
```typescript
await validateInput(req, {
  companyId: (v, r) => validateCompanyId(v, r),
  name: (v, r) => validateString(v, { fieldName: 'Name', maxLength: 150, req: r }),
  employees: (v, r) => validateNumber({
    fieldName: 'Employees',
    min: 1,
    max: 100000,
    integer: true,
    req: r,
  }, v),
})
```

### Search with Pagination
```typescript
const url = new URL(req.url)
const query = validateSearchQuery(url.searchParams.get('q') || '', req)
const page = validatePagination(
  url.searchParams.get('page'),
  url.searchParams.get('limit'),
  req
)
```

### Bulk Operations
```typescript
await validateInput(req, {
  ids: (v, r) => validateArray(v || [], {
    fieldName: 'IDs',
    minLength: 1,
    maxLength: 100,
    itemValidator: (id) => validateCompanyId(id, r),
    req: r,
  }),
})
```

## Attack Pattern Detection

**Automatically detected and logged:**
- SQL injection: `'; DROP TABLE--`
- XSS: `<script>alert()</script>`
- Wildcard bombs: `*****`
- Number overflow: `1e20`
- Suspicious emails: `user@@example.com`

## Sanitization

```typescript
import {
  escapeHtml,        // Escape HTML entities
  stripHtmlTags,     // Remove <tags>
  sanitizeString,    // Do both
  detectSqlInjection, // Check only
} from '@/lib/middleware/input-validation'

// Automatically applied in string validators
// Manual use:
const safe = sanitizeString('<b>Hello</b>')
// → 'Hello' (tags removed)
```

## Monitoring (Admin)

```typescript
import {
  getSuspiciousInputLogs,  // Get logged threats
  getValidationStats,       // Get statistics
  clearSuspiciousInputLogs, // Clear logs
} from '@/lib/middleware/input-validation'

// Get critical threats
const logs = getSuspiciousInputLogs({ severity: 'critical' })

// Get stats
const stats = getValidationStats()
// → { totalLogs, bySeverity: {critical, high, ...}, byPattern: {...} }
```

## Error Handling

```typescript
try {
  const { valid, data, errors } = await validateInput(req, validators)
  if (!valid) return validationErrorResponse(errors)
  
  // Process data...
  
} catch (err) {
  console.error('Validation error:', err)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Checklist for Each Endpoint

- [ ] Import validators
- [ ] Define validator functions
- [ ] Call `validateInput()` or individual validators
- [ ] Check `valid` flag
- [ ] Return error response on failure
- [ ] Use `data` object (validated & sanitized)
- [ ] Add try/catch
- [ ] Test with invalid inputs

## Performance Tips

1. **Validate first** - Before database queries
2. **Compose reusable** - Define validators at module level
3. **Fail fast** - Return immediately on error
4. **Log selectively** - Only log suspicious inputs
5. **Batch efficiently** - Validate arrays before loops

## Common Mistakes

❌ Skip validation for authenticated users
- All user input must be validated

❌ Trust client-side validation only
- Always validate server-side

❌ Use raw user input in queries
- Always use validated + sanitized data

❌ Ignore validation errors
- Log and monitor all failures

✅ Validate at route entry
- First thing after auth check

✅ Use error responses
- Return detailed error messages

✅ Sanitize automatically
- Validators do this by default

✅ Monitor threats
- Review suspicious logs regularly

## Reference Docs

| Document | Purpose |
|----------|---------|
| `INPUT_VALIDATION_README.md` | Overview & setup |
| `INPUT_VALIDATION_GUIDE.md` | Complete API reference |
| `IMPLEMENTATION_TEMPLATES.md` | Copy-paste examples |
| `input-validation-examples.ts` | Code examples |
| `__tests__/input-validation.test.ts` | Test examples |

## Get Help

**For quick answers:**
1. Check this card first
2. Look at IMPLEMENTATION_TEMPLATES.md
3. Search input-validation-examples.ts

**For detailed info:**
1. Read INPUT_VALIDATION_GUIDE.md
2. Check __tests__ for examples
3. Review INPUT_VALIDATION_README.md

**For new validators:**
```typescript
// Extend as needed
export function validateCustom(value: string): ValidationResult {
  const errors: string[] = []
  
  if (!value) {
    errors.push('Required')
  }
  
  // Your validation logic...
  
  return {
    valid: errors.length === 0,
    value,
    errors,
  }
}
```

---

**Last Updated:** June 2024  
**Status:** Production Ready  
**Location:** `/src/lib/middleware/input-validation.ts`
