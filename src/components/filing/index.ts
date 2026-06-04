/**
 * Filing Checker Component Library
 * Exports for Filing Checker Dashboard and related utilities
 */

// Components
export { FilingCheckerDashboard } from './FilingCheckerDashboard'
export { FilingCheckerDemo } from './FilingCheckerDemo'

// Types
export type {
  FilingIssue,
  FilingSeverity,
  FilingStatus,
  MissingDocument,
  Section,
  Jurisdiction,
  AuditTrailEntry,
  FilingCheckerDashboardProps,
  FilingReport,
  FilingCheckerState,
} from './types'

// Utilities
export {
  estimateTimeToReady,
  determineFilingStatus,
  calculateOverallScore,
  getScoreColorClasses,
  getSeverityInfo,
  filterIssuesByJurisdiction,
  groupIssuesByJurisdiction,
  countIssuesBySeverity,
  getRecommendedNextAction,
  formatJurisdictionName,
  calculateSectionCompleteness,
  getSectionsNeedingAttention,
  generatePDFFilename,
  calculateFilingProgress,
  validateFilingData,
  convertIssuesToAuditTrail,
} from './utils'

// Hooks
export { useFilingChecker } from './useFilingChecker'
