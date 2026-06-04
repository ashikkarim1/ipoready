import { sql } from '@/lib/db'

/**
 * Marketplace utility functions for professionals and hiring
 */

export interface CompensationPackage {
  cash: number
  bonus?: number
  equity?: {
    shares: number
    vesting_years: number
  }
}

/**
 * Calculate total compensation value
 */
export function calculateTotalCompensation(comp: CompensationPackage): number {
  return (comp.cash || 0) + (comp.bonus || 0)
}

/**
 * Calculate 2% finders fee
 */
export function calculateFindersFee(totalComp: number): number {
  return Math.round(totalComp * 0.02 * 100) / 100
}

/**
 * Calculate 10% referral commission from finders fee
 */
export function calculateReferralCommission(findersFee: number): number {
  return Math.round(findersFee * 0.10 * 100) / 100
}

/**
 * Verify professional exists and is verified
 */
export async function isProfessionalVerified(professionalId: string): Promise<boolean> {
  const rows = await sql`
    SELECT verification_status FROM professionals WHERE id = ${professionalId}
  ` as { verification_status: string }[]

  return rows.length > 0 && rows[0].verification_status === 'verified'
}

/**
 * Get professional by email
 */
export async function getProfessionalByEmail(email: string) {
  const rows = await sql`
    SELECT id, name, email, professional_title, verification_status
    FROM professionals
    WHERE email = ${email}
    LIMIT 1
  ` as {
    id: string
    name: string
    email: string
    professional_title: string
    verification_status: string
  }[]

  return rows.length > 0 ? rows[0] : null
}

/**
 * Verify compensation packages match
 */
export function compensationPackagesMatch(
  comp1: CompensationPackage,
  comp2: CompensationPackage
): boolean {
  return (
    comp1.cash === comp2.cash &&
    (comp1.bonus || 0) === (comp2.bonus || 0) &&
    JSON.stringify(comp1.equity) === JSON.stringify(comp2.equity)
  )
}

/**
 * Validate professional introduction can be created
 */
export async function validateIntroductionRequest(
  professionalId: string,
  companyId: string
): Promise<{ valid: boolean; error?: string }> {
  // Check professional exists
  const profRows = await sql`
    SELECT verification_status FROM professionals WHERE id = ${professionalId}
  ` as { verification_status: string }[]

  if (profRows.length === 0) {
    return { valid: false, error: 'Professional not found' }
  }

  // Check company exists
  const companyRows = await sql`
    SELECT id FROM companies WHERE id = ${companyId}
  ` as { id: string }[]

  if (companyRows.length === 0) {
    return { valid: false, error: 'Company not found' }
  }

  // Check no active introduction exists
  const existingRows = await sql`
    SELECT id FROM professional_introductions
    WHERE professional_id = ${professionalId}
      AND company_id = ${companyId}
      AND status IN ('pending', 'accepted')
    LIMIT 1
  ` as { id: string }[]

  if (existingRows.length > 0) {
    return { valid: false, error: 'Active introduction already exists' }
  }

  return { valid: true }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = currency === 'CAD' ? 'C$' : '$'
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Generate invoice reference for finders fee
 */
export function generateInvoiceReference(
  professionalName: string,
  hireDate: string
): string {
  const dateStr = hireDate.replace(/-/g, '')
  const nameStr = professionalName.substring(0, 3).toUpperCase()
  return `FINDER-${dateStr}-${nameStr}`
}

/**
 * Get professional match score
 */
export function calculateMatchScore(
  professional: {
    years_public_experience: number
    industries?: string[]
    certifications?: string[]
    past_board_positions?: any[]
    linkedin_verified: boolean
  },
  criteria: {
    role?: string
    industry?: string
    region?: string
    experience?: number
  }
): number {
  let score = 0

  // Experience score (0-30)
  if (professional.years_public_experience) {
    score += Math.min(30, professional.years_public_experience * 2.5)
  }

  // Industry match (0-25)
  if (criteria.industry && professional.industries) {
    const match = professional.industries.some(
      (ind) =>
        ind.toLowerCase().includes(criteria.industry!.toLowerCase()) ||
        criteria.industry!.toLowerCase().includes(ind.toLowerCase())
    )
    if (match) score += 25
  }

  // Role/certification match (0-20)
  if (criteria.role) {
    const certMatch = professional.certifications?.some((cert) =>
      cert.toLowerCase().includes(criteria.role!.toLowerCase())
    )
    const boardMatch = professional.past_board_positions?.some((pos: any) =>
      pos.title?.toLowerCase().includes(criteria.role!.toLowerCase())
    )
    if (certMatch || boardMatch) score += 20
  }

  // LinkedIn verification (0-15)
  if (professional.linkedin_verified) {
    score += 15
  }

  // Board experience (0-10)
  if (professional.past_board_positions) {
    score += Math.min(10, professional.past_board_positions.length * 5)
  }

  return Math.min(100, score)
}
