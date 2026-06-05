'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Clock, TrendingUp, Users, Download, Zap, Target, AlertCircle,
  BarChart3, ChevronDown, ChevronUp, Activity, Flame, ArrowRight
} from 'lucide-react'

interface InvestorSession {
  investorId: string
  investorName: string
  email: string
  company?: string
  accessGranted: string // ISO timestamp
  firstAccess: string // ISO timestamp
  lastAccess: string // ISO timestamp
  totalSessionTime: number // minutes
  sessionCount: number
  documentsViewed: number
  documentsDownloaded: number
  focusArea: 'financials' | 'team' | 'market' | 'product' | 'legal' | 'mixed'
  intent: 'high' | 'medium' | 'low' | 'exploring'
  documentHeatmap: {
    folder: string
    document: string
    viewCount: number
    timeSpent: number // seconds
    lastViewed: string
    downloadCount: number
  }[]
}

const mockInvestors: InvestorSession[] = [
  {
    investorId: '1',
    investorName: 'Goldman Sachs',
    email: 'investor@goldmansachs.com',
    company: 'Goldman Sachs',
    accessGranted: '2026-05-21T09:00:00Z',
    firstAccess: '2026-05-21T10:15:00Z',
    lastAccess: '2026-06-05T14:30:00Z',
    totalSessionTime: 285, // 4h 45m
    sessionCount: 8,
    documentsViewed: 12,
    documentsDownloaded: 8,
    focusArea: 'financials',
    intent: 'high',
    documentHeatmap: [
      { folder: 'Financial Statements', document: 'Cap Table - Latest.xlsx', viewCount: 12, timeSpent: 3600, lastViewed: '2026-06-05T14:00:00Z', downloadCount: 5 },
      { folder: 'Financial Statements', document: 'FY2025 Audited Financials.pdf', viewCount: 8, timeSpent: 2400, lastViewed: '2026-06-04T11:00:00Z', downloadCount: 3 },
      { folder: 'Business Plan & Model', document: 'Financial Model - 5 Year.xlsx', viewCount: 6, timeSpent: 1800, lastViewed: '2026-06-02T09:30:00Z', downloadCount: 2 },
      { folder: 'Team & Leadership', document: 'CEO Bio.pdf', viewCount: 1, timeSpent: 120, lastViewed: '2026-05-25T16:00:00Z', downloadCount: 0 },
    ]
  },
  {
    investorId: '2',
    investorName: 'Sequoia Capital',
    email: 'partner@sequoia.vc',
    company: 'Sequoia Capital',
    accessGranted: '2026-05-25T14:00:00Z',
    firstAccess: '2026-05-26T09:00:00Z',
    lastAccess: '2026-06-03T18:45:00Z',
    totalSessionTime: 420, // 7h
    sessionCount: 5,
    documentsViewed: 15,
    documentsDownloaded: 10,
    focusArea: 'market',
    intent: 'high',
    documentHeatmap: [
      { folder: 'Market & Competitors', document: 'Market Research Report.pdf', viewCount: 9, timeSpent: 5400, lastViewed: '2026-06-03T15:00:00Z', downloadCount: 4 },
      { folder: 'Business Plan & Model', document: 'Executive Summary.docx', viewCount: 7, timeSpent: 2100, lastViewed: '2026-06-01T14:30:00Z', downloadCount: 3 },
      { folder: 'Market & Competitors', document: 'Competitive Landscape.pdf', viewCount: 8, timeSpent: 4200, lastViewed: '2026-06-02T10:00:00Z', downloadCount: 5 },
      { folder: 'Product & Technology', document: 'Product Roadmap.pdf', viewCount: 4, timeSpent: 1800, lastViewed: '2026-05-30T16:30:00Z', downloadCount: 1 },
      { folder: 'Financial Statements', document: 'Cap Table.xlsx', viewCount: 3, timeSpent: 900, lastViewed: '2026-05-27T11:00:00Z', downloadCount: 1 },
    ]
  },
  {
    investorId: '3',
    investorName: 'Tech Ventures Partners',
    email: 'partner@techventures.vc',
    company: 'Tech Ventures',
    accessGranted: '2026-05-26T10:30:00Z',
    firstAccess: '2026-05-26T11:00:00Z',
    lastAccess: '2026-06-04T09:15:00Z',
    totalSessionTime: 195, // 3h 15m
    sessionCount: 4,
    documentsViewed: 9,
    documentsDownloaded: 6,
    focusArea: 'product',
    intent: 'medium',
    documentHeatmap: [
      { folder: 'Product & Technology', document: 'Product Roadmap.pdf', viewCount: 5, timeSpent: 3600, lastViewed: '2026-06-04T08:30:00Z', downloadCount: 2 },
      { folder: 'Product & Technology', document: 'Customer Case Studies.pdf', viewCount: 4, timeSpent: 2400, lastViewed: '2026-06-01T14:00:00Z', downloadCount: 2 },
      { folder: 'Business Plan & Model', document: 'Executive Summary.docx', viewCount: 3, timeSpent: 1800, lastViewed: '2026-05-29T10:30:00Z', downloadCount: 1 },
      { folder: 'Team & Leadership', document: 'Leadership Bios.pdf', viewCount: 2, timeSpent: 900, lastViewed: '2026-05-27T15:00:00Z', downloadCount: 1 },
    ]
  },
  {
    investorId: '4',
    investorName: 'Severance Capital',
    email: 'advisor@severance.vc',
    company: 'Severance Capital',
    accessGranted: '2026-06-02T13:00:00Z',
    firstAccess: undefined as any,
    lastAccess: undefined as any,
    totalSessionTime: 0,
    sessionCount: 0,
    documentsViewed: 0,
    documentsDownloaded: 0,
    focusArea: 'mixed',
    intent: 'low',
    documentHeatmap: []
  }
]

const getIntentLabel = (intent: string) => {
  switch (intent) {
    case 'high': return { text: 'High Interest', color: '#2D7A5F', bg: '#F0FDF4' }
    case 'medium': return { text: 'Active Review', color: '#B45309', bg: '#FEF3C7' }
    case 'low': return { text: 'Early Stage', color: '#717171', bg: '#F7F6F4' }
    case 'exploring': return { text: 'Exploring', color: '#1D4ED8', bg: '#EFF6FF' }
    default: return { text: 'Unknown', color: '#717171', bg: '#F7F6F4' }
  }
}

export default function DataRoomAnalyticsPage() {
  const [expandedInvestor, setExpandedInvestor] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'time' | 'intent' | 'recent'>('time')

  const sortedInvestors = [...mockInvestors].sort((a, b) => {
    if (sortBy === 'time') return b.totalSessionTime - a.totalSessionTime
    if (sortBy === 'recent') return new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime()
    const intentOrder = { high: 0, medium: 1, low: 2, exploring: 3 }
    return intentOrder[a.intent as keyof typeof intentOrder] - intentOrder[b.intent as keyof typeof intentOrder]
  })

  const totalMinutesSpent = mockInvestors.reduce((sum, inv) => sum + inv.totalSessionTime, 0)
  const activeInvestors = mockInvestors.filter(inv => inv.intent === 'high' || inv.intent === 'medium').length
  const avgTimePerInvestor = Math.round(totalMinutesSpent / mockInvestors.filter(inv => inv.totalSessionTime > 0).length)

  const getTopFolders = () => {
    const folderTime: Record<string, number> = {}
    mockInvestors.forEach(inv => {
      inv.documentHeatmap.forEach(doc => {
        folderTime[doc.folder] = (folderTime[doc.folder] || 0) + doc.timeSpent
      })
    })
    return Object.entries(folderTime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="serif text-4xl font-bold text-nav mb-2">Data Room Analytics</h1>
        <p className="text-text-muted">Track investor engagement, intent signals, and document focus areas</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <div className="p-4 rounded-xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <p className="label-sm text-text-muted mb-2">Active Investors</p>
          <p className="h3 text-green-700">{activeInvestors}</p>
          <p className="caption-sm text-green-600 mt-1">High + Medium interest</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <p className="label-sm text-text-muted mb-2">Total Time Spent</p>
          <p className="h3 text-blue-600">{Math.floor(totalMinutesSpent / 60)}h {totalMinutesSpent % 60}m</p>
          <p className="caption-sm text-blue-600 mt-1">Across all investors</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#FDECEB', borderColor: '#FECACA' }}>
          <p className="label-sm text-text-muted mb-2">Avg Per Investor</p>
          <p className="h3 text-red-600">{Math.floor(avgTimePerInvestor / 60)}h {avgTimePerInvestor % 60}m</p>
          <p className="caption-sm text-red-600 mt-1">Active investors only</p>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: '#F5F3FF', borderColor: '#E9D5FF' }}>
          <p className="label-sm text-text-muted mb-2">Most Focused On</p>
          <p className="h3 text-purple-600">{getTopFolders()[0]?.[0] || 'N/A'}</p>
          <p className="caption-sm text-purple-600 mt-1">By total time</p>
        </div>
      </motion.div>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-6">
        {(['time', 'intent', 'recent'] as const).map(option => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              sortBy === option
                ? 'bg-red-50 border-red-300 text-red-600 border'
                : 'bg-gray-50 border-gray-200 text-gray-600 border'
            }`}
          >
            {option === 'time' && 'Sort by Time'}
            {option === 'intent' && 'Sort by Intent'}
            {option === 'recent' && 'Sort by Recent'}
          </button>
        ))}
      </div>

      {/* Investor List */}
      <div className="space-y-3">
        {sortedInvestors.map((investor, idx) => {
          const intentLabel = getIntentLabel(investor.intent)
          const isExpanded = expandedInvestor === investor.investorId
          const timeHours = Math.floor(investor.totalSessionTime / 60)
          const timeMinutes = investor.totalSessionTime % 60

          return (
            <motion.div
              key={investor.investorId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => setExpandedInvestor(isExpanded ? null : investor.investorId)}
                className="w-full p-4 rounded-xl border text-left transition-all hover:shadow-md"
                style={{
                  background: isExpanded ? intentLabel.bg : 'white',
                  borderColor: isExpanded ? intentLabel.color + '40' : '#E5E4E0'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-nav">{investor.investorName}</h3>
                      <span
                        className="label-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: intentLabel.bg, color: intentLabel.color }}
                      >
                        {intentLabel.text}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{investor.email}</p>
                  </div>
                  <div className="text-right">
                    {investor.totalSessionTime > 0 ? (
                      <>
                        <p className="font-bold text-nav">{timeHours}h {timeMinutes}m</p>
                        <p className="caption-sm text-text-muted">{investor.sessionCount} sessions</p>
                      </>
                    ) : (
                      <p className="text-sm text-text-light italic">Not yet accessed</p>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  {investor.documentsViewed > 0 && (
                    <>
                      <span>📄 {investor.documentsViewed} docs viewed</span>
                      <span>📥 {investor.documentsDownloaded} downloads</span>
                      <span>🎯 Focus: <strong>{investor.focusArea}</strong></span>
                    </>
                  )}
                </div>

                {isExpanded && <ChevronUp className="absolute right-4 top-4 text-text-muted" />}
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 p-4 rounded-xl border"
                    style={{ background: '#F7F6F4', borderColor: '#E5E4E0' }}
                  >
                    {/* Session Timeline */}
                    <div className="mb-4">
                      <p className="font-bold text-nav mb-2">Access Timeline</p>
                      <div className="space-y-1 text-sm text-text-muted">
                        <p>
                          ✓ <strong>NDA Signed:</strong> {new Date(investor.accessGranted).toLocaleDateString()}
                        </p>
                        <p>
                          👁️ <strong>First Access:</strong> {investor.firstAccess ? new Date(investor.firstAccess).toLocaleString() : 'Not yet'}
                        </p>
                        <p>
                          📍 <strong>Last Access:</strong> {investor.lastAccess ? new Date(investor.lastAccess).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Document Heatmap */}
                    {investor.documentHeatmap.length > 0 && (
                      <div>
                        <p className="font-bold text-nav mb-3">Document Focus (Time Spent)</p>
                        <div className="space-y-2">
                          {investor.documentHeatmap
                            .sort((a, b) => b.timeSpent - a.timeSpent)
                            .map((doc, i) => {
                              const minSpent = Math.floor(doc.timeSpent / 60)
                              const secSpent = doc.timeSpent % 60
                              const maxTime = Math.max(...investor.documentHeatmap.map(d => d.timeSpent))
                              const heatPercentage = (doc.timeSpent / maxTime) * 100

                              return (
                                <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                  <div className="flex items-center justify-between mb-1">
                                    <div>
                                      <p className="text-sm font-semibold text-nav">{doc.document}</p>
                                      <p className="text-xs text-text-muted">{doc.folder}</p>
                                    </div>
                                    <div className="text-right text-xs">
                                      <p className="font-bold">{minSpent}m {secSpent}s</p>
                                      <p className="text-text-muted">{doc.viewCount} views • {doc.downloadCount} downloads</p>
                                    </div>
                                  </div>

                                  {/* Heat Bar */}
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${heatPercentage}%`,
                                        background: heatPercentage > 66 ? '#2D7A5F' : heatPercentage > 33 ? '#B45309' : '#1D4ED8'
                                      }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    {/* Intent Insights */}
                    <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(232, 49, 42, 0.1)', borderLeft: '3px solid #E8312A' }}>
                      <p className="text-sm font-semibold text-nav mb-1">💡 Intent Signal</p>
                      <p className="text-xs text-text-muted">
                        {investor.intent === 'high' && `Serious interest. Spent ${timeHours}h on due diligence, focused on ${investor.focusArea}. Multiple downloads suggest evaluation phase.`}
                        {investor.intent === 'medium' && `Active review. Time spent suggests genuine interest but not yet deep due diligence.`}
                        {investor.intent === 'low' && `Early exploration. Limited access suggests information-gathering stage.`}
                        {investor.intent === 'exploring' && `Not yet accessed. Follow up with next batch of documents.`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Intelligence Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 rounded-xl border-2"
        style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
      >
        <div className="flex gap-3">
          <Zap className="w-6 h-6 text-green-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-900 mb-2">📊 Investor Intelligence Dashboard</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ <strong>Goldman Sachs:</strong> Deep-diving cap table (12 views, 60 min). Valuation-focused. HIGH intent.</li>
              <li>✓ <strong>Sequoia Capital:</strong> Market deep-dive (market + competitive analysis = 9.5h total). TAM validation. HIGH intent.</li>
              <li>✓ <strong>Tech Ventures:</strong> Product-focused evaluation (product roadmap + case studies). MEDIUM intent.</li>
              <li>⚠️ <strong>Severance Capital:</strong> Pending first access. Follow up with access link reminder.</li>
            </ul>
            <p className="text-xs text-green-700 mt-3 font-semibold">
              Recommendation: Goldman focusing on cap table = prep for term sheet. Sequoia's market focus = TAM validation critical. Prepare market defensibility slides for next call.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
