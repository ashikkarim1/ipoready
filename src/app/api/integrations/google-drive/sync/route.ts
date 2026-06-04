/**
 * Google Drive File Sync Trigger
 * POST /api/integrations/google-drive/sync
 * Triggers automatic sync of Google Drive files and metadata to database
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  getGoogleDriveConnection,
  getCachedGoogleToken,
  refreshAccessToken,
  getGoogleDriveOAuthConfig,
  listFilesInFolder,
  syncFileMetadataToDatabase,
} from '@/lib/integrations/google-drive'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = user.companyId
    const userId = user.id

    // Get connection
    const connectionResult = await getGoogleDriveConnection(companyId, userId)
    if (!connectionResult.success || !connectionResult.connection) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 404 }
      )
    }

    const connection = connectionResult.connection

    // Check if token is expired and refresh if needed
    let accessToken = connection.access_token
    const expiresAt = new Date(connection.token_expires_at)
    const now = new Date()

    if (now >= expiresAt && connection.refresh_token) {
      const config = getGoogleDriveOAuthConfig()
      const refreshResult = await refreshAccessToken(
        connection.refresh_token,
        config
      )

      if (refreshResult.success && refreshResult.accessToken) {
        accessToken = refreshResult.accessToken

        // Update the token in database
        const newExpiresAt = new Date(
          Date.now() + (refreshResult.expiresIn || 3600) * 1000
        )
        await sql`
          UPDATE google_drive_connections
          SET token_expires_at = ${newExpiresAt.toISOString()},
              updated_at = NOW()
          WHERE id = ${connection.id}
        `
      } else {
        return NextResponse.json(
          { error: 'Failed to refresh access token' },
          { status: 401 }
        )
      }
    }

    // Get root folder ID or use "root" (My Drive)
    const folderId = connection.root_folder_id || 'root'

    // List files from Google Drive
    const filesResult = await listFilesInFolder(accessToken, folderId)
    if (!filesResult.success || !filesResult.files) {
      return NextResponse.json(
        { error: filesResult.error || 'Failed to list files' },
        { status: 500 }
      )
    }

    const files = filesResult.files

    // Sync metadata to database
    const syncResult = await syncFileMetadataToDatabase(
      companyId,
      connection.id,
      files
    )

    if (!syncResult.success) {
      return NextResponse.json(
        { error: syncResult.error || 'Failed to sync metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Files synced successfully',
      synced_count: syncResult.syncedCount,
      files_count: files.length,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive sync] Error:', errorMsg)

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = user.companyId
    const userId = user.id

    // Get sync status from database
    const result = await sql`
      SELECT
        gdc.id,
        gdc.email,
        gdc.display_name,
        gdc.token_expires_at,
        gdc.is_active,
        gdc.last_sync_at,
        COUNT(gdf.id) as file_count
      FROM google_drive_connections gdc
      LEFT JOIN google_drive_files gdf ON gdc.id = gdf.connection_id
      WHERE gdc.company_id = ${companyId}
        AND gdc.user_id = ${userId}
      GROUP BY gdc.id, gdc.email, gdc.display_name, gdc.token_expires_at, gdc.is_active, gdc.last_sync_at
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(
        { connected: false, message: 'Google Drive not connected' },
        { status: 404 }
      )
    }

    const row = result[0] as any
    const expiresAt = new Date(row.token_expires_at)
    const now = new Date()
    const isExpired = now >= expiresAt

    return NextResponse.json({
      connected: true,
      email: row.email,
      display_name: row.display_name,
      is_active: row.is_active,
      is_token_expired: isExpired,
      token_expires_at: row.token_expires_at,
      last_sync_at: row.last_sync_at,
      file_count: Number(row.file_count) || 0,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive sync get] Error:', errorMsg)

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
