/**
 * CUSTOM PORTAL ADAPTER TEMPLATE
 * ==============================
 * Complete template for regulatory authorities with proprietary/custom
 * portal implementations (OAuth + custom UI patterns, multi-step workflows).
 *
 * Use this template when the regulatory authority:
 * - Has a custom authentication flow (OAuth, proprietary JWT, etc.)
 * - Requires multi-step submission workflows
 * - Has custom UI that doesn't follow standard patterns
 * - Requires progress tracking callbacks
 * - May have tiered access levels (preliminary, final, etc.)
 *
 * EXAMPLES:
 * - Some startup/emerging market regulators
 * - Modern fintech-focused regulatory systems
 * - Regional/local regulatory bodies with custom systems
 *
 * IMPLEMENTATION TIME: ~4 hours
 * DIFFICULTY: Medium (custom workflow implementation)
 *
 * =============================
 * CUSTOMIZATION CHECKLIST:
 * =============================
 * [ ] 1. Document the custom OAuth/authentication flow
 * [ ] 2. Map out multi-step submission workflow
 * [ ] 3. Implement progress tracking callbacks
 * [ ] 4. Handle custom error responses
 * [ ] 5. Implement tiered submission phases
 * [ ] 6. Add session management
 * [ ] 7. Document webhook/callback patterns
 * [ ] 8. Implement robust error recovery
 * [ ] 9. Add comprehensive logging
 * [ ] 10. Create admin dashboard for monitoring
 */

import { BaseFilingAdapter, FilingError, DocumentType } from '../BaseFilingAdapter';
import type {
  DocumentMetadata,
  ValidationResult,
  SubmissionResult,
  FilingStatus,
  StatusUpdate,
  AuthCredentials,
  FilingMetadata,
} from '../BaseFilingAdapter';

// ============================================================================
// TODO: CUSTOMIZE - TYPES FOR CUSTOM PORTAL
// ============================================================================

/**
 * Custom OAuth configuration
 */
export interface CustomOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  scopes: string[];
  grantType: string; // 'authorization_code', 'client_credentials', etc.
}

/**
 * Submission workflow step
 */
export interface WorkflowStep {
  stepId: string;
  stepNumber: number;
  name: string;
  description: string;
  endpoint: string;          // API endpoint for this step
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiredFields: string[];
  documentTypesRequired: DocumentType[];
  canRetry: boolean;
  estimatedDurationMs: number;
}

/**
 * Submission session tracking
 */
export interface SubmissionSession {
  sessionId: string;
  filingId?: string;
  startedAt: Date;
  currentStepId: string;
  completedSteps: string[];
  stepData: Map<string, any>;
  status: 'active' | 'paused' | 'completed' | 'failed';
  errorDetails?: string;
}

/**
 * Progress callback for real-time updates
 */
export interface ProgressCallback {
  (progress: {
    sessionId: string;
    currentStep: number;
    totalSteps: number;
    percentComplete: number;
    currentStepName: string;
    message: string;
  }): Promise<void>;
}

/**
 * Step completion result
 */
export interface StepResult {
  success: boolean;
  stepId: string;
  nextStepId?: string;
  data?: any;
  errors?: string[];
  estimatedTimeRemaining?: number; // milliseconds
}

// ============================================================================
// TODO: CUSTOMIZE - CUSTOM PORTAL ADAPTER
// ============================================================================

/**
 * Custom Portal Adapter
 *
 * Handles proprietary regulatory portals with custom workflows,
 * OAuth authentication, and multi-step submission processes.
 *
 * WORKFLOW PATTERN:
 * 1. OAuth authentication
 * 2. Initialize submission session
 * 3. Execute workflow steps sequentially
 * 4. Upload documents at appropriate steps
 * 5. Handle step-specific validations
 * 6. Receive submission confirmation
 * 7. Poll for final approval
 */
export class CustomPortalTemplate extends BaseFilingAdapter {
  protected adapterName = 'custom-portal-adapter-template';

  // TODO: CUSTOMIZE - Portal configuration
  private customOAuthConfig: CustomOAuthConfig = {
    clientId: process.env.CUSTOM_OAUTH_CLIENT_ID || '',
    clientSecret: process.env.CUSTOM_OAUTH_CLIENT_SECRET || '',
    redirectUri: process.env.CUSTOM_OAUTH_REDIRECT_URI || 'http://localhost:3000/callback',
    tokenEndpoint: process.env.CUSTOM_TOKEN_ENDPOINT || 'https://portal.example.com/oauth/token',
    authorizationEndpoint: process.env.CUSTOM_AUTH_ENDPOINT || 'https://portal.example.com/oauth/authorize',
    scopes: ['filings:write', 'filings:read', 'company:manage'],
    grantType: 'authorization_code',
  };

  // Submission workflow steps
  private workflowSteps: WorkflowStep[] = [];

  // Active sessions
  private activeSessions: Map<string, SubmissionSession> = new Map();

  // Progress callbacks
  private progressCallbacks: ProgressCallback[] = [];

  private requiredDocuments: DocumentType[] = [
    DocumentType.PROSPECTUS,
    DocumentType.FINANCIAL_STATEMENTS,
    DocumentType.AUDITOR_REPORT,
    DocumentType.LEGAL_OPINION,
  ];

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  constructor() {
    super();
    this.defineWorkflowSteps();
  }

  /**
   * TODO: CUSTOMIZE - Define the submission workflow steps
   * Each step represents a stage in the submission process
   */
  private defineWorkflowSteps(): void {
    this.workflowSteps = [
      {
        stepId: 'init_submission',
        stepNumber: 1,
        name: 'Initialize Submission',
        description: 'Create new filing session and get submission ID',
        endpoint: '/api/filings/initialize',
        method: 'POST',
        requiredFields: ['companyName', 'companyId', 'filingType'],
        documentTypesRequired: [],
        canRetry: true,
        estimatedDurationMs: 2000,
      },
      {
        stepId: 'upload_prospectus',
        stepNumber: 2,
        name: 'Upload Prospectus',
        description: 'Upload main prospectus document',
        endpoint: '/api/filings/{filingId}/documents/prospectus',
        method: 'POST',
        requiredFields: ['prospectusContent'],
        documentTypesRequired: [DocumentType.PROSPECTUS],
        canRetry: true,
        estimatedDurationMs: 30000,
      },
      {
        stepId: 'upload_financials',
        stepNumber: 3,
        name: 'Upload Financial Statements',
        description: 'Upload audited financial statements',
        endpoint: '/api/filings/{filingId}/documents/financials',
        method: 'POST',
        requiredFields: ['financialStatementsContent'],
        documentTypesRequired: [DocumentType.FINANCIAL_STATEMENTS, DocumentType.AUDITOR_REPORT],
        canRetry: true,
        estimatedDurationMs: 15000,
      },
      {
        stepId: 'validate_filing',
        stepNumber: 4,
        name: 'Validate Filing',
        description: 'Regulatory system validates all submitted documents',
        endpoint: '/api/filings/{filingId}/validate',
        method: 'POST',
        requiredFields: [],
        documentTypesRequired: [],
        canRetry: false,
        estimatedDurationMs: 30000,
      },
      {
        stepId: 'final_submission',
        stepNumber: 5,
        name: 'Final Submission',
        description: 'Submit filing for regulatory review',
        endpoint: '/api/filings/{filingId}/submit',
        method: 'POST',
        requiredFields: [],
        documentTypesRequired: [],
        canRetry: false,
        estimatedDurationMs: 5000,
      },
    ];

    this.logInfo('Workflow steps defined', {
      stepCount: this.workflowSteps.length,
    });
  }

  /**
   * Register callback for progress updates
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallbacks.push(callback);
  }

  // ========================================================================
  // VALIDATION
  // ========================================================================

  /**
   * STEP 1: Local validation
   */
  async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: any[] = [];
    const warnings: string[] = [];

    try {
      this.validateDocumentsPresent(documents);

      for (const doc of documents) {
        try {
          this.validateDocumentFormat(doc);
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

      return {
        isValid: errors.length === 0,
        phase: 'validation',
        errors,
        warnings,
        documentStatuses: new Map(),
        completedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      throw new FilingError(
        'VALIDATION_FAILED',
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        false,
        500
      );
    }
  }

  // ========================================================================
  // SUBMISSION - MULTI-STEP WORKFLOW
  // ========================================================================

  /**
   * STEP 2: Submit through custom portal with multi-step workflow
   *
   * Process:
   * 1. Create submission session
   * 2. Execute workflow steps sequentially
   * 3. Call progress callbacks
   * 4. Handle step failures with retry logic
   * 5. Return final submission confirmation
   */
  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    const startTime = Date.now();
    const session: SubmissionSession = {
      sessionId: this.generateSessionId(),
      startedAt: new Date(),
      currentStepId: this.workflowSteps[0].stepId,
      completedSteps: [],
      stepData: new Map(),
      status: 'active',
    };

    try {
      this.validateCredentials();
      this.logInfo('Starting multi-step submission', {
        sessionId: session.sessionId,
        workflowSteps: this.workflowSteps.length,
      });

      this.activeSessions.set(session.sessionId, session);

      // Execute workflow steps
      for (let i = 0; i < this.workflowSteps.length; i++) {
        const step = this.workflowSteps[i];

        try {
          const stepResult = await this.executeWorkflowStep(
            session,
            step,
            documents,
            metadata,
            i
          );

          if (!stepResult.success) {
            throw new FilingError(
              'STEP_FAILED',
              `Workflow step failed: ${step.name}`,
              step.canRetry,
              400,
              { stepId: step.stepId, errors: stepResult.errors }
            );
          }

          session.completedSteps.push(step.stepId);
          session.stepData.set(step.stepId, stepResult.data);

          if (stepResult.nextStepId) {
            session.currentStepId = stepResult.nextStepId;
          }

          // Fire progress callback
          await this.notifyProgress(session, i + 1);
        } catch (error) {
          session.status = 'failed';
          session.errorDetails = error instanceof Error ? error.message : String(error);

          if (!step.canRetry) {
            throw error;
          }

          // Retry step if allowed
          this.logWarn(`Retrying step: ${step.name}`, {
            sessionId: session.sessionId,
          });

          // Simple retry (in production, implement exponential backoff)
          await this.sleep(2000);
          i--; // Retry this step
          continue;
        }
      }

      // Extract filing ID from final step
      const filingId = session.stepData.get('final_submission')?.filingId ||
        session.sessionId;

      session.filingId = filingId;
      session.status = 'completed';

      const submissionTimeMs = Date.now() - startTime;
      this.logInfo('Multi-step submission successful', {
        sessionId: session.sessionId,
        filingId,
        submissionTimeMs,
      });

      return {
        success: true,
        filingId,
        referenceNumber: filingId,
        status: 'submitted',
        submittedAt: new Date(),
        estimatedProcessingTime: 24 * 60 * 60 * 1000,
        documentReceiptIds: new Map(),
        warnings: [],
      };
    } catch (error) {
      session.status = 'failed';
      this.logError('Multi-step submission failed', {
        sessionId: session.sessionId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof FilingError) {
        throw error;
      }

      throw new FilingError(
        'SUBMISSION_FAILED',
        `Submission failed: ${error instanceof Error ? error.message : String(error)}`,
        true,
        500
      );
    } finally {
      this.activeSessions.delete(session.sessionId);
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    session: SubmissionSession,
    step: WorkflowStep,
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
    stepIndex: number
  ): Promise<StepResult> {
    try {
      this.logDebug('Executing workflow step', {
        stepId: step.stepId,
        stepName: step.name,
      });

      // Prepare step data based on step type
      const stepPayload = this.buildStepPayload(
        step,
        documents,
        metadata,
        session
      );

      // Build endpoint URL
      const endpoint = this.buildEndpointUrl(step, session);

      // Make API request
      const headers = this.buildAuthHeaders();
      headers['Content-Type'] = 'application/json';

      const response = await this.makeCustomPortalRequest(
        endpoint,
        step.method,
        stepPayload,
        headers
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          stepId: step.stepId,
          errors: [errorData.message || `HTTP ${response.status}`],
        };
      }

      const responseData = await response.json();

      // Determine next step
      const nextStepId =
        stepIndex < this.workflowSteps.length - 1
          ? this.workflowSteps[stepIndex + 1].stepId
          : undefined;

      const totalDuration = this.workflowSteps.reduce(
        (sum, s) => sum + s.estimatedDurationMs,
        0
      );
      const completedDuration = this.workflowSteps
        .slice(0, stepIndex + 1)
        .reduce((sum, s) => sum + s.estimatedDurationMs, 0);
      const estimatedTimeRemaining = totalDuration - completedDuration;

      return {
        success: true,
        stepId: step.stepId,
        nextStepId,
        data: responseData,
        estimatedTimeRemaining,
      };
    } catch (error) {
      return {
        success: false,
        stepId: step.stepId,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * TODO: CUSTOMIZE - Build payload for workflow step
   */
  private buildStepPayload(
    step: WorkflowStep,
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
    session: SubmissionSession
  ): Record<string, any> {
    const payload: Record<string, any> = {};

    // Customize payload based on step
    switch (step.stepId) {
      case 'init_submission':
        payload.companyName = metadata.companyName;
        payload.companyId = metadata.companyId;
        payload.filingType = metadata.filingType;
        payload.country = metadata.country;
        break;

      case 'upload_prospectus':
        const prospectus = documents.find(d => d.type === DocumentType.PROSPECTUS);
        if (prospectus) {
          payload.documentContent = prospectus.content;
          payload.documentId = prospectus.id;
        }
        break;

      case 'upload_financials':
        const financials = documents.find(d => d.type === DocumentType.FINANCIAL_STATEMENTS);
        const audit = documents.find(d => d.type === DocumentType.AUDITOR_REPORT);
        if (financials) {
          payload.financialContent = financials.content;
          payload.financialDocumentId = financials.id;
        }
        if (audit) {
          payload.auditContent = audit.content;
          payload.auditDocumentId = audit.id;
        }
        break;

      case 'validate_filing':
        payload.submissionId = session.filingId;
        break;

      case 'final_submission':
        payload.submissionId = session.filingId;
        payload.submittedBy = metadata.submittedBy;
        payload.submittedAt = new Date().toISOString();
        break;
    }

    return payload;
  }

  /**
   * Build endpoint URL for step
   */
  private buildEndpointUrl(step: WorkflowStep, session: SubmissionSession): string {
    let endpoint = step.endpoint;

    // Replace placeholders
    if (endpoint.includes('{filingId}')) {
      endpoint = endpoint.replace('{filingId}', session.filingId || session.sessionId);
    }

    return endpoint;
  }

  /**
   * TODO: CUSTOMIZE - Make custom portal API request
   */
  private async makeCustomPortalRequest(
    endpoint: string,
    method: string,
    body: any,
    headers: Record<string, string>
  ): Promise<Response> {
    // Use built-in fetch (available in Node 18+)
    const fetchFn = fetch as any;

    const options: any = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    return fetchFn(endpoint, options);
  }

  /**
   * Notify progress callbacks
   */
  private async notifyProgress(
    session: SubmissionSession,
    completedSteps: number
  ): Promise<void> {
    const totalSteps = this.workflowSteps.length;
    const percentComplete = Math.round((completedSteps / totalSteps) * 100);
    const currentStep = this.workflowSteps[completedSteps - 1];

    const progress = {
      sessionId: session.sessionId,
      currentStep: completedSteps,
      totalSteps,
      percentComplete,
      currentStepName: currentStep?.name || 'Unknown',
      message: `Completed step ${completedSteps} of ${totalSteps}: ${currentStep?.name || 'Unknown'}`,
    };

    for (const callback of this.progressCallbacks) {
      try {
        await callback(progress);
      } catch (error) {
        this.logWarn('Progress callback failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // ========================================================================
  // STATUS TRACKING
  // ========================================================================

  /**
   * STEP 3: Get filing status
   */
  async getStatus(filingId: string): Promise<FilingStatus> {
    try {
      this.validateCredentials();

      const headers = this.buildAuthHeaders();
      const response = await this.makeCustomPortalRequest(
        `/api/filings/${filingId}/status`,
        'GET',
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

      const statusData = await response.json();

      return {
        filingId,
        referenceNumber: filingId,
        status: statusData.status || 'processing',
        phase: 'submission',
        lastUpdatedAt: new Date(statusData.lastUpdated),
        reviewComments: statusData.comments || [],
        rejectionReasons: statusData.rejectionReasons || [],
      };
    } catch (error) {
      throw new FilingError(
        'STATUS_CHECK_ERROR',
        `Status check failed: ${error instanceof Error ? error.message : String(error)}`,
        true,
        500
      );
    }
  }

  // ========================================================================
  // WEBHOOK HANDLING
  // ========================================================================

  /**
   * Handle webhook notifications from custom portal
   */
  async handleWebhook(payload: any): Promise<StatusUpdate> {
    try {
      this.logDebug('Webhook received', {
        filingId: payload.filingId,
        event: payload.event,
      });

      return {
        filingId: payload.filingId,
        referenceNumber: payload.filingId,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
        updatedAt: new Date(payload.timestamp),
        details: payload.details,
      };
    } catch (error) {
      throw new FilingError(
        'WEBHOOK_PROCESSING_FAILED',
        `Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`,
        false,
        400
      );
    }
  }

  // ========================================================================
  // ADAPTER METADATA
  // ========================================================================

  getRequiredDocuments(): DocumentType[] {
    return this.requiredDocuments;
  }

  getAdapterConfig(): Record<string, any> {
    return {
      adapterName: this.adapterName,
      workflowSteps: this.workflowSteps.map(s => ({
        stepId: s.stepId,
        name: s.name,
        stepNumber: s.stepNumber,
        estimatedDurationMs: s.estimatedDurationMs,
      })),
      totalEstimatedDuration: this.workflowSteps.reduce(
        (sum, s) => sum + s.estimatedDurationMs,
        0
      ),
      authMethod: 'oauth2',
      webhooksSupported: true,
      supportsProgressTracking: true,
    };
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  private generateSessionId(): string {
    return `CUSTOM-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

export default CustomPortalTemplate;
