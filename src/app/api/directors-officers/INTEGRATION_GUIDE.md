# Directors & Officers Prospectus Sync - Integration Guide

Quick reference for integrating the Prospectus Sync API into the IPOReady dashboard and workflows.

## File Structure

```
src/app/api/directors-officers/
├── README.md                              # Full API documentation
├── INTEGRATION_GUIDE.md                   # This file
├── sync-to-prospectus/route.ts           # POST endpoint - sync directors to prospectus
├── get-prospectus-section/route.ts       # GET endpoint - retrieve formatted prospectus section
├── check-compliance/route.ts             # GET endpoint - validate compliance status
└── bulk-update-sync/route.ts             # PUT endpoint - bulk sync operations

src/lib/
└── directors-sync-utils.ts               # Shared utility functions
```

## Data Flow

```
1. Professionals (Board Members)
   ├── id, name, title, bio
   ├── certifications, years_of_experience
   └── past_board_positions (JSONB)
        ↓
2. LinkedIn Verification (Optional)
   ├── verification_status, confidence_score
   ├── extracted_education (JSONB)
   ├── extracted_certifications (JSONB)
   └── extracted_skills[]
        ↓
3. Sync to Prospectus
   ├── director_prospectus_sync (tracking)
   ├── Format as FormattedDirector
   ├── Validate compliance
   └── Return prospectus-ready bio
        ↓
4. Prospectus Document
   ├── board_of_directors section
   ├── audit_committee section
   ├── compensation_committee section
   └── management_team section
```

## Quick Start

### 1. Verify Prerequisites

Ensure these tables exist:
- `professionals` (from migration 022)
- `director_linkedin_verification` (from migration 023)
- `director_prospectus_sync` (from migration 023)
- `prospectus_documents` (from migration 014)

```sql
-- Quick verification query
SELECT COUNT(*) as professionals_count FROM professionals;
SELECT COUNT(*) as sync_count FROM director_prospectus_sync;
```

### 2. Basic Usage Flow

```typescript
// Step 1: Check compliance first
const complianceCheck = await fetch(
  '/api/directors-officers/check-compliance',
  { method: 'GET' }
);
const compliance = await complianceCheck.json();

// Step 2: If compliance is acceptable, sync to prospectus
if (compliance.complianceScore >= 80) {
  const syncResponse = await fetch(
    '/api/directors-officers/sync-to-prospectus',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directorIds: ['uuid-1', 'uuid-2', 'uuid-3'],
        prospectusDocumentId: 'prospectus-uuid'
      })
    }
  );
  const syncResult = await syncResponse.json();
  console.log(`Synced ${syncResult.syncedCount} directors`);
}

// Step 3: Retrieve formatted section for prospectus
const sectionResponse = await fetch(
  '/api/directors-officers/get-prospectus-section?prospectusDocumentId=prospectus-uuid',
  { method: 'GET' }
);
const prospectusSection = await sectionResponse.json();
```

### 3. React Component Integration

```typescript
import { useState, useEffect } from 'react'

export function DirectorsProspectusSync() {
  const [directors, setDirectors] = useState([])
  const [compliance, setCompliance] = useState(null)
  const [syncing, setSyncing] = useState(false)

  // Check compliance on mount
  useEffect(() => {
    const checkCompliance = async () => {
      const res = await fetch('/api/directors-officers/check-compliance')
      const data = await res.json()
      setCompliance(data)
    }
    checkCompliance()
  }, [])

  // Sync selected directors
  const handleSync = async (directorIds: string[]) => {
    setSyncing(true)
    try {
      const res = await fetch('/api/directors-officers/sync-to-prospectus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directorIds })
      })
      const result = await res.json()
      setDirectors(result.directors)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <h2>Directors & Officers</h2>
      {compliance && (
        <div className={`compliance-status ${compliance.overallStatus}`}>
          <p>Compliance Score: {compliance.complianceScore}%</p>
          <p>Status: {compliance.overallStatus}</p>
        </div>
      )}
      <button onClick={() => handleSync(selectedIds)} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync to Prospectus'}
      </button>
    </div>
  )
}
```

## Common Patterns

### Pattern 1: Update Section Type for Directors

```typescript
// Move directors between committees/roles
const response = await fetch('/api/directors-officers/bulk-update-sync', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'update_section',
    directorIds: ['uuid-1', 'uuid-2'],
    sectionType: 'audit_committee'
  })
})
```

### Pattern 2: Re-sync After Director Profile Updates

```typescript
// If director info changes, resync them
const response = await fetch('/api/directors-officers/bulk-update-sync', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'resync',
    directorIds: ['uuid-1']
  })
})
```

### Pattern 3: Validate Before Prospectus Submission

```typescript
// Check all directors are compliant before filing
const compliance = await fetch('/api/directors-officers/check-compliance').then(r => r.json())

const canFile = 
  compliance.complianceScore >= 80 &&
  compliance.nonCompliant.count === 0 &&
  compliance.overallStatus !== 'needs_attention'

if (canFile) {
  // Proceed with prospectus filing
  const prospectusData = await fetch('/api/directors-officers/get-prospectus-section').then(r => r.json())
  // Submit prospectusData to filing system
}
```

### Pattern 4: Bulk Import from CSV

```typescript
// After importing directors from CSV via /api/professionals
const newDirectorIds = csvImportResult.importedIds

// Verify and sync them all
const response = await fetch('/api/directors-officers/sync-to-prospectus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    directorIds: newDirectorIds
  })
})

const syncResult = await response.json()
if (syncResult.complianceStatus.warnings.length > 0) {
  // Notify user about missing data
  showWarnings(syncResult.complianceStatus.warnings)
}
```

## Error Handling

### Handle Partial Failures

```typescript
const response = await fetch('/api/directors-officers/sync-to-prospectus', {
  method: 'POST',
  body: JSON.stringify({ directorIds: allDirectorIds })
})

const result = await response.json()

// Check which ones failed
const failedIds = result.syncStatus
  .filter(s => s.status === 'error')
  .map(s => s.directorId)

if (failedIds.length > 0) {
  console.error('Failed to sync:', failedIds)
  // Retry or notify user
}
```

### Handle Validation Errors

```typescript
const compliance = await fetch('/api/directors-officers/check-compliance').then(r => r.json())

if (compliance.nonCompliant.count > 0) {
  const criticalErrors = compliance.nonCompliant.criticalIssues
  
  // Show error details to user
  criticalErrors.forEach(issue => {
    console.error(`Director ${issue.directorId}: ${issue.field} - ${issue.reason}`)
  })
  
  // Prevent prospectus submission
  disableSubmitButton()
}
```

## Performance Optimization

### Batch Operations

When syncing many directors, batch them:

```typescript
const batchSync = async (allDirectorIds: string[], batchSize = 10) => {
  const batches = []
  for (let i = 0; i < allDirectorIds.length; i += batchSize) {
    const batch = allDirectorIds.slice(i, i + batchSize)
    batches.push(
      fetch('/api/directors-officers/sync-to-prospectus', {
        method: 'POST',
        body: JSON.stringify({ directorIds: batch })
      }).then(r => r.json())
    )
  }
  return Promise.all(batches)
}
```

### Caching Strategy

```typescript
// Cache compliance check for 5 minutes
let cachedCompliance = null
let lastComplianceCheck = 0
const COMPLIANCE_CACHE_TTL = 5 * 60 * 1000

const getCompliance = async (forceRefresh = false) => {
  const now = Date.now()
  if (!forceRefresh && cachedCompliance && (now - lastComplianceCheck < COMPLIANCE_CACHE_TTL)) {
    return cachedCompliance
  }
  
  const data = await fetch('/api/directors-officers/check-compliance').then(r => r.json())
  cachedCompliance = data
  lastComplianceCheck = now
  return data
}
```

## Testing

### Test Sync Endpoint

```bash
# Check compliance
curl http://localhost:3000/api/directors-officers/check-compliance \
  -H "Authorization: Bearer <token>"

# Sync specific directors
curl -X POST http://localhost:3000/api/directors-officers/sync-to-prospectus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "directorIds": ["uuid-1", "uuid-2"]
  }'

# Get prospectus section
curl http://localhost:3000/api/directors-officers/get-prospectus-section \
  -H "Authorization: Bearer <token>"

# Bulk update sync status
curl -X PUT http://localhost:3000/api/directors-officers/bulk-update-sync \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "mark_stale",
    "directorIds": ["uuid-1", "uuid-2"]
  }'
```

## Troubleshooting

### Issue: Compliance score is low

**Cause:** Missing director profile information

**Solution:**
```typescript
const compliance = await fetch('/api/directors-officers/check-compliance').then(r => r.json())
console.log(compliance.recommendations) // See what's missing
// Update director profiles with missing information
```

### Issue: Synced directors show as "out of sync"

**Cause:** Source data changed after sync

**Solution:**
```typescript
// Re-sync to update
const response = await fetch('/api/directors-officers/bulk-update-sync', {
  method: 'PUT',
  body: JSON.stringify({
    operation: 'resync',
    directorIds: outOfSyncIds
  })
})
```

### Issue: LinkedIn verification not detected

**Cause:** Verification record may not be marked as verified

**Solution:**
```sql
-- Check verification status
SELECT professional_id, verification_status, confidence_score
FROM director_linkedin_verification
WHERE professional_id = 'director-uuid';

-- If pending, verify manually or trigger verification process
```

## Related Documentation

- [Full API Docs](./README.md)
- [Database Schema](../../../db/migrations/022_board_talent_marketplace.sql)
- [LinkedIn Verification Schema](../../../db/migrations/023_board_member_files.sql)
- [Utility Functions](../../../lib/directors-sync-utils.ts)

## Support

For issues or questions:
1. Check the [README.md](./README.md) for endpoint details
2. Review this Integration Guide for common patterns
3. Check database schema migrations for table structure
4. Review error responses for diagnostic information
