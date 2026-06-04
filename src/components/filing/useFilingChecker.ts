/**
 * useFilingChecker Hook
 * State management for the Filing Checker Dashboard
 */

import { useState, useCallback, useMemo } from 'react'
import { FilingIssue, FilingStatus } from './types'
import {
  countIssuesBySeverity,
  determineFilingStatus,
  estimateTimeToReady,
  getRecommendedNextAction,
} from './utils'

interface UseFilingCheckerProps {
  initialIssues: FilingIssue[]
  completenessScore: number
  complianceScore: number
  qualityScore: number
  crossValidationScore: number
}

interface UseFilingCheckerResult {
  // State
  expandedIssues: Set<string>
  resolvedIssues: Set<string>
  isExporting: boolean
  isSharing: boolean

  // Computed values
  unResolvedIssuesCount: number
  criticalIssuesCount: number
  warningIssuesCount: number
  currentStatus: FilingStatus
  estimatedTimeToReady: string
  recommendedAction: string
  overallScore: number

  // Actions
  toggleIssueExpanded: (issueId: string) => void
  toggleIssueResolved: (issueId: string) => void
  setIsExporting: (value: boolean) => void
  setIsSharing: (value: boolean) => void
  resetState: () => void
  resolveIssue: (issueId: string) => void
  unresolveIssue: (issueId: string) => void
  expandAllIssues: () => void
  collapseAllIssues: () => void
}

export function useFilingChecker({
  initialIssues,
  completenessScore,
  complianceScore,
  qualityScore,
  crossValidationScore,
}: UseFilingCheckerProps): UseFilingCheckerResult {
  // State management
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [resolvedIssues, setResolvedIssues] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Toggle expanded state for an issue
  const toggleIssueExpanded = useCallback((issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(issueId)) {
        newSet.delete(issueId)
      } else {
        newSet.add(issueId)
      }
      return newSet
    })
  }, [])

  // Toggle resolved state for an issue
  const toggleIssueResolved = useCallback((issueId: string) => {
    setResolvedIssues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(issueId)) {
        newSet.delete(issueId)
      } else {
        newSet.add(issueId)
      }
      return newSet
    })
  }, [])

  // Resolve a specific issue
  const resolveIssue = useCallback((issueId: string) => {
    setResolvedIssues(prev => new Set(prev).add(issueId))
  }, [])

  // Unresolve a specific issue
  const unresolveIssue = useCallback((issueId: string) => {
    setResolvedIssues(prev => {
      const newSet = new Set(prev)
      newSet.delete(issueId)
      return newSet
    })
  }, [])

  // Expand all issues
  const expandAllIssues = useCallback(() => {
    setExpandedIssues(new Set(initialIssues.map(i => i.id)))
  }, [initialIssues])

  // Collapse all issues
  const collapseAllIssues = useCallback(() => {
    setExpandedIssues(new Set())
  }, [])

  // Reset all state
  const resetState = useCallback(() => {
    setExpandedIssues(new Set())
    setResolvedIssues(new Set())
    setIsExporting(false)
    setIsSharing(false)
  }, [])

  // Compute derived values
  const unResolvedIssuesCount = useMemo(() => {
    return initialIssues.filter(i => !resolvedIssues.has(i.id)).length
  }, [initialIssues, resolvedIssues])

  const { critical: criticalIssuesCount, warning: warningIssuesCount } = useMemo(() => {
    const unresolved = initialIssues.filter(i => !resolvedIssues.has(i.id))
    return countIssuesBySeverity(unresolved)
  }, [initialIssues, resolvedIssues])

  const currentStatus = useMemo(() => {
    return determineFilingStatus(criticalIssuesCount, warningIssuesCount)
  }, [criticalIssuesCount, warningIssuesCount])

  const unResolvedIssues = useMemo(() => {
    return initialIssues.filter(i => !resolvedIssues.has(i.id))
  }, [initialIssues, resolvedIssues])

  const estimatedTimeToReady = useMemo(() => {
    return estimateTimeToReady(unResolvedIssues)
  }, [unResolvedIssues])

  const recommendedAction = useMemo(() => {
    return getRecommendedNextAction(initialIssues, resolvedIssues)
  }, [initialIssues, resolvedIssues])

  const overallScore = useMemo(() => {
    const total = completenessScore + complianceScore + qualityScore + crossValidationScore
    return Math.round(total / 4)
  }, [completenessScore, complianceScore, qualityScore, crossValidationScore])

  return {
    expandedIssues,
    resolvedIssues,
    isExporting,
    isSharing,
    unResolvedIssuesCount,
    criticalIssuesCount,
    warningIssuesCount,
    currentStatus,
    estimatedTimeToReady,
    recommendedAction,
    overallScore,
    toggleIssueExpanded,
    toggleIssueResolved,
    setIsExporting,
    setIsSharing,
    resetState,
    resolveIssue,
    unresolveIssue,
    expandAllIssues,
    collapseAllIssues,
  }
}
