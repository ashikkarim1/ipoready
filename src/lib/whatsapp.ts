import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken  = process.env.TWILIO_AUTH_TOKEN!
const fromNumber = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886' // Twilio sandbox default

let _client: ReturnType<typeof twilio> | null = null
function getClient() {
  if (!_client) _client = twilio(accountSid, authToken)
  return _client
}

/**
 * Send a WhatsApp message via Twilio.
 * `to` should be a bare phone number with country code e.g. "+16135551234"
 */
export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  await getClient().messages.create({ from: fromNumber, to: toNumber, body })
}

/**
 * Download a Twilio media URL (voice note) as a Buffer.
 * Twilio requires Basic Auth to fetch media.
 */
export async function fetchTwilioMedia(mediaUrl: string): Promise<Buffer> {
  const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const res = await fetch(mediaUrl, { headers: { Authorization: `Basic ${creds}` } })
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Transcribe an audio buffer using OpenAI Whisper.
 * Supports OGG (WhatsApp voice notes), MP3, MP4, WAV, WEBM.
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/ogg'): Promise<string> {
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const ext = mimeType.includes('ogg') ? 'ogg'
    : mimeType.includes('mp4') || mimeType.includes('m4a') ? 'mp4'
    : mimeType.includes('webm') ? 'webm'
    : 'mp3'

  // OpenAI requires a File-like object with a name property
  // Convert Buffer → Uint8Array to avoid SharedArrayBuffer TS incompatibility
  const file = new File([new Uint8Array(audioBuffer)], `audio.${ext}`, { type: mimeType })
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'en',
  })
  return response.text
}
