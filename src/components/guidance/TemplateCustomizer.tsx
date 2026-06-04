'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Copy, CheckCircle2, Edit2 } from 'lucide-react'
import type { GuidanceTemplate } from '@/lib/types/guidance.types'

interface TemplateCustomizerProps {
  template: GuidanceTemplate
  isExpanded: boolean
  onToggle: () => void
}

export function TemplateCustomizer({
  template,
  isExpanded,
  onToggle,
}: TemplateCustomizerProps) {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(
    template.placeholders.reduce((acc, p) => {
      acc[p.key] = p.defaultValue || ''
      return acc
    }, {} as Record<string, string>)
  )
  const [copied, setCopied] = useState(false)

  // Generate preview with filled placeholders
  const generatePreview = () => {
    let preview = template.templateText
    Object.entries(placeholderValues).forEach(([key, value]) => {
      if (value) {
        preview = preview.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
      }
    })
    return preview
  }

  const handleCopyPreview = () => {
    const preview = generatePreview()
    navigator.clipboard.writeText(preview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const preview = generatePreview()
  const hasEmptyPlaceholders = preview.includes('[')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-gray-200 bg-white overflow-hidden"
    >
      {/* Header Button */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <Edit2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              {/* Input Fields for Placeholders */}
              <div className="space-y-4 pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Customize Your Template</h4>

                {template.placeholders.map((placeholder, idx) => (
                  <motion.div
                    key={placeholder.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <label className="block mb-1">
                      <span className="text-sm font-medium text-gray-700">{placeholder.label}</span>
                      {placeholder.hint && (
                        <span className="text-xs text-gray-500 ml-1">• {placeholder.hint}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={placeholderValues[placeholder.key] || ''}
                      onChange={(e) =>
                        setPlaceholderValues((prev) => ({
                          ...prev,
                          [placeholder.key]: e.target.value,
                        }))
                      }
                      placeholder={`e.g., ${placeholder.defaultValue || 'Enter ' + placeholder.label.toLowerCase()}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Preview</h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyPreview}
                    className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {preview}
                </div>

                {hasEmptyPlaceholders && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-900">
                    <p>
                      💡 Fill in all fields above to complete the template and remove placeholder
                      text.
                    </p>
                  </div>
                )}
              </div>

              {/* Example Output Reference */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Example with Data Filled In</h4>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {template.exampleOutput}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyPreview}
                  disabled={hasEmptyPlaceholders}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </motion.button>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Apply to Prospectus
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
