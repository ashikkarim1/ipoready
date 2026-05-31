/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Runs once when the server starts (both dev and production).
 * Used to validate required environment variables at boot time.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { checkEnv } = await import('./src/lib/env-check')
    checkEnv()
  }
}
