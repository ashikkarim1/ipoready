# Stripe Setup Guide — IPOReady

All Stripe code is complete and production-ready. No code changes are needed.
This guide covers the three steps required to go live: create products, register the webhook, and add the env vars to Vercel.

---

## Step 1 — Create Products & Prices in Stripe

Go to **Stripe Dashboard → Product catalog → Add product**.

Create **3 products**, each with **6 prices** (3 billing cycles × 2 currencies).

### Products & Prices

| Plan | Billing | USD / month | CAD / month |
|---|---|---|---|
| **Starter** | Monthly | $299 | $399 |
| **Starter** | 6-Month | $239 | $319 |
| **Starter** | Annual | $199 | $265 |
| **Growth** | Monthly | $599 | $799 |
| **Growth** | 6-Month | $479 | $639 |
| **Growth** | Annual | $399 | $529 |
| **Enterprise** | Monthly | $999 | $1,329 |
| **Enterprise** | 6-Month | $799 | $1,065 |
| **Enterprise** | Annual | $666 | $885 |

**Price setup for each row:**
- Pricing model: **Standard pricing**
- Billing period: **Recurring**
  - Monthly → Every **1 month**
  - 6-Month → Every **6 months**
  - Annual → Every **12 months**
- Currency: USD *or* CAD (create one price per currency per billing cycle)

> Each product will end up with 6 prices total (3 billing cycles × 2 currencies).
> Stripe multi-currency pricing handles conversion automatically at checkout.

After creating each price, copy its `price_xxx` ID — you'll need all 9 IDs (one per billing cycle per plan, using USD as the base; the CAD prices are handled via Stripe's currency setting at checkout).

---

## Step 2 — Register the Webhook Endpoint

Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**.

**Endpoint URL:**
```
https://ipoready.vercel.app/api/webhooks/stripe
```

**Select these events:**

| Event | What it does |
|---|---|
| `checkout.session.completed` | Activates plan after new subscription payment |
| `customer.subscription.updated` | Handles plan upgrades/downgrades |
| `customer.subscription.deleted` | Downgrades company to Starter on cancellation |
| `invoice.payment_succeeded` | Sends owner payment notification on every renewal |
| `invoice.payment_failed` | Sends owner alert on failed payment |

After saving, Stripe shows a **signing secret** starting with `whsec_`. Copy it.

---

## Step 3 — Add Environment Variables to Vercel

Go to **Vercel → IPOReady project → Settings → Environment Variables**.

Add all of the following, then **redeploy**.

### Stripe Keys

| Variable | Where to find it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key (`sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key (`pk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | The `whsec_…` secret from Step 2 |

### Price IDs (9 total)

| Variable | Which price |
|---|---|
| `STRIPE_PRICE_STARTER_MONTHLY` | Starter — Monthly (USD) |
| `STRIPE_PRICE_STARTER_SIXMONTH` | Starter — 6-Month (USD) |
| `STRIPE_PRICE_STARTER_ANNUAL` | Starter — Annual (USD) |
| `STRIPE_PRICE_GROWTH_MONTHLY` | Growth — Monthly (USD) |
| `STRIPE_PRICE_GROWTH_SIXMONTH` | Growth — 6-Month (USD) |
| `STRIPE_PRICE_GROWTH_ANNUAL` | Growth — Annual (USD) |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Enterprise — Monthly (USD) |
| `STRIPE_PRICE_ENTERPRISE_SIXMONTH` | Enterprise — 6-Month (USD) |
| `STRIPE_PRICE_ENTERPRISE_ANNUAL` | Enterprise — Annual (USD) |

> Use USD price IDs. Stripe handles CAD automatically at checkout based on the `currency` parameter passed by the app.

---

## How Payments Flow

```
User clicks Upgrade
      ↓
POST /api/checkout  →  Stripe Checkout Session created
      ↓
User enters card on Stripe-hosted page
      ↓
Stripe fires checkout.session.completed
      ↓
POST /api/webhooks/stripe
  → Updates companies.subscription_plan in DB
  → Emails customer (plan confirmation)
  → Emails ceo@theupcapital.com (payment notification)
      ↓
User redirected to /account?tab=billing&checkout=success
```

### Recurring Renewals
Every renewal fires `invoice.payment_succeeded` → owner receives email with amount, customer, and a direct Stripe invoice link.

### Failed Payments
`invoice.payment_failed` → owner receives 🚨 alert email. Stripe's built-in Smart Retries handles dunning automatically (retries over 4–8 days).

### Cancellations
`customer.subscription.deleted` → company downgraded to Starter in DB, customer emailed, owner notified.

---

## Testing Before Going Live

Use Stripe test mode keys (`sk_test_…` / `pk_test_…`) and test price IDs to verify the full flow before switching to live keys.

Test card: `4242 4242 4242 4242` — any future expiry, any CVC.

To test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
This gives you a local `whsec_` secret to use in `.env.local` during development.

---

## Enable Stripe Tax (Recommended)

Go to **Stripe Dashboard → Settings → Tax** and enable it before going live.

The checkout session is already configured with `automatic_tax: { enabled: true }` and `tax_id_collection: { enabled: true }`, so Canadian GST/HST/QST and US state sales tax will be calculated and collected automatically with no additional code changes.

---

## Owner Payment Notifications

All payment events send a notification email to **ceo@theupcapital.com**:

| Event | Subject line |
|---|---|
| New subscription | 🎉 IPOReady new subscription — Growth (Monthly) — Acme Corp |
| Renewal | 💳 IPOReady payment received — CAD $599.00 |
| Cancellation | ⚠️ IPOReady subscription cancelled — Acme Corp |
| Payment failed | 🚨 IPOReady payment FAILED — CAD $599.00 — user@example.com |

Each email includes the customer name, company, amount, and a direct link to the Stripe dashboard record.
