/**
 * Exchange-Agnostic Regulatory Rules Engine
 * Core validation and configuration logic for multi-exchange compliance
 */

import {
  Exchange,
  ExchangeFullConfig,
  RegulatoryRequirement,
  ValidationRule,
  ValidationRuleConfig,
  ValidationError,
  ValidationResult,
  ValidationStatus,
  FilingChecklist,
  DocumentRequirement,
  RiskFactorRequirement,
  AuditorRequirement,
  GuidanceTemplate,
  QualityBenchmark,
  ContentQualityAnalysis,
  RuleType,
  Severity,
  FilingType,
} from '@/types/regulatory-rules-engine'

// ============================================================================
// CORE RULES ENGINE CLASS
// ============================================================================

/**
 * Primary regulatory rules engine for exchange-agnostic validation
 */
export class RegulatoryRulesEngine {
  private exchanges: Map<string, Exchange> = new Map()
  private rules: Map<string, ValidationRule[]> = new Map()
  private requirements: Map<string, RegulatoryRequirement[]> = new Map()
  private checklists: Map<string, FilingChecklist[]> = new Map()
  private documentRequirements: Map<string, DocumentRequirement[]> = new Map()
  private riskFactorRequirements: Map<string, RiskFactorRequirement[]> = new Map()
  private auditorRequirements: Map<string, AuditorRequirement[]> = new Map()
  private guidanceTemplates: Map<string, GuidanceTemplate[]> = new Map()

  /**
   * Initialize engine with exchange configurations
   */
  async initialize(exchangeConfigs: ExchangeFullConfig[]): Promise<void> {
    for (const config of exchangeConfigs) {
      this.registerExchange(config)
    }
  }

  /**
   * Register an exchange with all its rules and configurations
   */
  private registerExchange(config: ExchangeFullConfig): void {
    const { exchange, requirements, validationRules, checklists, documentRequirements,
            riskFactorRequirements, auditorRequirements, guidanceTemplates } = config

    this.exchanges.set(exchange.code, exchange)
    this.rules.set(exchange.code, validationRules.filter(r => r.isActive))
    this.requirements.set(exchange.code, requirements)
    this.checklists.set(exchange.code, checklists.filter(c => c.isActive))
    this.documentRequirements.set(exchange.code, documentRequirements)
    this.riskFactorRequirements.set(exchange.code, riskFactorRequirements)
    this.auditorRequirements.set(exchange.code, auditorRequirements)
    this.guidanceTemplates.set(exchange.code, guidanceTemplates.filter(g => g.isActive))
  }

  /**
   * Get exchange by code
   */
  getExchange(exchangeCode: string): Exchange | undefined {
    return this.exchanges.get(exchangeCode.toLowerCase())
  }

  /**
   * List all configured exchanges
   */
  listExchanges(): Exchange[] {
    return Array.from(this.exchanges.values())
  }

  /**
   * Validate content against all applicable rules for an exchange
   */
  async validateFiling(
    exchangeCode: string,
    filingType: FilingType,
    content: {
      documentPath?: string
      documentType?: string
      textContent?: string
      metadata?: Record<string, unknown>
      fileSizeBytes?: number
    }
  ): Promise<ValidationResult> {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    let rulesApplied = 0

    const rules = this.rules.get(exchangeCode.toLowerCase())
    if (!rules) {
      return {
        isValid: false,
        status: ValidationStatus.FAILED,
        errors: [
          {
            code: 'EXCHANGE_NOT_FOUND',
            message: `Exchange not configured: ${exchangeCode}`,
            severity: Severity.CRITICAL,
          },
        ],
        warnings: [],
        rulesApplied: 0,
        durationMs: Date.now() - startTime,
        validatedAt: new Date().toISOString(),
      }
    }

    // Apply each validation rule
    for (const rule of rules) {
      if (!rule.isActive) continue

      try {
        rulesApplied++
        const ruleErrors = await this.applyRule(rule, content)

        for (const error of ruleErrors) {
          if (error.severity === Severity.WARNING) {
            warnings.push(error)
          } else {
            errors.push(error)
          }
        }
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error)
        errors.push({
          code: 'RULE_EXECUTION_ERROR',
          message: `Failed to apply validation rule: ${rule.ruleName}`,
          severity: Severity.ERROR,
          ruleId: rule.id,
        })
      }
    }

    const isValid = errors.filter(e => e.severity === Severity.CRITICAL).length === 0
    const status = isValid
      ? warnings.length > 0
        ? ValidationStatus.PARTIAL
        : ValidationStatus.PASSED
      : ValidationStatus.FAILED

    return {
      isValid,
      status,
      errors,
      warnings,
      rulesApplied,
      durationMs: Date.now() - startTime,
      validatedAt: new Date().toISOString(),
    }
  }

  /**
   * Apply a single validation rule to content
   */
  private async applyRule(
    rule: ValidationRule,
    content: {
      documentPath?: string
      documentType?: string
      textContent?: string
      metadata?: Record<string, unknown>
      fileSizeBytes?: number
    }
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    // Check if rule applies to this document type
    if (rule.appliesToDocumentTypes && content.documentType) {
      if (!rule.appliesToDocumentTypes.includes(content.documentType)) {
        return []
      }
    }

    switch (rule.ruleType) {
      case RuleType.MAX_FILE_SIZE:
        if (content.fileSizeBytes && rule.ruleConfig.maxBytes) {
          if (content.fileSizeBytes > rule.ruleConfig.maxBytes) {
            errors.push({
              code: rule.id,
              message: this.interpolateErrorMessage(
                rule.errorMessageTemplate || 'File size exceeds maximum',
                { actual: content.fileSizeBytes, max: rule.ruleConfig.maxBytes }
              ),
              severity: rule.severity,
              remediation: rule.remediationGuidance,
              ruleId: rule.id,
            })
          }
        }
        break

      case RuleType.FILE_FORMAT:
        if (content.documentPath && rule.ruleConfig.allowedFormats) {
          const fileExt = content.documentPath.split('.').pop()?.toLowerCase()
          if (fileExt && !rule.ruleConfig.allowedFormats.includes(fileExt)) {
            errors.push({
              code: rule.id,
              message: `Invalid file format: ${fileExt}. Allowed: ${rule.ruleConfig.allowedFormats.join(', ')}`,
              severity: rule.severity,
              remediation: rule.remediationGuidance,
              ruleId: rule.id,
            })
          }
        }
        break

      case RuleType.MIN_WORD_COUNT:
        if (content.textContent && rule.ruleConfig.minWordCount) {
          const wordCount = content.textContent.split(/\s+/).length
          if (wordCount < rule.ruleConfig.minWordCount) {
            errors.push({
              code: rule.id,
              message: `Content too short: ${wordCount} words. Minimum required: ${rule.ruleConfig.minWordCount}`,
              severity: rule.severity,
              remediation: rule.remediationGuidance,
              ruleId: rule.id,
            })
          }
        }
        break

      case RuleType.MAX_WORD_COUNT:
        if (content.textContent && rule.ruleConfig.maxWordCount) {
          const wordCount = content.textContent.split(/\s+/).length
          if (wordCount > rule.ruleConfig.maxWordCount) {
            errors.push({
              code: rule.id,
              message: `Content too long: ${wordCount} words. Maximum allowed: ${rule.ruleConfig.maxWordCount}`,
              severity: rule.severity,
              remediation: rule.remediationGuidance,
              ruleId: rule.id,
            })
          }
        }
        break

      case RuleType.REGEX:
        if (content.textContent && rule.ruleConfig.pattern) {
          try {
            const regex = new RegExp(rule.ruleConfig.pattern)
            if (!regex.test(content.textContent)) {
              errors.push({
                code: rule.id,
                message: `Content does not match required pattern: ${rule.ruleConfig.patternDescription || rule.ruleConfig.pattern}`,
                severity: rule.severity,
                remediation: rule.remediationGuidance,
                ruleId: rule.id,
              })
            }
          } catch (error) {
            console.error(`Invalid regex in rule ${rule.id}:`, error)
          }
        }
        break

      case RuleType.REQUIRED_SECTIONS:
        if (content.textContent && rule.ruleConfig.requiredSections) {
          for (const section of rule.ruleConfig.requiredSections) {
            // Simple heuristic: check if section name appears as a header
            if (!content.textContent.toLowerCase().includes(`${section.toLowerCase()}`)) {
              errors.push({
                code: rule.id,
                message: `Missing required section: ${section}`,
                severity: rule.severity,
                remediation: rule.remediationGuidance,
                ruleId: rule.id,
              })
            }
          }
        }
        break

      default:
        // Unknown rule type - log but don't fail
        console.warn(`Unknown rule type: ${rule.ruleType}`)
    }

    return errors
  }

  /**
   * Get filing checklist for exchange and filing type
   */
  getFilingChecklist(
    exchangeCode: string,
    filingType: FilingType
  ): FilingChecklist | undefined {
    const checklists = this.checklists.get(exchangeCode.toLowerCase())
    if (!checklists) return undefined

    return checklists.find(c => c.checklistType === filingType)
  }

  /**
   * Get all requirements for exchange
   */
  getRequirements(
    exchangeCode: string,
    category?: string
  ): RegulatoryRequirement[] {
    const requirements = this.requirements.get(exchangeCode.toLowerCase()) || []
    if (category) {
      return requirements.filter(r => r.category === category)
    }
    return requirements
  }

  /**
   * Get document requirements for filing type
   */
  getDocumentRequirements(
    exchangeCode: string,
    filingType: FilingType
  ): DocumentRequirement[] {
    const requirements = this.documentRequirements.get(exchangeCode.toLowerCase()) || []
    return requirements.filter(r => r.filingType === filingType)
  }

  /**
   * Get guidance template for section
   */
  getGuidanceTemplate(
    exchangeCode: string,
    sectionName: string
  ): GuidanceTemplate | undefined {
    const templates = this.guidanceTemplates.get(exchangeCode.toLowerCase()) || []
    return templates.find(t => t.sectionName.toLowerCase() === sectionName.toLowerCase())
  }

  /**
   * Analyze prospectus section quality
   */
  async analyzeSectionQuality(
    exchangeCode: string,
    sectionName: string,
    content: string
  ): Promise<ContentQualityAnalysis> {
    const template = this.getGuidanceTemplate(exchangeCode, sectionName)
    const benchmarks = template?.qualityBenchmarks || {}

    // Calculate quality score based on benchmarks
    let score = 100
    const feedback = []

    const wordCount = content.split(/\s+/).length

    // Word count check
    if (benchmarks.minWordCount && wordCount < benchmarks.minWordCount) {
      score -= 20
      feedback.push({
        category: 'Length',
        issue: `Content too short (${wordCount} words)`,
        severity: Severity.WARNING,
        remediation: `Expand to at least ${benchmarks.minWordCount} words`,
      })
    }

    if (benchmarks.maxWordCount && wordCount > benchmarks.maxWordCount) {
      score -= 15
      feedback.push({
        category: 'Length',
        issue: `Content too long (${wordCount} words)`,
        severity: Severity.WARNING,
        remediation: `Reduce to maximum ${benchmarks.maxWordCount} words`,
      })
    }

    // Average sentence length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = wordCount / sentences.length

    if (benchmarks.maxSentenceLength && avgSentenceLength > benchmarks.maxSentenceLength) {
      score -= 10
      feedback.push({
        category: 'Clarity',
        issue: 'Sentences are too long (avg ' + avgSentenceLength.toFixed(1) + ' words)',
        severity: Severity.WARNING,
        remediation: 'Break into shorter sentences for better readability',
      })
    }

    // Readability score (simplified Flesch Reading Ease)
    const readabilityScore = Math.max(0, 206.835 - 1.015 * (wordCount / sentences.length) - 84.6 * (1 / 30))
    if (readabilityScore < 40) {
      score -= 15
      feedback.push({
        category: 'Readability',
        issue: 'Content may be too complex',
        severity: Severity.WARNING,
        remediation: 'Simplify language and sentence structure',
      })
    }

    score = Math.max(0, Math.min(100, score))

    return {
      exchangeCode,
      sectionName,
      score,
      feedback,
      benchmarks,
      comparison: {
        meanScore: 75, // Placeholder - would come from statistical analysis
        percentile: 60,
      },
    }
  }

  /**
   * Validate that auditor meets exchange requirements
   */
  validateAuditor(
    exchangeCode: string,
    auditorName: string,
    auditorType: 'big4' | 'local' | 'other',
    experienceYears: number
  ): {
    isCompliant: boolean
    issues: string[]
  } {
    const requirements = this.auditorRequirements.get(exchangeCode.toLowerCase()) || []
    const issues: string[] = []

    for (const req of requirements.filter(r => r.isMandatory)) {
      if (req.allowedAuditFirms) {
        if (!req.allowedAuditFirms.includes(auditorType)) {
          issues.push(`Auditor type '${auditorType}' not allowed. Required: ${req.allowedAuditFirms.join(', ')}`)
        }
      }

      if (req.minAuditorExperienceYears && experienceYears < req.minAuditorExperienceYears) {
        issues.push(
          `Auditor experience (${experienceYears} years) below minimum (${req.minAuditorExperienceYears} years)`
        )
      }
    }

    return {
      isCompliant: issues.length === 0,
      issues,
    }
  }

  /**
   * Get all risk factor categories required by exchange
   */
  getRiskFactorCategories(exchangeCode: string): RiskFactorRequirement[] {
    return this.riskFactorRequirements.get(exchangeCode.toLowerCase()) || []
  }

  /**
   * Interpolate error message with variables
   */
  private interpolateErrorMessage(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return String(variables[key] || match)
    })
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create validation result from errors
 */
export function createValidationResult(
  errors: ValidationError[],
  rulesApplied: number,
  durationMs: number
): ValidationResult {
  const criticalErrors = errors.filter(e => e.severity === Severity.CRITICAL)
  const warnings = errors.filter(e => e.severity === Severity.WARNING)

  let status = ValidationStatus.PASSED
  if (criticalErrors.length > 0) {
    status = ValidationStatus.FAILED
  } else if (warnings.length > 0) {
    status = ValidationStatus.PARTIAL
  }

  return {
    isValid: criticalErrors.length === 0,
    status,
    errors: criticalErrors,
    warnings,
    rulesApplied,
    durationMs,
    validatedAt: new Date().toISOString(),
  }
}

/**
 * Compare validation results between exchanges
 */
export function compareValidationResults(
  results: Array<{ exchangeCode: string; result: ValidationResult }>
): {
  mostPermissive: string
  strictest: string
  comparison: Record<string, { errorCount: number; warningCount: number }>
} {
  const comparison: Record<string, { errorCount: number; warningCount: number }> = {}

  for (const { exchangeCode, result } of results) {
    comparison[exchangeCode] = {
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
    }
  }

  const sorted = Object.entries(comparison).sort((a, b) => {
    const aTotal = a[1].errorCount + a[1].warningCount
    const bTotal = b[1].errorCount + b[1].warningCount
    return aTotal - bTotal
  })

  return {
    mostPermissive: sorted[sorted.length - 1]?.[0] || 'unknown',
    strictest: sorted[0]?.[0] || 'unknown',
    comparison,
  }
}

/**
 * Merge multiple validation results
 */
export function mergeValidationResults(results: ValidationResult[]): ValidationResult {
  const merged: ValidationResult = {
    isValid: true,
    status: ValidationStatus.PASSED,
    errors: [],
    warnings: [],
    rulesApplied: 0,
    durationMs: 0,
    validatedAt: new Date().toISOString(),
  }

  for (const result of results) {
    merged.errors.push(...result.errors)
    merged.warnings.push(...result.warnings)
    merged.rulesApplied += result.rulesApplied
    merged.durationMs += result.durationMs

    if (!result.isValid) {
      merged.isValid = false
    }

    if (result.status === ValidationStatus.FAILED) {
      merged.status = ValidationStatus.FAILED
    } else if (result.status === ValidationStatus.PARTIAL && merged.status === ValidationStatus.PASSED) {
      merged.status = ValidationStatus.PARTIAL
    }
  }

  return merged
}
