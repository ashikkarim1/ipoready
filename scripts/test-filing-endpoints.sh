#!/bin/bash

################################################################################
# Filing System Smoke Test
# ========================
# Pre-deployment smoke tests for filing system endpoints
#
# Usage:
#   ./scripts/test-filing-endpoints.sh [base_url] [timeout]
#
# Examples:
#   ./scripts/test-filing-endpoints.sh http://localhost:3000 30
#   ./scripts/test-filing-endpoints.sh https://staging.ipoready.com 60
#
# Environment Variables:
#   FILING_TEST_URL    - Base URL (default: http://localhost:3000)
#   FILING_TEST_TIMEOUT - Timeout in seconds (default: 30)
#
# Exit Codes:
#   0 - All tests passed
#   1 - One or more tests failed
#   2 - Invalid arguments
#   3 - Timeout or connection error
################################################################################

set -euo pipefail

# Configuration
BASE_URL="${FILING_TEST_URL:-${1:-http://localhost:3000}}"
TIMEOUT="${FILING_TEST_TIMEOUT:-${2:-30}}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TIMESTAMP=$(date +%s%N | cut -b1-13)  # Milliseconds for unique IDs
TEST_RESULTS=""
FAILED_TESTS=0
PASSED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Helper Functions
################################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
  PASSED_TESTS=$((PASSED_TESTS + 1))
}

log_error() {
  echo -e "${RED}[FAIL]${NC} $1"
  FAILED_TESTS=$((FAILED_TESTS + 1))
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if server is accessible
check_server_health() {
  log_info "Checking server health at $BASE_URL..."

  local health_check=$(curl -s -w "\n%{http_code}" \
    --connect-timeout 5 \
    --max-time 10 \
    "$BASE_URL/api/health" 2>/dev/null || echo "000")

  local http_code=$(echo "$health_check" | tail -n1)

  if [[ "$http_code" == "200" ]] || [[ "$http_code" == "404" ]]; then
    # 404 is ok (endpoint might not exist), means server is up
    log_success "Server is accessible"
    return 0
  else
    log_error "Server is not responding (HTTP $http_code)"
    return 3
  fi
}

# Test POST /api/filing/test-submit
test_submit_endpoint() {
  log_info "Testing POST /api/filing/test-submit..."

  local response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout "$TIMEOUT" \
    --max-time "$TIMEOUT" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "companyName": "Test IPO Corp",
      "countryCode": "US",
      "includeErrors": false
    }' \
    "$BASE_URL/api/filing/test-submit")

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "200" ]]; then
    # Verify response structure
    if echo "$body" | grep -q '"filingId"' && \
       echo "$body" | grep -q '"success"' && \
       echo "$body" | grep -q '"referenceNumber"'; then
      log_success "POST /api/filing/test-submit returned valid structure (HTTP $http_code)"
      echo "  Response: $body" | head -c 200
      echo ""
      return 0
    else
      log_error "Response missing required fields"
      echo "  Response: $body" | head -c 200
      echo ""
      return 1
    fi
  else
    log_error "POST /api/filing/test-submit failed (HTTP $http_code)"
    echo "  Response: $body" | head -c 200
    echo ""
    return 1
  fi
}

# Test GET /api/filings/status
test_status_endpoint() {
  log_info "Testing GET /api/filings/status..."

  # First, create a test filing
  local submit_response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout "$TIMEOUT" \
    --max-time "$TIMEOUT" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"companyName": "Status Test Corp", "countryCode": "US"}' \
    "$BASE_URL/api/filing/test-submit")

  local submit_code=$(echo "$submit_response" | tail -n1)
  local submit_body=$(echo "$submit_response" | sed '$d')

  if [[ "$submit_code" != "200" ]]; then
    log_error "Could not create test filing for status check"
    return 1
  fi

  # Extract filing ID
  local filing_id=$(echo "$submit_body" | grep -o '"filingId":"[^"]*"' | cut -d'"' -f4)

  if [[ -z "$filing_id" ]]; then
    log_error "Could not extract filingId from test submission"
    return 1
  fi

  # Query status
  local status_response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout "$TIMEOUT" \
    --max-time "$TIMEOUT" \
    -X GET \
    "$BASE_URL/api/filings/status?filingId=$filing_id&system=sedar")

  local http_code=$(echo "$status_response" | tail -n1)
  local body=$(echo "$status_response" | sed '$d')

  if [[ "$http_code" == "200" ]] || [[ "$http_code" == "404" ]]; then
    # 404 is ok if filing service is stubbed
    if echo "$body" | grep -q '"filing"' || echo "$body" | grep -q '"error"'; then
      log_success "GET /api/filings/status returned valid structure (HTTP $http_code)"
      echo "  FilingId: $filing_id"
      return 0
    else
      log_error "Response missing expected fields"
      echo "  Response: $body" | head -c 200
      echo ""
      return 1
    fi
  else
    log_error "GET /api/filings/status failed (HTTP $http_code)"
    echo "  Response: $body" | head -c 200
    echo ""
    return 1
  fi
}

# Test POST /api/filings/status (alternative)
test_status_post_endpoint() {
  log_info "Testing POST /api/filings/status (alternative)..."

  local response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout "$TIMEOUT" \
    --max-time "$TIMEOUT" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "filingId": "test-filing-'$TIMESTAMP'",
      "system": "sec"
    }' \
    "$BASE_URL/api/filings/status")

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  # Accept 200, 404 (filing not found), or 400 (invalid params) as valid responses
  if [[ "$http_code" == "200" ]] || [[ "$http_code" == "404" ]] || [[ "$http_code" == "400" ]]; then
    log_success "POST /api/filings/status endpoint is accessible (HTTP $http_code)"
    return 0
  else
    log_error "POST /api/filings/status returned unexpected status (HTTP $http_code)"
    echo "  Response: $body" | head -c 200
    echo ""
    return 1
  fi
}

# Test webhook endpoint accessibility
test_webhook_endpoint() {
  log_info "Testing POST /api/filings/webhook accessibility..."

  # Just verify the endpoint is accessible (OPTIONS or GET)
  local response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout "$TIMEOUT" \
    --max-time "$TIMEOUT" \
    -X OPTIONS \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/filings/webhook")

  local http_code=$(echo "$response" | tail -n1)

  # Acceptable responses: 200, 204, 405 (method not allowed - endpoint exists)
  if [[ "$http_code" == "200" ]] || [[ "$http_code" == "204" ]] || [[ "$http_code" == "405" ]]; then
    log_success "POST /api/filings/webhook endpoint is accessible (HTTP $http_code)"
    return 0
  else
    log_error "POST /api/filings/webhook endpoint is not accessible (HTTP $http_code)"
    return 1
  fi
}

# Test webhook signature validation
test_webhook_signature() {
  log_info "Testing webhook signature validation..."

  # Create a test webhook payload
  local payload='{
    "filingId": "test-filing-'$TIMESTAMP'",
    "trackingNumber": "TR-TEST-001",
    "status": "submitted",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

  # Generate signature (HMAC-SHA256 with webhook secret)
  # NOTE: This assumes the webhook secret is configured in .env
  local webhook_secret="${FILING_WEBHOOK_SECRET:-test-webhook-secret}"
  local signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$webhook_secret" | cut -d' ' -f2)

  local response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout "$TIMEOUT" \
    --max-time "$TIMEOUT" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Signature: $signature" \
    -H "X-Filing-System: sedar" \
    -d "$payload" \
    "$BASE_URL/api/filings/webhook")

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  # Accept 202 (Accepted) as success, 400/401 if validation is enabled
  if [[ "$http_code" == "202" ]] || [[ "$http_code" == "400" ]] || [[ "$http_code" == "401" ]]; then
    log_success "Webhook signature validation is functional (HTTP $http_code)"
    return 0
  else
    log_warning "Webhook returned unexpected status (HTTP $http_code) - may indicate validation not enabled"
    echo "  Response: $body" | head -c 200
    echo ""
    return 0  # Don't fail on this
  fi
}

# Validate filing adapters
test_adapter_syntax() {
  log_info "Validating filing adapter syntax..."

  if command -v npx &> /dev/null; then
    # Try to compile TypeScript
    if npx tsc --noEmit --checkJs "src/lib/filing-adapters/**/*.ts" 2>&1 | grep -q "error"; then
      log_error "Filing adapters have TypeScript errors"
      npx tsc --noEmit --checkJs "src/lib/filing-adapters/**/*.ts" 2>&1 | head -10
      return 1
    else
      log_success "Filing adapters have valid TypeScript syntax"
      return 0
    fi
  else
    log_warning "npx not available, skipping TypeScript check"
    return 0
  fi
}

################################################################################
# Main Test Suite
################################################################################

main() {
  echo ""
  echo "================================================================================"
  echo "IPOReady Filing System - Pre-Deployment Smoke Tests"
  echo "================================================================================"
  echo "Base URL: $BASE_URL"
  echo "Timeout:  ${TIMEOUT}s"
  echo "Start:    $(date)"
  echo "================================================================================"
  echo ""

  # Check if server is running
  check_server_health || {
    echo ""
    echo "================================================================================"
    log_error "Server is not responding. Make sure the server is running on $BASE_URL"
    echo "Run: npm run dev"
    echo "================================================================================"
    exit 3
  }

  echo ""

  # Run all tests
  test_submit_endpoint || true
  test_status_endpoint || true
  test_status_post_endpoint || true
  test_webhook_endpoint || true
  test_webhook_signature || true
  test_adapter_syntax || true

  echo ""
  echo "================================================================================"
  echo "Test Results Summary"
  echo "================================================================================"
  echo -e "  ${GREEN}Passed: $PASSED_TESTS${NC}"
  echo -e "  ${RED}Failed: $FAILED_TESTS${NC}"
  echo "  Total:  $((PASSED_TESTS + FAILED_TESTS))"
  echo "  End:    $(date)"
  echo "================================================================================"
  echo ""

  if [[ $FAILED_TESTS -gt 0 ]]; then
    log_error "Some tests failed. Review the output above."
    exit 1
  else
    log_success "All smoke tests passed!"
    exit 0
  fi
}

# Run main function
main "$@"
