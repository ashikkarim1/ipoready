'use client'

/**
 * Documents Page - UNIFIED SOURCE VERSION WITH MISSION CONTROL DESIGN
 *
 * MIGRATION COMPLETE: Now pulls from unified_documents table (ONE SOURCE)
 * All pages query same source = guaranteed consistency
 *
 * DESIGN: Mission Control pattern
 * - Color palette: accent red (#E8312A), success green, warning amber, info blue
 * - Card styling: white cards with subtle borders and hover effects
 * - Typography: Consistent sizing and hierarchy
 * - Status indicators: Draft, In Review, Approved, Archived
 * - Icons: Lucide icons with semantic colors
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock,
  Download, Eye, Trash2, Upload, MessageSquare, History, Share2,
  Filter, Search, MoreVertical, Star, Lock, User, Calendar, Loader,
  ArrowRight, FileCheck, AlertTriangle, ZapOff
} from 'lucide-react'
import { useSession } from 'next-auth/react'

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
  requiredForFiling?: boolean
  currentVersion?: number
  totalVersions?: number
  completeness?: number
  approvedAt?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
  ownerUserId?: string
}

interface DocumentGroup {
  categoryGroup: 'Mandatory' | 'Supporting' | 'Optional'
  category: string
  documents: UnifiedDocument[]
}

// Mission control status indicator styles
function getStatusStyle(status: string) {
  switch (status) {
    case 'approved':
      return {
        bg: 'var(--color-success-soft)',
        color: 'var(--color-success)',
        border: 'rgba(45,122,95,0.2)',
        icon: CheckCircle2,
        label: 'Approved',
      }
    case 'in_review':
      return {
        bg: 'var(--color-warning-soft)',
        color: 'var(--color-warning)',
        border: 'rgba(180,83,9,0.2)',
        icon: Clock,
        label: 'In Review',
      }
    case 'draft':
      return {
        bg: 'var(--color-info-soft)',
        color: 'var(--color-info)',
        border: 'rgba(29,78,216,0.2)',
        icon: FileText,
        label: 'Draft',
      }
    case 'archived':
      return {
        bg: 'var(--color-surface-secondary)',
        color: 'var(--color-text-secondary)',
        border: 'rgba(197,196,192,0.3)',
        icon: ZapOff,
        label: 'Archived',
      }
    default:
      return {
        bg: 'var(--color-surface-secondary)',
        color: 'var(--color-text-secondary)',
        border: 'rgba(197,196,192,0.3)',
        icon: FileText,
        label: status,
      }
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function DocumentsPage() {
  const { data: session } = useSession()
  const companyId = (session?.user as any)?.companyId

  const [documents, setDocuments] = useState<UnifiedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<UnifiedDocument | null>(null)

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
        console.error('[documents] Failed to load:', err)
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
    .filter(doc => !filterStatus || doc.status === filterStatus)
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
    }, {} as Record<string, DocumentGroup>)

  // Calculate stats
  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    inReview: documents.filter(d => d.status === 'in_review').length,
    draft: documents.filter(d => d.status === 'draft').length,
    archived: documents.filter(d => d.status === 'archived').length,
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="serif" style={{ fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Document Library
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Centralized unified source — all documents synchronized across the platform
              </p>
            </div>
            <a href="/dashboard/documents/upload" className="btn"
              style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', textDecoration: 'none' }}>
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </a>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-error-soft)', border: '1px solid rgba(232,49,42,0.2)', borderRadius: '12px', display: 'flex', gap: '0.75rem' }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-accent)', marginTop: '0.125rem' }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Error loading documents</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
        >
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'var(--color-text-primary)', bg: 'var(--color-surface-light)' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
            { label: 'In Review', value: stats.inReview, icon: Clock, color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' },
            { label: 'Draft', value: stats.draft, icon: AlertTriangle, color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => setFilterStatus(label.toLowerCase() === 'total' ? null : label.toLowerCase().replace(' ', '_'))}
              className="card"
              style={{
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                textDecoration: 'none',
                border: filterStatus === (label.toLowerCase() === 'total' ? null : label.toLowerCase().replace(' ', '_')) ? `2px solid ${color}` : '1px solid #E5E4E0',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{value}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}
        >
          <div style={{ position: 'relative' }}>
            <Search className="w-5 h-5" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #E5E4E0',
                borderRadius: '12px',
                background: 'var(--color-surface-primary)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
            />
          </div>
          {filterStatus && (
            <button
              onClick={() => setFilterStatus(null)}
              className="badge"
              style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)', border: '1px solid rgba(29,78,216,0.2)', cursor: 'pointer' }}
            >
              Clear Filter
            </button>
          )}
        </motion.div>

        {/* Document Groups */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {Object.entries(groupedDocuments)
            .sort(([keyA], [keyB]) => {
              const orderMap = { 'Mandatory': 0, 'Supporting': 1, 'Optional': 2 }
              const groupA = groupedDocuments[keyA].categoryGroup
              const groupB = groupedDocuments[keyB].categoryGroup
              return orderMap[groupA as keyof typeof orderMap] - orderMap[groupB as keyof typeof orderMap]
            })
            .map(([key, group], groupIndex) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + groupIndex * 0.1 }}
              >
                {/* Group Header */}
                <button
                  onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                  className="card card-hover"
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: group.categoryGroup === 'Mandatory' ? 'var(--color-error-soft)' : 'var(--color-surface-primary)',
                    borderColor: group.categoryGroup === 'Mandatory' ? 'rgba(232,49,42,0.2)' : '#E5E4E0',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: group.categoryGroup === 'Mandatory' ? '#E8312A15' : 'var(--color-surface-secondary)',
                      flexShrink: 0
                    }}>
                      <FileText className="w-5 h-5" style={{ color: group.categoryGroup === 'Mandatory' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                        {group.categoryGroup} — {group.category}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge" style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-secondary)', border: 'none', fontSize: '0.8rem' }}>
                      {group.documents.length}
                    </span>
                    {expandedCategory === key ? (
                      <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    )}
                  </div>
                </button>

                {/* Documents List */}
                <AnimatePresence>
                  {expandedCategory === key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}
                    >
                      {group.documents.map((doc, docIndex) => {
                        const statusStyle = getStatusStyle(doc.status)
                        const StatusIcon = statusStyle.icon

                        return (
                          <motion.button
                            key={doc.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: docIndex * 0.05 }}
                            onClick={() => setSelectedDocument(doc)}
                            className="card card-hover"
                            style={{
                              padding: '1rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              textAlign: 'left',
                              textDecoration: 'none',
                              background: doc.status === 'approved' ? 'var(--color-success-soft)' : 'var(--color-surface-primary)',
                              borderColor: doc.status === 'approved' ? 'rgba(45,122,95,0.2)' : '#E5E4E0',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: statusStyle.bg,
                                flexShrink: 0
                              }}>
                                <FileText className="w-4 h-4" style={{ color: statusStyle.color }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                                  {doc.displayName || doc.name}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    v{doc.currentVersion || 1}
                                  </span>
                                  {doc.fileSize && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                      {formatFileSize(doc.fileSize)}
                                    </span>
                                  )}
                                  {doc.commentCount > 0 && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <MessageSquare className="w-3 h-3" />
                                      {doc.commentCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                              <span className="badge" style={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                border: `1px solid ${statusStyle.border}`,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}>
                                {statusStyle.label}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={e => {
                                  e.stopPropagation()
                                }}
                                style={{
                                  background: 'var(--color-surface-secondary)',
                                  border: '1px solid #E5E4E0',
                                  borderRadius: '8px',
                                  padding: '0.5rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--color-text-secondary)',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLElement).style.background = '#E5E4E0'
                                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-secondary)'
                                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={e => {
                                  e.stopPropagation()
                                }}
                                style={{
                                  background: 'var(--color-surface-secondary)',
                                  border: '1px solid #E5E4E0',
                                  borderRadius: '8px',
                                  padding: '0.5rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--color-text-secondary)',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLElement).style.background = '#E5E4E0'
                                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-secondary)'
                                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
                                }}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </div>

        {/* Empty State */}
        {Object.keys(groupedDocuments).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'var(--color-surface-light)',
              borderColor: '#E5E4E0',
            }}
          >
            <FileText className="w-12 h-12" style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              No documents found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {searchTerm || filterStatus ? 'Try adjusting your search or filter' : 'Start by uploading your first document'}
            </p>
            {!searchTerm && !filterStatus && (
              <a href="/dashboard/documents/upload" className="btn"
                style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', textDecoration: 'none', display: 'inline-flex' }}>
                <Upload className="w-4 h-4" />
                Upload Document
              </a>
            )}
          </motion.div>
        )}

        {/* Unified Source Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
          style={{
            marginTop: '3rem',
            padding: '1.25rem',
            background: 'var(--color-info-soft)',
            borderColor: 'rgba(29,78,216,0.2)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-info)', marginBottom: '0.25rem' }}>
              Unified Source Active
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
              All pages query the unified_documents table. Zero document duplication guaranteed.
              Reconciliation runs hourly to ensure perfect consistency across the platform.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
