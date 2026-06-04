/**
 * Google Drive Integration Main Routes
 * GET  /api/integrations/google-drive - Get authorization URL or connection status
 * POST /api/integrations/google-drive - File upload or folder creation
 * DELETE /api/integrations/google-drive - Disconnect Google Drive
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  generateAuthorizationUrl,
  getGoogleDriveOAuthConfig,
  uploadFileToGoogleDrive,
  createFolderInGoogleDrive,
  getGoogleDriveConnection,
  disconnectGoogleDrive,
} from '@/lib/integrations/google-drive'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET - Generate authorization URL or get current status
 */
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

    // Check if already connected
    const connectionResult = await getGoogleDriveConnection(
      user.companyId,
      user.id
    )

    if (connectionResult.success && connectionResult.connection) {
      return NextResponse.json({
        connected: true,
        email: connectionResult.connection.email,
        displayName: connectionResult.connection.display_name,
        isActive: connectionResult.connection.is_active,
      })
    }

    // Generate authorization URL
    const config = getGoogleDriveOAuthConfig()
    if (!config.clientId || !config.redirectUri) {
      return NextResponse.json(
        { error: 'Google Drive OAuth not configured' },
        { status: 500 }
      )
    }

    const state = crypto.randomBytes(32).toString('hex')

    // Store state in database for verification
    await sql`
      INSERT INTO oauth_states (state, purpose, company_id, user_id, expires_at)
      VALUES (${state}, 'google_drive', ${user.companyId}, ${user.id}, NOW() + INTERVAL '10 minutes')
    `

    const authUrl = generateAuthorizationUrl(config, state)

    return NextResponse.json({
      connected: false,
      authorizationUrl: authUrl,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive get] Error:', errorMsg)

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}

/**
 * POST - Upload file or create folder
 */
export async function POST(request: NextRequest) {
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

    // Get connection
    const connectionResult = await getGoogleDriveConnection(companyId, userId)
    if (!connectionResult.success || !connectionResult.connection) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 404 }
      )
    }

    const connection = connectionResult.connection
    const accessToken = connection.access_token

    // Parse request body
    const contentType = request.headers.get('content-type')
    let body: any

    if (contentType?.includes('application/json')) {
      body = await request.json()
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = {
        action: formData.get('action'),
        fileName: formData.get('fileName'),
        mimeType: formData.get('mimeType'),
        folderName: formData.get('folderName'),
        folderId: formData.get('folderId'),
        description: formData.get('description'),
        file: formData.get('file'),
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    // Handle file upload
    if (body.action === 'upload' || body.file) {
      if (!body.file && !body.fileName) {
        return NextResponse.json(
          { error: 'Missing file or fileName' },
          { status: 400 }
        )
      }

      let fileContent: Buffer | string
      let fileName = body.fileName

      if (body.file instanceof File) {
        fileContent = Buffer.from(await body.file.arrayBuffer())
        fileName = body.file.name || fileName
      } else if (typeof body.fileContent === 'string') {
        fileContent = body.fileContent
      } else {
        return NextResponse.json(
          { error: 'Invalid file content' },
          { status: 400 }
        )
      }

      const uploadResult = await uploadFileToGoogleDrive(accessToken, {
        fileName,
        fileContent,
        mimeType: body.mimeType || 'application/octet-stream',
        folderId: body.folderId,
        description: body.description,
      })

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || 'File upload failed' },
          { status: 500 }
        )
      }

      // Store file metadata in database
      if (uploadResult.fileMetadata) {
        const metadata = uploadResult.fileMetadata
        await sql`
          INSERT INTO google_drive_files (
            connection_id,
            company_id,
            file_id,
            file_name,
            mime_type,
            size_bytes,
            google_created_at,
            google_modified_at,
            web_view_link,
            last_synced_at,
            created_at,
            updated_at
          )
          VALUES (
            ${connection.id},
            ${companyId},
            ${metadata.id},
            ${metadata.name},
            ${metadata.mimeType},
            ${metadata.size},
            ${metadata.createdTime},
            ${metadata.modifiedTime},
            ${metadata.webViewLink || null},
            NOW(),
            NOW(),
            NOW()
          )
          ON CONFLICT (connection_id, file_id) DO UPDATE SET
            file_name = ${metadata.name},
            mime_type = ${metadata.mimeType},
            size_bytes = ${metadata.size},
            google_modified_at = ${metadata.modifiedTime},
            web_view_link = ${metadata.webViewLink || null},
            last_synced_at = NOW(),
            updated_at = NOW()
        `
      }

      return NextResponse.json({
        success: true,
        fileId: uploadResult.fileId,
        message: 'File uploaded successfully',
        fileMetadata: uploadResult.fileMetadata,
      })
    }

    // Handle folder creation
    if (body.action === 'create_folder' || body.folderName) {
      if (!body.folderName) {
        return NextResponse.json(
          { error: 'Missing folderName' },
          { status: 400 }
        )
      }

      const folderResult = await createFolderInGoogleDrive(accessToken, {
        folderName: body.folderName,
        parentFolderId: body.folderId,
        description: body.description,
      })

      if (!folderResult.success) {
        return NextResponse.json(
          { error: folderResult.error || 'Folder creation failed' },
          { status: 500 }
        )
      }

      // Store folder metadata in database
      await sql`
        INSERT INTO google_drive_files (
          connection_id,
          company_id,
          file_id,
          file_name,
          mime_type,
          size_bytes,
          google_created_at,
          google_modified_at,
          last_synced_at,
          created_at,
          updated_at
        )
        VALUES (
          ${connection.id},
          ${companyId},
          ${folderResult.folderId},
          ${body.folderName},
          'application/vnd.google-apps.folder',
          0,
          NOW(),
          NOW(),
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (connection_id, file_id) DO UPDATE SET
          file_name = ${body.folderName},
          updated_at = NOW()
      `

      return NextResponse.json({
        success: true,
        folderId: folderResult.folderId,
        message: 'Folder created successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive post] Error:', errorMsg)

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Disconnect Google Drive
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await disconnectGoogleDrive(user.companyId, user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Disconnection failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Google Drive disconnected successfully',
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[google-drive delete] Error:', errorMsg)

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
