'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ChevronRight, Star, TrendingUp, AlertCircle, CheckCircle2,
  Eye, Download, Share2, MessageCircle, BookmarkPlus, X, MapPin,
  Brain, Zap, Lock, Clock, BarChart3, Users, Target, Shield
} from 'lucide-react'

interface DocumentMetadata {
  id: string
  title: string
  folder: string
  type: string // 'financial' | 'team' | 'market' | 'product' | 'legal'
  uploadedDate: string
  lastUpdated: string
  version: number
  fileSize: string
}

interface AISummary {
  executive: string // 2-3 sentence overview
  keyPoints: string[] // 5-7 bullet points
  redFlags: string[] // potential concerns
  opportunities: string[] // strategic insights
  metrics: {
    label: string
    value: string
  }[]
}

interface ConfidenceMetrics {
  completeness: number // 0-100: is doc complete?
  currency: number // 0-100: is info current?
  reliability: number // 0-100: verified/audited?
  materiality: number // 0-100: how important?
  overallScore: number // 0-100: combined
}

interface Document {
  metadata: DocumentMetadata
  summary: AISummary
  confidence: ConfidenceMetrics
  relatedDocs: string[] // document IDs
  investorRelevance: 'critical' | 'important' | 'reference'
}

// WORLD-CLASS DOCUMENT MAP - This is the IP
const documents: Document[] = [
  {
    metadata: {
      id: 'fin-cap-table',
      title: 'Cap Table (Latest - June 2026)',
      folder: 'Financial Statements',
      type: 'financial',
      uploadedDate: '2026-06-02',
      lastUpdated: '2026-06-05',
      version: 5,
      fileSize: '1.8 MB'
    },
    summary: {
      executive: 'Current ownership structure showing 10.2M shares outstanding across founders, investors, and option pool. Fully diluted shares at 12.5M including all warrants and options.',
      keyPoints: [
        'Founder A: 4.2M shares (41% pre-dilute, 34% fully diluted)',
        'Founder B: 3.1M shares (30% pre-dilute, 25% fully diluted)',
        'Series Seed investors: 2.1M shares (21% pre-dilute, 17% fully diluted)',
        'Employee option pool: 0.8M shares (8% of outstanding)',
        'Reserved for future hiring: 0.3M shares (3% of pool)',
        'Fully diluted: 25% dilution from options/warrants',
        'No anti-dilution clauses beyond standard weighted-average'
      ],
      redFlags: [
        'Option pool at 8% is tight for growth (target 10-15%)',
        'Series Seed investor had pro-rata in Series A (standard)',
        'Two large shareholders (41% + 30%) could affect governance'
      ],
      opportunities: [
        'Clean cap table with no zombie shares',
        'Reasonable fully-diluted founder ownership for Series A',
        'Option pool can be increased through equity refresh'
      ],
      metrics: [
        { label: 'Outstanding Shares', value: '10.2M' },
        { label: 'Fully Diluted', value: '12.5M' },
        { label: 'Founder Ownership (FD)', value: '59%' },
        { label: 'Investor Ownership (FD)', value: '17%' },
        { label: 'Option Pool', value: '8%' }
      ]
    },
    confidence: {
      completeness: 95,
      currency: 98,
      reliability: 100,
      materiality: 100,
      overallScore: 98
    },
    relatedDocs: ['fin-model', 'legal-articles'],
    investorRelevance: 'critical'
  },
  {
    metadata: {
      id: 'fin-statements',
      title: 'FY2025 Audited Financial Statements',
      folder: 'Financial Statements',
      type: 'financial',
      uploadedDate: '2026-05-15',
      lastUpdated: '2026-05-25',
      version: 2,
      fileSize: '2.4 MB'
    },
    summary: {
      executive: 'FY2025 results show 42% YoY revenue growth to $12.4M with improving unit economics. Gross margin expanded 8 points to 76% due to operational leverage. Company achieved EBITDA positive in Q4.',
      keyPoints: [
        'Revenue: $12.4M (+42% YoY vs $8.7M in FY2024)',
        'Gross Margin: 76% (+8 points YoY, improved scale)',
        'Operating Expenses: $8.2M (+18% YoY, revenue outpacing opex)',
        'EBITDA: +$340K in Q4 (first positive quarter)',
        'Cash Position: $4.2M (8.4 months runway at current burn)',
        'Customer Concentration: Top 3 customers = 32% of revenue',
        'Audit by Big 4 firm (clean opinion, no going concern)'
      ],
      redFlags: [
        'Top 3 customer concentration at 32% (single loss = material risk)',
        'Cash runway 8 months (need to raise Series A within 6 months)',
        'OpEx growth still 18% (need to slow to sustainable <10%)',
        'One major customer had churn risk discussion in audit (resolved Q1)'
      ],
      opportunities: [
        'Already EBITDA positive = clear path to profitability',
        'Margin expansion demonstrates pricing power',
        'Growth rate (42%) attracts institutional investors',
        'Low customer acquisition cost (CAC = $8K, LTV = $240K)'
      ],
      metrics: [
        { label: 'Revenue Growth', value: '+42% YoY' },
        { label: 'Gross Margin', value: '76%' },
        { label: 'EBITDA (Q4)', value: '+$340K' },
        { label: 'Cash Runway', value: '8.4 months' },
        { label: 'LTV:CAC Ratio', value: '30:1' }
      ]
    },
    confidence: {
      completeness: 100,
      currency: 95,
      reliability: 100,
      materiality: 100,
      overallScore: 99
    },
    relatedDocs: ['fin-model', 'fin-cap-table'],
    investorRelevance: 'critical'
  },
  {
    metadata: {
      id: 'team-ceo',
      title: 'CEO Biography & Track Record',
      folder: 'Team & Leadership',
      type: 'team',
      uploadedDate: '2026-05-30',
      lastUpdated: '2026-06-01',
      version: 3,
      fileSize: '0.6 MB'
    },
    summary: {
      executive: 'CEO Jane Smith brings 15 years SaaS experience with 2 successful exits and deep expertise in enterprise B2B software. Former VP Product at Zendesk during IPO (2014) and scaling from Series A to $1B+ ARR.',
      keyPoints: [
        'Previous: VP Product @ Zendesk, scaled from Series A → IPO ($1B+ peak valuation)',
        'Exit 1: Sold RealTime Logic to Zendesk (2013) for $30M+ (acquired for product team)',
        'Exit 2: Co-founded & sold early SaaS analytics (2008) to Omniture pre-acquisition',
        'Education: BS Computer Science (Stanford), MBA (Harvard)',
        'Board experience: Series A director at 3 other SaaS companies',
        'Industry recognition: Forbes 30 Under 40, Innovator of the Year (2019)',
        'Known for: Product-market fit execution, go-to-market strategy, team building'
      ],
      redFlags: [],
      opportunities: [
        'IPO experience (was at Zendesk during 2014 IPO process)',
        'Track record of scaling teams (Zendesk grew from 50 → 500 employees)',
        'Enterprise sales expertise (Zendesk → Fortune 500 customers)',
        'Investor network likely strong (multiple exits, board experience)'
      ],
      metrics: [
        { label: 'SaaS Experience', value: '15 years' },
        { label: 'Exits', value: '2 successful' },
        { label: 'Largest Company Scaled', value: '$1B+ (Zendesk)' },
        { label: 'IPO Experience', value: 'Zendesk 2014' },
        { label: 'Investors Referrals', value: 'Likely extensive' }
      ]
    },
    confidence: {
      completeness: 100,
      currency: 100,
      reliability: 100,
      materiality: 95,
      overallScore: 99
    },
    relatedDocs: ['team-leadership', 'team-board'],
    investorRelevance: 'critical'
  },
  {
    metadata: {
      id: 'market-research',
      title: 'Third-Party Market Research (Gartner)',
      folder: 'Market & Competitors',
      type: 'market',
      uploadedDate: '2026-05-10',
      lastUpdated: '2026-05-20',
      version: 1,
      fileSize: '5.2 MB'
    },
    summary: {
      executive: 'Gartner Magic Quadrant positions the market at $24B TAM growing 18% CAGR through 2030. Consolidation expected as leaders emerge in AI-powered category.',
      keyPoints: [
        'Market Size: $24B TAM (2025), projected $38B by 2030 (18% CAGR)',
        'Key Growth Drivers: AI adoption (+$8B), remote work +$4B, vertical specialization +$6B',
        'Competitive Landscape: 150+ vendors, but top 5 control 45% of market',
        'Gartner Magic Quadrant Leaders: Established vendors (3), emerging AI leaders (2)',
        'Technology Shift: AI/ML now required for differentiation (was nice-to-have 2 years ago)',
        'Buyer Behavior: Enterprise customers evaluating 5-7 vendors (avg eval = 4 months)',
        'Pricing Trend: Moving from per-user → outcome-based, enterprise deals $50K-$500K ACV',
        'Consolidation: Expected 3-5 strategic acquisitions annually through 2028'
      ],
      redFlags: [
        'Top 5 vendors control 45% of market (high concentration)',
        'Gartner notes "incumbent advantage" in enterprise contracts',
        'New entrants require $50M+ capital for competitive go-to-market'
      ],
      opportunities: [
        'AI-powered positioning can capture emerging category premium',
        'Vertical specialization underserved (play to your niche)',
        '18% CAGR = market growing 2x GDP rate',
        'Consolidation = exit opportunity for strong #2-#5 players at 8-12x revenue'
      ],
      metrics: [
        { label: 'TAM 2025', value: '$24B' },
        { label: 'TAM 2030 (proj)', value: '$38B' },
        { label: 'CAGR', value: '18%' },
        { label: 'Top 5 Market Share', value: '45%' },
        { label: 'Enterprise ACV', value: '$50K-$500K' }
      ]
    },
    confidence: {
      completeness: 95,
      currency: 90,
      reliability: 100,
      materiality: 100,
      overallScore: 96
    },
    relatedDocs: ['market-competitive', 'business-model'],
    investorRelevance: 'critical'
  }
]

export default function DataRoomViewerPage() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(documents[0])
  const [viewerMode, setViewerMode] = useState<'summary' | 'full'>('summary')

  const getConfidenceColor = (score: number) => {
    if (score >= 95) return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }
    if (score >= 85) return { bg: '#EAF5F0', text: '#2D7A5F', border: '#A7BEAE' }
    if (score >= 70) return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }
    return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' }
  }

  const getRelevanceIcon = (relevance: string) => {
    if (relevance === 'critical') return { icon: '🔴', label: 'Critical' }
    if (relevance === 'important') return { icon: '🟡', label: 'Important' }
    return { icon: '⚪', label: 'Reference' }
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#F7F6F4' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8"
        >
          <h1 className="serif text-4xl font-bold text-nav mb-2">Data Room Viewer</h1>
          <p className="text-text-muted">AI-curated document summaries with confidence metrics — click to explore</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 p-6 md:p-8">
          {/* Left: Document Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="sticky top-8">
              <h2 className="h4 text-nav mb-4">📋 Document Map</h2>
              <div className="space-y-2">
                {documents.map((doc, i) => {
                  const isSelected = selectedDoc?.metadata.id === doc.metadata.id
                  const relevanceIcon = getRelevanceIcon(doc.investorRelevance)
                  const colors = getConfidenceColor(doc.confidence.overallScore)

                  return (
                    <motion.button
                      key={doc.metadata.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="w-full p-3 rounded-lg text-left transition-all"
                      style={{
                        background: isSelected ? colors.bg : 'white',
                        borderLeft: isSelected ? `4px solid ${colors.text}` : 'none',
                        paddingLeft: isSelected ? '12px' : '16px',
                        border: `1px solid ${isSelected ? colors.border : '#E5E4E0'}`
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.text }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-nav line-clamp-2">
                            {doc.metadata.title}
                          </p>
                          <p className="text-xs text-text-muted mt-1">{doc.metadata.folder}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="text-xs font-bold" style={{ color: colors.text }}>
                              {doc.confidence.overallScore}%
                            </span>
                            <span className="text-xs">{relevanceIcon.icon}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: Document Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <AnimatePresence mode="wait">
              {selectedDoc && (
                <motion.div
                  key={selectedDoc.metadata.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Document Header */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 mb-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="h2 text-nav mb-2">{selectedDoc.metadata.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                          <span>{selectedDoc.metadata.folder}</span>
                          <span>•</span>
                          <span>v{selectedDoc.metadata.version}</span>
                          <span>•</span>
                          <span>{selectedDoc.metadata.fileSize}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="label-xs px-2 py-1 rounded-full font-bold" style={{ background: '#FDECEB', color: '#E8312A' }}>
                            {getRelevanceIcon(selectedDoc.investorRelevance).icon} {getRelevanceIcon(selectedDoc.investorRelevance).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="grid grid-cols-5 gap-3 p-4 rounded-lg" style={{ background: '#F7F6F4' }}>
                      <div className="text-center">
                        <p className="label-xs text-text-muted mb-1">Completeness</p>
                        <p className="h4" style={{ color: getConfidenceColor(selectedDoc.confidence.completeness).text }}>
                          {selectedDoc.confidence.completeness}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="label-xs text-text-muted mb-1">Currency</p>
                        <p className="h4" style={{ color: getConfidenceColor(selectedDoc.confidence.currency).text }}>
                          {selectedDoc.confidence.currency}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="label-xs text-text-muted mb-1">Reliability</p>
                        <p className="h4" style={{ color: getConfidenceColor(selectedDoc.confidence.reliability).text }}>
                          {selectedDoc.confidence.reliability}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="label-xs text-text-muted mb-1">Materiality</p>
                        <p className="h4" style={{ color: getConfidenceColor(selectedDoc.confidence.materiality).text }}>
                          {selectedDoc.confidence.materiality}%
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ background: 'white', border: '2px solid #E8312A' }}>
                        <p className="label-xs text-text-muted mb-1">Overall</p>
                        <p className="h3 font-black" style={{ color: '#E8312A' }}>
                          {selectedDoc.confidence.overallScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary Section */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 space-y-6">
                    {/* Executive Summary */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5" style={{ color: '#E8312A' }} />
                        <h3 className="h4 text-nav">AI Summary</h3>
                      </div>
                      <p className="text-base text-text-muted leading-relaxed">
                        {selectedDoc.summary.executive}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5" style={{ color: '#E8312A' }} />
                        <h3 className="h4 text-nav">Key Highlights</h3>
                      </div>
                      <ul className="space-y-2">
                        {selectedDoc.summary.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm text-text-muted">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Red Flags */}
                    {selectedDoc.summary.redFlags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5" style={{ color: '#DC2626' }} />
                          <h3 className="h4 text-nav">Items to Watch</h3>
                        </div>
                        <div className="space-y-2">
                          {selectedDoc.summary.redFlags.map((flag, i) => (
                            <div key={i} className="p-3 rounded-lg" style={{ background: '#FEE2E2', borderLeft: '3px solid #DC2626' }}>
                              <p className="text-sm text-red-800">{flag}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities */}
                    {selectedDoc.summary.opportunities.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <h3 className="h4 text-nav">Strategic Insights</h3>
                        </div>
                        <ul className="space-y-2">
                          {selectedDoc.summary.opportunities.map((opp, i) => (
                            <li key={i} className="flex gap-3 text-sm text-text-muted">
                              <Target className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Metrics */}
                    {selectedDoc.summary.metrics.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                          <h3 className="h4 text-nav">Key Metrics</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                          {selectedDoc.summary.metrics.map((metric, i) => (
                            <div key={i} className="p-3 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                              <p className="label-sm text-text-muted mb-1">{metric.label}</p>
                              <p className="font-bold text-nav">{metric.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Documents */}
                    {selectedDoc.relatedDocs.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="label text-text-muted font-bold mb-2">Related Documents</h3>
                        <div className="flex gap-2 flex-wrap">
                          {selectedDoc.relatedDocs.map(docId => {
                            const relDoc = documents.find(d => d.metadata.id === docId)
                            return (
                              <button
                                key={docId}
                                onClick={() => setSelectedDoc(relDoc!)}
                                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:shadow-md"
                                style={{ background: '#F7F6F4', borderColor: '#E5E4E0', color: '#E8312A' }}
                              >
                                {relDoc?.metadata.title}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
