'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  TrendingUp, DollarSign, Users, BarChart3, CheckCircle2, AlertCircle,
  Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface Peer {
  id: string
  name: string
  sector: string
  ipo_year: number
  valuation: string
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
    revenue: '$1.7B (2023)',
    ipo_raised: '$192M',
    employees: 2200,
    countries: 45,
    current_price_vs_ipo: 420
  }
]

export default function PeerAnalysisPage() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

  const peers = selectedSector
    ? MOCK_PEERS.filter(p => p.sector.toLowerCase().includes(selectedSector.toLowerCase()))
    : MOCK_PEERS

  const sectors = Array.from(new Set(MOCK_PEERS.map(p => p.sector)))

  const avgValuation = (peers.reduce((sum, p) => sum + parseFloat(p.valuation), 0) / peers.length).toFixed(1)
  const avgRevenue = (peers.length > 0 ? peers.length : 1)
  const avgEmployees = Math.round(peers.reduce((sum, p) => sum + p.employees, 0) / peers.length)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
      <Header />

      {/* Hero */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '3rem 1.5rem', background: '#F7F6F4' }}>
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
      <section style={{ padding: '2rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
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
      <section style={{ padding: '3rem 1.5rem' }}>
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
                    style={{
                      borderBottom: '1px solid #E5E4E0',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8'
                    }}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                      {peer.name}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#717171' }}>
                      {peer.sector}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', textAlign: 'right' }}>
                      {peer.valuation}
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
  )
}
