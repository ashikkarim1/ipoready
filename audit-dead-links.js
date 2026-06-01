#!/usr/bin/env node

/**
 * Dead Links Auditor for IPOReady
 * Finds all external URLs in the codebase and checks for dead links
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// URLs to check - extracted from codebase
const URLS_TO_CHECK = [
  // APIs and external services
  'https://api.stripe.com',
  'https://api.github.com',
  'https://api.anthropic.com',
  'https://api.resend.com',
  'https://api.slack.com',
  'https://api.docusign.com',
  'https://www.docusign.com',
  'https://carta.com',
  'https://pulley.com',
  'https://www.carta.com/cap-table',
  'https://pulley.com/cap-table',
  
  // Documentation
  'https://nextjs.org',
  'https://nextjs.org/docs',
  'https://nextauth.js.org',
  'https://tailwindcss.com',
  'https://www.postgresql.org',
  'https://neon.tech',
  
  // Social/external
  'https://github.com/ashikkarim1/goipo-ae',
  'https://www.linkedin.com',
  'https://twitter.com',
  'https://slack.com',
  
  // Financial/regulatory
  'https://www.tsx.com',
  'https://www.nasdaq.com',
  'https://www.nyse.com',
  'https://www.cboe.com',
  'https://www.sec.gov',
  'https://www.iiroc.ca',
  'https://www.occ.ca',
];

const TIMEOUT = 5000; // 5 second timeout
const RESULTS = {
  working: [],
  dead: [],
  timeout: [],
  error: [],
};

async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      resolve({ url, status: 'timeout' });
    }, TIMEOUT);

    try {
      const request = protocol.head(url, { timeout: TIMEOUT }, (response) => {
        clearTimeout(timeout);
        const statusCode = response.statusCode;
        
        if (statusCode >= 200 && statusCode < 400) {
          resolve({ url, status: 'working', code: statusCode });
        } else if (statusCode >= 400 && statusCode < 500) {
          resolve({ url, status: 'dead', code: statusCode });
        } else {
          resolve({ url, status: 'error', code: statusCode });
        }
      });

      request.on('error', (error) => {
        clearTimeout(timeout);
        resolve({ url, status: 'error', error: error.message });
      });

      request.on('timeout', () => {
        clearTimeout(timeout);
        request.destroy();
        resolve({ url, status: 'timeout' });
      });
    } catch (error) {
      clearTimeout(timeout);
      resolve({ url, status: 'error', error: error.message });
    }
  });
}

async function auditLinks() {
  console.log('🔍 IPOReady Dead Links Audit\n');
  console.log(`Checking ${URLS_TO_CHECK.length} URLs...\n`);

  for (const url of URLS_TO_CHECK) {
    const result = await checkUrl(url);
    
    switch (result.status) {
      case 'working':
        RESULTS.working.push(result);
        console.log(`✅ ${url} (${result.code})`);
        break;
      case 'dead':
        RESULTS.dead.push(result);
        console.log(`❌ ${url} (${result.code}) - DEAD LINK`);
        break;
      case 'timeout':
        RESULTS.timeout.push(result);
        console.log(`⏱️  ${url} - TIMEOUT`);
        break;
      case 'error':
        RESULTS.error.push(result);
        console.log(`⚠️  ${url} - ERROR: ${result.error || result.code}`);
        break;
    }
  }

  console.log('\n📊 Audit Summary\n');
  console.log(`✅ Working: ${RESULTS.working.length}`);
  console.log(`❌ Dead: ${RESULTS.dead.length}`);
  console.log(`⏱️  Timeout: ${RESULTS.timeout.length}`);
  console.log(`⚠️  Errors: ${RESULTS.error.length}`);

  if (RESULTS.dead.length > 0) {
    console.log('\n🚨 DEAD LINKS FOUND:');
    RESULTS.dead.forEach(item => {
      console.log(`  - ${item.url} (${item.code})`);
    });
  }

  if (RESULTS.error.length > 0) {
    console.log('\n⚠️  URLs WITH ERRORS:');
    RESULTS.error.forEach(item => {
      console.log(`  - ${item.url}: ${item.error}`);
    });
  }

  // Write results to file
  const reportPath = path.join(__dirname, 'link-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(RESULTS, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  // Exit with error code if dead links found
  process.exit(RESULTS.dead.length > 0 ? 1 : 0);
}

auditLinks().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
