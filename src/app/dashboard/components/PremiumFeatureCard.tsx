'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Lock } from 'lucide-react'
import UpgradeModal from './UpgradeModal'

interface PremiumFeatureCardProps {
  featureKey: string
  title: string
  description: string
  icon: React.ReactNode
  badge?: {
    text: string
    color: 'gold' | 'blue' | 'red'
  }
  monthlyValue: number
  isDark?: boolean
}

/**
 * Premium Feature Card
 * Showcases locked premium features with upgrade CTA
 */
export default function PremiumFeatureCard({
  featureKey,
  title,
  description,
  icon,
  badge,
  monthlyValue,
  isDark = false,
}: PremiumFeatureCardProps) {
  const [showModal, setShowModal] = useState(false)

  const badgeColors = {
    gold: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border border-blue-300',
    red: 'bg-red-100 text-red-800 border border-red-300',
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className={`rounded-xl border p-6 transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 hover:border-slate-600'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Badge */}
        {badge && (
          <div className="mb-4">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${
                badgeColors[badge.color]
              }`}
            >
              {badge.text}
            </span>
          </div>
        )}

        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            {icon}
          </div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-nav'}`}>{title}</h3>
        </div>

        {/* Description */}
        <p
          className={`text-sm mb-4 ${
            isDark ? 'text-slate-400' : 'text-text-muted'
          }`}
        >
          {description}
        </p>

        {/* Value prop */}
        <div
          className={`mb-4 pb-4 border-t ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <p className="text-xs text-text-light">
            Value: <span className="font-semibold text-accent">${(monthlyValue / 100).toLocaleString()}/mo</span>
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-opacity-90 transition-all"
        >
          <Zap className="w-4 h-4" />
          Unlock Feature
        </button>

        {/* Lock indicator */}
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-text-light">
          <Lock className="w-3 h-3" />
          Premium feature
        </div>
      </motion.div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureKey={featureKey}
        featureName={title}
      />
    </>
  )
}
