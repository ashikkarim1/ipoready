'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Copy } from 'lucide-react'
import type { ProspectusExample } from '@/lib/types/guidance.types'

interface ComparisonViewerProps {
  example: ProspectusExample
  onCopy: () => void
  copied: boolean
}

const qualityLabels: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
  weak: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'bg-red-50 border-red-200',
    description: 'What NOT to do - vague, unquantified, weak impact',
  },
  passable: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'bg-yellow-50 border-yellow-200',
    description: 'Meets minimum requirements but lacks depth',
  },
  defendable: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-blue-50 border-blue-200',
    description: 'Good quality - specific, quantified, impact clear',
  },
  strong: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-green-50 border-green-200',
    description: 'Excellent - comprehensive, regulatory-tested',
  },
}

export function ComparisonViewer({ example, onCopy, copied }: ComparisonViewerProps) {
  const qualityInfo = qualityLabels[example.quality]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Quality Header */}
      <div className={`p-4 rounded-lg border-2 ${qualityInfo.color}`}>
        <div className="flex items-start gap-3">
          <div className="text-gray-700">{qualityInfo.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {example.quality.charAt(0).toUpperCase() + example.quality.slice(1)} Example
              {example.companyName && ` - ${example.companyName}`}
            </h3>
            <p className="text-sm text-gray-700">{qualityInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Why This Matters</h4>
        <p className="text-gray-700">{example.reasoning}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {example.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <h4 className="flex items-center gap-2 font-semibold text-green-900 mb-3">
              <CheckCircle2 className="w-5 h-5" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {example.strengths.map((strength, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-green-900">
                  <span className="flex-shrink-0 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {example.weaknesses && example.weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 bg-red-50 rounded-lg border border-red-200"
          >
            <h4 className="flex items-center gap-2 font-semibold text-red-900 mb-3">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {example.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-red-900">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Main Example Text */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Example Text</h4>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCopy}
            className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white rounded-lg border-2 border-gray-300 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto"
        >
          {example.text}
        </motion.div>
      </div>

      {/* Benchmarks */}
      {example.benchmarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="font-semibold text-gray-900 mb-4">Quality Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {example.benchmarks.map((benchmark, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{benchmark.label}:</span>
                <span className="font-semibold text-gray-900">{benchmark.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progression Indicator */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">Quality Progression Path</h4>
        <div className="space-y-2 text-sm text-blue-900">
          <p>
            This example demonstrates {example.quality} quality. To improve to the next level:
          </p>
          <ul className="space-y-1 ml-4">
            {example.quality === 'weak' && (
              <>
                <li>• Add specific competitor names or market data</li>
                <li>• Include quantified metrics (percentages, numbers)</li>
                <li>• Explain the business impact clearly</li>
              </>
            )}
            {example.quality === 'passable' && (
              <>
                <li>• Expand with more market context and scale</li>
                <li>• Add specific financial impact metrics</li>
                <li>• Include your strategic response to the risk</li>
              </>
            )}
            {example.quality === 'defendable' && (
              <>
                <li>• Add more granular competitive data</li>
                <li>• Include forward-looking scenarios</li>
                <li>• Expand on cascading impacts</li>
              </>
            )}
            {example.quality === 'strong' && (
              <>
                <li>• This is a strong example you can use as a template</li>
                <li>• Customize company-specific details for your prospectus</li>
                <li>• Maintain this level of detail across all risk factors</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
