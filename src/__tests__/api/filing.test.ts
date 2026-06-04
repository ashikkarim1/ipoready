/**
 * Filing API Route Tests
 * Tests for all four filing system API endpoints
 *
 * Coverage:
 * 1. POST /api/filing/submit
 * 2. GET /api/filing/status
 * 3. POST /api/filing/validate
 * 4. GET /api/filing/systems
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getServerSession } from 'next-auth'
import { sql } from '@/lib/db'

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock database
vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}))

// Import the route handlers
import { POST as submitFiling } from '@/app/api/filing/route'
import { GET as getFilingStatus } from '@/app/api/filing/status/route'
import { POST as validateFiling } from '@/app/api/filing/validate/route'
import { GET as listFilingSystems } from '@/app/api/filing/systems/route'

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: POST /api/filing/submit
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/filing/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce(null)

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'test-id',
        companyId: 'company-id',
        filingType: 'prospectus',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body.error).toMatch(/Unauthorized/)
  })

  it('should return 400 if required fields are missing', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        // Missing filingSystemId, companyId, filingType, documents
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.code).toBe('MISSING_REQUIRED_FIELDS')
  })

  it('should return 403 if user does not own the company', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'different-company-id' },
    } as any)

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'test-id',
        companyId: 'company-id',
        filingType: 'prospectus',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(403)

    const body = await response.json()
    expect(body.code).toBe('COMPANY_MISMATCH')
  })

  it('should return 404 if company does not exist', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([]) // No company found

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'test-id',
        companyId: 'company-id',
        filingType: 'prospectus',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.code).toBe('COMPANY_NOT_FOUND')
  })

  it('should return 404 if filing system does not exist', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([{ id: 'company-id' }]) // Company found
    mockDb.mockResolvedValueOnce([]) // Filing system not found

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'invalid-id',
        companyId: 'company-id',
        filingType: 'prospectus',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.code).toBe('FILING_SYSTEM_NOT_FOUND')
  })

  it('should return 400 if filing system is not active', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([{ id: 'company-id' }]) // Company found
    mockDb.mockResolvedValueOnce([
      {
        id: 'filing-system-id',
        name: 'Test System',
        adapter_class: 'TestAdapter',
        config: {},
        status: 'maintenance', // Not active
      },
    ])

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'filing-system-id',
        companyId: 'company-id',
        filingType: 'prospectus',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.code).toBe('FILING_SYSTEM_INACTIVE')
  })

  it('should successfully create a filing with valid inputs', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([{ id: 'company-id' }]) // Company found
    mockDb.mockResolvedValueOnce([
      {
        id: 'filing-system-id',
        name: 'Test System',
        adapter_class: 'TestAdapter',
        config: {},
        status: 'active',
      },
    ])
    mockDb.mockResolvedValueOnce([{ id: 'filing-id', status: 'draft' }]) // Filing inserted
    mockDb.mockResolvedValueOnce([]) // Document 1 inserted
    mockDb.mockResolvedValueOnce([]) // Status log inserted

    const request = new Request('http://localhost:3000/api/filing', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'filing-system-id',
        companyId: 'company-id',
        filingType: 'prospectus',
        documents: [
          { documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' },
          { documentType: 'exhibit_a', documentName: 'exhibit.pdf', filePath: 's3://exhibit' },
        ],
        metadata: { certificationStatus: 'certified' },
      }),
    })

    const response = await submitFiling(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.filingId).toBeDefined()
    expect(body.status).toBe('draft')
    expect(body.message).toMatch(/successfully/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: GET /api/filing/status
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/filing/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce(null)

    const url = new URL('http://localhost:3000/api/filing/status?filingId=test-id')
    const request = new Request(url.toString())

    const response = await getFilingStatus(request as any)
    expect(response.status).toBe(401)
  })

  it('should return 400 if filingId query param is missing', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const request = new Request('http://localhost:3000/api/filing/status')

    const response = await getFilingStatus(request as any)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.code).toBe('MISSING_FILING_ID')
  })

  it('should return 404 if filing does not exist', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([]) // Filing not found

    const url = new URL('http://localhost:3000/api/filing/status?filingId=invalid-id')
    const request = new Request(url.toString())

    const response = await getFilingStatus(request as any)
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.code).toBe('FILING_NOT_FOUND')
  })

  it('should return 403 if user does not own the filing', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'different-company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([
      {
        id: 'filing-id',
        company_id: 'company-id',
        filing_system_id: 'system-id',
        filing_type: 'prospectus',
        status: 'draft',
        submission_reference: null,
        submitted_at: null,
        accepted_at: null,
        rejected_at: null,
        error_message: null,
        error_code: null,
        submission_attempts: 0,
        created_at: '2026-06-04T00:00:00Z',
        updated_at: '2026-06-04T00:00:00Z',
      },
    ])

    const url = new URL('http://localhost:3000/api/filing/status?filingId=filing-id')
    const request = new Request(url.toString())

    const response = await getFilingStatus(request as any)
    expect(response.status).toBe(403)

    const body = await response.json()
    expect(body.code).toBe('COMPANY_MISMATCH')
  })

  it('should return filing status with history', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([
      {
        id: 'filing-id',
        company_id: 'company-id',
        filing_system_id: 'system-id',
        filing_type: 'prospectus',
        status: 'submitted',
        submission_reference: 'ref-123',
        submitted_at: '2026-06-04T10:00:00Z',
        accepted_at: null,
        rejected_at: null,
        error_message: null,
        error_code: null,
        submission_attempts: 1,
        created_at: '2026-06-04T00:00:00Z',
        updated_at: '2026-06-04T10:00:00Z',
      },
    ])
    mockDb.mockResolvedValueOnce([
      {
        id: 'log-1',
        old_status: null,
        new_status: 'draft',
        reason: 'Filing created',
        trigger_type: 'system_event',
        triggered_by: 'user-id',
        external_response: {},
        changed_at: '2026-06-04T00:00:00Z',
      },
      {
        id: 'log-2',
        old_status: 'draft',
        new_status: 'submitted',
        reason: 'Submitted to filing system',
        trigger_type: 'user_action',
        triggered_by: 'user-id',
        external_response: { reference: 'ref-123' },
        changed_at: '2026-06-04T10:00:00Z',
      },
    ])

    const url = new URL('http://localhost:3000/api/filing/status?filingId=filing-id')
    const request = new Request(url.toString())

    const response = await getFilingStatus(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.filing.id).toBe('filing-id')
    expect(body.filing.status).toBe('submitted')
    expect(body.history).toHaveLength(2)
    expect(body.history[0].newStatus).toBe('submitted')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: POST /api/filing/validate
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/filing/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce(null)

    const request = new Request('http://localhost:3000/api/filing/validate', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'test-id',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await validateFiling(request as any)
    expect(response.status).toBe(401)
  })

  it('should return 400 if required fields are missing', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const request = new Request('http://localhost:3000/api/filing/validate', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await validateFiling(request as any)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.code).toBe('MISSING_REQUIRED_FIELDS')
  })

  it('should return 404 if filing system does not exist', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([]) // Filing system not found

    const request = new Request('http://localhost:3000/api/filing/validate', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'invalid-id',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://path' }],
      }),
    })

    const response = await validateFiling(request as any)
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.code).toBe('FILING_SYSTEM_NOT_FOUND')
  })

  it('should validate documents without errors', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([
      {
        id: 'system-id',
        name: 'Test System',
        config: {},
        status: 'active',
      },
    ])
    mockDb.mockResolvedValueOnce([
      {
        id: 'rule-1',
        rule_name: 'Prospectus Format',
        rule_category: 'file_format',
        document_types: ['prospectus'],
        rule_definition: {
          type: 'file_format_check',
          allowedFormats: ['pdf', 'docx'],
        },
        is_critical: true,
        is_active: true,
        description: 'Prospectus must be PDF or DOCX',
      },
    ])

    const request = new Request('http://localhost:3000/api/filing/validate', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'system-id',
        documents: [{ documentType: 'prospectus', documentName: 'doc.pdf', filePath: 's3://doc.pdf' }],
      }),
    })

    const response = await validateFiling(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.valid).toBe(true)
    expect(body.errors).toHaveLength(0)
  })

  it('should detect validation errors for invalid file format', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([
      {
        id: 'system-id',
        name: 'Test System',
        config: {},
        status: 'active',
      },
    ])
    mockDb.mockResolvedValueOnce([
      {
        id: 'rule-1',
        rule_name: 'Prospectus Format',
        rule_category: 'file_format',
        document_types: ['prospectus'],
        rule_definition: {
          type: 'file_format_check',
          allowedFormats: ['pdf'],
        },
        is_critical: true,
        is_active: true,
        description: 'Prospectus must be PDF',
      },
    ])

    const request = new Request('http://localhost:3000/api/filing/validate', {
      method: 'POST',
      body: JSON.stringify({
        filingSystemId: 'system-id',
        documents: [{ documentType: 'prospectus', documentName: 'doc.txt', filePath: 's3://doc.txt' }],
      }),
    })

    const response = await validateFiling(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.valid).toBe(false)
    expect(body.errors.length).toBeGreaterThan(0)
    expect(body.errors[0].code).toBe('INVALID_FILE_FORMAT')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: GET /api/filing/systems
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/filing/systems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce(null)

    const request = new Request('http://localhost:3000/api/filing/systems')

    const response = await listFilingSystems(request as any)
    expect(response.status).toBe(401)
  })

  it('should list all active filing systems', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([
      {
        id: 'tsx-id',
        name: 'TSX Filing System',
        country: 'Canada',
        exchange: 'tsx',
        listing_type: null,
        adapter_class: 'TSXAdapter',
        api_endpoint: 'https://api.tsx.com',
        api_version: 'v1',
        auth_method: 'api_key',
        config: { timeout_seconds: 30 },
        supports_batch_upload: true,
        supports_digital_signature: false,
        supports_e_delivery: true,
        requires_officer_certification: true,
        rate_limit_per_hour: 100,
        max_concurrent_submissions: 5,
        status: 'active',
        notes: 'Primary TSX filing system',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-06-04T00:00:00Z',
      },
    ])

    const request = new Request('http://localhost:3000/api/filing/systems')

    const response = await listFilingSystems(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.count).toBe(1)
    expect(body.systems).toHaveLength(1)
    expect(body.systems[0].exchange).toBe('tsx')
  })

  it('should filter filing systems by country', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([
      {
        id: 'tsx-id',
        name: 'TSX Filing System',
        country: 'Canada',
        exchange: 'tsx',
        listing_type: null,
        adapter_class: 'TSXAdapter',
        api_endpoint: 'https://api.tsx.com',
        api_version: 'v1',
        auth_method: 'api_key',
        config: {},
        supports_batch_upload: true,
        supports_digital_signature: false,
        supports_e_delivery: true,
        requires_officer_certification: true,
        rate_limit_per_hour: 100,
        max_concurrent_submissions: 5,
        status: 'active',
        notes: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-06-04T00:00:00Z',
      },
    ])

    const url = new URL('http://localhost:3000/api/filing/systems?country=CA')
    const request = new Request(url.toString())

    const response = await listFilingSystems(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.systems).toHaveLength(1)
    expect(body.systems[0].country).toBe('Canada')
  })

  it('should return empty list if no filing systems match filter', async () => {
    const mockSession = vi.mocked(getServerSession)
    mockSession.mockResolvedValueOnce({
      user: { id: 'user-id', companyId: 'company-id' },
    } as any)

    const mockDb = vi.mocked(sql)
    mockDb.mockResolvedValueOnce([])

    const url = new URL('http://localhost:3000/api/filing/systems?country=JP')
    const request = new Request(url.toString())

    const response = await listFilingSystems(request as any)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.count).toBe(0)
    expect(body.systems).toHaveLength(0)
  })
})
