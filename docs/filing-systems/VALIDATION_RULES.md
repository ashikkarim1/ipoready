# Validation Rules Guide

How to define, implement, and test validation rules specific to each country's filing requirements.

---

## Table of Contents

1. [Rule Definition Structure](#rule-definition-structure)
2. [Document Format Requirements](#document-format-requirements)
3. [Signature Requirements](#signature-requirements)
4. [Language Requirements](#language-requirements)
5. [Custom Validation Examples](#custom-validation-examples)
6. [Cross-Document Validation](#cross-document-validation)
7. [Testing Validation Rules](#testing-validation-rules)
8. [Rule Versioning & Updates](#rule-versioning--updates)

---

## Rule Definition Structure

### Declarative Rule Format

Define validation rules as data structures instead of code:

```typescript
interface ValidationRule {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  documentTypes: DocumentType[]; // Which documents this applies to
  field?: string;                // Which field (if applicable)
  condition: 'required' | 'optional' | 'conditional';
  validators: Validator[];       // Array of validation functions
  errorCode: string;             // Code when validation fails
  errorMessage: string;          // User-friendly message
  severity: 'error' | 'warning'; // Whether blocking or informational
  appliesTo?: {                  // Jurisdiction specificity
    countries?: string[];
    exchangeTypes?: string[];
    listingTypes?: ('ipo' | 'rto')[];
  };
}

interface Validator {
  type: 'format' | 'size' | 'content' | 'custom';
  params?: Record<string, any>;
  fn?: (value: any, context: ValidationContext) => Promise<boolean>;
}
```

### Example: Prospectus Size Rule

```typescript
const prospectusMinSizeRule: ValidationRule = {
  id: 'prospectus_min_size',
  name: 'Prospectus Minimum Size',
  documentTypes: [DocumentType.PROSPECTUS],
  condition: 'required',
  validators: [
    {
      type: 'size',
      params: {
        minBytes: 50000,     // At least 50KB
        maxBytes: 500000000, // Max 500MB
      },
    },
  ],
  errorCode: 'PROSPECTUS_INVALID_SIZE',
  errorMessage: 'Prospectus must be between 50 KB and 500 MB',
  severity: 'error',
  appliesTo: {
    countries: ['Canada', 'USA', 'Japan'],
    listingTypes: ['ipo'],
  },
};
```

---

## Document Format Requirements

### Format Validation Rules

```typescript
const formatRules: Record<string, ValidationRule[]> = {
  prospectus: [
    {
      id: 'prospectus_format',
      name: 'Prospectus Format',
      documentTypes: [DocumentType.PROSPECTUS],
      condition: 'required',
      validators: [
        {
          type: 'format',
          params: {
            allowedFormats: ['pdf', 'pdf/a'],
            allowedMimeTypes: ['application/pdf'],
          },
        },
      ],
      errorCode: 'INVALID_PROSPECTUS_FORMAT',
      errorMessage: 'Prospectus must be PDF format',
      severity: 'error',
    },
    {
      id: 'prospectus_searchable',
      name: 'Prospectus Must Be Searchable',
      documentTypes: [DocumentType.PROSPECTUS],
      condition: 'required',
      validators: [
        {
          type: 'custom',
          fn: async (doc: DocumentMetadata) => {
            // Check if PDF is searchable (not scanned image)
            return isPDFSearchable(doc.content as Buffer);
          },
        },
      ],
      errorCode: 'PROSPECTUS_NOT_SEARCHABLE',
      errorMessage: 'Prospectus must be searchable text, not scanned image',
      severity: 'error',
    },
  ],

  financial_statements: [
    {
      id: 'financials_format_flexible',
      name: 'Financial Statements Format',
      documentTypes: [DocumentType.FINANCIAL_STATEMENTS],
      condition: 'required',
      validators: [
        {
          type: 'format',
          params: {
            allowedFormats: ['pdf', 'xlsx', 'csv', 'json'],
          },
        },
      ],
      errorCode: 'INVALID_FINANCIAL_FORMAT',
      errorMessage: 'Financial statements must be PDF, Excel, CSV, or JSON',
      severity: 'error',
    },
  ],

  auditor_report: [
    {
      id: 'auditor_report_format',
      name: 'Auditor Report Format',
      documentTypes: [DocumentType.AUDITOR_REPORT],
      condition: 'required',
      validators: [
        {
          type: 'format',
          params: {
            allowedFormats: ['pdf'],
          },
        },
      ],
      errorCode: 'INVALID_AUDIT_FORMAT',
      errorMessage: 'Auditor report must be in PDF format',
      severity: 'error',
    },
  ],
};
```

### File Encoding Validation

```typescript
const encodingRules: ValidationRule[] = [
  {
    id: 'utf8_encoding',
    name: 'UTF-8 Encoding Required',
    documentTypes: [DocumentType.PROSPECTUS],
    condition: 'required',
    validators: [
      {
        type: 'custom',
        fn: async (doc: DocumentMetadata) => {
          try {
            if (Buffer.isBuffer(doc.content)) {
              doc.content.toString('utf-8');
            }
            return true;
          } catch {
            return false;
          }
        },
      },
    ],
    errorCode: 'INVALID_ENCODING',
    errorMessage: 'Document must be UTF-8 encoded',
    severity: 'error',
  },
];
```

---

## Signature Requirements

### Digital Signature Validation

```typescript
interface SignatureRequirement {
  documentTypes: DocumentType[];
  required: boolean;
  signatureType: 'handwritten' | 'digital' | 'esignature';
  signatureFormat: string;              // e.g., 'PKIX', 'CMS', 'XMLDSig'
  certificateRequirements?: {
    issuer?: string;                   // e.g., "Canadian Government"
    keyLength?: number;                // 2048, 4096, etc.
    algorithm?: string;                // RSA, ECDSA, etc.
  };
  signedBy: {
    title: string;                     // e.g., "CEO", "CFO"
    canDelegate?: boolean;
    delegationAllowed?: string[];
  };
}
```

### Example: CEO Signature Requirement

```typescript
const ceoSignatureRule: SignatureRequirement = {
  documentTypes: [DocumentType.PROSPECTUS],
  required: true,
  signatureType: 'esignature',
  signatureFormat: 'PKIX',
  certificateRequirements: {
    issuer: 'Canadian Government',
    keyLength: 2048,
    algorithm: 'RSA',
  },
  signedBy: {
    title: 'Chief Executive Officer',
    canDelegate: false,
  },
};

// Validation implementation
async function validateSignature(
  doc: DocumentMetadata,
  requirement: SignatureRequirement
): Promise<ValidationError | null> {
  // Extract signature from PDF
  const signature = extractSignatureFromPDF(doc.content as Buffer);

  if (!signature && requirement.required) {
    return {
      documentId: doc.id,
      documentType: doc.type,
      code: 'MISSING_SIGNATURE',
      message: `${requirement.signedBy.title} signature required`,
      severity: 'error',
    };
  }

  // Verify signature validity
  const isValid = await verifyDigitalSignature(
    signature,
    doc.content as Buffer,
    requirement.certificateRequirements
  );

  if (!isValid) {
    return {
      documentId: doc.id,
      documentType: doc.type,
      code: 'INVALID_SIGNATURE',
      message: 'Signature verification failed or invalid certificate',
      severity: 'error',
    };
  }

  return null;
}
```

### Multi-Signature Support

```typescript
interface MultiSignatureRequirement {
  signaturesRequired: SignatureRequirement[];
  allRequired: boolean;  // If true, all must be present; if false, any one is sufficient
}

// Example: Either CEO or CFO can sign
const executiveSignatureRule: MultiSignatureRequirement = {
  signaturesRequired: [
    {
      documentTypes: [DocumentType.PROSPECTUS],
      required: true,
      signatureType: 'esignature',
      signatureFormat: 'PKIX',
      signedBy: { title: 'Chief Executive Officer' },
    },
    {
      documentTypes: [DocumentType.PROSPECTUS],
      required: true,
      signatureType: 'esignature',
      signatureFormat: 'PKIX',
      signedBy: { title: 'Chief Financial Officer' },
    },
  ],
  allRequired: false,  // At least one of the two
};
```

---

## Language Requirements

### Multi-Language Validation

```typescript
interface LanguageRequirement {
  documentTypes: DocumentType[];
  required: string[];         // e.g., ['en', 'fr']
  optional?: string[];        // e.g., ['de', 'ja']
  minCoverage?: number;       // e.g., 0.95 for 95% translated
  rtlLanguages?: boolean;     // Support right-to-left languages
}

// Canadian requirement: English and French
const bilingualRequirement: LanguageRequirement = {
  documentTypes: [DocumentType.PROSPECTUS, DocumentType.FINANCIAL_STATEMENTS],
  required: ['en', 'fr'],
  minCoverage: 0.98,  // 98% of content translated
  rtlLanguages: false,
};

// Japanese requirement: Bilingual acceptable
const japaneseLanguageRequirement: LanguageRequirement = {
  documentTypes: [DocumentType.PROSPECTUS],
  required: ['ja'],
  optional: ['en'],
  minCoverage: 1.0,  // Japanese must be 100%
};
```

### Language Validation Implementation

```typescript
async function validateLanguage(
  doc: DocumentMetadata,
  requirement: LanguageRequirement
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Detect document language
  const detectedLanguages = detectLanguages(doc.content as string | Buffer);

  // Check required languages
  for (const requiredLang of requirement.required) {
    const coverage = detectedLanguages[requiredLang] || 0;

    if (coverage < (requirement.minCoverage || 0.8)) {
      errors.push({
        documentId: doc.id,
        documentType: doc.type,
        field: 'language',
        code: 'INSUFFICIENT_LANGUAGE_COVERAGE',
        message: `${requiredLang.toUpperCase()} coverage too low: ${(coverage * 100).toFixed(1)}%`,
        severity: 'error',
      });
    }
  }

  return errors;
}

// Language detection using external library or ML model
function detectLanguages(
  content: string | Buffer
): Record<string, number> {
  const textContent = typeof content === 'string'
    ? content
    : content.toString('utf-8');

  // Use language detection library
  const detect = require('detect-language');
  return detect(textContent);
}
```

---

## Custom Validation Examples

### Example 1: SEC XBRL Validation

```typescript
const xbrlValidationRule: ValidationRule = {
  id: 'sec_xbrl_valid',
  name: 'SEC XBRL Format Validation',
  documentTypes: [DocumentType.FINANCIAL_STATEMENTS],
  condition: 'conditional',
  validators: [
    {
      type: 'custom',
      fn: async (doc: DocumentMetadata, context: ValidationContext) => {
        // Only required for SEC filings
        if (context.filingSystem !== 'sec') {
          return true;
        }

        // Validate XBRL structure
        const isValid = validateXBRL(doc.content as string);
        return isValid;
      },
    },
  ],
  errorCode: 'INVALID_XBRL',
  errorMessage: 'Financial statements do not conform to SEC XBRL taxonomy',
  severity: 'error',
  appliesTo: { countries: ['USA'] },
};

function validateXBRL(content: string): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');

  // Check for required XBRL elements
  const requiredElements = [
    'xbrli:xbrl',
    'xbrli:context',
    'xbrli:unit',
  ];

  for (const element of requiredElements) {
    if (!doc.querySelector(element)) {
      return false;
    }
  }

  return true;
}
```

### Example 2: MD&A Content Validation

```typescript
const mdaValidationRule: ValidationRule = {
  id: 'mda_comprehensive',
  name: 'MD&A Comprehensive Requirements',
  documentTypes: [DocumentType.PROSPECTUS],
  condition: 'required',
  validators: [
    {
      type: 'custom',
      fn: async (doc: DocumentMetadata) => {
        const content = doc.content as string;

        // MD&A must include specific sections
        const requiredSections = [
          'Business Overview',
          'Financial Condition',
          'Results of Operations',
          'Liquidity and Capital Resources',
          'Risk Factors',
        ];

        // Use case-insensitive search
        const contentLower = content.toLowerCase();

        return requiredSections.every(section =>
          contentLower.includes(section.toLowerCase())
        );
      },
    },
  ],
  errorCode: 'INSUFFICIENT_MDA',
  errorMessage: 'Prospectus MD&A is missing required sections',
  severity: 'error',
  appliesTo: { countries: ['USA', 'Canada'] },
};
```

### Example 3: Financial Data Consistency

```typescript
const financialConsistencyRule: ValidationRule = {
  id: 'financials_consistent',
  name: 'Financial Statement Consistency',
  documentTypes: [DocumentType.FINANCIAL_STATEMENTS],
  condition: 'required',
  validators: [
    {
      type: 'custom',
      fn: async (
        doc: DocumentMetadata,
        context: ValidationContext
      ) => {
        // Parse financial data
        const financials = parseFinancialStatements(
          doc.content as string | Buffer,
          doc.format
        );

        if (!financials) {
          return false;
        }

        // Check Balance Sheet equation: Assets = Liabilities + Equity
        const assets = sumAssets(financials);
        const liabilitiesAndEquity =
          sumLiabilities(financials) + sumEquity(financials);

        // Allow 1% tolerance for rounding
        const difference = Math.abs(assets - liabilitiesAndEquity) / assets;
        return difference < 0.01;
      },
    },
  ],
  errorCode: 'FINANCIAL_INCONSISTENCY',
  errorMessage: 'Balance sheet does not balance (Assets ≠ Liabilities + Equity)',
  severity: 'error',
};

function parseFinancialStatements(
  content: string | Buffer,
  format: string
): Record<string, any> | null {
  if (format === 'json') {
    try {
      return JSON.parse(
        typeof content === 'string' ? content : content.toString('utf-8')
      );
    } catch {
      return null;
    }
  }

  if (format === 'csv') {
    // Parse CSV format
    return parseCSV(content as string);
  }

  // Add more formats as needed
  return null;
}
```

### Example 4: Document Count Validation

```typescript
const allRequiredDocsRule: ValidationRule = {
  id: 'all_required_docs',
  name: 'All Required Documents Present',
  documentTypes: Object.values(DocumentType),
  condition: 'required',
  validators: [
    {
      type: 'custom',
      fn: async (docs: DocumentMetadata[]) => {
        // Get required documents from filing system adapter
        const required = getRequiredDocuments();
        const provided = new Set(docs.map(d => d.type));

        // All required documents must be present
        return required.every(req => provided.has(req));
      },
    },
  ],
  errorCode: 'MISSING_REQUIRED_DOCUMENT',
  errorMessage: 'Not all required documents provided',
  severity: 'error',
};
```

---

## Cross-Document Validation

### Document Relationship Validation

```typescript
interface CrossDocumentRule {
  id: string;
  name: string;
  documents: DocumentType[];  // Which docs must be validated together
  validator: (docs: DocumentMetadata[]) => Promise<ValidationError[]>;
}

// Example: Prospectus and financials must reference same period
const consistentPeriodRule: CrossDocumentRule = {
  id: 'consistent_period',
  name: 'Prospectus and Financials Same Period',
  documents: [DocumentType.PROSPECTUS, DocumentType.FINANCIAL_STATEMENTS],
  validator: async (docs: DocumentMetadata[]) => {
    const errors: ValidationError[] = [];

    const prospectus = docs.find(d => d.type === DocumentType.PROSPECTUS);
    const financials = docs.find(
      d => d.type === DocumentType.FINANCIAL_STATEMENTS
    );

    if (!prospectus || !financials) {
      return errors;
    }

    const prospectusDate = extractFiscalYearEnd(prospectus.content as string);
    const financialsDate = extractFiscalYearEnd(
      financials.content as string
    );

    if (prospectusDate !== financialsDate) {
      errors.push({
        documentId: prospectus.id,
        documentType: prospectus.type,
        field: 'fiscal_year_end',
        code: 'PERIOD_MISMATCH',
        message: `Prospectus fiscal year (${prospectusDate}) does not match financials (${financialsDate})`,
        severity: 'error',
      });
    }

    return errors;
  },
};

// Example: Financial amounts match between prospectus and statements
const consistentAmountsRule: CrossDocumentRule = {
  id: 'consistent_amounts',
  name: 'Financial Amounts Consistent',
  documents: [DocumentType.PROSPECTUS, DocumentType.FINANCIAL_STATEMENTS],
  validator: async (docs: DocumentMetadata[]) => {
    const errors: ValidationError[] = [];

    const prospectus = docs.find(d => d.type === DocumentType.PROSPECTUS);
    const financials = docs.find(
      d => d.type === DocumentType.FINANCIAL_STATEMENTS
    );

    if (!prospectus || !financials) {
      return errors;
    }

    // Extract amounts
    const prospectusAmounts = extractFinancialAmounts(
      prospectus.content as string
    );
    const statementAmounts = extractFinancialAmounts(
      financials.content as string
    );

    // Compare key amounts (with reasonable tolerance)
    const tolerance = 0.02;  // 2% tolerance
    for (const key in prospectusAmounts) {
      const diff = Math.abs(
        (prospectusAmounts[key] - statementAmounts[key]) /
          statementAmounts[key]
      );

      if (diff > tolerance) {
        errors.push({
          documentId: prospectus.id,
          documentType: prospectus.type,
          field: key,
          code: 'AMOUNT_MISMATCH',
          message: `Prospectus ${key} does not match financial statements (difference: ${(diff * 100).toFixed(1)}%)`,
          severity: 'warning',  // Warning, not error
        });
      }
    }

    return errors;
  },
};
```

---

## Testing Validation Rules

### Unit Tests

```typescript
describe('Validation Rules', () => {
  describe('prospectus_min_size', () => {
    it('should accept prospectus >= 50KB', () => {
      const doc: DocumentMetadata = {
        id: 'doc1',
        type: DocumentType.PROSPECTUS,
        format: 'pdf',
        fileName: 'prospectus.pdf',
        mimeType: 'application/pdf',
        size: 100000,  // 100KB
        checksum: 'abc123',
        version: '1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateRule(prospectusMinSizeRule, doc);
      expect(result).toBeNull();  // No error
    });

    it('should reject prospectus < 50KB', () => {
      const doc: DocumentMetadata = {
        size: 10000,  // 10KB
        // ... other properties
      };

      const result = validateRule(prospectusMinSizeRule, doc);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('PROSPECTUS_INVALID_SIZE');
    });
  });

  describe('mda_comprehensive', () => {
    it('should accept prospectus with all MD&A sections', () => {
      const content = `
        Business Overview: We are a technology company...
        Financial Condition: Our financial position is strong...
        Results of Operations: Revenue increased by 20%...
        Liquidity and Capital Resources: We have sufficient cash...
        Risk Factors: Our primary risks are...
      `;

      const doc: DocumentMetadata = {
        content,
        // ... other properties
      };

      const result = validateRule(mdaValidationRule, doc);
      expect(result).toBeNull();
    });

    it('should reject prospectus missing required sections', () => {
      const content = 'This is just a short prospectus.';
      const doc: DocumentMetadata = {
        content,
        // ... other properties
      };

      const result = validateRule(mdaValidationRule, doc);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INSUFFICIENT_MDA');
    });
  });

  describe('bilingual requirement', () => {
    it('should accept properly translated English/French', () => {
      const doc: DocumentMetadata = {
        content: `
          This is the prospectus summary. Ceci est un résumé du prospectus.
          The company plans... La société prévoit...
        `,
        language: 'en,fr',
        // ... other properties
      };

      const errors = validateLanguageRequirement(
        bilingualRequirement,
        doc
      );
      expect(errors).toHaveLength(0);
    });

    it('should reject English-only document for Canadian filing', () => {
      const doc: DocumentMetadata = {
        content: 'This is an English-only prospectus.',
        language: 'en',
        // ... other properties
      };

      const errors = validateLanguageRequirement(
        bilingualRequirement,
        doc
      );
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('cross-document validation', () => {
    it('should accept matching fiscal year end dates', async () => {
      const prospectus: DocumentMetadata = {
        type: DocumentType.PROSPECTUS,
        content: '...fiscal year ended March 31, 2025...',
        // ... other properties
      };

      const financials: DocumentMetadata = {
        type: DocumentType.FINANCIAL_STATEMENTS,
        content: 'March 31, 2025 Financial Statements',
        // ... other properties
      };

      const errors = await consistentPeriodRule.validator([
        prospectus,
        financials,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('should reject mismatched fiscal year end dates', async () => {
      const prospectus: DocumentMetadata = {
        type: DocumentType.PROSPECTUS,
        content: '...fiscal year ended March 31, 2025...',
        // ... other properties
      };

      const financials: DocumentMetadata = {
        type: DocumentType.FINANCIAL_STATEMENTS,
        content: 'December 31, 2024 Financial Statements',
        // ... other properties
      };

      const errors = await consistentPeriodRule.validator([
        prospectus,
        financials,
      ]);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
```

---

## Rule Versioning & Updates

### Version Management

```typescript
interface VersionedValidationRule extends ValidationRule {
  version: string;           // e.g., "1.0.0"
  effectiveDate: Date;       // When this rule becomes active
  deprecatedDate?: Date;     // When this rule is no longer used
  changelog: string;         // What changed in this version
}

// Register multiple versions
const prospectusMinSizeRules = {
  '1.0': {
    minBytes: 50000,
    maxBytes: 500000000,
    effectiveDate: new Date('2023-01-01'),
  },
  '1.1': {
    minBytes: 100000,  // Updated requirement
    maxBytes: 500000000,
    effectiveDate: new Date('2024-06-01'),
    changelog: 'Increased minimum size to 100KB',
  },
  '2.0': {
    minBytes: 100000,
    maxBytes: 2000000000,  // Increased max size
    effectiveDate: new Date('2025-01-01'),
    changelog: 'Increased max file size to support more complex documents',
  },
};

// Select appropriate version based on filing date
function getRuleForDate(
  date: Date,
  rules: Record<string, VersionedValidationRule>
): VersionedValidationRule {
  let applicableRule: VersionedValidationRule | null = null;

  for (const version in rules) {
    const rule = rules[version];

    // Check if this rule is active on the filing date
    if (
      rule.effectiveDate <= date &&
      (!rule.deprecatedDate || date < rule.deprecatedDate)
    ) {
      applicableRule = rule;
    }
  }

  return applicableRule || rules['1.0'];  // Fallback to first version
}
```

### Dynamic Rule Updates

```typescript
// Load rules from database or config file
async function loadRulesForJurisdiction(
  jurisdiction: string
): Promise<ValidationRule[]> {
  // Fetch from database
  const rules = await db.query(
    'SELECT * FROM validation_rules WHERE jurisdiction = $1 AND active = true',
    [jurisdiction]
  );

  return rules.map(parseRuleFromDB);
}

// Example: Update rules when jurisdiction requirements change
async function updateRuleForSEC(): Promise<void> {
  // New SEC requirement effective June 1, 2025
  const newRule: ValidationRule = {
    id: 'sec_executive_compensation',
    name: 'Enhanced Executive Compensation Disclosure',
    documentTypes: [DocumentType.PROSPECTUS],
    condition: 'required',
    validators: [
      {
        type: 'custom',
        fn: validateExecutiveCompensation,
      },
    ],
    errorCode: 'INSUFFICIENT_COMPENSATION_DISCLOSURE',
    errorMessage: 'Executive compensation disclosure does not meet SEC requirements',
    severity: 'error',
    appliesTo: {
      countries: ['USA'],
      exchangeTypes: ['nasdaq', 'nyse'],
    },
  };

  // Save to database
  await db.query(
    `INSERT INTO validation_rules (id, name, rule_json, effective_date, jurisdiction)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      newRule.id,
      newRule.name,
      JSON.stringify(newRule),
      new Date('2025-06-01'),
      'USA',
    ]
  );

  this.logInfo('SEC rule updated', {
    ruleId: newRule.id,
    effectiveDate: '2025-06-01',
  });
}
```

---

## Summary

Validation rules are the backbone of filing compliance. Key takeaways:

1. **Define rules declaratively** - As data structures, not scattered in code
2. **Test thoroughly** - Each rule needs unit and integration tests
3. **Support versioning** - Rules change; track effective dates
4. **Cross-document validation** - Many rules involve multiple documents
5. **Clear error messages** - Users need to know exactly how to fix issues
6. **Jurisdiction-specific** - Rules vary significantly by country and exchange
7. **Keep rules updated** - Monitor regulator changes and update accordingly

With these patterns, you'll have maintainable, auditable validation logic that grows with your system.
