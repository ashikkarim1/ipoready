'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  TrendingUp,
  Filter,
  ChevronDown,
} from 'lucide-react'

export interface FilingRecord {
  id: string
  company: string
  exchange: string
  country: string
  filingType: string
  submittedDate: string
  status: 'in_progress' | 'ready_for_filing' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  completionPercentage: number
  nextAction: string
  timeline: Array<{
    stage: string
    date: string
    status: 'completed' | 'in_progress' | 'pending'
  }>
}

interface FilingStatusDashboardProps {
  filings?: FilingRecord[]
  onExportPDF?: () => void
  onStatusUpdate?: (filingId: string, newStatus: FilingRecord['status']) => void
}

const DEFAULT_FILINGS: FilingRecord[] = [
  {
    id: 'FIL-001',
    company: 'TechCorp Inc.',
    exchange: 'TSXV',
    country: 'Canada',
    filingType: 'Venture Acquisition',
    submittedDate: '2026-05-15',
    status: 'submitted',
    completionPercentage: 95,
    nextAction: 'Awaiting regulatory review',
    timeline: [
      { stage: 'Documents Prepared', date: '2026-05-01', status: 'completed' },
      { stage: 'Submitted to TSXV', date: '2026-05-15', status: 'completed' },
      { stage: 'Under Review', date: '2026-05-20', status: 'in_progress' },
      { stage: 'Expected Decision', date: '2026-06-15', status: 'pending' },
    ],
  },
  {
    id: 'FIL-002',
    company: 'GrowthCorp Ltd.',
    exchange: 'TSX',
    country: 'Canada',
    filingType: 'Main Board IPO',
    submittedDate: '2026-04-20',
    status: 'approved',
    completionPercentage: 100,
    nextAction: 'Ready for trading',
    timeline: [
      { stage: 'Documents Prepared', date: '2026-03-15', status: 'completed' },
      { stage: 'Submitted to TSX', date: '2026-04-20', status: 'completed' },
      { stage: 'Under Review', date: '2026-04-25', status: 'completed' },
      { stage: 'Approved', date: '2026-05-10', status: 'completed' },
    ],
  },
  {
    id: 'FIL-003',
    company: 'InnovateTech Inc.',
    exchange: 'SEC Edgar',
    country: 'United States',
    filingType: 'Form S-1',
    submittedDate: '2026-03-15',
    status: 'rejected',
    completionPercentage: 78,
    nextAction: 'Revise and resubmit',
    timeline: [
      { stage: 'Form S-1 Prepared', date: '2026-02-20', status: 'completed' },
      { stage: 'Submitted to SEC', date: '2026-03-15', status: 'completed' },
      { stage: 'Under Review', date: '2026-03-20', status: 'completed' },
      { stage: 'Rejected - Revisions Needed', date: '2026-04-12', status: 'completed' },
    ],
  },
  {
    id: 'FIL-004',
    company: 'ExpandGlobal Co.',
    exchange: 'CSE',
    country: 'Canada',
    filingType: 'Listing Application',
    submittedDate: '2026-06-01',
    status: 'in_progress',
    completionPercentage: 65,
    nextAction: 'Complete financial statements',
    timeline: [
      { stage: 'Application Started', date: '2026-05-15', status: 'completed' },
      { stage: 'Documents in Progress', date: '2026-06-01', status: 'in_progress' },
      { stage: 'CSE Review', date: '2026-06-15', status: 'pending' },
      { stage: 'Decision', date: '2026-07-15', status: 'pending' },
    ],
  },
]

function getStatusColor(status: FilingRecord['status']) {
  switch (status) {
    case 'in_progress':
      return { bg: '#FEF3C7', text: '#B45309', icon: Clock, label: 'In Progress' }
    case 'ready_for_filing':
      return { bg: '#DCFCE7', text: '#15803D', icon: CheckCircle2, label: 'Ready for Filing' }
    case 'submitted':
      return { bg: '#EFF6FF', text: '#1D4ED8', icon: CheckCircle2, label: 'Submitted' }
    case 'under_review':
      return { bg: '#F3E8FF', text: '#7C3AED', icon: Clock, label: 'Under Review' }
    case 'approved':
      return { bg: '#EAF5F0', text: '#2D7A5F', icon: CheckCircle2, label: 'Approved' }
    case 'rejected':
      return { bg: '#FDECEB', text: '#DC2626', icon: AlertCircle, label: 'Rejected' }
  }
}

export function FilingStatusDashboard({
  filings = DEFAULT_FILINGS,
  onExportPDF = () => {},
  onStatusUpdate = () => {},
}: FilingStatusDashboardProps) {
  const [expandedFiling, setExpandedFiling] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<FilingRecord['status'] | 'all'>('all')

  const filteredFilings = useMemo(() => {
    if (statusFilter === 'all') return filings
    return filings.filter((f) => f.status === statusFilter)
  }, [filings, statusFilter])

  const stats = useMemo(() => {
    return {
      total: filings.length,
      approved: filings.filter((f) => f.status === 'approved').length,
      pending: filings.filter((f) =>
        ['in_progress', 'ready_for_filing', 'submitted', 'under_review'].includes(f.status)
      ).length,
      rejected: filings.filter((f) => f.status === 'rejected').length,
    }
  }, [filings])

  const statuses: Array<{ id: FilingRecord['status'] | 'all'; label: string }> = [
    { id: 'all', label: 'All Filings' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'ready_for_filing', label: 'Ready' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="h3" style={{ color: '#1A1A1A', marginBottom: '0.25rem' }}>
            Filing Status Tracker
          </h3>
          <p className="body-sm" style={{ color: '#717171' }}>
            Monitor all filings across jurisdictions
          </p>
        </div>
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
          style={{
            background: '#E8312A',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          className="rounded-lg p-4 border"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E4E0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <p className="body-sm" style={{ color: '#717171', marginBottom: '0.5rem' }}>
            Total Filings
          </p>
          <p className="h4" style={{ color: '#1A1A1A' }}>
            {stats.total}
          </p>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E4E0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <p className="body-sm" style={{ color: '#717171', marginBottom: '0.5rem' }}>
            Approved
          </p>
          <p className="h4" style={{ color: '#2D7A5F' }}>
            {stats.approved}
          </p>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E4E0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <p className="body-sm" style={{ color: '#717171', marginBottom: '0.5rem' }}>
            Pending
          </p>
          <p className="h4" style={{ color: '#F59E0B' }}>
            {stats.pending}
          </p>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E4E0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <p className="body-sm" style={{ color: '#717171', marginBottom: '0.5rem' }}>
            Rejected
          </p>
          <p className="h4" style={{ color: '#DC2626' }}>
            {stats.rejected}
          </p>
        </div>
      </motion.div>

      {/* Status Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => setStatusFilter(status.id as FilingRecord['status'] | 'all')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
            style={{
              background: statusFilter === status.id ? '#E8312A' : '#FFFFFF',
              color: statusFilter === status.id ? '#FFFFFF' : '#717171',
              border: '1px solid ' + (statusFilter === status.id ? '#E8312A' : '#E5E4E0'),
              cursor: 'pointer',
            }}
          >
            <Filter className="w-3 h-3" />
            {status.label}
          </button>
        ))}
      </motion.div>

      {/* Filings List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredFilings.map((filing, idx) => {
            const statusInfo = getStatusColor(filing.status)
            const StatusIcon = statusInfo.icon
            const isExpanded = expandedFiling === filing.id

            return (
              <motion.div
                key={filing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-lg border overflow-hidden transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <button
                  onClick={() =>
                    setExpandedFiling(isExpanded ? null : filing.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  style={{
                    background: isExpanded ? '#F9F8F6' : 'transparent',
                  }}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="h4" style={{ color: '#1A1A1A' }}>
                        {filing.company}
                      </h4>
                      <span
                        className="label-sm"
                        style={{
                          background: statusInfo.bg,
                          color: statusInfo.text,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-4 text-sm"
                      style={{ color: '#717171' }}
                    >
                      <div className="flex items-center gap-1">
                        <span style={{ fontWeight: 500 }}>
                          {filing.exchange}
                        </span>
                        <span>({filing.country})</span>
                      </div>
                      <span>•</span>
                      <span>{filing.filingType}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {filing.completionPercentage}%
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className="w-5 h-5 transition-transform flex-shrink-0"
                    style={{
                      color: '#717171',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Expanded Timeline */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t"
                      style={{ borderColor: '#E5E4E0' }}
                    >
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="label-sm" style={{ color: '#717171', marginBottom: '1rem' }}>
                            FILING TIMELINE
                          </p>
                          <div className="space-y-3">
                            {filing.timeline.map((event, eventIdx) => {
                              const isCompleted = event.status === 'completed'
                              const isInProgress = event.status === 'in_progress'

                              return (
                                <div
                                  key={eventIdx}
                                  className="flex gap-3"
                                >
                                  <div className="relative pt-1">
                                    <div
                                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{
                                        background: isCompleted
                                          ? '#2D7A5F'
                                          : isInProgress
                                            ? '#F59E0B'
                                            : '#E5E4E0',
                                        border: '2px solid ' +
                                          (isCompleted ? '#2D7A5F' : isInProgress ? '#F59E0B' : '#E5E4E0'),
                                      }}
                                    >
                                      {isCompleted && (
                                        <CheckCircle2
                                          className="w-3 h-3"
                                          style={{ color: '#FFFFFF' }}
                                        />
                                      )}
                                    </div>

                                    {eventIdx < filing.timeline.length - 1 && (
                                      <div
                                        className="absolute left-2 top-6 w-0.5 h-8"
                                        style={{
                                          background: isCompleted ? '#2D7A5F' : '#E5E4E0',
                                        }}
                                      />
                                    )}
                                  </div>

                                  <div className="flex-1 pt-0.5">
                                    <p
                                      style={{
                                        color: '#1A1A1A',
                                        fontWeight: 500,
                                        marginBottom: '0.25rem',
                                      }}
                                    >
                                      {event.stage}
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{ color: '#717171' }}
                                    >
                                      {new Date(event.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #E5E4E0', paddingTop: '1rem' }}>
                          <p className="body-sm" style={{ color: '#717171', marginBottom: '0.5rem' }}>
                            Next Action
                          </p>
                          <p style={{ color: '#1A1A1A', fontWeight: 500 }}>
                            {filing.nextAction}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
