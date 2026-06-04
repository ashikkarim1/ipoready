'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle, CheckCircle2, Clock, FileText, Target, MessageSquare,
  Loader2, Save, X, Bell, Hash
} from 'lucide-react'

interface SlackChannel {
  id: string
  name: string
  is_member: boolean
}

interface NotificationPreferences {
  channel_id: string
  notification_types: {
    filings: boolean
    milestones: boolean
    tasks: boolean
    comments: boolean
  }
  mention_preference: 'channel' | 'direct' | 'none'
  quiet_hours?: {
    start: string
    end: string
  } | null
}

interface SlackNotificationPreferencesProps {
  workspaceId: string
  workspaceName: string
  onSave?: (preferences: NotificationPreferences) => void
  onClose?: () => void
  initialPreferences?: Partial<NotificationPreferences>
}

/**
 * Slack Notification Preferences Component
 * Allows users to configure which notifications are sent to Slack,
 * which channel they go to, mention preferences, and quiet hours
 */
export function SlackNotificationPreferences({
  workspaceId,
  workspaceName,
  onSave,
  onClose,
  initialPreferences = {},
}: SlackNotificationPreferencesProps) {
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [selectedChannel, setSelectedChannel] = useState<string>(
    initialPreferences.channel_id || ''
  )
  const [notificationTypes, setNotificationTypes] = useState(
    initialPreferences.notification_types || {
      filings: true,
      milestones: true,
      tasks: true,
      comments: true,
    }
  )
  const [mentionPreference, setMentionPreference] = useState<'channel' | 'direct' | 'none'>(
    (initialPreferences.mention_preference as any) || 'channel'
  )
  const [quietHours, setQuietHours] = useState(
    initialPreferences.quiet_hours || { start: '', end: '' }
  )
  const [enableQuietHours, setEnableQuietHours] = useState(
    !!(initialPreferences.quiet_hours?.start && initialPreferences.quiet_hours?.end)
  )

  // Load channels on mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/integrations/slack/channels')
        if (!response.ok) throw new Error('Failed to load channels')
        const data = await response.json()
        setChannels(data.channels || [])
        if (!selectedChannel && data.channels?.length > 0) {
          setSelectedChannel(data.channels[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channels')
      } finally {
        setLoading(false)
      }
    }

    loadChannels()
  }, [selectedChannel])

  const toggleNotificationType = useCallback((type: keyof typeof notificationTypes) => {
    setNotificationTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }))
  }, [])

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      setError(null)

      const preferences: NotificationPreferences = {
        channel_id: selectedChannel,
        notification_types: notificationTypes,
        mention_preference: mentionPreference,
        quiet_hours: enableQuietHours
          ? { start: quietHours.start, end: quietHours.end }
          : null,
      }

      const response = await fetch('/api/integrations/slack/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save preferences')
      }

      setSuccess(true)
      onSave?.(preferences)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const notificationTypeConfig = [
    {
      id: 'filings',
      label: 'Filing Alerts',
      description: 'SEDAR/EDGAR filings, prospectus status changes',
      icon: FileText,
    },
    {
      id: 'milestones',
      label: 'Milestone Updates',
      description: 'IPO progress, regulatory approvals, listing completion',
      icon: Target,
    },
    {
      id: 'tasks',
      label: 'Task Assignments',
      description: 'New tasks, due date reminders, task completions',
      icon: MessageSquare,
    },
    {
      id: 'comments',
      label: 'Comments & Mentions',
      description: 'Comments on documents, team mentions, discussions',
      icon: Bell,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-slate-600 dark:text-slate-400 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Slack Notification Preferences
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Workspace: <span className="font-medium">{workspaceName}</span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
        >
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Success Alert */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4"
        >
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Preferences saved successfully
            </p>
          </div>
        </motion.div>
      )}

      {/* Channel Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Notification Channel
          </div>
        </label>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          disabled={saving}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {channels.length === 0 ? (
            <option>No channels available</option>
          ) : (
            channels.map(channel => (
              <option key={channel.id} value={channel.id}>
                # {channel.name}
              </option>
            ))
          )}
        </select>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Select which Slack channel receives IPOReady notifications
        </p>
      </div>

      {/* Notification Types */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
          Notification Types
        </label>
        <div className="space-y-3">
          {notificationTypeConfig.map(({ id, label, description, icon: Icon }) => (
            <motion.div
              key={id}
              whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700
                hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => toggleNotificationType(id as any)}
            >
              <input
                type="checkbox"
                checked={notificationTypes[id as keyof typeof notificationTypes]}
                onChange={() => toggleNotificationType(id as any)}
                disabled={saving}
                className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600
                  text-blue-600 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-white">{label}</p>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mention Preferences */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
          Mention Preference
        </label>
        <div className="space-y-2">
          {[
            {
              value: 'channel',
              label: 'Channel Mention',
              description: 'Notify entire channel with @channel',
            },
            {
              value: 'direct',
              label: 'Direct Message',
              description: 'Send direct message to your Slack account',
            },
            {
              value: 'none',
              label: 'No Mention',
              description: 'Post message without mentioning anyone',
            },
          ].map(option => (
            <label
              key={option.value}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700
                hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <input
                type="radio"
                name="mention_preference"
                value={option.value}
                checked={mentionPreference === option.value}
                onChange={(e) => setMentionPreference(e.target.value as any)}
                disabled={saving}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={enableQuietHours}
            onChange={(e) => setEnableQuietHours(e.target.checked)}
            disabled={saving}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600
              text-blue-600 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
            <Clock className="h-4 w-4" />
            Enable Quiet Hours
          </span>
        </label>

        {enableQuietHours && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 ml-7"
          >
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Notifications won't be sent during these hours (24-hour format)
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) =>
                    setQuietHours(prev => ({ ...prev, start: e.target.value }))
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) =>
                    setQuietHours(prev => ({ ...prev, end: e.target.value }))
                  }
                  disabled={saving}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSavePreferences}
          disabled={saving || !selectedChannel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2
            bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Preferences
            </>
          )}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600
              text-slate-700 dark:text-slate-300 font-medium rounded-lg
              hover:bg-slate-50 dark:hover:bg-slate-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </motion.div>
  )
}
