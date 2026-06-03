'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export interface ShareholderEntry {
  id: string
  name: string
  shareClass: string
  shares: number
  vestingStart?: string
  vestingCliff?: number
  vestingPeriod?: number
  strikePrice?: number
}

interface CapTableProps {
  data: ShareholderEntry[]
  isEditable: boolean
  onDataChange?: (data: ShareholderEntry[]) => void
  onAddRow?: () => void
  onDeleteRow?: (id: string) => void
}

export function CapTableSpreadsheet({
  data,
  isEditable,
  onDataChange,
  onAddRow,
  onDeleteRow,
}: CapTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ShareholderEntry>>({})

  // Calculate total shares and ownership percentages
  const totalShares = useMemo(() => {
    return data.reduce((sum, row) => sum + row.shares, 0)
  }, [data])

  // Calculate fully diluted shares (assume 20% option pool unless specified)
  const fullyDilutedShares = useMemo(() => {
    return totalShares * 1.2
  }, [totalShares])

  // Calculate ownership percentages
  const withOwnership = useMemo(() => {
    return data.map((row) => ({
      ...row,
      percentBasic: totalShares > 0 ? (row.shares / totalShares) * 100 : 0,
      percentDiluted: fullyDilutedShares > 0 ? (row.shares / fullyDilutedShares) * 100 : 0,
    }))
  }, [data, totalShares, fullyDilutedShares])

  const handleEdit = useCallback(
    (row: ShareholderEntry) => {
      setEditingId(row.id)
      setEditValues({ ...row })
    },
    []
  )

  const handleSave = useCallback(() => {
    if (!editingId || !editValues.name) return

    const updatedData = withOwnership.map((row) =>
      row.id === editingId ? { ...row, ...editValues } : row
    )

    if (onDataChange) {
      onDataChange(updatedData)
    }

    setEditingId(null)
    setEditValues({})
  }, [editingId, editValues, onDataChange, withOwnership])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditValues({})
  }, [])

  const handleFieldChange = useCallback(
    (field: keyof ShareholderEntry, value: any) => {
      setEditValues((prev) => ({
        ...prev,
        [field]: field === 'shares' ? parseInt(value) || 0 : value,
      }))
    },
    []
  )

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full body-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Shareholder Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Share Class
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                # Shares
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Vesting Start
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                Cliff (mo)
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                Period (mo)
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                % Basic
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                % Diluted
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                Strike Price
              </th>
              {isEditable && (
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                  Action
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {withOwnership.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
                  editingId === row.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {editingId === row.id ? (
                  // Edit mode
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editValues.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full rounded border border-blue-300 px-2 py-1 body-sm dark:border-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editValues.shareClass || 'common'}
                        onChange={(e) => handleFieldChange('shareClass', e.target.value)}
                        className="w-full rounded border border-blue-300 px-2 py-1 body-sm dark:border-blue-600 dark:bg-gray-800"
                      >
                        <option>common</option>
                        <option>preferred_a</option>
                        <option>preferred_b</option>
                        <option>warrant</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editValues.shares || 0}
                        onChange={(e) => handleFieldChange('shares', e.target.value)}
                        className="w-full rounded border border-blue-300 px-2 py-1 text-right body-sm dark:border-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={editValues.vestingStart || ''}
                        onChange={(e) => handleFieldChange('vestingStart', e.target.value)}
                        className="w-full rounded border border-blue-300 px-2 py-1 body-sm dark:border-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editValues.vestingCliff || ''}
                        onChange={(e) => handleFieldChange('vestingCliff', e.target.value)}
                        className="w-full rounded border border-blue-300 px-2 py-1 text-right body-sm dark:border-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editValues.vestingPeriod || ''}
                        onChange={(e) => handleFieldChange('vestingPeriod', e.target.value)}
                        className="w-full rounded border border-blue-300 px-2 py-1 text-right body-sm dark:border-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {((editValues.shares || 0) / (totalShares || 1) * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {((editValues.shares || 0) / (fullyDilutedShares || 1) * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editValues.strikePrice || ''}
                        onChange={(e) => handleFieldChange('strikePrice', e.target.value)}
                        step="0.01"
                        className="w-full rounded border border-blue-300 px-2 py-1 text-right body-sm dark:border-blue-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handleSave}
                          className="rounded bg-green-500 p-1 text-white hover:bg-green-600"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="rounded bg-gray-400 p-1 text-white hover:bg-gray-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.shareClass}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                      {row.shares.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.vestingStart ? new Date(row.vestingStart).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {row.vestingCliff || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {row.vestingPeriod || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {row.percentBasic.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {row.percentDiluted.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      ${row.strikePrice?.toFixed(2) || '-'}
                    </td>
                    {isEditable && (
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteRow?.(row.id)}
                            className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="label-sm font-semibold text-gray-600 dark:text-gray-400">Total Shares</p>
            <p className="mt-1 h4 font-bold text-gray-900 dark:text-gray-100">
              {totalShares.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="label-sm font-semibold text-gray-600 dark:text-gray-400">
              Fully Diluted (20%)
            </p>
            <p className="mt-1 h4 font-bold text-gray-900 dark:text-gray-100">
              {fullyDilutedShares.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="label-sm font-semibold text-gray-600 dark:text-gray-400">Shareholders</p>
            <p className="mt-1 h4 font-bold text-gray-900 dark:text-gray-100">{data.length}</p>
          </div>
          {isEditable && (
            <button
              onClick={onAddRow}
              className="flex items-center gap-2 rounded bg-blue-500 px-3 py-2 label font-semibold text-white hover:bg-blue-600"
            >
              <Plus size={16} /> Add Row
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
