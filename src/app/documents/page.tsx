'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  Upload, Download, Eye, Trash2, CheckCircle2, AlertCircle, Clock,
  FileText, Filter, Search, ChevronDown, ChevronUp
} from 'lucide-react'

interface Document {
  id: string
  name: string
  category: string
  status: 'verified' | 'uploaded' | 'missing' | 'required'
  uploadedDate?: string
  uploadedBy?: string
  fileSize?: string
  version?: number
  description: string
}

const DOCUMENTS: Document[] = [
  // Mandatory - Verified
  {
    id: '1',
    name: 'Prospectus (Form S-1)',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'Jun 3, 2026',
    uploadedBy: 'Sarah Chen (CEO)',
    fileSize: '2.3 MB',
    version: 3,
    description: 'Audited statements, projections, and tax filings'
  },
  {
    id: '2',
    name: 'Financial Statements (10-K style)',
    category: 'Mandatory',
    status: 'uploaded',
    uploadedDate: 'Jun 2, 2026',
    uploadedBy: 'Marc Leblanc (CFO)',
    fileSize: '1.8 MB',
    version: 2,
    description: 'Audited statements, projections, and tax filings'
  },
  {
    id: '3',
    name: 'Audit Report',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'May 28, 2026',
    uploadedBy: 'Auditor Team',
    fileSize: '0.9 MB',
    version: 1,
    description: 'Independent auditor\'s report on financial statements'
  },
  {
    id: '4',
    name: 'Legal Opinion',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'May 25, 2026',
    uploadedBy: 'Legal Counsel',
    fileSize: '0.5 MB',
    version: 1,
    description: 'Legal opinion on incorporation and corporate authority'
  },
  {
    id: '5',
    name: 'Board Resolutions',
    category: 'Mandatory',
    status: 'uploaded',
    uploadedDate: 'May 20, 2026',
    uploadedBy: 'Board Secretary',
    fileSize: '1.2 MB',
    version: 2,
    description: 'Board resolutions authorizing IPO'
  },
  {
    id: '6',
    name: 'Articles of Incorporation',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'May 15, 2026',
    uploadedBy: 'Corporate Records',
    fileSize: '0.3 MB',
    version: 1,
    description: 'Original articles of incorporation'
  },
  {
    id: '7',
    name: 'Bylaws',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'May 15, 2026',
    uploadedBy: 'Corporate Records',
    fileSize: '0.4 MB',
    version: 1,
    description: 'Current bylaws with all amendments'
  },
  {
    id: '8',
    name: 'Cap Table',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'Jun 1, 2026',
    uploadedBy: 'CFO',
    fileSize: '0.6 MB',
    version: 5,
    description: 'Current capitalization table'
  },
  {
    id: '9',
    name: 'MD&A',
    category: 'Mandatory',
    status: 'missing',
    description: 'Management discussion and analysis'
  },
  {
    id: '10',
    name: 'Risk Factors',
    category: 'Mandatory',
    status: 'uploaded',
    uploadedDate: 'May 30, 2026',
    uploadedBy: 'Legal Team',
    fileSize: '1.1 MB',
    version: 3,
    description: 'Risk factors for SEC filing'
  },
  {
    id: '11',
    name: 'Corporate Governance',
    category: 'Mandatory',
    status: 'verified',
    uploadedDate: 'May 22, 2026',
    uploadedBy: 'Board Secretary',
    fileSize: '2.1 MB',
    version: 1,
    description: 'Corporate governance policies and practices'
  },
  {
    id: '12',
    name: 'Escrow Agreement',
    category: 'Mandatory',
    status: 'missing',
    description: 'Escrow arrangement agreements'
  }
]

const STATUS_CONFIG = {
  verified: { color: '#2D7A5F', bgColor: '#EBF9F4', icon: CheckCircle2, label: 'Verified' },
  uploaded: { color: '#1D4ED8', bgColor: '#F0F4FF', icon: FileText, label: 'Uploaded' },
  missing: { color: '#E8312A', bgColor: '#F9E4E1', icon: AlertCircle, label: 'Missing' },
  required: { color: '#B45309', bgColor: '#FEF3E1', icon: Clock, label: 'Required' }
}

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['Mandatory']
  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const stats = {
    total: DOCUMENTS.length,
    verified: DOCUMENTS.filter(d => d.status === 'verified').length,
    uploaded: DOCUMENTS.filter(d => d.status === 'uploaded').length,
    missing: DOCUMENTS.filter(d => d.status === 'missing').length
  }

  const progressPercent = Math.round(((stats.verified + stats.uploaded) / stats.total) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>
      <Header />

      {/* Hero */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '3rem 1.5rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#F0F4FF', border: '1px solid #1D4ED830', marginBottom: '1rem' }}>
                  <FileText className="w-4 h-4" style={{ color: '#1D4ED8' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1D4ED8' }}>Document Management</span>
                </div>

                <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: '1rem' }}>
                  SEC Filing Documents
                </h1>

                <p style={{ fontSize: '1rem', color: '#717171', maxWidth: '42rem' }}>
                  Upload and manage all required documents for your SEC filing. Track status, version history, and completion progress in one place.
                </p>
              </div>

              {/* Progress Circle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  padding: '2rem',
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  minWidth: '150px'
                }}
              >
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E5E4E0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E8312A"
                      strokeWidth="8"
                      strokeDasharray={`${(progressPercent / 100) * 282.7} 282.7`}
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                      {progressPercent}%
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#717171', margin: 0 }}>Complete</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, margin: 0 }}>
                  {stats.verified + stats.uploaded} of {stats.total} docs
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section style={{ padding: '2rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Total Documents', value: stats.total, color: '#1A1A1A', icon: FileText },
              { label: 'Verified', value: stats.verified, color: '#2D7A5F', icon: CheckCircle2 },
              { label: 'Uploaded', value: stats.uploaded, color: '#1D4ED8', icon: FileText },
              { label: 'Missing', value: stats.missing, color: '#E8312A', icon: AlertCircle }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
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
      <section style={{ padding: '2rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Search Documents
              </label>
              <div style={{ position: 'relative' }}>
                <Search className="w-5 h-5" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#717171' }} />
                <input
                  type="text"
                  placeholder="Search by document name..."
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
          </div>
        </div>
      </section>

      {/* Documents Grid */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            {filteredDocs.map((doc, idx) => {
              const statusConfig = STATUS_CONFIG[doc.status]
              const StatusIcon = statusConfig.icon
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      border: 'none',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F9F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    <FileText className="w-5 h-5" style={{ color: '#717171', flexShrink: 0 }} />

                    <div className="flex-1 text-left">
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: 0, marginBottom: '0.25rem' }}>
                        {doc.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: 0 }}>
                        {doc.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: statusConfig.bgColor,
                          borderRadius: '0.375rem'
                        }}
                      >
                        <StatusIcon className="w-4 h-4" style={{ color: statusConfig.color }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusConfig.color }}>
                          {statusConfig.label}
                        </span>
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
                          borderTop: '1px solid #E5E4E0',
                          background: '#F9F9F9',
                          padding: '1.5rem'
                        }}
                      >
                        {doc.uploadedDate && (
                          <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Last Upload
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>
                                {doc.uploadedDate}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Uploaded By
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>
                                {doc.uploadedBy}
                              </p>
                            </div>
                            {doc.fileSize && (
                              <div>
                                <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                                  File Size
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>
                                  {doc.fileSize}
                                </p>
                              </div>
                            )}
                            {doc.version && (
                              <div>
                                <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>
                                  Version
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>
                                  v{doc.version}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
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
                          {doc.uploadedDate && (
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
                                  gap: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F0F4FF'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
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
                                  gap: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#1A1A1A'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#E5E4E0'
                                }}
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              <button
                                style={{
                                  padding: '0.75rem 1rem',
                                  background: '#FFFFFF',
                                  color: '#E8312A',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  border: '1px solid #E8312A',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F9E4E1'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
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
          </div>
        </div>
      </section>
    </div>
  )
}
