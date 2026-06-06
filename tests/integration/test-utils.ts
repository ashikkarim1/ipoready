/**
 * Integration Test Utilities
 * Helpers for database setup, mocking, and test execution
 */

import { sql } from '@/lib/db'
import { Session } from 'next-auth'

/**
 * Test database connection pool
 */
export const testDb = {
  sql,
}

/**
 * Create a mock NextAuth session for testing
 */
export function createMockSession(
  overrides?: Partial<Session & { user: any }>
): Session & { user: any } {
  return {
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      companyId: 'test-company-123',
      role: 'admin',
      isApproved: true,
      subscriptionPlan: 'pro',
      isNewUser: false,
      trialStatus: 'active',
      ...overrides?.user,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

/**
 * Create test company in database
 */
export async function createTestCompany(overrides?: Record<string, any>) {
  const companyId = `test-company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const email = `test-company-${Date.now()}@example.com`

  const result = await sql`
    INSERT INTO companies (id, name, email, status)
    VALUES (${companyId}, ${'Test Company'}, ${email}, ${'active'})
    RETURNING *
  `

  return result[0]
}

/**
 * Create test user in database
 */
export async function createTestUser(overrides?: Record<string, any>) {
  const userId = `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const companyId = overrides?.companyId || `test-company-${Date.now()}`
  const email = overrides?.email || `test-user-${Date.now()}@example.com`

  const result = await sql`
    INSERT INTO users (id, company_id, email, name, role, is_approved)
    VALUES (${userId}, ${companyId}, ${email}, ${'Test User'}, ${'admin'}, true)
    RETURNING *
  `

  return result[0]
}

/**
 * Create test document
 */
export async function createTestDocument(companyId: string, overrides?: Record<string, any>) {
  const docId = `test-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const result = await sql`
    INSERT INTO documents (
      id, company_id, name, type, status, phase, required, for_filing
    )
    VALUES (
      ${docId}, ${companyId}, ${'Test Document'}, ${'general'}, ${'pending'},
      ${'phase_1'}, false, false
    )
    RETURNING *
  `

  return result[0]
}

/**
 * Clean up test data
 */
export async function cleanupTestData(companyId: string) {
  try {
    // Delete in correct order to respect foreign keys
    await sql`DELETE FROM document_versions WHERE document_id IN (
      SELECT id FROM documents WHERE company_id = ${companyId}
    )`

    await sql`DELETE FROM documents WHERE company_id = ${companyId}`

    await sql`DELETE FROM users WHERE company_id = ${companyId}`

    await sql`DELETE FROM companies WHERE id = ${companyId}`
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

/**
 * Execute raw SQL for test setup
 */
export async function executeSql(query: string) {
  // This is a direct query execution - use with caution in tests only
  return sql.unsafe(query)
}

/**
 * Verify data integrity - no duplicate documents
 */
export async function verifyNoDuplicateDocuments(companyId: string) {
  const result = await sql`
    SELECT
      name,
      COUNT(*) as count
    FROM unified_documents
    WHERE company_id = ${companyId}
    GROUP BY name
    HAVING COUNT(*) > 1
  `

  return result.length === 0 // true if no duplicates
}

/**
 * Mock external API responses
 */
export const createMockGoogleDriveService = () => ({
  files: {
    list: jest.fn().mockResolvedValue({
      data: {
        files: [
          {
            id: 'mock-file-123',
            name: 'Mock Document.pdf',
            mimeType: 'application/pdf',
            size: 1024,
            webViewLink: 'https://drive.google.com/file/d/mock-file-123/view',
          },
        ],
      },
    }),
    get: jest.fn().mockResolvedValue({
      data: {
        id: 'mock-file-123',
        name: 'Mock Document.pdf',
        webViewLink: 'https://drive.google.com/file/d/mock-file-123/view',
      },
    }),
    export: jest.fn().mockResolvedValue({
      data: Buffer.from('PDF content'),
    }),
  },
})

/**
 * Mock Stripe API responses
 */
export const createMockStripeClient = () => ({
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_test123',
      email: 'test@example.com',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'cus_test123',
      email: 'test@example.com',
    }),
  },
  subscriptions: {
    create: jest.fn().mockResolvedValue({
      id: 'sub_test123',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'sub_test123',
      status: 'active',
    }),
    update: jest.fn().mockResolvedValue({
      id: 'sub_test123',
      status: 'active',
    }),
  },
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      status: 'succeeded',
      client_secret: 'pi_test123_secret',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      status: 'succeeded',
    }),
  },
})

/**
 * Wait for async condition
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`Condition not met within ${timeout}ms`)
}
