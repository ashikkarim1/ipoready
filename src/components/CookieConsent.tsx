'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'ipoready_cookie_consent'
const COOKIE_CONSENT_VERSION = '1.0'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export interface CookiePreferences {
  version: string
  essential: boolean // Always true
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: string
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: new Date().toISOString(),
  })

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!savedConsent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const newPreferences: CookiePreferences = {
      ...preferences,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString(),
    }
    saveCookieConsent(newPreferences)
    setShowBanner(false)

    // Log consent for compliance audit
    logConsentEvent('accept_all', newPreferences)
  }

  const handleRejectAll = () => {
    const newPreferences: CookiePreferences = {
      ...preferences,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString(),
    }
    saveCookieConsent(newPreferences)
    setShowBanner(false)

    // Log consent for compliance audit
    logConsentEvent('reject_all', newPreferences)
  }

  const handleSavePreferences = () => {
    const newPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
    }
    saveCookieConsent(newPreferences)
    setShowBanner(false)
    setShowDetails(false)

    // Log consent for compliance audit
    logConsentEvent('custom_preferences', newPreferences)
  }

  const saveCookieConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs))

    // Enable/disable analytics based on preference
    if (prefs.analytics && typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
      // Load Google Analytics
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      script.async = true
      document.head.appendChild(script)

      ;(window as any).dataLayer = (window as any).dataLayer || []
      function gtag(...args: any[]) {
        ;(window as any).dataLayer.push(arguments)
      }
      gtag('js', new Date())
      gtag('config', GA_MEASUREMENT_ID)
    }
  }

  const logConsentEvent = async (action: string, prefs: CookiePreferences) => {
    try {
      await fetch('/api/consent/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, preferences: prefs }),
      })
    } catch (error) {
      console.error('Failed to log consent:', error)
    }
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
        <div className="max-w-7xl mx-auto">
          {!showDetails ? (
            // Main banner
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Preferences</h3>
                <p className="body-sm text-gray-600 mb-4">
                  We use cookies to enhance your experience. Essential cookies are always on. You can
                  choose to accept analytics and marketing cookies.{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Learn more
                  </a>
                </p>
              </div>

              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            // Detailed preferences
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Cookie Preferences</h3>

              <div className="space-y-3 mb-4">
                {/* Essential (Always on) */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="essential"
                    checked={true}
                    disabled
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="essential" className="font-medium text-gray-900 cursor-not-allowed">
                      Essential Cookies
                    </label>
                    <p className="caption-sm text-gray-600">
                      Required for authentication, security, and basic functionality. Always enabled.
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="analytics" className="font-medium text-gray-900">
                      Analytics Cookies
                    </label>
                    <p className="caption-sm text-gray-600">
                      Help us understand how you use IPOReady to improve our service.
                    </p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="marketing" className="font-medium text-gray-900">
                      Marketing Cookies
                    </label>
                    <p className="caption-sm text-gray-600">
                      Used to track marketing effectiveness and show relevant ads.
                    </p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="preferences"
                    checked={preferences.preferences}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferences: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="preferences" className="font-medium text-gray-900">
                      Preference Cookies
                    </label>
                    <p className="caption-sm text-gray-600">
                      Remember your settings like theme, language, and UI preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-4 flex-wrap">
            {!showDetails ? (
              <>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 label font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 label font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  Customize
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 label font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Accept All
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 label font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Reject All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 label font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 label font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cookie Policy Link Footer */}
      <div className="fixed bottom-0 right-0 p-2 caption-sm text-gray-500 z-40">
        <a href="/privacy#11-cookies--tracking" className="hover:text-gray-700">
          Cookie Policy
        </a>
      </div>
    </>
  )
}
