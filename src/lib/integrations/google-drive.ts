/**
 * Google Drive Integration - OAuth2 & File Management
 * Complete backend implementation for Google Drive integration
 * Handles OAuth flow, token caching, file uploads, folder creation, metadata sync
 */

import crypto from 'crypto'
import { sql } from '@/lib/db'

const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2'
const GOOGLE_API_BASE = 'https://www.googleapis.com'
const GOOGLE_DRIVE_API = `${GOOGLE_API_BASE}/drive/v3`

/**
 * Google Drive OAuth Configuration
 */
export interface GoogleDriveOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * Google OAuth Token Response
 */
export interface GoogleOAuthTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token?: string
}

/**
 * Cached token stored in database
 */
export interface CachedGoogleToken {
  id: string
  company_id: string
  user_id: string
  access_token: string
  refresh_token: string | null
  expires_at: string
  scopes: string[]
  created_at: string
  updated_at: string
}

/**
 * Google Drive Connection stored in database
 */
export interface GoogleDriveConnection {
  id: string
  company_id: string
  user_id: string
  google_user_id: string
  email: string
  display_name: string
  profile_picture_url: string | null
  access_token: string
  refresh_token: string | null
  token_expires_at: string
  root_folder_id: string | null
  scopes: string[]
  is_active: boolean
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Google Drive file metadata
 */
export interface GoogleDriveFileMetadata {
  id: string
  name: string
  mimeType: string
  size: number
  createdTime: string
  modifiedTime: string
  parents?: string[]
  webViewLink?: string
  webContentLink?: string
  owners?: Array<{ displayName: string; emailAddress: string }>
  lastModifyingUser?: { displayName: string; emailAddress: string }
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  fileName: string
  fileContent: Buffer | string
  mimeType: string
  folderId?: string
  description?: string
}

/**
 * Folder creation request
 */
export interface FolderCreationRequest {
  folderName: string
  parentFolderId?: string
  description?: string
}

/**
 * Metadata sync item
 */
export interface MetadataSyncItem {
  fileId: string
  fileName: string
  mimeType: string
  size: number
  createdAt: string
  modifiedAt: string
  webViewLink: string
  parentFolderId?: string
}

/**
 * Get Google Drive OAuth configuration from environment
 */
export function getGoogleDriveOAuthConfig(): GoogleDriveOAuthConfig {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || ''
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || ''

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

/**
 * Generate OAuth authorization URL
 */
export function generateAuthorizationUrl(
  config: GoogleDriveOAuthConfig,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/drive',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${GOOGLE_OAUTH_BASE}/auth?${params.toString()}`
}

/**
 * Exchange OAuth code for tokens
 */
export async function exchangeAuthCodeForTokens(
  code: string,
  config: GoogleDriveOAuthConfig
): Promise<{
  success: boolean
  tokens?: GoogleOAuthTokenResponse
  error?: string
}> {
  try {
    const response = await fetch(`${GOOGLE_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error_description || 'Token exchange failed',
      }
    }

    const tokens = (await response.json()) as GoogleOAuthTokenResponse
    return { success: true, tokens }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Token exchange error',
    }
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  config: GoogleDriveOAuthConfig
): Promise<{
  success: boolean
  accessToken?: string
  expiresIn?: number
  error?: string
}> {
  try {
    const response = await fetch(`${GOOGLE_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error_description || 'Token refresh failed',
      }
    }

    const data = (await response.json()) as Partial<GoogleOAuthTokenResponse>
    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Token refresh error',
    }
  }
}

/**
 * Get user info from Google (email, name, etc.)
 */
export async function getUserInfo(accessToken: string): Promise<{
  success: boolean
  userInfo?: {
    id: string
    email: string
    name: string
    picture?: string
  }
  error?: string
}> {
  try {
    const response = await fetch(`${GOOGLE_API_BASE}/oauth2/v2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch user info: ${response.statusText}`,
      }
    }

    const userInfo = await response.json()
    return {
      success: true,
      userInfo: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'User info fetch error',
    }
  }
}

/**
 * Cache token in database with encryption
 */
export async function cacheGoogleToken(
  companyId: string,
  userId: string,
  tokens: GoogleOAuthTokenResponse,
  googleUserId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000)
    const encryptedAccessToken = encryptToken(tokens.access_token)
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : null

    await sql`
      INSERT INTO google_drive_tokens (
        company_id,
        user_id,
        google_user_id,
        access_token,
        refresh_token,
        expires_at,
        scopes,
        created_at,
        updated_at
      )
      VALUES (
        ${companyId},
        ${userId},
        ${googleUserId},
        ${encryptedAccessToken},
        ${encryptedRefreshToken},
        ${expiresAt.toISOString()},
        ${JSON.stringify(tokens.scope.split(' '))},
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id, user_id) DO UPDATE SET
        access_token = ${encryptedAccessToken},
        refresh_token = COALESCE(${encryptedRefreshToken}, google_drive_tokens.refresh_token),
        expires_at = ${expiresAt.toISOString()},
        updated_at = NOW()
    `

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Token cache error',
    }
  }
}

/**
 * Retrieve and decrypt cached token
 */
export async function getCachedGoogleToken(
  companyId: string,
  userId: string
): Promise<{
  success: boolean
  token?: CachedGoogleToken
  error?: string
}> {
  try {
    const result = await sql`
      SELECT
        id,
        company_id,
        user_id,
        access_token,
        refresh_token,
        expires_at,
        scopes,
        created_at,
        updated_at
      FROM google_drive_tokens
      WHERE company_id = ${companyId}
        AND user_id = ${userId}
      LIMIT 1
    `

    if (result.length === 0) {
      return {
        success: false,
        error: 'No cached token found',
      }
    }

    const row = result[0] as any
    return {
      success: true,
      token: {
        id: row.id,
        company_id: row.company_id,
        user_id: row.user_id,
        access_token: decryptToken(row.access_token),
        refresh_token: row.refresh_token ? decryptToken(row.refresh_token) : null,
        expires_at: row.expires_at,
        scopes: row.scopes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Token retrieval error',
    }
  }
}

/**
 * Store or update Google Drive connection
 */
export async function storeGoogleDriveConnection(
  companyId: string,
  userId: string,
  connectionData: {
    googleUserId: string
    email: string
    displayName: string
    profilePictureUrl?: string
    accessToken: string
    refreshToken?: string
    expiresAt: string
    scopes: string[]
  }
): Promise<{
  success: boolean
  connectionId?: string
  error?: string
}> {
  try {
    const encryptedAccessToken = encryptToken(connectionData.accessToken)
    const encryptedRefreshToken = connectionData.refreshToken
      ? encryptToken(connectionData.refreshToken)
      : null

    const result = await sql`
      INSERT INTO google_drive_connections (
        company_id,
        user_id,
        google_user_id,
        email,
        display_name,
        profile_picture_url,
        access_token,
        refresh_token,
        token_expires_at,
        scopes,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${companyId},
        ${userId},
        ${connectionData.googleUserId},
        ${connectionData.email},
        ${connectionData.displayName},
        ${connectionData.profilePictureUrl || null},
        ${encryptedAccessToken},
        ${encryptedRefreshToken},
        ${connectionData.expiresAt},
        ${JSON.stringify(connectionData.scopes)},
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id, user_id) DO UPDATE SET
        google_user_id = ${connectionData.googleUserId},
        email = ${connectionData.email},
        display_name = ${connectionData.displayName},
        profile_picture_url = ${connectionData.profilePictureUrl || null},
        access_token = ${encryptedAccessToken},
        refresh_token = COALESCE(${encryptedRefreshToken}, google_drive_connections.refresh_token),
        token_expires_at = ${connectionData.expiresAt},
        scopes = ${JSON.stringify(connectionData.scopes)},
        is_active = true,
        updated_at = NOW()
      RETURNING id
    `

    const connectionId = (result[0] as any).id
    return { success: true, connectionId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Connection storage error',
    }
  }
}

/**
 * Get Google Drive connection
 */
export async function getGoogleDriveConnection(
  companyId: string,
  userId: string
): Promise<{
  success: boolean
  connection?: Omit<GoogleDriveConnection, 'access_token' | 'refresh_token'> & {
    access_token: string
    refresh_token: string | null
  }
  error?: string
}> {
  try {
    const result = await sql`
      SELECT
        id,
        company_id,
        user_id,
        google_user_id,
        email,
        display_name,
        profile_picture_url,
        access_token,
        refresh_token,
        token_expires_at,
        root_folder_id,
        scopes,
        is_active,
        last_sync_at,
        created_at,
        updated_at
      FROM google_drive_connections
      WHERE company_id = ${companyId}
        AND user_id = ${userId}
      LIMIT 1
    `

    if (result.length === 0) {
      return {
        success: false,
        error: 'No connection found',
      }
    }

    const row = result[0] as any
    return {
      success: true,
      connection: {
        id: row.id,
        company_id: row.company_id,
        user_id: row.user_id,
        google_user_id: row.google_user_id,
        email: row.email,
        display_name: row.display_name,
        profile_picture_url: row.profile_picture_url,
        access_token: decryptToken(row.access_token),
        refresh_token: row.refresh_token ? decryptToken(row.refresh_token) : null,
        token_expires_at: row.token_expires_at,
        root_folder_id: row.root_folder_id,
        scopes: row.scopes,
        is_active: row.is_active,
        last_sync_at: row.last_sync_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Connection retrieval error',
    }
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadFileToGoogleDrive(
  accessToken: string,
  request: FileUploadRequest
): Promise<{
  success: boolean
  fileId?: string
  fileMetadata?: GoogleDriveFileMetadata
  error?: string
}> {
  try {
    const boundary = `----WebKitFormBoundary${crypto
      .randomBytes(16)
      .toString('hex')}`

    const fileContent =
      typeof request.fileContent === 'string'
        ? Buffer.from(request.fileContent)
        : request.fileContent

    let body = `--${boundary}\r\n`
    body += 'Content-Type: application/json; charset=UTF-8\r\n\r\n'
    body += JSON.stringify({
      name: request.fileName,
      description: request.description || '',
      ...(request.folderId && { parents: [request.folderId] }),
    })
    body += '\r\n'
    body += `--${boundary}\r\n`
    body += `Content-Type: ${request.mimeType}\r\n\r\n`

    const footerBytes = Buffer.from(`\r\n--${boundary}--`)
    const headerBytes = Buffer.from(body)
    const bodyBytes = Buffer.concat([headerBytes, fileContent, footerBytes])

    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?uploadType=multipart&supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: bodyBytes,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error?.message || 'File upload failed',
      }
    }

    const metadata = (await response.json()) as GoogleDriveFileMetadata
    return { success: true, fileId: metadata.id, fileMetadata: metadata }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'File upload error',
    }
  }
}

/**
 * Create folder in Google Drive
 */
export async function createFolderInGoogleDrive(
  accessToken: string,
  request: FolderCreationRequest
): Promise<{
  success: boolean
  folderId?: string
  error?: string
}> {
  try {
    const metadata = {
      name: request.folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: request.description || '',
      ...(request.parentFolderId && { parents: [request.parentFolderId] }),
    }

    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error?.message || 'Folder creation failed',
      }
    }

    const result = await response.json()
    return { success: true, folderId: result.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Folder creation error',
    }
  }
}

/**
 * List files in a Google Drive folder
 */
export async function listFilesInFolder(
  accessToken: string,
  folderId: string
): Promise<{
  success: boolean
  files?: GoogleDriveFileMetadata[]
  error?: string
}> {
  try {
    const query = `'${folderId}' in parents and trashed=false`
    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?q=${encodeURIComponent(query)}&spaces=drive&supportsAllDrives=true&pageSize=1000&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,owners,lastModifyingUser)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error?.message || 'Failed to list files',
      }
    }

    const data = await response.json()
    return { success: true, files: data.files || [] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'File listing error',
    }
  }
}

/**
 * Sync file metadata to database
 */
export async function syncFileMetadataToDatabase(
  companyId: string,
  connectionId: string,
  files: GoogleDriveFileMetadata[]
): Promise<{
  success: boolean
  syncedCount?: number
  error?: string
}> {
  try {
    let syncedCount = 0

    for (const file of files) {
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
          ${connectionId},
          ${companyId},
          ${file.id},
          ${file.name},
          ${file.mimeType},
          ${file.size},
          ${file.createdTime},
          ${file.modifiedTime},
          ${file.webViewLink || null},
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (connection_id, file_id) DO UPDATE SET
          file_name = ${file.name},
          mime_type = ${file.mimeType},
          size_bytes = ${file.size},
          google_modified_at = ${file.modifiedTime},
          web_view_link = ${file.webViewLink || null},
          last_synced_at = NOW(),
          updated_at = NOW()
      `
      syncedCount++
    }

    // Update connection's last_sync_at
    await sql`
      UPDATE google_drive_connections
      SET last_sync_at = NOW()
      WHERE id = ${connectionId}
    `

    return { success: true, syncedCount }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Metadata sync error',
    }
  }
}

/**
 * Encrypt token using standard Node crypto (AES-256-GCM)
 * Uses environment variable ENCRYPTION_KEY
 */
function encryptToken(token: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  const key = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()
  const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted

  return combined
}

/**
 * Decrypt token using standard Node crypto
 */
function decryptToken(encryptedData: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  const key = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest()

  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Disconnect Google Drive account
 */
export async function disconnectGoogleDrive(
  companyId: string,
  userId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await sql`
      UPDATE google_drive_connections
      SET is_active = false, updated_at = NOW()
      WHERE company_id = ${companyId}
        AND user_id = ${userId}
    `

    await sql`
      DELETE FROM google_drive_tokens
      WHERE company_id = ${companyId}
        AND user_id = ${userId}
    `

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Disconnection error',
    }
  }
}
