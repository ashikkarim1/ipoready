#!/bin/bash

# Test Security Headers Middleware
# This script verifies that all security headers are correctly set on responses

echo "=========================================="
echo "Security Headers Testing Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Helper function to check header
check_header() {
    local url=$1
    local header_name=$2
    local expected_value=$3
    local optional=$4
    
    echo -n "Checking [$header_name] on $url... "
    
    # Extract the header value
    local header_value=$(curl -s -I "$url" | grep -i "^$header_name:" | cut -d' ' -f2- | tr -d '\r')
    
    if [ -z "$header_value" ]; then
        if [ "$optional" = "true" ]; then
            echo -e "${YELLOW}SKIPPED (optional)${NC}"
            ((WARNINGS++))
        else
            echo -e "${RED}MISSING${NC}"
            echo "  Expected: $expected_value"
            ((FAILED++))
        fi
    else
        if [ -z "$expected_value" ] || [ "$header_value" = "$expected_value" ]; then
            echo -e "${GREEN}OK${NC}"
            echo "  Value: $header_value"
            ((PASSED++))
        else
            echo -e "${RED}MISMATCH${NC}"
            echo "  Expected: $expected_value"
            echo "  Got:      $header_value"
            ((FAILED++))
        fi
    fi
}

# Helper function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo ""
    echo "================================"
    echo "Testing: $description"
    echo "Endpoint: $endpoint"
    echo "================================"
    
    check_header "$endpoint" "X-Content-Type-Options" "nosniff"
    check_header "$endpoint" "X-Frame-Options" "DENY"
    check_header "$endpoint" "X-XSS-Protection" "1; mode=block"
    check_header "$endpoint" "Strict-Transport-Security" "max-age=31536000; includeSubDomains; preload"
    check_header "$endpoint" "Content-Security-Policy" "" # Just check if present
    check_header "$endpoint" "Referrer-Policy" "strict-origin-when-cross-origin"
    check_header "$endpoint" "Permissions-Policy" "geolocation=(), microphone=(), camera=()"
    check_header "$endpoint" "Cache-Control" ""
}

# Test configuration
BASE_URL="http://localhost:3000"

# First, check if server is running
echo "Checking if server is running at $BASE_URL..."
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Server is not running at $BASE_URL${NC}"
    echo "Start the Next.js dev server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}Server is running${NC}"
echo ""

# Test various endpoints
test_endpoint "$BASE_URL/" "Homepage (Public Page)"
test_endpoint "$BASE_URL/api/company" "API Route (requires auth, will 401)"
test_endpoint "$BASE_URL/pricing" "Public Page"

# Additional security checks
echo ""
echo "================================"
echo "Additional Security Checks"
echo "================================"

# Check for dangerous headers that should NOT be present
echo -n "Checking Server header is hidden... "
SERVER_HEADER=$(curl -s -I "$BASE_URL" | grep -i "^server:" | cut -d' ' -f2-)
if [ -z "$SERVER_HEADER" ]; then
    echo -e "${GREEN}OK (Server header not exposed)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING (Server header present: $SERVER_HEADER)${NC}"
    ((WARNINGS++))
fi

# Check HTTPS enforcement (would need production URL)
echo -n "Checking HSTS header... "
HSTS=$(curl -s -I "$BASE_URL" | grep -i "^strict-transport-security:" | cut -d' ' -f2-)
if [ -n "$HSTS" ]; then
    echo -e "${GREEN}OK${NC}"
    echo "  Value: $HSTS"
    ((PASSED++))
else
    echo -e "${RED}MISSING${NC}"
    ((FAILED++))
fi

# Print summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed:  ${GREEN}$PASSED${NC}"
echo -e "Failed:  ${RED}$FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All security headers configured correctly!${NC}"
    exit 0
else
    echo -e "${RED}Some security headers are missing or misconfigured.${NC}"
    exit 1
fi
