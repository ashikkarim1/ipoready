'use client'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Rocket, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="3" fill="#0A66C2"/>
      <path d="M5.5 7.5H3.5V14H5.5V7.5zM4.5 6.5C5.05 6.5 5.5 6.05 5.5 5.5S5.05 4.5 4.5 4.5 3.5 4.95 3.5 5.5 3.95 6.5 4.5 6.5zM14.5 14H12.5V11c0-.83-.67-1.5-1.5-1.5S9.5 10.17 9.5 11V14H7.5V7.5h2V8.5c.5-.83 1.5-1 2-1 1.67 0 3 1.33 3 3V14z" fill="white"/>
    </svg>
  )
}

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect after OAuth sign-in completes (session appears)
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const isNew = (session.user as any).isNewUser
      router.replace(isNew ? '/wizard' : '/dashboard')
    }
  }, [status, session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // First check if user exists
    try {
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })
      
      const { exists } = await checkResponse.json()
      
      if (!exists) {
        setLoading(false)
        setError('User does not exist. Please create an account.')
        return
      }
    } catch (err) {
      // If check fails, continue with normal login
      console.error('User check failed:', err)
    }
    
    // Try to sign in
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Invalid password')
    } else {
      window.location.assign('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F6F4' }} suppressHydrationWarning>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12"
        style={{ background: '#1A1A1A' }}>
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Rocket className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            IPO<span style={{ color: '#E8312A' }}>Ready</span>
          </span>
        </Link>

        <div>
          <h2 className="serif text-3xl text-white leading-tight mb-4">
            Your IPO journey<br />starts here.
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            The world&rsquo;s first central platform for managing every step from private issuer to listed company.
          </p>
          <div className="space-y-3">
            {[
              '180+ IPO milestones, pre-built',
              'Real-time PACE™ velocity tracking',
              'Expert network, verified',
              'TSX, TSXV, CSE, NASDAQ, NYSE & more',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-accent" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2025 IPOReady. Technology platform only. Not a securities dealer.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: '#FFFFFF' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="w-full max-w-md">

          {/* Back to home link */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-deep transition-colors">
              <span>←</span> Back to home
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-nav">
                IPO<span style={{ color: '#E8312A' }}>Ready</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="serif text-3xl text-nav mb-2">Welcome back</h1>
            <p className="text-text-muted">Sign in to your mission control</p>
          </div>

          {/* Social sign-in */}
          <div className="space-y-2.5 mb-6">
            <button type="button" onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'white', border: '1px solid #E5E4E0', color: '#1A1A1A' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <GoogleIcon /> Continue with Google
            </button>
            <button type="button" onClick={() => signIn('linkedin')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'white', border: '1px solid #E5E4E0', color: '#1A1A1A' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <LinkedInIcon /> Continue with LinkedIn
            </button>
          </div>

          <div className="relative mb-6">
            <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #E5E4E0' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span className="text-xs px-3" style={{ background: 'white', color: '#9A9A9A' }}>or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-nav mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all text-nav placeholder-text-muted"
                style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
                onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                placeholder="you@company.com" required autoComplete="email" />
            </div>

            <div>
              <label className="text-sm font-medium text-nav mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none transition-all text-nav placeholder-text-muted"
                  style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
                  onFocus={e => { e.target.style.borderColor = '#1A1A1A'; e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E4E0'; e.target.style.boxShadow = 'none' }}
                  placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-muted transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link href="/reset-password" className="text-xs text-accent hover:text-accent-deep transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl"
                style={{ background: '#FDECEB', border: '1px solid #E8312A30' }}>
                <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                <p className="text-error text-sm">{error}</p>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-base mt-2 rounded-xl">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #E5E4E0' }}>
            <p className="text-text-muted text-sm">
              New to IPOReady?{' '}
              <Link href="/register" className="font-semibold text-nav hover:text-accent transition-colors">
                Create your account
              </Link>
            </p>
          </div>

          <p className="text-center text-text-light text-xs mt-4">
            Access is reviewed and approved within 24 hours for new accounts.
          </p>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #E5E4E0' }}>
            <p className="text-text-muted text-sm mb-3">
              Not ready yet? Join our waitlist
            </p>
            <Link href="/#waitlist" className="inline-block px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#1A1A1A' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#E5E4E0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F7F6F4')}>
              Sign up for early access
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
