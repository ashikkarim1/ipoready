# OAuth2 Authentication Integration Guide

## Overview

Complete OAuth2 implementation for SEDAR filing system with:
- **Token request/refresh logic** with automatic caching and TTL
- **Secure token caching** with expiration handling
- **Credential validation** for security
- **Error handling** with retry logic and backoff
- **Comprehensive test utilities** for unit testing

## Files

- `oauth2-auth.ts` (543 lines) - Core OAuth2 authentication manager
- `oauth2-test-utils.ts` (602 lines) - Test utilities and mock server
- Integration with `SEDARAdapter.ts`

## Quick Start

### 1. Setup Environment Variables

```bash
# Required for production
export SEDAR2_CLIENT_ID="your-client-id"
export SEDAR2_CLIENT_SECRET="your-client-secret"
```

### 2. Using OAuth2 in SEDARAdapter

```typescript
import { SEDARAdapter } from './filing-adapters/SEDARAdapter'

// Create adapter instance
const adapter = new SEDARAdapter('fallback-api-key', false) // false = production

// Validate credentials before use
const validation = adapter.validateOAuth2Credentials()
if (!validation.isValid) {
  console.error('OAuth2 configuration errors:', validation.errors)
}

// Token is automatically obtained and cached on first API call
// Subsequent calls reuse the cached token until expiry
const result = await adapter.submit(documents, metadata)

// Check cache statistics
const stats = adapter.getOAuth2CacheStats()
console.log('Cached tokens:', stats.totalCached, 'Valid:', stats.validTokens)

// Clear cache if needed (forces re-authentication)
adapter.clearOAuth2Cache()
```

### 3. Direct OAuth2 Manager Usage

```typescript
import { getOAuth2Manager, type OAuth2Credentials } from './utils/oauth2-auth'

const manager = getOAuth2Manager()

const credentials: OAuth2Credentials = {
  clientId: process.env.SEDAR2_CLIENT_ID!,
  clientSecret: process.env.SEDAR2_CLIENT_SECRET!,
  tokenUrl: 'https://sandbox-api.sedar.ca/v1/oauth/token',
}

try {
  const token = await manager.getAccessToken(credentials, {
    grantType: 'client_credentials',
    scope: 'filing.submit filing.status',
  })
  console.log('Access token:', token)
} catch (error) {
  console.error('Authentication failed:', error)
}
```

## Core Components

### OAuth2AuthManager

Main authentication manager with:

#### Methods

- `getAccessToken(credentials, options)` - Get valid token with auto-caching
- `validateCredentials(credentials)` - Validate credentials before use
- `clearCache()` - Clear all cached tokens
- `clearCacheForKey(cacheKey)` - Clear specific token cache
- `getCacheStats()` - Get cache statistics

#### Features

- **Automatic caching** - Tokens cached with TTL
- **Auto-refresh** - Refreshes token 5 minutes before expiry
- **Concurrent request deduplication** - Prevents duplicate token requests
- **Exponential backoff** - Automatic retry with jitter
- **Request/response logging** - Safe logging (no secret exposure)

### OAuth2 Error Handling

```typescript
import { OAuth2Error, OAuth2ErrorCode } from './utils/oauth2-auth'

try {
  const token = await manager.getAccessToken(credentials, options)
} catch (error) {
  if (error instanceof OAuth2Error) {
    // Check error code
    if (error.code === 'INVALID_CLIENT') {
      // Non-retryable - credentials are wrong
      console.error('Fix credentials and retry')
    } else if (error.code === 'TIMEOUT_ERROR' && error.isRetryable) {
      // Retryable - temporary network issue
      console.log('Will retry automatically')
    }
    
    console.error(`Error: ${error.message}`)
    console.error(`Status: ${error.statusCode}`)
    console.error(`Retryable: ${error.isRetryable}`)
  }
}
```

## Testing

### Using Mock Server

```typescript
import {
  MockOAuth2Server,
  createMockToken,
  createMockCredentials,
  inspectToken,
  isTokenValid,
} from './utils/oauth2-test-utils'

// Create mock server
const server = new MockOAuth2Server()

// Configure success response
server.configure({ delay: 100 })
const response = server.getTokenResponse()
console.log(response.statusCode) // 200

// Test error scenarios
server.configure({
  shouldFail: true,
  failureCode: 'invalid_client',
  failureDescription: 'Client authentication failed',
})

// Simulate fetch with mock server
const mockResponse = await server.simulateFetch(
  'https://sandbox-api.sedar.ca/v1/oauth/token',
  { method: 'POST' }
)
```

### Token Validation Helpers

```typescript
import {
  createMockToken,
  inspectToken,
  isTokenValid,
  isTokenExpiringSoon,
  hasRequiredScopes,
  assertTokenIsValid,
} from './utils/oauth2-test-utils'

// Create token
const token = createMockToken({ expiresIn: 3600 })

// Validate token
assertTokenIsValid(token)

// Check expiry
const inspection = inspectToken(token)
console.log('Expires in:', inspection.timeUntilExpiry, 'ms')

// Check if expired
if (!isTokenValid(token)) {
  console.log('Token is expired')
}

// Check if expiring soon (within 5 minutes)
if (isTokenExpiringSoon(token, 300)) {
  console.log('Token expires soon, refresh recommended')
}

// Check scopes
if (!hasRequiredScopes(token, ['filing.submit', 'filing.status'])) {
  console.log('Token missing required scopes')
}
```

### Error Scenario Testing

```typescript
import { OAUTH2_ERROR_SCENARIOS, createServerForErrorScenario } from './utils/oauth2-test-utils'

// Test rate limiting scenario
const rateLimitServer = createServerForErrorScenario('RATE_LIMIT')
const response = rateLimitServer.getTokenResponse()
console.log(response.statusCode) // 429

// Test server error scenario
const serverErrorServer = createServerForErrorScenario('SERVER_ERROR')
const errorResponse = serverErrorServer.getTokenResponse()
console.log(errorResponse.statusCode) // 500

// Available scenarios
Object.keys(OAUTH2_ERROR_SCENARIOS).forEach(scenario => {
  console.log(`${scenario}: ${OAUTH2_ERROR_SCENARIOS[scenario].errorCode}`)
})
```

## Security Considerations

### Credential Management

1. **Never hardcode credentials** - Use environment variables only
2. **HTTPS only** - Token endpoints must use HTTPS
3. **Secure storage** - Credentials stored only in environment variables
4. **No logging** - Tokens and secrets never logged (request logging excluded)

### Token Caching

1. **In-memory cache** - Tokens cached in memory, cleared on process exit
2. **TTL enforcement** - Tokens refreshed 5 minutes before expiry
3. **Concurrent safety** - Duplicate requests deduplicated

### Error Handling

1. **Non-retryable errors** - Invalid credentials, invalid scope
2. **Retryable errors** - Server errors, rate limits, timeouts
3. **Exponential backoff** - Prevents overwhelming server during failures

## Configuration

### Environment Variables

```bash
# SEDAR API credentials
export SEDAR2_CLIENT_ID="your-client-id"
export SEDAR2_CLIENT_SECRET="your-client-secret"

# Optional: API key fallback
export SEDAR2_API_KEY="fallback-key"
```

### OAuth2 Manager Configuration

Token refresh buffer (5 minutes):
```typescript
private readonly tokenRefreshBuffer = 300 // seconds
```

Max retries:
```typescript
private readonly maxRetries = 3
```

Request timeout:
```typescript
const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 seconds
```

Exponential backoff:
```typescript
const baseDelay = this.retryDelay * Math.pow(2, attempt - 1)
const jitter = Math.random() * baseDelay * 0.1 // 10% jitter
```

## Error Codes

### OAuth2 Error Codes (RFC 6749)

| Code | Status | Retryable | Description |
|------|--------|-----------|-------------|
| `INVALID_REQUEST` | 400 | No | Request syntax error |
| `INVALID_CLIENT` | 401 | No | Client authentication failed |
| `INVALID_GRANT` | 401 | No | Invalid authorization grant |
| `UNAUTHORIZED_CLIENT` | 400 | No | Client not authorized |
| `UNSUPPORTED_GRANT_TYPE` | 400 | No | Grant type not supported |
| `INVALID_SCOPE` | 400 | No | Requested scope invalid |
| `NETWORK_ERROR` | - | Yes | Network connectivity issue |
| `TIMEOUT_ERROR` | - | Yes | Request timed out (15s) |
| `PARSE_ERROR` | - | No | Response parsing failed |

### Filing Adapter Error Mapping

```typescript
OAuth2Error('INVALID_CLIENT')     → FilingError('AUTH_FAILED', non-retryable)
OAuth2Error('NETWORK_ERROR')      → FilingError('AUTH_ERROR', retryable)
OAuth2Error('TIMEOUT_ERROR')      → FilingError('AUTH_ERROR', retryable)
```

## Performance

### Token Caching

- **First request**: ~100-500ms (network request + parsing)
- **Cached requests**: <1ms (in-memory lookup)
- **Cache size**: ~1KB per token
- **TTL**: Token lifetime - 5 minutes

### Retry Logic

- **Max retries**: 3 attempts
- **Initial backoff**: 1 second
- **Max backoff**: ~8 seconds (2^3)
- **Jitter**: ±10% to prevent thundering herd

## Migration from Old Implementation

The new OAuth2 implementation replaces the old token caching:

**Before**:
```typescript
private cachedAccessToken: string | null = null
private tokenExpiresAt: number | null = null
private readonly tokenRefreshBuffer = 300

private async getAccessToken(): Promise<string> {
  if (this.cachedAccessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
    return this.cachedAccessToken
  }
  // Manual token fetch...
}
```

**After**:
```typescript
private readonly oauth2Manager: OAuth2AuthManager
private readonly oauth2Credentials: OAuth2Credentials

private async getAccessToken(): Promise<string> {
  return this.oauth2Manager.getAccessToken(
    this.oauth2Credentials,
    { grantType: 'client_credentials', scope: '...' }
  )
}
```

Benefits:
- Centralized token management
- Better error handling with retry logic
- Concurrent request deduplication
- Request/response logging
- Comprehensive test utilities
- RFC 6749 compliance

## Examples

### Example 1: Basic Filing Submission

```typescript
const adapter = new SEDARAdapter(process.env.SEDAR2_API_KEY!)

// Validate OAuth2 configuration
const validation = adapter.validateOAuth2Credentials()
if (!validation.isValid) {
  throw new Error(`OAuth2 config invalid: ${validation.errors.join('; ')}`)
}

// Submit filing (OAuth2 token handled automatically)
const result = await adapter.submit(documents, metadata)
console.log('Filing submitted:', result.filingId)
```

### Example 2: Cache Management

```typescript
const adapter = new SEDARAdapter(process.env.SEDAR2_API_KEY!)

// Check cache status
let stats = adapter.getOAuth2CacheStats()
console.log('Cached tokens:', stats.totalCached)

// Make API calls (token cached)
await adapter.submit(documents1, metadata1)
await adapter.getStatus(filingId)

// Check cache again
stats = adapter.getOAuth2CacheStats()
console.log('Valid tokens:', stats.validTokens) // Should be 1

// Force re-authentication
adapter.clearOAuth2Cache()
stats = adapter.getOAuth2CacheStats()
console.log('Cached tokens after clear:', stats.totalCached) // Should be 0
```

### Example 3: Error Handling

```typescript
const adapter = new SEDARAdapter(process.env.SEDAR2_API_KEY!)

try {
  const result = await adapter.submit(documents, metadata)
} catch (error) {
  if (error instanceof FilingError) {
    if (error.code === 'AUTH_FAILED') {
      // Non-retryable - fix credentials
      console.error('Fix OAuth2 credentials:', error.message)
    } else if (error.code === 'AUTH_ERROR' && error.retryable) {
      // Retryable - will auto-retry
      console.warn('Temporary auth failure, retrying:', error.message)
    }
  }
}
```

## Reference

- **OAuth2 RFC**: [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- **Token Endpoint**: [RFC 6749 Section 4.4 - Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4)
- **Error Response**: [RFC 6749 Section 5.2 - Error Response](https://tools.ietf.org/html/rfc6749#section-5.2)
- **SEDAR API**: [SEDAR 2 API Documentation](https://sedar.ca/api/v1)

## Support

For issues or questions:
1. Check credential configuration (environment variables)
2. Verify token endpoint URL is correct
3. Review error message and error code
4. Check SEDAR API status
5. Enable debug logging to inspect requests/responses
