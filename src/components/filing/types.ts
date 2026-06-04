/**
 * Filing Checker Component Types
 * Core data structures for filing status tracking and validation
 */

export type FilingSeverity = 'critical' | 'warning' | 'info'
export type FilingStatus = 'ready' | 'not_ready' | 'in_progress'
export type Jurisdiction = 'CA' | 'US' | 'UK' | 'EU'

/**
 * Individual filing issue/requirement
 * Represents a single validation failure or compliance gap
 */
export interface FilingIssue {
  /** Unique identifier for the issue */
  id: string

  /** Severity level: critical (blocks filing), warning (needs attention), info (enhancement) */
  severity: FilingSeverity

  /** Jurisdiction and category (e.g., "CA - Prospectus Section", "US - SEC Compliance") */
  category: string

  /** Human-readable issue description */
  description: string

  /** Detailed explanation of what needs to be fixed */
  requiredFix: string

  /** Type of document needed to resolve (e.g., "Auditor Consent Letter") */
  documentType?: string

  /** Whether this issue has been resolved */
  resolved?: boolean

  /** Recommended priority (1-10, where 10 is highest priority) */
  priority?: number

  /** When the issue was detected */
  detectedAt?: string

  /** When the issue was resolved */
  resolvedAt?: string

  /** User who resolved the issue */
  resolvedBy?: string
}

/**
 * Document requirement with template availability
 */
export interface MissingDocument {
  /** Document type name */
  docType: string

  /** Whether this document is required for filing */
  required: boolean

  /** Whether a template is available to help prepare the document */
  hasTemplate: boolean

  /** URL to document template if available */
  templateUrl?: string

  /** Examples or guidance materials */
  examples?: string[]

  /** Estimated hours to prepare */
  estimatedHours?: number
}

/**
 * Section of the prospectus/filing with completion tracking
 */
export interface Section {
  /** Section name */
  name: string

  /** Percentage complete (0-100) */
  completeness: number

  /** Number of outstanding issues in this section */
  issues: number

  /** Last updated timestamp */
  lastUpdated?: string

  /** User who last edited */
  lastEditedBy?: string
}

/**
 * Audit trail entry for compliance and tracking
 */
export interface AuditTrailEntry {
  /** Entry ID */
  id: string

  /** What changed */
  action: string

  /** Previous value */
  previousValue?: string | number | boolean

  /** New value */
  newValue?: string | number | boolean

  /** When the change occurred */
  timestamp: string

  /** Who made the change */
  changedBy: string

  /** Related issue ID if applicable */
  issueId?: string

  /** Additional notes */
  notes?: string
}

/**
 * Overall filing readiness assessment
 * Core component props interface
 */
export interface FilingCheckerDashboardProps {
  /** Filing unique identifier */
  filingId: string

  /** Stock exchange identifier (e.g., "TSX", "NASDAQ") */
  exchangeId: string

  /** Current filing status */
  status: FilingStatus

  /** Completeness score (0-100) - how complete all required sections are */
  completenessScore: number

  /** Compliance score (0-100) - adherence to regulatory requirements */
  complianceScore: number

  /** Quality score (0-100) - quality of disclosures and documentation */
  qualityScore: number

  /** Cross-validation score (0-100) - consistency across documents */
  crossValidationScore: number

  /** Array of identified issues and requirements */
  issues: FilingIssue[]

  /** Array of missing documents */
  missingDocuments: MissingDocument[]

  /** Array of filing sections with completion status */
  sections: Section[]

  /** Callback when user resolves an issue */
  onResolveIssue?: (issueId: string) => void | Promise<void>

  /** Callback to export filing status as PDF */
  onExportPDF?: () => void | Promise<void>

  /** Callback to share filing status via email */
  onShareStatus?: () => void | Promise<void>

  /** Callback when ready to submit filing */
  onReadyToFile?: () => void | Promise<void>

  /** Callback to view comprehensive filing report */
  onViewFullReport?: () => void | Promise<void>

  /** Optional audit trail */
  auditTrail?: AuditTrailEntry[]

  /** Optional: Custom time estimate function */
  estimateTimeToReady?: (issues: FilingIssue[]) => string

  /** Optional: Dark mode flag */
  darkMode?: boolean

  /** Optional: Disable interactions (read-only mode) */
  readOnly?: boolean
}

/**
 * Extended filing data for full report
 */
export interface FilingReport {
  filingId: string
  exchangeId: string
  status: FilingStatus
  scores: {
    completeness: number
    compliance: number
    quality: number
    crossValidation: number
  }
  issues: FilingIssue[]
  missingDocuments: MissingDocument[]
  sections: Section[]
  auditTrail: AuditTrailEntry[]
  generatedAt: string
  generatedBy: string
  summary: {
    totalIssues: number
    criticalIssues: number
    warningIssues: number
    estimatedTimeToReady: string
    nextRecommendedAction: string
  }
}

/**
 * State for tracking expanded/resolved issues during user interaction
 */
export interface FilingCheckerState {
  expandedIssues: Set<string>
  resolvedIssues: Set<string>
  isExporting: boolean
  isSharing: boolean
  selectedJurisdiction?: Jurisdiction
}
