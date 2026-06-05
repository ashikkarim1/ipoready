'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, ExternalLink, Download, Share2, Zap,
  Users, FileText, TrendingUp, Calendar, AlertCircle, CheckCircle2,
  ArrowRight, Lock, MapPin, Briefcase
} from 'lucide-react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface Deliverable {
  id: string
  name: string
  status: 'not_started' | 'in_progress' | 'completed'
  documentLink?: string
  category: string
}

interface RACIRole {
  name: string
  responsible?: string
  accountable?: string
  consulted?: string
  informed?: string
}

interface Milestone {
  name: string
  dueDate?: string
  status: 'not_started' | 'in_progress' | 'completed'
}

interface Risk {
  description: string
  mitigation: string
}

interface ResourceLink {
  title: string
  url: string
  description: string
}

interface IPOPhase {
  id: string
  order: number
  name: string
  description: string
  durationDays: number
  currentStatus: 'not_started' | 'in_progress' | 'completed'
  progressPercent: number
  deliverables: Deliverable[]
  raci: RACIRole[]
  dependencies: string[]
  risks: Risk[]
  milestones: Milestone[]
  resourceLinks: ResourceLink[]
  criticalActions: string[]
  icon: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE DATA
// ─────────────────────────────────────────────────────────────────────────────

const PHASES: IPOPhase[] = [
  {
    id: 'phase-1',
    order: 1,
    name: 'Preparation',
    description: 'Assemble your advisory team and assess financial readiness for the IPO journey.',
    durationDays: 30,
    currentStatus: 'completed',
    progressPercent: 100,
    deliverables: [
      { id: 'd1-1', name: 'PIF Applications (Personal Information Forms)', status: 'completed', category: 'Governance', documentLink: '/documents' },
      { id: 'd1-2', name: 'Director & Officer Biographies', status: 'completed', category: 'Governance', documentLink: '/documents' },
      { id: 'd1-3', name: 'Team Engagement Letters', status: 'completed', category: 'Legal', documentLink: '/documents' },
      { id: 'd1-4', name: 'Financial Readiness Report', status: 'completed', category: 'Finance', documentLink: '/documents' },
    ],
    raci: [
      { name: 'CEO', responsible: 'CEO', accountable: 'Board', consulted: 'CFO', informed: 'Team' },
      { name: 'Board', responsible: 'Board Chair', accountable: 'Board', consulted: 'Legal', informed: 'All Officers' },
      { name: 'Legal Counsel', responsible: 'General Counsel', accountable: 'CEO', consulted: 'Advisors', informed: 'Board' },
    ],
    dependencies: [],
    risks: [
      { description: 'Advisor availability delays team assembly', mitigation: 'Identify backup advisors early; book 90 days in advance' },
      { description: 'Incomplete financial records slow readiness assessment', mitigation: 'Conduct accounting cleanup in parallel; use auditus.ai' },
    ],
    milestones: [
      { name: 'Advisors Assembled', dueDate: '2026-06-15', status: 'completed' },
      { name: 'Financial Readiness Confirmed', dueDate: '2026-07-05', status: 'in_progress' },
    ],
    resourceLinks: [
      { title: 'IPOReady Advisor Checklist', url: '/checklist', description: 'Step-by-step tasks to assemble your team' },
      { title: 'auditus.ai — Pre-Audit Preparation', url: 'https://auditus.ai', description: 'Prepare your financials for audit engagement' },
      { title: 'TSXV Policies 1.1 & 3.3', url: '#', description: 'Exchange requirements for directors and advisors' },
    ],
    criticalActions: [
      'Appoint CEO, CFO, and General Counsel if not yet in place',
      'Identify and engage independent legal counsel',
      'Secure commitments from at least 3 independent directors',
      'Engage Big 4 or TSXV-experienced auditor',
    ],
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'phase-2',
    order: 2,
    name: 'Foundation',
    description: 'Establish proper corporate structure, governance, and executive compensation.',
    durationDays: 60,
    currentStatus: 'in_progress',
    progressPercent: 43,
    deliverables: [
      { id: 'd2-1', name: 'Articles of Incorporation / Amendment', status: 'completed', category: 'Legal' },
      { id: 'd2-2', name: 'Bylaws & Corporate Policies', status: 'completed', category: 'Governance' },
      { id: 'd2-3', name: 'Director Independence Certifications', status: 'in_progress', category: 'Governance' },
      { id: 'd2-4', name: 'Audit Committee Charter', status: 'in_progress', category: 'Governance' },
      { id: 'd2-5', name: 'Stock Option Plan (ESOP)', status: 'not_started', category: 'Compensation' },
      { id: 'd2-6', name: 'Executive Compensation Policy', status: 'in_progress', category: 'Compensation' },
      { id: 'd2-7', name: 'Insider Trading Policy', status: 'not_started', category: 'Compliance' },
    ],
    raci: [
      { name: 'Legal Counsel', responsible: 'General Counsel', accountable: 'CEO', consulted: 'Board', informed: 'All Staff' },
      { name: 'CEO', responsible: 'CEO', accountable: 'Board', consulted: 'CFO', informed: 'Leadership' },
      { name: 'CFO', responsible: 'CFO', accountable: 'CEO', consulted: 'Auditor', informed: 'Board' },
    ],
    dependencies: ['phase-1'],
    risks: [
      { description: 'Director appointments delayed if independence criteria not met', mitigation: 'Review TSXV independence rules early; source candidates now' },
      { description: 'ESOP plan complexity causes implementation delays', mitigation: 'Use template from counsel; leverage auditor guidance' },
    ],
    milestones: [
      { name: 'Governance Policies Adopted', dueDate: '2026-07-20', status: 'in_progress' },
      { name: 'Second Independent Director Appointed', dueDate: '2026-07-15', status: 'in_progress' },
    ],
    resourceLinks: [
      { title: 'TSXV Policy 3.2 — Board Composition', url: '#', description: 'Independence and competency requirements' },
      { title: 'NI 52-110 — Audit Committees', url: '#', description: 'Mandatory audit committee structure and charter' },
      { title: 'IPOReady Corporate Governance Template', url: '/templates', description: 'Ready-to-customize policies' },
    ],
    criticalActions: [
      'Appoint second independent director (TSXV requirement)',
      'Adopt Audit Committee Charter per NI 52-110',
      'Establish Stock Option Plan and reserve shares',
      'File SEDI insider registrations for all officers',
    ],
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: 'phase-3',
    order: 3,
    name: 'Financial Preparation',
    description: 'Conduct full audit, restate financials if needed, and plan tax strategy.',
    durationDays: 60,
    currentStatus: 'in_progress',
    progressPercent: 0,
    deliverables: [
      { id: 'd3-1', name: 'Audited Financial Statements (2 years)', status: 'not_started', category: 'Finance' },
      { id: 'd3-2', name: 'MD&A (Management Discussion & Analysis)', status: 'not_started', category: 'Finance' },
      { id: 'd3-3', name: 'Tax Opinion Letter', status: 'not_started', category: 'Tax' },
      { id: 'd3-4', name: 'Financial Restatement (if applicable)', status: 'not_started', category: 'Finance' },
      { id: 'd3-5', name: 'IFRS Conversion Audit', status: 'not_started', category: 'Finance' },
    ],
    raci: [
      { name: 'CFO', responsible: 'CFO', accountable: 'CEO', consulted: 'Auditor', informed: 'Board' },
      { name: 'Auditor', responsible: 'Lead Auditor', accountable: 'CFO', consulted: 'Legal', informed: 'Board' },
      { name: 'Tax Counsel', responsible: 'Tax Partner', accountable: 'CFO', consulted: 'Auditor', informed: 'CEO' },
    ],
    dependencies: ['phase-2'],
    risks: [
      { description: 'Material weaknesses in controls discovered during audit', mitigation: 'Conduct pre-audit assessment; remediate early using auditus.ai' },
      { description: 'IFRS conversion uncovers accounting issues', mitigation: 'Engage restatement specialist early; budget 6-8 weeks' },
      { description: 'Related-party transactions require disclosure', mitigation: 'Document all related-party dealings; obtain tax counsel opinion' },
    ],
    milestones: [
      { name: 'Auditors Engaged & Pre-Audit Complete', dueDate: '2026-06-01', status: 'completed' },
      { name: 'Interim Financial Statements Reviewed', dueDate: '2026-08-15', status: 'not_started' },
      { name: 'Audited Financials Delivered', dueDate: '2026-09-15', status: 'not_started' },
    ],
    resourceLinks: [
      { title: 'auditus.ai — Pre-Audit Readiness', url: 'https://auditus.ai', description: 'Reduce audit fees by 20-40% with pre-audit preparation' },
      { title: 'IFRS vs GAAP Conversion Guide', url: '#', description: 'Key differences and conversion timeline' },
      { title: 'IPOReady Financial Checklist', url: '/checklist', description: 'All financial preparation tasks and deliverables' },
    ],
    criticalActions: [
      'Finalize engagement with CPAB-registered auditor',
      'Complete internal control assessment and gap remediation',
      'Prepare 2 years of audited financial statements per IFRS',
      'Engage tax counsel for tax opinion and planning',
    ],
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'phase-4',
    order: 4,
    name: 'Documentation',
    description: 'Draft prospectus, legal opinions, and disclosure documents.',
    durationDays: 60,
    currentStatus: 'not_started',
    progressPercent: 0,
    deliverables: [
      { id: 'd4-1', name: 'Prospectus (Preliminary & Final)', status: 'not_started', category: 'Legal' },
      { id: 'd4-2', name: 'Legal Opinions (various)', status: 'not_started', category: 'Legal' },
      { id: 'd4-3', name: 'Risk Factors Analysis', status: 'not_started', category: 'Legal' },
      { id: 'd4-4', name: 'Material Contracts Review', status: 'not_started', category: 'Legal' },
      { id: 'd4-5', name: 'Corporate Structure Diagram', status: 'not_started', category: 'Documentation' },
      { id: 'd4-6', name: 'Related-Party Transaction Schedule', status: 'not_started', category: 'Legal' },
    ],
    raci: [
      { name: 'Securities Counsel', responsible: 'Lead Counsel', accountable: 'CEO', consulted: 'All Advisors', informed: 'Board' },
      { name: 'CEO', responsible: 'CEO', accountable: 'Board', consulted: 'Counsel', informed: 'Team' },
      { name: 'CFO', responsible: 'CFO', accountable: 'CEO', consulted: 'Counsel', informed: 'Finance' },
    ],
    dependencies: ['phase-3'],
    risks: [
      { description: 'Prospectus drafting takes longer than expected', mitigation: 'Start drafting while audits complete; use prospectus builder tool' },
      { description: 'Undisclosed related-party transactions emerge', mitigation: 'Conduct full company-wide transaction review; document findings' },
      { description: 'Material contracts require renegotiation', mitigation: 'Review all material contracts early; flag renegotiation needs' },
    ],
    milestones: [
      { name: 'Preliminary Prospectus Submitted', dueDate: '2026-10-01', status: 'not_started' },
      { name: 'SEC/Exchange Comments Received', dueDate: '2026-10-30', status: 'not_started' },
    ],
    resourceLinks: [
      { title: 'IPOReady Prospectus Builder', url: '/prospectus', description: 'AI-powered tool to draft prospectus sections' },
      { title: 'TSXV Listing Manual', url: '#', description: 'Disclosure requirements and prospectus format' },
      { title: 'Risk Factor Library', url: '#', description: 'Common risk factors and disclosure templates' },
    ],
    criticalActions: [
      'Engage securities counsel for prospectus drafting',
      'Begin MD&A and business description drafting',
      'Review all material contracts for disclosure',
      'Document capitalization table and shareholder roster',
    ],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'phase-5',
    order: 5,
    name: 'Regulatory Review',
    description: 'File with exchange, respond to comments, prepare for final approval.',
    durationDays: 60,
    currentStatus: 'not_started',
    progressPercent: 0,
    deliverables: [
      { id: 'd5-1', name: 'Formal Exchange Filing (Prospectus)', status: 'not_started', category: 'Regulatory' },
      { id: 'd5-2', name: 'Comment Responses (CEMAs)', status: 'not_started', category: 'Regulatory' },
      { id: 'd5-3', name: 'Final Prospectus', status: 'not_started', category: 'Regulatory' },
      { id: 'd5-4', name: 'FINAL Receipt', status: 'not_started', category: 'Regulatory' },
      { id: 'd5-5', name: 'Exchange Pre-Filing Meeting Notes', status: 'not_started', category: 'Documentation' },
    ],
    raci: [
      { name: 'Securities Counsel', responsible: 'Lead Counsel', accountable: 'CEO', consulted: 'Exchange', informed: 'Board' },
      { name: 'Company', responsible: 'CEO/CFO', accountable: 'CEO', consulted: 'Counsel', informed: 'Board' },
      { name: 'Exchange', responsible: 'Reviewer', accountable: 'Exchange', consulted: 'Company', informed: 'Public' },
    ],
    dependencies: ['phase-4'],
    risks: [
      { description: 'Exchange issues substantial comments requiring rewrites', mitigation: 'Schedule pre-filing meetings; understand reviewer concerns early' },
      { description: 'Comment response cycle extends timeline', mitigation: 'Maintain comment log; respond comprehensively to all issues' },
      { description: 'Final prospectus differs from preliminary; requires re-filing', mitigation: 'Work closely with exchange; validate each submission' },
    ],
    milestones: [
      { name: 'FINAL Receipt Obtained', dueDate: '2026-11-15', status: 'not_started' },
      { name: 'Ready for Roadshow', dueDate: '2026-11-20', status: 'not_started' },
    ],
    resourceLinks: [
      { title: 'TSXV Listing Checklist', url: '#', description: 'All required filings and documents' },
      { title: 'Comment Response Best Practices', url: '#', description: 'How to address exchange reviewer comments' },
      { title: 'Exchange Pre-Filing Meeting Guide', url: '#', description: 'Preparing for your initial exchange meeting' },
    ],
    criticalActions: [
      'Schedule formal pre-filing meeting with exchange',
      'File preliminary prospectus with all required exhibits',
      'Respond to all exchange comments within 15 days',
      'Prepare final prospectus for approval and printing',
    ],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'phase-6',
    order: 6,
    name: 'Roadshow & Marketing',
    description: 'Execute investor roadshow, secure commitments, build analyst relations.',
    durationDays: 60,
    currentStatus: 'not_started',
    progressPercent: 0,
    deliverables: [
      { id: 'd6-1', name: 'Roadshow Presentation Deck', status: 'not_started', category: 'Marketing' },
      { id: 'd6-2', name: 'Investor Targeting List (200-300 names)', status: 'not_started', category: 'Marketing' },
      { id: 'd6-3', name: 'Investor One-Pagers & Materials', status: 'not_started', category: 'Marketing' },
      { id: 'd6-4', name: 'Analyst Briefing Schedule', status: 'not_started', category: 'IR' },
      { id: 'd6-5', name: 'Media Outreach & Press Releases', status: 'not_started', category: 'Marketing' },
      { id: 'd6-6', name: 'Investor Commitment Summary', status: 'not_started', category: 'Marketing' },
    ],
    raci: [
      { name: 'IR / Underwriters', responsible: 'IR Manager / Underwriter', accountable: 'CEO', consulted: 'Advisors', informed: 'Board' },
      { name: 'CEO / CFO', responsible: 'CEO/CFO', accountable: 'CEO', consulted: 'IR', informed: 'Team' },
      { name: 'Investors', responsible: 'Investor', accountable: 'Self', consulted: 'Advisors', informed: 'Market' },
    ],
    dependencies: ['phase-5'],
    risks: [
      { description: 'Weak investor demand impacts valuation', mitigation: 'Build strong investor narrative early; engage underwriter for positioning' },
      { description: 'Roadshow logistics delays investor meetings', mitigation: 'Secure investor commitments before formal roadshow; use virtual + in-person hybrid' },
      { description: 'Market conditions deteriorate mid-roadshow', mitigation: 'Maintain flexibility in pricing; be prepared to adjust timeline' },
    ],
    milestones: [
      { name: 'Roadshow Begins', dueDate: '2026-11-25', status: 'not_started' },
      { name: 'Target Commitments Secured', dueDate: '2026-12-10', status: 'not_started' },
    ],
    resourceLinks: [
      { title: 'IPOReady Pitch Deck Template', url: '#', description: 'Investor presentation framework and best practices' },
      { title: 'Investor Relations 101', url: '#', description: 'Building relationships with institutional investors' },
      { title: 'Media Relations Playbook', url: '#', description: 'Press release timing and media outreach strategy' },
    ],
    criticalActions: [
      'Assemble underwriter team and investor relations advisors',
      'Create compelling roadshow presentation (15-20 slides)',
      'Build target investor list (200-300 institutional investors)',
      'Schedule investor meetings and media briefings',
    ],
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    id: 'phase-7',
    order: 7,
    name: 'Listing Execution',
    description: 'Final pricing, stock allocation, and trading commencement.',
    durationDays: 30,
    currentStatus: 'not_started',
    progressPercent: 0,
    deliverables: [
      { id: 'd7-1', name: 'Final Pricing Confirmation', status: 'not_started', category: 'Underwriting' },
      { id: 'd7-2', name: 'Stock Allocation Schedule', status: 'not_started', category: 'Underwriting' },
      { id: 'd7-3', name: 'Trading Commencement Confirmation', status: 'not_started', category: 'Regulatory' },
      { id: 'd7-4', name: 'IPO Circular & Stock Certificates', status: 'not_started', category: 'Documentation' },
      { id: 'd7-5', name: 'Underwriter Settlement Documents', status: 'not_started', category: 'Legal' },
    ],
    raci: [
      { name: 'Underwriters', responsible: 'Lead Underwriter', accountable: 'Underwriter', consulted: 'Company', informed: 'Public' },
      { name: 'Company', responsible: 'CEO/CFO', accountable: 'CEO', consulted: 'Underwriter', informed: 'Board' },
      { name: 'Exchange', responsible: 'Listing Authority', accountable: 'Exchange', consulted: 'Company', informed: 'Public' },
    ],
    dependencies: ['phase-6'],
    risks: [
      { description: 'Final pricing significantly below target range', mitigation: 'Maintain communication with underwriter; understand market conditions' },
      { description: 'Technical issues delay trading commencement', mitigation: 'Exchange conducts full testing; backup systems ready' },
      { description: 'Settlement issues block fund transfers', mitigation: 'Clear cash accounts; confirm banking setup with exchange' },
    ],
    milestones: [
      { name: 'Pricing Conference Call', dueDate: '2026-12-15', status: 'not_started' },
      { name: 'Trading Begins (Ticker Symbol Live)', dueDate: '2026-12-16', status: 'not_started' },
    ],
    resourceLinks: [
      { title: 'IPO Pricing Strategy Guide', url: '#', description: 'How to approach final pricing discussions' },
      { title: 'Exchange Settlement Procedures', url: '#', description: 'Technical settlement and fund flow procedures' },
      { title: 'First Day Trading Best Practices', url: '#', description: 'What to expect on trading day' },
    ],
    criticalActions: [
      'Finalize pricing with underwriters and exchange',
      'Confirm all allocation and settlement instructions',
      'Test trading systems and settlement procedures',
      'Prepare press release and investor announcements',
    ],
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'phase-8',
    order: 8,
    name: 'Post-Listing',
    description: 'Ongoing compliance, investor relations, and post-listing obligations.',
    durationDays: 365,
    currentStatus: 'not_started',
    progressPercent: 0,
    deliverables: [
      { id: 'd8-1', name: 'First Quarterly Report (Q1)', status: 'not_started', category: 'Regulatory' },
      { id: 'd8-2', name: 'Management Certifications (Form 52-102F2)', status: 'not_started', category: 'Regulatory' },
      { id: 'd8-3', name: 'Annual Information Form (AIF)', status: 'not_started', category: 'Regulatory' },
      { id: 'd8-4', name: 'Annual General Meeting (AGM)', status: 'not_started', category: 'Governance' },
      { id: 'd8-5', name: 'Investor Relations Program', status: 'not_started', category: 'IR' },
      { id: 'd8-6', name: 'Internal Controls Certification', status: 'not_started', category: 'Compliance' },
    ],
    raci: [
      { name: 'CFO', responsible: 'CFO', accountable: 'CEO', consulted: 'Auditor', informed: 'Board' },
      { name: 'Company', responsible: 'CEO', accountable: 'CEO', consulted: 'Counsel', informed: 'Shareholders' },
      { name: 'Auditor', responsible: 'Lead Auditor', accountable: 'CFO', consulted: 'Company', informed: 'Public' },
    ],
    dependencies: ['phase-7'],
    risks: [
      { description: 'Material event affects stock price post-listing', mitigation: 'Implement robust disclosure controls; monitor regulatory requirements' },
      { description: 'Investor relations misstep damages reputation', mitigation: 'Establish IR best practices; maintain regular investor communication' },
      { description: 'Audit findings require restatement', mitigation: 'Maintain strong internal controls; conduct regular compliance reviews' },
    ],
    milestones: [
      { name: 'First Quarterly Report Filed', dueDate: '2027-03-15', status: 'not_started' },
      { name: 'First AGM Completed', dueDate: '2027-06-30', status: 'not_started' },
      { name: '1-Year Post-Listing Milestone', dueDate: '2027-12-15', status: 'not_started' },
    ],
    resourceLinks: [
      { title: 'IPOReady Post-Listing Compliance Checklist', url: '/checklist', description: 'All ongoing reporting and governance obligations' },
      { title: 'Public Company Governance Best Practices', url: '#', description: 'Investor relations, disclosure controls, and SOX compliance' },
      { title: 'Quarterly Reporting Guide', url: '#', description: 'MD&A, financial statements, and management discussion' },
    ],
    criticalActions: [
      'Establish investor relations program and calendar',
      'Set up disclosure controls and procedures',
      'Prepare quarterly and annual financial reports',
      'Plan and execute first annual general meeting (AGM)',
    ],
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function getPhaseStatusColor(status: string): string {
  if (status === 'completed') return 'var(--color-success)'
  if (status === 'in_progress') return 'var(--color-accent)'
  return 'var(--color-border-dark)'
}

function getPhaseStatusBg(status: string): string {
  if (status === 'completed') return 'var(--color-success-soft)'
  if (status === 'in_progress') return 'var(--color-error-soft)'
  return 'var(--color-surface-light)'
}

function getDaysRemaining(phase: IPOPhase, allPhases: IPOPhase[]): number {
  const phaseIndex = allPhases.findIndex(p => p.id === phase.id)
  if (phaseIndex === -1) return 0
  return allPhases.slice(0, phaseIndex + 1).reduce((sum, p) => sum + (p.durationDays * (1 - p.progressPercent / 100)), 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE CARD COMPONENT (Expandable Detail)
// ─────────────────────────────────────────────────────────────────────────────

interface PhaseDetailCardProps {
  phase: IPOPhase
  isOpen: boolean
  onToggle: () => void
  allPhases: IPOPhase[]
}

function PhaseDetailCard({ phase, isOpen, onToggle, allPhases }: PhaseDetailCardProps) {
  const daysRemaining = getDaysRemaining(phase, allPhases)

  return (
    <motion.div
      layout
      className="card overflow-hidden"
      style={{ borderColor: 'var(--color-border)' }}>

      {/* Header / Click to toggle */}
      <button
        onClick={onToggle}
        className="w-full text-left p-6 hover:bg-surface-light transition-colors flex items-center justify-between"
        style={{ borderBottom: isOpen ? '1px solid var(--color-border)' : 'none' }}>

        <div className="flex items-center gap-4 flex-1">
          {/* Status badge */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: getPhaseStatusBg(phase.currentStatus) }}>
            {phase.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-nav font-bold text-base">{phase.name}</h3>
              <span className="badge text-xs"
                style={{
                  background: getPhaseStatusBg(phase.currentStatus),
                  color: getPhaseStatusColor(phase.currentStatus),
                  borderColor: getPhaseStatusColor(phase.currentStatus) + '30',
                }}>
                {phase.currentStatus === 'completed' ? 'Complete' : phase.currentStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
              </span>
            </div>
            <p className="text-text-muted text-sm">{phase.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-nav font-bold text-sm">{phase.progressPercent}%</p>
            <p className="text-text-muted text-xs">{phase.durationDays}d phase</p>
          </div>
          <ChevronDown className="w-5 h-5 transition-transform"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--color-border-dark)' }} />
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}>

            <div className="p-6 space-y-6" style={{ borderTop: '1px solid var(--color-border)' }}>

              {/* Overview */}
              <div>
                <h4 className="text-nav font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline & Progress
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-muted text-xs font-medium">Overall Progress</span>
                      <span className="text-nav font-bold text-sm">{phase.progressPercent}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${phase.progressPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="progress-fill" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-light)' }}>
                      <p className="text-text-muted text-xs mb-1">Duration</p>
                      <p className="text-nav font-bold text-sm">{phase.durationDays}d</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-light)' }}>
                      <p className="text-text-muted text-xs mb-1">Est. Days Left</p>
                      <p className="text-nav font-bold text-sm">{Math.max(0, Math.ceil(daysRemaining))}</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--color-surface-light)' }}>
                      <p className="text-text-muted text-xs mb-1">Status</p>
                      <p className="text-accent text-sm font-semibold capitalize">{phase.currentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-nav font-semibold text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Key Deliverables ({phase.deliverables.filter(d => d.status === 'completed').length}/{phase.deliverables.length})
                </h4>
                <div className="space-y-2">
                  {phase.deliverables.map((deliverable, i) => (
                    <motion.div
                      key={deliverable.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                      style={{
                        background: deliverable.status === 'completed' ? 'var(--color-success-soft)' : 'var(--color-surface-light)',
                        borderColor: deliverable.status === 'completed' ? '#2D7A5F30' : 'var(--color-border)',
                      }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: deliverable.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)',
                          color: 'white',
                        }}>
                        {deliverable.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-nav font-medium text-sm">{deliverable.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge text-[10px]"
                            style={{
                              background: 'var(--color-surface-primary)',
                              color: 'var(--color-text-secondary)',
                              borderColor: 'var(--color-border)',
                            }}>
                            {deliverable.category}
                          </span>
                          <span className="text-text-muted text-xs capitalize">{deliverable.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Critical Actions */}
              <div>
                <h4 className="text-nav font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Critical Actions
                </h4>
                <ul className="space-y-2">
                  {phase.criticalActions.map((action, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 text-sm">
                      <div className="w-1 h-1 rounded-full flex-shrink-0 mt-2"
                        style={{ background: 'var(--color-accent)' }} />
                      <span className="text-text-muted">{action}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* RACI Matrix */}
              <div>
                <h4 className="text-nav font-semibold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  RACI Matrix
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr style={{ background: 'var(--color-surface-light)' }}>
                        <th className="text-left p-2 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Role</th>
                        <th className="text-left p-2 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Responsible</th>
                        <th className="text-left p-2 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Accountable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phase.raci.map((role, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                          <td className="p-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>{role.name}</td>
                          <td className="p-2" style={{ color: 'var(--color-text-secondary)' }}>{role.responsible || '—'}</td>
                          <td className="p-2" style={{ color: 'var(--color-text-secondary)' }}>{role.accountable || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dependencies */}
              {phase.dependencies.length > 0 && (
                <div>
                  <h4 className="text-nav font-semibold text-sm mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Dependencies
                  </h4>
                  <p className="text-text-muted text-sm">
                    Must complete {phase.dependencies.map(depId => {
                      const depPhase = PHASES.find(p => p.id === depId)
                      return depPhase?.name
                    }).join(', ')} before starting this phase.
                  </p>
                </div>
              )}

              {/* Risks */}
              <div>
                <h4 className="text-nav font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Key Risks & Mitigations
                </h4>
                <div className="space-y-3">
                  {phase.risks.map((risk, i) => (
                    <div key={i} className="rounded-lg p-3 border" style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-soft)' }}>
                      <p className="text-nav font-medium text-sm mb-1">{risk.description}</p>
                      <p className="text-text-muted text-xs">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-nav font-semibold text-sm mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Resources & References
                </h4>
                <div className="space-y-2">
                  {phase.resourceLinks.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target={resource.url.startsWith('/') ? undefined : '_blank'}
                      rel={resource.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border-dark hover:bg-surface-light transition-colors">
                      <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-nav font-medium text-sm">{resource.title}</p>
                        <p className="text-text-muted text-xs mt-0.5">{resource.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function IPOJourneyPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const totalDays = PHASES.reduce((sum, p) => sum + p.durationDays, 0)
  const completedDays = PHASES.reduce((sum, p) => sum + (p.durationDays * p.progressPercent / 100), 0)
  const overallProgress = Math.round((completedDays / totalDays) * 100)
  const currentPhaseIndex = PHASES.findIndex(p => p.currentStatus === 'in_progress')
  const currentPhase = currentPhaseIndex >= 0 ? PHASES[currentPhaseIndex] : PHASES[0]

  if (!isMounted) return null

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh', colorScheme: 'light' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="serif text-3xl sm:text-4xl text-nav font-bold mb-2">IPO Journey™</h1>
              <p className="text-text-muted text-base">Your complete roadmap from preparation to public listing and beyond</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ background: 'white', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Timeline</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ background: 'white', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">Overall Progress</p>
              <div className="flex items-end gap-3">
                <div className="text-left flex-1">
                  <p className="text-nav font-black text-3xl mb-1">{overallProgress}%</p>
                  <p className="text-text-muted text-xs font-medium">{Math.ceil(completedDays)} of {totalDays} days</p>
                </div>
                <div style={{ width: '60px', height: '60px' }}>
                  <svg viewBox="0 0 60 60" className="w-full h-full">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#E5E4E0" strokeWidth="4" />
                    <circle cx="30" cy="30" r="24" fill="none" stroke="var(--color-accent)" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallProgress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">Current Phase</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: getPhaseStatusBg(currentPhase.currentStatus) }}>
                  {currentPhase.icon}
                </div>
                <div>
                  <p className="text-nav font-bold text-base">{currentPhase.name}</p>
                  <p className="text-text-muted text-xs">{currentPhase.currentStatus}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">Phases Complete</p>
              <p className="text-nav font-black text-3xl mb-1">{PHASES.filter(p => p.currentStatus === 'completed').length}/{PHASES.length}</p>
              <p className="text-text-muted text-xs font-medium">{PHASES.filter(p => p.currentStatus === 'in_progress').length} in progress</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline - Horizontal Phase Boxes (Desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <h2 className="text-nav font-bold text-base mb-4">Phase Timeline</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {PHASES.map((phase, i) => (
              <motion.button
                key={phase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                className="relative p-3 rounded-lg border transition-all hover:shadow-md"
                style={{
                  background: getPhaseStatusBg(phase.currentStatus),
                  borderColor: getPhaseStatusColor(phase.currentStatus),
                  borderWidth: expandedPhase === phase.id ? '2px' : '1px',
                }}>
                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">{phase.icon}</span>
                  <p className="text-nav font-bold text-xs mb-1 line-clamp-2">{phase.name}</p>
                  <div className="w-full bg-white rounded-full h-1.5 mb-1.5" style={{ opacity: 0.3 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: getPhaseStatusColor(phase.currentStatus) }} />
                  </div>
                  <p className="text-text-muted text-[10px] font-medium">{phase.progressPercent}% • {phase.durationDays}d</p>
                </div>
                {phase.currentStatus === 'completed' && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Phase Detail Cards (Expandable) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          <h2 className="text-nav font-bold text-base mb-4">Phase Details</h2>
          <div className="space-y-4">
            {PHASES.map((phase, i) => (
              <PhaseDetailCard
                key={phase.id}
                phase={phase}
                isOpen={expandedPhase === phase.id}
                onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                allPhases={PHASES}
              />
            ))}
          </div>
        </motion.div>

        {/* Quick Links Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6">
          <h2 className="text-nav font-bold text-base mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Go to Checklist', href: '/checklist', icon: CheckCircle2 },
              { label: 'Build Prospectus', href: '/prospectus', icon: FileText },
              { label: 'Upload Documents', href: '/documents', icon: FileText },
              { label: 'View Compliance', href: '/dashboard/compliance', icon: AlertCircle },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-border-dark hover:bg-surface-light transition-colors text-decoration-none">
                <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span className="text-nav font-medium text-sm">{label}</span>
                <ArrowRight className="w-4 h-4 ml-auto" style={{ color: 'var(--color-border-dark)' }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
