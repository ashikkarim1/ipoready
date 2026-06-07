'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Network, UserCheck, Mail, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function AdvisorOrchestrationNetwork() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const advisors = [
    { name: 'Sarah Chen', role: 'Lead Underwriter', firm: 'Goldman Sachs', status: 'Active', engagement: 95 },
    { name: 'Michael Roberts', role: 'Legal Counsel', firm: 'Skadden Arps', status: 'Active', engagement: 88 },
    { name: 'Jennifer Liu', role: 'Auditor', firm: 'Deloitte', status: 'Active', engagement: 92 },
    { name: 'David Walsh', role: 'IR Advisor', firm: 'Nasdaq', status: 'Pending', engagement: 45 },
  ]

  const tasks = [
    { task: 'Roadshow Finalization', owner: 'Sarah Chen', dueDate: 'Jun 20', status: 'On Track', priority: 'high' },
    { task: 'Legal Due Diligence', owner: 'Michael Roberts', dueDate: 'Jun 18', status: 'In Progress', priority: 'high' },
    { task: 'Audit Completion', owner: 'Jennifer Liu', dueDate: 'Jun 22', status: 'On Track', priority: 'medium' },
  ]

  const stats = [
    { label: 'Total Advisors', value: '12', icon: UserCheck },
    { label: 'Active Tasks', value: '18', icon: CheckCircle2 },
    { label: 'Avg Engagement', value: '89%', icon: TrendingUp },
    { label: 'On-Time Rate', value: '94%', icon: Calendar },
  ]

  return (
    <>
      <PremiumPageLayout
        title="Advisor Orchestration Network"
        subtitle="Coordinate with 15-30 advisors with dependency tracking and automated escalation"
        icon={<Network className="w-8 h-8 text-red-600" />}
      >
        <div className="space-y-8">
          {/* Metrics */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Network Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-white p-4">
                    <Icon className="w-5 h-5 text-red-600 mb-2" />
                    <p className="text-sm text-text-muted mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-nav">{stat.value}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Advisors */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Key Advisors</h2>
            <div className="space-y-3">
              {advisors.map((adv, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-nav text-sm">{adv.name}</p>
                      <p className="text-xs text-text-muted mt-1">{adv.role} • {adv.firm}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${adv.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{adv.status}</span>
                      <p className="text-xs text-text-muted mt-2">{adv.engagement}% active</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dependency Tasks */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Tracked Tasks & Dependencies</h2>
            <div className="space-y-3">
              {tasks.map((t, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-nav text-sm">{t.task}</p>
                      <p className="text-xs text-text-muted mt-1">{t.owner} • Due {t.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.priority}</span>
                      <p className="text-xs text-green-600 font-semibold mt-2">{t.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">Unlock Network Features</button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="advisor_network" featureName="Advisor Orchestration Network" />
    </>
  )
}
