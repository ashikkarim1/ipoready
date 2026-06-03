'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ConsentTemplate, generateConsentLetter } from '@/lib/consent-templates'

interface ConsentRequestFormProps {
  availableTemplates: ConsentTemplate[]
  onSubmit: (formData: {
    from_entity: string
    entity_type: string
    consent_type: string
    expiry_date?: string
  }) => Promise<void>
  onClose: () => void
}

export default function ConsentRequestForm({
  availableTemplates,
  onSubmit,
  onClose,
}: ConsentRequestFormProps) {
  const [step, setStep] = useState<'select' | 'generate' | 'preview'>(
    'select'
  )
  const [selectedTemplate, setSelectedTemplate] =
    useState<ConsentTemplate | null>(null)
  const [fromEntity, setFromEntity] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [letterFormat, setLetterFormat] = useState<'pdf' | 'email'>('email')
  const [companyName, setCompanyName] = useState('TechCorp Inc.')

  // ========================================================================
  // Handlers
  // ========================================================================

  const handleSelectTemplate = (template: ConsentTemplate) => {
    setSelectedTemplate(template)
    setStep('generate')
  }

  const handleGenerateLetter = () => {
    if (!selectedTemplate || !fromEntity) {
      alert('Please fill in all required fields')
      return
    }

    const letter = generateConsentLetter(selectedTemplate.id, companyName, {
      '[DATE]': new Date().toISOString().split('T')[0],
      '[ADDRESS]': '[Company Address]',
      '[PERIOD]': '[Fiscal Period]',
      '[FORM TYPE]': 'S-1',
      '[JURISDICTION]': '[State/Province]',
      '[ROLE]': 'Lead Underwriter',
      '[UNDERWRITER NAME]': fromEntity,
      '[SECURITY DESCRIPTION]': '[Common Shares]',
      '[VALUATION STANDARD]': 'AICPA/ASA Standards',
    })

    setGeneratedLetter(letter)
    setStep('preview')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        from_entity: fromEntity,
        entity_type: selectedTemplate!.entityType,
        consent_type: selectedTemplate!.id,
        expiry_date: expiryDate,
      })
      onClose()
    } catch (error) {
      console.error('Error submitting consent:', error)
      alert('Error submitting consent request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPDF = () => {
    // In production, would use a library like jsPDF or send to backend
    const element = document.createElement('a')
    const file = new Blob([generatedLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `consent-${selectedTemplate?.id}-${fromEntity}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter)
    alert('Letter copied to clipboard!')
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Request Consent
            </h2>
            <p className="text-slate-600 body-sm mt-1">
              Step {step === 'select' ? '1 of 3' : step === 'generate' ? '2 of 3' : '3 of 3'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-slate-700"
          >
            ✕
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width:
                step === 'select'
                  ? '33%'
                  : step === 'generate'
                  ? '66%'
                  : '100%',
            }}
            transition={{ duration: 0.3 }}
            className="h-full bg-blue-600"
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Select Template */}
          {step === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="h4 font-bold text-slate-900 mb-6">
                Select Consent Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTemplate(template)}
                    className="text-left p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <h4 className="font-bold text-slate-900 mb-2">
                      {template.title}
                    </h4>
                    <p className="body-sm text-slate-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {template.exchanges.map((exchange) => (
                        <span
                          key={exchange}
                          className="px-2 py-1 bg-slate-100 text-slate-700 rounded label-sm font-semibold"
                        >
                          {exchange}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Generate Letter */}
          {step === 'generate' && selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="h4 font-bold text-slate-900 mb-4">
                  Letter Details
                </h3>
                <p className="text-slate-600 mb-6">
                  {selectedTemplate.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block label font-semibold text-slate-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block label font-semibold text-slate-700 mb-2">
                    Entity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fromEntity}
                    onChange={(e) => setFromEntity(e.target.value)}
                    placeholder="e.g., XYZ Auditors LLP"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block label font-semibold text-slate-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Terms</h4>
                <ul className="space-y-1 body-sm text-blue-800">
                  {selectedTemplate.keyTerms.slice(0, 5).map((term, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                  {selectedTemplate.keyTerms.length > 5 && (
                    <li className="text-blue-600 font-semibold">
                      + {selectedTemplate.keyTerms.length - 5} more terms
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview & Download */}
          {step === 'preview' && selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="h4 font-bold text-slate-900 mb-2">
                  Letter Preview
                </h3>
                <p className="text-slate-600 body-sm mb-4">
                  From: {selectedTemplate.entityType} ({fromEntity})
                </p>
              </div>

              {/* Format Selection */}
              <div className="flex gap-4">
                <button
                  onClick={() => setLetterFormat('email')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    letterFormat === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Email Draft
                </button>
                <button
                  onClick={() => setLetterFormat('pdf')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    letterFormat === 'pdf'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  PDF Download
                </button>
              </div>

              {/* Letter Preview */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 whitespace-pre-wrap font-mono body-sm max-h-96 overflow-y-auto">
                {generatedLetter}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyToClipboard}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  Copy to Clipboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPDF}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Download
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3 justify-end">
          {step === 'select' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </motion.button>
            </>
          ) : step === 'generate' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep('select')}
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateLetter}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Generate Letter
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep('generate')}
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Consent Request'}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
