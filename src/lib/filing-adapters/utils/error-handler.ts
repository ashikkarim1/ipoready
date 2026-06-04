/**
 * Error Handler
 * Comprehensive error handling for filing adapters with structured logging and user-friendly messaging
 * Handles: custom error class, error parsing, formatting, logging, retry determination
 * Extreme care for robustness and edge cases
 */

// ============================================================================
// Types
// ============================================================================

export interface FilingErrorDetails {
  [key: string]: any
  originalError?: Error | unknown
  adapterName?: string
  operationId?: string
  timestamp?: Date
  userAction?: string
  context?: Record<string, any>
}

export interface ErrorContext {
  adapterName?: string
  operationId?: string
  userId?: string
  documentId?: string
  attemptNumber?: number
  metadata?: Record<string, any>
}

export type FilingErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORMAT_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT_ERROR'
  | 'SERVER_ERROR'
  | 'ADAPTER_ERROR'
  | 'UNKNOWN_ERROR'

// ============================================================================
// Custom Filing Error Class
// ============================================================================

export class FilingError extends Error {
  public readonly code: FilingErrorCode
  public readonly details: FilingErrorDetails
  public readonly retryable: boolean
  public readonly statusCode: number
  public readonly timestamp: Date

  constructor(
    code: FilingErrorCode,
    message: string,
    options?: {
      details?: FilingErrorDetails
      retryable?: boolean
      statusCode?: number
      cause?: Error
    }
  ) {
    const fullMessage = `[${code}] ${message}`
    super(fullMessage)

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, FilingError.prototype)

    this.code = code
    this.message = message
    this.details = options?.details ?? {}
    this.retryable = options?.retryable ?? false
    this.statusCode = options?.statusCode ?? 500
    this.timestamp = new Date()

    // Preserve original error if provided
    if (options?.cause) {
      this.details.originalError = options.cause
      if (options.cause instanceof Error) {
        this.stack = options.cause.stack
      }
    }

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilingError)
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
      timestamp: this.timestamp,
      details: this.details,
      stack: this.stack,
    }
  }

  /**
   * Convert to safe object for client transmission
   */
  toSafeObject(): Record<string, any> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      // Only include safe details, exclude sensitive info
      details: this.sanitizeDetails(this.details),
    }
  }

  /**
   * Sanitize details to remove sensitive information
   */
  private sanitizeDetails(details: FilingErrorDetails): Record<string, any> {
    const safe: Record<string, any> = {}
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'apiKey']

    for (const [key, value] of Object.entries(details)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        safe[key] = '[REDACTED]'
      } else if (value instanceof Error) {
        safe[key] = {
          name: value.name,
          message: value.message,
        }
      } else if (typeof value === 'object' && value !== null) {
        safe[key] = this.sanitizeDetails(value)
      } else {
        safe[key] = value
      }
    }

    return safe
  }
}

// ============================================================================
// Error Parser
// ============================================================================

export class ErrorParser {
  /**
   * Parse adapter-specific error into FilingError
   */
  static parseAdapterError(error: unknown, context?: ErrorContext): FilingError {
    // Handle null/undefined
    if (!error) {
      return new FilingError('UNKNOWN_ERROR', 'An unknown error occurred', {
        details: { context },
      })
    }

    // If already a FilingError, return as-is
    if (error instanceof FilingError) {
      return error
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return this.parseErrorObject(error, context)
    }

    // Handle error-like objects
    if (typeof error === 'object' && 'message' in error) {
      return this.parseErrorObject(error as any, context)
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new FilingError('UNKNOWN_ERROR', error, {
        details: { context },
      })
    }

    // Fallback for any other type
    return new FilingError('UNKNOWN_ERROR', `Unknown error type: ${typeof error}`, {
      details: {
        context,
        errorValue: String(error),
      },
    })
  }

  /**
   * Parse Error object with special handling for common patterns
   */
  private static parseErrorObject(error: any, context?: ErrorContext): FilingError {
    const message = error.message ?? String(error)
    const code = this.determineErrorCode(error, message)
    const statusCode = this.getStatusCode(error)
    const retryable = this.isRetryable(error, code)

    const details: FilingErrorDetails = {
      originalError: error,
      context,
    }

    // Extract relevant error properties
    if (error.code) details.code = error.code
    if (error.statusCode) details.statusCode = error.statusCode
    if (error.response) {
      // Handle HTTP response errors
      details.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: this.sanitizeHeaders(error.response.headers),
      }
    }
    if (error.config) {
      // Handle Axios-style config
      details.request = {
        method: error.config?.method,
        url: error.config?.url,
      }
    }

    return new FilingError(code, message, {
      details,
      retryable,
      statusCode,
      cause: error instanceof Error ? error : undefined,
    })
  }

  /**
   * Determine error code based on error characteristics
   */
  private static determineErrorCode(error: any, message: string): FilingErrorCode {
    const messageStr = message.toLowerCase()

    // Network errors
    if (messageStr.includes('network') || messageStr.includes('econnrefused') || messageStr.includes('enotfound')) {
      return 'NETWORK_ERROR'
    }

    // Timeout errors
    if (messageStr.includes('timeout') || messageStr.includes('etimeout')) {
      return 'TIMEOUT_ERROR'
    }

    // Validation errors
    if (messageStr.includes('validation') || messageStr.includes('invalid') || messageStr.includes('malformed')) {
      return 'VALIDATION_ERROR'
    }

    // Format errors
    if (messageStr.includes('format') || messageStr.includes('unsupported')) {
      return 'FORMAT_ERROR'
    }

    // Authentication errors
    if (messageStr.includes('auth') || messageStr.includes('unauthenticated') || messageStr.includes('unauthorized')) {
      return 'AUTH_ERROR'
    }

    // Permission errors
    if (messageStr.includes('permission') || messageStr.includes('forbidden')) {
      return 'PERMISSION_ERROR'
    }

    // Not found errors
    if (messageStr.includes('not found') || messageStr.includes('notfound') || messageStr.includes('404')) {
      return 'RESOURCE_NOT_FOUND'
    }

    // Conflict errors
    if (messageStr.includes('conflict') || messageStr.includes('duplicate') || messageStr.includes('409')) {
      return 'CONFLICT_ERROR'
    }

    // Server errors
    if (messageStr.includes('server') || messageStr.includes('internal') || messageStr.includes('500')) {
      return 'SERVER_ERROR'
    }

    // Check error status code
    if (error.statusCode || error.response?.status) {
      const status = error.statusCode || error.response?.status
      if (status >= 400 && status < 500) return 'VALIDATION_ERROR'
      if (status >= 500) return 'SERVER_ERROR'
    }

    return 'ADAPTER_ERROR'
  }

  /**
   * Get HTTP status code from error
   */
  private static getStatusCode(error: any): number {
    if (typeof error.statusCode === 'number') return error.statusCode
    if (typeof error.status === 'number') return error.status
    if (typeof error.response?.status === 'number') return error.response.status
    if (error.code === 'ECONNREFUSED') return 503
    if (error.code === 'ETIMEDOUT' || error.code === 'ETIMEOUT') return 504
    return 500
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryable(error: any, code: FilingErrorCode): boolean {
    // Always retryable codes
    if (['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(code)) {
      return true
    }

    // Check specific conditions
    const statusCode = this.getStatusCode(error)
    if (statusCode === 429) return true // Rate limited
    if (statusCode >= 500 && statusCode < 600) return true // Server errors
    if (statusCode === 408) return true // Request timeout
    if (statusCode === 409) return true // Conflict (might resolve)

    // Non-retryable codes
    if (['VALIDATION_ERROR', 'AUTH_ERROR', 'PERMISSION_ERROR', 'FORMAT_ERROR'].includes(code)) {
      return false
    }

    return false
  }

  /**
   * Sanitize headers for logging
   */
  private static sanitizeHeaders(headers: any): Record<string, string> {
    if (!headers || typeof headers !== 'object') return {}

    const safe: Record<string, string> = {}
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'apikey']

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.some((sh) => key.toLowerCase().includes(sh.toLowerCase()))) {
        safe[key] = '[REDACTED]'
      } else {
        safe[key] = String(value)
      }
    }

    return safe
  }
}

// ============================================================================
// Error Formatter
// ============================================================================

export class ErrorFormatter {
  /**
   * Format error for user display
   */
  static formatErrorForUser(error: FilingError | Error): string {
    let filingError: FilingError

    if (error instanceof FilingError) {
      filingError = error
    } else {
      filingError = ErrorParser.parseAdapterError(error)
    }

    // Map error codes to user-friendly messages
    const userMessages: Record<FilingErrorCode, string> = {
      VALIDATION_ERROR: 'The document format is invalid. Please check the document and try again.',
      FORMAT_ERROR: 'This file format is not supported. Please use PDF, DOCX, or XLSX.',
      NETWORK_ERROR: 'Network connection error. Please check your internet connection and try again.',
      TIMEOUT_ERROR: 'The operation took too long. Please try again.',
      AUTH_ERROR: 'Authentication failed. Please log in again.',
      PERMISSION_ERROR: 'You do not have permission to perform this action.',
      RESOURCE_NOT_FOUND: 'The requested document was not found.',
      CONFLICT_ERROR: 'This document already exists or there is a conflict. Please try a different name.',
      SERVER_ERROR: 'A server error occurred. Please try again later.',
      ADAPTER_ERROR: 'An error occurred while processing the document. Please try again.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    }

    return userMessages[filingError.code] || userMessages.UNKNOWN_ERROR
  }

  /**
   * Format error for logging
   */
  static formatErrorForLogging(error: FilingError | Error, context?: ErrorContext): string {
    let filingError: FilingError

    if (error instanceof FilingError) {
      filingError = error
    } else {
      filingError = ErrorParser.parseAdapterError(error, context)
    }

    const parts: string[] = [
      `[${filingError.timestamp.toISOString()}]`,
      `[${filingError.code}]`,
      filingError.message,
    ]

    if (context?.operationId) {
      parts.push(`[OperationID: ${context.operationId}]`)
    }

    if (context?.adapterName) {
      parts.push(`[Adapter: ${context.adapterName}]`)
    }

    if (filingError.details.originalError) {
      const origErr = filingError.details.originalError
      if (origErr instanceof Error) {
        parts.push(`Stack: ${origErr.stack}`)
      }
    }

    return parts.join(' ')
  }

  /**
   * Format error as JSON for structured logging
   */
  static formatErrorAsJSON(error: FilingError | Error, context?: ErrorContext): string {
    let filingError: FilingError

    if (error instanceof FilingError) {
      filingError = error
    } else {
      filingError = ErrorParser.parseAdapterError(error, context)
    }

    return JSON.stringify(filingError.toJSON())
  }
}

// ============================================================================
// Error Logger
// ============================================================================

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error'
  destination?: 'console' | 'file' | 'sentry' | 'custom'
  includeStack?: boolean
  includeSensitiveData?: boolean
}

export class ErrorLogger {
  private config: LoggerConfig

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: 'error',
      destination: 'console',
      includeStack: true,
      includeSensitiveData: false,
      ...config,
    }
  }

  /**
   * Log error with appropriate level and destination
   */
  log(error: FilingError | Error, context?: ErrorContext): void {
    try {
      const filingError = error instanceof FilingError ? error : ErrorParser.parseAdapterError(error, context)

      const logData = {
        timestamp: new Date().toISOString(),
        code: filingError.code,
        message: filingError.message,
        statusCode: filingError.statusCode,
        retryable: filingError.retryable,
        context,
        ...(this.config.includeStack && { stack: filingError.stack }),
        ...(this.config.includeSensitiveData && { details: filingError.details }),
      }

      this.writeLog(logData)
    } catch (logError) {
      // Prevent logging errors from crashing the app
      console.error('Failed to log error:', logError)
    }
  }

  /**
   * Write log based on configured destination
   */
  private writeLog(data: any): void {
    switch (this.config.destination) {
      case 'console':
        console.error(JSON.stringify(data, null, 2))
        break

      case 'file':
        // File logging would be implemented by subclass or external logger
        // Placeholder for integration with winston, pino, etc.
        break

      case 'sentry':
        // Sentry integration would go here
        // Placeholder for external error tracking
        break

      case 'custom':
        // Custom handler would be implemented by consumer
        break

      default:
        console.error(JSON.stringify(data, null, 2))
    }
  }

  /**
   * Batch log multiple errors
   */
  logBatch(errors: (FilingError | Error)[], context?: ErrorContext): void {
    for (const error of errors) {
      this.log(error, context)
    }
  }
}

// ============================================================================
// Retry Determination
// ============================================================================

export class RetryDeterminer {
  /**
   * Determine if error is safe to retry
   */
  static isRetryable(error: FilingError | Error): boolean {
    if (error instanceof FilingError) {
      return error.retryable
    }

    const filingError = ErrorParser.parseAdapterError(error)
    return filingError.retryable
  }

  /**
   * Get retry recommendation with details
   */
  static getRetryRecommendation(error: FilingError | Error): {
    recommended: boolean
    reason: string
    maxAttempts: number
    initialDelayMs: number
  } {
    const filingError = error instanceof FilingError ? error : ErrorParser.parseAdapterError(error)

    const recommendations: Record<FilingErrorCode, any> = {
      NETWORK_ERROR: {
        recommended: true,
        reason: 'Network connectivity issue detected',
        maxAttempts: 5,
        initialDelayMs: 1000,
      },
      TIMEOUT_ERROR: {
        recommended: true,
        reason: 'Operation timed out',
        maxAttempts: 3,
        initialDelayMs: 2000,
      },
      SERVER_ERROR: {
        recommended: true,
        reason: 'Server error detected',
        maxAttempts: 4,
        initialDelayMs: 1000,
      },
      VALIDATION_ERROR: {
        recommended: false,
        reason: 'Validation error will not resolve with retry',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      AUTH_ERROR: {
        recommended: false,
        reason: 'Authentication error requires manual intervention',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      PERMISSION_ERROR: {
        recommended: false,
        reason: 'Permission error cannot be resolved with retry',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      FORMAT_ERROR: {
        recommended: false,
        reason: 'Format error requires document modification',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      RESOURCE_NOT_FOUND: {
        recommended: false,
        reason: 'Resource not found error will not resolve with retry',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      CONFLICT_ERROR: {
        recommended: false,
        reason: 'Conflict error requires user intervention',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      ADAPTER_ERROR: {
        recommended: false,
        reason: 'Adapter error requires investigation',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
      UNKNOWN_ERROR: {
        recommended: false,
        reason: 'Unknown error type',
        maxAttempts: 1,
        initialDelayMs: 0,
      },
    }

    return recommendations[filingError.code] || recommendations.UNKNOWN_ERROR
  }
}

// ============================================================================
// Exports
// ============================================================================

export const errorParser = new ErrorParser()
export const errorFormatter = new ErrorFormatter()
export const errorLogger = new ErrorLogger()
export const retryDeterminer = new RetryDeterminer()

export default {
  FilingError,
  ErrorParser,
  ErrorFormatter,
  ErrorLogger,
  RetryDeterminer,
}
