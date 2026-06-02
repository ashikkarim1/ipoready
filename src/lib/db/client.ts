import { neon } from '@neondatabase/serverless'

/**
 * Database client for querying IPOReady data
 * Uses Neon PostgreSQL serverless driver
 */

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create and export the Neon SQL client
export const sql = neon(process.env.DATABASE_URL)

export default sql

/**
 * Query helper with error handling
 * WARNING: Neon requires template literals. For security-critical queries,
 * use sql`...` template literals directly in the code instead of this helper.
 * This helper is for backwards compatibility only.
 */
export async function query(queryString: string, values?: unknown[]) {
  try {
    // Split the query by parameter placeholders ($1, $2, etc.)
    const parts = queryString.split(/\$\d+/)
    const templateStrings = Object.assign([...parts], { raw: [...parts] }) as TemplateStringsArray
    const result = await sql(templateStrings, ...(values || []))
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Get company factors for PACE prediction
 */
export async function getCompanyFactors(companyId: string) {
  const result = await query(
    `
    SELECT 
      id,
      cash_runway_months,
      pre_ipo_funding_raised_usd,
      team_size,
      cfo_hired_at,
      board_size,
      auditor_selected,
      investor_sophistication_score
    FROM companies
    WHERE id = $1
    `,
    [companyId]
  )
  // Neon returns array directly
  return result[0] || null
}

/**
 * Update company factors
 */
export async function updateCompanyFactors(
  companyId: string,
  factors: {
    cash_runway_months?: number
    pre_ipo_funding_raised_usd?: number
    team_size?: number
    cfo_hired_at?: string
    board_size?: number
    auditor_selected?: boolean
    investor_sophistication_score?: number
  }
) {
  const updates: string[] = []
  const values: unknown[] = [companyId]
  let paramIndex = 2

  if (factors.cash_runway_months !== undefined) {
    updates.push(`cash_runway_months = $${paramIndex++}`)
    values.push(factors.cash_runway_months)
  }
  if (factors.pre_ipo_funding_raised_usd !== undefined) {
    updates.push(`pre_ipo_funding_raised_usd = $${paramIndex++}`)
    values.push(factors.pre_ipo_funding_raised_usd)
  }
  if (factors.team_size !== undefined) {
    updates.push(`team_size = $${paramIndex++}`)
    values.push(factors.team_size)
  }
  if (factors.cfo_hired_at !== undefined) {
    updates.push(`cfo_hired_at = $${paramIndex++}`)
    values.push(factors.cfo_hired_at)
  }
  if (factors.board_size !== undefined) {
    updates.push(`board_size = $${paramIndex++}`)
    values.push(factors.board_size)
  }
  if (factors.auditor_selected !== undefined) {
    updates.push(`auditor_selected = $${paramIndex++}`)
    values.push(factors.auditor_selected)
  }
  if (factors.investor_sophistication_score !== undefined) {
    updates.push(`investor_sophistication_score = $${paramIndex++}`)
    values.push(factors.investor_sophistication_score)
  }

  if (updates.length === 0) return null

  const result = await query(
    `
    UPDATE companies
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    values
  )
  // Neon returns array directly
  return result[0] || null
}
