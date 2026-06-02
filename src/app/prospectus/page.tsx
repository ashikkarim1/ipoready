'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import { FeatureLockedOverlay } from '@/components/FeatureLockedOverlay'
import { canAccessFeature, type FeatureTier } from '@/lib/features'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, FileText, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react'

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
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<string | null>(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const tier: FeatureTier = subscription.status === 'trialing' ? 'trial' : subscription.plan
  const canAccess = canAccessFeature(tier, 'PROSPECTUS_BUILDER')

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

  const handleDownloadClick = async (prospectusId: string, format: 'pdf' | 'docx' | 'zip') => {
    setDownloadLoading(true)
    setDownloadError(null)
    setDownloadMenuOpen(null)

    try {
      const response = await fetch(`/api/prospectus/${prospectusId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const prospectus = MOCK_PROSPECTUSES.find(p => p.id === prospectusId)
      const fileName = `${prospectus?.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'zip'}`

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download prospectus'
      setDownloadError(message)
    } finally {
      setDownloadLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return { bg: '#EFF6FF', color: '#1D4ED8' }
      case 'in_review':
        return { bg: '#FEF3C7', color: '#B45309' }
      case 'complete':
        return { bg: '#EAF5F0', color: '#2D7A5F' }
      default:
        return { bg: '#F3F4F6', color: '#6B7280' }
    }
  }

  const getApprovalTierColor = (tier: string) => {
    switch (tier) {
      case 'ai':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }
      case 'admin':
        return { bg: '#FEF3C7', color: '#B45309', border: '#FCD34D' }
      case 'professional':
        return { bg: '#EAF5F0', color: '#2D7A5F', border: '#86EFAC' }
      default:
        return { bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB' }
    }
  }

  // Show loading state while subscription data is being fetched
  if (subscription.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F7F6F4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E8312A' }}></div>
          <p className="font-medium" style={{ color: '#717171' }}>Loading prospectus builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', padding: '1.5rem' }}>
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

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <FileText className="w-5 h-5" style={{ color: '#E8312A' }} />
            <h1 className="font-bold" style={{ fontSize: '1.5rem', color: '#1A1A1A' }}>
              Prospectus Builder
            </h1>
          </div>
          <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#717171' }}>
            Create, manage, and distribute IPO prospectus documents. Build your S-1, prospectus, or offering memorandum with AI-powered sections and expert review.
          </p>
        </div>

        {/* Filters and Sort */}
        {filteredProspectuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'draft', 'in_review', 'complete'] as const).map((status) => (
                  <motion.button
                    key={status}
                    whileHover={{ y: -2 }}
                    onClick={() => setFilterStatus(status)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: filterStatus === status ? '#E8312A' : '#FFFFFF',
                      color: filterStatus === status ? '#FFFFFF' : '#1A1A1A',
                      border: filterStatus === status ? 'none' : '1px solid #E5E4E0',
                    }}
                  >
                    {status === 'all' ? 'All' : status === 'in_review' ? 'In Review' : status === 'complete' ? 'Complete' : 'Draft'}
                  </motion.button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none"
                style={{
                  borderColor: '#E5E4E0',
                  color: '#1A1A1A',
                  background: '#FFFFFF',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1A1A1A' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E4E0' }}
              >
                <option value="recent">Newest First</option>
                <option value="completion">Completion %</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredProspectuses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed p-16 text-center"
            style={{
              borderColor: '#E5E4E0',
              background: '#FFFFFF',
            }}
          >
            <div className="text-6xl mb-4">📄</div>
            <h3 className="font-bold mb-2" style={{ fontSize: '1.25rem', color: '#1A1A1A' }}>No prospectuses yet</h3>
            <p className="mb-8 max-w-md mx-auto" style={{ color: '#717171' }}>
              Get started by creating your first prospectus document to begin building your IPO narrative
            </p>
            <motion.button
              whileHover={{ scale: canAccess ? 1.05 : 1 }}
              whileTap={{ scale: canAccess ? 0.95 : 1 }}
              onClick={handleCreateClick}
              disabled={!canAccess}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{
                background: canAccess ? '#E8312A' : '#E5E4E0',
                color: canAccess ? '#FFFFFF' : '#9A9A9A',
                cursor: canAccess ? 'pointer' : 'not-allowed',
              }}
            >
              <Plus size={20} />
              Create Your First Prospectus
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Create Button */}
            <motion.button
              whileHover={{ scale: canAccess ? 1.05 : 1 }}
              whileTap={{ scale: canAccess ? 0.95 : 1 }}
              onClick={handleCreateClick}
              disabled={!canAccess}
              className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{
                background: canAccess ? '#E8312A' : '#E5E4E0',
                color: canAccess ? '#FFFFFF' : '#9A9A9A',
                cursor: canAccess ? 'pointer' : 'not-allowed',
              }}
            >
              <Plus size={20} />
              Create New
            </motion.button>

            {/* Cards Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProspectuses.map((prospectus, index) => (
                <motion.div
                  key={prospectus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-xl p-6 cursor-pointer group transition-all"
                  style={{
                    border: '1px solid #E5E4E0',
                    background: '#FFFFFF',
                  }}
                  onClick={() => handleEditClick(prospectus.id)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-8 h-8 mt-1 flex-shrink-0" style={{ color: '#E8312A' }} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate" style={{ color: '#1A1A1A', fontSize: '1rem' }}>{prospectus.name}</h3>
                        <p className="text-sm mt-1" style={{ color: '#9A9A9A' }}>{prospectus.exchange}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={getStatusBadgeColor(prospectus.status)}>
                        {prospectus.status === 'in_review' ? 'In Review' : prospectus.status === 'complete' ? 'Complete' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: '#717171' }}>Progress</span>
                      <span className="text-sm font-bold" style={{ color: '#E8312A' }}>{prospectus.completionPercent}%</span>
                    </div>
                    <div className="w-full rounded-full h-2.5" style={{ background: '#E5E4E0' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prospectus.completionPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-2.5 rounded-full"
                        style={{ background: '#E8312A' }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm mb-4 pb-4" style={{ borderBottom: '1px solid #E5E4E0', color: '#717171' }}>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{new Date(prospectus.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Approval Tier */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ ...getApprovalTierColor(prospectus.approvalTier), border: `1px solid ${getApprovalTierColor(prospectus.approvalTier).border}` }}>
                      {prospectus.approvalTier === 'ai' ? 'AI Draft' : prospectus.approvalTier === 'admin' ? 'Admin Review' : 'Professional'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(prospectus.id)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
                      style={{
                        background: '#FDECEB',
                        color: '#E8312A',
                      }}
                    >
                      Edit
                    </motion.button>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDownloadMenuOpen(downloadMenuOpen === prospectus.id ? null : prospectus.id)
                        }}
                        disabled={downloadLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{
                          background: '#F7F6F4',
                          color: '#717171',
                          opacity: downloadLoading ? 0.5 : 1,
                        }}
                      >
                        <Download size={16} />
                        {downloadLoading ? '...' : 'Export'}
                      </motion.button>
                      <AnimatePresence>
                        {downloadMenuOpen === prospectus.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-10 overflow-hidden"
                            style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
                          >
                            <button
                              onClick={() => handleDownloadClick(prospectus.id, 'pdf')}
                              className="block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                              style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                            >
                              📄 PDF
                            </button>
                            <button
                              onClick={() => handleDownloadClick(prospectus.id, 'docx')}
                              className="block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                              style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                            >
                              📝 Word Document
                            </button>
                            <button
                              onClick={() => handleDownloadClick(prospectus.id, 'zip')}
                              className="block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                              style={{ color: '#717171' }}
                            >
                              📦 All Formats
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {downloadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-lg text-sm font-medium"
                      style={{
                        background: '#FEE2E2',
                        color: '#B91C1C',
                        border: '1px solid #FECACA',
                      }}
                    >
                      {downloadError}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
