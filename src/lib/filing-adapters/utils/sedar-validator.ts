/**
 * SEDAR Validator
 * ===============
 * Comprehensive validation rules specific to Canadian SEDAR 2 filing requirements
 *
 * Validates:
 * - Prospectus sections and completeness
 * - Financial statement compliance (IFRS)
 * - Officer and director consents
 * - Signature requirements
 * - Document formatting standards
 * - Bilingual content requirements
 * - Executive compensation disclosure
 * - Related party transaction disclosure
 */

/**
 * SEDAR prospectus section requirements
 */
export interface ProspectusSection {
  name: string
  required: boolean
  minLength?: number
  description: string
}

/**
 * Financial statement validation rules
 */
export interface FinancialStatementRules {
  requiredStatements: string[]
  requiredNotes: string[]
  accountingStandard: 'IFRS' | 'ASPE'
  auditRequired: boolean
  minYearsHistory: number
}

/**
 * SEDAR required prospectus sections
 */
export const SEDAR_PROSPECTUS_SECTIONS: ProspectusSection[] = [
  {
    name: 'Title Page',
    required: true,
    description: 'Must include company name, symbols, and key offering details',
  },
  {
    name: 'Table of Contents',
    required: true,
    description: 'Complete table of contents with page numbers',
  },
  {
    name: 'Summary',
    required: true,
    minLength: 500,
    description: 'Executive summary of offering and business',
  },
  {
    name: 'Corporate Structure',
    required: true,
    description: 'Organization and structure of company and subsidiaries',
  },
  {
    name: 'Business and Operations',
    required: true,
    minLength: 1000,
    description: 'Description of business, operations, and strategy',
  },
  {
    name: 'Selected Consolidated Financial Information',
    required: true,
    description: 'Summary financial data for past 5 years',
  },
  {
    name: 'Management Discussion and Analysis',
    required: true,
    minLength: 2000,
    description: 'MD&A covering financial condition and operations',
  },
  {
    name: 'Description of Capitalization',
    required: true,
    description: 'Capital structure, authorized shares, and outstanding securities',
  },
  {
    name: 'Risk Factors',
    required: true,
    minLength: 1500,
    description: 'Comprehensive list of material risks to investors',
  },
  {
    name: 'Detail of the Offering',
    required: true,
    description: 'Terms, conditions, and pricing of the offering',
  },
  {
    name: 'Use of Proceeds',
    required: true,
    description: 'How offering proceeds will be used',
  },
  {
    name: 'Dividend Policy',
    required: true,
    description: 'Company dividend policy and payment history',
  },
  {
    name: 'Market for Securities',
    required: true,
    description: 'Trading history and performance of securities',
  },
  {
    name: 'Executive Officers and Directors',
    required: true,
    description: 'Names, titles, and backgrounds of officers and directors',
  },
  {
    name: 'Executive Compensation',
    required: true,
    minLength: 1000,
    description: 'Compensation, options, and benefits of NEOs',
  },
  {
    name: 'Indebtedness of Directors and Officers',
    required: true,
    description: 'Any amounts owing by directors/officers to company',
  },
  {
    name: 'Promoters and Principal Shareholders',
    required: true,
    description: 'Identity and ownership of promoters and major shareholders',
  },
  {
    name: 'Material Contracts',
    required: true,
    description: 'List and summary of material contracts',
  },
  {
    name: 'Related Party Transactions',
    required: true,
    description: 'All transactions with related parties',
  },
  {
    name: 'Legal Proceedings',
    required: true,
    description: 'Description of outstanding legal proceedings',
  },
  {
    name: 'Auditors, Audit Committee and Corporate Governance',
    required: true,
    description: 'Auditor information, audit committee details, governance',
  },
  {
    name: 'Financial Statements',
    required: true,
    description: 'Audited financial statements with auditor opinion',
  },
  {
    name: 'Certifications',
    required: true,
    description: 'CEO and CFO certifications',
  },
  {
    name: 'Consent of Auditors',
    required: true,
    description: 'Auditor consent to inclusion in prospectus',
  },
  {
    name: 'Consent of Officers/Directors',
    required: true,
    description: 'Officer and director consents to filing',
  },
]

/**
 * SEDAR financial statement requirements
 */
export const SEDAR_FINANCIAL_STATEMENT_RULES: FinancialStatementRules = {
  requiredStatements: [
    'Balance Sheet',
    'Statement of Income (Comprehensive Income)',
    'Statement of Cash Flows',
    'Statement of Changes in Equity',
  ],
  requiredNotes: [
    'Summary of Significant Accounting Policies',
    'Revenue Recognition',
    'Operating Expenses',
    'Income Taxes',
    'Earnings Per Share',
    'Segment Information',
    'Commitments and Contingencies',
    'Subsequent Events',
  ],
  accountingStandard: 'IFRS',
  auditRequired: true,
  minYearsHistory: 2,
}

/**
 * Executive compensation disclosure requirements
 */
export const EXECUTIVE_COMPENSATION_REQUIREMENTS = {
  disclosureThreshold: 150000, // CAD
  numberOfNEOs: 5, // Named Executive Officers
  requiredDisclosures: [
    'Base salary',
    'Bonus payments',
    'Stock options',
    'Restricted stock units',
    'Pension benefits',
    'Other compensation',
    'Perquisites',
    'Termination benefits',
  ],
}

/**
 * SEDAR document format requirements
 */
export const SEDAR_DOCUMENT_FORMAT_RULES = {
  maxFileSize: 500 * 1024 * 1024, // 500 MB
  acceptedFormats: ['PDF', 'DOCX', 'DOC'],
  pdfStandard: 'PDF/A-1b',
  minFontSize: 8,
  maxFileNameLength: 255,
  characterEncoding: 'UTF-8',
}

/**
 * SEDAR Validator class
 */
export class SEDARValidator {
  /**
   * Validate prospectus completeness
   */
  validateProspectusCompleteness(
    prospectusContent: Record<string, string | boolean>
  ): { valid: boolean; missingRun: ProspectusSection[] } {
    const missingSections: ProspectusSection[] = []

    for (const section of SEDAR_PROSPECTUS_SECTIONS) {
      if (section.required) {
        const content = prospectusContent[section.name]

        // Check if section exists
        if (!content) {
          missingSections.push(section)
          continue
        }

        // Check minimum length if specified
        if (section.minLength && typeof content === 'string') {
          if (content.length < section.minLength) {
            missingSections.push({
              ...section,
              description: `${section.description} (minimum ${section.minLength} characters)`,
            })
          }
        }
      }
    }

    return {
      valid: missingSections.length === 0,
      missingRun: missingSections,
    }
  }

  /**
   * Validate financial statements for IFRS compliance
   */
  validateFinancialStatementsIFRS(
    financialData: Record<string, any>
  ): { valid: boolean; missingStatements: string[] } {
    const missingStatements: string[] = []

    for (const statement of SEDAR_FINANCIAL_STATEMENT_RULES.requiredStatements) {
      if (!financialData[statement] || !financialData[statement].data) {
        missingStatements.push(statement)
      }
    }

    // Validate required note disclosures
    const notes = financialData['notes'] || {}
    for (const noteType of SEDAR_FINANCIAL_STATEMENT_RULES.requiredNotes) {
      if (!notes[noteType]) {
        missingStatements.push(`Note: ${noteType}`)
      }
    }

    return {
      valid: missingStatements.length === 0,
      missingStatements,
    }
  }

  /**
   * Validate executive compensation disclosure
   */
  validateExecutiveCompensationDisclosure(
    compensationData: Array<{
      name: string
      salary: number
      [key: string]: any
    }>
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for minimum number of NEOs
    if (compensationData.length < EXECUTIVE_COMPENSATION_REQUIREMENTS.numberOfNEOs) {
      issues.push(
        `Expected disclosure for at least ${EXECUTIVE_COMPENSATION_REQUIREMENTS.numberOfNEOs} NEOs`
      )
    }

    // Validate each NEO disclosure
    for (const neo of compensationData) {
      const missingDisclosures: string[] = []

      for (const disclosure of EXECUTIVE_COMPENSATION_REQUIREMENTS.requiredDisclosures) {
        const fieldName = disclosure.toLowerCase().replace(/\s+/g, '_')
        if (!neo[fieldName] && neo.salary >= EXECUTIVE_COMPENSATION_REQUIREMENTS.disclosureThreshold) {
          missingDisclosures.push(disclosure)
        }
      }

      if (missingDisclosures.length > 0) {
        issues.push(
          `${neo.name}: Missing disclosures for ${missingDisclosures.join(', ')}`
        )
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Validate document format compliance
   */
  validateDocumentFormat(
    filename: string,
    size: number,
    mimeType: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check file size
    if (size > SEDAR_DOCUMENT_FORMAT_RULES.maxFileSize) {
      errors.push(
        `File size (${(size / 1024 / 1024).toFixed(2)} MB) exceeds limit of 500 MB`
      )
    }

    // Check filename length
    if (filename.length > SEDAR_DOCUMENT_FORMAT_RULES.maxFileNameLength) {
      errors.push(
        `Filename length (${filename.length}) exceeds limit of ${SEDAR_DOCUMENT_FORMAT_RULES.maxFileNameLength}`
      )
    }

    // Check file format
    const ext = filename.split('.').pop()?.toUpperCase()
    if (ext && !SEDAR_DOCUMENT_FORMAT_RULES.acceptedFormats.includes(ext)) {
      errors.push(
        `File format (.${ext}) not accepted. Supported formats: ${SEDAR_DOCUMENT_FORMAT_RULES.acceptedFormats.join(', ')}`
      )
    }

    // Check MIME type
    const validMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    if (!validMimeTypes.includes(mimeType)) {
      errors.push(`MIME type "${mimeType}" not accepted for SEDAR`)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate officer and director consents
   */
  validateConsents(
    consents: Array<{
      name: string
      title: string
      signed: boolean
      signatureDate: string
    }>
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for required officer types
    const titles = new Set(consents.map((c) => c.title.toLowerCase()))
    const requiredTitles = ['ceo', 'cfo', 'board chair']

    for (const title of requiredTitles) {
      if (!Array.from(titles).some((t) => t.includes(title))) {
        issues.push(`Missing consent from officer/director with title containing: ${title}`)
      }
    }

    // Validate signatures
    for (const consent of consents) {
      if (!consent.signed) {
        issues.push(`${consent.name} (${consent.title}) consent is not signed`)
      }

      if (!consent.signatureDate) {
        issues.push(`${consent.name} (${consent.title}) consent missing signature date`)
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Validate bilingual content requirements
   */
  validateBilingualRequirements(
    documentMetadata: Record<string, any>,
    targetExchange: string
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    // TSX, TSXV require French documents for Quebec companies
    if (['TSX', 'TSXV'].includes(targetExchange)) {
      const isQuebec = documentMetadata.jurisdiction?.includes('QC')

      if (isQuebec) {
        if (!documentMetadata['has_french_prospectus']) {
          issues.push('Quebec-incorporated companies must provide French prospectus for TSX/TSXV')
        }
        if (!documentMetadata['has_french_management_discussion']) {
          issues.push('MD&A must be available in French for Quebec-incorporated companies')
        }
      }
    }

    // Check for bilingual table of contents
    const languages = documentMetadata['document_languages'] || []
    if (languages.length > 1 && !documentMetadata['bilingual_table_of_contents']) {
      issues.push('Bilingual documents must have bilingual table of contents')
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Validate related party transactions disclosure
   */
  validateRelatedPartyTransactions(
    relatedPartyTransactions: Array<{
      relatedParty: string
      description: string
      amount: number
      terms: string
    }>
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    for (const transaction of relatedPartyTransactions) {
      if (!transaction.relatedParty) {
        issues.push('Related party name is required')
      }
      if (!transaction.description) {
        issues.push('Transaction description is required')
      }
      if (transaction.amount === undefined || transaction.amount === null) {
        issues.push('Transaction amount is required')
      }
      if (!transaction.terms) {
        issues.push('Transaction terms must be disclosed')
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Validate proposed offering details
   */
  validateOfferingDetails(offeringData: {
    numberOfShares: number
    sharePrice: number
    totalProceeds: number
    underwriter: string
    offeringType: string
  }): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    if (offeringData.numberOfShares <= 0) {
      issues.push('Number of shares must be greater than zero')
    }

    if (offeringData.sharePrice <= 0) {
      issues.push('Share price must be greater than zero')
    }

    // Validate calculation
    const calculatedProceeds = offeringData.numberOfShares * offeringData.sharePrice
    const discrepancy = Math.abs(calculatedProceeds - offeringData.totalProceeds)
    if (discrepancy > 1000) { // Allow 1000 CAD discrepancy for rounding
      issues.push(
        `Total proceeds calculation mismatch: ${calculatedProceeds} vs ${offeringData.totalProceeds}`
      )
    }

    if (!offeringData.underwriter) {
      issues.push('Lead underwriter must be named')
    }

    const validOfferingTypes = [
      'public_offering',
      'bought_deal',
      'block_trade',
      'agency',
    ]
    if (!validOfferingTypes.includes(offeringData.offeringType)) {
      issues.push(`Offering type must be one of: ${validOfferingTypes.join(', ')}`)
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Comprehensive SEDAR filing validation
   */
  validateCompleteFiling(filingData: Record<string, any>): {
    valid: boolean
    errors: Record<string, string[]>
    warnings: string[]
  } {
    const errors: Record<string, string[]> = {}
    const warnings: string[] = []

    // Validate prospectus sections
    if (filingData.prospectusContent) {
      const prospectusValidation = this.validateProspectusCompleteness(
        filingData.prospectusContent
      )
      if (!prospectusValidation.valid) {
        errors['prospectus_sections'] = prospectusValidation.missingRun.map((s) => s.name)
      }
    }

    // Validate financial statements
    if (filingData.financialStatements) {
      const financialValidation = this.validateFinancialStatementsIFRS(
        filingData.financialStatements
      )
      if (!financialValidation.valid) {
        errors['financial_statements'] = financialValidation.missingStatements
      }
    }

    // Validate offering details
    if (filingData.offering) {
      const offeringValidation = this.validateOfferingDetails(filingData.offering)
      if (!offeringValidation.valid) {
        errors['offering_details'] = offeringValidation.issues
      }
    }

    // Validate consents
    if (filingData.consents) {
      const consentValidation = this.validateConsents(filingData.consents)
      if (!consentValidation.valid) {
        errors['consents'] = consentValidation.issues
      }
    }

    // Validate bilingual requirements
    if (filingData.documentMetadata) {
      const bilingualValidation = this.validateBilingualRequirements(
        filingData.documentMetadata,
        filingData.targetExchange || 'TSX'
      )
      if (!bilingualValidation.valid) {
        warnings.push(...bilingualValidation.issues)
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      warnings,
    }
  }
}

/**
 * Create a pre-configured SEDAR validator
 */
export function createSEDARValidator(): SEDARValidator {
  return new SEDARValidator()
}
