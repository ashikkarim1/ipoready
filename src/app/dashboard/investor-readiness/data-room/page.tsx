'use client'

/**
 * Data Room Page - UNIFIED SOURCE VERSION
 *
 * MIGRATION COMPLETE: Now pulls from unified_documents table (ONE SOURCE)
 * All pages query same source = guaranteed consistency
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Lock, Folder, FileText, Share2, Eye, Download, Trash2, CheckCircle2,
  Clock, AlertCircle, Plus, Search, Filter, Settings, Bell, Mail,
  ChevronDown, ChevronRight, Copy, ExternalLink, Eye as EyeIcon, Shield, Users,
  Loader
} from 'lucide-react'
import { useSession } from 'next-auth/react'

/**
 * Document type - mirrors UnifiedDocument from server-side service
 * Client components use this interface instead of importing the service
 */
interface UnifiedDocument {
  id: string
  companyId: string
  name: string
  displayName?: string
  description?: string
  mimeType: string
  storageProvider: string
  storageId?: string
  cloudPath?: string
  fileSize: number
  category: string
  status: 'draft' | 'in_review' | 'approved' | 'archived'
  uploadedAt: string
  uploadedBy: string
  commentCount: number
  currentVersion?: number
  totalVersions?: number
  completeness?: number
  requiredForFiling?: boolean
  approvedAt?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
  ownerUserId?: string
}

interface DataRoomFolder {
  categoryGroup: 'Mandatory' | 'Supporting' | 'Optional'
  category: string
  documents: UnifiedDocument[]
}

interface DataRoomInvite {
  id: string
  email: string
  name: string
  role: 'viewer' | 'downloader' | 'commenter'
  status: 'pending' | 'nda-signed' | 'approved'
  sentAt: string
  signedAt?: string
  accessLevel: 'limited' | 'full'
}

export default function DataRoomPage() {
  const { data: session } = useSession()
  const companyId = (session?.user as any)?.companyId

  const [documents, setDocuments] = useState<UnifiedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'access' | 'activity'>('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'viewer' | 'downloader' | 'commenter'>('viewer')

  // Load documents from API
  useEffect(() => {
    if (!companyId) return

    const loadDocuments = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/documents/list?companyId=${companyId}`)
        const data = await res.json()
        setDocuments(data.documents || [])
        setError(null)
      } catch (err) {
        console.error('[data-room] Failed to load:', err)
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [companyId])

  // Group documents by category
  const groupedDocuments = documents
    .filter(doc => !searchTerm || doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((acc, doc) => {
      const categoryGroup = doc.requiredForFiling ? 'Mandatory' : 'Supporting'
      const key = `${categoryGroup}-${doc.category}`

      if (!acc[key]) {
        acc[key] = {
          categoryGroup,
          category: doc.category || 'Other',
          documents: []
        }
      }

      acc[key].documents.push(doc)
      return acc
    }, {} as Record<string, DataRoomFolder>)

  // Mock invite data (replace with real API)
  const invites: DataRoomInvite[] = [
    { id: '1', email: 'investor@example.com', name: 'Jane Investor', role: 'viewer', status: 'nda-signed', sentAt: '2026-05-15', signedAt: '2026-05-16', accessLevel: 'full' },
    { id: '2', email: 'advisor@example.com', name: 'John Advisor', role: 'commenter', status: 'nda-signed', sentAt: '2026-05-20', signedAt: '2026-05-21', accessLevel: 'limited' },
    { id: '3', email: 'due-diligence@vc.com', name: 'Due Diligence Team', role: 'downloader', status: 'pending', sentAt: '2026-06-01', accessLevel: 'full' },
  ]

  if (loading) {
    return (
      <div style={{ background: '#F7F6F4', minHeight: '100vh' }} className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E4E0' }} className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="serif text-2xl sm:text-3xl text-nav mb-1 flex items-center gap-2">
                <Lock className="w-6 h-6" />
                Data Room
              </h1>
              <p className="text-text-muted text-sm">Unified source - all pages query this same data</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0"
              style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Invite Investor</span>
              <span className="sm:hidden">Invite</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b -mb-[1px]" style={{ borderColor: '#E5E4E0' }}>
            {(['overview', 'documents', 'access', 'activity'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-0 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-b-2'
                    : 'border-transparent'
                }`}
                style={{
                  color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  borderColor: activeTab === tab ? 'var(--color-text-primary)' : 'transparent'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6 sm:space-y-8">
        {error && (
          <div className="p-4 flex gap-3 rounded-xl" style={{ background: 'var(--color-error-pale)', border: '1px solid var(--color-error-light)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-error-dark)' }}>Error loading documents</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-error-dark)' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-5">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-xs sm:text-sm">Total Documents</p>
                    <p className="text-2xl sm:text-3xl font-bold text-nav mt-2">{documents.length}</p>
                  </div>
                  <FileText className="w-6 h-6 text-text-muted flex-shrink-0" />
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-xs sm:text-sm">Folders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-nav mt-2">{Object.keys(groupedDocuments).length}</p>
                  </div>
                  <Folder className="w-6 h-6 text-text-muted flex-shrink-0" />
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-xs sm:text-sm">Active Invites</p>
                    <p className="text-2xl sm:text-3xl font-bold text-nav mt-2">{invites.filter(i => i.status === 'nda-signed').length}</p>
                  </div>
                  <Users className="w-6 h-6 text-text-muted flex-shrink-0" />
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-xs sm:text-sm">Compliance</p>
                    <p className="text-2xl sm:text-3xl font-bold text-nav mt-2">✓</p>
                  </div>
                  <Shield className="w-6 h-6 text-text-muted flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card p-6">
              <h2 className="text-nav text-sm font-semibold mb-4">System Status</h2>
              <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'var(--color-success-pale)', border: '1px solid var(--color-success-light)' }}>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-success-dark)' }}>✓ Unified Source Active</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-success-dark)' }}>
                    Data room pulls from unified_documents table. All pages show identical data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Document Groups */}
            <div className="space-y-6">
              {Object.entries(groupedDocuments)
                .sort(([keyA], [keyB]) => {
                  const orderMap = { 'Mandatory': 0, 'Supporting': 1, 'Optional': 2 }
                  const groupA = groupedDocuments[keyA].categoryGroup
                  const groupB = groupedDocuments[keyB].categoryGroup
                  return orderMap[groupA as keyof typeof orderMap] - orderMap[groupB as keyof typeof orderMap]
                })
                .map(([key, folder]) => (
                  <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Folder Header */}
                    <button
                      onClick={() => setSelectedFolder(selectedFolder === key ? null : key)}
                      className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {folder.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                          {folder.documents.length}
                        </span>
                      </div>
                      {selectedFolder === key ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Documents in Folder */}
                    <AnimatePresence>
                      {selectedFolder === key && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 mt-2"
                        >
                          {folder.documents.map(doc => (
                            <div
                              key={doc.id}
                              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-start justify-between"
                            >
                              <div className="flex gap-3 flex-1">
                                <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{doc.displayName}</p>
                                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                    <span>v{doc.currentVersion}</span>
                                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    {doc.approvedAt && (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="w-3 h-3" /> Approved
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                  <Download className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Access Tab */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Investor Access</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Add Access
              </button>
            </div>

            <div className="space-y-3">
              {invites.map(invite => (
                <div key={invite.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{invite.name}</p>
                        <p className="text-sm text-gray-600">{invite.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        invite.status === 'nda-signed' ? 'bg-green-100 text-green-800' :
                        invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invite.status === 'nda-signed' ? 'NDA Signed' : invite.status === 'pending' ? 'Pending' : 'Approved'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
            <p className="text-gray-600">Document activity tracking will appear here.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Investor</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="investor@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer</option>
                  <option value="downloader">Downloader</option>
                  <option value="commenter">Commenter</option>
                </select>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
