'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PrivacySettingsPage() {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [action, setAction] = useState<'export' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleDataExport = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to export data')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ipoready-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess('Your data has been exported and downloaded successfully.')
      setPassword('')
      setShowPasswordPrompt(false)
      setAction(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    if (!window.confirm('This will permanently delete your account and all associated data. This action cannot be undone. Continue?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, consent: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      setSuccess('Your account deletion has been scheduled. Check your email for confirmation.')
      setPassword('')
      setShowPasswordPrompt(false)
      setAction(null)
      setTimeout(() => window.location.href = '/login', 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      setError('Password is required')
      return
    }

    if (action === 'export') {
      await handleDataExport()
    } else if (action === 'delete') {
      await handleAccountDeletion()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy & Data Controls</h1>

        {/* Legal Pages */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Legal Documents</h2>
            <p className="text-gray-600 text-sm mt-1">
              Review our privacy and legal policies
            </p>
          </div>
          <div className="divide-y">
            <div className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Privacy Policy</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    How we collect, use, and protect your data
                  </p>
                </div>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap ml-4"
                >
                  View →
                </Link>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Terms of Service</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Your agreement to use IPOReady services
                  </p>
                </div>
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap ml-4"
                >
                  View →
                </Link>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Disclaimer</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Important information about IPOReady services and limitations
                  </p>
                </div>
                <Link
                  href="/disclaimer"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap ml-4"
                >
                  View →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Data Access Rights */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Data Rights</h2>
            <p className="text-gray-600 text-sm mt-1">
              Control your personal data (GDPR, PIPEDA, CCPA compliant)
            </p>
          </div>
          <div className="divide-y">
            {/* Data Export */}
            <div className="px-6 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Export Your Data</h3>
                  <p className="text-gray-600 text-sm mt-1 mb-4">
                    Download a copy of all your personal data in JSON format. This includes:
                  </p>
                  <ul className="text-gray-600 text-sm list-disc list-inside space-y-1 mb-4">
                    <li>Account information and profile</li>
                    <li>Company data and team memberships</li>
                    <li>Uploaded documents and documents metadata</li>
                    <li>Tasks, PACE scores, and analytics</li>
                    <li>Payment history</li>
                  </ul>
                  <p className="text-gray-500 text-xs">
                    ✓ GDPR Article 15 (Right to Access)
                    ✓ PIPEDA (Right to Access Personal Information)
                    ✓ CCPA (Right to Know)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAction('export')
                    setShowPasswordPrompt(true)
                  }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap"
                >
                  Export Data
                </button>
              </div>
            </div>

            {/* Account Deletion */}
            <div className="px-6 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Your Account</h3>
                  <p className="text-gray-600 text-sm mt-1 mb-4">
                    Permanently delete your account and all personal data. This will:
                  </p>
                  <ul className="text-gray-600 text-sm list-disc list-inside space-y-1 mb-4">
                    <li>Remove your profile and all personal information</li>
                    <li>Delete documents, tasks, and company data you created</li>
                    <li>Remove API integrations and access tokens</li>
                    <li>Schedule final deletion 30 days from request</li>
                    <li>Retain financial records for 7 years (legal requirement)</li>
                  </ul>
                  <p className="text-yellow-700 text-xs bg-yellow-50 p-2 rounded mb-4">
                    ⚠️ Deletion is permanent. You can cancel within 30 days by logging back in.
                  </p>
                  <p className="text-gray-500 text-xs">
                    ✓ GDPR Article 17 (Right to Erasure)
                    ✓ PIPEDA (Right to Request Deletion)
                    ✓ CCPA (Right to Delete)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAction('delete')
                    setShowPasswordPrompt(true)
                  }}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Other Rights */}
            <div className="px-6 py-6">
              <div>
                <h3 className="font-medium text-gray-900">Other Rights</h3>
                <p className="text-gray-600 text-sm mt-4">
                  <strong>Right to Correct:</strong> Update inaccurate data in your account settings
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Right to Restrict Processing:</strong> Contact privacy@ipoready.com
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Right to Withdraw Consent:</strong> Change communication preferences in settings
                </p>
                <p className="text-gray-600 text-sm mt-4">
                  For other requests, email: <strong>privacy@ipoready.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Verification Modal */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {action === 'export' ? 'Export Your Data' : 'Delete Your Account'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    We require your password to verify your identity
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">{success}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false)
                      setPassword('')
                      setError('')
                      setAction(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                      action === 'delete'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {loading
                      ? 'Processing...'
                      : action === 'export'
                        ? 'Export'
                        : 'Delete Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Compliance Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Data Protection Compliance</h3>
          <p className="text-blue-800 text-sm mb-3">
            IPOReady complies with international data protection regulations:
          </p>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✓ GDPR (General Data Protection Regulation) — EU/EEA</li>
            <li>✓ PIPEDA — Canada</li>
            <li>✓ CCPA — California, USA</li>
            <li>✓ AODA — Ontario, Canada</li>
          </ul>
          <p className="text-blue-700 text-xs mt-4">
            Questions about privacy? Contact <strong>privacy@ipoready.com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
