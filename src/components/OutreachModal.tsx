'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Copy, Edit2, Mail } from 'lucide-react'
import { useState } from 'react'

interface OutreachModalProps {
  isOpen: boolean
  onClose: () => void
  investorName: string
  dealDetails?: {
    amount: number
    type: 'equity' | 'debt' | 'bridge'
    timeline: string
  }
}

export function OutreachModal({
  isOpen,
  onClose,
  investorName,
  dealDetails
}: OutreachModalProps) {
  const [emailSent, setEmailSent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBody, setEditedBody] = useState('')
  const [copiedEmail, setCopiedEmail] = useState('')

  const defaultSubject = `Introducing [Your Company] - Series B Funding`
  const defaultBody = `Hi ${investorName},

I hope this reaches you well. I'm reaching out because [Your Company] aligns closely with your investment thesis.

Over the past [X] months, we've achieved:
• $[X]M in ARR with [X]% YoY growth
• [X]% net revenue retention
• Strategic partnerships with [key players]

What makes this opportunity compelling:
1. [Market opportunity]
2. [Competitive advantage]
3. [Team strength]

We're actively seeking a lead investor who can contribute strategic value beyond capital. I'd love to discuss how you could be the perfect partner for this next phase.

Would you be open to a brief 20-minute call next week?

Best regards,
[Your Name]
[Your Title]
[Your Company]
[Contact Information]`

  const handleCopyEmail = () => {
    const fullEmail = `Subject: ${defaultSubject}\n\n${editedBody || defaultBody}`
    navigator.clipboard.writeText(fullEmail)
    setCopiedEmail('email')
    setTimeout(() => setCopiedEmail(''), 2000)
  }

  const handleSendEmail = () => {
    setEmailSent(true)
    setTimeout(() => {
      onClose()
      setEmailSent(false)
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full md:max-w-3xl md:rounded-xl rounded-t-2xl md:max-h-[90vh] overflow-y-auto flex flex-col"
          >
            {/* HEADER - FIXED */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="font-bold text-nav text-lg md:text-xl">Outreach to {investorName}</h2>
                <p className="text-text-muted text-xs md:text-sm mt-1">Customize your pitch before sending</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* CONTENT - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <Mail className="w-8 h-8 text-success" />
                  </motion.div>
                  <p className="font-bold text-nav text-lg mb-2">Email Sent!</p>
                  <p className="text-text-muted">Follow up in 3 days if no response</p>
                </motion.div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {/* SUBJECT */}
                  <div>
                    <label className="label block mb-2">Subject</label>
                    <input
                      type="text"
                      defaultValue={defaultSubject}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                    />
                  </div>

                  {/* EMAIL BODY */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="label block">Message</label>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-accent text-xs md:text-sm font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editedBody || defaultBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-accent h-48 md:h-64 text-sm resize-none"
                      />
                    ) : (
                      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 whitespace-pre-wrap text-sm text-nav max-h-48 md:max-h-64 overflow-y-auto">
                        {editedBody || defaultBody}
                      </div>
                    )}
                  </div>

                  {/* INVESTOR CONTEXT */}
                  {dealDetails && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-2">DEAL CONTEXT</p>
                      <p className="text-sm text-blue-900">
                        ${(dealDetails.amount / 1000000).toFixed(0)}M {dealDetails.type} round • Close: {dealDetails.timeline}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER - FIXED */}
            {!emailSent && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 flex gap-2 md:gap-3 flex-wrap md:flex-nowrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleCopyEmail}
                  className="flex-1 px-4 py-2 md:py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-semibold text-xs md:text-sm flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Email
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 md:py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition font-semibold text-xs md:text-sm"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleSendEmail}
                  className="flex-1 px-4 py-2 md:py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition font-semibold text-xs md:text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
