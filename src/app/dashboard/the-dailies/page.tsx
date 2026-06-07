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
    <div style={{ background: 'var(--color-surface-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="h2 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                The Dailies
              </h1>
              <p className="body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Track your IPO preparation progress and recent changes
              </p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>

          {/* Time Period Tabs */}
          <div className="flex gap-3 flex-wrap">
            {(['day', 'week', 'month'] as const).map((period) => (
              <motion.button
                key={period}
                onClick={() => setTimePeriod(period)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all border label-sm"
                style={
                  timePeriod === period
                    ? {
                        background: 'var(--color-accent)',
                        color: 'var(--color-text-inverse)',
                        borderColor: 'var(--color-accent)',
                      }
                    : {
                        background: 'var(--color-surface-primary)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)',
                      }
                }
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
                className="rounded-xl p-6 cursor-pointer transition-all border"
                style={{
                  background: 'var(--color-surface-primary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: isDeltaPositive
                          ? 'rgba(45, 122, 95, 0.1)'
                          : 'rgba(180, 83, 9, 0.1)',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: isDeltaPositive
                            ? 'var(--color-success)'
                            : 'var(--color-warning)',
                        }}
                      />
                    </div>
                    <p
                      className="label-xs uppercase tracking-wider"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {metric.label}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      className="w-5 h-5"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  )}
                </div>

                {/* Main Value */}
                <div className="mb-4">
                  <p
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {metric.value}
                  </p>

                  {/* Delta Badge */}
                  <div
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg label-sm"
                    style={{
                      background: isDeltaPositive
                        ? 'rgba(45, 122, 95, 0.1)'
                        : 'rgba(180, 83, 9, 0.1)',
                      color: isDeltaPositive
                        ? 'var(--color-success)'
                        : 'var(--color-warning)',
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
                    className="pt-4 border-t mt-4"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p className="caption" style={{ color: 'var(--color-text-secondary)' }}>
                      {metric.description}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Recent Changes */}
        <div
          className="rounded-xl p-8 border"
          style={{
            background: 'var(--color-surface-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Recent Changes
          </h2>

          <div className="space-y-4">
            {currentData.changes.map((change, index) => {
              const categoryColors: Record<
                string,
                { bg: string; text: string; border: string }
              > = {
                task: {
                  bg: 'rgba(45, 122, 95, 0.1)',
                  text: '#2D7A5F',
                  border: '#2D7A5F',
                },
                document: {
                  bg: 'rgba(29, 78, 216, 0.1)',
                  text: '#1D4ED8',
                  border: '#1D4ED8',
                },
                regulatory: {
                  bg: 'rgba(180, 83, 9, 0.1)',
                  text: '#B45309',
                  border: '#B45309',
                },
                governance: {
                  bg: 'rgba(126, 34, 206, 0.1)',
                  text: '#7E22CE',
                  border: '#7E22CE',
                },
                financial: {
                  bg: 'rgba(5, 150, 105, 0.1)',
                  text: '#059669',
                  border: '#059669',
                },
                advisory: {
                  bg: 'rgba(2, 132, 199, 0.1)',
                  text: '#0284C7',
                  border: '#0284C7',
                },
                milestone: {
                  bg: 'rgba(220, 38, 38, 0.1)',
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
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: categoryColor.text }}
                    />
                    <div
                      className="flex-1 w-0.5"
                      style={{ background: 'var(--color-border)' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="caption-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {change.timestamp}
                      </span>
                      <span
                        className="label-xs"
                        style={{
                          background: categoryColor.bg,
                          color: categoryColor.text,
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.375rem',
                        }}
                      >
                        {change.action}
                      </span>
                    </div>
                    <p className="body-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {change.detail}
                    </p>
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
          className="mt-16 rounded-xl p-8 border"
          style={{
            background: 'var(--color-surface-primary)',
            borderColor: 'var(--color-info)',
          }}
        >
          <div className="flex gap-4">
            <AlertCircle
              className="w-6 h-6 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--color-info)' }}
            />
            <div>
              <h3 className="h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Key Insight
              </h3>
              <p className="body-sm" style={{ color: 'var(--color-text-secondary)' }}>
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
