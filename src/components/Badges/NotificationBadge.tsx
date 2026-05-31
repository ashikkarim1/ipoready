'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { formatBadgeCount } from '@/lib/badge-types'

interface NotificationBadgeProps {
  onClick?: () => void
  className?: string
  showLabel?: boolean
}

export const NotificationBadge = React.memo(function NotificationBadge({
  onClick,
  className = '',
  showLabel = false,
}: NotificationBadgeProps) {
  const { unreadNotificationCount } = useAppStore()

  const displayCount = useMemo(
    () => formatBadgeCount(unreadNotificationCount, 99),
    [unreadNotificationCount]
  )

  const shouldShow = unreadNotificationCount > 0

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.()
  }

  return (
    <Link href="/notifications" className={`relative inline-flex items-center ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={`${unreadNotificationCount} unread notifications`}
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />

        {/* Badge indicator */}
        <AnimatePresence mode="wait">
          {shouldShow && (
            <motion.div
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
              }}
              className="absolute top-0 right-0 flex items-center justify-center"
              style={{
                width: displayCount.length > 2 ? '24px' : '20px',
                height: '20px',
                minWidth: '20px',
              }}
            >
              <div
                className="flex items-center justify-center w-full h-full rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#E8312A' }}
              >
                {displayCount}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when count > 0 */}
        {shouldShow && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="absolute top-0 right-0 w-5 h-5 rounded-full"
            style={{
              backgroundColor: '#E8312A',
              opacity: 0.2,
            }}
          />
        )}
      </motion.button>

      {showLabel && unreadNotificationCount > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-2 text-xs font-semibold text-gray-600 dark:text-gray-400"
        >
          {displayCount} new
        </motion.span>
      )}
    </Link>
  )
})

NotificationBadge.displayName = 'NotificationBadge'
