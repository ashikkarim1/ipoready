'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F6F4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'inherit',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Wordmark */}
        <div style={{ width: '100%', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#1A1A1A',
              letterSpacing: '-0.5px',
            }}
          >
            IPOReady
          </span>
        </div>

        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={26} style={{ color: '#E8312A' }} />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#1A1A1A',
              letterSpacing: '-0.7px',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 400,
              color: '#717171',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>

        {/* Error message */}
        {error?.message && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#F0EFED',
              border: '1px solid #E5E4E0',
              borderRadius: '10px',
              padding: '12px 16px',
            }}
          >
            <p
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '12px',
                fontWeight: 400,
                color: '#9A9A9A',
                margin: 0,
                wordBreak: 'break-word',
                lineHeight: 1.6,
              }}
            >
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
          }}
        >
          <button
            onClick={reset}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#1A1A1A',
              color: '#F7F6F4',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              color: '#1A1A1A',
              border: '1.5px solid #E5E4E0',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
          >
            Go to dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
