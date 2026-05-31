'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTrialCountdownData } from '@/lib/trial-manager'

interface TrialBannerProps {
  companyId: string
}

export function TrialCountdownBanner({ companyId }: TrialBannerProps) {
  const [data, setData] = useState<{
    daysRemaining: number
    percentage: number
    trialPlan: string
    isLastDay: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrialData() {
      try {
        const trialData = await getTrialCountdownData(companyId)
        setData(trialData)
      } catch (error) {
        console.error('Failed to load trial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrialData()
  }, [companyId])

  if (loading || !data) {
    return null
  }

  if (data.daysRemaining <= 0) {
    return null
  }

  const bgColor = data.isLastDay
    ? 'bg-red-50 border-red-200'
    : 'bg-amber-50 border-amber-200'
  const textColor = data.isLastDay ? 'text-red-900' : 'text-amber-900'
  const badgeColor = data.isLastDay
    ? 'bg-red-100 text-red-800'
    : 'bg-amber-100 text-amber-800'
  const progressColor = data.isLastDay ? 'bg-red-500' : 'bg-amber-500'

  return (
    <div className={`border-l-4 p-4 mb-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className={`font-semibold ${textColor}`}>
              {data.isLastDay
                ? '⏰ Your trial expires today!'
                : `📅 Trial expires in ${data.daysRemaining} day${
                    data.daysRemaining === 1 ? '' : 's'
                  }`}
            </p>
            <span className={`px-2 py-1 rounded text-sm font-medium ${badgeColor}`}>
              {data.trialPlan.charAt(0).toUpperCase() + data.trialPlan.slice(1)} Plan
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all`}
              style={{ width: `${data.percentage}%` }}
            />
          </div>

          <p className={`text-sm ${textColor} mb-3`}>
            Upgrade to a premium plan to continue using IPOReady after your trial ends.
            All your data will be preserved.
          </p>

          <div className="flex gap-3">
            <Link
              href="/checkout?plan=growth"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade to Premium
            </Link>
            <button
              onClick={(e) => {
                // Close banner (optional - user can just close it)
                const banner = (e.currentTarget as HTMLElement).closest('[data-trial-banner]')
                if (banner) {
                  (banner as HTMLElement).style.display = 'none'
                }
              }}
              className="px-4 py-2 bg-transparent border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {data.isLastDay && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className={`text-sm ${textColor}`}>
            💡 <strong>Need help?</strong> Contact our support team at
            support@ipoready.ai or call +1-416-555-0123
          </p>
        </div>
      )}
    </div>
  )
}
