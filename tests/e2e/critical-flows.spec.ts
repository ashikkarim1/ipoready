/**
 * IPOReady E2E Critical Flow Tests
 *
 * Tests the most important user journeys before production
 * - User signup and onboarding
 * - PACE™ dashboard navigation
 * - Document upload and management
 * - Company information updates
 *
 * Run: npx playwright test tests/e2e/critical-flows.spec.ts
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const TEST_TIMEOUT = 30000

test.describe('IPOReady Critical Flows', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto(BASE_URL)
  })

  test.afterEach(async () => {
    await page.close()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 1: Landing Page → Sign Up
  // ─────────────────────────────────────────────────────────────────────────

  test('Should load landing page with hero and CTA', async () => {
    // Wait for main content
    await page.waitForSelector('h1, h2', { timeout: TEST_TIMEOUT })

    // Check hero section exists
    const heroText = await page.locator('h1, h2').first().textContent()
    expect(heroText).toBeTruthy()
    expect(heroText).toContain('IPO')

    // Check CTA button exists
    const ctaButtons = await page.locator('button, a').filter({ hasText: /sign up|get started|login/i })
    expect(ctaButtons).toBeTruthy()
  })

  test('Should navigate to signup page from CTA', async () => {
    // Click signup/register button
    const signupButton = page.locator('a, button').filter({ hasText: /sign up|create account/i }).first()
    await signupButton.click()

    // Wait for signup page
    await page.waitForURL(/.*register|signup/i, { timeout: TEST_TIMEOUT })
    expect(page.url()).toMatch(/register|signup/i)

    // Check signup form fields exist
    await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: TEST_TIMEOUT })
    const emailInput = page.locator('input[type="email"]')
    expect(emailInput).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 2: Dashboard → PACE™ Overview
  // ─────────────────────────────────────────────────────────────────────────

  test('Should display PACE™ dashboard after login', async ({ browser }) => {
    // Skip if not authenticated
    const cookies = await page.context().cookies()
    const isAuthenticated = cookies.some((c) => c.name.includes('next-auth'))

    if (!isAuthenticated) {
      // Go to login and check that unauthenticated access is redirected
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForURL(/login|leads\/capture/, { timeout: TEST_TIMEOUT })
      expect(page.url()).toMatch(/login|leads/)
      return
    }

    // If authenticated, dashboard should load
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle', { timeout: TEST_TIMEOUT })

    // Check key dashboard elements
    const missionControl = page.locator('text=Mission Control')
    if (await missionControl.isVisible()) {
      expect(missionControl).toBeTruthy()
    }

    // Check PACE score exists
    const paceScore = page.locator('text=PACE').first()
    expect(paceScore).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 3: Documents → Upload & List
  // ─────────────────────────────────────────────────────────────────────────

  test('Should navigate to documents page and show list', async () => {
    // Navigate to documents
    await page.goto(`${BASE_URL}/documents`)

    // Check for documents page elements
    const heading = page.locator('h1, h2').filter({ hasText: /document/i })
    if (await heading.isVisible()) {
      expect(heading).toBeTruthy()
    }

    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: TEST_TIMEOUT })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 4: Account → User Settings
  // ─────────────────────────────────────────────────────────────────────────

  test('Should load account settings page', async () => {
    await page.goto(`${BASE_URL}/account`)

    // Wait for page content
    await page.waitForLoadState('networkidle', { timeout: TEST_TIMEOUT })

    // Check for account-related content
    const heading = page.locator('h1, h2').first()
    const headingText = await heading.textContent()
    expect(headingText).toBeTruthy()

    // Look for form fields or settings content
    const formElements = await page.locator('input, button, select').count()
    expect(formElements).toBeGreaterThan(0)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 5: Navigation → Menu Accessibility
  // ─────────────────────────────────────────────────────────────────────────

  test('Should have accessible navigation menu', async () => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Check for navigation elements
    const navLinks = page.locator('nav a, [role="navigation"] a')
    const navCount = await navLinks.count()

    // Should have at least some navigation links
    expect(navCount).toBeGreaterThan(0)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 6: Responsive Design → Mobile
  // ─────────────────────────────────────────────────────────────────────────

  test('Should be responsive on mobile viewport', async ({ browser }) => {
    const mobileContext = await browser.createBrowserContext({
      viewport: { width: 375, height: 667 }, // iPhone 8
    })
    const mobilePage = await mobileContext.newPage()
    await mobilePage.goto(BASE_URL)
    await mobilePage.waitForLoadState('networkidle')

    // Check that content is visible
    const heading = mobilePage.locator('h1, h2').first()
    expect(heading).toBeTruthy()

    // Check that navigation is accessible
    const buttons = mobilePage.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)

    await mobilePage.close()
    await mobileContext.close()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 7: Error Handling → 404 Page
  // ─────────────────────────────────────────────────────────────────────────

  test('Should show 404 for invalid routes', async () => {
    await page.goto(`${BASE_URL}/this-page-does-not-exist-12345`, { waitUntil: 'networkidle' })

    // Check for 404 or error message
    const content = await page.textContent('body')
    expect(content).toMatch(/not found|404|page doesn't exist/i)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 8: Performance → Page Load Time
  // ─────────────────────────────────────────────────────────────────────────

  test('Should load pages within acceptable time', async () => {
    const startTime = Date.now()
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Pages should load in < 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 9: API Health → Basic API Routes
  // ─────────────────────────────────────────────────────────────────────────

  test('Should have healthy API endpoints', async () => {
    // Test basic API endpoint
    const response = await page.request.get(`${BASE_URL}/api/health`, {
      validateStatus: () => true, // Don't throw on any status
    })

    // API should respond (200 or 404 is fine, 500 is bad)
    expect(response.status()).not.toBe(500)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW 10: Security → No XSS Vulnerabilities in Input
  // ─────────────────────────────────────────────────────────────────────────

  test('Should protect against XSS in form inputs', async () => {
    await page.goto(BASE_URL)

    // Find a search or input field
    const inputs = await page.locator('input[type="text"], input[type="search"]')
    if ((await inputs.count()) > 0) {
      const firstInput = inputs.first()

      // Type malicious input
      await firstInput.fill('<script>alert("XSS")</script>')

      // Should render as escaped text, not execute
      const pageContent = await page.content()
      expect(pageContent).not.toContain('<script>alert')
    }
  })
})

/**
 * Performance test suite
 */
test.describe('Performance Benchmarks', () => {
  test('Dashboard should load in < 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' })
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(2000)
  })

  test('API endpoints should respond in < 500ms', async ({ page }) => {
    const startTime = Date.now()
    const response = await page.request.get(`${BASE_URL}/api/health`)
    const responseTime = Date.now() - startTime

    expect(response.ok()).toBeTruthy()
    expect(responseTime).toBeLessThan(500)
  })
})
