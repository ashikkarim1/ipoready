'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import {
  TrendingUp, DollarSign, Users, BarChart3, CheckCircle2, AlertCircle,
  Filter, ArrowUpRight, ArrowDownRight, HelpCircle
} from 'lucide-react'

interface Peer {
  id: string
  name: string
  sector: string
  ipo_year: number
  valuation: string
  valuationMethod: string
  valuationLogic: string
  revenue: string
  ipo_raised: string
  employees: number
  countries: number
  current_price_vs_ipo: number
}

const MOCK_PEERS: Peer[] = [
  {
    id: '1',
    name: 'Datadog Inc.',
    sector: 'Cloud Monitoring',
    ipo_year: 2019,
    valuation: '$38B',
    valuationMethod: 'EV/Revenue Multiple',
    valuationLogic: '38B valuation = $1.5B revenue × 25.3x multiple. Datadog trades at 25x revenue due to: (1) 30%+ YoY growth, (2) 130%+ net retention rate, (3) AI-driven observability platform in high-demand market, (4) Strong enterprise customer base with average ACV $500K+',
    revenue: '$1.5B (2023)',
    ipo_raised: '$648M',
    employees: 3500,
    countries: 30,
    current_price_vs_ipo: 280
  },
  {
    id: '2',
    name: 'Twilio Inc.',
    sector: 'Communications API',
    ipo_year: 2016,
    valuation: '$12B',
    valuationMethod: 'EV/Revenue Multiple',
    valuationLogic: '12B valuation = $2.9B revenue × 4.1x multiple. Lower multiple (4x vs 25x Datadog) reflects: (1) Slower growth after market saturation, (2) Increased competition from AWS/Google, (3) Customer churn in certain verticals, (4) Mature SaaS platform without AI differentiation',
    revenue: '$2.9B (2023)',
    ipo_raised: '$200M',
    employees: 4900,
    countries: 40,
    current_price_vs_ipo: 120
  },
  {
    id: '3',
    name: 'HashiCorp Inc.',
    sector: 'Infrastructure Automation',
    ipo_year: 2021,
    valuation: '$4.2B',
    valuationMethod: 'EV/Revenue Multiple',
    valuationLogic: '4.2B valuation = $550M revenue × 7.6x multiple. Mid-range multiple driven by: (1) 40%+ growth but below DDOG, (2) Open-source community adoption, (3) Enterprise TCO model with sticky deployments, (4) Lower net retention vs pure-cloud platforms',
    revenue: '$550M (2023)',
    ipo_raised: '$1.2B',
    employees: 1300,
    countries: 25,
    current_price_vs_ipo: 95
  },
  {
    id: '4',
    name: 'Elastic NV',
    sector: 'Search & Analytics',
    ipo_year: 2018,
    valuation: '$18B',
    valuationMethod: 'EV/Revenue Multiple + DCF',
    valuationLogic: '18B valuation = $1.2B revenue × 15x multiple. Premium pricing justified by: (1) 35% growth in search/analytics, (2) Switching costs embedded in infrastructure, (3) 50+ countries showing global expansion, (4) Mission-critical role in observability stack post-AI adoption',
    revenue: '$1.2B (2023)',
    ipo_raised: '$235M',
    employees: 2600,
    countries: 50,
    current_price_vs_ipo: 350
  },
  {
    id: '5',
    name: 'MongoDB Inc.',
    sector: 'Database Platform',
    ipo_year: 2017,
    valuation: '$32B',
    valuationMethod: 'EV/Revenue Multiple + Growth',
    valuationLogic: '32B valuation = $1.7B revenue × 18.8x multiple. High multiple reflects: (1) 32% ARR growth, (2) Highest net retention among peers (140%+), (3) Developer-first moat with largest NoSQL install base, (4) Essential infrastructure reducing churn risk, (5) AI integration roadmap creating upsell opportunities',
    revenue: '$1.7B (2023)',
    ipo_raised: '$192M',
    employees: 2200,
    countries: 45,
    current_price_vs_ipo: 420
  }
]

export default function PeerAnalysisPage() {
  const router = useRouter()
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [hoveredValuation, setHoveredValuation] = useState<string | null>(null)

  const peers = selectedSector
    ? MOCK_PEERS.filter(p => p.sector.toLowerCase().includes(selectedSector.toLowerCase()))
    : MOCK_PEERS

  const sectors = Array.from(new Set(MOCK_PEERS.map(p => p.sector)))

  const avgValuation = (peers.reduce((sum, p) => sum + parseFloat(p.valuation), 0) / peers.length).toFixed(1)
  const avgRevenue = (peers.length > 0 ? peers.length : 1)
  const avgEmployees = Math.round(peers.reduce((sum, p) => sum + p.employees, 0) / peers.length)

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>

      {/* Hero */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '1.5rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#FEF3E1', border: '1px solid #B4530930' }}>
              <BarChart3 className="w-4 h-4" style={{ color: '#B45309' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#B45309' }}>Market Intelligence</span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '1rem 0' }}>
              Peer Analysis
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '48rem', margin: '1rem auto' }}>
              Understand your position relative to comparable companies. Benchmarking for valuation, growth, and market performance.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="inline-flex items-center gap-2" style={{ color: '#1A1A1A' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                <span style={{ fontWeight: 600 }}>Data from 100+ publicly traded companies</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Stats */}
      <section style={{ padding: '1rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>
              Filter by Sector
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedSector(null)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: selectedSector === null ? '2px solid #E8312A' : '1px solid #E5E4E0',
                  background: selectedSector === null ? '#F9E4E1' : '#FFFFFF',
                  color: selectedSector === null ? '#E8312A' : '#1A1A1A',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                All Sectors
              </button>
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: selectedSector === sector ? '2px solid #E8312A' : '1px solid #E5E4E0',
                    background: selectedSector === sector ? '#F9E4E1' : '#FFFFFF',
                    color: selectedSector === sector ? '#E8312A' : '#1A1A1A',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid #E5E4E0' }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ padding: '1rem', background: '#F7F6F4', borderRadius: '0.375rem' }}
            >
              <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                AVG VALUATION
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A' }}>
                ${avgValuation}B
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: '1rem', background: '#F7F6F4', borderRadius: '0.375rem' }}
            >
              <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                MEDIAN IPO YEAR
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A' }}>
                {MOCK_PEERS.sort((a, b) => a.ipo_year - b.ipo_year)[Math.floor(MOCK_PEERS.length / 2)].ipo_year}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ padding: '1rem', background: '#F7F6F4', borderRadius: '0.375rem' }}
            >
              <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                AVG EMPLOYEES
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A' }}>
                {Math.round(avgEmployees / 100) * 100}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Peers Table */}
      <section style={{ padding: '1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E4E0', background: '#F7F6F4' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>Company</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>Sector</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>Valuation</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>IPO Year</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>IPO Raised</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>Price vs IPO</th>
                </tr>
              </thead>
              <tbody>
                {peers.map((peer, idx) => (
                  <motion.tr
                    key={peer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(`/market-analysis/peer-analysis/${peer.id}`)}
                    style={{
                      borderBottom: '1px solid #E5E4E0',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F3F3F3'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8'
                    }}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                      {peer.name}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#717171' }}>
                      {peer.sector}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', textAlign: 'right', position: 'relative' }}>
                      <div
                        style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
                        onMouseEnter={() => setHoveredValuation(peer.id)}
                        onMouseLeave={() => setHoveredValuation(null)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          {peer.valuation}
                          <HelpCircle className="w-4 h-4" style={{ color: '#1D4ED8', opacity: 0.6 }} />
                        </div>

                        {hoveredValuation === peer.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                              position: 'absolute',
                              bottom: '120%',
                              right: 0,
                              background: '#1A1A1A',
                              color: '#FFFFFF',
                              padding: '1rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              zIndex: 10,
                              minWidth: '300px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                              pointerEvents: 'none'
                            }}
                          >
                            <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: 700, color: '#E8312A' }}>
                              Valuation Method
                            </p>
                            <p style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                              {peer.valuationMethod}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.5, color: '#CCCCCC' }}>
                              {peer.valuationLogic}
                            </p>

                            {/* Tooltip arrow */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '-6px',
                                right: '20px',
                                width: 0,
                                height: 0,
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: '6px solid #1A1A1A'
                              }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#717171', textAlign: 'right' }}>
                      {peer.ipo_year}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#717171', textAlign: 'right' }}>
                      {peer.ipo_raised}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        {peer.current_price_vs_ipo >= 100 ? (
                          <ArrowUpRight className="w-4 h-4" style={{ color: '#2D7A5F' }} />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" style={{ color: '#E8312A' }} />
                        )}
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: peer.current_price_vs_ipo >= 100 ? '#2D7A5F' : '#E8312A'
                          }}
                        >
                          {peer.current_price_vs_ipo}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </div>
    </AppShell>
  )
}
