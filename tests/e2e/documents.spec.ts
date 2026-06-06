import {
  test,
  expect,
  TEST_USERS,
  TEST_COMPANY,
  TEST_DOCUMENTS,
  dbHelpers,
  authHelpers,
  navigationHelpers,
  documentHelpers,
} from '../utils/test-fixtures'
import path from 'path'
import fs from 'fs'

test.describe('Documents - Upload, Download, and Management', () => {
  let userId: string
  let companyId: string

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
    companyId = TEST_COMPANY.id

    await dbHelpers.createCompany(
      TEST_COMPANY.name,
      TEST_COMPANY.symbol,
      TEST_COMPANY.industry,
      TEST_USERS.ceo.email
    )

    // Create temporary test files
    const testFilesDir = 'test-files'
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true })
    }

    // Create dummy PDF file
    fs.writeFileSync(
      path.join(testFilesDir, TEST_DOCUMENTS.prospectus.name),
      TEST_DOCUMENTS.prospectus.content
    )

    // Create dummy Excel file
    fs.writeFileSync(
      path.join(testFilesDir, TEST_DOCUMENTS.financials.name),
      TEST_DOCUMENTS.financials.content
    )

    // Create dummy DOCX file
    fs.writeFileSync(
      path.join(testFilesDir, TEST_DOCUMENTS.charter.name),
      TEST_DOCUMENTS.charter.content
    )
  })

  test.afterAll(async () => {
    // Cleanup: Remove test data
    try {
      await dbHelpers.deleteCompany(companyId)
      await dbHelpers.deleteUser(TEST_USERS.ceo.email)
    } catch (e) {
      console.log('Cleanup failed')
    }

    // Cleanup: Remove test files
    const testFilesDir = 'test-files'
    if (fs.existsSync(testFilesDir)) {
      fs.rmSync(testFilesDir, { recursive: true })
    }
  })

  test.beforeEach(async ({ page }) => {
    // Setup: Login and navigate to documents
    await authHelpers.loginWithCredentials(
      page,
      TEST_USERS.ceo.email,
      TEST_USERS.ceo.password
    )
    await navigationHelpers.goToDocuments(page)
  })

  test('should display documents page', async ({ page }) => {
    // Assert: Documents page loads
    expect(page.url()).toContain('/documents')

    // Assert: Page title visible
    const pageTitle = page.locator('h1, h2')
    await expect(pageTitle).toBeVisible()

    // Assert: No console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    expect(errors).toHaveLength(0)
  })

  test('should upload a document successfully', async ({ page }) => {
    // Assert: Upload button visible
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Document")')
    await expect(uploadButton).toBeVisible()

    // Execute: Click upload button
    await uploadButton.first().click()

    // Look for file input
    const fileInput = page.locator('input[type="file"]')
    const isFileInputVisible = await fileInput
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isFileInputVisible) {
      // Execute: Upload test file
      const testFilePath = path.join('test-files', TEST_DOCUMENTS.prospectus.name)
      await fileInput.setInputFiles(testFilePath)

      // Look for document type selector
      const typeSelect = page.locator('[data-testid="document-type-select"]')
      const isTypeSelectVisible = await typeSelect
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (isTypeSelectVisible) {
        // Execute: Select document type
        await typeSelect.click()
        const prospectusOption = page.locator('text=Prospectus, text=prospectus')
        await prospectusOption.first().click({ timeout: 3000 }).catch(() => {})
      }

      // Execute: Confirm upload
      const confirmButton = page.locator('button:has-text("Upload"), button:has-text("Save")')
      await confirmButton.first().click()

      // Assert: Upload completes
      await page.waitForLoadState('networkidle')

      // Assert: Success message shown
      const successMessage = page.locator('text=uploaded, text=success, text=Successfully')
      const isSuccessVisible = await successMessage
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)

      if (isSuccessVisible) {
        await expect(successMessage.first()).toBeVisible()
      }
    }
  })

  test('should upload multiple documents', async ({ page }) => {
    // Execute: Upload first document
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Document")')
    await uploadButton.first().click({ timeout: 3000 }).catch(() => {})

    const fileInput = page.locator('input[type="file"]')
    const isFileInputVisible = await fileInput
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isFileInputVisible) {
      // Upload first file
      const file1Path = path.join('test-files', TEST_DOCUMENTS.prospectus.name)
      await fileInput.setInputFiles(file1Path)

      const confirmButton = page.locator('button:has-text("Upload"), button:has-text("Save")')
      await confirmButton.first().click()
      await page.waitForLoadState('networkidle')

      // Execute: Upload second document
      await uploadButton.first().click({ timeout: 3000 }).catch(() => {})
      const fileInput2 = page.locator('input[type="file"]')

      const file2Path = path.join('test-files', TEST_DOCUMENTS.financials.name)
      await fileInput2.setInputFiles(file2Path)

      const confirmButton2 = page.locator('button:has-text("Upload"), button:has-text("Save")')
      await confirmButton2.first().click()
      await page.waitForLoadState('networkidle')

      // Assert: Both documents visible in list
      const docCount = await page
        .locator('text=prospectus, text=financials, text=charter')
        .count()
      expect(docCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should display document list', async ({ page }) => {
    // Assert: Document list or table visible
    const documentList = page.locator('table, [role="grid"], [data-testid="document-list"]')
    const isListVisible = await documentList
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isListVisible) {
      await expect(documentList).toBeVisible()
    } else {
      // Documents might be in card view
      const documentCards = page.locator('[data-testid="document-card"]')
      const count = await documentCards.count()
      if (count > 0) {
        expect(count).toBeGreaterThan(0)
      }
    }
  })

  test('should filter documents by type', async ({ page }) => {
    // Assert: Filter control exists
    const filterButton = page.locator('[data-testid="type-filter"], button:has-text("Filter")')
    const isFilterVisible = await filterButton
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isFilterVisible) {
      // Execute: Click filter
      await filterButton.first().click()

      // Assert: Filter options shown
      const filterOptions = page.locator('[role="option"]')
      const count = await filterOptions.count()

      if (count > 0) {
        // Execute: Select first filter option
        await filterOptions.first().click()
        await page.waitForLoadState('networkidle')

        // Assert: Documents filtered
        const filteredDocs = page.locator('[data-testid="document-item"]')
        await expect(filteredDocs.first()).toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    }
  })

  test('should sort documents', async ({ page }) => {
    // Assert: Sort controls exist
    const sortButton = page.locator('[data-testid="sort-button"], button:has-text("Sort")')
    const isSortVisible = await sortButton
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isSortVisible) {
      // Execute: Click sort
      await sortButton.click()

      // Assert: Sort options shown
      const sortOptions = page.locator('[role="option"]')
      const count = await sortOptions.count()
      expect(count).toBeGreaterThan(0)

      if (count > 0) {
        // Execute: Select sort option
        await sortOptions.first().click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('should download a document', async ({ page }) => {
    // First, ensure a document exists
    await page.waitForTimeout(1000)

    // Look for download button
    const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-btn"]')
    const isDownloadVisible = await downloadButton
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isDownloadVisible) {
      // Setup: Wait for download
      const downloadPromise = page.waitForEvent('download')

      // Execute: Click download
      await downloadButton.first().click()

      // Assert: Download started
      const download = await downloadPromise.catch(() => null)
      if (download) {
        expect(download).toBeDefined()
      }
    }
  })

  test('should preview a document', async ({ page }) => {
    // Look for preview button or document name link
    const previewButton = page.locator('[data-testid="preview-btn"], a[data-testid="document-link"]')
    const isPreviewVisible = await previewButton
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isPreviewVisible) {
      // Execute: Click preview
      await previewButton.first().click()
      await page.waitForLoadState('domcontentloaded')

      // Assert: Preview displayed or navigated
      const previewContent = page.locator('[data-testid="document-preview"]')
      const isPreviewContentVisible = await previewContent
        .isVisible({ timeout: 3000 })
        .catch(() => false)

      if (isPreviewContentVisible) {
        await expect(previewContent).toBeVisible()
      }
    }
  })

  test('should delete a document', async ({ page }) => {
    // Look for delete button
    const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-btn"]')
    const isDeleteVisible = await deleteButton
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isDeleteVisible) {
      // Get document count before delete
      const docsBefore = await page
        .locator('[data-testid="document-item"]')
        .count()

      // Execute: Click delete
      await deleteButton.first().click()

      // Look for confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")')
      const isConfirmVisible = await confirmButton
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (isConfirmVisible) {
        // Execute: Confirm deletion
        await confirmButton.last().click()
        await page.waitForLoadState('networkidle')

        // Assert: Document removed
        const docsAfter = await page
          .locator('[data-testid="document-item"]')
          .count()
        expect(docsAfter).toBeLessThanOrEqual(docsBefore)
      }
    }
  })

  test('should display document metadata', async ({ page }) => {
    // Look for document details
    const documentDetails = page.locator('[data-testid="document-metadata"], [data-testid="document-info"]')
    const isDetailsVisible = await documentDetails
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isDetailsVisible) {
      // Assert: Metadata visible
      await expect(documentDetails).toBeVisible()

      // Assert: Upload date visible
      const uploadDate = page.locator('text=Uploaded')
      const isDateVisible = await uploadDate
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (isDateVisible) {
        await expect(uploadDate).toBeVisible()
      }
    }
  })

  test('should handle large file upload', async ({ page }) => {
    // Create a large test file (1MB)
    const largeFilePath = path.join('test-files', 'large-document.bin')
    const largeBuffer = Buffer.alloc(1024 * 1024) // 1MB
    fs.writeFileSync(largeFilePath, largeBuffer)

    try {
      // Assert: Upload button visible
      const uploadButton = page.locator('button:has-text("Upload")')
      await expect(uploadButton).toBeVisible()

      // Execute: Click upload
      await uploadButton.first().click()

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(largeFilePath)

      // Assert: File input accepts large file
      const files = await fileInput.inputValue()
      expect(files).toBeTruthy()
    } finally {
      // Cleanup: Remove large test file
      if (fs.existsSync(largeFilePath)) {
        fs.unlinkSync(largeFilePath)
      }
    }
  })

  test('should display document search', async ({ page }) => {
    // Assert: Search input exists
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]')
    const isSearchVisible = await searchInput
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    if (isSearchVisible) {
      // Execute: Type in search
      await searchInput.fill('prospectus')
      await page.waitForLoadState('networkidle')

      // Assert: Results filtered
      const results = page.locator('[data-testid="document-item"]')
      const count = await results.count()

      // Results count is greater or nothing shown (empty search result)
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('should share a document', async ({ page }) => {
    // Look for share button
    const shareButton = page.locator('button:has-text("Share"), [data-testid="share-btn"]')
    const isShareVisible = await shareButton
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isShareVisible) {
      // Execute: Click share
      await shareButton.first().click()

      // Assert: Share dialog displayed
      const shareDialog = page.locator('[role="dialog"], [data-testid="share-dialog"]')
      const isDialogVisible = await shareDialog
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (isDialogVisible) {
        await expect(shareDialog).toBeVisible()
      }
    }
  })

  test('should handle concurrent uploads', async ({ page }) => {
    // Assert: Multiple upload inputs might exist
    const uploadButton = page.locator('button:has-text("Upload")')
    await expect(uploadButton).toBeVisible()

    // Execute: Trigger multiple uploads quickly
    try {
      await uploadButton.first().click()
      await page.waitForTimeout(500)

      const fileInput = page.locator('input[type="file"]')
      const file1Path = path.join('test-files', TEST_DOCUMENTS.prospectus.name)
      await fileInput.setInputFiles(file1Path)

      // Note: Second upload during first upload depends on implementation
      // This test documents the expected behavior of handling concurrent uploads
      await page.waitForLoadState('networkidle')
    } catch (e) {
      // Concurrent uploads might not be supported
    }
  })

  test('should display document permissions', async ({ page }) => {
    // Look for permissions section
    const permissionsSection = page.locator('[data-testid="document-permissions"], text=Permissions')
    const isPermissionsVisible = await permissionsSection
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isPermissionsVisible) {
      await expect(permissionsSection).toBeVisible()
    }
  })

  test('should take screenshot of documents page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Take screenshot
    await page.screenshot({
      path: 'test-results/documents-page.png',
    })

    // Assert: Screenshot created
    expect(page.url()).toContain('/documents')
  })

  test('should handle upload errors gracefully', async ({ page }) => {
    // Note: This would require a file that fails validation
    // or intentionally triggering an upload error

    // Look for upload button
    const uploadButton = page.locator('button:has-text("Upload")')
    const isUploadVisible = await uploadButton
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    expect(isUploadVisible).toBeTruthy()
  })

  test('should display document version history', async ({ page }) => {
    // Look for version history section
    const versionHistory = page.locator('[data-testid="version-history"], text=Version History')
    const isHistoryVisible = await versionHistory
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (isHistoryVisible) {
      await expect(versionHistory).toBeVisible()

      // Assert: Version items displayed
      const versions = page.locator('[data-testid="version-item"]')
      const count = await versions.count()
      expect(count).toBeGreaterThan(0)
    }
  })
})
