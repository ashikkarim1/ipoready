'use client'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export function DashboardFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="w-full border-t"
      style={{
        background: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
        padding: '32px 32px 24px',
      }}
    >
      {/* Container */}
      <div className="max-w-[1440px] mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* IPOReady Info */}
          <div>
            <h3 className="h4 mb-4" style={{ color: 'var(--color-text-primary)' }}>
              IPOReady
            </h3>
            <p className="caption mb-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              The world's first central hub for IPO readiness workflow management. Powered by AI predictions and autonomous actions.
            </p>
            <p className="caption-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              © {year} IPOReady Inc. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="label font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Roadmap', href: '/roadmap' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="caption hover:transition-colors"
                    style={{
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="label font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '/about' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
                { label: 'Careers', href: '/careers' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="caption hover:transition-colors"
                    style={{
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="label font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Legal & Support
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Security', href: '/security' },
                { label: 'Support', href: '/support' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="caption hover:transition-colors"
                    style={{
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '16px' }} />

        {/* Bottom section — socials + version */}
        <div
          className="flex flex-col md:flex-row items-center justify-between"
          style={{ gap: '16px' }}
        >
          <p className="caption-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Building the future of IPO management
          </p>

          {/* Social links */}
          <div className="flex items-center gap-6">
            {[
              { label: 'Twitter', href: 'https://twitter.com/ipoready' },
              { label: 'LinkedIn', href: 'https://linkedin.com/company/ipoready' },
              { label: 'GitHub', href: 'https://github.com/ipoready' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="caption-sm hover:transition-colors inline-flex items-center gap-2"
                style={{
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {link.label}
                <ExternalLink style={{ width: '10px', height: '10px' }} />
              </a>
            ))}
          </div>

          <p className="caption-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            v1.0.0 • Dashboard
          </p>
        </div>
      </div>
    </footer>
  )
}
