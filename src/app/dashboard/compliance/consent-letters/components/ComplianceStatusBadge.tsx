'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ComplianceStatusBadgeProps {
  status: 'compliant' | 'warning' | 'critical'
  message: string
  details?: string[]
}

const statusConfig = {
  compliant: {
    bg: 'bg-green-100 border-green-300',
    text: 'text-green-900',
    icon: '✓',
    title: 'Compliant',
  },
  warning: {
    bg: 'bg-yellow-100 border-yellow-300',
    text: 'text-yellow-900',
    icon: '⚠',
    title: 'Warning',
  },
  critical: {
    bg: 'bg-red-100 border-red-300',
    text: 'text-red-900',
    icon: '✗',
    title: 'Critical',
  },
}

export default function ComplianceStatusBadge({
  status,
  message,
  details,
}: ComplianceStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-2 rounded-lg p-4 ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl flex-shrink-0 ${config.text}`}>
          {config.icon}
        </span>
        <div className="flex-1">
          <h3 className={`font-bold ${config.text}`}>{config.title}</h3>
          <p className={`text-sm mt-1 ${config.text} opacity-90`}>
            {message}
          </p>
          {details && details.length > 0 && (
            <ul className={`mt-2 space-y-1 text-sm ${config.text} opacity-75`}>
              {details.map((detail, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  )
}
