'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { formatBadgeCount } from '@/lib/badge-types'

export type CountBadgeVariant = 'dot' | 'badge' | 'pill' | 'minimal'

interface CountBadgeProps {
  count: number
  variant?: CountBadgeVariant
  bgColor?: string
  textColor?: string
  icon?: LucideIcon
  label?: string
  maxCount?: number
  animated?: boolean
  className?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export const CountBadge = React.memo(function CountBadge({
  count,
  variant = 'badge',
  bgColor = '#E8312A',
  textColor = '#FFFFFF',
  icon: Icon,
  label,
  maxCount = 99,
  animated = true,
  className = '',
  onClick,
  size = 'md',
}: CountBadgeProps) {
  const displayCount = useMemo(() => formatBadgeCount(count, maxCount), [count, maxCount])

  if (count === 0 && variant !== 'minimal') {
    return null
  }

  const sizeConfig = {
    sm: {
      dot: 'w-4 h-4',
      badge: 'w-5 h-5 text-[10px]',
      pill: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      dot: 'w-5 h-5',
      badge: 'w-6 h-6 text-xs',
      pill: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      dot: 'w-6 h-6',
      badge: 'w-7 h-7 text-sm',
      pill: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
    },
  }

  const sizes = sizeConfig[size]

  // Dot variant - simple colored circle
  if (variant === 'dot') {
    return (
      <motion.div
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`rounded-full ${sizes.dot} ${className}`}
        style={{ backgroundColor: bgColor }}
        onClick={onClick}
      />
    )
  }

  // Badge variant - small rounded badge with number
  if (variant === 'badge') {
    return (
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={animated ? { scale: 0, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`flex items-center justify-center rounded-full font-bold ${sizes.badge} ${className}`}
            style={{ backgroundColor: bgColor, color: textColor }}
            onClick={onClick}
          >
            {displayCount}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Pill variant - larger badge with text
  if (variant === 'pill') {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`inline-flex items-center gap-2 rounded-full font-semibold transition-all ${sizes.pill} ${className}`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {Icon && <Icon className={sizes.icon} />}
        {label ? `${label}: ${displayCount}` : displayCount}
      </motion.button>
    )
  }

  // Minimal variant - just the number
  if (variant === 'minimal') {
    return (
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={animated ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`font-bold ${className}`}
            style={{ color: bgColor }}
          >
            {displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    )
  }

  return null
})

CountBadge.displayName = 'CountBadge'
