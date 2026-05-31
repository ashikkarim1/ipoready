'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { isFeatureLocked } from '@/lib/cap-table-feature-gates'

interface CapTableTemplate {
  id: string
  name: string
  description: string
  stage: string
  totalShares: number
  typicalFunding: number
  founderStake: number
  investorStake: number
  employees: number
}

const TEMPLATES: CapTableTemplate[] = [
  {
    id: 'seed',
    name: 'Seed Stage',
    description: 'Pre-revenue, founders + early angels',
    stage: 'Seed',
    totalShares: 10000000,
    typicalFunding: 500000,
    founderStake: 80,
    investorStake: 15,
    employees: 2,
  },
  {
    id: 'seriesA',
    name: 'Series A',
    description: 'Product-market fit, institutional investors',
    stage: 'Series A',
    totalShares: 11000000,
    typicalFunding: 3000000,
    founderStake: 65,
    investorStake: 30,
    employees: 5,
  },
  {
    id: 'seriesB',
    name: 'Series B',
    description: 'Scaling phase, multiple investors',
    stage: 'Series B',
    totalShares: 12500000,
    typicalFunding: 10000000,
    founderStake: 52,
    investorStake: 43,
    employees: 15,
  },
  {
    id: 'seriesC',
    name: 'Series C',
    description: 'Growth stage, late-round investors',
    stage: 'Series C',
    totalShares: 15000000,
    typicalFunding: 25000000,
    founderStake: 40,
    investorStake: 55,
    employees: 30,
  },
  {
    id: 'growth',
    name: 'Growth Stage',
    description: 'Multiple rounds, institutional backing',
    stage: 'Growth',
    totalShares: 17500000,
    typicalFunding: 50000000,
    founderStake: 32,
    investorStake: 63,
    employees: 50,
  },
  {
    id: 'preIPO',
    name: 'Pre-IPO',
    description: 'Ready for public markets',
    stage: 'Pre-IPO',
    totalShares: 20000000,
    typicalFunding: 75000000,
    founderStake: 28,
    investorStake: 67,
    employees: 100,
  },
]

export default function CapTableTemplatesPage() {
  const router = useRouter()
  const userPlan = useAppStore((s) => s.userPlan)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const canApplyTemplate = userPlan === 'starter' || userPlan === 'growth' || userPlan === 'enterprise'
  const isLocked = isFeatureLocked('edit', userPlan)

  const handleUseTemplate = (templateId: string) => {
    if (!canApplyTemplate) {
      router.push('/pricing')
      return
    }

    // Store selected template and redirect to cap-table page
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      // This would typically save to localStorage or pass via URL params
      router.push(`/cap-table?template=${templateId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Cap Table Templates</h1>
          <p className="text-lg text-slate-600">
            Choose a template matching your funding stage and start your cap table instantly
          </p>
        </motion.div>

        {/* Tier Message */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-4"
          >
            <Lock className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Templates are available for Starter & above</p>
              <p className="text-sm text-blue-800">
                Upgrade to Starter ($99/mo) to apply templates and edit your cap table.
              </p>
            </div>
            <a
              href="/pricing"
              className="ml-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              View Plans
            </a>
          </motion.div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="h-full"
            >
              <div
                className={`h-full bg-white rounded-lg shadow-lg border border-slate-200 p-6 transition-all hover:shadow-xl ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Template Header */}
                <div className="mb-6">
                  <div className="inline-block bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    {template.stage}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-slate-600">{template.description}</p>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Typical Funding</span>
                    <span className="font-bold text-slate-900">
                      ${(template.typicalFunding / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Shares</span>
                    <span className="font-bold text-slate-900">
                      {(template.totalShares / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Founder Stake</span>
                    <span className="font-bold text-slate-900">{template.founderStake}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Investor Stake</span>
                    <span className="font-bold text-slate-900">{template.investorStake}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Typical Employees</span>
                    <span className="font-bold text-slate-900">{template.employees}</span>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={isLocked}
                  className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isLocked
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : selectedTemplate === template.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {selectedTemplate === template.id && <CheckCircle2 className="w-4 h-4" />}
                  {isLocked ? 'Unlock to Use' : selectedTemplate === template.id ? 'Selected' : 'Use Template'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">How to Use Templates</h2>
          <ol className="space-y-2 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
              <span>Select the template that matches your current funding stage</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
              <span>Click "Use Template" to apply it to your cap table</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
              <span>Edit shareholder names and adjust share quantities as needed</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
              <span>Review dilution across rounds and save your cap table</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  )
}
