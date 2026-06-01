#!/usr/bin/env node

/**
 * Load Test Environment Setup
 * Configures and validates test environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

class TestEnvironmentSetup {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.readyToTest = true;
  }

  checkEnvironmentVariables() {
    console.log('🔧 Checking environment variables...\n');

    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
    const optional = ['NEXTAUTH_URL', 'NEXT_PUBLIC_APP_URL'];

    required.forEach(variable => {
      if (process.env[variable]) {
        console.log(`✅ ${variable} is set`);
        this.checks.push(variable);
      } else {
        console.log(`❌ ${variable} is missing`);
        this.readyToTest = false;
      }
    });

    optional.forEach(variable => {
      if (process.env[variable]) {
        console.log(`✅ ${variable} is set`);
      } else {
        console.log(`⚠️  ${variable} is not set (using defaults)`);
        this.warnings.push(variable);
      }
    });

    console.log();
  }

  checkAppRunning() {
    console.log('🚀 Checking if app is running...\n');

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

    try {
      execSync(`curl -s -f ${baseUrl}/api/health >/dev/null 2>&1`, { stdio: 'pipe' });
      console.log(`✅ App is running at ${baseUrl}`);
      this.checks.push('app_running');
    } catch (error) {
      console.log(`❌ App is not running at ${baseUrl}`);
      console.log('   Start the app with: npm run dev');
      this.warnings.push('app_not_running');
    }

    console.log();
  }

  checkDatabaseConnection() {
    console.log('🗄️  Checking database connection...\n');

    try {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        console.log('⚠️  DATABASE_URL not configured');
        this.warnings.push('no_database_url');
        return;
      }

      // Try to parse and validate connection string
      const url = new URL(connectionString);
      console.log(`✅ Database configured:`);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Port: ${url.port}`);
      console.log(`   Database: ${url.pathname.split('/')[1]}`);
      this.checks.push('database_configured');
    } catch (error) {
      console.log(`❌ Invalid DATABASE_URL format`);
      this.readyToTest = false;
    }

    console.log();
  }

  checkLoadTestScripts() {
    console.log('📝 Checking load test scripts...\n');

    const scripts = [
      'user-load.k6.js',
      'api-load.k6.js',
      'db-load.k6.js',
      'workflow-load.k6.js',
    ];

    scripts.forEach(script => {
      const filePath = `load-tests/${script}`;
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        console.log(`✅ ${script} (${(size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`❌ ${script} not found`);
        this.readyToTest = false;
      }
    });

    console.log();
  }

  checkK6Installation() {
    console.log('⚙️  Checking k6 installation...\n');

    try {
      const version = execSync('k6 version', { stdio: 'pipe' }).toString().trim();
      console.log(`✅ k6 is installed: ${version}`);
      this.checks.push('k6_installed');
    } catch (error) {
      console.log('❌ k6 is not installed');
      console.log('   Install with: brew install k6 (macOS) or apt-get install k6 (Linux)');
      this.warnings.push('k6_not_installed');
    }

    console.log();
  }

  checkNodeDependencies() {
    console.log('📦 Checking Node.js dependencies...\n');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasRequiredDeps = [
        '@neondatabase/serverless' in packageJson.dependencies,
        'next' in packageJson.dependencies,
        'react' in packageJson.dependencies,
      ].every(Boolean);

      if (hasRequiredDeps) {
        console.log('✅ All required dependencies are configured');
        this.checks.push('dependencies_ok');
      } else {
        console.log('⚠️  Some dependencies may be missing');
      }
    } catch (error) {
      console.log('⚠️  Could not check dependencies');
    }

    console.log();
  }

  checkDiskSpace() {
    console.log('💾 Checking available disk space...\n');

    try {
      const diskInfo = execSync('df -h .', { stdio: 'pipe' }).toString();
      const lines = diskInfo.split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        const available = parts[3];
        console.log(`✅ Available disk space: ${available}`);
      }
    } catch (error) {
      console.log('ℹ️  Could not check disk space');
    }

    console.log();
  }

  generateConfiguration() {
    console.log('📄 Generating test configuration...\n');

    const config = {
      baseUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
      database: process.env.DATABASE_URL ? 'configured' : 'not configured',
      k6: {
        installed: true,
        version: '0.47.0+',
      },
      tests: {
        userLoad: 'enabled',
        apiLoad: 'enabled',
        dbLoad: 'enabled',
        workflowLoad: 'enabled',
      },
      targetMetrics: {
        dashboardLoadTime: '<2000ms (p95)',
        apiLatency: '<500ms (p95)',
        errorRate: '<0.5%',
        databaseQueryTime: '<200ms (p95)',
      },
    };

    fs.writeFileSync('load-tests/test-config.json', JSON.stringify(config, null, 2));
    console.log('✅ Configuration saved to: load-tests/test-config.json\n');
  }

  printSummary() {
    console.log('═'.repeat(70));
    console.log('TEST ENVIRONMENT SETUP SUMMARY');
    console.log('═'.repeat(70) + '\n');

    const passed = this.checks.length;
    const warned = this.warnings.length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warned}`);
    console.log();

    if (this.readyToTest) {
      console.log('✅ READY TO RUN TESTS\n');
      console.log('Next steps:');
      console.log('1. bash load-tests/run-all-tests.sh');
      console.log('2. node load-tests/analyze-performance.js');
      console.log('3. Review results in load-tests/performance-report.json');
    } else {
      console.log('❌ SETUP INCOMPLETE\n');
      console.log('Fix the errors above before running tests');
    }

    console.log('\n' + '═'.repeat(70) + '\n');
  }

  async run() {
    console.log('═'.repeat(70));
    console.log('IPOReady Load Test Environment Setup');
    console.log('═'.repeat(70) + '\n');

    this.checkEnvironmentVariables();
    this.checkAppRunning();
    this.checkDatabaseConnection();
    this.checkLoadTestScripts();
    this.checkK6Installation();
    this.checkNodeDependencies();
    this.checkDiskSpace();
    this.generateConfiguration();
    this.printSummary();

    process.exit(this.readyToTest ? 0 : 1);
  }
}

const setup = new TestEnvironmentSetup();
setup.run().catch(console.error);
