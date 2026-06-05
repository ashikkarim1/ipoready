'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Rocket, HelpCircle } from 'lucide-react'
import { FeaturesMegaMenu } from './FeaturesMegaMenu'

/**
 * Header component for public pages (pricing, resources, etc.)
 * Includes sticky positioning, proper z-index, and logo
 * Only shown when user is NOT authenticated
 */
export function Header() {
  const { data: session } = useSession()
  
  // Don't show header on dashboard pages when authenticated
  if (session) return null

  return (
    <header
      className="sticky top-0 w-full z-50 border-b border-gray-200 bg-white"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid #E5E4E0',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'block',
        visibility: 'visible',
      }}
    >
      <div
        className="flex items-center justify-between max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-0"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '80rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          flexWrap: 'nowrap',
          gap: '0.5rem',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: '#1A1A1A' }}>
            IPO<span style={{ color: '#E8312A' }}>Ready</span>
          </span>
        </Link>

        {/* Navigation Menu */}
        <FeaturesMegaMenu isSticky={true} />

        {/* Help Icon */}
        <div
          className="ml-auto md:ml-2"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Link
            href="/resources"
            title="Help & Documentation"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <HelpCircle className="w-5 h-5" style={{ color: '#717171' }} />
          </Link>
        </div>
      </div>
    </header>
  )
}
