'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Director {
  id: string
  name: string
  role: string
  independence: 'independent' | 'management'
  committees: string[]
  status: 'active' | 'pending' | 'hired-via-ipoready'
}

interface ComplianceRequirementMappingProps {
  directors: Director[]
  selectedExchange: string
}

interface Requirement {
  id: string
  name: string
  description: string
  required: boolean
  met: boolean
  metBy: string[]
  notes: string
}

export function ComplianceRequirementMapping({
  directors,
  selectedExchange,
}: ComplianceRequirementMappingProps) {
  // Build compliance requirements based on exchange and current directors
  const independentCount = directors.filter(d => d.independence === 'independent').length
  const hasCEO = directors.some(d => d.role.toLowerCase().includes('ceo'))
  const hasCFO = directors.some(d => d.role.toLowerCase().includes('cfo'))
  const hasAuditChair = directors.some(d => d.committees.includes('audit'))
  const ceoName = directors.find(d => d.role.toLowerCase().includes('ceo'))?.name || ''
  const cfoCName = directors.find(d => d.role.toLowerCase().includes('cfo'))?.name || ''
  const auditChairName = directors.find(d => d.committees.includes('audit'))?.name || ''

  let requirements: Requirement[] = [
    {
      id: 'ceo',
      name: 'CEO Appointed',
      description: 'Chief Executive Officer must be appointed',
      required: true,
      met: hasCEO,
      metBy: hasCEO ? [ceoName] : [],
      notes: 'Required for all exchanges',
    },
    {
      id: 'cfo',
      name: 'CFO Appointed',
      description: 'Chief Financial Officer must be appointed',
      required: true,
      met: hasCFO,
      metBy: hasCFO ? [cfoCName] : [],
      notes: 'Required for all exchanges',
    },
    {
      id: 'audit-chair',
      name: 'Audit Committee Chair',
      description: 'Board must have an audit committee with a designated chair',
      required: true,
      met: hasAuditChair,
      metBy: hasAuditChair ? [auditChairName] : [],
      notes: 'Required by NI 52-110',
    },
  ]

  // Add exchange-specific requirements
  if (selectedExchange === 'tsxv') {
    requirements.push({
      id: 'independent-directors',
      name: 'Independent Directors (TSXV)',
      description: 'Minimum 2 independent directors required (typically 3 for larger companies)',
      required: true,
      met: independentCount >= 2,
      metBy: directors.filter(d => d.independence === 'independent').map(d => d.name),
      notes: `Currently have ${independentCount} independent directors, need ${Math.max(2, 3 - independentCount)} more`,
    })
  } else if (selectedExchange === 'tsx') {
    requirements.push({
      id: 'independent-directors',
      name: 'Independent Directors (TSX)',
      description: 'Majority of directors must be independent (typically 3 out of 5 minimum)',
      required: true,
      met: independentCount >= 3,
      metBy: directors.filter(d => d.independence === 'independent').map(d => d.name),
      notes: `Currently have ${independentCount} independent directors, need ${Math.max(3, 5 - independentCount)} more`,
    })
  } else if (selectedExchange === 'nasdaq') {
    requirements.push({
      id: 'independent-directors',
      name: 'Independent Directors (NASDAQ)',
      description: 'Majority of directors must be independent (at least 3)',
      required: true,
      met: independentCount >= 3,
      metBy: directors.filter(d => d.independence === 'independent').map(d => d.name),
      notes: `Currently have ${independentCount} independent directors, need ${Math.max(3, 5 - independentCount)} more`,
    })
  } else if (selectedExchange === 'nyse') {
    requirements.push({
      id: 'independent-directors',
      name: 'Independent Directors (NYSE)',
      description: 'Majority of directors must be independent (all board committees must be all-independent)',
      required: true,
      met: independentCount >= 4,
      metBy: directors.filter(d => d.independence === 'independent').map(d => d.name),
      notes: `Currently have ${independentCount} independent directors, need ${Math.max(4, 6 - independentCount)} more`,
    })
  }

  requirements.push({
    id: 'financial-expert',
    name: 'Audit Committee Financial Expert',
    description: 'At least one audit committee member must have financial expertise (Audit Committee Financial Expert per NI 52-110)',
    required: true,
    met: false, // Would need additional data to determine
    metBy: [],
    notes: 'Verify audit committee member qualifications',
  })

  const metCount = requirements.filter(r => r.met).length
  const requiredMetCount = requirements.filter(r => r.required && r.met).length
  const requiredCount = requirements.filter(r => r.required).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-slate-300 text-sm mb-1">Overall Compliance Status</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold">
                  {metCount}/{requirements.length}
                </p>
                <p className="text-slate-400 mb-1">requirements met</p>
              </div>
            </div>

            <div>
              <p className="text-slate-300 text-sm mb-1">Critical Requirements</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-emerald-400">
                  {requiredMetCount}/{requiredCount}
                </p>
                <p className="text-slate-400 mb-1">mandatory items</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(metCount / requirements.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {Math.round((metCount / requirements.length) * 100)}% compliance with {selectedExchange.toUpperCase()} requirements
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Detail Table */}
      <Card className="border-slate-200 bg-white overflow-hidden">
        <CardHeader>
          <CardTitle>Detailed Compliance Requirements</CardTitle>
          <CardDescription>
            Mapping of {selectedExchange.toUpperCase()} requirements to your current board composition
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Requirement</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Met By</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Notes</th>
                </tr>
              </thead>

              <tbody>
                {requirements.map((req, idx) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`border-b border-slate-200 ${
                      req.met ? 'bg-white' : req.required ? 'bg-red-50' : 'bg-amber-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{req.name}</p>
                        <p className="text-xs text-slate-600 mt-1">{req.description}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {req.met ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Met</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                            <X className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Not Met</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {req.metBy.length > 0 ? (
                        <div className="space-y-1">
                          {req.metBy.map(name => (
                            <p key={name} className="text-xs text-slate-700">
                              {name}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">--</p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">{req.notes}</p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status Alert */}
      {requiredMetCount < requiredCount && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Action Required</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            <p className="text-sm text-slate-700">
              You have <span className="font-semibold">{requiredCount - requiredMetCount}</span> unmet mandatory
              requirement{requiredCount - requiredMetCount !== 1 ? 's' : ''} for {selectedExchange.toUpperCase()} listing:
            </p>

            <ul className="space-y-2">
              {requirements
                .filter(r => r.required && !r.met)
                .map(req => (
                  <li key={req.id} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{req.name}</span>
                  </li>
                ))}
            </ul>

            <p className="text-xs text-slate-600 pt-2 border-t border-red-200 mt-3">
              Use the Marketplace tab to find and hire qualified professionals to meet these requirements.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Compliance Met Alert */}
      {requiredMetCount === requiredCount && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-emerald-900">All Mandatory Requirements Met</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-slate-700">
              Your board meets all mandatory compliance requirements for {selectedExchange.toUpperCase()} listing. Continue
              monitoring optional recommendations for best practices.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
