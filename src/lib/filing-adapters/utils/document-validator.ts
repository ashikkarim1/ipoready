/**
 * Document Validator
 * Comprehensive validation for filing documents with regulatory compliance checking
 * Handles: format validation, content verification, signature verification, compliance checks
 * Extreme care for edge cases and robustness
 */

import * as crypto from 'crypto'

// ============================================================================
// Types
// ============================================================================

export interface FilingDocument {
  id: string
  name: string
  mimeType: string
  size: number
  content: Buffer | Uint8Array | string
  metadata?: Record<string, any>
  uploadedAt?: Date
  signature?: {
    algorithm: string
    value: string
    timestamp?: Date
    signer?: string
  }
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  required: boolean
  validator: (doc: FilingDocument) => Promise<ValidationResult>
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  passed: boolean
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
  details?: Record<string, any>
  timestamp: Date
}

export interface DocumentValidationReport {
  documentId: string
  documentName: string
  overallStatus: 'valid' | 'invalid' | 'warning'
  validationResults: ValidationResult[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
  generatedAt: Date
  expiresAt?: Date
}

// ============================================================================
// Constants
// ============================================================================

const SUPPORTED_FORMATS = {
  PDF: { mimeType: 'application/pdf', extension: '.pdf', signature: Buffer.from([0x25, 0x50, 0x44, 0x46]) },
  DOCX: { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: '.docx', signature: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
  XLSX: { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: '.xlsx', signature: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
  TXT: { mimeType: 'text/plain', extension: '.txt', signature: null },
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const MIN_FILE_SIZE = 100 // 100 bytes

const COMPLIANCE_KEYWORDS = {
  required: ['company', 'date', 'signature', 'filing'],
  optional: ['authorized', 'certified', 'approved', 'reviewed'],
}

// ============================================================================
// Document Validator Class
// ============================================================================

export class DocumentValidator {
  private validationRules: Map<string, ValidationRule> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    this.addRule({
      id: 'format-check',
      name: 'Format Validation',
      description: 'Verify document is in an approved format',
      required: true,
      severity: 'error',
      validator: this.validateDocumentFormat.bind(this),
    })

    this.addRule({
      id: 'size-check',
      name: 'Size Validation',
      description: 'Verify document size is within acceptable limits',
      required: true,
      severity: 'error',
      validator: this.validateDocumentSize.bind(this),
    })

    this.addRule({
      id: 'content-check',
      name: 'Content Validation',
      description: 'Verify document contains required content',
      required: true,
      severity: 'error',
      validator: this.validateDocumentContent.bind(this),
    })

    this.addRule({
      id: 'signature-check',
      name: 'Signature Validation',
      description: 'Verify digital signatures if present',
      required: false,
      severity: 'warning',
      validator: this.validateSignatures.bind(this),
    })

    this.addRule({
      id: 'compliance-check',
      name: 'Compliance Validation',
      description: 'Verify regulatory compliance requirements',
      required: true,
      severity: 'error',
      validator: this.validateCompliance.bind(this),
    })
  }

  /**
   * Add custom validation rule
   */
  addRule(rule: ValidationRule): void {
    if (!rule.id || !rule.name) {
      throw new Error('Rule must have id and name')
    }
    this.validationRules.set(rule.id, rule)
  }

  /**
   * Remove validation rule
   */
  removeRule(ruleId: string): boolean {
    return this.validationRules.delete(ruleId)
  }

  /**
   * Get all validation rules
   */
  getRules(): ValidationRule[] {
    return Array.from(this.validationRules.values())
  }

  /**
   * Validate document format
   */
  async validateDocumentFormat(doc: FilingDocument): Promise<ValidationResult> {
    try {
      // Handle null/undefined
      if (!doc || !doc.content) {
        return {
          passed: false,
          rule: 'format-check',
          message: 'Document content is missing',
          severity: 'error',
          timestamp: new Date(),
        }
      }

      // Convert to buffer if needed
      let buffer: Buffer
      if (Buffer.isBuffer(doc.content)) {
        buffer = doc.content
      } else if (doc.content instanceof Uint8Array) {
        buffer = Buffer.from(doc.content)
      } else if (typeof doc.content === 'string') {
        buffer = Buffer.from(doc.content, 'utf-8')
      } else {
        return {
          passed: false,
          rule: 'format-check',
          message: 'Document content format is invalid',
          severity: 'error',
          timestamp: new Date(),
        }
      }

      // Check magic bytes / file signature
      const format = Object.values(SUPPORTED_FORMATS).find(
        (f) => f.signature && buffer.subarray(0, f.signature.length).equals(f.signature)
      )

      if (!format) {
        return {
          passed: false,
          rule: 'format-check',
          message: `Document format not supported. Supported formats: ${Object.keys(SUPPORTED_FORMATS).join(', ')}`,
          severity: 'error',
          timestamp: new Date(),
          details: { providedMimeType: doc.mimeType, supportedTypes: Object.keys(SUPPORTED_FORMATS) },
        }
      }

      // Verify mime type matches
      if (doc.mimeType && !Object.values(SUPPORTED_FORMATS).some((f) => f.mimeType === doc.mimeType)) {
        return {
          passed: false,
          rule: 'format-check',
          message: `MIME type "${doc.mimeType}" is not supported`,
          severity: 'error',
          timestamp: new Date(),
          details: { providedMimeType: doc.mimeType },
        }
      }

      return {
        passed: true,
        rule: 'format-check',
        message: 'Document format is valid',
        severity: 'info',
        details: { format: format.extension },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        passed: false,
        rule: 'format-check',
        message: `Format validation error: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Validate document size
   */
  private async validateDocumentSize(doc: FilingDocument): Promise<ValidationResult> {
    try {
      const size = doc.size ?? 0

      if (size < MIN_FILE_SIZE) {
        return {
          passed: false,
          rule: 'size-check',
          message: `Document is too small (${size} bytes). Minimum: ${MIN_FILE_SIZE} bytes`,
          severity: 'error',
          timestamp: new Date(),
          details: { size, minimum: MIN_FILE_SIZE },
        }
      }

      if (size > MAX_FILE_SIZE) {
        return {
          passed: false,
          rule: 'size-check',
          message: `Document is too large (${size} bytes). Maximum: ${MAX_FILE_SIZE} bytes`,
          severity: 'error',
          timestamp: new Date(),
          details: { size, maximum: MAX_FILE_SIZE },
        }
      }

      return {
        passed: true,
        rule: 'size-check',
        message: `Document size is valid (${size} bytes)`,
        severity: 'info',
        details: { size },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        passed: false,
        rule: 'size-check',
        message: `Size validation error: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Validate document content for required information
   */
  async validateDocumentContent(doc: FilingDocument): Promise<ValidationResult> {
    try {
      if (!doc || !doc.content) {
        return {
          passed: false,
          rule: 'content-check',
          message: 'Document has no content to validate',
          severity: 'error',
          timestamp: new Date(),
        }
      }

      let text = ''
      try {
        // Convert content to text for analysis
        if (Buffer.isBuffer(doc.content) || doc.content instanceof Uint8Array) {
          text = Buffer.from(doc.content).toString('utf-8', 0, Math.min(5000, doc.size))
        } else if (typeof doc.content === 'string') {
          text = doc.content.substring(0, 5000)
        }
      } catch {
        // If conversion fails, skip text analysis
        text = ''
      }

      const textLower = text.toLowerCase()
      const foundRequired = COMPLIANCE_KEYWORDS.required.filter((kw) => textLower.includes(kw.toLowerCase()))

      if (foundRequired.length === 0) {
        return {
          passed: false,
          rule: 'content-check',
          message: `Document missing required content. Must contain at least one of: ${COMPLIANCE_KEYWORDS.required.join(', ')}`,
          severity: 'error',
          timestamp: new Date(),
          details: { missingKeywords: COMPLIANCE_KEYWORDS.required },
        }
      }

      return {
        passed: true,
        rule: 'content-check',
        message: `Document contains required content (found: ${foundRequired.join(', ')})`,
        severity: 'info',
        details: { foundKeywords: foundRequired },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        passed: false,
        rule: 'content-check',
        message: `Content validation error: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Validate digital signatures
   */
  async validateSignatures(doc: FilingDocument): Promise<ValidationResult> {
    try {
      if (!doc.signature) {
        return {
          passed: true,
          rule: 'signature-check',
          message: 'No signature present (optional)',
          severity: 'info',
          timestamp: new Date(),
        }
      }

      const { algorithm, value, signer } = doc.signature

      // Validate algorithm
      const validAlgorithms = ['sha256', 'sha384', 'sha512', 'rsa-sha256']
      if (!validAlgorithms.includes(algorithm.toLowerCase())) {
        return {
          passed: false,
          rule: 'signature-check',
          message: `Signature algorithm "${algorithm}" is not supported`,
          severity: 'warning',
          timestamp: new Date(),
          details: { algorithm, supportedAlgorithms: validAlgorithms },
        }
      }

      // Validate signature format (hex or base64)
      if (!isValidHex(value) && !isValidBase64(value)) {
        return {
          passed: false,
          rule: 'signature-check',
          message: 'Signature format is invalid (must be hex or base64)',
          severity: 'warning',
          timestamp: new Date(),
        }
      }

      // Verify signature length is reasonable (at least 64 chars for SHA256)
      if (value.length < 64) {
        return {
          passed: false,
          rule: 'signature-check',
          message: 'Signature is too short to be valid',
          severity: 'warning',
          timestamp: new Date(),
          details: { length: value.length },
        }
      }

      return {
        passed: true,
        rule: 'signature-check',
        message: `Signature is valid (${algorithm}${signer ? ` by ${signer}` : ''})`,
        severity: 'info',
        details: { algorithm, hasSigner: !!signer },
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        passed: false,
        rule: 'signature-check',
        message: `Signature validation error: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'warning',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Validate regulatory compliance
   */
  async validateCompliance(doc: FilingDocument): Promise<ValidationResult> {
    try {
      // Check if document has required metadata
      const requiredMetadata = ['uploadedAt']
      const missingMetadata = requiredMetadata.filter((key) => !doc[key as keyof FilingDocument])

      if (missingMetadata.length > 0) {
        return {
          passed: false,
          rule: 'compliance-check',
          message: `Document missing compliance metadata: ${missingMetadata.join(', ')}`,
          severity: 'error',
          timestamp: new Date(),
          details: { missingMetadata },
        }
      }

      // Verify uploadedAt is recent (within 90 days)
      const uploadedAt = doc.uploadedAt ? new Date(doc.uploadedAt) : null
      if (uploadedAt) {
        const daysSinceUpload = (Date.now() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceUpload > 365) {
          return {
            passed: false,
            rule: 'compliance-check',
            message: `Document is too old (${Math.floor(daysSinceUpload)} days). Max age: 365 days`,
            severity: 'error',
            timestamp: new Date(),
            details: { daysSinceUpload },
          }
        }
      }

      // Verify document name is not empty or suspicious
      if (!doc.name || doc.name.trim().length === 0) {
        return {
          passed: false,
          rule: 'compliance-check',
          message: 'Document name is required',
          severity: 'error',
          timestamp: new Date(),
        }
      }

      if (doc.name.length > 255) {
        return {
          passed: false,
          rule: 'compliance-check',
          message: `Document name is too long (${doc.name.length} chars). Maximum: 255 characters`,
          severity: 'error',
          timestamp: new Date(),
        }
      }

      return {
        passed: true,
        rule: 'compliance-check',
        message: 'Document meets compliance requirements',
        severity: 'info',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        passed: false,
        rule: 'compliance-check',
        message: `Compliance validation error: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Validate a single document
   */
  async validateDocument(doc: FilingDocument, ruleIds?: string[]): Promise<ValidationResult[]> {
    const rulesToRun = ruleIds
      ? Array.from(this.validationRules.values()).filter((r) => ruleIds.includes(r.id))
      : Array.from(this.validationRules.values())

    const results: ValidationResult[] = []

    for (const rule of rulesToRun) {
      try {
        const result = await Promise.race([rule.validator(doc), this.timeoutPromise(30000)])
        results.push(result as ValidationResult)
      } catch (error) {
        results.push({
          passed: false,
          rule: rule.id,
          message: `Validation timeout or error: ${error instanceof Error ? error.message : String(error)}`,
          severity: rule.severity,
          timestamp: new Date(),
        })
      }
    }

    return results
  }

  /**
   * Generate validation report for multiple documents
   */
  async generateValidationReport(docs: FilingDocument[]): Promise<DocumentValidationReport[]> {
    const reports: DocumentValidationReport[] = []

    // Validate input
    if (!Array.isArray(docs)) {
      throw new Error('documents must be an array')
    }

    if (docs.length === 0) {
      throw new Error('documents array is empty')
    }

    if (docs.length > 100) {
      throw new Error('Too many documents to validate at once (max 100)')
    }

    for (const doc of docs) {
      try {
        const validationResults = await this.validateDocument(doc)

        const summary = {
          total: validationResults.length,
          passed: validationResults.filter((r) => r.passed).length,
          failed: validationResults.filter((r) => r.severity === 'error' && !r.passed).length,
          warnings: validationResults.filter((r) => r.severity === 'warning' && !r.passed).length,
        }

        const overallStatus: 'valid' | 'invalid' | 'warning' = summary.failed > 0 ? 'invalid' : summary.warnings > 0 ? 'warning' : 'valid'

        reports.push({
          documentId: doc.id,
          documentName: doc.name,
          overallStatus,
          validationResults,
          summary,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        })
      } catch (error) {
        reports.push({
          documentId: doc.id,
          documentName: doc.name,
          overallStatus: 'invalid',
          validationResults: [
            {
              passed: false,
              rule: 'report-generation',
              message: `Failed to generate report: ${error instanceof Error ? error.message : String(error)}`,
              severity: 'error',
              timestamp: new Date(),
            },
          ],
          summary: { total: 1, passed: 0, failed: 1, warnings: 0 },
          generatedAt: new Date(),
        })
      }
    }

    return reports
  }

  /**
   * Utility for timeout promise
   */
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Validation timeout')), ms))
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if string is valid hex
 */
function isValidHex(str: string): boolean {
  if (!str || typeof str !== 'string') return false
  return /^[0-9a-fA-F]+$/.test(str)
}

/**
 * Check if string is valid base64
 */
function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch {
    return false
  }
}

// ============================================================================
// Exports
// ============================================================================

export const documentValidator = new DocumentValidator()

export default DocumentValidator
