/**
 * IPO Milestone Sequencing Validation
 * 
 * Validates that IPO tasks are completed in optimal sequence according to
 * regulatory requirements and market best practices. Detects out-of-order
 * activities that could delay listing or trigger regulator scrutiny.
 */

import { sql } from '@/lib/db'

export interface SequencingRule {
  id: string
  rule: string
  severity: 'error' | 'warning'
  description: string
  remediation: string
  applicableExchanges: string[] // Empty = all exchanges
}

export interface SequencingViolation {
  id: string
  companyId: string
  rule: string
  severity: 'error' | 'warning'
  description: string
  remediation: string
  createdAt: string
  resolvedAt: string | null
}

interface TaskPhaseInfo {
  total: number
  completed: number
  startedAt: string | null
  completedAt: string | null
}

// ============================================================
// UNIVERSAL SEQUENCING RULES (apply to all exchanges)
// ============================================================
export const IPO_SEQUENCING_RULES: SequencingRule[] = [
  {
    id: 'auditor-before-audit-phase',
    rule: 'Auditor selection before Financial Audit phase',
    severity: 'error',
    description:
      'A PCAOB/CPAB-registered audit firm must be selected before beginning the Financial Audit phase. Regulators will reject filings from unregistered audit firms.',
    remediation:
      'Engage a Big 4 or nationally-recognized audit firm. Ensure they are PCAOB (US) or CPAB (Canada) registered. Allow 1-2 weeks for firm selection and engagement letter execution.',
    applicableExchanges: [],
  },

  {
    id: 'cap-table-cleanup-before-audit',
    rule: 'Cap table cleanup before Financial Audit',
    severity: 'error',
    description:
      'Cap table must be cleaned, consolidated, and validated before audit firm begins work. Auditors will refuse to begin fieldwork until cap table is audit-ready.',
    remediation:
      'Complete cap table reconciliation: verify all share classes, options, warrants, and convertible instruments. Resolve any inconsistencies. Allow 4-8 weeks for cleanup.',
    applicableExchanges: [],
  },

  {
    id: 'board-formation-before-roadshow',
    rule: 'Board formed (3+ directors minimum) before Roadshow',
    severity: 'warning',
    description:
      'At least 3 directors should be appointed before investor meetings begin. Sophisticated investors will request board list; incomplete governance signals unprepared company.',
    remediation:
      'Appoint independent directors; focus on sector expertise and public company experience. Allow 4-6 weeks for director recruitment and onboarding.',
    applicableExchanges: [],
  },

  {
    id: 'corporate-restructuring-before-legal-docs',
    rule: 'Corporate restructuring substantially complete before Legal Documentation',
    severity: 'warning',
    description:
      'Major structural changes (subsidiary consolidation, equity reorg, IP migration) should be finalized before legal documentation begins. Restructuring mid-IPO creates complexity and delays.',
    remediation:
      'Complete all corporate restructuring 6-8 weeks before legal documentation. Ensure tax advisor and securities counsel coordinate on timing.',
    applicableExchanges: [],
  },

  {
    id: 'accounting-policies-finalized-before-audit',
    rule: 'Accounting policies finalized before Financial Audit',
    severity: 'error',
    description:
      'Accounting policy elections (revenue recognition, lease treatment, stock-based comp) must be final before audit begins. Mid-audit policy changes force audit restarts.',
    remediation:
      'Work with auditor to finalize all policies. Document in accounting policy memo. Implement in all historical periods before audit kickoff.',
    applicableExchanges: [],
  },

  {
    id: 'legal-docs-before-regulatory-filing',
    rule: 'Legal documentation substantially complete before Regulatory Filing',
    severity: 'warning',
    description:
      'Core legal documents (articles, bylaws, resolutions, shareholder agreements) should be 80%+ complete before filing. Last-minute legal changes slow regulatory review.',
    remediation:
      'Target 80% legal completion 2-3 weeks before filing. Ensure securities counsel and company counsel coordinate. Reserve final 20% for filed feedback.',
    applicableExchanges: [],
  },

  {
    id: 'audit-complete-before-roadshow',
    rule: 'Financial Audit substantially complete (90%+) before Roadshow',
    severity: 'error',
    description:
      'Audit must be 90%+ complete before investor presentations begin. Incomplete audit signals weak financial controls; investors lose confidence.',
    remediation:
      'Ensure all audit fieldwork, management representations, and partner reviews are complete before roadshow kickoff. Allow 1-2 weeks for post-roadshow audit wrap-up.',
    applicableExchanges: [],
  },

  {
    id: 'audit-committee-formed-before-audit',
    rule: 'Audit Committee formed before Financial Audit phase',
    severity: 'warning',
    description:
      'An audit committee (min 1 independent director with accounting expertise) should be in place before audit fieldwork begins. Auditors require committee interaction.',
    remediation:
      'Appoint audit committee chair (ideally with CFO/accounting background). Hold kickoff meeting with auditor. Should be done 4-6 weeks before audit fieldwork.',
    applicableExchanges: [],
  },

  {
    id: 'regulatory-filing-before-listing-app',
    rule: 'Regulatory filing substantially complete (90%+) before Listing Application',
    severity: 'error',
    description:
      'SEC S-1/SEDAR2 filing must be 90%+ complete and substantially commented before exchange listing application. Late regulatory feedback will delay exchange review.',
    remediation:
      'Achieve final SEC/regulator comments 1-2 weeks before target listing app date. Coordinate with counsel and company to incorporate feedback quickly.',
    applicableExchanges: [],
  },

  {
    id: 'exchange-listing-standards-confirmed',
    rule: 'Exchange listing standards confirmed (minimum financial, governance)',
    severity: 'error',
    description:
      'Company must meet exchange minimum standards (revenue, profitability, stockholders equity, public float) before listing application. Non-compliance halts application.',
    remediation:
      'Review exchange-specific minimums early (Phase 2). If marginal, raise bridge capital. Confirm compliance with exchange counsel before filing listing app.',
    applicableExchanges: [],
  },

  {
    id: 'insurance-and-indemnification-ready',
    rule: 'D&O insurance and indemnification agreements in place',
    severity: 'warning',
    description:
      'Directors and officers insurance and indemnification agreements should be finalized before public offering. Incomplete coverage deters director recruitment.',
    remediation:
      'Engage insurance broker 8-10 weeks before IPO. Lock in premium quotes by 4 weeks pre-close. Ensure indemnification limits match D&O coverage.',
    applicableExchanges: [],
  },

  {
    id: 'compliance-certifications-before-close',
    rule: 'SOX 302/906 certifications and internal control assessment ready',
    severity: 'error',
    description:
      'CEO/CFO must be prepared to certify financial statements and internal controls under SOX 302/906. Incomplete ICFR will block close.',
    remediation:
      'Begin ICFR scoping 10-12 weeks pre-close. Run control testing before financial close. Have SOX certifications drafted 1 week pre-close.',
    applicableExchanges: [],
  },

  {
    id: 'transfer-agent-engaged-before-close',
    rule: 'Transfer agent and stock plan administration engaged before Close',
    severity: 'warning',
    description:
      'Transfer agent, stock plan administrator, and DWAC provider must be engaged and systems set up before IPO close. Post-close stock issuance requires these.',
    remediation:
      'Select transfer agent by start of Roadshow phase. Complete setup 3-4 weeks before expected close. Coordinate with underwriter on final share count.',
    applicableExchanges: [],
  },

  {
    id: 'disclosure-documents-prior-to-filing',
    rule: 'Disclosure documents (MD&A, risk factors, use of proceeds) drafted before Filing',
    severity: 'error',
    description:
      'Core disclosure sections (MD&A, risk factors, business description, use of proceeds) must be drafted and reviewed by counsel before filing. Filing delays from incomplete drafting are common.',
    remediation:
      'Begin MD&A drafting 8-10 weeks pre-filing. Complete first drafts 4 weeks before filing. Allow 2-3 weeks for counsel review and company revision.',
    applicableExchanges: [],
  },

  {
    id: 'underwriter-due-diligence-before-roadshow',
    rule: 'Underwriter due diligence materials prepared before Roadshow',
    severity: 'warning',
    description:
      'All due diligence materials (corporate documents, financial models, litigation search, officer bios) should be compiled before roadshow begins. Investor questions will test preparedness.',
    remediation:
      'Create due diligence data room 2-3 weeks before roadshow kickoff. Populate with all legal, financial, and operational documents. Update weekly during roadshow.',
    applicableExchanges: [],
  },

  {
    id: 'investor-relations-plan-before-roadshow',
    rule: 'Post-IPO Investor Relations plan drafted before Roadshow',
    severity: 'warning',
    description:
      'Post-IPO IR plan (earnings calendar, disclosure policy, analyst day timing) should be drafted before roadshow. Investors will ask about future guidance and communication.',
    remediation:
      'Work with IR advisor to draft IR charter and disclosure policy. Present post-IPO communication plan during roadshow. Finalize before close.',
    applicableExchanges: [],
  },

  {
    id: 'management-no-post-listing-before-listing',
    rule: 'Post-listing management tasks (SEC reporting, quarterly earnings) do not begin substantively before Listing Date',
    severity: 'warning',
    description:
      'Post-listing obligations (SEC periodic reporting, earnings releases, Regulation FD compliance) should not be active until after listing date. Early action signals premature confidence.',
    remediation:
      'Defer post-listing processes to 1-2 days after listing. Prepare templates and processes in advance, but do not activate until listed.',
    applicableExchanges: [],
  },
]

// ============================================================
// EXCHANGE-SPECIFIC SEQUENCING RULES
// ============================================================
const EXCHANGE_SPECIFIC_RULES: Record<string, SequencingRule[]> = {
  nasdaq: [
    {
      id: 'nasdaq-sarbanes-oxley-400-days',
      rule: 'Nasdaq: Compliance with SOX audit requirement (2 audits completed)',
      severity: 'error',
      description:
        'Nasdaq requires issuer to have two years of audited financial statements before IPO. Plan accordingly in Phase 1.',
      remediation:
        'Ensure audit timeline aligns with fiscal year ends. If company ends Dec 31, plan for Dec 2024 and Dec 2023 audits to be complete by IPO.',
      applicableExchanges: ['nasdaq'],
    },

    {
      id: 'nasdaq-audit-committee-financial-expert',
      rule: 'Nasdaq: Audit Committee must include financial expert',
      severity: 'error',
      description:
        'Nasdaq Rule 5605(c)(2) requires at least one audit committee member to be a "financial expert" (per SOX definition). Non-compliance blocks listing.',
      remediation:
        'Recruit director with public company CFO or audit committee experience. Ensure resume documents relevant financial expertise before board appointment.',
      applicableExchanges: ['nasdaq'],
    },

    {
      id: 'nasdaq-compensation-committee-charter',
      rule: 'Nasdaq: Compensation Committee charter and charter approval',
      severity: 'warning',
      description:
        'Nasdaq requires compensation committee charter before listing. Charter must be approved by board and disclosed.',
      remediation:
        'Draft compensation committee charter 4-6 weeks before filing. Ensure it covers executive compensation philosophy, risk assessment, and clawback provisions.',
      applicableExchanges: ['nasdaq'],
    },

    {
      id: 'nasdaq-code-of-conduct',
      rule: 'Nasdaq: Code of Conduct adoption',
      severity: 'warning',
      description:
        'Nasdaq Rule 5610 requires written Code of Conduct for directors, officers, and employees. Code must be disclosed before listing.',
      remediation:
        'Adopt Code of Conduct addressing whistleblower procedures, insider trading, and conflicts of interest. Disclose on SEC filing.',
      applicableExchanges: ['nasdaq'],
    },

    {
      id: 'nasdaq-listing-app-approval-before-close',
      rule: 'Nasdaq: Listing application approval before expected Close',
      severity: 'error',
      description:
        'Nasdaq must formally approve listing application and grant listing standards relief (if applicable) before Close. Approval timing drives close date.',
      remediation:
        'Submit listing application 5-7 days before expected close. Respond to Nasdaq questions within 24 hours. Close timing depends on Nasdaq approval.',
      applicableExchanges: ['nasdaq'],
    },
  ],

  nyse: [
    {
      id: 'nyse-audit-committee-all-independent',
      rule: 'NYSE: Audit Committee must be 100% independent',
      severity: 'error',
      description:
        'NYSE Rule 303A requires all audit committee members to be independent. No management or affiliated directors.',
      remediation:
        'Ensure all 3+ audit committee members are non-affiliated, independent directors. Document independence assessment for each member.',
      applicableExchanges: ['nyse'],
    },

    {
      id: 'nyse-compensation-committee-all-independent',
      rule: 'NYSE: Compensation Committee must be 100% independent',
      severity: 'error',
      description:
        'NYSE Rule 303A requires compensation committee to be fully independent with experienced compensation advisors.',
      remediation:
        'Staff compensation committee with independent directors experienced in executive compensation. Document committee charter.',
      applicableExchanges: ['nyse'],
    },

    {
      id: 'nyse-listing-standards-higher-than-nasdaq',
      rule: 'NYSE: Meet higher minimum listing standards than Nasdaq',
      severity: 'error',
      description:
        'NYSE minimum standards are stricter than Nasdaq: higher revenue, profitability, and stockholders equity requirements.',
      remediation:
        'Confirm compliance with NYSE minimums early. If company barely meets Nasdaq but not NYSE, choose Nasdaq track.',
      applicableExchanges: ['nyse'],
    },

    {
      id: 'nyse-listing-app-approval-before-close',
      rule: 'NYSE: Listing application approval before expected Close',
      severity: 'error',
      description:
        'NYSE must formally approve listing application before Close. Approval timing drives close date.',
      remediation:
        'Submit listing application 5-7 days before expected close. Coordinate with NYSE counsel. Close timing depends on NYSE approval.',
      applicableExchanges: ['nyse'],
    },
  ],

  tsx: [
    {
      id: 'tsx-audit-english-french',
      rule: 'TSX: Audit report in English and French (Canada)',
      severity: 'warning',
      description:
        'TSX-listed issuers in Canada must provide audit report in both English and French if filing in both languages.',
      remediation:
        'Ensure audit firm provides bilingual capability or engage translator for audit report. Coordinate with auditor 2-3 weeks pre-close.',
      applicableExchanges: ['tsx'],
    },

    {
      id: 'tsx-sedar2-filing-format',
      rule: 'TSX: Use SEDAR2 electronic filing format',
      severity: 'error',
      description:
        'TSX-listed issuers must file using SEDAR2 (replacing SEDAR). System must be set up pre-close.',
      remediation:
        'Register with SEDAR2 6-8 weeks before listing. Test filing format with securities counsel. Ensure internal processes support SEDAR2 submission.',
      applicableExchanges: ['tsx'],
    },

    {
      id: 'tsx-continuous-disclosure-policy',
      rule: 'TSX: Continuous Disclosure Policy in place',
      severity: 'warning',
      description:
        'TSX requires written Continuous Disclosure Policy addressing material information handling and selective disclosure.',
      remediation:
        'Adopt Continuous Disclosure Policy addressing SEDAR2 filing, insider trading, and Regulation FD (if US-listed). Disclose in filing.',
      applicableExchanges: ['tsx'],
    },
  ],

  tsxv: [
    {
      id: 'tsxv-lower-standards-than-tsx',
      rule: 'TSXV: Lower minimums than TSX — focus on quality disclosure',
      severity: 'warning',
      description:
        'TSXV has lower financial minimums than TSX but stringent disclosure requirements. Emphasize MD&A depth and risk disclosure.',
      remediation:
        'Prioritize comprehensive MD&A and risk disclosure. Assume TSXV investors are retail; explain business simply. Include 3-year financial projections.',
      applicableExchanges: ['tsxv'],
    },
  ],
}

/**
 * Validate milestone sequencing for a company
 * 
 * @param companyId - Company unique identifier
 * @param exchange - Target exchange (nasdaq, nyse, tsx, tsxv, etc.)
 * @returns Array of sequencing violations (errors and warnings)
 */
export async function validateMilestoneSequence(
  companyId: string,
  exchange: string
): Promise<SequencingViolation[]> {
  // Fetch task completion status by phase
  const tasksByPhase = (await sql`
    SELECT
      phase,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      MIN(CASE WHEN status != 'not_started' THEN created_at END) AS started_at,
      MAX(CASE WHEN status = 'completed' THEN updated_at END) AS completed_at
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  `) as any[]

  const phases: Record<string, TaskPhaseInfo> = {}
  for (const row of tasksByPhase) {
    phases[row.phase] = {
      total: parseInt(row.total, 10),
      completed: parseInt(row.completed, 10),
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }
  }

  // Fetch company readiness factors
  const company = (await sql`
    SELECT auditor_selected, board_size, cfo_hired_at
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  `)[0] as { auditor_selected: boolean; board_size: number; cfo_hired_at: string | null } | undefined

  const violations: SequencingViolation[] = []
  const violationSet = new Set<string>()

  // Check universal rules
  for (const rule of IPO_SEQUENCING_RULES) {
    let violated = false
    const phaseKey = `${rule.id}-universal`

    // Auditor before audit
    if (rule.id === 'auditor-before-audit-phase' && company) {
      const auditPhase = phases['financial_audit']
      if (auditPhase && auditPhase.startedAt && !company.auditor_selected) {
        violated = true
      }
    }

    // Board before roadshow
    if (rule.id === 'board-formation-before-roadshow' && company) {
      const roadshowPhase = phases['marketing_roadshow']
      if (roadshowPhase && roadshowPhase.startedAt && (company.board_size ?? 0) < 3) {
        violated = true
      }
    }

    // Audit complete before roadshow
    if (rule.id === 'audit-complete-before-roadshow') {
      const auditPhase = phases['financial_audit']
      const roadshowPhase = phases['marketing_roadshow']
      if (roadshowPhase && roadshowPhase.startedAt && auditPhase) {
        const auditProgress = auditPhase.total > 0 ? auditPhase.completed / auditPhase.total : 0
        if (auditProgress < 0.9) {
          violated = true
        }
      }
    }

    // Regulatory filing before listing app
    if (rule.id === 'regulatory-filing-before-listing-app') {
      const regulatoryPhase = phases['regulatory_filing']
      const listingPhase = phases['listing_application']
      if (listingPhase && listingPhase.startedAt && regulatoryPhase) {
        const regulatoryProgress = regulatoryPhase.total > 0 ? regulatoryPhase.completed / regulatoryPhase.total : 0
        if (regulatoryProgress < 0.9) {
          violated = true
        }
      }
    }

    if (violated && !violationSet.has(phaseKey)) {
      violationSet.add(phaseKey)
      violations.push({
        id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyId,
        rule: rule.rule,
        severity: rule.severity,
        description: rule.description,
        remediation: rule.remediation,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      })
    }
  }

  // Check exchange-specific rules
  const exchangeRules = EXCHANGE_SPECIFIC_RULES[exchange.toLowerCase()] ?? []
  for (const rule of exchangeRules) {
    // Special handling for exchange-specific checks
    let violated = false
    const phaseKey = `${rule.id}-${exchange}`

    // Audit committee financial expert (Nasdaq)
    if (rule.id === 'nasdaq-audit-committee-financial-expert' && company) {
      // This would require fetching board member details — for now, assume warning if not confirmed
      violated = !company.auditor_selected // Simplified check
    }

    if (violated && !violationSet.has(phaseKey)) {
      violationSet.add(phaseKey)
      violations.push({
        id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyId,
        rule: rule.rule,
        severity: rule.severity,
        description: rule.description,
        remediation: rule.remediation,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      })
    }
  }

  return violations
}

/**
 * Get sequencing recommendations based on current progress
 * 
 * @param companyId - Company unique identifier
 * @returns Array of human-readable recommendations for next steps
 */
export async function getSequencingRecommendations(companyId: string): Promise<string[]> {
  const tasksByPhase = (await sql`
    SELECT
      phase,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) AS total
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
    ORDER BY phase
  `) as any[]

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

  const phaseNames: Record<string, string> = {
    pre_planning: 'Pre-Planning',
    corporate_restructuring: 'Corporate Restructuring',
    financial_audit: 'Financial Audit',
    legal_documentation: 'Legal Documentation',
    regulatory_filing: 'Regulatory Filing',
    marketing_roadshow: 'Marketing & Roadshow',
    listing_application: 'Listing Application',
    post_listing: 'Post-Listing',
  }

  for (const row of tasksByPhase) {
    const progress = Math.round((parseInt(row.completed, 10) / parseInt(row.total, 10)) * 100)
    const phaseIndex = phaseOrder.indexOf(row.phase)
    const phaseName = phaseNames[row.phase] || row.phase

    // Critical: focus on incomplete phases
    if (progress < 30) {
      recommendations.push(`URGENT: ${phaseName} is only ${progress}% complete — prioritize these tasks`)
    } else if (progress < 50) {
      recommendations.push(`Focus on completing ${phaseName}: ${progress}% done`)
    } else if (progress >= 80 && phaseIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[phaseIndex + 1]
      const nextPhaseName = phaseNames[nextPhase] || nextPhase
      recommendations.push(`${phaseName} is 80%+ complete — consider beginning ${nextPhaseName}`)
    }
  }

  // Add sequencing checks
  const phases: Record<string, number> = {}
  for (const row of tasksByPhase) {
    phases[row.phase] = Math.round((parseInt(row.completed, 10) / parseInt(row.total, 10)) * 100)
  }

  if (phases['legal_documentation'] && phases['legal_documentation'] < 50 && phases['regulatory_filing'] && phases['regulatory_filing'] > 20) {
    recommendations.push('WARNING: Regulatory Filing ahead of Legal Documentation — may cause filing delays')
  }

  if (phases['marketing_roadshow'] && phases['marketing_roadshow'] > 20 && phases['financial_audit'] && phases['financial_audit'] < 80) {
    recommendations.push('WARNING: Marketing & Roadshow underway but Financial Audit not complete — investor confidence risk')
  }

  return recommendations
}
