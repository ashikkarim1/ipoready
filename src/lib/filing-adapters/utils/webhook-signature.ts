/**
 * Webhook Signature Verification
 * ==============================
 * Secure webhook validation for SEDAR and SEC EDGAR filing notifications
 * Handles: HMAC-SHA256 signing, signature verification, timestamp validation
 * Prevents replay attacks with 5-minute window validation
 */

import * as crypto from 'crypto'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WebhookSignatureOptions {
  secret: string
  timestamp: string
  signature: string
  payload: string | Record<string, any>
  toleranceSeconds?: number
}

export interface VerificationResult {
  isValid: boolean
  signatureMatches: boolean
  timestampValid: boolean
  errors: string[]
  timestamp: Date
  age?: number // seconds since webhook was signed
}

export interface SignatureGenerationOptions {
  secret: string
  payload: string | Record<string, any>
  timestamp?: string
}

export interface SignatureData {
  signature: string
  timestamp: string
  payload: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TOLERANCE_SECONDS = 5 * 60 // 5 minutes
const ALGORITHM = 'sha256'
const ENCODING = 'hex'

// ============================================================================
// SIGNATURE GENERATION
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for webhook payload
 * Format: signature = HMAC-SHA256(secret, timestamp.payload)
 */
export function generateWebhookSignature(
  options: SignatureGenerationOptions
): SignatureData {
  const {
    secret,
    payload,
    timestamp = Math.floor(Date.now() / 1000).toString(),
  } = options

  if (!secret || secret.length === 0) {
    throw new Error('Secret is required for signature generation')
  }

  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)

  if (!payloadString || payloadString.length === 0) {
    throw new Error('Payload cannot be empty')
  }

  const signatureData = `${timestamp}.${payloadString}`

  try {
    const signature = crypto
      .createHmac(ALGORITHM, secret)
      .update(signatureData)
      .digest(ENCODING)

    return {
      signature,
      timestamp,
      payload: payloadString,
    }
  } catch (error) {
    throw new Error(`Failed to generate signature: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verify webhook signature and timestamp
 * Returns detailed verification result with error reporting
 */
export function verifyWebhookSignature(
  options: WebhookSignatureOptions
): VerificationResult {
  const {
    secret,
    timestamp,
    signature,
    payload,
    toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  } = options

  const errors: string[] = []
  const startTime = new Date()

  // Validate inputs
  if (!secret || secret.length === 0) {
    errors.push('Secret is required for verification')
  }

  if (!timestamp) {
    errors.push('Timestamp is required')
  }

  if (!signature) {
    errors.push('Signature is required')
  }

  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)

  if (!payloadString || payloadString.length === 0) {
    errors.push('Payload cannot be empty')
  }

  // Return early if there are validation errors
  if (errors.length > 0) {
    return {
      isValid: false,
      signatureMatches: false,
      timestampValid: false,
      errors,
      timestamp: startTime,
    }
  }

  // Verify timestamp
  const timestampValid = validateTimestamp(timestamp, toleranceSeconds)
  if (!timestampValid) {
    errors.push(
      `Timestamp is outside tolerance window (${toleranceSeconds} seconds). ` +
      `Webhook may be a replay attack.`
    )
  }

  // Verify signature
  let signatureMatches = false
  try {
    const signatureData = `${timestamp}.${payloadString}`
    const expectedSignature = crypto
      .createHmac(ALGORITHM, secret)
      .update(signatureData)
      .digest(ENCODING)

    // Use constant-time comparison to prevent timing attacks
    signatureMatches = constantTimeEqual(signature, expectedSignature)

    if (!signatureMatches) {
      errors.push('Signature does not match. Request may have been tampered with.')
    }
  } catch (error) {
    errors.push(
      `Failed to verify signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  const age = calculateTimestampAge(timestamp)

  return {
    isValid: signatureMatches && timestampValid,
    signatureMatches,
    timestampValid,
    errors,
    timestamp: startTime,
    age,
  }
}

// ============================================================================
// TIMESTAMP VALIDATION
// ============================================================================

/**
 * Validate webhook timestamp to prevent replay attacks
 * Checks if timestamp is within tolerance window (default 5 minutes)
 */
export function validateTimestamp(
  timestamp: string,
  toleranceSeconds: number = DEFAULT_TOLERANCE_SECONDS
): boolean {
  try {
    const timestampSeconds = parseInt(timestamp, 10)

    if (isNaN(timestampSeconds)) {
      return false
    }

    if (timestampSeconds <= 0) {
      return false
    }

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const age = Math.abs(currentTimestamp - timestampSeconds)

    // Timestamp must be within tolerance window
    if (age > toleranceSeconds) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Calculate age of timestamp in seconds
 * Useful for logging and monitoring
 */
export function calculateTimestampAge(timestamp: string): number {
  try {
    const timestampSeconds = parseInt(timestamp, 10)
    const currentTimestamp = Math.floor(Date.now() / 1000)
    return Math.abs(currentTimestamp - timestampSeconds)
  } catch {
    return -1
  }
}

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Constant-time comparison to prevent timing attacks
 * Compares two strings byte-by-byte without early exit
 */
function constantTimeEqual(a: string, b: string): boolean {
  // Convert to buffers for comparison
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  // If lengths differ, they can't be equal
  // But still compare all bytes to maintain constant time
  if (bufferA.length !== bufferB.length) {
    // Still do a comparison to maintain constant time
    const minLength = Math.min(bufferA.length, bufferB.length)
    let result = 1 // Start with non-zero to indicate difference

    for (let i = 0; i < minLength; i++) {
      result |= bufferA[i] ^ bufferB[i]
    }

    // Add the length difference to the result
    result |= bufferA.length ^ bufferB.length

    return result === 0
  }

  // Lengths are equal, compare byte by byte
  let result = 0
  for (let i = 0; i < bufferA.length; i++) {
    result |= bufferA[i] ^ bufferB[i]
  }

  return result === 0
}

// ============================================================================
// WEBHOOK REQUEST VALIDATION
// ============================================================================

export interface WebhookRequest {
  headers: Record<string, string | string[] | undefined>
  body: string | Record<string, any>
  rawBody?: Buffer
}

export interface WebhookValidationOptions {
  secret: string
  toleranceSeconds?: number
}

/**
 * Validate complete webhook request
 * Extracts signature and timestamp from headers and verifies
 */
export function validateWebhookRequest(
  request: WebhookRequest,
  options: WebhookValidationOptions
): VerificationResult {
  const { secret, toleranceSeconds } = options
  const errors: string[] = []

  // Extract signature from headers (common header names)
  const signatureHeader =
    request.headers['x-signature'] ||
    request.headers['x-webhook-signature'] ||
    request.headers['signature'] ||
    undefined

  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : (signatureHeader as string | undefined)

  // Extract timestamp from headers
  const timestampHeader =
    request.headers['x-timestamp'] ||
    request.headers['x-webhook-timestamp'] ||
    request.headers['timestamp'] ||
    undefined

  const timestamp = Array.isArray(timestampHeader) ? timestampHeader[0] : (timestampHeader as string | undefined)

  if (!signature) {
    errors.push('No signature found in request headers')
    return {
      isValid: false,
      signatureMatches: false,
      timestampValid: false,
      errors,
      timestamp: new Date(),
    }
  }

  if (!timestamp) {
    errors.push('No timestamp found in request headers')
    return {
      isValid: false,
      signatureMatches: false,
      timestampValid: false,
      errors,
      timestamp: new Date(),
    }
  }

  // Use raw body if available, otherwise serialize body
  const payload = request.rawBody ? request.rawBody.toString('utf-8') : request.body

  return verifyWebhookSignature({
    secret,
    timestamp,
    signature,
    payload,
    toleranceSeconds,
  })
}

// ============================================================================
// BATCH VERIFICATION
// ============================================================================

export interface BatchVerificationResult {
  total: number
  valid: number
  invalid: number
  details: VerificationResult[]
}

/**
 * Verify multiple webhook signatures in batch
 * Useful for processing multiple webhooks or testing
 */
export function verifyWebhooksInBatch(
  webhooks: Array<WebhookSignatureOptions>
): BatchVerificationResult {
  const results = webhooks.map((webhook) => verifyWebhookSignature(webhook))

  const validCount = results.filter((r) => r.isValid).length

  return {
    total: results.length,
    valid: validCount,
    invalid: results.length - validCount,
    details: results,
  }
}

// ============================================================================
// LOGGING & MONITORING
// ============================================================================

export interface VerificationLog {
  timestamp: Date
  filingId?: string
  system?: 'sedar' | 'sec-edgar'
  signatureMatches: boolean
  timestampValid: boolean
  age?: number
  errorCount: number
  errors: string[]
}

/**
 * Create a log entry for webhook verification
 * Useful for audit trails and monitoring
 */
export function createVerificationLog(
  result: VerificationResult,
  context?: {
    filingId?: string
    system?: 'sedar' | 'sec-edgar'
  }
): VerificationLog {
  return {
    timestamp: result.timestamp,
    filingId: context?.filingId,
    system: context?.system,
    signatureMatches: result.signatureMatches,
    timestampValid: result.timestampValid,
    age: result.age,
    errorCount: result.errors.length,
    errors: result.errors,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateWebhookSignature,
  verifyWebhookSignature,
  validateTimestamp,
  calculateTimestampAge,
  validateWebhookRequest,
  verifyWebhooksInBatch,
  createVerificationLog,
}
