'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [tryAgainHovered, setTryAgainHovered] = useState(false)
  const [dashboardHovered, setDashboardHovered] = useState(false)
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
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
              color: 'var(--color-text-primary)',
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
            backgroundColor: 'var(--color-error-light)',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={26} style={{ color: 'var(--color-accent)' }} />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
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
              color: 'var(--color-text-secondary)',
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
              backgroundColor: 'var(--color-surface-secondary)',
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
                color: 'var(--color-text-tertiary)',
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
            onMouseEnter={() => setTryAgainHovered(true)}
            onMouseLeave={() => setTryAgainHovered(false)}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-text-primary)',
              color: 'var(--color-bg-primary)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              transition: 'all 0.15s ease',
              opacity: tryAgainHovered ? 0.85 : 1,
              transform: tryAgainHovered ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: tryAgainHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            onMouseEnter={() => setDashboardHovered(true)}
            onMouseLeave={() => setDashboardHovered(false)}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              border: `1.5px solid ${dashboardHovered ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              transform: dashboardHovered ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: dashboardHovered ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            Go to dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
