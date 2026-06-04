'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FileText, Plus, CheckCircle2, Clock, AlertCircle, Download, Eye } from 'lucide-react'

const AVAILABLE_FILINGS = [
  {
    country: 'Canada',
    exchange: 'TSXV',
    description: 'Venture Exchange listing',
    icon: '🇨🇦',
  },
  {
    country: 'Canada',
    exchange: 'TSX',
    description: 'Main board listing',
    icon: '🇨🇦',
  },
  {
    country: 'Canada',
    exchange: 'CSE',
    description: 'Canadian Securities Exchange',
    icon: '🇨🇦',
  },
  {
    country: 'United States',
    exchange: 'NASDAQ',
    description: 'National exchange listing',
    icon: '🇺🇸',
  },
  {
    country: 'United States',
    exchange: 'NYSE',
    description: 'New York Stock Exchange',
    icon: '🇺🇸',
  },
  {
    country: 'United States',
    exchange: 'OTC',
    description: 'Over-the-counter trading',
    icon: '🇺🇸',
  },
]

const FILING_HISTORY = [
  {
    id: 'FIL-001',
    country: 'Canada',
    exchange: 'TSXV',
    submittedDate: '2026-05-15',
    status: 'submitted' as const,
    completeness: 95,
    lastUpdated: '2026-05-18',
  },
  {
    id: 'FIL-002',
    country: 'Canada',
    exchange: 'TSX',
    submittedDate: '2026-04-20',
    status: 'approved' as const,
    completeness: 100,
    lastUpdated: '2026-05-10',
  },
  {
    id: 'FIL-003',
    country: 'United States',
    exchange: 'NASDAQ',
    submittedDate: '2026-03-15',
    status: 'rejected' as const,
    completeness: 78,
    lastUpdated: '2026-04-12',
  },
  {
    id: 'FIL-004',
    country: 'Canada',
    exchange: 'CSE',
    submittedDate: '2026-06-01',
    status: 'pending' as const,
    completeness: 65,
    lastUpdated: '2026-06-03',
  },
]

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

function getStatusIcon(status: FilingStatus) {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'submitted':
      return <FileText className="w-4 h-4" />
    case 'approved':
      return <CheckCircle2 className="w-4 h-4" />
    case 'rejected':
      return <AlertCircle className="w-4 h-4" />
  }
}

export default function FilingDashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="h2" style={{ color: '#1A1A1A', marginBottom: '0.5rem' }}>
            Multi-Country Filing
          </h2>
          <p className="body-sm" style={{ color: '#717171' }}>
            Manage filing applications across multiple exchanges
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* AVAILABLE FILINGS */}
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
                <h3 className="h4" style={{ color: '#1A1A1A' }}>
                  Available Filings
                </h3>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <AnimatePresence>
                    {AVAILABLE_FILINGS.map((filing, idx) => (
                      <motion.div
                        key={`${filing.country}-${filing.exchange}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group cursor-pointer"
                      >
                        <div
                          className="rounded-xl p-4 border transition-all"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E4E0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow =
                              '0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)'
                            e.currentTarget.style.borderColor = '#D1D5DB'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow =
                              '0 1px 3px rgba(0,0,0,0.08)'
                            e.currentTarget.style.borderColor = '#E5E4E0'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '1rem',
                            }}
                          >
                            <span style={{ fontSize: '1.5rem' }}>
                              {filing.icon}
                            </span>
                            <span
                              className="label-sm"
                              style={{
                                background: '#EFF6FF',
                                color: '#1D4ED8',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                              }}
                            >
                              {filing.country}
                            </span>
                          </div>

                          <h4
                            className="h4"
                            style={{
                              color: '#1A1A1A',
                              marginBottom: '0.5rem',
                            }}
                          >
                            {filing.exchange}
                          </h4>

                          <p
                            className="body-sm"
                            style={{
                              color: '#717171',
                              marginBottom: '1rem',
                            }}
                          >
                            {filing.description}
                          </p>

                          <Link href={`/dashboard/filing/new?exchange=${filing.exchange}`}>
                            <button
                              className="w-full py-2.5 rounded-lg transition-opacity"
                              style={{
                                background: '#E8312A',
                                color: '#FFFFFF',
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
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <Plus className="w-4 h-4" />
                                <span className="label">Start Filing</span>
                              </div>
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FILING HISTORY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div
              className="rounded-xl overflow-hidden"
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
                  Filing History
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F7F6F4', borderBottom: '1px solid #E5E4E0' }}>
                      <th
                        className="label-sm"
                        style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          color: '#717171',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Filing ID
                      </th>
                      <th
                        className="label-sm"
                        style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          color: '#717171',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Exchange
                      </th>
                      <th
                        className="label-sm"
                        style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          color: '#717171',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Submitted Date
                      </th>
                      <th
                        className="label-sm"
                        style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          color: '#717171',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="label-sm"
                        style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'center',
                          color: '#717171',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Completeness
                      </th>
                      <th
                        className="label-sm"
                        style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'center',
                          color: '#717171',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {FILING_HISTORY.map((filing, idx) => {
                        const statusColor = getStatusColor(filing.status)
                        return (
                          <motion.tr
                            key={filing.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                              borderBottom: '1px solid #E5E4E0',
                              background: '#FFFFFF',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F9F8F6'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#FFFFFF'
                            }}
                          >
                            <td
                              className="body-sm"
                              style={{
                                padding: '1rem 1.5rem',
                                color: '#1A1A1A',
                                fontWeight: 500,
                              }}
                            >
                              {filing.id}
                            </td>

                            <td
                              className="body-sm"
                              style={{
                                padding: '1rem 1.5rem',
                                color: '#1A1A1A',
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 500 }}>
                                  {filing.exchange}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#717171',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  {filing.country}
                                </div>
                              </div>
                            </td>

                            <td
                              className="body-sm"
                              style={{
                                padding: '1rem 1.5rem',
                                color: '#717171',
                              }}
                            >
                              {new Date(filing.submittedDate).toLocaleDateString()}
                            </td>

                            <td
                              style={{
                                padding: '1rem 1.5rem',
                              }}
                            >
                              <div
                                className="label-sm"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 1rem',
                                  background: statusColor.bg,
                                  color: statusColor.text,
                                  borderRadius: '9999px',
                                  fontWeight: 600,
                                }}
                              >
                                {getStatusIcon(filing.status)}
                                {statusColor.label}
                              </div>
                            </td>

                            <td
                              style={{
                                padding: '1rem 1.5rem',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    width: '60px',
                                    height: '6px',
                                    background: '#E5E4E0',
                                    borderRadius: '9999px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${filing.completeness}%`,
                                      height: '100%',
                                      background: '#2D7A5F',
                                      transition: 'width 0.3s ease',
                                    }}
                                  />
                                </div>
                                <span
                                  className="label-sm"
                                  style={{ color: '#717171', minWidth: '35px' }}
                                >
                                  {filing.completeness}%
                                </span>
                              </div>
                            </td>

                            <td
                              style={{
                                padding: '1rem 1.5rem',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <Link href={`/dashboard/filing/${filing.id}`}>
                                  <button
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '0.5rem',
                                      color: '#1D4ED8',
                                      borderRadius: '6px',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#EFF6FF'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'transparent'
                                    }}
                                    title="View filing details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: '#717171',
                                    borderRadius: '6px',
                                    transition: 'background-color 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F7F6F4'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                  }}
                                  title="Download filing"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
