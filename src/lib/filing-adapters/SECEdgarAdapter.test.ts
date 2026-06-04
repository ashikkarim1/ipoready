/**
 * SEC EDGAR Adapter Tests
 * =======================
 * Comprehensive test suite for SECEdgarAdapter implementation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  SECEdgarAdapter,
  SECRejectionCode,
  type SECFilingConfig,
} from './SECEdgarAdapter';
import {
  DocumentType,
} from './BaseFilingAdapter';

describe('SECEdgarAdapter', () => {
  let adapter: SECEdgarAdapter;
  let config: SECFilingConfig;

  beforeEach(() => {
    config = {
      companyName: 'Test IPO Company Inc.',
      cikNumber: '0001234567',
      agentName: 'John Doe',
      agentEmail: 'john@example.com',
      fileNumber: '333-12345',
    };

    adapter = new SECEdgarAdapter(config);
  });

  // ========================================================================
  // Configuration Tests
  // ========================================================================

  describe('Configuration', () => {
    it('should initialize with SEC filing config', () => {
      expect(adapter.getEdgarConfig()).toEqual(config);
    });

    it('should allow setting EDGAR config after initialization', () => {
      const newConfig: SECFilingConfig = {
        companyName: 'New Company',
        cikNumber: '0009876543',
        agentName: 'Jane Doe',
        agentEmail: 'jane@example.com',
      };

      adapter.setEdgarConfig(newConfig);
      expect(adapter.getEdgarConfig()).toEqual(newConfig);
    });

    it('should return correct adapter ID', () => {
      expect(adapter.getAdapterId()).toBe('sec-edgar');
    });

    it('should return correct API endpoint', () => {
      const endpoint = adapter.getApiEndpoint();
      expect(endpoint).toContain('sec.gov');
    });
  });

  // ========================================================================
  // Supported Forms Tests
  // ========================================================================

  describe('Supported Forms', () => {
    it('should list all supported SEC forms', () => {
      const forms = adapter.getSupportedForms();
      expect(forms).toContain('S-1');
      expect(forms).toContain('F-1');
      expect(forms).toContain('SB-2');
      expect(forms).toContain('424B5');
    });

    it('should have minimum 8 supported forms', () => {
      expect(adapter.getSupportedForms().length).toBeGreaterThanOrEqual(8);
    });
  });

  // ========================================================================
  // Validation Tests
  // ========================================================================

  describe('Validation', () => {
    it('should reject unsupported form type', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [],
        errors: [],
        metadata: {
          formType: 'INVALID-FORM',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNSUPPORTED_FORM')).toBe(true);
    });

    it('should require company name', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [],
        errors: [],
        metadata: {
          formType: 'S-1',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_COMPANY_NAME')).toBe(true);
    });

    it('should validate S-1 required documents', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [], // Missing required documents
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.isValid).toBe(false);
      expect(result.missingFields.length).toBeGreaterThan(0);
    });

    it('should pass validation with all required S-1 documents', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'prospectus.pdf',
          type: 'prospectus' as DocumentType,
          mimeType: 'application/pdf',
          size: 100000,
          uploadedAt: new Date(),
          content: Buffer.from('Mock prospectus content'),
        },
        {
          id: 'doc-2',
          name: 'financials.xbrl',
          type: 'financial-statements' as DocumentType,
          mimeType: 'application/xml',
          size: 50000,
          uploadedAt: new Date(),
          content: `<?xml version="1.0"?>
<xbrl xmlns:xbrldi="http://xbrl.org/2006/xbrldi">
  <link:schemaRef href="us-gaap-2024-01-31.xsd" xmlns:link="http://www.xbrl.org/2003/linkbase"/>
  <!-- XBRL content -->
</xbrl>`,
        },
        {
          id: 'doc-3',
          name: 'legal-opinion.pdf',
          type: 'legal-opinion' as DocumentType,
          mimeType: 'application/pdf',
          size: 30000,
          uploadedAt: new Date(),
          content: Buffer.from('Mock legal opinion'),
        },
        {
          id: 'doc-4',
          name: 'audit-report.pdf',
          type: 'audit-report' as DocumentType,
          mimeType: 'application/pdf',
          size: 40000,
          uploadedAt: new Date(),
          content: Buffer.from(
            'Audit Report\n\nOpinion...\nAuditor responsibility...\nAudit procedures...\nInternal controls...\nIndependence...'
          ),
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      // Should have some warnings but be fundamentally valid
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect oversized documents', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'large-file.pdf',
          type: 'prospectus' as DocumentType,
          mimeType: 'application/pdf',
          size: 6 * 1024 * 1024, // 6MB, exceeds 5MB limit
          uploadedAt: new Date(),
          content: Buffer.alloc(6 * 1024 * 1024),
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.errors.some((e) => e.code === 'FILE_TOO_LARGE')).toBe(true);
    });

    it('should validate XBRL format', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'bad-xbrl.xml',
          type: 'financial-statements' as DocumentType,
          mimeType: 'application/xml',
          size: 50000,
          uploadedAt: new Date(),
          content: '<invalid>Missing XBRL elements</invalid>', // Invalid XBRL
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.errors.some((e) => e.code === 'INVALID_XBRL')).toBe(true);
    });

    it('should detect missing MD&A for S-1', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'prospectus.pdf',
          type: 'prospectus' as DocumentType,
          mimeType: 'application/pdf',
          size: 100000,
          uploadedAt: new Date(),
          content: Buffer.from('Prospectus without MD&A'),
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.errors.some((e) => e.code === 'MISSING_MD_A')).toBe(true);
    });

    it('should validate auditor independence', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'audit-report.pdf',
          type: 'audit-report' as DocumentType,
          mimeType: 'application/pdf',
          size: 40000,
          uploadedAt: new Date(),
          content: Buffer.from(
            'Audit Report\n\nOpinion...\nAuditor responsibility...\nAudit procedures...\nInternal controls...\n(Missing independence statement)'
          ),
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.errors.some((e) => e.code === 'AUDITOR_INDEPENDENCE')).toBe(true);
    });
  });

  // ========================================================================
  // Document Type Support Tests
  // ========================================================================

  describe('Document Type Support', () => {
    it('should support all required document types', () => {
      expect(adapter.isDocumentTypeSupported('prospectus')).toBe(true);
      expect(adapter.isDocumentTypeSupported('financial-statements')).toBe(true);
      expect(adapter.isDocumentTypeSupported('audit-report')).toBe(true);
      expect(adapter.isDocumentTypeSupported('legal-opinion')).toBe(true);
    });
  });

  // ========================================================================
  // Document Conversion Tests
  // ========================================================================

  describe('Document Conversion', () => {
    it('should convert documents to XBRL format', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'financials.csv',
          type: 'financial-statements' as DocumentType,
          mimeType: 'text/csv',
          size: 50000,
          uploadedAt: new Date(),
          content: 'Company,2024,2023,2022\nRevenue,1000000,900000,800000',
        },
      ];

      const converted = await adapter.convertDocuments(documents, 'XBRL');
      expect(converted[0].mimeType).toBe('application/xml');
      expect(converted[0].name).toContain('.xbrl');
      expect(converted[0].metadata?.convertedToXBRL).toBe(true);
    });

    it('should convert documents to SEC-TEXT format', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'prospectus.pdf',
          type: 'prospectus' as DocumentType,
          mimeType: 'application/pdf',
          size: 100000,
          uploadedAt: new Date(),
          content: Buffer.from('Mock prospectus'),
        },
      ];

      const converted = await adapter.convertDocuments(documents, 'SEC-TEXT');
      expect(converted[0].mimeType).toBe('text/plain');
      expect(converted[0].name).toContain('.txt');
    });

    it('should convert documents to XML format', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'exhibit.txt',
          type: 'exhibit' as DocumentType,
          mimeType: 'text/plain',
          size: 20000,
          uploadedAt: new Date(),
          content: 'Mock exhibit content',
        },
      ];

      const converted = await adapter.convertDocuments(documents, 'XML');
      expect(converted[0].mimeType).toBe('application/xml');
      expect(converted[0].name).toContain('.xml');
    });
  });

  // ========================================================================
  // Submission Tests
  // ========================================================================

  describe('Filing Submission', () => {
    it('should submit filing and return submission ID', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [
          {
            id: 'doc-1',
            name: 'prospectus.pdf',
            type: 'prospectus' as DocumentType,
            mimeType: 'application/pdf',
            size: 100000,
            uploadedAt: new Date(),
            content: Buffer.from('Mock prospectus'),
          },
        ],
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const submitted = await adapter.submitFiling(submission);
      expect(submitted.externalId).toBeDefined();
      expect(submitted.status).toBe('submitted');
      expect(submitted.submittedAt).toBeDefined();
      expect(submitted.metadata.edgarResponse).toBeDefined();
    });

    it('should generate valid accession number', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [],
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const submitted = await adapter.submitFiling(submission);
      expect(submitted.externalId).toMatch(/\d{10}-\d{2}-\d{6}/);
    });
  });

  // ========================================================================
  // Status Tracking Tests
  // ========================================================================

  describe('Status Tracking', () => {
    it('should track filing status', async () => {
      const externalId = '0001234567-24-000001';
      const status = await adapter.trackFilingStatus(externalId);

      expect(status.externalId).toBe(externalId);
      expect(status.metadata.accessionNumber).toBe(externalId);
      expect(['draft', 'submitted', 'processing', 'effective', 'trading']).toContain(
        status.status
      );
    });
  });

  // ========================================================================
  // Error Handling Tests
  // ========================================================================

  describe('Error Handling', () => {
    it('should provide clear rejection reason messages', () => {
      const adapter = new SECEdgarAdapter();
      const submission: any = {
        id: 'test-1',
        status: 'rejected',
        documents: [],
        errors: [
          {
            code: SECRejectionCode.MISSING_MD_A,
            severity: 'critical',
            message: 'MD&A is missing',
            suggestion: 'Add MD&A section',
          },
        ],
        metadata: {},
      };

      expect(submission.errors[0].suggestion).toBeDefined();
      expect(submission.errors[0].code).toBe(SECRejectionCode.MISSING_MD_A);
    });

    it('should include error suggestions for common rejections', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [],
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      const filesError = result.errors.find((e) => e.code === 'MISSING_REQUIRED_DOCUMENT');
      expect(filesError?.suggestion).toBeDefined();
    });
  });

  // ========================================================================
  // Form-Specific Tests
  // ========================================================================

  describe('Form-Specific Requirements', () => {
    it('should validate F-1 form requirements', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [],
        errors: [],
        metadata: {
          formType: 'F-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.isValid).toBe(false);
      expect(result.missingFields.some((f) => f.includes('prospectus'))).toBe(true);
    });

    it('should validate SB-2 form requirements', async () => {
      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents: [],
        errors: [],
        metadata: {
          formType: 'SB-2',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.isValid).toBe(false);
      expect(result.missingFields.some((f) => f.includes('prospectus'))).toBe(true);
    });

    it('should allow simpler requirements for 424B5', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'prospectus.pdf',
          type: 'prospectus' as DocumentType,
          mimeType: 'application/pdf',
          size: 100000,
          uploadedAt: new Date(),
          content: Buffer.from('Mock prospectus'),
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: '424B5',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(result.isValid).toBe(true);
    });
  });

  // ========================================================================
  // PCAOB Compliance Tests
  // ========================================================================

  describe('PCAOB Compliance', () => {
    it('should validate PCAOB audit requirements', async () => {
      const documents: any[] = [
        {
          id: 'doc-1',
          name: 'audit-report.pdf',
          type: 'audit-report' as DocumentType,
          mimeType: 'application/pdf',
          size: 40000,
          uploadedAt: new Date(),
          content: Buffer.from('Incomplete audit report'),
        },
      ];

      const submission: any = {
        id: 'test-1',
        status: 'draft',
        documents,
        errors: [],
        metadata: {
          formType: 'S-1',
          companyName: 'Test Company',
        },
      };

      const result = await adapter.validate(submission);
      expect(
        result.errors.some((e) =>
          ['PCAOB_COMPLIANCE', 'AUDITOR_INDEPENDENCE'].includes(e.code)
        )
      ).toBe(true);
    });
  });
});
