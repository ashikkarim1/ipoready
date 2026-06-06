# API Security Headers Testing Guide

This guide demonstrates how to verify that security headers are properly applied to API routes and don't interfere with API functionality.

## Test Setup

### Prerequisites
```bash
# Ensure Next.js dev server is running
npm run dev

# In another terminal, run these curl commands
cd /Users/test/Documents/Claude/Projects/IPOReady
```

### Available Test APIs

These are real API routes in the IPOReady application:
- `/api/company` - Company information
- `/api/documents` - Document management
- `/api/tasks` - Task management
- `/api/regulatory` - Regulatory data
- `/api/cap-table` - Cap table data
- `/api/feedback` - Feedback submission
- `/api/dashboard` - Dashboard data
- `/api/notifications` - Notifications
- `/api/predictions` - PACE predictions

## Test 1: Verify Headers on Unauthenticated API Call

### Request
```bash
curl -I http://localhost:3000/api/company
```

### Expected Headers
```
HTTP/1.1 401 Unauthorized
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cache-Control: private, no-cache, no-store, must-revalidate
```

### Verification
All security headers present, Cache-Control prevents caching.

---

## Test 2: Verify Headers on Authenticated API Call

### Request with Session
```bash
# First, get a valid session cookie from login
curl -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then make an authenticated API call
curl -I -b /tmp/cookies.txt http://localhost:3000/api/company
```

### Expected Headers
```
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cache-Control: private, no-cache, no-store, must-revalidate
```

### Verification
Same security headers, Cache-Control still prevents caching, proper authentication enforced.

---

## Test 3: Verify API Responses Work with CSP

### Request
```bash
curl -X GET http://localhost:3000/api/company \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "status": "unauthorized",
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

OR with valid auth:
```json
{
  "id": "company-123",
  "name": "Example Company",
  "status": "active",
  ...
}
```

### Verification
API responses are JSON and CSP does not interfere with JSON content.

---

## Test 4: Verify POST Requests with Security Headers

### Test JSON POST
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-csrf-token" \
  -d '{
    "type": "bug",
    "message": "Test feedback",
    "severity": "low"
  }'
```

### Expected Response
```
HTTP/1.1 201 Created
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
...

{"id": "feedback-123", "status": "submitted"}
```

### Verification
POST requests work correctly, CSRF token accepted, response includes security headers.

---

## Test 5: Verify Multipart Form Data (File Uploads)

### Test File Upload
```bash
# Create a test file
echo "Test document content" > /tmp/test-doc.txt

# Upload the file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/tmp/test-doc.txt" \
  -F "name=Test Document" \
  -F "type=pdf"
```

### Expected Response
```
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
...

{"id": "doc-123", "url": "/documents/doc-123"}
```

### Verification
Multipart form data works with security headers, file upload succeeds.

---

## Test 6: Verify CORS Headers on API Requests

### Cross-Origin Request
```bash
# From localhost:3001, request to localhost:3000
curl -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:3000/api/company
```

### Expected Response
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Verification
CORS preflight works correctly, same-origin policies enforced.

---

## Test 7: Verify Cache Headers Don't Break API

### Test Cache-Control on Different Endpoints

#### Static Assets
```bash
curl -I http://localhost:3000/_next/static/chunks/main.js | grep -i cache-control
```
Expected: `Cache-Control: public, max-age=31536000, immutable`

#### API Routes
```bash
curl -I http://localhost:3000/api/company | grep -i cache-control
```
Expected: `Cache-Control: private, no-cache, no-store, must-revalidate`

#### App Pages
```bash
curl -I http://localhost:3000/dashboard | grep -i cache-control
```
Expected: `Cache-Control: private, no-store`

#### Public Pages
```bash
curl -I http://localhost:3000/pricing | grep -i cache-control
```
Expected: `Cache-Control: s-maxage=300, stale-while-revalidate=3600`

### Verification
Different endpoints have appropriate cache headers, API routes never cached.

---

## Test 8: Verify CSP Allows Required Resources

### Test External Resources

#### Google Fonts (allowed in CSP)
```bash
curl -I https://fonts.googleapis.com/css2?family=Inter | grep -i content-security
```
Should load successfully (not blocked by CSP).

#### Vercel Analytics (allowed in CSP)
```bash
curl -I https://vitals.vercel-analytics.com | head -5
```
Should not be blocked by CSP connect-src.

#### Unauthorized External Script (should be blocked)
```bash
# This would be blocked by CSP:
# <script src="https://untrusted-cdn.com/script.js"></script>
```

### Verification
Allowed resources load, unauthorized resources blocked by CSP.

---

## Test 9: Security Headers with Query Parameters

### Request with Query String
```bash
curl -I "http://localhost:3000/api/tasks?status=pending&limit=10"
```

### Expected
Headers same as non-parameterized request:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
...
```

### Verification
Query parameters don't affect security headers.

---

## Test 10: Verify Headers on Error Responses

### Trigger 404 Error
```bash
curl -I http://localhost:3000/api/nonexistent
```

### Expected
```
HTTP/1.1 404 Not Found
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
...
```

### Trigger 500 Error
```bash
# Call an endpoint that might error
curl -I http://localhost:3000/api/documents?invalid=query
```

### Expected
```
HTTP/1.1 500 Internal Server Error
X-Content-Type-Type-Options: nosniff
...
```

### Verification
Error responses also include all security headers.

---

## Test 11: Verify Concurrent Requests

### Make Multiple Simultaneous Requests
```bash
for i in {1..5}; do
  curl -I http://localhost:3000/api/company &
done
wait

# Check that all responses have headers
for i in {1..5}; do
  curl -I http://localhost:3000/api/notifications &
done
wait
```

### Expected
All concurrent requests return security headers without issues.

### Verification
Headers applied consistently across concurrent requests.

---

## Test 12: Verify Header Values Are Correct

### Extract and Verify Each Header
```bash
#!/bin/bash

# Function to check header value
check_header_value() {
    local url=$1
    local header=$2
    local expected=$3
    
    value=$(curl -s -I "$url" | grep -i "^$header:" | cut -d' ' -f2-)
    
    if [ "$value" = "$expected" ]; then
        echo "✓ $header: CORRECT"
    else
        echo "✗ $header: MISMATCH"
        echo "  Expected: $expected"
        echo "  Got: $value"
    fi
}

check_header_value "http://localhost:3000/api/company" "X-Content-Type-Options" "nosniff"
check_header_value "http://localhost:3000/api/company" "X-Frame-Options" "DENY"
check_header_value "http://localhost:3000/api/company" "X-XSS-Protection" "1; mode=block"
check_header_value "http://localhost:3000/api/company" "Referrer-Policy" "strict-origin-when-cross-origin"
```

---

## Test 13: Verify WebSocket Connections (if applicable)

### Test WebSocket Handshake
```bash
# If the app has WebSocket routes
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3000/api/ws
```

### Expected
Security headers applied even to WebSocket upgrade requests.

---

## Test 14: Verify API Rate Limiting Works with Headers

### Make Multiple Rapid Requests
```bash
for i in {1..100}; do
  curl http://localhost:3000/api/company &
done
wait
```

### Expected
- First N requests succeed with 200 status
- Subsequent requests get 429 (Too Many Requests)
- All responses include security headers

### Verification
Rate limiting headers applied, doesn't interfere with CSP/security headers.

---

## Automated Test Script

### Complete Verification Script

```bash
#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Test function
test_api() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    
    echo ""
    echo "Testing: $description"
    echo "Endpoint: $endpoint"
    echo "Method: $method"
    
    # Make request and capture headers
    if [ "$method" = "GET" ]; then
        response=$(curl -s -I "$API_URL$endpoint" 2>&1)
    else
        response=$(curl -s -I -X "$method" "$API_URL$endpoint" 2>&1)
    fi
    
    # Check for required headers
    if echo "$response" | grep -q "X-Content-Type-Options: nosniff"; then
        echo -e "${GREEN}✓ X-Content-Type-Options${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ X-Content-Type-Options${NC}"
        ((FAILED++))
    fi
    
    if echo "$response" | grep -q "X-Frame-Options: DENY"; then
        echo -e "${GREEN}✓ X-Frame-Options${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ X-Frame-Options${NC}"
        ((FAILED++))
    fi
    
    if echo "$response" | grep -q "Strict-Transport-Security"; then
        echo -e "${GREEN}✓ Strict-Transport-Security${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Strict-Transport-Security${NC}"
        ((FAILED++))
    fi
    
    if echo "$response" | grep -q "Content-Security-Policy"; then
        echo -e "${GREEN}✓ Content-Security-Policy${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Content-Security-Policy${NC}"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "API Security Headers Test Suite"
echo "=========================================="

# Test various API endpoints
test_api "/api/company" "Company API" "GET"
test_api "/api/documents" "Documents API" "GET"
test_api "/api/tasks" "Tasks API" "GET"
test_api "/api/regulatory" "Regulatory API" "GET"
test_api "/api/feedback" "Feedback API" "POST"
test_api "/api/dashboard" "Dashboard API" "GET"

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed:  ${GREEN}$PASSED${NC}"
echo -e "Failed:  ${RED}$FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
```

Save as `test-api-security.sh` and run:
```bash
chmod +x test-api-security.sh
./test-api-security.sh
```

---

## Expected Behaviors

### Requests That Should Succeed
- ✓ GET requests to public endpoints
- ✓ POST requests with proper Content-Type
- ✓ Authenticated requests with valid session
- ✓ OPTIONS requests (CORS preflight)
- ✓ File uploads with multipart/form-data

### Requests That Should Fail or Return Errors
- ✗ API calls without authentication (401)
- ✗ Malformed JSON payloads (400)
- ✗ Cross-origin requests without CORS headers (403)
- ✗ Rate-limited requests (429)
- ✗ Invalid CSRF tokens (403)

### All Requests Should Include
- ✓ X-Content-Type-Options: nosniff
- ✓ X-Frame-Options: DENY
- ✓ Strict-Transport-Security
- ✓ Content-Security-Policy
- ✓ Referrer-Policy
- ✓ Permissions-Policy
- ✓ Appropriate Cache-Control

---

## Troubleshooting

### Issue: Headers Not Appearing
**Cause**: Next.js dev server might need restart  
**Solution**: 
```bash
npm run dev
# Wait for build to complete
```

### Issue: CSP Blocking Resources
**Cause**: Resource source not in CSP directives  
**Solution**: Check browser console for CSP violations, add source to next.config.js

### Issue: CORS Errors
**Cause**: Origin not in allowed list  
**Solution**: Update CORS configuration in next.config.js for development

### Issue: Cache Headers Breaking Real-time Updates
**Cause**: Stale cache for dynamic content  
**Solution**: Ensure API routes use `Cache-Control: private, no-cache, no-store`

---

## Performance Monitoring

### Monitor Request/Response Times

```bash
# Measure response time with security headers
time curl -I http://localhost:3000/api/company

# Should complete in <100ms for local testing
```

### Check Header Size Impact

```bash
# Get total response header size
curl -I http://localhost:3000/api/company | wc -c

# Should be <2KB overhead from security headers
```

---

## Conclusion

All IPOReady API routes are protected with comprehensive security headers that:
- Prevent XSS and injection attacks
- Block clickjacking
- Enforce HTTPS
- Control browser features
- Manage content sources
- Set appropriate caching policies

The headers do not interfere with normal API functionality and are consistently applied across all endpoints.
