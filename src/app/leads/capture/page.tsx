'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

interface FormData {
  fullName: string
  email: string
  companyName: string
  listingExchange: string
}

interface ValidationState {
  fullName: '' | 'valid' | 'error'
  email: '' | 'valid' | 'validating' | 'error'
  companyName: '' | 'valid' | 'error'
  listingExchange: '' | 'valid' | 'error'
}

interface EmailError {
  exists: boolean
  invalidFormat: boolean
}

export default function LeadCapturePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    companyName: '',
    listingExchange: '',
  })

  const [validation, setValidation] = useState<ValidationState>({
    fullName: '',
    email: '',
    companyName: '',
    listingExchange: '',
  })

  const [emailError, setEmailError] = useState<EmailError>({
    exists: false,
    invalidFormat: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const setCompany = useAppStore((s) => s.setCompany)

  // Email validation: check format first, then check for duplicates
  const validateEmail = useCallback(
    async (email: string) => {
      if (!email.trim()) {
        setValidation((v) => ({ ...v, email: '' }))
        setEmailError({ exists: false, invalidFormat: false })
        return
      }

      // Check format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setValidation((v) => ({ ...v, email: 'error' }))
        setEmailError({ exists: false, invalidFormat: true })
        return
      }

      // Check for duplicates via API
      setValidation((v) => ({ ...v, email: 'validating' }))
      setEmailError({ exists: false, invalidFormat: false })

      try {
        const response = await fetch(
          `/api/lead-capture/check-email?email=${encodeURIComponent(email.toLowerCase())}`
        )

        if (!response.ok) {
          throw new Error('Failed to validate email')
        }

        const data = await response.json()

        if (data.exists) {
          setValidation((v) => ({ ...v, email: 'error' }))
          setEmailError({ exists: true, invalidFormat: false })
        } else {
          setValidation((v) => ({ ...v, email: 'valid' }))
          setEmailError({ exists: false, invalidFormat: false })
        }
      } catch (err) {
        console.error('Email validation error:', err)
        setValidation((v) => ({ ...v, email: 'error' }))
      }
    },
    []
  )

  // Debounced email validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        validateEmail(formData.email)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [formData.email, validateEmail])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation on change
    if (name === 'fullName') {
      setValidation((v) => ({ ...v, fullName: '' }))
    } else if (name === 'companyName') {
      setValidation((v) => ({ ...v, companyName: '' }))
    } else if (name === 'listingExchange') {
      setValidation((v) => ({ ...v, listingExchange: '' }))
    }
  }

  // Validate all fields
  const validateAllFields = (): boolean => {
    let isValid = true
    const newValidation: ValidationState = {
      fullName: '',
      email: '',
      companyName: '',
      listingExchange: '',
    }

    // Full Name
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newValidation.fullName = 'error'
      isValid = false
    } else {
      newValidation.fullName = 'valid'
    }

    // Email
    if (!formData.email.trim()) {
      newValidation.email = 'error'
      isValid = false
    } else if (validation.email !== 'valid') {
      newValidation.email = 'error'
      isValid = false
    } else {
      newValidation.email = 'valid'
    }

    // Company Name
    if (!formData.companyName.trim() || formData.companyName.trim().length < 2) {
      newValidation.companyName = 'error'
      isValid = false
    } else {
      newValidation.companyName = 'valid'
    }

    // Listing Exchange
    if (!formData.listingExchange) {
      newValidation.listingExchange = 'error'
      isValid = false
    } else {
      newValidation.listingExchange = 'valid'
    }

    setValidation(newValidation)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!validateAllFields()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          company_name: formData.companyName.trim(),
          listing_exchange_target: formData.listingExchange,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.message || 'Failed to process your information. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Store user context in Zustand
      setCompany({
        id: data.leadId,
        name: formData.companyName.trim(),
        listingType: 'ipo',
        targetExchange: formData.listingExchange.toLowerCase() as any,
        currentPhase: 'pre_planning',
        paceScore: 0,
        estimatedDaysToIPO: 0,
        progressPercentage: 0,
        currency: 'CAD',
        language: 'en',
        createdAt: new Date().toISOString(),
        ownerId: formData.email.toLowerCase(),
      })

      // Redirect to trial onboarding
      router.push('/trial/cap-table-setup')
    } catch (err) {
      console.error('Lead capture error:', err)
      setServerError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.fullName.trim().length >= 2 &&
    formData.companyName.trim().length >= 2 &&
    formData.listingExchange &&
    validation.email === 'valid'

  const exchanges = ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE', 'Other']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-xl p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Start Your IPO Journey</h1>
            <p className="text-slate-600">Tell us about your company to begin</p>
          </div>

          {/* Server Error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{serverError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Smith"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  validation.fullName === 'error'
                    ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : validation.fullName === 'valid'
                    ? 'border-green-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {validation.fullName === 'error' && (
                <p className="text-xs text-red-600 mt-1">Full name required (min 2 characters)</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@company.com"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    validation.email === 'error'
                      ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                      : validation.email === 'valid'
                      ? 'border-green-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500'
                      : validation.email === 'validating'
                      ? 'border-blue-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {validation.email === 'validating' && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                )}
                {validation.email === 'valid' && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
              </div>
              {validation.email === 'error' && (
                <p className="text-xs text-red-600 mt-1">
                  {emailError.invalidFormat
                    ? 'Please enter a valid email address'
                    : emailError.exists
                    ? 'This email is already registered. Please login.'
                    : 'Email is required'}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="TechCorp Inc."
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  validation.companyName === 'error'
                    ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : validation.companyName === 'valid'
                    ? 'border-green-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {validation.companyName === 'error' && (
                <p className="text-xs text-red-600 mt-1">Company name required (min 2 characters)</p>
              )}
            </div>

            {/* Listing Exchange */}
            <div>
              <label htmlFor="listingExchange" className="block text-sm font-medium text-slate-700 mb-2">
                Target Listing Exchange <span className="text-red-500">*</span>
              </label>
              <select
                id="listingExchange"
                name="listingExchange"
                value={formData.listingExchange}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  validation.listingExchange === 'error'
                    ? 'border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : validation.listingExchange === 'valid'
                    ? 'border-green-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="">Select an exchange...</option>
                {exchanges.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
              {validation.listingExchange === 'error' && (
                <p className="text-xs text-red-600 mt-1">Please select a listing exchange</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
              whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
              disabled={!isFormValid || isSubmitting}
              type="submit"
              className={`w-full py-3 font-semibold rounded-lg transition-all ${
                isFormValid && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Continue'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-xs text-slate-500 text-center mt-6">
            By continuing, you agree to our{' '}
            <a href="/legal/tos" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
