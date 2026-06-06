'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  CheckCircle2, AlertCircle, TrendingUp, Users, BarChart3, DollarSign,
  Clock, FileText, Zap, Target, Shield, Scale, Award, Activity,
  ChevronRight, Eye, Lock, Briefcase, Database, Cpu, BookOpen,
  GitBranch, AlertOctagon, Layers
} from 'lucide-react'

export default function ListedServicesPage() {
  const { data: session } = useSession()
  const companyName = 'TechCorp Inc.'
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)

  // Core defensible features
  const defendableFeatures = [
    {
      id: 'exchange-engine',
      name: 'Exchange Compliance Engine',
      icon: Layers,
      patent: 'Multi-jurisdiction regulatory abstraction layer',
      value: 'Single workflow handles 90+ exchanges with jurisdiction-specific rules',
      colors: { bg: '#EFF6FF', border: '#BFDBFE', accent: '#3B82F6' },
      capabilities: [
        '• Automatic requirement mapping (TSX, NASDAQ, NYSE, TSXV, CSE, OTC, ASX, SGX, HKEX, etc.)',
        '• Real-time regulatory updates across jurisdictions',
        '• Compliance task automation by exchange',
        '• Deadline prediction based on company event triggers',
        '• Cross-jurisdiction conflict resolution'
      ]
    },
    {
      id: 'materiality-ai',
      name: 'Real-time Materiality Analyzer',
      icon: Brain,
      patent: 'Context-aware materiality determination system',
      value: 'AI understands what\'s material for YOUR company (legal, financial, strategic)',
      colors: { bg: '#FEF3C7', border: '#FCD34D', accent: '#F59E0B' },
      capabilities: [
        '• Analyzes against: company size, jurisdiction, recent transactions, cap table',
        '• Learns from board minutes, financial position, investor base',
        '• Compares to peer materiality thresholds',
        '• Flags gray areas for general counsel review',
        '• Tracks disclosure timing requirements automatically'
      ]
    },
    {
      id: 'unified-data',
      name: 'Unified Company Data Model',
      icon: Database,
      patent: 'Normalized, connected data architecture',
      value: 'Single source of truth: filings + board + cap table + financials + insiders + institutional',
      colors: { bg: '#ECFDF5', border: '#86EFAC', accent: '#22C55E' },
      capabilities: [
        '• Auto-syncs: ERP, board software, legal tracking, HR, investor platforms',
        '• All data versioned and traceable to source',
        '• Relational integrity checking (cap table ↔ filings ↔ insider trades)',
        '• Real-time data freshness indicators',
        '• Built-in reconciliation for audits'
      ]
    },
    {
      id: 'resolution-gen',
      name: 'Intelligent Resolution Generator',
      icon: FileText,
      patent: 'Board resolution generation with governance validation',
      value: 'AI drafts compliant resolutions in 2 minutes vs. 2 hours of legal work',
      colors: { bg: '#F3E8FF', border: '#D8B4FE', accent: '#8B5CF6' },
      capabilities: [
        '• Validates against current governance framework',
        '• Checks SOX, audit, independence requirements',
        '• Generates proper legal language by jurisdiction',
        '• Cross-references prior board decisions',
        '• Flags required shareholder approvals',
        '• Integrates with agenda/voting system'
      ]
    },
    {
      id: 'material-detection',
      name: 'Automated Material Event Detection',
      icon: AlertOctagon,
      patent: 'Continuous event monitoring and disclosure triggering',
      value: 'Never miss a disclosure obligation - system monitors 47 trigger events',
      colors: { bg: '#FEF2F2', border: '#FECACA', accent: '#EF4444' },
      capabilities: [
        '• Monitors: board decisions, exec changes, customer wins/losses, financing, litigation',
        '• Tracks regulatory filings, market data, press releases',
        '• Calculates quantitative thresholds (10% revenue, >$5M, etc.)',
        '• Integrates with board minutes, CRM, legal system',
        '• Drafts preliminary disclosure for counsel review',
        '• Manages disclosure timing requirements'
      ]
    },
    {
      id: 'continuous-audit',
      name: 'Continuous Audit-Ready Framework',
      icon: CheckCircle2,
      patent: 'Always-current SOX/ICFR evidence collection',
      value: 'No year-end audit scramble - evidence gathered 365 days/year',
      colors: { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A' },
      capabilities: [
        '• Maintains evidence library for SOX/ICFR controls',
        '• Tracks control testing throughout year',
        '• Documents walkthrough evidence',
        '• Manages deficiency remediation',
        '• Integrates with auditor (read-only access)',
        '• Automates audit request workflows',
        '• Tracks audit committee meeting minutes'
      ]
    }
  ]

  // Data integration map
  const dataIntegrations = [
    { system: 'ERP (NetSuite, SAP, Oracle)', icon: Database, value: 'Revenue, expense, headcount' },
    { system: 'Board Management (Nasdaq Directo)', icon: Users, value: 'Decisions, minutes, approvals' },
    { system: 'Legal Tracking (Logikcull, Relativity)', icon: Scale, value: 'Litigation, contracts, regulatory' },
    { system: 'HR Systems (Workday, SuccessFactors)', icon: Users, value: 'Org changes, compensation' },
    { system: 'Investor Relations (Datasite)', icon: Eye, value: 'Institutional holdings, analyst' },
    { system: 'Financial Reporting (Anaplan)', icon: BarChart3, value: 'Forecasts, actuals, reports' },
    { system: 'Capital Structure (Cap table software)', icon: PieChart, value: 'Equity, options, warrants' },
    { system: 'SEDAR/SEC', icon: FileText, value: 'Public filings, regulatory data' },
  ]

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-0 py-8">

        {/* Header - Strategic Positioning */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="serif text-3xl sm:text-4xl text-nav mb-2">Listed Services OS</h1>
          <p className="text-lg text-text-muted mb-4">The AI Operating System for Public Companies</p>
          <div className="flex flex-wrap gap-3">
            <span style={{ background: '#EFF6FF', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#1D4ED8' }}>
              ✓ 99.9% Uptime SLA
            </span>
            <span style={{ background: '#F0FDF4', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#16A34A' }}>
              ✓ Enterprise Security (SOC 2)
            </span>
            <span style={{ background: '#ECFDF5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#059669' }}>
              ✓ Real-time Data Syncing
            </span>
          </div>
        </motion.div>

        {/* Defensible Features - The Moat */}
        <div className="space-y-4">
          <div>
            <h2 className="serif text-2xl text-nav mb-2">Defensible Architecture</h2>
            <p className="text-text-muted text-sm mb-6">Patent-pending technologies that are difficult to replicate:</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {defendableFeatures.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setExpandedWidget(expandedWidget === feature.id ? null : feature.id)}
                  style={{
                    background: feature.colors.bg,
                    border: `2px solid ${feature.colors.border}`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  className="hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-6 h-6" style={{ color: feature.colors.accent }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: feature.colors.accent, textTransform: 'uppercase' }}>
                      Patent-Pending
                    </span>
                  </div>
                  <h3 className="font-bold text-nav mb-2">{feature.name}</h3>
                  <p className="text-sm text-text-muted mb-3">{feature.value}</p>

                  {expandedWidget === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: feature.colors.border }}
                    >
                      <p style={{ fontSize: '11px', fontWeight: '600', color: feature.colors.accent, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Key Capabilities:
                      </p>
                      <div className="space-y-2">
                        {feature.capabilities.map((cap, j) => (
                          <p key={j} style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                            {cap}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Data Architecture - Trust & Seamlessness */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'white',
            border: '1px solid #E5E4E0',
            borderRadius: '16px',
            padding: '28px'
          }}
        >
          <h2 className="serif text-2xl text-nav mb-2 flex items-center gap-2">
            <Database className="w-6 h-6" style={{ color: '#E8312A' }} />
            Unified Data Architecture
          </h2>
          <p className="text-text-muted text-sm mb-6">Real-time integration with 8+ enterprise systems creates a single source of truth</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {dataIntegrations.map((integration, i) => {
              const Icon = integration.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  style={{
                    background: '#FAFAFA',
                    border: '1px solid #E5E4E0',
                    borderRadius: '10px',
                    padding: '16px'
                  }}
                  className="hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-nav mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-nav">{integration.system}</p>
                      <p className="text-xs text-text-muted mt-1">{integration.value}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Data Trust Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Data Provenance', desc: 'Every number shows its source (filing, report, system)' },
              { label: 'Version Control', desc: 'Complete audit trail on all document changes' },
              { label: 'Validation Rules', desc: 'Automatic cross-system reconciliation checks' }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '10px',
                  padding: '16px'
                }}
              >
                <p className="font-medium text-sm text-nav mb-1">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Core Dashboard Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="serif text-2xl text-nav mb-4">Command Center</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Compliance Health', value: '87%', change: '+3%', icon: Shield, color: '#22C55E' },
              { label: 'Governance Score', value: '92%', change: '+2%', icon: CheckCircle2, color: '#3B82F6' },
              { label: 'Filing Readiness', value: '78%', change: '-5%', icon: FileText, color: '#F59E0B' },
              { label: 'Investor Sentiment', value: '7.2/10', change: '+0.3', icon: TrendingUp, color: '#8B5CF6' },
            ].map((widget, i) => {
              const Icon = widget.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  style={{
                    background: 'white',
                    border: '1px solid #E5E4E0',
                    borderRadius: '16px',
                    padding: '20px',
                  }}
                  className="hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-5 h-5" style={{ color: widget.color }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: widget.color }}>
                      {widget.change}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mb-2">{widget.label}</p>
                  <p className="serif text-2xl font-bold text-nav">{widget.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Agents - The Intelligence Layer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{
            background: '#1A1A1A',
            color: 'white',
            borderRadius: '16px',
            padding: '28px'
          }}
        >
          <h2 className="serif text-2xl font-bold mb-2 flex items-center gap-2">
            <Cpu className="w-6 h-6" style={{ color: '#E8312A' }} />
            AI Agent Council
          </h2>
          <p className="text-gray-400 text-sm mb-6">Specialized agents with company context collaborate to surface risks, recommend actions, and automate decisions</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { agent: 'AI CFO', knows: 'Financials, funding, cash flow, treasury' },
              { agent: 'AI General Counsel', knows: 'Contracts, litigation, compliance, SEC/regulatory' },
              { agent: 'AI Governance Officer', knows: 'Board decisions, resolutions, corporate records' },
              { agent: 'AI IR Advisor', knows: 'Investors, analysts, market sentiment, shareholder base' },
              { agent: 'AI Audit Partner', knows: 'SOX/ICFR controls, audit evidence, deficiencies' }
            ].map((ai, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.05 }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <p className="font-semibold mb-2">{ai.agent}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{ai.knows}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
