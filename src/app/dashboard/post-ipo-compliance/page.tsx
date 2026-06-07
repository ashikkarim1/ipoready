'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Calendar, FileText, TrendingUp } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function PostIPOComplianceModule() {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const complianceTasks = [
    { phase: 'Quiet Period Compliance', duration: '90 days', status: 'Active', pct: 45 },
    { phase: 'Initial SEC Filings (10-Q)', duration: '45 days after close', status: 'Upcoming', pct: 0 },
    { phase: 'Earnings Reports (10-K)', duration: '60 days after FY-end', status: 'Scheduled', pct: 0 },
    { phase: 'SOX 404 Compliance', duration: '12+ months', status: 'Ongoing', pct: 15 },
  ]
  const reporting = [
    { item: '10-Q Filing', dueDate: 'Aug 15, 2026', status: 'Scheduled' },
    { item: 'Earnings Announcement', dueDate: 'Jul 28, 2026', status: 'Scheduled' },
    { item: 'Annual Report (10-K)', dueDate: 'Mar 15, 2027', status: 'Upcoming' },
  ]

  return (
    <>
      <PremiumPageLayout title="Post-IPO Compliance Module" subtitle="Automated compliance for 12+ months post-listing" icon={<CheckCircle2 className="w-8 h-8 text-purple-600" />}>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Compliance Phases</h2>
            <div className="space-y-3">
              {complianceTasks.map((t, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-purple-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-nav text-sm">{t.phase}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">{t.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${t.pct}%`}}></div>
                  </div>
                  <p className="text-xs text-text-muted">{t.duration}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Filing Calendar</h2>
            <div className="space-y-3">
              {reporting.map((r, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-nav text-sm">{r.item}</p>
                      <p className="text-xs text-text-muted mt-1">{r.dueDate}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">{r.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all">View Full Calendar</button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="post_ipo_compliance" featureName="Post-IPO Compliance" />
    </>
  )
}
