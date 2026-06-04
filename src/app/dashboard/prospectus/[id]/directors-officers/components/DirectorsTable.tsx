'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  AlertCircle,
  X,
  Edit2,
  Download,
  Trash2,
  Send,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Director } from '../types'

interface DirectorsTableProps {
  directors: Director[];
  onEdit: (director: Director) => void;
  onDelete: (directorId: string) => void;
  onSendPIFInvite: (director: Director) => void;
  onUploadDocument: (director: Director, documentType: string) => void;
}

const roleLabels: Record<string, string> = {
  'independent-director': 'Independent Director',
  'audit-chair': 'Audit Committee Chair',
  'compensation-chair': 'Compensation Committee Chair',
  'governance-chair': 'Governance Committee Chair',
  'lead-director': 'Lead Director',
  'director': 'Director',
};

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

const independenceConfig = {
  independent: { color: 'text-emerald-600', label: 'Independent', icon: Check },
  management: { color: 'text-slate-600', label: 'Management', icon: AlertCircle },
  linked: { color: 'text-amber-600', label: 'Linked', icon: AlertCircle },
};

export function DirectorsTable({
  directors,
  onEdit,
  onDelete,
  onSendPIFInvite,
  onUploadDocument,
}: DirectorsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Directors</CardTitle>
        <CardDescription>Board members and their governance roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Independence</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Committees</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Residency</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">PIF Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Documents</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directors.map((director, idx) => {
                const pifConfig = pifStatusConfig[director.pifStatus as keyof typeof pifStatusConfig];
                const indConfig = independenceConfig[director.independence];
                const PIFIcon = pifConfig?.icon || AlertCircle;
                const IndIcon = indConfig?.icon || AlertCircle;

                return (
                  <motion.tr
                    key={director.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{director.name}</div>
                      <div className="text-xs text-slate-500">{director.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{roleLabels[director.role]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-2 ${indConfig?.color}`}>
                        <IndIcon className="w-4 h-4" />
                        <span className="text-xs">{indConfig?.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {director.committees.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {director.committees.map((comm) => (
                            <span
                              key={comm}
                              className="px-2 py-1 rounded bg-slate-200 text-xs text-slate-700 capitalize"
                            >
                              {comm}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="text-xs">
                        {director.residency.city && <div>{director.residency.city}</div>}
                        <div>
                          {director.residency.province ? `${director.residency.province}, ` : ''}
                          {director.residency.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${pifConfig?.color} ${pifConfig?.bgColor}`}>
                        <PIFIcon className="w-4 h-4" />
                        {pifConfig?.label}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {director.documents.length > 0 ? (
                        <div className="text-xs text-blue-600 cursor-pointer font-medium">
                          {director.documents.length} file{director.documents.length > 1 ? 's' : ''}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No docs</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(director)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {director.pifStatus === 'required' && (
                          <button
                            onClick={() => onSendPIFInvite(director)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Send PIF Invite"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === director.id ? null : director.id)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="More options"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(director.id)}
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

          {directors.length === 0 && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <p>No directors yet. Add one to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
