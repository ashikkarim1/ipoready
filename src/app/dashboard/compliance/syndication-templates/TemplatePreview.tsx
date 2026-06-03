import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check } from 'lucide-react'

interface SyndicationTemplate {
  id: string
  title: string
  type: 'lead-underwriter' | 'co-underwriter' | 'standstill'
  description: string
  keyTerms: string[]
  exchanges: string[]
  lastUpdated: string
  fileFormat: 'docx'
}

interface TemplatePreviewProps {
  template: SyndicationTemplate
  onClose: () => void
  onDownload: (template: SyndicationTemplate) => void
}

const TEMPLATE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'lead-underwriter':
    'Lead underwriters serve as the primary manager and organizer of the underwriting syndicate. They coordinate all syndicate activities, manage pricing, and handle stabilization.',
  'co-underwriter':
    'Co-underwriters are members of the underwriting syndicate with agreed-upon allocation of shares to sell. They share in commissions and expenses based on their syndicate position.',
  standstill:
    'Standstill agreements restrict underwriters and syndicate members from acquiring more than a specified percentage of shares without board approval, typically for 180 days post-listing.',
}

export default function TemplatePreview({
  template,
  onClose,
  onDownload,
}: TemplatePreviewProps) {
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null)

  const handleCopyTerm = (term: string) => {
    navigator.clipboard.writeText(term)
    setCopiedTerm(term)
    setTimeout(() => setCopiedTerm(null), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{template.title}</h2>
              <p className="text-blue-100">{template.description}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Template Type Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">What is this template?</h3>
              <p className="text-blue-800">{TEMPLATE_TYPE_DESCRIPTIONS[template.type]}</p>
            </div>

            {/* Key Terms Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-8 bg-blue-600 rounded mr-3" />
                Key Terms
              </h3>

              <div className="space-y-4">
                {template.keyTerms.map((term, idx) => {
                  const [title, description] = term.includes(':')
                    ? term.split(':').map((s) => s.trim())
                    : [term, '']

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                          {description && (
                            <p className="text-sm text-gray-600">{description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopyTerm(term)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy term"
                        >
                          {copiedTerm === term ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <p className="text-xs text-gray-500 mt-6 italic">
                Tip: Hover over any key term to copy it to your clipboard for use in other documents.
              </p>
            </div>

            {/* Exchange Compatibility */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-blue-600 rounded mr-3" />
                Exchange Compatibility
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {template.exchanges.map((exchange, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <div className="font-bold text-green-900">{exchange}</div>
                    <div className="text-xs text-green-700 mt-1">Accepted</div>
                  </motion.div>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-4">
                This template is commonly used by the exchanges listed above. However, always confirm specific
                requirements with your underwriters and exchange regulators, as requirements may vary.
              </p>
            </div>

            {/* Usage Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-bold text-amber-900 mb-3">How to Use This Template</h3>
              <ol className="space-y-2 text-sm text-amber-800 list-decimal list-inside">
                <li>Download the template in .docx format (Microsoft Word)</li>
                <li>Review all key terms and adapt them to your specific transaction</li>
                <li>Consult with your legal team and underwriting counsel</li>
                <li>Customize company names, percentages, and timelines</li>
                <li>Have legal counsel review all modifications</li>
                <li>Ensure compliance with applicable exchange rules</li>
                <li>Share with syndicate members and obtain signatures</li>
              </ol>
            </div>

            {/* Disclaimer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-bold text-red-900 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-red-800">
                These templates are provided for informational purposes only and should not be considered legal
                advice. While based on realistic market practice, they are generic templates that must be customized
                for your specific transaction. Always consult with qualified legal counsel before using any agreement
                in connection with an IPO. Underwriters, your company, and relevant exchanges may have additional
                requirements or modifications. IPOReady and its creators assume no liability for the use of these
                templates.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-6 flex justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Last updated: {new Date(template.lastUpdated).toLocaleDateString()} | Format: {template.fileFormat.toUpperCase()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onDownload(template)}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download Template
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
