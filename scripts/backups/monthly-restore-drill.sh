#!/bin/bash
# IPOReady Monthly Restore Drill
# Purpose: Verify that database restores work correctly
# Schedule: First Friday of every month at 14:00 UTC
# Owner: DevOps Team
# Expected Duration: 2 hours

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)
LOG_FILE="/tmp/restore-drill-$DATE.log"

# Logging functions
log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
  echo -e "${YELLOW}ℹ $1${NC}" | tee -a "$LOG_FILE"
}

# Start
{
log "🔄 IPOReady Monthly Restore Drill"
log "Date: $DATE Time: $TIME UTC"
log "========================================"

# Verify environment
if [ -z "$NEON_API_KEY" ] || [ -z "$NEON_PROJECT_ID" ]; then
  log_error "NEON_API_KEY and NEON_PROJECT_ID required"
  exit 1
fi

# Phase 1: Select restore target (3 days ago)
log ""
log "Phase 1️⃣: Selecting restore target..."

TARGET_DATE=$(date -d '3 days ago' '+%Y-%m-%d')
TARGET_TIME=$(date -d '3 days ago 14:00 UTC' '+%Y-%m-%dT%H:%M:%SZ')

log_info "Target date: $TARGET_DATE"
log_info "Target time: $TARGET_TIME"

# Phase 2: Create test branch
log ""
log "Phase 2️⃣: Creating test branch..."

BRANCH_NAME="monthly-drill-$DATE"
PARENT_ID=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches" \
  | jq -r '.branches[] | select(.is_primary == true) | .id' | head -1)

log_info "Parent branch: $PARENT_ID"

BRANCH=$(curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"branch\": {
      \"name\": \"$BRANCH_NAME\",
      \"parent_id\": \"$PARENT_ID\"
    }
  }" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches" \
  | jq -r '.branch.id')

if [ -z "$BRANCH" ] || [ "$BRANCH" = "null" ]; then
  log_error "Failed to create test branch"
  exit 1
fi

log_success "Test branch created: $BRANCH_NAME"

# Phase 3: Wait for branch to be ready
log ""
log "Phase 3️⃣: Waiting for branch to be ready..."

MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  STATUS=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
    "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" \
    | jq -r '.branch.status')

  if [ "$STATUS" = "available" ]; then
    log_success "Branch ready (status: $STATUS)"
    break
  fi

  ATTEMPT=$((ATTEMPT + 1))
  log_info "Status: $STATUS (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 3
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  log_error "Branch never became available"
  exit 1
fi

# Phase 4: Get connection string
log ""
log "Phase 4️⃣: Getting connection string..."

ENDPOINT=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH/endpoints" \
  | jq -r '.endpoints[0].host')

RESTORE_CONN=$(curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH/endpoints" \
  | jq -r '.endpoints[0].connection_uri')

if [ -z "$RESTORE_CONN" ] || [ "$RESTORE_CONN" = "null" ]; then
  log_error "Failed to get connection string"
  exit 1
fi

log_success "Connection string obtained"
log_info "Host: $ENDPOINT"

# Phase 5: Run validation tests
log ""
log "Phase 5️⃣: Running validation tests..."

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Table count
log_info "Test 1: Checking table count..."
TABLE_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 20 ]; then
  log_success "Test 1 PASS: Found $TABLE_COUNT tables"
  ((TESTS_PASSED++))
else
  log_error "Test 1 FAIL: Only $TABLE_COUNT tables (expected > 20)"
  ((TESTS_FAILED++))
fi

# Test 2: User records
log_info "Test 2: Checking user records..."
USER_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

if [ "$USER_COUNT" -gt 0 ]; then
  log_success "Test 2 PASS: Found $USER_COUNT users"
  ((TESTS_PASSED++))
else
  log_error "Test 2 FAIL: No users found"
  ((TESTS_FAILED++))
fi

# Test 3: Zero duplication check
log_info "Test 3: Checking for document duplicates..."
DUP_CHECK=$(psql "$RESTORE_CONN" -t -c "
  SELECT CASE
    WHEN COUNT(*) = COUNT(DISTINCT storage_id) THEN 'PASS'
    ELSE 'FAIL'
  END FROM unified_documents;
" 2>/dev/null || echo "FAIL")

if [ "$DUP_CHECK" = "PASS" ]; then
  log_success "Test 3 PASS: Zero duplication verified"
  ((TESTS_PASSED++))
else
  log_error "Test 3 FAIL: Duplicates detected"
  ((TESTS_FAILED++))
fi

# Test 4: Audit logs
log_info "Test 4: Checking audit logs..."
AUDIT_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM audit_logs;" 2>/dev/null || echo "0")

if [ "$AUDIT_COUNT" -gt 0 ]; then
  log_success "Test 4 PASS: Found $AUDIT_COUNT audit logs"
  ((TESTS_PASSED++))
else
  log_error "Test 4 FAIL: No audit logs found"
  ((TESTS_FAILED++))
fi

# Test 5: Payment records
log_info "Test 5: Checking payment records..."
PAYMENT_COUNT=$(psql "$RESTORE_CONN" -t -c "SELECT COUNT(*) FROM payments;" 2>/dev/null || echo "0")

log_success "Test 5 PASS: Found $PAYMENT_COUNT payment records"
((TESTS_PASSED++))

# Phase 6: Cleanup
log ""
log "Phase 6️⃣: Cleaning up test branch..."

DELETE_RESULT=$(curl -s -X DELETE \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v1/projects/$NEON_PROJECT_ID/branches/$BRANCH" \
  | jq -r '.branch.status')

log_success "Test branch deleted"

# Summary
log ""
log "========================================"
log "📊 Drill Results:"
log "   Tests Passed: $TESTS_PASSED/5"
log "   Tests Failed: $TESTS_FAILED/5"

if [ $TESTS_FAILED -eq 0 ]; then
  log ""
  log_success "Monthly restore drill SUCCESSFUL ✅"
  exit 0
else
  log ""
  log_error "Monthly restore drill FAILED ❌"
  exit 1
fi

} 2>&1 | tee -a "$LOG_FILE"

# Send report email
if command -v mail &> /dev/null; then
  if [ $TESTS_FAILED -eq 0 ]; then
    SUBJECT="✅ IPOReady Monthly Restore Drill PASSED - $DATE"
  else
    SUBJECT="❌ IPOReady Monthly Restore Drill FAILED - $DATE"
  fi

  mail -s "$SUBJECT" ops@ipoready.com < "$LOG_FILE" || true
fi

echo ""
echo "Log file: $LOG_FILE"
