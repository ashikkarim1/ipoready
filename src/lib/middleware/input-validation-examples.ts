/**
 * Input Validation Middleware - Usage Examples
 *
 * This file demonstrates how to apply the input validation middleware
 * to common API route patterns in the IPOReady application.
 *
 * Copy patterns from here and adapt them to your specific API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  validateInput,
  validationErrorResponse,
  validateEmail,
  validateCompanyId,
  validateString,
  validateNumber,
  validateEnum,
  validateSearchQuery,
  validateArray,
  validateUrl,
  validatePhoneNumber,
  validatePagination,
  sanitizeString,
  validateBoolean,
} from './input-validation'

// ============================================================================
// EXAMPLE 1: Lead Capture Form Validation
// ============================================================================

/**
 * Example POST endpoint for lead capture with full validation
 *
 * Usage in route.ts:
 * ```
 * export async function POST(req: NextRequest) {
 *   return handleLeadCaptureValidation(req)
 * }
 * ```
 */
export async function validateLeadCaptureInput(req: NextRequest) {
  try {
    // Define validators for each field
    const validators = {
      full_name: (value: any, req?: NextRequest) =>
        validateString(value, {
          fieldName: 'Full Name',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req,
        }),

      email: (value: any, req?: NextRequest) =>
        validateEmail(value, req),

      company_name: (value: any, req?: NextRequest) =>
        validateString(value, {
          fieldName: 'Company Name',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req,
        }),

      listing_exchange_target: (value: any, req?: NextRequest) =>
        validateEnum(value, {
          fieldName: 'Listing Exchange',
          allowedValues: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE', 'Other'],
          caseSensitive: false,
          req,
        }),

      job_title: (value: any, req?: NextRequest) => {
        // Optional field
        if (!value) {
          return { valid: true, value: null, errors: [] }
        }
        return validateString(value, {
          fieldName: 'Job Title',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req,
        })
      },
    }

    // Validate all inputs
    const { valid, data, errors } = await validateInput(req, validators)

    if (!valid) {
      return validationErrorResponse(errors)
    }

    // At this point, data is validated and sanitized
    // You can safely use data.email, data.full_name, etc.
    console.log('Validated data:', data)

    // Return success or continue with business logic
    return NextResponse.json({
      success: true,
      message: 'Input validation passed',
      data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'
    console.error('[lead-capture-validation]', message)
    return NextResponse.json(
      { error: 'Validation error', details: message },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 2: Company ID Validation in Update Route
// ============================================================================

/**
 * Example validation for updating company data
 *
 * Usage in route.ts:
 * ```
 * export async function PUT(req: NextRequest) {
 *   return handleCompanyUpdateValidation(req)
 * }
 * ```
 */
export async function validateCompanyUpdateInput(req: NextRequest) {
  try {
    const validators = {
      companyId: (value: any, req?: NextRequest) =>
        validateCompanyId(value, req, false),

      name: (value: any, req?: NextRequest) =>
        validateString(value, {
          fieldName: 'Company Name',
          minLength: 2,
          maxLength: 150,
          sanitize: true,
          req,
        }),

      description: (value: any, req?: NextRequest) =>
        validateString(value, {
          fieldName: 'Description',
          minLength: 0,
          maxLength: 1000,
          sanitize: true,
          req,
        }),

      targetExchange: (value: any, req?: NextRequest) =>
        validateEnum(value, {
          fieldName: 'Target Exchange',
          allowedValues: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE', 'Other'],
          req,
        }),

      employees: (value: any, req?: NextRequest) =>
        validateNumber({
          fieldName: 'Number of Employees',
          min: 1,
          max: 100000,
          integer: true,
          positive: true,
          req,
        }, value),

      postMoneyValuation: (value: any, req?: NextRequest) =>
        validateNumber({
          fieldName: 'Post-Money Valuation',
          min: 1000000,
          max: 1000000000000, // $1 trillion max
          req,
        }, value),

      website: (value: any, req?: NextRequest) => {
        if (!value) {
          return { valid: true, value: null, errors: [] }
        }
        return validateUrl(value, req)
      },

      publiclyListed: (value: any, req?: NextRequest) =>
        validateBoolean({ fieldName: 'Publicly Listed', req }, value),
    }

    const { valid, data, errors } = await validateInput(req, validators)

    if (!valid) {
      return validationErrorResponse(errors)
    }

    console.log('Validated company update:', data)
    return NextResponse.json({
      success: true,
      message: 'Company update validation passed',
      data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'
    return NextResponse.json(
      { error: 'Validation error', details: message },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 3: Search Query Validation
// ============================================================================

/**
 * Example search endpoint with query validation
 *
 * Usage in route.ts:
 * ```
 * export async function GET(req: NextRequest) {
 *   return handleSearchValidation(req)
 * }
 * ```
 */
export function validateSearchInput(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    const page = url.searchParams.get('page')
    const limit = url.searchParams.get('limit')

    // Validate search query
    const queryResult = validateSearchQuery(query || '', req)
    if (!queryResult.valid) {
      return validationErrorResponse({ query: queryResult.errors })
    }

    // Validate pagination
    const paginationResult = validatePagination(page, limit, req)
    if (!paginationResult.valid) {
      return validationErrorResponse({
        page: paginationResult.errors,
      })
    }

    const { page: pageNum, limit: limitNum } = paginationResult.value

    console.log('Search parameters:', {
      query: queryResult.value,
      page: pageNum,
      limit: limitNum,
    })

    // Return success or continue with search logic
    return NextResponse.json({
      success: true,
      message: 'Search validation passed',
      data: {
        query: queryResult.value,
        page: pageNum,
        limit: limitNum,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'
    return NextResponse.json(
      { error: 'Validation error', details: message },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 4: Array/Bulk Operations Validation
// ============================================================================

/**
 * Example for bulk operations with array validation
 *
 * Usage in route.ts:
 * ```
 * export async function POST(req: NextRequest) {
 *   return handleBulkOperationValidation(req)
 * }
 * ```
 */
export async function validateBulkOperationInput(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate the array of items
    const itemsResult = validateArray(body.items || [], {
      fieldName: 'Items',
      minLength: 1,
      maxLength: 100,
      itemValidator: (item: any) => {
        // Validate each item
        if (!item || typeof item !== 'object') {
          return {
            valid: false,
            errors: ['Each item must be an object'],
          }
        }

        const errors: string[] = []

        // Validate ID in each item
        const idResult = validateCompanyId(item.id, req, false)
        if (!idResult.valid) {
          errors.push(`Item ID: ${idResult.errors.join(', ')}`)
        }

        // Validate action
        const actionResult = validateEnum(item.action, {
          fieldName: 'Action',
          allowedValues: ['update', 'delete', 'archive'],
          caseSensitive: false,
          req,
        })
        if (!actionResult.valid) {
          errors.push(`Item action: ${actionResult.errors.join(', ')}`)
        }

        return {
          valid: errors.length === 0,
          value: {
            id: idResult.value,
            action: actionResult.value,
            ...item,
          },
          errors,
        }
      },
      req,
    })

    if (!itemsResult.valid) {
      return validationErrorResponse({ items: itemsResult.errors })
    }

    console.log('Validated bulk operation:', itemsResult.value)

    return NextResponse.json({
      success: true,
      message: 'Bulk operation validation passed',
      data: {
        items: itemsResult.value,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'
    return NextResponse.json(
      { error: 'Validation error', details: message },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 5: Contact Information Validation
// ============================================================================

/**
 * Example validation for contact form with optional fields
 */
export async function validateContactInput(req: NextRequest) {
  try {
    const validators = {
      name: (value: any, req?: NextRequest) =>
        validateString(value, {
          fieldName: 'Name',
          minLength: 2,
          maxLength: 100,
          sanitize: true,
          req,
        }),

      email: (value: any, req?: NextRequest) =>
        validateEmail(value, req),

      phone: (value: any, req?: NextRequest) => {
        if (!value) {
          return { valid: true, value: null, errors: [] }
        }
        return validatePhoneNumber(value, req)
      },

      message: (value: any, req?: NextRequest) =>
        validateString(value, {
          fieldName: 'Message',
          minLength: 10,
          maxLength: 2000,
          sanitize: true,
          req,
        }),

      subject: (value: any, req?: NextRequest) =>
        validateEnum(value, {
          fieldName: 'Subject',
          allowedValues: [
            'general_inquiry',
            'technical_support',
            'billing',
            'partnership',
            'other',
          ],
          caseSensitive: false,
          req,
        }),

      subscribe: (value: any, req?: NextRequest) => {
        if (value === undefined || value === null) {
          return { valid: true, value: false, errors: [] }
        }
        return validateBoolean({ fieldName: 'Subscribe', req }, value)
      },
    }

    const { valid, data, errors } = await validateInput(req, validators)

    if (!valid) {
      return validationErrorResponse(errors)
    }

    console.log('Validated contact:', data)
    return NextResponse.json({
      success: true,
      message: 'Contact validation passed',
      data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed'
    return NextResponse.json(
      { error: 'Validation error', details: message },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 6: Reusable Composed Validators
// ============================================================================

/**
 * Create a reusable validator composition for common patterns
 */
export const commonValidators = {
  /**
   * Validators for lead/user creation
   */
  leadCreation: {
    full_name: (value: any, req?: NextRequest) =>
      validateString(value, {
        fieldName: 'Full Name',
        minLength: 2,
        maxLength: 100,
        sanitize: true,
        req,
      }),

    email: (value: any, req?: NextRequest) =>
      validateEmail(value, req),

    company_name: (value: any, req?: NextRequest) =>
      validateString(value, {
        fieldName: 'Company Name',
        minLength: 2,
        maxLength: 100,
        sanitize: true,
        req,
      }),
  },

  /**
   * Validators for company updates
   */
  companyUpdate: {
    name: (value: any, req?: NextRequest) =>
      validateString(value, {
        fieldName: 'Company Name',
        minLength: 2,
        maxLength: 150,
        sanitize: true,
        req,
      }),

    description: (value: any, req?: NextRequest) =>
      validateString(value, {
        fieldName: 'Description',
        minLength: 0,
        maxLength: 1000,
        sanitize: true,
        req,
      }),

    website: (value: any, req?: NextRequest) => {
      if (!value) {
        return { valid: true, value: null, errors: [] }
      }
      return validateUrl(value, req)
    },
  },

  /**
   * Validators for pagination (reusable)
   */
  pagination: (req?: NextRequest) => ({
    page: (value: any) =>
      validateNumber({
        fieldName: 'Page',
        min: 1,
        max: 1000000,
        integer: true,
        req,
      }, value),

    limit: (value: any) =>
      validateNumber({
        fieldName: 'Limit',
        min: 1,
        max: 100,
        integer: true,
        req,
      }, value),
  }),
}

// ============================================================================
// EXAMPLE 7: Query Parameter Validation
// ============================================================================

/**
 * Helper to validate and extract query parameters
 */
export function validateQueryParams(
  req: NextRequest,
  schema: Record<string, (value: string | null, req?: NextRequest) => any>
) {
  const url = new URL(req.url)
  const params: Record<string, any> = {}
  const errors: Record<string, string[]> = {}

  for (const [key, validator] of Object.entries(schema)) {
    const value = url.searchParams.get(key)
    const result = validator(value, req)

    if (!result.valid) {
      errors[key] = result.errors
    } else {
      params[key] = result.value
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    params,
    errors,
  }
}

/**
 * Example usage of query parameter validation
 */
export function validateListingQueryParams(req: NextRequest) {
  return validateQueryParams(req, {
    search: (value, req) => {
      if (!value) {
        return { valid: true, value: null, errors: [] }
      }
      return validateSearchQuery(value, req)
    },

    exchange: (value, req) => {
      if (!value) {
        return { valid: true, value: null, errors: [] }
      }
      return validateEnum(value, {
        fieldName: 'Exchange',
        allowedValues: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE'],
        caseSensitive: true,
        req,
      })
    },

    page: (value, req) =>
      validateNumber(value || '1', {
        fieldName: 'Page',
        min: 1,
        max: 1000000,
        integer: true,
        req,
      }),

    limit: (value, req) =>
      validateNumber(value || '10', {
        fieldName: 'Limit',
        min: 1,
        max: 100,
        integer: true,
        req,
      }),

    sortBy: (value, req) => {
      if (!value) {
        return { valid: true, value: 'created_at', errors: [] }
      }
      return validateEnum(value, {
        fieldName: 'Sort By',
        allowedValues: ['created_at', 'name', 'exchange', 'status'],
        caseSensitive: false,
        req,
      })
    },

    sortOrder: (value, req) => {
      if (!value) {
        return { valid: true, value: 'desc', errors: [] }
      }
      return validateEnum(value, {
        fieldName: 'Sort Order',
        allowedValues: ['asc', 'desc'],
        caseSensitive: false,
        req,
      })
    },
  })
}
