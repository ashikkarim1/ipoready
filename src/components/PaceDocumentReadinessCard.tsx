'use client'

import { motion } from 'framer-motion'

interface DocumentStatus {
  name: string
  phase: string
  completionPercent: number
  status: 'not_started' | 'in_progress' | 'draft' | 'reviewed' | 'final'
  lastUpdated?: Date
  refreshNeeded?: boolean
}

interface PaceDocumentReadinessCardProps {
  documents?: DocumentStatus[]
}

const DEFAULT_DOCUMENTS: DocumentStatus[] = [
  {
    name: 'Articles of Incorporation',
    phase: 'Governance Setup',
    completionPercent: 100,
    status: 'final',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
  {
    name: 'By-laws and Corporate Policies',
    phase: 'Governance Setup',
    completionPercent: 85,
    status: 'reviewed',
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
  {
    name: 'Audited Financial Statements',
    phase: 'Financial Audit',
    completionPercent: 45,
    status: 'in_progress',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
  {
    name: 'Management Discussion & Analysis',
    phase: 'Document Preparation',
    completionPercent: 60,
    status: 'draft',
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    refreshNeeded: true,
  },
  {
    name: 'Risk Factors Disclosure',
    phase: 'Document Preparation',
    completionPercent: 70,
    status: 'reviewed',
    lastUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    refreshNeeded: true,
  },
  {
    name: 'Use of Proceeds Statement',
    phase: 'Financial Planning',
    completionPercent: 0,
    status: 'not_started',
    refreshNeeded: false,
  },
  {
    name: 'Capital Structure Documentation',
    phase: 'Equity Management',
    completionPercent: 55,
    status: 'draft',
    lastUpdated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
  {
    name: 'Business Description & Market Analysis',
    phase: 'Strategy',
    completionPercent: 75,
    status: 'reviewed',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
  {
    name: 'Executive Summary',
    phase: 'Document Preparation',
    completionPercent: 40,
    status: 'draft',
    lastUpdated: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    refreshNeeded: true,
  },
  {
    name: 'Underwriting Terms & Conditions',
    phase: 'Underwriter Engagement',
    completionPercent: 0,
    status: 'not_started',
    refreshNeeded: false,
  },
  {
    name: 'Legal Opinion Letters',
    phase: 'Legal Review',
    completionPercent: 30,
    status: 'in_progress',
    lastUpdated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
  {
    name: 'Regulatory Compliance Summary',
    phase: 'Regulatory Filing',
    completionPercent: 20,
    status: 'in_progress',
    lastUpdated: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    refreshNeeded: false,
  },
]

export function PaceDocumentReadinessCard({
  documents = DEFAULT_DOCUMENTS,
}: PaceDocumentReadinessCardProps) {
  const completedDocs = documents.filter((d) => d.status === 'final').length
  const inProgressDocs = documents.filter((d) => d.status !== 'final' && d.completionPercent > 0).length
  const notStartedDocs = documents.filter((d) => d.status === 'not_started').length
  const needsRefresh = documents.filter((d) => d.refreshNeeded).length

  const overallCompletion = Math.round(
    documents.reduce((sum, doc) => sum + doc.completionPercent, 0) / documents.length
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'bg-green-50 border-green-200'
      case 'reviewed':
        return 'bg-blue-50 border-blue-200'
      case 'draft':
        return 'bg-amber-50 border-amber-200'
      case 'in_progress':
        return 'bg-indigo-50 border-indigo-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'final':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Final' }
      case 'reviewed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reviewed' }
      case 'draft':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Draft' }
      case 'in_progress':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Started' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'final':
        return '✓'
      case 'reviewed':
        return '→'
      case 'draft':
        return '✎'
      case 'in_progress':
        return '⟳'
      default:
        return '○'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="rounded-lg border border-gray-200 p-6 bg-white"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Document Readiness</h3>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">{overallCompletion}% Complete</span>
        </div>
        <p className="text-sm text-gray-600">Track all required prospectus documents across phases</p>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${overallCompletion}%` }}
            transition={{ duration: 1, delay: 1.1 }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Final', count: completedDocs, color: 'bg-green-100 text-green-700' },
          { label: 'In Progress', count: inProgressDocs, color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Not Started', count: notStartedDocs, color: 'bg-gray-100 text-gray-700' },
          { label: 'Refresh Needed', count: needsRefresh, color: 'bg-orange-100 text-orange-700' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 1.15 }}
            className={`rounded-lg p-3 text-center ${stat.color}`}
          >
            <div className="text-xl font-bold">{stat.count}</div>
            <div className="text-xs font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {documents.map((doc, idx) => {
          const badge = getStatusBadge(doc.status)
          return (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1.2 + idx * 0.03 }}
              className={`rounded-lg border p-3 ${getStatusColor(doc.status)}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{doc.name}</h5>
                  <p className="text-xs text-gray-600">{doc.phase}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  {doc.refreshNeeded && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      🔄 Refresh
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{doc.completionPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-300/50 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        doc.status === 'final'
                          ? 'bg-green-500'
                          : doc.status === 'reviewed'
                            ? 'bg-blue-500'
                            : doc.status === 'draft'
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.completionPercent}%` }}
                      transition={{ duration: 0.8, delay: 1.25 + idx * 0.03 }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {doc.lastUpdated ? `Updated ${formatDate(doc.lastUpdated)}` : 'Not started'}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">⚠️ Action Needed:</span> {needsRefresh} documents need updates (last modified {'>'}30 days ago). Review and update to ensure prospectus accuracy.
        </p>
      </div>
    </motion.div>
  )
}
