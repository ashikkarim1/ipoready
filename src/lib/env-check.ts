/**
 * Environment variable validation
 *
 * Called once at server startup (imported in instrumentation.ts or next.config.js).
 * Logs clear warnings for missing/placeholder values so issues surface at boot,
 * not mid-session when a user triggers a feature.
 *
 * Does NOT throw — the app still starts, but degraded features are logged.
 * This lets the team run the app locally without every service configured.
 */

interface EnvCheck {
  key: string
  /** Optional: treat as missing if the value equals this placeholder */
  placeholder?: string
  /** Human-readable feature that breaks without this key */
  feature: string
  /** If true, log as ERROR (hard failure) rather than WARN (degraded) */
  required?: boolean
}

const CHECKS: EnvCheck[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  {
    key: 'NEXTAUTH_SECRET',
    placeholder: 'replace-with-a-random-secret',
    feature: 'Authentication (all logins)',
    required: true,
  },
  {
    key: 'NEXTAUTH_URL',
    placeholder: 'http://localhost:3000',
    feature: 'Auth callbacks & email links',
  },

  // ── Database ──────────────────────────────────────────────────────────────
  {
    key: 'DATABASE_URL',
    placeholder: 'postgres://...',
    feature: 'All database operations',
    required: true,
  },

  // ── Email ─────────────────────────────────────────────────────────────────
  {
    key: 'RESEND_API_KEY',
    placeholder: 're_your_api_key_here',
    feature: 'Welcome email, password reset, board reports',
  },

  // ── OAuth ─────────────────────────────────────────────────────────────────
  {
    key: 'GOOGLE_CLIENT_ID',
    placeholder: 'your-google-client-id.apps.googleusercontent.com',
    feature: 'Google sign-in',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    placeholder: 'your-google-client-secret',
    feature: 'Google sign-in',
  },
  {
    key: 'LINKEDIN_CLIENT_ID',
    placeholder: 'your-linkedin-client-id',
    feature: 'LinkedIn sign-in',
  },
  {
    key: 'LINKEDIN_CLIENT_SECRET',
    placeholder: 'your-linkedin-client-secret',
    feature: 'LinkedIn sign-in',
  },

  // ── Stripe ────────────────────────────────────────────────────────────────
  {
    key: 'STRIPE_SECRET_KEY',
    placeholder: 'sk_test_your_secret_key_here',
    feature: 'Payments & subscriptions',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    placeholder: 'whsec_your_webhook_secret_here',
    feature: 'Stripe webhook processing',
  },
  {
    key: 'STRIPE_PRICE_GROWTH_MONTHLY',
    placeholder: 'price_growth_monthly_id_here',
    feature: 'Growth plan checkout',
  },

  // ── AI ────────────────────────────────────────────────────────────────────
  {
    key: 'ANTHROPIC_API_KEY',
    placeholder: 'sk-ant-your-key-here',
    feature: 'AI companion, board report narrative, daily pulse',
  },

  // ── WhatsApp / Twilio ─────────────────────────────────────────────────────
  {
    key: 'TWILIO_ACCOUNT_SID',
    placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    feature: 'WhatsApp AI companion',
  },
  {
    key: 'TWILIO_AUTH_TOKEN',
    placeholder: 'your-twilio-auth-token',
    feature: 'WhatsApp AI companion & webhook security',
  },

  // ── Push notifications ────────────────────────────────────────────────────
  {
    key: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    placeholder: 'your-vapid-public-key',
    feature: 'Browser push notifications',
  },
  {
    key: 'VAPID_PRIVATE_KEY',
    placeholder: 'your-vapid-private-key',
    feature: 'Browser push notifications',
  },

  // ── Cron ─────────────────────────────────────────────────────────────────
  {
    key: 'CRON_SECRET',
    placeholder: 'replace-with-random-secret',
    feature: 'Cron job security (WhatsApp daily pulse, admin summary)',
  },
]

export function checkEnv(): void {
  // Only run on the server
  if (typeof window !== 'undefined') return

  let errors = 0
  let warnings = 0

  for (const check of CHECKS) {
    const value = process.env[check.key]
    const isMissing = !value
    const isPlaceholder = check.placeholder && value === check.placeholder

    if (isMissing || isPlaceholder) {
      const level = check.required ? 'ERROR' : 'WARN'
      const reason = isMissing ? 'not set' : 'still has placeholder value'
      const label = `[env-check] ${level}: ${check.key} is ${reason} — ${check.feature} will not work`

      if (check.required) {
        console.error(label)
        errors++
      } else {
        console.warn(label)
        warnings++
      }
    }
  }

  if (errors > 0 || warnings > 0) {
    console.warn(
      `[env-check] ${errors} error(s), ${warnings} warning(s) — see DOCS.md or docs/STRIPE_SETUP.md for setup instructions`,
    )
  } else {
    console.log('[env-check] ✓ All environment variables configured')
  }
}
