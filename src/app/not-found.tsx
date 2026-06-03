'use client'

import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function NotFoundPage() {
  const [dashboardHovered, setDashboardHovered] = useState(false)
  const [homeHovered, setHomeHovered] = useState(false)
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
      <div
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

        {/* Giant 404 */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '128px',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-6px',
            }}
          >
            404
          </p>
        </div>

        {/* Heading + subtext */}
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
            Page not found
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
            This page doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
          }}
        >
          <div
            onMouseEnter={() => setDashboardHovered(true)}
            onMouseLeave={() => setDashboardHovered(false)}
          >
            <Link
              href="/dashboard"
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
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                transition: 'opacity 0.15s ease',
                opacity: dashboardHovered ? 0.85 : 1,
              }}
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>
          </div>

          <div
            onMouseEnter={() => setHomeHovered(true)}
            onMouseLeave={() => setHomeHovered(false)}
          >
            <Link
              href="/"
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
                border: `1.5px solid ${homeHovered ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <Home size={15} />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
