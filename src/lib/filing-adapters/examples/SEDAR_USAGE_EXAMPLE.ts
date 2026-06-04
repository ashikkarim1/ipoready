/**
 * SEDAR Adapter Usage Examples
 * =============================
 * Demonstrates how to use the SEDARAdapter for Canadian IPO/RTO prospectus filings
 *
 * Examples cover:
 * 1. Basic filing submission
 * 2. Field mapping from IPOReady to SEDAR
 * 3. Comprehensive validation
 * 4. Status tracking
 * 5. Error handling
 * 6. Bilingual support (English/French)
 */

import { SEDARAdapter, SEDARFieldMapper, SEDARValidator, createSEDARValidator } from '../index'

/**
 * Example 1: Initialize SEDAR Adapter
 * ====================================
 */
export async function example1_InitializeAdapter() {
  // Initialize adapter with API credentials
  const sedarAdapter = new SEDARAdapter(
    process.env.SEDAR_API_KEY || 'your-api-key',
    true, // Use sandbox for testing
    'en' // English (or 'fr' for French)
  )

  console.log('SEDAR Adapter initialized in sandbox mode')
  return sedarAdapter
}

/**
 * Example 2: Map IPOReady Data to SEDAR Format
 * =============================================
 */
export function example2_FieldMapping() {
  const fieldMapper = new SEDARFieldMapper()

  // IPOReady company data
  const iporeadyData = {
    companyLegalName: 'TechCorp Inc.',
    companyJurisdiction: 'ON', // Ontario
    companyRegistrationNumber: '1234567890',
    exchangeSymbol: 'TECH',
    targetExchange: 'tsx',
    prospectusDate: '2026-06-04',
    prospectusVersion: 'PRELIMINARY',
    numberOfShares: 5000000,
    sharePrice: 25.00,
    offeringAmount: 125, // CAD millions
    currencyCode: 'CAD',
    leadUnderwriter: 'RBC Dominion Securities',
    underwriterContact: 'contact@rbcds.com',
    ceoName: 'John Doe',
    cfoName: 'Jane Smith',
    boardChairname: 'Robert Johnson',
    fiscalYearEnd: '2025-12-31',
    accountingStandard: 'IFRS',
    auditedFinancialStatements: true,
    statementOfCompliance: true,
    certificationsReviewedByAudit: true,
    documentLanguage: 'en',
  }

  // Convert to SEDAR format
  const sedarData = fieldMapper.mapToSEDARFormat(iporeadyData)

  console.log('Mapped SEDAR data:', sedarData)
  return sedarData
}

/**
 * Example 3: Validate Company Data
 * =================================
 */
export function example3_ValidateCompanyData() {
  const fieldMapper = new SEDARFieldMapper()
  const validator = createSEDARValidator()

  const companyData = {
    companyLegalName: 'TechCorp Inc.',
    exchangeSymbol: 'TECH',
    numberOfShares: 5000000,
    sharePrice: 25.00,
    // Missing required fields intentionally for demonstration
  }

  // Validate individual fields
  console.log('=== Field Validation ===')
  for (const [field, value] of Object.entries(companyData)) {
    const validation = fieldMapper.validateField(field, value)
    console.log(`${field}: ${validation.valid ? 'PASS' : `FAIL - ${validation.reason}`}`)
  }

  // Validate complete object
  const objectValidation = fieldMapper.validateObject(companyData)
  console.log('\n=== Object Validation ===')
  console.log(`Valid: ${objectValidation.valid}`)
  console.log('Errors:', objectValidation.errors)

  return objectValidation
}

/**
 * Example 4: Validate Prospectus Content
 * =======================================
 */
export function example4_ValidateProspectusContent() {
  const validator = createSEDARValidator()

  const prospectusContent = {
    'Title Page': 'Company name, symbols, offering details...',
    'Table of Contents': 'Complete list of sections...',
    'Summary': 'Executive summary of the offering...',
    'Corporate Structure': 'Organization and subsidiaries...',
    'Business and Operations': 'Detailed business description...',
    // ... other sections
  }

  const validation = validator.validateProspectusCompleteness(prospectusContent)

  console.log('Prospectus Validation:')
  console.log(`Valid: ${validation.valid}`)
  if (!validation.valid) {
    console.log('Missing sections:')
    validation.missingRun.forEach((section) => {
      console.log(`  - ${section.name}: ${section.description}`)
    })
  }

  return validation
}

/**
 * Example 5: Validate Financial Statements for IFRS Compliance
 * =============================================================
 */
export function example5_ValidateFinancialStatements() {
  const validator = createSEDARValidator()

  const financialData = {
    'Balance Sheet': {
      data: { assets: 1000000, liabilities: 500000, equity: 500000 },
    },
    'Statement of Income (Comprehensive Income)': {
      data: { revenue: 2000000, expenses: 1500000, netIncome: 500000 },
    },
    'Statement of Cash Flows': { data: {} },
    'Statement of Changes in Equity': { data: {} },
    'notes': {
      'Summary of Significant Accounting Policies': {},
      'Revenue Recognition': {},
      'Income Taxes': {},
      'Earnings Per Share': {},
      // ... other required notes
    },
  }

  const validation = validator.validateFinancialStatementsIFRS(financialData)

  console.log('Financial Statement Validation:')
  console.log(`Valid: ${validation.valid}`)
  if (!validation.valid) {
    console.log('Missing statements/notes:', validation.missingStatements)
  }

  return validation
}

/**
 * Example 6: Validate Officer and Director Consents
 * ==================================================
 */
export function example6_ValidateConsents() {
  const validator = createSEDARValidator()

  const consents = [
    {
      name: 'John Doe',
      title: 'Chief Executive Officer',
      signed: true,
      signatureDate: '2026-06-03',
    },
    {
      name: 'Jane Smith',
      title: 'Chief Financial Officer',
      signed: true,
      signatureDate: '2026-06-03',
    },
    {
      name: 'Robert Johnson',
      title: 'Board Chair',
      signed: true,
      signatureDate: '2026-06-03',
    },
  ]

  const validation = validator.validateConsents(consents)

  console.log('Consent Validation:')
  console.log(`Valid: ${validation.valid}`)
  if (!validation.valid) {
    console.log('Issues:', validation.issues)
  }

  return validation
}

/**
 * Example 7: Validate Document Format
 * ====================================
 */
export function example7_ValidateDocumentFormat() {
  const validator = createSEDARValidator()

  const documents = [
    {
      filename: 'prospectus.pdf',
      size: 5242880, // 5 MB
      mimeType: 'application/pdf',
    },
    {
      filename: 'financial_statements.docx',
      size: 2097152, // 2 MB
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      filename: 'too_large_file.pdf',
      size: 600 * 1024 * 1024, // 600 MB (exceeds 500 MB limit)
      mimeType: 'application/pdf',
    },
  ]

  console.log('Document Format Validation:')
  for (const doc of documents) {
    const validation = validator.validateDocumentFormat(
      doc.filename,
      doc.size,
      doc.mimeType
    )
    console.log(`${doc.filename}: ${validation.valid ? 'PASS' : 'FAIL'}`)
    if (!validation.valid) {
      console.log('  Errors:', validation.errors)
    }
  }
}

/**
 * Example 8: Submit Filing to SEDAR
 * =================================
 */
export async function example8_SubmitFiling() {
  const sedarAdapter = new SEDARAdapter(
    process.env.SEDAR_API_KEY || 'your-api-key',
    true, // sandbox mode
    'en'
  )

  // Create filing submission
  const filing: any = {
    id: 'FILING-001',
    status: 'draft',
    documents: [
      {
        id: 'DOC-001',
        name: 'Prospectus.pdf',
        type: 'prospectus',
        mimeType: 'application/pdf',
        size: 5242880,
        uploadedAt: new Date(),
        content: Buffer.from('prospectus PDF content...'),
        metadata: {
          language: 'en',
          is_signed: true,
        },
      },
      {
        id: 'DOC-002',
        name: 'Financial_Statements.pdf',
        type: 'financial-statements',
        mimeType: 'application/pdf',
        size: 2097152,
        uploadedAt: new Date(),
        content: Buffer.from('financial statements PDF content...'),
        metadata: {
          uses_ifrs: true,
          audit_approved: true,
        },
      },
    ],
    errors: [],
    metadata: {
      companyName: 'TechCorp Inc.',
      exchangeSymbol: 'TECH',
      exchangeMarket: 'TSX',
      prospectusDate: '2026-06-04',
      numberOfShares: 5000000,
      sharePrice: 25.00,
      offeringAmount: 125,
      underwriter: 'RBC Dominion Securities',
      underwriterContact: 'contact@rbcds.com',
    },
  }

  try {
    // Validate before submission
    const validation = await sedarAdapter.validate(filing)
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors)
      return
    }

    // Submit to SEDAR
    const result = await sedarAdapter.submitFiling(filing)

    console.log('Filing submitted successfully!')
    console.log(`Filing ID: ${result.externalId}`)
    console.log(`Tracking Number: ${result.metadata.sedarTrackingNumber}`)
    console.log(`Status: ${result.status}`)
    console.log(`Estimated Review Days: ${result.metadata.sedarEstimatedReviewDays}`)

    return result
  } catch (error) {
    console.error('Filing submission failed:', error)
  }
}

/**
 * Example 9: Check Filing Status
 * ==============================
 */
export async function example9_CheckFilingStatus() {
  const sedarAdapter = new SEDARAdapter(
    process.env.SEDAR_API_KEY || 'your-api-key',
    true,
    'en'
  )

  const filingId = 'sedar-filing-123456'

  try {
    const status = await sedarAdapter.trackFilingStatus(filingId)

    console.log('Filing Status:')
    console.log(`Status: ${status.status}`)
    console.log(`External ID: ${status.externalId}`)
    console.log(`Submitted: ${status.submittedAt}`)

    if (status.metadata.reviewComments) {
      console.log('Review Comments:', status.metadata.reviewComments)
    }

    if (status.errors.length > 0) {
      console.log('Rejection Reasons:')
      status.errors.forEach((error: any) => {
        console.log(`  - [${error.code}] ${error.message}`)
        if (error.suggestion) {
          console.log(`    Suggestion: ${error.suggestion}`)
        }
      })
    }

    return status
  } catch (error) {
    console.error('Status check failed:', error)
  }
}

/**
 * Example 10: Bilingual Filing (English + French)
 * ===============================================
 */
export async function example10_BilingualFiling() {
  const sedarAdapter = new SEDARAdapter(
    process.env.SEDAR_API_KEY || 'your-api-key',
    true,
    'en' // Primary language
  )

  const filing: any = {
    id: 'FILING-BILINGUAL-001',
    status: 'draft',
    documents: [
      {
        id: 'DOC-EN',
        name: 'Prospectus_EN.pdf',
        type: 'prospectus',
        mimeType: 'application/pdf',
        size: 5242880,
        uploadedAt: new Date(),
        content: Buffer.from('English prospectus content...'),
        metadata: {
          language: 'en',
          is_bilingual: true,
        },
      },
      {
        id: 'DOC-FR',
        name: 'Prospectus_FR.pdf',
        type: 'prospectus',
        mimeType: 'application/pdf',
        size: 5380096,
        uploadedAt: new Date(),
        content: Buffer.from('French prospectus content...'),
        metadata: {
          language: 'fr',
          is_bilingual: true,
        },
      },
    ],
    errors: [],
    metadata: {
      companyName: 'TechCorp Inc.',
      jurisdiction_of_incorporation: 'QC', // Quebec - requires French
      exchangeSymbol: 'TECH',
      exchangeMarket: 'TSX',
      prospectusDate: '2026-06-04',
      numberOfShares: 5000000,
      sharePrice: 25.00,
      offeringAmount: 125,
      underwriter: 'RBC Dominion Securities',
      underwriterContact: 'contact@rbcds.com',
      documentLanguage: 'BOTH', // Bilingual
    },
  }

  try {
    const result = await sedarAdapter.submitFiling(filing)
    console.log('Bilingual filing submitted successfully!')
    console.log(`Filing ID: ${result.externalId}`)
    return result
  } catch (error) {
    console.error('Bilingual filing failed:', error)
  }
}

/**
 * Example 11: Handle SEDAR Rejection and Resubmission
 * ===================================================
 */
export async function example11_HandleRejectionAndResubmit() {
  const sedarAdapter = new SEDARAdapter(
    process.env.SEDAR_API_KEY || 'your-api-key',
    true,
    'en'
  )

  const filingId = 'sedar-filing-123456'

  try {
    // Check status
    const status = await sedarAdapter.trackFilingStatus(filingId)

    if (status.status === 'rejected') {
      console.log('Filing was rejected. Rejection reasons:')

      for (const error of status.errors) {
        console.log(`\nError: ${error.message}`)
        console.log(`Code: ${error.code}`)
        if (error.suggestion) {
          console.log(`Fix: ${error.suggestion}`)
        }
      }

      // Prepare resubmission with corrections
      const correctedFiling: any = {
        id: 'FILING-RESUBMIT-001',
        status: 'draft',
        documents: [], // Updated documents with corrections
        errors: [],
        metadata: {
          // Updated metadata addressing rejection reasons
          companyName: 'TechCorp Inc.',
          exchangeSymbol: 'TECH',
          // ... other fields
          previousRejectionId: filingId,
          rejectionAddressedDate: new Date().toISOString(),
        },
      }

      // Resubmit
      const result = await sedarAdapter.submitFiling(correctedFiling)
      console.log(`Resubmitted successfully with ID: ${result.externalId}`)
      return result
    } else if (status.status === 'approved') {
      console.log('Filing approved! Trading can commence.')
    } else {
      console.log(`Filing status: ${status.status}`)
    }
  } catch (error) {
    console.error('Status check or resubmission failed:', error)
  }
}

/**
 * Example 12: Complete Filing Workflow
 * ====================================
 */
export async function example12_CompleteWorkflow() {
  console.log('=== Complete SEDAR Filing Workflow ===\n')

  // Step 1: Initialize
  console.log('Step 1: Initialize adapter')
  const sedarAdapter = new SEDARAdapter(
    process.env.SEDAR_API_KEY || 'your-api-key',
    true,
    'en'
  )

  // Step 2: Map data
  console.log('\nStep 2: Map IPOReady data to SEDAR format')
  const fieldMapper = new SEDARFieldMapper()
  const iporeadyData = {
    companyLegalName: 'TechCorp Inc.',
    exchangeSymbol: 'TECH',
    // ... other fields
  }
  const sedarData = fieldMapper.mapToSEDARFormat(iporeadyData)

  // Step 3: Validate
  console.log('\nStep 3: Validate filing')
  const validator = createSEDARValidator()
  const filingValidation = validator.validateCompleteFiling({
    prospectusContent: {},
    financialStatements: {},
    offering: {
      numberOfShares: 5000000,
      sharePrice: 25.0,
      totalProceeds: 125000000,
      underwriter: 'RBC Dominion Securities',
      offeringType: 'bought_deal',
    },
  })

  console.log(`Filing valid: ${filingValidation.valid}`)
  if (!filingValidation.valid) {
    console.log('Validation errors:', filingValidation.errors)
    return
  }

  // Step 4: Submit
  console.log('\nStep 4: Submit to SEDAR')
  // ... submission code

  // Step 5: Monitor
  console.log('\nStep 5: Monitor filing status')
  // ... status monitoring code

  console.log('\n=== Workflow Complete ===')
}
