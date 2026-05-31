import { sql } from '@/lib/db'

const VALID_EXCHANGES = ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE', 'Other']

/**
 * Interface for lead capture data
 */
export interface LeadCaptureData {
  entryPointName: string
  email: string
  companyName: string
  listingExchangeTarget: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Sanitize user input to prevent XSS and other injection attacks
 * ORM should handle SQL injection, but we defend in depth
 */
export function sanitizeInput(text: string | null | undefined): string {
  if (!text) return ''

  // Remove any HTML/script tags
  let sanitized = text.replace(/<[^>]*>/g, '')

  // Limit length
  sanitized = sanitized.substring(0, 1000)

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Validate email format using a practical regex
 * This catches 99% of invalid emails without being overly strict
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate lead capture data
 * All fields are mandatory
 */
export async function validateLeadCapture(data: LeadCaptureData): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Check all required fields are present
  if (!data.entryPointName || !data.entryPointName.trim()) {
    errors.push('Entry point name is required')
  }

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required')
  }

  if (!data.companyName || !data.companyName.trim()) {
    errors.push('Company name is required')
  }

  if (!data.listingExchangeTarget || !data.listingExchangeTarget.trim()) {
    errors.push('Listing exchange target is required')
  }

  // Validate email format
  if (data.email && !isValidEmail(data.email.toLowerCase())) {
    errors.push('Email format is invalid')
  }

  // Validate exchange is in allowed list
  if (data.listingExchangeTarget && !VALID_EXCHANGES.includes(data.listingExchangeTarget)) {
    errors.push(
      `Listing exchange must be one of: ${VALID_EXCHANGES.join(', ')}. Got: ${data.listingExchangeTarget}`
    )
  }

  // Validate company name is not too short (likely junk data)
  if (data.companyName && data.companyName.trim().length < 2) {
    errors.push('Company name must be at least 2 characters')
  }

  // Check for duplicate email
  if (data.email && isValidEmail(data.email)) {
    const isDuplicate = await checkEmailDuplicate(data.email.toLowerCase())
    if (isDuplicate) {
      warnings.push('This email already exists in our system')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check if an email already exists in the lead_captures table
 */
export async function checkEmailDuplicate(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()

  const rows = await sql`
    SELECT id FROM lead_captures
    WHERE LOWER(TRIM(email)) = ${normalizedEmail}
    LIMIT 1
  ` as Array<{ id: string }>

  return rows.length > 0
}

/**
 * Get recent lead capture activity for a given email
 * Useful for fraud detection or identifying power users
 */
export async function getLeadCaptureHistory(email: string) {
  const normalizedEmail = email.toLowerCase().trim()

  const rows = await sql`
    SELECT 
      id,
      entry_point_name,
      email,
      company_name,
      listing_exchange_target,
      converted_to_trial,
      created_at
    FROM lead_captures
    WHERE LOWER(TRIM(email)) = ${normalizedEmail}
    ORDER BY created_at DESC
    LIMIT 10
  ` as Array<{
    id: string
    entry_point_name: string
    email: string
    company_name: string
    listing_exchange_target: string
    converted_to_trial: boolean
    created_at: string
  }>

  return rows
}

/**
 * Get lead statistics for analytics
 */
export async function getLeadStatistics() {
  const stats = await sql`
    SELECT 
      COUNT(*) as total_leads,
      COUNT(CASE WHEN converted_to_trial = true THEN 1 END) as converted_trials,
      COUNT(DISTINCT email) as unique_emails,
      COUNT(DISTINCT company_name) as unique_companies,
      COUNT(DISTINCT listing_exchange_target) as unique_exchanges
    FROM lead_captures
  ` as Array<{
    total_leads: number
    converted_trials: number
    unique_emails: number
    unique_companies: number
    unique_exchanges: number
  }>

  return stats[0] || {
    total_leads: 0,
    converted_trials: 0,
    unique_emails: 0,
    unique_companies: 0,
    unique_exchanges: 0,
  }
}

/**
 * Get conversion rate by entry point
 */
export async function getConversionRateByEntryPoint() {
  const rows = await sql`
    SELECT 
      entry_point_name,
      COUNT(*) as total,
      COUNT(CASE WHEN converted_to_trial = true THEN 1 END) as converted,
      ROUND(100.0 * COUNT(CASE WHEN converted_to_trial = true THEN 1 END) / COUNT(*), 2) as conversion_rate
    FROM lead_captures
    GROUP BY entry_point_name
    ORDER BY conversion_rate DESC
  ` as Array<{
    entry_point_name: string
    total: number
    converted: number
    conversion_rate: number
  }>

  return rows
}

/**
 * Mark a lead as converted to trial
 */
export async function markLeadAsConverted(
  leadId: string,
  trialCompanyId: string
): Promise<boolean> {
  const result = await sql`
    UPDATE lead_captures
    SET converted_to_trial = true, trial_company_id = ${trialCompanyId}, updated_at = NOW()
    WHERE id = ${leadId}
    RETURNING id
  `

  return result.length > 0
}
