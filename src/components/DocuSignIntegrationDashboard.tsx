'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Upload,
  FileText,
  Users,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  ChevronDown,
  Zap,
  Mail,
  Signature,
  Shield,
  BarChart3,
  Link2,
} from 'lucide-react'
import { DocuSignStatusTimeline, type EnvelopeTimelineStatus, type EnvelopeStatusType } from '@/components/DocuSignStatusTimeline'

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

interface DocuSignTemplate {
  id: string
  name: string
  description: string
  category: 'prospectus' | 'consent' | 'board_resolution' | 'other'
  documentCount: number
  signerRoles: string[]
  lastModified: string
}

interface Recipient {
  id: string
  email: string
  name: string
  role: 'signer' | 'cc' | 'approver'
  signingOrder: number
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined'
}

interface DocumentUpload {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
  pages: number
  signingFields: number
}

interface SignatureEnvelope {
  id: string
  envelopeId: string
  templateId?: string
  name: string
  status: EnvelopeStatusType
  createdAt: string
  sentAt?: string
  expiresAt: string
  completionPercentage: number
  recipients: Recipient[]
  documents: DocumentUpload[]
  prospectusId?: string
  description?: string
}

// ═══════════════════════════════════════════════════════════════════════
// TEMPLATE SELECTOR TAB
// ═══════════════════════════════════════════════════════════════════════

function TemplateSelector() {
  const [templates, setTemplates] = useState<DocuSignTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  useEffect(() => {
    setTemplates([
      {
        id: 'tpl-001',
        name: 'Prospectus Signature',
        description: 'Standard prospectus document requiring CEO and legal counsel signatures',
        category: 'prospectus',
        documentCount: 1,
        signerRoles: ['CEO', 'Chief Counsel'],
        lastModified: '2026-05-30T10:00:00Z',
      },
      {
        id: 'tpl-002',
        name: 'Board Consent - Stock Authorization',
        description: 'Board resolution for stock authorization and capitalization',
        category: 'board_resolution',
        documentCount: 1,
        signerRoles: ['Board Members', 'Secretary'],
        lastModified: '2026-05-25T14:30:00Z',
      },
      {
        id: 'tpl-003',
        name: 'Legal Counsel Consent',
        description: 'Consent letter from securities counsel regarding prospectus',
        category: 'consent',
        documentCount: 1,
        signerRoles: ['Securities Counsel', 'Partner'],
        lastModified: '2026-05-20T09:15:00Z',
      },
      {
        id: 'tpl-004',
        name: 'Auditor Representation Letter',
        description: 'Representation letter from external auditors',
        category: 'consent',
        documentCount: 1,
        signerRoles: ['Lead Auditor', 'Partner'],
        lastModified: '2026-05-15T11:45:00Z',
      },
    ])
  }, [])

  const categoryLabels = {
    prospectus: 'Prospectus',
    consent: 'Consent',
    board_resolution: 'Board Resolution',
    other: 'Other',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Available Templates</h3>
          <p className="text-sm text-gray-600 mt-1">Select a template to start a new signing workflow</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create Template
        </motion.button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={18} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                </div>
                <motion.div
                  animate={{ rotate: selectedTemplate === template.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} className="text-gray-400" />
                </motion.div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {selectedTemplate === template.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Documents</p>
                          <p className="font-semibold text-gray-900">{template.documentCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Signers</p>
                          <p className="font-semibold text-gray-900">{template.signerRoles.length}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {categoryLabels[template.category as keyof typeof categoryLabels]}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-2">Signer Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {template.signerRoles.map((role, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Signature size={16} />
                      Start Signing Workflow
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENT UPLOAD TAB
// ═══════════════════════════════════════════════════════════════════════

function DocumentUploadSection() {
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    setDocuments([
      {
        id: 'doc-001',
        fileName: 'IPOReady_Prospectus_Draft_v2.pdf',
        fileSize: 2048000,
        uploadedAt: '2026-06-01T14:20:00Z',
        pages: 45,
        signingFields: 3,
      },
      {
        id: 'doc-002',
        fileName: 'Board_Resolution_Stock_Auth.pdf',
        fileSize: 512000,
        uploadedAt: '2026-05-30T09:45:00Z',
        pages: 5,
        signingFields: 2,
      },
    ])
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        animate={{ scale: dragActive ? 1.02 : 1 }}
        className={`p-8 border-2 border-dashed rounded-lg text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <Upload size={40} className="mx-auto text-gray-400 mb-3" />
        </motion.div>
        <h3 className="font-semibold text-gray-900 mb-1">Upload documents for signing</h3>
        <p className="text-sm text-gray-600 mb-4">Drag and drop PDF files or click to browse</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Select Files
        </motion.button>
      </motion.div>

      {/* Uploaded documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Uploaded Documents</h4>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText size={20} className="text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 truncate">{doc.fileName}</h5>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          {doc.pages} pages
                        </div>
                        <div className="flex items-center gap-1">
                          <Signature size={12} />
                          {doc.signingFields} fields
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          {formatFileSize(doc.fileSize)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// RECIPIENT SETUP TAB
// ═══════════════════════════════════════════════════════════════════════

function RecipientSetupSection() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({ email: '', name: '', role: 'signer' as const })

  useEffect(() => {
    setRecipients([
      {
        id: 'r1',
        email: 'sarah@techcorp.com',
        name: 'Sarah Johnson',
        role: 'signer',
        signingOrder: 1,
        status: 'pending',
      },
      {
        id: 'r2',
        email: 'james@osler.ca',
        name: 'James Lee',
        role: 'signer',
        signingOrder: 2,
        status: 'pending',
      },
    ])
  }, [])

  const addRecipient = () => {
    if (newRecipient.email && newRecipient.name) {
      setRecipients([
        ...recipients,
        {
          id: `r${Date.now()}`,
          ...newRecipient,
          signingOrder: Math.max(...recipients.map(r => r.signingOrder), 0) + 1,
          status: 'pending',
        },
      ])
      setNewRecipient({ email: '', name: '', role: 'signer' })
    }
  }

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id))
  }

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
    viewed: { label: 'Viewed', color: 'bg-cyan-100 text-cyan-700' },
    signed: { label: 'Signed', color: 'bg-green-100 text-green-700' },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-6">
      {/* Add recipient form */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Plus size={16} />
          Add Recipient
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={newRecipient.name}
            onChange={e => setNewRecipient({ ...newRecipient, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newRecipient.email}
            onChange={e => setNewRecipient({ ...newRecipient, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newRecipient.role}
            onChange={e => setNewRecipient({ ...newRecipient, role: e.target.value as 'signer' | 'cc' | 'approver' })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="signer">Signer</option>
            <option value="cc">CC</option>
            <option value="approver">Approver</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addRecipient}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Recipient
        </motion.button>
      </div>

      {/* Recipients list */}
      {recipients.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Recipients</h4>
          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <motion.div
                key={recipient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900 truncate">{recipient.name}</h5>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${statusConfig[recipient.status].color}`}
                        >
                          {statusConfig[recipient.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        {recipient.email}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeRecipient(recipient.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// SIGNATURE TRACKING TAB
// ═══════════════════════════════════════════════════════════════════════

function SignatureTrackingSection() {
  const [envelopes, setEnvelopes] = useState<SignatureEnvelope[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setEnvelopes([
      {
        id: '1',
        envelopeId: 'env-001',
        name: 'Prospectus Consent - Legal Review',
        status: 'signed',
        createdAt: '2026-06-01T10:00:00Z',
        sentAt: '2026-06-01T10:30:00Z',
        expiresAt: '2026-07-01T10:00:00Z',
        completionPercentage: 66,
        prospectusId: 'prosp-001',
        description: 'Legal counsel consent for prospectus disclosure',
        recipients: [
          {
            id: 'r1',
            email: 'sarah@techcorp.com',
            name: 'Sarah Johnson',
            role: 'signer',
            signingOrder: 1,
            status: 'signed',
          },
          {
            id: 'r2',
            email: 'james@osler.ca',
            name: 'James Lee',
            role: 'signer',
            signingOrder: 2,
            status: 'viewed',
          },
        ],
        documents: [
          {
            id: 'doc-1',
            fileName: 'Prospectus_Draft_v2.pdf',
            fileSize: 2048000,
            uploadedAt: '2026-06-01T10:00:00Z',
            pages: 45,
            signingFields: 2,
          },
        ],
      },
      {
        id: '2',
        envelopeId: 'env-002',
        name: 'Board Resolution - Stock Authorization',
        status: 'completed',
        createdAt: '2026-05-25T09:00:00Z',
        sentAt: '2026-05-25T09:30:00Z',
        expiresAt: '2026-06-25T09:00:00Z',
        completionPercentage: 100,
        prospectusId: 'prosp-001',
        recipients: [
          {
            id: 'r3',
            email: 'ceo@techcorp.com',
            name: 'CEO',
            role: 'signer',
            signingOrder: 1,
            status: 'signed',
          },
          {
            id: 'r4',
            email: 'cfo@techcorp.com',
            name: 'CFO',
            role: 'signer',
            signingOrder: 1,
            status: 'signed',
          },
        ],
        documents: [
          {
            id: 'doc-2',
            fileName: 'Board_Resolution.pdf',
            fileSize: 512000,
            uploadedAt: '2026-05-25T09:00:00Z',
            pages: 5,
            signingFields: 2,
          },
        ],
      },
    ])
  }, [])

  const getEnvelopeTimeline = (envelope: SignatureEnvelope): EnvelopeTimelineStatus[] => {
    const timelines: EnvelopeTimelineStatus[] = []

    timelines.push({
      status: 'sent',
      timestamp: envelope.sentAt || envelope.createdAt,
      recipientCount: envelope.recipients.length,
      completedCount: 0,
      label: 'Sent',
      description: `Sent to ${envelope.recipients.length} recipient${envelope.recipients.length > 1 ? 's' : ''}`,
    })

    const viewedCount = envelope.recipients.filter(r => ['viewed', 'signed'].includes(r.status)).length
    if (viewedCount > 0) {
      timelines.push({
        status: 'viewed',
        timestamp: envelope.sentAt || envelope.createdAt,
        recipientCount: envelope.recipients.length,
        completedCount: viewedCount,
        label: 'Viewed',
        description: `${viewedCount} recipient${viewedCount > 1 ? 's' : ''} opened the envelope`,
      })
    }

    const signedCount = envelope.recipients.filter(r => r.status === 'signed').length
    if (signedCount > 0) {
      timelines.push({
        status: 'signed',
        timestamp: envelope.sentAt || envelope.createdAt,
        recipientCount: envelope.recipients.length,
        completedCount: signedCount,
        label: 'Signed',
        description: `${signedCount} of ${envelope.recipients.length} have signed`,
      })
    }

    if (envelope.status === 'completed') {
      timelines.push({
        status: 'completed',
        timestamp: envelope.sentAt || envelope.createdAt,
        recipientCount: envelope.recipients.length,
        completedCount: envelope.recipients.length,
        label: 'Completed',
        description: 'All recipients have signed',
      })
    } else if (envelope.status === 'declined') {
      timelines.push({
        status: 'declined',
        timestamp: envelope.createdAt,
        recipientCount: envelope.recipients.length,
        completedCount: signedCount,
        label: 'Declined',
        description: 'One or more recipients declined to sign',
      })
    }

    return timelines
  }

  const statusConfig = {
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
    signed: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700' },
    expired: { label: 'Expired', color: 'bg-orange-100 text-orange-700' },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Signature Tracking</h3>
          <p className="text-sm text-gray-600 mt-1">Monitor DocuSign envelope status and signer progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh Status
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {envelopes.map((envelope, index) => {
          const config = statusConfig[envelope.status as keyof typeof statusConfig]

          return (
            <motion.div
              key={envelope.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
            >
              {/* Envelope header - clickable to expand */}
              <motion.button
                onClick={() => setExpandedId(expandedId === envelope.id ? null : envelope.id)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2">
                    <FileText size={20} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{envelope.name}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{envelope.description}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${envelope.completionPercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          envelope.status === 'completed'
                            ? 'bg-green-500'
                            : envelope.status === 'declined'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-12 text-right">
                      {envelope.completionPercentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.color}`}>
                    {config.label}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedId === envelope.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} className="text-gray-400" />
                  </motion.div>
                </div>
              </motion.button>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedId === envelope.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 overflow-hidden"
                  >
                    <div className="p-6 bg-gray-50 space-y-6">
                      {/* Status timeline */}
                      <DocuSignStatusTimeline
                        statuses={getEnvelopeTimeline(envelope)}
                        currentStatus={envelope.status}
                        completionPercentage={envelope.completionPercentage}
                        expiresAt={envelope.expiresAt}
                      />

                      {/* Recipients grid */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users size={16} />
                          Recipients
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {envelope.recipients.map(recipient => (
                            <motion.div
                              key={recipient.id}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{recipient.name}</p>
                                  <p className="text-xs text-gray-600 truncate">{recipient.email}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap bg-green-100 text-green-700">
                                  {recipient.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Shield size={12} />
                                {recipient.role.charAt(0).toUpperCase() + recipient.role.slice(1)}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText size={16} />
                          Documents
                        </h4>
                        <div className="space-y-2">
                          {envelope.documents.map(doc => (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className="text-red-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{doc.fileName}</p>
                                  <p className="text-xs text-gray-600">{doc.pages} pages</p>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                              >
                                <Download size={16} />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                          <RefreshCw size={14} />
                          Sync Status
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                        >
                          <Download size={14} />
                          Download Package
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Audit Trail
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════

export function DocuSignIntegrationDashboard() {
  const [activeTab, setActiveTab] = useState<'templates' | 'upload' | 'recipients' | 'tracking'>('templates')

  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'upload', label: 'Documents', icon: Upload },
    { id: 'recipients', label: 'Recipients', icon: Users },
    { id: 'tracking', label: 'Tracking', icon: BarChart3 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">DocuSign Integration</h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="hidden sm:block"
          >
            <Signature size={32} className="text-blue-600" />
          </motion.div>
        </div>
        <p className="text-gray-600">
          Manage electronic signatures, document workflows, and track prospectus signing progress
        </p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: FileText, label: 'Templates', value: '4', color: 'from-blue-50 to-blue-100' },
          { icon: Send, label: 'In Progress', value: '2', color: 'from-purple-50 to-purple-100' },
          { icon: CheckCircle2, label: 'Completed', value: '8', color: 'from-green-50 to-green-100' },
          { icon: AlertCircle, label: 'Pending', value: '3', color: 'from-orange-50 to-orange-100' },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className={`p-4 bg-gradient-to-br ${stat.color} rounded-lg border border-gray-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <Icon size={24} className="text-gray-400" />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          {activeTab === 'templates' && <TemplateSelector />}
          {activeTab === 'upload' && <DocumentUploadSection />}
          {activeTab === 'recipients' && <RecipientSetupSection />}
          {activeTab === 'tracking' && <SignatureTrackingSection />}
        </motion.div>
      </AnimatePresence>

      {/* Integration tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex gap-3">
          <Link2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Integrate with Prospectus Builder</p>
            <p className="text-sm text-gray-600 mt-1">
              Create DocuSign workflows directly from prospectus sections. All signature envelopes are automatically
              tracked and linked to your prospectus project.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
