'use server'

/**
 * Unified Document Service - Single Source of Truth
 *
 * All document operations flow through this service
 * Ensures consistency across all pages (documents, data room, etc.)
 */

import { sql } from '@/lib/db'
import { CloudStorageAdapterFactory, type FileMetadata } from '@/lib/cloud-storage/adapter'

export interface UnifiedDocument {
  id: string
  companyId: string

  // Identity
  name: string
  displayName: string
  description?: string
  mimeType: string

  // Storage
  storageProvider: 'local' | 'google_drive' | 'dropbox' | 'onedrive' | 'box'
  storageId?: string                    // File ID in cloud service
  cloudPath?: string
  fileSize: number

  // Classification
  category: 'financial' | 'legal' | 'governance' | 'operational' | 'hr' | 'other'
  subcategory?: string
  documentType?: string

  // Status & Lifecycle
  status: 'draft' | 'in_review' | 'approved' | 'archived'
  completeness: number                  // 0-100
  complianceStatus: 'compliant' | 'warnings' | 'issues'
  requiredForFiling: boolean

  // Versioning
  currentVersion: number
  totalVersions: number
  previousVersionIds?: string[]

  // Metadata
  uploadedBy: string
  uploadedAt: Date
  lastModifiedBy: string
  lastModifiedAt: Date
  approvedBy?: string
  approvedAt?: Date

  // Access Control
  ownerUserId: string

  // Relationships
  parentFolderId?: string               // Data room folder
  relatedDocuments?: string[]

  // Comments
  commentCount: number
  lastComment?: {
    author: string
    date: Date
    text: string
  }
}

export interface DocumentFilter {
  companyId: string
  category?: string
  status?: string
  folderId?: string
  documentType?: string
  requiredForFiling?: boolean
}

export interface DocumentUploadOptions {
  displayName?: string
  description?: string
  category: string
  subcategory?: string
  documentType?: string
  requiredForFiling?: boolean
  storageProvider?: 'google_drive' | 'dropbox' | 'onedrive' | 'box'
  parentFolderId?: string
}

export class UnifiedDocumentService {
  /**
   * Get single document by ID
   * Works across all cloud providers
   */
  static async getDocument(documentId: string): Promise<UnifiedDocument | null> {
    try {
      const result = await sql`
        SELECT * FROM unified_documents
        WHERE id = ${documentId}
      `

      if (result.length === 0) return null
      return this.mapRowToDocument(result[0])
    } catch (err) {
      console.error('[document-service] Failed to get document:', err)
      throw err
    }
  }

  /**
   * List documents for company
   * Single query to unified_documents table = consistent results everywhere
   */
  static async listDocuments(filter: DocumentFilter): Promise<UnifiedDocument[]> {
    try {
      let query = 'SELECT * FROM unified_documents WHERE company_id = $1'
      const params: any[] = [filter.companyId]

      if (filter.category) {
        query += ` AND category = $${params.length + 1}`
        params.push(filter.category)
      }

      if (filter.status) {
        query += ` AND status = $${params.length + 1}`
        params.push(filter.status)
      }

      if (filter.folderId) {
        query += ` AND parent_folder_id = $${params.length + 1}`
        params.push(filter.folderId)
      }

      if (filter.documentType) {
        query += ` AND document_type = $${params.length + 1}`
        params.push(filter.documentType)
      }

      if (filter.requiredForFiling !== undefined) {
        query += ` AND required_for_filing = $${params.length + 1}`
        params.push(filter.requiredForFiling)
      }

      query += ' ORDER BY uploaded_at DESC'

      const results = await sql.query(query, params)
      return results.map(row => this.mapRowToDocument(row))
    } catch (err) {
      console.error('[document-service] Failed to list documents:', err)
      throw err
    }
  }

  /**
   * Upload document to cloud + sync to DB
   * This is the primary upload method - ensures consistency
   */
  static async uploadDocument(
    companyId: string,
    file: File,
    options: DocumentUploadOptions,
    userId: string
  ): Promise<UnifiedDocument> {
    try {
      const storageProvider = options.storageProvider || 'google_drive'

      // Get cloud credentials for company
      const credentials = await this.getProviderCredentials(companyId, storageProvider)
      // Phase 1: Google Drive only
      if (storageProvider !== 'google_drive') {
        throw new Error(`${storageProvider} storage not yet available. Coming in Phase 1, Week 2.`)
      }

      const adapter = CloudStorageAdapterFactory.createGoogleDriveAdapter(
        credentials.accessToken,
        credentials.refreshToken,
        credentials.expiresAt
      )

      // Upload to cloud
      const fileMetadata = await adapter.uploadFile(file, {
        name: file.name,
        folderId: options.parentFolderId || 'root',
        mimeType: file.type,
        description: options.description
      })

      // Create DB record
      const docId = await this.generateId()
      const now = new Date()

      const document: UnifiedDocument = {
        id: docId,
        companyId,
        name: file.name,
        displayName: options.displayName || file.name,
        description: options.description,
        mimeType: file.type,
        storageProvider,
        storageId: fileMetadata.id,
        cloudPath: fileMetadata.name,
        fileSize: fileMetadata.sizeBytes,
        category: options.category as any,
        subcategory: options.subcategory,
        documentType: options.documentType,
        status: 'draft',
        completeness: 0,
        complianceStatus: 'compliant',
        requiredForFiling: options.requiredForFiling || false,
        currentVersion: 1,
        totalVersions: 1,
        uploadedBy: userId,
        uploadedAt: now,
        lastModifiedBy: userId,
        lastModifiedAt: now,
        ownerUserId: userId,
        parentFolderId: options.parentFolderId,
        commentCount: 0
      }

      // Store in unified_documents
      await sql`
        INSERT INTO unified_documents (
          id, company_id, name, display_name, description, mime_type,
          storage_provider, storage_id, cloud_path, file_size,
          category, subcategory, document_type,
          status, completeness, compliance_status, required_for_filing,
          current_version, total_versions,
          uploaded_by, uploaded_at, last_modified_by, last_modified_at,
          owner_user_id, parent_folder_id, comment_count
        ) VALUES (
          ${document.id}, ${document.companyId}, ${document.name}, ${document.displayName},
          ${document.description}, ${document.mimeType},
          ${document.storageProvider}, ${document.storageId}, ${document.cloudPath}, ${document.fileSize},
          ${document.category}, ${document.subcategory}, ${document.documentType},
          ${document.status}, ${document.completeness}, ${document.complianceStatus}, ${document.requiredForFiling},
          ${document.currentVersion}, ${document.totalVersions},
          ${document.uploadedBy}, ${document.uploadedAt}, ${document.lastModifiedBy}, ${document.lastModifiedAt},
          ${document.ownerUserId}, ${document.parentFolderId}, ${document.commentCount}
        )
      `

      return document
    } catch (err) {
      console.error('[document-service] Failed to upload document:', err)
      throw err
    }
  }

  /**
   * Sync cloud documents to database
   * Pulls latest files from cloud provider and ensures DB is in sync
   */
  static async syncCloudDocuments(companyId: string): Promise<{ synced: number; failed: number }> {
    try {
      // Get enabled providers for company
      const providers = await sql`
        SELECT enabled_providers FROM cloud_storage_providers
        WHERE company_id = ${companyId}
      `

      if (providers.length === 0) {
        return { synced: 0, failed: 0 }
      }

      const enabledProviders = providers[0].enabled_providers || []
      let synced = 0
      let failed = 0

      for (const provider of enabledProviders) {
        try {
          const count = await this.syncProviderDocuments(companyId, provider)
          synced += count
        } catch (err) {
          console.error(`[document-service] Failed to sync ${provider}:`, err)
          failed++
        }
      }

      return { synced, failed }
    } catch (err) {
      console.error('[document-service] Failed to sync cloud documents:', err)
      throw err
    }
  }

  /**
   * Sync documents from specific provider
   */
  private static async syncProviderDocuments(
    companyId: string,
    provider: string
  ): Promise<number> {
    const credentials = await this.getProviderCredentials(companyId, provider)
    const adapter = CloudStorageAdapterFactory.getAdapter(
      provider as any,
      credentials.accessToken,
      credentials.refreshToken,
      credentials.expiresAt
    )

    // List all files in root folder
    const cloudFiles = await adapter.listFiles({
      folderId: 'root',
      recursive: true
    })

    let syncedCount = 0

    for (const file of cloudFiles) {
      if (file.isFolder) continue // Skip folders for now

      const existing = await sql`
        SELECT id FROM unified_documents
        WHERE company_id = ${companyId}
          AND storage_id = ${file.id}
          AND storage_provider = ${provider}
      `

      if (existing.length === 0) {
        // New file in cloud - add to DB
        await sql`
          INSERT INTO unified_documents (
            id, company_id, name, display_name, mime_type,
            storage_provider, storage_id, cloud_path, file_size,
            status, completeness, compliance_status, required_for_filing,
            current_version, total_versions,
            uploaded_by, uploaded_at, last_modified_by, last_modified_at,
            owner_user_id, comment_count
          ) VALUES (
            ${await this.generateId()}, ${companyId}, ${file.name}, ${file.name}, ${file.mimeType},
            ${provider}, ${file.id}, ${file.name}, ${file.sizeBytes},
            'draft', 0, 'compliant', false,
            1, 1,
            'system', ${file.createdAt}, 'system', ${file.modifiedAt},
            'system', 0
          )
        `
        syncedCount++
      } else {
        // Update existing
        await sql`
          UPDATE unified_documents
          SET name = ${file.name},
              file_size = ${file.sizeBytes},
              last_modified_at = ${file.modifiedAt}
          WHERE id = ${existing[0].id}
        `
        syncedCount++
      }
    }

    // Update last sync time
    await sql`
      UPDATE cloud_storage_providers
      SET last_sync_at = NOW(),
          last_sync_status = 'success'
      WHERE company_id = ${companyId}
        AND enabled_providers::text LIKE ${`%${provider}%`}
    `

    return syncedCount
  }

  /**
   * Move document to different folder
   */
  static async moveDocument(documentId: string, targetFolderId: string): Promise<void> {
    try {
      const doc = await this.getDocument(documentId)
      if (!doc) throw new Error('Document not found')

      if (!doc.storageId) {
        // Local document, just update DB
        await sql`
          UPDATE unified_documents
          SET parent_folder_id = ${targetFolderId}
          WHERE id = ${documentId}
        `
        return
      }

      // Move in cloud
      const credentials = await this.getProviderCredentials(doc.companyId, doc.storageProvider)
      const adapter = CloudStorageAdapterFactory.getAdapter(
        doc.storageProvider as any,
        credentials.accessToken,
        credentials.refreshToken,
        credentials.expiresAt
      )

      await adapter.moveFile(doc.storageId, targetFolderId)

      // Update DB
      await sql`
        UPDATE unified_documents
        SET parent_folder_id = ${targetFolderId}
        WHERE id = ${documentId}
      `
    } catch (err) {
      console.error('[document-service] Failed to move document:', err)
      throw err
    }
  }

  /**
   * Delete document from cloud + DB
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const doc = await this.getDocument(documentId)
      if (!doc) throw new Error('Document not found')

      if (doc.storageId) {
        // Delete from cloud
        const credentials = await this.getProviderCredentials(doc.companyId, doc.storageProvider)
        const adapter = CloudStorageAdapterFactory.getAdapter(
          doc.storageProvider as any,
          credentials.accessToken,
          credentials.refreshToken,
          credentials.expiresAt
        )
        await adapter.deleteFile(doc.storageId)
      }

      // Delete from DB
      await sql`
        DELETE FROM unified_documents
        WHERE id = ${documentId}
      `
    } catch (err) {
      console.error('[document-service] Failed to delete document:', err)
      throw err
    }
  }

  /**
   * Add comment to document
   */
  static async addComment(
    documentId: string,
    text: string,
    userId: string
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO document_comments (document_id, author_user_id, text, created_at)
        VALUES (${documentId}, ${userId}, ${text}, NOW())
      `

      // Update comment count on document
      await sql`
        UPDATE unified_documents
        SET comment_count = comment_count + 1
        WHERE id = ${documentId}
      `
    } catch (err) {
      console.error('[document-service] Failed to add comment:', err)
      throw err
    }
  }

  /**
   * Get document comments
   */
  static async getDocumentComments(documentId: string) {
    try {
      const results = await sql`
        SELECT author_user_id as author, text, created_at as date
        FROM document_comments
        WHERE document_id = ${documentId}
        ORDER BY created_at DESC
      `
      return results
    } catch (err) {
      console.error('[document-service] Failed to get comments:', err)
      return []
    }
  }

  /**
   * Helper: Get cloud provider credentials
   */
  private static async getProviderCredentials(
    companyId: string,
    provider: string
  ) {
    const result = await sql`
      SELECT access_token, refresh_token, token_expires_at
      FROM integration_credentials
      WHERE company_id = ${companyId}
        AND integration_type = ${provider}
        AND is_active = true
    `

    if (result.length === 0) {
      throw new Error(`No active ${provider} credentials for company`)
    }

    return {
      accessToken: result[0].access_token,
      refreshToken: result[0].refresh_token,
      expiresAt: result[0].token_expires_at
    }
  }

  /**
   * Helper: Map DB row to UnifiedDocument
   */
  private static mapRowToDocument(row: any): UnifiedDocument {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      mimeType: row.mime_type,
      storageProvider: row.storage_provider,
      storageId: row.storage_id,
      cloudPath: row.cloud_path,
      fileSize: row.file_size,
      category: row.category,
      subcategory: row.subcategory,
      documentType: row.document_type,
      status: row.status,
      completeness: row.completeness,
      complianceStatus: row.compliance_status,
      requiredForFiling: row.required_for_filing,
      currentVersion: row.current_version,
      totalVersions: row.total_versions,
      previousVersionIds: row.previous_version_ids,
      uploadedBy: row.uploaded_by,
      uploadedAt: new Date(row.uploaded_at),
      lastModifiedBy: row.last_modified_by,
      lastModifiedAt: new Date(row.last_modified_at),
      approvedBy: row.approved_by,
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      ownerUserId: row.owner_user_id,
      parentFolderId: row.parent_folder_id,
      relatedDocuments: row.related_documents,
      commentCount: row.comment_count,
      lastComment: row.last_comment
    }
  }

  /**
   * Helper: Generate UUID
   */
  private static async generateId(): Promise<string> {
    const result = await sql`SELECT gen_random_uuid() as id`
    return result[0].id
  }
}
