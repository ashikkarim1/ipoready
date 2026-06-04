import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface VerifyRequest {
  professionalId: string
  status: 'verified' | 'rejected'
  notes?: string
}

/**
 * POST /api/professionals/verify
 * Admin-only endpoint to verify or reject professionals
 *
 * Requires:
 * - Session with admin role
 * - Professional ID
 * - Status (verified or rejected)
 * - Optional verification notes
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; role?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin role required' },
        { status: 403 }
      )
    }

    const body: VerifyRequest = await req.json()

    // Validate required fields
    if (!body.professionalId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: professionalId, status' },
        { status: 400 }
      )
    }

    // Validate status
    if (!['verified', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be either "verified" or "rejected"' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.professionalId)) {
      return NextResponse.json({ error: 'Invalid professional ID format' }, { status: 400 })
    }

    // Check if professional exists
    const existingRows = await sql`
      SELECT id, verification_status FROM professionals WHERE id = ${body.professionalId}
    ` as { id: string; verification_status: string }[]

    if (existingRows.length === 0) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Update professional verification status
    const updatedRows = await sql`
      UPDATE professionals
      SET
        verification_status = ${body.status},
        verification_notes = ${body.notes || null},
        verified_by_user_id = ${user.id},
        verified_at = NOW()
      WHERE id = ${body.professionalId}
      RETURNING
        id, name, email, professional_title,
        verification_status, verified_at
    ` as {
      id: string
      name: string
      email: string
      professional_title: string
      verification_status: string
      verified_at: string
    }[]

    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 })
    }

    const professional = updatedRows[0]

    return NextResponse.json({
      message: `Professional ${body.status} successfully`,
      professional: {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        professionalTitle: professional.professional_title,
        verificationStatus: professional.verification_status,
        verifiedAt: professional.verified_at,
      },
    })
  } catch (error) {
    console.error('Error verifying professional:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
