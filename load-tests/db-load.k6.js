import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Histogram } from 'k6/metrics';

// Metrics
const queryLatency = new Trend('db_query_latency');
const updateLatency = new Trend('db_update_latency');
const errorRate = new Rate('db_errors');
const queryCount = new Counter('db_queries');
const slowQueryCount = new Counter('slow_queries_200ms');
const paceUpdateTime = new Histogram('pace_update_time');

export const options = {
  scenarios: {
    database_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 100 },
        { duration: '1m30s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'db_query_latency': ['p(95)<200', 'p(99)<500', 'avg<150', 'max<1000'],
    'db_update_latency': ['p(95)<300', 'p(99)<800', 'avg<200'],
    'db_errors': ['rate<0.01'],
    'slow_queries_200ms': ['value<100'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const TEST_AUTH_TOKEN = __ENV.TEST_AUTH_TOKEN || '';

export default function () {
  const companyIndex = Math.floor(Math.random() * 100);
  const companyId = `company-${companyIndex}`;

  // Test 1: Query PACE data (read-heavy)
  group('Database: PACE Query Performance', function () {
    const startTime = Date.now();
    const response = http.get(
      `${BASE_URL}/api/pace/scores?companyId=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        },
      }
    );
    const latency = Date.now() - startTime;
    queryLatency.add(latency);
    queryCount.add(1);

    if (latency > 200) {
      slowQueryCount.add(1);
    }

    check(response, {
      'query status 200': (r) => r.status === 200,
      'query latency < 200ms': (latency) => latency < 200,
      'query latency < 500ms (p99)': (latency) => latency < 500,
    });
  });

  sleep(0.1);

  // Test 2: Update PACE scores (write-heavy)
  group('Database: PACE Update Performance', function () {
    const payload = JSON.stringify({
      companyId: companyId,
      overallScore: 65 + Math.random() * 30,
      governanceScore: 60 + Math.random() * 35,
      profitabilityScore: 70 + Math.random() * 25,
      paceScore: 62 + Math.random() * 32,
      updateTimestamp: new Date().toISOString(),
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/pace/scores`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const latency = Date.now() - startTime;
    updateLatency.add(latency);
    paceUpdateTime.add(latency);

    if (latency > 200) {
      slowQueryCount.add(1);
    }

    const success = check(response, {
      'update status 200': (r) => r.status === 200,
      'update latency < 300ms': (latency) => latency < 300,
    });

    if (!success) {
      errorRate.add(true);
    }
  });

  sleep(0.1);

  // Test 3: Company data fetch (potential N+1)
  group('Database: Company Full Data Load', function () {
    const startTime = Date.now();
    const response = http.get(
      `${BASE_URL}/api/company?id=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        },
      }
    );
    const latency = Date.now() - startTime;
    queryLatency.add(latency);
    queryCount.add(1);

    if (latency > 200) {
      slowQueryCount.add(1);
      console.warn(`SLOW QUERY DETECTED: ${latency}ms for company data`);
    }

    check(response, {
      'company data status 200': (r) => r.status === 200,
      'company data latency < 200ms': (latency) => latency < 200,
    });
  });

  sleep(0.2);

  // Test 4: Concurrent updates to same company (concurrency test)
  group('Database: Concurrent Updates', function () {
    const payload = JSON.stringify({
      companyId: `stress-test-company-${Math.floor(__VU / 5)}`,
      metric: 'revenue',
      value: 10000000 + Math.random() * 90000000,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/company/metrics`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const latency = Date.now() - startTime;
    updateLatency.add(latency);

    check(response, {
      'concurrent update status 200': (r) => r.status === 200,
      'concurrent update latency < 300ms': (latency) => latency < 300,
    });
  });

  sleep(0.15);
}

export function handleSummary(data) {
  let summary = '\n=== Database Load Test Results ===\n';
  summary += 'Performance Analysis:\n';

  if (data.metrics) {
    const metrics = [
      { key: 'db_query_latency', label: 'Query Latency (ms)' },
      { key: 'db_update_latency', label: 'Update Latency (ms)' },
      { key: 'db_errors', label: 'Error Rate' },
      { key: 'db_queries', label: 'Total Queries' },
      { key: 'slow_queries_200ms', label: 'Queries > 200ms' },
    ];

    metrics.forEach(({ key, label }) => {
      if (data.metrics[key]) {
        const metric = data.metrics[key];
        summary += `\n${label}:\n`;
        summary += `  P50: ${metric.values['p(50)']?.toFixed(2)}ms\n`;
        summary += `  P95: ${metric.values['p(95)']?.toFixed(2)}ms\n`;
        summary += `  P99: ${metric.values['p(99)']?.toFixed(2)}ms\n`;
        summary += `  Avg: ${metric.values['avg']?.toFixed(2)}ms\n`;
        summary += `  Max: ${metric.values['max']?.toFixed(2)}ms\n`;
      }
    });
  }

  return {
    'stdout': summary,
    'db-load-results.json': JSON.stringify(data),
  };
}
