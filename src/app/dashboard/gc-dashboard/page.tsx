'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function GCLegalDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const compliance = [
    { item: 'Securities Law Compliance', pct: 100, status: 'complete' },
    { item: 'Board Resolutions', pct: 95, status: 'in-progress' },
    { item: 'Stockholder Approvals', pct: 80, status: 'in-progress' },
    { item: 'Legal Opinions', pct: 60, status: 'pending' },
  ]
  const risks = [
    { risk: 'Pending Patent Challenges', severity: 'high', dueDate: 'Jun 25' },
    { risk: 'Regulatory Inquiry', severity: 'medium', dueDate: 'Jul 5' },
    { risk: 'Contract Renewals', severity: 'low', dueDate: 'Aug 1' },
  ]

  return (
    <>
      <PremiumPageLayout title="GC Legal Dashboard" subtitle="Legal tracking, compliance checklists, and risk management" icon={<Shield className="w-8 h-8 text-indigo-600" />}>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Compliance Status</h2>
            <div className="space-y-3">
              {compliance.map((c, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-indigo-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-nav text-sm">{c.item}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{c.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${c.pct}%`}}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Legal Risks</h2>
            <div className="space-y-3">
              {risks.map((r, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className={`rounded-lg border p-4 ${r.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-nav text-sm">{r.risk}</p>
                      <p className="text-xs text-text-muted mt-1">Due: {r.dueDate}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all">Access Legal Docs</button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="gc_dashboard" featureName="GC Dashboard" />
    </>
  )
}
