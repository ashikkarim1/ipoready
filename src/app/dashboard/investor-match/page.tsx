'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  Target, Users, TrendingUp, DollarSign, CheckCircle2, AlertCircle,
  Filter, Search, Star, MapPin, Building2, BarChart3
} from 'lucide-react'

interface Investor {
  id: string
  name: string
  type: 'VC' | 'PE' | 'Growth' | 'Strategic'
  stage: string
  checkSize: string
  sector: string
  location: string
  successRate: number
  relevance: number
  notes: string
}

const MOCK_INVESTORS: Investor[] = [
  {
    id: '1',
    name: 'Accel Partners',
    type: 'VC',
    stage: 'Series A-D',
    checkSize: '$2M-$50M',
    sector: 'Enterprise SaaS',
    location: 'San Francisco',
    successRate: 92,
    relevance: 95,
    notes: 'Strong history with fintech and AI companies'
  },
  {
    id: '2',
    name: 'Sequoia Capital',
    type: 'VC',
    stage: 'Series B-D',
    checkSize: '$5M-$100M+',
    sector: 'Diverse',
    location: 'San Francisco',
    successRate: 88,
    relevance: 88,
    notes: 'Excellent IPO track record, strong network'
  },
  {
    id: '3',
    name: 'Insight Partners',
    type: 'PE',
    stage: 'Growth Stage',
    checkSize: '$50M-$500M',
    sector: 'Enterprise SaaS',
    location: 'New York',
    successRate: 85,
    relevance: 82,
    notes: 'Focused on software-as-a-service companies'
  },
  {
    id: '4',
    name: 'Andreessen Horowitz',
    type: 'VC',
    stage: 'Seed-D',
    checkSize: '$1M-$150M+',
    sector: 'Technology',
    location: 'San Francisco',
    successRate: 90,
    relevance: 80,
    notes: 'Large fund with extensive operating resources'
  },
  {
    id: '5',
    name: 'Thrive Capital',
    type: 'Growth',
    stage: 'Series C+',
    checkSize: '$5M-$100M',
    sector: 'Technology',
    location: 'New York',
    successRate: 87,
    relevance: 85,
    notes: 'Growth equity focused, strong exits'
  }
]

export default function InvestorMatchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'relevance' | 'successRate'>('relevance')

  const investors = MOCK_INVESTORS.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.sector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || inv.type === selectedType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    if (sortBy === 'relevance') return b.relevance - a.relevance
    return b.successRate - a.successRate
  })

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#F0F4FF', border: '1px solid #1D4ED830' }}>
              <Target className="w-4 h-4" style={{ color: '#1D4ED8' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1D4ED8' }}>Investor Intelligence</span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '1rem 0' }}>
              Investor Match™
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '48rem', margin: '1rem auto' }}>
              Find the investors most likely to lead your round. Matching based on stage, sector, check size, and exit patterns.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="inline-flex items-center gap-2" style={{ color: '#1A1A1A' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                <span style={{ fontWeight: 600 }}>Curated from 500+ institutional investors</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: '2rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search className="w-5 h-5" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#717171' }} />
                <input
                  type="text"
                  placeholder="Investor name or sector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Investor Type
              </label>
              <select
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value || null)}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.375rem',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Types</option>
                <option value="VC">Venture Capital</option>
                <option value="PE">Private Equity</option>
                <option value="Growth">Growth Equity</option>
                <option value="Strategic">Strategic</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'successRate')}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.375rem',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  cursor: 'pointer'
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="successRate">Exit Rate</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Investors Grid */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {investors.map((investor, idx) => (
              <motion.div
                key={investor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                style={{
                  padding: '1.5rem',
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.5rem'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.25rem' }}>
                      {investor.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: investor.type === 'VC' ? '#EBF9F4' : investor.type === 'PE' ? '#F0F4FF' : '#FEF3E1',
                          color: investor.type === 'VC' ? '#2D7A5F' : investor.type === 'PE' ? '#1D4ED8' : '#B45309'
                        }}
                      >
                        {investor.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <Star className="w-4 h-4" style={{ color: '#FCD34D', fill: '#FCD34D' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>
                        {investor.relevance}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#717171' }}>Match</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Stage</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.stage}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Check Size</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.checkSize}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Sector Focus</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.sector}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Exit Rate</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.successRate}%</p>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#F9F9F9', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.25rem', fontWeight: 600 }}>Location</p>
                  <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.location}</p>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#717171', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {investor.notes}
                </p>

                <button
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#E8312A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#D12620')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
                >
                  View Profile
                </button>
              </motion.div>
            ))}
          </div>

          {investors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#717171' }} />
              <p style={{ fontSize: '1rem', color: '#717171' }}>No investors match your criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
