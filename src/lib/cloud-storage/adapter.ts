/**
 * Cloud Storage Adapter Interface
 *
 * Unified interface for all cloud storage providers
 * Implementations: Google Drive, Dropbox, OneDrive, Box
 */

export interface FileMetadata {
  id: string
  name: string
  mimeType: string
  sizeBytes: number
  createdAt: Date
  modifiedAt: Date
  parentFolderId: string
  isFolder: boolean
  webViewLink?: string
  downloadLink?: string
}

export interface FolderMetadata {
  id: string
  name: string
  parentFolderId?: string
  createdAt: Date
  filesCount: number
  subFoldersCount: number
}

export interface UploadOptions {
  name: string
  folderId: string
  mimeType?: string
  description?: string
}

export interface ListOptions {
  folderId: string
  recursive?: boolean
  pageSize?: number
}

export interface SearchOptions {
  query: string
  folderId?: string
  mimeType?: string
}

/**
 * Abstract base class for cloud storage adapters
 * All adapters must implement these methods
 */
export abstract class CloudStorageAdapter {
  protected accessToken: string
  protected refreshToken?: string
  protected expiresAt?: Date

  constructor(accessToken: string, refreshToken?: string, expiresAt?: Date) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.expiresAt = expiresAt
  }

  /**
   * Refresh access token if expired
   */
  abstract refreshAccessToken(): Promise<string>

  /**
   * Read file contents as buffer
   */
  abstract readFile(fileId: string): Promise<Buffer>

  /**
   * List files in folder
   */
  abstract listFiles(options: ListOptions): Promise<FileMetadata[]>

  /**
   * Get file metadata without downloading
   */
  abstract getFileMetadata(fileId: string): Promise<FileMetadata>

  /**
   * Search for files across provider
   */
  abstract searchFiles(options: SearchOptions): Promise<FileMetadata[]>

  /**
   * Upload file to cloud
   */
  abstract uploadFile(file: File | Buffer, options: UploadOptions): Promise<FileMetadata>

  /**
   * Update existing file (new version)
   */
  abstract updateFile(fileId: string, file: File | Buffer): Promise<FileMetadata>

  /**
   * Delete file from cloud
   */
  abstract deleteFile(fileId: string): Promise<void>

  /**
   * Move file to different folder
   */
  abstract moveFile(fileId: string, targetFolderId: string): Promise<void>

  /**
   * Create folder
   */
  abstract createFolder(parentFolderId: string, name: string): Promise<FolderMetadata>

  /**
   * Delete folder
   */
  abstract deleteFolder(folderId: string, recursive?: boolean): Promise<void>

  /**
   * Rename folder
   */
  abstract renameFolder(folderId: string, newName: string): Promise<void>

  /**
   * Get file preview/thumbnail
   */
  abstract getFilePreview(fileId: string): Promise<Buffer | string>

  /**
   * Share file with user (optional, returns share link)
   */
  abstract shareFile(fileId: string, email?: string): Promise<string>
}

/**
 * Stub implementations for adapters not yet built (Dropbox, OneDrive, Box)
 * These prevent build-time errors until implementations are added in Phase 1, Week 2+
 */
class StubAdapter extends CloudStorageAdapter {
  private providerName: string

  constructor(
    providerName: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ) {
    super(accessToken, refreshToken, expiresAt)
    this.providerName = providerName
  }

  async refreshAccessToken(): Promise<string> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async readFile(): Promise<Buffer> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async listFiles(): Promise<FileMetadata[]> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async getFileMetadata(): Promise<FileMetadata> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async searchFiles(): Promise<FileMetadata[]> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async uploadFile(): Promise<FileMetadata> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async updateFile(): Promise<FileMetadata> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async deleteFile(): Promise<void> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async moveFile(): Promise<void> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async createFolder(): Promise<FolderMetadata> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async deleteFolder(): Promise<void> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async renameFolder(): Promise<void> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async getFilePreview(): Promise<Buffer | string> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }

  async shareFile(): Promise<string> {
    throw new Error(`${this.providerName} adapter not yet implemented`)
  }
}

/**
 * Factory to get appropriate adapter
 * Phase 1: Google Drive only. Other adapters coming Week 2+
 */
export class CloudStorageAdapterFactory {
  /**
   * Synchronous factory for Google Drive (Phase 1)
   * Server-only: googleapis requires Node.js modules
   */
  static createGoogleDriveAdapter(
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): CloudStorageAdapter {
    // This is server-only code - will only run on server
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const mod = require('./google-drive-adapter')
    const GoogleDriveAdapter = mod.GoogleDriveAdapter || mod.default
    if (!GoogleDriveAdapter) {
      throw new Error('Failed to load GoogleDriveAdapter')
    }
    return new GoogleDriveAdapter(accessToken, refreshToken, expiresAt)
  }

  /**
   * Get adapter by provider (Phase 1 - Google Drive only)
   */
  static getAdapter(
    provider: 'google_drive' | 'dropbox' | 'onedrive' | 'box',
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): CloudStorageAdapter {
    if (provider === 'google_drive') {
      return this.createGoogleDriveAdapter(accessToken, refreshToken, expiresAt)
    }
    // Return stub for unimplemented providers
    return new StubAdapter(
      provider.replace('_', ' ').toUpperCase(),
      accessToken,
      refreshToken,
      expiresAt
    )
  }

  /**
   * Async factory for future use (Dropbox, OneDrive, Box)
   */
  static async getAdapterAsync(
    provider: 'google_drive' | 'dropbox' | 'onedrive' | 'box',
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<CloudStorageAdapter> {
    switch (provider) {
      case 'google_drive': {
        return this.createGoogleDriveAdapter(accessToken, refreshToken, expiresAt)
      }

      case 'dropbox': {
        // Coming Phase 1, Week 2
        try {
          // eslint-disable-next-line global-require
          const { DropboxAdapter } = require('./dropbox-adapter')
          return new DropboxAdapter(accessToken, refreshToken, expiresAt)
        } catch {
          throw new Error('Dropbox adapter not yet implemented. Coming Phase 1, Week 2.')
        }
      }

      case 'onedrive': {
        // Coming Phase 1, Week 2
        try {
          // eslint-disable-next-line global-require
          const { OneDriveAdapter } = require('./onedrive-adapter')
          return new OneDriveAdapter(accessToken, refreshToken, expiresAt)
        } catch {
          throw new Error('OneDrive adapter not yet implemented. Coming Phase 1, Week 2.')
        }
      }

      case 'box': {
        // Coming Phase 1, Week 3
        try {
          // eslint-disable-next-line global-require
          const { BoxAdapter } = require('./box-adapter')
          return new BoxAdapter(accessToken, refreshToken, expiresAt)
        } catch {
          throw new Error('Box adapter not yet implemented. Coming Phase 1, Week 3.')
        }
      }

      default:
        throw new Error(`Unsupported cloud storage provider: ${provider}`)
    }
  }
}
