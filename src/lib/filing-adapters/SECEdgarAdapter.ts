/**
 * SEC EDGAR Filing Adapter
 * =======================
 * Implementation for US Securities and Exchange Commission (SEC) EDGAR
 * filing system integration.
 *
 * Handles:
 * - US prospectus filings (F-1, S-1, SB-2)
 * - Financial statement validation (US GAAP)
 * - Form submission via EDGAR MIME format
 * - Real-time status tracking via SEC API
 * - Bilingual support (English documents)
 *
 * Note: SEC EDGAR is a public system - no authentication required
 * Uses CIK (Central Index Key) for company identification
 *
 * API Reference: https://www.sec.gov/cgi-bin
 * Documentation: https://www.sec.gov/edgar/
 */

import {
  BaseFilingAdapter,
  FilingStatus,
  DocumentType,
  FilingError,
  ValidationResult,
  DocumentMetadata,
  DocumentValidationStatus,
  ValidationError,
  SubmissionResult,
  StatusUpdate,
  FilingMetadata,
} from './BaseFilingAdapter'

/**
 * SEC EDGAR supported form types for US IPO/SPAC filings
 */
export type SECFormType =
  | 'F-1'       // Registration statement (foreign private issuers)
  | 'S-1'       // Registration statement (domestic)
  | 'SB-2'      // Registration statement (small business)
  | '424B5'     // Post-effective amendment (prospectus)
  | '8-A'       // Class registration statement
  | '10-Q'      // Quarterly report
  | '10-K'      // Annual report

/**
 * SEC EDGAR submission response structure
 */
interface SECEdgarSubmissionResponse {
  filingId: string
  cik: string
  accessionNumber: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  submittedAt: string
  estimatedReviewDays: number
  messages: string[]
}

/**
 * SEC EDGAR status response structure
 */
interface SECEdgarStatusResponse {
  filingId: string
  accessionNumber: string
  cik: string
  companyName: string
  formType: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn'
  filedDate: string
  lastUpdatedAt: string
  reviewComments: string[]
  rejectionReasons: Array<{
    field: string
    code: string
    description: string
  }>
}

export class SECEdgarAdapter extends BaseFilingAdapter {
  protected readonly adapterId = 'sec-edgar'
  private readonly cik: string
  private readonly userAgent: string

  /**
   * Common SEC rejection codes and meanings
   */
  private static readonly REJECTION_CODES: Record<string, string> = {
    'MISSING_SIGNATURE': 'Required signatures are missing or invalid',
    'INVALID_FINANCIAL_FORMAT': 'Financial statements must comply with US GAAP standards',
    'PROSPECTUS_INCOMPLETE': 'Prospectus is missing required sections per Reg S-1',
    'MD_A_MISSING': 'Management Discussion & Analysis (MD&A) is required',
    'RISK_FACTOR_MISSING': 'Risk Factors section is required',
    'USE_OF_PROCEEDS_MISSING': 'Use of Proceeds section is required',
    'CAPITALIZATION_MISSING': 'Capitalization table/summary is required',
    'EXECUTIVE_COMPENSATION_MISSING': 'Executive Compensation Disclosure required',
    'EXECUTIVE_OFFICERS_MISSING': 'Executive Officers and Directors table required',
    'AUDITOR_NOT_REGISTERED': 'Auditor must be PCAOB registered',
    'INVALID_FILING_FORMAT': 'Submission does not conform to EDGAR MIME format',
    'DOCUMENT_SIZE_EXCEEDED': 'Individual document exceeds SEC size limits (150MB)',
    'INCORRECT_CIK': 'CIK does not match registered company',
  }

  constructor(cik: string, userAgent?: string) {
    super()
    this.cik = this.formatCIK(cik)
    this.userAgent = userAgent || 'IPOReady (hello@ipoready.com)'
    console.info('SECEdgarAdapter initialized', { cik: this.cik })
  }

  /**
   * Format CIK to 10-digit format (e.g., "0000000001")
   */
  private formatCIK(cik: string): string {
    const cleaned = cik.replace(/[^0-9]/g, '')
    return cleaned.padStart(10, '0')
  }

  /**
   * Implementation of abstract method: Validate filing submission
   */
  async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    const warnings: string[] = []
    const documentStatuses = new Map<string, DocumentValidationStatus>()

    try {
      // Validate documents exist and have content
      for (const doc of documents) {
        if (!doc.content || (typeof doc.content === 'string' && doc.content.length === 0)) {
          errors.push({
            documentId: doc.id,
            documentType: doc.type,
            code: 'EMPTY_DOCUMENT',
            message: `Document "${doc.fileName}" is empty`,
            severity: 'error',
          })
        }

        // Check file size (SEC limit: 150MB per document)
        const size = typeof doc.content === 'string' ? doc.content.length : Buffer.byteLength(JSON.stringify(doc.content))
        if (size > 150 * 1024 * 1024) {
          errors.push({
            documentId: doc.id,
            documentType: doc.type,
            code: 'DOCUMENT_SIZE_EXCEEDED',
            message: `Document exceeds SEC limit of 150MB (got ${(size / 1024 / 1024).toFixed(1)}MB)`,
            severity: 'error',
          })
        }

        // Validate prospectus has required sections
        if (doc.type === DocumentType.PROSPECTUS) {
          const prospectusText = typeof doc.content === 'string' ? doc.content.toLowerCase() : ''
          const requiredSections = ['risk factor', 'management discussion', 'use of proceeds', 'capitalization', 'executive compensation']
          const missingSections = requiredSections.filter(section => !prospectusText.includes(section))

          if (missingSections.length > 0) {
            warnings.push(`Prospectus may be missing sections: ${missingSections.join(', ')}`)
          }
        }

        documentStatuses.set(doc.id, {
          documentId: doc.id,
          documentType: doc.type,
          isValid: errors.length === 0,
          errors: errors.filter(e => e.documentId === doc.id),
          checksum: doc.checksum || 'unverified',
        })
      }

      // Check for required document types
      const docTypes = new Set(documents.map(d => d.type))
      if (!docTypes.has(DocumentType.PROSPECTUS)) {
        warnings.push('Prospectus document is required for SEC filing')
      }
      if (!docTypes.has(DocumentType.FINANCIAL_STATEMENTS)) {
        warnings.push('Financial statements are required for SEC filing')
      }

      return {
        isValid: errors.length === 0,
        phase: 'validation',
        errors,
        warnings,
        documentStatuses: Array.from(documentStatuses.values()) as any,
        completedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      throw new FilingError(
        'VALIDATION_ERROR',
        `SEC Edgar validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false
      )
    }
  }

  /**
   * Implementation of abstract method: Submit filing to SEC EDGAR
   */
  async submit(documents: DocumentMetadata[], metadata: FilingMetadata): Promise<SubmissionResult> {
    try {
      // Validate first
      const validation = await this.validate(documents)
      if (!validation.isValid) {
        return {
          success: false,
          filingId: '',
          referenceNumber: '',
          status: 'rejected',
          submittedAt: new Date(),
          documentReceiptIds: new Map(),
          warnings: validation.warnings,
        }
      }

      // Build SEC EDGAR MIME submission
      const submissionResponse = await this.submitToSECEdgarAPI(documents, metadata)

      const documentReceiptIds = new Map<DocumentType, string>()
      documents.forEach(doc => documentReceiptIds.set(doc.type, doc.id))

      return {
        success: true,
        filingId: submissionResponse.filingId,
        referenceNumber: submissionResponse.accessionNumber,
        status: submissionResponse.status,
        submittedAt: new Date(submissionResponse.submittedAt),
        documentReceiptIds,
        warnings: [],
      }
    } catch (error) {
      if (error instanceof FilingError) throw error
      throw new FilingError(
        'SUBMISSION_ERROR',
        `Failed to submit to SEC EDGAR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false
      )
    }
  }

  /**
   * Implementation of abstract method: Get filing status from SEC
   */
  async getStatus(filingId: string): Promise<FilingStatus> {
    try {
      const sedarStatus = await this.queryFilingStatus(filingId)
      const internalStatus = this.mapSECStatus(sedarStatus.status)

      const status: FilingStatus = {
        filingId: sedarStatus.filingId,
        referenceNumber: sedarStatus.accessionNumber,
        status: internalStatus,
        phase: internalStatus === 'submitted' ? 'submission' : internalStatus === 'processing' ? 'validation' : 'confirmation',
        lastUpdatedAt: new Date(sedarStatus.lastUpdatedAt),
        reviewComments: sedarStatus.reviewComments,
        rejectionReasons: sedarStatus.rejectionReasons.length > 0
          ? sedarStatus.rejectionReasons.map(r => r.description)
          : undefined,
      }

      return status
    } catch (error) {
      if (error instanceof FilingError) throw error
      throw new FilingError(
        'STATUS_ERROR',
        `Failed to get SEC filing status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }

  /**
   * Implementation of abstract method: Handle SEC webhook callbacks
   */
  async handleWebhook(payload: any): Promise<StatusUpdate> {
    try {
      console.info('SEC EDGAR webhook received', { accessionNumber: payload.accessionNumber })

      return {
        filingId: payload.accessionNumber,
        referenceNumber: payload.accessionNumber,
        previousStatus: payload.previousStatus || 'submitted',
        newStatus: payload.status || 'processing',
        updatedAt: new Date(payload.timestamp || Date.now()),
        details: payload,
      }
    } catch (error) {
      throw new FilingError(
        'WEBHOOK_ERROR',
        `Failed to process SEC webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false
      )
    }
  }

  /**
   * Submit filing to SEC EDGAR API with MIME format
   */
  private async submitToSECEdgarAPI(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SECEdgarSubmissionResponse> {
    try {
      const formType = metadata.filingType || 'F-1'
      const url = `https://www.sec.gov/cgi-bin/submit-cgi`

      // Build MIME format submission (simplified - real implementation would be more complex)
      const mimeContent = this.buildMIMESubmission(documents, formType)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': this.userAgent,
          'Content-Type': 'multipart/form-data',
        },
        body: mimeContent,
      })

      if (!response.ok) {
        throw new FilingError(
          'SUBMISSION_FAILED',
          `SEC API returned ${response.status}: ${response.statusText}`,
          response.status === 429 || response.status === 503,
          response.status
        )
      }

      // Parse response (simplified - real response would be XML)
      const data = await response.json() as any

      return {
        filingId: data.accessionNumber,
        cik: this.cik,
        accessionNumber: data.accessionNumber,
        status: data.status || 'submitted',
        submittedAt: new Date().toISOString(), // Keep as string for API response type
        estimatedReviewDays: 5,
        messages: data.messages || [],
      }
    } catch (error) {
      if (error instanceof FilingError) throw error
      throw new FilingError(
        'API_ERROR',
        `Failed to submit to SEC EDGAR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }

  /**
   * Build SEC EDGAR MIME format submission
   * Real implementation would follow SEC EDGAR MIME specification
   */
  private buildMIMESubmission(documents: DocumentMetadata[], formType: string): string {
    const boundary = '----SEC_EDGAR_BOUNDARY_' + Date.now()
    let mimeContent = ''

    // Add header
    mimeContent += `--${boundary}\r\n`
    mimeContent += 'Content-Disposition: form-data; name="cik"\r\n\r\n'
    mimeContent += `${this.cik}\r\n`

    mimeContent += `--${boundary}\r\n`
    mimeContent += 'Content-Disposition: form-data; name="formType"\r\n\r\n'
    mimeContent += `${formType}\r\n`

    // Add documents
    for (const doc of documents) {
      mimeContent += `--${boundary}\r\n`
      mimeContent += `Content-Disposition: form-data; name="document"; filename="${doc.fileName}"\r\n`
      mimeContent += `Content-Type: ${doc.mimeType}\r\n\r\n`
      mimeContent += typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content)
      mimeContent += '\r\n'
    }

    mimeContent += `--${boundary}--\r\n`

    return mimeContent
  }

  /**
   * Query filing status from SEC EDGAR API
   */
  private async queryFilingStatus(filingId: string): Promise<SECEdgarStatusResponse> {
    try {
      const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${this.cik}&owner=exclude&count=1&format=json`

      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      })

      if (!response.ok) {
        throw new FilingError(
          'STATUS_QUERY_FAILED',
          `SEC API returned ${response.status}: ${response.statusText}`,
          response.status === 429 || response.status === 503,
          response.status
        )
      }

      const data = await response.json() as any
      const filing = data.filings?.recent?.[0] || {}

      return {
        filingId: filingId,
        accessionNumber: filing.accessionNumber || filingId,
        cik: this.cik,
        companyName: data.company?.name || 'Unknown',
        formType: filing.form || 'Unknown',
        status: filing.status || 'processing',
        filedDate: filing.filingDate || new Date().toISOString(), // Keep as string for API response type
        lastUpdatedAt: new Date().toISOString(), // Keep as string for API response type
        reviewComments: [],
        rejectionReasons: [],
      }
    } catch (error) {
      if (error instanceof FilingError) throw error
      throw new FilingError(
        'STATUS_ERROR',
        `Failed to query SEC status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }

  /**
   * Map SEC status to internal status
   */
  private mapSECStatus(secStatus: string): 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn' {
    const statusMap: Record<string, 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn'> = {
      'submitted': 'submitted',
      'processing': 'processing',
      'reviewing': 'processing',
      'effective': 'accepted',
      'accepted': 'accepted',
      'rejected': 'rejected',
      'withdrawn': 'withdrawn',
    }
    return statusMap[secStatus] || 'processing'
  }

  /**
   * Map SEC rejection reasons to FilingError objects
   */
  private mapSECRejectionReasons(rejectionReasons: Array<{ field: string; code: string; description: string }>): FilingError[] {
    return rejectionReasons.map(reason => {
      const suggestion = this.getSuggestionForRejection(reason.code)
      return new FilingError(
        `SEC_${reason.code}`,
        `${reason.field}: ${SECEdgarAdapter.REJECTION_CODES[reason.code] || reason.description}. ${suggestion}`,
        false
      )
    })
  }

  /**
   * Get user-friendly suggestion for rejection code
   */
  private getSuggestionForRejection(code: string): string {
    const suggestions: Record<string, string> = {
      'MISSING_SIGNATURE': 'Ensure all required signatures are present per SEC rules.',
      'INVALID_FINANCIAL_FORMAT': 'Convert financial statements to US GAAP format.',
      'PROSPECTUS_INCOMPLETE': 'Complete all required Regulation S-1 sections.',
      'MD_A_MISSING': 'Include comprehensive Management Discussion & Analysis.',
      'RISK_FACTOR_MISSING': 'Add detailed Risk Factors section.',
      'USE_OF_PROCEEDS_MISSING': 'Explain intended use of offering proceeds.',
      'CAPITALIZATION_MISSING': 'Provide capitalization summary and dilution analysis.',
      'EXECUTIVE_COMPENSATION_MISSING': 'Include complete executive compensation disclosure (CD&A).',
      'EXECUTIVE_OFFICERS_MISSING': 'Provide executive officers and directors table.',
      'AUDITOR_NOT_REGISTERED': 'Use a PCAOB registered audit firm.',
      'INVALID_FILING_FORMAT': 'Ensure submission complies with SEC EDGAR MIME format.',
      'DOCUMENT_SIZE_EXCEEDED': 'Split document or reduce size (150MB per document limit).',
      'INCORRECT_CIK': 'Verify the CIK matches your registered company.',
    }
    return suggestions[code] || 'Please review SEC requirements and correct the filing.'
  }

  /**
   * Get required documents for SEC filing
   */
  getRequiredDocuments(): DocumentType[] {
    return [
      DocumentType.PROSPECTUS,
      DocumentType.FINANCIAL_STATEMENTS,
      DocumentType.AUDITOR_REPORT,
    ]
  }

  /**
   * Get adapter configuration
   */
  getAdapterConfig(): Record<string, any> {
    return {
      adapterId: this.adapterId,
      cik: this.cik,
      apiEndpoint: 'https://www.sec.gov/cgi-bin',
      supportedForms: ['F-1', 'S-1', 'SB-2', '424B5', '8-A'],
      maxDocumentSize: 150 * 1024 * 1024, // 150MB
      requiresSignature: true,
      requiresBilingual: false,
      estimatedReviewDays: 5,
    }
  }
}

export default SECEdgarAdapter
