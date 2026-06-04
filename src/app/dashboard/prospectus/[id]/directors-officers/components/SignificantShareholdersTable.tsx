'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, AlertCircle, X, Edit2, Trash2, Send, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignificantShareholder } from '../types'

interface SignificantShareholdersTableProps {
  shareholders: SignificantShareholder[];
  onEdit: (shareholder: SignificantShareholder) => void;
  onDelete: (shareholderId: string) => void;
  onSendPIFInvite: (shareholder: SignificantShareholder) => void;
}

const pifStatusConfig = {
  required: { color: 'text-red-600', bgColor: 'bg-red-50', icon: X, label: 'Required' },
  draft: { color: 'text-amber-600', bgColor: 'bg-amber-50', icon: AlertCircle, label: 'Draft' },
  'in-progress': {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: AlertCircle,
    label: 'In Progress',
  },
  submitted: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: Check, label: 'Submitted' },
  approved: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: Check, label: 'Approved' },
};

export function SignificantShareholdersTable({
  shareholders,
  onEdit,
  onDelete,
  onSendPIFInvite,
}: SignificantShareholdersTableProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>10%+ Shareholders</CardTitle>
        <CardDescription>
          Significant shareholders (10% or greater ownership)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Ownership %</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Share Count</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">PIF Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Documents</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shareholders.map((shareholder, idx) => {
                const pifConfig =
                  pifStatusConfig[shareholder.pifStatus as keyof typeof pifStatusConfig];
                const PIFIcon = pifConfig?.icon || AlertCircle;

                return (
                  <motion.tr
                    key={shareholder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{shareholder.name}</div>
                      {shareholder.email && (
                        <div className="text-xs text-slate-500">{shareholder.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {shareholder.ownershipPercentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">
                        {shareholder.shareCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {shareholder.pifRequired ? (
                        <div
                          className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium w-fit ${pifConfig?.color} ${pifConfig?.bgColor}`}
                        >
                          <PIFIcon className="w-4 h-4" />
                          {pifConfig?.label}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Not required</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {shareholder.documents.length > 0 ? (
                        <div className="flex items-center gap-1 text-blue-600 cursor-pointer font-medium text-xs">
                          <FileText className="w-3 h-3" />
                          {shareholder.documents.length} file{shareholder.documents.length > 1 ? 's' : ''}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No docs</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(shareholder)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {shareholder.pifRequired &&
                          shareholder.pifStatus === 'required' && (
                            <button
                              onClick={() => onSendPIFInvite(shareholder)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Send PIF Invite"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                        <button
                          onClick={() => onDelete(shareholder.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {shareholders.length === 0 && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <p>No 10%+ shareholders yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
