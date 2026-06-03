'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ConsentRecord,
  ConsentStatus,
  getStatusBadge,
  getEntityTypeLabel,
  getEntityIcon,
  formatExpiryDate,
  isExpiringSoon,
  isExpired,
} from '@/lib/consent-utils'

interface ConsentDetailsModalProps {
  consent: ConsentRecord
  isOpen: boolean
  onClose: () => void
  onStatusChange: (status: ConsentStatus) => void
  onDelete: () => void
}

const CONSENT_STATUSES: ConsentStatus[] = ['pending', 'received', 'rejected', 'expired', 'withdrawn']

export default function ConsentDetailsModal({
  consent,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: ConsentDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedStatus, setEditedStatus] = useState<ConsentStatus>(consent.status)

  const handleStatusChange = () => {
    if (editedStatus !== consent.status) {
      onStatusChange(editedStatus)
      setIsEditing(false)
    }
  }

  const statusBadge = getStatusBadge(consent.status)
  const isExpiredConsent = isExpired(consent.expiry_date)
  const isExpiringSoonConsent = isExpiringSoon(consent.expiry_date)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between border-b border-blue-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getEntityIcon(consent.entity_type)}</span>
              <div>
                <h2 className="text-2xl font-bold">{consent.from_entity}</h2>
                <p className="text-blue-100 text-sm">{getEntityTypeLabel(consent.entity_type)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-600 rounded-lg p-2 transition"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Section */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Status</h3>
                {isExpiredConsent && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    ⚠️ Expired
                  </span>
                )}
                {isExpiringSoonConsent && consent.status !== 'received' && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    ⚠️ Expiring Soon
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full font-semibold ${statusBadge.bg_color} ${statusBadge.color}`}>
                  {statusBadge.icon} {statusBadge.label}
                </span>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Status
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value as ConsentStatus)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CONSENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {getStatusBadge(status).label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusChange}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="text-xl">{getEntityIcon(consent.entity_type)}</span>
                  <span>{getEntityTypeLabel(consent.entity_type)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consent Type</label>
                <div className="text-gray-900">{consent.consent_type}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                <div className="text-gray-900">
                  {new Date(consent.created_at).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <div className={`font-medium ${isExpiredConsent ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatExpiryDate(consent.expiry_date)}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Document URL</label>
                {consent.document_url ? (
                  <a
                    href={consent.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline truncate"
                  >
                    {consent.document_url}
                  </a>
                ) : (
                  <span className="text-gray-500 italic">No document uploaded</span>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Activity Timeline</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="w-0.5 h-12 bg-gray-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(consent.created_at).toLocaleString('en-CA')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${consent.status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">
                      {new Date(consent.updated_at).toLocaleString('en-CA')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            {consent.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Next Step:</strong> Follow up with {consent.from_entity} to ensure consent is received
                  before the prospectus filing deadline.
                </p>
              </div>
            )}

            {consent.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Action Required:</strong> Consent from {consent.from_entity} was rejected. Please
                  address concerns and resubmit request.
                </p>
              </div>
            )}

            {isExpiringSoonConsent && consent.status !== 'received' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Urgent:</strong> This consent expires {formatExpiryDate(consent.expiry_date)}. Please
                  follow up immediately.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
            >
              Close
            </motion.button>

            {consent.status !== 'received' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onStatusChange('received')
                  onClose()
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Mark as Received
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onDelete()
                onClose()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Withdraw
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
