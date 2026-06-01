import { Resend } from 'resend'

// Lazily instantiate so build-time page collection doesn't crash
// when RESEND_API_KEY is not yet set in the environment.
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key || key.startsWith('re_your')) {
      throw new Error('RESEND_API_KEY is not configured. Add it to your environment variables.')
    }
    _resend = new Resend(key)
  }
  return _resend
}

// Keep a convenience re-export for call sites that use resend.emails.send(…)
export const resend = {
  emails: {
    send: (params: Parameters<Resend['emails']['send']>[0]) => getResend().emails.send(params),
  },
}

export const FROM_ADDRESS = 'IPOReady <hello@ipoready.com>'
export const APP_URL = process.env.NEXTAUTH_URL ?? 'https://www.ipoready.ai'
