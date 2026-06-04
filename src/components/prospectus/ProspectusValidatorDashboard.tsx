'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, TrendingUp, Filter } from 'lucide-react'

// Types
export interface Issue {
  id: string
  severity: 'critical' | 'moderate' | 'minor'
  description: string
  rootCause: string
  fixOptions: Array<{
    id: string
    label: string
    checked: boolean
  }>
  guidance: string
  exampleLink?: string
}

export interface Gap {
  id: string
  category: string
  description: string
  required: boolean
  status: 'open' | 'resolved'
}

export interface ProspectusSection {
  id: string
  name: string
  strength: number // 1-5
  status: 'weak' | 'passable' | 'defendable' | 'strong'
  issueCount: number
  gapCount: number
  completeness: number // 0-100
  issues: Issue[]
  gaps: Gap[]
}

interface ProspectusValidatorDashboardProps {
  sections: ProspectusSection[]
  onSectionUpdate?: (sectionId: string, updates: Partial<ProspectusSection>) => void
}

// Strength gauge component
function StrengthGauge({ strength, size = 'md' }: { strength: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 24, md: 48, lg: 80 }
  const s = sizeMap[size]
  const filledAngle = (strength / 5) * 180
  const rotation = -90
  const filledRotation = rotation + filledAngle

  return (
    <div style={{ width: s, height: s / 2 }} className="relative">
      {/* Background arc */}
      <svg width={s} height={s / 2} className="absolute inset-0">
        <path
          d={`M ${s * 0.15} ${s / 2} A ${s * 0.35} ${s / 2} 0 0 1 ${s * 0.85} ${s / 2}`}
          fill="none"
          stroke="#E5E4E0"
          strokeWidth="4"
        />
        {/* Filled arc */}
        <defs>
          <linearGradient id={`gauge-gradient-${strength}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {strength <= 1 && <><stop offset="0%" stopColor="#DC2626" /><stop offset="100%" stopColor="#B91C1C" /></>}
            {strength > 1 && strength <= 2.5 && <><stop offset="0%" stopColor="#B45309" /><stop offset="100%" stopColor="#92400E" /></>}
            {strength > 2.5 && strength <= 4 && <><stop offset="0%" stopColor="#65A30D" /><stop offset="100%" stopColor="#4B7C0F" /></>}
            {strength > 4 && <><stop offset="0%" stopColor="#2D7A5F" /><stop offset="100%" stopColor="#15803D" /></>}
          </linearGradient>
        </defs>
        <path
          d={`M ${s * 0.15} ${s / 2} A ${s * 0.35} ${s / 2} 0 0 1 ${s * 0.15 + (s * 0.7 * (strength / 5))} ${s / 2 - (s * 0.35 * Math.sin((strength / 5) * Math.PI))}`}
          fill="none"
          stroke={`url(#gauge-gradient-${strength})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      {/* Center text - only for md and lg */}
      {size !== 'sm' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-nav ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
            {strength.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )
}

// Status badge component
function StatusBadge({ status, issueCount, gapCount }: { status: string; issueCount: number; gapCount: number }) {
  const badgeMap = {
    weak: { bg: '#FEF2F2', border: '#FEE2E2', text: '#DC2626', label: 'Weak' },
    passable: { bg: '#FFFBEB', border: '#FEF3C7', text: '#B45309', label: 'Passable' },
    defendable: { bg: '#EAF5F0', border: '#D1FAE5', text: '#2D7A5F', label: 'Defendable' },
    strong: { bg: '#ECFDF5', border: '#D1FAE5', text: '#2D7A5F', label: 'Strong' },
  }

  const badge = badgeMap[status as keyof typeof badgeMap] || badgeMap.passable

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: badge.bg, border: `1px solid ${badge.border}` }}>
      <span className="text-sm font-semibold" style={{ color: badge.text }}>{badge.label}</span>
      {issueCount > 0 && <span className="text-xs font-medium" style={{ color: '#DC2626' }}>🔴 {issueCount}</span>}
      {gapCount > 0 && <span className="text-xs font-medium" style={{ color: '#B45309' }}>🟡 {gapCount}</span>}
      {issueCount === 0 && gapCount === 0 && <span className="text-xs font-medium" style={{ color: '#2D7A5F' }}>🟢</span>}
    </div>
  )
}

// Section card component
function SectionCard({
  section,
  isExpanded,
  onToggle,
  onIssueResolve,
}: {
  section: ProspectusSection
  isExpanded: boolean
  onToggle: () => void
  onIssueResolve: (issueId: string) => void
}) {
  return (
    <motion.div
      layout
      className="card overflow-hidden card-hover"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 hover:bg-opacity-50 transition-colors flex items-center justify-between gap-4"
        style={{ background: isExpanded ? '#F7F6F4' : '#FFFFFF' }}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="pt-1">
            <StrengthGauge strength={section.strength} size="md" />
          </div>

          <div className="flex-1 text-left">
            <h3 className="font-semibold text-nav mb-2">{section.name}</h3>
            <StatusBadge status={section.status} issueCount={section.issueCount} gapCount={section.gapCount} />
          </div>
        </div>

        <div className="text-right">
          <div className="caption text-text-muted mb-2">{section.completeness}% Complete</div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-text-tertiary" /> : <ChevronDown className="w-5 h-5 text-text-tertiary" />}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ borderTop: '1px solid #E5E4E0', background: '#F7F6F4' }}
          >
            <div className="p-6 space-y-6">
              {/* Completeness bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="label text-nav">Completeness</p>
                  <span className="label font-semibold text-nav">{section.completeness}%</span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: '#E5E4E0' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${section.completeness}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ background: 'linear-gradient(to right, #2D7A5F, #2D7A5F)' }}
                    className="h-full"
                  />
                </div>
              </div>

              {/* Issues */}
              {section.issues.length > 0 && (
                <div>
                  <h4 className="label font-semibold text-nav mb-4">Issues Found ({section.issues.length})</h4>
                  <div className="space-y-3">
                    {section.issues.map(issue => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onResolve={() => onIssueResolve(issue.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {section.gaps.length > 0 && (
                <div>
                  <h4 className="label font-semibold text-nav mb-4">Gaps ({section.gaps.length})</h4>
                  <div className="space-y-2">
                    {section.gaps.map(gap => (
                      <div key={gap.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
                        <input
                          type="checkbox"
                          checked={gap.status === 'resolved'}
                          readOnly
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="label font-medium text-nav">{gap.category}</p>
                          <p className="caption-sm text-text-muted">{gap.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #E5E4E0' }}>
                <button className="flex-1 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors" style={{ borderColor: '#E5E4E0', background: '#FFFFFF', color: '#1A1A1A' }}>
                  View Guidance
                </button>
                <button className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-colors" style={{ background: '#E8312A', color: '#FFFFFF' }}>
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Issue card component
function IssueCard({
  issue,
  onResolve,
}: {
  issue: Issue
  onResolve: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const severityMap = {
    critical: { icon: '🔴', color: '#DC2626', bg: '#FEF2F2', border: '#FEE2E2' },
    moderate: { icon: '🟡', color: '#B45309', bg: '#FFFBEB', border: '#FEF3C7' },
    minor: { icon: '🔵', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  }

  const severity = severityMap[issue.severity]

  return (
    <motion.div className="rounded-lg p-4" style={{ background: severity.bg, border: `1px solid ${severity.border}` }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="flex gap-3 flex-1">
          <span className="mt-0.5">{severity.icon}</span>
          <div className="flex-1">
            <p className="label-sm font-semibold" style={{ color: severity.color }}>{issue.severity.toUpperCase()}</p>
            <p className="body-sm text-nav mt-1">{issue.description}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-tertiary mt-1" /> : <ChevronDown className="w-4 h-4 text-text-tertiary mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 space-y-4"
            style={{ borderTop: `1px solid ${severity.border}` }}
          >
            {/* Root cause */}
            <div>
              <p className="label-sm text-text-muted uppercase">Root Cause</p>
              <p className="body-sm text-nav mt-2">{issue.rootCause}</p>
            </div>

            {/* Fix options */}
            {issue.fixOptions.length > 0 && (
              <div>
                <p className="label-sm text-text-muted uppercase mb-3">Fix Options</p>
                <div className="space-y-2">
                  {issue.fixOptions.map(option => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.checked}
                        readOnly
                        className="rounded"
                      />
                      <span className="body-sm text-nav">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Guidance */}
            {issue.guidance && (
              <div className="p-3 rounded-lg" style={{ background: '#FFFFFF' }}>
                <p className="label-sm text-text-muted uppercase mb-2">Guidance</p>
                <p className="body-sm text-nav">{issue.guidance}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${severity.border}` }}>
              {issue.exampleLink && (
                <a
                  href={issue.exampleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-sm font-medium transition-colors"
                  style={{ color: '#1D4ED8', textDecoration: 'underline' }}
                >
                  View Examples →
                </a>
              )}
              <button
                onClick={onResolve}
                className="ml-auto px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                style={{ borderColor: severity.border, color: severity.color, background: '#FFFFFF' }}
              >
                Mark Resolved
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Overall summary card
function OverallSummary({ sections }: { sections: ProspectusSection[] }) {
  const avgStrength = sections.length > 0 ? sections.reduce((sum, s) => sum + s.strength, 0) / sections.length : 0
  const statusMap = {
    1: 'Weak',
    2: 'Passable',
    3: 'Passable',
    4: 'Defendable',
    5: 'Strong',
  }
  const statusLabel = statusMap[Math.round(avgStrength) as keyof typeof statusMap]

  const completionData = [
    { name: 'Complete', value: sections.filter(s => s.completeness === 100).length },
    { name: 'In Progress', value: sections.filter(s => s.completeness > 0 && s.completeness < 100).length },
    { name: 'Not Started', value: sections.filter(s => s.completeness === 0).length },
  ].filter(d => d.value > 0)

  const COLORS = ['#2D7A5F', '#B45309', '#DC2626']

  return (
    <div className="card p-8">
      <h2 className="h3 text-nav mb-8">Overall Prospectus Strength</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gauge and summary */}
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <StrengthGauge strength={avgStrength} size="lg" />
          </div>

          <div className="text-center w-full">
            <p className="serif text-3xl md:text-4xl text-nav mb-2">
              {avgStrength.toFixed(1)}/5
            </p>
            <p className="h4 text-text-muted mb-6">{statusLabel}</p>

            {/* Status badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <div className="px-3 py-1.5 rounded-full" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                <p className="label-sm" style={{ color: '#DC2626' }}>
                  🔴 {sections.reduce((sum, s) => sum + s.issueCount, 0)} Issues
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full" style={{ background: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                <p className="label-sm" style={{ color: '#B45309' }}>
                  🟡 {sections.reduce((sum, s) => sum + s.gapCount, 0)} Gaps
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full" style={{ background: '#EAF5F0', border: '1px solid #D1FAE5' }}>
                <p className="label-sm" style={{ color: '#2D7A5F' }}>
                  {Math.round((sections.reduce((sum, s) => sum + s.completeness, 0) / sections.length) || 0)}% Complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Completion breakdown */}
        {completionData.length > 0 && (
          <div className="flex flex-col items-center">
            <h4 className="label font-semibold text-nav mb-6">Completion Status</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${value} section${value > 1 ? 's' : ''}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 flex flex-col gap-2">
              {completionData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="body-sm text-nav">{item.name}</span>
                  <span className="body-sm font-semibold text-nav">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {avgStrength < 4 && (
        <div className="mt-8 p-6 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <div className="flex gap-4">
            <TrendingUp className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="label font-semibold text-nav mb-2">Strengthen Your Prospectus</p>
              <p className="body-sm text-text-muted">
                {avgStrength < 2
                  ? 'Your prospectus needs significant work. Start with critical issues and work section by section.'
                  : avgStrength < 3
                    ? 'Address moderate and critical issues to improve your prospectus quality.'
                    : 'Focus on remaining gaps to achieve a defendable prospectus.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main dashboard component
export function ProspectusValidatorDashboard({
  sections,
  onSectionUpdate,
}: ProspectusValidatorDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'moderate' | 'minor'>('all')

  const filteredSections = useMemo(() => {
    if (severityFilter === 'all') return sections

    return sections.map(section => ({
      ...section,
      issues: section.issues.filter(issue => issue.severity === severityFilter),
    }))
  }, [sections, severityFilter])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleIssueResolve = (sectionId: string, issueId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const updatedIssues = section.issues.filter(i => i.id !== issueId)
    const newCompleteness = Math.min(100, section.completeness + Math.ceil(100 / (section.issues.length + section.gaps.length)))

    onSectionUpdate?.(sectionId, {
      issues: updatedIssues,
      issueCount: updatedIssues.length,
      completeness: newCompleteness,
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="h2 text-nav mb-2">Prospectus Validator</h1>
        <p className="body-sm text-text-muted">Comprehensive quality assessment of all prospectus sections</p>
      </div>

      {/* Overall Summary */}
      <OverallSummary sections={filteredSections} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 pb-6" style={{ borderBottom: '1px solid #E5E4E0' }}>
        <Filter className="w-5 h-5 text-text-muted" />
        <span className="label text-text-muted">Filter by severity:</span>
        {(['all', 'critical', 'moderate', 'minor'] as const).map(severity => (
          <button
            key={severity}
            onClick={() => setSeverityFilter(severity)}
            className="px-3 py-1.5 rounded-full label-sm font-semibold transition-all"
            style={{
              background: severityFilter === severity ? '#E8312A' : '#F7F6F4',
              color: severityFilter === severity ? '#FFFFFF' : '#1A1A1A',
              border: severityFilter === severity ? 'none' : '1px solid #E5E4E0',
            }}
          >
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </button>
        ))}
      </div>

      {/* Section cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredSections.map(section => (
          <motion.div key={section.id} variants={item}>
            <SectionCard
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              onIssueResolve={(issueId) => handleIssueResolve(section.id, issueId)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {filteredSections.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg p-12 text-center"
          style={{ border: '2px dashed #E5E4E0', background: '#FAFAF9' }}
        >
          <CheckCircle2 className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <p className="label font-semibold text-nav">No sections to display</p>
          <p className="caption-sm text-text-muted mt-2">Adjust your filters to see prospectus sections</p>
        </motion.div>
      )}
    </div>
  )
}
