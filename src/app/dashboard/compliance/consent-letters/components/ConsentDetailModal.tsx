'use client'

import React, { useState } from 'react'
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

interface ConsentDetailModalProps {
  consent: ConsentLetter
  onClose: () => void
  onUpdate: (consentId: string, updates: Partial<ConsentLetter>) => Promise<void>
  onDelete: (consentId: string) => Promise<void>
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

export default function ConsentDetailModal({
  consent,
  onClose,
  onUpdate,
  onDelete,
}: ConsentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editStatus, setEditStatus] = useState(consent.status)
  const [editExpiryDate, setEditExpiryDate] = useState(
    consent.expiry_date ? consent.expiry_date.split('T')[0] : ''
  )
  const [editDocumentUrl, setEditDocumentUrl] = useState(consent.document_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(consent.id, {
        status: editStatus,
        expiry_date: editExpiryDate || null,
        document_url: editDocumentUrl || null,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving consent:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(consent.id)
    } catch (error) {
      console.error('Error deleting consent:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {consent.from_entity}
            </h2>
            <p className="text-slate-600">
              {consent.consent_type.replace(/-/g, ' ')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-slate-700"
          >
            ✕
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-3">Current Status</h3>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${statusColors[consent.status]}`}>
                <span>{statusIcons[consent.status]}</span>
                <span className="capitalize">{consent.status}</span>
              </span>
              {isEditing && (
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value as ConsentLetter['status']
                    )
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg body-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block label font-semibold text-slate-700 mb-2">
                Entity Type
              </label>
              <p className="text-slate-900 capitalize">
                {consent.entity_type.replace(/-/g, ' ')}
              </p>
            </div>
            <div>
              <label className="block label font-semibold text-slate-700 mb-2">
                Consent Type
              </label>
              <p className="text-slate-900">
                {consent.consent_type.replace(/-/g, ' ')}
              </p>
            </div>
            <div>
              <label className="block label font-semibold text-slate-700 mb-2">
                Created Date
              </label>
              <p className="text-slate-900">
                {format(new Date(consent.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <label className="block label font-semibold text-slate-700 mb-2">
                Last Updated
              </label>
              <p className="text-slate-900">
                {format(new Date(consent.updated_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block label font-semibold text-slate-700 mb-2">
              Expiry Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={editExpiryDate}
                onChange={(e) => setEditExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            ) : (
              <p className="text-slate-900">
                {consent.expiry_date
                  ? format(new Date(consent.expiry_date), 'MMM d, yyyy')
                  : 'No expiry date set'}
              </p>
            )}
          </div>

          {/* Document URL */}
          <div>
            <label className="block label font-semibold text-slate-700 mb-2">
              Document URL
            </label>
            {isEditing ? (
              <input
                type="url"
                value={editDocumentUrl}
                onChange={(e) => setEditDocumentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg body-sm"
              />
            ) : (
              <div>
                {consent.document_url ? (
                  <a
                    href={consent.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {consent.document_url}
                  </a>
                ) : (
                  <p className="text-slate-400">No document attached</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Information</h3>
            <p className="body-sm text-blue-800">
              {consent.status === 'pending'
                ? 'This consent is awaiting a response. Consider following up if no response is received within 2 weeks.'
                : consent.status === 'received'
                ? 'This consent has been received. Remember to check the expiry date.'
                : consent.status === 'rejected'
                ? 'This consent was rejected. You may need to work with the entity to resolve any outstanding issues.'
                : consent.status === 'expired'
                ? 'This consent has expired and may need to be renewed depending on the requirements.'
                : 'This consent has been withdrawn.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3 justify-end">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(false)
                  setEditStatus(consent.status)
                  setEditExpiryDate(
                    consent.expiry_date
                      ? consent.expiry_date.split('T')[0]
                      : ''
                  )
                  setEditDocumentUrl(consent.document_url || '')
                }}
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Close
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
