'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Eye, Users, AlertCircle, ChevronRight, Brain,
  TrendingUp, Globe, Send, Search, Bell, FileText, Shield, Zap
} from 'lucide-react'

export default function ListedServicesPage() {
  const [activeFeature, setActiveFeature] = useState('board-resolutions')
  const [complianceQuery, setComplianceQuery] = useState('')
  const [complianceResponse, setComplianceResponse] = useState<string | null>(null)

  const features = {
    'board-resolutions': {
      name: 'Board Resolutions',
      description: 'AI-powered board governance framework for post-listed companies',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '28px' }}>
            <h3 className="font-bold text-nav mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" style={{ color: '#E8312A' }} />
              AI Board Resolution Generator
            </h3>
            <p className="text-text-muted text-sm mb-6">
              Generate properly formatted board resolutions with automatic compliance checks against your jurisdiction and listing requirements.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Director Appointment', desc: 'Generate resolutions for board additions with independence validation' },
                { title: 'Audit Committee Charter', desc: 'Ensure ICFR and SOX compliance in governance documents' },
                { title: 'Executive Compensation', desc: 'Stock option plans, ESOP setup with regulatory alignment' },
                { title: 'Related Party Transactions', desc: 'Board approval workflows with disclosure requirements' }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-text-muted flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-nav">{item.title}</p>
                    <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    'compliance-guardrails': {
      name: 'Compliance Guardrails',
      description: 'Real-time decision-making framework for CEOs and CFOs',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '28px' }}>
            <h3 className="font-bold text-nav mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#E8312A' }} />
              Ask Compliance
            </h3>
            <p className="text-text-muted text-sm mb-6">
              Ask your AI compliance advisor if actions are permitted, require board approval, or trigger disclosure obligations.
            </p>

            <div className="mb-6">
              <textarea
                value={complianceQuery}
                onChange={(e) => setComplianceQuery(e.target.value)}
                placeholder="Example: Can we negotiate a material customer contract without board approval? What if it's for $5M+ annual spend?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #E5E4E0',
                  borderRadius: '10px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  color: '#1A1A1A'
                }}
              />
              <button
                onClick={() => setComplianceResponse('Board approval required for contracts >$5M annual value. This triggers SOX materiality review. Recommend audit committee pre-approval before CEO signature.')}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#1A1A1A' }}
              >
                <Send className="w-4 h-4" />
                Ask Advisor
              </button>
            </div>

            {complianceResponse && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '16px'
                }}
              >
                <p style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.6' }}>
                  <strong>Compliance Guidance:</strong> {complianceResponse}
                </p>
              </motion.div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Common Scenarios</p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Material acquisition (>20% revenue impact)',
                  'Executive departure & severance >$2M',
                  'Related party transactions',
                  'Dividend policy changes',
                  'Major debt refinancing'
                ].map((scenario, i) => (
                  <button
                    key={i}
                    onClick={() => setComplianceQuery(scenario)}
                    className="text-left p-3 border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <p className="text-sm text-nav">{scenario}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    'market-watcher': {
      name: 'Market Watcher',
      description: 'Monitor companies filing or going public for threats, partners, and opportunities',
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '28px' }}>
            <h3 className="font-bold text-nav mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" style={{ color: '#E8312A' }} />
              Track Market Activity
            </h3>
            <p className="text-text-muted text-sm mb-6">
              Real-time alerts on companies filing for IPO, RTO, or major capital raises in your sector.
            </p>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search companies or sectors... (e.g., 'SaaS', 'AI', or company names)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E4E0',
                  borderRadius: '10px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  color: '#1A1A1A'
                }}
              />
            </div>

            <div className="space-y-3">
              {[
                {
                  type: 'threat',
                  company: 'CloudScale Analytics',
                  event: 'Filed S-1 for IPO',
                  detail: 'Direct competitor in data infrastructure',
                  color: '#FCA5A5'
                },
                {
                  type: 'opportunity',
                  company: 'DataFlow Systems',
                  event: 'Raised $200M Series D',
                  detail: 'Potential partner for API integration',
                  color: '#86EFAC'
                },
                {
                  type: 'neutral',
                  company: 'Enterprise AI Corp',
                  event: 'Filed for RTO',
                  detail: 'Different market segment, adjacent tech',
                  color: '#BFDBFE'
                }
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    border: `2px solid ${item.color}`,
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                  className="hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-sm text-nav">{item.company}</p>
                      <p className="text-xs text-text-muted mt-1">{item.event}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: item.color.replace('A5', '700'), textTransform: 'uppercase' }}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Alert Settings</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                  <span className="text-sm text-nav">IPO filings in my sector</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                  <span className="text-sm text-nav">RTO announcements</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                  <span className="text-sm text-nav">M&A activity (competitors acquiring)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  const activeData = features[activeFeature as keyof typeof features]

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0 py-8">

        {/* Header */}
        <div>
          <h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Listed Services</h1>
          <p className="text-text-muted text-sm">AI-powered tools for post-IPO governance, compliance, and market intelligence</p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(features).map(([key, data]) => {
            const Icon = data.icon
            return (
              <button
                key={key}
                onClick={() => setActiveFeature(key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeFeature === key
                    ? 'text-white'
                    : 'text-text-primary'
                }`}
                style={{
                  background: activeFeature === key ? '#1A1A1A' : 'white',
                  border: '1px solid #E5E4E0'
                }}
              >
                <Icon className="w-4 h-4" />
                {data.name}
              </button>
            )
          })}
        </div>

        {/* Feature Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
              <h2 className="serif text-2xl text-nav mb-2">{activeData.name}</h2>
              <p className="text-text-muted text-sm mb-6">{activeData.description}</p>
            </div>

            {activeData.content}
          </motion.div>
        </AnimatePresence>

        {/* Info Section */}
        <div style={{ background: 'white', border: '1px solid #E5E4E0', borderRadius: '16px', padding: '24px' }}>
          <h3 className="font-semibold text-nav mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" style={{ color: '#E8312A' }} />
            System Reliability
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Listed Services maintains 99.9% uptime SLA with redundant infrastructure and real-time monitoring.
          </p>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E' }} />
            <span className="text-sm font-medium text-nav">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
