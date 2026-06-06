#!/bin/bash

###############################################################################
# Capital Markets Load Test Runner
#
# This script simplifies running load tests with various configurations
#
# Usage:
#   ./run-load-test.sh                    # Run full test
#   ./run-load-test.sh --dev              # Run against localhost
#   ./run-load-test.sh --staging          # Run against staging
#   ./run-load-test.sh --spike            # Run spike test
#   ./run-load-test.sh --soak             # Run soak test (1 hour)
#
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="${TEST_DIR}/results"
SCRIPT_NAME=$(basename "$0")

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

# Default values
BASE_URL=${BASE_URL:-"http://localhost:3000"}
TEST_TYPE="${1:-standard}"
DURATION="10m"
PEAK_VUS=1000

# Function to print formatted output
print_header() {
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║ $1${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
  echo -e "${GREEN}✓ ${NC}$1"
}

print_error() {
  echo -e "${RED}✗ ${NC}$1"
}

print_warning() {
  echo -e "${YELLOW}⚠ ${NC}$1"
}

# Function to check prerequisites
check_prerequisites() {
  print_header "Checking Prerequisites"

  # Check k6
  if ! command -v k6 &> /dev/null; then
    print_error "k6 is not installed"
    echo ""
    echo "Install k6:"
    echo "  macOS: brew install k6"
    echo "  Linux: sudo apt-get install k6"
    echo "  Windows: choco install k6"
    exit 1
  fi
  print_success "k6 is installed ($(k6 --version))"

  # Check if server is reachable
  print_info "Testing connection to ${BASE_URL}..."
  if timeout 5 curl -s "${BASE_URL}/health" > /dev/null 2>&1 || \
     timeout 5 curl -s "${BASE_URL}/" > /dev/null 2>&1; then
    print_success "Server is reachable at ${BASE_URL}"
  else
    print_warning "Server at ${BASE_URL} may not be responding"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_error "Aborting"
      exit 1
    fi
  fi

  echo ""
}

# Test types
run_standard_test() {
  print_header "Running Standard Load Test"
  print_info "Configuration:"
  print_info "  Duration: 10 minutes (60s ramp-up + 9m sustained + 1m cool-down)"
  print_info "  Peak VUs: 1000"
  print_info "  Base URL: ${BASE_URL}"
  echo ""

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local results_file="${RESULTS_DIR}/capital-markets-load-${timestamp}.json"

  BASE_URL="${BASE_URL}" k6 run "${TEST_DIR}/capital-markets-load.k6.js" \
    -o json="${results_file}" \
    --summary-export="${results_file%.json}-summary.json"

  print_success "Test completed"
  print_info "Results saved to: ${results_file}"

  # Analyze results
  echo ""
  analyze_results "${results_file}"
}

run_spike_test() {
  print_header "Running Spike Test"
  print_info "Configuration:"
  print_info "  Duration: 5 minutes"
  print_info "  Ramp-up: 2 minutes (0 → 1000 VUs)"
  print_info "  Spike: 30 seconds at 2000 VUs"
  print_info "  Cool-down: 2.5 minutes"
  echo ""

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local results_file="${RESULTS_DIR}/capital-markets-spike-${timestamp}.json"

  BASE_URL="${BASE_URL}" k6 run "${TEST_DIR}/capital-markets-load.k6.js" \
    --stage 2m:1000 \
    --stage 30s:2000 \
    --stage 2m30s:0 \
    -o json="${results_file}" \
    --summary-export="${results_file%.json}-summary.json"

  print_success "Spike test completed"
  analyze_results "${results_file}"
}

run_soak_test() {
  print_header "Running Soak Test (Long Duration)"
  print_info "Configuration:"
  print_info "  Duration: 1 hour"
  print_info "  Ramp-up: 5 minutes (0 → 500 VUs)"
  print_info "  Sustained: 55 minutes at 500 VUs"
  print_info "  Cool-down: 5 minutes"
  echo ""

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local results_file="${RESULTS_DIR}/capital-markets-soak-${timestamp}.json"

  print_warning "This test will run for 1 hour. Press Ctrl+C to cancel."
  sleep 3

  BASE_URL="${BASE_URL}" k6 run "${TEST_DIR}/capital-markets-load.k6.js" \
    --stage 5m:500 \
    --stage 55m:500 \
    --stage 5m:0 \
    -o json="${results_file}" \
    --summary-export="${results_file%.json}-summary.json"

  print_success "Soak test completed"
  analyze_results "${results_file}"
}

run_stress_test() {
  print_header "Running Stress Test"
  print_info "Configuration:"
  print_info "  Duration: 20 minutes"
  print_info "  Gradually increase load to breaking point"
  echo ""

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local results_file="${RESULTS_DIR}/capital-markets-stress-${timestamp}.json"

  BASE_URL="${BASE_URL}" k6 run "${TEST_DIR}/capital-markets-load.k6.js" \
    --stage 5m:100 \
    --stage 5m:500 \
    --stage 5m:1000 \
    --stage 5m:2000 \
    -o json="${results_file}" \
    --summary-export="${results_file%.json}-summary.json"

  print_success "Stress test completed"
  analyze_results "${results_file}"
}

run_smoke_test() {
  print_header "Running Smoke Test"
  print_info "Configuration:"
  print_info "  Duration: 1 minute"
  print_info "  VUs: 10 (basic sanity check)"
  echo ""

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local results_file="${RESULTS_DIR}/capital-markets-smoke-${timestamp}.json"

  BASE_URL="${BASE_URL}" k6 run "${TEST_DIR}/capital-markets-load.k6.js" \
    --stage 30s:10 \
    --stage 30s:0 \
    -o json="${results_file}" \
    --summary-export="${results_file%.json}-summary.json"

  print_success "Smoke test completed"
  analyze_results "${results_file}"
}

analyze_results() {
  local results_file="$1"

  if [ -z "${results_file}" ] || [ ! -f "${results_file}" ]; then
    return
  fi

  echo ""
  print_info "Analyzing results..."

  if command -v node &> /dev/null; then
    if [ -f "${TEST_DIR}/analyze-results.js" ]; then
      node "${TEST_DIR}/analyze-results.js" "${results_file}"
    fi
  else
    print_warning "Node.js not found, skipping detailed analysis"
    print_info "To analyze results manually:"
    echo "  node ${TEST_DIR}/analyze-results.js ${results_file}"
  fi
}

show_usage() {
  cat << EOF
${CYAN}Capital Markets Load Test Runner${NC}

${CYAN}Usage:${NC}
  ${SCRIPT_NAME} [TEST_TYPE] [OPTIONS]

${CYAN}Test Types:${NC}
  standard     Standard 10-minute load test (1000 VUs) [default]
  spike        Spike test (sudden surge to 2000 VUs)
  soak         Soak test (1 hour at moderate load)
  stress       Stress test (gradually increase until breaking point)
  smoke        Smoke test (quick sanity check, 10 VUs)

${CYAN}Options:${NC}
  --dev        Run against http://localhost:3000
  --staging    Run against https://staging.ipoready.com
  --prod       Run against https://api.ipoready.com
  --url URL    Run against custom URL
  --help       Show this help message

${CYAN}Examples:${NC}
  ${SCRIPT_NAME}                      # Standard test on localhost
  ${SCRIPT_NAME} spike --staging      # Spike test on staging
  ${SCRIPT_NAME} soak --url https://api.example.com
  ${SCRIPT_NAME} smoke --dev          # Quick sanity check

${CYAN}Environment Variables:${NC}
  BASE_URL           Server URL (default: http://localhost:3000)
  AUTH_TOKEN         API authentication token (optional)

${CYAN}Results Location:${NC}
  Results are saved to: ${RESULTS_DIR}/

EOF
}

# Parse command line arguments
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  show_usage
  exit 0
fi

# Handle test type and options
if [[ "$1" == "--dev" ]]; then
  BASE_URL="http://localhost:3000"
  TEST_TYPE="${2:-standard}"
elif [[ "$1" == "--staging" ]]; then
  BASE_URL="https://staging.ipoready.com"
  TEST_TYPE="${2:-standard}"
elif [[ "$1" == "--prod" ]]; then
  BASE_URL="https://api.ipoready.com"
  TEST_TYPE="${2:-standard}"
elif [[ "$1" == "--url" ]]; then
  BASE_URL="$2"
  TEST_TYPE="${3:-standard}"
elif [[ "$1" == "standard" ]] || [[ "$1" == "spike" ]] || \
     [[ "$1" == "soak" ]] || [[ "$1" == "stress" ]] || [[ "$1" == "smoke" ]]; then
  TEST_TYPE="$1"
  if [[ "$2" == "--dev" ]]; then
    BASE_URL="http://localhost:3000"
  elif [[ "$2" == "--staging" ]]; then
    BASE_URL="https://staging.ipoready.com"
  elif [[ "$2" == "--prod" ]]; then
    BASE_URL="https://api.ipoready.com"
  elif [[ "$2" == "--url" ]]; then
    BASE_URL="$3"
  fi
fi

# Main execution
check_prerequisites

case "${TEST_TYPE}" in
  standard)
    run_standard_test
    ;;
  spike)
    run_spike_test
    ;;
  soak)
    run_soak_test
    ;;
  stress)
    run_stress_test
    ;;
  smoke)
    run_smoke_test
    ;;
  *)
    print_error "Unknown test type: ${TEST_TYPE}"
    echo ""
    show_usage
    exit 1
    ;;
esac

echo ""
print_success "Load test finished!"
print_info "Review results in: ${RESULTS_DIR}/"
