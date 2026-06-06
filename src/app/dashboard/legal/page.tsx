'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle,
  BarChart3, TrendingUp, FileText, Users, AlertCircle, Calendar,
  ArrowRight, Info, ChevronRight, AlertOctagon, Target
} from 'lucide-react'
import Link from 'next/link'

/**
 * GC Legal Intelligence Dashboard
 *
 * Command center for General Counsel managing legal/regulatory/advisor coordination
 * for IPO readiness. Provides unified visibility into:
 * 1. Document readiness with critical path tracking
 * 2. Regulatory compliance monitoring
 * 3. Advisor coordination and meeting scheduling
 * 4. Timeline analysis with ripple effect warnings
 */

// Type definitions
interface LegalDocument {
  id: string
  name: string
  status: 'not-started' | 'in-progress' | 'in-review' | 'approved' | 'overdue'
  completionPercentage: number
  dueDate: string
  blockerReason?: string
  criticialPath: boolean
  owner: string
  daysOverdue?: number
}

interface RegulatoryRule {
  id: string
  title: string
  jurisdiction: 'SEC' | 'State' | 'FINRA' | 'Exchange'
  status: 'compliant' | 'non-applicable' | 'at-risk'
  description: string
  isNew: boolean
}

interface AdvisorEngagement {
  id: string
  name: string
  type: 'counsel' | 'underwriter' | 'auditor' | 'investor-relations'
  status: 'on-schedule' | 'at-risk' | 'blocked'
  nextMeeting?: string
  findings?: string[]
  completionPercentage: number
}

interface CriticalPathItem {
  id: string
  name: string
  status: 'not-started' | 'in-progress' | 'complete'
  dueDate: string
  blocksLegalClosing: boolean
  cascadingDelayDays?: number
}

// Sample data (replace with API calls)
const SAMPLE_DOCUMENTS: LegalDocument[] = [
  {
    id: 'articles',
    name: 'Articles of Incorporation',
    status: 'overdue',
    completionPercentage: 75,
    dueDate: '2026-05-20',
    blockerReason: 'Counsel review',
    criticialPath: true,
    owner: 'Outside Counsel',
    daysOverdue: 18
  },
  {
    id: 'bylaws',
    name: 'By-laws',
    status: 'approved',
    completionPercentage: 100,
    dueDate: '2026-05-15',
    criticialPath: false,
    owner: 'Legal'
  },
  {
    id: 'stock-plans',
    name: 'Stock Plans',
    status: 'in-review',
    completionPercentage: 95,
    dueDate: '2026-06-15',
    blockerReason: 'Board approval',
    criticialPath: true,
    owner: 'CEO'
  },
  {
    id: 'cap-table',
    name: 'Cap Table Cleanup',
    status: 'approved',
    completionPercentage: 100,
    dueDate: '2026-05-10',
    criticialPath: false,
    owner: 'CFO'
  }
]

const SAMPLE_REGULATIONS: RegulatoryRule[] = [
  {
    id: 'sec-1',
    title: 'SEC Rule: New disclosure requirements for cybersecurity',
    jurisdiction: 'SEC',
    status: 'non-applicable',
    description: 'Does not affect current IPO process',
    isNew: true
  },
  {
    id: 'sec-2',
    title: 'SEC Rule: Updated beneficial ownership thresholds',
    jurisdiction: 'SEC',
    status: 'compliant',
    description: 'We exceed current compliance',
    isNew: true
  },
  {
    id: 'state-1',
    title: 'CA State: Shareholder notification requirements',
    jurisdiction: 'State',
    status: 'compliant',
    description: 'Tracking CA regulations',
    isNew: false
  },
  {
    id: 'finra-1',
    title: 'FINRA: Conflict-checking procedures',
    jurisdiction: 'FINRA',
    status: 'compliant',
    description: 'Broker recommendations validated',
    isNew: false
  }
]

const SAMPLE_ADVISORS: AdvisorEngagement[] = [
  {
    id: 'counsel',
    name: 'Outside Counsel (Sullivan & Cromwell)',
    type: 'counsel',
    status: 'at-risk',
    nextMeeting: '2026-06-12T14:00:00',
    completionPercentage: 80,
  },
  {
    id: 'uw1',
    name: 'Morgan Stanley (Underwriter)',
    type: 'underwriter',
    status: 'on-schedule',
    nextMeeting: '2026-06-10T10:00:00',
    completionPercentage: 60,
  },
  {
    id: 'uw2',
    name: 'Goldman Sachs (Co-underwriter)',
    type: 'underwriter',
    status: 'on-schedule',
    nextMeeting: '2026-06-11T14:00:00',
    completionPercentage: 55,
  },
  {
    id: 'auditor',
    name: 'Deloitte (Auditor)',
    type: 'auditor',
    status: 'at-risk',
    completionPercentage: 75,
    findings: ['Inventory valuation', 'Revenue recognition']
  }
]

const SAMPLE_CRITICAL_PATH: CriticalPathItem[] = [
  {
    id: 'cp-1',
    name: 'Articles of Incorporation',
    status: 'in-progress',
    dueDate: '2026-06-20',
    blocksLegalClosing: true,
    cascadingDelayDays: 15
  },
  {
    id: 'cp-2',
    name: 'Board Resolutions Approved',
    status: 'complete',
    dueDate: '2026-05-30',
    blocksLegalClosing: false
  },
  {
    id: 'cp-3',
    name: 'Stock Plans Final Approval',
    status: 'in-progress',
    dueDate: '2026-06-15',
    blocksLegalClosing: true
  }
]

// Status color helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'overdue':
    case 'blocked':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100' }
    case 'at-risk':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100' }
    case 'approved':
    case 'complete':
    case 'on-schedule':
    case 'compliant':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100' }
    case 'in-progress':
    case 'in-review':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100' }
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'overdue':
      return <AlertOctagon className="w-4 h-4" />
    case 'at-risk':
      return <AlertTriangle className="w-4 h-4" />
    case 'approved':
    case 'complete':
    case 'on-schedule':
    case 'compliant':
      return <CheckCircle2 className="w-4 h-4" />
    case 'in-progress':
    case 'in-review':
      return <Clock className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'overdue':
      return 'OVERDUE'
    case 'at-risk':
      return 'AT-RISK'
    case 'approved':
      return 'COMPLETE'
    case 'in-progress':
    case 'in-review':
      return 'IN PROGRESS'
    case 'complete':
      return 'COMPLETE'
    case 'on-schedule':
      return 'ON SCHEDULE'
    case 'compliant':
      return 'COMPLIANT'
    default:
      return status.toUpperCase()
  }
}

// Document Card Component
const DocumentCard = ({ doc }: { doc: LegalDocument }) => {
  const colors = getStatusColor(doc.status)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${colors.bg} ${colors.border} border-l-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm">{doc.name}</p>
          <p className="text-xs text-gray-600 mt-1">Owner: {doc.owner}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${colors.badge} font-semibold text-xs`}>
          {getStatusIcon(doc.status)}
          {getStatusLabel(doc.status)}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Completion</span>
          <span className={`text-xs font-semibold ${colors.text}`}>{doc.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${doc.status === 'approved' ? 'bg-emerald-500' : doc.status === 'overdue' ? 'bg-red-500' : doc.status === 'in-review' ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${doc.completionPercentage}%` }}
          />
        </div>
      </div>

      {doc.blockerReason && (
        <div className="mb-2 p-2 bg-red-100 rounded text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Blocker: {doc.blockerReason}</span>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>Due: {new Date(doc.dueDate).toLocaleDateString()}</span>
        {doc.daysOverdue && doc.daysOverdue > 0 && (
          <span className="text-red-600 font-semibold">{doc.daysOverdue} days overdue</span>
        )}
      </div>

      {doc.criticialPath && (
        <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-orange-600 font-semibold flex items-center gap-1">
          <Target className="w-3 h-3" />
          Critical path item
        </div>
      )}
    </motion.div>
  )
}

// Advisor Card Component
const AdvisorCard = ({ advisor }: { advisor: AdvisorEngagement }) => {
  const colors = getStatusColor(advisor.status)
  const nextMeetingDate = advisor.nextMeeting ? new Date(advisor.nextMeeting) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${colors.bg} ${colors.border} border-l-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm">{advisor.name}</p>
          <p className="text-xs text-gray-600 mt-1 capitalize">{advisor.type}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${colors.badge} font-semibold text-xs`}>
          {getStatusIcon(advisor.status)}
          {getStatusLabel(advisor.status)}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Engagement Progress</span>
          <span className={`text-xs font-semibold ${colors.text}`}>{advisor.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${advisor.status === 'on-schedule' ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${advisor.completionPercentage}%` }}
          />
        </div>
      </div>

      {nextMeetingDate && (
        <div className="mb-2 p-2 bg-blue-100 rounded text-xs text-blue-700 flex items-start gap-2">
          <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Next: {nextMeetingDate.toLocaleDateString()} at {nextMeetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      {advisor.findings && advisor.findings.length > 0 && (
        <div className="p-2 bg-amber-100 rounded text-xs text-amber-700 mb-2">
          <p className="font-semibold mb-1">Findings:</p>
          {advisor.findings.map((finding, idx) => (
            <p key={idx} className="ml-2">• {finding}</p>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Critical Path Item Component
const CriticalPathItemComponent = ({ item }: { item: CriticalPathItem }) => {
  const colors = getStatusColor(item.status)
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border ${colors.bg} ${colors.border} border-l-4`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm">{item.name}</h4>
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${colors.badge} font-semibold text-xs`}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-2">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
      {item.blocksLegalClosing && (
        <div className="text-xs text-red-600 font-semibold flex items-center gap-1 mb-2">
          <AlertTriangle className="w-3 h-3" />
          Blocks legal closing
        </div>
      )}
      {item.cascadingDelayDays && item.cascadingDelayDays > 0 && (
        <div className="p-2 bg-red-100 rounded text-xs text-red-700">
          If delayed: Legal closing shifts {item.cascadingDelayDays} days forward
        </div>
      )}
    </motion.div>
  )
}

export default function GCLegalDashboard() {
  const [docs, setDocs] = useState<LegalDocument[]>(SAMPLE_DOCUMENTS)
  const [advisors, setAdvisors] = useState<AdvisorEngagement[]>(SAMPLE_ADVISORS)
  const [regulations, setRegulations] = useState<RegulatoryRule[]>(SAMPLE_REGULATIONS)
  const [criticalPath, setCriticalPath] = useState<CriticalPathItem[]>(SAMPLE_CRITICAL_PATH)

  // Calculate metrics
  const docsCompleted = docs.filter(d => d.status === 'approved').length
  const docsOverdue = docs.filter(d => d.status === 'overdue').length
  const regulatoryCompliant = regulations.filter(r => r.status === 'compliant').length
  const advisorsOnSchedule = advisors.filter(a => a.status === 'on-schedule').length
  const criticalPathOnTrack = criticalPath.filter(cp => cp.status === 'complete' || cp.status === 'in-progress').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Legal Intelligence Dashboard</h1>
        <p className="text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Command center for IPO legal readiness and regulatory compliance
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
        >
          <p className="text-xs text-gray-600 mb-1">Documents Complete</p>
          <p className="text-2xl font-bold text-emerald-600">{docsCompleted}/{docs.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-red-200 shadow-sm"
        >
          <p className="text-xs text-gray-600 mb-1">Overdue Items</p>
          <p className="text-2xl font-bold text-red-600">{docsOverdue}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm"
        >
          <p className="text-xs text-gray-600 mb-1">Regulations Tracked</p>
          <p className="text-2xl font-bold text-emerald-600">{regulatoryCompliant}/{regulations.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm"
        >
          <p className="text-xs text-gray-600 mb-1">Advisors On-Track</p>
          <p className="text-2xl font-bold text-emerald-600">{advisorsOnSchedule}/{advisors.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm"
        >
          <p className="text-xs text-gray-600 mb-1">Legal Closing</p>
          <p className="text-lg font-bold text-slate-900">July 15</p>
        </motion.div>
      </div>

      {/* Main 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Document Readiness Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Document Readiness</h2>
          </div>
          <div className="space-y-3">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t border-gray-200 flex gap-2"
          >
            <button className="flex-1 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
              View All Docs <ChevronRight className="w-4 h-4" />
            </button>
            <button className="flex-1 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
              Upload <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Regulatory Compliance Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold">Regulatory Compliance</h2>
          </div>
          <div className="space-y-3">
            {regulations.map((rule) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${getStatusColor(rule.status).bg} ${getStatusColor(rule.status).border} border-l-4`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                    {rule.isNew && <span className="text-xs font-bold text-red-600 mt-1 inline-block">NEW THIS WEEK</span>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(rule.status).badge}`}>
                    {getStatusLabel(rule.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{rule.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t border-gray-200 flex gap-2"
          >
            <button className="flex-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
              SEC Updates <ChevronRight className="w-4 h-4" />
            </button>
            <button className="flex-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
              History <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Advisor Coordination Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Advisor Coordination</h2>
          </div>
          <div className="space-y-3">
            {advisors.map((advisor) => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t border-gray-200 flex gap-2"
          >
            <button className="flex-1 text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1">
              Schedule <ChevronRight className="w-4 h-4" />
            </button>
            <button className="flex-1 text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1">
              Calendar <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Critical Path Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold">Critical Path & Timeline</h2>
          </div>

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 mb-1">Legal Closing: July 15, 2026</p>
            <div className="text-xs text-amber-700 space-y-1">
              <p>If Articles delayed past June 20:</p>
              <ul className="ml-4 space-y-0.5">
                <li>• Legal closing → July 30 (+15 days)</li>
                <li>• Prospectus filing → July 8 (+10 days)</li>
                <li>• IPO launch → Aug 5 (+21 days)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            {criticalPath.map((item) => (
              <CriticalPathItemComponent key={item.id} item={item} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t border-gray-200 flex gap-2"
          >
            <button className="flex-1 text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1">
              View Timeline <ChevronRight className="w-4 h-4" />
            </button>
            <button className="flex-1 text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1">
              Risk Analysis <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Ripple Effect Warning (if Articles still overdue) */}
      {docsOverdue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-4 items-start"
        >
          <AlertOctagon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Critical: Articles of Incorporation Overdue</h3>
            <p className="text-sm text-red-700 mb-2">
              Your Articles have been overdue for 18 days. This document is on the critical path and blocking legal closing.
            </p>
            <div className="text-sm text-red-700 mb-2">
              <strong>Recommended action:</strong> Schedule immediate call with outside counsel (Sullivan & Cromwell) to finalize.
            </div>
            <button className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">
              Schedule Meeting Now
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
