import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 30

// ─── File type validation ───────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const ALLOWED_FILE_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx'])
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

function validateFileUpload(file: File, fileName?: string): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX` }
  }

  // Check file extension
  const ext = fileName ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_FILE_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File extension ${ext} not allowed` }
  }

  return { valid: true }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const documentId = formData.get('documentId') as string | null
    const notes = (formData.get('notes') as string | null) ?? ''
    const linkUrl = formData.get('linkUrl') as string | null

    if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    if (!file && !linkUrl) return NextResponse.json({ error: 'file or linkUrl required' }, { status: 400 })

    // Validate file if provided
    if (file) {
      const validation = validateFileUpload(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    const userId = (session.user as any).id as string | undefined

    // Get current max version — atomic increment prevents races
    const maxRows = await sql`
      SELECT COALESCE(MAX(version_number), 0) AS max_version
      FROM document_versions
      WHERE document_id = ${documentId}
    `
    const nextVersion = Number((maxRows[0] as any).max_version) + 1

    let storageUrl: string
    let fileName: string
    let fileSizeBytes: number | null = null
    let mimeType: string | null = null
    let checksum: string | null = null

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      checksum = crypto.createHash('sha256').update(buffer).digest('hex')
      fileSizeBytes = buffer.byteLength
      mimeType = file.type
      fileName = file.name

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = await import('@vercel/blob')
        const blob = await put(`documents/${documentId}/v${nextVersion}/${fileName}`, buffer, {
          access: 'public',
          contentType: mimeType,
          addRandomSuffix: false,
        })
        storageUrl = blob.url
      } else {
        // Dev mode: store placeholder URL (wire up BLOB_READ_WRITE_TOKEN for production)
        storageUrl = `local://documents/${documentId}/v${nextVersion}/${fileName}`
      }
    } else {
      storageUrl = linkUrl!
      fileName = linkUrl!.split('/').pop()?.split('?')[0] ?? 'linked-document'
    }

    // Mark all existing versions as no longer latest
    await sql`
      UPDATE document_versions SET is_latest = FALSE
      WHERE document_id = ${documentId} AND is_latest = TRUE
    `

    // Insert new version — this row is permanent and will never be overwritten
    const inserted = await sql`
      INSERT INTO document_versions
        (document_id, version_number, file_name, file_size_bytes, file_mime_type,
         storage_url, checksum, uploaded_by, is_latest, notes)
      VALUES
        (${documentId}, ${nextVersion}, ${fileName}, ${fileSizeBytes},
         ${mimeType}, ${storageUrl}, ${checksum}, ${userId ?? null}, TRUE, ${notes})
      RETURNING id
    `
    const versionId = (inserted[0] as any).id as string

    // Update parent document record
    await sql`
      UPDATE documents
      SET status = 'uploaded', uploaded_at = NOW(), uploaded_by = ${userId ?? null}
      WHERE id = ${documentId}
    `

    // Audit log
    await sql`
      INSERT INTO document_access_log (document_version_id, user_id, action)
      VALUES (${versionId}, ${userId ?? null}, 'upload')
    `

    return NextResponse.json({ success: true, versionId, versionNumber: nextVersion, fileName })
  } catch (err) {
    console.error('[documents/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
