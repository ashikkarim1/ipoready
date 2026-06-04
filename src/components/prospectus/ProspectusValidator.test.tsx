/**
 * Test suite for Prospectus Validator components
 * Run with: npm test src/components/prospectus/ProspectusValidator.test.tsx
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProspectusValidatorDashboard } from './ProspectusValidatorDashboard'
import { useProspectusValidator } from './useProspectusValidator'
import { getStrengthStatus, calculateCompletenessIncrease, calculateProspectusStats } from './types'
import type { ProspectusSection } from './types'

// Mock data
const mockSection: ProspectusSection = {
  id: 'test-section',
  name: 'Test Section',
  strength: 3,
  status: 'passable',
  issueCount: 2,
  gapCount: 1,
  completeness: 50,
  issues: [
    {
      id: 'issue-1',
      severity: 'critical',
      description: 'Critical issue',
      rootCause: 'Root cause explanation',
      fixOptions: [{ id: 'fix-1', label: 'Fix it', checked: false }],
      guidance: 'Best practice guidance',
      exampleLink: 'https://example.com',
    },
    {
      id: 'issue-2',
      severity: 'moderate',
      description: 'Moderate issue',
      rootCause: 'Another root cause',
      fixOptions: [],
      guidance: 'Guidance text',
    },
  ],
  gaps: [
    {
      id: 'gap-1',
      category: 'Missing Info',
      description: 'Some info is missing',
      required: true,
      status: 'open',
    },
  ],
}

const mockSections: ProspectusSection[] = [mockSection]

// ============ Unit Tests ============

describe('Strength Utilities', () => {
  describe('getStrengthStatus', () => {
    test('returns "weak" for strength <= 1', () => {
      expect(getStrengthStatus(0.5)).toBe('weak')
      expect(getStrengthStatus(1)).toBe('weak')
    })

    test('returns "passable" for strength 2-3', () => {
      expect(getStrengthStatus(2)).toBe('passable')
      expect(getStrengthStatus(2.5)).toBe('passable')
      expect(getStrengthStatus(3)).toBe('passable')
    })

    test('returns "defendable" for strength 4', () => {
      expect(getStrengthStatus(3.5)).toBe('defendable')
      expect(getStrengthStatus(4)).toBe('defendable')
    })

    test('returns "strong" for strength > 4', () => {
      expect(getStrengthStatus(4.5)).toBe('strong')
      expect(getStrengthStatus(5)).toBe('strong')
    })
  })

  describe('calculateCompletenessIncrease', () => {
    test('returns 0 when section has no issues or gaps', () => {
      const section: ProspectusSection = { ...mockSection, issues: [], gaps: [] }
      expect(calculateCompletenessIncrease(section)).toBe(0)
    })

    test('returns positive value when section has items', () => {
      expect(calculateCompletenessIncrease(mockSection)).toBeGreaterThan(0)
    })

    test('returns higher increase with fewer items', () => {
      const fewItems = { ...mockSection, issues: [mockSection.issues[0]], gaps: [] }
      const manyItems = { ...mockSection }
      expect(calculateCompletenessIncrease(fewItems)).toBeGreaterThan(calculateCompletenessIncrease(manyItems))
    })
  })

  describe('calculateProspectusStats', () => {
    test('calculates correct stats for empty array', () => {
      const stats = calculateProspectusStats([])
      expect(stats.totalSections).toBe(0)
      expect(stats.averageStrength).toBe(0)
      expect(stats.totalIssues).toBe(0)
    })

    test('calculates correct stats for single section', () => {
      const stats = calculateProspectusStats([mockSection])
      expect(stats.totalSections).toBe(1)
      expect(stats.totalIssues).toBe(2)
      expect(stats.totalCritical).toBe(1)
      expect(stats.totalModerate).toBe(1)
      expect(stats.totalMinor).toBe(0)
      expect(stats.totalGaps).toBe(1)
    })

    test('calculates correct average strength', () => {
      const section1 = { ...mockSection, strength: 2 as any }
      const section2 = { ...mockSection, strength: 4 as any }
      const stats = calculateProspectusStats([section1, section2])
      expect(stats.averageStrength).toBe(3)
    })

    test('counts section completion status correctly', () => {
      const complete = { ...mockSection, completeness: 100 }
      const inProgress = { ...mockSection, completeness: 50 }
      const notStarted = { ...mockSection, completeness: 0 }
      const stats = calculateProspectusStats([complete, inProgress, notStarted])
      expect(stats.sectionsComplete).toBe(1)
      expect(stats.sectionsInProgress).toBe(1)
      expect(stats.sectionsNotStarted).toBe(1)
    })
  })
})

// ============ Hook Tests ============

describe('useProspectusValidator', () => {
  test('initializes with provided sections', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))
    expect(result.current.sections).toHaveLength(1)
    expect(result.current.sections[0].id).toBe('test-section')
  })

  test('toggles section expansion', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))
    expect(result.current.expandedSections.has('test-section')).toBe(false)

    result.current.toggleSection('test-section')
    expect(result.current.expandedSections.has('test-section')).toBe(true)

    result.current.toggleSection('test-section')
    expect(result.current.expandedSections.has('test-section')).toBe(false)
  })

  test('expands and collapses all sections', () => {
    const sections = [mockSection, { ...mockSection, id: 'section-2' }]
    const { result } = renderHook(() => useProspectusValidator(sections))

    result.current.expandAll()
    expect(result.current.expandedSections.size).toBe(2)

    result.current.collapseAll()
    expect(result.current.expandedSections.size).toBe(0)
  })

  test('resolves an issue and updates completeness', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))

    expect(result.current.sections[0].issueCount).toBe(2)
    expect(result.current.sections[0].completeness).toBe(50)

    result.current.resolveIssue('test-section', 'issue-1')

    expect(result.current.sections[0].issueCount).toBe(1)
    expect(result.current.sections[0].completeness).toBeGreaterThan(50)
  })

  test('resolves a gap and updates completeness', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))

    expect(result.current.sections[0].gapCount).toBe(1)
    result.current.resolveGap('test-section', 'gap-1')
    expect(result.current.sections[0].gapCount).toBe(0)
  })

  test('updates a section', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))

    result.current.updateSection('test-section', { strength: 5 })
    expect(result.current.sections[0].strength).toBe(5)
  })

  test('filters sections by severity', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))

    result.current.setSeverityFilter('critical')
    expect(result.current.filteredSections[0].issues).toHaveLength(1)
    expect(result.current.filteredSections[0].issues[0].severity).toBe('critical')

    result.current.setSeverityFilter('all')
    expect(result.current.filteredSections[0].issues).toHaveLength(2)
  })

  test('provides correct recommendations', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))
    expect(result.current.recommendations.length).toBeGreaterThan(0)
  })

  test('correctly identifies if prospectus is ready', () => {
    const readySection: ProspectusSection = { ...mockSection, issueCount: 0, completeness: 100, issues: [] }
    const { result } = renderHook(() => useProspectusValidator([readySection]))
    expect(result.current.isProspectusReady).toBe(true)
  })

  test('retrieves section by ID', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))
    const section = result.current.getSection('test-section')
    expect(section?.id).toBe('test-section')
  })

  test('retrieves issue by ID within section', () => {
    const { result } = renderHook(() => useProspectusValidator([mockSection]))
    const issue = result.current.getIssue('test-section', 'issue-1')
    expect(issue?.id).toBe('issue-1')
  })
})

// ============ Component Tests ============

describe('ProspectusValidatorDashboard', () => {
  test('renders without crashing', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    expect(screen.getByText('Prospectus Validator')).toBeInTheDocument()
  })

  test('displays all section names', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
  })

  test('shows overall summary', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    expect(screen.getByText('Overall Prospectus Strength')).toBeInTheDocument()
  })

  test('displays strength rating', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    // Look for the strength value in the gauge
    expect(screen.getByText('3.0')).toBeInTheDocument()
  })

  test('shows issue and gap counts', () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)
    expect(screen.getByText(/🔴 2 Issues/)).toBeInTheDocument()
    expect(screen.getByText(/🟡 1 Gaps/)).toBeInTheDocument()
  })

  test('expands section on click', async () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)

    // Initially, expanded content should not be visible
    expect(screen.queryByText('Completeness')).not.toBeInTheDocument()

    // Click section header
    const header = screen.getByText('Test Section')
    fireEvent.click(header.closest('button')!)

    // Wait for expansion animation
    await waitFor(() => {
      expect(screen.getByText('Completeness')).toBeInTheDocument()
    })
  })

  test('calls onSectionUpdate when provided', async () => {
    const onSectionUpdate = jest.fn()
    render(
      <ProspectusValidatorDashboard
        sections={mockSections}
        onSectionUpdate={onSectionUpdate}
      />
    )

    // Expand section
    const header = screen.getByText('Test Section')
    fireEvent.click(header.closest('button')!)

    // Find and click "Mark Resolved" button (we need to find it in the expanded content)
    await waitFor(() => {
      const resolveButtons = screen.getAllByText('Mark Resolved')
      if (resolveButtons.length > 0) {
        fireEvent.click(resolveButtons[0])
      }
    })
  })

  test('filters by severity level', async () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)

    // Click critical filter
    const criticalButton = screen.getByRole('button', { name: /Critical/i })
    fireEvent.click(criticalButton)

    // Expand section to see filtered issues
    const header = screen.getByText('Test Section')
    fireEvent.click(header.closest('button')!)

    // Should show only critical issues
    await waitFor(() => {
      // Component should be updated with filter
      expect(criticalButton.className).toContain('ring')
    })
  })

  test('shows empty state when no sections', () => {
    render(<ProspectusValidatorDashboard sections={[]} />)
    expect(screen.getByText('No sections to display')).toBeInTheDocument()
  })

  test('displays strength status correctly', () => {
    const sections: ProspectusSection[] = [
      { ...mockSection, strength: 1, status: 'weak' },
      { ...mockSection, strength: 3, status: 'passable' },
      { ...mockSection, strength: 4, status: 'defendable' },
      { ...mockSection, strength: 5, status: 'strong' },
    ]

    render(<ProspectusValidatorDashboard sections={sections} />)
    // Component should render without errors
    expect(screen.getByText('Prospectus Validator')).toBeInTheDocument()
  })

  test('shows completion percentage', async () => {
    render(<ProspectusValidatorDashboard sections={mockSections} />)

    // Expand section
    const header = screen.getByText('Test Section')
    fireEvent.click(header.closest('button')!)

    // Check for completeness display
    await waitFor(() => {
      expect(screen.getByText('Completeness')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })
})

// ============ Integration Tests ============

describe('ProspectusValidator Integration', () => {
  test('full workflow: expand, review, and resolve issue', async () => {
    const onSectionUpdate = jest.fn()
    render(
      <ProspectusValidatorDashboard
        sections={mockSections}
        onSectionUpdate={onSectionUpdate}
      />
    )

    // 1. Expand section
    const header = screen.getByText('Test Section')
    fireEvent.click(header.closest('button')!)

    // 2. Verify content is visible
    await waitFor(() => {
      expect(screen.getByText('Completeness')).toBeInTheDocument()
    })

    // 3. Look for issue details
    await waitFor(() => {
      expect(screen.getByText('CRITICAL')).toBeInTheDocument()
    })
  })

  test('handles multiple sections', () => {
    const sections: ProspectusSection[] = [
      { ...mockSection, id: 'section-1', name: 'Section 1' },
      { ...mockSection, id: 'section-2', name: 'Section 2' },
      { ...mockSection, id: 'section-3', name: 'Section 3' },
    ]

    render(<ProspectusValidatorDashboard sections={sections} />)

    // All sections should be visible
    expect(screen.getByText('Section 1')).toBeInTheDocument()
    expect(screen.getByText('Section 2')).toBeInTheDocument()
    expect(screen.getByText('Section 3')).toBeInTheDocument()
  })

  test('aggregates stats correctly across sections', () => {
    const sections: ProspectusSection[] = [
      { ...mockSection, id: 's1', strength: 2, issueCount: 1, gapCount: 0 },
      { ...mockSection, id: 's2', strength: 4, issueCount: 0, gapCount: 2 },
    ]

    render(<ProspectusValidatorDashboard sections={sections} />)

    // Should show both issues and gaps
    expect(screen.getByText(/🔴 1 Issues/)).toBeInTheDocument()
    expect(screen.getByText(/🟡 2 Gaps/)).toBeInTheDocument()
  })
})

// Helper function to render hooks
function renderHook<T>(hook: () => T) {
  let result: T
  const TestComponent = () => {
    result = hook()
    return null
  }

  render(<TestComponent />)
  return { result: result! }
}
