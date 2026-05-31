'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { formatBadgeCount } from '@/lib/badge-types'

interface AchievementBadgeProps {
  compact?: boolean
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

export const AchievementBadge = React.memo(function AchievementBadge({
  compact = false,
  showIcon = true,
  className = '',
  onClick,
}: AchievementBadgeProps) {
  const { unlockedAchievementCount } = useAppStore()

  const count = useMemo(() => unlockedAchievementCount, [unlockedAchievementCount])

  if (count === 0) return null

  const displayCount = formatBadgeCount(count, 99)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:shadow-md ${className}`}
      style={{
        backgroundColor: '#FEF3C7',
        color: '#B45309',
      }}
      aria-label={`${count} new achievement${count !== 1 ? 's' : ''}`}
    >
      {showIcon && <Trophy className="w-4 h-4" />}
      {!compact && <span>{displayCount} new</span>}
      {compact && <span>{displayCount}</span>}
    </motion.button>
  )
})

AchievementBadge.displayName = 'AchievementBadge'
