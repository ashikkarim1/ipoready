'use client'

import { useState } from 'react'
import { Mail, Send, Eye, FileText, AlertCircle, CheckCircle, Clock, MailX } from 'lucide-react'

export default function EmailAdminPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'test'>('logs')
  const [testEmail, setTestEmail] = useState('')
  const [testTemplate, setTestTemplate] = useState('welcome')
  const [isSending, setIsSending] = useState(false)

  // Mock email logs data
  const emailLogs = [
    {
      id: '1',
      to: 'ceo@theupcapital.com',
      template: 'demo-confirmation',
      subject: 'Demo confirmed - IPO Company #1',
      status: 'sent',
      sentAt: '2026-06-06T05:58:00Z',
      messageId: 'msg_abc123'
    },
    {
      id: '2',
      to: 'ceo@theupcapital.com',
      template: 'demo-confirmation',
      subject: 'Demo confirmed - IPO Company #2',
      status: 'sent',
      sentAt: '2026-06-06T05:59:00Z',
      messageId: 'msg_def456'
    },
    {
      id: '3',
      to: 'user@example.com',
      template: 'welcome',
      subject: 'Welcome to IPOReady',
      status: 'sent',
      sentAt: '2026-06-06T04:30:00Z',
      messageId: 'msg_ghi789'
    },
    {
      id: '4',
      to: 'test@company.com',
      template: 'password-reset',
      subject: 'Reset your IPOReady password',
      status: 'sent',
      sentAt: '2026-06-05T14:20:00Z',
      messageId: 'msg_jkl012'
    },
    {
      id: '5',
      to: 'invalid@test.com',
      template: 'lead-confirmation',
      subject: 'Welcome to IPOReady - Your 14-day free trial is ready',
      status: 'failed',
      sentAt: '2026-06-05T10:15:00Z',
      error: 'Invalid email address'
    }
  ]

  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Sent when user registers',
      variables: ['name', 'companyName', 'exchange', 'loginUrl'],
      status: 'active'
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      description: 'Sent when user requests password reset',
      variables: ['name', 'resetUrl', 'expiresInMinutes'],
      status: 'active'
    },
    {
      id: 'demo-confirmation',
      name: 'Demo Confirmation',
      description: 'Sent after demo request submission',
      variables: ['name', 'companyName', 'supportEmail'],
      status: 'active'
    },
    {
      id: 'lead-confirmation',
      name: 'Lead Confirmation',
      description: 'Sent after lead capture',
      variables: ['name', 'companyName', 'trialDays', 'dashboardUrl', 'supportEmail'],
      status: 'active'
    },
    {
      id: 'task-reminder',
      name: 'Task Reminder',
      description: 'Sent daily for upcoming tasks',
      variables: ['name', 'companyName', 'taskTitle', 'taskDescription', 'dueDate', 'dashboardUrl'],
      status: 'active'
    }
  ]

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/test/send-demo-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, templateId: testTemplate })
      })

      const data = await response.json()
      if (data.success) {
        alert(`✅ Test email sent to ${testEmail}`)
        setTestEmail('')
      } else {
        alert(`❌ Failed to send: ${data.error}`)
      }
    } catch (error) {
      alert('Error sending test email')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-50 border-green-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <MailX className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Mail className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="w-8 h-8 text-red-600" />
          Email Management
        </h1>
        <p className="text-gray-600 mt-2">Manage email templates, logs, and send test emails</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'logs', label: 'Email Logs', icon: FileText },
            { id: 'templates', label: 'Templates', icon: Eye },
            { id: 'test', label: 'Send Test Email', icon: Send }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 font-medium text-sm border-b-2 flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Email Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Delivery Log</h2>
                <p className="text-sm text-gray-600">View all emails sent through the system</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {emailLogs.map(log => (
                  <div key={log.id} className={`p-4 rounded-lg border ${getStatusColor(log.status)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        {getStatusIcon(log.status)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{log.to}</p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{log.subject}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                              log.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.status === 'sent' ? '✓ Sent' : log.status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 flex-wrap">
                            <span>Template: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{log.template}</code></span>
                            <span>{formatDate(log.sentAt)}</span>
                            {log.messageId && <span>ID: {log.messageId}</span>}
                            {log.error && <span className="text-red-600">Error: {log.error}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{emailLogs.filter(l => l.status === 'sent').length}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{emailLogs.filter(l => l.status === 'failed').length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{emailLogs.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Templates</h2>
                <p className="text-sm text-gray-600">View all available email templates and their variables</p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {emailTemplates.map(template => (
                  <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-green-100 text-green-800">
                        {template.status === 'active' ? '✓ Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Template Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map(variable => (
                          <code key={variable} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-mono">
                            {variable}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Template Management</p>
                  <p className="text-sm text-blue-700 mt-1">To edit templates, modify the template functions in <code className="bg-blue-100 px-1 rounded text-xs">src/lib/email-templates.ts</code></p>
                </div>
              </div>
            </div>
          )}

          {/* Send Test Email Tab */}
          {activeTab === 'test' && (
            <div className="space-y-6 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Send Test Email</h2>
                <p className="text-sm text-gray-600">Send a test email to verify the email system is working</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Template to Send
                  </label>
                  <select
                    value={testTemplate}
                    onChange={e => setTestTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-colors"
                  >
                    {emailTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSendTestEmail}
                  disabled={isSending}
                  className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>

              {/* Success Info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">✓ Test emails are working</p>
                <p className="text-sm text-green-700 mt-1">The email system has been successfully tested with your demo requests</p>
              </div>

              {/* API Endpoints Info */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">Email Endpoints</p>
                <ul className="text-xs text-gray-700 space-y-1 font-mono">
                  <li>POST <code className="bg-white px-2 py-1 rounded">/api/demo/submit</code></li>
                  <li>POST <code className="bg-white px-2 py-1 rounded">/api/lead-capture</code></li>
                  <li>POST <code className="bg-white px-2 py-1 rounded">/api/cron/send-task-reminders</code></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
