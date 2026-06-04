/**
 * End-to-End Filing API Tests
 * ============================
 * Comprehensive test suite for the /api/filings/submit and /api/filings/status endpoints
 * Tests successful submissions, error handling, and various edge cases
 */

import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '@/app/api/filings/submit/route'
import {
  GET as getStatus,
  POST as postStatus,
  OPTIONS as optionsStatus,
} from '@/app/api/filings/status/route'
import {
  CANADIAN_FILING_BUNDLE,
  US_FILING_BUNDLE,
  BILINGUAL_FILING_BUNDLE,
  INCOMPLETE_FILING_BUNDLE,
  CORRUPTED_PROSPECTUS,
  OVERSIZED_PROSPECTUS,
} from '../fixtures/prospectus-fixtures'
import {
  mockSedarSubmissionSuccess,
  mockSedarFilingAccepted,
  mockSedarFilingRejected,
  mockSecSubmissionSuccess,
  mockSecFilingEffective,
  mockValidationErrorResponse,
  mockAuthErrorResponse,
} from '../mocks/api-response-mocks'

// ====================================================================
// TEST SUITE: Filing Submission (/api/filings/submit)
// ====================================================================

describe('POST /api/filings/submit', () => {
  /**
   * Test: Successful SEDAR submission
   */
  test('should successfully submit filing to SEDAR 2', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: CANADIAN_FILING_BUNDLE.documents,
      metadata: CANADIAN_FILING_BUNDLE.metadata,
      options: {
        registerWebhook: true,
        dryRun: false,
      },
    }

    // Create mock request
    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.filing.system).toBe('sedar')
    expect(responseData.filing.id).toBeDefined()
    expect(responseData.filing.referenceNumber).toBeDefined()
  })

  /**
   * Test: Successful SEC EDGAR submission
   */
  test('should successfully submit filing to SEC EDGAR', async () => {
    const body = {
      filingSystem: 'sec',
      documents: US_FILING_BUNDLE.documents,
      metadata: US_FILING_BUNDLE.metadata,
      options: {
        registerWebhook: true,
        dryRun: false,
      },
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.filing.system).toBe('sec')
  })

  /**
   * Test: Bilingual filing submission
   */
  test('should handle bilingual prospectus submission', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: BILINGUAL_FILING_BUNDLE.documents,
      metadata: BILINGUAL_FILING_BUNDLE.metadata,
      options: {
        registerWebhook: true,
        dryRun: false,
      },
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
  })

  /**
   * Test: Dry run mode (validation only)
   */
  test('should handle dry run mode without actual submission', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: CANADIAN_FILING_BUNDLE.documents,
      metadata: CANADIAN_FILING_BUNDLE.metadata,
      options: {
        registerWebhook: false,
        dryRun: true,
      },
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.filing.status).toBe('validated')
  })

  /**
   * Test: Missing filingSystem parameter
   */
  test('should reject request missing filingSystem', async () => {
    const body = {
      documents: CANADIAN_FILING_BUNDLE.documents,
      metadata: CANADIAN_FILING_BUNDLE.metadata,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('filingSystem is required')
  })

  /**
   * Test: Invalid filingSystem value
   */
  test('should reject invalid filingSystem value', async () => {
    const body = {
      filingSystem: 'invalid-system',
      documents: CANADIAN_FILING_BUNDLE.documents,
      metadata: CANADIAN_FILING_BUNDLE.metadata,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('filingSystem must be sedar or sec')
  })

  /**
   * Test: Empty documents array
   */
  test('should reject request with empty documents array', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: [],
      metadata: CANADIAN_FILING_BUNDLE.metadata,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('documents array is required')
  })

  /**
   * Test: Missing metadata
   */
  test('should reject request missing metadata', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: CANADIAN_FILING_BUNDLE.documents,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('metadata is required')
  })

  /**
   * Test: Missing required metadata fields
   */
  test('should reject metadata missing companyName', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: CANADIAN_FILING_BUNDLE.documents,
      metadata: {
        ...CANADIAN_FILING_BUNDLE.metadata,
        companyName: undefined,
      },
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('companyName is required')
  })

  /**
   * Test: Document missing required fields
   */
  test('should reject document missing required fields', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: [
        {
          // Missing id, type, fileName
          content: 'test',
        },
      ],
      metadata: CANADIAN_FILING_BUNDLE.metadata,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('id, type, and fileName')
  })

  /**
   * Test: Document missing content
   */
  test('should reject document missing content', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: [
        {
          id: 'doc-001',
          type: 'prospectus',
          fileName: 'test.pdf',
          // Missing content
        },
      ],
      metadata: CANADIAN_FILING_BUNDLE.metadata,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('has no content')
  })

  /**
   * Test: Invalid content type
   */
  test('should reject request with non-JSON content type', async () => {
    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'text/plain']]),
      json: async () => ({}),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('application/json')
  })

  /**
   * Test: Invalid JSON payload
   */
  test('should reject malformed JSON payload', async () => {
    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => {
        throw new Error('JSON parse error')
      },
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('Invalid JSON')
  })

  /**
   * Test: Oversized document
   */
  test('should handle oversized document gracefully', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: [OVERSIZED_PROSPECTUS],
      metadata: CANADIAN_FILING_BUNDLE.metadata,
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    expect([400, 413]).toContain(response.status) // Bad request or Payload too large
  })

  /**
   * Test: Webhook registration
   */
  test('should register webhook when requested', async () => {
    const body = {
      filingSystem: 'sedar',
      documents: CANADIAN_FILING_BUNDLE.documents,
      metadata: CANADIAN_FILING_BUNDLE.metadata,
      options: {
        webhookUrl: 'https://example.com/webhooks/filing',
        registerWebhook: true,
        dryRun: false,
      },
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.filing.webhookRegistered).toBe(true)
  })
})

// ====================================================================
// TEST SUITE: Filing Status (/api/filings/status)
// ====================================================================

describe('GET /api/filings/status', () => {
  /**
   * Test: Retrieve filing status
   */
  test('should retrieve filing status by ID', async () => {
    const params = new URLSearchParams([
      ['filingId', 'sedar-filing-001'],
      ['system', 'sedar'],
    ])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.filing.id).toBeDefined()
    expect(responseData.filing.status).toBeDefined()
  })

  /**
   * Test: Missing filingId parameter
   */
  test('should reject request missing filingId', async () => {
    const params = new URLSearchParams([['system', 'sedar']])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('filingId')
  })

  /**
   * Test: Missing system parameter
   */
  test('should reject request missing system parameter', async () => {
    const params = new URLSearchParams([['filingId', 'test-001']])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('system')
  })

  /**
   * Test: Invalid system parameter
   */
  test('should reject invalid system parameter', async () => {
    const params = new URLSearchParams([
      ['filingId', 'test-001'],
      ['system', 'invalid'],
    ])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toContain('sedar or sec')
  })

  /**
   * Test: Empty filingId
   */
  test('should reject empty filingId', async () => {
    const params = new URLSearchParams([
      ['filingId', '   '],
      ['system', 'sedar'],
    ])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
  })

  /**
   * Test: Non-existent filing
   */
  test('should return 404 for non-existent filing', async () => {
    const params = new URLSearchParams([
      ['filingId', 'non-existent-filing-id'],
      ['system', 'sedar'],
    ])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)

    expect([404, 400]).toContain(response.status)
  })

  /**
   * Test: Status response format
   */
  test('should return properly formatted status response', async () => {
    const params = new URLSearchParams([
      ['filingId', 'sedar-filing-001'],
      ['system', 'sedar'],
    ])

    const request = {
      method: 'GET',
      headers: new Map(),
      nextUrl: { searchParams: params },
    } as unknown as NextRequest

    const response = await getStatus(request)
    const responseData = await response.json()

    expect(responseData.filing).toHaveProperty('id')
    expect(responseData.filing).toHaveProperty('referenceNumber')
    expect(responseData.filing).toHaveProperty('status')
    expect(responseData.filing).toHaveProperty('phase')
    expect(responseData.filing).toHaveProperty('lastUpdatedAt')
    expect(responseData.timestamp).toBeDefined()
  })
})

// ====================================================================
// TEST SUITE: Filing Status POST Alternative
// ====================================================================

describe('POST /api/filings/status', () => {
  /**
   * Test: POST status endpoint
   */
  test('should retrieve status via POST', async () => {
    const body = {
      filingId: 'sedar-filing-001',
      system: 'sedar',
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await postStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
  })

  /**
   * Test: Missing body fields
   */
  test('should reject POST missing required fields', async () => {
    const body = {
      filingId: 'test-001',
      // Missing system
    }

    const request = {
      method: 'POST',
      headers: new Map([['content-type', 'application/json']]),
      json: async () => body,
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await postStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
  })
})

// ====================================================================
// TEST SUITE: OPTIONS Methods
// ====================================================================

describe('OPTIONS /api/filings', () => {
  /**
   * Test: Submit endpoint OPTIONS
   */
  test('should return OPTIONS for submit endpoint', async () => {
    const request = {
      method: 'OPTIONS',
      headers: new Map(),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await OPTIONS(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.methods).toContain('POST')
    expect(responseData.requiredFields).toBeDefined()
  })

  /**
   * Test: Status endpoint OPTIONS
   */
  test('should return OPTIONS for status endpoint', async () => {
    const request = {
      method: 'OPTIONS',
      headers: new Map(),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest

    const response = await optionsStatus(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.methods).toContain('GET')
    expect(responseData.methods).toContain('POST')
  })
})
