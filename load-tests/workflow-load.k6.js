import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Metrics
const workflowLatency = new Trend('workflow_latency');
const prospectusGenLatency = new Trend('prospectus_gen_latency');
const dashboardLoadLatency = new Trend('dashboard_load_latency');
const errorRate = new Rate('workflow_errors');
const workflowsCompleted = new Counter('workflows_completed');
const prospectusesGenerated = new Counter('prospectuses_generated');

export const options = {
  scenarios: {
    // 50 companies doing onboarding concurrently
    onboarding_workflow: {
      executor: 'constant-vus',
      vus: 50,
      duration: '3m',
    },
  },
  thresholds: {
    'workflow_latency': ['p(95)<2000', 'p(99)<5000'],
    'prospectus_gen_latency': ['p(95)<5000', 'p(99)<15000'],
    'dashboard_load_latency': ['p(95)<2000', 'p(99)<5000'],
    'workflow_errors': ['rate<0.02'],
    'workflows_completed': ['value>45'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const TEST_AUTH_TOKEN = __ENV.TEST_AUTH_TOKEN || '';

// Simulated workflow: real-world IPO readiness journey
export default function () {
  const companyId = `workflow-company-${__VU}-${Date.now()}`;
  const companyName = `Test Company ${__VU}`;

  group('Real-World Workflow: Company Onboarding', function () {
    // Step 1: Register company (20% of traffic)
    if (Math.random() < 0.2) {
      registerCompany(companyId, companyName);
      sleep(0.5);
    }

    // Step 2: Complete company profile (50% of traffic)
    if (Math.random() < 0.5) {
      updateCompanyProfile(companyId);
      sleep(0.5);
    }

    // Step 3: Run PACE assessment (30% of traffic)
    if (Math.random() < 0.3) {
      runPaceAssessment(companyId);
      sleep(1);
    }

    // Step 4: Generate prospectus (10% of traffic - heavy)
    if (Math.random() < 0.1) {
      generateProspectus(companyId, companyName);
      sleep(2);
    }

    // Step 5: Browse dashboard (35% of traffic - reads)
    if (Math.random() < 0.35) {
      browseDashboard(companyId);
      sleep(0.5);
    }

    // Step 6: Submit feedback (15% of traffic)
    if (Math.random() < 0.15) {
      submitFeedback(companyId);
      sleep(0.3);
    }

    workflowsCompleted.add(1);
  });

  sleep(2);
}

function registerCompany(companyId, companyName) {
  group('Step 1: Register Company', function () {
    const payload = JSON.stringify({
      companyId: companyId,
      companyName: companyName,
      industry: 'Software',
      country: 'US',
      registrationDate: new Date().toISOString(),
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/company`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const latency = Date.now() - startTime;
    workflowLatency.add(latency);

    check(response, {
      'register status 201': (r) => r.status === 201 || r.status === 200,
      'register latency < 2s': (latency) => latency < 2000,
    });
  });
}

function updateCompanyProfile(companyId) {
  group('Step 2: Update Company Profile', function () {
    const payload = JSON.stringify({
      companyId: companyId,
      employees: Math.floor(50 + Math.random() * 950),
      revenue: 10000000 + Math.random() * 490000000,
      yearsFounded: Math.floor(3 + Math.random() * 20),
      profitMargin: Math.random() * 40,
      legalStatus: 'C-Corp',
      exchangeListing: 'NASDAQ',
      board: {
        ceoName: 'John Doe',
        cfoName: 'Jane Smith',
        boardMembers: Math.floor(3 + Math.random() * 9),
      },
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/company/profile`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const latency = Date.now() - startTime;
    workflowLatency.add(latency);

    check(response, {
      'profile update status 200': (r) => r.status === 200,
      'profile update latency < 2s': (latency) => latency < 2000,
    });
  });
}

function runPaceAssessment(companyId) {
  group('Step 3: Run PACE Assessment', function () {
    const payload = JSON.stringify({
      companyId: companyId,
      revenue: 50000000 + Math.random() * 100000000,
      employees: 100 + Math.random() * 900,
      yearsFounded: 5 + Math.random() * 20,
      profitMargin: Math.random() * 40,
      governanceScore: 50 + Math.random() * 40,
      complianceScore: 40 + Math.random() * 50,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/pace/scores`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const latency = Date.now() - startTime;
    workflowLatency.add(latency);

    check(response, {
      'pace assessment status 200': (r) => r.status === 200,
      'pace assessment latency < 2s': (latency) => latency < 2000,
    });
  });
}

function generateProspectus(companyId, companyName) {
  group('Step 4: Generate Prospectus (Heavy)', function () {
    const payload = JSON.stringify({
      companyId: companyId,
      companyName: companyName,
      includeFinancials: true,
      includeLegalDocs: true,
      includeMgmtTeam: true,
      format: 'pdf',
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
    prospectusGenLatency.add(latency);
    prospectusesGenerated.add(1);

    check(response, {
      'prospectus status 200': (r) => r.status === 200,
      'prospectus latency < 5s': (latency) => latency < 5000,
    });
  });
}

function browseDashboard(companyId) {
  group('Step 5: Browse Dashboard', function () {
    const startTime = Date.now();
    const response = http.get(`${BASE_URL}/api/dashboard?companyId=${companyId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
    });
    const latency = Date.now() - startTime;
    dashboardLoadLatency.add(latency);

    check(response, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard latency < 2s': (latency) => latency < 2000,
    });
  });
}

function submitFeedback(companyId) {
  group('Step 6: Submit Feedback', function () {
    const payload = JSON.stringify({
      companyId: companyId,
      category: 'feature-request',
      rating: Math.floor(1 + Math.random() * 5),
      comment: 'Great workflow experience',
      email: `user-${Date.now()}@test.com`,
    });

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/feedback`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const latency = Date.now() - startTime;
    workflowLatency.add(latency);

    check(response, {
      'feedback status 200': (r) => r.status === 200 || r.status === 201,
      'feedback latency < 1s': (latency) => latency < 1000,
    });
  });
}

export function handleSummary(data) {
  let summary = '\n=== Real-World Workflow Load Test Results ===\n';

  if (data.metrics) {
    summary += '\nWorkflow Performance:\n';
    if (data.metrics.workflow_latency) {
      const m = data.metrics.workflow_latency.values;
      summary += `  Workflow Latency P95: ${m['p(95)']?.toFixed(2)}ms\n`;
      summary += `  Workflow Latency P99: ${m['p(99)']?.toFixed(2)}ms\n`;
    }
    if (data.metrics.prospectus_gen_latency) {
      const m = data.metrics.prospectus_gen_latency.values;
      summary += `  Prospectus Generation P95: ${m['p(95)']?.toFixed(2)}ms\n`;
      summary += `  Prospectus Generation P99: ${m['p(99)']?.toFixed(2)}ms\n`;
    }
    if (data.metrics.dashboard_load_latency) {
      const m = data.metrics.dashboard_load_latency.values;
      summary += `  Dashboard Load P95: ${m['p(95)']?.toFixed(2)}ms\n`;
      summary += `  Dashboard Load P99: ${m['p(99)']?.toFixed(2)}ms\n`;
    }
    if (data.metrics.workflows_completed) {
      summary += `\nTotal Workflows Completed: ${data.metrics.workflows_completed.values.value}\n`;
    }
    if (data.metrics.prospectuses_generated) {
      summary += `Total Prospectuses Generated: ${data.metrics.prospectuses_generated.values.value}\n`;
    }
  }

  return {
    'stdout': summary,
    'workflow-load-results.json': JSON.stringify(data),
  };
}
