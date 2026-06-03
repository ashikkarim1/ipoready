'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'

export default function ListingRulesPage() {
  const router = useRouter()
  const [hoveredExchange, setHoveredExchange] = useState<string | null>(null)
  const exchanges = [
    {
      name: 'TSX',
      exchange: 'Toronto Stock Exchange',
      rules: ['Corporate governance requirements', 'Financial disclosure standards', 'Continuous disclosure obligations'],
    },
    {
      name: 'NASDAQ',
      exchange: 'NASDAQ Stock Market',
      rules: ['Board composition rules', 'Audit committee requirements', 'Executive compensation disclosure'],
    },
    {
      name: 'TSX-V',
      exchange: 'TSX Venture Exchange',
      rules: ['Venture-specific requirements', 'Minimum share price rules', 'Escrow provisions'],
    },
    {
      name: 'CSE',
      exchange: 'Canadian Securities Exchange',
      rules: ['Flexible disclosure standards', 'Lower minimum shareholder requirements', 'Streamlined compliance framework'],
    },
  ]

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F6F4' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-slate-900">Listing Rules & Requirements</h1>
          </div>
          <p className="text-lg text-slate-600">
            Exchange-specific rules and compliance requirements for your IPO across major Canadian and US exchanges
          </p>
        </div>

        {/* Exchange Rules Grid */}
        <div className="grid gap-8">
          {exchanges.map((exchange) => (
            <div key={exchange.name} className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{exchange.name}</h2>
                  <p className="text-slate-600 mt-1">{exchange.exchange}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: '#E8312A', color: 'white' }}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                  Key Requirements
                </h3>
                <ul className="space-y-2 ml-7">
                  {exchange.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => router.push(`/dashboard/compliance/listing-requirements?exchange=${exchange.name.toLowerCase()}`)}
                onMouseEnter={() => setHoveredExchange(exchange.name)}
                onMouseLeave={() => setHoveredExchange(null)}
                className="mt-6 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 text-base"
                style={{ 
                  background: '#E8312A', 
                  color: 'white',
                  transform: hoveredExchange === exchange.name ? 'translateX(4px)' : 'translateX(0)',
                  transitionProperty: 'all'
                }}
              >
                View Full Requirements
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Coming Soon Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="font-bold text-blue-900 mb-2">📋 Detailed Requirements</h3>
          <p className="text-blue-800">
            Full listing requirements, disclosure schedules, and compliance checklists for your selected exchange are coming soon.
            We're building comprehensive guides tailored to your specific exchange and company profile.
          </p>
        </div>
      </div>
    </main>
  )
}
