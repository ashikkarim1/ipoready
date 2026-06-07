'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react'

export default function TheDailiesPage() {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day')
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  // Mock data for different time periods
  const deltaData = {
    day: {
      period: 'Last 24 Hours',
      metrics: [
        {
          id: 'tasks',
          label: 'Tasks Completed',
          value: 5,
          delta: 3,
          trend: 'up',
          description: 'Regulatory review (3), Board resolutions (2)',
          icon: CheckCircle2,
        },
        {
          id: 'documents',
          label: 'Documents Submitted',
          value: 8,
          delta: 2,
          trend: 'up',
          description: 'PIF forms (1), Financial statements (1)',
          icon: Zap,
        },
        {
          id: 'pace',
          label: 'PACE Score Change',
          value: 62,
          delta: 2,
          trend: 'up',
          description: 'Progress in Readiness phase (+2 pts)',
          icon: TrendingUp,
        },
        {
          id: 'timeline',
          label: 'Days to IPO',
          value: 187,
          delta: -1,
          trend: 'down',
          description: 'Timeline remains on track',
          icon: Clock,
        },
      ],
      changes: [
        {
          timestamp: '2:45 PM',
          action: 'Task Completed',
          detail: 'Regulatory Review - SEC Compliance Check',
          category: 'regulatory',
        },
        {
          timestamp: '1:30 PM',
          action: 'Document Submitted',
          detail: 'PIF Form - Director #1 (John Smith)',
          category: 'document',
        },
        {
          timestamp: '11:15 AM',
          action: 'Task Completed',
          detail: 'Board Minutes - Audit Committee Meeting',
          category: 'governance',
        },
        {
          timestamp: '10:00 AM',
          action: 'Task Completed',
          detail: 'Financial Statement Review - Q3 Audit',
          category: 'financial',
        },
        {
          timestamp: 'Yesterday 4:30 PM',
          action: 'Document Submitted',
          detail: 'Risk Factor Analysis - Market Risks Update',
          category: 'document',
        },
      ],
    },
    week: {
      period: 'Last 7 Days',
      metrics: [
        {
          id: 'tasks',
          label: 'Tasks Completed',
          value: 28,
          delta: 18,
          trend: 'up',
          description: 'Strong execution across all workstreams',
          icon: CheckCircle2,
        },
        {
          id: 'documents',
          label: 'Documents Submitted',
          value: 32,
          delta: 8,
          trend: 'up',
          description: 'PIF forms (4), Financials (2), Legal docs (2)',
          icon: Zap,
        },
        {
          id: 'pace',
          label: 'PACE Score Change',
          value: 62,
          delta: 6,
          trend: 'up',
          description: 'Readiness +4pts, Timeline +2pts',
          icon: TrendingUp,
        },
        {
          id: 'timeline',
          label: 'Days to IPO',
          value: 187,
          delta: -7,
          trend: 'down',
          description: '7-day countdown progress',
          icon: Clock,
        },
      ],
      changes: [
        {
          timestamp: 'Today, 2:45 PM',
          action: 'Task Completed',
          detail: 'Regulatory Review - SEC Compliance Check',
          category: 'regulatory',
        },
        {
          timestamp: 'Today, 1:30 PM',
          action: 'Document Submitted',
          detail: 'PIF Form - Director #1 (John Smith)',
          category: 'document',
        },
        {
          timestamp: 'Jun 5, 4:15 PM',
          action: 'Task Completed',
          detail: 'Board Minutes - Special Committee Meeting',
          category: 'governance',
        },
        {
          timestamp: 'Jun 4, 10:00 AM',
          action: 'Milestone Reached',
          detail: '50% of PIF Forms Collected',
          category: 'milestone',
        },
        {
          timestamp: 'Jun 3, 3:20 PM',
          action: 'Document Submitted',
          detail: 'Audited Financial Statements - FY2025',
          category: 'financial',
        },
        {
          timestamp: 'Jun 2, 11:00 AM',
          action: 'Task Completed',
          detail: 'Underwriter Selection - Final 3 Approved',
          category: 'advisory',
        },
        {
          timestamp: 'Jun 1, 2:30 PM',
          action: 'Document Submitted',
          detail: 'Risk Factor Analysis - Complete Draft',
          category: 'document',
        },
      ],
    },
    month: {
      period: 'Last 30 Days',
      metrics: [
        {
          id: 'tasks',
          label: 'Tasks Completed',
          value: 95,
          delta: 62,
          trend: 'up',
          description: 'Major progress across all phases',
          icon: CheckCircle2,
        },
        {
          id: 'documents',
          label: 'Documents Submitted',
          value: 127,
          delta: 35,
          trend: 'up',
          description: 'Core regulatory documents submitted',
          icon: Zap,
        },
        {
          id: 'pace',
          label: 'PACE Score Change',
          value: 62,
          delta: 18,
          trend: 'up',
          description: 'Significant progress from 44 to 62',
          icon: TrendingUp,
        },
        {
          id: 'timeline',
          label: 'Days to IPO',
          value: 187,
          delta: -30,
          trend: 'down',
          description: 'On schedule, full month of progress',
          icon: Clock,
        },
      ],
      changes: [
        {
          timestamp: 'Jun 6, 2:45 PM',
          action: 'Milestone Reached',
          detail: 'All Director PIF Forms Submitted',
          category: 'milestone',
        },
        {
          timestamp: 'Jun 4, 10:00 AM',
          action: 'Milestone Reached',
          detail: '75% of Documents Collected',
          category: 'milestone',
        },
        {
          timestamp: 'May 30, 3:20 PM',
          action: 'Phase Milestone',
          detail: 'PACE Readiness Phase 85% Complete',
          category: 'milestone',
        },
        {
          timestamp: 'May 25, 11:00 AM',
          action: 'Key Decision',
          detail: 'Underwriter Syndicate Finalized',
          category: 'advisory',
        },
        {
          timestamp: 'May 20, 2:30 PM',
          action: 'Regulatory Approval',
          detail: 'Initial Regulatory Review Passed',
          category: 'regulatory',
        },
      ],
    },
  }

  const currentData = deltaData[timePeriod]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">The Dailies</h1>
              <p className="text-slate-600">Track your IPO preparation progress and recent changes</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>

          {/* Time Period Tabs */}
          <div className="flex gap-3 flex-wrap">
            {(['day', 'week', 'month'] as const).map((period) => (
              <motion.button
                key={period}
                onClick={() => setTimePeriod(period)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                  timePeriod === period
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {period === 'day' && 'Last 24 Hours'}
                {period === 'week' && 'Last 7 Days'}
                {period === 'month' && 'Last 30 Days'}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {currentData.metrics.map((metric, index) => {
            const Icon = metric.icon
            const isExpanded = expandedMetric === metric.id
            const isDeltaPositive = metric.trend === 'up'

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setExpandedMetric(isExpanded ? null : metric.id)}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 cursor-pointer transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: isDeltaPositive ? '#EBF9F4' : '#FEF3E1',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: isDeltaPositive ? '#2D7A5F' : '#B45309',
                        }}
                      />
                    </div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                      {metric.label}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Main Value */}
                <div className="mb-4">
                  <p className="text-3xl font-bold text-slate-900 mb-2">{metric.value}</p>

                  {/* Delta Badge */}
                  <div
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold"
                    style={{
                      background: isDeltaPositive ? '#EBF9F4' : '#FEF3E1',
                      color: isDeltaPositive ? '#2D7A5F' : '#B45309',
                    }}
                  >
                    {isDeltaPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {isDeltaPositive ? '+' : ''}{metric.delta}{' '}
                      {metric.id === 'timeline' ? '' : 'this period'}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-slate-100 mt-4"
                  >
                    <p className="text-sm text-slate-600">{metric.description}</p>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Recent Changes */}
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Changes</h2>

          <div className="space-y-4">
            {currentData.changes.map((change, index) => {
              const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                task: {
                  bg: '#EBF9F4',
                  text: '#2D7A5F',
                  border: '#2D7A5F',
                },
                document: {
                  bg: '#EBF5FF',
                  text: '#1D4ED8',
                  border: '#1D4ED8',
                },
                regulatory: {
                  bg: '#FEF3E1',
                  text: '#B45309',
                  border: '#B45309',
                },
                governance: {
                  bg: '#F3E8FF',
                  text: '#7E22CE',
                  border: '#7E22CE',
                },
                financial: {
                  bg: '#ECFDF5',
                  text: '#059669',
                  border: '#059669',
                },
                advisory: {
                  bg: '#DBEAFE',
                  text: '#0284C7',
                  border: '#0284C7',
                },
                milestone: {
                  bg: '#FEE2E2',
                  text: '#DC2626',
                  border: '#DC2626',
                },
              }

              const categoryColor =
                categoryColors[change.category] || categoryColors.document

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: categoryColor.text }}
                    />
                    <div className="flex-1 w-0.5" style={{ background: '#E5E4E0' }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold text-slate-500">
                        {change.timestamp}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          background: categoryColor.bg,
                          color: categoryColor.text,
                        }}
                      >
                        {change.action}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{change.detail}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8"
        >
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Key Insight</h3>
              <p className="text-slate-700">
                {timePeriod === 'day' &&
                  'Strong progress today with 5 tasks completed. Focus on submitting remaining PIF forms to maintain momentum.'}
                {timePeriod === 'week' &&
                  'Excellent weekly performance with 28 tasks completed. PACE score improved +6 points. Keep up the execution pace.'}
                {timePeriod === 'month' &&
                  'Outstanding monthly progress with PACE score improvement from 44 to 62. You are on track for your 187-day timeline.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
