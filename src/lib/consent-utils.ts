/**
 * Consent Workflow Utilities
 * Functions for managing consent letters, tracking status, and compliance calculations
 */

export type ConsentStatus = 'pending' | 'signed' | 'rejected' | 'expired'
export type EntityType = 'auditor' | 'lawyer' | 'valuation_expert' | 'environmental_expert' | 'other_expert'
export type ExchangeCode = 'tsx' | 'nasdaq' | 'nyse' | 'tsxv' | 'cse'

export interface ConsentRecord {
  id: string
  company_id: string
  from_entity: string
  entity_type: EntityType
  consent_type: string
  status: ConsentStatus
  document_url?: string
  expiry_date?: string
  created_at: string
  updated_at: string
}

export interface ConsentSummary {
  total: number
  signed: number
  pending: number
  rejected: number
  expired: number
  expiring_soon: number
  compliance_percentage: number
}

export interface EntityTypeInfo {
  label: string
  icon: string
  description: string
}

export interface StatusBadgeInfo {
  label: string
  color: string
  bg_color: string
  icon: string
}

// ═══════════════════════════════════════════════════════════════════════
// Compliance Calculation
// ═══════════════════════════════════════════════════════════════════════

export function calculateConsentCompliance(
  consents: ConsentRecord[],
  _exchange?: ExchangeCode
): ConsentSummary {
  const total = consents.length
  const signed = consents.filter((c) => c.status === 'signed').length
  const pending = consents.filter((c) => c.status === 'pending').length
  const rejected = consents.filter((c) => c.status === 'rejected').length
  const expired = consents.filter((c) => c.status === 'expired').length
  const expiring_soon = consents.filter((c) => isExpiringSoon(c.expiry_date)).length

  return {
    total,
    signed,
    pending,
    rejected,
    expired,
    expiring_soon,
    compliance_percentage: total > 0 ? Math.round((signed / total) * 100) : 0,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Status Management
// ═══════════════════════════════════════════════════════════════════════

export function getStatusBadge(status: ConsentStatus): StatusBadgeInfo {
  const badges: Record<ConsentStatus, StatusBadgeInfo> = {
    pending: {
      label: 'Pending',
      color: '#B45309',
      bg_color: '#FEF3C7',
      icon: 'clock',
    },
    signed: {
      label: 'Signed',
      color: '#2D7A5F',
      bg_color: '#EAF5F0',
      icon: 'check-circle',
    },
    rejected: {
      label: 'Rejected',
      color: '#DC2626',
      bg_color: '#FDECEB',
      icon: 'x-circle',
    },
    expired: {
      label: 'Expired',
      color: '#6B7280',
      bg_color: '#F3F4F6',
      icon: 'alert-circle',
    },
  }

  return badges[status]
}

export function getEntityTypeInfo(type: EntityType): EntityTypeInfo {
  const info: Record<EntityType, EntityTypeInfo> = {
    auditor: {
      label: 'Auditor',
      icon: 'file-text',
      description: 'Independent audit consent for financial statements',
    },
    lawyer: {
      label: 'Legal Counsel',
      icon: 'file-text',
      description: 'Legal opinion on IPO matters and compliance',
    },
    valuation_expert: {
      label: 'Valuation Expert',
      icon: 'trending-up',
      description: 'Fairness opinion or valuation report consent',
    },
    environmental_expert: {
      label: 'Environmental Expert',
      icon: 'alert-circle',
      description: 'Environmental assessment or sustainability report',
    },
    other_expert: {
      label: 'Other Expert',
      icon: 'user',
      description: 'Other expert report or opinion',
    },
  }

  return info[type]
}

// ═══════════════════════════════════════════════════════════════════════
// Date Utilities
// ═══════════════════════════════════════════════════════════════════════

export function formatExpiryDate(date: string | null | undefined): string {
  if (!date) return 'No deadline'

  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function isExpiringSoon(date: string | null | undefined, dayThreshold: number = 30): boolean {
  if (!date) return false

  const now = new Date()
  const expiryDate = new Date(date)
  const daysUntil = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntil > 0 && daysUntil <= dayThreshold
}

export function isExpired(date: string | null | undefined): boolean {
  if (!date) return false

  const now = new Date()
  const expiryDate = new Date(date)
  return expiryDate < now
}

export function getDaysUntilExpiry(date: string | null | undefined): number {
  if (!date) return -1

  const now = new Date()
  const expiryDate = new Date(date)
  return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ═══════════════════════════════════════════════════════════════════════
// Exchange-Specific Requirements
// ═══════════════════════════════════════════════════════════════════════

export interface ExchangeRequirement {
  entity_type: EntityType
  consent_type: string
  required: boolean
  description: string
}

export function getRequiredConsentsForExchange(exchange: ExchangeCode): ExchangeRequirement[] {
  const requirements: Record<ExchangeCode, ExchangeRequirement[]> = {
    tsx: [
      {
        entity_type: 'auditor',
        consent_type: 'Independent Audit Opinion',
        required: true,
        description: 'Auditor consent to include audited financial statements in prospectus',
      },
      {
        entity_type: 'lawyer',
        consent_type: 'Legal Counsel Opinion',
        required: true,
        description: 'Legal counsel opinion on corporate matters and compliance',
      },
      {
        entity_type: 'valuation_expert',
        consent_type: 'Valuation Report Consent',
        required: false,
        description: 'Valuation expert opinion if fairness opinion included',
      },
      {
        entity_type: 'environmental_expert',
        consent_type: 'Environmental Assessment',
        required: false,
        description: 'Environmental expert report if applicable to business',
      },
    ],
    nasdaq: [
      {
        entity_type: 'auditor',
        consent_type: 'Independent Audit Opinion',
        required: true,
        description: 'Auditor consent for audited financial statements',
      },
      {
        entity_type: 'lawyer',
        consent_type: 'Legal Counsel Opinion',
        required: true,
        description: 'Underwriters counsel and company counsel opinions',
      },
      {
        entity_type: 'valuation_expert',
        consent_type: 'Fairness Opinion',
        required: false,
        description: 'Fairness opinion from independent valuation firm',
      },
    ],
    nyse: [
      {
        entity_type: 'auditor',
        consent_type: 'Independent Audit Opinion',
        required: true,
        description: 'Auditor consent for audited financial statements',
      },
      {
        entity_type: 'lawyer',
        consent_type: 'Legal Counsel Opinion',
        required: true,
        description: 'Company counsel and underwriter counsel opinions',
      },
      {
        entity_type: 'valuation_expert',
        consent_type: 'Fairness Opinion',
        required: false,
        description: 'Fairness opinion from qualified expert',
      },
    ],
    tsxv: [
      {
        entity_type: 'auditor',
        consent_type: 'Independent Audit Opinion',
        required: true,
        description: 'Auditor consent for financial statements',
      },
      {
        entity_type: 'lawyer',
        consent_type: 'Legal Counsel Opinion',
        required: true,
        description: 'Legal counsel opinion on corporate matters',
      },
    ],
    cse: [
      {
        entity_type: 'auditor',
        consent_type: 'Independent Audit Opinion',
        required: true,
        description: 'Auditor consent for audited financial statements',
      },
      {
        entity_type: 'lawyer',
        consent_type: 'Legal Counsel Opinion',
        required: true,
        description: 'Legal counsel opinion on compliance and corporate matters',
      },
    ],
  }

  return requirements[exchange] || []
}

// ═══════════════════════════════════════════════════════════════════════
// Consent Letter Templates
// ═══════════════════════════════════════════════════════════════════════

export interface ConsentLetterTemplate {
  subject: string
  greeting: string
  introduction: string
  requirements: string[]
  timeline: string
  closing: string
  signature_line: string
}

export function generateConsentLetterTemplate(
  entityType: EntityType,
  fromEntity: string,
  exchange: ExchangeCode,
  companyName?: string
): ConsentLetterTemplate {
  const templates: Record<EntityType, (exchange: ExchangeCode, company: string) => ConsentLetterTemplate> = {
    auditor: (ex, company) => ({
      subject: `Consent to Include Audited Financial Statements in IPO Prospectus - ${company}`,
      greeting: `Dear Audit Partner:`,
      introduction: `We are writing to request your consent to include audited financial statements prepared by your firm in our Initial Public Offering (IPO) prospectus scheduled for filing with the ${ex.toUpperCase()} exchange.`,
      requirements: [
        `Confirmation that your firm has audited our financial statements in accordance with ${
          ex === 'tsx' || ex === 'tsxv' || ex === 'cse' ? 'Canadian' : 'US'
        } Generally Accepted Auditing Standards (GAAS)`,
        `Consent to include the audit opinion in the prospectus`,
        `Confirmation that no material changes have occurred since completion of the audit`,
        `Consent to use your firm's name as the independent auditor in all disclosure documents`,
      ],
      timeline: `We require your written consent by [DATE]. This is critical to meet our filing deadlines with the exchange.`,
      closing: `Please provide this consent on your firm's letterhead, signed by an authorized partner. If you have any questions or require additional information, please contact us promptly.`,
      signature_line: `Yours truly,`,
    }),
    lawyer: (ex, company) => ({
      subject: `Consent to Include Legal Opinion in IPO Prospectus - ${company}`,
      greeting: `Dear Counsel:`,
      introduction: `We are writing to request your consent to include a legal opinion prepared by your firm in our Initial Public Offering (IPO) prospectus to be filed with the ${ex.toUpperCase()} exchange.`,
      requirements: [
        `Confirmation of your firm's qualification and independence to provide this opinion`,
        `Consent to include the legal opinion in the prospectus`,
        `Consent to use your firm's name as legal counsel in all disclosure documents`,
        `Confirmation that you have reviewed all relevant corporate documents and legal matters`,
        `Agreement to respond to disclosure inquiries within required timeframes`,
      ],
      timeline: `We need your written consent by [DATE] to meet our prospectus filing deadline.`,
      closing: `Please provide this consent on your firm's letterhead, signed by an authorized partner. Contact us if you require any clarifications or additional documentation.`,
      signature_line: `Yours truly,`,
    }),
    valuation_expert: (ex, company) => ({
      subject: `Consent to Include Valuation Report in IPO Prospectus - ${company}`,
      greeting: `Dear Valuation Expert:`,
      introduction: `We are writing to request your consent to include the valuation report / fairness opinion prepared by your firm in our Initial Public Offering (IPO) prospectus to be filed with the ${ex.toUpperCase()} exchange.`,
      requirements: [
        `Confirmation of your independence and qualification as a valuation expert`,
        `Consent to include the valuation report / fairness opinion in the prospectus`,
        `Consent to use your firm's name in connection with this valuation work`,
        `Confirmation that the valuation methodology and assumptions remain valid`,
        `Consent to disclosure of material assumptions and methods used`,
      ],
      timeline: `Your written consent is required by [DATE] to support our prospectus filing timeline.`,
      closing: `Please provide this consent on your firm's letterhead, executed by an authorized representative. Please contact us if you have any questions.`,
      signature_line: `Yours truly,`,
    }),
    environmental_expert: (ex, company) => ({
      subject: `Consent to Include Environmental Assessment in IPO Prospectus - ${company}`,
      greeting: `Dear Environmental Expert:`,
      introduction: `We are writing to request your consent to include the environmental assessment / sustainability report prepared by your firm in our Initial Public Offering (IPO) prospectus to be filed with the ${ex.toUpperCase()} exchange.`,
      requirements: [
        `Confirmation of your firm's expertise and independence in environmental assessment`,
        `Consent to include the environmental report in the prospectus`,
        `Consent to use your firm's name in connection with this assessment`,
        `Confirmation that findings remain materially accurate`,
        `Consent to disclosure of methodology and key findings`,
      ],
      timeline: `We require your written consent by [DATE] to meet our filing deadline.`,
      closing: `Please provide this consent on your firm's letterhead, signed by an authorized officer. Contact us with any questions.`,
      signature_line: `Yours truly,`,
    }),
    other_expert: (ex, company) => ({
      subject: `Consent to Include Expert Report in IPO Prospectus - ${company}`,
      greeting: `Dear Expert:`,
      introduction: `We are writing to request your consent to include the expert report prepared by you/your firm in our Initial Public Offering (IPO) prospectus to be filed with the ${ex.toUpperCase()} exchange.`,
      requirements: [
        `Confirmation of your expertise and independence related to this matter`,
        `Consent to include the expert report in the prospectus`,
        `Consent to use your name/firm name in connection with this report`,
        `Confirmation that the report remains accurate and materially unchanged`,
        `Consent to disclosure of methodology and conclusions`,
      ],
      timeline: `Your written consent is required by [DATE] to support our prospectus filing.`,
      closing: `Please provide this consent on appropriate letterhead, signed by you or an authorized representative. Contact us if you require further information.`,
      signature_line: `Yours truly,`,
    }),
  }

  const templateFn = templates[entityType]
  return templateFn(exchange, companyName || 'the Company')
}

// ═══════════════════════════════════════════════════════════════════════
// Filtering & Sorting
// ═══════════════════════════════════════════════════════════════════════

export function filterConsentsByStatus(
  consents: ConsentRecord[],
  status: ConsentStatus | ConsentStatus[]
): ConsentRecord[] {
  const statuses = Array.isArray(status) ? status : [status]
  return consents.filter((c) => statuses.includes(c.status))
}

export function filterConsentsByEntityType(
  consents: ConsentRecord[],
  entityType: EntityType | EntityType[]
): ConsentRecord[] {
  const types = Array.isArray(entityType) ? entityType : [entityType]
  return consents.filter((c) => types.includes(c.entity_type))
}

export function sortConsentsByExpiry(consents: ConsentRecord[], ascending: boolean = true): ConsentRecord[] {
  return [...consents].sort((a, b) => {
    const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : Number.MAX_SAFE_INTEGER
    const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : Number.MAX_SAFE_INTEGER

    return ascending ? dateA - dateB : dateB - dateA
  })
}

export function sortConsentsByStatus(consents: ConsentRecord[], statusOrder: ConsentStatus[]): ConsentRecord[] {
  return [...consents].sort((a, b) => {
    const indexA = statusOrder.indexOf(a.status)
    const indexB = statusOrder.indexOf(b.status)
    return indexA - indexB
  })
}

// ═══════════════════════════════════════════════════════════════════════
// Compliance Checks
// ═══════════════════════════════════════════════════════════════════════

export function isConsentCompleteForExchange(
  consents: ConsentRecord[],
  exchange: ExchangeCode
): { complete: boolean; missing: ExchangeRequirement[] } {
  const required = getRequiredConsentsForExchange(exchange).filter((r) => r.required)
  const signed = consents.filter((c) => c.status === 'signed')

  const missing = required.filter(
    (req) => !signed.some((s) => s.entity_type === req.entity_type && s.consent_type === req.consent_type)
  )

  return {
    complete: missing.length === 0,
    missing,
  }
}

export function getComplianceWarnings(consents: ConsentRecord[]): string[] {
  const warnings: string[] = []

  // Check for pending consents
  const pending = consents.filter((c) => c.status === 'pending')
  if (pending.length > 0) {
    warnings.push(`${pending.length} consent(s) still pending - follow up required`)
  }

  // Check for expiring soon
  const expiring = consents.filter((c) => isExpiringSoon(c.expiry_date))
  if (expiring.length > 0) {
    warnings.push(`${expiring.length} consent(s) expiring within 30 days`)
  }

  // Check for rejected
  const rejected = consents.filter((c) => c.status === 'rejected')
  if (rejected.length > 0) {
    warnings.push(`${rejected.length} consent(s) have been rejected - alternative required`)
  }

  // Check for expired
  const expired = consents.filter((c) => c.status === 'expired')
  if (expired.length > 0) {
    warnings.push(`${expired.length} consent(s) have expired - renewal required`)
  }

  return warnings
}
