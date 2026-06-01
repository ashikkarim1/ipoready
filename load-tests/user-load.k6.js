import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const dashboardLoadTime = new Trend('dashboard_load_time');
const paceCalcTime = new Trend('pace_calc_time');
const documentUploadTime = new Trend('document_upload_time');
const feedbackSubmitTime = new Trend('feedback_submit_time');
const activeUsers = new Gauge('active_users');
const requestCount = new Counter('total_requests');

export const options = {
  scenarios: {
    dashboard_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m30s', target: 100 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'dashboard_load_time': ['p(95)<2000', 'p(99)<3000'],
    'pace_calc_time': ['p(95)<2000', 'p(99)<3000'],
    'document_upload_time': ['p(95)<5000', 'p(99)<7000'],
    'feedback_submit_time': ['p(95)<1000', 'p(99)<2000'],
    'errors': ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const TEST_COMPANY_ID = __ENV.TEST_COMPANY_ID || 'test-company-1';
const TEST_AUTH_TOKEN = __ENV.TEST_AUTH_TOKEN || '';

export default function () {
  activeUsers.add(1);

  // Test 1: Dashboard Load (100 concurrent users)
  group('Dashboard Load Test', function () {
    const startTime = Date.now();
    const response = http.get(`${BASE_URL}/api/dashboard?companyId=${TEST_COMPANY_ID}`, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const loadTime = Date.now() - startTime;
    dashboardLoadTime.add(loadTime);
    requestCount.add(1);

    const success = check(response, {
      'dashboard status is 200': (r) => r.status === 200,
      'response time < 2s': (loadTime) => loadTime < 2000,
      'has metrics': (r) => r.body && r.body.includes('metrics'),
    });

    if (!success) {
      errorRate.add(true);
    }
  });

  sleep(1);

  // Test 2: PACE Score Calculation (50 concurrent)
  group('PACE Score Calculation', function () {
    const payload = JSON.stringify({
      companyId: TEST_COMPANY_ID,
      revenue: 50000000,
      employees: 250,
      yearsFounded: 12,
      profitMargin: 15,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/pace/scores`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const calcTime = Date.now() - startTime;
    paceCalcTime.add(calcTime);
    requestCount.add(1);

    const success = check(response, {
      'pace calc status is 200': (r) => r.status === 200,
      'calculation time < 2s': (calcTime) => calcTime < 2000,
      'has score': (r) => r.body && r.body.includes('score'),
    });

    if (!success) {
      errorRate.add(true);
    }
  });

  sleep(0.5);

  // Test 3: Document Upload (25 concurrent)
  group('Document Upload', function () {
    const filename = `test-doc-${Date.now()}.txt`;
    const data = 'Test document content for IPO readiness';

    const startTime = Date.now();
    const response = http.post(
      `${BASE_URL}/api/documents`,
      {
        companyId: TEST_COMPANY_ID,
        fileName: filename,
        fileSize: data.length,
        content: data,
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const uploadTime = Date.now() - startTime;
    documentUploadTime.add(uploadTime);
    requestCount.add(1);

    const success = check(response, {
      'upload status is 200': (r) => r.status === 200 || r.status === 201,
      'upload time < 5s': (uploadTime) => uploadTime < 5000,
    });

    if (!success) {
      errorRate.add(true);
    }
  });

  sleep(0.5);

  // Test 4: Feedback Submission (100 concurrent)
  group('Feedback Submission', function () {
    const payload = JSON.stringify({
      companyId: TEST_COMPANY_ID,
      category: 'pace',
      rating: 4,
      comment: 'Great feature for IPO readiness assessment',
      email: `user-${Date.now()}@test.com`,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/feedback`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const submitTime = Date.now() - startTime;
    feedbackSubmitTime.add(submitTime);
    requestCount.add(1);

    const success = check(response, {
      'feedback status is 200': (r) => r.status === 200 || r.status === 201,
      'submission time < 1s': (submitTime) => submitTime < 1000,
    });

    if (!success) {
      errorRate.add(true);
    }
  });

  sleep(1);
  activeUsers.add(-1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

// Simple text summary function
function textSummary(data, options = {}) {
  const { indent = ' ', enableColors = false } = options;
  let summary = '\n=== Load Test Summary ===\n';

  if (data.metrics) {
    Object.entries(data.metrics).forEach(([metric, value]) => {
      summary += `${indent}${metric}: ${JSON.stringify(value.values)}\n`;
    });
  }

  return summary;
}
