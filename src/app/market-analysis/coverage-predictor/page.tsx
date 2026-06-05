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
        {/* Hero */}
        <section style={{ borderBottom: '1px solid #E5E4E0', padding: '1.5rem 1.5rem', background: '#FFFFFF' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: scoreBg, border: `1px solid ${scoreColor}30`, marginBottom: '1.5rem' }}>
                <Gauge className="w-4 h-4" style={{ color: scoreColor }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor }}>Real-Time Coverage Prediction</span>
              </div>

              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                    Coverage Predictor™
                  </h1>
                  <p style={{ fontSize: '1rem', color: '#717171' }}>
                    AI-powered prediction of post-IPO analyst coverage based on your company fundamentals, market position, and financial metrics. See what drives coverage decisions and how to improve your analyst outlook.
                  </p>
                </div>

                {/* Score Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    padding: '1rem',
                    background: scoreBg,
                    border: `2px solid ${scoreColor}`,
                    borderRadius: '0.75rem',
                    minWidth: '220px'
                  }}
                >
                  <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 700, margin: 0, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Coverage Likelihood
                  </p>
                  <p style={{ fontSize: '3rem', fontWeight: 700, color: scoreColor, margin: 0, marginBottom: '0.5rem' }}>
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
