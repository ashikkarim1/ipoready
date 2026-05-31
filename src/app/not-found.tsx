import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFoundPage() {
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
              color: '#1A1A1A',
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
              color: '#1A1A1A',
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
              color: '#1A1A1A',
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
              color: '#717171',
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
          <Link
            href="/dashboard"
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
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Link>

          <Link
            href="/"
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
              gap: '7px',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
          >
            <Home size={15} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
