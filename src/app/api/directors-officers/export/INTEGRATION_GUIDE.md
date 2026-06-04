# Filing Export API - Integration Guide

Complete guide for integrating the Filing Export API into your IPOReady application.

## Quick Start

### 1. Install Dependencies

The project already includes required PDF generation libraries:

```bash
# Already in package.json:
npm install pdfkit
npm install pdf-parse
```

### 2. Set Up Database Migration

Run the migration to create the export tracking table:

```bash
# Using your database client
psql -U postgres -d ipoready -f src/lib/migrations/create_director_export_tracking.sql
```

Or programmatically:

```typescript
import { sql } from '@/lib/db'

const migrationSql = fs.readFileSync('src/lib/migrations/create_director_export_tracking.sql', 'utf-8')
await sql.query(migrationSql)
```

### 3. Test the Endpoints

```bash
# Test SEDAR2 export
curl -X POST http://localhost:3000/api/directors-officers/export/sedar2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"directorIds": ["uuid-1", "uuid-2"]}'

# Test SEC Edgar export
curl -X POST http://localhost:3000/api/directors-officers/export/sec-edgar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"directorIds": ["uuid-1"], "format": "html"}'

# Test PDF export
curl -X POST http://localhost:3000/api/directors-officers/export/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"directorIds": ["uuid-1", "uuid-2"]}'
```

---

## Frontend Integration

### React Component Example

```typescript
import { useState } from 'react'
import axios from 'axios'

export function FilingExportDialog({ directorIds }: { directorIds: string[] }) {
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'sedar2' | 'sec-edgar' | 'pdf'>('sedar2')
  const [content, setContent] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    try {
      if (format === 'sedar2') {
        const response = await axios.post('/api/directors-officers/export/sedar2', {
          directorIds
        })
        setContent(response.data.sedar2Content)
        downloadAsText(response.data.sedar2Content, `directors-sedar2.txt`)
      } else if (format === 'sec-edgar') {
        const response = await axios.post('/api/directors-officers/export/sec-edgar', {
          directorIds,
          format: 'html'
        })
        setContent(response.data.content)
        downloadAsHtml(response.data.content, `directors-sec-edgar.html`)
      } else if (format === 'pdf') {
        const response = await axios.post('/api/directors-officers/export/pdf', {
          directorIds
        })
        // Redirect to download URL or fetch and download
        window.location.href = response.data.pdfUrl
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to generate export')
    } finally {
      setLoading(false)
    }
  }

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsHtml = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="filing-export-dialog">
      <h2>Export Directors for Filing</h2>

      <div className="format-selector">
        <label>
          <input
            type="radio"
            value="sedar2"
            checked={format === 'sedar2'}
            onChange={(e) => setFormat(e.target.value as any)}
          />
          SEDAR 2 (Canada)
        </label>
        <label>
          <input
            type="radio"
            value="sec-edgar"
            checked={format === 'sec-edgar'}
            onChange={(e) => setFormat(e.target.value as any)}
          />
          SEC Edgar (USA)
        </label>
        <label>
          <input
            type="radio"
            value="pdf"
            checked={format === 'pdf'}
            onChange={(e) => setFormat(e.target.value as any)}
          />
          PDF Document
        </label>
      </div>

      <button
        onClick={handleExport}
        disabled={loading || directorIds.length === 0}
      >
        {loading ? 'Generating...' : `Export ${directorIds.length} Director(s)`}
      </button>

      {content && (
        <div className="preview">
          <h3>Preview</h3>
          <pre>{content.substring(0, 500)}...</pre>
        </div>
      )}
    </div>
  )
}
```

### Framer Motion Export Button

```typescript
import { motion } from 'framer-motion'

export function ExportButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={loading ? { opacity: 0.5 } : { opacity: 1 }}
      className="export-button"
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="spinner"
          />
          Generating...
        </>
      ) : (
        'Export for Filing'
      )}
    </motion.button>
  )
}
```

---

## Backend Integration

### Utility Functions

Use the provided `filing-export-utils.ts` for common formatting tasks:

```typescript
import {
  formatDirectorBioSedar2,
  formatDirectorBioSecEdgar,
  validateDirectorForExport,
  trackExportDownload,
  getExportStatistics
} from '@/lib/filing-export-utils'

// Format director biography
const sedar2Bio = formatDirectorBioSedar2(director)
const secEdgarBio = formatDirectorBioSecEdgar(director)

// Validate before export
const validation = validateDirectorForExport(director)
if (!validation.valid) {
  console.error('Validation errors:', validation.errors)
}

// Track export for audit trail
const downloadKey = await trackExportDownload(
  companyId,
  'sedar2',
  directorIds,
  fileSize,
  userId,
  ipAddress,
  userAgent
)

// Get statistics
const stats = await getExportStatistics(companyId)
console.log(`Total exports: ${stats.totalExports}`)
console.log(`By format:`, stats.byFormat)
```

### Extend with Custom Logic

```typescript
// Add to existing route handler
import { POST } from '@/app/api/directors-officers/export/sedar2/route'
import { trackExportDownload } from '@/lib/filing-export-utils'

export async function POST(req: NextRequest) {
  // Call existing endpoint
  const response = await POST(req)

  // Add custom tracking
  if (response.status === 200) {
    const data = await response.json()
    const downloadKey = await trackExportDownload(
      companyId,
      'sedar2',
      directorIds,
      data.sedar2Content.length
    )
    console.log(`Export tracked with key: ${downloadKey}`)
  }

  return response
}
```

---

## Advanced Features

### Batch Export Multiple Formats

```typescript
async function exportAllFormats(
  directorIds: string[],
  companyId: string
) {
  const token = await getAuthToken()

  const [sedar2, secEdgar, pdf] = await Promise.all([
    axios.post('/api/directors-officers/export/sedar2', { directorIds }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.post('/api/directors-officers/export/sec-edgar', { directorIds, format: 'html' }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.post('/api/directors-officers/export/pdf', { directorIds }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  ])

  return {
    sedar2: sedar2.data.sedar2Content,
    secEdgar: secEdgar.data.content,
    pdf: pdf.data.pdfUrl
  }
}
```

### Email Export as Attachment

```typescript
import nodemailer from 'nodemailer'
import axios from 'axios'

async function emailDirectorBios(
  directorIds: string[],
  recipientEmail: string
) {
  // Generate SEDAR2 export
  const sedar2Response = await axios.post(
    '/api/directors-officers/export/sedar2',
    { directorIds }
  )

  const transporter = nodemailer.createTransport({
    // Configure your email provider
  })

  // Create attachment from sedar2 content
  const sedar2Buffer = Buffer.from(sedar2Response.data.sedar2Content)

  await transporter.sendMail({
    from: 'noreply@ipoready.com',
    to: recipientEmail,
    subject: 'Director Biographies Export - SEDAR2 Format',
    text: 'Please find the director biographies in SEDAR2 format attached.',
    attachments: [
      {
        filename: `directors-sedar2-${new Date().toISOString().split('T')[0]}.txt`,
        content: sedar2Buffer
      }
    ]
  })
}
```

### Export to Prospectus Document

```typescript
import { sql } from '@/lib/db'

async function exportToPerspectus(
  directorIds: string[],
  prospectusDocumentId: string
) {
  // Generate export
  const response = await axios.post(
    '/api/directors-officers/export/sedar2',
    { directorIds }
  )

  // Store in prospectus document
  await sql`
    UPDATE prospectus_documents
    SET
      management_section = ${response.data.sedar2Content},
      updated_at = NOW()
    WHERE id = ${prospectusDocumentId}
  `
}
```

### Schedule Periodic Cleanup

```typescript
import { sql } from '@/lib/db'
import { cleanupExpiredExports } from '@/lib/filing-export-utils'

// Run daily cleanup (e.g., via cron job)
export async function runDailyCleanup() {
  const cleanedCount = await cleanupExpiredExports()
  console.log(`Cleaned up ${cleanedCount} expired exports`)
}

// Or use a scheduled task endpoint
export async function GET(req: NextRequest) {
  const cleanedCount = await cleanupExpiredExports()
  return NextResponse.json({
    success: true,
    cleanedCount
  })
}
```

---

## API Integration Checklist

- [ ] Install pdfkit and dependencies
- [ ] Run database migration for export tracking table
- [ ] Create export endpoints:
  - [ ] `/export/sedar2`
  - [ ] `/export/sec-edgar`
  - [ ] `/export/pdf`
- [ ] Test each endpoint with sample data
- [ ] Integrate filing-export-utils.ts
- [ ] Add frontend UI component
- [ ] Set up export download tracking
- [ ] Configure email integration (optional)
- [ ] Set up periodic cleanup job
- [ ] Add error handling and logging
- [ ] Write integration tests
- [ ] Update documentation

---

## Testing

### Unit Tests

```typescript
import { formatDirectorBioSedar2, validateDirectorForExport } from '@/lib/filing-export-utils'

describe('Filing Export Utils', () => {
  it('should format director biography for SEDAR2', () => {
    const director = {
      name: 'John Smith',
      professional_title: 'CEO',
      bio: 'Experienced executive',
      certifications: ['CPA'],
      years_of_experience: 20,
      past_board_positions: [],
      linkedin_verified: true,
      verification_status: 'verified',
      professional_id: 'uuid',
      industries: []
    }

    const bio = formatDirectorBioSedar2(director)
    expect(bio).toContain('John Smith')
    expect(bio).toContain('CPA')
    expect(bio).toContain('20 years')
  })

  it('should validate director for export', () => {
    const director = {
      name: 'John Smith',
      professional_title: 'CEO',
      bio: null,
      certifications: [],
      years_of_experience: null,
      past_board_positions: [],
      linkedin_verified: false,
      verification_status: 'unverified',
      professional_id: 'uuid',
      industries: []
    }

    const validation = validateDirectorForExport(director)
    expect(validation.valid).toBe(true)
    expect(validation.warnings.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests

```typescript
describe('POST /api/directors-officers/export/sedar2', () => {
  it('should export directors in SEDAR2 format', async () => {
    const response = await fetch('/api/directors-officers/export/sedar2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        directorIds: [directorId1, directorId2]
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.format).toBe('text')
    expect(data.sedar2Content).toContain('MANAGEMENT AND DIRECTORS')
    expect(data.directorCount).toBe(2)
  })

  it('should return 400 for empty directorIds', async () => {
    const response = await fetch('/api/directors-officers/export/sedar2', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ directorIds: [] })
    })

    expect(response.status).toBe(400)
  })
})
```

---

## Troubleshooting

### Common Issues

**PDF Generation Fails**

```
Error: Could not find pdfkit
```

Solution: Ensure pdfkit is installed and in package.json

```bash
npm install pdfkit @types/pdfkit
```

**Missing Directors**

```
Error: No directors found with provided IDs
```

Solution: Verify director IDs exist in database and belong to user's company

```typescript
// Debug query
const directors = await sql`
  SELECT id, name FROM professionals WHERE id = ANY(${directorIds})
`
console.log('Found directors:', directors)
```

**Database Connection Error**

```
Error: Failed to connect to database
```

Solution: Check database migration ran successfully

```bash
# Verify table exists
psql -U postgres -d ipoready -c "\dt director_export_downloads"
```

**Large File Generation Timeout**

For exports with 50+ directors, consider:

1. Splitting into smaller batches
2. Increasing API timeout
3. Using background job queue (Bull, RabbitMQ)

```typescript
// Process in batches
const batchSize = 10
for (let i = 0; i < directorIds.length; i += batchSize) {
  const batch = directorIds.slice(i, i + batchSize)
  await generateExport(batch)
}
```

---

## Performance Optimization

### Caching

```typescript
import NodeCache from 'node-cache'

const exportCache = new NodeCache({ stdTTL: 3600 }) // 1 hour

export async function getCachedExport(directorIds: string[], format: string) {
  const cacheKey = `${format}-${directorIds.sort().join('-')}`
  
  const cached = exportCache.get(cacheKey)
  if (cached) return cached

  const result = await generateExport(directorIds, format)
  exportCache.set(cacheKey, result)
  return result
}
```

### Database Indexing

The migration includes optimal indexes:

```sql
-- Already created in migration:
INDEX idx_company_id (company_id)
INDEX idx_download_key (download_key)
INDEX idx_director_export_company_date (company_id, created_at DESC)
INDEX idx_director_export_status_expires (status, expires_at)
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid NextAuth session
2. **Authorization**: Exports limited to user's own company
3. **File Cleanup**: Exports expire after 7 days
4. **Audit Trail**: All exports tracked with timestamps and user info
5. **Rate Limiting**: Consider adding rate limiting for production
6. **Data Sanitization**: Director data is escaped for safe output

---

## Version Compatibility

- **Next.js**: 14.0+
- **Node**: 18.0+
- **pdfkit**: 0.18+
- **TypeScript**: 5.0+

---

## Support

For issues or questions:

1. Check [README.md](./README.md) for endpoint details
2. Review [Directors API README](../README.md) for context
3. Check application logs for error messages
4. Test with cURL to isolate frontend vs. backend issues
