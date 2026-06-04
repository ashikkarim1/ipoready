/**
 * Filing System Test Helpers & Utilities
 * =====================================
 * Common utilities, builders, and helpers for testing filing submission systems
 */

import {
  DocumentMetadata,
  FilingMetadata,
  DocumentType,
} from '@/lib/filing-adapters/BaseFilingAdapter'

// ====================================================================
// TEST DATA BUILDERS
// ====================================================================

/**
 * Builder for creating test company metadata
 */
export class TestCompanyBuilder {
  private metadata: FilingMetadata = {
    companyId: `test-company-${Date.now()}`,
    companyName: 'Test Company Inc',
    filingType: 'prospectus',
    currencyCode: 'CAD',
    country: 'CA',
    submittedBy: 'test@example.com',
    submittedAt: new Date(),
  }

  /**
   * Set company ID
   */
  withCompanyId(companyId: string): this {
    this.metadata.companyId = companyId
    return this
  }

  /**
   * Set company name
   */
  withCompanyName(name: string): this {
    this.metadata.companyName = name
    return this
  }

  /**
   * Set currency
   */
  withCurrency(currency: string): this {
    this.metadata.currencyCode = currency
    return this
  }

  /**
   * Set country
   */
  withCountry(country: string): this {
    this.metadata.country = country
    return this
  }

  /**
   * Set fiscal year end
   */
  withFiscalYearEnd(date: Date): this {
    this.metadata.fiscalYearEnd = date
    return this
  }

  /**
   * Set audit firm
   */
  withAuditFirm(name: string, id: string): this {
    this.metadata.auditFirmName = name
    this.metadata.auditFirmId = id
    return this
  }

  /**
   * Set underwriters
   */
  withUnderwriters(names: string[]): this {
    this.metadata.underwriterNames = names
    return this
  }

  /**
   * Set custom metadata
   */
  withCustomMetadata(custom: Record<string, any>): this {
    this.metadata.customMetadata = custom
    return this
  }

  /**
   * Build the metadata
   */
  build(): FilingMetadata {
    return { ...this.metadata }
  }
}

/**
 * Builder for creating test documents
 */
export class TestDocumentBuilder {
  private document: Partial<DocumentMetadata> = {
    id: `doc-${Date.now()}`,
    type: DocumentType.PROSPECTUS,
    format: 'pdf',
    fileName: 'test-document.pdf',
    mimeType: 'application/pdf',
    size: 2500000,
    content: 'Sample PDF content',
    language: 'en',
    validated: true,
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  /**
   * Set document ID
   */
  withId(id: string): this {
    this.document.id = id
    return this
  }

  /**
   * Set document type
   */
  withType(type: DocumentType): this {
    this.document.type = type
    return this
  }

  /**
   * Set file name
   */
  withFileName(name: string): this {
    this.document.fileName = name
    return this
  }

  /**
   * Set content
   */
  withContent(content: string): this {
    this.document.content = content
    return this
  }

  /**
   * Set size
   */
  withSize(size: number): this {
    this.document.size = size
    return this
  }

  /**
   * Set language
   */
  withLanguage(language: string): this {
    this.document.language = language
    return this
  }

  /**
   * Set validated status
   */
  withValidated(validated: boolean): this {
    this.document.validated = validated
    return this
  }

  /**
   * Set checksum
   */
  withChecksum(checksum: string): this {
    this.document.checksum = checksum
    return this
  }

  /**
   * Build the document
   */
  build(): DocumentMetadata {
    const doc = this.document as DocumentMetadata
    if (!doc.checksum) {
      doc.checksum = `sha256-${Date.now()}`
    }
    return doc
  }
}

// ====================================================================
// MOCK REQUEST/RESPONSE BUILDERS
// ====================================================================

/**
 * Build mock filing submission request
 */
export function buildFilingSubmissionRequest(
  system: 'sedar' | 'sec',
  documents: DocumentMetadata[],
  metadata: FilingMetadata,
  options?: any
) {
  return {
    filingSystem: system,
    documents,
    metadata,
    options: options || {
      registerWebhook: true,
      dryRun: false,
    },
  }
}

/**
 * Build mock filing status request
 */
export function buildFilingStatusRequest(
  filingId: string,
  system: 'sedar' | 'sec'
) {
  return {
    filingId,
    system,
  }
}

// ====================================================================
// ASSERTION HELPERS
// ====================================================================

/**
 * Assert document is valid
 */
export function assertDocumentValid(doc: DocumentMetadata): void {
  expect(doc.id).toBeDefined()
  expect(doc.type).toBeDefined()
  expect(doc.fileName).toBeDefined()
  expect(doc.content).toBeDefined()
  expect(doc.size).toBeGreaterThan(0)
  expect(doc.checksum).toBeDefined()
  expect(doc.createdAt).toBeDefined()
}

/**
 * Assert filing metadata is valid
 */
export function assertMetadataValid(metadata: FilingMetadata): void {
  expect(metadata.companyId).toBeDefined()
  expect(metadata.companyName).toBeDefined()
  expect(metadata.submittedBy).toBeDefined()
  expect(metadata.currencyCode).toBeDefined()
  expect(metadata.country).toBeDefined()
}

/**
 * Assert response is successful
 */
export function assertSuccessResponse(response: any): void {
  expect(response.success).toBe(true)
  expect(response.filing).toBeDefined()
  expect(response.filing.id).toBeDefined()
  expect(response.filing.referenceNumber).toBeDefined()
  expect(response.filing.status).toBeDefined()
}

/**
 * Assert response is error
 */
export function assertErrorResponse(
  response: any,
  expectedCode?: string
): void {
  expect(response.success).toBe(false)
  expect(response.error).toBeDefined()
  if (expectedCode) {
    expect(response.error).toContain(expectedCode)
  }
}

/**
 * Assert filing status
 */
export function assertFilingStatus(
  status: any,
  expectedStatus: string
): void {
  expect(status.filing).toBeDefined()
  expect(status.filing.status).toBe(expectedStatus)
  expect(status.filing.id).toBeDefined()
  expect(status.filing.referenceNumber).toBeDefined()
}

// ====================================================================
// MOCK ADAPTERS
// ====================================================================

/**
 * Mock filing adapter for testing
 */
export class MockFilingAdapter {
  private submissions: Map<string, any> = new Map()
  private statuses: Map<string, any> = new Map()
  private shouldFail = false

  /**
   * Set failure mode
   */
  setFailureMode(shouldFail: boolean): void {
    this.shouldFail = shouldFail
  }

  /**
   * Mock submit
   */
  async submit(documents: DocumentMetadata[], metadata: FilingMetadata): Promise<any> {
    if (this.shouldFail) {
      throw new Error('Mock submission failure')
    }

    const filingId = `filing-${Date.now()}`
    const referenceNumber = `REF-${Date.now()}`

    const result = {
      success: true,
      filingId,
      referenceNumber,
      status: 'submitted',
      submittedAt: new Date(),
      system: 'mock',
    }

    this.submissions.set(filingId, { documents, metadata, result })
    this.statuses.set(filingId, { status: 'submitted', phase: 'submission' })

    return result
  }

  /**
   * Mock get status
   */
  async getStatus(filingId: string): Promise<any> {
    const submission = this.submissions.get(filingId)
    if (!submission) {
      throw new Error('Filing not found')
    }

    return {
      filingId,
      referenceNumber: submission.result.referenceNumber,
      status: 'processing',
      phase: 'validation',
      lastUpdatedAt: new Date(),
      completionPercentage: 50,
    }
  }

  /**
   * Get submission by ID
   */
  getSubmission(filingId: string): any {
    return this.submissions.get(filingId)
  }

  /**
   * Get all submissions
   */
  getAllSubmissions(): any[] {
    return Array.from(this.submissions.values())
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.submissions.clear()
    this.statuses.clear()
  }
}

// ====================================================================
// TIMING UTILITIES
// ====================================================================

/**
 * Measure execution time
 */
export async function measureExecutionTime(
  fn: () => Promise<any>
): Promise<{ result: any; durationMs: number }> {
  const startTime = Date.now()
  const result = await fn()
  const durationMs = Date.now() - startTime

  return { result, durationMs }
}

/**
 * Assert execution time within bounds
 */
export function assertExecutionTimeWithin(
  durationMs: number,
  maxMs: number,
  minMs = 0
): void {
  expect(durationMs).toBeGreaterThanOrEqual(minMs)
  expect(durationMs).toBeLessThanOrEqual(maxMs)
}

// ====================================================================
// BATCH OPERATIONS
// ====================================================================

/**
 * Create multiple test documents
 */
export function createTestDocuments(
  count: number,
  baseType = DocumentType.PROSPECTUS
): DocumentMetadata[] {
  return Array.from({ length: count }, (_, i) =>
    new TestDocumentBuilder()
      .withId(`doc-${i}`)
      .withFileName(`document-${i}.pdf`)
      .withType(baseType)
      .build()
  )
}

/**
 * Create multiple test companies
 */
export function createTestCompanies(count: number): FilingMetadata[] {
  return Array.from({ length: count }, (_, i) =>
    new TestCompanyBuilder()
      .withCompanyId(`company-${i}`)
      .withCompanyName(`Test Company ${i}`)
      .build()
  )
}

// ====================================================================
// COMPARISON UTILITIES
// ====================================================================

/**
 * Compare two filing status responses
 */
export function compareFilingStatuses(
  status1: any,
  status2: any
): {
  same: boolean
  differences: string[]
} {
  const differences: string[] = []

  if (status1.filing.id !== status2.filing.id) {
    differences.push('Different filing IDs')
  }
  if (status1.filing.status !== status2.filing.status) {
    differences.push('Different statuses')
  }
  if (status1.filing.referenceNumber !== status2.filing.referenceNumber) {
    differences.push('Different reference numbers')
  }

  return {
    same: differences.length === 0,
    differences,
  }
}

// ====================================================================
// CLEANUP UTILITIES
// ====================================================================

/**
 * Clean up test environment
 */
export async function cleanupTestEnvironment(): Promise<void> {
  // Clear any global mocks
  jest.clearAllMocks()

  // Clear timers
  jest.clearAllTimers()
}

/**
 * Reset all test data
 */
export function resetTestData(): void {
  jest.clearAllMocks()
}

// ====================================================================
// TEST DATA CONSTANTS
// ====================================================================

export const TEST_FILING_SYSTEMS = ['sedar', 'sec'] as const

export const TEST_DOCUMENT_TYPES = [
  DocumentType.PROSPECTUS,
  DocumentType.FINANCIAL_STATEMENTS,
  DocumentType.MD_A,
  DocumentType.CERTIFICATE,
] as const

export const TEST_CURRENCIES = ['CAD', 'USD'] as const

export const TEST_COUNTRIES = ['CA', 'US'] as const

// ====================================================================
// TEST SUITE HELPERS
// ====================================================================

/**
 * Setup test suite
 */
export function setupTestSuite(): {
  companyBuilder: TestCompanyBuilder
  documentBuilder: TestDocumentBuilder
  mockAdapter: MockFilingAdapter
} {
  const companyBuilder = new TestCompanyBuilder()
  const documentBuilder = new TestDocumentBuilder()
  const mockAdapter = new MockFilingAdapter()

  return { companyBuilder, documentBuilder, mockAdapter }
}

/**
 * Teardown test suite
 */
export async function teardownTestSuite(
  mockAdapter: MockFilingAdapter
): Promise<void> {
  mockAdapter.clear()
  await cleanupTestEnvironment()
}

// ====================================================================
// PARAMETERIZED TEST HELPERS
// ====================================================================

/**
 * Generate test cases for multiple filing systems
 */
export function generateFilingSystemTestCases(): Array<{ system: string; name: string }> {
  return [
    { system: 'sedar', name: 'SEDAR 2 (Canada)' },
    { system: 'sec', name: 'SEC EDGAR (US)' },
  ]
}

/**
 * Generate test cases for multiple document types
 */
export function generateDocumentTypeTestCases(): Array<{ type: DocumentType; name: string }> {
  return [
    { type: DocumentType.PROSPECTUS, name: 'Prospectus' },
    { type: DocumentType.FINANCIAL_STATEMENTS, name: 'Financial Statements' },
    { type: DocumentType.MD_A, name: 'MD&A' },
    { type: DocumentType.CERTIFICATE, name: 'Certificate' },
  ]
}

// ====================================================================
// ERROR SIMULATION UTILITIES
// ====================================================================

/**
 * Simulate network error
 */
export function simulateNetworkError(): Error {
  return new Error('Network request failed: unable to reach server')
}

/**
 * Simulate timeout
 */
export function simulateTimeout(): Error {
  return new Error('Request timeout: operation exceeded 30000ms')
}

/**
 * Simulate validation error
 */
export function simulateValidationError(field: string): Error {
  return new Error(`Validation error: ${field} is invalid`)
}

/**
 * Simulate rate limit error
 */
export function simulateRateLimitError(retryAfterMs: number): Error {
  const error = new Error(`Rate limited: retry after ${retryAfterMs}ms`)
  ;(error as any).retryAfter = retryAfterMs
  return error
}
