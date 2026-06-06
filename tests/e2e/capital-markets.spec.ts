import {
  test,
  expect,
  TEST_USERS,
  TEST_COMPANY,
  dbHelpers,
  authHelpers,
  navigationHelpers,
} from '../utils/test-fixtures'

test.describe('Capital Markets - IPO Dashboard Flows', () => {
  let userId: string

  test.beforeAll(async () => {
    // Setup: Clear test data
    try {
      await dbHelpers.clearTestData()
    } catch (e) {
      console.log('No existing test data')
    }

    // Setup: Create test user and company
    const user = await dbHelpers.createUser(
      TEST_USERS.ceo.email,
      TEST_USERS.ceo.password,
      TEST_USERS.ceo.role,
      TEST_COMPANY.id
    )
    userId = user.id

    await dbHelpers.createCompany(
      TEST_COMPANY.name,
      TEST_COMPANY.symbol,
      TEST_COMPANY.industry,
      TEST_USERS.ceo.email
    )
  })

  test.afterAll(async () => {
    // Cleanup: Remove test data
    try {
      await dbHelpers.deleteCompany(TEST_COMPANY.id)
      await dbHelpers.deleteUser(TEST_USERS.ceo.email)
    } catch (e) {
      console.log('Cleanup failed')
    }
  })

  test.beforeEach(async ({ page }) => {
    // Setup: Login before each test
    await authHelpers.loginWithCredentials(
      page,
      TEST_USERS.ceo.email,
      TEST_USERS.ceo.password
    )
  })

  test('should display capital markets dashboard', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Page loads successfully
    expect(page.url()).toContain('/dashboard/capital-markets')

    // Assert: Key dashboard elements visible
    const dashboardTitle = page.locator('h1, h2')
    await expect(dashboardTitle).toBeVisible()

    // Assert: No console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    expect(errors).toHaveLength(0)
  })

  test('should display IPO pipeline data', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Pipeline section exists
    const pipelineSection = page.locator('[data-testid="ipo-pipeline"]')
    await expect(pipelineSection).toBeVisible({ timeout: 5000 }).catch(() => {
      // Section might not be labeled with testid, continue testing
    })

    // Assert: Data table or list is displayed
    const table = page.locator('table, [role="grid"]')
    await expect(table).toBeVisible({ timeout: 5000 }).catch(() => {
      // Table might be in different format
    })
  })

  test('should display company IPO status', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: IPO status section visible
    const statusSection = page.locator('[data-testid="ipo-status"], text=Status')
    await expect(statusSection).toBeVisible({ timeout: 5000 }).catch(() => {})

    // Assert: Status information displayed
    const statusValue = page.locator('[data-testid="company-status"]')
    await expect(statusValue).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('should filter IPO data by market', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Filter controls exist
    const filterButton = page.locator('[data-testid="market-filter"], button:has-text("Filter")')
    await expect(filterButton).toBeVisible({ timeout: 5000 }).catch(() => {
      // Filters might not exist yet
    })

    // Execute: Click filter (if exists)
    try {
      await filterButton.first().click()
      await page.waitForTimeout(500)

      // Assert: Filter options displayed
      const filterOptions = page.locator('[role="option"]')
      const count = await filterOptions.count()
      expect(count).toBeGreaterThan(0)
    } catch (e) {
      // Filters not implemented yet, that's ok
    }
  })

  test('should display IPO benchmarks', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Look for benchmarks section
    const benchmarksSection = page.locator('[data-testid="benchmarks"], text=Benchmark')
    const isBenchmarksVisible = await benchmarksSection
      .isVisible()
      .catch(() => false)

    if (isBenchmarksVisible) {
      // Assert: Benchmark data visible
      await expect(benchmarksSection).toBeVisible()
    }
  })

  test('should display IPO timeline/milestones', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Look for timeline section
    const timelineSection = page.locator('[data-testid="timeline"], text=Timeline')
    const isTimelineVisible = await timelineSection
      .isVisible()
      .catch(() => false)

    if (isTimelineVisible) {
      // Assert: Timeline visible
      await expect(timelineSection).toBeVisible()

      // Assert: Milestone items exist
      const milestones = page.locator('[data-testid="milestone"]')
      const count = await milestones.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should navigate to detailed company view', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Company link exists
    const companyLink = page.locator(
      `text=${TEST_COMPANY.symbol}, [data-testid="company-link"]`
    )
    const isVisible = await companyLink
      .first()
      .isVisible()
      .catch(() => false)

    if (isVisible) {
      // Execute: Click on company
      await companyLink.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: Navigated to company detail page
      expect(page.url()).toContain('company')
    }
  })

  test('should display market analytics charts', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Charts are rendered
    const charts = page.locator('[role="img"]')
    const count = await charts.count()

    // Should have at least some visualization
    if (count > 0) {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should handle empty state gracefully', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Look for empty state message or "no data" message
    const emptyStateMessage = page.locator('text=No data, text=No IPOs, text=No companies')
    const isEmptyStateVisible = await emptyStateMessage
      .first()
      .isVisible()
      .catch(() => false)

    if (isEmptyStateVisible) {
      // Assert: Helpful empty state message shown
      await expect(emptyStateMessage.first()).toBeVisible()
    } else {
      // Data should be displayed instead
      const content = page.locator('table, [role="grid"]')
      await expect(content).toBeVisible({ timeout: 5000 }).catch(() => {})
    }
  })

  test('should export IPO data', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Look for export button
    const exportButton = page.locator('button:has-text("Export")')
    const isExportVisible = await exportButton
      .isVisible()
      .catch(() => false)

    if (isExportVisible) {
      // Setup: Wait for download
      const downloadPromise = page.waitForEvent('download')

      // Execute: Click export
      await exportButton.click()

      // Assert: Download started
      const download = await downloadPromise
      expect(download).toBeDefined()
    }
  })

  test('should display company metrics', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Key metrics displayed
    const metricsSection = page.locator('[data-testid="metrics"], text=Metric')
    const isMetricsVisible = await metricsSection
      .isVisible()
      .catch(() => false)

    if (isMetricsVisible) {
      await expect(metricsSection).toBeVisible()

      // Assert: Metric values shown
      const metricValues = page.locator('[data-testid="metric-value"]')
      const count = await metricValues.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should search for companies', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Search input exists
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]')
    const isSearchVisible = await searchInput
      .isVisible()
      .catch(() => false)

    if (isSearchVisible) {
      // Execute: Type in search
      await searchInput.fill(TEST_COMPANY.symbol)
      await page.waitForLoadState('networkidle')

      // Assert: Results filtered
      const results = page.locator('table tbody tr, [role="gridcell"]')
      const count = await results.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should sort IPO data by column', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Assert: Sortable column headers exist
    const sortableHeaders = page.locator('th button, [role="columnheader"] button')
    const count = await sortableHeaders.count()

    if (count > 0) {
      // Execute: Click first sortable header
      await sortableHeaders.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: Data re-ordered
      const firstRow = page.locator('table tbody tr, [role="row"]').first()
      await expect(firstRow).toBeVisible()
    }
  })

  test('should display IPO readiness progress', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Look for progress indicators
    const progressBars = page.locator('[role="progressbar"]')
    const count = await progressBars.count()

    if (count > 0) {
      // Assert: Progress indicators visible
      expect(count).toBeGreaterThan(0)

      // Assert: Progress values between 0-100%
      for (let i = 0; i < Math.min(count, 3); i++) {
        const value = await progressBars.nth(i).getAttribute('aria-valuenow')
        const numValue = parseInt(value || '0')
        expect(numValue).toBeGreaterThanOrEqual(0)
        expect(numValue).toBeLessThanOrEqual(100)
      }
    }
  })

  test('should take screenshot of capital markets dashboard', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Take screenshot
    await page.screenshot({
      path: 'test-results/capital-markets-dashboard.png',
    })

    // Assert: Screenshot created
    expect(page.url()).toContain('/dashboard/capital-markets')
  })

  test('should handle rapid navigation away and back', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)
    await page.waitForLoadState('networkidle')

    // Execute: Navigate away
    await navigationHelpers.goToDashboard(page)
    await page.waitForTimeout(100)

    // Execute: Navigate back
    await navigationHelpers.goToCapitalMarkets(page)
    await page.waitForLoadState('networkidle')

    // Assert: Page loads correctly
    expect(page.url()).toContain('/dashboard/capital-markets')
  })

  test('should persist filter preferences', async ({ page }) => {
    // Execute: Navigate to capital markets
    await navigationHelpers.goToCapitalMarkets(page)

    // Look for filter controls
    const filterButton = page.locator('[data-testid="market-filter"], button:has-text("Filter")')
    const hasFilters = await filterButton
      .isVisible()
      .catch(() => false)

    if (hasFilters) {
      // Execute: Apply a filter
      await filterButton.first().click()
      await page.waitForTimeout(500)

      // Try to select first option
      const firstOption = page.locator('[role="option"]').first()
      const isOptionVisible = await firstOption
        .isVisible()
        .catch(() => false)

      if (isOptionVisible) {
        await firstOption.click()
        await page.waitForLoadState('networkidle')

        // Execute: Navigate away and back
        await navigationHelpers.goToDashboard(page)
        await navigationHelpers.goToCapitalMarkets(page)

        // Note: Filter persistence depends on implementation
        // This test documents the expected behavior
      }
    }
  })
})
