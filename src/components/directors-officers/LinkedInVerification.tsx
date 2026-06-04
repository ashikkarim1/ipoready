'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Loader,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Zap,
  GraduationCap,
  Briefcase,
  Award,
  Target,
  TrendingUp,
  X,
  Link2,
} from 'lucide-react'

export interface LinkedInData {
  url: string
  verified: boolean
  verifiedAt?: string
  confidence: number
  education: EducationEntry[]
  experience: ExperienceEntry[]
  certifications: string[]
  boardPositions: string[]
  summary?: string
}

interface EducationEntry {
  institution: string
  degree: string
  field: string
  graduationYear?: string
}

interface ExperienceEntry {
  company: string
  position: string
  startYear: string
  endYear?: string
  isCurrent: boolean
  duration?: string
}

interface LinkedInVerificationProps {
  directorId: string
  directorName: string
  existingLinkedInUrl?: string
  onVerified: (data: LinkedInData) => void
}

type VerificationStatus = 'idle' | 'validating' | 'verifying' | 'success' | 'error'

export function LinkedInVerification({
  directorId,
  directorName,
  existingLinkedInUrl,
  onVerified,
}: LinkedInVerificationProps) {
  const [url, setUrl] = useState(existingLinkedInUrl || '')
  const [status, setStatus] = useState<VerificationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [verifiedData, setVerifiedData] = useState<LinkedInData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const [isAutoPopulating, setIsAutoPopulating] = useState(false)

  const validateLinkedInUrl = (urlString: string): boolean => {
    try {
      const linkedInRegex =
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/i
      return linkedInRegex.test(urlString.trim())
    } catch {
      return false
    }
  }

  const normalizeLinkedInUrl = (urlString: string): string => {
    let normalized = urlString.trim()

    // Add https:// if missing
    if (!normalized.startsWith('http')) {
      normalized = 'https://' + normalized
    }

    // Ensure www is present
    if (!normalized.includes('://www.')) {
      normalized = normalized.replace('://', '://www.')
    }

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '')

    return normalized
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setError(null)
  }

  const handleVerify = async () => {
    setError(null)

    // Validate URL format
    if (!url.trim()) {
      setError('Please enter a LinkedIn URL')
      return
    }

    if (!validateLinkedInUrl(url)) {
      setError(
        'Invalid LinkedIn URL format. Please use: linkedin.com/in/your-profile'
      )
      return
    }

    setStatus('validating')

    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    setStatus('verifying')

    try {
      const normalizedUrl = normalizeLinkedInUrl(url)

      const response = await fetch('/api/directors-officers/verify-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directorId,
          directorName,
          linkedInUrl: normalizedUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed')
      }

      const linkedInData: LinkedInData = {
        url: normalizedUrl,
        verified: true,
        verifiedAt: new Date().toISOString(),
        confidence: result.confidence || 0.85,
        education: result.education || [],
        experience: result.experience || [],
        certifications: result.certifications || [],
        boardPositions: result.boardPositions || [],
        summary: result.summary,
      }

      setVerifiedData(linkedInData)
      setStatus('success')
      onVerified(linkedInData)
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error ? err.message : 'Failed to verify LinkedIn profile'
      )
    }
  }

  const handleAutoPopulate = async () => {
    if (!verifiedData) return

    setIsAutoPopulating(true)
    setError(null)

    try {
      const response = await fetch(
        '/api/directors-officers/auto-populate-linkedin',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directorId,
            linkedInData: verifiedData,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Auto-populate failed')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to auto-populate data from LinkedIn'
      )
    } finally {
      setIsAutoPopulating(false)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const handleClearData = () => {
    setVerifiedData(null)
    setUrl(existingLinkedInUrl || '')
    setStatus('idle')
    setError(null)
  }

  const formatYearRange = (start: string, end?: string): string => {
    if (!end) return `${start} - Present`
    return `${start} - ${end}`
  }

  const getConfidenceColor = (
    confidence: number
  ): { bg: string; border: string; text: string; badge: string } => {
    if (confidence >= 0.9) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-800',
      }
    } else if (confidence >= 0.7) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800',
      }
    } else {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800',
      }
    }
  }

  const confidenceColors = verifiedData
    ? getConfidenceColor(verifiedData.confidence)
    : { border: 'border-slate-300', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-[#0A66C2]" />
          <h2 className="h4 text-gray-900">LinkedIn Verification</h2>
        </div>
        <p className="body-sm text-gray-600">
          Verify {directorName}'s LinkedIn profile to auto-populate professional
          background
        </p>
      </div>

      {/* Input Section */}
      <AnimatePresence mode="wait">
        {!verifiedData ? (
          <motion.div
            key="input-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <label className="block label font-semibold text-gray-900 mb-3">
                LinkedIn Profile URL
              </label>

              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="linkedin.com/in/your-profile"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 body-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent transition-colors"
                    disabled={status !== 'idle'}
                  />
                  {url && (
                    <button
                      onClick={handleCopyUrl}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copy URL"
                    >
                      {urlCopied ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>

                <motion.button
                  onClick={handleVerify}
                  disabled={!url || status !== 'idle'}
                  whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
                  whileTap={{ scale: status === 'idle' ? 0.98 : 1 }}
                  className="px-6 py-3 bg-[#0A66C2] text-white rounded-lg label font-semibold hover:bg-[#0F5196] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {status === 'idle' ? (
                    <>
                      <Zap className="w-4 h-4" />
                      Verify
                    </>
                  ) : status === 'validating' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Validating...
                    </>
                  ) : status === 'verifying' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : null}
                </motion.button>
              </div>

              <p className="caption-sm text-gray-600">
                Example: linkedin.com/in/john-smith or
                https://www.linkedin.com/in/john-smith
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verified-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border ${confidenceColors.border} ${confidenceColors.bg} p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="label font-semibold text-gray-900">
                    Profile Verified
                  </h3>
                  <a
                    href={verifiedData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-sm text-[#0A66C2] hover:underline flex items-center gap-1 mt-1"
                  >
                    {verifiedData.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                onClick={handleClearData}
                className="p-2 hover:bg-gray-200/50 rounded-lg transition-colors"
                title="Clear data"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Confidence Score */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="label font-medium text-gray-900">
                  Verification Confidence
                </label>
                <div className={`px-3 py-1 rounded-full label font-semibold ${confidenceColors.badge}`}>
                  {Math.round(verifiedData.confidence * 100)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${verifiedData.confidence * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${
                    verifiedData.confidence >= 0.9
                      ? 'bg-green-500'
                      : verifiedData.confidence >= 0.7
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Auto-Populate Button */}
            <motion.button
              onClick={handleAutoPopulate}
              disabled={isAutoPopulating}
              whileHover={{ scale: isAutoPopulating ? 1 : 1.02 }}
              whileTap={{ scale: isAutoPopulating ? 1 : 0.98 }}
              className="w-full px-4 py-3 bg-[#0A66C2] text-white rounded-lg label font-semibold hover:bg-[#0F5196] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAutoPopulating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Auto-populating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Auto-populate Director Profile
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-red-50 p-4 flex items-start gap-3 border border-red-200"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="label font-semibold text-red-900">Verification Error</p>
              <p className="body-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verified Data Display */}
      <AnimatePresence>
        {verifiedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Toggle Details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-[#0A66C2] label font-semibold hover:underline"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  View Extracted Data
                </>
              )}
            </button>

            {/* Extracted Data Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Education */}
                  {verifiedData.education && verifiedData.education.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-5 h-5 text-[#0A66C2]" />
                        <h4 className="label font-semibold text-gray-900">
                          Education
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {verifiedData.education.map((edu, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + idx * 0.05 }}
                            className="p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <p className="label font-semibold text-gray-900">
                              {edu.degree}
                            </p>
                            <p className="body-sm text-gray-700">{edu.field}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="caption-sm text-gray-600">
                                {edu.institution}
                              </p>
                              {edu.graduationYear && (
                                <span className="caption-sm font-medium text-gray-600">
                                  {edu.graduationYear}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Experience */}
                  {verifiedData.experience && verifiedData.experience.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-[#0A66C2]" />
                        <h4 className="label font-semibold text-gray-900">
                          Experience
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {verifiedData.experience.map((exp, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + idx * 0.05 }}
                            className="p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p className="label font-semibold text-gray-900">
                                {exp.position}
                              </p>
                              {exp.isCurrent && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full caption-sm font-medium">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="body-sm text-gray-700 mb-2">{exp.company}</p>
                            <p className="caption-sm text-gray-600">
                              {exp.duration ||
                                formatYearRange(exp.startYear, exp.endYear)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Board Positions */}
                  {verifiedData.boardPositions &&
                    verifiedData.boardPositions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-[#0A66C2]" />
                          <h4 className="label font-semibold text-gray-900">
                            Board Positions
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {verifiedData.boardPositions.map((position, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.35 + idx * 0.05 }}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                            >
                              <TrendingUp className="w-4 h-4 text-[#0A66C2] flex-shrink-0" />
                              <span className="body-sm text-gray-700">
                                {position}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                  {/* Certifications */}
                  {verifiedData.certifications &&
                    verifiedData.certifications.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-[#0A66C2]" />
                          <h4 className="label font-semibold text-gray-900">
                            Certifications
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {verifiedData.certifications.map((cert, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.45 + idx * 0.05 }}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="body-sm text-gray-700">{cert}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                  {/* Summary */}
                  {verifiedData.summary && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="rounded-lg border border-gray-200 bg-blue-50 p-4 border-blue-200"
                    >
                      <p className="label font-semibold text-gray-900 mb-2">
                        Professional Summary
                      </p>
                      <p className="body-sm text-gray-700 leading-relaxed">
                        {verifiedData.summary}
                      </p>
                    </motion.div>
                  )}

                  {/* Info Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="rounded-lg bg-blue-50 p-4 border border-blue-200"
                  >
                    <p className="body-sm text-blue-900">
                      Review extracted information for accuracy. You can
                      manually edit these details in the director profile form if
                      needed.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!verifiedData && status === 'idle' && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-600"
        >
          <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="body-sm">No LinkedIn profile verified yet</p>
        </motion.div>
      )}
    </div>
  )
}
