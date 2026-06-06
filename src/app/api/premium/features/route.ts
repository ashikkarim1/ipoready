/**
 * GET /api/premium/features
 * Get all available premium features and current company's activation status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPremiumFeaturesByTier, getFeatureActivations } from '@/lib/premium'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    // Get features by tier
    const featuresByTier = await getPremiumFeaturesByTier()
    const features: any = {}

    for (const [tier, tieredFeatures] of featuresByTier.entries()) {
      features[tier] = tieredFeatures.map(f => ({
        id: f.id.toString(),
        key: f.feature_key,
        name: f.display_name,
        description: f.description,
        category: f.category,
        icon: f.icon,
        badge: {
          text: f.badge_text,
          color: f.badge_color,
        },
        valueProp: f.value_prop,
        monthlyValue: f.monthly_value_usd / 100, // convert to dollars
      }))
    }

    // Get company's activated features
    const activations = await getFeatureActivations(BigInt(companyId))
    const activated: Record<string, boolean> = {}
    for (const [key, active] of activations.entries()) {
      activated[key] = active
    }

    return NextResponse.json({
      features,
      activated,
      tiers: {
        starter: {
          name: 'Starter',
          price: '$0',
          priceMonthly: 0,
          priceAnnual: 0,
          description: 'Free - Core IPO planning',
        },
        professional: {
          name: 'Professional',
          price: '$99',
          priceMonthly: 9900,
          priceAnnual: 99000,
          description: 'Executive dashboards & insights',
        },
        enterprise: {
          name: 'Enterprise',
          price: '$250',
          priceMonthly: 25000,
          priceAnnual: 250000,
          description: 'Complete orchestration platform',
        },
      },
    })
  } catch (error) {
    console.error('Features endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    )
  }
}
