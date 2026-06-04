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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Board Composition */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Board Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-600 mb-1">Independent Directors</p>
                <div className="text-2xl font-bold text-emerald-600">
                  {independentCount}/3
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(independentCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Gaps */}
        <Card className={`border-slate-200 ${criticalGaps.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Critical Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalGaps.length}</div>
            <p className="text-xs text-slate-600 mt-2">Must fix before IPO</p>
          </CardContent>
        </Card>

        {/* Warning Items */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{warningGaps.length}</div>
            <p className="text-xs text-slate-600 mt-2">Should address soon</p>
          </CardContent>
        </Card>

        {/* Compliance Timeline */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Est. Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">{estimatedMonths}m</p>
                <p className="text-xs text-slate-600">to compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Gaps List */}
      {criticalGaps.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <CardTitle className="text-slate-900">Critical Compliance Gaps</CardTitle>
                <CardDescription>These must be addressed before IPO listing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalGaps.map((gap, idx) => (
              <motion.div
                key={gap.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-white border border-red-100 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{gap.requirement}</h4>
                    <p className="text-sm text-slate-600">{gap.description}</p>
                  </div>
                  <div className="ml-4 px-3 py-1 bg-red-100 rounded-full">
                    <p className="text-xs font-medium text-red-700">CRITICAL</p>
                  </div>
                </div>

                {/* Role Badge and Market Comp */}
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Role</p>
                    <p className="text-sm font-medium text-slate-900">{gap.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Market Salary</p>
                    <p className="text-sm font-medium text-slate-900">
                      ${(gap.marketCompMin / 1000).toFixed(0)}K - ${(gap.marketCompMax / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={onFindTalent}
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                  style={{ background: '#E8312A', borderColor: '#E8312A' }}
                >
                  Find {gap.role} →
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warning Items */}
      {warningGaps.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <CardTitle className="text-slate-900">Items to Address</CardTitle>
                <CardDescription>Not critical, but should be resolved proactively</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {warningGaps.map((gap, idx) => (
              <motion.div
                key={gap.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-white border border-amber-100 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{gap.requirement}</h4>
                    <p className="text-sm text-slate-600">{gap.description}</p>
                  </div>
                  <div className="ml-4 px-3 py-1 bg-amber-100 rounded-full">
                    <p className="text-xs font-medium text-amber-700">WARNING</p>
                  </div>
                </div>

                {/* Role Badge and Market Comp */}
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Role</p>
                    <p className="text-sm font-medium text-slate-900">{gap.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Market Salary</p>
                    <p className="text-sm font-medium text-slate-900">
                      ${(gap.marketCompMin / 1000).toFixed(0)}K - ${(gap.marketCompMax / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={onFindTalent}
                  variant="outline"
                  className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Find {gap.role} →
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Gaps Message */}
      {gaps.length === 0 && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle className="text-slate-900">All Gaps Addressed</CardTitle>
                <CardDescription>Your board meets all compliance requirements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">
              Great work! Your board composition meets {selectedExchange.toUpperCase()} requirements. You're ready for IPO.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
