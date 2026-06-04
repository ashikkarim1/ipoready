'use client'

import { motion } from 'framer-motion'
import { Zap, Clock, AlertCircle } from 'lucide-react'

interface DataFreshnessIndicatorProps {
  freshness: 'realtime' | 'recent' | 'stale' | 'unknown'
  lastSyncAt: string | null
  nextSyncAt: string | null
}

export function DataFreshnessIndicator({
  freshness,
  lastSyncAt,
  nextSyncAt,
}: DataFreshnessIndicatorProps) {
  const getMinutesSinceSync = (dateString: string | null): number | null => {
    if (!dateString) return null
    const now = new Date()
    const syncTime = new Date(dateString)
    return Math.floor((now.getTime() - syncTime.getTime()) / 60000)
  }

  const minutesSinceSync = getMinutesSinceSync(lastSyncAt)

  const freshnessConfig = {
    realtime: {
      label: 'Real-time Sync',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: Zap,
      description: 'Data is being synced continuously',
    },
    recent: {
      label: 'Recently Updated',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: Clock,
      description: 'Data was synced within the last few hours',
    },
    stale: {
      label: 'Needs Refresh',
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: AlertCircle,
      description: 'Data is older than 24 hours',
    },
    unknown: {
      label: 'Unknown',
      color: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      icon: Clock,
      description: 'Data freshness status is unknown',
    },
  }

  const config = freshnessConfig[freshness]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${config.color} ${config.borderColor} border rounded-lg p-4`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ scale: freshness === 'realtime' ? [1, 1.1, 1] : 1 }}
          transition={{
            repeat: freshness === 'realtime' ? Infinity : 0,
            duration: 2,
          }}
        >
          <Icon className={`w-5 h-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
        </motion.div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${config.textColor}`}>{config.label}</p>
          <p className={`text-xs ${config.textColor} opacity-75 mt-1`}>{config.description}</p>

          {lastSyncAt && (
            <div className="mt-3 space-y-1 text-xs">
              <p className={config.textColor}>
                Last synced: {new Date(lastSyncAt).toLocaleString()}
              </p>
              {minutesSinceSync !== null && (
                <p className={`${config.textColor} opacity-75`}>
                  {minutesSinceSync < 1
                    ? 'Just now'
                    : minutesSinceSync < 60
                      ? `${minutesSinceSync} minutes ago`
                      : `${Math.floor(minutesSinceSync / 60)} hours ago`}
                </p>
              )}
            </div>
          )}

          {nextSyncAt && (
            <p className={`text-xs ${config.textColor} opacity-75 mt-2`}>
              Next sync: {new Date(nextSyncAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
