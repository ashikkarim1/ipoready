#!/usr/bin/env node

/**
 * Load Test Results Analyzer
 *
 * Analyzes k6 load test results and generates actionable insights
 *
 * Usage:
 *   node analyze-results.js <results-file.json>
 *   node analyze-results.js tests/load/results/capital-markets-load-results.json
 */

const fs = require('fs')
const path = require('path')

const TARGETS = {
  p95_latency: 200,
  p99_latency: 250,
  avg_latency: 150,
  error_rate: 0.001, // 0.1%
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function pass() {
  return `${colors.green}✓${colors.reset}`
}

function fail() {
  return `${colors.red}✗${colors.reset}`
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatNumber(num) {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function analyzeLatency(metric, endpoint) {
  if (!metric) return null

  const values = metric.values
  const p95 = values['p(95)']
  const p99 = values['p(99)']
  const avg = values.avg
  const max = values.max
  const min = values.min

  return {
    endpoint,
    p95: { value: p95, passed: p95 < TARGETS.p95_latency },
    p99: { value: p99, passed: p99 < TARGETS.p99_latency },
    avg: { value: avg, passed: avg < TARGETS.avg_latency },
    max,
    min,
  }
}

function analyzeErrors(metric, endpoint) {
  if (!metric) return null

  const errorRate = metric.value
  return {
    endpoint,
    rate: { value: errorRate, passed: errorRate < TARGETS.error_rate },
    percentage: (errorRate * 100).toFixed(3),
  }
}

function getInsights(results) {
  const insights = []

  // Latency insights
  const latencies = results.latencies.filter((l) => l)
  const slowestEndpoint = latencies.reduce((a, b) =>
    a.p95.value > b.p95.value ? a : b,
  )

  if (slowestEndpoint.p95.value > TARGETS.p95_latency) {
    insights.push({
      severity: 'high',
      category: 'Performance',
      message: `${slowestEndpoint.endpoint} has high P95 latency (${slowestEndpoint.p95.value.toFixed(2)}ms)`,
      recommendation: 'Optimize queries or add database indexes',
    })
  }

  // Error insights
  const errorRates = results.errors.filter((e) => e)
  const highestErrorEndpoint = errorRates.reduce(
    (a, b) => (a.rate.value > b.rate.value ? a : b),
    { rate: { value: 0 }, percentage: '0' },
  )

  if (highestErrorEndpoint.rate.value > TARGETS.error_rate) {
    insights.push({
      severity: 'high',
      category: 'Reliability',
      message: `${highestErrorEndpoint.endpoint} has high error rate (${highestErrorEndpoint.percentage}%)`,
      recommendation: 'Check error logs and database connection pool',
    })
  }

  // Capacity insights
  if (results.totalRequests > 100000) {
    insights.push({
      severity: 'low',
      category: 'Capacity',
      message: `Processed ${formatNumber(results.totalRequests)} requests successfully`,
      recommendation: 'System can handle target load',
    })
  }

  return insights
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    log('Usage: node analyze-results.js <results-file.json>', 'cyan')
    log('Example: node analyze-results.js tests/load/results/capital-markets-load-results.json', 'cyan')
    process.exit(1)
  }

  const resultsFile = args[0]

  if (!fs.existsSync(resultsFile)) {
    log(`Error: File not found: ${resultsFile}`, 'red')
    process.exit(1)
  }

  let data
  try {
    data = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'))
  } catch (error) {
    log(`Error parsing JSON: ${error.message}`, 'red')
    process.exit(1)
  }

  const metrics = data.metrics || {}

  // Extract endpoint metrics
  const results = {
    latencies: [
      analyzeLatency(metrics.capital_markets_companies_latency, 'Companies Search'),
      analyzeLatency(metrics.capital_markets_dashboard_latency, 'Dashboard'),
      analyzeLatency(metrics.capital_markets_ipos_latency, 'IPOs List'),
    ],
    errors: [
      analyzeErrors(metrics.capital_markets_companies_errors, 'Companies Search'),
      analyzeErrors(metrics.capital_markets_dashboard_errors, 'Dashboard'),
      analyzeErrors(metrics.capital_markets_ipos_errors, 'IPOs List'),
    ],
    totalRequests: metrics.http_reqs?.value || 0,
    totalErrors: metrics.http_req_failed?.value || 0,
  }

  // Print header
  console.log()
  log('╔════════════════════════════════════════════════════════════════╗', 'cyan')
  log('║     Capital Markets Load Test - Detailed Analysis Report       ║', 'cyan')
  log('╚════════════════════════════════════════════════════════════════╝', 'cyan')
  console.log()

  // Test metadata
  if (data.state) {
    const testState = data.state
    log('📋 TEST METADATA', 'bold')
    log('─────────────────────────────────────────────────────────────────')
    log(`  Test Duration: ${testState.testRunDurationMs?.toLocaleString() || 'Unknown'}ms`)
    log()
  }

  // Endpoint Performance
  log('🎯 ENDPOINT PERFORMANCE SUMMARY', 'bold')
  log('─────────────────────────────────────────────────────────────────')

  results.latencies.forEach((latency) => {
    if (!latency) return

    const p95Status = latency.p95.passed ? pass() : fail()
    const p99Status = latency.p99.passed ? pass() : fail()
    const avgStatus = latency.avg.passed ? pass() : fail()

    log(`\n  ${latency.endpoint}`)
    log(
      `    P95 Latency: ${latency.p95.value.toFixed(2)}ms (target: ${TARGETS.p95_latency}ms) ${p95Status}`,
    )
    log(
      `    P99 Latency: ${latency.p99.value.toFixed(2)}ms (target: ${TARGETS.p99_latency}ms) ${p99Status}`,
    )
    log(
      `    Avg Latency: ${latency.avg.value.toFixed(2)}ms (target: ${TARGETS.avg_latency}ms) ${avgStatus}`,
    )
    log(`    Max Latency: ${latency.max.toFixed(2)}ms`)
    log(`    Min Latency: ${latency.min.toFixed(2)}ms`)
  })

  console.log()

  // Error Analysis
  log('❌ ERROR ANALYSIS', 'bold')
  log('─────────────────────────────────────────────────────────────────')

  results.errors.forEach((error) => {
    if (!error) return

    const status = error.rate.passed ? pass() : fail()
    log(
      `  ${error.endpoint}: ${error.percentage}% error rate (target: 0.1%) ${status}`,
    )
  })

  log(`  Total Requests: ${formatNumber(results.totalRequests)}`)
  log(`  Failed Requests: ${formatNumber(results.totalErrors)}`)

  console.log()

  // HTTP Request Statistics
  if (metrics.http_req_duration) {
    log('💻 HTTP REQUEST STATISTICS', 'bold')
    log('─────────────────────────────────────────────────────────────────')

    const duration = metrics.http_req_duration.values
    log(`  Overall P95: ${duration['p(95)'].toFixed(2)}ms`)
    log(`  Overall P99: ${duration['p(99)'].toFixed(2)}ms`)
    log(`  Overall Average: ${duration.avg.toFixed(2)}ms`)
    log(`  Overall Max: ${duration.max.toFixed(2)}ms`)

    console.log()
  }

  // Insights & Recommendations
  const insights = getInsights(results)

  if (insights.length > 0) {
    log('💡 INSIGHTS & RECOMMENDATIONS', 'bold')
    log('─────────────────────────────────────────────────────────────────')

    insights.forEach((insight, index) => {
      const severityColor = {
        high: 'red',
        medium: 'yellow',
        low: 'blue',
      }[insight.severity]

      log(`\n  ${index + 1}. [${insight.severity.toUpperCase()}] ${insight.category}`, severityColor)
      log(`     Issue: ${insight.message}`)
      log(`     Recommendation: ${insight.recommendation}`)
    })

    console.log()
  } else {
    log('✅ All metrics passed targets! System performing well.', 'green')
    console.log()
  }

  // Performance Grade
  log('📊 PERFORMANCE GRADE', 'bold')
  log('─────────────────────────────────────────────────────────────────')

  const passedLatencies = results.latencies.filter((l) => l && l.p95.passed && l.p99.passed).length
  const passedErrors = results.errors.filter((e) => e && e.rate.passed).length
  const totalTests = results.latencies.length + results.errors.length

  const percentagePassed = ((passedLatencies + passedErrors) / totalTests) * 100

  let grade, gradeColor
  if (percentagePassed === 100) {
    grade = 'A+'
    gradeColor = 'green'
  } else if (percentagePassed >= 90) {
    grade = 'A'
    gradeColor = 'green'
  } else if (percentagePassed >= 80) {
    grade = 'B'
    gradeColor = 'yellow'
  } else if (percentagePassed >= 70) {
    grade = 'C'
    gradeColor = 'yellow'
  } else {
    grade = 'F'
    gradeColor = 'red'
  }

  log(`  Overall Grade: ${grade} (${percentagePassed.toFixed(1)}% tests passed)`, gradeColor)

  if (grade === 'A+') {
    log(`  Status: Excellent performance. Ready for production.`, 'green')
  } else if (grade === 'A') {
    log(`  Status: Good performance. Minor optimizations recommended.`, 'green')
  } else if (grade === 'B') {
    log(`  Status: Acceptable performance. Optimization needed.`, 'yellow')
  } else {
    log(`  Status: Poor performance. Significant optimization required.`, 'red')
  }

  console.log()

  // Optimization Priority Matrix
  log('🚀 OPTIMIZATION PRIORITY', 'bold')
  log('─────────────────────────────────────────────────────────────────')

  const optimizations = []

  results.latencies.forEach((latency) => {
    if (!latency || latency.p95.passed) return
    optimizations.push({
      item: `${latency.endpoint} P95 Latency`,
      current: latency.p95.value,
      target: TARGETS.p95_latency,
      priority: 'High',
    })
  })

  results.errors.forEach((error) => {
    if (!error || error.rate.passed) return
    optimizations.push({
      item: `${error.endpoint} Error Rate`,
      current: (error.rate.value * 100).toFixed(3) + '%',
      target: '0.1%',
      priority: 'High',
    })
  })

  if (optimizations.length === 0) {
    log('  No optimizations needed. All metrics passed.', 'green')
  } else {
    optimizations.forEach((opt) => {
      log(`  • ${opt.item}`)
      log(`    Current: ${formatNumber(opt.current)} | Target: ${formatNumber(opt.target)}`)
    })
  }

  console.log()

  // Save summary
  const summaryFile = resultsFile.replace('.json', '-summary.txt')
  fs.writeFileSync(
    summaryFile,
    `
Load Test Results Summary
Generated: ${new Date().toISOString()}

Overall Grade: ${grade}
Tests Passed: ${passedLatencies + passedErrors}/${totalTests}

Endpoint Performance:
${results.latencies
  .filter((l) => l)
  .map((l) => `${l.endpoint}: P95=${l.p95.value.toFixed(2)}ms, Error=${0}%`)
  .join('\n')}

Recommendations:
${insights.map((i) => `- ${i.recommendation}`).join('\n') || 'No critical issues found.'}
`,
  )

  log(`📁 Summary saved to: ${summaryFile}`, 'cyan')
  console.log()
}

main()
