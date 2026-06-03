# Required Routes Implementation Templates

This document provides templates for all missing routes in the Financial Management and Compliance sections.

---

## Financial Management Routes

### 1. `/dashboard/financial-mgmt/financial-kpis/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { LayoutDashboard, TrendingUp, AlertTriangle } from 'lucide-react'

export default function FinancialKPIsPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp size={32} />
          Financial KPIs
        </h1>
        <p className="text-text-secondary mt-2">
          Monitor key financial performance indicators for your IPO journey
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Template */}
        <div
          className="p-6 rounded-lg border"
          style={{
            background: 'var(--color-surface-default)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">KPI Name</h3>
            <span className="text-2xl font-bold">--</span>
          </div>
          <p className="text-sm text-text-tertiary">
            Description of this KPI
          </p>
          <div className="mt-4 text-xs text-text-tertiary">
            Last updated: --
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Detailed Analysis</h2>
        <p className="text-text-secondary">
          KPI details and trend analysis will appear here.
        </p>
      </div>
    </div>
  )
}
```

---

### 2. `/dashboard/financial-mgmt/dilution-scenarios/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { BarChart3, Users, Percent } from 'lucide-react'

export default function DilutionScenariosPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 size={32} />
          Dilution Scenarios
        </h1>
        <p className="text-text-secondary mt-2">
          Model different ownership scenarios and funding rounds
        </p>
      </div>

      {/* Scenario Selector */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Create Scenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Scenario Name
            </label>
            <input
              type="text"
              placeholder="e.g., Series C Funding"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: 'var(--color-border-light)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Funding Amount (USD)
            </label>
            <input
              type="number"
              placeholder="1000000"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: 'var(--color-border-light)' }}
            />
          </div>
        </div>
      </div>

      {/* Scenarios List */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Existing Scenarios</h2>
        <p className="text-text-secondary">
          No scenarios created yet. Create one to get started.
        </p>
      </div>
    </div>
  )
}
```

---

### 3. `/dashboard/financial-mgmt/pricing/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { DollarSign, TrendingUp, LineChart } from 'lucide-react'

export default function PricingStrategyPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign size={32} />
          Pricing Strategy
        </h1>
        <p className="text-text-secondary mt-2">
          Determine your IPO price range and valuation metrics
        </p>
      </div>

      {/* Valuation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-6 rounded-lg border"
          style={{
            background: 'var(--color-surface-default)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          <h3 className="text-sm font-medium text-text-tertiary mb-2">
            Current Valuation
          </h3>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div
          className="p-6 rounded-lg border"
          style={{
            background: 'var(--color-surface-default)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          <h3 className="text-sm font-medium text-text-tertiary mb-2">
            Target Price Range
          </h3>
          <p className="text-2xl font-bold">-- to --</p>
        </div>
        <div
          className="p-6 rounded-lg border"
          style={{
            background: 'var(--color-surface-default)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          <h3 className="text-sm font-medium text-text-tertiary mb-2">
            Expected Shares
          </h3>
          <p className="text-2xl font-bold">--</p>
        </div>
      </div>

      {/* Pricing Methods */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Valuation Methods</h2>
        <div className="space-y-4">
          <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h3 className="font-medium">Comparable Companies (Comps)</h3>
            <p className="text-sm text-text-secondary mt-1">
              Analyze similar public companies
            </p>
          </div>
          <div className="pb-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h3 className="font-medium">Discounted Cash Flow (DCF)</h3>
            <p className="text-sm text-text-secondary mt-1">
              Project future cash flows
            </p>
          </div>
          <div>
            <h3 className="font-medium">Precedent Transactions</h3>
            <p className="text-sm text-text-secondary mt-1">
              Review historical M&A multiples
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 4. `/dashboard/financial-mgmt/syndication/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { Users, Plus, Mail } from 'lucide-react'

export default function SyndicationPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users size={32} />
            Syndication
          </h1>
          <p className="text-text-secondary mt-2">
            Manage investor syndication and communications
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded font-medium"
          style={{
            background: 'var(--color-accent)',
            color: 'white',
          }}
        >
          <Plus size={18} />
          Add Investor
        </button>
      </div>

      {/* Investor List */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Investors</h2>
        <div className="space-y-4">
          {/* Investor Card Template */}
          <div
            className="p-4 rounded border"
            style={{
              background: 'var(--color-bg-primary)',
              borderColor: 'var(--color-border-light)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Investor Name</h3>
                <p className="text-sm text-text-tertiary">Investor details</p>
              </div>
              <button className="p-2 rounded hover:bg-surface-light">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>
        {/* Empty State */}
        <p className="text-center text-text-secondary py-8">
          No investors added yet
        </p>
      </div>
    </div>
  )
}
```

---

## Compliance Routes

### 1. `/dashboard/compliance/regulatory-filings/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { Building2, FileCheck, Clock } from 'lucide-react'

export default function RegulatoryFilingsPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 size={32} />
          Regulatory Filings
        </h1>
        <p className="text-text-secondary mt-2">
          Track SEC and regulatory submission progress
        </p>
      </div>

      {/* Filing Checklist */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Required Filings</h2>
        <div className="space-y-4">
          {[
            { name: 'Form S-1', status: 'draft', dueDate: '2026-07-15' },
            { name: 'Form 424B4', status: 'pending', dueDate: '2026-08-15' },
            { name: 'Form 11-K', status: 'not-started', dueDate: '2026-09-15' },
          ].map((filing, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded border"
              style={{
                background: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-light)',
              }}
            >
              <div>
                <h3 className="font-medium">{filing.name}</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  Due: {filing.dueDate}
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: filing.status === 'draft'
                    ? 'var(--color-warning-soft)'
                    : filing.status === 'pending'
                    ? 'var(--color-bg-secondary)'
                    : 'var(--color-surface-light)',
                  color: filing.status === 'draft' ? 'var(--color-warning)' : 'inherit',
                }}
              >
                {filing.status === 'draft' ? 'Draft' : filing.status === 'pending' ? 'Pending' : 'Not Started'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Filing Timeline
        </h2>
        <p className="text-text-secondary">
          Timeline visualization will appear here
        </p>
      </div>
    </div>
  )
}
```

---

### 2. `/dashboard/compliance/exchange-config/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { GitBranch, Radio, Settings } from 'lucide-react'

export default function ExchangeConfigPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch size={32} />
          Exchange Configuration
        </h1>
        <p className="text-text-secondary mt-2">
          Select and configure your listing exchange
        </p>
      </div>

      {/* Exchange Selection */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Select Exchange</h2>
        <div className="space-y-3">
          {[
            { name: 'NASDAQ', ticker: 'NASD', features: 'Tech-focused' },
            { name: 'NYSE', ticker: 'NYSE', features: 'Large cap preferred' },
            { name: 'TSX', ticker: 'TSX', features: 'Canadian listing' },
          ].map((exchange, idx) => (
            <label key={idx} className="flex items-center p-4 rounded border cursor-pointer hover:bg-bg-primary"
              style={{ borderColor: 'var(--color-border-light)' }}>
              <input type="radio" name="exchange" className="mr-3" />
              <div className="flex-1">
                <h3 className="font-medium">{exchange.name}</h3>
                <p className="text-sm text-text-tertiary">{exchange.features}</p>
              </div>
              <span className="text-sm font-medium text-text-secondary">
                {exchange.ticker}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Exchange Requirements */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          Configuration Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Share Price
            </label>
            <input
              type="number"
              placeholder="4.00"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: 'var(--color-border-light)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Public Shareholders
            </label>
            <input
              type="number"
              placeholder="400"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: 'var(--color-border-light)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 3. `/dashboard/compliance/audit-trail/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { Eye, Clock, User, Activity } from 'lucide-react'

export default function AuditTrailPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="p-6">Loading...</div>
  }

  const auditEvents = [
    {
      id: '1',
      user: 'Jane Doe',
      action: 'Approved Resolution #5',
      timestamp: '2026-06-03 14:32',
      type: 'approval',
    },
    {
      id: '2',
      user: 'John Smith',
      action: 'Updated Listing Rules Checklist',
      timestamp: '2026-06-03 13:15',
      type: 'update',
    },
    {
      id: '3',
      user: 'Sarah Wilson',
      action: 'Created Consent Letter Request',
      timestamp: '2026-06-03 10:45',
      type: 'create',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Eye size={32} />
          Audit Trail
        </h1>
        <p className="text-text-secondary mt-2">
          Complete history of all compliance actions and approvals
        </p>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-lg border flex gap-4"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search actions..."
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: 'var(--color-border-light)' }}
          />
        </div>
        <select
          className="px-3 py-2 rounded border"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <option>All Actions</option>
          <option>Approvals</option>
          <option>Updates</option>
          <option>Creates</option>
        </select>
      </div>

      {/* Audit Log */}
      <div className="space-y-2">
        {auditEvents.map((event) => (
          <div
            key={event.id}
            className="p-4 rounded-lg border flex items-start gap-4"
            style={{
              background: 'var(--color-surface-default)',
              borderColor: 'var(--color-border-light)',
            }}
          >
            <Activity size={20} style={{ color: 'var(--color-accent)', marginTop: '2px' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{event.user}</span>
                <span className="text-sm text-text-tertiary">{event.timestamp}</span>
              </div>
              <p className="text-text-secondary">{event.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Instructions

1. **Copy each file** to the corresponding location in your project
2. **Customize the content** to match your application's data model
3. **Add API calls** to fetch real data from your backend
4. **Update styling** to match your design system variables
5. **Add form handlers** for data submission
6. **Test navigation** to ensure routes are accessible

---

## Notes

- All templates include proper TypeScript typing
- Use existing design system variables (`--color-*`)
- Include empty states with helpful messages
- Add loading and error states as needed
- Consider data fetching strategies (SSR vs. Client-side)
- Add proper authorization checks where applicable

---
