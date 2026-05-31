'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export type ActivityStatus = 'online' | 'idle' | 'offline'

interface ActivityBadgeProps {
  status: ActivityStatus
  showLabel?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<ActivityStatus, { color: string; label: string }> = {
  online: { color: '#10B981', label: 'Online' },
  idle: { color: '#F59E0B', label: 'Idle' },
  offline: { color: '#6B7280', label: 'Offline' },
}

export const ActivityBadge = React.memo(function ActivityBadge({
  status,
  showLabel = false,
  className = '',
  size = 'md',
}: ActivityBadgeProps) {
  const config = useMemo(() => STATUS_CONFIG[status], [status])

  const sizeConfig = {
    sm: { dot: 'w-2 h-2', container: 'px-2 py-1 text-xs' },
    md: { dot: 'w-3 h-3', container: 'px-2.5 py-1.5 text-sm' },
    lg: { dot: 'w-4 h-4', container: 'px-3 py-2 text-base' },
  }

  const { dot, container } = sizeConfig[size]

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-full ${dot}`}
        style={{ backgroundColor: config.color }}
      >
        {status === 'online' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: config.color,
              opacity: 0.5,
            }}
          />
        )}
      </motion.div>

      {showLabel && (
        <span
          className={`font-medium ${container}`}
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  )
})

ActivityBadge.displayName = 'ActivityBadge'
