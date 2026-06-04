'use client'

import { motion } from 'framer-motion'
import { ProspectusValidatorDashboard, ProspectusSection } from '@/components/prospectus/ProspectusValidatorDashboard'

const MOCK_SECTIONS: ProspectusSection[] = [
  {
    id: 'exec-summary',
    name: 'Executive Summary',
    strength: 3,
    status: 'passable',
    issueCount: 2,
    gapCount: 1,
    completeness: 65,
    issues: [
      {
        id: 'issue-1',
        severity: 'moderate',
        description: 'Missing quantified market opportunity size and TAM analysis',
        rootCause: 'Executive summary lacks specific market size figures and addressable market definition',
        fixOptions: [
          { id: 'fix-1', label: 'Add $5B+ TAM figure with source attribution', checked: false },
          { id: 'fix-2', label: 'Include SAM (Serviceable Addressable Market) breakdown', checked: false },
          { id: 'fix-3', label: 'Reference third-party market research reports (IDC, Gartner)', checked: false },
        ],
        guidance: 'NASDAQ requires clear market sizing in executive summary. Use conservative estimates backed by analyst reports. Typical range: $2B-$10B+ TAM for venture-backed companies going public.',
        exampleLink: 'https://www.sec.gov/Archives/edgar/container/1545870/000154587021000048/form424b4-20210624.htm#a_exhibit991',
      },
      {
        id: 'issue-2',
        severity: 'minor',
        description: 'Competitive positioning lacks differentiation narrative',
        rootCause: 'Executive summary mentions competitors but does not articulate unique value proposition',
        fixOptions: [
          { id: 'fix-4', label: 'Add 1-2 sentence unique value proposition', checked: false },
          { id: 'fix-5', label: 'Include competitive advantage factors (technology, cost, network effects)', checked: false },
        ],
        guidance: 'Use clear, investor-friendly language to explain why your solution wins. Avoid superlatives; focus on defensible facts.',
      },
    ],
    gaps: [
      {
        id: 'gap-1',
        category: 'Financial Highlights',
        description: 'Need 3-year revenue growth rates and EBITDA margins',
        required: true,
        status: 'open',
      },
    ],
  },
  {
    id: 'risk-factors',
    name: 'Risk Factors',
    strength: 2,
    status: 'weak',
    issueCount: 4,
    gapCount: 3,
    completeness: 45,
    issues: [
      {
        id: 'issue-3',
        severity: 'critical',
        description: 'Customer concentration risk not adequately disclosed',
        rootCause: 'Missing top-10 customer revenue analysis and dependency disclosures',
        fixOptions: [
          { id: 'fix-6', label: 'Add table: Top 10 customers as % of revenue', checked: false },
          { id: 'fix-7', label: 'Disclose if any customer > 10% of annual revenue', checked: false },
          { id: 'fix-8', label: 'Explain retention rates and contract terms', checked: false },
        ],
        guidance: 'SEC requires disclosure if any customer represents >10% of revenue. This is mandatory for Regulation S-K Item 1A(f). Include renewal rates and churn analysis.',
      },
      {
        id: 'issue-4',
        severity: 'critical',
        description: 'Intellectual property litigation risks not disclosed',
        rootCause: 'No discussion of pending or threatened patent litigation',
        fixOptions: [
          { id: 'fix-9', label: 'Add subsection: "Intellectual Property Litigation"', checked: false },
          { id: 'fix-10', label: 'Disclose pending litigation from IP holders', checked: false },
          { id: 'fix-11', label: 'Include estimated legal costs and timeline', checked: false },
        ],
        guidance: 'Even threats of IP litigation must be disclosed. Consult general counsel for pending matters. Include estimated defense costs.',
      },
      {
        id: 'issue-5',
        severity: 'moderate',
        description: 'Regulatory compliance risks underspecified',
        rootCause: 'Vague discussion of data privacy and regulatory obligations',
        fixOptions: [
          { id: 'fix-12', label: 'Add GDPR/CCPA compliance status and costs', checked: false },
          { id: 'fix-13', label: 'Disclose any regulatory investigations', checked: false },
        ],
        guidance: 'Specify which regulations apply (GDPR, CCPA, HIPAA, SOX). Disclose annual compliance costs. Reference any pending investigations.',
      },
      {
        id: 'issue-6',
        severity: 'moderate',
        description: 'Foreign exchange exposure risk minimized',
        rootCause: 'International revenue exposure (€2M/year) not risk-disclosed',
        fixOptions: [
          { id: 'fix-14', label: 'Add FX hedging strategy description', checked: false },
          { id: 'fix-15', label: 'Quantify impact of 10% currency movement', checked: false },
        ],
        guidance: 'For companies with >15% international revenue, disclose FX risk impact and mitigation strategy.',
      },
    ],
    gaps: [
      {
        id: 'gap-2',
        category: 'Key Personnel Risk',
        description: 'Missing "key person" insurance disclosure',
        required: true,
        status: 'open',
      },
      {
        id: 'gap-3',
        category: 'Supply Chain Risk',
        description: 'No discussion of supply chain concentration or geopolitical exposure',
        required: true,
        status: 'open',
      },
      {
        id: 'gap-4',
        category: 'Technology Risk',
        description: 'Cloud infrastructure dependency and vendor lock-in risk not disclosed',
        required: false,
        status: 'open',
      },
    ],
  },
  {
    id: 'use-of-proceeds',
    name: 'Use of Proceeds',
    strength: 3,
    status: 'passable',
    issueCount: 1,
    gapCount: 2,
    completeness: 60,
    issues: [
      {
        id: 'issue-7',
        severity: 'moderate',
        description: 'Use of proceeds allocation lacks timeline',
        rootCause: 'Percentages provided but no timeline for deployment or milestones',
        fixOptions: [
          { id: 'fix-16', label: 'Add deployment timeline (Year 1, Year 2, Year 3)', checked: false },
          { id: 'fix-17', label: 'Include key operational milestones tied to capital deployment', checked: false },
          { id: 'fix-18', label: 'Specify any contingencies if market conditions change', checked: false },
        ],
        guidance: 'Provide 3-year deployment timeline with milestones. Explain how capital will be deployed to achieve growth targets. If capital will be used for acquisition, include target profile.',
      },
    ],
    gaps: [
      {
        id: 'gap-5',
        category: 'Working Capital Impact',
        description: 'Need explanation of how proceeds will impact working capital ratios',
        required: true,
        status: 'open',
      },
      {
        id: 'gap-6',
        category: 'Acquisition Plans',
        description: 'If part of proceeds for M&A, need target acquisition profile criteria',
        required: false,
        status: 'open',
      },
    ],
  },
  {
    id: 'management',
    name: 'Management',
    strength: 4,
    status: 'defendable',
    issueCount: 1,
    gapCount: 0,
    completeness: 85,
    issues: [
      {
        id: 'issue-8',
        severity: 'minor',
        description: 'Executive compensation disclosure needs more detail',
        rootCause: 'Summary compensation table present but missing stock option vesting schedules',
        fixOptions: [
          { id: 'fix-19', label: 'Add detailed option vesting schedules for all named executives', checked: false },
          { id: 'fix-20', label: 'Include equity compensation as % of total compensation', checked: false },
        ],
        guidance: 'Provide vesting schedules for all equity awards. Show cliff periods and acceleration events. Compare CEO comp to industry benchmarks.',
      },
    ],
    gaps: [],
  },
  {
    id: 'financial-da',
    name: 'Financial D&A',
    strength: 3,
    status: 'passable',
    issueCount: 2,
    gapCount: 2,
    completeness: 70,
    issues: [
      {
        id: 'issue-9',
        severity: 'moderate',
        description: 'Revenue recognition policy lacks sufficient detail',
        rootCause: 'MD&A mentions ASC 606 but lacks specific examples of recognition timing',
        fixOptions: [
          { id: 'fix-21', label: 'Add specific examples of when revenue is recognized for each product/service', checked: false },
          { id: 'fix-22', label: 'Explain impact of warranty obligations on revenue timing', checked: false },
        ],
        guidance: 'Per GAAP, clearly describe how revenue is recognized. Include examples for SaaS subscriptions, professional services, and product sales.',
      },
      {
        id: 'issue-10',
        severity: 'minor',
        description: 'Adjusted EBITDA reconciliation missing non-GAAP metrics detail',
        rootCause: 'Adjusted EBITDA presented but lacks clear reconciliation to GAAP metrics',
        fixOptions: [
          { id: 'fix-23', label: 'Create detailed reconciliation table with all adjustments itemized', checked: false },
          { id: 'fix-24', label: 'Explain rationale for each non-GAAP adjustment', checked: false },
        ],
        guidance: 'SEC requires clear reconciliation of non-GAAP to GAAP metrics. Use supplemental GAAP to non-GAAP table per Reg G requirements.',
      },
    ],
    gaps: [
      {
        id: 'gap-7',
        category: 'Segment Reporting',
        description: 'Need revenue breakdown by product line or customer segment',
        required: true,
        status: 'open',
      },
      {
        id: 'gap-8',
        category: 'Liquidity Analysis',
        description: 'Cash runway projection and burn rate analysis needed',
        required: true,
        status: 'open',
      },
    ],
  },
  {
    id: 'market-opp',
    name: 'Market Opportunity',
    strength: 5,
    status: 'strong',
    issueCount: 0,
    gapCount: 0,
    completeness: 100,
    issues: [],
    gaps: [],
  },
  {
    id: 'capitalization',
    name: 'Capitalization',
    strength: 3,
    status: 'passable',
    issueCount: 1,
    gapCount: 1,
    completeness: 65,
    issues: [
      {
        id: 'issue-11',
        severity: 'moderate',
        description: 'Fully diluted share count assumes exercise of all options/warrants',
        rootCause: 'Current method overestimates dilution; should use treasury method for in-the-money options',
        fixOptions: [
          { id: 'fix-25', label: 'Recalculate using treasury stock method per ASC 260', checked: false },
          { id: 'fix-26', label: 'Separate "as-reported" vs "fully diluted" per regulator guidance', checked: false },
        ],
        guidance: 'Use treasury stock method for EPS calculations. Clearly disclose assumed option exercise price and quantity.',
      },
    ],
    gaps: [
      {
        id: 'gap-9',
        category: 'Anti-Dilution Provisions',
        description: 'Missing explanation of weighted average vs full ratchet anti-dilution mechanics',
        required: true,
        status: 'open',
      },
    ],
  },
]

export default function ProspectusValidatorPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-3">
              Analysis
            </div>
            <h1 className="serif text-4xl text-nav mb-2">
              Prospectus Validator
            </h1>
            <p className="text-text-muted max-w-2xl">
              Analyze section strength and identify gaps. Get strength ratings from weak to strong with specific improvement recommendations.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ProspectusValidatorDashboard sections={MOCK_SECTIONS} />
        </motion.div>
      </main>
    </div>
  )
}
