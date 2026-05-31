/**
 * WhatsApp Service
 * Sends WhatsApp messages via Twilio, logs them to database,
 * and provides message status tracking
 */

import twilio from 'twilio'
import { sql } from '@/lib/db'
import { renderWhatsAppMessage, TemplateId, validateTemplateVariables } from '@/lib/whatsapp-templates'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

let _client: ReturnType<typeof twilio> | null = null

/**
 * Get or initialize Twilio client
 * Gracefully handles missing credentials (logs warning, client stays null)
 */
function getClient(): ReturnType<typeof twilio> | null {
  if (!accountSid || !authToken) {
    if (!_client) {
      console.warn('[whatsapp-service] Twilio credentials not set — messages will be logged but not sent')
    }
    return null
  }

  if (!_client) {
    _client = twilio(accountSid, authToken)
  }
  return _client
}

/**
 * Validate phone number is in E.164 format
 * E.164: + followed by 7-15 digits
 */
export function validatePhoneNumber(phoneNumber: string): { valid: boolean; error?: string } {
  const clean = phoneNumber.trim()
  if (!clean) {
    return { valid: false, error: 'Phone number cannot be empty' }
  }

  if (!/^\+\d{7,15}$/.test(clean)) {
    return {
      valid: false,
      error: 'Phone number must be in E.164 format, e.g., +16135551234',
    }
  }

  return { valid: true }
}

/**
 * Format phone number to E.164 if needed
 * If it doesn't start with +, adds +
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const clean = phoneNumber.trim()
  if (!clean.startsWith('+')) {
    return `+${clean}`
  }
  return clean
}

export interface SendMessageOptions {
  templateId: TemplateId
  variables: Record<string, any>
  phoneNumber: string
  userId?: string
  companyId?: string
}

/**
 * Send a WhatsApp message via template
 * Logs to database regardless of Twilio availability
 * Returns messageId for tracking
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<string> {
  const { templateId, variables, phoneNumber, userId, companyId } = options

  // Validate variables
  const validation = validateTemplateVariables(templateId, variables)
  if (!validation.valid) {
    throw new Error(
      `Missing template variables for ${templateId}: ${validation.missing.join(', ')}`
    )
  }

  // Render message
  const messageBody = renderWhatsAppMessage(templateId, variables)

  // Validate phone number
  const phoneValidation = validatePhoneNumber(phoneNumber)
  if (!phoneValidation.valid) {
    throw new Error(phoneValidation.error)
  }

  const formattedPhone = formatPhoneNumber(phoneNumber)
  const client = getClient()
  let twilioMessageId: string | null = null
  let sendStatus: 'sent' | 'failed' | 'queued' = 'queued'
  let errorMessage: string | null = null

  try {
    if (client) {
      // Send via Twilio
      const toNumber = formattedPhone.startsWith('whatsapp:') ? formattedPhone : `whatsapp:${formattedPhone}`

      const response = await client.messages.create({
        from: fromNumber,
        to: toNumber,
        body: messageBody,
      })

      twilioMessageId = response.sid
      sendStatus = 'sent'
    } else {
      // No Twilio client — just log to DB
      console.log(`[whatsapp-service] Would send to ${formattedPhone}: ${messageBody}`)
      sendStatus = 'queued'
    }
  } catch (err) {
    sendStatus = 'failed'
    errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`[whatsapp-service] Failed to send message: ${errorMessage}`)
  }

  // Log to database
  const logResult = await sql`
    INSERT INTO whatsapp_logs (
      phone_number,
      template_id,
      message_body,
      status,
      twilio_msg_id,
      user_id,
      company_id,
      error,
      sent_at
    )
    VALUES (
      ${formattedPhone},
      ${templateId},
      ${messageBody},
      ${sendStatus},
      ${twilioMessageId},
      ${userId || null},
      ${companyId || null},
      ${errorMessage},
      NOW()
    )
    RETURNING id
  `

  if (!logResult.length) {
    throw new Error('Failed to log message to database')
  }

  const messageId = (logResult[0] as { id: string }).id

  return messageId
}

/**
 * Get message delivery status by message ID
 */
export async function getMessageStatus(messageId: string): Promise<{
  id: string
  status: string
  sentAt: string
  deliveredAt: string | null
  failedAt: string | null
  twilio_msg_id: string | null
  error: string | null
}> {
  const rows = await sql`
    SELECT id, status, sent_at, delivered_at, failed_at, twilio_msg_id, error
    FROM whatsapp_logs
    WHERE id = ${messageId}
    LIMIT 1
  `

  if (!rows.length) {
    throw new Error(`Message not found: ${messageId}`)
  }

  const row = rows[0] as any
  return {
    id: row.id,
    status: row.status,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at,
    failedAt: row.failed_at,
    twilio_msg_id: row.twilio_msg_id,
    error: row.error,
  }
}

/**
 * Update message status from Twilio webhook receipt
 */
export async function updateMessageStatus(
  twilioMessageId: string,
  status: 'delivered' | 'failed' | 'sent',
  error?: string,
): Promise<void> {
  const timestamp = new Date().toISOString()

  const field = status === 'delivered' ? 'delivered_at' : status === 'failed' ? 'failed_at' : null

  if (field) {
    await sql`
      UPDATE whatsapp_logs
      SET
        status = ${status},
        ${field === 'delivered_at' ? sql`delivered_at` : sql`failed_at`} = ${timestamp},
        error = ${error || null}
      WHERE twilio_msg_id = ${twilioMessageId}
    `
  }
}

/**
 * Get recent messages for a user
 */
export async function getUserMessages(userId: string, limit = 20): Promise<Array<{
  id: string
  phoneNumber: string
  templateId: string
  messageBody: string
  status: string
  sentAt: string
}>> {
  const rows = await sql`
    SELECT id, phone_number, template_id, message_body, status, sent_at
    FROM whatsapp_logs
    WHERE user_id = ${userId}
    ORDER BY sent_at DESC
    LIMIT ${limit}
  `

  return (rows as any[]).map(r => ({
    id: r.id,
    phoneNumber: r.phone_number,
    templateId: r.template_id,
    messageBody: r.message_body,
    status: r.status,
    sentAt: r.sent_at,
  }))
}

/**
 * Get message statistics for a company
 */
export async function getCompanyMessageStats(companyId: string): Promise<{
  total: number
  sent: number
  delivered: number
  failed: number
  queued: number
}> {
  const rows = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued
    FROM whatsapp_logs
    WHERE company_id = ${companyId}
  `

  if (!rows.length) {
    return { total: 0, sent: 0, delivered: 0, failed: 0, queued: 0 }
  }

  const row = rows[0] as any
  return {
    total: Number(row.total),
    sent: Number(row.sent),
    delivered: Number(row.delivered),
    failed: Number(row.failed),
    queued: Number(row.queued),
  }
}
