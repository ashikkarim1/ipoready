import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
/**
 * POST /api/intelligence/briefing/subscribe
 *
 * Subscribe user to morning briefing with custom preferences
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      companyId,
      categories,
      emailTime,
      emailFrequency,
      competitors,
      excludeCategories,
      minUrgencyThreshold,
    } = await request.json()

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      )
    }

    // Validate email time format (HH:MM)
    if (emailTime && !/^\d{2}:\d{2}$/.test(emailTime)) {
      return NextResponse.json(
        { error: 'emailTime must be in HH:MM format' },
        { status: 400 }
      )
    }

    // Mock subscription confirmation (database to be configured separately)
    const subscription = {
      userId,
      companyId,
      categories: categories || ['market', 'regulatory', 'competitor'],
      emailTime: emailTime || '06:00',
      emailFrequency: emailFrequency || 'daily',
      competitors: competitors || [],
      excludeCategories: excludeCategories || [],
      minUrgencyThreshold: minUrgencyThreshold || 'medium',
      subscriptionDate: new Date().toISOString(),
      status: 'active',
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe to briefing' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/intelligence/briefing/subscribe
 *
 * Update briefing subscription preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const {
      userId,
      companyId,
      categories,
      emailTime,
      emailFrequency,
      competitors,
    } = await request.json()

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      )
    }

    const updated = {
      userId,
      companyId,
      categories: categories || ['market', 'regulatory', 'competitor'],
      emailTime: emailTime || '06:00',
      emailFrequency: emailFrequency || 'daily',
      competitors: competitors || [],
      updatedAt: new Date().toISOString(),
      status: 'active',
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/intelligence/briefing/subscribe
 *
 * Unsubscribe from morning briefing
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const companyId = searchParams.get('companyId')

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: 'userId and companyId are required' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Unsubscribed from briefing', userId, companyId },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unsubscribe from briefing' },
      { status: 500 }
    )
  }
}
