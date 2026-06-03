'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Plus, AlertCircle, FileCheck } from 'lucide-react'
import {
  ConsentRecord,
  ConsentStatus,
  EntityType,
  calculateConsentCompliance,
  getStatusBadge,
  getEntityTypeLabel,
  getEntityIcon,
  formatExpiryDate,
  isExpiringSoon,
} from '@/lib/consent-utils'
import { getExchangeConfig, ExchangeCode } from '@/lib/exchange-config'

// ============================================================================
// Component Styles & Constants
// ============================================================================

const ENTITY_TYPES: EntityType[] = ['auditor', 'lawyer', 'valuation_expert', 'environmental_expert', 'other_expert']
const CONSENT_STATUSES: ConsentStatus[] = ['pending', 'signed', 'rejected', 'expired']

const severityBgMap: Record<ConsentStatus, string> = {
  pending: 'bg-yellow-50 border-yellow-200',
  signed: 'bg-green-50 border-green-200',
  rejected: 'bg-red-50 border-red-200',
  expired: 'bg-gray-50 border-gray-200',
}

// ============================================================================
// Main Component
// ============================================================================

export default function ConsentLettersPage() {
  const { data: session, status } = useSession()
  const [companyId, setCompanyId] = useState<string>('')
  const [exchange, setExchange] = useState<ExchangeCode>('tsx')
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    from_entity: '',
    entity_type: 'auditor' as EntityType,
    consent_type: '',
    expiry_date: '',
  })
  const [filterStatus, setFilterStatus] = useState<ConsentStatus | 'all'>('all')
  const [filterEntityType, setFilterEntityType] = useState<EntityType | 'all'>('all')
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [compliance, setCompliance] = useState<any>(null)

  // Load company ID from session or localStorage
  useEffect(() => {
    const storedCompanyId = localStorage.getItem('selected_company_id')
    if (storedCompanyId) {
      setCompanyId(storedCompanyId)
    }
  }, [])

  // Fetch consents when company ID changes
  useEffect(() => {
    if (companyId && session) {
      fetchConsents()
    }
  }, [companyId, session])

  // Calculate compliance when consents or exchange changes
  useEffect(() => {
    if (consents.length > 0 && exchange) {
      const complianceSummary = calculateConsentCompliance(consents, exchange)
      setCompliance(complianceSummary)
    }
  }, [consents, exchange])

  // ============================================================================
  // API Calls
  // ============================================================================

  const fetchConsents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/compliance/consents?company_id=${companyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch consents')
      }

      const data = await response.json()
      setConsents(data.consents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createConsent = async () => {
    try {
      if (!formData.from_entity || !formData.entity_type) {
        setError('Please fill in all required fields')
        return
      }

      const response = await fetch('/api/compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          from_entity: formData.from_entity,
          entity_type: formData.entity_type,
          consent_type: formData.consent_type || getEntityTypeLabel(formData.entity_type),
          expiry_date: formData.expiry_date || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create consent')
      }

      const data = await response.json()
      setConsents([data.consent, ...consents])
      setShowForm(false)
      setFormData({
        from_entity: '',
        entity_type: 'auditor',
        consent_type: '',
        expiry_date: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const updateConsentStatus = async (consentId: string, newStatus: ConsentStatus) => {
    try {
      const response = await fetch(`/api/compliance/consents/${consentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update consent')
      }

      const data = await response.json()
      setConsents(consents.map((c) => (c.id === consentId ? data.consent : c)))
      if (selectedConsent?.id === consentId) {
        setSelectedConsent(data.consent)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const generateConsentLetter = async (entityType: EntityType) => {
    try {
      const response = await fetch('/api/compliance/consents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          entity_type: entityType,
          from_entity: 'to-be-filled',
          exchange,
          format: 'html',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate consent letter')
      }

      const data = await response.json()

      // Download HTML as file
      const element = document.createElement('a')
      element.setAttribute('href', `data:text/html;charset=utf-8,${encodeURIComponent(data.template.html)}`)
      element.setAttribute(
        'download',
        `Consent_Request_${entityType.replace('-', '_')}_${new Date().getTime()}.html`
      )
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // ============================================================================
  // Filter & Sort
  // ============================================================================

  const filteredConsents = consents.filter((consent) => {
    if (filterStatus !== 'all' && consent.status !== filterStatus) return false
    if (filterEntityType !== 'all' && consent.entity_type !== filterEntityType) return false
    return true
  })

  // ============================================================================
  // Render
  // ============================================================================

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading consent letters...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Please sign in to continue</div>
      </div>
    )
  }

  return (
    <motion.div style={{ background: '#F7F6F4', minHeight: '100vh' }} suppressHydrationWarning>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '4.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2"
            style={{ marginBottom: '1.5rem' }}
          >
            <span
              className="pill text-xs font-bold uppercase tracking-wider"
              style={{ background: '#FDECEB', color: '#E8312A' }}
            >
              <FileCheck className="w-3.5 h-3.5 inline mr-1.5" />
              Regulatory Consents
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="serif"
            style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}
          >
            Track Expert and<br />
            <span style={{ color: '#E8312A' }}>Regulatory Consents</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-lg leading-relaxed"
            style={{ marginBottom: '1.5rem', maxWidth: '620px', margin: '0 auto 2.5rem', color: '#666666' }}
          >
            Manage and collect required consents from auditors, legal counsel, and other experts for IPO compliance.
          </motion.p>

          {/* Action Button */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-all text-sm text-white active:scale-95 mx-auto"
            style={{
              background: '#E8312A',
              transform: 'translateY(0)',
              transitionProperty: 'all',
              transitionDuration: '0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(232, 49, 42, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'New Consent'}
          </motion.button>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
        >

          {/* Compliance Summary */}
          {compliance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-4"
                style={{ background: '#FDECEB' }}
              >
                <div className="body-sm text-gray-600 mb-1">Compliance</div>
                <div className="text-3xl font-bold" style={{ color: '#E8312A' }}>{compliance.compliance_percentage}%</div>
                <div className="caption-sm text-gray-500 mt-2">
                  {compliance.signed} of {compliance.total} signed
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-4"
                style={{ background: '#FEF3C7' }}
              >
                <div className="body-sm text-gray-600 mb-1">Pending</div>
                <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{compliance.pending}</div>
                <div className="caption-sm text-gray-500 mt-2">awaiting response</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-4"
                style={{ background: '#FFE8CC' }}
              >
                <div className="body-sm text-gray-600 mb-1">Expiring Soon</div>
                <div className="text-3xl font-bold" style={{ color: '#FF6D00' }}>{compliance.expiring_soon}</div>
                <div className="caption-sm text-gray-500 mt-2">within 30 days</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-4"
                style={{ background: '#F3F4F6' }}
              >
                <div className="body-sm text-gray-600 mb-1">Total</div>
                <div className="text-3xl font-bold text-gray-900">{compliance.total}</div>
                <div className="caption-sm text-gray-500 mt-2">consent letters</div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* New Consent Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-lg p-6 border border-blue-200 mb-8"
          >
            <h2 className="h4 font-semibold mb-4">Create New Consent Request</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block label font-medium text-gray-700 mb-2">Entity Name *</label>
                <input
                  type="text"
                  value={formData.from_entity}
                  onChange={(e) => setFormData({ ...formData, from_entity: e.target.value })}
                  placeholder="e.g., KPMG LLP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block label font-medium text-gray-700 mb-2">Entity Type *</label>
                <select
                  value={formData.entity_type}
                  onChange={(e) => setFormData({ ...formData, entity_type: e.target.value as EntityType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getEntityIcon(type)} {getEntityTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block label font-medium text-gray-700 mb-2">Consent Type</label>
                <input
                  type="text"
                  value={formData.consent_type}
                  onChange={(e) => setFormData({ ...formData, consent_type: e.target.value })}
                  placeholder="Auto-filled based on entity type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block label font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && <div className="text-red-600 body-sm mb-4">{error}</div>}

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createConsent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Create Consent
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  generateConsentLetter(formData.entity_type).then(() =>
                    setError(null)
                  )
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Generate Letter Template
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block label font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent body-sm"
              >
                <option value="all">All Statuses</option>
                {CONSENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusBadge(status).label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block label font-medium text-gray-700 mb-2">Filter by Entity Type</label>
              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent body-sm"
              >
                <option value="all">All Types</option>
                {ENTITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getEntityIcon(type)} {getEntityTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block label font-medium text-gray-700 mb-2">Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value as ExchangeCode)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent body-sm"
              >
                <option value="tsx">TSX</option>
                <option value="nasdaq">NASDAQ</option>
                <option value="nyse">NYSE</option>
                <option value="tsxv">TSXV</option>
                <option value="cse">CSE</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Consents List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {filteredConsents.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-600 mb-4">No consent letters found</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Create your first consent
              </motion.button>
            </div>
          ) : (
            filteredConsents.map((consent, index) => (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-lg p-6 border-l-4 transition cursor-pointer ${severityBgMap[consent.status]} border-l-blue-500`}
                onClick={() => {
                  setSelectedConsent(consent)
                  setShowDetails(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getEntityIcon(consent.entity_type)}</span>
                      <h3 className="h4 font-semibold text-gray-900">{consent.from_entity}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(consent.status).bg_color} ${getStatusBadge(consent.status).color}`}>
                        {getStatusBadge(consent.status).icon} {getStatusBadge(consent.status).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 body-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Entity Type:</span> {getEntityTypeLabel(consent.entity_type)}
                      </div>
                      <div>
                        <span className="font-medium">Consent Type:</span> {consent.consent_type}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(consent.created_at).toLocaleDateString('en-CA')}
                      </div>
                      <div>
                        <span className="font-medium">Expiry:</span> {formatExpiryDate(consent.expiry_date)}
                      </div>
                    </div>

                    {isExpiringSoon(consent.expiry_date) && consent.status !== 'signed' && (
                      <div className="caption-sm text-orange-700 bg-orange-50 px-2 py-1 rounded inline-block">
                        ⚠️ Expiring soon - action required
                      </div>
                    )}
                  </div>

                  <div className="ml-4 text-right">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateConsentStatus(consent.id, e.target.value as ConsentStatus)}
                      value={consent.status}
                      className="px-3 py-2 border border-gray-300 rounded-lg body-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CONSENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {getStatusBadge(status).label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </motion.div>
  )
}
