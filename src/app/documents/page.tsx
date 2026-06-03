'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  FileText, Upload, CheckCircle2, AlertCircle, Clock,
  Download, Search, Cloud, X, ChevronDown,
  History, Shield, Lock, ExternalLink, Database, PackageOpen, Zap, Sparkles, AlertTriangle
} from 'lucide-react'
import ProspectusGeneratorModal from '@/components/ProspectusGeneratorModal'

interface DocVersion {
  id: string
  versionNumber: number
  fileName: string
  fileSizeBytes: number | null
  uploadedByName: string | null
  uploadedAt: string
  isLatest: boolean
  notes: string | null
  storageUrl: string
}

interface Doc {
  id: string
  name: string
  type: string
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadedAt?: string
  phase: string
  required: boolean
  latestVersion?: number
  versions?: DocVersion[]
  versionsLoaded?: boolean
  forFiling?: boolean
  nextStep?: string
}

// Type badge colours — Auditus palette
const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  PIF:        { bg: '#F3F0FF', color: '#6D28D9' },
  Legal:      { bg: '#EFF6FF', color: '#1D4ED8' },
  Governance: { bg: '#F0FDF4', color: '#15803D' },
  Financial:  { bg: '#FEF9C3', color: '#A16207' },
  Prospectus: { bg: '#FEF3C7', color: '#B45309' },
  Regulatory: { bg: '#FEF3C7', color: '#B45309' },
}

const STATUS_CONFIG = {
  verified: { bg: '#EAF5F0', color: '#2D7A5F', border: 'rgba(45,122,95,0.2)', icon: CheckCircle2, label: 'Verified' },
  uploaded: { bg: '#EFF6FF', color: '#1D4ED8', border: 'rgba(29,78,216,0.2)', icon: Clock,         label: 'Under Review' },
  pending:  { bg: '#F7F6F4', color: '#9A9A9A', border: '#E5E4E0',              icon: AlertCircle,   label: 'Pending' },
  rejected: { bg: '#FDECEB', color: '#E8312A', border: 'rgba(232,49,42,0.2)', icon: X,             label: 'Rejected' },
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTs(ts: string): string {
  return new Date(ts).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Map DB row → Doc interface
function rowToDoc(row: Record<string, unknown>): Doc {
  return {
    id:            String(row.id),
    name:          String(row.name),
    type:          String(row.type ?? 'Legal'),
    status:        (row.status as Doc['status']) ?? 'pending',
    uploadedAt:    row.uploaded_at ? String(row.uploaded_at) : undefined,
    phase:         String(row.phase ?? ''),
    required:      Boolean(row.required ?? true),
    forFiling:     Boolean(row.for_filing ?? false),
    nextStep:      row.next_step ? String(row.next_step) : undefined,
    latestVersion: row.latest_version_number != null ? Number(row.latest_version_number) : undefined,
  }
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="rounded-xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.875rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '3.5rem', height: '1.5rem', borderRadius: '0.5rem', background: '#E5E4E0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '0.875rem', borderRadius: '0.25rem', background: '#E5E4E0', marginBottom: '0.375rem', width: '60%' }} />
          <div style={{ height: '0.75rem', borderRadius: '0.25rem', background: '#F0EFEC', width: '35%' }} />
        </div>
        <div style={{ width: '5rem', height: '1.25rem', borderRadius: '9999px', background: '#E5E4E0' }} />
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'uploaded' | 'pending'>('all')
  const [filterType, setFilterType] = useState('all')
  const [filterPhase, setFilterPhase] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [showDriveModal, setShowDriveModal] = useState(false)
  const [showDataRoomModal, setShowDataRoomModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [driveUrl, setDriveUrl] = useState('')
  const [dataRoomUrl, setDataRoomUrl] = useState('')
  const [dataRoomProvider, setDataRoomProvider] = useState('ansarada')
  const [versionNotes, setVersionNotes] = useState('')
  const [exportToast, setExportToast] = useState(false)
  const [showProspectusModal, setShowProspectusModal] = useState(false)
  const [companyName, setCompanyName] = useState('Company') // Will be fetched from session/context

  // Fetch documents from API; if empty, seed first then re-fetch
  async function fetchDocs() {
    try {
      const res = await fetch('/api/documents')
      if (!res.ok) return
      const data = await res.json()
      const fetched: Doc[] = (data.documents ?? []).map(rowToDoc)

      if (fetched.length === 0) {
        // Seed standard checklist for this company
        await fetch('/api/documents/seed', { method: 'POST' })
        // Re-fetch after seeding
        const res2 = await fetch('/api/documents')
        if (!res2.ok) return
        const data2 = await res2.json()
        setDocs((data2.documents ?? []).map(rowToDoc))
      } else {
        setDocs(fetched)
      }
    } catch {
      // silently fail — leave empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const filtered = docs.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (filterType !== 'all' && d.type !== filterType) return false
    if (filterPhase !== 'all' && d.phase !== filterPhase) return false
    return true
  })

  const stats = {
    total:    docs.length,
    verified: docs.filter(d => d.status === 'verified').length,
    uploaded: docs.filter(d => d.status === 'uploaded').length,
    pending:  docs.filter(d => d.status === 'pending').length,
  }

  // Real upload — POST to /api/documents/upload, then update local state
  async function handleUpload(docId: string, file: File) {
    setUploadingId(docId)
    try {
      const formData = new FormData()
      formData.append('documentId', docId)
      formData.append('file', file)
      if (versionNotes) formData.append('notes', versionNotes)

      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()

      setDocs(prev => prev.map(d => {
        if (d.id !== docId) return d
        return {
          ...d,
          status: 'uploaded' as const,
          uploadedAt: new Date().toISOString(),
          latestVersion: result.versionNumber,
          // Invalidate cached versions so they reload from DB on next expand
          versions: undefined,
          versionsLoaded: false,
        }
      }))
      setVersionNotes('')
    } catch {
      // silently fail — user can retry
    } finally {
      setUploadingId(null)
    }
  }

  function handleExportAll() {
    setExportToast(true)
    setTimeout(() => setExportToast(false), 3500)
  }

  // Fetch version history from DB, then expand
  async function toggleExpand(docId: string) {
    if (expandedId === docId) { setExpandedId(null); return }

    const doc = docs.find(d => d.id === docId)
    if (doc && !doc.versionsLoaded) {
      try {
        const res = await fetch(`/api/documents/${docId}/versions`)
        if (res.ok) {
          const data = await res.json()
          const versions: DocVersion[] = (data.versions ?? []).map((v: Record<string, unknown>) => ({
            id:             String(v.id),
            versionNumber:  Number(v.version_number),
            fileName:       String(v.file_name ?? ''),
            fileSizeBytes:  v.file_size_bytes != null ? Number(v.file_size_bytes) : null,
            uploadedByName: v.uploaded_by_name ? String(v.uploaded_by_name) : null,
            uploadedAt:     String(v.uploaded_at ?? v.created_at ?? ''),
            isLatest:       Boolean(v.is_latest),
            notes:          v.notes ? String(v.notes) : null,
            storageUrl:     String(v.storage_url ?? '#'),
          }))
          setDocs(prev => prev.map(d =>
            d.id === docId ? { ...d, versions, versionsLoaded: true } : d
          ))
        }
      } catch {
        // silently fail — panel will just show empty
      }
    }
    setExpandedId(docId)
  }

  // Derive unique type values from loaded docs for filter tabs
  const docTypes = Array.from(new Set(docs.map(d => d.type))).sort()

  return (
    <div className="max-w-5xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} suppressHydrationWarning>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-nav" style={{ marginBottom: '0.25rem' }}>
            Document Workspace
          </h1>
          <p className="text-text-muted text-sm">
            {stats.verified + stats.uploaded}/{stats.total} documents on file ·{' '}
            <span className="text-text-light">every upload is versioned and immutable</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowProspectusModal(true)}
            className="flex items-center gap-2 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
            style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.5rem 0.875rem' }}>
            <Sparkles className="w-4 h-4" /> Generate Prospectus
          </button>
          <button onClick={() => setShowDriveModal(true)}
            className="flex items-center gap-2 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
            style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.5rem 0.875rem' }}>
            <Cloud className="w-4 h-4" /> Connect Drive
          </button>
          <button onClick={() => setShowDataRoomModal(true)}
            className="flex items-center gap-2 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
            style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.5rem 0.875rem' }}>
            <Database className="w-4 h-4" /> Data Room
          </button>
          <button onClick={handleExportAll}
            className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#1A1A1A', color: 'white', padding: '0.5rem 0.875rem' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1A1A1A')}>
            <PackageOpen className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      {/* AI Document Intelligence */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #0c2340 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(29,78,216,0.3)', border: '1px solid rgba(29,78,216,0.4)' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#93C5FD' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-white">AI Document Intelligence</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide"
                  style={{ background: 'rgba(29,78,216,0.3)', color: '#93C5FD', border: '1px solid rgba(29,78,216,0.3)' }}>PHASE 2</span>
              </div>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Analyzing document readiness for Corporate Restructuring → Financial Audit</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-2xl">
              {stats.total > 0
                ? Math.round(((stats.verified + stats.uploaded) / stats.total) * 100)
                : 0}
              <span className="text-base font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>/100</span>
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Readiness Score</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)',
              icon: AlertTriangle, label: '2 Missing Critical Docs',
              text: 'Audited Financial Statements (NI 41-101) and Director PIF forms are required before filing. Delays here block exchange review.',
            },
            {
              color: '#FDE68A', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)',
              icon: Clock, label: '3 Docs Need Review',
              text: 'Your Articles of Incorporation, Board Resolutions, and Shareholder Agreement are uploaded but awaiting legal counsel sign-off.',
            },
            {
              color: '#6EE7B7', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)',
              icon: CheckCircle2, label: 'AI Autofill Available',
              text: '5 governance templates (Insider Trading Policy, Audit Charter, Disclosure Policy) can be AI pre-filled from your existing data in 2 minutes.',
            },
          ].map(({ icon: Icon, color, bg, border, label, text }) => (
            <div key={label} className="rounded-xl p-3.5" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                <p className="text-xs font-semibold" style={{ color }}>{label}</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <a href="/templates" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
            <Sparkles className="w-3 h-3" /> AI Autofill Missing Templates →
          </a>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Populates from your existing company profile, cap table, and team data</p>
        </div>
      </div>


      {/* Version control notice */}
      <div className="flex items-start gap-3 rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.875rem 1rem' }}>
        <Shield className="w-4 h-4 text-accent flex-shrink-0" style={{ marginTop: '0.125rem' }} />
        <div>
          <p className="text-nav text-sm font-semibold" style={{ marginBottom: '0.125rem' }}>Immutable Version Control</p>
          <p className="text-text-muted text-xs leading-relaxed">
            Every upload creates a new version. Previous versions are permanently preserved and read-only.
            No file can ever be overwritten or deleted — full audit trail maintained for due diligence.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Required', value: stats.total,    accent: '#1A1A1A' },
          { label: 'Verified',       value: stats.verified, accent: '#2D7A5F' },
          { label: 'Under Review',   value: stats.uploaded, accent: '#1D4ED8' },
          { label: 'Pending Upload', value: stats.pending,  accent: '#9A9A9A' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border text-center" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1rem' }}>
            <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
            <p className="text-text-light text-xs" style={{ marginTop: '0.125rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Type filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {(['all', ...docTypes] as const).map(t => {
          const ts = t !== 'all' ? (TYPE_STYLE[t] ?? null) : null
          const count = t === 'all' ? docs.length : docs.filter(d => d.type === t).length
          return (
            <button key={t} onClick={() => setFilterType(t)}
              className="text-xs font-semibold rounded-full transition-all"
              style={{
                padding: '0.375rem 0.875rem',
                ...(filterType === t
                  ? (ts ? { background: ts.bg, color: ts.color, border: `1px solid ${ts.color}44` } : { background: '#1A1A1A', color: 'white', border: '1px solid #1A1A1A' })
                  : { background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' })
              }}>
              {t === 'all' ? `All (${count})` : `${t} (${count})`}
            </button>
          )
        })}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: '12rem' }}>
          <Search className="absolute text-text-light" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
            style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.625rem 1rem 0.625rem 2.5rem' }}
            onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
            onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
            placeholder="Search documents..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="rounded-xl border text-nav text-sm outline-none"
          style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.625rem 1rem', minWidth: '9rem' }}>
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="uploaded">Under Review</option>
          <option value="pending">Pending</option>
        </select>
        <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)}
          className="rounded-xl border text-nav text-sm outline-none"
          style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.625rem 1rem', minWidth: '11rem' }}>
          <option value="all">All Phases</option>
          <option value="Pre-Planning">Pre-Planning</option>
          <option value="Corporate Restructuring">Corporate Restructuring</option>
          <option value="Financial Audit">Financial Audit</option>
          <option value="Legal Documentation">Legal Documentation</option>
          <option value="Regulatory Filing">Regulatory Filing</option>
        </select>
      </div>

      {/* Document list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((doc, i) => {
              const sc = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending
              const StatusIcon = sc.icon
              const isExpanded = expandedId === doc.id
              const isUploading = uploadingId === doc.id
              const typeStyle = TYPE_STYLE[doc.type] ?? { bg: '#F7F6F4', color: '#717171' }
              const hasVersions = (doc.latestVersion ?? 0) > 0

              return (
                <motion.div key={doc.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                  className="rounded-xl border overflow-hidden"
                  style={{ background: 'white', borderColor: isExpanded ? '#1A1A1A' : '#E5E4E0', boxShadow: isExpanded ? '0 4px 16px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>

                  {/* Main row */}
                  <div className="flex items-start gap-3" style={{ padding: '0.875rem 1rem' }}>

                    {/* Type badge */}
                    <span className="text-xs font-bold rounded-lg flex-shrink-0"
                      style={{ background: typeStyle.bg, color: typeStyle.color, padding: '0.25rem 0.5rem', minWidth: '3.5rem', textAlign: 'center' }}>
                      {doc.type}
                    </span>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <p className="text-nav text-sm font-medium">{doc.name}</p>
                        {doc.forFiling && (
                          <span className="text-[10px] font-bold flex-shrink-0"
                            style={{ background: '#FDECEB', color: '#E8312A', border: '1px solid rgba(232,49,42,0.2)', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
                            ↑ For Filing
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                        <span className="text-text-light text-xs">{doc.phase}</span>
                        {hasVersions && (
                          <span className="text-xs font-semibold rounded-full"
                            style={{ background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0', padding: '0 0.375rem' }}>
                            v{doc.latestVersion}
                          </span>
                        )}
                        {doc.uploadedAt && (
                          <span className="text-text-light text-xs">· {formatTs(doc.uploadedAt)}</span>
                        )}
                      </div>
                      {doc.nextStep && (doc.status === 'pending' || doc.status === 'uploaded') && (
                        <p className="text-xs leading-relaxed" style={{ marginTop: '0.375rem', color: '#717171' }}>
                          <span className="font-semibold" style={{ color: '#E8312A' }}>Next → </span>
                          {doc.nextStep}
                        </p>
                      )}
                    </div>

                    {/* Status chip */}
                    <div className="flex items-center gap-1 rounded-full flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '0.2rem 0.625rem', fontSize: '11px', fontWeight: 600 }}>
                      {isUploading
                        ? <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        : <StatusIcon className="w-3 h-3" />}
                      <span>{isUploading ? 'Uploading…' : sc.label}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Download latest version */}
                      {hasVersions && (
                        <button className="p-1.5 rounded-lg transition-colors text-text-light hover:text-nav"
                          title="Download latest version">
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      {/* Upload new version */}
                      <label className="cursor-pointer p-1.5 rounded-lg transition-colors text-text-light hover:text-nav"
                        title={hasVersions ? 'Upload new version' : 'Upload'}>
                        <Upload className="w-4 h-4" />
                        <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.xlsx,.xls,.pptx"
                          onChange={e => { if (e.target.files?.[0]) handleUpload(doc.id, e.target.files[0]); e.target.value = '' }} />
                      </label>

                      {/* Version history toggle */}
                      {hasVersions && (
                        <button onClick={() => toggleExpand(doc.id)}
                          className="p-1.5 rounded-lg transition-colors text-text-light hover:text-nav flex items-center gap-1"
                          title="Version history">
                          <History className="w-4 h-4" />
                          <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Version history panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}>
                        <div style={{ borderTop: '1px solid #E5E4E0', background: '#F7F6F4', padding: '0.75rem 1rem' }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: '0.625rem' }}>
                            <Lock className="w-3 h-3 text-text-light" />
                            <p className="text-xs font-semibold text-text-muted">Version History — all versions are read-only and permanently stored</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {(doc.versions ?? []).length === 0 ? (
                              <p className="text-xs text-text-light" style={{ padding: '0.25rem 0' }}>No versions uploaded yet.</p>
                            ) : (doc.versions ?? []).map(v => (
                              <div key={v.id}
                                className="flex items-center gap-3 rounded-lg"
                                style={{ background: v.isLatest ? 'white' : 'transparent', border: v.isLatest ? '1px solid #E5E4E0' : '1px solid transparent', padding: '0.5rem 0.75rem' }}>
                                {/* Version number */}
                                <span className="text-xs font-bold flex-shrink-0"
                                  style={{ color: v.isLatest ? '#1A1A1A' : '#9A9A9A', minWidth: '1.75rem' }}>
                                  v{v.versionNumber}
                                </span>
                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-nav text-xs font-medium truncate">{v.fileName}</p>
                                  <p className="text-text-light text-xs">
                                    {formatBytes(v.fileSizeBytes)} · {formatTs(v.uploadedAt)}
                                    {v.uploadedByName && ` · ${v.uploadedByName}`}
                                    {v.notes && <span className="text-text-muted"> · "{v.notes}"</span>}
                                  </p>
                                </div>
                                {/* Latest badge */}
                                {v.isLatest && (
                                  <span className="text-xs font-bold rounded-full flex-shrink-0"
                                    style={{ background: '#1A1A1A', color: 'white', padding: '0.125rem 0.5rem' }}>
                                    Latest
                                  </span>
                                )}
                                {/* Read-only indicator for old versions */}
                                {!v.isLatest && (
                                  <Lock className="w-3 h-3 text-text-light flex-shrink-0" aria-label="Read-only — permanently preserved" />
                                )}
                                {/* Download */}
                                <a href={v.storageUrl !== '#' ? v.storageUrl : undefined}
                                  target="_blank" rel="noopener noreferrer"
                                  className="p-1 rounded text-text-light hover:text-nav transition-colors flex-shrink-0"
                                  title="Download this version">
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })
        }

        {/* Empty state — only shown when not loading and no results */}
        {!loading && filtered.length === 0 && docs.length > 0 && (
          <div className="rounded-xl border text-center" style={{ background: 'white', borderColor: '#E5E4E0', padding: '3rem 1rem' }}>
            <FileText className="w-8 h-8 mx-auto text-text-light" style={{ marginBottom: '0.75rem' }} />
            <p className="text-nav text-sm font-semibold" style={{ marginBottom: '0.25rem' }}>No documents match your filters</p>
            <p className="text-text-muted text-xs">Try adjusting your search or filters above.</p>
          </div>
        )}
      </div>

      {/* Export toast */}
      <AnimatePresence>
        {exportToast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed flex items-center gap-3 rounded-2xl z-50"
            style={{ bottom: '1.5rem', right: '1.5rem', background: '#1A1A1A', color: 'white', padding: '0.875rem 1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <PackageOpen className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Preparing export…</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{docs.filter(d => d.status !== 'pending').length} documents · latest versions only</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Room modal */}
      <AnimatePresence>
        {showDataRoomModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl"
              style={{ background: 'white', border: '1px solid #E5E4E0', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-nav" />
                  <h2 className="text-nav font-bold text-lg">Map to Data Room</h2>
                </div>
                <button onClick={() => setShowDataRoomModal(false)} className="text-text-light hover:text-nav transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.25rem' }}>
                Link your IPOReady document workspace to your virtual data room. Advisors, underwriters, and auditors access documents directly from your VDR — IPOReady stays as the source of truth.
              </p>

              {/* Provider select */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Data Room Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ansarada', label: 'Ansarada' },
                    { id: 'datasite', label: 'Datasite' },
                    { id: 'intralinks', label: 'Intralinks' },
                    { id: 'custom', label: 'Custom / Other' },
                  ].map(p => (
                    <button key={p.id} type="button" onClick={() => setDataRoomProvider(p.id)}
                      className="rounded-xl border text-sm font-medium transition-all"
                      style={{
                        padding: '0.625rem',
                        ...(dataRoomProvider === p.id
                          ? { background: '#F7F6F4', borderColor: '#1A1A1A', color: '#1A1A1A' }
                          : { background: 'white', borderColor: '#E5E4E0', color: '#717171' })
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Data Room URL</label>
                <input value={dataRoomUrl} onChange={e => setDataRoomUrl(e.target.value)}
                  className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
                  style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.75rem 1rem' }}
                  onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                  placeholder="https://app.ansarada.com/deal/…" />
              </div>

              <div className="rounded-xl border flex items-start gap-2.5" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.75rem', marginBottom: '1.25rem' }}>
                <Shield className="w-4 h-4 text-text-light flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                  IPOReady never uploads files to your data room automatically. This link lets your team navigate directly from each document to the corresponding VDR folder.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowDataRoomModal(false)}
                  className="flex-1 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
                  style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.625rem' }}>
                  Cancel
                </button>
                <button onClick={() => setShowDataRoomModal(false)}
                  className="btn btn-primary flex-1 justify-center">
                  <Database className="w-4 h-4" /> Save Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect Google Drive modal */}
      <AnimatePresence>
        {showDriveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl"
              style={{ background: 'white', border: '1px solid #E5E4E0', padding: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-nav" />
                  <h2 className="text-nav font-bold text-lg">Connect Google Drive</h2>
                </div>
                <button onClick={() => setShowDriveModal(false)} className="text-text-light hover:text-nav transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.25rem' }}>
                Link your Google Drive folder. IPOReady will sync document metadata daily.
                Every sync creates a new version record — your Drive files are never modified.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>
                  Google Drive Folder URL
                </label>
                <input value={driveUrl} onChange={e => setDriveUrl(e.target.value)}
                  className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
                  style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.75rem 1rem' }}
                  onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                  placeholder="https://drive.google.com/drive/folders/…" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDriveModal(false)}
                  className="flex-1 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
                  style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.625rem' }}>
                  Cancel
                </button>
                <button onClick={() => setShowDriveModal(false)}
                  className="btn btn-primary flex-1 justify-center">
                  <Cloud className="w-4 h-4" /> Connect Drive
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prospectus Generator Modal */}
      <ProspectusGeneratorModal
        isOpen={showProspectusModal}
        onClose={() => setShowProspectusModal(false)}
        companyName={companyName}
        onGenerateStart={() => {
          // Optional callback when generation starts
        }}
        onGenerateComplete={(result) => {
          // Optional callback when generation completes
          console.log('Prospectus generated:', result)
        }}
      />
    </div>
  )
}
