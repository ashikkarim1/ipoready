import { Pool } from '@neondatabase/serverless';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter, Gauge } from 'k6/metrics';

const dbUrl = __ENV.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

let pool;

const queryLatency = new Trend('db_query_latency');
const updateLatency = new Trend('db_update_latency');
const errorRate = new Rate('db_errors');
const connectionCount = new Gauge('db_connections');
const slowQueries = new Counter('db_slow_queries');

export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp to 20 VUs over 1 minute
    { duration: '2m', target: 50 },  // Ramp to 50 VUs
    { duration: '2m', target: 20 },  // Ramp down to 20 VUs
    { duration: '1m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    'db_query_latency': ['p95<200', 'p99<300'],
    'db_update_latency': ['p95<300', 'p99<500'],
    'db_errors': ['rate<0.01'],
    'db_slow_queries': ['count<50'],
  },
};

export function setup() {
  // Initialize pool once
  pool = new Pool({ connectionString: dbUrl });
  return {};
}

export function teardown() {
  if (pool) {
    pool.end();
  }
}

export default function (data) {
  const testType = Math.random();
  
  try {
    // Test PACE score queries (read-heavy)
    if (testType < 0.3) {
      testPaceQuery();
    }
    // Test company data queries (with potential N+1)
    else if (testType < 0.6) {
      testCompanyQuery();
    }
    // Test feedback queries
    else if (testType < 0.85) {
      testFeedbackQuery();
    }
    // Test update operations
    else {
      testUpdate();
    }
    
    sleep(1);
  } catch (error) {
    errorRate.add(1);
    console.error('Error:', error);
  }
}

function testPaceQuery() {
  const start = Date.now();
  const client = pool.connect();
  
  try {
    const result = client.query(
      'SELECT id, company_id, overall_score, readiness_stage FROM pace_scores LIMIT 100'
    );
    
    const elapsed = Date.now() - start;
    queryLatency.add(elapsed);
    
    if (elapsed > 200) {
      slowQueries.add(1);
    }
    
    check(result, {
      'query returned results': (r) => r.rows && r.rows.length > 0,
      'latency under 200ms': () => elapsed < 200,
    });
  } finally {
    client.release();
  }
}

function testCompanyQuery() {
  const start = Date.now();
  const client = pool.connect();
  
  try {
    // Simulating potential N+1 query scenario
    const companies = client.query(
      'SELECT id, name, industry FROM companies LIMIT 50'
    );
    
    const elapsed = Date.now() - start;
    queryLatency.add(elapsed);
    
    if (elapsed > 200) {
      slowQueries.add(1);
    }
    
    check(companies, {
      'company query successful': (r) => r.rows && r.rows.length > 0,
      'latency under 200ms': () => elapsed < 200,
    });
  } finally {
    client.release();
  }
}

function testFeedbackQuery() {
  const start = Date.now();
  const client = pool.connect();
  
  try {
    const result = client.query(
      'SELECT id, company_id, content, rating FROM feedback ORDER BY created_at DESC LIMIT 50'
    );
    
    const elapsed = Date.now() - start;
    queryLatency.add(elapsed);
    
    if (elapsed > 200) {
      slowQueries.add(1);
    }
    
    check(result, {
      'feedback query successful': (r) => r.rows && r.rows.length >= 0,
      'latency under 200ms': () => elapsed < 200,
    });
  } finally {
    client.release();
  }
}

function testUpdate() {
  const start = Date.now();
  const client = pool.connect();
  
  try {
    const companyId = Math.floor(Math.random() * 100) + 1;
    const result = client.query(
      'UPDATE companies SET updated_at = NOW() WHERE id = $1 RETURNING id',
      [companyId]
    );
    
    const elapsed = Date.now() - start;
    updateLatency.add(elapsed);
    
    if (elapsed > 300) {
      slowQueries.add(1);
    }
    
    check(result, {
      'update successful': (r) => r.rowCount >= 0,
      'latency under 300ms': () => elapsed < 300,
    });
  } finally {
    client.release();
  }
}
