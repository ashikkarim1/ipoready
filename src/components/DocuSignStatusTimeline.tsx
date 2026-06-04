'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Zap,
  Calendar,
  User,
  Mail,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export type EnvelopeStatusType = 'sent' | 'viewed' | 'signed' | 'completed' | 'declined' | 'expired'

export interface EnvelopeTimelineStatus {
  status: EnvelopeStatusType
  timestamp: string
  recipientCount: number
  completedCount: number
  label: string
  description?: string
}

interface DocuSignStatusTimelineProps {
  statuses: EnvelopeTimelineStatus[]
  currentStatus: EnvelopeStatusType
  completionPercentage: number
  expiresAt: string
}

// ═══════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

const statusConfig: Record<
  EnvelopeStatusType,
  {
    icon: React.FC<{ size: number; className?: string }>
    label: string
    color: string
    bgColor: string
    dotColor: string
    lineColor: string
  }
> = {
  sent: {
    icon: Send,
    label: 'Sent',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    dotColor: 'bg-blue-500',
    lineColor: 'from-blue-400 to-blue-200',
  },
  viewed: {
    icon: Eye,
    label: 'Viewed',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    dotColor: 'bg-cyan-500',
    lineColor: 'from-cyan-400 to-cyan-200',
  },
  signed: {
    icon: FileCheck,
    label: 'Signed',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    dotColor: 'bg-purple-500',
    lineColor: 'from-purple-400 to-purple-200',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    dotColor: 'bg-green-500',
    lineColor: 'from-green-400 to-green-200',
  },
  declined: {
    icon: AlertCircle,
    label: 'Declined',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    dotColor: 'bg-red-500',
    lineColor: 'from-red-400 to-red-200',
  },
  expired: {
    icon: Clock,
    label: 'Expired',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    dotColor: 'bg-orange-500',
    lineColor: 'from-orange-400 to-orange-200',
  },
}

// ═══════════════════════════════════════════════════════════════════════
// STATUS TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function DocuSignStatusTimeline({
  statuses,
  currentStatus,
  completionPercentage,
  expiresAt,
}: DocuSignStatusTimelineProps) {
  const isExpired = new Date(expiresAt) < new Date()

  return (
    <div className="space-y-8">
      {/* Timeline visualization */}
      <div className="relative">
        {/* Connecting lines */}
        {statuses.length > 1 && (
          <div className="absolute left-6 top-12 w-1 h-[calc(100%-48px)] bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />
        )}

        {/* Timeline steps */}
        <div className="space-y-8">
          {statuses.map((status, index) => {
            const config = statusConfig[status.status]
            const Icon = config.icon
            const isActive = currentStatus === status.status
            const isCompleted = index < statuses.findIndex(s => s.status === currentStatus)
            const isDeclined = status.status === 'declined' || status.status === 'expired'

            return (
              <motion.div
                key={`${status.status}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-6 items-start"
              >
                {/* Timeline dot */}
                <motion.div
                  whileInView={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  className="relative flex-shrink-0 z-10"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive
                        ? `${config.dotColor} border-white shadow-lg shadow-${config.dotColor.split('-')[1]}-500/50`
                        : isCompleted || isDeclined
                        ? 'bg-white border-gray-300'
                        : `${config.bgColor} border-gray-200`
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`${
                        isActive
                          ? 'text-white'
                          : isCompleted
                          ? 'text-gray-400'
                          : isDeclined
                          ? 'text-red-600'
                          : config.color
                      } transition-colors`}
                    />
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  className={`flex-1 pt-2 ${isActive ? 'bg-white border-2 border-dashed border-gray-200 rounded-lg p-4' : ''}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className={`font-semibold transition-colors ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {status.label}
                      </h4>
                      {status.description && (
                        <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                      )}
                    </div>
                    {isActive && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap size={16} className="text-blue-600" />
                      </motion.div>
                    )}
                  </div>

                  {/* Timestamp and stats */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(status.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {status.completedCount} of {status.recipientCount} signed
                    </div>
                  </div>

                  {/* Progress bar for current status */}
                  {isActive && status.recipientCount > 0 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      origin="left"
                      className="mt-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(status.completedCount / status.recipientCount) * 100}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-10 text-right">
                          {Math.round((status.completedCount / status.recipientCount) * 100)}%
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-900">Overall Completion</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
        </div>

        <div className="h-2 bg-white rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          />
        </div>

        {isExpired && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs text-orange-600 font-semibold mt-2 flex items-center gap-1"
          >
            <Clock size={12} />
            Document signature request has expired
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
