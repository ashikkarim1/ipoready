'use client'

import { useState } from 'react'
import { ProspectusValidatorDashboard, ProspectusSection } from './ProspectusValidatorDashboard'

/**
 * Example usage of the ProspectusValidatorDashboard component
 * Shows how to structure data and handle updates
 */

const EXAMPLE_SECTIONS: ProspectusSection[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    strength: 3.5,
    status: 'passable',
    issueCount: 2,
    gapCount: 1,
    completeness: 75,
    issues: [
      {
        id: 'exec-1',
        severity: 'moderate',
        description: 'Investment highlights lack quantifiable metrics',
        rootCause: 'Executive summary uses vague language like "significant growth" without specific percentages or comparisons to peers',
        fixOptions: [
          { id: 'fix-1', label: 'Update narrative with 15-25% YoY growth targets', checked: false },
          { id: 'fix-2', label: 'Add market size and addressable opportunity', checked: false },
          { id: 'fix-3', label: 'Reference comparable IPOs', checked: false },
        ],
        guidance:
          'Comparable TSX IPOs cite 15-25% YoY revenue growth and $500M+ TAM. Your summary should anchor to concrete metrics.',
        exampleLink: 'https://example.com/comparable-exec-summaries',
      },
      {
        id: 'exec-2',
        severity: 'minor',
        description: 'Management team credentials need strengthening',
        rootCause: 'Bios mention experience but lack specific track record numbers (exits, company scale managed)',
        fixOptions: [
          { id: 'fix-4', label: 'Add revenue scale managed by each executive', checked: false },
          { id: 'fix-5', label: 'Highlight prior exits or IPO experience', checked: false },
        ],
        guidance: 'Include: "Managed $X revenue at prior role" and "Led $X acquisition" metrics for credibility.',
      },
    ],
    gaps: [
      {
        id: 'gap-1',
        category: 'Market Opportunity',
        description: 'TAM analysis not included',
        required: true,
        status: 'open',
      },
    ],
  },
  {
    id: 'risk-factors',
    name: 'Risk Factors',
    strength: 2.8,
    status: 'passable',
    issueCount: 3,
    gapCount: 2,
    completeness: 65,
    issues: [
      {
        id: 'risk-1',
        severity: 'critical',
        description: 'Customer concentration risk not adequately disclosed',
        rootCause: 'Top 10 customers represent 60% of revenue but risk factors only mention "customer concentration" without quantification',
        fixOptions: [
          { id: 'fix-6', label: 'Add specific customer concentration percentages', checked: false },
          { id: 'fix-7', label: 'Disclose top customer as % of revenue', checked: false },
          { id: 'fix-8', label: 'Update PACE to reflect concentration factor', checked: false },
        ],
        guidance:
          'Regulatory requirement: disclose if any customer represents >10% of revenue. Must include mitigation strategies.',
        exampleLink: 'https://example.com/customer-concentration-guidance',
      },
      {
        id: 'risk-2',
        severity: 'moderate',
        description: 'Technology obsolescence risk incompletely addressed',
        rootCause: 'Risk mentions potential for tech changes but lacks discussion of R&D investment, product roadmap, or competitive position',
        fixOptions: [
          { id: 'fix-9', label: 'Add R&D spending as % of revenue (industry benchmark)', checked: false },
          { id: 'fix-10', label: 'Reference patent portfolio or IP strength', checked: false },
        ],
        guidance: 'Tech companies should demonstrate 15-20% R&D spend and clear innovation pipeline.',
      },
      {
        id: 'risk-3',
        severity: 'moderate',
        description: 'Regulatory risk section lacks specificity',
        rootCause: 'Generic reference to "regulatory compliance" without addressing sector-specific regulations or compliance status',
        fixOptions: [
          { id: 'fix-11', label: 'Add specific regulatory licenses or certifications', checked: false },
          { id: 'fix-12', label: 'Disclose any ongoing regulatory investigations', checked: false },
        ],
        guidance: 'Name specific regulations affecting your industry (e.g., PIPEDA, SOC 2).',
      },
    ],
    gaps: [
      {
        id: 'gap-2',
        category: 'Regulatory',
        description: 'Key regulatory licenses and status',
        required: true,
        status: 'open',
      },
      {
        id: 'gap-3',
        category: 'Competitive',
        description: 'Competitive threat assessment',
        required: false,
        status: 'open',
      },
    ],
  },
  {
    id: 'use-of-proceeds',
    name: 'Use of Proceeds',
    strength: 4.2,
    status: 'defendable',
    issueCount: 1,
    gapCount: 0,
    completeness: 90,
    issues: [
      {
        id: 'uop-1',
        severity: 'minor',
        description: 'Allocation percentages could be more specific',
        rootCause: 'Uses ranges (30-40%) instead of point estimates',
        fixOptions: [
          { id: 'fix-13', label: 'Provide specific allocation amounts', checked: false },
          { id: 'fix-14', label: 'Include timeline for deployment', checked: false },
        ],
        guidance: 'Most IPOs provide specific allocations: X% Product, Y% Sales & Marketing, Z% Working Capital.',
      },
    ],
    gaps: [],
  },
  {
    id: 'management',
    name: 'Management & Board',
    strength: 4.8,
    status: 'strong',
    issueCount: 0,
    gapCount: 0,
    completeness: 100,
    issues: [],
    gaps: [],
  },
  {
    id: 'financial-disclosure',
    name: 'Financial Disclosure & Analysis',
    strength: 3.2,
    status: 'passable',
    issueCount: 2,
    gapCount: 1,
    completeness: 70,
    issues: [
      {
        id: 'fin-1',
        severity: 'critical',
        description: 'EBITDA reconciliation missing from non-GAAP metrics',
        rootCause: 'Adjusted EBITDA presented without reconciliation to GAAP net income',
        fixOptions: [
          { id: 'fix-15', label: 'Create detailed GAAP to non-GAAP reconciliation table', checked: false },
          { id: 'fix-16', label: 'Add auditor footnote on non-GAAP metrics', checked: false },
        ],
        guidance: 'SEC requirement: all non-GAAP metrics must reconcile to closest GAAP measure with equal prominence.',
        exampleLink: 'https://example.com/non-gaap-reconciliation-template',
      },
      {
        id: 'fin-2',
        severity: 'moderate',
        description: 'Working capital trends not adequately explained',
        rootCause: 'MD&A states working capital increased 40% YoY but lacks explanation of why',
        fixOptions: [
          { id: 'fix-17', label: 'Analyze receivables vs. payables changes', checked: false },
          { id: 'fix-18', label: 'Explain seasonal working capital impacts', checked: false },
        ],
        guidance: 'Explain each significant variance (>15%) in components of working capital.',
      },
    ],
    gaps: [
      {
        id: 'gap-4',
        category: 'Cash Flow',
        description: 'Free cash flow analysis and forecast',
        required: true,
        status: 'open',
      },
    ],
  },
  {
    id: 'market-analysis',
    name: 'Market & Competitive Analysis',
    strength: 3.5,
    status: 'passable',
    issueCount: 1,
    gapCount: 1,
    completeness: 75,
    issues: [
      {
        id: 'mkt-1',
        severity: 'moderate',
        description: 'Market size estimates lack third-party validation',
        rootCause: 'TAM/SAM presented without citations to analyst reports or industry data',
        fixOptions: [
          { id: 'fix-19', label: 'Source from Gartner, IDC, or similar analyst firms', checked: false },
          { id: 'fix-20', label: 'Add growth rate assumptions from industry reports', checked: false },
        ],
        guidance: 'Use 2-3 credible sources (Gartner, IDC, BIA, McKinsey). Show range and cite methodology.',
      },
    ],
    gaps: [
      {
        id: 'gap-5',
        category: 'Competitive Positioning',
        description: 'Detailed competitive matrix vs. key competitors',
        required: false,
        status: 'open',
      },
    ],
  },
  {
    id: 'capitalization',
    name: 'Capitalization & Ownership',
    strength: 4.5,
    status: 'strong',
    issueCount: 0,
    gapCount: 1,
    completeness: 85,
    issues: [],
    gaps: [
      {
        id: 'gap-6',
        category: 'Warrants',
        description: 'Warrant valuation and impact disclosure',
        required: false,
        status: 'open',
      },
    ],
  },
]

export function ProspectusValidatorExample() {
  const [sections, setSections] = useState<ProspectusSection[]>(EXAMPLE_SECTIONS)

  const handleSectionUpdate = (sectionId: string, updates: Partial<ProspectusSection>) => {
    setSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      )
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProspectusValidatorDashboard
          sections={sections}
          onSectionUpdate={handleSectionUpdate}
        />
      </div>
    </div>
  )
}
