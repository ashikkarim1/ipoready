/**
 * Input Validation Middleware Tests
 *
 * Comprehensive tests for all validation functions
 * Run with: npm test -- input-validation.test.ts
 */

import {
  validateEmail,
  validateCompanyId,
  validateString,
  validateNumber,
  validateBoolean,
  validateEnum,
  validateUrl,
  validatePhoneNumber,
  validateDate,
  validateArray,
  validateSearchQuery,
  validatePagination,
  escapeHtml,
  stripHtmlTags,
  sanitizeString,
  detectSqlInjection,
  getSuspiciousInputLogs,
  clearSuspiciousInputLogs,
  getValidationStats,
} from '../input-validation'

describe('Input Validation Middleware', () => {
  beforeEach(() => {
    clearSuspiciousInputLogs()
  })

  // ========================================================================
  // SANITIZATION TESTS
  // ========================================================================

  describe('HTML Sanitization', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>'
      const result = escapeHtml(input)
      expect(result).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      )
    })

    it('should remove HTML tags', () => {
      const input = '<p>Hello <b>world</b></p>'
      const result = stripHtmlTags(input)
      expect(result).toBe('Hello world')
    })

    it('should sanitize combined threats', () => {
      const input = '<img src=x onerror="alert()">Hello'
      const result = sanitizeString(input)
      expect(result).not.toContain('<img')
      expect(result).not.toContain('onerror')
    })

    it('should preserve safe text', () => {
      const input = 'Hello World 123'
      const result = sanitizeString(input)
      expect(result).toBe('Hello World 123')
    })
  })

  describe('SQL Injection Detection', () => {
    it('should detect UNION SELECT injection', () => {
      const result = detectSqlInjection("'; UNION SELECT * FROM users--")
      expect(result).toBe(true)
    })

    it('should detect OR injection', () => {
      const result = detectSqlInjection("' OR '1'='1")
      expect(result).toBe(true)
    })

    it('should detect DROP TABLE', () => {
      const result = detectSqlInjection("'; DROP TABLE users;--")
      expect(result).toBe(true)
    })

    it('should not flag normal text', () => {
      const result = detectSqlInjection('John Doe works at Company')
      expect(result).toBe(false)
    })

    it('should detect INSERT injection', () => {
      const result = detectSqlInjection('test", ); INSERT INTO users')
      expect(result).toBe(true)
    })

    it('should detect comments', () => {
      const result = detectSqlInjection('test -- comment')
      expect(result).toBe(true)
    })
  })

  // ========================================================================
  // EMAIL VALIDATION TESTS
  // ========================================================================

  describe('Email Validation', () => {
    it('should validate correct email', () => {
      const result = validateEmail('user@example.com')
      expect(result.valid).toBe(true)
      expect(result.value).toBe('user@example.com')
    })

    it('should lowercase email', () => {
      const result = validateEmail('User@EXAMPLE.COM')
      expect(result.value).toBe('user@example.com')
    })

    it('should reject invalid format', () => {
      const result = validateEmail('invalid@')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid email format')
    })

    it('should reject missing domain', () => {
      const result = validateEmail('user@')
      expect(result.valid).toBe(false)
    })

    it('should reject missing @', () => {
      const result = validateEmail('userexample.com')
      expect(result.valid).toBe(false)
    })

    it('should reject if required', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Email is required and must be a string')
    })

    it('should reject SQL injection in email', () => {
      const result = validateEmail("user@test.com'; DROP TABLE--")
      expect(result.valid).toBe(false)
    })

    it('should reject overly long email', () => {
      const result = validateEmail('a'.repeat(250) + '@example.com')
      expect(result.valid).toBe(false)
    })

    it('should reject suspicious patterns', () => {
      const result = validateEmail('user..name@example.com')
      expect(result.valid).toBe(false)
    })

    it('should trim whitespace', () => {
      const result = validateEmail('  user@example.com  ')
      expect(result.value).toBe('user@example.com')
    })
  })

  // ========================================================================
  // COMPANY ID VALIDATION TESTS
  // ========================================================================

  describe('Company ID Validation', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000'
    const invalidUuid = 'not-a-uuid'

    it('should validate correct UUID', () => {
      const result = validateCompanyId(validUuid)
      expect(result.valid).toBe(true)
      expect(result.value).toBe(validUuid)
    })

    it('should reject invalid UUID', () => {
      const result = validateCompanyId(invalidUuid)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Company ID must be a valid UUID')
    })

    it('should reject if required', () => {
      const result = validateCompanyId('')
      expect(result.valid).toBe(false)
    })

    it('should allow null if specified', () => {
      const result = validateCompanyId('', undefined, true)
      expect(result.valid).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should trim whitespace', () => {
      const result = validateCompanyId(`  ${validUuid}  `)
      expect(result.value).toBe(validUuid)
    })

    it('should uppercase UUID variants', () => {
      const upperUuid = validUuid.toUpperCase()
      const result = validateCompanyId(upperUuid)
      expect(result.valid).toBe(true)
    })
  })

  // ========================================================================
  // STRING VALIDATION TESTS
  // ========================================================================

  describe('String Validation', () => {
    it('should validate normal string', () => {
      const result = validateString('John Doe', {
        fieldName: 'Name',
        minLength: 2,
        maxLength: 100,
      })
      expect(result.valid).toBe(true)
      expect(result.value).toBe('John Doe')
    })

    it('should reject too short', () => {
      const result = validateString('J', {
        fieldName: 'Name',
        minLength: 2,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name must be at least 2 characters')
    })

    it('should reject too long', () => {
      const result = validateString('a'.repeat(101), {
        fieldName: 'Name',
        maxLength: 100,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name must be 100 characters or less')
    })

    it('should validate with regex pattern', () => {
      const result = validateString('ABC-123', {
        fieldName: 'Code',
        pattern: /^[A-Z]{3}-\d{3}$/,
      })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid pattern', () => {
      const result = validateString('invalid', {
        fieldName: 'Code',
        pattern: /^[A-Z]{3}-\d{3}$/,
      })
      expect(result.valid).toBe(false)
    })

    it('should detect SQL injection', () => {
      const result = validateString("'; DROP TABLE users--", {
        fieldName: 'Name',
      })
      expect(result.valid).toBe(false)
    })

    it('should detect XSS injection', () => {
      const result = validateString('<script>alert()</script>', {
        fieldName: 'Name',
      })
      expect(result.valid).toBe(false)
    })

    it('should sanitize by default', () => {
      const result = validateString('<b>Bold Text</b>', {
        fieldName: 'Text',
        sanitize: true,
      })
      expect(result.valid).toBe(true)
      expect(result.value).not.toContain('<b>')
    })

    it('should trim whitespace', () => {
      const result = validateString('  Text  ', {
        fieldName: 'Text',
      })
      expect(result.value).toBe('Text')
    })
  })

  // ========================================================================
  // NUMERIC VALIDATION TESTS
  // ========================================================================

  describe('Number Validation', () => {
    it('should validate normal number', () => {
      const result = validateNumber(42, {
        fieldName: 'Count',
      })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(42)
    })

    it('should parse string number', () => {
      const result = validateNumber('42', {
        fieldName: 'Count',
      })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(42)
    })

    it('should reject non-numeric', () => {
      const result = validateNumber('abc', {
        fieldName: 'Count',
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce integer constraint', () => {
      const result = validateNumber(42.5, {
        fieldName: 'Count',
        integer: true,
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce positive constraint', () => {
      const result = validateNumber(-10, {
        fieldName: 'Count',
        positive: true,
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce minimum', () => {
      const result = validateNumber(5, {
        fieldName: 'Count',
        min: 10,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Count must be at least 10')
    })

    it('should enforce maximum', () => {
      const result = validateNumber(100, {
        fieldName: 'Count',
        max: 50,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Count must be at most 50')
    })

    it('should detect excessively large numbers', () => {
      const result = validateNumber(1e20, {
        fieldName: 'Value',
      })
      expect(result.valid).toBe(false)
    })
  })

  // ========================================================================
  // BOOLEAN VALIDATION TESTS
  // ========================================================================

  describe('Boolean Validation', () => {
    it('should validate true', () => {
      const result = validateBoolean(true, { fieldName: 'Active' })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(true)
    })

    it('should validate false', () => {
      const result = validateBoolean(false, { fieldName: 'Active' })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(false)
    })

    it('should parse "true" string', () => {
      const result = validateBoolean('true', { fieldName: 'Active' })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(true)
    })

    it('should parse "false" string', () => {
      const result = validateBoolean('false', { fieldName: 'Active' })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(false)
    })

    it('should parse "1" as true', () => {
      const result = validateBoolean('1', { fieldName: 'Active' })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(true)
    })

    it('should parse "0" as false', () => {
      const result = validateBoolean('0', { fieldName: 'Active' })
      expect(result.valid).toBe(true)
      expect(result.value).toBe(false)
    })

    it('should reject invalid string', () => {
      const result = validateBoolean('maybe', { fieldName: 'Active' })
      expect(result.valid).toBe(false)
    })
  })

  // ========================================================================
  // ENUM VALIDATION TESTS
  // ========================================================================

  describe('Enum Validation', () => {
    const exchanges = ['TSX', 'NASDAQ', 'NYSE']

    it('should validate valid enum', () => {
      const result = validateEnum('TSX', {
        fieldName: 'Exchange',
        allowedValues: exchanges,
      })
      expect(result.valid).toBe(true)
      expect(result.value).toBe('TSX')
    })

    it('should reject invalid enum', () => {
      const result = validateEnum('INVALID', {
        fieldName: 'Exchange',
        allowedValues: exchanges,
      })
      expect(result.valid).toBe(false)
    })

    it('should handle case insensitive', () => {
      const result = validateEnum('tsx', {
        fieldName: 'Exchange',
        allowedValues: exchanges,
        caseSensitive: false,
      })
      expect(result.valid).toBe(true)
    })

    it('should respect case sensitive flag', () => {
      const result = validateEnum('tsx', {
        fieldName: 'Exchange',
        allowedValues: exchanges,
        caseSensitive: true,
      })
      expect(result.valid).toBe(false)
    })

    it('should trim input', () => {
      const result = validateEnum('  TSX  ', {
        fieldName: 'Exchange',
        allowedValues: exchanges,
      })
      expect(result.valid).toBe(true)
    })
  })

  // ========================================================================
  // SPECIALIZED FORMAT TESTS
  // ========================================================================

  describe('URL Validation', () => {
    it('should validate HTTPS URL', () => {
      const result = validateUrl('https://example.com')
      expect(result.valid).toBe(true)
    })

    it('should validate HTTP URL', () => {
      const result = validateUrl('http://example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject FTP URL', () => {
      const result = validateUrl('ftp://example.com')
      expect(result.valid).toBe(false)
    })

    it('should reject invalid URL', () => {
      const result = validateUrl('not a url')
      expect(result.valid).toBe(false)
    })

    it('should detect SQL injection in URL', () => {
      const result = validateUrl("https://example.com?id=1'; DROP TABLE--")
      expect(result.valid).toBe(false)
    })
  })

  describe('Phone Number Validation', () => {
    it('should validate phone number', () => {
      const result = validatePhoneNumber('+1-555-123-4567')
      expect(result.valid).toBe(true)
      expect(result.value).toBe('15551234567')
    })

    it('should reject too short', () => {
      const result = validatePhoneNumber('123')
      expect(result.valid).toBe(false)
    })

    it('should reject too long', () => {
      const result = validatePhoneNumber('1'.repeat(20))
      expect(result.valid).toBe(false)
    })

    it('should remove non-numeric characters', () => {
      const result = validatePhoneNumber('(555) 123-4567')
      expect(result.value).toBe('5551234567')
    })
  })

  describe('Date Validation', () => {
    it('should validate ISO date string', () => {
      const result = validateDate('2024-06-06', {
        fieldName: 'Date',
      })
      expect(result.valid).toBe(true)
    })

    it('should validate Date object', () => {
      const date = new Date('2024-06-06')
      const result = validateDate(date, {
        fieldName: 'Date',
      })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid date', () => {
      const result = validateDate('invalid', {
        fieldName: 'Date',
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce min date', () => {
      const result = validateDate('2024-01-01', {
        fieldName: 'Date',
        minDate: new Date('2024-06-01'),
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce max date', () => {
      const result = validateDate('2024-12-01', {
        fieldName: 'Date',
        maxDate: new Date('2024-06-01'),
      })
      expect(result.valid).toBe(false)
    })
  })

  // ========================================================================
  // ARRAY VALIDATION TESTS
  // ========================================================================

  describe('Array Validation', () => {
    it('should validate array', () => {
      const result = validateArray(['a', 'b', 'c'], {
        fieldName: 'Items',
      })
      expect(result.valid).toBe(true)
    })

    it('should reject non-array', () => {
      const result = validateArray('not-array', {
        fieldName: 'Items',
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce minimum length', () => {
      const result = validateArray([], {
        fieldName: 'Items',
        minLength: 1,
      })
      expect(result.valid).toBe(false)
    })

    it('should enforce maximum length', () => {
      const result = validateArray(new Array(101).fill('a'), {
        fieldName: 'Items',
        maxLength: 100,
      })
      expect(result.valid).toBe(false)
    })

    it('should validate array items', () => {
      const result = validateArray(['user@test.com', 'invalid'], {
        fieldName: 'Emails',
        itemValidator: (item) => validateEmail(item),
      })
      expect(result.valid).toBe(false)
    })
  })

  // ========================================================================
  // SEARCH QUERY VALIDATION TESTS
  // ========================================================================

  describe('Search Query Validation', () => {
    it('should validate normal query', () => {
      const result = validateSearchQuery('venture capital')
      expect(result.valid).toBe(true)
    })

    it('should reject SQL injection', () => {
      const result = validateSearchQuery("'; DROP TABLE--")
      expect(result.valid).toBe(false)
    })

    it('should reject XSS', () => {
      const result = validateSearchQuery('<script>alert()</script>')
      expect(result.valid).toBe(false)
    })

    it('should enforce max length', () => {
      const result = validateSearchQuery('a'.repeat(201))
      expect(result.valid).toBe(false)
    })

    it('should detect wildcard bombs', () => {
      const result = validateSearchQuery('****** query')
      expect(result.valid).toBe(false)
    })

    it('should allow moderate wildcards', () => {
      const result = validateSearchQuery('* query *')
      expect(result.valid).toBe(true)
    })
  })

  // ========================================================================
  // PAGINATION VALIDATION TESTS
  // ========================================================================

  describe('Pagination Validation', () => {
    it('should validate pagination', () => {
      const result = validatePagination('2', '25')
      expect(result.valid).toBe(true)
      expect(result.value.page).toBe(2)
      expect(result.value.limit).toBe(25)
    })

    it('should default values', () => {
      const result = validatePagination(null, null)
      expect(result.valid).toBe(true)
      expect(result.value.page).toBe(1)
      expect(result.value.limit).toBe(10)
    })

    it('should reject invalid page', () => {
      const result = validatePagination('0', '10')
      expect(result.valid).toBe(false)
    })

    it('should reject excessive limit', () => {
      const result = validatePagination('1', '200')
      expect(result.valid).toBe(false)
    })
  })

  // ========================================================================
  // MONITORING TESTS
  // ========================================================================

  describe('Suspicious Input Logging', () => {
    it('should log suspicious inputs', () => {
      validateString("'; DROP TABLE users--", {
        fieldName: 'Name',
      })

      const logs = getSuspiciousInputLogs()
      expect(logs.length).toBeGreaterThan(0)
    })

    it('should track by severity', () => {
      const stats = getValidationStats()
      expect(stats).toHaveProperty('bySeverity')
      expect(stats.bySeverity).toHaveProperty('critical')
    })

    it('should track by pattern', () => {
      const stats = getValidationStats()
      expect(stats).toHaveProperty('byPattern')
    })

    it('should filter by severity', () => {
      validateEmail("'; DROP TABLE--")
      const logs = getSuspiciousInputLogs({ severity: 'high' })
      expect(logs.every(log => log.severity === 'high')).toBe(true)
    })

    it('should clear logs', () => {
      validateEmail("'; DROP--")
      clearSuspiciousInputLogs()
      const logs = getSuspiciousInputLogs()
      expect(logs.length).toBe(0)
    })
  })
})
