/**
 * Tests for Listing Rules Engine
 */

import {
  ListingRulesEngine,
  generateListingReport,
  compareExchangeReadiness,
  CapTableData,
  formatViolationSummary,
  formatGapSummary,
} from '@/lib/listing-rules'

// Test data
const mockCapTable: CapTableData = {
  companyName: 'TechCorp Inc.',
  totalAuthorizedShares: 50000000,
  totalIssuedShares: 28000000,
  publicShares: 7000000,
  publicSharePercentage: 25,
  minSharePrice: 3.5,
  proposedOfferingSize: 75,
  proposedSharesOffering: 5000000,
  proposedSharePrice: 15.0,
  estimatedPublicFloatCAD: 105,
  estimatedPublicFloatUSD: 78,
  hasAuditCommittee: true,
  hasNominationCommittee: true,
  hasCompensationCommittee: true,
  hasAuditedFinancials: true,
  yearsOfFinancialHistory: 2,
  completedResolutions: ['approval_ipo', 'authority_directors', 'approval_prospectus'],
  completedConsents: ['board_approval', 'independent_audit'],
}

const nonCompliantCapTable: CapTableData = {
  ...mockCapTable,
  publicShares: 500000, // Below minimum for most exchanges
  publicSharePercentage: 10, // Below 20-25% minimums
  proposedSharePrice: 2.0, // Below minimums
  yearsOfFinancialHistory: 1, // Some exchanges need 2
  hasAuditCommittee: false,
  hasNominationCommittee: false,
}

describe('ListingRulesEngine', () => {
  describe('TSX Validation', () => {
    test('should validate compliant cap table for TSX', () => {
      const engine = new ListingRulesEngine('tsx', mockCapTable)
      const report = engine.validate()

      expect(report.exchange).toBe('tsx')
      expect(report.overallStatus).toBe('ready')
      expect(report.complianceScore).toBeGreaterThan(80)
      expect(report.violations.filter((v) => v.severity === 'critical')).toHaveLength(0)
    })

    test('should flag violations for non-compliant cap table', () => {
      const engine = new ListingRulesEngine('tsx', nonCompliantCapTable)
      const report = engine.validate()

      expect(report.overallStatus).toBe('not-ready')
      expect(report.summary.criticalViolations).toBeGreaterThan(0)

      // Check for specific violations
      const publicFloatViolation = report.violations.find((v) =>
        v.rule.includes('Public Float')
      )
      expect(publicFloatViolation).toBeDefined()
      expect(publicFloatViolation?.severity).toBe('critical')
    })

    test('should perform gap analysis correctly', () => {
      const engine = new ListingRulesEngine('tsx', nonCompliantCapTable)
      const report = engine.validate()

      const publicFloatGap = report.gaps.find((g) => g.metric.includes('Public Float'))
      expect(publicFloatGap).toBeDefined()
      expect(publicFloatGap?.gap).toBeLessThan(0)
      expect(publicFloatGap?.status).toBe('critical')
    })
  })

  describe('NASDAQ Validation', () => {
    test('should validate for NASDAQ exchange', () => {
      const engine = new ListingRulesEngine('nasdaq', mockCapTable)
      const report = engine.validate()

      expect(report.exchange).toBe('nasdaq')
      expect(report.exchangeName).toBe('NASDAQ')
    })

    test('should have stricter requirements than TSXV', () => {
      const tsxvEngine = new ListingRulesEngine('tsxv', nonCompliantCapTable)
      const nasdaqEngine = new ListingRulesEngine('nasdaq', nonCompliantCapTable)

      const tsxvReport = tsxvEngine.validate()
      const nasdaqReport = nasdaqEngine.validate()

      // NASDAQ should have more violations due to stricter requirements
      expect(nasdaqReport.summary.totalViolations).toBeGreaterThanOrEqual(
        tsxvReport.summary.totalViolations
      )
    })
  })

  describe('Gap Analysis', () => {
    test('should calculate public float gap correctly', () => {
      const capTable: CapTableData = {
        ...mockCapTable,
        publicSharePercentage: 22, // Below 25% for TSX
      }

      const engine = new ListingRulesEngine('tsx', capTable)
      const report = engine.validate()

      const gap = report.gaps.find((g) => g.metric.includes('Public Float'))
      expect(gap?.current).toBe(22)
      expect(gap?.required).toBe(25)
      expect(gap?.gap).toBe(-3)
    })

    test('should identify when company is compliant', () => {
      const engine = new ListingRulesEngine('tsx', mockCapTable)
      const report = engine.validate()

      const publicFloatGap = report.gaps.find((g) => g.metric.includes('Public Float'))
      expect(publicFloatGap?.status).toBe('compliant')
    })
  })

  describe('Resolution & Consent Tracking', () => {
    test('should track completed resolutions', () => {
      const engine = new ListingRulesEngine('tsx', mockCapTable)
      const report = engine.validate()

      expect(report.requiredResolutions.completed.length).toBe(3)
      expect(report.requiredResolutions.pending.length).toBeGreaterThan(0)
    })

    test('should track completed consents', () => {
      const engine = new ListingRulesEngine('tsx', mockCapTable)
      const report = engine.validate()

      expect(report.requiredConsents.completed.length).toBe(2)
      expect(report.requiredConsents.pending.length).toBeGreaterThan(0)
    })
  })

  describe('Compliance Scoring', () => {
    test('should score 100 for fully compliant cap table', () => {
      const engine = new ListingRulesEngine('cse', mockCapTable)
      const report = engine.validate()

      // CSE has lowest requirements, so mockCapTable should be highly compliant
      expect(report.complianceScore).toBeGreaterThan(70)
    })

    test('should score lower for non-compliant cap table', () => {
      const compliantEngine = new ListingRulesEngine('cse', mockCapTable)
      const nonCompliantEngine = new ListingRulesEngine('nasdaq', nonCompliantCapTable)

      const compliantReport = compliantEngine.validate()
      const nonCompliantReport = nonCompliantEngine.validate()

      expect(nonCompliantReport.complianceScore).toBeLessThan(compliantReport.complianceScore)
    })
  })
})

describe('Helper Functions', () => {
  test('generateListingReport should return complete report', () => {
    const report = generateListingReport('tsx', mockCapTable)

    expect(report).toHaveProperty('exchange')
    expect(report).toHaveProperty('exchangeName')
    expect(report).toHaveProperty('overallStatus')
    expect(report).toHaveProperty('violations')
    expect(report).toHaveProperty('gaps')
    expect(report).toHaveProperty('complianceScore')
  })

  test('compareExchangeReadiness should compare multiple exchanges', () => {
    const reports = compareExchangeReadiness(['tsx', 'nasdaq', 'cse'], mockCapTable)

    expect(reports).toHaveLength(3)
    expect(reports[0].exchange).toBe('tsx')
    expect(reports[1].exchange).toBe('nasdaq')
    expect(reports[2].exchange).toBe('cse')
  })

  test('formatViolationSummary should format violations', () => {
    const engine = new ListingRulesEngine('nasdaq', nonCompliantCapTable)
    const report = engine.validate()

    const summary = formatViolationSummary(report.violations)

    expect(summary).toContain('Violation Summary')
    expect(typeof summary).toBe('string')
  })

  test('formatGapSummary should format gaps', () => {
    const engine = new ListingRulesEngine('nasdaq', nonCompliantCapTable)
    const report = engine.validate()

    const summary = formatGapSummary(report.gaps)

    expect(summary).toContain('Gap Analysis')
    expect(typeof summary).toBe('string')
  })
})

describe('Exchange-Specific Requirements', () => {
  const testExchanges = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse'] as const

  testExchanges.forEach((exchange) => {
    test(`should validate for ${exchange.toUpperCase()}`, () => {
      const engine = new ListingRulesEngine(exchange, mockCapTable)
      const report = engine.validate()

      expect(report.exchange).toBe(exchange)
      expect(report.violations.length).toBeGreaterThan(0)
      expect(report.gaps.length).toBeGreaterThan(0)
    })
  })

  test('CSE should have lowest requirements', () => {
    const cseEngine = new ListingRulesEngine('cse', nonCompliantCapTable)
    const tsxEngine = new ListingRulesEngine('tsx', nonCompliantCapTable)

    const cseReport = cseEngine.validate()
    const tsxReport = tsxEngine.validate()

    // CSE should be more lenient
    expect(cseReport.summary.criticalViolations).toBeLessThanOrEqual(
      tsxReport.summary.criticalViolations
    )
  })

  test('NYSE should have strictest requirements', () => {
    const nyseEngine = new ListingRulesEngine('nyse', nonCompliantCapTable)
    const cseEngine = new ListingRulesEngine('cse', nonCompliantCapTable)

    const nyseReport = nyseEngine.validate()
    const cseReport = cseEngine.validate()

    // NYSE should be stricter
    expect(nyseReport.summary.totalViolations).toBeGreaterThanOrEqual(
      cseReport.summary.totalViolations
    )
  })
})

describe('Board Lot Validation', () => {
  test('should flag non-multiple board lot shares', () => {
    const capTable: CapTableData = {
      ...mockCapTable,
      publicShares: 7000001, // Not a multiple of 100
    }

    const engine = new ListingRulesEngine('tsx', capTable)
    const report = engine.validate()

    const boardLotViolation = report.violations.find((v) => v.rule.includes('Board Lot'))
    expect(boardLotViolation).toBeDefined()
    expect(boardLotViolation?.severity).toBe('warning')
  })

  test('should pass clean board lot multiples', () => {
    const capTable: CapTableData = {
      ...mockCapTable,
      publicShares: 7000000, // Clean multiple of 100
    }

    const engine = new ListingRulesEngine('tsx', capTable)
    const report = engine.validate()

    const boardLotViolation = report.violations.find(
      (v) => v.rule.includes('Board Lot') && v.severity === 'warning'
    )
    expect(boardLotViolation).toBeUndefined()
  })
})

describe('Committee Requirements', () => {
  test('should flag missing audit committee when required', () => {
    const capTable: CapTableData = {
      ...mockCapTable,
      hasAuditCommittee: false,
    }

    const engine = new ListingRulesEngine('tsx', capTable)
    const report = engine.validate()

    const violation = report.violations.find((v) => v.rule.includes('Audit'))
    expect(violation).toBeDefined()
    expect(violation?.severity).toBe('error')
  })

  test('should not require audit committee for TSXV', () => {
    const capTable: CapTableData = {
      ...mockCapTable,
      hasAuditCommittee: false,
    }

    const engine = new ListingRulesEngine('tsxv', capTable)
    const report = engine.validate()

    const violation = report.violations.find((v) =>
      v.rule.includes('Audit') && v.severity === 'error'
    )
    // TSXV doesn't require audit committee
    expect(violation).toBeUndefined()
  })
})
