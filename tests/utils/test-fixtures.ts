import { test as base, Page, Browser, BrowserContext } from '@playwright/test'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

/**
 * Test user credentials and data
 */
export const TEST_USERS = {
  admin: {
    email: 'e2e-admin@ipoready.test',
    password: 'TestPassword123!@#',
    role: 'system_admin',
  },
  ceo: {
    email: 'e2e-ceo@ipoready.test',
    password: 'TestPassword123!@#',
    role: 'ceo',
  },
  investor: {
    email: 'e2e-investor@ipoready.test',
    password: 'TestPassword123!@#',
    role: 'investor',
  },
  director: {
    email: 'e2e-director@ipoready.test',
    password: 'TestPassword123!@#',
    role: 'director',
  },
}

/**
 * Test company data
 */
export const TEST_COMPANY = {
  id: 'test-company-e2e-001',
  name: 'TechCorp E2E Test Inc.',
  symbol: 'TECH',
  founded: 2015,
  industry: 'Technology',
  employees: 150,
  website: 'https://techcorp.test',
  description: 'A technology company for E2E testing',
}

/**
 * Test document data
 */
export const TEST_DOCUMENTS = {
  prospectus: {
    name: 'prospectus-test.pdf',
    type: 'prospectus',
    content: Buffer.from('PDF test content for prospectus'),
  },
  financials: {
    name: 'financials-2024.xlsx',
    type: 'financial_statement',
    content: Buffer.from('XLSX test content for financials'),
  },
  charter: {
    name: 'articles-of-incorporation.docx',
    type: 'articles_of_incorporation',
    content: Buffer.from('DOCX test content for charter'),
  },
}

/**
 * Database helper functions
 */
export const dbHelpers = {
  /**
   * Create a test user in the database
   */
  async createUser(email: string, password: string, role: string, companyId?: string) {
    const hashedPassword = await hash(password, 10)
    const result = await sql`
      INSERT INTO users (email, password_hash, role, company_id, is_approved, created_at)
      VALUES (${email}, ${hashedPassword}, ${role}, ${companyId || null}, true, now())
      RETURNING id, email, role, company_id
    `
    return result[0]
  },

  /**
   * Create a test company
   */
  async createCompany(
    name: string,
    symbol: string,
    industry?: string,
    founderEmail?: string
  ) {
    const result = await sql`
      INSERT INTO companies (
        name,
        symbol,
        industry,
        founder_email,
        status,
        created_at
      )
      VALUES (
        ${name},
        ${symbol},
        ${industry || null},
        ${founderEmail || null},
        'active',
        now()
      )
      RETURNING id, name, symbol, status
    `
    return result[0]
  },

  /**
   * Create a test document
   */
  async createDocument(
    companyId: string,
    fileName: string,
    documentType: string,
    userId: string
  ) {
    const result = await sql`
      INSERT INTO unified_documents (
        company_id,
        file_name,
        document_type,
        file_size,
        uploaded_by,
        storage_provider,
        remote_file_id,
        is_reviewed,
        created_at
      )
      VALUES (
        ${companyId},
        ${fileName},
        ${documentType},
        1024,
        ${userId},
        'local',
        'test-file-' + ${Date.now()},
        false,
        now()
      )
      RETURNING id, file_name, document_type, created_at
    `
    return result[0]
  },

  /**
   * Delete test user
   */
  async deleteUser(email: string) {
    await sql`DELETE FROM users WHERE email = ${email}`
  },

  /**
   * Delete test company and related data
   */
  async deleteCompany(companyId: string) {
    // Delete documents first
    await sql`DELETE FROM unified_documents WHERE company_id = ${companyId}`
    // Delete users
    await sql`DELETE FROM users WHERE company_id = ${companyId}`
    // Delete company
    await sql`DELETE FROM companies WHERE id = ${companyId}`
  },

  /**
   * Clear all test data
   */
  async clearTestData() {
    const testEmails = Object.values(TEST_USERS).map((u) => u.email)
    await sql`DELETE FROM users WHERE email = ANY(${testEmails})`
    await sql`DELETE FROM companies WHERE id = ${TEST_COMPANY.id}`
  },
}

/**
 * Navigation helpers
 */
export const navigationHelpers = {
  async goToDashboard(page: Page) {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  },

  async goToDocuments(page: Page) {
    await page.goto('/dashboard/documents', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  },

  async goToCapitalMarkets(page: Page) {
    await page.goto('/dashboard/capital-markets', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  },

  async goToCompliance(page: Page) {
    await page.goto('/dashboard/compliance', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  },

  async goToLogin(page: Page) {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  },
}

/**
 * Authentication helpers
 */
export const authHelpers = {
  /**
   * Login with email and password
   */
  async loginWithCredentials(
    page: Page,
    email: string,
    password: string
  ) {
    await navigationHelpers.goToLogin(page)

    // Fill in email
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(email)

    // Fill in password
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(password)

    // Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { waitUntil: 'networkidle' })
  },

  /**
   * Logout
   */
  async logout(page: Page) {
    // Click user menu
    const userMenuButton = page.locator('[data-testid="user-menu"]')
    await userMenuButton.click()

    // Click logout
    const logoutButton = page.locator('text=Log out')
    await logoutButton.click()

    // Wait for redirect to login
    await page.waitForURL('/login', { waitUntil: 'networkidle' })
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(page: Page): Promise<boolean> {
    try {
      await page.goto('/dashboard', { waitUntil: 'networkidle' })
      return !page.url().includes('/login')
    } catch {
      return false
    }
  },
}

/**
 * Document helpers
 */
export const documentHelpers = {
  /**
   * Upload a document
   */
  async uploadDocument(
    page: Page,
    filePath: string,
    documentType: string
  ) {
    // Find file input
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    // Select document type if dropdown exists
    if (documentType) {
      const typeSelect = page.locator('[data-testid="document-type-select"]')
      await typeSelect.click()
      await page.locator(`text=${documentType}`).click()
    }

    // Submit upload
    const uploadButton = page.locator('button:has-text("Upload")')
    await uploadButton.click()

    // Wait for upload to complete
    await page.waitForLoadState('networkidle')
  },

  /**
   * Download a document
   */
  async downloadDocument(page: Page, documentName: string) {
    const downloadPromise = page.waitForEvent('download')

    // Find and click download button for document
    const downloadButton = page.locator(
      `xpath=//text()[contains(., '${documentName}')]/../../..//button[contains(text(), 'Download')]`
    )
    await downloadButton.click()

    const download = await downloadPromise
    return download
  },

  /**
   * View document details
   */
  async viewDocument(page: Page, documentName: string) {
    // Find and click on document
    const documentLink = page.locator(
      `xpath=//text()[contains(., '${documentName}')]`
    )
    await documentLink.first().click()
    await page.waitForLoadState('domcontentloaded')
  },

  /**
   * Delete a document
   */
  async deleteDocument(page: Page, documentName: string) {
    // Find delete button for document
    const deleteButton = page.locator(
      `xpath=//text()[contains(., '${documentName}')]/../../..//button[contains(text(), 'Delete')]`
    )
    await deleteButton.click()

    // Confirm deletion
    const confirmButton = page.locator('text=Confirm')
    await confirmButton.click()

    await page.waitForLoadState('networkidle')
  },
}

/**
 * Custom Playwright test fixture
 */
export const test = base.extend<{
  authenticatedPage: Page
  testUser: typeof TEST_USERS.admin
}>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: create test user and login
    try {
      await dbHelpers.createUser(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password,
        TEST_USERS.admin.role
      )
    } catch (e) {
      // User might already exist
    }

    await authHelpers.loginWithCredentials(
      page,
      TEST_USERS.admin.email,
      TEST_USERS.admin.password
    )

    await use(page)

    // Cleanup: logout and delete test user
    try {
      await authHelpers.logout(page)
    } catch (e) {
      // Already logged out
    }

    try {
      await dbHelpers.deleteUser(TEST_USERS.admin.email)
    } catch (e) {
      // User cleanup failed
    }
  },

  testUser: async ({}, use) => {
    await use(TEST_USERS.admin)
  },
})

export { expect } from '@playwright/test'
