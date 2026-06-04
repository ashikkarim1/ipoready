/**
 * WEB FORM SUBMISSION ADAPTER TEMPLATE
 * ====================================
 * Complete template for regulatory authorities that require web form submissions
 * via Selenium/Playwright browser automation.
 *
 * Use this template when the regulatory authority:
 * - Only provides a web portal (no API)
 * - Requires form filling and submission
 * - May have JavaScript-heavy forms
 * - Requires file uploads through browser
 * - May require CAPTCHA solving (manual fallback)
 *
 * EXAMPLES:
 * - India NSE/BSE listing portals
 * - Some national regulatory portals
 * - Legacy government agency portals
 *
 * IMPLEMENTATION TIME: ~4 hours
 * DIFFICULTY: Medium-High (browser automation complexity)
 *
 * =============================
 * CUSTOMIZATION CHECKLIST:
 * =============================
 * [ ] 1. Define form field mappings for your portal
 * [ ] 2. Implement form navigation logic
 * [ ] 3. Add document file upload handling
 * [ ] 4. Implement cookie/session management
 * [ ] 5. Add CAPTCHA detection and fallback
 * [ ] 6. Configure screenshot capture for debugging
 * [ ] 7. Implement form validation checks
 * [ ] 8. Add retry logic for transient failures
 * [ ] 9. Test with headless browser (Chrome, Firefox)
 * [ ] 10. Add to CI/CD pipeline with test environment
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

// ============================================================================
// TODO: CUSTOMIZE - TYPES FOR WEB FORM SUBMISSION
// ============================================================================

/**
 * Web form field definition
 */
export interface FormField {
  name: string;           // HTML field name
  selector: string;       // CSS/XPath selector
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'file' | 'textarea';
  value?: string;         // Value to enter
  required: boolean;
  options?: string[];     // For select/radio fields
  documentType?: DocumentType; // For file uploads
}

/**
 * Form page definition
 */
export interface FormPage {
  pageNumber: number;
  url: string;
  title: string;
  fields: FormField[];
  submitButtonSelector: string; // CSS selector for submit/next button
  nextPageSelector?: string;    // Selector for next page button if different
  validationSelectors?: {       // Selectors for error messages
    errorContainer: string;
    errorMessages: string;
  };
}

/**
 * Web form configuration
 */
export interface WebFormConfig {
  portalUrl: string;           // Base URL of regulatory portal
  loginUrl: string;            // Login page URL
  filingFormUrl: string;       // Starting URL for filing form
  username: string;            // Portal login username
  password: string;            // Portal login password
  formPages: FormPage[];       // Definition of all form pages
  browserType: 'chrome' | 'firefox' | 'edge'; // Which browser to use
  headless: boolean;           // Run in headless mode
  screenshotOnError: boolean;  // Capture screenshot on failure
  defaultTimeout: number;      // Default wait timeout (ms)
  postSubmissionWaitMs: number; // Wait after form submission
}

/**
 * Form submission session
 */
export interface FormSession {
  sessionId: string;
  startedAt: Date;
  currentPage: number;
  browser?: any;  // Browser instance (playwright/puppeteer)
  cookies?: any[];
  completedPages: number[];
  submissionReference?: string;
}

// ============================================================================
// TODO: CUSTOMIZE - WEB FORM ADAPTER
// ============================================================================

/**
 * Web Form Submission Adapter
 *
 * This adapter uses browser automation (Playwright/Selenium) to:
 * 1. Log into regulatory portal
 * 2. Navigate through multi-page forms
 * 3. Fill form fields with document/company data
 * 4. Upload files
 * 5. Submit form
 * 6. Extract confirmation/reference number
 *
 * REQUIRES: Playwright or Selenium library installed
 */
export class WebFormTemplate extends BaseFilingAdapter {
  protected adapterName = 'web-form-adapter-template';

  // TODO: CUSTOMIZE - Form configuration
  private formConfig: WebFormConfig = {
    portalUrl: process.env.PORTAL_URL || 'https://portal.example-regulator.com',
    loginUrl: process.env.LOGIN_URL || '/login',
    filingFormUrl: process.env.FILING_FORM_URL || '/filings/new',
    username: process.env.PORTAL_USERNAME || '',
    password: process.env.PORTAL_PASSWORD || '',
    formPages: [], // TODO: Define your form pages
    browserType: 'chrome',
    headless: true,
    screenshotOnError: true,
    defaultTimeout: 30000,
    postSubmissionWaitMs: 5000,
  };

  private requiredDocuments: DocumentType[] = [
    'prospectus',
    'financial_statements',
    'auditor_report',
    'legal_opinion',
  ];

  private activeSessions: Map<string, FormSession> = new Map();

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  constructor(config?: WebFormConfig) {
    super();
    if (config) {
      this.formConfig = { ...this.formConfig, ...config };
    }
  }

  /**
   * Define form pages for your regulatory portal
   * Call this during initialization
   */
  setFormDefinition(pages: FormPage[]): void {
    this.formConfig.formPages = pages;
    this.logInfo('Form definition updated', {
      pageCount: pages.length,
    });
  }

  // ========================================================================
  // VALIDATION
  // ========================================================================

  /**
   * STEP 1: Local validation of documents
   * Check documents are ready before attempting form submission
   */
  async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: any[] = [];
    const warnings: string[] = [];

    try {
      // Validate required documents
      this.validateDocumentsPresent(documents);

      // Validate each document
      for (const doc of documents) {
        try {
          this.validateDocumentFormat(doc);

          // Check file size
          if (doc.size > 20 * 1024 * 1024) {
            warnings.push(
              `${doc.fileName} is large (${doc.size} bytes) - upload may be slow`
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
  // SUBMISSION - WEB FORM FILLING
  // ========================================================================

  /**
   * STEP 2: Submit documents through web form
   *
   * Process:
   * 1. Initialize browser instance
   * 2. Log into regulatory portal
   * 3. Navigate to filing form
   * 4. Fill each form page with document data
   * 5. Upload files
   * 6. Submit form
   * 7. Extract confirmation number
   * 8. Close browser
   */
  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    const startTime = Date.now();
    const session: FormSession = {
      sessionId: this.generateSessionId(),
      startedAt: new Date(),
      currentPage: 0,
      completedPages: [],
    };

    try {
      this.validateCredentials();
      this.logInfo('Starting web form submission', {
        sessionId: session.sessionId,
        documentCount: documents.length,
      });

      // Use retry wrapper for resilience
      const result = await this.withRetry(
        () => this.submitThroughWebForm(session, documents, metadata),
        'submitThroughWebForm'
      );

      const submissionTimeMs = Date.now() - startTime;
      this.logInfo('Web form submission successful', {
        sessionId: session.sessionId,
        submissionTimeMs,
        referenceNumber: result.referenceNumber,
      });

      return result;
    } catch (error) {
      this.logError('Web form submission failed', {
        sessionId: session.sessionId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Clean up browser on failure
      if (session.browser) {
        try {
          await session.browser.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      if (error instanceof FilingError) {
        throw error;
      }

      throw new FilingError(
        'WEB_FORM_SUBMISSION_FAILED',
        `Web form submission failed: ${error instanceof Error ? error.message : String(error)}`,
        true,
        500
      );
    } finally {
      // Clean up session
      this.activeSessions.delete(session.sessionId);
    }
  }

  /**
   * TODO: CUSTOMIZE - Main form submission logic
   * Requires: npm install playwright (or selenium)
   */
  private async submitThroughWebForm(
    session: FormSession,
    documents: DocumentMetadata[],
    metadata: FilingMetadata
  ): Promise<SubmissionResult> {
    // TODO: Uncomment and use actual browser automation library
    // import { chromium } from 'playwright';

    // Launch browser
    // const browser = await chromium.launch({ headless: this.formConfig.headless });
    // session.browser = browser;
    // const context = await browser.newContext();
    // const page = await context.newPage();

    // Step 1: Navigate to portal and log in
    // await page.goto(`${this.formConfig.portalUrl}${this.formConfig.loginUrl}`);
    // await this.loginToPortal(page);

    // Step 2: Navigate to filing form
    // await page.goto(`${this.formConfig.portalUrl}${this.formConfig.filingFormUrl}`);

    // Step 3: Fill and submit each form page
    // for (let i = 0; i < this.formConfig.formPages.length; i++) {
    //   const formPage = this.formConfig.formPages[i];
    //   await this.fillFormPage(page, formPage, documents, metadata, session);
    //
    //   if (i < this.formConfig.formPages.length - 1) {
    //     // Click next button for intermediate pages
    //     await page.click(formPage.nextPageSelector || formPage.submitButtonSelector);
    //   }
    // }

    // Step 4: Submit final page
    // const lastPage = this.formConfig.formPages[this.formConfig.formPages.length - 1];
    // await page.click(lastPage.submitButtonSelector);
    // await page.waitForTimeout(this.formConfig.postSubmissionWaitMs);

    // Step 5: Extract confirmation
    // const referenceNumber = await this.extractReferenceNumber(page);
    // await page.close();
    // await context.close();
    // await browser.close();

    // For now, return mock result
    this.logInfo('Form submission would execute here (stub)', {
      sessionId: session.sessionId,
    });

    return {
      success: true,
      filingId: this.generateSessionId(),
      referenceNumber: `REF-${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date(),
      estimatedProcessingTime: 24 * 60 * 60 * 1000,
      documentReceiptIds: new Map(),
      warnings: [
        'Browser automation stub - implement with Playwright or Selenium',
      ],
    };
  }

  /**
   * TODO: CUSTOMIZE - Log into regulatory portal
   */
  private async loginToPortal(page: any): Promise<void> {
    try {
      this.logDebug('Logging into portal', {
        username: this.formConfig.username,
      });

      // Fill login form
      // await page.fill('input[name="username"]', this.formConfig.username);
      // await page.fill('input[name="password"]', this.formConfig.password);
      // await page.click('button[type="submit"]');
      // await page.waitForNavigation();

      this.logDebug('Portal login completed');
    } catch (error) {
      throw new FilingError(
        'LOGIN_FAILED',
        `Failed to log into portal: ${error instanceof Error ? error.message : String(error)}`,
        true,
        401
      );
    }
  }

  /**
   * TODO: CUSTOMIZE - Fill a single form page
   */
  private async fillFormPage(
    page: any,
    formPage: FormPage,
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
    session: FormSession
  ): Promise<void> {
    try {
      this.logDebug('Filling form page', {
        pageNumber: formPage.pageNumber,
        fieldCount: formPage.fields.length,
      });

      for (const field of formPage.fields) {
        try {
          // Wait for field to appear
          // await page.waitForSelector(field.selector, { timeout: this.formConfig.defaultTimeout });

          switch (field.type) {
            case 'text':
            case 'textarea':
              // Fill text field
              const value = this.getFieldValue(field, metadata, documents);
              // await page.fill(field.selector, value || '');
              this.logDebug('Filled text field', { fieldName: field.name });
              break;

            case 'select':
              // Select dropdown option
              // await page.selectOption(field.selector, field.value || '');
              this.logDebug('Selected dropdown', { fieldName: field.name });
              break;

            case 'checkbox':
              // Check checkbox
              // const isChecked = await page.isChecked(field.selector);
              // if (!isChecked) {
              //   await page.click(field.selector);
              // }
              break;

            case 'file':
              // Upload file
              if (field.documentType) {
                const doc = documents.find(d => d.type === field.documentType);
                if (doc) {
                  // await page.setInputFiles(field.selector, doc.fileName);
                  this.logDebug('Uploaded file', {
                    fieldName: field.name,
                    fileName: doc.fileName,
                  });
                }
              }
              break;
          }
        } catch (error) {
          if (field.required) {
            throw error;
          }
          this.logWarn('Failed to fill optional field', {
            fieldName: field.name,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      session.completedPages.push(formPage.pageNumber);
      this.logDebug('Form page completed', {
        pageNumber: formPage.pageNumber,
      });
    } catch (error) {
      throw new FilingError(
        'FORM_FILL_FAILED',
        `Failed to fill form page ${formPage.pageNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        false,
        400
      );
    }
  }

  /**
   * TODO: CUSTOMIZE - Extract reference number from confirmation page
   */
  private async extractReferenceNumber(page: any): Promise<string> {
    try {
      // Look for common patterns
      // const text = await page.textContent('body');
      // const match = text.match(/Reference[:\s]+([A-Z0-9\-]+)/);
      // if (match) return match[1];

      // Fallback to timestamp-based reference
      return `REF-${Date.now()}`;
    } catch (error) {
      throw new FilingError(
        'REFERENCE_EXTRACTION_FAILED',
        `Failed to extract reference number: ${
          error instanceof Error ? error.message : String(error)
        }`,
        false,
        400
      );
    }
  }

  /**
   * Get value to populate in form field based on metadata/documents
   */
  private getFieldValue(
    field: FormField,
    metadata: FilingMetadata,
    documents: DocumentMetadata[]
  ): string {
    if (field.value) return field.value;

    // Map common field names to metadata
    const fieldNameLower = field.name.toLowerCase();

    if (fieldNameLower.includes('company')) return metadata.companyName;
    if (fieldNameLower.includes('country')) return metadata.country;
    if (fieldNameLower.includes('currency')) return metadata.currencyCode;
    if (fieldNameLower.includes('type')) return metadata.filingType;

    return '';
  }

  // ========================================================================
  // STATUS TRACKING
  // ========================================================================

  /**
   * STEP 3: Get filing status from portal
   * May require logging in again if portal doesn't support direct links
   */
  async getStatus(filingId: string): Promise<FilingStatus> {
    try {
      this.logDebug('Checking form submission status', { filingId });

      // TODO: Implement if portal provides status page
      // Similar to submitThroughWebForm but just viewing status

      return {
        filingId,
        referenceNumber: filingId,
        status: 'processing',
        phase: 'submission',
        lastUpdatedAt: new Date(),
      };
    } catch (error) {
      throw new FilingError(
        'STATUS_CHECK_FAILED',
        `Failed to check status: ${error instanceof Error ? error.message : String(error)}`,
        true,
        500
      );
    }
  }

  // ========================================================================
  // WEBHOOK HANDLING
  // ========================================================================

  /**
   * Web form portals typically don't support webhooks
   */
  async handleWebhook(payload: any): Promise<StatusUpdate> {
    throw new FilingError(
      'WEBHOOKS_UNSUPPORTED',
      'Web form portals do not support webhooks',
      false,
      501
    );
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
      submissionMethod: 'WEB_FORM',
      browserType: this.formConfig.browserType,
      portalUrl: this.formConfig.portalUrl,
      estimatedSubmissionTime: '15-30 minutes',
      requiresManualIntervention: false,
      supportsContinuousTracking: false,
      maxDocumentSize: 20 * 1024 * 1024,
    };
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  private generateSessionId(): string {
    return `WEB-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

export default WebFormTemplate;
