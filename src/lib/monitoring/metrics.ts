/**
 * Metrics Collection System
 * Central point for collecting and exporting metrics to monitoring systems
 * Supports: OpenTelemetry, DataDog, New Relic via standardized interface
 */

import { sql } from '@/lib/db'

// Metric types
export interface MetricEvent {
  name: string
  value: number
  unit: string
  timestamp: Date
  labels: Record<string, string>
  tags?: Record<string, string>
}

export interface HistogramMetric extends MetricEvent {
  buckets?: Record<number, number>
  sum?: number
  count?: number
}

// In-memory metrics store for batching
class MetricsCollector {
  private metrics: MetricEvent[] = []
  private histograms: Map<string, { values: number[]; count: number }> = new Map()
  private counters: Map<string, number> = new Map()
  private lastFlushTime: Date = new Date()
  private flushIntervalMs: number = 60000 // 60 seconds default

  constructor() {
    // Auto-flush metrics every 60 seconds
    this.startAutoFlush()
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, labels: Record<string, string> = {}) {
    const key = this.generateKey(name, labels)
    this.counters.set(key, (this.counters.get(key) || 0) + value)

    // Also track in metrics array
    this.metrics.push({
      name,
      value,
      unit: 'count',
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Record a histogram value
   */
  recordHistogram(
    name: string,
    value: number,
    unit: string = 'ms',
    labels: Record<string, string> = {}
  ) {
    const key = this.generateKey(name, labels)
    const existing = this.histograms.get(key) || { values: [], count: 0 }
    existing.values.push(value)
    existing.count += 1
    this.histograms.set(key, existing)

    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Record a gauge (point-in-time) metric
   */
  recordGauge(name: string, value: number, unit: string = '', labels: Record<string, string> = {}) {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Get current counter value
   */
  getCounterValue(name: string, labels: Record<string, string> = {}): number {
    const key = this.generateKey(name, labels)
    return this.counters.get(key) || 0
  }

  /**
   * Calculate percentile for histogram
   */
  getHistogramPercentile(
    name: string,
    percentile: number,
    labels: Record<string, string> = {}
  ): number {
    const key = this.generateKey(name, labels)
    const histogram = this.histograms.get(key)
    if (!histogram || histogram.values.length === 0) return 0

    const sorted = [...histogram.values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * Get histogram stats (p50, p95, p99, avg)
   */
  getHistogramStats(name: string, labels: Record<string, string> = {}) {
    const key = this.generateKey(name, labels)
    const histogram = this.histograms.get(key)
    if (!histogram || histogram.values.length === 0) {
      return { count: 0, sum: 0, avg: 0, p50: 0, p95: 0, p99: 0 }
    }

    const values = histogram.values
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const sorted = [...values].sort((a, b) => a - b)

    return {
      count: values.length,
      sum,
      avg,
      p50: sorted[Math.floor(0.5 * sorted.length)],
      p95: sorted[Math.floor(0.95 * sorted.length)],
      p99: sorted[Math.floor(0.99 * sorted.length)],
    }
  }

  /**
   * Flush metrics to persistent storage and external systems
   */
  async flush(): Promise<void> {
    if (this.metrics.length === 0) return

    try {
      const timestamp = new Date()

      // Store metrics in database for querying
      for (const metric of this.metrics) {
        await sql`
          INSERT INTO metrics_log (name, value, unit, labels, timestamp)
          VALUES (${metric.name}, ${metric.value}, ${metric.unit}, ${JSON.stringify(metric.labels)}, ${timestamp})
        `.catch((err) => console.error('[Metrics] Failed to store metric:', err))
      }

      // Send to external monitoring system (if configured)
      await this.sendToExternalSystem()

      // Reset metrics
      this.metrics = []
      this.lastFlushTime = new Date()
    } catch (error) {
      console.error('[Metrics] Flush error:', error)
    }
  }

  /**
   * Send metrics to external monitoring system (DataDog, New Relic, etc.)
   */
  private async sendToExternalSystem(): Promise<void> {
    const provider = process.env.MONITORING_PROVIDER?.toLowerCase() || 'none'

    if (provider === 'datadog') {
      await this.sendToDataDog()
    } else if (provider === 'newrelic') {
      await this.sendToNewRelic()
    } else if (provider === 'otel' || provider === 'opentelemetry') {
      await this.sendToOpenTelemetry()
    }
  }

  /**
   * Send to DataDog
   */
  private async sendToDataDog(): Promise<void> {
    if (!process.env.DATADOG_API_KEY) return

    try {
      const ddMetrics = this.metrics.map((m) => ({
        metric: m.name,
        points: [[Math.floor(m.timestamp.getTime() / 1000), m.value]],
        tags: Object.entries(m.labels).map(([k, v]) => `${k}:${v}`),
        type: 'gauge',
      }))

      // Send in batches
      for (let i = 0; i < ddMetrics.length; i += 100) {
        const batch = ddMetrics.slice(i, i + 100)
        await fetch('https://api.datadoghq.com/api/v1/series', {
          method: 'POST',
          headers: {
            'DD-API-KEY': process.env.DATADOG_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ series: batch }),
        }).catch((err) => console.error('[Metrics] DataDog send error:', err))
      }
    } catch (error) {
      console.error('[Metrics] DataDog error:', error)
    }
  }

  /**
   * Send to New Relic
   */
  private async sendToNewRelic(): Promise<void> {
    if (!process.env.NEW_RELIC_LICENSE_KEY) return

    try {
      const nrMetrics = {
        metrics: this.metrics.map((m) => ({
          name: m.name,
          type: 'gauge',
          value: m.value,
          timestamp: m.timestamp.getTime(),
          attributes: m.labels,
        })),
      }

      await fetch('https://metric-api.newrelic.com/metric/v1/timeseries', {
        method: 'POST',
        headers: {
          'Api-Key': process.env.NEW_RELIC_LICENSE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nrMetrics),
      }).catch((err) => console.error('[Metrics] New Relic send error:', err))
    } catch (error) {
      console.error('[Metrics] New Relic error:', error)
    }
  }

  /**
   * Send to OpenTelemetry
   */
  private async sendToOpenTelemetry(): Promise<void> {
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return

    try {
      // Convert metrics to OTLP format
      const otlpMetrics = this.metrics.map((m) => ({
        name: m.name,
        description: `Metric: ${m.name}`,
        unit: m.unit,
        data: {
          dataPoints: [
            {
              attributes: m.labels,
              value: m.value,
              timeUnixNano: m.timestamp.getTime() * 1000000,
            },
          ],
        },
      }))

      await fetch(`${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceMetrics: [
            {
              resource: {
                attributes: {
                  'service.name': 'ipoready',
                  'service.version': process.env.APP_VERSION || 'unknown',
                },
              },
              scopeMetrics: [
                {
                  scope: { name: 'ipoready.metrics' },
                  metrics: otlpMetrics,
                },
              ],
            },
          ],
        }),
      }).catch((err) => console.error('[Metrics] OpenTelemetry send error:', err))
    } catch (error) {
      console.error('[Metrics] OpenTelemetry error:', error)
    }
  }

  /**
   * Start auto-flush interval
   */
  private startAutoFlush(): void {
    setInterval(() => {
      this.flush().catch((err) => console.error('[Metrics] Auto-flush error:', err))
    }, this.flushIntervalMs)
  }

  /**
   * Generate consistent key from name and labels
   */
  private generateKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(',')
    return labelStr ? `${name}[${labelStr}]` : name
  }
}

// Global singleton instance
let metricsCollector: MetricsCollector | null = null

export function getMetricsCollector(): MetricsCollector {
  if (!metricsCollector) {
    metricsCollector = new MetricsCollector()
  }
  return metricsCollector
}

// Convenience exports
export function incrementCounter(name: string, value: number = 1, labels: Record<string, string> = {}) {
  getMetricsCollector().incrementCounter(name, value, labels)
}

export function recordHistogram(name: string, value: number, unit: string = 'ms', labels: Record<string, string> = {}) {
  getMetricsCollector().recordHistogram(name, value, unit, labels)
}

export function recordGauge(name: string, value: number, unit: string = '', labels: Record<string, string> = {}) {
  getMetricsCollector().recordGauge(name, value, unit, labels)
}

export async function flushMetrics(): Promise<void> {
  await getMetricsCollector().flush()
}
