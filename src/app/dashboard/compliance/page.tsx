'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle,
  BarChart3, TrendingUp, FileText, Users, Zap, Target,
  ArrowRight, Info, Lock, Eye, CheckSquare, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

/**
 * Compliance Hub - Mission Control Edition
 * Central command center for all regulatory compliance tracking,
 * listing rules validation, and governance requirements
 */

interface ComplianceModule {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'compliant' | 'at-risk' | 'non-compliant' | 'pending'
  progress: number
  completedItems: number
  totalItems: number
  actionItems: number
  href: string
  color: {
    gradient: string
    bg: string
    border: string
  }
}

interface ComplianceSummary {
  overall: number
  compliant: number
  atRisk: number
  nonCompliant: number
  lastUpdated: string
}

const COMPLIANCE_MODULES: ComplianceModule[] = [
  {
    id: 'listing-rules',
    title: 'Listing Rules Validator',
    description: 'Validate compliance against TSX, TSXV, and CSE listing requirements',
    icon: <ShieldCheck className="w-6 h-6" />,
    status: 'compliant',
    progress: 92,
    completedItems: 23,
    totalItems: 25,
    actionItems: 2,
    href: '/dashboard/compliance/listing-rules',
    color: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: '#EAF5F0',
      border: '#2D7A5F'
    }
  },
  {
    id: 'listing-requirements',
    title: 'Listing Requirements Matrix',
    description: 'Track all exchange-specific requirements and documentation checklist',
    icon: <BarChart3 className="w-6 h-6" />,
    status: 'at-risk',
    progress: 68,
    completedItems: 17,
    totalItems: 25,
    actionItems: 5,
    href: '/dashboard/compliance/listing-requirements',
    color: {
      gradient: 'from-amber-500 to-amber-600',
      bg: '#FEF3C7',
      border: '#B45309'
    }
  },
  {
    id: 'consent-letters',
    title: 'Consent Letters & Declarations',
    description: 'Manage director, auditor, and advisor consent letter submissions',
    icon: <FileText className="w-6 h-6" />,
    status: 'at-risk',
    progress: 56,
    completedItems: 14,
    totalItems: 25,
    actionItems: 8,
    href: '/dashboard/compliance/consent-letters',
    color: {
      gradient: 'from-amber-500 to-amber-600',
      bg: '#FEF3C7',
      border: '#B45309'
    }
  },
  {
    id: 'resolutions',
    title: 'Board Resolutions & Governance',
    description: 'Corporate governance approvals and board meeting resolutions',
    icon: <Users className="w-6 h-6" />,
    status: 'pending',
    progress: 44,
    completedItems: 11,
    totalItems: 25,
    actionItems: 12,
    href: '/dashboard/compliance/resolutions',
    color: {
      gradient: 'from-blue-500 to-blue-600',
      bg: '#EFF6FF',
      border: '#1D4ED8'
    }
  },
  {
    id: 'syndication-templates',
    title: 'Syndication Templates & Disclosure',
    description: 'Manage underwriter syndication and public disclosure templates',
    icon: <Eye className="w-6 h-6" />,
    status: 'pending',
    progress: 32,
    completedItems: 8,
    totalItems: 25,
    actionItems: 15,
    href: '/dashboard/compliance/syndication-templates',
    color: {
      gradient: 'from-purple-500 to-purple-600',
      bg: '#F3E8FF',
      border: '#7C3AED'
    }
  }
]

function getStatusConfig(status: ComplianceModule['status']) {
  const configs = {
    compliant: {
      icon: CheckCircle2,
      label: 'Compliant',
      color: 'var(--color-success)',
      bg: 'var(--color-success-soft)',
      textColor: 'var(--color-success-dark)'
    },
    'at-risk': {
      icon: AlertTriangle,
      label: 'At Risk',
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-soft)',
      textColor: 'var(--color-warning-dark)'
    },
    'non-compliant': {
      icon: XCircle,
      label: 'Non-Compliant',
      color: 'var(--color-error)',
      bg: 'var(--color-error-soft)',
      textColor: 'var(--color-error-dark)'
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'var(--color-info)',
      bg: 'var(--color-info-soft)',
      textColor: 'var(--color-info)'
    }
  }
  return configs[status]
}

function ComplianceCard({ module }: { module: ComplianceModule }) {
  const statusConfig = getStatusConfig(module.status)
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card group relative overflow-hidden transition-all hover:shadow-lg border border-slate-200"
    >
      {/* Gradient background accent */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${module.color.gradient} transition-opacity pointer-events-none`} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: module.color.border }}
            >
              {module.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-nav font-semibold text-base leading-snug mb-1">
                {module.title}
              </h3>
              <p className="text-text-muted text-sm line-clamp-2">
                {module.description}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 ml-2"
            style={{ background: statusConfig.bg }}
          >
            <StatusIcon className="w-3.5 h-3.5" style={{ color: statusConfig.color }} />
            <span className="text-xs font-semibold" style={{ color: statusConfig.textColor }}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Progress section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary">
              Progress
            </span>
            <span className="text-xs font-semibold text-text-primary">
              {module.completedItems}/{module.totalItems}
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${module.progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="h-full rounded-full"
              style={{ background: module.color.border }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: 'var(--color-surface-light)' }}>
          <div className="flex-1">
            <p className="text-xs text-text-muted font-medium mb-0.5">Items Completed</p>
            <p className="text-sm font-bold text-text-primary">{module.completedItems}</p>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--color-border)' }} />
          <div className="flex-1">
            <p className="text-xs text-text-muted font-medium mb-0.5">Action Items</p>
            <p className="text-sm font-bold" style={{ color: module.color.border }}>
              {module.actionItems}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={module.href}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-white group/cta"
          style={{ background: module.color.border }}
        >
          Review Details
          <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}

function ComplianceSummaryCard({ summary }: { summary: ComplianceSummary }) {
  const overallColor = summary.overall >= 80 ? 'var(--color-success)'
    : summary.overall >= 60 ? 'var(--color-warning)'
    : 'var(--color-error)'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-8 border border-slate-200"
    >
      <div className="mb-8">
        <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-2">
          Overall Compliance Status
        </p>
        <div className="flex items-end gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={overallColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - summary.overall / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-nav font-black text-2xl">{summary.overall}%</span>
            </div>
          </div>
          <div>
            <p className="text-nav font-black text-3xl mb-1">
              {summary.compliant}/{summary.compliant + summary.atRisk + summary.nonCompliant}
            </p>
            <p className="text-text-muted text-sm font-medium">
              modules compliant
            </p>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        {[
          { label: 'Compliant', value: summary.compliant, color: 'var(--color-success)' },
          { label: 'At Risk', value: summary.atRisk, color: 'var(--color-warning)' },
          { label: 'Non-Compliant', value: summary.nonCompliant, color: 'var(--color-error)' }
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-sm text-text-secondary font-medium">{label}</span>
            </div>
            <span className="text-sm font-bold text-text-primary">{value}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mt-4">
        Last updated {summary.lastUpdated}
      </p>
    </motion.div>
  )
}

function AlertBanner({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'critical' }) {
  const configs = {
    info: { bg: 'var(--color-info-soft)', border: 'var(--color-info)', icon: Info },
    warning: { bg: 'var(--color-warning-soft)', border: 'var(--color-warning)', icon: AlertTriangle },
    critical: { bg: 'var(--color-error-soft)', border: 'var(--color-error)', icon: AlertCircle }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border-l-4 flex items-start gap-3"
      style={{ background: config.bg, borderColor: config.border }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.border }} />
      <div className="text-sm flex-1" style={{ color: 'var(--color-text-primary)' }}>
        {children}
      </div>
    </motion.div>
  )
}

function QuickAccessPanel() {
  const actions = [
    { icon: CheckSquare, label: 'Review Listing Rules', href: '/dashboard/compliance/listing-rules' },
    { icon: FileText, label: 'Submit Consents', href: '/dashboard/compliance/consent-letters' },
    { icon: Users, label: 'Board Resolutions', href: '/dashboard/compliance/resolutions' },
    { icon: Eye, label: 'Syndication Setup', href: '/dashboard/compliance/syndication-templates' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 border border-slate-200"
    >
      <h3 className="text-nav font-semibold text-base mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
        Quick Access
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-center group"
          >
            <Icon className="w-5 h-5 mx-auto mb-2 text-text-secondary group-hover:text-text-primary transition-colors" />
            <p className="text-xs font-semibold text-text-primary group-hover:text-text-primary">
              {label}
            </p>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

export default function CompliancePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [summaryData] = useState<ComplianceSummary>({
    overall: 65,
    compliant: 1,
    atRisk: 2,
    nonCompliant: 0,
    lastUpdated: 'Today at 2:45 PM'
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-nav font-black text-3xl mb-2 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            Compliance Mission Control
          </h1>
          <p className="text-text-secondary text-base">
            Monitor all regulatory requirements, listing rules, and governance compliance
          </p>
        </div>
      </div>

      {/* Critical alerts */}
      {summaryData.nonCompliant > 0 && (
        <AlertBanner type="critical">
          <strong>Immediate Action Required:</strong> {summaryData.nonCompliant} critical compliance item(s) need attention
        </AlertBanner>
      )}

      {summaryData.atRisk > 0 && (
        <AlertBanner type="warning">
          <strong>At Risk:</strong> {summaryData.atRisk} compliance area(s) approaching deadline
        </AlertBanner>
      )}

      {/* Summary and quick access grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComplianceSummaryCard summary={summaryData} />
        </div>
        <div>
          <QuickAccessPanel />
        </div>
      </div>

      {/* Main compliance modules grid */}
      <div>
        <h2 className="text-nav font-bold text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          Compliance Modules
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {COMPLIANCE_MODULES.map(module => (
            <ComplianceCard key={module.id} module={module} />
          ))}
        </div>
      </div>

      {/* Documentation & Resources section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 border border-slate-200 rounded-lg"
      >
        <h3 className="text-nav font-semibold text-base mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          Documentation & Resources
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: 'TSX Listing Manual', desc: 'Official TSX listing requirements' },
            { label: 'TSXV Policies', desc: 'TSXV-specific policies and procedures' },
            { label: 'CSE Rules', desc: 'Canadian Securities Exchange rules' },
            { label: 'SEC Regulations', desc: 'US securities regulations (if applicable)' }
          ].map(({ label, desc }) => (
            <a
              key={label}
              href="#"
              className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
              <p className="text-xs text-text-muted">{desc}</p>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
