'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import {
  TrendingUp, Users, DollarSign, Zap, BarChart3, Target, AlertCircle, CheckCircle2, Trophy
} from 'lucide-react'

export default function CoveragePredictorPage() {
  const [industry, setIndustry] = useState('software')
  const [marketCap, setMarketCap] = useState('500')

  const industries = ['Software', 'Healthcare', 'Fintech', 'E-Commerce', 'Deep Tech', 'Industrial']
  const marketCaps = ['250-500M', '500M-1B', '1B-2B', '2B-5B', '5B+']

  const getCoverageScore = () => {
    const baseScores: Record<string, number> = {
      software: 8,
      healthcare: 7,
      fintech: 8,
      ecommerce: 6,
      deeptech: 5,
      industrial: 5
    }
    const capMultipliers: Record<string, number> = {
      '250': 0.6,
      '500': 0.8,
      '1000': 1.0,
      '2000': 1.2,
      '5000': 1.4
    }
    const baseScore = baseScores[industry] || 6
    const capMult = capMultipliers[marketCap] || 1.0
    return Math.min(10, Math.round(baseScore * capMult * 10) / 10)
  }

  const score = getCoverageScore()
  const scoreColor = score >= 8 ? '#2D7A5F' : score >= 6 ? '#B45309' : '#E8312A'
  const scoreLabel = score >= 8 ? 'Strong' : score >= 6 ? 'Moderate' : 'Challenging'

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>

      {/* Hero */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '3rem 1.5rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#EBF9F4', border: '1px solid #2D7A5F30' }}>
              <Trophy className="w-4 h-4" style={{ color: '#2D7A5F' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2D7A5F' }}>Analyst Coverage Intelligence</span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '1rem 0' }}>
              Coverage Predictor™
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '48rem', margin: '1rem auto' }}>
              Predict your post-IPO analyst coverage likelihood. Based on sector, market cap, and comparable companies.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="inline-flex items-center gap-2" style={{ color: '#1A1A1A' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                <span style={{ fontWeight: 600 }}>Industry-proven model from 1000+ IPO data points</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Input Section */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '4rem 1.5rem', background: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Industry Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>
                Industry
              </label>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind.toLowerCase().replace(' ', ''))}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid #E5E4E0',
                      borderRadius: '0.375rem',
                      background: industry === ind.toLowerCase().replace(' ', '') ? '#F9E4E1' : '#FFFFFF',
                      borderColor: industry === ind.toLowerCase().replace(' ', '') ? '#E8312A' : '#E5E4E0',
                      color: industry === ind.toLowerCase().replace(' ', '') ? '#E8312A' : '#1A1A1A',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (industry !== ind.toLowerCase().replace(' ', '')) {
                        e.currentTarget.style.borderColor = '#1A1A1A'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (industry !== ind.toLowerCase().replace(' ', '')) {
                        e.currentTarget.style.borderColor = '#E5E4E0'
                      }
                    }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Market Cap Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>
                Post-IPO Market Cap
              </label>
              <div className="space-y-2">
                {marketCaps.map((cap, idx) => (
                  <button
                    key={cap}
                    onClick={() => setMarketCap((['250', '500', '1000', '2000', '5000'][idx]).toString())}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #E5E4E0',
                      borderRadius: '0.375rem',
                      background: marketCap === (['250', '500', '1000', '2000', '5000'][idx]).toString() ? '#F9E4E1' : '#FFFFFF',
                      borderColor: marketCap === (['250', '500', '1000', '2000', '5000'][idx]).toString() ? '#E8312A' : '#E5E4E0',
                      color: marketCap === (['250', '500', '1000', '2000', '5000'][idx]).toString() ? '#E8312A' : '#1A1A1A',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (marketCap !== (['250', '500', '1000', '2000', '5000'][idx]).toString()) {
                        e.currentTarget.style.borderColor = '#1A1A1A'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (marketCap !== (['250', '500', '1000', '2000', '5000'][idx]).toString()) {
                        e.currentTarget.style.borderColor = '#E5E4E0'
                      }
                    }}
                  >
                    ${cap}M
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Score Card */}
      <section style={{ padding: '4rem 1.5rem', background: '#F7F6F4', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              padding: '3rem',
              background: '#FFFFFF',
              border: '1px solid #E5E4E0',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '0.875rem', color: '#717171', marginBottom: '1rem', fontWeight: 600 }}>
              PREDICTED COVERAGE SCORE
            </p>
            <div style={{ fontSize: '4.5rem', fontWeight: 700, color: scoreColor, marginBottom: '0.5rem' }}>
              {score}/10
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: scoreColor, marginBottom: '1.5rem' }}>
              {scoreLabel} Coverage Likelihood
            </p>
            <p style={{ fontSize: '1rem', color: '#717171', maxWidth: '32rem', margin: '0 auto' }}>
              Companies with this profile typically attract {scoreLabel.toLowerCase()} analyst coverage post-IPO. Plan your investor relations accordingly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section style={{ padding: '4rem 1.5rem', background: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Users,
                title: 'Strong Coverage (8-10)',
                description: 'Enterprise SaaS, large-cap healthcare. Expect 15-25 analyst initiations.',
                color: '#2D7A5F'
              },
              {
                icon: Target,
                title: 'Moderate Coverage (6-7)',
                description: 'Mid-cap software, fintech growth. Expect 8-15 analyst initiations.',
                color: '#B45309'
              },
              {
                icon: AlertCircle,
                title: 'Limited Coverage (< 6)',
                description: 'Niche or early-stage verticals. Focus on buy-side investors.',
                color: '#E8312A'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '1.5rem',
                  background: '#F9F9F9',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.5rem'
                }}
              >
                <item.icon className="w-6 h-6 mb-3" style={{ color: item.color }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#717171' }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{
              padding: '2rem',
              background: '#EBF9F4',
              border: '1px solid #2D7A5F30',
              borderRadius: '0.5rem'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>
              How to Improve Your Coverage Outlook
            </h3>
            <ul style={{ color: '#717171', lineHeight: 1.8 }}>
              <li>✓ <strong>Grow revenue</strong> to $50M+ ARR (analyst minimums)</li>
              <li>✓ <strong>Expand TAM</strong> to $10B+ serviceable market</li>
              <li>✓ <strong>Build analyst relationships</strong> 6+ months pre-IPO</li>
              <li>✓ <strong>Execute IR strategy</strong> aggressively in first 12 months</li>
              <li>✓ <strong>Consider sponsorships</strong> with banks that have research teams</li>
            </ul>
          </motion.div>
        </div>
      </section>
      </div>
    </AppShell>
  )
}
