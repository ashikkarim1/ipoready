/**
 * Exchange-Agnostic Regulatory Rules Engine Types
 * Defines interfaces for configuration-driven regulatory compliance across exchanges
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum RuleType {
  MAX_FILE_SIZE = 'max_file_size',
  FILE_FORMAT = 'file_format',
  MIN_WORD_COUNT = 'min_word_count',
  MAX_WORD_COUNT = 'max_word_count',
  REGEX = 'regex',
  MIN_PAGES = 'min_pages',
  MAX_PAGES = 'max_pages',
  REQUIRED_SECTIONS = 'required_sections',
  CHARACTER_ENCODING = 'character_encoding',
  CUSTOM = 'custom',
}

export enum RuleCategory {
  FILE_FORMAT = 'file_format',
  CONTENT = 'content',
  METADATA = 'metadata',
  SIGNATURE = 'signature',
  STRUCTURE = 'structure',
}

export enum RequirementCategory {
  FINANCIAL_DISCLOSURE = 'financial_disclosure',
  RISK_FACTORS = 'risk_factors',
  GOVERNANCE = 'governance',
  DOCUMENTS = 'documents',
  CONSENTS = 'consents',
  RESOLUTIONS = 'resolutions',
  AUDITOR = 'auditor',
  DISCLOSURE = 'disclosure',
}

export enum Severity {
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum FilingType {
  IPO = 'ipo',
  RTO = 'rto',
  PROSPECTUS_SUPPLEMENT = 'prospectus_supplement',
  AMENDMENT = 'amendment',
  SECONDARY = 'secondary',
}

export enum ValidationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  SKIPPED = 'skipped',
}

// ============================================================================
// EXCHANGE CONFIGURATION TYPES
// ============================================================================

/**
 * Exchange registry entry
 */
export interface Exchange {
  id: string;
  code: string;                               // 'tsx', 'tsxv', 'sec', 'lse', 'tse', 'hkex'
  name: string;                               // 'Toronto Stock Exchange'
  country: string;                            // 'CA', 'US', 'GB', 'JP', 'HK'
  regulatorName: string;                      // 'Ontario Securities Commission'
  regulatorUrl: string;
  apiEndpoint?: string;
  apiDocumentationUrl?: string;
  isActive: boolean;
  configuration: Record<string, unknown>;     // Exchange-specific settings
  createdAt: string;
  updatedAt: string;
}

/**
 * Full exchange configuration with all rules
 */
export interface ExchangeFullConfig {
  exchange: Exchange;
  requirements: RegulatoryRequirement[];
  validationRules: ValidationRule[];
  checklists: FilingChecklist[];
  documentRequirements: DocumentRequirement[];
  riskFactorRequirements: RiskFactorRequirement[];
  auditorRequirements: AuditorRequirement[];
  guidanceTemplates: GuidanceTemplate[];
  configData: ExchangeConfigData;
}

/**
 * Detailed JSON configuration for exchange
 */
export interface ExchangeConfigData {
  prospectusFormat?: {
    required: string[];                       // ['NI 41-101F1']
    alternative: string[];
  };
  minimumPublicFloat?: {
    percentage: number;
  };
  committees?: {
    auditRequired: boolean;
    compensationRequired: boolean;
    nominationRequired: boolean;
  };
  disclosure?: {
    executiveCompensation: boolean;
    relatedParty: boolean;
    materialContracts: boolean;
    riskFactors: boolean;
  };
  qualityBenchmarks?: {
    riskFactorsMinWords?: number;
    useOfProceedsMinWords?: number;
    managementDiscussionMinWords?: number;
  };
  [key: string]: unknown;
}

// ============================================================================
// REGULATORY REQUIREMENT TYPES
// ============================================================================

/**
 * Regulatory requirement definition
 */
export interface RegulatoryRequirement {
  id: string;
  exchangeId: string;
  category: RequirementCategory;
  subcategory?: string;
  requirementKey: string;                     // 'min_years_financial_statements'
  requirementText: string;                    // Human-readable description
  isMandatory: boolean;
  minItems?: number;
  maxItems?: number;
  examplesUrl?: string;
  guidanceText?: string;
  validationRuleConfig?: Record<string, unknown>;
  regulatoryReference?: string;               // 'SEC Rule 415'
  effectiveDate?: string;
  sunsetDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VALIDATION RULE TYPES
// ============================================================================

/**
 * Validation rule for document/content checks
 */
export interface ValidationRule {
  id: string;
  exchangeId: string;
  ruleName: string;
  ruleCategory: RuleCategory;
  appliesToField?: string;                    // JSON path
  appliesToDocumentTypes?: string[];          // ['prospectus', 'exhibit_a']
  ruleType: RuleType;
  ruleConfig: ValidationRuleConfig;
  isCritical: boolean;
  severity: Severity;
  errorMessageTemplate?: string;
  remediationGuidance?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flexible rule configuration
 */
export interface ValidationRuleConfig {
  // File size rules
  maxBytes?: number;
  minBytes?: number;

  // Format rules
  allowedFormats?: string[];                  // ['pdf', 'docx']

  // Content rules
  minWordCount?: number;
  maxWordCount?: number;
  minPages?: number;
  maxPages?: number;

  // Regex rules
  pattern?: string;
  patternDescription?: string;

  // Structure rules
  requiredSections?: string[];

  // Encoding rules
  allowedEncodings?: string[];

  // Custom rule reference
  customRuleId?: string;

  [key: string]: unknown;
}

/**
 * Validation error result
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: Severity;
  remediation?: string;
  ruleId?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationError[];
  rulesApplied: number;
  durationMs: number;
  validatedAt: string;
}

// ============================================================================
// FILING CHECKLIST TYPES
// ============================================================================

/**
 * Filing checklist for pre-submission review
 */
export interface FilingChecklist {
  id: string;
  exchangeId: string;
  checklistName: string;
  checklistType: FilingType;
  items: ChecklistItem[];
  description?: string;
  totalItems: number;
  criticalItems: number;
  optionalItems: number;
  isSequential: boolean;
  dependencies?: Record<string, string[]>;   // { "item_3": ["item_1", "item_2"] }
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Individual checklist item
 */
export interface ChecklistItem {
  id: string;
  section: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  text: string;
  isRequired: boolean;
  guidance?: string;
  examples?: string[];
}

// ============================================================================
// DOCUMENT REQUIREMENT TYPES
// ============================================================================

/**
 * Document requirement per filing type
 */
export interface DocumentRequirement {
  id: string;
  exchangeId: string;
  filingType: FilingType;
  documentType: string;                       // 'prospectus', 'financial_statements', 'legal_opinion'
  isRequired: boolean;
  minimumCount: number;
  allowedFormats?: string[];
  maxFileSizeMb?: number;
  requiredIfCondition?: string;               // "revenue > $10M"
  requiredForJurisdictions?: string[];        // ['ON', 'BC']
  validationRules?: string[];                 // References to ValidationRule IDs
  description?: string;
  examplesUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// RISK FACTOR REQUIREMENT TYPES
// ============================================================================

/**
 * Risk factor category requirement per exchange
 */
export interface RiskFactorRequirement {
  id: string;
  exchangeId: string;
  riskCategory: string;                       // 'market_risk', 'operational_risk', 'regulatory_risk'
  riskSubcategory?: string;                   // 'currency_risk', 'commodity_price_risk'
  isMandatory: boolean;
  minWordCount?: number;
  description?: string;
  examplesUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AUDITOR REQUIREMENT TYPES
// ============================================================================

/**
 * Auditor/auditing requirement per exchange
 */
export interface AuditorRequirement {
  id: string;
  exchangeId: string;
  requirementName: string;
  requirementDescription?: string;
  isMandatory: boolean;
  isJurisdictional: boolean;
  applicableJurisdictions?: string[];         // ['ON', 'BC']
  allowedAuditFirms?: string[];               // ['Big 4'], ['local_firms']
  minAuditorExperienceYears?: number;
  auditFrequency?: 'annual' | 'biennial' | 'on_demand';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// GUIDANCE TEMPLATE TYPES
// ============================================================================

/**
 * Guidance template with weak/strong examples
 */
export interface GuidanceTemplate {
  id: string;
  exchangeId: string;
  sectionName: string;                        // "Risk Factors", "Use of Proceeds"
  category: string;                           // 'structure', 'content_quality', 'disclosure'
  guidanceText: string;
  weakExample?: string;
  weakExampleExplanation?: string;
  strongExample?: string;
  strongExampleExplanation?: string;
  qualityBenchmarks?: QualityBenchmark;
  tips?: string[];
  isActive: boolean;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quality benchmark for prospectus section
 */
export interface QualityBenchmark {
  minWordCount?: number;
  maxWordCount?: number;
  minSentenceLength?: number;
  maxSentenceLength?: number;
  requiredSubsections?: string[];
  readabilityScore?: number;                  // Flesch Reading Ease 0-100
}

// ============================================================================
// VALIDATION REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to validate a filing or section
 */
export interface ValidateFilingRequest {
  exchangeCode: string;
  filingType: FilingType;
  documentId?: string;
  filingId?: string;
  sectionName?: string;
  content?: string;
  documentPath?: string;
}

/**
 * Response from validation
 */
export interface ValidateFilingResponse {
  isValid: boolean;
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationError[];
  passedRules: string[];
  failedRules: string[];
  durationMs: number;
  validatedAt: string;
}

/**
 * Request to validate a section
 */
export interface ValidateSectionRequest {
  exchangeCode: string;
  sectionName: string;
  content: string;
}

/**
 * Request to get checklist
 */
export interface GetChecklistRequest {
  exchangeCode: string;
  filingType: FilingType;
  includeGuidance?: boolean;
}

// ============================================================================
// QUALITY SCORING TYPES
// ============================================================================

/**
 * Quality analysis of prospectus content
 */
export interface ContentQualityAnalysis {
  exchangeCode: string;
  sectionName: string;
  score: number;                              // 0-100
  feedback: QualityFeedback[];
  benchmarks: QualityBenchmark;
  comparison: {
    meanScore: number;
    percentile: number;
  };
}

/**
 * Individual quality feedback item
 */
export interface QualityFeedback {
  category: string;
  issue: string;
  severity: Severity;
  example?: string;
  remediation: string;
}

// ============================================================================
// CONFIGURATION MANAGEMENT TYPES
// ============================================================================

/**
 * Request to add new exchange configuration
 */
export interface AddExchangeConfigRequest {
  code: string;
  name: string;
  country: string;
  regulatorName: string;
  regulatorUrl: string;
  apiEndpoint?: string;
  configuration?: Record<string, unknown>;
}

/**
 * Request to update exchange configuration
 */
export interface UpdateExchangeConfigRequest {
  configuration?: Record<string, unknown>;
  notes?: string;
  reviewedBy?: string;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch validation request
 */
export interface BatchValidationRequest {
  exchangeCode: string;
  filings: Array<{
    filingId: string;
    documentPaths: string[];
  }>;
}

/**
 * Batch validation response
 */
export interface BatchValidationResponse {
  batchId: string;
  totalFilings: number;
  validFilings: number;
  invalidFilings: number;
  partialFilings: number;
  results: Array<{
    filingId: string;
    status: ValidationStatus;
    errors: ValidationError[];
  }>;
  completedAt: string;
}

// ============================================================================
// EXTENSION/PLUGIN TYPES
// ============================================================================

/**
 * Custom rule implementation interface
 */
export interface ICustomRule {
  id: string;
  name: string;
  validate(content: unknown, config: ValidationRuleConfig): Promise<ValidationError[]>;
}

/**
 * Custom validation provider
 */
export interface ICustomValidator {
  validate(
    exchangeCode: string,
    ruleType: RuleType,
    content: unknown,
    config: ValidationRuleConfig
  ): Promise<ValidationError[]>;
}

// ============================================================================
// DATABASE AUDIT TYPES
// ============================================================================

/**
 * Validation audit log entry
 */
export interface ValidationAuditLog {
  id: string;
  companyId: string;
  exchangeId: string;
  filingId?: string;
  validationType: string;
  targetId?: string;
  validationPassed: boolean;
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];
  validationDurationMs: number;
  rulesApplied: number;
  initiatedBy?: string;
  createdAt: string;
}
