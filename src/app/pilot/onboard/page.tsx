'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type Stage = 'pre_ipo' | 'rto' | 'pre_revenue' | 'growth' | 'profitable'
type Exchange = 'TSX' | 'NASDAQ' | 'NYSE' | 'TSXV' | 'CSE' | 'OTC' | 'JSE'

interface FormData {
  companyName: string
  sector: string
  stage: Stage
  targetExchange: Exchange
  foundingYear: number
  teamSize: number
  ceoName: string
  ceoEmail: string
  ceoPhone: string
}

const SECTORS = [
  'Technology',
  'Biotechnology',
  'Healthcare',
  'Energy',
  'Fintech',
  'E-commerce',
  'SaaS',
  'Clean Tech',
  'Manufacturing',
  'Financial Services',
  'Other'
]

const STAGES: { value: Stage; label: string; description: string }[] = [
  { value: 'pre_ipo', label: 'Pre-IPO Company', description: 'Established company preparing for IPO' },
  { value: 'rto', label: 'RTO Candidate', description: 'Looking at Reverse Takeover opportunity' },
  { value: 'growth', label: 'Growth Stage', description: 'Scaling and building toward exit' },
  { value: 'profitable', label: 'Profitable', description: 'Generating revenue and profits' },
  { value: 'pre_revenue', label: 'Pre-Revenue', description: 'Early stage, building product' }
]

const EXCHANGES: Exchange[] = ['TSX', 'NASDAQ', 'NYSE', 'TSXV', 'CSE', 'OTC', 'JSE']

export default function PilotOnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState<'welcome' | 'company' | 'contact' | 'success'>('welcome')
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    sector: '',
    stage: 'pre_ipo',
    targetExchange: 'TSX',
    foundingYear: new Date().getFullYear() - 5,
    teamSize: 25,
    ceoName: '',
    ceoEmail: '',
    ceoPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pilotCode, setPilotCode] = useState('')

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleNext = async () => {
    if (step === 'welcome') {
      setStep('company')
      return
    }

    if (step === 'company') {
      if (!formData.companyName.trim()) {
        setError('Company name is required')
        return
      }
      if (!formData.sector) {
        setError('Please select a sector')
        return
      }
      setStep('contact')
      return
    }

    if (step === 'contact') {
      if (!formData.ceoName.trim()) {
        setError('CEO/Founder name is required')
        return
      }
      if (!formData.ceoEmail.trim()) {
        setError('Email is required')
        return
      }
      if (!validateEmail(formData.ceoEmail)) {
        setError('Please enter a valid email address')
        return
      }
      if (!formData.ceoPhone.trim()) {
        setError('Phone number is required')
        return
      }

      // Submit pilot application
      setLoading(true)
      try {
        const response = await fetch('/api/pilot/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to create pilot account')
          setLoading(false)
          return
        }

        setPilotCode(data.code)
        setStep('success')
      } catch (err) {
        setError('An error occurred. Please try again.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🚀</span>
              </div>
            </motion.div>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Join the IPOReady Pilot
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              Be among the first 10 companies to experience the world's first
            </p>
            <p className="text-xl text-blue-600 font-semibold mb-8">
              AI-Powered IPO Operating System
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-8 text-left">
              <p className="text-slate-700">
                <strong>✓ Free pilot access</strong> to our complete platform<br/>
                <strong>✓ Weekly feedback sessions</strong> with our team<br/>
                <strong>✓ Priority support</strong> and feature requests<br/>
                <strong>✓ Shape the future</strong> of IPO readiness
              </p>
            </div>

            <p className="text-sm text-slate-500 mb-8">
              Takes 5 minutes. We'll create your account and send login credentials immediately.
            </p>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Company Info Step */}
        {step === 'company' && (
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Tell us about your company</h2>

            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g., TechCorp Inc"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Primary Sector *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a sector...</option>
                  {SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Current Stage *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STAGES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleInputChange('stage', s.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.stage === s.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{s.label}</div>
                      <div className="text-xs text-slate-600">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Exchange */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Exchange *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {EXCHANGES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => handleInputChange('targetExchange', ex)}
                      className={`py-2 px-3 rounded-lg border-2 font-semibold transition-all ${
                        formData.targetExchange === ex
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Founding Year & Team Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Founded
                  </label>
                  <input
                    type="number"
                    value={formData.foundingYear}
                    onChange={(e) => handleInputChange('foundingYear', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('welcome')}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Step */}
        {step === 'contact' && (
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {formData.companyName}
            </h2>
            <p className="text-slate-600 mb-8">
              {formData.sector} • {formData.stage.replace('_', ' ')} • {formData.targetExchange}
            </p>

            <div className="space-y-6">
              {/* CEO Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Name (CEO/Founder) *
                </label>
                <input
                  type="text"
                  value={formData.ceoName}
                  onChange={(e) => handleInputChange('ceoName', e.target.value)}
                  placeholder="e.g., Sarah Johnson"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CEO Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.ceoEmail}
                  onChange={(e) => handleInputChange('ceoEmail', e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CEO Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.ceoPhone}
                  onChange={(e) => handleInputChange('ceoPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-xs text-blue-800">
                  By joining the pilot, you agree to our <a href="/privacy" className="underline font-semibold">Privacy Policy</a> and <a href="/terms" className="underline font-semibold">Terms of Service</a>. Your information is PIPEDA and GDPR compliant.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('company')}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Signup
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to the Pilot!
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Your account is ready. Check your email for login credentials.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8 text-left">
              <p className="text-sm text-slate-600 mb-2">Your Pilot Code</p>
              <p className="text-2xl font-mono font-bold text-blue-600 mb-4">
                {pilotCode}
              </p>
              <p className="text-xs text-slate-600">
                Use this code for priority support and to identify your company in our system.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-8 text-left">
              <p className="text-sm font-semibold text-amber-900 mb-2">Next Steps</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>✓ Check your email for login link</li>
                <li>✓ Complete your company profile (5 min)</li>
                <li>✓ Start your IPO readiness assessment</li>
                <li>✓ Join our weekly feedback call (Tuesdays 10am EST)</li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/checklist')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>

            <p className="text-xs text-slate-500 mt-6">
              Questions? Email us at <a href="mailto:pilot@ipoready.ai" className="text-blue-600 underline">pilot@ipoready.ai</a>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
