import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return mock company data (in production, would fetch from database)
  return NextResponse.json({
    company: {
      id: 'company-123',
      name: 'VentureTech Innovations Inc',
      targetExchange: 'TSXV',
      currency: 'CAD',
      status: 'ipo-ready',
      founded: 2018,
      employees: 45,
      postMoneyValuation: 100000000,
    },
  })
}
