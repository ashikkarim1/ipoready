'use client'

import { motion } from 'framer-motion'
import { Globe, CheckCircle2, FileText, Zap } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function MultiCountryFilingSystem() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-teal-600" />
              <h1 className="h1">Multi-Country Filing System</h1>
            </div>
            <p className="text-text-muted">
              File in SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and 50+ exchanges from one platform
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Filing Dashboard (Locked) */}
          <PremiumLock
            featureKey="multi_country_filing"
            featureName="Multi-Country Filing System"
            badge="red"
            badgeText="Enterprise"
            className="h-96"
          >
            <div className="space-y-2">
              {[
                { country: 'Canada', exchange: 'TSX/TSXV', status: 'Filed', date: '2026-06-10' },
                { country: 'United States', exchange: 'NASDAQ', status: 'In Progress', date: '2026-06-15' },
                { country: 'UK', exchange: 'LSE', status: 'Pending', date: '2026-06-20' },
              ].map((filing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-medium text-nav">{country}</div>
                      <div className="text-xs text-text-muted">{filing.exchange}</div>
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
            <h3 className="font-semibold text-nav mb-4">Supported Exchanges (50+)</h3>
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
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-slate-200"
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
            className="grid md:grid-cols-3 gap-4"
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
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-teal-600 mb-3" />
                  <h3 className="font-semibold text-nav mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {[
              { stat: '50+', label: 'Exchanges Covered' },
              { stat: '80%', label: 'Time Saved' },
              { stat: '$150K', label: 'Legal Fees Avoided' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200"
              >
                <div className="text-3xl font-bold text-teal-600 mb-1">{item.stat}</div>
                <div className="text-sm text-text-muted">{item.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-8 text-center"
          >
            <Globe className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">File Globally, Manage Locally</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              Multi-country IPOs are complex. SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and more
              have different formats and requirements. One platform to rule them all.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all"
            >
              <Globe className="w-5 h-5" />
              Upgrade to Enterprise
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="multi_country_filing"
        featureName="Multi-Country Filing System"
      />
    </div>
  )
}
