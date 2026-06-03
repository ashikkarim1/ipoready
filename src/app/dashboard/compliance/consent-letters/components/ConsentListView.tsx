'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface ConsentLetter {
  id: string
  company_id: string
  from_entity: string
  entity_type: string
  consent_type: string
  status: 'pending' | 'received' | 'rejected' | 'expired' | 'withdrawn'
  document_url: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
}

interface ConsentListViewProps {
  consents: ConsentLetter[]
  onSelectConsent: (consent: ConsentLetter) => void
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  received: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  expired: 'bg-orange-100 text-orange-800 border-orange-300',
  withdrawn: 'bg-slate-100 text-slate-800 border-slate-300',
}

const statusIcons = {
  pending: '⏳',
  received: '✓',
  rejected: '✗',
  expired: '⚠',
  withdrawn: '↩',
}

const entityTypeColors = {
  auditor: 'text-blue-600 bg-blue-50',
  lawyer: 'text-purple-600 bg-purple-50',
  'valuation-expert': 'text-emerald-600 bg-emerald-50',
  'environmental-expert': 'text-amber-600 bg-amber-50',
  'other-expert': 'text-slate-600 bg-slate-50',
}

export default function ConsentListView({
  consents,
  onSelectConsent,
}: ConsentListViewProps) {
  const sortedConsents = [...consents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              From Entity
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              Consent Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              Expiry Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              Document
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {sortedConsents.map((consent, index) => (
            <motion.tr
              key={consent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectConsent(consent)}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <p className="font-semibold text-slate-900">
                  {consent.from_entity}
                </p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    entityTypeColors[consent.entity_type as keyof typeof entityTypeColors] ||
                    entityTypeColors['other-expert']
                  }`}
                >
                  {consent.entity_type.replace(/-/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">
                {consent.consent_type.replace(/-/g, ' ')}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${
                    statusColors[consent.status]
                  }`}
                >
                  <span>{statusIcons[consent.status]}</span>
                  <span className="capitalize">{consent.status}</span>
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">
                {consent.expiry_date ? (
                  <div>
                    <p>{format(new Date(consent.expiry_date), 'MMM d, yyyy')}</p>
                    {new Date(consent.expiry_date) < new Date() && (
                      <p className="text-red-600 font-semibold text-xs mt-1">
                        Expired
                      </p>
                    )}
                    {new Date(consent.expiry_date).getTime() -
                      Date.now() <
                      30 * 24 * 60 * 60 * 1000 && (
                      <p className="text-orange-600 font-semibold text-xs mt-1">
                        Expiring soon
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400">N/A</p>
                )}
              </td>
              <td className="px-6 py-4 text-sm">
                {consent.document_url ? (
                  <a
                    href={consent.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Download
                  </a>
                ) : (
                  <p className="text-slate-400">No document</p>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {format(new Date(consent.created_at), 'MMM d, yyyy')}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
