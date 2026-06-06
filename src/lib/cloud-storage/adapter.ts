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
 * Factory to get appropriate adapter
 */
export class CloudStorageAdapterFactory {
  static getAdapter(
    provider: 'google_drive' | 'dropbox' | 'onedrive' | 'box',
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): CloudStorageAdapter {
    switch (provider) {
      case 'google_drive':
        // Lazy import to avoid loading all adapters
        const GoogleDriveAdapter = require('./google-drive-adapter').GoogleDriveAdapter
        return new GoogleDriveAdapter(accessToken, refreshToken, expiresAt)

      case 'dropbox':
        const DropboxAdapter = require('./dropbox-adapter').DropboxAdapter
        return new DropboxAdapter(accessToken, refreshToken, expiresAt)

      case 'onedrive':
        const OneDriveAdapter = require('./onedrive-adapter').OneDriveAdapter
        return new OneDriveAdapter(accessToken, refreshToken, expiresAt)

      case 'box':
        const BoxAdapter = require('./box-adapter').BoxAdapter
        return new BoxAdapter(accessToken, refreshToken, expiresAt)

      default:
        throw new Error(`Unsupported cloud storage provider: ${provider}`)
    }
  }
}
