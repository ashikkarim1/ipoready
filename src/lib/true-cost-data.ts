/**
 * True Cost of Going Public — Cost Data Library
 *
 * Defines exchange-specific costs for post-IPO compliance and operations.
 * Based on regulatory requirements and market data for public companies.
 */

import { ExchangeCode } from './exchange-config'

export type CostCategory =
  | 'external-audit'
  | 'ir-pr-services'
  | 'legal-compliance'
  | 'insider-trading'
  | 'dno-insurance'
  | 'eno-insurance'
  | 'cyber-insurance'
  | 'ir-additional'
  | 'governance-services'
  | 'listing-agent'

export interface CostComponent {
  id: CostCategory
  name: string
  description: string
  category: 'mandatory' | 'insurance' | 'discretionary'
  minAnnual: number
  maxAnnual: number
  isCanadian?: boolean
  isUS?: boolean
  notes?: string
}

export interface ExchangeCostProfile {
  exchangeId: ExchangeCode
  exchangeName: string
  tier: 'venture' | 'emerging' | 'standard' | 'otc'
  country: 'CA' | 'US'
  baseCostMin: number
  baseCostMax: number
  components: CostCategory[]
  description: string
}

/**
 * Core cost components database
 * Ranges based on real IPO data and regulatory guidance
 */
export const COST_COMPONENTS: Record<CostCategory, CostComponent> = {
  'external-audit': {
    id: 'external-audit',
    name: 'External Auditor (Annual Audit + Quarterly Reviews)',
    description: 'Annual full audit and quarterly review procedures required for public companies',
    category: 'mandatory',
    minAnnual: 150000,
    maxAnnual: 500000,
    notes: 'Varies by company size, complexity, and industry. Higher for US exchanges. Includes SOX 404 compliance for SEC companies.',
  },
  'ir-pr-services': {
    id: 'ir-pr-services',
    name: 'IR/PR Services (Investor Relations + Press Distribution)',
    description: 'Ongoing investor relations support, quarterly call management, and press release distribution',
    category: 'mandatory',
    minAnnual: 100000,
    maxAnnual: 300000,
    notes: 'Includes retainer for IR agency, earnings call management, press distribution, and investor communications.',
  },
  'legal-compliance': {
    id: 'legal-compliance',
    name: 'Legal & Securities Counsel (Retainer)',
    description: 'Ongoing securities law advice, corporate governance consulting, and compliance review',
    category: 'mandatory',
    minAnnual: 100000,
    maxAnnual: 250000,
    notes: 'Retainer for securities counsel reviewing filings, governance matters, and regulatory compliance.',
  },
  'insider-trading': {
    id: 'insider-trading',
    name: 'Insider Trading Compliance (SEDI + Blackout Management)',
    description: 'SEDI reporting infrastructure, blackout period management, and trading policy administration',
    category: 'mandatory',
    minAnnual: 20000,
    maxAnnual: 50000,
    notes: 'Software, legal review of trading policies, and insider education programs.',
  },
  'dno-insurance': {
    id: 'dno-insurance',
    name: "Directors & Officers Insurance (D&O)",
    description: 'Liability coverage for directors and officers. Required by most lenders and best practices.',
    category: 'insurance',
    minAnnual: 50000,
    maxAnnual: 200000,
    notes: 'Increases significantly post-IPO. Varies by market cap, industry risk, and claims history.',
  },
  'eno-insurance': {
    id: 'eno-insurance',
    name: 'Errors & Omissions Insurance (E&O)',
    description: 'Professional liability coverage for officers and key executives',
    category: 'insurance',
    minAnnual: 30000,
    maxAnnual: 100000,
    notes: 'Protects against claims related to management decisions and professional services.',
  },
  'cyber-insurance': {
    id: 'cyber-insurance',
    name: 'Cyber Liability & Crime Insurance',
    description: 'Coverage for data breaches, cyber attacks, and financial crime',
    category: 'insurance',
    minAnnual: 20000,
    maxAnnual: 50000,
    notes: 'Increasingly required; varies by industry and data security posture.',
  },
  'ir-additional': {
    id: 'ir-additional',
    name: 'Additional IR Support (Optional)',
    description: 'Extra IR staffing, expanded investor outreach, or specialized IR consulting',
    category: 'discretionary',
    minAnnual: 50000,
    maxAnnual: 150000,
    notes: 'Optional for companies with large investor bases or complex capital structures.',
  },
  'governance-services': {
    id: 'governance-services',
    name: 'Governance Services (Optional)',
    description: 'Board secretary, governance consulting, or external board services',
    category: 'discretionary',
    minAnnual: 30000,
    maxAnnual: 80000,
    notes: 'Recommended for smaller boards or companies without dedicated governance staff.',
  },
  'listing-agent': {
    id: 'listing-agent',
    name: 'Listing Agent Retainer (Optional)',
    description: 'Post-listing support from your underwriter or listing agent',
    category: 'discretionary',
    minAnnual: 50000,
    maxAnnual: 100000,
    notes: 'Some companies retain their underwriter for ongoing market support and strategic advice.',
  },
}

/**
 * Exchange-specific cost profiles
 */
export const EXCHANGE_COST_PROFILES: Record<string, ExchangeCostProfile> = {
  tsx: {
    exchangeId: 'tsx',
    exchangeName: 'Toronto Stock Exchange',
    tier: 'standard',
    country: 'CA',
    baseCostMin: 1000000,
    baseCostMax: 1500000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
      'eno-insurance',
      'cyber-insurance',
    ],
    description: 'Canadian large-cap exchange with comprehensive regulatory and compliance requirements.',
  },
  nasdaq: {
    exchangeId: 'nasdaq',
    exchangeName: 'NASDAQ Stock Market',
    tier: 'standard',
    country: 'US',
    baseCostMin: 2000000,
    baseCostMax: 3500000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
      'eno-insurance',
      'cyber-insurance',
    ],
    description: 'US exchange with high regulatory standards, SOX 404 compliance, and larger investor base.',
  },
  nyse: {
    exchangeId: 'nyse',
    exchangeName: 'New York Stock Exchange',
    tier: 'standard',
    country: 'US',
    baseCostMin: 2500000,
    baseCostMax: 4000000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
      'eno-insurance',
      'cyber-insurance',
    ],
    description: 'World\'s largest exchange with the most stringent governance and disclosure requirements.',
  },
  tsxv: {
    exchangeId: 'tsxv',
    exchangeName: 'TSX Venture Exchange',
    tier: 'venture',
    country: 'CA',
    baseCostMin: 500000,
    baseCostMax: 800000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
      'cyber-insurance',
    ],
    description: 'Canadian venture exchange with lower absolute costs but scaled requirements for emerging companies.',
  },
  cse: {
    exchangeId: 'cse',
    exchangeName: 'Canadian Securities Exchange',
    tier: 'emerging',
    country: 'CA',
    baseCostMin: 400000,
    baseCostMax: 700000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
      'cyber-insurance',
    ],
    description: 'Canadian exchange for smaller emerging companies with streamlined compliance requirements.',
  },
  cboe: {
    exchangeId: 'cboe',
    exchangeName: 'Cboe BZX Exchange',
    tier: 'standard',
    country: 'US',
    baseCostMin: 1500000,
    baseCostMax: 2500000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
      'eno-insurance',
      'cyber-insurance',
    ],
    description: 'US alternative exchange with SEC oversight and competitive compliance requirements.',
  },
  otc: {
    exchangeId: 'otc',
    exchangeName: 'OTC Markets',
    tier: 'otc',
    country: 'US',
    baseCostMin: 200000,
    baseCostMax: 400000,
    components: [
      'external-audit',
      'ir-pr-services',
      'legal-compliance',
      'insider-trading',
      'dno-insurance',
    ],
    description: 'Minimal regulatory requirements for OTC-listed companies; audits scaled to company size.',
  },
}

/**
 * Monthly ramp-up profile (Year 1)
 * Costs scale from 0 at month 0 to full run-rate by month 12
 */
export function getMonthlyRampup(month: number): number {
  if (month <= 0) return 0
  if (month >= 12) return 1.0
  // Linear ramp from 0 to full by month 12
  return Math.min(1.0, month / 12)
}

/**
 * Calculate total cost for a given year and optional adjustments
 */
export interface CostCalculationOptions {
  auditorComplexity?: 'simple' | 'medium' | 'complex' // Affects auditor fees
  irBudgetSize?: 'small' | 'medium' | 'large' // Affects IR/PR fees
  discretionaryToggles?: {
    irAdditional?: boolean
    governanceServices?: boolean
    listingAgent?: boolean
  }
}

export function calculateAnnualCost(
  exchangeId: string,
  year: number,
  options: CostCalculationOptions = {}
): { breakdown: Record<CostCategory, number>; total: number } {
  const profile = EXCHANGE_COST_PROFILES[exchangeId.toLowerCase()]
  if (!profile) {
    return { breakdown: {}, total: 0 }
  }

  const breakdown: Record<CostCategory, number> = {}

  // Calculate each component
  for (const categoryId of profile.components) {
    const component = COST_COMPONENTS[categoryId]
    if (!component) continue

    let annualCost = component.minAnnual
    const range = component.maxAnnual - component.minAnnual

    // Apply complexity adjustments
    if (categoryId === 'external-audit') {
      const complexityFactor =
        options.auditorComplexity === 'complex'
          ? 0.8
          : options.auditorComplexity === 'simple'
            ? 0.3
            : 0.5
      annualCost = component.minAnnual + range * complexityFactor
    } else if (categoryId === 'ir-pr-services') {
      const irFactor =
        options.irBudgetSize === 'large'
          ? 0.8
          : options.irBudgetSize === 'small'
            ? 0.3
            : 0.5
      annualCost = component.minAnnual + range * irFactor
    } else {
      // Mid-point for other components
      annualCost = component.minAnnual + range * 0.5
    }

    // Year 1 ramp-up (only for first 12 months)
    if (year === 1) {
      annualCost = annualCost * 0.5 // Approximately half year due to ramp
    }

    breakdown[categoryId] = Math.round(annualCost)
  }

  // Add discretionary components if enabled
  if (options.discretionaryToggles?.irAdditional) {
    const irAdditional = COST_COMPONENTS['ir-additional']
    breakdown['ir-additional'] = Math.round(
      irAdditional.minAnnual + (irAdditional.maxAnnual - irAdditional.minAnnual) * 0.5
    )
  }
  if (options.discretionaryToggles?.governanceServices) {
    const govServices = COST_COMPONENTS['governance-services']
    breakdown['governance-services'] = Math.round(
      govServices.minAnnual + (govServices.maxAnnual - govServices.minAnnual) * 0.5
    )
  }
  if (options.discretionaryToggles?.listingAgent) {
    const listingAgent = COST_COMPONENTS['listing-agent']
    breakdown['listing-agent'] = Math.round(
      listingAgent.minAnnual + (listingAgent.maxAnnual - listingAgent.minAnnual) * 0.5
    )
  }

  const total = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0)

  return { breakdown, total }
}

/**
 * Get monthly breakdown for Year 1
 */
export function getYear1MonthlyBreakdown(
  exchangeId: string,
  options: CostCalculationOptions = {}
): Array<{ month: number; monthName: string; total: number; breakdown: Record<CostCategory, number> }> {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const result = []
  for (let month = 1; month <= 12; month++) {
    const rampup = getMonthlyRampup(month)
    const annualCosts = calculateAnnualCost(exchangeId, 1, options)

    // Scale annual costs by month ramp
    const monthlyBreakdown: Record<CostCategory, number> = {}
    for (const [key, cost] of Object.entries(annualCosts.breakdown)) {
      monthlyBreakdown[key as CostCategory] = Math.round(cost * rampup / 12)
    }

    const monthlyTotal = Object.values(monthlyBreakdown).reduce((sum, cost) => sum + cost, 0)

    result.push({
      month,
      monthName: months[month - 1],
      total: monthlyTotal,
      breakdown: monthlyBreakdown,
    })
  }

  return result
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'CAD' ? 'CAD' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get color for cost category
 */
export function getCategoryColor(categoryId: CostCategory): string {
  const colors: Record<CostCategory, string> = {
    'external-audit': '#3B82F6', // Blue
    'ir-pr-services': '#8B5CF6', // Purple
    'legal-compliance': '#10B981', // Green
    'insider-trading': '#F59E0B', // Amber
    'dno-insurance': '#EF4444', // Red
    'eno-insurance': '#EC4899', // Pink
    'cyber-insurance': '#F97316', // Orange
    'ir-additional': '#6366F1', // Indigo
    'governance-services': '#06B6D4', // Cyan
    'listing-agent': '#14B8A6', // Teal
  }
  return colors[categoryId] || '#6B7280'
}
