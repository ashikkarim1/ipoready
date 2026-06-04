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
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Officer } from '../types'

interface OfficersTableProps {
  officers: Officer[];
  onEdit: (officer: Officer) => void;
  onDelete: (officerId: string) => void;
  onRegisterSEDI: (officer: Officer) => void;
  onUpdateHoldings: (officer: Officer) => void;
}

const titleLabels: Record<string, string> = {
  ceo: 'Chief Executive Officer',
  cfo: 'Chief Financial Officer',
  coo: 'Chief Operating Officer',
  president: 'President',
  'general-counsel': 'General Counsel',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  'executive-vp': 'Executive Vice President',
  'vp-finance': 'VP Finance',
  'vp-operations': 'VP Operations',
  other: 'Other',
};

const sediStatusConfig = {
  'not-registered': { color: 'text-red-600', bgColor: 'bg-red-50', icon: X, label: 'Not Registered' },
  registered: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: Check, label: 'Registered' },
  pending: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: AlertCircle, label: 'Pending' },
  failed: { color: 'text-red-600', bgColor: 'bg-red-50', icon: X, label: 'Failed' },
};

export function OfficersTable({
  officers,
  onEdit,
  onDelete,
  onRegisterSEDI,
  onUpdateHoldings,
}: OfficersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatHoldings = (officer: Officer) => {
    const total = officer.holdings.commonShares + (officer.holdings.options || 0) + (officer.holdings.warrants || 0);
    return total.toLocaleString();
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Officers</CardTitle>
        <CardDescription>Executive team members and their shareholdings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Department</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">SEDI Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Holdings</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer, idx) => {
                const sediConfig = sediStatusConfig[officer.sediStatus as keyof typeof sediStatusConfig];
                const SEDIIcon = sediConfig?.icon || AlertCircle;

                return (
                  <motion.tr
                    key={officer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{officer.name}</div>
                      <div className="text-xs text-slate-500">{officer.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{titleLabels[officer.title]}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {officer.department ? (
                        <span className="text-xs capitalize">{officer.department}</span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium w-fit ${sediConfig?.color} ${sediConfig?.bgColor}`}
                      >
                        <SEDIIcon className="w-4 h-4" />
                        {sediConfig?.label}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onUpdateHoldings(officer)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {formatHoldings(officer)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(officer)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {officer.sediStatus === 'not-registered' && officer.reportableInsider && (
                          <button
                            onClick={() => onRegisterSEDI(officer)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Register for SEDI"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === officer.id ? null : officer.id)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="More options"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(officer.id)}
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

          {officers.length === 0 && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <p>No officers yet. Add one to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
