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
    issues: [],
    gaps: [],
  },
  {
    id: 'risk-factors',
    name: 'Risk Factors',
    strength: 2,
    status: 'weak',
    issueCount: 4,
    gapCount: 3,
    completeness: 45,
    issues: [],
    gaps: [],
  },
  {
    id: 'use-of-proceeds',
    name: 'Use of Proceeds',
    strength: 3,
    status: 'passable',
    issueCount: 1,
    gapCount: 2,
    completeness: 60,
    issues: [],
    gaps: [],
  },
  {
    id: 'management',
    name: 'Management',
    strength: 4,
    status: 'defendable',
    issueCount: 1,
    gapCount: 0,
    completeness: 85,
    issues: [],
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
    issues: [],
    gaps: [],
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
    issues: [],
    gaps: [],
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
