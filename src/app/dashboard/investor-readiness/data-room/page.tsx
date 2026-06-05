'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Lock, Folder, FileText, Share2, Eye, Download, Trash2, CheckCircle2,
  Clock, AlertCircle, Plus, Search, Filter, Settings, Bell, Mail,
  ChevronDown, ChevronRight, Copy, ExternalLink, Eye as EyeIcon, Shield, Users
} from 'lucide-react'

interface DataRoomFolder {
  id: string
  name: string
  description: string
  icon: string
  color: string
  documents: DataRoomDocument[]
  required: boolean
}

interface DataRoomDocument {
  id: string
  name: string
  size: string
  uploadedAt: string
  version: number
  accessCount: number
  lastAccessed?: string
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
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'access' | 'activity'>('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'viewer' | 'downloader' | 'commenter'>('viewer')

  // Mock data - replace with real API calls
  const folders: DataRoomFolder[] = [
    {
      id: 'financials',
      name: 'Financial Statements',
      description: 'Audited & unaudited financials, cap table, tax returns',
      icon: '📊',
      color: '#FDECEB',
      required: true,
      documents: [
        { id: '1', name: 'FY2025 Audited Financial Statements.pdf', size: '2.4 MB', uploadedAt: '2026-06-01', version: 3, accessCount: 12, lastAccessed: '2026-06-04' },
        { id: '2', name: 'Cap Table - Latest (June 2026).xlsx', size: '1.8 MB', uploadedAt: '2026-06-02', version: 5, accessCount: 18, lastAccessed: '2026-06-05' },
        { id: '3', name: 'Tax Returns FY2024.pdf', size: '3.2 MB', uploadedAt: '2026-05-15', version: 1, accessCount: 5 },
      ]
    },
    {
      id: 'business',
      name: 'Business Plan & Model',
      description: '3-year financial model, market analysis, growth projections',
      icon: '📈',
      color: '#EAF5F0',
      required: true,
      documents: [
        { id: '4', name: 'Financial Model - 5 Year Forecast.xlsx', size: '4.1 MB', uploadedAt: '2026-05-20', version: 2, accessCount: 8, lastAccessed: '2026-06-03' },
        { id: '5', name: 'Market Analysis & TAM.pdf', size: '5.6 MB', uploadedAt: '2026-05-18', version: 1, accessCount: 4 },
        { id: '6', name: 'Executive Summary.docx', size: '0.8 MB', uploadedAt: '2026-06-01', version: 4, accessCount: 15, lastAccessed: '2026-06-04' },
      ]
    },
    {
      id: 'legal',
      name: 'Legal & Compliance',
      description: 'Articles of incorporation, contracts, IP documentation',
      icon: '⚖️',
      color: '#F5F3FF',
      required: true,
      documents: [
        { id: '7', name: 'Articles of Incorporation.pdf', size: '0.4 MB', uploadedAt: '2026-04-01', version: 1, accessCount: 3 },
        { id: '8', name: 'Material Contracts Summary.pdf', size: '2.2 MB', uploadedAt: '2026-05-25', version: 1, accessCount: 6, lastAccessed: '2026-06-02' },
        { id: '9', name: 'IP Ownership Documentation.zip', size: '8.5 MB', uploadedAt: '2026-05-10', version: 1, accessCount: 2 },
      ]
    },
    {
      id: 'team',
      name: 'Team & Leadership',
      description: 'Bios, experience, org chart, board composition',
      icon: '👥',
      color: '#EFF6FF',
      required: true,
      documents: [
        { id: '10', name: 'CEO Bio & Background.pdf', size: '0.6 MB', uploadedAt: '2026-05-30', version: 2, accessCount: 10, lastAccessed: '2026-06-04' },
        { id: '11', name: 'Leadership Team Bios.pdf', size: '1.9 MB', uploadedAt: '2026-05-28', version: 1, accessCount: 7 },
        { id: '12', name: 'Org Chart & Governance.pdf', size: '0.9 MB', uploadedAt: '2026-06-01', version: 1, accessCount: 4 },
      ]
    },
    {
      id: 'product',
      name: 'Product & Technology',
      description: 'Product roadmap, tech architecture, customer references',
      icon: '🔧',
      color: '#F0FDF4',
      required: false,
      documents: [
        { id: '13', name: 'Product Roadmap - Next 18 Months.pdf', size: '3.2 MB', uploadedAt: '2026-05-20', version: 2, accessCount: 9, lastAccessed: '2026-06-03' },
        { id: '14', name: 'Customer Case Studies.pdf', size: '4.8 MB', uploadedAt: '2026-05-15', version: 1, accessCount: 5 },
      ]
    },
    {
      id: 'market',
      name: 'Market & Competitors',
      description: 'Market reports, competitive analysis, positioning',
      icon: '🎯',
      color: '#FEF3C7',
      required: false,
      documents: [
        { id: '15', name: 'Market Research Report.pdf', size: '6.3 MB', uploadedAt: '2026-05-10', version: 1, accessCount: 3 },
        { id: '16', name: 'Competitive Landscape.pdf', size: '2.1 MB', uploadedAt: '2026-05-12', version: 1, accessCount: 4, lastAccessed: '2026-06-01' },
      ]
    }
  ]

  const invites: DataRoomInvite[] = [
    { id: '1', email: 'investor@goldmansachs.com', name: 'Goldman Sachs', role: 'downloader', status: 'nda-signed', sentAt: '2026-05-20', signedAt: '2026-05-21', accessLevel: 'full' },
    { id: '2', email: 'counsel@majormajor.law', name: 'Major & Major LLP', role: 'commenter', status: 'nda-signed', sentAt: '2026-05-18', signedAt: '2026-05-18', accessLevel: 'full' },
    { id: '3', email: 'advisor@severance.com', name: 'Severance Capital', role: 'viewer', status: 'pending', sentAt: '2026-06-02', accessLevel: 'limited' },
    { id: '4', email: 'partner@techventures.vc', name: 'Tech Ventures Partners', role: 'downloader', status: 'nda-signed', sentAt: '2026-05-25', signedAt: '2026-05-26', accessLevel: 'full' },
  ]

  const recentActivity = [
    { timestamp: '2026-06-05 09:22 AM', user: 'Goldman Sachs', action: 'Downloaded', document: 'Cap Table - Latest (June 2026).xlsx', icon: '📥' },
    { timestamp: '2026-06-04 03:45 PM', user: 'Severance Capital', action: 'Viewed', document: 'Financial Model - 5 Year Forecast.xlsx', icon: '👁️' },
    { timestamp: '2026-06-04 11:30 AM', user: 'Tech Ventures Partners', action: 'Downloaded', document: 'Executive Summary.docx', icon: '📥' },
    { timestamp: '2026-06-03 08:15 PM', user: 'Major & Major LLP', action: 'Viewed', document: 'Articles of Incorporation.pdf', icon: '👁️' },
    { timestamp: '2026-06-02 02:00 PM', user: 'You', action: 'Added', document: 'Market Research Report.pdf', icon: '➕' },
  ]

  const completionStats = {
    required: folders.filter(f => f.required).length,
    completed: folders.filter(f => f.required && f.documents.length > 0).length,
  }

  const handleSendInvite = () => {
    console.log('Sending invite to:', inviteEmail, 'Role:', inviteRole)
    setInviteEmail('')
    setInviteRole('viewer')
    setShowInviteModal(false)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="serif text-4xl font-bold text-nav">Data Room</h1>
            </div>
            <p className="text-text-muted">Secure document sharing for due diligence and investor access</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#E8312A', color: 'white' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#C71B11')}
            onMouseLeave={e => (e.currentTarget.style.background = '#E8312A')}
          >
            <Mail className="w-4 h-4" />
            Invite Investor
          </button>
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <div className="p-4 rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0' }}>
          <p className="label-sm text-text-muted mb-2">Documents Uploaded</p>
          <p className="h3">{folders.reduce((acc, f) => acc + f.documents.length, 0)}</p>
          <p className="caption-sm text-text-light mt-1">Across {folders.length} folders</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <p className="label-sm text-text-muted mb-2">Investor Access</p>
          <p className="h3">{invites.length}</p>
          <p className="caption-sm text-green-600 mt-1">{invites.filter(i => i.status === 'nda-signed').length} NDAs signed</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <p className="label-sm text-text-muted mb-2">Total Views</p>
          <p className="h3">{folders.reduce((acc, f) => acc + f.documents.reduce((d, doc) => d + doc.accessCount, 0), 0)}</p>
          <p className="caption-sm text-blue-600 mt-1">Last 30 days</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#FDECEB', borderColor: '#FECACA' }}>
          <p className="label-sm text-text-muted mb-2">Completion</p>
          <p className="h3">{completionStats.completed}/{completionStats.required}</p>
          <p className="caption-sm text-accent mt-1">Required folders</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-1 mb-6 border-b" style={{ borderColor: '#E5E4E0' }}
      >
        {(['overview', 'documents', 'access', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-3 font-semibold text-sm transition-all capitalize"
            style={{
              color: activeTab === tab ? '#E8312A' : '#9A9A9A',
              borderBottom: activeTab === tab ? '2px solid #E8312A' : 'none',
              marginBottom: activeTab === tab ? '-1px' : '0'
            }}
          >
            {tab === 'documents' && `Documents (${folders.reduce((acc, f) => acc + f.documents.length, 0)})`}
            {tab === 'access' && `Access (${invites.length})`}
            {tab !== 'documents' && tab !== 'access' && tab}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Folder Structure */}
            <div>
              <h2 className="h4 text-nav mb-4">Document Organization</h2>
              <div className="space-y-2">
                {folders.map(folder => (
                  <motion.button
                    key={folder.id}
                    onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                    className="w-full p-4 rounded-xl border text-left transition-all hover:shadow-md"
                    style={{ background: folder.color, borderColor: '#E5E4E0' }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{folder.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-nav">{folder.name}</p>
                            {folder.required && (
                              <span className="label-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#FDECEB', color: '#E8312A' }}>
                                REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-muted">{folder.description}</p>
                          <p className="caption-sm text-text-light mt-1.5">
                            {folder.documents.length} document{folder.documents.length !== 1 ? 's' : ''} • Most viewed: {Math.max(...folder.documents.map(d => d.accessCount))} times
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-5 h-5 text-text-muted transition-transform"
                        style={{ transform: selectedFolder === folder.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </div>

                    {/* Expanded Documents List */}
                    <AnimatePresence>
                      {selectedFolder === folder.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                        >
                          {folder.documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between py-2 px-3 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.5)' }}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-nav truncate">{doc.name}</p>
                                  <p className="caption-sm text-text-light">{doc.size} • v{doc.version} • {doc.accessCount} views</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button className="p-1.5 hover:bg-white rounded-lg transition-colors" title="Download">
                                  <Download className="w-4 h-4 text-text-muted" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-6 rounded-xl border-2" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 mb-1">Pro Tips for Data Room Success</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>✓ Keep documents updated — investors notice stale financials</li>
                    <li>✓ Highlight key documents — tell investors what to read first</li>
                    <li>✓ Monitor access patterns — when do investors focus on what?</li>
                    <li>✓ Respond to questions quickly — data room Q&A signals interest</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#F7F6F4' }}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all" style={{ borderColor: '#E5E4E0', background: 'white' }}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* All Documents */}
              {folders.map(folder => (
                <div key={folder.id}>
                  <h3 className="font-bold text-nav mb-3 flex items-center gap-2">
                    <span>{folder.icon}</span>
                    {folder.name}
                  </h3>
                  <div className="space-y-2 mb-6">
                    {folder.documents.map(doc => (
                      <div key={doc.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ background: '#F7F6F4', borderColor: '#E5E4E0' }}>
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-text-muted" />
                          <div>
                            <p className="font-medium text-nav">{doc.name}</p>
                            <p className="caption-sm text-text-light">{doc.size} • v{doc.version} • {doc.accessCount} views</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4 text-text-muted" />
                          </button>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-text-muted" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Access Tab */}
        {activeTab === 'access' && (
          <motion.div
            key="access"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="h4 text-nav">Investor Access</h2>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm"
                  style={{ background: '#E8312A', color: 'white' }}
                >
                  <Plus className="w-4 h-4" />
                  New Invite
                </button>
              </div>

              <div className="space-y-3">
                {invites.map(invite => (
                  <motion.div
                    key={invite.id}
                    className="p-4 rounded-xl border"
                    style={{ background: '#F7F6F4', borderColor: '#E5E4E0' }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-nav">{invite.name}</p>
                        <p className="text-sm text-text-muted">{invite.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {invite.status === 'nda-signed' && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            NDA Signed
                          </div>
                        )}
                        {invite.status === 'pending' && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span>Role: <span className="font-semibold capitalize">{invite.role}</span></span>
                      <span>Access: <span className="font-semibold capitalize">{invite.accessLevel}</span></span>
                      {invite.signedAt && <span>Signed: {invite.signedAt}</span>}
                      {!invite.signedAt && <span>Sent: {invite.sentAt}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* NDA Template Info */}
            <div className="p-6 rounded-xl border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 mb-2">Automated NDA Process</p>
                  <p className="text-sm text-blue-800 mb-3">
                    When you invite someone, they receive an email with:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Data room structure and key documents highlighted</li>
                    <li>✓ One-click NDA for e-signature (DocuSign)</li>
                    <li>✓ Automatic access once NDA is signed</li>
                    <li>✓ Real-time notification when they access documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h2 className="h4 text-nav mb-4">Activity Timeline</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    className="p-4 rounded-xl border flex gap-4"
                    style={{ background: '#F7F6F4', borderColor: '#E5E4E0' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="font-bold text-nav">{activity.user}</p>
                        <p className="text-sm text-text-muted">{activity.action}</p>
                      </div>
                      <p className="text-sm text-text-muted truncate">{activity.document}</p>
                      <p className="caption-sm text-text-light mt-1">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            key="invite-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="h3 text-nav mb-6">Invite Investor or Advisor</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="label text-nav font-semibold mb-2 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="investor@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#F7F6F4' }}
                  />
                </div>

                <div>
                  <label className="label text-nav font-semibold mb-2 block">Access Level</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{ borderColor: '#E5E4E0', background: '#F7F6F4' }}
                  >
                    <option value="viewer">Viewer (View documents only)</option>
                    <option value="downloader">Downloader (View & download)</option>
                    <option value="commenter">Commenter (View, download & comment)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-lg mb-6" style={{ background: '#F0FDF4', borderLeft: '4px solid #2D7A5F' }}>
                <p className="text-sm text-green-800">
                  <strong>What happens next:</strong> They'll receive an email with access to the data room. An NDA will be auto-sent for e-signature. Access granted immediately upon signature.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border"
                  style={{ borderColor: '#E5E4E0', background: '#F7F6F4', color: '#1A1A1A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EFEFED')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F7F6F4')}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-white"
                  style={{ background: '#E8312A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#C71B11')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#E8312A')}
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
