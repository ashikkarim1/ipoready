'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
  Scale,
} from 'lucide-react'

export default function ListedDailiesPage() {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day')
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  // Mock data for post-IPO tracking
  const deltaData = {
    day: {
      period: 'Last 24 Hours',
      metrics: [
        {
          id: 'filings',
          label: 'SEC Filings Submitted',
          value: 1,
          delta: 1,
          trend: 'up',
          description: '8-K filed: Executive appointment (CFO change)',
          icon: FileText,
        },
        {
          id: 'investors',
          label: 'Investor Meetings',
          value: 5,
          delta: 3,
          trend: 'up',
          description: '3 institutional investor calls, 2 analyst briefings',
          icon: Users,
        },
        {
          id: 'stock',
          label: 'Stock Performance',
          value: '+2.3%',
          delta: 2.3,
          trend: 'up',
          description: 'Trading volume: 2.1M shares (above average)',
          icon: TrendingUp,
        },
        {
          id: 'compliance',
          label: 'Covenant Compliance',
          value: '100%',
          delta: 0,
          trend: 'up',
          description: 'All debt covenants in compliance (3/3)',
          icon: CheckCircle2,
        },
      ],
      changes: [
        {
          timestamp: '3:45 PM',
          action: '8-K Filed',
          detail: 'Executive Appointment - Chief Financial Officer',
          category: 'filing',
        },
        {
          timestamp: '2:15 PM',
          action: 'Analyst Briefing',
          detail: 'Q2 Earnings Preview Call - 5 Analysts',
          category: 'investor-relations',
        },
        {
          timestamp: '1:30 PM',
          action: 'Stock Update',
          detail: 'Trading Volume Spike - 2.1M shares traded',
          category: 'capital-markets',
        },
        {
          timestamp: '11:00 AM',
          action: 'Investor Meeting',
          detail: 'Institutional Investor Call - BlackRock',
          category: 'investor-relations',
        },
        {
          timestamp: 'Yesterday 4:30 PM',
          action: 'Covenant Check',
          detail: 'Debt Covenant Compliance Verified - 3/3 covenants',
          category: 'financing',
        },
      ],
    },
    week: {
      period: 'Last 7 Days',
      metrics: [
        {
          id: 'filings',
          label: 'SEC Filings Submitted',
          value: 4,
          delta: 4,
          trend: 'up',
          description: '2 8-Ks, 1 insider Form 4, 1 proxy statement',
          icon: FileText,
        },
        {
          id: 'investors',
          label: 'Investor Interactions',
          value: 18,
          delta: 12,
          trend: 'up',
          description: '8 institutional meetings, 7 analyst calls, 3 conferences',
          icon: Users,
        },
        {
          id: 'stock',
          label: 'Stock vs S&P 500',
          value: '+3.8%',
          delta: 3.8,
          trend: 'up',
          description: 'Outperforming benchmark by 1.2%',
          icon: TrendingUp,
        },
        {
          id: 'guidance',
          label: 'Guidance Accuracy',
          value: '94%',
          delta: 6,
          trend: 'up',
          description: 'Analyst estimates tracking guidance',
          icon: CheckCircle2,
        },
      ],
      changes: [
        {
          timestamp: 'Today, 3:45 PM',
          action: '8-K Filed',
          detail: 'Executive Appointment - Chief Financial Officer',
          category: 'filing',
        },
        {
          timestamp: 'Jun 5, 10:00 AM',
          action: 'Earnings Guidance',
          detail: 'Updated FY2025 Guidance Range Released',
          category: 'earnings',
        },
        {
          timestamp: 'Jun 4, 2:30 PM',
          action: 'Roadshow Update',
          detail: '4 Institutional Investor Meetings Completed',
          category: 'investor-relations',
        },
        {
          timestamp: 'Jun 3, 11:15 AM',
          action: 'Analyst Upgrade',
          detail: 'Analyst Coverage Initiated - 5 firms now covering',
          category: 'capital-markets',
        },
        {
          timestamp: 'Jun 2, 4:00 PM',
          action: 'Board Meeting',
          detail: 'Quarterly Board Meeting - All committees convened',
          category: 'governance',
        },
        {
          timestamp: 'Jun 1, 1:30 PM',
          action: 'Filing Deadline',
          detail: 'Proxy Statement Filed - Annual meeting scheduled',
          category: 'filing',
        },
      ],
    },
    month: {
      period: 'Last 30 Days',
      metrics: [
        {
          id: 'filings',
          label: 'SEC Filings Submitted',
          value: 14,
          delta: 14,
          trend: 'up',
          description: 'Full quarter filings complete (10-Q, 8-Ks, Forms 4/5)',
          icon: FileText,
        },
        {
          id: 'investors',
          label: 'Investor Meetings',
          value: 62,
          delta: 45,
          trend: 'up',
          description: '35 institutional investor calls, 15 analyst meetings, 12 conferences',
          icon: Users,
        },
        {
          id: 'stock',
          label: 'Stock Performance',
          value: '+12.4%',
          delta: 12.4,
          trend: 'up',
          description: 'Outperforming S&P 500 by 3.1%',
          icon: TrendingUp,
        },
        {
          id: 'financing',
          label: 'Financing Activities',
          value: 3,
          delta: 3,
          trend: 'up',
          description: '$500M debt issuance completed, 2 refinancings executed',
          icon: DollarSign,
        },
      ],
      changes: [
        {
          timestamp: 'Jun 6, 3:45 PM',
          action: 'Major Milestone',
          detail: '10-Q Filing Complete - All SEC requirements met',
          category: 'filing',
        },
        {
          timestamp: 'Jun 5, 10:00 AM',
          action: 'Analyst Event',
          detail: 'Investor Day Completed - 150+ institutional investors',
          category: 'investor-relations',
        },
        {
          timestamp: 'Jun 3, 2:30 PM',
          action: 'Debt Issuance',
          detail: '$500M Senior Notes Issued - 4.25% coupon',
          category: 'financing',
        },
        {
          timestamp: 'May 30, 11:15 AM',
          action: 'Rating Action',
          detail: 'Credit Rating Upgraded to BBB+ by S&P',
          category: 'capital-markets',
        },
        {
          timestamp: 'May 27, 4:00 PM',
          action: 'Board Milestone',
          detail: 'Board Composition Updated - New independent director',
          category: 'governance',
        },
        {
          timestamp: 'May 20, 1:30 PM',
          action: 'Acquisition Announcement',
          detail: '8-K Filed: Strategic acquisition announced ($250M)',
          category: 'filing',
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
                Listed Dailies
              </h1>
              <p className="body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Track post-listing operations, filings, and investor activities
              </p>
            </div>
            <FileText className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
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
                      {typeof metric.delta === 'string' ? '' : 'this period'}
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

        {/* Recent Activities */}
        <div
          className="rounded-xl p-8 border"
          style={{
            background: 'var(--color-surface-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="h3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Recent Activities
          </h2>

          <div className="space-y-4">
            {currentData.changes.map((change, index) => {
              const categoryColors: Record<
                string,
                { bg: string; text: string; border: string }
              > = {
                filing: {
                  bg: 'rgba(29, 78, 216, 0.1)',
                  text: '#1D4ED8',
                  border: '#1D4ED8',
                },
                'investor-relations': {
                  bg: 'rgba(126, 34, 206, 0.1)',
                  text: '#7E22CE',
                  border: '#7E22CE',
                },
                'capital-markets': {
                  bg: 'rgba(220, 38, 38, 0.1)',
                  text: '#DC2626',
                  border: '#DC2626',
                },
                financing: {
                  bg: 'rgba(5, 150, 105, 0.1)',
                  text: '#059669',
                  border: '#059669',
                },
                governance: {
                  bg: 'rgba(2, 132, 199, 0.1)',
                  text: '#0284C7',
                  border: '#0284C7',
                },
                earnings: {
                  bg: 'rgba(180, 83, 9, 0.1)',
                  text: '#B45309',
                  border: '#B45309',
                },
              }

              const categoryColor =
                categoryColors[change.category] || categoryColors.filing

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

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* Filing Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-6 border"
            style={{
              background: 'var(--color-surface-primary)',
              borderColor: 'var(--color-info)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
              <h3 className="h4" style={{ color: 'var(--color-text-primary)' }}>
                Next Filing Deadline
              </h3>
            </div>
            <p
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {timePeriod === 'day' && '45 days'}
              {timePeriod === 'week' && '42 days'}
              {timePeriod === 'month' && '15 days'}
            </p>
            <p className="caption" style={{ color: 'var(--color-text-secondary)' }}>
              {timePeriod === 'day' && '10-Q for Q2 2026'}
              {timePeriod === 'week' && '10-Q for Q2 2026'}
              {timePeriod === 'month' && '10-K for FY 2025'}
            </p>
          </motion.div>

          {/* Investor Relations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-6 border"
            style={{
              background: 'var(--color-surface-primary)',
              borderColor: '#7E22CE',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6" style={{ color: '#7E22CE' }} />
              <h3 className="h4" style={{ color: 'var(--color-text-primary)' }}>
                Investor Meetings Pending
              </h3>
            </div>
            <p
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {timePeriod === 'day' && '12'}
              {timePeriod === 'week' && '8'}
              {timePeriod === 'month' && '3'}
            </p>
            <p className="caption" style={{ color: 'var(--color-text-secondary)' }}>
              {timePeriod === 'day' && '7 institutional, 5 analyst calls'}
              {timePeriod === 'week' && '4 roadshow, 4 one-on-ones'}
              {timePeriod === 'month' && 'Investor day planning'}
            </p>
          </motion.div>

          {/* Covenant Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-6 border"
            style={{
              background: 'var(--color-surface-primary)',
              borderColor: 'var(--color-success)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
              <h3 className="h4" style={{ color: 'var(--color-text-primary)' }}>
                Debt Covenant Status
              </h3>
            </div>
            <p
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              100%
            </p>
            <p className="caption" style={{ color: 'var(--color-text-secondary)' }}>
              All {timePeriod === 'day' && '3'}{timePeriod === 'week' && '3'}
              {timePeriod === 'month' && '4'} covenants in full compliance
            </p>
          </motion.div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 rounded-xl p-8 border"
          style={{
            background: 'var(--color-surface-primary)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <div className="flex gap-4">
            <AlertCircle
              className="w-6 h-6 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--color-warning)' }}
            />
            <div>
              <h3 className="h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Compliance & Operations
              </h3>
              <p className="body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {timePeriod === 'day' &&
                  'All SEC filings current. 5 investor meetings completed with positive feedback. Debt covenants in full compliance.'}
                {timePeriod === 'week' &&
                  'Investor engagement strong with 18 meetings across institutions and analysts. 10-Q filing on track. Board governance activities progressing normally.'}
                {timePeriod === 'month' &&
                  'Successful financing activities completed ($500M debt issuance). Strong investor relations momentum with 62 meetings. All regulatory requirements met.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
