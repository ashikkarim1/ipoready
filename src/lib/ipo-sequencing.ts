/**
 * IPO Sequencing Validation Rules
 * 
 * Defines the optimal order of IPO preparation tasks and validates
 * whether a company's milestone completion follows best practices.
 * Rules vary by exchange as regulatory requirements differ.
 */

export type RuleSeverity = 'error' | 'warning'
export type Exchange = 'TSX' | 'NASDAQ' | 'NYSE' | 'TSXV' | 'CSE' | 'OTC' | 'JSE'

export interface SequencingRule {
  id: string
  rule: string
  description: string
  prerequisiteTask: string
  dependentTask: string
  severity: RuleSeverity
  applicableExchanges: Exchange[]
  daysBeforeDependent?: number // Min days after prerequisite before dependent should start
}

export interface SequencingViolation {
  ruleId: string
  companyId: string
  severity: RuleSeverity
  message: string
  prerequisiteStatus: 'not_started' | 'in_progress' | 'complete'
  dependentStatus: 'not_started' | 'in_progress' | 'complete'
  prerequisiteDate?: Date
  dependentDate?: Date
  daysOutOfOrder?: number
}

/**
 * Global sequencing rules applicable across all exchanges
 */
const GLOBAL_SEQUENCING_RULES: SequencingRule[] = [
  {
    id: 'corp_structure_before_audit',
    rule: 'Corporate structure must be finalized before initiating financial audit',
    description: 'Auditors need clear corporate hierarchy, ownership structure, and equity distribution',
    prerequisiteTask: 'Finalize Corporate Structure (Cap Table, Articles, Bylaws)',
    dependentTask: 'Begin Financial Audit',
    severity: 'error',
    applicableExchanges: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE'],
    daysBeforeDependent: 14,
  },
  {
    id: 'auditor_selection_before_audit',
    rule: 'Big 4 or equivalent auditor must be selected before financial audit phase',
    description: 'Selected auditor must be engaged and kickoff meeting completed',
    prerequisiteTask: 'Select and Engage Auditor',
    dependentTask: 'Begin Financial Audit',
    severity: 'error',
    applicableExchanges: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE'],
    daysBeforeDependent: 7,
  },
  {
    id: 'legal_docs_before_filing',
    rule: 'Legal review and drafting should start before regulatory filing phase',
    description: 'Articles of incorporation, bylaws, and disclosure documents must be reviewed by securities counsel',
    prerequisiteTask: 'Legal Review (Articles, Bylaws, Stock Plans)',
    dependentTask: 'Begin Regulatory Filing',
    severity: 'warning',
    applicableExchanges: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE'],
    daysBeforeDependent: 21,
  },
  {
    id: 'board_before_roadshow',
    rule: 'Board should be substantially complete before roadshow phase',
    description: 'Investor relations requires stable, experienced board; at least 50% seats filled',
    prerequisiteTask: 'Form Board of Directors',
    dependentTask: 'Begin Investor Roadshow',
    severity: 'warning',
    applicableExchanges: ['NASDAQ', 'NYSE', 'TSX'],
    daysBeforeDependent: 30,
  },
  {
    id: 'cfo_before_roadshow',
    rule: 'CFO must be hired before investor roadshow',
    description: 'Investors expect professional financial leadership during roadshow',
    prerequisiteTask: 'Hire Chief Financial Officer',
    dependentTask: 'Begin Investor Roadshow',
    severity: 'error',
    applicableExchanges: ['NASDAQ', 'NYSE', 'TSX'],
  },
  {
    id: 'financial_controls_before_audit',
    rule: 'Financial controls review should precede financial audit',
    description: 'Internal audit of controls (SOX 404 prep for US exchanges) must be completed before external audit',
    prerequisiteTask: 'Establish Financial Controls (SOX 404 Prep)',
    dependentTask: 'Begin Financial Audit',
    severity: 'warning',
    applicableExchanges: ['NASDAQ', 'NYSE'],
    daysBeforeDependent: 60,
  },
  {
    id: 'ceo_compensation_before_proxy',
    rule: 'CEO compensation structure must be finalized before proxy circular drafting',
    description: 'Investors need clear understanding of management compensation from day one',
    prerequisiteTask: 'Determine Executive Compensation Structure',
    dependentTask: 'Draft Proxy Statement/Circular',
    severity: 'warning',
    applicableExchanges: ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE'],
  },
]

/**
 * Exchange-specific sequencing rules (stricter requirements for major exchanges)
 */
const EXCHANGE_SPECIFIC_RULES: Record<Exchange, SequencingRule[]> = {
  TSX: [
    {
      id: 'tsx_audit_committee_before_filing',
      rule: 'TSX: Audit committee must be established before regulatory filing',
      description: 'TSX requires active audit committee for all listed companies',
      prerequisiteTask: 'Form Board of Directors (Audit Committee)',
      dependentTask: 'File Initial TSX Application',
      severity: 'error',
      applicableExchanges: ['TSX'],
      daysBeforeDependent: 14,
    },
    {
      id: 'tsx_ceo_declaration_before_filing',
      rule: 'TSX: CEO/CFO declarations must be completed before filing',
      description: 'Certification of financial statements required by TSX rules',
      prerequisiteTask: 'Prepare Financial Statements & Audit',
      dependentTask: 'File Initial TSX Application',
      severity: 'error',
      applicableExchanges: ['TSX'],
      daysBeforeDependent: 7,
    },
  ],
  NASDAQ: [
    {
      id: 'nasdaq_audit_committee_before_listing',
      rule: 'NASDAQ: Audit committee with financial expert required before listing',
      description: 'NASDAQ listing rules require independent audit committee with certified financial expert',
      prerequisiteTask: 'Form Board of Directors (Independent Audit Committee)',
      dependentTask: 'NASDAQ Listing Approval',
      severity: 'error',
      applicableExchanges: ['NASDAQ'],
      daysBeforeDependent: 30,
    },
    {
      id: 'nasdaq_compliance_cert_before_listing',
      rule: 'NASDAQ: Compliance certifications must be complete before trading begins',
      description: 'CEO and CFO SOX certifications required; XBRL compliance verified',
      prerequisiteTask: 'Complete SOX 404 Financial Controls Assessment',
      dependentTask: 'NASDAQ Listing Approval',
      severity: 'error',
      applicableExchanges: ['NASDAQ'],
      daysBeforeDependent: 14,
    },
    {
      id: 'nasdaq_market_maker_commitment_before_roadshow',
      rule: 'NASDAQ: Market maker commitment should be obtained before aggressive roadshow',
      description: 'At least 2 market makers typically commit before pre-roadshow marketing',
      prerequisiteTask: 'Secure NASDAQ Market Maker Commitments',
      dependentTask: 'Begin Investor Roadshow',
      severity: 'warning',
      applicableExchanges: ['NASDAQ'],
      daysBeforeDependent: 21,
    },
  ],
  NYSE: [
    {
      id: 'nyse_audit_committee_before_listing',
      rule: 'NYSE: Audit committee with expertise required before listing',
      description: 'NYSE requires experienced independent audit committee',
      prerequisiteTask: 'Form Board of Directors (Independent Audit Committee)',
      dependentTask: 'NYSE Listing Approval',
      severity: 'error',
      applicableExchanges: ['NYSE'],
      daysBeforeDependent: 30,
    },
    {
      id: 'nyse_ceo_lit_before_bell',
      rule: 'NYSE: CEO must ring opening bell; photo clearance required 2 weeks before',
      description: 'Symbolic listing ceremony requires advance coordination',
      prerequisiteTask: 'Coordinate with NYSE Communications',
      dependentTask: 'Trading Begins (Open)',
      severity: 'warning',
      applicableExchanges: ['NYSE'],
      daysBeforeDependent: 14,
    },
  ],
  TSXV: [
    {
      id: 'tsxv_minimal_board',
      rule: 'TSXV: Minimum board of directors (1 if not exempt, typically 3 for credibility)',
      description: 'TSXV has lighter requirements than TSX but investors expect governance',
      prerequisiteTask: 'Form Board of Directors (Minimum)',
      dependentTask: 'Begin TSXV Listing Phase',
      severity: 'warning',
      applicableExchanges: ['TSXV'],
      daysBeforeDependent: 7,
    },
  ],
  CSE: [
    {
      id: 'cse_basic_governance',
      rule: 'CSE: Basic corporate governance structure required',
      description: 'CSE has lighter requirements than TSX/TSXV; minimal formal governance accepted',
      prerequisiteTask: 'Establish Basic Corporate Governance',
      dependentTask: 'Begin CSE Listing Phase',
      severity: 'warning',
      applicableExchanges: ['CSE'],
      daysBeforeDependent: 0,
    },
  ],
  OTC: [
    {
      id: 'otc_sec_compliance',
      rule: 'OTC: SEC filing (Form 10 or similar) should precede active trading',
      description: 'OTC companies must file with SEC; filing forms required before pink sheet trading',
      prerequisiteTask: 'File SEC Form 10 or Form 10-K',
      dependentTask: 'Begin OTC Trading Phase',
      severity: 'warning',
      applicableExchanges: ['OTC'],
      daysBeforeDependent: 14,
    },
  ],
  JSE: [
    {
      id: 'jse_regulatory_approval',
      rule: 'JSE: Regulatory approval from FSA (Japan Financial Services Agency) required',
      description: 'Japanese IPOs require government financial regulator approval',
      prerequisiteTask: 'Obtain FSA Approval',
      dependentTask: 'Begin JSE Listing Phase',
      severity: 'error',
      applicableExchanges: ['JSE'],
      daysBeforeDependent: 14,
    },
  ],
}

/**
 * Get all applicable rules for a given exchange
 */
export function getRulesForExchange(exchange: Exchange): SequencingRule[] {
  const exchangeRules = EXCHANGE_SPECIFIC_RULES[exchange] || []
  const applicableGlobal = GLOBAL_SEQUENCING_RULES.filter((rule) =>
    rule.applicableExchanges.includes(exchange)
  )
  return [...applicableGlobal, ...exchangeRules]
}

/**
 * Validate milestone sequencing for a company
 * 
 * @param completedTasks - Map of task names to completion dates
 * @param exchange - Target exchange
 * @returns Array of sequencing violations found
 */
export function validateMilestoneSequence(
  completedTasks: Map<string, Date | null>,
  exchange: Exchange
): SequencingViolation[] {
  const rules = getRulesForExchange(exchange)
  const violations: SequencingViolation[] = []

  for (const rule of rules) {
    const prerequisiteDate = completedTasks.get(rule.prerequisiteTask)
    const dependentDate = completedTasks.get(rule.dependentTask)

    // Determine task statuses
    const prerequisiteStatus: 'not_started' | 'in_progress' | 'complete' = prerequisiteDate
      ? 'complete'
      : 'not_started'
    const dependentStatus: 'not_started' | 'in_progress' | 'complete' = dependentDate
      ? 'complete'
      : 'not_started'

    // Violation: dependent started/complete but prerequisite not complete
    if (dependentStatus === 'complete' && prerequisiteStatus !== 'complete') {
      violations.push({
        ruleId: rule.id,
        companyId: '', // Will be set by caller
        severity: rule.severity,
        message: rule.rule,
        prerequisiteStatus,
        dependentStatus,
        dependentDate,
        daysOutOfOrder: prerequisiteDate ? Math.floor((dependentDate!.getTime() - prerequisiteDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined,
      })
    }

    // Warning: prerequisite complete but dependent not yet started (may be intended)
    // Only report if daysBeforeDependent has passed
    if (
      prerequisiteStatus === 'complete' &&
      dependentStatus === 'not_started' &&
      rule.daysBeforeDependent !== undefined
    ) {
      const daysSincePrerequsite = Math.floor(
        (new Date().getTime() - prerequisiteDate!.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSincePrerequsite > rule.daysBeforeDependent && rule.severity === 'warning') {
        violations.push({
          ruleId: rule.id,
          companyId: '', // Will be set by caller
          severity: rule.severity,
          message: `${rule.rule} (${daysSincePrerequsite} days since prerequisite)`,
          prerequisiteStatus,
          dependentStatus,
          prerequisiteDate,
          daysOutOfOrder: daysSincePrerequsite,
        })
      }
    }
  }

  return violations
}

/**
 * Get human-readable descriptions of all sequencing rules
 */
export function getSequencingRuleDocumentation(): Record<Exchange, SequencingRule[]> {
  const result: Record<Exchange, SequencingRule[]> = {} as Record<Exchange, SequencingRule[]>
  const exchanges: Exchange[] = ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE']

  for (const exchange of exchanges) {
    result[exchange] = getRulesForExchange(exchange)
  }

  return result
}
