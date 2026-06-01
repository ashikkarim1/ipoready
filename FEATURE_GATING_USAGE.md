# Feature Gating System Usage Guide

## Overview

The feature gating system controls which features are accessible based on subscription plan and trial status. It consists of:

1. **`/src/lib/feature-gates.ts`** - Core utility functions for checking feature access
2. **`/src/components/FeatureGate.tsx`** - React component for conditional rendering

## Feature Tiers

- **starter** - Free tier with basic features
- **growth** - Mid-tier with advanced analytics and collaboration
- **enterprise** - Premium tier with all features
- **trial** - Active trial period (can access any paid features during trial)

## Available Features

```typescript
// PACE™ Core Features
PACE_BASE_SCORE              // Available to all
PACE_PREDICTIVE_FACTORS      // Growth and above
PACE_PEER_COMPARISON         // Growth and above
PACE_SEQUENCING_ALERTS       // Growth and above

// Document Management
DOCUMENT_COMPLETENESS        // Growth and above
DOCUMENT_UPLOAD              // Growth and above

// IPO Benchmarking (Enterprise only)
IPO_BENCHMARKING
CUSTOM_BENCHMARKS

// Advanced Features (Enterprise only)
API_ACCESS
PRIORITY_SUPPORT

// Team & Collaboration
TEAM_MEMBERS                 // Growth and above

// Admin & Control (Enterprise only)
ADMIN_PANEL

// Reporting & Analytics
EXPORT_REPORTS               // Growth and above
HISTORICAL_DATA              // Growth and above
```

## Usage Examples

### 1. Check Feature Access in API Endpoints

```typescript
// In /src/app/api/benchmarks/custom/route.ts
import { companyCanAccessFeature, upgradeRequired } from '@/lib/feature-gates'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { companyId } = await req.json()
  
  // Check if company can access custom benchmarks
  const hasAccess = await companyCanAccessFeature(companyId, 'CUSTOM_BENCHMARKS')
  
  if (!hasAccess) {
    const upgrade = await upgradeRequired(userId, 'CUSTOM_BENCHMARKS')
    return NextResponse.json(
      { 
        error: 'Feature not available in your plan',
        upgrade: upgrade
      },
      { status: 403 }
    )
  }
  
  // Process request...
}
```

### 2. Use FeatureGate Component in React

```typescript
// In a React component
import { FeatureGate } from '@/components/FeatureGate'
import { CustomBenchmarkPanel } from './CustomBenchmarkPanel'

export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show custom benchmarks only to growth+ users */}
      <FeatureGate feature="CUSTOM_BENCHMARKS" tier="growth">
        <CustomBenchmarkPanel />
      </FeatureGate>
      
      {/* Or with custom fallback */}
      <FeatureGate 
        feature="API_ACCESS" 
        tier="starter"
        fallback={
          <div className="p-4 bg-blue-50 rounded">
            <p>API access is available in the Enterprise plan</p>
            <a href="/app/upgrade">Upgrade Now</a>
          </div>
        }
      >
        <APIDocumentation />
      </FeatureGate>
    </div>
  )
}
```

### 3. Get User Tier Information

```typescript
import { getUserTier } from '@/lib/feature-gates'

async function showUserDashboard(userId: string) {
  const tierInfo = await getUserTier(userId)
  
  console.log(tierInfo)
  // {
  //   tier: 'growth',
  //   subscription_plan: 'growth',
  //   trial_status: null,
  //   subscription_status: 'active'
  // }
  
  // Show tier-specific UI
  if (tierInfo.tier === 'enterprise') {
    showEnterpriseFeatures()
  } else if (tierInfo.tier === 'growth') {
    showGrowthFeatures()
  } else {
    showStarterFeatures()
  }
}
```

### 4. Get All Available Features for a Tier

```typescript
import { getFeatureList } from '@/lib/feature-gates'

function showPricingPage() {
  const starterFeatures = getFeatureList('starter')
  const growthFeatures = getFeatureList('growth')
  const enterpriseFeatures = getFeatureList('enterprise')
  
  // starterFeatures = ['PACE_BASE_SCORE']
  // growthFeatures = ['PACE_BASE_SCORE', 'PACE_PREDICTIVE_FACTORS', 'PACE_PEER_COMPARISON', ...]
  // enterpriseFeatures = [all features]
}
```

### 5. Check Upgrade Requirements

```typescript
import { upgradeRequired } from '@/lib/feature-gates'

async function canUserExportReports(userId: string) {
  const upgrade = await upgradeRequired(userId, 'EXPORT_REPORTS')
  
  if (upgrade.required) {
    return {
      allowed: false,
      message: `Export reports requires ${upgrade.suggestedTier} plan`,
      upgradeUrl: upgrade.upgradeUrl  // /app/checkout?upgrade_from=starter&to=growth
    }
  }
  
  return { allowed: true }
}
```

### 6. Get Plan Limits

```typescript
import { getPlanLimits } from '@/lib/feature-gates'

function showPlanComparison() {
  const starterLimits = getPlanLimits('starter')
  const growthLimits = getPlanLimits('growth')
  const enterpriseLimits = getPlanLimits('enterprise')
  
  // starterLimits = {
  //   companies: 1,
  //   team_members: 3,
  //   documents_storage_gb: 5,
  //   api_calls_per_month: 0,
  //   monthly_price_usd: 299
  // }
}
```

### 7. Rate Limiting Based on Plan

```typescript
import { checkRateLimit } from '@/lib/feature-gates'

async function exportReport(companyId: string) {
  const canExport = await checkRateLimit(companyId, 'bulk_operations')
  
  if (!canExport) {
    return NextResponse.json(
      { error: 'Your plan does not support bulk exports' },
      { status: 429 }
    )
  }
  
  // Generate export...
}
```

### 8. Trial Upgrade

```typescript
import { upgradeTrial } from '@/lib/feature-gates'

async function handleTrialConversion(companyId: string, stripeSubscriptionId: string) {
  // User converted from trial to growth plan
  await upgradeTrial(companyId, stripeSubscriptionId, 'growth')
  
  // Now user has access to all growth features
}
```

## Database Schema

The system queries the `companies` table:

```sql
companies {
  id: string (primary key)
  subscription_plan: 'starter' | 'growth' | 'enterprise' | null
  subscription_status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | null
  trial_status: 'active' | 'upgraded' | 'expired' | null
}
```

## Type Exports

```typescript
// Main types
export type FeatureTier = 'starter' | 'growth' | 'enterprise' | 'trial'
export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'

// Interfaces
export interface UserTierInfo {
  tier: FeatureTier
  subscription_plan: SubscriptionPlan | null
  trial_status: string | null
  subscription_status: SubscriptionStatus | null
}

export interface UpgradeInfo {
  required: boolean
  currentTier: FeatureTier
  suggestedTier?: FeatureTier
  upgradeUrl?: string
}

export interface PlanLimits {
  companies: number | string
  team_members: number | string
  documents_storage_gb: number | string
  api_calls_per_month: number | string
  monthly_price_usd: number
}
```

## Function Reference

### Core Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `canAccessFeature` | `tier: FeatureTier, featureName: string` | `boolean` | Check if tier has access to feature |
| `userCanAccessFeature` | `userId: string, featureName: string` | `Promise<boolean>` | Check if user has access |
| `companyCanAccessFeature` | `companyId: string, featureName: string` | `Promise<boolean>` | Check if company has access |
| `getUserTier` | `userId: string` | `Promise<UserTierInfo>` | Get user's tier info |
| `getCompanyTier` | `companyId: string` | `Promise<UserTierInfo>` | Get company's tier info |
| `getFeatureList` | `tier: FeatureTier` | `string[]` | Get all features for tier |
| `getUserFeatures` | `userId: string` | `Promise<string[]>` | Get user's available features |
| `getCompanyFeatures` | `companyId: string` | `Promise<string[]>` | Get company's available features |
| `upgradeRequired` | `userId: string, featureName: string` | `Promise<UpgradeInfo>` | Check if upgrade needed |
| `companyUpgradeRequired` | `companyId: string, featureName: string` | `Promise<UpgradeInfo>` | Check company upgrade |
| `getPlanLimits` | `plan: SubscriptionPlan` | `PlanLimits` | Get plan limits |
| `upgradeTrial` | `companyId: string, stripeSubscriptionId: string, plan: SubscriptionPlan` | `Promise<void>` | Upgrade from trial |
| `downgradeSubscription` | `companyId: string, plan: SubscriptionPlan` | `Promise<void>` | Downgrade plan |
| `isSubscriptionActive` | `subscription: CompanySubscription \| null` | `boolean` | Check if subscription active |
| `checkRateLimit` | `companyId: string, operation: string` | `Promise<boolean>` | Check operation allowed |

## Error Handling

The system is defensive and safe by default:

- **User not found**: Returns `tier: 'starter'` (safest default)
- **Subscription data missing**: Returns `tier: 'starter'`
- **Undefined features**: Logs warning, returns `false` (denies access)
- **Database errors**: Caught and logged, returns null/starter default

## Best Practices

1. **Always check in API endpoints** - Protect routes with feature checks
2. **Use FeatureGate for UI** - Hide/show features based on tier
3. **Provide clear upgrade paths** - Link to checkout when upgrade needed
4. **Cache tier info** - Don't query on every render
5. **Log access denials** - Track when users hit feature limits
6. **Test all tiers** - Verify UI works for starter/growth/enterprise
7. **Document feature requirements** - Mark features with required tier in comments

## Backward Compatibility

The system maintains backward compatibility with legacy code:

- `FEATURE_MATRIX` - Still available for old code
- `getEffectivePlan()` - Legacy plan extraction
- `canAccessFeatureLegacy()` - Legacy access check
- `checkFeatureAccess()` - Legacy check with company ID
- `getAvailableFeatures()` - Legacy feature listing

Old code continues to work, but new code should use the new API.
