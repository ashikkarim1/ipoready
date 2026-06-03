/**
 * Listing Agreement Rules Engine
 * ==============================
 * Validates cap table data against exchange-specific listing requirements
 * Implements gap analysis and compliance checking for TSX, NASDAQ, NYSE, TSXV, CSE
 *
 * Features:
 * - Load exchange configurations (TSX, NASDAQ, NYSE, TSXV, CSE)
 * - Validate cap table against listing rules
 * - Flag violations and missing requirements
 * - Gap analysis: current shares vs. minimum required
 * - Rule violations with severity levels (error, warning, info)
 */

import { ExchangeCode, ExchangeConfig, getExchangeConfig } from './exchange-config'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Severity levels for rule violations
 */
export type ViolationSeverity = 'critical' | 'error' | 'warning' | 'info'

/**
 * Rule violation object
 */
export interface RuleViolation {
  id: string
  exchange: ExchangeCode
  severity: ViolationSeverity
  rule: string
  message: string
  details: Record<string, unknown>
  suggestion?: string
}

/**
 * Gap analysis result
 */
export interface GapAnalysis {
  metric: string
  current: number
  required: number
  gap: number
  gapPercentage: number
  status: 'compliant' | 'warning' | 'critical'
  suggestion?: string
}

/**
 * Listing readiness report
 */
export interface ListingReadinessReport {
  exchange: ExchangeCode
  exchangeName: string
  timestamp: string
  overallStatus: 'ready' | 'at-risk' | 'not-ready'
  complianceScore: number // 0-100
  violations: RuleViolation[]
  gaps: GapAnalysis[]
  requiredResolutions: {
    completed: string[]
    pending: string[]
    total: number
  }
  requiredConsents: {
    completed: string[]
    pending: string[]
    total: number
  }
  summary: {
    totalViolations: number
    criticalViolations: number
    errorViolations: number
    warningViolations: number
  }
}

/**
 * Cap table data structure
 */
export interface CapTableData {
  companyName: string
  totalAuthorizedShares: number
  totalIssuedShares: number
  publicShares: number
  publicSharePercentage: number
  minSharePrice: number
  proposedOfferingSize: number // In millions
  proposedSharesOffering: number
  proposedSharePrice: number
  estimatedPublicFloatCAD?: number // In millions CAD
  estimatedPublicFloatUSD?: number // In millions USD
  hasAuditCommittee?: boolean
  hasNominationCommittee?: boolean
  hasCompensationCommittee?: boolean
  hasAuditedFinancials?: boolean
  yearsOfFinancialHistory?: number
  completedResolutions?: string[]
  completedConsents?: string[]
}

// ============================================================================
// Core Validation Rules
// ============================================================================

/**
 * Rules engine class for listing compliance validation
 */
export class ListingRulesEngine {
  private exchange: ExchangeConfig
  private exchangeCode: ExchangeCode
  private capTable: CapTableData
  private violations: RuleViolation[] = []

  constructor(exchangeCode: ExchangeCode, capTable: CapTableData) {
    this.exchangeCode = exchangeCode
    this.exchange = getExchangeConfig(exchangeCode)
    this.capTable = capTable
    this.violations = []
  }

  /**
   * Run all validation rules and return report
   */
  validate(): ListingReadinessReport {
    this.violations = []

    // Run all validation rules
    this.validatePublicFloat()
    this.validateShareCount()
    this.validateBoardLot()
    this.validateMinSharePrice()
    this.validateOfferingSize()
    this.validateCommitteeRequirements()
    this.validateFinancialHistory()
    this.validateUndividedUnderlying()

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore()

    // Get gap analysis
    const gaps = this.performGapAnalysis()

    // Process resolutions and consents
    const resolutions = this.processResolutions()
    const consents = this.processConsents()

    // Determine overall status
    const criticalCount = this.violations.filter((v) => v.severity === 'critical').length
    const errorCount = this.violations.filter((v) => v.severity === 'error').length
    let overallStatus: 'ready' | 'at-risk' | 'not-ready' = 'ready'
    if (criticalCount > 0) {
      overallStatus = 'not-ready'
    } else if (errorCount > 0 || gaps.some((g) => g.status === 'critical')) {
      overallStatus = 'at-risk'
    }

    return {
      exchange: this.exchangeCode,
      exchangeName: this.exchange.name,
      timestamp: new Date().toISOString(),
      overallStatus,
      complianceScore,
      violations: this.violations,
      gaps,
      requiredResolutions: resolutions,
      requiredConsents: consents,
      summary: {
        totalViolations: this.violations.length,
        criticalViolations: criticalCount,
        errorViolations: errorCount,
        warningViolations: this.violations.filter((v) => v.severity === 'warning').length,
      },
    }
  }

  /**
   * Validate public float percentage
   */
  private validatePublicFloat(): void {
    const publicFloatPercentage = this.capTable.publicSharePercentage
    const minPublicFloat = this.exchange.minPublicFloat

    if (publicFloatPercentage < minPublicFloat) {
      this.violations.push({
        id: 'public-float-minimum',
        exchange: this.exchangeCode,
        severity: 'critical',
        rule: 'Minimum Public Float Percentage',
        message: `Public float is ${publicFloatPercentage}%, but ${minPublicFloat}% is required`,
        details: {
          current: publicFloatPercentage,
          required: minPublicFloat,
          shortfall: minPublicFloat - publicFloatPercentage,
        },
        suggestion: `Need to increase public shares by ${Math.ceil(
          (this.capTable.totalIssuedShares * (minPublicFloat - publicFloatPercentage)) / 100
        )} shares or reduce insider holdings`,
      })
    } else {
      this.violations.push({
        id: 'public-float-met',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Minimum Public Float Percentage',
        message: `Public float of ${publicFloatPercentage}% meets ${minPublicFloat}% requirement`,
        details: {
          current: publicFloatPercentage,
          required: minPublicFloat,
          buffer: publicFloatPercentage - minPublicFloat,
        },
      })
    }
  }

  /**
   * Validate minimum public shares
   */
  private validateShareCount(): void {
    const publicShares = this.capTable.publicShares
    const minShares = this.exchange.minShares

    if (publicShares < minShares) {
      this.violations.push({
        id: 'min-public-shares',
        exchange: this.exchangeCode,
        severity: 'critical',
        rule: 'Minimum Public Shares',
        message: `Public shares are ${publicShares.toLocaleString()}, but ${minShares.toLocaleString()} is required`,
        details: {
          current: publicShares,
          required: minShares,
          shortfall: minShares - publicShares,
        },
        suggestion: `Need ${minShares - publicShares} more public shares to meet minimum requirement`,
      })
    } else {
      this.violations.push({
        id: 'min-public-shares-met',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Minimum Public Shares',
        message: `Public shares of ${publicShares.toLocaleString()} meets requirement of ${minShares.toLocaleString()}`,
        details: {
          current: publicShares,
          required: minShares,
          surplus: publicShares - minShares,
        },
      })
    }
  }

  /**
   * Validate board lot size compliance
   */
  private validateBoardLot(): void {
    const boardLot = this.exchange.boardLot
    const publicShares = this.capTable.publicShares

    // Check if public shares is a multiple of board lot
    if (publicShares % boardLot !== 0) {
      this.violations.push({
        id: 'board-lot-multiple',
        exchange: this.exchangeCode,
        severity: 'warning',
        rule: 'Board Lot Size Compliance',
        message: `Public shares (${publicShares.toLocaleString()}) are not a clean multiple of board lot size (${boardLot})`,
        details: {
          publicShares,
          boardLot,
          remainder: publicShares % boardLot,
          suggestedShares: Math.round(publicShares / boardLot) * boardLot,
        },
        suggestion: `Adjust public shares to ${Math.round(publicShares / boardLot) * boardLot} for clean board lot multiples`,
      })
    } else {
      this.violations.push({
        id: 'board-lot-compliant',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Board Lot Size Compliance',
        message: `Public shares (${publicShares.toLocaleString()}) are a clean multiple of board lot (${boardLot})`,
        details: {
          publicShares,
          boardLot,
          multiples: publicShares / boardLot,
        },
      })
    }
  }

  /**
   * Validate minimum share price
   */
  private validateMinSharePrice(): void {
    const sharePrice = this.capTable.proposedSharePrice
    const minPrice = this.exchange.minSharePrice

    if (sharePrice < minPrice) {
      this.violations.push({
        id: 'share-price-minimum',
        exchange: this.exchangeCode,
        severity: 'error',
        rule: 'Minimum Share Price',
        message: `Proposed share price of $${sharePrice} is below minimum of $${minPrice}`,
        details: {
          proposed: sharePrice,
          minimum: minPrice,
          shortfall: minPrice - sharePrice,
        },
        suggestion: `Increase offering share price to at least $${minPrice} or execute reverse stock split`,
      })
    } else {
      this.violations.push({
        id: 'share-price-met',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Minimum Share Price',
        message: `Proposed share price of $${sharePrice} meets minimum of $${minPrice}`,
        details: {
          proposed: sharePrice,
          minimum: minPrice,
          buffer: (sharePrice - minPrice).toFixed(2),
        },
      })
    }
  }

  /**
   * Validate offering size
   */
  private validateOfferingSize(): void {
    const offeringSize = this.capTable.proposedOfferingSize
    const minOfferingCAD = this.exchange.minOfferingCAD
    const minOfferingUSD = this.exchange.minOfferingUSD
    const minOffering = this.exchange.country === 'Canada' ? minOfferingCAD : minOfferingUSD

    if (offeringSize < minOffering) {
      this.violations.push({
        id: 'offering-size-minimum',
        exchange: this.exchangeCode,
        severity: 'error',
        rule: 'Minimum Offering Size',
        message: `Proposed offering of $${offeringSize}M is below minimum of $${minOffering}M`,
        details: {
          proposed: offeringSize,
          minimum: minOffering,
          shortfall: minOffering - offeringSize,
          currency: this.exchange.currency,
        },
        suggestion: `Increase offering size to at least $${minOffering}M ${this.exchange.currency}`,
      })
    } else {
      this.violations.push({
        id: 'offering-size-met',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Minimum Offering Size',
        message: `Proposed offering of $${offeringSize}M meets minimum of $${minOffering}M`,
        details: {
          proposed: offeringSize,
          minimum: minOffering,
          surplus: offeringSize - minOffering,
          currency: this.exchange.currency,
        },
      })
    }
  }

  /**
   * Validate committee requirements
   */
  private validateCommitteeRequirements(): void {
    const requiredCommittees = []
    if (this.exchange.requiresAuditCommittee) requiredCommittees.push('Audit')
    if (this.exchange.requiresNominationCommittee) requiredCommittees.push('Nomination')
    if (this.exchange.requiresCompensationCommittee) requiredCommittees.push('Compensation')

    if (requiredCommittees.length > 0) {
      const missingCommittees = []
      if (this.exchange.requiresAuditCommittee && !this.capTable.hasAuditCommittee) {
        missingCommittees.push('Audit Committee')
      }
      if (this.exchange.requiresNominationCommittee && !this.capTable.hasNominationCommittee) {
        missingCommittees.push('Nomination Committee')
      }
      if (this.exchange.requiresCompensationCommittee && !this.capTable.hasCompensationCommittee) {
        missingCommittees.push('Compensation Committee')
      }

      if (missingCommittees.length > 0) {
        this.violations.push({
          id: 'missing-committees',
          exchange: this.exchangeCode,
          severity: 'error',
          rule: 'Required Board Committees',
          message: `Missing required committees: ${missingCommittees.join(', ')}`,
          details: {
            required: requiredCommittees,
            missing: missingCommittees,
          },
          suggestion: `Establish the following committees: ${missingCommittees.join(', ')}`,
        })
      } else {
        this.violations.push({
          id: 'committees-met',
          exchange: this.exchangeCode,
          severity: 'info',
          rule: 'Required Board Committees',
          message: `All required committees are in place: ${requiredCommittees.join(', ')}`,
          details: {
            required: requiredCommittees,
            established: requiredCommittees,
          },
        })
      }
    }
  }

  /**
   * Validate financial history requirements
   */
  private validateFinancialHistory(): void {
    const yearsRequired = this.exchange.minFinancialHistory
    const yearsAvailable = this.capTable.yearsOfFinancialHistory || 0

    if (yearsAvailable < yearsRequired) {
      this.violations.push({
        id: 'financial-history-insufficient',
        exchange: this.exchangeCode,
        severity: 'error',
        rule: 'Financial History Requirements',
        message: `Only ${yearsAvailable} year(s) of financial statements available, but ${yearsRequired} year(s) required`,
        details: {
          available: yearsAvailable,
          required: yearsRequired,
          shortfall: yearsRequired - yearsAvailable,
        },
        suggestion: `Obtain additional ${yearsRequired - yearsAvailable} year(s) of audited financial statements`,
      })
    } else {
      this.violations.push({
        id: 'financial-history-met',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Financial History Requirements',
        message: `${yearsAvailable} year(s) of financial statements meets requirement of ${yearsRequired} year(s)`,
        details: {
          available: yearsAvailable,
          required: yearsRequired,
          surplus: yearsAvailable - yearsRequired,
        },
      })
    }
  }

  /**
   * Validate undivided underlying (no warrant/option complications)
   */
  private validateUndividedUnderlying(): void {
    const totalIssued = this.capTable.totalIssuedShares
    const authorized = this.capTable.totalAuthorizedShares

    if (totalIssued > authorized) {
      this.violations.push({
        id: 'issued-exceeds-authorized',
        exchange: this.exchangeCode,
        severity: 'critical',
        rule: 'Share Authorization Compliance',
        message: `Issued shares (${totalIssued.toLocaleString()}) exceed authorized shares (${authorized.toLocaleString()})`,
        details: {
          issued: totalIssued,
          authorized: authorized,
          overage: totalIssued - authorized,
        },
        suggestion: `Increase authorized share count to at least ${totalIssued.toLocaleString()} or reduce issued shares`,
      })
    } else if (totalIssued === authorized) {
      this.violations.push({
        id: 'authorized-fully-utilized',
        exchange: this.exchangeCode,
        severity: 'warning',
        rule: 'Share Authorization Compliance',
        message: `All authorized shares have been issued (${totalIssued.toLocaleString()}), leaving no reserve for future issuance`,
        details: {
          issued: totalIssued,
          authorized: authorized,
          reserve: 0,
        },
        suggestion: `Consider increasing authorized share count for future employee options or warrant exercises`,
      })
    } else {
      this.violations.push({
        id: 'authorized-sufficient',
        exchange: this.exchangeCode,
        severity: 'info',
        rule: 'Share Authorization Compliance',
        message: `Authorized shares (${authorized.toLocaleString()}) exceed issued shares (${totalIssued.toLocaleString()})`,
        details: {
          issued: totalIssued,
          authorized: authorized,
          reserve: authorized - totalIssued,
        },
      })
    }
  }

  /**
   * Perform gap analysis
   */
  private performGapAnalysis(): GapAnalysis[] {
    const gaps: GapAnalysis[] = []

    // Public float percentage gap
    const publicFloatGap = this.capTable.publicSharePercentage - this.exchange.minPublicFloat
    gaps.push({
      metric: 'Public Float %',
      current: Math.round(this.capTable.publicSharePercentage * 100) / 100,
      required: this.exchange.minPublicFloat,
      gap: Math.round(publicFloatGap * 100) / 100,
      gapPercentage: publicFloatGap < 0 ? -publicFloatGap : 0,
      status: publicFloatGap >= 0 ? 'compliant' : publicFloatGap > -5 ? 'warning' : 'critical',
      suggestion:
        publicFloatGap < 0
          ? `Need ${Math.ceil(
              (this.capTable.totalIssuedShares * Math.abs(publicFloatGap)) / 100
            )} more public shares`
          : undefined,
    })

    // Public shares gap
    const sharesGap = this.capTable.publicShares - this.exchange.minShares
    gaps.push({
      metric: 'Public Shares Count',
      current: this.capTable.publicShares,
      required: this.exchange.minShares,
      gap: sharesGap,
      gapPercentage: sharesGap < 0 ? Math.abs(sharesGap) / this.exchange.minShares : 0,
      status: sharesGap >= 0 ? 'compliant' : sharesGap > this.exchange.minShares * -0.1 ? 'warning' : 'critical',
    })

    // Share price gap
    const priceGap = this.capTable.proposedSharePrice - this.exchange.minSharePrice
    gaps.push({
      metric: 'Share Price',
      current: Math.round(this.capTable.proposedSharePrice * 100) / 100,
      required: this.exchange.minSharePrice,
      gap: Math.round(priceGap * 100) / 100,
      gapPercentage: priceGap < 0 ? (Math.abs(priceGap) / this.exchange.minSharePrice) * 100 : 0,
      status: priceGap >= 0 ? 'compliant' : priceGap > this.exchange.minSharePrice * -0.1 ? 'warning' : 'critical',
    })

    // Offering size gap
    const minOffering =
      this.exchange.country === 'Canada' ? this.exchange.minOfferingCAD : this.exchange.minOfferingUSD
    const offeringGap = this.capTable.proposedOfferingSize - minOffering
    gaps.push({
      metric: `Offering Size (${this.exchange.currency}M)`,
      current: this.capTable.proposedOfferingSize,
      required: minOffering,
      gap: offeringGap,
      gapPercentage: offeringGap < 0 ? (Math.abs(offeringGap) / minOffering) * 100 : 0,
      status: offeringGap >= 0 ? 'compliant' : 'critical',
    })

    return gaps
  }

  /**
   * Process resolutions
   */
  private processResolutions() {
    const required = this.exchange.requiredResolutions
    const completed = this.capTable.completedResolutions || []

    const pending = required.filter((r) => !completed.includes(r))

    return {
      completed,
      pending,
      total: required.length,
    }
  }

  /**
   * Process consents
   */
  private processConsents() {
    const required = this.exchange.requiredConsents
    const completed = this.capTable.completedConsents || []

    const pending = required.filter((c) => !completed.includes(c))

    return {
      completed,
      pending,
      total: required.length,
    }
  }

  /**
   * Calculate overall compliance score (0-100)
   */
  private calculateComplianceScore(): number {
    if (this.violations.length === 0) return 100

    let score = 100
    for (const violation of this.violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 25
          break
        case 'error':
          score -= 15
          break
        case 'warning':
          score -= 5
          break
        case 'info':
          // No deduction
          break
      }
    }

    return Math.max(0, score)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a listing readiness report for a company
 */
export function generateListingReport(
  exchangeCode: ExchangeCode,
  capTable: CapTableData
): ListingReadinessReport {
  const engine = new ListingRulesEngine(exchangeCode, capTable)
  return engine.validate()
}

/**
 * Compare multiple exchanges for a company
 */
export function compareExchangeReadiness(
  exchanges: ExchangeCode[],
  capTable: CapTableData
): ListingReadinessReport[] {
  return exchanges.map((exchange) => generateListingReport(exchange, capTable))
}

/**
 * Get formatted violation summary
 */
export function formatViolationSummary(violations: RuleViolation[]): string {
  const bySeverity = violations.reduce(
    (acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1
      return acc
    },
    {} as Record<ViolationSeverity, number>
  )

  const lines = ['Violation Summary:']
  if (bySeverity.critical) lines.push(`  Critical: ${bySeverity.critical}`)
  if (bySeverity.error) lines.push(`  Errors: ${bySeverity.error}`)
  if (bySeverity.warning) lines.push(`  Warnings: ${bySeverity.warning}`)
  if (bySeverity.info) lines.push(`  Info: ${bySeverity.info}`)

  return lines.join('\n')
}

/**
 * Get formatted gap summary
 */
export function formatGapSummary(gaps: GapAnalysis[]): string {
  const lines = ['Gap Analysis:']
  for (const gap of gaps) {
    const status = gap.gap < 0 ? `SHORTFALL: ${Math.abs(gap.gap)}` : `SURPLUS: ${gap.gap}`
    lines.push(`  ${gap.metric}: ${status} (Current: ${gap.current}, Required: ${gap.required})`)
  }
  return lines.join('\n')
}

/**
 * Export report to JSON
 */
export function exportReportJSON(report: ListingReadinessReport): string {
  return JSON.stringify(report, null, 2)
}
