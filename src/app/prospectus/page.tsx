'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import { FeatureLockedOverlay } from '@/components/FeatureLockedOverlay'
import { canAccessFeature, type FeatureTier } from '@/lib/features'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Download, FileText, Clock, CheckCircle2, AlertCircle, Filter, 
  MoreVertical, Copy, Trash2, Share2, Eye, Wand2, MessageSquare, 
  BarChart3, Lock, Zap, Users, Settings, BookOpen, Sparkles, ArrowRight,
  GitBranch, RotateCcw, CheckSquare, Edit3
} from 'lucide-react'

interface ProspectusItem {
  id: string
  name: string
  exchange: string
  completionPercent: number
  status: 'draft' | 'in_review' | 'complete'
  approvalTier: 'ai' | 'admin' | 'professional'
  createdAt: Date
  lastUpdated: Date
  pageCount: number
  sections: number
  aiGeneratedSections: number
  reviewComments: number
  sharedWith: number
  complianceScore: number
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
    pageCount: 145,
    sections: 18,
    aiGeneratedSections: 8,
    reviewComments: 12,
    sharedWith: 3,
    complianceScore: 92,
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
    pageCount: 87,
    sections: 12,
    aiGeneratedSections: 5,
    reviewComments: 3,
    sharedWith: 1,
    complianceScore: 78,
  },
]

const FEATURE_CARDS = [
  {
    icon: Wand2,
    title: 'AI-Powered Drafting',
    description: 'Auto-generate sections with AI assistance',
    color: '#E8312A',
  },
  {
    icon: CheckSquare,
    title: 'Compliance Checker',
    description: 'Real-time SEC & regulatory compliance scoring',
    color: '#2D7A5F',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share, comment, and review with stakeholders',
    color: '#1D4ED8',
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Track changes and restore previous versions',
    color: '#9333EA',
  },
  {
    icon: BarChart3,
    title: 'Section Analytics',
    description: 'Insights on completion and quality metrics',
    color: '#DC2626',
  },
  {
    icon: BookOpen,
    title: 'Templates & Guides',
    description: 'Pre-built templates for S-1, prospectus, and more',
    color: '#7C3AED',
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
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
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

  const handlePreviewClick = (id: string) => {
    router.push(`/prospectus/${id}/preview`)
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

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <FileText className="w-5 h-5" style={{ color: '#E8312A' }} />
            <h1 className="font-bold" style={{ fontSize: '1.5rem', color: '#1A1A1A' }}>
              Prospectus Builder
            </h1>
          </div>
          <p className="text-sm leading-relaxed max-w-3xl" style={{ color: '#717171' }}>
            Create, manage, and distribute IPO prospectus documents with AI-powered drafting, compliance scoring, team collaboration, and expert review workflows.
          </p>
        </div>

        {/* Key Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
          {FEATURE_CARDS.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="rounded-lg p-4 text-center group cursor-pointer transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                }}
              >
                <div className="flex justify-center mb-2">
                  <div className="rounded-lg p-2" style={{ background: `${feature.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                </div>
                <h4 className="text-xs font-bold mb-1" style={{ color: '#1A1A1A' }}>
                  {feature.title}
                </h4>
                <p className="text-xs leading-tight" style={{ color: '#717171' }}>
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Filters and Sort */}
        {filteredProspectuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
              Get started by creating your first prospectus document to begin building your IPO narrative with AI assistance
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredProspectuses.map((prospectus, index) => (
                <motion.div
                  key={prospectus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: '1px solid #E5E4E0',
                    background: '#FFFFFF',
                  }}
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b" style={{ borderColor: '#E5E4E0' }}>
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
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActionMenuOpen(actionMenuOpen === prospectus.id ? null : prospectus.id)}
                            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ background: '#F7F6F4' }}
                          >
                            <MoreVertical size={18} style={{ color: '#717171' }} />
                          </motion.button>
                          <AnimatePresence>
                            {actionMenuOpen === prospectus.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 overflow-hidden"
                                style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
                              >
                                <button
                                  onClick={() => { handlePreviewClick(prospectus.id); setActionMenuOpen(null) }}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                  style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                                >
                                  <Eye size={16} />
                                  Preview
                                </button>
                                <button
                                  onClick={() => { handleEditClick(prospectus.id); setActionMenuOpen(null) }}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                  style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                                >
                                  <Edit3 size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => setActionMenuOpen(null)}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                  style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                                >
                                  <Copy size={16} />
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => setActionMenuOpen(null)}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                  style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                                >
                                  <Share2 size={16} />
                                  Share
                                </button>
                                <button
                                  onClick={() => setActionMenuOpen(null)}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                  style={{ color: '#717171', borderBottom: '1px solid #E5E4E0' }}
                                >
                                  <RotateCcw size={16} />
                                  Restore Version
                                </button>
                                <button
                                  onClick={() => setActionMenuOpen(null)}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                  style={{ color: '#DC2626' }}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#717171' }}>Completion</span>
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
                  </div>

                  {/* Card Body - Metrics */}
                  <div className="p-6 pb-4 border-b" style={{ borderColor: '#E5E4E0' }}>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#717171' }}>Pages</p>
                        <p className="font-bold" style={{ color: '#1A1A1A', fontSize: '1.1rem' }}>{prospectus.pageCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#717171' }}>Sections</p>
                        <p className="font-bold" style={{ color: '#1A1A1A', fontSize: '1.1rem' }}>{prospectus.sections}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#717171' }}>Compliance</p>
                        <p className="font-bold" style={{ color: prospectus.complianceScore >= 85 ? '#2D7A5F' : '#B45309', fontSize: '1.1rem' }}>{prospectus.complianceScore}%</p>
                      </div>
                    </div>

                    {/* AI & Collaboration Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#F7F6F4' }}>
                        <Wand2 size={16} style={{ color: '#E8312A' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#717171' }}>AI Generated</p>
                          <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{prospectus.aiGeneratedSections}/{prospectus.sections}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#F7F6F4' }}>
                        <Users size={16} style={{ color: '#1D4ED8' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#717171' }}>Shared With</p>
                          <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{prospectus.sharedWith} person{prospectus.sharedWith !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Status */}
                    {prospectus.reviewComments > 0 && (
                      <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: '#FEF3C7' }}>
                        <MessageSquare size={16} style={{ color: '#B45309' }} />
                        <span className="text-sm font-medium" style={{ color: '#B45309' }}>
                          {prospectus.reviewComments} pending review comment{prospectus.reviewComments !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Approval Tier */}
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ ...getApprovalTierColor(prospectus.approvalTier), border: `1px solid ${getApprovalTierColor(prospectus.approvalTier).border}` }}>
                      {prospectus.approvalTier === 'ai' ? '🤖 AI Draft' : prospectus.approvalTier === 'admin' ? '👨‍💼 Admin Review' : '👔 Professional'}
                    </span>
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="p-6 pt-4">
                    <div className="flex gap-2 mb-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditClick(prospectus.id)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90 flex items-center justify-center gap-2"
                        style={{
                          background: '#FDECEB',
                          color: '#E8312A',
                        }}
                      >
                        <Edit3 size={16} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePreviewClick(prospectus.id)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90 flex items-center justify-center gap-2"
                        style={{
                          background: '#F7F6F4',
                          color: '#717171',
                        }}
                      >
                        <Eye size={16} />
                        Preview
                      </motion.button>
                      <div className="relative flex-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDownloadMenuOpen(downloadMenuOpen === prospectus.id ? null : prospectus.id)}
                          disabled={downloadLoading}
                          className="w-full flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
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
                                📝 Word
                              </button>
                              <button
                                onClick={() => handleDownloadClick(prospectus.id, 'zip')}
                                className="block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                                style={{ color: '#717171' }}
                              >
                                📦 All Files
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Quick Action Row */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: '#E5E4E0' }}>
                      <motion.button
                        whileHover={{ y: -2 }}
                        className="text-center px-2 py-2 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: '#F7F6F4', color: '#717171' }}
                      >
                        💬 Comment
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -2 }}
                        className="text-center px-2 py-2 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: '#F7F6F4', color: '#717171' }}
                      >
                        🤖 AI Assist
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -2 }}
                        className="text-center px-2 py-2 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: '#F7F6F4', color: '#717171' }}
                      >
                        📊 Analytics
                      </motion.button>
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
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
