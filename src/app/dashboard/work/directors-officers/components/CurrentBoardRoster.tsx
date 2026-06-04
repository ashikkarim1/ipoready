'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge, Trash2, Edit2, Mail, Link2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Director {
  id: string
  name: string
  role: string
  email: string
  independence: 'independent' | 'management'
  committees: string[]
  yearsExperience: number
  annualComp?: number
  equity?: number
  status: 'active' | 'pending' | 'hired-via-ipoready'
  linkedInUrl?: string
  hiredViaIPOReady?: boolean
  findersFeeAmount?: number
}

interface CurrentBoardRosterProps {
  directors: Director[]
  onEdit?: (director: Director) => void
  onDelete?: (directorId: string) => void
}

export function CurrentBoardRoster({
  directors,
  onEdit,
  onDelete,
}: CurrentBoardRosterProps) {
  const getStatusBadge = (status: string, hiredViaIPOReady?: boolean) => {
    if (hiredViaIPOReady) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
          <Badge className="w-3 h-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Hired via IPOReady</span>
        </div>
      )
    }

    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
            <Badge className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Active</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
            <Badge className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Pending</span>
          </div>
        )
      default:
        return null
    }
  }

  const getIndependenceColor = (independence: string) => {
    return independence === 'independent'
      ? 'bg-purple-50 border-purple-200'
      : 'bg-slate-50 border-slate-200'
  }

  const getCommitteeLabel = (committee: string): string => {
    const labels: Record<string, string> = {
      'audit': 'Audit',
      'compensation': 'Compensation',
      'governance': 'Governance',
      'nominating': 'Nominating',
      'risk': 'Risk Management',
    }
    return labels[committee] || committee
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Current Board Roster</h3>
        <p className="text-sm text-slate-600">
          {directors.length} board member{directors.length !== 1 ? 's' : ''} •
          {' '}{directors.filter(d => d.independence === 'independent').length} independent director{directors.filter(d => d.independence === 'independent').length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Directors List */}
      {directors.length > 0 ? (
        <div className="space-y-3">
          {directors.map((director, idx) => (
            <motion.div
              key={director.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={`border overflow-hidden hover:shadow-md transition-shadow ${
                  getIndependenceColor(director.independence)
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{director.name}</h4>
                          {director.linkedInUrl && (
                            <a
                              href={director.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Link2 className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{director.role}</p>
                        {getStatusBadge(director.status, director.hiredViaIPOReady)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button
                            onClick={() => onEdit(director)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            onClick={() => onDelete(director.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Classification</p>
                        <p className="text-sm font-medium text-slate-900">
                          {director.independence === 'independent' ? 'Independent' : 'Management'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600 mb-1">Experience</p>
                        <p className="text-sm font-medium text-slate-900">{director.yearsExperience}+ yrs</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600 mb-1">Email</p>
                        <a href={`mailto:${director.email}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Contact
                        </a>
                      </div>
                    </div>

                    {/* Compensation Details */}
                    {(director.annualComp || director.equity) && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-white/50 rounded-lg border border-slate-200">
                        {director.annualComp && (
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Annual Compensation</p>
                            <p className="text-sm font-semibold text-slate-900">
                              ${(director.annualComp / 1000).toFixed(0)}K
                            </p>
                          </div>
                        )}
                        {director.equity && (
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Equity Package</p>
                            <p className="text-sm font-semibold text-slate-900">{director.equity.toFixed(2)}%</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Committees */}
                    {director.committees.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-2">Committee Assignments</p>
                        <div className="flex flex-wrap gap-2">
                          {director.committees.map(committee => (
                            <span
                              key={committee}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium"
                            >
                              {getCommitteeLabel(committee)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* IPOReady Hire Info */}
                    {director.hiredViaIPOReady && director.findersFeeAmount && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">Finders Fee Paid</p>
                          <p className="text-sm font-semibold text-blue-600">
                            ${(director.findersFeeAmount).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600">
                          15% of 1-year compensation for IPOReady introduction
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-slate-600 font-medium mb-2">No board members yet</p>
            <p className="text-sm text-slate-500 mb-4">Add your first director or officer to get started</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Board Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {directors.length > 0 && (
        <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Total Comp (Annual)</p>
                <p className="text-lg font-bold text-slate-900">
                  ${
                    Math.round(
                      directors.reduce((sum, d) => sum + (d.annualComp || 0), 0) / 1000,
                    )
                  }K
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Total Equity Granted</p>
                <p className="text-lg font-bold text-slate-900">
                  {(directors.reduce((sum, d) => sum + (d.equity || 0), 0)).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">IPOReady Hires</p>
                <p className="text-lg font-bold text-blue-600">
                  {directors.filter(d => d.hiredViaIPOReady).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
