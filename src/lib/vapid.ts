/**
 * VAPID (Voluntary Application Server Identification) Setup
 * Used to securely identify the application server to push services
 *
 * Generate keys locally:
 * npx web-push generate-vapid-keys
 *
 * Then set in .env.local:
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 * VAPID_PRIVATE_KEY=...
 * VAPID_SUBJECT=mailto:hello@ipoready.com
 */

export function getVapidPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!key) {
    console.warn(
      'NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set. Web push notifications will not work. ' +
      'Generate VAPID keys with: npx web-push generate-vapid-keys'
    )
    return ''
  }
  return key
}

export function getVapidPrivateKey(): string {
  const key = process.env.VAPID_PRIVATE_KEY
  if (!key) {
    throw new Error(
      'VAPID_PRIVATE_KEY is not set. Cannot send push notifications. ' +
      'Generate VAPID keys with: npx web-push generate-vapid-keys'
    )
  }
  return key
}

export function getVapidSubject(): string {
  return process.env.VAPID_SUBJECT || 'mailto:hello@ipoready.com'
}

/**
 * Check if VAPID keys are properly configured
 */
export function isVapidConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || publicKey.includes('replace-with')) {
    return false
  }
  if (!privateKey || privateKey.includes('replace-with')) {
    return false
  }

  return true
}
