# IPOReady June 15 Launch - TODAY'S FINAL ACTION ITEMS
## June 7, 2026 - 3 MONTHS AT 50% OFF, THEN FULL PRICE

**PRICING IS LOCKED:**
- 🇨🇦 **Canada: $249.50/month (3 months) → $499/month**
- 🇺🇸 **USA: $499.50/month (3 months) → $999/month**
- **Auto-renewal at full price on month 4**
- **NO trial** - straight to discounted pricing

---

## 🚨 TODAY'S CRITICAL TASKS (4.5 hours)

### 1️⃣ **STRIPE ACCOUNT SETUP** (1.5 hours)
**Owner:** Finance/Dev Lead
**Status:** ⏳ TO DO

**Exact Steps:**
```
1. Go to https://dashboard.stripe.com
2. Sign in (or create account)
3. Create TWO products

PRODUCT 1: Professional (Canada)
├─ Name: "Professional (Canada)"
├─ Description: "Pre-IPO Platform Bundle"
│
├─ Price 1 (Launch Offer - 3 Months):
│  ├─ Amount: $249.50 USD
│  ├─ Billing period: Monthly (recurring)
│  └─ Name: "Professional Canada - 3 Month Launch"
│
└─ Price 2 (Full Price - Month 4+):
   ├─ Amount: $499 USD
   ├─ Billing period: Monthly (recurring)
   └─ Name: "Professional Canada - Full Price"

PRODUCT 2: Professional (USA)
├─ Name: "Professional (USA)"
├─ Description: "Pre-IPO Platform Bundle"
│
├─ Price 1 (Launch Offer - 3 Months):
│  ├─ Amount: $499.50 USD
│  ├─ Billing period: Monthly (recurring)
│  └─ Name: "Professional USA - 3 Month Launch"
│
└─ Price 2 (Full Price - Month 4+):
   ├─ Amount: $999 USD
   ├─ Billing period: Monthly (recurring)
   └─ Name: "Professional USA - Full Price"

4. Go to Settings → API Keys
   ├─ Copy: Publishable Key → STRIPE_PUBLIC_KEY
   ├─ Copy: Secret Key → STRIPE_SECRET_KEY
   └─ Go to Webhooks → Add endpoint
      ├─ URL: https://ipoready.vercel.app/api/billing/webhooks
      └─ Copy webhook signing secret → STRIPE_WEBHOOK_SECRET

5. Add 3 variables to Vercel:
   ├─ Project Settings → Environment Variables
   ├─ STRIPE_PUBLIC_KEY = pk_live_xxxxx
   ├─ STRIPE_SECRET_KEY = sk_live_xxxxx (⚠️ KEEP SECRET!)
   └─ STRIPE_WEBHOOK_SECRET = whsec_xxxxx
```

**Deliverable:** Screenshot of 2 Stripe products, 4 total prices + API keys in Vercel

---

### 2️⃣ **DATABASE SCHEMA UPDATES** (1 hour)
**Owner:** Backend Developer
**Status:** ⏳ TO DO

**Create migration file:** `/src/db/migrations/007_billing_system.sql`

```sql
-- Add columns to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS (
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_payment_method_id VARCHAR(255),
  region ENUM('Canada', 'USA'),
  subscription_status ENUM('active', 'cancelled', 'expired'),
  subscription_price DECIMAL(10,2),  -- 249.50, 499.50, 499, or 999
  discount_expires_at TIMESTAMP,      -- 3 months from signup
  months_remaining_at_discount INT,   -- 3, 2, 1, 0
  next_billing_date TIMESTAMP,
  billing_email VARCHAR(255)
);

-- Add indices
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_region ON subscriptions(region);
CREATE INDEX idx_subscriptions_discount_expires ON subscriptions(discount_expires_at);
```

**Test it:**
```bash
# Run migration
npm run db:migrate

# Verify columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('region', 'discount_expires_at', 'months_remaining_at_discount');
```

**Deliverable:** Migration runs cleanly, schema updated

---

### 3️⃣ **CREATE STUB API ROUTES** (1 hour)
**Owner:** Backend Developer
**Status:** ⏳ TO DO

**Create 5 empty route files:**
```
/src/app/api/billing/start-subscription/route.ts
/src/app/api/billing/webhooks/route.ts
/src/app/api/billing/update-payment-method/route.ts
/src/app/api/billing/current-subscription/route.ts
/src/app/api/billing/cancel-subscription/route.ts
```

**Template for each:**
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // TODO: implement (will be filled June 8-9)
    return NextResponse.json({ 
      status: 'not_implemented',
      message: 'Endpoint coming June 8'
    }, { status: 501 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: implement
    return NextResponse.json({ 
      status: 'not_implemented',
      message: 'Endpoint coming June 8'
    }, { status: 501 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Deliverable:** All 5 routes created, accessible at `/api/billing/*`

---

### 4️⃣ **REGION DETECTION & PRICING LOGIC** (30 minutes)
**Owner:** Frontend Developer
**Status:** ⏳ TO DO

**Create:** `/src/lib/subscription-pricing.ts`

```typescript
/**
 * Subscription pricing and region logic
 */

export type Region = 'Canada' | 'USA'

export interface SubscriptionPricing {
  region: Region
  discountedMonthlyPrice: number  // 249.50 or 499.50
  fullMonthlyPrice: number        // 499 or 999
  discountPercentage: 50
  discountDurationMonths: 3
}

export function getPricingForRegion(region: Region): SubscriptionPricing {
  if (region === 'Canada') {
    return {
      region: 'Canada',
      discountedMonthlyPrice: 249.50,
      fullMonthlyPrice: 499,
      discountPercentage: 50,
      discountDurationMonths: 3
    }
  }
  
  // Default to USA
  return {
    region: 'USA',
    discountedMonthlyPrice: 499.50,
    fullMonthlyPrice: 999,
    discountPercentage: 50,
    discountDurationMonths: 3
  }
}

/**
 * Determine region from signup data
 */
export function detectRegionFromSignup(
  address?: string,
  companyCountry?: string
): Region {
  if (!address && !companyCountry) return 'USA' // default
  
  const text = `${address || ''} ${companyCountry || ''}`.toUpperCase()
  
  if (text.includes('CANADA') || text.includes('CA') || text.includes('.CA')) {
    return 'Canada'
  }
  
  return 'USA'
}

/**
 * Calculate discount expiration date (3 months from now)
 */
export function calculateDiscountExpirationDate(): Date {
  const expirationDate = new Date()
  expirationDate.setMonth(expirationDate.getMonth() + 3)
  return expirationDate
}

/**
 * Check how many months of discount remaining
 */
export function getMonthsRemainingAtDiscount(expiresAt: Date): number {
  const now = new Date()
  const monthsDiff = 
    (expiresAt.getFullYear() - now.getFullYear()) * 12 +
    (expiresAt.getMonth() - now.getMonth())
  
  return Math.max(0, Math.ceil(monthsDiff))
}

/**
 * Get Stripe price ID based on region and discount status
 */
export function getStripePriceId(
  region: Region,
  isDiscountActive: boolean
): string {
  // These will come from your Stripe dashboard
  // You'll populate these after creating the products
  const stripePriceIds: Record<Region, Record<'discount' | 'full', string>> = {
    Canada: {
      discount: 'price_canada_discount_xxx',    // $249.50
      full: 'price_canada_full_xxx'             // $499
    },
    USA: {
      discount: 'price_usa_discount_xxx',       // $499.50
      full: 'price_usa_full_xxx'                // $999
    }
  }
  
  return stripePriceIds[region][isDiscountActive ? 'discount' : 'full']
}
```

**Test it:**
```typescript
// Test Canada pricing
const canadaPrice = getPricingForRegion('Canada')
console.log(canadaPrice.discountedMonthlyPrice) // Should be 249.50

// Test USA pricing
const usaPrice = getPricingForRegion('USA')
console.log(usaPrice.discountedMonthlyPrice) // Should be 499.50

// Test region detection
console.log(detectRegionFromSignup('Toronto, ON', 'Canada')) // Should be 'Canada'
console.log(detectRegionFromSignup('New York, NY', 'USA')) // Should be 'USA'
```

**Deliverable:** Functions work correctly, returns right prices and dates

---

### 5️⃣ **PRICING DISPLAY COMPONENT** (1 hour)
**Owner:** Frontend Developer
**Status:** ⏳ TO DO

**Create:** `/src/components/SubscriptionPricingCard.tsx`

```typescript
'use client'

import { getPricingForRegion, type Region } from '@/lib/subscription-pricing'

interface SubscriptionPricingCardProps {
  region: Region
}

export function SubscriptionPricingCard({ region }: SubscriptionPricingCardProps) {
  const pricing = getPricingForRegion(region)
  
  return (
    <div style={{ 
      padding: '2rem', 
      border: '2px solid #E8312A', 
      borderRadius: '0.75rem',
      background: '#FFF5F5',
      maxWidth: '450px'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', margin: '0 0 1rem 0' }}>
        Professional Plan
      </h3>
      
      {/* 50% OFF BANNER */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        background: '#E8F5E9', 
        borderRadius: '0.5rem',
        border: '2px solid #2D7A5F'
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2D7A5F', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
          🚀 Launch Special (3 Months Only)
        </p>
        <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0' }}>
          ${pricing.discountedMonthlyPrice.toFixed(2)}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#717171' }}>/month</span>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#717171', margin: 0 }}>
          For 3 months. Then ${pricing.fullMonthlyPrice}/month.
        </p>
      </div>
      
      {/* FEATURES */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0' }}>
        <li style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#1A1A1A' }}>✅ Market Advantage Intelligence</li>
        <li style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#1A1A1A' }}>✅ Investor Match CRM</li>
        <li style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#1A1A1A' }}>✅ PACE™ Benchmarking</li>
        <li style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#1A1A1A' }}>✅ Compliance Checklists</li>
        <li style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#717171' }}>❌ Listed Services (coming later)</li>
      </ul>
      
      {/* CTA BUTTON */}
      <button style={{
        width: '100%',
        padding: '0.75rem 1rem',
        background: '#E8312A',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '0.375rem',
        fontSize: '1rem',
        fontWeight: 700,
        cursor: 'pointer',
        marginBottom: '0.5rem'
      }}>
        Get Professional - 50% Off (3 Months)
      </button>
      
      {/* FOOTER */}
      <p style={{ fontSize: '0.75rem', color: '#717171', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
        Offer available through September 15. 
        Then ${pricing.fullMonthlyPrice}/month (cancel anytime).
      </p>
    </div>
  )
}
```

**Deliverable:** Component renders correctly with region-specific pricing

---

## 📋 **TODAY'S SUMMARY**

| Task | Owner | Time | Status |
|------|-------|------|--------|
| Stripe setup (2 products, 4 prices) | Finance/Dev | 1.5h | ⏳ TODO |
| Database migrations | Backend | 1h | ⏳ TODO |
| Create 5 stub API routes | Backend | 1h | ⏳ TODO |
| Pricing logic function | Frontend | 30m | ⏳ TODO |
| Pricing display component | Frontend | 1h | ⏳ TODO |
| **TOTAL** | **Team** | **4.5h** | **CRITICAL PATH** |

---

## ✅ **COMPLETION CHECKLIST**

- [ ] Stripe: 2 products created (Canada + USA)
- [ ] Stripe: 4 prices created (discount + full for each region)
- [ ] Stripe: API keys added to Vercel env vars
- [ ] Database: Migration created and runs cleanly
- [ ] API routes: All 5 stubs created
- [ ] Pricing logic: Function tests correctly for both regions
- [ ] Pricing component: Renders with correct prices
- [ ] Commit: "Pricing locked: $249.50/$499.50 (50% off 3mo) → $499/$999 (full price)"

---

## 🎯 **WHAT'S NEXT (JUNE 8-9)**

Backend sprint:
- [ ] Build `/api/billing/start-subscription` 
  - Accepts payment token from Stripe Elements
  - Charges at DISCOUNTED price
  - Sets discount_expires_at = NOW + 3 months
  - Sets months_remaining_at_discount = 3

- [ ] Build subscription upgrade logic
  - When discount_expires_at is reached (day 91)
  - Automatically change subscription to FULL price
  - Send email: "Welcome to full price!"

- [ ] Build `/api/billing/webhooks`
  - Listen for Stripe payment events
  - Update database accordingly

Frontend sprint:
- [ ] Build payment modal (Stripe Elements)
- [ ] Build region selector at signup
- [ ] Build tier gating (lock/unlock features)
- [ ] Build billing dashboard

Emails:
- [ ] Create all 6 email templates (ready to send)

---

## 💰 **FINAL PRICING SUMMARY**

```
STARTER (FREE)
├─ Cap table
├─ Checklists
└─ Document library

PROFESSIONAL (LAUNCH - 50% OFF FOR 3 MONTHS)
├─ 🇨🇦 $249.50 USD/month (normally $499)
├─ 🇺🇸 $499.50 USD/month (normally $999)
└─ Then auto-renew at full price month 4

PROFESSIONAL (FULL PRICE - MONTH 4+)
├─ 🇨🇦 $499 USD/month
├─ 🇺🇸 $999 USD/month
└─ Includes: Market Advantage + Investor Match + PACE + Checklists

ENTERPRISE (COMING LATER)
└─ Custom pricing
```

---

## ⚠️ **CRITICAL REMINDERS**

1. **Two Stripe products** (Canada + USA) - not one
2. **Four total prices** (discount + full for each region)
3. **All USD** - even Canada customers pay in USD
4. **Use test keys June 8-12**, live keys only June 14
5. **Month 4 = automatic price jump** - no manual intervention
6. **No trial** - straight to discount then full price

---

**STATUS: READY TO LAUNCH** 🚀

Next: Hand off `.claude/TODAY_ACTIONS_FINAL.md` to team, target 5pm completion
