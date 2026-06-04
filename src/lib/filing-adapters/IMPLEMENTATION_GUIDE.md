# Filing Adapters Implementation Guide

## Overview

This guide explains how to implement a filing adapter for a new country/regulatory jurisdiction using the IPOReady filing adapter framework. The framework is designed to be extensible and template-based, making it straightforward to add support for new filing systems.

## Architecture

The filing adapter system consists of:

1. **BaseFilingAdapter** - Abstract base class defining the interface
2. **Country-specific adapters** (e.g., SEDARAdapter) - Concrete implementations
3. **Utility modules** - Field mappers, validators, error handlers
4. **Type definitions** - Shared interfaces and types

## Step-by-Step Implementation

### Step 1: Create the Adapter Class

Create a new file in `/src/lib/filing-adapters/` named after the jurisdiction (e.g., `FCAAdapter.ts`).

```typescript
import {
  BaseFilingAdapter,
  FilingStatus,
  DocumentType,
  FilingError,
  FilingDocument,
  FilingSubmission,
  ValidationResult,
} from './BaseFilingAdapter'

export class FCAAdapter extends BaseFilingAdapter {
  protected readonly adapterId = 'fca'
  
  // Implement all 4 abstract methods (see Step 2-5 below)
  async validate(submission: FilingSubmission): Promise<ValidationResult> {
    // Implementation
  }

  async convertDocuments(documents: FilingDocument[], format: string): Promise<FilingDocument[]> {
    // Implementation
  }

  async submitFiling(submission: FilingSubmission): Promise<FilingSubmission> {
    // Implementation
  }

  async trackFilingStatus(externalId: string): Promise<FilingSubmission> {
    // Implementation
  }

  protected getSupportedDocumentTypes(): DocumentType[] {
    // Return array of supported document types
  }

  getSupportedForms(): string[] {
    // Return array of supported filing forms
  }
}
```

### Step 2: Implement `validate()` Method

This method validates that the filing meets all regulatory requirements.

```typescript
async validate(submission: FilingSubmission): Promise<ValidationResult> {
  const errors: FilingError[] = []
  const warnings: FilingError[] = []
  const missingFields: string[] = []

  try {
    // Validate required documents
    const docErrors = this.validateRequiredDocuments(submission.documents)
    errors.push(...docErrors)

    // Validate metadata against regulatory requirements
    const metadataErrors = this.validateMetadata(submission.metadata)
    errors.push(...metadataErrors)

    // Check jurisdiction-specific rules
    const ruleErrors = this.validateRegulatoryRules(submission)
    errors.push(...ruleErrors)

    // Any non-critical issues go to warnings
    const ruleWarnings = this.validateRegulatoryWarnings(submission)
    warnings.push(...ruleWarnings)

    const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'error').length === 0

    return { isValid, errors, warnings, missingFields }
  } catch (error) {
    return {
      isValid: false,
      errors: [
        this.createError(
          'VALIDATION_ERROR',
          `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
          'critical'
        ),
      ],
      warnings: [],
      missingFields: [],
    }
  }
}
```

### Step 3: Implement `convertDocuments()` Method

This method converts documents from IPOReady format to the jurisdiction's required format.

```typescript
async convertDocuments(
  documents: FilingDocument[],
  format: string = 'PDF'
): Promise<FilingDocument[]> {
  const converted: FilingDocument[] = []

  for (const doc of documents) {
    try {
      // 1. Validate format is supported
      if (!this.isSupportedFormat(format)) {
        throw new Error(`Unsupported format: ${format}`)
      }

      // 2. Build jurisdiction-specific metadata
      const metadata = await this.buildRegulatorMetadata(doc)

      // 3. Convert document content if needed
      const convertedContent = await this.convertDocumentContent(doc, format)

      // 4. Return converted document
      converted.push({
        ...doc,
        content: convertedContent,
        metadata,
        mimeType: this.getMimeType(format),
      })
    } catch (error) {
      throw new Error(`Document conversion failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return converted
}
```

### Step 4: Implement `submitFiling()` Method

This method handles the actual submission to the regulatory authority's API.

```typescript
async submitFiling(submission: FilingSubmission): Promise<FilingSubmission> {
  try {
    // 1. Validate before submission
    const validation = await this.validate(submission)
    if (!validation.isValid) {
      throw new Error('Filing validation failed')
    }

    // 2. Convert documents to required format
    const convertedDocs = await this.convertDocuments(submission.documents)

    // 3. Build API payload
    const payload = this.buildAPIPayload(submission, convertedDocs)

    // 4. Submit to regulatory API
    const response = await this.submitToAPI(payload)

    // 5. Update submission with response data
    return {
      ...submission,
      externalId: response.filingId,
      status: this.mapStatus(response.status),
      submittedAt: new Date(),
      documents: convertedDocs,
      metadata: {
        ...submission.metadata,
        trackingNumber: response.trackingNumber,
        statusUrl: response.statusUrl,
      },
    }
  } catch (error) {
    throw new Error(`Filing submission failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
```

### Step 5: Implement `trackFilingStatus()` Method

This method checks the current status of a filed document.

```typescript
async trackFilingStatus(externalId: string): Promise<FilingSubmission> {
  try {
    // 1. Query regulatory authority's API
    const statusResponse = await this.queryAPIStatus(externalId)

    // 2. Map rejection reasons to internal format
    const rejectionErrors = this.mapRejectionReasons(statusResponse.rejections || [])

    // 3. Build submission object with current status
    return {
      id: externalId,
      externalId,
      status: this.mapStatus(statusResponse.status),
      documents: [],
      errors: rejectionErrors,
      metadata: {
        lastUpdated: statusResponse.lastUpdated,
        reviewComments: statusResponse.comments,
        nextSteps: statusResponse.nextSteps,
      },
    }
  } catch (error) {
    throw new Error(`Status check failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
```

### Step 6: Create Field Mapper

Create `/src/lib/filing-adapters/utils/{jurisdiction}-field-mapper.ts`:

```typescript
export const FIELD_MAPPINGS = [
  {
    iporeadyFieldName: 'companyLegalName',
    regulatoryFieldName: 'legal_entity_name',
    required: true,
    dataType: 'string',
    validate: (v) => v.length > 0 && v.length <= 500,
    description: 'Legal company name',
  },
  // ... more field mappings
]

export class FieldMapper {
  mapToRegulatoryFormat(iporeadyData: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const mapping of FIELD_MAPPINGS) {
      const value = iporeadyData[mapping.iporeadyFieldName]
      if (value !== undefined) {
        const transformedValue = mapping.transform ? mapping.transform(value) : value
        result[mapping.regulatoryFieldName] = transformedValue
      }
    }
    
    return result
  }

  validateField(fieldName: string, value: any): { valid: boolean; reason?: string } {
    const mapping = FIELD_MAPPINGS.find(m => m.iporeadyFieldName === fieldName)
    if (!mapping) return { valid: false, reason: `Unknown field: ${fieldName}` }
    
    if (mapping.required && !value) {
      return { valid: false, reason: `Required field missing: ${fieldName}` }
    }

    if (mapping.validate && !mapping.validate(value)) {
      return { valid: false, reason: `Invalid value for: ${fieldName}` }
    }

    return { valid: true }
  }
}
```

### Step 7: Create Validator

Create `/src/lib/filing-adapters/utils/{jurisdiction}-validator.ts`:

```typescript
export const REQUIRED_SECTIONS = [
  'Section 1: Company Overview',
  'Section 2: Financial Statements',
  'Section 3: Risk Factors',
  // ... more required sections
]

export class Validator {
  validateCompleteness(document: Record<string, any>): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    for (const section of REQUIRED_SECTIONS) {
      if (!document[section]) {
        missing.push(section)
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    }
  }

  // ... other validation methods
}
```

### Step 8: Update Exports

Update `/src/lib/filing-adapters/index.ts` to export the new adapter:

```typescript
export { FCAAdapter } from './FCAAdapter'
export { FieldMapper as FCAFieldMapper } from './utils/fca-field-mapper'
export { Validator as FCAValidator } from './utils/fca-validator'
```

### Step 9: Create Tests

Create `/src/lib/filing-adapters/__tests__/FCAAdapter.test.ts`:

```typescript
import { FCAAdapter } from '../FCAAdapter'

describe('FCAAdapter', () => {
  let adapter: FCAAdapter

  beforeEach(() => {
    adapter = new FCAAdapter()
  })

  describe('validate', () => {
    test('should validate complete filing', async () => {
      const submission = {
        id: 'test-1',
        documents: [/* ... */],
        errors: [],
        metadata: {/* ... */},
        status: 'draft',
      }

      const result = await adapter.validate(submission)
      expect(result.isValid).toBe(true)
    })

    test('should reject incomplete filing', async () => {
      const submission = {
        id: 'test-2',
        documents: [],
        errors: [],
        metadata: {},
        status: 'draft',
      }

      const result = await adapter.validate(submission)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  // ... more tests
})
```

### Step 10: Create Usage Example

Create `/src/lib/filing-adapters/examples/FCA_USAGE_EXAMPLE.ts`:

```typescript
import { FCAAdapter } from '../FCAAdapter'

export async function submitFCAFiling() {
  const adapter = new FCAAdapter(apiKey, sandboxMode)

  // 1. Prepare filing data
  const filing = { /* ... */ }

  // 2. Validate
  const validation = await adapter.validate(filing)
  if (!validation.isValid) {
    console.error('Validation failed:', validation.errors)
    return
  }

  // 3. Submit
  const result = await adapter.submitFiling(filing)
  console.log('Filed successfully:', result.externalId)

  // 4. Monitor status
  const status = await adapter.trackFilingStatus(result.externalId)
  console.log('Current status:', status.status)
}
```

## Jurisdiction-Specific Considerations

### United States (SEC EDGAR)
- File formats: HTML, XML (XBRL), PDF
- Required forms: S-1, S-3, F-1, etc.
- Financial statements: GAAP or IFRS
- Language: English only
- Key fields: CIK, filing type, company ticker

### European Union (ESMA)
- File formats: XML (ESEF standard)
- Required forms: Prospectus Regulation (2017/1129)
- Financial statements: IFRS
- Languages: Language of the country or English
- Key fields: LEI, ISIN, prospectus language

### Hong Kong (SFC)
- File formats: PDF, Word
- Required forms: Form A1/A2
- Financial statements: IFRS or GAAP
- Languages: English or Chinese
- Key fields: Company registration number, listing venue

### Australia (ASX)
- File formats: PDF
- Required forms: Prospectus form, Product Disclosure Statement
- Financial statements: AIFRS
- Language: English
- Key fields: ASX code, company ACN

## Common Patterns

### Error Handling Pattern
```typescript
private createError(code: string, message: string, severity: 'critical' | 'error' | 'warning' | 'info'): FilingError {
  return {
    code,
    message,
    severity,
    suggestion: this.getSuggestionForError(code),
  }
}
```

### Retry Logic Pattern
```typescript
private async withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      await this.delay(Math.pow(2, attempt) * 1000)
    }
  }
  throw new Error('Max retries exceeded')
}
```

### Status Mapping Pattern
```typescript
private mapStatus(externalStatus: string): FilingStatus {
  const statusMap: Record<string, FilingStatus> = {
    'submitted': 'submitted',
    'under_review': 'processing',
    'approved': 'effective',
    'rejected': 'rejected',
    'withdrawn': 'withdrawn',
  }
  return statusMap[externalStatus] || 'submitted'
}
```

## Best Practices

1. **Validation First** - Always validate before submission
2. **Clear Error Messages** - Provide actionable feedback to users
3. **Retry Logic** - Implement exponential backoff for API calls
4. **Audit Logging** - Log all submission attempts for compliance
5. **Sandbox Testing** - Always provide sandbox mode for testing
6. **Documentation** - Document API-specific quirks and requirements
7. **Timezone Handling** - Be explicit about date/time formats
8. **Character Encoding** - Verify UTF-8 or jurisdiction-specific encoding
9. **File Size Limits** - Validate document sizes before submission
10. **Version Control** - Track API version compatibility

## Testing Checklist

- [ ] Unit tests for validation logic
- [ ] Integration tests with sandbox API
- [ ] Field mapping tests
- [ ] Error handling tests
- [ ] Status tracking tests
- [ ] Document conversion tests
- [ ] Bilingual support tests (if applicable)
- [ ] Edge case tests (oversized files, special characters, etc.)

## Troubleshooting

### Common Issues

1. **API Authentication Failures**
   - Verify API key is valid
   - Check if API endpoint URL is correct
   - Confirm sandbox vs. production mode

2. **Document Format Errors**
   - Validate file format matches regulatory requirements
   - Check document encoding (UTF-8)
   - Verify document structure/sections

3. **Validation Failures**
   - Review error messages for specific field issues
   - Check field mappings are correct
   - Verify required fields are present

4. **Status Tracking Issues**
   - Confirm filing ID is correct
   - Check API permissions for status queries
   - Verify timezone handling in date comparisons

## Resources

- [SEDAR 2 API Documentation](https://www.sedarplus.ca)
- [SEC EDGAR Filing Guide](https://www.sec.gov)
- [ESMA Prospectus Regulation](https://www.esma.europa.eu)
- [ASX Listings Rules](https://www.asx.com.au)
