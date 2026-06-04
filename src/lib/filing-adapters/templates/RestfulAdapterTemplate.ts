/**
 * RESTFUL API ADAPTER TEMPLATE
 * =============================
 * Complete template for integrating with RESTful filing authorities
 *
 * Use this template when the regulatory authority provides standard HTTP/HTTPS APIs
 * with JSON request/response format. Common examples:
 * - Japan TSE (Tokyo Stock Exchange)
 * - Singapore SGX (Singapore Exchange)
 * - Australia ASX (Australian Securities Exchange)
 * - Hong Kong HKEX
 * - India NSE/BSE
 *
 * IMPLEMENTATION TIME: ~4 hours for a new country
 * DIFFICULTY: Low-Medium (straightforward REST patterns)
 *
 * =============================
 * CUSTOMIZATION CHECKLIST:
 * =============================
 * [ ] 1. Update CLASS_NAME to your country adapter (e.g., JapanTSEAdapter)
 * [ ] 2. Update adapterName property (e.g., 'japan-tse')
 * [ ] 3. Update API endpoint URLs (look for TODO: CUSTOMIZE sections)
 * [ ] 4. Define supported forms/document types for your country
 * [ ] 5. Implement required document validation logic
 * [ ] 6. Add country-specific error codes and handling
 * [ ] 7. Configure webhook signature verification
 * [ ] 8. Add environment variables to .env.example
 * [ ] 9. Create environment-specific configuration
 * [ ] 10. Write unit tests (copy from BaseFilingAdapter.test.ts)
 *
 * REAL EXAMPLE COUNTRIES:
 * =============================
 * - Japan (TSE): https://www.jpx.co.jp/english/
 * - Singapore (SGX): https://www.sgx.com/
 * - Australia (ASX): https://www.asx.com.au/
 * - Hong Kong (HKEX): https://www.hkex.com.hk/
 * - Malaysia (Bursa): https://www.bursamalaysia.com/
 */

import { BaseFilingAdapter, FilingError } from '../BaseFilingAdapter';
import type {
  DocumentMetadata,
  ValidationResult,
  SubmissionResult,
  FilingStatus,
  StatusUpdate,
  AuthCredentials,
  DocumentType,
  FilingMetadata,
} from '../BaseFilingAdapter';
import crypto from 'crypto';

// ============================================================================
// TODO: CUSTOMIZE - TYPE DEFINITIONS FOR YOUR COUNTRY
// ============================================================================

/**
 * Supported forms/filing types for this regulatory authority
 * EXAMPLE: Replace with actual forms from your jurisdiction
 */
export type CountryFilingForm =
  | 'PROSPECTUS'      // Main prospectus filing
  | 'FINANCIAL_STMT'  // Financial statements
  | 'AMENDMENT'       // Amendment to existing filing
  | 'WITHDRAWAL'      // Filing withdrawal request
  | 'SUPPLEMENTARY';  // Supplementary documents

/**
 * Filing submission stages - maps to regulatory workflow
 * Each country has its own status progression
 */
export type FilingStage =
  | 'pending'         // Submitted, awaiting initial review
  | 'reviewing'       // Under regulatory review
  | 'approved'        // Approved for trading
  | 'rejected'        // Rejected with feedback
  | 'withdrawn'       // Applicant withdrew submission
  | 'effective';      // Trading has commenced

/**
 * Country-specific rejection/comment codes
 * Document these for your jurisdiction
 */
export enum CountryRejectionCode {
  MISSING_DOCUMENTS = 'MISSING_DOCUMENTS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  COMPLIANCE_ISSUE = 'COMPLIANCE_ISSUE',
  FINANCIAL_DISCLOSURE = 'FINANCIAL_DISCLOSURE',
  GOVERNANCE_ISSUE = 'GOVERNANCE_ISSUE',
  MATERIAL_CHANGE = 'MATERIAL_CHANGE',
  CORPORATE_ACTION = 'CORPORATE_ACTION',
  OTHER = 'OTHER',
}

/**
 * Country-specific filing configuration
 * Customize based on what information is required for your jurisdiction
 */
export interface CountryFilingConfig {
  // TODO: CUSTOMIZE - Add country-specific config fields
  companyRegistrationId: string;  // Company ID in this jurisdiction (e.g., CIK for US, ACN for Australia)
  companyName: string;
  jurisdiction: string;           // The specific country code
  submittingAgentName: string;
  submittingAgentEmail: string;
  submittingAgentPhone?: string;
  filingType: CountryFilingForm;
  filingFeeAmount?: number;        // Some jurisdictions require filing fees
  filingFeeCurrency?: string;      // Currency code (JPY, SGD, AUD, etc.)
  additionalMetadata?: Record<string, any>;
}

/**
 * API response from submission endpoint
 * Standardized but customize based on actual API response structure
 */
export interface SubmissionApiResponse {
  filingId: string;
  referenceNumber: string;
  timestamp: string;
  status: FilingStage;
  accessionNumber?: string;        // Some jurisdictions use accession numbers
  estimatedProcessingTimeMs?: number;
  submissionUrl?: string;
  errorMessages?: string[];
}

/**
 * API response for status queries
 */
export interface StatusApiResponse {
  filingId: string;
  referenceNumber: string;
  status: FilingStage;
  lastUpdated: string;
  comments?: Array<{
    date: string;
    commentType: string;
    content: string;
    actionRequired?: boolean;
  }>;
  rejectionReasons?: string[];
}

/**
 * Webhook payload structure
 * Customize based on what your regulatory authority sends
 */
export interface WebhookPayload {
  event: string;
  filingId: string;
  referenceNumber: string;
  previousStatus: FilingStage;
  newStatus: FilingStage;
  timestamp: string;
  details?: Record<string, any>;
  signature?: string;
  signatureAlgorithm?: string;
}

// ============================================================================
// TODO: CUSTOMIZE - REST ADAPTER IMPLEMENTATION
// ============================================================================

/**
 * Country-Specific Filing Adapter (REST API Pattern)
 *
 * This adapter handles all interactions with the regulatory authority's API
 * for a specific country. Each method represents a key workflow step.
 *
 * LIFECYCLE:
 * 1. setCredentials() - Configure authentication
 * 2. validate() - Validate documents locally
 * 3. submit() - Upload documents to regulatory authority
 * 4. getStatus() - Poll for status updates (or listen to webhooks)
 * 5. handleWebhook() - Process status notifications from regulatory authority
 */
export class RestfulAdapterTemplate extends BaseFilingAdapter {
  // ========================================================================
  // ADAPTER METADATA
  // ========================================================================

  protected adapterName = 'restful-adapter-template';  // TODO: CUSTOMIZE (e.g., 'japan-tse')

  /**
   * TODO: CUSTOMIZE - API Endpoint Configuration
   * Replace with actual API URLs from your regulatory authority
   *
   * Example patterns:
   * - Production: https://api.sgx.com/filings/v2
   * - Staging: https://staging-api.sgx.com/filings/v2
   * - Sandbox: https://sandbox-api.sgx.com/filings/v2
   */
  private apiBaseUrl: string = process.env.COUNTRY_API_BASE_URL ||
    'https://api.example-regulator.com/v2';  // CUSTOMIZE THIS

  private apiEndpoints = {
    // Submit new filing
    submit: '/filings/submit',                  // CUSTOMIZE
    // Get filing status by ID
    getStatus: '/filings/{filingId}/status',   // CUSTOMIZE
    // Get filing documents
    getDocuments: '/filings/{filingId}/documents', // CUSTOMIZE
    // Update filing (amendments)
    update: '/filings/{filingId}/update',      // CUSTOMIZE
    // Withdraw filing
    withdraw: '/filings/{filingId}/withdraw',  // CUSTOMIZE
  };

  // Filing config for this adapter instance
  private countryConfig?: CountryFilingConfig;

  // Supported filing forms
  private readonly supportedForms: CountryFilingForm[] = [
    'PROSPECTUS',
    'FINANCIAL_STMT',
    'AMENDMENT',
    'WITHDRAWAL',
    'SUPPLEMENTARY',
  ];

  // Required documents that must be present
  private readonly requiredDocuments: DocumentType[] = [
    'prospectus',
    'financial_statements',
    'auditor_report',
    'legal_opinion',
  ];

  // ========================================================================
  // INITIALIZATION & CONFIGURATION
  // ========================================================================

  constructor(config?: CountryFilingConfig) {
    super();
    this.countryConfig = config;
    this.logInfo('Adapter initialized', {
      jurisdiction: config?.jurisdiction,
      filingType: config?.filingType
    });
  }

  /**
   * Set country-specific configuration
   * Call this after instantiation if not provided in constructor
   */
  setCountryConfig(config: CountryFilingConfig): void {
    this.countryConfig = config;
    this.logInfo('Country configuration updated', {
      jurisdiction: config.jurisdiction
    });
  }

  // ========================================================================
  // VALIDATION - LOCAL DOCUMENT VALIDATION BEFORE SUBMISSION
  // ========================================================================

  /**
   * STEP 1: Validate documents locally before submitting to regulatory authority
   *
   * This validates:
   * - All required documents are present
   * - Document formats are supported
   * - File sizes are within limits
   * - Document content passes regulatory compliance checks
   * - Checksums match
   *
   * IMPORTANT: This is a LOCAL validation. The regulatory authority will also
   * validate documents when received, potentially rejecting for reasons we
   * didn't catch here. Document those in error handling.
   */
  async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: Array<{
      documentId: string;
      documentType: DocumentType;
      field?: string;
      code: string;
      message: string;
      severity: 'error' | 'warning';
    }> = [];
    const warnings: string[] = [];

    try {
      this.logInfo('Starting document validation', {
        documentCount: documents.length
      });

      // Step 1: Validate required documents are present
      try {
        this.validateDocumentsPresent(documents);
      } catch (error) {
        if (error instanceof FilingError) {
          errors.push({
            documentId: '',
            documentType: 'prospectus',
            code: error.code,
            message: error.message,
            severity: 'error',
          });
        }
      }

      // Step 2: Validate each document individually
      for (const doc of documents) {
        try {
          this.validateDocumentFormat(doc);

          // TODO: CUSTOMIZE - Add country-specific validation
          // Example: Check if prospectus contains required disclosures
          if (doc.type === 'prospectus') {
            await this.validateProspectusContent(doc);
          }

          // Example: Validate financial statements format
          if (doc.type === 'financial_statements') {
            await this.validateFinancialStatementsFormat(doc);
          }

          // Validate document checksum
          const checksumValid = await this.validateDocumentChecksum(doc);
          if (!checksumValid) {
            errors.push({
              documentId: doc.id,
              documentType: doc.type,
              code: 'CHECKSUM_MISMATCH',
              message: 'Document checksum validation failed - file may be corrupted',
              severity: 'error',
            });
          }

          // Check file size limits (example: 50MB per document)
          if (doc.size > 50 * 1024 * 1024) {
            warnings.push(
              `Document ${doc.fileName} exceeds recommended size (${doc.size} bytes)`
            );
          }
        } catch (error) {
          if (error instanceof FilingError) {
            errors.push({
              documentId: doc.id,
              documentType: doc.type,
              code: error.code,
              message: error.message,
              severity: 'error',
            });
          }
        }
      }

      // Step 3: Regulatory-specific validation rules
      await this.validateRegulatoryCompliance(documents, warnings);

      const processingTimeMs = Date.now() - startTime;
      const isValid = errors.filter(e => e.severity === 'error').length === 0;

      this.logInfo('Validation completed', {
        isValid,
        errorCount: errors.length,
        processingTimeMs,
      });

      return {
        isValid,
        phase: 'validation',
        errors,
        warnings,
        documentStatuses: new Map(),
        completedAt: new Date(),
        processingTimeMs,
      };
    } catch (error) {
      this.logError('Validation failed with exception', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new FilingError(
        'VALIDATION_FAILED',
        `Document validation failed: ${error instanceof Error ? error.message : String(error)}`,
        false,
        500,
        { phase: 'validation' }
      );
    }
  }

  /**
   * TODO: CUSTOMIZE - Validate prospectus content
   * Add jurisdiction-specific prospectus validation
   */
  private async validateProspectusContent(doc: DocumentMetadata): Promise<void> {
    // Example validation rules:
    // - Check for required sections (MD&A, Risk Factors, etc.)
    // - Verify language requirements
    // - Validate document length
    // - Check for incomplete sections marked with TODO/TBD
    this.logDebug('Validating prospectus content', { documentId: doc.id });
    // Add your custom validation logic here
  }

  /**
   * TODO: CUSTOMIZE - Validate financial statements format
   * Check financial statements comply with local GAAP/IFRS requirements
   */
  private async validateFinancialStatementsFormat(doc: DocumentMetadata): Promise<void> {
    this.logDebug('Validating financial statements format', { documentId: doc.id });
    // Add your custom validation logic here
    // Examples:
    // - Check for XBRL compliance (if required)
    // - Verify financial statement periods match expectations
    // - Validate accounting standards used (IFRS vs local GAAP)
  }

  /**
   * TODO: CUSTOMIZE - Validate regulatory compliance
   * Country-specific regulatory compliance checks
   */
  private async validateRegulatoryCompliance(
    documents: DocumentMetadata[],
    warnings: string[]
  ): Promise<void> {
    // Example validations for different jurisdictions:

    // Singapore (SGX): Check for SGX-specific disclosures
    if (this.countryConfig?.jurisdiction === 'SG') {
      const hasGovernanceDoc = documents.some(d => d.type === 'corporate_governance');
      if (!hasGovernanceDoc) {
        warnings.push('Singapore requires corporate governance disclosures');
      }
    }

    // Australia (ASX): Check ASX corporate governance disclosures
    if (this.countryConfig?.jurisdiction === 'AU') {
      const hasExecutiveCompDoc = documents.some(d => d.type === 'executive_compensation');
      if (!hasExecutiveCompDoc) {
        warnings.push('Australia (ASX) requires executive compensation disclosure');
      }
    }

    // Add more jurisdiction-specific rules as needed
  }

  // ========================================================================
  // SUBMISSION - SUBMIT TO REGULATORY AUTHORITY
  // ========================================================================

  /**
   * STEP 2: Submit documents to regulatory authority
   *
   * This method:
   * 1. Validates credentials and config
   * 2. Prepares documents for transmission
   * 3. Makes HTTP request to regulatory API
   * 4. Handles response and extracts filing ID
   * 5. Implements retry logic with exponential backoff
   * 6. Returns submission confirmation or throws error
   *
   * IMPORTANT: Check regulatory authority's API documentation for:
   * - Maximum payload size
   * - Supported file formats
   * - Required headers
   * - Rate limits
   * - Timeout specifications
   */
  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    const startTime = Date.now();

    try {
      this.validateCredentials();

      if (!this.countryConfig) {
        throw new FilingError(
          'CONFIG_MISSING',
          'Country configuration not set',
          false,
          400
        );
      }

      this.logInfo('Starting document submission', {
        companyId: metadata.companyId,
        filingType: this.countryConfig.filingType,
        documentCount: documents.length,
      });

      // Use retry wrapper for resilience (handles transient failures)
      const result = await this.withRetry(
        () => this.submitDocumentsToApi(documents, metadata),
        'submitDocumentsToApi'
      );

      const submissionTimeMs = Date.now() - startTime;
      this.logInfo('Submission successful', {
        filingId: result.filingId,
        referenceNumber: result.referenceNumber,
        submissionTimeMs,
      });

      return result;
    } catch (error) {
      this.logError('Submission failed', {
        error: error instanceof Error ? error.message : String(error),
        companyId: metadata.companyId,
      });

      // Re-throw if already a FilingError, otherwise wrap
      if (error instanceof FilingError) {
        throw error;
      }

      throw new FilingError(
        'SUBMISSION_FAILED',
        `Failed to submit documents: ${error instanceof Error ? error.message : String(error)}`,
        true, // Retryable
        500,
        { documentCount: documents.length }
      );
    }
  }

  /**
   * TODO: CUSTOMIZE - Internal method to make API submission request
   * Handles HTTP communication with regulatory authority
   */
  private async submitDocumentsToApi(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    // Step 1: Prepare request payload
    const requestPayload = {
      // TODO: CUSTOMIZE - Map to your regulatory authority's API schema
      companyId: this.countryConfig!.companyRegistrationId,
      companyName: metadata.companyName,
      filingType: this.countryConfig!.filingType,
      jurisdiction: this.countryConfig!.jurisdiction,
      submittedBy: metadata.submittedBy,
      submittedAt: new Date().toISOString(),
      filingFeeAmount: this.countryConfig!.filingFeeAmount,
      currency: this.countryConfig!.filingFeeCurrency || 'USD',
      documents: documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        format: doc.format,
        size: doc.size,
        checksum: doc.checksum,
        // Content is uploaded separately or included as base64
      })),
    };

    // Step 2: Build request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `IPOReady/1.0 (Filing Adapter)`,
      ...this.buildAuthHeaders(),
    };

    // TODO: CUSTOMIZE - Add any custom headers required by your API
    // Example: headers['X-API-Version'] = '2.0';

    this.logDebug('Submitting to API', {
      endpoint: `${this.apiBaseUrl}${this.apiEndpoints.submit}`,
      payloadSize: JSON.stringify(requestPayload).length,
    });

    // Step 3: Make HTTP POST request
    // Using dynamic import to avoid hard dependency on fetch
    const response = await this.makeApiRequest(
      'POST',
      `${this.apiBaseUrl}${this.apiEndpoints.submit}`,
      requestPayload,
      headers
    );

    // Step 4: Parse and validate response
    if (!response.ok) {
      const errorText = await response.text();
      this.logError('API submission failed', {
        statusCode: response.status,
        statusText: response.statusText,
        errorResponse: errorText.substring(0, 500),
      });

      throw new FilingError(
        'API_SUBMISSION_FAILED',
        `Regulatory API returned ${response.status}: ${response.statusText}`,
        this.isRetryableStatusCode(response.status),
        response.status,
        { endpoint: this.apiEndpoints.submit }
      );
    }

    // Parse response body
    const responseData: SubmissionApiResponse = await response.json();

    // Step 5: Extract and return submission details
    return {
      success: true,
      filingId: responseData.filingId,
      referenceNumber: responseData.referenceNumber,
      status: responseData.status,
      submittedAt: new Date(responseData.timestamp),
      estimatedProcessingTime: responseData.estimatedProcessingTimeMs,
      submissionUrl: responseData.submissionUrl,
      documentReceiptIds: new Map(
        documents.map(doc => [doc.type, `${responseData.filingId}-${doc.id}`])
      ),
      warnings: responseData.errorMessages || [],
    };
  }

  // ========================================================================
  // STATUS TRACKING - POLL FOR FILING STATUS
  // ========================================================================

  /**
   * STEP 3: Get current filing status from regulatory authority
   *
   * Query the regulatory authority's API for the current status of a filing.
   * Useful for:
   * - Dashboard display of filing progress
   * - Polling if webhooks are unavailable
   * - Verifying filing acceptance
   * - Retrieving regulatory comments/feedback
   *
   * Common status progression:
   * pending → reviewing → (approved | rejected | withdrawn)
   */
  async getStatus(filingId: string): Promise<FilingStatus> {
    try {
      this.validateCredentials();

      this.logDebug('Fetching filing status', { filingId });

      // TODO: CUSTOMIZE - Update endpoint based on your API
      const endpoint = this.apiEndpoints.getStatus.replace('{filingId}', filingId);
      const headers = this.buildAuthHeaders();

      const response = await this.makeApiRequest(
        'GET',
        `${this.apiBaseUrl}${endpoint}`,
        null,
        headers
      );

      if (!response.ok) {
        throw new FilingError(
          'STATUS_FETCH_FAILED',
          `Failed to fetch status: ${response.statusText}`,
          true,
          response.status
        );
      }

      const statusData: StatusApiResponse = await response.json();

      // TODO: CUSTOMIZE - Map API response to FilingStatus
      return {
        filingId: statusData.filingId,
        referenceNumber: statusData.referenceNumber,
        status: this.mapApiStatusToFilingStatus(statusData.status),
        phase: 'submission',
        lastUpdatedAt: new Date(statusData.lastUpdated),
        reviewComments: statusData.comments?.map(c => c.content) || [],
        rejectionReasons: statusData.rejectionReasons || [],
        nextRequiredAction: this.getNextAction(statusData.status),
      };
    } catch (error) {
      this.logError('Status fetch failed', {
        filingId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof FilingError) {
        throw error;
      }

      throw new FilingError(
        'STATUS_FETCH_ERROR',
        `Error fetching filing status: ${error instanceof Error ? error.message : String(error)}`,
        true,
        500
      );
    }
  }

  /**
   * TODO: CUSTOMIZE - Map API status codes to internal FilingStatus
   * Each regulatory authority uses different status terminology
   */
  private mapApiStatusToFilingStatus(
    apiStatus: FilingStage
  ): 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn' {
    const statusMap: Record<FilingStage, any> = {
      'pending': 'submitted',
      'reviewing': 'processing',
      'approved': 'accepted',
      'rejected': 'rejected',
      'withdrawn': 'withdrawn',
      'effective': 'accepted',
    };
    return statusMap[apiStatus] || 'processing';
  }

  /**
   * TODO: CUSTOMIZE - Determine next required action based on status
   * Provide guidance to user on what to do next
   */
  private getNextAction(status: FilingStage): string | undefined {
    const actions: Record<FilingStage, string | undefined> = {
      'pending': 'Awaiting initial review - check back in 5-10 business days',
      'reviewing': 'Under regulatory review - do not submit amendments unless requested',
      'approved': 'Filing approved! Trading approval pending',
      'effective': 'Trading has commenced',
      'rejected': 'Review rejection reasons and submit amendment',
      'withdrawn': undefined,
    };
    return actions[status];
  }

  // ========================================================================
  // WEBHOOK HANDLING - REAL-TIME STATUS UPDATES
  // ========================================================================

  /**
   * STEP 4: Handle webhook notifications from regulatory authority
   *
   * When filings reach milestones (approval, rejection, etc.), the regulatory
   * authority will POST to your webhook endpoint. This method processes those
   * notifications.
   *
   * SECURITY: Always verify webhook signatures to prevent spoofing.
   *
   * WEBHOOK SETUP:
   * 1. Generate webhook secret in regulatory authority's portal
   * 2. Store in environment variable (COUNTRY_WEBHOOK_SECRET)
   * 3. Provide webhook URL to regulatory authority (usually in settings portal)
   *    Example: https://yourdomain.com/api/filing/webhooks/country
   * 4. Handle webhook signature verification in verifyWebhookSignature()
   */
  async handleWebhook(payload: any): Promise<StatusUpdate> {
    try {
      // Verify webhook came from regulatory authority (prevents spoofing)
      if (payload.signature) {
        const webhookSecret = process.env.COUNTRY_WEBHOOK_SECRET;
        if (!webhookSecret) {
          throw new FilingError(
            'WEBHOOK_SECRET_MISSING',
            'Webhook secret not configured',
            false,
            500
          );
        }

        const isValid = this.verifyWebhookSignature(
          payload,
          payload.signature,
          webhookSecret
        );

        if (!isValid) {
          this.logWarn('Webhook signature verification failed', {
            filingId: payload.filingId,
          });
          throw new FilingError(
            'WEBHOOK_SIGNATURE_INVALID',
            'Webhook signature verification failed',
            false,
            401
          );
        }
      }

      this.logInfo('Webhook received', {
        filingId: payload.filingId,
        event: payload.event,
        newStatus: payload.newStatus,
      });

      // TODO: CUSTOMIZE - Map webhook payload to StatusUpdate
      return {
        filingId: payload.filingId,
        referenceNumber: payload.referenceNumber,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
        updatedAt: new Date(payload.timestamp),
        details: payload.details,
      };
    } catch (error) {
      this.logError('Webhook handling failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof FilingError) {
        throw error;
      }

      throw new FilingError(
        'WEBHOOK_PROCESSING_FAILED',
        `Failed to process webhook: ${error instanceof Error ? error.message : String(error)}`,
        false,
        500
      );
    }
  }

  /**
   * TODO: CUSTOMIZE - Verify webhook signature
   * Each regulatory authority uses different signature algorithms
   *
   * COMMON PATTERNS:
   * 1. HMAC-SHA256: signature = HMAC-SHA256(payload, secret)
   * 2. RSA: signature = RSA-SHA256(payload, private_key)
   * 3. Ed25519: Modern alternative using elliptic curves
   *
   * EXAMPLE IMPLEMENTATION (HMAC-SHA256):
   *
   *   const expectedSignature = crypto
   *     .createHmac('sha256', secret)
   *     .update(JSON.stringify(payload))
   *     .digest('hex');
   *   return expectedSignature === signature;
   */
  protected verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): boolean {
    try {
      // TODO: CUSTOMIZE - Implement signature verification for your regulatory authority
      // This is a HMAC-SHA256 example - replace with actual algorithm
      const payloadString = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      this.logError('Webhook signature verification error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  // ========================================================================
  // ADAPTER METADATA & CONFIGURATION
  // ========================================================================

  /**
   * Get list of required documents for this jurisdiction
   *
   * Different regulatory authorities require different documents.
   * Customize this list for your country.
   */
  getRequiredDocuments(): DocumentType[] {
    return this.requiredDocuments;
  }

  /**
   * Get adapter configuration and supported forms
   * Used for UI to show available filing options
   */
  getAdapterConfig(): Record<string, any> {
    return {
      adapterName: this.adapterName,
      jurisdiction: this.countryConfig?.jurisdiction || 'UNKNOWN',
      supportedForms: this.supportedForms,
      requiredDocuments: this.requiredDocuments,
      apiBaseUrl: this.apiBaseUrl,
      webhookEndpoint: '/api/filing/webhooks/country', // TODO: CUSTOMIZE
      requiresFilingFee: this.countryConfig?.filingFeeAmount !== undefined,
      filingFeeAmount: this.countryConfig?.filingFeeAmount,
      filingFeeCurrency: this.countryConfig?.filingFeeCurrency,
      maxDocumentSizeBytes: 50 * 1024 * 1024, // 50MB per document
      maxSubmissionSizeBytes: 500 * 1024 * 1024, // 500MB total
      estimatedProcessingTime: '10-15 business days', // TODO: CUSTOMIZE
    };
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Make HTTP request with proper headers and error handling
   * Abstracted to handle both Node.js and browser environments
   */
  private async makeApiRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body: any,
    headers: Record<string, string>
  ): Promise<Response> {
    // Use dynamic import to avoid hard dependency
    const fetchFn = typeof fetch === 'undefined'
      ? (await import('node-fetch')).default
      : fetch;

    const options: any = {
      method,
      headers,
      timeout: 30000, // 30 second timeout
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    return fetchFn(url, options);
  }

  /**
   * Log helper method (uses base class logger)
   */
  private logDebug(message: string, context?: Record<string, any>): void {
    this.logDebug(message, context);
  }
}

export default RestfulAdapterTemplate;
