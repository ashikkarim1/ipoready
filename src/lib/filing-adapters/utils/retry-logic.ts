/**
 * Retry Logic
 * Exponential backoff, retry determination, and timeout handling for filing adapter operations
 * Handles: exponential backoff with jitter, retry decision logic, automatic retry wrapper, timeouts
 * Extreme care for robustness and edge cases
 */

import { FilingError, ErrorParser, RetryDeterminer } from './error-handler'

// ============================================================================
// Types
// ============================================================================

export interface RetryOptions {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitterFactor: number
  timeoutMs: number
  shouldRetry?: (error: Error, attempt: number) => boolean
  onRetry?: (error: Error, attempt: number, nextDelayMs: number) => void
  onSuccess?: (result: any, attempt: number) => void
  onFailure?: (error: Error, totalAttempts: number) => void
}

export interface RetryState {
  attempt: number
  nextDelayMs: number
  totalElapsedMs: number
  lastError?: Error
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalDurationMs: number
  finalError?: FilingError
}

export interface TimeoutOptions {
  timeoutMs: number
  abortSignal?: AbortSignal
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  timeoutMs: 60000,
}

const MIN_ATTEMPT = 1
const MAX_ATTEMPTS_ALLOWED = 10
const MAX_DELAY_MS = 60000
const MAX_TIMEOUT_MS = 300000 // 5 minutes

// ============================================================================
// Exponential Backoff Calculator
// ============================================================================

export class BackoffCalculator {
  /**
   * Calculate exponential backoff delay with jitter
   * Formula: min(maxDelay, initialDelay * (multiplier ^ (attempt - 1)) + jitter)
   */
  static calculateDelay(options: {
    attempt: number
    initialDelayMs: number
    maxDelayMs: number
    backoffMultiplier: number
    jitterFactor: number
  }): number {
    // Validate inputs
    if (!Number.isInteger(options.attempt) || options.attempt < MIN_ATTEMPT) {
      throw new Error(`Attempt must be integer >= ${MIN_ATTEMPT}`)
    }

    if (options.initialDelayMs < 0) {
      throw new Error('initialDelayMs must be non-negative')
    }

    if (options.maxDelayMs < options.initialDelayMs) {
      throw new Error('maxDelayMs must be >= initialDelayMs')
    }

    if (options.backoffMultiplier <= 1) {
      throw new Error('backoffMultiplier must be > 1')
    }

    if (options.jitterFactor < 0 || options.jitterFactor > 1) {
      throw new Error('jitterFactor must be between 0 and 1')
    }

    // Calculate base delay using exponential backoff
    // For attempt 1: delay = initialDelay
    // For attempt 2: delay = initialDelay * multiplier
    // For attempt n: delay = initialDelay * (multiplier ^ (n-1))
    const baseDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, options.attempt - 1)

    // Cap at maxDelay
    const cappedDelay = Math.min(baseDelay, options.maxDelayMs)

    // Add jitter: random amount up to jitterFactor * delay
    const jitter = Math.random() * (cappedDelay * options.jitterFactor)
    const finalDelay = cappedDelay + jitter

    // Ensure result is a valid integer
    return Math.floor(Math.min(finalDelay, options.maxDelayMs))
  }

  /**
   * Get the next delay in a sequence without randomness (for testing)
   */
  static calculateDelayDeterministic(options: {
    attempt: number
    initialDelayMs: number
    maxDelayMs: number
    backoffMultiplier: number
  }): number {
    if (!Number.isInteger(options.attempt) || options.attempt < MIN_ATTEMPT) {
      throw new Error(`Attempt must be integer >= ${MIN_ATTEMPT}`)
    }

    const baseDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, options.attempt - 1)
    return Math.floor(Math.min(baseDelay, options.maxDelayMs))
  }

  /**
   * Create a sequence of delays for planning
   */
  static createDelaySequence(options: {
    maxAttempts: number
    initialDelayMs: number
    maxDelayMs: number
    backoffMultiplier: number
  }): number[] {
    const sequence: number[] = []

    for (let i = 1; i < options.maxAttempts; i++) {
      const delay = this.calculateDelayDeterministic({
        attempt: i,
        initialDelayMs: options.initialDelayMs,
        maxDelayMs: options.maxDelayMs,
        backoffMultiplier: options.backoffMultiplier,
      })
      sequence.push(delay)
    }

    return sequence
  }
}

// ============================================================================
// Retry Logic Handler
// ============================================================================

export class RetryHandler {
  /**
   * Determine if operation should be retried
   */
  static shouldRetry(error: Error | unknown, attempt: number, customChecker?: (error: Error, attempt: number) => boolean): boolean {
    // Validate attempt number
    if (!Number.isInteger(attempt) || attempt < MIN_ATTEMPT) {
      return false
    }

    // Use custom checker if provided
    if (customChecker) {
      try {
        return customChecker(error as Error, attempt)
      } catch {
        return false
      }
    }

    // Use built-in retry determination
    if (error instanceof FilingError) {
      return error.retryable
    }

    const filingError = ErrorParser.parseAdapterError(error)
    return filingError.retryable
  }

  /**
   * Get retry recommendation for an error
   */
  static getRetryRecommendation(error: Error | unknown) {
    if (error instanceof FilingError) {
      return RetryDeterminer.getRetryRecommendation(error)
    }

    const filingError = ErrorParser.parseAdapterError(error)
    return RetryDeterminer.getRetryRecommendation(filingError)
  }
}

// ============================================================================
// Retry Wrapper Function
// ============================================================================

export class RetryWrapper {
  /**
   * Execute function with automatic retry logic
   */
  static async retryWithBackoff<T>(
    fn: (signal?: AbortSignal) => Promise<T>,
    userOptions?: Partial<RetryOptions>
  ): Promise<RetryResult<T>> {
    const options = this.mergeOptions(userOptions)

    // Validate options
    if (!Number.isInteger(options.maxAttempts) || options.maxAttempts < 1 || options.maxAttempts > MAX_ATTEMPTS_ALLOWED) {
      return this.createFailureResult(
        new FilingError('VALIDATION_ERROR', `maxAttempts must be between 1 and ${MAX_ATTEMPTS_ALLOWED}`)
      )
    }

    if (options.initialDelayMs < 0 || options.initialDelayMs > MAX_DELAY_MS) {
      return this.createFailureResult(
        new FilingError('VALIDATION_ERROR', `initialDelayMs must be between 0 and ${MAX_DELAY_MS}`)
      )
    }

    if (options.timeoutMs < 100 || options.timeoutMs > MAX_TIMEOUT_MS) {
      return this.createFailureResult(
        new FilingError('VALIDATION_ERROR', `timeoutMs must be between 100 and ${MAX_TIMEOUT_MS}`)
      )
    }

    const startTime = Date.now()
    let lastError: Error | undefined
    let attempt = 0

    for (attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        // Create abort controller for this attempt
        const controller = new AbortController()
        const timeoutHandle = setTimeout(() => controller.abort(), options.timeoutMs)

        try {
          const result = await fn(controller.signal)
          clearTimeout(timeoutHandle)

          // Call success callback if provided
          if (options.onSuccess) {
            try {
              options.onSuccess(result, attempt)
            } catch (cbError) {
              console.error('Error in onSuccess callback:', cbError)
            }
          }

          const totalDurationMs = Date.now() - startTime
          return {
            success: true,
            data: result,
            attempts: attempt,
            totalDurationMs,
          }
        } catch (attemptError) {
          clearTimeout(timeoutHandle)
          throw attemptError
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Check if we should retry
        const shouldRetry = attempt < options.maxAttempts && RetryHandler.shouldRetry(lastError, attempt, options.shouldRetry)

        if (!shouldRetry) {
          // Call failure callback if provided
          if (options.onFailure) {
            try {
              options.onFailure(lastError, attempt)
            } catch (cbError) {
              console.error('Error in onFailure callback:', cbError)
            }
          }

          // No more retries
          const totalDurationMs = Date.now() - startTime
          const filingError = lastError instanceof FilingError ? lastError : ErrorParser.parseAdapterError(lastError)

          return this.createFailureResult(filingError, attempt, totalDurationMs)
        }

        // Calculate delay for next attempt
        const nextDelayMs = BackoffCalculator.calculateDelay({
          attempt,
          initialDelayMs: options.initialDelayMs,
          maxDelayMs: options.maxDelayMs,
          backoffMultiplier: options.backoffMultiplier,
          jitterFactor: options.jitterFactor,
        })

        // Call retry callback if provided
        if (options.onRetry) {
          try {
            options.onRetry(lastError, attempt, nextDelayMs)
          } catch (cbError) {
            console.error('Error in onRetry callback:', cbError)
          }
        }

        // Wait before retrying
        await this.delay(nextDelayMs)
      }
    }

    // Fallback (should not reach here)
    const totalDurationMs = Date.now() - startTime
    const filingError = lastError ? ErrorParser.parseAdapterError(lastError) : new FilingError('UNKNOWN_ERROR', 'Retry exhausted')

    return this.createFailureResult(filingError, attempt, totalDurationMs)
  }

  /**
   * Execute function with timeout
   */
  static async executeWithTimeout<T>(fn: (signal?: AbortSignal) => Promise<T>, options?: TimeoutOptions): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? 60000

    // Validate timeout
    if (timeoutMs < 100 || timeoutMs > MAX_TIMEOUT_MS) {
      throw new FilingError('VALIDATION_ERROR', `timeout must be between 100 and ${MAX_TIMEOUT_MS}`)
    }

    const controller = new AbortController()
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await fn(controller.signal)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FilingError('TIMEOUT_ERROR', `Operation exceeded timeout of ${timeoutMs}ms`, {
          retryable: true,
          statusCode: 504,
        })
      }
      throw error
    } finally {
      clearTimeout(timeoutHandle)
    }
  }

  /**
   * Create a promise that rejects after specified delay
   */
  static async delay(ms: number): Promise<void> {
    if (!Number.isInteger(ms) || ms < 0) {
      throw new Error('Delay must be a non-negative integer')
    }

    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Merge user options with defaults
   */
  private static mergeOptions(userOptions?: Partial<RetryOptions>): RetryOptions {
    return {
      ...DEFAULT_RETRY_OPTIONS,
      ...userOptions,
      // Ensure reasonable bounds
      maxAttempts: Math.min(userOptions?.maxAttempts ?? DEFAULT_RETRY_OPTIONS.maxAttempts, MAX_ATTEMPTS_ALLOWED),
      maxDelayMs: Math.min(userOptions?.maxDelayMs ?? DEFAULT_RETRY_OPTIONS.maxDelayMs, MAX_DELAY_MS),
      timeoutMs: Math.min(userOptions?.timeoutMs ?? DEFAULT_RETRY_OPTIONS.timeoutMs, MAX_TIMEOUT_MS),
    }
  }

  /**
   * Create failure result object
   */
  private static createFailureResult(error: Error, attempts: number = 0, totalDurationMs: number = 0): RetryResult<any> {
    const filingError = error instanceof FilingError ? error : ErrorParser.parseAdapterError(error)

    return {
      success: false,
      error: filingError,
      attempts: Math.max(attempts, 1),
      totalDurationMs,
      finalError: filingError,
    }
  }
}

// ============================================================================
// Retry State Machine
// ============================================================================

export class RetryStateMachine {
  private state: RetryState
  private options: RetryOptions

  constructor(options?: Partial<RetryOptions>) {
    this.options = {
      ...DEFAULT_RETRY_OPTIONS,
      ...options,
    }

    this.state = {
      attempt: 0,
      nextDelayMs: this.options.initialDelayMs,
      totalElapsedMs: 0,
    }
  }

  /**
   * Get current state
   */
  getState(): Readonly<RetryState> {
    return Object.freeze({ ...this.state })
  }

  /**
   * Reset state machine
   */
  reset(): void {
    this.state = {
      attempt: 0,
      nextDelayMs: this.options.initialDelayMs,
      totalElapsedMs: 0,
    }
  }

  /**
   * Check if next attempt is available
   */
  canRetry(): boolean {
    return this.state.attempt < this.options.maxAttempts
  }

  /**
   * Move to next attempt
   */
  nextAttempt(error?: Error): boolean {
    if (!this.canRetry()) {
      return false
    }

    this.state.attempt++
    this.state.lastError = error

    if (this.state.attempt < this.options.maxAttempts) {
      this.state.nextDelayMs = BackoffCalculator.calculateDelay({
        attempt: this.state.attempt,
        initialDelayMs: this.options.initialDelayMs,
        maxDelayMs: this.options.maxDelayMs,
        backoffMultiplier: this.options.backoffMultiplier,
        jitterFactor: this.options.jitterFactor,
      })

      this.state.totalElapsedMs += this.state.nextDelayMs
    }

    return true
  }

  /**
   * Get current attempt number
   */
  getAttempt(): number {
    return this.state.attempt
  }

  /**
   * Get total attempts allowed
   */
  getMaxAttempts(): number {
    return this.options.maxAttempts
  }

  /**
   * Check if out of attempts
   */
  isExhausted(): boolean {
    return this.state.attempt >= this.options.maxAttempts
  }
}

// ============================================================================
// Batch Retry Handler
// ============================================================================

export class BatchRetryHandler {
  /**
   * Retry multiple operations with concurrency control
   */
  static async retryBatch<T>(
    operations: Array<() => Promise<T>>,
    options?: Partial<RetryOptions> & { concurrency?: number }
  ): Promise<RetryResult<T>[]> {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new FilingError('VALIDATION_ERROR', 'operations must be a non-empty array')
    }

    const concurrency = Math.max(1, Math.min(options?.concurrency ?? 1, operations.length))
    const results: RetryResult<T>[] = []

    // Process in batches
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency)
      const batchResults = await Promise.all(batch.map((op) => RetryWrapper.retryWithBackoff(op as any, options)))

      results.push(...batchResults)
    }

    return results
  }
}

// ============================================================================
// Exports
// ============================================================================

export const backoffCalculator = new BackoffCalculator()
export const retryHandler = new RetryHandler()
export const retryWrapper = new RetryWrapper()
export const batchRetryHandler = new BatchRetryHandler()

export default {
  BackoffCalculator,
  RetryHandler,
  RetryWrapper,
  RetryStateMachine,
  BatchRetryHandler,
}
