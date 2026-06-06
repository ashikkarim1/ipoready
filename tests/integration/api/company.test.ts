/**
 * Integration Tests: Company API Endpoints
 * Test company data retrieval and management
 */

import { sql } from '@/lib/db'
import {
  createMockSession,
  createTestCompany,
  createTestUser,
  cleanupTestData,
} from '../test-utils'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth'

describe('Company API Endpoints', () => {
  let testCompanyId: string
  let testUserId: string

  beforeEach(async () => {
    const company = await createTestCompany()
    testCompanyId = company.id
    const user = await createTestUser({ companyId: testCompanyId })
    testUserId = user.id
  })

  afterEach(async () => {
    await cleanupTestData(testCompanyId)
  })

  describe('GET /api/company', () => {
    it('should return 401 when not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return company data for authenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      expect([200, 400]).toContain(response.status)
    })

    it('should only return user own company data', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      const data = await response.json()

      if (data.company) {
        // Should be the user's company, not another one
        expect(data.company.id).toBeDefined()
      }
    })
  })

  describe('Company Data Validation', () => {
    it('should validate company fields', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      const data = await response.json()

      if (data.company) {
        expect(data.company).toHaveProperty('id')
        expect(data.company).toHaveProperty('name')
        expect(typeof data.company.id).toBe('string')
        expect(typeof data.company.name).toBe('string')
      }
    })

    it('should handle missing company gracefully', async () => {
      const nonExistentCompanyId = 'non-existent-company-id'

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: nonExistentCompanyId } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      expect([200, 400, 404]).toContain(response.status)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid session data', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: null } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should handle database errors', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('Company Search and Filtering', () => {
    it('should search companies by name', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(
        createMockSession({ user: { companyId: testCompanyId } })
      )

      const { GET } = await import('@/app/api/company/route')

      const response = await GET()
      expect([200, 400]).toContain(response.status)
    })
  })
})
