/**
 * IPO Milestone Sequencing Validation
 * Validates that IPO tasks are being completed in the optimal sequence
 * and alerts on out-of-order activities
 */

import { sql } from '@/lib/db'

interface SequencingRule {
  id: string
  rule: string
  severity: 'error' | 'warning'
  requiredTaskPhase: string // Phase that must be done first
  blockedTaskPhase: string // Phase that shouldn't start until above is done
  validateFn: (tasks: Record<string, TaskPhaseInfo>) => boolean
}

interface TaskPhaseInfo {
  total: number
  completed: number
  startedAt: string | null
  completedAt: string | null
}

interface SequencingViolation {
  id: string
  companyId: string
  rule: string
  severity: 'error' | 'warning'
  resolvedAt: string | null
  createdAt: string
}

// Exchange-specific sequencing rules
const UNIVERSAL_SEQUENCING_RULES: SequencingRule[] = [
  {
    id: 'auditor-before-audit',
    rule: 'Auditor must be selected before Financial Audit phase begins',
    severity: 'error',
    requiredTaskPhase: 'legal_documentation', // Where auditor selection typically happens
    blockedTaskPhase: 'financial_audit',
    validateFn: (tasks) => {
      // If financial_audit has started, ensure auditor-related tasks are done
      return true // Will be checked via company.auditor_selected flag
    },
  },
  {
    id: 'corp-restructuring-before-legal',
    rule: 'Corporate restructuring should be largely complete before legal documentation',
    severity: 'warning',
    requiredTaskPhase: 'corporate_restructuring',
    blockedTaskPhase: 'legal_documentation',
    validateFn: (tasks) => {
      const restructuring = tasks['corporate_restructuring']
      const legal = tasks['legal_documentation']

      if (!legal || legal.startedAt === null) return true // Legal hasn't started, no violation
      if (!restructuring) return true // No restructuring data

      // Legal documentation shouldn't start until >60% of restructuring is done
      const restructuringProgress = restructuring.total > 0 ? restructuring.completed / restructuring.total : 0
      return restructuringProgress >= 0.6
    },
  },
  {
    id: 'legal-before-regulatory',
    rule: 'Legal documentation should be substantially complete before regulatory filing',
    severity: 'warning',
    requiredTaskPhase: 'legal_documentation',
    blockedTaskPhase: 'regulatory_filing',
    validateFn: (tasks) => {
      const legal = tasks['legal_documentation']
      const regulatory = tasks['regulatory_filing']

      if (!regulatory || regulatory.startedAt === null) return true
      if (!legal) return true

      const legalProgress = legal.total > 0 ? legal.completed / legal.total : 0
      return legalProgress >= 0.8
    },
  },
  {
    id: 'board-before-roadshow',
    rule: 'Board should be formed before marketing & roadshow phase',
    severity: 'warning',
    requiredTaskPhase: 'corporate_restructuring',
    blockedTaskPhase: 'marketing_roadshow',
    validateFn: (tasks) => {
      // This is checked via company.board_size flag
      return true
    },
  },
  {
    id: 'cap-table-before-audit',
    rule: 'Cap table should be cleaned before financial audit',
    severity: 'error',
    requiredTaskPhase: 'corporate_restructuring',
    blockedTaskPhase: 'financial_audit',
    validateFn: (tasks) => {
      // This would require tracking cap table cleanup as a specific task
      return true
    },
  },
  {
    id: 'audit-before-roadshow',
    rule: 'Financial audit must be substantially complete before roadshow',
    severity: 'error',
    requiredTaskPhase: 'financial_audit',
    blockedTaskPhase: 'marketing_roadshow',
    validateFn: (tasks) => {
      const audit = tasks['financial_audit']
      const roadshow = tasks['marketing_roadshow']

      if (!roadshow || roadshow.startedAt === null) return true
      if (!audit) return true

      const auditProgress = audit.total > 0 ? audit.completed / audit.total : 0
      return auditProgress >= 0.9
    },
  },
  {
    id: 'regulatory-before-listing-application',
    rule: 'Regulatory filing must be substantially complete before listing application',
    severity: 'error',
    requiredTaskPhase: 'regulatory_filing',
    blockedTaskPhase: 'listing_application',
    validateFn: (tasks) => {
      const regulatory = tasks['regulatory_filing']
      const listing = tasks['listing_application']

      if (!listing || listing.startedAt === null) return true
      if (!regulatory) return true

      const regulatoryProgress = regulatory.total > 0 ? regulatory.completed / regulatory.total : 0
      return regulatoryProgress >= 0.9
    },
  },
  {
    id: 'no-post-listing-before-listing',
    rule: 'Post-listing tasks should not begin before listing application is filed',
    severity: 'warning',
    requiredTaskPhase: 'listing_application',
    blockedTaskPhase: 'post_listing',
    validateFn: (tasks) => {
      const listing = tasks['listing_application']
      const postListing = tasks['post_listing']

      if (!postListing || postListing.startedAt === null) return true
      if (!listing) return true

      // Post-listing shouldn't have significant progress until listing started
      const postListingProgress = postListing.total > 0 ? postListing.completed / postListing.total : 0
      return postListingProgress < 0.2 || listing.startedAt !== null
    },
  },
]

// Additional rules for specific exchanges
const EXCHANGE_SPECIFIC_RULES: Record<string, SequencingRule[]> = {
  nasdaq: [
    {
      id: 'nasdaq-sec-focus',
      rule: 'SEC compliance items should be prioritized in regulatory phase',
      severity: 'warning',
      requiredTaskPhase: 'regulatory_filing',
      blockedTaskPhase: 'marketing_roadshow',
      validateFn: () => true,
    },
  ],
  nyse: [
    {
      id: 'nyse-audit-early',
      rule: 'NYSE companies should begin audit process early (phase 3)',
      severity: 'warning',
      requiredTaskPhase: 'financial_audit',
      blockedTaskPhase: 'marketing_roadshow',
      validateFn: () => true,
    },
  ],
}

/**
 * Validate sequencing for a company and return violations
 */
export async function validateMilestoneSequence(companyId: string, exchange: string): Promise<SequencingViolation[]> {
  // Fetch task phase information
  const tasksByPhase = await sql`
    SELECT
      phase,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      MIN(CASE WHEN status != 'not_started' THEN created_at END) AS started_at,
      MAX(CASE WHEN status = 'completed' THEN updated_at END) AS completed_at
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  `

  const phases: Record<string, TaskPhaseInfo> = {}
  for (const row of tasksByPhase as any[]) {
    phases[row.phase] = {
      total: parseInt(row.total, 10),
      completed: parseInt(row.completed, 10),
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }
  }

  // Fetch company factors
  const company = (await sql`
    SELECT auditor_selected, board_size
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `)[0] as { auditor_selected: boolean; board_size: number } | undefined

  const violations: SequencingViolation[] = []

  // Check universal rules
  for (const rule of UNIVERSAL_SEQUENCING_RULES) {
    // Special handling for specific rules
    if (rule.id === 'auditor-before-audit' && company) {
      const auditPhase = phases['financial_audit']
      if (auditPhase && auditPhase.startedAt && !company.auditor_selected) {
        violations.push({
          id: `violation-${rule.id}-${Date.now()}`,
          companyId,
          rule: rule.rule,
          severity: rule.severity,
          resolvedAt: null,
          createdAt: new Date().toISOString(),
        })
      }
      continue
    }

    if (rule.id === 'board-before-roadshow' && company) {
      const roadshowPhase = phases['marketing_roadshow']
      if (roadshowPhase && roadshowPhase.startedAt && (company.board_size ?? 0) < 3) {
        violations.push({
          id: `violation-${rule.id}-${Date.now()}`,
          companyId,
          rule: rule.rule,
          severity: rule.severity,
          resolvedAt: null,
          createdAt: new Date().toISOString(),
        })
      }
      continue
    }

    // Standard validation
    if (!rule.validateFn(phases)) {
      violations.push({
        id: `violation-${rule.id}-${Date.now()}`,
        companyId,
        rule: rule.rule,
        severity: rule.severity,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Check exchange-specific rules
  const exchangeRules = EXCHANGE_SPECIFIC_RULES[exchange.toLowerCase()] ?? []
  for (const rule of exchangeRules) {
    if (!rule.validateFn(phases)) {
      violations.push({
        id: `violation-${rule.id}-${Date.now()}`,
        companyId,
        rule: rule.rule,
        severity: rule.severity,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Log violations to database
  for (const violation of violations) {
    try {
      await sql`
        INSERT INTO sequencing_violations (company_id, violation_rule, severity)
        VALUES (${companyId}, ${violation.rule}, ${violation.severity})
      `
    } catch (error) {
      console.error('Error logging sequencing violation:', error)
    }
  }

  return violations
}

/**
 * Get all active (unresolved) violations for a company
 */
export async function getActiveViolations(companyId: string): Promise<SequencingViolation[]> {
  const violations = await sql`
    SELECT id, company_id, violation_rule, severity, resolved_at, created_at
    FROM sequencing_violations
    WHERE company_id = ${companyId} AND resolved_at IS NULL
    ORDER BY created_at DESC
  `

  return (violations as any[]).map((v) => ({
    id: v.id,
    companyId: v.company_id,
    rule: v.violation_rule,
    severity: v.severity,
    resolvedAt: v.resolved_at,
    createdAt: v.created_at,
  }))
}

/**
 * Mark a violation as resolved
 */
export async function markViolationResolved(violationId: string) {
  await sql`
    UPDATE sequencing_violations
    SET resolved_at = NOW()
    WHERE id = ${violationId}
  `
}

/**
 * Get sequencing recommendations based on current progress
 */
export async function getSequencingRecommendations(companyId: string): Promise<string[]> {
  const tasksByPhase = await sql`
    SELECT
      phase,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) AS total
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  `

  const recommendations: string[] = []
  const phaseOrder = [
    'pre_planning',
    'corporate_restructuring',
    'financial_audit',
    'legal_documentation',
    'regulatory_filing',
    'marketing_roadshow',
    'listing_application',
    'post_listing',
  ]

  for (const row of tasksByPhase as any[]) {
    const progress = (parseInt(row.completed, 10) / parseInt(row.total, 10)) * 100
    const phaseIndex = phaseOrder.indexOf(row.phase)

    if (progress < 50) {
      recommendations.push(`Focus on completing ${row.phase}: ${Math.round(progress)}% done`)
    }

    // Suggest moving to next phase
    if (progress >= 80 && phaseIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[phaseIndex + 1]
      recommendations.push(`Consider beginning ${nextPhase} - ${row.phase} is 80% complete`)
    }
  }

  return recommendations
}
