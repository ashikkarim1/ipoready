'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  ChevronDown, ChevronUp, CheckCircle2, Clock, DollarSign, AlertTriangle,
  TrendingUp, Users, BarChart3, Lightbulb, Rocket, Zap, BookOpen, MessageSquare, Award
} from 'lucide-react'

interface Pitfall {
  id: string
  title: string
  description: string
  details: string
  prevention: string
  impact: string
  severity: 'high' | 'medium' | 'low'
}

interface TimelineStage {
  phase: string
  duration: string
  feeling: string
  reality: string
  bullets: string[]
}

const PITFALLS: Pitfall[] = [
  {
    id: 'financials',
    title: 'Financial Statement Issues',
    description: 'Restatements, revenue recognition problems, or audit findings',
    details: 'This is the #1 delay. Your auditors find gaps in your controls, revenue recognition is questioned, or you have to restate prior periods. Happens in ~40% of IPO candidates.',
    prevention: 'Start audit prep 6 months before your target filing. Get your auditors involved early, not at the last minute.',
    impact: '4-8 week delay',
    severity: 'high'
  },
  {
    id: 'governance',
    title: 'Corporate Governance Gaps',
    description: 'Missing committees, weak independence, insufficient controls',
    details: 'Regulators want independent board committees, documented policies, and clear segregation of duties.',
    prevention: 'Build governance early. Get your board audit committee in place 6+ months before filing.',
    impact: '2-4 week delay',
    severity: 'medium'
  },
  {
    id: 'advisors',
    title: 'Advisor/Underwriter Mismatches',
    description: 'Wrong legal firm, bad underwriter fit, poor team chemistry',
    details: 'You pick a great law firm for M&A, but they\'ve never done public market work.',
    prevention: 'Vet carefully. Talk to their other IPO clients. Chemistry matters — you\'ll spend 18 months together.',
    impact: '2-3 month restart',
    severity: 'high'
  },
  {
    id: 'people',
    title: 'Executive Team Drama',
    description: 'Key departures, board conflicts, management misalignment',
    details: 'A founder leaves. The board fights about strategy. Your CFO and external auditor don\'t trust each other.',
    prevention: 'Get alignment early. Have honest conversations about IPO benefits vs. risks.',
    impact: '3-6 month delay',
    severity: 'high'
  },
  {
    id: 'market',
    title: 'Market Timing',
    description: 'Market downturn, sector falls out of favor, comparables underperform',
    details: 'Your tech IPO is ready. Then the market crashes. Or investors lose interest in your sector.',
    prevention: 'Build flexibility into your timeline. Aim for 18 months, not a specific date.',
    impact: '6-12 month delay',
    severity: 'high'
  },
  {
    id: 'docs',
    title: 'Documentation Chaos',
    description: 'Contracts scattered, incomplete agreements, undocumented transactions',
    details: 'Your material contracts are on three different drives. You don\'t have signed copies of everything.',
    prevention: 'Create a central document registry 6+ months before filing.',
    impact: '2-4 week delay',
    severity: 'medium'
  },
  {
    id: 'disclosure',
    title: 'Disclosure Issues',
    description: 'Regulators ask for clarity, missing risk factors, incomplete MD&A',
    details: 'Your prospectus draft goes to regulators. They come back with 50 comments.',
    prevention: 'Hire experienced disclosure counsel. Have them review drafts early and often.',
    impact: '3-8 week delay',
    severity: 'medium'
  },
  {
    id: 'story',
    title: 'Investor Indifference',
    description: 'Weak growth story, market doesn\'t want your sector, story needs work',
    details: 'Your narrative doesn\'t resonate. Investors in your roadshow are polite but not interested.',
    prevention: 'Test your story early. Do investor conversations 9+ months before filing.',
    impact: '2-6 month roadshow',
    severity: 'medium'
  }
]

const TIMELINE_STAGES: TimelineStage[] = [
  {
    phase: 'Months 1-3: "It\'s Overwhelming"',
    duration: '3 months',
    feeling: 'Lost, confused, exhausted',
    reality: 'This is completely normal. Every founder feels this way.',
    bullets: [
      'So many advisors suddenly in the room',
      'Endless meetings and calls',
      'New compliance requirements appearing weekly',
      'You don\'t know what you don\'t know'
    ]
  },
  {
    phase: 'Months 4-8: "You Get Into a Rhythm"',
    duration: '5 months',
    feeling: 'Manageable, aligned, productive',
    reality: 'You\'ve found your stride. The team is gelling.',
    bullets: [
      'You know who\'s doing what',
      'Meeting cadences become predictable',
      'Processes are routine (though still demanding)',
      'You can see real progress'
    ]
  },
  {
    phase: 'Months 9-12: "It\'s Actually Exciting"',
    duration: '4 months',
    feeling: 'Proud, motivated, seeing the finish line',
    reality: 'The hard part is behind you. Investor excitement is real.',
    bullets: [
      'Seeing the finish line',
      'Investors are energized',
      'Your story is compelling',
      'The team is proud of what you\'ve built'
    ]
  },
  {
    phase: 'Post-IPO: "You Made It"',
    duration: 'Forever',
    feeling: 'Relief, pride, perspective',
    reality: 'You\'ll advise other founders. You\'ll surprise yourself by how much you\'ve grown.',
    bullets: [
      'First day of trading is surreal',
      'Quarterly reporting becomes routine',
      'You become an advisor to other founders',
      'You realize how much you\'ve grown'
    ]
  }
]

export default function NewToThisPage() {
  const [expandedPitfall, setExpandedPitfall] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const togglePitfall = (id: string) => {
    setExpandedPitfall(expandedPitfall === id ? null : id)
  }

  const toggleCheckbox = (index: number) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedItems(newChecked)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
      <Header />

      {/* Hero Section */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '3rem 1.5rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#F9E4E1', border: '1px solid #E8312A30' }}>
              <Lightbulb className="w-4 h-4" style={{ color: '#E8312A' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E8312A' }}>Welcome to Reality</span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '1rem 0' }}>
              Welcome to Your IPO Journey
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '48rem', margin: '1rem auto' }}>
              You're about to do something 99% of companies never do. Here's what to expect — honest, encouraging, and real.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="inline-flex items-center gap-2" style={{ color: '#1A1A1A' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                <span style={{ fontWeight: 600 }}>No sugarcoating. No false promises. Just reality.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fundamentals Section */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '4rem 1.5rem', background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>
              What This Process Actually Is
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '42rem', margin: '0 auto' }}>
              Four fundamental truths that will shape your next 18 months.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: Transformation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: '#F9E4E1' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#E8312A' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                    It's a Transformation
                  </h3>
                  <p style={{ color: '#1A1A1A', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    You'll professionalize governance, controls, compliance, and board dynamics. Your company will be fundamentally better.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: '#FEF3E1' }}>
                  <Clock className="w-6 h-6" style={{ color: '#B45309' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                    It Takes 12-18 Months
                  </h3>
                  <p style={{ color: '#1A1A1A', lineHeight: 1.5 }}>
                    Not 6, not 9. Realistically 12-18 months of intensive work. Some take 24 months. Plan accordingly.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Costs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: '#F0F4FF' }}>
                  <DollarSign className="w-6 h-6" style={{ color: '#1D4ED8' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                    It Costs $500K-2M
                  </h3>
                  <p style={{ color: '#1A1A1A', lineHeight: 1.5 }}>
                    Legal, audit, advisory, underwriting, and leadership time. Budget conservatively and add 20% for contingencies.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Dilution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="p-8 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: '#EBF9F4' }}>
                  <Award className="w-6 h-6" style={{ color: '#2D7A5F' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                    You'll Own 15-30% Less
                  </h3>
                  <p style={{ color: '#1A1A1A', lineHeight: 1.5 }}>
                    Underwriting, new shares, expanded options. You'll be a smaller percentage, but it's a much bigger pie.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Common Pitfalls Section */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '4rem 1.5rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>
              8 Common Pitfalls (and How to Avoid Them)
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '42rem', margin: '0 auto' }}>
              These delays happen to most IPO candidates. But they're preventable if you know what to watch for.
            </p>
          </div>

          <div className="space-y-4">
            {PITFALLS.map((pitfall, index) => (
              <motion.div
                key={pitfall.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => togglePitfall(pitfall.id)}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    background: '#FFFFFF',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A1A1A')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E4E0')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                          {pitfall.title}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            background: pitfall.severity === 'high' ? '#FEE2E2' : pitfall.severity === 'medium' ? '#FEF3E1' : '#EBF9F4',
                            color: pitfall.severity === 'high' ? '#DC2626' : pitfall.severity === 'medium' ? '#B45309' : '#2D7A5F',
                          }}
                        >
                          {pitfall.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: 0 }}>
                        {pitfall.description}
                      </p>
                    </div>
                    <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
                      {expandedPitfall === pitfall.id ? (
                        <ChevronUp className="w-5 h-5" style={{ color: '#1A1A1A' }} />
                      ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: '#717171' }} />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedPitfall === pitfall.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        overflow: 'hidden',
                        borderLeft: '3px solid #E8312A',
                        paddingLeft: '1.5rem',
                        marginTop: '-1px',
                        paddingTop: '1.5rem',
                        paddingBottom: '1.5rem',
                        background: '#FAFAF8',
                        borderRadius: '0 0 0.5rem 0.5rem'
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                            What this looks like:
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>
                            {pitfall.details}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                            How to prevent it:
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>
                            {pitfall.prevention}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Typical delay:
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 600, color: '#E8312A' }}>
                            {pitfall.impact}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '4rem 1.5rem', background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>
              How It Feels Over Time
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '42rem', margin: '0 auto' }}>
              From overwhelm to relief. Here's what the emotional journey looks like.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {TIMELINE_STAGES.map((stage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '1.5rem',
                  background: '#F9F9F9',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.5rem',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#E8312A', borderRadius: '0.5rem 0 0 0.5rem' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
                  {stage.phase}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#717171', marginBottom: '0.75rem', marginLeft: '0.5rem' }}>
                  <strong>Feeling:</strong> {stage.feeling}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#1A1A1A', marginBottom: '1rem', marginLeft: '0.5rem' }}>
                  {stage.reality}
                </p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
                  {stage.bullets.map((bullet, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: '#717171', marginBottom: '0.25rem', listStyle: 'disc' }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '4rem 1.5rem', background: '#F7F6F4', borderTop: '1px solid #E5E4E0' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1rem', color: '#717171', marginBottom: '2rem' }}>
            The IPO Journey™ page breaks down every phase, dependency, and role. Your PACE Score shows where you stand today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/dashboard/ipo-journey"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: '#E8312A',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '1rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D12620')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
            >
              View Your IPO Journey
            </Link>
            <a
              href="mailto:ceo@theupcapital.com?subject=IPOReady%20Strategy%20Call"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: '#FFFFFF',
                color: '#E8312A',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '1rem',
                border: '2px solid #E8312A',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F9E4E1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              Book Strategy Call
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
