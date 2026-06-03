'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Mail, Sparkles, CheckCircle2 } from 'lucide-react'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    const subject = encodeURIComponent(`IPOReady Inquiry${name ? ` from ${name}` : ''}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)
    window.open(`mailto:ceo@theupcapital.com?subject=${subject}&body=${body}`)
    setTimeout(() => { setSending(false); setSent(true) }, 600)
  }

  function handleReset() {
    setSent(false); setName(''); setEmail(''); setMessage('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="mb-4 w-[340px] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-surface-primary)',
              border: '1px solid #E5E4E0',
              boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: 'var(--color-text-primary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">IPOReady Support</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-success-bright)' }} />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Replies within 1 hour</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)', e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5" style={{ background: 'var(--color-surface-primary)' }}>
              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <p className="text-text-muted text-xs leading-relaxed">
                    Have a question about your IPO journey? Message goes directly to our CEO.
                  </p>
                  <input className="input-dark text-sm" placeholder="Your name"
                    value={name} onChange={e => setName(e.target.value)} />
                  <input className="input-dark text-sm" placeholder="Your email"
                    type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  <textarea className="input-dark text-sm resize-none" placeholder="How can we help?"
                    rows={3} value={message} onChange={e => setMessage(e.target.value)} required />
                  <button type="submit" disabled={sending || !message.trim()}
                    className="btn btn-primary w-full justify-center text-sm"
                    style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem' }}>
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Message
                      </span>
                    )}
                  </button>
                  <p className="text-text-light text-xs text-center flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" /> ceo@theupcapital.com
                  </p>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: 'var(--color-success-soft)', border: '1px solid #2D7A5F30' }}>
                    <CheckCircle2 className="w-6 h-6 text-green" />
                  </div>
                  <div>
                    <p className="text-nav font-semibold text-sm">Message Sent!</p>
                    <p className="text-text-muted text-xs mt-1">
                      We&rsquo;ll get back to you shortly{email ? ` at ${email}` : ''}.
                    </p>
                  </div>
                  <button onClick={handleReset}
                    className="text-xs text-text-muted hover:text-nav transition-colors px-4 py-1.5">
                    Send another
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
        style={{
          background: 'var(--color-text-primary)',
          boxShadow: '0 4px 20px rgba(26,26,26,0.35)',
        }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
