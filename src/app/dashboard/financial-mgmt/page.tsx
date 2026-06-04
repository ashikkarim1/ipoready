'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { DollarSign, Calculator, TrendingUp, ArrowRight } from 'lucide-react'

export default function FinancialMgmtPage() {
  const cards = [
    {
      title: 'Cost Calculator',
      description: 'Estimate total costs to go public including all advisory and regulatory fees',
      href: '/dashboard/financial-mgmt/cost-calculator',
      icon: <Calculator className="w-8 h-8" />,
      accent: '#3B82F6',
    },
    {
      title: 'True Cost of Going Public',
      description: 'Forecast ongoing annual costs after listing including audit, IR, legal, and insurance',
      href: '/dashboard/financial-mgmt/true-cost',
      icon: <TrendingUp className="w-8 h-8" />,
      accent: '#E8312A',
      isNew: true,
    },
  ]

  return (
    <main className="min-h-screen py-8 px-4 md:px-8" style={{ background: '#F7F6F4' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" style={{ color: '#E8312A' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Financial Management
            </h1>
          </div>
          <p className="text-gray-600">
            Estimate and forecast the financial costs and commitments required for your IPO journey
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link href={card.href}>
                <a className="block">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-200 h-full group">
                    <div className="flex items-start justify-between mb-4">
                      <div style={{ color: card.accent }}>
                        {card.icon}
                      </div>
                      {card.isNew && (
                        <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:underline">
                      {card.title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2" style={{ color: card.accent }}>
                      <span className="text-sm font-semibold">Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
