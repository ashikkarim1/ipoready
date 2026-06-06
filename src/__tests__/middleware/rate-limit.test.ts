/**
 * Unit tests for rate limiting middleware
 */

import { NextRequest } from 'next/server'
import {
  checkRateLimit,
  RATE_LIMIT_CONFIG,
  getClientIp,
  isHealthCheck,
  RateLimitResult,
} from '@/lib/middleware/rate-limit'

describe('Rate Limiting Middleware', () => {
  /**
   * Helper to create a mock NextRequest
   */
  function createMockRequest(
    path = '/api/test',
    method = 'GET',
    headers: Record<string, string> = {}
  ): NextRequest {
    const url = new URL(`http://localhost:3000${path}`)
    const req = new NextRequest(url, { method })

    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      req.headers.set(key, value)
    })

    return req
  }

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = createMockRequest('/', 'GET', {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      })

      expect(getClientIp(req)).toBe('192.168.1.1')
    })

    it('should handle x-forwarded-for with extra spaces', () => {
      const req = createMockRequest('/', 'GET', {
        'x-forwarded-for': '  192.168.1.1  ,  10.0.0.1  ',
      })

      expect(getClientIp(req)).toBe('192.168.1.1')
    })

    it('should handle missing IP gracefully', () => {
      const req = createMockRequest('/', 'GET', {})

      const ip = getClientIp(req)
      expect(ip).toBeTruthy()
      expect(typeof ip).toBe('string')
    })
  })

  describe('isHealthCheck', () => {
    it('should bypass /health endpoint', () => {
      const req = createMockRequest('/health')
      expect(isHealthCheck(req)).toBe(true)
    })

    it('should bypass /api/health endpoint', () => {
      const req = createMockRequest('/api/health')
      expect(isHealthCheck(req)).toBe(true)
    })

    it('should recognize Kubernetes probes', () => {
      const req = createMockRequest('/', 'GET', {
        'user-agent': 'kube-probe/1.27',
      })

      expect(isHealthCheck(req)).toBe(true)
    })

    it('should recognize kubelet health checks', () => {
      const req = createMockRequest('/', 'GET', {
        'user-agent': 'kubelet/1.27',
      })

      expect(isHealthCheck(req)).toBe(true)
    })

    it('should recognize Vercel deployments', () => {
      const req = createMockRequest('/', 'GET', {
        'x-vercel-deployment-url': 'https://example.vercel.app',
      })

      expect(isHealthCheck(req)).toBe(true)
    })

    it('should not bypass regular endpoints', () => {
      const req = createMockRequest('/api/documents')
      expect(isHealthCheck(req)).toBe(false)
    })
  })

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const key = `test-key-${Date.now()}`
      const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS

      const result = await checkRateLimit(key, config)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(config.maxRequests - 1)
      expect(result.limit).toBe(config.maxRequests)
    })

    it('should track remaining requests', async () => {
      const key = `test-key-${Date.now()}`
      const config = { ...RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS, maxRequests: 5 }

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        await checkRateLimit(key, config)
      }

      const result = await checkRateLimit(key, config)

      expect(result.remaining).toBe(1) // 5 - 4
      expect(result.allowed).toBe(true)
    })

    it('should reject requests exceeding limit', async () => {
      const key = `test-key-${Date.now()}`
      const config = { ...RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS, maxRequests: 2 }

      // Make 2 requests
      await checkRateLimit(key, config)
      await checkRateLimit(key, config)

      // Third request should fail
      const result = await checkRateLimit(key, config)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should provide retry-after time', async () => {
      const key = `test-key-${Date.now()}`
      const config = { ...RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS, maxRequests: 1 }

      await checkRateLimit(key, config)
      const result = await checkRateLimit(key, config)

      expect(result.retryAfter).toBeLessThanOrEqual(60)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should reset counter after window expires', async () => {
      const key = `test-key-${Date.now()}`
      const config = {
        ...RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS,
        windowMs: 100,
        maxRequests: 1,
      }

      // First request
      let result = await checkRateLimit(key, config)
      expect(result.allowed).toBe(true)

      // Second request immediately (should fail)
      result = await checkRateLimit(key, config)
      expect(result.allowed).toBe(false)

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Third request (should succeed in new window)
      result = await checkRateLimit(key, config)
      expect(result.allowed).toBe(true)
    }, 10000) // Increase timeout for this test

    it('should handle different keys independently', async () => {
      const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS

      const result1 = await checkRateLimit('key1', config)
      const result2 = await checkRateLimit('key2', config)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(result2.remaining)
    })
  })

  describe('Rate Limit Configurations', () => {
    it('should have correct PUBLIC_ENDPOINTS config', () => {
      const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS

      expect(config.windowMs).toBe(60 * 1000) // 1 minute
      expect(config.maxRequests).toBe(100)
      expect(config.keyPrefix).toBe('rl:pub')
    })

    it('should have correct AUTHENTICATED_ENDPOINTS config', () => {
      const config = RATE_LIMIT_CONFIG.AUTHENTICATED_ENDPOINTS

      expect(config.windowMs).toBe(60 * 1000) // 1 minute
      expect(config.maxRequests).toBe(1000)
      expect(config.keyPrefix).toBe('rl:auth')
    })

    it('should have correct LOGIN_ENDPOINT config', () => {
      const config = RATE_LIMIT_CONFIG.LOGIN_ENDPOINT

      expect(config.windowMs).toBe(15 * 60 * 1000) // 15 minutes
      expect(config.maxRequests).toBe(5)
      expect(config.keyPrefix).toBe('rl:login')
    })

    it('should have correct REGISTER_ENDPOINT config', () => {
      const config = RATE_LIMIT_CONFIG.REGISTER_ENDPOINT

      expect(config.windowMs).toBe(60 * 60 * 1000) // 1 hour
      expect(config.maxRequests).toBe(3)
      expect(config.keyPrefix).toBe('rl:register')
    })

    it('should have correct DOCUMENT_UPLOAD config', () => {
      const config = RATE_LIMIT_CONFIG.DOCUMENT_UPLOAD

      expect(config.windowMs).toBe(60 * 60 * 1000) // 1 hour
      expect(config.maxRequests).toBe(20)
      expect(config.keyPrefix).toBe('rl:docs:upload')
    })

    it('should have correct DATA_EXPORT config', () => {
      const config = RATE_LIMIT_CONFIG.DATA_EXPORT

      expect(config.windowMs).toBe(60 * 60 * 1000) // 1 hour
      expect(config.maxRequests).toBe(5)
      expect(config.keyPrefix).toBe('rl:export')
    })
  })

  describe('Rate Limit Result Format', () => {
    it('should return correct result structure', async () => {
      const key = `test-key-${Date.now()}`
      const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS

      const result = await checkRateLimit(key, config)

      expect(result).toHaveProperty('allowed')
      expect(result).toHaveProperty('limit')
      expect(result).toHaveProperty('remaining')
      expect(result).toHaveProperty('resetTime')
      expect(typeof result.allowed).toBe('boolean')
      expect(typeof result.limit).toBe('number')
      expect(typeof result.remaining).toBe('number')
      expect(typeof result.resetTime).toBe('number')
    })

    it('should include retryAfter when rate limited', async () => {
      const key = `test-key-${Date.now()}`
      const config = { ...RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS, maxRequests: 1 }

      await checkRateLimit(key, config)
      const result = await checkRateLimit(key, config)

      expect(result.allowed).toBe(false)
      expect(result).toHaveProperty('retryAfter')
      expect(typeof result.retryAfter).toBe('number')
    })

    it('should not include retryAfter when allowed', async () => {
      const key = `test-key-${Date.now()}`
      const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS

      const result = await checkRateLimit(key, config)

      expect(result.allowed).toBe(true)
      expect(result.retryAfter).toBeUndefined()
    })
  })
})

describe('Rate Limit Integration', () => {
  it('should handle burst traffic correctly', async () => {
    const key = `burst-test-${Date.now()}`
    const config = { ...RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS, maxRequests: 10 }

    const results: RateLimitResult[] = []

    // Simulate burst of 15 requests
    for (let i = 0; i < 15; i++) {
      const result = await checkRateLimit(key, config)
      results.push(result)
    }

    // First 10 should be allowed
    const allowedCount = results.filter((r) => r.allowed).length
    expect(allowedCount).toBe(10)

    // Last 5 should be rejected
    const rejectedCount = results.filter((r) => !r.allowed).length
    expect(rejectedCount).toBe(5)

    // All rejected should have retryAfter
    const allHaveRetryAfter = results
      .filter((r) => !r.allowed)
      .every((r) => r.retryAfter !== undefined)
    expect(allHaveRetryAfter).toBe(true)
  })

  it('should handle multiple concurrent keys', async () => {
    const config = RATE_LIMIT_CONFIG.PUBLIC_ENDPOINTS
    const keys = ['key1', 'key2', 'key3', 'key4', 'key5']

    // Make concurrent requests to different keys
    const promises = keys.map((key) => checkRateLimit(key, config))
    const results = await Promise.all(promises)

    // All should be allowed
    const allAllowed = results.every((r) => r.allowed)
    expect(allAllowed).toBe(true)

    // All should have same limit
    const allSameLimit = results.every((r) => r.limit === config.maxRequests)
    expect(allSameLimit).toBe(true)
  })
})
