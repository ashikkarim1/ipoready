'use client'

import { DollarSign, TrendingUp, Zap, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const TAX_STRATEGIES = [
  {
    id: 'harvesting',
    title: 'Tax-Loss Harvesting',
    icon: TrendingUp,
    description: 'Strategically realize investment losses to offset capital gains and reduce overall tax burden.',
  },
  {
    id: 'delaware',
    title: 'Delaware Holding Company',
    icon: DollarSign,
    description: 'Optimize corporate structure through Delaware incorporation for favorable tax treatment.',
  },
  {
    id: 'rd',
    title: 'R&D Tax Credits',
    icon: Zap,
    description: 'Capture available tax credits for research and development activities post-IPO.',
  },
  {
    id: 'withholding',
    title: 'Withholding Optimization',
    icon: Target,
    description: 'Manage employee withholding and executive compensation for tax efficiency.',
  },
]

export default function TaxPlanningPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="h2 mb-4">Tax Planning & Optimization</h1>
            <p className="body text-text-muted mb-12">
              Develop a comprehensive tax strategy for your public company to optimize after-tax returns and minimize liabilities.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="py-20 lg:py-28 px-6 lg:px-12 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TAX_STRATEGIES.map((strategy, idx) => {
              const Icon = strategy.icon
              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="card p-8"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="p-3 rounded-xl flex-shrink-0"
                      style={{ background: '#E8312A', color: 'white' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="h4 mb-2">{strategy.title}</h3>
                      <p className="body-sm text-text-muted">{strategy.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 flex gap-4">
            <button
              className="btn btn-primary"
              style={{ background: '#E8312A' }}
            >
              Schedule Tax Planning Session
            </button>
            <button className="btn btn-secondary">
              View Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
