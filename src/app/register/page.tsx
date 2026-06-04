'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket, ArrowRight, ArrowLeft, CheckCircle2, Building2,
  User, Mail, Lock, Globe, Users, Loader2, Eye, EyeOff
} from 'lucide-react'
import { EXCHANGE_LABELS, LISTING_TYPE_LABELS, ROLE_LABELS } from '@/lib/utils'
import { Exchange, ListingType, UserRole } from '@/types'

const STEPS = ['Market', 'Company', 'Your Role', 'Account', 'Review']

const CA_EXCHANGES: Exchange[] = ['tsx', 'tsxv', 'cse', 'cboe']
const US_EXCHANGES: Exchange[] = ['nasdaq', 'nyse', 'otc']
const CA_LISTING_TYPES: ListingType[] = ['ipo', 'rto', 'spac', 'direct_listing']
const US_LISTING_TYPES: ListingType[] = ['ipo', 'spac', 'direct_listing', 'regulation_a']

const inputCls = "w-full rounded-xl border text-nav text-sm outline-none transition-all"
const inputStyle = { background: '#FFFFFF', borderColor: '#E5E4E0', padding: '0.75rem 1rem' }
function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#1A1A1A'
  e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#E5E4E0'
  e.target.style.boxShadow = 'none'
}

function SelectBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="p-3 rounded-xl text-left text-xs font-medium transition-all border"
      style={active
        ? { background: '#F7F6F4', borderColor: '#1A1A1A', color: '#1A1A1A' }
        : { background: 'white', borderColor: '#E5E4E0', color: '#717171' }
      }>
      {children}
    </button>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    listingMarket: '' as '' | 'CA' | 'US',
    companyName: '',
    listingType: '' as ListingType,
    targetExchange: '' as Exchange,
    currency: 'CAD' as 'USD' | 'CAD',
    language: 'en' as 'en' | 'fr',
    name: '',
    role: '' as UserRole,
    email: '',
    password: '',
    confirmPassword: '',
    referralSource: '',
  })

  const availableExchanges = form.listingMarket === 'CA' ? CA_EXCHANGES : form.listingMarket === 'US' ? US_EXCHANGES : (Object.keys(EXCHANGE_LABELS) as Exchange[])
  const availableListingTypes = form.listingMarket === 'CA' ? CA_LISTING_TYPES : form.listingMarket === 'US' ? US_LISTING_TYPES : (Object.keys(LISTING_TYPE_LABELS) as ListingType[])

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  async function handleSubmit() {
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          companyName: form.companyName,
          listingType: form.listingType,
          targetExchange: form.targetExchange,
          currency: form.currency,
          language: form.language,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F7F6F4' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: '#EAF5F0', border: '2px solid rgba(45,122,95,0.2)', marginBottom: '1.5rem' }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: '#2D7A5F' }} />
          </motion.div>
          <h1 className="serif text-4xl text-nav" style={{ marginBottom: '0.75rem' }}>Account Created!</h1>
          <p className="text-text-muted text-lg leading-relaxed" style={{ marginBottom: '1rem' }}>
            Your profile is under review. Our team will verify your account within <strong className="text-nav">24 hours</strong>.
          </p>
          <p className="text-text-light text-sm" style={{ marginBottom: '2rem' }}>
            You'll receive an email at <strong className="text-text-muted">{form.email}</strong> when approved.
          </p>
          <Link href="/login"
            className="btn btn-primary inline-flex justify-center"
            style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', fontSize: '1rem' }}>
            <Rocket className="w-5 h-5" /> Go to Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F6F4' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[38%] flex-col justify-between p-12"
        style={{ background: '#1A1A1A' }}>
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            IPO<span style={{ color: '#E8312A' }}>Ready</span>
          </span>
        </Link>

        <div>
          <h2 className="serif text-3xl text-white leading-tight" style={{ marginBottom: '1rem' }}>
            Start your IPO<br />mission today.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
            Accounts are reviewed for credibility — only companies actively pursuing a listing receive access.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Free trial — no credit card',
              '24-hour profile review',
              'Full platform access on approval',
              'Cancel anytime after 3 months',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-accent" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} IPOReady. Technology platform only. Not a securities dealer.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto" style={{ background: '#F7F6F4', padding: '3rem 1.5rem' }}>
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="lg:hidden text-center" style={{ marginBottom: '1.5rem' }}>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-nav">
                IPO<span style={{ color: '#E8312A' }}>Ready</span>
              </span>
            </Link>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h1 className="serif text-3xl text-nav" style={{ marginBottom: '0.25rem' }}>Create Your Account</h1>
            <p className="text-text-muted text-sm">Profile reviewed within 24 hours</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="h-1 w-full rounded-full transition-all duration-300"
                  style={{ background: i <= step ? '#1A1A1A' : '#E5E4E0' }} />
                <span className="text-xs font-medium transition-colors"
                  style={{ color: i === step ? '#1A1A1A' : '#9A9A9A' }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <AnimatePresence mode="wait">

              {/* Step 0: Market */}
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h2 className="text-nav font-bold text-xl" style={{ marginBottom: '0.25rem' }}>Where are you planning to list?</h2>
                    <p className="text-text-muted text-sm">This tailors your exchanges, listing types, and workflow.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { market: 'CA', flag: '🇨🇦', country: 'Canada', exchanges: 'TSX · TSXV · CSE · Cboe Canada', types: 'IPO · RTO · SPAC · Direct Listing' },
                      { market: 'US', flag: '🇺🇸', country: 'United States', exchanges: 'NASDAQ · NYSE · OTC Markets', types: 'IPO · SPAC · Direct Listing · Reg A+' },
                    ] as const).map(({ market, flag, country, exchanges, types }) => (
                      <button key={market} type="button"
                        onClick={() => { update('listingMarket', market); update('currency', market === 'CA' ? 'CAD' : 'USD') }}
                        className="flex flex-col items-center gap-3 rounded-2xl border-2 transition-all text-left"
                        style={{ padding: '1.5rem',
                          ...(form.listingMarket === market
                            ? { background: '#F7F6F4', borderColor: '#1A1A1A' }
                            : { background: 'white', borderColor: '#E5E4E0' })
                        }}>
                        <span className="text-4xl">{flag}</span>
                        <div>
                          <p className="font-bold text-nav text-base" style={{ marginBottom: '0.25rem' }}>{country}</p>
                          <p className="text-text-light text-xs leading-relaxed">{exchanges}</p>
                          <p className="text-text-light text-xs" style={{ marginTop: '0.25rem' }}>{types}</p>
                        </div>
                        {form.listingMarket === market && (
                          <span className="text-xs font-bold rounded-full"
                            style={{ background: '#1A1A1A', color: 'white', padding: '0.125rem 0.625rem' }}>Selected</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-text-light text-xs text-center">
                    Cross-border or dual-listing? Select your primary market — you can add others later.
                  </p>
                </motion.div>
              )}

              {/* Step 1: Company */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 className="text-nav font-bold text-xl" style={{ marginBottom: '0.25rem' }}>About Your Company</h2>
                    <p className="text-text-muted text-sm">Tell us about the company going public</p>
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Company Name</label>
                    <input value={form.companyName} onChange={e => update('companyName', e.target.value)}
                      className={inputCls} style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                      placeholder="Acme Technologies Inc." />
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>How are you listing?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableListingTypes.map(key => (
                        <SelectBtn key={key} active={form.listingType === key} onClick={() => update('listingType', key)}>
                          <div className="font-semibold text-sm" style={{ marginBottom: '0.125rem' }}>{key.toUpperCase().replace('_', ' ')}</div>
                          <div className="opacity-70">{LISTING_TYPE_LABELS[key].split('(')[0].trim()}</div>
                        </SelectBtn>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Target Exchange</label>
                    <select value={form.targetExchange} onChange={e => update('targetExchange', e.target.value)}
                      className={inputCls} style={{ ...inputStyle, color: form.targetExchange ? '#1A1A1A' : '#9A9A9A' }}
                      onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="" disabled>Select your target exchange</option>
                      {availableExchanges.map(k => (
                        <option key={k} value={k}>{EXCHANGE_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Currency</label>
                      <div className="flex gap-2">
                        {(['CAD', 'USD'] as const).map(c => (
                          <button key={c} type="button" onClick={() => update('currency', c)}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                            style={form.currency === c
                              ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: 'white' }
                              : { background: 'white', borderColor: '#E5E4E0', color: '#717171' }}>{c}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Language</label>
                      <div className="flex gap-2">
                        {([['en', 'EN'], ['fr', 'FR']] as const).map(([k, l]) => (
                          <button key={k} type="button" onClick={() => update('language', k)}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                            style={form.language === k
                              ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: 'white' }
                              : { background: 'white', borderColor: '#E5E4E0', color: '#717171' }}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Role */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 className="text-nav font-bold text-xl" style={{ marginBottom: '0.25rem' }}>Your Role</h2>
                    <p className="text-text-muted text-sm">Select your role in the company's listing process</p>
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Full Name</label>
                    <input value={form.name} onChange={e => update('name', e.target.value)}
                      className={inputCls} style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                      placeholder="Alex Johnson" />
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Your Role in this Listing</label>
                    <div className="grid grid-cols-2 gap-2" style={{ maxHeight: '14rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {(Object.entries(ROLE_LABELS) as [UserRole, string][]).filter(([k]) => k !== 'system_admin').map(([key, label]) => (
                        <SelectBtn key={key} active={form.role === key} onClick={() => update('role', key)}>
                          {label}
                        </SelectBtn>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>How did you hear about us?</label>
                    <select value={form.referralSource} onChange={e => update('referralSource', e.target.value)}
                      className={inputCls} style={{ ...inputStyle, color: form.referralSource ? '#1A1A1A' : '#9A9A9A' }}
                      onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="" disabled>Select...</option>
                      {['Search Engine', 'LinkedIn', 'Referral from Advisor', 'Conference / Event', 'Securities Lawyer', 'auditus.ai', 'Other'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Account */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h2 className="text-nav font-bold text-xl" style={{ marginBottom: '0.25rem' }}>Create Account</h2>
                    <p className="text-text-muted text-sm">Secure your IPOReady account</p>
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Email Address</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      className={inputCls} style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                      placeholder="you@company.com" />
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={e => update('password', e.target.value)}
                        className={inputCls} style={{ ...inputStyle, paddingRight: '2.5rem' }}
                        onFocus={focusStyle} onBlur={blurStyle}
                        placeholder="Min. 8 characters" />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute text-text-light hover:text-text-muted transition-colors"
                        style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-nav text-sm font-medium block" style={{ marginBottom: '0.375rem' }}>Confirm Password</label>
                    <input type="password" value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      className={inputCls} style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle}
                      placeholder="Repeat password" />
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border"
                    style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.875rem' }}>
                    <input type="checkbox" id="terms" className="mt-0.5" required
                      style={{ accentColor: '#1A1A1A' }} />
                    <label htmlFor="terms" className="text-text-muted text-xs leading-relaxed">
                      I agree to the Terms of Service and Privacy Policy. I understand that account access is subject to profile review and approval.
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h2 className="text-nav font-bold text-xl" style={{ marginBottom: '0.25rem' }}>Review & Submit</h2>
                    <p className="text-text-muted text-sm">Confirm your details before we review your profile</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { label: 'Market', value: form.listingMarket === 'CA' ? '🇨🇦 Canada' : form.listingMarket === 'US' ? '🇺🇸 United States' : '—' },
                      { label: 'Company', value: form.companyName },
                      { label: 'Listing Type', value: LISTING_TYPE_LABELS[form.listingType]?.split('(')[0].trim() || '—' },
                      { label: 'Exchange', value: EXCHANGE_LABELS[form.targetExchange] || '—' },
                      { label: 'Name', value: form.name },
                      { label: 'Role', value: ROLE_LABELS[form.role] || '—' },
                      { label: 'Email', value: form.email },
                      { label: 'Currency / Language', value: `${form.currency} / ${form.language.toUpperCase()}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center rounded-xl border"
                        style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.75rem 1rem' }}>
                        <span className="text-text-muted text-sm">{label}</span>
                        <span className="text-nav text-sm font-medium">{value || '—'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Password Fields for Verification */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #E5E4E0' }}>
                    <label className="text-nav text-sm font-medium">Verify Your Password</label>
                    <div>
                      <label className="text-text-muted text-xs block" style={{ marginBottom: '0.375rem' }}>Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={form.password}
                          onChange={e => update('password', e.target.value)}
                          className={inputCls} style={{ ...inputStyle, paddingRight: '2.5rem' }}
                          onFocus={focusStyle} onBlur={blurStyle}
                          placeholder="Min. 8 characters" />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute text-text-light hover:text-text-muted transition-colors"
                          style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-text-muted text-xs block" style={{ marginBottom: '0.375rem' }}>Confirm Password</label>
                      <input type="password" value={form.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)}
                        className={inputCls} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle}
                        placeholder="Repeat password" />
                    </div>
                  </div>

                  <div className="rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.875rem' }}>
                    <p className="text-text-muted text-sm">
                      ✅ Your profile will be reviewed by our team within <strong className="text-nav">24 hours</strong>. You'll receive an email with access instructions.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="rounded-xl border text-sm" style={{ background: '#FDECEB', borderColor: '#F5C6C4', color: '#B91C1C', padding: '0.75rem 1rem', marginTop: '1rem' }}>
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3" style={{ marginTop: '1.75rem' }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border text-sm font-medium text-text-muted hover:text-nav transition-colors"
                  style={{ borderColor: '#E5E4E0', background: 'white', padding: '0.625rem 1rem' }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 0 && !form.listingMarket}
                  className="btn btn-primary flex-1 justify-center disabled:opacity-40">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="btn btn-primary flex-1 justify-center disabled:opacity-55">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <>Submit for Review <Rocket className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-text-muted text-sm" style={{ marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-nav hover:text-accent transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
