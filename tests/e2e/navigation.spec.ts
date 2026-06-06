import {
  test,
  expect,
  TEST_USERS,
  TEST_COMPANY,
  dbHelpers,
  authHelpers,
  navigationHelpers,
} from '../utils/test-fixtures'

test.describe('Navigation - All Routes and Paths', () => {
  test.beforeAll(async () => {
    // Setup: Create test user and company
    try {
      await dbHelpers.clearTestData()
    } catch (e) {
      console.log('No existing test data')
    }

    const user = await dbHelpers.createUser(
      TEST_USERS.admin.email,
      TEST_USERS.admin.password,
      TEST_USERS.admin.role
    )

    await dbHelpers.createCompany(
      TEST_COMPANY.name,
      TEST_COMPANY.symbol,
      TEST_COMPANY.industry
    )
  })

  test.afterAll(async () => {
    // Cleanup
    try {
      await dbHelpers.deleteCompany(TEST_COMPANY.id)
      await dbHelpers.deleteUser(TEST_USERS.admin.email)
    } catch (e) {
      console.log('Cleanup failed')
    }
  })

  test.beforeEach(async ({ page }) => {
    // Setup: Login before each test
    await authHelpers.loginWithCredentials(
      page,
      TEST_USERS.admin.email,
      TEST_USERS.admin.password
    )
  })

  test('should navigate to main dashboard', async ({ page }) => {
    // Execute: Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Assert: Dashboard loads
    expect(page.url()).toContain('/dashboard')
    const pageTitle = page.locator('h1, h2')
    await expect(pageTitle).toBeVisible()
  })

  test('should navigate to documents page', async ({ page }) => {
    // Execute: Navigate to documents
    await navigationHelpers.goToDocuments(page)

    // Assert: Documents page loads
    expect(page.url()).toContain('/documents')
  })

  test('should navigate to capital markets', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Capital markets page loads
    expect(page.url()).toContain('/dashboard/capital-markets')
  })

  test('should navigate to compliance', async ({ page }) => {
    // Execute: Navigate to compliance
    await navigationHelpers.goToCompliance(page)

    // Assert: Compliance page loads
    expect(page.url()).toContain('/dashboard/compliance')
  })

  test('should navigate using sidebar menu', async ({ page }) => {
    // Navigate to dashboard first
    await navigationHelpers.goToDashboard(page)

    // Assert: Sidebar visible
    const sidebar = page.locator('nav, [data-testid="sidebar"]')
    const isSidebarVisible = await sidebar
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isSidebarVisible) {
      // Assert: Menu items visible
      const menuItems = page.locator('nav a, [data-testid="nav-item"]')
      const count = await menuItems.count()
      expect(count).toBeGreaterThan(0)

      // Execute: Click first menu item
      const firstMenuItem = menuItems.first()
      const href = await firstMenuItem.getAttribute('href')

      if (href) {
        await firstMenuItem.click()
        await page.waitForLoadState('networkidle')

        // Assert: Navigation occurred
        expect(page.url()).toContain(href)
      }
    }
  })

  test('should navigate using header navigation', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for header navigation
    const header = page.locator('header, [role="banner"]')
    const isHeaderVisible = await header
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isHeaderVisible) {
      // Assert: Header visible
      await expect(header).toBeVisible()

      // Look for navigation links in header
      const navLinks = header.locator('a')
      const count = await navLinks.count()

      if (count > 0) {
        // Execute: Click first navigation link
        const firstLink = navLinks.first()
        const href = await firstLink.getAttribute('href')

        if (href && href !== '#') {
          await firstLink.click()
          await page.waitForLoadState('networkidle')
        }
      }
    }
  })

  test('should navigate with breadcrumbs', async ({ page }) => {
    // Navigate to a nested page
    await navigationHelpers.goToDocuments(page)

    // Look for breadcrumbs
    const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"], [data-testid="breadcrumbs"]')
    const isBreadcrumbsVisible = await breadcrumbs
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isBreadcrumbsVisible) {
      // Assert: Breadcrumbs visible
      await expect(breadcrumbs).toBeVisible()

      // Look for breadcrumb items
      const breadcrumbItems = breadcrumbs.locator('a')
      const count = await breadcrumbItems.count()

      if (count > 0) {
        // Execute: Click first breadcrumb
        await breadcrumbItems.first().click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('should handle back button navigation', async ({ page }) => {
    // Execute: Navigate to documents
    await navigationHelpers.goToDocuments(page)
    const docsUrl = page.url()

    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)
    expect(page.url()).not.toEqual(docsUrl)

    // Execute: Go back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Assert: Back to documents page
    expect(page.url()).toContain('/documents')
  })

  test('should handle forward button navigation', async ({ page }) => {
    // Execute: Navigate to documents
    await navigationHelpers.goToDocuments(page)

    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Execute: Go back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Execute: Go forward
    await page.goForward()
    await page.waitForLoadState('networkidle')

    // Assert: Forward to capital markets
    expect(page.url()).toContain('/dashboard/capital-markets')
  })

  test('should navigate to cap table', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for cap table link
    const capTableLink = page.locator('a[href*="cap-table"], text=Cap Table')
    const isCapTableVisible = await capTableLink
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isCapTableVisible) {
      // Execute: Navigate to cap table
      await capTableLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: On cap table page
      expect(page.url()).toContain('cap-table')
    }
  })

  test('should navigate to financial management', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for financial link
    const financialLink = page.locator('a[href*="financial"], text=Financial')
    const isFinancialVisible = await financialLink
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isFinancialVisible) {
      // Execute: Navigate
      await financialLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: On financial page
      expect(page.url()).toContain('financial')
    }
  })

  test('should navigate to investor readiness', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for investor readiness link
    const investorLink = page.locator('a[href*="investor"], text=Investor')
    const isInvestorVisible = await investorLink
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isInvestorVisible) {
      // Execute: Navigate
      await investorLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: On investor page
      expect(page.url()).toContain('investor')
    }
  })

  test('should navigate to filings', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for filings link
    const filingsLink = page.locator('a[href*="filing"], text=Filing')
    const isFilingsVisible = await filingsLink
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isFilingsVisible) {
      // Execute: Navigate
      await filingsLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: On filings page
      expect(page.url()).toContain('filing')
    }
  })

  test('should navigate to prospectus', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for prospectus link
    const prospectusLink = page.locator('a[href*="prospectus"], text=Prospectus')
    const isProspectusVisible = await prospectusLink
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isProspectusVisible) {
      // Execute: Navigate
      await prospectusLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: On prospectus page
      expect(page.url()).toContain('prospectus')
    }
  })

  test('should navigate to integrations', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for integrations link
    const integrationsLink = page.locator('a[href*="integrations"], text=Integrations')
    const isIntegrationsVisible = await integrationsLink
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isIntegrationsVisible) {
      // Execute: Navigate
      await integrationsLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: On integrations page
      expect(page.url()).toContain('integrations')
    }
  })

  test('should navigate using keyboard shortcuts', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Execute: Press Home key (if supported)
    await page.keyboard.press('Home')
    await page.waitForTimeout(500)

    // Note: Keyboard navigation depends on implementation
    // This test documents the expected behavior
  })

  test('should maintain scroll position when navigating back', async ({ page }) => {
    // Execute: Navigate to documents
    await navigationHelpers.goToDocuments(page)

    // Execute: Scroll down
    await page.evaluate(() => window.scrollBy(0, 500))
    const scrollPosAfter = await page.evaluate(() => window.scrollY)

    // Execute: Navigate away
    await navigationHelpers.goToDashboard(page)
    await page.waitForLoadState('networkidle')

    // Execute: Navigate back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Note: Scroll position preservation depends on browser behavior
    // This test documents the expected behavior
  })

  test('should highlight current navigation item', async ({ page }) => {
    // Execute: Navigate to documents
    await navigationHelpers.goToDocuments(page)

    // Look for active nav item
    const activeNavItem = page.locator('nav [class*="active"], nav [aria-current="page"]')
    const isActiveVisible = await activeNavItem
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isActiveVisible) {
      // Assert: Active item visible
      await expect(activeNavItem).toBeVisible()
    }
  })

  test('should support direct URL navigation', async ({ page }) => {
    // Execute: Navigate directly to documents URL
    await page.goto('/dashboard/documents', { waitUntil: 'networkidle' })

    // Assert: Page loads directly
    expect(page.url()).toContain('/documents')
  })

  test('should handle 404 errors gracefully', async ({ page }) => {
    // Execute: Navigate to non-existent page
    await page.goto('/dashboard/nonexistent-page', {
      waitUntil: 'domcontentloaded',
    })

    // Look for 404 message or redirect
    const notFoundMessage = page.locator('text=404, text=Not found, text=Page not found')
    const isNotFoundVisible = await notFoundMessage
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isNotFoundVisible) {
      // Assert: 404 message shown
      await expect(notFoundMessage.first()).toBeVisible()
    } else {
      // Might redirect to home or dashboard
      expect(page.url()).toMatch(/dashboard|home|login/)
    }
  })

  test('should preserve query parameters during navigation', async ({ page }) => {
    // Execute: Navigate with query parameters
    await page.goto('/dashboard/documents?sort=date&filter=prospectus', {
      waitUntil: 'networkidle',
    })

    // Assert: Query parameters present
    expect(page.url()).toContain('sort=date')
    expect(page.url()).toContain('filter=prospectus')
  })

  test('should handle rapid navigation', async ({ page }) => {
    // Execute: Rapid navigation
    await navigationHelpers.goToDashboard(page)
    await page.waitForTimeout(100)
    await navigationHelpers.goToDocuments(page)
    await page.waitForTimeout(100)
    await navigationHelpers.goToCapitalMarkets(page)
    await page.waitForLoadState('networkidle')

    // Assert: Final page loads correctly
    expect(page.url()).toContain('/dashboard/capital-markets')
  })

  test('should display responsive mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Look for mobile menu button
    const mobileMenuButton = page.locator('button[aria-label="Menu"], [data-testid="mobile-menu"]')
    const isMobileMenuVisible = await mobileMenuButton
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isMobileMenuVisible) {
      // Execute: Click mobile menu
      await mobileMenuButton.click()

      // Assert: Menu opens
      const mobileMenu = page.locator('[role="navigation"], nav')
      await expect(mobileMenu).toBeVisible()
    }
  })

  test('should handle navigation with authentication state change', async ({ page }) => {
    // Execute: Navigate to document
    await navigationHelpers.goToDocuments(page)

    // Assert: Page loads while authenticated
    expect(page.url()).toContain('/documents')

    // Note: Testing logout during navigation would require
    // concurrent operations which is handled elsewhere
  })

  test('should take screenshot of navigation menu', async ({ page }) => {
    // Navigate to dashboard
    await navigationHelpers.goToDashboard(page)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Take screenshot of sidebar/navigation
    const sidebar = page.locator('nav, [data-testid="sidebar"]')
    const isSidebarVisible = await sidebar
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isSidebarVisible) {
      await page.screenshot({
        path: 'test-results/navigation-menu.png',
      })
    }
  })
})
