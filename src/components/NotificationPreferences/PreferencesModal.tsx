/**
 * PreferencesModal Component
 * Main modal for notification preferences with tabbed interface
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import {
  NotificationType,
  NotificationFrequency,
  PreferenceConfig,
  NotificationSettings,
  DEFAULT_PREFERENCES,
} from '@/lib/notification-types'
import { PreferenceRow } from './PreferenceRow'
import { QuietHoursSettings } from './QuietHoursSettings'
import { DigestTimeSelector } from './DigestTimeSelector'

interface PreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
}

const NOTIFICATION_GROUPS = [
  {
    title: 'Tasks',
    types: [
      {
        type: NotificationType.TASK_DUE,
        label: 'Task Due Soon',
        description: '48 hours before deadline',
      },
      {
        type: NotificationType.TASK_OVERDUE,
        label: 'Task Overdue',
        description: 'When a task passes its due date',
      },
      {
        type: NotificationType.TASK_COMPLETED,
        label: 'Task Completed',
        description: 'When teammates complete assigned tasks',
      },
    ],
  },
  {
    title: 'Documents',
    types: [
      {
        type: NotificationType.DOCUMENT_SHARED,
        label: 'Document Shared',
        description: 'When a document is shared with you',
      },
      {
        type: NotificationType.DOCUMENT_VERSION_READY,
        label: 'Version Ready',
        description: 'New version of a document is available',
      },
      {
        type: NotificationType.DOCUMENT_VERIFIED,
        label: 'Document Verified',
        description: 'Document passes compliance review',
      },
      {
        type: NotificationType.DOCUMENT_REJECTED,
        label: 'Document Rejected',
        description: 'Document requires changes',
      },
    ],
  },
  {
    title: 'Progress',
    types: [
      {
        type: NotificationType.MILESTONE_ACHIEVED,
        label: 'Milestone Achieved',
        description: 'Team reaches a significant milestone',
      },
      {
        type: NotificationType.PHASE_PROGRESSED,
        label: 'Phase Progressed',
        description: 'Company advances to next IPO phase',
      },
      {
        type: NotificationType.PACE_SCORE_CHANGES,
        label: 'PACE™ Score Changes',
        description: 'Your PACE score drops below target',
      },
    ],
  },
  {
    title: 'Team & Communication',
    types: [
      {
        type: NotificationType.TEAM_MEMBER_JOINED,
        label: 'Team Member Joined',
        description: 'New person joins your team',
      },
      {
        type: NotificationType.COMMENT_MENTION,
        label: 'Mentioned in Comment',
        description: 'Someone mentions you in a comment',
      },
    ],
  },
  {
    title: 'Business Critical',
    types: [
      {
        type: NotificationType.CAP_TABLE_UPDATED,
        label: 'Cap Table Updated',
        description: 'Capitalization table is modified',
      },
      {
        type: NotificationType.BOARD_REPORT_READY,
        label: 'Board Report Ready',
        description: 'Your board report is ready for review',
      },
      {
        type: NotificationType.REGULATORY_DEADLINE,
        label: 'Regulatory Deadline',
        description: 'Upcoming regulatory filing deadline',
      },
      {
        type: NotificationType.SEDI_FILING_DUE,
        label: 'SEDI Filing Due',
        description: 'System for Electronic Disclosure filing due',
      },
    ],
  },
  {
    title: 'Account & System',
    types: [
      {
        type: NotificationType.SUBSCRIPTION_RENEWAL_WARNING,
        label: 'Subscription Renewal',
        description: 'Your subscription is about to renew',
      },
      {
        type: NotificationType.SYSTEM_ALERT,
        label: 'System Alert',
        description: 'Important system-wide updates',
      },
      {
        type: NotificationType.ACCOUNT_WARNING,
        label: 'Account Warning',
        description: 'Account security or compliance issues',
      },
      {
        type: NotificationType.NEW_EXPERT_INQUIRY_RESPONSE,
        label: 'Expert Response',
        description: 'Response to your expert inquiry',
      },
    ],
  },
]

type TabId = 'preferences' | 'settings'

export function PreferencesModal({
  isOpen,
  onClose,
  userId = '',
}: PreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('preferences')
  const [preferences, setPreferences] = useState<Map<NotificationType, PreferenceConfig>>(
    new Map()
  )
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    if (isOpen && userId) {
      loadPreferences()
    }
  }, [isOpen, userId])

  async function loadPreferences() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) {
        throw new Error('Failed to load preferences')
      }

      const data = await response.json()

      // Convert to Map
      const prefsMap = new Map<NotificationType, PreferenceConfig>()
      for (const [key, value] of Object.entries(data.preferences)) {
        prefsMap.set(key as NotificationType, value as PreferenceConfig)
      }

      setPreferences(prefsMap)
      setSettings(data.settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const prefsArray = Array.from(preferences.entries()).map(([type, config]) => ({
        notificationType: type,
        emailEnabled: config.emailEnabled,
        smsEnabled: config.smsEnabled,
        pushEnabled: config.pushEnabled,
        whatsappEnabled: config.whatsappEnabled,
        frequency: config.frequency,
        quietHoursStart: config.quietHoursStart,
        quietHoursEnd: config.quietHoursEnd,
        quietHoursTimezone: config.quietHoursTimezone,
      }))

      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: prefsArray,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  async function updateSettings(
    updates: Partial<Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) {
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: updates,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const data = await response.json()
      setSettings(data.settings)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePreferenceChange = (type: NotificationType, updated: Omit<PreferenceConfig, 'notificationType' | 'updatedAt'>) => {
    const newPrefs = new Map(preferences)
    newPrefs.set(type, {
      notificationType: type,
      ...updated,
      updatedAt: new Date().toISOString(),
    })
    setPreferences(newPrefs)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E4E0' }}>
            <div>
              <h2 className="font-bold h4" style={{ color: '#1A1A1A' }}>
                Notification Preferences
              </h2>
              <p className="caption-sm mt-1" style={{ color: '#9A9A9A' }}>
                Control how and when you receive notifications
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ background: '#F7F6F4' }}
            >
              <X className="w-5 h-5" style={{ color: '#9A9A9A' }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b" style={{ borderColor: '#E5E4E0' }}>
            <div className="flex gap-4">
              {(['preferences', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-4 font-medium body-sm border-b-2 transition-colors"
                  style={{
                    borderColor: activeTab === tab ? '#1A1A1A' : 'transparent',
                    color: activeTab === tab ? '#1A1A1A' : '#9A9A9A',
                  }}
                >
                  {tab === 'preferences' ? 'Notification Types' : 'Settings'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#9A9A9A' }} />
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                <p className="body-sm">{error}</p>
              </div>
            ) : (
              <>
                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {NOTIFICATION_GROUPS.map(group => (
                      <div key={group.title}>
                        <h3 className="font-semibold body-sm mb-3" style={{ color: '#1A1A1A' }}>
                          {group.title}
                        </h3>
                        <div className="space-y-3">
                          {group.types.map(({ type, label, description }) => (
                            <PreferenceRow
                              key={type}
                              type={type}
                              label={label}
                              description={description}
                              preference={preferences.get(type) || (DEFAULT_PREFERENCES[type] as any)}
                              onChange={updated => handlePreferenceChange(type, updated)}
                              onSaving={saving}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && settings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <DigestTimeSelector
                      settings={settings}
                      onUpdate={updateSettings}
                      onSaving={saving}
                    />

                    <QuietHoursSettings
                      settings={settings}
                      onUpdate={updateSettings}
                      onSaving={saving}
                    />
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#E5E4E0' }}>
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="label font-medium"
                style={{ color: '#16A34A' }}
              >
                Changes saved
              </motion.p>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg label font-medium transition-all"
                style={{
                  background: '#F7F6F4',
                  color: '#1A1A1A',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Close
              </button>
              {activeTab === 'preferences' && (
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg label font-medium transition-all flex items-center gap-2 text-white"
                  style={{
                    background: saving ? '#999' : '#1A1A1A',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
