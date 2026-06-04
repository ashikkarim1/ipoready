'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, AlertTriangle, RefreshCw, Download, Clock, Settings } from 'lucide-react'
import { ReconciliationHeatmap } from './ReconciliationHeatmap'
import { ReconciliationRadar } from './ReconciliationRadar'
import { MismatchDetailView } from './MismatchDetailView'
import { ReconciliationTrendView } from './ReconciliationTrendView'
import { ReconciliationStats } from './ReconciliationStats'

export interface MetricAlignment {
  metricId: string
  metric: string
  pace_value: string | number
  financial_value: string | number
  prospectus_value: string | number
  cap_table_value: string | number
  status: 'aligned' | 'needs_review' | 'critical'
  variance_percent: number
  isExplained: boolean
  explanation?: string
  lastUpdated?: Date
}

export interface ReconciliationIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  metric: string
  source1: string
  source2: string
  value1: string | number
  value2: string | number
  variance: number
  impact: string
  suggestedFix: string
}

export interface AlertRule {
  metric: string
  max_variance_percent: number
  enabled: boolean
}

interface ReconciliationDashboardProps {
  metrics?: MetricAlignment[]
  issues?: ReconciliationIssue[]
  rules?: AlertRule[]
  onRefresh?: () => void
  onExportPDF?: () => void
  autoRefreshInterval?: number
}

export function ReconciliationDashboard({
  metrics = DEFAULT_METRICS,
  issues = DEFAULT_ISSUES,
  rules = DEFAULT_RULES,
  onRefresh,
  onExportPDF,
  autoRefreshInterval = 300000, // 5 minutes
}: ReconciliationDashboardProps) {
  const [selectedCell, setSelectedCell] = useState<{ metric: string; sources: string[] } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date())
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)

  // Calculate summary statistics
  const stats = useMemo(() => {
    const aligned = metrics.filter(m => m.status === 'aligned').length
    const needsReview = metrics.filter(m => m.status === 'needs_review').length
    const critical = metrics.filter(m => m.status === 'critical').length
    return { aligned, needsReview, critical }
  }, [metrics])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
      setLastRefreshTime(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCellClick = (metric: string) => {
    setSelectedCell({
      metric,
      sources: ['PACE', 'Financials', 'Prospectus', 'Cap Table'],
    })
  }

  const selectedMetric = selectedCell
    ? metrics.find(m => m.metric === selectedCell.metric)
    : null

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Reconciliation Check
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Data alignment across PACE, Financials, Prospectus, and Cap Table
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Now
          </motion.button>

          {onExportPDF && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefreshEnabled
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
            }`}
          >
            <Settings className="h-4 w-4" />
            Auto: {autoRefreshEnabled ? 'On' : 'Off'}
          </motion.button>
        </div>
      </div>

      {/* Last Refresh Info */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Clock className="h-4 w-4" />
        <span>Last checked: {formatTimeAgo(lastRefreshTime)}</span>
        {autoRefreshEnabled && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            Auto-refreshing every {autoRefreshInterval / 60000} minutes
          </span>
        )}
      </div>

      {/* Summary Statistics */}
      <ReconciliationStats stats={stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap (takes 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Alignment Heatmap
            </h2>
            <ReconciliationHeatmap
              metrics={metrics}
              onCellClick={handleCellClick}
            />
          </motion.div>
        </div>

        {/* Radar Chart (1 column) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Completeness Radar
          </h2>
          <ReconciliationRadar metrics={metrics} />
        </motion.div>
      </div>

      {/* Detail Mismatch View (Modal) */}
      <AnimatePresence>
        {selectedMetric && selectedCell && (
          <MismatchDetailView
            metric={selectedMetric}
            onClose={() => setSelectedCell(null)}
            onUpdate={handleRefresh}
          />
        )}
      </AnimatePresence>

      {/* Trend View */}
      <ReconciliationTrendView lastRefreshTime={lastRefreshTime} />

      {/* Issues Summary */}
      {issues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Issues & Recommendations
          </h2>
          <div className="space-y-4">
            {issues.map(issue => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-l-4 ${
                  issue.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : issue.severity === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {issue.metric} Mismatch
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {issue.source1}: {issue.value1} vs {issue.source2}: {issue.value2}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Impact: {issue.impact}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Suggested: {issue.suggestedFix}
                    </p>
                  </div>
                  {issue.severity === 'critical' && (
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Validation Rules Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
      >
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Validation Rules Active
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules
            .filter(r => r.enabled)
            .map(rule => (
              <div
                key={rule.metric}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-800"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {rule.metric}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                  ±{rule.max_variance_percent}%
                </span>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

// Default mock data
const DEFAULT_METRICS: MetricAlignment[] = [
  {
    metricId: '1',
    metric: 'Revenue',
    pace_value: '$45.2M',
    financial_value: '$45.1M',
    prospectus_value: '$45M+',
    cap_table_value: 'N/A',
    status: 'aligned',
    variance_percent: 0.22,
    isExplained: false,
  },
  {
    metricId: '2',
    metric: 'Growth%',
    pace_value: '15% YoY',
    financial_value: '12% YoY',
    prospectus_value: 'High growth',
    cap_table_value: 'N/A',
    status: 'needs_review',
    variance_percent: 3,
    isExplained: false,
  },
  {
    metricId: '3',
    metric: 'Margins',
    pace_value: '35%',
    financial_value: '32%',
    prospectus_value: '35%+',
    cap_table_value: 'N/A',
    status: 'needs_review',
    variance_percent: 3,
    isExplained: false,
  },
  {
    metricId: '4',
    metric: 'Headcount',
    pace_value: '125',
    financial_value: '125',
    prospectus_value: '130 (proj)',
    cap_table_value: '125',
    status: 'aligned',
    variance_percent: 0,
    isExplained: false,
  },
  {
    metricId: '5',
    metric: 'Runway',
    pace_value: '18 months',
    financial_value: '16 months',
    prospectus_value: '18+ months',
    cap_table_value: 'N/A',
    status: 'critical',
    variance_percent: 12,
    isExplained: false,
  },
  {
    metricId: '6',
    metric: 'Burn Rate',
    pace_value: '$250K/month',
    financial_value: '$280K/month',
    prospectus_value: '$250K/month',
    cap_table_value: 'N/A',
    status: 'needs_review',
    variance_percent: 12,
    isExplained: false,
  },
  {
    metricId: '7',
    metric: 'Unit Economics',
    pace_value: 'LTV:$8K CAC:$1.2K',
    financial_value: 'LTV:$7.5K CAC:$1.2K',
    prospectus_value: 'Strong unit eco',
    cap_table_value: 'N/A',
    status: 'needs_review',
    variance_percent: 6.67,
    isExplained: false,
  },
  {
    metricId: '8',
    metric: 'Customer Count',
    pace_value: '450',
    financial_value: '450',
    prospectus_value: '450+',
    cap_table_value: 'N/A',
    status: 'aligned',
    variance_percent: 0,
    isExplained: false,
  },
]

const DEFAULT_ISSUES: ReconciliationIssue[] = [
  {
    id: '1',
    severity: 'critical',
    metric: 'Runway',
    source1: 'PACE',
    source2: 'Financials',
    value1: '18 months',
    value2: '16 months',
    variance: 12,
    impact: '2-month discrepancy could affect credibility with investors',
    suggestedFix: 'Update burn rate assumptions in Financials to align with PACE projections',
  },
  {
    id: '2',
    severity: 'warning',
    metric: 'Growth Rate',
    source1: 'PACE',
    source2: 'Financials',
    value1: '15% YoY',
    value2: '12% YoY',
    variance: 3,
    impact: 'Difference of 3% could affect valuation by ~$5M',
    suggestedFix: 'Review Q1 actuals and update growth trajectory',
  },
  {
    id: '3',
    severity: 'warning',
    metric: 'Burn Rate',
    source1: 'PACE',
    source2: 'Financials',
    value1: '$250K/month',
    value2: '$280K/month',
    variance: 12,
    impact: 'Higher burn rate impacts runway calculations',
    suggestedFix: 'Reconcile Q1 expense actuals and verify budget allocations',
  },
]

const DEFAULT_RULES: AlertRule[] = [
  { metric: 'Revenue', max_variance_percent: 5, enabled: true },
  { metric: 'Growth %', max_variance_percent: 2, enabled: true },
  { metric: 'Headcount', max_variance_percent: 0, enabled: true },
  { metric: 'Burn Rate', max_variance_percent: 10, enabled: true },
  { metric: 'Runway', max_variance_percent: 5, enabled: true },
  { metric: 'Unit Economics', max_variance_percent: 8, enabled: true },
]
