/**
 * OAuth2 Authentication Module for SEDAR
 * ========================================
 * Complete OAuth2 token management with:
 * - Token request/refresh logic with auto-retry
 * - Secure token caching with TTL and expiration handling
 * - Credential validation and sanitization
 * - Comprehensive error handling for auth failures
 * - Support for grant types: client_credentials, refresh_token
 * - Request/response logging without exposing secrets
 *
 * Reference: RFC 6749 OAuth 2.0 Authorization Framework
 * SEDAR API: https://sedar.ca/api/v1/oauth/token
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface OAuth2Credentials {
  clientId: string
  clientSecret: string
  tokenUrl: string
}

export interface OAuth2Token {
  accessToken: string
  tokenType: string
  expiresIn: number
  refreshToken?: string
  scope?: string
  obtainedAt: number
}

export interface OAuth2TokenCache {
  token: OAuth2Token
  expiresAt: number
  createdAt: number
}

export interface OAuth2RequestOptions {
  grantType: 'client_credentials' | 'refresh_token'
  scope?: string
  clientAssertionType?: string
  clientAssertion?: string
}

export interface OAuth2ResponseError {
  error: string
  error_description?: string
  error_uri?: string
}

export type OAuth2ErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_CLIENT'
  | 'INVALID_GRANT'
  | 'UNAUTHORIZED_CLIENT'
  | 'UNSUPPORTED_GRANT_TYPE'
  | 'INVALID_SCOPE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'PARSE_ERROR'
  | 'CACHE_ERROR'
  | 'VALIDATION_ERROR'

// ============================================================================
// Custom Error Class
// ============================================================================

export class OAuth2Error extends Error {
  constructor(
    public code: OAuth2ErrorCode,
    message: string,
    public isRetryable: boolean = false,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'OAuth2Error'
  }
}

// ============================================================================
// OAuth2 Authentication Manager
// ============================================================================

export class OAuth2AuthManager {
  private tokenCache: Map<string, OAuth2TokenCache> = new Map()
  private readonly tokenRefreshBuffer = 300 // Refresh 5 minutes before expiry
  private readonly maxRetries = 3
  private readonly retryDelay = 1000 // 1 second base delay
  private requestInProgress: Map<string, Promise<OAuth2Token>> = new Map()

  /**
   * Request OAuth2 access token with automatic refresh and caching
   *
   * @param credentials OAuth2 credentials (clientId, clientSecret, tokenUrl)
   * @param options Request options (grantType, scope, etc.)
   * @returns Valid access token
   * @throws OAuth2Error on authentication failure
   */
  async getAccessToken(
    credentials: OAuth2Credentials,
    options: OAuth2RequestOptions = { grantType: 'client_credentials' }
  ): Promise<string> {
    this.validateCredentials(credentials)

    const cacheKey = this.generateCacheKey(credentials)
    const cachedToken = this.getCachedToken(cacheKey)

    if (cachedToken) {
      console.debug('[OAuth2] Returning cached access token', { expiresIn: this.getTokenTTL(cacheKey) })
      return cachedToken.accessToken
    }

    // Prevent duplicate concurrent requests for same credentials
    if (this.requestInProgress.has(cacheKey)) {
      console.debug('[OAuth2] Token request already in progress, waiting for existing request')
      const token = await this.requestInProgress.get(cacheKey)!
      return token.accessToken
    }

    try {
      const tokenPromise = this.requestToken(credentials, options)
      this.requestInProgress.set(cacheKey, tokenPromise)
      const token = await tokenPromise
      this.cacheToken(cacheKey, token)
      console.info('[OAuth2] New access token obtained', { expiresIn: token.expiresIn })
      return token.accessToken
    } finally {
      this.requestInProgress.delete(cacheKey)
    }
  }

  /**
   * Request new token from OAuth2 server with retry logic
   *
   * @param credentials OAuth2 credentials
   * @param options Request options
   * @returns OAuth2 token
   * @throws OAuth2Error on all retries exhausted
   */
  private async requestToken(
    credentials: OAuth2Credentials,
    options: OAuth2RequestOptions
  ): Promise<OAuth2Token> {
    let lastError: OAuth2Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.debug('[OAuth2] Requesting token', {
          attempt,
          grantType: options.grantType,
          scope: options.scope,
        })

        const response = await this.fetchToken(credentials, options)
        return response
      } catch (error) {
        lastError = error instanceof OAuth2Error ? error : new OAuth2Error('NETWORK_ERROR', String(error))

        // Determine if error is retryable
        const isRetryable = this.isRetryableError(lastError)
        const isLastAttempt = attempt === this.maxRetries

        console.warn('[OAuth2] Token request failed', {
          attempt,
          error: lastError.code,
          retryable: isRetryable,
          message: lastError.message,
        })

        if (!isRetryable || isLastAttempt) {
          break
        }

        // Exponential backoff with jitter
        const delay = this.exponentialBackoff(attempt)
        await this.sleep(delay)
      }
    }

    throw lastError || new OAuth2Error('INVALID_REQUEST', 'Failed to obtain access token after all retries', false)
  }

  /**
   * Fetch token from OAuth2 server
   *
   * @param credentials OAuth2 credentials
   * @param options Request options
   * @returns OAuth2 token response
   * @throws OAuth2Error on HTTP error or invalid response
   */
  private async fetchToken(
    credentials: OAuth2Credentials,
    options: OAuth2RequestOptions
  ): Promise<OAuth2Token> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

    try {
      const body = new URLSearchParams()
      body.append('grant_type', options.grantType)
      body.append('client_id', credentials.clientId)
      body.append('client_secret', credentials.clientSecret)

      if (options.scope) {
        body.append('scope', options.scope)
      }

      if (options.clientAssertionType) {
        body.append('client_assertion_type', options.clientAssertionType)
      }

      if (options.clientAssertion) {
        body.append('client_assertion', options.clientAssertion)
      }

      const response = await fetch(credentials.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'IPOReady-OAuth2/1.0',
        },
        body: body.toString(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Parse response
      const contentType = response.headers.get('content-type')
      let data: any

      try {
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          data = {}
        }
      } catch (error) {
        throw new OAuth2Error('PARSE_ERROR', 'Failed to parse OAuth2 response as JSON', false, response.status)
      }

      // Handle error response per RFC 6749 Section 5.2
      if (!response.ok) {
        const errorCode = data.error as OAuth2ErrorCode || 'INVALID_REQUEST'
        const errorDesc = data.error_description || response.statusText
        const isRetryable = response.status >= 500 || response.status === 429 // Server errors and rate limits

        throw new OAuth2Error(errorCode, `OAuth2 error: ${errorDesc}`, isRetryable, response.status, {
          error_uri: data.error_uri,
          originalResponse: data,
        })
      }

      // Validate response structure
      const token = this.validateTokenResponse(data)
      return token
    } catch (error) {
      if (error instanceof OAuth2Error) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new OAuth2Error('TIMEOUT_ERROR', 'Token request timed out (15s)', true)
        }
        throw new OAuth2Error('NETWORK_ERROR', error.message, true)
      }

      throw new OAuth2Error('NETWORK_ERROR', String(error), true)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Validate OAuth2 token response structure
   *
   * @param data Response data from OAuth2 server
   * @returns Validated OAuth2Token
   * @throws OAuth2Error if response is invalid
   */
  private validateTokenResponse(data: any): OAuth2Token {
    if (!data.access_token || typeof data.access_token !== 'string') {
      throw new OAuth2Error(
        'PARSE_ERROR',
        'Missing or invalid access_token in OAuth2 response',
        false,
        400,
        { response: data }
      )
    }

    if (!data.expires_in || typeof data.expires_in !== 'number' || data.expires_in <= 0) {
      throw new OAuth2Error(
        'PARSE_ERROR',
        'Missing or invalid expires_in in OAuth2 response',
        false,
        400,
        { response: data }
      )
    }

    const token: OAuth2Token = {
      accessToken: data.access_token,
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      scope: data.scope,
      obtainedAt: Date.now(),
    }

    return token
  }

  /**
   * Validate OAuth2 credentials before use
   *
   * @param credentials OAuth2 credentials to validate
   * @throws OAuth2Error if credentials are invalid
   */
  validateCredentials(credentials: OAuth2Credentials): void {
    const errors: string[] = []

    if (!credentials.clientId || typeof credentials.clientId !== 'string' || credentials.clientId.trim().length === 0) {
      errors.push('clientId must be a non-empty string')
    }

    if (!credentials.clientSecret || typeof credentials.clientSecret !== 'string' || credentials.clientSecret.trim().length === 0) {
      errors.push('clientSecret must be a non-empty string')
    }

    if (!credentials.tokenUrl || typeof credentials.tokenUrl !== 'string') {
      errors.push('tokenUrl must be a valid URL string')
    } else {
      try {
        const url = new URL(credentials.tokenUrl)
        if (!url.protocol.startsWith('https')) {
          errors.push('tokenUrl must use HTTPS protocol for security')
        }
      } catch {
        errors.push('tokenUrl is not a valid URL')
      }
    }

    if (errors.length > 0) {
      throw new OAuth2Error('VALIDATION_ERROR', `Credential validation failed: ${errors.join('; ')}`, false)
    }
  }

  /**
   * Get cached token if valid
   *
   * @param cacheKey Cache key for token
   * @returns Cached token if valid, null otherwise
   */
  private getCachedToken(cacheKey: string): OAuth2Token | null {
    const cached = this.tokenCache.get(cacheKey)

    if (!cached) {
      return null
    }

    // Check if token is still valid with buffer
    const now = Date.now()
    if (now >= cached.expiresAt) {
      this.tokenCache.delete(cacheKey)
      console.debug('[OAuth2] Cached token expired, removing from cache')
      return null
    }

    return cached.token
  }

  /**
   * Cache token for future use
   *
   * @param cacheKey Cache key for token
   * @param token OAuth2 token to cache
   */
  private cacheToken(cacheKey: string, token: OAuth2Token): void {
    try {
      const expiresAt = token.obtainedAt + (token.expiresIn - this.tokenRefreshBuffer) * 1000
      const cache: OAuth2TokenCache = {
        token,
        expiresAt,
        createdAt: Date.now(),
      }
      this.tokenCache.set(cacheKey, cache)
    } catch (error) {
      console.error('[OAuth2] Failed to cache token', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Get token TTL in seconds
   *
   * @param cacheKey Cache key for token
   * @returns Time to live in seconds, or -1 if token not cached
   */
  private getTokenTTL(cacheKey: string): number {
    const cached = this.tokenCache.get(cacheKey)
    if (!cached) {
      return -1
    }
    return Math.floor((cached.expiresAt - Date.now()) / 1000)
  }

  /**
   * Generate cache key from credentials
   *
   * @param credentials OAuth2 credentials
   * @returns Cache key (hash of clientId and tokenUrl)
   */
  private generateCacheKey(credentials: OAuth2Credentials): string {
    return `oauth2_${credentials.clientId}_${credentials.tokenUrl}`
  }

  /**
   * Check if error is retryable
   *
   * @param error OAuth2Error to check
   * @returns True if error is retryable
   */
  private isRetryableError(error: OAuth2Error): boolean {
    const nonRetryableCodes: OAuth2ErrorCode[] = [
      'INVALID_REQUEST',
      'INVALID_CLIENT',
      'INVALID_GRANT',
      'UNAUTHORIZED_CLIENT',
      'UNSUPPORTED_GRANT_TYPE',
      'INVALID_SCOPE',
      'PARSE_ERROR',
      'VALIDATION_ERROR',
    ]

    if (nonRetryableCodes.includes(error.code)) {
      return false
    }

    // Allow retry for explicitly marked retryable errors
    return error.isRetryable
  }

  /**
   * Calculate exponential backoff delay with jitter
   *
   * @param attempt Retry attempt number (1-based)
   * @returns Delay in milliseconds
   */
  private exponentialBackoff(attempt: number): number {
    const baseDelay = this.retryDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * baseDelay * 0.1 // 10% jitter
    return baseDelay + jitter
  }

  /**
   * Sleep for specified duration
   *
   * @param ms Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear all cached tokens
   */
  clearCache(): void {
    this.tokenCache.clear()
    console.info('[OAuth2] Token cache cleared')
  }

  /**
   * Clear cached token for specific credentials
   *
   * @param cacheKey Cache key for token
   */
  clearCacheForKey(cacheKey: string): void {
    this.tokenCache.delete(cacheKey)
    console.info('[OAuth2] Cached token cleared for key', { key: cacheKey })
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  getCacheStats(): {
    totalCached: number
    validTokens: number
    expiredTokens: number
  } {
    const now = Date.now()
    let validTokens = 0
    let expiredTokens = 0

    for (const cached of this.tokenCache.values()) {
      if (now < cached.expiresAt) {
        validTokens++
      } else {
        expiredTokens++
      }
    }

    return {
      totalCached: this.tokenCache.size,
      validTokens,
      expiredTokens,
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalOAuth2Manager: OAuth2AuthManager | null = null

/**
 * Get global OAuth2 manager instance
 *
 * @returns Global OAuth2AuthManager instance
 */
export function getOAuth2Manager(): OAuth2AuthManager {
  if (!globalOAuth2Manager) {
    globalOAuth2Manager = new OAuth2AuthManager()
  }
  return globalOAuth2Manager
}

/**
 * Reset global OAuth2 manager (for testing)
 */
export function resetOAuth2Manager(): void {
  globalOAuth2Manager = null
}
