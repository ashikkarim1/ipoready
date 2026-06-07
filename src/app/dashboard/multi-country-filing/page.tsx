'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function MultiCountryFilingSystem() {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const filingStatus = [
    { country: 'Canada', exchange: 'TSX', status: 'Filed', date: 'Jun 15, 2026', pct: 100 },
    { country: 'United States', exchange: 'NASDAQ', status: 'In Progress', date: 'Jun 20, 2026', pct: 85 },
    { country: 'Canada', exchange: 'SEDAR 2', status: 'Submitted', date: 'Jun 18, 2026', pct: 95 },
    { country: 'Canada', exchange: 'CSE', status: 'Pending', date: 'Jun 25, 2026', pct: 45 },
  ]
  const requirements = [
    { requirement: 'TSX Prospectus', dueDate: 'Jun 18', status: 'complete' },
    { requirement: 'SEC Form F-1', dueDate: 'Jun 22', status: 'in-progress' },
    { requirement: 'SEDAR Filing Forms', dueDate: 'Jun 20', status: 'complete' },
  ]

  return (
    <>
      <PremiumPageLayout title="Multi-Country Filing System" subtitle="File in SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and 50+ exchanges" icon={<Globe className="w-8 h-8 text-teal-600" />}>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Filing Status by Country</h2>
            <div className="space-y-3">
              {filingStatus.map((f, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-teal-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-nav text-sm">{f.country} - {f.exchange}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${f.status === 'Filed' ? 'bg-green-100 text-green-700' : f.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{f.status}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{width: `${f.pct}%`}}></div>
                  </div>
                  <p className="text-xs text-text-muted">{f.date}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Document Requirements</h2>
            <div className="space-y-3">
              {requirements.map((r, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-nav text-sm">{r.requirement}</p>
                      <p className="text-xs text-text-muted mt-1">Due: {r.dueDate}</p>
                    </div>
                    <CheckCircle2 className={`w-5 h-5 ${r.status === 'complete' ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4">
            <p className="text-sm text-nav font-semibold mb-2">Multi-Country Coverage</p>
            <p className="text-2xl font-bold text-teal-600">50+ Exchanges</p>
            <p className="text-xs text-text-muted mt-2">TSX • CSE • NASDAQ • NYSE • SEDAR 2 • LSE • and more</p>
          </div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all">Configure Filings</button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="multi_country_filing" featureName="Multi-Country Filing" />
    </>
  )
}
