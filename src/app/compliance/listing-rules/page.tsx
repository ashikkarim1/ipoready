'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'

export default function ListingRulesPage() {
  const [hoveredExchange, setHoveredExchange] = useState<string | null>(null)

  const exchanges = [
    {
      name: 'TSX',
      exchange: 'Toronto Stock Exchange',
      rules: ['Corporate governance requirements', 'Financial disclosure standards', 'Continuous disclosure obligations'],
      color: '#0066CC',
      bg: '#E6F0FF',
    },
    {
      name: 'NASDAQ',
      exchange: 'NASDAQ Stock Market',
      rules: ['Board composition rules', 'Audit committee requirements', 'Executive compensation disclosure'],
      color: '#FF6D00',
      bg: '#FFE8CC',
    },
    {
      name: 'TSX-V',
      exchange: 'TSX Venture Exchange',
      rules: ['Venture-specific requirements', 'Minimum share price rules', 'Escrow provisions'],
      color: '#2D7A5F',
      bg: '#EAF5F0',
    },
    {
      name: 'CSE',
      exchange: 'Canadian Securities Exchange',
      rules: ['Flexible disclosure standards', 'Lower minimum shareholder requirements', 'Streamlined compliance framework'],
      color: '#E8312A',
      bg: '#FDECEB',
    },
  ]

  return (
    <main style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '4.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <span className="pill text-xs font-bold uppercase tracking-wider"
              style={{ background: '#FDECEB', color: '#E8312A' }}>
              <Shield className="w-3.5 h-3.5 inline mr-1.5" />
              Listing Rules
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="serif text-nav"
            style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
            Exchange-Specific<br />
            <span style={{ color: '#E8312A' }}>Requirements at a Glance</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-text-muted text-lg leading-relaxed" style={{ marginBottom: '1.5rem', maxWidth: '620px', margin: '0 auto 2.5rem' }}>
            Understand listing rules and compliance requirements for major Canadian and US exchanges. View detailed requirements for your target exchange.
          </motion.p>
        </motion.div>
      </section>

      {/* Exchanges Grid */}
      <section className="max-w-7xl mx-auto" style={{ paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="grid md:grid-cols-2 gap-6">
          {exchanges.map((exchange, idx) => (
            <motion.div
              key={exchange.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="card p-8 card-hover"
              onMouseEnter={() => setHoveredExchange(exchange.name)}
              onMouseLeave={() => setHoveredExchange(null)}>
              
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: exchange.bg }}>
                    <Shield className="w-5 h-5" style={{ color: exchange.color }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-nav">{exchange.name}</h2>
                    <p className="text-sm text-text-muted mt-1">{exchange.exchange}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: exchange.bg, color: exchange.color }}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Supported</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-nav uppercase tracking-wider">Key Requirements</h3>
                <ul className="space-y-2">
                  {exchange.rules.map((rule, ridx) => (
                    <li key={ridx} className="flex items-start gap-3 text-sm text-text-muted">
                      <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: exchange.color }}></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  const url = `/dashboard/compliance/listing-requirements?exchange=${exchange.name.toLowerCase()}`
                  window.location.href = url
                }}
                className="w-full px-6 py-2.5 rounded-full font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                style={{ 
                  background: exchange.color, 
                  color: 'white',
                  transform: hoveredExchange === exchange.name ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: hoveredExchange === exchange.name ? '0 8px 16px rgba(232, 49, 42, 0.2)' : 'none',
                  transitionProperty: 'all',
                  transitionDuration: '0.2s'
                }}
              >
                View Full Requirements
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-7xl mx-auto" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="text-center">
            <h3 className="serif text-2xl text-nav mb-3 leading-tight">Comprehensive Compliance Guides</h3>
            <p className="text-text-muted max-w-2xl mx-auto" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              Select any exchange to view detailed listing requirements, disclosure schedules, board composition rules, and compliance checklists tailored to your company profile.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
