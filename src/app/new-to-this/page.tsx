'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
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
    <AppShell>
      <div style={{ background: 'var(--color-bg-primary)' }}>
        {/* Hero Section */}
        <section className="border-b" style={{ borderColor: 'var(--color-border)', padding: '3rem 1.5rem lg:3rem' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-error-soft)', border: '1px solid rgba(232, 49, 42, 0.2)' }}>
                <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span className="label-sm" style={{ color: 'var(--color-accent)' }}>Welcome to Reality</span>
              </div>

              <h1 className="h2" style={{ color: 'var(--color-text-primary)' }}>
                Welcome to Your IPO Journey
              </h1>

              <p className="body max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                You're about to do something 99% of companies never do. Here's what to expect — honest, encouraging, and real.
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                  <span className="label font-semibold" style={{ color: 'var(--color-text-primary)' }}>No sugarcoating. No false promises. Just reality.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Fundamentals Section */}
        <section className="border-b" style={{ borderColor: 'var(--color-border)', padding: '3rem 1.5rem lg:3rem', background: 'white' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="h2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
                What This Process Actually Is
              </h2>
              <p className="body max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                Four fundamental truths that will shape your next 18 months.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1: Transformation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: 'var(--color-error-soft)' }}>
                    <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      It's a Transformation
                    </h3>
                    <p className="body" style={{ color: 'var(--color-text-secondary)' }}>
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
                className="card p-6"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: 'var(--color-warning-soft)' }}>
                    <Clock className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      It Takes 12-18 Months
                    </h3>
                    <p className="body" style={{ color: 'var(--color-text-secondary)' }}>
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
                className="card p-6"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: 'var(--color-info-soft)' }}>
                    <DollarSign className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      It Costs $500K-2M
                    </h3>
                    <p className="body" style={{ color: 'var(--color-text-secondary)' }}>
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
                className="card p-6"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: 'var(--color-success-soft)' }}>
                    <Award className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      You'll Own 15-30% Less
                    </h3>
                    <p className="body" style={{ color: 'var(--color-text-secondary)' }}>
                      Underwriting, new shares, expanded options. You'll be a smaller percentage, but it's a much bigger pie.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Common Pitfalls Section */}
        <section className="border-b" style={{ borderColor: 'var(--color-border)', padding: '3rem 1.5rem lg:3rem' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="h2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
                8 Common Pitfalls (and How to Avoid Them)
              </h2>
              <p className="body max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
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
                    className="w-full card p-5 text-left hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="h4 m-0" style={{ color: 'var(--color-text-primary)' }}>
                            {pitfall.title}
                          </h3>
                          <span
                            className="label-xs px-2 py-1 rounded"
                            style={{
                              background: pitfall.severity === 'high' ? 'var(--color-error-soft)' : pitfall.severity === 'medium' ? 'var(--color-warning-soft)' : 'var(--color-success-soft)',
                              color: pitfall.severity === 'high' ? 'var(--color-error)' : pitfall.severity === 'medium' ? 'var(--color-warning)' : 'var(--color-success)',
                            }}
                          >
                            {pitfall.severity}
                          </span>
                        </div>
                        <p className="body-sm m-0" style={{ color: 'var(--color-text-secondary)' }}>
                          {pitfall.description}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {expandedPitfall === pitfall.id ? (
                          <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                        ) : (
                          <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
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
                          borderLeft: '3px solid var(--color-accent)',
                          paddingLeft: '1.5rem',
                          marginTop: '-1px',
                          paddingTop: '1.5rem',
                          paddingBottom: '1.5rem',
                          background: 'var(--color-surface-light)',
                          borderRadius: '0 0 0.5rem 0.5rem'
                        }}
                      >
                        <div className="space-y-4">
                          <div>
                            <p className="body-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                              What this looks like:
                            </p>
                            <p className="body-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {pitfall.details}
                            </p>
                          </div>
                          <div>
                            <p className="body-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                              How to prevent it:
                            </p>
                            <p className="body-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {pitfall.prevention}
                            </p>
                          </div>
                          <div>
                            <p className="body-sm font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                              Typical delay:
                            </p>
                            <p className="body-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
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
        <section className="border-b" style={{ borderColor: 'var(--color-border)', padding: '3rem 1.5rem lg:3rem', background: 'white' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="h2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
                How It Feels Over Time
              </h2>
              <p className="body max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
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
                  className="relative p-5 rounded-lg border"
                  style={{
                    background: 'var(--color-surface-light)',
                    borderColor: 'var(--color-border)',
                    borderLeftWidth: '3px',
                    borderLeftColor: 'var(--color-accent)'
                  }}
                >
                  <h3 className="h4 mb-2 ml-1" style={{ color: 'var(--color-text-primary)' }}>
                    {stage.phase}
                  </h3>
                  <p className="body-sm mb-2 ml-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="font-semibold">Feeling:</span> {stage.feeling}
                  </p>
                  <p className="body-sm mb-3 ml-1" style={{ color: 'var(--color-text-primary)' }}>
                    {stage.reality}
                  </p>
                  <ul className="ml-6 space-y-1">
                    {stage.bullets.map((bullet, i) => (
                      <li key={i} className="body-sm list-disc" style={{ color: 'var(--color-text-secondary)' }}>
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
        <section className="border-t" style={{ borderColor: 'var(--color-border)', padding: '3rem 1.5rem lg:3rem', background: 'var(--color-bg-primary)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="h2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Ready to Get Started?
            </h2>
            <p className="body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              The IPO Journey™ page breaks down every phase, dependency, and role. Your PACE Score shows where you stand today.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/dashboard/ipo-journey"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold label transition-colors"
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-deep)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
              >
                View Your IPO Journey
              </Link>
              <a
                href="mailto:ceo@theupcapital.com?subject=IPOReady%20Strategy%20Call"
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold label transition-colors border-2"
                style={{
                  background: 'white',
                  color: 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-error-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                Book Strategy Call
              </a>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
