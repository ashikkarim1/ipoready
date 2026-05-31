/**
 * Push Notification System Health Check
 * Validates configuration and database setup
 */

import { isVapidConfigured, getVapidPublicKey, getVapidPrivateKey } from './vapid'
import { sql } from './db'

export interface HealthCheckResult {
  isHealthy: boolean
  vapid: {
    configured: boolean
    publicKeySet: boolean
    privateKeySet: boolean
  }
  database: {
    tableExists: boolean
    canQuery: boolean
    error?: string
  }
  serviceworker: {
    expected: boolean
  }
  errors: string[]
}

/**
 * Check the health of the push notification system
 */
export async function checkPushHealth(): Promise<HealthCheckResult> {
  const errors: string[] = []

  // Check VAPID configuration
  const vapidConfigured = isVapidConfigured()
  const publicKeySet = Boolean(getVapidPublicKey())
  const privateKeySet = (() => {
    try {
      return Boolean(getVapidPrivateKey())
    } catch {
      return false
    }
  })()

  if (!vapidConfigured) {
    errors.push(
      'VAPID keys not properly configured. Generate with: npx web-push generate-vapid-keys'
    )
  }

  // Check database
  let tableExists = false
  let canQuery = true
  let dbError: string | undefined

  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'push_subscriptions'
      ) as exists;
    `

    tableExists = result && result.length > 0 && (result[0] as any).exists

    if (!tableExists) {
      errors.push(
        'push_subscriptions table does not exist. Run: psql $DATABASE_URL < scripts/migration-push-subscriptions.sql'
      )
    }
  } catch (error) {
    canQuery = false
    dbError = error instanceof Error ? error.message : 'Unknown database error'
    errors.push(`Database error: ${dbError}`)
  }

  // Check service worker file
  // Note: This check is basic - we can't verify the file exists from server
  const serviceworkerExpected = true // File should exist at /public/service-worker.js

  const isHealthy = errors.length === 0 && vapidConfigured && tableExists && canQuery

  return {
    isHealthy,
    vapid: {
      configured: vapidConfigured,
      publicKeySet,
      privateKeySet,
    },
    database: {
      tableExists,
      canQuery,
      ...(dbError && { error: dbError }),
    },
    serviceworker: {
      expected: serviceworkerExpected,
    },
    errors,
  }
}

/**
 * Log health check results
 */
export async function logPushHealth(): Promise<void> {
  const health = await checkPushHealth()

  console.log('=== Push Notification System Health Check ===')
  console.log(`Overall Status: ${health.isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`)
  console.log('')

  console.log('VAPID Configuration:')
  console.log(`  Public Key Set:  ${health.vapid.publicKeySet ? '✅' : '❌'}`)
  console.log(`  Private Key Set: ${health.vapid.privateKeySet ? '✅' : '❌'}`)
  console.log(`  Configured:      ${health.vapid.configured ? '✅' : '❌'}`)
  console.log('')

  console.log('Database:')
  console.log(`  Table Exists: ${health.database.tableExists ? '✅' : '❌'}`)
  console.log(`  Can Query:    ${health.database.canQuery ? '✅' : '❌'}`)
  if (health.database.error) {
    console.log(`  Error:        ${health.database.error}`)
  }
  console.log('')

  console.log('Service Worker:')
  console.log(`  Expected:     ${health.serviceworker.expected ? '✅' : '❌'}`)
  console.log('')

  if (health.errors.length > 0) {
    console.log('Errors:')
    health.errors.forEach((error) => {
      console.log(`  - ${error}`)
    })
  }

  console.log('==========================================')
}

/**
 * Validate push configuration before starting the server
 */
export async function validatePushConfiguration(): Promise<boolean> {
  console.log('Validating push notification configuration...')

  const health = await checkPushHealth()

  if (!health.isHealthy) {
    console.error('❌ Push notification configuration validation failed!')
    console.error('')
    health.errors.forEach((error) => {
      console.error(`  - ${error}`)
    })
    console.error('')
    console.error('Please fix the above issues before using push notifications.')
    return false
  }

  console.log('✅ Push notification configuration is valid')
  return true
}

/**
 * Get a summary of push system status for monitoring/dashboards
 */
export async function getPushSystemStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  details: Record<string, any>
}> {
  const health = await checkPushHealth()

  if (health.isHealthy) {
    return {
      status: 'healthy',
      message: 'Push notification system is operational',
      details: health,
    }
  }

  if (health.database.canQuery && health.database.tableExists && health.vapid.configured) {
    return {
      status: 'degraded',
      message: 'Push notification system has minor issues',
      details: health,
    }
  }

  return {
    status: 'unhealthy',
    message: 'Push notification system is not operational',
    details: health,
  }
}
