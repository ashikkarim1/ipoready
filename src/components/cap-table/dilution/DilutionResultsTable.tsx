'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingDown,
  Users,
  PieChart,
} from 'lucide-react'

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

interface DilutionResultsTableProps {
  scenario: DilutionScenario
}

export default function DilutionResultsTable({
  scenario,
}: DilutionResultsTableProps) {
  // Sort shareholders by dilution impact (most diluted first)
  const sortedShareholders = [...scenario.shareholderImpact].sort(
    (a, b) => Number(b.dilutionPercentage) - Number(a.dilutionPercentage)
  )

  // Calculate statistics
  const totalDilution = sortedShareholders.reduce(
    (sum, sh) => sum + Number(sh.dilutionPercentage),
    0
  )

  const mostDiluted = sortedShareholders[0]
  const leastDiluted = sortedShareholders[sortedShareholders.length - 1]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      className="bg-white rounded-lg border border-slate-200 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-slate-200 bg-slate-50">
        <motion.div variants={itemVariants} className="bg-white rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-slate-600">Shareholders</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {scenario.shareholderImpact.length}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-medium text-slate-600">Avg Dilution</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {(totalDilution / scenario.shareholderImpact.length).toFixed(2)}%
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-slate-600">Most Diluted</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {mostDiluted ? Number(mostDiluted.dilutionPercentage).toFixed(2) : '0'}%
          </p>
          <p className="text-xs text-slate-500">
            {mostDiluted?.shareholderName}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-slate-600">Least Diluted</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {leastDiluted ? Number(leastDiluted.dilutionPercentage).toFixed(2) : '0'}%
          </p>
          <p className="text-xs text-slate-500">
            {leastDiluted?.shareholderName}
          </p>
        </motion.div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-900">
                Shareholder
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-900">
                Type
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-900">
                Current Shares
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-900">
                Current %
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-900">
                Post-Dilution Shares
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-900">
                Post-Dilution %
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-900">
                Dilution %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedShareholders.map((position, index) => {
              const dilutionPercent = Number(position.dilutionPercentage)
              const isHighDilution = dilutionPercent > 5
              const isModerateDilution = dilutionPercent > 2

              return (
                <motion.tr
                  key={position.shareholderId}
                  variants={itemVariants}
                  className={`hover:bg-slate-50 transition ${
                    isHighDilution ? 'bg-red-50' : isModerateDilution ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {position.shareholderName}
                    </p>
                    <p className="text-xs text-slate-500">{position.shareClass}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {position.shareholderType}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">
                    {Number(position.currentShares).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">
                    {Number(position.currentOwnership).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">
                    {Number(position.postDilutionShares).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-900 font-medium">
                    {Number(position.postDilutionOwnership).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        isHighDilution
                          ? 'bg-red-100 text-red-800'
                          : isModerateDilution
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {dilutionPercent.toFixed(2)}%
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-slate-600 mb-1">Assumptions Applied</p>
          <div className="space-y-1 text-slate-900">
            {!!scenario.assumptions.warrantsExercisedPercent && (
              <p>Warrants: {String(scenario.assumptions.warrantsExercisedPercent)}%</p>
            )}
            {!!scenario.assumptions.newFinancingAmount && (
              <p>
                New Financing: ${Number(scenario.assumptions.newFinancingAmount).toLocaleString()}
              </p>
            )}
            {!!scenario.assumptions.employeeOptionVestingShares && (
              <p>
                Options: {Number(scenario.assumptions.employeeOptionVestingShares).toLocaleString()} shares
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-slate-600 mb-1">Valuation Impact</p>
          <div className="space-y-1 text-slate-900">
            {!!scenario.assumptions.projectedValuation && (
              <p>
                Valuation: ${Number(scenario.assumptions.projectedValuation).toLocaleString()}
              </p>
            )}
            <p>
              Total Shares: {Number(scenario.postDilutionSnapshot.totalShares).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
