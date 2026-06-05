# Adding New Exchanges to IPOReady

**Time to add a new exchange: ~5-10 minutes**

When the user says "add Dubai" or "add London Exchange", here's the exact flow:

## Quick Reference

### North America
| Exchange | Code | Country | Status |
|----------|------|---------|--------|
| Toronto Stock Exchange | TSX | Canada | ✅ Live |
| TSX Venture Exchange | TSXV | Canada | ✅ Live |
| Canadian Securities Exchange | CSE | Canada | ✅ Live |
| NASDAQ | NASDAQ | USA | ✅ Live |
| New York Stock Exchange | NYSE | USA | ✅ Live |

### Europe & Middle East
| Exchange | Code | Country | Status |
|----------|------|---------|--------|
| London Stock Exchange | LSE | UK | 🔧 Template |
| Dubai Financial Market | DFM | UAE | 🔧 Template |
| Saudi Stock Exchange | TADAWUL | Saudi Arabia | 🔧 Template |

### Asia-Pacific
| Exchange | Code | Country | Status |
|----------|------|---------|--------|
| Australian Securities Exchange | ASX | Australia | 🔧 Template |
| Hong Kong Exchanges | HKEX | Hong Kong | 🔧 Template |
| Korea Exchange | KRX | South Korea | 🔧 Template |
| Singapore Exchange | SGX | Singapore | 🔧 Template |

---

## How to Add a New Exchange

### Example: User says "Add Dubai"

```
User: "Add Dubai"
Me: "Onboarding DFM (Dubai Financial Market). 5 steps, ~5 minutes."
```

### Step 1: Enable in Exchange Registry

**File**: `/src/config/exchanges.ts`

Find the DFM exchange config (already exists as template), verify it has:
- ✅ Exchange code: `DFM`
- ✅ Regulator: `DFSA`
- ✅ Filing system: `eServe`
- ✅ Enabled modules: `['disclosure', 'ir', 'cfo', 'compliance']`
- ✅ Required documents listed
- ✅ Filing deadlines set

Set `isLive: true` in the DFM config:

```typescript
DFM: {
  code: 'DFM',
  name: 'Dubai Financial Market',
  // ... other fields ...
  isLive: true,  // ← CHANGE THIS
  launchedDate: '2024-06-05'
}
```

**Time: 30 seconds**

---

### Step 2: Update Company Type

**File**: `/src/types/company.ts`

Add the exchange code to the Exchange type union:

```typescript
// Before
export type Exchange = 'TSX' | 'TSXV' | 'CSE' | 'NASDAQ' | 'NYSE' | 'OTCQX' | 'OTCQB' | string

// After
export type Exchange = 'TSX' | 'TSXV' | 'CSE' | 'NASDAQ' | 'NYSE' | 'OTCQX' | 'OTCQB' | 'DFM' | string
```

**Time: 30 seconds**

---

### Step 3: Add to Menu System

**File**: `/src/config/menu.ts`

Add UAE to the COUNTRIES list and create a DFM navigation config:

```typescript
// Add to top of file
export const COUNTRIES = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' }  // ← ADD
]

// Add to getNavGroups() function
if (company.location === 'AE' && company.exchange === 'DFM') {
  return DFM_NAV_GROUPS  // See below
}

// Create DFM-specific navigation
export const DFM_NAV_GROUPS: NavGroup[] = [
  {
    section: 'IPO PREPARATION',
    collapsible: true,
    items: [
      { href: '/dashboard/pace', icon: Target, label: 'PACE™ Scorecard', badge: 'Updated' },
      { href: '/dashboard/cap-table', icon: PieChart, label: 'Cap Table' },
      // ... other IPO prep items ...
    ]
  },
  {
    section: 'LISTED SERVICES (Unlocks when you list)',
    collapsible: true,
    items: [
      {
        href: '/dashboard/listed-services/preview?exchange=DFM',
        icon: AlertCircle,
        label: 'Disclosure & Filings',
        badge: '🔒 Coming'
      },
      {
        href: '/dashboard/listed-services/preview?exchange=DFM',
        icon: MessageSquare,
        label: 'Investor Relations',
        badge: '🔒 Coming'
      },
      {
        href: '/dashboard/listed-services/preview?exchange=DFM',
        icon: DollarSign,
        label: 'CFO Command',
        badge: '🔒 Coming'
      },
      {
        href: '/dashboard/listed-services/preview?exchange=DFM',
        icon: Eye,
        label: 'Compliance',
        badge: '🔒 Coming'
      }
      // Note: M&A not included for DFM (not in enabledModules)
    ]
  }
]
```

**Time: 2-3 minutes**

---

### Step 4: Update Listed Services Preview

**File**: `/src/app/dashboard/listed-services/preview/page.tsx`

The page already shows all modules. Now update to:
1. Accept `?exchange=DFM` query param
2. Only show modules in `getExchange('DFM').enabledModules`
3. Show M&A as "Not available for DFM" (greyed out)

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { getExchange } from '@/config/exchanges'

export default function ListedServicesPreviewPage() {
  const searchParams = useSearchParams()
  const exchangeCode = searchParams.get('exchange') || 'TSX'
  const exchange = getExchange(exchangeCode as ExchangeCode)

  // Only show modules enabled for this exchange
  const visibleModules = Object.keys(modules).filter(key =>
    exchange.enabledModules.includes(key)
  )

  // Return components with filtered modules
  // ...
}
```

**Time: 2 minutes**

---

### Step 5: Deploy

```bash
# Build
npm run build

# Stage and commit
git add src/config/exchanges.ts src/types/company.ts src/config/menu.ts src/app/dashboard/listed-services/preview/page.tsx

git commit -m "Add DFM (Dubai Financial Market) support

- Enable DFM in exchange registry (isLive: true)
- Add UAE to country selector
- Create DFM-specific navigation with 4 enabled modules
- Disclosure, IR, CFO Command, and Compliance available
- M&A hidden (not available for DFM)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push to production
git push origin main
```

**Time: 1 minute**

---

## Verification Checklist

After deployment, verify:

- [ ] User can create new company with location = UAE
- [ ] User can select DFM as exchange
- [ ] Dashboard shows DFM-specific menu (only disclosure, IR, CFO, compliance)
- [ ] Listed Services preview shows DFM modules
- [ ] M&A module is greyed out with "Not available for DFM"
- [ ] Filing Calendar shows DFM deadlines (45 days for first quarterly report)
- [ ] Regulatory requirements show DFSA info

---

## Template: Adding a New Exchange

When you need to add a completely NEW exchange (not already in the config):

### 1. Add to `/src/config/exchanges.ts`

```typescript
ADXE: {
  code: 'ADXE',
  name: 'Abu Dhabi Securities Exchange',
  country: 'United Arab Emirates',
  timezone: 'Asia/Dubai',
  regulator: 'SCA',
  regulatoryBody: 'Securities and Commodities Authority',
  filingSystem: 'eServe',
  minPublicFloat: {
    amount: 2000000,
    currency: 'AED'
  },
  minMarketCap: {
    amount: 20000000,
    currency: 'AED'
  },
  minYearsProfitability: 2,
  minShareholderCount: 250,
  minIndependentDirectors: 2,
  enabledModules: ['disclosure', 'compliance'],
  mandatoryModules: ['disclosure', 'compliance'],
  requiredDocuments: [
    'Prospectus',
    'Financial Statements',
    'Risk Factors',
    'Board Resolution'
  ],
  filingDeadlines: {
    firstQuarterlyReport: 45,
    firstAnnualReport: 90,
    continuousDisclosure: 3
  },
  supportEmail: 'listings@adx.ae',
  isLive: false,
  notes: 'Abu Dhabi exchange. Enable when ready.'
}
```

### 2. Add exchange code to type

```typescript
// /src/types/company.ts
export type Exchange = '...' | 'ADXE' | string
```

### 3. Add country/exchange combo to menu

```typescript
// /src/config/menu.ts
if (company.location === 'AE' && company.exchange === 'ADXE') {
  return ADXE_NAV_GROUPS
}

export const ADXE_NAV_GROUPS: NavGroup[] = [
  // ... nav items for ADXE ...
]
```

### 4. Update Listed Services

Add ADXE-specific module list to the preview page filter.

### 5. Deploy

**Total time: ~10 minutes**

---

## Pattern: Multiple Exchanges Per Country

When adding multiple exchanges in the same country (e.g., both DFM and ADXE in UAE):

```typescript
// /src/config/menu.ts

export const UAE_EXCHANGES = {
  DFM: { name: 'Dubai Financial Market', modules: 4 },
  ADXE: { name: 'Abu Dhabi Securities Exchange', modules: 2 }
}

if (company.location === 'AE') {
  if (company.exchange === 'DFM') return DFM_NAV_GROUPS
  if (company.exchange === 'ADXE') return ADXE_NAV_GROUPS
}
```

Users select their country, then their specific exchange. Menu updates automatically.

---

## Fast-Track: Cloning an Existing Exchange

If you're adding an exchange very similar to an existing one (e.g., another Canadian exchange):

1. Copy the existing exchange config in `/src/config/exchanges.ts`
2. Change `code`, `name`, `country`, regulator info
3. Adjust `minPublicFloat`, deadlines, required documents
4. Set `isLive: false` until ready
5. Follow steps 2-5 above

This is the fastest way to add a new exchange when the regulatory framework is similar.

---

## Regulatory Requirements by Region

### Canada (CSA)
- All exchanges: SEDAR2 filing
- Modules: disclosure, ir, cfo, compliance (+ executive for larger)
- Deadlines: ~45 days quarterly, ~90 days annual

### USA (SEC)
- All exchanges: SEC Edgar filing
- Modules: All 6 (disclosure, ir, cfo, executive, mna, compliance)
- Deadlines: ~40-45 days quarterly, ~60 days annual
- Requirements: Strictest in the world

### UK (FCA)
- LSE: RNS (Regulatory News Service)
- Modules: disclosure, ir, cfo, compliance (executive optional)
- Deadlines: ~90 days quarterly, ~120 days annual

### UAE (DFSA/SCA)
- DFM: eServe
- ADXE: eServe
- Modules: disclosure, compliance (ir/cfo optional)
- Deadlines: ~45 days quarterly, ~90 days annual
- Special: Sharia compliance may be required

---

## Pre-Configured Exchanges (Ready to Activate)

These exchanges are fully configured and ready to go live. When user requests them, set `isLive: true` and follow the 5-step process:

### European & Middle Eastern
- 🔧 **LSE** (London Stock Exchange) - UK, FCA regulated, RNS filing
- 🔧 **DFM** (Dubai Financial Market) - UAE, DFSA regulated, eServe filing
- 🔧 **TADAWUL** (Saudi Stock Exchange) - Saudi Arabia, CMA regulated, Vision 2030 aligned

### Asia-Pacific (NEW - Priority)
- 🔧 **ASX** (Australian Securities Exchange) - Australia, ASIC regulated, IFRS required
- 🔧 **HKEX** (Hong Kong Exchanges & Clearing) - Hong Kong, SFC regulated, dual-language (EN/ZH)
- 🔧 **KRX** (Korea Exchange) - South Korea, FSC regulated, dual-language (EN/KO), tech-focused
- 🔧 **SGX** (Singapore Exchange) - Singapore, MAS regulated, ASEAN gateway

To activate any exchange:
1. Find in `/src/config/exchanges.ts`
2. Set `isLive: true`
3. Follow 5-step onboarding above

---

## Notes for Future

- Each exchange needs a **filing adapter** in `/src/lib/filing-adapters/{ExchangeCode}Adapter.ts` to actually submit documents (Phase 2)
- Each exchange might need **currency handling** (CAD vs USD vs GBP vs AED)
- Each exchange might need **date/timezone handling** for deadlines
- Regulatory **document templates** will differ per exchange (currently using generic)

These are handled in future phases. For now, the menu system, module visibility, and threshold configuration are ready to go.
