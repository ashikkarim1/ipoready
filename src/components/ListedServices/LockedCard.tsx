'use client'

import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'

interface LockedCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  dataPreview?: string[]
  isApp?: boolean
}

/**
 * App-optimized locked card for Listed Services features
 * Mobile-first, touch-friendly design for iOS/Android apps
 */
export function LockedCard({
  title,
  description,
  icon,
  features,
  dataPreview,
  isApp = true
}: LockedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl transition-all"
      style={{
        background: '#F7F6F4',
        border: '1px solid #E5E4E0',
        opacity: 0.65,
        // Mobile app padding
        padding: isApp ? '16px' : '32px'
      }}
    >
      {/* Lock overlay - subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white/40 z-10 pointer-events-none" />

      <div className="relative z-0">
        {/* Icon + Title (app-optimized) */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: '#FDECEB' }}
          >
            <Lock className="w-5 h-5" style={{ color: '#E8312A' }} />
          </div>
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-nav text-base leading-tight">{title}</h3>
          </div>
        </div>

        {/* Description - shorter on mobile */}
        <p className="text-text-muted text-xs leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Features - compact list */}
        <div className="mb-4">
          <ul className="space-y-1.5">
            {features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                <span className="text-accent font-bold flex-shrink-0">•</span>
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Preview - collapsible on app */}
        {dataPreview && dataPreview.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 opacity-70">
              Data example
            </p>
            <ul className="space-y-0.5">
              {dataPreview.slice(0, 2).map((item, i) => (
                <li key={i} className="text-xs text-text-muted truncate">
                  → {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA - app button */}
        <button
          disabled
          className="w-full py-3 rounded-xl font-semibold transition-all text-white text-sm"
          style={{
            background: '#CCCCCC',
            cursor: 'not-allowed',
            opacity: 0.5,
            // Touch target minimum
            minHeight: isApp ? '48px' : 'auto'
          }}
        >
          🔒 Coming when public
        </button>
      </div>
    </motion.div>
  )
}
