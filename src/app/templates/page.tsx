'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, CheckCircle2, Search,
  Eye, AlertTriangle, CheckCheck, X, FolderOpen,
  RotateCcw, Pencil, ChevronDown, ChevronUp,
  Sparkles, Shield, Info, ExternalLink
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

interface Template {
  id: string; name: string; category: string; description: string
  exchanges: string[]; listingTypes: string[]; isFree: boolean
  officialBody: string; pages: number; autoFill: boolean
  downloadCount: number; lastUpdated: string; citation?: string; popular?: boolean
  aiFields: AiField[]; sourceUrl?: string
  prerequisites: string[]
}

interface AiField { label: string; value: string; status: 'prefilled' | 'partial' | 'manual' }
type DocStatus = 'loaded' | 'ai_populating' | 'ready_for_review' | 'approved'

interface TemplateDoc {
  id: string; templateId: string; docName: string; category: string
  status: DocStatus; aiPopulated: boolean; downloadedAt: string; notes: string
}

const TEMPLATES: Template[] = [
  { id: '1', name: 'Personal Information Form (PIF) — TSX/TSXV', category: 'Regulatory', description: 'Official TSX/TSXV Personal Information Form for directors, officers, promoters, and key shareholders. Required for all listing applications.', exchanges: ['TSX', 'TSXV'], listingTypes: ['IPO', 'RTO'], isFree: false, officialBody: 'TSX Group', pages: 12, autoFill: true, downloadCount: 1240, lastUpdated: '2025-01-15', citation: 'TSX Appendix A / TSXV Form 2B', popular: true, sourceUrl: 'https://www.tsx.com/listings/listing-with-us/forms-and-applications', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Target Exchange', value: 'TSXV', status: 'prefilled' }, { label: 'Listing Type', value: 'IPO', status: 'prefilled' }, { label: 'Fiscal Year End', value: 'December 31', status: 'prefilled' }, { label: 'Officer Full Names', value: '3 officers on file', status: 'prefilled' }, { label: 'Officer Addresses', value: 'Needs manual entry', status: 'manual' }, { label: 'Date of Birth (each officer)', value: 'Needs manual entry', status: 'manual' }, { label: 'Criminal History Declarations', value: 'Needs manual entry', status: 'manual' }, { label: 'Director Certifications', value: 'Requires wet signature', status: 'manual' }], prerequisites: ['Company profile & legal name', 'Officer & director list with titles', 'Cap table with ownership %', 'Incorporation documents'] },
  { id: '2', name: 'PIF — CSE', category: 'Regulatory', description: 'CSE-specific Personal Information Form for all officers, directors, and promoters.', exchanges: ['CSE'], listingTypes: ['IPO', 'RTO'], isFree: false, officialBody: 'CSE', pages: 10, autoFill: true, downloadCount: 542, lastUpdated: '2025-01-15', citation: 'CSE Policy 2 — Directors, Officers, Promoters', sourceUrl: 'https://thecse.com/en/listings/listing-requirements/listing-forms', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Target Exchange', value: 'CSE', status: 'prefilled' }, { label: 'Officer Names & Titles', value: '3 officers on file', status: 'prefilled' }, { label: 'Date of Birth (each)', value: 'Needs manual entry', status: 'manual' }, { label: 'Residential History (10 yr)', value: 'Needs manual entry', status: 'manual' }], prerequisites: ['Company profile & legal name', 'Officer & director list with titles', 'Residential history per officer (10 yr)'] },
  { id: '3', name: 'Preliminary Prospectus Template — Canadian Issuer', category: 'Prospectus', description: 'Comprehensive preliminary prospectus template for Canadian issuers listing on TSXV, CSE, or TSX. Includes all required sections under NI 41-101 Form 41-101F1.', exchanges: ['TSX', 'TSXV', 'CSE'], listingTypes: ['IPO'], isFree: false, officialBody: 'CSA (SEDAR+)', pages: 45, autoFill: true, downloadCount: 312, lastUpdated: '2025-02-01', citation: 'NI 41-101 Form 41-101F1', popular: true, sourceUrl: 'https://www.sedarplus.ca', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Target Exchange & Market', value: 'TSXV — Tier 2', status: 'prefilled' }, { label: 'Fiscal Year End', value: 'December 31', status: 'prefilled' }, { label: 'Officers & Directors Table', value: '6 persons on file', status: 'prefilled' }, { label: 'Use of Proceeds Outline', value: 'Partial — needs amounts', status: 'partial' }, { label: 'Business Description', value: 'Draft outline generated', status: 'partial' }, { label: 'Audited Financial Statements', value: 'Attach separately', status: 'manual' }, { label: 'Risk Factors', value: 'Needs legal counsel review', status: 'manual' }, { label: 'MD&A', value: 'Needs CFO input', status: 'manual' }], prerequisites: ['Audited financials (2+ years, IFRS)', 'Cap table data', 'Use of Proceeds outline', 'Officer & director bios', 'Business description draft', 'Material contracts list'] },
  { id: '4', name: 'SEC Form S-1 Registration Statement', category: 'Prospectus', description: 'US IPO registration statement template for companies listing on NASDAQ or NYSE. Includes all SEC-required exhibits and certifications.', exchanges: ['NASDAQ', 'NYSE'], listingTypes: ['IPO'], isFree: false, officialBody: 'SEC EDGAR', pages: 60, autoFill: false, downloadCount: 198, lastUpdated: '2025-01-20', citation: 'SEC Regulation C; Item 11 of Form S-1', sourceUrl: 'https://www.sec.gov/forms', aiFields: [], prerequisites: [] },
  { id: '5', name: 'Audit Committee Charter', category: 'Governance', description: 'Board-level Audit Committee Charter meeting NI 52-110 and NASDAQ Rule 5605 requirements.', exchanges: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE'], listingTypes: ['IPO', 'RTO', 'Direct Listing'], isFree: false, officialBody: 'Internal / CSA', pages: 8, autoFill: true, downloadCount: 876, lastUpdated: '2025-03-01', citation: 'NI 52-110; NASDAQ Rule 5605(c)', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Effective Date', value: 'Needs date confirmation', status: 'partial' }, { label: 'Committee Member Names', value: '2 independent directors on file', status: 'prefilled' }, { label: 'Financial Expert Designation', value: 'Needs board resolution', status: 'manual' }], prerequisites: ['Board composition (director names & independence status)', 'Company legal name & jurisdiction', 'Board meeting minutes authorizing committee'] },
  { id: '6', name: 'Code of Business Conduct & Ethics', category: 'Governance', description: 'Comprehensive Code of Business Conduct tailored for public companies.', exchanges: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC'], listingTypes: ['IPO', 'RTO', 'Direct Listing'], isFree: false, officialBody: 'Internal / CSA', pages: 14, autoFill: true, downloadCount: 1102, lastUpdated: '2025-02-15', citation: 'NI 58-101 s.1.1(a); NASDAQ Rule 5610', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Effective Date', value: 'Needs date confirmation', status: 'partial' }, { label: 'Board Approver Name', value: 'Needs manual entry', status: 'manual' }], prerequisites: ['Company legal name', 'Board approval date', 'Senior officer signing authority'] },
  { id: '7', name: 'Insider Trading Policy', category: 'Governance', description: 'Insider trading and blackout period policy with mandatory 10b5-1 plan provisions.', exchanges: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE'], listingTypes: ['IPO', 'RTO', 'Direct Listing'], isFree: false, officialBody: 'Internal / CSA', pages: 10, autoFill: true, downloadCount: 945, lastUpdated: '2025-03-15', citation: 'SEC Rule 10b5-1; OSC Staff Notice 55-701', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Insiders List', value: '6 persons on file', status: 'prefilled' }, { label: 'Blackout Period Dates', value: 'Needs CFO to confirm', status: 'partial' }], prerequisites: ['Insider list (officers, directors, 10%+ shareholders)', 'Blackout period calendar from CFO', 'Company legal name'] },
  { id: '8', name: 'Disclosure Policy', category: 'Governance', description: 'Regulatory disclosure and material change reporting policy meeting Reg FD and NI 51-102.', exchanges: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE'], listingTypes: ['IPO', 'RTO', 'Direct Listing'], isFree: true, officialBody: 'Internal / CSA', pages: 8, autoFill: true, downloadCount: 2341, lastUpdated: '2025-01-10', citation: 'SEC Reg FD; NI 51-102 s.3', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Target Exchange', value: 'TSXV', status: 'prefilled' }, { label: 'IR Contact Name', value: 'Needs manual entry', status: 'manual' }], prerequisites: ['Company legal name & exchange target', 'IR contact name & title', 'Board approval date'] },
  { id: '9', name: 'Whistleblower Policy', category: 'Governance', description: 'SOX-compliant whistleblower policy with anonymous reporting procedures.', exchanges: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE'], listingTypes: ['IPO', 'RTO', 'Direct Listing'], isFree: true, officialBody: 'Internal / CSA', pages: 6, autoFill: false, downloadCount: 1876, lastUpdated: '2025-01-10', citation: 'SOX Section 301; NI 58-101', aiFields: [], prerequisites: [] },
  { id: '10', name: 'Stock Option Plan (Rolling 10%)', category: 'Legal', description: 'TSXV-compliant rolling 10% stock option plan template.', exchanges: ['TSXV', 'CSE'], listingTypes: ['IPO', 'RTO'], isFree: false, officialBody: 'TSX / TSXV', pages: 18, autoFill: true, downloadCount: 654, lastUpdated: '2025-02-01', citation: 'TSX Company Manual s.613', sourceUrl: 'https://www.tsx.com/listings/listing-with-us/forms-and-applications', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Total Authorized Shares', value: 'Needs cap table data', status: 'partial' }, { label: 'Option Pool Size (10%)', value: 'Calculated from cap table', status: 'partial' }, { label: 'Plan Administrator', value: 'Needs board resolution', status: 'manual' }], prerequisites: ['Cap table data (authorized & issued shares)', 'Board resolution for plan adoption', 'Total shares authorized figure'] },
  { id: '11', name: 'Lock-Up Agreement Template', category: 'Legal', description: 'Standard form lock-up agreement for IPO insiders and major shareholders.', exchanges: ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE'], listingTypes: ['IPO'], isFree: false, officialBody: 'TSXV', pages: 6, autoFill: true, downloadCount: 487, lastUpdated: '2025-02-20', citation: 'FINRA Rule 5110; TSX Company Manual s.602', sourceUrl: 'https://www.tsx.com/listings/listing-with-us/forms-and-applications', aiFields: [{ label: 'Company Legal Name', value: 'TechCorp Technologies Inc.', status: 'prefilled' }, { label: 'Lock-up Period', value: 'Needs underwriter confirmation', status: 'partial' }, { label: 'Insider Names & Holdings', value: 'From cap table — 6 insiders', status: 'prefilled' }, { label: 'Release Schedule', value: 'Needs legal counsel input', status: 'manual' }], prerequisites: ['Cap table data with insider shareholdings', 'Underwriter term sheet (lock-up period)', 'Legal counsel input on release schedule'] },
]

const CATEGORY_STYLE: Record<string, { text: string; bg: string }> = {
  Regulatory: { text: '#DC2626', bg: '#FEE2E2' },
  Prospectus:  { text: '#B45309', bg: '#FEF3C7' },
  Governance:  { text: '#15803D', bg: '#DCFCE7' },
  Legal:       { text: '#1D4ED8', bg: '#DBEAFE' },
}

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  loaded:           { label: 'Template Loaded',   color: '#1D4ED8', bg: '#EFF6FF',  icon: FolderOpen },
  ai_populating:    { label: 'AI Populating…',     color: '#7C3AED', bg: '#F5F3FF',  icon: Sparkles },
  ready_for_review: { label: 'Ready for Review',   color: '#B45309', bg: '#FFFBEB',  icon: Eye },
  approved:         { label: 'Approved',            color: '#15803D', bg: '#F0FDF4',  icon: CheckCheck },
}

export default function TemplatesPage() {
  const { currency, company } = useAppStore()
  // Real company identifiers (fall back to demo values)
  const companyName = company?.name ?? 'Your Company Inc.'
  const targetExchange = company?.targetExchange?.toUpperCase() ?? 'TSXV'
  const listingType = company?.listingType?.toUpperCase() ?? 'IPO'

  // Personalize AI fields — swap demo placeholders with real company data
  function personalizeFields(fields: AiField[]): AiField[] {
    return fields.map(f => ({
      ...f,
      value: f.value
        .replace('TechCorp Technologies Inc.', companyName)
        .replace(/\bTSXV\b/, targetExchange)
        .replace(/\bIPO\b/, listingType),
    }))
  }
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterExchange, setFilterExchange] = useState('all')
  const [docs, setDocs] = useState<TemplateDoc[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [modalStep, setModalStep] = useState<'detail' | 'name' | 'ai_preview' | null>(null)
  const [docName, setDocName] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [docNoteEdit, setDocNoteEdit] = useState<{ id: string; value: string } | null>(null)

  const filtered = TEMPLATES.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (filterExchange !== 'all' && !t.exchanges.includes(filterExchange)) return false
    return true
  })

  function openDownload(template: Template) {
    setSelectedTemplate(template)
    setDocName(template.name)
    setModalStep('name')
  }

  function downloadBlank() {
    if (!selectedTemplate || !docName.trim()) return
    setDocs(d => [{ id: Date.now().toString(), templateId: selectedTemplate.id, docName: docName.trim(), category: selectedTemplate.category, status: 'loaded', aiPopulated: false, downloadedAt: new Date().toLocaleDateString('en-CA'), notes: '' }, ...d])
    setModalStep(null)
    setSelectedTemplate(null)
  }

  function confirmAiPopulate() {
    if (!selectedTemplate || !docName.trim()) return
    const docId = Date.now().toString()
    setDocs(d => [{ id: docId, templateId: selectedTemplate.id, docName: docName.trim(), category: selectedTemplate.category, status: 'ai_populating', aiPopulated: true, downloadedAt: new Date().toLocaleDateString('en-CA'), notes: '' }, ...d])
    setAiProcessing(true)
    setModalStep(null)
    setSelectedTemplate(null)
    setTimeout(() => { setDocs(d => d.map(doc => doc.id === docId ? { ...doc, status: 'ready_for_review' } : doc)); setAiProcessing(false) }, 2800)
  }

  function markApproved(id: string) { setDocs(d => d.map(doc => doc.id === id ? { ...doc, status: 'approved' } : doc)) }
  function markNeedsRevision(id: string) { setDocs(d => d.map(doc => doc.id === id ? { ...doc, status: 'loaded' } : doc)) }
  function removeDoc(id: string) { setDocs(d => d.filter(doc => doc.id !== id)) }
  function saveNote(id: string) { if (!docNoteEdit) return; setDocs(d => d.map(doc => doc.id === id ? { ...doc, notes: docNoteEdit.value } : doc)); setDocNoteEdit(null) }
  function closeModal() { setModalStep(null); setSelectedTemplate(null) }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalStep) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [modalStep])
  function getTemplateById(id: string) { return TEMPLATES.find(t => t.id === id) }

  const prefillCount = selectedTemplate?.aiFields.filter(f => f.status === 'prefilled').length ?? 0
  const partialCount = selectedTemplate?.aiFields.filter(f => f.status === 'partial').length ?? 0
  const manualCount  = selectedTemplate?.aiFields.filter(f => f.status === 'manual').length ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black mb-1" style={{ color: '#1A1A1A' }}>Templates & Forms</h1>
          <p className="text-sm" style={{ color: '#9A9A9A' }}>Download, name, and track every regulatory document in your IPO process.</p>
        </div>
        {docs.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl flex items-center gap-2"
              style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              <FolderOpen className="w-4 h-4" style={{ color: '#E8312A' }} />
              <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{docs.length}</span>
              <span className="text-sm" style={{ color: '#9A9A9A' }}>loaded</span>
            </div>
            {docs.filter(d => d.status === 'ready_for_review').length > 0 && (
              <div className="px-4 py-2 rounded-xl flex items-center gap-2"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <Eye className="w-4 h-4" style={{ color: '#B45309' }} />
                <span className="text-sm font-semibold" style={{ color: '#B45309' }}>
                  {docs.filter(d => d.status === 'ready_for_review').length} need review
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How templates work notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1D4ED8' }} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-semibold text-sm" style={{ color: '#1D4ED8' }}>Smart Autofill — Powered by Your Data</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>Growth &amp; Enterprise</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>
            Every template below can be tracked in your workspace. For ⚡ AI Pre-fill templates, we populate fields automatically
            using data you've already submitted — company name, officers, cap table data, and more.{' '}
            <strong style={{ color: '#1A1A1A' }}>Paid regulatory forms (PIF, prospectus, option plans) must be obtained directly
            from the official exchange or regulator — IPOReady does not charge for or mark up these documents.</strong>
          </p>
        </div>
      </div>

      {/* My Documents */}
      <AnimatePresence>
        {docs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4" style={{ color: '#9A9A9A' }} />
              <h2 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>My Documents</h2>
              <span className="text-xs" style={{ color: '#B3B3B3' }}>— downloaded this session</span>
            </div>
            <div className="space-y-2">
              {docs.map(doc => {
                const cfg = STATUS_CONFIG[doc.status]
                const StatusIcon = cfg.icon
                const tmpl = getTemplateById(doc.templateId)
                const catStyle = CATEGORY_STYLE[doc.category] ?? { text: '#717171', bg: '#F7F6F4' }
                const isExpanded = expandedDoc === doc.id

                return (
                  <motion.div key={doc.id} layout className="rounded-xl overflow-hidden"
                    style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: cfg.bg }}>
                        <StatusIcon className="w-4 h-4" style={{ color: cfg.color,
                          animation: doc.status === 'ai_populating' ? 'spin 1.5s linear infinite' : 'none' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{doc.docName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ color: catStyle.text, background: catStyle.bg }}>{doc.category}</span>
                          {doc.aiPopulated && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ color: '#7C3AED', background: '#F5F3FF' }}>⚡ AI Populated</span>
                          )}
                          <span className="text-[10px]" style={{ color: '#B3B3B3' }}>Downloaded {doc.downloadedAt}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0"
                        style={{ color: cfg.color, background: cfg.bg }}>
                        <StatusIcon className="w-3 h-3" />{cfg.label}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#9A9A9A' }} />
                        : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#9A9A9A' }} />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid #E5E4E0' }}>

                            {doc.status === 'ready_for_review' && (
                              <div className="flex items-start gap-2.5 p-3 rounded-xl"
                                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                                <div>
                                  <p className="text-xs font-bold mb-0.5" style={{ color: '#B45309' }}>Manual review required before use</p>
                                  <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>
                                    AI pre-population provides a starting point only. Every field must be independently verified by your legal counsel
                                    or CFO before this document is submitted to regulators, an exchange, or counterparties.
                                  </p>
                                </div>
                              </div>
                            )}

                            {doc.aiPopulated && tmpl && tmpl.aiFields.length > 0 && (
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9A9A9A' }}>AI Pre-filled Fields</p>
                                <div className="grid md:grid-cols-2 gap-1.5">
                                  {personalizeFields(tmpl.aiFields).map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                                      style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: f.status === 'prefilled' ? '#16A34A' : f.status === 'partial' ? '#D97706' : '#DC2626' }} />
                                      <span className="text-xs truncate" style={{ color: '#717171' }}>{f.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9A9A9A' }}>Notes</p>
                              {docNoteEdit?.id === doc.id ? (
                                <div className="flex gap-2">
                                  <input
                                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                                    style={{ border: '1px solid #E5E4E0', background: '#FAFAFA', color: '#1A1A1A' }}
                                    value={docNoteEdit.value}
                                    onChange={e => setDocNoteEdit({ id: doc.id, value: e.target.value })}
                                    onKeyDown={e => { if (e.key === 'Enter') saveNote(doc.id) }}
                                    autoFocus placeholder="Add a note..."
                                  />
                                  <button onClick={() => saveNote(doc.id)}
                                    className="px-3 py-2 rounded-xl text-xs font-semibold"
                                    style={{ background: '#1A1A1A', color: 'white' }}>Save</button>
                                  <button onClick={() => setDocNoteEdit(null)}
                                    className="px-3 py-2 rounded-xl text-xs font-semibold"
                                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>Cancel</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDocNoteEdit({ id: doc.id, value: doc.notes })}
                                  className="flex items-center gap-2 text-xs transition-colors"
                                  style={{ color: '#9A9A9A' }}>
                                  <Pencil className="w-3 h-3" />
                                  {doc.notes || 'Add a note for your team…'}
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {doc.status === 'ready_for_review' && (
                                <button onClick={() => markApproved(doc.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                  style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}>
                                  <CheckCheck className="w-3.5 h-3.5" /> Mark as Reviewed & Approved
                                </button>
                              )}
                              {doc.status === 'ready_for_review' && (
                                <button onClick={() => markNeedsRevision(doc.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                  <RotateCcw className="w-3.5 h-3.5" /> Needs Revision
                                </button>
                              )}
                              {doc.status === 'approved' && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                  style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}>
                                  <Shield className="w-3.5 h-3.5" /> Approved for use
                                </div>
                              )}
                              <button onClick={() => removeDoc(doc.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ml-auto"
                                style={{ color: '#E8312A' }}>
                                <X className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A9A9A' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #E5E4E0', background: 'white', color: '#1A1A1A' }}
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="sm:w-40 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: '1px solid #E5E4E0', background: 'white', color: '#1A1A1A' }}>
          <option value="all">All Categories</option>
          {['Regulatory', 'Prospectus', 'Governance', 'Legal'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterExchange} onChange={e => setFilterExchange(e.target.value)}
          className="sm:w-36 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: '1px solid #E5E4E0', background: 'white', color: '#1A1A1A' }}>
          <option value="all">All Exchanges</option>
          {['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC'].map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
      </div>

      {/* No markups banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
        style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#9A9A9A' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>
          <strong style={{ color: '#1A1A1A' }}>No markups, ever.</strong>{' '}
          Templates with an official source fee must be purchased directly from the regulator or exchange.
          IPOReady provides tracking, autofill, and review — not document sales.
        </p>
      </div>

      {/* Templates grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => {
          const existingDoc = docs.find(d => d.templateId === t.id)
          const catStyle = CATEGORY_STYLE[t.category] ?? { text: '#717171', bg: '#F7F6F4' }

          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-5 rounded-xl flex flex-col"
              style={{ background: 'white', border: existingDoc ? `1px solid ${STATUS_CONFIG[existingDoc.status].color}40` : '1px solid #E5E4E0' }}>

              {/* Badge row — inline, no absolute positioning */}
              {(t.popular || existingDoc) && (
                <div className="flex justify-end mb-2">
                  {existingDoc ? (() => {
                    const cfg = STATUS_CONFIG[existingDoc.status]
                    const SIcon = cfg.icon
                    return (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <SIcon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                    )
                  })() : t.popular ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: '#FEF3C7', color: '#B45309' }}>⭐ Popular</span>
                  ) : null}
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: catStyle.bg }}>
                  <FileText className="w-5 h-5" style={{ color: catStyle.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug" style={{ color: '#1A1A1A' }}>{t.name}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: catStyle.text, background: catStyle.bg }}>{t.category}</span>
                    {t.autoFill && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ color: '#7C3AED', background: '#F5F3FF' }}>⚡ AI Pre-fill</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed mb-3 line-clamp-2 flex-1" style={{ color: '#717171' }}>{t.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {t.exchanges.map(ex => (
                  <span key={ex} className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: '#F7F6F4', color: '#9A9A9A' }}>{ex}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {t.isFree
                    ? <span className="font-bold text-sm" style={{ color: '#15803D' }}>Free</span>
                    : t.sourceUrl
                      ? <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1 transition-colors"
                          style={{ color: '#1D4ED8' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#1D4ED8')}
                          onClick={e => e.stopPropagation()}>
                          <ExternalLink className="w-3 h-3" />
                          Via {t.officialBody}
                        </a>
                      : <span className="text-xs" style={{ color: '#9A9A9A' }}>Via {t.officialBody}</span>
                  }
                </div>
                <button onClick={() => openDownload(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={existingDoc
                    ? { background: '#F7F6F4', color: '#9A9A9A', border: '1px solid #E5E4E0' }
                    : { background: '#1A1A1A', color: 'white' }
                  }>
                  <Download className="w-3 h-3" />
                  {existingDoc ? 'Download Again' : 'Download'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal: Name document */}
      <AnimatePresence>
        {modalStep === 'name' && selectedTemplate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={closeModal}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="p-7 rounded-2xl max-w-md w-full"
              style={{ background: 'white', border: '1px solid #E5E4E0' }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block"
                    style={{ color: CATEGORY_STYLE[selectedTemplate.category]?.text, background: CATEGORY_STYLE[selectedTemplate.category]?.bg }}>
                    {selectedTemplate.category}
                  </span>
                  <h2 className="font-bold text-lg leading-snug" style={{ color: '#1A1A1A' }}>{selectedTemplate.name}</h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: '#9A9A9A' }}>
                    <span>{selectedTemplate.pages} pages</span>
                    <span>·</span>
                    <span className="font-mono">{selectedTemplate.citation}</span>
                  </div>
                </div>
                <button onClick={closeModal} style={{ color: '#9A9A9A' }} className="hover:bg-gray-100 p-1 rounded transition-colors" title="Close (ESC)">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: '#9A9A9A' }}>
                  Name this document
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E5E4E0', background: '#FAFAFA', color: '#1A1A1A' }}
                  value={docName} onChange={e => setDocName(e.target.value)}
                  placeholder={`e.g. ${(companyName || 'YourCompany').replace(/\s+/g, '')}_PIF_Directors_v1`} autoFocus
                />
                <p className="text-xs mt-1.5" style={{ color: '#9A9A9A' }}>This name appears in your workspace and dashboard.</p>
              </div>

              {/* Prerequisites for Autofill */}
              {selectedTemplate.autoFill && selectedTemplate.prerequisites.length > 0 && (
                <div className="mb-4 p-4 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7C3AED' }} />
                    <p className="text-xs font-bold" style={{ color: '#7C3AED' }}>Maximize Autofill — Upload These First</p>
                  </div>
                  <p className="text-xs mb-2.5 leading-relaxed" style={{ color: '#717171' }}>
                    To pre-fill the most fields automatically, ensure these documents are in your workspace:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {selectedTemplate.prerequisites.map((prereq, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C3AED' }} />
                        <span className="text-xs" style={{ color: '#4C1D95' }}>{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedTemplate.isFree && selectedTemplate.sourceUrl && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl mb-4"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#1D4ED8' }} />
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#1D4ED8' }}>Official Source</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>
                      This document may require payment at the official source.{' '}
                      <a href={selectedTemplate.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="font-semibold underline" style={{ color: '#1D4ED8' }}>
                        Get it at {selectedTemplate.officialBody} →
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button onClick={downloadBlank} disabled={!docName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#1A1A1A' }}>
                  <Download className="w-4 h-4" /> Download Blank Template
                </button>
                {selectedTemplate.autoFill && (
                  <div>
                    <button onClick={() => setModalStep('ai_preview')} disabled={!docName.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                      style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#7C3AED' }}>
                      <Sparkles className="w-4 h-4" /> ⚡ AI Pre-fill with My Data
                      <span className="text-xs opacity-60 ml-1">· Needs review</span>
                    </button>
                    <p className="text-center text-[10px] mt-1.5" style={{ color: '#9A9A9A' }}>
                      Available on{' '}
                      <span className="font-semibold" style={{ color: '#7C3AED' }}>Growth</span>
                      {' '}&amp;{' '}
                      <span className="font-semibold" style={{ color: '#7C3AED' }}>Enterprise</span>
                      {' '}plans
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: AI Preview */}
      <AnimatePresence>
        {modalStep === 'ai_preview' && selectedTemplate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={closeModal}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="p-7 rounded-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto"
              style={{ background: 'white', border: '1px solid #E5E4E0' }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#7C3AED' }} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: '#1A1A1A' }}>AI Pre-fill Preview</h2>
                    <p className="text-xs" style={{ color: '#9A9A9A' }}>"{docName}"</p>
                  </div>
                </div>
                <button onClick={closeModal} style={{ color: '#9A9A9A' }} className="hover:bg-gray-100 p-1 rounded transition-colors" title="Close (ESC)">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { value: prefillCount, label: 'Pre-filled',   color: '#15803D', bg: '#F0FDF4', border: '#86EFAC' },
                  { value: partialCount, label: 'Partial',      color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
                  { value: manualCount,  label: 'Manual only',  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-xl"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] font-medium" style={{ color: '#9A9A9A' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9A9A9A' }}>Fields</p>
                {personalizeFields(selectedTemplate.aiFields).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: f.status === 'prefilled' ? '#16A34A' : f.status === 'partial' ? '#D97706' : '#DC2626' }} />
                    <span className="text-xs flex-1" style={{ color: '#1A1A1A' }}>{f.label}</span>
                    <span className="text-xs truncate max-w-[180px]"
                      style={{ color: f.status === 'prefilled' ? '#15803D' : f.status === 'partial' ? '#B45309' : '#E8312A' }}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: '#B45309' }}>Mandatory Manual Review</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>
                    AI pre-population is a <strong style={{ color: '#1A1A1A' }}>starting point only</strong>. All fields must be independently verified by your legal counsel, CFO, or compliance officer before this document is submitted to any exchange, regulator, or counterparty.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setModalStep('name')}
                  className="flex-1 flex items-center justify-center py-3 rounded-xl font-semibold text-sm"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#1A1A1A' }}>
                  ← Back
                </button>
                <button onClick={confirmAiPopulate}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: '#1A1A1A', color: 'white' }}>
                  <Sparkles className="w-4 h-4" /> Confirm AI Pre-fill
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
