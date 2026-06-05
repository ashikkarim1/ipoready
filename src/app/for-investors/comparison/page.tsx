'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  CheckCircle2, X, Zap, Brain, BarChart3, Shield, Users, Clock,
  TrendingUp, Eye, AlertCircle, FileText, ArrowRight
} from 'lucide-react'

const COMPARISON = [
  {
    category: 'Deal Discovery',
    items: [
      {
        feature: 'Company Data Available',
        crunchbase: 'Generic startup data (99% won\'t IPO)',
        ipoready: '100% IPO-bound companies pre-verified for IPO readiness',
        iporeadyWins: true
      },
      {
        feature: 'Real-Time Alerts',
        crunchbase: 'Manual checking required',
        ipoready: '🔴 Critical alerts within 1 hour, auto-matched to YOUR criteria',
        iporeadyWins: true
      },
      {
        feature: 'Investment Scoring',
        crunchbase: 'Generic relevance scores',
        ipoready: 'AI scores every deal against YOUR specific fund thesis (custom)',
        iporeadyWins: true
      },
      {
        feature: 'Deal Recommendations',
        crunchbase: 'You search manually',
        ipoready: 'AI recommends deals you\'ll love (70%+ match rate)',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Due Diligence Automation',
    items: [
      {
        feature: 'Financial Analysis',
        crunchbase: 'Raw numbers only — you build models',
        ipoready: 'AI auto-analyzes unit economics, CAC/LTV, profitability trajectory, cash runway',
        iporeadyWins: true
      },
      {
        feature: 'Risk Assessment',
        crunchbase: 'No risk flagging',
        ipoready: 'AI identifies 50+ risk categories: customer concentration, churn velocity, team dependencies, regulatory red flags',
        iporeadyWins: true
      },
      {
        feature: 'Competitive Analysis',
        crunchbase: 'You find competitors manually',
        ipoready: 'AI maps entire competitive landscape: market share, pricing, product gaps, win/loss analysis',
        iporeadyWins: true
      },
      {
        feature: 'Market Analysis',
        crunchbase: 'No TAM/SAM data',
        ipoready: 'AI calculates TAM/SAM, market growth rate, beachhead strategy analysis',
        iporeadyWins: true
      },
      {
        feature: 'Customer Due Diligence',
        crunchbase: 'You call customers yourself',
        ipoready: 'AI contacts customers, analyzes satisfaction, identifies churn risks, sentiment analysis',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Investor Intelligence',
    items: [
      {
        feature: 'Founder Background',
        crunchbase: 'LinkedIn links only',
        ipoready: 'Deep founder intelligence: prior exits ($), track record, network quality, founder risk',
        iporeadyWins: true
      },
      {
        feature: 'Team Analysis',
        crunchbase: 'Org chart only',
        ipoready: 'AI assesses: hiring velocity, retention, key person risk, bench strength, execution capability',
        iporeadyWins: true
      },
      {
        feature: 'Benchmark Comparisons',
        crunchbase: 'Manual comparisons',
        ipoready: 'AI real-time benchmarks company vs 500+ IPO-peers: growth, margins, unit economics, PACE score',
        iporeadyWins: true
      },
      {
        feature: 'IPO Timeline Forecast',
        crunchbase: 'No forecast',
        ipoready: 'PACE™ AI predicts IPO date ±3 months with 92% accuracy',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Investment Workflow',
    items: [
      {
        feature: 'Deal Documentation',
        crunchbase: 'You build your own tracking',
        ipoready: 'AI generates investment memo, executive summary, red flags, investment thesis',
        iporeadyWins: true
      },
      {
        feature: 'Due Diligence Checklist',
        crunchbase: 'Manual checklist',
        ipoready: 'AI auto-completes 80% of checklist, flags remaining items',
        iporeadyWins: true
      },
      {
        feature: 'Follow-Up Management',
        crunchbase: 'You track in Salesforce',
        ipoready: 'AI manages follow-up cadence, reminds about milestones, flags when to re-engage',
        iporeadyWins: true
      },
      {
        feature: 'Founder Communication',
        crunchbase: 'Email/direct contact',
        ipoready: 'AI-assisted messaging, suggested talking points, context-aware follow-ups',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Portfolio Management',
    items: [
      {
        feature: 'Portfolio Monitoring',
        crunchbase: 'Manual tracking',
        ipoready: 'AI monitors all portfolio companies 24/7, alerts you to milestones, red flags, opportunities',
        iporeadyWins: true
      },
      {
        feature: 'Performance Analytics',
        crunchbase: 'Basic data',
        ipoready: 'AI generates IRR projections, exit probability, company health score, comparative performance',
        iporeadyWins: true
      },
      {
        feature: 'Investor Reporting',
        crunchbase: 'You write reports',
        ipoready: 'AI generates LP reports, performance dashboards, narrative summaries, market context',
        iporeadyWins: true
      },
      {
        feature: 'Deal Syndication',
        crunchbase: 'You find co-investors',
        ipoready: 'AI recommends ideal co-investors from your network for each deal',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Data Quality & Verification',
    items: [
      {
        feature: 'Data Verification',
        crunchbase: '60% accuracy (self-reported, outdated)',
        ipoready: '99% accuracy (AI-verified, continuously updated)',
        iporeadyWins: true
      },
      {
        feature: 'Compliance Verification',
        crunchbase: 'None',
        ipoready: 'AI verifies SOC 2, GDPR, CCPA, regulatory licenses, patent clearance',
        iporeadyWins: true
      },
      {
        feature: 'Update Frequency',
        crunchbase: 'Quarterly (stale)',
        ipoready: 'Real-time (metrics), weekly (IPO milestones), monthly (financials)',
        iporeadyWins: true
      },
      {
        feature: 'Data Source Transparency',
        crunchbase: 'Black box',
        ipoready: 'Every data point has source, confidence level, verification method',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Speed & Efficiency',
    items: [
      {
        feature: 'Time to Investment Decision',
        crunchbase: '16-20 weeks (traditional VC process)',
        ipoready: '4 weeks (AI handles 80% of diligence)',
        iporeadyWins: true
      },
      {
        feature: 'Due Diligence Hours Required',
        crunchbase: '80-120 hours per deal',
        ipoready: '10-15 hours per deal (strategy & validation only)',
        iporeadyWins: true
      },
      {
        feature: 'Deal Screening Speed',
        crunchbase: '2-3 deals/week screened manually',
        ipoready: 'AI screens 50+ deals/week, you review AI recommendations',
        iporeadyWins: true
      }
    ]
  },

  {
    category: 'Competitive Advantages',
    items: [
      {
        feature: 'Network Effects',
        crunchbase: 'Neutral (not investor-specific)',
        ipoready: 'Network = IPO-bound companies + institutional investors (both win)',
        iporeadyWins: true
      },
      {
        feature: 'IPO-Specific Data',
        crunchbase: 'Generic startup metrics',
        ipoready: '180+ IPO milestones, PACE™ score, regulatory readiness, underwriter info',
        iporeadyWins: true
      },
      {
        feature: 'First-Mover Deals',
        crunchbase: 'See deals with everyone else',
        ipoready: 'See deals 18-24 months before IPO (before other platforms)',
        iporeadyWins: true
      },
      {
        feature: 'Deal Flow Quality',
        crunchbase: '99% noise (generic startups)',
        ipoready: '100% signal (only IPO-bound companies)',
        iporeadyWins: true
      }
    ]
  }
]

export default function ComparisonPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Deal Discovery')

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      <Header />

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 py-16 md:py-24"
        style={{ background: '#1A1A1A', color: '#FFFFFF' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Why IPOReady Beats Crunchbase
            </h1>
            <p className="text-xl text-white/70 max-w-3xl">
              Crunchbase gives you data. IPOReady gives you an AI-powered operating system that automates 80% of your due diligence and gets you deals 18-24 months before other investors see them.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-lg" style={{ background: 'rgba(232, 49, 42, 0.1)', border: '1px solid rgba(232, 49, 42, 0.2)' }}>
              <p className="text-xs text-white/60 font-bold mb-2">TIME SAVED</p>
              <p className="text-3xl font-bold text-accent">80%</p>
              <p className="text-sm text-white/70 mt-2">Due diligence automated by AI</p>
            </div>
            <div className="p-6 rounded-lg" style={{ background: 'rgba(45, 122, 95, 0.1)', border: '1px solid rgba(45, 122, 95, 0.2)' }}>
              <p className="text-xs text-white/60 font-bold mb-2">SPEED GAIN</p>
              <p className="text-3xl font-bold text-success">5x</p>
              <p className="text-sm text-white/70 mt-2">Faster to investment decision</p>
            </div>
            <div className="p-6 rounded-lg" style={{ background: 'rgba(29, 78, 216, 0.1)', border: '1px solid rgba(29, 78, 216, 0.2)' }}>
              <p className="text-xs text-white/60 font-bold mb-2">EARLY LOOK</p>
              <p className="text-3xl font-bold text-info">18-24mo</p>
              <p className="text-sm text-white/70 mt-2">Before companies go public</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* COMPARISON TABLE */}
      <div className="px-6 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="space-y-6">
          {COMPARISON.map((category, idx) => {
            const isExpanded = expandedCategory === category.category

            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                {/* CATEGORY HEADER */}
                <motion.button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                  className="w-full"
                >
                  <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-accent/40 transition cursor-pointer card">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg md:text-xl text-nav text-left">{category.category}</h2>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-5 h-5 text-nav" style={{ transform: 'rotate(-90deg)' }} />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                {/* COMPARISON ITEMS */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={isExpanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-0"
                >
                  <div className="pt-4 space-y-4">
                    {category.items.map((item, itemIdx) => (
                      <motion.div
                        key={item.feature}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: itemIdx * 0.05 }}
                        className="card p-6 border-l-4"
                        style={{ borderLeftColor: item.iporeadyWins ? '#2D7A5F' : '#717171' }}
                      >
                        <h3 className="font-bold text-nav text-lg mb-4">{item.feature}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* CRUNCHBASE */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="label text-xs mb-1">Crunchbase</p>
                                <p className="text-nav">{item.crunchbase}</p>
                              </div>
                            </div>
                          </div>

                          {/* IPOREADY */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="label text-xs mb-1 text-success font-bold">IPOReady</p>
                                <p className="text-nav font-semibold">{item.ipoready}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* BOTTOM LINE */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 md:p-12 border-2 border-accent/40"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-nav text-lg mb-2">AI Does Your Work</h3>
              <p className="text-text-muted">AI automates financial analysis, risk assessment, competitive analysis, and due diligence. You focus on strategy.</p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-bold text-nav text-lg mb-2">Move 5x Faster</h3>
              <p className="text-text-muted">4 weeks to investment decision instead of 20. Other investors won't see these deals for 18-24 months.</p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-bold text-nav text-lg mb-2">100% Signal</h3>
              <p className="text-text-muted">Only IPO-bound companies pre-verified by IPOReady. No generic startups. Every company is institutional-grade.</p>
            </div>
          </div>

          <div className="p-6 rounded-lg" style={{ background: '#EAF5F0', borderLeft: '4px solid #2D7A5F' }}>
            <p className="text-nav font-bold mb-2">The Bottom Line</p>
            <p className="text-nav">Crunchbase is a database. IPOReady is an operating system. We don't just give you data—we analyze it for you, score it for your thesis, flag risks, and tell you exactly what to do next. You go from pitch to term sheet in 4 weeks instead of 20. That's 10x better.</p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:py-24" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Experience the Difference
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-white/70 mb-8"
          >
            Get institutional-grade deal flow. AI-powered due diligence. 5x faster investing.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 mx-auto"
            style={{ background: '#E8312A', color: '#FFFFFF' }}
            onClick={() => window.location.href = '/investor/signup'}
          >
            Join IPOReady
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-sm text-white/50 mt-6">Free for early investors. See deals other platforms won't see for years.</p>
        </div>
      </section>
    </div>
  )
}
