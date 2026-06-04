/**
 * BaseFilingAdapter - Abstract base class for all filing adapters
 * Provides common functionality, error handling, authentication, and document management
 * All country-specific adapters must extend this class
 */

// Optional: import type { Logger } from 'winston';
// For now, use any type to avoid hard dependency
type Logger = any;

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

export type DocumentFormat = 'xml' | 'json' | 'pdf' | 'text' | 'binary';
export type AuthMethod = 'api_key' | 'oauth2' | 'certificate' | 'basic_auth';
export type FilingPhase = 'validation' | 'submission' | 'confirmation' | 'finalization';

export enum DocumentType {
  PROSPECTUS = 'prospectus',
  FINANCIAL_STATEMENTS = 'financial_statements',
  AUDITOR_REPORT = 'auditor_report',
  LEGAL_OPINION = 'legal_opinion',
  RISK_DISCLOSURE = 'risk_disclosure',
  MANAGEMENT_BIOGRAPHY = 'management_biography',
  CORPORATE_GOVERNANCE = 'corporate_governance',
  EXECUTIVE_COMPENSATION = 'executive_compensation',
  UNDERWRITING_AGREEMENT = 'underwriting_agreement',
  PRICING_MEMO = 'pricing_memo',
}

/**
 * Document metadata for filing submissions
 */
export interface DocumentMetadata {
  id: string;
  type: DocumentType;
  format: DocumentFormat;
  fileName: string;
  mimeType: string;
  size: number; // bytes
  checksum: string; // SHA-256 hash
  version: string;
  createdAt: Date;
  updatedAt: Date;
  content?: Buffer | string | Record<string, any>;
  language?: string;
  encoding?: string;
  validated?: boolean;
  validationErrors?: string[];
}

/**
 * Filing validation result
 */
export interface ValidationResult {
  isValid: boolean;
  phase: FilingPhase;
  errors: ValidationError[];
  warnings: string[];
  documentStatuses: Map<string, DocumentValidationStatus>;
  completedAt: Date;
  processingTimeMs: number;
}

export interface ValidationError {
  documentId: string;
  documentType: DocumentType;
  field?: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface DocumentValidationStatus {
  documentId: string;
  documentType: DocumentType;
  isValid: boolean;
  errors: ValidationError[];
  checksum: string;
}

/**
 * Filing submission metadata
 */
export interface FilingMetadata {
  companyId: string;
  companyName: string;
  filingType: string;
  currencyCode: string;
  country: string;
  fiscalYearEnd?: Date;
  auditFirmName?: string;
  auditFirmId?: string;
  underwriterNames?: string[];
  prospectusFileId?: string;
  submittedBy: string;
  submittedAt?: Date;
  customMetadata?: Record<string, any>;
}

/**
 * Filing submission result
 */
export interface SubmissionResult {
  success: boolean;
  filingId: string;
  referenceNumber: string;
  status: string;
  submittedAt: Date;
  estimatedProcessingTime?: number; // milliseconds
  submissionUrl?: string;
  documentReceiptIds: Map<DocumentType, string>;
  warnings: string[];
}

/**
 * Filing status tracking
 */
export interface FilingStatus {
  filingId: string;
  referenceNumber: string;
  status: 'submitted' | 'processing' | 'accepted' | 'rejected' | 'withdrawn';
  phase: FilingPhase;
  lastUpdatedAt: Date;
  estimatedCompletionDate?: Date;
  reviewComments?: string[];
  rejectionReasons?: string[];
  nextRequiredAction?: string;
}

/**
 * Status update from webhook
 */
export interface StatusUpdate {
  filingId: string;
  referenceNumber: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: Date;
  details?: Record<string, any>;
}

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  method: AuthMethod;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  certificatePath?: string;
  certificatePassword?: string;
  username?: string;
  password?: string;
  expiresAt?: Date;
  customHeaders?: Record<string, string>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

// ====================================================================
// CUSTOM ERROR CLASS
// ====================================================================

export class FilingError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean = false,
    public statusCode?: number,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'FilingError';
    Object.setPrototypeOf(this, FilingError.prototype);
  }
}

// ====================================================================
// ABSTRACT BASE CLASS
// ====================================================================

export abstract class BaseFilingAdapter {
  protected adapterName: string = 'BaseFilingAdapter';
  protected credentials: AuthCredentials | null = null;
  protected logger: Logger | null = null;
  protected retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };

  constructor() {
    // Initialize in subclasses
  }

  /**
   * Set authentication credentials
   */
  setCredentials(credentials: AuthCredentials): void {
    this.credentials = credentials;
    this.logDebug('Credentials set', { method: credentials.method });
  }

  /**
   * Set logger instance
   */
  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * Set retry configuration
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Validate credentials are present
   */
  protected validateCredentials(): void {
    if (!this.credentials) {
      throw new FilingError(
        'AUTH_MISSING',
        'Credentials not configured',
        false,
        401,
        { adapter: this.adapterName },
      );
    }
  }

  /**
   * Validate documents are present and of valid types
   */
  protected validateDocumentsPresent(documents: DocumentMetadata[]): void {
    if (!documents || documents.length === 0) {
      throw new FilingError(
        'DOCUMENTS_EMPTY',
        'No documents provided for validation',
        false,
        400,
        { adapter: this.adapterName },
      );
    }

    const required = this.getRequiredDocuments();
    const provided = new Set(documents.map((d) => d.type));

    for (const requiredType of required) {
      if (!provided.has(requiredType)) {
        throw new FilingError(
          'DOCUMENT_MISSING',
          `Required document missing: ${requiredType}`,
          false,
          400,
          { missingType: requiredType, adapter: this.adapterName },
        );
      }
    }
  }

  /**
   * ABSTRACT: Validate documents for submission
   * Implementation must check document format, content, and regulatory compliance
   */
  abstract validate(
    documents: DocumentMetadata[],
  ): Promise<ValidationResult>;

  /**
   * ABSTRACT: Submit documents to regulatory authority
   * Implementation must handle API communication and error recovery
   */
  abstract submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
  ): Promise<SubmissionResult>;

  /**
   * ABSTRACT: Get current filing status
   * Implementation must query the regulatory authority's system
   */
  abstract getStatus(filingId: string): Promise<FilingStatus>;

  /**
   * ABSTRACT: Process webhook payload from regulatory authority
   * Implementation must verify webhook signature and extract status
   */
  abstract handleWebhook(payload: any): Promise<StatusUpdate>;

  /**
   * ABSTRACT: Get required documents for this filing type
   * Each adapter must specify which documents are mandatory
   */
  abstract getRequiredDocuments(): DocumentType[];

  /**
   * ABSTRACT: Get adapter-specific configuration
   * Implementations should return their regulatory API endpoints, etc.
   */
  abstract getAdapterConfig(): Record<string, any>;

  /**
   * Exponential backoff delay calculation
   */
  protected calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.initialDelayMs *
        Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelayMs,
    );
    // Add jitter to prevent thundering herd
    const jitter = delay * 0.1 * Math.random();
    return Math.floor(delay + jitter);
  }

  /**
   * Retry wrapper for async operations with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.logDebug(`Executing ${operationName}`, { attempt });
        return await operation();
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(String(error));

        const isFilingError = error instanceof FilingError;
        const shouldRetry =
          isFilingError &&
          error.retryable &&
          attempt < this.retryConfig.maxRetries;

        this.logWarn(
          `Operation ${operationName} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`,
          {
            error: lastError.message,
            retryable: shouldRetry,
            statusCode:
              isFilingError && error.statusCode ? error.statusCode : undefined,
          },
        );

        if (!shouldRetry) {
          break;
        }

        const delay = this.calculateBackoffDelay(attempt);
        this.logDebug(`Retrying after ${delay}ms`, { operationName });
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Verify webhook signature (to be implemented by subclasses)
   */
  protected verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string,
  ): boolean {
    // Override in subclass with provider-specific signature verification
    // Example: HMAC-SHA256 verification
    this.logDebug('Webhook signature verification not implemented in base class');
    return false;
  }

  /**
   * Parse document format (XML, JSON, PDF, text, binary)
   */
  protected parseDocument(
    content: Buffer | string,
    format: DocumentFormat,
  ): Record<string, any> | null {
    try {
      switch (format) {
        case 'json':
          return typeof content === 'string'
            ? JSON.parse(content)
            : JSON.parse(content.toString('utf-8'));

        case 'xml':
          // Basic XML detection; real parsing requires xml2js or similar
          if (
            typeof content === 'string' ||
            content.toString().includes('<?xml')
          ) {
            this.logDebug('XML format detected but parsing requires xml2js');
            return null;
          }
          return null;

        case 'pdf':
        case 'binary':
          // Binary formats handled by subclasses
          return null;

        case 'text':
          return {
            raw: typeof content === 'string' ? content : content.toString(),
          };

        default:
          return null;
      }
    } catch (error) {
      this.logError('Document parsing failed', {
        format,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Generate document checksum (SHA-256)
   */
  protected async generateChecksum(
    content: Buffer | string | Record<string, any>,
  ): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');

    if (typeof content === 'string') {
      hash.update(content, 'utf-8');
    } else if (Buffer.isBuffer(content)) {
      hash.update(content);
    } else {
      // Convert object to JSON string
      hash.update(JSON.stringify(content), 'utf-8');
    }

    return hash.digest('hex');
  }

  /**
   * Build authentication headers based on configured method
   */
  protected buildAuthHeaders(): Record<string, string> {
    this.validateCredentials();

    if (!this.credentials) {
      throw new FilingError('AUTH_INVALID', 'Credentials not available', false);
    }

    const headers: Record<string, string> = {};

    switch (this.credentials.method) {
      case 'api_key':
        if (!this.credentials.apiKey) {
          throw new FilingError(
            'AUTH_INVALID',
            'API key not configured',
            false,
          );
        }
        headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
        break;

      case 'oauth2':
        if (!this.credentials.accessToken) {
          throw new FilingError(
            'AUTH_INVALID',
            'OAuth2 access token not available',
            false,
          );
        }
        headers['Authorization'] = `Bearer ${this.credentials.accessToken}`;
        break;

      case 'basic_auth':
        if (!this.credentials.username || !this.credentials.password) {
          throw new FilingError(
            'AUTH_INVALID',
            'Basic auth credentials not configured',
            false,
          );
        }
        const encoded = Buffer.from(
          `${this.credentials.username}:${this.credentials.password}`,
        ).toString('base64');
        headers['Authorization'] = `Basic ${encoded}`;
        break;

      case 'certificate':
        // Certificate auth typically handled at TLS level by subclass
        break;

      default:
        throw new FilingError(
          'AUTH_METHOD_UNSUPPORTED',
          `Authentication method not supported: ${this.credentials.method}`,
          false,
        );
    }

    // Add custom headers if provided
    if (this.credentials.customHeaders) {
      Object.assign(headers, this.credentials.customHeaders);
    }

    return headers;
  }

  /**
   * Determine if an HTTP status code is retryable
   */
  protected isRetryableStatusCode(statusCode: number): boolean {
    return this.retryConfig.retryableStatusCodes.includes(statusCode);
  }

  /**
   * Log debug message
   */
  protected logDebug(message: string, context?: Record<string, any>): void {
    if (this.logger) {
      this.logger.debug(message, {
        adapter: this.adapterName,
        ...context,
      });
    }
  }

  /**
   * Log info message
   */
  protected logInfo(message: string, context?: Record<string, any>): void {
    if (this.logger) {
      this.logger.info(message, {
        adapter: this.adapterName,
        ...context,
      });
    }
  }

  /**
   * Log warning message
   */
  protected logWarn(message: string, context?: Record<string, any>): void {
    if (this.logger) {
      this.logger.warn(message, {
        adapter: this.adapterName,
        ...context,
      });
    }
  }

  /**
   * Log error message
   */
  protected logError(message: string, context?: Record<string, any>): void {
    if (this.logger) {
      this.logger.error(message, {
        adapter: this.adapterName,
        ...context,
      });
    }
  }

  /**
   * Validate document format and encoding
   */
  protected validateDocumentFormat(doc: DocumentMetadata): void {
    const validFormats: DocumentFormat[] = [
      'xml',
      'json',
      'pdf',
      'text',
      'binary',
    ];
    if (!validFormats.includes(doc.format)) {
      throw new FilingError(
        'INVALID_FORMAT',
        `Unsupported document format: ${doc.format}`,
        false,
        400,
        { documentId: doc.id, format: doc.format },
      );
    }

    if (!doc.content) {
      throw new FilingError(
        'EMPTY_DOCUMENT',
        `Document has no content: ${doc.id}`,
        false,
        400,
        { documentId: doc.id },
      );
    }
  }

  /**
   * Validate document checksum integrity
   */
  protected async validateDocumentChecksum(
    doc: DocumentMetadata,
  ): Promise<boolean> {
    if (!doc.content) {
      return false;
    }

    const calculatedChecksum = await this.generateChecksum(
      doc.content as Buffer | string | Record<string, any>,
    );
    return calculatedChecksum === doc.checksum;
  }

  /**
   * Prepare document for transmission (encoding, compression, etc.)
   */
  protected prepareDocumentForTransmission(
    doc: DocumentMetadata,
  ): Buffer | string {
    if (typeof doc.content === 'string') {
      return doc.content;
    }
    if (Buffer.isBuffer(doc.content)) {
      return doc.content;
    }
    // Convert object to JSON string for transmission
    return JSON.stringify(doc.content);
  }

  /**
   * Get adapter version
   */
  getAdapterVersion(): string {
    return '1.0.0';
  }

  /**
   * Health check for adapter connectivity
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    message: string;
    lastCheckedAt: Date;
  }> {
    try {
      this.validateCredentials();
      this.logInfo('Health check passed');
      return {
        isHealthy: true,
        message: 'Adapter is healthy',
        lastCheckedAt: new Date(),
      };
    } catch (error) {
      this.logError('Health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        isHealthy: false,
        message:
          error instanceof Error ? error.message : 'Health check failed',
        lastCheckedAt: new Date(),
      };
    }
  }
}

export default BaseFilingAdapter;
