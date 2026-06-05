'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  ChevronDown, ChevronUp, CheckCircle2, Clock, DollarSign, AlertTriangle,
  TrendingUp, Users, BarChart3, Lightbulb, Rocket,
  Zap, BookOpen, MessageSquare, Award
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Testimonial {
  quote: string
  author: string
  title: string
  industry: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PITFALLS: Pitfall[] = [
  {
    id: 'financials',
    title: 'Financial Statement Issues',
    description: 'Restatements, revenue recognition problems, or audit findings',
    details: 'This is the #1 delay. Your auditors find gaps in your controls, revenue recognition is questioned, or you have to restate prior periods. Happens in ~40% of IPO candidates.',
    prevention: 'Start audit prep 6 months before your target filing. Get your auditors involved early, not at the last minute. They\'ll spot issues you didn\'t know existed.',
    impact: '4-8 week delay (can be longer if restatement needed)',
    severity: 'high'
  },
  {
    id: 'governance',
    title: 'Corporate Governance Gaps',
    description: 'Missing committees, weak independence, insufficient controls',
    details: 'Regulators want to see independent board committees, documented policies, and clear segregation of duties. Many private companies skip this — public markets won\'t.',
    prevention: 'Build governance early. Get your board audit committee in place 6+ months before filing. Document your policies and decision-making processes.',
    impact: '2-4 week delay',
    severity: 'medium'
  },
  {
    id: 'advisors',
    title: 'Advisor/Underwriter Mismatches',
    description: 'Wrong legal firm, bad underwriter fit, poor team chemistry',
    details: 'You pick a great law firm for M&A, but they\'ve never done public market work. Or your underwriter is wrong for your exchange. Or the team just doesn\'t gel.',
    prevention: 'Vet carefully. Talk to their other IPO clients. Do a test engagement before committing. Chemistry matters — you\'ll spend 18 months together.',
    impact: '2-3 month restart (sometimes longer)',
    severity: 'high'
  },
  {
    id: 'people',
    title: 'Executive Team Drama',
    description: 'Key departures, board conflicts, management misalignment',
    details: 'A founder leaves. The board fights about strategy. Your CFO and external auditor don\'t trust each other. These blow up IPO timelines.',
    prevention: 'Get alignment early. Have honest conversations about IPO benefits vs. risks. Make sure your executive team is committed, not just the CEO.',
    impact: '3-6 month delay (can kill the whole deal)',
    severity: 'high'
  },
  {
    id: 'market',
    title: 'Market Timing',
    description: 'Market downturn, sector falls out of favor, comparables underperform',
    details: 'Your tech IPO is ready. Then the market crashes. Or investors lose interest in your sector. Or similar companies you wanted to compare against bomb.',
    prevention: 'Build flexibility into your timeline. Aim for 18 months, not a specific date. Monitor market conditions quarterly, but don\'t panic at every dip.',
    impact: '6-12 month delay or restart',
    severity: 'high'
  },
  {
    id: 'docs',
    title: 'Documentation Chaos',
    description: 'Contracts scattered, incomplete agreements, undocumented transactions',
    details: 'Your material contracts are on three different drives. You don\'t have signed copies of everything. Related party deals weren\'t documented properly.',
    prevention: 'Create a central document registry 6+ months before filing. Audit all material contracts. Get everything signed, dated, and stored properly.',
    impact: '2-4 week delay',
    severity: 'medium'
  },
  {
    id: 'disclosure',
    title: 'Disclosure Issues',
    description: 'Regulators ask for clarity, missing risk factors, incomplete MD&A',
    details: 'Your prospectus draft goes to regulators. They come back with 50 comments. Your risk factors aren\'t clear enough. Your MD&A is incomplete.',
    prevention: 'Hire experienced disclosure counsel. Have them review drafts early and often. Anticipate regulator questions — they usually come up.',
    impact: '3-8 week delay',
    severity: 'medium'
  },
  {
    id: 'story',
    title: 'Investor Indifference',
    description: 'Weak growth story, market doesn\'t want your sector, story needs work',
    details: 'Your narrative doesn\'t resonate. Investors in your roadshow are polite but not interested. Or your market just isn\'t hot anymore.',
    prevention: 'Test your story early. Do investor conversations 9+ months before filing. Refine your narrative. Be honest about your market.',
    impact: '2-6 month roadshow, may reduce valuation',
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
      'You don\'t know what you don\'t know',
      'Board meetings become intensive',
      'The to-do list seems impossible'
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
      'Your team is learning what IPO really means',
      'You can see real progress',
      'The work is still hard, but it\'s not chaotic'
    ]
  },
  {
    phase: 'Months 9-12: "It\'s Actually Exciting"',
    duration: '4 months',
    feeling: 'Proud, motivated, seeing the finish line',
    reality: 'The hard part is behind you. Investor excitement is real.',
    bullets: [
      'You can see the finish line',
      'Investor meetings are genuinely energizing',
      'Your story is compelling and you own it',
      'Board meetings become less painful',
      'You\'re building something',
      'The finish line is real'
    ]
  },
  {
    phase: 'Post-IPO: "You Made It"',
    duration: 'Ongoing',
    feeling: 'Relief, pride, perspective, vindication',
    reality: 'You\'ll advise other founders. You\'ll be amazed you did it.',
    bullets: [
      'First day of trading is genuinely surreal',
      'Quarterly reporting becomes your new normal',
      'You\'ll get calls from founders asking for advice',
      'You realize how much you learned',
      'The hard part seems worth it now',
      'You\'re a public company. That\'s real.'
    ]
  }
]

const EXPECTATIONS_CHECKLIST = [
  'I understand this will take 12-18 months, minimum',
  'I\'ve budgeted $2-5M for the process',
  'I\'ve aligned my board on IPO benefits vs. risks',
  'I\'m ready to lose 6-12 months of my leadership time',
  'I understand quarterly reporting and compliance burden',
  'I know I\'ll be 15-30% more diluted',
  'I\'m excited, not just doing this because it "feels like next step"',
  'I\'ve stress-tested our business model and growth',
  'I know which exchange I want to list on',
  'I\'m committed to the long-term, not just IPO day'
]

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'I thought 6 months. It took 18. Budget accordingly.',
    author: 'David Chen',
    title: 'CEO, SaaS Company',
    industry: 'Software'
  },
  {
    quote: 'The governance work was annoying but made us a better company. Would do it again.',
    author: 'Sarah Johnson',
    title: 'Founder, Digital Health',
    industry: 'Healthcare'
  },
  {
    quote: 'Our auditors found issues we didn\'t know existed. Glad we found them before filing.',
    author: 'Michael Park',
    title: 'CFO, FinTech Startup',
    industry: 'Finance'
  },
  {
    quote: 'Best decision we ever made. Hardest 18 months of my life. Worth every second.',
    author: 'Rachel Martinez',
    title: 'CEO, AI/ML Company',
    industry: 'Technology'
  }
]

// ─── Component ─────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-white">
      <Header />

      {/* ─── Section 1: Hero ─────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-white via-white to-blue-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Welcome to the IPO Journey</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to Your IPO Journey
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              You're about to do something 99% of companies never do. Here's what to expect — honest, encouraging, and real.
            </p>

            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              This page will set proper expectations, show you what other founders have navigated, and answer the question: "What am I actually getting into?"
            </p>

            <div className="pt-4">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">No sugarcoating. No false promises. Just reality.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 2: Fundamentals ─────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                What This Process Actually Is
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="p-8 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      It's a Transformation, Not Just Paperwork
                    </h3>
                    <p className="text-gray-700 mb-3">
                      You'll be forced to professionalize everything: governance, controls, transparency, board dynamics, compliance. Your company will operate at a fundamentally higher level.
                    </p>
                    <p className="text-gray-600 italic">
                      "Your company will be better after this, even if you don't go public."
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
                className="p-8 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      It Takes 12-18 Months, Minimum
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Not 6 months. Not 9 months. Realistically 12-18 months of intensive work. Some take 24 months. Plan accordingly.
                    </p>
                    <p className="text-gray-600 italic">
                      "This is a marathon. Budget your leadership time like it is."
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
                className="p-8 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      It Costs $2-5M (Direct + Indirect)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Legal, audit, advisory, underwriting fees. Plus opportunity cost of your leadership team not running the business. You'll spend more than you think.
                    </p>
                    <p className="text-gray-600 italic">
                      "Budget conservatively. Add 20% for contingencies."
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
                className="p-8 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      You'll Own 15-30% Less
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Underwriting spread, new share issuance, expanded employee option pool. You'll be a smaller percentage, but it's a much bigger pie.
                    </p>
                    <p className="text-gray-600 italic">
                      "100% of a small pie or 70% of a huge pie. The math usually wins."
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 3: Common Pitfalls ──────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Common Delays & Pitfalls
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The 8 things that most often derail IPO timelines. Click to expand and learn how to avoid them.
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
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <button
                    onClick={() => togglePitfall(pitfall.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        pitfall.severity === 'high'
                          ? 'bg-red-50'
                          : pitfall.severity === 'medium'
                          ? 'bg-amber-50'
                          : 'bg-yellow-50'
                      }`}>
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            pitfall.severity === 'high'
                              ? 'text-red-600'
                              : pitfall.severity === 'medium'
                              ? 'text-amber-600'
                              : 'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {pitfall.title}
                        </h3>
                        <p className="text-gray-600">
                          {pitfall.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedPitfall === pitfall.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedPitfall === pitfall.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 bg-gray-50 p-6 space-y-4"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">What Actually Happens</h4>
                          <p className="text-gray-700">{pitfall.details}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">How to Prevent It</h4>
                          <p className="text-gray-700">{pitfall.prevention}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Impact If It Happens</h4>
                          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-200">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {pitfall.impact}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 4: Timeline Progression ──────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                How It Actually Improves
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                What to expect at each phase of your journey. The hard part isn't constant.
              </p>
            </div>

            <div className="space-y-6">
              {TIMELINE_STAGES.map((stage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="border-l-4 border-gray-300 pl-8 pb-8">
                    {index === TIMELINE_STAGES.length - 1 && (
                      <div className="absolute -left-[13px] -top-3 w-6 h-6 rounded-full bg-green-600 border-4 border-white" />
                    )}
                    {index < TIMELINE_STAGES.length - 1 && (
                      <div className="absolute -left-[13px] -top-3 w-6 h-6 rounded-full bg-blue-600 border-4 border-white" />
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {stage.phase}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {stage.duration}
                          </span>
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Feeling
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stage.feeling}
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Reality Check
                          </p>
                          <p className="text-lg font-semibold text-blue-900">
                            {stage.reality}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">What's Happening:</p>
                        <ul className="space-y-2">
                          {stage.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                              <span className="text-gray-700">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 5: Founder Testimonials ─────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Real Talk: Founder Stories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Honest perspectives from founders who've been exactly where you are.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Award key={i} className="w-4 h-4 text-amber-500" />
                    ))}
                  </div>

                  <blockquote className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.title}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                      <span className="text-xs font-medium text-blue-900">
                        {testimonial.industry}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 6: How to Use IPOReady ──────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                How to Use IPOReady
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A practical guide to getting the most out of this platform on your journey.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  num: '1',
                  title: 'Start with IPO Journey™',
                  description: 'Click the "IPO Journey™" in your dashboard to see the full timeline and phases.',
                  detail: 'This is your north star. Bookmark it. You\'ll reference it constantly as you progress through each phase.',
                  icon: Rocket
                },
                {
                  num: '2',
                  title: 'Know Your Current Phase',
                  description: 'The dashboard shows what phase you\'re in and what deliverables are due.',
                  detail: 'Expand each phase to see dependencies, deliverables, and who should be involved. Check items off as you complete them.',
                  icon: BarChart3
                },
                {
                  num: '3',
                  title: 'Learn More on Any Topic',
                  description: 'Hover over phases or deliverables and click "Learn More" for detailed guidance.',
                  detail: 'You\'ll get templates, best practices, common mistakes, and links to regulatory resources (EDGAR, SEDAR 2, exchange rules, etc.)',
                  icon: BookOpen
                },
                {
                  num: '4',
                  title: 'Track Your Progress',
                  description: 'The dashboard shows your overall % complete and current position on the timeline.',
                  detail: 'Progress isn\'t linear — you might cycle back on some items. That\'s normal. The visual timeline keeps you oriented.',
                  icon: TrendingUp
                },
                {
                  num: '5',
                  title: 'Get Expert Help',
                  description: 'Connect with vetted advisors, IPOReady coaches, and peer founders.',
                  detail: 'Our network of 100+ IPO-credentialed professionals is ready to help. Book consultations, ask questions, or get peer advice in the community forum.',
                  icon: Users
                }
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-6 pb-8 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-600">
                        <span className="text-lg font-bold text-blue-600">{item.num}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-700 mb-3">
                        {item.description}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 7: Expectations Checklist ───────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Expectations Checklist
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Before you proceed, make sure you're really ready. Check these off honestly.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-4">
              {EXPECTATIONS_CHECKLIST.map((item, index) => (
                <motion.label
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.has(index)}
                    onChange={() => toggleCheckbox(index)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-0 focus:border-blue-600 cursor-pointer flex-shrink-0 mt-0.5"
                  />
                  <span className={`text-base font-medium transition-colors ${
                    checkedItems.has(index)
                      ? 'text-gray-500 line-through'
                      : 'text-gray-900 group-hover:text-blue-600'
                  }`}>
                    {item}
                  </span>
                </motion.label>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700">
                    Checked {checkedItems.size} of {EXPECTATIONS_CHECKLIST.length}
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(checkedItems.size / EXPECTATIONS_CHECKLIST.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    />
                  </div>
                </div>
                {checkedItems.size === EXPECTATIONS_CHECKLIST.length && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-700 text-sm font-medium mt-3"
                  >
                    ✓ You're ready. Let's do this.
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 8: Final CTA ────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-700 border-b border-blue-800">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Still Want to Do This?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Then you're in the right place. IPOReady was built by founders and operators who've been exactly where you are. We've mapped every phase, identified every pitfall, and created tools for everything.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Start Your IPO Journey™
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors border border-blue-400"
              >
                <MessageSquare className="w-5 h-5" />
                Book a Strategy Call
              </motion.a>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <p className="text-sm text-blue-100 uppercase font-semibold tracking-wide">
                  180+ Milestones
                </p>
                <p className="text-lg font-bold text-white">
                  Pre-built roadmap
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-blue-100 uppercase font-semibold tracking-wide">
                  100+ Advisors
                </p>
                <p className="text-lg font-bold text-white">
                  Expert network
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-blue-100 uppercase font-semibold tracking-wide">
                  7 Exchanges
                </p>
                <p className="text-lg font-bold text-white">
                  Full coverage
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer Spacing ──────────────────────────────────────────────────── */}
      <div className="h-16" />
    </div>
  )
}
