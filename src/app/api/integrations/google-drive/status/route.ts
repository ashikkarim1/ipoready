/**
 * Google Drive Connection Status
 * GET /api/integrations/google-drive/status
 * Returns current connection status and metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getGoogleDriveConnection } from '@/lib/integrations/google-drive'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Get connection details
    const connectionResult = await getGoogleDriveConnection(companyId, userId)

    if (!connectionResult.success || !connectionResult.connection) {
      return NextResponse.json({
        connected: false,
        message: 'Google Drive not connected',
      })
    }

    const connection = connectionResult.connection
    const now = new Date()
    const expiresAt = new Date(connection.token_expires_at)
    const isTokenExpired = now >= expiresAt

    // Get file statistics
    const statsResult = await sql`
      SELECT
        COUNT(*) as total_files,
        COALESCE(SUM(size_bytes), 0) as total_size_bytes,
        MAX(last_synced_at) as last_synced_at,
        COUNT(CASE WHEN mime_type = 'application/vnd.google-apps.folder' THEN 1 END) as folder_count,
        COUNT(CASE WHEN mime_type != 'application/vnd.google-apps.folder' THEN 1 END) as file_count
      FROM google_drive_files
      WHERE connection_id = ${connection.id}
        AND company_id = ${companyId}
    `

    const stats = (statsResult[0] || {}) as any

    return NextResponse.json({
      connected: true,
      connection: {
        id: connection.id,
        email: connection.email,
        displayName: connection.display_name,
        profilePictureUrl: connection.profile_picture_url,
        googleUserId: connection.google_user_id,
        isActive: connection.is_active,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
      },
      token: {
        expiresAt: connection.token_expires_at,
        isExpired: isTokenExpired,
        scopes: connection.scopes,
      },
      sync: {
        lastSyncAt: stats.last_synced_at,
        lastSyncAgo: stats.last_synced_at
          ? Math.round((Date.now() - new Date(stats.last_synced_at).getTime()) / 1000)
          : null,
      },
      files: {
        totalFiles: Number(stats.total_files) || 0,
        totalFolders: Number(stats.folder_count) || 0,
        totalSizeBytes: Number(stats.total_size_bytes) || 0,
        totalSizeMB: Math.round(Number(stats.total_size_bytes || 0) / 1024 / 1024),
      },
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive status] Error:', errorMsg)

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
