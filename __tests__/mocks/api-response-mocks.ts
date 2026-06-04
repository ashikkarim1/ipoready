/**
 * Mock API Responses
 * ==================
 * Comprehensive mock responses for SEDAR 2 and SEC EDGAR APIs
 * Used for unit testing without making real API calls
 */

import { SubmissionResult, FilingStatus } from '@/lib/filing-adapters/BaseFilingAdapter'

// ====================================================================
// SEDAR 2 MOCK RESPONSES
// ====================================================================

/**
 * Mock successful SEDAR 2 submission response
 */
export const mockSedarSubmissionSuccess: SubmissionResult = {
  success: true,
  filingId: 'sedar-filing-001',
  referenceNumber: 'SEDAR-2024-0001234',
  status: 'submitted',
  phase: 'submission',
  submittedAt: new Date('2024-06-01T10:30:00Z'),
  message: 'Filing submitted successfully to SEDAR 2',
  warnings: [],
  webhookRegistered: true,
  system: 'sedar',
}

/**
 * Mock SEDAR 2 filing in processing state
 */
export const mockSedarFilingProcessing: FilingStatus = {
  filingId: 'sedar-filing-001',
  referenceNumber: 'SEDAR-2024-0001234',
  status: 'processing',
  phase: 'validation',
  lastUpdatedAt: new Date('2024-06-01T11:00:00Z'),
  estimatedCompletionDate: new Date('2024-06-03T17:00:00Z'),
  reviewComments: [
    'Reviewing document format compliance',
    'Validating financial statement reconciliation',
  ],
  rejectionReasons: [],
  nextRequiredAction: 'Await reviewer feedback',
  completionPercentage: 35,
}

/**
 * Mock SEDAR 2 filing accepted
 */
export const mockSedarFilingAccepted: FilingStatus = {
  filingId: 'sedar-filing-001',
  referenceNumber: 'SEDAR-2024-0001234',
  status: 'accepted',
  phase: 'confirmation',
  lastUpdatedAt: new Date('2024-06-02T14:15:00Z'),
  estimatedCompletionDate: new Date('2024-06-03T17:00:00Z'),
  reviewComments: [
    'All documents verified',
    'Compliance checks passed',
    'Ready for publication',
  ],
  rejectionReasons: [],
  nextRequiredAction: 'Filing will be published within 24 hours',
  completionPercentage: 95,
}

/**
 * Mock SEDAR 2 filing rejected
 */
export const mockSedarFilingRejected: FilingStatus = {
  filingId: 'sedar-filing-002',
  referenceNumber: 'SEDAR-2024-0001235',
  status: 'rejected',
  phase: 'validation',
  lastUpdatedAt: new Date('2024-06-02T09:45:00Z'),
  estimatedCompletionDate: undefined,
  reviewComments: [
    'Financial statements missing required footnotes',
    'MD&A disclosure gaps in risk factor section',
  ],
  rejectionReasons: [
    'MISSING_DISCLOSURES',
    'FINANCIAL_STATEMENT_INCOMPLETE',
  ],
  nextRequiredAction: 'Submit corrected documents within 5 business days',
  completionPercentage: 0,
}

/**
 * Mock SEDAR 2 submission with warnings
 */
export const mockSedarSubmissionWithWarnings: SubmissionResult = {
  success: true,
  filingId: 'sedar-filing-003',
  referenceNumber: 'SEDAR-2024-0001236',
  status: 'submitted',
  phase: 'submission',
  submittedAt: new Date('2024-06-01T10:30:00Z'),
  message: 'Filing submitted with minor warnings',
  warnings: [
    'Document font size below recommended minimum in 2 pages',
    'MD&A exceeds recommended length by 15%',
    'One underwriter consent missing optional certification',
  ],
  webhookRegistered: true,
  system: 'sedar',
}

// ====================================================================
// SEC EDGAR MOCK RESPONSES
// ====================================================================

/**
 * Mock successful SEC EDGAR submission response
 */
export const mockSecSubmissionSuccess: SubmissionResult = {
  success: true,
  filingId: 'sec-edgar-filing-001',
  referenceNumber: 'SEC-0001234567-24-009999',
  status: 'submitted',
  phase: 'submission',
  submittedAt: new Date('2024-06-02T15:45:00Z'),
  message: 'S-1 Registration Statement filed successfully',
  warnings: [],
  webhookRegistered: true,
  system: 'sec',
}

/**
 * Mock SEC EDGAR filing in review
 */
export const mockSecFilingReview: FilingStatus = {
  filingId: 'sec-edgar-filing-001',
  referenceNumber: 'SEC-0001234567-24-009999',
  status: 'processing',
  phase: 'validation',
  lastUpdatedAt: new Date('2024-06-03T10:00:00Z'),
  estimatedCompletionDate: new Date('2024-06-10T17:00:00Z'),
  reviewComments: [
    'SEC comment letter issued - 10 items require response',
    'Risk factors reviewed - additional disclosure needed',
    'Financial statements - need updated auditor consent',
  ],
  rejectionReasons: [],
  nextRequiredAction: 'Submit 10-K response addressing SEC comments within 30 days',
  completionPercentage: 40,
}

/**
 * Mock SEC EDGAR filing declared effective
 */
export const mockSecFilingEffective: FilingStatus = {
  filingId: 'sec-edgar-filing-001',
  referenceNumber: 'SEC-0001234567-24-009999',
  status: 'accepted',
  phase: 'finalization',
  lastUpdatedAt: new Date('2024-06-15T08:30:00Z'),
  estimatedCompletionDate: new Date('2024-06-15T08:30:00Z'),
  reviewComments: [
    'All SEC comments addressed satisfactorily',
    'Registration Statement declared effective',
    'Shares eligible for trading on NASDAQ',
  ],
  rejectionReasons: [],
  nextRequiredAction: 'Schedule initial public offering',
  completionPercentage: 100,
}

/**
 * Mock SEC EDGAR refusal
 */
export const mockSecFilingRefused: FilingStatus = {
  filingId: 'sec-edgar-filing-002',
  referenceNumber: 'SEC-0001234567-24-010000',
  status: 'rejected',
  phase: 'validation',
  lastUpdatedAt: new Date('2024-06-05T14:20:00Z'),
  estimatedCompletionDate: undefined,
  reviewComments: [
    'Business combination structure does not meet S-1 requirements',
    'Significant related party transactions insufficiently disclosed',
  ],
  rejectionReasons: [
    'INELIGIBLE_FORM_TYPE',
    'INADEQUATE_DISCLOSURES',
  ],
  nextRequiredAction: 'Reconsider filing strategy and resubmit with form S-4 if applicable',
  completionPercentage: 0,
}

// ====================================================================
// SEDAR 2 HTTP MOCK RESPONSES
// ====================================================================

/**
 * Mock SEDAR 2 submitFiling API response
 */
export const mockSedarApiSubmitResponse = {
  status: 'success',
  data: {
    filingId: 'sedar-filing-001',
    referenceNumber: 'SEDAR-2024-0001234',
    submissionTime: '2024-06-01T10:30:00Z',
    estimatedReviewTime: '2-3 business days',
    documents: {
      accepted: 5,
      total: 5,
      details: [
        {
          documentId: 'doc-prospectus-001',
          fileName: 'TechVenture-Prospectus-2024.pdf',
          status: 'received',
          size: 2500000,
        },
        {
          documentId: 'doc-financial-001',
          fileName: 'TechVenture-Financial-Statements-2023-2024.pdf',
          status: 'received',
          size: 1800000,
        },
        {
          documentId: 'doc-mda-001',
          fileName: 'TechVenture-MDA-2024.pdf',
          status: 'received',
          size: 950000,
        },
        {
          documentId: 'doc-cert-001',
          fileName: 'TechVenture-Certificate-of-Compliance.pdf',
          status: 'received',
          size: 280000,
        },
        {
          documentId: 'doc-auditor-001',
          fileName: 'Deloitte-Auditor-Consent.pdf',
          status: 'received',
          size: 120000,
        },
      ],
    },
  },
}

/**
 * Mock SEDAR 2 getStatus API response
 */
export const mockSedarApiStatusResponse = {
  status: 'success',
  data: {
    filingId: 'sedar-filing-001',
    referenceNumber: 'SEDAR-2024-0001234',
    currentStatus: 'processing',
    phase: 'validation',
    lastUpdated: '2024-06-01T11:00:00Z',
    reviewProgress: {
      percentage: 35,
      stage: 'Document Validation',
      completedChecks: ['Format Validation', 'Metadata Verification'],
      remainingChecks: [
        'Compliance Review',
        'Financial Accuracy',
        'Disclosure Sufficiency',
      ],
    },
    estimatedCompletion: '2024-06-03T17:00:00Z',
    reviewerComments: [
      'Reviewing document format compliance',
      'Validating financial statement reconciliation',
    ],
  },
}

// ====================================================================
// SEC EDGAR HTTP MOCK RESPONSES
// ====================================================================

/**
 * Mock SEC EDGAR submission API response
 */
export const mockSecApiSubmitResponse = {
  status: 'success',
  data: {
    filingId: 'sec-edgar-filing-001',
    cikNumber: '0001234567',
    accessionNumber: '0001234567-24-009999',
    formType: 'S-1',
    submissionTime: '2024-06-02T15:45:00Z',
    nextSteps: [
      'Filing will be processed within 24 hours',
      'Company will receive email confirmation upon processing',
      'SEC review period typically 30-60 days',
    ],
    documents: {
      accepted: 2,
      total: 2,
      details: [
        {
          sequenceNumber: 1,
          fileName: 'BioInnovate-S1-2024.pdf',
          description: 'Form S-1',
          size: 3200000,
          status: 'received',
        },
        {
          sequenceNumber: 2,
          fileName: 'TechVenture-Financial-Statements-2023-2024.pdf',
          description: 'Financial Statements',
          size: 1800000,
          status: 'received',
        },
      ],
    },
  },
}

/**
 * Mock SEC EDGAR getStatus API response
 */
export const mockSecApiStatusResponse = {
  status: 'success',
  data: {
    filingId: 'sec-edgar-filing-001',
    accessionNumber: '0001234567-24-009999',
    formType: 'S-1',
    currentStatus: 'under_review',
    phase: 'comment_review',
    lastUpdated: '2024-06-03T10:00:00Z',
    reviewMetrics: {
      daysUnderReview: 1,
      estimatedDaysRemaining: 30,
      reviewProgress: 40,
    },
    commentLetter: {
      issued: true,
      issuedDate: '2024-06-03T10:00:00Z',
      commentCount: 10,
      categories: {
        'Risk Factors': 3,
        'Financial Statements': 4,
        'Executive Compensation': 2,
        'Related Party Transactions': 1,
      },
    },
    nextSteps: [
      'Prepare responses to SEC comments',
      'Amend prospectus with additional disclosures',
      'Resubmit amended S-1 within 30 days',
    ],
  },
}

// ====================================================================
// ERROR MOCK RESPONSES
// ====================================================================

/**
 * Mock validation error response
 */
export const mockValidationErrorResponse = {
  status: 'error',
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Document validation failed',
    details: [
      {
        documentId: 'doc-corrupted-001',
        error: 'Invalid PDF format detected',
      },
      {
        documentId: 'doc-oversized-001',
        error: 'Document exceeds maximum size limit (500MB > 100MB)',
      },
    ],
  },
}

/**
 * Mock authentication error response
 */
export const mockAuthErrorResponse = {
  status: 'error',
  error: {
    code: 'AUTH_ERROR',
    message: 'Authentication failed',
    details: {
      reason: 'Invalid API credentials',
      retryable: false,
    },
  },
}

/**
 * Mock rate limiting error response
 */
export const mockRateLimitErrorResponse = {
  status: 'error',
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests',
    retryAfter: 60, // seconds
  },
}

/**
 * Mock not found error response
 */
export const mockNotFoundErrorResponse = {
  status: 'error',
  error: {
    code: 'FILING_NOT_FOUND',
    message: 'The requested filing does not exist',
    retryable: false,
  },
}

/**
 * Mock server error response
 */
export const mockServerErrorResponse = {
  status: 'error',
  error: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    retryable: true,
  },
}

// ====================================================================
// WEBHOOK MOCK PAYLOADS
// ====================================================================

/**
 * Mock SEDAR webhook: filing submitted
 */
export const mockSedarWebhookSubmitted = {
  eventType: 'filing.submitted',
  timestamp: '2024-06-01T10:30:00Z',
  filingId: 'sedar-filing-001',
  referenceNumber: 'SEDAR-2024-0001234',
  system: 'sedar',
  data: {
    status: 'submitted',
    phase: 'submission',
    submittedAt: '2024-06-01T10:30:00Z',
    documentCount: 5,
    companyName: 'TechVenture Inc',
  },
}

/**
 * Mock SEDAR webhook: filing processing started
 */
export const mockSedarWebhookProcessing = {
  eventType: 'filing.processing',
  timestamp: '2024-06-01T11:00:00Z',
  filingId: 'sedar-filing-001',
  referenceNumber: 'SEDAR-2024-0001234',
  system: 'sedar',
  data: {
    status: 'processing',
    phase: 'validation',
    completionPercentage: 35,
    estimatedCompletion: '2024-06-03T17:00:00Z',
    reviewerComments: [
      'Reviewing document format compliance',
      'Validating financial statement reconciliation',
    ],
  },
}

/**
 * Mock SEDAR webhook: filing accepted
 */
export const mockSedarWebhookAccepted = {
  eventType: 'filing.accepted',
  timestamp: '2024-06-02T14:15:00Z',
  filingId: 'sedar-filing-001',
  referenceNumber: 'SEDAR-2024-0001234',
  system: 'sedar',
  data: {
    status: 'accepted',
    phase: 'confirmation',
    acceptedAt: '2024-06-02T14:15:00Z',
    publicationDate: '2024-06-03T08:00:00Z',
  },
}

/**
 * Mock SEDAR webhook: filing rejected
 */
export const mockSedarWebhookRejected = {
  eventType: 'filing.rejected',
  timestamp: '2024-06-02T09:45:00Z',
  filingId: 'sedar-filing-002',
  referenceNumber: 'SEDAR-2024-0001235',
  system: 'sedar',
  data: {
    status: 'rejected',
    phase: 'validation',
    rejectionReasons: [
      'MISSING_DISCLOSURES',
      'FINANCIAL_STATEMENT_INCOMPLETE',
    ],
    nextRequiredAction: 'Submit corrected documents within 5 business days',
  },
}

/**
 * Mock SEC webhook: comment letter issued
 */
export const mockSecWebhookCommentLetterIssued = {
  eventType: 'filing.comment_letter_issued',
  timestamp: '2024-06-03T10:00:00Z',
  filingId: 'sec-edgar-filing-001',
  referenceNumber: 'SEC-0001234567-24-009999',
  system: 'sec',
  data: {
    status: 'processing',
    phase: 'comment_review',
    commentLetterUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&comment=...',
    commentCount: 10,
    responseDeadline: '2024-07-03T23:59:59Z',
  },
}

/**
 * Mock SEC webhook: registration effective
 */
export const mockSecWebhookEffective = {
  eventType: 'filing.effective',
  timestamp: '2024-06-15T08:30:00Z',
  filingId: 'sec-edgar-filing-001',
  referenceNumber: 'SEC-0001234567-24-009999',
  system: 'sec',
  data: {
    status: 'accepted',
    phase: 'finalization',
    declaredEffectiveAt: '2024-06-15T08:30:00Z',
    formType: 'S-1',
    registrationStatement: {
      prospectusUrl: 'https://www.sec.gov/Archives/edgar/...',
      cikNumber: '0001234567',
    },
  },
}
