# Document Unified Source Migration Guide

**Status**: Architecture Complete - Ready for Implementation  
**Created**: 2026-06-06  
**Objective**: Migrate all document-related pages to unified source + enable cloud storage integration

## Problem Solved

### Before (Current State)
```
/documents page           → Hardcoded DOCUMENT_GROUPS in TSX
/data-room page         → Mock folders and documents
/api/documents          → Queries custom schema
Result: Document inconsistency across pages, no cloud integration
```

### After (Unified Architecture)
```
All pages → UnifiedDocumentService → unified_documents table ← Cloud Providers (Google Drive, Dropbox, OneDrive, Box)
Result: Single source of truth, real-time cloud sync, consistent everywhere
```

## Files Created

### 1. Cloud Storage Adapter (`src/lib/cloud-storage/adapter.ts`)
- **Purpose**: Abstract interface for all cloud storage providers
- **Provides**: 12 methods (read, write, delete, move, list, create folders, etc.)
- **Extensible**: Easy to add new providers (5-cloud adapters per file)
- **Adapters to implement**:
  - GoogleDriveAdapter (uses googleapis)
  - DropboxAdapter (uses dropbox SDK)
  - OneDriveAdapter (uses Microsoft Graph)
  - BoxAdapter (uses box-node-sdk)

### 2. Unified Document Service (`src/lib/unified-document-service.ts`)
- **Purpose**: Single source of truth for all documents
- **Key Methods**:
  - `getDocument(id)` — Get one document (works with any cloud provider)
  - `listDocuments(filter)` — List documents with filters
  - `uploadDocument()` — Upload to cloud + auto-sync to DB
  - `syncCloudDocuments()` — Pull latest from cloud providers
  - `moveDocument()` — Move between folders (cloud or local)
  - `deleteDocument()` — Delete from cloud + DB
  - `addComment()` / `getDocumentComments()` — Comments on documents

### 3. Database Schema (`src/db/schema-unified-documents.sql`)
- **Main Table**: `unified_documents` (replaces scattered document tables)
- **Supporting Tables**:
  - `cloud_storage_providers` — Settings per company
  - `document_versions` — Version history
  - `document_comments` — Collaborative review comments
  - `data_room_folders` — Folder structure
  - `document_access_log` — Audit trail

## Implementation Steps

### Step 1: Deploy Database Schema (Day 1)
```bash
# Run migration
psql -d ipoready < src/db/schema-unified-documents.sql

# Verify tables created
SELECT tablename FROM pg_tables WHERE tablename LIKE 'unified_%' OR tablename LIKE 'document_%';
```

**Expected tables**:
- unified_documents
- cloud_storage_providers
- document_versions
- document_comments
- data_room_folders
- document_access_log

### Step 2: Install Cloud SDK Dependencies (Day 1)
```bash
npm install googleapis                                    # Google Drive
npm install dropbox                                       # Dropbox
npm install @microsoft/microsoft-graph-client             # OneDrive
npm install box-node-sdk                                  # Box
```

### Step 3: Implement Cloud Storage Adapters (Days 2-3)

Create each adapter file following the `CloudStorageAdapter` interface:

#### Google Drive Adapter (`src/lib/cloud-storage/google-drive-adapter.ts`)
```typescript
import { google } from 'googleapis'
import { CloudStorageAdapter, FileMetadata, UploadOptions } from './adapter'

export class GoogleDriveAdapter extends CloudStorageAdapter {
  private drive = google.drive('v3')

  async readFile(fileId: string): Promise<Buffer> {
    // Implementation
  }

  async uploadFile(file: File | Buffer, options: UploadOptions) {
    // Implementation
  }

  // ... implement remaining 10 methods
}
```

**Similar structure for**:
- DropboxAdapter (uses Dropbox SDK)
- OneDriveAdapter (uses Microsoft Graph)
- BoxAdapter (uses Box SDK)

### Step 4: Update Existing Pages to Use Unified Service (Days 4-5)

#### Migrate `/documents` Page
**Before**:
```typescript
// src/app/documents/page.tsx
const DOCUMENT_GROUPS = {
  'Mandatory - Financial': [ /* hardcoded */ ]
}

export default function DocumentsPage() {
  // Render hardcoded DOCUMENT_GROUPS
}
```

**After**:
```typescript
// src/app/documents/page.tsx
import { UnifiedDocumentService } from '@/lib/unified-document-service'

export default async function DocumentsPage() {
  // Get session
  const session = await getServerSession()
  const companyId = session?.user?.companyId

  // Fetch from unified source (same data everywhere)
  const documents = await UnifiedDocumentService.listDocuments({
    companyId,
    category: 'financial'
  })

  // Group by category for display
  const grouped = groupByCategory(documents)

  return (
    <div>
      {/* Render documents from unified source */}
      {grouped.map(group => (
        <DocumentGroup key={group.category} documents={group.documents} />
      ))}
    </div>
  )
}
```

#### Migrate `/data-room` Pages
**Before**:
```typescript
// src/app/dashboard/investor-readiness/data-room/page.tsx
const folders: DataRoomFolder[] = [ /* mock data */ ]

export default function DataRoomPage() {
  // Render mock folders
}
```

**After**:
```typescript
// Uses same UnifiedDocumentService
const documents = await UnifiedDocumentService.listDocuments({
  companyId,
  folderId: 'financial_statements'
})

// Render from unified source
```

### Step 5: Create API Routes for New Functionality (Days 5-6)

#### GET `/api/documents`
```typescript
// Returns documents from unified source
// Query params: category, status, folderId, documentType
```

#### POST `/api/documents/upload`
```typescript
// Upload file to cloud provider + sync to DB
// Handles Google Drive, Dropbox, OneDrive, Box automatically
```

#### POST `/api/documents/sync`
```typescript
// Manually trigger sync from cloud → DB
// Useful when files added via cloud interface directly
```

#### GET `/api/documents/[id]`
```typescript
// Get document metadata or download from cloud
// Automatically routes to correct adapter
```

#### POST `/api/documents/[id]/move`
```typescript
// Move document between folders
// Works across cloud providers
```

## Testing Checklist

### Unit Tests
- [ ] `UnifiedDocumentService.getDocument()` returns correct document
- [ ] `listDocuments()` filters work (category, status, folder)
- [ ] `uploadDocument()` creates DB record + uploads to cloud
- [ ] `syncCloudDocuments()` pulls new files from cloud
- [ ] `addComment()` increments comment count

### Integration Tests
- [ ] Google Drive adapter can read/write files
- [ ] Dropbox adapter works with oauth
- [ ] OneDrive adapter authenticates
- [ ] Box adapter uploads files
- [ ] Sync pulls files from cloud → DB matches count

### UI Tests
- [ ] `/documents` page shows same documents as DB query
- [ ] `/data-room` page shows same documents as DB query
- [ ] Upload file → appears in both pages immediately
- [ ] Delete file → disappears from both pages immediately
- [ ] Move file → updates parent_folder_id in both pages

### Data Consistency Tests
- [ ] Document count in `/documents` == Document count in `/data-room`
- [ ] Same document displays same metadata everywhere
- [ ] Version count matches DB records
- [ ] Comment count accurate

## Rollback Plan

If cloud provider integration fails:
1. Keep `unified_documents` table with `storage_provider = 'local'`
2. Documents still work with local storage
3. Cloud sync just won't happen
4. No data loss - everything stored in DB

## Success Metrics

✅ **Before Migration**:
- 3+ different document display methods (documents page, data room, API)
- Hardcoded mock data in multiple places
- No cloud integration

✅ **After Migration**:
- 1 document source: `unified_documents` table
- All pages query same source
- Real-time sync from Google Drive, Dropbox, OneDrive, Box
- Upload/delete works everywhere automatically
- Version history tracked
- Comments synchronized

## Performance Considerations

### Caching Strategy
```
GET /documents?category=financial
  → Check cache (5 min TTL)
  → If miss: Query unified_documents + sync cloud
  → Return + cache
```

### Sync Frequency
- Default: Run sync every 1 hour
- Can trigger manually via API
- Auto-sync on document upload
- Configurable per provider

### Query Optimization
```
-- Indexed queries (fast)
SELECT * FROM unified_documents
WHERE company_id = ? AND category = ?  ✓ Indexed

-- Use indexes
- company_id
- category
- status
- parent_folder_id
- storage_provider
```

## Cloud Provider Setup

### Google Drive
1. Create OAuth app in Google Cloud Console
2. Get client ID, client secret
3. Authorize scope: `https://www.googleapis.com/auth/drive`
4. Store credentials in `integration_credentials` table

### Dropbox
1. Create app in Dropbox Developer Console
2. Get app key, app secret
3. Authorize scope: `files.metadata.read`, `files.content.read/write`
4. Store credentials

### OneDrive
1. Register app in Azure Active Directory
2. Get application ID, secret
3. Authorize scope: `https://graph.microsoft.com/.default`
4. Store credentials

### Box
1. Create custom app in Box Console
2. Get client ID, secret
3. Authorize scope: `manage_all_files`
4. Store credentials

## FAQ

**Q: Do all files need to be in cloud?**
A: No. `storage_provider` can be 'local' for files not synced to cloud.

**Q: What if user revokes cloud access?**
A: Cloud integration stops, but documents stay in DB. Can still view/download.

**Q: Can I use multiple cloud providers?**
A: Yes. Set `enabled_providers: ['google_drive', 'dropbox']` in `cloud_storage_providers`.

**Q: What about version history?**
A: Each cloud provider tracks versions. We sync with `document_versions` table.

**Q: How do comments work across clouds?**
A: Comments stored in DB, not in cloud. Always available regardless of cloud provider.

## Next Steps

1. **Deploy Schema** (Day 1) — Run SQL migration
2. **Implement Adapters** (Days 2-3) — Create adapter files
3. **Update Pages** (Days 4-5) — Migrate documents page + data room
4. **API Routes** (Days 5-6) — Create endpoints
5. **Testing** (Days 6-7) — Run test checklist
6. **Cloud Setup** (Days 7-8) — Configure OAuth for each provider
7. **Launch** (Week 2) — Enable in production

---

**Document Source is now unified. All pages query the same source. Cloud storage is optional but fully integrated.**
