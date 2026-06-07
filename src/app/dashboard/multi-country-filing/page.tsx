'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Globe, CheckCircle2, FileText, Zap } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function MultiCountryFilingSystem() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <React.Fragment>
      <PremiumPageLayout
      title="Multi-Country Filing System"
      subtitle="File in SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and 50+ exchanges from one platform"
      icon={<Globe className="w-8 h-8 text-teal-600" />}
    >
      <div className="space-y-5">
      {/* Filing Dashboard (Locked) */}
      <PremiumLock
        featureKey="multi_country_filing"
        featureName="Multi-Country Filing System"
        badge="red"
        badgeText="Enterprise"
        className="h-80"
      >
        <div className="space-y-2">
          {[
            { country: 'Canada', exchange: 'TSX/TSXV', status: 'Filed', date: '2026-06-10' },
            { country: 'United States', exchange: 'NASDAQ', status: 'In Progress', date: '2026-06-15' },
            { country: 'UK', exchange: 'LSE', status: 'Pending', date: '2026-06-20' },
          ].map((filing, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 card"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-teal-600" />
                <div>
                  <p className="text-nav text-sm font-semibold">{filing.country}</p>
                  <p className="text-text-muted text-xs mt-0.5">{filing.exchange}</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                    filing.status === 'Filed'
                      ? 'bg-green-100 text-green-700'
                      : filing.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {filing.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PremiumLock>

      {/* Exchanges Supported */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-nav text-sm font-semibold mb-4">Supported Exchanges (50+)</p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            'NASDAQ',
            'NYSE',
            'TSX',
            'TSXV',
            'CSE',
            'LSE',
            'ASX',
            'SGX',
            'HKEx',
            'Shanghai',
            'Shenzhen',
            'Tokyo',
          ].map((exchange) => (
            <div
              key={exchange}
              className="flex items-center gap-2 px-4 py-3 rounded-lg card"
            >
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-nav">{exchange}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-5"
      >
        {[
          {
            title: 'Document Conversion',
            description: 'Auto-convert documents to each exchange format (SEDAR, SEC, etc.)',
            icon: FileText,
          },
          {
            title: 'Filing Orchestration',
            description: 'Submit to multiple exchanges simultaneously with status tracking',
            icon: Zap,
          },
          {
            title: 'Regulatory Compliance',
            description: 'Ensure all filings meet specific exchange & country requirements',
            icon: Globe,
          },
        ].map((feature, i) => {
          const Icon = feature.icon
          return (
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-teal-600 mb-3" />
              <p className="text-nav text-sm font-semibold">{feature.title}</p>
              <p className="text-text-muted text-xs mt-1">{feature.description}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Impact Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-5"
      >
        {[
          { stat: '50+', label: 'Exchanges Covered' },
          { stat: '80%', label: 'Time Saved' },
          { stat: '$150K', label: 'Legal Fees Avoided' },
        ].map((item, i) => (
          <div
            key={i}
            className="card p-6 border-2 border-teal-200"
            style={{ background: 'linear-gradient(to bottom right, rgb(240 253 250), rgb(240 253 250))' }}
          >
            <div className="text-3xl font-bold text-teal-600 mb-1">{item.stat}</div>
            <p className="text-text-muted text-sm">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-8 text-center border-2 border-teal-200"
        style={{ background: 'linear-gradient(to right, rgb(240 253 250), rgb(240 253 250))' }}
      >
        <Globe className="w-10 h-10 text-teal-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">File Globally, Manage Locally</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          Multi-country IPOs are complex. SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and more
          have different formats and requirements. One platform to rule them all.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all"
        >
          <Globe className="w-4 h-4" />
          Upgrade to Enterprise
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
      </PremiumPageLayout>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="multi_country_filing"
        featureName="Multi-Country Filing System"
      />
    </React.Fragment>
  )
}
