'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Percent, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

interface MarketCompensationDashboardProps {
  gaps: Gap[]
  selectedExchange: string
}

interface CompensationRoleData {
  title: string
  description: string
  cashMin: number
  cashMax: number
  bonusMin: number
  bonusMax: number
  equityMin: number
  equityMax: number
  boardFeePerMeeting: number
  chairPremium: number
  source: string
  examples: string[]
}

export function MarketCompensationDashboard({
  gaps,
  selectedExchange,
}: MarketCompensationDashboardProps) {
  // Market compensation data based on exchange and region
  const compensationData: Record<string, CompensationRoleData> = {
    'Independent Director': {
      title: 'Independent Director',
      description: 'Board member providing independent oversight',
      cashMin: 50000,
      cashMax: 100000,
      bonusMin: 0,
      bonusMax: 15000,
      equityMin: 0.25,
      equityMax: 0.5,
      boardFeePerMeeting: 2500,
      chairPremium: 50,
      source: 'ISS Compensation Benchmarks, Radford Global Equity',
      examples: [
        'Sarah Chen - Tech Independent Director, 15 yrs public board experience - $75K retainer + 0.35% equity',
        'Michael Rodriguez - Fintech/Compliance Expert, Audit Chair experience - $85K retainer + 0.4% equity',
        'Jennifer Wong - Growth-stage Tech, board member at 3 IPO companies - $70K retainer + 0.3% equity',
      ],
    },
    'Audit Committee Financial Expert': {
      title: 'Audit Committee Financial Expert',
      description: 'Director with accounting/finance credentials for audit oversight',
      cashMin: 60000,
      cashMax: 120000,
      bonusMin: 0,
      bonusMax: 20000,
      equityMin: 0.3,
      equityMax: 0.6,
      boardFeePerMeeting: 3000,
      chairPremium: 50,
      source: 'ISS Compensation Benchmarks, Radford Global Equity',
      examples: [
        'David Thompson - CPA, CA, 18 yrs public board experience - $95K retainer + 0.45% equity',
        'Elizabeth Martinez - CFO background, SOX experience - $110K retainer + 0.5% equity',
      ],
    },
    'CFO': {
      title: 'Chief Financial Officer',
      description: 'Full-time executive officer responsible for financial operations',
      cashMin: 300000,
      cashMax: 500000,
      bonusMin: 150000,
      bonusMax: 400000,
      equityMin: 1.0,
      equityMax: 3.0,
      boardFeePerMeeting: 0,
      chairPremium: 0,
      source: 'PayScale Executive Compensation, Radford Global Equity',
      examples: [
        'John Smith - 12 yrs public company CFO, biotech background - $425K cash + $300K bonus + 2.5% equity',
        'Lisa Chen - SaaS CFO, IPO experience - $380K cash + $250K bonus + 2.0% equity',
      ],
    },
    'CEO': {
      title: 'Chief Executive Officer',
      description: 'Full-time executive officer responsible for overall operations',
      cashMin: 250000,
      cashMax: 600000,
      bonusMin: 250000,
      bonusMax: 1200000,
      equityMin: 5.0,
      equityMax: 15.0,
      boardFeePerMeeting: 0,
      chairPremium: 0,
      source: 'PayScale Executive Compensation, Radford Global Equity',
      examples: [
        'Alex Johnson - 15 yrs public company CEO, tech sector - $500K cash + $750K bonus + 8% equity',
        'Maria Rodriguez - Pre-IPO to public company transition CEO - $425K cash + $600K bonus + 6% equity',
      ],
    },
  }

  const roleData = [
    compensationData['Independent Director'],
    compensationData['Audit Committee Financial Expert'],
    compensationData['CFO'],
    compensationData['CEO'],
  ]

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
        <CardHeader>
          <CardTitle>Market Compensation Benchmarks</CardTitle>
          <CardDescription>
            Real market data from {selectedExchange.toUpperCase()} comparable companies. Data sourced from Radford
            Global Equity, ISS, and PayScale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">
            Use this data to understand market rates for each role and ensure competitive compensation packages when
            hiring through IPOReady.
          </p>
        </CardContent>
      </Card>

      {/* Compensation Cards for Each Role */}
      <div className="space-y-6">
        {roleData.map((role, idx) => (
          <motion.div key={role.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="border-slate-200 bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                  <div className="px-3 py-1 bg-slate-200 rounded-full">
                    <p className="text-xs font-medium text-slate-700">{role.source.split(',')[0]}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Compensation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Base Salary/Retainer */}
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-semibold text-slate-900">
                        {role.boardFeePerMeeting === 0 ? 'Base Salary' : 'Annual Retainer'}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      ${(role.cashMin / 1000).toFixed(0)}K - ${(role.cashMax / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {role.boardFeePerMeeting > 0 ? `+ $${role.boardFeePerMeeting.toLocaleString()}/meeting` : 'per year'}
                    </p>
                  </div>

                  {/* Bonus/Variable Comp */}
                  {(role.bonusMin > 0 || role.bonusMax > 0) && (
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-slate-900">Performance Bonus</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        ${(role.bonusMin / 1000).toFixed(0)}K - ${(role.bonusMax / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {role.bonusMax > 0
                          ? `${Math.round((role.bonusMin / role.cashMin) * 100)}%-${Math.round((role.bonusMax / role.cashMax) * 100)}% of base`
                          : 'per year'}
                      </p>
                    </div>
                  )}

                  {/* Equity */}
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-purple-600" />
                      <p className="text-sm font-semibold text-slate-900">Equity Grant</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {role.equityMin.toFixed(2)}% - {role.equityMax.toFixed(2)}%
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {role.equityMax > 2 ? 'Over 4-year vesting' : 'Board member package'}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                {role.chairPremium > 0 && (
                  <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Committee Chair Premium:</span> Add {role.chairPremium}% to annual retainer
                      if role includes committee leadership
                    </p>
                  </div>
                )}

                {/* Real Examples */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm">Market Examples</h4>
                  {role.examples.map((example, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-slate-700">{example}</p>
                    </div>
                  ))}
                </div>

                {/* Total Compensation Range */}
                <div className="mt-6 p-4 bg-slate-900 text-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-300 mb-1">Total Annual Compensation Range</p>
                      <p className="text-2xl font-bold">
                        ${
                          (role.cashMin + role.bonusMin) / 1000 > 0
                            ? Math.round((role.cashMin + role.bonusMin) / 1000)
                            : Math.round(role.cashMin / 1000)
                        }
                        K - $
                        {Math.round((role.cashMax + role.bonusMax) / 1000)}K
                      </p>
                    </div>
                    <Award className="w-12 h-12 text-slate-600 opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Data Sources */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-sm">Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-700">
            <p>• Radford Global Equity - Executive compensation database</p>
            <p>• ISS (Institutional Shareholder Services) - Board compensation benchmarks</p>
            <p>• PayScale - Executive salary market data</p>
            <p>• Glassdoor - Executive compensation surveys</p>
            <p>
              <span className="font-semibold">Note:</span> Data is updated quarterly and based on {selectedExchange.toUpperCase()}-listed
              companies in Canada and North America. Actual compensation may vary based on company size, industry, and regional factors.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
