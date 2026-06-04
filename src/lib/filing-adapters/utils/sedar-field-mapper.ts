/**
 * SEDAR Field Mapper
 * ==================
 * Maps IPOReady internal field names to SEDAR regulatory field names
 * Handles format conversion, validation, and data transformation
 *
 * Maps:
 * - Company information fields
 * - Document metadata
 * - Financial data
 * - Signing officer information
 * - Exchange-specific fields
 */

/**
 * SEDAR field mapping configuration
 */
export interface FieldMapConfig {
  iporeadyFieldName: string
  sedarFieldName: string
  required: boolean
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object'
  transform?: (value: any) => any
  validate?: (value: any) => boolean | { valid: boolean; reason?: string }
  description: string
}

/**
 * Comprehensive mapping between IPOReady fields and SEDAR fields
 */
export const SEDAR_FIELD_MAPPINGS: FieldMapConfig[] = [
  // Company Information
  {
    iporeadyFieldName: 'companyLegalName',
    sedarFieldName: 'legal_name',
    required: true,
    dataType: 'string',
    validate: (v) => v.length > 0 && v.length <= 255,
    description: 'Legal company name as registered',
  },
  {
    iporeadyFieldName: 'companyJurisdiction',
    sedarFieldName: 'jurisdiction_of_incorporation',
    required: true,
    dataType: 'string',
    transform: (v) => v.toUpperCase(),
    validate: (v) => /^[A-Z]{2}$/.test(v),
    description: 'Province or territory code (e.g., ON, BC, QC)',
  },
  {
    iporeadyFieldName: 'companyRegistrationNumber',
    sedarFieldName: 'company_number',
    required: true,
    dataType: 'string',
    description: 'Corporate registration number',
  },
  {
    iporeadyFieldName: 'exchangeSymbol',
    sedarFieldName: 'ticker_symbol',
    required: true,
    dataType: 'string',
    transform: (v) => v.toUpperCase(),
    validate: (v) => /^[A-Z]{1,4}$/.test(v),
    description: 'Trading symbol (max 4 uppercase letters)',
  },
  {
    iporeadyFieldName: 'targetExchange',
    sedarFieldName: 'listing_exchange',
    required: true,
    dataType: 'string',
    transform: (v) => {
      const map: Record<string, string> = {
        tsx: 'TSX',
        tsxv: 'TSXV',
        cse: 'CSE',
      }
      return map[v.toLowerCase()] || v
    },
    description: 'Target listing exchange (TSX, TSXV, CSE)',
  },

  // Prospectus Information
  {
    iporeadyFieldName: 'prospectusDate',
    sedarFieldName: 'prospectus_date',
    required: true,
    dataType: 'date',
    transform: (v) => {
      if (typeof v === 'string') return v
      return v instanceof Date ? v.toISOString().split('T')[0] : v
    },
    validate: (v) => {
      const date = new Date(v)
      return !isNaN(date.getTime())
    },
    description: 'Date of prospectus (YYYY-MM-DD)',
  },
  {
    iporeadyFieldName: 'prospectusVersion',
    sedarFieldName: 'prospectus_version',
    required: false,
    dataType: 'string',
    transform: (v) => String(v).toUpperCase(),
    description: 'Version indicator (e.g., PRELIMINARY, FINAL)',
  },
  {
    iporeadyFieldName: 'prospectusType',
    sedarFieldName: 'prospectus_type',
    required: true,
    dataType: 'string',
    transform: (v) => {
      const map: Record<string, string> = {
        ipo: 'PROSPECTUS',
        rto: 'PROSPECTUS',
        direct_listing: 'PROSPECTUS',
      }
      return map[v.toLowerCase()] || 'PROSPECTUS'
    },
    description: 'Type of prospectus',
  },

  // Offering Information
  {
    iporeadyFieldName: 'numberOfShares',
    sedarFieldName: 'offering_shares',
    required: true,
    dataType: 'number',
    validate: (v) => v > 0,
    description: 'Number of shares being offered',
  },
  {
    iporeadyFieldName: 'sharePrice',
    sedarFieldName: 'offering_price_per_share',
    required: true,
    dataType: 'number',
    transform: (v) => parseFloat(v).toFixed(2),
    validate: (v) => v > 0,
    description: 'Price per share in CAD',
  },
  {
    iporeadyFieldName: 'offeringAmount',
    sedarFieldName: 'offering_gross_proceeds',
    required: true,
    dataType: 'number',
    transform: (v) => parseFloat(v).toFixed(2),
    validate: (v) => v > 0,
    description: 'Total gross offering proceeds in CAD millions',
  },
  {
    iporeadyFieldName: 'currencyCode',
    sedarFieldName: 'currency',
    required: true,
    dataType: 'string',
    transform: (v) => 'CAD',
    validate: (v) => v === 'CAD',
    description: 'Currency code (SEDAR requires CAD)',
  },

  // Underwriter Information
  {
    iporeadyFieldName: 'leadUnderwriter',
    sedarFieldName: 'lead_underwriter',
    required: true,
    dataType: 'string',
    description: 'Lead underwriter name',
  },
  {
    iporeadyFieldName: 'underwriterContact',
    sedarFieldName: 'underwriter_contact_email',
    required: true,
    dataType: 'string',
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    description: 'Underwriter contact email',
  },

  // Officer Information
  {
    iporeadyFieldName: 'ceoName',
    sedarFieldName: 'ceo_name',
    required: true,
    dataType: 'string',
    description: 'Chief Executive Officer name',
  },
  {
    iporeadyFieldName: 'cfoName',
    sedarFieldName: 'cfo_name',
    required: true,
    dataType: 'string',
    description: 'Chief Financial Officer name',
  },
  {
    iporeadyFieldName: 'boardChairname',
    sedarFieldName: 'board_chair_name',
    required: false,
    dataType: 'string',
    description: 'Board of Directors Chair name',
  },

  // Financial Information
  {
    iporeadyFieldName: 'fiscalYearEnd',
    sedarFieldName: 'fiscal_year_end',
    required: true,
    dataType: 'date',
    transform: (v) => {
      if (typeof v === 'string') return v
      return v instanceof Date ? v.toISOString().split('T')[0] : v
    },
    description: 'Fiscal year-end date (YYYY-MM-DD)',
  },
  {
    iporeadyFieldName: 'accountingStandard',
    sedarFieldName: 'accounting_standard',
    required: true,
    dataType: 'string',
    transform: (v) => v.toUpperCase(),
    validate: (v) => ['IFRS', 'ASPE'].includes(v),
    description: 'Accounting standard (IFRS or ASPE)',
  },
  {
    iporeadyFieldName: 'auditedFinancialStatements',
    sedarFieldName: 'has_audited_financials',
    required: true,
    dataType: 'boolean',
    description: 'Whether company has audited financial statements',
  },

  // Compliance Information
  {
    iporeadyFieldName: 'statementOfCompliance',
    sedarFieldName: 'statement_of_compliance',
    required: true,
    dataType: 'boolean',
    description: 'Declaration of compliance with securities laws',
  },
  {
    iporeadyFieldName: 'certificationsReviewedByAudit',
    sedarFieldName: 'audit_committee_approved',
    required: true,
    dataType: 'boolean',
    description: 'Audit committee has reviewed certifications',
  },

  // Document Metadata
  {
    iporeadyFieldName: 'documentLanguage',
    sedarFieldName: 'document_language',
    required: true,
    dataType: 'string',
    transform: (v) => (v === 'fr' ? 'FRENCH' : 'ENGLISH'),
    validate: (v) => ['ENGLISH', 'FRENCH', 'BOTH'].includes(v),
    description: 'Document language (ENGLISH, FRENCH, BOTH)',
  },
]

/**
 * SEDAR Field Mapper utility class
 */
export class SEDARFieldMapper {
  private mappingMap: Map<string, FieldMapConfig>

  constructor(mappings: FieldMapConfig[] = SEDAR_FIELD_MAPPINGS) {
    this.mappingMap = new Map(mappings.map((m) => [m.iporeadyFieldName, m]))
  }

  /**
   * Map IPOReady data to SEDAR format
   */
  mapToSEDARFormat(iporeadyData: Record<string, any>): Record<string, any> {
    const sedarData: Record<string, any> = {}

    for (const [iporeadyField, value] of Object.entries(iporeadyData)) {
      const mapping = this.mappingMap.get(iporeadyField)

      if (mapping) {
        try {
          let transformedValue = value

          // Apply custom transformation if provided
          if (mapping.transform) {
            transformedValue = mapping.transform(value)
          }

          // Store in SEDAR field name
          sedarData[mapping.sedarFieldName] = transformedValue
        } catch (error) {
          console.warn(`Failed to map field ${iporeadyField}:`, error)
        }
      }
    }

    return sedarData
  }

  /**
   * Map SEDAR format back to IPOReady format
   */
  mapToIPOReadyFormat(sedarData: Record<string, any>): Record<string, any> {
    const iporeadyData: Record<string, any> = {}

    // Create reverse mapping
    const reverseMap = new Map<string, FieldMapConfig>()
    for (const mapping of this.mappingMap.values()) {
      reverseMap.set(mapping.sedarFieldName, mapping)
    }

    for (const [sedarField, value] of Object.entries(sedarData)) {
      const mapping = reverseMap.get(sedarField)

      if (mapping) {
        iporeadyData[mapping.iporeadyFieldName] = value
      }
    }

    return iporeadyData
  }

  /**
   * Validate value against mapping rules
   */
  validateField(fieldName: string, value: any): { valid: boolean; reason?: string } {
    const mapping = this.mappingMap.get(fieldName)

    if (!mapping) {
      return { valid: false, reason: `Unknown field: ${fieldName}` }
    }

    // Check required fields
    if (mapping.required && (value === undefined || value === null || value === '')) {
      return { valid: false, reason: `Required field missing: ${fieldName}` }
    }

    // Skip validation for empty optional fields
    if (!mapping.required && (value === undefined || value === null || value === '')) {
      return { valid: true }
    }

    // Type checking
    if (typeof value !== this.getJSType(mapping.dataType)) {
      return { valid: false, reason: `Invalid type for ${fieldName}: expected ${mapping.dataType}` }
    }

    // Custom validation if provided
    if (mapping.validate) {
      const result = mapping.validate(value)
      if (typeof result === 'boolean') {
        return { valid: result }
      }
      return result
    }

    return { valid: true }
  }

  /**
   * Validate entire object against SEDAR requirements
   */
  validateObject(data: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const mapping of this.mappingMap.values()) {
      const value = data[mapping.iporeadyFieldName]
      const validation = this.validateField(mapping.iporeadyFieldName, value)

      if (!validation.valid) {
        errors.push(validation.reason || `Validation failed for ${mapping.iporeadyFieldName}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get mapping configuration for a field
   */
  getMapping(fieldName: string): FieldMapConfig | undefined {
    return this.mappingMap.get(fieldName)
  }

  /**
   * Get all required fields
   */
  getRequiredFields(): string[] {
    return Array.from(this.mappingMap.values())
      .filter((m) => m.required)
      .map((m) => m.iporeadyFieldName)
  }

  /**
   * Get SEDAR field name from IPOReady field name
   */
  getSEDARFieldName(iporeadyFieldName: string): string | undefined {
    return this.mappingMap.get(iporeadyFieldName)?.sedarFieldName
  }

  /**
   * Helper: Convert dataType to JavaScript type
   */
  private getJSType(dataType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'date': 'string', // Dates are handled as strings (ISO format)
      'boolean': 'boolean',
      'array': 'object',
      'object': 'object',
    }

    return typeMap[dataType] || 'string'
  }
}

/**
 * Create a pre-configured SEDAR field mapper
 */
export function createSEDARFieldMapper(): SEDARFieldMapper {
  return new SEDARFieldMapper(SEDAR_FIELD_MAPPINGS)
}
