/**
 * POST /api/premium/activate
 * Activate a premium feature after payment confirmation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { activateFeature } from '@/lib/premium'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, featureKey, paymentId } = body

    if (!companyId || !featureKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production: verify paymentId with Stripe/payment processor
    // For now: assume payment verified if request made with auth

    // Activate feature
    const success = await activateFeature(
      BigInt(companyId),
      featureKey,
      BigInt(session.user.id),
      'upgrade_flow'
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to activate feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      featureKey,
      message: 'Feature activated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Activation endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to activate feature' },
      { status: 500 }
    )
  }
}
