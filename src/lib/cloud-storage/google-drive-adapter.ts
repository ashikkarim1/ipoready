'use server'

import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

/**
 * Google Drive Cloud Storage Adapter
 * Implements BaseCloudStorageAdapter interface for Google Drive
 *
 * ⚠️  Server-only: Uses Node.js modules (net, fs, tls)
 */

interface DriveFile {
  id: string
  name: string
  mimeType: string
  fileSize: string
  createdTime: string
  modifiedTime: string
  webViewLink: string
}

interface DriveFolder {
  id: string
  name: string
  mimeType: string
  createdTime: string
  webViewLink: string
}

export class GoogleDriveAdapter {
  private oauth2Client: OAuth2Client
  private drive: any

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client })
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      const query = folderId
        ? `'${folderId}' in parents and trashed=false`
        : `trashed=false and 'me' in owners`

      const result = await this.drive.files.list({
        q: query,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
        pageSize: 100,
      })

      return result.data.files || []
    } catch (error) {
      console.error('Google Drive listFiles error:', error)
      throw error
    }
  }

  /**
   * Read file content
   */
  async readFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      )

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        response.data.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
        })
        response.data.on('end', () => {
          resolve(Buffer.concat(chunks))
        })
        response.data.on('error', reject)
      })
    } catch (error) {
      console.error('Google Drive readFile error:', error)
      throw error
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    fileName: string,
    fileContent: Buffer,
    folderId?: string,
    mimeType: string = 'application/octet-stream'
  ): Promise<string> {
    try {
      const fileMetadata: any = {
        name: fileName,
      }

      if (folderId) {
        fileMetadata.parents = [folderId]
      }

      const media = {
        mimeType,
        body: fileContent,
      }

      const result = await this.drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id',
      })

      return result.data.id
    } catch (error) {
      console.error('Google Drive uploadFile error:', error)
      throw error
    }
  }

  /**
   * Update file
   */
  async updateFile(
    fileId: string,
    fileContent: Buffer,
    mimeType: string = 'application/octet-stream'
  ): Promise<void> {
    try {
      const media = {
        mimeType,
        body: fileContent,
      }

      await this.drive.files.update({
        fileId,
        media,
      })
    } catch (error) {
      console.error('Google Drive updateFile error:', error)
      throw error
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId })
    } catch (error) {
      console.error('Google Drive deleteFile error:', error)
      throw error
    }
  }

  /**
   * Create folder
   */
  async createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<string> {
    try {
      const fileMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId]
      }

      const result = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      })

      return result.data.id
    } catch (error) {
      console.error('Google Drive createFolder error:', error)
      throw error
    }
  }

  /**
   * Share file with specific permissions
   */
  async shareFile(
    fileId: string,
    emailAddress: string,
    role: 'viewer' | 'commenter' | 'editor' = 'viewer'
  ): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId,
        resource: {
          type: 'user',
          role,
          emailAddress,
        },
      })
    } catch (error) {
      console.error('Google Drive shareFile error:', error)
      throw error
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<DriveFile> {
    try {
      const result = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink',
      })

      return result.data
    } catch (error) {
      console.error('Google Drive getFileMetadata error:', error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const result = await this.oauth2Client.refreshAccessToken()
      const newAccessToken = result.credentials.access_token

      if (newAccessToken) {
        this.oauth2Client.setCredentials({
          access_token: newAccessToken,
        })
      }

      return newAccessToken || ''
    } catch (error) {
      console.error('Google Drive refreshToken error:', error)
      throw error
    }
  }

  /**
   * Sync files from a folder to unified_documents
   */
  async syncFolder(
    folderId: string,
    companyId: string,
    db: any
  ): Promise<number> {
    try {
      const files = await this.listFiles(folderId)
      let syncCount = 0

      for (const file of files) {
        // Skip folders during sync
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          continue
        }

        // Check if document already exists
        const existing = await db.query(
          `SELECT id FROM unified_documents
           WHERE company_id = $1 AND storage_id = $2`,
          [companyId, file.id]
        )

        if (existing.rows.length === 0) {
          // Create new document record
          await db.query(
            `INSERT INTO unified_documents
             (company_id, name, mime_type, storage_provider, storage_id,
              file_size, uploaded_at, created_at, updated_at, status, owner_user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              companyId,
              file.name,
              file.mimeType,
              'google_drive',
              file.id,
              file.fileSize || 0,
              file.createdTime,
              new Date(),
              new Date(),
              'draft',
              null, // Will be set by caller
            ]
          )
          syncCount++
        }
      }

      return syncCount
    } catch (error) {
      console.error('Google Drive syncFolder error:', error)
      throw error
    }
  }
}

/**
 * Generate OAuth2 authorization URL for Google Drive
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  )

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ],
  })
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    )

    const { tokens } = await oauth2Client.getToken(code)

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    }
  } catch (error) {
    console.error('Exchange code for token error:', error)
    throw error
  }
}
