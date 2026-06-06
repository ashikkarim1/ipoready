/**
 * Company Context Builder - Phase 1
 *
 * Takes company profile data and builds regulatory context
 * Enables context-aware rule application:
 * - "This TSX company with $500M market cap, 12% customer concentration, China ops needs THESE specific disclosures"
 * - NOT just "TSX requires disclosure X" but "TSX requires X, and YOUR company has additional requirements due to customer concentration"
 */

import { sql } from '@/lib/db'

export interface CompanyProfile {
  companyId: string
  sector: string                    // 'technology', 'healthcare', 'financial_services'
  sizeMetric: 'revenue' | 'market_cap'
  sizeValue: number                 // in USD
  headquartersCountry: string       // 'CA', 'US', 'GB', 'JP'
  operatingCountries: string[]      // ['CA', 'US', 'UK']
  topCustomersPercentRevenue: number // 18 = 18% concentration
  hasLitigation: boolean
  litigationExposureUsd?: number
  recentExecutiveChanges?: {
    name: string
    role: string
    departureDate: Date
    reason?: string
  }[]
  recentFinancing?: {
    date: Date
    amount: number
    round: string
    valuation: number
  }[]
}

export interface RegulatoryContext {
  companyId: string
  exchangeId: string
  sector: string
  sizeTier: 'micro' | 'small' | 'mid' | 'large' | 'mega'

  // Key risk flags that trigger specific disclosure requirements
  hasCustomerConcentration: boolean           // >10% = material risk
  hasSupplierConcentration: boolean
  hasCfiusExposure: boolean                  // China/foreign ops
  hasEsgMandates: boolean
  hasSignificantLitigation: boolean          // >$1M exposure

  // Regulatory consequences
  applicableRequirements: string[]           // "min_3yr_financials", "audit_committee_required", etc.
  applicableExemptions: string[]
  highRiskProfile: boolean
}

/**
 * Build regulatory context for a company
 *
 * Example output:
 * ```
 * {
 *   sector: 'technology',
 *   sizeTier: 'mid',
 *   hasCustomerConcentration: true,        // Triggers: "Must disclose key customer loss"
 *   hasLitigation: true,                   // Triggers: "Must disclose litigation >$1M"
 *   applicableRequirements: [
 *     'customer_concentration_disclosure',
 *     'key_supplier_disclosure',
 *     'litigation_disclosure',
 *     'director_independence_audit_committee'
 *   ]
 * }
 * ```
 */
export async function buildCompanyRegulatoryContext(
  profile: CompanyProfile,
  exchangeCode: string
): Promise<RegulatoryContext> {

  // Determine size tier
  const sizeTier = determineSizeTier(profile.sizeMetric, profile.sizeValue)

  // Determine risk flags
  const hasCustomerConcentration = profile.topCustomersPercentRevenue > 10
  const hasSupplierConcentration = profile.sizeValue < 100_000_000 && profile.sector !== 'financial_services'
  const hasCfiusExposure = profile.operatingCountries.includes('CN') || profile.operatingCountries.includes('RU')
  const hasEsgMandates = ['EU', 'UK'].some(country =>
    ['FR', 'DE', 'NL', 'BE', 'AT', 'GB'].includes(profile.headquartersCountry)
  )
  const hasSignificantLitigation = (profile.litigationExposureUsd || 0) > 1_000_000

  // Get exchange requirements
  const exchangeRequirements = await getExchangeRequirements(exchangeCode)

  // Apply context to requirements
  const applicableRequirements = applyCompanyContextToRequirements(
    exchangeRequirements,
    {
      sector: profile.sector,
      sizeTier,
      hasCustomerConcentration,
      hasSupplierConcentration,
      hasCfiusExposure,
      hasEsgMandates,
      hasSignificantLitigation,
    }
  )

  // Get applicable exemptions
  const applicableExemptions = await getApplicableExemptions(
    profile.companyId,
    exchangeCode,
    sizeTier
  )

  const highRiskProfile =
    hasCustomerConcentration ||
    hasSignificantLitigation ||
    hasCfiusExposure ||
    (sizeTier === 'micro' && ['technology', 'biotech'].includes(profile.sector))

  // Store context in database
  await storeRegulatoryContext(profile.companyId, {
    exchangeId: exchangeCode,
    sector: profile.sector,
    sizeTier,
    marketCapUsd: profile.sizeMetric === 'market_cap' ? profile.sizeValue : null,
    annualRevenueUsd: profile.sizeMetric === 'revenue' ? profile.sizeValue : null,
    headquartersCountry: profile.headquartersCountry,
    operatingCountries: profile.operatingCountries,
    topCustomersPercentRevenue: profile.topCustomersPercentRevenue,
    litigationExposureUsd: profile.litigationExposureUsd,
    highRiskProfile,
  })

  return {
    companyId: profile.companyId,
    exchangeId: exchangeCode,
    sector: profile.sector,
    sizeTier,
    hasCustomerConcentration,
    hasSupplierConcentration,
    hasCfiusExposure,
    hasEsgMandates,
    hasSignificantLitigation,
    applicableRequirements,
    applicableExemptions,
    highRiskProfile,
  }
}

/**
 * Determine company size tier based on metric and value
 */
function determineSizeTier(
  metric: 'revenue' | 'market_cap',
  value: number
): 'micro' | 'small' | 'mid' | 'large' | 'mega' {
  if (metric === 'revenue') {
    if (value < 1_000_000) return 'micro'
    if (value < 10_000_000) return 'small'
    if (value < 100_000_000) return 'mid'
    if (value < 1_000_000_000) return 'large'
    return 'mega'
  }

  // market_cap
  if (value < 10_000_000) return 'micro'
  if (value < 100_000_000) return 'small'
  if (value < 500_000_000) return 'mid'
  if (value < 2_000_000_000) return 'large'
  return 'mega'
}

/**
 * Get base requirements for exchange
 */
async function getExchangeRequirements(exchangeCode: string): Promise<string[]> {
  try {
    const results = await sql`
      SELECT ARRAY_AGG(requirement_key) as requirements
      FROM regulatory_requirements
      WHERE exchange_id = (SELECT id FROM exchanges WHERE code = ${exchangeCode})
        AND is_mandatory = true
    `

    return (results[0]?.requirements as string[]) || []
  } catch (err) {
    console.error('[regulatory-context] Failed to get exchange requirements:', err)
    return []
  }
}

/**
 * Apply company context to base requirements
 *
 * Example:
 * - Base: ["min_3yr_financials", "audit_committee_required"]
 * - Context: Company has customer concentration (18% of revenue)
 * - Output: ["min_3yr_financials", "audit_committee_required", "customer_concentration_disclosure"]
 */
function applyCompanyContextToRequirements(
  baseRequirements: string[],
  context: {
    sector: string
    sizeTier: string
    hasCustomerConcentration: boolean
    hasSupplierConcentration: boolean
    hasCfiusExposure: boolean
    hasEsgMandates: boolean
    hasSignificantLitigation: boolean
  }
): string[] {
  const applicable = [...baseRequirements]

  // Add context-specific requirements
  if (context.hasCustomerConcentration) {
    applicable.push('customer_concentration_disclosure')
    applicable.push('key_customer_risk_disclosure')
  }

  if (context.hasSupplierConcentration) {
    applicable.push('key_supplier_disclosure')
  }

  if (context.hasCfiusExposure) {
    applicable.push('cfius_disclosure')
    applicable.push('foreign_operations_risk_disclosure')
  }

  if (context.hasEsgMandates) {
    applicable.push('esg_disclosure')
    applicable.push('climate_risk_disclosure')
  }

  if (context.hasSignificantLitigation) {
    applicable.push('litigation_disclosure')
    applicable.push('legal_risk_disclosure')
  }

  // Size-based requirements
  if (context.sizeTier === 'small' || context.sizeTier === 'micro') {
    applicable.push('small_business_form_required')
  }

  return [...new Set(applicable)] // Remove duplicates
}

/**
 * Get exemptions applicable to this company
 *
 * Example:
 * - Company revenue $50M → small business exemption → SOX 404(b) exemption
 * - Company <2 years old → emerging growth company → scaled disclosures
 */
async function getApplicableExemptions(
  companyId: string,
  exchangeCode: string,
  sizeTier: string
): Promise<string[]> {
  try {
    const results = await sql`
      SELECT ARRAY_AGG(exemption_rule) as exemptions
      FROM regulatory_exemptions
      WHERE company_id = ${companyId}
        AND exchange_id = (SELECT id FROM exchanges WHERE code = ${exchangeCode})
        AND is_active = true
        AND (expiration_date IS NULL OR expiration_date > NOW())
    `

    const stored = (results[0]?.exemptions as string[]) || []

    // Add automatic exemptions based on size
    const automatic: string[] = []
    if (sizeTier === 'small' || sizeTier === 'micro') {
      automatic.push('SEC_reg_a_small_business_exemption')
    }

    return [...new Set([...stored, ...automatic])]
  } catch (err) {
    console.error('[regulatory-context] Failed to get applicable exemptions:', err)
    return []
  }
}

/**
 * Store regulatory context in database for later use
 */
async function storeRegulatoryContext(
  companyId: string,
  context: {
    exchangeId: string
    sector: string
    sizeTier: string
    marketCapUsd: number | null
    annualRevenueUsd: number | null
    headquartersCountry: string
    operatingCountries: string[]
    topCustomersPercentRevenue: number
    litigationExposureUsd?: number
    highRiskProfile: boolean
  }
): Promise<void> {
  try {
    const exchangeId = await sql`SELECT id FROM exchanges WHERE code = ${context.exchangeId}`

    await sql`
      INSERT INTO company_regulatory_context (
        company_id,
        exchange_id,
        sector,
        size_tier,
        market_cap_usd,
        annual_revenue_usd,
        headquarters_country,
        operating_countries,
        top_3_customers_pct_revenue,
        litigation_exposure_usd,
        high_risk_profile
      ) VALUES (
        ${companyId},
        ${exchangeId[0].id},
        ${context.sector},
        ${context.sizeTier},
        ${context.marketCapUsd},
        ${context.annualRevenueUsd},
        ${context.headquartersCountry},
        ${JSON.stringify(context.operatingCountries)},
        ${context.topCustomersPercentRevenue},
        ${context.litigationExposureUsd || null},
        ${context.highRiskProfile}
      )
      ON CONFLICT (company_id) DO UPDATE SET
        sector = EXCLUDED.sector,
        size_tier = EXCLUDED.size_tier,
        market_cap_usd = EXCLUDED.market_cap_usd,
        annual_revenue_usd = EXCLUDED.annual_revenue_usd,
        headquarters_country = EXCLUDED.headquarters_country,
        operating_countries = EXCLUDED.operating_countries,
        top_3_customers_pct_revenue = EXCLUDED.top_3_customers_pct_revenue,
        litigation_exposure_usd = EXCLUDED.litigation_exposure_usd,
        high_risk_profile = EXCLUDED.high_risk_profile,
        updated_at = NOW()
    `
  } catch (err) {
    console.error('[regulatory-context] Failed to store context:', err)
    // Non-blocking failure — continue with in-memory context
  }
}

/**
 * Get stored regulatory context for company
 */
export async function getStoredRegulatoryContext(companyId: string): Promise<RegulatoryContext | null> {
  try {
    const results = await sql`
      SELECT * FROM company_regulatory_context WHERE company_id = ${companyId}
    `

    if (results.length === 0) return null

    const row = results[0]

    return {
      companyId,
      exchangeId: row.exchange_id,
      sector: row.sector,
      sizeTier: row.size_tier,
      hasCustomerConcentration: (row.top_3_customers_pct_revenue || 0) > 10,
      hasSupplierConcentration: row.operating_countries?.includes('china') || false,
      hasCfiusExposure: ['CN', 'RU'].some(c => row.operating_countries?.includes(c)) || false,
      hasEsgMandates: ['EU', 'UK'].some(c => row.headquarters_country?.includes(c)) || false,
      hasSignificantLitigation: (row.litigation_exposure_usd || 0) > 1_000_000,
      applicableRequirements: [],
      applicableExemptions: [],
      highRiskProfile: row.high_risk_profile,
    }
  } catch (err) {
    console.error('[regulatory-context] Failed to get stored context:', err)
    return null
  }
}
