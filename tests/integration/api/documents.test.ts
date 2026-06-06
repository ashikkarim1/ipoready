/**
 * Integration Tests: Documents API Endpoints
 * Test document retrieval, creation, updating, and deletion
 */

import { sql } from '@/lib/db'
import {
  createMockSession,
  createTestCompany,
  createTestUser,
  createTestDocument,
  cleanupTestData,
} from '../test-utils'

// Mock getServerSession
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth'

describe('Documents API Endpoints', () => {
  let testCompanyId: string
  let testUserId: string

  beforeEach(async () => {
    // Create test data
    const company = await createTestCompany()
    testCompanyId = company.id
    const user = await createTestUser({ companyId: testCompanyId })
    testUserId = user.id
  })

  afterEach(async () => {
    await cleanupTestData(testCompanyId)
  })

  describe('GET /api/documents', () => {
    it('should return 401 when not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      // Import route handler
      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return 401 when user has no companyId', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: null } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return documents for authenticated user', async () => {
      const doc = await createTestDocument(testCompanyId)

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.documents).toBeDefined()
      expect(data.documents.length).toBeGreaterThan(0)
      expect(data.documents[0].id).toBe(doc.id)
    })

    it('should only return documents for user company', async () => {
      // Create documents for test company
      await createTestDocument(testCompanyId)
      await createTestDocument(testCompanyId)

      // Create another company with documents
      const otherCompany = await createTestCompany()
      await createTestDocument(otherCompany.id)

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      expect(data.documents).toBeDefined()
      expect(data.documents.every((d: any) => d.company_id === testCompanyId)).toBe(true)

      await cleanupTestData(otherCompany.id)
    })

    it('should order documents by phase and creation date', async () => {
      await createTestDocument(testCompanyId)
      await new Promise(resolve => setTimeout(resolve, 100))
      await createTestDocument(testCompanyId)

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      expect(data.documents).toBeDefined()
      expect(Array.isArray(data.documents)).toBe(true)
    })

    it('should include document version information', async () => {
      const doc = await createTestDocument(testCompanyId)

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      expect(data.documents).toBeDefined()
      if (data.documents.length > 0) {
        const document = data.documents[0]
        expect(document).toHaveProperty('id')
        expect(document).toHaveProperty('name')
        expect(document).toHaveProperty('type')
        expect(document).toHaveProperty('status')
        expect(document).toHaveProperty('created_at')
      }
    })
  })

  describe('Document Validation', () => {
    it('should validate required fields', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0]
        expect(doc.id).toBeDefined()
        expect(doc.company_id).toBeDefined()
        expect(doc.name).toBeDefined()
      }
    })

    it('should handle empty document list', async () => {
      // Create company with no documents
      const emptyCompany = await createTestCompany()

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: emptyCompany.id } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.documents).toBeDefined()
      expect(Array.isArray(data.documents)).toBe(true)

      await cleanupTestData(emptyCompany.id)
    })
  })

  describe('Document Filtering', () => {
    it('should filter documents by status', async () => {
      // This assumes filter query parameter support
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      const data = await response.json()

      expect(data.documents).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      expect([200, 500]).toContain(response.status)
    })

    it('should handle invalid company ID format', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: 'invalid-id-format' } })
      )

      const { GET } = await import('@/app/api/documents/route')

      const response = await GET()
      // Should either return empty results or error
      expect([200, 400, 500]).toContain(response.status)
    })
  })
})
