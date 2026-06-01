/**
 * Load Test for Prospectus Generation API
 * Tests performance under concurrent load
 *
 * Requirements:
 * - Single generation: < 5 seconds
 * - Concurrent 10 generations: Stable, no errors
 * - Memory usage: Reasonable
 *
 * Run with: k6 run tests/load-test-prospectus.js
 */

import http from 'k6/http'
import { check, sleep, group } from 'k6'

export const options = {
  stages: [
    { duration: '10s', target: 1 },    // Ramp up to 1 user
    { duration: '30s', target: 5 },    // Ramp up to 5 users
    { duration: '30s', target: 10 },   // Ramp up to 10 users (target load)
    { duration: '30s', target: 10 },   // Stay at 10 users
    { duration: '10s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // 95% of requests should be below 5 seconds
    'http_req_failed': ['rate<0.1'],     // Error rate should be below 10%
  },
}

const API_URL = __ENV.API_URL || 'http://localhost:3000'
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token'

export default function() {
  const payload = JSON.stringify({
    exchange: 'tsx',
    format: 'docx',
    sections: ['business_overview', 'risk_factors', 'financial_summary', 'management', 'use_of_proceeds'],
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    timeout: '10s',
  }

  group('Prospectus Generation', () => {
    const startTime = new Date()

    const response = http.post(`${API_URL}/api/prospectus/generate`, payload, params)

    const generationTime = new Date() - startTime

    check(response, {
      'Status is 200 (success)': (r) => r.status === 200,
      'Has documentId': (r) => r.json('documentId') !== null,
      'Has documentUrl': (r) => r.json('documentUrl') !== null,
      'Has metadata': (r) => r.json('metadata') !== null,
      'Generation time < 5 seconds': (r) => generationTime < 5000,
      'Response time < 5 seconds': (r) => r.timings.duration < 5000,
      'No error message': (r) => !r.json('error'),
    })

    if (response.status !== 200) {
      console.error(`Generation failed with status ${response.status}: ${response.body}`)
    }
  })

  sleep(1) // Brief pause between requests
}

export function teardown(data) {
  console.log('Load test completed')
}
