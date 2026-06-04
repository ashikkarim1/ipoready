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
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        {/* Filled arc */}
        <defs>
          <linearGradient id={`gauge-gradient-${strength}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {strength <= 1 && <><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#dc2626" /></>}
            {strength > 1 && strength <= 2.5 && <><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></>}
            {strength > 2.5 && strength <= 4 && <><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#65a30d" /></>}
            {strength > 4 && <><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" /></>}
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
          <span className={`font-bold ${size === 'lg' ? 'text-xl' : 'text-sm'} text-gray-900`}>
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
    weak: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Weak' },
    passable: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Passable' },
    defendable: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Defendable' },
    strong: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Strong' },
  }

  const badge = badgeMap[status as keyof typeof badgeMap] || badgeMap.passable

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${badge.bg} ${badge.border}`}>
      <span className={`text-sm font-semibold ${badge.text}`}>{badge.label}</span>
      {issueCount > 0 && <span className="text-red-600 text-xs font-medium">🔴 {issueCount}</span>}
      {gapCount > 0 && <span className="text-amber-600 text-xs font-medium">🟡 {gapCount}</span>}
      {issueCount === 0 && gapCount === 0 && <span className="text-green-600 text-xs font-medium">🟢</span>}
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
      className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="pt-1">
            <StrengthGauge strength={section.strength} size="md" />
          </div>

          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">{section.name}</h3>
            <StatusBadge status={section.status} issueCount={section.issueCount} gapCount={section.gapCount} />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-600 mb-2">{section.completeness}% Complete</div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
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
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-4 space-y-4">
              {/* Completeness bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Completeness</p>
                  <span className="text-sm font-semibold text-gray-900">{section.completeness}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${section.completeness}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
              </div>

              {/* Issues */}
              {section.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Issues Found ({section.issues.length})</h4>
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
                  <h4 className="font-medium text-gray-900 mb-3">Gaps ({section.gaps.length})</h4>
                  <div className="space-y-2">
                    {section.gaps.map(gap => (
                      <div key={gap.id} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-200">
                        <input
                          type="checkbox"
                          checked={gap.status === 'resolved'}
                          readOnly
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{gap.category}</p>
                          <p className="text-xs text-gray-600">{gap.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-medium hover:bg-gray-50 transition-colors">
                  View Guidance
                </button>
                <button className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
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
    critical: { icon: '🔴', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    moderate: { icon: '🟡', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    minor: { icon: '🔵', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  }

  const severity = severityMap[issue.severity]

  return (
    <motion.div className={`rounded border p-3 ${severity.bg} ${severity.border}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="flex gap-3 flex-1">
          <span className="mt-0.5">{severity.icon}</span>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${severity.color}`}>{issue.severity.toUpperCase()}</p>
            <p className="text-sm text-gray-900 mt-0.5">{issue.description}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-3"
          >
            {/* Root cause */}
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase">Root Cause</p>
              <p className="text-sm text-gray-700 mt-1">{issue.rootCause}</p>
            </div>

            {/* Fix options */}
            {issue.fixOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Fix Options</p>
                <div className="space-y-2">
                  {issue.fixOptions.map(option => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.checked}
                        readOnly
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Guidance */}
            {issue.guidance && (
              <div className="p-2 rounded bg-white bg-opacity-50">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Guidance</p>
                <p className="text-sm text-gray-700">{issue.guidance}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              {issue.exampleLink && (
                <a
                  href={issue.exampleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  View Examples →
                </a>
              )}
              <button
                onClick={onResolve}
                className="ml-auto px-3 py-1.5 rounded border border-current border-opacity-40 text-xs font-medium hover:bg-white hover:bg-opacity-50 transition-colors"
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

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444']

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Overall Prospectus Strength</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Gauge and summary */}
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <StrengthGauge strength={avgStrength} size="lg" />
          </div>

          <div className="text-center w-full">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {avgStrength.toFixed(1)}/5
            </p>
            <p className="text-lg font-semibold text-gray-700 mb-4">{statusLabel}</p>

            {/* Status badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <div className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                <p className="text-xs text-red-700 font-medium">
                  🔴 {sections.reduce((sum, s) => sum + s.issueCount, 0)} Issues
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">
                  🟡 {sections.reduce((sum, s) => sum + s.gapCount, 0)} Gaps
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  {Math.round((sections.reduce((sum, s) => sum + s.completeness, 0) / sections.length) || 0)}% Complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Completion breakdown */}
        {completionData.length > 0 && (
          <div className="flex flex-col items-center">
            <h4 className="font-medium text-gray-900 mb-4">Completion Status</h4>
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
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {completionData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {avgStrength < 4 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">Strengthen Your Prospectus</p>
              <p className="text-sm text-blue-800">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prospectus Validator</h1>
        <p className="text-gray-600">Comprehensive quality assessment of all prospectus sections</p>
      </div>

      {/* Overall Summary */}
      <OverallSummary sections={filteredSections} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by severity:</span>
        {(['all', 'critical', 'moderate', 'minor'] as const).map(severity => (
          <button
            key={severity}
            onClick={() => setSeverityFilter(severity)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              severityFilter === severity
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
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
          className="rounded-lg border border-dashed border-gray-300 p-12 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No sections to display</p>
          <p className="text-gray-500 text-sm mt-1">Adjust your filters to see prospectus sections</p>
        </motion.div>
      )}
    </div>
  )
}
