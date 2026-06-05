'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import {
  FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock,
  Download, Eye, Trash2, Upload, MessageSquare, History, Share2,
  Filter, Search, MoreVertical, Star, Lock, User, Calendar
} from 'lucide-react'

interface Comment {
  id: string
  author: string
  role: string
  text: string
  date: string
  avatar: string
}

interface Version {
  version: number
  uploadedBy: string
  uploadedDate: string
  fileSize: string
  comments: number
}

interface Document {
  id: string
  name: string
  category: string
  categoryGroup: 'Mandatory' | 'Supporting' | 'Optional'
  status: 'verified' | 'in-review' | 'uploaded' | 'missing' | 'pending-approval'
  isMandatory: boolean
  description: string
  currentVersion: number
  versions: Version[]
  lastModifiedBy: string
  lastModifiedDate: string
  approvedBy?: string
  approvedDate?: string
  latestComments: Comment[]
  fileSize: string
  completionPercent: number
  complianceStatus: 'compliant' | 'warnings' | 'issues'
}

const DOCUMENT_GROUPS = {
  'Mandatory - Financial': [
    {
      id: '1',
      name: 'Prospectus (Form S-1)',
      category: 'Financial',
      categoryGroup: 'Mandatory' as const,
      status: 'verified' as const,
      isMandatory: true,
      description: 'Complete prospectus with audited financials and projections',
      currentVersion: 3,
      versions: [
        { version: 3, uploadedBy: 'Sarah Chen (CEO)', uploadedDate: 'Jun 3, 2026', fileSize: '2.3 MB', comments: 5 },
        { version: 2, uploadedBy: 'Sarah Chen (CEO)', uploadedDate: 'May 28, 2026', fileSize: '2.1 MB', comments: 12 },
        { version: 1, uploadedBy: 'Sarah Chen (CEO)', uploadedDate: 'May 20, 2026', fileSize: '1.9 MB', comments: 8 }
      ],
      lastModifiedBy: 'Sarah Chen (CEO)',
      lastModifiedDate: 'Jun 3, 2026',
      approvedBy: 'Marc Leblanc (CFO)',
      approvedDate: 'Jun 3, 2026',
      latestComments: [
        { id: '1', author: 'Marc Leblanc', role: 'CFO', text: 'Financials look good. Ready for filing.', date: 'Jun 3, 2026', avatar: 'MB' },
        { id: '2', author: 'Legal Counsel', role: 'Securities Counsel', text: 'Minor formatting changes needed in risk section.', date: 'Jun 2, 2026', avatar: 'LC' }
      ],
      fileSize: '2.3 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    },
    {
      id: '2',
      name: 'Financial Statements (10-K)',
      category: 'Financial',
      categoryGroup: 'Mandatory' as const,
      status: 'uploaded' as const,
      isMandatory: true,
      description: 'Audited financial statements for past 2 years',
      currentVersion: 2,
      versions: [
        { version: 2, uploadedBy: 'Marc Leblanc (CFO)', uploadedDate: 'Jun 2, 2026', fileSize: '1.8 MB', comments: 3 },
        { version: 1, uploadedBy: 'Marc Leblanc (CFO)', uploadedDate: 'May 25, 2026', fileSize: '1.6 MB', comments: 7 }
      ],
      lastModifiedBy: 'Marc Leblanc (CFO)',
      lastModifiedDate: 'Jun 2, 2026',
      latestComments: [
        { id: '1', author: 'Auditor', role: 'External Auditor', text: 'Statements reconciled. No issues found.', date: 'Jun 1, 2026', avatar: 'AU' }
      ],
      fileSize: '1.8 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    },
    {
      id: '3',
      name: 'Audit Report',
      category: 'Financial',
      categoryGroup: 'Mandatory' as const,
      status: 'verified' as const,
      isMandatory: true,
      description: 'Independent auditor\'s opinion and findings',
      currentVersion: 1,
      versions: [
        { version: 1, uploadedBy: 'Deloitte Audit Team', uploadedDate: 'May 28, 2026', fileSize: '0.9 MB', comments: 0 }
      ],
      lastModifiedBy: 'Deloitte Audit Team',
      lastModifiedDate: 'May 28, 2026',
      approvedBy: 'Marc Leblanc (CFO)',
      approvedDate: 'May 28, 2026',
      latestComments: [],
      fileSize: '0.9 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    }
  ],
  'Mandatory - Legal & Governance': [
    {
      id: '4',
      name: 'Articles of Incorporation',
      category: 'Legal',
      categoryGroup: 'Mandatory' as const,
      status: 'verified' as const,
      isMandatory: true,
      description: 'Original and amended articles of incorporation',
      currentVersion: 2,
      versions: [
        { version: 2, uploadedBy: 'Corporate Records', uploadedDate: 'May 25, 2026', fileSize: '0.3 MB', comments: 1 },
        { version: 1, uploadedBy: 'Corporate Records', uploadedDate: 'May 10, 2026', fileSize: '0.3 MB', comments: 2 }
      ],
      lastModifiedBy: 'Corporate Records',
      lastModifiedDate: 'May 25, 2026',
      approvedBy: 'Legal Counsel',
      approvedDate: 'May 25, 2026',
      latestComments: [
        { id: '1', author: 'Legal Counsel', role: 'Securities Counsel', text: 'Amendments 1-5 all properly documented.', date: 'May 25, 2026', avatar: 'LC' }
      ],
      fileSize: '0.3 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    },
    {
      id: '5',
      name: 'Board Resolutions',
      category: 'Governance',
      categoryGroup: 'Mandatory' as const,
      status: 'in-review' as const,
      isMandatory: true,
      description: 'Board resolutions authorizing IPO and equity issuance',
      currentVersion: 2,
      versions: [
        { version: 2, uploadedBy: 'Board Secretary', uploadedDate: 'Jun 1, 2026', fileSize: '1.2 MB', comments: 4 },
        { version: 1, uploadedBy: 'Board Secretary', uploadedDate: 'May 20, 2026', fileSize: '1.0 MB', comments: 6 }
      ],
      lastModifiedBy: 'Board Secretary',
      lastModifiedDate: 'Jun 1, 2026',
      latestComments: [
        { id: '1', author: 'Board Counsel', role: 'Corporate Counsel', text: 'Need updated resolution on stock plan expansion. Reviewing now.', date: 'Jun 2, 2026', avatar: 'BC' },
        { id: '2', author: 'CEO', role: 'CEO', text: 'Working on updated version - will upload by EOD.', date: 'Jun 1, 2026', avatar: 'SC' }
      ],
      fileSize: '1.2 MB',
      completionPercent: 85,
      complianceStatus: 'warnings' as const
    },
    {
      id: '6',
      name: 'Corporate Governance Policies',
      category: 'Governance',
      categoryGroup: 'Mandatory' as const,
      status: 'verified' as const,
      isMandatory: true,
      description: 'Board committee charters, conflict of interest policies, etc.',
      currentVersion: 1,
      versions: [
        { version: 1, uploadedBy: 'Board Secretary', uploadedDate: 'May 22, 2026', fileSize: '2.1 MB', comments: 2 }
      ],
      lastModifiedBy: 'Board Secretary',
      lastModifiedDate: 'May 22, 2026',
      approvedBy: 'Board Chair',
      approvedDate: 'May 22, 2026',
      latestComments: [],
      fileSize: '2.1 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    }
  ],
  'Mandatory - Material Contracts': [
    {
      id: '7',
      name: 'Material Contracts Schedule',
      category: 'Contracts',
      categoryGroup: 'Mandatory' as const,
      status: 'missing' as const,
      isMandatory: true,
      description: 'Complete list and copies of all material contracts',
      currentVersion: 0,
      versions: [],
      lastModifiedBy: '-',
      lastModifiedDate: 'Due: Jun 10, 2026',
      latestComments: [
        { id: '1', author: 'Legal Team', role: 'In-House Counsel', text: 'Awaiting contract summaries from Finance. Target upload Jun 8.', date: 'Jun 3, 2026', avatar: 'LT' }
      ],
      fileSize: '-',
      completionPercent: 0,
      complianceStatus: 'issues' as const
    },
    {
      id: '8',
      name: 'Customer & Vendor Agreements',
      category: 'Contracts',
      categoryGroup: 'Supporting' as const,
      status: 'uploaded' as const,
      isMandatory: false,
      description: 'Top 10 customer contracts and key vendor agreements',
      currentVersion: 1,
      versions: [
        { version: 1, uploadedBy: 'General Counsel', uploadedDate: 'May 30, 2026', fileSize: '3.2 MB', comments: 2 }
      ],
      lastModifiedBy: 'General Counsel',
      lastModifiedDate: 'May 30, 2026',
      latestComments: [
        { id: '1', author: 'Legal Review', role: 'External Counsel', text: 'Ready for disclosure. 2 contracts flagged for customer notification.', date: 'Jun 1, 2026', avatar: 'LR' }
      ],
      fileSize: '3.2 MB',
      completionPercent: 100,
      complianceStatus: 'warnings' as const
    }
  ],
  'Mandatory - Other': [
    {
      id: '9',
      name: 'Capitalization Table',
      category: 'Corporate',
      categoryGroup: 'Mandatory' as const,
      status: 'verified' as const,
      isMandatory: true,
      description: 'Current fully-diluted capitalization table',
      currentVersion: 5,
      versions: [
        { version: 5, uploadedBy: 'CFO', uploadedDate: 'Jun 1, 2026', fileSize: '0.6 MB', comments: 1 },
        { version: 4, uploadedBy: 'CFO', uploadedDate: 'May 28, 2026', fileSize: '0.6 MB', comments: 3 }
      ],
      lastModifiedBy: 'Marc Leblanc (CFO)',
      lastModifiedDate: 'Jun 1, 2026',
      approvedBy: 'External Counsel',
      approvedDate: 'Jun 1, 2026',
      latestComments: [
        { id: '1', author: 'External Counsel', role: 'Securities Counsel', text: 'All option pool allocations verified. Ready for disclosure.', date: 'Jun 1, 2026', avatar: 'EC' }
      ],
      fileSize: '0.6 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    },
    {
      id: '10',
      name: 'Risk Factors',
      category: 'Compliance',
      categoryGroup: 'Mandatory' as const,
      status: 'uploaded' as const,
      isMandatory: true,
      description: 'Comprehensive risk factor analysis for SEC disclosure',
      currentVersion: 3,
      versions: [
        { version: 3, uploadedBy: 'Legal Team', uploadedDate: 'May 30, 2026', fileSize: '1.1 MB', comments: 8 },
        { version: 2, uploadedBy: 'Legal Team', uploadedDate: 'May 25, 2026', fileSize: '0.9 MB', comments: 5 }
      ],
      lastModifiedBy: 'Legal Team',
      lastModifiedDate: 'May 30, 2026',
      latestComments: [
        { id: '1', author: 'SEC Advisor', role: 'External Counsel', text: 'Add 2-3 more competitive landscape risks. Reviewing regulatory risks now.', date: 'Jun 2, 2026', avatar: 'SA' }
      ],
      fileSize: '1.1 MB',
      completionPercent: 90,
      complianceStatus: 'warnings' as const
    }
  ],
  'Supporting Documents': [
    {
      id: '11',
      name: 'Equity Plan Documents',
      category: 'Corporate',
      categoryGroup: 'Supporting' as const,
      status: 'verified' as const,
      isMandatory: false,
      description: 'Employee stock option plans and restricted stock plans',
      currentVersion: 2,
      versions: [
        { version: 2, uploadedBy: 'HR Director', uploadedDate: 'May 25, 2026', fileSize: '0.8 MB', comments: 1 },
        { version: 1, uploadedBy: 'HR Director', uploadedDate: 'May 10, 2026', fileSize: '0.7 MB', comments: 3 }
      ],
      lastModifiedBy: 'HR Director',
      lastModifiedDate: 'May 25, 2026',
      approvedBy: 'Legal Counsel',
      approvedDate: 'May 25, 2026',
      latestComments: [
        { id: '1', author: 'Legal Counsel', role: 'Securities Counsel', text: 'Plans comply with NASDAQ listing standards.', date: 'May 25, 2026', avatar: 'LC' }
      ],
      fileSize: '0.8 MB',
      completionPercent: 100,
      complianceStatus: 'compliant' as const
    },
    {
      id: '12',
      name: 'Management Bios & Disclosures',
      category: 'Governance',
      categoryGroup: 'Supporting' as const,
      status: 'uploaded' as const,
      isMandatory: false,
      description: 'Executive and board member biographies and SEC disclosures',
      currentVersion: 1,
      versions: [
        { version: 1, uploadedBy: 'Board Secretary', uploadedDate: 'May 28, 2026', fileSize: '1.5 MB', comments: 4 }
      ],
      lastModifiedBy: 'Board Secretary',
      lastModifiedDate: 'May 28, 2026',
      latestComments: [
        { id: '1', author: 'Legal Review', role: 'External Counsel', text: 'Add more detail on board independence disclosures.', date: 'Jun 1, 2026', avatar: 'LR' }
      ],
      fileSize: '1.5 MB',
      completionPercent: 85,
      complianceStatus: 'warnings' as const
    }
  ]
}

const STATUS_CONFIG = {
  'verified': { color: '#2D7A5F', bg: '#EBF9F4', label: 'Verified', icon: CheckCircle2 },
  'uploaded': { color: '#1D4ED8', bg: '#F0F4FF', label: 'Uploaded', icon: FileText },
  'in-review': { color: '#B45309', bg: '#FEF3E1', label: 'In Review', icon: Clock },
  'missing': { color: '#E8312A', bg: '#F9E4E1', label: 'Missing', icon: AlertCircle },
  'pending-approval': { color: '#9333EA', bg: '#F3E8FF', label: 'Pending', icon: Clock }
}

const COMPLIANCE_CONFIG = {
  'compliant': { color: '#2D7A5F', label: 'Compliant' },
  'warnings': { color: '#B45309', label: 'Warnings' },
  'issues': { color: '#E8312A', label: 'Issues' }
}

export default function DocumentsPage() {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [showVersions, setShowVersions] = useState<string | null>(null)

  const allDocs = Object.values(DOCUMENT_GROUPS).flat()
  const filteredGroups = Object.entries(DOCUMENT_GROUPS).reduce((acc, [groupName, docs]) => {
    const filtered = docs.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || doc.status === statusFilter
      const matchesCategory = !categoryFilter || doc.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
    if (filtered.length > 0) {
      acc[groupName] = filtered
    }
    return acc
  }, {} as Record<string, typeof allDocs>)

  const stats = {
    total: allDocs.length,
    verified: allDocs.filter(d => d.status === 'verified').length,
    uploaded: allDocs.filter(d => d.status === 'uploaded').length,
    missing: allDocs.filter(d => d.status === 'missing').length,
    completion: Math.round((allDocs.filter(d => d.status !== 'missing').length / allDocs.length) * 100)
  }

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
        {/* Header */}
        <section style={{ padding: '1.5rem', background: '#F7F6F4' }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Document Management</h1>
            <p className="text-text-muted text-sm">Centralized repository for all IPO filing documents. Track versions, approvals, and compliance status.</p>
          </div>
        </section>

        {/* Stats Grid */}
        <section style={{ padding: '1rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { label: 'Total Documents', value: stats.total, icon: FileText, color: '#1A1A1A' },
                { label: 'Verified', value: stats.verified, icon: CheckCircle2, color: '#2D7A5F' },
                { label: 'Uploaded', value: stats.uploaded, icon: FileText, color: '#1D4ED8' },
                { label: 'Missing', value: stats.missing, icon: AlertCircle, color: '#E8312A' },
                { label: 'In Review', value: allDocs.filter(d => d.status === 'in-review').length, icon: Clock, color: '#B45309' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: '1rem',
                    background: '#F7F6F4',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.375rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, margin: 0 }}>
                      {stat.label}
                    </p>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, margin: 0 }}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section style={{ padding: '1rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Search */}
              <div className="flex-1">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                  Search Documents
                </label>
                <div style={{ position: 'relative' }}>
                  <Search className="w-5 h-5" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#717171' }} />
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      fontSize: '0.875rem',
                      border: '1px solid #E5E4E0',
                      borderRadius: '0.375rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                  Filter by Status
                </label>
                <select
                  value={statusFilter || ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.375rem',
                    background: '#FFFFFF',
                    color: '#1A1A1A',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="in-review">In Review</option>
                  <option value="missing">Missing</option>
                  <option value="pending-approval">Pending Approval</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                  Filter by Category
                </label>
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value || null)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.375rem',
                    background: '#FFFFFF',
                    color: '#1A1A1A',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="Financial">Financial</option>
                  <option value="Legal">Legal</option>
                  <option value="Governance">Governance</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Document Groups */}
        <section style={{ padding: '1rem' }}>
          <div className="max-w-7xl mx-auto space-y-6">
            {Object.entries(filteredGroups).map(([ groupName, docs ], groupIdx) => {
              const isMandatoryGroup = groupName.includes('Mandatory')
              const completedInGroup = docs.filter(d => d.status !== 'missing').length
              const groupProgress = Math.round((completedInGroup / docs.length) * 100)

              return (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: groupIdx * 0.1 }}
                  style={{
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    border: isMandatoryGroup ? '2px solid #E8312A' : '1px solid #E5E4E0',
                    background: '#FFFFFF'
                  }}
                >
                  {/* Group Header */}
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === groupName ? null : groupName)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: isMandatoryGroup ? '#F9E4E1' : '#F9F9F9',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isMandatoryGroup ? '#F3D5D0' : '#F0F0F0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isMandatoryGroup ? '#F9E4E1' : '#F9F9F9')}
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        {isMandatoryGroup && (
                          <Star className="w-5 h-5" style={{ color: '#E8312A', fill: '#E8312A' }} />
                        )}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                          {groupName}
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: '0.25rem 0 0 0' }}>
                        {docs.length} document{docs.length !== 1 ? 's' : ''} · {groupProgress}% complete
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <div style={{ width: '120px', height: '6px', background: '#E5E4E0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${groupProgress}%`,
                            height: '100%',
                            background: '#E8312A',
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                      <ChevronDown
                        className="w-5 h-5"
                        style={{
                          color: '#717171',
                          transform: expandedGroup === groupName ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                  </button>

                  {/* Group Documents */}
                  <AnimatePresence>
                    {expandedGroup === groupName && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          borderTop: `1px solid ${isMandatoryGroup ? '#FECACA' : '#E5E4E0'}`,
                          background: '#FFFFFF'
                        }}
                      >
                        {docs.map((doc, docIdx) => {
                          const StatusIcon = STATUS_CONFIG[doc.status].icon
                          const ComplianceIcon = doc.complianceStatus === 'compliant' ? CheckCircle2 : doc.complianceStatus === 'warnings' ? AlertCircle : AlertCircle

                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: docIdx * 0.05 }}
                              style={{
                                borderTop: docIdx > 0 ? '1px solid #E5E4E0' : 'none',
                                padding: '1rem'
                              }}
                            >
                              {/* Document Header */}
                              <button
                                onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '1rem',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  marginBottom: expandedDoc === doc.id ? '1rem' : 0
                                }}
                              >
                                <FileText className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#717171' }} />
                                <div className="flex-1 text-left">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                                      {doc.name}
                                    </h3>
                                    {doc.isMandatory && (
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', background: '#FEE2E2', color: '#DC2626', borderRadius: '0.25rem' }}>
                                        Mandatory
                                      </span>
                                    )}
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        background: STATUS_CONFIG[doc.status].bg,
                                        borderRadius: '0.375rem'
                                      }}
                                    >
                                      <StatusIcon className="w-3 h-3" style={{ color: STATUS_CONFIG[doc.status].color }} />
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: STATUS_CONFIG[doc.status].color }}>
                                        {STATUS_CONFIG[doc.status].label}
                                      </span>
                                    </div>
                                    {(doc as any).approvedBy && (
                                      <span style={{ fontSize: '0.75rem', color: '#2D7A5F', fontWeight: 600 }}>
                                        ✓ Approved by {(doc as any).approvedBy}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ fontSize: '0.875rem', color: '#717171', margin: '0.5rem 0 0 0' }}>
                                    {doc.description}
                                  </p>
                                </div>

                                {/* Right Side Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {doc.currentVersion > 0 && (
                                      <p style={{ fontSize: '0.75rem', color: '#717171', margin: 0 }}>
                                        v{doc.currentVersion} · {doc.fileSize}
                                      </p>
                                    )}
                                    <p style={{ fontSize: '0.75rem', color: '#717171', margin: 0 }}>
                                      {doc.lastModifiedDate}
                                    </p>
                                    {doc.latestComments.length > 0 && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                        <MessageSquare className="w-3 h-3" style={{ color: '#B45309' }} />
                                        <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 600 }}>
                                          {doc.latestComments.length} comment{doc.latestComments.length !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <ChevronDown
                                    className="w-5 h-5"
                                    style={{
                                      color: '#717171',
                                      transform: expandedDoc === doc.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s'
                                    }}
                                  />
                                </div>
                              </button>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {expandedDoc === doc.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                      background: '#F7F6F4',
                                      padding: '1rem',
                                      borderRadius: '0.375rem',
                                      marginTop: '1rem'
                                    }}
                                  >
                                    {/* Latest Comments */}
                                    {doc.latestComments.length > 0 && (
                                      <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.75rem' }}>
                                          Latest Comments
                                        </h4>
                                        <div className="space-y-3">
                                          {doc.latestComments.map(comment => (
                                            <div key={comment.id} style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '0.375rem', borderLeft: '3px solid #B45309' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <div
                                                  style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: '#1D4ED8',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#FFFFFF',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                  }}
                                                >
                                                  {comment.avatar}
                                                </div>
                                                <div>
                                                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                                                    {comment.author}
                                                  </p>
                                                  <p style={{ fontSize: '0.75rem', color: '#717171', margin: 0 }}>
                                                    {comment.role} · {comment.date}
                                                  </p>
                                                </div>
                                              </div>
                                              <p style={{ fontSize: '0.875rem', color: '#1A1A1A', margin: '0.5rem 0 0 0' }}>
                                                {comment.text}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Version History */}
                                    {doc.currentVersion > 0 && (
                                      <div style={{ marginBottom: '1.5rem' }}>
                                        <button
                                          onClick={() => setShowVersions(showVersions === doc.id ? null : doc.id)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            color: '#1D4ED8',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            marginBottom: showVersions === doc.id ? '0.75rem' : 0
                                          }}
                                        >
                                          <History className="w-4 h-4" />
                                          Version History ({doc.versions.length})
                                          <ChevronDown
                                            className="w-4 h-4"
                                            style={{
                                              transform: showVersions === doc.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                              transition: 'transform 0.2s'
                                            }}
                                          />
                                        </button>
                                        <AnimatePresence>
                                          {showVersions === doc.id && (
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0 }}
                                              className="space-y-2"
                                            >
                                              {doc.versions.map((v, idx) => (
                                                <div key={idx} style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontWeight: 600, color: '#1A1A1A' }}>v{v.version}</span>
                                                    <span style={{ color: '#717171' }}>{v.fileSize}</span>
                                                  </div>
                                                  <p style={{ color: '#717171', margin: '0.25rem 0', fontSize: '0.75rem' }}>
                                                    {v.uploadedBy} · {v.uploadedDate}
                                                  </p>
                                                  {v.comments > 0 && (
                                                    <p style={{ color: '#B45309', margin: '0.25rem 0', fontSize: '0.75rem', fontWeight: 600 }}>
                                                      {v.comments} comment{v.comments !== 1 ? 's' : ''}
                                                    </p>
                                                  )}
                                                </div>
                                              ))}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
                                      <button
                                        style={{
                                          padding: '0.75rem 1rem',
                                          background: '#E8312A',
                                          color: '#FFFFFF',
                                          fontWeight: 700,
                                          fontSize: '0.875rem',
                                          border: 'none',
                                          borderRadius: '0.375rem',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '0.5rem',
                                          transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#D12620')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
                                      >
                                        <Upload className="w-4 h-4" />
                                        Upload
                                      </button>
                                      {doc.currentVersion > 0 && (
                                        <>
                                          <button
                                            style={{
                                              padding: '0.75rem 1rem',
                                              background: '#FFFFFF',
                                              color: '#1D4ED8',
                                              fontWeight: 700,
                                              fontSize: '0.875rem',
                                              border: '1px solid #1D4ED8',
                                              borderRadius: '0.375rem',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '0.5rem'
                                            }}
                                          >
                                            <Eye className="w-4 h-4" />
                                            View
                                          </button>
                                          <button
                                            style={{
                                              padding: '0.75rem 1rem',
                                              background: '#FFFFFF',
                                              color: '#1A1A1A',
                                              fontWeight: 700,
                                              fontSize: '0.875rem',
                                              border: '1px solid #E5E4E0',
                                              borderRadius: '0.375rem',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '0.5rem'
                                            }}
                                          >
                                            <Download className="w-4 h-4" />
                                            Download
                                          </button>
                                          <button
                                            style={{
                                              padding: '0.75rem 1rem',
                                              background: '#FFFFFF',
                                              color: '#717171',
                                              fontWeight: 700,
                                              fontSize: '0.875rem',
                                              border: '1px solid #E5E4E0',
                                              borderRadius: '0.375rem',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '0.5rem'
                                            }}
                                          >
                                            <MessageSquare className="w-4 h-4" />
                                            Comment
                                          </button>
                                          <button
                                            style={{
                                              padding: '0.75rem 1rem',
                                              background: '#FFFFFF',
                                              color: '#717171',
                                              fontWeight: 700,
                                              fontSize: '0.875rem',
                                              border: '1px solid #E5E4E0',
                                              borderRadius: '0.375rem',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '0.5rem'
                                            }}
                                          >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {Object.keys(filteredGroups).length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#FFFFFF', borderRadius: '0.5rem' }}>
                <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#717171' }} />
                <p style={{ fontSize: '1rem', color: '#717171' }}>No documents match your filters</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
