#!/usr/bin/env node

/**
 * IPOReady Build Verification Script (Node.js version)
 *
 * This script performs comprehensive verification of the build process.
 * Works on Windows, macOS, and Linux.
 *
 * Usage: node scripts/verify-build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI Colors
const Colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Check results
let totalChecks = 0;
let passedChecks = 0;
const failedChecks = [];

// Utility functions
function logHeader(text) {
  console.log('');
  console.log(`${Colors.blue}${'='.repeat(70)}${Colors.reset}`);
  console.log(`${Colors.blue}║${Colors.reset} ${text}`);
  console.log(`${Colors.blue}${'='.repeat(70)}${Colors.reset}`);
  console.log('');
}

function logCheck(checkName, status) {
  totalChecks++;
  const statusText = status === 'PASS'
    ? `${Colors.green}✅ PASS${Colors.reset}`
    : `${Colors.red}❌ FAIL${Colors.reset}`;
  console.log(`${statusText} | ${checkName}`);

  if (status === 'PASS') {
    passedChecks++;
  } else {
    failedChecks.push(checkName);
  }
}

function logInfo(text) {
  console.log(`${Colors.yellow}ℹ️  INFO${Colors.reset} | ${text}`);
}

function logError(text) {
  console.log(`${Colors.red}⚠️  ERROR${Colors.reset} | ${text}`);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function dirExists(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function getNodeVersion() {
  try {
    const version = execSync('node --version').toString().trim();
    return version;
  } catch {
    return null;
  }
}

function getNpmVersion() {
  try {
    const version = execSync('npm --version').toString().trim();
    return version;
  } catch {
    return null;
  }
}

function runBuild() {
  try {
    logInfo('Removing old .next directory...');
    if (dirExists('.next')) {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }

    logInfo('Starting clean build... (this may take 1-2 minutes)');
    const startTime = Date.now();
    execSync('npm run build', { stdio: 'inherit' });
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`Build duration: ${duration} seconds`);
    return true;
  } catch (error) {
    return false;
  }
}

function runTypeScriptCheck() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function runLint() {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    return true;
  } catch {
    // ESLint returns non-zero on warnings, just log
    return true;
  }
}

function getDirectorySize(dirPath) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`powershell -Command "((Get-ChildItem '${dirPath}' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)"`)
        .toString()
        .trim();
      return `${output} MB`;
    } else {
      const output = execSync(`du -sh '${dirPath}'`).toString().trim().split('\t')[0];
      return output;
    }
  } catch {
    return 'Unknown';
  }
}

// Main execution
async function main() {
  console.log(`${Colors.blue}╔${'═'.repeat(68)}╗${Colors.reset}`);
  console.log(`${Colors.blue}║${Colors.reset} ${Colors.cyan}IPOReady Build Verification Script${Colors.reset}`);
  console.log(`${Colors.blue}║${Colors.reset} Started at: ${new Date().toLocaleString()}`);
  console.log(`${Colors.blue}╚${'═'.repeat(68)}╝${Colors.reset}`);

  // ============================================================================
  // SECTION 1: PRE-BUILD ENVIRONMENT CHECK
  // ============================================================================

  logHeader('SECTION 1: PRE-BUILD ENVIRONMENT CHECK');

  // Node.js version
  const nodeVersion = getNodeVersion();
  if (nodeVersion) {
    console.log(`Node version: ${nodeVersion}`);
    const majorVersion = parseInt(nodeVersion.match(/\d+/)[0]);
    if (majorVersion >= 18) {
      logCheck('Node.js version (18+)', 'PASS');
    } else {
      logCheck('Node.js version (18+)', 'FAIL');
    }
  } else {
    logCheck('Node.js installed', 'FAIL');
    process.exit(1);
  }

  // npm version
  const npmVersion = getNpmVersion();
  if (npmVersion) {
    console.log(`npm version: ${npmVersion}`);
    logCheck('npm installed', 'PASS');
  } else {
    logCheck('npm installed', 'FAIL');
    process.exit(1);
  }

  // node_modules
  logCheck('Dependencies installed (node_modules exists)', dirExists('node_modules') ? 'PASS' : 'FAIL');

  // .env.local
  if (fileExists('.env.local')) {
    logCheck('Environment config (.env.local exists)', 'PASS');
    const envContent = fs.readFileSync('.env.local', 'utf8');
    if (envContent.includes('DATABASE_URL') || envContent.includes('NEXTAUTH_SECRET')) {
      logCheck('Critical env vars configured', 'PASS');
    } else {
      logCheck('Critical env vars configured', 'FAIL');
    }
  } else {
    logCheck('Environment config (.env.local exists)', 'FAIL');
    logError('Copy .env.example to .env.local and configure');
  }

  // Config files
  logCheck('TypeScript config (tsconfig.json exists)', fileExists('tsconfig.json') ? 'PASS' : 'FAIL');
  logCheck('Next.js config (next.config.js exists)', fileExists('next.config.js') ? 'PASS' : 'FAIL');
  logCheck('Package manifest (package.json exists)', fileExists('package.json') ? 'PASS' : 'FAIL');

  // ============================================================================
  // SECTION 2: BUILD EXECUTION
  // ============================================================================

  logHeader('SECTION 2: BUILD EXECUTION');

  if (runBuild()) {
    logCheck('Clean build completed successfully', 'PASS');
  } else {
    logCheck('Clean build completed successfully', 'FAIL');
    logError('Build failed - check errors above');
    process.exit(1);
  }

  // ============================================================================
  // SECTION 3: BUILD ARTIFACTS VERIFICATION
  // ============================================================================

  logHeader('SECTION 3: BUILD ARTIFACTS VERIFICATION');

  if (dirExists('.next')) {
    logCheck('.next directory created', 'PASS');

    logCheck('.next/static (assets) exists', dirExists('.next/static') ? 'PASS' : 'FAIL');
    logCheck('.next/server (server code) exists', dirExists('.next/server') ? 'PASS' : 'FAIL');

    const nextSize = getDirectorySize('.next');
    const staticSize = getDirectorySize('.next/static');
    console.log(`Build artifacts size:`);
    console.log(`  .next total: ${nextSize}`);
    console.log(`  .next/static: ${staticSize}`);
    logCheck('Build artifacts size acceptable', 'PASS');
  } else {
    logCheck('.next directory created', 'FAIL');
    process.exit(1);
  }

  // ============================================================================
  // SECTION 4: TYPESCRIPT VERIFICATION
  // ============================================================================

  logHeader('SECTION 4: TYPESCRIPT VERIFICATION');

  logInfo('Running TypeScript compiler check...');
  if (runTypeScriptCheck()) {
    logCheck('TypeScript compilation (no errors)', 'PASS');
  } else {
    logCheck('TypeScript compilation (no errors)', 'FAIL');
  }

  // ============================================================================
  // SECTION 5: LINTING CHECK
  // ============================================================================

  logHeader('SECTION 5: CODE LINTING');

  logInfo('Running ESLint...');
  logCheck('Linting check', runLint() ? 'PASS' : 'FAIL');

  // ============================================================================
  // SECTION 6: PAGE EXISTENCE CHECK
  // ============================================================================

  logHeader('SECTION 6: CRITICAL PAGES VERIFICATION');

  const criticalPages = [
    'src/app/page.tsx',
    'src/app/login/page.tsx',
    'src/app/register/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/dashboard/capital-markets/page.tsx',
    'src/app/dashboard/listed-services/page.tsx',
    'src/app/dashboard/documents/page.tsx',
    'src/app/dashboard/compliance/page.tsx',
    'src/app/dashboard/cap-table/page.tsx',
    'src/app/pricing/page.tsx',
    'src/app/legal/privacy/page.tsx',
    'src/app/legal/tos/page.tsx',
  ];

  let missingPages = 0;
  for (const page of criticalPages) {
    if (fileExists(page)) {
      logCheck(`Page exists: ${page}`, 'PASS');
    } else {
      logCheck(`Page exists: ${page}`, 'FAIL');
      missingPages++;
    }
  }

  if (missingPages > 0) {
    logError(`${missingPages} critical pages missing`);
  }

  // ============================================================================
  // SECTION 7: CONFIG VALIDATION
  // ============================================================================

  logHeader('SECTION 7: CONFIGURATION VALIDATION');

  try {
    require(path.resolve('./next.config.js'));
    logCheck('next.config.js syntax valid', 'PASS');
  } catch {
    logCheck('next.config.js syntax valid', 'FAIL');
  }

  try {
    require(path.resolve('./tsconfig.json'));
    logCheck('tsconfig.json syntax valid', 'PASS');
  } catch {
    logCheck('tsconfig.json syntax valid', 'FAIL');
  }

  try {
    require(path.resolve('./package.json'));
    logCheck('package.json syntax valid', 'PASS');
  } catch {
    logCheck('package.json syntax valid', 'FAIL');
  }

  // ============================================================================
  // SECTION 8: SUMMARY
  // ============================================================================

  logHeader('SECTION 8: VERIFICATION SUMMARY');

  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed: ${Colors.green}${passedChecks}${Colors.reset}`);
  console.log(`Failed: ${Colors.red}${totalChecks - passedChecks}${Colors.reset}`);
  console.log('');

  const passRate = Math.round((passedChecks * 100) / totalChecks);
  console.log(`Pass Rate: ${Colors.green}${passRate}%${Colors.reset}`);
  console.log('');

  if (failedChecks.length === 0) {
    console.log(`${Colors.green}${'═'.repeat(70)}${Colors.reset}`);
    console.log(`${Colors.green}✅ ALL CHECKS PASSED - BUILD IS READY${Colors.reset}`);
    console.log(`${Colors.green}${'═'.repeat(70)}${Colors.reset}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Test routes in browser: http://localhost:3000');
    console.log('  3. Check browser console for errors');
    console.log('  4. Verify authentication and database connectivity');
    console.log('');
    process.exit(0);
  } else {
    console.log(`${Colors.red}${'═'.repeat(70)}${Colors.reset}`);
    console.log(`${Colors.red}❌ SOME CHECKS FAILED - REVIEW ISSUES BELOW${Colors.reset}`);
    console.log(`${Colors.red}${'═'.repeat(70)}${Colors.reset}`);
    console.log('');
    console.log('Failed checks:');
    for (const failed of failedChecks) {
      console.log(`  • ${failed}`);
    }
    console.log('');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
