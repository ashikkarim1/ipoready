#!/bin/bash

# IPOReady Load Testing Suite
# Runs all performance tests sequentially

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  IPOReady Load Testing & Performance Audit Suite"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed"
    echo ""
    echo "Install k6 using:"
    echo "  macOS: brew install k6"
    echo "  Linux: sudo apt-get install k6"
    echo "  See: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Load environment variables
if [ -f .env.load-test ]; then
    set -a
    source .env.load-test
    set +a
fi

# Default values
BASE_URL=${BASE_URL:-"http://localhost:3000"}
TEST_AUTH_TOKEN=${TEST_AUTH_TOKEN:-""}
RESULTS_DIR="load-tests/results"

echo "Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Results Dir: $RESULTS_DIR"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to run test
run_test() {
    local test_file=$1
    local test_name=$2
    local timeout=$3

    echo "────────────────────────────────────────────────────────────────"
    echo "Running: $test_name"
    echo "────────────────────────────────────────────────────────────────"
    echo ""

    local start_time=$(date +%s)

    k6 run "load-tests/$test_file" \
        -e BASE_URL="$BASE_URL" \
        -e TEST_AUTH_TOKEN="$TEST_AUTH_TOKEN" \
        --out json="$RESULTS_DIR/${test_file%.k6.js}-results.json" \
        || {
        echo "❌ Test failed: $test_name"
        return 1
    }

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "✅ $test_name completed in ${duration}s"
    echo ""
}

# Run tests
echo "Starting load tests..."
echo ""

# 1. User Load Tests (5 minutes)
run_test "user-load.k6.js" "User Load Test" "5m" || exit 1
sleep 2

# 2. API Load Tests (2 minutes)
run_test "api-load.k6.js" "API Load Test" "2m" || exit 1
sleep 2

# 3. Database Load Tests (3 minutes)
run_test "db-load.k6.js" "Database Load Test" "3m" || exit 1
sleep 2

# 4. Real-World Workflow Tests (3 minutes)
run_test "workflow-load.k6.js" "Real-World Workflow Test" "3m" || exit 1

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  All load tests completed!"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Run analysis if Node.js is available
if command -v node &> /dev/null; then
    echo "Analyzing results..."
    echo ""
    
    node load-tests/analyze-performance.js || {
        echo "⚠️  Could not run analysis script"
    }

    # Check database performance
    if [ -f load-tests/check-database-performance.js ]; then
        echo ""
        echo "Checking database performance..."
        node load-tests/check-database-performance.js || {
            echo "⚠️  Could not run database check script"
        }
    fi
fi

echo ""
echo "📊 Results saved to: $RESULTS_DIR"
echo ""
echo "Next steps:"
echo "  1. Review load-tests/performance-report.json"
echo "  2. Check identified bottlenecks"
echo "  3. Implement recommended optimizations"
echo "  4. Re-run tests to validate improvements"
echo ""
