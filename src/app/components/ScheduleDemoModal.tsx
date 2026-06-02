'use client'

import { useState } from 'react'
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScheduleDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    contactName: '',
    role: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/demo/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit demo request')
      }

      setFormStatus('success')
      setTimeout(() => {
        onClose()
        setFormStatus('idle')
        setFormData({ company: '', email: '', contactName: '', role: '' })
      }, 2000)
    } catch (error) {
      setFormStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nav">Schedule A Demo</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {formStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-nav mb-2">Demo Request Sent!</h3>
                  <p className="text-text-muted">We'll be in touch within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-nav mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      placeholder="Acme Corporation"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-nav placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-nav mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-nav placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  {/* Contact Name */}
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-nav mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-nav placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-nav mb-2">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-nav focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    >
                      <option value="">Select a role...</option>
                      <option value="founder">Founder / CEO</option>
                      <option value="cfo">CFO / VP Finance</option>
                      <option value="corporate_counsel">General Counsel</option>
                      <option value="operations">VP Operations</option>
                      <option value="compliance">Compliance Officer</option>
                      <option value="investor_relations">Investor Relations</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Error Message */}
                  {formStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formStatus === 'loading'}
                    className="w-full mt-6 px-6 py-2.5 rounded-full font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      background: formStatus === 'loading' ? '#ccc' : '#E8312A',
                      cursor: formStatus === 'loading' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {formStatus === 'loading' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Schedule Demo
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
