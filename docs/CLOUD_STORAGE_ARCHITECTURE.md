# Cloud Storage & Unified Document Architecture

**Status**: Design Document - Ready for Implementation  
**Date**: 2026-06-06  
**Objective**: Create single source of truth for documents across all pages + connect to Google Drive, Dropbox, OneDrive, Box for real-time data room operations

## Current Problem

### 1. Multiple Document Sources (No SSOT)
Documents are hardcoded/mocked in multiple places with no unified source:

```
/src/app/documents/page.tsx                           → Hardcoded DOCUMENT_GROUPS
/src/app/dashboard/investor-readiness/data-room/page.tsx  → Mock folders & documents
/src/app/api/documents/route.ts                       → Database (but queries custom schema)
```

**Issue**: Same document displayed differently in different pages. Changes to one aren't reflected in others.

### 2. No Cloud Storage Integration
- Google Drive: Listed in `IntegrationType` but no implementation
- No connectors for Dropbox, OneDrive, Box
- No real-time file sync
- No folder operations (create, rename, delete)

### 3. Data Room Is Separate from Document Hub
- Data room (investor readiness) is isolated from documents page
- Different data structures
- Different permission models

## Solution Architecture

### Layer 1: Unified Document Model

```typescript
// Single source of truth for all documents
interface Document {
  id: string                          // Unique ID (UUID)
  companyId: string
  
  // Identity
  name: string
  displayName: string                 // "Financial Statements (10-K)"
  description: string
  mimeType: string                    // "application/pdf", "application/vnd.ms-excel"
  
  // Location & Storage
  storageProvider: 'local' | 'google_drive' | 'dropbox' | 'onedrive' | 'box'
  storageId: string                   // File ID in cloud service
  cloudPath: string                   // /Data Room/Financial/10-K.pdf
  fileSize: number                    // bytes
  
  // Document Classification
  category: 'financial' | 'legal' | 'governance' | 'operational' | 'hr'
  subcategory: string                 // "audited_financials", "cap_table"
  documentType: DocumentType          // See enum below
  
  // Status & Lifecycle
  status: 'draft' | 'in_review' | 'approved' | 'archived'
  completeness: number                // 0-100%
  complianceStatus: 'compliant' | 'warnings' | 'issues'
  requiredForFiling: boolean
  
  // Versioning
  currentVersion: number
  totalVersions: number
  previousVersionIds: string[]
  
  // Metadata
  uploadedBy: string                  // User ID
  uploadedAt: Date
  lastModifiedBy: string
  lastModifiedAt: Date
  approvedBy?: string
  approvedAt?: Date
  
  // Access Control
  ownerUserId: string
  sharedWith: string[]               // User IDs with access
  accessLevel: 'view' | 'comment' | 'edit'
  
  // Relationships
  relatedDocuments: string[]          // Links to related docs
  parentFolderId: string             // Which folder in data room
  
  // Comments & Annotations
  commentCount: number
  lastComment?: {
    author: string
    date: Date
    text: string
  }
}

enum DocumentType {
  // Financial
  AUDITED_FINANCIALS = 'audited_financials',
  UNAUDITED_FINANCIALS = 'unaudited_financials',
  CAP_TABLE = 'cap_table',
  TAX_RETURNS = 'tax_returns',
  FINANCIAL_PROJECTIONS = 'financial_projections',
  
  // Legal
  ARTICLES_OF_INCORPORATION = 'articles_of_incorporation',
  BYLAWS = 'bylaws',
  CONTRACTS = 'contracts',
  IP_DOCUMENTATION = 'ip_documentation',
  BOARD_RESOLUTIONS = 'board_resolutions',
  
  // Governance
  DIRECTOR_BIOS = 'director_bios',
  ORG_CHART = 'org_chart',
  BOARD_MEETING_MINUTES = 'board_minutes',
  OPTION_POOL_DOCS = 'option_pool_docs',
  
  // Regulatory/Compliance
  PROSPECTUS = 'prospectus',
  FILING_DOCUMENTS = 'filing_documents',
  REGULATORY_FILINGS = 'regulatory_filings',
  COMPLIANCE_CERTIFICATES = 'compliance_certificates',
  
  // General
  PRESENTATION = 'presentation',
  REPORT = 'report',
  DATA_SHEET = 'data_sheet',
  GENERAL = 'general'
}
```

### Layer 2: Cloud Storage Adapters

**Base Adapter Interface**:
```typescript
interface ICloudStorageAdapter {
  // Authentication
  authenticate(accessToken: string, refreshToken?: string): Promise<void>
  refreshAccessToken(): Promise<string>
  
  // Read Operations
  readFile(fileId: string): Promise<Buffer>
  listFiles(folderId: string): Promise<FileMetadata[]>
  getFileMetadata(fileId: string): Promise<FileMetadata>
  searchFiles(query: string, folderId?: string): Promise<FileMetadata[]>
  
  // Write Operations
  uploadFile(file: File, folderId: string, name: string): Promise<FileMetadata>
  updateFile(fileId: string, file: File): Promise<FileMetadata>
  deleteFile(fileId: string): Promise<void>
  moveFile(fileId: string, targetFolderId: string): Promise<void>
  
  // Folder Operations
  createFolder(parentFolderId: string, name: string): Promise<FolderMetadata>
  deleteFolder(folderId: string, recursive: boolean): Promise<void>
  renameFolder(folderId: string, newName: string): Promise<void>
  
  // Metadata
  getFilePreview(fileId: string): Promise<string | Buffer>  // thumbnail/preview
}

interface FileMetadata {
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

interface FolderMetadata {
  id: string
  name: string
  parentFolderId?: string
  createdAt: Date
  filesCount: number
  subFoldersCount: number
}
```

**Specific Implementations**:

#### Google Drive Adapter
```typescript
// File: src/lib/cloud-storage/google-drive-adapter.ts
import { google } from 'googleapis'

class GoogleDriveAdapter implements ICloudStorageAdapter {
  private drive = google.drive('v3')
  
  async readFile(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )
    return streamToBuffer(response.data)
  }
  
  async uploadFile(file: File, folderId: string, name: string) {
    const fileMetadata = {
      name,
      parents: [folderId],
      mimeType: file.type
    }
    
    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: { mimeType: file.type, body: file.stream() },
      fields: 'id, name, mimeType, size, createdTime, modifiedTime'
    })
    
    return this.mapToFileMetadata(response.data)
  }
  
  async createFolder(parentFolderId: string, name: string) {
    const response = await this.drive.files.create({
      requestBody: {
        name,
        parents: [parentFolderId],
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id, name, createdTime'
    })
    
    return this.mapToFolderMetadata(response.data)
  }
  
  async listFiles(folderId: string) {
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, parents)',
      pageSize: 100
    })
    
    return response.data.files.map(f => this.mapToFileMetadata(f))
  }
}
```

#### Dropbox Adapter
```typescript
// File: src/lib/cloud-storage/dropbox-adapter.ts
import { DropboxSDK } from 'dropbox'

class DropboxAdapter implements ICloudStorageAdapter {
  private dropbox = new DropboxSDK({ accessToken })
  
  async uploadFile(file: File, parentPath: string, name: string) {
    const path = `${parentPath}/${name}`
    
    const response = await this.dropbox.filesUpload({
      path,
      contents: await file.arrayBuffer(),
      autorename: false,
      mode: { '.tag': 'add' }
    })
    
    return this.mapToFileMetadata(response.result)
  }
  
  // Similar implementations for other methods
}
```

#### OneDrive Adapter
```typescript
// File: src/lib/cloud-storage/onedrive-adapter.ts
import { Client } from '@microsoft/microsoft-graph-client'

class OneDriveAdapter implements ICloudStorageAdapter {
  private graph = Client.init({ authProvider })
  
  async uploadFile(file: File, parentFolderId: string, name: string) {
    const response = await this.graph
      .api(`/me/drive/items/${parentFolderId}:/${name}:/content`)
      .put(await file.arrayBuffer())
    
    return this.mapToFileMetadata(response)
  }
}
```

#### Box Adapter
```typescript
// File: src/lib/cloud-storage/box-adapter.ts
import BoxSDK from 'box-node-sdk'

class BoxAdapter implements ICloudStorageAdapter {
  private sdk = new BoxSDK({ clientID, clientSecret })
  
  async uploadFile(file: File, parentFolderId: string, name: string) {
    const response = await this.sdk
      .asUser(this.userId)
      .files
      .uploadFile(
        parentFolderId,
        name,
        await file.stream()
      )
    
    return this.mapToFileMetadata(response)
  }
}
```

### Layer 3: Unified Document Service

```typescript
// File: src/lib/document-service.ts
class DocumentService {
  
  // Get document from any source (unified SSOT)
  async getDocument(documentId: string): Promise<Document> {
    const doc = await sql`
      SELECT * FROM unified_documents WHERE id = ${documentId}
    `
    
    if (doc.length === 0) throw new Error('Document not found')
    return doc[0]
  }
  
  // List documents for company/folder (works across all clouds)
  async listDocuments(
    companyId: string,
    filters: { category?: string, status?: string, folderId?: string }
  ): Promise<Document[]> {
    let query = sql`
      SELECT * FROM unified_documents
      WHERE company_id = ${companyId}
    `
    
    if (filters.category) {
      query = sql`${query} AND category = ${filters.category}`
    }
    if (filters.status) {
      query = sql`${query} AND status = ${filters.status}`
    }
    if (filters.folderId) {
      query = sql`${query} AND parent_folder_id = ${filters.folderId}`
    }
    
    return await query
  }
  
  // Upload document to cloud (auto-syncs back to DB)
  async uploadDocument(
    companyId: string,
    file: File,
    metadata: Partial<Document>
  ): Promise<Document> {
    const storageProvider = metadata.storageProvider || 'google_drive'
    const adapter = this.getAdapter(storageProvider, companyId)
    
    // Upload to cloud
    const cloudResult = await adapter.uploadFile(
      file,
      metadata.parentFolderId,
      file.name
    )
    
    // Create DB record
    const document: Document = {
      id: uuid(),
      companyId,
      name: file.name,
      displayName: metadata.displayName || file.name,
      storageProvider,
      storageId: cloudResult.id,
      cloudPath: cloudResult.path,
      fileSize: cloudResult.sizeBytes,
      ...metadata,
      uploadedAt: new Date(),
      uploadedBy: getCurrentUserId()
    }
    
    // Store in unified_documents table
    await sql`
      INSERT INTO unified_documents (${Object.keys(document)})
      VALUES (${Object.values(document)})
    `
    
    return document
  }
  
  // Sync cloud documents to database
  async syncCloudDocuments(companyId: string) {
    const company = await this.getCompanyCloudSettings(companyId)
    
    for (const provider of company.enabledProviders) {
      const adapter = this.getAdapter(provider, companyId)
      
      // List all files in company's cloud folders
      const cloudFiles = await adapter.listFiles(company.rootFolderId)
      
      // Sync back to database
      for (const file of cloudFiles) {
        const existing = await sql`
          SELECT id FROM unified_documents
          WHERE company_id = ${companyId}
          AND storage_id = ${file.id}
          AND storage_provider = ${provider}
        `
        
        if (existing.length === 0) {
          // New file in cloud, add to DB
          await sql`
            INSERT INTO unified_documents (...)
            VALUES (...)
          `
        } else {
          // Update existing
          await sql`
            UPDATE unified_documents
            SET name = ${file.name},
                file_size = ${file.sizeBytes},
                last_modified_at = ${file.modifiedAt}
            WHERE id = ${existing[0].id}
          `
        }
      }
    }
  }
  
  // Get adapter for provider
  private getAdapter(provider: string, companyId: string) {
    const credentials = this.getProviderCredentials(provider, companyId)
    
    switch (provider) {
      case 'google_drive':
        return new GoogleDriveAdapter(credentials)
      case 'dropbox':
        return new DropboxAdapter(credentials)
      case 'onedrive':
        return new OneDriveAdapter(credentials)
      case 'box':
        return new BoxAdapter(credentials)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }
}
```

### Layer 4: Database Schema

```sql
-- Unified document source
CREATE TABLE unified_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  mime_type VARCHAR(100),
  
  -- Storage
  storage_provider VARCHAR(50) NOT NULL,  -- 'google_drive', 'dropbox', 'onedrive', 'box', 'local'
  storage_id VARCHAR(500),                -- File ID in cloud service
  cloud_path VARCHAR(1000),               -- /folder/subfolder/file.pdf
  file_size BIGINT,                       -- bytes
  
  -- Classification
  category VARCHAR(100),                  -- 'financial', 'legal', 'governance'
  subcategory VARCHAR(100),
  document_type VARCHAR(100),
  
  -- Status
  status VARCHAR(50),                     -- 'draft', 'in_review', 'approved', 'archived'
  completeness INTEGER,                   -- 0-100%
  compliance_status VARCHAR(50),
  required_for_filing BOOLEAN,
  
  -- Versioning
  current_version INTEGER DEFAULT 1,
  total_versions INTEGER DEFAULT 1,
  
  -- Metadata
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  last_modified_by UUID,
  last_modified_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Access Control
  owner_user_id UUID,
  
  -- Relationships
  parent_folder_id VARCHAR(500),          -- For data room hierarchy
  
  -- Comments
  comment_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_unified_documents_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

-- Cloud storage provider settings per company
CREATE TABLE cloud_storage_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,
  
  -- Enabled providers
  enabled_providers JSONB,                -- ['google_drive', 'dropbox']
  
  -- Root folders in each provider
  provider_settings JSONB,                -- {
                                          --   "google_drive": {
                                          --     "rootFolderId": "...",
                                          --     "enabled": true,
                                          --     "syncFrequency": "hourly"
                                          --   }
                                          -- }
  
  -- Last sync timestamps
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50),           -- 'success', 'failed', 'partial'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_cloud_providers_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

-- Document versions
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  
  version_number INTEGER NOT NULL,
  storage_id VARCHAR(500),                -- File ID in cloud for this version
  file_size BIGINT,
  
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  
  change_notes TEXT,
  is_latest BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT fk_document_versions_document FOREIGN KEY (document_id)
    REFERENCES unified_documents(id) ON DELETE CASCADE,
  CONSTRAINT unique_doc_version UNIQUE (document_id, version_number)
);

-- Document comments (for collaborative review)
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  
  author_user_id UUID NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_comments_document FOREIGN KEY (document_id)
    REFERENCES unified_documents(id) ON DELETE CASCADE
);

-- Data room folders (for organizing documents)
CREATE TABLE data_room_folders (
  id VARCHAR(500) PRIMARY KEY,            -- Cloud provider folder ID
  company_id UUID NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  
  storage_provider VARCHAR(50),           -- 'google_drive', 'dropbox', etc.
  parent_folder_id VARCHAR(500),
  
  folder_type VARCHAR(50),                -- 'financial', 'legal', 'governance'
  is_required BOOLEAN DEFAULT FALSE,      -- Must include in data room
  
  created_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_folders_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);
```

### Layer 5: API Routes

```typescript
// GET /api/documents?folder=financial&status=approved
// Returns all documents matching filters from unified source

// POST /api/documents/upload
// Upload to cloud + auto-sync to DB

// POST /api/documents/sync
// Manually sync cloud documents to database

// GET /api/documents/[id]
// Get document from cloud (reads via adapter)

// POST /api/documents/[id]/move
// Move to different folder (works across clouds)

// DELETE /api/documents/[id]
// Delete from cloud + DB
```

## Implementation Timeline

### Phase 1: Database & Core Service (Week 1)
- Create `unified_documents` table
- Create `cloud_storage_providers` table
- Build `DocumentService` class
- Create base `ICloudStorageAdapter` interface

### Phase 2: Cloud Adapters (Week 2)
- Google Drive adapter (uses googleapis)
- Dropbox adapter (uses dropbox SDK)
- OneDrive adapter (uses Microsoft Graph)
- Box adapter (uses box SDK)
- Install required dependencies

### Phase 3: API Routes & Integration (Week 3)
- Create `/api/documents` endpoints
- Build document sync mechanism
- Add authentication to cloud providers

### Phase 4: UI Updates (Week 4)
- Update `/documents` page to use unified source
- Update data room pages to use unified source
- Add cloud provider selection UI
- Add folder creation/management UI

## Dependencies to Install

```bash
npm install googleapis                # Google Drive API
npm install dropbox                   # Dropbox SDK
npm install @microsoft/microsoft-graph-client  # OneDrive/Microsoft Graph
npm install box-node-sdk             # Box SDK
```

## Migration Strategy

1. **Backward Compatibility**: Keep existing document pages working while building new unified system
2. **Gradual Migration**: Migrate data room first (highest priority), then documents page
3. **Validation**: For each provider, sync cloud folder → verify count matches expected documents
4. **Rollback Plan**: Keep old data if sync fails, alert admin to manually verify

## Benefits

✅ **Single Source of Truth**: One document = same everywhere  
✅ **Cloud Storage Integration**: Real Google Drive, Dropbox, OneDrive, Box support  
✅ **Real-time Sync**: Changes in cloud auto-reflect in app  
✅ **Folder Operations**: Create, rename, delete folders in data room  
✅ **Consistent UI**: Same document view across all pages  
✅ **Version Control**: Track all versions across any cloud provider  
✅ **Better Performance**: Cloud adapters handle large files better than local storage

## Risk Mitigation

- **Rate Limiting**: Cache cloud results for 5 minutes before re-fetching
- **Error Handling**: Graceful fallback if cloud provider unavailable
- **Access Revocation**: If integration credentials revoked, can still view cached data
- **Privacy**: Use service account + OAuth scopes limiting to company folder only
