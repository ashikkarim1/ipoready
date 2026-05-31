'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Mail, ArrowLeft, Loader2, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

// ─── Request reset (no token) ──────────────────────────────────────────────────

function RequestResetForm() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center" style={{ padding: '1rem 0' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: '#EAF5F0', border: '1px solid rgba(45,122,95,0.2)', marginBottom: '1.25rem' }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: '#2D7A5F' }} />
        </div>
        <h2 className="serif text-2xl text-nav" style={{ marginBottom: '0.5rem' }}>Check your inbox</h2>
        <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '0.5rem' }}>
          We sent a reset link to <strong className="text-nav">{email}</strong>
        </p>
        <p className="text-xs" style={{ color: '#9A9A9A', marginBottom: '1.5rem' }}>
          Expires in 60 minutes · Check your spam folder if it doesn&apos;t arrive
        </p>
        <Link href="/login"
          className="btn btn-primary inline-flex justify-center"
          style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          Back to Sign In
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="serif text-3xl text-nav" style={{ marginBottom: '0.375rem' }}>Reset password</h1>
        <p className="text-text-muted text-sm">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl" style={{ background: '#FDECEB', border: '1px solid rgba(232,49,42,0.2)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8312A' }} />
          <p className="text-sm" style={{ color: '#C4261F' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="text-sm font-medium text-nav block" style={{ marginBottom: '0.375rem' }}>Email Address</label>
          <div className="relative">
            <Mail className="absolute text-text-light" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem' }} />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
              style={{ background: '#FFFFFF', borderColor: '#E5E4E0', padding: '0.75rem 1rem 0.75rem 2.5rem' }}
              onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
              onBlur={e =>  { e.target.style.borderColor = '#E5E4E0';  e.target.style.boxShadow = 'none' }}
              placeholder="you@company.com" required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center"
          style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
        </button>
      </form>

      <div className="text-center" style={{ borderTop: '1px solid #E5E4E0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
        <Link href="/login" className="text-text-muted hover:text-nav text-sm transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>
    </>
  )
}

// ─── Set new password (has token) ─────────────────────────────────────────────

function SetNewPasswordForm({ token }: { token: string }) {
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [validating, setValidating]   = useState(true)
  const [tokenValid, setTokenValid]   = useState(false)
  const [tokenError, setTokenError]   = useState('')
  const [error, setError]             = useState('')
  const [done, setDone]               = useState(false)

  // Validate token on mount
  useEffect(() => {
    fetch(`/api/auth/reset-password-confirm?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) setTokenValid(true)
        else setTokenError(data.error ?? 'Invalid or expired link.')
      })
      .catch(() => setTokenError('Could not validate the link. Please try again.'))
      .finally(() => setValidating(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Something went wrong.')
      else setDone(true)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: '2rem 0', gap: '1rem' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#9A9A9A' }} />
        <p className="text-text-muted text-sm">Validating your link…</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center" style={{ padding: '1rem 0' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: '#FDECEB', border: '1px solid rgba(232,49,42,0.2)', marginBottom: '1.25rem' }}>
          <AlertCircle className="w-7 h-7" style={{ color: '#E8312A' }} />
        </div>
        <h2 className="serif text-2xl text-nav" style={{ marginBottom: '0.5rem' }}>Link invalid</h2>
        <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.5rem' }}>{tokenError}</p>
        <Link href="/reset-password"
          className="btn btn-primary inline-flex justify-center"
          style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          Request new link
        </Link>
      </motion.div>
    )
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center" style={{ padding: '1rem 0' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: '#EAF5F0', border: '1px solid rgba(45,122,95,0.2)', marginBottom: '1.25rem' }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: '#2D7A5F' }} />
        </div>
        <h2 className="serif text-2xl text-nav" style={{ marginBottom: '0.5rem' }}>Password updated</h2>
        <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.5rem' }}>
          Your password has been changed. Sign in with your new credentials.
        </p>
        <Link href="/login"
          className="btn btn-primary inline-flex justify-center"
          style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          Sign in now
        </Link>
      </motion.div>
    )
  }

  return tokenValid ? (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="serif text-3xl text-nav" style={{ marginBottom: '0.375rem' }}>Choose new password</h1>
        <p className="text-text-muted text-sm">Must be at least 8 characters</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl" style={{ background: '#FDECEB', border: '1px solid rgba(232,49,42,0.2)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8312A' }} />
          <p className="text-sm" style={{ color: '#C4261F' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="text-sm font-medium text-nav block" style={{ marginBottom: '0.375rem' }}>New Password</label>
          <div className="relative">
            <Lock className="absolute text-text-light" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem' }} />
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
              style={{ background: '#FFFFFF', borderColor: '#E5E4E0', padding: '0.75rem 2.5rem 0.75rem 2.5rem' }}
              onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
              onBlur={e =>  { e.target.style.borderColor = '#E5E4E0';  e.target.style.boxShadow = 'none' }}
              placeholder="Minimum 8 characters" required minLength={8}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute text-text-light" style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-nav block" style={{ marginBottom: '0.375rem' }}>Confirm Password</label>
          <div className="relative">
            <Lock className="absolute text-text-light" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem' }} />
            <input
              type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full rounded-xl border text-nav text-sm outline-none transition-all"
              style={{ background: '#FFFFFF', borderColor: confirm && confirm !== password ? '#E8312A' : '#E5E4E0', padding: '0.75rem 1rem 0.75rem 2.5rem' }}
              onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
              onBlur={e =>  { e.target.style.borderColor = confirm && confirm !== password ? '#E8312A' : '#E5E4E0'; e.target.style.boxShadow = 'none' }}
              placeholder="Repeat your password" required
            />
          </div>
          {confirm && confirm !== password && (
            <p className="text-xs" style={{ color: '#E8312A', marginTop: '4px' }}>Passwords don&apos;t match</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center"
          style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Set New Password'}
        </button>
      </form>
    </>
  ) : null
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function ResetPasswordInner() {
  const params = useSearchParams()
  const token  = params.get('token')

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F7F6F4' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A' }}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-nav">
              IPO<span style={{ color: '#E8312A' }}>Ready</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <AnimatePresence mode="wait">
            {token
              ? <SetNewPasswordForm key="set" token={token} />
              : <RequestResetForm   key="req" />
            }
          </AnimatePresence>
        </div>

        <p className="text-center text-xs" style={{ color: '#B8B7B3', marginTop: '1.5rem' }}>
          IPOReady does not provide legal, securities, or financial advice.
        </p>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  )
}
