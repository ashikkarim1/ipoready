/**
 * Mock Filing Responses
 * =====================
 * Comprehensive utility for generating mock responses from filing systems
 * Handles: SEDAR and SEC EDGAR submission/status responses
 * Supports sandbox mode (real responses) vs mock mode
 * Includes rejection reasons, error responses, and webhook payloads
 */

import * as crypto from 'crypto'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SubmissionMode = 'success' | 'error' | 'processing' | 'rejected'
export type FilingSystem = 'sedar' | 'sec-edgar'

export interface MockSubmissionOptions {
  mode?: SubmissionMode
  filingId?: string
  timestamp?: Date
  includeDetails?: boolean
  rejectionCode?: string
  errorMessage?: string
}

export interface MockStatusOptions {
  status?: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn'
  timestamp?: Date
  reviewComments?: string[]
  daysInReview?: number
  includeRejectionReasons?: boolean
}

export interface WebhookPayloadOptions {
  eventType?: 'submission.created' | 'submission.updated' | 'submission.rejected' | 'status.changed'
  status?: string
  timestamp?: Date
  includeDocument?: boolean
}

export interface MockResponse<T> {
  data: T
  timestamp: Date
  requestId: string
  mode: 'mock' | 'sandbox'
}

// ============================================================================
// SEDAR TYPES (Canadian Filing System)
// ============================================================================

export interface SEDARSubmissionResponse {
  filingId: string
  companyId: string
  submissionNumber: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  submittedAt: string
  estimatedReviewDays: number
  messages: string[]
  documentCount: number
  totalFileSize: number
  jurisdiction: string
  filerName: string
}

export interface SEDARStatusResponse {
  filingId: string
  submissionNumber: string
  companyId: string
  companyName: string
  filingType: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn'
  submittedAt: string
  lastUpdatedAt: string
  reviewComments: string[]
  rejectionReasons?: Array<{
    field: string
    code: string
    description: string
    severity: 'error' | 'warning'
  }>
  acceptedDocuments?: number
  rejectedDocuments?: number
}

export interface SEDARRejectionReason {
  code: string
  field: string
  message: string
  severity: 'error' | 'warning'
  suggestedAction?: string
}

// ============================================================================
// SEC EDGAR TYPES (US Filing System)
// ============================================================================

export interface SECEdgarSubmissionResponse {
  filingId: string
  cik: string
  accessionNumber: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  submittedAt: string
  estimatedReviewDays: number
  messages: string[]
  formType: string
  companyName: string
}

export interface SECEdgarStatusResponse {
  filingId: string
  accessionNumber: string
  cik: string
  companyName: string
  formType: string
  status: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn'
  filedDate: string
  lastUpdatedAt: string
  reviewComments: string[]
  rejectionReasons?: Array<{
    field: string
    code: string
    description: string
  }>
}

export interface SECEdgarRejectionReason {
  code: string
  field: string
  message: string
  suggestedAction?: string
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookPayload {
  id: string
  eventType: string
  timestamp: string
  source: FilingSystem
  data: {
    filingId: string
    status: string
    companyName?: string
    message?: string
    details?: Record<string, any>
  }
  signature?: string
  signatureTimestamp?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEDAR_REJECTION_CODES: Record<string, SEDARRejectionReason> = {
  MISSING_PROSPECTUS: {
    code: 'MISSING_PROSPECTUS',
    field: 'prospectus',
    message: 'The prospectus document is required and missing',
    severity: 'error',
    suggestedAction: 'Upload a prospectus document in PDF or DOCX format',
  },
  INVALID_FINANCIAL_FORMAT: {
    code: 'INVALID_FINANCIAL_FORMAT',
    field: 'financial_statements',
    message: 'Financial statements must comply with IFRS standards',
    severity: 'error',
    suggestedAction: 'Ensure financial statements are prepared under IFRS',
  },
  MISSING_AUDITOR_SIGNATURE: {
    code: 'MISSING_AUDITOR_SIGNATURE',
    field: 'auditor_report',
    message: 'Auditor signature is missing from the audit report',
    severity: 'error',
    suggestedAction: 'Obtain and attach the signed auditor certification',
  },
  INVALID_DATE_FORMAT: {
    code: 'INVALID_DATE_FORMAT',
    field: 'dates',
    message: 'Date format does not match YYYY-MM-DD standard',
    severity: 'error',
    suggestedAction: 'Correct all dates to YYYY-MM-DD format',
  },
  MISSING_DIRECTOR_CERTIFICATION: {
    code: 'MISSING_DIRECTOR_CERTIFICATION',
    field: 'certifications',
    message: 'Director certification documents are missing',
    severity: 'error',
    suggestedAction: 'Upload signed director certifications',
  },
  INCOMPLETE_RISK_DISCLOSURE: {
    code: 'INCOMPLETE_RISK_DISCLOSURE',
    field: 'risk_factors',
    message: 'Risk factor section does not meet CSA requirements',
    severity: 'warning',
    suggestedAction: 'Expand risk factors to provide comprehensive disclosure',
  },
  INCONSISTENT_CURRENCY: {
    code: 'INCONSISTENT_CURRENCY',
    field: 'financial_data',
    message: 'Currency values are inconsistent across documents',
    severity: 'warning',
    suggestedAction: 'Verify all currency conversions are consistent',
  },
}

const SEC_REJECTION_CODES: Record<string, SECEdgarRejectionReason> = {
  MISSING_SIGNATURE: {
    code: 'MISSING_SIGNATURE',
    field: 'signatures',
    message: 'Required signatures are missing or invalid',
    suggestedAction: 'Ensure all required officers have signed the prospectus',
  },
  INVALID_FINANCIAL_FORMAT: {
    code: 'INVALID_FINANCIAL_FORMAT',
    field: 'financial_statements',
    message: 'Financial statements must comply with US GAAP standards',
    suggestedAction: 'Ensure financial statements are prepared under US GAAP',
  },
  PROSPECTUS_INCOMPLETE: {
    code: 'PROSPECTUS_INCOMPLETE',
    field: 'prospectus',
    message: 'Prospectus is missing required sections per Reg S-1',
    suggestedAction: 'Include all required sections per SEC Regulation S-1',
  },
  MD_A_MISSING: {
    code: 'MD_A_MISSING',
    field: 'md_a',
    message: 'Management Discussion & Analysis (MD&A) is required',
    suggestedAction: 'Include MD&A section in the prospectus',
  },
  RISK_FACTOR_MISSING: {
    code: 'RISK_FACTOR_MISSING',
    field: 'risk_factors',
    message: 'Risk Factors section is required',
    suggestedAction: 'Include comprehensive Risk Factors section',
  },
  USE_OF_PROCEEDS_MISSING: {
    code: 'USE_OF_PROCEEDS_MISSING',
    field: 'use_of_proceeds',
    message: 'Use of Proceeds section is required',
    suggestedAction: 'Include detailed Use of Proceeds section',
  },
  AUDITOR_NOT_REGISTERED: {
    code: 'AUDITOR_NOT_REGISTERED',
    field: 'auditor',
    message: 'Auditor must be PCAOB registered',
    suggestedAction: 'Use a PCAOB registered auditor for financial statement certification',
  },
  DOCUMENT_SIZE_EXCEEDED: {
    code: 'DOCUMENT_SIZE_EXCEEDED',
    field: 'document_size',
    message: 'Individual document exceeds SEC size limits (150MB)',
    suggestedAction: 'Split large documents or reduce file sizes',
  },
}

// ============================================================================
// SEDAR MOCK RESPONSES
// ============================================================================

/**
 * Generate mock SEDAR submission response
 */
export function mockSEDARSubmissionResponse(
  options: MockSubmissionOptions = {}
): MockResponse<SEDARSubmissionResponse> {
  const {
    mode = 'success',
    filingId = generateFilingId('SEDAR'),
    timestamp = new Date(),
    includeDetails = true,
    rejectionCode = undefined,
    errorMessage = undefined,
  } = options

  let status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  let messages: string[] = []

  switch (mode) {
    case 'success':
      status = 'submitted'
      messages = [
        'Filing submitted successfully',
        'All documents received and queued for review',
        'Expected review time: 10-15 business days',
      ]
      break
    case 'processing':
      status = 'processing'
      messages = ['Filing is currently being reviewed by CSA staff']
      break
    case 'error':
      status = 'rejected'
      messages = [errorMessage || 'An error occurred during submission']
      break
    case 'rejected':
      status = 'rejected'
      const rejectionReason = rejectionCode
        ? SEDAR_REJECTION_CODES[rejectionCode]
        : SEDAR_REJECTION_CODES.MISSING_PROSPECTUS
      messages = [
        `Filing rejected: ${rejectionReason.message}`,
        `Action required: ${rejectionReason.suggestedAction}`,
        'Please correct the issues and resubmit',
      ]
      break
  }

  const response: SEDARSubmissionResponse = {
    filingId,
    companyId: 'comp_' + generateRandomId(12),
    submissionNumber: generateSubmissionNumber(),
    status,
    submittedAt: timestamp.toISOString(),
    estimatedReviewDays: mode === 'success' ? 15 : 0,
    messages,
    documentCount: 6,
    totalFileSize: 25 * 1024 * 1024, // 25 MB
    jurisdiction: 'Ontario',
    filerName: 'TechCorp Inc.',
  }

  return {
    data: response,
    timestamp: new Date(),
    requestId: generateRequestId(),
    mode: 'mock',
  }
}

/**
 * Generate mock SEDAR status response
 */
export function mockSEDARStatusResponse(
  options: MockStatusOptions = {}
): MockResponse<SEDARStatusResponse> {
  const {
    status = 'processing',
    timestamp = new Date(),
    reviewComments = [],
    daysInReview = 5,
    includeRejectionReasons = false,
  } = options

  const rejectionReasons =
    status === 'rejected' && includeRejectionReasons
      ? [
          {
            field: 'prospectus',
            code: 'MISSING_PROSPECTUS',
            description: 'The prospectus document is required and missing',
            severity: 'error' as const,
          },
          {
            field: 'financial_statements',
            code: 'INVALID_FINANCIAL_FORMAT',
            description: 'Financial statements must comply with IFRS standards',
            severity: 'error' as const,
          },
        ]
      : undefined

  const response: SEDARStatusResponse = {
    filingId: generateFilingId('SEDAR'),
    submissionNumber: generateSubmissionNumber(),
    companyId: 'comp_' + generateRandomId(12),
    companyName: 'TechCorp Inc.',
    filingType: 'PREP',
    status: status as SEDARStatusResponse['status'],
    submittedAt: new Date(timestamp.getTime() - daysInReview * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: timestamp.toISOString(),
    reviewComments: reviewComments.length > 0
      ? reviewComments
      : [
          'Under review by CSA',
          'Document quality acceptable',
          'Awaiting financial statement clarification',
        ],
    rejectionReasons,
    acceptedDocuments: status === 'accepted' ? 6 : status === 'rejected' ? 4 : 6,
    rejectedDocuments: status === 'rejected' ? 2 : 0,
  }

  return {
    data: response,
    timestamp: new Date(),
    requestId: generateRequestId(),
    mode: 'mock',
  }
}

// ============================================================================
// SEC EDGAR MOCK RESPONSES
// ============================================================================

/**
 * Generate mock SEC EDGAR submission response
 */
export function mockSECEdgarSubmissionResponse(
  options: MockSubmissionOptions = {}
): MockResponse<SECEdgarSubmissionResponse> {
  const {
    mode = 'success',
    filingId = generateFilingId('SEC'),
    timestamp = new Date(),
    includeDetails = true,
    rejectionCode = undefined,
    errorMessage = undefined,
  } = options

  let status: 'submitted' | 'processing' | 'accepted' | 'rejected'
  let messages: string[] = []

  switch (mode) {
    case 'success':
      status = 'submitted'
      messages = [
        'Filing submitted successfully to EDGAR',
        'Accession number assigned',
        'Expected review time: 30 calendar days',
      ]
      break
    case 'processing':
      status = 'processing'
      messages = ['Filing is currently being reviewed by SEC staff']
      break
    case 'error':
      status = 'rejected'
      messages = [errorMessage || 'An error occurred during EDGAR submission']
      break
    case 'rejected':
      status = 'rejected'
      const rejectionReason = rejectionCode
        ? SEC_REJECTION_CODES[rejectionCode]
        : SEC_REJECTION_CODES.MISSING_SIGNATURE
      messages = [
        `Filing rejected: ${rejectionReason.message}`,
        `Action required: ${rejectionReason.suggestedAction}`,
        'Please correct the issues and resubmit via EDGAR',
      ]
      break
  }

  const response: SECEdgarSubmissionResponse = {
    filingId,
    cik: '0001234567',
    accessionNumber: generateAccessionNumber(),
    status,
    submittedAt: timestamp.toISOString(),
    estimatedReviewDays: mode === 'success' ? 30 : 0,
    messages,
    formType: 'F-1',
    companyName: 'TechCorp Inc.',
  }

  return {
    data: response,
    timestamp: new Date(),
    requestId: generateRequestId(),
    mode: 'mock',
  }
}

/**
 * Generate mock SEC EDGAR status response
 */
export function mockSECEdgarStatusResponse(
  options: MockStatusOptions = {}
): MockResponse<SECEdgarStatusResponse> {
  const {
    status = 'processing',
    timestamp = new Date(),
    reviewComments = [],
    daysInReview = 15,
    includeRejectionReasons = false,
  } = options

  const rejectionReasons =
    status === 'rejected' && includeRejectionReasons
      ? [
          {
            field: 'signatures',
            code: 'MISSING_SIGNATURE',
            description: 'Required signatures are missing or invalid',
          },
          {
            field: 'financial_statements',
            code: 'INVALID_FINANCIAL_FORMAT',
            description: 'Financial statements must comply with US GAAP standards',
          },
        ]
      : undefined

  const response: SECEdgarStatusResponse = {
    filingId: generateFilingId('SEC'),
    accessionNumber: generateAccessionNumber(),
    cik: '0001234567',
    companyName: 'TechCorp Inc.',
    formType: 'F-1',
    status: status as SECEdgarStatusResponse['status'],
    filedDate: new Date(timestamp.getTime() - daysInReview * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: timestamp.toISOString(),
    reviewComments: reviewComments.length > 0
      ? reviewComments
      : [
          'Filing under SEC review',
          'Initial processing completed',
          'Awaiting company response to comments',
        ],
    rejectionReasons,
  }

  return {
    data: response,
    timestamp: new Date(),
    requestId: generateRequestId(),
    mode: 'mock',
  }
}

// ============================================================================
// WEBHOOK PAYLOADS
// ============================================================================

/**
 * Generate mock webhook payload for status updates
 */
export function mockWebhookPayload(
  system: FilingSystem = 'sedar',
  options: WebhookPayloadOptions = {}
): WebhookPayload {
  const {
    eventType = 'status.changed',
    status = 'processing',
    timestamp = new Date(),
    includeDocument = false,
  } = options

  const payload: WebhookPayload = {
    id: 'evt_' + generateRandomId(16),
    eventType,
    timestamp: timestamp.toISOString(),
    source: system,
    data: {
      filingId: generateFilingId(system === 'sedar' ? 'SEDAR' : 'SEC'),
      status,
      companyName: 'TechCorp Inc.',
      message: `Filing status updated to: ${status}`,
      details: includeDocument
        ? {
            documentCount: 6,
            acceptedDocuments: 6,
            rejectedDocuments: 0,
            reviewerComments: 'All documents verified',
          }
        : undefined,
    },
  }

  return payload
}

/**
 * Generate webhook signature for webhook verification
 */
export function generateWebhookSignature(
  payload: WebhookPayload,
  secret: string
): { signature: string; timestamp: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signatureData = `${timestamp}.${JSON.stringify(payload)}`

  const signature = crypto.createHmac('sha256', secret).update(signatureData).digest('hex')

  return { signature, timestamp }
}

// ============================================================================
// REJECTION REASON UTILITIES
// ============================================================================

/**
 * Get all SEDAR rejection codes with descriptions
 */
export function getSEDARRejectionReasons(): Record<string, SEDARRejectionReason> {
  return SEDAR_REJECTION_CODES
}

/**
 * Get all SEC EDGAR rejection codes with descriptions
 */
export function getSECEdgarRejectionReasons(): Record<string, SECEdgarRejectionReason> {
  return SEC_REJECTION_CODES
}

/**
 * Get a random rejection reason for testing
 */
export function getRandomRejectionReason(
  system: FilingSystem = 'sedar'
): SEDARRejectionReason | SECEdgarRejectionReason {
  const codes = system === 'sedar' ? SEDAR_REJECTION_CODES : SEC_REJECTION_CODES
  const codeArray = Object.values(codes)
  return codeArray[Math.floor(Math.random() * codeArray.length)]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateFilingId(system: 'SEDAR' | 'SEC'): string {
  return `${system.toLowerCase()}_${generateRandomId(12)}`
}

function generateSubmissionNumber(): string {
  return `${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
}

function generateAccessionNumber(): string {
  // Format: 0001234567-24-000001 (typical SEC format)
  const cik = '0001234567'
  const year = new Date().getFullYear()
  const sequence = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `${cik}-${String(year).slice(-2)}-${sequence}`
}

function generateRequestId(): string {
  return `req_${generateRandomId(16)}`
}

function generateRandomId(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  mockSEDARSubmissionResponse,
  mockSEDARStatusResponse,
  mockSECEdgarSubmissionResponse,
  mockSECEdgarStatusResponse,
  mockWebhookPayload,
  generateWebhookSignature,
  getSEDARRejectionReasons,
  getSECEdgarRejectionReasons,
  getRandomRejectionReason,
}
