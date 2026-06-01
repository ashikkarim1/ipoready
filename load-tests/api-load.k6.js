import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Metrics
const errorRate = new Rate('errors');
const paceScoresLatency = new Trend('pace_scores_latency');
const feedbackLatency = new Trend('feedback_latency');
const prospectusLatency = new Trend('prospectus_latency');
const onboardingLatency = new Trend('onboarding_latency');
const successCount = new Counter('successful_requests');
const failureCount = new Counter('failed_requests');

export const options = {
  scenarios: {
    // PACE Scores: 1000 requests/sec
    pace_scores: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 100,
      maxVUs: 200,
    },
    // Feedback: 500 requests/sec (offset by 10s)
    feedback: {
      executor: 'constant-arrival-rate',
      rate: 500,
      timeUnit: '1s',
      duration: '30s',
      startTime: '10s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
    // Prospectus: 10 concurrent
    prospectus: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '20s',
    },
    // Onboarding: 500 requests/sec (offset by 30s)
    onboarding: {
      executor: 'constant-arrival-rate',
      rate: 500,
      timeUnit: '1s',
      duration: '30s',
      startTime: '30s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    'pace_scores_latency': ['p(95)<500', 'p(99)<1000', 'avg<300'],
    'feedback_latency': ['p(95)<500', 'p(99)<1000', 'avg<300'],
    'prospectus_latency': ['p(95)<5000', 'p(99)<10000'],
    'onboarding_latency': ['p(95)<500', 'p(99)<1000', 'avg<300'],
    'errors': ['rate<0.005'],
    'successful_requests': ['value>55000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const TEST_AUTH_TOKEN = __ENV.TEST_AUTH_TOKEN || '';

export default function () {
  if (__VU % 4 === 0) {
    testPaceScores();
  } else if (__VU % 4 === 1) {
    testFeedback();
  } else if (__VU % 4 === 2) {
    testProspectus();
  } else {
    testOnboarding();
  }
}

function testPaceScores() {
  group('API: PACE Scores - 1000 req/sec', function () {
    const payload = JSON.stringify({
      revenue: 50000000 + Math.random() * 100000000,
      employees: Math.floor(100 + Math.random() * 900),
      yearsFounded: Math.floor(5 + Math.random() * 20),
      profitMargin: Math.random() * 40,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/pace/scores`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: '10s',
    });
    const latency = Date.now() - startTime;
    paceScoresLatency.add(latency);

    const success = check(response, {
      'status 200': (r) => r.status === 200,
      'latency < 500ms': (latency) => latency < 500,
      'has score': (r) => r.body && r.body.includes('score'),
    });

    if (success) {
      successCount.add(1);
    } else {
      failureCount.add(1);
      errorRate.add(true);
    }
  });
}

function testFeedback() {
  group('API: Feedback Submit - 500 req/sec', function () {
    const payload = JSON.stringify({
      category: 'pace',
      rating: Math.floor(1 + Math.random() * 5),
      comment: 'Load test feedback',
      email: `test-${Date.now()}-${Math.random()}@test.com`,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/feedback`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '10s',
    });
    const latency = Date.now() - startTime;
    feedbackLatency.add(latency);

    const success = check(response, {
      'status 200 or 201': (r) => r.status === 200 || r.status === 201,
      'latency < 500ms': (latency) => latency < 500,
    });

    if (success) {
      successCount.add(1);
    } else {
      failureCount.add(1);
      errorRate.add(true);
    }
  });
}

function testProspectus() {
  group('API: Prospectus Generate - 10 concurrent', function () {
    const payload = JSON.stringify({
      companyId: `company-${__VU}-${Date.now()}`,
      companyName: `Test Company ${__VU}`,
      industry: 'Software',
      revenue: 100000000,
      employees: 500,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/prospectus/generate`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: '30s',
    });
    const latency = Date.now() - startTime;
    prospectusLatency.add(latency);

    const success = check(response, {
      'status 200': (r) => r.status === 200,
      'latency < 5s': (latency) => latency < 5000,
    });

    if (success) {
      successCount.add(1);
    } else {
      failureCount.add(1);
      errorRate.add(true);
    }
  });

  sleep(1);
}

function testOnboarding() {
  group('API: Onboarding Progress - 500 req/sec', function () {
    const payload = JSON.stringify({
      companyId: `company-${__VU}`,
      step: Math.floor(1 + Math.random() * 10),
      status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/onboarding/progress`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: '10s',
    });
    const latency = Date.now() - startTime;
    onboardingLatency.add(latency);

    const success = check(response, {
      'status 200': (r) => r.status === 200,
      'latency < 500ms': (latency) => latency < 500,
    });

    if (success) {
      successCount.add(1);
    } else {
      failureCount.add(1);
      errorRate.add(true);
    }
  });
}

export function handleSummary(data) {
  let summary = '\n=== API Load Test Results ===\n';

  if (data.metrics) {
    const metrics = {
      'pace_scores_latency': 'PACE Scores Latency (ms)',
      'feedback_latency': 'Feedback Latency (ms)',
      'prospectus_latency': 'Prospectus Latency (ms)',
      'onboarding_latency': 'Onboarding Latency (ms)',
      'errors': 'Error Rate',
      'successful_requests': 'Successful Requests',
      'failed_requests': 'Failed Requests',
    };

    Object.entries(metrics).forEach(([key, label]) => {
      if (data.metrics[key]) {
        summary += `${label}: ${JSON.stringify(data.metrics[key].values)}\n`;
      }
    });
  }

  return {
    'stdout': summary,
    'api-load-results.json': JSON.stringify(data),
  };
}
