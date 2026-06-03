// ============================================================================
// Consent Letter Templates & Exchange Requirements
// ============================================================================

export type EntityType = 'auditor' | 'lawyer' | 'valuation_expert' | 'environmental_expert' | 'other_expert'
export type ExchangeCode = 'NYSE' | 'NASDAQ' | 'TSX' | 'TSXV' | 'CSE'

export interface ConsentTemplate {
  id: string
  title: string
  entityType: EntityType
  exchanges: ExchangeCode[]
  required: boolean
  description: string
  template: string
  keyTerms: string[]
}

// ============================================================================
// Consent Templates
// ============================================================================

export const CONSENT_TEMPLATES: Record<string, ConsentTemplate> = {
  'auditor-audit-consent': {
    id: 'auditor-audit-consent',
    title: 'Auditor Consent to Use Audit Report',
    entityType: 'auditor',
    exchanges: ['NYSE', 'NASDAQ', 'TSX', 'TSXV', 'CSE'],
    required: true,
    description:
      'Written consent from the independent auditor allowing the company to include the audited financial statements and audit report in the prospectus',
    keyTerms: [
      'PCAOB Auditing Standards',
      'Financial Statement Audit',
      'Audit Report Inclusion',
      'Professional Standards Compliance',
      'Auditor Independence'
    ],
    template: `CONSENT OF INDEPENDENT AUDITORS

[COMPANY NAME]
[ADDRESS]

We have audited the financial statements of [COMPANY NAME] (the "Company") as of [DATE] and for the [PERIOD] then ended, and have issued our report thereon dated [DATE]. We hereby consent to the inclusion of our report in the registration statement on Form [FORM TYPE] relating to the above-captioned Company.

Our audit was conducted in accordance with the standards of the Public Company Accounting Oversight Board (United States), and we applied the procedures we considered necessary in the circumstances.

We have also consented to the references to our Firm contained in the prospectus included in the registration statement.

[AUDITOR NAME]
[DATE]
[SIGNATURE]`,
  },

  'auditor-internal-controls': {
    id: 'auditor-internal-controls',
    title: 'Auditor Consent - Internal Controls Attestation',
    entityType: 'auditor',
    exchanges: ['NYSE', 'NASDAQ'],
    required: false,
    description:
      'Auditor consent for internal controls over financial reporting attestation (SOX 404 related)',
    keyTerms: [
      'SOX 404 Compliance',
      'Internal Controls Assessment',
      'COSO Framework',
      'Control Deficiencies',
      'Management Certification'
    ],
    template: `CONSENT OF INDEPENDENT AUDITORS - INTERNAL CONTROLS OVER FINANCIAL REPORTING

[COMPANY NAME]
[ADDRESS]

We hereby consent to the inclusion of our report on [COMPANY NAME]'s internal control over financial reporting, dated [DATE], in the registration statement on Form [FORM TYPE].

We also consent to the references to our Firm under the captions "[CAPTION]" in the prospectus included in the registration statement.

The effectiveness of internal control over financial reporting as of [DATE] has been assessed in accordance with frameworks established by the Committee of Sponsoring Organizations of the Treadway Commission (COSO).

[AUDITOR NAME]
[DATE]
[SIGNATURE]`,
  },

  'lawyer-legal-opinion': {
    id: 'lawyer-legal-opinion',
    title: 'Legal Counsel Opinion on Corporate Matters',
    entityType: 'lawyer',
    exchanges: ['NYSE', 'NASDAQ', 'TSX', 'TSXV', 'CSE'],
    required: true,
    description:
      'Counsel opinion letter covering corporate matters, capitalization, litigation, and regulatory compliance',
    keyTerms: [
      'Corporate Organization',
      'Share Capitalization',
      'Litigation Status',
      'Regulatory Compliance',
      'Authority Representations'
    ],
    template: `LEGAL OPINION OF COUNSEL

[COMPANY NAME]
[ADDRESS]

We are counsel to [COMPANY NAME] (the "Company") and have acted as such in connection with the preparation of a prospectus to be included in a registration statement on Form [FORM TYPE].

Based upon and subject to the qualifications, limitations, and assumptions set forth herein, we are of the opinion that:

1. The Company is duly organized, validly existing, and in good standing under the laws of [JURISDICTION].

2. The authorized and issued capital of the Company is as described in the prospectus.

3. All outstanding shares of the Company have been duly and validly issued and are fully paid and non-assessable.

4. The execution and delivery of the documents contemplated by the prospectus have been duly authorized.

5. The statements in the prospectus under "Legal Proceedings" are accurate and complete in all material respects.

[LAW FIRM NAME]
[DATE]
[SIGNATURE]`,
  },

  'lawyer-underwriting-opinion': {
    id: 'lawyer-underwriting-opinion',
    title: 'Underwriter\'s Legal Opinion',
    entityType: 'lawyer',
    exchanges: ['NYSE', 'NASDAQ', 'TSX', 'TSXV', 'CSE'],
    required: true,
    description:
      'Legal opinion from counsel to the underwriter regarding the registration statement and prospectus validity',
    keyTerms: [
      'Registration Statement Validity',
      'Prospectus Compliance',
      'Securities Law Compliance',
      'Underwriter Protections',
      'Legal Enforceability'
    ],
    template: `LEGAL OPINION OF UNDERWRITER'S COUNSEL

[COMPANY NAME]
[ADDRESS]

We have acted as counsel to [UNDERWRITER NAME] in connection with its participation as [ROLE] in the proposed distribution of [SECURITY DESCRIPTION] of [COMPANY NAME] (the "Company").

In such capacity, we have examined and relied upon certain documents and have made such inquiries as we have deemed necessary for purposes of rendering this opinion. Based upon and subject to the qualifications and limitations set forth herein, we are of the opinion that:

1. The registration statement has been filed with the Securities and Exchange Commission.

2. The form of prospectus attached as Exhibit [X] has been included in such registration statement.

3. All documents required to be filed have been or will be timely filed.

[LAW FIRM NAME]
[DATE]
[SIGNATURE]`,
  },

  'valuation-expert-appraisal': {
    id: 'valuation-expert-appraisal',
    title: 'Valuation Expert Consent and Report',
    entityType: 'valuation_expert',
    exchanges: ['TSX', 'TSXV', 'CSE'],
    required: false,
    description:
      'Consent from valuation experts for inclusion of valuation reports and opinions',
    keyTerms: [
      'Fair Value Assessment',
      'Industry Standards Compliance',
      'Valuation Methodology',
      'Expert Opinion',
      'Professional Independence'
    ],
    template: `CONSENT OF VALUATION EXPERT

[COMPANY NAME]
[ADDRESS]

We hereby consent to the inclusion of our valuation report dated [DATE] and references thereto in the prospectus to be included in the registration statement of [COMPANY NAME].

We further consent to the use of our name in the prospectus. The valuation was performed in accordance with [VALUATION STANDARD] and reflects our professional judgment as of [DATE].

The valuation and analysis are subject to the assumptions, qualifications, and limitations set forth in our report.

[VALUATION FIRM NAME]
[DATE]
[SIGNATURE]`,
  },

  'environmental-expert-report': {
    id: 'environmental-expert-report',
    title: 'Environmental Expert Report Consent',
    entityType: 'environmental_expert',
    exchanges: ['NYSE', 'NASDAQ', 'TSX', 'TSXV', 'CSE'],
    required: false,
    description:
      'Consent from environmental experts for Phase I/II environmental assessments',
    keyTerms: [
      'Phase I/II Assessment',
      'ASTM Standards Compliance',
      'Environmental Liabilities',
      'Remediation Status',
      'Regulatory Approvals'
    ],
    template: `CONSENT OF ENVIRONMENTAL EXPERT

[COMPANY NAME]
[ADDRESS]

We have prepared a Phase [I/II] Environmental Site Assessment (ESA) dated [DATE] for the property located at [ADDRESS].

We hereby consent to the inclusion of the ESA report and references to our firm in the prospectus to be included in the registration statement of [COMPANY NAME].

The environmental assessment was conducted in accordance with the standards established by the American Society of Testing and Materials (ASTM), and the results and conclusions are as set forth in our report dated [DATE].

[ENVIRONMENTAL FIRM NAME]
[DATE]
[SIGNATURE]`,
  },
}

// ============================================================================
// Exchange-Specific Required Consents
// ============================================================================

export const EXCHANGE_CONSENT_REQUIREMENTS: Record<ExchangeCode, string[]> = {
  NYSE: [
    'auditor-audit-consent',
    'auditor-internal-controls',
    'lawyer-legal-opinion',
    'lawyer-underwriting-opinion',
  ],
  NASDAQ: [
    'auditor-audit-consent',
    'auditor-internal-controls',
    'lawyer-legal-opinion',
    'lawyer-underwriting-opinion',
  ],
  TSX: [
    'auditor-audit-consent',
    'lawyer-legal-opinion',
    'lawyer-underwriting-opinion',
    'valuation-expert-appraisal',
  ],
  TSXV: [
    'auditor-audit-consent',
    'lawyer-legal-opinion',
  ],
  CSE: [
    'auditor-audit-consent',
    'lawyer-legal-opinion',
  ],
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get required consents for an exchange
 */
export function getRequiredConsentsForExchange(exchange: ExchangeCode): ConsentTemplate[] {
  const templateIds = EXCHANGE_CONSENT_REQUIREMENTS[exchange] || []
  return templateIds
    .map((id) => CONSENT_TEMPLATES[id])
    .filter((template) => template && template.required)
}

/**
 * Get all available consents for an exchange
 */
export function getAvailableConsentsForExchange(exchange: ExchangeCode): ConsentTemplate[] {
  return Object.values(CONSENT_TEMPLATES).filter((template) =>
    template.exchanges.includes(exchange)
  )
}

/**
 * Generate a consent request letter
 */
export function generateConsentLetter(
  templateId: string,
  companyName: string,
  additionalContext?: Record<string, string>
): string {
  const template = CONSENT_TEMPLATES[templateId]
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  let letter = template.template
  const context = {
    '[COMPANY NAME]': companyName,
    ...additionalContext,
  }

  Object.entries(context).forEach(([key, value]) => {
    letter = letter.replace(new RegExp(key, 'g'), value || '')
  })

  return letter
}
