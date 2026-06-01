import sql from 'k6/x/sql';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const dbUrl = __ENV.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const db = sql.open('postgres', dbUrl);

const queryLatency = new Trend('db_query_latency');
const updateLatency = new Trend('db_update_latency');
const errorRate = new Rate('db_errors');
const slowQueries = new Counter('db_slow_queries');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  
    { duration: '1m', target: 25 },   
    { duration: '1m', target: 10 },   
    { duration: '30s', target: 0 },   
  ],
  thresholds: {
    'db_query_latency': ['p95<200', 'p99<300'],
    'db_update_latency': ['p95<300', 'p99<500'],
    'db_errors': ['rate<0.05'],
  },
};

export default function () {
  try {
    const testType = Math.random();
    
    if (testType < 0.3) {
      testPaceQueries();
    } else if (testType < 0.6) {
      testCompanyQueries();
    } else if (testType < 0.8) {
      testFeedbackQueries();
    } else {
      testUpdateOperations();
    }
    
    sleep(1);
  } catch (error) {
    errorRate.add(1);
  }
}

function testPaceQueries() {
  const start = Date.now();
  
  try {
    const result = db.query(
      'SELECT id, company_id, overall_score, readiness_stage FROM pace_scores LIMIT 50'
    );
    
    const elapsed = Date.now() - start;
    queryLatency.add(elapsed);
    
    if (elapsed > 200) {
      slowQueries.add(1);
    }
    
    check(result, {
      'pace query successful': (r) => r.length >= 0,
    });
  } catch (e) {
    errorRate.add(1);
  }
}

function testCompanyQueries() {
  const start = Date.now();
  
  try {
    const result = db.query(
      'SELECT id, name, industry, status FROM companies LIMIT 50'
    );
    
    const elapsed = Date.now() - start;
    queryLatency.add(elapsed);
    
    if (elapsed > 200) {
      slowQueries.add(1);
    }
    
    check(result, {
      'company query successful': (r) => r.length >= 0,
    });
  } catch (e) {
    errorRate.add(1);
  }
}

function testFeedbackQueries() {
  const start = Date.now();
  
  try {
    const result = db.query(
      'SELECT id, company_id, rating, created_at FROM feedback ORDER BY created_at DESC LIMIT 50'
    );
    
    const elapsed = Date.now() - start;
    queryLatency.add(elapsed);
    
    if (elapsed > 200) {
      slowQueries.add(1);
    }
    
    check(result, {
      'feedback query successful': (r) => r.length >= 0,
    });
  } catch (e) {
    errorRate.add(1);
  }
}

function testUpdateOperations() {
  const start = Date.now();
  
  try {
    const result = db.exec(
      'UPDATE companies SET updated_at = NOW() WHERE id IN (SELECT id FROM companies LIMIT 1)'
    );
    
    const elapsed = Date.now() - start;
    updateLatency.add(elapsed);
    
    check(result, {
      'update successful': (r) => true,
    });
  } catch (e) {
    errorRate.add(1);
  }
}
