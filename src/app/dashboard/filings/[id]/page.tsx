'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  RotateCcw,
} from 'lucide-react'
import { useParams } from 'next/navigation'

const FILING_DETAILS = {
  'FIL-002': {
    id: 'FIL-002',
    exchange: 'TSX',
    country: 'Canada',
    status: 'approved' as const,
    submittedDate: '2026-04-20',
    submittedBy: 'Mary Johnson',
    lastUpdated: '2026-05-10',
    completeness: 100,
    documents: [
      {
        id: 'DOC-201',
        name: 'Articles of Incorporation',
        type: 'document',
        status: 'verified' as const,
        uploadedDate: '2026-04-15',
        checksum: 'm1n2o3p4q5r6s7t8u9v0w1x2',
      },
      {
        id: 'DOC-202',
        name: 'Financial Statements (2024)',
        type: 'document',
        status: 'verified' as const,
        uploadedDate: '2026-04-16',
        checksum: 'n2o3p4q5r6s7t8u9v0w1x2y3',
      },
    ],
    timeline: [
      {
        event: 'Filing Initiated',
        date: '2026-04-20',
        description: 'TSX filing application submitted',
        type: 'info' as const,
      },
      {
        event: 'Documents Uploaded',
        date: '2026-04-21',
        description: 'All required documents submitted',
        type: 'info' as const,
      },
      {
        event: 'Review Completed',
        date: '2026-05-05',
        description: 'Exchange compliance review completed',
        type: 'info' as const,
      },
      {
        event: 'Filing Approved',
        date: '2026-05-10',
        description: 'Application approved by exchange',
        type: 'info' as const,
      },
    ],
    errors: null,
  },
  'FIL-001': {
    id: 'FIL-001',
    exchange: 'TSXV',
    country: 'Canada',
    status: 'submitted' as const,
    submittedDate: '2026-05-15',
    submittedBy: 'Sarah Chen',
    lastUpdated: '2026-05-18',
    completeness: 95,
    documents: [
      {
        id: 'DOC-001',
        name: 'Articles of Incorporation',
        type: 'document',
        status: 'verified' as const,
        uploadedDate: '2026-05-10',
        checksum: 'a3f8b2c1e9d4f5g6h7i8j9k0',
      },
      {
        id: 'DOC-002',
        name: 'Financial Statements (2024)',
        type: 'document',
        status: 'verified' as const,
        uploadedDate: '2026-05-11',
        checksum: 'b4g9c3d0e7f6h5i8j9k1l2m3',
      },
      {
        id: 'DOC-003',
        name: 'Auditor Report',
        type: 'document',
        status: 'verified' as const,
        uploadedDate: '2026-05-12',
        checksum: 'c5h0d4e1f8g7i6j9k0l3m4n5',
      },
      {
        id: 'DOC-004',
        name: 'Management Information Circular',
        type: 'document',
        status: 'pending' as const,
        uploadedDate: '2026-05-13',
        checksum: 'd6i1e5f2g9h8j7k0l1m4n5o6',
      },
      {
        id: 'DOC-005',
        name: 'Corporate Governance Policy',
        type: 'document',
        status: 'pending' as const,
        uploadedDate: '2026-05-14',
        checksum: 'e7j2f6g3h0i9k8l1m2n5o6p7',
      },
    ],
    timeline: [
      {
        event: 'Filing Initiated',
        date: '2026-05-15',
        description: 'Multi-country filing process started',
        type: 'info' as const,
      },
      {
        event: 'Documents Uploaded',
        date: '2026-05-16',
        description: 'Initial document package submitted',
        type: 'info' as const,
      },
      {
        event: 'Initial Review',
        date: '2026-05-17',
        description: 'Exchange compliance team began review',
        type: 'info' as const,
      },
      {
        event: 'Pending Clarification',
        date: '2026-05-18',
        description: 'Awaiting management response on disclosure items',
        type: 'warning' as const,
      },
    ],
    errors: null,
  },
  'FIL-003': {
    id: 'FIL-003',
    exchange: 'NASDAQ',
    country: 'United States',
    status: 'rejected' as const,
    submittedDate: '2026-03-15',
    submittedBy: 'John Smith',
    lastUpdated: '2026-04-12',
    completeness: 78,
    documents: [
      {
        id: 'DOC-301',
        name: 'Form S-1',
        type: 'document',
        status: 'verified' as const,
        uploadedDate: '2026-03-10',
        checksum: 'x1y2z3a4b5c6d7e8f9g0h1i2',
      },
      {
        id: 'DOC-302',
        name: 'Financial Statements (2024)',
        type: 'document',
        status: 'rejected' as const,
        uploadedDate: '2026-03-11',
        checksum: 'y2z3a4b5c6d7e8f9g0h1i2j3',
      },
    ],
    timeline: [
      {
        event: 'Filing Initiated',
        date: '2026-03-15',
        description: 'NASDAQ filing application submitted',
        type: 'info' as const,
      },
      {
        event: 'Preliminary Review',
        date: '2026-03-20',
        description: 'Initial document verification completed',
        type: 'info' as const,
      },
      {
        event: 'Comments Received',
        date: '2026-04-01',
        description: 'SEC requested additional disclosures and auditor independence verification',
        type: 'warning' as const,
      },
      {
        event: 'Rejection Notice',
        date: '2026-04-12',
        description: 'Filing rejected due to incomplete financial disclosures',
        type: 'error' as const,
      },
    ],
    errors: [
      {
        id: 'ERR-001',
        severity: 'critical' as const,
        field: 'Financial Statements - Segment Disclosure',
        message:
          'Segment revenue breakdown for GAAP vs Non-GAAP metrics must be clearly disclosed and reconciled.',
        resolution: 'Contact your auditor to provide detailed segment reconciliation per SEC guidelines.',
      },
      {
        id: 'ERR-002',
        severity: 'critical' as const,
        field: 'Auditor Independence Statement',
        message: 'Auditor independence form (Form AP) not included in filing package.',
        resolution:
          'Request Form AP from your auditor and include in next submission.',
      },
      {
        id: 'ERR-003',
        severity: 'error' as const,
        field: 'Risk Factors - Technology Risks',
        message: 'Risk disclosure is too generic. SEC requires specific technology risks.',
        resolution:
          'Revise risk factors to include company-specific technology and cybersecurity risks.',
      },
    ],
  },
}

type TimelineEventType = 'info' | 'warning' | 'error'
type DocumentStatus = 'verified' | 'pending' | 'rejected'
type FilingStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

function getStatusColor(status: FilingStatus) {
  switch (status) {
    case 'pending':
      return { bg: '#FEF3C7', text: '#B45309', label: 'Pending' }
    case 'submitted':
      return { bg: '#EFF6FF', text: '#1D4ED8', label: 'Submitted' }
    case 'approved':
      return { bg: '#EAF5F0', text: '#2D7A5F', label: 'Approved' }
    case 'rejected':
      return { bg: '#FDECEB', text: '#DC2626', label: 'Rejected' }
  }
}

function getStatusIcon(status: FilingStatus | DocumentStatus) {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'verified':
    case 'approved':
      return <CheckCircle2 className="w-4 h-4" />
    case 'rejected':
      return <AlertCircle className="w-4 h-4" />
    case 'submitted':
      return <FileText className="w-4 h-4" />
  }
}

export default function FilingDetailPage() {
  const params = useParams()
  const filingId = params['filing-id'] as string

  const filing =
    FILING_DETAILS[filingId as keyof typeof FILING_DETAILS]

  if (!filing) {
    return (
      <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="h1" style={{ color: '#1A1A1A' }}>
            Filing not found
          </h1>
          <p
            className="body-sm"
            style={{ color: '#717171', marginTop: '1rem' }}
          >
            The filing you're looking for doesn't exist.
          </p>
          <Link href="/dashboard/filing">
            <button
              style={{
                marginTop: '1.5rem',
                background: '#E8312A',
                color: '#FFFFFF',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Back to Filings
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColor = getStatusColor(filing.status)

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
            <span>{filing.id}</span>
          </div>

          {/* Title and Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <h2 className="h2" style={{ color: '#1A1A1A' }}>
                {filing.exchange} Filing
              </h2>
              <p
                className="body-sm"
                style={{ color: '#717171', marginTop: '0.5rem' }}
              >
                {filing.country} • {filing.id}
              </p>
            </div>
            <div
              className="label-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: statusColor.bg,
                color: statusColor.text,
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              {getStatusIcon(filing.status)}
              {statusColor.label}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '2rem',
          }}
        >
          {/* Left Column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* Filing Metadata */}
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
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem',
                  }}
                >
                  {/* Submitted Date */}
                  <div>
                    <div className="label-sm" style={{ color: '#717171' }}>
                      Submitted Date
                    </div>
                    <div
                      className="h4"
                      style={{ color: '#1A1A1A', marginTop: '0.5rem' }}
                    >
                      {new Date(filing.submittedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div>
                    <div className="label-sm" style={{ color: '#717171' }}>
                      Last Updated
                    </div>
                    <div
                      className="h4"
                      style={{ color: '#1A1A1A', marginTop: '0.5rem' }}
                    >
                      {new Date(filing.lastUpdated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Submitted By */}
                  <div>
                    <div className="label-sm" style={{ color: '#717171' }}>
                      Submitted By
                    </div>
                    <div
                      className="h4"
                      style={{ color: '#1A1A1A', marginTop: '0.5rem' }}
                    >
                      {filing.submittedBy}
                    </div>
                  </div>

                  {/* Completeness */}
                  <div>
                    <div className="label-sm" style={{ color: '#717171' }}>
                      Completeness
                    </div>
                    <div
                      className="h4"
                      style={{ color: '#1A1A1A', marginTop: '0.5rem' }}
                    >
                      {filing.completeness}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Messages (if rejected) */}
            {filing.errors && filing.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
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
                      Rejection Errors
                    </h3>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <AnimatePresence>
                      {filing.errors.map((error, idx) => (
                        <motion.div
                          key={error.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{
                            marginBottom:
                              idx < filing.errors!.length - 1 ? '1rem' : '0',
                          }}
                        >
                          <div
                            style={{
                              paddingBottom:
                                idx < filing.errors!.length - 1 ? '1rem' : '0',
                              borderBottom:
                                idx < filing.errors!.length - 1
                                  ? '1px solid #FEE2E2'
                                  : 'none',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '0.75rem',
                                marginBottom: '0.75rem',
                              }}
                            >
                              <AlertCircle
                                className="w-5 h-5 flex-shrink-0"
                                style={{ color: '#DC2626', marginTop: '0.125rem' }}
                              />
                              <div>
                                <div
                                  className="label"
                                  style={{ color: '#DC2626', fontWeight: 600 }}
                                >
                                  {error.field}
                                </div>
                                <p
                                  className="body-sm"
                                  style={{
                                    color: '#1A1A1A',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  {error.message}
                                </p>
                                <p
                                  className="caption-sm"
                                  style={{
                                    color: '#717171',
                                    marginTop: '0.5rem',
                                  }}
                                >
                                  <strong>Action:</strong> {error.resolution}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Document List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
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
                    Documents ({filing.documents.length})
                  </h3>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <AnimatePresence>
                    {filing.documents.map((doc, idx) => {
                      const isRejected = doc.status === 'rejected'
                      const isPending = doc.status === 'pending'
                      return (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{
                            paddingBottom: '1rem',
                            marginBottom:
                              idx < filing.documents.length - 1 ? '1rem' : '0',
                            borderBottom:
                              idx < filing.documents.length - 1
                                ? '1px solid #E5E4E0'
                                : 'none',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '1rem',
                            }}
                          >
                            <FileText
                              className="w-5 h-5 flex-shrink-0"
                              style={{
                                color: isRejected
                                  ? '#DC2626'
                                  : isPending
                                    ? '#B45309'
                                    : '#2D7A5F',
                                marginTop: '0.125rem',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                }}
                              >
                                <h4
                                  className="h4"
                                  style={{ color: '#1A1A1A' }}
                                >
                                  {doc.name}
                                </h4>
                                <span
                                  className="label-sm"
                                  style={{
                                    background: isRejected
                                      ? '#FDECEB'
                                      : isPending
                                        ? '#FEF3C7'
                                        : '#EAF5F0',
                                    color: isRejected
                                      ? '#DC2626'
                                      : isPending
                                        ? '#B45309'
                                        : '#2D7A5F',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                  }}
                                >
                                  {getStatusIcon(doc.status)}
                                  {doc.status.charAt(0).toUpperCase() +
                                    doc.status.slice(1)}
                                </span>
                              </div>
                              <p
                                className="body-sm"
                                style={{
                                  color: '#717171',
                                  marginTop: '0.5rem',
                                }}
                              >
                                Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                              </p>
                              <p
                                className="caption-sm"
                                style={{
                                  color: '#9A9A9A',
                                  marginTop: '0.25rem',
                                  fontFamily: 'monospace',
                                  overflowWrap: 'break-word',
                                }}
                              >
                                {doc.checksum}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
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
                    Event Timeline
                  </h3>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <AnimatePresence>
                    {filing.timeline.map((event, idx) => {
                      let dotColor = '#1D4ED8'
                      let lineColor = '#1D4ED8'
                      if (event.type === 'warning') {
                        dotColor = '#B45309'
                        lineColor = '#B45309'
                      } else if (event.type === 'error') {
                        dotColor = '#DC2626'
                        lineColor = '#DC2626'
                      }

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{
                            display: 'flex',
                            gap: '1.5rem',
                            marginBottom:
                              idx < filing.timeline.length - 1 ? '2rem' : '0',
                          }}
                        >
                          {/* Timeline dot and line */}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: dotColor,
                                border: '3px solid #FFFFFF',
                                boxShadow: `0 0 0 2px ${dotColor}`,
                                marginTop: '0.125rem',
                              }}
                            />
                            {idx < filing.timeline.length - 1 && (
                              <div
                                style={{
                                  width: '2px',
                                  height: '40px',
                                  background: lineColor,
                                  opacity: 0.3,
                                  marginTop: '0.5rem',
                                }}
                              />
                            )}
                          </div>

                          {/* Event content */}
                          <div style={{ paddingTop: '0.125rem', flex: 1 }}>
                            <div className="h4" style={{ color: '#1A1A1A' }}>
                              {event.event}
                            </div>
                            <p
                              className="body-sm"
                              style={{
                                color: '#717171',
                                marginTop: '0.25rem',
                              }}
                            >
                              {event.description}
                            </p>
                            <p
                              className="caption-sm"
                              style={{
                                color: '#9A9A9A',
                                marginTop: '0.5rem',
                              }}
                            >
                              {new Date(event.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar - Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {filing.status === 'rejected' && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  background: '#E8312A',
                  color: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <RotateCcw className="w-4 h-4" />
                  <span className="label">Resubmit Filing</span>
                </div>
              </motion.button>
            )}

            {(filing.status as FilingStatus) === 'approved' && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  background: '#E8312A',
                  color: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <Download className="w-4 h-4" />
                  <span className="label">Download Filing</span>
                </div>
              </motion.button>
            )}

            <Link href="/dashboard/filing">
              <button
                style={{
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #E5E4E0',
                  cursor: 'pointer',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F7F6F4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF'
                }}
              >
                <span className="label" style={{ fontWeight: 500 }}>
                  Back to Filings
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
