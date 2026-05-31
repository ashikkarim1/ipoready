'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { formatBadgeCount } from '@/lib/badge-types'

interface TaskBadgeProps {
  variant?: 'overdue' | 'due-soon' | 'combined'
  compact?: boolean
  showIcon?: boolean
  className?: string
}

export const TaskBadge = React.memo(function TaskBadge({
  variant = 'combined',
  compact = false,
  showIcon = true,
  className = '',
}: TaskBadgeProps) {
  const { overdueTaskCount, dueSoonTaskCount } = useAppStore()

  const overdueCount = useMemo(() => overdueTaskCount, [overdueTaskCount])
  const dueSoonCount = useMemo(() => dueSoonTaskCount, [dueSoonTaskCount])

  if (variant === 'overdue') {
    if (overdueCount === 0) return null

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${className}`}
        style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
        }}
      >
        {showIcon && <AlertCircle className="w-3 h-3" />}
        <span>{formatBadgeCount(overdueCount, 99)} overdue</span>
      </motion.div>
    )
  }

  if (variant === 'due-soon') {
    if (dueSoonCount === 0) return null

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${className}`}
        style={{
          backgroundColor: '#FEF3C7',
          color: '#B45309',
        }}
      >
        {showIcon && <AlertCircle className="w-3 h-3" />}
        <span>{formatBadgeCount(dueSoonCount, 99)} due soon</span>
      </motion.div>
    )
  }

  // Combined variant
  const totalTasks = overdueCount + dueSoonCount
  if (totalTasks === 0) return null

  return (
    <AnimatePresence>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {overdueCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
            }}
          >
            {showIcon && <AlertCircle className="w-3 h-3" />}
            <span>{formatBadgeCount(overdueCount, 99)}</span>
          </motion.div>
        )}

        {dueSoonCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: '#FEF3C7',
              color: '#B45309',
            }}
          >
            {showIcon && <AlertCircle className="w-3 h-3" />}
            <span>{formatBadgeCount(dueSoonCount, 99)}</span>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
})

TaskBadge.displayName = 'TaskBadge'
