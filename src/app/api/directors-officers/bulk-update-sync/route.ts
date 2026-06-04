/**
 * PUT /api/directors-officers/bulk-update-sync
 *
 * Bulk update sync status for multiple directors
 * Used for marking stale, re-syncing, or updating section assignments
 *
 * Request Body:
 * {
 *   operation: "resync" | "mark_stale" | "update_section" | "clear_sync"
 *   directorIds: string[]
 *   prospectusDocumentId?: string
 *   sectionType?: string (for update_section operation)
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   operation: string
 *   updatedCount: number
 *   failedCount: number
 *   details: Array<{
 *     directorId: string
 *     status: "success" | "failed"
 *     message?: string
 *   }>
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

type SyncOperation = 'resync' | 'mark_stale' | 'update_section' | 'clear_sync'

interface UpdateDetail {
  directorId: string
  status: 'success' | 'failed'
  message?: string
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    operation: SyncOperation
    directorIds: string[]
    prospectusDocumentId?: string
    sectionType?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { operation, directorIds, prospectusDocumentId, sectionType } = body

  if (!operation || !['resync', 'mark_stale', 'update_section', 'clear_sync'].includes(operation)) {
    return NextResponse.json(
      { error: 'Invalid operation. Must be: resync, mark_stale, update_section, or clear_sync' },
      { status: 400 }
    )
  }

  if (!Array.isArray(directorIds) || directorIds.length === 0) {
    return NextResponse.json(
      { error: 'directorIds must be a non-empty array' },
      { status: 400 }
    )
  }

  if (operation === 'update_section' && !sectionType) {
    return NextResponse.json(
      { error: 'sectionType is required for update_section operation' },
      { status: 400 }
    )
  }

  try {
    const details: UpdateDetail[] = []
    let updatedCount = 0
    let failedCount = 0

    for (const directorId of directorIds) {
      try {
        switch (operation) {
          case 'resync': {
            // Update to "pending" sync status and reset sync timing
            await sql`
              UPDATE director_prospectus_sync
              SET
                sync_status = 'pending',
                last_sync_initiated_at = NOW(),
                is_stale = FALSE,
                stale_since = NULL,
                updated_by_user_id = ${user.id}
              WHERE professional_id = ${directorId}
                ${prospectusDocumentId ? sql`AND prospectus_document_id = ${prospectusDocumentId}` : sql``}
            `

            details.push({
              directorId,
              status: 'success',
              message: 'Marked for resync',
            })
            updatedCount++
            break
          }

          case 'mark_stale': {
            // Mark as stale with current timestamp
            await sql`
              UPDATE director_prospectus_sync
              SET
                is_stale = TRUE,
                stale_since = NOW(),
                sync_status = 'needs_update',
                updated_by_user_id = ${user.id}
              WHERE professional_id = ${directorId}
                ${prospectusDocumentId ? sql`AND prospectus_document_id = ${prospectusDocumentId}` : sql``}
            `

            details.push({
              directorId,
              status: 'success',
              message: 'Marked as stale',
            })
            updatedCount++
            break
          }

          case 'update_section': {
            // Update section type for this director
            if (!sectionType) {
              throw new Error('Section type required')
            }

            await sql`
              UPDATE director_prospectus_sync
              SET
                section_type = ${sectionType},
                updated_by_user_id = ${user.id}
              WHERE professional_id = ${directorId}
                ${prospectusDocumentId ? sql`AND prospectus_document_id = ${prospectusDocumentId}` : sql``}
            `

            details.push({
              directorId,
              status: 'success',
              message: `Updated to section: ${sectionType}`,
            })
            updatedCount++
            break
          }

          case 'clear_sync': {
            // Delete all sync records for this director
            await sql`
              DELETE FROM director_prospectus_sync
              WHERE professional_id = ${directorId}
                ${prospectusDocumentId ? sql`AND prospectus_document_id = ${prospectusDocumentId}` : sql``}
            `

            details.push({
              directorId,
              status: 'success',
              message: 'Sync records cleared',
            })
            updatedCount++
            break
          }
        }
      } catch (error) {
        console.error(`Error updating director ${directorId}:`, error)
        details.push({
          directorId,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
        failedCount++
      }
    }

    return NextResponse.json({
      success: failedCount === 0,
      operation,
      updatedCount,
      failedCount,
      details,
    })
  } catch (error) {
    console.error('Error in bulk update sync:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    )
  }
}
