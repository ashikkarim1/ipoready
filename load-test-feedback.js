// K6 Load Test for Feedback System
// Tests: 100 concurrent feedback submissions, retrieval, and admin operations
// Run with: k6 run load-test-feedback.js

import http from 'k6/http'
import { check, sleep, group } from 'k6'

export const options = {
  vus: 100,                          // 100 virtual users
  duration: '30s',                   // 30 second test
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% failure rate
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token'

// Generate random feedback
function generateFeedback() {
  const pages = ['/dashboard', '/pace', '/tasks', '/documents', '/team']
  const categories = [
    'Feature Request',
    'Bug Report',
    'UX/UI Feedback',
    'Performance',
    'Documentation',
    'Other',
  ]
  const confusionPoints = [
    ['Navigation unclear'],
    ['Settings hard to find', 'Slow loading'],
    ['Confusing terminology'],
    [],
  ]

  const randomPage = pages[Math.floor(Math.random() * pages.length)]
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const randomConfusion = confusionPoints[Math.floor(Math.random() * confusionPoints.length)]
  const randomRating = Math.floor(Math.random() * 5) + 1

  return {
    page: randomPage,
    category: randomCategory,
    rating: randomRating,
    feedbackText: `Test feedback ${Date.now()} - Rating: ${randomRating}/5`,
    confusionPoints: randomConfusion.length > 0 ? randomConfusion : undefined,
    subject: `Test Feedback - ${randomCategory}`,
  }
}

export default function () {
  group('Feedback Submission', function () {
    const feedback = generateFeedback()

    const payload = JSON.stringify(feedback)
    const params = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }

    const response = http.post(`${BASE_URL}/api/feedback`, payload, params)

    check(response, {
      'submission status is 201': (r) => r.status === 201,
      'submission response has feedbackId': (r) => r.json('feedbackId'),
      'submission response has success': (r) => r.json('success') === true,
      'submission duration < 500ms': (r) => r.timings.duration < 500,
    })

    if (response.status === 201) {
      const feedbackId = response.json('feedbackId')

      sleep(0.1)

      // Test retrieval of submitted feedback
      group('Feedback Retrieval', function () {
        const getResponse = http.get(
          `${BASE_URL}/api/feedback?limit=50&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`,
            },
          }
        )

        check(getResponse, {
          'retrieval status is 200': (r) => r.status === 200,
          'retrieval response has data array': (r) => Array.isArray(r.json('data')),
          'retrieval response has stats': (r) => r.json('stats'),
          'retrieval has pagination info': (r) => r.json('pagination'),
          'retrieval duration < 500ms': (r) => r.timings.duration < 500,
        })
      })

      sleep(0.1)

      // Test admin update (simulate ~10% of users being admins)
      if (Math.random() < 0.1) {
        group('Admin Status Update', function () {
          const updatePayload = JSON.stringify({
            status: 'acknowledged',
            priority: 'medium',
          })

          const updateResponse = http.patch(
            `${BASE_URL}/api/feedback/${feedbackId}`,
            updatePayload,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AUTH_TOKEN}`,
                'X-Admin': 'true',
              },
            }
          )

          check(updateResponse, {
            'update status is 200 or 403': (r) => r.status === 200 || r.status === 403,
            'update duration < 500ms': (r) => r.timings.duration < 500,
          })
        })
      }
    }
  })

  group('Analytics Query', function () {
    const analyticsResponse = http.get(
      `${BASE_URL}/api/feedback?sentiment=positive&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    )

    check(analyticsResponse, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics has stats': (r) => r.json('stats'),
      'analytics averageRating present': (r) => r.json('stats.averageRating') !== null,
      'analytics duration < 1000ms': (r) => r.timings.duration < 1000,
    })
  })

  sleep(0.5)
}

// Summary function for post-test reporting
export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    '/tmp/feedback-load-test-summary.json': JSON.stringify(data),
  }
}

// Simple text summary function
function textSummary(data, options = {}) {
  const indent = options.indent || ''
  let output = `\n${indent}FEEDBACK SYSTEM LOAD TEST RESULTS\n`
  output += `${indent}${'='.repeat(50)}\n`

  const metrics = data.metrics
  if (metrics) {
    output += `${indent}HTTP Requests:\n`
    if (metrics.http_reqs) {
      output += `${indent}  Total Requests: ${metrics.http_reqs.value}\n`
    }
    if (metrics.http_req_failed) {
      const failureRate = (metrics.http_req_failed.value / metrics.http_reqs.value) * 100
      output += `${indent}  Failed Requests: ${metrics.http_req_failed.value} (${failureRate.toFixed(2)}%)\n`
    }
    if (metrics.http_req_duration) {
      output += `${indent}  Request Duration (P95): ${metrics.http_req_duration.values['p(95)']?.toFixed(2) || 'N/A'}ms\n`
      output += `${indent}  Request Duration (Avg): ${metrics.http_req_duration.values.avg?.toFixed(2) || 'N/A'}ms\n`
    }

    output += `\n${indent}Virtual Users:\n`
    if (metrics.vus) {
      output += `${indent}  Peak VUs: ${metrics.vus.value}\n`
    }
    if (metrics.vus_max) {
      output += `${indent}  Max VUs: ${metrics.vus_max.value}\n`
    }

    output += `\n${indent}Test Summary:\n`
    output += `${indent}  Status: ${metrics.http_req_failed?.value > 0 ? 'FAILED' : 'PASSED'}\n`
  }

  output += `${indent}${'='.repeat(50)}\n`
  return output
}
