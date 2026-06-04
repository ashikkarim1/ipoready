/**
 * Filing System Types
 * TypeScript definitions for regulatory filing management across exchanges
 * Designed for extensibility and integration with multiple filing systems
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Filing system operational status
 */
export enum FilingSystemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TESTING = 'testing',
  DEPRECATED = 'deprecated',
  MAINTENANCE = 'maintenance',
}

/**
 * Filing lifecycle status
 * Represents complete workflow from creation through submission to archival
 */
export enum FilingStatus {
  DRAFT = 'draft',
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  FAILED = 'failed',
  ARCHIVED = 'archived',
  SUPERSEDED = 'superseded',
}

/**
 * Document validation outcomes
 */
export enum DocumentValidationStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  VALID = 'valid',
  INVALID = 'invalid',
  WARNING = 'warning',
  NOT_REQUIRED = 'not_required',
}

/**
 * Authentication methods supported by filing systems
 */
export enum FilingAuthMethod {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  BASIC_AUTH = 'basic_auth',
  CERTIFICATE = 'certificate',
  CUSTOM_TOKEN = 'custom_token',
  TWO_FACTOR = 'two_factor',
}

/**
 * Filing system webhook event types
 */
export enum FilingWebhookEventType {
  FILING_ACCEPTED = 'filing_accepted',
  FILING_REJECTED = 'filing_rejected',
  DOCUMENT_SCANNED = 'document_scanned',
  STATUS_CHANGED = 'status_changed',
  SUBMISSION_COMPLETE = 'submission_complete',
}

/**
 * Status log trigger types
 */
export enum StatusLogTriggerType {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  API_CALLBACK = 'api_callback',
  SCHEDULED_TASK = 'scheduled_task',
}

/**
 * Batch submission status
 */
export enum FilingBatchStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PARTIALLY_FAILED = 'partially_failed',
  FAILED = 'failed',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Filing System Registry Entry
 * Defines a supported regulatory filing system with extensible configuration
 */
export interface FilingSystem {
  id: string;

  // Identification
  name: string;                    // e.g., "TSX Filing System", "SEC EDGAR"
  country: string;                 // e.g., "Canada", "USA"
  exchange: string;                // e.g., "tsx", "nasdaq", "nyse"
  listingType?: string;            // Optional: "ipo", "rto", "direct_listing"

  // Adapter Configuration
  adapterClass: string;            // Fully qualified class name
  apiEndpoint?: string;            // API base URL
  apiVersion?: string;             // e.g., "v1", "v2"
  authMethod: FilingAuthMethod;

  // Flexible Configuration (extensible)
  config: FilingSystemConfig;

  // Capabilities
  supportsBatchUpload: boolean;
  supportsDigitalSignature: boolean;
  supportsEDelivery: boolean;
  requiresOfficerCertification: boolean;

  // Rate Limiting
  rateLimitPerHour?: number;
  maxConcurrentSubmissions?: number;

  // Status and Lifecycle
  status: FilingSystemStatus;
  notes?: string;

  // Audit Trail
  createdAt: string;
  updatedAt: string;
}

/**
 * Extensible configuration object for filing systems
 * Adapter-specific settings stored as JSON
 */
export interface FilingSystemConfig {
  timeoutSeconds?: number;
  maxFileSizeMb?: number;
  supportedFormats?: string[];      // ['pdf', 'docx', 'xlsx']
  requiresDigitalSignature?: boolean;
  customFields?: Record<string, unknown>;
  [key: string]: unknown;           // Allow arbitrary extensibility
}

/**
 * Master Filing Record
 * Tracks complete submission lifecycle and maintains audit trail
 */
export interface Filing {
  id: string;

  // Foreign Keys
  companyId: string;
  filingSystemId: string;

  // Filing Identification
  filingType: string;              // e.g., "prospectus", "pif", "preliminary_prospectus"
  filingReference?: string;        // External reference from filing system

  // Status and Timeline
  status: FilingStatus;
  submissionReference?: string;    // Unique submission ID from filing system
  submittedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  archivedAt?: string;

  // File Management
  filePath?: string;               // S3 or storage path
  fileSizeBytes?: number;
  fileHash?: string;               // SHA-256 hash for integrity verification

  // Error Handling
  errorMessage?: string;
  errorCode?: string;
  errorDetails: Record<string, unknown>;

  // Metadata (extensible)
  metadata: FilingMetadata;

  // Workflow Tracking
  submissionAttempts: number;
  lastSubmissionAttemptAt?: string;
  isAmended: boolean;
  supersedesFilingId?: string;     // Links to previous version if amended

  // Audit Trail
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Extensible metadata for filings
 */
export interface FilingMetadata {
  submissionTimestamp?: string;
  submittedByTitle?: string;
  certificationStatus?: 'certified' | 'not_certified' | 'pending';
  filingFeePaid?: boolean;
  filingFeeAmount?: number;
  customFields?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Individual Document within a Filing
 * Supports modular document structure (prospectus + exhibits + appendices)
 */
export interface FilingDocument {
  id: string;

  // Foreign Key
  filingId: string;

  // Document Identification
  documentType: string;             // e.g., "prospectus", "exhibit_a", "financial_statements"
  documentName: string;
  documentOrder?: number;           // Sequence number for multi-document filings

  // File Management
  filePath: string;                 // S3 or storage path
  fileSizeBytes?: number;
  fileHash?: string;                // SHA-256 hash
  fileFormat?: string;              // 'pdf', 'docx', 'xlsx', 'txt'

  // Validation
  validationStatus: DocumentValidationStatus;
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
  validatedAt?: string;

  // Requirements
  isRequired: boolean;
  isExhibit: boolean;

  // Compliance Tracking
  scannedForViruses: boolean;
  virusScanResult?: 'clean' | 'infected' | 'suspicious';
  ocrPerformed: boolean;
  ocrConfidencePct?: number;        // 0-100

  // Metadata (extensible)
  metadata: DocumentMetadata;

  // Audit Trail
  uploadedAt: string;
  updatedAt: string;
  uploadedBy?: string;
}

/**
 * Validation error in a filing document
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'error';
  remediation?: string;
}

/**
 * Non-blocking validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  remediation?: string;
}

/**
 * Extensible metadata for documents
 */
export interface DocumentMetadata {
  pageCount?: number;
  hasDigitalSignature?: boolean;
  digitalSignatureValid?: boolean;
  subjectMatter?: string;
  requiresAuditorConsent?: boolean;
  customMetadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Status Transition Log Entry
 * Complete audit trail for regulatory compliance and investigation
 */
export interface FilingStatusLog {
  id: string;

  // Foreign Key
  filingId: string;

  // Status Transition
  oldStatus?: FilingStatus;        // NULL for initial creation
  newStatus: FilingStatus;

  // Context
  reason?: string;                 // Human-readable reason for transition
  triggerType: StatusLogTriggerType;
  triggeredBy?: string;            // User or system actor

  // External System Response
  externalResponse: Record<string, unknown>;  // Response from filing system API

  // Additional Context
  metadata: Record<string, unknown>;  // {
                                       //   apiCallDurationMs?: number,
                                       //   retryAttempt?: number,
                                       //   batchSubmissionId?: string
                                       // }

  // Timestamp
  changedAt: string;
}

/**
 * Validation Rule Definition
 * Enables dynamic rule updates without code changes
 */
export interface FilingValidationRule {
  id: string;

  // Foreign Key
  filingSystemId: string;

  // Rule Identification
  ruleName: string;
  ruleCategory: string;             // 'file_format', 'content', 'signature', 'metadata'
  documentTypes: string[];          // Empty = all documents

  // Rule Definition (JSON Schema or custom format)
  ruleDefinition: ValidationRuleDefinition;

  // Enforcement
  isCritical: boolean;              // True = blocks submission
  isActive: boolean;

  // Metadata
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation rule definition (extensible)
 */
export interface ValidationRuleDefinition {
  type: string;                     // 'file_format_check', 'content_check', etc.
  allowedFormats?: string[];        // ['pdf', 'docx']
  maxFileSizeMb?: number;
  minPages?: number;
  maxPages?: number;
  customRuleId?: string;            // Reference to external rule engine
  [key: string]: unknown;           // Allow arbitrary rule types
}

/**
 * Webhook Registration for Filing System Callbacks
 * Enables real-time status updates from external systems
 */
export interface FilingApiWebhook {
  id: string;

  // Foreign Key
  filingSystemId: string;

  // Webhook Configuration
  endpointUrl: string;
  eventTypes: FilingWebhookEventType[];

  // Security
  apiKey?: string;                  // Secret key for HMAC verification
  isActive: boolean;

  // Tracking
  lastTriggeredAt?: string;
  failureCount: number;
  lastFailureAt?: string;
  lastErrorMessage?: string;

  // Audit Trail
  createdAt: string;
  updatedAt: string;
}

/**
 * Batch Submission Tracking
 * Groups related filings for efficient bulk processing
 */
export interface FilingSubmissionBatch {
  id: string;

  // Batch Identification
  batchName: string;
  companyId: string;
  filingSystemId: string;

  // Batch Status
  status: FilingBatchStatus;

  // Statistics
  totalFilings: number;
  successfulFilings: number;
  failedFilings: number;

  // Timing
  startedAt?: string;
  completedAt?: string;

  // Tracking
  submissionReference?: string;     // Batch ID from filing system
  notes?: string;

  // Audit Trail
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// QUERY AND RESPONSE INTERFACES
// ============================================================================

/**
 * Dashboard view of all filings by status
 */
export interface FilingStatusDashboard {
  companyId: string;
  filingType: string;
  status: FilingStatus;
  filingCount: number;
  rejectedCount: number;
  pendingAcceptanceCount: number;
  lastSubmission?: string;
  lastUpdated: string;
}

/**
 * Filing system health metrics
 */
export interface FilingSystemHealth {
  id: string;
  name: string;
  exchange: string;
  totalFilings: number;
  activeSubmissions: number;
  rejectedFilings: number;
  successRatePct: number;
  lastSubmission?: string;
  errorCount: number;
  lastActivity?: string;
}

/**
 * Document validation summary
 */
export interface DocumentValidationSummary {
  companyId: string;
  filingType: string;
  documentType: string;
  validationStatus: DocumentValidationStatus;
  documentCount: number;
  percentage: number;
}

/**
 * Filing submission timeline with resolution tracking
 */
export interface FilingSubmissionTimeline {
  id: string;
  companyId: string;
  filingSystemName: string;
  filingType: string;
  status: FilingStatus;
  submissionAttempts: number;
  createdAt: string;
  submittedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  daysToResolution?: number;
}

// ============================================================================
// REQUEST/PAYLOAD INTERFACES
// ============================================================================

/**
 * Create Filing Request
 */
export interface CreateFilingRequest {
  companyId: string;
  filingSystemId: string;
  filingType: string;
  filePath?: string;
  metadata?: FilingMetadata;
}

/**
 * Update Filing Request
 */
export interface UpdateFilingRequest {
  status?: FilingStatus;
  filePath?: string;
  metadata?: Partial<FilingMetadata>;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Submit Filing Request
 */
export interface SubmitFilingRequest {
  filingId: string;
  certifiedBy?: string;
  certifiedByTitle?: string;
}

/**
 * Upload Document Request
 */
export interface UploadDocumentRequest {
  filingId: string;
  documentType: string;
  documentName: string;
  filePath: string;
  isRequired?: boolean;
  isExhibit?: boolean;
  documentOrder?: number;
}

/**
 * Validate Filing Request
 */
export interface ValidateFilingRequest {
  filingId: string;
  filingSystemId: string;
  documentIds?: string[];
}

/**
 * Create Webhook Request
 */
export interface CreateWebhookRequest {
  filingSystemId: string;
  endpointUrl: string;
  eventTypes: FilingWebhookEventType[];
  apiKey?: string;
}

/**
 * Create Batch Submission Request
 */
export interface CreateBatchSubmissionRequest {
  companyId: string;
  filingSystemId: string;
  batchName: string;
  filingIds: string[];
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Filing-specific error type
 */
export class FilingError extends Error {
  constructor(
    message: string,
    public code: string,
    public filingId?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'FilingError';
  }
}

/**
 * Validation error for filing documents
 */
export class FilingValidationError extends FilingError {
  constructor(
    message: string,
    public validationErrors: ValidationError[],
    public validationWarnings?: ValidationWarning[],
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'FilingValidationError';
  }
}

/**
 * Filing system adapter error
 */
export class FilingAdapterError extends FilingError {
  constructor(
    message: string,
    public adapterName: string,
    public externalErrorCode?: string,
  ) {
    super(message, 'ADAPTER_ERROR');
    this.name = 'FilingAdapterError';
  }
}

// ============================================================================
// ADAPTER INTERFACE (For Implementation)
// ============================================================================

/**
 * Interface for filing system adapters
 * Implementations provide exchange-specific filing logic
 */
export interface IFilingAdapter {
  // System identification
  name: string;
  version: string;

  // Required capabilities
  canAuthenticate(config: FilingSystemConfig): Promise<boolean>;
  authenticate(config: FilingSystemConfig): Promise<void>;

  // Filing operations
  submitFiling(filing: Filing, documents: FilingDocument[]): Promise<string>;
  checkFilingStatus(submissionReference: string): Promise<FilingStatus>;
  downloadFilingReceipt(submissionReference: string): Promise<Buffer>;

  // Validation
  validateDocument(document: FilingDocument): Promise<ValidationError[]>;
  getValidationRules(): ValidationRuleDefinition[];

  // Capabilities
  supportsBatchUpload(): boolean;
  supportsDigitalSignature(): boolean;
  supportsSynchronousSubmission(): boolean;

  // Error handling
  parseError(error: unknown): FilingAdapterError;
}
