/**
 * OAuth2 Test Utilities
 * =====================
 * Comprehensive testing utilities for OAuth2 authentication:
 * - Mock token generation and validation
 * - OAuth2 server simulation for testing
 * - Token inspection and verification helpers
 * - Test fixture generation
 * - Error scenario simulation
 *
 * Usage:
 *   import { createMockToken, MockOAuth2Server } from './oauth2-test-utils'
 *   const token = createMockToken({ expiresIn: 3600 })
 *   const server = new MockOAuth2Server()
 */

import type { OAuth2Token, OAuth2Credentials } from './oauth2-auth'

// ============================================================================
// Mock Token Generation
// ============================================================================

export interface MockTokenOptions {
  accessToken?: string
  tokenType?: string
  expiresIn?: number
  refreshToken?: string
  scope?: string
  obtainedAt?: number
}

/**
 * Create mock OAuth2 token for testing
 *
 * @param options Custom token options
 * @returns Mock OAuth2Token
 */
export function createMockToken(options: MockTokenOptions = {}): OAuth2Token {
  const now = Date.now()
  return {
    accessToken: options.accessToken || generateRandomToken(32),
    tokenType: options.tokenType || 'Bearer',
    expiresIn: options.expiresIn ?? 3600,
    refreshToken: options.refreshToken || generateRandomToken(64),
    scope: options.scope || 'filing.submit filing.status',
    obtainedAt: options.obtainedAt ?? now,
  }
}

/**
 * Create mock OAuth2 credentials for testing
 *
 * @param overrides Custom credential overrides
 * @returns Mock OAuth2Credentials
 */
export function createMockCredentials(overrides?: Partial<OAuth2Credentials>): OAuth2Credentials {
  return {
    clientId: 'test-client-id-12345',
    clientSecret: 'test-client-secret-67890',
    tokenUrl: 'https://sandbox-api.sedar.ca/v1/oauth/token',
    ...overrides,
  }
}

/**
 * Generate random token string for testing
 *
 * @param length Token length
 * @returns Random token string
 */
function generateRandomToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// ============================================================================
// Token Validation & Inspection
// ============================================================================

export interface TokenInspection {
  isValid: boolean
  isExpired: boolean
  expiresAt: number
  timeUntilExpiry: number
  age: number
  scope: string[]
}

/**
 * Inspect and validate OAuth2 token
 *
 * @param token Token to inspect
 * @param now Current timestamp for validation (default: Date.now())
 * @returns Token inspection result
 */
export function inspectToken(token: OAuth2Token, now: number = Date.now()): TokenInspection {
  const expiresAt = token.obtainedAt + token.expiresIn * 1000
  const timeUntilExpiry = expiresAt - now
  const age = now - token.obtainedAt
  const isExpired = timeUntilExpiry <= 0
  const isValid = !isExpired && token.accessToken.length > 0 && token.tokenType !== ''

  return {
    isValid,
    isExpired,
    expiresAt,
    timeUntilExpiry,
    age,
    scope: token.scope ? token.scope.split(' ') : [],
  }
}

/**
 * Check if token is valid (not expired)
 *
 * @param token Token to check
 * @param buffer Buffer time in seconds before expiry
 * @param now Current timestamp (default: Date.now())
 * @returns True if token is valid
 */
export function isTokenValid(token: OAuth2Token, buffer: number = 0, now: number = Date.now()): boolean {
  const expiresAt = token.obtainedAt + (token.expiresIn - buffer) * 1000
  return now < expiresAt
}

/**
 * Check if token will expire soon
 *
 * @param token Token to check
 * @param threshold Time threshold in seconds
 * @param now Current timestamp (default: Date.now())
 * @returns True if token expires within threshold
 */
export function isTokenExpiringSoon(token: OAuth2Token, threshold: number = 300, now: number = Date.now()): boolean {
  const expiresAt = token.obtainedAt + token.expiresIn * 1000
  const timeUntilExpiry = expiresAt - now
  return timeUntilExpiry > 0 && timeUntilExpiry < threshold * 1000
}

/**
 * Verify token has required scopes
 *
 * @param token Token to verify
 * @param requiredScopes Required scope strings
 * @returns True if all required scopes are present
 */
export function hasRequiredScopes(token: OAuth2Token, requiredScopes: string[]): boolean {
  if (!token.scope) {
    return false
  }

  const tokenScopes = new Set(token.scope.split(' '))
  return requiredScopes.every(scope => tokenScopes.has(scope))
}

/**
 * Get formatted token expiry information
 *
 * @param token Token to format
 * @param now Current timestamp (default: Date.now())
 * @returns Formatted expiry information
 */
export function formatTokenExpiry(token: OAuth2Token, now: number = Date.now()): string {
  const expiresAt = token.obtainedAt + token.expiresIn * 1000
  const secondsUntilExpiry = Math.floor((expiresAt - now) / 1000)

  if (secondsUntilExpiry <= 0) {
    return 'expired'
  }

  if (secondsUntilExpiry < 60) {
    return `${secondsUntilExpiry} seconds`
  }

  if (secondsUntilExpiry < 3600) {
    const minutes = Math.floor(secondsUntilExpiry / 60)
    return `${minutes} minute(s)`
  }

  const hours = Math.floor(secondsUntilExpiry / 3600)
  return `${hours} hour(s)`
}

// ============================================================================
// Mock OAuth2 Server
// ============================================================================

export interface MockServerResponse {
  statusCode: number
  body: string
  headers: Record<string, string>
}

export interface MockServerConfig {
  delay?: number
  shouldFail?: boolean
  failureCode?: string
  failureDescription?: string
  invalidToken?: boolean
  missingFields?: string[]
}

/**
 * Mock OAuth2 server for testing
 *
 * Simulates OAuth2 token endpoint behavior for unit testing
 */
export class MockOAuth2Server {
  private config: MockServerConfig = {}
  private requestLog: Array<{ url: string; body: string; timestamp: number }> = []
  private tokenCounter = 0

  /**
   * Configure mock server behavior
   *
   * @param config Configuration options
   */
  configure(config: MockServerConfig): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Reset server to default state
   */
  reset(): void {
    this.config = {}
    this.requestLog = []
    this.tokenCounter = 0
  }

  /**
   * Get mock token endpoint response
   *
   * @param credentials OAuth2 credentials (for validation)
   * @returns Mock server response
   */
  getTokenResponse(credentials?: OAuth2Credentials): MockServerResponse {
    // Apply delay if configured
    if (this.config.delay) {
      // In real scenario, delay would be applied asynchronously
      // For testing, just log it
    }

    // Validate credentials if provided
    if (credentials) {
      if (!credentials.clientId || !credentials.clientSecret) {
        return this.errorResponse('invalid_request', 'Missing client credentials')
      }
    }

    // Simulate failures
    if (this.config.shouldFail) {
      return this.errorResponse(this.config.failureCode || 'invalid_grant', this.config.failureDescription || 'Authentication failed')
    }

    // Generate token response
    return this.successResponse()
  }

  /**
   * Generate successful token response
   *
   * @returns Success response
   */
  private successResponse(): MockServerResponse {
    const token = createMockToken()
    const response: any = {
      access_token: this.config.invalidToken ? 'invalid_token_format' : token.accessToken,
      token_type: 'Bearer',
      expires_in: token.expiresIn,
      scope: 'filing.submit filing.status',
    }

    // Remove fields if configured to do so
    if (this.config.missingFields) {
      for (const field of this.config.missingFields) {
        delete response[field]
      }
    }

    if (token.refreshToken) {
      response.refresh_token = token.refreshToken
    }

    this.tokenCounter++

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    }
  }

  /**
   * Generate error response
   *
   * @param error Error code
   * @param description Error description
   * @returns Error response
   */
  private errorResponse(error: string, description: string): MockServerResponse {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error,
        error_description: description,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    }
  }

  /**
   * Simulate fetch request
   *
   * @param url Token endpoint URL
   * @param options Fetch options
   * @returns Mock response
   */
  async simulateFetch(url: string, options?: RequestInit): Promise<Response> {
    // Log request
    const body = options?.body as string || ''
    this.requestLog.push({
      url,
      body,
      timestamp: Date.now(),
    })

    // Apply configured delay
    if (this.config.delay) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay))
    }

    // Get response
    const response = this.getTokenResponse()

    // Create mock Response object
    return {
      ok: response.statusCode >= 200 && response.statusCode < 300,
      status: response.statusCode,
      statusText: response.statusCode === 200 ? 'OK' : 'Bad Request',
      headers: new Headers(response.headers),
      json: async () => JSON.parse(response.body),
      text: async () => response.body,
      blob: async () => new Blob([response.body]),
      clone: () => new Response(response.body),
      arrayBuffer: async () => new ArrayBuffer(0),
      formData: async () => new FormData(),
    } as unknown as Response
  }

  /**
   * Get request log
   *
   * @returns Array of logged requests
   */
  getRequestLog(): Array<{ url: string; body: string; timestamp: number }> {
    return this.requestLog
  }

  /**
   * Get token generation count
   *
   * @returns Number of tokens generated
   */
  getTokenCount(): number {
    return this.tokenCounter
  }

  /**
   * Extract credentials from request body
   *
   * @param body Request body (URLSearchParams format)
   * @returns Extracted credentials
   */
  static extractCredentials(body: string): { clientId?: string; clientSecret?: string } {
    const params = new URLSearchParams(body)
    return {
      clientId: params.get('client_id') || undefined,
      clientSecret: params.get('client_secret') || undefined,
    }
  }
}

// ============================================================================
// OAuth2 Error Scenarios
// ============================================================================

export interface ErrorScenario {
  name: string
  statusCode: number
  errorCode: string
  errorDescription: string
  isRetryable: boolean
}

/**
 * Common OAuth2 error scenarios for testing
 */
export const OAUTH2_ERROR_SCENARIOS: Record<string, ErrorScenario> = {
  INVALID_CLIENT: {
    name: 'Invalid Client',
    statusCode: 401,
    errorCode: 'invalid_client',
    errorDescription: 'Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method)',
    isRetryable: false,
  },
  INVALID_GRANT: {
    name: 'Invalid Grant',
    statusCode: 401,
    errorCode: 'invalid_grant',
    errorDescription: 'The provided authorization grant (e.g., authorization code, resource owner credentials) is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.',
    isRetryable: false,
  },
  INVALID_SCOPE: {
    name: 'Invalid Scope',
    statusCode: 400,
    errorCode: 'invalid_scope',
    errorDescription: 'The requested scope is invalid, unknown, malformed, or exceeds the scope granted by the resource owner.',
    isRetryable: false,
  },
  UNSUPPORTED_GRANT_TYPE: {
    name: 'Unsupported Grant Type',
    statusCode: 400,
    errorCode: 'unsupported_grant_type',
    errorDescription: 'The authorization grant type is not supported by the authorization server.',
    isRetryable: false,
  },
  RATE_LIMIT: {
    name: 'Rate Limited',
    statusCode: 429,
    errorCode: 'rate_limit_exceeded',
    errorDescription: 'Too many requests. Please try again later.',
    isRetryable: true,
  },
  SERVER_ERROR: {
    name: 'Server Error',
    statusCode: 500,
    errorCode: 'server_error',
    errorDescription: 'The authorization server encountered an unexpected condition that prevented it from fulfilling the request.',
    isRetryable: true,
  },
  TEMPORARILY_UNAVAILABLE: {
    name: 'Service Unavailable',
    statusCode: 503,
    errorCode: 'temporarily_unavailable',
    errorDescription: 'The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.',
    isRetryable: true,
  },
}

/**
 * Create server for specific error scenario
 *
 * @param scenarioKey Error scenario key
 * @returns Configured MockOAuth2Server
 */
export function createServerForErrorScenario(scenarioKey: keyof typeof OAUTH2_ERROR_SCENARIOS): MockOAuth2Server {
  const scenario = OAUTH2_ERROR_SCENARIOS[scenarioKey]
  const server = new MockOAuth2Server()
  server.configure({
    shouldFail: true,
    failureCode: scenario.errorCode,
    failureDescription: scenario.errorDescription,
  })
  return server
}

// ============================================================================
// Test Fixtures & Data Builders
// ============================================================================

export interface TokenTestFixture {
  token: OAuth2Token
  credentials: OAuth2Credentials
  inspection: TokenInspection
}

/**
 * Create complete test fixture with token and credentials
 *
 * @param options Custom options
 * @returns Test fixture
 */
export function createTokenTestFixture(options?: {
  tokenOptions?: MockTokenOptions
  credentialOverrides?: Partial<OAuth2Credentials>
}): TokenTestFixture {
  const token = createMockToken(options?.tokenOptions)
  const credentials = createMockCredentials(options?.credentialOverrides)
  const inspection = inspectToken(token)

  return {
    token,
    credentials,
    inspection,
  }
}

/**
 * Create array of test fixtures with varying expiry times
 *
 * @param count Number of fixtures to create
 * @returns Array of test fixtures
 */
export function createTokenTestFixtures(count: number): TokenTestFixture[] {
  const fixtures: TokenTestFixture[] = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const expiresIn = 300 + i * 3600 // Varying expiry times
    const fixture = createTokenTestFixture({
      tokenOptions: {
        expiresIn,
        obtainedAt: now - i * 100000, // Staggered creation times
      },
    })
    fixtures.push(fixture)
  }

  return fixtures
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert token has expected properties
 *
 * @param token Token to validate
 * @param expected Expected properties
 * @throws Error if validation fails
 */
export function assertTokenProperties(token: OAuth2Token, expected: Partial<OAuth2Token>): void {
  const errors: string[] = []

  if (expected.accessToken && token.accessToken !== expected.accessToken) {
    errors.push(`accessToken mismatch: expected "${expected.accessToken}", got "${token.accessToken}"`)
  }

  if (expected.tokenType && token.tokenType !== expected.tokenType) {
    errors.push(`tokenType mismatch: expected "${expected.tokenType}", got "${token.tokenType}"`)
  }

  if (expected.expiresIn && token.expiresIn !== expected.expiresIn) {
    errors.push(`expiresIn mismatch: expected ${expected.expiresIn}, got ${token.expiresIn}`)
  }

  if (errors.length > 0) {
    throw new Error(`Token validation failed:\n${errors.join('\n')}`)
  }
}

/**
 * Assert token is valid
 *
 * @param token Token to validate
 * @throws Error if token is invalid
 */
export function assertTokenIsValid(token: OAuth2Token): void {
  if (!token.accessToken || token.accessToken.length === 0) {
    throw new Error('Token accessToken is empty')
  }

  if (!token.tokenType || token.tokenType.length === 0) {
    throw new Error('Token tokenType is empty')
  }

  if (token.expiresIn <= 0) {
    throw new Error(`Token expiresIn must be positive: ${token.expiresIn}`)
  }

  if (token.obtainedAt <= 0) {
    throw new Error(`Token obtainedAt must be positive timestamp: ${token.obtainedAt}`)
  }
}

/**
 * Assert token is expired
 *
 * @param token Token to validate
 * @param now Current timestamp (default: Date.now())
 * @throws Error if token is not expired
 */
export function assertTokenIsExpired(token: OAuth2Token, now: number = Date.now()): void {
  const expiresAt = token.obtainedAt + token.expiresIn * 1000
  if (now < expiresAt) {
    throw new Error(`Token is not expired: expires in ${(expiresAt - now) / 1000} seconds`)
  }
}
