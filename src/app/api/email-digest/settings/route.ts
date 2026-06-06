import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export const dynamic = 'force-dynamic'
interface DigestSettings {
  frequency: 'daily' | 'weekly' | 'off'
  deliveryDay?: string // Monday, Tuesday, etc (for weekly)
  deliveryTime?: string // Hour in HH:00 format
  includeMetrics?: boolean
  includeComplianceUpdates?: boolean
  includeBelowTheLineRisks?: boolean
  includeCostAnalysis?: boolean
}

/**
 * GET: Retrieve user's current digest settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In production: fetch from database
    // For now, return defaults
    const settings: DigestSettings = {
      frequency: 'weekly',
      deliveryDay: 'Monday',
      deliveryTime: '09:00',
      includeMetrics: true,
      includeComplianceUpdates: true,
      includeBelowTheLineRisks: true,
      includeCostAnalysis: true
    }

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * POST: Update user's digest settings
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const settings = await request.json() as DigestSettings

    // Validate
    if (!['daily', 'weekly', 'off'].includes(settings.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency' },
        { status: 400 }
      )
    }

    if (settings.frequency === 'weekly' && !settings.deliveryDay) {
      return NextResponse.json(
        { error: 'deliveryDay required for weekly frequency' },
        { status: 400 }
      )
    }

    // In production: save to database
    // await db.emailDigestSettings.upsert({
    //   where: { userId: session.user.id },
    //   update: settings,
    //   create: { userId: session.user.id, ...settings }
    // })

    return NextResponse.json({
      success: true,
      message: 'Settings saved',
      settings,
      nextSendDate: getNextSendDate(settings)
    })
  } catch (error) {
    console.error('Settings update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

function getNextSendDate(settings: DigestSettings): string | null {
  if (settings.frequency === 'off') {
    return null
  }

  const now = new Date()
  const nextDate = new Date(now)

  if (settings.frequency === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1)
    nextDate.setHours(9, 0, 0, 0)
  } else if (settings.frequency === 'weekly') {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const targetDay = daysOfWeek.indexOf(settings.deliveryDay || 'Monday')
    const currentDay = nextDate.getDay()

    let daysUntil = targetDay - currentDay
    if (daysUntil <= 0) daysUntil += 7

    nextDate.setDate(nextDate.getDate() + daysUntil)
    nextDate.setHours(9, 0, 0, 0)
  }

  return nextDate.toISOString().split('T')[0]
}
