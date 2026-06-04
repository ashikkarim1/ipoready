/**
 * Prospectus Test Fixtures
 * ========================
 * Sample prospectus files and test company data for comprehensive testing.
 * Covers Canadian (SEDAR 2) and US (SEC EDGAR) formats.
 */

import { DocumentMetadata, FilingMetadata, DocumentType } from '@/lib/filing-adapters/BaseFilingAdapter'

// ====================================================================
// SAMPLE COMPANY DATA
// ====================================================================

/**
 * Test company: TechVenture Inc (Canadian, SEDAR 2)
 */
export const TECH_VENTURE_COMPANY: FilingMetadata = {
  companyId: 'test-company-001',
  companyName: 'TechVenture Inc',
  filingType: 'prospectus',
  currencyCode: 'CAD',
  country: 'CA',
  fiscalYearEnd: new Date('2024-12-31'),
  auditFirmName: 'Deloitte LLP',
  auditFirmId: 'DEL-001',
  underwriterNames: ['TD Securities', 'RBC Capital Markets'],
  prospectusFileId: 'PROSP-TV-2024-001',
  submittedBy: 'test@techventure.ca',
  submittedAt: new Date('2024-06-01T10:00:00Z'),
  customMetadata: {
    industry: 'Technology',
    province: 'ON',
    exchangeTarget: 'TSX',
  },
}

/**
 * Test company: BioInnovate Corp (US, SEC EDGAR)
 */
export const BIO_INNOVATE_COMPANY: FilingMetadata = {
  companyId: 'test-company-002',
  companyName: 'BioInnovate Corp',
  filingType: 'prospectus',
  currencyCode: 'USD',
  country: 'US',
  fiscalYearEnd: new Date('2024-12-31'),
  auditFirmName: 'EY',
  auditFirmId: 'EY-001',
  underwriterNames: ['Goldman Sachs', 'Morgan Stanley'],
  prospectusFileId: 'BIO-2024-S-1',
  submittedBy: 'filing@bioinnovate.com',
  submittedAt: new Date('2024-06-02T14:30:00Z'),
  customMetadata: {
    industry: 'Biotechnology',
    state: 'CA',
    exchangeTarget: 'NASDAQ',
  },
}

/**
 * Test company: Green Energy Solutions (Cross-border)
 */
export const GREEN_ENERGY_COMPANY: FilingMetadata = {
  companyId: 'test-company-003',
  companyName: 'Green Energy Solutions Ltd',
  filingType: 'prospectus',
  currencyCode: 'CAD',
  country: 'CA',
  fiscalYearEnd: new Date('2024-12-31'),
  auditFirmName: 'PwC',
  auditFirmId: 'PWC-001',
  underwriterNames: ['Scotiabank', 'CIBC Capital Markets'],
  prospectusFileId: 'GES-2024-001',
  submittedBy: 'compliance@greenenergy.ca',
  submittedAt: new Date('2024-06-03T09:15:00Z'),
  customMetadata: {
    industry: 'Clean Energy',
    province: 'BC',
    exchangeTarget: 'TSX',
    crossBorderFiling: true,
  },
}

// ====================================================================
// PROSPECTUS DOCUMENT FIXTURES
// ====================================================================

/**
 * Sample prospectus PDF content (base64 encoded minimal PDF)
 * This is a valid minimal PDF structure for testing
 */
const SAMPLE_PDF_CONTENT = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Sample Prospectus) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000241 00000 n
0000000333 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
427
%%EOF`

/**
 * Canadian prospectus document (SEDAR 2 format)
 */
export const CANADIAN_PROSPECTUS: DocumentMetadata = {
  id: 'doc-prospectus-001',
  type: DocumentType.PROSPECTUS,
  format: 'pdf',
  fileName: 'TechVenture-Prospectus-2024.pdf',
  mimeType: 'application/pdf',
  size: 2500000, // 2.5 MB
  checksum: 'sha256-techventure-prospectus-2024',
  version: '1.0.0',
  createdAt: new Date('2024-05-20T10:00:00Z'),
  updatedAt: new Date('2024-05-25T14:30:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: true,
}

/**
 * Bilingual prospectus (English + French for Quebec)
 */
export const BILINGUAL_PROSPECTUS: DocumentMetadata = {
  id: 'doc-prospectus-bilingual-001',
  type: DocumentType.PROSPECTUS,
  format: 'pdf',
  fileName: 'TechVenture-Prospectus-2024-FR.pdf',
  mimeType: 'application/pdf',
  size: 2700000, // 2.7 MB (slightly larger due to French)
  checksum: 'sha256-techventure-prospectus-2024-fr',
  version: '1.0.0',
  createdAt: new Date('2024-05-20T10:00:00Z'),
  updatedAt: new Date('2024-05-25T14:30:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'fr',
  validated: true,
}

/**
 * US prospectus (SEC S-1 format)
 */
export const US_PROSPECTUS: DocumentMetadata = {
  id: 'doc-prospectus-us-001',
  type: DocumentType.PROSPECTUS,
  format: 'pdf',
  fileName: 'BioInnovate-S1-2024.pdf',
  mimeType: 'application/pdf',
  size: 3200000, // 3.2 MB
  checksum: 'sha256-bioinnovate-s1-2024',
  version: '1.0.0',
  createdAt: new Date('2024-05-21T10:00:00Z'),
  updatedAt: new Date('2024-05-26T14:30:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: true,
}

/**
 * Financial statements document
 */
export const FINANCIAL_STATEMENTS: DocumentMetadata = {
  id: 'doc-financial-001',
  type: DocumentType.FINANCIAL_STATEMENTS,
  format: 'pdf',
  fileName: 'TechVenture-Financial-Statements-2023-2024.pdf',
  mimeType: 'application/pdf',
  size: 1800000, // 1.8 MB
  checksum: 'sha256-techventure-financials',
  version: '2.0.0',
  createdAt: new Date('2024-04-15T10:00:00Z'),
  updatedAt: new Date('2024-05-18T11:00:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: true,
}

/**
 * Management discussion and analysis (MD&A)
 */
export const MD_A_DOCUMENT: DocumentMetadata = {
  id: 'doc-mda-001',
  type: DocumentType.MD_A,
  format: 'pdf',
  fileName: 'TechVenture-MDA-2024.pdf',
  mimeType: 'application/pdf',
  size: 950000, // 950 KB
  checksum: 'sha256-techventure-mda',
  version: '1.0.0',
  createdAt: new Date('2024-05-10T10:00:00Z'),
  updatedAt: new Date('2024-05-22T15:00:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: true,
}

/**
 * Certificate of compliance
 */
export const CERTIFICATE_OF_COMPLIANCE: DocumentMetadata = {
  id: 'doc-cert-001',
  type: DocumentType.CERTIFICATE,
  format: 'pdf',
  fileName: 'TechVenture-Certificate-of-Compliance.pdf',
  mimeType: 'application/pdf',
  size: 280000, // 280 KB
  checksum: 'sha256-techventure-cert',
  version: '1.0.0',
  createdAt: new Date('2024-05-28T10:00:00Z'),
  updatedAt: new Date('2024-05-28T10:00:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: true,
}

/**
 * Auditor consent document
 */
export const AUDITOR_CONSENT: DocumentMetadata = {
  id: 'doc-auditor-001',
  type: DocumentType.OTHER,
  format: 'pdf',
  fileName: 'Deloitte-Auditor-Consent.pdf',
  mimeType: 'application/pdf',
  size: 120000, // 120 KB
  checksum: 'sha256-deloitte-consent',
  version: '1.0.0',
  createdAt: new Date('2024-05-25T10:00:00Z'),
  updatedAt: new Date('2024-05-25T10:00:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: true,
}

// ====================================================================
// DOCUMENT BUNDLE FIXTURES
// ====================================================================

/**
 * Complete Canadian prospectus filing bundle
 */
export const CANADIAN_FILING_BUNDLE = {
  documents: [
    CANADIAN_PROSPECTUS,
    FINANCIAL_STATEMENTS,
    MD_A_DOCUMENT,
    CERTIFICATE_OF_COMPLIANCE,
    AUDITOR_CONSENT,
  ],
  metadata: TECH_VENTURE_COMPANY,
}

/**
 * Complete US prospectus filing bundle
 */
export const US_FILING_BUNDLE = {
  documents: [US_PROSPECTUS, FINANCIAL_STATEMENTS],
  metadata: BIO_INNOVATE_COMPANY,
}

/**
 * Bilingual Canadian filing bundle
 */
export const BILINGUAL_FILING_BUNDLE = {
  documents: [
    CANADIAN_PROSPECTUS,
    BILINGUAL_PROSPECTUS,
    FINANCIAL_STATEMENTS,
    MD_A_DOCUMENT,
    CERTIFICATE_OF_COMPLIANCE,
  ],
  metadata: TECH_VENTURE_COMPANY,
}

// ====================================================================
// INVALID/ERROR TEST FIXTURES
// ====================================================================

/**
 * Corrupted prospectus document
 */
export const CORRUPTED_PROSPECTUS: DocumentMetadata = {
  id: 'doc-corrupted-001',
  type: DocumentType.PROSPECTUS,
  format: 'pdf',
  fileName: 'Corrupted-Prospectus.pdf',
  mimeType: 'application/pdf',
  size: 100000,
  checksum: 'sha256-corrupted-invalid',
  version: '1.0.0',
  createdAt: new Date('2024-05-20T10:00:00Z'),
  updatedAt: new Date('2024-05-25T14:30:00Z'),
  content: 'CORRUPTED_BINARY_DATA_XXXX_NOT_VALID_PDF',
  language: 'en',
  validated: false,
}

/**
 * Oversized prospectus (exceeds limit)
 */
export const OVERSIZED_PROSPECTUS: DocumentMetadata = {
  id: 'doc-oversized-001',
  type: DocumentType.PROSPECTUS,
  format: 'pdf',
  fileName: 'Oversized-Prospectus.pdf',
  mimeType: 'application/pdf',
  size: 500000000, // 500 MB - exceeds limits
  checksum: 'sha256-oversized',
  version: '1.0.0',
  createdAt: new Date('2024-05-20T10:00:00Z'),
  updatedAt: new Date('2024-05-25T14:30:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: false,
}

/**
 * Document with invalid checksum
 */
export const INVALID_CHECKSUM_DOCUMENT: DocumentMetadata = {
  id: 'doc-invalid-check-001',
  type: DocumentType.PROSPECTUS,
  format: 'pdf',
  fileName: 'Invalid-Checksum.pdf',
  mimeType: 'application/pdf',
  size: 2500000,
  checksum: 'sha256-invalid-checksum-mismatch',
  version: '1.0.0',
  createdAt: new Date('2024-05-20T10:00:00Z'),
  updatedAt: new Date('2024-05-25T14:30:00Z'),
  content: SAMPLE_PDF_CONTENT,
  language: 'en',
  validated: false,
}

/**
 * Incomplete filing bundle (missing required documents)
 */
export const INCOMPLETE_FILING_BUNDLE = {
  documents: [CANADIAN_PROSPECTUS], // Missing financial statements
  metadata: TECH_VENTURE_COMPANY,
}
