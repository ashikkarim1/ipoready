# Filing System Testing Guide

Comprehensive guide for testing the IPOReady filing system locally, in sandbox environments, and in production.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Local Test Suite](#local-test-suite)
3. [Sandbox API Testing](#sandbox-api-testing)
4. [Webhook Testing with ngrok](#webhook-testing-with-ngrok)
5. [Pre-Deployment Smoke Tests](#pre-deployment-smoke-tests)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+ with npm
- Docker (optional, for running database locally)
- ngrok account (optional, for webhook testing)
- SEDAR 2 and SEC EDGAR sandbox credentials

### 1. Run Local Tests

```bash
# Run all tests
npm test

# Run only filing adapter tests
npm run test:filing

# Run filing tests in watch mode
npm run test:filing:watch

# Generate coverage report
npm run test:filing:coverage

# Full validation (syntax + tests)
npm run test:filing:check
```

### 2. Start Development Server

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### 3. Test API Endpoints

The filing system exposes these endpoints:

- **POST /api/filing/test-submit** - Test submission endpoint
- **GET /api/filings/status** - Get filing status
- **POST /api/filings/status** - Alternative status query
- **POST /api/filings/webhook** - Webhook handler
- **POST /api/filings/submit** - Real submission endpoint

---

## Local Test Suite

### Test Files

All filing adapter tests are located in:

```
src/__tests__/filing-adapters.test.ts
src/lib/filing-adapters/*.test.ts
```

### Test Coverage

The test suite covers:

1. **Happy Path Tests**
   - Document validation
   - Filing submission
   - Status tracking
   - Webhook handling

2. **Error Scenario Tests**
   - Invalid documents
   - Network errors
   - Retry logic
   - Timeout handling

3. **Webhook Tests**
   - Signature verification
   - Replay attack prevention
   - Status update processing

4. **Field Mapping Tests**
   - Data transformation
   - Currency conversion
   - Metadata handling

### Running Specific Tests

```bash
# Test SEDAR adapter only
npm test -- SEDARAdapter

# Test SEC EDGAR adapter only
npm test -- SECEdgarAdapter

# Test webhook functionality
npm test -- webhook

# Test with specific pattern
npm test -- -t "happy path"

# Run with verbose output
npm test -- --verbose
```

### Coverage Report

```bash
npm run test:filing:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

---

## Sandbox API Testing

### Setting Up Sandbox Credentials

#### SEDAR 2 Sandbox

1. Register for SEDAR 2 sandbox account at: https://www.sedarplus.ca/
2. Get your API credentials from the sandbox dashboard
3. Add to `.env.local`:

```bash
SEDAR_SANDBOX_ENABLED=true
SEDAR_API_KEY=your-sandbox-api-key
SEDAR_API_SECRET=your-sandbox-api-secret
SEDAR_SANDBOX_URL=https://sedarplus-sandbox.ca/api/v1
SEDAR_OAUTH_ENABLED=true
```

#### SEC EDGAR Sandbox

1. Register for SEC EDGAR sandbox at: https://www.sec.gov/cgi-bin/browse-edgar
2. Get your CIK (Central Index Key) and credentials
3. Add to `.env.local`:

```bash
SEC_SANDBOX_ENABLED=true
SEC_CIK=0000000001
SEC_API_KEY=your-sandbox-api-key
SEC_API_SECRET=your-sandbox-api-secret
SEC_SANDBOX_URL=https://www.sec.gov/cgi-bin/browse-edgar
```

### Testing Against Sandbox

#### 1. Test Document Submission

```bash
# Create a test request file
cat > test-submission.json << 'EOF'
{
  "companyName": "Test Company Inc",
  "filingType": "prospectus",
  "currencyCode": "USD",
  "country": "USA",
  "documents": [
    {
      "type": "prospectus",
      "format": "pdf",
      "fileName": "prospectus.pdf",
      "mimeType": "application/pdf"
    }
  ]
}
EOF

# Submit to sandbox
curl -X POST http://localhost:3000/api/filings/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d @test-submission.json
```

#### 2. Check Filing Status

```bash
# Query filing status
curl -X GET "http://localhost:3000/api/filings/status?filingId=SEDAR-2024-001234&system=sedar" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Alternative: POST method
curl -X POST http://localhost:3000/api/filings/status \
  -H "Content-Type: application/json" \
  -d '{
    "filingId": "SEDAR-2024-001234",
    "system": "sedar"
  }'
```

#### 3. Test Error Handling

```bash
# Test with invalid document
curl -X POST http://localhost:3000/api/filing/test-submit \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "countryCode": "US",
    "includeErrors": true
  }'

# Response should be:
# {
#   "success": false,
#   "error": "Validation failed",
#   "details": [{"field": "prospectus", "message": "Missing signature"}],
#   "status": "rejected"
# }
```

### Environment Configuration

Create `.env.local` with appropriate values:

```bash
# Filing System Configuration
FILING_SYSTEM_ENABLED=true
FILING_SANDBOX_MODE=true
FILING_WEBHOOK_SECRET=your-webhook-secret-key

# SEDAR Configuration
SEDAR_ENABLED=true
SEDAR_SANDBOX_MODE=true
SEDAR_API_KEY=your-api-key
SEDAR_API_SECRET=your-api-secret
SEDAR_OAUTH_TOKEN_URL=https://auth-sandbox.sedarplus.ca/oauth/token

# SEC Configuration
SEC_ENABLED=true
SEC_SANDBOX_MODE=true
SEC_CIK=0000000001
SEC_API_KEY=your-api-key

# Webhook Configuration
WEBHOOK_URL=http://localhost:3000/api/filings/webhook
WEBHOOK_EVENTS=filing.submitted,filing.status_updated
```

---

## Webhook Testing with ngrok

### What is ngrok?

ngrok exposes your local server to the internet with a public URL. This allows testing webhooks from external services (SEDAR, SEC EDGAR) to your local development environment.

### Installation

```bash
# Install ngrok
# macOS
brew install ngrok

# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip
unzip ngrok-v3-stable-linux-amd64.zip

# Or download from: https://ngrok.com/download
```

### Setup

1. Create ngrok account: https://dashboard.ngrok.com/signup
2. Get your auth token from dashboard
3. Install auth token:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Running Local Webhook Tests

#### 1. Start ngrok Tunnel

```bash
# In one terminal, start ngrok
ngrok http 3000

# You should see output like:
# Session Status                online
# Account                       your-email@example.com
# Version                       3.0.0
# Region                        us (US,CA,MX)
# Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
# Web Interface                 http://127.0.0.1:4040
```

#### 2. Update Environment Variables

```bash
# In .env.local
WEBHOOK_URL=https://abc123.ngrok.io/api/filings/webhook
FILING_SANDBOX_WEBHOOK_URL=https://abc123.ngrok.io/api/filings/webhook
```

#### 3. Verify Webhook Connectivity

```bash
# Test webhook endpoint via ngrok
curl -X OPTIONS https://abc123.ngrok.io/api/filings/webhook \
  -H "Content-Type: application/json"

# Should return 200 or 405 (method not allowed = endpoint exists)
```

#### 4. Send Test Webhook

```bash
# Send test webhook from SEDAR sandbox
# 1. Log into SEDAR 2 sandbox
# 2. Navigate to Webhook Configuration
# 3. Set webhook URL to your ngrok URL
# 4. Send test event

# Or test manually:
curl -X POST https://abc123.ngrok.io/api/filings/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $(echo -n '{your-payload}' | openssl dgst -sha256 -hmac 'your-webhook-secret' | cut -d' ' -f2)" \
  -d '{
    "filingId": "test-filing-001",
    "trackingNumber": "TR-TEST-001",
    "status": "approved",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

#### 5. Monitor Webhooks

```bash
# Open ngrok web interface in browser
open http://127.0.0.1:4040

# You'll see:
# - All HTTP requests to your tunnel
# - Request/response headers and body
# - Ability to replay requests
```

### Webhook Signature Verification

All webhooks must include a valid signature in the `X-Signature` header.

#### Generate Signature

```bash
# Create payload
PAYLOAD='{
  "filingId": "test-123",
  "status": "approved",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'

# Generate HMAC-SHA256 signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$FILING_WEBHOOK_SECRET" | cut -d' ' -f2)

# Send webhook with signature
curl -X POST http://localhost:3000/api/filings/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -H "X-Filing-System: sedar" \
  -d "$PAYLOAD"
```

#### Signature Validation Logic

The webhook handler verifies:

1. **Signature presence**: `X-Signature` header must exist
2. **HMAC verification**: Signature must match computed HMAC-SHA256
3. **Timestamp validation**: Request timestamp must be within acceptable window (default: 5 minutes)
4. **Replay attack prevention**: Webhook ID must not be previously processed

---

## Pre-Deployment Smoke Tests

### Automated Smoke Tests

Before deploying to production, run the automated smoke test suite:

```bash
# Run against local development server
./scripts/test-filing-endpoints.sh http://localhost:3000

# Run against staging environment
./scripts/test-filing-endpoints.sh https://staging.ipoready.com

# Run against production (careful!)
./scripts/test-filing-endpoints.sh https://app.ipoready.com
```

### Smoke Test Coverage

The smoke tests verify:

1. ✓ Server health check
2. ✓ POST /api/filing/test-submit endpoint
3. ✓ GET /api/filings/status endpoint
4. ✓ POST /api/filings/status endpoint
5. ✓ POST /api/filings/webhook accessibility
6. ✓ Webhook signature validation
7. ✓ Filing adapter TypeScript syntax
8. ✓ All tests pass

### Example Output

```
================================================================================
IPOReady Filing System - Pre-Deployment Smoke Tests
================================================================================
Base URL: http://localhost:3000
Timeout:  30s
Start:    Wed Jun 04 15:30:00 UTC 2026
================================================================================

[INFO] Checking server health at http://localhost:3000...
[PASS] Server is accessible

[INFO] Testing POST /api/filing/test-submit...
[PASS] POST /api/filing/test-submit returned valid structure (HTTP 200)

[INFO] Testing GET /api/filings/status...
[PASS] GET /api/filings/status returned valid structure (HTTP 200)

[INFO] Testing POST /api/filings/status (alternative)...
[PASS] POST /api/filings/status endpoint is accessible (HTTP 200)

[INFO] Testing POST /api/filings/webhook accessibility...
[PASS] POST /api/filings/webhook endpoint is accessible (HTTP 405)

[INFO] Testing webhook signature validation...
[PASS] Webhook signature validation is functional (HTTP 202)

[INFO] Validating filing adapter syntax...
[PASS] Filing adapters have valid TypeScript syntax

================================================================================
Test Results Summary
================================================================================
  Passed: 6
  Failed: 0
  Total:  6
  End:    Wed Jun 04 15:30:45 UTC 2026
================================================================================

[PASS] All smoke tests passed!
```

### CI/CD Integration

Add to your CI/CD pipeline (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/filing-tests.yml
name: Filing System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      # Run filing tests
      - run: npm run test:filing
      
      # Build and start server
      - run: npm run build
      
      # Run smoke tests
      - run: |
          npm start &
          sleep 5
          ./scripts/test-filing-endpoints.sh http://localhost:3000
```

---

## Troubleshooting

### Common Issues

#### 1. "Server is not responding (HTTP 000)"

**Problem**: Smoke tests can't connect to the server.

**Solutions**:
```bash
# Make sure server is running
npm run dev

# Check if port 3000 is in use
lsof -i :3000

# Try different port
PORT=3001 npm run dev

# Then run tests with correct URL
./scripts/test-filing-endpoints.sh http://localhost:3001
```

#### 2. "Filing adapters have TypeScript errors"

**Problem**: TypeScript compilation fails.

**Solutions**:
```bash
# Check specific errors
npx tsc --noEmit src/lib/filing-adapters/*.ts

# Fix type errors
npm run lint -- --fix

# Rebuild TypeScript
npm run build
```

#### 3. "Webhook signature validation failed"

**Problem**: Webhook signature doesn't match.

**Solutions**:
```bash
# Verify webhook secret is set
echo $FILING_WEBHOOK_SECRET

# Make sure signature generation uses exact payload
# No extra whitespace or formatting

# Check ngrok logs for payload
open http://127.0.0.1:4040

# Regenerate signature with correct secret
SIGNATURE=$(echo -n "$PAYLOAD" | \
  openssl dgst -sha256 -hmac "$FILING_WEBHOOK_SECRET" | \
  cut -d' ' -f2)
```

#### 4. "Test filing not found"

**Problem**: Status endpoint returns 404 for test filing.

**Solutions**:
```bash
# Verify test endpoint is working
curl -X POST http://localhost:3000/api/filing/test-submit \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test Corp", "countryCode": "US"}'

# Check database connection
npm run db:migrate

# Verify filing service is initialized
# Check server logs for errors
```

#### 5. "ngrok tunnel is timing out"

**Problem**: Webhooks from SEDAR/SEC are timing out.

**Solutions**:
```bash
# Check ngrok tunnel is active
ngrok http 3000

# Verify webhook URL in sandbox config
# https://abc123.ngrok.io/api/filings/webhook

# Test connectivity from external source
curl -v https://abc123.ngrok.io/api/health

# Check server is responsive
curl http://localhost:3000/api/health

# Restart ngrok tunnel
pkill ngrok
ngrok http 3000
```

#### 6. "Tests pass locally but fail in CI/CD"

**Problem**: Tests work in development but fail in pipeline.

**Solutions**:
```bash
# Verify all environment variables are set
grep -r "process.env" src/lib/filing-adapters/

# Check Node.js version
node --version

# Ensure database is initialized in CI
npm run db:migrate

# Check for timing issues
npm run test:filing -- --timeout=10000

# Review CI logs for actual errors
```

### Debug Mode

Enable detailed logging:

```bash
# Enable all filing logs
DEBUG=filing:* npm run dev

# Enable specific adapter logs
DEBUG=filing:sedar npm run dev

# Enable webhook logs
DEBUG=filing:webhook npm run dev

# View logs during tests
DEBUG=filing:* npm run test:filing
```

### Performance Testing

```bash
# Test under load
# Install artillery
npm install -g artillery

# Create load test
cat > filing-load-test.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'Filing Submission Load Test'
    flow:
      - post:
          url: '/api/filing/test-submit'
          json:
            companyName: 'Load Test Corp'
            countryCode: 'US'
EOF

# Run load test
artillery run filing-load-test.yml
```

### Getting Help

If you encounter issues:

1. **Check logs**: `npm run dev` and look for errors
2. **Review tests**: `npm run test:filing -- --verbose`
3. **Run smoke tests**: `./scripts/test-filing-endpoints.sh`
4. **Check environment**: Verify `.env.local` has all required variables
5. **Inspect ngrok**: Open `http://127.0.0.1:4040` to see webhook requests
6. **Read docs**: Check adapter implementation docs in `src/lib/filing-adapters/`

---

## Additional Resources

- [SEDAR 2 Documentation](https://www.sedarplus.ca/developers)
- [SEC EDGAR Documentation](https://www.sec.gov/cgi-bin/browse-edgar)
- [ngrok Documentation](https://ngrok.com/docs)
- [Filing System Architecture](./filing-systems/SEDAR_EDGAR_INTEGRATION_SETUP.md)
- [Adapter Implementation Guide](../src/lib/filing-adapters/QUICK_START.md)

---

**Last Updated**: June 4, 2026  
**Maintained By**: IPOReady Engineering Team
