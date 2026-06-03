'use client'

import { useState } from 'react'
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 LineChart,
 Line,
 PieChart,
 Pie,
 Cell,
} from 'recharts'
import {
 Loader2,
 AlertCircle,
 Download,
 TrendingDown,
 Users,
 Zap,
 ArrowRight,
} from 'lucide-react'

interface CapTableShareholder {
 name: string
 shares: number
}

interface CapTableSnapshot {
 totalShares: number
 shareholders: CapTableShareholder[]
}

interface ScenarioParams {
 newRaiseAmount: number
 pricePerShare: number
 newOptionsPool: number
 splitRatio?: number
}

interface DilutionScenario {
 name: string
 description: string
 params: ScenarioParams
 before: CapTableSnapshot
 after: CapTableSnapshot
 metrics: {
 totalDilution: number
 averageDilution: number
 newShares: number
 totalSharesIssued: number
 }
}

// Default cap table (pre-IPO state)
const DEFAULT_CAP_TABLE: CapTableSnapshot = {
 totalShares: 50000000,
 shareholders: [
 { name: 'Founder A', shares: 15000000 },
 { name: 'Founder B', shares: 12000000 },
 { name: 'Series A VC', shares: 10000000 },
 { name: 'Series B VC', shares: 8000000 },
 { name: 'Employee Pool', shares: 5000000 },
 ],
}

// Helper functions
function calculateOwnershipPercent(shares: number, totalShares: number): number {
 return (shares / totalShares) * 100
}

function applyScenario(
 currentCapTable: CapTableSnapshot,
 params: ScenarioParams
): { newCapTable: CapTableSnapshot; newShares: number } {
 let shareholders = [...currentCapTable.shareholders]
 let totalShares = currentCapTable.totalShares

 // Calculate shares from new raise
 const newRaiseShares = Math.round(params.newRaiseAmount / params.pricePerShare)
 const newInvestor = { name: 'Series C VC', shares: newRaiseShares }

 // Add new shareholder
 shareholders.push(newInvestor)

 // Add new options pool
 if (params.newOptionsPool > 0) {
 shareholders.push({
 name: 'New Options Pool',
 shares: params.newOptionsPool,
 })
 }

 totalShares = currentCapTable.totalShares + newRaiseShares + params.newOptionsPool

 return {
 newCapTable: { totalShares, shareholders },
 newShares: newRaiseShares + params.newOptionsPool,
 }
}

function generateScenarios(): DilutionScenario[] {
 // Scenario 1: Conservative Raise
 const scenario1Params = {
 newRaiseAmount: 50000000,
 pricePerShare: 25,
 newOptionsPool: 1500000,
 }
 const scenario1After = applyScenario(DEFAULT_CAP_TABLE, scenario1Params)
 const scenario1Before = DEFAULT_CAP_TABLE.shareholders.map((s) => ({
 name: s.name,
 beforePct: calculateOwnershipPercent(s.shares, DEFAULT_CAP_TABLE.totalShares),
 afterPct: calculateOwnershipPercent(
 s.shares,
 scenario1After.newCapTable.totalShares
 ),
 beforeShares: s.shares,
 afterShares: s.shares,
 }))

 // Scenario 2: Aggressive Raise + Split
 const scenario2Params = {
 newRaiseAmount: 100000000,
 pricePerShare: 30,
 newOptionsPool: 3000000,
 splitRatio: 2,
 }
 const scenario2After = applyScenario(DEFAULT_CAP_TABLE, scenario2Params)
 const scenario2Before = DEFAULT_CAP_TABLE.shareholders.map((s) => ({
 name: s.name,
 beforePct: calculateOwnershipPercent(s.shares, DEFAULT_CAP_TABLE.totalShares),
 afterPct: calculateOwnershipPercent(
 s.shares,
 scenario2After.newCapTable.totalShares
 ),
 beforeShares: s.shares,
 afterShares: s.shares,
 }))

 // Scenario 3: Growth + New Employee Pool
 const scenario3Params = {
 newRaiseAmount: 75000000,
 pricePerShare: 28,
 newOptionsPool: 2500000,
 }
 const scenario3After = applyScenario(DEFAULT_CAP_TABLE, scenario3Params)
 const scenario3Before = DEFAULT_CAP_TABLE.shareholders.map((s) => ({
 name: s.name,
 beforePct: calculateOwnershipPercent(s.shares, DEFAULT_CAP_TABLE.totalShares),
 afterPct: calculateOwnershipPercent(
 s.shares,
 scenario3After.newCapTable.totalShares
 ),
 beforeShares: s.shares,
 afterShares: s.shares,
 }))

 return [
 {
 name: 'Conservative Raise',
 description: '$50M raise at $25/share with 1.5M new options',
 params: scenario1Params,
 before: DEFAULT_CAP_TABLE,
 after: scenario1After.newCapTable,
 metrics: {
 totalDilution:
 (scenario1After.newShares / scenario1After.newCapTable.totalShares) *
 100,
 averageDilution: 0,
 newShares: scenario1After.newShares,
 totalSharesIssued: scenario1After.newCapTable.totalShares,
 },
 },
 {
 name: 'Aggressive Raise',
 description: '$100M raise at $30/share with 3M new options',
 params: scenario2Params,
 before: DEFAULT_CAP_TABLE,
 after: scenario2After.newCapTable,
 metrics: {
 totalDilution:
 (scenario2After.newShares / scenario2After.newCapTable.totalShares) *
 100,
 averageDilution: 0,
 newShares: scenario2After.newShares,
 totalSharesIssued: scenario2After.newCapTable.totalShares,
 },
 },
 {
 name: 'Growth + Equity',
 description: '$75M raise at $28/share with 2.5M growth pool',
 params: scenario3Params,
 before: DEFAULT_CAP_TABLE,
 after: scenario3After.newCapTable,
 metrics: {
 totalDilution:
 (scenario3After.newShares / scenario3After.newCapTable.totalShares) *
 100,
 averageDilution: 0,
 newShares: scenario3After.newShares,
 totalSharesIssued: scenario3After.newCapTable.totalShares,
 },
 },
 ]
}


function ScenarioCard({
 scenario,
 isSelected,
 onSelect,
}: {
 scenario: DilutionScenario
 isSelected: boolean
 onSelect: () => void
}) {
 return (
 <button
 onClick={onSelect}
 className={`p-6 rounded-lg border-2 transition text-left w-full ${
 isSelected
 ? 'border-blue-500 bg-blue-50'
 : 'border-slate-200 bg-white hover:border-blue-300'
 }`}
 >
 <h3 className="font-bold text-slate-900 mb-2">
 {scenario.name}
 </h3>
 <p className="body-sm text-slate-600 mb-3">
 {scenario.description}
 </p>
 <div className="flex items-center justify-between pt-3 border-t border-slate-200">
 <span className="label-sm font-medium text-slate-700">
 Dilution: {scenario.metrics.totalDilution.toFixed(1)}%
 </span>
 <span className="label-sm font-medium text-blue-600">
 {(scenario.metrics.newShares / 1000000).toFixed(1)}M new shares
 </span>
 </div>
 </button>
 )
}

function ComparisonTable({
 before,
 after,
 scenario,
}: {
 before: CapTableSnapshot
 after: CapTableSnapshot
 scenario: DilutionScenario
}) {
 const comparisonData = before.shareholders.map((shareholder) => {
 const beforeShares = shareholder.shares
 const beforePct = calculateOwnershipPercent(beforeShares, before.totalShares)
 const afterPct = calculateOwnershipPercent(beforeShares, after.totalShares)
 const dilution = beforePct - afterPct

 return {
 name: shareholder.name,
 beforeShares,
 beforePct,
 afterPct,
 dilution,
 }
 })

 // Add new shareholders
 const newShareholders = after.shareholders.filter(
 (s) => !before.shareholders.find((bs) => bs.name === s.name)
 )
 newShareholders.forEach((shareholder) => {
 comparisonData.push({
 name: shareholder.name,
 beforeShares: 0,
 beforePct: 0,
 afterPct: calculateOwnershipPercent(shareholder.shares, after.totalShares),
 dilution: 0,
 })
 })

 return (
 <div className="overflow-x-auto">
 <table className="w-full body-sm">
 <thead>
 <tr className="border-b border-slate-200">
 <th className="text-left py-3 px-4 font-semibold text-slate-700">
 Shareholder
 </th>
 <th className="text-right py-3 px-4 font-semibold text-slate-700">
 Pre-Raise Shares
 </th>
 <th className="text-right py-3 px-4 font-semibold text-slate-700">
 Pre-Raise %
 </th>
 <th className="text-right py-3 px-4 font-semibold text-slate-700">
 Post-Raise %
 </th>
 <th className="text-right py-3 px-4 font-semibold text-slate-700">
 Dilution %
 </th>
 </tr>
 </thead>
 <tbody>
 {comparisonData.map((row, idx) => (
 <tr
 key={idx}
 className="border-b border-slate-100 hover:bg-slate-50"
 >
 <td className="py-3 px-4 text-slate-900 font-medium">
 {row.name}
 </td>
 <td className="text-right py-3 px-4 text-slate-900 tabular-nums">
 {(row.beforeShares / 1000000).toFixed(2)}M
 </td>
 <td className="text-right py-3 px-4 text-slate-900 tabular-nums font-medium">
 {row.beforePct.toFixed(2)}%
 </td>
 <td className="text-right py-3 px-4 text-slate-900 tabular-nums font-medium">
 {row.afterPct.toFixed(2)}%
 </td>
 <td
 className={`text-right py-3 px-4 tabular-nums font-semibold ${
 row.dilution > 0
 ? 'text-red-600'
 : 'text-green-600'
 }`}
 >
 {row.dilution.toFixed(2)}%
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )
}

function OwnershipChart({
 before,
 after,
}: {
 before: CapTableSnapshot
 after: CapTableSnapshot
}) {
 const beforeData = before.shareholders.map((s) => ({
 name: s.name,
 value: calculateOwnershipPercent(s.shares, before.totalShares),
 shares: s.shares,
 }))

 const afterData = after.shareholders.map((s) => ({
 name: s.name,
 value: calculateOwnershipPercent(s.shares, after.totalShares),
 shares: s.shares,
 }))

 const COLORS = [
 '#3b82f6',
 '#ef4444',
 '#10b981',
 '#f59e0b',
 '#8b5cf6',
 '#06b6d4',
 '#ec4899',
 ]

 return (
 <div className="grid grid-cols-2 gap-8">
 <div>
 <h3 className="h4 font-bold text-slate-900 mb-4">
 Before Raise
 </h3>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={beforeData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {beforeData.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={COLORS[index % COLORS.length]}
 />
 ))}
 </Pie>
 <Tooltip
 formatter={(value) => `${(value as number).toFixed(2)}%`}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>

 <div>
 <h3 className="h4 font-bold text-slate-900 mb-4">
 After Raise
 </h3>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={afterData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {afterData.map((entry, index) => (
 <Cell
 key={`cell-${index}`}
 fill={COLORS[index % COLORS.length]}
 />
 ))}
 </Pie>
 <Tooltip
 formatter={(value) => `${(value as number).toFixed(2)}%`}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 )
}

function ShareCountChart({
 before,
 after,
}: {
 before: CapTableSnapshot
 after: CapTableSnapshot
}) {
 const chartData = before.shareholders.map((s) => {
 const afterShareHolder = after.shareholders.find((as) => as.name === s.name)
 return {
 name: s.name,
 before: s.shares / 1000000,
 after: (afterShareHolder?.shares || s.shares) / 1000000,
 }
 })

 // Add new shareholders to chart
 const newShareholders = after.shareholders.filter(
 (s) => !before.shareholders.find((bs) => bs.name === s.name)
 )
 newShareholders.forEach((s) => {
 chartData.push({
 name: s.name,
 before: 0,
 after: s.shares / 1000000,
 })
 })

 return (
 <div>
 <h3 className="h4 font-bold text-slate-900 mb-4">
 Share Count Comparison
 </h3>
 <ResponsiveContainer width="100%" height={400}>
 <BarChart
 data={chartData}
 margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis
 dataKey="name"
 angle={-45}
 textAnchor="end"
 height={100}
 tick={{ fontSize: 12 }}
 />
 <YAxis label={{ value: 'Shares (Millions)', angle: -90, position: 'insideLeft' }} />
 <Tooltip
 formatter={(value) => `${(value as number).toFixed(2)}M shares`}
 />
 <Legend />
 <Bar dataKey="before" fill="#94a3b8" name="Pre-Raise" />
 <Bar dataKey="after" fill="#3b82f6" name="Post-Raise" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )
}

function OwnershipPercentageChart({
 before,
 after,
}: {
 before: CapTableSnapshot
 after: CapTableSnapshot
}) {
 const chartData = before.shareholders.map((s) => {
 const beforePct = calculateOwnershipPercent(s.shares, before.totalShares)
 const afterPct = calculateOwnershipPercent(s.shares, after.totalShares)
 return {
 name: s.name,
 before: parseFloat(beforePct.toFixed(2)),
 after: parseFloat(afterPct.toFixed(2)),
 dilution: parseFloat((beforePct - afterPct).toFixed(2)),
 }
 })

 return (
 <div>
 <h3 className="h4 font-bold text-slate-900 mb-4">
 Ownership % Dilution
 </h3>
 <ResponsiveContainer width="100%" height={400}>
 <BarChart
 data={chartData}
 margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis
 dataKey="name"
 angle={-45}
 textAnchor="end"
 height={100}
 tick={{ fontSize: 12 }}
 />
 <YAxis label={{ value: 'Ownership %', angle: -90, position: 'insideLeft' }} />
 <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
 <Legend />
 <Bar dataKey="before" fill="#10b981" name="Pre-Raise %" />
 <Bar dataKey="after" fill="#ef4444" name="Post-Raise %" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 )
}

export function DilutionScenariosComponent() {
 const [scenarios] = useState<DilutionScenario[]>(generateScenarios())
 const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0)
 const selectedScenario = scenarios[selectedScenarioIdx]

 const calculateAverageDilution = () => {
 let totalDilution = 0
 let count = 0
 selectedScenario.before.shareholders.forEach((s) => {
 const beforePct = calculateOwnershipPercent(
 s.shares,
 selectedScenario.before.totalShares
 )
 const afterPct = calculateOwnershipPercent(
 s.shares,
 selectedScenario.after.totalShares
 )
 totalDilution += beforePct - afterPct
 count++
 })
 return totalDilution / count
 }

 return (
 <div className="space-y-8 p-6 bg-gradient-to-br from-white to-slate-50 rounded-lg">
 {/* Header */}
 <div>
 <h1 className="text-4xl font-bold text-slate-900 mb-2">
 Cap Table Dilution Scenarios
 </h1>
 <p className="text-slate-600">
 Model ownership impact under typical IPO financing rounds with
 pre/post comparison
 </p>
 </div>

 {/* Scenario Selection */}
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <h2 className="h4 font-bold text-slate-900 mb-4">
 Select Scenario
 </h2>
 <div className="grid grid-cols-3 gap-4">
 {scenarios.map((scenario, idx) => (
 <ScenarioCard
 key={idx}
 scenario={scenario}
 isSelected={selectedScenarioIdx === idx}
 onSelect={() => setSelectedScenarioIdx(idx)}
 />
 ))}
 </div>
 </div>

 {/* Scenario Details */}
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div>
 <p className="body-sm text-slate-600 mb-1">
 Raise Amount
 </p>
 <p className="text-2xl font-bold text-slate-900">
 ${(selectedScenario.params.newRaiseAmount / 1000000).toFixed(0)}M
 </p>
 </div>
 <div>
 <p className="body-sm text-slate-600 mb-1">
 Price per Share
 </p>
 <p className="text-2xl font-bold text-slate-900">
 ${selectedScenario.params.pricePerShare.toFixed(2)}
 </p>
 </div>
 <div>
 <p className="body-sm text-slate-600 mb-1">
 New Options Pool
 </p>
 <p className="text-2xl font-bold text-slate-900">
 {(selectedScenario.params.newOptionsPool / 1000000).toFixed(1)}M
 </p>
 </div>
 <div>
 <p className="body-sm text-slate-600 mb-1">
 Total New Shares
 </p>
 <p className="text-2xl font-bold text-blue-600">
 {(selectedScenario.metrics.newShares / 1000000).toFixed(1)}M
 </p>
 </div>
 </div>
 </div>

 {/* Key Metrics Cards */}
 <div className="grid grid-cols-3 gap-6">
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <div className="flex items-center justify-between mb-4">
 <h3 className="label font-medium text-slate-600">
 Total Dilution
 </h3>
 <TrendingDown className="h-5 w-5 text-orange-500" />
 </div>
 <p className="text-3xl font-bold text-slate-900">
 {selectedScenario.metrics.totalDilution.toFixed(2)}%
 </p>
 <p className="caption-sm text-slate-500 mt-2">
 New shares / total post-raise
 </p>
 </div>

 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <div className="flex items-center justify-between mb-4">
 <h3 className="label font-medium text-slate-600">
 Avg Shareholder Dilution
 </h3>
 <Users className="h-5 w-5 text-blue-500" />
 </div>
 <p className="text-3xl font-bold text-slate-900">
 {calculateAverageDilution().toFixed(2)}%
 </p>
 <p className="caption-sm text-slate-500 mt-2">
 Per existing shareholder
 </p>
 </div>

 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <div className="flex items-center justify-between mb-4">
 <h3 className="label font-medium text-slate-600">
 Post-Raise Cap
 </h3>
 <Zap className="h-5 w-5 text-green-500" />
 </div>
 <p className="text-3xl font-bold text-slate-900">
 {(selectedScenario.metrics.totalSharesIssued / 1000000).toFixed(1)}M
 </p>
 <p className="caption-sm text-slate-500 mt-2">
 Total shares issued
 </p>
 </div>
 </div>

 {/* Ownership Visualization */}
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <h2 className="text-2xl font-bold text-slate-900 mb-6">
 Ownership Distribution
 </h2>
 <OwnershipChart
 before={selectedScenario.before}
 after={selectedScenario.after}
 />
 </div>

 {/* Share Count Comparison */}
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <ShareCountChart
 before={selectedScenario.before}
 after={selectedScenario.after}
 />
 </div>

 {/* Ownership % Dilution Chart */}
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <OwnershipPercentageChart
 before={selectedScenario.before}
 after={selectedScenario.after}
 />
 </div>

 {/* Detailed Comparison Table */}
 <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
 <h2 className="text-2xl font-bold text-slate-900 mb-6">
 Detailed Ownership Analysis
 </h2>
 <ComparisonTable
 before={selectedScenario.before}
 after={selectedScenario.after}
 scenario={selectedScenario}
 />
 </div>

 {/* Key Insights */}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
 <h3 className="font-bold text-blue-900 mb-3">
 Key Insights
 </h3>
 <ul className="space-y-2 body-sm text-blue-800">
 <li className="flex items-start gap-2">
 <span className="font-bold">•</span>
 <span>
 Existing shareholders experience {calculateAverageDilution().toFixed(2)}%
 average dilution from this financing round
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold">•</span>
 <span>
 New capital injection ({Math.round(selectedScenario.metrics.newShares / 1000000)}M shares) represents{' '}
 {selectedScenario.metrics.totalDilution.toFixed(1)}% of post-raise capitalization
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold">•</span>
 <span>
 After this round, the company will have{' '}
 {Math.round(selectedScenario.metrics.totalSharesIssued / 1000000)}M total shares
 outstanding
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold">•</span>
 <span>
 Options pool increased to {(selectedScenario.params.newOptionsPool / 1000000).toFixed(1)}M to attract
 new talent pre-IPO
 </span>
 </li>
 </ul>
 </div>
 </div>
 )
}
