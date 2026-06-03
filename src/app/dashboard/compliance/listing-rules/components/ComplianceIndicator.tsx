'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExchangeConfig } from '@/lib/exchange-config'

interface ComplianceIndicatorProps {
  score: number
  status: 'ready' | 'at-risk' | 'not-ready'
  config: ExchangeConfig
}

export function ComplianceIndicator({ score, status, config }: ComplianceIndicatorProps) {
  const radius = 55
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const statusConfig = {
    ready: {
      color: '#10b981',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      label: 'Ready for IPO',
      icon: '✓',
    },
    'at-risk': {
      color: '#f59e0b',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      label: 'At Risk',
      icon: '⚠',
    },
    'not-ready': {
      color: '#ef4444',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      label: 'Not Ready',
      icon: '✗',
    },
  }

  const current = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${current.bgColor} border-2 ${current.borderColor} rounded-xl p-8`}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 mb-6">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 140 140"
          >
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={current.color}
              strokeWidth="6"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold"
              style={{ color: current.color }}
            >
              {score}
            </motion.div>
            <div
              className="text-lg font-semibold mt-1"
              style={{ color: current.color }}
            >
              {current.icon}
            </div>
          </div>
        </div>

        {/* Status Label */}
        <h3 className={`text-2xl font-bold ${current.textColor} mb-2`}>
          {current.label}
        </h3>

        {/* Exchange Info */}
        <p className={`text-sm ${current.textColor} opacity-75 mb-6`}>
          {config.name}
        </p>

        {/* Key Requirements Summary */}
        <div className="w-full bg-white rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Public Float Requirement</span>
            <span className="font-bold text-gray-900">{config.minPublicFloat}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Minimum Shares</span>
            <span className="font-bold text-gray-900">{config.minShares.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Min Share Price</span>
            <span className="font-bold text-gray-900">${config.minSharePrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Audit Committee</span>
            <span className="font-bold text-gray-900">
              {config.requiresAuditCommittee ? 'Required' : 'Optional'}
            </span>
          </div>
        </div>

        {/* Regulatory Body */}
        <p className={`text-xs mt-4 ${current.textColor} opacity-60`}>
          Regulated by {config.regulatoryBody}
        </p>
      </div>
    </motion.div>
  )
}
