# Restful API Adapter Template - Usage Guide

## Overview

This template provides a complete structure for integrating with regulatory authorities that offer RESTful APIs (HTTP/HTTPS with JSON). This is the most common pattern globally.

## When to Use This Template

Use this template when:
- The regulatory authority provides HTTP/HTTPS APIs
- Responses are in JSON format
- Authentication is via API keys, OAuth2, or certificates
- Standard REST patterns (GET/POST/PUT/DELETE)

**Example Countries:**
- Japan TSE (Tokyo Stock Exchange)
- Singapore SGX (Singapore Exchange)
- Australia ASX (Australian Securities Exchange)
- Hong Kong HKEX
- Malaysia Bursa
- India NSE/BSE

## Implementation Steps (4 hours)

### Step 1: Copy the Template (15 minutes)

```bash
cp src/lib/filing-adapters/templates/RestfulAdapterTemplate.ts \
   src/lib/filing-adapters/JapanTSEAdapter.ts
```

### Step 2: Customize Type Definitions (30 minutes)

Update the types section with your country's specific forms and status values:

```typescript
// JapanTSEAdapter.ts - CUSTOMIZE THESE

export type JapanFilingForm =
  | 'PROSPECTUS'        // Japanese prospectus (目論見書)
  | 'FINANCIAL_STMT'    // Financial statements (財務諸表)
  | 'AUDIT_REPORT'      // Audit report (監査報告書)
  | 'AMENDMENT'         // Amendment (修正届出)
  | 'SUPPLEMENT';       // Supplementary info (追加情報)

export type JapanFilingStage =
  | 'submitted'         // 提出済み
  | 'reviewing'         // 審査中
  | 'approved'          // 承認
  | 'rejected'          // 却下
  | 'effective';        // 有効

export enum JapanRejectionCode {
  TRANSLATION_REQUIRED = 'TRANSLATION_REQUIRED',
  JAPANESE_COMPANY_ACT_VIOLATION = 'COMPANY_ACT_VIOLATION',
  FINANCIAL_INSTRUMENTS_EXCHANGE_ACT = 'FIE_ACT_VIOLATION',
  INSUFFICIENT_DISCLOSURE = 'INSUFFICIENT_DISCLOSURE',
  // Add country-specific codes
}

// Update the interface name
export interface JapanFilingConfig extends CountryFilingConfig {
  // Add Japan-specific fields
  fsaRegistrationId?: string;  // Financial Services Agency registration
  exchangeCode: string;         // TSE, OSE, JASDAQ
  settlementDate?: Date;        // Settlement date (決済日)
}
```

### Step 3: Update API Endpoints (30 minutes)

Replace placeholder API URLs with actual ones from your regulatory authority:

```typescript
// In the adapter class

private apiBaseUrl: string = process.env.TSE_API_BASE_URL ||
  'https://api.jpx.co.jp/filings/v2';

private apiEndpoints = {
  submit: '/jpx/prospectuses/submit',           // Updated
  getStatus: '/jpx/prospectuses/{filingId}',    // Updated
  getDocuments: '/jpx/prospectuses/{filingId}/documents',
  update: '/jpx/prospectuses/{filingId}/amend',
  withdraw: '/jpx/prospectuses/{filingId}/withdraw',
};
```

### Step 4: Implement Validation Rules (1.5 hours)

Add country-specific validation in the validate() method:

```typescript
// JapanTSEAdapter.ts

private async validateProspectusContent(doc: DocumentMetadata): Promise<void> {
  const content = doc.content as string;

  // Japan-specific rules
  // 1. Check for required Japanese translation
  if (!content.includes('日本語')) {
    throw new FilingError(
      'TRANSLATION_MISSING',
      'Prospectus must include Japanese translation per TSE requirements',
      false,
      400
    );
  }

  // 2. Verify company information section
  if (!content.includes('会社の概要')) {
    throw new FilingError(
      'MISSING_COMPANY_INFO',
      'Prospectus missing required company information section',
      false,
      400
    );
  }

  // 3. Check for risk factors (must be 5+ pages)
  const riskSectionRegex = /リスク要因[\s\S]{0,20000}(?=\n\n|\Z)/;
  const riskSection = content.match(riskSectionRegex);
  if (!riskSection || riskSection[0].length < 10000) {
    throw new FilingError(
      'INSUFFICIENT_RISK_DISCLOSURE',
      'Risk factors section must be comprehensive (at least 5 pages)',
      false,
      400
    );
  }
}

private async validateFinancialStatementsFormat(doc: DocumentMetadata): Promise<void> {
  // Japan uses XBRL for financial statements
  const content = doc.content as string;

  if (doc.format === 'xml') {
    if (!content.includes('xbrl') || !content.includes('ix:nonfraction')) {
      throw new FilingError(
        'INVALID_XBRL',
        'Financial statements must be in XBRL format per TSE requirements',
        false,
        400
      );
    }
  }

  // Check fiscal year-end matches company (must be March 31 for many Japanese companies)
  if (this.countryConfig?.filingType === 'PROSPECTUS') {
    const fiscalYearRegex = /決算期[\s：]*(\d{4}年\d{1,2}月\d{1,2}日)/;
    const matches = content.match(fiscalYearRegex);
    if (!matches) {
      throw new FilingError(
        'MISSING_FISCAL_YEAR',
        'Fiscal year-end information required',
        false,
        400
      );
    }
  }
}

private async validateRegulatoryCompliance(
  documents: DocumentMetadata[],
  warnings: string[]
): Promise<void> {
  // TSE (Tokyo Stock Exchange) specific validations
  
  // 1. Check all required exhibits are present
  const hasUnderwritingAgreement = documents.some(
    d => d.type === 'underwriting_agreement'
  );
  if (!hasUnderwritingAgreement) {
    warnings.push('TSE typically requires underwriting agreement');
  }

  // 2. Verify auditor firm registration
  if (!this.countryConfig?.auditFirmId) {
    warnings.push('Auditor CPAAOB registration number should be provided');
  }

  // 3. Check for any missing corporate governance info
  const govDocs = documents.filter(d => d.type === 'corporate_governance');
  if (govDocs.length === 0) {
    warnings.push('Corporate governance documents recommended for TSE listing');
  }
}
```

### Step 5: Configure Authentication (30 minutes)

Set up environment variables and credentials:

```bash
# .env.example

# Japan TSE Adapter Configuration
TSE_API_BASE_URL=https://api.jpx.co.jp/filings/v2
TSE_API_KEY=your_tse_api_key_here
TSE_API_SECRET=your_tse_api_secret_here
TSE_WEBHOOK_SECRET=your_webhook_secret_here

# Authentication method: api_key, oauth2, certificate, or basic_auth
TSE_AUTH_METHOD=api_key
TSE_CERTIFICATE_PATH=/path/to/certificate.pem
TSE_CERTIFICATE_PASSWORD=certificate_password
```

Load credentials in your initialization code:

```typescript
// In your filing service setup

import { JapanTSEAdapter } from './adapters/JapanTSEAdapter';

const adapter = new JapanTSEAdapter({
  companyRegistrationId: company.tseCikNumber,
  companyName: company.name,
  jurisdiction: 'JP',
  submittingAgentName: 'John Doe',
  submittingAgentEmail: 'john@company.com',
  filingType: 'PROSPECTUS',
  exchangeCode: 'TSE',
});

// Set credentials from environment
adapter.setCredentials({
  method: 'api_key',
  apiKey: process.env.TSE_API_KEY!,
  apiSecret: process.env.TSE_API_SECRET,
});

adapter.setLogger(logger);
```

### Step 6: Implement Webhook Signature Verification (30 minutes)

Update the webhook signature verification for your regulatory authority:

```typescript
// JapanTSEAdapter.ts

protected verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string
): boolean {
  try {
    // TSE uses HMAC-SHA256 with timestamp
    const timestamp = payload.timestamp;
    const filingId = payload.filingId;
    const status = payload.newStatus;
    
    // Reconstruct the message that was signed
    const message = `${timestamp}.${filingId}.${status}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    // Also check timestamp is recent (within 5 minutes)
    const webhookTime = new Date(timestamp).getTime();
    const now = Date.now();
    if (Math.abs(now - webhookTime) > 5 * 60 * 1000) {
      this.logWarn('Webhook timestamp is too old', { timestamp });
      return false;
    }

    return expectedSignature === signature;
  } catch (error) {
    this.logError('Webhook signature verification failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
```

### Step 7: Register Webhook Endpoint (15 minutes)

Create an API endpoint to receive webhooks:

```typescript
// src/app/api/filing/webhooks/japan-tse/route.ts

import { JapanTSEAdapter } from '@/lib/filing-adapters/JapanTSEAdapter';
import { NextRequest, NextResponse } from 'next/server';

const adapter = new JapanTSEAdapter();

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Process webhook
    const statusUpdate = await adapter.handleWebhook(payload);

    // TODO: Update database with new status
    // await updateFilingStatus(statusUpdate);

    return NextResponse.json({
      success: true,
      filingId: statusUpdate.filingId,
      newStatus: statusUpdate.newStatus,
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
```

Register webhook URL in TSE portal:
- Go to: https://api.jpx.co.jp/settings
- Webhooks section
- Add: https://yourapp.com/api/filing/webhooks/japan-tse

### Step 8: Add to Filing Adapter Registry (15 minutes)

Update the adapter registry:

```typescript
// src/lib/filing-adapters/index.ts

import { JapanTSEAdapter } from './JapanTSEAdapter';
import { SECEdgarAdapter } from './SECEdgarAdapter';
import { SEDARAdapter } from './SEDARAdapter';

export const FILING_ADAPTERS = {
  'us-sec': SECEdgarAdapter,
  'ca-sedar': SEDARAdapter,
  'jp-tse': JapanTSEAdapter,  // Add this
};

export function getAdapter(jurisdiction: string) {
  const AdapterClass = FILING_ADAPTERS[jurisdiction as keyof typeof FILING_ADAPTERS];
  if (!AdapterClass) {
    throw new Error(`No adapter found for jurisdiction: ${jurisdiction}`);
  }
  return new AdapterClass();
}
```

### Step 9: Write Unit Tests (30 minutes)

Create tests following the pattern in `BaseFilingAdapter.test.ts`:

```typescript
// JapanTSEAdapter.test.ts

import { JapanTSEAdapter } from './JapanTSEAdapter';
import { DocumentMetadata } from '../BaseFilingAdapter';

describe('JapanTSEAdapter', () => {
  let adapter: JapanTSEAdapter;

  beforeEach(() => {
    adapter = new JapanTSEAdapter({
      companyRegistrationId: '0123456789',
      companyName: 'Test Company Inc.',
      jurisdiction: 'JP',
      submittingAgentName: 'Test Agent',
      submittingAgentEmail: 'agent@test.com',
      filingType: 'PROSPECTUS',
      exchangeCode: 'TSE',
    });

    adapter.setCredentials({
      method: 'api_key',
      apiKey: 'test-api-key',
      apiSecret: 'test-secret',
    });
  });

  describe('validate', () => {
    it('should reject prospectus without Japanese translation', async () => {
      const doc: DocumentMetadata = {
        id: 'test-1',
        type: 'prospectus',
        format: 'text',
        fileName: 'prospectus.txt',
        mimeType: 'text/plain',
        size: 1000,
        checksum: 'abc123',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: 'English prospectus only',
      };

      const result = await adapter.validate([doc]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'TRANSLATION_MISSING')).toBe(true);
    });

    it('should accept valid prospectus with Japanese translation', async () => {
      const doc: DocumentMetadata = {
        id: 'test-1',
        type: 'prospectus',
        format: 'text',
        fileName: 'prospectus.txt',
        mimeType: 'text/plain',
        size: 1000,
        checksum: 'abc123',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: `
          English content here...
          日本語での説明書...
          会社の概要
          リスク要因...長い説明...
        `,
      };

      const result = await adapter.validate([doc]);
      expect(result.isValid).toBe(true);
    });
  });

  describe('submit', () => {
    it('should successfully submit documents', async () => {
      // Mock the API response
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              filingId: 'tse-2024-001',
              referenceNumber: 'REF-001',
              timestamp: new Date().toISOString(),
              status: 'submitted',
            }),
        })
      );

      const doc: DocumentMetadata = {
        id: 'test-1',
        type: 'prospectus',
        format: 'text',
        fileName: 'prospectus.txt',
        mimeType: 'text/plain',
        size: 1000,
        checksum: 'abc123',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        content: '日本語での説明...',
      };

      const result = await adapter.submit([doc], {
        companyId: 'comp-123',
        companyName: 'Test Company',
        filingType: 'PROSPECTUS',
        currencyCode: 'JPY',
        country: 'JP',
        submittedBy: 'user@test.com',
      });

      expect(result.success).toBe(true);
      expect(result.filingId).toBe('tse-2024-001');
    });
  });

  describe('webhook', () => {
    it('should correctly verify webhook signatures', () => {
      const payload = {
        filingId: 'tse-2024-001',
        referenceNumber: 'REF-001',
        timestamp: new Date().toISOString(),
        newStatus: 'approved',
      };

      const secret = 'test-webhook-secret';
      const message = `${payload.timestamp}.${payload.filingId}.${payload.newStatus}`;
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      payload.signature = signature;

      const isValid = adapter['verifyWebhookSignature'](
        payload,
        signature,
        secret
      );
      expect(isValid).toBe(true);
    });
  });
});
```

## API Documentation Reference Format

When implementing your adapter, use this checklist to document the regulatory authority's API:

### API Authentication
- [ ] Method: (API Key / OAuth2 / Certificate / Basic Auth)
- [ ] Endpoint: (where to authenticate)
- [ ] Headers required: (e.g., X-API-Key, Authorization)
- [ ] Rate limits: (requests per minute/hour)
- [ ] Timeout: (in seconds)

### Document Submission
- [ ] Endpoint: (POST /submit or similar)
- [ ] Request format: (JSON, XML, multipart-form-data)
- [ ] Maximum payload size:
- [ ] Supported file types:
- [ ] Required metadata fields:
- [ ] Response format:
- [ ] Expected response time:

### Status Polling
- [ ] Endpoint: (GET /status/{id} or similar)
- [ ] Poll interval: (recommended seconds between polls)
- [ ] Status values: (what are the possible statuses)
- [ ] Response format:

### Webhooks
- [ ] Endpoint: (where to register webhooks)
- [ ] Signature algorithm: (HMAC-SHA256, RSA, etc.)
- [ ] Timestamp validation: (is timestamp included?)
- [ ] Events: (what events trigger webhooks)
- [ ] Retry policy: (how many retries, backoff)

## Troubleshooting

### "Authentication Failed" Error
- Verify API key/secret is correct
- Check authentication method matches regulatory authority's requirement
- Ensure credentials are set before calling submit()

### "Invalid Document Format" Error
- Check document content-type matches format field
- Verify required sections are present (e.g., company info, risk factors)
- Test with a sample document from regulatory authority's examples

### "Webhook Signature Verification Failed"
- Verify webhook secret is correctly stored
- Check timestamp is recent (within 5 minutes)
- Ensure signature algorithm matches (HMAC-SHA256 vs RSA, etc.)
- Test with example webhook from regulatory authority

### "API Rate Limited" Error
- Implement exponential backoff (already in base class)
- Check if you're making too many status polls
- Consider implementing polling intervals instead of continuous polling

## Next Steps

1. **Test locally:** Use regulatory authority's sandbox API if available
2. **Integration test:** Test end-to-end with sample documents
3. **Register webhooks:** In regulatory authority's portal
4. **Monitor production:** Set up logging and alerting for failures
5. **Document for your team:** Add internal documentation of your specific implementation

## Additional Resources

- See `/src/lib/filing-adapters/examples/SEDAR_USAGE_EXAMPLE.ts` for a real-world example
- Check `/src/lib/filing-adapters/IMPLEMENTATION_GUIDE.md` for general adapter patterns
- Review `/src/lib/filing-adapters/BaseFilingAdapter.ts` for base class methods
