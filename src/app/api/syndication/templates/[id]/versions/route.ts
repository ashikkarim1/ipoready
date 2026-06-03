import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const SAMPLE_VERSIONS = [
  {
    id: 'v1',
    template_id: '1',
    version: 2,
    changes: 'Updated gross spread from 300 to 350 bps',
    created_at: '2024-05-20T14:45:00Z',
    created_by: 'John Doe',
  },
  {
    id: 'v2',
    template_id: '1',
    version: 1,
    changes: 'Initial template creation',
    created_at: '2024-01-15T10:30:00Z',
    created_by: 'Jane Smith',
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const versions = SAMPLE_VERSIONS.filter(v => v.template_id === id)

    return NextResponse.json({
      versions,
      count: versions.length,
    })
  } catch (error) {
    console.error('Error fetching version history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
