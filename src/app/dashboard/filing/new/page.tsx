'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronRight,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

const EXCHANGE_CONFIGS = {
  TSXV: {
    name: 'TSXV',
    fullName: 'TSX Venture Exchange',
    country: 'Canada',
    requiredDocuments: [
      { id: 'doc-1', name: 'Articles of Incorporation', required: true },
      { id: 'doc-2', name: 'Financial Statements (Audited)', required: true },
      { id: 'doc-3', name: 'Management Discussion & Analysis (MD&A)', required: true },
      { id: 'doc-4', name: 'Corporate Governance Policy', required: true },
      { id: 'doc-5', name: 'Board Charter', required: true },
      { id: 'doc-6', name: 'Form 2A (Personal Info Forms)', required: true },
      { id: 'doc-7', name: 'Audit Committee Charter', required: false },
      { id: 'doc-8', name: 'Code of Conduct', required: false },
    ],
  },
  TSX: {
    name: 'TSX',
    fullName: 'TSX Main Board',
    country: 'Canada',
    requiredDocuments: [
      { id: 'doc-1', name: 'Articles of Incorporation', required: true },
      { id: 'doc-2', name: 'Financial Statements (Audited)', required: true },
      { id: 'doc-3', name: 'Management Discussion & Analysis (MD&A)', required: true },
      { id: 'doc-4', name: 'Corporate Governance Policy', required: true },
      { id: 'doc-5', name: 'Board Charter', required: true },
      { id: 'doc-6', name: 'Form 2A (Personal Info Forms)', required: true },
      { id: 'doc-7', name: 'Audit Committee Charter', required: true },
      { id: 'doc-8', name: 'Compensation Committee Charter', required: true },
      { id: 'doc-9', name: 'Nominating Committee Charter', required: true },
      { id: 'doc-10', name: 'Code of Conduct', required: true },
    ],
  },
  NASDAQ: {
    name: 'NASDAQ',
    fullName: 'NASDAQ Stock Market',
    country: 'United States',
    requiredDocuments: [
      { id: 'doc-1', name: 'Form S-1', required: true },
      { id: 'doc-2', name: 'Financial Statements (Audited)', required: true },
      { id: 'doc-3', name: 'Auditor Independence Certification', required: true },
      { id: 'doc-4', name: 'Corporate Governance Policy', required: true },
      { id: 'doc-5', name: 'Board Charter', required: true },
      { id: 'doc-6', name: 'Audit Committee Charter', required: true },
      { id: 'doc-7', name: 'Code of Conduct', required: true },
      { id: 'doc-8', name: 'Risk Factors Disclosure', required: true },
      { id: 'doc-9', name: 'Management Biography & Compensation', required: true },
      { id: 'doc-10', name: 'Executive Compensation Analysis', required: false },
    ],
  },
  NYSE: {
    name: 'NYSE',
    fullName: 'New York Stock Exchange',
    country: 'United States',
    requiredDocuments: [
      { id: 'doc-1', name: 'Form S-1', required: true },
      { id: 'doc-2', name: 'Financial Statements (Audited)', required: true },
      { id: 'doc-3', name: 'Auditor Independence Certification', required: true },
      { id: 'doc-4', name: 'Corporate Governance Policy', required: true },
      { id: 'doc-5', name: 'Board Charter', required: true },
      { id: 'doc-6', name: 'Audit Committee Charter', required: true },
      { id: 'doc-7', name: 'Code of Conduct', required: true },
      { id: 'doc-8', name: 'Risk Factors Disclosure', required: true },
      { id: 'doc-9', name: 'Management Biography & Compensation', required: true },
      { id: 'doc-10', name: 'Compensation Committee Charter', required: true },
    ],
  },
  CSE: {
    name: 'CSE',
    fullName: 'Canadian Securities Exchange',
    country: 'Canada',
    requiredDocuments: [
      { id: 'doc-1', name: 'Articles of Incorporation', required: true },
      { id: 'doc-2', name: 'Financial Statements', required: true },
      { id: 'doc-3', name: 'Business Plan / Overview', required: true },
      { id: 'doc-4', name: 'Corporate Governance Policy', required: true },
      { id: 'doc-5', name: 'Form 2A (Personal Info Forms)', required: true },
      { id: 'doc-6', name: 'Management Biography', required: false },
    ],
  },
}

type ExchangeKey = keyof typeof EXCHANGE_CONFIGS

interface DocumentUpload {
  id: string
  name: string
  status: 'not_started' | 'uploading' | 'uploaded' | 'verified'
  file?: File
  uploadDate?: string
}

export default function NewFilingPage() {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeKey | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, DocumentUpload>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const exchangeConfig = selectedExchange
    ? EXCHANGE_CONFIGS[selectedExchange]
    : null

  const requiredCount = exchangeConfig
    ? exchangeConfig.requiredDocuments.filter((d) => d.required).length
    : 0
  const uploadedCount = requiredCount
    ? Object.values(uploadedDocuments).filter((d) => d.status === 'uploaded' || d.status === 'verified').length
    : 0
  const completeness = requiredCount ? Math.round((uploadedCount / requiredCount) * 100) : 0

  const validateAndSubmit = () => {
    const errors: string[] = []

    if (!selectedExchange) {
      errors.push('Please select an exchange')
    }

    if (exchangeConfig) {
      const missingRequired = exchangeConfig.requiredDocuments.filter((doc) => {
        if (!doc.required) return false
        const uploaded = uploadedDocuments[doc.id]
        return !uploaded || (uploaded.status !== 'uploaded' && uploaded.status !== 'verified')
      })

      if (missingRequired.length > 0) {
        errors.push(
          `Missing ${missingRequired.length} required document(s): ${missingRequired
            .map((d) => d.name)
            .join(', ')}`
        )
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleFileUpload = (docId: string, file: File) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [docId]: {
        id: docId,
        name: file.name,
        status: 'verified',
        file,
        uploadDate: new Date().toISOString(),
      },
    }))
  }

  const handleDragAndDrop = (e: React.DragEvent<HTMLDivElement>, docId: string) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(docId, files[0])
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Breadcrumb */}
          <div
            className="body-sm"
            style={{ color: '#717171', marginBottom: '1.5rem' }}
          >
            <Link href="/dashboard">
              <span className="text-accent hover:underline cursor-pointer">
                Dashboard
              </span>
            </Link>
            <ChevronRight className="w-4 h-4 inline mx-2" />
            <Link href="/dashboard/filing">
              <span className="text-accent hover:underline cursor-pointer">
                Filing
              </span>
            </Link>
            <ChevronRight className="w-4 h-4 inline mx-2" />
            <span>New Filing</span>
          </div>

          {/* Title */}
          <h2 className="h2" style={{ color: '#1A1A1A' }}>
            Start New Filing
          </h2>
          <p
            className="body-sm"
            style={{ color: '#717171', marginTop: '0.5rem' }}
          >
            Select an exchange and upload required documents
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '2rem',
          }}
        >
          {/* Left Column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* Exchange Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div
                className="rounded-xl"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E5E4E0',
                  }}
                >
                  <label className="h4" style={{ color: '#1A1A1A', display: 'block' }}>
                    Select Exchange
                  </label>
                  <p
                    className="body-sm"
                    style={{ color: '#717171', marginTop: '0.25rem' }}
                  >
                    Choose where you want to list
                  </p>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {/* Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        textAlign: 'left',
                        background: '#FFFFFF',
                        border: '1px solid #E5E4E0',
                        borderRadius: '8px',
                        color: selectedExchange ? '#1A1A1A' : '#9A9A9A',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedExchange) return
                        e.currentTarget.style.borderColor = '#D1D5DB'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E5E4E0'
                      }}
                    >
                      <span className="body">
                        {selectedExchange
                          ? EXCHANGE_CONFIGS[selectedExchange].fullName
                          : 'Choose an exchange...'}
                      </span>
                      <ChevronDown
                        className="w-4 h-4"
                        style={{
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '0.5rem',
                            background: '#FFFFFF',
                            border: '1px solid #E5E4E0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                            zIndex: 50,
                          }}
                        >
                          {Object.entries(EXCHANGE_CONFIGS).map(
                            ([key, config], idx) => (
                              <button
                                key={key}
                                onClick={() => {
                                  setSelectedExchange(key as ExchangeKey)
                                  setIsDropdownOpen(false)
                                  setValidationErrors([])
                                }}
                                style={{
                                  width: '100%',
                                  padding: '1rem',
                                  textAlign: 'left',
                                  background:
                                    selectedExchange === key
                                      ? '#EFF6FF'
                                      : '#FFFFFF',
                                  border: 'none',
                                  borderBottom:
                                    idx < Object.keys(EXCHANGE_CONFIGS).length - 1
                                      ? '1px solid #E5E4E0'
                                      : 'none',
                                  cursor: 'pointer',
                                  color: '#1A1A1A',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F7F6F4'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    selectedExchange === key ? '#EFF6FF' : '#FFFFFF'
                                }}
                              >
                                <div className="label" style={{ fontWeight: 500 }}>
                                  {config.fullName}
                                </div>
                                <div
                                  className="caption-sm"
                                  style={{ color: '#717171', marginTop: '0.25rem' }}
                                >
                                  {config.country}
                                </div>
                              </button>
                            )
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Validation Messages */}
            <AnimatePresence>
              {validationErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div
                    className="rounded-xl"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #DC2626',
                      boxShadow: '0 1px 3px rgba(220, 38, 38, 0.12)',
                    }}
                  >
                    <div
                      style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #DC2626',
                        background: '#FEE2E2',
                      }}
                    >
                      <h3
                        className="h4"
                        style={{
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <AlertCircle className="w-5 h-5" />
                        Please fix the following errors
                      </h3>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <ul style={{ listStylePosition: 'inside' }}>
                        {validationErrors.map((error, idx) => (
                          <li
                            key={idx}
                            className="body-sm"
                            style={{
                              color: '#DC2626',
                              marginBottom: idx < validationErrors.length - 1 ? '0.5rem' : '0',
                            }}
                          >
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Checklist */}
            {exchangeConfig && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <div
                  className="rounded-xl"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E4E0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #E5E4E0',
                    }}
                  >
                    <h3 className="h4" style={{ color: '#1A1A1A' }}>
                      Upload Documents
                    </h3>
                    <p
                      className="body-sm"
                      style={{ color: '#717171', marginTop: '0.25rem' }}
                    >
                      {requiredCount} required • {uploadedCount} uploaded
                    </p>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <AnimatePresence>
                      {exchangeConfig.requiredDocuments.map((doc, idx) => {
                        const uploaded = uploadedDocuments[doc.id]
                        const isUploaded = uploaded && (uploaded.status === 'uploaded' || uploaded.status === 'verified')

                        return (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            style={{
                              marginBottom:
                                idx < exchangeConfig.requiredDocuments.length - 1
                                  ? '1.5rem'
                                  : '0',
                            }}
                          >
                            {/* Document Header */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.75rem',
                              }}
                            >
                              {isUploaded ? (
                                <CheckCircle2
                                  className="w-5 h-5"
                                  style={{ color: '#2D7A5F' }}
                                />
                              ) : doc.required ? (
                                <AlertCircle
                                  className="w-5 h-5"
                                  style={{ color: '#B45309' }}
                                />
                              ) : (
                                <FileText
                                  className="w-5 h-5"
                                  style={{ color: '#717171' }}
                                />
                              )}
                              <div style={{ flex: 1 }}>
                                <div className="label" style={{ color: '#1A1A1A' }}>
                                  {doc.name}
                                </div>
                                {doc.required && !isUploaded && (
                                  <span
                                    className="caption-sm"
                                    style={{
                                      color: '#B45309',
                                      fontWeight: 500,
                                    }}
                                  >
                                    Required
                                  </span>
                                )}
                                {isUploaded && (
                                  <span
                                    className="caption-sm"
                                    style={{
                                      color: '#2D7A5F',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {uploaded.uploadDate &&
                                      new Date(uploaded.uploadDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Upload Zone */}
                            {!isUploaded && (
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDragAndDrop(e, doc.id)}
                                style={{
                                  padding: '1.5rem',
                                  border: '2px dashed #E5E4E0',
                                  borderRadius: '8px',
                                  background: '#FAFAF9',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#1D4ED8'
                                  e.currentTarget.style.background = '#EFF6FF'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#E5E4E0'
                                  e.currentTarget.style.background = '#FAFAF9'
                                }}
                              >
                                <input
                                  type="file"
                                  id={`file-${doc.id}`}
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileUpload(doc.id, e.target.files[0])
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`file-${doc.id}`}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Upload
                                    className="w-5 h-5"
                                    style={{ color: '#1D4ED8' }}
                                  />
                                  <div className="body-sm" style={{ color: '#1A1A1A' }}>
                                    Drag and drop or{' '}
                                    <span
                                      style={{
                                        color: '#1D4ED8',
                                        fontWeight: 500,
                                      }}
                                    >
                                      click to upload
                                    </span>
                                  </div>
                                  <div className="caption-sm" style={{ color: '#717171' }}>
                                    PDF, DOCX, or TXT
                                  </div>
                                </label>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            {exchangeConfig && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                onClick={validateAndSubmit}
                style={{
                  background: completeness === 100 ? '#E8312A' : '#D1D5DB',
                  color: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: completeness === 100 ? 'pointer' : 'not-allowed',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  if (completeness === 100) {
                    e.currentTarget.style.opacity = '0.9'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                disabled={completeness < 100}
              >
                <div className="h4" style={{ color: '#FFFFFF' }}>
                  {completeness === 100 ? 'Submit Filing' : `Complete to Submit (${completeness}%)`}
                </div>
              </motion.button>
            )}
          </div>

          {/* Right Sidebar - Progress */}
          {exchangeConfig && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div
                className="rounded-xl sticky"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                  padding: '1.5rem',
                  top: '2rem',
                }}
              >
                <h4 className="h4" style={{ color: '#1A1A1A', marginBottom: '1.5rem' }}>
                  Filing Progress
                </h4>

                {/* Progress Circle */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: `conic-gradient(#2D7A5F 0deg, #2D7A5F ${completeness * 3.6}deg, #E5E4E0 ${completeness * 3.6}deg)`,
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div className="h2" style={{ color: '#1A1A1A' }}>
                          {completeness}%
                        </div>
                        <div className="caption-sm" style={{ color: '#717171' }}>
                          Complete
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ borderTop: '1px solid #E5E4E0', paddingTop: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="label" style={{ color: '#1A1A1A' }}>
                      Required Documents
                    </div>
                    <div
                      className="h3"
                      style={{
                        color: '#2D7A5F',
                        marginTop: '0.25rem',
                      }}
                    >
                      {uploadedCount}/{requiredCount}
                    </div>
                  </div>

                  <div>
                    <div className="label" style={{ color: '#1A1A1A' }}>
                      Optional Documents
                    </div>
                    <div
                      className="h3"
                      style={{
                        color: '#1D4ED8',
                        marginTop: '0.25rem',
                      }}
                    >
                      {exchangeConfig.requiredDocuments.filter((d) => !d.required).length}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
