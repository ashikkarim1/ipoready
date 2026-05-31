'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import dynamic from 'next/dynamic'

// Lazy-load charts to avoid blocking initial render
const LazyWaterfallChart = dynamic(
  () => import('@/components/CapTable/WaterfallChart').then((mod) => ({ default: mod.CapTableWaterfallChart })),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 rounded animate-pulse" /> }
)

const LazyPieChart = dynamic(
  () => import('@/components/CapTable/PieChart').then((mod) => ({ default: mod.PieChart })),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 rounded animate-pulse" /> }
)

export interface Shareholder {
  id: string
  name: string
  type: 'founder' | 'investor' | 'employee' | 'option_pool'
  shares: number
  vestingStart?: string
  vestingCliff?: number
  vestingPeriod?: number
}

interface FundingStage {
  id: string
  name: string
  description: string
  fundingRaised: number
  shareholders: Shareholder[]
}

// Sample cap tables for each funding stage
const FUNDING_STAGES: Record<string, FundingStage> = {
  seed: {
    id: 'seed',
    name: 'Seed',
    description: 'Pre-revenue, <$1M raised',
    fundingRaised: 500000,
    shareholders: [
      {
        id: '1',
        name: 'John Smith (Founder)',
        type: 'founder',
        shares: 4000000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '2',
        name: 'Jane Doe (Founder)',
        type: 'founder',
        shares: 4000000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '3',
        name: 'Angel Investor 1',
        type: 'investor',
        shares: 1000000,
      },
      {
        id: '4',
        name: 'Option Pool',
        type: 'option_pool',
        shares: 1000000,
      },
    ],
  },
  seriesA: {
    id: 'seriesA',
    name: 'Series A',
    description: '$2-5M raised, product-market fit',
    fundingRaised: 3000000,
    shareholders: [
      {
        id: '1',
        name: 'John Smith (Founder)',
        type: 'founder',
        shares: 3600000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '2',
        name: 'Jane Doe (Founder)',
        type: 'founder',
        shares: 3600000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '3',
        name: 'Series A Investor',
        type: 'investor',
        shares: 2000000,
      },
      {
        id: '5',
        name: 'Employee Stock Option Pool',
        type: 'option_pool',
        shares: 1800000,
      },
    ],
  },
  seriesB: {
    id: 'seriesB',
    name: 'Series B',
    description: '$5-15M raised, scaling mode',
    fundingRaised: 10000000,
    shareholders: [
      {
        id: '1',
        name: 'John Smith (Founder)',
        type: 'founder',
        shares: 2880000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '2',
        name: 'Jane Doe (Founder)',
        type: 'founder',
        shares: 2880000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '3',
        name: 'Series A Investor',
        type: 'investor',
        shares: 2000000,
      },
      {
        id: '4',
        name: 'Series B Investor',
        type: 'investor',
        shares: 3000000,
      },
      {
        id: '5',
        name: 'Employee Stock Option Pool',
        type: 'option_pool',
        shares: 2240000,
      },
    ],
  },
  seriesC: {
    id: 'seriesC',
    name: 'Series C',
    description: '$15M+ raised, late stage',
    fundingRaised: 25000000,
    shareholders: [
      {
        id: '1',
        name: 'John Smith (Founder)',
        type: 'founder',
        shares: 2000000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '2',
        name: 'Jane Doe (Founder)',
        type: 'founder',
        shares: 2000000,
        vestingStart: '2024-01-01',
        vestingCliff: 12,
        vestingPeriod: 48,
      },
      {
        id: '3',
        name: 'Series A Investor',
        type: 'investor',
        shares: 2000000,
      },
      {
        id: '4',
        name: 'Series B Investor',
        type: 'investor',
        shares: 3000000,
      },
      {
        id: '6',
        name: 'Series C Investor',
        type: 'investor',
        shares: 3500000,
      },
      {
        id: '5',
        name: 'Employee Stock Option Pool',
        type: 'option_pool',
        shares: 2500000,
      },
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth Stage',
    description: 'Multiple rounds, 100M+ valuation',
    fundingRaised: 50000000,
    shareholders: [
      {
        id: '1',
        name: 'John Smith (Founder)',
        type: 'founder',
        shares: 1200000,
      },
      {
        id: '2',
        name: 'Jane Doe (Founder)',
        type: 'founder',
        shares: 1200000,
      },
      {
        id: '3',
        name: 'Series A Investor',
        type: 'investor',
        shares: 2000000,
      },
      {
        id: '4',
        name: 'Series B Investor',
        type: 'investor',
        shares: 3000000,
      },
      {
        id: '6',
        name: 'Series C Investor',
        type: 'investor',
        shares: 3500000,
      },
      {
        id: '7',
        name: 'Growth Investor',
        type: 'investor',
        shares: 2500000,
      },
      {
        id: '5',
        name: 'Employee Stock Option Pool',
        type: 'option_pool',
        shares: 2600000,
      },
    ],
  },
  preIPO: {
    id: 'preIPO',
    name: 'Pre-IPO',
    description: 'Preparing for public markets',
    fundingRaised: 75000000,
    shareholders: [
      {
        id: '1',
        name: 'John Smith (Founder)',
        type: 'founder',
        shares: 800000,
      },
      {
        id: '2',
        name: 'Jane Doe (Founder)',
        type: 'founder',
        shares: 800000,
      },
      {
        id: '3',
        name: 'Series A Investor',
        type: 'investor',
        shares: 2000000,
      },
      {
        id: '4',
        name: 'Series B Investor',
        type: 'investor',
        shares: 3000000,
      },
      {
        id: '6',
        name: 'Series C Investor',
        type: 'investor',
        shares: 3500000,
      },
      {
        id: '7',
        name: 'Growth Investor',
        type: 'investor',
        shares: 2500000,
      },
      {
        id: '8',
        name: 'Pre-IPO Investor',
        type: 'investor',
        shares: 2000000,
      },
      {
        id: '5',
        name: 'Employee Stock Option Pool',
        type: 'option_pool',
        shares: 1400000,
      },
    ],
  },
}

export default function TrialCapTableSetupPage() {
  const router = useRouter()
  const company = useAppStore((s) => s.company)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedStage, setSelectedStage] = useState<string>('seed')
  const [shareholders, setShareholders] = useState<Shareholder[]>(FUNDING_STAGES.seed.shareholders)

  const currentStage = FUNDING_STAGES[selectedStage]
  const totalShares = useMemo(() => shareholders.reduce((sum, s) => sum + s.shares, 0), [shareholders])
  const fullyDiluted = useMemo(() => totalShares * 1.2, [totalShares])

  const ownershipData = useMemo(
    () =>
      shareholders.map((s) => ({
        ...s,
        basicOwnership: totalShares > 0 ? (s.shares / totalShares) * 100 : 0,
        dilutedOwnership: fullyDiluted > 0 ? (s.shares / fullyDiluted) * 100 : 0,
      })),
    [shareholders, totalShares, fullyDiluted]
  )

  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId)
    const stage = FUNDING_STAGES[stageId]
    setShareholders(stage.shareholders)
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3)
    }
  }

  const handleUpgrade = () => {
    window.location.href = '/api/checkout?is_trial_upgrade=true'
  }

  const handleTemplates = () => {
    router.push('/templates/cap-tables')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Cap Table Setup Wizard</h1>
          <p className="text-slate-600">Create your trial cap table in 3 simple steps</p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((num) => (
            <motion.div key={num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= num
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
              {num < 3 && (
                <div
                  className={`w-8 h-1 mx-1 transition-all ${
                    step > num ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-6 border border-slate-200"
        >
          {/* STEP 1: Funding Stage Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 1: Select Your Funding Stage</h2>
              <p className="text-slate-600 mb-6">
                Choose the funding stage that best describes your company. We'll generate a realistic sample cap table for that stage.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(FUNDING_STAGES).map((stage) => (
                  <motion.button
                    key={stage.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStageSelect(stage.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedStage === stage.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 mb-1">{stage.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{stage.description}</p>
                    <p className="text-xs text-blue-600 font-semibold">
                      ${(stage.fundingRaised / 1000000).toFixed(1)}M raised
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Review Sample Cap Table */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 2: Review Your Sample Cap Table</h2>
              <p className="text-slate-600 mb-6">
                This is a realistic cap table for {currentStage.name} stage. You can edit values on the Growth plan.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Shareholder</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Shares</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Basic %</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Diluted %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownershipData.map((holder, idx) => (
                      <tr
                        key={holder.id}
                        className={`border-b border-slate-200 ${
                          idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-900 font-medium">{holder.name}</td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {(holder.shares / 1000000).toFixed(2)}M
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {holder.basicOwnership.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {holder.dilutedOwnership.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300 bg-slate-100 font-semibold">
                      <td className="py-3 px-4 text-slate-900">Total</td>
                      <td className="py-3 px-4 text-right text-slate-900">
                        {(totalShares / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900">100.00%</td>
                      <td className="py-3 px-4 text-right text-slate-900">
                        {((totalShares / fullyDiluted) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Fully Diluted:</strong> Includes {(fullyDiluted / 1000000).toFixed(2)}M total shares (assumes 20% option pool)
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Reveal & CTA */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Cap Table is Ready!</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-center justify-center"
                >
                  <LazyPieChart
                    data={ownershipData.map((d) => ({
                      name: d.name.split('(')[0].trim(),
                      value: parseFloat(d.dilutedOwnership.toFixed(2)),
                    }))}
                  />
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Funding Stage</p>
                    <p className="text-xl font-bold text-slate-900">{currentStage.name}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-semibold mb-1">Total Capitalization</p>
                    <p className="text-xl font-bold text-slate-900">{(totalShares / 1000000).toFixed(2)}M shares</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 uppercase font-semibold mb-1">Fully Diluted</p>
                    <p className="text-xl font-bold text-slate-900">{(fullyDiluted / 1000000).toFixed(2)}M shares</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600 uppercase font-semibold mb-1">Founder Stake</p>
                    <p className="text-xl font-bold text-slate-900">
                      {(
                        (ownershipData
                          .filter((d) => d.type === 'founder')
                          .reduce((sum, d) => sum + d.dilutedOwnership, 0) /
                          ownershipData.length) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Unlock Full Analysis & Modeling</h3>
                <p className="text-slate-600 mb-6">
                  Upgrade to Growth to edit your cap table, model scenarios, and analyze dilution across funding rounds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpgrade}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
                  >
                    Upgrade to Growth - $299/mo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTemplates}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Try Templates
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={step > 1 ? { scale: 1.05 } : {}}
            whileTap={step > 1 ? { scale: 0.95 } : {}}
            disabled={step === 1}
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
              step > 1
                ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </motion.button>

          <span className="text-sm text-slate-600 font-medium">
            Step {step} of 3
          </span>

          <motion.button
            whileHover={step < 3 ? { scale: 1.05 } : {}}
            whileTap={step < 3 ? { scale: 0.95 } : {}}
            disabled={step === 3}
            onClick={handleNext}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
              step < 3
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
