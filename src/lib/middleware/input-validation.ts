/**
 * Input Validation Middleware
 * Comprehensive validation for API route inputs
 *
 * Features:
 * - Sanitization of string inputs (HTML/SQL injection prevention)
 * - Email format validation
 * - Numeric range validation
 * - String length limits
 * - UUID validation
 * - URL validation
 * - Composable validators
 * - Suspicious input logging
 *
 * Required for OWASP compliance and API security
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ValidationResult {
  valid: boolean
  value?: any
  errors: string[]
}

export interface ValidatorConfig {
  logSuspicious?: boolean
  sanitize?: boolean
  throwOnError?: boolean
}

export interface SuspiciousInputLog {
  timestamp: string
  ip?: string
  endpoint?: string
  pattern: string
  input: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// In-memory store for suspicious inputs (use database in production)
const suspiciousInputLogs: SuspiciousInputLog[] = []

// ============================================================================
// SANITIZATION & ESCAPING
// ============================================================================

/**
 * HTML entities map for sanitization
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
}

/**
 * SQL keywords that may indicate injection attempts
 */
const SQL_KEYWORDS = [
  'UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'EXEC',
  'EXECUTE', 'DECLARE', 'CAST', 'CONVERT', 'OR', 'AND', 'WHERE', 'FROM',
  'TABLE', 'DATABASE', 'INTO', 'VALUES', 'SET', 'TRUNCATE', 'MERGE', 'ROLLBACK',
  'COMMIT', '--', '/*', '*/', 'INFORMATION_SCHEMA',
]

/**
 * Escape HTML special characters
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Remove HTML tags from input
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Detect potential SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  const upperInput = input.toUpperCase()
  return SQL_KEYWORDS.some((keyword) => upperInput.includes(keyword))
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, options: ValidatorConfig = {}): string {
  let sanitized = input.trim()

  // Remove HTML tags
  sanitized = stripHtmlTags(sanitized)

  // Escape remaining HTML entities
  if (options.sanitize !== false) {
    sanitized = escapeHtml(sanitized)
  }

  return sanitized
}

/**
 * Log suspicious input for security monitoring
 */
export function logSuspiciousInput(
  pattern: string,
  input: string,
  severity: SuspiciousInputLog['severity'],
  req?: NextRequest
): void {
  const log: SuspiciousInputLog = {
    timestamp: new Date().toISOString(),
    ip: req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || undefined,
    endpoint: req?.nextUrl.pathname,
    pattern,
    input: input.substring(0, 200), // Truncate for logging
    severity,
  }

  suspiciousInputLogs.push(log)

  // Keep only last 1000 logs in memory
  if (suspiciousInputLogs.length > 1000) {
    suspiciousInputLogs.shift()
  }

  // Log to console with appropriate level
  const level =
    severity === 'critical'
      ? 'error'
      : severity === 'high'
        ? 'warn'
        : severity === 'medium'
          ? 'info'
          : 'debug'

  const consoleMethod = console[level as keyof typeof console] as any
  consoleMethod(
    `[InputValidation] ${severity.toUpperCase()} - ${pattern}`,
    { timestamp: log.timestamp, ip: log.ip, endpoint: log.endpoint }
  )
}

// ============================================================================
// VALIDATORS - BASIC TYPES
// ============================================================================

/**
 * Email validation (RFC 5322 simplified)
 */
export function validateEmail(email: string, req?: NextRequest): ValidationResult {
  const errors: string[] = []

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string')
    return { valid: false, errors }
  }

  const sanitized = email.trim().toLowerCase()

  // Basic RFC 5322 check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    errors.push('Invalid email format')
  }

  // Check length
  if (sanitized.length > 255) {
    errors.push('Email must be 255 characters or less')
  }

  // Detect common injection patterns
  if (detectSqlInjection(sanitized)) {
    logSuspiciousInput('SQL_INJECTION', sanitized, 'high', req)
    errors.push('Invalid characters in email')
  }

  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.includes('@@')) {
    logSuspiciousInput('SUSPICIOUS_EMAIL_PATTERN', sanitized, 'medium', req)
    errors.push('Email contains suspicious patterns')
  }

  return {
    valid: errors.length === 0,
    value: sanitized,
    errors,
  }
}

/**
 * Company ID validation (UUID format)
 */
export function validateCompanyId(
  id: string,
  req?: NextRequest,
  allowNull = false
): ValidationResult {
  const errors: string[] = []

  if (!id && allowNull) {
    return { valid: true, value: null, errors: [] }
  }

  if (!id || typeof id !== 'string') {
    errors.push('Company ID is required and must be a string')
    return { valid: false, errors }
  }

  const trimmed = id.trim()

  // UUID v4 pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(trimmed)) {
    logSuspiciousInput('INVALID_COMPANY_ID', trimmed, 'medium', req)
    errors.push('Company ID must be a valid UUID')
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors,
  }
}

/**
 * User ID validation (UUID format)
 */
export function validateUserId(
  id: string,
  req?: NextRequest,
  allowNull = false
): ValidationResult {
  return validateCompanyId(id, req, allowNull)
}

/**
 * String validation with length limits
 */
export function validateString(
  value: string,
  options: {
    fieldName: string
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    sanitize?: boolean
    req?: NextRequest
  }
): ValidationResult {
  const errors: string[] = []
  const minLength = options.minLength ?? 1
  const maxLength = options.maxLength ?? 500

  if (!value || typeof value !== 'string') {
    errors.push(`${options.fieldName} is required and must be a string`)
    return { valid: false, errors }
  }

  const trimmed = value.trim()

  // Check length
  if (trimmed.length < minLength) {
    errors.push(`${options.fieldName} must be at least ${minLength} characters`)
  }

  if (trimmed.length > maxLength) {
    errors.push(`${options.fieldName} must be ${maxLength} characters or less`)
  }

  // Check pattern if provided
  if (options.pattern && !options.pattern.test(trimmed)) {
    errors.push(`${options.fieldName} format is invalid`)
  }

  // Detect SQL injection
  if (detectSqlInjection(trimmed)) {
    logSuspiciousInput('SQL_INJECTION', trimmed, 'high', options.req)
    errors.push(`${options.fieldName} contains invalid characters`)
  }

  // Detect HTML/script injection
  if (/<script|javascript:|on\w+\s*=/i.test(trimmed)) {
    logSuspiciousInput('XSS_INJECTION', trimmed, 'critical', options.req)
    errors.push(`${options.fieldName} contains invalid content`)
  }

  let sanitized = trimmed
  if (options.sanitize !== false) {
    sanitized = sanitizeString(trimmed, { sanitize: true })
  }

  return {
    valid: errors.length === 0,
    value: sanitized,
    errors,
  }
}

/**
 * Numeric validation with range checks
 */
export function validateNumber(
  value: any,
  options: {
    fieldName: string
    min?: number
    max?: number
    integer?: boolean
    positive?: boolean
    req?: NextRequest
  }
): ValidationResult {
  const errors: string[] = []

  if (value === null || value === undefined) {
    errors.push(`${options.fieldName} is required`)
    return { valid: false, errors }
  }

  let num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    errors.push(`${options.fieldName} must be a valid number`)
    return { valid: false, errors }
  }

  // Check integer
  if (options.integer && !Number.isInteger(num)) {
    errors.push(`${options.fieldName} must be an integer`)
  }

  // Check positive
  if (options.positive && num < 0) {
    errors.push(`${options.fieldName} must be positive`)
  }

  // Check min
  if (options.min !== undefined && num < options.min) {
    errors.push(`${options.fieldName} must be at least ${options.min}`)
  }

  // Check max
  if (options.max !== undefined && num > options.max) {
    errors.push(`${options.fieldName} must be at most ${options.max}`)
  }

  // Detect suspicious patterns (excessively large numbers could indicate overflow)
  if (Math.abs(num) > 1e15) {
    logSuspiciousInput('LARGE_NUMBER', value.toString(), 'low', options.req)
    errors.push(`${options.fieldName} is out of acceptable range`)
  }

  return {
    valid: errors.length === 0,
    value: num,
    errors,
  }
}

/**
 * Boolean validation
 */
export function validateBoolean(
  value: any,
  options: {
    fieldName: string
    req?: NextRequest
  }
): ValidationResult {
  const errors: string[] = []

  if (value === null || value === undefined) {
    errors.push(`${options.fieldName} is required`)
    return { valid: false, errors }
  }

  let bool: boolean

  if (typeof value === 'boolean') {
    bool = value
  } else if (typeof value === 'string') {
    const lower = value.toLowerCase()
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      bool = true
    } else if (lower === 'false' || lower === '0' || lower === 'no') {
      bool = false
    } else {
      errors.push(`${options.fieldName} must be a boolean value`)
      return { valid: false, errors }
    }
  } else {
    errors.push(`${options.fieldName} must be a boolean value`)
    return { valid: false, errors }
  }

  return {
    valid: true,
    value: bool,
    errors: [],
  }
}

/**
 * Enum validation
 */
export function validateEnum(
  value: string,
  options: {
    fieldName: string
    allowedValues: string[]
    caseSensitive?: boolean
    req?: NextRequest
  }
): ValidationResult {
  const errors: string[] = []

  if (!value || typeof value !== 'string') {
    errors.push(`${options.fieldName} is required and must be a string`)
    return { valid: false, errors }
  }

  const trimmed = value.trim()
  const testValue = options.caseSensitive ? trimmed : trimmed.toLowerCase()
  const compareValues = options.caseSensitive
    ? options.allowedValues
    : options.allowedValues.map((v) => v.toLowerCase())

  if (!compareValues.includes(testValue)) {
    errors.push(
      `${options.fieldName} must be one of: ${options.allowedValues.join(', ')}`
    )
    logSuspiciousInput('INVALID_ENUM_VALUE', trimmed, 'low', options.req)
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors,
  }
}

// ============================================================================
// VALIDATORS - SPECIALIZED FORMATS
// ============================================================================

/**
 * URL validation
 */
export function validateUrl(url: string, req?: NextRequest): ValidationResult {
  const errors: string[] = []

  if (!url || typeof url !== 'string') {
    errors.push('URL is required and must be a string')
    return { valid: false, errors }
  }

  const trimmed = url.trim()

  try {
    const parsed = new URL(trimmed)

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      errors.push('URL must use http:// or https://')
    }

    // Check for suspicious patterns
    if (detectSqlInjection(trimmed)) {
      logSuspiciousInput('SQL_INJECTION_URL', trimmed, 'high', req)
      errors.push('URL contains suspicious patterns')
    }
  } catch (err) {
    errors.push('Invalid URL format')
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors,
  }
}

/**
 * Phone number validation (basic)
 */
export function validatePhoneNumber(phone: string, req?: NextRequest): ValidationResult {
  const errors: string[] = []

  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number is required and must be a string')
    return { valid: false, errors }
  }

  const sanitized = phone.replace(/\D/g, '')

  // Check length (10-15 digits for international format)
  if (sanitized.length < 10 || sanitized.length > 15) {
    errors.push('Phone number must be between 10 and 15 digits')
  }

  // Check for common injection patterns
  if (detectSqlInjection(phone)) {
    logSuspiciousInput('SQL_INJECTION_PHONE', phone, 'high', req)
    errors.push('Phone number contains invalid characters')
  }

  return {
    valid: errors.length === 0,
    value: sanitized,
    errors,
  }
}

/**
 * Date validation
 */
export function validateDate(
  value: string | Date,
  options: {
    fieldName: string
    minDate?: Date
    maxDate?: Date
    req?: NextRequest
  } = { fieldName: 'Date' }
): ValidationResult {
  const errors: string[] = []

  if (!value) {
    errors.push(`${options.fieldName} is required`)
    return { valid: false, errors }
  }

  let date: Date

  if (typeof value === 'string') {
    date = new Date(value)
  } else {
    date = value
  }

  if (isNaN(date.getTime())) {
    errors.push(`${options.fieldName} must be a valid date`)
    return { valid: false, errors }
  }

  // Check min date
  if (options.minDate && date < options.minDate) {
    errors.push(`${options.fieldName} must be on or after ${options.minDate.toISOString()}`)
  }

  // Check max date
  if (options.maxDate && date > options.maxDate) {
    errors.push(`${options.fieldName} must be on or before ${options.maxDate.toISOString()}`)
  }

  return {
    valid: errors.length === 0,
    value: date,
    errors,
  }
}

/**
 * Array validation
 */
export function validateArray(
  value: any,
  options: {
    fieldName: string
    minLength?: number
    maxLength?: number
    itemValidator?: (item: any) => ValidationResult
    req?: NextRequest
  }
): ValidationResult {
  const errors: string[] = []

  if (!Array.isArray(value)) {
    errors.push(`${options.fieldName} must be an array`)
    return { valid: false, errors }
  }

  const minLength = options.minLength ?? 0
  const maxLength = options.maxLength ?? 1000

  if (value.length < minLength) {
    errors.push(
      `${options.fieldName} must have at least ${minLength} items`
    )
  }

  if (value.length > maxLength) {
    errors.push(
      `${options.fieldName} must have at most ${maxLength} items`
    )
  }

  // Validate items if validator provided
  const validatedItems: any[] = []
  if (options.itemValidator) {
    for (const item of value) {
      const result = options.itemValidator(item)
      if (!result.valid) {
        errors.push(...result.errors)
      } else {
        validatedItems.push(result.value)
      }
    }
  } else {
    validatedItems.push(...value)
  }

  return {
    valid: errors.length === 0,
    value: validatedItems,
    errors,
  }
}

// ============================================================================
// VALIDATORS - SEARCH & QUERY
// ============================================================================

/**
 * Search query validation
 * Prevents SQL injection, XSS, and overly complex queries
 */
export function validateSearchQuery(
  query: string,
  req?: NextRequest
): ValidationResult {
  const errors: string[] = []

  if (!query || typeof query !== 'string') {
    errors.push('Search query is required and must be a string')
    return { valid: false, errors }
  }

  const trimmed = query.trim()

  // Check length
  if (trimmed.length > 200) {
    errors.push('Search query must be 200 characters or less')
  }

  if (trimmed.length < 1) {
    errors.push('Search query must be at least 1 character')
  }

  // Detect SQL injection
  if (detectSqlInjection(trimmed)) {
    logSuspiciousInput('SQL_INJECTION_SEARCH', trimmed, 'high', req)
    errors.push('Search query contains invalid characters')
  }

  // Detect XSS attempts
  if (/<script|javascript:|on\w+\s*=/i.test(trimmed)) {
    logSuspiciousInput('XSS_INJECTION_SEARCH', trimmed, 'critical', req)
    errors.push('Search query contains invalid content')
  }

  // Detect wildcard bombs (excessive wildcards could cause DoS)
  if ((trimmed.match(/\*/g) || []).length > 5) {
    logSuspiciousInput('WILDCARD_BOMB', trimmed, 'medium', req)
    errors.push('Search query contains too many wildcards')
  }

  const sanitized = sanitizeString(trimmed, { sanitize: true })

  return {
    valid: errors.length === 0,
    value: sanitized,
    errors,
  }
}

/**
 * Pagination parameters validation
 */
export function validatePagination(
  page: any,
  limit: any,
  req?: NextRequest
): ValidationResult {
  const errors: string[] = []
  let pageNum = 1
  let limitNum = 10

  // Validate page
  const pageResult = validateNumber({
    fieldName: 'page',
    min: 1,
    max: 1000000,
    integer: true,
    req,
  }, page)

  if (!pageResult.valid) {
    errors.push(...pageResult.errors)
  } else {
    pageNum = pageResult.value
  }

  // Validate limit
  const limitResult = validateNumber({
    fieldName: 'limit',
    min: 1,
    max: 100, // Prevent requesting too many items
    integer: true,
    req,
  }, limit)

  if (!limitResult.valid) {
    errors.push(...limitResult.errors)
  } else {
    limitNum = limitResult.value
  }

  return {
    valid: errors.length === 0,
    value: { page: pageNum, limit: limitNum },
    errors,
  }
}

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

/**
 * Input validation middleware for API routes
 *
 * Usage:
 * const { valid, data, errors } = await validateInput(req, {
 *   email: (v) => validateEmail(v),
 *   name: (v) => validateString(v, { fieldName: 'Name', minLength: 2, maxLength: 100 }),
 * })
 */
export async function validateInput(
  req: NextRequest,
  validators: Record<string, (value: any, req?: NextRequest) => ValidationResult>,
  options: ValidatorConfig = {}
): Promise<{
  valid: boolean
  data: Record<string, any>
  errors: Record<string, string[]>
}> {
  const body = await req.json()
  const data: Record<string, any> = {}
  const errors: Record<string, string[]> = {}

  for (const [key, validator] of Object.entries(validators)) {
    const value = body[key]
    const result = validator(value, req)

    if (!result.valid) {
      errors[key] = result.errors
      if (options.throwOnError) {
        throw new Error(`Validation failed for ${key}: ${result.errors.join(', ')}`)
      }
    } else {
      data[key] = result.value
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    data,
    errors,
  }
}

/**
 * Create a validation error response for API routes
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation failed',
      errors,
    },
    { status: 400 }
  )
}

// ============================================================================
// MONITORING & ADMIN FUNCTIONS
// ============================================================================

/**
 * Get suspicious input logs (admin only)
 */
export function getSuspiciousInputLogs(
  filter?: {
    severity?: SuspiciousInputLog['severity']
    pattern?: string
    since?: Date
  }
): SuspiciousInputLog[] {
  let logs = [...suspiciousInputLogs]

  if (filter?.severity) {
    logs = logs.filter((log) => log.severity === filter.severity)
  }

  if (filter?.pattern) {
    logs = logs.filter((log) => log.pattern === filter.pattern)
  }

  if (filter?.since) {
    const sinceDate = filter.since
    logs = logs.filter((log) => new Date(log.timestamp) >= sinceDate)
  }

  return logs
}

/**
 * Clear suspicious input logs
 */
export function clearSuspiciousInputLogs(): void {
  suspiciousInputLogs.length = 0
}

/**
 * Get input validation statistics
 */
export function getValidationStats() {
  const stats = {
    totalLogs: suspiciousInputLogs.length,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    byPattern: {} as Record<string, number>,
  }

  for (const log of suspiciousInputLogs) {
    stats.bySeverity[log.severity]++
    stats.byPattern[log.pattern] = (stats.byPattern[log.pattern] || 0) + 1
  }

  return stats
}
