import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'ipo-ready-prospectus-documents'
const S3_REGION = process.env.AWS_REGION || 'us-east-1'

interface StorageResult {
  s3_key: string
  url: string
  expiresAt: string
}

/**
 * Upload a prospectus document to S3
 * Returns S3 key and public URL for future retrieval
 */
export async function uploadProspectusFile(
  prospectusId: string,
  buffer: Buffer,
  filename: string
): Promise<StorageResult> {
  try {
    // Generate S3 key: prospectus/{prospectusId}/{timestamp}-{filename}
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const s3_key = `prospectus/${prospectusId}/${timestamp}-${sanitizedFilename}`

    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3_key,
      Body: buffer,
      ContentType: getContentType(filename),
      Metadata: {
        prospectusId,
        originalFilename: filename,
        uploadedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(putCommand)

    // Generate signed URL valid for 7 days
    const expirySeconds = 7 * 24 * 60 * 60 // 7 days
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3_key,
    })

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: expirySeconds,
    })

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString()

    return {
      s3_key,
      url: signedUrl,
      expiresAt,
    }
  } catch (error) {
    console.error('[S3 Upload Error]', {
      prospectusId,
      filename,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Delete a file from S3
 * Used for cleanup when database operations fail
 */
export async function deleteProspectusFile(s3_key: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3_key,
    })

    await s3Client.send(deleteCommand)
    console.info('[S3 Delete] Successfully deleted:', s3_key)
  } catch (error) {
    console.error('[S3 Delete Error]', {
      s3_key,
      error: error instanceof Error ? error.message : String(error),
    })
    // Don't throw - deletion is best-effort for cleanup operations
  }
}

/**
 * Generate a new signed download URL for an existing S3 object
 * Useful when previous URL has expired
 */
export async function getDownloadUrl(
  s3_key: string,
  expirySeconds: number = 3600
): Promise<{ url: string; expiresAt: string }> {
  try {
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3_key,
    })

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: expirySeconds,
    })

    const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString()

    return {
      url: signedUrl,
      expiresAt,
    }
  } catch (error) {
    console.error('[S3 Signed URL Error]', {
      s3_key,
      expirySeconds,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new Error(
      `Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Refresh an expired S3 URL for a stored file
 */
export async function refreshStorageUrl(s3_key: string): Promise<StorageResult> {
  try {
    const { url, expiresAt } = await getDownloadUrl(s3_key, 7 * 24 * 60 * 60) // 7 days

    return {
      s3_key,
      url,
      expiresAt,
    }
  } catch (error) {
    console.error('[S3 Refresh Error]', {
      s3_key,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new Error('Failed to refresh storage URL')
  }
}

/**
 * Check if an S3 object exists
 */
export async function fileExists(s3_key: string): Promise<boolean> {
  try {
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3_key,
    })

    await s3Client.send(getCommand)
    return true
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    console.warn('[S3 Check Error]', {
      s3_key,
      error: error instanceof Error ? error.message : String(error),
    })
    // Return false if we can't verify - safer than throwing
    return false
  }
}

/**
 * Helper: Determine MIME type from filename
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    csv: 'text/csv',
    txt: 'text/plain',
    text: 'text/plain',
  }

  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Health check - verify S3 connection
 */
export async function checkS3Connection(): Promise<boolean> {
  try {
    // Try to list objects with limit 1 - minimal operation
    const testKey = `health-check/${Date.now()}`
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: testKey,
      Body: Buffer.from('health-check'),
    })

    await s3Client.send(putCommand)

    // Clean up
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: testKey,
    })

    await s3Client.send(deleteCommand)

    return true
  } catch (error) {
    console.error('[S3 Health Check Failed]', error)
    return false
  }
}
