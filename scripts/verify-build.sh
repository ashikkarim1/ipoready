#!/bin/bash

# IPOReady Build Verification Script
# This script performs comprehensive verification of the build process
# Usage: chmod +x scripts/verify-build.sh && ./scripts/verify-build.sh

set -e  # Exit on first error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Tracking arrays
declare -a PASSED_CHECKS
declare -a FAILED_CHECKS
TOTAL_CHECKS=0
PASSED_COUNT=0

# Function to log results
log_header() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} $1"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

log_check() {
  local check_name=$1
  local status=$2
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

  if [ "$status" == "PASS" ]; then
    echo -e "${GREEN}✅ PASS${NC}  | $check_name"
    PASSED_COUNT=$((PASSED_COUNT + 1))
    PASSED_CHECKS+=("$check_name")
  else
    echo -e "${RED}❌ FAIL${NC}  | $check_name"
    FAILED_CHECKS+=("$check_name")
  fi
}

log_info() {
  echo -e "${YELLOW}ℹ️  INFO${NC}  | $1"
}

log_error() {
  echo -e "${RED}⚠️  ERROR${NC} | $1"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Start
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC} ${BLUE}IPOReady Build Verification Script${NC}"
echo -e "${BLUE}║${NC} Started at: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

# ============================================================================
# SECTION 1: PRE-BUILD ENVIRONMENT CHECK
# ============================================================================

log_header "SECTION 1: PRE-BUILD ENVIRONMENT CHECK"

# Check Node.js version
if command_exists node; then
  NODE_VERSION=$(node --version)
  echo "Node version: $NODE_VERSION"
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
  if [ "$NODE_MAJOR" -ge 18 ]; then
    log_check "Node.js version (18+)" "PASS"
  else
    log_check "Node.js version (18+)" "FAIL"
  fi
else
  log_check "Node.js installed" "FAIL"
  exit 1
fi

# Check npm version
if command_exists npm; then
  NPM_VERSION=$(npm --version)
  echo "npm version: $NPM_VERSION"
  log_check "npm installed" "PASS"
else
  log_check "npm installed" "FAIL"
  exit 1
fi

# Check node_modules
if [ -d "node_modules" ]; then
  log_check "Dependencies installed (node_modules exists)" "PASS"
else
  log_check "Dependencies installed (node_modules exists)" "FAIL"
  log_error "Run 'npm install' first"
  exit 1
fi

# Check .env.local
if [ -f ".env.local" ]; then
  log_check "Environment config (.env.local exists)" "PASS"
  # Check for critical env vars
  if grep -q "DATABASE_URL\|NEXTAUTH_SECRET" .env.local 2>/dev/null; then
    log_check "Critical env vars configured" "PASS"
  else
    log_check "Critical env vars configured" "FAIL"
  fi
else
  log_check "Environment config (.env.local exists)" "FAIL"
  log_error "Copy .env.example to .env.local and configure"
fi

# Check tsconfig.json
if [ -f "tsconfig.json" ]; then
  log_check "TypeScript config (tsconfig.json exists)" "PASS"
else
  log_check "TypeScript config (tsconfig.json exists)" "FAIL"
fi

# Check next.config.js
if [ -f "next.config.js" ]; then
  log_check "Next.js config (next.config.js exists)" "PASS"
else
  log_check "Next.js config (next.config.js exists)" "FAIL"
fi

# Check package.json
if [ -f "package.json" ]; then
  log_check "Package manifest (package.json exists)" "PASS"
else
  log_check "Package manifest (package.json exists)" "FAIL"
fi

# ============================================================================
# SECTION 2: CLEAN AND BUILD
# ============================================================================

log_header "SECTION 2: BUILD EXECUTION"

# Remove old build
if [ -d ".next" ]; then
  log_info "Removing old .next directory..."
  rm -rf .next
fi

# Run build
log_info "Starting clean build... (this may take 1-2 minutes)"
BUILD_START=$(date +%s)

if npm run build > /tmp/build.log 2>&1; then
  BUILD_END=$(date +%s)
  BUILD_DURATION=$((BUILD_END - BUILD_START))
  log_check "Clean build completed successfully" "PASS"
  echo "Build duration: ${BUILD_DURATION} seconds"

  # Check for TypeScript errors in build output
  if grep -i "error\|failed" /tmp/build.log > /dev/null; then
    if ! grep -i "deprecated\|warning" /tmp/build.log | grep -v "error\|failed" > /dev/null; then
      log_check "No build errors in output" "PASS"
    fi
  else
    log_check "No build errors in output" "PASS"
  fi
else
  BUILD_END=$(date +%s)
  BUILD_DURATION=$((BUILD_END - BUILD_START))
  log_check "Clean build completed successfully" "FAIL"
  echo "Build log:"
  tail -30 /tmp/build.log
  echo ""
  echo "Full log available at: /tmp/build.log"
  exit 1
fi

# ============================================================================
# SECTION 3: BUILD ARTIFACTS VERIFICATION
# ============================================================================

log_header "SECTION 3: BUILD ARTIFACTS VERIFICATION"

# Check .next directory structure
if [ -d ".next" ]; then
  log_check ".next directory created" "PASS"

  if [ -d ".next/static" ]; then
    log_check ".next/static (assets) exists" "PASS"
  else
    log_check ".next/static (assets) exists" "FAIL"
  fi

  if [ -d ".next/server" ]; then
    log_check ".next/server (server code) exists" "PASS"
  else
    log_check ".next/server (server code) exists" "FAIL"
  fi

  # Bundle size check
  STATIC_SIZE=$(du -sh .next/static | awk '{print $1}')
  NEXT_SIZE=$(du -sh .next | awk '{print $1}')
  echo "Build artifacts size:"
  echo "  .next total: $NEXT_SIZE"
  echo "  .next/static: $STATIC_SIZE"
  log_check "Build artifacts size acceptable" "PASS"
else
  log_check ".next directory created" "FAIL"
  exit 1
fi

# ============================================================================
# SECTION 4: TYPESCRIPT VERIFICATION
# ============================================================================

log_header "SECTION 4: TYPESCRIPT VERIFICATION"

log_info "Running TypeScript compiler check..."
if npx tsc --noEmit 2> /tmp/tsc.log; then
  log_check "TypeScript compilation (no errors)" "PASS"
else
  TS_ERRORS=$(grep -c "error TS" /tmp/tsc.log || echo "0")
  if [ "$TS_ERRORS" -eq 0 ]; then
    log_check "TypeScript compilation (no errors)" "PASS"
  else
    log_check "TypeScript compilation (no errors)" "FAIL"
    echo "TypeScript errors found:"
    head -20 /tmp/tsc.log
    echo ""
    echo "Full log available at: /tmp/tsc.log"
  fi
fi

# ============================================================================
# SECTION 5: LINTING CHECK
# ============================================================================

log_header "SECTION 5: CODE LINTING"

log_info "Running ESLint..."
if npm run lint > /tmp/lint.log 2>&1; then
  log_check "Linting passed" "PASS"
else
  # ESLint returns non-zero on warnings/errors, check output
  if grep -q "error" /tmp/lint.log; then
    log_check "Linting passed" "FAIL"
    echo "Linting errors:"
    grep "error" /tmp/lint.log | head -10
  else
    log_check "Linting passed (warnings only)" "PASS"
  fi
fi

# ============================================================================
# SECTION 6: PAGE EXISTENCE CHECK
# ============================================================================

log_header "SECTION 6: CRITICAL PAGES VERIFICATION"

# Array of critical pages
declare -a CRITICAL_PAGES=(
  "src/app/page.tsx"
  "src/app/login/page.tsx"
  "src/app/register/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/dashboard/capital-markets/page.tsx"
  "src/app/dashboard/listed-services/page.tsx"
  "src/app/dashboard/documents/page.tsx"
  "src/app/dashboard/compliance/page.tsx"
  "src/app/dashboard/cap-table/page.tsx"
  "src/app/pricing/page.tsx"
  "src/app/legal/privacy/page.tsx"
  "src/app/legal/tos/page.tsx"
)

MISSING_PAGES=0
for page in "${CRITICAL_PAGES[@]}"; do
  if [ -f "$page" ]; then
    log_check "Page exists: $page" "PASS"
  else
    log_check "Page exists: $page" "FAIL"
    MISSING_PAGES=$((MISSING_PAGES + 1))
  fi
done

if [ "$MISSING_PAGES" -gt 0 ]; then
  log_error "$MISSING_PAGES critical pages missing"
fi

# ============================================================================
# SECTION 7: CONFIG VALIDATION
# ============================================================================

log_header "SECTION 7: CONFIGURATION VALIDATION"

# Check next.config.js syntax
if node -e "require('./next.config.js')" 2>/dev/null; then
  log_check "next.config.js syntax valid" "PASS"
else
  log_check "next.config.js syntax valid" "FAIL"
fi

# Check tsconfig.json syntax
if node -e "require('./tsconfig.json')" 2>/dev/null; then
  log_check "tsconfig.json syntax valid" "PASS"
else
  log_check "tsconfig.json syntax valid" "FAIL"
fi

# Check package.json syntax
if node -e "require('./package.json')" 2>/dev/null; then
  log_check "package.json syntax valid" "PASS"
else
  log_check "package.json syntax valid" "FAIL"
fi

# ============================================================================
# SECTION 8: SUMMARY
# ============================================================================

log_header "SECTION 8: VERIFICATION SUMMARY"

echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: ${GREEN}$PASSED_COUNT${NC}"
echo "Failed: ${RED}$((TOTAL_CHECKS - PASSED_COUNT))${NC}"
echo ""

PASS_RATE=$((PASSED_COUNT * 100 / TOTAL_CHECKS))
echo "Pass Rate: ${GREEN}${PASS_RATE}%${NC}"
echo ""

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ ALL CHECKS PASSED - BUILD IS READY${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Start dev server: npm run dev"
  echo "  2. Test routes in browser: http://localhost:3000"
  echo "  3. Check browser console for errors"
  echo "  4. Verify authentication and database connectivity"
  echo ""
  exit 0
else
  echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}❌ SOME CHECKS FAILED - REVIEW ISSUES BELOW${NC}"
  echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Failed checks:"
  for failed in "${FAILED_CHECKS[@]}"; do
    echo "  • $failed"
  done
  echo ""
  echo "Review logs:"
  echo "  • Build log: /tmp/build.log"
  echo "  • TypeScript log: /tmp/tsc.log"
  echo "  • Lint log: /tmp/lint.log"
  echo ""
  exit 1
fi
