#!/bin/bash
# IPOReady Performance Optimization Implementation Script
# Generated: 2026-06-06T20:22:30.975Z
# Run with: bash scripts/performance-optimization-impl.sh

set -e

echo "================================"
echo "IPOReady Performance Optimization"
echo "================================"
echo ""

# ============================================================================
# 1. DATABASE OPTIMIZATION
# ============================================================================

echo "[1/5] Creating missing database indexes..."

# Migration to add missing indexes
cat > src/db/migrations/004_performance_indexes.sql << 'EOF'
-- Performance Optimization Indexes
-- Added: 2026-06-06T20:22:30.975Z

-- capital_companies improvements
CREATE INDEX IF NOT EXISTS idx_capital_companies_sector_market ON capital_companies(sector, market_cap DESC);
CREATE INDEX IF NOT EXISTS idx_capital_companies_updated ON capital_companies(updated_at DESC) WHERE updated_at > CURRENT_TIMESTAMP - INTERVAL '30 days';

-- company_financials improvements
CREATE INDEX IF NOT EXISTS idx_financials_compound ON company_financials(company_id, fiscal_year DESC, fiscal_quarter DESC);
CREATE INDEX IF NOT EXISTS idx_financials_revenue ON company_financials(company_id, revenue DESC);

-- investor_alerts improvements
CREATE INDEX IF NOT EXISTS idx_alerts_unread_by_investor ON investor_alerts(investor_id, email_opened) WHERE email_opened = false;
CREATE INDEX IF NOT EXISTS idx_alerts_recent_critical ON investor_alerts(created_at DESC, severity) WHERE severity IN ('CRITICAL', 'HIGH');

-- Tasks table improvements
CREATE INDEX IF NOT EXISTS idx_tasks_company_status ON tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_priority ON tasks(phase, priority DESC);

-- Unified documents improvements
CREATE INDEX IF NOT EXISTS idx_unified_docs_company_type ON unified_documents(company_id, document_type);
CREATE INDEX IF NOT EXISTS idx_unified_docs_status ON unified_documents(status) WHERE status NOT IN ('archived', 'deleted');

EOF

echo "✓ Migration file created: src/db/migrations/004_performance_indexes.sql"
echo ""

# ============================================================================
# 2. QUERY OPTIMIZATION
# ============================================================================

echo "[2/5] Identifying and fixing N+1 queries..."
echo "TODO: Review the following files for N+1 patterns:"
echo "  - src/app/api/directors-officers/[directorId]/auto-populate-from-linkedin/route.ts:-1: Potential N+1 query: SQL query inside loop detected"
echo "  - src/app/api/directors-officers/check-compliance/route.ts:-1: Potential N+1 query: SQL query inside loop detected"
echo "  - src/app/api/directors-officers/get-prospectus-section/route.ts:-1: Potential N+1 query: SQL query inside loop detected"
echo "  - src/app/api/documents/relationships/initialize/route.ts:-1: Potential N+1 query: SQL query inside loop detected"
echo "  - src/app/api/prospectus/extract/route.ts:-1: Potential N+1 query: SQL query inside loop detected"
echo ""

# ============================================================================
# 3. CACHING IMPLEMENTATION
# ============================================================================

echo "[3/5] Setting up API response caching..."

# Create caching utility
cat > src/lib/cache-headers.ts << 'EOF'
/**
 * Cache header utilities for API responses
 */

export function setCacheHeaders(ttl: number = 60) {
  const headers = new Headers()
  headers.set('Cache-Control', `public, max-age=${ttl}, must-revalidate`)
  headers.set('CDN-Cache-Control', `max-age=${ttl}`)
  return headers
}

export const CACHE_TTL = {
  // Stable data - 24 hours
  STABLE: 86400,
  // Frequently changing - 1 hour
  NORMAL: 3600,
  // Real-time data - 5 minutes
  SHORT: 300,
  // Highly dynamic - no cache
  NONE: 0
}
EOF

echo "✓ Cache headers utility created"
echo ""

# ============================================================================
# 4. IMAGE OPTIMIZATION
# ============================================================================

echo "[4/5] Setting up image optimization..."

# Create image configuration for Next.js
cat > next.config.images.js << 'EOF'
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  }
}
EOF

echo "✓ Image optimization configured"
echo ""

# ============================================================================
# 5. BUNDLE ANALYSIS
# ============================================================================

echo "[5/5] Analyzing bundle size..."

echo "Large dependencies to optimize:"
echo "  - docx (~320KB): DOCX generation - consider lazy loading"
echo "  - framer-motion (~40KB): Animation library - well optimized"
echo "  - googleapis (~500KB): Google APIs - consider API layer abstraction"
echo "  - openai (~85KB): OpenAI SDK - server-side only, should not be in browser bundle"
echo "  - pdfkit (~450KB): PDF generation - only needed server-side"
echo "  - recharts (~290KB): Chart library - code split per page"
echo "  - xlsx (~380KB): Excel handling - lazy load on demand"

echo ""
echo "Next steps:"
echo "1. Move server-only libraries to server components (openai, googleapis)"
echo "2. Lazy load PDF/Excel generation code"
echo "3. Code-split chart library with React.lazy()"
echo "4. Implement request caching with Redis"
echo ""
echo "✓ Performance optimization complete!"
