'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import {
  TrendingUp, Users, DollarSign, Zap, BarChart3, Target, AlertCircle, CheckCircle2, Trophy,
  ArrowUp, ArrowDown, Gauge, Lightbulb, Award, Lock, Flag
} from 'lucide-react'

interface CompanyProfile {
  name: string
  valuation: number
  revenue: number
  employees: number
  countries: number
  sector: string
  growth_rate: number
  net_retention: number
  profitability: 'profitable' | 'breakeven' | 'unprofitable'
  market_position: 'leader' | 'strong_challenger' | 'emerging'
  analyst_prerequisites_met: number
}

const MOCK_COMPANY: CompanyProfile = {
  name: 'YourCompany Inc.',
  valuation: 2.5,
  revenue: 0.35,
  employees: 450,
  countries: 8,
  sector: 'Cloud Infrastructure',
  growth_rate: 42,
  net_retention: 135,
  profitability: 'unprofitable',
  market_position: 'emerging',
  analyst_prerequisites_met: 7
}

export default function CoveragePredictorPage() {
  const company = MOCK_COMPANY

  // Sophisticated coverage prediction algorithm
  const prediction = useMemo(() => {
    const factors = []

    // Factor 1: Market Cap (25% weight) - Most critical
    const valScore = Math.min(10, (company.valuation / 5) * 10)
    factors.push({
      name: 'Market Capitalization',
      value: `$${company.valuation}B`,
      score: valScore,
      weight: 0.25,
      status: 'critical',
      benchmark: '$2B+',
      why: 'Analysts cover large companies with institutional demand'
    })

    // Factor 2: Revenue Scale (20% weight) - Critical
    const revScore = Math.min(10, (company.revenue / 1) * 10)
    factors.push({
      name: 'Revenue Scale',
      value: `$${(company.revenue * 1000).toFixed(0)}M ARR`,
      score: revScore,
      weight: 0.20,
      status: 'critical',
      benchmark: '$200M+',
      why: 'Most analysts require $100M+ ARR minimum'
    })

    // Factor 3: Growth Rate (20% weight)
    const growthScore = Math.min(10, (company.growth_rate / 40) * 10)
    factors.push({
      name: 'Growth Rate',
      value: `${company.growth_rate}% YoY`,
      score: growthScore,
      weight: 0.20,
      status: 'critical',
      benchmark: '30%+',
      why: 'Growth companies attract analyst interest'
    })

    // Factor 4: Net Retention (15% weight)
    const nrrScore = Math.min(10, (company.net_retention / 130) * 10)
    factors.push({
      name: 'Net Revenue Retention',
      value: `${company.net_retention}%`,
      score: nrrScore,
      weight: 0.15,
      status: 'important',
      benchmark: '120%+',
      why: 'Shows expansion potential and customer stickiness'
    })

    // Factor 5: Market Position (10% weight)
    const positionScores = { leader: 10, strong_challenger: 7, emerging: 4 }
    factors.push({
      name: 'Market Position',
      value: company.market_position.replace('_', ' '),
      score: positionScores[company.market_position],
      weight: 0.10,
      status: 'important',
      benchmark: 'Leader',
      why: 'Market leaders get disproportionate analyst coverage'
    })

    // Factor 6: Profitability (10% weight)
    const profitScores = { profitable: 10, breakeven: 6, unprofitable: 3 }
    factors.push({
      name: 'Profitability Status',
      value: company.profitability.replace('_', ' '),
      score: profitScores[company.profitability],
      weight: 0.10,
      status: 'nice-to-have',
      benchmark: 'Profitable',
      why: 'Path to profitability affects long-term coverage'
    })

    const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0)
    const roundedScore = Math.round(totalScore * 10) / 10

    return {
      score: roundedScore,
      factors,
      likelihood: roundedScore >= 7.5 ? 'High' : roundedScore >= 5.5 ? 'Moderate' : 'Low',
      likely_analysts: Math.round((roundedScore / 10) * 25),
      timeToFirstCoverage: roundedScore >= 7.5 ? '2-4 weeks post-IPO' : roundedScore >= 5.5 ? '4-8 weeks post-IPO' : '8-16 weeks post-IPO',
      confidence: Math.round(95 - (Math.abs(5 - roundedScore) * 5))
    }
  }, [company])

  const scoreColor = prediction.score >= 7.5 ? '#2D7A5F' : prediction.score >= 5.5 ? '#B45309' : '#E8312A'
  const scoreBg = prediction.score >= 7.5 ? '#EBF9F4' : prediction.score >= 5.5 ? '#FEF3E1' : '#F9E4E1'

  // Actionable recommendations
  const recommendations = useMemo(() => {
    const recs = []

    for (const factor of prediction.factors) {
      if (factor.score < 6 && (factor.status === 'critical' || factor.status === 'important')) {
        if (factor.name === 'Market Capitalization') {
          recs.push({
            priority: 'CRITICAL',
            title: 'Increase Market Valuation to $2B+',
            description: 'Analyst coverage is concentrated in $2B+ companies. Underwriters will likely price conservatively.',
            action: 'Work with underwriters to position for $2B+ valuation through expanding TAM narrative',
            impact: 'Each $1B increase = +2 likely analysts'
          })
        }
        if (factor.name === 'Revenue Scale') {
          recs.push({
            priority: 'CRITICAL',
            title: 'Scale Revenue to $200M+ ARR',
            description: 'Most institutional analysts have $100M+ ARR minimums. At $350M, you\'re close but need margin of safety.',
            action: 'Accelerate enterprise sales and land-and-expand motions; build 2-quarter buffer above analyst minimums',
            impact: 'Reach $200M ARR = potential for 15-20 analysts'
          })
        }
        if (factor.name === 'Growth Rate') {
          recs.push({
            priority: 'CRITICAL',
            title: 'Maintain 30%+ Growth Post-IPO',
            description: 'At 42% growth, you\'re in excellent position. Any deceleration below 30% will reduce coverage.',
            action: 'Build 3-year growth roadmap showing path to 35%+ growth; identify expansion markets and upsell drivers',
            impact: 'Decelerate to <25% = lose 5-8 analysts; maintain >30% = gain 3-5 analysts'
          })
        }
        if (factor.name === 'Net Revenue Retention') {
          recs.push({
            priority: 'HIGH',
            title: 'Push NRR to 140%+',
            description: 'At 135%, you\'re nearly at best-in-class. Analysts love sticky, expanding customer bases.',
            action: 'Focus product roadmap on upsell and cross-sell; improve customer success team; track by cohort',
            impact: 'NRR 140%+ vs 135% = +2 likely analysts'
          })
        }
        if (factor.name === 'Market Position') {
          recs.push({
            priority: 'HIGH',
            title: 'Establish Clear Market Leadership Position',
            description: 'As "emerging", you\'re fighting for attention. Need to own a specific narrative.',
            action: 'Define your #1 market position (e.g., "leading cloud infrastructure for AI"); build analyst talking points',
            impact: 'Emerging → Strong Challenger = +3 analysts; → Leader = +8 analysts'
          })
        }
      }
    }

    if (recs.length === 0) {
      recs.push({
        priority: 'MAINTAIN',
        title: 'Continue Strong Execution',
        description: 'Your fundamentals support strong coverage. Focus on consistent delivery and clear market messaging.',
        action: 'Execute quarterly guidance flawlessly; maintain 30%+ growth; build relationships with analysts early',
        impact: 'Expected 15-20 analyst coverage post-IPO'
      })
    }

    return recs
  }, [prediction])

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
        {/* Header */}
        <section style={{ padding: '1.5rem', background: '#F7F6F4' }}>
          <div className="max-w-6xl mx-auto">
            <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Coverage Predictor™</h1>
            <p className="text-text-muted text-sm">AI-powered prediction of post-IPO analyst coverage based on your company fundamentals, market position, and financial metrics.</p>
          </div>
        </section>

        {/* Coverage Score Card */}
        <section style={{ borderBottom: '1px solid #E5E4E0', padding: '1.5rem', background: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                padding: '1rem',
                background: scoreBg,
                border: `2px solid ${scoreColor}`,
                borderRadius: '0.75rem',
                maxWidth: '300px'
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 700, margin: 0, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Coverage Likelihood
              </p>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: scoreColor, margin: 0, marginBottom: '0.5rem' }}>
                {prediction.score}/10
              </p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: scoreColor, margin: 0, marginBottom: '1rem' }}>
                {prediction.likelihood}
              </p>
              <div style={{ borderTop: `1px solid ${scoreColor}30`, paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#717171', margin: 0, marginBottom: '0.25rem' }}>
                  <strong>{prediction.likely_analysts}</strong> analysts likely
                </p>
                <p style={{ fontSize: '0.75rem', color: '#717171', margin: 0 }}>
                  {prediction.timeToFirstCoverage}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Coverage Factors */}
        <section style={{ borderBottom: '1px solid #E5E4E0', padding: '1.5rem 1.5rem', background: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '2rem' }}>
              Coverage Factors
            </h2>

            <div className="space-y-4">
              {prediction.factors.map((factor, idx) => {
                const factorColor = factor.score >= 7 ? '#2D7A5F' : factor.score >= 5 ? '#B45309' : '#E8312A'
                const factorBg = factor.score >= 7 ? '#EBF9F4' : factor.score >= 5 ? '#FEF3E1' : '#F9E4E1'
                const Icon = factor.score >= 7 ? CheckCircle2 : factor.score >= 5 ? AlertCircle : AlertCircle

                return (
                  <motion.div
                    key={factor.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      padding: '1.5rem',
                      background: factorBg,
                      border: `1px solid ${factorColor}30`,
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem'
                    }}
                  >
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6" style={{ color: factorColor }} />
                    </div>

                    <div className="flex-1">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                          {factor.name}
                        </h3>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: factorColor, background: factorBg, padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }}>
                          {factor.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: '0.25rem 0', fontWeight: 600 }}>
                        Current: <strong>{factor.value}</strong> | Benchmark: {factor.benchmark}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: '0.5rem 0 0 0' }}>
                        {factor.why}
                      </p>

                      {/* Factor score bar */}
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: '8px', background: '#E5E4E0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${(factor.score / 10) * 100}%`,
                              height: '100%',
                              background: factorColor,
                              transition: 'width 0.6s ease'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: factorColor, minWidth: '30px', textAlign: 'right' }}>
                          {factor.score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#717171', fontWeight: 600 }}>
                      {(factor.weight * 100).toFixed(0)}%<br />weight
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Analyst Coverage Strategy */}
        <section style={{ padding: '1.5rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="serif text-2xl sm:text-3xl text-nav mb-4">Analyst Coverage Strategy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Who to Target */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  padding: '1.5rem',
                  background: '#F7F6F4',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E4E0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Users className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                  <h3 className="font-bold text-nav" style={{ fontSize: '1rem', margin: 0 }}>Who to Target</h3>
                </div>

                <div className="space-y-3">
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #E5E4E0' }}>
                    <p className="font-semibold text-nav text-sm mb-1">By Market Cap Range</p>
                    <ul className="text-sm text-text-muted space-y-1" style={{ marginLeft: '1rem' }}>
                      <li>• <strong>$500M-$2B:</strong> Regional/emerging specialists, sell-side boutiques, sector focuses</li>
                      <li>• <strong>$2B-$10B:</strong> Tier-2 investment banks, coverage clusters (3-8 analysts)</li>
                      <li>• <strong>$10B+:</strong> Tier-1 banks (Goldman, Morgan Stanley), industry groups (10+ analysts)</li>
                    </ul>
                  </div>

                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #E5E4E0' }}>
                    <p className="font-semibold text-nav text-sm mb-1">Priority Targets</p>
                    <ul className="text-sm text-text-muted space-y-1" style={{ marginLeft: '1rem' }}>
                      <li>✓ Your IPO underwriters' research teams (built-in relationships)</li>
                      <li>✓ Sector specialists covering 3-5 closest competitors</li>
                      <li>✓ Banks with #1 or #2 market share in your sector</li>
                      <li>✓ Banks covering your target geographic markets (if international)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-nav text-sm mb-1">Realistic Coverage Timeline</p>
                    <p className="text-sm text-text-muted">Day 1 (IPO): 2-3 day 1 initiations (underwriters). Week 2-4: 5-8 additional initiations. Month 2-3: Laggards and regional analysts. <strong>Total: 12-20 analyst coverage expected for your profile.</strong></p>
                  </div>
                </div>
              </motion.div>

              {/* How to Sell the Story */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  padding: '1.5rem',
                  background: '#F7F6F4',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E4E0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Lightbulb className="w-5 h-5" style={{ color: '#E8312A' }} />
                  <h3 className="font-bold text-nav" style={{ fontSize: '1rem', margin: 0 }}>How to Sell Your Story</h3>
                </div>

                <div className="space-y-3">
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #E5E4E0' }}>
                    <p className="font-semibold text-nav text-sm mb-1">Narrative Pillars (Pick 3 Max)</p>
                    <ul className="text-sm text-text-muted space-y-1" style={{ marginLeft: '1rem' }}>
                      <li>🎯 TAM Expansion: "$100B TAM, growing 25% annually"</li>
                      <li>🎯 Market Share Gain: "Gaining share from legacy players"</li>
                      <li>🎯 Product Innovation: "AI-first platform gaining 40% growth"</li>
                      <li>🎯 Unit Economics: "NDR 135%, CAC payback 18 months"</li>
                      <li>🎯 Geographic/Vertical Expansion: "Entering 3 new verticals"</li>
                    </ul>
                  </div>

                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #E5E4E0' }}>
                    <p className="font-semibold text-nav text-sm mb-1">Analyst Engagement Plan</p>
                    <ul className="text-sm text-text-muted space-y-1" style={{ marginLeft: '1rem' }}>
                      <li>• Week -2: Analyst education calls (IR team + product lead)</li>
                      <li>• Day -1: Pre-IPO roadshow (focus on top 10 analyst targets)</li>
                      <li>• Day 1: IPO day initiate calls with underwriters' analysts</li>
                      <li>• Week 1-2: Proactive outreach to tier-2 analysts</li>
                      <li>• Ongoing: Monthly earnings calls, quarterly guidance updates</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-nav text-sm mb-1">Key Messaging Framework</p>
                    <p className="text-sm text-text-muted"><strong>Opening:</strong> "We're the [#1 / only / fastest-growing] in [TAM]. We capture [growth driver] before [risk/competitor]."</p>
                    <p className="text-sm text-text-muted" style={{ marginTop: '0.5rem' }}><strong>Defense:</strong> Have counter-narratives ready for: valuation concerns, growth deceleration, profitability path, competitive threats.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Critical KPIs for Coverage */}
        <section style={{ padding: '1.5rem 1.5rem', background: '#F7F6F4', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="serif text-2xl sm:text-3xl text-nav mb-4">Critical KPIs Analysts Track</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  metric: 'ARR & ARR Growth',
                  target: '$350M+ | 30%+ YoY growth',
                  why: 'Revenue scale and growth trajectory determine TAM addressability',
                  flag: 'If ARR growth drops below 20%, expect 3-5 analyst downgrades'
                },
                {
                  metric: 'Net Revenue Retention (NRR)',
                  target: '130%+ for best-in-class',
                  why: 'Shows customer expansion and sticky product - key for long-term value',
                  flag: 'NRR decline signals product/market-fit concerns; major derating risk'
                },
                {
                  metric: 'Customer Concentration',
                  target: 'Top 10 customers <20% of ARR',
                  why: 'Indicates diversified customer base and lower revenue risk',
                  flag: 'Top customer >30% = analyst concern, lower valuation multiple'
                },
                {
                  metric: 'Rule of 40 (Growth + Margin)',
                  target: '40+ (30% growth + 10%+ margin)',
                  why: 'Industry shorthand for balancing growth vs. profitability',
                  flag: 'Rule of 40 <30 signals unsustainable business model'
                },
                {
                  metric: 'Gross Margin & Trend',
                  target: '70%+ for SaaS | Improving by 200bps annually',
                  why: 'Gross margin drives LTV, unit economics, and scalability',
                  flag: 'Declining gross margin = analyst red flag for pricing power'
                },
                {
                  metric: 'CAC Payback Period',
                  target: '<18 months (ideal: 12 months)',
                  why: 'Shows efficiency of sales/marketing spend and cash generation',
                  flag: 'CAC payback >24 months = growth-at-all-costs concern'
                },
                {
                  metric: 'Operating Margin Path',
                  target: 'Path to 20%+ EBITDA margin within 3 years',
                  why: 'Analysts need to see profitability roadmap, not distant promise',
                  flag: 'No credible margin expansion plan = lower valuation'
                },
                {
                  metric: 'Cash Burn & Runway',
                  target: '12+ months of cash runway (at worst)',
                  why: 'Eliminates secondary offering risk and shows financial discipline',
                  flag: '<6 months runway = analyst concern about dilution'
                },
                {
                  metric: 'Market Share Trends',
                  target: 'Gaining 200-300 bps annually in addressable market',
                  why: 'Shows competitive strength and long runway for growth',
                  flag: 'Flat/declining share in growing TAM = analyst downgrade trigger'
                }
              ].map((kpi, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: '1.25rem',
                    background: '#FFFFFF',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E4E0'
                  }}
                >
                  <p className="font-semibold text-nav text-sm mb-1">{kpi.metric}</p>
                  <p className="text-xs text-text-muted mb-2"><strong>Target:</strong> {kpi.target}</p>
                  <p className="text-xs text-text-muted mb-2">{kpi.why}</p>
                  <p className="text-xs" style={{ color: '#E8312A', fontWeight: 600 }}>⚠️ {kpi.flag}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Items to Win Coverage */}
        <section style={{ padding: '1.5rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="serif text-2xl sm:text-3xl text-nav mb-4">Action Items to Win Coverage</h2>

            <div className="space-y-4">
              {[
                {
                  phase: 'Pre-IPO (90 days before)',
                  items: [
                    'Align on 3-5 analyst narrative pillars with underwriters',
                    'Identify top 15-20 analyst targets + their key questions',
                    'Build analyst presentation deck (separate from investor deck)',
                    'Conduct 2-3 mock analyst questions with CFO/CEO',
                    'Create one-pager: 5-year growth thesis + competitive positioning'
                  ]
                },
                {
                  phase: 'IPO Week',
                  items: [
                    'CEO/CFO does analyst education calls (20-30 min each) with lead underwriters',
                    'Prepare detailed guidance + long-term commentary for analyst calls',
                    'Have IR lead schedule day-1 media calls + analyst briefings',
                    'Live monitor analyst intiations + be ready to respond to questions',
                    'Prep defensive talking points on valuation/growth concerns'
                  ]
                },
                {
                  phase: 'First 90 Days Post-IPO',
                  items: [
                    'Monthly analyst calls with tier-2/regional banks (reach out proactively)',
                    'Provide detailed quarterly metrics + quarterly guidance (beat expectations)',
                    'Build analyst advisory council (3-5 key analysts for input)',
                    'Host investor day with 50+ institutions (invite key analysts)',
                    'Track every analyst question + create FAQ database for IR'
                  ]
                },
                {
                  phase: 'Ongoing (Quarterly)',
                  items: [
                    'Beat/meet guidance by 200+ bps consistently',
                    'Maintain monthly earnings call quality (clear growth narrative)',
                    'Provide real-time updates on KPIs analysts care about',
                    'Host quarterly analyst round-tables on trends/roadmap',
                    'Monitor analyst sentiment + track rating changes + price targets'
                  ]
                }
              ].map((phase_item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: '1.5rem',
                    background: '#F7F6F4',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E4E0'
                  }}
                >
                  <h3 className="font-bold text-nav mb-3" style={{ fontSize: '1rem' }}>{phase_item.phase}</h3>
                  <ul className="space-y-2">
                    {phase_item.items.map((item, i) => (
                      <li key={i} className="text-sm text-text-muted flex gap-2">
                        <span style={{ color: '#2D7A5F', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section style={{ padding: '1.5rem 1.5rem', background: '#F7F6F4' }}>
          <div className="max-w-6xl mx-auto">
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '2rem' }}>
              Actionable Recommendations
            </h2>

            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: '1.5rem',
                    background: '#FFFFFF',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.5rem',
                    borderLeft: `4px solid ${rec.priority === 'CRITICAL' ? '#E8312A' : rec.priority === 'HIGH' ? '#B45309' : '#2D7A5F'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ marginTop: '0.25rem' }}>
                      {rec.priority === 'CRITICAL' && <Flag className="w-5 h-5" style={{ color: '#E8312A' }} />}
                      {rec.priority === 'HIGH' && <AlertCircle className="w-5 h-5" style={{ color: '#B45309' }} />}
                      {rec.priority === 'MAINTAIN' && <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />}
                    </div>
                    <div className="flex-1">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                          {rec.title}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            background: rec.priority === 'CRITICAL' ? '#FEE2E2' : rec.priority === 'HIGH' ? '#FEF3E1' : '#EBF9F4',
                            color: rec.priority === 'CRITICAL' ? '#DC2626' : rec.priority === 'HIGH' ? '#B45309' : '#2D7A5F'
                          }}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: '0.5rem 0' }}>
                        {rec.description}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#1A1A1A', margin: '0.75rem 0 0 0', fontWeight: 600 }}>
                        ✓ Action: {rec.action}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#B45309', margin: '0.5rem 0 0 0', fontWeight: 600 }}>
                        💡 Impact: {rec.impact}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
