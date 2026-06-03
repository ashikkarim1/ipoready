/**
 * Consent Letter Update Endpoint
 * PATCH /api/compliance/consents/:id - Update consent status and details
 */

import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// ============================================================================
// PATCH: Update consent status and details
// ============================================================================

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { status, document_url, expiry_date } = await req.json()

    // Validate status if provided
    const validStatuses = ['pending', 'received', 'rejected', 'expired', 'withdrawn']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Get the consent and verify company ownership
    const consentCheck = await sql`
      SELECT cl.id, cl.company_id
      FROM consent_letters cl
      JOIN companies c ON cl.company_id = c.id
      WHERE cl.id = ${id} AND c.created_by = ${(session.user as any).id}
      LIMIT 1
    `

    if (!consentCheck || consentCheck.length === 0) {
      return NextResponse.json(
        { error: 'Consent not found or unauthorized' },
        { status: 403 }
      )
    }

    // Build update query
    const updates: string[] = []
    const values: unknown[] = []

    if (status) {
      updates.push(`status = $${updates.length + 1}`)
      values.push(status)
    }

    if (document_url !== undefined) {
      updates.push(`document_url = $${updates.length + 1}`)
      values.push(document_url || null)
    }

    if (expiry_date !== undefined) {
      updates.push(`expiry_date = $${updates.length + 1}`)
      values.push(expiry_date || null)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    // Update the consent
    const query = `
      UPDATE consent_letters
      SET ${updates.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING 
        id,
        company_id,
        from_entity,
        entity_type,
        consent_type,
        status,
        document_url,
        expiry_date,
        created_at,
        updated_at
    `

    values.push(id)

    const updatedConsent = await sql.unsafe(query, values)

    // Log audit event
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (
        ${(session.user as any).id},
        'consent_letter_updated',
        ${JSON.stringify({
          consent_id: id,
          updated_fields: Object.keys({ status, document_url, expiry_date }).filter(
            (k) => eval(k) !== undefined
          ),
        })},
        ${req.headers.get('x-forwarded-for') || 'unknown'}
      )
    `

    return NextResponse.json({
      consent: updatedConsent[0],
      message: 'Consent updated successfully',
    })
  } catch (error) {
    console.error('Error updating consent:', error)
    return NextResponse.json(
      { error: 'Failed to update consent' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE: Remove a consent (soft delete via status)
// ============================================================================

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get the consent and verify company ownership
    const consentCheck = await sql`
      SELECT cl.id, cl.company_id
      FROM consent_letters cl
      JOIN companies c ON cl.company_id = c.id
      WHERE cl.id = ${id} AND c.created_by = ${(session.user as any).id}
      LIMIT 1
    `

    if (!consentCheck || consentCheck.length === 0) {
      return NextResponse.json(
        { error: 'Consent not found or unauthorized' },
        { status: 403 }
      )
    }

    // Mark as withdrawn instead of hard delete
    await sql`
      UPDATE consent_letters
      SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    // Log audit event
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (
        ${(session.user as any).id},
        'consent_letter_withdrawn',
        ${JSON.stringify({ consent_id: id })},
        ${req.headers.get('x-forwarded-for') || 'unknown'}
      )
    `

    return NextResponse.json({
      message: 'Consent withdrawn successfully',
    })
  } catch (error) {
    console.error('Error withdrawing consent:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw consent' },
      { status: 500 }
    )
  }
}
