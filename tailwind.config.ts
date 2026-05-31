import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Mobile-first responsive breakpoints ──────────────────────────
      screens: {
        'xs': '320px',  // Extra small mobile
        'sm': '640px',  // Small mobile (landscape)
        'md': '768px',  // Tablet
        'lg': '1024px', // Desktop
        'xl': '1280px', // Large desktop
        '2xl': '1536px', // Extra large desktop
      },
      // ── Spacing for touch-friendly UI ────────────────────────────────
      minHeight: {
        'touch': '3rem', // 48px minimum touch target
      },
      minWidth: {
        'touch': '3rem', // 48px minimum touch target
      },
      spacing: {
        'touch': '3rem', // 48px for touch targets
      },
      // ── Typography scaling for readability ───────────────────────────
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
    },
  },
  plugins: [],
}

export default config
