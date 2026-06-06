/**
 * IPOReady API Client
 * Lightweight HTTP client for IPOReady API endpoints
 *
 * Usage:
 * ```typescript
 * import { apiClient } from '@/lib/api-client'
 *
 * // Get companies
 * const response = await apiClient.get('/api/capital-markets/companies', {
 *   sector: 'Technology'
 * })
 *
 * // Upload documents
 * const formData = new FormData()
 * formData.append('documentId', '123')
 * formData.append('files', file)
 * const response = await apiClient.post('/api/documents/upload', formData)
 * ```
 */

import type {
  ApiClientConfig,
  ApiResponse,
  ApiErrorResponse,
  ApiRequestOptions,
  CompaniesResponse,
  IPOsResponse,
  CapitalMarketsDashboard,
  DocumentListResponse,
  DocumentUploadResponse,
  DocumentDeleteResponse,
  SecIngestionResponse,
  SecStatusResponse,
  DeploymentResult,
  DashboardResponse,
} from '@/types/api-types'

export class IpoReadyApiClient {
  private baseURL: string
  private token?: string
  private timeout: number
  private headers: Record<string, string>

  constructor(config?: ApiClientConfig) {
    this.baseURL =
      config?.baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    this.token = config?.token
    this.timeout = config?.timeout || 30000
    this.headers = {
      'Content-Type': 'application/json',
      ...(config?.headers || {}),
    }
  }

  /**
   * Set or update the authentication token
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Get the current token
   */
  getToken(): string | undefined {
    return this.token
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  /**
   * Build request headers including authentication
   */
  private buildHeaders(options?: ApiRequestOptions): Record<string, string> {
    const headers = { ...this.headers, ...(options?.headers || {}) }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const method = options.method || 'GET'
    const url = this.buildUrl(path, options.params)
    const headers = this.buildHeaders(options)

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(options.timeout || this.timeout),
    }

    if (options.body) {
      if (options.body instanceof FormData) {
        // Don't set Content-Type for FormData
        if (fetchOptions.headers && typeof fetchOptions.headers === 'object' && !Array.isArray(fetchOptions.headers)) {
          delete (fetchOptions.headers as Record<string, string>)['Content-Type']
        }
        fetchOptions.body = options.body
      } else {
        fetchOptions.body = JSON.stringify(options.body)
      }
    }

    try {
      const response = await fetch(url, fetchOptions)

      // Handle successful responses
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return await response.json()
        }
        return (await response.text()) as T
      }

      // Handle error responses
      const contentType = response.headers.get('content-type')
      let errorData: any = { error: `HTTP ${response.status}` }

      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json()
        } catch {
          // Response is not valid JSON
        }
      }

      const error: ApiErrorResponse = {
        ...errorData,
        status: response.status,
      }

      throw error
    } catch (error) {
      // If it's already our error object, re-throw it
      if (error && typeof error === 'object' && 'status' in error && 'error' in error) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            error: 'Request timeout',
            details: `Request took longer than ${options.timeout || this.timeout}ms`,
            status: 408,
          } as ApiErrorResponse
        }

        throw {
          error: 'Request failed',
          details: error.message,
          status: 0,
        } as ApiErrorResponse
      }

      throw {
        error: 'Unknown error',
        status: 0,
      } as ApiErrorResponse
    }
  }

  /**
   * GET request
   */
  async get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params })
  }

  /**
   * POST request
   */
  async post<T = any>(
    path: string,
    body?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, params })
  }

  /**
   * PUT request
   */
  async put<T = any>(
    path: string,
    body?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, params })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    path: string,
    body?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body, params })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    path: string,
    body?: any,
    params?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', body, params })
  }

  // ========================================================================
  // Capital Markets API Methods
  // ========================================================================

  /**
   * List companies
   */
  async getCompanies(params?: {
    sector?: string
    q?: string
    limit?: number
    offset?: number
  }): Promise<CompaniesResponse> {
    return this.get('/api/capital-markets/companies', params)
  }

  /**
   * Get IPO listings
   */
  async getIPOs(params?: {
    status?: string
    sector?: string
    days?: number
  }): Promise<IPOsResponse> {
    return this.get('/api/capital-markets/ipos', params)
  }

  /**
   * Get capital markets dashboard for a company
   */
  async getCapitalMarketsDashboard(companyId: string): Promise<CapitalMarketsDashboard> {
    return this.get('/api/capital-markets/dashboard', { companyId })
  }

  // ========================================================================
  // Document API Methods
  // ========================================================================

  /**
   * List documents for a company
   */
  async getDocuments(params: {
    companyId: string
    category?: string
  }): Promise<DocumentListResponse> {
    return this.get('/api/documents/list', params)
  }

  /**
   * Upload documents
   */
  async uploadDocuments(
    documentId: string,
    files: File[] | FileList
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('documentId', documentId)

    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })

    return this.post('/api/documents/upload', formData)
  }

  /**
   * Delete a document file
   */
  async deleteDocument(documentId: string, fileId: string): Promise<DocumentDeleteResponse> {
    return this.delete('/api/documents/delete', { documentId, fileId })
  }

  // ========================================================================
  // Admin API Methods
  // ========================================================================

  /**
   * Trigger SEC filing ingestion
   */
  async ingestSecFilings(params?: {
    companyIds?: string
    limit?: number
  }): Promise<SecIngestionResponse> {
    return this.post('/api/admin/ingest-sec-filings', undefined, params)
  }

  /**
   * Get SEC ingestion status
   */
  async getSecStatus(): Promise<SecStatusResponse> {
    return this.get('/api/admin/ingest-sec-filings')
  }

  /**
   * Deploy unified document system
   */
  async deployDocuments(): Promise<DeploymentResult> {
    return this.post('/api/admin/deploy-documents')
  }

  // ========================================================================
  // Dashboard API Methods
  // ========================================================================

  /**
   * Get company dashboard
   */
  async getDashboard(): Promise<DashboardResponse> {
    return this.get('/api/dashboard')
  }
}

/**
 * Global API client instance
 * Use for client-side API calls
 */
export const apiClient = new IpoReadyApiClient()

/**
 * Create a new API client instance (useful for custom configuration)
 */
export function createApiClient(config?: ApiClientConfig): IpoReadyApiClient {
  return new IpoReadyApiClient(config)
}

/**
 * React Hook: useApiClient
 * Provides configured API client with token management
 */
export function useApiClient(token?: string): IpoReadyApiClient {
  const client = new IpoReadyApiClient()

  if (token) {
    client.setToken(token)
  }

  return client
}
