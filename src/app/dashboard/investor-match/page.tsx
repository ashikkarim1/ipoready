'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import {
  Target, Users, TrendingUp, DollarSign, CheckCircle2, AlertCircle,
  Filter, Search, Star, MapPin, Building2, BarChart3, X, Mail, Download,
  Copy, Send, Lightbulb, ArrowRight, Clock, Eye, CheckCircle, FileText
} from 'lucide-react'

interface Investor {
  id: string
  name: string
  type: 'VC' | 'PE' | 'Growth' | 'Strategic'
  stage: string
  checkSize: string
  sector: string
  location: string
  successRate: number
  relevance: number
  notes: string
}

interface OutreachDraft {
  subject: string
  body: string
  hasAttachment: boolean
}

interface CRMEntry {
  id: string
  investorId: string
  investorName: string
  status: 'draft' | 'sent' | 'opened' | 'replied'
  sentAt?: Date
  openedAt?: Date
  repliedAt?: Date
  subject: string
}

const MOCK_INVESTORS: Investor[] = [
  {
    id: '1',
    name: 'Accel Partners',
    type: 'VC',
    stage: 'Series A-D',
    checkSize: '$2M-$50M',
    sector: 'Enterprise SaaS',
    location: 'San Francisco',
    successRate: 92,
    relevance: 95,
    notes: 'Strong history with fintech and AI companies'
  },
  {
    id: '2',
    name: 'Sequoia Capital',
    type: 'VC',
    stage: 'Series B-D',
    checkSize: '$5M-$100M+',
    sector: 'Diverse',
    location: 'San Francisco',
    successRate: 88,
    relevance: 88,
    notes: 'Excellent IPO track record, strong network'
  },
  {
    id: '3',
    name: 'Insight Partners',
    type: 'PE',
    stage: 'Growth Stage',
    checkSize: '$50M-$500M',
    sector: 'Enterprise SaaS',
    location: 'New York',
    successRate: 85,
    relevance: 82,
    notes: 'Focused on software-as-a-service companies'
  },
  {
    id: '4',
    name: 'Andreessen Horowitz',
    type: 'VC',
    stage: 'Seed-D',
    checkSize: '$1M-$150M+',
    sector: 'Technology',
    location: 'San Francisco',
    successRate: 90,
    relevance: 80,
    notes: 'Large fund with extensive operating resources'
  },
  {
    id: '5',
    name: 'Thrive Capital',
    type: 'Growth',
    stage: 'Series C+',
    checkSize: '$5M-$100M',
    sector: 'Technology',
    location: 'New York',
    successRate: 87,
    relevance: 85,
    notes: 'Growth equity focused, strong exits'
  }
]

export default function InvestorMatchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'relevance' | 'successRate'>('relevance')
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [emailDraft, setEmailDraft] = useState<OutreachDraft | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBody, setEditedBody] = useState('')
  const [crmTracker, setCrmTracker] = useState<CRMEntry[]>([])
  const [emailSent, setEmailSent] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState('')

  const investors = MOCK_INVESTORS.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.sector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || inv.type === selectedType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    if (sortBy === 'relevance') return b.relevance - a.relevance
    return b.successRate - a.successRate
  })

  // Generate AI insights for why this investor is a good match
  const generateAIInsights = (investor: Investor) => {
    const insights = []

    if (investor.relevance >= 90) {
      insights.push(`${investor.name} has a ${investor.relevance}% match with your company profile, indicating they're actively seeking companies like yours in the ${investor.sector} sector.`)
    }
    if (investor.successRate >= 85) {
      insights.push(`With a ${investor.successRate}% exit rate, ${investor.name} has proven expertise in scaling companies to successful outcomes, making them an ideal strategic partner.`)
    }
    if (investor.stage.includes('Series') || investor.stage.includes('D')) {
      insights.push(`Their focus on ${investor.stage} companies aligns perfectly with your growth stage and maturity level.`)
    }
    insights.push(`At ${investor.location}, ${investor.name} brings deep market connections and operational expertise specific to your region.`)

    return insights
  }

  // Generate approach strategy
  const generateApproachStrategy = (investor: Investor) => {
    const strategies = []

    if (investor.type === 'VC') {
      strategies.push('Focus on market opportunity and scalability potential. VCs prioritize growth trajectory and market size.')
      strategies.push('Emphasize your competitive advantage, team expertise, and why you\'re positioned to capture market share.')
    } else if (investor.type === 'PE') {
      strategies.push('Highlight profitability metrics, cash flow, and margin expansion opportunities.')
      strategies.push('Demonstrate operational improvements and a clear path to value creation.')
    } else if (investor.type === 'Growth') {
      strategies.push('Show revenue traction and unit economics. Growth investors want profitable, scalable companies.')
      strategies.push('Emphasize how capital will accelerate growth and market penetration.')
    }

    strategies.push(`Request a 20-minute introductory call to discuss how ${investor.name}'s expertise can accelerate your roadmap.`)

    return strategies
  }

  // Generate AI-powered draft email
  const generateDraftEmail = (investor: Investor) => {
    const subject = `Introducing [Your Company] - Opportunity to Lead Series B Growth`

    const body = `Hi [Investor Name at ${investor.name}],

I hope this reaches you well. I'm reaching out because [Your Company] aligns closely with ${investor.name}'s investment thesis in ${investor.sector} companies at the ${investor.stage} stage.

Over the past [X] months, we've achieved:
• $[X]M in ARR with [X]% YoY growth
• [X]% net revenue retention from our customer base
• Strategic partnerships with [key industry players]

What makes this opportunity compelling:
${generateApproachStrategy(investor).slice(0, 2).map((s, i) => `${i + 1}. ${s}`).join('\n')}

We're actively seeking a lead investor who understands the market dynamics and can contribute strategic value beyond capital. I'd love to discuss how ${investor.name} could be the perfect partner for this next phase of growth.

Would you be open to a brief 20-minute call next week to explore this further?

Attached is our 1-pager with key metrics and market analysis.

Looking forward to connecting.

Best regards,
[Your Name]
[Your Title]
[Your Company]
[Contact Information]`

    return {
      subject,
      body,
      hasAttachment: true
    }
  }

  // Handle opening investor detail modal
  const handleInvestorSelect = (investor: Investor) => {
    setSelectedInvestor(investor)
    const draft = generateDraftEmail(investor)
    setEmailDraft(draft)
    setEditedBody(draft.body)
    setShowDraftModal(true)
    setIsEditing(false)
    setEmailSent(false)
  }

  // Handle sending email
  const handleSendEmail = () => {
    if (!selectedInvestor || !emailDraft) return

    const crmEntry: CRMEntry = {
      id: `outreach-${Date.now()}`,
      investorId: selectedInvestor.id,
      investorName: selectedInvestor.name,
      status: 'sent',
      sentAt: new Date(),
      subject: emailDraft.subject
    }

    setCrmTracker([...crmTracker, crmEntry])
    setEmailSent(true)

    // Auto-close modal after 2 seconds
    setTimeout(() => {
      setShowDraftModal(false)
      setSelectedInvestor(null)
    }, 2000)
  }

  // Handle copy to clipboard
  const handleCopyEmail = () => {
    const fullEmail = `Subject: ${emailDraft?.subject}\n\n${editedBody}`
    navigator.clipboard.writeText(fullEmail)
    setCopiedEmail('email')
    setTimeout(() => setCopiedEmail(''), 2000)
  }

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#F7F6F4' }}>

      {/* Hero */}
      <section style={{ borderBottom: '1px solid #E5E4E0', padding: '3rem 1.5rem', background: '#F7F6F4' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#F0F4FF', border: '1px solid #1D4ED830' }}>
              <Target className="w-4 h-4" style={{ color: '#1D4ED8' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1D4ED8' }}>Investor Intelligence</span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '1rem 0' }}>
              Investor Match™
            </h1>

            <p style={{ fontSize: '1.125rem', color: '#717171', maxWidth: '48rem', margin: '1rem auto' }}>
              Find the investors most likely to lead your round. Matching based on stage, sector, check size, and exit patterns.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="inline-flex items-center gap-2" style={{ color: '#1A1A1A' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                <span style={{ fontWeight: 600 }}>Curated from 500+ institutional investors</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: '2rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search className="w-5 h-5" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#717171' }} />
                <input
                  type="text"
                  placeholder="Investor name or sector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #E5E4E0',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Investor Type
              </label>
              <select
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value || null)}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.375rem',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Types</option>
                <option value="VC">Venture Capital</option>
                <option value="PE">Private Equity</option>
                <option value="Growth">Growth Equity</option>
                <option value="Strategic">Strategic</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'successRate')}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.375rem',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  cursor: 'pointer'
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="successRate">Exit Rate</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Investors Grid */}
      <section style={{ padding: '3rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {investors.map((investor, idx) => (
              <motion.div
                key={investor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                style={{
                  padding: '1.5rem',
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E0',
                  borderRadius: '0.5rem'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.25rem' }}>
                      {investor.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: investor.type === 'VC' ? '#EBF9F4' : investor.type === 'PE' ? '#F0F4FF' : '#FEF3E1',
                          color: investor.type === 'VC' ? '#2D7A5F' : investor.type === 'PE' ? '#1D4ED8' : '#B45309'
                        }}
                      >
                        {investor.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <Star className="w-4 h-4" style={{ color: '#FCD34D', fill: '#FCD34D' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>
                        {investor.relevance}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#717171' }}>Match</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Stage</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.stage}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Check Size</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.checkSize}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Sector Focus</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.sector}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, marginBottom: '0.25rem' }}>Exit Rate</p>
                    <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.successRate}%</p>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#F9F9F9', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.25rem', fontWeight: 600 }}>Location</p>
                  <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{investor.location}</p>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#717171', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {investor.notes}
                </p>

                <button
                  onClick={() => handleInvestorSelect(investor)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#E8312A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#D12620')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
                >
                  Start Outreach
                </button>
              </motion.div>
            ))}
          </div>

          {investors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#717171' }} />
              <p style={{ fontSize: '1rem', color: '#717171' }}>No investors match your criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Investor Detail Modal with AI Insights & Outreach Workflow */}
      <AnimatePresence>
        {showDraftModal && selectedInvestor && emailDraft && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDraftModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 40
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#FFFFFF',
                borderRadius: '0.75rem',
                border: '1px solid #E5E4E0',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxWidth: '900px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                zIndex: 50
              }}
            >
              {/* Header */}
              <div style={{ padding: '2rem', borderBottom: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                      {selectedInvestor.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          background: selectedInvestor.type === 'VC' ? '#EBF9F4' : selectedInvestor.type === 'PE' ? '#F0F4FF' : '#FEF3E1',
                          color: selectedInvestor.type === 'VC' ? '#2D7A5F' : selectedInvestor.type === 'PE' ? '#1D4ED8' : '#B45309'
                        }}
                      >
                        {selectedInvestor.type}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star className="w-4 h-4" style={{ color: '#FCD34D', fill: '#FCD34D' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                          {selectedInvestor.relevance}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDraftModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                  >
                    <X className="w-6 h-6" style={{ color: '#717171' }} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '2rem' }}>
                {/* Success Message */}
                {emailSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '1rem 1.5rem',
                      background: '#EBF9F4',
                      border: '1px solid #2D7A5F',
                      borderRadius: '0.5rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: '#2D7A5F', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2D7A5F', marginBottom: '0.25rem' }}>
                        Email Sent Successfully!
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#2D7A5F' }}>
                        Your outreach to {selectedInvestor.name} has been tracked in your CRM.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  {/* Left Column: AI Insights & Strategy */}
                  <div>
                    {/* AI Insights */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Lightbulb className="w-5 h-5" style={{ color: '#E8312A' }} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A' }}>
                          Why This Investor?
                        </h3>
                      </div>
                      <div>
                        {generateAIInsights(selectedInvestor).map((insight, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.875rem',
                              background: '#F9F9F9',
                              borderLeft: '3px solid #E8312A',
                              borderRadius: '0.375rem',
                              marginBottom: '0.75rem'
                            }}
                          >
                            <p style={{ fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.5 }}>
                              {insight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Approach Strategy */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <ArrowRight className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A' }}>
                          How to Approach
                        </h3>
                      </div>
                      <div>
                        {generateApproachStrategy(selectedInvestor).map((strategy, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              marginBottom: '1rem'
                            }}
                          >
                            <div
                              style={{
                                width: '1.75rem',
                                height: '1.75rem',
                                background: '#F0F4FF',
                                border: '2px solid #1D4ED8',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#1D4ED8'
                              }}
                            >
                              {idx + 1}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.5, paddingTop: '0.25rem' }}>
                              {strategy}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Email Draft Editor */}
                  <div>
                    {/* Email Preview / Edit Toggle */}
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setIsEditing(false)}
                        style={{
                          flex: 1,
                          padding: '0.75rem 1rem',
                          background: !isEditing ? '#1A1A1A' : '#FFFFFF',
                          color: !isEditing ? '#FFFFFF' : '#1A1A1A',
                          border: !isEditing ? 'none' : '1px solid #E5E4E0',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          flex: 1,
                          padding: '0.75rem 1rem',
                          background: isEditing ? '#1A1A1A' : '#FFFFFF',
                          color: isEditing ? '#FFFFFF' : '#1A1A1A',
                          border: isEditing ? 'none' : '1px solid #E5E4E0',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Edit
                      </button>
                    </div>

                    {/* Email Draft */}
                    <div style={{
                      background: '#F9F9F9',
                      border: '1px solid #E5E4E0',
                      borderRadius: '0.5rem',
                      padding: '1.5rem'
                    }}>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#717171', marginBottom: '0.375rem' }}>
                          SUBJECT
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={emailDraft.subject}
                            onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              border: '1px solid #E5E4E0',
                              borderRadius: '0.375rem',
                              color: '#1A1A1A'
                            }}
                          />
                        ) : (
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                            {emailDraft.subject}
                          </p>
                        )}
                      </div>

                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#717171', marginBottom: '0.375rem' }}>
                          MESSAGE
                        </p>
                        {isEditing ? (
                          <textarea
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            style={{
                              width: '100%',
                              height: '300px',
                              padding: '0.75rem',
                              fontSize: '0.75rem',
                              border: '1px solid #E5E4E0',
                              borderRadius: '0.375rem',
                              color: '#1A1A1A',
                              fontFamily: 'monospace',
                              resize: 'vertical'
                            }}
                          />
                        ) : (
                          <div style={{
                            padding: '1rem',
                            background: '#FFFFFF',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            color: '#1A1A1A',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: 1.6,
                            maxHeight: '250px',
                            overflowY: 'auto'
                          }}>
                            {editedBody}
                          </div>
                        )}
                      </div>

                      {/* Attachment Badge */}
                      {emailDraft.hasAttachment && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          background: '#EBF9F4',
                          borderRadius: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <Download className="w-4 h-4" style={{ color: '#2D7A5F' }} />
                          <span style={{ fontSize: '0.75rem', color: '#2D7A5F', fontWeight: 600 }}>
                            📎 1-Pager Teaser (PDF attached)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button
                        onClick={handleCopyEmail}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#FFFFFF',
                          color: '#1A1A1A',
                          border: '1px solid #E5E4E0',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F9F9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      >
                        <Copy className="w-4 h-4" />
                        {copiedEmail === 'email' ? 'Copied!' : 'Copy Email'}
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSent}
                        style={{
                          padding: '0.75rem 1rem',
                          background: emailSent ? '#2D7A5F' : '#E8312A',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: emailSent ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => !emailSent && (e.currentTarget.style.background = '#D12620')}
                        onMouseLeave={(e) => !emailSent && (e.currentTarget.style.background = '#E8312A')}
                      >
                        {emailSent ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Sent
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CRM Tracker Summary */}
                {crmTracker.length > 0 && (
                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E5E4E0' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1rem' }}>
                      📊 Outreach History
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {crmTracker.filter(e => e.investorId === selectedInvestor.id).map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            padding: '0.875rem',
                            background: '#F9F9F9',
                            border: '1px solid #E5E4E0',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.25rem' }}>
                              {entry.subject}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#717171' }}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {entry.sentAt?.toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.375rem 0.75rem',
                              borderRadius: '0.25rem',
                              background: entry.status === 'sent' ? '#F0F4FF' : '#EBF9F4',
                              color: entry.status === 'sent' ? '#1D4ED8' : '#2D7A5F'
                            }}
                          >
                            {entry.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
    </AppShell>
  )
}
