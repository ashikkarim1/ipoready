import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
  }
  return _stripe
}

// ─── Price ID map ──────────────────────────────────────────────────────────────
// Each price supports both USD and CAD via Stripe multi-currency pricing.
// Set these in your Stripe dashboard → Products, then add the IDs to .env
export const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly:  process.env.STRIPE_PRICE_STARTER_MONTHLY  ?? '',
    sixmonth: process.env.STRIPE_PRICE_STARTER_SIXMONTH ?? '',
    annual:   process.env.STRIPE_PRICE_STARTER_ANNUAL   ?? '',
  },
  growth: {
    monthly:  process.env.STRIPE_PRICE_GROWTH_MONTHLY  ?? '',
    sixmonth: process.env.STRIPE_PRICE_GROWTH_SIXMONTH ?? '',
    annual:   process.env.STRIPE_PRICE_GROWTH_ANNUAL   ?? '',
  },
  enterprise: {
    monthly:  process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY  ?? '',
    sixmonth: process.env.STRIPE_PRICE_ENTERPRISE_SIXMONTH ?? '',
    annual:   process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL   ?? '',
  },
}

// Billing interval config — used when creating subscriptions
export const BILLING_INTERVAL: Record<string, { interval: 'month', interval_count: number }> = {
  monthly:  { interval: 'month', interval_count: 1 },
  sixmonth: { interval: 'month', interval_count: 6 },
  annual:   { interval: 'month', interval_count: 12 },
}

export const PLAN_NAMES: Record<string, string> = {
  starter:    'Starter',
  growth:     'Growth',
  enterprise: 'Enterprise',
}
