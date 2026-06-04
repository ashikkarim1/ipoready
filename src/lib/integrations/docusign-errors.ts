/**
 * DocuSign Error Handling & Utilities
 * Comprehensive error handling for DocuSign integration
 */

export class DocuSignError extends Error {
  constructor(
    message: string,
    public code: string = 'DOCUSIGN_ERROR',
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'DocuSignError'
  }
}

export class DocuSignAuthError extends DocuSignError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, details)
    this.name = 'DocuSignAuthError'
  }
}

export class DocuSignTokenError extends DocuSignError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'TOKEN_ERROR', 401, details)
    this.name = 'DocuSignTokenError'
  }
}

export class DocuSignValidationError extends DocuSignError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'DocuSignValidationError'
  }
}

export class DocuSignNotFoundError extends DocuSignError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, details)
    this.name = 'DocuSignNotFoundError'
  }
}

export class DocuSignRateLimitError extends DocuSignError {
  constructor(message: string, retryAfter?: number, details?: Record<string, any>) {
    super(message, 'RATE_LIMIT', 429, { retryAfter, ...details })
    this.name = 'DocuSignRateLimitError'
  }
}

// ============================================================
// Error Mapping & Translation
// ============================================================

export function mapDocuSignApiError(error: any): DocuSignError {
  if (error instanceof DocuSignError) {
    return error
  }

  if (error instanceof Error) {
    const message = error.message

    // Auth/Token errors
    if (message.includes('401') || message.includes('Unauthorized')) {
      return new DocuSignAuthError('Authentication failed. Please reconnect your DocuSign account.')
    }

    if (message.includes('token') && message.includes('invalid')) {
      return new DocuSignTokenError('Invalid or expired token. Please reconnect.')
    }

    if (message.includes('refresh') && message.includes('failed')) {
      return new DocuSignTokenError('Failed to refresh token. Please reconnect.')
    }

    // Not found errors
    if (message.includes('404') || message.includes('not found')) {
      const type = message.includes('envelope') ? 'envelope' :
                   message.includes('template') ? 'template' :
                   message.includes('document') ? 'document' :
                   'resource'
      return new DocuSignNotFoundError(`The requested ${type} could not be found.`)
    }

    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      const retryAfter = extractRetryAfter(error)
      return new DocuSignRateLimitError(
        'DocuSign API rate limit exceeded. Please try again shortly.',
        retryAfter
      )
    }

    // Validation errors
    if (message.includes('400') || message.includes('Bad Request')) {
      return new DocuSignValidationError('Invalid request parameters.')
    }

    // Permission/Forbidden errors
    if (message.includes('403') || message.includes('Forbidden')) {
      return new DocuSignError(
        'Permission denied. Check your DocuSign account permissions.',
        'PERMISSION_DENIED',
        403
      )
    }

    // Timeout
    if (message.includes('timeout') || message.includes('ECONNRESET')) {
      return new DocuSignError(
        'DocuSign API request timed out. Please try again.',
        'TIMEOUT',
        503
      )
    }

    // Network errors
    if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      return new DocuSignError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        503
      )
    }

    return new DocuSignError(message)
  }

  return new DocuSignError(String(error))
}

// ============================================================
// Error Message Formatting
// ============================================================

export function formatErrorMessage(error: DocuSignError | Error): string {
  if (error instanceof DocuSignError) {
    return error.message
  }

  if (error instanceof Error) {
    return mapDocuSignApiError(error).message
  }

  return 'An unexpected error occurred'
}

export function getErrorDetails(error: DocuSignError | Error): Record<string, any> {
  if (error instanceof DocuSignError) {
    return {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    }
  }

  const mapped = mapDocuSignApiError(error)
  return {
    code: mapped.code,
    statusCode: mapped.statusCode,
    message: mapped.message,
    details: mapped.details,
  }
}

// ============================================================
// Helper Functions
// ============================================================

function extractRetryAfter(error: any): number | undefined {
  if (error.retryAfter) {
    return parseInt(error.retryAfter, 10)
  }
  // Default to 60 seconds
  return 60
}

export function shouldRetryRequest(error: any): boolean {
  if (error instanceof DocuSignRateLimitError) {
    return true
  }

  if (error instanceof DocuSignError) {
    return error.statusCode >= 500
  }

  const message = error?.message || String(error)
  return message.includes('timeout') || message.includes('ECONNRESET')
}

export function getRetryDelay(error: any, attempt: number = 1): number {
  if (error instanceof DocuSignRateLimitError && error.details?.retryAfter) {
    return error.details.retryAfter * 1000
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000)
}

// ============================================================
// Validation Helpers
// ============================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateEnvelopeName(name: string): boolean {
  return !!(name && name.trim().length > 0 && name.length <= 255)
}

export function validateRecipients(recipients: any[]): boolean {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return false
  }

  return recipients.every(
    (r) =>
      validateEmail(r.email) &&
      !!r.name &&
      r.name.trim().length > 0 &&
      !!r.roleName &&
      r.roleName.trim().length > 0
  )
}

export function validateDocument(base64: string, name: string): boolean {
  if (!base64 || base64.trim().length === 0) {
    return false
  }

  if (!name || name.trim().length === 0) {
    return false
  }

  // Check if base64 is valid
  try {
    Buffer.from(base64, 'base64')
    return true
  } catch {
    return false
  }
}
