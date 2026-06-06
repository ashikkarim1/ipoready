/**
 * React Hook for CSRF Token Management
 * Handles token fetching, caching, and automatic injection into fetch requests
 *
 * Usage:
 *   const { token, fetch, isLoading } = useCsrf()
 *
 *   // Use with fetch
 *   const response = await fetch('/api/example', {
 *     method: 'POST',
 *     headers: { 'X-CSRF-Token': token },
 *     body: JSON.stringify(data)
 *   })
 *
 *   // Or use the convenience method
 *   const response = await fetch('/api/example', {
 *     method: 'POST',
 *     body: JSON.stringify(data)
 *   })
 */

'use client'

import { useEffect, useState, useCallback, createElement } from 'react'

interface UseCsrfReturn {
  token: string | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<string>
  fetch: (url: string, options?: RequestInit) => Promise<Response>
}

const CSRF_STORAGE_KEY = 'csrf_token_cache'
const CSRF_ENDPOINT = '/api/csrf'

interface StoredToken {
  token: string
  expiresAt: number
}

export function useCsrf(): UseCsrfReturn {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load token from localStorage/sessionStorage and validate expiry
  const loadCachedToken = useCallback((): string | null => {
    try {
      const cached = sessionStorage.getItem(CSRF_STORAGE_KEY)
      if (!cached) return null

      const parsed = JSON.parse(cached) as StoredToken
      if (Date.now() < parsed.expiresAt) {
        return parsed.token
      }

      // Token expired, remove it
      sessionStorage.removeItem(CSRF_STORAGE_KEY)
      return null
    } catch {
      return null
    }
  }, [])

  // Fetch fresh token from server
  const fetchToken = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch(CSRF_ENDPOINT, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`)
      }

      const data = (await response.json()) as { csrf_token: string }
      const newToken = data.csrf_token

      // Cache token with 23-hour expiry (server token valid for 24 hours)
      const expiresAt = Date.now() + 23 * 60 * 60 * 1000
      sessionStorage.setItem(
        CSRF_STORAGE_KEY,
        JSON.stringify({ token: newToken, expiresAt })
      )

      return newToken
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    }
  }, [])

  // Initialize token on mount
  useEffect(() => {
    const initToken = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Try cached token first
        const cachedToken = loadCachedToken()
        if (cachedToken) {
          setToken(cachedToken)
          setIsLoading(false)
          return
        }

        // Fetch fresh token
        const newToken = await fetchToken()
        setToken(newToken)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    initToken()
  }, [loadCachedToken, fetchToken])

  // Refresh token on demand
  const refresh = useCallback(async (): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const newToken = await fetchToken()
      setToken(newToken)
      return newToken
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [fetchToken])

  // Convenience method for fetch with automatic token injection
  const fetchWithCsrf = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const method = options?.method?.toUpperCase() || 'GET'
      const currentToken = token || (await refresh())

      // Only inject token for state-changing requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return fetch(url, {
          ...options,
          headers: {
            'X-CSRF-Token': currentToken,
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
          },
          credentials: 'include',
        })
      }

      // For GET/HEAD/OPTIONS, no token needed
      return fetch(url, {
        ...options,
        credentials: 'include',
      })
    },
    [token, refresh]
  )

  return {
    token,
    isLoading,
    error,
    refresh,
    fetch: fetchWithCsrf,
  }
}

/**
 * Higher-order component for components that need CSRF token
 *
 * Usage:
 *   const MyComponent = ({ token, fetch }) => {
 *     return <div>{token ? 'Ready' : 'Loading'}</div>
 *   }
 *
 *   export default withCsrf(MyComponent)
 */
export function withCsrf<P extends { csrf: UseCsrfReturn }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'csrf'>> {
  return function WithCsrfComponent(props: Omit<P, 'csrf'>) {
    const csrf = useCsrf()
    return createElement(Component, { ...(props as P), csrf })
  }
}
