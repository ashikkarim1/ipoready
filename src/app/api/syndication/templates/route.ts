import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const SAMPLE_TEMPLATES = [
  {
    id: '1',
    agreement_type: 'firm_commitment',
    agreement_name: 'Standard Firm Commitment Agreement',
    description:
      'Classic firm commitment agreement where underwriters purchase all securities from issuer and bear the risk of distribution.',
    lead_underwriter: 'Goldman Sachs',
    member_count: 8,
    gross_spread_bps: 350,
    lockup_period_days: 180,
    allocation_structure: {
      'Goldman Sachs': 4000,
      'Morgan Stanley': 3000,
      'JP Morgan': 2500,
      'Bank of America': 2000,
      'Citigroup': 1500,
      'Deutsche Bank': 1200,
      'Barclays': 900,
      'BMO Capital Markets': 900,
    },
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-05-20T14:45:00Z',
    version: 2,
  },
  {
    id: '2',
    agreement_type: 'best_efforts',
    agreement_name: 'Best Efforts Underwriting Agreement',
    description:
      'Underwriters agree to use best efforts to sell securities but are not obligated to purchase unsold shares.',
    lead_underwriter: 'RBC Capital Markets',
    member_count: 5,
    gross_spread_bps: 400,
    lockup_period_days: 180,
    allocation_structure: {
      'RBC Capital Markets': 4500,
      'TD Securities': 2500,
      'BMO Capital Markets': 2000,
      'Scotiabank': 1500,
      'CIBC': 1500,
    },
    status: 'active',
    created_at: '2024-02-10T09:15:00Z',
    updated_at: '2024-05-15T16:20:00Z',
    version: 1,
  },
  {
    id: '3',
    agreement_type: 'standby',
    agreement_name: 'Standby Underwriting Agreement',
    description:
      'Underwriters standby to purchase any unsubscribed portion of a rights offering at a specified price.',
    lead_underwriter: 'Canaccord Genuity',
    member_count: 3,
    gross_spread_bps: 250,
    lockup_period_days: 90,
    allocation_structure: {
      'Canaccord Genuity': 5000,
      'Beacon Securities': 3000,
      'Eight Capital': 2000,
    },
    status: 'draft',
    created_at: '2024-03-05T11:45:00Z',
    updated_at: '2024-05-18T13:10:00Z',
    version: 1,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      templates: SAMPLE_TEMPLATES,
      count: SAMPLE_TEMPLATES.length,
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const newTemplate = {
      id: Date.now().toString(),
      ...data,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    }

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
