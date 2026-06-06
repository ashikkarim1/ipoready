# Input Validation - Implementation Templates

## Quick Copy-Paste Templates for Common API Routes

Use these templates as starting points for adding validation to your existing routes.

---

## Template 1: Form Submission (POST)

**Use for:** Lead capture, contact forms, user registration

```typescript
// src/app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  validateInput,
  validationErrorResponse,
  validateEmail,
  validateString,
  validateEnum,
} from '@/lib/middleware/input-validation'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Define validators for each form field
    const { valid, data, errors } = await validateInput(req, {
      name: (v, r) =>
        validateString(v, {
          fieldName: 'Full Name',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req: r,
        }),

      email: (v, r) => validateEmail(v, r),

      company: (v, r) =>
        validateString(v, {
          fieldName: 'Company Name',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req: r,
        }),

      exchange: (v, r) =>
        validateEnum(v, {
          fieldName: 'Target Exchange',
          allowedValues: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE'],
          req: r,
        }),
    })

    // Return validation errors if any
    if (!valid) {
      return validationErrorResponse(errors)
    }

    // All data is now validated and sanitized
    console.log('Processing form:', data)

    // TODO: Your business logic here
    // - Save to database
    // - Send confirmation email
    // - Create user session
    // etc.

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[form-endpoint]', err)
    return NextResponse.json(
      { error: 'Failed to process form' },
      { status: 500 }
    )
  }
}
```

---

## Template 2: Resource Update (PUT/PATCH)

**Use for:** Company updates, document status changes, user profile edits

```typescript
// src/app/api/[resource]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  validateInput,
  validationErrorResponse,
  validateCompanyId,
  validateString,
  validateNumber,
  validateBoolean,
  validateUrl,
} from '@/lib/middleware/input-validation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate the resource ID from URL
    const idValidation = validateCompanyId(params.id, req)
    if (!idValidation.valid) {
      return validationErrorResponse({ id: idValidation.errors })
    }

    // Validate request body
    const { valid, data, errors } = await validateInput(req, {
      name: (v, r) =>
        validateString(v, {
          fieldName: 'Name',
          minLength: 2,
          maxLength: 150,
          sanitize: true,
          req: r,
        }),

      description: (v, r) =>
        validateString(v, {
          fieldName: 'Description',
          minLength: 0,
          maxLength: 1000,
          sanitize: true,
          req: r,
        }),

      employees: (v, r) =>
        validateNumber(
          {
            fieldName: 'Employee Count',
            min: 1,
            max: 100000,
            integer: true,
            positive: true,
            req: r,
          },
          v
        ),

      website: (v, r) => {
        if (!v) return { valid: true, value: null, errors: [] }
        return validateUrl(v, r)
      },

      isPublic: (v, r) => {
        if (v === undefined) return { valid: true, value: false, errors: [] }
        return validateBoolean({ fieldName: 'Is Public', req: r }, v)
      },
    })

    if (!valid) {
      return validationErrorResponse(errors)
    }

    // Authorization check: Verify user owns this resource
    const resource = await sql`
      SELECT company_id FROM companies WHERE id = ${idValidation.value}
    `

    const userCompanyId = (session.user as any).companyId
    if (resource[0]?.company_id !== userCompanyId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Update database with validated data
    await sql`
      UPDATE companies
      SET
        name = ${data.name},
        description = ${data.description},
        employees = ${data.employees},
        website = ${data.website},
        is_public = ${data.isPublic},
        updated_at = NOW()
      WHERE id = ${idValidation.value}
    `

    return NextResponse.json({
      success: true,
      message: 'Updated successfully',
    })
  } catch (err) {
    console.error('[update-endpoint]', err)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}
```

---

## Template 3: Search/List with Filters (GET)

**Use for:** Company search, document listing, data export

```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  validateSearchQuery,
  validatePagination,
  validateEnum,
  validationErrorResponse,
} from '@/lib/middleware/input-validation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)

    // Validate search query
    const query = url.searchParams.get('q') || ''
    const queryResult = validateSearchQuery(query, req)
    if (!queryResult.valid) {
      return validationErrorResponse({ q: queryResult.errors })
    }

    // Validate pagination
    const pageResult = validatePagination(
      url.searchParams.get('page'),
      url.searchParams.get('limit'),
      req
    )
    if (!pageResult.valid) {
      return validationErrorResponse(pageResult.errors)
    }

    const { page, limit } = pageResult.value

    // Validate optional filters
    const exchangeParam = url.searchParams.get('exchange')
    const exchange = exchangeParam
      ? validateEnum(exchangeParam, {
          fieldName: 'Exchange',
          allowedValues: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC'],
          req,
        })
      : { valid: true, value: null }

    if (!exchange.valid) {
      return validationErrorResponse({ exchange: exchange.errors })
    }

    const userCompanyId = (session.user as any).companyId
    const offset = (page - 1) * limit

    // Build query with validated parameters
    let whereClause = 'WHERE company_id = $1'
    const params: any[] = [userCompanyId]

    if (queryResult.value) {
      params.push(`%${queryResult.value}%`)
      whereClause += ` AND name ILIKE $${params.length}`
    }

    if (exchange.value) {
      params.push(exchange.value)
      whereClause += ` AND exchange = $${params.length}`
    }

    // Count total results
    const countResult = await sql(
      `SELECT COUNT(*) as count FROM companies ${whereClause}`,
      params
    )
    const total = countResult[0]?.count || 0

    // Fetch paginated results
    const results = await sql(
      `
        SELECT id, name, exchange, status, created_at
        FROM companies
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      params
    )

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('[search-endpoint]', err)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
```

---

## Template 4: Bulk Operations (POST with Array)

**Use for:** Bulk imports, batch status updates, multi-item actions

```typescript
// src/app/api/bulk-action/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  validateArray,
  validateCompanyId,
  validateEnum,
  validationErrorResponse,
} from '@/lib/middleware/input-validation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const userCompanyId = (session.user as any).companyId

    // Validate array of items
    const itemsResult = validateArray(body.items || [], {
      fieldName: 'Items',
      minLength: 1,
      maxLength: 100, // Prevent excessive bulk operations
      itemValidator: (item) => {
        const errors: string[] = []

        // Validate each item's ID
        const idResult = validateCompanyId(item.id, req, false)
        if (!idResult.valid) {
          errors.push(`ID: ${idResult.errors.join(', ')}`)
        }

        // Validate action
        const actionResult = validateEnum(item.action, {
          fieldName: 'Action',
          allowedValues: ['update', 'archive', 'delete'],
          caseSensitive: false,
          req,
        })
        if (!actionResult.valid) {
          errors.push(`Action: ${actionResult.errors.join(', ')}`)
        }

        return {
          valid: errors.length === 0,
          value: {
            id: idResult.value,
            action: actionResult.value,
          },
          errors,
        }
      },
    })

    if (!itemsResult.valid) {
      return validationErrorResponse({ items: itemsResult.errors })
    }

    // Execute bulk operation
    const results = []

    for (const item of itemsResult.value) {
      try {
        // Verify ownership
        const resource = await sql`
          SELECT company_id FROM companies WHERE id = ${item.id}
        `

        if (!resource[0] || resource[0].company_id !== userCompanyId) {
          results.push({
            id: item.id,
            success: false,
            error: 'Not authorized',
          })
          continue
        }

        // Execute action
        if (item.action === 'delete') {
          await sql`DELETE FROM companies WHERE id = ${item.id}`
        } else if (item.action === 'archive') {
          await sql`UPDATE companies SET status = 'archived' WHERE id = ${item.id}`
        }

        results.push({
          id: item.id,
          success: true,
          action: item.action,
        })
      } catch (err) {
        results.push({
          id: item.id,
          success: false,
          error: 'Operation failed',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk operation completed',
      results,
    })
  } catch (err) {
    console.error('[bulk-action]', err)
    return NextResponse.json(
      { error: 'Bulk operation failed' },
      { status: 500 }
    )
  }
}
```

---

## Template 5: File Upload with Metadata (POST)

**Use for:** Document uploads, profile pictures, CSV imports

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  validateInput,
  validationErrorResponse,
  validateString,
  validateEnum,
} from '@/lib/middleware/input-validation'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const fileName = formData.get('fileName') as string | null
    const documentType = formData.get('type') as string | null

    // Validate file metadata
    const { valid, data, errors } = await validateInput(req, {
      type: (v, r) =>
        validateEnum(v || '', {
          fieldName: 'Document Type',
          allowedValues: [
            'articles_of_incorporation',
            'financial_statements',
            'cap_table',
            'board_resolutions',
            'other',
          ],
          caseSensitive: false,
          req: r,
        }),
    })

    // Note: You'd also validate file separately
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 50MB)' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    if (!valid) {
      return validationErrorResponse(errors)
    }

    // TODO: Upload file to cloud storage
    // - Validate file contents
    // - Store in S3/Google Drive/etc.
    // - Save metadata to database

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename: file.name,
      type: data.type,
      size: file.size,
    })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

---

## Template 6: Delete Operation with Confirmation (DELETE)

**Use for:** Account deletion, document removal, resource cleanup

```typescript
// src/app/api/[resource]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  validateInput,
  validationErrorResponse,
  validateCompanyId,
  validateBoolean,
} from '@/lib/middleware/input-validation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate resource ID
    const idValidation = validateCompanyId(params.id, req)
    if (!idValidation.valid) {
      return validationErrorResponse({ id: idValidation.errors })
    }

    // Validate confirmation
    const { valid, data, errors } = await validateInput(req, {
      confirmed: (v, r) =>
        validateBoolean({ fieldName: 'Confirmed', req: r }, v),

      confirmationToken: (v, r) => {
        if (!v) {
          return {
            valid: false,
            errors: ['Confirmation token required'],
          }
        }
        // Validate the token matches user
        return { valid: true, value: v, errors: [] }
      },
    })

    if (!valid) {
      return validationErrorResponse(errors)
    }

    if (!data.confirmed) {
      return NextResponse.json(
        { error: 'Deletion not confirmed' },
        { status: 400 }
      )
    }

    // Additional safety: Rate limit deletes
    const userCompanyId = (session.user as any).companyId
    const recentDeletes = await sql`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE company_id = ${userCompanyId}
        AND action = 'delete'
        AND created_at > NOW() - INTERVAL '1 day'
    `

    if ((recentDeletes[0]?.count || 0) > 10) {
      return NextResponse.json(
        { error: 'Too many deletes. Try again tomorrow.' },
        { status: 429 }
      )
    }

    // Verify ownership
    const resource = await sql`
      SELECT company_id FROM companies WHERE id = ${idValidation.value}
    `

    if (!resource[0] || resource[0].company_id !== userCompanyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete (archive instead of hard delete)
    await sql`
      UPDATE companies
      SET status = 'deleted', deleted_at = NOW()
      WHERE id = ${idValidation.value}
    `

    // Log the action
    await sql`
      INSERT INTO audit_logs (company_id, action, resource_id, details)
      VALUES (${userCompanyId}, 'delete', ${idValidation.value}, ${'Deleted company'})
    `

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully',
    })
  } catch (err) {
    console.error('[delete-endpoint]', err)
    return NextResponse.json(
      { error: 'Deletion failed' },
      { status: 500 }
    )
  }
}
```

---

## Template 7: Query Parameter Validation (GET with Advanced Filters)

**Use for:** Advanced filtering, analytics, admin dashboards

```typescript
// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  validateQueryParams,
  validateNumber,
  validateDate,
  validateEnum,
} from '@/lib/middleware/input-validation'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate all query parameters
    const { valid, params, errors } = validateQueryParams(req, {
      startDate: (value, r) => {
        if (!value) {
          return { valid: true, value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), errors: [] }
        }
        return validateDate(value, { fieldName: 'Start Date', req: r })
      },

      endDate: (value, r) => {
        if (!value) {
          return { valid: true, value: new Date(), errors: [] }
        }
        return validateDate(value, { fieldName: 'End Date', req: r })
      },

      metric: (value, r) => {
        if (!value) {
          return { valid: true, value: 'revenue', errors: [] }
        }
        return validateEnum(value, {
          fieldName: 'Metric',
          allowedValues: ['revenue', 'growth', 'engagement', 'retention'],
          caseSensitive: false,
          req: r,
        })
      },

      groupBy: (value, r) => {
        if (!value) {
          return { valid: true, value: 'day', errors: [] }
        }
        return validateEnum(value, {
          fieldName: 'Group By',
          allowedValues: ['day', 'week', 'month'],
          caseSensitive: false,
          req: r,
        })
      },

      minValue: (value, r) => {
        if (!value) {
          return { valid: true, value: 0, errors: [] }
        }
        return validateNumber({ fieldName: 'Min Value', min: 0, req: r }, value)
      },
    })

    if (!valid) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      )
    }

    // Use validated parameters safely in query
    // TODO: Build analytics query with validated params

    return NextResponse.json({
      success: true,
      metric: params.metric,
      groupBy: params.groupBy,
      startDate: params.startDate,
      endDate: params.endDate,
      // ... results
    })
  } catch (err) {
    console.error('[analytics]', err)
    return NextResponse.json(
      { error: 'Analytics query failed' },
      { status: 500 }
    )
  }
}
```

---

## Migration Checklist

Use this checklist when adding validation to an existing route:

- [ ] Import validation functions
- [ ] Create validators object with all fields
- [ ] Call `validateInput()` or individual validators
- [ ] Check `valid` flag before proceeding
- [ ] Return `validationErrorResponse()` on validation failure
- [ ] Use `data` object (validated & sanitized) in business logic
- [ ] Add try/catch with proper error logging
- [ ] Test with both valid and invalid inputs
- [ ] Add to test suite
- [ ] Document any custom validation rules

---

## Performance Tips

1. **Validate early**: Check inputs at route entry, before any database queries
2. **Compose validators**: Create reusable validator objects at module level
3. **Fail fast**: Return immediately on validation failure
4. **Log strategically**: Only log suspicious inputs, not all validation failures
5. **Batch operations**: Validate entire arrays before processing items

---

## Security Reminders

- Always validate in addition to client-side validation
- Never trust user input, even from authenticated users
- Use sanitized values in all database queries
- Log all validation failures for monitoring
- Review suspicious input logs regularly
- Keep validation rules up-to-date with threats

---

For more examples, see:
- `input-validation-examples.ts` - Detailed usage patterns
- `INPUT_VALIDATION_GUIDE.md` - Complete reference documentation
- `__tests__/input-validation.test.ts` - Test examples
