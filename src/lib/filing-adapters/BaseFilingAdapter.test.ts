/**
 * BaseFilingAdapter Tests
 * Demonstrates usage patterns and validates core functionality
 */

import {
  BaseFilingAdapter,
  FilingError,
  DocumentType,
  type DocumentMetadata,
  type FilingMetadata,
  type ValidationResult,
  type FilingStatus,
} from './BaseFilingAdapter';

// ====================================================================
// TEST ADAPTER IMPLEMENTATION
// ====================================================================

class TestFilingAdapter extends BaseFilingAdapter {
  protected adapterName = 'TestFilingAdapter';

  getRequiredDocuments(): DocumentType[] {
    return [DocumentType.PROSPECTUS, DocumentType.FINANCIAL_STATEMENTS];
  }

  getAdapterConfig(): Record<string, any> {
    return {
      apiBaseUrl: 'https://api.example.com',
      supportedFormTypes: ['TEST-1', 'TEST-2'],
      maxDocumentSize: 100 * 1024 * 1024,
    };
  }

  async validate(documents: DocumentMetadata[]): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors = [];
    const warnings = [];
    const documentStatuses = new Map();

    // Validate documents are present
    this.validateDocumentsPresent(documents);

    // Check each document
    for (const doc of documents) {
      try {
        this.validateDocumentFormat(doc);

        const isValid = await this.validateDocumentChecksum(doc);
        documentStatuses.set(doc.id, {
          documentId: doc.id,
          documentType: doc.type,
          isValid,
          errors: [],
          checksum: doc.checksum,
        });

        if (!isValid) {
          errors.push({
            documentId: doc.id,
            documentType: doc.type,
            code: 'CHECKSUM_MISMATCH',
            message: 'Document checksum validation failed',
            severity: 'error',
          });
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
      documentStatuses,
      completedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
    };
  }

  async submit(
    documents: DocumentMetadata[],
    metadata: FilingMetadata,
  ): Promise<any> {
    return this.withRetry(async () => {
      this.validateCredentials();

      // Simulate API call
      return {
        success: true,
        filingId: 'TEST-2024-001',
        referenceNumber: 'REF-123456',
        status: 'submitted',
        submittedAt: new Date(),
        documentReceiptIds: new Map([
          [DocumentType.PROSPECTUS, 'RECEIPT-001'],
        ]),
        warnings: [],
      };
    }, 'submit_filing');
  }

  async getStatus(filingId: string): Promise<FilingStatus> {
    return this.withRetry(async () => {
      // Simulate status check
      return {
        filingId,
        referenceNumber: 'REF-123456',
        status: 'processing',
        phase: 'submission',
        lastUpdatedAt: new Date(),
        estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }, 'get_filing_status');
  }

  async handleWebhook(payload: any): Promise<any> {
    // Validate signature
    if (!payload.signature) {
      throw new FilingError(
        'INVALID_WEBHOOK',
        'Missing webhook signature',
        false,
      );
    }

    return {
      filingId: payload.filingId,
      referenceNumber: payload.referenceNumber,
      previousStatus: payload.previousStatus,
      newStatus: payload.newStatus,
      updatedAt: new Date(),
    };
  }
}

// ====================================================================
// TEST CASES
// ====================================================================

describe('BaseFilingAdapter', () => {
  let adapter: TestFilingAdapter;
  let testDocuments: DocumentMetadata[];
  let testMetadata: FilingMetadata;

  beforeEach(() => {
    adapter = new TestFilingAdapter();

    testDocuments = [
      {
        id: 'DOC-001',
        type: DocumentType.PROSPECTUS,
        format: 'pdf',
        fileName: 'prospectus.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        checksum: 'abc123def456',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: Buffer.from('fake pdf content'),
      },
      {
        id: 'DOC-002',
        type: DocumentType.FINANCIAL_STATEMENTS,
        format: 'json',
        fileName: 'financials.json',
        mimeType: 'application/json',
        size: 256000,
        checksum: 'xyz789uvw012',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: JSON.stringify({ revenue: 1000000 }),
      },
    ];

    testMetadata = {
      companyId: 'COMP-001',
      companyName: 'Test Company Inc',
      filingType: 'S-1',
      currencyCode: 'USD',
      country: 'US',
      submittedBy: 'test@example.com',
    };
  });

  describe('Credential Management', () => {
    it('should set and validate API key credentials', () => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-api-key-123',
      });

      expect(() => adapter.healthCheck()).not.toThrow();
    });

    it('should set OAuth2 credentials', () => {
      adapter.setCredentials({
        method: 'oauth2',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(() => adapter.healthCheck()).not.toThrow();
    });

    it('should set basic auth credentials', () => {
      adapter.setCredentials({
        method: 'basic_auth',
        username: 'user123',
        password: 'pass456',
      });

      expect(() => adapter.healthCheck()).not.toThrow();
    });

    it('should throw error when credentials missing', async () => {
      expect(() => adapter.healthCheck()).not.toThrow();
    });
  });

  describe('Document Validation', () => {
    beforeEach(() => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-key',
      });
    });

    it('should validate required documents are present', async () => {
      const result = await adapter.validate(testDocuments);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject when required document missing', async () => {
      const missingDocs = [testDocuments[0]]; // Only prospectus

      try {
        await adapter.validate(missingDocs);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(FilingError);
        if (error instanceof FilingError) {
          expect(error.code).toBe('DOCUMENT_MISSING');
        }
      }
    });

    it('should reject empty document list', async () => {
      try {
        await adapter.validate([]);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(FilingError);
        if (error instanceof FilingError) {
          expect(error.code).toBe('DOCUMENTS_EMPTY');
        }
      }
    });

    it('should validate document format', () => {
      const invalidDoc: DocumentMetadata = {
        ...testDocuments[0],
        format: 'invalid' as any,
      };

      expect(() => adapter.validate([invalidDoc])).rejects.toThrow(
        FilingError,
      );
    });
  });

  describe('Filing Submission', () => {
    beforeEach(() => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-key',
      });
    });

    it('should submit filing successfully', async () => {
      const result = await adapter.submit(testDocuments, testMetadata);

      expect(result.success).toBe(true);
      expect(result.filingId).toBeDefined();
      expect(result.referenceNumber).toBeDefined();
      expect(result.submittedAt).toBeInstanceOf(Date);
    });

    it('should require credentials before submission', async () => {
      const newAdapter = new TestFilingAdapter();

      try {
        await newAdapter.submit(testDocuments, testMetadata);
        fail('Should have thrown auth error');
      } catch (error) {
        expect(error).toBeInstanceOf(FilingError);
        if (error instanceof FilingError) {
          expect(error.code).toBe('AUTH_MISSING');
        }
      }
    });
  });

  describe('Status Tracking', () => {
    beforeEach(() => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-key',
      });
    });

    it('should retrieve filing status', async () => {
      const status = await adapter.getStatus('TEST-2024-001');

      expect(status.filingId).toBe('TEST-2024-001');
      expect(status.referenceNumber).toBeDefined();
      expect(status.status).toBe('processing');
      expect(status.lastUpdatedAt).toBeInstanceOf(Date);
    });

    it('should include estimated completion date', async () => {
      const status = await adapter.getStatus('TEST-2024-001');
      expect(status.estimatedCompletionDate).toBeInstanceOf(Date);
    });
  });

  describe('Webhook Processing', () => {
    it('should process valid webhook payload', async () => {
      const payload = {
        filingId: 'TEST-2024-001',
        referenceNumber: 'REF-123456',
        previousStatus: 'processing',
        newStatus: 'accepted',
        signature: 'valid-signature',
        timestamp: Date.now(),
      };

      const update = await adapter.handleWebhook(payload);
      expect(update.filingId).toBe('TEST-2024-001');
      expect(update.newStatus).toBe('accepted');
    });

    it('should reject webhook without signature', async () => {
      const payload = {
        filingId: 'TEST-2024-001',
        previousStatus: 'processing',
        newStatus: 'accepted',
      };

      try {
        await adapter.handleWebhook(payload);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(FilingError);
        if (error instanceof FilingError) {
          expect(error.code).toBe('INVALID_WEBHOOK');
        }
      }
    });
  });

  describe('Authentication Methods', () => {
    it('should build API key auth headers', () => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-api-key',
      });

      const headers = adapter['buildAuthHeaders']();
      expect(headers['Authorization']).toBe('Bearer test-api-key');
    });

    it('should build OAuth2 auth headers', () => {
      adapter.setCredentials({
        method: 'oauth2',
        accessToken: 'oauth-token',
      });

      const headers = adapter['buildAuthHeaders']();
      expect(headers['Authorization']).toBe('Bearer oauth-token');
    });

    it('should build basic auth headers', () => {
      adapter.setCredentials({
        method: 'basic_auth',
        username: 'user',
        password: 'pass',
      });

      const headers = adapter['buildAuthHeaders']();
      const expected = Buffer.from('user:pass').toString('base64');
      expect(headers['Authorization']).toBe(`Basic ${expected}`);
    });

    it('should include custom headers', () => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-key',
        customHeaders: {
          'X-Custom-Header': 'custom-value',
          'X-Request-ID': 'req-123',
        },
      });

      const headers = adapter['buildAuthHeaders']();
      expect(headers['X-Custom-Header']).toBe('custom-value');
      expect(headers['X-Request-ID']).toBe('req-123');
    });
  });

  describe('Retry Logic', () => {
    beforeEach(() => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-key',
      });

      adapter.setRetryConfig({
        maxRetries: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
      });
    });

    it('should calculate exponential backoff correctly', () => {
      const delay0 = adapter['calculateBackoffDelay'](0);
      const delay1 = adapter['calculateBackoffDelay'](1);
      const delay2 = adapter['calculateBackoffDelay'](2);

      expect(delay0).toBeGreaterThan(0);
      expect(delay1).toBeGreaterThanOrEqual(delay0);
      expect(delay2).toBeGreaterThanOrEqual(delay1);
    });

    it('should not exceed max delay', () => {
      const maxDelay = 1000;
      adapter.setRetryConfig({ maxDelayMs: maxDelay });

      for (let i = 0; i < 10; i++) {
        const delay = adapter['calculateBackoffDelay'](i);
        expect(delay).toBeLessThanOrEqual(maxDelay);
      }
    });

    it('should identify retryable status codes', () => {
      expect(adapter['isRetryableStatusCode'](500)).toBe(true);
      expect(adapter['isRetryableStatusCode'](503)).toBe(true);
      expect(adapter['isRetryableStatusCode'](400)).toBe(false);
    });
  });

  describe('Configuration & Info', () => {
    it('should return adapter version', () => {
      const version = adapter.getAdapterVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });

    it('should return adapter config', () => {
      const config = adapter.getAdapterConfig();
      expect(config).toBeDefined();
      expect(config.apiBaseUrl).toBe('https://api.example.com');
    });

    it('should list required documents', () => {
      const required = adapter.getRequiredDocuments();
      expect(required).toContain(DocumentType.PROSPECTUS);
      expect(required).toContain(DocumentType.FINANCIAL_STATEMENTS);
    });

    it('should perform health check', async () => {
      adapter.setCredentials({
        method: 'api_key',
        apiKey: 'test-key',
      });

      const health = await adapter.healthCheck();
      expect(health.isHealthy).toBe(true);
      expect(health.lastCheckedAt).toBeInstanceOf(Date);
    });
  });
});
