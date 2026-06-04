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
        <span className="pill px-2 py-1 text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
          <Badge className="w-3 h-3 inline mr-1" />
          Hired via IPOReady
        </span>
      )
    }

    switch (status) {
      case 'active':
        return (
          <span className="pill px-2 py-1 text-xs font-semibold" style={{ background: '#EAF5F0', color: '#2D7A5F' }}>
            <Badge className="w-3 h-3 inline mr-1" />
            Active
          </span>
        )
      case 'pending':
        return (
          <span className="pill px-2 py-1 text-xs font-semibold" style={{ background: '#FEF3C7', color: '#B45309' }}>
            <Badge className="w-3 h-3 inline mr-1" />
            Pending
          </span>
        )
      default:
        return null
    }
  }

  const getIndependenceColor = (independence: string) => {
    return independence === 'independent'
      ? 'border-2 border-info'
      : 'border-border'
  }

  const getIndependenceBg = (independence: string) => {
    return independence === 'independent' ? '#EFF6FF' : '#FFFFFF'
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
        <h3 className="text-lg font-semibold text-nav mb-2">Current Board Roster</h3>
        <p className="text-sm text-text-muted">
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
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <div
                className={`card p-4 card-hover overflow-hidden ${
                  getIndependenceColor(director.independence)
                }`}
                style={{ background: getIndependenceBg(director.independence), border: '1px solid ' + (director.independence === 'independent' ? '#BFDBFE' : '#E5E4E0') }}
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-nav">{director.name}</h4>
                        {director.linkedInUrl && (
                          <a
                            href={director.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-info hover:opacity-70"
                          >
                            <Link2 className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mb-2">{director.role}</p>
                      {getStatusBadge(director.status, director.hiredViaIPOReady)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          onClick={() => onEdit(director)}
                          className="btn btn-secondary h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          onClick={() => onDelete(director.id)}
                          className="btn btn-secondary h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-accent" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Classification</p>
                      <p className="text-sm font-medium text-nav">
                        {director.independence === 'independent' ? 'Independent' : 'Management'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-text-muted mb-1">Experience</p>
                      <p className="text-sm font-medium text-nav">{director.yearsExperience}+ yrs</p>
                    </div>

                    <div>
                      <p className="text-xs text-text-muted mb-1">Email</p>
                      <a href={`mailto:${director.email}`} className="text-sm font-medium text-info hover:opacity-70 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Contact
                      </a>
                    </div>
                  </div>

                  {/* Compensation Details */}
                  {(director.annualComp || director.equity) && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border" style={{ background: '#F7F6F4' }}>
                      {director.annualComp && (
                        <div>
                          <p className="text-xs text-text-muted mb-1">Annual Compensation</p>
                          <p className="text-sm font-semibold text-nav">
                            ${(director.annualComp / 1000).toFixed(0)}K
                          </p>
                        </div>
                      )}
                      {director.equity && (
                        <div>
                          <p className="text-xs text-text-muted mb-1">Equity Package</p>
                          <p className="text-sm font-semibold text-nav">{director.equity.toFixed(2)}%</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Committees */}
                  {director.committees.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-text-muted mb-2">Committee Assignments</p>
                      <div className="flex flex-wrap gap-2">
                        {director.committees.map(committee => (
                          <span key={committee} className="pill px-2 py-1 text-xs font-semibold" style={{ background: '#F7F6F4', color: '#1A1A1A' }}>
                            {getCommitteeLabel(committee)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* IPOReady Hire Info */}
                  {director.hiredViaIPOReady && director.findersFeeAmount && (
                    <div className="p-3 rounded-lg space-y-2" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-nav">Finders Fee Paid</p>
                        <p className="text-sm font-semibold text-info">
                          ${(director.findersFeeAmount).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-text-muted">
                        15% of 1-year compensation for IPOReady introduction
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
          <p className="text-nav font-medium mb-2">No board members yet</p>
          <p className="text-sm text-text-muted mb-4">Add your first director or officer to get started</p>
          <Button className="btn btn-accent gap-2 font-semibold px-6 py-2.5 rounded-full">
            Add Board Member
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      {directors.length > 0 && (
        <div className="card p-6 card-hover" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1 uppercase font-semibold tracking-widest">Total Comp (Annual)</p>
              <p className="text-lg font-bold text-nav">
                ${
                  Math.round(
                    directors.reduce((sum, d) => sum + (d.annualComp || 0), 0) / 1000,
                  )
                }K
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1 uppercase font-semibold tracking-widest">Total Equity Granted</p>
              <p className="text-lg font-bold text-nav">
                {(directors.reduce((sum, d) => sum + (d.equity || 0), 0)).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1 uppercase font-semibold tracking-widest">IPOReady Hires</p>
              <p className="text-lg font-bold text-info">
                {directors.filter(d => d.hiredViaIPOReady).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
