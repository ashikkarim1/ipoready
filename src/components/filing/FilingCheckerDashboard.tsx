'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  FileText,
  Edit3,
  Upload,
  Copy,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts'

interface FilingIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  description: string
  requiredFix: string
  documentType?: string
  resolved?: boolean
}

interface MissingDocument {
  docType: string
  required: boolean
  hasTemplate: boolean
}

interface Section {
  name: string
  completeness: number
  issues: number
}

interface FilingCheckerDashboardProps {
  filingId: string
  exchangeId: string
  status: 'ready' | 'not_ready' | 'in_progress'
  completenessScore: number
  complianceScore: number
  qualityScore: number
  crossValidationScore: number
  issues: FilingIssue[]
  missingDocuments: MissingDocument[]
  sections: Section[]
  onResolveIssue?: (issueId: string) => void
  onExportPDF?: () => void
  onShareStatus?: () => void
  onReadyToFile?: () => void
  onViewFullReport?: () => void
}

export function FilingCheckerDashboard({
  filingId,
  exchangeId,
  status,
  completenessScore,
  complianceScore,
  qualityScore,
  crossValidationScore,
  issues,
  missingDocuments,
  sections,
  onResolveIssue = () => {},
  onExportPDF = () => {},
  onShareStatus = () => {},
  onReadyToFile = () => {},
  onViewFullReport = () => {},
}: FilingCheckerDashboardProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [resolvedIssues, setResolvedIssues] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Calculate real-time metrics
  const unResolvedIssuesCount = useMemo(() => {
    return issues.filter(i => !resolvedIssues.has(i.id)).length
  }, [issues, resolvedIssues])

  const criticalIssuesCount = useMemo(() => {
    return issues.filter(
      i => i.severity === 'critical' && !resolvedIssues.has(i.id)
    ).length
  }, [issues, resolvedIssues])

  const warningIssuesCount = useMemo(() => {
    return issues.filter(
      i => i.severity === 'warning' && !resolvedIssues.has(i.id)
    ).length
  }, [issues, resolvedIssues])

  const currentStatus = useMemo(() => {
    if (criticalIssuesCount > 0) return 'NOT READY'
    if (warningIssuesCount > 0) return 'IN PROGRESS'
    return 'READY'
  }, [criticalIssuesCount, warningIssuesCount])

  const statusColor = useMemo(() => {
    if (currentStatus === 'READY') return 'from-green-50 to-emerald-50 border-green-200'
    if (currentStatus === 'IN PROGRESS') return 'from-amber-50 to-yellow-50 border-amber-200'
    return 'from-red-50 to-rose-50 border-red-200'
  }, [currentStatus])

  const statusTextColor = useMemo(() => {
    if (currentStatus === 'READY') return 'text-green-900'
    if (currentStatus === 'IN PROGRESS') return 'text-amber-900'
    return 'text-red-900'
  }, [currentStatus])

  const statusIcon = useMemo(() => {
    if (currentStatus === 'READY') return <CheckCircle2 className="h-6 w-6 text-green-600" />
    if (currentStatus === 'IN PROGRESS')
      return <AlertTriangle className="h-6 w-6 text-amber-600" />
    return <AlertCircle className="h-6 w-6 text-red-600" />
  }, [currentStatus])

  // Calculate estimated time to ready
  const estimatedTimeToReady = useMemo(() => {
    if (currentStatus === 'READY') return '0 hours'
    const hoursPerIssue = 2
    const totalHours = unResolvedIssuesCount * hoursPerIssue
    if (totalHours < 24) return `${totalHours} hours`
    return `${Math.ceil(totalHours / 24)} days`
  }, [currentStatus, unResolvedIssuesCount])

  // Score data for charts
  const scoreData = [
    { name: 'Completeness', value: completenessScore },
    { name: 'Compliance', value: complianceScore },
    { name: 'Quality', value: qualityScore },
    { name: 'Cross-Valid', value: crossValidationScore },
  ]

  // Jurisdictions mapping
  const jurisdictionsMap: { [key: string]: string } = {
    CA: '🇨🇦 Canada (CSA)',
    US: '🇺🇸 United States (SEC)',
    UK: '🇬🇧 United Kingdom (FCA)',
    EU: '🇪🇺 European Union (ESMA)',
  }

  const jurisdictions = ['CA', 'US', 'UK', 'EU'].filter(j => {
    const hasRequirements = issues.some(i => i.category.includes(j))
    return hasRequirements
  })

  // Group issues by jurisdiction and severity
  const getIssuesForJurisdiction = (jur: string) => {
    return issues.filter(i => i.category.includes(jur))
  }

  const getSeverityIcon = (severity: FilingIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      default:
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />
    }
  }

  const toggleIssueExpanded = (issueId: string) => {
    const newExpanded = new Set(expandedIssues)
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId)
    } else {
      newExpanded.add(issueId)
    }
    setExpandedIssues(newExpanded)
  }

  const toggleIssueResolved = (issueId: string) => {
    const newResolved = new Set(resolvedIssues)
    if (newResolved.has(issueId)) {
      newResolved.delete(issueId)
    } else {
      newResolved.add(issueId)
    }
    setResolvedIssues(newResolved)
    onResolveIssue(issueId)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      onExportPDF()
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareStatus = async () => {
    setIsSharing(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      onShareStatus()
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-[#F7F6F4] dark:bg-gray-900 min-h-screen">
      {/* Top Status Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`bg-gradient-to-r ${statusColor} border-2 rounded-xl p-6 shadow-sm`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="mt-1">{statusIcon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-2xl font-bold ${statusTextColor}`}>{currentStatus}</h2>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  currentStatus === 'READY'
                    ? 'bg-green-100 text-green-800'
                    : currentStatus === 'IN PROGRESS'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {unResolvedIssuesCount} {unResolvedIssuesCount === 1 ? 'issue' : 'issues'}
                </span>
              </div>
              <p className={`text-sm ${statusTextColor}`}>
                Filing ID: {filingId} • Exchange: {exchangeId}
              </p>
              <p className={`text-xs opacity-75 ${statusTextColor} mt-1`}>
                Estimated time to ready: {estimatedTimeToReady}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${statusTextColor}`}>
              {Math.round(
                (completenessScore + complianceScore + qualityScore + crossValidationScore) / 4
              )}%
            </div>
            <p className={`text-xs ${statusTextColor}`}>Overall Score</p>
          </div>
        </div>
      </motion.div>

      {/* Quality Scores Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quality Scores</h3>

        {/* Horizontal Progress Bars */}
        <div className="space-y-4">
          {scoreData.map((item, idx) => {
            const getBarColor = (value: number) => {
              if (value >= 80) return 'from-green-500 to-emerald-500'
              if (value >= 60) return 'from-amber-500 to-yellow-500'
              return 'from-red-500 to-rose-500'
            }

            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {item.name}
                  </label>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * idx }}
                    className={`h-full bg-gradient-to-r ${getBarColor(item.value)}`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Score Chart */}
        <div className="mt-8 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6b7280' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {scoreData.map((entry, index) => {
                  const getColor = (value: number) => {
                    if (value >= 80) return '#10b981'
                    if (value >= 60) return '#f59e0b'
                    return '#ef4444'
                  }
                  return <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Regulatory Requirements by Jurisdiction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Regulatory Requirements
        </h3>

        <div className="space-y-4">
          {jurisdictions.map(jur => {
            const jurIssues = getIssuesForJurisdiction(jur)
            const resolvedCount = jurIssues.filter(i => resolvedIssues.has(i.id)).length

            return (
              <motion.div
                key={jur}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Jurisdiction Header */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{jurisdictionsMap[jur]?.split(' ')[0]}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {jurisdictionsMap[jur]?.replace(/🇪🇺 |🇨🇦 |🇺🇸 |🇬🇧 /, '')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {resolvedCount}/{jurIssues.length} requirements met
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(resolvedCount / jurIssues.length) * 100}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-green-500"
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">
                        {Math.round((resolvedCount / jurIssues.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {jurIssues.map((issue, idx) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <div
                          className={`p-4 transition-colors ${
                            resolvedIssues.has(issue.id)
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : 'bg-white dark:bg-gray-800'
                          } hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer`}
                        >
                          {/* Issue Header */}
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={resolvedIssues.has(issue.id)}
                              onChange={() => toggleIssueResolved(issue.id)}
                              className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            <button
                              onClick={() => toggleIssueExpanded(issue.id)}
                              className="flex-1 text-left focus:outline-none group"
                            >
                              <div className="flex items-start gap-3 justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getSeverityIcon(issue.severity)}
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {issue.description}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Category: {issue.category}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {expandedIssues.has(issue.id) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedIssues.has(issue.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 ml-8 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
                              >
                                {/* Issue Details */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                                    What needs to be fixed
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {issue.requiredFix}
                                  </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {issue.documentType && (
                                    <>
                                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                        <Upload className="h-4 w-4" />
                                        Upload {issue.documentType}
                                      </button>
                                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                                        <Copy className="h-4 w-4" />
                                        Use Template
                                      </button>
                                    </>
                                  )}
                                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <FileText className="h-4 w-4" />
                                    View Examples
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Sections Completeness */}
      {sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Section Completeness
          </h3>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {section.name}
                    </p>
                    {section.issues > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {section.issues} {section.issues === 1 ? 'issue' : 'issues'}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {section.completeness}%
                  </span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${section.completeness}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * idx }}
                    className={`h-full ${
                      section.completeness >= 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : section.completeness >= 60
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Next Action */}
      {unResolvedIssuesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
                Recommended Next Action
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                {criticalIssuesCount > 0
                  ? `Resolve ${criticalIssuesCount} critical issue${criticalIssuesCount > 1 ? 's' : ''} to unlock filing. Start with: ${issues.find(i => i.severity === 'critical' && !resolvedIssues.has(i.id))?.description || 'Filing requirements'}`
                  : `Complete remaining ${warningIssuesCount} item${warningIssuesCount > 1 ? 's' : ''} for optimal compliance.`}
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Edit3 className="h-4 w-4" />
                Start Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center"
      >
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PDF
          </button>

          <button
            onClick={handleShareStatus}
            disabled={isSharing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Share Status
          </button>

          <button
            onClick={onViewFullReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            View Full Report
          </button>
        </div>

        <button
          onClick={onReadyToFile}
          disabled={currentStatus !== 'READY'}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 justify-center whitespace-nowrap ${
            currentStatus === 'READY'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentStatus === 'READY' ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Ready to File
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              {unResolvedIssuesCount} Issues Remaining
            </>
          )}
        </button>
      </motion.div>

      {/* Audit Trail Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
          Audit Trail
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          All changes to filing status are logged and tracked for compliance. Detailed history available in full report.
        </p>
      </motion.div>
    </div>
  )
}
