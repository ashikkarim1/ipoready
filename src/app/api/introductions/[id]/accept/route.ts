import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/introductions/[id]/accept
 * Professional accepts an introduction request
 *
 * Requires:
 * - Authentication as the professional
 * - Valid introduction ID
 * - Introduction must be in 'pending' status
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const introductionId = params.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(introductionId)) {
      return NextResponse.json({ error: 'Invalid introduction ID format' }, { status: 400 })
    }

    // Get introduction request
    const introRows = await sql`
      SELECT
        id, professional_id, company_id, role_seeking, status
      FROM professional_introductions
      WHERE id = ${introductionId}
      LIMIT 1
    ` as {
      id: string
      professional_id: string
      company_id: string
      role_seeking: string
      status: string
    }[]

    if (introRows.length === 0) {
      return NextResponse.json({ error: 'Introduction request not found' }, { status: 404 })
    }

    const intro = introRows[0]

    // Verify introduction is still pending
    if (intro.status !== 'pending') {
      return NextResponse.json(
        { error: `Introduction cannot be accepted - status is ${intro.status}` },
        { status: 400 }
      )
    }

    // Verify professional matches user (professional-only action)
    const profRows = await sql`
      SELECT id FROM professionals WHERE email = ${session.user?.email || ''}
    ` as { id: string }[]

    if (profRows.length === 0 || profRows[0].id !== intro.professional_id) {
      return NextResponse.json(
        { error: 'Forbidden - only the invited professional can accept this introduction' },
        { status: 403 }
      )
    }

    // Update introduction status
    const updatedRows = await sql`
      UPDATE professional_introductions
      SET
        status = 'accepted',
        responded_at = NOW()
      WHERE id = ${introductionId}
      RETURNING
        id, professional_id, company_id, role_seeking,
        status, responded_at
    ` as {
      id: string
      professional_id: string
      company_id: string
      role_seeking: string
      status: string
      responded_at: string
    }[]

    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update introduction status' }, { status: 500 })
    }

    const updated = updatedRows[0]

    return NextResponse.json({
      message: 'Introduction accepted successfully',
      introduction: {
        id: updated.id,
        professionalId: updated.professional_id,
        companyId: updated.company_id,
        roleSeeking: updated.role_seeking,
        status: updated.status,
        respondedAt: updated.responded_at,
      },
    })
  } catch (error) {
    console.error('Error accepting introduction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
