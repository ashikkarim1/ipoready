'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import {
  Target, Users, TrendingUp, DollarSign, CheckCircle2, AlertCircle,
  Filter, Search, Star, MapPin, Building2, BarChart3, X, Mail, Download,
  Copy, Send, Lightbulb, ArrowRight, Clock, Eye, CheckCircle, FileText,
  Plus, Trash2, Edit2, ExternalLink, Inbox
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
  isCustom?: boolean
}

interface OutreachDraft {
  subject: string
  body: string
  attachmentOption: 'auto' | 'upload' | 'none'
  attachmentFileName?: string
}

interface CRMEntry {
  id: string
  investorId: string
  investorName: string
  investorType: string
  status: 'draft' | 'sent' | 'opened' | 'replied'
  sentAt?: Date
  openedAt?: Date
  repliedAt?: Date
  subject: string
  nextFollowUp?: Date
  notes?: string
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

  // CRM State
  const [crmTracker, setCrmTracker] = useState<CRMEntry[]>([])
  const [customInvestors, setCustomInvestors] = useState<Investor[]>([])
  const [showAddInvestor, setShowAddInvestor] = useState(false)
  const [newInvestorName, setNewInvestorName] = useState('')
  const [newInvestorType, setNewInvestorType] = useState<Investor['type']>('VC')
  const [newInvestorCheckSize, setNewInvestorCheckSize] = useState('')

  // Outreach State
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [showOutreachModal, setShowOutreachModal] = useState(false)
  const [emailDraft, setEmailDraft] = useState<OutreachDraft | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBody, setEditedBody] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [attachmentOption, setAttachmentOption] = useState<'auto' | 'upload' | 'none'>('auto')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [copiedEmail, setCopiedEmail] = useState('')

  const allInvestors = [...MOCK_INVESTORS, ...customInvestors]

  const investors = allInvestors.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.sector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || inv.type === selectedType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    if (sortBy === 'relevance') return b.relevance - a.relevance
    return b.successRate - a.successRate
  })

  const generateAIInsights = (investor: Investor) => {
    const insights = []
    if (investor.relevance >= 90) {
      insights.push(`${investor.name} has a ${investor.relevance}% match with your company profile, indicating they're actively seeking companies like yours in the ${investor.sector} sector.`)
    }
    if (investor.successRate >= 85) {
      insights.push(`With a ${investor.successRate}% exit rate, ${investor.name} has proven expertise in scaling companies to successful outcomes.`)
    }
    if (investor.stage.includes('Series') || investor.stage.includes('D')) {
      insights.push(`Their focus on ${investor.stage} companies aligns perfectly with your growth stage.`)
    }
    insights.push(`At ${investor.location}, ${investor.name} brings deep market connections and operational expertise.`)
    return insights
  }

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

  const generateDraftEmail = (investor: Investor) => {
    const subject = `Introducing [Your Company] - ${investor.type === 'PE' ? 'Growth Opportunity' : 'Series B Funding'}`
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

${attachmentOption !== 'none' ? 'Attached is our 1-pager with key metrics and market analysis.' : 'I\'m happy to share our 1-pager and detailed metrics upon your request.'}

Looking forward to connecting.

Best regards,
[Your Name]
[Your Title]
[Your Company]
[Contact Information]`

    return {
      subject,
      body,
      attachmentOption: attachmentOption as 'auto' | 'upload' | 'none',
      attachmentFileName: uploadedFile?.name
    }
  }

  const handleInvestorSelect = (investor: Investor) => {
    setSelectedInvestor(investor)
    setAttachmentOption('auto')
    setUploadedFile(null)
    const draft = generateDraftEmail(investor)
    setEmailDraft(draft)
    setEditedBody(draft.body)
    setShowOutreachModal(true)
    setIsEditing(false)
    setEmailSent(false)
  }

  const handleSendEmail = () => {
    if (!selectedInvestor || !emailDraft) return

    const nextFollowUp = new Date()
    nextFollowUp.setDate(nextFollowUp.getDate() + 3)

    const crmEntry: CRMEntry = {
      id: `outreach-${Date.now()}`,
      investorId: selectedInvestor.id,
      investorName: selectedInvestor.name,
      investorType: selectedInvestor.type,
      status: 'sent',
      sentAt: new Date(),
      subject: emailDraft.subject,
      nextFollowUp,
      notes: `Sent via Investor Match. ${attachmentOption === 'auto' ? 'Auto-generated 1-pager attached.' : attachmentOption === 'upload' ? `Custom 1-pager "${uploadedFile?.name}" attached.` : 'No attachment.'}`
    }

    setCrmTracker([...crmTracker, crmEntry])
    setEmailSent(true)

    setTimeout(() => {
      setShowOutreachModal(false)
      setSelectedInvestor(null)
    }, 2000)
  }

  const handleAddCustomInvestor = () => {
    if (!newInvestorName.trim()) return

    const customInvestor: Investor = {
      id: `custom-${Date.now()}`,
      name: newInvestorName,
      type: newInvestorType,
      stage: 'Custom',
      checkSize: newInvestorCheckSize || 'TBD',
      sector: 'Custom',
      location: 'TBD',
      successRate: 0,
      relevance: 0,
      notes: 'Custom investor added to CRM',
      isCustom: true
    }

    setCustomInvestors([...customInvestors, customInvestor])
    setNewInvestorName('')
    setNewInvestorType('VC')
    setNewInvestorCheckSize('')
    setShowAddInvestor(false)
  }

  const handleDeleteCustomInvestor = (id: string) => {
    setCustomInvestors(customInvestors.filter(inv => inv.id !== id))
  }

  const handleCopyEmail = () => {
    const fullEmail = `Subject: ${emailDraft?.subject}\n\n${editedBody}`
    navigator.clipboard.writeText(fullEmail)
    setCopiedEmail('email')
    setTimeout(() => setCopiedEmail(''), 2000)
  }

  const handleCopyCRMEntry = (entry: CRMEntry) => {
    navigator.clipboard.writeText(`${entry.investorName} - ${entry.status}`)
    setCopiedEmail(entry.id)
    setTimeout(() => setCopiedEmail(''), 2000)
  }

  const sentCount = crmTracker.filter(e => e.status === 'sent').length
  const repliedCount = crmTracker.filter(e => e.status === 'replied').length

  // Split-view state
  const [showCRM, setShowCRM] = useState(true)
  const [showInvestors, setShowInvestors] = useState(true)
  const [dividerPos, setDividerPos] = useState(50) // percentage
  const [isDragging, setIsDragging] = useState(false)

  const handleDividerMouseDown = () => setIsDragging(true)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const container = document.getElementById('split-view-container')
      if (!container) return
      const rect = container.getBoundingClientRect()
      const newPos = ((e.clientX - rect.left) / rect.width) * 100
      if (newPos > 20 && newPos < 80) setDividerPos(newPos)
    }
    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <AppShell>
      <div
        id="split-view-container"
        style={{
          minHeight: '100vh',
          background: '#F7F6F4',
          display: 'flex',
          overflow: 'hidden'
        }}
      >

        {/* CRM SIDEBAR */}
        {showCRM && (
        <div style={{
          background: '#FFFFFF',
          borderRight: '1px solid #E5E4E0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          flex: `0 0 ${dividerPos}%`,
          transition: isDragging ? 'none' : 'flex 0.2s'
        }}>

          {/* CRM Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E4E0', background: '#FFFFFF', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox className="w-5 h-5" style={{ color: '#E8312A' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  Outreach Pipeline
                </h2>
              </div>
              <button
                onClick={() => setShowCRM(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#717171'
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CRM Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: '#F0F4FF', borderRadius: '0.375rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Sent</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1D4ED8', margin: 0 }}>{sentCount}</p>
              </div>
              <div style={{ padding: '0.75rem', background: '#EBF9F4', borderRadius: '0.375rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#717171', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Replied</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2D7A5F', margin: 0 }}>{repliedCount}</p>
              </div>
            </div>

            {/* Add Investor Button */}
            <button
              onClick={() => setShowAddInvestor(true)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#E8312A',
                color: '#FFFFFF',
                border: 'none',
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
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D12620')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
            >
              <Plus className="w-4 h-4" />
              Add Investor
            </button>
          </div>

          {/* CRM Entries - Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
            {crmTracker.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#717171' }}>
                <Mail className="w-8 h-8 mx-auto mb-2" style={{ opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>Start reaching out to build your pipeline</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {crmTracker.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '1rem',
                      background: '#F9F9F9',
                      border: '1px solid #E5E4E0',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.background = '#F0F4FF'
                      e.currentTarget.style.borderColor = '#1D4ED8'
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.background = '#F9F9F9'
                      e.currentTarget.style.borderColor = '#E5E4E0'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{entry.investorName}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: entry.status === 'sent' ? '#F0F4FF' : '#EBF9F4',
                          color: entry.status === 'sent' ? '#1D4ED8' : '#2D7A5F'
                        }}>
                          {entry.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#717171', margin: '0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.subject}
                    </p>
                    {entry.sentAt && (
                      <p style={{ fontSize: '0.7rem', color: '#999', margin: '0.25rem 0 0 0' }}>
                        {entry.sentAt.toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Investors Section */}
          {customInvestors.length > 0 && (
            <div style={{ padding: '1rem', borderTop: '1px solid #E5E4E0', background: '#F9F9F9' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#717171', textTransform: 'uppercase', marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
                Custom Investors ({customInvestors.length})
              </p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {customInvestors.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: '0.75rem',
                      background: '#FFFFFF',
                      border: '1px solid #E5E4E0',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.name}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#717171', margin: '0.25rem 0 0 0' }}>
                        {inv.type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomInvestor(inv.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: '#717171',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#717171')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Resizable Divider */}
        {showCRM && showInvestors && (
          <div
            onMouseDown={handleDividerMouseDown}
            style={{
              width: '4px',
              background: isDragging ? '#1D4ED8' : '#E5E4E0',
              cursor: 'col-resize',
              transition: 'background 0.2s',
              flexShrink: 0,
              userSelect: 'none'
            }}
          />
        )}

        {/* MAIN CONTENT - Investors */}
        {showInvestors && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          flex: `0 0 ${showCRM ? 100 - dividerPos : 100}%`,
          transition: isDragging ? 'none' : 'flex 0.2s'
        }}>

          {/* Hero Section */}
          {/* Filters Section */}
          <section style={{ padding: '1rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E5E4E0', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Search
                </label>
                <div style={{ position: 'relative' }}>
                  <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#717171' }} />
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
                      outline: 'none',
                      color: '#1A1A1A'
                    }}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Type
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Sort
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
          </section>

          {/* Investors Grid */}
          <section style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {investors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#717171' }} />
                  <p style={{ fontSize: '0.875rem', color: '#717171' }}>No investors match your criteria</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {investors.map((investor, idx) => (
                    <motion.div
                      key={investor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      style={{
                        padding: '1.5rem',
                        background: '#FFFFFF',
                        border: investor.isCustom ? '2px solid #E8312A' : '1px solid #E5E4E0',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e: any) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                        e.currentTarget.style.borderColor = '#1D4ED8'
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.borderColor = investor.isCustom ? '#E8312A' : '#E5E4E0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 0.25rem 0' }}>
                            {investor.name}
                            {investor.isCustom && <span style={{ fontSize: '0.65rem', marginLeft: '0.5rem', background: '#FEE2E2', color: '#DC2626', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>CUSTOM</span>}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              background: investor.type === 'VC' ? '#EBF9F4' : investor.type === 'PE' ? '#F0F4FF' : '#FEF3E1',
                              color: investor.type === 'VC' ? '#2D7A5F' : investor.type === 'PE' ? '#1D4ED8' : '#B45309'
                            }}>
                              {investor.type}
                            </span>
                          </div>
                        </div>
                        {!investor.isCustom && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                              <Star className="w-4 h-4" style={{ color: '#FCD34D', fill: '#FCD34D' }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>
                                {investor.relevance}%
                              </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#717171', margin: 0 }}>Match</p>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: '#717171', fontWeight: 600, margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Stage</p>
                          <p style={{ fontSize: '0.875rem', color: '#1A1A1A', margin: 0 }}>{investor.stage}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: '#717171', fontWeight: 600, margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Check Size</p>
                          <p style={{ fontSize: '0.875rem', color: '#1A1A1A', margin: 0 }}>{investor.checkSize}</p>
                        </div>
                      </div>

                      <div style={{ padding: '0.75rem', background: '#F9F9F9', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#717171', fontWeight: 600, margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Location</p>
                        <p style={{ fontSize: '0.875rem', color: '#1A1A1A', margin: 0 }}>{investor.location}</p>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: '#717171', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
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
                        <Mail className="w-4 h-4 inline mr-2" />
                        Start Outreach
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        )}

        {/* Collapsed CRM/Investors Buttons */}
        {!showCRM && !showInvestors && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <button
              onClick={() => setShowCRM(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#E8312A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Show Outreach
            </button>
            <button
              onClick={() => setShowInvestors(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#E8312A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Show Investors
            </button>
          </div>
        )}

        {/* ADD INVESTOR MODAL */}
        <AnimatePresence>
          {showAddInvestor && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddInvestor(false)}
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#FFFFFF',
                  borderRadius: '0.75rem',
                  border: '1px solid #E5E4E0',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  maxWidth: '400px',
                  width: '90%',
                  zIndex: 50
                }}
              >
                <div style={{ padding: '1rem', borderBottom: '1px solid #E5E4E0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                      Add Investor to CRM
                    </h2>
                    <button
                      onClick={() => setShowAddInvestor(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem'
                      }}
                    >
                      <X className="w-5 h-5" style={{ color: '#717171' }} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#717171', margin: 0 }}>
                    Create a custom investor entry to track in your CRM pipeline.
                  </p>
                </div>

                <div style={{ padding: '1rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                      Investor Name *
                    </label>
                    <input
                      type="text"
                      value={newInvestorName}
                      onChange={(e) => setNewInvestorName(e.target.value)}
                      placeholder="e.g., Benchmark Capital"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #E5E4E0',
                        borderRadius: '0.375rem',
                        boxSizing: 'border-box',
                        color: '#1A1A1A'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                      Investor Type
                    </label>
                    <select
                      value={newInvestorType}
                      onChange={(e) => setNewInvestorType(e.target.value as Investor['type'])}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #E5E4E0',
                        borderRadius: '0.375rem',
                        boxSizing: 'border-box',
                        color: '#1A1A1A',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="VC">Venture Capital</option>
                      <option value="PE">Private Equity</option>
                      <option value="Growth">Growth Equity</option>
                      <option value="Strategic">Strategic</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                      Check Size (Optional)
                    </label>
                    <input
                      type="text"
                      value={newInvestorCheckSize}
                      onChange={(e) => setNewInvestorCheckSize(e.target.value)}
                      placeholder="e.g., $5M-$50M"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #E5E4E0',
                        borderRadius: '0.375rem',
                        boxSizing: 'border-box',
                        color: '#1A1A1A'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                      onClick={() => setShowAddInvestor(false)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#FFFFFF',
                        color: '#1A1A1A',
                        border: '1px solid #E5E4E0',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomInvestor}
                      disabled={!newInvestorName.trim()}
                      style={{
                        padding: '0.75rem 1rem',
                        background: newInvestorName.trim() ? '#E8312A' : '#CCCCCC',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: newInvestorName.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Add Investor
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* OUTREACH MODAL */}
        <AnimatePresence>
          {showOutreachModal && selectedInvestor && emailDraft && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOutreachModal(false)}
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

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                <div style={{ padding: '1rem', borderBottom: '1px solid #E5E4E0', background: '#F7F6F4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 0.5rem 0' }}>
                        {selectedInvestor.name}
                      </h2>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          background: selectedInvestor.type === 'VC' ? '#EBF9F4' : selectedInvestor.type === 'PE' ? '#F0F4FF' : '#FEF3E1',
                          color: selectedInvestor.type === 'VC' ? '#2D7A5F' : selectedInvestor.type === 'PE' ? '#1D4ED8' : '#B45309'
                        }}>
                          {selectedInvestor.type}
                        </span>
                        {!selectedInvestor.isCustom && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star className="w-4 h-4" style={{ color: '#FCD34D', fill: '#FCD34D' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                              {selectedInvestor.relevance}% Match
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOutreachModal(false)}
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
                <div style={{ padding: '1rem' }}>
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
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2D7A5F', margin: '0 0 0.25rem 0' }}>
                          Email Sent Successfully!
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#2D7A5F', margin: 0 }}>
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
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
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
                              <p style={{ fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.5, margin: 0 }}>
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
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
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
                              <p style={{ fontSize: '0.875rem', color: '#1A1A1A', lineHeight: 1.5, margin: '0.25rem 0 0 0' }}>
                                {strategy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Email Draft & Attachment Options */}
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
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#717171', margin: '0 0 0.375rem 0', textTransform: 'uppercase' }}>
                            Subject
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
                                color: '#1A1A1A',
                                boxSizing: 'border-box'
                              }}
                            />
                          ) : (
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                              {emailDraft.subject}
                            </p>
                          )}
                        </div>

                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#717171', margin: '0 0 0.375rem 0', textTransform: 'uppercase' }}>
                            Message
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
                                resize: 'vertical',
                                boxSizing: 'border-box'
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
                      </div>

                      {/* Attachment Options */}
                      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#F9F9F9', borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 1rem 0' }}>
                          📎 1-Pager Attachment
                        </p>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {/* Auto-Generate Option */}
                          <label style={{
                            padding: '1rem',
                            border: attachmentOption === 'auto' ? '2px solid #E8312A' : '1px solid #E5E4E0',
                            borderRadius: '0.375rem',
                            background: attachmentOption === 'auto' ? '#FFF5F5' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name="attachment"
                              value="auto"
                              checked={attachmentOption === 'auto'}
                              onChange={(e) => {
                                setAttachmentOption('auto')
                                setUploadedFile(null)
                              }}
                              style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                              Auto-Generate
                            </span>
                            <p style={{ fontSize: '0.75rem', color: '#717171', margin: '0.25rem 0 0 1.75rem', marginTop: '0.5rem' }}>
                              AI creates a professional 1-pager with your company metrics & market analysis
                            </p>
                          </label>

                          {/* Upload Option */}
                          <label style={{
                            padding: '1rem',
                            border: attachmentOption === 'upload' ? '2px solid #E8312A' : '1px solid #E5E4E0',
                            borderRadius: '0.375rem',
                            background: attachmentOption === 'upload' ? '#FFF5F5' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name="attachment"
                              value="upload"
                              checked={attachmentOption === 'upload'}
                              onChange={(e) => setAttachmentOption('upload')}
                              style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                              Upload Custom
                            </span>
                            <p style={{ fontSize: '0.75rem', color: '#717171', margin: '0.25rem 0 0 1.75rem', marginTop: '0.5rem' }}>
                              Use your own 1-pager or teaser document {uploadedFile && `(${uploadedFile.name})`}
                            </p>
                            {attachmentOption === 'upload' && (
                              <input
                                type="file"
                                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                                style={{ marginTop: '0.5rem', marginLeft: '1.75rem', fontSize: '0.75rem' }}
                              />
                            )}
                          </label>

                          {/* No Attachment Option */}
                          <label style={{
                            padding: '1rem',
                            border: attachmentOption === 'none' ? '2px solid #E8312A' : '1px solid #E5E4E0',
                            borderRadius: '0.375rem',
                            background: attachmentOption === 'none' ? '#FFF5F5' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name="attachment"
                              value="none"
                              checked={attachmentOption === 'none'}
                              onChange={(e) => {
                                setAttachmentOption('none')
                                setUploadedFile(null)
                              }}
                              style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>
                              No Attachment
                            </span>
                            <p style={{ fontSize: '0.75rem', color: '#717171', margin: '0.25rem 0 0 1.75rem', marginTop: '0.5rem' }}>
                              Send without attachment, offer to share 1-pager upon request
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
