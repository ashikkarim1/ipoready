'use client'

import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'

interface LockedCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  dataPreview?: string[]
}

/**
 * Greyed-out preview card for locked Listed Services features
 * Shows what data will appear once unlocked
 */
export function LockedCard({
  title,
  description,
  icon,
  features,
  dataPreview
}: LockedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl border-2 transition-all"
      style={{
        background: '#F7F6F4',
        borderColor: '#E5E4E0',
        opacity: 0.7
      }}
    >
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white/50 z-10 pointer-events-none" />

      <div className="p-8 relative z-0">
        {/* Lock Icon Badge */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#FDECEB' }}
          >
            <Lock className="w-6 h-6" style={{ color: '#E8312A' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-nav text-lg">{title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-muted text-sm mb-6 leading-relaxed">
          {description}
        </p>

        {/* What you'll see */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            You'll see:
          </p>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="text-accent font-bold">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Preview */}
        {dataPreview && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Example data:
            </p>
            <ul className="space-y-1">
              {dataPreview.map((item, i) => (
                <li key={i} className="text-xs text-text-muted">
                  → {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          disabled
          className="w-full py-2.5 rounded-full font-semibold transition-all text-white text-sm"
          style={{
            background: '#CCCCCC',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
        >
          🔒 Unlocks when you list
        </button>

        {/* Status message */}
        <p className="text-center text-xs text-text-muted mt-3">
          Available to public companies on all major exchanges
        </p>
      </div>
    </motion.div>
  )
}
