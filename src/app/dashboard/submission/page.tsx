'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react'

interface SubmissionStatus {
  totalDocuments: number
  completedDocuments: {
    verified: number
    submitted: number
    partial: number
    empty: number
  }
  completionPercentage: number
  mandatoryDocuments: {
    total: number
    completed: number
    completionPercentage: number
  }
  recommendedDocuments: {
    total: number
    completed: number
    completionPercentage: number
  }
  lastUpdated: string
}

export default function SubmissionPortalPage() {
  const [status, setStatus] = useState<SubmissionStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/documents/status?companyId=default')
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (err) {
        console.error('Failed to fetch status:', err)
      }
    }

    fetchStatus()
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/documents/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'default',
          documentIds: Array.from({ length: status?.totalDocuments || 10 }, (_, i) => `doc-${i}`),
          notes: 'Ready for review',
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        setError('Failed to submit documents')
      }
    } catch (err) {
      setError('Submission error. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-12 text-center"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-black text-green-900 mb-4">
          Submission Complete!
        </h1>
        <p className="text-xl text-green-800 mb-6">
          Your documents have been submitted for verification. Our team will review and verify each document.
        </p>
        <div className="bg-white rounded-xl p-6 mb-6 inline-block">
          <p className="text-gray-600 text-sm">
            <strong>Next Steps:</strong>
          </p>
          <ul className="text-left mt-4 space-y-2 text-gray-700">
            <li>✅ Regulatory team receives notification</li>
            <li>⏳ Review begins within 24-48 hours</li>
            <li>📧 You'll be notified of any issues</li>
            <li>✨ IPO readiness updates in real-time</li>
          </ul>
        </div>
        <button className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
          View Submission Timeline
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-black text-gray-900">
          📋 Submission Portal
        </h1>
        <p className="text-lg text-gray-600">
          Review your documents and submit them for regulatory verification.
        </p>
      </motion.div>

      {/* Completion Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Overall Progress */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-black text-red-600">
                {status.completionPercentage}%
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">OVERALL</p>
              <p className="text-2xl font-bold text-gray-900">Complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${status.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Mandatory Documents */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-black text-amber-600">
                {status.mandatoryDocuments.completed}/{status.mandatoryDocuments.total}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">MANDATORY</p>
              <p className="text-2xl font-bold text-gray-900">Documents</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${status.mandatoryDocuments.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Recommended Documents */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-black text-blue-600">
                {status.recommendedDocuments.completed}/{status.recommendedDocuments.total}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">RECOMMENDED</p>
              <p className="text-2xl font-bold text-gray-900">Documents</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${status.recommendedDocuments.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Document Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900">Document Status</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Verified */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={20} className="text-green-600" />
              <span className="font-semibold text-gray-900">Verified</span>
            </div>
            <p className="text-3xl font-black text-green-600">
              {status.completedDocuments.verified}
            </p>
          </div>

          {/* Submitted */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-blue-600" />
              <span className="font-semibold text-gray-900">Submitted</span>
            </div>
            <p className="text-3xl font-black text-blue-600">
              {status.completedDocuments.submitted}
            </p>
          </div>

          {/* Partial */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-amber-600" />
              <span className="font-semibold text-gray-900">Partial</span>
            </div>
            <p className="text-3xl font-black text-amber-600">
              {status.completedDocuments.partial}
            </p>
          </div>

          {/* Empty */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} className="text-red-600" />
              <span className="font-semibold text-gray-900">Empty</span>
            </div>
            <p className="text-3xl font-black text-red-600">
              {status.completedDocuments.empty}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Submission Readiness */}
      {status.mandatoryDocuments.completionPercentage >= 90 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6"
        >
          <div className="flex gap-4">
            <div className="text-4xl">✅</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                You're Ready to Submit!
              </h3>
              <p className="text-green-800 mb-4">
                Your mandatory documents are {status.mandatoryDocuments.completionPercentage}% complete.
                You can submit now or continue uploading recommended documents.
              </p>
              {error && (
                <p className="text-red-600 font-semibold mb-4">⚠️ {error}</p>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin">⏳</span> Submitting...
                    </>
                  ) : (
                    <>
                      🚀 Submit Documents Now
                    </>
                  )}
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-bold rounded-lg border-2 border-green-400 hover:bg-green-50 transition-colors">
                  📄 Continue Uploading
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6"
        >
          <div className="flex gap-4">
            <div className="text-4xl">⏳</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                Almost There!
              </h3>
              <p className="text-amber-800">
                Complete {status.mandatoryDocuments.total - status.mandatoryDocuments.completed} more mandatory document(s) to be submission ready.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submission Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-bold text-blue-900">ℹ️ What Happens After Submission?</h3>
        <ul className="space-y-3 text-blue-800">
          <li className="flex gap-3">
            <span className="text-xl">1️⃣</span>
            <span><strong>Immediate:</strong> Your team is notified of the submission</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">2️⃣</span>
            <span><strong>24-48 hours:</strong> Regulatory team begins document review</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">3️⃣</span>
            <span><strong>As reviewed:</strong> Individual document verification status updates</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">4️⃣</span>
            <span><strong>Issues found:</strong> You'll be notified with specific guidance</span>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">5️⃣</span>
            <span><strong>All approved:</strong> IPO readiness milestone unlocked 🎉</span>
          </li>
        </ul>
      </motion.div>
    </div>
  )
}
