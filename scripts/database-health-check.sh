#!/bin/bash

################################################################################
# IPOReady Database Health Check Script
# Purpose: Monitor key database metrics and alert on scaling triggers
# Usage: ./database-health-check.sh
# Frequency: Run weekly (Monday mornings recommended)
#
# Creates a health report with:
# - Connection pool utilization
# - Query performance metrics
# - Cache hit ratio
# - Storage usage
# - Replication lag (if applicable)
# - Scaling trigger evaluation
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DATABASE_URL="${DATABASE_URL:-}"
REPORT_FILE="database-health-report-$(date +%Y%m%d_%H%M%S).txt"
SLOW_QUERY_THRESHOLD=100  # milliseconds
WARN_CONNECTIONS=150
ALERT_CONNECTIONS=200
WARN_STORAGE=1500  # MB
ALERT_STORAGE=2000  # MB

################################################################################
# Helper Functions
################################################################################

log_header() {
  echo -e "${BLUE}=== $1 ===${NC}"
}

log_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠ WARNING: $1${NC}"
}

log_error() {
  echo -e "${RED}✗ ERROR: $1${NC}"
}

# Execute SQL query against database
execute_sql() {
  local query="$1"

  if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL not set. Set it with: export DATABASE_URL=postgresql://..."
    exit 1
  fi

  psql "$DATABASE_URL" -t -c "$query" 2>/dev/null || echo "ERROR"
}

# Save result to report
report() {
  echo "$1" | tee -a "$REPORT_FILE"
}

################################################################################
# Health Check Functions
################################################################################

check_connection_pool() {
  log_header "1. Connection Pool Status"

  local query="SELECT count(*) as active_connections FROM pg_stat_activity"
  local active=$(execute_sql "$query")

  if [ "$active" == "ERROR" ]; then
    log_error "Could not connect to database"
    report "Connection Pool: ERROR - Database connection failed"
    return 1
  fi

  report "Active Connections: $active"

  # Check max_connections setting
  local max=$(execute_sql "SELECT setting FROM pg_settings WHERE name = 'max_connections'")
  report "Max Connections Allowed: $max"

  # Calculate utilization percentage
  local percent=$((active * 100 / max))
  report "Utilization: $percent%"

  # Evaluate status
  if [ "$active" -gt "$ALERT_CONNECTIONS" ]; then
    log_error "Connection pool near exhaustion ($active/$max)"
    report "Status: CRITICAL - Consider scaling"
    return 1
  elif [ "$active" -gt "$WARN_CONNECTIONS" ]; then
    log_warning "Connection pool utilization high ($active/$max)"
    report "Status: WARNING - Monitor closely"
    return 0
  else
    log_success "Connection pool healthy"
    report "Status: OK"
    return 0
  fi
}

check_query_performance() {
  log_header "2. Query Performance"

  local query="SELECT
    count(*) as total_queries,
    round(avg(mean_time)::numeric, 2) as avg_time_ms,
    round(max(max_time)::numeric, 2) as max_time_ms,
    round(min(min_time)::numeric, 2) as min_time_ms
  FROM pg_stat_statements"

  local result=$(execute_sql "$query")

  if [ "$result" == "ERROR" ]; then
    log_warning "pg_stat_statements not available (not a critical issue)"
    report "Query Performance: SKIPPED - pg_stat_statements not enabled"
    report "To enable: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
    return 0
  fi

  report "Query Statistics:"
  report "$result"

  # Find slowest queries
  local slow_query="SELECT
    left(query, 60) || '...' as query_preview,
    calls,
    round(mean_time::numeric, 2) as avg_ms,
    round(max_time::numeric, 2) as max_ms
  FROM pg_stat_statements
  WHERE mean_time > $SLOW_QUERY_THRESHOLD
  ORDER BY mean_time DESC
  LIMIT 5"

  local slow=$(execute_sql "$slow_query")

  if [ -n "$slow" ] && [ "$slow" != "ERROR" ]; then
    log_warning "Found slow queries (> ${SLOW_QUERY_THRESHOLD}ms)"
    report ""
    report "Top 5 Slowest Queries:"
    report "$slow"
  else
    log_success "No queries slower than ${SLOW_QUERY_THRESHOLD}ms"
    report "Status: OK"
  fi
}

check_cache_hit_ratio() {
  log_header "3. Cache Hit Ratio (Buffer Cache)"

  local query="SELECT
    sum(blks_hit) as cache_hits,
    sum(blks_read) as cache_misses,
    round(100.0 * sum(blks_hit)::float / (sum(blks_hit) + sum(blks_read)), 2) as cache_hit_ratio
  FROM pg_statio_user_tables"

  local result=$(execute_sql "$query")

  if [ "$result" == "ERROR" ]; then
    log_error "Could not calculate cache ratio"
    report "Cache Hit Ratio: ERROR"
    return 1
  fi

  report "$result"

  # Extract hit ratio percentage
  local ratio=$(echo "$result" | awk '{print $3}' | tail -1)

  if (( $(echo "$ratio < 95" | bc -l) )); then
    log_warning "Cache hit ratio below target ($ratio% < 95%)"
    report "Status: WARNING - May need index optimization"
    return 0
  else
    log_success "Cache hit ratio healthy ($ratio%)"
    report "Status: OK"
    return 0
  fi
}

check_storage_usage() {
  log_header "4. Storage Usage"

  local query="SELECT pg_size_pretty(pg_database_size(current_database())) as database_size"
  local size=$(execute_sql "$query")

  if [ "$size" == "ERROR" ]; then
    log_error "Could not determine storage usage"
    report "Storage Usage: ERROR"
    return 1
  fi

  report "Database Size: $size"

  # Also show table sizes
  local table_query="SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(tablename::regclass) DESC
  LIMIT 10"

  report ""
  report "Top 10 Largest Tables:"
  local tables=$(execute_sql "$table_query")
  if [ "$tables" != "ERROR" ]; then
    report "$tables"
  fi

  # Check for scaling trigger
  if [[ $size == *"GB"* ]]; then
    # Extract numeric value
    local size_num=$(echo "$size" | awk '{print $1}')
    if (( $(echo "$size_num > 2" | bc -l) )); then
      log_error "Database exceeds 2GB - consider scaling"
      report "Status: CRITICAL THRESHOLD - Plan scaling"
      return 1
    fi
  fi

  log_success "Storage usage reasonable"
  report "Status: OK"
  return 0
}

check_index_health() {
  log_header "5. Index Health"

  # Check for missing expected indexes (from Migration 004)
  local expected_indexes=(
    "idx_tasks_company_status"
    "idx_tasks_phase_priority"
    "idx_capital_companies_sector_market"
    "idx_financials_company_fiscal_compound"
    "idx_alerts_unread_by_investor"
    "idx_unified_docs_company_type"
    "idx_companies_email_lookup"
  )

  local missing=0
  for idx in "${expected_indexes[@]}"; do
    local exists=$(execute_sql "SELECT count(*) FROM pg_indexes WHERE indexname = '$idx'")
    if [ "$exists" == "0" ]; then
      log_warning "Missing expected index: $idx"
      report "Missing: $idx"
      ((missing++))
    fi
  done

  if [ $missing -eq 0 ]; then
    log_success "All expected indexes present"
    report "Status: OK - All critical indexes from Migration 004 deployed"
  else
    log_error "Missing $missing expected indexes"
    report "Status: ERROR - Deploy Migration 004"
    report "Run: psql \$DATABASE_URL -f src/db/migrations/004_performance_indexes.sql"
    return 1
  fi

  # Check for unused indexes (candidates for removal)
  local unused_query="SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_toast%'
  ORDER BY tablename"

  local unused=$(execute_sql "$unused_query")

  if [ -n "$unused" ] && [ "$unused" != "ERROR" ]; then
    report ""
    report "Unused Indexes (candidates for removal):"
    report "$unused"
  fi
}

check_replication_lag() {
  log_header "6. Replication Lag (if applicable)"

  local query="SELECT
    slot_name,
    round(extract(epoch from write_lag)::numeric * 1000, 2) as write_lag_ms,
    round(extract(epoch from flush_lag)::numeric * 1000, 2) as flush_lag_ms,
    round(extract(epoch from replay_lag)::numeric * 1000, 2) as replay_lag_ms
  FROM pg_replication_slots
  WHERE active = true"

  local result=$(execute_sql "$query")

  if [ "$result" == "ERROR" ] || [ -z "$result" ]; then
    report "Replication Lag: N/A (no active replicas)"
    report "Status: OK - Single node setup"
    return 0
  fi

  report "$result"

  # Check if lag exceeds threshold (1000ms = 1 second)
  local lag_ms=$(echo "$result" | awk '{print $4}' | tail -1)

  if [ -n "$lag_ms" ] && (( $(echo "$lag_ms > 1000" | bc -l) )); then
    log_warning "Replication lag exceeds 1 second ($lag_ms ms)"
    report "Status: WARNING - Monitor closely"
    return 0
  else
    log_success "Replication lag within target (< 1s)"
    report "Status: OK"
    return 0
  fi
}

check_scaling_triggers() {
  log_header "7. Scaling Trigger Evaluation"

  local triggers_met=0

  # Trigger 1: Connection exhaustion
  local connections=$(execute_sql "SELECT count(*) FROM pg_stat_activity")
  if [ "$connections" -gt 50 ]; then
    report "⚠ TRIGGER 1: High concurrent users ($connections > 50)"
    ((triggers_met++))
  fi

  # Trigger 2: Query performance
  local slow_count=$(execute_sql "SELECT count(*) FROM pg_stat_statements WHERE mean_time > 300")
  if [ "$slow_count" -gt 5 ]; then
    report "⚠ TRIGGER 2: Multiple slow queries ($slow_count queries > 300ms)"
    ((triggers_met++))
  fi

  # Trigger 3: Storage growth
  local size=$(execute_sql "SELECT (pg_database_size(current_database()) / 1024 / 1024)::int as size_mb")
  if [ "$size" -gt "$ALERT_STORAGE" ]; then
    report "⚠ TRIGGER 3: Large database ($size MB > ${ALERT_STORAGE}MB)"
    ((triggers_met++))
  fi

  # Trigger 4: Connection pool near limit
  if [ "$connections" -gt "$WARN_CONNECTIONS" ]; then
    report "⚠ TRIGGER 4: Connection pool high utilization"
    ((triggers_met++))
  fi

  if [ $triggers_met -eq 0 ]; then
    log_success "No scaling triggers met - infrastructure is healthy"
    report "Status: OK - Continue monitoring"
  else
    log_warning "$triggers_met scaling trigger(s) met"
    report "Status: REVIEW NEEDED"
    report ""
    report "Next Steps:"
    report "1. Review DATABASE_SCALING_HA_STRATEGY.md (Part 2.2)"
    report "2. If Tier 2 triggers met: Upgrade compute to Performance tier"
    report "3. If reads are bottleneck: Add read replica"
    report "4. Schedule scaling work in next sprint"
  fi
}

generate_summary() {
  log_header "SUMMARY"

  report ""
  report "Health Check Report Generated: $(date)"
  report "Report saved to: $REPORT_FILE"
  report ""
  report "Next Steps:"
  report "1. Review full report in $REPORT_FILE"
  report "2. Share with team in #database-monitoring"
  report "3. Address any WARNING or ERROR items"
  report "4. Schedule scaling if triggers met"
  report ""
  report "For more details, see:"
  report "- DATABASE_SCALING_HA_STRATEGY.md"
  report "- SCALING_IMPLEMENTATION_CHECKLIST.md"
}

################################################################################
# Main Execution
################################################################################

main() {
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║    IPOReady Database Health Check - $(date +%Y-%m-%d)             ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  # Initialize report
  > "$REPORT_FILE"
  report "IPOReady Database Health Check Report"
  report "Generated: $(date)"
  report ""
  report "Database: $DATABASE_URL"
  report "=========================================================="
  report ""

  # Run all checks
  check_connection_pool
  report ""
  check_query_performance
  report ""
  check_cache_hit_ratio
  report ""
  check_storage_usage
  report ""
  check_index_health
  report ""
  check_replication_lag
  report ""
  check_scaling_triggers
  report ""

  # Generate summary
  generate_summary

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✓ Health check complete. Full report: $REPORT_FILE"
  echo ""
}

# Run main function
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
  main "$@"
fi
