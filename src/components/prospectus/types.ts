/**
 * Type definitions for Prospectus Validator Dashboard
 * Centralizes all interfaces and types for the validator system
 */

/**
 * Strength rating scale (1-5)
 * 1 = Weak, needs major work
 * 2-3 = Passable, functional but not strong
 * 4 = Defendable, good quality
 * 5 = Strong, excellent quality
 */
export type StrengthRating = 1 | 2 | 3 | 4 | 5

/**
 * Status label derived from strength rating
 */
export type StrengthStatus = 'weak' | 'passable' | 'defendable' | 'strong'

/**
 * Severity levels for issues
 * critical = Must fix before filing (regulatory or material risk)
 * moderate = Should fix (quality or completeness issue)
 * minor = Nice to improve (polish or consistency)
 */
export type IssueSeverity = 'critical' | 'moderate' | 'minor'

/**
 * Single fix option for resolving an issue
 */
export interface FixOption {
  id: string
  label: string
  checked: boolean
}

/**
 * Issue found in a prospectus section
 */
export interface Issue {
  id: string
  severity: IssueSeverity
  description: string
  /** Explanation of why this is an issue */
  rootCause: string
  /** Actionable items to resolve the issue */
  fixOptions: FixOption[]
  /** Best practice guidance, often with industry benchmarks */
  guidance: string
  /** Link to example prospectuses or detailed guidance */
  exampleLink?: string
}

/**
 * Gap in prospectus section (missing required or optional elements)
 */
export interface Gap {
  id: string
  /** Type/category of the gap */
  category: string
  /** Description of what's missing */
  description: string
  /** Whether this gap is required to fix */
  required: boolean
  status: 'open' | 'resolved'
}

/**
 * A section of the prospectus (e.g., Executive Summary, Risk Factors)
 */
export interface ProspectusSection {
  id: string
  name: string
  /** Strength rating from 1-5 */
  strength: StrengthRating
  /** Derived status label */
  status: StrengthStatus
  /** Count of issues in this section */
  issueCount: number
  /** Count of gaps in this section */
  gapCount: number
  /** Completion percentage (0-100) */
  completeness: number
  /** Issues found in this section */
  issues: Issue[]
  /** Gaps in this section */
  gaps: Gap[]
}

/**
 * Props for ProspectusValidatorDashboard component
 */
export interface ProspectusValidatorDashboardProps {
  sections: ProspectusSection[]
  onSectionUpdate?: (sectionId: string, updates: Partial<ProspectusSection>) => void | Promise<void>
}

/**
 * Aggregated stats across all sections
 */
export interface ProspectusStats {
  totalSections: number
  averageStrength: number
  totalIssues: number
  totalCritical: number
  totalModerate: number
  totalMinor: number
  totalGaps: number
  averageCompleteness: number
  sectionsComplete: number
  sectionsInProgress: number
  sectionsNotStarted: number
}

/**
 * Filter/sort options
 */
export interface ValidatorFilter {
  severity: 'all' | IssueSeverity
  status?: 'open' | 'resolved'
  sortBy?: 'severity' | 'section' | 'completeness'
}

/**
 * Configuration for the validator
 */
export interface ValidatorConfig {
  /** Show/hide completeness progress bars */
  showCompleteness?: boolean
  /** Show/hide gap items */
  showGaps?: boolean
  /** Show/hide example links */
  showExamples?: boolean
  /** Enable severity filtering */
  enableFiltering?: boolean
  /** Default expanded sections on load */
  defaultExpanded?: string[]
  /** Callback when issue is resolved */
  onIssueResolved?: (sectionId: string, issueId: string) => void
  /** Callback when gap is resolved */
  onGapResolved?: (sectionId: string, gapId: string) => void
}

/**
 * Standard prospectus sections (section IDs)
 */
export const STANDARD_SECTIONS = [
  'executive-summary',
  'risk-factors',
  'use-of-proceeds',
  'management',
  'financial-disclosure',
  'market-analysis',
  'capitalization',
] as const

export type StandardSectionId = (typeof STANDARD_SECTIONS)[number]

/**
 * Helper function to get strength status from rating
 */
export function getStrengthStatus(strength: number): StrengthStatus {
  if (strength <= 1) return 'weak'
  if (strength <= 3) return 'passable'
  if (strength <= 4) return 'defendable'
  return 'strong'
}

/**
 * Helper function to calculate completeness increase when resolving an issue
 */
export function calculateCompletenessIncrease(section: ProspectusSection): number {
  const totalItems = section.issues.length + section.gaps.length
  if (totalItems === 0) return 0
  return Math.ceil(100 / (totalItems * 1.5)) // Slightly more credit for fewer remaining items
}

/**
 * Helper function to calculate aggregate stats
 */
export function calculateProspectusStats(sections: ProspectusSection[]): ProspectusStats {
  const totalIssues = sections.reduce((sum, s) => sum + s.issueCount, 0)
  const totalCritical = sections.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'critical').length, 0)
  const totalModerate = sections.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'moderate').length, 0)
  const totalMinor = sections.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'minor').length, 0)
  const totalGaps = sections.reduce((sum, s) => sum + s.gapCount, 0)
  const avgStrength = sections.length > 0 ? sections.reduce((sum, s) => sum + s.strength, 0) / sections.length : 0
  const avgCompleteness = sections.length > 0 ? sections.reduce((sum, s) => sum + s.completeness, 0) / sections.length : 0
  const complete = sections.filter(s => s.completeness === 100).length
  const inProgress = sections.filter(s => s.completeness > 0 && s.completeness < 100).length
  const notStarted = sections.filter(s => s.completeness === 0).length

  return {
    totalSections: sections.length,
    averageStrength: Math.round(avgStrength * 10) / 10,
    totalIssues,
    totalCritical,
    totalModerate,
    totalMinor,
    totalGaps,
    averageCompleteness: Math.round(avgCompleteness),
    sectionsComplete: complete,
    sectionsInProgress: inProgress,
    sectionsNotStarted: notStarted,
  }
}
