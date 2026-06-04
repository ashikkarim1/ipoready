'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Check, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Gap {
  id: string
  type: 'critical' | 'warning'
  role: string
  requirement: string
  description: string
  marketCompMin: number
  marketCompMax: number
  equityMin: number
  equityMax: number
}

interface Director {
  id: string
  name: string
  role: string
  independence: 'independent' | 'management'
  committees: string[]
  status: 'active' | 'pending' | 'hired-via-ipoready'
}

interface ComplianceGapDashboardProps {
  gaps: Gap[]
  directors: Director[]
  selectedExchange: string
  onFindTalent: () => void
}

export function ComplianceGapDashboard({
  gaps,
  directors,
  selectedExchange,
  onFindTalent,
}: ComplianceGapDashboardProps) {
  const criticalGaps = gaps.filter(g => g.type === 'critical')
  const warningGaps = gaps.filter(g => g.type === 'warning')
  const independentCount = directors.filter(d => d.independence === 'independent').length

  // Calculate estimated timeline
  const estimatedMonths = criticalGaps.length * 2 + warningGaps.length * 1

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Board Composition */}
        <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
          <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-widest">Board Composition</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-text-muted mb-1">Independent Directors</p>
              <div className="text-2xl font-bold text-success">
                {independentCount}/3
              </div>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: '#E5E4E0' }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${(independentCount / 3) * 100}%`, background: '#2D7A5F' }}
              />
            </div>
          </div>
        </div>

        {/* Critical Gaps */}
        <div className={`card p-6 card-hover`} style={{ background: criticalGaps.length > 0 ? '#FDECEB' : '#FFFFFF', border: '1px solid ' + (criticalGaps.length > 0 ? '#F5E5E1' : '#E5E4E0') }}>
          <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-widest">Critical Gaps</h4>
          <div className="text-2xl font-bold text-accent">{criticalGaps.length}</div>
          <p className="text-xs text-text-muted mt-2">Must fix before IPO</p>
        </div>

        {/* Warning Items */}
        <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
          <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-widest">Warnings</h4>
          <div className="text-2xl font-bold" style={{ color: '#B45309' }}>{warningGaps.length}</div>
          <p className="text-xs text-text-muted mt-2">Should address soon</p>
        </div>

        {/* Compliance Timeline */}
        <div className="card p-6 card-hover" style={{ border: '1px solid #E5E4E0' }}>
          <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-widest">Est. Timeline</h4>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-info" />
            <div>
              <p className="text-2xl font-bold text-nav">{estimatedMonths}m</p>
              <p className="text-xs text-text-muted">to compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Gaps List */}
      {criticalGaps.length > 0 && (
        <div className="card p-6 card-hover" style={{ background: '#FDECEB', border: '1px solid #F5E5E1' }}>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-semibold text-nav">Critical Compliance Gaps</h3>
              <p className="text-sm text-text-muted">These must be addressed before IPO listing</p>
            </div>
          </div>
          <div className="space-y-4">
            {criticalGaps.map((gap, idx) => (
              <motion.div
                key={gap.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="p-4 bg-white border rounded-lg space-y-3"
                style={{ borderColor: '#F5E5E1' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-nav mb-1">{gap.requirement}</h4>
                    <p className="text-sm text-text-muted">{gap.description}</p>
                  </div>
                  <div className="ml-4 pill px-3 py-1" style={{ background: '#FDECEB', color: '#E8312A' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest">Critical</p>
                  </div>
                </div>

                {/* Role Badge and Market Comp */}
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Role</p>
                    <p className="text-sm font-medium text-nav">{gap.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Market Salary</p>
                    <p className="text-sm font-medium text-nav">
                      ${(gap.marketCompMin / 1000).toFixed(0)}K - ${(gap.marketCompMax / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={onFindTalent}
                  className="btn btn-accent w-full mt-3 gap-2 font-semibold px-6 py-2.5 rounded-full"
                >
                  Find {gap.role} →
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Items */}
      {warningGaps.length > 0 && (
        <div className="card p-6 card-hover" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5" style={{ color: '#B45309' }} />
            <div>
              <h3 className="font-semibold text-nav">Items to Address</h3>
              <p className="text-sm text-text-muted">Not critical, but should be resolved proactively</p>
            </div>
          </div>
          <div className="space-y-4">
            {warningGaps.map((gap, idx) => (
              <motion.div
                key={gap.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="p-4 bg-white border rounded-lg space-y-3"
                style={{ borderColor: '#FCD34D' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-nav mb-1">{gap.requirement}</h4>
                    <p className="text-sm text-text-muted">{gap.description}</p>
                  </div>
                  <div className="ml-4 pill px-3 py-1" style={{ background: '#FEF3C7', color: '#B45309' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest">Warning</p>
                  </div>
                </div>

                {/* Role Badge and Market Comp */}
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Role</p>
                    <p className="text-sm font-medium text-nav">{gap.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Market Salary</p>
                    <p className="text-sm font-medium text-nav">
                      ${(gap.marketCompMin / 1000).toFixed(0)}K - ${(gap.marketCompMax / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={onFindTalent}
                  className="btn btn-secondary w-full mt-3 gap-2 font-semibold px-6 py-2.5 rounded-full"
                >
                  Find {gap.role} →
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Gaps Message */}
      {gaps.length === 0 && (
        <div className="card p-6 card-hover" style={{ background: '#EAF5F0', border: '1px solid #D5EDE8' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <h3 className="font-semibold text-success">All Gaps Addressed</h3>
              <p className="text-sm text-text-muted">Your board meets all compliance requirements</p>
            </div>
          </div>
          <p className="text-sm text-nav">
            Great work! Your board composition meets {selectedExchange.toUpperCase()} requirements. You're ready for IPO.
          </p>
        </div>
      )}
    </div>
  )
}
