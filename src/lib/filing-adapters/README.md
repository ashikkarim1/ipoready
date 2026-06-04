# Filing Adapters System

Central hub for multi-jurisdiction filing system integrations supporting US SEC EDGAR, Canadian CSA systems, and other regulatory frameworks.

## Overview

The Filing Adapters System provides a standardized interface for interacting with different securities regulatory filing systems across jurisdictions. It handles document validation, format conversion, submission workflows, and status tracking.

## Architecture

### Base Architecture

```
BaseFilingAdapter (Abstract)
├── SECEdgarAdapter (US)
├── CSAAdapter (Canada) - Template #3
└── [Other jurisdictions]
```

## Supported Systems

### SEC EDGAR (US)
- **Status**: Fully Implemented
- **Supported Forms**: S-1, S-3, S-4, F-1, F-3, F-10, SB-2, 424B5, 424B4
- **Key Features**:
  - XBRL financial statement support
  - MD&A validation
  - PCAOB audit compliance
  - Real-time status tracking
  - Common rejection reason handling with fix guidance

### CSA (Canada)
- **Status**: Template available (Phase 2)
- **Target Forms**: NI 41-101, NI 41-102
- **Key Features**:
  - Bilingual support (EN/FR)
  - TSX/TSXV/CSE compliance
  - Prospectus-builder integration

## Core Components

### 1. BaseFilingAdapter (Abstract)

Defines the contract for all filing adapters:

```typescript
abstract class BaseFilingAdapter {
  // Validate filing documents and metadata
  abstract validate(submission: FilingSubmission): Promise<ValidationResult>;
  
  // Convert documents to regulatory format
  abstract convertDocuments(
    documents: FilingDocument[],
    format: string
  ): Promise<FilingDocument[]>;
  
  // Submit filing to regulatory system
  abstract submitFiling(submission: FilingSubmission): Promise<FilingSubmission>;
  
  // Track filing status
  abstract trackFilingStatus(externalId: string): Promise<FilingSubmission>;
}
```

### 2. SECEdgarAdapter

Comprehensive implementation for US SEC EDGAR:

```typescript
const adapter = new SECEdgarAdapter({
  companyName: 'MyCompany Inc.',
  cikNumber: '0001234567',
  agentName: 'John Doe',
  agentEmail: 'john@company.com',
  fileNumber: '333-12345',
});

// Validate submission
const validation = await adapter.validate(submission);

// Convert to XBRL
const converted = await adapter.convertDocuments(documents, 'XBRL');

// Submit to SEC
const submitted = await adapter.submitFiling(submission);

// Track status
const status = await adapter.trackFilingStatus(accessionNumber);
```

## Data Types

### FilingSubmission

```typescript
interface FilingSubmission {
  id: string;
  externalId?: string;                    // External system ID (e.g., accession number)
  status: FilingStatus;                   // draft, submitted, processing, effective, trading, etc.
  submittedAt?: Date;
  effectiveAt?: Date;
  tradingStartAt?: Date;
  documents: FilingDocument[];            // Array of submitted documents
  errors: FilingError[];                  // Validation errors
  metadata: Record<string, unknown>;      // System-specific metadata
}
```

### FilingDocument

```typescript
interface FilingDocument {
  id: string;
  name: string;
  type: DocumentType;                     // prospectus, financial-statements, audit-report, etc.
  mimeType: string;
  size: number;
  uploadedAt: Date;
  content: Buffer | string;               // Document content
  metadata?: Record<string, unknown>;     // Format-specific metadata
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: FilingError[];                  // Critical errors blocking submission
  warnings: FilingError[];                // Non-blocking warnings
  missingFields: string[];                // List of missing required fields
}
```

### FilingError

```typescript
interface FilingError {
  code: string;                           // Machine-readable error code
  severity: 'critical' | 'error' | 'warning' | 'info';
  field?: string;                         // Field path where error occurred
  message: string;                        // Human-readable message
  suggestion?: string;                    // How to fix the error
}
```

## SEC-Specific Features

### XBRL Conversion

Automatic conversion of financial statements to XBRL (eXtensible Business Reporting Language):

```typescript
const documents = [
  {
    id: 'financial-2024',
    name: 'financials.csv',
    type: 'financial-statements',
    mimeType: 'text/csv',
    content: '...'
  }
];

const xbrlDocs = await adapter.convertDocuments(documents, 'XBRL');
// Returns XBRL-formatted XML compliant with SEC taxonomy
```

### MD&A Validation

Ensures Management Discussion & Analysis section includes:
- Business overview
- Financial condition
- Results of operations
- Liquidity and capital resources

### PCAOB Compliance

Validates audit reports against Public Company Accounting Oversight Board standards:
- Auditor independence statement
- PCAOB AS (Auditing Standards) compliance
- Required audit procedures documentation

### Common Rejection Reasons

Enum of common SEC rejection codes with automatic fix suggestions:

```typescript
enum SECRejectionCode {
  MISSING_MD_A = 'MISSING_MD_A',
  BAD_FINANCIALS_FORMAT = 'BAD_FINANCIALS_FORMAT',
  INVALID_XBRL = 'INVALID_XBRL',
  INSUFFICIENT_DISCLOSURE = 'INSUFFICIENT_DISCLOSURE',
  AUDITOR_INDEPENDENCE = 'AUDITOR_INDEPENDENCE',
  DEFICIENT_PROSPECTUS = 'DEFICIENT_PROSPECTUS',
  MISSING_EXHIBIT = 'MISSING_EXHIBIT',
  BAD_DOCUMENT_FORMAT = 'BAD_DOCUMENT_FORMAT',
  PCAOB_COMPLIANCE = 'PCAOB_COMPLIANCE',
  FILING_FEE_ISSUE = 'FILING_FEE_ISSUE',
}
```

## Usage Examples

### Basic Filing Submission

```typescript
import { SECEdgarAdapter } from '@/lib/filing-adapters';

// Initialize adapter
const adapter = new SECEdgarAdapter({
  companyName: 'Example Corp',
  cikNumber: '0001234567',
  agentName: 'Jane Smith',
  agentEmail: 'jane@example.com',
});

// Create filing
const submission: FilingSubmission = {
  id: 'filing-001',
  status: 'draft',
  documents: [
    {
      id: 'doc-1',
      name: 'prospectus.pdf',
      type: 'prospectus',
      mimeType: 'application/pdf',
      size: 1024000,
      uploadedAt: new Date(),
      content: prospectusContent,
    },
    // ... more documents
  ],
  errors: [],
  metadata: {
    formType: 'S-1',
    companyName: 'Example Corp',
  },
};

// Validate
const validation = await adapter.validate(submission);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
  return;
}

// Convert to SEC format
const converted = await adapter.convertDocuments(submission.documents, 'XBRL');

// Submit
const submitted = await adapter.submitFiling(submission);
console.log('Submitted with accession number:', submitted.externalId);

// Track status
setInterval(async () => {
  const status = await adapter.trackFilingStatus(submitted.externalId!);
  console.log('Current status:', status.status);
}, 60000); // Poll every minute
```

### Error Handling

```typescript
const result = await adapter.validate(submission);

for (const error of result.errors) {
  console.log(`${error.code}: ${error.message}`);
  if (error.suggestion) {
    console.log(`Fix: ${error.suggestion}`);
  }
  if (error.field) {
    console.log(`Field: ${error.field}`);
  }
}
```

### Document Format Conversion

```typescript
// Convert to XBRL
const xbrlDocs = await adapter.convertDocuments(documents, 'XBRL');

// Convert to SEC text format
const textDocs = await adapter.convertDocuments(documents, 'SEC-TEXT');

// Convert to XML
const xmlDocs = await adapter.convertDocuments(documents, 'XML');
```

## Form Type Requirements

| Form | Required Documents | Use Case |
|------|-------------------|----------|
| S-1  | Prospectus, Financials, Legal Opinion, Audit | Initial IPO (US company) |
| S-3  | Prospectus, Financials | Secondary offering (established co.) |
| S-4  | Prospectus, Financials, Legal Opinion | M&A/Reorganization |
| F-1  | Prospectus, Financials, Legal Opinion, Audit | Initial IPO (foreign company) |
| F-3  | Prospectus, Financials | Secondary offering (foreign) |
| SB-2 | Prospectus, Financials | Small business IPO |
| 424B5| Prospectus | Post-effective prospectus supplement |

## File Size Limits

- **Per File**: 5 MB maximum
- **Total Submission**: 750 MB maximum
- Supported formats: PDF, TXT, HTML, XML, XLS

## Security & Compliance

- All documents validated against SEC schema
- PCAOB audit compliance checking
- Secure credential storage for EDGAR access
- Rate limiting (standard SEC EDGAR limits)
- Audit trail for all submissions

## Testing

Comprehensive test suite included:

```bash
npm test -- SECEdgarAdapter.test.ts
```

Test coverage includes:
- Configuration management
- Form validation
- Document type support
- Format conversion
- Submission workflow
- Status tracking
- Error handling
- PCAOB compliance
- Form-specific requirements

## Phase 2 Roadmap

### Template #3: CSA Adapter (Canadian)
- [ ] Implement CSAAdapter extending BaseFilingAdapter
- [ ] Support NI 41-101, NI 41-102 forms
- [ ] Bilingual prospectus validation (EN/FR)
- [ ] TSX/TSXV/CSE compliance rules
- [ ] Integration with prospectus-builder
- [ ] Currency support (CAD/USD)

### Additional Adapters
- [ ] ASX Adapter (Australia)
- [ ] LSE Adapter (UK)
- [ ] SGX Adapter (Singapore)
- [ ] CSE/TSXV specialized adapters

## Integration Points

- **Prospectus Builder**: Auto-generate documents for submission
- **Cap Table Engine**: Validate ownership structure compliance
- **Checklist System**: Track filing readiness
- **Compliance Rules**: Jurisdiction-specific requirements
- **Notifications**: Status updates and rejection alerts

## API Reference

### SECEdgarAdapter Methods

```typescript
class SECEdgarAdapter extends BaseFilingAdapter {
  // Configuration
  setEdgarConfig(config: SECFilingConfig): void
  getEdgarConfig(): SECFilingConfig | undefined
  getApiEndpoint(): string
  
  // Core operations
  validate(submission: FilingSubmission): Promise<ValidationResult>
  convertDocuments(documents: FilingDocument[], format: string): Promise<FilingDocument[]>
  submitFiling(submission: FilingSubmission): Promise<FilingSubmission>
  trackFilingStatus(externalId: string): Promise<FilingSubmission>
  
  // Query methods
  getSupportedForms(): string[]
  isDocumentTypeSupported(documentType: DocumentType): boolean
  
  // Utilities
  getAdapterId(): string
}
```

## License

Part of IPOReady platform. See LICENSE file for details.
