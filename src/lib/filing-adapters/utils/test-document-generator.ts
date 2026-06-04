/**
 * Test Document Generator for Filing System Testing
 * Generates sample prospectuses, financial statements, and edge-case documents
 */

import { DocumentType } from '../BaseFilingAdapter'

export interface GeneratedDocument {
  filename: string
  mimeType: string
  content: Buffer | string
  size: number
  documentType: DocumentType
  metadata: {
    companyName: string
    country: string
    format: string
    version: string
  }
}

/**
 * Generate a sample prospectus compliant with IFRS (Canada) or US GAAP (US)
 */
export function generateSampleProspectus(
  country: 'CA' | 'US',
  companyName: string = 'Test IPO Corp'
): GeneratedDocument {
  const isCanadian = country === 'CA'

  const content = `PROSPECTUS\n\nCompany: ${companyName}\nCountry: ${country}\nFormat: ${isCanadian ? 'IFRS' : 'US GAAP'}\n\nRISK FACTORS:\n- Market risk\n- Competition risk\n- Technology risk\n\nFINANCIAL HIGHLIGHTS:\nRevenue 2023: $10,500,000\nNet Income 2023: $1,575,000\nTotal Assets: $8,500,000\n\nAUDITOR'S REPORT:\nWe have audited the consolidated financial statements.\n\nTest prospectus generated on ${new Date().toISOString()}`

  const buffer = Buffer.from(content, 'utf-8')

  return {
    filename: `prospectus_${country.toUpperCase()}_${Date.now()}.pdf`,
    mimeType: 'application/pdf',
    content: buffer,
    size: buffer.length,
    documentType: 'prospectus' as DocumentType,
    metadata: {
      companyName,
      country,
      format: isCanadian ? 'IFRS' : 'US GAAP',
      version: '1.0'
    }
  }
}

/**
 * Generate required documents for a filing
 */
export function generateRequiredDocuments(
  country: 'CA' | 'US',
  companyName: string = 'Test IPO Corp'
): GeneratedDocument[] {
  return [
    generateSampleProspectus(country, companyName),
    {
      filename: `financial_statements_${Date.now()}.xml`,
      mimeType: 'text/xml',
      content: Buffer.from(`<xbrl><context>Financial data for ${companyName}</context></xbrl>`, 'utf-8'),
      size: 125000,
      documentType: 'financial_statements' as DocumentType,
      metadata: { companyName, country, format: 'XBRL', version: '1.0' }
    },
    {
      filename: `auditor_report_${Date.now()}.pdf`,
      mimeType: 'application/pdf',
      content: Buffer.from(`Auditor Report\n\nWe have audited the financial statements of ${companyName}.`, 'utf-8'),
      size: 45000,
      documentType: 'auditor_report' as DocumentType,
      metadata: { companyName, country, format: 'PDF', version: '1.0' }
    }
  ]
}

/**
 * Generate edge-case documents for error testing
 */
export function generateEdgeCaseDocuments(): GeneratedDocument[] {
  return [
    {
      filename: 'oversized_document.pdf',
      mimeType: 'application/pdf',
      content: Buffer.alloc(160 * 1024 * 1024),
      size: 160 * 1024 * 1024,
      documentType: 'prospectus' as DocumentType,
      metadata: { companyName: 'Oversized Test', country: 'US', format: 'PDF', version: '1.0' }
    },
    {
      filename: 'invalid_xbrl.xml',
      mimeType: 'text/xml',
      content: Buffer.from('<invalid>Not XBRL</invalid>', 'utf-8'),
      size: 30,
      documentType: 'financial_statements' as DocumentType,
      metadata: { companyName: 'Invalid Test', country: 'US', format: 'XBRL', version: '1.0' }
    }
  ]
}
