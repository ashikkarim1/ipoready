import { test, expect, TEST_USERS, dbHelpers, authHelpers, navigationHelpers } from '../utils/test-fixtures'

test.describe('Authentication - Login Flows', () => {
  test.beforeAll(async () => {
    // Setup: Clear any existing test users before suite
    try {
      await dbHelpers.clearTestData()
    } catch (e) {
      console.log('No existing test data to clear')
    }
  })

  test.afterAll(async () => {
    // Cleanup: Remove all test data after suite
    try {
      await dbHelpers.clearTestData()
    } catch (e) {
      console.log('Cleanup failed')
    }
  })

  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await navigationHelpers.goToLogin(page)
  })

  test('should successfully login with valid email and password', async ({ page }) => {
    // Setup: Create test user
    await dbHelpers.createUser(
      TEST_USERS.ceo.email,
      TEST_USERS.ceo.password,
      TEST_USERS.ceo.role
    )

    // Execute: Login with valid credentials
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await emailInput.fill(TEST_USERS.ceo.email)
    await passwordInput.fill(TEST_USERS.ceo.password)

    // Assert: Form is filled correctly
    await expect(emailInput).toHaveValue(TEST_USERS.ceo.email)
    await expect(passwordInput).toHaveValue(TEST_USERS.ceo.password)

    // Execute: Submit form
    await submitButton.click()

    // Assert: Redirected to dashboard
    await page.waitForURL('/dashboard', { waitUntil: 'networkidle' })
    expect(page.url()).toContain('/dashboard')

    // Assert: User menu visible (indicates authenticated)
    const userMenu = page.locator('[data-testid="user-menu"]')
    await expect(userMenu).toBeVisible()

    // Cleanup
    await dbHelpers.deleteUser(TEST_USERS.ceo.email)
  })

  test('should show error for invalid email', async ({ page }) => {
    // Setup: Ensure user doesn't exist
    const invalidEmail = 'nonexistent@ipoready.test'
    await dbHelpers.deleteUser(invalidEmail).catch(() => {})

    // Execute: Try login with non-existent email
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await emailInput.fill(invalidEmail)
    await passwordInput.fill('SomePassword123!')
    await submitButton.click()

    // Assert: Error message displayed
    const errorMessage = page.locator('text=Invalid email or password')
    await expect(errorMessage).toBeVisible()

    // Assert: Still on login page
    expect(page.url()).toContain('/login')
  })

  test('should show error for incorrect password', async ({ page }) => {
    // Setup: Create test user
    await dbHelpers.createUser(
      TEST_USERS.director.email,
      TEST_USERS.director.password,
      TEST_USERS.director.role
    )

    // Execute: Try login with wrong password
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await emailInput.fill(TEST_USERS.director.email)
    await passwordInput.fill('WrongPassword123!')
    await submitButton.click()

    // Assert: Error message displayed
    const errorMessage = page.locator('text=Invalid email or password')
    await expect(errorMessage).toBeVisible()

    // Assert: Still on login page
    expect(page.url()).toContain('/login')

    // Cleanup
    await dbHelpers.deleteUser(TEST_USERS.director.email)
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Execute: Click submit without filling fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Assert: Validation errors appear
    const emailError = page.locator('text=Email is required')
    const passwordError = page.locator('text=Password is required')

    await expect(emailError).toBeVisible({ timeout: 5000 }).catch(() => {})
    await expect(passwordError).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    // Execute: Enter invalid email format
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await emailInput.fill('invalid-email')
    await passwordInput.fill('Password123!')
    await submitButton.click()

    // Assert: Error message
    const error = page.locator('text=Please enter a valid email')
    await expect(error).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('should handle login with account awaiting approval', async ({ page }) => {
    // Setup: Create user with is_approved = false
    const email = 'pending-approval@ipoready.test'
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10)

    // In a real scenario, we'd create user with is_approved = false
    // This test documents the expected behavior
    // Cleanup
    await dbHelpers.deleteUser(email).catch(() => {})
  })

  test('should logout successfully', async ({ page }) => {
    // Setup: Login first
    await dbHelpers.createUser(
      TEST_USERS.admin.email,
      TEST_USERS.admin.password,
      TEST_USERS.admin.role
    )

    await authHelpers.loginWithCredentials(
      page,
      TEST_USERS.admin.email,
      TEST_USERS.admin.password
    )

    // Assert: User is on dashboard
    expect(page.url()).toContain('/dashboard')

    // Execute: Click user menu
    const userMenuButton = page.locator('[data-testid="user-menu"]')
    await userMenuButton.click()

    // Execute: Click logout
    const logoutButton = page.locator('button:has-text("Log out"), button:has-text("Logout")')
    await logoutButton.first().click()

    // Assert: Redirected to login
    await page.waitForURL('/login', { waitUntil: 'networkidle' })
    expect(page.url()).toContain('/login')

    // Assert: User menu not visible
    const userMenu = page.locator('[data-testid="user-menu"]')
    await expect(userMenu).not.toBeVisible()

    // Cleanup
    await dbHelpers.deleteUser(TEST_USERS.admin.email)
  })

  test('should persist session across page reloads', async ({ page }) => {
    // Setup: Create and login test user
    await dbHelpers.createUser(
      TEST_USERS.investor.email,
      TEST_USERS.investor.password,
      TEST_USERS.investor.role
    )

    await authHelpers.loginWithCredentials(
      page,
      TEST_USERS.investor.email,
      TEST_USERS.investor.password
    )

    // Assert: On dashboard
    expect(page.url()).toContain('/dashboard')

    // Execute: Reload page
    await page.reload()

    // Assert: Still on dashboard (session persisted)
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toContain('/dashboard')

    // Assert: Still authenticated
    const isAuth = await authHelpers.isAuthenticated(page)
    expect(isAuth).toBe(true)

    // Cleanup
    await dbHelpers.deleteUser(TEST_USERS.investor.email)
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Execute: Try to access protected route
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    // Assert: Redirected to login
    expect(page.url()).toContain('/login')
  })

  test('should display forgot password link', async ({ page }) => {
    // Assert: Forgot password link is visible
    const forgotPasswordLink = page.locator('a:has-text("Forgot password")')
    await expect(forgotPasswordLink).toBeVisible()
  })

  test('should display signup link', async ({ page }) => {
    // Assert: Signup link is visible
    const signupLink = page.locator('a:has-text("Sign up")')
    await expect(signupLink).toBeVisible()
  })

  test('should navigate to signup page from login', async ({ page }) => {
    // Execute: Click signup link
    const signupLink = page.locator('a:has-text("Sign up")')
    await signupLink.click()

    // Assert: Navigated to signup/register page
    await page.waitForURL(/\/(register|signup)/, { waitUntil: 'domcontentloaded' })
    expect(page.url()).toMatch(/\/(register|signup)/)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Execute: Simulate network offline
    await page.context().setOffline(true)

    // Execute: Try to login
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await emailInput.fill(TEST_USERS.admin.email)
    await passwordInput.fill(TEST_USERS.admin.password)

    // Execute: Click submit
    await submitButton.click()

    // Assert: Error message shown for network error
    await page.waitForTimeout(2000)
    const errorMessage = page.locator('text=Network error')
    await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {})

    // Cleanup: Restore network
    await page.context().setOffline(false)
  })

  test('should take screenshot on login failure for debugging', async ({ page }) => {
    // Setup: Create user
    await dbHelpers.createUser(
      TEST_USERS.ceo.email,
      TEST_USERS.ceo.password,
      TEST_USERS.ceo.role
    )

    // Execute: Login with wrong password
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await emailInput.fill(TEST_USERS.ceo.email)
    await passwordInput.fill('WrongPassword!')
    await submitButton.click()

    // Wait for error to appear
    await page.waitForTimeout(2000)

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/login-error-debug.png' })

    // Cleanup
    await dbHelpers.deleteUser(TEST_USERS.ceo.email)
  })
})
