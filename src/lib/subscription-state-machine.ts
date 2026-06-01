/**
 * Subscription State Machine
 * Enforces valid state transitions for subscription lifecycle
 * Prevents invalid state transitions (e.g., past_due -> past_due)
 */

import { sql } from '@/lib/db'

export type SubscriptionState =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'payment_attempted'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'unrecoverable'

export interface StateTransitionRule {
  from: SubscriptionState[]
  to: SubscriptionState
  trigger: string
  allowedOnly: boolean // if true, transition only to this state; if false, transition is forbidden
}

/**
 * Define all valid subscription state transitions
 * Format: from_state -> to_state via trigger
 */
const VALID_TRANSITIONS: Map<string, StateTransitionRule> = new Map([
  // Trial lifecycle
  ['trialing->active', {
    from: ['trialing'],
    to: 'active',
    trigger: 'invoice.payment_succeeded (trial end with payment)',
    allowedOnly: true,
  }],
  ['trialing->expired', {
    from: ['trialing'],
    to: 'expired',
    trigger: 'trial.expired (no payment method)',
    allowedOnly: true,
  }],
  ['trialing->cancelled', {
    from: ['trialing'],
    to: 'cancelled',
    trigger: 'customer.subscription.deleted',
    allowedOnly: true,
  }],

  // Active subscription lifecycle
  ['active->past_due', {
    from: ['active'],
    to: 'past_due',
    trigger: 'invoice.payment_failed',
    allowedOnly: true,
  }],
  ['active->suspended', {
    from: ['active'],
    to: 'suspended',
    trigger: 'manual_suspension (admin action)',
    allowedOnly: true,
  }],
  ['active->cancelled', {
    from: ['active'],
    to: 'cancelled',
    trigger: 'customer.subscription.deleted',
    allowedOnly: true,
  }],

  // Past due recovery
  ['past_due->active', {
    from: ['past_due'],
    to: 'active',
    trigger: 'invoice.payment_succeeded (retry successful)',
    allowedOnly: true,
  }],
  ['past_due->payment_attempted', {
    from: ['past_due'],
    to: 'payment_attempted',
    trigger: 'payment_retry_queued',
    allowedOnly: true,
  }],
  ['past_due->suspended', {
    from: ['past_due'],
    to: 'suspended',
    trigger: 'max_retries_exceeded',
    allowedOnly: true,
  }],
  ['past_due->cancelled', {
    from: ['past_due'],
    to: 'cancelled',
    trigger: 'customer.subscription.deleted',
    allowedOnly: true,
  }],

  // Payment attempt recovery
  ['payment_attempted->active', {
    from: ['payment_attempted'],
    to: 'active',
    trigger: 'invoice.payment_succeeded (retry successful)',
    allowedOnly: true,
  }],
  ['payment_attempted->past_due', {
    from: ['payment_attempted'],
    to: 'past_due',
    trigger: 'invoice.payment_failed (retry failed)',
    allowedOnly: true,
  }],

  // Suspended recovery
  ['suspended->active', {
    from: ['suspended'],
    to: 'active',
    trigger: 'manual_reactivation (admin action)',
    allowedOnly: true,
  }],
  ['suspended->cancelled', {
    from: ['suspended'],
    to: 'cancelled',
    trigger: 'customer.subscription.deleted',
    allowedOnly: true,
  }],

  // Cancellation is final (except unrecoverable)
  ['cancelled->unrecoverable', {
    from: ['cancelled'],
    to: 'unrecoverable',
    trigger: 'retention_period_expired (90 days)',
    allowedOnly: true,
  }],

  // Expired trial recovery
  ['expired->active', {
    from: ['expired'],
    to: 'active',
    trigger: 'manual_reactivation (admin action)',
    allowedOnly: true,
  }],
])

/**
 * Validate if a state transition is allowed
 */
export function validateStateTransition(
  currentState: SubscriptionState,
  newState: SubscriptionState,
  trigger: string
): { valid: boolean; error?: string } {
  if (currentState === newState) {
    return {
      valid: false,
      error: `Cannot transition: already in state '${currentState}'`,
    }
  }

  const transitionKey = `${currentState}->${newState}`
  const rule = VALID_TRANSITIONS.get(transitionKey)

  if (!rule) {
    return {
      valid: false,
      error: `Invalid state transition: ${transitionKey} (trigger: ${trigger})`,
    }
  }

  if (!rule.from.includes(currentState)) {
    return {
      valid: false,
      error: `Cannot transition from '${currentState}' to '${newState}'`,
    }
  }

  return { valid: true }
}

/**
 * Get valid next states from current state
 */
export function getValidNextStates(currentState: SubscriptionState): SubscriptionState[] {
  const validStates: SubscriptionState[] = []

  for (const [, rule] of VALID_TRANSITIONS.entries()) {
    if (rule.from.includes(currentState) && rule.allowedOnly) {
      if (!validStates.includes(rule.to)) {
        validStates.push(rule.to)
      }
    }
  }

  return validStates
}

/**
 * Log a state transition in security audit log
 */
export async function logStateTransition(
  companyId: string,
  subscriptionId: string,
  fromState: SubscriptionState,
  toState: SubscriptionState,
  trigger: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Validate transition
    const validation = validateStateTransition(fromState, toState, trigger)
    if (!validation.valid) {
      console.error(
        `[state-machine] Invalid transition logged: ${fromState} -> ${toState}: ${validation.error}`
      )
    }

    // Log to security audit table
    await sql`
      INSERT INTO subscription_state_transitions (
        company_id,
        subscription_id,
        from_state,
        to_state,
        trigger,
        metadata,
        created_at
      )
      VALUES (
        ${companyId},
        ${subscriptionId},
        ${fromState},
        ${toState},
        ${trigger},
        ${metadata ? JSON.stringify(metadata) : null},
        NOW()
      )
    `

    console.log(
      `[state-machine] Transition: ${fromState} -> ${toState} for subscription ${subscriptionId}`
    )
  } catch (error) {
    console.error('[state-machine] Failed to log state transition:', error)
  }
}

/**
 * Update subscription status with state machine validation
 * CRITICAL: Only update if current state matches expected previous state
 */
export async function updateSubscriptionStateSecure(
  companyId: string,
  subscriptionId: string,
  newState: SubscriptionState,
  trigger: string,
  validPreviousStates: SubscriptionState[]
): Promise<{
  success: boolean
  error?: string
  previousState?: SubscriptionState
}> {
  try {
    // Get current subscription state
    const result = await sql`
      SELECT subscription_status FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    if (result.length === 0) {
      return {
        success: false,
        error: `Company not found: ${companyId}`,
      }
    }

    const currentState = (result[0] as any).subscription_status as SubscriptionState

    // Validate transition
    const validation = validateStateTransition(currentState, newState, trigger)
    if (!validation.valid) {
      console.error(`[state-machine] ${validation.error}`)
      return {
        success: false,
        error: validation.error,
        previousState: currentState,
      }
    }

    // Validate current state is in expected list (prevent concurrent modifications)
    if (!validPreviousStates.includes(currentState)) {
      console.error(
        `[state-machine] State mismatch: expected one of [${validPreviousStates.join(', ')}], got '${currentState}'`
      )
      return {
        success: false,
        error: `State mismatch: expected one of [${validPreviousStates.join(', ')}], got '${currentState}'`,
        previousState: currentState,
      }
    }

    // Update subscription status using WHERE clause for safety
    // This prevents race conditions by only updating if state hasn't changed
    const updateResult = await sql`
      UPDATE companies
      SET
        subscription_status = ${newState},
        updated_at = NOW()
      WHERE
        id = ${companyId}
        AND subscription_status IN (${validPreviousStates})
      RETURNING subscription_status
    `

    if (updateResult.length === 0) {
      console.error(
        `[state-machine] Update failed: state changed between check and update for ${companyId}`
      )
      return {
        success: false,
        error: 'State changed during update (race condition)',
        previousState: currentState,
      }
    }

    // Log the transition
    await logStateTransition(companyId, subscriptionId, currentState, newState, trigger)

    return {
      success: true,
      previousState: currentState,
    }
  } catch (error) {
    console.error('[state-machine] Failed to update subscription state:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get subscription state history
 */
export async function getSubscriptionStateHistory(
  companyId: string,
  limit = 20
): Promise<Array<Record<string, any>>> {
  try {
    const history = await sql`
      SELECT
        from_state,
        to_state,
        trigger,
        created_at,
        metadata
      FROM subscription_state_transitions
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return history as Array<Record<string, any>>
  } catch (error) {
    console.error('[state-machine] Failed to fetch state history:', error)
    return []
  }
}

/**
 * Check if subscription is in a recoverable state
 */
export function isRecoverable(state: SubscriptionState): boolean {
  const unrecoverableStates: SubscriptionState[] = ['unrecoverable', 'expired']
  return !unrecoverableStates.includes(state)
}

/**
 * Check if subscription is actively paying
 */
export function isActivePayingSubscription(state: SubscriptionState): boolean {
  const activeStates: SubscriptionState[] = ['active', 'trialing']
  return activeStates.includes(state)
}
