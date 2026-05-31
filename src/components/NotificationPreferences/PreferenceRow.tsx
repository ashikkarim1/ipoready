/**
 * PreferenceRow Component
 * Displays toggles for each notification channel and frequency dropdown
 */

'use client'

import { useState } from 'react'
import { Bell, Mail, MessageCircle, Smartphone } from 'lucide-react'
import {
  NotificationType,
  NotificationFrequency,
  PreferenceConfig,
} from '@/lib/notification-types'

interface PreferenceRowProps {
  type: NotificationType
  label: string
  description: string
  preference: PreferenceConfig
  onChange: (updated: Omit<PreferenceConfig, 'notificationType' | 'updatedAt'>) => void
  onSaving: boolean
}

export function PreferenceRow({
  type,
  label,
  description,
  preference,
  onChange,
  onSaving,
}: PreferenceRowProps) {
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)

  const frequencyLabels: Record<NotificationFrequency, { label: string; desc: string }> = {
    real_time: { label: 'Real-time', desc: 'Instantly' },
    daily_digest: { label: 'Daily Digest', desc: 'Once per day' },
    weekly: { label: 'Weekly', desc: 'Once per week' },
    never: { label: 'Never', desc: 'Disabled' },
  }

  const handleChannelToggle = (channel: keyof Omit<PreferenceConfig, 'notificationType' | 'frequency' | 'quietHoursStart' | 'quietHoursEnd' | 'quietHoursTimezone' | 'updatedAt'>) => {
    onChange({
      ...preference,
      [channel]: !preference[channel],
    })
  }

  const handleFrequencyChange = (freq: NotificationFrequency) => {
    onChange({
      ...preference,
      frequency: freq,
    })
    setShowFrequencyDropdown(false)
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E5E4E0' }}>
      {/* Header with title and frequency dropdown */}
      <div className="flex items-start justify-between p-4" style={{ background: '#FAFAFA', borderBottom: '1px solid #F0EFED' }}>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{label}</p>
          <p className="text-xs mt-1" style={{ color: '#9A9A9A' }}>{description}</p>
        </div>

        {/* Frequency Dropdown */}
        <div className="relative ml-4 flex-shrink-0">
          <button
            onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
            disabled={onSaving}
            className="px-3 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              borderColor: '#E5E4E0',
              background: '#FAFAFA',
              color: '#1A1A1A',
              cursor: onSaving ? 'not-allowed' : 'pointer',
              opacity: onSaving ? 0.5 : 1,
            }}
          >
            {frequencyLabels[preference.frequency].label}
          </button>

          {/* Dropdown Menu */}
          {showFrequencyDropdown && !onSaving && (
            <div
              className="absolute top-full right-0 mt-1 rounded-lg shadow-lg z-20 border"
              style={{
                background: 'white',
                borderColor: '#E5E4E0',
                minWidth: '160px',
              }}
            >
              {Object.entries(frequencyLabels).map(([freq, { label: freqLabel, desc }]) => (
                <button
                  key={freq}
                  onClick={() => handleFrequencyChange(freq as NotificationFrequency)}
                  className="w-full text-left px-4 py-3 border-b last:border-b-0 transition-all"
                  style={{
                    borderColor: '#F0EFED',
                    background: preference.frequency === freq ? '#F7F6F4' : 'white',
                    color: '#1A1A1A',
                  }}
                >
                  <p className="text-sm font-medium">{freqLabel}</p>
                  <p className="text-xs" style={{ color: '#9A9A9A' }}>{desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Channel Toggles */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'emailEnabled' as const, icon: Mail, label: 'Email' },
          { key: 'smsEnabled' as const, icon: Smartphone, label: 'SMS' },
          { key: 'pushEnabled' as const, icon: Bell, label: 'Push' },
          { key: 'whatsappEnabled' as const, icon: MessageCircle, label: 'WhatsApp' },
        ].map(({ key, icon: Icon, label: channelLabel }) => (
          <button
            key={key}
            onClick={() => handleChannelToggle(key)}
            disabled={onSaving}
            className="p-3 rounded-lg border transition-all flex flex-col items-center gap-2"
            style={{
              background: preference[key] ? '#1A1A1A' : '#FAFAFA',
              border: preference[key]
                ? '1px solid #1A1A1A'
                : '1px solid #E5E4E0',
              color: preference[key] ? 'white' : '#9A9A9A',
              cursor: onSaving ? 'not-allowed' : 'pointer',
              opacity: onSaving ? 0.5 : 1,
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{channelLabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
