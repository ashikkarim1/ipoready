'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface PremiumPageLayoutProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
}

/**
 * Premium Page Layout - Matches Mission Control exact style
 * Font: serif for h1 (text-2xl)
 * Header: tight spacing (mb-2 for subtitle)
 * Cards: card class, p-6
 * Spacing: space-y-6, gap-5
 * Colors: uses color tokens from design system
 */
export default function PremiumPageLayout({
  title,
  subtitle,
  icon,
  children,
}: PremiumPageLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0">
      {/* Header - Matches Mission Control */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0">{icon}</div>
          <div>
            <h1 className="serif text-2xl sm:text-3xl text-nav">{title}</h1>
            <p className="text-text-muted text-sm mt-1">{subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-5"
      >
        {children}
      </motion.div>
    </div>
  )
}
