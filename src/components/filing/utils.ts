/**
 * Filing Checker Utility Functions
 * Helper functions for calculations, formatting, and data processing
 */

import { FilingIssue, FilingSeverity, Jurisdiction, Section } from './types'

/**
 * Calculate estimated time to filing readiness
 * @param issues - Array of unresolved issues
 * @returns Formatted time estimate string
 */
export function estimateTimeToReady(issues: FilingIssue[]): string {
  if (issues.length === 0) return '0 hours'

  // Base hours per severity
  const severityHours = {
    critical: 4,
    warning: 2,
    info: 0.5,
  }

  let totalHours = 0
  issues.forEach(issue => {
    totalHours += severityHours[issue.severity]
  })

  // Add buffer for review and coordination
  totalHours *= 1.25

  if (totalHours < 1) return 'Less than 1 hour'
  if (totalHours < 24) return `${Math.ceil(totalHours)} hours`
  if (totalHours < 168) return `${Math.ceil(totalHours / 24)} days`
  return `${Math.ceil(totalHours / 168)} weeks`
}

/**
 * Determine filing status based on issues
 * @param criticalCount - Number of critical issues
 * @param warningCount - Number of warning issues
 * @returns Filing status
 */
export function determineFilingStatus(
  criticalCount: number,
  warningCount: number
): 'ready' | 'not_ready' | 'in_progress' {
  if (criticalCount > 0) return 'not_ready'
  if (warningCount > 0) return 'in_progress'
  return 'ready'
}

/**
 * Calculate overall score as average of component scores
 * @param scores - Object with score components
 * @returns Overall score (0-100)
 */
export function calculateOverallScore(scores: {
  completeness: number
  compliance: number
  quality: number
  crossValidation: number
}): number {
  const total =
    scores.completeness + scores.compliance + scores.quality + scores.crossValidation
  return Math.round(total / 4)
}

/**
 * Get color codes for score visualization
 * @param score - Numeric score (0-100)
 * @returns Object with gradient and text colors
 */
export function getScoreColorClasses(score: number): {
  gradient: string
  text: string
  bg: string
  border: string
} {
  if (score >= 80) {
    return {
      gradient: 'from-green-500 to-emerald-500',
      text: 'text-green-900',
      bg: 'bg-green-50',
      border: 'border-green-200',
    }
  }
  if (score >= 60) {
    return {
      gradient: 'from-amber-500 to-yellow-500',
      text: 'text-amber-900',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    }
  }
  return {
    gradient: 'from-red-500 to-rose-500',
    text: 'text-red-900',
    bg: 'bg-red-50',
    border: 'border-red-200',
  }
}

/**
 * Get icon and color for severity level
 * @param severity - Issue severity level
 * @returns Icon name and color classes
 */
export function getSeverityInfo(severity: FilingSeverity): {
  icon: string
  color: string
  bgColor: string
  label: string
} {
  const severityMap = {
    critical: {
      icon: 'AlertCircle',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Critical',
    },
    warning: {
      icon: 'AlertTriangle',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      label: 'Warning',
    },
    info: {
      icon: 'Info',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Information',
    },
  }
  return severityMap[severity]
}

/**
 * Filter issues by jurisdiction
 * @param issues - Array of all issues
 * @param jurisdiction - Jurisdiction code
 * @returns Filtered issues
 */
export function filterIssuesByJurisdiction(issues: FilingIssue[], jurisdiction: string): FilingIssue[] {
  return issues.filter(issue => issue.category.toUpperCase().includes(jurisdiction.toUpperCase()))
}

/**
 * Group issues by jurisdiction
 * @param issues - Array of all issues
 * @returns Object mapping jurisdictions to issues
 */
export function groupIssuesByJurisdiction(
  issues: FilingIssue[]
): Record<Jurisdiction, FilingIssue[]> {
  const jurisdictions: Jurisdiction[] = ['CA', 'US', 'UK', 'EU']
  const grouped = {} as Record<Jurisdiction, FilingIssue[]>

  jurisdictions.forEach(jur => {
    grouped[jur] = filterIssuesByJurisdiction(issues, jur)
  })

  return grouped
}

/**
 * Count issues by severity
 * @param issues - Array of issues
 * @returns Object with counts by severity
 */
export function countIssuesBySeverity(issues: FilingIssue[]): {
  critical: number
  warning: number
  info: number
} {
  return {
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
  }
}

/**
 * Get next recommended action based on issues
 * @param issues - Array of unresolved issues
 * @param resolvedIssues - Set of resolved issue IDs
 * @returns Recommended action string
 */
export function getRecommendedNextAction(
  issues: FilingIssue[],
  resolvedIssues: Set<string>
): string {
  const unresolved = issues.filter(i => !resolvedIssues.has(i.id))

  if (unresolved.length === 0) {
    return 'All requirements met. Proceed with filing submission.'
  }

  const critical = unresolved.find(i => i.severity === 'critical')
  if (critical) {
    return `Resolve critical issue: ${critical.description}`
  }

  const warning = unresolved.find(i => i.severity === 'warning')
  if (warning) {
    return `Address warning: ${warning.description}`
  }

  return `Complete remaining ${unresolved.length} item${unresolved.length > 1 ? 's' : ''}`
}

/**
 * Format jurisdiction display name
 * @param code - Jurisdiction code
 * @returns Formatted display name with flag emoji
 */
export function formatJurisdictionName(code: Jurisdiction): string {
  const names: Record<Jurisdiction, string> = {
    CA: '🇨🇦 Canada (CSA)',
    US: '🇺🇸 United States (SEC)',
    UK: '🇬🇧 United Kingdom (FCA)',
    EU: '🇪🇺 European Union (ESMA)',
  }
  return names[code]
}

/**
 * Calculate section overall completeness
 * @param sections - Array of sections
 * @returns Average completeness percentage
 */
export function calculateSectionCompleteness(sections: Section[]): number {
  if (sections.length === 0) return 0
  const total = sections.reduce((sum, section) => sum + section.completeness, 0)
  return Math.round(total / sections.length)
}

/**
 * Find sections needing attention
 * @param sections - Array of sections
 * @param threshold - Completeness threshold (default 80)
 * @returns Sections below threshold
 */
export function getSectionsNeedingAttention(
  sections: Section[],
  threshold: number = 80
): Section[] {
  return sections.filter(s => s.completeness < threshold).sort((a, b) => a.completeness - b.completeness)
}

/**
 * Generate PDF filename for filing
 * @param filingId - Filing ID
 * @param exchangeId - Exchange ID
 * @returns Formatted filename
 */
export function generatePDFFilename(filingId: string, exchangeId: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${filingId}-${exchangeId}-filing-status-${timestamp}.pdf`
}

/**
 * Calculate progress percentage for overall filing
 * @param scores - Score object
 * @returns Progress percentage (0-100)
 */
export function calculateFilingProgress(scores: {
  completeness: number
  compliance: number
  quality: number
  crossValidation: number
}): number {
  return calculateOverallScore(scores)
}

/**
 * Validate filing data structure
 * @param filing - Filing data to validate
 * @returns Validation result with any errors
 */
export function validateFilingData(filing: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!filing.filingId) errors.push('Missing filingId')
  if (!filing.exchangeId) errors.push('Missing exchangeId')
  if (typeof filing.completenessScore !== 'number') errors.push('Invalid completenessScore')
  if (typeof filing.complianceScore !== 'number') errors.push('Invalid complianceScore')
  if (typeof filing.qualityScore !== 'number') errors.push('Invalid qualityScore')
  if (!Array.isArray(filing.issues)) errors.push('Issues must be an array')
  if (!Array.isArray(filing.sections)) errors.push('Sections must be an array')

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Convert issues to audit trail format
 * @param issues - Array of issues
 * @returns Formatted audit entries
 */
export function convertIssuesToAuditTrail(issues: FilingIssue[]) {
  return issues
    .filter(i => i.resolved && i.resolvedAt && i.resolvedBy)
    .map(i => ({
      id: `audit-${i.id}`,
      action: 'Issue Resolved',
      previousValue: 'Open',
      newValue: 'Resolved',
      timestamp: i.resolvedAt!,
      changedBy: i.resolvedBy!,
      issueId: i.id,
      notes: i.description,
    }))
}
