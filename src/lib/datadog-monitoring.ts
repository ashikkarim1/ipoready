/**
 * Datadog Monitoring Integration
 *
 * Logs performance metrics, errors, and custom events to Datadog
 * Production: Connect to real Datadog account via DATADOG_API_KEY env var
 */

export interface LogEntry {
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: Record<string, any>
  tags?: Record<string, string>
  userId?: string
  requestId?: string
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  tags?: Record<string, string>
}

class DatadogMonitor {
  private apiKey: string | undefined
  private isEnabled: boolean
  private environment: string

  constructor() {
    this.apiKey = process.env.DATADOG_API_KEY
    this.isEnabled = !!this.apiKey && process.env.NODE_ENV === 'production'
    this.environment = process.env.NODE_ENV || 'development'
  }

  /**
   * Log an event to Datadog
   */
  log(entry: LogEntry): void {
    if (!this.isEnabled) {
      // Development: log to console
      console[entry.level](`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context)
      return
    }

    // Production: send to Datadog
    this.sendToDatadog({
      ...entry,
      env: this.environment,
      timestamp: entry.timestamp || Date.now(),
    })
  }

  /**
   * Log performance metric
   */
  metric(metric: PerformanceMetric): void {
    if (!this.isEnabled) {
      console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit}`)
      return
    }

    this.sendMetricToDatadog(metric)
  }

  /**
   * Log API request/response
   */
  logApiCall(data: {
    method: string
    path: string
    statusCode: number
    duration: number
    userId?: string
    requestId?: string
    error?: string
  }): void {
    this.log({
      timestamp: Date.now(),
      level: data.statusCode >= 400 ? 'error' : 'info',
      message: `${data.method} ${data.path} ${data.statusCode}`,
      context: {
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        duration: `${data.duration}ms`,
        error: data.error,
      },
      tags: {
        service: 'ipoready-api',
        endpoint: data.path,
      },
      userId: data.userId,
      requestId: data.requestId,
    })
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(data: {
    operation: 'query' | 'insert' | 'update' | 'delete'
    table: string
    duration: number
    rowsAffected?: number
    error?: string
  }): void {
    this.log({
      timestamp: Date.now(),
      level: data.error ? 'error' : 'info',
      message: `Database ${data.operation} on ${data.table}`,
      context: {
        operation: data.operation,
        table: data.table,
        duration: `${data.duration}ms`,
        rowsAffected: data.rowsAffected,
        error: data.error,
      },
      tags: {
        service: 'ipoready-db',
      },
    })
  }

  /**
   * Log error with stack trace
   */
  logError(error: Error, context?: { userId?: string; requestId?: string; action?: string }): void {
    this.log({
      timestamp: Date.now(),
      level: 'error',
      message: error.message,
      context: {
        stack: error.stack,
        name: error.name,
        action: context?.action,
      },
      tags: {
        service: 'ipoready',
        errorType: error.name,
      },
      userId: context?.userId,
      requestId: context?.requestId,
    })
  }

  /**
   * Send data to Datadog (stub for production)
   */
  private sendToDatadog(data: any): void {
    // Production implementation would send to:
    // https://http-intake.logs.datadoghq.com/v1/input/{API_KEY}
    if (this.isEnabled && this.apiKey) {
      // Async send, don't block the request
      fetch('https://http-intake.logs.datadoghq.com/v1/input/' + this.apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {
        // Silently fail if Datadog is unreachable
      })
    }
  }

  /**
   * Send metric to Datadog (stub for production)
   */
  private sendMetricToDatadog(metric: PerformanceMetric): void {
    if (this.isEnabled && this.apiKey) {
      // Production would use StatsD or Datadog API
      // For now, just log it
      console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit}`)
    }
  }
}

// Singleton instance
export const monitor = new DatadogMonitor()

/**
 * Middleware to track API performance
 */
export function createMonitoringMiddleware(
  serviceName: string
) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now()
    const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random()}`

    // Track response
    const originalSend = res.send
    res.send = function (data: any) {
      const duration = Date.now() - startTime
      monitor.logApiCall({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userId: (req as any).userId,
        requestId,
      })

      return originalSend.call(this, data)
    }

    next()
  }
}
