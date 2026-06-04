/**
 * Filing Service
 * ==============
 * Unified service layer for filing submissions and status tracking.
 * Abstracts SEDAR and SEC EDGAR adapter differences.
 *
 * Features:
 * - Dual-jurisdiction filing support (Canada/US)
 * - Real-time status tracking
 * - Webhook registration
 * - Error handling and retry logic
 * - Document validation
 */

import SEDARAdapter from '../filing-adapters/SEDARAdapter.real'
import SECEdgarAdapter from '../filing-adapters/SECEdgarAdapter.real'
import {
  DocumentMetadata,
  FilingMetadata,
  SubmissionResult,
  FilingStatus,
  DocumentType,
  FilingError,
} from '../filing-adapters/BaseFilingAdapter'

/**
 * Filing submission request
 */
export interface FilingSubmissionRequest {
  filingSystem: 'sedar' | 'sec'
  documents: DocumentMetadata[]
  metadata: FilingMetadata
  options?: {
    webhookUrl?: string
    registerWebhook?: boolean
    dryRun?: boolean
  }
}

/**
 * Filing submission response
 */
export interface FilingSubmissionResponse {
  success: boolean
  filingId: string
  referenceNumber: string
  status: string
  submittedAt: Date
  system: 'sedar' | 'sec'
  message: string
  warnings: string[]
  webhookRegistered?: boolean
  error?: string
}

/**
 * Filing service class
 */
export class FilingService {
  private sedarAdapter: SEDARAdapter
  private secAdapter: SECEdgarAdapter

  constructor(sedarApiKey?: string, cik?: string) {
    // Initialize SEDAR adapter
    this.sedarAdapter = new SEDARAdapter(
      sedarApiKey || process.env.SEDAR2_CLIENT_ID || '',
      process.env.SEDAR2_SANDBOX === 'true',
      (process.env.PREFERRED_LANGUAGE as 'en' | 'fr') || 'en'
    )

    // Initialize SEC adapter
    if (!cik && !process.env.SEC_CIK) {
      console.warn('SEC CIK not provided - SEC filing disabled')
    }
    this.secAdapter = new SECEdgarAdapter(cik || process.env.SEC_CIK || '0000000000')
  }

  /**
   * Submit filing to SEDAR or SEC
   */
  async submitFiling(request: FilingSubmissionRequest): Promise<FilingSubmissionResponse> {
    try {
      console.info('Filing submission started', {
        system: request.filingSystem,
        documentCount: request.documents.length,
        companyName: request.metadata.companyName,
      })

      // Dry run - validate only
      if (request.options?.dryRun) {
        return this.performDryRun(request)
      }

      // Route to appropriate adapter
      let result: SubmissionResult
      let adapter: SEDARAdapter | SECEdgarAdapter

      if (request.filingSystem === 'sedar') {
        adapter = this.sedarAdapter
        result = await this.sedarAdapter.submit(request.documents, request.metadata)
      } else {
        adapter = this.secAdapter
        result = await this.secAdapter.submit(request.documents, request.metadata)
      }

      // Register webhook if requested
      let webhookRegistered = false
      if (request.options?.registerWebhook && request.options?.webhookUrl) {
        if (request.filingSystem === 'sedar') {
          try {
            const webhookResult = await this.sedarAdapter.registerWebhook(
              request.options.webhookUrl,
              ['filing.submitted', 'filing.updated', 'filing.approved', 'filing.rejected']
            )
            webhookRegistered = !!webhookResult.webhookId
            console.info('SEDAR webhook registered', { webhookId: webhookResult.webhookId })
          } catch (error) {
            console.error('Failed to register SEDAR webhook', {
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
        // SEC EDGAR doesn't provide webhook registration endpoint
      }

      // Build response
      const response: FilingSubmissionResponse = {
        success: result.success,
        filingId: result.filingId,
        referenceNumber: result.referenceNumber,
        status: result.status,
        submittedAt: result.submittedAt,
        system: request.filingSystem,
        message: `Filing successfully submitted to ${request.filingSystem.toUpperCase()}`,
        warnings: result.warnings || [],
        webhookRegistered,
      }

      console.info('Filing submission completed', {
        system: request.filingSystem,
        filingId: result.filingId,
        status: result.status,
      })

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error('Filing submission failed', {
        system: request.filingSystem,
        companyName: request.metadata.companyName,
        error: errorMessage,
      })

      return {
        success: false,
        filingId: '',
        referenceNumber: '',
        status: 'failed',
        submittedAt: new Date(),
        system: request.filingSystem,
        message: `Filing submission failed: ${errorMessage}`,
        warnings: [],
        error: errorMessage,
      }
    }
  }

  /**
   * Get filing status
   */
  async getFilingStatus(filingId: string, system: 'sedar' | 'sec'): Promise<FilingStatus> {
    try {
      console.info('Filing status query started', { filingId, system })

      const adapter = system === 'sedar' ? this.sedarAdapter : this.secAdapter
      const status = await adapter.getStatus(filingId)

      console.info('Filing status retrieved', {
        filingId,
        system,
        status: status.status,
      })

      return status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error('Failed to get filing status', {
        filingId,
        system,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Validate documents without submission
   */
  async validateDocuments(
    documents: DocumentMetadata[],
    system: 'sedar' | 'sec'
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const adapter = system === 'sedar' ? this.sedarAdapter : this.secAdapter
      const result = await adapter.validate(documents)

      return {
        isValid: result.isValid,
        errors: result.errors.map(e => e.message),
        warnings: result.warnings,
      }
    } catch (error) {
      throw new FilingError(
        'VALIDATION_ERROR',
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false
      )
    }
  }

  /**
   * Get required documents for filing system
   */
  getRequiredDocuments(system: 'sedar' | 'sec'): DocumentType[] {
    const adapter = system === 'sedar' ? this.sedarAdapter : this.secAdapter
    return adapter.getRequiredDocuments()
  }

  /**
   * Get adapter configuration
   */
  getAdapterConfig(system: 'sedar' | 'sec'): Record<string, any> {
    const adapter = system === 'sedar' ? this.sedarAdapter : this.secAdapter
    return adapter.getAdapterConfig()
  }

  /**
   * Perform dry run (validation only)
   */
  private async performDryRun(request: FilingSubmissionRequest): Promise<FilingSubmissionResponse> {
    const validation = await this.validateDocuments(request.documents, request.filingSystem)

    return {
      success: validation.isValid,
      filingId: 'DRY_RUN',
      referenceNumber: 'DRY_RUN',
      status: validation.isValid ? 'validated' : 'invalid',
      submittedAt: new Date(),
      system: request.filingSystem,
      message: validation.isValid
        ? 'Documents validated successfully (dry run)'
        : 'Validation failed - see errors below',
      warnings: validation.warnings,
      error: validation.errors.length > 0 ? validation.errors.join('; ') : undefined,
    }
  }
}

/**
 * Singleton instance
 */
let filingServiceInstance: FilingService | null = null

/**
 * Get or create filing service instance
 */
export function getFilingService(): FilingService {
  if (!filingServiceInstance) {
    filingServiceInstance = new FilingService()
  }
  return filingServiceInstance
}

/**
 * Create new filing service instance (for testing)
 */
export function createFilingService(sedarApiKey?: string, cik?: string): FilingService {
  return new FilingService(sedarApiKey, cik)
}

export default FilingService
