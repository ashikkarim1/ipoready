'use client'

import { motion } from 'framer-motion'

interface ProgressData {
  completionPercentage: number
  mandatoryCompletionPercentage: number
  completedDocuments: number
  totalDocuments: number
  mandatoryCompleted: number
  mandatoryDocuments: number
  isSubmissionReady: boolean
}

interface DocumentProgressBarProps {
  data: ProgressData
}

export function DocumentProgressBar({ data }: DocumentProgressBarProps) {
  const milestones = [
    { percent: 25, label: '25%', icon: '🎉' },
    { percent: 50, label: '50%', icon: '💪' },
    { percent: 75, label: '75%', icon: '🔥' },
    { percent: 90, label: '90%', icon: '🛎️' },
    { percent: 100, label: '100%', icon: '🎊' },
  ]

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">
            Document Submission Progress
          </h3>
          <span className={`text-2xl font-black ${
            data.completionPercentage === 100
              ? 'text-green-600'
              : data.completionPercentage >= 90
              ? 'text-orange-600'
              : data.completionPercentage >= 75
              ? 'text-blue-600'
              : data.completionPercentage >= 50
              ? 'text-blue-500'
              : 'text-gray-600'
          }`}>
            {data.completionPercentage}%
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {data.completedDocuments} of {data.totalDocuments} documents ready
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all ${
              data.completionPercentage === 100
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : data.completionPercentage >= 90
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : data.completionPercentage >= 75
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : data.completionPercentage >= 50
                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Milestone Markers */}
      <div className="relative pt-4">
        <div className="flex justify-between items-end">
          {milestones.map((milestone, idx) => (
            <motion.div
              key={milestone.percent}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: idx * 0.1 + 0.3,
                type: 'spring',
                bounce: 0.5,
              }}
              className="flex flex-col items-center gap-1"
            >
              {/* Milestone Marker */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                  data.completionPercentage >= milestone.percent
                    ? 'bg-green-100 border-2 border-green-500 scale-110'
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}
              >
                {data.completionPercentage >= milestone.percent ? (
                  <span className="text-lg">✅</span>
                ) : (
                  milestone.icon
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold ${
                  data.completionPercentage >= milestone.percent
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {milestone.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        {/* Mandatory Documents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-lg p-4 border ${
            data.mandatoryCompletionPercentage >= 90
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Mandatory Documents
          </p>
          <p className="text-2xl font-black text-gray-900">
            {data.mandatoryCompleted}/{data.mandatoryDocuments}
          </p>
          <p className={`text-xs font-medium mt-1 ${
            data.mandatoryCompletionPercentage >= 90
              ? 'text-green-700'
              : 'text-blue-700'
          }`}>
            {data.mandatoryCompletionPercentage}% complete
          </p>
        </motion.div>

        {/* Submission Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-lg p-4 border ${
            data.isSubmissionReady
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Submission Status
          </p>
          <p className={`text-lg font-black ${
            data.isSubmissionReady ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {data.isSubmissionReady ? '✅ Ready' : '⏳ In Progress'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {data.isSubmissionReady
              ? 'All mandatory docs ready!'
              : `${100 - data.mandatoryCompletionPercentage}% to go`}
          </p>
        </motion.div>
      </div>

      {/* CTA Button */}
      {data.isSubmissionReady && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
        >
          🛎️ Ready to Submit Documents
        </motion.button>
      )}

      {/* Helpful Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Pro Tip:</span> Reach 90% completion
          to get your team notified that documents are submission-ready. At 100%,
          you&apos;ll ring the bell! 🛎️
        </p>
      </motion.div>
    </div>
  )
}
