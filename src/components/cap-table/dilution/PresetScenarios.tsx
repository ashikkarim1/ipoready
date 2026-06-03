'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'

interface DilutionScenario {
  scenarioId: string
  scenarioName: string
  scenarioType: string
  currentSnapshot: {
    totalShares: string
    totalOwnershipPercentage: string
  }
  postDilutionSnapshot: {
    totalShares: string
    totalOwnershipPercentage: string
    newSharesIssued: string
  }
  shareholderImpact: Array<{
    shareholderId: string
    shareholderName: string
    shareholderType: string
    shareClass: string
    currentShares: string
    currentOwnership: string
    postDilutionShares: string
    postDilutionOwnership: string
    dilutionPercentage: string
    dollarImpact?: string
  }>
  assumptions: Record<string, unknown>
  createdAt: string
}

interface PresetScenariosProps {
  presets: {
    base: DilutionScenario
    optimistic: DilutionScenario
    conservative: DilutionScenario
  }
  onSelectScenario: (scenario: DilutionScenario) => void
}

export default function PresetScenarios({
  presets,
  onSelectScenario,
}: PresetScenariosProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 },
    },
  }

  const PresetCard = ({
    scenario,
    icon: Icon,
    color,
    description,
  }: {
    scenario: DilutionScenario
    icon: React.ReactNode
    color: string
    description: string
  }) => {
    const dilutionRate = (
      (Number(scenario.postDilutionSnapshot.newSharesIssued) /
        Number(scenario.postDilutionSnapshot.totalShares)) *
      100
    ).toFixed(2)

    const avgDilution = (
      scenario.shareholderImpact.reduce(
        (sum, sh) => sum + Number(sh.dilutionPercentage),
        0
      ) / scenario.shareholderImpact.length
    ).toFixed(2)

    return (
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        onClick={() => onSelectScenario(scenario)}
        className={`rounded-lg border-2 p-6 cursor-pointer transition ${color}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">{Icon}</div>
            <div>
              <h3 className="font-bold text-slate-900">
                {scenario.scenarioName}
              </h3>
              <p className="caption-sm text-slate-600">{description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="caption-sm text-slate-600">Dilution Rate</p>
              <p className="h4 font-bold text-slate-900">
                {dilutionRate}%
              </p>
            </div>
            <div>
              <p className="caption-sm text-slate-600">Avg Shareholder Dilution</p>
              <p className="h4 font-bold text-slate-900">
                {avgDilution}%
              </p>
            </div>
          </div>

          <div>
            <p className="caption-sm text-slate-600 mb-2">Key Assumptions</p>
            <div className="space-y-1 caption-sm text-slate-700 bg-white bg-opacity-50 rounded p-2">
              {!!scenario.assumptions.warrantsExercisedPercent && (
                <p>
                  Warrants: {String(scenario.assumptions.warrantsExercisedPercent)}%
                </p>
              )}
              {!!scenario.assumptions.newFinancingAmount && (
                <p>
                  Financing: ${Number(scenario.assumptions.newFinancingAmount).toLocaleString()}
                </p>
              )}
              {!!scenario.assumptions.projectedValuation && (
                <p>
                  Valuation: ${Number(scenario.assumptions.projectedValuation).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <button className="w-full mt-4 px-4 py-2 bg-white text-slate-900 rounded font-medium body-sm hover:bg-slate-50 transition">
          View Details
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-6"
    >
      <PresetCard
        scenario={presets.base}
        icon={<Zap className="w-6 h-6 text-amber-600" />}
        color="border-amber-200 bg-amber-50 hover:bg-amber-100"
        description="Balanced assumptions and mid-range outcomes"
      />

      <PresetCard
        scenario={presets.optimistic}
        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        color="border-green-200 bg-green-50 hover:bg-green-100"
        description="High warrant exercise, strong valuation"
      />

      <PresetCard
        scenario={presets.conservative}
        icon={<TrendingDown className="w-6 h-6 text-red-600" />}
        color="border-red-200 bg-red-50 hover:bg-red-100"
        description="Low warrant exercise, lower valuation"
      />
    </motion.div>
  )
}
