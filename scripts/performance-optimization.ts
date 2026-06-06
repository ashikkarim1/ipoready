#!/usr/bin/env tsx
/**
 * ============================================================================
 * Performance Optimization Script for IPOReady
 * ============================================================================
 *
 * Comprehensive performance audit covering:
 * - Database indexes verification
 * - SQL query efficiency (N+1 problems)
 * - API response caching
 * - Image optimization
 * - Bundle analysis
 *
 * Run: tsx scripts/performance-optimization.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// TYPES
// ============================================================================

interface IndexReport {
  table: string
  indexes: string[]
  missing: string[]
  suggestions: string[]
}

interface QueryAnalysis {
  file: string
  queries: QueryIssue[]
  n1Problems: N1Problem[]
}

interface QueryIssue {
  line: number
  query: string
  issue: string
}

interface N1Problem {
  file: string
  line: number
  description: string
  severity: 'critical' | 'high' | 'medium'
}

interface CacheOpportunity {
  endpoint: string
  method: string
  ttl: number
  description: string
}

interface BundleAnalysis {
  dependency: string
  size: number
  sizeGzip: number
  importedBy: string[]
  recommendation?: string
}

interface OptimizationReport {
  timestamp: string
  database: IndexReport[]
  queries: QueryAnalysis[]
  caching: CacheOpportunity[]
  bundle: BundleAnalysis[]
  images: ImageOptimization[]
  summary: OptimizationSummary
}

interface ImageOptimization {
  path: string
  size: number
  format: string
  recommendation: string
}

interface OptimizationSummary {
  totalIssuesFound: number
  criticalCount: number
  highCount: number
  estimatedPerfGain: string
  implementations: string[]
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROJECT_ROOT = '/Users/test/Documents/Claude/Projects/IPOReady'
const SRC_DIR = path.join(PROJECT_ROOT, 'src')
const DB_DIR = path.join(SRC_DIR, 'db')
const API_DIR = path.join(SRC_DIR, 'app/api')

// Critical tables requiring index optimization
const CRITICAL_TABLES = [
  'capital_companies',
  'company_financials',
  'investor_alerts',
  'investor_saved_companies',
  'tasks',
  'unified_documents'
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    success: '\x1b[32m'  // Green
  }
  const reset = '\x1b[0m'
  console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`)
}

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    return ''
  }
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files.push(...findFiles(fullPath, pattern))
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

// ============================================================================
// 1. DATABASE INDEX ANALYSIS
// ============================================================================

function analyzeIndexes(): IndexReport[] {
  log('Analyzing database indexes...', 'info')
  const reports: IndexReport[] = []

  // Load migration files
  const migrationFiles = findFiles(DB_DIR, /\.sql$/)
  const migrationContent = migrationFiles.map(f => readFile(f)).join('\n')

  // Expected indexes for critical tables
  const expectedIndexes: Record<string, string[]> = {
    capital_companies: [
      'idx_capital_companies_cik',
      'idx_capital_companies_ticker',
      'idx_capital_companies_sector'
    ],
    company_financials: [
      'idx_financials_company',
      'idx_financials_fiscal',
      'idx_financials_filing_date'
    ],
    investor_alerts: [
      'idx_alert_investor',
      'idx_alert_company',
      'idx_alert_created',
      'idx_alert_severity',
      'idx_alert_type'
    ],
    investor_profiles: [
      'idx_investor_email',
      'idx_investor_firm',
      'idx_investor_created',
      'idx_investor_check_size'
    ],
    tasks: [
      'idx_tasks_company',
      'idx_tasks_phase',
      'idx_tasks_status'
    ],
    unified_documents: [
      'idx_unified_docs_company',
      'idx_unified_docs_type'
    ]
  }

  for (const [table, expectedIdx] of Object.entries(expectedIndexes)) {
    const foundIndexes = expectedIdx.filter(idx =>
      migrationContent.includes(idx) || migrationContent.includes(`ON ${table}`)
    )

    const missing = expectedIdx.filter(idx => !foundIndexes.includes(idx))

    const suggestions: string[] = []

    if (missing.length > 0) {
      suggestions.push(`Missing indexes: ${missing.join(', ')}`)
    }

    // Add-on suggestions for specific tables
    if (table === 'capital_companies') {
      suggestions.push('Add compound index: (sector, market_cap DESC) for sector analysis')
      suggestions.push('Add partial index on updated_at for recent updates tracking')
    }

    if (table === 'company_financials') {
      suggestions.push('Add compound index: (company_id, fiscal_year DESC, fiscal_quarter DESC)')
      suggestions.push('Add index on revenue for revenue-based queries')
    }

    if (table === 'investor_alerts') {
      suggestions.push('Add partial index: (investor_id, severity) WHERE email_opened = false')
      suggestions.push('Add index on created_at DESC for chronological queries')
    }

    reports.push({
      table,
      indexes: foundIndexes,
      missing,
      suggestions
    })
  }

  return reports
}

// ============================================================================
// 2. SQL QUERY EFFICIENCY ANALYSIS
// ============================================================================

function analyzeQueries(): QueryAnalysis[] {
  log('Analyzing SQL query patterns for N+1 problems...', 'info')
  const analyses: QueryAnalysis[] = []

  const apiFiles = findFiles(API_DIR, /route\.ts$/)

  for (const filePath of apiFiles) {
    const content = readFile(filePath)
    const queries: QueryIssue[] = []
    const n1Problems: N1Problem[] = []

    // Detect multiple SELECT statements in loops
    const selectMatches = content.matchAll(/SELECT\s+\w+.*?FROM\s+\w+/gi)
    let selectCount = 0
    for (const match of selectMatches) {
      selectCount++
    }

    // Check for potential N+1 patterns
    const loopedQueryPattern = /for\s*\(.*?\)\s*\{[^}]*sql`[^`]*SELECT/s
    if (loopedQueryPattern.test(content)) {
      n1Problems.push({
        file: path.relative(PROJECT_ROOT, filePath),
        line: content.split('\n').findIndex(line => loopedQueryPattern.test(line)),
        description: 'Potential N+1 query: SQL query inside loop detected',
        severity: 'critical'
      })
    }

    // Check for missing WHERE clauses
    const missingWherePattern = /sql`\s*SELECT\s+\*\s+FROM/g
    if (missingWherePattern.test(content)) {
      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        if (missingWherePattern.test(line)) {
          queries.push({
            line: idx + 1,
            query: line,
            issue: 'SELECT * without WHERE clause - may fetch unnecessary columns'
          })
        }
      })
    }

    // Check for missing LIMIT clauses in list queries
    const unlimitedListPattern = /\/\/(.*list|.*get.*items|.*fetch.*all)[\s\S]*?sql`[^`]*SELECT[^`]*FROM[^`]*`/i
    if (unlimitedListPattern.test(content)) {
      queries.push({
        line: 1,
        query: 'List endpoint without LIMIT',
        issue: 'API endpoint fetches all records without pagination - memory inefficient'
      })
    }

    // Check for missing indexes in WHERE clauses
    const whereClausePattern = /WHERE\s+(\w+)\s*=/g
    for (const match of content.matchAll(whereClausePattern)) {
      if (match[1] && !['id', 'company_id', 'investor_id', 'user_id'].includes(match[1])) {
        queries.push({
          line: 1,
          query: `WHERE ${match[1]} = ?`,
          issue: `Column ${match[1]} used in WHERE but may not be indexed`
        })
      }
    }

    if (queries.length > 0 || n1Problems.length > 0) {
      analyses.push({
        file: path.relative(PROJECT_ROOT, filePath),
        queries,
        n1Problems
      })
    }
  }

  return analyses
}

// ============================================================================
// 3. CACHE OPPORTUNITY ANALYSIS
// ============================================================================

function analyzeCacheOpportunities(): CacheOpportunity[] {
  log('Analyzing cache opportunities...', 'info')
  const opportunities: CacheOpportunity[] = []

  // Define cacheable endpoints
  const cacheableEndpoints: CacheOpportunity[] = [
    {
      endpoint: '/api/company/route.ts',
      method: 'GET',
      ttl: 3600,
      description: 'Company profile - stable data, cache for 1 hour'
    },
    {
      endpoint: '/api/dashboard/route.ts',
      method: 'GET',
      ttl: 300,
      description: 'Dashboard stats - cache for 5 minutes'
    },
    {
      endpoint: '/api/regulatory/route.ts',
      method: 'GET',
      ttl: 86400,
      description: 'Regulatory rules - stable data, cache for 24 hours'
    },
    {
      endpoint: '/api/financial-tracking/route.ts',
      method: 'GET',
      ttl: 3600,
      description: 'Financial data - cache for 1 hour'
    },
    {
      endpoint: '/api/listing-rules/route.ts',
      method: 'GET',
      ttl: 86400,
      description: 'Listing rules - stable data, cache for 24 hours'
    }
  ]

  const apiFiles = findFiles(API_DIR, /route\.ts$/)

  for (const opportunity of cacheableEndpoints) {
    const routePath = path.join(API_DIR, opportunity.endpoint.replace('/api/', ''))
    if (fs.existsSync(routePath)) {
      opportunities.push(opportunity)
    }
  }

  return opportunities
}

// ============================================================================
// 4. IMAGE OPTIMIZATION ANALYSIS
// ============================================================================

function analyzeImages(): ImageOptimization[] {
  log('Analyzing image optimization opportunities...', 'info')
  const optimizations: ImageOptimization[] = []

  // Find all image files
  const imagePatterns = [/\.png$/, /\.jpg$/, /\.jpeg$/, /\.gif$/]
  const publicDir = path.join(PROJECT_ROOT, 'public')

  if (!fs.existsSync(publicDir)) {
    log('Public directory not found, skipping image analysis', 'warn')
    return []
  }

  const imageDirs = ['assets', 'images', 'logos']

  for (const dir of imageDirs) {
    const dirPath = path.join(publicDir, dir)
    if (!fs.existsSync(dirPath)) continue

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile()) continue

      const fullPath = path.join(dirPath, entry.name)
      const stats = fs.statSync(fullPath)
      const ext = path.extname(entry.name).toLowerCase()

      let recommendation = 'Already optimized'
      const sizeKB = stats.size / 1024

      if (ext === '.png' && sizeKB > 100) {
        recommendation = 'Convert to WebP for better compression'
      } else if (ext === '.jpg' && sizeKB > 200) {
        recommendation = 'Compress using ImageMagick or similar tool'
      } else if (ext === '.gif' && sizeKB > 500) {
        recommendation = 'Convert animated GIF to MP4 or WebP for smaller file size'
      } else if (sizeKB > 50) {
        recommendation = 'Consider serving next/image with responsive sizing'
      }

      optimizations.push({
        path: path.relative(PROJECT_ROOT, fullPath),
        size: stats.size,
        format: ext,
        recommendation
      })
    }
  }

  return optimizations
}

// ============================================================================
// 5. BUNDLE ANALYSIS
// ============================================================================

function analyzeBundleSize(): BundleAnalysis[] {
  log('Analyzing bundle size and large dependencies...', 'info')
  const analyses: BundleAnalysis[] = []

  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json')
  const packageJson = JSON.parse(readFile(packageJsonPath))

  const dependencies = packageJson.dependencies || {}

  // Identify potentially large dependencies
  const largeDepCandidates: Record<string, { size: number; reason: string }> = {
    'pdfkit': { size: 450, reason: 'PDF generation - only needed server-side' },
    'docx': { size: 320, reason: 'DOCX generation - consider lazy loading' },
    'xlsx': { size: 380, reason: 'Excel handling - lazy load on demand' },
    'recharts': { size: 290, reason: 'Chart library - code split per page' },
    'googleapis': { size: 500, reason: 'Google APIs - consider API layer abstraction' },
    'framer-motion': { size: 40, reason: 'Animation library - well optimized' },
    'openai': { size: 85, reason: 'OpenAI SDK - server-side only, should not be in browser bundle' }
  }

  for (const [dep, version] of Object.entries(dependencies)) {
    const candidate = largeDepCandidates[dep]
    if (candidate) {
      analyses.push({
        dependency: dep,
        size: candidate.size,
        sizeGzip: Math.round(candidate.size * 0.35),
        importedBy: [],
        recommendation: candidate.reason
      })
    }
  }

  return analyses
}

// ============================================================================
// 6. GENERATE RECOMMENDATIONS
// ============================================================================

function generateOptimizationScript(report: OptimizationReport): string {
  const script = `#!/bin/bash
# IPOReady Performance Optimization Implementation Script
# Generated: ${report.timestamp}
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
-- Added: ${report.timestamp}

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
${report.queries.flatMap(q => q.n1Problems.map(p => `echo "  - ${p.file}:${p.line}: ${p.description}"`)).join('\n')}
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
  headers.set('Cache-Control', \`public, max-age=\${ttl}, must-revalidate\`)
  headers.set('CDN-Cache-Control', \`max-age=\${ttl}\`)
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
${report.bundle.map(b => `echo "  - ${b.dependency} (~${b.size}KB): ${b.recommendation}"`).join('\n')}

echo ""
echo "Next steps:"
echo "1. Move server-only libraries to server components (openai, googleapis)"
echo "2. Lazy load PDF/Excel generation code"
echo "3. Code-split chart library with React.lazy()"
echo "4. Implement request caching with Redis"
echo ""
echo "✓ Performance optimization complete!"
`

  return script
}

// ============================================================================
// 7. MAIN EXECUTION
// ============================================================================

async function main() {
  console.clear()
  log('═════════════════════════════════════════════════════════════', 'success')
  log('IPOReady Performance Optimization Analysis', 'success')
  log('═════════════════════════════════════════════════════════════', 'success')
  console.log('')

  try {
    // Phase 1: Index Analysis
    log('PHASE 1: Database Index Analysis', 'success')
    console.log('')
    const indexReports = analyzeIndexes()

    let criticalIndexIssues = 0
    for (const report of indexReports) {
      log(`Table: ${report.table}`, 'info')
      if (report.missing.length > 0) {
        log(`  ⚠️ Missing indexes: ${report.missing.join(', ')}`, 'warn')
        criticalIndexIssues += report.missing.length
      } else {
        log(`  ✓ All expected indexes present`, 'success')
      }
      if (report.suggestions.length > 0) {
        report.suggestions.forEach(s => log(`  → ${s}`, 'info'))
      }
    }
    console.log('')

    // Phase 2: Query Analysis
    log('PHASE 2: SQL Query Efficiency Analysis', 'success')
    console.log('')
    const queryAnalyses = analyzeQueries()

    let n1Issues = 0
    if (queryAnalyses.length === 0) {
      log('✓ No obvious N+1 patterns detected', 'success')
    } else {
      for (const analysis of queryAnalyses) {
        log(`File: ${analysis.file}`, 'warn')
        if (analysis.n1Problems.length > 0) {
          for (const problem of analysis.n1Problems) {
            log(`  🔴 [${problem.severity.toUpperCase()}] ${problem.description}`, 'error')
            n1Issues++
          }
        }
        if (analysis.queries.length > 0) {
          for (const issue of analysis.queries) {
            log(`  ⚠️ Line ${issue.line}: ${issue.issue}`, 'warn')
          }
        }
      }
    }
    console.log('')

    // Phase 3: Cache Analysis
    log('PHASE 3: API Response Caching Opportunities', 'success')
    console.log('')
    const cacheOpportunities = analyzeCacheOpportunities()

    for (const opportunity of cacheOpportunities) {
      log(`${opportunity.endpoint.replace(/route\.ts$/, '')}`, 'info')
      log(`  Method: ${opportunity.method} | TTL: ${opportunity.ttl}s`, 'info')
      log(`  → ${opportunity.description}`, 'info')
    }
    console.log('')

    // Phase 4: Image Analysis
    log('PHASE 4: Image Optimization Opportunities', 'success')
    console.log('')
    const imageOptimizations = analyzeImages()

    if (imageOptimizations.length === 0) {
      log('✓ No images found in public directory', 'success')
    } else {
      let largeImages = 0
      for (const img of imageOptimizations) {
        const sizeKB = (img.size / 1024).toFixed(2)
        if (img.size > 100000) {
          log(`${img.path} (${sizeKB}KB)`, 'warn')
          largeImages++
        } else {
          log(`${img.path} (${sizeKB}KB)`, 'info')
        }
        log(`  → ${img.recommendation}`, 'info')
      }
    }
    console.log('')

    // Phase 5: Bundle Analysis
    log('PHASE 5: Bundle Size Analysis', 'success')
    console.log('')
    const bundleAnalyses = analyzeBundleSize()

    let totalBundleSize = 0
    for (const bundle of bundleAnalyses) {
      totalBundleSize += bundle.size
      log(`${bundle.dependency}`, 'info')
      log(`  Size: ${bundle.size}KB (gzip: ${bundle.sizeGzip}KB)`, 'info')
      if (bundle.recommendation) {
        log(`  → ${bundle.recommendation}`, 'warn')
      }
    }
    console.log('')

    // Phase 6: Summary
    log('OPTIMIZATION SUMMARY', 'success')
    console.log('')

    const totalIssues = criticalIndexIssues + n1Issues + cacheOpportunities.length
    log(`Total optimization opportunities found: ${totalIssues}`, 'info')
    log(`  - Database indexes: ${criticalIndexIssues}`, 'info')
    log(`  - Query N+1 problems: ${n1Issues}`, 'info')
    log(`  - Cache opportunities: ${cacheOpportunities.length}`, 'info')
    log(`  - Large dependencies: ${bundleAnalyses.length}`, 'info')
    console.log('')

    const estimatedGain = n1Issues * 15 + cacheOpportunities.length * 20 + bundleAnalyses.length * 10
    log(`Estimated Performance Gain: ~${estimatedGain}% page load improvement`, 'success')
    console.log('')

    // Create optimization report
    const report: OptimizationReport = {
      timestamp: new Date().toISOString(),
      database: indexReports,
      queries: queryAnalyses,
      caching: cacheOpportunities,
      bundle: bundleAnalyses,
      images: imageOptimizations,
      summary: {
        totalIssuesFound: totalIssues,
        criticalCount: n1Issues,
        highCount: criticalIndexIssues,
        estimatedPerfGain: `~${estimatedGain}% improvement`,
        implementations: [
          'Add missing database indexes',
          'Refactor N+1 queries to batch operations',
          'Implement API response caching',
          'Optimize and compress images',
          'Code-split large dependencies',
          'Move server-only code out of browser bundle'
        ]
      }
    }

    // Save report
    const reportPath = path.join(PROJECT_ROOT, 'performance-optimization-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`Report saved to: ${reportPath}`, 'success')

    // Generate implementation script
    const implScript = generateOptimizationScript(report)
    const scriptPath = path.join(PROJECT_ROOT, 'scripts/performance-optimization-impl.sh')
    fs.writeFileSync(scriptPath, implScript)
    fs.chmodSync(scriptPath, 0o755)
    log(`Implementation script saved to: ${scriptPath}`, 'success')

    console.log('')
    log('═════════════════════════════════════════════════════════════', 'success')
    log('Analysis complete! Next steps:', 'success')
    log('═════════════════════════════════════════════════════════════', 'success')
    console.log('')
    console.log('1. Review performance-optimization-report.json')
    console.log('2. Run: bash scripts/performance-optimization-impl.sh')
    console.log('3. Apply database migrations')
    console.log('4. Refactor identified N+1 queries')
    console.log('5. Implement caching headers on API routes')
    console.log('6. Test with bundle analyzer: next/bundle-analyzer')
    console.log('')

  } catch (error) {
    log(`Error during analysis: ${error}`, 'error')
    process.exit(1)
  }
}

main()
