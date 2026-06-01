#!/bin/bash

echo "=== IPOReady PACE Accuracy Deepening - Part 1 Implementation Verification ==="
echo ""

# Database migrations
echo "Database Migrations:"
ls -1 migrations/002_*.sql 2>/dev/null && echo "  ✅ 002_add_phase2_schema.sql" || echo "  ❌ 002_add_phase2_schema.sql"
ls -1 migrations/011_*.sql 2>/dev/null && echo "  ✅ 011_add_pace_sequencing_alerts.sql" || echo "  ❌ 011_add_pace_sequencing_alerts.sql"

# Library files (core logic)
echo ""
echo "Core Logic Libraries (src/lib/):"
for file in pace-predictor.ts ipo-sequencing.ts document-scorer.ts pace-alerts-service.ts seed-ipo-benchmarks.ts company-stats.ts; do
  if [ -f "src/lib/$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file"
  fi
done

# API endpoints
echo ""
echo "API Endpoints (src/app/api/pace/):"
for file in scores/route.ts validate-sequencing/route.ts admin/company-factors/route.ts; do
  if [ -f "src/app/api/pace/$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file"
  fi
done

# UI components
echo ""
echo "UI Components (src/components/):"
for file in PaceConfidenceBadge.tsx PaceDocumentReadinessCard.tsx PaceReadinessFactorsCard.tsx ReadinessFactorsCard.tsx SequencingAlertsCard.tsx; do
  if [ -f "src/components/$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file"
  fi
done

# Main pages
echo ""
echo "Pages:"
if [ -f "src/app/pace/page.tsx" ]; then
  echo "  ✅ pace/page.tsx"
else
  echo "  ❌ pace/page.tsx"
fi

# TypeScript compilation check
echo ""
echo "TypeScript Compilation:"
npx tsc --noEmit 2>&1 | head -20

echo ""
echo "=== Verification Complete ==="
