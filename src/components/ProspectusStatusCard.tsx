'use client'

import { formatBillingDate } from '@/lib/billing-helpers'

export interface ProspectusSection {
  id: string
  name: string
  completionPercent: number
  status: 'not_started' | 'draft' | 'in_review' | 'final'
  approvalTier: 'ai' | 'admin' | 'professional'
  lastUpdated: Date
}

interface ProspectusStatusCardProps {
  section: ProspectusSection
}

export function ProspectusStatusCard({ section }: ProspectusStatusCardProps) {
  const getStatusIcon = () => {
    switch (section.status) {
      case 'not_started':
        return '○'
      case 'draft':
        return '◐'
      case 'in_review':
        return '⟳'
      case 'final':
        return '✓'
      default:
        return '○'
    }
  }

  const getStatusColor = () => {
    switch (section.status) {
      case 'not_started':
        return 'text-gray-500'
      case 'draft':
        return 'text-blue-600'
      case 'in_review':
        return 'text-amber-600'
      case 'final':
        return 'text-green-600'
      default:
        return 'text-gray-500'
    }
  }

  const getApprovalTierBadgeColor = () => {
    switch (section.approvalTier) {
      case 'ai':
        return 'bg-blue-100 text-blue-800'
      case 'admin':
        return 'bg-amber-100 text-amber-800'
      case 'professional':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getApprovalTierLabel = () => {
    switch (section.approvalTier) {
      case 'ai':
        return 'AI Draft'
      case 'admin':
        return 'Admin Approved'
      case 'professional':
        return 'Professional Review'
      default:
        return 'Unknown'
    }
  }

  const getTimeAgoText = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
    return formatBillingDate(date)
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl ${getStatusColor()}`}>{getStatusIcon()}</span>
            <div>
              <h4 className="font-semibold text-gray-900">{section.name}</h4>
              <p className="caption-sm text-gray-600">
                Last updated: {getTimeAgoText(section.lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getApprovalTierBadgeColor()}`}>
          {getApprovalTierLabel()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${section.completionPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="body-sm text-gray-600">
          {section.status === 'not_started' ? 'Not started' : `${Math.round(section.completionPercent)}% complete`}
        </p>
        <span className="label-sm font-medium text-gray-700">
          {section.status === 'final' ? 'Complete' : 'In progress'}
        </span>
      </div>
    </div>
  )
}
