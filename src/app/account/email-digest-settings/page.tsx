'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Clock, Mail, ChevronRight, Check } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const FREQUENCIES = [
  { value: 'daily', label: '📅 Daily', description: 'Every morning at 8 AM' },
  { value: 'weekly', label: '📊 Weekly', description: 'Every week on your chosen day' },
  { value: 'off', label: '🔇 Off', description: 'Disable email digest' }
]

export default function EmailDigestSettingsPage() {
  const [frequency, setFrequency] = useState('weekly')
  const [deliveryDay, setDeliveryDay] = useState('Monday')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    // In production: POST to /api/email-digest-settings
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-6 h-6" style={{ color: '#E8312A' }} />
            <h1 className="serif text-3xl font-bold text-nav">Weekly Team Digest</h1>
          </div>
          <p className="text-text-muted text-sm">
            Automated email with key metrics, system health, and compliance updates
          </p>
        </motion.div>

        {/* Frequency Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-bold text-nav">Delivery Frequency</h2>
          <div className="space-y-2">
            {FREQUENCIES.map(freq => (
              <button
                key={freq.value}
                onClick={() => setFrequency(freq.value)}
                className="w-full text-left p-4 rounded-lg border-2 transition-all card"
                style={{
                  borderColor: frequency === freq.value ? '#E8312A' : '#E5E4E0',
                  background: frequency === freq.value ? '#FDECEB' : '#FFFFFF'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-nav">{freq.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{freq.description}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: frequency === freq.value ? '#E8312A' : '#D1D5DB',
                      background: frequency === freq.value ? '#E8312A' : 'transparent'
                    }}
                  >
                    {frequency === freq.value && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Day Selection (only if weekly) */}
        {frequency === 'weekly' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <h2 className="font-bold text-nav">Delivery Day</h2>
            <p className="text-sm text-text-muted">Email sent at 9 AM on your selected day</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setDeliveryDay(day)}
                  className="p-3 rounded-lg border-2 transition-all text-sm font-semibold"
                  style={{
                    borderColor: deliveryDay === day ? '#E8312A' : '#E5E4E0',
                    background: deliveryDay === day ? '#FDECEB' : '#FFFFFF',
                    color: deliveryDay === day ? '#E8312A' : '#1A1A1A'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 space-y-4"
          style={{ border: '1px solid #E5E4E0', background: '#FFFFFF' }}
        >
          <h2 className="font-bold text-nav">What's Included</h2>
          <div className="space-y-2">
            {[
              '📊 System performance metrics (uptime, latency, errors)',
              '🔒 Compliance updates (regulatory changes, audit status)',
              '⚡ Optimization wins (hours saved, issues prevented)',
              '📈 Team activity (documents processed, tasks completed)',
              '⚠️ Below-the-line risks (blockers, warnings, action items)',
              '💰 Cost savings (AWS optimization, efficiency gains)'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span className="text-sm text-text-muted">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 space-y-4"
          style={{
            border: '2px solid #2D7A5F',
            background: '#EAF5F0'
          }}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" style={{ color: '#2D7A5F' }} />
            <h3 className="font-bold" style={{ color: '#2D7A5F' }}>Next email</h3>
          </div>
          <p className="text-sm text-text-muted">
            {frequency === 'off' ? (
              'Email digest is disabled'
            ) : (
              <>
                <strong>{deliveryDay}</strong> at <strong>9:00 AM</strong>
              </>
            )}
          </p>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSave}
          className="w-full btn btn-accent px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              Save Settings
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
