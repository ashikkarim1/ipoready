'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import { FeatureLockedOverlay } from '@/components/FeatureLockedOverlay'
import { canAccessFeature } from '@/lib/feature-gates'
import { useState } from 'react'

interface ProspectusItem {
  id: string
  name: string
  exchange: string
  completionPercent: number
  status: 'draft' | 'in_review' | 'complete'
  approvalTier: 'ai' | 'admin' | 'professional'
  createdAt: Date
  lastUpdated: Date
}

const MOCK_PROSPECTUSES: ProspectusItem[] = [
  {
    id: '1',
    name: 'TechCorp IPO S-1',
    exchange: 'SEC',
    completionPercent: 75,
    status: 'in_review',
    approvalTier: 'admin',
    createdAt: new Date('2026-05-15'),
    lastUpdated: new Date('2026-05-28'),
  },
  {
    id: '2',
    name: 'BioInnovate TSX Prospectus',
    exchange: 'TSX',
    completionPercent: 45,
    status: 'draft',
    approvalTier: 'ai',
    createdAt: new Date('2026-05-10'),
    lastUpdated: new Date('2026-05-25'),
  },
]

export default function ProspectusList() {
  const router = useRouter()
  const { data: session } = useSession()
  const subscription = useSubscription()
  const [showLockedOverlay, setShowLockedOverlay] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'in_review' | 'complete'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'completion' | 'name'>('recent')

  const canAccess = canAccessFeature(
    {
      subscription_plan: subscription.plan,
      subscription_status: subscription.status,
      trial_status: subscription.status === 'trialing' ? 'active' : null,
    },
    'prospectus_builder'
  )

  const filteredProspectuses = MOCK_PROSPECTUSES.filter((p) => {
    if (filterStatus === 'all') return true
    return p.status === filterStatus
  }).sort((a, b) => {
    if (sortBy === 'recent') return b.lastUpdated.getTime() - a.lastUpdated.getTime()
    if (sortBy === 'completion') return b.completionPercent - a.completionPercent
    return a.name.localeCompare(b.name)
  })

  const handleCreateClick = () => {
    if (!canAccess) {
      setShowLockedOverlay(true)
      return
    }
    router.push('/prospectus/create')
  }

  const handleEditClick = (id: string) => {
    router.push(`/prospectus/${id}/editor`)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-blue-100 text-blue-800'
      case 'in_review':
        return 'bg-amber-100 text-amber-800'
      case 'complete':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getApprovalTierColor = (tier: string) => {
    switch (tier) {
      case 'ai':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'admin':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'professional':
        return 'bg-green-50 text-green-700 border border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Feature Lock Overlay */}
      <FeatureLockedOverlay
        isOpen={showLockedOverlay && !canAccess}
        featureName="Prospectus Builder"
        requiredPlan="growth"
        currentPlan={subscription.plan}
        onClose={() => setShowLockedOverlay(false)}
        onUpgrade={() => {
          router.push('/checkout?plan=growth')
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospectus Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage your IPO prospectus documents</p>
        </div>

        <button
          onClick={handleCreateClick}
          disabled={!canAccess}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            canAccess
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Create New Prospectus
        </button>
      </div>

      {/* Filters and Sort */}
      {filteredProspectuses.length > 0 && (
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            {(['all', 'draft', 'in_review', 'complete'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status === 'in_review' ? 'In Review' : status === 'complete' ? 'Complete' : 'Draft'}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            <option value="recent">Newest First</option>
            <option value="completion">Completion %</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      )}

      {/* List View */}
      {filteredProspectuses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center bg-gray-50">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No prospectuses yet</h3>
          <p className="text-gray-600 mb-4">Create your first prospectus to get started</p>
          <button
            onClick={handleCreateClick}
            disabled={!canAccess}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              canAccess
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Prospectus
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProspectuses.map((prospectus) => (
            <div
              key={prospectus.id}
              className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow bg-white hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{prospectus.name}</h3>
                      <p className="text-sm text-gray-600">{prospectus.exchange} • Created {new Date(prospectus.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(prospectus.status)}`}>
                    {prospectus.status === 'in_review' ? 'In Review' : prospectus.status === 'complete' ? 'Complete' : 'Draft'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getApprovalTierColor(prospectus.approvalTier)}`}>
                    {prospectus.approvalTier === 'ai' ? 'AI Draft' : prospectus.approvalTier === 'admin' ? 'Admin' : 'Professional'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{prospectus.completionPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${prospectus.completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditClick(prospectus.id)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Download
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
