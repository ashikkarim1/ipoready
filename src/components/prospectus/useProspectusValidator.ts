/**
 * Custom hooks for Prospectus Validator
 * Provides reusable logic for managing validator state and operations
 */

import { useState, useCallback, useMemo } from 'react'
import { ProspectusSection, IssueSeverity, calculateProspectusStats, calculateCompletenessIncrease } from './types'

/**
 * Hook for managing prospectus sections and their state
 */
export function useProspectusValidator(initialSections: ProspectusSection[]) {
  const [sections, setSections] = useState(initialSections)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [severityFilter, setSeverityFilter] = useState<'all' | IssueSeverity>('all')

  // Get stats for all sections
  const stats = useMemo(() => calculateProspectusStats(sections), [sections])

  // Get filtered sections based on severity
  const filteredSections = useMemo(() => {
    if (severityFilter === 'all') return sections

    return sections.map(section => ({
      ...section,
      issues: section.issues.filter(issue => issue.severity === severityFilter),
    }))
  }, [sections, severityFilter])

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }, [])

  // Expand all sections
  const expandAll = useCallback(() => {
    setExpandedSections(new Set(sections.map(s => s.id)))
  }, [sections])

  // Collapse all sections
  const collapseAll = useCallback(() => {
    setExpandedSections(new Set())
  }, [])

  // Resolve an issue
  const resolveIssue = useCallback(
    (sectionId: string, issueId: string) => {
      setSections(prev =>
        prev.map(section => {
          if (section.id !== sectionId) return section

          const updatedIssues = section.issues.filter(i => i.id !== issueId)
          const increase = calculateCompletenessIncrease(section)
          const newCompleteness = Math.min(100, section.completeness + increase)

          return {
            ...section,
            issues: updatedIssues,
            issueCount: updatedIssues.length,
            completeness: newCompleteness,
          }
        })
      )
    },
    []
  )

  // Resolve a gap
  const resolveGap = useCallback(
    (sectionId: string, gapId: string) => {
      setSections(prev =>
        prev.map(section => {
          if (section.id !== sectionId) return section

          const updatedGaps = section.gaps.map(gap =>
            gap.id === gapId ? { ...gap, status: 'resolved' as const } : gap
          )
          const openGapCount = updatedGaps.filter(g => g.status === 'open').length
          const increase = calculateCompletenessIncrease(section)
          const newCompleteness = Math.min(100, section.completeness + increase)

          return {
            ...section,
            gaps: updatedGaps,
            gapCount: openGapCount,
            completeness: newCompleteness,
          }
        })
      )
    },
    []
  )

  // Update a section
  const updateSection = useCallback(
    (sectionId: string, updates: Partial<ProspectusSection>) => {
      setSections(prev =>
        prev.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      )
    },
    []
  )

  // Bulk update sections
  const updateSections = useCallback((updates: Array<{ id: string; data: Partial<ProspectusSection> }>) => {
    const updateMap = new Map(updates.map(u => [u.id, u.data]))

    setSections(prev =>
      prev.map(section => {
        const update = updateMap.get(section.id)
        return update ? { ...section, ...update } : section
      })
    )
  }, [])

  // Mark all issues in a section as resolved
  const resolveAllIssuesInSection = useCallback(
    (sectionId: string) => {
      setSections(prev =>
        prev.map(section => {
          if (section.id !== sectionId) return section

          return {
            ...section,
            issues: [],
            issueCount: 0,
            completeness: Math.min(100, section.completeness + 30), // Bonus for clearing all issues
          }
        })
      )
    },
    []
  )

  // Get section by ID
  const getSection = useCallback(
    (sectionId: string) => sections.find(s => s.id === sectionId),
    [sections]
  )

  // Get issue by ID within a section
  const getIssue = useCallback(
    (sectionId: string, issueId: string) => {
      const section = getSection(sectionId)
      return section?.issues.find(i => i.id === issueId)
    },
    [getSection]
  )

  // Get count of critical issues
  const criticalIssueCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.issues.filter(i => i.severity === 'critical').length, 0),
    [sections]
  )

  // Check if prospectus is ready (no critical issues, completeness > 80%)
  const isProspectusReady = useMemo(() => {
    return criticalIssueCount === 0 && stats.averageCompleteness >= 80
  }, [criticalIssueCount, stats.averageCompleteness])

  // Get recommendations based on current state
  const recommendations = useMemo(() => {
    const recs: string[] = []

    if (criticalIssueCount > 0) {
      recs.push(`Fix ${criticalIssueCount} critical issue${criticalIssueCount > 1 ? 's' : ''} before filing`)
    }

    if (stats.averageCompleteness < 70) {
      recs.push('Increase overall completeness to at least 70%')
    }

    if (stats.totalModerate > 0) {
      recs.push(`Address ${stats.totalModerate} moderate issue${stats.totalModerate > 1 ? 's' : ''} for stronger prospectus`)
    }

    if (stats.totalGaps > 0) {
      recs.push(`Close ${stats.totalGaps} gap${stats.totalGaps > 1 ? 's' : ''} in required sections`)
    }

    if (stats.averageStrength < 3) {
      recs.push('Work systematically through each section to improve overall quality')
    }

    return recs
  }, [criticalIssueCount, stats])

  return {
    // State
    sections,
    filteredSections,
    expandedSections,
    severityFilter,
    stats,
    criticalIssueCount,
    isProspectusReady,
    recommendations,

    // Actions
    toggleSection,
    expandAll,
    collapseAll,
    resolveIssue,
    resolveGap,
    updateSection,
    updateSections,
    resolveAllIssuesInSection,
    setSeverityFilter,

    // Queries
    getSection,
    getIssue,
  }
}

/**
 * Hook for syncing validator state with API
 */
export function useProspectusValidatorSync(
  sections: ProspectusSection[],
  onUpdate?: (sectionId: string, data: Partial<ProspectusSection>) => Promise<void>
) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)

  const syncSection = useCallback(
    async (sectionId: string, data: Partial<ProspectusSection>) => {
      if (!onUpdate) return

      setIsSyncing(true)
      setSyncError(null)

      try {
        await onUpdate(sectionId, data)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to sync')
        setSyncError(err)
      } finally {
        setIsSyncing(false)
      }
    },
    [onUpdate]
  )

  const syncAllSections = useCallback(async () => {
    if (!onUpdate) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      await Promise.all(
        sections.map(section =>
          onUpdate(section.id, {
            strength: section.strength,
            issueCount: section.issueCount,
            gapCount: section.gapCount,
            completeness: section.completeness,
          })
        )
      )
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to sync sections')
      setSyncError(err)
    } finally {
      setIsSyncing(false)
    }
  }, [sections, onUpdate])

  return {
    isSyncing,
    syncError,
    syncSection,
    syncAllSections,
  }
}

/**
 * Hook for tracking validator usage analytics
 */
export function useValidatorAnalytics() {
  const trackIssueResolved = useCallback((sectionId: string, issueId: string, severity: IssueSeverity) => {
    // Send analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'issue_resolved', {
        section: sectionId,
        issue: issueId,
        severity,
      })
    }
  }, [])

  const trackSectionExpanded = useCallback((sectionId: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'section_expanded', {
        section: sectionId,
      })
    }
  }, [])

  const trackFilterChanged = useCallback((severity: IssueSeverity | 'all') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'filter_changed', {
        filter: severity,
      })
    }
  }, [])

  return {
    trackIssueResolved,
    trackSectionExpanded,
    trackFilterChanged,
  }
}
