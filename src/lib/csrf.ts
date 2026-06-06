/**
 * Client-side CSRF Token Management
 * Handles token extraction, storage, and injection into requests
 *
 * Usage:
 *   const token = await csrfClient.getToken()
 *   const response = await fetch('/api/example', {
 *     method: 'POST',
 *     headers: await csrfClient.getHeaders(),
 *     body: JSON.stringify(data)
 *   })
 */

const CSRF_COOKIE_NAME = '__csrf'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_STORAGE_KEY = 'csrf_token'

interface CSRFToken {
  token: string
  expiresAt: number
}

class CSRFClient {
  private cachedToken: CSRFToken | null = null

  /**
   * Get CSRF token from memory, sessionStorage, or fetch fresh
   */
  async getToken(): Promise<string> {
    // Check cached token first
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token
    }

    // Try to get from sessionStorage
    const stored = typeof window !== 'undefined'
      ? sessionStorage.getItem(CSRF_TOKEN_STORAGE_KEY)
      : null

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CSRFToken
        if (Date.now() < parsed.expiresAt) {
          this.cachedToken = parsed
          return parsed.token
        }
      } catch (e) {
        console.warn('[CSRF] Failed to parse stored token')
      }
    }

    // Fetch fresh token from server
    return this.fetchFreshToken()
  }

  /**
   * Fetch a fresh CSRF token from the server
   */
  private async fetchFreshToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`CSRF token fetch failed: ${response.statusText}`)
      }

      const data = await response.json() as { csrf_token: string }
      const token = data.csrf_token

      // Cache token with 23-hour expiry (server token valid for 24 hours)
      const expiresAt = Date.now() + 23 * 60 * 60 * 1000
      this.cachedToken = { token, expiresAt }

      // Also store in sessionStorage as backup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(CSRF_TOKEN_STORAGE_KEY, JSON.stringify(this.cachedToken))
      }

      return token
    } catch (error) {
      console.error('[CSRF] Failed to fetch token:', error)
      throw new Error('Failed to fetch CSRF token')
    }
  }

  /**
   * Get headers object with CSRF token pre-injected
   */
  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken()
    return {
      [CSRF_TOKEN_HEADER]: token,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Make a fetch request with automatic CSRF token injection
   */
  async fetch(
    url: string,
    options?: RequestInit & { method?: string }
  ): Promise<Response> {
    const method = options?.method?.toUpperCase() || 'GET'

    // Only inject token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const headers = await this.getHeaders()
      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options?.headers || {}),
        },
        credentials: 'include', // Always include credentials for same-origin
      })
    }

    return fetch(url, {
      ...options,
      credentials: 'include',
    })
  }

  /**
   * Clear cached token (e.g., on logout)
   */
  clear(): void {
    this.cachedToken = null
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CSRF_TOKEN_STORAGE_KEY)
    }
  }

  /**
   * Get token stats for debugging
   */
  getStats(): { cached: boolean; expiresIn?: number } {
    if (!this.cachedToken) {
      return { cached: false }
    }

    const expiresIn = this.cachedToken.expiresAt - Date.now()
    return {
      cached: true,
      expiresIn: expiresIn > 0 ? expiresIn : 0,
    }
  }
}

// Export singleton instance
export const csrfClient = new CSRFClient()

/**
 * React Hook for CSRF token management
 * Usage:
 *   const token = useCsrfToken()
 *   const { fetch: csrfFetch } = useCsrfToken('fetch')
 */
export function useCsrfToken(mode?: 'token' | 'fetch'): string | ((url: string, options?: RequestInit) => Promise<Response>) {
  const [token, setToken] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    csrfClient.getToken()
      .then(setToken)
      .catch((error) => {
        console.error('[CSRF Hook] Failed to get token:', error)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (mode === 'fetch') {
    return csrfClient.fetch.bind(csrfClient)
  }

  return token
}

/**
 * Form helper: inject CSRF token into form submission
 * Usage:
 *   const form = document.getElementById('myForm')
 *   form.addEventListener('submit', async (e) => {
 *     e.preventDefault()
 *     await injectCsrfTokenToForm(form)
 *     form.submit()
 *   })
 */
export async function injectCsrfTokenToForm(formElement: HTMLFormElement): Promise<void> {
  const token = await csrfClient.getToken()

  // Remove existing token field if present
  const existingField = formElement.querySelector(`input[name="${CSRF_TOKEN_HEADER}"]`)
  if (existingField) {
    existingField.remove()
  }

  // Create and inject hidden field
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = CSRF_TOKEN_HEADER
  input.value = token
  formElement.appendChild(input)
}

// For debugging in console
declare global {
  interface Window {
    __csrf?: typeof csrfClient
  }
}

if (typeof window !== 'undefined') {
  window.__csrf = csrfClient
}

// Re-export React for hook usage if available
let React: any
try {
  React = require('react')
} catch {
  // React not available in this context
}
