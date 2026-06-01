#!/usr/bin/env node

/**
 * Performance Analysis Tool
 * Analyzes load test results and identifies bottlenecks
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor() {
    this.results = {};
    this.issues = [];
    this.recommendations = [];
  }

  async analyzeResults(testName, resultFile) {
    console.log(`\n📊 Analyzing ${testName}...`);

    try {
      const data = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
      this.results[testName] = data;

      if (data.metrics) {
        this.analyzeMetrics(testName, data.metrics);
      }
    } catch (error) {
      console.error(`Error reading ${resultFile}:`, error.message);
    }
  }

  analyzeMetrics(testName, metrics) {
    // Analyze each metric
    Object.entries(metrics).forEach(([metricName, metricData]) => {
      const values = metricData.values || {};

      // Check thresholds
      if (metricName.includes('latency') || metricName.includes('time')) {
        this.analyzeLatency(testName, metricName, values);
      }

      if (metricName.includes('error')) {
        this.analyzeErrors(testName, metricName, values);
      }

      if (metricName.includes('query') && metricName.includes('slow')) {
        this.analyzeSlowQueries(testName, metricName, values);
      }
    });
  }

  analyzeLatency(testName, metricName, values) {
    const p95 = values['p(95)'];
    const p99 = values['p(99)'];
    const avg = values['avg'];

    console.log(`  ${metricName}:`);
    console.log(`    P95: ${p95?.toFixed(2)}ms`);
    console.log(`    P99: ${p99?.toFixed(2)}ms`);
    console.log(`    Avg: ${avg?.toFixed(2)}ms`);

    // Flag issues
    if (p95 > 2000) {
      this.issues.push({
        severity: 'critical',
        test: testName,
        metric: metricName,
        message: `P95 latency ${p95?.toFixed(0)}ms exceeds 2s target`,
      });
      this.recommendations.push({
        test: testName,
        action: `Optimize ${metricName} - exceeds target`,
        suggestion: 'Check database queries, add caching, or optimize algorithm',
      });
    } else if (p95 > 1000) {
      this.issues.push({
        severity: 'warning',
        test: testName,
        metric: metricName,
        message: `P95 latency ${p95?.toFixed(0)}ms approaching 2s target`,
      });
    }
  }

  analyzeErrors(testName, metricName, values) {
    const errorRate = values['rate'];

    if (errorRate !== undefined) {
      console.log(`  ${metricName}: ${(errorRate * 100).toFixed(2)}%`);

      if (errorRate > 0.02) {
        this.issues.push({
          severity: 'critical',
          test: testName,
          metric: metricName,
          message: `Error rate ${(errorRate * 100).toFixed(2)}% exceeds 2% target`,
        });
        this.recommendations.push({
          test: testName,
          action: 'High error rate detected',
          suggestion: 'Check server logs, validate database connectivity, review error handling',
        });
      } else if (errorRate > 0.01) {
        this.issues.push({
          severity: 'warning',
          test: testName,
          metric: metricName,
          message: `Error rate ${(errorRate * 100).toFixed(2)}% approaching target`,
        });
      }
    }
  }

  analyzeSlowQueries(testName, metricName, values) {
    const slowCount = values['value'];

    if (slowCount > 100) {
      this.issues.push({
        severity: 'critical',
        test: testName,
        metric: metricName,
        message: `${slowCount} queries exceeded 200ms (slow query threshold)`,
      });
      this.recommendations.push({
        test: testName,
        action: 'High number of slow queries',
        suggestion: 'Add database indexes, optimize queries, or implement caching',
      });
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('PERFORMANCE ANALYSIS SUMMARY');
    console.log('='.repeat(70));

    if (this.issues.length === 0) {
      console.log('\n✅ No critical issues detected!\n');
    } else {
      console.log(`\n⚠️  Found ${this.issues.length} issue(s):\n`);

      // Group by severity
      const critical = this.issues.filter(i => i.severity === 'critical');
      const warnings = this.issues.filter(i => i.severity === 'warning');

      if (critical.length > 0) {
        console.log('🔴 CRITICAL:');
        critical.forEach(issue => {
          console.log(`  - ${issue.test}: ${issue.message}`);
        });
      }

      if (warnings.length > 0) {
        console.log('\n🟡 WARNINGS:');
        warnings.forEach(issue => {
          console.log(`  - ${issue.test}: ${issue.message}`);
        });
      }
    }

    if (this.recommendations.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('RECOMMENDATIONS FOR IMPROVEMENT');
      console.log('='.repeat(70) + '\n');

      this.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.test}] ${rec.action}`);
        console.log(`   → ${rec.suggestion}\n`);
      });
    }

    console.log('='.repeat(70));
    console.log('Next Steps:');
    console.log('1. Review identified bottlenecks');
    console.log('2. Implement recommended optimizations');
    console.log('3. Re-run load tests to validate improvements');
    console.log('4. Monitor production metrics closely after launch');
    console.log('='.repeat(70) + '\n');
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.results,
      issues: this.issues,
      recommendations: this.recommendations,
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'critical').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
      },
    };

    const reportPath = 'load-tests/performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new PerformanceAnalyzer();
  const resultsDir = 'load-tests';

  // Check for result files
  const resultFiles = [
    'user-load-results.json',
    'api-load-results.json',
    'db-load-results.json',
    'workflow-load-results.json',
  ];

  let foundAny = false;
  for (const file of resultFiles) {
    const filePath = path.join(resultsDir, file);
    if (fs.existsSync(filePath)) {
      await analyzer.analyzeResults(file.replace('-results.json', ''), filePath);
      foundAny = true;
    }
  }

  if (!foundAny) {
    console.log('ℹ️  No test results found. Run the load tests first:');
    console.log('   k6 run load-tests/user-load.k6.js');
    console.log('   k6 run load-tests/api-load.k6.js');
    console.log('   k6 run load-tests/db-load.k6.js');
    console.log('   k6 run load-tests/workflow-load.k6.js');
    return;
  }

  analyzer.printSummary();
  analyzer.generateReport();
}

main().catch(console.error);
