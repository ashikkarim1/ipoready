'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'

interface SyncErrorAlertProps {
  error: string
  onRetry: () => void
  accountName: string
}

export function SyncErrorAlert({ error, onRetry, accountName }: SyncErrorAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-red-50 border border-red-200 rounded-lg p-5"
    >
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        </motion.div>

        <div className="flex-1">
          <h3 className="font-semibold text-red-900 text-sm">Sync Error on {accountName}</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>

          <div className="mt-4 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Sync
            </motion.button>

            <p className="text-xs text-red-700">
              Please contact support if the issue persists: support@ipoready.com
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDismissed(true)}
          className="text-red-400 hover:text-red-600 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
