/**
 * QuietHoursSettings Component
 * Configure global do-not-disturb window
 */

'use client'

import { useState, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { COMMON_TIMEZONES } from '@/lib/time-utils'
import { NotificationSettings } from '@/lib/notification-types'

interface QuietHoursSettingsProps {
  settings: NotificationSettings
  onUpdate: (updates: Partial<Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  onSaving: boolean
}

export function QuietHoursSettings({
  settings,
  onUpdate,
  onSaving,
}: QuietHoursSettingsProps) {
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false)
  const [localSaving, setLocalSaving] = useState(false)

  const handleTimeChange = async (field: 'doNotDisturbStart' | 'doNotDisturbEnd', value: string) => {
    setLocalSaving(true)
    try {
      await onUpdate({
        [field]: value,
      })
    } finally {
      setLocalSaving(false)
    }
  }

  const handleTimezoneChange = async (timezone: string) => {
    setLocalSaving(true)
    try {
      await onUpdate({
        doNotDisturbTimezone: timezone,
      })
      setShowTimezoneDropdown(false)
    } finally {
      setLocalSaving(false)
    }
  }

  const timezoneLabel = useMemo(() => {
    const tz = COMMON_TIMEZONES.find(t => t.code === settings.doNotDisturbTimezone)
    return tz ? tz.name : settings.doNotDisturbTimezone
  }, [settings.doNotDisturbTimezone])

  const isSaving = onSaving || localSaving

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E5E4E0' }}>
      {/* Header */}
      <div className="px-4 py-4" style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EFED' }}>
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4" style={{ color: '#9A9A9A' }} />
          <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Do Not Disturb Hours</p>
        </div>
        <p className="text-xs mt-1" style={{ color: '#9A9A9A' }}>
          No real-time notifications during these hours
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Timezone Selector */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: '#717171' }}>
            Timezone
          </label>
          <div className="relative">
            <button
              onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 rounded-lg text-sm border text-left transition-all flex items-center justify-between"
              style={{
                borderColor: '#E5E4E0',
                background: '#FAFAFA',
                color: '#1A1A1A',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              <span>{timezoneLabel}</span>
              <svg
                className="w-4 h-4 transition-transform"
                style={{
                  transform: showTimezoneDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Timezone Dropdown */}
            {showTimezoneDropdown && !isSaving && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-20 border max-h-64 overflow-y-auto"
                style={{
                  background: 'white',
                  borderColor: '#E5E4E0',
                }}
              >
                {COMMON_TIMEZONES.map(tz => (
                  <button
                    key={tz.code}
                    onClick={() => handleTimezoneChange(tz.code)}
                    className="w-full text-left px-4 py-3 border-b last:border-b-0 transition-all"
                    style={{
                      borderColor: '#F0EFED',
                      background: settings.doNotDisturbTimezone === tz.code ? '#F7F6F4' : 'white',
                      color: '#1A1A1A',
                    }}
                  >
                    <p className="text-sm font-medium">{tz.name}</p>
                    <p className="text-xs" style={{ color: '#9A9A9A' }}>{tz.code}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#717171' }}>
              Start Time
            </label>
            <input
              type="time"
              value={settings.doNotDisturbStart}
              onChange={e => handleTimeChange('doNotDisturbStart', e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all"
              style={{
                borderColor: '#E5E4E0',
                background: '#FAFAFA',
                color: '#1A1A1A',
                cursor: isSaving ? 'not-allowed' : 'text',
                opacity: isSaving ? 0.5 : 1,
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#717171' }}>
              End Time
            </label>
            <input
              type="time"
              value={settings.doNotDisturbEnd}
              onChange={e => handleTimeChange('doNotDisturbEnd', e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-all"
              style={{
                borderColor: '#E5E4E0',
                background: '#FAFAFA',
                color: '#1A1A1A',
                cursor: isSaving ? 'not-allowed' : 'text',
                opacity: isSaving ? 0.5 : 1,
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            background: '#F7F6F4',
            color: '#717171',
          }}
        >
          <p>
            During these hours, real-time notifications will be suppressed.
            Digest notifications will still be delivered at their scheduled time.
          </p>
        </div>
      </div>
    </div>
  )
}
