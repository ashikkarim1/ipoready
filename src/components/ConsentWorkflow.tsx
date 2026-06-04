'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Plus,
  ChevronDown,
  PenTool,
  Search,
  Filter,
  Calendar,
  Building2,
  User,
  Eye,
  Signature,
  TrendingUp,
  X,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

type ConsentStatus = 'pending' | 'signed' | 'rejected' | 'expired'
type EntityType = 'auditor' | 'lawyer' | 'valuation_expert' | 'environmental_expert' | 'other_expert'

interface ConsentRequest {
  id: string
  stakeholder: string
  entityType: EntityType
  consentType: string
  status: ConsentStatus
  createdDate: string
  deadline: string
  documentUrl?: string
  signatureDate?: string
}

interface ConsentFormData {
  stakeholder: string
  entityType: EntityType
  consentType: string
  deadline: string
}

// ═══════════════════════════════════════════════════════════════════════
// Sample Data
// ═══════════════════════════════════════════════════════════════════════

const SAMPLE_CONSENTS: ConsentRequest[] = [
  {
    id: '1',
    stakeholder: 'KPMG LLP',
    entityType: 'auditor',
    consentType: 'Independent Audit Opinion',
    status: 'signed',
    createdDate: '2026-05-15',
    deadline: '2026-08-31',
    documentUrl: 'https://example.com/kpmg-consent.pdf',
    signatureDate: '2026-06-02',
  },
  {
    id: '2',
    stakeholder: 'Osler, Hoskin & Harcourt LLP',
    entityType: 'lawyer',
    consentType: 'Legal Counsel Opinion',
    status: 'pending',
    createdDate: '2026-05-20',
    deadline: '2026-08-15',
  },
  {
    id: '3',
    stakeholder: 'Deloitte Valuation Services',
    entityType: 'valuation_expert',
    consentType: 'Valuation Report Consent',
    status: 'pending',
    createdDate: '2026-05-25',
    deadline: '2026-07-30',
  },
  {
    id: '4',
    stakeholder: 'EY Environmental Services',
    entityType: 'environmental_expert',
    consentType: 'Environmental Assessment',
    status: 'rejected',
    createdDate: '2026-05-18',
    deadline: '2026-07-15',
  },
  {
    id: '5',
    stakeholder: 'PwC Financial Advisory',
    entityType: 'other_expert',
    consentType: 'Financial Advisory Opinion',
    status: 'expired',
    createdDate: '2026-04-15',
    deadline: '2026-05-30',
  },
]

// ═══════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════

function getStatusColor(status: ConsentStatus): string {
  switch (status) {
    case 'signed':
      return 'text-green-600'
    case 'pending':
      return 'text-amber-600'
    case 'rejected':
      return 'text-red-600'
    case 'expired':
      return 'text-gray-600'
  }
}

function getStatusBgColor(status: ConsentStatus): string {
  switch (status) {
    case 'signed':
      return 'bg-green-50'
    case 'pending':
      return 'bg-amber-50'
    case 'rejected':
      return 'bg-red-50'
    case 'expired':
      return 'bg-gray-50'
  }
}

function getStatusIcon(status: ConsentStatus) {
  switch (status) {
    case 'signed':
      return <CheckCircle2 className="w-5 h-5" />
    case 'pending':
      return <Clock className="w-5 h-5" />
    case 'rejected':
      return <XCircle className="w-5 h-5" />
    case 'expired':
      return <AlertCircle className="w-5 h-5" />
  }
}

function getStatusLabel(status: ConsentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getEntityIcon(type: EntityType) {
  switch (type) {
    case 'auditor':
      return <FileText className="w-4 h-4" />
    case 'lawyer':
      return <FileText className="w-4 h-4" />
    case 'valuation_expert':
      return <TrendingUp className="w-4 h-4" />
    case 'environmental_expert':
      return <AlertCircle className="w-4 h-4" />
    case 'other_expert':
      return <User className="w-4 h-4" />
  }
}

function getEntityLabel(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    auditor: 'Auditor',
    lawyer: 'Legal Counsel',
    valuation_expert: 'Valuation Expert',
    environmental_expert: 'Environmental Expert',
    other_expert: 'Other Expert',
  }
  return labels[type]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function isExpiringSoon(deadline: string, days: number = 30): boolean {
  const daysLeft = getDaysUntilDeadline(deadline)
  return daysLeft > 0 && daysLeft <= days
}

// ═══════════════════════════════════════════════════════════════════════
// Consent Details Modal
// ═══════════════════════════════════════════════════════════════════════

interface ConsentDetailsModalProps {
  consent: ConsentRequest | null
  onClose: () => void
  onStatusChange: (id: string, status: ConsentStatus) => void
}

function ConsentDetailsModal({ consent, onClose, onStatusChange }: ConsentDetailsModalProps) {
  if (!consent) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="h4 font-semibold text-gray-900">{consent.stakeholder}</h2>
              <p className="body-sm text-gray-600 mt-1">{consent.consentType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Status</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBgColor(consent.status)}`}>
                  {getStatusIcon(consent.status)}
                  <span className={`text-sm font-medium ${getStatusColor(consent.status)}`}>
                    {getStatusLabel(consent.status)}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {consent.status !== 'signed' && (
                  <button
                    onClick={() => {
                      onStatusChange(consent.id, 'signed')
                      onClose()
                    }}
                    className="flex-1 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors label font-medium"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Signed
                    </span>
                  </button>
                )}
                {consent.status === 'pending' && (
                  <button
                    onClick={() => {
                      onStatusChange(consent.id, 'rejected')
                      onClose()
                    }}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors label font-medium"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Mark as Rejected
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="body-sm text-gray-600 mb-1">Entity Type</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {getEntityIcon(consent.entityType)}
                  {getEntityLabel(consent.entityType)}
                </p>
              </div>
              <div>
                <p className="body-sm text-gray-600 mb-1">Created Date</p>
                <p className="font-medium text-gray-900">{formatDate(consent.createdDate)}</p>
              </div>
              <div>
                <p className="body-sm text-gray-600 mb-1">Deadline</p>
                <p className="font-medium text-gray-900">{formatDate(consent.deadline)}</p>
              </div>
              <div>
                <p className="body-sm text-gray-600 mb-1">Days Until Deadline</p>
                <p className={`font-medium ${isExpiringSoon(consent.deadline) ? 'text-amber-600' : 'text-gray-900'}`}>
                  {getDaysUntilDeadline(consent.deadline)} days
                </p>
              </div>
            </div>

            {/* Document Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Consent Document</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {consent.documentUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Signed Document</p>
                        <p className="caption-sm text-gray-600 mt-1">Signed on {formatDate(consent.signatureDate || '')}</p>
                      </div>
                    </div>
                    <a
                      href={consent.documentUrl}
                      download
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">No document uploaded yet</p>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors label font-medium">
                      Upload Document
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Placeholder Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">E-Signature Capture</h3>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Signature className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">DocuSign Integration (Placeholder)</p>
                <p className="body-sm text-gray-500 mb-4">
                  This space will integrate with DocuSign for secure e-signature capture. For now, signatures can be uploaded manually.
                </p>
                <button className="px-6 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium">
                  Open DocuSign
                </button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Consent request created</p>
                    <p className="body-sm text-gray-600">{formatDate(consent.createdDate)}</p>
                  </div>
                </div>
                {consent.signatureDate && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Consent signed</p>
                      <p className="body-sm text-gray-600">{formatDate(consent.signatureDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// New Consent Form Modal
// ═══════════════════════════════════════════════════════════════════════

interface NewConsentFormProps {
  onClose: () => void
  onSubmit: (data: ConsentFormData) => void
}

function NewConsentForm({ onClose, onSubmit }: NewConsentFormProps) {
  const [formData, setFormData] = useState<ConsentFormData>({
    stakeholder: '',
    entityType: 'auditor',
    consentType: 'Independent Audit Opinion',
    deadline: '',
  })

  const consentTypeMap: Record<EntityType, string> = {
    auditor: 'Independent Audit Opinion',
    lawyer: 'Legal Counsel Opinion',
    valuation_expert: 'Valuation Report Consent',
    environmental_expert: 'Environmental Assessment',
    other_expert: 'Expert Report Consent',
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-lg w-full"
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="h4 font-semibold text-gray-900">New Consent Request</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(formData)
              onClose()
            }}
            className="p-6 space-y-4"
          >
            {/* Stakeholder Name */}
            <div>
              <label className="block label font-medium text-gray-900 mb-1">
                Stakeholder/Entity Name
              </label>
              <input
                type="text"
                value={formData.stakeholder}
                onChange={(e) => setFormData({ ...formData, stakeholder: e.target.value })}
                placeholder="e.g., KPMG LLP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Entity Type */}
            <div>
              <label className="block label font-medium text-gray-900 mb-1">Entity Type</label>
              <select
                value={formData.entityType}
                onChange={(e) => {
                  const type = e.target.value as EntityType
                  setFormData({
                    ...formData,
                    entityType: type,
                    consentType: consentTypeMap[type],
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auditor">Auditor</option>
                <option value="lawyer">Legal Counsel</option>
                <option value="valuation_expert">Valuation Expert</option>
                <option value="environmental_expert">Environmental Expert</option>
                <option value="other_expert">Other Expert</option>
              </select>
            </div>

            {/* Consent Type (Auto-filled) */}
            <div>
              <label className="block label font-medium text-gray-900 mb-1">Consent Type</label>
              <input
                type="text"
                value={formData.consentType}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="caption-sm text-gray-500 mt-1">Auto-filled based on entity type</p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block label font-medium text-gray-900 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                style={{ background: 'var(--color-accent)' }}
              >
                Create Request
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Main Consent Workflow Component
// ═══════════════════════════════════════════════════════════════════════

export function ConsentWorkflow() {
  const [consents, setConsents] = useState<ConsentRequest[]>(SAMPLE_CONSENTS)
  const [selectedConsent, setSelectedConsent] = useState<ConsentRequest | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<ConsentStatus | 'all'>('all')
  const [filterEntityType, setFilterEntityType] = useState<EntityType | 'all'>('all')

  // Calculate compliance metrics
  const complianceMetrics = useMemo(() => {
    const signed = consents.filter((c) => c.status === 'signed').length
    const pending = consents.filter((c) => c.status === 'pending').length
    const rejected = consents.filter((c) => c.status === 'rejected').length
    const expired = consents.filter((c) => c.status === 'expired').length
    const expiringoon = consents.filter((c) => isExpiringSoon(c.deadline)).length
    const total = consents.length

    return {
      signed,
      pending,
      rejected,
      expired,
      expiringoon,
      total,
      compliancePercentage: total > 0 ? Math.round((signed / total) * 100) : 0,
    }
  }, [consents])

  // Filter consents
  const filteredConsents = useMemo(() => {
    return consents.filter((consent) => {
      const matchesSearch =
        consent.stakeholder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.consentType.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || consent.status === filterStatus
      const matchesEntityType = filterEntityType === 'all' || consent.entityType === filterEntityType

      return matchesSearch && matchesStatus && matchesEntityType
    })
  }, [consents, searchTerm, filterStatus, filterEntityType])

  const handleStatusChange = (id: string, status: ConsentStatus) => {
    setConsents(
      consents.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              signatureDate: status === 'signed' ? new Date().toISOString().split('T')[0] : c.signatureDate,
            }
          : c
      )
    )
  }

  const handleNewConsent = (data: ConsentFormData) => {
    const newConsent: ConsentRequest = {
      id: (Math.max(...consents.map((c) => parseInt(c.id))) + 1).toString(),
      ...data,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
    }
    setConsents([...consents, newConsent])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consent Workflow</h1>
        <p className="text-gray-600">Manage and track stakeholder consents for IPO listing</p>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {/* Compliance % */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="body-sm text-gray-600 mb-1">Compliance</p>
              <p className="text-3xl font-bold text-green-600">{complianceMetrics.compliancePercentage}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Signed Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="body-sm text-gray-600 mb-1">Signed</p>
              <p className="text-3xl font-bold text-green-600">{complianceMetrics.signed}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Pending Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="body-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{complianceMetrics.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        {/* Expiring Soon Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="body-sm text-gray-600 mb-1">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-600">{complianceMetrics.expiringoon}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        {/* Total Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="body-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{complianceMetrics.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stakeholders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ConsentStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          {/* Entity Type Filter */}
          <select
            value={filterEntityType}
            onChange={(e) => setFilterEntityType(e.target.value as EntityType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="auditor">Auditor</option>
            <option value="lawyer">Legal Counsel</option>
            <option value="valuation_expert">Valuation Expert</option>
            <option value="environmental_expert">Environmental Expert</option>
            <option value="other_expert">Other Expert</option>
          </select>

          {/* New Consent Button */}
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
            style={{ background: 'var(--color-accent)' }}
          >
            <Plus className="w-5 h-5" />
            New Consent
          </button>
        </div>
      </div>

      {/* Consent List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredConsents.length > 0 ? (
            filteredConsents.map((consent, index) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedConsent(consent)}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Stakeholder & Type */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {getEntityIcon(consent.entityType)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{consent.stakeholder}</h3>
                        <p className="body-sm text-gray-600 truncate">{getEntityLabel(consent.entityType)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Consent Type */}
                  <div className="hidden md:block flex-1 min-w-0">
                    <p className="label font-medium text-gray-900 truncate">{consent.consentType}</p>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBgColor(consent.status)}`}>
                    {getStatusIcon(consent.status)}
                    <span className={`text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {getStatusLabel(consent.status)}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex-shrink-0 text-right hidden lg:block">
                    <p className={`text-sm font-medium ${isExpiringSoon(consent.deadline) ? 'text-orange-600' : 'text-gray-900'}`}>
                      {formatDate(consent.deadline)}
                    </p>
                    <p className={`text-xs ${isExpiringSoon(consent.deadline) ? 'text-orange-600' : 'text-gray-500'}`}>
                      {getDaysUntilDeadline(consent.deadline)} days left
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedConsent(consent)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No consents found matching your filters</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ConsentDetailsModal
        consent={selectedConsent}
        onClose={() => setSelectedConsent(null)}
        onStatusChange={handleStatusChange}
      />

      {showNewForm && <NewConsentForm onClose={() => setShowNewForm(false)} onSubmit={handleNewConsent} />}
    </div>
  )
}

export default ConsentWorkflow
