/**
 * DigestTimeSelector Component
 * Configure when digest emails are sent
 */

'use client'

import { useState, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { COMMON_TIMEZONES } from '@/lib/time-utils'
import { NotificationSettings } from '@/lib/notification-types'

interface DigestTimeSelectorProps {
  settings: NotificationSettings
  onUpdate: (updates: Partial<Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  onSaving: boolean
}

export function DigestTimeSelector({
  settings,
  onUpdate,
  onSaving,
}: DigestTimeSelectorProps) {
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false)
  const [localSaving, setLocalSaving] = useState(false)

  const handleTimeChange = async (value: string) => {
    setLocalSaving(true)
    try {
      await onUpdate({
        digestTime: value,
      })
    } finally {
      setLocalSaving(false)
    }
  }

  const handleTimezoneChange = async (timezone: string) => {
    setLocalSaving(true)
    try {
      await onUpdate({
        digestTimezone: timezone,
      })
      setShowTimezoneDropdown(false)
    } finally {
      setLocalSaving(false)
    }
  }

  const timezoneLabel = useMemo(() => {
    const tz = COMMON_TIMEZONES.find(t => t.code === settings.digestTimezone)
    return tz ? tz.name : settings.digestTimezone
  }, [settings.digestTimezone])

  const isSaving = onSaving || localSaving

  // Generate preset times
  const presetTimes = [
    { time: '07:00', label: '7:00 AM' },
    { time: '08:00', label: '8:00 AM' },
    { time: '09:00', label: '9:00 AM (Default)' },
    { time: '12:00', label: '12:00 PM' },
    { time: '17:00', label: '5:00 PM' },
    { time: '18:00', label: '6:00 PM' },
  ]

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E5E4E0' }}>
      {/* Header */}
      <div className="px-4 py-4" style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EFED' }}>
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4" style={{ color: '#9A9A9A' }} />
          <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Digest Email Time</p>
        </div>
        <p className="text-xs mt-1" style={{ color: '#9A9A9A' }}>
          When should we send your daily digest emails?
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
                      background: settings.digestTimezone === tz.code ? '#F7F6F4' : 'white',
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

        {/* Time Presets */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: '#717171' }}>
            Preferred Times
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetTimes.map(({ time, label }) => (
              <button
                key={time}
                onClick={() => handleTimeChange(time)}
                disabled={isSaving}
                className="px-3 py-2.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: settings.digestTime === time ? '#1A1A1A' : '#FAFAFA',
                  border: settings.digestTime === time ? '1px solid #1A1A1A' : '1px solid #E5E4E0',
                  color: settings.digestTime === time ? 'white' : '#1A1A1A',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Time Input */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: '#717171' }}>
            Custom Time
          </label>
          <input
            type="time"
            value={settings.digestTime}
            onChange={e => handleTimeChange(e.target.value)}
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

        {/* Info */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            background: '#F7F6F4',
            color: '#717171',
          }}
        >
          <p>
            Daily digest emails will be sent at your preferred time in your timezone.
            Digest notifications will be queued during quiet hours and sent at the next available time.
          </p>
        </div>
      </div>
    </div>
  )
}
