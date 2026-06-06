import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Rate, Trend, Counter, Gauge } from 'k6/metrics'
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

/**
 * Capital Markets APIs Load Test
 *
 * Tests the following endpoints:
 * - GET /api/capital-markets/companies (paginated search)
 * - GET /api/capital-markets/dashboard (company detail)
 * - GET /api/capital-markets/ipos (IPO list)
 *
 * Configuration:
 * - 1000 concurrent users
 * - 60-second ramp-up
 * - 10-minute test duration
 * - Target metrics: P95 < 200ms, P99 < 250ms, Error rate < 0.1%
 */

// Custom metrics
const companiesSearchLatency = new Trend('capital_markets_companies_latency')
const dashboardLatency = new Trend('capital_markets_dashboard_latency')
const iposLatency = new Trend('capital_markets_ipos_latency')

const companiesSearchErrorRate = new Rate('capital_markets_companies_errors')
const dashboardErrorRate = new Rate('capital_markets_dashboard_errors')
const iposErrorRate = new Rate('capital_markets_ipos_errors')

const companiesSearchCount = new Counter('capital_markets_companies_requests')
const dashboardCount = new Counter('capital_markets_dashboard_requests')
const iposCount = new Counter('capital_markets_ipos_requests')

const activeVUs = new Gauge('active_vus')

// Test configuration
export const options = {
  stages: [
    // Ramp-up: 0 to 1000 VUs over 60 seconds
    { duration: '60s', target: 1000 },
    // Sustained load: 1000 VUs for 9 minutes
    { duration: '9m', target: 1000 },
    // Cool-down: 1000 to 0 VUs over 1 minute
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // Companies Search Thresholds
    'capital_markets_companies_latency': [
      'p(95) < 200',
      'p(99) < 250',
      'avg < 150',
      'max < 1000',
    ],
    'capital_markets_companies_errors': ['rate < 0.001'], // < 0.1%

    // Dashboard Thresholds
    'capital_markets_dashboard_latency': [
      'p(95) < 200',
      'p(99) < 250',
      'avg < 150',
      'max < 1000',
    ],
    'capital_markets_dashboard_errors': ['rate < 0.001'], // < 0.1%

    // IPOs Thresholds
    'capital_markets_ipos_latency': [
      'p(95) < 200',
      'p(99) < 250',
      'avg < 150',
      'max < 1000',
    ],
    'capital_markets_ipos_errors': ['rate < 0.001'], // < 0.1%

    // Overall error rate
    'http_req_failed': ['rate < 0.001'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test data
const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Manufacturing', 'Consumer', 'Industrial']
const searchTerms = ['tech', 'health', 'bank', 'oil', 'inc', 'corp']

export default function () {
  activeVUs.add(__VU)

  // Distribute traffic: 50% companies search, 25% dashboard, 25% IPOs
  const rand = Math.random()

  if (rand < 0.5) {
    testCompaniesSearch()
  } else if (rand < 0.75) {
    testDashboard()
  } else {
    testIPOs()
  }

  // Small sleep between requests to avoid overwhelming the system
  sleep(0.5)
}

/**
 * Test: GET /api/capital-markets/companies
 * - Tests paginated search with filters
 * - Simulates realistic search patterns
 */
function testCompaniesSearch() {
  group('Capital Markets: Companies Search', function () {
    const searchParams = {
      q: searchTerms[randomIntBetween(0, searchTerms.length - 1)],
      sector: sectors[randomIntBetween(0, sectors.length - 1)],
      limit: [25, 50, 100][randomIntBetween(0, 2)],
      offset: randomIntBetween(0, 5) * 50, // Pages 0-5
    }

    const queryString = new URLSearchParams(searchParams).toString()
    const startTime = new Date()

    const response = http.get(`${BASE_URL}/api/capital-markets/companies?${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: '30s',
      tags: { name: 'CompaniesSearch' },
    })

    const latency = new Date() - startTime

    companiesSearchLatency.add(latency, {
      sector: searchParams.sector,
      limit: searchParams.limit.toString(),
    })
    companiesSearchCount.add(1)

    const isSuccess = check(response, {
      'status 200': (r) => r.status === 200,
      'response has companies array': (r) =>
        r.body && JSON.parse(r.body).companies && Array.isArray(JSON.parse(r.body).companies),
      'response has pagination': (r) =>
        r.body && JSON.parse(r.body).pagination && JSON.parse(r.body).pagination.total !== undefined,
      'response time < 200ms': (r) => latency < 200,
      'response time < 500ms': (r) => latency < 500,
    })

    if (!isSuccess) {
      companiesSearchErrorRate.add(true)
    } else {
      companiesSearchErrorRate.add(false)
    }
  })
}

/**
 * Test: GET /api/capital-markets/dashboard
 * - Tests company detail dashboard endpoint
 * - Simulates users viewing specific company details
 */
function testDashboard() {
  group('Capital Markets: Dashboard', function () {
    // Use realistic company IDs (1-100)
    const companyId = randomIntBetween(1, 100).toString()

    const startTime = new Date()

    const response = http.get(
      `${BASE_URL}/api/capital-markets/dashboard?companyId=${companyId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: '30s',
        tags: { name: 'Dashboard' },
      },
    )

    const latency = new Date() - startTime

    dashboardLatency.add(latency, { companyId })
    dashboardCount.add(1)

    const isSuccess = check(response, {
      'status 200': (r) => r.status === 200 || r.status === 404,
      'response has company data': (r) =>
        response.status === 404 || (r.body && JSON.parse(r.body).company),
      'response has financials': (r) =>
        response.status === 404 || (r.body && JSON.parse(r.body).financials),
      'response time < 200ms': (r) => latency < 200,
      'response time < 500ms': (r) => latency < 500,
    })

    if (!isSuccess) {
      dashboardErrorRate.add(true)
    } else {
      dashboardErrorRate.add(false)
    }
  })
}

/**
 * Test: GET /api/capital-markets/ipos
 * - Tests IPO list endpoint with various filters
 * - Simulates IPO screening and filtering workflows
 */
function testIPOs() {
  group('Capital Markets: IPOs List', function () {
    const filterType = randomIntBetween(0, 3)
    let queryParams = {}

    switch (filterType) {
      case 0: // No filters
        queryParams = {}
        break
      case 1: // Status filter
        queryParams = { status: ['pending', 'approved', 'listed'][randomIntBetween(0, 2)] }
        break
      case 2: // Sector filter
        queryParams = { sector: sectors[randomIntBetween(0, sectors.length - 1)] }
        break
      case 3: // Time range
        queryParams = { days: [30, 90, 365][randomIntBetween(0, 2)] }
        break
    }

    const queryString = new URLSearchParams(queryParams).toString()
    const startTime = new Date()

    const response = http.get(
      `${BASE_URL}/api/capital-markets/ipos${queryString ? '?' + queryString : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: '30s',
        tags: { name: 'IPOs' },
      },
    )

    const latency = new Date() - startTime

    iposLatency.add(latency, {
      filter_type: ['none', 'status', 'sector', 'time_range'][filterType],
    })
    iposCount.add(1)

    const isSuccess = check(response, {
      'status 200': (r) => r.status === 200,
      'response has ipos array': (r) =>
        r.body && JSON.parse(r.body).ipos && Array.isArray(JSON.parse(r.body).ipos),
      'response has count': (r) => r.body && JSON.parse(r.body).count !== undefined,
      'response time < 200ms': (r) => latency < 200,
      'response time < 500ms': (r) => latency < 500,
    })

    if (!isSuccess) {
      iposErrorRate.add(true)
    } else {
      iposErrorRate.add(false)
    }
  })
}

/**
 * Custom summary handler for detailed reporting
 */
export function handleSummary(data) {
  return {
    'stdout': formatSummary(data),
    'tests/load/results/capital-markets-load-results.json': JSON.stringify(data, null, 2),
  }
}

function formatSummary(data) {
  const metrics = data.metrics

  let summary = '\n'
  summary += '╔════════════════════════════════════════════════════════════════╗\n'
  summary += '║        Capital Markets Load Test - Results Summary             ║\n'
  summary += '╚════════════════════════════════════════════════════════════════╝\n\n'

  // Test Configuration
  summary += '📊 TEST CONFIGURATION\n'
  summary += '─────────────────────────────────────────────────────────────────\n'
  summary += '  Duration: 10 minutes (60s ramp-up + 9m sustained + 1m cool-down)\n'
  summary += '  Target VUs: 1000 concurrent users\n'
  summary += '  Ramp-up Time: 60 seconds\n'
  summary += '  Target Metrics:\n'
  summary += '    • P95 Latency: < 200ms\n'
  summary += '    • P99 Latency: < 250ms\n'
  summary += '    • Error Rate: < 0.1%\n\n'

  // Endpoint Results
  summary += '🎯 ENDPOINT PERFORMANCE\n'
  summary += '─────────────────────────────────────────────────────────────────\n'

  // Companies Search
  if (metrics.capital_markets_companies_latency) {
    summary += formatEndpointMetrics(
      'Companies Search (GET /api/capital-markets/companies)',
      metrics.capital_markets_companies_latency,
      metrics.capital_markets_companies_errors,
      metrics.capital_markets_companies_requests,
    )
  }

  // Dashboard
  if (metrics.capital_markets_dashboard_latency) {
    summary += formatEndpointMetrics(
      'Dashboard (GET /api/capital-markets/dashboard)',
      metrics.capital_markets_dashboard_latency,
      metrics.capital_markets_dashboard_errors,
      metrics.capital_markets_dashboard_requests,
    )
  }

  // IPOs
  if (metrics.capital_markets_ipos_latency) {
    summary += formatEndpointMetrics(
      'IPOs List (GET /api/capital-markets/ipos)',
      metrics.capital_markets_ipos_latency,
      metrics.capital_markets_ipos_errors,
      metrics.capital_markets_ipos_requests,
    )
  }

  // HTTP Stats
  if (metrics.http_reqs) {
    summary += '\n💻 HTTP STATISTICS\n'
    summary += '─────────────────────────────────────────────────────────────────\n'
    summary += `  Total Requests: ${metrics.http_reqs.value}\n`
  }

  if (metrics.http_req_duration) {
    const durations = metrics.http_req_duration.values
    summary += `  Overall P95 Latency: ${durations['p(95)'].toFixed(2)}ms\n`
    summary += `  Overall P99 Latency: ${durations['p(99)'].toFixed(2)}ms\n`
    summary += `  Overall Avg Latency: ${durations.avg.toFixed(2)}ms\n`
  }

  if (metrics.http_req_failed) {
    summary += `  Failed Requests: ${metrics.http_req_failed.value}\n`
  }

  // Summary
  summary += '\n✅ PASS/FAIL STATUS\n'
  summary += '─────────────────────────────────────────────────────────────────\n'
  summary += checkThresholdStatus(data) + '\n'

  return summary
}

function formatEndpointMetrics(endpoint, latencyMetric, errorMetric, requestMetric) {
  const values = latencyMetric.values

  let result = `\n  📍 ${endpoint}\n`
  result += `     Requests: ${requestMetric.value}\n`
  result += `     P95 Latency: ${values['p(95)'].toFixed(2)}ms ${values['p(95)'] < 200 ? '✓' : '✗'}\n`
  result += `     P99 Latency: ${values['p(99)'].toFixed(2)}ms ${values['p(99)'] < 250 ? '✓' : '✗'}\n`
  result += `     Avg Latency: ${values.avg.toFixed(2)}ms\n`
  result += `     Max Latency: ${values.max.toFixed(2)}ms\n`
  result += `     Error Rate: ${(errorMetric.value * 100).toFixed(3)}% ${errorMetric.value < 0.001 ? '✓' : '✗'}\n`

  return result
}

function checkThresholdStatus(data) {
  const thresholds = data.thresholds || {}
  let status = ''

  Object.entries(thresholds).forEach(([name, results]) => {
    if (Array.isArray(results)) {
      const allPassed = results.every((r) => r.ok === true)
      const icon = allPassed ? '✓' : '✗'
      status += `  ${icon} ${name}\n`
    }
  })

  return status || '  No threshold data available'
}
